/**
 * Level 0 Vocabulary Auditor - Ensures ALL content complies with Enhanced Level 0 standards (50% compliance)
 * This tool helps identify any remaining vocabulary violations in Level 0 content
 */

import { ENHANCED_LEVEL_0_VOCABULARY } from '@/constants/dolchPrePrimer';
import { validateLevel0SentenceByUserType } from '../constants/dolchPrePrimer';

export interface VocabularyAuditResult {
  isCompliant: boolean;
  violations: string[];
  totalViolations: number;
  compliancePercentage: number;
}

export class Level0VocabularyAuditor {
  /**
   * Audit text content for Level 0 vocabulary and grammar compliance (50% threshold)
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
    
    // Update compliance threshold to 50% for Level 0
    const isCompliant = compliancePercentage >= 50;
    
    return {
      isCompliant,
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
   * Generate a detailed audit report with 50% compliance threshold
   */
  static generateAuditReport(auditResult: VocabularyAuditResult, title: string = 'Level 0 Vocabulary & Grammar Audit (50% Compliance)'): string {
    const report = [
      `\n📊 ${title}`,
      `${'='.repeat(50)}`,
      `✅ Compliant (≥50%): ${auditResult.isCompliant ? 'YES' : 'NO'}`,
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
      report.push('📚 Reminder: Level 0 allows 50% compliance with these 100 Enhanced Level 0 words:');
      report.push(Array.from(ENHANCED_LEVEL_0_VOCABULARY).sort().join(', '));
      report.push('');
      report.push('🎯 50% of words can be story-specific, user inputs, or slightly advanced vocabulary.');
    } else {
      report.push('🎉 All content meets the 50% vocabulary compliance standard!');
    }

    return report.join('\n');
  }

  /**
   * Quick validation for single sentences with 50% compliance
   */
  static validateSentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[]; grammarErrors: string[]; compliancePercentage: number } {
    const validation = validateLevel0SentenceByUserType(sentence, 'free', userName);
    const auditResult = this.auditText(sentence, 'single-sentence', userName);
    
    return {
      isValid: auditResult.compliancePercentage >= 50,
      invalidWords: validation.invalidWords,
      grammarErrors: validation.grammarErrors || [],
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
    return ENHANCED_LEVEL_0_VOCABULARY.has(cleanWord);
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