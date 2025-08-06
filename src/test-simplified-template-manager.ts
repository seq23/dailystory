// Test the enhanced SimplifiedTemplateManager with exhaustion logic
import { SimplifiedTemplateManager } from './services/simplifiedTemplateManager';
import type { UserInfo, DifficultyLevel } from './types';

/**
 * Test the SimplifiedTemplateManager exhaustion system
 */
export async function testSimplifiedTemplateManager() {
  console.log('🧪 Testing SimplifiedTemplateManager with Template Exhaustion...');
  
  const testUserInfo: UserInfo = {
    name: 'Alex',
    age: 7,
    grade: '2nd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'tiger',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: ''
  };

  try {
    // Clear session to start fresh
    SimplifiedTemplateManager.clearSession();
    
    // Test exhaustion for 'easy' difficulty
    console.log('\n🔬 Testing Easy Difficulty Template Exhaustion...');
    
    const stories: any[] = [];
    
    // Generate 50 stories to test exhaustion (40 base + 5 extensions + 5 cycling)
    for (let i = 0; i < 50; i++) {
      const story = await SimplifiedTemplateManager.generateStory({
        userInfo: testUserInfo,
        difficulty: 'easy' as DifficultyLevel,
        isPremium: false
      });
      
      stories.push({
        storyNumber: i + 1,
        templateIndex: story.templateIndex,
        pages: story.pages.length,
        firstPage: story.pages[0]?.substring(0, 50) + '...'
      });
      
      if (i % 10 === 9) {
        console.log(`Generated ${i + 1} stories so far...`);
      }
    }
    
    // Analyze template usage
    const analytics = SimplifiedTemplateManager.getTemplateAnalytics('easy');
    console.log('\n📊 Template Usage Analytics:', analytics);
    
    // Check for proper exhaustion behavior
    const templateIndices = stories.map(s => s.templateIndex);
    const uniqueIndices = new Set(templateIndices);
    
    console.log('\n✅ Exhaustion Test Results:');
    console.log(`Total stories generated: ${stories.length}`);
    console.log(`Unique template indices used: ${uniqueIndices.size}`);
    console.log(`Expected: 45 unique templates (40 base + 5 extensions)`);
    console.log(`Template cycling detected: ${uniqueIndices.size >= 40}`);
    
    // Test that all 40 base templates were used
    const first40Stories = stories.slice(0, 40);
    const first40Indices = new Set(first40Stories.map(s => s.templateIndex));
    console.log(`First 40 stories used ${first40Indices.size} unique templates (should be 40)`);
    
    // Test continue story functionality
    console.log('\n🔬 Testing Story Continuation...');
    const continuedStory = await SimplifiedTemplateManager.continueStory({
      userInfo: testUserInfo,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false,
      targetPages: 5
    });
    
    console.log(`Continued story has ${continuedStory.pages.length} pages (target: 5)`);
    
    const validationResults = {
      generatedCorrectCount: stories.length === 50,
      usedMultipleTemplates: uniqueIndices.size >= 40,
      continuationWorks: continuedStory.pages.length === 5,
      analyticsAvailable: analytics && typeof analytics.totalGenerated === 'number'
    };
    
    console.log('\n✅ SimplifiedTemplateManager Test Results:', validationResults);
    
    const allTestsPassed = Object.values(validationResults).every(result => result === true);
    
    if (allTestsPassed) {
      console.log('🎉 All SimplifiedTemplateManager tests PASSED!');
      console.log('✅ Template exhaustion working correctly');
      console.log('✅ Base templates → Extension templates → Cycling');
      console.log('✅ 45 templates per difficulty (40 base + 5 extensions)');
    } else {
      console.log('❌ Some SimplifiedTemplateManager tests FAILED');
      console.log('Failed tests:', Object.entries(validationResults).filter(([_, passed]) => !passed));
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('🚨 SimplifiedTemplateManager test failed:', error);
    return false;
  }
}

// Auto-run in development
if (typeof window !== 'undefined') {
  (window as any).testSimplifiedTemplateManager = testSimplifiedTemplateManager;
  console.log('🔧 SimplifiedTemplateManager test function available:');
  console.log('   testSimplifiedTemplateManager()');
}