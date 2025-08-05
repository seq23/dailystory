// Vocabulary Verification Utility
import { 
  DOLCH_PRE_PRIMER_VOCABULARY, 
  FREE_LEVEL_0_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY,
  getLevel0VocabularyByUserType,
  validateLevel0SentenceByUserType
} from '@/constants/dolchPrePrimer';

export function verifyVocabularyImplementation(): {
  isValid: boolean;
  issues: string[];
  stats: {
    dolchSize: number;
    freeSize: number;
    premiumSize: number;
    duplicatesInPremium: string[];
    premiumOnlyWords: string[];
  };
} {
  const issues: string[] = [];
  
  // Check sizes
  const dolchSize = DOLCH_PRE_PRIMER_VOCABULARY.size;
  const freeSize = FREE_LEVEL_0_VOCABULARY.size;
  const premiumSize = PREMIUM_LEVEL_0_VOCABULARY.size;
  
  // Verify free vocabulary is identical to Dolch
  if (freeSize !== dolchSize) {
    issues.push(`Free vocabulary size (${freeSize}) doesn't match Dolch size (${dolchSize})`);
  }
  
  // Check if all Dolch words are in free vocabulary
  const dolchWords = Array.from(DOLCH_PRE_PRIMER_VOCABULARY);
  const freeWords = Array.from(FREE_LEVEL_0_VOCABULARY);
  const missingFromFree = dolchWords.filter(word => !freeWords.includes(word));
  if (missingFromFree.length > 0) {
    issues.push(`Missing Dolch words from free vocabulary: ${missingFromFree.join(', ')}`);
  }
  
  // Check if all Dolch words are in premium vocabulary
  const premiumWords = Array.from(PREMIUM_LEVEL_0_VOCABULARY);
  const missingFromPremium = dolchWords.filter(word => !premiumWords.includes(word));
  if (missingFromPremium.length > 0) {
    issues.push(`Missing Dolch words from premium vocabulary: ${missingFromPremium.join(', ')}`);
  }
  
  // Check for duplicates in premium vocabulary array (shouldn't happen with Set but let's verify)
  const premiumArray = [
    ...Array.from(DOLCH_PRE_PRIMER_VOCABULARY),
    'of', 'to', 'he', 'was', 'that', 'she', 'his', 'her', 'had', 'at', 'but', 'have', 'him', 'with', 'this', 'all', 'from', 'they', 'know', 'want', 'been', 'now', 'were', 'there', 'what',
    'do', 'does', 'are', 'my',
    'some', 'new', 'old', 'get', 'put', 'let', 'sit',
    'an', 'on', 'yes', 'no', 'got', 'has', 'will', 'just', 'how'
  ];
  
  const duplicatesInPremium = premiumArray.filter((word, index) => premiumArray.indexOf(word) !== index);
  
  // Get premium-only words
  const premiumOnlyWords = premiumWords.filter(word => !dolchWords.includes(word));
  
  // Test getLevel0VocabularyByUserType function
  const freeVocabFunc = getLevel0VocabularyByUserType('free');
  const premiumVocabFunc = getLevel0VocabularyByUserType('premium');
  
  if (freeVocabFunc.size !== freeSize) {
    issues.push(`getLevel0VocabularyByUserType('free') returns wrong size: ${freeVocabFunc.size} vs ${freeSize}`);
  }
  
  if (premiumVocabFunc.size !== premiumSize) {
    issues.push(`getLevel0VocabularyByUserType('premium') returns wrong size: ${premiumVocabFunc.size} vs ${premiumSize}`);
  }
  
  // Test validation functions with premium-only words
  const testWords = ['of', 'to', 'was', 'that', 'has', 'will', 'some', 'new'];
  for (const word of testWords) {
    const freeResult = validateLevel0SentenceByUserType(word, 'free');
    const premiumResult = validateLevel0SentenceByUserType(word, 'premium');
    
    if (premiumResult.isValid && freeResult.isValid && !dolchWords.includes(word)) {
      // This word should be valid for premium but invalid for free (if it's not in Dolch)
      issues.push(`Word "${word}" should be premium-only but is valid for free users too`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      dolchSize,
      freeSize,
      premiumSize,
      duplicatesInPremium,
      premiumOnlyWords
    }
  };
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).verifyVocabulary = verifyVocabularyImplementation;
}