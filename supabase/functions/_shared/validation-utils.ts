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
  return validationConfig.difficultyMapping[normalized] || 'Level2';
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
    console.warn(`⚠️ Unknown validation level: ${level}, using fallback`);
    return validationConfig.tokenLimits.Level2;
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
 * Get character limits for a validation level
 */
export function getCharacterLimitsForLevel(level: ValidationLevel) {
  return validationConfig.characterThresholds[level] || validationConfig.characterThresholds.Level2;
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
  const targetCharsPerPage = Math.floor(characterLimits.maxChars / Math.max(maxPages, 12));
  
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
  
  const pages: string[] = [];
  let currentPage = '';
  let currentChars = 0;
  
  // Level 0: Strict 1-sentence per page with emergency chunking
  if (level === 'Level0') {
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;
      
      const sentenceChars = cleanSentence.length;
      
      // If sentence is too long for Level 0, emergency chunk it
      if (sentenceChars > targetCharsPerPage) {
        const chunks = emergencyChunkSentence(cleanSentence, targetCharsPerPage);
        pages.push(...chunks);
      } else {
        pages.push(cleanSentence);
      }
      
      // Stop if we've hit max pages
      if (pages.length >= maxPages) break;
    }
    
    return pages.length > 0 ? pages : [content.trim()];
  }
  
  // Level 1-4+: Smart packing with word-chunking fallback
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    if (!cleanSentence) continue;
    
    const sentenceChars = cleanSentence.length;
    
    // If sentence is too long and has no punctuation, word-chunk it
    if (sentenceChars > targetCharsPerPage * 1.5 && !/[.!?]/.test(cleanSentence)) {
      const chunks = wordChunkSentence(cleanSentence, targetCharsPerPage);
      
      for (const chunk of chunks) {
        const chunkChars = chunk.length;
        
        if (currentChars + chunkChars > targetCharsPerPage && currentPage.length > 0) {
          if (pages.length < maxPages) {
            pages.push(currentPage.trim());
            currentPage = chunk;
            currentChars = chunkChars;
          } else {
            currentPage += ' ' + chunk;
            currentChars += chunkChars + 1; // +1 for space
          }
        } else {
          if (currentPage.length > 0) currentPage += ' ';
          currentPage += chunk;
          currentChars += chunkChars + (currentPage.length > chunk.length ? 1 : 0); // +1 for space
        }
      }
    } else {
      // Normal sentence processing with smart packing
      if (currentChars + sentenceChars > targetCharsPerPage && currentPage.length > 0) {
        if (pages.length < maxPages) {
          pages.push(currentPage.trim());
          currentPage = cleanSentence;
          currentChars = sentenceChars;
        } else {
          currentPage += ' ' + cleanSentence;
          currentChars += sentenceChars + 1; // +1 for space
        }
      } else {
        if (currentPage.length > 0) currentPage += ' ';
        currentPage += cleanSentence;
        currentChars += sentenceChars + (currentPage.length > cleanSentence.length ? 1 : 0); // +1 for space
      }
    }
  }
  
  // Add final page if it has content
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }
  
  // Final truncation safety net for Netflix (enforce 12-page max regardless of content)
  if (maxPages <= 12 && pages.length > 12) {
    console.log(`🔧 FINAL TRUNCATION: Enforcing 12-page limit, truncating ${pages.length} pages to 12`);
    pages = pages.slice(0, 12);
  }
  
  // Ensure we have content - fallback to original if splitting failed
  return pages.length > 0 ? pages : [content.trim()];
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
  const characterLimits = getCharacterLimitsForLevel(level);
  
  // PHASE OUT: Return high token ceiling for compatibility
  const maxTokens = 100000; // High ceiling - not used for validation
  const minChars = Math.floor(characterLimits.minChars * 0.6); // Conservative per-page minimum
  const maxChars = Math.floor(characterLimits.maxChars * 0.8); // Conservative per-page maximum
  
  // Detect special content types and apply even more lenient minimums
  const isSpecialContent = isTransition(content) || isEnding(content) || isCliffhanger(content);
  
  if (isSpecialContent) {
    // Apply 0.5x multiplier for special content types (even more lenient)
    const adjustedMinChars = Math.floor(minChars * 0.5);
    
    console.log(`🎭 [CONTENT-TYPE] Special content detected:`, {
      isTransition: isTransition(content),
      isEnding: isEnding(content), 
      isCliffhanger: isCliffhanger(content),
      appliedMultiplier: 0.5,
      originalMinChars: minChars,
      adjustedMinChars
    });
  }
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Live page CHARACTER-ONLY validation for ${level}:`, {
    level,
    tokenCount: `${tokenCount} (not validated - bypassed)`,
    characterCount,
    tokenValidation: 'DISABLED',
    characterLimits: { minChars, maxChars },
    contentLength: content.length
  });
  
  // CHARACTER VALIDATION ONLY - Token validation completely bypassed
  const passesCharacterValidation = characterCount >= minChars && characterCount <= maxChars;
  
  if (!passesCharacterValidation) {
    const reason = characterCount < minChars ? 
      `Page too short: ${characterCount} chars (min: ${minChars})` :
      `Page too long: ${characterCount} chars (max: ${maxChars})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Page failed CHARACTER validation for ${level}:`, {
      characterCount, minChars, maxChars,
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
  
  console.log(`✅ [VALIDATION-DEBUG] Page validation passed for ${level} (character-only):`, {
    tokenCount: `${tokenCount} (not validated)`,
    characterCount, minChars, maxChars,
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
export function validateLivePageLength(content: string, level: ValidationLevel): {
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
  const characterLimits = getCharacterLimitsForLevel(level);
  
  // PHASE OUT: Return high token ceiling for compatibility
  const maxTokens = 100000; // High ceiling - not used for validation
  
  // For live pages, use direct per-page character limits (no story-level calculations)
  let minCharsPerPage = Math.floor(characterLimits.minChars * 0.6); // Conservative per-page minimum
  let maxCharsPerPage = Math.floor(characterLimits.maxChars * 0.8); // Conservative per-page maximum
  
  // Detect special content types and apply even more lenient minimums
  const isSpecialContent = isTransition(content) || isEnding(content) || isCliffhanger(content);
  
  if (isSpecialContent) {
    // Apply 0.5x multiplier for special content types (even more lenient)
    minCharsPerPage = Math.floor(minCharsPerPage * 0.5);
    
    console.log(`🎭 [CONTENT-TYPE] Special content detected:`, {
      isTransition: isTransition(content),
      isEnding: isEnding(content), 
      isCliffhanger: isCliffhanger(content),
      appliedMultiplier: 0.5,
      originalMinChars: minCharsPerPage * 2,
      adjustedMinChars: minCharsPerPage
    });
  }
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Live page CHARACTER-ONLY validation for ${level}:`, {
    level,
    tokenCount: `${tokenCount} (not validated - bypassed)`,
    characterCount,
    tokenValidation: 'DISABLED',
    characterLimits: { minCharsPerPage, maxCharsPerPage },
    contentLength: content.length
  });
  
  // CHARACTER VALIDATION ONLY - Token validation completely bypassed
  const passesCharacterValidation = characterCount >= minCharsPerPage && characterCount <= maxCharsPerPage;
  
  if (!passesCharacterValidation) {
    const reason = characterCount < minCharsPerPage ? 
      `Page too short: ${characterCount} chars (min: ${minCharsPerPage})` :
      `Page too long: ${characterCount} chars (max: ${maxCharsPerPage})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Page failed CHARACTER validation for ${level}:`, {
      characterCount, minCharsPerPage, maxCharsPerPage,
      tokenValidation: 'BYPASSED',
      reason
    });
    
    return {
      isValid: false,
      tokenCount,
      characterCount,
      maxAllowedTokens: maxTokens,
      maxAllowedChars: maxCharsPerPage,
      reason
    };
  }
  
  console.log(`✅ [VALIDATION-DEBUG] Page validation passed for ${level} (character-only):`, {
    tokenCount: `${tokenCount} (not validated)`,
    characterCount, minCharsPerPage, maxCharsPerPage,
    tokenValidation: 'BYPASSED',
    charUtilization: Math.round((characterCount / maxCharsPerPage) * 100)
  });
  
  return {
    isValid: true,
    tokenCount,
    characterCount,
    maxAllowedTokens: maxTokens,
    maxAllowedChars: maxCharsPerPage,
    passedBy: 'characters'
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