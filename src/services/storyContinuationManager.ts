// Story Continuation Manager - Handles proper story continuation logic
import type { UserInfo, DifficultyLevel, Story } from '@/types';
import { Level0Simplifier } from './level0Simplifier';
import { Level1Simplifier } from './level1Simplifier';
import { Level2Simplifier } from './level2Simplifier';
import { Level3Simplifier } from './level3Simplifier';

interface StoryContext {
  characters: string[];
  setting: string;
  theme: string;
  lastEvents: string;
  storyTone: string;
  vocabulary: string[];
}

interface ContentManagerConfig {
  isPremium: boolean;
  userId: string;
}

export class StoryContinuationManager {
  /**
   * Generate Level 0 (Beginner) Story Continuation
   */
  static async generateLevel0Continuation(
    context: StoryContext,
    userInfo: UserInfo,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('📖 Generating Level 0 continuation...');
    
    const characterName = context.characters[0] || userInfo.name || 'Sam';
    const pageCount = config.isPremium ? 5 : 3;
    
    // Level 0 continuation templates that maintain story flow
    const continuationTemplates = [
      `${characterName} saw something new. It was in the ${context.setting}.`,
      `${characterName} wanted to look closer. They walked over to see.`,
      `It was very pretty! ${characterName} smiled big.`,
      `${characterName} touched it gently. It felt nice.`,
      `${characterName} was happy. This was a good day!`
    ];
    
    const pages = continuationTemplates.slice(0, pageCount);
    
    // Apply Level 0 simplification 
    const simplifiedPages = pages.map(page => page); // Use templates as-is for now
    
    return {
      id: `level0-continuation-${Date.now()}`,
      segments: simplifiedPages.map(text => ({ text })),
      title: `${characterName} Finds More Fun`,
      difficulty: 'beginner',
      estimatedReadingTime: pages.length * 20,
      wordCount: simplifiedPages.join(' ').split(' ').length
    };
  }

  /**
   * Generate Level 1 (Easy) Story Continuation
   */
  static async generateLevel1Continuation(
    context: StoryContext,
    userInfo: UserInfo,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('📖 Generating Level 1 continuation...');
    
    const characterName = context.characters[0] || userInfo.name || 'Alex';
    const pageCount = config.isPremium ? 5 : 3;
    
    const continuationTemplates = [
      `${characterName} decided to explore more of the ${context.setting}. There were still many things to discover.`,
      `As ${characterName} walked around, they noticed something they hadn't seen before. It looked interesting.`,
      `${characterName} moved closer to get a better look. They were curious about what it could be.`,
      `When ${characterName} found out what it was, they felt excited. This was turning into a wonderful adventure!`,
      `${characterName} knew this ${context.theme} would be one they would remember for a long time.`
    ];
    
    const pages = continuationTemplates.slice(0, pageCount);
    
    // Apply Level 1 simplification
    const simplifiedPages = pages; // Use templates as-is for now
    
    return {
      id: `level1-continuation-${Date.now()}`,
      segments: simplifiedPages.map(text => ({ text })),
      title: `${characterName}'s Adventure Continues`,
      difficulty: 'easy',
      estimatedReadingTime: pages.length * 25,
      wordCount: simplifiedPages.join(' ').split(' ').length
    };
  }

  /**
   * Generate Level 2 (Medium) Story Continuation
   */
  static async generateLevel2Continuation(
    context: StoryContext,
    userInfo: UserInfo,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('📖 Generating Level 2 continuation...');
    
    const characterName = context.characters[0] || userInfo.name || 'Jordan';
    const pageCount = config.isPremium ? 6 : 4;
    
    const continuationTemplates = [
      `${characterName} realized their journey in the ${context.setting} was far from over. The real ${context.theme} was just beginning to unfold.`,
      `Building on what had happened before, ${characterName} made a decision that would change everything. They were ready for whatever came next.`,
      `The ${context.setting} seemed different now, filled with new possibilities. ${characterName} could sense that something important was about to happen.`,
      `With growing confidence, ${characterName} took the next step in their ${context.theme}. Each moment brought new discoveries and challenges.`,
      `${characterName} understood that this experience would teach them valuable lessons about courage, friendship, and believing in themselves.`,
      `As the story continued, ${characterName} felt grateful for this amazing ${context.theme} and all the wonderful memories they were creating.`
    ];
    
    const pages = continuationTemplates.slice(0, pageCount);
    
    // Apply Level 2 simplification
    const simplifiedPages = pages; // Use templates as-is for now
    
    return {
      id: `level2-continuation-${Date.now()}`,
      segments: simplifiedPages.map(text => ({ text })),
      title: `${characterName}'s Continuing Journey`,
      difficulty: 'medium',
      estimatedReadingTime: pages.length * 35,
      wordCount: simplifiedPages.join(' ').split(' ').length
    };
  }

