// Level 1 Vocabulary (Ages 5-7) - 1st-2nd Grade
// Includes all Level 0 words plus 1st-2nd grade sight words and common vocabulary

import { LEVEL_0_VOCABULARY } from './level0Vocabulary';
import { GrammarValidator } from '@/utils/grammarValidator';

export const LEVEL_1_VOCABULARY = new Set([
  // Include all Level 0 words
  ...LEVEL_0_VOCABULARY,
  
  // 1st Grade Dolch Sight Words
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
  'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
  'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
  'round', 'some', 'stop', 'take', 'thank', 'them', 'think', 'walk', 'were', 'when',
  
  // 2nd Grade Dolch Sight Words
  'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
  'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
  'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
  'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
  'why', 'wish', 'work', 'would', 'write', 'your',
  
  // Common 1st-2nd Grade Words
  'mom', 'dad', 'baby', 'cat', 'dog', 'bird', 'fish', 'bear', 'frog', 'cow',
  'ball', 'book', 'toy', 'car', 'cup', 'hat', 'bed', 'home', 'tree', 'sun',
  'happy', 'sad', 'good', 'nice', 'fun', 'fast', 'slow', 'small', 'new', 'old',
  'apple', 'milk', 'cake', 'food', 'water', 'green', 'orange', 'purple', 'black', 'white',
  'hello', 'bye', 'yes', 'no', 'please', 'thank', 'sorry', 'love', 'like', 'want',
  'get', 'got', 'have', 'has', 'he', 'she', 'they', 'with', 'on', 'at',
  'this', 'that', 'into', 'out', 'back', 'day', 'time', 'way', 'man', 'boy',
  'girl', 'house', 'school', 'friend', 'mother', 'father', 'sister', 'brother'
]);

export function isLevel1Word(word: string): boolean {
  return LEVEL_1_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel1Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
  grammarErrors?: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    // Always allow the user's name
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_1_VOCABULARY.has(word);
  });
  
  // Check grammar
  const grammarValidation = GrammarValidator.validateStoryText(sentence);
  
  return {
    isValid: invalidWords.length === 0 && grammarValidation.isValid,
    invalidWords,
    grammarErrors: grammarValidation.errors
  };
}