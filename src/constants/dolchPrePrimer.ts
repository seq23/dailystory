// Official Dolch Pre-Primer Sight Words (40 words) - Industry Standard for Pre-Readers
export const DOLCH_PRE_PRIMER_VOCABULARY = new Set([
  // Basic sight words (40 total)
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'
]);

// Official Dolch Primer Sight Words (52 words) - Kindergarten Level
export const DOLCH_PRIMER_VOCABULARY = new Set([
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
  'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
  'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
  'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
  'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
  'with', 'yes'
]);

// ENHANCED LEVEL 0 VOCABULARY - Cumulative Dolch + Fry First 100 (100 words total)
// Research-based vocabulary for ages 3-5, combining Dolch and Fry high-frequency words
export const ENHANCED_LEVEL_0_VOCABULARY = new Set([
  // Include all Dolch Pre-Primer words (40 words)
  ...DOLCH_PRE_PRIMER_VOCABULARY,
  
  // Include all Dolch Primer words (52 words)
  ...DOLCH_PRIMER_VOCABULARY,
  
  // Add 8 research-based Fry words to reach exactly 100 words for optimal beginner vocabulary
  'been', 'called', 'water', 'time', 'words', 'each', 'which', 'would'
]);

export function isDolchPrePrimerWord(word: string): boolean {
  return DOLCH_PRE_PRIMER_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel0Sentence(sentence: string, userName?: string, userInputWords: string[] = []): { 
  isValid: boolean; 
  invalidWords: string[];
  isStrictMode: boolean;
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
    
    return !ENHANCED_LEVEL_0_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords,
    isStrictMode: false,
    allowedUserInputs
  };
}

// Legacy compatibility functions
export const FREE_LEVEL_0_VOCABULARY = ENHANCED_LEVEL_0_VOCABULARY;
export const PREMIUM_LEVEL_0_VOCABULARY = ENHANCED_LEVEL_0_VOCABULARY;

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

export type UserType = 'free' | 'premium';
export type VocabularyMode = 'strict-dolch' | 'enhanced-level0';

// Get appropriate vocabulary set based on user type
export function getLevel0VocabularyByUserType(userType: UserType): Set<string> {
  return userType === 'premium' ? PREMIUM_LEVEL_0_VOCABULARY : FREE_LEVEL_0_VOCABULARY;
}

// Import grammar validation
import { GrammarValidator } from '../utils/grammarValidator';

// Subscription-aware validation function
export function validateLevel0SentenceByUserType(
  sentence: string, 
  userType: UserType, 
  userName?: string
): { 
  isValid: boolean; 
  invalidWords: string[];
  isStrictMode: boolean;
  vocabularySize: number;
  grammarErrors?: string[];
} {
  const vocabulary = getLevel0VocabularyByUserType(userType);
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
    return !vocabulary.has(word);
  });

  // Check grammar as well
  const grammarValidation = GrammarValidator.validateStoryText(sentence);
  
  return {
    isValid: invalidWords.length === 0 && grammarValidation.isValid,
    invalidWords,
    isStrictMode: userType === 'free',
    vocabularySize: vocabulary.size,
    grammarErrors: grammarValidation.isValid ? undefined : grammarValidation.errors
  };
}

export function validateByMode(
  sentence: string, 
  mode: VocabularyMode = 'enhanced-level0', 
  userName?: string
) {
  if (mode === 'strict-dolch') {
    return validateLevel0Sentence(sentence, userName);
  }
  return validateEnhancedLevel0Sentence(sentence, userName);
}