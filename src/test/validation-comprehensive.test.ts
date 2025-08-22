import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '@/utils/inputSanitizer';

describe('Comprehensive Content Validation Tests', () => {
  describe('Personal Information Detection', () => {
    const personalInfoCases = [
      // Phone numbers
      { input: 'Call me at 555-123-4567', type: 'phone', context: 'general' },
      { input: 'My phone is (555) 123-4567', type: 'phone', context: 'general' },
      { input: 'Text 5551234567 for help', type: 'phone', context: 'general' },
      
      // Email addresses
      { input: 'Email me at john@example.com', type: 'email', context: 'general' },
      { input: 'My email is test.email+tag@domain.co.uk', type: 'email', context: 'general' },
      
      // Addresses
      { input: 'I live at 123 Main Street', type: 'address', context: 'general' },
      { input: 'My address is 456 Oak Ave, Springfield, IL 62701', type: 'address', context: 'general' },
      { input: 'Visit me at 789 Pine Road', type: 'address', context: 'general' },
      
      // Names with context
      { input: 'My real name is John Smith', type: 'name', context: 'name' },
      { input: 'I am Sarah Johnson', type: 'name', context: 'name' },
      
      // School information
      { input: 'I go to Lincoln Elementary School', type: 'school', context: 'general' },
      { input: 'At Roosevelt High School we learn', type: 'school', context: 'general' }
    ];

    personalInfoCases.forEach(({ input, type, context }) => {
      it(`should detect ${type} in: "${input}"`, () => {
        const result = InputSanitizer.validateChildSafeInput(input, context as any);
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => 
          issue.toLowerCase().includes(type) || 
          issue.includes('personal')
        )).toBe(true);
      });
    });
  });

  describe('Inappropriate Content Detection', () => {
    const inappropriateContent = [
      // Profanity (using mild examples for testing)
      'This is stupid content',
      'What the hell is this',
      'That sucks so much',
      
      // Leetspeak variations
      'Th1s 1s st0p1d',
      'Wh4t th3 h3ck',
      
      // Inappropriate themes
      'I hate my teacher',
      'Violence and fighting',
      'Scary violent story'
    ];

    inappropriateContent.forEach(input => {
      it(`should detect inappropriate content: "${input}"`, () => {
        const result = InputSanitizer.validateChildSafeInput(input, 'general');
        expect(result.isValid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Safe Content Validation', () => {
    const safeContent = [
      'Once upon a time in a magical kingdom',
      'The brave knight saved the dragon',
      'Princess Luna loved to read books',
      'The friendly robot helped everyone',
      'Adventure in the enchanted forest',
      'The magical unicorn granted wishes',
      'Space explorers discovered new planets',
      'The kind wizard taught magic spells'
    ];

    safeContent.forEach(input => {
      it(`should allow safe content: "${input}"`, () => {
        const result = InputSanitizer.validateChildSafeInput(input, 'general');
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });
    });
  });

  describe('Context-Specific Validation', () => {
    it('should be more strict for name fields', () => {
      const realName = 'John Smith';
      const nameResult = InputSanitizer.validateChildSafeInput(realName, 'name');
      const storyResult = InputSanitizer.validateChildSafeInput(`The character ${realName} was brave`, 'general');
      
      expect(nameResult.isValid).toBe(false);
      expect(storyResult.isValid).toBe(true); // Should be okay in story context
    });

    it('should handle interest fields appropriately', () => {
      const interests = ['reading', 'sports', 'music', 'art'];
      interests.forEach(interest => {
        const result = InputSanitizer.validateChildSafeInput(interest, 'interest');
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate theme fields for appropriateness', () => {
      const goodThemes = ['adventure', 'friendship', 'magic', 'animals'];
      const badThemes = ['violence', 'scary monsters', 'war'];
      
      goodThemes.forEach(theme => {
        const result = InputSanitizer.validateChildSafeInput(theme, 'theme');
        expect(result.isValid).toBe(true);
      });
      
      badThemes.forEach(theme => {
        const result = InputSanitizer.validateChildSafeInput(theme, 'theme');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Edge Cases and Obfuscation', () => {
    const obfuscatedCases = [
      // Spacing variations
      'c a l l   m e   5 5 5 - 1 2 3 4',
      'e m a i l @ e x a m p l e . c o m',
      
      // Case variations
      'CALL ME AT 555-1234',
      'EMAIL ME AT TEST@EXAMPLE.COM',
      
      // Partial obfuscation
      'call me at five five five one two three four',
      'my number is five-five-five-one-two-three-four',
      
      // Mixed content
      'My story: I live at 123 Main St and my name is John',
      'Adventure story with my real phone 555-1234'
    ];

    obfuscatedCases.forEach(input => {
      it(`should detect obfuscated personal info: "${input}"`, () => {
        const result = InputSanitizer.validateChildSafeInput(input, 'general');
        expect(result.isValid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Length Validation', () => {
    it('should handle very long inputs efficiently', () => {
      const longInput = 'Safe content '.repeat(1000);
      const start = Date.now();
      const result = InputSanitizer.validateChildSafeInput(longInput, 'general');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.isValid).toBe(false); // Should fail due to length
      expect(result.issues.some(issue => issue.includes('length'))).toBe(true);
    });

    it('should enforce appropriate length limits by context', () => {
      const longName = 'A'.repeat(100);
      const longStory = 'Safe story content '.repeat(200);
      
      const nameResult = InputSanitizer.validateChildSafeInput(longName, 'name');
      const storyResult = InputSanitizer.validateChildSafeInput(longStory, 'general');
      
      expect(nameResult.isValid).toBe(false);
      expect(storyResult.isValid).toBe(false); // Assuming it exceeds story length limit
    });
  });

  describe('Sanitization Integration', () => {
    it('should sanitize input while preserving safe content', () => {
      const input = 'A <script>alert("test")</script> safe story about adventure';
      const sanitized = InputSanitizer.sanitizeStoryInput(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('safe story about adventure');
    });

    it('should provide helpful suggestions for violations', () => {
      const input = 'My name is John Smith';
      const result = InputSanitizer.validateChildSafeInput(input, 'name');
      
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions?.length).toBeGreaterThan(0);
    });
  });
});