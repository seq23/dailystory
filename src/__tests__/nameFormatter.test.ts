import { describe, it, expect } from 'vitest';
import { NameFormatter } from '../utils/nameFormatter';

describe('NameFormatter', () => {
  describe('capitalize', () => {
    it('should capitalize single words correctly', () => {
      expect(NameFormatter.capitalize('john')).toBe('John');
      expect(NameFormatter.capitalize('MARY')).toBe('Mary');
      expect(NameFormatter.capitalize('sAmAnThA')).toBe('Samantha');
    });

    it('should handle hyphenated names', () => {
      expect(NameFormatter.capitalize('mary-jane')).toBe('Mary-Jane');
      expect(NameFormatter.capitalize('JEAN-LUC')).toBe('Jean-Luc');
      expect(NameFormatter.capitalize('anna-marie-claire')).toBe('Anna-Marie-Claire');
    });

    it('should handle multiple word names', () => {
      expect(NameFormatter.capitalize('mary jane')).toBe('Mary Jane');
      expect(NameFormatter.capitalize('john doe smith')).toBe('John Doe Smith');
      expect(NameFormatter.capitalize('VAN HELSING')).toBe('Van Helsing');
    });

    it('should handle edge cases', () => {
      expect(NameFormatter.capitalize('')).toBe('');
      expect(NameFormatter.capitalize('   ')).toBe('');
      expect(NameFormatter.capitalize('a')).toBe('A');
    });

    it('should handle invalid inputs', () => {
      expect(NameFormatter.capitalize(null as any)).toBe('');
      expect(NameFormatter.capitalize(undefined as any)).toBe('');
      expect(NameFormatter.capitalize(123 as any)).toBe('');
    });
  });

  describe('isProperlyCapitalized', () => {
    it('should validate properly capitalized names', () => {
      expect(NameFormatter.isProperlyCapitalized('John')).toBe(true);
      expect(NameFormatter.isProperlyCapitalized('Mary-Jane')).toBe(true);
      expect(NameFormatter.isProperlyCapitalized('John Doe')).toBe(true);
    });

    it('should reject improperly capitalized names', () => {
      expect(NameFormatter.isProperlyCapitalized('john')).toBe(false);
      expect(NameFormatter.isProperlyCapitalized('MARY')).toBe(false);
      expect(NameFormatter.isProperlyCapitalized('mary-jane')).toBe(false);
      expect(NameFormatter.isProperlyCapitalized('john doe')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(NameFormatter.isProperlyCapitalized('')).toBe(false);
      expect(NameFormatter.isProperlyCapitalized('A')).toBe(true);
    });
  });
});