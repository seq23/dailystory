import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Keep the in-progress reader mounted when another app route is on screen. */
export function RetainedReader({ reader, children }: { reader: React.ReactNode; children: React.ReactNode }) {
  const location = useLocation();
  const opened = useRef(location.pathname === '/');
  if (location.pathname === '/') opened.current = true;
  return <>{opened.current && <div hidden={location.pathname !== '/'}>{reader}</div>}{children}</>;
}
