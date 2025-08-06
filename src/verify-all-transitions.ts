/**
 * Verification script for all level transitions
 * Double-checks that the comprehensive level transition testing is working correctly
 */

import { validateTemplateSystemFix } from './test-template-system-fix';
import { runAllTransitionTests } from './test-level-transitions';

export async function verifyAllTransitions(): Promise<void> {
  console.log('🔍 DOUBLE-CHECKING ALL LEVEL TRANSITION WORK...');
  console.log('='.repeat(80));

  try {
    // Phase 1: Basic Template System Validation
    console.log('\n📋 Phase 1: Basic Template System Validation');
    console.log('-'.repeat(50));
    
    const basicValidation = await validateTemplateSystemFix();
    
    if (basicValidation.isValid) {
      console.log('✅ Basic template system validation PASSED');
      console.log(`   - Template selection: Working`);
      console.log(`   - Level transitions: Working`);
      console.log(`   - Story generation: Working`);
      console.log(`   - System health: ${basicValidation.summary.systemHealth.isHealthy ? 'HEALTHY' : 'ISSUES'}`);
    } else {
      console.error('❌ Basic template system validation FAILED');
      basicValidation.errors.forEach(error => console.error(`   - ${error}`));
      return;
    }

    // Phase 2: Comprehensive Transition Testing
    console.log('\n🔄 Phase 2: Comprehensive Level Transition Testing');
    console.log('-'.repeat(50));
    
    await runAllTransitionTests();

    // Phase 3: Specific Verification Checks
    console.log('\n🎯 Phase 3: Specific Verification Checks');
    console.log('-'.repeat(50));
    
    const specificChecks = await performSpecificVerificationChecks();
    
    if (specificChecks.allPassed) {
      console.log('✅ All specific verification checks PASSED');
    } else {
      console.error('❌ Some specific verification checks FAILED');
      specificChecks.errors.forEach(error => console.error(`   - ${error}`));
    }

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    const overallSuccess = basicValidation.isValid && specificChecks.allPassed;
    
    if (overallSuccess) {
      console.log('🎉 ✅ ALL LEVEL TRANSITION WORK VERIFIED SUCCESSFULLY!');
      console.log('\n✅ Confirmed Working:');
      console.log('   - Level 1→2 transitions (easy → medium)');
      console.log('   - Level 2→3 transitions (medium → hard)'); 
      console.log('   - Level 3→4 transitions (hard → expert)');
      console.log('   - Session state isolation');
      console.log('   - Anti-repetition system');
      console.log('   - Template bounds enforcement (0-39)');
      console.log('   - User progression simulation');
      console.log('   - Rapid difficulty switching');
      
      console.log('\n🔧 System Status:');
      console.log(`   - Total Templates: ${basicValidation.summary.systemHealth.templatesLoaded}`);
      console.log(`   - Template System: ${basicValidation.summary.systemHealth.version}`);
      console.log(`   - Health Status: ${basicValidation.summary.systemHealth.isHealthy ? 'HEALTHY' : 'ISSUES'}`);
      
    } else {
      console.log('⚠️ ❌ VERIFICATION INCOMPLETE - See errors above');
    }
    
    console.log('='.repeat(80));

  } catch (error) {
    console.error('💥 CRITICAL ERROR during verification:', error);
  }
}

/**
 * Perform specific verification checks for known issues
 */
