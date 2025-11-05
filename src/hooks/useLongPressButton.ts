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

  const MIN_TAP_DURATION = 200; // Prevent accidental taps

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onClick) return;
    
    e.preventDefault(); // Prevent iOS long-press callout
    e.stopPropagation();
    startTimeRef.current = Date.now();
    hasTriggeredRef.current = false;
    
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
    
    const pressDuration = Date.now() - startTimeRef.current;
    
    // Hybrid interaction: Accept deliberate taps (200-500ms) and long-press (500ms+)
    if (!hasTriggeredRef.current) {
      if (pressDuration < MIN_TAP_DURATION) {
        // Too fast - accidental tap, ignore it
        e.preventDefault();
      } else if (pressDuration >= MIN_TAP_DURATION && pressDuration < duration) {
        // Medium tap (200-500ms) - valid deliberate tap, trigger onClick
        e.preventDefault();
        onClick?.();
      }
      // Long-press (>=500ms) already triggered via timer
    }
    
    hasTriggeredRef.current = false;
  }, [duration, onClick, MIN_TAP_DURATION]);

  const handleTouchCancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    hasTriggeredRef.current = false;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onClick: undefined // Disable standard click on touch devices
  };
};
