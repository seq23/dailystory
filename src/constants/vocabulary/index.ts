// Vocabulary Constants - Moved from Backend for Frontend Processing
// Re-exports from gradeBased system for unified vocabulary access

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
  validateLevel4Sentence,
  difficultyToGradeLevel,
  gradeLevelToDifficulty,
  isValidWord,
  validateSentence,
  getVocabularySet,
  getVocabularyCount,
  GRADE_LEVEL_INFO,
  type GradeLevel
} from "@/constants/gradeBased";

// Additional frontend-specific vocabulary utilities
export const VOCABULARY_SOURCES = {
  FORM_INPUT: 'form_input',
  SPECIAL_REQUEST: 'special_request', 
  TEACHER_WORDS: 'teacher_words',
  SYSTEM: 'system'
} as const;

export const VOCABULARY_PRIORITIES = {
  USER_SPECIFIED: 1, // Highest priority
  SYSTEM_VALIDATION: 2 // Lower priority, validation only
} as const;

export type VocabularySource = typeof VOCABULARY_SOURCES[keyof typeof VOCABULARY_SOURCES];
export type VocabularyPriority = typeof VOCABULARY_PRIORITIES[keyof typeof VOCABULARY_PRIORITIES];