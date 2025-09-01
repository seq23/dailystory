// Unified Validation System - Central validation hub with guest/live modes
// Integrates content filtering, token validation, and auto-pagination

import { ContentSecurity } from './security';
import { estimateTokenCount } from './tokenLimitValidator';
import type { DifficultyLevel, ExpertGradeLevel } from '@/types';

export type ValidationLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Grade6' | 'Grade7' | 'Grade8' | 'Grade9' | 'Grade10';

export type ValidationDecision = 
  | 'ACCEPT'
  | 'REPAIR_AND_SPLIT' 
  | 'REPAIR'
  | 'RETRY_WITH_HINT'
  | 'REJECT';

export interface ValidationResult {
  decision: ValidationDecision;
  isValid: boolean;
  content?: string[];
  reasons: string[];
  metrics: {
    tokenCount: number;
    pageCount: number;
    contentAppropriate: boolean;
    vocabularyCompliance?: number;
  };
  hints?: string[];
}

export interface ValidationConfig {
  mode: 'guest' | 'live';
  level: ValidationLevel;
  userLanguage?: string;
  vocabularyIntegration?: any;
}

export class UnifiedValidator {
  // Per-page token limits by level
  private static readonly PER_PAGE_TOKENS = {
    'Level0': 15,
    'Level1': 60, 
    'Level2': 250,
    'Level3': 350,
    'Level4': 500,
    'Grade6': 500,
    'Grade7': 500,
    'Grade8': 500,
    'Grade9': 500,
    'Grade10': 500
  };

  // Guest story limits (6 pages total)
  private static readonly GUEST_STORY_TOKENS = {
    'Level0': 90,   // 15 * 6
    'Level1': 360,  // 60 * 6
    'Level2': 1500, // 250 * 6
    'Level3': 2100, // 350 * 6
    'Level4': 3000, // 500 * 6
    'Grade6': 3000, // 500 * 6
    'Grade7': 3000,
    'Grade8': 3000,
    'Grade9': 3000,
    'Grade10': 3000
  };

  /**
   * Main validation entry point
   */
  static validateContent(
    content: string | string[],
    config: ValidationConfig
  ): ValidationResult {
    const pages = Array.isArray(content) ? content : [content];
    const totalContent = pages.join(' ');
    const tokenCount = estimateTokenCount(totalContent);
    const pageCount = pages.length;

    // Detect story language for performance optimization
    const storyLanguage = this.detectStoryLanguage(totalContent);
    const isEnglishOnly = storyLanguage === 'en';

    // Performance optimization: cache content validation results
    const contentHash = `${totalContent.substring(0, 100)}_${config.level}_${isEnglishOnly ? 'en' : config.userLanguage}`;
    let contentValidation = this._contentValidationCache?.get(contentHash);
    
    if (!contentValidation) {
      // Content filtering using level-based security with language optimization
      contentValidation = ContentSecurity.isContentAppropriateForLevel(
        totalContent, 
        config.level,
        isEnglishOnly ? 'en' : config.userLanguage
      );
      
      // Cache the result
      if (!this._contentValidationCache) {
        this._contentValidationCache = new Map();
      }
      this._contentValidationCache.set(contentHash, contentValidation);
      
      // Limit cache size
      if (this._contentValidationCache.size > 500) {
        const firstKey = this._contentValidationCache.keys().next().value;
        this._contentValidationCache.delete(firstKey);
      }
    }

    // Performance optimization: Add debug logging for medium level validation
    if (config.level === 'Level2' || config.level === 'medium' as any) {
      console.log(`🔍 [UnifiedValidator] Medium level validation:`, {
        level: config.level,
        tokenCount,
        pageCount,
        storyLanguage,
        isEnglishOnly,
        contentAppropriate: contentValidation.appropriate,
        contentLength: totalContent.length
      });
    }

    const metrics = {
      tokenCount,
      pageCount,
      contentAppropriate: contentValidation.appropriate,
      vocabularyCompliance: this.calculateVocabularyCompliance(totalContent, config.vocabularyIntegration)
    };

    // If content is inappropriate, reject immediately
    if (!contentValidation.appropriate) {
      return {
        decision: 'REJECT',
        isValid: false,
        reasons: [contentValidation.reason || 'Content inappropriate for age level'],
        metrics
      };
    }

    // Mode-specific validation
    if (config.mode === 'guest') {
      return this.validateGuestStory(pages, config, metrics);
    } else {
      return this.validateLivePage(pages, config, metrics);
    }
  }

