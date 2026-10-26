import gsap from 'gsap';
import { SLIDES } from './data/slides.js';
import { INSPECTOR_DATA, SLIDE_INSPECTORS } from './data/inspectors.js';
import { renderSlideDiagram, animateSlideDiagram } from './slides/diagrams.js';

// Shared header choreography for 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13. Keep the frame visible;
// roll changing text and carry pill positions using compositor transforms.
function createEditorialHeaderMotion(root, slide) {
  const top = root.querySelector('.editorial-top-section');
  const oldPart = top.querySelector('.act-badge > span').textContent;
  const newPart = slide.act.split(':')[0] + ':';
  let finalMarkup;
  const wrap = element => {
    const clip = document.createElement('span');
    clip.className = 'header-text-mask';
    const word = document.createElement('span');
    word.className = 'header-moving-text';
    word.textContent = element.textContent;
    clip.append(word);
    element.replaceChildren(clip);
  };
  const prepare = () => {
    top.classList.add('header-motion');
    const title = top.querySelector('.slide-headline');
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    title.replaceChildren(...text.split(' ').flatMap((word, i) => {
      const clip = document.createElement('span');
      clip.className = 'header-text-mask';
      clip.setAttribute('aria-hidden', 'true');
      const item = document.createElement('span');
      item.className = 'header-moving-text';
      item.textContent = word;
      clip.append(item);
      return i ? [document.createTextNode(' '), clip] : [clip];
    }));
    top.querySelectorAll('.service-pill').forEach(wrap);
    if (oldPart !== newPart) wrap(top.querySelector('.act-badge > span'));
  };
  prepare();
  const oldAct = top.querySelector('.act-badge').getBoundingClientRect();
  const oldPills = [...top.querySelectorAll('.service-pill')].map(pill => pill.getBoundingClientRect());
  const changingText = () => top.querySelectorAll('.section-step > span, .story-act-label, .act-badge > span .header-moving-text');
  return {
    exit(timeline) {
      timeline.to(top.querySelectorAll('.slide-headline .header-moving-text'), { yPercent: -115, duration: .22, stagger: .015, ease: 'power2.in' }, 0)
        .to(changingText(), { yPercent: -115, duration: .24, ease: 'power2.in' }, .02)
        .to(top.querySelectorAll('.service-pill .header-moving-text'), { yPercent: -115, duration: .22, stagger: .025, ease: 'power2.in' }, 0);
    },
    mount() {
      const destination = root.querySelector('.editorial-top-section');
      finalMarkup = destination.innerHTML;
      top.innerHTML = finalMarkup;
      destination.replaceWith(top);
      prepare();
      gsap.set(top.querySelectorAll('.header-moving-text'), { yPercent: 115 });
      gsap.set(changingText(), { yPercent: 115 });
      const act = top.querySelector('.act-badge');
      const actEnd = act.getBoundingClientRect();
      gsap.set(act, { x: oldAct.left - actEnd.left, y: oldAct.top - actEnd.top });
      top.querySelectorAll('.service-pill').forEach((pill, i) => {
        const end = pill.getBoundingClientRect();
        const start = oldPills[i];
        const ratio = start.width / end.width;
        gsap.set(pill, { x: start.left - end.left, y: start.top - end.top, scaleX: ratio, transformOrigin: 'left top' });
        // Counter-scale the text while its pill frame changes width.
        gsap.set(pill.firstElementChild, { scaleX: 1 / ratio, transformOrigin: 'left top' });
      });
    },
    reveal(timeline) {
      timeline.to(changingText(), { yPercent: 0, duration: .5, stagger: .035, ease: 'power3.out' }, .02)
        .to(top.querySelector('.act-badge'), { x: 0, y: 0, duration: .6, ease: 'power3.inOut' }, 0)
        .to(top.querySelectorAll('.slide-headline .header-moving-text'), { yPercent: 0, duration: .6, stagger: .035, ease: 'power3.out' }, slide.id === 10 ? .45 : .06)
        .to(top.querySelectorAll('.service-pill'), { x: 0, y: 0, scaleX: 1, duration: .6, stagger: .035, ease: 'power3.inOut' }, .08)
        .to(top.querySelectorAll('.service-pill > .header-text-mask'), { scaleX: 1, duration: .6, stagger: .035, ease: 'power3.inOut' }, .08)
        .to(top.querySelectorAll('.service-pill .header-moving-text'), { yPercent: 0, duration: .5, stagger: .055, ease: 'power3.out' }, .3);
    },
    finish() {
      if (finalMarkup) top.innerHTML = finalMarkup;
      top.classList.remove('header-motion');
    },
  };
}

class PresentationApp {
  constructor() {
    this.slides = SLIDES;
    this.currentIndex = 0;
    this.isAnimating = false;
    this.appEl = document.getElementById('app');
    
    this.init();
  }

  init() {
    this.renderShell();
    this.bindEvents();
    this.showStartPage();
  }

  showStartPage() {
    this.isWaitingToStart = true;
    this.appEl.classList.add('is-waiting');
    this.stageEl.innerHTML = `
      <section class="start-page" lang="en" aria-label="Start presentation">
        <div class="start-brand"><img src="/assets/01-aws-core-logos/aws-logo.svg" alt="Amazon Web Services" width="120" height="72" /></div>
        <button class="start-button" type="button">Start presentation</button>
      </section>`;
    const start = this.stageEl.querySelector('.start-button');
    start.addEventListener('click', () => {
      const logo = this.stageEl.querySelector('.start-brand img');
      if (logo) {
        this.pendingStartLogoRect = logo.getBoundingClientRect();
      }
      this.goToSlide(0, false);
      const opening = this.stageEl.querySelector('.slide-opening-wrapper');
      opening.querySelector(opening.classList.contains('is-playing') ? '.opening-skip' : '.opening-replay').focus({ preventScroll: true });
    });
    start.focus({ preventScroll: true });
  }

