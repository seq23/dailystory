// Unified Validation System - Now using shared validation architecture
// Integrates content filtering, token validation, and auto-pagination

import { ContentSecurity } from './security';
import { StoryQualityChecker } from './storyQualityChecker';
import type { DifficultyLevel, ExpertGradeLevel } from '@/types';
// Import shared utilities for consistency with backend
import { 
  estimateTokenCount, 
  mapDifficultyToLevel, 
  getTokenLimitsForLevel, 
  enhancedAutoSplitContent as sharedAutoSplitContent,
  validateGuestStoryLength,
  validateLivePageLength,
  getExpectedPagesForService,
  type ValidationLevel 
} from '../../supabase/functions/_shared/validation-utils';

// Re-export ValidationLevel for compatibility
export type { ValidationLevel };

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
    qualityScore?: number;
    qualityIssues?: Array<{
      type: 'grammar' | 'flow' | 'structure' | 'readability';
      severity: 'error' | 'warning' | 'info';
      message: string;
    }>;
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
  // Token limits now sourced from shared config
  // Maintained for legacy compatibility but delegates to shared utilities

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
      vocabularyCompliance: this.calculateVocabularyCompliance(totalContent, config.vocabularyIntegration),
      qualityScore: 0,
      qualityIssues: []
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

    // Add quality validation after content security but before token validation
    const qualityCheck = this.validateStoryQuality(pages, config);
    metrics.qualityScore = qualityCheck.score;
    metrics.qualityIssues = qualityCheck.issues;

    // Add quality issues to reasons if they affect validity
    const qualityReasons = qualityCheck.issues
      .filter(issue => issue.severity === 'error')
      .map(issue => `Quality issue: ${issue.message}`);

    const baseReasons = qualityReasons;

    // Mode-specific validation with quality integration
    if (config.mode === 'guest') {
      return this.validateGuestStory(pages, config, metrics, baseReasons);
    } else {
      return this.validateLivePage(pages, config, metrics, baseReasons);
    }
  }

  /**
   * Validate story quality using StoryQualityChecker
   */
  private static validateStoryQuality(pages: string[], config: ValidationConfig) {
    // Map validation level to difficulty for StoryQualityChecker
    const difficultyMap = {
      'Level0': 'beginner' as const,
      'Level1': 'easy' as const, 
      'Level2': 'medium' as const,
      'Level3': 'hard' as const,
      'Level4': 'expert' as const
    };
    
    const difficulty = difficultyMap[config.level] || 'medium';
    return StoryQualityChecker.checkStoryQuality(pages, difficulty);
  }

  /**
   * Guest mode validation (6-page stories) - Enhanced dual validation with business-logic-aware page count validation
   */
  private static validateGuestStory(
    pages: string[],
    config: ValidationConfig,
    metrics: any,
    baseReasons: string[] = []
  ): ValidationResult {
    const fullContent = pages.join(' ');
    
    // PHASE 3: Add business-logic-aware page count validation
    const pageCount = pages.length;
    const expectedPages = getExpectedPagesForService('netflix', config.level) || 12;
    
    console.log(`🔍 [PAGE-COUNT-VALIDATION] Netflix validation for ${config.level}:`, {
      pageCount,
      expectedPages,
      businessModelCliff: 6
    });
    
    // Business-Logic-Aware Page Count Validation (Option B)
    if (pageCount < 6) {
      // REJECT: Below business model cliff - user experience broken
        return {
          decision: 'RETRY_WITH_HINT',
          isValid: false,
          reasons: [...baseReasons, `Story has ${pageCount} pages but needs at least 6 pages for business model (users see 6 pages)`],
          metrics: { ...metrics, pageCount, expectedPages },
        hints: [
          `Generate a story with at least 6 pages (target: ${expectedPages} pages)`,
          'Create more story content with additional scenes and development',
          'Add character interactions, setting descriptions, and plot progression'
        ]
      };
    } else if (pageCount >= 6 && pageCount <= 9) {
      // ACCEPT but log as under-target
      console.log(`⚠️ [PAGE-COUNT] Under-target but acceptable: ${pageCount} pages (target: ${expectedPages})`);
    } else if (pageCount >= 10 && pageCount <= 12) {
      // IDEAL target range
      console.log(`✅ [PAGE-COUNT] Ideal range: ${pageCount} pages (target: ${expectedPages})`);
    } else if (pageCount >= 13 && pageCount <= 15) {
      // ACCEPT but log over-target
      console.log(`⚠️ [PAGE-COUNT] Over-target but usable: ${pageCount} pages (target: ${expectedPages})`);
    } else if (pageCount > 15) {
      // TRUNCATE - way over limit
      console.log(`🔧 [PAGE-COUNT] Way over limit, truncating: ${pageCount} pages -> 12 pages`);
      const truncatedPages = pages.slice(0, 12);
      pages = truncatedPages;
      metrics.truncatedFromPages = pageCount;
    }
    
    const validationResult = validateGuestStoryLength(fullContent, config.level);
    
    // Enhanced logging for debugging
    console.log(`🔍 [UNIFIED-VALIDATOR] Guest story validation for ${config.level}:`, {
      level: config.level,
      tokenCount: validationResult.tokenCount,
      characterCount: validationResult.characterCount,
      isValid: validationResult.isValid,
      passedBy: validationResult.passedBy,
      reason: validationResult.reason
    });
    
    if (!validationResult.isValid) {
      const reason = validationResult.reason || 'Content validation failed';
      
      // Determine if content needs REPAIR or RETRY_WITH_HINT
      const needsCompleteRegeneration = reason.includes('too short') || 
                                      reason.includes('insufficient content') ||
                                      reason.includes('empty') ||
                                      (validationResult.tokenCount < validationResult.maxAllowedTokens * 0.3);
      
      if (needsCompleteRegeneration) {
        return {
          decision: 'RETRY_WITH_HINT',
          isValid: false,
          reasons: [...baseReasons, reason],
          metrics: {
            ...metrics,
            tokenCount: validationResult.tokenCount,
            characterCount: validationResult.characterCount,
            maxAllowedTokens: validationResult.maxAllowedTokens,
            maxAllowedChars: validationResult.maxAllowedChars
          },
          hints: [
            `Generate content with at least ${validationResult.maxAllowedTokens * 0.7} tokens`,
            'Include more descriptive details and story development',
            'Add dialogue, setting descriptions, and character interactions'
          ]
        };
      } else {
        // Content exists but has fixable issues (vocabulary, formatting, etc.)
        return {
          decision: 'REPAIR',
          isValid: false,
          reasons: [...baseReasons, reason],
          metrics: {
            ...metrics,
            tokenCount: validationResult.tokenCount,
            characterCount: validationResult.characterCount,
            maxAllowedTokens: validationResult.maxAllowedTokens,
            maxAllowedChars: validationResult.maxAllowedChars
          },
          hints: [
            'Adjust vocabulary complexity for age level',
            'Improve content structure and pacing',
            'Ensure appropriate difficulty level'
          ]
        };
      }
    }

    // Content exceeds token limits - attempt auto-split for Netflix
    if (validationResult.tokenCount > validationResult.maxAllowedTokens) {
      console.log(`🔧 UnifiedValidator: Content exceeds token limit, attempting Netflix auto-split`);
      
      const targetPages = getExpectedPagesForService('netflix', config.level) || 12;
      const splitPages = sharedAutoSplitContent(fullContent, config.level, targetPages);
      
      return {
        decision: 'REPAIR_AND_SPLIT',
        isValid: true,
        content: splitPages,
        reasons: [...baseReasons, `Content auto-split to ${splitPages.length} pages (passed by: ${validationResult.passedBy})`],
        metrics: {
          ...metrics,
          pageCount: splitPages.length,
          tokenCount: validationResult.tokenCount,
          characterCount: validationResult.characterCount,
          passedBy: validationResult.passedBy
        }
      };
    }

    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: [...baseReasons, `Guest story validation passed (passed by: ${validationResult.passedBy})`],
      metrics: {
        ...metrics,
        tokenCount: validationResult.tokenCount,
        characterCount: validationResult.characterCount,
        passedBy: validationResult.passedBy
      }
    };
  }

  /**
   * Live mode validation (page-by-page) - Enhanced dual validation with no page expectations
   */
  private static validateLivePage(
    pages: string[],
    config: ValidationConfig,
    metrics: any,
    baseReasons: string[] = []
  ): ValidationResult {
    // PHASE 4: Live service has no page expectations
    const expectedPages = getExpectedPagesForService('live', config.level); // Returns null
    console.log(`🔍 [LIVE-VALIDATION] Live mode validation for ${config.level}: no page expectations (${expectedPages})`);
    
    // For live mode, typically validating one page at a time
    if (pages.length === 1) {
      const validationResult = validateLivePageLength(pages[0], config.level);
      
      console.log(`🔍 [UNIFIED-VALIDATOR] Live page validation for ${config.level}:`, {
        level: config.level,
        tokenCount: validationResult.tokenCount,
        characterCount: validationResult.characterCount,
        isValid: validationResult.isValid,
        passedBy: validationResult.passedBy,
        reason: validationResult.reason
      });
      
      if (!validationResult.isValid) {
        const reason = validationResult.reason || 'Page validation failed';
        
        // For live pages, distinguish between content that's too short vs has other issues
        const needsCompleteRegeneration = reason.includes('too short') || 
                                        reason.includes('insufficient') ||
                                        (validationResult.tokenCount < validationResult.maxAllowedTokens * 0.5);
        
        if (needsCompleteRegeneration) {
          return {
            decision: 'RETRY_WITH_HINT',
            isValid: false,
            reasons: [...baseReasons, reason],
            metrics: {
              ...metrics,
              tokenCount: validationResult.tokenCount,
              characterCount: validationResult.characterCount
            },
            hints: [
              `Generate a page with at least ${validationResult.maxAllowedTokens * 0.8} tokens`,
              'Create more detailed scene descriptions',
              'Add character interactions and dialogue',
              'Include sensory details and emotional elements'
            ]
          };
        } else {
          return {
            decision: 'REPAIR',
            isValid: false,
            reasons: [...baseReasons, reason],
            metrics: {
              ...metrics,
              tokenCount: validationResult.tokenCount,
              characterCount: validationResult.characterCount
            },
            hints: [
              'Adjust vocabulary for target reading level',
              'Improve sentence structure and flow',
              'Enhance age-appropriate content'
            ]
          };
        }
      }

      // Check if page is egregiously long (>30% margin) - send to AI repair, don't split for live mode
      if (validationResult.tokenCount > validationResult.maxAllowedTokens * 1.3) {
        return {
          decision: 'REPAIR',
          isValid: false,
          reasons: [...baseReasons, `Live page is egregiously long (${validationResult.tokenCount} tokens > ${validationResult.maxAllowedTokens * 1.3})`],
          metrics: {
            ...metrics,
            tokenCount: validationResult.tokenCount,
            characterCount: validationResult.characterCount
          },
          hints: [
            'Reduce content length to fit single page format',
            'Focus on one key scene or moment',
            'Remove excessive descriptions while keeping essential story elements'
          ]
        };
      }
      
      // Keep all meaningful content in single page for live mode - no splitting

      return {
        decision: 'ACCEPT',
        isValid: true,
        content: pages,
        reasons: [...baseReasons, `Live page validation passed (passed by: ${validationResult.passedBy})`],
        metrics: {
          ...metrics,
          tokenCount: validationResult.tokenCount,
          characterCount: validationResult.characterCount,
          passedBy: validationResult.passedBy
        }
      };
    }

    // Multiple pages in live mode - validate each with dual validation
    const validationResults = pages.map((page, index) => ({
      index,
      result: validateLivePageLength(page, config.level)
    }));
    
    const invalidPages = validationResults.filter(v => !v.result.isValid);
    
    if (invalidPages.length > 0) {
      const reasons = invalidPages.map(v => 
        `Page ${v.index + 1}: ${v.result.reason}`
      );

      return {
        decision: 'REPAIR',
        isValid: false,
        reasons: [...baseReasons, ...reasons],
        metrics,
        hints: ['Adjust page content length', 'Redistribute content across pages']
      };
    }

    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: [...baseReasons, 'Live multi-page validation passed'],
      metrics
    };
  }

  // Auto-split content now delegates to shared utilities
  // Removed duplicate implementation

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
   * Map difficulty level to validation level - delegates to shared utilities
   */
  static mapDifficultyToLevel(difficulty: DifficultyLevel | ExpertGradeLevel): ValidationLevel {
    return mapDifficultyToLevel(difficulty);
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
   * Get recommended token limits for level - delegates to shared utilities
   */
  static getTokenLimits(level: ValidationLevel) {
    return getTokenLimitsForLevel(level);
  }
}