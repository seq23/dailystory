// Triple Check Script - Run in browser console
import { verifyVocabularyImplementation } from './vocabularyVerification';
import { 
  DOLCH_PRE_PRIMER_VOCABULARY, 
  FREE_LEVEL_0_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY,
  getLevel0VocabularyByUserType,
  validateLevel0SentenceByUserType
} from '@/constants/dolchPrePrimer';

console.log('🔍 TRIPLE CHECK: Premium Vocabulary Implementation');
console.log('================================================');

// Run comprehensive verification
const verification = verifyVocabularyImplementation();

console.log('\n📊 VOCABULARY SIZES:');
console.log(`Dolch Pre-Primer: ${verification.stats.dolchSize} words`);
console.log(`Free Level 0: ${verification.stats.freeSize} words`);
console.log(`Premium Level 0: ${verification.stats.premiumSize} words`);

console.log('\n✨ PREMIUM-ONLY WORDS:');
console.log(`Count: ${verification.stats.premiumOnlyWords.length}`);
console.log(`Words: ${verification.stats.premiumOnlyWords.join(', ')}`);

console.log('\n🔍 DUPLICATES CHECK:');
console.log(`Duplicates found: ${verification.stats.duplicatesInPremium.length === 0 ? 'None ✅' : verification.stats.duplicatesInPremium.join(', ')}`);

console.log('\n🧪 VALIDATION TESTS:');
const testCases = [
  { word: 'the', expected: { free: true, premium: true }, reason: 'Basic Dolch word' },
  { word: 'of', expected: { free: false, premium: true }, reason: 'Fry addition (premium-only)' },
  { word: 'was', expected: { free: false, premium: true }, reason: 'Fry addition (premium-only)' },
  { word: 'some', expected: { free: false, premium: true }, reason: 'Head Start word (premium-only)' },
  { word: 'has', expected: { free: false, premium: true }, reason: 'High-utility word (premium-only)' },
  { word: 'elephant', expected: { free: false, premium: false }, reason: 'Complex word (should fail both)' }
];

let testsPassed = 0;
testCases.forEach(test => {
  const freeResult = validateLevel0SentenceByUserType(test.word, 'free');
  const premiumResult = validateLevel0SentenceByUserType(test.word, 'premium');
  
  const passed = freeResult.isValid === test.expected.free && 
                 premiumResult.isValid === test.expected.premium;
  
  console.log(`${passed ? '✅' : '❌'} "${test.word}": Free=${freeResult.isValid}, Premium=${premiumResult.isValid} (${test.reason})`);
  
  if (passed) testsPassed++;
});

console.log(`\n📈 TEST RESULTS: ${testsPassed}/${testCases.length} passed`);

console.log('\n🔍 ISSUES FOUND:');
if (verification.issues.length === 0) {
  console.log('✅ No issues found!');
} else {
  verification.issues.forEach(issue => console.log(`❌ ${issue}`));
}

console.log('\n🎯 FINAL VERDICT:');
console.log(verification.isValid ? '✅ IMPLEMENTATION CORRECT' : '❌ ISSUES NEED FIXING');

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).tripleCheck = () => {
    return verification;
  };
  console.log('\n💡 Run `tripleCheck()` in console to get detailed results');
}

export { verification };