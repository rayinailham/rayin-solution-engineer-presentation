import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { homedir } from 'node:os';
import { join } from 'node:path';

const browser = await chromium.launch({
  headless: false,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || join(process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), '.cache/ms-playwright'), 'chromium-1243/chrome-linux64/chrome'),
  args: ['--ozone-platform=x11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  env: { ...process.env, __NV_PRIME_RENDER_OFFLOAD: '1', __GLX_VENDOR_LIBRARY_NAME: 'nvidia', __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' },
});
try {
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error(error); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  await page.bringToFront();
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  const cdp = await browser.newBrowserCDPSession();
  const { gpu } = await cdp.send('SystemInfo.getInfo');
  assert.equal(gpu.featureStatus.gpu_compositing, 'enabled');
  console.log(`GPU: ${renderer}; compositor=${gpu.featureStatus.gpu_compositing}`);
  await page.getByRole('button', { name: 'Start presentation' }).click();
  await page.locator('.opening-intro').waitFor({ state: 'hidden', timeout: 8000 });
  for (const viewport of [{ width: 2560, height: 1440 }, { width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 900, height: 900 }]) {
    await page.setViewportSize(viewport);
    const layout = await page.locator('.slide-opening-wrapper').evaluate(root => {
      const bounds = root.getBoundingClientRect();
      const copy = root.querySelector('.opening-copy').getBoundingClientRect();
      const elements = [...root.querySelectorAll('.opening-copy > *, .opening-visual')];
      const outside = elements.filter(el => {
        const r = el.getBoundingClientRect();
        return r.left < bounds.left || r.right > bounds.right || (innerWidth > 900 && (r.top < bounds.top || r.bottom > bounds.bottom));
      }).map(el => el.className);
      return { outside, inset: copy.left - bounds.left, overflowX: root.scrollWidth - root.clientWidth };
    });
    assert.deepEqual(layout.outside, [], JSON.stringify(viewport));
    assert.ok(layout.inset >= 31, 'Opening padding too small');
    assert.ok(layout.overflowX <= 1, 'Opening horizontal overflow');
    await page.screenshot({ path: `/tmp/aws-opening-${viewport.width}.png` });
    console.log(`Layout ${viewport.width}×${viewport.height}: OK; inset=${Math.round(layout.inset)}px`);
  }
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.waitForTimeout(150);
  await page.locator('.opening-intro').waitFor({ state: 'hidden', timeout: 8000 });
  const handoff = await page.evaluate(async () => {
    const root = document.querySelector('.slide-opening-wrapper');
    const orbit = root.querySelector('.opening-orbit');
    const target = orbit.getBoundingClientRect();
    const bounds = root.getBoundingClientRect();
    root.querySelector('.opening-replay').click();
    const start = orbit.getBoundingClientRect();
    let minOpacity = 1;
    let sameNode = true;
    const t0 = performance.now();
    await new Promise(resolve => {
      const tick = () => {
        minOpacity = Math.min(minOpacity, Number(getComputedStyle(orbit).opacity));
        sameNode &&= root.querySelector('.opening-orbit') === orbit;
        if (performance.now() - t0 < 3300) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const end = orbit.getBoundingClientRect();
    return { count: root.querySelectorAll('.opening-orbit').length, sameNode, minOpacity,
      startOffset: Math.abs(start.left + start.width / 2 - bounds.left - bounds.width / 2),
      travel: end.left - start.left, endOffset: Math.abs(end.left - target.left) + Math.abs(end.top - target.top),
      copyTransform: getComputedStyle(root.querySelector('.opening-copy')).transform };
  });
  assert.equal(handoff.count, 1);
  assert.equal(handoff.sameNode, true);
  assert.equal(handoff.minOpacity, 1, 'Orbit must stay visible during handoff');
  assert.ok(handoff.startOffset < 2 && handoff.endOffset < 2 && handoff.travel > 100, JSON.stringify(handoff));
  assert.equal(handoff.copyTransform, 'none', 'Copy should fade without movement');
  console.log('Continuous center → right handoff:', handoff);
  const frameProbe = duration => new Promise(resolve => {
    const times = [];
    const start = performance.now();
    let last;
    const tick = now => {
      if (last) times.push(now - last);
      last = now;
      if (now - start < duration) requestAnimationFrame(tick);
      else {
        const sorted = [...times].sort((a, b) => a - b);
        resolve({ samples: times.length, median: sorted[Math.floor(sorted.length / 2)], p95: sorted[Math.floor(sorted.length * .95)], max: Math.max(...times), over25ms: times.filter(dt => dt > 25).length });
      }
    };
    requestAnimationFrame(tick);
  });
  const baseline = await page.evaluate(frameProbe, 800);
  const motionFrames = page.evaluate(frameProbe, 4000);
  await page.locator('.opening-replay').click();
  console.log('rAF baseline:', baseline);
  console.log('rAF intro:', await motionFrames);
  await page.locator('.opening-replay').click();
  const rotation = await page.locator('.opening-visual .opening-orbit-ring').evaluate(el => getComputedStyle(el).rotate);
  await page.waitForTimeout(450);
  assert.notEqual(await page.locator('.opening-visual .opening-orbit-ring').evaluate(el => getComputedStyle(el).rotate), rotation);
  await page.screenshot({ path: '/tmp/aws-opening-orbit.png' });
  await page.locator('.opening-skip').click();
  assert.ok(await page.locator('.opening-intro').isHidden());
  assert.equal(await page.locator('.opening-replay').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  assert.equal(await page.locator('.service-graph').count(), 1, 'Navigation during intro failed');
  await page.waitForFunction(() => !window.presentation.isAnimating);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(50);
  assert.ok(await page.locator('.opening-intro').isHidden(), 'Reduced motion must stop active intro');
  await page.locator('.opening-replay').click();
  assert.ok(await page.locator('.opening-intro').isHidden(), 'Reduced motion must skip replay');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const brandHandoff = await page.evaluate(async () => {
    const logo = document.getElementById('sharedAwsLogo');
    const start = logo.getBoundingClientRect();
    document.getElementById('btnNext').click();
    let minOpacity = 1;
    let contentBeforeLogo = false;
    let temporaryScrollbar = false;
    let logoSettledAt;
    let contentStartedAt;
    const t0 = performance.now();
    await new Promise(resolve => {
      const tick = () => {
        minOpacity = Math.min(minOpacity, Number(getComputedStyle(logo).opacity));
        const r = logo.getBoundingClientRect();
        const destination = document.querySelector('.header-aws-slot').getBoundingClientRect();
        const error = Math.abs(r.left - destination.left) + Math.abs(r.top - destination.top) + Math.abs(r.width - destination.width);
        const layout = document.querySelector('.slide-editorial-layout');
        if (layout) {
          const column = layout.querySelector('.col-editorial');
          if (document.getElementById('presentationStage').classList.contains('is-revealing')) temporaryScrollbar ||= getComputedStyle(column).overflowY !== 'hidden';
          if (error < 0.05 && logoSettledAt === undefined) logoSettledAt = performance.now() - t0;
          if (Number(getComputedStyle(layout).opacity) > 0.02) {
            contentBeforeLogo ||= error > 0.05;
            contentStartedAt ??= performance.now() - t0;
          }
        }
        if (performance.now() - t0 < 2600) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const end = logo.getBoundingClientRect();
    const target = document.querySelector('.header-aws-slot').getBoundingClientRect();
    return { sameNode: document.getElementById('sharedAwsLogo') === logo, minOpacity, contentBeforeLogo, temporaryScrollbar, logoSettledAt, contentStartedAt,
      travel: Math.hypot(start.left - end.left, start.top - end.top),
      error: Math.abs(end.left - target.left) + Math.abs(end.top - target.top) + Math.abs(end.width - target.width) };
  });
  assert.equal(brandHandoff.sameNode, true);
  assert.equal(brandHandoff.minOpacity, 1);
  assert.equal(brandHandoff.temporaryScrollbar, false, 'No scrollbar during reveal');
  assert.equal(await page.locator('.col-editorial').evaluate(el => getComputedStyle(el).overflowY), 'auto', 'Restore normal scroll after reveal');
  assert.equal(brandHandoff.contentBeforeLogo, false, 'Content must wait for the logo');
  assert.ok(brandHandoff.contentStartedAt - brandHandoff.logoSettledAt >= 70, 'Logo needs a settling beat');
  await page.waitForFunction(() => !window.presentation.isAnimating);
  assert.ok(brandHandoff.travel > 100 && brandHandoff.error < 2, JSON.stringify(brandHandoff));
  console.log('Persistent AWS logo → header:', brandHandoff);
  await page.screenshot({ path: '/tmp/aws-slide-2-brand.png' });
  for (let index = 1; index < 17; index++) {
    await page.evaluate(i => window.presentation.goToSlide(i, false), index);
    assert.equal(await page.evaluate(() => window.presentation.currentIndex), index);
    const brand = await page.locator('#sharedAwsLogo').evaluate(logo => {
      const r = logo.getBoundingClientRect();
      const target = document.querySelector('.header-aws-slot').getBoundingClientRect();
      return { count: document.querySelectorAll('#sharedAwsLogo').length, opacity: getComputedStyle(logo).opacity,
        error: Math.abs(r.left - target.left) + Math.abs(r.top - target.top) };
    });
    assert.equal(brand.count, 1);
    assert.equal(brand.opacity, '1');
    assert.ok(brand.error < 2, `Slide ${index + 1}: logo misaligned`);
  }
  console.log('PASS: persistent AWS logo visible on slides 2–17.');
  assert.deepEqual(errors, []);
  console.log('PASS: orbit, replay, skip, focus, navigation cleanup, reduced motion, layout, zero browser/asset errors.');
} finally { await browser.close(); }
