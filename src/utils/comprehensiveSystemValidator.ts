// Comprehensive System Validation - Triple Check All Refactoring Work
import { Level0StoryProcessor } from '@/services/level0StoryProcessor';
import { EnhancedTemplateManager } from '@/services/enhancedTemplateManager';
import { UniversalContentManager } from '@/services/universalContentManager';
import { HierarchicalSessionTemplateManager } from '@/services/hierarchicalSessionTemplateManager';
import type { UserInfo, DifficultyLevel } from '@/types';

const testUser: UserInfo = {
  name: 'TestUser',
  age: 6,
  grade: '1st',
  nativeLanguage: 'en',
  learningGoal: 'improve-english-reading',
  avatar: { type: 'boy', skinTone: 'medium' },
  favoriteColor: 'blue',
  favoriteAnimal: 'cat',
  hobbies: 'reading',
  favoriteFood: 'pizza',
  specialRequest: 'adventure'
};

interface SystemValidationResult {
  component: string;
  tests: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  overallPassed: boolean;
}

export class ComprehensiveSystemValidator {
  
  /**
   * 1. Validate Level0StoryProcessor refactoring
   */
  static async validateLevel0StoryProcessor(): Promise<SystemValidationResult> {
    console.log('🔍 Validating Level0StoryProcessor refactoring...');
    const tests: any[] = [];
    
    try {
      // Reset for clean test
      Level0StoryProcessor.resetSession();
      
      // Test 1: Original generateStory method still works
      const originalStory = await Level0StoryProcessor.generateStory(testUser);
      tests.push({
        name: 'Original generateStory method',
        passed: originalStory.content.length > 0 && originalStory.isValid,
        details: `Generated ${originalStory.content.length} pages, valid: ${originalStory.isValid}`
      });
      
      // Test 2: New continueStory method works
      const continuation = await Level0StoryProcessor.continueStory(testUser, 5);
      tests.push({
        name: 'New continueStory method',
        passed: continuation.content.length === 5,
        details: `Generated ${continuation.content.length} pages (expected 5)`
      });
      
      // Test 3: Session state progresses correctly
      const statsAfterContinuation = HierarchicalSessionTemplateManager.getSessionStats();
      tests.push({
        name: 'Session state progression',
        passed: statsAfterContinuation.baseTemplatesUsed > 0,
        details: `Base templates used: ${statsAfterContinuation.baseTemplatesUsed}, Phase: ${statsAfterContinuation.currentPhase}`
      });
      
      // Test 4: Validate story method still works
      const validation = await Level0StoryProcessor.validateStory([...originalStory.content, ...continuation.content], testUser.name);
      tests.push({
        name: 'Validate story method',
        passed: validation.isValid,
        details: `Validation passed: ${validation.isValid}, errors: ${validation.errors.length}`
      });
      
      // Test 5: Template stats method works
      const stats = await Level0StoryProcessor.getTemplateStats();
      tests.push({
        name: 'Template stats method',
        passed: stats.totalTemplates > 0 && stats.totalPages > 0,
        details: `Templates: ${stats.totalTemplates}, Pages: ${stats.totalPages}, Used: ${stats.templatesUsed}`
      });
      
    } catch (error) {
      tests.push({
        name: 'Level0StoryProcessor error handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
    
    const overallPassed = tests.every(t => t.passed);
    return { component: 'Level0StoryProcessor', tests, overallPassed };
  }
  
  /**
   * 2. Validate EnhancedTemplateManager refactoring
   */
  static async validateEnhancedTemplateManager(): Promise<SystemValidationResult> {
    console.log('🔍 Validating EnhancedTemplateManager refactoring...');
    const tests: any[] = [];
    
    try {
      // Reset for clean test
      EnhancedTemplateManager.clearSession();
      
      // Test 1: Level 0 protection still works
      try {
        await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: testUser,
          difficulty: 'beginner',
          isPremium: false
        });
        tests.push({
          name: 'Level 0 protection',
          passed: false,
          details: 'Should have thrown error for Level 0'
        });
      } catch (error) {
        tests.push({
          name: 'Level 0 protection',
          passed: true,
          details: 'Correctly throws error for Level 0'
        });
      }
      
      // Test 2: Enhanced levels generation still works
      const enhancedStory = await EnhancedTemplateManager.generateEnhancedStory({
        userInfo: testUser,
        difficulty: 'easy',
        isPremium: false
      });
      tests.push({
        name: 'Enhanced levels generation',
        passed: enhancedStory.pages.length > 0 && enhancedStory.vocabularyCompliant,
        details: `Generated ${enhancedStory.pages.length} pages, compliant: ${enhancedStory.vocabularyCompliant}`
      });
      
      // Test 3: New continueStory method works
      const continuation = await EnhancedTemplateManager.continueStory({
        userInfo: testUser,
        difficulty: 'easy',
        isPremium: false,
        targetPages: 5
      });
      tests.push({
        name: 'New continueStory method',
        passed: continuation.pages.length === 5 && continuation.metadata.extensionMethod === 'continuation-slice',
        details: `Generated ${continuation.pages.length} pages, method: ${continuation.metadata.extensionMethod}`
      });
      
      // Test 4: System analytics still work
      const analytics = EnhancedTemplateManager.getEnhancedAnalytics();
      tests.push({
        name: 'System analytics',
        passed: analytics.systemVersion === 'enhanced-unified-v1' && analytics.totalTemplates > 0,
        details: `Version: ${analytics.systemVersion}, Templates: ${analytics.totalTemplates}`
      });
      
      // Test 5: System health check works
      const health = EnhancedTemplateManager.getSystemHealth();
      tests.push({
        name: 'System health check',
        passed: health.isHealthy && health.templatesLoaded > 0,
        details: `Healthy: ${health.isHealthy}, Templates loaded: ${health.templatesLoaded}`
      });
      
    } catch (error) {
      tests.push({
        name: 'EnhancedTemplateManager error handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
    
    const overallPassed = tests.every(t => t.passed);
    return { component: 'EnhancedTemplateManager', tests, overallPassed };
  }
  
  /**
   * 3. Validate UniversalContentManager refactoring
   */
  static async validateUniversalContentManager(): Promise<SystemValidationResult> {
    console.log('🔍 Validating UniversalContentManager refactoring...');
    const tests: any[] = [];
    const config = { isPremium: false, userId: 'test-user' };
    
    try {
      // Test 1: Level 0 story generation routing
      const level0Story = await UniversalContentManager.generateStory(testUser, 'beginner', config);
      tests.push({
        name: 'Level 0 story generation',
        passed: level0Story.story.segments.length > 0 && level0Story.story.difficulty === 'beginner',
        details: `Generated ${level0Story.story.segments.length} segments, difficulty: ${level0Story.story.difficulty}`
      });
      
      // Test 2: Enhanced levels story generation routing
      const enhancedStory = await UniversalContentManager.generateStory(testUser, 'easy', config);
      tests.push({
        name: 'Enhanced levels story generation',
        passed: enhancedStory.story.segments.length > 0 && enhancedStory.story.difficulty === 'easy',
        details: `Generated ${enhancedStory.story.segments.length} segments, difficulty: ${enhancedStory.story.difficulty}`
      });
      
      // Test 3: Level 0 continuation routing (NEW REFACTORED METHOD)
      const level0Continuation = await UniversalContentManager.continueExistingStory(
        level0Story.story.segments.map(s => s.text),
        testUser,
        'beginner',
        config
      );
      const level0NewPages = level0Continuation.segments.slice(level0Story.story.segments.length);
      tests.push({
        name: 'Level 0 continuation routing',
        passed: level0NewPages.length === 5,
        details: `Added ${level0NewPages.length} new pages (expected 5)`
      });
      
      // Test 4: Enhanced levels continuation routing (NEW REFACTORED METHOD)
      const enhancedContinuation = await UniversalContentManager.continueExistingStory(
        enhancedStory.story.segments.map(s => s.text),
        testUser,
        'easy',
        config
      );
      const enhancedNewPages = enhancedContinuation.segments.slice(enhancedStory.story.segments.length);
      tests.push({
        name: 'Enhanced levels continuation routing',
        passed: enhancedNewPages.length === 5,
        details: `Added ${enhancedNewPages.length} new pages (expected 5)`
      });
      
      // Test 5: Legacy generateNewStoryWithAntiRepetition method
      const antiRepetitionStory = await UniversalContentManager.generateNewStoryWithAntiRepetition(testUser, 'medium', config);
      tests.push({
        name: 'Anti-repetition story generation',
        passed: antiRepetitionStory.segments.length > 0,
        details: `Generated ${antiRepetitionStory.segments.length} segments`
      });
      
    } catch (error) {
      tests.push({
        name: 'UniversalContentManager error handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
    
    const overallPassed = tests.every(t => t.passed);
    return { component: 'UniversalContentManager', tests, overallPassed };
  }
  
  /**
   * 4. Validate HierarchicalSessionTemplateManager integration
   */
  static async validateHierarchicalSessionManager(): Promise<SystemValidationResult> {
    console.log('🔍 Validating HierarchicalSessionTemplateManager integration...');
    const tests: any[] = [];
    
    try {
      // Reset for clean test
      HierarchicalSessionTemplateManager.clearSession();
      
      // Test 1: Session starts in base phase
      const firstSelection = HierarchicalSessionTemplateManager.getNextTemplate('beginner', false);
      tests.push({
        name: 'Session initialization',
        passed: firstSelection.phase === 'base' && firstSelection.templateIndex >= 0,
        details: `Phase: ${firstSelection.phase}, Index: ${firstSelection.templateIndex}`
      });
      
      // Test 2: Session stats tracking
      const initialStats = HierarchicalSessionTemplateManager.getSessionStats();
      tests.push({
        name: 'Session stats tracking',
        passed: initialStats.currentPhase === 'base' && initialStats.sessionAge >= 0,
        details: `Phase: ${initialStats.currentPhase}, Age: ${initialStats.sessionAge}ms`
      });
      
      // Test 3: Multiple selections advance state
      for (let i = 0; i < 5; i++) {
        HierarchicalSessionTemplateManager.getNextTemplate('beginner', false);
      }
      const laterStats = HierarchicalSessionTemplateManager.getSessionStats();
      tests.push({
        name: 'Session state progression',
        passed: laterStats.baseTemplatesUsed > initialStats.baseTemplatesUsed,
        details: `Used templates increased from ${initialStats.baseTemplatesUsed} to ${laterStats.baseTemplatesUsed}`
      });
      
      // Test 4: Extension template recording
      HierarchicalSessionTemplateManager.recordExtensionTemplateUsed(1);
      const statsAfterExtension = HierarchicalSessionTemplateManager.getSessionStats();
      tests.push({
        name: 'Extension template recording',
        passed: statsAfterExtension.extensionTemplatesUsed > 0,
        details: `Extension templates used: ${statsAfterExtension.extensionTemplatesUsed}`
      });
      
      // Test 5: Fallback recording
      HierarchicalSessionTemplateManager.recordFallbackUsed('test-fallback');
      const finalStats = HierarchicalSessionTemplateManager.getSessionStats();
      tests.push({
        name: 'Fallback recording',
        passed: finalStats.fallbacksUsed > 0,
        details: `Fallbacks used: ${finalStats.fallbacksUsed}`
      });
      
    } catch (error) {
      tests.push({
        name: 'HierarchicalSessionTemplateManager error handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
    
    const overallPassed = tests.every(t => t.passed);
    return { component: 'HierarchicalSessionTemplateManager', tests, overallPassed };
  }
  
  /**
   * 5. Integration test - End-to-end story flow
   */
  static async validateEndToEndIntegration(): Promise<SystemValidationResult> {
    console.log('🔍 Validating end-to-end integration...');
    const tests: any[] = [];
    const config = { isPremium: false, userId: 'test-user' };
    
    try {
      // Reset all systems
      Level0StoryProcessor.resetSession();
      EnhancedTemplateManager.clearSession();
      HierarchicalSessionTemplateManager.clearSession();
      
      // Test 1: Complete Level 0 flow
      const level0Initial = await UniversalContentManager.generateStory(testUser, 'beginner', config);
      const level0Continue1 = await UniversalContentManager.continueExistingStory(
        level0Initial.story.segments.map(s => s.text), testUser, 'beginner', config
      );
      const level0Continue2 = await UniversalContentManager.continueExistingStory(
        level0Continue1.segments.map(s => s.text), testUser, 'beginner', config
      );
      
      const level0TotalPages = level0Continue2.segments.length;
      const level0InitialPages = level0Initial.story.segments.length;
      const level0AddedPages = level0TotalPages - level0InitialPages;
      
      tests.push({
        name: 'End-to-end Level 0 flow',
        passed: level0AddedPages === 10, // Two continuations of 5 pages each
        details: `Initial: ${level0InitialPages}, Added: ${level0AddedPages}, Total: ${level0TotalPages}`
      });
      
      // Test 2: Complete Enhanced levels flow
      const enhancedInitial = await UniversalContentManager.generateStory(testUser, 'easy', config);
      const enhancedContinue1 = await UniversalContentManager.continueExistingStory(
        enhancedInitial.story.segments.map(s => s.text), testUser, 'easy', config
      );
      const enhancedContinue2 = await UniversalContentManager.continueExistingStory(
        enhancedContinue1.segments.map(s => s.text), testUser, 'easy', config
      );
      
      const enhancedTotalPages = enhancedContinue2.segments.length;
      const enhancedInitialPages = enhancedInitial.story.segments.length;
      const enhancedAddedPages = enhancedTotalPages - enhancedInitialPages;
      
      tests.push({
        name: 'End-to-end Enhanced levels flow',
        passed: enhancedAddedPages === 10, // Two continuations of 5 pages each
        details: `Initial: ${enhancedInitialPages}, Added: ${enhancedAddedPages}, Total: ${enhancedTotalPages}`
      });
      
      // Test 3: Cross-difficulty consistency
      const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
      let allConsistent = true;
      const difficultyResults: string[] = [];
      
      for (const difficulty of difficulties) {
        const story = await UniversalContentManager.generateStory(testUser, difficulty, config);
        const continuation = await UniversalContentManager.continueExistingStory(
          story.story.segments.map(s => s.text), testUser, difficulty, config
        );
        const addedPages = continuation.segments.length - story.story.segments.length;
        
        if (addedPages !== 5) {
          allConsistent = false;
        }
        difficultyResults.push(`${difficulty}: +${addedPages} pages`);
      }
      
      tests.push({
        name: 'Cross-difficulty continuation consistency',
        passed: allConsistent,
        details: difficultyResults.join(', ')
      });
      
      // Test 4: Session isolation between levels
      const level0Stats = HierarchicalSessionTemplateManager.getSessionStats();
      const enhancedHealth = EnhancedTemplateManager.getSystemHealth();
      
      tests.push({
        name: 'Session isolation',
        passed: level0Stats.baseTemplatesUsed > 0 && enhancedHealth.isHealthy,
        details: `Level 0 templates used: ${level0Stats.baseTemplatesUsed}, Enhanced healthy: ${enhancedHealth.isHealthy}`
      });
      
    } catch (error) {
      tests.push({
        name: 'End-to-end integration error handling',
        passed: false,
        details: `Error: ${error}`
      });
    }
    
    const overallPassed = tests.every(t => t.passed);
    return { component: 'End-to-End Integration', tests, overallPassed };
  }
  
  /**
   * Run complete system validation
   */
  static async runCompleteValidation(): Promise<void> {
    console.log('🚀 STARTING COMPREHENSIVE SYSTEM VALIDATION');
    console.log('============================================');
    
    const validationResults = await Promise.all([
      this.validateLevel0StoryProcessor(),
      this.validateEnhancedTemplateManager(),
      this.validateUniversalContentManager(),
      this.validateHierarchicalSessionManager(),
      this.validateEndToEndIntegration()
    ]);
    
    // Summary
    console.log('\n📊 VALIDATION RESULTS SUMMARY');
    console.log('==============================');
    
    let allPassed = true;
    let totalTests = 0;
    let passedTests = 0;
    
    validationResults.forEach(result => {
      const componentPassed = result.tests.filter(t => t.passed).length;
      const componentTotal = result.tests.length;
      totalTests += componentTotal;
      passedTests += componentPassed;
      
      if (!result.overallPassed) {
        allPassed = false;
      }
      
      console.log(`\n${result.overallPassed ? '✅' : '❌'} ${result.component}: ${componentPassed}/${componentTotal} tests passed`);
      
      result.tests.forEach(test => {
        console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details}`);
      });
    });
    
    console.log('\n🎯 FINAL VALIDATION SUMMARY');
    console.log('============================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (allPassed) {
      console.log('\n🎉 ALL REFACTORING WORK VALIDATED SUCCESSFULLY!');
      console.log('✅ Level0StoryProcessor refactoring: WORKING');
      console.log('✅ EnhancedTemplateManager refactoring: WORKING');
      console.log('✅ UniversalContentManager refactoring: WORKING');
      console.log('✅ HierarchicalSessionTemplateManager integration: WORKING');
      console.log('✅ End-to-end integration: WORKING');
      console.log('\n🚀 SYSTEM IS FULLY FUNCTIONAL AND READY FOR PRODUCTION');
    } else {
      console.log('\n❌ VALIDATION FAILED - ISSUES DETECTED');
      console.log('🔧 Review the failed tests above for specific issues');
    }
  }
}

// Export for easy use
export const validateAllRefactoring = () => ComprehensiveSystemValidator.runCompleteValidation();