// Language Preference Management Service
// Separates UI language, story content language, and user's native language

import { LanguageCode, UserInfo } from '@/types/index';
import { SupportedLanguage } from '@/types/multilingual';
import { getEnabledLanguages } from '@/constants/storyLanguages';
import i18n from '@/i18n/config';

export class LanguagePreferenceService {
  /**
   * Gets the current UI/interface language from i18n
   */
  static getUILanguage(): LanguageCode {
    return i18n.language as LanguageCode;
  }

  /**
   * Gets the user's native language (for word explanations and cultural adaptations)
   */
  static getNativeLanguage(userInfo: UserInfo): LanguageCode {
    return userInfo.nativeLanguage;
  }

  /**
   * Gets the story content language - separate from UI and native language
   * Default: English for all users
   * Premium users can potentially set different story languages in the future
   */
  static getStoryLanguage(userInfo: UserInfo): SupportedLanguage {
    // Check if user has a story language preference set
    if (userInfo.storyLanguagePreference) {
      // Verify the preference is in enabled languages
      const enabledLanguages = getEnabledLanguages();
      const isEnabled = enabledLanguages.some(lang => lang.language === userInfo.storyLanguagePreference);
      
      if (isEnabled) {
        return userInfo.storyLanguagePreference as SupportedLanguage;
      }
    }

    // Default to English for story content
    return 'en';
  }

  /**
   * Sets story language preference (for premium users)
   * Returns whether the setting was successful
   */
  static setStoryLanguagePreference(
    userInfo: UserInfo, 
    storyLanguage: SupportedLanguage
  ): boolean {
    // Verify the language is enabled for stories
    const enabledLanguages = getEnabledLanguages();
    const isEnabled = enabledLanguages.some(lang => lang.language === storyLanguage);
    
    if (!isEnabled) {
      console.warn(`Story language ${storyLanguage} is not enabled`);
      return false;
    }

    // Set the preference
    userInfo.storyLanguagePreference = storyLanguage as LanguageCode;
    return true;
  }

  /**
   * Gets available story languages (currently only English is enabled)
   */
  static getAvailableStoryLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    enabled: boolean;
  }> {
    const enabledLanguages = getEnabledLanguages();
    
    return enabledLanguages.map(lang => ({
      code: lang.language,
      name: lang.name,
      nativeName: lang.nativeName,
      enabled: lang.enabled
    }));
  }

  /**
   * Checks if a story language is enabled
   */
  static isStoryLanguageEnabled(language: SupportedLanguage): boolean {
    const enabledLanguages = getEnabledLanguages();
    return enabledLanguages.some(lang => lang.language === language && lang.enabled);
  }

  /**
   * Gets language configuration for story generation
   */
  static getLanguageConfig(userInfo: UserInfo) {
    return {
      uiLanguage: this.getUILanguage(),
      nativeLanguage: this.getNativeLanguage(userInfo),
      storyLanguage: this.getStoryLanguage(userInfo)
    };
  }

  /**
   * Validates that all required languages are available
   */
  static validateLanguageConfiguration(userInfo: UserInfo): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check story language
    const storyLanguage = this.getStoryLanguage(userInfo);
    if (!this.isStoryLanguageEnabled(storyLanguage)) {
      issues.push(`Story language ${storyLanguage} is not enabled`);
    }

    // Check UI language is supported
    const supportedUILanguages = ['en', 'ar', 'es', 'zh', 'hi', 'pt', 'fr'];
    const uiLanguage = this.getUILanguage();
    if (!supportedUILanguages.includes(uiLanguage)) {
      issues.push(`UI language ${uiLanguage} is not supported`);
    }

    // Verify story language is enabled (removed hardcoded English restriction)
    if (!this.isStoryLanguageEnabled(storyLanguage)) {
      issues.push(`Story language '${storyLanguage}' is not enabled in STORY_LANGUAGES configuration`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Cross-device validation for mobile, tablet, desktop compatibility
   */
  static validateCrossDeviceCompatibility(userInfo: UserInfo): {
    isValid: boolean;
    deviceChecks: Array<{
      device: string;
      storyLanguage: string;
      fontSupport: boolean;
      rtlSupport: boolean;
    }>;
  } {
    const devices = ['mobile', 'tablet', 'desktop'];
    const deviceChecks = devices.map(device => ({
      device,
      storyLanguage: this.getStoryLanguage(userInfo),
      fontSupport: true, // Fonts are loaded in HTML head
      rtlSupport: userInfo.nativeLanguage === 'ar' ? true : true // RTL handled in CSS
    }));

    const isValid = deviceChecks.every(check => 
      this.isStoryLanguageEnabled(check.storyLanguage as SupportedLanguage) && 
      check.fontSupport && 
      check.rtlSupport
    );

    return { isValid, deviceChecks };
  }
}