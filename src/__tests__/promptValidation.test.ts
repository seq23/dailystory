import { describe, it, expect } from 'vitest';
import { 
  formatUserPrompt, 
  getStoryPrompt, 
  getExpertStoryPrompt,
  STORY_PROMPTS,
  EXPERT_STORY_PROMPTS 
} from '@/config/storyPrompts';
import { extractThemeIntentWithValidation } from '@/utils/themeIntent';
import { validateTokenLimit } from '@/utils/tokenLimitValidator';
import { computeCoverage } from '@/utils/vocabCoverage';
import type { UserInfo, DifficultyLevel } from '@/types';

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  name: "Jamie Parker",
  age: 8,
  grade: "3rd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
  favoriteColor: "green",
  favoriteAnimal: "elephant",
  hobbies: "building blocks",
  favoriteFood: "apples",
  specialRequest: "theme: adventure and discovery",
  ...overrides,
});

describe('Prompt Validation Tests', () => {
  describe('Placeholder Resolution in Prompts', () => {
    it('resolves all placeholders in beginner prompts', () => {
      const user = makeUser();
      const prompt = getStoryPrompt('beginner');
      const formattedPrompt = formatUserPrompt(prompt.userPromptTemplate, user);
      
      // Should not contain unresolved placeholders
      expect(formattedPrompt).not.toMatch(/\{[^}]+\}/);
      
      // Should contain user information
      expect(formattedPrompt).toContain('Jamie Parker');
      expect(formattedPrompt).toContain('green');
      expect(formattedPrompt).toContain('elephant');
    });

    it('resolves placeholders across all difficulty levels', () => {
      const user = makeUser();
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const prompt = getStoryPrompt(difficulty);
        const formattedPrompt = formatUserPrompt(prompt.userPromptTemplate, user);
        
        expect(formattedPrompt).not.toMatch(/\{[^}]+\}/);
        expect(formattedPrompt).toContain('Jamie Parker');
      }
    });

    it('resolves placeholders in expert grade level prompts', () => {
      const user = makeUser({ age: 12 });
      const grades = ['6th', '7th', '8th', '9th', '10th'] as const;
      
      for (const grade of grades) {
        const prompt = getExpertStoryPrompt(grade);
        const formattedPrompt = formatUserPrompt(prompt.userPromptTemplate, user);
        
        expect(formattedPrompt).not.toMatch(/\{[^}]+\}/);
        expect(formattedPrompt).toContain('Jamie Parker');
      }
    });

    it('handles missing user information gracefully', () => {
      const incompleteUser = makeUser({
        favoriteColor: undefined,
        favoriteAnimal: undefined,
        hobbies: undefined,
        favoriteFood: undefined
      });
      
      const prompt = getStoryPrompt('medium');
      const formattedPrompt = formatUserPrompt(prompt.userPromptTemplate, incompleteUser);
      
      expect(formattedPrompt).not.toMatch(/\{[^}]+\}/);
      expect(formattedPrompt).not.toContain('undefined');
    });
  });

  describe('Age-Appropriate Theme Validation in Prompts', () => {
    it('validates themes are appropriate for young users', () => {
      const youngUser = makeUser({ 
        age: 4, 
        specialRequest: "theme: violence and danger" 
      });
      
      const themeValidation = extractThemeIntentWithValidation(youngUser);
      
      expect(themeValidation.validation.isValid).toBe(false);
      expect(themeValidation.validation.rejectedThemes).toContain('violence');
      expect(themeValidation.themes).not.toContain('violence');
    });

    it('allows age-appropriate themes for different age groups', () => {
      const intermediateUser = makeUser({ 
        age: 9, 
        specialRequest: "theme: mystery and adventure" 
      });
      
      const themeValidation = extractThemeIntentWithValidation(intermediateUser);
      
      expect(themeValidation.validation.isValid).toBe(true);
      expect(themeValidation.themes).toEqual(expect.arrayContaining(['mystery', 'adventure']));
    });

    it('filters themes in complex special requests', () => {
      const youngUser = makeUser({ 
        age: 5, 
        specialRequest: "theme: friendship, violence, adventure, death; tone: playful" 
      });
      
      const themeValidation = extractThemeIntentWithValidation(youngUser);
      
      expect(themeValidation.validation.rejectedThemes).toEqual(expect.arrayContaining(['violence', 'death']));
      expect(themeValidation.themes).toEqual(expect.arrayContaining(['friendship', 'adventure']));
      expect(themeValidation.tone).toContain('playful');
    });
  });

  describe('Token Limit Compliance', () => {
    it('prompts include token limit guidance', () => {
      // Check that all prompts mention token limits
      expect(STORY_PROMPTS.beginner.systemPrompt).toContain('200 tokens');
      expect(STORY_PROMPTS.easy.systemPrompt).toContain('300 tokens');
      expect(STORY_PROMPTS.medium.systemPrompt).toContain('400 tokens');
      expect(STORY_PROMPTS.hard.systemPrompt).toContain('600 tokens');
      expect(STORY_PROMPTS.expert.systemPrompt).toContain('800 tokens');
    });

    it('expert prompts have appropriate word count targets', () => {
      expect(EXPERT_STORY_PROMPTS['6th'].wordCount).toBe('800-900 words');
      expect(EXPERT_STORY_PROMPTS['7th'].wordCount).toBe('900-1100 words');
      expect(EXPERT_STORY_PROMPTS['8th'].wordCount).toBe('1000-1200 words');
      expect(EXPERT_STORY_PROMPTS['9th'].wordCount).toBe('1100-1300 words');
      expect(EXPERT_STORY_PROMPTS['10th'].wordCount).toBe('1200-1400 words');
    });

    it('validates token limits are realistic for content generation', () => {
      // Simulate typical generated content lengths
      const testContents = {
        beginner: "The cat runs fast. It sees a bird.",
        easy: "The little cat runs very fast down the hill. It sees a beautiful blue bird in the tall tree.",
        medium: "The adventurous little cat decided to run as fast as possible down the steep hill. Along the way, it spotted a magnificent blue bird perched high in the ancient oak tree."
      };
      
      expect(validateTokenLimit(testContents.beginner, 'beginner').isValid).toBe(true);
      expect(validateTokenLimit(testContents.easy, 'easy').isValid).toBe(true);
      expect(validateTokenLimit(testContents.medium, 'medium').isValid).toBe(true);
    });
  });

  describe('Vocabulary Level Compliance', () => {
    it('prompts specify appropriate vocabulary levels', () => {
      expect(STORY_PROMPTS.beginner.systemPrompt).toContain('Level 0 vocabulary');
      expect(STORY_PROMPTS.easy.systemPrompt).toContain('Level 1 vocabulary');
      expect(STORY_PROMPTS.medium.systemPrompt).toContain('Level 2 vocabulary');
      expect(STORY_PROMPTS.hard.systemPrompt).toContain('Level 3 vocabulary');
    });

    it('prompts include vocabulary guidance for sentence structure', () => {
      expect(STORY_PROMPTS.beginner.systemPrompt).toContain('6 words per page');
      expect(STORY_PROMPTS.easy.systemPrompt).toContain('2-3 sentences per page');
      expect(STORY_PROMPTS.medium.systemPrompt).toContain('natural flow');
    });
  });

  describe('Author Voice Integration', () => {
    it('includes author voice guidance in all prompts', () => {
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const prompt = STORY_PROMPTS[difficulty];
        expect(prompt.systemPrompt).toContain('getColorVoiceForUser');
        expect(prompt.systemPrompt).toContain('author voice is secondary to {specialRequest}');
      }
    });

    it('prioritizes special requests over author voice', () => {
      const user = makeUser({ 
        favoriteColor: "red", // Might suggest energetic author voice
        specialRequest: "theme: gentle and calm" // Should override energetic
      });
      
      const prompt = getStoryPrompt('medium');
      const formattedPrompt = formatUserPrompt(prompt.userPromptTemplate, user);
      
      expect(formattedPrompt).toContain('gentle and calm');
      // Should still mention color voice but as secondary
      expect(prompt.systemPrompt).toContain('secondary to {specialRequest}');
    });
  });

  describe('Content Safety and Guardrails', () => {
    it('includes age-appropriate content guardrails', () => {
      expect(STORY_PROMPTS.beginner.systemPrompt).toContain('Age-appropriate themes for 3-5 year olds');
      expect(STORY_PROMPTS.easy.systemPrompt).toContain('Age-appropriate themes for 5-7 year olds');
      expect(STORY_PROMPTS.medium.systemPrompt).toContain('Age-appropriate themes for 7-9 year olds');
      expect(STORY_PROMPTS.hard.systemPrompt).toContain('Age-appropriate themes for 9-12 year olds');
      expect(STORY_PROMPTS.expert.systemPrompt).toContain('Age-appropriate themes for 12-15 year olds');
    });

    it('includes specific theme guidance for each age group', () => {
      expect(STORY_PROMPTS.beginner.systemPrompt).toContain('friendship, kindness, family, nature');
      expect(STORY_PROMPTS.easy.systemPrompt).toContain('avoid complex conflict or romance');
      expect(STORY_PROMPTS.medium.systemPrompt).toContain('avoid romance or complex conflict');
      expect(STORY_PROMPTS.hard.systemPrompt).toContain('avoid mature themes');
      expect(STORY_PROMPTS.expert.systemPrompt).toContain('avoid inappropriate content');
    });

    it('maintains G-rated content requirements', () => {
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium'];
      
      for (const difficulty of difficulties) {
        const prompt = STORY_PROMPTS[difficulty];
        expect(prompt.systemPrompt).toContain('G-rated content only');
      }
    });
  });

  describe('Prompt Consistency and Quality', () => {
    it('maintains consistent structure across difficulty levels', () => {
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const prompt = STORY_PROMPTS[difficulty];
        
        expect(prompt.systemPrompt).toContain('CRITICAL RULES:');
        expect(prompt.systemPrompt).toContain('USER INTEGRATION:');
        expect(prompt.systemPrompt).toContain('GUARDRAILS:');
        expect(prompt.userPromptTemplate).toContain('{userName}');
        expect(prompt.userPromptTemplate).toContain('{specialRequest}');
      }
    });

    it('has progressive complexity increases', () => {
      // Beginner should be simpler than expert
      expect(STORY_PROMPTS.beginner.systemPrompt.length).toBeLessThan(STORY_PROMPTS.expert.systemPrompt.length);
      
      // Expert prompts should be more detailed
      expect(STORY_PROMPTS.expert.systemPrompt).toContain('literary sophistication');
      expect(STORY_PROMPTS.expert.systemPrompt).toContain('thematic depth');
    });
  });
});