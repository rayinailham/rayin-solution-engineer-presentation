import { chromium } from 'playwright';

const targetUrl = process.env.URL || 'http://localhost:5175';

async function main() {
  console.log(`🚀 Launching Playwright headed browser (RTX 3060 GPU offload) at ${targetUrl}...`);

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (
    (await import('fs')).existsSync('/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
      ? '/home/rayin/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' 
      : undefined);

  const browser = await chromium.launch({
    headless: false,
    executablePath,
    args: [
      '--start-maximized',
      '--ozone-platform=x11',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
    ],
    env: {
      ...process.env,
      __NV_PRIME_RENDER_OFFLOAD: '1',
      __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
      __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json'
    }
  });

  // viewport: null ensures the page adapts to 100% of the window without any letterboxing or size limits
  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  // Retry until Vite server is ready
  let connected = false;
  for (let i = 0; i < 30; i++) {
    try {
      await page.goto(targetUrl, { timeout: 3000, waitUntil: 'domcontentloaded' });
      connected = true;
      break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (connected) {
    const renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      const debug = gl?.getExtension('WEBGL_debug_renderer_info');
      return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable';
    });
    const cdp = await browser.newBrowserCDPSession();
    const { gpu } = await cdp.send('SystemInfo.getInfo');
    if (!renderer.includes('NVIDIA GeForce RTX 3060') || gpu.featureStatus.gpu_compositing !== 'enabled') {
      await browser.close();
      throw new Error(`GPU verification failed: ${renderer}; compositor=${gpu.featureStatus.gpu_compositing}`);
    }
    console.log(`GPU verified: ${renderer}; compositor=${gpu.featureStatus.gpu_compositing}`);
    console.log(`✅ Live monitor connected to ${targetUrl}. Milord can now watch changes in realtime!`);
  } else {
    console.warn(`⚠️ Could not connect to ${targetUrl} yet. Please make sure 'npm run dev' is running.`);
  }

  // Keep script alive until manually terminated or window closed
  browser.on('disconnected', () => {
    console.log('Browser closed by user.');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Error launching browser:', err);
  process.exit(1);
});