  /**
   * Guest mode validation (6-page stories)
   */
  private static validateGuestStory(
    pages: string[],
    config: ValidationConfig,
    metrics: any
  ): ValidationResult {
    const maxTokens = this.GUEST_STORY_TOKENS[config.level];
    const minTokens = Math.floor(maxTokens * 0.1); // 10% minimum threshold
    
    // Check if content meets minimum requirements
    if (metrics.tokenCount < minTokens) {
      return {
        decision: 'RETRY_WITH_HINT',
        isValid: false,
        reasons: [`Story too short: ${metrics.tokenCount} tokens (minimum: ${minTokens})`],
        metrics,
        hints: ['Generate more detailed content', 'Add more descriptive elements']
      };
    }

    // Check if content exceeds maximum (needs splitting)
    if (metrics.tokenCount > maxTokens) {
      const splitPages = this.autoSplitContent(pages.join(' '), config.level, 6);
      if (splitPages.length <= 6) {
        return {
          decision: 'REPAIR_AND_SPLIT',
          isValid: true,
          content: splitPages,
          reasons: ['Content auto-split to fit 6-page guest limit'],
          metrics: {
            ...metrics,
            pageCount: splitPages.length,
            tokenCount: estimateTokenCount(splitPages.join(' '))
          }
        };
      } else {
        return {
          decision: 'REPAIR',
          isValid: false,
          reasons: [`Story too long: ${metrics.tokenCount} tokens (maximum: ${maxTokens})`],
          metrics,
          hints: ['Reduce content length', 'Focus on core story elements']
        };
      }
    }

    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: ['Guest story validation passed'],
      metrics
    };
  }

  /**
   * Live mode validation (page-by-page)
   */
  private static validateLivePage(
    pages: string[],
    config: ValidationConfig,
    metrics: any
  ): ValidationResult {
    const maxTokensPerPage = this.PER_PAGE_TOKENS[config.level];
    
    // For live mode, typically validating one page at a time
    if (pages.length === 1) {
      const pageTokens = estimateTokenCount(pages[0]);
      
      if (pageTokens > maxTokensPerPage * 1.5) { // Allow 50% overflow for splitting
        const splitPages = this.autoSplitContent(pages[0], config.level, 2);
        return {
          decision: 'REPAIR_AND_SPLIT',
          isValid: true,
          content: splitPages,
          reasons: ['Page content auto-split due to length'],
          metrics: {
            ...metrics,
            pageCount: splitPages.length,
            tokenCount: estimateTokenCount(splitPages.join(' '))
          }
        };
      }

      if (pageTokens < maxTokensPerPage * 0.1) { // Less than 10% is too short
        return {
          decision: 'RETRY_WITH_HINT',
          isValid: false,
          reasons: [`Page too short: ${pageTokens} tokens (minimum: ${Math.floor(maxTokensPerPage * 0.1)})`],
          metrics,
          hints: ['Add more descriptive details', 'Expand the scene']
        };
      }

      return {
        decision: 'ACCEPT',
        isValid: true,
        content: pages,
        reasons: ['Live page validation passed'],
        metrics
      };
    }

    // Multiple pages in live mode - validate each
    const oversizedPages: number[] = [];
    const undersizedPages: number[] = [];

    pages.forEach((page, index) => {
      const pageTokens = estimateTokenCount(page);
      if (pageTokens > maxTokensPerPage * 1.5) {
        oversizedPages.push(index);
      } else if (pageTokens < maxTokensPerPage * 0.1) {
        undersizedPages.push(index);
      }
    });

    if (oversizedPages.length > 0 || undersizedPages.length > 0) {
      const reasons = [];
      if (oversizedPages.length > 0) {
        reasons.push(`Pages ${oversizedPages.map(i => i + 1).join(', ')} are oversized`);
      }
      if (undersizedPages.length > 0) {
        reasons.push(`Pages ${undersizedPages.map(i => i + 1).join(', ')} are undersized`);
      }

      return {
        decision: 'REPAIR',
        isValid: false,
        reasons,
        metrics,
        hints: ['Adjust page content length', 'Redistribute content across pages']
      };
    }

    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: ['Live multi-page validation passed'],
      metrics
    };
  }

  /**
   * Auto-split content into appropriate page sizes
   */
  private static autoSplitContent(content: string, level: ValidationLevel, maxPages: number): string[] {
    const targetTokensPerPage = this.PER_PAGE_TOKENS[level];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const pages: string[] = [];
    let currentPage = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = estimateTokenCount(sentence.trim() + '.');
      
      // If adding this sentence would exceed target and we have content, start new page
      if (currentTokens + sentenceTokens > targetTokensPerPage && currentPage.length > 0) {
        if (pages.length < maxPages) {
          pages.push(currentPage.trim());
          currentPage = sentence.trim() + '.';
          currentTokens = sentenceTokens;
        } else {
          // At max pages, add to current page
          currentPage += ' ' + sentence.trim() + '.';
          currentTokens += sentenceTokens;
        }
      } else {
        // Add to current page
        if (currentPage.length > 0) {
          currentPage += ' ';
        }
        currentPage += sentence.trim() + '.';
        currentTokens += sentenceTokens;
      }
    }

    // Add final page if it has content
    if (currentPage.trim().length > 0) {
      pages.push(currentPage.trim());
    }

    return pages.length > 0 ? pages : [content]; // Fallback to original if splitting failed
  }

  /**
   * Calculate vocabulary compliance percentage
   */
  private static calculateVocabularyCompliance(content: string, vocabularyIntegration?: any): number {
    if (!vocabularyIntegration) {
      return 1.0; // Default to 100% if no vocabulary requirements
    }

    // This would integrate with VocabularyService
    // For now, return a placeholder
    return 0.85;
  }

  /**
   * Map difficulty level to validation level
   */
  static mapDifficultyToLevel(difficulty: DifficultyLevel | ExpertGradeLevel): ValidationLevel {
    const difficultyMap: Record<string, ValidationLevel> = {
      'beginner': 'Level0',
      'easy': 'Level1', 
      'medium': 'Level2',
      'hard': 'Level3',
      'expert': 'Level4',
      '6th': 'Grade6',
      'grade6': 'Grade6',
      '7th': 'Grade7',
      'grade7': 'Grade7',
      '8th': 'Grade8',
      'grade8': 'Grade8',
      '9th': 'Grade9',
      'grade9': 'Grade9',
      '10th': 'Grade10',
      'grade10': 'Grade10'
    };

    return difficultyMap[difficulty.toLowerCase()] || 'Level2';
  }

  /**
   * Detect story language for performance optimization
   * Enhanced detection for medium level debugging
   */
  private static detectStoryLanguage(content: string): string {
    // Quick English detection - if content is primarily Latin characters and common English patterns
    const englishIndicators = /\b(the|and|a|to|of|in|is|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|have|from|or|one|had|by|word|but|not|what|all|were|we|when|your|can|said)\b/gi;
    const englishMatches = content.match(englishIndicators);
    const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
    
    // If >40% of words are common English words, assume English (lowered threshold for better detection)
    if (englishMatches && totalWords > 0 && englishMatches.length / totalWords > 0.4) {
      return 'en';
    }
    
    // Check for non-Latin scripts that would indicate other languages
    if (/[\u0600-\u06FF]/.test(content)) return 'ar'; // Arabic
    if (/[\u4e00-\u9fff]/.test(content)) return 'zh'; // Chinese
    if (/[\u0900-\u097F]/.test(content)) return 'hi'; // Hindi
    if (/[\u0400-\u04FF]/.test(content)) return 'ru'; // Russian
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(content)) return 'ja'; // Japanese
    
    // Additional check for Latin-based content with English characteristics
    const latinScript = /^[\x00-\x7F\u00C0-\u017F\u0100-\u024F\s\d\.\,\!\?\'\"\-\(\)]+$/;
    if (latinScript.test(content)) {
      return 'en';
    }
    
    // Default to English for Latin scripts and unknown content
    return 'en';
  }

  // Content validation cache for performance
  private static _contentValidationCache: Map<string, { appropriate: boolean; reason?: string }> | null = null;

  /**
   * Get recommended token limits for level
   */
  static getTokenLimits(level: ValidationLevel) {
    return {
      perPage: this.PER_PAGE_TOKENS[level],
      guestStory: this.GUEST_STORY_TOKENS[level]
    };
  }
}