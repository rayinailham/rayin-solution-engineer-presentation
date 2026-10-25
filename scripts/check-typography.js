import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

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
  const page = await browser.newPage({reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.URL || 'http://localhost:5175', {waitUntil:'networkidle'});
  const renderer = await page.evaluate(() => {
    const gl=document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer,/NVIDIA GeForce RTX 3060/);
  const failures=[];
  for(const viewport of [{width:2560,height:1440},{width:1920,height:1080},{width:1366,height:768}]) {
    await page.setViewportSize(viewport);
    for(let id=1;id<=17;id++) {
      await page.evaluate(index=>window.presentation.goToSlide(index,false),id-1);
      await page.waitForTimeout(30);
      if(id===1) assert.deepEqual(await page.locator('.opening-course-tags .course-source-tag').allTextContents(), ['AWS Skill Builder', 'Solutions Architect', 'Intermediate']);
      if(id===2) assert.equal(await page.locator('.course-source-tag').count(), 0);
      const layout=await page.evaluate(()=>{
        const editorial=document.querySelector('.col-editorial');
        const root=document.querySelector('.slide-editorial-layout, .slide-opening-wrapper, .slide-closing-wrapper');
        const b=root.getBoundingClientRect();
        const outside=[...root.querySelectorAll('h1,h2,h3,h4,p,.point-text,.opening-hero-presenter,.course-source-tag,.rule-desc,.rule-title')].filter(el=>{
          if(!el.getClientRects().length) return false;
          const r=el.getBoundingClientRect();
          return r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;
        }).map(el=>el.textContent.slice(0,55));
        return {overflow:editorial ? editorial.scrollHeight-editorial.clientHeight : 0,outside,
          rootFont:getComputedStyle(document.documentElement).fontSize};
      });
      if(layout.overflow>1||layout.outside.length) failures.push({width:viewport.width,slide:id,...layout});
      if([1,2,3,17].includes(id)) await page.screenshot({path:`/tmp/aws-readable-${id}-${viewport.width}.png`});
    }
    console.log(`${viewport.width}: checked all 17 slides`);
  }
  assert.deepEqual(failures,[]);
  assert.deepEqual(errors,[]);
  console.log('PASS: presentation typography, no clipped content or editorial scroll');
} finally {await browser.close();}
