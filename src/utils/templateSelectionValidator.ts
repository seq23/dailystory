// Template Selection Validator - Ensures main templates are used correctly
import { GradeLevel } from '@/constants/gradeBased';
import { getTemplateCountByGradeLevel, selectTemplate } from '@/constants/gradeBased/unifiedTemplateSystem';

export class TemplateSelectionValidator {
  /**
   * Validate that template selection is working correctly for all levels
   */
  static validateAllLevels(): { isValid: boolean; errors: string[]; report: any } {
    const errors: string[] = [];
    const report: any = {
      timestamp: new Date().toISOString(),
      levels: {}
    };

    console.log('🔍 TemplateSelectionValidator: Starting validation for all levels...');

    // Test each level 1-4
    for (let grade = 1; grade <= 4; grade++) {
      const gradeLevel = grade as GradeLevel;
      const levelReport = this.validateLevel(gradeLevel);
      
      report.levels[gradeLevel] = levelReport;
      
      if (!levelReport.isValid) {
        errors.push(...levelReport.errors.map(err => `Level ${gradeLevel}: ${err}`));
      }
    }

    const isValid = errors.length === 0;
    
    console.log(`${isValid ? '✅' : '❌'} TemplateSelectionValidator: Validation ${isValid ? 'PASSED' : 'FAILED'}`);
    if (!isValid) {
      console.error('❌ Template Selection Errors:', errors);
    }

    return { isValid, errors, report };
  }

  /**
   * Validate template selection for a specific level
   */
  private static validateLevel(gradeLevel: GradeLevel): { 
    isValid: boolean; 
    errors: string[]; 
    templateCount: number;
    sampleSelections: number[];
  } {
    const errors: string[] = [];
    const totalTemplates = getTemplateCountByGradeLevel(gradeLevel, false); // Main templates only
    const sampleSelections: number[] = [];

    console.log(`🔍 Validating Level ${gradeLevel}: ${totalTemplates} main templates available`);

    // Test 1: Verify template count is 40 for levels 1-4
    if (totalTemplates !== 40) {
      errors.push(`Expected 40 main templates, got ${totalTemplates}`);
    }

    // Test 2: Sample 10 random selections to ensure they're in valid range
    for (let i = 0; i < 10; i++) {
      try {
        const usedTemplates = sampleSelections; // Build up used list
        const result = selectTemplate(gradeLevel, usedTemplates);
        
        // Validate index is in main template range
        if (result.templateIndex < 0 || result.templateIndex >= totalTemplates) {
          errors.push(`Selection ${i + 1}: Index ${result.templateIndex} outside valid range [0-${totalTemplates - 1}]`);
        }
        
        // Validate template is not empty
        if (!result.template || result.template.length === 0) {
          errors.push(`Selection ${i + 1}: Empty template returned for index ${result.templateIndex}`);
        }
        
        sampleSelections.push(result.templateIndex);
      } catch (error) {
        errors.push(`Selection ${i + 1}: Exception thrown - ${error}`);
      }
    }

    // Test 3: Verify no duplicates in first 10 selections (anti-repetition working)
    const uniqueSelections = new Set(sampleSelections);
    if (uniqueSelections.size < Math.min(8, sampleSelections.length)) {
      errors.push(`Anti-repetition failure: Only ${uniqueSelections.size} unique selections in ${sampleSelections.length} attempts`);
    }

    const isValid = errors.length === 0;
    
    console.log(`${isValid ? '✅' : '❌'} Level ${gradeLevel}: ${isValid ? 'VALID' : 'INVALID'} - ${errors.length} errors`);

    return {
      isValid,
      errors,
      templateCount: totalTemplates,
      sampleSelections
    };
  }

  /**
   * Test specific difficulty transition scenarios
   */
  static validateDifficultyTransitions(): { isValid: boolean; errors: string[]; report: any } {
    const errors: string[] = [];
    const report: any = {
      timestamp: new Date().toISOString(),
      transitions: {}
    };

    console.log('🔄 Testing difficulty transitions...');

    // Test Level 3 → Level 4 transition (the reported issue)
    const level3Templates = getTemplateCountByGradeLevel(3, false);
    const level4Templates = getTemplateCountByGradeLevel(4, false);

    if (level3Templates !== 40) {
      errors.push(`Level 3: Expected 40 templates, got ${level3Templates}`);
    }

    if (level4Templates !== 40) {
      errors.push(`Level 4: Expected 40 templates, got ${level4Templates}`);
    }

    // Simulate Level 3 usage then transition to Level 4
    try {
      const level3Selection = selectTemplate(3, []);
      const level4Selection = selectTemplate(4, []);

      report.transitions['level3_to_level4'] = {
        level3Selection: level3Selection.templateIndex,
        level4Selection: level4Selection.templateIndex,
        level3TemplateCount: level3Templates,
        level4TemplateCount: level4Templates
      };

      if (level4Selection.templateIndex >= level4Templates) {
        errors.push(`Level 4 transition: Selected index ${level4Selection.templateIndex} exceeds template count ${level4Templates}`);
      }
    } catch (error) {
      errors.push(`Level 3→4 transition failed: ${error}`);
    }

    const isValid = errors.length === 0;
    
    console.log(`${isValid ? '✅' : '❌'} Difficulty transitions: ${isValid ? 'VALID' : 'INVALID'}`);

    return { isValid, errors, report };
  }
}

// Expose for development testing
if (typeof window !== 'undefined') {
  (window as any).TemplateSelectionValidator = TemplateSelectionValidator;
}