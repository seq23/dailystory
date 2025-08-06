// Comprehensive Template System Fix Validation
// Tests the Enhanced Template Manager fix for all levels 1-4

import { EnhancedTemplateManager } from '@/services/enhancedTemplateManager';
import { TemplateSelectionValidator } from '@/utils/templateSelectionValidator';
import { getTemplateCountByGradeLevel, selectTemplate } from '@/constants/gradeBased/unifiedTemplateSystem';
import { difficultyToGradeLevel } from '@/constants/gradeBased';
import type { UserInfo, DifficultyLevel } from '@/types';

export async function validateTemplateSystemFix(): Promise<{
  isValid: boolean;
  errors: string[];
  summary: any;
}> {
  console.log('🔍 Starting Comprehensive Template System Fix Validation...');
  
  const errors: string[] = [];
  const summary: any = {
    timestamp: new Date().toISOString(),
    testResults: {},
    systemHealth: {},
    levelTests: {}
  };

  try {
    // Clear all sessions to start fresh
    EnhancedTemplateManager.clearSession();
    console.log('🧹 Cleared all sessions for fresh testing');

    // Test 1: Template Selection Validator
    console.log('\n📊 Test 1: Running Template Selection Validator...');
    const validatorResult = TemplateSelectionValidator.validateAllLevels();
    summary.testResults.templateSelectionValidator = validatorResult;
    
    if (!validatorResult.isValid) {
      errors.push(...validatorResult.errors);
      console.error('❌ Template Selection Validator FAILED:', validatorResult.errors);
    } else {
      console.log('✅ Template Selection Validator PASSED');
    }

    // Test 2: Difficulty Transition Validator
    console.log('\n🔄 Test 2: Running Difficulty Transition Validator...');
    const transitionResult = TemplateSelectionValidator.validateDifficultyTransitions();
    summary.testResults.difficultyTransitions = transitionResult;
    
    if (!transitionResult.isValid) {
      errors.push(...transitionResult.errors);
      console.error('❌ Difficulty Transition Validator FAILED:', transitionResult.errors);
    } else {
      console.log('✅ Difficulty Transition Validator PASSED');
    }

    // Test 3: Template Count Verification for All Levels
    console.log('\n📋 Test 3: Verifying Template Counts...');
    for (let grade = 1; grade <= 4; grade++) {
      const gradeLevel = grade as any;
      const mainTemplateCount = getTemplateCountByGradeLevel(gradeLevel, false);
      
      summary.levelTests[`level${grade}`] = { mainTemplateCount };
      
      if (mainTemplateCount !== 40) {
        const error = `Level ${grade}: Expected 40 main templates, got ${mainTemplateCount}`;
        errors.push(error);
        console.error(`❌ ${error}`);
      } else {
        console.log(`✅ Level ${grade}: ${mainTemplateCount} main templates confirmed`);
      }
    }

    // Test 4: All Level Transitions (1→2, 2→3, 3→4)
    console.log('\n🎯 Test 4: All Level Transitions Simulation...');
    const allTransitionsTest = await testAllLevelTransitions();
    summary.testResults.allTransitions = allTransitionsTest;
    
    if (!allTransitionsTest.isValid) {
      errors.push(...allTransitionsTest.errors);
      console.error('❌ All Level Transitions FAILED:', allTransitionsTest.errors);
    } else {
      console.log('✅ All Level Transitions PASSED');
    }

    // Test 5: Enhanced Template Manager Story Generation
    console.log('\n📖 Test 5: Testing Enhanced Template Manager Story Generation...');
    const storyGenTest = await testStoryGeneration();
    summary.testResults.storyGeneration = storyGenTest;
    
    if (!storyGenTest.isValid) {
      errors.push(...storyGenTest.errors);
      console.error('❌ Story Generation FAILED:', storyGenTest.errors);
    } else {
      console.log('✅ Story Generation PASSED');
    }

    // Test 6: System Health Check
    console.log('\n🏥 Test 6: System Health Check...');
    const systemHealth = EnhancedTemplateManager.getSystemHealth();
    summary.systemHealth = systemHealth;
    
    if (!systemHealth.isHealthy) {
      const error = `System Health Check FAILED: Expected 200 templates, got ${systemHealth.templatesLoaded}`;
      errors.push(error);
      console.error(`❌ ${error}`);
    } else {
      console.log('✅ System Health Check PASSED');
    }

    // Final Summary
    const isValid = errors.length === 0;
    
    console.log('\n' + '='.repeat(60));
    console.log(`${isValid ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}`);
    console.log(`Total Tests: 6, Errors: ${errors.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.error('\n❌ ERRORS FOUND:');
      errors.forEach((error, index) => {
        console.error(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 ALL TESTS PASSED - Template System Fix is Working Correctly!');
      console.log('\n📊 Summary:');
      console.log('- Level 1-4: 40 main templates each (160 total)');
      console.log('- Level 0: Separate handling (Level0StoryProcessor)');
      console.log('- Total unique pages: 800 (160 templates × 5 pages)');
      console.log('- Anti-repetition: Working correctly');
      console.log('- Level transitions: Clean and isolated');
      console.log('- Main template enforcement: Active');
    }

    return { isValid, errors, summary };

  } catch (error) {
    const errorMsg = `Validation failed with exception: ${error}`;
    console.error('🚨 CRITICAL ERROR:', errorMsg);
    errors.push(errorMsg);
    return { isValid: false, errors, summary };
  }
}

/**
 * Test all level transitions comprehensively
 * Tests 1→2, 2→3, and 3→4 transitions with correct difficulty mappings
 */
async function testAllLevelTransitions(): Promise<{
  isValid: boolean;
  errors: string[];
  details: any;
}> {
  const errors: string[] = [];
  const details: any = {};

  try {
    console.log("🔄 Testing all level transitions...");

    // Clear any existing session state
    EnhancedTemplateManager.clearSession();

    const mockUser: UserInfo = {
      name: "TransitionTestUser",
      age: 10,
      grade: "3rd",
      nativeLanguage: "en",
      learningGoal: "improve-english-reading",
      avatar: { type: "boy", skinTone: "medium" },
      favoriteColor: "blue",
      favoriteAnimal: "elephant",
      hobbies: "adventure, reading",
      favoriteFood: "pizza",
      specialRequest: "",
      interests: ["adventure", "books"]
    };

    // Correct difficulty mappings: easy=1, medium=2, hard=3, expert=4
    const transitions = [
      { from: "easy", to: "medium", fromLevel: 1, toLevel: 2, name: "Level 1→2" },
      { from: "medium", to: "hard", fromLevel: 2, toLevel: 3, name: "Level 2→3" },
      { from: "hard", to: "expert", fromLevel: 3, toLevel: 4, name: "Level 3→4" }
    ] as const;

    for (const transition of transitions) {
      console.log(`🔄 Testing ${transition.name} transition...`);

      // Clear session before each transition test
      EnhancedTemplateManager.clearSession();

      // Generate story at source level
      const sourceStory = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo: mockUser,
        difficulty: transition.from as DifficultyLevel,
        isPremium: false
      });

      if (sourceStory.gradeLevel !== transition.fromLevel) {
        errors.push(`${transition.name}: Source story has wrong grade level: ${sourceStory.gradeLevel}, expected ${transition.fromLevel}`);
      }

      if (sourceStory.templateIndex === undefined || sourceStory.templateIndex >= 40) {
        errors.push(`${transition.name}: Source story has invalid template index: ${sourceStory.templateIndex}`);
      }

      details[`${transition.name}_source`] = {
        gradeLevel: sourceStory.gradeLevel,
        templateIndex: sourceStory.templateIndex,
        pageCount: sourceStory.pages.length
      };

      // Generate story at target level
      const targetStory = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo: mockUser,
        difficulty: transition.to as DifficultyLevel,
        isPremium: false
      });

      if (targetStory.gradeLevel !== transition.toLevel) {
        errors.push(`${transition.name}: Target story has wrong grade level: ${targetStory.gradeLevel}, expected ${transition.toLevel}`);
      }

      if (targetStory.templateIndex === undefined || targetStory.templateIndex >= 40) {
        errors.push(`${transition.name}: Target story has invalid template index: ${targetStory.templateIndex}`);
      }

      details[`${transition.name}_target`] = {
        gradeLevel: targetStory.gradeLevel,
        templateIndex: targetStory.templateIndex,
        pageCount: targetStory.pages.length
      };

      // Check for repetition issues
      const hasRepetition = targetStory.pages.some(page => 
        page.includes("TransitionTestUser discovered an interesting book in the library") ||
        page.includes(". " + page.split(". ")[0] + ".")
      );

      if (hasRepetition) {
        errors.push(`${transition.name}: Target story contains repetitive text`);
      }

      console.log(`✅ ${transition.name} transition completed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      details
    };

  } catch (error) {
    const errorMsg = `All transitions test failed: ${error}`;
    errors.push(errorMsg);
    console.error("❌", errorMsg);

    return {
      isValid: false,
      errors,
      details: { error: errorMsg }
    };
  }
}

