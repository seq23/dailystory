// Grade-Based Vocabulary System - Central Export
// This replaces all previous vocabulary systems with a unified grade-based approach

import { 
  ENHANCED_LEVEL_0_VOCABULARY as LEVEL_0_VOCABULARY, 
  validateLevel0Sentence,
  isLevel0Word,
  LEVEL_1_VOCABULARY, 
  isLevel1Word, 
  validateLevel1Sentence,
  LEVEL_2_VOCABULARY, 
  isLevel2Word, 
  validateLevel2Sentence,
  LEVEL_3_VOCABULARY, 
  isLevel3Word, 
  validateLevel3Sentence,
  LEVEL_4_VOCABULARY, 
  isLevel4Word, 
  validateLevel4Sentence,
  type GradeLevel,
  getVocabularyByGrade,
  validateSentence as validateSentenceFromShared
} from '@/shared/vocabulary';

import { DifficultyLevel } from '@/types';

// Re-export the GradeLevel type
export type { GradeLevel };

// Export all vocabularies
export {
  LEVEL_0_VOCABULARY,
  LEVEL_1_VOCABULARY, 
  LEVEL_2_VOCABULARY,
  LEVEL_3_VOCABULARY,
  LEVEL_4_VOCABULARY,
  isLevel0Word,
  isLevel1Word,
  isLevel2Word,
  isLevel3Word,
  isLevel4Word,
  validateLevel0Sentence,
  validateLevel1Sentence,
  validateLevel2Sentence,
  validateLevel3Sentence,
  validateLevel4Sentence
};

// Difficulty Level to Grade Level mapping
// Note: Expert difficulty doesn't use vocabulary simplification
export function difficultyToGradeLevel(difficulty: DifficultyLevel): GradeLevel {
  switch (difficulty) {
    case 'beginner': return 0;
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    case 'expert': return 4; // Used only for reference, not vocabulary simplification
    default: return 0;
  }
}

// Grade Level to Difficulty mapping
export function gradeLevelToDifficulty(grade: GradeLevel): DifficultyLevel {
  switch (grade) {
    case 0: return 'beginner';
    case 1: return 'easy';
    case 2: return 'medium';
    case 3: return 'hard';
    case 4: return 'expert';
    default: return 'beginner';
  }
}

// Universal vocabulary checker
// Note: Level 4 (Expert) should not use vocabulary checking - returns true for all words
export function isValidWord(word: string, gradeLevel: GradeLevel): boolean {
  switch (gradeLevel) {
    case 0: return isLevel0Word(word);
    case 1: return isLevel1Word(word);
    case 2: return isLevel2Word(word);
    case 3: return isLevel3Word(word);
    case 4: return isLevel4Word(word);
    default: return isLevel0Word(word);
  }
}

// Universal sentence validator
// Note: Level 4 (Expert) should not use vocabulary validation - returns valid for all sentences
export function validateSentence(
  sentence: string, 
  gradeLevel: GradeLevel, 
  userName?: string
): { isValid: boolean; invalidWords: string[] } {
  switch (gradeLevel) {
    case 0: return validateLevel0Sentence(sentence, userName);
    case 1: return validateLevel1Sentence(sentence, userName);
    case 2: return validateLevel2Sentence(sentence, userName);
    case 3: return validateLevel3Sentence(sentence, userName);
    case 4: return validateLevel4Sentence(sentence, userName);
    default: return validateLevel0Sentence(sentence, userName);
  }
}

// Get vocabulary set for a grade level
// Note: Level 4 (Expert) returns empty set since it doesn't use vocabulary restrictions
export function getVocabularySet(gradeLevel: GradeLevel): Set<string> {
  switch (gradeLevel) {
    case 0: return LEVEL_0_VOCABULARY;
    case 1: return LEVEL_1_VOCABULARY;
    case 2: return LEVEL_2_VOCABULARY;
    case 3: return LEVEL_3_VOCABULARY;
    case 4: return LEVEL_4_VOCABULARY;
    default: return LEVEL_0_VOCABULARY;
  }
}

// Get vocabulary count for a grade level
export function getVocabularyCount(gradeLevel: GradeLevel): number {
  return getVocabularySet(gradeLevel).size;
}

// Grade level information
export const GRADE_LEVEL_INFO = {
  0: { ages: '3-5', description: 'Dolch Pre-Primer', words: 40 },
  1: { ages: '5-7', description: '1st-2nd Grade', words: 120 },
  2: { ages: '7-9', description: '2nd-3rd Grade', words: 200 },
  3: { ages: '9-11', description: 'Sophisticated 4th Grade', words: 200 },
  4: { ages: '11+', description: 'Expert (6th-10th Grade)', words: 'No limit - uses adaptive grade system' }
} as const;