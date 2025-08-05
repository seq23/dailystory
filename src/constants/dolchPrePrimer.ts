// Official Dolch Pre-Primer Sight Words (40 words) - Industry Standard for Pre-Readers
export const DOLCH_PRE_PRIMER_VOCABULARY = new Set([
  // Basic sight words (40 total)
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'
]);

export function isDolchPrePrimerWord(word: string): boolean {
  return DOLCH_PRE_PRIMER_VOCABULARY.has(word.toLowerCase());
}

export function validateDolchPrePrimerSentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
  isStrictMode: boolean;
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
    return !DOLCH_PRE_PRIMER_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    isStrictMode: true
  };
}

// Enhanced Level 0 vocabulary (80+ words) for more flexible story creation
export const ENHANCED_LEVEL_0_VOCABULARY = new Set([
  // Include all Dolch Pre-Primer words
  ...DOLCH_PRE_PRIMER_VOCABULARY,
  
  // Additional essential words for story variety
  'an', 'on', 'at', 'this', 'that', 'he', 'she', 'they', 'with', 'have', 'has',
  'get', 'got', 'put', 'take', 'give', 'like', 'want', 'need', 'love',
  'mom', 'dad', 'baby', 'cat', 'dog', 'bird', 'fish', 'bear', 'frog',
  'ball', 'book', 'toy', 'car', 'cup', 'hat', 'bed', 'home', 'tree', 'sun',
  'happy', 'sad', 'good', 'nice', 'fun', 'fast', 'slow', 'big', 'small',
  'apple', 'milk', 'cake', 'food', 'water', 'green', 'orange', 'purple',
  'hi', 'hello', 'bye', 'yes', 'no', 'please', 'thank', 'thanks'
]);

export function validateEnhancedLevel0Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
  isStrictMode: boolean;
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
    return !ENHANCED_LEVEL_0_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    isStrictMode: false
  };
}

export type VocabularyMode = 'strict-dolch' | 'enhanced-level0';

export function validateByMode(
  sentence: string, 
  mode: VocabularyMode = 'enhanced-level0', 
  userName?: string
) {
  if (mode === 'strict-dolch') {
    return validateDolchPrePrimerSentence(sentence, userName);
  }
  return validateEnhancedLevel0Sentence(sentence, userName);
}