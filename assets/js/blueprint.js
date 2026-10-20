/*!
 * LP-EE-2026 // Blueprint Motion & Interaction Engine — REV 10.0
 * Lee Parkinson · Electrical Engineering Blueprint Portfolio
 * GSAP 3 (ScrollTrigger, SplitText, ScrambleText, Flip, quickTo) · Lenis · React Bits
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 01. THEME & ACCENT CONTROLLER
  // ---------------------------------------------------------------------------
  const ThemeController = {
    init() {
      const savedTheme = localStorage.getItem('lp_theme') || 'blueprint';
      this.applyTheme(savedTheme);

      const savedAccent = localStorage.getItem('lp_accent') || 'blue';
      this.applyAccent(savedAccent);

      this.initThemeButtons();
      this.initAccentMenu();
    },

    applyTheme(theme) {
      const targetTheme = (theme === 'whiteprint') ? 'whiteprint' : 'blueprint';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('lp_theme', targetTheme);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', targetTheme === 'whiteprint' ? '#eef3f9' : '#030814');
      }

      document.querySelectorAll('[data-theme-set]').forEach((btn) => {
        const isMatch = btn.getAttribute('data-theme-set') === targetTheme;
        btn.classList.toggle('btn-primary', isMatch);
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      if (chromaEngine) chromaEngine.updateColors();
    },

    cycleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'blueprint';
      this.applyTheme(current === 'whiteprint' ? 'blueprint' : 'whiteprint');
    },

    initThemeButtons() {
      document.querySelectorAll('[data-theme-set]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          const targetTheme = btn.getAttribute('data-theme-set');
          this.applyTheme(targetTheme);
        });
      });
    },

    applyAccent(accent) {
      if (!accent || accent === 'blue') {
        document.documentElement.removeAttribute('data-accent');
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-rgb');
        document.documentElement.style.removeProperty('--accent-ink');
        localStorage.removeItem('lp_accent');
      } else if (accent.startsWith('custom:')) {
        const hex = accent.slice(7);
        document.documentElement.setAttribute('data-accent', 'custom');
        document.documentElement.style.setProperty('--accent', hex);
        const r = parseInt(hex.slice(1, 3), 16) || 56;
        const g = parseInt(hex.slice(3, 5), 16) || 189;
        const b = parseInt(hex.slice(5, 7), 16) || 248;
        document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        document.documentElement.style.setProperty('--accent-ink', lum > 0.6 ? '#030a16' : '#ffffff');
        localStorage.setItem('lp_accent', accent);
      } else {
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-rgb');
        document.documentElement.style.removeProperty('--accent-ink');
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem('lp_accent', accent);
      }

      document.querySelectorAll('[data-accent-swatch]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-accent-swatch') === accent);
      });
      const customInput = document.getElementById('accent-custom');
      if (customInput && accent.startsWith('custom:')) {
        customInput.value = accent.slice(7);
      }

      if (chromaEngine) chromaEngine.updateColors();
    },

    initAccentMenu() {
      const wrap = document.querySelector('.accent-menu-wrap');
      const toggleBtns = document.querySelectorAll('[data-accent-toggle]');
      if (!wrap || !toggleBtns.length) return;

      const toggle = (e) => {
        if (e) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        wrap.classList.toggle('is-open');
      };
      const close = () => wrap.classList.remove('is-open');

      toggleBtns.forEach(btn => btn.addEventListener('click', toggle));

      document.querySelectorAll('[data-accent-swatch]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          const acc = btn.getAttribute('data-accent-swatch');
          this.applyAccent(acc);
        });
      });

      const customInput = document.getElementById('accent-custom');
      if (customInput) {
        customInput.addEventListener('input', (e) => {
          this.applyAccent('custom:' + e.target.value);
        });
      }

      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 02. LENIS SMOOTH SCROLL + GSAP TICKER
  // ---------------------------------------------------------------------------
  let lenis = null;

  function initLenis() {
    if (typeof window.Lenis === 'undefined') return;

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    // On mobile devices, native touch momentum scrolling provides instant 120Hz response without lag
    if (isTouch && window.innerWidth < 960) {
      const meter = document.querySelector('.scroll-meter i');
      if (meter) {
        window.addEventListener('scroll', () => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          meter.style.transform = `scaleX(${p})`;
        }, { passive: true });
      }
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lenis = new window.Lenis({
      duration: prefersReducedMotion ? 0 : 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.95,
      autoResize: true,
      anchors: {
        offset: -72
      }
    });

    window.lenisInstance = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      lenis.on('scroll', window.ScrollTrigger.update);

      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      window.gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Header scroll progress bar
    const meter = document.querySelector('.scroll-meter i');
    if (meter) {
      lenis.on('scroll', (e) => {
        const progress = Math.min(1, Math.max(0, e.progress || (e.scroll / (document.documentElement.scrollHeight - window.innerHeight))));
        meter.style.transform = `scaleX(${progress})`;
      });
    }

    // Anchor links smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });

          // Close mobile drawer if open
          const drawer = document.querySelector('.drawer');
          const menuBtn = document.querySelector('.menu-btn');
          if (drawer && drawer.classList.contains('is-open')) {
            drawer.classList.remove('is-open');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 03. GSAP ANIMATIONS & SCROLLTRIGGER
  // ---------------------------------------------------------------------------
  function initGSAP() {
    if (typeof window.gsap === 'undefined') return;

    const gsap = window.gsap;
    const plugins = [];
    if (typeof window.ScrollTrigger !== 'undefined') plugins.push(window.ScrollTrigger);
    if (typeof window.SplitText !== 'undefined') plugins.push(window.SplitText);
    if (typeof window.ScrambleTextPlugin !== 'undefined') plugins.push(window.ScrambleTextPlugin);
    if (typeof window.Flip !== 'undefined') plugins.push(window.Flip);
    if (typeof window.ScrollToPlugin !== 'undefined') plugins.push(window.ScrollToPlugin);

    if (plugins.length) {
      gsap.registerPlugin(...plugins);
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 800px)',
        isMobile: '(max-width: 799px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;

        if (reduceMotion) {
          // If reduced motion, ensure all elements are visible
          gsap.set('[data-hero], .panel, .sheet-rule, .timeline-rail i', {
            opacity: 1,
            visibility: 'visible',
            clearProps: 'all'
          });
          return;
        }

        // --- HERO ENTRANCE TIMELINE ---
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Hero display title split text
        const heroTitle = document.querySelector('.hero-name');
        if (heroTitle && typeof window.SplitText !== 'undefined') {
          const split = new window.SplitText(heroTitle, { type: 'words, chars', charsClass: 'split-char' });
          heroTl.from(split.chars, {
            y: 40,
            opacity: 0,
            duration: 0.65,
            stagger: 0.02
          }, 0.1);
        } else if (heroTitle) {
          heroTl.from(heroTitle, { y: 30, opacity: 0, duration: 0.7 }, 0.1);
        }

        const heroRole = document.querySelector('.hero-role');
        if (heroRole) {
          heroTl.from(heroRole, { y: 20, opacity: 0, duration: 0.5 }, 0.35);
        }

        const statusPill = document.querySelector('.status-pill');
        if (statusPill) {
          heroTl.from(statusPill, { x: -20, opacity: 0, duration: 0.5 }, 0.2);
        }

        const heroPortrait = document.querySelector('.portrait .figure-frame');
        if (heroPortrait) {
          heroTl.from(heroPortrait, { scale: 0.94, opacity: 0, duration: 0.8 }, 0.25);
        }

        const heroDims = document.querySelectorAll('.portrait .dim');
        if (heroDims.length) {
          heroTl.from(heroDims, { opacity: 0, duration: 0.4, stagger: 0.1 }, 0.5);
        }

        const specTable = document.querySelector('.spec');
        if (specTable) {
          heroTl.from(specTable.children, { y: 15, opacity: 0, stagger: 0.05, duration: 0.4 }, 0.45);
        }

        const titleBlock = document.querySelector('.title-block');
        if (titleBlock) {
          heroTl.from(titleBlock.children, { y: 12, opacity: 0, stagger: 0.04, duration: 0.35 }, 0.6);
        }

        // --- SCROLLTRIGGER BATCH REVEALS FOR PANELS ---
        if (typeof window.ScrollTrigger !== 'undefined') {
          // Sheet rule dimension scaleX (smooth line reveal, once only)
          gsap.utils.toArray('.sheet-rule').forEach((rule) => {
            gsap.fromTo(rule, 
              { scaleX: 0 }, 
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: rule,
                  start: 'top 95%',
                  once: true
                }
              }
            );
          });

          // Experience timeline rail scrub
          const rail = document.querySelector('.timeline-rail i');
          const timelineSection = document.querySelector('.timeline');
          if (rail && timelineSection) {
            gsap.fromTo(rail,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: timelineSection,
                  start: 'top 75%',
                  end: 'bottom 85%',
                  scrub: true
                }
              }
            );
          }
        }
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 04. FOLDABLE / COLLAPSIBLE SHEETS (Compact Accordion Drawing Mode)
  // ---------------------------------------------------------------------------
  function initFoldableSheets() {
    const toggles = document.querySelectorAll('[data-sheet-toggle]');
    if (!toggles.length) return;

    toggles.forEach((header) => {
      const sectionId = header.getAttribute('data-sheet-toggle');
      const section = document.getElementById(sectionId) || header.closest('.section');
      if (!section) return;

      const toggleAction = (e) => {
        if (e && e.target && e.target.closest('a, button, input')) return;
        const isFolded = section.classList.toggle('is-folded');
        header.setAttribute('aria-expanded', !isFolded);
        const text = header.querySelector('.sheet-state-text');
        if (text) {
          text.textContent = isFolded ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]';
        }
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      };

      header.addEventListener('click', toggleAction);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAction(e);
        }
      });
    });

    // Toolbar: Fold All & Expand All
    const foldAllBtn = document.querySelector('[data-sheets-fold-all]');
    const expandAllBtn = document.querySelector('[data-sheets-expand-all]');

    const setAllSections = (expand) => {
      toggles.forEach((header) => {
        const sectionId = header.getAttribute('data-sheet-toggle');
        const section = document.getElementById(sectionId) || header.closest('.section');
        if (!section) return;
        if (expand) {
          section.classList.remove('is-folded');
          header.setAttribute('aria-expanded', 'true');
          const text = header.querySelector('.sheet-state-text');
          if (text) text.textContent = 'SHEET ACTIVE [−]';
        } else {
          section.classList.add('is-folded');
          header.setAttribute('aria-expanded', 'false');
          const text = header.querySelector('.sheet-state-text');
          if (text) text.textContent = 'SHEET FOLDED [+]';
        }
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    if (foldAllBtn) {
      foldAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setAllSections(false);
      });
    }
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setAllSections(true);
      });
    }

    const expandSectionById = (id) => {
      if (!id) return;
      const targetSec = document.getElementById(id);
      if (targetSec && targetSec.classList.contains('is-folded')) {
        targetSec.classList.remove('is-folded');
        const header = targetSec.querySelector('[data-sheet-toggle]');
        if (header) {
          header.setAttribute('aria-expanded', 'true');
          const text = header.querySelector('.sheet-state-text');
          if (text) text.textContent = 'SHEET ACTIVE [−]';
        }
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }
    };

    window.addEventListener('hashchange', () => {
      expandSectionById(window.location.hash.slice(1));
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        const hash = (link.getAttribute('href') || '').replace('#', '');
        expandSectionById(hash);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 05. REACT BITS — SPOTLIGHT CARDS
  // ---------------------------------------------------------------------------
  function initSpotlightCards() {
    const spotlights = document.querySelectorAll('.spotlight');
    if (!spotlights.length) return;

    spotlights.forEach((card) => {
      // Add spot and spot-edge layers if not present
      if (!card.querySelector('.spot')) {
        const spot = document.createElement('div');
        spot.className = 'spot';
        card.appendChild(spot);
      }
      if (!card.querySelector('.spot-edge')) {
        const spotEdge = document.createElement('div');
        spotEdge.className = 'spot-edge';
        card.appendChild(spotEdge);
      }

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x.toFixed(1)}px`);
        card.style.setProperty('--my', `${y.toFixed(1)}px`);
        card.style.setProperty('--spot', '1');
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--spot', '0');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 06. REACT BITS — TILTED CARDS (3D GLOSS)
  // ---------------------------------------------------------------------------
  function initTiltedCards() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.tilt');
    if (!cards.length) return;

    const maxTilt = 4.5;

    cards.forEach((card) => {
      if (!card.querySelector('.glare')) {
        const glare = document.createElement('div');
        glare.className = 'glare';
        card.appendChild(glare);
      }

      let rxTo = null;
      let ryTo = null;
      if (typeof window.gsap !== 'undefined') {
        window.gsap.set(card, { transformPerspective: 1000 });
        rxTo = window.gsap.quickTo(card, 'rotationX', { duration: 0.3, ease: 'power3.out' });
        ryTo = window.gsap.quickTo(card, 'rotationY', { duration: 0.3, ease: 'power3.out' });
      }

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        card.style.setProperty('--gx', `${(50 + nx * 40).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(50 + ny * 40).toFixed(1)}%`);

        if (rxTo && ryTo) {
          rxTo(-ny * maxTilt);
          ryTo(nx * maxTilt);
        } else {
          card.style.transform = `perspective(1000px) rotateX(${(-ny * maxTilt).toFixed(2)}deg) rotateY(${(nx * maxTilt).toFixed(2)}deg)`;
        }
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        if (rxTo && ryTo) {
          rxTo(0);
          ryTo(0);
        } else {
          card.style.transform = '';
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 07. CLICK EFFECTS (Removed per user request)
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // 08. REACT BITS — DECRYPTED TEXT (CIPHER EFFECT ON HOVER / SCROLL)
  // ---------------------------------------------------------------------------
  const CIPHER_CHARS = '0123456789ABCDEFΩμF±ΔΦVAWHz';

  function decryptText(el, text, duration = 450) {
    if (!el || el.dataset.isDecrypting === '1') return;
    el.dataset.isDecrypting = '1';

    const chars = Array.from(text);
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const revealCount = Math.floor(progress * chars.length);

      let out = '';
      for (let i = 0; i < chars.length; i++) {
        if (i < revealCount || /\s/.test(chars[i])) {
          out += chars[i];
        } else {
          out += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        }
      }

      el.textContent = out;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = text;
        el.dataset.isDecrypting = '0';
      }
    }

    requestAnimationFrame(step);
  }

  function initDecryptedText() {
    const targets = document.querySelectorAll('.eyebrow, .sheet-no, .panel-id, [data-decrypt]');
    targets.forEach((target) => {
      const original = target.textContent.trim();
      target.dataset.original = original;

      target.addEventListener('pointerenter', () => {
        decryptText(target, original, 380);
      });
    });
  }



  // ---------------------------------------------------------------------------
  // 11. REACT BITS PRO — DRAFTING CURSOR SYSTEM
  // Hairline crosshairs, edge rulers, coordinate readout, drag-to-measure
  // ---------------------------------------------------------------------------
  function initDraftingCursorSystem() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const layer = document.querySelector('.drafting-cursor-layer');
    if (!layer) return;

    const chX = layer.querySelector('.ch-x');
    const chY = layer.querySelector('.ch-y');
    const pipX = layer.querySelector('.pip-x');
    const pipY = layer.querySelector('.pip-y');
    const readout = document.getElementById('cursor-readout');
    const measureBox = document.getElementById('cursor-measure-box');
    const measureBadge = document.getElementById('cursor-measure-badge');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Drag-to-measure states
    let isMouseDown = false;
    let isMeasuring = false;
    let startX = 0;
    let startY = 0;
    let measureFadeTimeout = null;
    let cursorRaf = false;

    function renderCursor() {
      cursorRaf = false;

      // 1. Crosshair hairlines & Ruler pips
      if (chX) chX.style.top = `${mouseY}px`;
      if (chY) chY.style.left = `${mouseX}px`;
      if (pipX) pipX.style.left = `${mouseX}px`;
      if (pipY) pipY.style.top = `${mouseY}px`;

      // 2. Drag-to-Measure Dimension Box
      if (isMouseDown) {
        const dist = Math.hypot(mouseX - startX, mouseY - startY);
        if (dist > 8) {
          isMeasuring = true;
          if (measureFadeTimeout) {
            clearTimeout(measureFadeTimeout);
            measureFadeTimeout = null;
          }
          if (measureBox) {
            measureBox.classList.add('is-active');
            const left = Math.min(startX, mouseX);
            const top = Math.min(startY, mouseY);
            const width = Math.abs(mouseX - startX);
            const height = Math.abs(mouseY - startY);
            measureBox.style.left = `${left}px`;
            measureBox.style.top = `${top}px`;
            measureBox.style.width = `${width}px`;
            measureBox.style.height = `${height}px`;

            if (measureBadge) {
              const diag = Math.hypot(width, height);
              const wmm = (width * 0.26458).toFixed(1);
              const hmm = (height * 0.26458).toFixed(1);
              const dmm = (diag * 0.26458).toFixed(1);
              measureBadge.textContent = `ΔX: ${width}px (${wmm}mm) · ΔY: ${height}px (${hmm}mm) · D: ${diag.toFixed(0)}px (${dmm}mm)`;
            }
          }
        }
      }
    }

    document.addEventListener('pointerenter', () => {
      layer.classList.add('is-on');
    });

    document.addEventListener('pointerleave', () => {
      layer.classList.remove('is-on');
    });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') {
        layer.classList.remove('is-on');
        return;
      }
      layer.classList.add('is-on');

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!cursorRaf) {
        cursorRaf = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    // Drag-to-Measure activation (only if not clicking interactive items)
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.target.closest('a, button, input, select, textarea, .accent-dropdown, .dock-wrap, .flex-carousel, .album-rail-wrap')) {
        return;
      }
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
    }, { passive: true });

    window.addEventListener('pointerup', () => {
      isMouseDown = false;
      if (isMeasuring && measureBox) {
        measureFadeTimeout = setTimeout(() => {
          measureBox.classList.remove('is-active');
          isMeasuring = false;
        }, 1200);
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // 12. DISCIPLINE FILTER WITH GSAP FLIP
  // ---------------------------------------------------------------------------
  function initDisciplineFilter() {
    const filterButtons = document.querySelectorAll('.filters button');
    const cards = document.querySelectorAll('.disc-card');
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-filter');

        filterButtons.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));

        if (typeof window.gsap !== 'undefined' && typeof window.Flip !== 'undefined') {
          const state = window.Flip.getState(cards);

          cards.forEach((card) => {
            const cardCat = card.getAttribute('data-category');
            if (cat === 'all' || cardCat === cat) {
              card.removeAttribute('hidden');
            } else {
              card.setAttribute('hidden', '');
            }
          });

          window.Flip.from(state, {
            duration: 0.45,
            ease: 'power3.out',
            scale: true,
            stagger: 0.03,
            onEnter: (elements) => window.gsap.fromTo(elements, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.3 }),
            onLeave: (elements) => window.gsap.to(elements, { opacity: 0, scale: 0.94, duration: 0.2 }),
            onComplete: () => {
              if (window.ScrollTrigger) window.ScrollTrigger.refresh();
              if (lenis) lenis.resize();
            }
          });
        } else {
          cards.forEach((card) => {
            const cardCat = card.getAttribute('data-category');
            if (cat === 'all' || cardCat === cat) {
              card.removeAttribute('hidden');
            } else {
              card.setAttribute('hidden', '');
            }
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 13. INTERACTIVE IC PINOUT
  // ---------------------------------------------------------------------------
  function initPinout() {
    const pins = document.querySelectorAll('.pinout .pin-g');
    const noteEl = document.querySelector('.pinout-note');
    if (!pins.length) return;

    pins.forEach((pin) => {
      pin.addEventListener('pointerenter', () => {
        pins.forEach(p => p.classList.remove('is-live'));
        pin.classList.add('is-live');
        const desc = pin.getAttribute('data-desc');
        if (desc && noteEl) {
          noteEl.textContent = desc;
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 14. MOBILE DRAWER & KEYBOARD
  // ---------------------------------------------------------------------------
  function initNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const drawer = document.querySelector('.drawer');
    if (!menuBtn || !drawer) return;

    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 15. COPY TO CLIPBOARD HELPER
  // ---------------------------------------------------------------------------
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy');
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          const orig = btn.textContent;
          btn.textContent = 'COPIED ✓';
          setTimeout(() => {
            btn.textContent = orig;
          }, 1800);
        } catch (err) {
          console.warn('Clipboard copy failed', err);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 13. METALLIC SWIRL (React Bits Pro: A swirl of liquid metal)
  // ---------------------------------------------------------------------------
  // 13. REACT BITS PRO — SATIN RIDGES WEBGL SHADER
  // Flowing satin folds catching soft highlights
  // ---------------------------------------------------------------------------
  let chromaEngine = null;

  function initSatinRidges() {
    const canvas = document.getElementById('satin-ridges-canvas') ||
                   document.getElementById('metallic-swirl-canvas') ||
                   document.getElementById('chroma-waves-canvas') ||
                   document.getElementById('chroma-current-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      initSatinRidgesFallback(canvas);
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform vec2 u_mouse;
      uniform vec3 u_accent;
      uniform vec3 u_bg;
      uniform float u_isLight;

      // Single fold frequency calculation
      float satinFold(vec2 p, float t) {
        // Flowing diagonal fold coordinates
        vec2 dir = vec2(0.85, 0.52);
        vec2 perp = vec2(-0.52, 0.85);

        float u = dot(p, dir);
        float v = dot(p, perp);

        // Multi-frequency undulating fabric folds
        float f1 = sin(u * 2.8 - t * 0.42 + sin(v * 1.4 + t * 0.22) * 0.75);
        float f2 = sin(u * 5.2 + v * 2.1 - t * 0.58 + f1 * 1.15);
        float f3 = cos(v * 3.2 - u * 1.6 + t * 0.32 + f2 * 0.45);

        return f1 * 0.55 + f2 * 0.30 + f3 * 0.15;
      }

      // Heightfield of draped satin fabric with soft ridges
      float satinField(vec2 p, float t) {
        // Gentle draping curve
        p.y += sin(p.x * 1.1 + t * 0.12) * 0.16;
        p.x += cos(p.y * 0.85 - t * 0.10) * 0.12;

        float h1 = satinFold(p, t);
        float h2 = satinFold(p * 1.35 + vec2(1.6, -2.0), t * 0.8);
        return h1 * 0.72 + h2 * 0.28;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 p = (fragCoord - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Pure autonomous satin flow — no parallax, no mouse tracking
        float t = u_time * u_speed;

        // Evaluate surface height & finite differences for surface normals
        float eps = 0.006;
        float h = satinField(p, t);
        float hx = satinField(p + vec2(eps, 0.0), t);
        float hy = satinField(p + vec2(0.0, eps), t);

        vec3 normal = normalize(vec3((h - hx) / eps * 1.6, (h - hy) / eps * 1.6, 1.0));

        // Satin tangent running along the fold direction
        vec3 foldDir = normalize(vec3(0.85, 0.52, 0.0));
        vec3 tangent = normalize(cross(normal, foldDir));

        // Soft studio lighting catching ridge crests
        vec3 lightDir = normalize(vec3(cos(t * 0.28) * 0.65, sin(t * 0.28) * 0.65, 0.9));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);

        // Diffuse & Anisotropic satin sheen highlights
        float diff = max(0.0, dot(normal, lightDir));
        float dotTH = dot(tangent, halfDir);
        float sinTH = sqrt(max(0.0, 1.0 - dotTH * dotTH));
        float satinSheen = pow(sinTH, 14.0); // Anisotropic silk sheen

        float spec = pow(max(0.0, dot(normal, halfDir)), 32.0);
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.8);

        // Soft ridge crest illumination
        float ridgeHighlight = pow(clamp(h * 0.5 + 0.5, 0.0, 1.0), 2.5);

        // Compose satin fold highlights tinted by accent
        vec3 satinTint = mix(vec3(0.82, 0.88, 0.94), u_accent, 0.55);
        vec3 foldHighlight = satinTint * (diff * 0.35 + satinSheen * 0.55 + ridgeHighlight * 0.35)
                           + vec3(1.0) * (spec * 0.4)
                           + u_accent * (fresnel * 0.45);

        vec3 finalColor;
        if (u_isLight > 0.5) {
          // Light mode: pristine blueprint / whiteprint with soft silver & accent satin folds
          float dim = 0.16;
          vec3 foldColor = mix(vec3(0.84, 0.90, 0.96), u_accent, 0.35);
          vec3 satinLit = mix(u_bg, foldColor, (diff * 0.4 + satinSheen * 0.45 + fresnel * 0.25));
          finalColor = mix(u_bg, satinLit, dim);
        } else {
          // Dark mode: deep obsidian background catching flowing luminous satin folds
          float dim = 0.22;
          finalColor = u_bg + foldHighlight * dim;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile failed', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      initSatinRidgesFallback(canvas);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link failed', gl.getProgramInfoLog(program));
      initSatinRidgesFallback(canvas);
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uAccent = gl.getUniformLocation(program, 'u_accent');
    const uBg = gl.getUniformLocation(program, 'u_bg');
    const uIsLight = gl.getUniformLocation(program, 'u_isLight');

    function parseColor(str, fallback) {
      if (!str) return fallback;
      str = str.trim();
      if (str.startsWith('#')) {
        let hex = str.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255];
      }
      const parts = str.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      if (parts.length >= 3) {
        return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
      }
      return fallback;
    }

    let accentRGB = [0.22, 0.74, 0.97]; // #38bdf8
    let bgRGB = [0.012, 0.031, 0.078]; // #030814
    let isLightVal = 0.0;

    function updateColors() {
      const styles = getComputedStyle(document.documentElement);
      const isWhiteprint = document.documentElement.getAttribute('data-theme') === 'whiteprint';

      const accentStr = styles.getPropertyValue('--accent-rgb');
      accentRGB = parseColor(accentStr, isWhiteprint ? [0.04, 0.38, 0.79] : [0.22, 0.74, 0.97]);

      if (isWhiteprint) {
        bgRGB = [0.933, 0.953, 0.976]; // #eef3f9
        isLightVal = 1.0;
      } else {
        bgRGB = [0.012, 0.031, 0.078]; // #030814
        isLightVal = 0.0;
      }
    }

    updateColors();

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let startTime = performance.now();
    let isVisible = true;
    let animId = null;

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    });

    const speed = 0.40;

    function render(now) {
      if (isVisible) {
        const elapsed = (now - startTime) / 1000;
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uSpeed, speed);
        gl.uniform2f(uMouse, 0.5, 0.5);
        gl.uniform3f(uAccent, accentRGB[0], accentRGB[1], accentRGB[2]);
        gl.uniform3f(uBg, bgRGB[0], bgRGB[1], bgRGB[2]);
        gl.uniform1f(uIsLight, isLightVal);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animId = requestAnimationFrame(render);
    }

    chromaEngine = {
      updateColors: () => {
        updateColors();
      },
      render: () => {}
    };

    animId = requestAnimationFrame(render);
  }

  function initSatinRidgesFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;
    let startTime = performance.now();
    let isVisible = true;

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(draw);
      }
    });

    function draw(now) {
      if (isVisible) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const isWhite = document.documentElement.getAttribute('data-theme') === 'whiteprint';
        ctx.fillStyle = isWhite ? '#eef3f9' : '#030814';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const t = (now - startTime) * 0.0004;
        const styles = getComputedStyle(document.documentElement);
        const accent = styles.getPropertyValue('--accent') || '#38bdf8';

        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = accent.trim();
        ctx.lineWidth = 48;
        ctx.filter = 'blur(28px)';

        // Autonomous flowing satin ribbons — no mouse parallax
        const lines = 7;
        for (let i = 0; i < lines; i++) {
          const baseY = (canvas.height / lines) * i;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 30) {
            const y = baseY + Math.sin(x * 0.003 + t + i * 0.8) * 60 + Math.cos(x * 0.006 - t * 0.6) * 35;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { passive: true });

    chromaEngine = {
      updateColors: () => {},
      render: () => {}
    };
  }

  // ---------------------------------------------------------------------------
  // 14. REACT BITS — TECHTEXT DYNAMIC INTERACTIVE WORDMARK
  // ---------------------------------------------------------------------------
  function initTechText(container, props = {}) {
    if (!container) return;
    const canvas = container.querySelector('canvas') || container.querySelector('.tech-text-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scratch = document.createElement('canvas');
    const scratchCtx = scratch.getContext('2d');
    if (!ctx || !scratchCtx) return;

    const LABEL_FONT = '10px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const FALLOFF_STEPS = 8;
    const SPRING = 320;
    const INHERIT = /^(currentcolor|inherit)$/i;
    const INTRO_DELAY = 0.15;
    const KICK_DECAY = 0.62;

    const approach = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));
    const clamp01 = value => Math.min(1, Math.max(0, Number(value) || 0));
    const smoothstep = (edge0, edge1, value) => {
      const t = clamp01((value - edge0) / (edge1 - edge0));
      return t * t * (3 - 2 * t);
    };
    const noise = (...values) => {
      let h = 2166136261;
      for (const value of values) {
        h = Math.imul(h ^ (value | 0), 16777619);
        h ^= h >>> 13;
        h = Math.imul(h, 0x5bd1e995);
        h ^= h >>> 15;
      }
      return (h >>> 0) / 4294967296;
    };
    const signed = value => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

    const defaultSettings = {
      text: 'Lee Parkinson',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: 88,
      letterSpacing: -0.03,
      color: 'currentColor',
      accentColor: 'var(--accent)',
      align: 'left',
      reach: 180,
      softness: 0.7,
      dashLength: 4,
      dashGap: 2,
      strokeWidth: 1.5,
      lineStyle: 'dashed',
      reveal: 'letter',
      specks: 15,
      selection: true,
      labels: true,
      draggable: true,
      bounce: 0.4,
      sweep: true,
      speed: 1,
      clickKick: true,
      intro: 'none',
      introDuration: 2,
      guides: false
    };

    const s = Object.assign({}, defaultSettings, props);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let alive = true;
    let layoutKey = '';
    let requestedFont = '';
    let word = null;
    let glyphs = [];
    let presence = 0;
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    let cursor = '';
    let introClock = 0;
    let introKind = s.intro;
    let introducing = false;
    let fontsReady = !document.fonts;
    let guideAlpha = 0;
    const kicks = [];
    const press = { x: 0, y: 0, time: 0, index: -1 };
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const refreshFonts = () => {
      layoutKey = '';
      wake();
    };

    const fontsLoaded = () => {
      fontsReady = true;
      refreshFonts();
    };

    const family = s => s.fontFamily || getComputedStyle(container).fontFamily || 'sans-serif';
    const fontFor = (s, size) => `${s.fontWeight} ${size}px ${family(s)}`;

    const palette = s => {
      const docStyle = getComputedStyle(document.documentElement);
      const containerStyle = getComputedStyle(container);
      const current = containerStyle.color || docStyle.getPropertyValue('--ink') || '#ffffff';
      const accentVal = docStyle.getPropertyValue('--accent') || '#38bdf8';
      const pick = (value, fallback) => (!value || INHERIT.test(String(value).trim()) ? fallback : value);
      const ink = pick(s.color, current).trim();
      const accent = (s.accentColor && s.accentColor.startsWith('var(') ? accentVal : pick(s.accentColor, accentVal)).trim();
      return { ink, accent };
    };

    const setFont = (target, s, size) => {
      target.font = fontFor(s, size);
      if ('letterSpacing' in target) target.letterSpacing = `${s.letterSpacing * size}px`;
      target.textAlign = 'left';
      target.textBaseline = 'alphabetic';
    };

    const sprite = (s, view, glyph, stroke, ink) => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, s, view.size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = ink;
        if (s.lineStyle !== 'solid') c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000000';
        c.fillText(glyph.char, glyph.x, view.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = ink;
        c.fillText(glyph.char, glyph.x, view.baseline);
      }
      return { image, left, top };
    };

    const ensureLayout = (s, ink) => {
      const key = [
        s.text,
        family(s),
        s.fontWeight,
        s.fontSize,
        s.letterSpacing,
        s.align,
        ink,
        s.dashLength,
        s.dashGap,
        s.strokeWidth,
        s.lineStyle,
        width,
        height,
        dpr
      ].join('|');
      if (key === layoutKey && word) return word;
      layoutKey = key;
      const wanted = fontFor(s, 64);
      if (document.fonts && wanted !== requestedFont) {
        requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(refreshFonts, refreshFonts);
      }

      const probe = scratchCtx;
      setFont(probe, s, s.fontSize);
      let m = probe.measureText(s.text);
      const fit = Math.min(
        1,
        (width * 0.98) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (height * 0.85) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      const size = s.fontSize * fit;
      setFont(probe, s, size);
      m = probe.measureText(s.text);
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const margin = s.align === 'left' ? 2 : width * 0.05;
      const start =
        s.align === 'left' ? margin : s.align === 'right' ? width - margin - inkWidth : (width - inkWidth) / 2;
      const x = start + m.actualBoundingBoxLeft;
      const baseline = (height - inkHeight) / 2 + m.actualBoundingBoxAscent;
      const xHeight = baseline - probe.measureText('x').actualBoundingBoxAscent;
      const capHeight = baseline - probe.measureText('H').actualBoundingBoxAscent;
      const ascender = baseline - probe.measureText('d').actualBoundingBoxAscent;
      const descender = baseline + probe.measureText('p').actualBoundingBoxDescent;
      const top = baseline - m.actualBoundingBoxAscent;
      const bottom = baseline + m.actualBoundingBoxDescent;
      const inkTop = Math.min(top, capHeight) - 2;
      const inkBottom = Math.max(bottom, baseline) + 2;
      const next = {
        size,
        baseline,
        left: x - m.actualBoundingBoxLeft,
        right: x + m.actualBoundingBoxRight,
        top,
        bottom,
        lines: [
          { y: baseline, label: 'baseline' },
          { y: xHeight, label: 'x-height' },
          { y: capHeight, label: 'cap height' },
          ...(capHeight - ascender > Math.max(11, size * 0.06) ? [{ y: ascender, label: 'ascender' }] : []),
          { y: descender, label: 'descender' }
        ],
        bands: [
          { y0: xHeight, y1: baseline, up: true, order: 0 },
          { y0: capHeight, y1: xHeight, up: true, order: 1 },
          { y0: inkTop, y1: capHeight, up: true, order: 2 },
          { y0: baseline, y1: inkBottom, up: false, order: 1 }
        ].filter(band => band.y1 - band.y0 > 0.5)
      };
      word = next;

      const chars = Array.from(s.text);
      const previous = glyphs;
      glyphs = [];
      let prefix = '';
      chars.forEach((char, i) => {
        prefix += char;
        const own = probe.measureText(char);
        const gx = x + probe.measureText(prefix).width - own.width;
        if (!char.trim()) return;
        const base = {
          char,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent
          }
        };
        const kept = previous[glyphs.length];
        glyphs.push({
          ...base,
          offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          outline: 0,
          shown: 1,
          cells: null,
          assembled: 0,
          index: i,
          fill: sprite(s, next, base, false, ink),
          dashes: sprite(s, next, base, true, ink)
        });
      });
      dragging = -1;
      frame.index = -1;
      return next;
    };

    const glyphAt = (x, y) => {
      if (!word || y < word.top - 24 || y > word.bottom + 24) return -1;
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const falloff = (target, cx, cy, radius, strength, softness) => {
      const inner = Math.min(1, Math.max(0, 1 - softness));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (target, art, dx, dy, originX, originY) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    const drawReveal = s => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr;
      const cy = lens.y * dpr;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of glyphs) blit(scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, x0, y0);
      scratchCtx.globalCompositeOperation = 'destination-in';
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = value => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance, w, h) => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s, a, accent) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        ctx.globalAlpha = alpha;
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        } else {
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawFrame = (s, accent) => {
      if (!s.selection) return;
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.globalAlpha = 0.45 * a;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.globalAlpha = 0.7 * a;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.globalAlpha = 0.5 * a;
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.globalAlpha = 0.95 * a;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (s.specks > 0) drawSpecks(s, a, accent);

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.62 * a;
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      ctx.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
      ctx.globalAlpha = 1;
    };

    const drawLines = (s, view, accent, alpha, growth) => {
      const pad = Math.max(12, view.size * 0.12);
      const x1 = Math.round(view.left - pad);
      const x2 = Math.round(view.right + pad);
      const room = width - x2 > x1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      ctx.lineWidth = 1;
      ctx.font = LABEL_FONT;
      ctx.textBaseline = 'middle';
      ctx.textAlign = room ? 'left' : 'right';
      view.lines.forEach((line, k) => {
        const grow = growth(k);
        if (grow <= 0.001) return;
        const y = crisp(line.y);
        const end = x1 + (x2 - x1) * grow;
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(end, y);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(x1 - 1, Math.round(line.y) - 1, 3, 3);
        ctx.fillRect(Math.round(end) - 1, Math.round(line.y) - 1, 3, 3);
        if (s.labels) {
          ctx.globalAlpha = alpha * 0.62 * smoothstep(0.7, 1, grow);
          ctx.fillText(line.label, room ? x2 + 8 : x1 - 8, Math.round(line.y));
        }
      });
      ctx.textAlign = 'left';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    };

    const kick = index => {
      const strength = (word ? word.size : 120) * 11;
      kicks.push({ index, at: pulse, velocity: strength });
      for (let d = 1; d < glyphs.length; d++) {
        const velocity = strength * Math.pow(KICK_DECAY, d);
        if (velocity < 30) break;
        for (const j of [index - d, index + d]) {
          if (j >= 0 && j < glyphs.length) kicks.push({ index: j, at: pulse + d * 0.055, velocity });
        }
      }
      wake();
    };

    const tick = now => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const { ink, accent } = palette(s);
      const view = ensureLayout(s, ink);
      const damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(s.bounce) * 0.96);

      const introOn = introKind !== 'none' && !reducedMotion && glyphs.length > 0;
      if (introOn && fontsReady) introClock += dt;
      const progress = introOn ? clamp01((introClock - INTRO_DELAY) / Math.max(0.3, s.introDuration)) : 1;
      introducing = introOn && progress < 1;

      const sweeping = !introducing && s.sweep && !reducedMotion && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = !introducing && (pointer.inside || sweeping || dragging >= 0);
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === 'area' && active && dragging < 0 ? 1 : 0, dt, 0.16);

      for (let k = kicks.length - 1; k >= 0; k--) {
        if (kicks[k].at > pulse) continue;
        const glyph = glyphs[kicks[k].index];
        if (glyph) glyph.velocity.y -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - damping * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - damping * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = s.reveal === 'letter' && i === focus && i !== dragging ? 1 : 0;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      guideAlpha = approach(guideAlpha, s.guides && !introducing && (focus >= 0 || presence > 0.4) ? 1 : 0, dt, 0.14);

      const hovering = !introducing && focus >= 0 && pointer.inside;
      const nextCursor =
        dragging >= 0 ? 'grabbing' : hovering && s.draggable ? 'grab' : hovering && s.clickKick ? 'pointer' : '';
      if (nextCursor !== cursor) {
        cursor = nextCursor;
        container.style.cursor = nextCursor;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      if (guideAlpha > 0.005) {
        drawLines(s, view, accent, guideAlpha * 0.6, () => 1);
      }
      glyphs.forEach((glyph) => {
        if (glyph.shown < 0.001) return;
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = (1 - glyph.outline) * glyph.shown;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline * glyph.shown;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      });
      if (presence > 0.001) drawReveal(s);
      drawFrame(s, accent);

      const settling =
        moving ||
        introducing ||
        kicks.length > 0 ||
        (guideAlpha > 0.005 && guideAlpha < 0.995) ||
        Math.abs(presence - (s.reveal === 'area' && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layoutKey = '';
      wake();
    };

    const locate = e => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onMove = e => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = e => {
      locate(e);
      pointer.inside = true;
      const primary = e.pointerType !== 'mouse' || e.button === 0;
      const index = introducing || !primary ? -1 : glyphAt(pointer.x, pointer.y);
      press.x = pointer.x;
      press.y = pointer.y;
      press.time = performance.now();
      press.index = index;
      if (s.draggable && index >= 0) {
        dragging = index;
        grab.x = pointer.x - glyphs[index].offset.x;
        grab.y = pointer.y - glyphs[index].offset.y;
        if (typeof container.setPointerCapture === 'function') {
          try { container.setPointerCapture(e.pointerId); } catch (_) {}
        }
      }
      wake();
    };
    const onUp = e => {
      if (dragging >= 0) {
        dragging = -1;
        if (typeof container.releasePointerCapture === 'function') {
          try { container.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        const rect = container.getBoundingClientRect();
        pointer.inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      if (
        e.type === 'pointerup' &&
        press.index >= 0 &&
        s.clickKick &&
        !reducedMotion &&
        performance.now() - press.time < 450
      ) {
        const rect = container.getBoundingClientRect();
        if (Math.hypot(e.clientX - rect.left - press.x, e.clientY - rect.top - press.y) < 6) kick(press.index);
      }
      press.index = -1;
      wake();
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerenter', onMove, { passive: true });
    container.addEventListener('pointerdown', onDown, { passive: true });
    container.addEventListener('pointerup', onUp, { passive: true });
    container.addEventListener('pointercancel', onUp, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    if (window.IntersectionObserver) {
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        wake();
      });
      intersectionObserver.observe(container);
    } else {
      visible = true;
    }

    const themeObserver = new MutationObserver(() => {
      layoutKey = '';
      wake();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-accent'] });

    if (document.fonts) document.fonts.ready.then(fontsLoaded, fontsLoaded);

    resize();
  }

  // ---------------------------------------------------------------------------
  // 14. DESKTOP / PC KEYBOARD NAVIGATION CONTROLLER
  // Quick jump: 1-6 for Sheets, 0/H for Hero/Top, T for Theme, F for Fold/Expand
  // ---------------------------------------------------------------------------
  function initKeyboardNav() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const sheets = {
        '1': 'about',
        '2': 'education',
        '3': 'experience',
        '4': 'projects',
        '5': 'hobbies',
        '6': 'contact'
      };

      if (sheets[e.key]) {
        e.preventDefault();
        const target = document.getElementById(sheets[e.key]);
        if (target) {
          if (window.lenisInstance) {
            window.lenisInstance.scrollTo(target, { offset: -74 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else if (e.key === '0' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        if (window.lenisInstance) {
          window.lenisInstance.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        ThemeController.cycleTheme();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const foldAllBtn = document.querySelector('[data-sheets-fold-all]');
        const expandAllBtn = document.querySelector('[data-sheets-expand-all]');
        const hasFolded = document.querySelector('.section.is-folded');
        if (hasFolded && expandAllBtn) {
          expandAllBtn.click();
        } else if (foldAllBtn) {
          foldAllBtn.click();
        }
      }
    });
  }



  // ---------------------------------------------------------------------------
  // 15. REACT BITS PRO — PRISM CAROUSEL (3D Coverflow with Prismatic Sheen)
  // A coverflow that sweeps color into each new image
  // ---------------------------------------------------------------------------
  function initPrismCarousel() {
    const root = document.querySelector('.prism-carousel-wrap');
    if (!root) return;

    const viewport = root.querySelector('.prism-viewport');
    const slides = Array.from(root.querySelectorAll('.prism-slide'));
    const prevBtn = root.querySelector('.prism-prev');
    const nextBtn = root.querySelector('.prism-next');
    const dotsContainer = root.querySelector('.prism-dots');
    if (!slides.length) return;

    let activeIndex = 0;
    const total = slides.length;

    // Build dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'prism-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => goTo(idx));
        dotsContainer.appendChild(dot);
      });
    }

    function update() {
      const isMobile = window.innerWidth < 768;
      const xSpacing = isMobile ? 130 : 210;
      const zSpacing = isMobile ? 110 : 150;
      const yRotation = isMobile ? 26 : 34;

      slides.forEach((slide, i) => {
        const offset = i - activeIndex;
        const absOffset = Math.abs(offset);

        slide.classList.toggle('is-active', offset === 0);

        if (offset === 0) {
          slide.style.transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
          slide.style.zIndex = '10';
          slide.style.opacity = '1';
          slide.style.filter = 'none';
          slide.style.pointerEvents = 'auto';
        } else {
          const dir = offset > 0 ? 1 : -1;
          const tx = offset * xSpacing;
          const tz = -absOffset * zSpacing;
          const ry = dir * -yRotation;
          const scale = Math.max(0.72, 1 - absOffset * 0.12);
          const opacity = absOffset > 2 ? '0' : Math.max(0.35, 1 - absOffset * 0.32).toString();

          slide.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
          slide.style.zIndex = String(10 - absOffset);
          slide.style.opacity = opacity;
          slide.style.filter = absOffset > 1 ? 'blur(2px) grayscale(30%)' : 'grayscale(15%)';
          slide.style.pointerEvents = absOffset <= 2 ? 'auto' : 'none';
        }
      });

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.prism-dot');
        dots.forEach((d, idx) => d.classList.toggle('is-active', idx === activeIndex));
      }
    }

    function goTo(idx) {
      activeIndex = (idx + total) % total;
      update();
    }

    function next() { goTo(activeIndex + 1); }
    function prev() { goTo(activeIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    slides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (idx !== activeIndex) goTo(idx);
      });
    });

    let startX = 0;
    let isDragging = false;

    if (viewport) {
      viewport.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
      });

      window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = e.clientX - startX;
        if (diff > 40) prev();
        else if (diff < -40) next();
      });

      viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - startX;
        if (diff > 40) prev();
        else if (diff < -40) next();
      }, { passive: true });
    }

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    });

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  // ---------------------------------------------------------------------------
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  function boot() {
    ThemeController.init();
    initSatinRidges();
    initLenis();
    initGSAP();
    initFoldableSheets();
    initSpotlightCards();
    initTiltedCards();
    initDecryptedText();
    initDraftingCursorSystem();
    initDisciplineFilter();
    initPrismCarousel();
    initNavigation();
    initCopyButtons();
    initKeyboardNav();
    initTechText(document.getElementById('hero-tech-text'), {
      text: 'Lee Parkinson',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: 90,
      letterSpacing: -0.03,
      align: 'left',
      color: 'currentColor',
      accentColor: 'var(--accent)',
      reveal: 'none',
      dashLength: 4,
      dashGap: 2,
      specks: 0,
      selection: false,
      labels: false,
      draggable: false,
      bounce: 0,
      clickKick: false,
      intro: 'none',
      sweep: false,
      speed: 1,
      guides: false
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
