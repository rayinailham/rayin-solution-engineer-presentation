import { chromium } from 'playwright';

async function testAllSlides() {
  console.log('Testing all 17 slides on http://localhost:5175...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const errors = [];
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('HTTP ERROR URL:', resp.status(), resp.url());
    }
  });
  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    errors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
      errors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Test Slide 01
  console.log('Testing Slide 01...');
  const title01 = await page.textContent('.opening-hero-title');
  console.log('Slide 01 Title:', title01?.trim());

  // Click an inspectable node on Slide 01
  const firstNode = await page.$('.inspectable-node');
  if (firstNode) {
    await firstNode.click();
    await page.waitForTimeout(400);
    const drawerTitle = await page.textContent('#drawerTitle');
    console.log('Opened drawer on node:', drawerTitle?.trim());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // Iterate slides 2 to 17
  for (let i = 2; i <= 17; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700); // Wait for GSAP transition to finish

    const counter = await page.textContent('#slideCounter');
    console.log(`Navigated to: ${counter?.trim()}`);

    // If slide has inspectable node, test clicking one
    const node = await page.waitForSelector('.inspectable-node', { timeout: 2000 }).catch(() => null);
    if (node) {
      await node.click({ force: true });
      await page.waitForTimeout(400);
      const drawerTitle = await page.textContent('#drawerTitle');
      console.log(`   [Slide ${i}] Drawer opened for: ${drawerTitle?.trim()}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  // Take screenshot of Grand Topology (Slide 16)
  await page.keyboard.press('ArrowLeft'); // back to 16
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scripts/screenshot-slide-16.png' });
  console.log('Screenshot of Slide 16 saved to scripts/screenshot-slide-16.png');

  await browser.close();

  if (errors.length > 0) {
    console.error(`FAILED with ${errors.length} errors:`, errors);
    process.exit(1);
  } else {
    console.log('✅ ALL 17 SLIDES PASSED WITH 0 ERRORS!');
  }
}

testAllSlides().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