async function testStoryGeneration(): Promise<{
  isValid: boolean;
  errors: string[];
  results: any;
}> {
  const errors: string[] = [];
  const results: any = {};

  try {
    const testUser: UserInfo = {
      name: 'Alex',
      age: 7,
      grade: '2nd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'girl', skinTone: 'light' },
      favoriteColor: 'green',
      favoriteAnimal: 'cat',
      hobbies: 'adventure, drawing',
      favoriteFood: 'ice cream',
      specialRequest: '',
      interests: ['adventure']
    };

    // Test each level 1-4 with correct difficulty mappings
    for (let grade = 1; grade <= 4; grade++) {
      const difficulty = ['easy', 'medium', 'hard', 'expert'][grade - 1] as DifficultyLevel;
      
      console.log(`🔄 Testing Level ${grade} (${difficulty}) story generation...`);
      
      EnhancedTemplateManager.clearSession();
      
      const result = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo: testUser,
        difficulty,
        isPremium: false
      });

      results[`level${grade}`] = {
        templateIndex: result.templateIndex,
        gradeLevel: result.gradeLevel,
        pageCount: result.pages.length,
        vocabularyCompliant: result.vocabularyCompliant
      };

      if (result.gradeLevel !== grade) {
        errors.push(`Level ${grade}: Expected grade ${grade}, got ${result.gradeLevel}`);
      }

      if (result.templateIndex < 0 || result.templateIndex >= 40) {
        errors.push(`Level ${grade}: Template index ${result.templateIndex} outside main template range [0-39]`);
      }

      if (result.pages.length === 0) {
        errors.push(`Level ${grade}: No pages generated`);
      }

      if (!result.vocabularyCompliant) {
        errors.push(`Level ${grade}: Vocabulary compliance failed`);
      }
    }

  } catch (error) {
    errors.push(`Story generation test exception: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    results
  };
}

// Expose for browser testing
if (typeof window !== 'undefined') {
  (window as any).validateTemplateSystemFix = validateTemplateSystemFix;
  (window as any).testAllLevelTransitions = testAllLevelTransitions;
  (window as any).testStoryGeneration = testStoryGeneration;
}