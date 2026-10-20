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
        localStorage.removeItem('lp_accent');
      } else if (accent.startsWith('custom:')) {
        const hex = accent.slice(7);
        document.documentElement.setAttribute('data-accent', 'custom');
        document.documentElement.style.setProperty('--accent', hex);
        const r = parseInt(hex.slice(1, 3), 16) || 56;
        const g = parseInt(hex.slice(3, 5), 16) || 189;
        const b = parseInt(hex.slice(5, 7), 16) || 248;
        document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
        localStorage.setItem('lp_accent', accent);
      } else {
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-rgb');
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

      window.gsap.ticker.lagSmoothing(0);
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
          // Sheet rule dimension scaleX
          gsap.utils.toArray('.sheet-rule').forEach((rule) => {
            gsap.fromTo(rule, 
              { scaleX: 0 }, 
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: rule,
                  start: 'top 90%',
                  toggleActions: 'play none none none'
                }
              }
            );
          });

          // Cards & Panels Batching
          const cards = gsap.utils.toArray('section:not(.hero) .panel, .timeline .job, .hobby');
          if (cards.length) {
            window.ScrollTrigger.batch(cards, {
              interval: 0.08,
              batchMax: isDesktop ? 3 : 2,
              start: 'top 88%',
              onEnter: (batch) => {
                gsap.fromTo(batch,
                  { opacity: 0, y: isDesktop ? 28 : 18 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    stagger: 0.08,
                    ease: 'power3.out',
                    overwrite: 'auto',
                    clearProps: 'transform'
                  }
                );
              }
            });
          }

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

          // Background gears subtle rotation on scroll
          const gearGroup = document.querySelector('.hero-gears');
          if (gearGroup) {
            gsap.to('.hero-gears .gear', {
              rotation: 180,
              transformOrigin: '50% 50%',
              ease: 'none',
              scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
              }
            });
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
  // 07. REACT BITS — CLICK SPARK PARTICLES
  // ---------------------------------------------------------------------------
  function initClickSpark() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'spark-layer';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const sparks = [];
    const colors = ['#63cbff', '#eef5ff', '#ffbe55', '#4ade9b'];

    function createSparks(x, y) {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 2.2 + Math.random() * 2.8;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.035 + Math.random() * 0.02,
          length: 4 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    let isRunning = false;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * s.length * 0.8, s.y - s.vy * s.length * 0.8);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = s.life;
        ctx.stroke();

        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;

      if (sparks.length > 0) {
        requestAnimationFrame(loop);
      } else {
        isRunning = false;
      }
    }

    window.addEventListener('pointerdown', (e) => {
      // Don't spark on text selection drags
      createSparks(e.clientX, e.clientY);
      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(loop);
      }
    }, { passive: true });
  }

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
  // 09. REACT BITS — MAGNET BUTTONS
  // ---------------------------------------------------------------------------
  function initMagneticElements() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof window.gsap === 'undefined') return;

    const magnets = document.querySelectorAll('.btn, .dock-item, .brand-mark');
    magnets.forEach((el) => {
      const xTo = window.gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3.out' });
      const yTo = window.gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.24;
        const dy = (e.clientY - cy) * 0.24;
        xTo(Math.max(-8, Math.min(8, dx)));
        yTo(Math.max(-8, Math.min(8, dy)));
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. REACT BITS — MAGNIFYING DOCK
  // ---------------------------------------------------------------------------
  function initDock() {
    const dock = document.querySelector('.dock');
    if (!dock) return;

    const items = dock.querySelectorAll('.dock-item');
    const baseSize = 42;
    const maxScale = 1.35;
    const maxDistance = 110;

    dock.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const mouseX = e.clientX;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - center);

        if (dist < maxDistance) {
          const norm = 1 - dist / maxDistance;
          const scale = 1 + (maxScale - 1) * Math.sin(norm * (Math.PI / 2));
          item.style.transform = `scale(${scale.toFixed(3)})`;
        } else {
          item.style.transform = 'scale(1)';
        }
      });
    }, { passive: true });

    dock.addEventListener('pointerleave', () => {
      items.forEach((item) => {
        item.style.transform = 'scale(1)';
      });
    });

    // Highlight active section based on scroll position
    const sections = ['top', 'about', 'schematics', 'gallery', 'experience', 'education', 'hobbies', 'contact'];
    function updateActiveDock() {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      let active = 'top';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          active = id;
        }
      });

      items.forEach((item) => {
        const href = item.getAttribute('href');
        if (href === `#${active}` || (active === 'top' && href === '#top')) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });
    }

    if (lenis) {
      lenis.on('scroll', updateActiveDock);
    } else {
      window.addEventListener('scroll', updateActiveDock, { passive: true });
    }
    updateActiveDock();
  }

  // ---------------------------------------------------------------------------
  // 11. REACT BITS — CROSSHAIR DATUM TRACKER (HERO)
  // ---------------------------------------------------------------------------
  function initCrosshair() {
    const hero = document.querySelector('.hero');
    const crosshair = document.querySelector('.crosshair');
    if (!hero || !crosshair) return;

    const chX = crosshair.querySelector('.ch-x');
    const chY = crosshair.querySelector('.ch-y');
    const chRead = crosshair.querySelector('.ch-read');

    hero.addEventListener('pointerenter', () => {
      crosshair.classList.add('is-on');
    });

    hero.addEventListener('pointerleave', () => {
      crosshair.classList.remove('is-on');
    });

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (chX) chX.style.top = `${y}px`;
      if (chY) chY.style.left = `${x}px`;
      if (chRead) {
        chRead.style.left = `${x + 12}px`;
        chRead.style.top = `${y + 12}px`;
        const xmm = (x * 0.26458).toFixed(1);
        const ymm = (y * 0.26458).toFixed(1);
        chRead.textContent = `DATUM [${xmm}, ${ymm}mm]`;
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
  // 13. CHROMA CURRENT (React Bits Pro: Currents of light across glowing dot grid)
  // ---------------------------------------------------------------------------
  let chromaEngine = null;

  function initChromaCurrent() {
    const canvas = document.getElementById('chroma-current-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      initChromaCurrentFallback(canvas);
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
      uniform float u_pitch;
      uniform float u_speed;
      uniform vec3 u_accent;
      uniform vec3 u_bg;
      uniform vec3 u_gridDot;

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        fragCoord.y = u_resolution.y - fragCoord.y;

        // Dot matrix grid
        vec2 gridUv = fragCoord / u_pitch;
        vec2 cell = floor(gridUv);
        vec2 dotCoord = fract(gridUv) - 0.5;
        float dist = length(dotCoord);

        // Current flow field
        vec2 p = cell * 0.052;
        float t = u_time * u_speed;

        // Currents of light flowing across grid
        float s1 = sin(p.x * 1.8 + p.y * 1.2 + t * 1.05);
        float s2 = sin(p.x * 2.4 - p.y * 1.9 - t * 0.85);
        float s3 = cos(p.x * 0.9 + p.y * 2.7 + t * 0.65);
        float flow = (s1 + s2 + s3) * 0.333;

        // Pulse wave
        float wave = sin(flow * 3.14159 + p.x * 1.5 - t * 1.3);
        float current = smoothstep(0.38, 0.95, wave);

        // Crossing diagonal stream
        float crossFlow = sin(p.y * 2.2 - p.x * 1.5 + t * 0.7);
        float crossWave = sin(crossFlow * 3.14159 - t * 1.15);
        float current2 = smoothstep(0.45, 0.98, crossWave) * 0.75;
        current = max(current, current2);

        // Dot radius scales with current brightness (halftone / LED matrix)
        float baseRadius = 0.09;
        float maxRadius = 0.38;
        float radius = mix(baseRadius, maxRadius, current);

        // Anti-aliased circle edge
        float edge = 0.055;
        float dotAlpha = smoothstep(radius, radius - edge, dist);

        // Soft bloom around illuminated dots
        float glow = exp(-dist * 4.6) * current * 0.55;

        // Color computation
        vec3 dotColor = mix(u_gridDot, u_accent, current);
        vec3 col = mix(u_bg, dotColor, dotAlpha);
        col += u_accent * glow;

        gl_FragColor = vec4(col, 1.0);
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
      initChromaCurrentFallback(canvas);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link failed', gl.getProgramInfoLog(program));
      initChromaCurrentFallback(canvas);
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
    const uPitch = gl.getUniformLocation(program, 'u_pitch');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uAccent = gl.getUniformLocation(program, 'u_accent');
    const uBg = gl.getUniformLocation(program, 'u_bg');
    const uGridDot = gl.getUniformLocation(program, 'u_gridDot');

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
    let gridDotRGB = [0.07, 0.20, 0.35];

    function updateColors() {
      const styles = getComputedStyle(document.documentElement);
      const isWhiteprint = document.documentElement.getAttribute('data-theme') === 'whiteprint';

      const accentStr = styles.getPropertyValue('--accent-rgb');
      accentRGB = parseColor(accentStr, isWhiteprint ? [0.04, 0.38, 0.79] : [0.22, 0.74, 0.97]);

      if (isWhiteprint) {
        bgRGB = [0.933, 0.953, 0.976]; // #eef3f9
        gridDotRGB = [0.72, 0.79, 0.88];
      } else {
        bgRGB = [0.012, 0.031, 0.078]; // #030814
        gridDotRGB = [0.07, 0.20, 0.35];
      }
    }

    updateColors();

    chromaEngine = {
      updateColors
    };

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    const isMobile = window.innerWidth < 768;
    const pitch = (isMobile ? 22.0 : 26.0) * dpr;
    const speed = 0.75;

    function render(now) {
      if (isVisible) {
        const elapsed = (now - startTime) / 1000;
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uPitch, pitch);
        gl.uniform1f(uSpeed, speed);
        gl.uniform3f(uAccent, accentRGB[0], accentRGB[1], accentRGB[2]);
        gl.uniform3f(uBg, bgRGB[0], bgRGB[1], bgRGB[2]);
        gl.uniform3f(uGridDot, gridDotRGB[0], gridDotRGB[1], gridDotRGB[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  function initChromaCurrentFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    function draw() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#030814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      const pitch = 24;
      for (let x = 12; x < canvas.width; x += pitch) {
        for (let y = 12; y < canvas.height; y += pitch) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    draw();
    window.addEventListener('resize', draw, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  function boot() {
    ThemeController.init();
    initChromaCurrent();
    initLenis();
    initGSAP();
    initFoldableSheets();
    initSpotlightCards();
    initTiltedCards();
    initClickSpark();
    initDecryptedText();
    initMagneticElements();
    initDock();
    initCrosshair();
    initDisciplineFilter();
    initNavigation();
    initCopyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
