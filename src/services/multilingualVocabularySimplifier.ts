// Unified Multilingual Vocabulary Simplifier
// Handles cascading simplification across vocabulary levels (0-3) with language support
// Note: Expert difficulty (Level 4) bypasses vocabulary simplification entirely

import { SupportedLanguage } from '@/types/multilingual';
import { LanguagePreferenceService } from './languagePreferenceService';
import { validateLevel0SentenceByUserType, FREE_LEVEL_0_VOCABULARY } from '@/constants/dolchPrePrimer';
import { validateLevel1Sentence, isLevel1Word } from '@/constants/gradeBased/level1Vocabulary';
import { validateLevel2Sentence, isLevel2Word } from '@/constants/gradeBased/level2Vocabulary';
import { validateLevel3Sentence, isLevel3Word } from '@/constants/gradeBased/level3Vocabulary';

export type VocabularyLevel = 0 | 1 | 2 | 3;

export interface VocabularySimplificationResult {
  text: string;
  wasSimplified: boolean;
  language: SupportedLanguage;
  strategyUsed: 'none' | 'word-replacement' | 'sentence-restructuring' | 'context-relaxation' | 'language-fallback';
  originalInvalidWords?: string[];
  userType: 'free' | 'premium';
  targetLevel: VocabularyLevel;
}

export class MultilingualVocabularySimplifier {
  // Level-specific word replacement maps
  private static readonly LEVEL_2_WORD_REPLACEMENTS = new Map([
    // Complex → Level 2 replacements
    ['magnificent', 'beautiful'],
    ['extraordinary', 'special'],
    ['adventure', 'fun trip'],
    ['wonderful', 'great'],
    ['terrible', 'bad'],
    ['enormous', 'very big'],
    ['tiny', 'very small'],
    ['delicious', 'yummy'],
    ['frightening', 'scary'],
    ['amazing', 'great'],
    ['fantastic', 'wonderful'],
    ['incredible', 'amazing'],
    ['discovered', 'found'],
    ['journey', 'trip'],
    ['character', 'person'],
    ['creature', 'animal'],
    ['mysterious', 'strange'],
    ['dangerous', 'unsafe'],
    ['peaceful', 'quiet'],
    ['important', 'special'],
    ['interesting', 'fun'],
    ['different', 'not same'],
    ['remember', 'think of'],
    ['favorite', 'best'],
    ['suddenly', 'fast'],
    ['carefully', 'slow'],
    ['quickly', 'fast'],
    ['together', 'with'],
    ['beautiful', 'pretty'],
    ['excellent', 'very good']
  ]);

  private static readonly LEVEL_3_WORD_REPLACEMENTS = new Map([
    // Complex → Level 3 replacements (more sophisticated than Level 2)
    ['magnificent', 'wonderful'],
    ['extraordinary', 'amazing'],
    ['tremendous', 'huge'],
    ['spectacular', 'incredible'],
    ['fascinating', 'very interesting'],
    ['remarkable', 'outstanding'],
    ['sophisticated', 'advanced'],
    ['investigate', 'explore'],
    ['observatory', 'place to watch stars'],
    ['atmosphere', 'air around Earth'],
    ['civilization', 'advanced society'],
    ['democracy', 'government by people'],
    ['independence', 'freedom'],
    ['revolution', 'big change'],
    ['photography', 'taking pictures'],
    ['transportation', 'ways to travel'],
    ['communication', 'talking and sharing'],
    ['personality', 'what someone is like'],
    ['responsibility', 'job to do'],
    ['opportunity', 'chance'],
    ['imagination', 'thinking of new things'],
    ['creativity', 'making new things'],
    ['curiosity', 'wanting to know'],
    ['determination', 'not giving up'],
    ['confidence', 'believing in yourself'],
    ['cooperation', 'working together'],
    ['appreciation', 'being thankful'],
    ['consideration', 'thinking about others']
  ]);

  /**
   * Main simplification method that handles user type and language constraints
   */
  static simplifyForLevel(
    text: string,
    targetLevel: VocabularyLevel,
    userName: string,
    userInfo: any,
    isPremium: boolean = false
  ): VocabularySimplificationResult {
    console.log(`🎯 Starting Level ${targetLevel} simplification for ${isPremium ? 'premium' : 'free'} user`);
    
    // Get language configuration
    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo, isPremium);
    const storyLanguage = languageConfig.storyLanguage;
    
