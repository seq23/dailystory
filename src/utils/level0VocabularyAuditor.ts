/**
 * Level 0 Vocabulary Auditor - Ensures ALL content complies with Dolch Pre-Primer standards
 * This tool helps identify any remaining vocabulary violations in Level 0 content
 */

import { FREE_LEVEL_0_VOCABULARY as LEVEL_0_VOCABULARY } from '@/constants/dolchPrePrimer';
import { validateLevel0SentenceByUserType } from '../constants/dolchPrePrimer';

export interface VocabularyAuditResult {
  isCompliant: boolean;
  violations: string[];
  totalViolations: number;
  compliancePercentage: number;
}

export class Level0VocabularyAuditor {
  /**
   * Audit text content for Level 0 vocabulary and grammar compliance
   */
  static auditText(text: string, context: string = 'unknown', userName?: string): VocabularyAuditResult {
    const sentences = text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    let totalViolations = 0;
    const violations: string[] = [];
    
    sentences.forEach((sentence, index) => {
      const validation = validateLevel0SentenceByUserType(sentence, 'free', userName);
      if (!validation.isValid) {
        // Add vocabulary violations
        validation.invalidWords.forEach(word => {
          violations.push(`[${context}] Sentence ${index + 1}: "${word}" not in Level 0 vocabulary`);
          totalViolations++;
        });
        
        // Add grammar violations
        if (validation.grammarErrors && validation.grammarErrors.length > 0) {
          validation.grammarErrors.forEach(error => {
            violations.push(`[${context}] Sentence ${index + 1}: Grammar - ${error}`);
            totalViolations++;
          });
        }
      }
    });
    
    const totalWords = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    const compliantWords = totalWords - totalViolations;
    const compliancePercentage = totalWords > 0 ? Math.round((compliantWords / totalWords) * 100) : 100;
    
    return {
      isCompliant: violations.length === 0,
      violations,
      totalViolations,
      compliancePercentage
    };
  }

  /**
   * Audit an array of story pages
   */
  static auditStoryPages(pages: string[], userName?: string): VocabularyAuditResult {
    const combinedText = pages.join(' ');
    return this.auditText(combinedText, 'story-pages', userName);
  }

  /**
   * Audit template arrays for vocabulary compliance
   */
  static auditTemplates(templates: string[][], templateName: string = 'templates', userName?: string): VocabularyAuditResult {
    const allTemplateText = templates.flat().join(' ');
    return this.auditText(allTemplateText, templateName, userName);
  }

  /**
   * Generate a detailed audit report
   */
  static generateAuditReport(auditResult: VocabularyAuditResult, title: string = 'Vocabulary & Grammar Audit'): string {
    const report = [
      `\n📊 ${title}`,
      `${'='.repeat(50)}`,
      `✅ Compliant: ${auditResult.isCompliant ? 'YES' : 'NO'}`,
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
      report.push('📚 Reminder: Level 0 should ONLY use these 40 Dolch Pre-Primer words:');
      report.push(Array.from(LEVEL_0_VOCABULARY).sort().join(', '));
    } else {
      report.push('🎉 All content complies with vocabulary and grammar standards!');
    }

    return report.join('\n');
  }

  /**
   * Quick validation for single sentences
   */
  static validateSentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[]; grammarErrors: string[] } {
    const validation = validateLevel0SentenceByUserType(sentence, 'free', userName);
    return {
      isValid: validation.isValid,
      invalidWords: validation.invalidWords,
      grammarErrors: validation.grammarErrors || []
    };
  }

  /**
   * Real-time vocabulary checker for content generation
   */
  static isWordAllowed(word: string, userName?: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (!cleanWord) return true;
    
    // Allow user names
    if (userName && cleanWord === userName.toLowerCase()) {
      return true;
    }

    return LEVEL_0_VOCABULARY.has(cleanWord);
  }
}