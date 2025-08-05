// Level 0 vocabulary for ages 3-5 (ultra-simple pre-reading vocabulary)
// This is the enhanced version - for strict Dolch Pre-Primer, use dolchPrePrimer.ts
import { ENHANCED_LEVEL_0_VOCABULARY } from './dolchPrePrimer';

export const LEVEL_0_VOCABULARY = ENHANCED_LEVEL_0_VOCABULARY;

export function isLevel0Word(word: string): boolean {
  return LEVEL_0_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel0Sentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[] } {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    // Always allow the user's name - FIXED: User names should always be allowed
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_0_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}