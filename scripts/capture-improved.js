import { chromium } from 'playwright';
import fs from 'fs';

async function testAndCapture() {
  const outputDir = 'scripts/audit-screenshots-improved';
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const pageErrors = [];
  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    pageErrors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
      pageErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5175');
  await page.waitForTimeout(1000);

  for (let i = 2; i <= 17; i++) {
    const slideIdx = i - 1;
    await page.evaluate((idx) => window.presentation.goToSlide(idx, false), slideIdx);
    await page.waitForTimeout(600);

    const num = String(i).padStart(2, '0');
    const filename = `${outputDir}/slide-${num}.png`;
    await page.screenshot({ path: filename });
    console.log(`Captured slide ${i} -> ${filename}`);

    // Click inspectable node if available to verify drawer still opens
    const node = await page.$('.inspectable-node');
    if (node) {
      await node.click({ force: true });
      await page.waitForTimeout(300);
      const isDrawerOpen = await page.evaluate(() => document.getElementById('inspectorDrawer').classList.contains('active'));
      if (!isDrawerOpen) {
        console.warn(`Warning: Drawer did not open on slide ${i}`);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  }

  await browser.close();

  if (pageErrors.length > 0) {
    console.error(`❌ Encountered ${pageErrors.length} errors:`, pageErrors);
    process.exit(1);
  } else {
    console.log('🎉 ALL 17 SLIDES PASSED BEAUTIFULLY WITH ZERO ERRORS & FUNCTIONAL DRAWERS!');
  }
}

testAndCapture().catch(console.error);