    // Free users: Always use English, always simplify
    if (!isPremium) {
      if (storyLanguage !== 'en') {
        console.log('🔄 Free user: forcing English story language');
      }
      
      const englishResult = this.performLevelSimplification(text, targetLevel, userName);
      
      return {
        text: englishResult.text,
        wasSimplified: englishResult.wasSimplified,
        language: 'en', // Always English for free users
        strategyUsed: englishResult.strategyUsed,
        originalInvalidWords: englishResult.originalInvalidWords,
        userType: 'free',
        targetLevel
      };
    }
    
    // Premium users: Can use different languages but still need vocabulary simplification
    if (storyLanguage === 'en') {
      // English content - use existing simplification
      const englishResult = this.performLevelSimplification(text, targetLevel, userName);
      
      return {
        text: englishResult.text,
        wasSimplified: englishResult.wasSimplified,
        language: 'en',
        strategyUsed: englishResult.strategyUsed,
        originalInvalidWords: englishResult.originalInvalidWords,
        userType: 'premium',
        targetLevel
      };
    } else {
      // Non-English content for premium users
      // For now, all non-English languages fall back to English with simplification
      console.warn(`🌐 Language ${storyLanguage} not yet supported for Level ${targetLevel} simplification, falling back to English`);
      
      const fallbackResult = this.performLevelSimplification(text, targetLevel, userName);
      
      return {
        text: fallbackResult.text,
        wasSimplified: true, // Always true when falling back to English
        language: 'en',
        strategyUsed: 'language-fallback',
        originalInvalidWords: fallbackResult.originalInvalidWords,
        userType: 'premium',
        targetLevel
      };
    }
  }

  /**
   * Perform level-specific simplification using 3-strategy cascade
   */
  private static performLevelSimplification(
    text: string,
    targetLevel: VocabularyLevel,
    userName: string
  ): {
    text: string;
    wasSimplified: boolean;
    strategyUsed: 'none' | 'word-replacement' | 'sentence-restructuring' | 'context-relaxation';
    originalInvalidWords?: string[];
  } {
    console.log(`🔍 Attempting Level ${targetLevel} simplification: "${text}"`);
    
    // Check if text already meets target level
    if (this.validateLevelText(text, targetLevel, userName)) {
      console.log(`✅ Text already meets Level ${targetLevel} vocabulary`);
      return {
        text,
        wasSimplified: false,
        strategyUsed: 'none'
      };
    }
    
    const originalInvalidWords = this.getInvalidWords(text, targetLevel, userName);
    console.log(`📝 Invalid words for Level ${targetLevel}:`, originalInvalidWords);
    
    // Strategy 1: Word replacement
    let processedText = this.attemptWordReplacement(text, targetLevel);
    if (this.validateLevelText(processedText, targetLevel, userName)) {
      console.log(`✅ Level ${targetLevel} simplification successful with word replacement`);
      return {
        text: processedText,
        wasSimplified: true,
        strategyUsed: 'word-replacement',
        originalInvalidWords
      };
    }
    
    // Strategy 2: Sentence restructuring
    processedText = this.restructureSentence(processedText, targetLevel);
    if (this.validateLevelText(processedText, targetLevel, userName)) {
      console.log(`✅ Level ${targetLevel} simplification successful with sentence restructuring`);
      return {
        text: processedText,
        wasSimplified: true,
        strategyUsed: 'sentence-restructuring',
        originalInvalidWords
      };
    }
    
    // Strategy 3: Context relaxation (allow some story-enhancing words)
    const relaxationResult = this.applyContextRelaxation(processedText, targetLevel, userName);
    if (relaxationResult.isValid) {
      console.log(`✅ Level ${targetLevel} simplification successful with context relaxation`);
      return {
        text: relaxationResult.text,
        wasSimplified: true,
        strategyUsed: 'context-relaxation',
        originalInvalidWords
      };
    }
    
    // All strategies failed
    console.warn(`⚠️ All Level ${targetLevel} simplification strategies failed`);
    return {
      text,
      wasSimplified: false,
      strategyUsed: 'none',
      originalInvalidWords
    };
  }

  /**
   * Strategy 1: Word replacement using level-specific replacement maps
   */
  private static attemptWordReplacement(text: string, targetLevel: VocabularyLevel): string {
    let replacedText = text;
    
    // Get appropriate replacement map for the target level
    const replacementMap = targetLevel === 0 ? this.getLevel0FallbackReplacements() :
                          targetLevel === 1 ? this.getLevelFallbackReplacements() :
                          targetLevel === 2 ? this.LEVEL_2_WORD_REPLACEMENTS :
                          this.LEVEL_3_WORD_REPLACEMENTS;
    
    // Apply word replacements
    for (const [complex, simple] of replacementMap.entries()) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      replacedText = replacedText.replace(regex, simple);
    }
    
    return replacedText;
  }

  /**
   * Strategy 2: Sentence restructuring for different levels
   */
  private static restructureSentence(text: string, targetLevel: VocabularyLevel): string {
    let restructured = text;
    
    // Level-specific restructuring patterns
    if (targetLevel === 0) {
      // Ultra-simple restructuring for Level 0 - just break into smaller sentences
      restructured = restructured
        .replace(/\band\s+/g, '. ')
        .replace(/\bor\s+/g, '. ')
        .replace(/\bso\s+/g, '. ');
    } else if (targetLevel === 1) {
      // Very simple restructuring for Level 1
      restructured = restructured
        .replace(/\band\s+/g, '. ')
        .replace(/\bbut\s+/g, '. ')
        .replace(/\bso\s+/g, '. ')
        .replace(/\bwhen\s+/g, '. ')
        .replace(/\bif\s+/g, '. ');
    } else if (targetLevel === 2) {
      // Moderate restructuring for Level 2
      restructured = restructured
        .replace(/\b(?:although|though)\s+/g, 'but ')
        .replace(/\b(?:however|nevertheless)\s+/g, 'but ')
        .replace(/\b(?:therefore|thus)\s+/g, 'so ')
        .replace(/\b(?:furthermore|moreover)\s+/g, 'and ');
    } else if (targetLevel === 3) {
      // Minimal restructuring for Level 3 (preserve more complex structures)
      restructured = restructured
        .replace(/\b(?:nevertheless|nonetheless)\s+/g, 'however ')
        .replace(/\b(?:consequently|subsequently)\s+/g, 'then ')
        .replace(/\b(?:furthermore|additionally)\s+/g, 'also ');
    }
    
    return restructured;
  }

  /**
   * Strategy 3: Context relaxation - allow some advanced words for story enhancement
   */
  private static applyContextRelaxation(
    text: string,
    targetLevel: VocabularyLevel,
    userName: string
  ): { isValid: boolean; text: string; allowedWords: string[] } {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const userNameLower = userName?.toLowerCase();
    
    // Level-specific story-enhancing words that can be allowed
    const storyEnhancingWords = {
      0: [], // No story-enhancing words for Level 0 - ultra-strict
      1: ['adventure', 'magical', 'princess', 'dragon', 'castle', 'forest', 'treasure'],
      2: ['mysterious', 'wonderful', 'amazing', 'incredible', 'fantastic', 'adventure', 'journey', 'discovery'],
      3: ['extraordinary', 'magnificent', 'spectacular', 'fascinating', 'remarkable', 'tremendous', 'investigation', 'exploration']
    };
    
    const allowedEnhancingWords = storyEnhancingWords[targetLevel] || [];
    const maxAllowedInvalidWords = targetLevel === 0 ? 0 : targetLevel === 1 ? 2 : targetLevel === 2 ? 3 : 4;
    
    let invalidWordCount = 0;
    const allowedWords: string[] = [];
    
    for (const word of words) {
      if (word === userNameLower) continue; // Always allow user name
      
      if (!this.isLevelWord(word, targetLevel)) {
        if (allowedEnhancingWords.includes(word) && invalidWordCount < maxAllowedInvalidWords) {
          allowedWords.push(word);
          invalidWordCount++;
        } else if (invalidWordCount >= maxAllowedInvalidWords) {
          return { isValid: false, text, allowedWords };
        } else {
          invalidWordCount++;
        }
      }
    }
    
    return { isValid: true, text, allowedWords };
  }

  /**
   * Validate if text meets target vocabulary level
   */
  private static validateLevelText(text: string, targetLevel: VocabularyLevel, userName: string): boolean {
    switch (targetLevel) {
      case 0:
        return validateLevel0SentenceByUserType(text, 'free', userName).isValid;
      case 1:
        return validateLevel1Sentence(text, userName).isValid;
      case 2:
        return validateLevel2Sentence(text, userName).isValid;
      case 3:
        return validateLevel3Sentence(text, userName).isValid;
      default:
        return false;
    }
  }

  /**
   * Get invalid words for target level
   */
  private static getInvalidWords(text: string, targetLevel: VocabularyLevel, userName: string): string[] {
    switch (targetLevel) {
      case 0:
        return validateLevel0SentenceByUserType(text, 'free', userName).invalidWords;
      case 1:
        return validateLevel1Sentence(text, userName).invalidWords;
      case 2:
        return validateLevel2Sentence(text, userName).invalidWords;
      case 3:
        return validateLevel3Sentence(text, userName).invalidWords;
      default:
        return [];
    }
  }

  /**
   * Check if word belongs to target level vocabulary
   */
  private static isLevelWord(word: string, targetLevel: VocabularyLevel): boolean {
    switch (targetLevel) {
      case 0:
        return FREE_LEVEL_0_VOCABULARY.has(word.toLowerCase());
      case 1:
        return isLevel1Word(word);
      case 2:
        return isLevel2Word(word);
      case 3:
        return isLevel3Word(word);
      default:
        return false;
    }
  }

  /**
   * Get Level 1 fallback replacements for the most basic simplification
   */
  private static getLevelFallbackReplacements(): Map<string, string> {
    return new Map([
      ['beautiful', 'pretty'],
      ['wonderful', 'good'],
      ['amazing', 'good'],
      ['fantastic', 'fun'],
      ['incredible', 'big'],
      ['enormous', 'big'],
      ['tiny', 'small'],
      ['delicious', 'good'],
      ['frightening', 'bad'],
      ['discovered', 'found'],
      ['journey', 'trip'],
      ['adventure', 'fun'],
      ['mysterious', 'weird'],
      ['dangerous', 'bad'],
      ['peaceful', 'nice'],
      ['important', 'big'],
      ['different', 'new'],
      ['remember', 'know'],
      ['favorite', 'best'],
      ['suddenly', 'fast'],
      ['carefully', 'slow'],
      ['quickly', 'fast'],
      ['together', 'with']
    ]);
  }

  /**
   * Get Level 0 fallback replacements for ultra-simple pre-reading
   */
  private static getLevel0FallbackReplacements(): Map<string, string> {
    return new Map([
      ['beautiful', 'nice'],
      ['wonderful', 'good'],
      ['amazing', 'good'],
      ['fantastic', 'fun'],
      ['incredible', 'big'],
      ['enormous', 'big'],
      ['tiny', 'small'],
      ['delicious', 'good'],
      ['frightening', 'bad'],
      ['discovered', 'found'],
      ['journey', 'go'],
      ['adventure', 'fun'],
      ['mysterious', 'funny'],
      ['dangerous', 'bad'],
      ['peaceful', 'nice'],
      ['important', 'big'],
      ['different', 'new'],
      ['remember', 'know'],
      ['favorite', 'best'],
      ['suddenly', 'fast'],
      ['carefully', 'slow'],
      ['quickly', 'fast'],
      ['together', 'with'],
      ['hello', 'hi'],
      ['goodbye', 'bye']
    ]);
  }

  /**
   * Cross-device validation for mobile compatibility
   */
  static validateCrossDeviceCompatibility(
    text: string,
    targetLevel: VocabularyLevel,
    userName: string,
    userInfo: any,
    isPremium: boolean = false
  ): {
    isValid: boolean;
    deviceChecks: Array<{
      device: string;
      result: VocabularySimplificationResult;
      mobileOptimized: boolean;
    }>;
  } {
    const devices = ['mobile', 'tablet', 'desktop'];
    const deviceChecks = devices.map(device => {
      const result = this.simplifyForLevel(text, targetLevel, userName, userInfo, isPremium);
      
      return {
        device,
        result,
        mobileOptimized: this.isMobileOptimized(result.text)
      };
    });
    
    const isValid = deviceChecks.every(check => 
      check.result.strategyUsed !== 'none' || check.result.originalInvalidWords?.length === 0
    );
    
    return { isValid, deviceChecks };
  }

  /**
   * Check if text is mobile-optimized (short sentences, simple words)
   */
  private static isMobileOptimized(text: string): boolean {
    const words = text.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Mobile-friendly criteria: average word length < 6, sentence length < 15 words
    return avgWordLength < 6 && words.length < 15;
  }

  /**
   * Validate user permissions for language features
   */
  static validateUserPermissions(userInfo: any, isPremium: boolean): {
    canUseMultipleLanguages: boolean;
    availableLanguages: SupportedLanguage[];
    restrictions: string[];
  } {
    const restrictions: string[] = [];
    
    if (!isPremium) {
      restrictions.push('Free users limited to English stories only');
      restrictions.push('Audio playback available in English only');
      
      return {
        canUseMultipleLanguages: false,
        availableLanguages: ['en'],
        restrictions
      };
    }
    
    // Premium users get access to enabled languages
    const availableLanguages = LanguagePreferenceService.getAvailableStoryLanguages()
      .filter(lang => lang.enabled)
      .map(lang => lang.code);
    
    if (availableLanguages.length === 1 && availableLanguages[0] === 'en') {
      restrictions.push('Currently only English stories are available');
    }
    
    return {
      canUseMultipleLanguages: availableLanguages.length > 1,
      availableLanguages,
      restrictions
    };
  }
}