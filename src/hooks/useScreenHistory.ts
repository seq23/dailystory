import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Screens share the router's history entry so native Back/Forward restores every nested screen. */
export function useScreenHistory<T extends string>(scope: string, initial: T): [T, (next: T) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const latest = useRef(location);
  latest.current = location;
  const value = (location.state?.screens?.[scope] ?? initial) as T;
  const set = useCallback((next: T) => {
    // Long-lived event listeners and async work must preserve the current nested screens.
    const current = latest.current;
    if (next === (current.state?.screens?.[scope] ?? initial)) return;
    navigate(current.pathname + current.search + current.hash, {
      state: { ...current.state, screens: { ...current.state?.screens, [scope]: next } },
    });
  }, [navigate, scope, initial]);
  return [value, set];
}
