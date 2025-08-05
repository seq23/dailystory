// Level 0 vocabulary for ages 3-5 (ultra-simple pre-reading vocabulary)
// This file is kept for backward compatibility - use dolchPrePrimer.ts for new code
import { FREE_LEVEL_0_VOCABULARY, validateLevel0SentenceByUserType } from './dolchPrePrimer';

export const LEVEL_0_VOCABULARY = FREE_LEVEL_0_VOCABULARY;

export function isLevel0Word(word: string): boolean {
  return LEVEL_0_VOCABULARY.has(word.toLowerCase());
}

// Deprecated: Use validateLevel0SentenceByUserType from dolchPrePrimer.ts instead
export function validateLevel0Sentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[] } {
  const result = validateLevel0SentenceByUserType(sentence, 'free', userName);
  return {
    isValid: result.isValid,
    invalidWords: result.invalidWords
  };
}