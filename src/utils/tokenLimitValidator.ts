// Token Limit Validation Utility - UNIFIED VALIDATOR INTEGRATION
// Now uses UnifiedValidator as primary validation system

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';
import { UnifiedValidator, type ValidationLevel } from './unifiedValidator';

// Import token functions from system prompts - single source of truth
import { getPerPageTokenLimit as getSystemPerPageTokenLimit } from '../../supabase/functions/_shared/storyPrompts';

// Get per-page token limit - redirects to UnifiedValidator
export function getPerPageTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
  return UnifiedValidator.getTokenLimits(level).perPage;
}

// Get total story tokens for guests - redirects to UnifiedValidator
export function getTotalStoryTokensForGuests(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
  return UnifiedValidator.getTokenLimits(level).guestStory;
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

// Token limits redirected to UnifiedValidator
export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getTotalStoryTokensForGuests(difficulty); // For guest/Netflix stories (6 pages)
}

// Token limits for SINGLE PAGE generation - redirects to UnifiedValidator
export function getTokenLimitForSinglePage(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimit(difficulty);
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
  // Redirect to UnifiedValidator for comprehensive validation
  const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
  const validationMode = mode === 'live' ? 'live' : 'guest';
  
  const result = UnifiedValidator.validateContent(text, {
    mode: validationMode,
    level
  });

  // Convert UnifiedValidator result to TokenValidationResult format
  const actualTokens = result.metrics.tokenCount;
  const limits = UnifiedValidator.getTokenLimits(level);
  const maxTokens = mode === 'live' ? limits.perPage : limits.guestStory;
  
  // Enhanced validation with template vs AI mode detection
  const isTemplateMode = mode === 'template';
  const templateMultiplier = isTemplateMode && difficulty !== 'beginner' ? 1.8 : 1.0;
  const effectiveMaxTokens = Math.floor(maxTokens * templateMultiplier);
  
  const isValid = result.isValid && actualTokens <= effectiveMaxTokens;
  const warnings: string[] = [...result.reasons];
  
  if (!isValid && actualTokens > effectiveMaxTokens) {
    warnings.push(
      `Text exceeds ${mode} token limit: ${actualTokens} tokens (max: ${effectiveMaxTokens})`
    );
  }
  
  const pageConfig = getPageConfig(difficulty);
  
  return {
    isValid,
    actualTokens,
    maxAllowed: effectiveMaxTokens,
    exceededBy: isValid ? undefined : Math.max(0, actualTokens - effectiveMaxTokens),
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

// GUEST USER VALIDATION: Validate total 6-page story experience - Uses UnifiedValidator
export function validateGuestStoryTokens(text: string, difficulty: DifficultyLevel | ExpertGradeLevel): TokenValidationResult {
  const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
  const result = UnifiedValidator.validateContent(text, { mode: 'guest', level });
  
  const actualTokens = result.metrics.tokenCount;
  const maxTokens = UnifiedValidator.getTokenLimits(level).guestStory;
  
  return {
    isValid: result.isValid,
    actualTokens,
    maxAllowed: maxTokens,
    exceededBy: actualTokens > maxTokens ? actualTokens - maxTokens : undefined,
    warnings: result.reasons
  };
}

// PREMIUM USER VALIDATION: Validate individual page - Uses UnifiedValidator
export function validatePremiumPageTokens(text: string, difficulty: DifficultyLevel | ExpertGradeLevel): TokenValidationResult {
  const level = UnifiedValidator.mapDifficultyToLevel(difficulty);
  const result = UnifiedValidator.validateContent(text, { mode: 'live', level });
  
  const actualTokens = result.metrics.tokenCount;
  const maxTokens = UnifiedValidator.getTokenLimits(level).perPage;
  
  return {
    isValid: result.isValid,
    actualTokens,
    maxAllowed: maxTokens,
    exceededBy: actualTokens > maxTokens ? actualTokens - maxTokens : undefined,
    warnings: result.reasons
  };
}