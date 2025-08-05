// Multilingual Template Manager - Handles language-aware template selection
import type { SupportedLanguage } from '@/types/multilingual';
import type { UserInfo } from '@/types';

// Language-specific template availability
const LANGUAGE_TEMPLATE_SUPPORT: Record<SupportedLanguage, boolean> = {
  'en': true,  // Full template support
  'es': false, // Future implementation
  'fr': false, // Future implementation
  'ar': false, // Future implementation
  'zh': false, // Future implementation
  'hi': false, // Future implementation
  'pt': false  // Future implementation
};

export class MultilingualTemplateManager {
  /**
   * Check if templates are available for the specified language
   */
  static isLanguageSupported(language: SupportedLanguage): boolean {
    return LANGUAGE_TEMPLATE_SUPPORT[language] || false;
  }

  /**
   * Get the appropriate language for template selection
   * Falls back to English if the requested language isn't supported
   */
  static getTemplateLanguage(userInfo?: UserInfo): SupportedLanguage {
    const requestedLanguage = userInfo?.storyLanguagePreference || userInfo?.nativeLanguage;
    
    if (requestedLanguage && this.isLanguageSupported(requestedLanguage)) {
      return requestedLanguage;
    }

    // Fallback to English for now
    console.log(`🌐 MultilingualTemplateManager: Language ${requestedLanguage} not yet supported, using English`);
    return 'en';
  }

  /**
   * Get language-appropriate fallback content
   */
  static getLanguageFallback(language: SupportedLanguage, userInfo?: UserInfo): string[] {
    // For now, all fallbacks are in English
    // This will be expanded when multilingual support is added
    const userName = userInfo?.name || 'I';
    
    return [
      `${userName} see a cat.`,
      `The cat is big.`,
      `${userName} like the cat.`,
      `We play and run.`,
      `It is fun to play.`
    ];
  }

  /**
   * Prepare for future multilingual expansion
   */
  static getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(LANGUAGE_TEMPLATE_SUPPORT).filter(
      lang => LANGUAGE_TEMPLATE_SUPPORT[lang as SupportedLanguage]
    ) as SupportedLanguage[];
  }

  /**
   * Get language-specific reading difficulty adjustments
   * (Future implementation for non-English languages)
   */
  static getLanguageComplexity(language: SupportedLanguage): {
    baseComplexity: number;
    scriptComplexity: number;
    grammarComplexity: number;
  } {
    // Complexity factors for different languages (future use)
    const complexityMap: Record<SupportedLanguage, any> = {
      'en': { baseComplexity: 1.0, scriptComplexity: 1.0, grammarComplexity: 1.0 },
      'es': { baseComplexity: 1.1, scriptComplexity: 1.0, grammarComplexity: 1.2 },
      'fr': { baseComplexity: 1.2, scriptComplexity: 1.0, grammarComplexity: 1.3 },
      'ar': { baseComplexity: 1.4, scriptComplexity: 1.8, grammarComplexity: 1.5 },
      'zh': { baseComplexity: 1.6, scriptComplexity: 2.0, grammarComplexity: 1.1 },
      'hi': { baseComplexity: 1.3, scriptComplexity: 1.6, grammarComplexity: 1.4 },
      'pt': { baseComplexity: 1.1, scriptComplexity: 1.0, grammarComplexity: 1.2 }
    };

    return complexityMap[language] || complexityMap['en'];
  }
}

export default MultilingualTemplateManager;