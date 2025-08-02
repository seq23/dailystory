/**
 * Progressive Story Generator - Creates smooth reading level transitions
 * Fixes the difficulty jump between level 1 (easy) and level 2 (medium)
 */

import type { UserInfo, DifficultyLevel } from "@/types";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import StoryQualityChecker from "@/utils/storyQualityChecker";
import { validateAndFixGrammar } from '@/utils/grammarValidator';

interface ProgressiveReadingConfig {
  maxWordsPerPage: number;
  fontSize: string;
  lineHeight: string;
  spacing: string;
  targetVocabularyLevel: number[];
  transitionLevel?: number; // For bridging difficulties
}

export class ProgressiveStoryGenerator {
  
  /**
   * Get progressive reading configuration with smooth transitions
   */
  private static getProgressiveConfig(difficulty: DifficultyLevel): ProgressiveReadingConfig {
    switch (difficulty) {
      case 'easy': // Level 1 - Emergent readers
        return {
          maxWordsPerPage: 6,
          fontSize: 'text-4xl md:text-5xl lg:text-6xl',
          lineHeight: 'leading-loose',
          spacing: 'space-y-8',
          targetVocabularyLevel: [1], // Only level 1 words
        };
      case 'medium': // Level 2 - Early readers (with bridge)
        return {
          maxWordsPerPage: 10, // Reduced from 12 for gentler transition
          fontSize: 'text-3xl md:text-4xl lg:text-5xl',
          lineHeight: 'leading-relaxed',
          spacing: 'space-y-6',
          targetVocabularyLevel: [1, 2], // Mix of level 1 and 2
          transitionLevel: 1.5, // Bridge level
        };
      case 'hard': // Level 3 - Developing readers
        return {
          maxWordsPerPage: 18, // Reduced from 20 for smoother progression
          fontSize: 'text-2xl md:text-3xl lg:text-4xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-4',
          targetVocabularyLevel: [1, 2, 3], // Build on previous levels
        };
      case 'expert': // Level 4 - Fluent readers
        return {
          maxWordsPerPage: 35, // Reduced from 40 for better pacing
          fontSize: 'text-xl md:text-2xl lg:text-3xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-3',
          targetVocabularyLevel: [1, 2, 3, 4], // Full vocabulary range
        };
    }
  }

