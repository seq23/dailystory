// Level 0 Implementation Validation Test
import { LEVEL_0_STRICT_DOLCH_TEMPLATES, getLevel0StrictDolchTemplateCount } from '@/constants/level0TemplatesFixed';
import { validateLevel0SentenceByUserType, DOLCH_PRE_PRIMER_VOCABULARY } from '@/constants/dolchPrePrimer';
import { ExtensionTemplateValidator } from '@/utils/extensionTemplateValidator';

export function runLevel0ValidationTest(): {
  success: boolean;
  errors: string[];
  results: {
    templateCount: number;
    vocabularyCompliance: boolean;
    extensionCompliance: { free: boolean; premium: boolean };
    detailedResults: any[];
  };
} {
  const errors: string[] = [];
  const detailedResults: any[] = [];

  console.log('🔍 Starting Level 0 Implementation Validation...');

  // Test 1: Verify template count
  const templateCount = getLevel0StrictDolchTemplateCount();
  console.log(`📊 Template count: ${templateCount} (Expected: 20)`);
  
  if (templateCount !== 20) {
    errors.push(`Template count mismatch: Expected 20, got ${templateCount}`);
  }

  // Test 2: Validate all templates against Dolch Pre-Primer vocabulary
  let vocabularyCompliance = true;
  
  LEVEL_0_STRICT_DOLCH_TEMPLATES.forEach((template, templateIndex) => {
    template.forEach((page, pageIndex) => {
      const validation = validateLevel0SentenceByUserType(page, 'free', 'TestUser');
      
      if (!validation.isValid) {
        vocabularyCompliance = false;
        const error = `Template ${templateIndex + 1}, Page ${pageIndex + 1}: "${page}" - Invalid words: ${validation.invalidWords.join(', ')}`;
        errors.push(error);
        console.warn(`❌ ${error}`);
      } else {
        console.log(`✅ Template ${templateIndex + 1}, Page ${pageIndex + 1}: Valid`);
      }
      
      detailedResults.push({
        template: templateIndex + 1,
        page: pageIndex + 1,
        content: page,
        isValid: validation.isValid,
        invalidWords: validation.invalidWords
      });
    });
  });

  // Test 3: Validate extension templates for both tiers
  const freeExtensionTest = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'free');
  const premiumExtensionTest = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'premium');

  console.log(`🆓 Free extension compliance: ${freeExtensionTest.isCompliant}`);
  console.log(`💎 Premium extension compliance: ${premiumExtensionTest.isCompliant}`);

  if (!freeExtensionTest.isCompliant) {
    errors.push('Free tier extension templates are not vocabulary compliant');
    freeExtensionTest.results.forEach(result => {
      if (!result.isValid) {
        console.warn(`❌ Free extension: "${result.template}" - Invalid: ${result.invalidWords.join(', ')}`);
      }
    });
  }

  if (!premiumExtensionTest.isCompliant) {
    errors.push('Premium tier extension templates are not vocabulary compliant');
  }

  // Test 4: Check vocabulary usage distribution
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

  const vocabularyUsage = (usedWords.size / DOLCH_PRE_PRIMER_VOCABULARY.size) * 100;
  console.log(`📚 Vocabulary usage: ${usedWords.size}/${DOLCH_PRE_PRIMER_VOCABULARY.size} (${vocabularyUsage.toFixed(1)}%)`);

  const success = errors.length === 0;
  
  console.log(success ? '🎉 All validation tests passed!' : `❌ Validation failed with ${errors.length} errors`);

  return {
    success,
    errors,
    results: {
      templateCount,
      vocabularyCompliance,
      extensionCompliance: {
        free: freeExtensionTest.isCompliant,
        premium: premiumExtensionTest.isCompliant
      },
      detailedResults
    }
  };
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  (window as any).runLevel0ValidationTest = runLevel0ValidationTest;
  console.log('💡 Run runLevel0ValidationTest() to validate the Level 0 implementation');
}