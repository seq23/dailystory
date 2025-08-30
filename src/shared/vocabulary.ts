// Frontend vocabulary system - simplified from backend vocabulary files
// This consolidates all vocabulary levels in one file for better frontend bundling

import type { DifficultyLevel } from '@/types';

// Grade level type
export type GradeLevel = 0 | 1 | 2 | 3 | 4;

// Enhanced Level 0 Vocabulary - Dolch Pre-Primer + Primer + Fry First 100
export const ENHANCED_LEVEL_0_VOCABULARY = new Set([
  // Dolch Pre-Primer (40 words)
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
  
  // Dolch Primer (52 words)  
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
  'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
  'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
  'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
  'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
  'with', 'yes',
  
  // Additional Fry words (8 words to reach 100)
  'been', 'called', 'water', 'time', 'words', 'each', 'which', 'would'
]);

// Level 1 Vocabulary - Dolch First Grade (41 words) + additional high-frequency
export const LEVEL_1_VOCABULARY = new Set([
  ...ENHANCED_LEVEL_0_VOCABULARY,
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
  'from', 'give', 'giving', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
  'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
  'round', 'some', 'stop', 'take', 'thank', 'them', 'think', 'walk', 'were', 'when'
]);

// Level 2 Vocabulary - Dolch Second Grade + additional words
export const LEVEL_2_VOCABULARY = new Set([
  ...LEVEL_1_VOCABULARY,
  'always', 'around', 'because', 'before', 'best', 'both', 'buy', 'call',
  'cold', 'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes',
  'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing',
  'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use',
  'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your'
]);

// Level 3 Vocabulary - Dolch Third Grade + expanded vocabulary
export const LEVEL_3_VOCABULARY = new Set([
  ...LEVEL_2_VOCABULARY,
  'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink',
  'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if',
  'keep', 'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only',
  'own', 'pick', 'seven', 'shall', 'show', 'six', 'small', 'start', 'ten',
  'today', 'together', 'try', 'warm'
]);

// Level 4 Vocabulary - Advanced elementary vocabulary
export const LEVEL_4_VOCABULARY = new Set([
  ...LEVEL_3_VOCABULARY,
  'able', 'above', 'across', 'add', 'against', 'almost', 'alone', 'along',
  'already', 'although', 'among', 'another', 'answer', 'appear', 'area',
  'become', 'began', 'behind', 'being', 'below', 'between', 'book', 'business',
  'case', 'change', 'child', 'children', 'close', 'come', 'company', 'complete',
  'course', 'day', 'develop', 'different', 'during', 'early', 'end', 'example',
  'face', 'fact', 'family', 'feel', 'few', 'follow', 'government', 'great',
  'group', 'hand', 'head', 'help', 'high', 'home', 'house', 'however',
  'important', 'include', 'increase', 'information', 'interest', 'large', 'last',
  'later', 'learn', 'leave', 'left', 'level', 'life', 'line', 'local', 'lot',
  'man', 'meet', 'member', 'might', 'money', 'month', 'move', 'name', 'need',
  'night', 'nothing', 'number', 'office', 'open', 'order', 'part', 'people',
  'person', 'place', 'point', 'problem', 'program', 'provide', 'public', 'question',
  'real', 'reason', 'receive', 'report', 'result', 'room', 'school', 'seem',
  'service', 'several', 'should', 'since', 'special', 'still', 'student', 'study',
  'such', 'system', 'take', 'than', 'through', 'time', 'turn', 'under', 'until',
  'value', 'water', 'way', 'week', 'where', 'while', 'woman', 'word', 'work',
  'world', 'write', 'year', 'young'
]);

// Validation functions
export function isLevel0Word(word: string): boolean {
  return ENHANCED_LEVEL_0_VOCABULARY.has(word.toLowerCase());
}

export function isLevel1Word(word: string): boolean {
  return LEVEL_1_VOCABULARY.has(word.toLowerCase());
}

export function isLevel2Word(word: string): boolean {
  return LEVEL_2_VOCABULARY.has(word.toLowerCase());
}

export function isLevel3Word(word: string): boolean {
  return LEVEL_3_VOCABULARY.has(word.toLowerCase());
}

export function isLevel4Word(word: string): boolean {
  return LEVEL_4_VOCABULARY.has(word.toLowerCase());
}

// Sentence validation functions
export function validateLevel0Sentence(sentence: string, userName?: string, userInputWords: string[] = []): {
  isValid: boolean;
  invalidWords: string[];
  isStrictMode: boolean;
  allowedUserInputs: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const userInputSet = new Set(userInputWords.map(w => w.toLowerCase()));
  const allowedUserInputs: string[] = [];
  
  const invalidWords = words.filter(word => {
    if (userNameLower && word === userNameLower) {
      return false;
    }
    
    if (userInputSet.has(word)) {
      allowedUserInputs.push(word);
      return false;
    }
    
    return !ENHANCED_LEVEL_0_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    isStrictMode: false,
    allowedUserInputs
  };
}

export function validateLevel1Sentence(sentence: string, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_1_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}

export function validateLevel2Sentence(sentence: string, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_2_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}

export function validateLevel3Sentence(sentence: string, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_3_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}

export function validateLevel4Sentence(sentence: string, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_4_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}

// Mapping function to get vocabulary by grade level
export function getVocabularyByGrade(grade: GradeLevel): Set<string> {
  switch (grade) {
    case 0:
      return ENHANCED_LEVEL_0_VOCABULARY;
    case 1:
      return LEVEL_1_VOCABULARY;
    case 2:
      return LEVEL_2_VOCABULARY;
    case 3:
      return LEVEL_3_VOCABULARY;
    case 4:
      return LEVEL_4_VOCABULARY;
    default:
      return ENHANCED_LEVEL_0_VOCABULARY;
  }
}

// Get validation function by grade level
export function validateSentence(sentence: string, grade: GradeLevel, userName?: string): {
  isValid: boolean;
  invalidWords: string[];
} {
  switch (grade) {
    case 0:
      return validateLevel0Sentence(sentence, userName);
    case 1:
      return validateLevel1Sentence(sentence, userName);
    case 2:
      return validateLevel2Sentence(sentence, userName);
    case 3:
      return validateLevel3Sentence(sentence, userName);
    case 4:
      return validateLevel4Sentence(sentence, userName);
    default:
      return validateLevel0Sentence(sentence, userName);
  }
}