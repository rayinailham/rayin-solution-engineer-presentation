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
  env: {
    ...process.env,
    __NV_PRIME_RENDER_OFFLOAD: '1',
    __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
    __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json',
  },
});

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    const debug = gl?.getExtension('WEBGL_debug_renderer_info');
    return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable';
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);

  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (let slide = 2; slide <= 16; slide++) {
      await page.evaluate(index => window.presentation.goToSlide(index, false), slide - 1);
      await page.waitForTimeout(450);
      assert.equal(await page.locator('.service-graph svg').count(), 1, `Slide ${slide}: graph missing`);
      assert.equal(await page.locator('.col-stage .stage-header-info').count(), 0);
      const layout = await page.locator('.service-graph svg').evaluate(svg => {
        const nodes = [...svg.querySelectorAll('.graph-node')];
        const texts = [...svg.querySelectorAll('text')];
        const bounds = svg.getBoundingClientRect();
        const outside = texts.filter(text => {
          const r = text.getBoundingClientRect();
          return r.left < bounds.left || r.right > bounds.right || r.top < bounds.top || r.bottom > bounds.bottom;
        }).map(text => text.textContent);
        const overlaps = [];
        for (let i = 0; i < texts.length; i++) {
          for (let j = i + 1; j < texts.length; j++) {
            const a = texts[i].getBoundingClientRect(), b = texts[j].getBoundingClientRect();
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) {
              overlaps.push([texts[i].textContent, texts[j].textContent]);
            }
          }
        }
        return { nodes: nodes.length, outside, overlaps, textCount: texts.length };
      });
      assert.ok(layout.nodes >= 3 && layout.nodes <= 10, `Slide ${slide}: ${layout.nodes} nodes`);
      assert.deepEqual(layout.outside, [], `Slide ${slide}: text outside SVG`);
      assert.deepEqual(layout.overlaps, [], `Slide ${slide}: overlapping labels`);
      if (viewport.width === 1920) await page.screenshot({ path: `/tmp/aws-clean-slide-${slide}.png` });
      const node = page.locator('.col-stage .graph-node.inspectable-node').first();
      await node.click();
      await page.waitForTimeout(250);
      assert.ok(await page.locator('#inspectorDrawer').evaluate(el => el.classList.contains('active')));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      await node.focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('#inspectorDrawer').evaluate(el => el.classList.contains('active')));
      await page.waitForTimeout(250);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      console.log(`${viewport.width}×${viewport.height} slide ${slide}: ${layout.nodes} nodes, ${layout.textCount} labels, inspector OK`);
    }
  }
  for (const [index, selector] of [[0, '.slide-opening-wrapper'], [16, '.slide-closing-wrapper']]) {
    await page.evaluate(i => window.presentation.goToSlide(i, false), index);
    assert.equal(await page.locator(selector).count(), 1);
    assert.equal(await page.locator('.service-graph').count(), 0);
  }
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: all 17 slides, 15 graphs at both viewports; no browser or asset errors.');
} finally {
  await browser.close();
}
