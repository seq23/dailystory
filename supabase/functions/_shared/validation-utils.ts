// Shared Validation Utilities - Portable across TypeScript and Deno
// Single source of truth for core validation logic

// Import shared configuration for fallbacks only
import { validationConfig } from './validation-config.ts';
// Import dynamic extraction functions - SINGLE SOURCE OF TRUTH
import { extractTokenLimitFromPrompt, getStoryPrompt, getExpertStoryPrompt, type DifficultyLevel as PromptDifficultyLevel, type ExpertGradeLevel as PromptExpertGradeLevel } from './storyPrompts.ts';

export type ValidationLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Grade6' | 'Grade7' | 'Grade8' | 'Grade9' | 'Grade10';
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type ExpertGradeLevel = 'grade6' | 'grade7' | 'grade8' | 'grade9' | 'grade10' | '6th' | '7th' | '8th' | '9th' | '10th';

/**
 * Simple token estimation based on word count and punctuation
 * TOKEN VALIDATION BYPASSED - This function kept for metrics only
 */
export function estimateTokenCount(text: string): number {
  if (!text?.trim()) return 0;
  
  const words = text.trim().split(/\s+/).length;
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  return Math.ceil(words * 1.3 + punctuation * 0.5); // Conservative estimate
}

/**
 * Map difficulty level to validation level
 */
export function mapDifficultyToLevel(difficulty: DifficultyLevel | ExpertGradeLevel): ValidationLevel {
  const normalized = difficulty.toLowerCase();
  const mapped = validationConfig.difficultyMapping[normalized];
  
  console.log(`🔍 [DIFFICULTY-MAPPING]`, {
    original: difficulty,
    normalized,
    mapped,
    fallbackUsed: !mapped,
    availableKeys: Object.keys(validationConfig.difficultyMapping)
  });
  
  return mapped || 'Level0'; // Fallback to Level0 instead of Level2
}

/**
 * Get token limits for a validation level - DYNAMIC EXTRACTION FROM PROMPTS
 */
export function getTokenLimitsForLevel(level: ValidationLevel) {
  // Map validation level back to difficulty
  const difficultyMapping = {
    'Level0': 'beginner',
    'Level1': 'easy', 
    'Level2': 'medium',
    'Level3': 'hard',
    'Level4': 'expert',
    'Grade6': '6th',
    'Grade7': '7th', 
    'Grade8': '8th',
    'Grade9': '9th',
    'Grade10': '10th'
  };
  
  const difficulty = difficultyMapping[level];
  if (!difficulty) {
    console.warn(`⚠️ Unknown validation level: ${level}, using Level0 fallback`);
    return validationConfig.tokenLimits.Level0;
  }
  
  // TOKEN VALIDATION BYPASSED - Return high ceiling for compatibility  
  return {
    perPage: 100000,
    guestStory: 100000
  };
}

/**
 * Get expected pages for a validation level (DEPRECATED - use getExpectedPagesForService)
 */
export function getExpectedPagesForLevel(level: ValidationLevel): number {
  // Fallback to Netflix expectations for backward compatibility
  return getExpectedPagesForService('netflix', level);
}

/**
 * Get expected pages for a service and validation level - SINGLE SOURCE OF TRUTH
 */
export function getExpectedPagesForService(service: 'netflix' | 'live', level: ValidationLevel): number | null {
  if (service === 'live') {
    return null; // Live mode has no page expectations
  }
  
  if (service === 'netflix') {
    return validationConfig.pageExpectations.netflix[level] || 12;
  }
  
  console.warn(`⚠️ Unknown service: ${service}, using Netflix fallback`);
  return validationConfig.pageExpectations.netflix[level] || 12;
}

/**
 * Get minimum characters per page for a validation level - DYNAMIC HELPER FUNCTION
 * Single source of truth for both Netflix and Live services
 */
export function getMinCharactersPerPage(level: ValidationLevel): number {
  return validationConfig.characterMinimumsPerPage[level]?.minCharsPerPage || 
         validationConfig.characterMinimumsPerPage.Level0?.minCharsPerPage || 
         5; // Fallback to Level0 default
}

