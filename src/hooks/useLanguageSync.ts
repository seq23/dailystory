import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '@/types';

/**
 * Hook for managing bidirectional synchronization between UI language and native language preferences.
 * Handles the sync between i18n UI language and user's native language setting.
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation();

  // Storage keys for language preferences
  const LANGUAGE_PREFERENCE_KEY = 'selectedLanguagePreference';
  
  /**
   * Store language preference from WelcomeHero for later pickup by forms
   */
  const storeLanguagePreference = useCallback((language: LanguageCode) => {
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    i18n.changeLanguage(language);
  }, [i18n]);

  /**
   * Get stored language preference (e.g., from WelcomeHero)
   */
  const getStoredLanguagePreference = useCallback((): LanguageCode | null => {
    const stored = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return stored as LanguageCode || null;
  }, []);

  /**
   * Clear stored language preference
   */
  const clearStoredLanguagePreference = useCallback(() => {
    localStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
  }, []);

  /**
   * Sync both UI language and native language preference
   * Used in forms and profile editors
   */
  const syncLanguages = useCallback((language: LanguageCode, updateFormCallback?: (lang: LanguageCode) => void) => {
    // Update UI language
    i18n.changeLanguage(language);
    
    // Update form data if callback provided
    if (updateFormCallback) {
      updateFormCallback(language);
    }
    
    // Store the preference for consistency
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
  }, [i18n]);

  /**
   * Handle language change for premium users - updates UI but preserves story display/navigation LTR
   * This is used in PremiumProfileEditor where UI should change but story content stays consistent
   */
  const syncLanguagesForPremium = useCallback((language: LanguageCode, updateProfileCallback?: (lang: LanguageCode) => void) => {
    // Update UI language
    i18n.changeLanguage(language);
    
    // Update profile data if callback provided
    if (updateProfileCallback) {
      updateProfileCallback(language);
    }
    
    // Note: Story display and navigation L-to-R handling is managed by CSS classes
    // The i18n config handles document direction, but specific components can override via CSS
  }, [i18n]);

  return {
    storeLanguagePreference,
    getStoredLanguagePreference,
    clearStoredLanguagePreference,
    syncLanguages,
    syncLanguagesForPremium,
    currentUILanguage: i18n.language as LanguageCode,
  };
};