import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Screens share the router's history entry so native Back/Forward restores every nested screen. */
export function useScreenHistory<T extends string>(scope: string, initial: T): [T, (next: T) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const value = (location.state?.screens?.[scope] ?? initial) as T;
  const set = useCallback((next: T) => {
    if (next === value) return;
    navigate(location.pathname + location.search + location.hash, {
      state: { ...location.state, screens: { ...location.state?.screens, [scope]: next } },
    });
  }, [location, navigate, scope, value]);
  return [value, set];
}
