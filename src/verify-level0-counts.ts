// Quick verification of Level 0 template counts
import { getLevel0FreeTemplateCount } from './constants/level0TemplatesFree';
import { getLevel0ExtensionCount } from './constants/gradeBased/level0ExtensionTemplates';

export function verifyLevel0TemplateCounts() {
  console.log('🔍 Verifying Level 0 Template Counts...');
  
  const baseTemplateCount = getLevel0FreeTemplateCount();
  const freeExtensionCount = getLevel0ExtensionCount(false);
  const premiumExtensionCount = getLevel0ExtensionCount(true);
  
  console.log(`📊 Base Templates (Free): ${baseTemplateCount}`);
  console.log(`📊 Extension Templates (Free): ${freeExtensionCount}`);
  console.log(`📊 Extension Templates (Premium): ${premiumExtensionCount}`);
  
  const freeTrialPages = (baseTemplateCount * 5) + (freeExtensionCount * 5);
  const premiumPages = (baseTemplateCount * 5) + (premiumExtensionCount * 5);
  
  console.log(`🎯 Expected pages before fallback:`);
  console.log(`   Free Trial: ${freeTrialPages} pages (${baseTemplateCount} base × 5 + ${freeExtensionCount} extension × 5)`);
  console.log(`   Premium: ${premiumPages} pages (${baseTemplateCount} base × 5 + ${premiumExtensionCount} extension × 5)`);
  
  return {
    baseCount: baseTemplateCount,
    freeExtensionCount,
    premiumExtensionCount,
    freeTrialPages,
    premiumPages
  };
}

// Auto-run verification in development
if (typeof window !== 'undefined') {
  (window as any).verifyLevel0TemplateCounts = verifyLevel0TemplateCounts;
  console.log('🔧 Verification function available: verifyLevel0TemplateCounts()');
}