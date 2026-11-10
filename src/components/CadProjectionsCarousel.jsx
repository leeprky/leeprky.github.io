import { useRef, useState } from 'react';
import { CAD_PROJECTIONS } from '../data/portfolioData';
import DecryptedText from './react-bits/DecryptedText/DecryptedText';

export default function CadProjectionsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cyanotypeMode, setCyanotypeMode] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const dragStartRef = useRef(null);
  const total = CAD_PROJECTIONS.length;

  const goTo = (idx) => {
    setActiveIndex(((idx % total) + total) % total);
  };
  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  const onPointerDown = (e) => {
    dragStartRef.current = e.clientX;
  };
  const onPointerUp = (e) => {
    if (dragStartRef.current === null) return;
    const diff = e.clientX - dragStartRef.current;
    dragStartRef.current = null;
    if (diff > 45) prev();
    else if (diff < -45) next();
  };

  return (
    <div className="cad-projections-block">
      <div className="subhead" style={{ marginTop: '2rem' }}>
        <h3>
          <span className="mono">
            <DecryptedText
              text="04.2 // ORTHOGRAPHIC CAD PROJECTIONS"
              animateOn="view"
              speed={35}
            />
          </span>{' '}
          Hand-Drafted UCLan Engineering Projections
        </h3>
        <div className="cad-view-actions">
          <button
            type="button"
            id="toggle-cyanotype-filter"
            className={`btn btn-sm ${cyanotypeMode ? 'btn-primary' : ''}`}
            onClick={() => setCyanotypeMode((v) => !v)}
            aria-pressed={cyanotypeMode}
          >
            <span>{cyanotypeMode ? '◈ CYANOTYPE FILTER: ON' : '◇ CYANOTYPE FILTER: OFF'}</span>
          </button>
          <button
            type="button"
            id="inspect-active-projection"
            className="btn btn-sm"
            onClick={() => setLightboxItem(CAD_PROJECTIONS[activeIndex])}
          >
            <span>🔍 INSPECT DRAWING</span>
          </button>
        </div>
      </div>

      <div
        className="prism-carousel-wrap"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev();
          if (e.key === 'ArrowRight') next();
        }}
        tabIndex={0}
        role="region"
        aria-label="Hand-Drafted Engineering Projections 3D Coverflow"
      >
        <div
          className="prism-viewport"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {CAD_PROJECTIONS.map((slide, i) => {
            const offset = i - activeIndex;
            const absOffset = Math.abs(offset);
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const xSpacing = isMobile ? 130 : 230;
            const zSpacing = isMobile ? 110 : 155;
            const yRotation = isMobile ? 25 : 34;

            let transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
            let zIndex = 10;
            let opacity = 1;
            let filter = 'none';

            if (offset !== 0) {
              const dir = offset > 0 ? 1 : -1;
              const tx = offset * xSpacing;
              const tz = -absOffset * zSpacing;
              const ry = dir * -yRotation;
              const scale = Math.max(0.74, 1 - absOffset * 0.12);
              opacity = absOffset > 2 ? 0 : Math.max(0.38, 1 - absOffset * 0.32);
              transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
              zIndex = 10 - absOffset;
              filter = absOffset > 1 ? 'blur(2px) grayscale(25%)' : 'grayscale(10%)';
            }

            return (
              <div
                key={slide.id}
                className={`prism-slide ${offset === 0 ? 'is-active' : ''} ${
                  cyanotypeMode ? 'is-cyanotype' : ''
                }`}
                style={{
                  transform,
                  zIndex,
                  opacity,
                  filter
                }}
                onClick={() => {
                  if (i !== activeIndex) goTo(i);
                  else setLightboxItem(slide);
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  width="800"
                  height="550"
                />
                <div className="prism-slide-badge mono">{slide.scale}</div>
                <div className="prism-slide-info">
                  <div className="prism-slide-meta-row">
                    <span className="prism-slide-tag">{slide.id}</span>
                    <span className="tiny mono">{slide.date}</span>
                  </div>
                  <h4 className="prism-slide-title">{slide.title}</h4>
                  <p className="prism-slide-desc">{slide.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="prism-controls">
          <button
            type="button"
            id="prism-prev-btn"
            className="prism-nav-btn prism-prev"
            onClick={prev}
            aria-label="Previous engineering drawing"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="prism-dots" role="tablist" aria-label="Projection slides">
            {CAD_PROJECTIONS.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                id={`prism-dot-${idx}`}
                role="tab"
                aria-selected={idx === activeIndex}
                className={`prism-dot ${idx === activeIndex ? 'is-active' : ''}`}
                aria-label={`View ${slide.title}`}
                onClick={() => goTo(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            id="prism-next-btn"
            className="prism-nav-btn prism-next"
            onClick={next}
            aria-label="Next engineering drawing"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution CAD Sheet Inspection */}
      {lightboxItem && (
        <div
          className="cad-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={() => setLightboxItem(null)}
        >
          <div className="cad-lightbox-sheet panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <span className="panel-id">{lightboxItem.id}</span>
                <h4 className="h3" style={{ marginTop: '0.2rem' }}>{lightboxItem.title}</h4>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${cyanotypeMode ? 'btn-primary' : ''}`}
                  onClick={() => setCyanotypeMode((v) => !v)}
                >
                  <span>{cyanotypeMode ? '◈ CYANOTYPE ON' : '◇ CYANOTYPE OFF'}</span>
                </button>
                <button
                  type="button"
                  id="close-cad-lightbox"
                  className="btn btn-sm"
                  onClick={() => setLightboxItem(null)}
                >
                  <span>✕ CLOSE [ESC]</span>
                </button>
              </div>
            </div>
            <div className={`cad-lightbox-img-wrap ${cyanotypeMode ? 'is-cyanotype' : ''}`}>
              <img src={lightboxItem.image} alt={lightboxItem.title} />
            </div>
            <div className="cad-lightbox-footer mono">
              <span>{lightboxItem.dimensions}</span>
              <span>DATE: {lightboxItem.date}</span>
              <span className="accent">DRAWN BY: LEE PARKINSON (UCLAN)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
