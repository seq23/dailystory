/**
 * Test cases for context-aware pronunciation
 * Run this to verify the pronunciation preprocessing works correctly
 */

import { preprocessTextForTTS, cleanChildrensTextForSpeech } from './contextualPronunciation';

// Test cases for common pronunciation issues
const testCases = [
  {
    text: "The green skies looked beautiful above the mountains.",
    expected: "The green skahyz looked beautiful above the mountains.",
    issue: "skies vs skiing context"
  },
  {
    text: "I will read a book tomorrow.",
    expected: "I will reed a book tomorrow.",
    issue: "read future vs past tense"
  },
  {
    text: "Yesterday I read a great story.",
    expected: "Yesterday I red a great story.",
    issue: "read past tense"
  },
  {
    text: "The metal lead pipe was heavy.",
    expected: "The metal led pipe was heavy.",
    issue: "lead metal vs verb"
  },
  {
    text: "She will lead the team to victory.",
    expected: "She will leed the team to victory.",
    issue: "lead verb"
  },
  {
    text: "Please close the door.",
    expected: "Please klohz the door.",
    issue: "close verb vs adjective"
  },
  {
    text: "They are very close friends.",
    expected: "They are very klohs friends.",
    issue: "close adjective"
  },
  {
    text: "A tear dropped from her eye.",
    expected: "A teer dropped from her eye.",
    issue: "tear noun vs verb"
  },
  {
    text: "Don't tear the paper.",
    expected: "Don't tair the paper.",
    issue: "tear verb"
  }
];

export function runPronunciationTests(): void {
  console.log('🎯 Testing Context-Aware Pronunciation System\n');
  
  let passed = 0;
  let total = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.issue}`);
    console.log(`Input:    "${testCase.text}"`);
    
    const result = cleanChildrensTextForSpeech(testCase.text);
    console.log(`Output:   "${result}"`);
    console.log(`Expected: "${testCase.expected}"`);
    
    const success = result.includes(testCase.expected.split(' ').find(word => 
      ['skahyz', 'reed', 'red', 'led', 'leed', 'klohz', 'klohs', 'teer', 'tair'].includes(word)
    ) || '');
    
    if (success) {
      console.log('✅ PASSED\n');
      passed++;
    } else {
      console.log('❌ FAILED\n');
    }
  });
  
  console.log(`📊 Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All pronunciation tests passed! The system correctly handles context-aware pronunciation.');
  } else {
    console.log('⚠️  Some tests failed. The pronunciation rules may need adjustment.');
  }
}

// Export for manual testing
export { preprocessTextForTTS, cleanChildrensTextForSpeech };