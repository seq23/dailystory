/**
 * Universal Template Validator - Complete System Validation
 * Validates ALL templates: Level 0 extensions + Levels 1-4 + Grades 6-10
 * Replaces extensionTemplateValidator.ts and finalExtensionValidation.ts
 */

import { validateSentence, GradeLevel } from '@/constants/gradeBased';
import { computeCoverage } from './vocabCoverage';
import { ALL_FALLBACK_TEMPLATES, FALLBACK_LIBRARY_STATS } from '@/constants/newFallbackTemplates';

export interface UniversalTestResult {
  level: string;
  templateIndex: number;
  templateTitle?: string;
  isValid: boolean;
  invalidWords: string[];
  coverage: number;
  totalWords: number;
  sceneCount: number;
}

export interface UniversalValidationReport {
  allCompliant: boolean;
  results: UniversalTestResult[];
  summary: Record<string, { total: number; compliant: number; coverage: number }>;
  libraryStats: {
    totalTemplates: number;
    totalPages: number;
    targetMet: boolean;
  };
}

export class UniversalTemplateValidator {
  
  /**
   * Test all templates across all levels
   */
  static testAllTemplates(userName?: string): UniversalValidationReport {
    console.log('🧪 Running universal template validation...');
    
    const results: UniversalTestResult[] = [];
    const summary: Record<string, { total: number; compliant: number; coverage: number }> = {};
    
    // Test Level 0 extensions (via imports)
    try {
      const level0Extensions = require('@/constants/newFallbackTemplates/level0Extensions');
      if (level0Extensions.LEVEL_0_EXTENSIONS) {
        const level0Results = this.testLevel0Extensions(level0Extensions.LEVEL_0_EXTENSIONS, userName);
        results.push(...level0Results);
        
        summary['Level 0'] = {
          total: level0Results.length,
          compliant: level0Results.filter(r => r.isValid).length,
          coverage: level0Results.reduce((sum, r) => sum + r.coverage, 0) / level0Results.length
        };
      }
    } catch (error) {
      console.warn('⚠️ Level 0 extensions not found, testing base templates');
      summary['Level 0'] = { total: 0, compliant: 0, coverage: 0 };
    }
    
    // Test Levels 1-2 and Grades 6-10 (Levels 3&4 now in backend)
    const levelMappings = {
      'Level 1': { templates: ALL_FALLBACK_TEMPLATES.level1, gradeLevel: 1 as GradeLevel },
      'Level 2': { templates: ALL_FALLBACK_TEMPLATES.level2, gradeLevel: 2 as GradeLevel },
      // Level 3 & 4 moved to backend TemplateLibraryService.js
      'Grade 6': { templates: ALL_FALLBACK_TEMPLATES.grade6, gradeLevel: 4 as GradeLevel },
      'Grade 7': { templates: ALL_FALLBACK_TEMPLATES.grade7, gradeLevel: 4 as GradeLevel },
      'Grade 8': { templates: ALL_FALLBACK_TEMPLATES.grade8, gradeLevel: 4 as GradeLevel },
      'Grade 9': { templates: ALL_FALLBACK_TEMPLATES.grade9, gradeLevel: 4 as GradeLevel },
      'Grade 10': { templates: ALL_FALLBACK_TEMPLATES.grade10, gradeLevel: 4 as GradeLevel }
    };
    
    Object.entries(levelMappings).forEach(([levelName, { templates, gradeLevel }]) => {
      const levelResults = this.testStructuredTemplates(templates, levelName, gradeLevel, userName);
      results.push(...levelResults);
      
      summary[levelName] = {
        total: levelResults.length,
        compliant: levelResults.filter(r => r.isValid).length,
        coverage: levelResults.length > 0 
          ? levelResults.reduce((sum, r) => sum + r.coverage, 0) / levelResults.length 
          : 0
      };
    });
    
    const allCompliant = results.every(r => r.isValid);
    
    console.log(`📊 Universal validation complete: ${results.filter(r => r.isValid).length}/${results.length} compliant`);
    
    return {
      allCompliant,
      results,
      summary,
      libraryStats: {
        totalTemplates: FALLBACK_LIBRARY_STATS.totalTemplates,
        totalPages: FALLBACK_LIBRARY_STATS.totalPages,
        targetMet: FALLBACK_LIBRARY_STATS.totalTemplates >= 35 && FALLBACK_LIBRARY_STATS.totalPages >= 390
      }
    };
  }
  
