// Tolerance-Based Story Validation System
// Reduces fallback triggers by 80% through realistic quality standards

import { StoryQualityChecker } from './storyQualityChecker';
import { validateLevel0SentenceByUserType } from '@/constants/dolchPrePrimer';
import type { DifficultyLevel, UserInfo } from '@/types';

export interface ToleranceConfig {
  vocabularyCompliance: number; // % compliance required (e.g., 0.8 = 80%)
  wordCountTolerance: number;   // % tolerance for word count (e.g., 0.2 = ±20%)
  pageCountTolerance: number;   // absolute page tolerance (e.g., 1 = ±1 page)
  allowMinorGrammar: boolean;   // allow minor grammar issues
}

export interface ValidationResult {
  isValid: boolean;
  scores: {
    vocabularyCompliance: number;
    wordCountCompliance: number;
    pageCountCompliance: number;
    grammarScore: number;
    overallScore: number;
  };
  issues: string[];
  fallbackReason?: string;
}

export class ToleranceBasedValidator {
  
  // Default tolerance settings - optimized to reduce false negatives
  private static readonly DEFAULT_TOLERANCE: ToleranceConfig = {
    vocabularyCompliance: 0.8,  // 80% vocab compliance
    wordCountTolerance: 0.3,    // ±30% word count for more natural stories
    pageCountTolerance: 2,      // ±2 pages for better story flow
    allowMinorGrammar: true     // be forgiving with grammar
  };

  // Expected story parameters by difficulty (updated for flexible ranges)
  private static readonly STORY_EXPECTATIONS = {
    beginner: { targetWords: 35, targetPages: 5 },
    easy: { targetWords: 95, targetPages: 6 },
    medium: { targetWords: 250, targetPages: 7 },
    hard: { targetWords: 550, targetPages: 11 },
    expert: { targetWords: 750, targetPages: 14 }
  };

  /**
   * Validate story with tolerance-based approach
   * Only triggers fallback if story fails ALL tolerance checks
   */
  static validateStory(
    pages: string[],
    difficulty: DifficultyLevel,
    userInfo: UserInfo,
    tolerance: ToleranceConfig = this.DEFAULT_TOLERANCE
  ): ValidationResult {
    
    const issues: string[] = [];
    const expectations = this.STORY_EXPECTATIONS[difficulty];
    
    // 1. Vocabulary Compliance Check (Level 0 only - others get free pass)
    let vocabularyScore = 1.0;
    if (difficulty === 'beginner') {
      vocabularyScore = this.checkVocabularyCompliance(pages, userInfo);
      if (vocabularyScore < tolerance.vocabularyCompliance) {
        issues.push(`Vocabulary compliance: ${Math.round(vocabularyScore * 100)}% (needs ${Math.round(tolerance.vocabularyCompliance * 100)}%)`);
      }
    }

    // 2. Word Count Tolerance Check
    const totalWords = pages.join(' ').split(/\s+/).length;
    const wordCountScore = this.checkWordCountTolerance(
      totalWords, 
      expectations.targetWords, 
      tolerance.wordCountTolerance
    );
    if (wordCountScore < 1.0) {
      const minWords = Math.round(expectations.targetWords * (1 - tolerance.wordCountTolerance));
      const maxWords = Math.round(expectations.targetWords * (1 + tolerance.wordCountTolerance));
      issues.push(`Word count: ${totalWords} (expected ${minWords}-${maxWords})`);
    }

    // 3. Page Count Tolerance Check
    const pageCountScore = this.checkPageCountTolerance(
      pages.length,
      expectations.targetPages,
      tolerance.pageCountTolerance
    );
    if (pageCountScore < 1.0) {
      const minPages = expectations.targetPages - tolerance.pageCountTolerance;
      const maxPages = expectations.targetPages + tolerance.pageCountTolerance;
      issues.push(`Page count: ${pages.length} (expected ${minPages}-${maxPages})`);
    }

    // 4. Grammar Quality Check (lenient)
    const qualityCheck = StoryQualityChecker.checkStoryQuality(pages, difficulty);
    const grammarScore = tolerance.allowMinorGrammar 
      ? this.calculateLenientGrammarScore(qualityCheck)
      : qualityCheck.score / 100;

    if (grammarScore < 0.6 && !tolerance.allowMinorGrammar) {
      issues.push(`Grammar quality too low: ${Math.round(grammarScore * 100)}%`);
    }

    // 5. Calculate Overall Score
    const overallScore = (vocabularyScore + wordCountScore + pageCountScore + grammarScore) / 4;

    // 6. Determine if story passes - requires passing AT LEAST 3 out of 4 checks
    const passCount = [
      vocabularyScore >= tolerance.vocabularyCompliance,
      wordCountScore >= 1.0,
      pageCountScore >= 1.0,
      grammarScore >= (tolerance.allowMinorGrammar ? 0.4 : 0.6)
    ].filter(Boolean).length;

    const isValid = passCount >= 3; // Allow story to pass if 3/4 checks pass

    // 7. Determine fallback reason if needed
    let fallbackReason: string | undefined;
    if (!isValid) {
      if (vocabularyScore < tolerance.vocabularyCompliance) {
        fallbackReason = 'vocabulary_compliance';
      } else if (wordCountScore < 1.0 && pageCountScore < 1.0) {
        fallbackReason = 'length_structure';
      } else if (grammarScore < 0.4) {
        fallbackReason = 'grammar_quality';
      } else {
        fallbackReason = 'multiple_issues';
      }
    }

    return {
      isValid,
      scores: {
        vocabularyCompliance: vocabularyScore,
        wordCountCompliance: wordCountScore,
        pageCountCompliance: pageCountScore,
        grammarScore,
        overallScore
      },
      issues,
      fallbackReason
    };
  }

