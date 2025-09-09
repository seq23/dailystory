// Unified Validation System - Backend Version
// Moved from frontend for server-side processing efficiency
// Integrates content filtering, token validation, and auto-pagination

import { 
  estimateTokenCount, 
  mapDifficultyToLevel, 
  enhancedAutoSplitContent as sharedAutoSplitContent,
  validateGuestStoryLength,
  validateLivePageLength,
  getExpectedPagesForService,
  type ValidationLevel 
} from './validation-utils.js';

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
  repairedContent?: string[];
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
    expectedPages?: number;
    actualTokens?: number;
    expectedTokens?: number;
    // NEW WORD COUNT METRICS
    characterCount?: number;
    wordCount?: number;
    wordCountValidation?: {
      minWords: number;
      maxWords: number;
      actualWords: number;
      isValid: boolean;
      reason?: string;
    };
  };
  hints?: string[];
  suggestedTokens?: number;
  actualTokenBudget?: number;
  retryHint?: string;
}

export interface ValidationConfig {
  mode: 'guest' | 'live';
  level: ValidationLevel;
  userLanguage?: string;
  vocabularyIntegration?: any;
  actualTokenBudget?: number;
  retryAttempt?: number;
  isEndingPage?: boolean; // NEW: For Live Generation ending page bypass
}

export class UnifiedValidator {
  private static _contentValidationCache = new Map<string, { appropriate: boolean; reason?: string }>();

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
      // Basic content filtering for backend - simplified version
      contentValidation = this.isContentAppropriateForLevel(
        totalContent, 
        config.level,
        isEnglishOnly ? 'en' : config.userLanguage
      );
      
      // Cache the result
      this._contentValidationCache.set(contentHash, contentValidation);
      