  renderShell() {
    this.appEl.innerHTML = `
      <!-- Header Bar -->
      <header class="app-header">
        <div class="header-left">
          <span class="header-aws-slot" aria-hidden="true"></span>
          <span class="header-title">Designing a Serverless Architecture with Event-Driven Microservices</span>
        </div>
        <div class="header-right">
          <span class="slide-counter font-mono" id="slideCounter">01 / ${this.slides.length}</span>
          <button class="btn-icon" id="btnFullscreen" title="Toggle Fullscreen (F)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </header>

      <img id="sharedAwsLogo" class="shared-aws-logo" src="/assets/01-aws-core-logos/aws-logo.svg" alt="Amazon Web Services" />

      <!-- Main Stage Container -->
      <main class="presentation-stage" id="presentationStage">
        <!-- Slide content dynamically rendered here -->
      </main>

      <!-- Bottom Navigation Footer -->
      <footer class="app-footer">
        <div class="footer-left">
          <span class="keyboard-hint font-mono">Use <kbd>→</kbd> <kbd>←</kbd> <kbd>Space</kbd> to navigate</span>
        </div>
        <div class="footer-center">
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="progressFill"></div>
          </div>
        </div>
        <div class="footer-right">
          <label class="slide-jump">
            <span class="font-mono">Jump to</span>
            <select id="slideJump" aria-label="Jump to slide without animation">
              ${this.slides.map((slide, index) => `<option value="${index}">${String(slide.id).padStart(2, '0')} · ${slide.title}</option>`).join('')}
            </select>
          </label>
          <button class="nav-btn" id="btnPrev" title="Previous Slide (←)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="nav-btn" id="btnNext" title="Next Slide (→)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </footer>

      <!-- Node Inspector Drawer (Right Side) -->
      <aside class="inspector-drawer" id="inspectorDrawer" inert>
        <div class="drawer-header">
          <div class="drawer-service-info">
            <span class="drawer-pill" id="drawerCategory">Service Details</span>
            <h3 class="drawer-title" id="drawerTitle">Amazon EventBridge</h3>
          </div>
          <button class="drawer-close-btn" id="drawerCloseBtn" title="Close Drawer (Esc)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="drawer-body" tabindex="0" role="region" aria-label="Service explanation">
          <div class="spec-group" id="drawerSlaGroup">
            <span class="spec-label">Service SLA</span>
            <span class="spec-value font-mono" id="drawerSla">99.99%</span>
          </div>
          <div class="spec-group">
            <span class="spec-label" id="drawerRoleLabel">Architectural Role</span>
            <p class="spec-description" id="drawerRole">-</p>
          </div>
          <div class="drawer-context-details" id="drawerContextDetails" hidden></div>
          <div class="code-preview-container" id="drawerCodePreview">
            <div class="code-header">
              <span class="code-title font-mono" id="drawerCodeTitle">Payload Preview</span>
              <span class="code-badge font-mono" id="drawerCodeType">JSON</span>
            </div>
            <pre class="code-content"><code class="font-mono" id="drawerCodeContent"></code></pre>
          </div>
        </div>
      </aside>
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
    `;

    this.stageEl = document.getElementById('presentationStage');
    this.counterEl = document.getElementById('slideCounter');
    this.progressFillEl = document.getElementById('progressFill');
    this.drawerEl = document.getElementById('inspectorDrawer');
    this.backdropEl = document.getElementById('drawerBackdrop');
  }

