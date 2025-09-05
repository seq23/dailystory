/**
 * Level 0 Vocabulary Auditor - Educational Standards Migration
 * Uses educational compliance instead of static vocabulary validation
 * Aligns with backend educational standards approach
 */

import { 
  LEVEL_0_VOCABULARY,
  validateLevel0Sentence,
  type GradeLevel
} from '@/constants/gradeBased';
import { 
  calculateEducationalCompliance,
  isEducationallyAppropriate,
  getEducationalLevelInfo
} from '@/constants/educationalStandards';

export interface VocabularyAuditResult {
  isCompliant: boolean;
  violations: string[];
  totalViolations: number;
  compliancePercentage: number;
  educationalLevel?: GradeLevel;
  threshold?: number;
}

export class Level0VocabularyAuditor {
  /**
   * Audit text content using educational compliance standards
   */
  static auditText(text: string, context: string = 'unknown', userName?: string, educationalLevel: GradeLevel = 0): VocabularyAuditResult {
    // Use educational compliance calculation
    const compliance = calculateEducationalCompliance(text, educationalLevel, userName);
    const levelInfo = getEducationalLevelInfo(educationalLevel);
    
    const violations = compliance.inappropriateWords.map((word, index) => 
      `[${context}] Word ${index + 1}: "${word}" not appropriate for educational level ${educationalLevel}`
    );
    
    return {
      isCompliant: compliance.isCompliant,
      violations,
      totalViolations: compliance.inappropriateWords.length,
      compliancePercentage: compliance.compliancePercentage,
      educationalLevel,
      threshold: levelInfo.complianceThreshold
    };
  }

  /**
   * Audit an array of story pages using educational standards
   */
  static auditStoryPages(pages: string[], userName?: string, educationalLevel: GradeLevel = 0): VocabularyAuditResult {
    const combinedText = pages.join(' ');
    return this.auditText(combinedText, 'story-pages', userName, educationalLevel);
  }

  /**
   * Audit templates using educational compliance
   */
  static auditTemplates(templates: string[][], templateName: string = 'templates', userName?: string, educationalLevel: GradeLevel = 0): VocabularyAuditResult {
    const allTemplateText = templates.flat().join(' ');
    return this.auditText(allTemplateText, templateName, userName, educationalLevel);
  }

  /**
   * Generate detailed audit report using educational compliance
   */
  static generateAuditReport(auditResult: VocabularyAuditResult, title: string = 'Educational Compliance Audit'): string {
    const level = auditResult.educationalLevel ?? 0;
    const threshold = auditResult.threshold ?? 50;
    
    const report = [
      `\n📊 ${title} (Level ${level} - ${threshold}% Required)`,
      `${'='.repeat(50)}`,
      `✅ Compliant (≥${threshold}%): ${auditResult.isCompliant ? 'YES' : 'NO'}`,
      `📈 Compliance: ${auditResult.compliancePercentage}%`,
      `🚨 Total Violations: ${auditResult.totalViolations}`,
      ''
    ];

    if (auditResult.violations.length > 0) {
      report.push('🔍 Violations Found:');
      auditResult.violations.forEach((violation, index) => {
        report.push(`${index + 1}. ${violation}`);
      });
      report.push('');
      report.push(`📚 Educational Level ${level} allows ${100 - threshold}% flexibility for story-specific and user vocabulary.`);
    } else {
      report.push(`🎉 All content meets Level ${level} educational compliance standards!`);
    }

    return report.join('\n');
  }

  /**
   * Quick validation for single sentences with 50% compliance (grammar validation moved to edge functions)
   */
  static validateSentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[]; compliancePercentage: number } {
    const validation = validateLevel0Sentence(sentence, userName);
    const auditResult = this.auditText(sentence, 'single-sentence', userName);
    
    return {
      isValid: auditResult.compliancePercentage >= 50,
      invalidWords: validation.invalidWords,
      compliancePercentage: auditResult.compliancePercentage
    };
  }

  /**
   * Real-time vocabulary checker with 50% flexibility
   */
  static isWordAllowed(word: string, userName?: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (!cleanWord) return true;
    
    // Allow user names
    if (userName && cleanWord === userName.toLowerCase()) {
      return true;
    }

    // With 50% compliance, individual words are more flexible
    return LEVEL_0_VOCABULARY.has(cleanWord);
  }

  /**
   * Audit vocabulary-compliant templates specifically
   */
  static auditVocabularyCompliantTemplates(templates: string[][], userName?: string): VocabularyAuditResult {
    const result = this.auditTemplates(templates, 'vocabulary-compliant-level0', userName);
    
    console.log(`📊 Vocabulary-Compliant Level 0 Templates Audit:`);
    console.log(`   Templates: ${templates.length}`);
    console.log(`   Compliance: ${result.compliancePercentage}%`);  
    console.log(`   Violations: ${result.totalViolations}`);
    console.log(`   Status: ${result.isCompliant ? '✅ PASSED' : '❌ FAILED'}`);
    
    return result;
  }
}