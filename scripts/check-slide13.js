import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDES } from '../src/data/slides.js';

const slide = SLIDES.find(item => item.id === 13);
assert.match(slide.summary, /state machine/i);
assert.match(JSON.stringify(slide), /Choice state/i);
assert.match(JSON.stringify(slide), /idempotent/i);

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
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 2560, height: 1440 }]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.presentation.jumpToSlide(12));
    const layout = await page.evaluate(() => {
      const svg = document.querySelector('.aws-stage-svg');
      const bounds = svg.getBoundingClientRect();
      const texts = [...svg.querySelectorAll('text')];
      const outside = texts.filter(text => {
        const box = text.getBoundingClientRect();
        return box.left < bounds.left - 1 || box.right > bounds.right + 1 || box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1;
      }).map(text => text.textContent);
      const overlaps = [];
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].getBoundingClientRect(), b = texts[j].getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) overlaps.push([texts[i].textContent, texts[j].textContent]);
      }
      const column = document.querySelector('.col-editorial');
      return { outside, overlaps, columnOverflow: column.scrollHeight - column.clientHeight,
        pageOverflow: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight,
        iconsSquare: [...svg.querySelectorAll('image')].every(icon => icon.getAttribute('width') === icon.getAttribute('height')) };
    });
    assert.deepEqual(layout.outside, []);
    assert.deepEqual(layout.overlaps, []);
    assert.ok(layout.columnOverflow <= 1, JSON.stringify(layout));
    assert.equal(layout.pageOverflow, false);
    assert.equal(layout.iconsSquare, true);
    if (viewport.width === 1920) await page.screenshot({ path: '/tmp/aws-slide13.png' });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate(() => window.presentation.jumpToSlide(11));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    window.oldEventBridge = document.querySelector('[data-node="eventbridge"]');
    window.transitionFrames = [];
    const sample = () => {
      const cloud = document.querySelector('.aws-cloud-boundary');
      const line = document.querySelector('.story-column-divider');
      window.transitionFrames.push({ x: line?.getBoundingClientRect().x,
        width: +cloud?.querySelector('rect').getAttribute('width'),
        height: +cloud?.querySelector('rect').getAttribute('height'),
        nodeOpacity: [...document.querySelectorAll('.graph-node')].map(node => +getComputedStyle(node).opacity),
        titleY: document.querySelector('.slide-headline .header-moving-text')
          ? new DOMMatrix(getComputedStyle(document.querySelector('.slide-headline .header-moving-text')).transform).m42 : 0 });
      if (window.presentation.isAnimating) requestAnimationFrame(sample);
    };
    window.presentation.goToSlide(12);
    requestAnimationFrame(sample);
  });
  await page.waitForFunction(() => !window.presentation.isAnimating);
  const frames = await page.evaluate(() => window.transitionFrames);
  for (const property of ['x', 'width', 'height']) {
    assert.ok(frames.some(frame => frame[property] != null && frame[property] !== frames[0][property]), `${property} interpolates`);
  }
  assert.ok(frames.some(frame => Math.abs(frame.titleY) > 1), 'header title rolls');
  assert.ok(frames.some(frame => frame.nodeOpacity.some(value => value > 0 && value < 1)), 'diagram nodes fade in');
  assert.equal(await page.evaluate(() => document.querySelector('[data-node="eventbridge"]') === window.oldEventBridge), true,
    'shared EventBridge node carries across and repositions');
  assert.equal(await page.locator('.story-cloud-carry, .is-moving-divider, .header-motion').count(), 0);
  assert.equal(await page.evaluate(() => document.querySelector('#presentationStage').inert), false);
  assert.deepEqual(errors, []);
  console.log(`Slide 13 layout and 12 → 13 transition pass on RTX 3060 (${frames.length} sampled frames)`);
} finally {
  await browser.close();
}