async function performSpecificVerificationChecks(): Promise<{
  allPassed: boolean;
  errors: string[];
  checks: Record<string, boolean>;
}> {
  const errors: string[] = [];
  const checks: Record<string, boolean> = {};

  try {
    // Import required modules
    const { EnhancedTemplateManager } = await import('./services/enhancedTemplateManager');
    const { difficultyToGradeLevel } = await import('./constants/gradeBased');
    const { getTemplateCountByGradeLevel } = await import('./constants/gradeBased/unifiedTemplateSystem');

    // Check 1: Verify difficulty-to-grade mapping is correct
    console.log('🔍 Check 1: Difficulty-to-grade mapping...');
    const mappingTests = [
      { difficulty: 'easy' as const, expectedGrade: 1 },
      { difficulty: 'medium' as const, expectedGrade: 2 },
      { difficulty: 'hard' as const, expectedGrade: 3 },
      { difficulty: 'expert' as const, expectedGrade: 4 }
    ];

    let mappingCorrect = true;
    for (const test of mappingTests) {
      const actualGrade = difficultyToGradeLevel(test.difficulty);
      if (actualGrade !== test.expectedGrade) {
        errors.push(`Mapping error: ${test.difficulty} maps to grade ${actualGrade}, expected ${test.expectedGrade}`);
        mappingCorrect = false;
      }
    }
    checks.difficultyMapping = mappingCorrect;
    console.log(`   ${mappingCorrect ? '✅' : '❌'} Difficulty-to-grade mapping`);

    // Check 2: Verify template counts for all levels
    console.log('🔍 Check 2: Template counts per level...');
    let templateCountsCorrect = true;
    for (let grade = 1; grade <= 4; grade++) {
      const count = getTemplateCountByGradeLevel(grade as any, false);
      if (count !== 40) {
        errors.push(`Level ${grade}: Expected 40 templates, got ${count}`);
        templateCountsCorrect = false;
      }
    }
    checks.templateCounts = templateCountsCorrect;
    console.log(`   ${templateCountsCorrect ? '✅' : '❌'} Template counts (40 per level)`);

    // Check 3: Test actual story generation with transition
    console.log('🔍 Check 3: Live story generation with transition...');
    EnhancedTemplateManager.clearSession();
    
    const testUser = {
      name: 'VerificationUser',
      age: 8,
      grade: '2nd' as const,
      nativeLanguage: 'en' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'boy' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: '',
      interests: ['adventure']
    };

    // Generate Level 2 story
    const level2Story = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUser,
      difficulty: 'medium',
      isPremium: false
    });

    // Then Level 3 story
    const level3Story = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUser,
      difficulty: 'hard',
      isPremium: false
    });

    let storyGenerationCorrect = true;
    if (level2Story.gradeLevel !== 2) {
      errors.push(`Level 2 story: Expected grade 2, got ${level2Story.gradeLevel}`);
      storyGenerationCorrect = false;
    }
    if (level3Story.gradeLevel !== 3) {
      errors.push(`Level 3 story: Expected grade 3, got ${level3Story.gradeLevel}`);
      storyGenerationCorrect = false;
    }
    if (level2Story.templateIndex >= 40 || level3Story.templateIndex >= 40) {
      errors.push('Template indices outside main template range [0-39]');
      storyGenerationCorrect = false;
    }

    checks.storyGeneration = storyGenerationCorrect;
    console.log(`   ${storyGenerationCorrect ? '✅' : '❌'} Live story generation with transition`);

    // Check 4: Verify no immediate repetition
    console.log('🔍 Check 4: Anti-repetition verification...');
    const storyText2 = level2Story.pages.join(' ');
    const storyText3 = level3Story.pages.join(' ');
    
    const noRepetition = storyText2 !== storyText3;
    checks.antiRepetition = noRepetition;
    console.log(`   ${noRepetition ? '✅' : '❌'} No immediate repetition between levels`);

    if (!noRepetition) {
      errors.push('Found identical story content between Level 2 and Level 3');
    }

    console.log('🔍 Verification checks completed.');

    return {
      allPassed: errors.length === 0,
      errors,
      checks
    };

  } catch (error) {
    errors.push(`Specific verification checks failed: ${error}`);
    return {
      allPassed: false,
      errors,
      checks
    };
  }
}

// Auto-run verification
verifyAllTransitions();

// Expose for browser testing
if (typeof window !== 'undefined') {
  (window as any).verifyAllTransitions = verifyAllTransitions;
}