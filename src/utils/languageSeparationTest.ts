// Test utility to verify language separation functionality
// Ensures UI language changes don't affect story content

import { LanguagePreferenceService } from '@/services/languagePreferenceService';
import { UserInfo } from '@/types/index';
import i18n from '@/i18n/config';

export class LanguageSeparationTest {
  /**
   * Test that UI language changes don't affect story language
   */
  static async testLanguageSeparation(): Promise<{
    success: boolean;
    results: Array<{
      uiLanguage: string;
      storyLanguage: string;
      nativeLanguage: string;
      isCorrect: boolean;
    }>;
  }> {
    const testLanguages = ['en', 'ar', 'es', 'zh', 'hi', 'pt', 'fr'];
    const results = [];
    
    // Test user info
    const testUser: UserInfo = {
      name: 'Test User',
      age: 8,
      grade: '3rd',
      nativeLanguage: 'es', // Spanish native
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: 'test story'
    };

    let allCorrect = true;

    for (const uiLang of testLanguages) {
      // Change UI language
      await i18n.changeLanguage(uiLang);
      
      // Get language configuration
      const config = LanguagePreferenceService.getLanguageConfig(testUser);
      
      // Story language should ALWAYS be English regardless of UI language
      const isCorrect = config.storyLanguage === 'en';
      
      if (!isCorrect) {
        allCorrect = false;
      }
      
      results.push({
        uiLanguage: uiLang,
        storyLanguage: config.storyLanguage,
        nativeLanguage: config.nativeLanguage,
        isCorrect
      });
    }

    return {
      success: allCorrect,
      results
    };
  }

  /**
   * Test story language preference setting for premium users
   */
  static testStoryLanguagePreference(): {
    success: boolean;
    details: string[];
  } {
    const details = [];
    let success = true;

    const testUser: UserInfo = {
      name: 'Premium User',
      age: 10,
      grade: '4th',
      nativeLanguage: 'fr',
      learningGoal: 'both',
      avatar: { type: 'girl', skinTone: 'light' },
      favoriteColor: 'purple',
      favoriteAnimal: 'cat',
      hobbies: 'art',
      favoriteFood: 'cake',
      specialRequest: 'test'
    };

    // Test setting story language preference
    const setResult = LanguagePreferenceService.setStoryLanguagePreference(testUser, 'en');
    
    if (!setResult) {
      success = false;
      details.push('Failed to set English as story language preference');
    } else {
      details.push('✓ Successfully set English as story language preference');
    }

    // Verify the preference is applied
    const storyLang = LanguagePreferenceService.getStoryLanguage(testUser);
    if (storyLang !== 'en') {
      success = false;
      details.push(`Expected story language 'en', got '${storyLang}'`);
    } else {
      details.push('✓ Story language preference correctly applied');
    }

    // Test invalid language setting
    const invalidResult = LanguagePreferenceService.setStoryLanguagePreference(testUser, 'invalid' as any);
    if (invalidResult) {
      success = false;
      details.push('Should not allow setting invalid story language');
    } else {
      details.push('✓ Correctly rejected invalid story language');
    }

    return { success, details };
  }

  /**
   * Run all tests and log results
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Running Language Separation Tests...');
    
    // Test 1: UI language separation
    const separationTest = await this.testLanguageSeparation();
    console.log('📊 UI Language Separation Test:', separationTest.success ? '✅ PASSED' : '❌ FAILED');
    
    if (!separationTest.success) {
      console.table(separationTest.results.filter(r => !r.isCorrect));
    } else {
      console.log('✓ All UI language changes preserve English story content');
    }

    // Test 2: Story language preferences
    const preferenceTest = this.testStoryLanguagePreference();
    console.log('📊 Story Language Preference Test:', preferenceTest.success ? '✅ PASSED' : '❌ FAILED');
    
    preferenceTest.details.forEach(detail => console.log(detail));

    // Test 3: Language validation
    const validationTest = LanguagePreferenceService.validateLanguageConfiguration({
      name: 'Test',
      age: 8,
      grade: '2nd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'medium' },
      favoriteColor: 'red',
      favoriteAnimal: 'bird',
      hobbies: 'games',
      favoriteFood: 'apple',
      specialRequest: ''
    });

    console.log('📊 Language Validation Test:', validationTest.isValid ? '✅ PASSED' : '❌ FAILED');
    if (!validationTest.isValid) {
      console.log('Issues:', validationTest.issues);
    }

    console.log('🎯 Language Separation Implementation: Stories remain in English, UI language is independent');
  }
}

// Tests can be run manually if needed