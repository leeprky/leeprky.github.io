import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import {
  CERTIFICATIONS_DATA,
  DISCIPLINES_DATA,
  DISCORD_THEMES,
  EDUCATION_DATA,
  EXPERIENCE_DATA,
  HOBBIES_DATA,
  OPERATOR_SPEC,
  SIDE_PURSUITS
} from './data/portfolioData';

// React Bits Components
import ClickSpark from './components/react-bits/ClickSpark/ClickSpark';
import CountUp from './components/react-bits/CountUp/CountUp';
import DecryptedText from './components/react-bits/DecryptedText/DecryptedText';
import Dock from './components/react-bits/Dock/Dock';
import ElectricBorder from './components/react-bits/ElectricBorder/ElectricBorder';
import GlareHover from './components/react-bits/GlareHover/GlareHover';
import Magnet from './components/react-bits/Magnet/Magnet';
import RotatingText from './components/react-bits/RotatingText/RotatingText';
import ScrollVelocity from './components/react-bits/ScrollVelocity/ScrollVelocity';
import ShinyText from './components/react-bits/ShinyText/ShinyText';
import SpotlightCard from './components/react-bits/SpotlightCard/SpotlightCard';
import TechText from './components/react-bits/TechText/TechText';
import TiltedCard, { TiltedCardLayer } from './components/react-bits/TiltedCard/TiltedCard';
import Waves from './components/react-bits/Waves/Waves';

// Custom Blueprint Engineering Instruments
import AutomotiveSchematic from './components/AutomotiveSchematic';
import CadProjectionsCarousel from './components/CadProjectionsCarousel';
import CircuitLabBench from './components/CircuitLabBench';
import DraftingCursor from './components/DraftingCursor';

const ACCENT_PRESETS = [
  { id: 'cyan', label: 'Cyanotype Blue', hex: '#38bdf8', rgb: '56 189 248', ink: '#030a16' },
  { id: 'cobalt', label: 'Cobalt Blueprint', hex: '#60a5fa', rgb: '96 165 250', ink: '#030a16' },
  { id: 'sky', label: 'Sky CAD Trace', hex: '#0ea5e9', rgb: '14 165 233', ink: '#ffffff' },
  { id: 'teal', label: 'Oscilloscope Teal', hex: '#2dd4bf', rgb: '45 212 191', ink: '#030a16' },
  { id: 'amber', label: 'Amber Redline', hex: '#fbbf24', rgb: '251 191 36', ink: '#1b1200' },
  { id: 'emerald', label: 'Signal Green', hex: '#34d399', rgb: '52 211 153', ink: '#030a16' }
];

