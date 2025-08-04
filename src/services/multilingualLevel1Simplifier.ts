// Multilingual Level 1 Simplification Service
// Handles cross-device, cross-language vocabulary simplification for premium vs free users

import { SupportedLanguage } from '@/types/multilingual';
import { LanguagePreferenceService } from './languagePreferenceService';
import { Level1Simplifier } from './level1Simplifier';

export interface MultilingualSimplificationResult {
  text: string;
  wasSimplified: boolean;
  language: SupportedLanguage;
  strategyUsed: 'none' | 'word-replacement' | 'sentence-restructuring' | 'context-relaxation' | 'language-fallback';
  originalInvalidWords?: string[];
  userType: 'free' | 'premium';
}

export class MultilingualLevel1Simplifier {
  /**
   * Main simplification method that handles user type and language constraints
   */
  static simplifyForLevel1(
    text: string, 
    userName: string, 
    userInfo: any, 
    isPremium: boolean = false
  ): MultilingualSimplificationResult {
    // Get language configuration
    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo, isPremium);
    const storyLanguage = languageConfig.storyLanguage;
    
    // Free users: Always use English, always simplify
    if (!isPremium) {
      // Force English for free users
      if (storyLanguage !== 'en') {
        console.log('🔄 Free user: forcing English story language');
      }
      
      const englishResult = Level1Simplifier.simplifyForLevel1(text, userName);
      
      return {
        text: englishResult.text,
        wasSimplified: englishResult.wasSimplified,
        language: 'en', // Always English for free users
        strategyUsed: englishResult.strategyUsed,
        originalInvalidWords: englishResult.originalInvalidWords,
        userType: 'free'
      };
    }
    
    // Premium users: Can use different languages but still need Level 1 simplification for 'easy' difficulty
    if (storyLanguage === 'en') {
      // English content - use existing Level 1 simplifier
      const englishResult = Level1Simplifier.simplifyForLevel1(text, userName);
      
      return {
        text: englishResult.text,
        wasSimplified: englishResult.wasSimplified,
        language: 'en',
        strategyUsed: englishResult.strategyUsed,
        originalInvalidWords: englishResult.originalInvalidWords,
        userType: 'premium'
      };
    } else {
      // Non-English content for premium users
      // For now, all non-English languages are disabled in story generation
      // Fall back to English with simplification
      console.warn(`🌐 Language ${storyLanguage} not yet supported for Level 1 simplification, falling back to English`);
      
      const fallbackResult = Level1Simplifier.simplifyForLevel1(text, userName);
      
      return {
        text: fallbackResult.text,
        wasSimplified: true, // Always true when falling back to English
        language: 'en',
        strategyUsed: 'language-fallback',
        originalInvalidWords: fallbackResult.originalInvalidWords,
        userType: 'premium'
      };
    }
  }
  
  /**
   * Cross-device validation for mobile compatibility
   */
  static validateCrossDeviceCompatibility(
    text: string,
    userName: string,
    userInfo: any,
    isPremium: boolean = false
  ): {
    isValid: boolean;
    deviceChecks: Array<{
      device: string;
      result: MultilingualSimplificationResult;
      mobileOptimized: boolean;
    }>;
  } {
    const devices = ['mobile', 'tablet', 'desktop'];
    const deviceChecks = devices.map(device => {
      const result = this.simplifyForLevel1(text, userName, userInfo, isPremium);
      
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