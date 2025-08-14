import { describe, it, expect } from 'vitest';
import { EnhancedFallbackManager } from '@/constants/enhancedFallbackTemplates';
import { validateLevel2Sentence } from '@/constants/gradeBased/level2Vocabulary';
import { computeCoverage } from '@/utils/vocabCoverage';
import { estimateTokenCount } from '@/utils/tokenLimitValidator';
import type { UserInfo } from '@/types';

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  name: "Emma Johnson",
  age: 8,
  grade: "3rd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
  favoriteColor: "purple",
  favoriteAnimal: "butterfly",
  hobbies: "painting",
  favoriteFood: "cookies",
  specialRequest: "theme: adventure and creativity",
  ...overrides,
});

describe('Fallback Quality Tests', () => {
  describe('Level 0 (Beginner) Fallbacks', () => {
    it('generates one sentence per page for Level 0', () => {
      const user = makeUser({ age: 4 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'beginner', user, 0
      );
      
      // Should be a single sentence (no periods in middle, one at end)
      const sentences = fallback.split('.').filter(s => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(1);
    });

    it('uses simple vocabulary for Level 0', () => {
      const user = makeUser({ age: 4 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'beginner', user, 0
      );
      
      // Check token count is reasonable for Level 0
      const tokens = estimateTokenCount(fallback);
      expect(tokens).toBeLessThanOrEqual(50); // Very short for Level 0
      
      // Should contain simple words
      const words = fallback.toLowerCase().split(/\s+/);
      const longWords = words.filter(word => word.length > 6);
      expect(longWords.length).toBeLessThanOrEqual(1); // Mostly short words
    });

    it('integrates user information naturally', () => {
      const user = makeUser({ name: "Alex", favoriteAnimal: "cat" });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'beginner', user, 0
      );
      
      // Should contain user's name or animal
      expect(fallback.toLowerCase()).toMatch(/alex|cat/);
    });
  });

  describe('Level 1 (Easy) Fallbacks', () => {
    it('maintains appropriate complexity for early readers', () => {
      const user = makeUser({ age: 6 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 0
      );
      
      const tokens = estimateTokenCount(fallback);
      expect(tokens).toBeLessThanOrEqual(80); // Reasonable for Level 1
      
      // Should have 2-3 sentences maximum
      const sentences = fallback.split('.').filter(s => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(3);
    });

    it('uses vocabulary appropriate for early readers', () => {
      const user = makeUser({ age: 6 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 0
      );
      
      // Check vocabulary coverage (should be high for Level 1)
      const coverage = computeCoverage(fallback, 1, { userName: user.name });
      expect(coverage.coverage).toBeGreaterThan(0.8); // 80% vocabulary coverage
    });
  });

  describe('Level 2 (Medium) Fallbacks', () => {
    it('provides appropriate complexity for intermediate readers', () => {
      const user = makeUser({ age: 8 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'medium', user, 0
      );
      
      const tokens = estimateTokenCount(fallback);
      expect(tokens).toBeLessThanOrEqual(120); // Moderate length
      
      // Can have more sentences and complexity
      const sentences = fallback.split(/[.!?]/).filter(s => s.trim().length > 0);
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(5);
    });

    it('validates Level 2 vocabulary when applicable', () => {
      const user = makeUser({ age: 8 });
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'medium', user, 0
      );
      
      // Level 2 sentences should validate reasonably well
      const validation = validateLevel2Sentence(fallback);
      // Allow some flexibility but most words should be valid
      expect(validation.invalidWords.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Fallback Template Processing', () => {
    it('properly processes user placeholders', () => {
      const user = makeUser({ 
        name: "Sofia", 
        favoriteColor: "rainbow",
        favoriteAnimal: "unicorn",
        favoriteFood: "ice cream"
      });
      
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'medium', user, 0
      );
      
      // Should not contain unprocessed placeholders
      expect(fallback).not.toMatch(/\{[^}]+\}/);
      
      // Should contain some user information
      const lowerFallback = fallback.toLowerCase();
      const hasUserInfo = lowerFallback.includes('sofia') || 
                          lowerFallback.includes('rainbow') || 
                          lowerFallback.includes('unicorn') ||
                          lowerFallback.includes('ice cream');
      expect(hasUserInfo).toBe(true);
    });

    it('handles missing user information gracefully', () => {
      const user = makeUser({ 
        favoriteColor: undefined,
        favoriteAnimal: undefined,
        favoriteFood: undefined,
        hobbies: undefined
      });
      
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 0
      );
      
      // Should still generate valid content
      expect(fallback.length).toBeGreaterThan(10);
      expect(fallback).not.toMatch(/\{[^}]+\}/);
      expect(fallback).not.toMatch(/undefined/);
    });
  });

  describe('Story Continuation Quality', () => {
    it('provides natural story progression across pages', () => {
      const user = makeUser({ age: 7 });
      
      const page1 = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 0
      );
      const page2 = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 1
      );
      const page3 = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 2
      );
      
      // Pages should be different
      expect(page1).not.toBe(page2);
      expect(page2).not.toBe(page3);
      
      // All pages should have content
      expect(page1.length).toBeGreaterThan(10);
      expect(page2.length).toBeGreaterThan(10);
      expect(page3.length).toBeGreaterThan(10);
    });

    it('maintains theme consistency across difficulty levels', () => {
      const user = makeUser({ specialRequest: "theme: friendship" });
      
      const beginnerPage = EnhancedFallbackManager.getFallbackTemplate(
        'beginner', user, 0
      );
      const easyPage = EnhancedFallbackManager.getFallbackTemplate(
        'easy', user, 0
      );
      
      // Both should process the theme appropriately for their level
      expect(beginnerPage.length).toBeLessThan(easyPage.length);
      expect(beginnerPage).not.toMatch(/\{[^}]+\}/);
      expect(easyPage).not.toMatch(/\{[^}]+\}/);
    });
  });

  describe('Emergency Fallback Reliability', () => {
    it('never returns empty content', () => {
      const user = makeUser();
      
      // Test all difficulty levels
      const difficulties: Array<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'> = 
        ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const fallback = EnhancedFallbackManager.getFallbackTemplate(
          difficulty, user, 0
        );
        
        expect(fallback.length).toBeGreaterThan(0);
        expect(fallback.trim()).toBeTruthy();
      }
    });

    it('handles extreme edge cases', () => {
      // User with minimal information
      const minimalUser: UserInfo = {
        name: "",
        age: undefined,
        grade: undefined,
        nativeLanguage: "en",
        learningGoal: "improve-english-reading",
        avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
        favoriteColor: undefined,
        favoriteAnimal: undefined,
        hobbies: undefined,
        favoriteFood: undefined,
        specialRequest: undefined
      };
      
      const fallback = EnhancedFallbackManager.getFallbackTemplate(
        'beginner', minimalUser, 0
      );
      
      expect(fallback.length).toBeGreaterThan(0);
      expect(fallback).not.toMatch(/\{[^}]+\}/);
      expect(fallback).not.toMatch(/undefined/);
    });
  });
});