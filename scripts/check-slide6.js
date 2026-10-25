import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SLIDE_6_INSPECTORS } from '../src/data/inspectors.js';

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
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.url()); });
  await page.goto(process.env.URL || 'http://localhost:5175', { waitUntil: 'networkidle' });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  });
  assert.match(renderer, /NVIDIA GeForce RTX 3060/);
  console.log(`GPU: ${renderer}`);
  await page.evaluate(() => window.presentation.goToSlide(5, false));
  assert.equal(await page.locator('.graph-node').count(), 3);
  assert.equal(await page.locator('.graph-link.event').count(), 2);
  assert.equal(await page.locator('.official-cloud').count(), 1);
  assert.doesNotMatch(await page.locator('.service-graph').textContent(), /not shown/);
  assert.match(await page.locator('.delivery-output').textContent(), /DELIVERY SYSTEM/);
  const systemOutsideCloud = await page.evaluate(() => {
    const cloud=document.querySelector('.official-cloud > rect').getBoundingClientRect();
    const system=document.querySelector('.delivery-output > rect').getBoundingClientRect();
    return system.top>cloud.bottom;
  });
  assert.equal(systemOutsideCloud,true, 'Delivery partner must sit outside the AWS Cloud boundary');
  assert.match(await page.locator('.col-editorial').innerText(), /Handler: run our business logic/);
  assert.equal(await page.locator('.lambda-ownership').count(), 0);
  assert.match(await page.locator('.delivery-handler').textContent(), /event.detail.orderId/);
  assert.equal(await page.locator('.delivery-execution-surface').count(), 1);
  assert.equal(await page.evaluate(() => {
    const cloud = document.querySelector('.official-cloud > rect').getBoundingClientRect();
    const note = [...document.querySelectorAll('.delivery-handler text')].find(el => el.textContent === 'AWS runs and scales compute.').getBoundingClientRect();
    return note.top >= cloud.top && note.bottom <= cloud.bottom;
  }), true, 'AWS compute responsibility must sit inside AWS Cloud');

  for (const viewport of [{width:1366,height:768}, {width:1920,height:1080}, {width:2560,height:1440}]) {
    await page.setViewportSize(viewport);
    const result = await page.evaluate(() => {
      const column = document.querySelector('.col-editorial');
      const svg = document.querySelector('.service-graph svg');
      const texts = [...svg.querySelectorAll('text')];
      const bounds = svg.getBoundingClientRect();
      const outside = texts.filter(t => { const r=t.getBoundingClientRect(); return r.left<bounds.left || r.right>bounds.right || r.top<bounds.top || r.bottom>bounds.bottom; }).map(t=>t.textContent);
      const overlaps = [];
      for (let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++) {
        const a=texts[i].getBoundingClientRect(), b=texts[j].getBoundingClientRect();
        if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([texts[i].textContent,texts[j].textContent]);
      }
      // Check connector centerlines against text bounds, including vertical lines.
      const crossings = [];
      for (const path of svg.querySelectorAll('.graph-link path')) {
        const matrix=path.getScreenCTM();
        for(let d=0;d<path.getTotalLength();d+=2) {
          const p=path.getPointAtLength(d).matrixTransform(matrix);
          for(const text of texts) {
            const r=text.getBoundingClientRect();
            if(p.x>r.left+1 && p.x<r.right-1 && p.y>r.top+1 && p.y<r.bottom-1) crossings.push(text.textContent);
          }
        }
      }
      return {overflow:column.scrollHeight-column.clientHeight, outside, overlaps, crossings:[...new Set(crossings)],
        pageOverflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
        icons:[...svg.querySelectorAll('.graph-node image')].every(i=>i.getAttribute('width')===i.getAttribute('height'))};
    });
    const columns = await page.locator('.slide-lambda-task').evaluate(el => {
      const left = el.querySelector('.col-editorial').getBoundingClientRect();
      const right = el.querySelector('.col-stage').getBoundingClientRect();
      return { left: left.width, right: right.width };
    });
    assert.ok(columns.right > columns.left, 'Lambda diagram should have the larger column');
    assert.ok(result.overflow<=1, JSON.stringify(result));
    assert.deepEqual(result.outside, []);
    assert.deepEqual(result.overlaps, []);
    assert.deepEqual(result.crossings, []);
    assert.equal(result.pageOverflow,false);
    assert.equal(result.icons,true);
    await page.screenshot({animations:'disabled',path:`/tmp/aws-slide6-${viewport.width}.png`});
    await page.locator('[data-node="eventbridge"]').click();
    const drawer = await page.locator('#inspectorDrawer').boundingBox();
    assert.ok(drawer.x >= 0 && drawer.y >= 0 && drawer.x + drawer.width <= viewport.width + 1 && drawer.y + drawer.height <= viewport.height + 1);
    await page.screenshot({animations:'disabled',path:`/tmp/aws-slide6-modal-${viewport.width}.png`});
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.drawer-body').evaluate(el=>el===document.activeElement),true);
    if (viewport.width === 1366) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(250);
      assert.ok(await page.locator('.drawer-body').evaluate(el=>el.scrollTop>0), 'Keyboard must scroll long modal text');
    }
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    console.log(`${viewport.width}: layout, labels, connectors, proportions and modal bounds passed`);
  }
  for (const node of await page.locator('.inspectable-node[role="button"]').all()) {
    const key=await node.getAttribute('data-node');
    const inspectorKey=await node.getAttribute('data-inspector');
    const data=SLIDE_6_INSPECTORS[inspectorKey];
    await node.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#drawerTitle').innerText(),data.service);
    assert.equal(await page.locator('#drawerRole').innerText(),data.role);
    assert.deepEqual(await page.locator('#drawerContextDetails p').allTextContents(),data.sections.map(s=>s[1]));
    assert.equal(await page.locator('#drawerSlaGroup').isVisible(),false);
    assert.equal(await page.locator('#drawerCodePreview').isVisible(),false);
    assert.equal(await page.locator('#inspectorDrawer').getAttribute('aria-modal'),'true');
    for (const key of ['Tab','Shift+Tab']) {
      await page.keyboard.press(key);
      assert.equal(await page.locator(key === 'Tab' ? '.drawer-body' : '#drawerCloseBtn').evaluate(el=>el===document.activeElement),true);
    }
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>window.presentation.currentIndex),5);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    assert.equal(await node.evaluate(el=>el===document.activeElement),true);
  }
  await page.locator('[data-node="eventbridge"]').click();
  await page.locator('#drawerCloseBtn').click();
  await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
  await page.locator('[data-inspector="plan-delivery"]').focus();
  await page.keyboard.press('Space');
  await page.locator('#drawerBackdrop').click({position:{x:20,y:20}});
  await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
  console.log('All 5 service/data/output nodes: contextual modal, keyboard, focus trap, Escape, close and backdrop passed');
  await page.emulateMedia({ reducedMotion:'no-preference' });
  for (const mode of ['normal','resize-before-render','resize','motion-before-render','motion-during-reveal','cleanup']) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1920,height:1080});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>window.presentation.goToSlide(4,false));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      window.oldCloud=document.querySelector('.aws-cloud-boundary');
      window.oldLogo=document.querySelector('#sharedAwsLogo');
      window.carryNodes=['eventbridge','order-event','plan-delivery'].map(key=>document.querySelector(`[data-inspector="${key}"]`));
      window.dividerStart=document.querySelector('.col-editorial').getBoundingClientRect().right - .5;
      window.transitionFrames=[];
      const observe=()=>{
        const visible=selector=>[...document.querySelectorAll(selector)].filter(n=>getComputedStyle(n).visibility!=='hidden');
        window.transitionFrames.push({
          dividerX:document.querySelector('.story-column-divider')?.getBoundingClientRect().x ??
            document.querySelector('.col-editorial').getBoundingClientRect().right - .5,
          dividerCount:document.querySelectorAll('.story-column-divider').length,
          nativeBorderHidden:getComputedStyle(document.querySelector('.col-editorial')).borderRightColor==='rgba(0, 0, 0, 0)',
          overflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight,
          clouds:visible('.aws-cloud-boundary').length,
          delivery:visible('[data-inspector="plan-delivery"]').length,
          events:visible('[data-inspector="order-event"]').length,
          columnOverflow:document.querySelector('.col-editorial').scrollHeight-document.querySelector('.col-editorial').clientHeight,
          invalidNodes:['eventbridge','order-event','plan-delivery'].filter(key => {
            const node=visible(`[data-inspector="${key}"]`)[0];
            if(!node) return true;
            const r=node.getBoundingClientRect();
            return ![r.x,r.y,r.width,r.height].every(Number.isFinite) || r.width<=0 || r.height<=0 ||
              r.left<0 || r.top<0 || r.right>innerWidth+1 || r.bottom>innerHeight+1;
          }),
        });
        if(window.presentation.isAnimating) requestAnimationFrame(observe);
      };
      window.presentation.goToSlide(5);
      requestAnimationFrame(observe);
    });
    if(mode==='motion-before-render') await page.emulateMedia({reducedMotion:'reduce'});
    else if(mode==='resize-before-render') await page.setViewportSize({width:1366,height:768});
    else {
      await page.waitForTimeout(650);
      assert.equal(await page.evaluate(()=>window.carryNodes.every(n=>n.isConnected && n.closest('.story-cloud-carry'))),true);
      if(mode==='resize') await page.setViewportSize({width:1366,height:768});
      if(mode==='motion-during-reveal') await page.emulateMedia({reducedMotion:'reduce'});
      if(mode==='cleanup') await page.evaluate(()=>window.presentation.slideCleanup());
      if(mode==='normal') await page.screenshot({animations:'disabled',path:'/tmp/aws-slide6-transition.png'});
    }
    await page.waitForFunction(()=>!window.presentation.isAnimating);
    assert.equal(await page.evaluate(()=>window.oldCloud===document.querySelector('.aws-cloud-boundary')),true);
    assert.equal(await page.evaluate(()=>window.oldLogo===document.querySelector('#sharedAwsLogo')),true);
    assert.equal(await page.evaluate(()=>window.carryNodes.every(n=>n.isConnected && n.closest('.aws-stage-svg'))),true);
    assert.equal(await page.locator('.story-cloud-carry').count(),0);
    assert.equal(await page.locator('.graph-node').count(),3);
    assert.equal(await page.locator('.routing-rule').count(),0);
    assert.equal(await page.locator('.delivery-output').count(),1);
    for (const selector of ['.delivery-handler']) {
      assert.equal(await page.locator(selector).count(),1);
      assert.equal(await page.locator(selector).evaluate(el=>getComputedStyle(el).opacity),'1');
    }
    assert.equal(await page.evaluate(()=>document.querySelector('#presentationStage').inert),false);
    assert.equal(await page.locator('.section-step').innerText(),'06');
    assert.equal(await page.locator('.slide-headline').innerText(),'What Does Plan Delivery Do?');
    assert.equal((await page.locator('.act-badge').innerText()).replace(/\s+/g,' '),'PART II: RUNNING A TASK');
    assert.equal(await page.locator('.slide-headline').evaluate(el=>getComputedStyle(el).transform),'none');
    assert.equal(await page.locator('.section-step > span').evaluate(el=>getComputedStyle(el).transform),'none');
    const frames=await page.evaluate(()=>window.transitionFrames);
    assert.equal(await page.locator('.story-column-divider').count(),0);
    assert.equal(await page.locator('.is-moving-divider').count(),0);
    if (mode==='normal') {
      const start=await page.evaluate(()=>window.dividerStart);
      const end=await page.locator('.col-editorial').evaluate(el=>el.getBoundingClientRect().right-.5);
      assert.ok(start>end, 'Divider must move left for the larger diagram column');
      assert.ok(frames.some(f=>f.dividerX<start-2 && f.dividerX>end+2), 'Divider must pass through intermediate positions');
      for(let i=1;i<frames.length;i++) {
        assert.ok(frames[i].dividerX<=frames[i-1].dividerX+.5, 'Divider must not jump backwards');
        assert.ok(Math.abs(frames[i].dividerX-frames[i-1].dividerX)<(start-end)*.4, 'Divider must not snap to its destination');
      }
      assert.ok(frames.filter(f=>f.dividerCount).every(f=>f.dividerCount===1 && f.nativeBorderHidden), 'Show exactly one border during the carry');
      assert.ok(Math.abs(frames.at(-1).dividerX-end)<1, 'Divider must meet the final native border');
    }
    assert.ok(frames.every(f=>!f.overflow && f.clouds===1 && f.delivery===1 && f.events===1 && f.columnOverflow<=1 && f.invalidNodes.length===0),JSON.stringify(frames.find(f=>f.overflow||f.clouds!==1||f.delivery!==1||f.events!==1||f.columnOverflow>1||f.invalidNodes.length)));
    // The same four contextual modals must still work on the real carried nodes.
    for (const key of ['eventbridge','order-event','plan-delivery','dynamodb','planning-request']) {
      await page.locator(`[data-inspector="${key}"]`).click();
      assert.equal(await page.locator('#drawerTitle').innerText(),SLIDE_6_INSPECTORS[key].service);
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#inspectorDrawer').classList.contains('active'));
    }
    console.log(`5 → 6 ${mode}: same cloud/logo/event/task, title, section, modals, cleanup; ${frames.length} frames without duplicates or overflow`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.presentation.goToSlide(4,false));
  await page.evaluate(()=>window.presentation.goToSlide(5));
  assert.equal(await page.locator('.story-cloud-carry').count(),0);
  assert.equal(await page.evaluate(()=>window.presentation.isAnimating),false);
  await page.evaluate(()=>window.presentation.goToSlide(6,false));
  assert.equal(await page.locator('.story-cloud-carry').count(),0);
  await page.evaluate(()=>window.presentation.goToSlide(5,false));
  await page.evaluate(()=>window.presentation.goToSlide(4,false));
  assert.equal(await page.locator('.routing-rule').count(),2);
  assert.deepEqual(errors,[]);
  console.log('Reduced motion, slide exit/re-entry, previous slide restoration and runtime/resource checks passed');
} finally {
  await browser.close();
}
