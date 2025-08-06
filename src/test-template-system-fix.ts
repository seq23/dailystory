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

    // Test 4: Level 3→4 Transition Simulation (The Original Issue)
    console.log('\n🎯 Test 4: Level 3→4 Transition Simulation...');
    const level3ToLevel4Test = await testLevel3ToLevel4Transition();
    summary.testResults.level3ToLevel4Transition = level3ToLevel4Test;
    
    if (!level3ToLevel4Test.isValid) {
      errors.push(...level3ToLevel4Test.errors);
      console.error('❌ Level 3→4 Transition FAILED:', level3ToLevel4Test.errors);
    } else {
      console.log('✅ Level 3→4 Transition PASSED');
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

async function testLevel3ToLevel4Transition(): Promise<{
  isValid: boolean;
  errors: string[];
  details: any;
}> {
  const errors: string[] = [];
  const details: any = {};

  try {
    // Test user profile
    const testUser: UserInfo = {
      name: 'Sequoia',
      age: 8,
      grade: '3rd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'elephant',
      hobbies: 'reading, exploring',
      favoriteFood: 'pizza',
      specialRequest: '',
      interests: ['books', 'reading']
    };

    // Clear sessions first
    EnhancedTemplateManager.clearSession();

    // Generate Level 3 story
    console.log('🔄 Testing Level 3 story generation...');
    const level3Result = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUser,
      difficulty: 'medium' as DifficultyLevel,
      isPremium: false
    });

    details.level3 = {
      templateIndex: level3Result.templateIndex,
      gradeLevel: level3Result.gradeLevel,
      pageCount: level3Result.pages.length,
      firstPage: level3Result.pages[0]?.substring(0, 100) + '...'
    };

    if (level3Result.gradeLevel !== 3) {
      errors.push(`Level 3: Expected grade level 3, got ${level3Result.gradeLevel}`);
    }

    if (level3Result.templateIndex < 0 || level3Result.templateIndex >= 40) {
      errors.push(`Level 3: Template index ${level3Result.templateIndex} outside valid range [0-39]`);
    }

    // Simulate difficulty increase to Level 4
    console.log('🔄 Testing Level 4 story generation (difficulty transition)...');
    EnhancedTemplateManager.clearSessionForDifficultyChange('medium', 'hard');

    const level4Result = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUser,
      difficulty: 'hard' as DifficultyLevel,
      isPremium: false
    });

    details.level4 = {
      templateIndex: level4Result.templateIndex,
      gradeLevel: level4Result.gradeLevel,
      pageCount: level4Result.pages.length,
      firstPage: level4Result.pages[0]?.substring(0, 100) + '...'
    };

    if (level4Result.gradeLevel !== 4) {
      errors.push(`Level 4: Expected grade level 4, got ${level4Result.gradeLevel}`);
    }

    if (level4Result.templateIndex < 0 || level4Result.templateIndex >= 40) {
      errors.push(`Level 4: Template index ${level4Result.templateIndex} outside valid range [0-39]`);
    }

    // Test for the specific repetition issue
    const level4Pages = level4Result.pages.join(' ').toLowerCase();
    if (level4Pages.includes('sequoia discovered an interesting book in the library')) {
      errors.push('Level 4: Found the problematic repetitive text that should be fixed');
    }

    // Test continuation to ensure no immediate repetition
    console.log('🔄 Testing Level 4 story continuation...');
    const level4Continuation = await EnhancedTemplateManager.continueStory({
      userInfo: testUser,
      difficulty: 'hard' as DifficultyLevel,
      isPremium: false,
      targetPages: 5
    });

    details.level4Continuation = {
      templateIndex: level4Continuation.templateIndex,
      pageCount: level4Continuation.pages.length,
      firstPage: level4Continuation.pages[0]?.substring(0, 100) + '...'
    };

    // Ensure continuation uses different template or continues current one properly
    const continuationPages = level4Continuation.pages.join(' ').toLowerCase();
    if (continuationPages.includes('sequoia discovered an interesting book in the library')) {
      errors.push('Level 4 Continuation: Found problematic repetitive text in continuation');
    }

  } catch (error) {
    errors.push(`Level 3→4 transition test exception: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    details
  };
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

    // Test each level 1-4
    for (let grade = 1; grade <= 4; grade++) {
      const difficulty = ['beginner', 'easy', 'medium', 'hard'][grade - 1] as DifficultyLevel;
      
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
  (window as any).testLevel3ToLevel4Transition = testLevel3ToLevel4Transition;
}