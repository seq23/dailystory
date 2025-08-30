// Token Limit Validation Utility - NOW USES SYSTEM PROMPTS AS SINGLE SOURCE OF TRUTH
// Ensures consistent token limits across prompt configurations

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';

// System prompt token limits - extracted directly from actual system prompts
const SYSTEM_PROMPT_TOKEN_LIMITS = {
  beginner: 8, // "Maximum 8 tokens per page. Max 6 words per page"
  easy: 32,    // "Maximum 32 tokens per page. Target 15-24 words per page"
  medium: 93,  // "Maximum 93 tokens per page. Target 50-70 words per page"
  hard: 160,   // "Maximum 160 tokens per page. Target 80-120 words per page"
  expert: 267, // "Maximum 267 tokens per page. Target 120-200 words per page"
  '6th': 400,  // "Maximum 400 tokens per page. Target 200-400 words per page"
  '7th': 427,  // "Maximum 427 tokens per page. Target 200-400 words per page"
  '8th': 453,  // "Maximum 453 tokens per page. Target 200-400 words per page"
  '9th': 480,  // "Maximum 480 tokens per page. Target 200-400 words per page"
  '10th': 533  // "Maximum 533 tokens per page. Target 200-400 words per page"
} as const;

// Get per-page token limit from system prompts (for live generation)
export function getPerPageTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return SYSTEM_PROMPT_TOKEN_LIMITS[difficulty] || 8; // Safe fallback
}

// Get total story tokens for guests (6 pages of consistent difficulty)
export function getTotalStoryTokensForGuests(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimit(difficulty) * 6; // 6 pages for guests
}

// Get total Netflix generation tokens (10-12 pages depending on difficulty)
export function getTotalNetflixTokens(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const perPageTokens = getPerPageTokenLimit(difficulty);
  const pages = getExpectedPages(difficulty);
  return perPageTokens * pages;
}

// Get expected pages for difficulty level
function getExpectedPages(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  // Basic levels generate 10 pages, grade levels generate 12 pages
  if (['6th', '7th', '8th', '9th', '10th'].includes(difficulty)) {
    return 12;
  }
  return 10;
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

// Realistic page configuration based on business logic and system prompts
export const PAGE_CONFIG = {
  beginner: { expectedPages: 10, tokensPerPage: 8 }, // Netflix generates 10, guests see 6
  easy: { expectedPages: 10, tokensPerPage: 32 },
  medium: { expectedPages: 10, tokensPerPage: 93 },
  hard: { expectedPages: 10, tokensPerPage: 160 },
  expert: { expectedPages: 10, tokensPerPage: 267 },
  '6th': { expectedPages: 12, tokensPerPage: 400 }, // Grade levels generate 12 pages
  '7th': { expectedPages: 12, tokensPerPage: 427 },
  '8th': { expectedPages: 12, tokensPerPage: 453 },
  '9th': { expectedPages: 12, tokensPerPage: 480 },
  '10th': { expectedPages: 12, tokensPerPage: 533 }
};

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
    
  const pageConfig = PAGE_CONFIG[difficulty];
  
  if (!pageConfig) {
    return {
      isValid: false,
      actualTokens,
      maxAllowed: 0,
      warnings: [`Unknown difficulty level: ${difficulty}`]
    };
  }
  
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
  
  const pageConfig = PAGE_CONFIG[difficulty];
  
  if (!pageConfig) {
    return totalValidation;
  }
  
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