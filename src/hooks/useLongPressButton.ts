import { useCallback, useRef } from 'react';

interface UseLongPressButtonOptions {
  duration?: number;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

export const useLongPressButton = (
  onClick: (() => void) | undefined,
  options: UseLongPressButtonOptions = {}
) => {
  const { duration = 500, onLongPressStart, onLongPressEnd } = options;
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTriggeredRef = useRef(false);
  // When the last touch ended: the mouse-style click a browser may send right after a tap
  // is not counted twice.
  const lastTouchEndRef = useRef(0);
  // A finger that slides (scrolling the page) is not a tap.
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onClick) return;
    
    e.preventDefault(); // Prevent iOS long-press callout
    e.stopPropagation();
    startTimeRef.current = Date.now();
    hasTriggeredRef.current = false;
    movedRef.current = false;
    const p0 = e.touches?.[0];
    startPointRef.current = p0 ? { x: p0.clientX, y: p0.clientY } : null;
    
    onLongPressStart?.();
    
    timerRef.current = window.setTimeout(() => {
      hasTriggeredRef.current = true;
      onClick();
      onLongPressEnd?.();
      timerRef.current = null;
    }, duration);
  }, [onClick, duration, onLongPressStart, onLongPressEnd]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Every tap counts (27 Oct 2026, final live tests: a normal ~120 ms tap on "Check my answer"
    // and the reading screen's Save/Finish did nothing; taps under 200 ms were thrown away as
    // "accidental", and kids tap fast). A long press has already fired from the timer.
    // Guard: src/test/guards/tap-buttons.test.ts.
    if (!hasTriggeredRef.current && !movedRef.current) {
      e.preventDefault();
      onClick?.();
    }
    lastTouchEndRef.current = Date.now();
    hasTriggeredRef.current = false;
  }, [onClick]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const p0 = e.touches?.[0];
    const s0 = startPointRef.current;
    if (!p0 || !s0 || movedRef.current) return;
    if (Math.abs(p0.clientX - s0.x) > 10 || Math.abs(p0.clientY - s0.y) > 10) {
      movedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    hasTriggeredRef.current = false;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    // A mouse, trackpad or keyboard on a touch device (an iPad with a keyboard, a touch laptop)
    // still clicks; a click straight after a tap is the same press and is skipped.
    onClick: onClick
      ? () => {
          if (Date.now() - lastTouchEndRef.current < 800) return;
          onClick();
        }
      : undefined,
  };
};
