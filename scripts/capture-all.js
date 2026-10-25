import { chromium } from 'playwright';
import fs from 'fs';

async function capture() {
  fs.mkdirSync('scripts/audit-screenshots', { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5175');
  await page.waitForTimeout(1000);

  for (let i = 2; i <= 17; i++) {
    const slideIdx = i - 1;
    await page.evaluate((idx) => window.presentation.goToSlide(idx, false), slideIdx);
    await page.waitForTimeout(700);
    const num = String(i).padStart(2, '0');
    const filename = `scripts/audit-screenshots/slide-${num}.png`;
    await page.screenshot({ path: filename });
    console.log(`Saved screenshot for slide ${i}: ${filename}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
}

capture().catch(console.error);