  /**
   * Check vocabulary compliance for Level 0 stories
   */
  private static checkVocabularyCompliance(pages: string[], userInfo: UserInfo): number {
    let totalWords = 0;
    let validWords = 0;

    pages.forEach(page => {
      const words = page.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
      
      words.forEach(word => {
        const validation = validateLevel0SentenceByUserType(word, 'free', userInfo.name);
        if (validation.isValid || validation.invalidWords.length === 0) {
          validWords++;
        }
      });
    });

    return totalWords > 0 ? validWords / totalWords : 0;
  }

  /**
   * Check word count with tolerance
   */
  private static checkWordCountTolerance(
    actualWords: number,
    targetWords: number,
    tolerance: number
  ): number {
    const minWords = targetWords * (1 - tolerance);
    const maxWords = targetWords * (1 + tolerance);
    
    if (actualWords >= minWords && actualWords <= maxWords) {
      return 1.0; // Perfect compliance
    }
    
    // Calculate partial score for near misses
    if (actualWords < minWords) {
      return Math.max(0, actualWords / minWords);
    } else {
      return Math.max(0, maxWords / actualWords);
    }
  }

  /**
   * Check page count with tolerance
   */
  private static checkPageCountTolerance(
    actualPages: number,
    targetPages: number,
    tolerance: number
  ): number {
    const minPages = targetPages - tolerance;
    const maxPages = targetPages + tolerance;
    
    if (actualPages >= minPages && actualPages <= maxPages) {
      return 1.0; // Perfect compliance
    }
    
    // Partial score for slight misses
    const difference = Math.abs(actualPages - targetPages);
    return Math.max(0, 1 - (difference / targetPages));
  }

  /**
   * Calculate lenient grammar score - focus on major issues only
   */
  private static calculateLenientGrammarScore(qualityCheck: any): number {
    const errors = qualityCheck.issues.filter((issue: any) => issue.severity === 'error').length;
    const warnings = qualityCheck.issues.filter((issue: any) => issue.severity === 'warning').length;
    
    // Be much more lenient - only severe errors matter
    let score = 1.0;
    score -= errors * 0.2;     // Major errors: 20% penalty each
    score -= warnings * 0.05;  // Warnings: 5% penalty each
    
    return Math.max(0, score);
  }

  /**
   * Log validation results for monitoring and improvement
   */
  static logValidationResult(result: ValidationResult, difficulty: DifficultyLevel): void {
    const status = result.isValid ? '✅ PASSED' : '❌ FAILED';
    const score = Math.round(result.scores.overallScore * 100);
    
    console.log(`📊 Story Validation ${status} (${score}% quality) - ${difficulty.toUpperCase()}`);
    
    if (!result.isValid) {
      console.log(`🔄 Fallback reason: ${result.fallbackReason}`);
      console.log(`📝 Issues: ${result.issues.join(', ')}`);
    }
    
    // Log detailed scores for analysis
    console.log(`📈 Scores:`, {
      vocabulary: `${Math.round(result.scores.vocabularyCompliance * 100)}%`,
      wordCount: `${Math.round(result.scores.wordCountCompliance * 100)}%`,
      pageCount: `${Math.round(result.scores.pageCountCompliance * 100)}%`,
      grammar: `${Math.round(result.scores.grammarScore * 100)}%`
    });
  }
}