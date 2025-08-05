// Story Template Continuation Tester
// Tests that both initial and continuation stories follow the same template exhaustion patterns

import { Level0StoryProcessor } from '@/services/level0StoryProcessor';
import { EnhancedTemplateManager } from '@/services/enhancedTemplateManager';
import { UniversalContentManager } from '@/services/universalContentManager';
import { HierarchicalSessionTemplateManager } from '@/services/hierarchicalSessionTemplateManager';
import type { UserInfo, DifficultyLevel } from '@/types';

// Test user data
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

interface ContinuationTestResult {
  level: string;
  initialStory: {
    pages: string[];
    templateInfo?: any;
  };
  continuation1: {
    pages: string[];
    templateInfo?: any;
  };
  continuation2: {
    pages: string[];
    templateInfo?: any;
  };
  sessionStats: any;
  templateExhaustionWorking: boolean;
  continuationConsistent: boolean;
  issues: string[];
}

export class StoryTemplateContinuationTester {
  /**
   * Test Level 0 continuation and template exhaustion
   */
  static async testLevel0Continuation(): Promise<ContinuationTestResult> {
    console.log('🧪 Testing Level 0 story continuation and template exhaustion...');
    
    // Reset session to start fresh
    Level0StoryProcessor.resetSession();
    
    const issues: string[] = [];
    
    try {
      // Generate initial story
      const initialResult = await Level0StoryProcessor.generateStory(testUser);
      
      // Get session stats after initial story
      const statsAfterInitial = HierarchicalSessionTemplateManager.getSessionStats();
      
      // Generate first continuation
      const continuation1Result = await Level0StoryProcessor.continueStory(testUser, 5);
      
      // Get session stats after first continuation
      const statsAfterContinuation1 = HierarchicalSessionTemplateManager.getSessionStats();
      
      // Generate second continuation
      const continuation2Result = await Level0StoryProcessor.continueStory(testUser, 5);
      
      // Get final session stats
      const finalStats = HierarchicalSessionTemplateManager.getSessionStats();
      
      // Check template exhaustion progression
      const templateExhaustionWorking = (
        statsAfterContinuation1.baseTemplatesUsed >= statsAfterInitial.baseTemplatesUsed &&
        finalStats.baseTemplatesUsed >= statsAfterContinuation1.baseTemplatesUsed
      );
      
      if (!templateExhaustionWorking) {
        issues.push('Template exhaustion not progressing correctly');
      }
      
      // Check continuation consistency (exactly 5 pages each)
      const continuationConsistent = (
        continuation1Result.content.length === 5 &&
        continuation2Result.content.length === 5
      );
      
      if (!continuationConsistent) {
        issues.push(`Continuation page count inconsistent: ${continuation1Result.content.length}, ${continuation2Result.content.length}`);
      }
      
      // Check that pages don't repeat exactly
      const allPages = [
        ...initialResult.content,
        ...continuation1Result.content,
        ...continuation2Result.content
      ];
      const uniquePages = new Set(allPages);
      
      if (uniquePages.size !== allPages.length) {
        issues.push('Some pages are repeating exactly');
      }
      
      return {
        level: 'Level 0 (Beginner)',
        initialStory: {
          pages: initialResult.content,
          templateInfo: { templateIndex: initialResult.templateIndex, isValid: initialResult.isValid }
        },
        continuation1: {
          pages: continuation1Result.content,
          templateInfo: { isValid: continuation1Result.isValid }
        },
        continuation2: {
          pages: continuation2Result.content,
          templateInfo: { isValid: continuation2Result.isValid }
        },
        sessionStats: finalStats,
        templateExhaustionWorking,
        continuationConsistent,
        issues
      };
      
    } catch (error) {
      issues.push(`Level 0 test failed: ${error}`);
      return {
        level: 'Level 0 (Beginner)',
        initialStory: { pages: [] },
        continuation1: { pages: [] },
        continuation2: { pages: [] },
        sessionStats: {},
        templateExhaustionWorking: false,
        continuationConsistent: false,
        issues
      };
    }
  }
  
