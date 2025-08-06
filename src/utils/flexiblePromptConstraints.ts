// Flexible Prompt Constraints - Replace rigid requirements with tolerance-based ones
// Reduces constraint-related generation failures by making prompts more realistic

import type { DifficultyLevel } from '@/types';
import { STORY_PROMPTS, type StoryPromptConfig } from '@/config/storyPrompts';

export interface FlexibleConstraints {
  wordRange: { min: number; max: number };
  pageRange: { min: number; max: number };
  sentenceGuidance: string;
  vocabularyGuidance: string;
  flexibilityNote: string;
}

export class FlexiblePromptConstraints {
  
  /**
   * Generate flexible constraints that replace rigid "exactly X" requirements
   */
  static getFlexibleConstraints(difficulty: DifficultyLevel): FlexibleConstraints {
    const baseConfig = STORY_PROMPTS[difficulty];
    
    const constraints = {
      beginner: {
        wordRange: { min: 25, max: 35 },        // ±5 words from 30
        pageRange: { min: 4, max: 6 },          // ±1 page from 5
        sentenceGuidance: "1 simple sentence per page (3-7 words each)",
        vocabularyGuidance: "Use ONLY Dolch Pre-Primer sight words + user's name/interests",
        flexibilityNote: "Focus on simple, joyful sentences. Natural flow is more important than exact word counts."
      },
      easy: {
        wordRange: { min: 50, max: 120 },       // Wider range for natural flow
        pageRange: { min: 5, max: 7 },          // ±1 page from 6
        sentenceGuidance: "1-2 simple sentences per page (8-20 words each)",
        vocabularyGuidance: "Use Dolch vocabulary through 1st grade + user's interests",
        flexibilityNote: "Prioritize engaging storytelling over exact word counts."
      },
      medium: {
        wordRange: { min: 120, max: 360 },      // 20% tolerance around 240 words
        pageRange: { min: 6, max: 8 },          // ±1 page from 7
        sentenceGuidance: "2-3 sentences per page (15-50 words each)",
        vocabularyGuidance: "Use Dolch vocabulary through 2nd grade + descriptive language",
        flexibilityNote: "Allow natural story development. Quality over rigid structure."
      },
      hard: {
        wordRange: { min: 320, max: 720 },      // 20% tolerance around 500 words
        pageRange: { min: 9, max: 13 },         // ±2 pages from 11
        sentenceGuidance: "3-5 sentences per page with varied structure",
        vocabularyGuidance: "Rich vocabulary appropriate for ages 9-11",
        flexibilityNote: "Focus on meaningful content and character development."
      },
      expert: {
        wordRange: { min: 560, max: 960 },      // 20% tolerance around 700 words
        pageRange: { min: 11, max: 15 },        // ±2 pages from 13
        sentenceGuidance: "4-6 sophisticated sentences per page",
        vocabularyGuidance: "Advanced vocabulary with complex themes",
        flexibilityNote: "Prioritize sophisticated storytelling and thematic depth."
      }
    };

    return constraints[difficulty];
  }

