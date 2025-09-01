// Vocabulary Integration Service - Flexible compliance for vocabulary appropriateness
// Integrates with existing vocabulary constants and provides flexible compliance checking

import {
  LEVEL_0_VOCABULARY,
  LEVEL_1_VOCABULARY,
  LEVEL_2_VOCABULARY,
  LEVEL_3_VOCABULARY,
  LEVEL_4_VOCABULARY,
  difficultyToGradeLevel,
  isValidWord,
  validateSentence,
  getVocabularySet,
  type GradeLevel
} from '@/constants/gradeBased';
import type { DifficultyLevel, ExpertGradeLevel } from '@/types';

export interface VocabularyComplianceConfig {
  strict: boolean; // If true, enforce strict vocabulary compliance
  targetCompliance: number; // 0.0 to 1.0, percentage of words that must be grade-appropriate
  allowUserWords: boolean; // If true, always allow user-specified vocabulary
  gradeLevel: GradeLevel;
}

export interface VocabularyValidationResult {
  isCompliant: boolean;
  compliancePercentage: number;
  inappropriateWords: string[];
  totalWords: number;
  gradeAppropriateWords: number;
  userSpecifiedWords: string[];
}

export class VocabularyIntegrationService {
  // Default compliance configurations by level
  private static readonly DEFAULT_COMPLIANCE = {
    0: { strict: true, targetCompliance: 0.95, allowUserWords: true },
    1: { strict: true, targetCompliance: 0.90, allowUserWords: true },
    2: { strict: false, targetCompliance: 0.85, allowUserWords: true },
    3: { strict: false, targetCompliance: 0.80, allowUserWords: true },
    4: { strict: false, targetCompliance: 0.75, allowUserWords: true }
  };

  /**
   * Create vocabulary compliance config for a difficulty level
   */
  static createComplianceConfig(
    difficulty: DifficultyLevel | ExpertGradeLevel,
    customConfig?: Partial<VocabularyComplianceConfig>
  ): VocabularyComplianceConfig {
    const gradeLevel = this.mapDifficultyToGradeLevel(difficulty);
    const defaults = this.DEFAULT_COMPLIANCE[gradeLevel] || this.DEFAULT_COMPLIANCE[2];

    return {
      gradeLevel,
      ...defaults,
      ...customConfig
    };
  }

  /**
   * Validate text against vocabulary compliance rules
   */
  static validateVocabularyCompliance(
    text: string,
    config: VocabularyComplianceConfig,
    userSpecifiedWords: string[] = []
  ): VocabularyValidationResult {
    const words = this.extractWords(text);
    const totalWords = words.length;
    
    if (totalWords === 0) {
      return {
        isCompliant: true,
        compliancePercentage: 1.0,
        inappropriateWords: [],
        totalWords: 0,
        gradeAppropriateWords: 0,
        userSpecifiedWords: []
      };
    }

    let gradeAppropriateWords = 0;
    const inappropriateWords: string[] = [];
    const foundUserWords: string[] = [];

    for (const word of words) {
      const lowerWord = word.toLowerCase();
      
      // Check if it's a user-specified word
      if (config.allowUserWords && userSpecifiedWords.some(uw => uw.toLowerCase() === lowerWord)) {
        foundUserWords.push(word);
        gradeAppropriateWords++; // Always count user words as appropriate
        continue;
      }

      // Check if word is grade-appropriate
      if (isValidWord(lowerWord, config.gradeLevel)) {
        gradeAppropriateWords++;
      } else {
        // Only add to inappropriate list if not a user-specified word
        if (!foundUserWords.includes(word)) {
          inappropriateWords.push(word);
        }
      }
    }

    const compliancePercentage = totalWords > 0 ? gradeAppropriateWords / totalWords : 1.0;
    const isCompliant = config.strict 
      ? compliancePercentage >= config.targetCompliance && inappropriateWords.length === 0
      : compliancePercentage >= config.targetCompliance;

    return {
      isCompliant,
      compliancePercentage,
      inappropriateWords,
      totalWords,
      gradeAppropriateWords,
      userSpecifiedWords: foundUserWords
    };
  }

  /**
   * Get vocabulary suggestions for improving compliance
   */
  static getVocabularySuggestions(
    difficulty: DifficultyLevel | ExpertGradeLevel,
    inappropriateWords: string[]
  ): Record<string, string[]> {
    const gradeLevel = this.mapDifficultyToGradeLevel(difficulty);
    const vocabularySet = getVocabularySet(gradeLevel);
    const suggestions: Record<string, string[]> = {};

    for (const word of inappropriateWords) {
      const lowerWord = word.toLowerCase();
      const possibleSuggestions: string[] = [];

      // Find words with similar starting letters or patterns
      for (const vocabWord of vocabularySet) {
        if (vocabWord.startsWith(lowerWord.charAt(0)) && vocabWord.length >= lowerWord.length - 2) {
          possibleSuggestions.push(vocabWord);
          if (possibleSuggestions.length >= 3) break; // Limit suggestions
        }
      }

      if (possibleSuggestions.length > 0) {
        suggestions[word] = possibleSuggestions;
      }
    }

    return suggestions;
  }

