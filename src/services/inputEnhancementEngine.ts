/**
 * Creative Story Seeds Generator
 * 
 * This module transforms user inputs into story possibilities that serve as creative guidance
 * and inspiration for AI story generation. The provided story possibilities are examples and
 * starting points - AI systems should feel free to create variations, combinations, or 
 * entirely new possibilities that align with the user's interests while maintaining story
 * coherence and age-appropriateness.
 * 
 * Key Philosophy: These are creative springboards, not rigid constraints.
 */

import type { UserInfo } from '../types';

/**
 * Represents a creative story seed based on user input
 * @interface CreativeStorySeed
 * @property {string} input - The original user input
 * @property {'color' | 'animal' | 'hobby' | 'food'} inputType - Type of input
 * @property {string[]} storyPossibilities - Example story elements for AI inspiration
 *   Note: These are guidance examples. AI can create variations or entirely new possibilities.
 */
export interface CreativeStorySeed {
  input: string;
  inputType: 'color' | 'animal' | 'hobby' | 'food';
  storyPossibilities: string[];
}

/**
 * Generates creative story seeds from user information
 * 
 * @param {any} userInfo - User information object (flexible typing for compatibility)
 * @returns {CreativeStorySeed[]} Array of creative seeds for AI story generation
 * 
 * Note: The returned possibilities serve as creative guidance. AI systems should use these
 * as inspiration to create personalized, varied, and engaging story elements that go beyond
 * the provided examples while staying true to the user's interests.
 */
export function generateCreativeSeeds(userInfo: any): CreativeStorySeed[] {
  const seeds: CreativeStorySeed[] = [];
  const userName = userInfo?.name || 'the child';

  // Color Integration - CONCISE FORMAT
  if (userInfo?.favoriteColor) {
    seeds.push({
      input: userInfo.favoriteColor,
      inputType: 'color',
      storyPossibilities: [`Include ${userInfo.favoriteColor} naturally in the story — it may show up in objects, clothing, scenery, atmosphere, or other creative details.`]
    });
  }

  // Animal Integration - CONCISE FORMAT
  if (userInfo?.favoriteAnimal) {
    seeds.push({
      input: userInfo.favoriteAnimal,
      inputType: 'animal',
      storyPossibilities: [`Include ${userInfo.favoriteAnimal} naturally in the story — it may appear as a helper, companion, or character encountered during the adventure.`]
    });
  }

  // Hobby Integration - CONCISE FORMAT
  if (userInfo?.hobbies && userInfo.hobbies.trim()) {
    const hobby = userInfo.hobbies.toLowerCase().split(',')[0]?.trim();
    if (hobby) {
      seeds.push({
        input: hobby,
        inputType: 'hobby',
        storyPossibilities: [`Include skills from ${hobby} naturally in the story — they may help solve problems, navigate challenges, or provide useful abilities.`]
      });
    }
  }

  // Food Integration - CONCISE FORMAT
  if (userInfo?.favoriteFood) {
    seeds.push({
      input: userInfo.favoriteFood,
      inputType: 'food',
      storyPossibilities: [`Include ${userInfo.favoriteFood} naturally in the story — it may appear as treats, meals, discoveries, or celebration food.`]
    });
  }

  // These seeds provide creative guidance and inspiration for AI story generation.
  // AI should feel free to adapt, combine, or create entirely new possibilities
  // that naturally incorporate the user's interests into engaging, age-appropriate stories.
  
  // Return seeds as creative foundation - AI should build upon these examples
  return seeds;
}

// Legacy compatibility - deprecated but maintained for existing integrations
export class InputEnhancementEngine {
  static enhanceUserInputs(userInfo: any) {
    console.warn('⚠️ InputEnhancementEngine.enhanceUserInputs is deprecated. Use generateCreativeSeeds instead.');
    
    const seeds = generateCreativeSeeds(userInfo);
    
    // Convert to legacy format for compatibility
    return {
      originalInput: `${userInfo?.favoriteColor || ''}, ${userInfo?.favoriteAnimal || ''}, ${userInfo?.hobbies || ''}, ${userInfo?.favoriteFood || ''}`,
      enhancedTraits: seeds.map(s => s.storyPossibilities[0]).filter(Boolean),
      characterElements: [{
        type: 'appearance' as const,
        description: `${userInfo?.name || 'the child'} loves ${userInfo?.favoriteColor || 'adventures'}`,
        storyIntegration: seeds.find(s => s.inputType === 'color')?.storyPossibilities[0] || `${userInfo?.name || 'the child'} always chooses ${userInfo?.favoriteColor || 'colorful'} things`
      }],
      storyElements: [{
        type: 'activity' as const,
        description: userInfo?.hobbies || 'adventures',
        narrativeHook: seeds.find(s => s.inputType === 'animal')?.storyPossibilities[0] || `Let's go on an adventure with ${userInfo?.favoriteAnimal || 'friends'}!`
      }],
      thematicConnections: [
        `${userInfo?.favoriteColor || 'colorful'} and ${userInfo?.favoriteAnimal || 'friendly'} adventures`
      ]
    };
  }

  static clearCache(): void {
    // No-op for compatibility
  }
}