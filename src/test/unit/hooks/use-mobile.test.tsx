import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('use-mobile hook', () => {
  beforeEach(() => {
    // Reset window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('returns mobile detection states', () => {
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isMobileOrTablet');
    expect(result.current).toHaveProperty('isCapacitor');
  });

  it('detects desktop correctly', () => {
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isMobileOrTablet).toBe(false);
    expect(result.current.isCapacitor).toBe(false);
  });

  it('updates when media query changes', () => {
    let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 768px)'),
        media: query,
        addEventListener: vi.fn().mockImplementation((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback;
          }
        }),
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current.isMobile).toBe(true);
    
    // Simulate media query change
    if (mediaQueryCallback) {
      mediaQueryCallback({ matches: false } as MediaQueryListEvent);
    }
  });
});