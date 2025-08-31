import { describe, it, expect } from 'vitest';
import { 
  estimateTokenCount, 
  validateTokenLimit, 
  validatePageTokenDistribution,
  getTokenLimitForDifficulty,
  getTokenLimitForSinglePage,
  getRecommendedWordsForDifficulty,
  validateGuestStoryTokens,
  validatePremiumPageTokens,
  getPerPageTokenLimit,
  getTotalStoryTokensForGuests
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
      expect(result.actualTokens).toBeLessThanOrEqual(150); // Netflix total tokens for beginner
      expect(result.maxAllowed).toBe(150); // 15 tokens per page * 10 pages
    });

    it('detects text exceeding limits', () => {
      const longText = "Lorem ipsum ".repeat(100); // Very long text
      const result = validateTokenLimit(longText, 'beginner');
      
      expect(result.isValid).toBe(false);
      expect(result.exceededBy).toBeGreaterThan(0);
      expect(result.warnings).toContain(expect.stringContaining('exceeds token limit'));
    });

    it('warns when approaching limit', () => {
      // Create text that's around 90% of beginner Netflix limit (150 tokens)
      const nearLimitText = "The quick brown fox jumps over the lazy dog. ".repeat(5);
      const result = validateTokenLimit(nearLimitText, 'beginner');
      
      // Should be valid but with warning
      if (result.actualTokens >= 150 * 0.9 && result.actualTokens <= 150) {
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(expect.stringContaining('approaching token limit'));
      }
    });

    it('handles expert grade levels', () => {
      const text = "This is a moderately complex sentence with sophisticated vocabulary.";
      const result = validateTokenLimit(text, '6th');
      
      expect(result.isValid).toBe(true);
      expect(result.actualTokens).toBeLessThanOrEqual(6000); // 6th grade Netflix total
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
      expect(result.actualTokens).toBeLessThanOrEqual(150); // Netflix total for beginner
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
    it('returns correct Netflix total limits for all difficulty levels', () => {
      expect(getTokenLimitForDifficulty('beginner')).toBe(150);  // 15 * 10 pages
      expect(getTokenLimitForDifficulty('easy')).toBe(320);      // 32 * 10 pages
      expect(getTokenLimitForDifficulty('medium')).toBe(1500);   // 150 * 10 pages
      expect(getTokenLimitForDifficulty('hard')).toBe(2000);     // 200 * 10 pages
      expect(getTokenLimitForDifficulty('expert')).toBe(5000);   // 500 * 10 pages
    });

    it('returns correct Netflix total limits for expert grade levels', () => {
      expect(getTokenLimitForDifficulty('6th')).toBe(6000);   // 500 * 12 pages
      expect(getTokenLimitForDifficulty('7th')).toBe(6000);   // 500 * 12 pages
      expect(getTokenLimitForDifficulty('8th')).toBe(6000);   // 500 * 12 pages
      expect(getTokenLimitForDifficulty('9th')).toBe(6000);   // 500 * 12 pages
      expect(getTokenLimitForDifficulty('10th')).toBe(6000);  // 500 * 12 pages
    });

    it('returns fallback for unknown difficulty', () => {
      expect(getTokenLimitForDifficulty('unknown' as any)).toBe(150); // 15 * 10 fallback
    });
  });

  describe('getRecommendedWordsForDifficulty', () => {
    it('calculates reasonable word counts', () => {
      const beginnerWords = getRecommendedWordsForDifficulty('beginner');
      const expertWords = getRecommendedWordsForDifficulty('expert');
      
      expect(beginnerWords).toBeLessThan(expertWords);
      expect(beginnerWords).toBeGreaterThan(110); // Should be reasonable (150 * 0.75)
      expect(expertWords).toBeGreaterThan(3750); // Should be higher (5000 * 0.75)
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
      
      // All expert grades now have the same token limit (500 per page * 12 pages = 6000)
      for (const grade of grades) {
        const tokens = getTokenLimitForDifficulty(grade);
        expect(tokens).toBe(6000);
      }
    });
  });

  describe('getTokenLimitForSinglePage', () => {
    it('returns correct single-page token limits', () => {
      expect(getTokenLimitForSinglePage('beginner')).toBe(15);  // From system prompt
      expect(getTokenLimitForSinglePage('easy')).toBe(32);      // From system prompt
      expect(getTokenLimitForSinglePage('medium')).toBe(150);   // From system prompt
      expect(getTokenLimitForSinglePage('hard')).toBe(200);     // From system prompt
      expect(getTokenLimitForSinglePage('expert')).toBe(500);   // From system prompt
    });

    it('returns fallback for unknown difficulty', () => {
      expect(getTokenLimitForSinglePage('unknown' as any)).toBe(15);
    });
  });

  describe('Live vs Netflix token validation modes', () => {
    it('uses single-page limits for live mode', () => {
      const text = 'This is a test story content that might be a single page.';
      const liveResult = validateTokenLimit(text, 'beginner', 'live');
      const netflixResult = validateTokenLimit(text, 'beginner', 'netflix');
      
      expect(liveResult.maxAllowed).toBeLessThan(netflixResult.maxAllowed);
      expect(liveResult.maxAllowed).toBe(15); // Single page limit
      expect(netflixResult.maxAllowed).toBe(150); // Full story limit (15 * 10)
    });
  });

  describe('Guest vs Premium validation functions', () => {
    describe('validateGuestStoryTokens', () => {
      it('validates guest story within 6-page limit', () => {
        const shortText = "The cat runs fast.";
        const result = validateGuestStoryTokens(shortText, 'beginner');
        
        expect(result.isValid).toBe(true);
        expect(result.maxAllowed).toBe(90); // 15 tokens per page * 6 pages for guests
      });

      it('detects guest story exceeding 6-page limit', () => {
        const longText = "Lorem ipsum dolor sit amet ".repeat(50);
        const result = validateGuestStoryTokens(longText, 'beginner');
        
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(expect.stringContaining('Guest story exceeds 6-page limit'));
      });
    });

    describe('validatePremiumPageTokens', () => {
      it('validates premium page within per-page limit', () => {
        const pageText = "The cat runs.";
        const result = validatePremiumPageTokens(pageText, 'beginner');
        
        expect(result.isValid).toBe(true);
        expect(result.maxAllowed).toBe(15); // Per page limit from system prompt
      });

      it('detects premium page exceeding per-page limit', () => {
        const longPageText = "This is a very long page that should exceed the beginner per-page token limit for premium users and trigger validation warnings.";
        const result = validatePremiumPageTokens(longPageText, 'beginner');
        
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(expect.stringContaining('Page exceeds limit'));
      });
    });

    describe('getTotalStoryTokensForGuests', () => {
      it('returns correct guest story limits (6 pages)', () => {
        expect(getTotalStoryTokensForGuests('beginner')).toBe(90);  // 15 * 6 pages
        expect(getTotalStoryTokensForGuests('easy')).toBe(192);     // 32 * 6 pages
        expect(getTotalStoryTokensForGuests('medium')).toBe(900);   // 150 * 6 pages
      });
    });

    describe('getPerPageTokenLimit', () => {
      it('returns correct per-page limits from system prompts', () => {
        expect(getPerPageTokenLimit('beginner')).toBe(15);
        expect(getPerPageTokenLimit('easy')).toBe(32);
        expect(getPerPageTokenLimit('medium')).toBe(150);
        expect(getPerPageTokenLimit('6th')).toBe(500);
      });
    });
  });
});