/**
 * Get minimum total characters for a story based on level and expected pages - DYNAMIC HELPER FUNCTION
 * Used by Netflix service (level × 12 pages)
 */
export function getMinCharactersTotal(level: ValidationLevel, expectedPages: number): number {
  const minCharsPerPage = getMinCharactersPerPage(level);
  return minCharsPerPage * expectedPages;
}

/**
 * Get word count limits for a validation level - NEW WORD COUNT VALIDATION
 */
export function getWordCountLimitsForLevel(level: ValidationLevel): { minWords: number; maxWords: number } {
  const wordLimits = validationConfig.wordCountLimits[level] || validationConfig.wordCountLimits.Level0;
  return {
    minWords: wordLimits.minWordsPerPage,
    maxWords: wordLimits.maxWordsPerPage
  };
}

/**
 * Get character limits for a validation level - LEGACY COMPATIBILITY
 * Use getMinCharactersPerPage() for new validation logic
 */
export function getCharacterLimitsForLevel(level: ValidationLevel) {
  return validationConfig.characterThresholds[level] || validationConfig.characterThresholds.Level0;
}

/**
 * Lightweight content type detection helpers
 */
export function isTransition(content: string): boolean {
  return /\b(meanwhile|later that|next|then|after|during|suddenly|now|finally|soon|eventually)\b/i.test(content);
}

export function isEnding(content: string): boolean {
  return /\b(the end|happily ever after|lived happily|learned|finally|concluded|finished|complete)\b/i.test(content);
}

export function isCliffhanger(content: string): boolean {
  return /[?!]|but suddenly|what was|to be continued|suddenly|what would|who could|where did|will they/i.test(content);
}

/**
 * Emergency chunking for oversized sentences (Level 0 fallback)
 */
