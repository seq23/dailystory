// Vocabulary audit utility to verify the tiered system implementation
import { 
  FREE_LEVEL_0_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY, 
  DOLCH_PRE_PRIMER_VOCABULARY,
  getLevel0VocabularyByUserType,
  validateLevel0SentenceByUserType 
} from '@/constants/dolchPrePrimer';

export function auditVocabularySets() {
  console.log('=== VOCABULARY AUDIT ===');
  
  // Check vocabulary counts
  console.log(`📊 Dolch Pre-Primer: ${DOLCH_PRE_PRIMER_VOCABULARY.size} words`);
  console.log(`📊 Free Level 0: ${FREE_LEVEL_0_VOCABULARY.size} words`);
  console.log(`📊 Premium Level 0: ${PREMIUM_LEVEL_0_VOCABULARY.size} words`);
  
  // Verify free is exactly Dolch
  const freeIsDolch = [...FREE_LEVEL_0_VOCABULARY].every(word => DOLCH_PRE_PRIMER_VOCABULARY.has(word)) &&
                     FREE_LEVEL_0_VOCABULARY.size === DOLCH_PRE_PRIMER_VOCABULARY.size;
  console.log(`✅ Free vocabulary = Dolch: ${freeIsDolch}`);
  
  // Check premium additions are ≤3 characters
  const premiumAdditions = [...PREMIUM_LEVEL_0_VOCABULARY].filter(word => !DOLCH_PRE_PRIMER_VOCABULARY.has(word));
  console.log(`📊 Premium additions: ${premiumAdditions.length} words`);
  console.log(`📝 Premium additions: ${premiumAdditions.join(', ')}`);
  
  const allAdditionsValid = premiumAdditions.every(word => word.length <= 3);
  console.log(`✅ All additions ≤3 characters: ${allAdditionsValid}`);
  
  // Test vocabulary retrieval by user type
  const freeVocab = getLevel0VocabularyByUserType('free');
  const premiumVocab = getLevel0VocabularyByUserType('premium');
  
  console.log(`📊 Free vocab function: ${freeVocab.size} words`);
  console.log(`📊 Premium vocab function: ${premiumVocab.size} words`);
  
  // Test validation with example sentences
  const testSentences = [
    'I can see you',  // All Dolch words
    'Mom got a cat',  // Uses premium additions
    'The elephant is big'  // Contains invalid word
  ];
  
  console.log('\n=== VALIDATION TESTS ===');
  testSentences.forEach((sentence, i) => {
    const freeResult = validateLevel0SentenceByUserType(sentence, 'free');
    const premiumResult = validateLevel0SentenceByUserType(sentence, 'premium');
    
    console.log(`Test ${i + 1}: "${sentence}"`);
    console.log(`  Free: ${freeResult.isValid ? '✅' : '❌'} (${freeResult.vocabularySize} words) ${freeResult.invalidWords.length ? `Invalid: ${freeResult.invalidWords.join(', ')}` : ''}`);
    console.log(`  Premium: ${premiumResult.isValid ? '✅' : '❌'} (${premiumResult.vocabularySize} words) ${premiumResult.invalidWords.length ? `Invalid: ${premiumResult.invalidWords.join(', ')}` : ''}`);
  });
  
  return {
    dolchCount: DOLCH_PRE_PRIMER_VOCABULARY.size,
    freeCount: FREE_LEVEL_0_VOCABULARY.size,
    premiumCount: PREMIUM_LEVEL_0_VOCABULARY.size,
    premiumAdditions,
    freeIsDolch,
    allAdditionsValid
  };
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  (window as any).auditVocabulary = auditVocabularySets;
  console.log('💡 Run auditVocabulary() in console to check vocabulary implementation');
}