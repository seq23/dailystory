import { describe, it, expect } from 'vitest';
import {
  estimateTokenCount,
  validateTokenLimit,
  validatePageTokenDistribution,
  getTokenLimitForDifficulty,
  getRecommendedWordsForDifficulty,
  TOKEN_LIMITS,
  EXPERT_TOKEN_LIMITS
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
      expect(result.actualTokens).toBeLessThanOrEqual(TOKEN_LIMITS.beginner.maxTokens);
      expect(result.maxAllowed).toBe(TOKEN_LIMITS.beginner.maxTokens);
    });

    it('detects text exceeding limits', () => {
      const longText = "Lorem ipsum ".repeat(100); // Very long text
      const result = validateTokenLimit(longText, 'beginner');
      
      expect(result.isValid).toBe(false);
      expect(result.exceededBy).toBeGreaterThan(0);
      expect(result.warnings).toContain(expect.stringContaining('exceeds token limit'));
    });

    it('warns when approaching limit', () => {
      // Create text that's around 90% of beginner limit (180 tokens)
      const nearLimitText = "The quick brown fox jumps over the lazy dog. ".repeat(15);
      const result = validateTokenLimit(nearLimitText, 'beginner');
      
      // Should be valid but with warning
      if (result.actualTokens >= TOKEN_LIMITS.beginner.maxTokens * 0.9 && result.actualTokens <= TOKEN_LIMITS.beginner.maxTokens) {
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(expect.stringContaining('approaching token limit'));
      }
    });

    it('handles expert grade levels', () => {
      const text = "This is a moderately complex sentence with sophisticated vocabulary.";
      const result = validateTokenLimit(text, '6th');
      
      expect(result.isValid).toBe(true);
      expect(result.maxAllowed).toBe(EXPERT_TOKEN_LIMITS['6th'].maxTokens);
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
      expect(result.actualTokens).toBeLessThanOrEqual(TOKEN_LIMITS.beginner.maxTokens);
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
    it('returns correct limits for all difficulty levels', () => {
      expect(getTokenLimitForDifficulty('beginner')).toBe(200);
      expect(getTokenLimitForDifficulty('easy')).toBe(300);
      expect(getTokenLimitForDifficulty('medium')).toBe(400);
      expect(getTokenLimitForDifficulty('hard')).toBe(600);
      expect(getTokenLimitForDifficulty('expert')).toBe(800);
    });

    it('returns correct limits for expert grade levels', () => {
      expect(getTokenLimitForDifficulty('6th')).toBe(1200);
      expect(getTokenLimitForDifficulty('7th')).toBe(1470);
      expect(getTokenLimitForDifficulty('8th')).toBe(1600);
      expect(getTokenLimitForDifficulty('9th')).toBe(1730);
      expect(getTokenLimitForDifficulty('10th')).toBe(1870);
    });

    it('returns fallback for unknown difficulty', () => {
      expect(getTokenLimitForDifficulty('unknown' as any)).toBe(800);
    });
  });

  describe('getRecommendedWordsForDifficulty', () => {
    it('calculates reasonable word counts', () => {
      const beginnerWords = getRecommendedWordsForDifficulty('beginner');
      const expertWords = getRecommendedWordsForDifficulty('expert');
      
      expect(beginnerWords).toBeLessThan(expertWords);
      expect(beginnerWords).toBeGreaterThan(100); // Should be reasonable
      expect(expertWords).toBeGreaterThan(400); // Should be higher
    });
  });

  describe('token limit consistency', () => {
    it('has consistent token limits across difficulty levels', () => {
      const difficulties: (keyof typeof TOKEN_LIMITS)[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (let i = 1; i < difficulties.length; i++) {
        const current = TOKEN_LIMITS[difficulties[i]];
        const previous = TOKEN_LIMITS[difficulties[i - 1]];
        
        expect(current.maxTokens).toBeGreaterThan(previous.maxTokens);
      }
    });

    it('has consistent token limits across expert grade levels', () => {
      const grades: (keyof typeof EXPERT_TOKEN_LIMITS)[] = ['6th', '7th', '8th', '9th', '10th'];
      
      for (let i = 1; i < grades.length; i++) {
        const current = EXPERT_TOKEN_LIMITS[grades[i]];
        const previous = EXPERT_TOKEN_LIMITS[grades[i - 1]];
        
        expect(current.maxTokens).toBeGreaterThan(previous.maxTokens);
      }
    });
  });
});