export function emergencyChunkSentence(sentence: string, targetChars: number): string[] {
  const words = sentence.trim().split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentChars = 0;
  
  for (const word of words) {
    const wordChars = word.length;
    
    if (currentChars + wordChars > targetChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
      currentChars = wordChars;
    } else {
      if (currentChunk.length > 0) currentChunk += ' ';
      currentChunk += word;
      currentChars += wordChars + (currentChunk.length > word.length ? 1 : 0); // +1 for space
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [sentence];
}

/**
 * Word-chunking fallback for unpunctuated/run-on sentences (Level 1-4+ fallback)
 */
export function wordChunkSentence(sentence: string, targetChars: number): string[] {
  const words = sentence.trim().split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentChars = 0;
  
  for (const word of words) {
    const wordChars = word.length;
    
    if (currentChars + wordChars > targetChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim() + '.');
      currentChunk = word;
      currentChars = wordChars;
    } else {
      if (currentChunk.length > 0) currentChunk += ' ';
      currentChunk += word;
      currentChars += wordChars + (currentChunk.length > word.length ? 1 : 0); // +1 for space
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim() + '.');
  }
  
  return chunks.length > 0 ? chunks : [sentence];
}

/**
 * Enhanced auto-split with Level 0 strict splitting and Level 1-4+ smart packing
 * This is the core algorithm that ensures consistent page generation
 */
export function enhancedAutoSplitContent(content: string, level: ValidationLevel, maxPages: number): string[] {
  if (!content?.trim()) return [];
  
  const characterLimits = getCharacterLimitsForLevel(level);
  const targetCharsPerPage = characterLimits.maxChars; // FIX: Use direct per-page limit, not divided by pages
  
  // NEW: Add word count limits for dual-constraint validation
  const wordLimits = getWordCountLimitsForLevel(level);
  const targetWordsPerPage = wordLimits.maxWords;
  
  console.log(`🔧 Auto-split debug: level=${level}, targetCharsPerPage=${targetCharsPerPage}, targetWordsPerPage=${targetWordsPerPage}, maxPages=${maxPages}`);
  
  // Enhanced sentence splitting - handles multiple punctuation patterns
  const sentences = content
    .split(/([.!?]+\s*)/)
    .filter(s => s.trim().length > 0)
    .reduce((acc, part, index, arr) => {
      if (index % 2 === 0) {
        // This is text content
        const nextPart = arr[index + 1];
        if (nextPart && /^[.!?]+\s*$/.test(nextPart)) {
          acc.push(part + nextPart);
        } else {
          acc.push(part);
        }
      }
      return acc;
    }, [] as string[]);
  
  let pages: string[] = [];
  let currentPage = '';
  let currentChars = 0;
  let currentWords = 0;  // NEW: Track word count for dual-constraint validation
  
  // Level 0: Strict 1-sentence per page with emergency chunking and word validation
  if (level === 'Level0') {
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;
      
      const sentenceChars = cleanSentence.length;
      const sentenceWords = cleanSentence.trim().split(/\s+/).length;
      
      // If sentence exceeds EITHER character OR word limits, emergency chunk it
      if (sentenceChars > targetCharsPerPage || sentenceWords > targetWordsPerPage) {
        const chunks = emergencyChunkSentence(cleanSentence, targetCharsPerPage);
        pages.push(...chunks);
        
        console.log(`🔧 Level0 emergency chunking: ${sentenceChars} chars, ${sentenceWords} words -> ${chunks.length} chunks`);
      } else {
        pages.push(cleanSentence);
        
        console.log(`✅ Level0 page added: ${sentenceChars} chars, ${sentenceWords} words (limits: ${targetCharsPerPage} chars, ${targetWordsPerPage} words)`);
      }
      
      // Stop if we've hit max pages
      if (pages.length >= maxPages) break;
    }
    
    return pages.length > 0 ? pages : [content.trim()];
  }
  
  // Level 1-4+: Smart packing with dual-constraint (character AND word count) validation
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    if (!cleanSentence) continue;
    
    const sentenceChars = cleanSentence.length;
    const sentenceWords = cleanSentence.trim().split(/\s+/).length;
    
    // If sentence is too long and has no punctuation, word-chunk it
    if (sentenceChars > targetCharsPerPage * 1.5 && !/[.!?]/.test(cleanSentence)) {
      const chunks = wordChunkSentence(cleanSentence, targetCharsPerPage);
      
      for (const chunk of chunks) {
        const chunkChars = chunk.length;
        const chunkWords = chunk.trim().split(/\s+/).length;
        
        // NEW: Dual-constraint check for chunked content
        const wouldExceedChars = currentChars + chunkChars > targetCharsPerPage;
        const wouldExceedWords = currentWords + chunkWords > targetWordsPerPage;
        
        if ((wouldExceedChars || wouldExceedWords) && currentPage.length > 0) {
          if (pages.length < maxPages) {
            pages.push(currentPage.trim());
            
            console.log(`✅ Level${level} page completed (chunked): ${currentChars} chars, ${currentWords} words (limits: ${targetCharsPerPage} chars, ${targetWordsPerPage} words)`);
            
            currentPage = chunk;
            currentChars = chunkChars;
            currentWords = chunkWords;
          } else {
            currentPage += ' ' + chunk;
            currentChars += chunkChars + 1; // +1 for space
            currentWords += chunkWords;
          }
        } else {
          if (currentPage.length > 0) {
            currentPage += ' ';
            currentChars += 1; // +1 for space
          }
          currentPage += chunk;
          currentChars += chunkChars + (currentPage.length > chunk.length ? 0 : 0); // space already added above
          currentWords += chunkWords;
        }
      }
    } else {
      // NEW: Normal sentence processing with dual-constraint validation
      const wouldExceedChars = currentChars + sentenceChars > targetCharsPerPage;
      const wouldExceedWords = currentWords + sentenceWords > targetWordsPerPage;
      
      if ((wouldExceedChars || wouldExceedWords) && currentPage.length > 0) {
        if (pages.length < maxPages) {
          pages.push(currentPage.trim());
          
          const breakReason = wouldExceedChars && wouldExceedWords ? 'both limits' : 
                            wouldExceedChars ? 'char limit' : 'word limit';
          console.log(`✅ Level${level} page completed (normal): ${currentChars} chars, ${currentWords} words (break: ${breakReason})`);
          
          currentPage = cleanSentence;
          currentChars = sentenceChars;
          currentWords = sentenceWords;
        } else {
          currentPage += ' ' + cleanSentence;
          currentChars += sentenceChars + 1; // +1 for space
          currentWords += sentenceWords;
        }
      } else {
        if (currentPage.length > 0) {
          currentPage += ' ';
          currentChars += 1; // +1 for space
        }
        currentPage += cleanSentence;
        currentChars += sentenceChars + (currentPage.length > cleanSentence.length ? 0 : 0); // space already added above
        currentWords += sentenceWords;
      }
    }
  }
  
  // Add final page if it has content
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }
  
  // TAIL BALANCING: Redistribute content more evenly across pages
  pages = balanceTailContent(pages, targetCharsPerPage, targetWordsPerPage);
  
  console.log(`🔧 Pages after tail balancing: ${pages.map((p, i) => `Page ${i+1}: ${p.length} chars, ${p.trim().split(/\s+/).length} words`).join(', ')}`);
  
  // Final truncation safety net for Netflix (enforce 12-page max regardless of content)
  if (maxPages <= 12 && pages.length > 12) {
    console.log(`🔧 FINAL TRUNCATION: Enforcing 12-page limit, truncating ${pages.length} pages to 12`);
    pages = pages.slice(0, 12);
  }
  
  // Ensure we have content - fallback to original if splitting failed
  return pages.length > 0 ? pages : [content.trim()];
}

