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
   * Get extension templates by grade level with tiered vocabulary support
   */
  private static getExtensionTemplates(gradeLevel: GradeLevel, userType: 'free' | 'premium' = 'premium'): string[] {
    switch (gradeLevel) {
      case 0:
        return userType === 'free' ? [
          // FREE: Only 40 Dolch Pre-Primer words
          "{userName} can play.",
          "{userName} said here.",
          "{userName} go up.",
          "{userName} see me.",
          "{userName} run away."
        ] : [
          // PREMIUM: 59 enhanced words
          "{userName} is happy.",
          "{userName} had fun today.",
          "{userName} wants to play more.",
          "{userName} loves this story.",
          "{userName} will come back."
        ];
      
      case 1:
        return [
          "{userName} learned something new today.",
          "{userName} feels proud of what they did.",
          "{userName} wants to tell friends about this.",
          "{userName} had the best day ever.",
          "{userName} cannot wait for tomorrow."
        ];
      
      case 2:
        return [
          "{userName} found something new and fun.",
          "{userName} thought they could do more than before.",
          "{userName} wanted to tell friends about this.",
          "{userName} felt ready to try new things.",
          "{userName} learned that practice helps you get better."
        ];
      
      case 3:
        return [
          "{userName} walked through the forest and found a small bird.",
          "{userName} helped the bird find its way back to its nest.",
          "{userName} learned that being kind to animals is important.",
          "{userName} felt good about helping someone in need.",
          "{userName} promised to always help others when possible."
        ];
      
      case 4:
        return [
          "{userName} discovered an interesting book about nature in the library.",
          "{userName} spent hours reading about different animals and plants.",
          "{userName} shared the knowledge with classmates during science class.",
          "{userName} decided to start a nature club at school.",
          "{userName} organized trips to explore the local park and forest."
        ];
      
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