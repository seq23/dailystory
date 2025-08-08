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
        
        const result: ExtensionTestResult = {
          gradeLevel: grade as GradeLevel,
          templateIndex: index,
          template: processedTemplate,
          isValid: validation.isValid,
          invalidWords: validation.invalidWords
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

    // Summary by grade level
    report.push('📊 Grade Level Summary:');
    for (let grade = 0; grade <= 4; grade++) {
      const summary = testResults.summary[grade as GradeLevel];
      const percentage = Math.round((summary.compliant / summary.total) * 100);
      report.push(`  Level ${grade}: ${summary.compliant}/${summary.total} (${percentage}%) compliant`);
    }
    report.push('');

    // Detailed violations
    const violations = testResults.results.filter(r => !r.isValid);
    if (violations.length > 0) {
      report.push('🚨 Vocabulary Violations Found:');
      violations.forEach((violation, index) => {
        report.push(`${index + 1}. Level ${violation.gradeLevel}, Template ${violation.templateIndex}:`);
        report.push(`   "${violation.template}"`);
        report.push(`   Invalid words: ${violation.invalidWords.join(', ')}`);
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
        // Universal access - all users get same templates
        const { getAllLevel0Extensions } = require('@/constants/gradeBased/level0ExtensionTemplates');
        return getAllLevel0Extensions().flatMap((template: string[]) => template);
      case 1:
        // Universal access - all users get same templates
        const { getAllLevel1Extensions } = require('@/constants/gradeBased/level1ExtensionTemplates');
        return getAllLevel1Extensions().flatMap((template: string[]) => template);
      case 2:
        // Universal access - all users get same templates
        const { getAllLevel2Extensions } = require('@/constants/gradeBased/level2ExtensionTemplates');
        return getAllLevel2Extensions().flatMap((template: string[]) => template);
      case 3:
        // Universal access - all users get same templates
        const { getAllLevel3Extensions } = require('@/constants/gradeBased/level3ExtensionTemplates');
        return getAllLevel3Extensions().flatMap((template: string[]) => template);
      case 4:
        // Universal access - all users get same templates
        const { getAllLevel4Extensions } = require('@/constants/gradeBased/level4ExtensionTemplates');
        return getAllLevel4Extensions().flatMap((template: string[]) => template);
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
      
      results.push({
        gradeLevel,
        templateIndex: index,
        template: processedTemplate,
        isValid: validation.isValid,
        invalidWords: validation.invalidWords
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