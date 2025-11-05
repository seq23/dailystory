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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onClick) return;
    
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
    
    // If press was shorter than required duration, prevent default click behavior
    if (pressDuration < duration && !hasTriggeredRef.current) {
      e.preventDefault();
      // Don't trigger onClick for short taps - force long press
    }
    
    hasTriggeredRef.current = false;
  }, [duration]);

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
