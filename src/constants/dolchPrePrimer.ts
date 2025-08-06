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

// Free Level 0 vocabulary - Strict Dolch Pre-Primer only (40 words)
export const FREE_LEVEL_0_VOCABULARY = new Set([...DOLCH_PRE_PRIMER_VOCABULARY]);

// Premium Level 0 vocabulary - Research-Enhanced (Education Expert Approved)
// Based on Dolch Pre-Primer + Fry First 25 + Common Core RF.K.3.C + Head Start Standards
export const PREMIUM_LEVEL_0_VOCABULARY = new Set([
  // Include all Dolch Pre-Primer words (40 words)
  ...DOLCH_PRE_PRIMER_VOCABULARY,
  
  // Fry First 25 additions not already in Dolch (high-frequency research-backed)
  'of', 'to', 'he', 'was', 'that', 'she', 'his', 'her', 'had', 'at', 'but', 'have', 'him', 'with', 'this', 'all', 'from', 'they', 'know', 'want', 'been', 'now', 'were', 'there', 'what',
  
  // Common Core RF.K.3.C examples not already included (curriculum standard)
  'do', 'does', 'are',
  
  // Head Start Priority Words (early learning standards)
  'some', 'new', 'old', 'get', 'put', 'let', 'sit',
  
  // High-utility function words (kindergarten frequency analysis)
  'an', 'on', 'yes', 'no', 'got', 'has', 'will', 'just', 'how'
]);

// Legacy enhanced vocabulary (kept for compatibility)
export const ENHANCED_LEVEL_0_VOCABULARY = PREMIUM_LEVEL_0_VOCABULARY;

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
    return validateDolchPrePrimerSentence(sentence, userName);
  }
  return validateEnhancedLevel0Sentence(sentence, userName);
}