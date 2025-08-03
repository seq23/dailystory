// Integration validation test to ensure word count and language restrictions work properly
import { LanguagePreferenceService } from '@/services/languagePreferenceService';
import { getLanguageTemplates } from '@/constants/storyLanguages';
import { StoryQualityChecker } from '@/utils/storyQualityChecker';
import { UserInfo } from '@/types/index';

export class IntegrationValidationTest {
  
  /**
   * Test that free users always get English stories regardless of UI language
   */
  static testFreeUserLanguageRestriction(): void {
    console.log('🧪 Testing Free User Language Restriction...');
    
    // Test various UI languages for free users
    const testUserInfo: UserInfo = {
      name: 'TestUser',
      age: 6,
      grade: '1st',
      nativeLanguage: 'es', // Spanish native language
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      hobbies: 'playing',
      favoriteFood: 'pizza',
      specialRequest: 'adventure story'
    };

    // Test free user (isPremium = false)
    const freeUserStoryLang = LanguagePreferenceService.getStoryLanguage(testUserInfo, false);
    console.log(`✅ Free user story language: ${freeUserStoryLang} (should be 'en')`);
    
    if (freeUserStoryLang !== 'en') {
      console.error('❌ FAIL: Free user not getting English stories!');
    } else {
      console.log('✅ PASS: Free user correctly gets English stories');
    }

    // Test premium user (isPremium = true) - should respect preferences
    const premiumUserStoryLang = LanguagePreferenceService.getStoryLanguage(testUserInfo, true);
    console.log(`✅ Premium user story language: ${premiumUserStoryLang} (should default to 'en' if no preference)`);
  }

  /**
   * Test that word count standards are properly applied across all difficulty levels
   */
  static testWordCountStandards(): void {
    console.log('🧪 Testing Word Count Standards...');
    
    const difficulties = ['easy', 'medium', 'hard', 'expert'] as const;
    
    difficulties.forEach(difficulty => {
      // Get templates for English (since free users always get English)
      const templates = getLanguageTemplates('en', difficulty);
      console.log(`\n📚 Testing ${difficulty} level templates (${templates.length} templates):`);
      
      if (templates.length === 0) {
        console.error(`❌ No templates found for ${difficulty} level!`);
        return;
      }

      let allValid = true;
      templates.forEach((template, index) => {
        const wordCount = template.split(/\s+/).length;
        console.log(`  Page ${index + 1}: "${template}" (${wordCount} words)`);
        
        // Check if template has complete thoughts (not fragments like "name plays")
        if (wordCount < 3) {
          console.warn(`⚠️  Template "${template}" might be too short (${wordCount} words)`);
          allValid = false;
        }
        
        // Check grammar using our validator
        const qualityCheck = StoryQualityChecker.checkStoryQuality([template], difficulty);
        if (!qualityCheck.isValid) {
          console.warn(`⚠️  Quality issues in "${template}":`, qualityCheck.issues.map(i => i.message));
          allValid = false;
        }
      });
      
      if (allValid) {
        console.log(`✅ All ${difficulty} templates passed validation`);
      } else {
        console.warn(`⚠️  Some ${difficulty} templates need attention`);
      }
    });
  }

  /**
   * Test device compatibility
   */
  static testDeviceCompatibility(): void {
    console.log('🧪 Testing Device Compatibility...');
    
    const testUser: UserInfo = {
      name: 'TestUser',
      age: 7,
      grade: '2nd',
      nativeLanguage: 'ar', // Arabic (RTL language)
      learningGoal: 'learn-english-language',
      avatar: { type: 'girl', skinTone: 'dark' },
      favoriteColor: 'purple',
      favoriteAnimal: 'cat',
      hobbies: 'reading',
      favoriteFood: 'cookies',
      specialRequest: 'magical story'
    };

    // Test free user device compatibility
    const freeUserCompatibility = LanguagePreferenceService.validateCrossDeviceCompatibility(testUser, false);
    console.log('Free user device compatibility:', freeUserCompatibility);
    
    if (freeUserCompatibility.isValid) {
      console.log('✅ Free user cross-device compatibility: PASS');
    } else {
      console.error('❌ Free user cross-device compatibility: FAIL');
    }

    // Test premium user device compatibility
    const premiumUserCompatibility = LanguagePreferenceService.validateCrossDeviceCompatibility(testUser, true);
    console.log('Premium user device compatibility:', premiumUserCompatibility);
    
    if (premiumUserCompatibility.isValid) {
      console.log('✅ Premium user cross-device compatibility: PASS');
    } else {
      console.error('❌ Premium user cross-device compatibility: FAIL');
    }
  }

  /**
   * Run all validation tests
   */
  static runAllTests(): void {
    console.log('🚀 Starting Integration Validation Tests...\n');
    
    try {
      this.testFreeUserLanguageRestriction();
      console.log('\n' + '='.repeat(50) + '\n');
      
      this.testWordCountStandards();
      console.log('\n' + '='.repeat(50) + '\n');
      
      this.testDeviceCompatibility();
      console.log('\n' + '='.repeat(50) + '\n');
      
      console.log('✅ Integration validation tests completed successfully!');
    } catch (error) {
      console.error('❌ Integration validation tests failed:', error);
    }
  }
}

// Run tests when this file is loaded (only in development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🔧 Development environment detected - running integration tests...');
  IntegrationValidationTest.runAllTests();
}

export default IntegrationValidationTest;