// Token Limit Validation Utility - USES HARDCODED LIMITS MATCHING SYSTEM PROMPTS
// Ensures consistent token limits across prompt configurations

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';

// Hardcoded token limits matching system prompt values
const TOKEN_LIMITS: Record<string, number> = {
  'beginner': 15,
  'easy': 32,
  'medium': 150,
  'hard': 200,
  'expert': 500,
  '6th': 500,
  '7th': 500,
  '8th': 500,
  '9th': 500,
  '10th': 500
};

// Get per-page token limit (for live generation)
export function getPerPageTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const normalized = normalizeGradeLevel(difficulty);
  return TOKEN_LIMITS[normalized] || TOKEN_LIMITS['beginner']; // Default to beginner
}

// Get total story tokens for guests (6 pages of consistent difficulty)
export function getTotalStoryTokensForGuests(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimit(difficulty) * 6; // 6 pages for guests
}

// Get total Netflix generation tokens (10-12 pages depending on difficulty)
export function getTotalNetflixTokens(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const tokensPerPage = getPerPageTokenLimit(difficulty);
  const expectedPages = isExpertGradeLevel(difficulty) ? 12 : 10;
  return tokensPerPage * expectedPages;
}

/**
 * Normalize grade level format to handle all variations
 */
function normalizeGradeLevel(difficulty: string): string {
  // Handle "grade6", "grade7", etc. -> "6th", "7th", etc.
  const gradeMatch = difficulty.match(/^grade(\d+)$/);
  if (gradeMatch) {
    return `${gradeMatch[1]}th`;
  }
  
  // Handle "6", "7", etc. -> "6th", "7th", etc.
  const numMatch = difficulty.match(/^(\d+)$/);
  if (numMatch) {
    return `${numMatch[1]}th`;
  }
  
  return difficulty; // Return as-is if already in standard format
}

/**
 * Check if difficulty is an expert grade level
 */
function isExpertGradeLevel(difficulty: string): boolean {
  const normalized = normalizeGradeLevel(difficulty);
  return ['6th', '7th', '8th', '9th', '10th'].includes(normalized);
}

// Get expected pages for difficulty level
function getExpectedPages(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  // Expert grade levels get more pages
  if (isExpertGradeLevel(difficulty)) {
    return 12;
  }
  
  return 10; // Regular difficulty levels
}

export interface TokenLimitConfig {
  difficulty: DifficultyLevel | ExpertGradeLevel;
  maxTokens: number;
  wordsPerToken: number; // Approximate conversion ratio
  expectedPages?: number;
  tokensPerPage?: number;
}

// Token limits now come from system prompts - single source of truth
export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getTotalNetflixTokens(difficulty); // For Netflix generation (total story)
}

// Token limits for SINGLE PAGE generation (Live Generation service)
export function getTokenLimitForSinglePage(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimit(difficulty); // From system prompts
}

// Realistic page configuration based on business logic and system prompts - NOW DYNAMIC
export function getPageConfig(difficulty: DifficultyLevel | ExpertGradeLevel) {
  const tokensPerPage = getPerPageTokenLimit(difficulty);
  const expectedPages = isExpertGradeLevel(difficulty) ? 12 : 10;
  
  return {
    expectedPages,
    tokensPerPage
  };
}

export interface TokenValidationResult {
  isValid: boolean;
  actualTokens: number;
  maxAllowed: number;
  exceededBy?: number;
  warnings: string[];
  templateMode?: boolean;
  expectedPages?: number;
  actualPages?: number;
}

export function estimateTokenCount(text: string): number {
  // Simple token estimation based on word count and punctuation
  const words = text.trim().split(/\s+/).length;
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  return Math.ceil(words * 1.3 + punctuation * 0.5); // Conservative estimate
}

