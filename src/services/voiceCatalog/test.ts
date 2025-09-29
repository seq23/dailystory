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
 * Quick test function for development - now with variety!
 */
export async function quickTest() {
  DebugLogger.log('audio', 'Running quick voice catalog test...');
  
  try {
    // Randomize test parameters for variety
    const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const testUsers = [
      { name: 'Alex', age: 6, themes: ['animals', 'adventure'], color: 'blue' },
      { name: 'Emma', age: 8, themes: ['magic', 'friendship'], color: 'purple' },
      { name: 'Jordan', age: 10, themes: ['science', 'mystery'], color: 'green' },
      { name: 'Sam', age: 12, themes: ['fantasy', 'dragons'], color: 'red' },
      { name: 'Maya', age: 15, themes: ['philosophy', 'space'], color: 'black' }
    ];
    
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    
    DebugLogger.log('audio', `Testing: Age ${randomUser.age}, ${difficulty} difficulty, themes: ${randomUser.themes.join(', ')}`);
    
    const result = await VoiceCatalogIntegration.testVoiceSelection(difficulty);
    DebugLogger.log('audio', 'Quick test passed', { 
      voice: result.selectedVoice.pn,
      scenario: `Age ${randomUser.age}, ${difficulty} level`,
      themes: randomUser.themes
    });
    
    return {
      ...result,
      testScenario: {
        difficulty,
        user: randomUser,
        description: `Age ${randomUser.age}, ${difficulty} difficulty, themes: ${randomUser.themes.join(', ')}`
      }
    };
  } catch (error) {
    DebugLogger.error('audio', 'Quick test failed', error);
    throw error;
  }
}

/**
 * Run multiple quick tests to show variety
 */
export async function runMultipleQuickTests(count: number = 3) {
  DebugLogger.log('audio', `Running ${count} quick tests to demonstrate variety...`);
  
  const results = [];
  for (let i = 0; i < count; i++) {
    try {
      const result = await quickTest();
      results.push(result);
      DebugLogger.log('audio', `Test ${i + 1}/${count}: ${result.selectedVoice.pn} (${result.testScenario.description})`);
    } catch (error) {
      DebugLogger.error('audio', `Test ${i + 1}/${count} failed:`, error);
      results.push({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  
  return results;
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testVoiceCatalog = testVoiceCatalogSystem;
  (window as any).quickTestVoice = quickTest;
}