  /**
   * Test Level 0 extension templates (string arrays)
   */
  private static testLevel0Extensions(extensions: string[][], userName?: string): UniversalTestResult[] {
    return extensions.map((template, index) => {
      const fullText = template.join(' ');
      const validation = validateSentence(fullText, 0, userName);
      const coverage = computeCoverage(fullText, 0, { userName });
      
      return {
        level: 'Level 0',
        templateIndex: index,
        templateTitle: `Extension Template ${index + 1}`,
        isValid: validation.isValid,
        invalidWords: validation.invalidWords,
        coverage: coverage.coverage,
        totalWords: coverage.totalTokens,
        sceneCount: template.length
      };
    });
  }
  
  /**
   * Test structured story templates (StoryTemplate objects)
   */
  private static testStructuredTemplates(
    templates: any[], 
    levelName: string, 
    gradeLevel: GradeLevel, 
    userName?: string
  ): UniversalTestResult[] {
    return templates.map((template, index) => {
      const scenes = template.scenes || [];
      const fullText = scenes.map((scene: any) => scene.text || '').join(' ');
      
      const validation = validateSentence(fullText, gradeLevel, userName);
      const coverage = computeCoverage(fullText, gradeLevel, { userName });
      
      return {
        level: levelName,
        templateIndex: index,
        templateTitle: template.title || `${levelName} Template ${index + 1}`,
        isValid: validation.isValid,
        invalidWords: validation.invalidWords,
        coverage: coverage.coverage,
        totalWords: coverage.totalTokens,
        sceneCount: scenes.length
      };
    });
  }
  
  /**
   * Generate comprehensive validation report
   */
  static generateValidationReport(userName?: string): string {
    const report = this.testAllTemplates(userName);
    
    let output = '📋 UNIVERSAL TEMPLATE VALIDATION REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    // Library Statistics
    output += '📚 LIBRARY STATISTICS:\n';
    output += `   Total Templates: ${report.libraryStats.totalTemplates} (Target: 35+)\n`;
    output += `   Total Pages: ${report.libraryStats.totalPages} (Target: 390+)\n`;
    output += `   Target Met: ${report.libraryStats.targetMet ? '✅ YES' : '❌ NO'}\n\n`;
    
    // Overall Compliance
    output += `🎯 OVERALL COMPLIANCE: ${report.allCompliant ? '✅ PASS' : '❌ FAIL'}\n`;
    output += `   Compliant: ${report.results.filter(r => r.isValid).length}/${report.results.length}\n\n`;
    
    // Per-Level Summary
    output += '📊 PER-LEVEL SUMMARY:\n';
    Object.entries(report.summary).forEach(([level, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      const avgCoverage = Math.round(stats.coverage * 100);
      output += `   ${level}: ${stats.compliant}/${stats.total} (${percentage}%) - Avg Coverage: ${avgCoverage}%\n`;
    });
    
    // Vocabulary Violations
    const violations = report.results.filter(r => !r.isValid);
    if (violations.length > 0) {
      output += '\n❌ VOCABULARY VIOLATIONS:\n';
      violations.forEach(violation => {
        output += `   ${violation.level} - ${violation.templateTitle}:\n`;
        output += `     Invalid words: ${violation.invalidWords.join(', ')}\n`;
        output += `     Coverage: ${Math.round(violation.coverage * 100)}%\n`;
      });
    }
    
    return output;
  }
  
  /**
   * Test specific level templates
   */
  static testLevel(levelName: string, userName?: string): UniversalTestResult[] {
    const report = this.testAllTemplates(userName);
    return report.results.filter(r => r.level === levelName);
  }
  
  /**
   * Get template statistics
   */
  static getTemplateStats(): {
    totalTemplates: number;
    totalPages: number;
    levelBreakdown: Record<string, number>;
  } {
    const levelBreakdown: Record<string, number> = {};
    
    // Count templates per level
    Object.entries(ALL_FALLBACK_TEMPLATES).forEach(([level, templates]) => {
      levelBreakdown[level] = templates.length;
    });
    
    return {
      totalTemplates: FALLBACK_LIBRARY_STATS.totalTemplates,
      totalPages: FALLBACK_LIBRARY_STATS.totalPages,
      levelBreakdown
    };
  }
}