// Comprehensive verification of story repetition fix across all devices, users, and languages
// This validates all critical paths and scenarios

export class ComprehensiveStoryRepetitionVerification {

  /**
   * 🔍 MASTER VERIFICATION: Test all critical paths
   */
  static async performMasterVerification(): Promise<{
    overallStatus: 'PASS' | 'FAIL';
    criticalIssues: string[];
    results: Array<{
      scenario: string;
      status: 'PASS' | 'FAIL';
      details: any;
    }>;
  }> {
    console.log('🔍 STARTING COMPREHENSIVE VERIFICATION OF STORY REPETITION FIX');
    
    const results = [];
    const criticalIssues = [];
    let overallStatus: 'PASS' | 'FAIL' = 'PASS';

    // ✅ VERIFICATION 1: Free User - Initial Story Generation
    try {
      console.log('📋 Testing: Free User Initial Story Generation');
      
      const { ConsolidatedStoryGenerator } = await import('@/services/consolidatedStoryGenerator');
      const freeUser = {
        name: 'TestFreeUser',
        age: 5,
        grade: 'PreK' as const,
        nativeLanguage: 'es' as const,
        learningGoal: 'improve-english-reading' as const,
        avatar: { type: 'boy' as const, skinTone: 'medium' as const },
        favoriteAnimal: 'cat',
        favoriteColor: 'blue',
        favoriteFood: 'apple',
        hobbies: 'reading',
        specialRequest: '',
        storyLanguagePreference: 'es' as const
      };

      const story = await ConsolidatedStoryGenerator.generateStory(freeUser, 'easy', {
        language: 'es', // Should be ignored
        pageCount: 20, // Test long story
        useSmartParsing: true,
        antiRepetition: true
      });

      const isEnglishOnly = story.story.segments.every(seg => 
        /^[a-zA-Z\s.,!?'-]+$/.test(seg.text)
      );
      const hasVariety = this.checkTemplateVariety(story.story.segments.map(s => s.text));
      
      const freeUserTest = isEnglishOnly && hasVariety.hasVariety;
      
      results.push({
        scenario: 'Free User Initial Generation',
        status: freeUserTest ? 'PASS' : 'FAIL',
        details: {
          isEnglishOnly,
          templateVariety: hasVariety,
          segmentCount: story.story.segments.length
        }
      });

      if (!freeUserTest) {
        criticalIssues.push('Free user initial generation failed');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Free User Initial Generation',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Free user initial generation threw error');
      overallStatus = 'FAIL';
    }

    // ✅ VERIFICATION 2: Free User - Add Pages Functionality
    try {
      console.log('📋 Testing: Free User Add Pages');
      
      const { UniversalContentManager } = await import('@/services/universalContentManager');
      const freeUser = {
        name: 'TestFreeAddPages',
        age: 6,
        grade: 'K' as const,
        nativeLanguage: 'fr' as const,
        learningGoal: 'learn-english-language' as const,
        avatar: { type: 'girl' as const, skinTone: 'light' as const },
        favoriteAnimal: 'dog',
        favoriteColor: 'red',
        favoriteFood: 'pizza',
        hobbies: 'drawing',
        specialRequest: ''
      };

      const addPagesStory = await UniversalContentManager.generateNewStoryWithAntiRepetition(
        freeUser,
        'easy',
        { isPremium: false, userId: 'test', maxSessions: 100 }
      );

      const hasVariety = this.checkTemplateVariety(addPagesStory.story.segments.map(s => s.text));
      const addPagesTest = hasVariety.hasVariety;

      results.push({
        scenario: 'Free User Add Pages',
        status: addPagesTest ? 'PASS' : 'FAIL',
        details: {
          templateVariety: hasVariety,
          segmentCount: addPagesStory.story.segments.length
        }
      });

      if (!addPagesTest) {
        criticalIssues.push('Free user add pages functionality failed');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Free User Add Pages',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Free user add pages threw error');
      overallStatus = 'FAIL';
    }

    // ✅ VERIFICATION 3: Premium User - Story Continuation
    try {
      console.log('📋 Testing: Premium User Story Continuation');
      
      const { UniversalContentManager } = await import('@/services/universalContentManager');
      const premiumUser = {
        name: 'TestPremiumUser',
        age: 8,
        grade: '2nd' as const,
        nativeLanguage: 'en' as const,
        learningGoal: 'both' as const,
        avatar: { type: 'boy' as const, skinTone: 'dark' as const },
        favoriteAnimal: 'elephant',
        favoriteColor: 'green',
        favoriteFood: 'cookies',
        hobbies: 'science',
        specialRequest: ''
      };

      const existingStory = [
        'Alex went to the park.',
        'He saw a big elephant.',
        'The elephant was friendly.',
        'They played together.'
      ];

      const continuation = await UniversalContentManager.continueExistingStory(
        existingStory,
        premiumUser,
        'medium',
        { isPremium: true, userId: 'premium-test', maxSessions: 100 }
      );

      const hasVariety = this.checkTemplateVariety(continuation.segments.map(s => s.text));
      const continuationTest = hasVariety.hasVariety;

      results.push({
        scenario: 'Premium User Continuation',
        status: continuationTest ? 'PASS' : 'FAIL',
        details: {
          templateVariety: hasVariety,
          segmentCount: continuation.segments.length
        }
      });

      if (!continuationTest) {
        criticalIssues.push('Premium user continuation failed');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Premium User Continuation',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Premium user continuation threw error');
      overallStatus = 'FAIL';
    }

    // ✅ VERIFICATION 4: Mobile Device Compatibility
    try {
      console.log('📋 Testing: Mobile Device Compatibility');
      
      const { LanguagePreferenceService } = await import('@/services/languagePreferenceService');
      const mobileUser = {
        name: 'MobileTestUser',
        age: 7,
        grade: '1st' as const,
        nativeLanguage: 'hi' as const,
        learningGoal: 'improve-english-reading' as const,
        avatar: { type: 'girl' as const, skinTone: 'olive' as const },
        favoriteAnimal: 'bird',
        favoriteColor: 'purple',
        favoriteFood: 'fruit',
        hobbies: 'music',
        specialRequest: ''
      };

      const deviceValidation = LanguagePreferenceService.validateCrossDeviceCompatibility(mobileUser, false);
      const languageValidation = LanguagePreferenceService.validateLanguageConfiguration(mobileUser, false);

      const mobileTest = deviceValidation.isValid && languageValidation.isValid;

      results.push({
        scenario: 'Mobile Device Compatibility',
        status: mobileTest ? 'PASS' : 'FAIL',
        details: {
          deviceValidation,
          languageValidation
        }
      });

      if (!mobileTest) {
        criticalIssues.push('Mobile device compatibility failed');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Mobile Device Compatibility',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Mobile compatibility threw error');
      overallStatus = 'FAIL';
    }

    // ✅ VERIFICATION 5: Language Enforcement
    try {
      console.log('📋 Testing: Language Enforcement');
      
      const { LanguagePreferenceService } = await import('@/services/languagePreferenceService');
      
      // Test free user language enforcement
      const spanishUser = { 
        name: 'SpanishUser',
        age: 5,
        grade: 'PreK' as const,
        nativeLanguage: 'es' as const,
        learningGoal: 'improve-english-reading' as const,
        avatar: { type: 'boy' as const, skinTone: 'medium' as const },
        favoriteAnimal: 'cat',
        favoriteColor: 'blue',
        favoriteFood: 'apple',
        hobbies: 'reading',
        specialRequest: '',
        storyLanguagePreference: 'es' as const
      };
      const freeStoryLang = LanguagePreferenceService.getStoryLanguage(spanishUser, false);
      
      // Test premium user language flexibility
      const premiumStoryLang = LanguagePreferenceService.getStoryLanguage(spanishUser, true);
      
      const languageTest = freeStoryLang === 'en' && premiumStoryLang === 'en'; // Spanish not enabled yet

      results.push({
        scenario: 'Language Enforcement',
        status: languageTest ? 'PASS' : 'FAIL',
        details: {
          freeUserLanguage: freeStoryLang,
          premiumUserLanguage: premiumStoryLang,
          expectedFree: 'en',
          expectedPremium: 'en'
        }
      });

      if (!languageTest) {
        criticalIssues.push('Language enforcement failed');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Language Enforcement',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Language enforcement threw error');
      overallStatus = 'FAIL';
    }

    // ✅ VERIFICATION 6: Template Pool Verification
    try {
      console.log('📋 Testing: Template Pool Size');
      
      const { ENHANCED_STORY_TEMPLATES } = await import('@/constants/enhancedStoryTemplates');
      
      const easyCount = ENHANCED_STORY_TEMPLATES.easy?.length || 0;
      const mediumCount = ENHANCED_STORY_TEMPLATES.medium?.length || 0;
      const hardCount = ENHANCED_STORY_TEMPLATES.hard?.length || 0;
      const expertCount = ENHANCED_STORY_TEMPLATES.expert?.length || 0;
      
      const templateTest = easyCount >= 8 && mediumCount >= 5 && hardCount >= 3 && expertCount >= 3;

      results.push({
        scenario: 'Template Pool Size',
        status: templateTest ? 'PASS' : 'FAIL',
        details: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
          expert: expertCount,
          minimumRequired: { easy: 8, medium: 5, hard: 3, expert: 3 }
        }
      });

      if (!templateTest) {
        criticalIssues.push('Template pool size insufficient');
        overallStatus = 'FAIL';
      }
    } catch (error) {
      results.push({
        scenario: 'Template Pool Size',
        status: 'FAIL',
        details: { error: error.message }
      });
      criticalIssues.push('Template pool verification threw error');
      overallStatus = 'FAIL';
    }

    console.log(`🔍 COMPREHENSIVE VERIFICATION COMPLETE: ${overallStatus}`);
    console.log(`📊 Critical Issues Found: ${criticalIssues.length}`);
    
    return {
      overallStatus,
      criticalIssues,
      results
    };
  }