/**
 * Balance tail content - redistribute sentences more evenly across pages with dual-constraint validation
 */
function balanceTailContent(pages: string[], targetCharsPerPage: number, targetWordsPerPage: number): string[] {
  if (pages.length <= 1) return pages;
  
  const balanced: string[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const currentPage = pages[i];
    const currentLength = currentPage.length;
    const currentWords = currentPage.trim().split(/\s+/).length;
    
    // If page is significantly under target and there's a next page, try to redistribute
    if (i < pages.length - 1 && currentLength < targetCharsPerPage * 0.6) {
      const nextPage = pages[i + 1];
      const nextSentences = nextPage.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      
      if (nextSentences.length > 1) {
        // Move first sentence from next page to current page
        const sentenceToMove = nextSentences[0];
        const sentenceWords = sentenceToMove.trim().split(/\s+/).length;
        const potentialLength = currentLength + sentenceToMove.length + 1;
        const potentialWords = currentWords + sentenceWords;
        
        // NEW: Check both character AND word count constraints
        const charConstraintOk = potentialLength <= targetCharsPerPage * 1.2;
        const wordConstraintOk = potentialWords <= targetWordsPerPage;
        
        if (charConstraintOk && wordConstraintOk) {
          balanced.push((currentPage + ' ' + sentenceToMove).trim());
          pages[i + 1] = nextSentences.slice(1).join(' ');
          
          console.log(`📊 Balanced content: moved ${sentenceWords} words to page ${i+1} (${currentWords}->${potentialWords} words, ${currentLength}->${potentialLength} chars)`);
          continue;
        } else {
          console.log(`🚫 Balance blocked: would exceed ${!charConstraintOk ? 'char' : 'word'} limit (${potentialLength} chars, ${potentialWords} words)`);
        }
      }
    }
    
    balanced.push(currentPage);
  }
  
  return balanced.filter(p => p.trim().length > 0);
}

/**
 * Validate content length for guest mode (6-page stories) - CHARACTER VALIDATION ONLY
 * TOKEN VALIDATION BYPASSED - Character validation is now the primary gatekeeper
 */
