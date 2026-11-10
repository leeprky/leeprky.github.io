import { useState } from 'react';
import { AUTOMOTIVE_SUBSYSTEMS } from '../data/portfolioData';
import DecryptedText from './react-bits/DecryptedText/DecryptedText';
import SpotlightCard from './react-bits/SpotlightCard/SpotlightCard';

export default function AutomotiveSchematic({ accentHex = '#38bdf8', theme = 'blueprint' }) {
  const [activeSys, setActiveSys] = useState(AUTOMOTIVE_SUBSYSTEMS[0]);

  return (
    <SpotlightCard
      className="panel auto-schematic-card"
      spotlightColor={accentHex}
      intensity={0.18}
      borderGlow={0.75}
      theme={theme === 'whiteprint' ? 'light' : 'dark'}
      style={{ marginTop: '1.5rem' }}
    >
      <div className="panel-head">
        <span className="panel-id">
          <DecryptedText
            text="PROJ-01 // AUTOMOTIVE 12V & MECHANICAL SCHEMATIC"
            animateOn="view"
            speed={35}
          />
        </span>
        <span className="tag tag-mark">OBD-II · FORSCAN · E90 BUILD</span>
      </div>

      <div className="auto-schematic-grid">
        {/* Left: Interactive Orthographic Chassis CAD SVG */}
        <div className="auto-cad-diagram-box">
          <div className="auto-cad-header mono">
            <span>SCALE 1:24 // ORTHO TOP-PLAN CHASSIS</span>
            <span className="accent">{activeSys.code}</span>
          </div>

          <svg
            className="car-blueprint-svg"
            viewBox="0 0 520 220"
            role="img"
            aria-label="Interactive Orthographic Vehicle Blueprint Schematic"
          >
            {/* Blueprint Grid Reference Lines */}
            <line x1="20" y1="110" x2="500" y2="110" className="cad-centerline" />
            <line x1="130" y1="18" x2="130" y2="202" className="cad-datum" />
            <line x1="390" y1="18" x2="390" y2="202" className="cad-datum" />

            {/* Vehicle Chassis Plan Silhouette */}
            <path
              d="M 55,66 C 72,48 115,44 165,44 L 355,44 C 410,44 452,52 468,70 L 476,88 L 476,132 L 468,150 C 452,168 410,176 355,176 L 165,176 C 115,176 72,172 55,154 L 44,134 L 44,86 Z"
              className="cad-chassis-outline"
            />
            {/* Front Splitter Aero Profile */}
            <path
              d="M 44,78 L 32,86 L 32,134 L 44,142"
              className={`cad-node-shape ${activeSys.code.includes('SYS-D') ? 'is-highlighted' : ''}`}
            />
            {/* Cabin Greenhouse */}
            <path
              d="M 165,58 L 325,58 L 355,72 L 355,148 L 325,162 L 165,162 L 138,144 L 138,76 Z"
              className="cad-cabin-outline"
            />

            {/* 4 Wheels + Brake Rotors (SYS-B) */}
            {[
              { x: 112, y: 36 },
              { x: 112, y: 162 },
              { x: 372, y: 36 },
              { x: 372, y: 162 }
            ].map((w, idx) => (
              <g
                key={idx}
                className={`cad-wheel-group ${activeSys.code.includes('SYS-B') ? 'is-highlighted' : ''}`}
                onClick={() => setActiveSys(AUTOMOTIVE_SUBSYSTEMS[1])}
                style={{ cursor: 'pointer' }}
              >
                <rect x={w.x} y={w.y} width="44" height="22" rx="3" />
                <circle cx={w.x + 22} cy={w.y + 11} r="6" />
              </g>
            ))}

            {/* Engine Bay / Powertrain Block (SYS-C) */}
            <g
              className={`cad-engine-group ${activeSys.code.includes('SYS-C') ? 'is-highlighted' : ''}`}
              onClick={() => setActiveSys(AUTOMOTIVE_SUBSYSTEMS[2])}
              style={{ cursor: 'pointer' }}
            >
              <rect x="74" y="82" width="52" height="56" rx="3" />
              <line x1="82" y1="92" x2="118" y2="92" />
              <line x1="82" y1="110" x2="118" y2="110" />
              <line x1="82" y1="128" x2="118" y2="128" />
            </g>

            {/* 12V CAN-Bus & OBD-II Harness Spine (SYS-A) */}
            <g
              className={`cad-harness-group ${activeSys.code.includes('SYS-A') ? 'is-highlighted' : ''}`}
              onClick={() => setActiveSys(AUTOMOTIVE_SUBSYSTEMS[0])}
              style={{ cursor: 'pointer' }}
            >
              <path d="M 126,110 L 210,110 L 235,85 L 340,85 L 415,110" />
              <circle cx="175" cy="110" r="6" />
              <circle cx="235" cy="85" r="6" />
              <circle cx="340" cy="85" r="6" />
            </g>

            {/* Interactive Callout Hotspots */}
            {[
              { x: 205, y: 110, idx: 0, label: 'A: OBD-II' },
              { x: 134, y: 47, idx: 1, label: 'B: BRAKES' },
              { x: 100, y: 110, idx: 2, label: 'C: ENGINE' },
              { x: 46, y: 110, idx: 3, label: 'D: OPTICS/AERO' }
            ].map((node) => {
              const isSel = activeSys.code === AUTOMOTIVE_SUBSYSTEMS[node.idx].code;
              return (
                <g
                  key={node.label}
                  className={`cad-hotspot ${isSel ? 'is-active' : ''}`}
                  onClick={() => setActiveSys(AUTOMOTIVE_SUBSYSTEMS[node.idx])}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={node.x} cy={node.y} r={isSel ? 9 : 6} />
                  <text x={node.x} y={node.y - 13} textAnchor="middle">
                    {node.label}
                  </text>
                </g>
              );
            })}

            {/* Dimension Callouts */}
            <text x="260" y="213" textAnchor="middle" className="cad-dim-text">
              WHEELBASE: 2760mm // TRACK: 1500mm // BUS: 12.6V DC
            </text>
          </svg>

          <div className="auto-active-readout">
            <div className="auto-active-top mono">
              <span className="accent">{activeSys.code}</span>
              <span className="tag tag-outline">{activeSys.status}</span>
            </div>
            <h4 className="h3" style={{ marginTop: '0.3rem' }}>{activeSys.name}</h4>
            <p className="body small" style={{ marginTop: '0.3rem' }}>{activeSys.detail}</p>
          </div>
        </div>

        {/* Right: Subsystem Selector Cards */}
        <div className="auto-subsystems-list">
          <div className="tiny mono" style={{ marginBottom: '0.45rem' }}>
            SELECT VEHICLE SUBSYSTEM TO INSPECT TELEMETRY:
          </div>
          {AUTOMOTIVE_SUBSYSTEMS.map((sys) => {
            const isSel = activeSys.code === sys.code;
            return (
              <button
                key={sys.code}
                type="button"
                id={`auto-sys-${sys.code.split(' ')[0].toLowerCase()}`}
                className={`auto-sys-btn ${isSel ? 'is-active' : ''}`}
                onClick={() => setActiveSys(sys)}
                aria-pressed={isSel}
              >
                <div className="auto-sys-btn-top mono">
                  <span className="accent">{sys.code}</span>
                  <span>{sys.spec}</span>
                </div>
                <div className="auto-sys-btn-title">{sys.name}</div>
                <div className="auto-sys-btn-status mono">{sys.status}</div>
              </button>
            );
          })}
        </div>
      </div>
    </SpotlightCard>
  );
}
