import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDES } from '../src/data/slides.js';

assert.match(JSON.stringify(SLIDES[6]), /POST \/orders/);
assert.match(JSON.stringify(SLIDES[6]), /StartExecution/);
assert.match(JSON.stringify(SLIDES[6]), /RECEIVED is not CONFIRMED/);
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
    await page.evaluate(()=>window.presentation.goToSlide(6,false));
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
    assert.equal(await page.locator('.order-state-surface > rect').count(),2);
    assert.equal(result.icons,true); assert.equal(result.labels,true);
    await page.screenshot({path:`/tmp/aws-slide7-${viewport.width}.png`});
    console.log(`${viewport.width}: content, bounds, labels, square icons, no overlapping text or connector crossings`);
  }
  for(const mode of ['normal','resize-before','resize-during','motion-before','motion-during','cleanup']) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1920,height:1080});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>window.presentation.goToSlide(5,false));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      window.originalCloud=document.querySelector('.aws-cloud-boundary');
      window.originalDatabase=document.querySelector('[data-inspector="dynamodb"]');
      window.originalLogo=document.querySelector('#sharedAwsLogo');
      window.apiFrames=[];
      const sample=()=>{
        const cloud=window.originalCloud, line=document.querySelector('.story-column-divider');
        window.apiFrames.push({headingOpacity:[...document.querySelectorAll('.aws-stage-svg .graph-group-label')].map(el=>+getComputedStyle(el).opacity),x:line?.getBoundingClientRect().x??document.querySelector('.col-editorial').getBoundingClientRect().right-.5,
          width:cloud.querySelector('rect').getAttribute('width'),height:cloud.querySelector('rect').getAttribute('height'),
          cloudCount:[...document.querySelectorAll('.aws-cloud-boundary')].filter(n=>getComputedStyle(n).visibility!=='hidden').length,
          lineCount:document.querySelectorAll('.story-column-divider').length,
          hiddenBorder:getComputedStyle(document.querySelector('.col-editorial')).borderRightColor==='rgba(0, 0, 0, 0)'});
        if(window.presentation.isAnimating) requestAnimationFrame(sample);
      };
      window.presentation.goToSlide(6); requestAnimationFrame(sample);
    });
    if(mode.endsWith('during')||mode==='normal'||mode==='cleanup') await page.waitForTimeout(650);
    if(mode.startsWith('resize')) await page.setViewportSize({width:1366,height:768});
    if(mode.startsWith('motion')) await page.emulateMedia({reducedMotion:'reduce'});
    if(mode==='cleanup') await page.evaluate(()=>window.presentation.slideCleanup());
    if(mode==='normal') await page.screenshot({path:'/tmp/aws-slide7-transition.png'});
    await page.waitForFunction(()=>!window.presentation.isAnimating);
    assert.equal(await page.evaluate(()=>window.originalCloud===document.querySelector('.aws-cloud-boundary')),true);
    assert.equal(await page.evaluate(()=>window.originalLogo===document.querySelector('#sharedAwsLogo')),true);
    assert.equal(await page.locator('.story-cloud-carry, .header-motion, .is-moving-divider').count(),0);
    assert.equal(await page.locator('.graph-node').count(),4);
    assert.equal(await page.evaluate(()=>window.originalDatabase===document.querySelector('[data-inspector="dynamodb"]')),true);
    assert.deepEqual(await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('transform'))),['translate(85, 220)','translate(350, 220)','translate(730, 220)','translate(730, 480)']);
    assert.equal(await page.locator('.section-step').innerText(),'07');
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    const frames=await page.evaluate(()=>window.apiFrames);
    assert.ok(frames.every(f=>f.cloudCount===1));
    assert.ok(frames.filter(f=>f.lineCount).every(f=>f.lineCount===1&&f.hiddenBorder));
    if(mode==='normal') {
      assert.ok(frames.some(f=>f.headingOpacity.some(value=>value>0&&value<1)), 'Panel headings must fade through intermediate opacity');
      const start=frames[0].x,end=frames.at(-1).x;
      assert.ok(end>start,'Divider moves right from 40% to 45%');
      assert.ok(frames.some(f=>f.x>start+2&&f.x<end-2),'Divider passes through intermediate positions');
      assert.ok(frames.some(f=>+f.width<880&&+f.width>720),'Cloud width interpolates');
      assert.ok(frames.some(f=>+f.height>585&&+f.height<720),'Cloud height interpolates');
      for(let i=1;i<frames.length;i++) {
        assert.ok(frames[i].x>=frames[i-1].x-.5,'Divider does not reverse');
        assert.ok(Math.abs(frames[i].x-frames[i-1].x)<(end-start)*.4,'Divider does not snap');
      }
    }
    if(mode==='normal') {
      await page.screenshot({path:'/tmp/aws-slide7-transition-final.png'});
      const rendered=await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>{
        const r=n.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
      }));
      await page.evaluate(()=>window.presentation.jumpToSlide(6));
      const direct=await page.locator('.graph-node').evaluateAll(nodes=>nodes.map(n=>{
        const r=n.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
      }));
      assert.deepEqual(rendered,direct,'Animated and direct navigation must produce identical icon positions');
    }
    for(const key of ['apigateway','stepfunctions','dynamodb']) {
      await page.locator(`[data-inspector="${key}"]`).click();
      assert.equal(await page.locator('#drawerCategory').textContent(),'Slide 7 • How it works');
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    }
    console.log(`6 → 7 ${mode}: same cloud/logo, smooth divider/cloud geometry, modals and cleanup (${frames.length} frames)`);
  }
  await page.emulateMedia({reducedMotion:'no-preference'});
  for (const viewport of [{width:1366,height:768},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport);
    for (let index=0;index<SLIDES.length;index++) {
      await page.selectOption('#slideJump',String(index));
      assert.equal(await page.evaluate(()=>window.presentation.currentIndex),index);
      assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
      assert.equal(await page.locator('.story-cloud-carry, .is-playing').count(),0);
      assert.equal(await page.locator('#slideJump').inputValue(),String(index));
      assert.equal(await page.locator('#presentationStage').evaluate(el=>getComputedStyle(el).opacity),'1');
    }
    await page.locator('#slideJump').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),16,'Picker keyboard must not trigger next slide');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const bounds=await page.locator('#slideJump').boundingBox();
    assert.ok(bounds.x>=0&&bounds.x+bounds.width<=viewport.width&&bounds.y+bounds.height<=viewport.height);
    console.log(`${viewport.width}: all 17 picker destinations immediate, opening skipped, keyboard and footer bounds passed`);
  }
  for (const from of [1,4,5,6]) for (const delay of [0,650]) {
    await page.selectOption('#slideJump',String(from));
    await page.evaluate(()=>window.presentation.nextSlide());
    if(delay) await page.waitForTimeout(delay);
    await page.selectOption('#slideJump','10');
    await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),10,'Old transition cannot replace jumped-to slide');
    assert.equal(await page.locator('.story-cloud-carry, .is-moving-divider, .header-motion').count(),0);
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    assert.equal(await page.locator('#slideCounter').innerText(),'11 / 17');
  }
  console.log('Picker interrupts early/late carried and generic transitions without stale callbacks');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
