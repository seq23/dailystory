// Test Level 0 vocabulary compliance after fix
import { LEVEL_0_FREE_TEMPLATES } from '@/constants/level0TemplatesFree';
import { validateLevel0SentenceByUserType } from '@/constants/dolchPrePrimer';

export function testLevel0VocabularyCompliance(): { 
  isCompliant: boolean; 
  violations: Array<{ templateIndex: number; pageIndex: number; sentence: string; invalidWords: string[] }>;
  summary: string;
} {
  console.log('🔍 Testing Level 0 vocabulary compliance...');
  
  const violations: Array<{ templateIndex: number; pageIndex: number; sentence: string; invalidWords: string[] }> = [];
  
  LEVEL_0_FREE_TEMPLATES.forEach((template, templateIndex) => {
    template.forEach((sentence, pageIndex) => {
      const validation = validateLevel0SentenceByUserType(sentence, 'free');
      if (!validation.isValid) {
        violations.push({
          templateIndex,
          pageIndex,
          sentence,
          invalidWords: validation.invalidWords
        });
      }
    });
  });
  
  const isCompliant = violations.length === 0;
  const totalSentences = LEVEL_0_FREE_TEMPLATES.reduce((sum, template) => sum + template.length, 0);
  
  const summary = `
🎯 LEVEL 0 VOCABULARY COMPLIANCE TEST RESULTS
=============================================
📊 Templates tested: ${LEVEL_0_FREE_TEMPLATES.length}
📊 Total sentences: ${totalSentences}
📊 Violations found: ${violations.length}
📊 Compliance status: ${isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
📊 Compliance rate: ${((totalSentences - violations.length) / totalSentences * 100).toFixed(1)}%

${violations.length > 0 ? `
❌ VIOLATIONS FOUND:
${violations.map(v => `Template ${v.templateIndex + 1}, Page ${v.pageIndex + 1}: "${v.sentence}"
   Invalid words: ${v.invalidWords.join(', ')}`).join('\n')}
` : '✅ ALL SENTENCES COMPLIANT WITH DOLCH PRE-PRIMER VOCABULARY'}

📚 ALLOWED WORDS (40 total):
a, and, away, big, blue, can, come, down, find, for, funny, go, help,
here, i, in, is, it, jump, little, look, make, me, my, not, one, play,
red, run, said, see, the, three, to, two, up, we, where, yellow, you
`;

  console.log(summary);
  
  return { isCompliant, violations, summary };
}

// Test with problematic sentence from original issue
export function testProblematicSentence(): boolean {
  const testSentence = "I see pretty flowers.";
  const validation = validateLevel0SentenceByUserType(testSentence, 'free');
  
  console.log('🧪 Testing problematic sentence:', testSentence);
  console.log('📋 Validation result:', validation);
  
  if (!validation.isValid) {
    console.log('✅ GOOD: Sentence correctly identified as non-compliant');
    console.log('❌ Invalid words found:', validation.invalidWords);
    return true; // Good - it should be invalid
  } else {
    console.log('❌ BAD: Sentence incorrectly passed validation');
    return false; // Bad - it should fail
  }
}

// Run tests
export function runAllTests(): boolean {
  console.log('🚀 Running Level 0 compliance tests...\n');
  
  const complianceTest = testLevel0VocabularyCompliance();
  const problematicTest = testProblematicSentence();
  
  const allPassed = complianceTest.isCompliant && problematicTest;
  
  console.log(`\n🏁 FINAL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 Level 0 vocabulary compliance is now FIXED!');
    console.log('✨ All stories will use only Dolch Pre-Primer words appropriate for ages 3-5.');
  } else {
    console.log('⚠️ Level 0 vocabulary compliance still has issues.');
    console.log('🔧 Additional fixes may be needed.');
  }
  
  return allPassed;
}