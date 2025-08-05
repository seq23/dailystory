// Grade-Based Vocabulary System - Central Export
// This replaces all previous vocabulary systems with a unified grade-based approach

import { 
  LEVEL_0_VOCABULARY, 
  isLevel0Word, 
  validateLevel0Sentence 
} from './level0Vocabulary';

import { 
  LEVEL_1_VOCABULARY, 
  isLevel1Word, 
  validateLevel1Sentence 
} from './level1Vocabulary';

import { 
  LEVEL_2_VOCABULARY, 
  isLevel2Word, 
  validateLevel2Sentence 
} from './level2Vocabulary';

import { 
  LEVEL_3_VOCABULARY, 
  isLevel3Word, 
  validateLevel3Sentence 
} from './level3Vocabulary';

import { 
  LEVEL_4_VOCABULARY, 
  isLevel4Word, 
  validateLevel4Sentence 
} from './level4Vocabulary';

import { DifficultyLevel } from '@/types';

// Type for grade levels
export type GradeLevel = 0 | 1 | 2 | 3 | 4;

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
export function difficultyToGradeLevel(difficulty: DifficultyLevel): GradeLevel {
  switch (difficulty) {
    case 'beginner': return 0;
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    case 'expert': return 4;
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
  2: { ages: '7-9', description: '3rd-4th Grade', words: 200 },
  3: { ages: '9-11', description: '5th-6th Grade', words: 400 },
  4: { ages: '11+', description: '7th-12th Grade', words: 800 }
} as const;