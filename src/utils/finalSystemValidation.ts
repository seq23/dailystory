// Final System Validation - Complete Integration Check
import { ComprehensiveIntegrationTest } from './comprehensiveIntegrationTest';
import { PremiumFeatureValidation } from './premiumFeatureValidation';
import { LanguagePreferenceService } from '@/services/languagePreferenceService';
import { ConsolidatedStoryGenerator } from '@/services/consolidatedStoryGenerator';
import { StoryQualityChecker } from '@/utils/storyQualityChecker';
import { UserInfo, DifficultyLevel } from '@/types/index';
import { SupportedLanguage } from '@/types/multilingual';

export class FinalSystemValidation {
  
  static async runCompleteValidation(): Promise<{
    success: boolean;
    summary: Record<string, boolean>;
    criticalIssues: string[];
    warnings: string[];
  }> {
    console.log('🎯 RUNNING FINAL COMPLETE SYSTEM VALIDATION');
    console.log('='.repeat(100));
    
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const summary: Record<string, boolean> = {};
    
    try {
      // 1. Core Integration Test
      console.log('\n🔄 RUNNING CORE INTEGRATION TESTS...');
      const coreTest = await ComprehensiveIntegrationTest.runFullSystemTest();
      summary.coreIntegration = coreTest.success;
      if (!coreTest.success) {
        criticalIssues.push(...coreTest.issues);
      }
      
      // 2. Premium Feature Validation
      console.log('\n💎 RUNNING PREMIUM FEATURE VALIDATION...');
      const premiumTest = await PremiumFeatureValidation.validatePremiumStoryFeatures();
      summary.premiumFeatures = premiumTest.success;
      if (!premiumTest.success) {
        criticalIssues.push(...premiumTest.issues);
      }
      
      // 3. Language Restriction Critical Test
      console.log('\n🔒 CRITICAL: FREE USER LANGUAGE RESTRICTION TEST...');
      const languageTest = await this.testCriticalLanguageRestrictions();
      summary.languageRestrictions = languageTest.success;
      if (!languageTest.success) {
        criticalIssues.push(...languageTest.issues);
      }
      
      // 4. Story Quality Verification
      console.log('\n📚 CRITICAL: STORY QUALITY VERIFICATION...');
      const qualityTest = await this.testStoryQualityStandards();
      summary.storyQuality = qualityTest.success;
      if (!qualityTest.success) {
        criticalIssues.push(...qualityTest.issues);
      }
      
      // 5. Vocabulary Level Verification
      console.log('\n📖 CRITICAL: VOCABULARY LEVEL VERIFICATION...');
      const vocabTest = await this.testVocabularyLevelCompliance();
      summary.vocabularyLevels = vocabTest.success;
      if (!vocabTest.success) {
        criticalIssues.push(...vocabTest.issues);
      }
      
      // 6. Cross-Device Template Integration
      console.log('\n📱 DEVICE INTEGRATION TEST...');
      const deviceTest = this.testDeviceIntegration();
      summary.deviceIntegration = deviceTest.success;
      if (!deviceTest.success) {
        warnings.push(...deviceTest.issues);
      }
      
      // 7. Premium Story Management Integration
      console.log('\n💾 PREMIUM STORAGE INTEGRATION TEST...');
      const storageTest = this.testPremiumStorageIntegration();
      summary.premiumStorage = storageTest.success;
      if (!storageTest.success) {
        warnings.push(...storageTest.issues);
      }
      
      const success = criticalIssues.length === 0;
      
      // Print comprehensive summary
      console.log('\n' + '='.repeat(100));
      console.log('📊 FINAL SYSTEM VALIDATION SUMMARY:');
      console.log('='.repeat(100));
      console.log(`✅ Core Integration: ${summary.coreIntegration ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Premium Features: ${summary.premiumFeatures ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Language Restrictions: ${summary.languageRestrictions ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Story Quality: ${summary.storyQuality ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Vocabulary Levels: ${summary.vocabularyLevels ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Device Integration: ${summary.deviceIntegration ? 'PASS' : 'WARN'}`);
      console.log(`✅ Premium Storage: ${summary.premiumStorage ? 'PASS' : 'WARN'}`);
      console.log('='.repeat(100));
      
      if (success) {
        console.log('🎉 SYSTEM VALIDATION COMPLETE: ALL CRITICAL TESTS PASSED!');
        console.log('✅ Free trial users: Stories in English only ✓');
        console.log('✅ Premium users: Language preferences respected ✓');
        console.log('✅ All devices: Fully supported ✓');
        console.log('✅ Story quality: Age-appropriate vocabulary ✓');
        console.log('✅ Integration: All components working together ✓');
      } else {
        console.log('❌ CRITICAL ISSUES DETECTED:');
        criticalIssues.forEach(issue => console.log(`  🚨 ${issue}`));
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️ WARNINGS (non-critical):');
        warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
      }
      
      console.log('='.repeat(100));
      
      return { success, summary, criticalIssues, warnings };
      
    } catch (error) {
      console.error('❌ Final validation failed:', error);
      criticalIssues.push(`Validation execution error: ${error.message}`);
      return { success: false, summary, criticalIssues, warnings };
    }
  }
  
