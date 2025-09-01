// Shared Validation Utilities - Portable across TypeScript and Deno
// Single source of truth for core validation logic

// Import shared configuration
import validationConfig from './validation-config.json' assert { type: 'json' };

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
 * Get token limits for a validation level
 */
export function getTokenLimitsForLevel(level: ValidationLevel) {
  return validationConfig.tokenLimits[level] || validationConfig.tokenLimits.Level2;
}

/**
 * Get expected pages for a validation level
 */
export function getExpectedPagesForLevel(level: ValidationLevel): number {
  return validationConfig.pageExpectations[level] || 10;
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
 * Validate content length for guest mode (6-page stories)
 */
export function validateGuestStoryLength(content: string, level: ValidationLevel): {
  isValid: boolean;
  tokenCount: number;
  maxAllowed: number;
  reason?: string;
} {
  const tokenCount = estimateTokenCount(content);
  const limits = getTokenLimitsForLevel(level);
  const maxTokens = limits.guestStory;
  const minTokens = Math.floor(maxTokens * validationConfig.validationThresholds.minContentRatio);
  
  if (tokenCount < minTokens) {
    return {
      isValid: false,
      tokenCount,
      maxAllowed: maxTokens,
      reason: `Story too short: ${tokenCount} tokens (minimum: ${minTokens})`
    };
  }
  
  if (tokenCount > maxTokens) {
    return {
      isValid: false,
      tokenCount,
      maxAllowed: maxTokens,
      reason: `Story too long: ${tokenCount} tokens (maximum: ${maxTokens})`
    };
  }
  
  return {
    isValid: true,
    tokenCount,
    maxAllowed: maxTokens
  };
}

/**
 * Validate content length for live mode (single page)
 */
export function validateLivePageLength(content: string, level: ValidationLevel): {
  isValid: boolean;
  tokenCount: number;
  maxAllowed: number;
  reason?: string;
} {
  const tokenCount = estimateTokenCount(content);
  const limits = getTokenLimitsForLevel(level);
  const maxTokens = limits.perPage;
  const minTokens = Math.floor(maxTokens * validationConfig.validationThresholds.minContentRatio);
  
  if (tokenCount < minTokens) {
    return {
      isValid: false,
      tokenCount,
      maxAllowed: maxTokens,
      reason: `Page too short: ${tokenCount} tokens (minimum: ${minTokens})`
    };
  }
  
  if (tokenCount > maxTokens * validationConfig.validationThresholds.splitTolerance) {
    return {
      isValid: false,
      tokenCount,
      maxAllowed: maxTokens,
      reason: `Page too long: ${tokenCount} tokens (maximum: ${maxTokens * validationConfig.validationThresholds.splitTolerance})`
    };
  }
  
  return {
    isValid: true,
    tokenCount,
    maxAllowed: maxTokens
  };
}

/**
 * Smart content splitting with *** marker detection and sentence fallback
 */
export function parseIntoPages(content: string, level: ValidationLevel): string[] {
  if (!content?.trim()) return [];
  
  // Primary method: Check for *** page markers
  const markerSplit = content.split(/\s*\*\*\*\s*/);
  
  if (markerSplit.length > 1) {
    // *** markers found - clean and return pages
    const pages = markerSplit
      .map(page => page.trim())
      .filter(page => page.length > 0);
    
    console.log(`✅ Page splitting: Found ${pages.length} pages using *** markers`);
    return pages;
  }
  
  // Fallback method: Enhanced sentence-based splitting
  console.log(`🔄 Page splitting: No *** markers found, using enhanced smart fallback`);
  const expectedPages = getExpectedPagesForLevel(level);
  const smartSplit = enhancedAutoSplitContent(content, level, expectedPages);
  
  console.log(`✅ Page splitting: Generated ${smartSplit.length} pages using smart fallback (target: ${expectedPages})`);
  return smartSplit;
}

/**
 * Get token limits for story generation (used by backend)
 */
export function getTokensForGrade(gradeLevel: number): number {
  let level: ValidationLevel;
  
  if (gradeLevel >= 6 && gradeLevel <= 10) {
    level = `Grade${gradeLevel}` as ValidationLevel;
  } else {
    // Map numeric grade to difficulty level
    if (gradeLevel === 0) level = 'Level0';
    else if (gradeLevel === 1) level = 'Level1';
    else if (gradeLevel === 2) level = 'Level2';
    else if (gradeLevel === 3) level = 'Level3';
    else level = 'Level4';
  }
  
  const expectedPages = getExpectedPagesForLevel(level);
  const tokensPerPage = getTokenLimitsForLevel(level).perPage;
  
  // Return total tokens for expected story length
  return expectedPages * tokensPerPage;
}

// Backward compatibility alias
export const autoSplitContent = enhancedAutoSplitContent;