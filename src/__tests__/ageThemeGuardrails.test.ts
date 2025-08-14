import { describe, it, expect } from 'vitest';
import { 
  validateThemeForAge, 
  validateThemesForAge, 
  sanitizeThemesForAge,
  getAgeAppropriateAlternatives 
} from '@/utils/ageThemeValidation';
import type { UserInfo } from '@/types';

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  name: "Alex Smith",
  age: 8,
  grade: "3rd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
  favoriteColor: "blue",
  favoriteAnimal: "dog",
  hobbies: "reading",
  favoriteFood: "pizza",
  specialRequest: "",
  ...overrides,
});

describe('Age-Appropriate Theme Guardrails', () => {
  describe('validateThemeForAge', () => {
    it('allows age-appropriate themes for preschoolers', () => {
      const user = makeUser({ age: 4 });
      const result = validateThemeForAge('friendship', user);
      
      expect(result.isValid).toBe(true);
      expect(result.filteredThemes).toContain('friendship');
      expect(result.rejectedThemes).toHaveLength(0);
    });

    it('rejects inappropriate themes for preschoolers', () => {
      const user = makeUser({ age: 4 });
      const result = validateThemeForAge('violence', user);
      
      expect(result.isValid).toBe(false);
      expect(result.rejectedThemes).toContain('violence');
      expect(result.warnings).toContain('Theme "violence" is not appropriate for age 4');
    });

    it('warns about restricted themes for preschoolers', () => {
      const user = makeUser({ age: 4 });
      const result = validateThemeForAge('romance', user);
      
      expect(result.isValid).toBe(true);
      expect(result.filteredThemes).toContain('romance');
      expect(result.warnings).toContain('Theme "romance" should be handled carefully for age 4');
    });
  });

  describe('validateThemesForAge', () => {
    it('filters multiple themes appropriately', () => {
      const user = makeUser({ age: 6 });
      const themes = ['friendship', 'violence', 'adventure', 'death'];
      const result = validateThemesForAge(themes, user);
      
      expect(result.isValid).toBe(false);
      expect(result.filteredThemes).toEqual(expect.arrayContaining(['friendship', 'adventure']));
      expect(result.rejectedThemes).toEqual(expect.arrayContaining(['violence', 'death']));
    });

    it('allows more complex themes for older children', () => {
      const user = makeUser({ age: 11 });
      const themes = ['identity', 'belonging', 'mystery', 'romance'];
      const result = validateThemesForAge(themes, user);
      
      expect(result.isValid).toBe(true);
      expect(result.filteredThemes).toEqual(expect.arrayContaining(themes));
    });

    it('still restricts inappropriate themes for older children', () => {
      const user = makeUser({ age: 11 });
      const themes = ['friendship', 'violence', 'politics'];
      const result = validateThemesForAge(themes, user);
      
      expect(result.isValid).toBe(false);
      expect(result.rejectedThemes).toEqual(expect.arrayContaining(['violence', 'politics']));
    });
  });

  describe('sanitizeThemesForAge', () => {
    it('returns only age-appropriate themes', () => {
      const user = makeUser({ age: 5 });
      const themes = ['friendship', 'violence', 'kindness', 'death'];
      const sanitized = sanitizeThemesForAge(themes, user);
      
      expect(sanitized).toEqual(expect.arrayContaining(['friendship', 'kindness']));
      expect(sanitized).not.toContain('violence');
      expect(sanitized).not.toContain('death');
    });
  });

  describe('getAgeAppropriateAlternatives', () => {
    it('suggests appropriate alternatives for rejected themes', () => {
      const user = makeUser({ age: 6 });
      const rejected = ['violence', 'conflict'];
      const alternatives = getAgeAppropriateAlternatives(rejected, user);
      
      expect(alternatives).toEqual(expect.arrayContaining(['adventure', 'courage', 'teamwork', 'friendship']));
      expect(alternatives.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array when no alternatives available', () => {
      const user = makeUser({ age: 6 });
      const rejected = ['unknown-theme'];
      const alternatives = getAgeAppropriateAlternatives(rejected, user);
      
      expect(alternatives).toHaveLength(0);
    });
  });

  describe('age group transitions', () => {
    it('properly categorizes different age groups', () => {
      const preschooler = makeUser({ age: 4 });
      const earlyReader = makeUser({ age: 6 });
      const intermediate = makeUser({ age: 8 });
      const advanced = makeUser({ age: 11 });
      const youngAdult = makeUser({ age: 14 });

      // Romance should be handled differently across age groups
      expect(validateThemeForAge('romance', preschooler).warnings).toContain('Theme "romance" should be handled carefully for age 4');
      expect(validateThemeForAge('romance', earlyReader).warnings).toContain('Theme "romance" should be handled carefully for age 6');
      expect(validateThemeForAge('romance', intermediate).warnings).toContain('Theme "romance" should be handled carefully for age 8');
      expect(validateThemeForAge('romance', advanced).isValid).toBe(true);
      expect(validateThemeForAge('romance', youngAdult).isValid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles missing age gracefully', () => {
      const user = makeUser({ age: undefined });
      const result = validateThemeForAge('friendship', user);
      
      expect(result.isValid).toBe(true); // Should default to age 8
    });

    it('handles empty theme list', () => {
      const user = makeUser({ age: 8 });
      const result = validateThemesForAge([], user);
      
      expect(result.isValid).toBe(true);
      expect(result.filteredThemes).toHaveLength(0);
      expect(result.rejectedThemes).toHaveLength(0);
    });

    it('warns about unknown themes', () => {
      const user = makeUser({ age: 8 });
      const result = validateThemeForAge('completely-unknown-theme', user);
      
      expect(result.isValid).toBe(true);
      expect(result.filteredThemes).toContain('completely-unknown-theme');
      expect(result.warnings).toContain('Unknown theme "completely-unknown-theme" - please verify age appropriateness for age 8');
    });
  });
});