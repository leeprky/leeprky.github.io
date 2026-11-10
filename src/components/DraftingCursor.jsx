import { useEffect, useRef, useState } from 'react';
import Crosshair from './react-bits/Crosshair/Crosshair';

export default function DraftingCursor({ enabled = true, accentHex = '#38bdf8' }) {
  const [measure, setMeasure] = useState(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, timer: null });

  useEffect(() => {
    if (!enabled) {
      setMeasure(null);
      return undefined;
    }

    const isCoarse = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    if (isCoarse) return undefined;

    const onDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      if (
        e.target.closest(
          'a, button, input, select, textarea, label, .prism-viewport, .dock, .tech-text, .ic-pin-btn'
        )
      ) {
        return;
      }
      if (dragRef.current.timer) {
        clearTimeout(dragRef.current.timer);
        dragRef.current.timer = null;
      }
      dragRef.current.active = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    };

    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        const left = Math.min(dragRef.current.startX, e.clientX);
        const top = Math.min(dragRef.current.startY, e.clientY);
        const width = Math.abs(dx);
        const height = Math.abs(dy);
        const wmm = (width * 0.26458).toFixed(1);
        const hmm = (height * 0.26458).toFixed(1);
        const dmm = (dist * 0.26458).toFixed(1);
        setMeasure({
          left,
          top,
          width,
          height,
          label: `ΔX: ${width}px (${wmm}mm) · ΔY: ${height}px (${hmm}mm) · ⌀: ${dmm}mm`
        });
      }
    };

    const onUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      dragRef.current.timer = setTimeout(() => {
        setMeasure(null);
      }, 1100);
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <Crosshair
        color={accentHex}
        thickness={1}
        opacity={0.38}
        lineStyle="dashed"
        gap={14}
        fade={0.15}
        smoothing={0.22}
        showCoordinates={true}
        targetEffect="lock"
        targetSelector="a, button, [data-crosshair-target]"
        clickPulse={true}
        hideCursor={false}
      />
      {measure && (
        <div
          className="cursor-measure-box is-active"
          style={{
            left: `${measure.left}px`,
            top: `${measure.top}px`,
            width: `${measure.width}px`,
            height: `${measure.height}px`
          }}
          aria-hidden="true"
        >
          <div className="measure-badge">{measure.label}</div>
        </div>
      )}
    </>
  );
}