  /**
   * Check if vocabulary level is appropriate for content complexity
   */
  static assessContentVocabularyAlignment(
    text: string,
    difficulty: DifficultyLevel | ExpertGradeLevel
  ): {
    isAligned: boolean;
    suggestedLevel: GradeLevel;
    complexityScore: number;
  } {
    const words = this.extractWords(text);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    
    // Test against different grade levels to find best fit
    const levelScores: Record<GradeLevel, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0
    };

    for (const level of [0, 1, 2, 3, 4] as GradeLevel[]) {
      let matches = 0;
      for (const word of uniqueWords) {
        if (isValidWord(word, level)) {
          matches++;
        }
      }
      levelScores[level] = uniqueWords.length > 0 ? matches / uniqueWords.length : 0;
    }

    // Find the level with highest score
    const bestLevel = (Object.entries(levelScores) as [string, number][])
      .reduce((best, [level, score]) => 
        score > best.score ? { level: parseInt(level) as GradeLevel, score } : best,
        { level: 0 as GradeLevel, score: 0 }
      ).level;

    const targetLevel = this.mapDifficultyToGradeLevel(difficulty);
    const complexityScore = levelScores[bestLevel];

    return {
      isAligned: Math.abs(bestLevel - targetLevel) <= 1, // Allow 1 level variance
      suggestedLevel: bestLevel,
      complexityScore
    };
  }

  /**
   * Get vocabulary coverage statistics
   */
  static getVocabularyCoverage(
    text: string,
    difficulty: DifficultyLevel | ExpertGradeLevel
  ): {
    totalWords: number;
    uniqueWords: number;
    coverageByLevel: Record<GradeLevel, number>;
    recommendedLevel: GradeLevel;
  } {
    const words = this.extractWords(text);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    
    const coverageByLevel: Record<GradeLevel, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0
    };

    for (const level of [0, 1, 2, 3, 4] as GradeLevel[]) {
      let matches = 0;
      for (const word of uniqueWords) {
        if (isValidWord(word, level)) {
          matches++;
        }
      }
      coverageByLevel[level] = uniqueWords.length > 0 ? matches / uniqueWords.length : 0;
    }

    // Recommend the lowest level that covers at least 80% of words
    let recommendedLevel: GradeLevel = 4;
    for (const level of [0, 1, 2, 3, 4] as GradeLevel[]) {
      if (coverageByLevel[level] >= 0.8) {
        recommendedLevel = level;
        break;
      }
    }

    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.length,
      coverageByLevel,
      recommendedLevel
    };
  }

  /**
   * Extract words from text (helper method)
   */
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 0 && word.length > 1); // Filter out empty and single-char words
  }

  /**
   * Map difficulty to grade level
   */
  private static mapDifficultyToGradeLevel(difficulty: DifficultyLevel | ExpertGradeLevel): GradeLevel {
    // Handle expert grade levels
    if (typeof difficulty === 'string' && difficulty.includes('th')) {
      const gradeNum = parseInt(difficulty.replace(/\D/g, ''));
      if (gradeNum >= 6) return 4; // Map Grade 6+ to Level 4
    }

    // Handle grade6, grade7, etc.
    if (typeof difficulty === 'string' && difficulty.startsWith('grade')) {
      const gradeNum = parseInt(difficulty.replace('grade', ''));
      if (gradeNum >= 6) return 4; // Map Grade 6+ to Level 4
    }

    // Use existing mapping function for standard difficulties
    try {
      return difficultyToGradeLevel(difficulty as DifficultyLevel);
    } catch {
      return 2; // Default to Level 2 if mapping fails
    }
  }

  /**
   * Generate compliance report for debugging
   */
  static generateComplianceReport(
    text: string,
    difficulty: DifficultyLevel | ExpertGradeLevel,
    userSpecifiedWords: string[] = []
  ): {
    config: VocabularyComplianceConfig;
    validation: VocabularyValidationResult;
    coverage: ReturnType<typeof VocabularyIntegrationService.getVocabularyCoverage>;
    alignment: ReturnType<typeof VocabularyIntegrationService.assessContentVocabularyAlignment>;
    suggestions: Record<string, string[]>;
  } {
    const config = this.createComplianceConfig(difficulty);
    const validation = this.validateVocabularyCompliance(text, config, userSpecifiedWords);
    const coverage = this.getVocabularyCoverage(text, difficulty);
    const alignment = this.assessContentVocabularyAlignment(text, difficulty);
    const suggestions = this.getVocabularySuggestions(difficulty, validation.inappropriateWords);

    return {
      config,
      validation,
      coverage,
      alignment,
      suggestions
    };
  }
}