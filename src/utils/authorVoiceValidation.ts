// Author Voice Validation Tests - Verify author voice patterns are preserved
import { DifficultyManager } from '@/services/difficultyManager';
import type { UserInfo, DifficultyLevel } from '@/types';

interface AuthorVoiceTest {
  testName: string;
  userInfo: UserInfo;
  expectedDifficulty: DifficultyLevel;
  expectedAuthorVoice: boolean;
  reasoning: string;
}

export const runAuthorVoiceTests = (): void => {
  console.log('🎭 AuthorVoiceValidation: === RUNNING AUTHOR VOICE TESTS ===');
  
  const tests: AuthorVoiceTest[] = [
    {
      testName: 'Young child should get beginner (no author voice)',
      userInfo: { name: 'Emma', age: 4, gradeLevel: 'Pre-K' },
      expectedDifficulty: 'beginner',
      expectedAuthorVoice: false,
      reasoning: 'Age 4 = pre-reader level'
    },
    {
      testName: 'School age should get Easy (with author voice)',
      userInfo: { name: 'Alex', age: 7, gradeLevel: '2nd' },
      expectedDifficulty: 'easy',
      expectedAuthorVoice: true,
      reasoning: 'Age 7 Grade 2 = ready for author voice patterns'
    },
    {
      testName: 'Older student should get Medium (rich author voice)',
      userInfo: { name: 'Sam', age: 9, gradeLevel: '4th' },
      expectedDifficulty: 'medium',
      expectedAuthorVoice: true,
      reasoning: 'Age 9 Grade 4 = Level 2 templates with "Oh my! Oh me!"'
    },
    {
      testName: 'Advanced reader should get Hard (complex author voice)',
      userInfo: { name: 'Jordan', age: 12, readingLevel: 'advanced' },
      expectedDifficulty: 'hard',
      expectedAuthorVoice: true,
      reasoning: 'Advanced reading level = sophisticated storytelling'
    },
    {
      testName: 'Explicit beginner older child gets upgraded',
      userInfo: { name: 'Taylor', age: 8, readingLevel: 'beginner' },
      expectedDifficulty: 'easy',
      expectedAuthorVoice: true,
      reasoning: 'Age 8 beginner upgraded to Easy for author voice'
    }
  ];

  tests.forEach((test, index) => {
    console.log(`\n🧪 Test ${index + 1}: ${test.testName}`);
    
    const result = DifficultyManager.getFinalDifficulty(test.userInfo);
    const actualAuthorVoice = DifficultyManager.hasAuthorVoice(result.difficulty);
    
    console.log('📊 Results:', {
      expectedDifficulty: test.expectedDifficulty,
      actualDifficulty: result.difficulty,
      expectedAuthorVoice: test.expectedAuthorVoice,
      actualAuthorVoice,
      passed: result.difficulty === test.expectedDifficulty && actualAuthorVoice === test.expectedAuthorVoice
    });
    
    if (result.difficulty === test.expectedDifficulty && actualAuthorVoice === test.expectedAuthorVoice) {
      console.log('✅ PASSED');
    } else {
      console.log('❌ FAILED');
      console.log('📋 Expected reasoning:', test.reasoning);
      console.log('📋 Actual reasoning:', result.profile.reasoning);
    }
  });
  
  console.log('\n🎭 AuthorVoiceValidation: === TESTS COMPLETE ===');
};

// Sample author voice content verification
export const verifyAuthorVoiceContent = (): void => {
  console.log('🎨 AuthorVoiceContent: === VERIFYING AUTHOR VOICE PATTERNS ===');
  
  const sampleLevel2Content = [
    "Oh my! Oh me! Emma could not believe what they would grow!",
    "But then their friend said something important: 'We need three plants and different soil!'",
    "Round and round and round they watered, watching green things grow and grow!"
  ];
  
  sampleLevel2Content.forEach((content, index) => {
    const hasGreenPattern = content.includes("Oh my! Oh me!");
    const hasBluePattern = content.includes("But then their friend said");
    const hasRedPattern = content.includes("Round and round and round");
    
    console.log(`📝 Content ${index + 1}:`, {
      preview: content.substring(0, 50) + '...',
      greenPattern: hasGreenPattern,
      bluePattern: hasBluePattern,
      redPattern: hasRedPattern,
      hasAuthorVoice: hasGreenPattern || hasBluePattern || hasRedPattern
    });
  });
  
  console.log('🎨 AuthorVoiceContent: === VERIFICATION COMPLETE ===');
};

// Run tests on import for immediate feedback
if (typeof window !== 'undefined') {
  // Run in browser environment
  setTimeout(() => {
    runAuthorVoiceTests();
    verifyAuthorVoiceContent();
  }, 1000);
}