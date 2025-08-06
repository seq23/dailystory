// Test Level 0 Template Exhaustion Fix
import { Level0StoryProcessor } from './services/level0StoryProcessor';
import { HierarchicalSessionTemplateManager } from './services/hierarchicalSessionTemplateManager';
import type { UserInfo } from './types';

export async function testLevel0TemplateFix() {
  console.log('🧪 Testing Level 0 Template Exhaustion Fix...');
  
  // Clear any existing session
  HierarchicalSessionTemplateManager.clearSession();
  
  // Test user data
  const testUser: UserInfo = {
    name: 'TestUser',
    age: 6,
    grade: 'PreK',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'girl', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'cat',
    hobbies: 'reading',
    favoriteFood: 'cookies',
    specialRequest: 'fun adventure stories'
  };

  try {
    // Test 1: Generate initial story
    console.log('🔍 Test 1: Generating initial story...');
    const initialStory = await Level0StoryProcessor.generateStory(testUser);
    console.log(`✅ Initial story generated: ${initialStory.content.length} pages`);
    console.log('First page:', initialStory.content[0]);
    
    // Test 2: Continue story multiple times to test template progression
    console.log('🔍 Test 2: Testing template progression with multiple continuations...');
    let totalPagesGenerated = initialStory.content.length;
    let continuationCount = 0;
    
    // Continue until we hit fallback (should happen after 20 base + 5 extension = 25 templates × 5 pages = 125 pages)
    while (continuationCount < 30) { // Safety limit
      const sessionStats = HierarchicalSessionTemplateManager.getSessionStats();
      console.log(`📊 Before continuation ${continuationCount + 1}:`, {
        phase: sessionStats.currentPhase,
        baseUsed: sessionStats.baseTemplatesUsed,
        extensionUsed: sessionStats.extensionTemplatesUsed,
        fallbackUsed: sessionStats.fallbacksUsed,
        totalPages: totalPagesGenerated
      });
      
      // If we're in fallback phase, we've successfully exhausted templates
      if (sessionStats.currentPhase === 'fallback') {
        console.log(`🎉 Templates properly exhausted after ${totalPagesGenerated} pages!`);
        console.log(`Expected: ~125 pages (20 base × 5 + 5 extension × 5)`);
        console.log(`Actual: ${totalPagesGenerated} pages`);
        break;
      }
      
      const continuation = await Level0StoryProcessor.continueStory(testUser, 5);
      totalPagesGenerated += continuation.content.length;
      continuationCount++;
      
      console.log(`✅ Continuation ${continuationCount}: ${continuation.content.length} pages added`);
      console.log('Sample page:', continuation.content[0]);
    }
    
    // Test 3: Final verification
    const finalStats = HierarchicalSessionTemplateManager.getSessionStats();
    console.log('📈 Final Statistics:', {
      totalPagesGenerated,
      continuationsRun: continuationCount,
      currentPhase: finalStats.currentPhase,
      baseTemplatesUsed: finalStats.baseTemplatesUsed,
      extensionTemplatesUsed: finalStats.extensionTemplatesUsed,
      fallbacksUsed: finalStats.fallbacksUsed
    });
    
    // Validate fix
    const isFixed = totalPagesGenerated >= 100 && finalStats.currentPhase === 'fallback';
    
    if (isFixed) {
      console.log('🎉 LEVEL 0 TEMPLATE FIX: SUCCESS!');
      console.log(`✅ Templates properly exhausted after ${totalPagesGenerated} pages (expected ~125)`);
      console.log(`✅ Base templates used: ${finalStats.baseTemplatesUsed} (expected 20)`);
      console.log(`✅ Extension templates used: ${finalStats.extensionTemplatesUsed} (expected 5)`);
      console.log(`✅ Now in fallback phase as expected`);
    } else {
      console.log('❌ LEVEL 0 TEMPLATE FIX: FAILED!');
      console.log(`❌ Only ${totalPagesGenerated} pages generated before fallback`);
      console.log(`❌ Expected at least 100 pages`);
    }
    
    return isFixed;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run test in development
if (typeof window !== 'undefined') {
  (window as any).testLevel0TemplateFix = testLevel0TemplateFix;
  console.log('🔧 Test function available: testLevel0TemplateFix()');
}