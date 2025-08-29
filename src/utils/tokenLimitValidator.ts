// Token Limit Validation Utility
// Ensures consistent token limits across prompt configurations

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';

export interface TokenLimitConfig {
  difficulty: DifficultyLevel | ExpertGradeLevel;
  maxTokens: number;
  wordsPerToken: number; // Approximate conversion ratio
  expectedPages?: number;
  tokensPerPage?: number;
}

// Hardcoded token limits for stable validation across all systems
export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const HARDCODED_LIMITS = {
    beginner: 48, easy: 72, medium: 120, hard: 180, expert: 240,
    '6th': 900, '7th': 1100, '8th': 1200, '9th': 1400, '10th': 1600
  };
  return HARDCODED_LIMITS[difficulty] || 48; // bulletproof fallback
}

// Simplified configuration for page calculations
export const PAGE_CONFIG = {
  beginner: { expectedPages: 8, tokensPerPage: 6 },
  easy: { expectedPages: 6, tokensPerPage: 12 },
  medium: { expectedPages: 8, tokensPerPage: 15 },
  hard: { expectedPages: 10, tokensPerPage: 18 },
  expert: { expectedPages: 12, tokensPerPage: 20 },
  '6th': { expectedPages: 12, tokensPerPage: 75 },
  '7th': { expectedPages: 13, tokensPerPage: 85 },
  '8th': { expectedPages: 14, tokensPerPage: 86 },
  '9th': { expectedPages: 15, tokensPerPage: 93 },
  '10th': { expectedPages: 16, tokensPerPage: 100 }
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
  mode: 'ai' | 'template' = 'ai'
): TokenValidationResult {
  const actualTokens = estimateTokenCount(text);
  const maxTokens = getTokenLimitForDifficulty(difficulty);
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
  mode: 'ai' | 'template' = 'ai'
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