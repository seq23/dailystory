import { describe, it, expect } from 'vitest';
import { hexToColorName, ensureColorName } from '@/utils/colorConverter';

describe('colorConverter', () => {
  it('maps known hex codes to names (case-insensitive)', () => {
    expect(hexToColorName('#3B82F6')).toBe('blue');
    expect(hexToColorName('#3b82f6')).toBe('blue');
    expect(hexToColorName('#EF4444')).toBe('red');
  });

  it('returns default for unknown hex and passes through names', () => {
    expect(hexToColorName('#abcdef')).toBe('blue');
    expect(hexToColorName('teal')).toBe('teal');
  });

  it('ensureColorName handles undefined and names', () => {
    expect(ensureColorName(undefined)).toBe('blue');
    expect(ensureColorName('purple')).toBe('purple');
    expect(ensureColorName('#EF4444')).toBe('red');
  });
});
