import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDE_5_INSPECTORS } from '../src/data/inspectors.js';

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
  page.on('response', r => { if (r.status() >= 400) errors.push(r.url()); });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  await page.evaluate(() => window.presentation.goToSlide(4, false));
  assert.equal(await page.locator('.graph-node').count(), 4);
  assert.equal(await page.locator('.graph-link.event').count(), 6);
  assert.equal(await page.locator('.official-cloud').count(), 1);
  for (const viewport of [{width:1366,height:768}, {width:1920,height:1080}, {width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    const result = await page.evaluate(() => {
      const column = document.querySelector('.col-editorial');
      const svg = document.querySelector('.service-graph svg');
      const texts = [...svg.querySelectorAll('text')];
      const bounds = svg.getBoundingClientRect();
      const outside = texts.filter(t => { const r=t.getBoundingClientRect(); return r.left<bounds.left || r.right>bounds.right || r.top<bounds.top || r.bottom>bounds.bottom; }).map(t=>t.textContent);
      const overlaps = [];
      for (let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++) {
        const a=texts[i].getBoundingClientRect(), b=texts[j].getBoundingClientRect();
        if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([texts[i].textContent,texts[j].textContent]);
      }
      // Check connector centerlines against text bounds, including vertical lines.
      const crossings = [];
      for (const path of svg.querySelectorAll('.graph-link path')) {
        const matrix=path.getScreenCTM();
        for(let d=0;d<path.getTotalLength();d+=2) {
          const p=path.getPointAtLength(d).matrixTransform(matrix);
          for(const text of texts) {
            const r=text.getBoundingClientRect();
            if(p.x>r.left+1 && p.x<r.right-1 && p.y>r.top+1 && p.y<r.bottom-1) crossings.push(text.textContent);
          }
        }
      }
      return {overflow:column.scrollHeight-column.clientHeight, outside, overlaps, crossings:[...new Set(crossings)],
        pageOverflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
        icons:[...svg.querySelectorAll('.graph-node image')].every(i=>i.getAttribute('width')===i.getAttribute('height'))};
    });
    assert.ok(result.overflow<=1, JSON.stringify(result));
    assert.deepEqual(result.outside, []);
    assert.deepEqual(result.overlaps, []);
    assert.deepEqual(result.crossings, []);
    assert.equal(result.pageOverflow,false);
    assert.equal(result.icons,true);
    await page.screenshot({path:`/tmp/aws-slide5-${viewport.width}.png`});
    await page.locator('[data-node="eventbridge"]').click();
    const drawer = await page.locator('#inspectorDrawer').boundingBox();
    assert.ok(drawer.x >= 0 && drawer.y >= 0 && drawer.x + drawer.width <= viewport.width + 1 && drawer.y + drawer.height <= viewport.height + 1);
    await page.screenshot({path:`/tmp/aws-slide5-modal-${viewport.width}.png`});
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.drawer-body').evaluate(el=>el===document.activeElement),true);
    if (viewport.width === 1366) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(250);
      assert.ok(await page.locator('.drawer-body').evaluate(el=>el.scrollTop>0), 'Keyboard must scroll long modal text');
    }
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    console.log(`${viewport.width}: layout, labels, connectors, proportions and modal bounds passed`);
  }
  for (const node of await page.locator('.inspectable-node[role="button"]').all()) {
    const key=await node.getAttribute('data-node');
    const inspectorKey=await node.getAttribute('data-inspector');
    const data=SLIDE_5_INSPECTORS[inspectorKey];
    await node.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#drawerTitle').innerText(),data.service);
    assert.equal(await page.locator('#drawerRole').innerText(),data.role);
    assert.deepEqual(await page.locator('#drawerContextDetails p').allTextContents(),data.sections.map(s=>s[1]));
    assert.equal(await page.locator('#drawerSlaGroup').isVisible(),false);
    assert.equal(await page.locator('#drawerCodePreview').isVisible(),false);
    assert.equal(await page.locator('#inspectorDrawer').getAttribute('aria-modal'),'true');
    for (const key of ['Tab','Shift+Tab']) {
      await page.keyboard.press(key);
      assert.equal(await page.locator(key === 'Tab' ? '.drawer-body' : '#drawerCloseBtn').evaluate(el=>el===document.activeElement),true);
    }
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),4);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    assert.equal(await node.evaluate(el=>el===document.activeElement),true);
  }
  await page.locator('[data-node="eventbridge"]').click();
  await page.locator('#drawerCloseBtn').click();
  await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
  await page.locator('[data-inspector="update-sales-report"]').focus();
  await page.keyboard.press('Space');
  await page.locator('#drawerBackdrop').click({position:{x:20,y:20}});
  await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
  console.log('All 7 service/data/rule nodes: contextual modal, keyboard, focus trap, Escape, close and backdrop passed');
  await page.emulateMedia({ reducedMotion:'no-preference' });
  for (const mode of ['normal','resize','motion-before-render','motion-during-reveal']) {
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>window.presentation.goToSlide(3,false));
    await page.waitForTimeout(450);
    await page.evaluate(()=>{
      window.oldCloud=document.querySelector('.aws-cloud-boundary');
      window.oldLogo=document.querySelector('#sharedAwsLogo');
      window.carryNodes=['stepfunctions','eventbridge','plan-delivery','update-sales-report'].map(key=>document.querySelector(`[data-inspector="${key}"]`));
      window.transitionFrames=[];
      const observe=()=>{
        window.transitionFrames.push({
          overflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
          logos:document.querySelectorAll('#sharedAwsLogo').length,
          clouds:document.querySelectorAll('.aws-cloud-boundary:not([style*="visibility: hidden"])').length,
          nodes:[...document.querySelectorAll('.graph-node')].filter(n=>getComputedStyle(n).visibility!=='hidden' && Number(getComputedStyle(n).opacity)>.01).length,
          columnOverflow:document.querySelector('.col-editorial').scrollHeight-document.querySelector('.col-editorial').clientHeight,
        });
        if(window.presentation.isAnimating) requestAnimationFrame(observe);
      };
      window.presentation.goToSlide(4);
      requestAnimationFrame(observe);
    });
    if(mode==='motion-before-render') await page.emulateMedia({reducedMotion:'reduce'});
    else {
      await page.waitForTimeout(650);
      assert.equal(await page.evaluate(()=>window.carryNodes.every(n=>n.isConnected && n.closest('.story-cloud-carry'))),true);
      if(mode==='resize') await page.setViewportSize({width:1366,height:768});
      if(mode==='motion-during-reveal') await page.emulateMedia({reducedMotion:'reduce'});
    }
    await page.waitForFunction(()=>!window.presentation.isAnimating);
    assert.equal(await page.evaluate(()=>window.oldCloud===document.querySelector('.aws-cloud-boundary')),true);
    assert.equal(await page.evaluate(()=>window.oldLogo===document.querySelector('#sharedAwsLogo')),true);
    assert.equal(await page.evaluate(()=>window.carryNodes.every(n=>n.isConnected && n.closest('.aws-stage-svg'))),true);
    assert.equal(await page.locator('.story-cloud-carry').count(),0);
    assert.equal(await page.locator('.graph-node').count(),4);
    assert.equal(await page.locator('.routing-rule').count(),2);
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    const frames=await page.evaluate(()=>window.transitionFrames);
    assert.ok(frames.every(f=>!f.overflow && f.logos===1 && f.clouds===1 && f.nodes<=9 && f.columnOverflow<=1),JSON.stringify(frames.find(f=>f.overflow||f.clouds!==1||f.nodes>9||f.columnOverflow>1)));
    console.log(`4 → 5 ${mode}: same cloud/logo and 4 service nodes, cleanup, no overflow/duplicates; ${frames.length} frames`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.presentation.goToSlide(3,false));
  await page.evaluate(()=>window.presentation.goToSlide(4));
  assert.equal(await page.locator('.story-cloud-carry').count(),0);
  assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
  await page.evaluate(()=>window.presentation.goToSlide(5,false));
  assert.equal(await page.locator('.story-cloud-carry').count(),0);
  assert.deepEqual(errors,[]);
  console.log('Reduced motion, slide exit and runtime/resource checks passed');
} finally {
  await browser.close();
}
