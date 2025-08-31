// Token Limit Validation Utility - NOW USES SYSTEM PROMPTS AS SINGLE SOURCE OF TRUTH
// Ensures consistent token limits across prompt configurations

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';
import { 
  getPerPageTokenLimit as getPerPageTokenLimitFromPrompts, 
  getTotalStoryTokensForGuests as getTotalStoryTokensForGuestsFromPrompts,
  getTotalNetflixTokens as getTotalNetflixTokensFromPrompts 
} from '../../supabase/functions/_shared/storyPrompts';

// Get per-page token limit from system prompts (for live generation)
export function getPerPageTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimitFromPrompts(difficulty);
}

// Get total story tokens for guests (6 pages of consistent difficulty)
export function getTotalStoryTokensForGuests(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getTotalStoryTokensForGuestsFromPrompts(difficulty);
}

// Get total Netflix generation tokens (10-12 pages depending on difficulty)
export function getTotalNetflixTokens(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getTotalNetflixTokensFromPrompts(difficulty);
}

// Get expected pages for difficulty level
function getExpectedPages(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  // Handle expert grade levels and alternate formats
  if (['6th', '7th', '8th', '9th', '10th'].includes(difficulty)) {
    return 12;
  }
  
  // Handle alternate naming conventions like "grade6", "grade7", etc.
  const gradeMatch = difficulty.match(/^grade(\d+)$/);
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1]);
    if (gradeNum >= 6 && gradeNum <= 10) {
      return 12;
    }
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

// Realistic page configuration based on business logic and system prompts - NOW DYNAMIC
export function getPageConfig(difficulty: DifficultyLevel | ExpertGradeLevel) {
  const tokensPerPage = getPerPageTokenLimit(difficulty);
  const expectedPages = (['6th', '7th', '8th', '9th', '10th'].includes(difficulty)) ? 12 : 10;
  
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