// Level 2 Vocabulary (Ages 7-9) - 3rd-4th Grade
// Includes all Level 1 words plus 3rd-4th grade vocabulary

import { LEVEL_1_VOCABULARY } from './level1Vocabulary';
import { GrammarValidator } from '@/utils/grammarValidator';

export const LEVEL_2_VOCABULARY = new Set([
  // Include all Level 1 words
  ...LEVEL_1_VOCABULARY,
  
  // 3rd Grade Dolch Sight Words
  'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight',
  'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep',
  'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick',
  'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try',
  'warm',
  
  // Common 3rd-4th Grade Words
  'able', 'above', 'across', 'add', 'afraid', 'age', 'ago', 'air', 'almost', 'alone',
  'along', 'also', 'although', 'am', 'animal', 'another', 'answer', 'anyone', 'anything', 'appear',
  'area', 'arm', 'army', 'art', 'attack', 'attempt', 'attention', 'away', 'bad', 'bag',
  'band', 'bank', 'base', 'basic', 'beat', 'beautiful', 'become', 'bed', 'begin', 'behind',
  'believe', 'below', 'beside', 'between', 'beyond', 'big', 'bit', 'black', 'blood', 'blow',
  'blue', 'board', 'boat', 'body', 'bone', 'born', 'box', 'bread', 'break', 'bright',
  'brother', 'brown', 'build', 'business', 'busy', 'buy', 'came', 'camp', 'can\'t', 'card',
  'care', 'carry', 'case', 'catch', 'caught', 'center', 'certain', 'chair', 'chance', 'change',
  'character', 'charge', 'check', 'child', 'children', 'choose', 'church', 'city', 'class', 'clear',
  'close', 'clothes', 'club', 'cold', 'color', 'come', 'common', 'company', 'complete', 'condition',
  'consider', 'control', 'cool', 'copy', 'corner', 'cost', 'could', 'count', 'country', 'course',
  'cover', 'create', 'cross', 'cry', 'cut', 'dance', 'dark', 'data', 'daughter', 'dead',
  'deal', 'death', 'decide', 'deep', 'degree', 'describe', 'design', 'detail', 'determine', 'develop',
  'die', 'difference', 'different', 'difficult', 'dinner', 'direction', 'discover', 'discuss', 'disease', 'doctor'
]);

export function isLevel2Word(word: string): boolean {
  return LEVEL_2_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel2Sentence(sentence: string, userName?: string): { 
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
    return !LEVEL_2_VOCABULARY.has(word);
  });
  
  // Check grammar
  const grammarValidation = GrammarValidator.validateStoryText(sentence);
  
  return {
    isValid: invalidWords.length === 0 && grammarValidation.isValid,
    invalidWords,
    grammarErrors: grammarValidation.errors
  };
}