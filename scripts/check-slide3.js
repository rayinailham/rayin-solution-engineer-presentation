import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDE_3_INSPECTORS } from '../src/data/inspectors.js';

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || join(
    process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), '.cache/ms-playwright'),
    'chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  ),
  args: ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  env: { ...process.env, __NV_PRIME_RENDER_OFFLOAD: '1', __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
    __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' },
});

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  await page.evaluate(() => window.presentation.goToSlide(2, false));
  assert.equal(await page.locator('.slide-headline').innerText(), 'Why Consider Serverless?');
  assert.equal(await page.locator('.point-description').count(), 3);
  assert.equal(await page.locator('.comparison-divider').count(),1);
  assert.equal(await page.locator('.col-stage [data-node="stepfunctions"]').count(),1);
  assert.equal(await page.locator('.col-stage [data-node="eventbridge"]').count(),0);
  assert.match(await page.locator('.slide-narrative').innerText(), /starts from scratch/);
  for (const viewport of [{width:2560,height:1440}, {width:1920,height:1080}, {width:1366,height:768}]) {
    await page.setViewportSize(viewport);
    const result = await page.evaluate(() => {
      const editorial = document.querySelector('.col-editorial');
      const svg = document.querySelector('.service-graph svg');
      const texts = [...svg.querySelectorAll('text')];
      const bounds = svg.getBoundingClientRect();
      const outside = texts.filter(t => { const r=t.getBoundingClientRect(); return r.left<bounds.left || r.right>bounds.right || r.top<bounds.top || r.bottom>bounds.bottom; }).map(t=>t.textContent);
      const overlaps = [];
      for (let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++) {
        const a=texts[i].getBoundingClientRect(), b=texts[j].getBoundingClientRect();
        if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([texts[i].textContent,texts[j].textContent]);
      }
      return {overflow: editorial.scrollHeight-editorial.clientHeight, outside, overlaps,
        fonts:texts.map(t=>getComputedStyle(t).fontFamily),
        sizes:texts.map(t=>getComputedStyle(t).fontSize),
        officialCloud:!!svg.querySelector('.official-cloud'),
        icons:[...svg.querySelectorAll('.graph-node image')].map(i=>[i.getAttribute('width'),i.getAttribute('height')])};
    });
    assert.ok(result.overflow<=1, JSON.stringify(result));
    assert.deepEqual(result.outside, []);
    assert.deepEqual(result.overlaps, []);
    assert.ok(result.fonts.every(f=>f.includes('Arial')));
    assert.ok(result.sizes.every(s=>s==='16px'));
    assert.equal(result.officialCloud,true);
    assert.ok(result.icons.every(([w,h])=>w===h));
    await page.screenshot({path:`/tmp/aws-slide3-${viewport.width}.png`});
    console.log(`${viewport.width}: no overflow or overlapping labels; Arial 12pt, official cloud, proportional icons`);
  }
  for (const [key, overview] of Object.entries(SLIDE_3_INSPECTORS)) {
    const node=page.locator(`.col-stage [data-inspector="${key}"]`).first();
    await node.focus();
    await page.keyboard.press('Enter');
    await page.locator('#drawerContextDetails').waitFor({state:'visible'});
    assert.equal(await page.locator('#drawerTitle').innerText(),overview.service);
    assert.equal(await page.locator('#drawerRole').innerText(),overview.role);
    assert.deepEqual(await page.locator('#drawerContextDetails p').allTextContents(),overview.sections.map(s=>s[1]));
    assert.equal(await page.locator('#drawerSlaGroup').isVisible(),false);
    assert.equal(await page.locator('#drawerCodePreview').isVisible(),false);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.drawer-body').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#drawerCloseBtn').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),2);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(220);
    assert.equal(await node.evaluate(el=>el===document.activeElement),true);
  }
  await page.locator('.col-stage').hover();
  await page.mouse.wheel(0,700);
  assert.equal(await page.evaluate(()=>window.presentation.currentIndex),2);
  // Both editorial columns use the same spacing contract.
  const spacing = () => {
    const selectors = ['.slide-editorial-layout', '.col-editorial', '.editorial-top-section', '.editorial-body-section', '.bullet-points-container', '.slide-narrative'];
    return selectors.map(selector => { const s=getComputedStyle(document.querySelector(selector)); return [s.padding,s.gap,s.fontSize,s.lineHeight]; });
  };
  const comparisonSpacing = await page.evaluate(spacing);
  await page.evaluate(() => window.presentation.goToSlide(1,false));
  assert.deepEqual(await page.evaluate(spacing), comparisonSpacing);
  await page.setViewportSize({width:1920,height:1080});
  await page.emulateMedia({reducedMotion:'no-preference'});
  const story = await page.evaluate(async () => {
    const source=document.querySelector('[data-node="apigateway"] image').getBoundingClientRect();
    const logo=document.getElementById('sharedAwsLogo').getBoundingClientRect();
    const cloud=document.querySelector('.aws-cloud-boundary');
    const header=document.querySelector('.editorial-header');
    const team=document.querySelector('.pills-row').lastElementChild;
    window.presentation.goToSlide(2,true);
    const carry=document.querySelector('.story-service-carry');
    const start=carry.getBoundingClientRect();
    const started=performance.now();
    const samples=[];
    await new Promise(resolve => {
      const tick=()=>{
        const api=carry.getBoundingClientRect();
        const cloudOpacity=Number(getComputedStyle(cloud).opacity);
        const overlay=document.querySelector('.story-cloud-carry');
        const header=document.getElementById('sharedAwsLogo').getBoundingClientRect();
        const nodes=[...document.querySelectorAll('.graph-node')];
        const divider=document.querySelector('.comparison-divider');
        samples.push({cloudOpacity,cloudPresent:!!cloud.isConnected,cloudWidth:Number(cloud.querySelector('rect').getAttribute('width')),t:performance.now()-started,x:api.x,y:api.y,
          dividerOpacity:divider ? Number(getComputedStyle(divider).opacity):null,
          dividerOffset:divider ? Number(divider.getAttribute('stroke-dashoffset')):null,
          logoError:Math.abs(header.x-logo.x)+Math.abs(header.y-logo.y),
          top:nodes[1] ? Number(getComputedStyle(nodes[1]).opacity):0,
          bottom:nodes[6] ? Number(getComputedStyle(nodes[6]).opacity):0,
          blocked:window.presentation.stageEl.inert});
        if(window.presentation.isAnimating) requestAnimationFrame(tick); else resolve();
      };requestAnimationFrame(tick);
    });
    return {cloudRetained:cloud===document.querySelector('.aws-cloud-boundary'),
      cloudAlwaysVisible:samples.every(s=>s.cloudOpacity===1 && s.cloudPresent),
      cloudResized:samples.some(s=>s.cloudWidth>720 && s.cloudWidth<750),
      cloudOverlayRemoved:!document.querySelector('.story-cloud-carry'),
      headerRetained:header===document.querySelector('.editorial-header'),
      teamRetained:team===document.querySelector('.pills-row').lastElementChild && team.textContent==='Small Team',
      titleWords:document.querySelectorAll('.story-title-word').length,
      startError:Math.abs(start.x-source.x)+Math.abs(start.y-source.y),
      moved:samples.some(s=>Math.abs(s.x-start.x)+Math.abs(s.y-start.y)>20),
      logoError:Math.max(...samples.map(s=>s.logoError)),
      topFirst:samples.some(s=>s.t>400 && s.top>.5 && s.bottom===0),
      dividerReveal:samples.some(s=>s.dividerOpacity===0 && s.dividerOffset===690)
        && samples.some(s=>s.dividerOpacity>0 && s.dividerOpacity<1 && s.dividerOffset>0 && s.dividerOffset<690)
        && samples.at(-1).dividerOpacity===1 && samples.at(-1).dividerOffset===0,
      duration:performance.now()-started,
      carryRemoved:!carry.isConnected,
      restored:!window.presentation.stageEl.inert,
      destinationVisible:getComputedStyle(document.querySelector('[data-node="apigateway"] image')).visibility};
  });
  assert.ok(story.startError<1,JSON.stringify(story));
  assert.equal(story.moved,true);
  assert.equal(story.cloudRetained,true);
  assert.equal(story.cloudAlwaysVisible,true);
  assert.equal(story.cloudResized,true);
  assert.equal(story.cloudOverlayRemoved,true);
  assert.equal(story.headerRetained,true);
  assert.equal(story.teamRetained,true);
  assert.equal(story.titleWords,3);
  assert.ok(story.logoError<1,JSON.stringify(story));
  assert.equal(story.topFirst,true);
  assert.equal(story.dividerReveal,true);
  assert.ok(story.duration>=1700 && story.duration<3500,JSON.stringify(story));
  assert.equal(story.carryRemoved,true);
  assert.equal(story.restored,true);
  assert.equal(story.destinationVisible,'visible');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.presentation.goToSlide(1,false));
  await page.evaluate(()=>window.presentation.goToSlide(2,true));
  assert.equal(await page.locator('.story-service-carry').count(),0);
  assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
  console.log('Matched spacing, API carry, anchored logo, ordered reveal, cleanup, reduced motion: OK',story);
  assert.deepEqual(errors,[]);
  console.log('Seven contextual modals, keyboard focus, wheel isolation, assets: OK');
} finally {
  await browser.close();
}
