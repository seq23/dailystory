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
        wordRange: { min: 20, max: 50 },        // More flexible range for natural flow
        pageRange: { min: 3, max: 7 },          // ±2 pages from 5
        sentenceGuidance: "Mix of 2-3 word sentences and 4-5 word sentences. Simple patterns: 'Cat runs', 'I see cat', 'The cat is big'. Avoid compound subjects like 'Sally and dog'.",
        vocabularyGuidance: "Use research-based 100-word vocabulary (Dolch + Fry high-frequency words for ages 3-5)",
        flexibilityNote: "Age-appropriate simple sentences. No complex conjunctions or mature patterns."
      },
      easy: {
        wordRange: { min: 40, max: 150 },       // More flexible for story development
        pageRange: { min: 4, max: 9 },          // ±2 pages from 6
        sentenceGuidance: "Mix of simple and compound sentences. Introduce basic connecting words like 'and', 'but'.",
        vocabularyGuidance: "Dolch Grade 1 vocabulary with some Grade 2 words",
        flexibilityNote: "Allow vocabulary flexibility while maintaining readability for early readers"
      },
      medium: {
        wordRange: { min: 100, max: 400 },      // Broader range for creative freedom
        pageRange: { min: 5, max: 10 },         // ±2 pages from 7
        sentenceGuidance: "Complex sentences with varied structure. Multiple clauses and descriptive language.",
        vocabularyGuidance: "Grade 2-3 vocabulary with some challenging words for growth",
        flexibilityNote: "Balance challenge with accessibility for developing readers"
      },
      hard: {
        wordRange: { min: 300, max: 800 },      // Expanded range for complex narratives
        pageRange: { min: 8, max: 15 },         // ±3 pages from 11
        sentenceGuidance: "Sophisticated sentence structures with varied complexity and literary devices.",
        vocabularyGuidance: "Grade 3-4 vocabulary with advanced terms where appropriate",
        flexibilityNote: "Encourage rich language and complex narratives"
      },
      expert: {
        wordRange: { min: 500, max: 1000 },     // Maximum creative freedom
        pageRange: { min: 10, max: 18 },        // ±4 pages from 13
        sentenceGuidance: "Advanced sentence structures with literary elements and sophisticated prose.",
        vocabularyGuidance: "Grade 4+ vocabulary with sophisticated terminology and concepts",
        flexibilityNote: "Maximum creative freedom with high educational and literary value"
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
- Use research-based 100-word vocabulary (Dolch + Fry high-frequency words) + user's name and interests
- SENTENCE STRUCTURE CRITICAL: Use 2-3 word sentences: "Cat runs", "I see" AND 4-5 word sentences: "The cat is big", "Sally can see cat"
- AVOID compound subjects: NO "Sally and dog go" - use "Sally goes" instead
- ALWAYS allow user's name, favorite color, animal, food, and hobby
- Every sentence should be joyful and age-appropriate for 3-5 year olds`;
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