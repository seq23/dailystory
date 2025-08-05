// Final Premium Template Validation Check
import { LEVEL_0_PREMIUM_TEMPLATES } from '@/constants/level0TemplatesPremium';
import { validateLevel0SentenceByUserType } from '@/constants/dolchPrePrimer';

export function runFinalPremiumCheck() {
  console.log('🔍 FINAL PREMIUM TEMPLATE CHECK');
  console.log('===============================');
  
  let totalI = 0;
  let totalUserName = 0;
  let totalSentences = 0;
  let validationErrors = 0;
  const allErrors: string[] = [];

  LEVEL_0_PREMIUM_TEMPLATES.forEach((template, templateIdx) => {
    template.forEach((sentence, sentenceIdx) => {
      totalSentences++;
      
      // Count I vs {userName}
      if (sentence.toLowerCase().includes('i ') || sentence.toLowerCase().startsWith('i ')) {
        totalI++;
      }
      if (sentence.includes('{userName}')) {
        totalUserName++;
      }
      
      // Validate vocabulary
      const validation = validateLevel0SentenceByUserType(sentence, 'premium');
      if (!validation.isValid) {
        validationErrors++;
        const error = `Template ${templateIdx + 1}, Sentence ${sentenceIdx + 1}: "${sentence}" - Invalid: ${validation.invalidWords.join(', ')}`;
        allErrors.push(error);
        console.log(`❌ ${error}`);
      }
    });
  });

  const iPercentage = Math.round((totalI / totalSentences) * 100);
  const userNamePercentage = Math.round((totalUserName / totalSentences) * 100);
  
  console.log('\n📊 RESULTS:');
  console.log(`Total sentences: ${totalSentences}`);
  console.log(`Validation errors: ${validationErrors}`);
  console.log(`"I" sentences: ${totalI} (${iPercentage}%) - Target: 60%`);
  console.log(`"{userName}" sentences: ${totalUserName} (${userNamePercentage}%) - Target: 40%`);
  
  const vocabularyPass = validationErrors === 0;
  const ratioPass = iPercentage >= 55 && iPercentage <= 65 && userNamePercentage >= 35 && userNamePercentage <= 45;
  
  console.log('\n🎯 FINAL VERDICT:');
  console.log(`Vocabulary: ${vocabularyPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Ratio: ${ratioPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall: ${vocabularyPass && ratioPass ? '✅ SUCCESS' : '❌ NEEDS FIXES'}`);
  
  return {
    vocabularyPass,
    ratioPass,
    overallPass: vocabularyPass && ratioPass,
    errors: allErrors,
    stats: { totalSentences, validationErrors, iPercentage, userNamePercentage }
  };
}

// Auto-run the check
const finalCheck = runFinalPremiumCheck();
export { finalCheck };