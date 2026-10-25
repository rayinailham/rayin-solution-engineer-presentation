import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDES, SLIDE_SOURCES, AWS_SERVICES } from '../src/data/slides.js';
import { SLIDE_INSPECTORS } from '../src/data/inspectors.js';

assert.equal(SLIDES.length, 17, 'Adding slides requires a separate discussion');
for (const slide of SLIDES.slice(1)) {
  assert.ok(SLIDE_SOURCES[slide.id]?.length, `Missing source map: ${slide.id}`);
  for (const source of SLIDE_SOURCES[slide.id]) assert.ok(existsSync(source), source);
  assert.ok(slide.points.length >= 3 && slide.points.every(p => p.statement && p.description));
  for (const service of slide.services) assert.ok(existsSync(`.${AWS_SERVICES[service].icon}`));
}
// Each required service has a teaching slide, rather than only a recap icon.
for (const [key, id] of Object.entries({apigateway:7, cloudwatch:15, cognito:11, lambda:6, sns:10, sqs:9, stepfunctions:13, xray:15})) {
  assert.ok(SLIDES.find(slide => slide.id === id).services.includes(key), `${key}: teaching slide missing`);
  assert.ok(Object.values(SLIDE_INSPECTORS[id]).some(data => data.service.includes(AWS_SERVICES[key].name)), `${key}: explanation missing`);
}
const reviewedCopy = JSON.stringify(SLIDES.slice(1));
assert.doesNotMatch(reviewedCopy, /74%|99\.99|zero downtime|zero transaction data|strictly for legacy|single-digit millisecond SLA/i);
assert.match(JSON.stringify(SLIDE_INSPECTORS[9]['plan-delivery']), /SQS/);
assert.match(JSON.stringify(SLIDE_INSPECTORS[12]['plan-delivery']), /direct path from slide 6/);
assert.match(JSON.stringify(SLIDE_INSPECTORS[16]['plan-delivery']), /SQS/);
for (const key of ['check-order', 'reserve-stock', 'charge-payment']) {
  assert.equal(SLIDE_INSPECTORS[13][key].service, SLIDE_INSPECTORS[3][key].service);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || join(
    process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), '.cache/ms-playwright'),
    'chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'),
  args: ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  env: { ...process.env, __NV_PRIME_RENDER_OFFLOAD: '1', __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
    __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' },
});
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  const layoutFailures = [];
  for (const viewport of [{width:1366,height:768}, {width:1920,height:1080}, {width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    for (let id = 2; id <= 17; id++) {
      await page.evaluate(i => window.presentation.goToSlide(i - 1, false), id);
      const result = await page.evaluate(() => {
        const col = document.querySelector('.col-editorial');
        const svg = document.querySelector('.service-graph svg');
        const texts = [...(svg?.querySelectorAll('text') || [])];
        const bounds = svg?.getBoundingClientRect();
        const outside = texts.filter(t => { const r=t.getBoundingClientRect(); return r.left<bounds.left-1 || r.right>bounds.right+1 || r.top<bounds.top-1 || r.bottom>bounds.bottom+1; }).map(t=>t.textContent);
        const overlaps = [];
        for (let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++) {
          const a=texts[i].getBoundingClientRect(), b=texts[j].getBoundingClientRect();
          if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([texts[i].textContent,texts[j].textContent]);
        }
        const crossings = new Set();
        for (const path of svg?.querySelectorAll('.graph-link path') || []) {
          const matrix=path.getScreenCTM();
          for(let d=0;d<path.getTotalLength();d+=3) {
            const p=path.getPointAtLength(d).matrixTransform(matrix);
            for(const text of texts) {
              const r=text.getBoundingClientRect();
              if(p.x>r.left+1 && p.x<r.right-1 && p.y>r.top+1 && p.y<r.bottom-1) crossings.add(text.textContent);
            }
          }
        }
        const closing = document.querySelector('.slide-closing-wrapper');
        const clippedClosing = closing ? [...closing.querySelectorAll('h1,h2,p,.qa-stage-banner')].filter(el=> {
          const r=el.getBoundingClientRect(), c=closing.getBoundingClientRect();
          return r.bottom>c.bottom+1 || r.top<c.top-1 || r.right>c.right+1 || r.left<c.left-1;
        }).map(el=>el.textContent) : [];
        return {overflow:col ? col.scrollHeight-col.clientHeight : 0, outside, overlaps, crossings:[...crossings], clippedClosing,
          pageOverflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
          icons:[...(svg?.querySelectorAll('.graph-node image')||[])].every(i=>i.getAttribute('width')===i.getAttribute('height'))};
      });
      // Earlier slides 2–6 already have dedicated graph contracts; review their editorial layout here.
      if (result.overflow>1 || result.outside.length || result.overlaps.length || (id>=7 && result.crossings.length) || result.clippedClosing.length || result.pageOverflow || !result.icons) layoutFailures.push({id,width:viewport.width,...result});
      if (viewport.width === 1366 || viewport.width === 1920) await page.screenshot({animations:'disabled',path:`/tmp/aws-content-${id}-${viewport.width}.png`});
    }
    console.log(`${viewport.width}×${viewport.height}: reviewed slides 2–17`);
  }
  assert.deepEqual(layoutFailures, [], 'Content layout must fit without shrinking fonts');
  let modalCount=0;
  await page.setViewportSize({width:1366,height:768});
  for (let id=7;id<=16;id++) {
    await page.evaluate(i=>window.presentation.goToSlide(i-1,false),id);
    const nodes=await page.locator('.inspectable-node').all();
    for (const node of nodes) {
      const key=await node.getAttribute('data-inspector');
      const expected=SLIDE_INSPECTORS[id][key];
      assert.ok(expected, `Slide ${id}: contextual inspector missing for ${key}`);
      await node.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#drawerTitle').innerText(),expected.service);
      assert.equal(await page.locator('#drawerRole').innerText(),expected.role);
      assert.equal(await page.locator('#drawerContextDetails').innerText(),expected.sections.flat().join('\n\n'));
      assert.equal(await page.locator('#inspectorDrawer').getAttribute('role'),'dialog');
      assert.equal(await page.locator('#drawerSlaGroup').isVisible(),false);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.drawer-body').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator('#drawerCloseBtn').evaluate(el=>el===document.activeElement),true);
      const before=await page.evaluate(()=>window.presentation.currentIndex);
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.evaluate(()=>window.presentation.currentIndex),before,'Modal must block deck navigation');
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
      assert.equal(await node.evaluate(el=>el===document.activeElement),true,'Return focus to task');
      await page.keyboard.press('Space');
      assert.equal(await page.locator('#drawerTitle').innerText(),expected.service);
      await page.locator('#drawerCloseBtn').click();
      await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
      modalCount++;
    }
  }
  assert.ok(modalCount>=35, 'The test must actually visit the revised elements');
  assert.deepEqual(errors,[],'Runtime and asset errors');
  console.log(`PASS: source map, task continuity, 48 slide layouts, ${modalCount} contextual modals, keyboard and focus; no runtime/asset errors.`);
} finally {
  await browser.close();
}
