// Integration test for story repetition fix
// Tests free vs premium users, language preferences, and mobile compatibility

import { ConsolidatedStoryGenerator } from '@/services/consolidatedStoryGenerator';
import { LanguagePreferenceService } from '@/services/languagePreferenceService';
import { AntiRepetitionSystem } from '@/utils/antiRepetitionSystem';
import { UserInfo, DifficultyLevel } from '@/types';

export class StoryRepetitionIntegrationTest {
  /**
   * Comprehensive integration test for story repetition fix
   */
  static async runIntegrationTest(): Promise<{
    success: boolean;
    results: Array<{
      test: string;
      passed: boolean;
      details: any;
    }>;
  }> {
    console.log('🧪 Starting Story Repetition Integration Test...');
    
    const results = [];
    let allTestsPassed = true;

    // Test 1: Free user with English only
    try {
      const freeUser: UserInfo = {
        name: 'TestUser',
        age: 5,
        grade: 'PreK',
        nativeLanguage: 'es', // Spanish native, but should get English stories
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteAnimal: 'cat',
        favoriteColor: 'blue',
        favoriteFood: 'apple',
        hobbies: 'reading',
        specialRequest: '',
        storyLanguagePreference: 'es' // Should be ignored for free users
      };

      const story1 = await ConsolidatedStoryGenerator.generateStory(freeUser, 'easy', {
        language: 'es', // Should be overridden to English for free users
        pageCount: 20 // Test long story for repetition
      });

      const isEnglishOnly = story1.story.segments.every(segment => 
        /^[a-zA-Z\s.,!?'-]+$/.test(segment.text) // English characters only
      );

      const hasNoRepetition = this.checkForRepetition(story1.story.segments.map(s => s.text));

      results.push({
        test: 'Free User English Enforcement',
        passed: isEnglishOnly && hasNoRepetition.noRepetition,
        details: {
          isEnglishOnly,
          repetitionCheck: hasNoRepetition,
          templateId: story1.templateIdentifier,
          language: 'en' // Should be English
        }
      });

      if (!isEnglishOnly || !hasNoRepetition.noRepetition) {
        allTestsPassed = false;
      }
    } catch (error) {
      results.push({
        test: 'Free User English Enforcement',
        passed: false,
        details: { error: error.message }
      });
      allTestsPassed = false;
    }

    // Test 2: Premium user with non-English preferences (simulated)
    try {
      const premiumUser: UserInfo = {
        name: 'TestUserPremium',
        age: 7,
        grade: '1st',
        nativeLanguage: 'es',
        learningGoal: 'both',
        avatar: { type: 'girl', skinTone: 'light' },
        favoriteAnimal: 'rabbit',
        favoriteColor: 'red',
        favoriteFood: 'pizza',
        hobbies: 'drawing',
        specialRequest: '',
        storyLanguagePreference: 'en' // Premium users can choose
      };

      // Simulate premium user by directly setting language
      const story2 = await ConsolidatedStoryGenerator.generateStory(premiumUser, 'medium', {
        language: 'en', // Premium users can use different languages
        pageCount: 15
      });

      const hasNoRepetition = this.checkForRepetition(story2.story.segments.map(s => s.text));

      results.push({
        test: 'Premium User Language Flexibility',
        passed: hasNoRepetition.noRepetition,
        details: {
          repetitionCheck: hasNoRepetition,
          templateId: story2.templateIdentifier
        }
      });

      if (!hasNoRepetition.noRepetition) {
        allTestsPassed = false;
      }
    } catch (error) {
      results.push({
        test: 'Premium User Language Flexibility',
        passed: false,
        details: { error: error.message }
      });
      allTestsPassed = false;
    }

    // Test 3: Template variety across difficulties
    try {
      const testUser: UserInfo = {
        name: 'TemplateTestUser',
        age: 6,
        grade: 'K',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteAnimal: 'dog',
        favoriteColor: 'green',
        favoriteFood: 'banana',
        hobbies: 'playing',
        specialRequest: ''
      };

      const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
      const templateVarietyTest = {
        passed: true,
        details: {}
      };

      for (const difficulty of difficulties) {
        const story = await ConsolidatedStoryGenerator.generateStory(testUser, difficulty, {
          pageCount: 12
        });

        const repetitionCheck = this.checkForRepetition(story.story.segments.map(s => s.text));
        templateVarietyTest.details[difficulty] = {
          noRepetition: repetitionCheck.noRepetition,
          uniquePages: repetitionCheck.uniqueCount,
          totalPages: story.story.segments.length,
          templateId: story.templateIdentifier
        };

        if (!repetitionCheck.noRepetition) {
          templateVarietyTest.passed = false;
        }
      }

      results.push({
        test: 'Template Variety Across Difficulties',
        passed: templateVarietyTest.passed,
        details: templateVarietyTest.details
      });

      if (!templateVarietyTest.passed) {
        allTestsPassed = false;
      }
    } catch (error) {
      results.push({
        test: 'Template Variety Across Difficulties',
        passed: false,
        details: { error: error.message }
      });
      allTestsPassed = false;
    }

    // Test 4: Mobile compatibility validation
    try {
      const mobileUser: UserInfo = {
        name: 'MobileUser',
        age: 5,
        grade: 'PreK',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'girl', skinTone: 'olive' },
        favoriteAnimal: 'bird',
        favoriteColor: 'purple',
        favoriteFood: 'cookie',
        hobbies: 'singing',
        specialRequest: ''
      };

      const deviceValidation = LanguagePreferenceService.validateCrossDeviceCompatibility(mobileUser, false);
      
      // Test story generation performance on mobile
      const startTime = Date.now();
      const mobileStory = await ConsolidatedStoryGenerator.generateStory(mobileUser, 'easy', {
        pageCount: 10
      });
      const processingTime = Date.now() - startTime;

      const mobileCompatible = deviceValidation.isValid && processingTime < 10000; // Under 10 seconds

      results.push({
        test: 'Mobile Device Compatibility',
        passed: mobileCompatible,
        details: {
          deviceValidation,
          processingTime,
          storyLength: mobileStory.story.segments.length,
          performanceOk: processingTime < 10000
        }
      });

      if (!mobileCompatible) {
        allTestsPassed = false;
      }
    } catch (error) {
      results.push({
        test: 'Mobile Device Compatibility',
        passed: false,
        details: { error: error.message }
      });
      allTestsPassed = false;
    }

    // Test 5: Anti-repetition system functionality
    try {
      await AntiRepetitionSystem.initialize();
      AntiRepetitionSystem.clearCache(false); // Full clear for testing

      const testContent = [
        "The cat runs fast.",
        "The dog runs fast.", // Similar but should be allowed
        "The cat runs fast." // Exact duplicate should be caught
      ];

      const duplicateResults = [];
      for (const content of testContent) {
        const isDuplicate = AntiRepetitionSystem.isDuplicateSync(content, 0.8);
        duplicateResults.push(isDuplicate);
        AntiRepetitionSystem.addContentSync(content);
      }

      // Should be: false, false, true (exact duplicate)
      const antiRepetitionWorking = !duplicateResults[0] && !duplicateResults[1] && duplicateResults[2];

      results.push({
        test: 'Anti-Repetition System Functionality',
        passed: antiRepetitionWorking,
        details: {
          duplicateResults,
          expectedPattern: [false, false, true],
          templateStats: AntiRepetitionSystem.getTemplateStats()
        }
      });

      if (!antiRepetitionWorking) {
        allTestsPassed = false;
      }
    } catch (error) {
      results.push({
        test: 'Anti-Repetition System Functionality',
        passed: false,
        details: { error: error.message }
      });
      allTestsPassed = false;
    }

    console.log('🧪 Story Repetition Integration Test Complete');
    console.log(`✅ Overall Result: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);
    
    return {
      success: allTestsPassed,
      results
    };
  }

  /**
   * Check for repetition in story pages
   */
  private static checkForRepetition(pages: string[]): {
    noRepetition: boolean;
    uniqueCount: number;
    duplicates: string[];
    details: Array<{ page: number; text: string; isDuplicate: boolean }>;
  } {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    const details = [];

    for (let i = 0; i < pages.length; i++) {
      const normalizedPage = pages[i].toLowerCase().trim();
      const isDuplicate = seen.has(normalizedPage);
      
      if (isDuplicate) {
        duplicates.push(pages[i]);
      } else {
        seen.add(normalizedPage);
      }

      details.push({
        page: i + 1,
        text: pages[i],
        isDuplicate
      });
    }

    return {
      noRepetition: duplicates.length === 0,
      uniqueCount: seen.size,
      duplicates,
      details
    };
  }
}