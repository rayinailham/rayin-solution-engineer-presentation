import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { homedir } from 'node:os';
import { join } from 'node:path';

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
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  for (const viewport of [{width:1366,height:768}, {width:1920,height:1080}, {width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    assert.equal(await page.locator('.slide-opening-wrapper').count(), 0, 'Intro must not exist before Start');
    assert.equal(await page.locator('.app-footer').isVisible(), false);
    const outside = await page.locator('.start-page').evaluate(root => [...root.querySelectorAll('h1, p, button, img, .start-presenter')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight;
    }).map(el => el.className));
    assert.deepEqual(outside, []);
    await page.screenshot({path:`/tmp/aws-start-${viewport.width}.png`});
  }
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.start-page').count(), 1, 'Slide navigation must wait for Start');
  for (const action of ['click', 'Enter', 'Space']) {
    if (action !== 'click') await page.reload({waitUntil:'networkidle'});
    const start = page.getByRole('button', {name:'Start presentation'});
    if (action === 'click') await start.click();
    else { await start.focus(); await page.keyboard.press(action); }
    assert.equal(await page.locator('.start-page').count(), 0);
    assert.equal(await page.locator('.slide-opening-wrapper.is-playing').count(), 1);
    assert.equal(await page.evaluate(() => window.presentation.currentIndex), 0);
    assert.equal(await page.locator('.opening-skip').evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', {name:'Skip intro'}).click();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => window.presentation.currentIndex), 1);
    await page.emulateMedia({reducedMotion:'no-preference'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button', {name:'Start presentation'}).click();
  assert.equal(await page.locator('.opening-intro').isHidden(), true);
  assert.equal(await page.locator('.opening-replay').evaluate(el => el === document.activeElement), true);
  await page.evaluate(() => window.presentation.goToSlide(4, false));
  assert.equal(await page.locator('#graph-title-5').count(), 1);
  assert.deepEqual(errors, []);
  console.log('PASS: waiting layout at 3 sizes; click/Enter/Space; intro starts on demand; focus; reduced motion; slide navigation.');
} finally {
  await browser.close();
}
