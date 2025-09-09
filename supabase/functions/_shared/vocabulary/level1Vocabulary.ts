// Level 1 Vocabulary (Ages 5-7) - Cumulative through 1st Grade Dolch
// Includes all Level 0 words plus 1st grade Dolch sight words

import { ENHANCED_LEVEL_0_VOCABULARY } from './dolchPrePrimer.ts';

// Official Dolch 1st Grade Sight Words (41 words)
export const DOLCH_1ST_GRADE_VOCABULARY = new Set([
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
  'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
  'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
  'round', 'some', 'stop', 'take', 'thank', 'them', 'think', 'walk', 'were', 'when'
]);

// LEVEL 1 VOCABULARY - Cumulative through 1st Grade (133 words total)
export const LEVEL_1_VOCABULARY = new Set([
  // Include all Level 0 words (92 words: Pre-Primer + Primer)
  ...ENHANCED_LEVEL_0_VOCABULARY,
  
  // Add 1st Grade Dolch Sight Words (41 words)
  ...DOLCH_1ST_GRADE_VOCABULARY
]);

export const LEVEL_1_VOCABULARY_NORMALIZED: Set<string> = new Set(
  Array.from(LEVEL_1_VOCABULARY).map((w) => w.toLowerCase().replace(/[^\w\s]/g, ''))
);

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^\w\s]/g, '');
}

export function isLevel1Word(word: string): boolean {
  return LEVEL_1_VOCABULARY_NORMALIZED.has(normalizeToken(word));
}

export function validateLevel1Sentence(sentence: string, userName?: string, userInputWords: string[] = []): { 
  isValid: boolean; 
  invalidWords: string[];
  allowedUserInputs: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const userInputSet = new Set(userInputWords.map(w => w.toLowerCase()));
  const allowedUserInputs: string[] = [];
  
  const invalidWords = words.filter(word => {
    // Always allow the user's name
    if (userNameLower && word === userNameLower) {
      return false;
    }
    
    // Always allow user input words (colors, animals, foods, hobbies)
    if (userInputSet.has(word)) {
      allowedUserInputs.push(word);
      return false;
    }
    
    return !LEVEL_1_VOCABULARY_NORMALIZED.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    allowedUserInputs
  };
}