      // Limit cache size
      if (this._contentValidationCache.size > 500) {
        const firstKey = this._contentValidationCache.keys().next().value;
        this._contentValidationCache.delete(firstKey);
      }
    }

    const metrics = {
      tokenCount,
      pageCount,
      contentAppropriate: contentValidation.appropriate,
      vocabularyCompliance: this.calculateVocabularyCompliance(totalContent, config.vocabularyIntegration),
      qualityScore: 1.0,
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

    // Mode-specific validation
    if (config.mode === 'guest') {
      return this.validateGuestStory(pages, config, metrics, []);
    } else {
      return this.validateLivePage(pages, config, metrics, []);
    }
  }

  /**
   * Guest mode validation (6-page stories)
   */
  private static validateGuestStory(
    pages: string[],
    config: ValidationConfig,
    metrics: any,
    baseReasons: string[] = []
  ): ValidationResult {
    const fullContent = pages.join(' ');
    
    // Business-logic-aware page count validation
    const pageCount = pages.length;
    const expectedPages = getExpectedPagesForService('netflix', config.level) || 12;
    
    if (pageCount < 6) {
      const expectedTokens = 6 * 250; // 6 pages × 250 tokens per page = 1500 minimum
      const actualTokens = config.actualTokenBudget || 0;
      const isRetry = (config.retryAttempt || 0) > 0;
      
      console.log(`🔍 Token Adequacy Check: pageCount=${pageCount}, expectedTokens=${expectedTokens}, actualTokens=${actualTokens}, isRetry=${isRetry}`);
      
      // DECISION 1: Insufficient token budget detected
      if (actualTokens < expectedTokens) {
        console.log(`💡 Insufficient token budget: ${actualTokens} < ${expectedTokens}. Suggesting token increase.`);
        return {
          decision: 'RETRY_WITH_HINT',
          isValid: false,
          reasons: [...baseReasons, `Story has ${pageCount} pages but was only given ${actualTokens} tokens (needs ${expectedTokens}+ for 6 pages)`],
          metrics: { ...metrics, pageCount, expectedPages, actualTokens, expectedTokens },
          hints: [
            `INCREASE TOKEN BUDGET to ${Math.ceil(expectedTokens * 1.33)} tokens (33% buffer)`,
            `Generate around 12 pages, no less than 6 pages`,
            'Create more story content with additional scenes and development',
            'Add substantial character interactions, detailed setting descriptions, and extended plot progression'
          ],
          suggestedTokens: Math.ceil(expectedTokens * 1.33),
          actualTokenBudget: actualTokens
        };
      }
      
      // DECISION 2: Adequate tokens but still insufficient pages
      if (!isRetry) {
        // First retry: Give standard % more tokens + strong hint
        const boostedTokens = Math.ceil(actualTokens * 1.25); // 25% increase
        console.log(`🔄 First retry with boosted tokens: ${actualTokens} → ${boostedTokens}`);
        return {
          decision: 'RETRY_WITH_HINT', 
          isValid: false,
          reasons: [...baseReasons, `Story has ${pageCount} pages but needs at least 6 pages (adequate tokens: ${actualTokens})`],
          metrics: { ...metrics, pageCount, expectedPages, actualTokens },
           hints: [
             `CRITICAL: You MUST generate around 12 pages, no less than 6 pages`,
             'Add substantial character interactions, detailed setting descriptions, and extended plot progression',
             'Each page should have meaningful story content, not just brief summaries',
             'Create a complete story with proper pacing and development'
           ],
          suggestedTokens: boostedTokens,
          actualTokenBudget: actualTokens
        };
      } else {
        // Second attempt failed: Use auto-splitting as backup
        console.log(`🔧 Validation: After retry, still ${pageCount} pages. Using auto-splitting as backup.`);
        
        const autoSplitResult = sharedAutoSplitContent(fullContent, config.level, 6);
        if (autoSplitResult && Array.isArray(autoSplitResult) && autoSplitResult.length >= 6) {
          console.log(`✅ Auto-split successful: ${pageCount} → ${autoSplitResult.length} pages`);
          return {
            decision: 'REPAIR',
            isValid: true, 
            reasons: [...baseReasons, `Auto-split ${pageCount} pages into ${autoSplitResult.length} pages`],
            metrics: { ...metrics, pageCount: autoSplitResult.length, expectedPages },
            repairedContent: autoSplitResult,
            actualTokenBudget: actualTokens
          };
        } else {
          // Auto-splitting failed - last resort  
          console.error(`❌ Auto-split failed for ${pageCount} pages`);
          return {
            decision: 'REJECT',
            isValid: false,
            reasons: [...baseReasons, `Unable to generate or split content into 6+ pages after retry`],
            metrics: { ...metrics, pageCount, expectedPages },
            actualTokenBudget: actualTokens
          };
        }
      }
    }
    
    // TOKEN VALIDATION DISABLED - Using character-only validation
    const validationResult = validateGuestStoryLength(fullContent, config.level);
    
    if (!validationResult.isValid) {
      const reason = validationResult.reason || 'Content validation failed';
      
      // TOKEN VALIDATION BYPASSED - Only check character-based requirements
      const needsCompleteRegeneration = reason.includes('too short') || 
                                      reason.includes('insufficient content');
      
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
             `Generate around 12 pages, no less than 6 pages`,
             `Generate content with at least ${validationResult.maxAllowedChars * 0.7} characters`,
             'Include more descriptive details and story development'
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
          }
        };
      }
    }

    // TOKEN VALIDATION BYPASSED - Check character limits for auto-split
    if (validationResult.characterCount > validationResult.maxAllowedChars) {
      const targetPages = getExpectedPagesForService('netflix', config.level) || 12;
      const splitPages = sharedAutoSplitContent(fullContent, config.level, targetPages);
      
      return {
        decision: 'REPAIR_AND_SPLIT',
        isValid: true,
        content: splitPages,
        reasons: [...baseReasons, `Content auto-split to ${splitPages.length} pages`],
        metrics: {
          ...metrics,
          pageCount: splitPages.length,
          tokenCount: validationResult.tokenCount
        }
      };
    }

    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: [...baseReasons, 'Guest story validation passed'],
      metrics: {
        ...metrics,
        tokenCount: validationResult.tokenCount
      }
    };
  }

  /**
   * Live mode validation (page-by-page) - PREMIUM USER PROTECTION
   */
  private static validateLivePage(
    pages: string[],
    config: ValidationConfig,
    metrics: any,
    baseReasons: string[] = []
  ): ValidationResult {
    if (pages.length === 1) {
      const validationResult = validateLivePageLength(pages[0], config.level, config.isEndingPage || false);
      
      if (!validationResult.isValid) {
        const reason = validationResult.reason || 'Page validation failed';
        
        // NEW WORD COUNT VALIDATION - Check word count validation from the result
        if (validationResult.wordCountValidation && !validationResult.wordCountValidation.isValid) {
          console.log(`📝 [WORD-COUNT] Live page word count validation failed: ${validationResult.wordCountValidation.reason}`);
          
          // For word count failures, retry with hint (no repair/splitting in Live mode)
          return {
            decision: 'RETRY_WITH_HINT',
            isValid: false,
            reasons: [validationResult.wordCountValidation.reason || 'Word count validation failed'],
            metrics: {
              ...metrics,
              characterCount: validationResult.characterCount,
              wordCount: validationResult.wordCount,
              wordCountValidation: validationResult.wordCountValidation
            },
            retryHint: `Please write exactly ${validationResult.wordCountValidation.minWords}-${validationResult.wordCountValidation.maxWords} words for this ${config.level} level page.`
          };
        }
        
        // For "too short" content, retry with hint
        const needsCompleteRegeneration = reason.includes('too short') || 
                                        (validationResult.tokenCount < validationResult.maxAllowedTokens * 0.5);
        
        if (needsCompleteRegeneration) {
          return {
            decision: 'RETRY_WITH_HINT',
            isValid: false,
            reasons: [...baseReasons, reason],
            metrics: {
              ...metrics,
              tokenCount: validationResult.tokenCount
            },
            hints: [
              `Generate a page with at least ${validationResult.maxAllowedChars * 0.6} characters`,
              'Create more detailed scene descriptions'
            ]
          };
        }
        
        // For "too long" content - check if severely too long (2x+ limit)
        if (reason.includes('too long')) {
          if (validationResult.isSeverelyTooLong) {
            // Severely too long (2x+ limit) - Retry with character reduction hint
            console.log(`🚨 LIVE SERVICE: Content severely too long (${validationResult.characterCount} chars), requesting retry with hint`);
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
                `Reduce content to approximately ${validationResult.maxAllowedChars} characters for better readability`,
                'Focus on the key story elements and reduce descriptive details',
                'Keep only the most essential dialogue and action'
              ]
            };
          } else {
            // Moderately too long - ACCEPT for premium users (no content loss)
            console.log(`✅ LIVE SERVICE: Content moderately too long but ACCEPTED for premium user (${validationResult.characterCount} chars)`);
            return {
              decision: 'ACCEPT',
              isValid: true,
              content: pages,
              reasons: [...baseReasons, 'Live page accepted despite moderate length (premium user protection)'],
              metrics: {
                ...metrics,
                tokenCount: validationResult.tokenCount,
                characterCount: validationResult.characterCount
              }
            };
          }
        }
        
        // Other validation failures - fallback to ACCEPT (premium user protection)
        console.log(`✅ LIVE SERVICE: Unknown validation issue but ACCEPTED for premium user protection`);
        return {
          decision: 'ACCEPT',
          isValid: true,
          content: pages,
          reasons: [...baseReasons, 'Live page accepted (premium user protection)'],
          metrics: {
            ...metrics,
            tokenCount: validationResult.tokenCount
          }
        };
      }

      return {
        decision: 'ACCEPT',
        isValid: true,
        content: pages,
        reasons: [...baseReasons, 'Live page validation passed'],
        metrics: {
          ...metrics,
          characterCount: validationResult.characterCount,
          wordCount: validationResult.wordCount,
          wordCountValidation: validationResult.wordCountValidation
        }
      };
    }

    // Multiple pages validation
    return {
      decision: 'ACCEPT',
      isValid: true,
      content: pages,
      reasons: [...baseReasons, 'Live multi-page validation passed'],
      metrics
    };
  }

  /**
   * Basic content appropriateness check for backend
   */
  private static isContentAppropriateForLevel(
    content: string, 
    level: ValidationLevel,
    language: string = 'en'
  ): { appropriate: boolean; reason?: string } {
    // Basic inappropriate content detection
    const inappropriateWords = [
      'violence', 'death', 'kill', 'murder', 'blood', 'weapon', 'gun', 'knife',
      'scary', 'horror', 'nightmare', 'monster', 'ghost', 'demon'
    ];
    
    const lowerContent = content.toLowerCase();
    const foundInappropriate = inappropriateWords.filter(word => lowerContent.includes(word));
    
    if (foundInappropriate.length > 0) {
      return {
        appropriate: false,
        reason: `Contains inappropriate content: ${foundInappropriate.join(', ')}`
      };
    }
    
    return { appropriate: true };
  }

  /**
   * Calculate educational standards compliance percentage
   * Modern approach using complexity analysis rather than static word matching
   */
  private static calculateVocabularyCompliance(content: string, vocabularyIntegration?: any): number {
    if (!vocabularyIntegration) {
      return 1.0; // Default to 100% if no vocabulary requirements
    }
    
    // Modern educational compliance using complexity analysis
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    if (words.length === 0) return 1.0;
    
    // Calculate educational appropriateness based on word complexity
    const simpleWords = words.filter(word => word.length <= 4).length;
    const mediumWords = words.filter(word => word.length >= 5 && word.length <= 7).length;
    const complexWords = words.filter(word => word.length >= 8).length;
    
    const gradeLevel = vocabularyIntegration.systemVocabulary?.level || 1;
    
    // Grade-appropriate complexity scoring
    let score = 0.85; // Base score for educational appropriateness
    
    if (gradeLevel <= 1) {
      // Pre-K to 1st grade: favor simple words
      score = Math.min(1.0, 0.7 + (simpleWords / words.length) * 0.3);
    } else if (gradeLevel <= 2) {
      // 2nd-3rd grade: balanced simple/medium
      score = Math.min(1.0, 0.6 + ((simpleWords + mediumWords) / words.length) * 0.4);
    } else {
      // 4th+ grade: allow complexity
      score = Math.min(1.0, 0.8 + (mediumWords + complexWords) / words.length * 0.2);
    }
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Map difficulty level to validation level
   */
  static mapDifficultyToLevel(difficulty: any): ValidationLevel {
    return mapDifficultyToLevel(difficulty);
  }

  /**
   * Detect story language for performance optimization
   */
  private static detectStoryLanguage(content: string): string {
    // Simple language detection - check for common English words
    const englishWords = ['the', 'and', 'to', 'a', 'of', 'in', 'is', 'it', 'you', 'that'];
    const words = content.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    // If more than 20% of words are common English words, assume it's English
    return (englishWordCount / words.length) > 0.2 ? 'en' : 'unknown';
  }
}