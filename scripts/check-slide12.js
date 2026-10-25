import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5175');
  await page.evaluate(() => window.presentation.goToSlide(11, false)); // slide 12
  await page.waitForTimeout(500);

  const nodes = await page.$$eval('.col-stage .inspectable-node', els => els.map(e => ({
    node: e.getAttribute('data-node'),
    tag: e.tagName,
    classes: e.className.baseVal || e.className
  })));
  console.log('Nodes on slide 12:', nodes);

  const firstNode = await page.$('.col-stage .inspectable-node');
  if (firstNode) {
    await firstNode.click();
    await page.waitForTimeout(400);
    const isOpen = await page.evaluate(() => document.getElementById('inspectorDrawer').classList.contains('active'));
    console.log('Clicked first node, drawer isOpen:', isOpen);
    const title = await page.textContent('#drawerTitle');
    console.log('Drawer title:', title);
  }
  await browser.close();
}

check().catch(console.error);
