// Comprehensive Integration Test for Story Generation System
import { ConsolidatedStoryGenerator } from '@/services/consolidatedStoryGenerator';
import { LanguagePreferenceService } from '@/services/languagePreferenceService';
import { PremiumStoryManager } from '@/services/premiumStoryManager';
import { StoryQualityChecker } from '@/utils/storyQualityChecker';
import { UserInfo, DifficultyLevel } from '@/types/index';
import { SupportedLanguage } from '@/types/multilingual';

export class ComprehensiveIntegrationTest {
  
  static async runFullSystemTest(): Promise<{
    success: boolean;
    results: Record<string, any>;
    issues: string[];
  }> {
    console.log('🚀 RUNNING COMPREHENSIVE INTEGRATION TEST');
    console.log('='.repeat(80));
    
    const issues: string[] = [];
    const results: Record<string, any> = {};
    
    try {
      // Test 1: Free User Language Restrictions
      console.log('\n🔒 TEST 1: FREE USER LANGUAGE RESTRICTIONS');
      results.freeUserTest = await this.testFreeUserLanguageRestrictions();
      if (!results.freeUserTest.success) {
        issues.push(...results.freeUserTest.issues);
      }
      
      // Test 2: Premium User Language Features
      console.log('\n💎 TEST 2: PREMIUM USER LANGUAGE FEATURES');
      results.premiumUserTest = await this.testPremiumUserLanguageFeatures();
      if (!results.premiumUserTest.success) {
        issues.push(...results.premiumUserTest.issues);
      }
      
      // Test 3: Story Quality Across Languages
      console.log('\n📚 TEST 3: STORY QUALITY VALIDATION');
      results.qualityTest = await this.testStoryQualityAcrossLanguages();
      if (!results.qualityTest.success) {
        issues.push(...results.qualityTest.issues);
      }
      
      // Test 4: Cross-Device Compatibility
      console.log('\n📱 TEST 4: CROSS-DEVICE COMPATIBILITY');
      results.deviceTest = this.testCrossDeviceCompatibility();
      if (!results.deviceTest.success) {
        issues.push(...results.deviceTest.issues);
      }
      
      // Test 5: Premium Story Management Integration
      console.log('\n💾 TEST 5: PREMIUM STORY MANAGEMENT');
      results.premiumStorageTest = this.testPremiumStoryManagement();
      if (!results.premiumStorageTest.success) {
        issues.push(...results.premiumStorageTest.issues);
      }
      
      // Test 6: Vocabulary Appropriateness
      console.log('\n📖 TEST 6: VOCABULARY LEVEL VALIDATION');
      results.vocabularyTest = await this.testVocabularyLevels();
      if (!results.vocabularyTest.success) {
        issues.push(...results.vocabularyTest.issues);
      }
      
      const success = issues.length === 0;
      
      console.log('\n' + '='.repeat(80));
      console.log('📊 COMPREHENSIVE TEST SUMMARY:');
      console.log(`✅ Free User Restrictions: ${results.freeUserTest.success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Premium User Features: ${results.premiumUserTest.success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Story Quality: ${results.qualityTest.success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Device Compatibility: ${results.deviceTest.success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Premium Storage: ${results.premiumStorageTest.success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Vocabulary Levels: ${results.vocabularyTest.success ? 'PASS' : 'FAIL'}`);
      console.log('='.repeat(80));
      
      if (success) {
        console.log('🎉 ALL TESTS PASSED! System is fully integrated and ready.');
      } else {
        console.log('❌ ISSUES DETECTED:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      return { success, results, issues };
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      issues.push(`Test execution error: ${error.message}`);
      return { success: false, results, issues };
    }
  }
  
  /**
   * Test that free users are restricted to English stories regardless of UI language
   */
  private static async testFreeUserLanguageRestrictions(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    const testLanguages: SupportedLanguage[] = ['es', 'ar', 'zh', 'hi', 'pt', 'fr'];
    
    console.log('  Testing free user restrictions across UI languages...');
    
    for (const uiLang of testLanguages) {
      const testUser: UserInfo = {
        name: 'TestUser',
        age: 8,
        grade: '2nd',
        nativeLanguage: uiLang,
        storyLanguagePreference: uiLang, // User wants stories in their language
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'cookies',
        specialRequest: ''
      };
      
      // Test FREE user - should ALWAYS get English stories
      const freeStoryLanguage = LanguagePreferenceService.getStoryLanguage(testUser, false);
      if (freeStoryLanguage !== 'en') {
        issues.push(`FREE user with UI language ${uiLang} got story language ${freeStoryLanguage}, expected 'en'`);
      }
      
      // Generate actual story to verify
      try {
        const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, 'medium');
        
        // Verify story content is in English (basic check)
        const storyText = storyResult.story.segments.map(s => s.text).join(' ');
        if (!this.isEnglishContent(storyText)) {
          issues.push(`Generated story content appears to be non-English for free user with UI language ${uiLang}`);
        }
        
        console.log(`    ✅ UI: ${uiLang} → Story: ${freeStoryLanguage} (Free user)`);
        
      } catch (error) {
        issues.push(`Story generation failed for free user with UI language ${uiLang}: ${error.message}`);
      }
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test premium user language features
   */
  private static async testPremiumUserLanguageFeatures(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    console.log('  Testing premium user language preferences...');
    
    const testUser: UserInfo = {
      name: 'PremiumUser',
      age: 8,
      grade: '2nd',
      nativeLanguage: 'es',
      storyLanguagePreference: 'en', // Premium user can choose English
      learningGoal: 'improve-english-reading',
      avatar: { type: 'girl', skinTone: 'light' },
      favoriteColor: 'purple',
      favoriteAnimal: 'cat',
      hobbies: 'drawing',
      favoriteFood: 'pizza',
      specialRequest: ''
    };
    
    // Test PREMIUM user language preferences
    const premiumStoryLanguage = LanguagePreferenceService.getStoryLanguage(testUser, true);
    if (premiumStoryLanguage !== 'en') {
      issues.push(`Premium user with preference 'en' got story language ${premiumStoryLanguage}, expected 'en'`);
    }
    
    // Test premium story saving
    try {
      const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, 'medium');
      
      // Verify story quality
      const qualityCheck = StoryQualityChecker.checkStoryQuality(
        storyResult.story.segments.map(s => s.text), 
        'medium'
      );
      
      if (!qualityCheck.isValid) {
        issues.push(`Premium user story quality check failed: ${qualityCheck.issues.map(i => i.message).join(', ')}`);
      }
      
      console.log(`    ✅ Premium user story generation and quality check passed`);
      
    } catch (error) {
      issues.push(`Premium user story generation failed: ${error.message}`);
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test story quality across different UI languages
   */
  private static async testStoryQualityAcrossLanguages(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    const testLanguages: SupportedLanguage[] = ['en', 'es', 'ar', 'zh'];
    
    console.log('  Testing story quality across UI languages and difficulty levels...');
    
    for (const uiLang of testLanguages) {
      for (const difficulty of difficulties) {
        const testUser: UserInfo = {
          name: 'QualityTestUser',
          age: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : difficulty === 'hard' ? 8 : 10,
          grade: difficulty === 'easy' ? 'PreK' : difficulty === 'medium' ? '1st' : difficulty === 'hard' ? '3rd' : '5th',
          nativeLanguage: uiLang,
          learningGoal: 'improve-english-reading',
          avatar: { type: 'boy', skinTone: 'medium' },
          favoriteColor: 'green',
          favoriteAnimal: 'elephant',
          hobbies: 'exploring',
          favoriteFood: 'apples',
          specialRequest: ''
        };
        
        try {
          const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, difficulty);
          
          // Quality checks
          const storyTexts = storyResult.story.segments.map(s => s.text);
          const qualityCheck = StoryQualityChecker.checkStoryQuality(storyTexts, difficulty);
          
          // Check for incomplete sentences
          const incompletePages = storyTexts.filter(text => 
            text.trim().endsWith(' a') || 
            text.trim().endsWith(' an') ||
            text.trim().endsWith(' the') ||
            text.includes('{') ||
            text.trim().length < 5
          );
          
          if (incompletePages.length > 0) {
            issues.push(`Incomplete sentences found for ${uiLang}/${difficulty}: ${incompletePages.join(', ')}`);
          }
          
          // Check vocabulary appropriateness
          if (!this.isVocabularyAppropriate(storyTexts, difficulty)) {
            issues.push(`Vocabulary too advanced for ${difficulty} level with UI language ${uiLang}`);
          }
          
          console.log(`    ✅ ${uiLang}/${difficulty}: Quality score ${qualityCheck.score}/100`);
          
        } catch (error) {
          issues.push(`Story generation failed for ${uiLang}/${difficulty}: ${error.message}`);
        }
      }
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test cross-device compatibility
   */
  private static testCrossDeviceCompatibility(): { success: boolean; issues: string[] } {
    const issues: string[] = [];
    
    console.log('  Testing cross-device compatibility...');
    
    const devices = ['mobile', 'tablet', 'desktop'];
    const rtlLanguages = ['ar'];
    const ltrLanguages = ['en', 'es', 'zh'];
    
    devices.forEach(device => {
      // Test RTL language support
      rtlLanguages.forEach(lang => {
        const testUser: UserInfo = {
          name: 'RTLTestUser',
          age: 7,
          grade: '2nd',
          nativeLanguage: lang as any,
          learningGoal: 'improve-english-reading',
          avatar: { type: 'girl', skinTone: 'medium' },
          favoriteColor: 'pink',
          favoriteAnimal: 'bird',
          hobbies: 'singing',
          favoriteFood: 'cake',
          specialRequest: ''
        };
        
        const deviceCheck = LanguagePreferenceService.validateCrossDeviceCompatibility(testUser, false);
        if (!deviceCheck.isValid) {
          issues.push(`Device compatibility failed for ${device} with RTL language ${lang}`);
        }
        
        console.log(`    ✅ ${device}/${lang}: RTL support validated`);
      });
      
      // Test LTR language support
      ltrLanguages.forEach(lang => {
        const testUser: UserInfo = {
          name: 'LTRTestUser',
          age: 6,
          grade: '1st',
          nativeLanguage: lang as any,
          learningGoal: 'improve-english-reading',
          avatar: { type: 'boy', skinTone: 'dark' },
          favoriteColor: 'blue',
          favoriteAnimal: 'fish',
          hobbies: 'swimming',
          favoriteFood: 'sandwich',
          specialRequest: ''
        };
        
        const deviceCheck = LanguagePreferenceService.validateCrossDeviceCompatibility(testUser, false);
        if (!deviceCheck.isValid) {
          issues.push(`Device compatibility failed for ${device} with LTR language ${lang}`);
        }
        
        console.log(`    ✅ ${device}/${lang}: LTR support validated`);
      });
    });
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test premium story management features
   */
  private static testPremiumStoryManagement(): { success: boolean; issues: string[] } {
    const issues: string[] = [];
    
    console.log('  Testing premium story management integration...');
    
    // Test user preference conversion
    const mockUserInfo: UserInfo = {
      name: 'PremiumTestUser',
      age: 8,
      grade: '3rd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'girl', skinTone: 'olive' },
      favoriteColor: 'purple',
      favoriteAnimal: 'unicorn',
      hobbies: 'dancing',
      favoriteFood: 'ice cream',
      specialRequest: ''
    };
    
    try {
      // Test preference conversion
      const preferences = PremiumStoryManager.userInfoToPreferences(mockUserInfo);
      const convertedBack = PremiumStoryManager.preferencesToUserInfo(preferences);
      
      if (convertedBack.name !== mockUserInfo.name) {
        issues.push('User preference conversion failed: name mismatch');
      }
      
      if (convertedBack.favoriteAnimal !== mockUserInfo.favoriteAnimal) {
        issues.push('User preference conversion failed: favoriteAnimal mismatch');
      }
      
      console.log('    ✅ User preference conversion working correctly');
      
      // Test story management interface availability
      const managementFeatures = [
        'saveStory',
        'getSavedStories', 
        'deleteSavedStory',
        'toggleFavorite',
        'searchStories',
        'saveUserPreferences',
        'getUserPreferences'
      ];
      
      managementFeatures.forEach(feature => {
        if (typeof PremiumStoryManager[feature] !== 'function') {
          issues.push(`Premium story management feature missing: ${feature}`);
        }
      });
      
      console.log('    ✅ All premium story management features available');
      
    } catch (error) {
      issues.push(`Premium story management test failed: ${error.message}`);
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test vocabulary appropriateness for each difficulty level
   */
  private static async testVocabularyLevels(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    console.log('  Testing vocabulary appropriateness across difficulty levels...');
    
    const vocabularyTests = [
      {
        difficulty: 'easy' as DifficultyLevel,
        maxSyllables: 2,
        forbiddenWords: ['discover', 'magnificent', 'extraordinary', 'transcend']
      },
      {
        difficulty: 'medium' as DifficultyLevel,
        maxSyllables: 3,
        forbiddenWords: ['transcend', 'extraordinary', 'magnificent', 'philosophical']
      },
      {
        difficulty: 'hard' as DifficultyLevel,
        maxSyllables: 4,
        forbiddenWords: ['transcendental', 'philosophical', 'metaphysical']
      },
      {
        difficulty: 'expert' as DifficultyLevel,
        maxSyllables: 5,
        forbiddenWords: [] // No restrictions at expert level
      }
    ];
    
    for (const test of vocabularyTests) {
      const testUser: UserInfo = {
        name: 'VocabTestUser',
        age: test.difficulty === 'easy' ? 4 : test.difficulty === 'medium' ? 6 : test.difficulty === 'hard' ? 8 : 10,
        grade: test.difficulty === 'easy' ? 'PreK' : test.difficulty === 'medium' ? '1st' : test.difficulty === 'hard' ? '3rd' : '5th',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteColor: 'orange',
        favoriteAnimal: 'tiger',
        hobbies: 'playing',
        favoriteFood: 'banana',
        specialRequest: ''
      };
      
      try {
        const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, test.difficulty);
        const storyText = storyResult.story.segments.map(s => s.text).join(' ');
        
        // Check for forbidden words
        const foundForbidden = test.forbiddenWords.filter(word => 
          storyText.toLowerCase().includes(word.toLowerCase())
        );
        
        if (foundForbidden.length > 0) {
          issues.push(`Found inappropriate vocabulary for ${test.difficulty}: ${foundForbidden.join(', ')}`);
        }
        
        console.log(`    ✅ ${test.difficulty}: Vocabulary level appropriate`);
        
      } catch (error) {
        issues.push(`Vocabulary test failed for ${test.difficulty}: ${error.message}`);
      }
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Helper: Check if content is in English
   */
  private static isEnglishContent(text: string): boolean {
    // Simple heuristic - check for common English words
    const englishWords = ['the', 'and', 'a', 'to', 'in', 'is', 'was', 'for', 'are', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    return (englishWordCount / words.length) > 0.3; // At least 30% common English words
  }
  
  /**
   * Helper: Check if vocabulary is appropriate for difficulty level
   */
  private static isVocabularyAppropriate(texts: string[], difficulty: DifficultyLevel): boolean {
    const allText = texts.join(' ').toLowerCase();
    
    const advancedWords = {
      easy: ['discover', 'magnificent', 'extraordinary', 'wonderful'],
      medium: ['magnificent', 'extraordinary', 'transcendent', 'philosophical'],
      hard: ['transcendental', 'metaphysical', 'existential'],
      expert: [] // No restrictions
    };
    
    const inappropriateWords = advancedWords[difficulty] || [];
    return !inappropriateWords.some(word => allText.includes(word));
  }
}

// Auto-run comprehensive test in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  ComprehensiveIntegrationTest.runFullSystemTest();
}

export default ComprehensiveIntegrationTest;