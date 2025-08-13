// Level 2 Vocabulary (Ages 7-9) - Cumulative through 2nd Grade Dolch
// Includes all Level 1 words plus 2nd grade Dolch sight words

import { LEVEL_1_VOCABULARY } from './level1Vocabulary';

// Official Dolch 2nd Grade Sight Words (46 words)
export const DOLCH_2ND_GRADE_VOCABULARY = new Set([
  'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
  'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
  'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
  'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
  'why', 'wish', 'work', 'would', 'write', 'your'
]);

// LEVEL 2 VOCABULARY - Cumulative through 2nd Grade (179 words total)
export const LEVEL_2_VOCABULARY = new Set([
  // Include all Level 1 words (133 words: Pre-Primer + Primer + 1st Grade)
  ...LEVEL_1_VOCABULARY,
  
  // Add 2nd Grade Dolch Sight Words (46 words)
  ...DOLCH_2ND_GRADE_VOCABULARY
]);
export const LEVEL_2_VOCABULARY_NORMALIZED: Set<string> = new Set(
  Array.from(LEVEL_2_VOCABULARY).map((w) => w.toLowerCase().replace(/[^\w\s]/g, ''))
);

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^\w\s]/g, '');
}

export function isLevel2Word(word: string): boolean {
  return LEVEL_2_VOCABULARY_NORMALIZED.has(normalizeToken(word));
}
export function validateLevel2Sentence(sentence: string, userName?: string, userInputWords: string[] = []): { 
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
    
    return !LEVEL_2_VOCABULARY_NORMALIZED.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    allowedUserInputs
  };
}