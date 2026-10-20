/*!
 * LP-EE-2026 // Blueprint Motion & Interaction Engine — REV 10.0
 * Lee Parkinson · Electrical Engineering Blueprint Portfolio
 * GSAP 3 (ScrollTrigger, SplitText, ScrambleText, Flip, quickTo) · Lenis · React Bits
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 01. THEME CONTROLLER
  // ---------------------------------------------------------------------------
  const ThemeController = {
    init() {
      const saved = localStorage.getItem('lp_theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'whiteprint' : 'blueprint');
      this.apply(saved);

      const toggleBtn = document.querySelector('[data-theme-toggle]');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme') || 'blueprint';
          const next = current === 'blueprint' ? 'whiteprint' : 'blueprint';
          this.apply(next);
        });
      }

      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('lp_theme')) {
          this.apply(e.matches ? 'whiteprint' : 'blueprint');
        }
      });
    },

    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('lp_theme', theme);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'whiteprint' ? '#eef3f9' : '#0b2343');
      }

      const label = document.querySelector('[data-theme-label]');
      if (label) {
        label.textContent = theme === 'whiteprint' ? 'DARK' : 'LIGHT';
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 02. LENIS SMOOTH SCROLL + GSAP TICKER
  // ---------------------------------------------------------------------------
  let lenis = null;

  function initLenis() {
    if (typeof window.Lenis === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lenis = new window.Lenis({
      duration: prefersReducedMotion ? 0 : 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
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
  // 04. REACT BITS — SCROLL VELOCITY RIBBON
  // ---------------------------------------------------------------------------
  function initScrollVelocity() {
    const ribbons = document.querySelectorAll('.ribbon-row');
    if (!ribbons.length) return;

    let offset0 = 0;
    let offset1 = 0;
    let lastTime = performance.now();
    let targetDirection = -1;

    function animate(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const vel = lenis ? lenis.velocity : 0;
      if (Math.abs(vel) > 0.1) {
        targetDirection = vel > 0 ? -1 : 1;
      }
      const speedMultiplier = 1 + Math.min(4, Math.abs(vel) * 0.15);
      const baseSpeed = 40;

      offset0 += targetDirection * baseSpeed * speedMultiplier * dt;
      offset1 -= targetDirection * (baseSpeed * 0.85) * speedMultiplier * dt;

      const row0 = ribbons[0];
      const row1 = ribbons[1];

      if (row0) {
        const halfWidth = row0.scrollWidth / 2;
        if (halfWidth > 0) {
          offset0 = ((offset0 % halfWidth) + halfWidth) % halfWidth - halfWidth;
          row0.style.transform = `translate3d(${offset0.toFixed(2)}px, 0, 0)`;
        }
      }

      if (row1) {
        const halfWidth = row1.scrollWidth / 2;
        if (halfWidth > 0) {
          offset1 = ((offset1 % halfWidth) + halfWidth) % halfWidth - halfWidth;
          row1.style.transform = `translate3d(${offset1.toFixed(2)}px, 0, 0)`;
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
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
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  function boot() {
    ThemeController.init();
    initLenis();
    initGSAP();
    initScrollVelocity();
    initSpotlightCards();
    initTiltedCards();
    initClickSpark();
    initDecryptedText();
    initMagneticElements();
    initDock();
    initCrosshair();
    initDisciplineFilter();
    initPinout();
    initNavigation();
    initCopyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
