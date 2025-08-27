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

// Standardized token limits based on difficulty and reading level
export const TOKEN_LIMITS: Record<DifficultyLevel, TokenLimitConfig> = {
  beginner: {
    difficulty: 'beginner',
    maxTokens: 200,
    wordsPerToken: 0.75, // Simple words are often shorter tokens
    expectedPages: 5,
    tokensPerPage: 40
  },
  easy: {
    difficulty: 'easy',
    maxTokens: 300,
    wordsPerToken: 0.75,
    expectedPages: 6,
    tokensPerPage: 50
  },
  medium: {
    difficulty: 'medium',
    maxTokens: 400,
    wordsPerToken: 0.75,
    expectedPages: 8,
    tokensPerPage: 50
  },
  hard: {
    difficulty: 'hard',
    maxTokens: 600,
    wordsPerToken: 0.75,
    expectedPages: 10,
    tokensPerPage: 60
  },
  expert: {
    difficulty: 'expert',
    maxTokens: 800,
    wordsPerToken: 0.75,
    expectedPages: 12,
    tokensPerPage: 65
  }
};

export const EXPERT_TOKEN_LIMITS: Record<ExpertGradeLevel, TokenLimitConfig> = {
  '6th': {
    difficulty: '6th',
    maxTokens: 1200, // 800-900 words
    wordsPerToken: 0.75,
    expectedPages: 12,
    tokensPerPage: 100
  },
  '7th': {
    difficulty: '7th',
    maxTokens: 1470, // 900-1100 words
    wordsPerToken: 0.75,
    expectedPages: 13,
    tokensPerPage: 113
  },
  '8th': {
    difficulty: '8th',
    maxTokens: 1600, // 1000-1200 words
    wordsPerToken: 0.75,
    expectedPages: 14,
    tokensPerPage: 114
  },
  '9th': {
    difficulty: '9th',
    maxTokens: 1730, // 1100-1300 words
    wordsPerToken: 0.75,
    expectedPages: 15,
    tokensPerPage: 115
  },
  '10th': {
    difficulty: '10th',
    maxTokens: 1870, // 1200-1400 words
    wordsPerToken: 0.75,
    expectedPages: 16,
    tokensPerPage: 117
  }
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
  const config = TOKEN_LIMITS[difficulty as DifficultyLevel] || 
                  EXPERT_TOKEN_LIMITS[difficulty as ExpertGradeLevel];
  
  if (!config) {
    return {
      isValid: false,
      actualTokens,
      maxAllowed: 0,
      warnings: [`Unknown difficulty level: ${difficulty}`]
    };
  }
  
  // Phase 6: Enhanced validation with template vs AI mode detection
  const isTemplateMode = mode === 'template';
  const templateMultiplier = isTemplateMode && difficulty !== 'beginner' ? 1.8 : 1.0; // Accept higher density for Level 1+ templates
  const effectiveMaxTokens = Math.floor(config.maxTokens * templateMultiplier);
  
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
  
  // Template mode specific warnings
  if (isTemplateMode && difficulty !== 'beginner') {
    warnings.push(
      `Template mode: higher word density accepted (${Math.round(templateMultiplier * 100)}% of AI limit)`
    );
  }
  
  return {
    isValid,
    actualTokens,
    maxAllowed: effectiveMaxTokens,
    exceededBy: isValid ? undefined : actualTokens - effectiveMaxTokens,
    warnings,
    templateMode: isTemplateMode,
    expectedPages: config.expectedPages
  };
}

export function validatePageTokenDistribution(
  pages: string[], 
  difficulty: DifficultyLevel | ExpertGradeLevel,
  mode: 'ai' | 'template' = 'ai'
): TokenValidationResult {
  const totalText = pages.join(' ');
  const totalValidation = validateTokenLimit(totalText, difficulty, mode);
  
  const config = TOKEN_LIMITS[difficulty as DifficultyLevel] || 
                  EXPERT_TOKEN_LIMITS[difficulty as ExpertGradeLevel];
  
  if (!config || !config.tokensPerPage) {
    return totalValidation;
  }
  
  const warnings = [...totalValidation.warnings];
  
  // Check individual page token distribution
  for (let i = 0; i < pages.length; i++) {
    const pageTokens = estimateTokenCount(pages[i]);
    const maxPageTokens = config.tokensPerPage * 1.5; // Allow 50% variance per page
    
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

export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const config = TOKEN_LIMITS[difficulty as DifficultyLevel] || 
                  EXPERT_TOKEN_LIMITS[difficulty as ExpertGradeLevel];
  return config?.maxTokens || 800; // Default fallback
}

export function getRecommendedWordsForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const config = TOKEN_LIMITS[difficulty as DifficultyLevel] || 
                  EXPERT_TOKEN_LIMITS[difficulty as ExpertGradeLevel];
  return config ? Math.floor(config.maxTokens * config.wordsPerToken) : 600;
}