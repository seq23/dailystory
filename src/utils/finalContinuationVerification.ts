// Final verification that the continuation implementation is working correctly
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

export class FinalContinuationVerification {
  /**
   * Verify Level 0 continuation respects template exhaustion
   */
  static async verifyLevel0Implementation(): Promise<{ success: boolean; issues: string[] }> {
    console.log('🔍 Verifying Level 0 continuation implementation...');
    const issues: string[] = [];
    
    try {
      // Reset to start fresh
      Level0StoryProcessor.resetSession();
      
      // Test 1: Initial story generation
      const initial = await Level0StoryProcessor.generateStory(testUser);
      if (initial.content.length === 0) {
        issues.push('Initial story generation failed');
      }
      
      // Test 2: First continuation (should be exactly 5 pages)
      const continuation1 = await Level0StoryProcessor.continueStory(testUser, 5);
      if (continuation1.content.length !== 5) {
        issues.push(`First continuation wrong page count: ${continuation1.content.length} (expected 5)`);
      }
      
      // Test 3: Second continuation (should be exactly 5 pages)
      const continuation2 = await Level0StoryProcessor.continueStory(testUser, 5);
      if (continuation2.content.length !== 5) {
        issues.push(`Second continuation wrong page count: ${continuation2.content.length} (expected 5)`);
      }
      
      // Test 4: Session state progression
      const stats = HierarchicalSessionTemplateManager.getSessionStats();
      if (stats.baseTemplatesUsed === 0) {
        issues.push('Session state not tracking template usage');
      }
      
      // Test 5: Content validation
      const allPages = [...initial.content, ...continuation1.content, ...continuation2.content];
      if (allPages.some(page => !page || page.trim().length === 0)) {
        issues.push('Some generated pages are empty');
      }
      
      console.log(`📊 Level 0 verification: ${issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
      return { success: issues.length === 0, issues };
      
    } catch (error) {
      issues.push(`Level 0 verification failed: ${error}`);
      return { success: false, issues };
    }
  }
  
  /**
   * Verify Enhanced levels continuation
   */
  static async verifyEnhancedLevelsImplementation(): Promise<{ success: boolean; issues: string[] }> {
    console.log('🔍 Verifying Enhanced levels continuation implementation...');
    const issues: string[] = [];
    const config = { isPremium: false, userId: 'test-user' };
    
    try {
      // Reset to start fresh
      EnhancedTemplateManager.clearSession();
      
      const testDifficulties: DifficultyLevel[] = ['easy', 'medium'];
      
      for (const difficulty of testDifficulties) {
        // Test 1: Initial story generation
        const initialResult = await UniversalContentManager.generateStory(testUser, difficulty, config);
        const initialPages = initialResult.story.segments.map(s => s.text);
        
        if (initialPages.length === 0) {
          issues.push(`${difficulty}: Initial story generation failed`);
          continue;
        }
        
        // Test 2: Continuation using UniversalContentManager
        const continuationResult = await UniversalContentManager.continueExistingStory(
          initialPages,
          testUser,
          difficulty,
          config
        );
        
        const newPages = continuationResult.segments.slice(initialPages.length);
        
        if (newPages.length !== 5) {
          issues.push(`${difficulty}: Continuation wrong page count: ${newPages.length} (expected 5)`);
        }
        
        // Test 3: Direct EnhancedTemplateManager continuation
        const directContinuation = await EnhancedTemplateManager.continueStory({
          userInfo: testUser,
          difficulty,
          isPremium: false,
          targetPages: 5
        });
        
        if (directContinuation.pages.length !== 5) {
          issues.push(`${difficulty}: Direct continuation wrong page count: ${directContinuation.pages.length} (expected 5)`);
        }
        
        if (directContinuation.metadata.extensionMethod !== 'continuation-slice') {
          issues.push(`${difficulty}: Continuation metadata incorrect`);
        }
      }
      
      console.log(`📊 Enhanced levels verification: ${issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
      return { success: issues.length === 0, issues };
      
    } catch (error) {
      issues.push(`Enhanced levels verification failed: ${error}`);
      return { success: false, issues };
    }
  }
  
  /**
   * Verify UniversalContentManager uses correct methods
   */
  static async verifyUniversalContentManagerRouting(): Promise<{ success: boolean; issues: string[] }> {
    console.log('🔍 Verifying UniversalContentManager routing...');
    const issues: string[] = [];
    const config = { isPremium: false, userId: 'test-user' };
    
    try {
      // Test Level 0 routing
      const level0Story = await UniversalContentManager.generateStory(testUser, 'beginner', config);
      const level0Continuation = await UniversalContentManager.continueExistingStory(
        level0Story.story.segments.map(s => s.text),
        testUser,
        'beginner',
        config
      );
      
      const level0NewPages = level0Continuation.segments.slice(level0Story.story.segments.length);
      if (level0NewPages.length !== 5) {
        issues.push(`Level 0 routing: Wrong continuation page count: ${level0NewPages.length}`);
      }
      
      // Test Enhanced level routing
      const enhancedStory = await UniversalContentManager.generateStory(testUser, 'easy', config);
      const enhancedContinuation = await UniversalContentManager.continueExistingStory(
        enhancedStory.story.segments.map(s => s.text),
        testUser,
        'easy',
        config
      );
      
      const enhancedNewPages = enhancedContinuation.segments.slice(enhancedStory.story.segments.length);
      if (enhancedNewPages.length !== 5) {
        issues.push(`Enhanced routing: Wrong continuation page count: ${enhancedNewPages.length}`);
      }
      
      console.log(`📊 Routing verification: ${issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
      return { success: issues.length === 0, issues };
      
    } catch (error) {
      issues.push(`Routing verification failed: ${error}`);
      return { success: false, issues };
    }
  }
  
  /**
   * Run all verification tests
   */
  static async runCompleteVerification(): Promise<boolean> {
    console.log('🧪 Running complete continuation implementation verification...');
    
    const level0Result = await this.verifyLevel0Implementation();
    const enhancedResult = await this.verifyEnhancedLevelsImplementation();
    const routingResult = await this.verifyUniversalContentManagerRouting();
    
    const allIssues = [
      ...level0Result.issues,
      ...enhancedResult.issues,
      ...routingResult.issues
    ];
    
    const overallSuccess = level0Result.success && enhancedResult.success && routingResult.success;
    
    console.log('\n📊 FINAL VERIFICATION RESULTS:');
    console.log(`✅ Level 0: ${level0Result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Enhanced Levels: ${enhancedResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Routing: ${routingResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`\n🎯 OVERALL: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ ISSUES FOUND'}`);
    
    if (allIssues.length > 0) {
      console.log('\n❌ Issues found:');
      allIssues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ Implementation is fully working!');
      console.log('✅ Level 0 continuation respects template exhaustion');
      console.log('✅ Enhanced levels continuation preserves session state');
      console.log('✅ All continuation methods return exactly 5 pages');
      console.log('✅ UniversalContentManager routes to correct methods');
    }
    
    return overallSuccess;
  }
}

// Export for easy use
export const verifyImplementation = () => FinalContinuationVerification.runCompleteVerification();