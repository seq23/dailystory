// FINAL COMPREHENSIVE VERIFICATION AUDIT
import { 
  FREE_LEVEL_0_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY, 
  DOLCH_PRE_PRIMER_VOCABULARY,
  validateLevel0SentenceByUserType 
} from '@/constants/dolchPrePrimer';
import { LEVEL_0_STRICT_DOLCH_TEMPLATES } from '@/constants/level0TemplatesFixed';

export function finalVerificationAudit() {
  console.log('🔍🔍🔍 === FINAL VERIFICATION AUDIT ===');
  
  // 1. Verify exact word counts and lists
  const dolchArray = [...DOLCH_PRE_PRIMER_VOCABULARY].sort();
  const freeArray = [...FREE_LEVEL_0_VOCABULARY].sort();
  const premiumArray = [...PREMIUM_LEVEL_0_VOCABULARY].sort();
  
  console.log('\n📊 EXACT WORD COUNTS:');
  console.log(`Dolch Pre-Primer: ${dolchArray.length} words`);
  console.log(`Free vocabulary: ${freeArray.length} words`);
  console.log(`Premium vocabulary: ${premiumArray.length} words`);
  
  // Verify free === Dolch exactly
  const freeMatchesDolch = JSON.stringify(dolchArray) === JSON.stringify(freeArray);
  console.log(`✅ Free exactly matches Dolch: ${freeMatchesDolch}`);
  
  if (!freeMatchesDolch) {
    const dolchOnly = dolchArray.filter(w => !freeArray.includes(w));
    const freeOnly = freeArray.filter(w => !dolchArray.includes(w));
    console.log(`❌ Dolch-only words: ${dolchOnly.join(', ')}`);
    console.log(`❌ Free-only words: ${freeOnly.join(', ')}`);
  }
  
  // Check premium additions
  const premiumAdditions = premiumArray.filter(w => !dolchArray.includes(w));
  console.log(`\n📝 Premium additions (${premiumAdditions.length}): ${premiumAdditions.join(', ')}`);
  
  // Verify character length constraint
  const tooLong = premiumAdditions.filter(w => w.length > 3);
  console.log(`❌ Premium words >3 chars: ${tooLong.length > 0 ? tooLong.join(', ') : 'None'}`);
  
  // 2. Verify strict templates are truly Dolch-only
  console.log('\n🔍 STRICT TEMPLATE VERIFICATION:');
  let totalFailures = 0;
  const failures: any[] = [];
  
  LEVEL_0_STRICT_DOLCH_TEMPLATES.forEach((template, tIndex) => {
    template.forEach((sentence, sIndex) => {
      const result = validateLevel0SentenceByUserType(sentence, 'free');
      if (!result.isValid) {
        totalFailures++;
        failures.push({
          template: tIndex + 1,
          sentence: sIndex + 1,
          text: sentence,
          invalidWords: result.invalidWords
        });
      }
    });
  });
  
  console.log(`📊 Strict templates: ${LEVEL_0_STRICT_DOLCH_TEMPLATES.length} templates`);
  console.log(`📊 Total sentences: ${LEVEL_0_STRICT_DOLCH_TEMPLATES.length * 5}`);
  console.log(`✅ Compliance: ${totalFailures === 0 ? 'PERFECT ✅' : `❌ ${totalFailures} FAILURES`}`);
  
  if (failures.length > 0) {
    console.log('\n❌ STRICT TEMPLATE FAILURES:');
    failures.forEach(f => {
      console.log(`  Template ${f.template}, Sentence ${f.sentence}: "${f.text}"`);
      console.log(`    Invalid words: ${f.invalidWords.join(', ')}`);
    });
  }
  
  // 3. Print official Dolch list for reference
  console.log('\n📋 OFFICIAL DOLCH PRE-PRIMER WORDS (40):');
  console.log(dolchArray.join(', '));
  
  // 4. Final system status
  const systemValid = freeMatchesDolch && 
                      tooLong.length === 0 && 
                      totalFailures === 0 &&
                      premiumArray.length === 59 &&
                      dolchArray.length === 40;
  
  console.log(`\n🎯 FINAL STATUS: ${systemValid ? '✅ SYSTEM VALID' : '❌ SYSTEM HAS ISSUES'}`);
  
  return {
    systemValid,
    freeMatchesDolch,
    premiumAdditionsValid: tooLong.length === 0,
    strictTemplatesValid: totalFailures === 0,
    wordCounts: { dolch: dolchArray.length, free: freeArray.length, premium: premiumArray.length },
    failures
  };
}

// Auto-run
if (typeof window !== 'undefined') {
  (window as any).finalVerify = finalVerificationAudit;
  console.log('🔍 Run finalVerify() for the ultimate check');
}