const SHEET_IDS = ['about', 'education', 'experience', 'projects', 'hobbies', 'contact'];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('lp_theme') || 'blueprint');
  const [accentId, setAccentId] = useState(() => localStorage.getItem('lp_accent') || 'cyan');
  const [customHex, setCustomHex] = useState('#38bdf8');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bgWavesOn, setBgWavesOn] = useState(true);
  const [crosshairOn, setCrosshairOn] = useState(true);
  const [foldedSheets, setFoldedSheets] = useState({});
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('top');

  // Quick Dispatch Composer state
  const [dispatchSubject, setDispatchSubject] = useState('Engineering Placement / Technical Inquiry');
  const [dispatchSender, setDispatchSender] = useState('');
  const [dispatchBody, setDispatchBody] = useState('');

  // Resolve active accent color
  const activeAccent = useMemo(() => {
    if (accentId === 'custom') {
      const hex = customHex || '#38bdf8';
      const r = parseInt(hex.slice(1, 3), 16) || 56;
      const g = parseInt(hex.slice(3, 5), 16) || 189;
      const b = parseInt(hex.slice(5, 7), 16) || 248;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return {
        id: 'custom',
        hex,
        rgb: `${r} ${g} ${b}`,
        ink: lum > 0.6 ? '#030a16' : '#ffffff'
      };
    }
    const found = ACCENT_PRESETS.find((p) => p.id === accentId) || ACCENT_PRESETS[0];
    if (theme === 'whiteprint' && found.id === 'cyan') {
      return { ...found, hex: '#0a62c9', rgb: '10 98 201', ink: '#ffffff' };
    }
    return found;
  }, [accentId, customHex, theme]);

  // Apply theme & CSS custom properties to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--accent', activeAccent.hex);
    root.style.setProperty('--accent-rgb', activeAccent.rgb);
    root.style.setProperty('--accent-ink', activeAccent.ink);
    localStorage.setItem('lp_theme', theme);
    localStorage.setItem('lp_accent', accentId);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'whiteprint' ? '#eef3f9' : '#030814');
    }
  }, [theme, accentId, activeAccent]);

  // Initialize Lenis smooth scroll + scroll progress tracking
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis = null;
    let rafId = 0;

    if (!isTouch && !prefersReduced && window.innerWidth >= 960) {
      lenis = new Lenis({
        duration: 0.92,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
        autoResize: true
      });
      window.lenisInstance = lenis;

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setScrollProgress(pct);

      // Determine active section for nav & Dock
      let current = 'top';
      for (const id of SHEET_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  // Smooth scroll helper that automatically unfolds target sheet
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      if (window.lenisInstance) window.lenisInstance.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetId = id === 'schematics' ? 'projects' : id;
    setFoldedSheets((prev) => ({ ...prev, [targetId]: false }));

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        if (window.lenisInstance) {
          window.lenisInstance.scrollTo(el, { offset: -74 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 30);
  };

  // Keyboard navigation shortcuts (1-6, 0/H, T, C, F, Esc)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setThemeMenuOpen(false);
        setMobileMenuOpen(false);
        return;
      }
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const map = {
        '1': 'about',
        '2': 'education',
        '3': 'experience',
        '4': 'projects',
        '5': 'hobbies',
        '6': 'contact'
      };
      if (map[e.key]) {
        e.preventDefault();
        scrollToSection(map[e.key]);
      } else if (e.key === '0' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        scrollToSection('top');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme((prev) => (prev === 'whiteprint' ? 'blueprint' : 'whiteprint'));
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setCrosshairOn((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFoldedSheets((prev) => {
          const anyFolded = SHEET_IDS.some((id) => prev[id]);
          const next = {};
          SHEET_IDS.forEach((id) => {
            next[id] = !anyFolded;
          });
          return next;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleSheet = (id) => {
    setFoldedSheets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllSheetsFolded = (fold) => {
    const next = {};
    SHEET_IDS.forEach((id) => {
      next[id] = fold;
    });
    setFoldedSheets(next);
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (_) {
      // Fallback
    }
  };

  const filteredDisciplines = useMemo(() => {
    if (disciplineFilter === 'all') return DISCIPLINES_DATA;
    return DISCIPLINES_DATA.filter((d) => d.category === disciplineFilter);
  }, [disciplineFilter]);

  // React Bits Dock Items
  const dockItems = useMemo(
    () => [
      {
        id: 'dock-top',
        icon: <span className="dock-mono-glyph">00</span>,
        label: '00 // Hero Sheet',
        active: activeSection === 'top',
        onClick: () => scrollToSection('top')
      },
      {
        id: 'dock-about',
        icon: <span className="dock-mono-glyph">01</span>,
        label: '01 // About & Lab Bench',
        active: activeSection === 'about',
        onClick: () => scrollToSection('about')
      },
      {
        id: 'dock-education',
        icon: <span className="dock-mono-glyph">02</span>,
        label: '02 // Academic BOM',
        active: activeSection === 'education',
        onClick: () => scrollToSection('education')
      },
      {
        id: 'dock-experience',
        icon: <span className="dock-mono-glyph">03</span>,
        label: '03 // Career Logbook',
        active: activeSection === 'experience',
        onClick: () => scrollToSection('experience')
      },
      {
        id: 'dock-projects',
        icon: <span className="dock-mono-glyph">04</span>,
        label: '04 // Engineering Builds',
        active: activeSection === 'projects',
        onClick: () => scrollToSection('projects')
      },
      {
        id: 'dock-hobbies',
        icon: <span className="dock-mono-glyph">05</span>,
        label: '05 // Field Expeditions',
        active: activeSection === 'hobbies',
        onClick: () => scrollToSection('hobbies')
      },
      {
        id: 'dock-contact',
        icon: <span className="dock-mono-glyph">06</span>,
        label: '06 // Direct Dispatch',
        active: activeSection === 'contact',
        onClick: () => scrollToSection('contact')
      },
      { separator: true },
      {
        id: 'dock-caliper',
        icon: <span className="dock-mono-glyph">⌖</span>,
        label: crosshairOn ? 'CAD Crosshair: ON' : 'CAD Crosshair: OFF',
        active: crosshairOn,
        onClick: () => setCrosshairOn((v) => !v)
      },
      {
        id: 'dock-theme',
        icon: <span className="dock-mono-glyph">{theme === 'blueprint' ? '◐' : '◑'}</span>,
        label: theme === 'blueprint' ? 'Switch to Whiteprint Film' : 'Switch to Cyanotype Blueprint',
        active: false,
        onClick: () => setTheme((t) => (t === 'blueprint' ? 'whiteprint' : 'blueprint'))
      },
      {
        id: 'dock-cv',
        icon: <span className="dock-mono-glyph">CV</span>,
        label: 'Open Full CV Spec (PDF)',
        badge: 'PDF',
        badgeColor: activeAccent.hex,
        onClick: () => window.open(OPERATOR_SPEC.cvUrl, '_blank', 'noopener,noreferrer')
      }
    ],
    [activeSection, crosshairOn, theme, activeAccent.hex]
  );

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[LP-ENG-2026] ${dispatchSubject}`);
    const bodyLines = [
      dispatchSender ? `From / Organization: ${dispatchSender}` : '',
      '',
      dispatchBody || 'Hi Lee, I reviewed your Electrical Engineering blueprint portfolio and would like to connect.'
    ]
      .filter(Boolean)
      .join('\n');
    window.location.href = `mailto:${OPERATOR_SPEC.email}?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
  };

  return (
    <ClickSpark
      sparkColor={activeAccent.hex}
      sparkSize={12}
      sparkRadius={26}
      sparkCount={8}
      duration={440}
    >
      {/* Skip Link */}
      <a href="#content" className="skip-link">
        Skip to technical content [Alt+1]
      </a>

      {/* FIXED BLUEPRINT CAD GRID + REACT BITS WAVES VECTOR FIELD */}
      <div className="bp-grid" aria-hidden="true">
        <div className="bp-ortho-grid-lines" />
        {bgWavesOn && (
          <Waves
            lineColor={theme === 'whiteprint' ? '#0a62c9' : activeAccent.hex}
            accentColor={theme === 'whiteprint' ? '#0284c7' : '#bae6fd'}
            backgroundColor="transparent"
            lineStyle="dashed"
            spacing={24}
            lineWidth={0.9}
            rotation={-14}
            amplitude={24}
            scale={0.85}
            twist={0.8}
            speed={0.45}
            mouseInteraction={true}
            mouseRadius={190}
            mouseStrength={0.9}
            clickRipple={true}
            opacity={theme === 'whiteprint' ? 0.22 : 0.26}
            lightMode={theme === 'whiteprint'}
            className="bp-waves-canvas"
          />
        )}
      </div>

      {/* ISO 7200 / BS 8888 Drawing Frame with Zone Coordinates (1-7 / A-D) */}
      <div className="bp-frame" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={`top-${n}`} className="zx" style={{ left: `${n * 12.5}%` }}>
            {n}
          </span>
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={`bot-${n}`} className="zx b" style={{ left: `${n * 12.5}%` }}>
            {n}
          </span>
        ))}
        {['A', 'B', 'C', 'D'].map((letter, idx) => (
          <span key={`left-${letter}`} className="zy" style={{ top: `${(idx + 1) * 20}%` }}>
            {letter}
          </span>
        ))}
        {['A', 'B', 'C', 'D'].map((letter, idx) => (
          <span key={`right-${letter}`} className="zy r" style={{ top: `${(idx + 1) * 20}%` }}>
            {letter}
          </span>
        ))}
      </div>

      {/* React Bits Crosshair + Drag-to-Measure Millimeter CAD Caliper */}
      <DraftingCursor enabled={crosshairOn} accentHex={activeAccent.hex} />

      {/* =====================================================================
          STICKY BLUEPRINT HEADER
          ===================================================================== */}
      <header className="site-header">
        <div className="container">
          <a
            href="#top"
            id="brand-home-link"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('top');
            }}
            aria-label="Lee Parkinson — Return to top"
          >
            <div className="brand-mark" aria-hidden="true">
              {OPERATOR_SPEC.monogram}
            </div>
            <div className="brand-text">
              <div className="brand-name">LEE PARKINSON</div>
              <div className="brand-sub">{OPERATOR_SPEC.drawingNo}</div>
            </div>
          </a>

          {/* Desktop Drawing Sheet Nav */}
          <nav className="nav" aria-label="Drawing sheets">
            {[
              { id: 'about', num: '01', label: 'About' },
              { id: 'education', num: '02', label: 'Education' },
              { id: 'experience', num: '03', label: 'Experience' },
              { id: 'projects', num: '04', label: 'Projects' },
              { id: 'hobbies', num: '05', label: 'Hobbies' },
              { id: 'contact', num: '06', label: 'Dispatch' }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                id={`nav-link-${item.id}`}
                aria-current={activeSection === item.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
              >
                <span>{item.num}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Header Action Cluster */}
          <div className="header-actions">
            {/* CAD Crosshair Quick Toggle */}
            <button
              type="button"
              id="header-crosshair-toggle"
              className={`spec-badge crosshair-toggle-btn ${crosshairOn ? 'is-active' : ''}`}
              onClick={() => setCrosshairOn((v) => !v)}
              title="Toggle CAD Crosshair & Drag-to-Measure Caliper [Key: C]"
            >
              <span>⌖ CALIPER {crosshairOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* Blueprint Theme & Accent Palette Dropdown */}
            <div className={`accent-menu-wrap ${themeMenuOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                id="header-theme-toggle"
                className="spec-badge"
                onClick={() => setThemeMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={themeMenuOpen}
                aria-label="Toggle Drawing Accent Palette and Blueprint Mode"
              >
                <span>BLUEPRINT SPEC ▾</span>
              </button>

              <div className="accent-dropdown" role="menu" aria-label="Blueprint Accent Palette">
                <div className="tiny mono muted" style={{ marginBottom: '0.35rem' }}>
                  DRAWING ACCENT PALETTE
                </div>
                <div className="swatch-grid">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      id={`swatch-${preset.id}`}
                      className={`swatch-btn ${accentId === preset.id ? 'is-active' : ''}`}
                      style={{ background: preset.hex }}
                      title={preset.label}
                      aria-label={preset.label}
                      onClick={() => setAccentId(preset.id)}
                    />
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    gap: '0.5rem'
                  }}
                >
                  <span className="tiny mono" style={{ color: 'var(--ink-2)' }}>
                    Custom Trace Hex:
                  </span>
                  <input
                    type="color"
                    id="accent-custom-picker"
                    value={activeAccent.hex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setAccentId('custom');
                    }}
                    style={{
                      width: '34px',
                      height: '24px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                    title="Pick custom blueprint trace color"
                  />
                </div>

                {/* Schematic Film Mode (Dark Blueprint vs Light Whiteprint) */}
                <div style={{ borderTop: '1px dashed var(--line)', marginTop: '0.65rem', paddingTop: '0.5rem' }}>
                  <div className="tiny mono muted" style={{ marginBottom: '0.35rem' }}>
                    SCHEMATIC FILM MODE [KEY: T]:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      id="theme-btn-blueprint"
                      className={`btn btn-sm ${theme === 'blueprint' ? 'btn-primary' : ''}`}
                      onClick={() => setTheme('blueprint')}
                      style={{ fontSize: '0.68rem', padding: '0.3rem 0.45rem' }}
                    >
                      <span>CYANOTYPE (DARK)</span>
                    </button>
                    <button
                      type="button"
                      id="theme-btn-whiteprint"
                      className={`btn btn-sm ${theme === 'whiteprint' ? 'btn-primary' : ''}`}
                      onClick={() => setTheme('whiteprint')}
                      style={{ fontSize: '0.68rem', padding: '0.3rem 0.45rem' }}
                    >
                      <span>WHITEPRINT (LIGHT)</span>
                    </button>
                  </div>
                </div>

                {/* React Bits Waves Toggle */}
                <div style={{ borderTop: '1px dashed var(--line)', marginTop: '0.65rem', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    id="toggle-bg-waves"
                    className={`btn btn-sm ${bgWavesOn ? 'btn-primary' : ''}`}
                    onClick={() => setBgWavesOn((v) => !v)}
                    style={{ width: '100%', fontSize: '0.68rem' }}
                  >
                    <span>{bgWavesOn ? '◈ VECTOR WAVE FIELD: ACTIVE' : '◇ VECTOR WAVE FIELD: PAUSED'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CV Spec PDF Button */}
            <Magnet padding={40} magnetStrength={3}>
              <a
                href={OPERATOR_SPEC.cvUrl}
                id="header-cv-btn"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <span>CV SPEC</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </Magnet>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              id="mobile-menu-toggle"
              className="icon-btn menu-btn"
              aria-label="Toggle navigation drawer"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll Progress Meter */}
        <div className="scroll-meter" aria-hidden="true">
          <i style={{ transform: `scaleX(${scrollProgress})` }} />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`drawer ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation">
        {[
          { id: 'about', code: '01 //', name: 'About & IC Lab Bench' },
          { id: 'education', code: '02 //', name: 'Academic Qualifications' },
          { id: 'experience', code: '03 //', name: 'Career Logbook' },
          { id: 'projects', code: '04 //', name: 'Engineering Projects' },
          { id: 'hobbies', code: '05 //', name: 'Field Expeditions' },
          { id: 'contact', code: '06 //', name: 'Direct Dispatch' }
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
            }}
          >
            <span>{item.code}</span> {item.name}
          </a>
        ))}
      </div>

      <main id="content">
        {/* =====================================================================
            00. HERO SPECIFICATION SHEET
            ===================================================================== */}
        <section id="top" className="hero section">
          {/* Background Technical CAD / PCB Circuit Traces */}
          <div className="hero-art" aria-hidden="true">
            <svg className="hero-circuit" viewBox="0 0 760 480">
              <path className="trace" d="M20,40 L160,40 L210,90 L420,90 L460,50 L680,50" />
              <path className="trace trace-accent" d="M120,120 L240,120 L290,170 L520,170 L560,210 L740,210" />
              <path className="trace" d="M60,200 L180,200 L210,230 L380,230 L420,190 L640,190" />
              <path className="trace trace-mark" d="M280,300 L390,300 L440,350 L660,350 L700,310" />
              <circle className="node" cx="160" cy="40" r="3.5" />
              <circle className="node" cx="420" cy="90" r="3.5" />
              <circle className="node" cx="240" cy="120" r="3.5" />
              <circle className="node" cx="520" cy="170" r="3.5" />
              <circle className="node" cx="380" cy="230" r="3.5" />
              <circle className="node" cx="440" cy="350" r="3.5" />
            </svg>
          </div>

          <div className="container">
            <div className="hero-grid">
              {/* Left Column: Technical Specification & Interactive Wordmark */}
              <div className="hero-copy">
                <div className="status-pill">
                  <span className="status-dot" />
                  <ShinyText
                    text="UCLAN ELECTRICAL ENGINEERING // PRESTON, LANCASHIRE UK"
                    color={theme === 'whiteprint' ? '#1f3d63' : '#c6daf2'}
                    shineColor={activeAccent.hex}
                    speed={3}
                    className="mono"
                  />
                </div>

                {/* React Bits · TechText Dynamic Interactive CAD Wordmark */}
                <h1 className="display hero-name" aria-label="Lee Parkinson">
                  <div
                    className="tech-text-host"
                    title="Interactive CAD Wordmark — Hover, click, or drag letters"
                  >
                    <TechText
                      text="Lee Parkinson"
                      fontFamily="'Space Grotesk', sans-serif"
                      fontWeight={700}
                      fontSize={92}
                      letterSpacing={-0.03}
                      align="left"
                      color={theme === 'whiteprint' ? '#0a2140' : '#f0f6ff'}
                      accentColor={activeAccent.hex}
                      reveal="letter"
                      dashLength={4}
                      dashGap={2}
                      strokeWidth={1.5}
                      specks={14}
                      selection={true}
                      labels={true}
                      draggable={true}
                      bounce={0.42}
                      clickKick={true}
                      sweep={true}
                      speed={0.9}
                      guides={true}
                      style={{ width: '100%', height: 'clamp(68px, 9vw, 112px)' }}
                    />
                    <span className="sr-only">Lee Parkinson</span>
                  </div>
                </h1>

                {/* React Bits · RotatingText Dynamic Engineering Discipline Readout */}
                <div className="hero-role">
                  <span className="mono accent" style={{ marginRight: '0.5rem' }}>
                    SPEC //
                  </span>
                  <RotatingText
                    texts={OPERATOR_SPEC.rotatingRoles}
                    rotationInterval={2600}
                    staggerDuration={0.018}
                    splitBy="characters"
                    mainClassName="hero-rotating-badge mono"
                  />
                  <span className="caret" aria-hidden="true" />
                </div>

                <p className="lead bh-paragraph">
                  <span className="bh-phrase">Electrical Engineering</span> student at the{' '}
                  <span className="bh-phrase">University of Lancashire (UCLan)</span> in Preston. Passionate about
                  hands-on diagnostics and practical problem-solving — whether that&apos;s probing{' '}
                  <span className="bh-phrase bh-phrase-amber">12V automotive systems</span> with FORScan, testing
                  circuits in the lab, or building custom PC rigs and modular software.
                </p>

                {/* Primary Hero CTAs wrapped in React Bits Magnet */}
                <div className="hero-cta">
                  <Magnet padding={45} magnetStrength={2.5}>
                    <a
                      href="#contact"
                      id="hero-cta-contact"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('contact');
                      }}
                    >
                      <span>Dispatch Inquiry</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  </Magnet>

                  <Magnet padding={40} magnetStrength={3}>
                    <a
                      href="#projects"
                      id="hero-cta-schematics"
                      className="btn"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('projects');
                      }}
                    >
                      <span>Inspect Schematics &amp; CAD</span>
                    </a>
                  </Magnet>

                  <Magnet padding={40} magnetStrength={3}>
                    <a
                      href={OPERATOR_SPEC.cvUrl}
                      id="hero-cta-cv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                    >
                      <span>Full CV Spec (PDF) ↗</span>
                    </a>
                  </Magnet>
                </div>

                {/* Engineering Specification Table + React Bits CountUp Telemetry */}
                <dl className="spec">
                  <div>
                    <dt>Operator</dt>
                    <dd>Lee Parkinson</dd>
                  </div>
                  <div>
                    <dt>Age / Base</dt>
                    <dd>
                      <CountUp to={21} duration={1.4} /> · Preston, UK
                    </dd>
                  </div>
                  <div>
                    <dt>Academic Track</dt>
                    <dd>Electrical Engineering</dd>
                  </div>
                  <div>
                    <dt>Active Role</dt>
                    <dd>Bar Team Leader</dd>
                  </div>
                </dl>
              </div>

              {/* Right Column: Operator Portrait with Dimension Callouts & React Bits TiltedCard */}
              <div className="portrait">
                <div className="dim dim-h" aria-hidden="true">
                  <b>285mm // WIDTH</b>
                </div>
                <div className="dim dim-v" aria-hidden="true">
                  <b>380mm // HEIGHT</b>
                </div>

                <TiltedCard
                  imageSrc="assets/images/lee-portrait.jpg"
                  altText="Lee Parkinson portrait photograph"
                  captionText="Click card to flip Operator Telemetry Spec"
                  containerHeight="410px"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  scaleOnHover={1.03}
                  rotateAmplitude={10}
                  radius={4}
                  glare={0.35}
                  displayOverlayContent={true}
                  overlayContent={
                    <TiltedCardLayer depth={28} className="portrait-overlay-layer">
                      <div className="portrait-tag mono">FIG 00.1 // OPERATOR [CLICK TO FLIP]</div>
                    </TiltedCardLayer>
                  }
                  backContent={
                    <div className="portrait-back-spec mono">
                      <div className="portrait-back-head">
                        <span className="accent">OPERATOR TELEMETRY CARD</span>
                        <span>DWG: LP-2026</span>
                      </div>
                      <div className="portrait-back-rows">
                        <div>
                          <span>IDENTIFICATION:</span>
                          <b>LEE PARKINSON (21)</b>
                        </div>
                        <div>
                          <span>INSTITUTION:</span>
                          <b>UNIVERSITY OF LANCASHIRE (UCLAN)</b>
                        </div>
                        <div>
                          <span>DISCIPLINE:</span>
                          <b>BEng / FY ELECTRICAL ENGINEERING</b>
                        </div>
                        <div>
                          <span>DIAGNOSTICS:</span>
                          <b>FORSCAN · OBD-II · 12V HARNESS</b>
                        </div>
                        <div>
                          <span>QUALIFICATIONS:</span>
                          <b>BTEC IT D*D* · DIGITAL ICT D*2</b>
                        </div>
                        <div>
                          <span>CLEARANCE:</span>
                          <b>UK MANUAL LICENCE · ACT · DofE</b>
                        </div>
                      </div>
                      <div className="portrait-back-foot">CLICK TO RETURN TO OPTICAL VIEW ↺</div>
                    </div>
                  }
                />

                <div className="portrait-caption">
                  <span className="mono">UCLAN CAMPUS // PRESTON</span>
                  <span className="hand">&quot;learning by getting hands dirty&quot;</span>
                </div>
              </div>
            </div>

            {/* BS-8888 / ISO-7200 Engineering Title Block */}
            <div className="title-block">
              <div>
                <span>PROJECT SPECIFICATION</span>
                <b>ELECTRICAL ENGINEERING PORTFOLIO</b>
              </div>
              <div>
                <span>DRAWING NO.</span>
                <b className="mono accent">LP-2026-EE</b>
              </div>
              <div>
                <span>REVISION</span>
                <b className="mono">REV 14.0</b>
              </div>
              <div>
                <span>SCALE</span>
                <b className="mono">1:1 CAD</b>
              </div>
              <div>
                <span>LOCATION</span>
                <b>UCLAN PRESTON</b>
              </div>
              <div>
                <span>STATUS</span>
                <b className="mono accent">APPROVED ✓</b>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            REACT BITS · SCROLL VELOCITY BLUEPRINT SPECIFICATION TICKER
            ===================================================================== */}
        <div className="velocity-ticker-band" aria-hidden="true">
          <ScrollVelocity
            texts={[
              'BS 8888 TECHNICAL DRAWING // UNIVERSITY OF LANCASHIRE (UCLAN) // ELECTRICAL ENGINEERING // FORSCAN & OBD-II DIAGNOSTICS // 12V AUTOMOTIVE SYSTEMS // BTEC IT DISTINCTION* D*D* // PIONEER LIVE SOUND //'
            ]}
            velocity={42}
            numCopies={4}
            className="velocity-ticker-item mono"
          />
        </div>

        {/* =====================================================================
            DRAFTING SHEETS CONTROL TOOLBAR
            ===================================================================== */}
        <div className="sheets-toolbar-wrap container">
          <div className="sheets-toolbar">
            <div className="sheets-toolbar-status">
              <span className="status-dot" />
              <span className="mono">
                DRAFTING SHEETS // 06 SECTIONS &bull; CLICK ANY HEADER TO FOLD / EXPAND &bull; DRAG BACKGROUND TO MEASURE
              </span>
            </div>
            <div className="sheets-toolbar-actions">
              <span className="desktop-shortcut-hint" title="PC Keyboard Shortcuts Active">
                <span>⌨ KEYS:</span>
                <kbd>1-6</kbd> JUMP
                <kbd>T</kbd> FILM
                <kbd>C</kbd> CALIPER
                <kbd>F</kbd> FOLD
              </span>
              <a
                href={OPERATOR_SPEC.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
              >
                <span>📄 FULL CV</span>
              </a>
              <button
                type="button"
                id="btn-fold-all-sheets"
                className="btn btn-sm"
                onClick={() => setAllSheetsFolded(true)}
              >
                <span>[-] FOLD ALL</span>
              </button>
              <button
                type="button"
                id="btn-expand-all-sheets"
                className="btn btn-sm"
                onClick={() => setAllSheetsFolded(false)}
              >
                <span>[+] EXPAND ALL</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            01. ABOUT ME, FIELD NOTES & INTERACTIVE IC-LP2026 LAB BENCH
            ===================================================================== */}
        <section id="about" className={`section ${foldedSheets.about ? 'is-folded' : ''}`}>
          <div className="container">
            <div
              className="sheet-head"
              role="button"
              tabIndex={0}
              aria-expanded={!foldedSheets.about}
              aria-controls="sheet-body-about"
              onClick={() => toggleSheet('about')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSheet('about');
                }
              }}
            >
              <div className="sheet-meta">
                <span className="sheet-no">SHEET 01</span>
                <div className="sheet-rule" />
                <span className="sheet-code">
                  <DecryptedText
                    text="LP-SHT-01 // PROFILE, TOOLKIT & IC PINOUT"
                    animateOn="view"
                    speed={35}
                  />
                </span>
              </div>
              <div className="sheet-title-row">
                <div className="sheet-heading-group">
                  <span className="sheet-tag-badge">01 // ABOUT ME</span>
                  <h2 className="h2">
                    A Bit About Me &amp; Lab Bench<span className="accent">.</span>
                  </h2>
                </div>
                <div className="sheet-state-badge">
                  <span className="sheet-state-text">
                    {foldedSheets.about ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                  </span>
                  <svg
                    className="sheet-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <p className="lead">
                Growing up, I&apos;ve always loved technology, mechanics, electrics, and computing — whether taking
                hardware apart to understand how it ticks, building custom PCs, or diagnosing vehicles.
              </p>
            </div>

            <div className="sheet-body" id="sheet-body-about">
              <div className="profile-grid">
                <div className="profile-copy body">
                  <p>
                    I&apos;m <strong>21</strong> and based in <strong>Preston &amp; Blackpool, Lancashire</strong>,
                    completing my Foundation Year in <span className="bh-phrase">Electrical Engineering</span> at the{' '}
                    <span className="bh-phrase">University of Lancashire (UCLan)</span> alongside working as a{' '}
                    <span className="bh-phrase bh-phrase-amber">Bar Team Leader</span> at Wetherspoons (The Velvet
                    Coaster in Blackpool &amp; The Twelve Tellers in Preston).
                  </p>
                  <p>
                    Before starting university, I worked as an Apprentice Automotive Technician at{' '}
                    <strong>Car Cosmetics</strong>, gaining hands-on workshop experience diagnosing mechanical and 12V
                    electrical faults with <strong>FORScan and OBD-II scanners</strong>, servicing engines, bleeding
                    hydraulic brakes, and installing performance components.
                  </p>
                  <p>
                    Outside of academics and shift leadership, I&apos;m usually out in the workshop maintaining my red{' '}
                    <strong>BMW E90 3 Series</strong>, soldering or modding PC hardware, scrambling fells in the Lake
                    District, or engineering custom UI themes and live DJ sets.
                  </p>

                  <div className="chips" style={{ marginTop: '1.25rem' }}>
                    <span className="chip">Preston &amp; Blackpool, UK</span>
                    <span className="chip">University of Lancashire (UCLan)</span>
                    <span className="chip">Electrical Engineering</span>
                    <span className="chip">FORScan &amp; OBD-II Diagnostics</span>
                    <span className="chip">Shift Operations Leadership</span>
                    <span className="chip">Full UK Manual Licence</span>
                  </div>
                </div>

                {/* Redline Field Notes Panel */}
                <SpotlightCard
                  className="panel field-notes"
                  spotlightColor={activeAccent.hex}
                  intensity={0.18}
                  borderGlow={0.75}
                  theme={theme === 'whiteprint' ? 'light' : 'dark'}
                >
                  <div className="panel-head">
                    <span className="panel-id">DWG NOTE // 01-A</span>
                    <span className="tag tag-mark">FIELD NOTES</span>
                  </div>
                  <p className="hand">
                    &quot;I&apos;ve always learned best by getting hands-on — whether that&apos;s working on a car,
                    wiring something up, or building it on a PC.&quot;
                  </p>
                  <ul>
                    <li>
                      <strong>Discipline:</strong> Electrical Engineering @ UCLan
                    </li>
                    <li>
                      <strong>Diagnostics:</strong> FORScan, OBD-II, Multimeter &amp; Oscilloscope
                    </li>
                    <li>
                      <strong>Leadership:</strong> Bar Team Leader @ Wetherspoons
                    </li>
                    <li>
                      <strong>Hands-On:</strong> Automotive 12V, Hydraulics, PC Hardware &amp; Live PA
                    </li>
                  </ul>
                  <div style={{ marginTop: '1.15rem' }}>
                    <a
                      href="#education"
                      className="panel-link"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('education');
                      }}
                    >
                      Proceed to Academic Qualifications (Sheet 02) →
                    </a>
                  </div>
                </SpotlightCard>
              </div>

              {/* Interactive IC-LP2026 Pinout & Live Oscilloscope Lab Bench */}
              <CircuitLabBench accentHex={activeAccent.hex} theme={theme} />
            </div>
          </div>
        </section>

        {/* =====================================================================
            02. ACADEMIC QUALIFICATIONS & CERTIFICATIONS (BILL OF MATERIALS)
            ===================================================================== */}
        <section id="education" className={`section ${foldedSheets.education ? 'is-folded' : ''}`}>
          <div className="container">
            <div
              className="sheet-head"
              role="button"
              tabIndex={0}
              aria-expanded={!foldedSheets.education}
              aria-controls="sheet-body-education"
              onClick={() => toggleSheet('education')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSheet('education');
                }
              }}
            >
              <div className="sheet-meta">
                <span className="sheet-no">SHEET 02</span>
                <div className="sheet-rule" />
                <span className="sheet-code">
                  <DecryptedText
                    text="LP-SHT-02 // ACADEMIC QUALIFICATIONS & CERTIFICATIONS"
                    animateOn="view"
                    speed={35}
                  />
                </span>
              </div>
              <div className="sheet-title-row">
                <div className="sheet-heading-group">
                  <span className="sheet-tag-badge">02 // EDUCATION</span>
                  <h2 className="h2">
                    Academic Qualifications<span className="accent">.</span>
                  </h2>
                </div>
                <div className="sheet-state-badge">
                  <span className="sheet-state-text">
                    {foldedSheets.education ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                  </span>
                  <svg
                    className="sheet-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <p className="lead">
                Formal technical education record across electrical engineering, computing, IT infrastructure, and
                verified operational certifications.
              </p>
            </div>

            <div className="sheet-body" id="sheet-body-education">
              <div className="qual-list">
                {EDUCATION_DATA.map((edu) => (
                  <SpotlightCard
                    key={edu.id}
                    className={`qual-card ${edu.featured ? 'featured' : ''}`}
                    spotlightColor={activeAccent.hex}
                    intensity={0.16}
                    borderGlow={0.7}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <div className="qual-head">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="tag">[{edu.id}]</span>
                          <h3 className="h3" style={{ display: 'inline', margin: 0 }}>
                            {edu.institution}
                          </h3>
                          <span className="tag tag-outline">{edu.badge}</span>
                        </div>
                        <div className="mono" style={{ color: 'var(--accent)', fontSize: '0.86rem', marginTop: '0.35rem' }}>
                          {edu.qualification}
                        </div>
                      </div>
                      <div className="qual-meta">
                        <div>{edu.period}</div>
                        <div>{edu.location}</div>
                        <div className="hand" style={{ color: 'var(--mark)', fontSize: '0.9rem' }}>
                          {edu.annotation}
                        </div>
                      </div>
                    </div>

                    <p className="body small" style={{ marginTop: '0.65rem', lineHeight: 1.55 }}>
                      {edu.summary}
                    </p>

                    <div className={edu.grades.length > 2 ? 'grade-grid-3' : 'grade-grid-2'}>
                      {edu.grades.map((g) => (
                        <div key={g.label} className={`grade-box ${g.highlight ? 'highlight' : ''}`}>
                          <div style={{ fontSize: '9.5px', opacity: 0.82, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {g.label}
                          </div>
                          <div style={{ fontWeight: 700, marginTop: '2px' }}>{g.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="chips" style={{ marginTop: '0.75rem' }}>
                      {edu.modules.map((m) => (
                        <span key={m} className="chip">
                          {m}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              {/* Verified Certifications & Development Programs from CV */}
              <div className="subhead" style={{ marginTop: '1.5rem' }}>
                <h3>
                  <span className="mono">02.2 // VERIFIED CERTIFICATIONS</span> Licences, Safety &amp; Leadership
                  Credentials
                </h3>
                <span className="hand">&quot;verified on CV specification&quot;</span>
              </div>

              <div className="cert-grid">
                {CERTIFICATIONS_DATA.map((cert) => (
                  <SpotlightCard
                    key={cert.code}
                    className="panel cert-card"
                    spotlightColor={activeAccent.hex}
                    intensity={0.15}
                    borderGlow={0.65}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <div className="panel-head" style={{ marginBottom: '0.45rem' }}>
                      <span className="panel-id">{cert.code}</span>
                      <span className="tiny mono accent">{cert.date}</span>
                    </div>
                    <h4 className="h3" style={{ fontSize: '1.02rem' }}>
                      {cert.title}
                    </h4>
                    <p className="body small" style={{ marginTop: '0.35rem' }}>
                      {cert.detail}
                    </p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            03. OPERATIONAL CAREER LOGBOOK (EXPERIENCE)
            ===================================================================== */}
        <section id="experience" className={`section ${foldedSheets.experience ? 'is-folded' : ''}`}>
          <div className="container">
            <div
              className="sheet-head"
              role="button"
              tabIndex={0}
              aria-expanded={!foldedSheets.experience}
              aria-controls="sheet-body-experience"
              onClick={() => toggleSheet('experience')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSheet('experience');
                }
              }}
            >
              <div className="sheet-meta">
                <span className="sheet-no">SHEET 03</span>
                <div className="sheet-rule" />
                <span className="sheet-code">
                  <DecryptedText
                    text="LP-SHT-03 // OPERATIONAL CAREER LOGBOOK"
                    animateOn="view"
                    speed={35}
                  />
                </span>
              </div>
              <div className="sheet-title-row">
                <div className="sheet-heading-group">
                  <span className="sheet-tag-badge">03 // EXPERIENCE</span>
                  <h2 className="h2">
                    Work Experience &amp; Logbook<span className="accent">.</span>
                  </h2>
                </div>
                <div className="sheet-state-badge">
                  <span className="sheet-state-text">
                    {foldedSheets.experience ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                  </span>
                  <svg
                    className="sheet-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <p className="lead">
                Verified operational career logbook — high-volume shift leadership, workshop automotive diagnostics with
                FORScan &amp; OBD-II, multi-drop logistics, and amusement ride safety operations.
              </p>
            </div>

            <div className="sheet-body" id="sheet-body-experience">
              <div className="timeline">
                <div className="timeline-rail" aria-hidden="true">
                  <i style={{ transform: 'scaleY(1)' }} />
                </div>

                {EXPERIENCE_DATA.map((job) => (
                  <SpotlightCard
                    key={job.id}
                    className={`panel job ${job.current ? 'is-current' : ''}`}
                    spotlightColor={activeAccent.hex}
                    intensity={0.16}
                    borderGlow={0.7}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <div className="job-grid">
                      <div>
                        <div className="job-title">
                          <span className={`tag ${job.current ? '' : 'tag-outline'}`}>{job.id}</span>
                          <h3 className="h3">{job.company}</h3>
                          <span className="mono small muted">&bull; {job.location}</span>
                        </div>
                        <div className="job-role">{job.role}</div>
                        <ul>
                          {job.bullets.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>

                        {job.venues && (
                          <div className="venues">
                            {job.venues.map((v) => (
                              <div key={v.name} className="venue">
                                <b>{v.name}</b>
                                <p>{v.desc}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="job-when">
                        <b>{job.period}</b>
                        <span>{job.badge}</span>
                        {job.annotation && (
                          <span className="hand" style={{ display: 'block', marginTop: '0.3rem' }}>
                            {job.annotation}
                          </span>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            04. ENGINEERING PROJECTS, CAD PROJECTIONS, DISCORD THEMES & AUDIO
            ===================================================================== */}
        <section id="projects" className={`section ${foldedSheets.projects ? 'is-folded' : ''}`}>
          <div className="container">
            <div
              className="sheet-head"
              role="button"
              tabIndex={0}
              aria-expanded={!foldedSheets.projects}
              aria-controls="sheet-body-projects"
              onClick={() => toggleSheet('projects')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSheet('projects');
                }
              }}
            >
              <div className="sheet-meta">
                <span className="sheet-no">SHEET 04</span>
                <div className="sheet-rule" />
                <span className="sheet-code">
                  <DecryptedText
                    text="LP-SHT-04 // ENGINEERING BUILDS, CAD & SCHEMATICS"
                    animateOn="view"
                    speed={35}
                  />
                </span>
              </div>
              <div className="sheet-title-row">
                <div className="sheet-heading-group">
                  <span className="sheet-tag-badge">04 // PROJECTS</span>
                  <h2 className="h2">
                    Engineering Projects &amp; Schematics<span className="accent">.</span>
                  </h2>
                </div>
                <div className="sheet-state-badge">
                  <span className="sheet-state-text">
                    {foldedSheets.projects ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                  </span>
                  <svg
                    className="sheet-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <p className="lead">
                Hands-on technical builds, cross-disciplinary engineering schematics, orthographic BS 8888 CAD
                projections, open-source UI themes, and live sound engineering.
              </p>
            </div>

            <div className="sheet-body" id="sheet-body-projects">
              {/* 04.1 Filterable Technical Disciplines */}
              <div id="schematics">
                <div className="filters" role="group" aria-label="Filter technical disciplines">
                  {[
                    { id: 'all', label: 'ALL DISCIPLINES (4)' },
                    { id: 'electrical', label: 'ELECTRICAL ENGINEERING' },
                    { id: 'automotive', label: 'AUTOMOTIVE 12V & OBD-II' },
                    { id: 'digital', label: 'ICT SYSTEMS (D*D*)' },
                    { id: 'cs', label: 'COMPUTER SCIENCE' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      id={`filter-btn-${f.id}`}
                      aria-pressed={disciplineFilter === f.id}
                      onClick={() => setDisciplineFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="disc-grid">
                  {filteredDisciplines.map((d) => (
                    <SpotlightCard
                      key={d.id}
                      className="panel disc-card"
                      spotlightColor={activeAccent.hex}
                      intensity={0.18}
                      borderGlow={0.75}
                      theme={theme === 'whiteprint' ? 'light' : 'dark'}
                    >
                      <div className="panel-head">
                        <span className="panel-id">{d.code}</span>
                        <span className="tiny mono accent">{d.meta}</span>
                      </div>
                      <h3 className="h3">{d.title}</h3>
                      <p className="body small">{d.description}</p>
                      <div className="chips">
                        {d.chips.map((c) => (
                          <span key={c} className="chip">
                            {c}
                          </span>
                        ))}
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>

              {/* 04.2 Interactive Automotive 12V & Mechanical Schematic */}
              <AutomotiveSchematic accentHex={activeAccent.hex} theme={theme} />

              {/* 04.3 Hand-Drawn Orthographic CAD Projections 3D Coverflow + Lightbox */}
              <CadProjectionsCarousel />

              {/* 04.4 Discord Client Themes & UI CSS Showcase */}
              <div className="subhead" style={{ marginTop: '2rem' }}>
                <h3>
                  <span className="mono">04.3 // DISCORD THEMES</span> Open-Source Discord Client Themes &amp; UI CSS
                </h3>
                <span className="hand">&quot;400+ community members worldwide&quot;</span>
              </div>

              <SpotlightCard
                className="showcase-panel"
                spotlightColor={activeAccent.hex}
                intensity={0.16}
                borderGlow={0.75}
                theme={theme === 'whiteprint' ? 'light' : 'dark'}
              >
                <div className="panel-head" style={{ marginBottom: '0.85rem' }}>
                  <span className="panel-id">THEME-SHOWCASE // LIVE UI PREVIEW</span>
                  <a
                    href={OPERATOR_SPEC.betterDiscord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-link"
                  >
                    BetterDiscord Developer Profile ↗
                  </a>
                </div>
                <div className="showcase-grid">
                  <GlareHover
                    borderRadius="4px"
                    glareColor={activeAccent.hex}
                    glareOpacity={0.35}
                    className="showcase-gif-box"
                  >
                    <img
                      src="assets/images/discord-theme-showcase.gif"
                      alt="Discord custom themes live showcase preview"
                      loading="lazy"
                      width="600"
                      height="340"
                    />
                    <a
                      href="assets/images/discord-theme-showcase.gif"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gif-open-btn"
                    >
                      Open Full GIF ↗
                    </a>
                  </GlareHover>
                  <div>
                    <h4 className="h3" style={{ color: 'var(--ink)' }}>
                      Vintage, WindowsXI &amp; MaterialYou in Action
                    </h4>
                    <p className="body small" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
                      Animated demonstration of my custom Discord client themes engineered with modular CSS variables,
                      hardware-accelerated animations, acrylic backdrop filters, and custom SVG icon suites. Maintained
                      for BetterDiscord and Vencord users worldwide with active GitHub releases.
                    </p>
                    <div className="chips" style={{ marginTop: '1rem' }}>
                      <span className="chip">Vintage v0.9</span>
                      <span className="chip">WindowsXI × MaterialYou</span>
                      <span className="chip">BetterDiscord &amp; Vencord</span>
                      <span className="chip">400+ Community Members</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              <div className="grid grid-3" style={{ marginTop: '1rem' }}>
                {DISCORD_THEMES.map((th) => (
                  <SpotlightCard
                    key={th.id}
                    className="panel"
                    spotlightColor={activeAccent.hex}
                    intensity={0.18}
                    borderGlow={0.75}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <div className="panel-head">
                      <span className="panel-id">
                        {th.id} // {th.meta}
                      </span>
                      <a href={th.url} target="_blank" rel="noopener noreferrer" className="panel-link">
                        GitHub ↗
                      </a>
                    </div>
                    <h4 className="h3">{th.name}</h4>
                    <p className="body small" style={{ marginTop: '0.4rem' }}>
                      {th.description}
                    </p>
                    <div className="chips" style={{ marginTop: '0.85rem' }}>
                      {th.chips.map((c) => (
                        <span key={c} className="chip">
                          {c}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              {/* 04.5 Live Audio & DJ Engineering */}
              <div className="subhead" style={{ marginTop: '2rem' }}>
                <h3>
                  <span className="mono">04.4 // AUDIO ENGINEERING</span> Live Sound &amp; Pioneer DJ Projects
                </h3>
                <span className="hand">&quot;live booth, acoustic tuning &amp; sets&quot;</span>
              </div>

              <SpotlightCard
                className="panel"
                spotlightColor={activeAccent.hex}
                intensity={0.16}
                borderGlow={0.7}
                theme={theme === 'whiteprint' ? 'light' : 'dark'}
              >
                <div className="audio-grid">
                  <div>
                    <div className="panel-head" style={{ marginBottom: '0.6rem' }}>
                      <span className="panel-id">AUDIO-01 // LIVE SOUND &amp; SETUPS</span>
                      <span className="tiny mono accent">PIONEER PRO DJ</span>
                    </div>
                    <h4 className="h3" style={{ color: 'var(--ink)' }}>
                      Pioneer DJ Rig &amp; Live Sound Reinforcement
                    </h4>
                    <p className="body small" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
                      Hands-on experience DJing live events at venues. Practical mastery of Pioneer DJ decks, club
                      mixers, balanced XLR/TRS signal routing, gain staging, active PA acoustics, EQ tuning, and
                      frequency separation.
                    </p>
                    <div className="chips" style={{ marginTop: '0.85rem' }}>
                      <span className="chip">Pioneer DJ</span>
                      <span className="chip">Signal Routing</span>
                      <span className="chip">Gain Staging</span>
                      <span className="chip">Live Sound PA</span>
                      <span className="chip">Acoustic Tuning</span>
                    </div>
                    <div
                      style={{
                        marginTop: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <Magnet padding={35} magnetStrength={2.5}>
                        <a
                          href={OPERATOR_SPEC.soundcloud}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                          <span>Listen on SoundCloud (leethal04) ↗</span>
                        </a>
                      </Magnet>
                      <span className="mono tiny muted">SOUNDCLOUD.COM/LEETHAL04</span>
                    </div>
                  </div>

                  <div className="audio-figs">
                    <div className="figure">
                      <GlareHover borderRadius="2px" glareColor={activeAccent.hex} className="figure-frame ratio-34">
                        <img
                          src="assets/images/dj-block.jpg"
                          alt="Lee Parkinson live DJ setup booth"
                          loading="lazy"
                          width="600"
                          height="800"
                        />
                      </GlareHover>
                      <figcaption>
                        <span>FIG 04.4A // BOOTH</span>
                        <span className="hand">&quot;live booth&quot;</span>
                      </figcaption>
                    </div>
                    <div className="figure">
                      <GlareHover borderRadius="2px" glareColor={activeAccent.hex} className="figure-frame ratio-34">
                        <img
                          src="assets/images/dj-lee.jpg"
                          alt="Lee Parkinson on the decks"
                          loading="lazy"
                          width="600"
                          height="800"
                        />
                      </GlareHover>
                      <figcaption>
                        <span>FIG 04.4B // DECKS</span>
                        <span className="hand">&quot;on the decks&quot;</span>
                      </figcaption>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* =====================================================================
            05. FIELD SYSTEMS & EXPEDITIONS (HOBBIES)
            ===================================================================== */}
        <section id="hobbies" className={`section ${foldedSheets.hobbies ? 'is-folded' : ''}`}>
          <div className="container">
            <div
              className="sheet-head"
              role="button"
              tabIndex={0}
              aria-expanded={!foldedSheets.hobbies}
              aria-controls="sheet-body-hobbies"
              onClick={() => toggleSheet('hobbies')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSheet('hobbies');
                }
              }}
            >
              <div className="sheet-meta">
                <span className="sheet-no">SHEET 05</span>
                <div className="sheet-rule" />
                <span className="sheet-code">
                  <DecryptedText
                    text="LP-SHT-05 // FIELD EXPEDITIONS & HARDWARE PURSUITS"
                    animateOn="view"
                    speed={35}
                  />
                </span>
              </div>
              <div className="sheet-title-row">
                <div className="sheet-heading-group">
                  <span className="sheet-tag-badge">05 // HOBBIES</span>
                  <h2 className="h2">
                    Mountains, Camping &amp; Cars<span className="accent">.</span>
                  </h2>
                </div>
                <div className="sheet-state-badge">
                  <span className="sheet-state-text">
                    {foldedSheets.hobbies ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                  </span>
                  <svg
                    className="sheet-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <p className="lead">
                What I do outside the lab and work: fell climbing in the Lake District, BMW E90 mechanics, custom PC
                hardware, and landscape photography.
              </p>
            </div>

            <div className="sheet-body" id="sheet-body-hobbies">
              <div className="grid grid-2">
                {HOBBIES_DATA.map((hobby) => (
                  <SpotlightCard
                    key={hobby.id}
                    className="panel hobby"
                    spotlightColor={activeAccent.hex}
                    intensity={0.18}
                    borderGlow={0.75}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <div className="panel-head">
                      <span className="panel-id">{hobby.id}</span>
                      <span className="tiny mono accent">{hobby.meta}</span>
                    </div>
                    <h3 className="h3">{hobby.title}</h3>
                    <p className="body small">{hobby.description}</p>

                    <div className="hobby-figs">
                      {hobby.photos.map((photo) => (
                        <div key={photo.code} className="figure">
                          <TiltedCard
                            imageSrc={photo.src}
                            altText={photo.alt}
                            captionText={photo.code}
                            containerHeight="250px"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            scaleOnHover={1.04}
                            rotateAmplitude={9}
                            radius={3}
                            glare={0.3}
                            showTooltip={false}
                          />
                          <figcaption>
                            <span>{photo.code}</span>
                            <span className="hand">{photo.caption}</span>
                          </figcaption>
                        </div>
                      ))}
                    </div>

                    <div className="chips">
                      {hobby.chips.map((c) => (
                        <span key={c} className="chip">
                          {c}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              <div className="side-grid four-col">
                {SIDE_PURSUITS.map((side) => (
                  <SpotlightCard
                    key={side.code}
                    className="panel"
                    spotlightColor={activeAccent.hex}
                    intensity={0.16}
                    borderGlow={0.7}
                    theme={theme === 'whiteprint' ? 'light' : 'dark'}
                  >
                    <span className="panel-id">{side.code}</span>
                    <h4 className="h3" style={{ marginTop: '0.35rem', fontSize: '1.08rem' }}>
                      {side.title}
                    </h4>
                    <p className="body small" style={{ marginTop: '0.35rem' }}>
                      {side.detail}
                    </p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            06. DIRECT DISPATCH (CONTACT) WRAPPED IN REACT BITS ELECTRIC BORDER
            ===================================================================== */}
        <section id="contact" className={`section ${foldedSheets.contact ? 'is-folded' : ''}`}>
          <div className="container">
            <ElectricBorder
              color={activeAccent.hex}
              speed={0.85}
              chaos={0.35}
              spread={0.45}
              thickness={1.5}
              strands={2}
              glow={0.55}
              intensity={0.75}
              borderRadius={6}
              theme={theme === 'whiteprint' ? 'light' : 'dark'}
              className="contact-electric-wrap"
            >
              <SpotlightCard
                className="panel contact-card"
                spotlightColor={activeAccent.hex}
                intensity={0.16}
                borderGlow={0.65}
                theme={theme === 'whiteprint' ? 'light' : 'dark'}
              >
                <div
                  className="sheet-head"
                  role="button"
                  tabIndex={0}
                  aria-expanded={!foldedSheets.contact}
                  aria-controls="sheet-body-contact"
                  onClick={() => toggleSheet('contact')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSheet('contact');
                    }
                  }}
                >
                  <div className="sheet-meta">
                    <span className="sheet-no">SHEET 06</span>
                    <div className="sheet-rule" />
                    <span className="sheet-code">
                      <DecryptedText
                        text="LP-SHT-06 // DIRECT DISPATCH & TELEMETRY CHANNELS"
                        animateOn="view"
                        speed={35}
                      />
                    </span>
                  </div>
                  <div className="sheet-title-row">
                    <div className="sheet-heading-group">
                      <span className="sheet-tag-badge">06 // CONTACT</span>
                      <h2 className="h2">
                        Contact &amp; Direct Dispatch<span className="accent">.</span>
                      </h2>
                    </div>
                    <div className="sheet-state-badge">
                      <span className="sheet-state-text">
                        {foldedSheets.contact ? 'SHEET FOLDED [+]' : 'SHEET ACTIVE [−]'}
                      </span>
                      <svg
                        className="sheet-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                  <p className="lead">
                    Open to electrical engineering placements, industrial trainee roles, apprenticeships, and technical
                    opportunities across Preston, Blackpool, Lancashire, and the North West.
                  </p>
                </div>

                <div className="sheet-body" id="sheet-body-contact">
                  <div className="contact-grid">
                    {/* Primary Email */}
                    <div className="contact-cell">
                      <span className="tiny mono">PRIMARY DISPATCH</span>
                      <b>{OPERATOR_SPEC.email}</b>
                      <span className="small muted">ProtonMail Encrypted · Direct</span>
                      <button
                        type="button"
                        id="copy-email-btn"
                        className="copy-btn"
                        onClick={() => copyToClipboard(OPERATOR_SPEC.email, 'email')}
                      >
                        {copiedKey === 'email' ? 'COPIED TO CLIPBOARD ✓' : 'Copy Email Address'}
                      </button>
                    </div>

                    {/* Phone & Location */}
                    <div className="contact-cell">
                      <span className="tiny mono">CAMPUS &amp; DIRECT LINE</span>
                      <b>Preston &amp; Blackpool, UK</b>
                      <span className="small muted">UCLan PR1 · {OPERATOR_SPEC.phone}</span>
                      <button
                        type="button"
                        id="copy-phone-btn"
                        className="copy-btn"
                        onClick={() => copyToClipboard(OPERATOR_SPEC.phone, 'phone')}
                      >
                        {copiedKey === 'phone' ? 'NUMBER COPIED ✓' : 'Copy Phone Number'}
                      </button>
                    </div>

                    {/* LinkedIn */}
                    <a
                      href={OPERATOR_SPEC.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-cell"
                    >
                      <span className="tiny mono">PROFESSIONAL NETWORK</span>
                      <b>LinkedIn ↗</b>
                      <span className="small muted">Lee Parkinson</span>
                      <span className="tiny mono accent" style={{ marginTop: '0.3rem' }}>
                        Connect Profile →
                      </span>
                    </a>

                    {/* GitHub */}
                    <a
                      href={OPERATOR_SPEC.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-cell"
                    >
                      <span className="tiny mono">SOURCE REPOSITORY</span>
                      <b>GitHub (@leeprky) ↗</b>
                      <span className="small muted">Open-Source Themes &amp; Code</span>
                      <span className="tiny mono accent" style={{ marginTop: '0.3rem' }}>
                        Inspect Repositories →
                      </span>
                    </a>
                  </div>

                  {/* Quick Technical Dispatch Form */}
                  <form className="dispatch-composer" onSubmit={handleDispatchSubmit}>
                    <div className="dispatch-composer-head mono">
                      <span className="accent">QUICK DISPATCH TERMINAL // MAILTO COMPOSER</span>
                      <span>TARGET: {OPERATOR_SPEC.email.toUpperCase()}</span>
                    </div>
                    <div className="dispatch-form-grid">
                      <label className="dispatch-field" htmlFor="dispatch-subject">
                        <span className="tiny mono">SUBJECT / SPECIFICATION</span>
                        <input
                          id="dispatch-subject"
                          type="text"
                          value={dispatchSubject}
                          onChange={(e) => setDispatchSubject(e.target.value)}
                          placeholder="Engineering Placement / Technical Inquiry"
                        />
                      </label>
                      <label className="dispatch-field" htmlFor="dispatch-sender">
                        <span className="tiny mono">YOUR NAME / ORGANIZATION</span>
                        <input
                          id="dispatch-sender"
                          type="text"
                          value={dispatchSender}
                          onChange={(e) => setDispatchSender(e.target.value)}
                          placeholder="e.g. Engineering Recruiter / Lab Lead"
                        />
                      </label>
                      <label className="dispatch-field full" htmlFor="dispatch-body">
                        <span className="tiny mono">TRANSMISSION MESSAGE</span>
                        <textarea
                          id="dispatch-body"
                          rows={2}
                          value={dispatchBody}
                          onChange={(e) => setDispatchBody(e.target.value)}
                          placeholder="Write a brief message to open directly in your email client..."
                        />
                      </label>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        marginTop: '1rem',
                        alignItems: 'center'
                      }}
                    >
                      <Magnet padding={35} magnetStrength={2.5}>
                        <button type="submit" id="dispatch-submit-btn" className="btn btn-primary">
                          <span>Transmit Email ({OPERATOR_SPEC.email})</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      </Magnet>

                      <Magnet padding={35} magnetStrength={2.5}>
                        <a
                          href={OPERATOR_SPEC.cvUrl}
                          id="contact-download-cv-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                        >
                          <span>Download Full CV PDF (252KB) ↗</span>
                        </a>
                      </Magnet>
                    </div>
                  </form>
                </div>
              </SpotlightCard>
            </ElectricBorder>
          </div>
        </section>
      </main>

      {/* =====================================================================
          REACT BITS · FLOATING CAD INSTRUMENT DOCK
          ===================================================================== */}
      <div className="cad-dock-fixed" aria-label="Blueprint Quick Navigation Dock">
        <Dock
          items={dockItems}
          position="bottom"
          theme={theme === 'whiteprint' ? 'light' : 'dark'}
          baseItemSize={42}
          magnification={58}
          distance={150}
          panelHeight={56}
          gap={8}
          roundness={0.22}
          accentColor={activeAccent.hex}
        />
      </div>

      {/* =====================================================================
          SITE FOOTER
          ===================================================================== */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              LEE PARKINSON // ELECTRICAL ENGINEERING BLUEPRINT
            </div>
            <div className="tiny mono" style={{ marginTop: '0.4rem' }}>
              {OPERATOR_SPEC.drawingNo} &bull; {OPERATOR_SPEC.standard} &bull; POWERED BY REACT BITS &bull; PRESTON, UK
            </div>
          </div>
          <div className="footer-links">
            <a href={OPERATOR_SPEC.repoUrl} target="_blank" rel="noopener noreferrer">
              Source Code (GitHub) ↗
            </a>
            <a href={OPERATOR_SPEC.cvUrl} target="_blank" rel="noopener noreferrer">
              CV Spec (PDF) ↗
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
            >
              About &amp; Lab
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('projects');
              }}
            >
              Schematics
            </a>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('top');
              }}
            >
              Top ↑
            </a>
          </div>
        </div>
      </footer>
    </ClickSpark>
  );
}
