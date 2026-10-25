import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5175');
  
  // Slide 2
  await page.evaluate(() => window.presentation.goToSlide(1, false));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/slide2-now.png' });

  // Slide 8
  await page.evaluate(() => window.presentation.goToSlide(7, false));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/slide8-now.png' });
  
  // Hover over fargate
  const fargate = await page.$('.col-stage [data-node="fargate"]');
  if (fargate) {
    const box1 = await fargate.boundingBox();
    console.log('Fargate before hover:', box1);
    await fargate.hover();
    await page.waitForTimeout(300);
    const box2 = await fargate.boundingBox();
    console.log('Fargate during hover:', box2);
    await page.screenshot({ path: '/tmp/slide8-hovered.png' });
  } else {
    console.log('Fargate node not found in stage');
  }

  await browser.close();
  console.log('Done!');
}

run().catch(console.error);