  bindEvents() {
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.target.closest?.('.slide-jump')) return;
      if (this.isWaitingToStart) {
        if (e.key.toLowerCase() === 'f') this.toggleFullscreen();
        return; // Let the native Start button handle Enter and Space.
      }
      if (this.drawerEl.classList.contains('active')) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const close = document.getElementById('drawerCloseBtn');
          const reading = this.drawerEl.querySelector('.drawer-body');
          (document.activeElement === close ? reading : close).focus({ preventScroll: true });
        }
        if (e.key === 'Escape') { e.preventDefault(); this.closeDrawer(); }
        return;
      }
      if (e.key === ' ' && e.target.closest?.('.opening-replay, .opening-skip')) return;
      const node = e.target.closest?.('.inspectable-node[role="button"]');
      if (node && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.openInspector(node.dataset.node, node);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape') {
        this.closeDrawer();
      }
    });

    window.addEventListener('resize', () => this.positionAwsLogo(this.slides[this.currentIndex], false));

    document.getElementById('slideJump').addEventListener('change', e => this.jumpToSlide(Number(e.target.value)));

    // Buttons
    document.getElementById('btnNext').addEventListener('click', () => this.nextSlide());
    document.getElementById('btnPrev').addEventListener('click', () => this.prevSlide());
    document.getElementById('btnFullscreen').addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('drawerCloseBtn').addEventListener('click', () => this.closeDrawer());
    this.backdropEl.addEventListener('click', () => this.closeDrawer());

    // Event delegation for inspectable nodes (both in Stage diagram & Left Editorial Column)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.inspectable-node');
      if (target) {
        const nodeId = target.dataset.node;
        this.openInspector(nodeId, target);
      }
    });
  }

  jumpToSlide(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.slides.length) return;
    // Finish carried elements before replacing their DOM, even mid-transition.
    gsap.killTweensOf(this.stageEl);
    this.slideCleanup?.();
    this.slideCleanup = null;
    gsap.killTweensOf(this.stageEl.querySelectorAll('*'));
    gsap.set(this.stageEl, { opacity: 1, y: 0 });
    this.isAnimating = false;
    this.goToSlide(index, false, true);
  }

  goToSlide(index, animate = true, skipEntrance = false) {
    if (index < 0 || index >= this.slides.length || this.isAnimating) return;
    this.isWaitingToStart = false;
    this.appEl.classList.remove('is-waiting');
    this.isAnimating = true;

    const storyTransition = animate && this.currentIndex === 1 && index === 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const eventTransition = animate && this.currentIndex === 2 && index === 3 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const taskTransition = animate && ((this.currentIndex === 4 && index === 5) || (this.currentIndex === 5 && index === 6) || (this.currentIndex === 6 && index === 7) || (this.currentIndex === 7 && index === 8) || (this.currentIndex === 8 && index === 9) || (this.currentIndex === 9 && index === 10) || (this.currentIndex === 10 && index === 11) || (this.currentIndex === 11 && index === 12) || (this.currentIndex === 12 && index === 13) || (this.currentIndex === 13 && index === 14) || (this.currentIndex === 14 && index === 15)) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const routingTransition = animate && this.currentIndex === 3 && index === 4 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const logoFirst = animate && this.currentIndex === 0 && index === 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (logoFirst) {
      // Preserve the orbit logo's exact pose while the opening fades away.
      this.slideCleanup?.();
      this.slideCleanup = null;
      const source = this.stageEl.querySelector('.opening-orbit-logo');
      const rect = source.getBoundingClientRect();
      this.stageEl.querySelector('.opening-aws-logo-slot').classList.add('is-handoff-source');
      gsap.set('#sharedAwsLogo', { x: rect.left, y: rect.top, scale: rect.width / 88, opacity: 1 });
      source.style.visibility = 'hidden';
    }
    this.currentIndex = index;
    document.getElementById('slideJump').value = String(index);
    const slide = this.slides[index];

    // Update UI Indicators
    this.counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(this.slides.length).padStart(2, '0')}`;
    const progressPercent = ((index + 1) / this.slides.length) * 100;
    this.progressFillEl.style.width = `${progressPercent}%`;

    // Render Slide Template
    const slideHtml = this.generateSlideHtml(slide);

    if (taskTransition) {
      this.transitionToTask(slide, slideHtml);
      return;
    }

    if (routingTransition) {
      this.transitionToRouting(slide, slideHtml);
      return;
    }

    if (eventTransition) {
      this.transitionToEvents(slide, slideHtml);
      return;
    }

    if (storyTransition) {
      this.transitionToDesignComparison(slide, slideHtml);
      return;
    }

    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(this.stageEl, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          this.slideCleanup?.();
          this.stageEl.innerHTML = slideHtml;
          if (logoFirst) {
            gsap.set(this.stageEl, { opacity: 1, y: 0 });
            this.revealSlide02(slide);
            return;
          }
          this.postRenderSlide(slide);
          gsap.fromTo(this.stageEl, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.45, 
              ease: 'power3.out',
              onComplete: () => {
                this.isAnimating = false;
              }
            }
          );
        }
      });
    } else {
      this.slideCleanup?.();
      this.stageEl.innerHTML = slideHtml;
      this.postRenderSlide(slide, !skipEntrance);
      this.isAnimating = false;
    }
  }

  generateSlideHtml(slide) {
    // Custom layout for Opening Slide (Slide 01)
    if (slide.type === 'OPENING') {
      return renderSlideDiagram(slide.id);
    }

    // Custom layout for Closing Slide (Slide 17)
    if (slide.type === 'CLOSING') {
      return renderSlideDiagram(slide.id);
    }

    // Shared editorial layout: narrative beside the architecture graph.
    return `
      <div class="slide-editorial-layout${slide.id >= 2 ? ' slide-context' : ''}${slide.id >= 7 ? ' slide-content-review' : ''}${slide.id === 6 ? ' slide-lambda-task' : ''}${slide.id === 8 ? ' slide-compute-choices' : ''}${slide.id === 10 ? ' slide-notifications' : ''}${slide.id === 11 ? ' slide-access' : ''}${slide.id === 12 ? ' slide-task-access' : ''}" lang="en">
        <!-- Left Editorial Column -->
        <div class="col-editorial">
          <div class="editorial-top-section">
            <div class="editorial-header">
              <span class="section-indicator font-mono">— ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(slide.id) ? `SECTION <span class="section-step"><span>${String(slide.id).padStart(2, '0')}</span></span>` : slide.section}</span>
              <span class="act-badge font-mono">${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(slide.id) ? `<span>${slide.act.split(':')[0]}:</span><span class="story-word-mask"><span class="story-act-label">${slide.act.replace(/^PART (?:I{1,3}|IV): /, '')}</span></span>` : slide.act}</span>
            </div>
            ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(slide.id) ? '<div class="headline-reveal-mask">' : ''}<h2 class="slide-headline font-serif">${slide.title}</h2>${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(slide.id) ? '</div>' : ''}
            
            <div class="pills-row">
              ${(slide.pills || []).map(pill => `<span class="service-pill">${pill}</span>`).join('')}
            </div>
          </div>
          <div class="editorial-body-section">
            ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(slide.id) ? `<div class="slide-narrative">${slide.summary.split('\n').map(text => `<p>${text}</p>`).join('')}</div>` : `<p class="slide-narrative">${slide.summary}</p>`}
            <div class="bullet-points-container">
              ${(slide.points || []).map(pt => {
                if (typeof pt === 'object' && pt !== null && pt.statement) {
                  return `
                    <div class="point-row statement-kpi-row">
                      <span class="point-bullet-dot"></span>
                      <div class="point-content-box">
                        <span class="point-statement-line font-sans">${pt.statement}</span>
                        ${pt.description ? `<p class="point-description">${pt.description}</p>` : ''}
                        ${pt.kpi ? `<span class="point-kpi-pill font-mono"><strong class="kpi-label">KPI</strong> ${pt.kpi}</span>` : ''}
                      </div>
                    </div>
                  `;
                }
                const cleanText = typeof pt === 'string' ? pt.replace(/^[✦•\-\*]\s*/, '') : String(pt);
                return `
                  <div class="point-row">
                    <span class="point-bullet-dot"></span>
                    <span class="point-text font-sans">${cleanText}</span>
                  </div>
                `;
              }).join('')}
            </div>
            ${slide.graphContext ? `<section class="graph-context-note"><h3>${slide.graphContextTitle || 'From business goals to service choices'}</h3><p>${slide.graphContext}</p></section>` : ''}
          </div>
          <div class="editorial-footer font-mono">
            <span>${slide.metadata || 'AWS Enterprise Architecture'}</span>
          </div>
        </div>

        <!-- Right AWS Architecture Stage -->
        <div class="col-stage">
          <div class="aws-stage-inner" id="stageInner">
            ${renderSlideDiagram(slide.id)}
          </div>
        </div>
      </div>
    `;
  }

  transitionToDesignComparison(slide, slideHtml) {
    const root = this.stageEl;
    const source = root.querySelector('[data-node="apigateway"] image');
    const start = source.getBoundingClientRect();
    const cloud = root.querySelector('.aws-cloud-boundary');
    const cloudStart = cloud.getScreenCTM();
    const cloudOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    cloudOverlay.setAttribute('class', 'story-cloud-carry service-graph graph-context');
    cloudOverlay.setAttribute('aria-hidden', 'true');
    cloudOverlay.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    document.body.append(cloudOverlay);
    cloudOverlay.append(cloud);
    cloud.removeAttribute('transform');
    gsap.set(cloud, { x: cloudStart.e, y: cloudStart.f, scale: cloudStart.a, svgOrigin: '0 0' });
    let cloudDestination;
    let cloudTransform;
    const header = root.querySelector('.editorial-header');
    const pills = root.querySelector('.pills-row');
    const headerStart = header.getBoundingClientRect();
    const pillsStart = pills.getBoundingClientRect();
    const changingPills = [...pills.children].slice(0, 2);
    changingPills.forEach(pill => {
      const mask = document.createElement('span');
      mask.className = 'story-word-mask';
      const word = document.createElement('span');
      word.className = 'story-word';
      word.textContent = pill.textContent;
      mask.append(word);
      pill.replaceChildren(mask);
    });
    // Carry the same API icon into the comparison, keeping the AWS header anchored.
    const carry = document.createElement('img');
    carry.src = source.getAttribute('href');
    carry.className = 'story-service-carry';
    carry.alt = '';
    carry.setAttribute('aria-hidden', 'true');
    carry.width = start.width;
    carry.height = start.height;
    document.body.append(carry);
    gsap.set(carry, { x: start.left, y: start.top, transformOrigin: 'top left' });
    source.style.visibility = 'hidden';
    this.slideCleanup?.();
    root.inert = true;
    root.classList.add('is-revealing');
    const timeline = gsap.timeline();
    const finish = () => {
      if (cloudDestination?.isConnected) {
        gsap.set(cloud, { clearProps: 'all' });
        cloud.removeAttribute('data-svg-origin');
        cloud.setAttribute('transform', cloudTransform);
        cloudDestination.replaceWith(cloud);
      }
      cloudOverlay.remove();
      carry.remove();
      root.inert = false;
      root.classList.remove('is-revealing');
    };
    timeline.to(root.querySelectorAll('.slide-headline, .editorial-body-section, .editorial-footer, .diagram-container'), {
      opacity: 0, duration: .3, ease: 'power2.in',
    }).to(header.querySelectorAll('.section-step > span, .story-act-label'), { yPercent: -110, duration: .3, ease: 'power2.in' }, 0)
      .to(pills.querySelectorAll('.story-word'), { yPercent: -110, duration: .3, stagger: .04, ease: 'power2.in' }, 0)
      .add(() => {
      root.innerHTML = slideHtml;
      this.positionAwsLogo(slide, false);
      const select = selector => root.querySelectorAll(selector);
      cloudDestination = root.querySelector('.aws-cloud-boundary');
      const cloudEnd = cloudDestination.getScreenCTM();
      const cloudRect = cloudDestination.querySelector('rect');
      cloudTransform = cloudDestination.getAttribute('transform');
      cloudDestination.style.visibility = 'hidden';
      const newHeader = root.querySelector('.editorial-header');
      const newPills = root.querySelector('.pills-row');
      const headerEnd = newHeader.getBoundingClientRect();
      const pillsEnd = newPills.getBoundingClientRect();
      header.querySelector('.section-step > span').textContent = '03';
      header.querySelector('.story-act-label').textContent = slide.act.replace(/^PART I{1,3}: /, '');
      changingPills.forEach((pill, i) => { pill.querySelector('.story-word').textContent = slide.pills[i]; });
      newHeader.replaceWith(header);
      newPills.replaceWith(pills);
      gsap.set(header, { x: headerStart.left - headerEnd.left, y: headerStart.top - headerEnd.top });
      gsap.set(pills, { x: pillsStart.left - pillsEnd.left, y: pillsStart.top - pillsEnd.top });
      gsap.set(header.querySelectorAll('.section-step > span, .story-act-label'), { yPercent: 110 });
      gsap.set(pills.querySelectorAll('.story-word'), { yPercent: 110 });
      const title = root.querySelector('.slide-headline');
      title.setAttribute('aria-label', slide.title);
      title.replaceChildren(...slide.title.split(' ').map((text, index) => {
        const mask = document.createElement('span');
        mask.className = 'story-word-mask';
        mask.setAttribute('aria-hidden', 'true');
        const word = document.createElement('span');
        word.className = 'story-title-word';
        word.textContent = text;
        mask.append(word);
        const space = document.createTextNode(index < slide.title.split(' ').length - 1 ? ' ' : '');
        return [mask, space];
      }).flat());
      gsap.set(title.querySelectorAll('.story-title-word'), { yPercent: 110 });
      const destination = root.querySelector('[data-node="apigateway"] image');
      const end = destination.getBoundingClientRect();
      destination.style.visibility = 'hidden';
      const nodes = [...select('.graph-node')];
      const links = [...select('.graph-link')];
      const headings = [...select('.graph-group-label')];
      gsap.set(select('.slide-narrative, .point-row, .graph-context-note, .editorial-footer'), { opacity: 0, y: 10 });
      gsap.set([...nodes, ...links, ...headings, ...select('.comparison-task, .shared-app-boundary, .comparison-note')], { opacity: 0 });
      gsap.set(select('.comparison-divider'), { opacity: 0, attr: { 'stroke-dasharray': 690, 'stroke-dashoffset': 690 } });
      const reveal = gsap.timeline({ onComplete: () => { finish(); this.isAnimating = false; } });
      reveal.to(cloud, { x: cloudEnd.e, y: cloudEnd.f, scale: cloudEnd.a, duration: 1.1, ease: 'power3.inOut' }, 0)
        .to(cloud.querySelector('rect'), { attr: { width: cloudRect.getAttribute('width'), height: cloudRect.getAttribute('height') }, duration: 1.1, ease: 'power3.inOut' }, 0)
        .to(select('.comparison-task, .shared-app-boundary'), { opacity: 1, duration: .4 }, .3)
        .to(select('.comparison-divider'), { opacity: 1, attr: { 'stroke-dashoffset': 0 }, duration: .75, ease: 'power2.inOut' }, .55)
        .to([...select('.comparison-note')].slice(0, 2), { opacity: 1, duration: .4 }, .6)
        .to([...select('.comparison-note')].slice(2), { opacity: 1, duration: .4 }, 1.3)
        .to([header, pills], { x: 0, y: 0, duration: .7, ease: 'power3.inOut' }, 0)
        .to(header.querySelectorAll('.section-step > span, .story-act-label'), { yPercent: 0, duration: .55, stagger: .06, ease: 'power3.out' }, .05)
        .to(title.querySelectorAll('.story-title-word'), { yPercent: 0, duration: .65, stagger: .08, ease: 'power3.out' }, .12)
        .to(pills.querySelectorAll('.story-word'), { yPercent: 0, duration: .6, stagger: .08, ease: 'power3.out' }, .25)
        .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }, .3)
        .to(headings[0], { opacity: 1, duration: .35 }, .2)
        .to(nodes.slice(0, 3), { opacity: 1, duration: .4, stagger: .09 }, .3)
        .to(links.slice(0, 2), { opacity: 1, duration: .35, stagger: .1 }, .4)
        .to(select('.point-row'), { opacity: 1, y: 0, duration: .45, stagger: .13, ease: 'power3.out' }, .4)
        .to(carry, { x: end.left, y: end.top, scale: end.width / start.width, duration: 1.05, ease: 'power3.inOut' }, .45)
        .to(headings[1], { opacity: 1, duration: .4 }, .75)
        .to(nodes.slice(3), { opacity: 1, duration: .4, stagger: .12 }, .85)
        .to(links.slice(2), { opacity: 1, duration: .4, stagger: .12 }, 1.02)
        .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, y: 0, duration: .4 }, 1.2)
        .set(destination, { visibility: 'visible' }, 1.5)
        .set(carry, { opacity: 0 }, 1.5);
      this.slideCleanup = () => { reveal.kill(); finish(); };
    });
    this.slideCleanup = () => { timeline.kill(); finish(); };
  }

  transitionToEvents(slide, slideHtml) {
    const root = this.stageEl;
    this.slideCleanup?.();
    const headerMotion = createEditorialHeaderMotion(root, slide);
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.setAttribute('class', 'story-cloud-carry service-graph graph-context');
    overlay.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    overlay.setAttribute('aria-hidden', 'true');
    document.body.append(overlay);
    // Carry the existing cloud and all six nodes from the serverless row.
    const cloud = root.querySelector('.aws-cloud-boundary');
    const nodes = [...root.querySelectorAll('.graph-node')].slice(3);
    nodes.forEach(node => node.setAttribute('tabindex', '-1')); // Carries are visual only until the destination is ready.
    const carried = [cloud, ...nodes].map(element => {
      const matrix = element.getScreenCTM();
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      overlay.append(group);
      group.append(element);
      element.removeAttribute('transform');
      group.setAttribute('transform', `translate(${matrix.e} ${matrix.f}) scale(${matrix.a})`);
      return { element, group };
    });
    root.inert = true;
    root.classList.add('is-revealing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let destinations = [];
    let finished = false;
    let reveal;
    const finish = () => {
      if (finished) return;
      finished = true;
      headerMotion.finish();
      destinations.forEach(destination => { destination.style.visibility = ''; });
      if (destinations[0]?.isConnected) {
        cloud.setAttribute('transform', destinations[0].getAttribute('transform'));
        destinations[0].replaceWith(cloud);
      }
      overlay.remove();
      root.inert = false;
      root.classList.remove('is-revealing');
      reduced.removeEventListener('change', settle);
      window.removeEventListener('resize', settle);
      this.isAnimating = false;
    };
    const settle = () => { exit.progress(1); reveal?.progress(1); };
    const exit = gsap.timeline();
    headerMotion.exit(exit);
    exit.to(root.querySelectorAll('.editorial-body-section, .editorial-footer, .diagram-container'), {
      opacity: 0, y: -8, duration: .3, ease: 'power2.in',
    }, 0).add(() => {
      root.innerHTML = slideHtml;
      headerMotion.mount();
      this.positionAwsLogo(slide, false);
      const select = selector => root.querySelectorAll(selector);
      const allNodes = [...select('.graph-node')];
      const links = [...select('.graph-link')];
      destinations = [root.querySelector('.aws-cloud-boundary'), ...allNodes.slice(0, 6)];
      const poses = destinations.map(destination => destination.getScreenCTM());
      destinations.forEach(destination => { destination.style.visibility = 'hidden'; });
      gsap.set(select('.slide-narrative, .point-row, .graph-context-note'), { opacity: 0, y: 12 });
      gsap.set(select('.editorial-footer'), { opacity: 0 });
      gsap.set([...links, ...allNodes.slice(6), ...select('.graph-group-label, .comparison-note')], { opacity: 0 });
      reveal = gsap.timeline({ onComplete: finish });
      headerMotion.reveal(reveal);
      carried.forEach(({ group }, index) => {
        const end = poses[index];
        reveal.to(group, { attr: { transform: `translate(${end.e} ${end.f}) scale(${end.a})` }, duration: 1.1, ease: 'power3.inOut' }, index === 0 ? 0 : .08);
      });
      reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .5 }, .25)
        .to(select('.point-row'), { opacity: 1, y: 0, duration: .5, stagger: .3 }, .5)
        .to([...links.slice(0, 5), select('.graph-group-label')[0]], { opacity: 1, duration: .4 }, .95)
        .to(allNodes[6], { opacity: 1, duration: .6, ease: 'power3.out' }, 1.1)
        .to(links[5], { opacity: 1, duration: .4 }, 1.2)
        .to(select('.comparison-note'), { opacity: 1, duration: .4, stagger: .1 }, 1.35)
        .to(select('.graph-group-label')[1], { opacity: 1, duration: .4 }, 1.6)
        .to(links.slice(6), { opacity: 1, duration: .4, stagger: .18 }, 1.65)
        .to(allNodes.slice(7), { opacity: 1, duration: .5, stagger: .18 }, 1.75)
        .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, y: 0, duration: .4 }, 1.9);
    });
    reduced.addEventListener('change', settle);
    window.addEventListener('resize', settle);
    this.slideCleanup = () => { settle(); exit.kill(); reveal?.kill(); finish(); };
  }

  transitionToRouting(slide, slideHtml) {
    const root = this.stageEl;
    this.slideCleanup?.();
    const headerMotion = createEditorialHeaderMotion(root, slide);
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.setAttribute('class', 'story-cloud-carry service-graph graph-context');
    overlay.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    document.body.append(overlay);
    // Keep identities, not array positions: these are the same services and tasks.
    const selectors = ['.aws-cloud-boundary', '[data-inspector="stepfunctions"]',
      '[data-inspector="eventbridge"]', '[data-inspector="plan-delivery"]',
      '[data-inspector="update-sales-report"]'];
    const carried = selectors.map(selector => {
      const element = root.querySelector(selector);
      const pose = element.getScreenCTM();
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      overlay.append(group);
      group.append(element);
      element.removeAttribute('transform');
      element.setAttribute('tabindex', '-1');
      group.setAttribute('transform', `translate(${pose.e} ${pose.f}) scale(${pose.a})`);
      return { element, group };
    });
    root.inert = true;
    root.classList.add('is-revealing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let destinations = [];
    let finished = false;
    let reveal;
    const finish = () => {
      if (finished) return;
      finished = true;
      headerMotion.finish();
      destinations.forEach((destination, i) => {
        const element = carried[i].element;
        // Restore the real carried nodes with the destination's text and access data.
        [...element.attributes].forEach(attr => element.removeAttribute(attr.name));
        [...destination.attributes].forEach(attr => element.setAttribute(attr.name, attr.value));
        element.style.visibility = '';
        element.innerHTML = destination.innerHTML;
        destination.replaceWith(element);
      });
      gsap.set(root.querySelectorAll('.slide-narrative, .point-row, .graph-context-note, .editorial-footer, .routing-event, .routing-rule, .graph-link, .comparison-note, .graph-group-label'), { clearProps: 'all' });
      overlay.remove();
      root.inert = false;
      root.classList.remove('is-revealing');
      reduced.removeEventListener('change', settle);
      window.removeEventListener('resize', settle);
      this.isAnimating = false;
    };
    const settle = () => { exit.progress(1); reveal?.progress(1); };
    const exit = gsap.timeline();
    headerMotion.exit(exit);
    exit.to(root.querySelectorAll('.editorial-body-section, .editorial-footer, .diagram-container'), {
      opacity: 0, y: -8, duration: .25, ease: 'power2.in',
    }, 0).add(() => {
      root.innerHTML = slideHtml;
      headerMotion.mount();
      this.positionAwsLogo(slide, false);
      const select = selector => root.querySelectorAll(selector);
      destinations = selectors.map(selector => root.querySelector(selector));
      const poses = destinations.map(node => node.getScreenCTM());
      destinations.forEach(node => { node.style.visibility = 'hidden'; });
      const links = [...select('.graph-link')];
      const rules = [...select('.routing-rule')];
      gsap.set(select('.slide-narrative, .point-row, .graph-context-note'), { opacity: 0, y: 12 });
      gsap.set(select('.editorial-footer'), { opacity: 0 });
      gsap.set(select('.routing-event, .routing-rule'), { opacity: 0, x: -14 });
      gsap.set(select('.graph-link, .graph-group-label, .comparison-note'), { opacity: 0 });
      reveal = gsap.timeline({ onComplete: finish });
      headerMotion.reveal(reveal);
      carried.forEach(({group}, i) => {
        const pose = poses[i];
        reveal.to(group, { attr: { transform: `translate(${pose.e} ${pose.f}) scale(${pose.a})` }, duration: 1, ease: 'power3.inOut' }, 0);
      });
      const cloudRect = destinations[0].querySelector('rect');
      reveal.to(carried[0].element.querySelector('rect'), { attr: { width: cloudRect.getAttribute('width'), height: cloudRect.getAttribute('height') }, duration: 1, ease: 'power3.inOut' }, 0)
        .to(carried.slice(3).map(item => item.group), { opacity: .3, duration: .25 }, 0)
        .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .2)
        .add(() => carried.slice(1).forEach(({element}, i) => {
          element.querySelector('.graph-node-caption').textContent = destinations[i + 1].querySelector('.graph-node-caption').textContent;
        }), .55)
        .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .35 }, .65)
        .to(select('.routing-event'), { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, .65)
        .to(links.slice(0, 2), { opacity: 1, duration: .3, stagger: .1 }, .7)
        .to(select('.graph-group-label')[0], { opacity: 1, duration: .3 }, .65)
        .to(select('.graph-group-label')[1], { opacity: 1, duration: .3 }, 1.05)
        .to(rules, { opacity: 1, x: 0, duration: .5, stagger: .2, ease: 'power3.out' }, 1.05)
        .to(links.slice(2, 4), { opacity: 1, duration: .3, stagger: .2 }, 1.05)
        .to(select('.graph-group-label')[2], { opacity: 1, duration: .3 }, 1.5)
        .to(links.slice(4), { opacity: 1, duration: .3, stagger: .2 }, 1.5)
        .to(carried.slice(3).map(item => item.group), { opacity: 1, duration: .4, stagger: .2 }, 1.5)
        .to(select('.comparison-note, .graph-context-note, .editorial-footer'), { opacity: 1, y: 0, duration: .4 }, 1.8);
    });
    reduced.addEventListener('change', settle);
    window.addEventListener('resize', settle);
    this.slideCleanup = () => { settle(); exit.kill(); reveal?.kill(); finish(); };
  }

  transitionToTask(slide, slideHtml) {
    const api = slide.id === 7;
    const compute = slide.id === 8;
    const queue = slide.id === 9;
    const notifications = slide.id === 10;
    const access = slide.id === 11;
    const taskAccess = slide.id === 12;
    const workflow = slide.id === 13;
    const dataReview = slide.id === 14;
    const observability = slide.id === 15;
    const recap = slide.id === 16;
    const root = this.stageEl;
    this.slideCleanup?.();
    const headerMotion = createEditorialHeaderMotion(root, slide);
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.setAttribute('class', 'story-cloud-carry service-graph graph-context');
    overlay.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    document.body.append(overlay);
    const oldColumn = root.querySelector('.col-editorial').getBoundingClientRect();
    const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    divider.setAttribute('class', 'story-column-divider');
    divider.setAttribute('x1', oldColumn.right - .5);
    divider.setAttribute('x2', oldColumn.right - .5);
    divider.setAttribute('y1', oldColumn.top);
    divider.setAttribute('y2', oldColumn.bottom);
    overlay.append(divider);
    root.classList.add('is-moving-divider');
    const selectors = recap ? ['.aws-cloud-boundary', '[data-inspector="stepfunctions"]'] : (dataReview || observability) ? ['.aws-cloud-boundary'] : access ? ['.aws-cloud-boundary', '[data-node="stepfunctions"]', '[data-node="mobile"]'] : queue ? ['.aws-cloud-boundary', '[data-node="lambda"]'] : workflow ? ['.aws-cloud-boundary', '[data-node="eventbridge"]'] : (compute || notifications || taskAccess) ? ['.aws-cloud-boundary'] : api ? ['.aws-cloud-boundary', '[data-inspector="dynamodb"]'] : ['.aws-cloud-boundary', '[data-inspector="eventbridge"]',
      '[data-inspector="order-event"]', '[data-inspector="plan-delivery"]'];
    const carried = selectors.map(selector => {
      const element = root.querySelector(selector);
      const pose = element.getScreenCTM();
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      overlay.append(group);
      group.append(element);
      element.removeAttribute('transform');
      element.setAttribute('tabindex', '-1');
      group.setAttribute('transform', `translate(${pose.e} ${pose.f}) scale(${pose.a})`);
      return { element, group };
    });
    root.inert = true;
    root.classList.add('is-revealing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let destinations = [];
    let reveal;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      headerMotion.finish();
      destinations.forEach((destination, i) => {
        const element = carried[i].element;
        [...element.attributes].forEach(attr => element.removeAttribute(attr.name));
        [...destination.attributes].forEach(attr => element.setAttribute(attr.name, attr.value));
        element.style.visibility = '';
        element.innerHTML = destination.innerHTML;
        destination.replaceWith(element);
      });
      gsap.set(root.querySelectorAll('.slide-narrative, .point-row, .graph-context-note, .editorial-footer, .graph-link, .comparison-note, .graph-group-label, .delivery-output, .delivery-lookup'), { clearProps: 'all' });
      if (api || compute || queue || notifications || access || taskAccess || workflow || dataReview || observability || recap) gsap.set(root.querySelectorAll('.graph-node'), { clearProps: 'opacity' });
      if (taskAccess) gsap.set(root.querySelectorAll('.permission-panel, .permission-panel text, [data-node="iam"] > image, [data-node="iam"] > text, .graph-context-note > *, .editorial-footer > span'), { clearProps: 'all' });
      overlay.remove();
      root.classList.remove('is-moving-divider');
      root.inert = false;
      root.classList.remove('is-revealing');
      reduced.removeEventListener('change', settle);
      window.removeEventListener('resize', settle);
      this.isAnimating = false;
    };
    // Settle both phases, including a resize before the new DOM is rendered.
    const settle = () => { exit.progress(1); reveal?.progress(1); };
    const exit = gsap.timeline();
    headerMotion.exit(exit);
    exit.to(root.querySelectorAll('.editorial-body-section, .editorial-footer, .diagram-container'), { opacity: 0, duration: .24, ease: 'power2.in' }, 0)
      .add(() => {
        root.innerHTML = slideHtml;
        headerMotion.mount();
        this.positionAwsLogo(slide, false);
        const select = selector => root.querySelectorAll(selector);
        destinations = selectors.map(selector => root.querySelector(selector));
        const poses = destinations.map(node => node.getScreenCTM());
        destinations.forEach(node => { node.style.visibility = 'hidden'; });
        gsap.set(select('.slide-narrative, .point-row'), { opacity: 0, y: 12 });
        gsap.set(select('.graph-link, .comparison-note, .graph-group-label, .delivery-output, .delivery-lookup, .graph-context-note, .editorial-footer'), { opacity: 0 });
        reveal = gsap.timeline({ onComplete: finish });
        headerMotion.reveal(reveal);
        if (dataReview || observability) gsap.set(select('.graph-node'), { opacity: 0 });
        if (recap) gsap.set(select('.graph-node:not([data-inspector="stepfunctions"])'), { opacity: 0 });
        const column = root.querySelector('.col-editorial').getBoundingClientRect();
        // Carry the border with the diagram; keep the destination layout stable.
        reveal.to(divider, { attr: { x1: column.right - .5, x2: column.right - .5,
          y1: column.top, y2: column.bottom }, duration: .95, ease: 'power3.inOut' }, 0);
        carried.forEach(({ group }, i) => {
          const pose = poses[i];
          reveal.to(group, { attr: { transform: `translate(${pose.e} ${pose.f}) scale(${pose.a})` }, duration: .95, ease: 'power3.inOut' }, 0);
        });
        const cloudRect = destinations[0].querySelector('rect');
        reveal.to(carried[0].element.querySelector('rect'), { attr: {
          width: cloudRect.getAttribute('width'), height: cloudRect.getAttribute('height')
        }, duration: .95, ease: 'power3.inOut' }, 0);
        if (access) {
          // Carry the phone shape too; change its labels to explain the new role.
          const caption = carried[1].element.querySelector('.graph-node-caption');
          const nextCaption = destinations[1].querySelector('.graph-node-caption').textContent;
          const phoneLabels = carried[2].element.querySelectorAll('text');
          const nextPhoneLabels = destinations[2].querySelectorAll('text');
          gsap.set(select('.graph-node:not([data-node="stepfunctions"]):not([data-node="mobile"])'), { opacity: 0 });
          reveal.to(caption, { opacity: 0, duration: .18 }, 0)
            .add(() => { caption.textContent = nextCaption; }, .2)
            .to(caption, { opacity: 1, duration: .3 }, .6)
            .to(phoneLabels, { opacity: 0, duration: .18 }, 0)
            .add(() => phoneLabels.forEach((label, i) => {
              if (nextPhoneLabels[i]) label.textContent = nextPhoneLabels[i].textContent;
              else label.remove();
            }), .2)
            .to(phoneLabels[0], { opacity: 1, duration: .3 }, .6)
            .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .09 }, .3)
            .to(select('.graph-node:not([data-node="stepfunctions"]):not([data-node="mobile"])'), { opacity: 1, duration: .4, stagger: .08, ease: 'power3.out' }, .35)
            .to(select('.graph-group-label'), { opacity: 1, duration: .35, stagger: .1 }, .45)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .09 }, .65)
            .to(select('.comparison-note, .graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1);
          return;
        }
        if (taskAccess) {
          const panels = select('.permission-panel');
          const contextText = select('.graph-context-note > *, .editorial-footer > span');
          const roleParts = select('[data-node="iam"] > image, [data-node="iam"] > text');
          const runtimeNote = select('.comparison-note:not(.task-permissions)');
          // Reveal the policy frames first, then their contents in reading order.
          gsap.set(select('.graph-node:not([data-node="iam"])'), { opacity: 0 });
          gsap.set(select('.task-permissions, .graph-context-note, .editorial-footer'), { opacity: 1 });
          gsap.set(panels, { clipPath: 'inset(0 100% 0 0)' });
          gsap.set(select('.permission-panel text'), { y: 10, opacity: 0 });
          gsap.set(contextText, { clipPath: 'inset(0 0 100% 0)', y: 12 });
          gsap.set(roleParts, { y: 12, opacity: 0 });
          gsap.set(runtimeNote, { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .1 }, .3)
            .to(select('.graph-node:not([data-node="iam"])'), { opacity: 1, duration: .4, stagger: .08, ease: 'power3.out' }, .4)
            .to(select('.graph-group-label'), { opacity: 1, duration: .35 }, .45)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .08 }, .75)
            .to(panels, { clipPath: 'inset(0 0% 0 0)', duration: .55, stagger: .16, ease: 'power3.inOut' }, .65)
            .to(panels[0].querySelectorAll('text'), { y: 0, opacity: 1, duration: .4, stagger: .06, ease: 'power3.out' }, .88)
            .to(roleParts, { y: 0, opacity: 1, duration: .45, stagger: .04, ease: 'power3.out' }, 1.04)
            .to(panels[1].querySelectorAll('text'), { y: 0, opacity: 1, duration: .4, stagger: .06, ease: 'power3.out' }, 1.08)
            .to(contextText, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .5, stagger: .07, ease: 'power3.out' }, .82)
            .to(runtimeNote, { clipPath: 'inset(0 0% 0 0)', duration: .5, ease: 'power3.inOut' }, 1.24);
          return;
        }
        if (notifications) {
          // These views share only the cloud; new services enter after the old ones fade.
          gsap.set(select('.graph-node'), { opacity: 0 });
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .1 }, .3)
            .to(select('.graph-node'), { opacity: 1, duration: .4, stagger: .08, ease: 'power3.out' }, .4)
            .to(select('.graph-group-label'), { opacity: 1, duration: .35, stagger: .06 }, .45)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .08 }, .75)
            .to(select('.comparison-note, .graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1);
          return;
        }
        if (workflow) {
          gsap.set(select('.graph-node'), { opacity: 0 });
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .1 }, .3)
            .to(select('.graph-node'), { opacity: 1, duration: .45, stagger: .1, ease: 'power3.out' }, .4)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .08 }, .7)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1);
          return;
        }
        if (recap) {
          const labels = carried[1].element.querySelectorAll('text');
          const nextLabels = destinations[1].querySelectorAll('text');
          reveal.to(labels, { opacity: 0, duration: .16 }, .15)
            .add(() => labels.forEach((label, i) => { if (nextLabels[i]) label.textContent = nextLabels[i].textContent; }), .32)
            .to(labels, { opacity: 1, duration: .24 }, .42)
            .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .1 }, .3)
            .to(select('.graph-node:not([data-inspector="stepfunctions"])'), { opacity: 1, duration: .4, stagger: .055, ease: 'power3.out' }, .35)
            .to(select('.graph-group-label'), { opacity: 1, duration: .35, stagger: .06 }, .48)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .06 }, .72)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1.05);
          return;
        }
        if (dataReview) {
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .12 }, .3)
            .to(select('.graph-node'), { opacity: 1, duration: .45, stagger: .09, ease: 'power3.out' }, .4)
            .to(select('.graph-link'), { opacity: 1, duration: .35, stagger: .12 }, .72)
            .to(select('.comparison-note, .graph-group-label, .graph-context-note, .editorial-footer'), { opacity: 1, duration: .35, stagger: .05 }, .9);
          return;
        }
        if (observability) {
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4, ease: 'power3.out' }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .1, ease: 'power3.out' }, .28)
            .to(select('.graph-node'), { opacity: 1, duration: .38, stagger: .07, ease: 'power3.out' }, .28)
            .to(select('.graph-link'), { opacity: 1, duration: .3, stagger: .08, ease: 'power3.out' }, .58)
            .to(select('.graph-group-label'), { opacity: 1, duration: .3, ease: 'power3.out' }, .62)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35, ease: 'power3.out' }, .82);
          return;
        }
        if (queue) {
          // Keep the Lambda service icon; roll its task label from Check order to Plan delivery.
          const labels = carried[1].element.querySelectorAll('text');
          const targetLabels = destinations[1].querySelectorAll('text');
          gsap.set(select('.graph-node:not([data-node="lambda"])'), { opacity: 0 });
          reveal.to(labels, { opacity: 0, duration: .18 }, 0)
            .add(() => labels.forEach((label, i) => { label.textContent = targetLabels[i].textContent; }), .2)
            .to(labels, { opacity: 1, duration: .3 }, .65)
            .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .15)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .08 }, .35)
            .to(select('.graph-node:not([data-node="lambda"])'), { opacity: 1, duration: .4, stagger: .08 }, .45)
            .to(select('.graph-group-label, .comparison-note'), { opacity: 1, duration: .4, stagger: .035 }, .55)
            .to(select('.graph-link'), { opacity: 1, duration: .4, stagger: .08 }, .8)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1);
          return;
        }
        if (compute) {
          // No service is shared with slide 7; carry its cloud, then reveal each compute choice.
          gsap.set(select('.graph-node'), { opacity: 0 });
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .18)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .28 }, .45)
            .to(select('.graph-node'), { opacity: 1, duration: .5, stagger: .16, ease: 'power2.out' }, .45)
            .to(select('.graph-group-label'), { opacity: 1, duration: .4, stagger: .12 }, .6)
            .to(select('.comparison-note'), { opacity: 1, duration: .4, stagger: .065 }, .6)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1.35);
          return;
        }
        if (api) {
          // Carry the cloud and order database; fade in the new request path.
          gsap.set(select('.graph-node:not([data-inspector="dynamodb"])'), { opacity: 0 });
          reveal.to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .18)
            .to(select('.graph-node:not([data-inspector="dynamodb"])'), { opacity: 1, duration: .5, stagger: .12, ease: 'power3.out' }, .55)
            .to(select('.point-row'), { opacity: 1, y: 0, duration: .4, stagger: .2 }, .5)
            .to(select('.graph-link'), { opacity: 1, duration: .4, stagger: .18 }, .85)
            .to(select('.graph-group-label'), { opacity: 1, duration: .4, stagger: .12 }, 1.05)
            .to(select('.comparison-note'), { opacity: 1, duration: .4, stagger: .12 }, 1.2)
            .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1.5);
          return;
        }
        const eventText = [...carried[2].element.querySelectorAll('text')];
        const eventSummary = [...destinations[2].querySelectorAll('text')];
        reveal.to(eventText, { opacity: 0, duration: .2 }, .15)
          .add(() => {
            eventText.forEach((text, i) => {
              if (!eventSummary[i]) { text.remove(); return; }
              text.textContent = eventSummary[i].textContent;
              [...eventSummary[i].attributes].forEach(attr => text.setAttribute(attr.name, attr.value));
            });
          }, .4)
          .to(eventText.slice(0, eventSummary.length), { opacity: 1, duration: .35 }, .45);
        const lambda = carried[3].element;
        reveal.to(lambda.querySelector('image'), { attr: { x: -48, y: -48, width: 96, height: 96 }, duration: .95, ease: 'power3.inOut' }, 0)
          .to(lambda.querySelector('.graph-node-label'), { attr: { y: 73 }, duration: .95, ease: 'power3.inOut' }, 0)
          .to(lambda.querySelector('.graph-node-caption'), { attr: { y: 93 }, duration: .95, ease: 'power3.inOut' }, 0)
          .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: .4 }, .2)
          .add(() => { carried[1].element.querySelector('.graph-node-caption').textContent = 'Delivery rule matched'; }, .45)
          .to(select('.point-row')[0], { opacity: 1, y: 0, duration: .4 }, .55)
          .to(select('.graph-group-label')[0], { opacity: 1, duration: .3 }, .55)
          .to(select('.graph-link.event'), { opacity: 1, duration: .35, stagger: .2 }, .55)
          .to(select('.delivery-lookup'), { opacity: 1, duration: .4 }, 1)
          .to(select('.point-row')[1], { opacity: 1, y: 0, duration: .4 }, 1)
          .to(select('.graph-group-label')[1], { opacity: 1, duration: .3 }, 1)
          .to(select('.comparison-note'), { opacity: 1, duration: .35, stagger: .1 }, 1)
          .to(select('.point-row')[2], { opacity: 1, y: 0, duration: .4 }, 1.45)
          .to(select('.graph-link:not(.event), .delivery-output'), { opacity: 1, duration: .4, stagger: .15 }, 1.45)
          .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, duration: .35 }, 1.85);
      });
    reduced.addEventListener('change', settle);
    window.addEventListener('resize', settle);
    this.slideCleanup = () => { settle(); exit.kill(); reveal?.kill(); finish(); };
  }

  positionAwsLogo(slide, animate = true) {
    const logo = document.getElementById('sharedAwsLogo');
    const target = document.querySelector(slide.type === 'OPENING' ? '.opening-aws-logo-slot' : '.header-aws-slot');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const stageOffset = slide.type === 'OPENING' ? Number(gsap.getProperty(this.stageEl, 'y')) : 0;
    return gsap.to(logo, {
      x: rect.left, y: rect.top - stageOffset, scale: rect.width / 88, opacity: 1,
      duration: animate && slide.type !== 'OPENING' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1.35 : 0,
      ease: 'power3.inOut', overwrite: true,
    });
  }

  revealSlide02(slide) {
    const root = this.stageEl;
    const select = selector => root.querySelectorAll(selector);
    root.inert = true;
    root.classList.add('is-revealing');
    const timeline = gsap.timeline({ onComplete: () => {
      root.inert = false;
      root.classList.remove('is-revealing');
      this.isAnimating = false;
    } });
    gsap.set(select('.slide-editorial-layout'), { opacity: 0 });
    gsap.set(select('.editorial-header, .editorial-services-block, .pills-row, .slide-narrative, .point-row, .graph-context-note, .editorial-footer'), { opacity: 0, y: 12 });
    gsap.set(select('.slide-headline'), { yPercent: 110 });
    gsap.set(select('.diagram-container'), { opacity: 0, x: 18 });
    gsap.set(select('.graph-node, .graph-link'), { opacity: 0 });
    timeline.add(this.positionAwsLogo(slide), 0)
      .to(select('.slide-editorial-layout'), { opacity: 1, duration: 0.22 }, 1.5)
      .to(select('.editorial-header'), { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.53)
      .to(select('.slide-headline'), { yPercent: 0, duration: 0.65, ease: 'power3.out' }, 1.57)
      .to(select('.editorial-services-block, .pills-row'), { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out' }, 1.7)
      .to(select('.slide-narrative'), { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.87)
      .to(select('.point-row'), { opacity: 1, y: 0, duration: 0.45, stagger: 0.065, ease: 'power3.out' }, 1.98)
      .to(select('.graph-context-note, .editorial-footer'), { opacity: 1, y: 0, duration: 0.4 }, 2.25)
      .to(select('.diagram-container'), { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' }, 1.67)
      .to(select('.graph-node'), { opacity: 1, duration: 0.3, stagger: 0.1 }, 1.83)
      .to(select('.graph-link'), { opacity: 1, duration: 0.3, stagger: 0.1 }, 2.0);
    this.slideCleanup = () => {
      timeline.kill();
      root.inert = false;
      root.classList.remove('is-revealing');
    };
  }

  postRenderSlide(slide, animate = true) {
    this.positionAwsLogo(slide, animate);
    this.slideCleanup = animateSlideDiagram(slide.id, { startLogoRect: this.pendingStartLogoRect, skipAnimation: !animate });
    this.pendingStartLogoRect = null;
  }

  nextSlide() {
    if (this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  }

  openInspector(nodeId, trigger) {
    const slideId = this.slides[this.currentIndex].id;
    const overview = SLIDE_INSPECTORS[slideId]?.[trigger?.dataset.inspector || nodeId];
    const data = INSPECTOR_DATA[nodeId];
    if (!data && !overview) return;
    document.getElementById('drawerCategory').textContent = overview ? `Slide ${slideId} • How it works` : data.category;
    document.getElementById('drawerTitle').textContent = overview?.service || data.service;
    document.getElementById('drawerSlaGroup').hidden = Boolean(overview);
    document.getElementById('drawerCodePreview').hidden = Boolean(overview);
    document.getElementById('drawerRoleLabel').textContent = overview ? 'Role in this example' : 'Architectural Role';
    document.getElementById('drawerRole').textContent = overview?.role || data.role;
    const details = document.getElementById('drawerContextDetails');
    details.hidden = !overview;
    this.drawerEl.lang = 'en';
    document.getElementById('drawerCloseBtn').title = 'Close Drawer (Esc)';
    details.replaceChildren(...(overview?.sections || []).map(([title, text]) => {
      const section = document.createElement('section');
      const heading = document.createElement('h4');
      const paragraph = document.createElement('p');
      heading.textContent = title;
      paragraph.textContent = text;
      section.append(heading, paragraph);
      return section;
    }));
    document.getElementById('drawerSla').textContent = data?.sla || '';
    document.getElementById('drawerCodeTitle').textContent = data?.title || '';
    document.getElementById('drawerCodeType').textContent = (data?.codeType || '').toUpperCase();
    document.getElementById('drawerCodeContent').textContent = data?.code || '';
    this.inspectorTrigger = trigger || this.stageEl.querySelector(`.graph-node[data-node="${nodeId}"]`) || document.activeElement;

    if (overview) {
      this.drawerEl.setAttribute('role', 'dialog');
      this.drawerEl.setAttribute('aria-modal', 'true');
      this.drawerEl.setAttribute('aria-labelledby', 'drawerTitle');
      this.stageEl.inert = true;
      document.querySelector('.app-header').inert = true;
      document.querySelector('.app-footer').inert = true;
    }
    this.drawerEl.inert = false;
    this.backdropEl.classList.add('active');
    this.drawerEl.classList.add('active');
    document.getElementById('drawerCloseBtn').focus({ preventScroll: true });

    gsap.fromTo(this.drawerEl, 
      { x: '100%' }, 
      { x: '0%', duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.22, ease: 'power2.out', overwrite: true }
    );
  }

  closeDrawer() {
    gsap.to(this.drawerEl, {
      x: '100%',
      overwrite: true,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.18,
      ease: 'power2.in',
      onComplete: () => {
        this.drawerEl.inert = true;
        this.drawerEl.removeAttribute('role');
        this.drawerEl.removeAttribute('aria-modal');
        this.stageEl.inert = false;
        document.querySelector('.app-header').inert = false;
        document.querySelector('.app-footer').inert = false;
        this.drawerEl.classList.remove('active');
        this.backdropEl.classList.remove('active');
        if (this.inspectorTrigger?.isConnected) this.inspectorTrigger.focus({ preventScroll: true });
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}

// Instantiate presentation application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.presentation = new PresentationApp();
});
