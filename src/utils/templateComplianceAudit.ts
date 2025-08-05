// Template compliance audit for tiered vocabulary system
import { LEVEL_0_FREE_TEMPLATES } from '@/constants/level0TemplatesFree';
import { validateLevel0SentenceByUserType } from '@/constants/dolchPrePrimer';

export function auditTemplateCompliance() {
  console.log('=== TEMPLATE COMPLIANCE AUDIT ===');
  
  let freeFailures = 0;
  let premiumFailures = 0;
  const detailedResults: Array<{
    templateIndex: number;
    pageIndex: number;
    sentence: string;
    freeValid: boolean;
    premiumValid: boolean;
    freeInvalidWords: string[];
    premiumInvalidWords: string[];
  }> = [];
  
  LEVEL_0_FREE_TEMPLATES.forEach((template, templateIndex) => {
    template.forEach((sentence, pageIndex) => {
      const freeResult = validateLevel0SentenceByUserType(sentence, 'free');
      const premiumResult = validateLevel0SentenceByUserType(sentence, 'premium');
      
      if (!freeResult.isValid) freeFailures++;
      if (!premiumResult.isValid) premiumFailures++;
      
      if (!freeResult.isValid || !premiumResult.isValid) {
        detailedResults.push({
          templateIndex,
          pageIndex,
          sentence,
          freeValid: freeResult.isValid,
          premiumValid: premiumResult.isValid,
          freeInvalidWords: freeResult.invalidWords,
          premiumInvalidWords: premiumResult.invalidWords
        });
      }
    });
  });
  
  const totalSentences = LEVEL_0_FREE_TEMPLATES.reduce((sum, template) => sum + template.length, 0);
  
  console.log(`📊 Total sentences: ${totalSentences}`);
  console.log(`📊 Free tier failures: ${freeFailures} (${((freeFailures/totalSentences)*100).toFixed(1)}%)`);
  console.log(`📊 Premium tier failures: ${premiumFailures} (${((premiumFailures/totalSentences)*100).toFixed(1)}%)`);
  
  if (detailedResults.length > 0) {
    console.log('\n❌ FAILED SENTENCES:');
    detailedResults.forEach(result => {
      console.log(`Template ${result.templateIndex + 1}, Page ${result.pageIndex + 1}: "${result.sentence}"`);
      if (!result.freeValid) {
        console.log(`  Free: Invalid words: ${result.freeInvalidWords.join(', ')}`);
      }
      if (!result.premiumValid) {
        console.log(`  Premium: Invalid words: ${result.premiumInvalidWords.join(', ')}`);
      }
    });
  } else {
    console.log('✅ All templates are compliant with both vocabulary tiers!');
  }
  
  return {
    totalSentences,
    freeFailures,
    premiumFailures,
    detailedResults,
    freeComplianceRate: ((totalSentences - freeFailures) / totalSentences) * 100,
    premiumComplianceRate: ((totalSentences - premiumFailures) / totalSentences) * 100
  };
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  (window as any).auditTemplates = auditTemplateCompliance;
  console.log('💡 Run auditTemplates() in console to check template compliance');
}