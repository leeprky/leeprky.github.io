/*!
 * Technical CAD & Electrical Instrumentation Engine — SPEC V9.0
 * BS 8888 / ISO 128 / IEEE 315 Engineering Drafting & Telemetry System
 */
(function () {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function getAccentHex() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--sky-400').trim();
    const parts = raw.split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n));
    if (parts.length >= 3) {
      return '#' + parts.slice(0, 3).map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
    }
    return document.documentElement.classList.contains('dark') ? '#38bdf8' : '#0284c7';
  }

  function getSketchHex() {
    return document.documentElement.classList.contains('dark') ? '#fde047' : '#d97706';
  }

  /* ==========================================================================
   * 1. INERTIAL SCROLL & MOTION CORE INITIALIZATION
   * ========================================================================== */
  let scroller = null;

  function initScrollAndMotionCore() {
    if (typeof window.gsap !== 'undefined') {
      const plugins = [
        window.ScrollTrigger,
        window.ScrollToPlugin,
        window.SplitText,
        window.ScrambleTextPlugin,
        window.Flip,
        window.TextPlugin
      ].filter(Boolean);
      if (plugins.length) {
        window.gsap.registerPlugin(...plugins);
      }
    }

    if (typeof window.Lenis !== 'undefined') {
      scroller = new window.Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        anchors: {
          offset: -72
        },
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true
      });
      window.cadScroller = scroller;

      if (typeof window.ScrollTrigger !== 'undefined' && typeof window.gsap !== 'undefined') {
        scroller.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => {
          scroller.raf(time * 1000);
        });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          scroller.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }
  }

  /* ==========================================================================
   * 2. ORTHOGRAPHIC MILLIMETER RULERS, CROSSHAIR GUIDES & TELEMETRY HUD
   * ========================================================================== */
  let crosshairEnabled = false;
  let dimsAlwaysVisible = true;

  function initCADRulersAndTelemetry() {
    // Enable CAD dimension stamps by default for authentic engineering layout
    document.body.classList.add('cad-dims-visible');

    const header = document.querySelector('header');
    let progressBar = document.querySelector('.bp-scroll-progress-bar');
    if (header && !progressBar) {
      const wrap = document.createElement('div');
      wrap.className = 'bp-scroll-progress-wrap';
      progressBar = document.createElement('div');
      progressBar.className = 'bp-scroll-progress-bar';
      wrap.appendChild(progressBar);
      header.appendChild(wrap);
    }

    // Left Orthographic Millimeter Ruler
    let rulerLeft = document.querySelector('.cad-ruler-left');
    let markerY = null;
    if (!rulerLeft) {
      rulerLeft = document.createElement('div');
      rulerLeft.className = 'cad-ruler-left';
      rulerLeft.setAttribute('aria-hidden', 'true');
      markerY = document.createElement('div');
      markerY.className = 'cad-ruler-marker-y';
      rulerLeft.appendChild(markerY);
      document.body.appendChild(rulerLeft);
    }

    // Full-Viewport Toggleable CAD Crosshair Overlay
    let crosshairLayer = document.querySelector('.cad-crosshair-layer');
    let chHoriz = null;
    let chVert = null;
    let chReadout = null;
    if (!crosshairLayer) {
      crosshairLayer = document.createElement('div');
      crosshairLayer.className = 'cad-crosshair-layer';
      crosshairLayer.setAttribute('aria-hidden', 'true');
      chHoriz = document.createElement('div');
      chHoriz.className = 'cad-crosshair-h';
      chVert = document.createElement('div');
      chVert.className = 'cad-crosshair-v';
      chReadout = document.createElement('div');
      chReadout.className = 'cad-crosshair-readout';
      chReadout.textContent = 'X:000.0mm Y:000.0mm';
      crosshairLayer.appendChild(chHoriz);
      crosshairLayer.appendChild(chVert);
      crosshairLayer.appendChild(chReadout);
      document.body.appendChild(crosshairLayer);
    }

    // Inject live CAD Telemetry readout in top strip
    const topStripLeft = document.querySelector('.bg-strip .drafting-container > div:first-child');
    let hudEl = document.getElementById('rb-cad-telemetry');
    if (topStripLeft && !hudEl) {
      hudEl = document.createElement('span');
      hudEl.id = 'rb-cad-telemetry';
      hudEl.className = 'rb-cad-hud hidden lg:inline-flex';
      hudEl.innerHTML =
        '<span class="rb-cad-hud__dot"></span>' +
        '<span id="rb-hud-coords">X:000.0mm Y:000.0mm</span>' +
        '<span class="opacity-40">|</span>' +
        '<span id="rb-hud-vel">dY/dt:00.0</span>' +
        '<span class="opacity-40">|</span>' +
        '<span id="rb-hud-prog">SHT:00%</span>';
      topStripLeft.appendChild(hudEl);
    }

    const coordsEl = document.getElementById('rb-hud-coords');
    const velEl = document.getElementById('rb-hud-vel');
    const progEl = document.getElementById('rb-hud-prog');

    // Convert CSS px to engineering mm (96 DPI => 1px ≈ 0.26458mm)
    const PX_TO_MM = 0.264583;

    window.addEventListener('pointermove', (e) => {
      const xmm = (e.clientX * PX_TO_MM).toFixed(1).padStart(5, '0');
      const ymm = ((e.clientY + window.scrollY) * PX_TO_MM).toFixed(1).padStart(5, '0');

      if (coordsEl) {
        coordsEl.textContent = `X:${xmm}mm Y:${ymm}mm`;
      }
      if (markerY) {
        markerY.style.transform = `translate3d(0, ${e.clientY}px, 0)`;
      }
      if (crosshairEnabled && chHoriz && chVert && chReadout) {
        chHoriz.style.top = `${e.clientY}px`;
        chVert.style.left = `${e.clientX}px`;
        chReadout.style.left = `${e.clientX}px`;
        chReadout.style.top = `${e.clientY}px`;
        chReadout.textContent = `DATUM X:${xmm}mm // Y:${ymm}mm`;
      }
    }, { passive: true });

    const updateOnScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const current = scroller ? scroller.scroll : window.scrollY;
      const prog = clamp(current / maxScroll, 0, 1);
      const vel = scroller ? scroller.velocity : 0;

      if (progressBar) {
        progressBar.style.transform = `scaleX(${prog.toFixed(4)})`;
      }
      if (velEl) {
        velEl.textContent = `dY/dt:${Math.abs(vel).toFixed(1)}`;
      }
      if (progEl) {
        progEl.textContent = `SHT:${String(Math.round(prog * 100)).padStart(2, '0')}%`;
      }
    };

    if (scroller) {
      scroller.on('scroll', updateOnScroll);
    } else {
      window.addEventListener('scroll', updateOnScroll, { passive: true });
    }
    updateOnScroll();
  }

  /* ==========================================================================
   * 3. ISO-7200 / BS-8888 TITLE BLOCK & DUAL-CHANNEL OSCILLOSCOPE
   * ========================================================================== */
  function initEngineeringTitleBlockAndScope() {
    const main = document.querySelector('main');
    const primarySheet = main?.querySelector('section.blueprint-card') || main?.querySelector('.blueprint-card');
    if (!primarySheet || primarySheet.querySelector('.cad-title-block')) return;

    const pathName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const sheetMap = {
      'index.html':      { code: 'LP-CAD-SHT-00', title: 'MASTER ASSEMBLY & SPECIFICATION INDEX' },
      'about.html':      { code: 'LP-CAD-SHT-01', title: 'ENGINEER PROFILE & INSTRUMENTATION TOOLKIT' },
      'schematics.html': { code: 'LP-CAD-SHT-02', title: 'TECHNICAL SCHEMATICS & HARDWARE LOG' },
      'gallery.html':    { code: 'LP-CAD-SHT-03', title: 'AUTOMOTIVE & SOFTWARE VISUAL TELEMETRY' },
      'experience.html': { code: 'LP-CAD-SHT-04', title: 'OPERATIONAL FIELD EXPERIENCE & MATRIX' },
      'education.html':  { code: 'LP-CAD-SHT-05', title: 'UCLAN ACADEMIC MODULES & QUALIFICATIONS' },
      'hobbies.html':    { code: 'LP-CAD-SHT-06', title: 'MECHANICAL, EXPEDITION & FIELD SYSTEMS' },
      'contact.html':    { code: 'LP-CAD-SHT-07', title: 'COMMUNICATION CHANNELS & DISPATCH' },
      'cv.html':         { code: 'LP-CAD-DOC-CV', title: 'CURRICULUM VITAE // TECHNICAL DOSSIER' },
      'email.html':      { code: 'LP-CAD-COM-01', title: 'DIRECT TRANSMISSION DISPATCH CONSOLE' },
      '404.html':        { code: 'LP-CAD-ERR-404', title: 'FAULT DIAGNOSTIC // COORDINATE OUT OF BOUNDS' }
    };
    const meta = sheetMap[pathName] || sheetMap['index.html'];

    const tb = document.createElement('div');
    tb.className = 'cad-title-block';
    tb.setAttribute('aria-label', 'ISO-7200 Engineering Drawing Title Block');
    tb.innerHTML = `
      <div class="cad-tb-cell col-span-6 sm:col-span-3">
        <span class="cad-tb-label">DRAWING NUMBER // REV</span>
        <span class="cad-tb-val t-cyan">${meta.code} // REV 9.0</span>
      </div>
      <div class="cad-tb-cell col-span-6 sm:col-span-4">
        <span class="cad-tb-label">SHEET TITLE // SPECIFICATION</span>
        <span class="cad-tb-val">${meta.title}</span>
      </div>
      <div class="cad-tb-cell col-span-6 sm:col-span-2">
        <span class="cad-tb-label">STANDARD // TOLERANCE</span>
        <span class="cad-tb-val">BS 8888 • ±0.05mm</span>
      </div>
      <div class="cad-scope-wrap col-span-6 sm:col-span-3" id="cad-scope-box" title="Click to switch Oscilloscope Signal Mode (AC 50Hz / PWM CAN-Bus / XY Lissajous)">
        <div class="cad-scope-header">
          <span id="cad-scope-label">CH1: 240V AC 50Hz</span>
          <span class="cad-scope-mode-pill" id="cad-scope-mode">SINE</span>
        </div>
        <canvas class="cad-scope-canvas" id="cad-scope-canvas" width="260" height="42"></canvas>
      </div>
    `;
    primarySheet.appendChild(tb);

    // Interactive Oscilloscope Waveform Renderer
    const canvas = document.getElementById('cad-scope-canvas');
    const modeEl = document.getElementById('cad-scope-mode');
    const labelEl = document.getElementById('cad-scope-label');
    const boxEl = document.getElementById('cad-scope-box');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const modes = [
      { id: 'SINE', label: 'CH1: 240V AC 50Hz' },
      { id: 'PWM',  label: 'CH2: 12V CAN-BUS PWM' },
      { id: 'XY-Φ', label: 'CH1×CH2: PHASE ΔΦ' }
    ];
    let modeIdx = 0;

    boxEl?.addEventListener('click', () => {
      modeIdx = (modeIdx + 1) % modes.length;
      if (modeEl) modeEl.textContent = modes[modeIdx].id;
      if (labelEl) labelEl.textContent = modes[modeIdx].label;
    });

    let phase = 0;
    function renderScope() {
      const W = canvas.width;
      const H = canvas.height;
      const vel = scroller ? Math.abs(scroller.velocity) : 0;
      phase += 0.065 + Math.min(0.25, vel * 0.015);

      ctx.clearRect(0, 0, W, H);

      // Subtle oscilloscope graticule grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 26) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // Primary phosphor waveform trace
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 5;
      ctx.beginPath();

      const mode = modes[modeIdx].id;
      if (mode === 'SINE') {
        for (let x = 0; x < W; x++) {
          const t = (x / W) * Math.PI * 6 + phase;
          const harmonic = Math.sin(t) * 0.8 + Math.sin(t * 3) * 0.15;
          const y = H / 2 + harmonic * (H * 0.36);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (mode === 'PWM') {
        for (let x = 0; x < W; x++) {
          const cycle = ((x * 0.12 + phase * 1.4) % (Math.PI * 2));
          const high = cycle < Math.PI * 1.15 ? -1 : 1;
          const y = H / 2 + high * (H * 0.33);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Dual-wave harmonic superposition
        for (let x = 0; x < W; x++) {
          const t = (x / W) * Math.PI * 8 + phase;
          const y = H / 2 + Math.sin(t) * Math.cos(t * 0.5 - phase * 0.4) * (H * 0.38);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      requestAnimationFrame(renderScope);
    }
    requestAnimationFrame(renderScope);
  }

  /* ==========================================================================
   * 4. ENGINEERING TELEMETRY BUS RIBBON
   * ========================================================================== */
  function initTelemetryBusRibbon() {
    const main = document.querySelector('main');
    const heroSection = main?.querySelector('section.blueprint-card') || main?.querySelector('.blueprint-card');
    if (!main || !heroSection || document.querySelector('.rb-velocity-ribbon')) return;

    const ribbon = document.createElement('div');
    ribbon.className = 'rb-velocity-ribbon blueprint-card rounded-sm';
    ribbon.setAttribute('aria-label', 'Electrical and mechanical engineering specification bus');

    const phrases = [
      'BS 8888 TECHNICAL DRAWING STANDARD',
      'IEEE-315 SCHEMATIC SYMBOLOGY',
      '240V AC RMS // 50.00 Hz SYNCHRONIZED',
      '12V DC OBD-II CAN-BUS DIAGNOSTICS',
      'UCLAN BENG (HONS) ELECTRICAL & ELECTRONIC ENG',
      'PCB LAYOUT & EMBEDDED HARDWARE PROTOTYPING',
      'TOLERANCE CLASS ISO 2768-mK (±0.05MM)',
      'PRESTON • LANCASHIRE • UK [53.7632°N, 2.7031°W]'
    ];

    const chunkHTML = phrases
      .map(text => `<span class="rb-velocity-item"><span>${text}</span><span class="rb-velocity-sep">//</span></span>`)
      .join('');

    const track = document.createElement('div');
    track.className = 'rb-velocity-track';
    track.innerHTML = chunkHTML + chunkHTML + chunkHTML;
    ribbon.appendChild(track);

    heroSection.insertAdjacentElement('afterend', ribbon);

    let offset = 0;
    let direction = -1;
    let lastTime = performance.now();
    const baseSpeed = 36;

    function tick(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const vel = scroller ? scroller.velocity : 0;
      if (Math.abs(vel) > 0.25) {
        direction = vel > 0 ? -1 : 1;
      }
      const velocityBoost = 1 + Math.min(5, Math.abs(vel) * 0.12);
      offset += direction * baseSpeed * velocityBoost * dt;

      const thirdWidth = track.scrollWidth / 3;
      if (thirdWidth > 0) {
        offset = ((offset % thirdWidth) + thirdWidth) % thirdWidth - thirdWidth;
        track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ==========================================================================
   * 5. PRECISION CAD VECTOR PERIMETER TRACE (WebGL2 Signal Routing)
   * ========================================================================== */
  function attachCADPerimeterTrace(container, opts = {}) {
    if (!container || container.dataset.rbElectricAttached) return;
    container.dataset.rbElectricAttached = '1';
    container.classList.add('rb-electric-border');

    const ARCS = 4;
    const PULSES = 3;
    const MARGIN = 36;
    const PIXEL_BUDGET = 2.0e6;
    const SURGE_SPEED = 520;
    const HALF_PI = Math.PI / 2;

    const canvas = document.createElement('canvas');
    canvas.className = 'electric-border__canvas';
    canvas.style.top = `-${MARGIN}px`;
    canvas.style.left = `-${MARGIN}px`;
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'default'
    });
    if (!gl) {
      canvas.remove();
      return;
    }

    const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

    const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uSize;
uniform float uRatio;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform vec3 uParam;
uniform float uPerimeter;
uniform vec4 uCells;
uniform vec2 uSoft;
uniform float uTime;
uniform float uPower;
uniform float uReveal;
uniform vec3 uHover;
uniform float uHoverRadius;
uniform vec4 uPulses[${PULSES}];
uniform vec3 uCore;
uniform vec3 uGlowColor;
uniform float uIntensity;
uniform float uGlow;
uniform float uThickness;
uniform float uStrands;
uniform float uChaos;
uniform float uSpread;
uniform float uFlicker;
uniform float uInk;
uniform vec4 uArcEnds[${ARCS}];
uniform vec4 uArcShape[${ARCS}];

out vec4 fragColor;

uint scramble(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

vec2 slant(uint x, uint y, uint seed) {
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;
}

vec2 ring(vec2 p, float period, uint seed) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);
  uint x0 = uint(mod(i.x, period));
  uint x1 = uint(mod(i.x + 1.0, period));
  uint y0 = uint(i.y + 65536.0);
  vec2 ga = slant(x0, y0, seed);
  vec2 gb = slant(x1, y0, seed);
  vec2 gc = slant(x0, y0 + 1u, seed);
  vec2 gd = slant(x1, y0 + 1u, seed);
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);
  return vec2(value, gx + du * (vb - va + u.y * k));
}

float wobble(float x, uint seed) {
  return ring(vec2(x, 0.5), 1048576.0, seed).x;
}

vec2 frameAt(vec2 p) {
  vec2 inner = max(uHalf - uRadius, 0.0);
  vec2 q = abs(p) - inner;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float quarter = uPerimeter * 0.25;
  vec2 v = abs(p) - uParam.xy;
  float t;
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);
  else t = abs(p.x);
  t = clamp(t, 0.0, quarter);
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);
  return vec2(s, d);
}

vec2 glowShape(float line, float spread, float w) {
  float x = abs(line);
  float y = abs(spread);
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);
  vec2 frame = frameAt(p - uCenter);
  float s = frame.x;
  float d = frame.y;
  float t = uTime;
  vec3 light = vec3(0.0);
  float energy = 0.0;
  float hot = 0.0;

  float along = min(s, uPerimeter - s);
  float front = uReveal * (uPerimeter * 0.5 + 80.0);
  float shown = smoothstep(front, front - 70.0, along) * uPower;
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;

  vec2 toHover = p - uHover.xy;
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));
  float surge = 0.0;
  for (int i = 0; i < ${PULSES}; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.z <= 0.0) continue;
    float gap = abs(s - pulse.x);
    gap = min(gap, uPerimeter - gap);
    float wave = (gap - pulse.y * ${SURGE_SPEED}.0) / 46.0;
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);
  }
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);
  vec2 inset = min(p, uSize - p);
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));

  float edge = abs(d);
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;
  float bloom = (exp(-edge / 2.5) * 0.09 + exp(-edge / 12.0) * 0.04 * inward) * uGlow * (1.0 + heat * 0.6) * shown;
  light += uGlowColor * bloom;
  energy += bloom;

  float bendAmp = uSpread * 6.0 * (1.0 + heat * 0.25);
  float rippleAmp = uSpread * 2.5 * (1.0 + heat * 0.2);
  float crinkleAmp = uChaos * 1.5 * (1.0 + heat * 0.2);
  float reach = (bendAmp * 1.8 + rippleAmp + crinkleAmp * 1.4) * 1.2 + uThickness * 12.0 + 6.0;
  if (edge < reach && shown > 0.0) {
    float fade = smoothstep(reach, reach * 0.55, edge);
    float count = min(uStrands + heat * 0.8, 3.0);
    float slopeScale = 1.0 / uPerimeter;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      if (fi >= ceil(count)) break;
      float present = clamp(count - fi, 0.0, 1.0);
      uint seed = uint(i) * 7u + 3u;
      float lead = i == 0 ? 1.0 : 0.0;
      float range = mix(1.1 + fi * 0.12, 0.5, lead);
      float x = s * slopeScale;
      vec2 a = ring(vec2(x * uCells.x, t * 0.6 + fi * 3.1), uCells.x, seed);
      vec2 b = ring(vec2(x * uCells.y, t * 1.5 + fi * 1.7), uCells.y, seed + 1u);
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range;
      float slope = ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range) * slopeScale;
      float across = (d - offset) / sqrt(1.0 + slope * slope);
      float spread = d - a.x * bendAmp * range;
      float w = uThickness * mix(0.6, 1.0, lead);
      float weight = fade * present;
      vec2 g = glowShape(across, spread, w) * weight;
      g.y *= inward;
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);
      light += uCore * g.x + uGlowColor * g.y * haze;
      energy += g.x + g.y * haze;
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;
    }
    light *= shown;
    energy *= shown;
    hot *= shown;
  }

  float gain = uIntensity * (1.0 + heat * 0.25) * 1.35;
  light *= frameFade;
  energy *= frameFade;
  hot *= frameFade;
  float alpha = 1.0 - exp(-energy * gain);
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);
  fragColor = vec4(clamp(color, 0.0, alpha), clamp(alpha, 0.0, 1.0));
}`;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const prog = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const uniforms = {};
    const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(prog, i);
      if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(prog, info.name);
    }

    const parseColor = (hexStr) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(hexStr.trim());
      if (m) {
        return [0, 2, 4].map(idx => parseInt(m[1].slice(idx, idx + 2), 16) / 255);
      }
      return [0.22, 0.74, 0.97];
    };

    const pathOf = (w, h, radius) => {
      const hx = Math.max(1, w / 2);
      const hy = Math.max(1, h / 2);
      const r = clamp(radius, 0, Math.min(hx, hy));
      const vr = Math.min(r + 48, Math.min(hx, hy));
      const ax = hx - vr;
      const ay = hy - vr;
      const quarter = ax + ay + HALF_PI * vr;
      return { hx, hy, r, vr, ax, ay, quarter, perimeter: quarter * 4 };
    };

    const nearestOn = (path, x, y) => {
      const { ax, ay, vr, quarter } = path;
      const qx = Math.abs(x) - ax;
      const qy = Math.abs(y) - ay;
      let t;
      if (qx > 0 && qy > 0) t = ax + vr * Math.atan2(qx, qy);
      else if (qx > qy) t = ax + HALF_PI * vr + ay - Math.abs(y);
      else t = Math.abs(x);
      t = clamp(t, 0, quarter);
      if (x >= 0) return y < 0 ? t : 2 * quarter - t;
      return y < 0 ? 4 * quarter - t : 2 * quarter + t;
    };

    const vao = gl.createVertexArray();
    const pulseData = new Float32Array(PULSES * 4);
    const size = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0, y: 0, over: false, near: false };
    const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };
    const pulses = [];
    const borderRadius = opts.borderRadius ?? 2;
    let path = pathOf(1, 1, borderRadius);
    let time = Math.random() * 100;
    let power = 0;
    let reveal = 0;
    let ink = document.documentElement.classList.contains('dark') ? 0 : 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const resize = () => {
      const width = Math.max(1, container.offsetWidth);
      const height = Math.max(1, container.offsetHeight);
      const cw = width + MARGIN * 2;
      const ch = height + MARGIN * 2;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75, Math.sqrt(PIXEL_BUDGET / (cw * ch)));
      const pw = Math.max(1, Math.round(cw * ratio));
      const ph = Math.max(1, Math.round(ch * ratio));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      size.width = width;
      size.height = height;
      size.ratio = pw / cw;
      path = pathOf(width, height, borderRadius);
    };

    const frame = (now) => {
      raf = 0;
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
      last = now;
      time += dt * (opts.speed ?? 0.65);

      const isLight = !document.documentElement.classList.contains('dark');
      const base = parseColor(getAccentHex());
      const core = base.map(c => c + (1 - c) * 0.55);

      power += (1 - power) * (1 - Math.exp(-dt / 0.28));
      reveal = Math.min(1, reveal + dt / 0.85);
      ink += ((isLight ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));

      const engaged = pointer.near;
      if (engaged && hover.power < 0.01) {
        hover.x = pointer.x;
        hover.y = pointer.y;
        hover.vx = 0;
        hover.vy = 0;
      }
      hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;
      hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;
      hover.x += hover.vx * dt;
      hover.y += hover.vy * dt;
      hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.28 : 0.5)));

      for (let i = pulses.length - 1; i >= 0; i--) {
        if (now - pulses[i].born > 2200) pulses.splice(i, 1);
      }
      for (let i = 0; i < PULSES; i++) {
        const o = i * 4;
        const p = pulses[i];
        if (!p) {
          pulseData[o + 2] = 0;
          continue;
        }
        pulseData[o] = p.s;
        pulseData[o + 1] = (now - p.born) / 1000;
        pulseData[o + 2] = 1;
      }

      const fit = power * power * (3 - 2 * power);
      const u = uniforms;
      const w = size.width + MARGIN * 2;
      const h = size.height + MARGIN * 2;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(u.uSize, w, h);
      gl.uniform1f(u.uRatio, size.ratio);
      gl.uniform2f(u.uCenter, w / 2, h / 2);
      gl.uniform2f(u.uHalf, path.hx, path.hy);
      gl.uniform1f(u.uRadius, path.r);
      gl.uniform3f(u.uParam, path.ax, path.ay, path.vr);
      gl.uniform1f(u.uPerimeter, path.perimeter);
      gl.uniform4f(
        u.uCells,
        Math.max(1, Math.round(path.perimeter / 75)),
        Math.max(2, Math.round(path.perimeter / 25)),
        Math.max(3, Math.round(path.perimeter / 9)),
        Math.max(4, Math.round(path.perimeter / 4))
      );
      gl.uniform2f(
        u.uSoft,
        Math.max(1, Math.round(path.perimeter / 150)),
        Math.max(1, Math.round(path.perimeter / 50))
      );
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uPower, fit);
      gl.uniform1f(u.uReveal, reveal);
      gl.uniform3f(u.uHover, hover.x + MARGIN, hover.y + MARGIN, hover.power);
      gl.uniform1f(u.uHoverRadius, 95);
      gl.uniform4fv(u.uPulses, pulseData);
      gl.uniform3fv(u.uCore, core);
      gl.uniform3fv(u.uGlowColor, base);
      gl.uniform1f(u.uIntensity, opts.intensity ?? 0.55);
      gl.uniform1f(u.uGlow, opts.glow ?? 0.45);
      gl.uniform1f(u.uThickness, opts.thickness ?? 1.0);
      gl.uniform1f(u.uStrands, opts.strands ?? 1.4);
      gl.uniform1f(u.uChaos, opts.chaos ?? 0.08);
      gl.uniform1f(u.uSpread, opts.spread ?? 0.14);
      gl.uniform1f(u.uFlicker, 0.15);
      gl.uniform1f(u.uInk, ink);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (visible && document.visibilityState !== 'hidden') {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf && visible && document.visibilityState !== 'hidden') {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const locate = (e) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.over = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
      pointer.near =
        pointer.x >= -MARGIN / 2 &&
        pointer.y >= -MARGIN / 2 &&
        pointer.x <= rect.width + MARGIN / 2 &&
        pointer.y <= rect.height + MARGIN / 2;
    };

    window.addEventListener('pointermove', (e) => {
      locate(e);
      if (pointer.near) wake();
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => {
      locate(e);
      if (!pointer.over) return;
      const along = nearestOn(path, pointer.x - size.width / 2, pointer.y - size.height / 2);
      pulses.push({ s: along, born: performance.now() });
      if (pulses.length > PULSES) pulses.shift();
      wake();
    }, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      wake();
    });
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      visible = entries.some(entry => entry.isIntersecting);
      wake();
    });
    io.observe(container);

    resize();
    wake();
  }

  /* ==========================================================================
   * 6. ORTHOGRAPHIC CAD CARD OVERLAYS & LIVE MILLIMETER DIMENSION TAGS
   * ========================================================================== */
  function initCADCardOverlays() {
    const cards = document.querySelectorAll('.blueprint-card');
    if (!cards.length) return;

    const pointer = { x: -9999, y: -9999, active: false };
    const instances = [];
    const PX_TO_MM = 0.264583;

    cards.forEach((card, idx) => {
      if (card.dataset.rbSpotlightAttached || card.classList.contains('rb-velocity-ribbon')) return;
      card.dataset.rbSpotlightAttached = '1';
      card.classList.add('rb-spotlight-card');

      const light = document.createElement('span');
      light.className = 'rb-spotlight__light';
      light.setAttribute('aria-hidden', 'true');

      const edge = document.createElement('span');
      edge.className = 'rb-spotlight__edge';
      edge.setAttribute('aria-hidden', 'true');

      const dimBadge = document.createElement('span');
      dimBadge.className = 'cad-dim-badge';
      dimBadge.setAttribute('aria-hidden', 'true');
      const nodeCode = `N${String(idx + 1).padStart(2, '0')}`;

      const updateCardDims = () => {
        const w = Math.round(card.offsetWidth * PX_TO_MM);
        const h = Math.round(card.offsetHeight * PX_TO_MM);
        dimBadge.textContent = `${nodeCode} // ${w}×${h}mm`;
      };
      updateCardDims();

      card.insertBefore(light, card.firstChild);
      card.appendChild(edge);
      card.appendChild(dimBadge);

      const inst = { card, light, edge, dimBadge, updateCardDims, visible: false };
      instances.push(inst);
    });

    const ro = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const match = instances.find(i => i.card === entry.target);
        if (match) match.updateCardDims();
      });
    });
    instances.forEach(i => ro.observe(i.card));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const match = instances.find(i => i.card === entry.target);
        if (match) match.visible = entry.isIntersecting;
      });
    }, { rootMargin: '120px' });

    instances.forEach(i => io.observe(i.card));

    let rafId = 0;
    const renderSpotlights = () => {
      rafId = 0;
      if (!pointer.active) return;
      const accent = getAccentHex();
      const isDark = document.documentElement.classList.contains('dark');
      const fillAlpha = isDark ? 0.11 : 0.07;

      for (let i = 0; i < instances.length; i++) {
        const inst = instances[i];
        if (!inst.visible) continue;
        const rect = inst.card.getBoundingClientRect();
        const x = pointer.x - rect.left;
        const y = pointer.y - rect.top;
        const gap = Math.hypot(Math.max(0, -x, x - rect.width), Math.max(0, -y, y - rect.height));
        const proximity = 90;
        const presence = gap === 0 ? 1 : gap < proximity ? Math.pow(1 - gap / proximity, 2) : 0;

        if (presence <= 0.005) {
          if (inst.light.style.opacity !== '0') {
            inst.light.style.opacity = '0';
            inst.edge.style.opacity = '0';
          }
          continue;
        }

        inst.light.style.background = `radial-gradient(circle 220px at ${x.toFixed(1)}px ${y.toFixed(1)}px, color-mix(in srgb, ${accent} ${(fillAlpha * 100).toFixed(1)}%, transparent), transparent 70%)`;
        inst.edge.style.background = `radial-gradient(circle 160px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${accent}, transparent 75%)`;
        inst.light.style.opacity = String(presence.toFixed(3));
        inst.edge.style.opacity = String((presence * 0.9).toFixed(3));
      }
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      if (!rafId) rafId = requestAnimationFrame(renderSpotlights);
    }, { passive: true });
  }

  /* ==========================================================================
   * 7. CRITICALLY DAMPED ORTHOGRAPHIC CAD INSPECTION TILT
   * ========================================================================== */
  function initOrthographicInspectionTilt() {
    const targets = document.querySelectorAll(
      '.landscape-hero-photo-box, .project-card, #gallery a.group.relative.overflow-hidden, #hobbies a.group.relative.overflow-hidden'
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    targets.forEach((el) => {
      if (el.dataset.rbTiltAttached) return;
      el.dataset.rbTiltAttached = '1';
      el.classList.add('rb-tilted-card');

      const glare = document.createElement('span');
      glare.className = 'rb-tilted-card__glare';
      glare.setAttribute('aria-hidden', 'true');

      const edge = document.createElement('span');
      edge.className = 'rb-tilted-card__edge';
      edge.setAttribute('aria-hidden', 'true');

      el.appendChild(glare);
      el.appendChild(edge);

      const isHeroPhoto = el.classList.contains('landscape-hero-photo-box');
      const maxAngle = isHeroPhoto ? 5.0 : 2.8;
      if (typeof window.gsap !== 'undefined') {
        window.gsap.set(el, { transformPerspective: 1000 });
      }
      const rxTo = typeof window.gsap !== 'undefined'
        ? window.gsap.quickTo(el, 'rotationX', { duration: 0.28, ease: 'power3.out' })
        : null;
      const ryTo = typeof window.gsap !== 'undefined'
        ? window.gsap.quickTo(el, 'rotationY', { duration: 0.28, ease: 'power3.out' })
        : null;

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        const rx = -ny * maxAngle;
        const ry = nx * maxAngle;

        el.style.setProperty('--tc-gx', `${(50 + nx * 42).toFixed(1)}%`);
        el.style.setProperty('--tc-gy', `${(50 + ny * 42).toFixed(1)}%`);
        el.style.setProperty('--tc-glare', '0.75');

        if (rxTo && ryTo) {
          rxTo(rx);
          ryTo(ry);
        }
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--tc-glare', '0');
        if (rxTo && ryTo) {
          rxTo(0);
          ryTo(0);
        }
      });
    });
  }

  /* ==========================================================================
   * 8. LOGIC PROBE & VERNIER DATUM RETICLE ON CLICK
   * ========================================================================== */
  function initLogicProbeReticle() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    Object.assign(layer.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '9999',
      overflow: 'hidden'
    });
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const probes = [];
    let raf = 0;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
      raf = 0;
      for (const p of [...probes]) {
        const elapsed = now - p.start;
        const progress = elapsed / p.duration;
        const ctx = p.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);

        if (progress >= 1) {
          p.canvas.remove();
          const idx = probes.indexOf(p);
          if (idx >= 0) probes.splice(idx, 1);
          continue;
        }

        ctx.setTransform(p.ratio, 0, 0, p.ratio, -p.left * p.ratio, -p.top * p.ratio);
        const e = easeOutCubic(clamp(progress, 0, 1));
        const fade = 1 - smoothstep(0.45, 1, progress);

        // 1. Expanding Vernier Datum Circle
        const r = 6 + 26 * e;
        ctx.strokeStyle = p.accent;
        ctx.globalAlpha = fade * 0.85;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Inner Square Datum Box
        const sq = 5 + 8 * (1 - e);
        ctx.strokeStyle = p.sketch;
        ctx.globalAlpha = fade * 0.9;
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - sq, p.y - sq, sq * 2, sq * 2);

        // 3. Orthogonal Caliper Crosshair Ticks (0, 90, 180, 270 deg)
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 1.4;
        const inner = r - 4;
        const outer = r + 6;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(p.x + Math.cos(a) * inner, p.y + Math.sin(a) * inner);
          ctx.lineTo(p.x + Math.cos(a) * outer, p.y + Math.sin(a) * outer);
          ctx.stroke();
        }

        // 4. Coordinate Probe Readout
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = p.accent;
        ctx.globalAlpha = fade;
        ctx.fillText(p.label, p.x + 12, p.y - 10);
        ctx.globalAlpha = 1;
      }
      if (probes.length) raf = requestAnimationFrame(frame);
    };

    const spawnProbe = (x, y) => {
      const accent = getAccentHex();
      const sketch = getSketchHex();
      const xmm = (x * 0.264583).toFixed(0);
      const ymm = ((y + window.scrollY) * 0.264583).toFixed(0);
      const label = `[${xmm},${ymm}mm]`;
      const reach = 95;
      const box = {
        left: Math.max(0, x - reach),
        top: Math.max(0, y - reach),
        right: Math.min(window.innerWidth, x + reach),
        bottom: Math.min(window.innerHeight, y + reach)
      };
      if (box.right - box.left < 2 || box.bottom - box.top < 2) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil((box.right - box.left) * ratio);
      canvas.height = Math.ceil((box.bottom - box.top) * ratio);
      Object.assign(canvas.style, {
        position: 'absolute',
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.right - box.left}px`,
        height: `${box.bottom - box.top}px`,
        pointerEvents: 'none'
      });
      layer.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas.remove();
        return;
      }
      probes.push({
        x,
        y,
        start: performance.now(),
        duration: 520,
        accent,
        sketch,
        label,
        canvas,
        ctx,
        ratio,
        left: box.left,
        top: box.top
      });
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      spawnProbe(e.clientX, e.clientY);
    }, { passive: true });
  }

  /* ==========================================================================
   * 9. ENGINEERING TELEMETRY DECODER ON SECTION TAGS & DIMENSIONS
   * ========================================================================== */
  const TELEMETRY_GLYPHS = '0123456789ABCDEFΩμF±ΔΦVAWHz[]/-=';

  function decodeTelemetryString(el, durationMs = 560) {
    if (!el || el.dataset.rbDecryptRunning === '1') return;
    const original = el.dataset.rbOriginalText || el.textContent;
    el.dataset.rbOriginalText = original;
    el.dataset.rbDecryptRunning = '1';

    if (typeof window.gsap !== 'undefined' && window.ScrambleTextPlugin) {
      window.gsap.to(el, {
        duration: durationMs / 1000,
        scrambleText: {
          text: original,
          chars: TELEMETRY_GLYPHS,
          revealDelay: 0.08,
          speed: 0.7
        },
        onComplete: () => {
          el.textContent = original;
          el.dataset.rbDecryptRunning = '0';
        }
      });
      return;
    }

    const chars = Array.from(original);
    const start = performance.now();
    function tick(now) {
      const progress = clamp((now - start) / durationMs, 0, 1);
      const revealCount = Math.floor(progress * chars.length);
      let out = '';
      for (let i = 0; i < chars.length; i++) {
        if (/\s/.test(chars[i]) || i < revealCount) {
          out += chars[i];
        } else {
          out += TELEMETRY_GLYPHS[Math.floor(Math.random() * TELEMETRY_GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = original;
        el.dataset.rbDecryptRunning = '0';
      }
    }
    requestAnimationFrame(tick);
  }

  function initTelemetryTextDecoders() {
    const selectors = [
      '.sec-tag',
      '.dim-line > span',
      '.bg-strip .font-bold.t-dim > span.truncate'
    ];
    const nodes = document.querySelectorAll(selectors.join(', '));
    nodes.forEach((node) => {
      if (!node.dataset.rbOriginalText) {
        node.dataset.rbOriginalText = node.textContent;
      }
      node.addEventListener('pointerenter', () => decodeTelemetryString(node, 460));
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          decodeTelemetryString(entry.target, 600);
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('.sec-tag').forEach(tag => io.observe(tag));
  }

  /* ==========================================================================
   * 9B. SPLIT-TEXT CHARACTER & WORD CHOREOGRAPHY (SplitText-JS-CSS)
   * ========================================================================== */
  const SPLIT_STIFFNESS = 180;
  const SPLIT_DAMPING = 19;
  const SPLIT_KICK = 0.024;
  const splitWaveEase = t => 1 - Math.cos(t * Math.PI * 1.5) * Math.pow(1 - t, 1.2);

  function getSplitEffect(effect, em) {
    switch (effect) {
      case 'fade':
        return { from: { opacity: 0 }, to: { opacity: 1 }, ease: 'power2.inOut' };
      case 'blur':
        return {
          from: { opacity: 0, filter: `blur(${Math.round(em * 1.4) / 10}px)` },
          to: { opacity: 1, filter: 'blur(0px)' },
          ease: 'power2.out'
        };
      case 'flip': {
        const setup = { transformPerspective: em * 6, transformOrigin: '50% 100%' };
        return {
          from: { ...setup, opacity: 0, rotationX: -90 },
          to: { ...setup, opacity: 1, rotationX: 0 },
          ease: 'power3.out'
        };
      }
      case 'pop':
        return { from: { opacity: 0, scale: 0 }, to: { opacity: 1, scale: 1 }, ease: 'back.out(1.6)' };
      case 'skew':
        return {
          from: { transformOrigin: '50% 100%', opacity: 0, x: -em * 0.4, skewX: -24 },
          to: { transformOrigin: '50% 100%', opacity: 1, x: 0, skewX: 0 },
          ease: 'expo.out'
        };
      case 'wave':
        return { from: { opacity: 0, y: em * 0.45 }, to: { opacity: 1, y: 0 }, ease: splitWaveEase };
      default:
        return { from: { opacity: 0, y: 26 }, to: { opacity: 1, y: 0 }, ease: 'power3.out' };
    }
  }

  function attachSplitText(el, opts = {}) {
    if (!el || el.dataset.splitAttached || typeof window.gsap === 'undefined' || typeof window.SplitText === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const text = (el.textContent || '').trim();
    if (!text) return;
    el.dataset.splitAttached = '1';
    el.classList.add('split-parent');

    const gsap = window.gsap;
    const GSAPSplitText = window.SplitText;
    const delay = opts.delay ?? 28;
    const duration = opts.duration ?? 0.72;
    const splitType = opts.splitType ?? 'chars,words';
    const staggerFrom = opts.staggerFrom ?? 'start';
    const mask = opts.mask ?? false;
    const effect = opts.effect ?? 'rise';
    const trigger = opts.trigger ?? 'view';
    const hoverEffect = opts.hoverEffect ?? 'lift';
    const accentColor = opts.accentColor ?? getAccentHex();

    const unit = splitType.includes('chars') ? 'chars' : splitType.includes('words') ? 'words' : 'lines';
    const em = parseFloat(getComputedStyle(el).fontSize) || 18;
    const look = getSplitEffect(effect, em);
    const fromVars = opts.from || look.from;
    const toVars = opts.to || look.to;
    const easing = opts.ease || look.ease;
    const settle = 'transform,filter,willChange';

    let pieces = [];
    let movers = [];
    let order = gsap.utils.distribute({ each: delay / 1000, from: staggerFrom });
    let revealed = false;
    let raf = 0;
    let last = 0;
    let centers = null;
    const lift = em * 0.18;
    const springs = [];
    const kicks = [];
    const pointer = { x: 0, y: 0, inside: false };

    const reveal = (initial, vars) => {
      const tl = gsap.timeline(vars);
      tl.fromTo(
        pieces,
        { ...fromVars, willChange: 'transform, opacity' },
        { ...toVars, duration, ease: easing, stagger: order, immediateRender: initial },
        0
      );
      if (accentColor) {
        tl.fromTo(
          pieces,
          { color: accentColor },
          {
            color: getComputedStyle(el).color,
            duration: duration * 0.7,
            ease: 'power1.inOut',
            stagger: order,
            immediateRender: initial
          },
          duration * 0.25
        );
      }
      tl.set(pieces, { clearProps: accentColor ? `${settle},color` : settle });
      return tl;
    };

    const measure = () => {
      const box = el.getBoundingClientRect();
      centers = movers.map((node, i) => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - box.left,
          y: rect.top + rect.height / 2 - box.top - (springs[i]?.y || 0)
        };
      });
    };

    const tick = (now) => {
      raf = 0;
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
      last = now;
      const spots = hoverEffect === 'lift' && pointer.inside && revealed ? centers : null;
      const radius = em * 1.15;
      let moving = false;

      for (let k = kicks.length - 1; k >= 0; k--) {
        if (now < kicks[k].at) continue;
        const spring = springs[kicks[k].index];
        if (spring) spring.v -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      movers.forEach((node, i) => {
        const spring = springs[i] || (springs[i] = { y: 0, v: 0 });
        const spot = spots?.[i];
        let target = 0;
        if (spot) {
          const dx = (spot.x - pointer.x) / radius;
          const dy = (spot.y - pointer.y) / (radius * 1.4);
          target = -lift * Math.exp(-(dx * dx + dy * dy) * 0.5);
        }
        spring.v += (SPLIT_STIFFNESS * (target - spring.y) - SPLIT_DAMPING * spring.v) * dt;
        spring.y += spring.v * dt;
        if (Math.abs(target - spring.y) < 0.02 && Math.abs(spring.v) < 0.05) {
          spring.y = target;
          spring.v = 0;
        } else {
          moving = true;
        }
        node.style.translate = Math.abs(spring.y) > 0.01 ? `0 ${spring.y.toFixed(2)}px` : '';
      });

      if (moving || kicks.length) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const locate = (e) => {
      const box = el.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
    };

    el.addEventListener('pointerenter', (e) => {
      locate(e);
      pointer.inside = true;
      if (!revealed || hoverEffect === 'none') return;
      measure();
      if (hoverEffect === 'wave') {
        const now = performance.now();
        const speed = em * 9;
        const velocity = (em * 0.16) / SPLIT_KICK;
        centers.forEach((center, index) => {
          kicks.push({ index, velocity, at: now + (Math.abs(center.x - pointer.x) / speed) * 1000 });
        });
      }
      wake();
    }, { passive: true });

    el.addEventListener('pointermove', (e) => {
      locate(e);
      pointer.inside = true;
      if (!revealed || hoverEffect !== 'lift') return;
      if (!centers) measure();
      wake();
    }, { passive: true });

    el.addEventListener('pointerleave', () => {
      pointer.inside = false;
      wake();
    }, { passive: true });

    const runSplit = () => {
      const createSplit = typeof GSAPSplitText.create === 'function'
        ? (target, cfg) => GSAPSplitText.create(target, cfg)
        : (target, cfg) => new GSAPSplitText(target, cfg);
      createSplit(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        mask: mask ? unit : undefined,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          pieces = [self[unit], self.chars, self.words, self.lines].find(list => list && list.length) || [];
          movers = mask && self.masks?.length === pieces.length ? self.masks : pieces;
          order = gsap.utils.distribute({ each: delay / 1000, from: staggerFrom });
          centers = null;
          springs.length = 0;
          kicks.length = 0;
          if (revealed) return undefined;
          return reveal(true, {
            scrollTrigger:
              trigger === 'load' || !window.ScrollTrigger
                ? undefined
                : { trigger: el, start: 'top 92%', once: true, fastScrollEnd: true },
            onComplete: () => {
              revealed = true;
            }
          });
        }
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runSplit);
    } else {
      runSplit();
    }
  }

  function initSplitTextHeadings() {
    const headings = document.querySelectorAll('h2.text-xl, [data-split-text]');
    headings.forEach((h, idx) => {
      attachSplitText(h, {
        splitType: 'chars,words',
        effect: idx % 2 === 0 ? 'rise' : 'flip',
        hoverEffect: 'lift',
        delay: 22,
        duration: 0.65
      });
    });
  }

  /* ==========================================================================
   * 10. CRITICALLY DAMPED MAGNETIC SNAP ON CONTROLS
   * ========================================================================== */
  function initPrecisionControlSnap() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof window.gsap === 'undefined') return;

    const controls = document.querySelectorAll(
      'header a[href="cv.html"], header a[href^="mailto:"], .filter-btn, a[href*="Lee-ParkinsonCV.pdf"], .section-chevron'
    );

    controls.forEach((btn) => {
      if (btn.dataset.rbMagnetAttached) return;
      btn.dataset.rbMagnetAttached = '1';

      const xTo = window.gsap.quickTo(btn, 'x', { duration: 0.25, ease: 'power3.out' });
      const yTo = window.gsap.quickTo(btn, 'y', { duration: 0.25, ease: 'power3.out' });

      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
        xTo(clamp(dx, -6, 6));
        yTo(clamp(dy, -5, 5));
      }, { passive: true });

      btn.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ==========================================================================
   * 11. BOTTOM CAD SHEET SELECTOR & INSTRUMENT CONSOLE BAR
   * ========================================================================== */
  function initCADInstrumentConsole() {
    if (document.querySelector('.rb-dock-wrap')) return;

    const isHomePage = Boolean(document.getElementById('about') && document.getElementById('schematics'));
    const items = [
      { label: 'SHT-00 // Master Index', short: 'S00', href: isHomePage ? '#top' : 'index.html' },
      { label: 'SHT-01 // About & Toolkit', short: 'S01', href: isHomePage ? '#about' : 'about.html', section: 'about' },
      { label: 'SHT-02 // Schematics', short: 'S02', href: isHomePage ? '#schematics' : 'schematics.html', section: 'schematics' },
      { label: 'SHT-03 // Visual Gallery', short: 'S03', href: isHomePage ? '#gallery' : 'gallery.html', section: 'gallery' },
      { label: 'SHT-04 // Experience Log', short: 'S04', href: isHomePage ? '#experience' : 'experience.html', section: 'experience' },
      { label: 'SHT-05 // Academic Spec', short: 'S05', href: isHomePage ? '#education' : 'education.html', section: 'education' },
      { label: 'SHT-06 // Field Systems', short: 'S06', href: isHomePage ? '#hobbies' : 'hobbies.html', section: 'hobbies' },
      { label: 'SHT-07 // Comms & Dispatch', short: 'S07', href: isHomePage ? '#contact' : 'contact.html', section: 'contact' },
      { sep: true },
      { label: 'DOC // CV Specification', short: 'CV', href: 'cv.html' },
      { label: 'APP // UNO Crawl Map', short: 'UNO', href: 'projects/pubcrawlapp/' },
      { label: 'APP // Chess Engine', short: 'CHS', href: 'projects/chess/' },
      { sep: true },
      { label: 'Toggle CAD Crosshair Guides [X/Y]', short: '⌖XY', action: 'crosshair' },
      { label: 'Toggle Component Dimension Stamps [mm]', short: '📐MM', action: 'dims' }
    ];

    const wrap = document.createElement('div');
    wrap.className = 'rb-dock-wrap';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'CAD Sheet Selector and Instrument Console');

    const dock = document.createElement('div');
    dock.className = 'rb-dock';

    const prefix = document.createElement('div');
    prefix.className = 'rb-dock-prefix';
    prefix.innerHTML = '<span class="rb-cad-hud__dot"></span><span>CAD // SHEETS</span>';
    dock.appendChild(prefix);

    const domButtons = [];

    items.forEach((item) => {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.className = 'rb-dock-sep';
        dock.appendChild(sep);
        return;
      }

      if (item.action) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `rb-dock-item ${item.action === 'dims' ? 'is-active' : ''}`;
        btn.innerHTML = `<span>${item.short}</span><span class="rb-dock-tooltip">${item.label}</span>`;
        btn.addEventListener('click', () => {
          if (item.action === 'crosshair') {
            crosshairEnabled = !crosshairEnabled;
            btn.classList.toggle('is-active', crosshairEnabled);
            document.querySelector('.cad-crosshair-layer')?.classList.toggle('is-active', crosshairEnabled);
          } else if (item.action === 'dims') {
            dimsAlwaysVisible = !dimsAlwaysVisible;
            btn.classList.toggle('is-active', dimsAlwaysVisible);
            document.body.classList.toggle('cad-dims-visible', dimsAlwaysVisible);
          }
        });
        dock.appendChild(btn);
        return;
      }

      const a = document.createElement('a');
      a.className = 'rb-dock-item';
      a.href = item.href;
      if (item.section) a.dataset.dockSection = item.section;
      a.innerHTML = `<span>${item.short}</span><span class="rb-dock-tooltip">${item.label}</span>`;

      if (isHomePage && item.href.startsWith('#')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          if (item.section) {
            const sec = document.getElementById(item.section);
            if (sec && sec.classList.contains('section-collapsed') && typeof window.toggleBlueprintSection === 'function') {
              window.toggleBlueprintSection(item.section);
            }
          }
          if (scroller) {
            scroller.scrollTo(item.href, { offset: -72, duration: 0.9 });
          } else {
            const target = item.href === '#top' ? document.body : document.querySelector(item.href);
            target?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      dock.appendChild(a);
      domButtons.push(a);
    });

    wrap.appendChild(dock);
    document.body.appendChild(wrap);

    // Highlight active sheet in CAD Console
    if (isHomePage) {
      const sectionIds = ['about', 'schematics', 'gallery', 'experience', 'education', 'hobbies', 'contact'];
      const updateActiveDock = () => {
        const scrollPos = window.scrollY + window.innerHeight * 0.32;
        let currentId = '';
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= scrollPos) {
            currentId = id;
          }
        }
        domButtons.forEach((btn) => {
          btn.classList.toggle('is-active', btn.dataset.dockSection === currentId && currentId !== '');
        });
      };
      if (scroller) scroller.on('scroll', updateActiveDock);
      else window.addEventListener('scroll', updateActiveDock, { passive: true });
      updateActiveDock();
    } else {
      const pathName = window.location.pathname.split('/').pop() || 'index.html';
      domButtons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('href') === pathName);
      });
    }
  }

  /* ==========================================================================
   * 12. CAD PLOTTER CHOREOGRAPHY & LAYOUT TRANSITIONS
   * ========================================================================== */
  function initCADPlotterChoreography() {
    if (typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const Flip = window.Flip;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // 12.1 Attach Precision CAD Perimeter Trace to Primary Schematic Sheet
    const mainHeroCard = document.querySelector('main > section.blueprint-card') || document.querySelector('main > .blueprint-card');
    if (mainHeroCard) {
      attachCADPerimeterTrace(mainHeroCard, {
        borderRadius: 2,
        intensity: 0.55,
        glow: 0.42,
        thickness: 1.0,
        strands: 1.4,
        chaos: 0.08,
        spread: 0.14
      });
    }

    // 12.2 & 12.3 Responsive & Reduced-Motion Choreography via gsap.matchMedia() + ScrollTrigger.batch()
    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: '(min-width: 800px)',
        isMobile: '(max-width: 799px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;
        if (reduceMotion) return;

        if (mainHeroCard) {
          const photoBox = mainHeroCard.querySelector('.landscape-hero-photo-box');
          const statusPill = mainHeroCard.querySelector('.inline-flex');
          const quote = mainHeroCard.querySelector('p.font-sketch');
          const statBoxes = mainHeroCard.querySelectorAll('.grid.grid-cols-2 > div');
          const cvCard = mainHeroCard.querySelector('.blueprint-card.blueprint-interactive');

          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.addLabel('intro', 0);
          if (photoBox) {
            tl.from(photoBox, { autoAlpha: 0, y: isDesktop ? 16 : 10, scale: 0.98, duration: 0.55 }, 'intro+=0.04');
          }
          if (statusPill) {
            tl.from(statusPill, { autoAlpha: 0, x: -12, duration: 0.42 }, 'intro+=0.1');
          }
          if (quote) {
            tl.from(quote, { autoAlpha: 0, y: 10, duration: 0.45 }, 'intro+=0.18');
          }
          if (statBoxes.length) {
            tl.from(statBoxes, { autoAlpha: 0, y: 12, stagger: 0.05, duration: 0.42 }, 'intro+=0.24');
          }
          if (cvCard) {
            tl.from(cvCard, { autoAlpha: 0, y: 14, duration: 0.48 }, 'intro+=0.34');
          }
        }

        if (ScrollTrigger) {
          const revealCards = gsap.utils.toArray(
            'main section:not(:first-of-type) .blueprint-card, main > .blueprint-card:not(:first-of-type)'
          );
          if (revealCards.length) {
            gsap.set(revealCards, { autoAlpha: 0, y: isDesktop ? 18 : 12 });
            ScrollTrigger.batch(revealCards, {
              interval: 0.08,
              batchMax: isDesktop ? 4 : 2,
              start: 'top 92%',
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.48,
                  stagger: 0.06,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform,opacity,visibility'
                });
              }
            });
          }

          gsap.utils.toArray('.dim-line').forEach((line) => {
            gsap.from(line, {
              scrollTrigger: {
                trigger: line,
                start: 'top 95%',
                toggleActions: 'play none none none'
              },
              scaleX: 0.88,
              autoAlpha: 0,
              duration: 0.52,
              ease: 'expo.out'
            });
          });
        }
      }
    );

    // 12.4 Seamless Schematic Filtering with Layout Morphing
    if (typeof window.filterProjects === 'function' && Flip) {
      window.filterProjects = function (cat) {
        document.querySelectorAll('.filter-btn').forEach((b) => {
          const active = b.dataset.filter === cat;
          b.classList.toggle('bg-sky-500', active);
          b.classList.toggle('text-white', active);
          b.classList.toggle('font-bold', active);
        });

        const cards = gsap.utils.toArray('.project-card');
        const state = Flip.getState(cards);

        cards.forEach((c) => {
          const show = cat === 'all' || c.dataset.category === cat;
          c.classList.toggle('hidden', !show);
        });

        Flip.from(state, {
          duration: 0.42,
          ease: 'power3.out',
          scale: true,
          stagger: 0.03,
          onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.32, ease: 'power2.out' }),
          onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.96, duration: 0.2 }),
          onComplete: () => {
            if (ScrollTrigger) ScrollTrigger.refresh();
            if (scroller) scroller.resize();
          }
        });
      };
    }

    // 12.5 Keep ScrollTrigger and Scroller synced when collapsible blueprint sheets toggle
    const origToggle = window.toggleBlueprintSection;
    if (typeof origToggle === 'function') {
      window.toggleBlueprintSection = function (id, forceOpen) {
        origToggle(id, forceOpen);
        setTimeout(() => {
          if (scroller) scroller.resize();
          if (ScrollTrigger) ScrollTrigger.refresh();
        }, 400);
      };
    }
    const origSetAll = window.setAllSections;
    if (typeof origSetAll === 'function') {
      window.setAllSections = function (expand) {
        origSetAll(expand);
        setTimeout(() => {
          if (scroller) scroller.resize();
          if (ScrollTrigger) ScrollTrigger.refresh();
        }, 400);
      };
    }
  }

  /* ==========================================================================
   * 13. BOOTSTRAP ALL CAD & INSTRUMENTATION SYSTEMS
   * ========================================================================== */
  window.attachSplitText = attachSplitText;

  function boot() {
    initScrollAndMotionCore();
    initCADRulersAndTelemetry();
    initEngineeringTitleBlockAndScope();
    initTelemetryBusRibbon();
    initCADCardOverlays();
    initOrthographicInspectionTilt();
    initLogicProbeReticle();
    initTelemetryTextDecoders();
    initSplitTextHeadings();
    initPrecisionControlSnap();
    initCADInstrumentConsole();
    initCADPlotterChoreography();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
