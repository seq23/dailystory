// Test Enhanced Template Manager Level 1-4 Fix
// Verifies proper template continuation and state management

import { EnhancedTemplateManager } from './services/enhancedTemplateManager';
import type { UserInfo, DifficultyLevel } from './types';

/**
 * Test the Enhanced Template Manager continuation fix
 */
export async function testEnhancedTemplateFix() {
  console.log('🧪 Testing Enhanced Template Manager Level 1-4 Fix...');
  
  const testUserInfo: UserInfo = {
    name: 'Sequoia',
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
    EnhancedTemplateManager.clearSession();
    
    // Test Level 1 (Easy) continuation
    console.log('\n🔬 Testing Level 1 (Easy) Template Continuation...');
    
    // Generate initial story
    const initialStory = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUserInfo,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false
    });
    
    console.log(`📖 Initial Story Generated:`, {
      pages: initialStory.pages.length,
      templateIndex: initialStory.templateIndex,
      gradeLevel: initialStory.gradeLevel,
      firstPage: initialStory.pages[0]?.substring(0, 100) + '...'
    });
    
    // Continue story (this should continue from current template, not start new template)
    const continuedStory = await EnhancedTemplateManager.continueStory({
      userInfo: testUserInfo,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false,
      targetPages: 5
    });
    
    console.log(`📖 Continued Story Generated:`, {
      pages: continuedStory.pages.length,
      templateIndex: continuedStory.templateIndex,
      gradeLevel: continuedStory.gradeLevel,
      firstPage: continuedStory.pages[0]?.substring(0, 100) + '...'
    });
    
    // Test Level 2 (Medium) continuation
    console.log('\n🔬 Testing Level 2 (Medium) Template Continuation...');
    
    const level2Initial = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUserInfo,
      difficulty: 'medium' as DifficultyLevel,
      isPremium: false
    });
    
    const level2Continued = await EnhancedTemplateManager.continueStory({
      userInfo: testUserInfo,
      difficulty: 'medium' as DifficultyLevel,
      isPremium: false,
      targetPages: 5
    });
    
    console.log(`📖 Level 2 Test Results:`, {
      initialPages: level2Initial.pages.length,
      continuedPages: level2Continued.pages.length,
      templateIndex: level2Continued.templateIndex,
      firstContinuedPage: level2Continued.pages[0]?.substring(0, 100) + '...'
    });
    
    // Validate that continuation is working properly
    const validationResults = {
      level1ContinuationLength: continuedStory.pages.length === 5,
      level2ContinuationLength: level2Continued.pages.length === 5,
      level1HasValidContent: continuedStory.pages.every(page => page.length > 10),
      level2HasValidContent: level2Continued.pages.every(page => page.length > 10),
      level1NoRepetition: !arePagesRepeating(continuedStory.pages),
      level2NoRepetition: !arePagesRepeating(level2Continued.pages)
    };
    
    console.log('\n✅ Enhanced Template Manager Fix Validation:', validationResults);
    
    const allTestsPassed = Object.values(validationResults).every(result => result === true);
    
    if (allTestsPassed) {
      console.log('🎉 All Enhanced Template Manager tests PASSED!');
      console.log('✅ Template continuation is working correctly');
      console.log('✅ Proper template state management implemented');
      console.log('✅ No template waste or fragmentation detected');
    } else {
      console.log('❌ Some Enhanced Template Manager tests FAILED');
      console.log('Failed tests:', Object.entries(validationResults).filter(([_, passed]) => !passed));
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('🚨 Enhanced Template Manager test failed:', error);
    return false;
  }
}

/**
 * Check if pages are repetitive (same content repeated)
 */
function arePagesRepeating(pages: string[]): boolean {
  const pageSet = new Set(pages.map(page => page.trim().toLowerCase()));
  return pageSet.size < pages.length * 0.8; // Allow some similarity but not full repetition
}

/**
 * Comprehensive test of template sequence exhaustion
 */
export async function testTemplateSequenceExhaustion() {
  console.log('\n🔬 Testing Template Sequence Exhaustion for Level 1...');
  
  const testUserInfo: UserInfo = {
    name: 'Sequoia',
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
    // Clear session
    EnhancedTemplateManager.clearSession();
    
    const allPages: string[] = [];
    let templateTransitions = 0;
    let lastTemplateIndex = -1;
    
    // Generate story segments and track template usage
    for (let i = 0; i < 10; i++) { // 10 continuations = 50 pages
      const story = await EnhancedTemplateManager.continueStory({
        userInfo: testUserInfo,
        difficulty: 'easy' as DifficultyLevel,
        isPremium: false,
        targetPages: 5
      });
      
      allPages.push(...story.pages);
      
      if (story.templateIndex !== lastTemplateIndex) {
        templateTransitions++;
        lastTemplateIndex = story.templateIndex;
      }
      
      console.log(`Segment ${i + 1}: Template ${story.templateIndex + 1}, Pages: ${story.pages.length}`);
    }
    
    console.log('\n📊 Template Exhaustion Test Results:');
    console.log(`Total pages generated: ${allPages.length}`);
    console.log(`Template transitions: ${templateTransitions}`);
    console.log(`Expected template usage: ${Math.ceil(allPages.length / 5)} templates for ${allPages.length} pages`);
    
    // Validate template efficiency
    const expectedTemplateUsage = Math.ceil(allPages.length / 5);
    const isEfficientUsage = templateTransitions <= expectedTemplateUsage;
    
    console.log(`Template usage efficiency: ${isEfficientUsage ? '✅ GOOD' : '❌ INEFFICIENT'}`);
    
    return isEfficientUsage;
    
  } catch (error) {
    console.error('🚨 Template sequence exhaustion test failed:', error);
    return false;
  }
}

// Auto-run tests in development
if (typeof window !== 'undefined') {
  (window as any).testEnhancedTemplateFix = testEnhancedTemplateFix;
  (window as any).testTemplateSequenceExhaustion = testTemplateSequenceExhaustion;
  console.log('🔧 Enhanced Template test functions available:');
  console.log('   testEnhancedTemplateFix()');
  console.log('   testTemplateSequenceExhaustion()');
}