  /**
   * Check if story pages have sufficient template variety
   */
  private static checkTemplateVariety(pages: string[]): {
    hasVariety: boolean;
    uniqueTemplatePatterns: number;
    totalPages: number;
    varietyScore: number;
    repetitionDetails: Array<{ page: number; text: string; isRepetition: boolean }>;
  } {
    const templatePatterns = new Set<string>();
    const repetitionDetails = [];
    let exactRepeats = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pattern = this.extractPattern(page);
      
      const isRepetition = templatePatterns.has(pattern);
      if (isRepetition) {
        exactRepeats++;
      } else {
        templatePatterns.add(pattern);
      }

      repetitionDetails.push({
        page: i + 1,
        text: page,
        isRepetition
      });
    }

    const varietyScore = templatePatterns.size / pages.length;
    const hasVariety = varietyScore > 0.6 && exactRepeats < 3; // Allow some repetition but not excessive

    return {
      hasVariety,
      uniqueTemplatePatterns: templatePatterns.size,
      totalPages: pages.length,
      varietyScore,
      repetitionDetails
    };
  }

  /**
   * Extract pattern from page content
   */
  private static extractPattern(content: string): string {
    return content
      .toLowerCase()
      .replace(/\b[A-Z][a-z]+\b/g, 'NAME')
      .replace(/\b(cat|dog|bird|rabbit|bear|fox|lion|elephant|monkey|horse)\b/g, 'ANIMAL')
      .replace(/\b(red|blue|green|yellow|purple|pink|orange|black|white)\b/g, 'COLOR')
      .replace(/\b(ball|toy|book|flower|tree|house|car|pizza|apple|cookies)\b/g, 'OBJECT')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}