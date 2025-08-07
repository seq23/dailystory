import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify environment setup', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});