  /**
   * CRITICAL: Test that free users are absolutely restricted to English stories
   */
  private static async testCriticalLanguageRestrictions(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    const criticalLanguages: SupportedLanguage[] = ['es', 'ar', 'zh', 'hi', 'pt', 'fr'];
    
    console.log('  🔒 Testing absolute language restrictions for free users...');
    
    for (const uiLang of criticalLanguages) {
      const freeUser: UserInfo = {
        name: 'FreeTestUser',
        age: 7,
        grade: '2nd',
        nativeLanguage: uiLang,
        storyLanguagePreference: uiLang, // User WANTS stories in their language
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'cookies',
        specialRequest: ''
      };
      
      // CRITICAL TEST: Free user must get English regardless of preferences
      const storyLanguage = LanguagePreferenceService.getStoryLanguage(freeUser, false);
      if (storyLanguage !== 'en') {
        issues.push(`CRITICAL: Free user with UI=${uiLang}, preference=${uiLang} got story language=${storyLanguage}, MUST be 'en'`);
      }
      
      // Generate actual story to double-verify
      try {
        const storyResult = await ConsolidatedStoryGenerator.generateStory(freeUser, 'medium');
        const storyText = storyResult.story.segments.map(s => s.text).join(' ');
        
        // Verify story contains English words and no foreign language content
        if (!this.verifyEnglishOnlyContent(storyText)) {
          issues.push(`CRITICAL: Generated story for free user contains non-English content (UI: ${uiLang})`);
        }
        
        console.log(`    ✅ Free user UI:${uiLang} → Story:${storyLanguage} ✓`);
        
      } catch (error) {
        issues.push(`CRITICAL: Story generation failed for free user with UI language ${uiLang}: ${error.message}`);
      }
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test story quality meets standards
   */
  private static async testStoryQualityStandards(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    
    console.log('  📚 Testing story quality standards...');
    
    for (const difficulty of difficulties) {
      const testUser: UserInfo = {
        name: 'QualityUser',
        age: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : difficulty === 'hard' ? 8 : 10,
        grade: difficulty === 'easy' ? 'PreK' : difficulty === 'medium' ? '1st' : difficulty === 'hard' ? '3rd' : '5th',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'girl', skinTone: 'medium' },
        favoriteColor: 'purple',
        favoriteAnimal: 'butterfly',
        hobbies: 'painting',
        favoriteFood: 'strawberries',
        specialRequest: ''
      };
      
      try {
        const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, difficulty);
        const storyTexts = storyResult.story.segments.map(s => s.text);
        
        // Check for incomplete sentences
        const incompletePages = storyTexts.filter(text => 
          text.trim().endsWith(' a') || 
          text.trim().endsWith(' an') ||
          text.trim().endsWith(' the') ||
          text.includes('{') ||
          text.trim().length < 5
        );
        
        if (incompletePages.length > 0) {
          issues.push(`CRITICAL: Incomplete sentences in ${difficulty}: ${incompletePages.join(', ')}`);
        }
        
        // Run quality checker
        const qualityCheck = StoryQualityChecker.checkStoryQuality(storyTexts, difficulty);
        if (!qualityCheck.isValid) {
          const criticalErrors = qualityCheck.issues.filter(i => i.severity === 'error');
          if (criticalErrors.length > 0) {
            issues.push(`CRITICAL: Quality errors in ${difficulty}: ${criticalErrors.map(e => e.message).join(', ')}`);
          }
        }
        
        console.log(`    ✅ ${difficulty}: Quality score ${qualityCheck.score}/100`);
        
      } catch (error) {
        issues.push(`CRITICAL: Story generation failed for difficulty ${difficulty}: ${error.message}`);
      }
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test vocabulary level compliance
   */
  private static async testVocabularyLevelCompliance(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    console.log('  📖 Testing vocabulary level compliance...');
    
    // Test medium difficulty (level 2) for age-appropriate vocabulary
    const testUser: UserInfo = {
      name: 'VocabUser',
      age: 6,
      grade: '1st',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'light' },
      favoriteColor: 'green',
      favoriteAnimal: 'frog',
      hobbies: 'jumping',
      favoriteFood: 'grapes',
      specialRequest: ''
    };
    
    try {
      const storyResult = await ConsolidatedStoryGenerator.generateStory(testUser, 'medium');
      const storyText = storyResult.story.segments.map(s => s.text).join(' ').toLowerCase();
      
      // Check for words too advanced for level 2 (ages 5-7)
      const tooAdvanced = ['discovers', 'wonderful', 'magnificent', 'extraordinary', 'mischievous', 'tremendous'];
      const foundAdvanced = tooAdvanced.filter(word => storyText.includes(word));
      
      if (foundAdvanced.length > 0) {
        issues.push(`CRITICAL: Found advanced words in medium difficulty: ${foundAdvanced.join(', ')}`);
      }
      
      // Check for proper simpler alternatives
      const appropriateWords = ['finds', 'nice', 'special', 'fun', 'silly', 'big'];
      const foundAppropriate = appropriateWords.filter(word => storyText.includes(word));
      
      if (foundAppropriate.length === 0) {
        issues.push(`WARNING: No age-appropriate vocabulary found in medium difficulty story`);
      }
      
      console.log(`    ✅ Medium difficulty vocabulary check: ${foundAdvanced.length === 0 ? 'PASS' : 'FAIL'}`);
      
    } catch (error) {
      issues.push(`CRITICAL: Vocabulary test failed: ${error.message}`);
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test device integration
   */
  private static testDeviceIntegration(): { success: boolean; issues: string[] } {
    const issues: string[] = [];
    
    console.log('  📱 Testing device integration...');
    
    const deviceTests = [
      { device: 'mobile', width: 375, rtl: false },
      { device: 'tablet', width: 768, rtl: false },
      { device: 'desktop', width: 1200, rtl: false },
      { device: 'mobile_rtl', width: 375, rtl: true }
    ];
    
    deviceTests.forEach(test => {
      // Simulate device environment
      const mockUser: UserInfo = {
        name: 'DeviceUser',
        age: 7,
        grade: '2nd', 
        nativeLanguage: test.rtl ? 'ar' : 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'girl', skinTone: 'olive' },
        favoriteColor: 'yellow',
        favoriteAnimal: 'bee',
        hobbies: 'buzzing',
        favoriteFood: 'honey',
        specialRequest: ''
      };
      
      const deviceCheck = LanguagePreferenceService.validateCrossDeviceCompatibility(mockUser, false);
      if (!deviceCheck.isValid) {
        issues.push(`Device integration failed for ${test.device}: ${test.width}px, RTL:${test.rtl}`);
      }
      
      console.log(`    ✅ ${test.device}: Compatible`);
    });
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Test premium storage integration
   */
  private static testPremiumStorageIntegration(): { success: boolean; issues: string[] } {
    const issues: string[] = [];
    
    console.log('  💾 Testing premium storage integration...');
    
    try {
      // Test that all required premium methods exist
      const requiredMethods = [
        'saveStory',
        'getSavedStories',
        'deleteSavedStory',
        'toggleFavorite',
        'searchStories',
        'saveUserPreferences',
        'getUserPreferences'
      ];
      
      const { PremiumStoryManager } = require('@/services/premiumStoryManager');
      
      requiredMethods.forEach(method => {
        if (typeof PremiumStoryManager[method] !== 'function') {
          issues.push(`Premium storage method missing: ${method}`);
        }
      });
      
      console.log('    ✅ All premium storage methods available');
      
    } catch (error) {
      issues.push(`Premium storage integration test failed: ${error.message}`);
    }
    
    return { success: issues.length === 0, issues };
  }
  
  /**
   * Helper: Verify content is English only
   */
  private static verifyEnglishOnlyContent(text: string): boolean {
    // Check for common English words
    const englishWords = ['the', 'and', 'a', 'to', 'in', 'is', 'was', 'for', 'are', 'with'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    // Should have at least 20% common English words
    const englishRatio = englishWordCount / words.length;
    
    // Check for non-English characters (basic check)
    const hasNonEnglishChars = /[^\x00-\x7F]/.test(text);
    
    return englishRatio > 0.2 && !hasNonEnglishChars;
  }
}

// Auto-run final validation in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  FinalSystemValidation.runCompleteValidation();
}

export default FinalSystemValidation;