export function validateTokenLimit(
  text: string, 
  difficulty: DifficultyLevel | ExpertGradeLevel,
  mode: 'ai' | 'template' | 'live' | 'netflix' = 'ai'
): TokenValidationResult {
  const actualTokens = estimateTokenCount(text);
  
  // Use appropriate token limit based on generation mode
  const maxTokens = mode === 'live' ? 
    getTokenLimitForSinglePage(difficulty) : 
    getTokenLimitForDifficulty(difficulty);
    
  const pageConfig = getPageConfig(difficulty);
  
  // Enhanced validation with template vs AI mode detection
  const isTemplateMode = mode === 'template';
  const templateMultiplier = isTemplateMode && difficulty !== 'beginner' ? 1.8 : 1.0;
  const effectiveMaxTokens = Math.floor(maxTokens * templateMultiplier);
  
  const isValid = actualTokens <= effectiveMaxTokens;
  const warnings: string[] = [];
  
  if (!isValid) {
    warnings.push(
      `Text exceeds ${mode} token limit: ${actualTokens} tokens (max: ${effectiveMaxTokens})`
    );
  }
  
  // Different warning thresholds for template vs AI mode
  const warningThreshold = isTemplateMode ? 0.95 : 0.9;
  if (actualTokens >= effectiveMaxTokens * warningThreshold && actualTokens <= effectiveMaxTokens) {
    warnings.push(
      `Text is approaching ${mode} token limit: ${actualTokens}/${effectiveMaxTokens} tokens`
    );
  }
  
  return {
    isValid,
    actualTokens,
    maxAllowed: effectiveMaxTokens,
    exceededBy: isValid ? undefined : actualTokens - effectiveMaxTokens,
    warnings,
    templateMode: isTemplateMode,
    expectedPages: pageConfig.expectedPages
  };
}

export function validatePageTokenDistribution(
  pages: string[], 
  difficulty: DifficultyLevel | ExpertGradeLevel,
  mode: 'ai' | 'template' | 'live' | 'netflix' = 'ai'
): TokenValidationResult {
  const totalText = pages.join(' ');
  const totalValidation = validateTokenLimit(totalText, difficulty, mode);
  
  const pageConfig = getPageConfig(difficulty);
  const warnings = [...totalValidation.warnings];
  
  // Check individual page token distribution
  for (let i = 0; i < pages.length; i++) {
    const pageTokens = estimateTokenCount(pages[i]);
    const maxPageTokens = pageConfig.tokensPerPage * 1.5; // Allow 50% variance per page
    
    if (pageTokens > maxPageTokens) {
      warnings.push(
        `Page ${i + 1} exceeds recommended tokens: ${pageTokens} (max: ${maxPageTokens})`
      );
    }
  }
  
  return {
    ...totalValidation,
    warnings,
    actualPages: pages.length
  };
}

export function getRecommendedWordsForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const maxTokens = getTokenLimitForDifficulty(difficulty);
  return Math.floor(maxTokens * 0.75); // Conservative token-to-word conversion
}

// GUEST USER VALIDATION: Validate total 6-page story experience
export function validateGuestStoryTokens(text: string, difficulty: DifficultyLevel | ExpertGradeLevel): TokenValidationResult {
  const actualTokens = estimateTokenCount(text);
  const maxTokens = getTotalStoryTokensForGuests(difficulty); // 6 pages worth
  
  return {
    isValid: actualTokens <= maxTokens,
    actualTokens,
    maxAllowed: maxTokens,
    exceededBy: actualTokens > maxTokens ? actualTokens - maxTokens : undefined,
    warnings: actualTokens > maxTokens ? [`Guest story exceeds 6-page limit: ${actualTokens}/${maxTokens} tokens`] : []
  };
}

// PREMIUM USER VALIDATION: Validate individual page
export function validatePremiumPageTokens(text: string, difficulty: DifficultyLevel | ExpertGradeLevel): TokenValidationResult {
  const actualTokens = estimateTokenCount(text);
  const maxTokens = getPerPageTokenLimit(difficulty); // Per page
  
  return {
    isValid: actualTokens <= maxTokens,
    actualTokens,
    maxAllowed: maxTokens,
    exceededBy: actualTokens > maxTokens ? actualTokens - maxTokens : undefined,
    warnings: actualTokens > maxTokens ? [`Page exceeds limit: ${actualTokens}/${maxTokens} tokens`] : []
  };
}