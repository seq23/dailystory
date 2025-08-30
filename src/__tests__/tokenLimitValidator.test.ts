import { describe, it, expect } from 'vitest';
import {
  estimateTokenCount,
  validateTokenLimit,
  validatePageTokenDistribution,
  getTokenLimitForDifficulty,
  getRecommendedWordsForDifficulty
} from '@/utils/tokenLimitValidator';

describe('Token Limit Validator', () => {
  describe('estimateTokenCount', () => {
    it('estimates tokens for simple text', () => {
      const text = "The cat sat on the mat.";
      const tokens = estimateTokenCount(text);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(20); // Should be reasonable estimate
    });

    it('handles empty text', () => {
      const tokens = estimateTokenCount("");
      expect(tokens).toBe(0);
    });

    it('accounts for punctuation', () => {
      const simpleText = "Hello world";
      const punctuatedText = "Hello, world! How are you?";
      
      const simpleTokens = estimateTokenCount(simpleText);
      const punctuatedTokens = estimateTokenCount(punctuatedText);
      
      expect(punctuatedTokens).toBeGreaterThan(simpleTokens);
    });
  });

  describe('validateTokenLimit', () => {
    it('validates text within beginner limits', () => {
      const text = "The cat runs. It is fast.";
      const result = validateTokenLimit(text, 'beginner');
      
      expect(result.isValid).toBe(true);
      expect(result.actualTokens).toBeLessThanOrEqual(48);
      expect(result.maxAllowed).toBe(48);
    });

    it('detects text exceeding limits', () => {
      const longText = "Lorem ipsum ".repeat(100); // Very long text
      const result = validateTokenLimit(longText, 'beginner');
      
      expect(result.isValid).toBe(false);
      expect(result.exceededBy).toBeGreaterThan(0);
      expect(result.warnings).toContain(expect.stringContaining('exceeds token limit'));
    });

    it('warns when approaching limit', () => {
      // Create text that's around 90% of beginner limit (48 tokens)
      const nearLimitText = "The quick brown fox jumps over the lazy dog. ".repeat(3);
      const result = validateTokenLimit(nearLimitText, 'beginner');
      
      // Should be valid but with warning
      if (result.actualTokens >= 48 * 0.9 && result.actualTokens <= 48) {
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(expect.stringContaining('approaching token limit'));
      }
    });

    it('handles expert grade levels', () => {
      const text = "This is a moderately complex sentence with sophisticated vocabulary.";
      const result = validateTokenLimit(text, '6th');
      
      expect(result.isValid).toBe(true);
      expect(result.maxAllowed).toBe(900);
    });

    it('handles unknown difficulty levels', () => {
      const text = "Some text";
      const result = validateTokenLimit(text, 'unknown' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Unknown difficulty level: unknown');
    });
  });

  describe('validatePageTokenDistribution', () => {
    it('validates page distribution for beginner stories', () => {
      const pages = [
        "The cat sits.",
        "It sees a bird.",
        "The cat runs fast.",
        "The bird flies away.",
        "The cat is sad."
      ];
      
      const result = validatePageTokenDistribution(pages, 'beginner');
      
      expect(result.isValid).toBe(true);
      expect(result.actualTokens).toBeLessThanOrEqual(48);
    });

    it('detects pages that are too long', () => {
      const pages = [
        "This is a very long page with many words that exceeds the recommended token count for a single page in a beginner level story and should trigger a warning about page length distribution.",
        "Short page.",
        "Another short page."
      ];
      
      const result = validatePageTokenDistribution(pages, 'beginner');
      
      expect(result.warnings.some(w => w.includes('Page 1 exceeds recommended tokens'))).toBe(true);
    });
  });

  describe('getTokenLimitForDifficulty', () => {
    it('returns correct hardcoded limits for all difficulty levels', () => {
      expect(getTokenLimitForDifficulty('beginner')).toBe(48);
      expect(getTokenLimitForDifficulty('easy')).toBe(72);
      expect(getTokenLimitForDifficulty('medium')).toBe(800);
      expect(getTokenLimitForDifficulty('hard')).toBe(1200);
      expect(getTokenLimitForDifficulty('expert')).toBe(1600);
    });

    it('returns correct hardcoded limits for expert grade levels', () => {
      expect(getTokenLimitForDifficulty('6th')).toBe(900);
      expect(getTokenLimitForDifficulty('7th')).toBe(1100);
      expect(getTokenLimitForDifficulty('8th')).toBe(1200);
      expect(getTokenLimitForDifficulty('9th')).toBe(1400);
      expect(getTokenLimitForDifficulty('10th')).toBe(1600);
    });

    it('returns fallback for unknown difficulty', () => {
      expect(getTokenLimitForDifficulty('unknown' as any)).toBe(48);
    });
  });

  describe('getRecommendedWordsForDifficulty', () => {
    it('calculates reasonable word counts', () => {
      const beginnerWords = getRecommendedWordsForDifficulty('beginner');
      const expertWords = getRecommendedWordsForDifficulty('expert');
      
      expect(beginnerWords).toBeLessThan(expertWords);
      expect(beginnerWords).toBeGreaterThan(30); // Should be reasonable
      expect(expertWords).toBeGreaterThan(1000); // Should be higher
    });
  });

  describe('token limit consistency', () => {
    it('has consistent hardcoded token limits across difficulty levels', () => {
      const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
      
      for (let i = 1; i < difficulties.length; i++) {
        const current = getTokenLimitForDifficulty(difficulties[i]);
        const previous = getTokenLimitForDifficulty(difficulties[i - 1]);
        
        expect(current).toBeGreaterThan(previous);
      }
    });

    it('has consistent hardcoded token limits across expert grade levels', () => {
      const grades = ['6th', '7th', '8th', '9th', '10th'] as const;
      
      for (let i = 1; i < grades.length; i++) {
        const current = getTokenLimitForDifficulty(grades[i]);
        const previous = getTokenLimitForDifficulty(grades[i - 1]);
        
        expect(current).toBeGreaterThan(previous);
      }
    });
  });
});