export function validateGuestStoryLength(content: string, level: ValidationLevel): {
  isValid: boolean;
  tokenCount: number;
  characterCount: number;
  maxAllowedTokens: number;
  maxAllowedChars: number;
  reason?: string;
  passedBy?: 'tokens' | 'characters' | 'both';
} {
  // TOKEN VALIDATION BYPASSED - Keep for metrics but don't use for validation decisions
  const tokenCount = estimateTokenCount(content);
  const characterCount = content.length;
  
  // NEW DYNAMIC VALIDATION: Use helper functions for consistent validation
  const expectedPages = getExpectedPagesForService('netflix', level) || 12;
  const minTotalChars = getMinCharactersTotal(level, expectedPages);
  const characterLimits = getCharacterLimitsForLevel(level);
  
  // PHASE OUT: Return high token ceiling for compatibility
  const maxTokens = 100000; // High ceiling - not used for validation
  const maxChars = Math.floor(characterLimits.maxChars * 0.8); // Conservative maximum
  
  // Detect special content types and apply even more lenient minimums
  const isSpecialContent = isTransition(content) || isEnding(content) || isCliffhanger(content);
  
  if (isSpecialContent) {
    // Apply 0.5x multiplier for special content types (even more lenient)
    const adjustedMinChars = Math.floor(minTotalChars * 0.5);
    
    console.log(`🎭 [CONTENT-TYPE] Special content detected:`, {
      isTransition: isTransition(content),
      isEnding: isEnding(content), 
      isCliffhanger: isCliffhanger(content),
      appliedMultiplier: 0.5,
      originalMinChars: minTotalChars,
      adjustedMinChars
    });
  }
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Guest story CHARACTER-ONLY validation for ${level}:`, {
    level,
    tokenCount: `${tokenCount} (not validated - bypassed)`,
    characterCount,
    tokenValidation: 'DISABLED',
    expectedPages,
    minTotalChars: `${minTotalChars} (${getMinCharactersPerPage(level)}/page × ${expectedPages})`,
    maxChars,
    contentLength: content.length
  });
  
  // CHARACTER VALIDATION ONLY - Token validation completely bypassed  
  const passesCharacterValidation = characterCount >= minTotalChars && characterCount <= maxChars;
  
  if (!passesCharacterValidation) {
    const reason = characterCount < minTotalChars ? 
      `Story too short: ${characterCount} chars (min: ${minTotalChars} = ${getMinCharactersPerPage(level)}/page × ${expectedPages} pages)` :
      `Story too long: ${characterCount} chars (max: ${maxChars})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Guest story failed CHARACTER validation for ${level}:`, {
      characterCount, minTotalChars, maxChars, expectedPages,
      tokenValidation: 'BYPASSED',
      reason
    });
    
    return {
      isValid: false,
      tokenCount,
      characterCount,
      maxAllowedTokens: maxTokens,
      maxAllowedChars: maxChars,
      reason
    };
  }
  
  console.log(`✅ [VALIDATION-DEBUG] Guest story validation passed for ${level} (character-only):`, {
    tokenCount: `${tokenCount} (not validated)`,
    characterCount, minTotalChars, maxChars, expectedPages,
    tokenValidation: 'BYPASSED',
    charUtilization: Math.round((characterCount / maxChars) * 100)
  });
  
  return {
    isValid: true,
    tokenCount,
    characterCount,
    maxAllowedTokens: maxTokens,
    maxAllowedChars: maxChars,
    passedBy: 'characters'
  };
}

/**
 * Validate content length for live mode (page-by-page) - CHARACTER VALIDATION ONLY
 * TOKEN VALIDATION BYPASSED - Character validation is now the primary gatekeeper
 */
export function validateLivePageLength(content: string, level: ValidationLevel, isEndingPage: boolean = false): {
  isValid: boolean;
  tokenCount: number;
  characterCount: number;
  maxAllowedTokens: number;
  maxAllowedChars: number;
  reason?: string;
  passedBy?: 'tokens' | 'characters' | 'both';
  isSeverelyTooLong?: boolean; // For Live service: 2x+ too long needs retry with hint
  wordCount?: number;
  wordsPerPageValid?: boolean;
  wordCountValidation?: {
    minWords: number;
    maxWords: number;
    actualWords: number;
    isValid: boolean;
    reason?: string;
  };
} {
  // TOKEN VALIDATION BYPASSED - Keep for metrics but don't use for validation decisions
  const tokenCount = estimateTokenCount(content);
  const characterCount = content.length;
  const wordCount = content.trim().split(/\s+/).length;
  
  // ENDING PAGE BYPASS: Skip all validation for ending pages in Live Generation
  if (isEndingPage) {
    return {
      isValid: true,
      tokenCount,
      characterCount,
      maxAllowedTokens: 100000,
      maxAllowedChars: 100000,
      wordCount,
      wordsPerPageValid: true,
      wordCountValidation: {
        minWords: 0,
        maxWords: 100000,
        actualWords: wordCount,
        isValid: true,
        reason: 'Ending page - validation bypassed'
      },
      passedBy: 'both',
      reason: 'Ending page validation bypassed for Live Generation'
    };
  }
  
  // NEW DYNAMIC VALIDATION: Use helper functions for consistent per-page validation
  const minCharsPerPage = getMinCharactersPerPage(level);
  const characterLimits = getCharacterLimitsForLevel(level);
  
  // PHASE OUT: Return high token ceiling for compatibility
  const maxTokens = 100000; // High ceiling - not used for validation
  let maxCharsPerPage = Math.floor(characterLimits.maxChars * 0.8); // Conservative per-page maximum
  
  // NEW WORD COUNT VALIDATION - Primary implementation from plan
  const wordLimits = getWordCountLimitsForLevel(level);
  const wordCountValidation = {
    minWords: wordLimits.minWords,
    maxWords: wordLimits.maxWords,
    actualWords: wordCount,
    isValid: wordCount >= wordLimits.minWords && wordCount <= wordLimits.maxWords,
    reason: wordCount < wordLimits.minWords 
      ? `Too few words: ${wordCount} (min: ${wordLimits.minWords})`
      : wordCount > wordLimits.maxWords 
      ? `Too many words: ${wordCount} (max: ${wordLimits.maxWords})`
      : undefined
  };
  
  // LEGACY: Phase 4 words-per-page validation (keeping for compatibility)
  let wordsPerPageValid = wordCountValidation.isValid;
  if (level === 'Level2') {
    // Legacy Level2 specific check - now redundant with wordCountValidation
    const legacyValid = wordCount >= 40 && wordCount <= 120; 
    if (!legacyValid) {
      console.log(`📝 Level2 legacy word density check: ${wordCount} words (target: 60-75 words per page)`);
    }
  }
  
  // Detect special content types and apply even more lenient minimums
  const isSpecialContent = isTransition(content) || isEnding(content) || isCliffhanger(content);
  let adjustedMinCharsPerPage = minCharsPerPage;
  
  if (isSpecialContent) {
    // Apply 0.5x multiplier for special content types (even more lenient)
    adjustedMinCharsPerPage = Math.floor(minCharsPerPage * 0.5);
    
    console.log(`🎭 [CONTENT-TYPE] Special content detected:`, {
      isTransition: isTransition(content),
      isEnding: isEnding(content), 
      isCliffhanger: isCliffhanger(content),
      appliedMultiplier: 0.5,
      originalMinChars: minCharsPerPage,
      adjustedMinChars: adjustedMinCharsPerPage
    });
  }
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Live page CHARACTER-ONLY validation for ${level}:`, {
    level,
    tokenCount: `${tokenCount} (not validated - bypassed)`,
    characterCount,
    wordCount,
    wordsPerPageValid,
    tokenValidation: 'DISABLED',
    minCharsPerPage: `${adjustedMinCharsPerPage} (base: ${minCharsPerPage})`,
    maxCharsPerPage,
    contentLength: content.length
  });
  
  // CHARACTER VALIDATION ONLY - Token validation completely bypassed
  const passesCharacterValidation = characterCount >= adjustedMinCharsPerPage && characterCount <= maxCharsPerPage;
  
  // LIVE SERVICE PREMIUM USER PROTECTION:
  // Check if content is severely too long (2x+ limit) vs moderately too long
  const isSeverelyTooLong = characterCount > (maxCharsPerPage * 2);
  
  if (!passesCharacterValidation) {
    const reason = characterCount < adjustedMinCharsPerPage ? 
      `Page too short: ${characterCount} chars (min: ${adjustedMinCharsPerPage})` :
      `Page too long: ${characterCount} chars (max: ${maxCharsPerPage})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Live page failed CHARACTER validation for ${level}:`, {
      characterCount, adjustedMinCharsPerPage, maxCharsPerPage,
      wordCount, wordsPerPageValid,
      isSeverelyTooLong,
      tokenValidation: 'BYPASSED',
      reason
    });
    
    return {
      isValid: false,
      tokenCount,
      characterCount,
      maxAllowedTokens: maxTokens,
      maxAllowedChars: maxCharsPerPage,
      reason,
      isSeverelyTooLong,
      wordCount,
      wordsPerPageValid,
      wordCountValidation
    };
  }
  
  console.log(`✅ [VALIDATION-DEBUG] Live page validation passed for ${level} (character-only):`, {
    tokenCount: `${tokenCount} (not validated)`,
    characterCount, adjustedMinCharsPerPage, maxCharsPerPage,
    wordCount, wordsPerPageValid,
    tokenValidation: 'BYPASSED',
    charUtilization: Math.round((characterCount / maxCharsPerPage) * 100)
  });
  
  
  return {
    isValid: true,
    tokenCount,
    characterCount,
    maxAllowedTokens: maxTokens,
    maxAllowedChars: maxCharsPerPage,
    passedBy: 'characters',
    isSeverelyTooLong: false,
    wordCount,
    wordsPerPageValid,
    wordCountValidation
  };
}

