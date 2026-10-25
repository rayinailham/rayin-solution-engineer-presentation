import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDES } from '../src/data/slides.js';

for (const term of ['user pool', 'signature', 'expiry', 'scopes', 'order owner', 'request body']) {
  assert.ok(JSON.stringify(SLIDES[10]).includes(term), `Missing access concept: ${term}`);
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
  const page = await browser.newPage({ viewport: {width:1920,height:1080}, reducedMotion:'reduce' });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(process.env.URL || 'http://localhost:5175',{waitUntil:'networkidle'});
  const renderer=await page.evaluate(()=>{
    const gl=document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer,/NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  for(const viewport of [{width:1366,height:768},{width:1920,height:1080},{width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    await page.evaluate(()=>window.presentation.jumpToSlide(10));
    const result=await page.evaluate(()=>{
      const svg=document.querySelector('.aws-stage-svg'), bounds=svg.getBoundingClientRect();
      const texts=[...svg.querySelectorAll('text')];
      const outside=texts.filter(t=>{const r=t.getBoundingClientRect();return r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1;}).map(t=>t.textContent);
      const overlaps=[],crossings=new Set();
      for(let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++) {
        const a=texts[i].getBoundingClientRect(),b=texts[j].getBoundingClientRect();
        if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([texts[i].textContent,texts[j].textContent]);
      }
      for(const path of svg.querySelectorAll('.graph-link path')) for(let d=0;d<path.getTotalLength();d+=2) {
        const p=path.getPointAtLength(d).matrixTransform(path.getScreenCTM());
        for(const text of texts) {
          const r=text.getBoundingClientRect();
          if(p.x>r.left+1&&p.x<r.right-1&&p.y>r.top+1&&p.y<r.bottom-1) crossings.add(text.textContent);
        }
      }
      const column=document.querySelector('.col-editorial');
      return {outside,overlaps,crossings:[...crossings],overflow:column.scrollHeight-column.clientHeight,
        pageOverflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,
        icons:[...svg.querySelectorAll('image')].every(i=>i.getAttribute('width')===i.getAttribute('height')),
        labels:[...svg.querySelectorAll('text')].every(t=>getComputedStyle(t).fontFamily.startsWith('Arial'))};
    });
    assert.deepEqual(result.outside,[]); assert.deepEqual(result.overlaps,[]); assert.deepEqual(result.crossings,[]);
    assert.ok(result.overflow<=1,JSON.stringify(result)); assert.equal(result.pageOverflow,false);
    assert.equal(await page.locator('[data-inspector="cognito"]').count(),1);
    assert.equal(await page.locator('.graph-node').count(),4);
    assert.equal(result.icons,true); assert.equal(result.labels,true);
    assert.deepEqual(await page.locator('.graph-link path').evaluateAll(paths=>paths.map(p=>getComputedStyle(p).stroke)),Array(4).fill('rgb(36, 47, 62)'));
    assert.equal(await page.locator('.graph-node image').evaluateAll(images=>images.every(i=>i.getAttribute('width')==='64'&&!i.hasAttribute('transform'))),true);
    assert.equal(await page.locator('.access-record-check').count(),1);
    await page.screenshot({path:`/tmp/aws-slide11-${viewport.width}.png`});
    console.log(`${viewport.width}: content, bounds, labels, square icons, no overlapping text or connector crossings`);
  }
  await page.setViewportSize({width:1920,height:1080});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.evaluate(()=>window.presentation.jumpToSlide(9));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{
    window.oldCloud=document.querySelector('.aws-cloud-boundary');
    window.oldWorkflow=document.querySelector('[data-node="stepfunctions"]');
    window.oldPhone=document.querySelector('[data-node="mobile"]');
    window.oldHeader=document.querySelector('.editorial-top-section');
    window.oldNodes=[...document.querySelectorAll('.graph-node')];
    window.accessFrames=[];
    const sample=()=>{
      const cloud=window.oldCloud, workflow=window.oldWorkflow;
      const line=document.querySelector('.story-column-divider');
      window.accessFrames.push({
        x:line?.getBoundingClientRect().x??document.querySelector('.col-editorial').getBoundingClientRect().right-.5,
        workflowX:workflow.getBoundingClientRect().x,
        phoneX:window.oldPhone.getBoundingClientRect().x,
        phoneY:window.oldPhone.getBoundingClientRect().y,
        width:+cloud.querySelector('rect').getAttribute('width'),
        height:+cloud.querySelector('rect').getAttribute('height'),
        outgoing:window.oldNodes.find(n=>n.dataset.node==='sns').isConnected ? +getComputedStyle(window.oldNodes.find(n=>n.dataset.node==='sns').closest('.diagram-container')).opacity : 0,
        incoming:[...document.querySelectorAll('[data-node="cognito"], [data-node="apigateway"]')].map(n=>+getComputedStyle(n).opacity),
        headerVisible:[...document.querySelectorAll('.editorial-top-section, .act-badge, .service-pill')].every(n=>getComputedStyle(n).opacity==='1'),
      });
      if(window.presentation.isAnimating) requestAnimationFrame(sample);
    };
    window.presentation.goToSlide(10); requestAnimationFrame(sample);
  });
  await page.waitForFunction(()=>!window.presentation.isAnimating);
  const frames=await page.evaluate(()=>window.accessFrames);
  for(const property of ['x','workflowX','phoneX','phoneY','width','height']) {
    const start=frames[0][property],end=frames.at(-1)[property];
    assert.notEqual(start,end,`${property} changes`);
    assert.ok(frames.some(f=>f[property]>Math.min(start,end)+.1&&f[property]<Math.max(start,end)-.1),`${property} interpolates`);
  }
  assert.ok(frames.every(f=>f.headerVisible),'Header and pill frames stay visible');
  assert.ok(frames.some(f=>f.outgoing>0&&f.outgoing<1),'Removed services fade');
  assert.ok(frames.some(f=>f.incoming.some(o=>o>0&&o<1)),'Added services fade');
  assert.equal(await page.evaluate(()=>document.querySelector('.aws-cloud-boundary')===window.oldCloud),true);
  assert.equal(await page.evaluate(()=>document.querySelector('[data-node="stepfunctions"]')===window.oldWorkflow),true);
  assert.equal(await page.evaluate(()=>document.querySelector('[data-node="mobile"]')===window.oldPhone),true);
  assert.equal(await page.locator('[data-node="mobile"] .graph-node-label').textContent(),'Buyer app');
  assert.equal(await page.locator('[data-node="mobile"] .graph-node-caption').count(),0);
  assert.equal(await page.evaluate(()=>document.querySelector('.editorial-top-section')===window.oldHeader),true);
  const geometry=()=>[...document.querySelectorAll('.aws-stage-svg image, .aws-stage-svg text, .aws-stage-svg .graph-link path')].map(n=>{
    const r=n.getBoundingClientRect();return [n.textContent,r.x,r.y,r.width,r.height];
  });
  const final=await page.evaluate(geometry);
  await page.evaluate(()=>window.presentation.jumpToSlide(10));
  assert.deepEqual(await page.evaluate(geometry),final,'Animated state matches direct navigation');
  for(const key of ['mobile','cognito','apigateway','stepfunctions']) {
    await page.locator(`[data-inspector="${key}"]`).click();
    assert.equal(await page.locator('#drawerCategory').textContent(),'Slide 11 • How it works');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
  }
  await page.evaluate(()=>window.presentation.jumpToSlide(9));
  await page.evaluate(()=>window.presentation.goToSlide(10));
  await page.waitForTimeout(500);
  await page.selectOption('#slideJump','11');
  assert.equal(await page.evaluate(()=>window.presentation.currentIndex),11);
  assert.equal(await page.locator('.story-cloud-carry, .is-moving-divider, .header-motion').count(),0);
  assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.presentation.jumpToSlide(9));
  await page.evaluate(()=>window.presentation.goToSlide(10));
  assert.equal(await page.locator('.story-cloud-carry').count(),0);
  assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
  assert.deepEqual(errors,[]);
  console.log(`10 → 11: cloud/workflow/divider interpolate; header, fades, inspectors, interrupted navigation and reduced motion pass (${frames.length} frames)`);
} finally { await browser.close(); }
