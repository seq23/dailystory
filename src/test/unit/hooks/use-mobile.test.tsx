import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  it('should return correct mobile detection properties', () => {
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isMobileOrTablet');
    expect(result.current).toHaveProperty('isCapacitor');
  });

  it('should detect desktop by default', () => {
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isMobileOrTablet).toBe(false);
    expect(result.current.isCapacitor).toBe(false);
  });
});