  /**
   * Generate story with smooth difficulty progression
   */
  static generateProgressiveStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number = 10
  ): { pages: string[]; config: ProgressiveReadingConfig } {
    const config = this.getProgressiveConfig(difficulty);
    const characterName = userInfo.name?.trim() || 'Alex';
    
    // Extract user elements
    const userElements = this.extractUserElements(userInfo);
    const pronouns = this.getPronounsFromAvatar(userInfo.avatar?.type);
    
    // Generate progressive story content
    const pages = this.createProgressivePages(
      characterName, 
      userElements, 
      difficulty, 
      pronouns, 
      pageCount, 
      config
    );
    
    // Validate vocabulary progression
    this.validateVocabularyProgression(pages, difficulty);
    
    // Quality check
    const qualityCheck = StoryQualityChecker.checkStoryQuality(pages, difficulty);
    if (!qualityCheck.isValid) {
      console.warn('Story quality issues detected:', qualityCheck.issues);
    }
    
    return { pages, config };
  }

  /**
   * Create pages with progressive difficulty increase
   */
  private static createProgressivePages(
    characterName: string,
    userElements: any,
    difficulty: DifficultyLevel,
    pronouns: { subject: string, object: string, possessive: string },
    pageCount: number,
    config: ProgressiveReadingConfig
  ): string[] {
    const pages: string[] = [];
    
    // Generate pages with gradual complexity increase
    for (let i = 0; i < pageCount; i++) {
      const progressionRatio = i / (pageCount - 1); // 0 to 1
      const pageContent = this.generateProgressivePage(
        characterName,
        userElements,
        difficulty,
        pronouns,
        i,
        progressionRatio,
        config
      );
      pages.push(pageContent);
    }
    
    return pages;
  }

  /**
   * Generate a single page with appropriate complexity for its position
   */
  private static generateProgressivePage(
    characterName: string,
    userElements: any,
    difficulty: DifficultyLevel,
    pronouns: { subject: string, object: string, possessive: string },
    pageIndex: number,
    progressionRatio: number,
    config: ProgressiveReadingConfig
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood } = userElements;
    
    // Determine complexity for this page position
    const isEarlyPage = progressionRatio < 0.3;
    const isMidPage = progressionRatio >= 0.3 && progressionRatio < 0.7;
    const isLaterPage = progressionRatio >= 0.7;
    
    switch (difficulty) {
      case 'easy':
        return this.generateEasyPage(characterName, favoriteColor, favoriteAnimal, favoriteFood, pronouns, pageIndex);
        
      case 'medium':
        if (isEarlyPage) {
          // Start with easy-level vocabulary and structure
          return this.generateBridgePage(characterName, favoriteColor, favoriteAnimal, favoriteFood, pronouns, pageIndex);
        } else if (isMidPage) {
          // Introduce level 2 vocabulary gradually
          return this.generateMediumTransitionPage(characterName, userElements, pronouns, pageIndex);
        } else {
          // Full medium difficulty
          return this.generateMediumPage(characterName, userElements, pronouns, pageIndex);
        }
        
      case 'hard':
        if (isEarlyPage) {
          // Start closer to medium level
          return this.generateMediumPage(characterName, userElements, pronouns, pageIndex);
        } else {
          // Progress to hard level
          return this.generateHardPage(characterName, userElements, pronouns, pageIndex);
        }
        
      case 'expert':
        if (isEarlyPage) {
          // Start at hard level
          return this.generateHardPage(characterName, userElements, pronouns, pageIndex);
        } else {
          // Progress to expert level
          return this.generateExpertPage(characterName, userElements, pronouns, pageIndex);
        }
    }
  }

  /**
   * Generate easy-level page content (Level 1 vocabulary only)
   */
  private static generateEasyPage(
    name: string, 
    color: string, 
    animal: string, 
    food: string, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const easyTemplates = [
      `${name} saw a ${animal}.`,
      `The ${animal} was ${color}.`,
      `${name} smiled.`,
      `The ${animal} ran.`,
      `${name} played.`,
      `Time for ${food}!`,
      `${name} was happy.`,
      `Good day!`
    ];
    
    return easyTemplates[pageIndex % easyTemplates.length];
  }

  /**
   * Generate bridge page content (Level 1 vocabulary with slightly longer sentences)
   */
  private static generateBridgePage(
    name: string, 
    color: string, 
    animal: string, 
    food: string, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const bridgeTemplates = [
      `${name} woke up.`,
      `A ${color} ${animal} was outside.`,
      `${name} went out.`,
      `The ${animal} seemed nice.`,
      `${name} started to play.`,
      `They had fun together.`,
      `${name} shared ${food}.`,
      `The ${animal} was happy.`,
      `${name} felt good.`,
      `Best day ever!`
    ];
    
    return bridgeTemplates[pageIndex % bridgeTemplates.length];
  }

  /**
   * Generate medium transition page (Introduction of level 2 vocabulary)
   */
  private static generateMediumTransitionPage(
    name: string, 
    userElements: any, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood } = userElements;
    const transitionTemplates = [
      `${name} decided to explore the garden today.`,
      `${pronouns.subject} found something interesting behind the flowers.`,
      `A beautiful ${favoriteColor} ${favoriteAnimal} was hiding there.`,
      `The ${favoriteAnimal} looked different from any other.`,
      `"Hello," said ${name} in a gentle voice.`,
      `The ${favoriteAnimal} came closer to see ${pronouns.object}.`,
      `${name} offered some delicious ${favoriteFood} to share.`,
      `Together they sat under the warm sunshine.`,
      `${name} learned that being kind brings great joy.`,
      `This friendship would last for many years.`
    ];
    
    return transitionTemplates[pageIndex % transitionTemplates.length];
  }

  /**
   * Generate full medium page content
   */
  private static generateMediumPage(
    name: string, 
    userElements: any, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies } = userElements;
    const hobby = hobbies[0] || 'playing';
    
    const mediumTemplates = [
      `${name} loved spending time ${hobby} in the neighborhood.`,
      `One afternoon, while exploring near the old oak tree, something wonderful happened.`,
      `A remarkable ${favoriteColor} ${favoriteAnimal} appeared from behind the bushes.`,
      `This wasn't just any ordinary ${favoriteAnimal} - it seemed almost magical.`,
      `"I've been waiting for someone special like you," the ${favoriteAnimal} said softly.`,
      `${name} felt both excited and curious about this amazing discovery.`,
      `Together, they walked through the garden, sharing stories and ${favoriteFood}.`,
      `The ${favoriteAnimal} showed ${name} secret places filled with wonder.`,
      `"You have a truly kind heart," said the ${favoriteAnimal} with gratitude.`,
      `From that moment on, their friendship brought joy to every day.`
    ];
    
    return mediumTemplates[pageIndex % mediumTemplates.length];
  }

  /**
   * Generate hard page content
   */
  private static generateHardPage(
    name: string, 
    userElements: any, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const hobby = hobbies[0] || 'exploring';
    const interest = interests[1] || 'nature';
    
    const hardTemplates = [
      `${name} had always possessed an extraordinary curiosity about ${interest}.`,
      `During ${pronouns.possessive} favorite activity of ${hobby}, ${pronouns.subject} discovered something remarkable.`,
      `An intelligent ${favoriteColor} ${favoriteAnimal} emerged from the mysterious forest nearby.`,
      `"I need your help with an important mission," the ${favoriteAnimal} explained urgently.`,
      `${name} recognized this as the adventure ${pronouns.subject} had been destined for.`,
      `Together, they journeyed through challenging terrain filled with ancient secrets.`,
      `The ${favoriteAnimal} shared wisdom about ${interest} that amazed ${name} completely.`,
      `Through courage and determination, they overcame every obstacle in their path.`,
      `${name} discovered inner strength and confidence ${pronouns.subject} never knew existed.`,
      `The experience transformed ${pronouns.object} into someone truly extraordinary.`
    ];
    
    return hardTemplates[pageIndex % hardTemplates.length];
  }

  /**
   * Generate expert page content
   */
  private static generateExpertPage(
    name: string, 
    userElements: any, 
    pronouns: any, 
    pageIndex: number
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const hobby = hobbies[0] || 'studying';
    const interest = interests[1] || 'philosophy';
    const secondInterest = interests[2] || 'science';
    
    const expertTemplates = [
      `${name} had developed an exceptional understanding of both ${interest} and ${secondInterest} through years of dedicated ${hobby}.`,
      `The appearance of an ancient ${favoriteColor} ${favoriteAnimal} confirmed what ${pronouns.subject} had long suspected about ${pronouns.possessive} destiny.`,
      `"Your intellectual capabilities and compassionate nature make you uniquely qualified for this responsibility," the creature explained.`,
      `This wasn't merely about adventure—it concerned the fundamental balance between knowledge and wisdom in the universe.`,
      `${name} accepted the challenge, understanding that ${pronouns.possessive} decisions would influence countless generations.`,
      `Through rigorous trials that tested every aspect of ${pronouns.possessive} character and intellect, ${pronouns.subject} persevered.`,
      `The ${favoriteAnimal} became both mentor and companion, sharing profound insights about existence itself.`,
      `Even simple pleasures like savoring ${favoriteFood} took on deeper meaning within this cosmic perspective.`,
      `${name} emerged from the experience fundamentally transformed, possessing wisdom beyond ${pronouns.possessive} years.`,
      `The true adventure was not what happened to ${pronouns.object}, but who ${pronouns.subject} became in the process.`
    ];
    
    return expertTemplates[pageIndex % expertTemplates.length];
  }

  /**
   * Validate vocabulary progression across pages
   */
  private static validateVocabularyProgression(pages: string[], difficulty: DifficultyLevel): void {
    for (let i = 0; i < pages.length; i++) {
      const words = pages[i].split(/\s+/);
      let level2Plus = 0;
      let level3Plus = 0;
      let level4Plus = 0;
      
      words.forEach(word => {
        const wordDifficulty = VocabularyLevelClassifier.getWordDifficulty(word, difficulty);
        if (wordDifficulty.level >= 2) level2Plus++;
        if (wordDifficulty.level >= 3) level3Plus++;
        if (wordDifficulty.level >= 4) level4Plus++;
      });
      
      // Log progression warnings for medium difficulty (the problematic transition)
      if (difficulty === 'medium' && i < 3) { // First 3 pages should be gentler
        const level2Ratio = level2Plus / words.length;
        if (level2Ratio > 0.3) {
          console.warn(`Page ${i + 1} has ${(level2Ratio * 100).toFixed(1)}% level 2+ words - consider simplifying for smoother transition`);
        }
      }
    }
  }

  /**
   * Extract user elements helper
   */
  private static extractUserElements(userInfo: UserInfo) {
    return {
      favoriteColor: userInfo.favoriteColor?.toLowerCase()?.trim() || 'blue',
      favoriteAnimal: userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat',
      favoriteFood: userInfo.favoriteFood?.toLowerCase()?.trim() || 'pizza',
      hobbies: userInfo.hobbies?.split(/[,\s]+/).filter(h => h.length > 0) || ['reading'],
      interests: [
        ...(userInfo.hobbies?.split(/[,\s]+/).filter(h => h.length > 0) || []),
        ...(userInfo.specialRequest?.split(/[,\s]+/).filter(i => i.length > 0) || [])
      ].filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 5)
    };
  }

  /**
   * Get pronouns helper
   */
  private static getPronounsFromAvatar(avatarType?: string) {
    switch (avatarType) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }

  /**
   * Get reading configuration for compatibility
   */
  static getReadingConfigForDifficulty(difficulty: DifficultyLevel) {
    const config = this.getProgressiveConfig(difficulty);
    return {
      maxWordsPerPage: config.maxWordsPerPage,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      spacing: config.spacing
    };
  }
}