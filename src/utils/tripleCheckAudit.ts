// Comprehensive triple-check audit for tiered vocabulary system
import { 
  FREE_LEVEL_0_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY, 
  DOLCH_PRE_PRIMER_VOCABULARY,
  getLevel0VocabularyByUserType,
  validateLevel0SentenceByUserType 
} from '@/constants/dolchPrePrimer';
import { LEVEL_0_COMPLIANT_TEMPLATES } from '@/constants/level0TemplatesCompliant';
import { LEVEL_0_STRICT_DOLCH_TEMPLATES } from '@/constants/level0TemplatesFixed';

export function tripleCheckImplementation() {
  console.log('🔍 === TRIPLE CHECK AUDIT ===');
  
  // 1. VOCABULARY VERIFICATION
  console.log('\n1️⃣ VOCABULARY SETS VERIFICATION');
  
  const dolchWords = [...DOLCH_PRE_PRIMER_VOCABULARY];
  const freeWords = [...FREE_LEVEL_0_VOCABULARY];
  const premiumWords = [...PREMIUM_LEVEL_0_VOCABULARY];
  
  console.log(`📊 Dolch Pre-Primer: ${dolchWords.length} words`);
  console.log(`📊 Free vocabulary: ${freeWords.length} words`);
  console.log(`📊 Premium vocabulary: ${premiumWords.length} words`);
  
  // Verify free = Dolch exactly
  const freeEqualsDeepDolch = dolchWords.every(word => freeWords.includes(word)) && 
                              freeWords.every(word => dolchWords.includes(word)) &&
                              freeWords.length === dolchWords.length;
  console.log(`✅ Free vocabulary exactly equals Dolch: ${freeEqualsDeepDolch}`);
  
  // Check premium additions
  const premiumAdditions = premiumWords.filter(word => !dolchWords.includes(word));
  console.log(`📊 Premium additions: ${premiumAdditions.length} words`);
  console.log(`📝 Premium additions: [${premiumAdditions.join(', ')}]`);
  
  // Verify all additions are ≤3 characters
  const invalidAdditions = premiumAdditions.filter(word => word.length > 3);
  console.log(`❌ Invalid additions (>3 chars): ${invalidAdditions.length > 0 ? invalidAdditions.join(', ') : 'None'}`);
  
  // List additions by length
  const oneChar = premiumAdditions.filter(w => w.length === 1);
  const twoChar = premiumAdditions.filter(w => w.length === 2);
  const threeChar = premiumAdditions.filter(w => w.length === 3);
  
  console.log(`  1-char words: [${oneChar.join(', ')}] (${oneChar.length})`);
  console.log(`  2-char words: [${twoChar.join(', ')}] (${twoChar.length})`);
  console.log(`  3-char words: [${threeChar.join(', ')}] (${threeChar.length})`);
  
  // 2. TEMPLATE COMPLIANCE CHECK
  console.log('\n2️⃣ TEMPLATE COMPLIANCE CHECK');
  
  // Check strict Dolch templates
  let strictFailures = 0;
  const strictResults: any[] = [];
  
  LEVEL_0_STRICT_DOLCH_TEMPLATES.forEach((template, tIndex) => {
    template.forEach((sentence, sIndex) => {
      const result = validateLevel0SentenceByUserType(sentence, 'free');
      if (!result.isValid) {
        strictFailures++;
        strictResults.push({ template: tIndex + 1, sentence: sIndex + 1, text: sentence, invalid: result.invalidWords });
      }
    });
  });
  
  console.log(`📊 Strict Dolch templates: ${LEVEL_0_STRICT_DOLCH_TEMPLATES.length} templates, ${LEVEL_0_STRICT_DOLCH_TEMPLATES.length * 5} sentences`);
  console.log(`✅ Strict compliance: ${strictFailures === 0 ? 'PERFECT' : `${strictFailures} failures`}`);
  
  if (strictResults.length > 0) {
    console.log('❌ Strict template failures:');
    strictResults.forEach(r => console.log(`  T${r.template}S${r.sentence}: "${r.text}" - Invalid: ${r.invalid.join(', ')}`));
  }
  
  // Check enhanced templates (for premium)
  let enhancedFailures = 0;
  const enhancedResults: any[] = [];
  
  LEVEL_0_COMPLIANT_TEMPLATES.forEach((template, tIndex) => {
    template.forEach((sentence, sIndex) => {
      const freeResult = validateLevel0SentenceByUserType(sentence, 'free');
      const premiumResult = validateLevel0SentenceByUserType(sentence, 'premium');
      
      if (!premiumResult.isValid) {
        enhancedFailures++;
        enhancedResults.push({ 
          template: tIndex + 1, 
          sentence: sIndex + 1, 
          text: sentence, 
          freeValid: freeResult.isValid,
          premiumValid: premiumResult.isValid,
          freeInvalid: freeResult.invalidWords,
          premiumInvalid: premiumResult.invalidWords
        });
      }
    });
  });
  
  console.log(`📊 Enhanced templates: ${LEVEL_0_COMPLIANT_TEMPLATES.length} templates, ${LEVEL_0_COMPLIANT_TEMPLATES.length * 5} sentences`);
  console.log(`✅ Premium compliance: ${enhancedFailures === 0 ? 'PERFECT' : `${enhancedFailures} failures`}`);
  
  if (enhancedResults.length > 0) {
    console.log('❌ Enhanced template failures (premium should pass):');
    enhancedResults.forEach(r => console.log(`  T${r.template}S${r.sentence}: "${r.text}" - Invalid: ${r.premiumInvalid.join(', ')}`));
  }
  
  // 3. FUNCTION BEHAVIOR TEST
  console.log('\n3️⃣ FUNCTION BEHAVIOR TESTS');
  
  const testCases = [
    { sentence: 'I can see you', expectFree: true, expectPremium: true, desc: 'Pure Dolch' },
    { sentence: 'Mom got a cat', expectFree: false, expectPremium: true, desc: 'Uses premium words' },
    { sentence: 'The elephant runs fast', expectFree: false, expectPremium: false, desc: 'Uses invalid words' },
    { sentence: 'I go to bed', expectFree: false, expectPremium: true, desc: 'Uses 3-char premium word' },
    { sentence: 'He can run up', expectFree: false, expectPremium: true, desc: 'Uses 2-char premium word' }
  ];
  
  testCases.forEach((test, i) => {
    const freeResult = validateLevel0SentenceByUserType(test.sentence, 'free');
    const premiumResult = validateLevel0SentenceByUserType(test.sentence, 'premium');
    
    const freeMatch = freeResult.isValid === test.expectFree;
    const premiumMatch = premiumResult.isValid === test.expectPremium;
    
    console.log(`Test ${i + 1} (${test.desc}): "${test.sentence}"`);
    console.log(`  Free: ${freeMatch ? '✅' : '❌'} (expected ${test.expectFree}, got ${freeResult.isValid}) ${freeResult.invalidWords.length ? `- Invalid: ${freeResult.invalidWords.join(', ')}` : ''}`);
    console.log(`  Premium: ${premiumMatch ? '✅' : '❌'} (expected ${test.expectPremium}, got ${premiumResult.isValid}) ${premiumResult.invalidWords.length ? `- Invalid: ${premiumResult.invalidWords.join(', ')}` : ''}`);
  });
  
  // 4. SYSTEM INTEGRATION CHECK
  console.log('\n4️⃣ SYSTEM INTEGRATION CHECK');
  
  const freeVocabFunc = getLevel0VocabularyByUserType('free');
  const premiumVocabFunc = getLevel0VocabularyByUserType('premium');
  
  const funcWorksCorrectly = freeVocabFunc.size === FREE_LEVEL_0_VOCABULARY.size &&
                             premiumVocabFunc.size === PREMIUM_LEVEL_0_VOCABULARY.size;
  
  console.log(`✅ getLevel0VocabularyByUserType works: ${funcWorksCorrectly}`);
  console.log(`📊 Function returns - Free: ${freeVocabFunc.size}, Premium: ${premiumVocabFunc.size}`);
  
  // 5. FINAL SUMMARY
  console.log('\n5️⃣ FINAL SUMMARY');
  
  const allChecksPass = freeEqualsDeepDolch && 
                        invalidAdditions.length === 0 &&
                        strictFailures === 0 &&
                        enhancedFailures === 0 &&
                        funcWorksCorrectly;
  
  console.log(`🎯 OVERALL STATUS: ${allChecksPass ? '✅ ALL CHECKS PASS' : '❌ ISSUES FOUND'}`);
  
  return {
    vocabularyCorrect: freeEqualsDeepDolch && invalidAdditions.length === 0,
    strictTemplatesValid: strictFailures === 0,
    enhancedTemplatesValid: enhancedFailures === 0,
    functionsWork: funcWorksCorrectly,
    allPass: allChecksPass,
    details: {
      dolchCount: dolchWords.length,
      freeCount: freeWords.length,
      premiumCount: premiumWords.length,
      premiumAdditions,
      invalidAdditions,
      strictFailures,
      enhancedFailures
    }
  };
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  (window as any).tripleCheck = tripleCheckImplementation;
  console.log('🔍 Run tripleCheck() in console for comprehensive audit');
}