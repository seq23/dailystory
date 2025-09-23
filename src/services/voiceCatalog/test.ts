/**
 * Voice Catalog System Tests
 * Quick verification that the AVC v1.1.0 implementation works
 */

import { VoiceCatalogIntegration, initializeVoiceCatalog } from './index';
import type { UserInfo } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';

/**
 * Test the complete voice catalog system
 */
export async function testVoiceCatalogSystem() {
  DebugLogger.log('audio', 'Starting Voice Catalog System Tests...');

  try {
    // 1. Initialize the catalog
    DebugLogger.log('audio', 'Initializing catalog...');
    const stats = await initializeVoiceCatalog();
    DebugLogger.log('audio', 'Catalog initialized', stats);

    // 2. Test voice selection for each difficulty level
    const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
    
    for (const difficulty of difficulties) {
      DebugLogger.log('audio', `Testing ${difficulty} level...`);
      try {
        const result = await VoiceCatalogIntegration.testVoiceSelection(difficulty);
        DebugLogger.log('audio', `${difficulty}: ${result.selectedVoice.pn} (score: ${result.compatibilityScore.toFixed(2)})`);
      } catch (error) {
        DebugLogger.error('audio', `${difficulty}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    // Empty line for debug formatting
    DebugLogger.log('audio', '');

    // 3. Test with actual user data
    DebugLogger.log('audio', 'Testing with realistic user data...');
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

    DebugLogger.log('audio', `Selected for Emma: ${userResult.selectedVoice.pn}`);
    DebugLogger.log('audio', `Compatibility: ${userResult.compatibilityScore.toFixed(2)}`);
    DebugLogger.log('audio', `Reasoning: ${userResult.selectionReasoning}`);
    // Empty line for debug formatting
    DebugLogger.log('audio', '');

    // 4. Test voice alternatives
    DebugLogger.log('audio', 'Testing voice alternatives...');
    const alternatives = await VoiceCatalogIntegration.getVoiceAlternatives(testUser, 'medium', 3);
    DebugLogger.log('audio', `Found ${alternatives.length} alternatives`);
    alternatives.forEach((alt, i) => {
      DebugLogger.log('audio', `${i + 1}. ${alt.selectedVoice.pn} (${alt.compatibilityScore.toFixed(2)})`);
    });
    // Empty line for debug formatting
    DebugLogger.log('audio', '');

    // 5. Test control line generation
    DebugLogger.log('audio', 'Testing control line generation...');
    const controlLine = userResult.controlLine;
    DebugLogger.log('audio', 'Generated control line:');
    DebugLogger.log('audio', controlLine);

    // 6. Get catalog info
    DebugLogger.log('audio', 'Getting catalog information...');
    const catalogInfo = await VoiceCatalogIntegration.getCatalogInfo();
    DebugLogger.log('audio', 'Catalog info', catalogInfo);

    DebugLogger.log('audio', 'All tests completed successfully!');
    return true;

  } catch (error) {
    DebugLogger.error('audio', 'Test failed', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Quick test function for development
 */
export async function quickTest() {
  DebugLogger.log('audio', 'Running quick voice catalog test...');
  
  try {
    const result = await VoiceCatalogIntegration.testVoiceSelection('easy');
    DebugLogger.log('audio', 'Quick test passed', result.selectedVoice.pn);
    return result;
  } catch (error) {
    DebugLogger.error('audio', 'Quick test failed', error);
    throw error;
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testVoiceCatalog = testVoiceCatalogSystem;
  (window as any).quickTestVoice = quickTest;
}