/**
 * Smart content splitting with enhanced asterisk pattern detection and sentence fallback
 */
export function parseIntoPages(content: string, level: ValidationLevel, service: 'netflix' | 'live' = 'netflix'): string[] {
  if (!content?.trim()) return [];
  
  // Enhanced asterisk pattern detection with priority: *** > ** > *
  let markerSplit: string[] = [];
  let detectedPattern = '';
  
  // Try *** first (most preferred)
  if (content.includes('***')) {
    markerSplit = content.split(/\s*\*\*\*\s*/);
    detectedPattern = '***';
  }
  // Try ** if no *** found
  else if (content.includes('**')) {
    markerSplit = content.split(/\s*\*\*\s*/);
    detectedPattern = '**';
  }
  // Try * if no ** found  
  else if (content.includes('*')) {
    markerSplit = content.split(/\s*\*\s*/);
    detectedPattern = '*';
  }
  
  if (markerSplit.length > 1) {
    // Asterisk markers found - clean and return pages
    const pages = markerSplit
      .map(page => page.trim())
      .filter(page => page.length > 0);
    
    console.log(`✅ Page splitting: Found ${pages.length} pages using '${detectedPattern}' markers`);
    
    // Enforce Netflix page limits (max 12 pages)
    if (service === 'netflix' && pages.length > 12) {
      console.log(`🔧 Netflix page limit: Truncating ${pages.length} pages to 12 pages`);
      return pages.slice(0, 12);
    }
    
    return pages;
  }
  
  // Service-specific fallback splitting
  if (service === 'live') {
    console.log(`🔄 Live service: No splitting, returning single page`);
    return [content.trim()];
  }
  
  // Netflix service: Enhanced sentence-based splitting
  console.log(`🔄 Netflix service: No asterisk markers found, using enhanced smart fallback`);
  const expectedPages = getExpectedPagesForService('netflix', level);
  const smartSplit = enhancedAutoSplitContent(content, level, expectedPages || 12);
  
  // Enforce Netflix page limits (max 12 pages)
  const finalPages = smartSplit.length > 12 ? smartSplit.slice(0, 12) : smartSplit;
  if (smartSplit.length > 12) {
    console.log(`🔧 Netflix page limit: Smart fallback truncated ${smartSplit.length} pages to 12 pages`);
  }
  
  console.log(`✅ Netflix service: Generated ${finalPages.length} pages using smart fallback (target: ${expectedPages})`);
  return finalPages;
}


/**
 * Arc-aware validation functions for predictable arc lengths
 */

/**
 * Get B value (scenes per arc) for validation level
 */
export function getBValueForLevel(level: ValidationLevel): number {
  const bValues = {
    'Level0': 0,  // Level 0 excluded from arc processing
    'Level1': 5,
    'Level2': 8,
    'Level3': 10,
    'Level4': 12,
    'Grade6': 15,
    'Grade7': 15,
    'Grade8': 15,
    'Grade9': 15,
    'Grade10': 15
  };
  
  return bValues[level] || 8; // Default to Level 2
}



// Backward compatibility alias
export const autoSplitContent = enhancedAutoSplitContent;