  /**
   * Test Levels 1-4 continuation and template exhaustion
   */
  static async testEnhancedLevelsContinuation(difficulty: DifficultyLevel): Promise<ContinuationTestResult> {
    console.log(`🧪 Testing ${difficulty} level story continuation and template exhaustion...`);
    
    // Reset session to start fresh
    EnhancedTemplateManager.clearSession();
    
    const issues: string[] = [];
    const config = { isPremium: false, userId: 'test-user' };
    
    try {
      // Generate initial story using UniversalContentManager
      const initialStoryResult = await UniversalContentManager.generateStory(testUser, difficulty, config);
      const initialPages = initialStoryResult.story.segments.map(s => s.text);
      
      // Generate first continuation
      const continuation1Story = await UniversalContentManager.continueExistingStory(
        initialPages,
        testUser,
        difficulty,
        config
      );
      const continuation1Pages = continuation1Story.segments.slice(initialPages.length).map(s => s.text);
      
      // Generate second continuation  
      const allPagesAfterFirst = continuation1Story.segments.map(s => s.text);
      const continuation2Story = await UniversalContentManager.continueExistingStory(
        allPagesAfterFirst,
        testUser,
        difficulty,
        config
      );
      const continuation2Pages = continuation2Story.segments.slice(allPagesAfterFirst.length).map(s => s.text);
      
      // Check continuation consistency (exactly 5 pages each)
      const continuationConsistent = (
        continuation1Pages.length === 5 &&
        continuation2Pages.length === 5
      );
      
      if (!continuationConsistent) {
        issues.push(`Continuation page count inconsistent: ${continuation1Pages.length}, ${continuation2Pages.length}`);
      }
      
      // Check that pages don't repeat exactly
      const allPages = [
        ...initialPages,
        ...continuation1Pages,
        ...continuation2Pages
      ];
      const uniquePages = new Set(allPages);
      
      if (uniquePages.size !== allPages.length) {
        issues.push('Some pages are repeating exactly');
      }
      
      // For enhanced levels, template exhaustion is managed differently
      // We assume it's working if we get different content
      const templateExhaustionWorking = uniquePages.size > allPages.length * 0.8;
      
      return {
        level: `${difficulty} (Enhanced)`,
        initialStory: {
          pages: initialPages,
          templateInfo: { pageCount: initialPages.length }
        },
        continuation1: {
          pages: continuation1Pages,
          templateInfo: { pageCount: continuation1Pages.length }
        },
        continuation2: {
          pages: continuation2Pages,
          templateInfo: { pageCount: continuation2Pages.length }
        },
        sessionStats: { note: 'Enhanced levels use different session tracking' },
        templateExhaustionWorking,
        continuationConsistent,
        issues
      };
      
    } catch (error) {
      issues.push(`${difficulty} test failed: ${error}`);
      return {
        level: `${difficulty} (Enhanced)`,
        initialStory: { pages: [] },
        continuation1: { pages: [] },
        continuation2: { pages: [] },
        sessionStats: {},
        templateExhaustionWorking: false,
        continuationConsistent: false,
        issues
      };
    }
  }
  
  /**
   * Run comprehensive tests for all levels
   */
  static async runAllContinuationTests(): Promise<ContinuationTestResult[]> {
    console.log('🧪 Running comprehensive story continuation tests...');
    
    const results: ContinuationTestResult[] = [];
    
    // Test Level 0
    const level0Result = await this.testLevel0Continuation();
    results.push(level0Result);
    
    // Test Enhanced Levels 1-4
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    
    for (const difficulty of difficulties) {
      const enhancedResult = await this.testEnhancedLevelsContinuation(difficulty);
      results.push(enhancedResult);
    }
    
    // Summary
    const totalTests = results.length;
    const passedTests = results.filter(r => r.issues.length === 0).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📊 Continuation Test Summary:`);
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${totalTests}`);
    
    if (failedTests > 0) {
      console.log('❌ Issues found:');
      results.forEach(result => {
        if (result.issues.length > 0) {
          console.log(`  ${result.level}: ${result.issues.join(', ')}`);
        }
      });
    } else {
      console.log('✅ All continuation tests passed!');
    }
    
    return results;
  }
  
  /**
   * Quick test to verify the fixes work
   */
  static async quickVerificationTest(): Promise<boolean> {
    console.log('⚡ Running quick verification test...');
    
    try {
      // Test Level 0 continuation uses correct method
      Level0StoryProcessor.resetSession();
      const level0Initial = await Level0StoryProcessor.generateStory(testUser);
      const level0Continuation = await Level0StoryProcessor.continueStory(testUser, 5);
      
      const level0Working = (
        level0Initial.content.length > 0 &&
        level0Continuation.content.length === 5
      );
      
      // Test Enhanced levels continuation uses correct method
      EnhancedTemplateManager.clearSession();
      const enhancedContinuation = await EnhancedTemplateManager.continueStory({
        userInfo: testUser,
        difficulty: 'easy',
        isPremium: false,
        targetPages: 5
      });
      
      const enhancedWorking = enhancedContinuation.pages.length === 5;
      
      const allWorking = level0Working && enhancedWorking;
      
      console.log(`⚡ Quick test result: ${allWorking ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Level 0: ${level0Working ? '✅' : '❌'}`);
      console.log(`  Enhanced: ${enhancedWorking ? '✅' : '❌'}`);
      
      return allWorking;
      
    } catch (error) {
      console.error('⚡ Quick test failed:', error);
      return false;
    }
  }
}

// Export a simple test runner
export const runContinuationTests = () => StoryTemplateContinuationTester.runAllContinuationTests();
export const quickTest = () => StoryTemplateContinuationTester.quickVerificationTest();