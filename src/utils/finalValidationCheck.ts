// Final Implementation Validation - Complete System Check
import { LEVEL_0_STRICT_DOLCH_TEMPLATES, getLevel0StrictDolchTemplateCount } from '@/constants/level0TemplatesFixed';
import { DOLCH_PRE_PRIMER_VOCABULARY, validateLevel0SentenceByUserType } from '@/constants/dolchPrePrimer';
import { ExtensionTemplateValidator } from '@/utils/extensionTemplateValidator';

export function runFinalValidationCheck(): {
  success: boolean;
  summary: string;
  details: {
    templateCount: { expected: number; actual: number; correct: boolean };
    vocabularyCompliance: { valid: number; invalid: number; compliance: number };
    extensionTemplates: { freeValid: boolean; premiumValid: boolean };
    violations: string[];
  };
} {
  const violations: string[] = [];
  
  console.log('🔍 Running Final Implementation Validation...\n');

  // 1. Template Count Check
  const expectedCount = 20;
  const actualCount = getLevel0StrictDolchTemplateCount();
  const countCorrect = actualCount === expectedCount;
  
  console.log(`📊 Template Count: ${actualCount}/${expectedCount} ${countCorrect ? '✅' : '❌'}`);
  if (!countCorrect) violations.push(`Template count mismatch: expected ${expectedCount}, got ${actualCount}`);

  // 2. Vocabulary Compliance Check
  let validPages = 0;
  let invalidPages = 0;
  const pageViolations: string[] = [];

  LEVEL_0_STRICT_DOLCH_TEMPLATES.forEach((template, templateIndex) => {
    template.forEach((page, pageIndex) => {
      const words = page.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
      const invalidWords = words.filter(word => !DOLCH_PRE_PRIMER_VOCABULARY.has(word));
      
      if (invalidWords.length > 0) {
        invalidPages++;
        const violation = `T${templateIndex + 1}P${pageIndex + 1}: "${page}" → [${invalidWords.join(', ')}]`;
        pageViolations.push(violation);
        violations.push(violation);
        console.log(`❌ ${violation}`);
      } else {
        validPages++;
        console.log(`✅ T${templateIndex + 1}P${pageIndex + 1}: "${page}"`);
      }
    });
  });

  const compliance = Math.round((validPages / (validPages + invalidPages)) * 100);
  console.log(`\n📚 Vocabulary Compliance: ${validPages}/${validPages + invalidPages} pages (${compliance}%)`);

  // 3. Extension Template Validation
  const freeExtensionTest = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'free');
  const premiumExtensionTest = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'premium');

  console.log(`\n🆓 Free Extension Templates: ${freeExtensionTest.isCompliant ? '✅ Compliant' : '❌ Non-compliant'}`);
  console.log(`💎 Premium Extension Templates: ${premiumExtensionTest.isCompliant ? '✅ Compliant' : '❌ Non-compliant'}`);

  if (!freeExtensionTest.isCompliant) {
    freeExtensionTest.results.forEach(result => {
      if (!result.isValid) {
        const violation = `Free extension: "${result.template}" → [${result.invalidWords.join(', ')}]`;
        violations.push(violation);
        console.log(`❌ ${violation}`);
      }
    });
  }

  if (!premiumExtensionTest.isCompliant) {
    violations.push('Premium extension templates failed validation');
  }

  // 4. Vocabulary Coverage Analysis
  const usedWords = new Set<string>();
  LEVEL_0_STRICT_DOLCH_TEMPLATES.forEach(template => {
    template.forEach(page => {
      const words = page.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      words.forEach(word => {
        if (DOLCH_PRE_PRIMER_VOCABULARY.has(word)) {
          usedWords.add(word);
        }
      });
    });
  });

  const vocabularyUsage = Math.round((usedWords.size / DOLCH_PRE_PRIMER_VOCABULARY.size) * 100);
  console.log(`\n📖 Dolch Vocabulary Usage: ${usedWords.size}/${DOLCH_PRE_PRIMER_VOCABULARY.size} words (${vocabularyUsage}%)`);

  const unusedWords = Array.from(DOLCH_PRE_PRIMER_VOCABULARY).filter(word => !usedWords.has(word));
  if (unusedWords.length > 0) {
    console.log(`💡 Unused words: ${unusedWords.join(', ')}`);
  }

  // Final Assessment
  const success = violations.length === 0;
  const summary = success 
    ? `🎉 VALIDATION PASSED: All 20 templates are 100% Dolch Pre-Primer compliant with working extension templates`
    : `❌ VALIDATION FAILED: ${violations.length} issues found`;

  console.log(`\n${summary}\n`);

  return {
    success,
    summary,
    details: {
      templateCount: { expected: expectedCount, actual: actualCount, correct: countCorrect },
      vocabularyCompliance: { valid: validPages, invalid: invalidPages, compliance },
      extensionTemplates: { 
        freeValid: freeExtensionTest.isCompliant, 
        premiumValid: premiumExtensionTest.isCompliant 
      },
      violations
    }
  };
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).runFinalValidationCheck = runFinalValidationCheck;
  console.log('💡 Run runFinalValidationCheck() to validate the complete implementation');
}