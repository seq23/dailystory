/**
 * Level 0 Vocabulary Auditor - Ensures ALL content complies with Dolch Pre-Primer standards
 * This tool helps identify any remaining vocabulary violations in Level 0 content
 */

import { LEVEL_0_VOCABULARY } from '@/constants/gradeBased/level0Vocabulary';

export interface VocabularyAuditResult {
  isCompliant: boolean;
  violations: {
    word: string;
    occurrences: string[];
  }[];
  totalViolations: number;
  compliancePercentage: number;
}

export class Level0VocabularyAuditor {
  /**
   * Audit text content for Level 0 vocabulary compliance
   */
  static auditText(text: string, context: string = 'unknown', userName?: string): VocabularyAuditResult {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 0);

    const violations: { [word: string]: string[] } = {};
    const userNameLower = userName?.toLowerCase();

    words.forEach(word => {
      // Skip user names
      if (userNameLower && word === userNameLower) {
        return;
      }

      // Check if word is in Level 0 vocabulary
      if (!LEVEL_0_VOCABULARY.has(word)) {
        if (!violations[word]) {
          violations[word] = [];
        }
        violations[word].push(context);
      }
    });

    const violationEntries = Object.entries(violations).map(([word, occurrences]) => ({
      word,
      occurrences
    }));

    const totalWords = words.filter(word => !(userNameLower && word === userNameLower)).length;
    const totalViolations = violationEntries.reduce((sum, v) => sum + v.occurrences.length, 0);
    const compliancePercentage = totalWords > 0 ? Math.round(((totalWords - totalViolations) / totalWords) * 100) : 100;

    return {
      isCompliant: violationEntries.length === 0,
      violations: violationEntries,
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
  static generateAuditReport(auditResult: VocabularyAuditResult, title: string = 'Vocabulary Audit'): string {
    const report = [
      `\n📊 ${title}`,
      `${'='.repeat(50)}`,
      `✅ Compliant: ${auditResult.isCompliant ? 'YES' : 'NO'}`,
      `📈 Compliance: ${auditResult.compliancePercentage}%`,
      `🚨 Total Violations: ${auditResult.totalViolations}`,
      ''
    ];

    if (auditResult.violations.length > 0) {
      report.push('🔍 Vocabulary Violations:');
      auditResult.violations.forEach((violation, index) => {
        report.push(`${index + 1}. "${violation.word}" (found in: ${violation.occurrences.join(', ')})`);
      });
      report.push('');
      report.push('📚 Reminder: Level 0 should ONLY use these 40 Dolch Pre-Primer words:');
      report.push(Array.from(LEVEL_0_VOCABULARY).sort().join(', '));
    } else {
      report.push('🎉 All vocabulary complies with Dolch Pre-Primer standards!');
    }

    return report.join('\n');
  }

  /**
   * Quick validation for single sentences
   */
  static validateSentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[] } {
    const auditResult = this.auditText(sentence, 'sentence', userName);
    return {
      isValid: auditResult.isCompliant,
      invalidWords: auditResult.violations.map(v => v.word)
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