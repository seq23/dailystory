// Educational Standards Grade-Based System
// Migrated from static vocabulary imports to educational compliance approach
// Aligns with backend educational standards

import { DifficultyLevel } from '@/types';
import { 
  difficultyToEducationalLevel,
  educationalLevelToDifficulty,
  isEducationallyAppropriate,
  calculateEducationalCompliance,
  CORE_EDUCATIONAL_WORDS,
  getEducationalLevelInfo,
  type EducationalLevel
} from '@/constants/educationalStandards';

// Type for grade levels - now using educational levels
export type GradeLevel = EducationalLevel;

// Legacy vocabulary sets for backward compatibility
// These use core educational words instead of deleted static files
export const LEVEL_0_VOCABULARY: Set<string> = CORE_EDUCATIONAL_WORDS[0];
export const LEVEL_1_VOCABULARY: Set<string> = new Set([
  ...CORE_EDUCATIONAL_WORDS[0],
  ...CORE_EDUCATIONAL_WORDS[1]
]);
export const LEVEL_2_VOCABULARY: Set<string> = LEVEL_1_VOCABULARY; // Educational progression
export const LEVEL_3_VOCABULARY: Set<string> = LEVEL_1_VOCABULARY; // Educational progression  
export const LEVEL_4_VOCABULARY: Set<string> = new Set<string>(); // Expert level - no restrictions

// Educational word checking functions
export function isLevel0Word(word: string, userName?: string): boolean {
  return isEducationallyAppropriate(word, 0, userName);
}

export function isLevel1Word(word: string, userName?: string): boolean {
  return isEducationallyAppropriate(word, 1, userName);
}

export function isLevel2Word(word: string, userName?: string): boolean {
  return isEducationallyAppropriate(word, 2, userName);
}

export function isLevel3Word(word: string, userName?: string): boolean {
  return isEducationallyAppropriate(word, 3, userName);
}

export function isLevel4Word(word: string, userName?: string): boolean {
  return isEducationallyAppropriate(word, 4, userName);
}

// Educational sentence validation functions
export function validateLevel0Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const result = calculateEducationalCompliance(sentence, 0, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

export function validateLevel1Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const result = calculateEducationalCompliance(sentence, 1, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

export function validateLevel2Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const result = calculateEducationalCompliance(sentence, 2, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

export function validateLevel3Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const result = calculateEducationalCompliance(sentence, 3, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

export function validateLevel4Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const result = calculateEducationalCompliance(sentence, 4, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

// Educational level mapping functions
export const difficultyToGradeLevel = difficultyToEducationalLevel;
export const gradeLevelToDifficulty = educationalLevelToDifficulty;

// Universal vocabulary checker using educational standards
export function isValidWord(word: string, gradeLevel: GradeLevel, userName?: string): boolean {
  return isEducationallyAppropriate(word, gradeLevel, userName);
}

// Universal sentence validator using educational compliance
export function validateSentence(
  sentence: string, 
  gradeLevel: GradeLevel, 
  userName?: string
): { isValid: boolean; invalidWords: string[] } {
  const result = calculateEducationalCompliance(sentence, gradeLevel, userName);
  return {
    isValid: result.isCompliant,
    invalidWords: result.inappropriateWords
  };
}

// Get vocabulary set for a grade level using educational standards
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
  const info = getEducationalLevelInfo(gradeLevel);
  return typeof info.targetWords === 'number' ? info.targetWords : 0;
}

// Grade level information using educational standards
export const GRADE_LEVEL_INFO = {
  0: { ages: '3-5', description: 'Pre-Reader/Early Learning', words: 40 },
  1: { ages: '5-7', description: 'Beginning Reader', words: 120 },
  2: { ages: '7-9', description: 'Developing Reader', words: 200 },
  3: { ages: '9-11', description: 'Independent Reader', words: 300 },
  4: { ages: '11+', description: 'Advanced/Adaptive Learning', words: 'Unlimited - Adaptive System' }
} as const;