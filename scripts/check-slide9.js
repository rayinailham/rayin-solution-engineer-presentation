import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDES } from '../src/data/slides.js';

for (const term of ['polls SQS', 'visibility timeout', 'redrive policy', 'duplicate', 'FIFO', 'capacity']) {
  assert.ok(JSON.stringify(SLIDES[8]).includes(term), `Missing queue concept: ${term}`);
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
    await page.evaluate(()=>window.presentation.goToSlide(8,false));
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
    assert.equal(await page.locator('[data-inspector="delivery-dlq"]').count(),1);
    assert.equal(await page.locator('.queue-lifecycle-surface > rect').count(),2);
    assert.equal(result.icons,true); assert.equal(result.labels,true);
    assert.deepEqual(await page.locator('.graph-link path').evaluateAll(paths=>paths.map(p=>getComputedStyle(p).stroke)),Array(3).fill('rgb(36, 47, 62)'));
    assert.equal(await page.locator('.graph-node image').evaluateAll(images=>images.every(i=>i.getAttribute('width')==='64'&&!i.hasAttribute('transform'))),true);
    await page.screenshot({path:`/tmp/aws-slide9-${viewport.width}.png`});
    console.log(`${viewport.width}: content, bounds, labels, square icons, no overlapping text or connector crossings`);
  }
  for(const mode of ['normal','resize-before','resize-during','motion-before','motion-during','cleanup']) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1920,height:1080});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>window.presentation.goToSlide(7,false));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      window.originalCloud=document.querySelector('.aws-cloud-boundary');
      window.originalHeader=document.querySelector('.editorial-top-section');
      window.originalLambda=document.querySelector('[data-node="lambda"]');
      window.originalLogo=document.querySelector('#sharedAwsLogo');
      window.apiFrames=[];
      const sample=()=>{
        const cloud=window.originalCloud, line=document.querySelector('.story-column-divider');
        window.apiFrames.push({headingOpacity:[...document.querySelectorAll('.aws-stage-svg .graph-group-label')].map(el=>+getComputedStyle(el).opacity),x:line?.getBoundingClientRect().x??document.querySelector('.col-editorial').getBoundingClientRect().right-.5,
          scale:cloud.getScreenCTM().a,
          lambda:window.originalLambda.getScreenCTM().e,
          width:cloud.querySelector('rect').getAttribute('width'),height:cloud.querySelector('rect').getAttribute('height'),
          cloudCount:[...document.querySelectorAll('.aws-cloud-boundary')].filter(n=>getComputedStyle(n).visibility!=='hidden').length,
          lineCount:document.querySelectorAll('.story-column-divider').length,
          hiddenBorder:getComputedStyle(document.querySelector('.col-editorial')).borderRightColor==='rgba(0, 0, 0, 0)'});
        if(window.presentation.isAnimating) requestAnimationFrame(sample);
      };
      window.presentation.goToSlide(8); requestAnimationFrame(sample);
    });
    if(mode.endsWith('during')||mode==='normal'||mode==='cleanup') await page.waitForTimeout(650);
    if(mode.startsWith('resize')) await page.setViewportSize({width:1366,height:768});
    if(mode.startsWith('motion')) await page.emulateMedia({reducedMotion:'reduce'});
    if(mode==='cleanup') await page.evaluate(()=>window.presentation.slideCleanup());
    if(mode==='normal') await page.screenshot({path:'/tmp/aws-slide9-transition.png'});
    await page.waitForFunction(()=>!window.presentation.isAnimating);
    assert.equal(await page.evaluate(()=>window.originalCloud===document.querySelector('.aws-cloud-boundary')),true);
    assert.equal(await page.evaluate(()=>window.originalLambda===document.querySelector('[data-node="lambda"]')),true);
    assert.equal(await page.evaluate(()=>window.originalLogo===document.querySelector('#sharedAwsLogo')),true);
    assert.equal(await page.locator('.story-cloud-carry, .header-motion, .is-moving-divider').count(),0);
    assert.equal(await page.locator('.graph-node').count(),4);
    assert.equal(await page.evaluate(()=>window.originalHeader===document.querySelector('.editorial-top-section')),true);
    assert.deepEqual(await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('transform'))),['translate(180, 210)','translate(480, 210)','translate(780, 210)','translate(735, 535)']);
    assert.equal(await page.locator('.section-step').innerText(),'09');
    assert.equal(await page.locator('.story-act-label').innerText(),'HOLDING WORK');
    assert.equal(await page.locator('[data-node="lambda"] .graph-node-caption').textContent(),'Plan delivery');
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    const frames=await page.evaluate(()=>window.apiFrames);
    assert.ok(frames.every(f=>f.cloudCount===1));
    assert.ok(frames.filter(f=>f.lineCount).every(f=>f.lineCount===1&&f.hiddenBorder));
    if(mode==='normal') {
      assert.ok(frames.some(f=>f.headingOpacity.some(value=>value>0&&value<1)), 'Panel headings must fade through intermediate opacity');
      const start=frames[0].x,end=frames.at(-1).x;
      assert.ok(end>start,'Divider moves right from 42% to 45%');
      assert.ok(frames.some(f=>f.x>start+2&&f.x<end-2),'Divider passes through intermediate positions');
      assert.ok(frames.some(f=>f.scale<frames[0].scale&&f.scale>frames.at(-1).scale),'Cloud scale interpolates with column ratio');
      assert.ok(frames.some(f=>f.lambda>frames[0].lambda+5&&f.lambda<frames.at(-1).lambda-5),'Lambda moves through intermediate positions');
      for(let i=1;i<frames.length;i++) {
        assert.ok(frames[i].x>=frames[i-1].x-.5,'Divider does not reverse');
        assert.ok(Math.abs(frames[i].x-frames[i-1].x)<Math.abs(end-start)*.4,'Divider does not snap');
      }
    }
    if(mode==='normal') {
      await page.screenshot({path:'/tmp/aws-slide9-transition-final.png'});
      const rendered=await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>{
        const r=n.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
      }));
      await page.evaluate(()=>window.presentation.jumpToSlide(8));
      const direct=await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>{
        const r=n.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
      }));
      assert.deepEqual(rendered,direct,'Animated and direct navigation must produce identical icon positions');
    }
    for(const key of ['eventbridge','delivery-queue','plan-delivery','delivery-dlq']) {
      await page.locator(`[data-inspector="${key}"]`).click();
      assert.equal(await page.locator('#drawerCategory').textContent(),'Slide 9 • How it works');
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    }
    console.log(`8 → 9 ${mode}: same cloud/logo, smooth divider/cloud geometry, modals and cleanup (${frames.length} frames)`);
  }
  for (const delay of [0, 650]) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>window.presentation.goToSlide(7,false));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>window.presentation.goToSlide(8));
    if (delay) await page.waitForTimeout(delay);
    await page.selectOption('#slideJump','10');
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),10);
    assert.equal(await page.locator('.story-cloud-carry, .is-moving-divider, .header-motion').count(),0);
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    assert.equal(await page.locator('#slideCounter').innerText(),'11 / 17');
  }
  console.log('8 → 9: picker interrupts early/late without stale callbacks');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
