// Level 0 Template Auditor - Validates grammar and vocabulary compliance
import { LEVEL_0_FREE_TEMPLATES } from '../constants/level0TemplatesFree';
import { validateLevel0SentenceByUserType } from '../constants/dolchPrePrimer';

export interface TemplateAuditResult {
  isCompliant: boolean;
  violations: Array<{
    templateIndex: number;
    pageIndex: number;
    sentence: string;
    issues: string[];
  }>;
  summary: {
    totalTemplates: number;
    compliantTemplates: number;
    totalViolations: number;
    compliancePercentage: number;
  };
}

export function auditLevel0Templates(): TemplateAuditResult {
  const violations: Array<{
    templateIndex: number;
    pageIndex: number;
    sentence: string;
    issues: string[];
  }> = [];

  let totalViolations = 0;

  LEVEL_0_FREE_TEMPLATES.forEach((template, templateIndex) => {
    template.forEach((sentence, pageIndex) => {
      const validation = validateLevel0SentenceByUserType(sentence, 'free', 'testuser');
      
      if (!validation.isValid) {
        const issues: string[] = [];
        
        // Add vocabulary issues
        if (validation.invalidWords.length > 0) {
          issues.push(`Invalid words: ${validation.invalidWords.join(', ')}`);
        }
        
        // Add grammar issues
        if (validation.grammarErrors && validation.grammarErrors.length > 0) {
          issues.push(...validation.grammarErrors);
        }
        
        if (issues.length > 0) {
          violations.push({
            templateIndex,
            pageIndex,
            sentence,
            issues
          });
          totalViolations += issues.length;
        }
      }
    });
  });

  const compliantTemplates = LEVEL_0_FREE_TEMPLATES.length - 
    new Set(violations.map(v => v.templateIndex)).size;

  return {
    isCompliant: violations.length === 0,
    violations,
    summary: {
      totalTemplates: LEVEL_0_FREE_TEMPLATES.length,
      compliantTemplates,
      totalViolations,
      compliancePercentage: Math.round((compliantTemplates / LEVEL_0_FREE_TEMPLATES.length) * 100)
    }
  };
}

export function runLevel0TemplateAudit(): void {
  console.log('🔍 Running Level 0 Template Audit...');
  
  const auditResult = auditLevel0Templates();
  
  console.log('\n📊 Audit Summary:');
  console.log(`Total Templates: ${auditResult.summary.totalTemplates}`);
  console.log(`Compliant Templates: ${auditResult.summary.compliantTemplates}`);
  console.log(`Total Violations: ${auditResult.summary.totalViolations}`);
  console.log(`Compliance: ${auditResult.summary.compliancePercentage}%`);
  
  if (auditResult.violations.length > 0) {
    console.log('\n❌ Violations Found:');
    auditResult.violations.forEach(violation => {
      console.log(`Template ${violation.templateIndex + 1}, Page ${violation.pageIndex + 1}:`);
      console.log(`  Sentence: "${violation.sentence}"`);
      console.log(`  Issues: ${violation.issues.join('; ')}`);
    });
  } else {
    console.log('\n✅ All templates are compliant!');
  }
}

// Make available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).auditLevel0Templates = runLevel0TemplateAudit;
}