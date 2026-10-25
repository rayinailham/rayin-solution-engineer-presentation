import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

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
  const page = await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.URL || 'http://localhost:5175',{waitUntil:'networkidle'});
  const renderer=await page.evaluate(()=>{
    const gl=document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer,/NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  const transitions=[{from:2,to:3,nodes:9},{from:3,to:4,nodes:4},{from:4,to:5,nodes:3},{from:5,to:6,nodes:4},{from:6,to:7,nodes:4},{from:8,to:9,nodes:5}];
  for(const viewport of [{width:1366,height:768},{width:1920,height:1080},{width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    for(const {from,to,nodes} of transitions) {
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.evaluate(from=>window.presentation.goToSlide(from,false),from);
      const expected=await page.evaluate(to=>{
        const holder=document.createElement('div');
        holder.innerHTML=window.presentation.generateSlideHtml(window.presentation.slides[to]);
        return holder.querySelector('.editorial-top-section').innerHTML;
      },to);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.evaluate(to=>{
        window.headerSource=document.querySelector('.editorial-top-section');
        window.headerFrames=[];
        const sample=()=>{
          const top=document.querySelector('.editorial-top-section');
          const column=document.querySelector('.col-editorial');
          const selectors=['.editorial-top-section','.editorial-header','.section-indicator','.act-badge','.pills-row','.service-pill'];
          window.headerFrames.push({
            steady:selectors.every(s=>[...top.parentElement.querySelectorAll(s)].every(el=>getComputedStyle(el).opacity==='1')),
            topCount:document.querySelectorAll('.editorial-top-section').length,
            overflow:column.scrollHeight-column.clientHeight,
            pageOverflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
            moving:!!top.querySelector('.slide-headline .header-moving-text[style*="transform"]'),
          });
          if(window.presentation.isAnimating) requestAnimationFrame(sample);
        };
        window.presentation.goToSlide(to);
        requestAnimationFrame(sample);
      },to);
      await page.waitForTimeout(650);
      if(viewport.width===1920) await page.screenshot({path:`/tmp/aws-header-${from+1}-${to+1}-during.png`});
      await page.waitForFunction(()=>!window.presentation.isAnimating);
      const result=await page.evaluate(()=>({frames:window.headerFrames, same:window.headerSource===document.querySelector('.editorial-top-section')}));
      assert.ok(result.same,'The header frame must carry across the DOM swap');
      assert.ok(result.frames.some(f=>f.moving),'Title must reveal by masked words');
      assert.ok(result.frames.every(f=>f.steady && f.topCount===1 && f.overflow<=1 && !f.pageOverflow),JSON.stringify(result.frames.find(f=>!f.steady||f.topCount!==1||f.overflow>1||f.pageOverflow)));
      assert.equal(await page.locator('.editorial-top-section').innerHTML(),expected,'Final markup and layout must exactly match the static slide');
      assert.equal(await page.locator('.header-motion, .header-text-mask, .story-cloud-carry').count(),0);
      assert.equal(await page.locator('.graph-node').count(),nodes);
      assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
      if(viewport.width===1920) await page.screenshot({path:`/tmp/aws-header-${to+1}-final.png`});
      console.log(`${viewport.width}: ${from+1} → ${to+1}, persistent frame, masked title/section/act/pills, canonical end layout; ${result.frames.length} frames without header fade or overflow`);
    }
  }
  await page.setViewportSize({width:1920,height:1080});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  for(const {from,to} of transitions) {
    for(const mode of ['resize-before','resize-during','motion-before','motion-during','cleanup']) {
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.evaluate(from=>window.presentation.goToSlide(from,false),from);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.evaluate(to=>window.presentation.goToSlide(to),to);
      if(mode.endsWith('during')||mode==='cleanup') await page.waitForTimeout(650);
      if(mode.startsWith('resize')) {
        const size=page.viewportSize();
        await page.setViewportSize(size.width===1920?{width:1366,height:768}:{width:1920,height:1080});
      } else if(mode.startsWith('motion')) await page.emulateMedia({reducedMotion:'reduce'});
      else await page.evaluate(()=>window.presentation.slideCleanup());
      await page.waitForFunction(()=>!window.presentation.isAnimating);
      assert.equal(await page.locator('.header-motion, .header-text-mask, .story-cloud-carry').count(),0);
      assert.equal(await page.locator('.section-step').innerText(),String(to+1).padStart(2,'0'));
      assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
      console.log(`${from+1} → ${to+1}: ${mode} settles cleanly`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(from=>window.presentation.goToSlide(from,false),from);
    await page.evaluate(to=>window.presentation.goToSlide(to),to);
    assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
    assert.equal(await page.locator('.header-motion, .header-text-mask, .story-cloud-carry').count(),0);
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
}
