/**
 * Extension Template Validator - Verify vocabulary compliance of all extension templates
 */

import { validateSentence, GradeLevel } from '@/constants/gradeBased';

interface ExtensionTestResult {
  gradeLevel: GradeLevel;
  templateIndex: number;
  template: string;
  isValid: boolean;
  invalidWords: string[];
  coverage: number;
}

export class ExtensionTemplateValidator {
  /**
   * Test all extension templates for vocabulary compliance
   */
  static testAllExtensionTemplates(userName: string = 'Sequoia', userType: 'free' | 'premium' = 'premium'): {
    allCompliant: boolean;
    results: ExtensionTestResult[];
    summary: Record<GradeLevel, { total: number; compliant: number }>;
  } {
    const results: ExtensionTestResult[] = [];
    const summary: Record<GradeLevel, { total: number; compliant: number }> = {
      0: { total: 0, compliant: 0 },
      1: { total: 0, compliant: 0 },
      2: { total: 0, compliant: 0 },
      3: { total: 0, compliant: 0 },
      4: { total: 0, compliant: 0 }
    };

    // Test templates for each grade level
    for (let grade = 0; grade <= 4; grade++) {
      const templates = this.getExtensionTemplates(grade as GradeLevel, userType);
      
      templates.forEach((template, index) => {
        // Replace placeholder with actual username
        const processedTemplate = template.replace(/{userName}/g, userName);
        
        // Validate against grade level vocabulary
        const validation = validateSentence(processedTemplate, grade as GradeLevel, userName);
        
        // Advisory coverage metric
        const { computeCoverage } = require('@/utils/vocabCoverage');
        const coverage = computeCoverage(processedTemplate, grade as GradeLevel, { userName }).coverage;
        
        const result: ExtensionTestResult = {
          gradeLevel: grade as GradeLevel,
          templateIndex: index,
          template: processedTemplate,
          isValid: validation.isValid,
          invalidWords: validation.invalidWords,
          coverage
        };
        
        results.push(result);
        summary[grade as GradeLevel].total++;
        if (validation.isValid) {
          summary[grade as GradeLevel].compliant++;
        }
      });
    }

    const allCompliant = results.every(r => r.isValid);

    return { allCompliant, results, summary };
  }

  /**
   * Generate detailed report of extension template validation
   */
  static generateValidationReport(userName: string = 'Sequoia', userType: 'free' | 'premium' = 'premium'): string {
    const testResults = this.testAllExtensionTemplates(userName, userType);
    const report = [
      '🧪 Extension Template Vocabulary Validation Report',
      '=' .repeat(60),
      `✅ Overall Compliance: ${testResults.allCompliant ? 'PASS' : 'FAIL'}`,
      ''
    ];

    // Summary by grade level with advisory coverage
    report.push('📊 Grade Level Summary:');
    for (let grade = 0; grade <= 4; grade++) {
      const summary = testResults.summary[grade as GradeLevel];
      const gradeResults = testResults.results.filter(r => r.gradeLevel === (grade as GradeLevel));
      const avgCoverage = gradeResults.length
        ? Math.round((gradeResults.reduce((a, r) => a + r.coverage, 0) / gradeResults.length) * 100)
        : 100;
      const percentage = Math.round((summary.compliant / summary.total) * 100);
      report.push(`  Level ${grade}: ${summary.compliant}/${summary.total} (${percentage}%) compliant | avg coverage: ${avgCoverage}%`);
    }
    report.push('');

    // Detailed violations (advisory)
    const violations = testResults.results.filter(r => !r.isValid);
    if (violations.length > 0) {
      report.push('🚨 Vocabulary Violations Found (advisory only):');
      violations.forEach((violation, index) => {
        report.push(`${index + 1}. Level ${violation.gradeLevel}, Template ${violation.templateIndex}:`);
        report.push(`   "${violation.template}"`);
        report.push(`   Invalid words: ${violation.invalidWords.join(', ')}`);
        report.push(`   Coverage: ${Math.round(violation.coverage * 100)}%`);
        report.push('');
      });
    } else {
      report.push('🎉 No vocabulary violations found!');
    }

    return report.join('\n');
  }

  /**
   * Get extension templates by grade level - now using proper template files
   */
  private static getExtensionTemplates(gradeLevel: GradeLevel, userType: 'free' | 'premium' = 'premium'): string[] {
    switch (gradeLevel) {
      case 0:
        // Universal access - use consolidated Level 0 extensions
        const { LEVEL_0_EXTENSIONS } = require('@/constants/newFallbackTemplates/level0Extensions');
        return LEVEL_0_EXTENSIONS.flatMap((template: string[]) => template);
      case 1:
        // Universal access - use Level 1 template scenes
        const { LEVEL_1_TEMPLATES } = require('@/constants/newFallbackTemplates/level1Templates');
        return LEVEL_1_TEMPLATES.flatMap((template: any) => template.scenes.map(scene => scene.text));
      case 2:
        // Universal access - use Level 2 template scenes
        const { LEVEL_2_TEMPLATES } = require('@/constants/newFallbackTemplates/level2Templates');
        return LEVEL_2_TEMPLATES.flatMap((template: any) => template.scenes.map(scene => scene.text));
      case 3:
        // Universal access - use Level 3 template scenes
        const { LEVEL_3_FALLBACK_TEMPLATES } = require('@/constants/newFallbackTemplates/level3Templates');
        return LEVEL_3_FALLBACK_TEMPLATES.flatMap((template: any) => template.scenes.map(scene => scene.text));
      case 4:
        // Universal access - use Level 4 template scenes
        const { LEVEL_4_TEMPLATES } = require('@/constants/newFallbackTemplates/level4Templates');
        return LEVEL_4_TEMPLATES.flatMap((template: any) => template.scenes.map(scene => scene.text));
      default:
        return ["{userName} is happy."];
    }
  }

  /**
   * Test a specific grade level's extension templates
   */
  static testGradeLevel(gradeLevel: GradeLevel, userName: string = 'Sequoia', userType: 'free' | 'premium' = 'premium'): {
    grade: GradeLevel;
    templates: string[];
    results: ExtensionTestResult[];
    isCompliant: boolean;
  } {
    const templates = this.getExtensionTemplates(gradeLevel, userType);
    const results: ExtensionTestResult[] = [];

    templates.forEach((template, index) => {
      const processedTemplate = template.replace(/{userName}/g, userName);
      const validation = validateSentence(processedTemplate, gradeLevel, userName);
      const { computeCoverage } = require('@/utils/vocabCoverage');
      const coverage = computeCoverage(processedTemplate, gradeLevel, { userName }).coverage;
      
      results.push({
        gradeLevel,
        templateIndex: index,
        template: processedTemplate,
        isValid: validation.isValid,
        invalidWords: validation.invalidWords,
        coverage
      });
    });

    const isCompliant = results.every(r => r.isValid);

    return {
      grade: gradeLevel,
      templates,
      results,
      isCompliant
    };
  }
}

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment - you can run this manually
  (window as any).ExtensionTemplateValidator = ExtensionTemplateValidator;
  console.log('💡 Use ExtensionTemplateValidator.generateValidationReport() to test extension templates');
}