  /**
   * Create a flexible system prompt that replaces rigid constraints
   */
  static createFlexibleSystemPrompt(difficulty: DifficultyLevel): string {
    const constraints = this.getFlexibleConstraints(difficulty);
    const baseConfig = STORY_PROMPTS[difficulty];
    
    // Extract the educational parts of the original prompt
    let educationalGuidance = "";
    if (difficulty === 'beginner') {
      educationalGuidance = `
EDUCATIONAL FOCUS:
- Use ONLY Dolch Pre-Primer sight words (40 words) + user's name and interests
- Words: a, and, away, big, blue, can, come, down, find, for, funny, go, help, here, i, in, is, it, jump, little, look, make, me, my, not, one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you
- ALWAYS allow user's name, favorite color, animal, food, and hobby
- Every sentence should be joyful and positive`;
    } else if (difficulty === 'easy') {
      educationalGuidance = `
EDUCATIONAL FOCUS:
- Use Dolch vocabulary through 1st grade (133 words total)
- Include user's name and all their interests naturally
- Focus on friendship, family, and gentle adventures`;
    } else {
      educationalGuidance = `
EDUCATIONAL FOCUS:
- Use age-appropriate vocabulary for ${difficulty} level readers
- Include meaningful themes and character development
- Maintain engaging storytelling throughout`;
    }

    return `You are a ${difficulty} level children's story writer.

FLEXIBLE STORY REQUIREMENTS:
- Total words: ${constraints.wordRange.min}-${constraints.wordRange.max} words (aim for quality over exact count)
- Pages: ${constraints.pageRange.min}-${constraints.pageRange.max} pages (let story flow naturally)
- Structure: ${constraints.sentenceGuidance}
- Vocabulary: ${constraints.vocabularyGuidance}

${educationalGuidance}

IMPORTANT FLEXIBILITY NOTES:
${constraints.flexibilityNote}

Natural storytelling is more important than hitting exact numbers. Focus on:
1. Engaging, age-appropriate content
2. Clear story progression (beginning, middle, end)
3. Positive, uplifting themes
4. Educational value while being entertaining

FORMAT: Write each page clearly separated. Use natural paragraph breaks.`;
  }

  /**
   * Create a flexible user prompt that incorporates user info naturally
   */
  static createFlexibleUserPrompt(
    difficulty: DifficultyLevel, 
    userInfo: { name: string; age: number; favoriteAnimal?: string; favoriteColor?: string; hobbies?: string; favoriteFood?: string }
  ): string {
    const constraints = this.getFlexibleConstraints(difficulty);
    
    // Handle missing user information gracefully
    const animal = userInfo.favoriteAnimal || "friendly animals";
    const color = userInfo.favoriteColor || "bright colors";
    const hobby = userInfo.hobbies || "playing and exploring";
    const food = userInfo.favoriteFood || "delicious treats";
    
    let complexityGuidance = "";
    if (difficulty === 'beginner') {
      complexityGuidance = "Keep it very simple and joyful.";
    } else if (difficulty === 'easy') {
      complexityGuidance = "Include gentle adventures and positive discoveries.";
    } else if (difficulty === 'medium') {
      complexityGuidance = "Include mild challenges that lead to growth and friendship.";
    } else if (difficulty === 'hard') {
      complexityGuidance = "Explore meaningful challenges and personal development.";
    } else {
      complexityGuidance = "Delve into sophisticated themes and complex character relationships.";
    }

    return `Create an engaging story for ${userInfo.name}, who is ${userInfo.age} years old.

STORY ELEMENTS TO INCLUDE:
- ${userInfo.name} loves ${animal} and the color ${color}
- Their favorite activity is ${hobby}
- They enjoy ${food}
- Age-appropriate adventure for ${userInfo.age}-year-old

STORY GUIDANCE:
${complexityGuidance}
Aim for ${constraints.wordRange.min}-${constraints.wordRange.max} words across ${constraints.pageRange.min}-${constraints.pageRange.max} pages.
Let the story develop naturally - engaging content is more important than exact word counts.

Make it personal, positive, and perfectly suited for ${userInfo.name}!`;
  }

  /**
   * Check if constraints need adjustment based on user info
   */
  static adjustConstraintsForUser(
    difficulty: DifficultyLevel,
    userInfo: { name: string; favoriteAnimal?: string; favoriteColor?: string; hobbies?: string; favoriteFood?: string }
  ): FlexibleConstraints {
    const baseConstraints = this.getFlexibleConstraints(difficulty);
    
    // For Level 0, add extra vocabulary guidance if user has complex names/interests
    if (difficulty === 'beginner') {
      const userName = userInfo.name || "";
      const hasComplexName = userName.length > 8 || userName.includes(" ");
      
      if (hasComplexName) {
        baseConstraints.vocabularyGuidance += `. USER'S NAME "${userName}" is always allowed even if complex.`;
      }
    }
    
    return baseConstraints;
  }
}