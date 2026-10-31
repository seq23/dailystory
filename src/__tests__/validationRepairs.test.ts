import { describe, expect, it } from 'vitest';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { validateTheme } from '@/utils/themeValidation';

describe('validation at the submitted input boundary', () => {
  it('rejects oversized raw values before realtime sanitization truncates them', () => {
    const result = InputSanitizer.validateFieldRealtime('name', 'a'.repeat(101), 'name');
    expect(result.sanitized).toHaveLength(100);
    expect(result.validation.isValid).toBe(false);
    expect(result.validation.issues).toEqual(['Input exceeds the maximum length of 50 characters']);
    expect(validateTheme('a'.repeat(51)).valid).toBe(false);
  });
  it('detects the same semantic violation on every call', () => {
    for (let i = 0; i < 3; i++) {
      const result = InputSanitizer.validateChildSafeInput('h0t girl', 'general');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains inappropriate description not suitable for children');
    }
  });
  it('accepts a fictional first name while rejecting a full name', () => {
    expect(InputSanitizer.validateChildSafeInput('Tavi', 'name').isValid).toBe(true);
    expect(InputSanitizer.validateChildSafeInput('Tavi Wizzle', 'name').isValid).toBe(false);
    expect(InputSanitizer.validateChildSafeInput('The character Tavi Wizzle was brave', 'general').isValid).toBe(true);
  });
});
