// Shared Validation Utilities - Portable across TypeScript and Deno
// Single source of truth for core validation logic

// Import shared configuration for fallbacks only
import validationConfig from './validation-config.json' assert { type: 'json' };
// Import dynamic extraction functions - SINGLE SOURCE OF TRUTH
import { extractTokenLimitFromPrompt, getStoryPrompt, getExpertStoryPrompt, type DifficultyLevel as PromptDifficultyLevel, type ExpertGradeLevel as PromptExpertGradeLevel } from './storyPrompts.ts';

export type ValidationLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Grade6' | 'Grade7' | 'Grade8' | 'Grade9' | 'Grade10';
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type ExpertGradeLevel = 'grade6' | 'grade7' | 'grade8' | 'grade9' | 'grade10' | '6th' | '7th' | '8th' | '9th' | '10th';

/**
 * Simple token estimation based on word count and punctuation
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
  
  try {
    let perPageTokens;
    
    // Get tokens from system prompts - SINGLE SOURCE OF TRUTH
    if (['beginner', 'easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      const prompt = getStoryPrompt(difficulty as PromptDifficultyLevel);
      perPageTokens = extractTokenLimitFromPrompt(prompt.systemPrompt);
    } else {
      const prompt = getExpertStoryPrompt(difficulty as PromptExpertGradeLevel);
      perPageTokens = extractTokenLimitFromPrompt(prompt.systemPrompt);
    }
    
    // Calculate guest story tokens using expected pages for level
    const expectedPages = getExpectedPagesForLevel(level);
    const guestStoryTokens = perPageTokens * expectedPages;
    
    console.log(`✅ Dynamic token extraction for ${level} (${difficulty}): ${perPageTokens} per page, ${guestStoryTokens} guest story`);
    
    return {
      perPage: perPageTokens,
      guestStory: guestStoryTokens
    };
  } catch (error) {
    console.error(`🚨 Failed to extract tokens for ${level}:`, error);
    return validationConfig.tokenLimits[level] || validationConfig.tokenLimits.Level2;
  }
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
export function emergencyChunkSentence(sentence: string, targetTokens: number): string[] {
  const words = sentence.trim().split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const word of words) {
    const wordTokens = estimateTokenCount(word);
    
    if (currentTokens + wordTokens > targetTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
      currentTokens = wordTokens;
    } else {
      if (currentChunk.length > 0) currentChunk += ' ';
      currentChunk += word;
      currentTokens += wordTokens;
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
export function wordChunkSentence(sentence: string, targetTokens: number): string[] {
  const words = sentence.trim().split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const word of words) {
    const wordTokens = estimateTokenCount(word);
    
    if (currentTokens + wordTokens > targetTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim() + '.');
      currentChunk = word;
      currentTokens = wordTokens;
    } else {
      if (currentChunk.length > 0) currentChunk += ' ';
      currentChunk += word;
      currentTokens += wordTokens;
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
  
  const targetTokensPerPage = getTokenLimitsForLevel(level).perPage;
  
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
  let currentTokens = 0;
  
  // Level 0: Strict 1-sentence per page with emergency chunking
  if (level === 'Level0') {
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;
      
      const sentenceTokens = estimateTokenCount(cleanSentence);
      
      // If sentence is too long for Level 0, emergency chunk it
      if (sentenceTokens > targetTokensPerPage) {
        const chunks = emergencyChunkSentence(cleanSentence, targetTokensPerPage);
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
    
    const sentenceTokens = estimateTokenCount(cleanSentence);
    
    // If sentence is too long and has no punctuation, word-chunk it
    if (sentenceTokens > targetTokensPerPage * 1.5 && !/[.!?]/.test(cleanSentence)) {
      const chunks = wordChunkSentence(cleanSentence, targetTokensPerPage);
      
      for (const chunk of chunks) {
        const chunkTokens = estimateTokenCount(chunk);
        
        if (currentTokens + chunkTokens > targetTokensPerPage && currentPage.length > 0) {
          if (pages.length < maxPages) {
            pages.push(currentPage.trim());
            currentPage = chunk;
            currentTokens = chunkTokens;
          } else {
            currentPage += ' ' + chunk;
            currentTokens += chunkTokens;
          }
        } else {
          if (currentPage.length > 0) currentPage += ' ';
          currentPage += chunk;
          currentTokens += chunkTokens;
        }
      }
    } else {
      // Normal sentence processing with smart packing
      if (currentTokens + sentenceTokens > targetTokensPerPage && currentPage.length > 0) {
        if (pages.length < maxPages) {
          pages.push(currentPage.trim());
          currentPage = cleanSentence;
          currentTokens = sentenceTokens;
        } else {
          currentPage += ' ' + cleanSentence;
          currentTokens += sentenceTokens;
        }
      } else {
        if (currentPage.length > 0) currentPage += ' ';
        currentPage += cleanSentence;
        currentTokens += sentenceTokens;
      }
    }
  }
  
  // Add final page if it has content
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }
  
  // Ensure we have content - fallback to original if splitting failed
  return pages.length > 0 ? pages : [content.trim()];
}

/**
 * Validate content length for guest mode (6-page stories) - Dual validation system
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
  const tokenCount = estimateTokenCount(content);
  const characterCount = content.length;
  const tokenLimits = getTokenLimitsForLevel(level);
  const characterLimits = getCharacterLimitsForLevel(level);
  
  const maxTokens = tokenLimits.guestStory;
  const minTokens = Math.floor(maxTokens * validationConfig.validationThresholds.minContentRatio);
  const minChars = characterLimits.minChars;
  const maxChars = characterLimits.maxChars;
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Guest story dual validation for ${level}:`, {
    level,
    tokenCount,
    characterCount,
    tokenLimits: { minTokens, maxTokens },
    characterLimits: { minChars, maxChars },
    contentLength: content.length,
    minContentRatio: validationConfig.validationThresholds.minContentRatio
  });
  
  // Check if content passes either validation method
  const passesTokenValidation = tokenCount >= minTokens && tokenCount <= maxTokens;
  const passesCharacterValidation = characterCount >= minChars && characterCount <= maxChars;
  
  if (!passesTokenValidation && !passesCharacterValidation) {
    const reason = tokenCount < minTokens ? 
      `Story too short: ${tokenCount} tokens (min: ${minTokens}) and ${characterCount} chars (min: ${minChars})` :
      `Story too long: ${tokenCount} tokens (max: ${maxTokens}) and ${characterCount} chars (max: ${maxChars})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Story failed both validations for ${level}:`, {
      tokenCount, minTokens, maxTokens,
      characterCount, minChars, maxChars,
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
  
  // Determine which validation(s) passed
  let passedBy: 'tokens' | 'characters' | 'both';
  if (passesTokenValidation && passesCharacterValidation) {
    passedBy = 'both';
  } else if (passesTokenValidation) {
    passedBy = 'tokens';
  } else {
    passedBy = 'characters';
  }
  
  console.log(`✅ [VALIDATION-DEBUG] Story validation passed for ${level} (passed by: ${passedBy}):`, {
    tokenCount, minTokens, maxTokens,
    characterCount, minChars, maxChars,
    tokenUtilization: Math.round((tokenCount / maxTokens) * 100),
    charUtilization: Math.round((characterCount / maxChars) * 100)
  });
  
  return {
    isValid: true,
    tokenCount,
    characterCount,
    maxAllowedTokens: maxTokens,
    maxAllowedChars: maxChars,
    passedBy
  };
}

/**
 * Validate content length for live mode (single page) - Dual validation system
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
  const tokenCount = estimateTokenCount(content);
  const characterCount = content.length;
  const tokenLimits = getTokenLimitsForLevel(level);
  const characterLimits = getCharacterLimitsForLevel(level);
  
  const maxTokens = tokenLimits.perPage;
  const minTokens = Math.floor(maxTokens * validationConfig.validationThresholds.minContentRatio);
  const maxTokensWithTolerance = maxTokens * validationConfig.validationThresholds.splitTolerance;
  
  // For live pages, use direct per-page character limits (no story-level calculations)
  let minCharsPerPage = Math.floor(characterLimits.minChars * 0.6); // Conservative per-page minimum
  let maxCharsPerPage = Math.floor(characterLimits.maxChars * 0.8); // Conservative per-page maximum
  
  // Detect special content types and apply even more lenient minimums
  const isSpecialContent = isTransition(content) || isEnding(content) || isCliffhanger(content);
  let adjustedMinTokens = minTokens;
  
  if (isSpecialContent) {
    // Apply 0.5x multiplier for special content types (even more lenient)
    adjustedMinTokens = Math.floor(minTokens * 0.5);
    minCharsPerPage = Math.floor(minCharsPerPage * 0.5);
    
    console.log(`🎭 [CONTENT-TYPE] Special content detected:`, {
      isTransition: isTransition(content),
      isEnding: isEnding(content), 
      isCliffhanger: isCliffhanger(content),
      appliedMultiplier: 0.5,
      originalMinTokens: minTokens,
      adjustedMinTokens
    });
  }
  
  // Enhanced logging for debugging
  console.log(`🔍 [VALIDATION-DEBUG] Live page dual validation for ${level}:`, {
    level,
    tokenCount,
    characterCount,
    tokenLimits: { minTokens, maxTokens, maxTokensWithTolerance },
    characterLimits: { minCharsPerPage, maxCharsPerPage },
    contentLength: content.length,
    splitTolerance: validationConfig.validationThresholds.splitTolerance
  });
  
  // Check if content passes either validation method
  const passesTokenValidation = tokenCount >= adjustedMinTokens && tokenCount <= maxTokensWithTolerance;
  const passesCharacterValidation = characterCount >= minCharsPerPage && characterCount <= maxCharsPerPage;
  
  if (!passesTokenValidation && !passesCharacterValidation) {
    const reason = tokenCount < adjustedMinTokens ? 
      `Page too short: ${tokenCount} tokens (min: ${adjustedMinTokens}) and ${characterCount} chars (min: ${minCharsPerPage})` :
      `Page too long: ${tokenCount} tokens (max: ${maxTokensWithTolerance}) and ${characterCount} chars (max: ${maxCharsPerPage})`;
    
    console.log(`❌ [VALIDATION-DEBUG] Page failed both validations for ${level}:`, {
      tokenCount, minTokens: adjustedMinTokens, maxTokensWithTolerance,
      characterCount, minCharsPerPage, maxCharsPerPage,
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
  
  // Determine which validation(s) passed
  let passedBy: 'tokens' | 'characters' | 'both';
  if (passesTokenValidation && passesCharacterValidation) {
    passedBy = 'both';
  } else if (passesTokenValidation) {
    passedBy = 'tokens';
  } else {
    passedBy = 'characters';
  }
  
  console.log(`✅ [VALIDATION-DEBUG] Page validation passed for ${level} (passed by: ${passedBy}):`, {
    tokenCount, minTokens: adjustedMinTokens, maxTokens,
    characterCount, minCharsPerPage, maxCharsPerPage,
    tokenUtilization: Math.round((tokenCount / maxTokens) * 100),
    charUtilization: Math.round((characterCount / maxCharsPerPage) * 100)
  });
  
  return {
    isValid: true,
    tokenCount,
    characterCount,
    maxAllowedTokens: maxTokens,
    maxAllowedChars: maxCharsPerPage,
    passedBy
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
  
  console.log(`✅ Netflix service: Generated ${smartSplit.length} pages using smart fallback (target: ${expectedPages})`);
  return smartSplit;
}

/**
 * Get token limits for story generation (used by backend)
 * PHASE OUT: Returns high ceiling for story generation - character limits are primary validation
 */
export function getTokensForGrade(gradeLevel: number): number {
  // PHASE OUT TOKEN VALIDATION: Return high ceiling for story generation
  // Character validation is now the primary gatekeeper for story length
  return 100000; // No artificial token cutoffs for stories
  
  // LEGACY CODE (keep for reference/utility functions):
  // let level: ValidationLevel;
  // 
  // if (gradeLevel >= 6 && gradeLevel <= 10) {
  //   level = `Grade${gradeLevel}` as ValidationLevel;
  // } else {
  //   // Map numeric grade to difficulty level
  //   if (gradeLevel === 0) level = 'Level0';
  //   else if (gradeLevel === 1) level = 'Level1';
  //   else if (gradeLevel === 2) level = 'Level2';
  //   else if (gradeLevel === 3) level = 'Level3';
  //   else level = 'Level4';
  // }
  // 
  // const expectedPages = getExpectedPagesForLevel(level);
  // const tokensPerPage = getTokenLimitsForLevel(level).perPage;
  // 
  // // Return total tokens for expected story length
  // return expectedPages * tokensPerPage;
}

// Backward compatibility alias
export const autoSplitContent = enhancedAutoSplitContent;