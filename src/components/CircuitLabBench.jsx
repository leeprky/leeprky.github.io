import { useEffect, useRef, useState } from 'react';
import { IC_PINOUT } from '../data/portfolioData';
import DecryptedText from './react-bits/DecryptedText/DecryptedText';
import SpotlightCard from './react-bits/SpotlightCard/SpotlightCard';

export default function CircuitLabBench({ accentHex = '#38bdf8', theme = 'blueprint' }) {
  const [activePin, setActivePin] = useState(IC_PINOUT[0]);
  const [voltage, setVoltage] = useState(12.6);
  const [resistance, setResistance] = useState(120);
  const [frequency, setFrequency] = useState(50);
  const [waveType, setWaveType] = useState('sine');
  const canvasRef = useRef(null);

  const currentMa = (voltage / resistance) * 1000;
  const powerMw = (voltage * voltage / resistance) * 1000;
  const vRms =
    waveType === 'square'
      ? voltage
      : waveType === 'triangle'
      ? voltage / Math.sqrt(3)
      : voltage / Math.sqrt(2);
  const periodMs = 1000 / frequency;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let rafId = 0;
    let phase = 0;
    let lastTime = performance.now();

    const renderScope = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      phase += dt * (frequency * 0.14);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 420;
      const h = canvas.clientHeight || 190;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const isLight = theme === 'whiteprint';
      ctx.fillStyle = isLight ? '#e9f1fb' : '#020916';
      ctx.fillRect(0, 0, w, h);

      // CAD Oscilloscope Graticule Grid
      ctx.strokeStyle = isLight ? 'rgba(10, 98, 201, 0.14)' : 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      const cols = 10;
      const rows = 6;
      for (let i = 1; i < cols; i++) {
        const x = (w / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const y = (h / rows) * j;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center zero-axis line with tick marks
      const midY = h / 2;
      ctx.strokeStyle = isLight ? 'rgba(10, 98, 201, 0.35)' : 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();

      for (let x = 0; x < w; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, midY - 3);
        ctx.lineTo(x, midY + 3);
        ctx.stroke();
      }

      // Secondary Current Wave (Amber dashed trace)
      const normCurrent = Math.min(1, currentMa / 500);
      const currentAmp = (h * 0.34) * (0.2 + normCurrent * 0.75);
      ctx.save();
      ctx.strokeStyle = isLight ? '#b85c00' : '#fde047';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * (frequency / 12) * Math.PI * 2 + phase - 0.35;
        let sample = Math.sin(t);
        if (waveType === 'square') sample = Math.sin(t) >= 0 ? 1 : -1;
        else if (waveType === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(t));
        else if (waveType === 'pwm') sample = (t % (Math.PI * 2)) < Math.PI * 1.3 ? 1 : -0.6;
        const y = midY - sample * currentAmp * 0.65;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Primary Voltage Wave (Blueprint Cyan glowing trace)
      const voltAmp = (h * 0.38) * Math.min(1, Math.max(0.15, voltage / 24));
      ctx.save();
      ctx.strokeStyle = accentHex || '#38bdf8';
      ctx.shadowColor = accentHex || '#38bdf8';
      ctx.shadowBlur = isLight ? 4 : 12;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * (frequency / 12) * Math.PI * 2 + phase;
        let sample = Math.sin(t);
        if (waveType === 'square') sample = Math.sin(t) >= 0 ? 1 : -1;
        else if (waveType === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(t));
        else if (waveType === 'pwm') sample = (t % (Math.PI * 2)) < Math.PI * 1.3 ? 1 : -0.6;
        const y = midY - sample * voltAmp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      rafId = requestAnimationFrame(renderScope);
    };

    rafId = requestAnimationFrame(renderScope);
    return () => cancelAnimationFrame(rafId);
  }, [voltage, resistance, frequency, waveType, accentHex, theme, currentMa]);

  const leftPins = IC_PINOUT.filter((p) => p.side === 'left');
  const rightPins = IC_PINOUT.filter((p) => p.side === 'right');

  return (
    <div className="lab-bench-grid" style={{ marginTop: '1.35rem' }}>
      {/* LEFT: IC-LP2026 Interactive Microcontroller Pinout Schematic */}
      <SpotlightCard
        className="panel ic-schematic-panel"
        spotlightColor={accentHex}
        intensity={0.18}
        borderGlow={0.75}
        theme={theme === 'whiteprint' ? 'light' : 'dark'}
      >
        <div className="panel-head">
          <span className="panel-id">
            <DecryptedText
              text="SCHEMATIC 01-B // IC-LP2026 PINOUT"
              animateOn="view"
              speed={35}
              characters="0123456789ABCDEFΩμF±ΔΦ"
            />
          </span>
          <span className="tag tag-outline">DIP-8 ARCHITECTURE</span>
        </div>

        <p className="body small" style={{ marginBottom: '1rem' }}>
          Select or hover any terminal pin on the <strong>IC-LP2026-EE</strong> package to inspect core engineering competencies and signal parameters:
        </p>

        <div className="ic-package-wrap" role="region" aria-label="Interactive IC Pinout Diagram">
          {/* Left Pins (1-4) */}
          <div className="ic-pin-col ic-pin-col-left">
            {leftPins.map((p) => {
              const isSelected = activePin.pin === p.pin;
              return (
                <button
                  key={p.pin}
                  type="button"
                  id={`ic-pin-btn-${p.pin}`}
                  className={`ic-pin-btn ${isSelected ? 'is-active' : ''}`}
                  onMouseEnter={() => setActivePin(p)}
                  onClick={() => setActivePin(p)}
                  aria-pressed={isSelected}
                >
                  <span className="ic-pin-code">{p.code}</span>
                  <span className="ic-pin-lead" aria-hidden="true" />
                  <span className="ic-pin-num">0{p.pin}</span>
                </button>
              );
            })}
          </div>

          {/* Center IC Die Body */}
          <div className="ic-die-body">
            <div className="ic-die-notch" aria-hidden="true" />
            <div className="ic-die-marking mono">
              <div className="ic-die-part">IC-LP2026-EE</div>
              <div className="ic-die-sub">UCLAN // PRESTON</div>
              <div className="ic-die-active-code">{activePin.code}</div>
              <div className="ic-die-Spec">{activePin.voltage}</div>
            </div>
          </div>

          {/* Right Pins (8-5) */}
          <div className="ic-pin-col ic-pin-col-right">
            {rightPins.map((p) => {
              const isSelected = activePin.pin === p.pin;
              return (
                <button
                  key={p.pin}
                  type="button"
                  id={`ic-pin-btn-${p.pin}`}
                  className={`ic-pin-btn ic-pin-btn-right ${isSelected ? 'is-active' : ''}`}
                  onMouseEnter={() => setActivePin(p)}
                  onClick={() => setActivePin(p)}
                  aria-pressed={isSelected}
                >
                  <span className="ic-pin-num">0{p.pin}</span>
                  <span className="ic-pin-lead" aria-hidden="true" />
                  <span className="ic-pin-code">{p.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Pin Readout Box */}
        <div className="ic-readout-box">
          <div className="ic-readout-top">
            <span className="mono accent" style={{ fontWeight: 700, fontSize: '0.76rem' }}>
              PIN 0{activePin.pin} // {activePin.code}
            </span>
            <span className="mono tiny">
              {activePin.voltage} · {activePin.freq}
            </span>
          </div>
          <div className="ic-readout-title">{activePin.name}</div>
          <p className="body small" style={{ marginTop: '0.25rem' }}>
            {activePin.summary}
          </p>
        </div>
      </SpotlightCard>

      {/* RIGHT: Interactive Lab Oscilloscope & Ohm's Law Telemetry Simulator */}
      <SpotlightCard
        className="panel osc-bench-panel"
        spotlightColor={accentHex}
        intensity={0.18}
        borderGlow={0.75}
        theme={theme === 'whiteprint' ? 'light' : 'dark'}
      >
        <div className="panel-head">
          <span className="panel-id">
            <DecryptedText
              text="INSTRUMENT 01-C // LIVE OSCILLOSCOPE & OHM'S LAW"
              animateOn="view"
              speed={35}
              characters="0123456789ABCDEFΩμF±ΔΦ"
            />
          </span>
          <div className="osc-wave-modes" role="group" aria-label="Waveform generator mode">
            {['sine', 'square', 'triangle', 'pwm'].map((mode) => (
              <button
                key={mode}
                type="button"
                id={`osc-mode-${mode}`}
                className={`osc-mode-btn ${waveType === mode ? 'is-active' : ''}`}
                onClick={() => setWaveType(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Oscilloscope CRT / LCD Screen */}
        <div className="osc-screen-frame">
          <canvas ref={canvasRef} className="osc-canvas" aria-label="Live oscilloscope waveform display" />
          <div className="osc-hud-top mono">
            <span className="accent">CH1: {voltage.toFixed(1)}V ({waveType.toUpperCase()})</span>
            <span style={{ color: 'var(--mark)' }}>CH2: {currentMa.toFixed(1)}mA</span>
            <span>T: {periodMs.toFixed(1)}ms</span>
          </div>
          <div className="osc-hud-bottom mono">
            <span>V_RMS: {vRms.toFixed(2)}V</span>
            <span>P_LOAD: {powerMw >= 1000 ? `${(powerMw / 1000).toFixed(2)}W` : `${powerMw.toFixed(0)}mW`}</span>
            <span>Z_LOAD: {resistance}Ω</span>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="osc-controls-grid">
          <label className="osc-slider-group" htmlFor="osc-voltage-slider">
            <div className="osc-slider-label mono">
              <span>SUPPLY VOLTAGE (V_S)</span>
              <strong className="accent">{voltage.toFixed(1)} V</strong>
            </div>
            <input
              id="osc-voltage-slider"
              type="range"
              min="1.5"
              max="24.0"
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(parseFloat(e.target.value))}
            />
          </label>

          <label className="osc-slider-group" htmlFor="osc-resistance-slider">
            <div className="osc-slider-label mono">
              <span>LOAD RESISTANCE (R_L)</span>
              <strong className="accent">{resistance} Ω</strong>
            </div>
            <input
              id="osc-resistance-slider"
              type="range"
              min="15"
              max="1000"
              step="5"
              value={resistance}
              onChange={(e) => setResistance(parseInt(e.target.value, 10))}
            />
          </label>

          <label className="osc-slider-group" htmlFor="osc-frequency-slider">
            <div className="osc-slider-label mono">
              <span>SIGNAL FREQUENCY (f)</span>
              <strong className="accent">{frequency} Hz</strong>
            </div>
            <input
              id="osc-frequency-slider"
              type="range"
              min="10"
              max="250"
              step="5"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
            />
          </label>
        </div>

        {/* Formula Readout Bar */}
        <div className="osc-formula-bar mono">
          <span>OHM&apos;S LAW: I = V / R = {voltage.toFixed(1)}V / {resistance}Ω = <b>{currentMa.toFixed(1)}mA</b></span>
          <span>JOULE HEATING: P = V·I = <b>{(powerMw / 1000).toFixed(2)}W</b></span>
        </div>
      </SpotlightCard>
    </div>
  );
}
