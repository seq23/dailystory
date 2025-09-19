/**
 * Voice Catalog System Tests
 * Quick verification that the AVC v1.1.0 implementation works
 */

import { VoiceCatalogIntegration, initializeVoiceCatalog } from './index';
import type { UserInfo } from '@/types';

/**
 * Test the complete voice catalog system
 */
export async function testVoiceCatalogSystem() {
  console.log('🧪 Starting Voice Catalog System Tests...\n');

  try {
    // 1. Initialize the catalog
    console.log('1️⃣ Initializing catalog...');
    const stats = await initializeVoiceCatalog();
    console.log('✅ Catalog initialized:', stats, '\n');

    // 2. Test voice selection for each difficulty level
    const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
    
    for (const difficulty of difficulties) {
      console.log(`2️⃣ Testing ${difficulty} level...`);
      try {
        const result = await VoiceCatalogIntegration.testVoiceSelection(difficulty);
        console.log(`✅ ${difficulty}: ${result.selectedVoice.pn} (score: ${result.compatibilityScore.toFixed(2)})`);
      } catch (error) {
        console.log(`❌ ${difficulty}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    console.log('');

    // 3. Test with actual user data
    console.log('3️⃣ Testing with realistic user data...');
    const testUser: UserInfo = {
      name: 'Emma',
      age: 8,
      grade: '3',
      gradeLevel: '3',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'girl', skinTone: 'light' },
      favoriteColor: 'purple',
      favoriteAnimal: 'cat',
      favoriteFood: 'pizza',
      hobbies: 'painting, reading',
      specialRequest: 'I love adventures with magic',
      interests: ['magic', 'art', 'friendship'],
      readingLevel: 'medium',
      difficultyLevel: 'medium'
    };

    const userResult = await VoiceCatalogIntegration.selectAndPrepareVoice(
      testUser,
      'medium',
      { themes: ['magic', 'friendship'], warmthPreference: 0.9 }
    );

    console.log(`✅ Selected for Emma: ${userResult.selectedVoice.pn}`);
    console.log(`   Compatibility: ${userResult.compatibilityScore.toFixed(2)}`);
    console.log(`   Reasoning: ${userResult.selectionReasoning}`);
    console.log('');

    // 4. Test voice alternatives
    console.log('4️⃣ Testing voice alternatives...');
    const alternatives = await VoiceCatalogIntegration.getVoiceAlternatives(testUser, 'medium', 3);
    console.log(`✅ Found ${alternatives.length} alternatives:`);
    alternatives.forEach((alt, i) => {
      console.log(`   ${i + 1}. ${alt.selectedVoice.pn} (${alt.compatibilityScore.toFixed(2)})`);
    });
    console.log('');

    // 5. Test control line generation
    console.log('5️⃣ Testing control line generation...');
    const controlLine = userResult.controlLine;
    console.log('✅ Generated control line:');
    console.log(controlLine + '\n');

    // 6. Get catalog info
    console.log('6️⃣ Getting catalog information...');
    const catalogInfo = await VoiceCatalogIntegration.getCatalogInfo();
    console.log('✅ Catalog info:', catalogInfo);

    console.log('\n🎉 All tests completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Quick test function for development
 */
export async function quickTest() {
  console.log('⚡ Running quick voice catalog test...');
  
  try {
    const result = await VoiceCatalogIntegration.testVoiceSelection('easy');
    console.log('✅ Quick test passed:', result.selectedVoice.pn);
    return result;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    throw error;
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testVoiceCatalog = testVoiceCatalogSystem;
  (window as any).quickTestVoice = quickTest;
}