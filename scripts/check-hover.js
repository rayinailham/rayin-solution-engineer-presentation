import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5175');
  
  // Go to slide 2
  await page.evaluate(() => document.getElementById('btnNext').click());
  await new Promise(r => setTimeout(r, 600));

  const nodes = await page.$$('.inspectable-node');
  console.log(`Found ${nodes.length} inspectable nodes`);
  
  if (nodes.length > 0) {
    const firstNode = nodes[0];
    const boxBefore = await firstNode.boundingBox();
    console.log('Before hover:', boxBefore);
    await firstNode.hover();
    await new Promise(r => setTimeout(r, 200));
    const boxAfter = await firstNode.boundingBox();
    console.log('After hover:', boxAfter);
  }

  // Go to slide 8 (click next 6 more times)
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => document.getElementById('btnNext').click());
    await new Promise(r => setTimeout(r, 400));
  }
  await page.screenshot({ path: '/tmp/slide8.png' });
  
  const fargate = await page.$('[data-node="fargate"]');
  if (fargate) {
    const bBefore = await fargate.boundingBox();
    console.log('Fargate before hover:', bBefore);
    await fargate.hover();
    await new Promise(r => setTimeout(r, 200));
    const bAfter = await fargate.boundingBox();
    console.log('Fargate after hover:', bAfter);
    await page.screenshot({ path: '/tmp/slide8-hover.png' });
  }

  await browser.close();
}

test().catch(console.error);