  /**
   * Generate Level 3 (Hard) Story Continuation
   */
  static async generateLevel3Continuation(
    context: StoryContext,
    userInfo: UserInfo,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('📖 Generating Level 3 continuation...');
    
    const characterName = context.characters[0] || userInfo.name || 'Morgan';
    const pageCount = config.isPremium ? 7 : 5;
    
    const continuationTemplates = [
      `${characterName} found themselves at a crucial turning point in their ${context.theme} within the ${context.setting}. The decisions made here would determine the course of everything that followed.`,
      `Drawing upon the experiences from their earlier journey, ${characterName} approached this new challenge with a combination of wisdom and determination that surprised even themselves.`,
      `The ${context.setting} revealed layers of complexity that ${characterName} hadn't noticed before. Each observation led to new questions and deeper understanding.`,
      `As ${characterName} navigated through this continuation of their ${context.theme}, they discovered hidden strengths and capabilities they never knew they possessed.`,
      `The interconnected nature of events became clear to ${characterName}, who began to see how each part of their journey contributed to a larger, more meaningful whole.`,
      `With newfound perspective, ${characterName} embraced both the challenges and opportunities that lay ahead, knowing that growth often comes through perseverance.`,
      `${characterName} understood that this ${context.theme} was transforming them in ways that would influence all their future adventures and relationships.`
    ];
    
    const pages = continuationTemplates.slice(0, pageCount);
    
    // Apply Level 3 simplification
    const simplifiedPages = pages; // Use templates as-is for now
    
    return {
      id: `level3-continuation-${Date.now()}`,
      segments: simplifiedPages.map(text => ({ text })),
      title: `${characterName}'s Evolving Adventure`,
      difficulty: 'hard',
      estimatedReadingTime: pages.length * 45,
      wordCount: simplifiedPages.join(' ').split(' ').length
    };
  }

  /**
   * Generate Level 4 (Expert) Story Continuation
   */
  static async generateLevel4Continuation(
    context: StoryContext,
    userInfo: UserInfo,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('📖 Generating Level 4 continuation...');
    
    const characterName = context.characters[0] || userInfo.name || 'Sage';
    const pageCount = config.isPremium ? 8 : 6;
    
    const continuationTemplates = [
      `${characterName} stood at the precipice of a profound realization within the ${context.setting}, where the culmination of their ${context.theme} would demand every ounce of intellect, creativity, and resilience they had developed.`,
      `The intricate tapestry of events that had led ${characterName} to this moment revealed patterns and connections that spoke to the fundamental nature of their transformative ${context.theme}.`,
      `Within the multifaceted environment of the ${context.setting}, ${characterName} encountered philosophical and practical challenges that required synthesizing knowledge, intuition, and experience in unprecedented ways.`,
      `As ${characterName} delved deeper into the complexities of their continuing ${context.theme}, they discovered that each solution created new questions, each answer unveiled deeper mysteries.`,
      `The dynamic interplay between ${characterName}'s evolving understanding and the ever-changing circumstances of the ${context.setting} created opportunities for innovation and breakthrough thinking.`,
      `${characterName} began to perceive their ${context.theme} not merely as a series of events, but as a sophisticated exploration of possibility, potential, and the profound connections that bind all experiences together.`,
      `Through this advanced phase of their journey, ${characterName} developed the ability to navigate ambiguity, embrace paradox, and find elegant solutions to seemingly impossible challenges.`,
      `The culmination of ${characterName}'s ${context.theme} represented not an ending, but a sophisticated beginning—a launching point for even more complex and rewarding adventures that lay beyond the horizon.`
    ];
    
    const pages = continuationTemplates.slice(0, pageCount);
    
    return {
      id: `level4-continuation-${Date.now()}`,
      segments: pages.map(text => ({ text })),
      title: `${characterName}'s Intellectual Odyssey Continues`,
      difficulty: 'expert',
      estimatedReadingTime: pages.length * 60,
      wordCount: pages.join(' ').split(' ').length
    };
  }
}