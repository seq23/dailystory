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

  // Color Integration - These are example integrations; AI can create unique variations
  if (userInfo?.favoriteColor) {
    seeds.push({
      input: userInfo.favoriteColor,
      inputType: 'color',
      storyPossibilities: [
        `${userName} discovers something magical that glows with ${userInfo.favoriteColor} light`,
        `a ${userInfo.favoriteColor} object that becomes important to the adventure`,
        `${userInfo.favoriteColor} elements that help ${userName} solve problems`,
        `a ${userInfo.favoriteColor} world where ${userName} feels at home`
      ]
    });
  }

  // Animal Integration - Examples for AI to expand upon creatively
  if (userInfo?.favoriteAnimal) {
    seeds.push({
      input: userInfo.favoriteAnimal,
      inputType: 'animal',
      storyPossibilities: [
        `${userName} befriends a wise ${userInfo.favoriteAnimal} who becomes their guide`,
        `${userName} discovers they can communicate with ${userInfo.favoriteAnimal}s`,
        `${userName} finds a magical ${userInfo.favoriteAnimal} who needs their help`,
        `${userName} learns important lessons from a gentle ${userInfo.favoriteAnimal}`
      ]
    });
  }

  // Hobby Integration - Creative starting points for AI interpretation
  if (userInfo?.hobbies) {
    seeds.push({
      input: userInfo.hobbies,
      inputType: 'hobby',
      storyPossibilities: [
        `${userName} uses their love of ${userInfo.hobbies} to solve magical problems`,
        `${userName} discovers that ${userInfo.hobbies} has special powers in this world`,
        `${userName} teaches others about ${userInfo.hobbies} and makes new friends`,
        `${userName} finds that ${userInfo.hobbies} is the key to their adventure`
      ]
    });
  }

  // Food Integration - Guidance examples for AI creative expansion
  if (userInfo?.favoriteFood) {
    seeds.push({
      input: userInfo.favoriteFood,
      inputType: 'food',
      storyPossibilities: [
        `${userName} discovers magical ${userInfo.favoriteFood} that grants special abilities`,
        `${userName} learns to make ${userInfo.favoriteFood} with enchanted ingredients`,
        `${userName} uses ${userInfo.favoriteFood} to bring comfort and joy to others`,
        `${userName} finds that sharing ${userInfo.favoriteFood} creates lasting friendships`
      ]
    });
  }

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