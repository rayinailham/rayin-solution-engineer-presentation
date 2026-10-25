import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDE_2_INSPECTORS } from '../src/data/inspectors.js';

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
  page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  await page.evaluate(() => window.presentation.goToSlide(1, false));
  await page.locator('.col-stage').hover();
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => window.presentation.currentIndex), 1, 'Wheel over graph must not navigate');
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => !window.presentation.isAnimating);
  assert.equal(await page.evaluate(() => window.presentation.currentIndex), 2, 'Keyboard navigation must work');
  await page.evaluate(() => window.presentation.goToSlide(1, false));
  assert.equal(await page.locator('.point-description').count(), 4);
  assert.equal(await page.locator('.course-source-tag').count(), 0);
  assert.match(await page.locator('.slide-narrative').innerText(), /made-up name/);
  assert.match(await page.locator('.slide-narrative').innerText(), /three US states/);
  assert.match(await page.locator('.graph-context-note').innerText(), /workflow rules determine/i);
  for (const viewport of [{ width: 2560, height: 1440 }, { width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
    const overflow = await page.locator('.col-editorial').evaluate(el => ({
      x: el.scrollWidth - el.clientWidth, y: el.scrollHeight - el.clientHeight,
    }));
    assert.ok(overflow.x <= 1, `${viewport.width}: horizontal overflow`);
    assert.ok(overflow.y <= 1, `${viewport.width}: ${JSON.stringify(overflow)}`);
    if (overflow.y > 1) {
      await page.locator('.col-editorial').hover();
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(200);
      assert.ok(await page.locator('.col-editorial').evaluate(el => el.scrollTop > 0), 'Wheel must scroll the reading column');
      await page.locator('.col-editorial').evaluate(el => { el.scrollTop = el.scrollHeight; });
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => window.presentation.currentIndex), 1, 'Wheel at the bottom must not navigate');
      await page.locator('.col-editorial').evaluate(el => { el.scrollTop = 0; });
    }
    await page.screenshot({ path: `/tmp/aws-slide2-context-${viewport.width}.png` });
    console.log(`${viewport.width}×${viewport.height}: editorial overflow=${overflow.y}px`);
  }
  for (const [key, overview] of Object.entries(SLIDE_2_INSPECTORS)) {
    const node = page.locator(`.graph-context [data-node="${key}"]`);
    await node.focus();
    await page.keyboard.press('Enter');
    await page.locator('#drawerContextDetails').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#drawerTitle').innerText(), overview.service);
    assert.equal(await page.locator('#drawerSlaGroup').isVisible(), false);
    assert.equal(await page.locator('#drawerCodePreview').isVisible(), false);
    assert.equal(await page.locator('#drawerRole').innerText(), overview.role);
    assert.deepEqual(await page.locator('#drawerContextDetails h4').allTextContents(), overview.sections.map(s => s[0]));
    assert.deepEqual(await page.locator('#drawerContextDetails p').allTextContents(), overview.sections.map(s => s[1]));
    for (const key of ['Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      assert.equal(await page.locator(key === 'Tab' ? '.drawer-body' : '#drawerCloseBtn').evaluate(el=>el===document.activeElement),true);
    }
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => window.presentation.currentIndex), 1, 'Drawer must isolate slide navigation');
    if (key === 'stepfunctions') {
      await page.waitForTimeout(250);
      await page.screenshot({ path: '/tmp/aws-slide2-context-drawer.png' });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    assert.equal(await node.evaluate(el => el === document.activeElement), true);
    console.log(`${key}: scenario explanation, keyboard and focus OK`);
  }
  await page.evaluate(() => window.presentation.goToSlide(4, false));
  await page.locator('.col-stage [data-node="apigateway"]').click();
  assert.equal(await page.locator('#drawerSlaGroup').isVisible(), true);
  assert.equal(await page.locator('#drawerCodePreview').isVisible(), true);
  assert.equal(await page.locator('#drawerContextDetails').isVisible(), false);
  assert.equal(await page.locator('#drawerRoleLabel').textContent(), 'Architectural Role');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.presentation.goToSlide(0, false));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const handoff = await page.evaluate(async () => {
    const source = document.querySelector('.opening-orbit-logo').getBoundingClientRect();
    const logo = document.getElementById('sharedAwsLogo');
    window.presentation.goToSlide(1);
    const start = logo.getBoundingClientRect();
    const sourceError = Math.abs(start.left - source.left) + Math.abs(start.top - source.top) + Math.abs(start.width - source.width);
    const t0 = performance.now();
    let settledAt, revealedAt, contentBeforeLogo = false, minOpacity = 1;
    await new Promise(resolve => {
      const tick = () => {
        const rect = logo.getBoundingClientRect();
        const target = document.querySelector('.header-aws-slot').getBoundingClientRect();
        const error = Math.abs(rect.left - target.left) + Math.abs(rect.top - target.top) + Math.abs(rect.width - target.width);
        minOpacity = Math.min(minOpacity, Number(getComputedStyle(logo).opacity));
        if (error < .1 && settledAt === undefined) settledAt = performance.now() - t0;
        const layout = document.querySelector('.slide-editorial-layout');
        if (layout && Number(getComputedStyle(layout).opacity) > .02) {
          revealedAt ??= performance.now() - t0;
          contentBeforeLogo ||= error > .1;
        }
        if (performance.now() - t0 < 3500) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return { sourceError, settledAt, revealedAt, contentBeforeLogo, minOpacity, sameNode: logo === document.getElementById('sharedAwsLogo') };
  });
  assert.ok(handoff.sourceError < 1, JSON.stringify(handoff));
  assert.equal(handoff.sameNode, true);
  assert.equal(handoff.minOpacity, 1);
  assert.equal(handoff.contentBeforeLogo, false);
  assert.ok(handoff.settledAt >= 1400 && handoff.revealedAt - handoff.settledAt >= 100, JSON.stringify(handoff));
  console.log('Orbit logo → header:', handoff);
  assert.deepEqual(errors, []);
  console.log('PASS: slide 2 reading, all four contextual inspectors, slide 5 generic inspector, no browser errors');
} finally {
  await browser.close();
}
