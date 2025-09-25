import { DebugLogger } from '@/services/DebugLogger';

export interface UnifiedTokenization {
  /** All tokens including whitespace */
  tokens: string[];
  /** Whether each token is whitespace */
  isWhitespace: boolean[];
  /** Word-only tokens (no whitespace) */
  wordsOnly: string[];
  /** Maps token index to word-only index (-1 for whitespace tokens) */
  wordOnlyIndexByTokenIndex: number[];
}

/**
 * Unified tokenization service to ensure consistent word splitting 
 * across audio highlighting and UI rendering systems
 */
export class UnifiedTokenizationService {
  private static tokenizationCache = new Map<string, UnifiedTokenization>();
  private static cacheExpiry = 300000; // 5 minutes
  
  /**
   * Clean text by removing page markers and normalizing whitespace
   */
  static cleanText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/^Page\s*\d+\s*:\s*/i, '')
      .replace(/^Page\s*\d+\s*/i, '')
      .replace(/\*{2,}/g, '') // Remove 2+ consecutive asterisks
      .trim();
  }
  
  /**
   * Get unified tokenization with caching
   */
  static getTokenization(text: string): UnifiedTokenization {
    const cleanedText = this.cleanText(text);
    const cacheKey = `tokenize-${cleanedText}`;
    
    // Check cache first
    const cached = this.tokenizationCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Split preserving whitespace
    const tokens = cleanedText.split(/(\s+)/);
    const isWhitespace = tokens.map(t => /^\s+$/.test(t));
    const wordOnlyIndexByTokenIndex: number[] = new Array(tokens.length);
    const wordsOnly: string[] = [];
    let currentWordIndex = 0;

    for (let i = 0; i < tokens.length; i++) {
      if (isWhitespace[i] || tokens[i].trim().length === 0) {
        wordOnlyIndexByTokenIndex[i] = -1;
      } else {
        wordOnlyIndexByTokenIndex[i] = currentWordIndex;
        wordsOnly.push(tokens[i]);
        currentWordIndex++;
      }
    }

    const result: UnifiedTokenization = {
      tokens,
      isWhitespace,
      wordsOnly,
      wordOnlyIndexByTokenIndex
    };
    
    // Cache with expiry cleanup
    this.tokenizationCache.set(cacheKey, result);
    
    // Cleanup expired cache entries (simple cleanup)
    if (this.tokenizationCache.size > 100) {
      this.tokenizationCache.clear();
    }
    
    DebugLogger.log('ui', `Unified tokenization: "${cleanedText.slice(0, 30)}..." → ${tokens.length} tokens, ${wordsOnly.length} words`);
    
    return result;
  }
  
  /**
   * Get words-only array (for audio systems)
   */
  static getWords(text: string): string[] {
    return this.getTokenization(text).wordsOnly;
  }
  
  /**
   * Get tokens with layout info (for UI rendering)
   */
  static getTokensWithLayout(text: string): {
    tokens: string[];
    isWhitespace: boolean[];
    wordOnlyIndexByTokenIndex: number[];
  } {
    const { tokens, isWhitespace, wordOnlyIndexByTokenIndex } = this.getTokenization(text);
    return { tokens, isWhitespace, wordOnlyIndexByTokenIndex };
  }
  
  /**
   * Debug: Compare tokenization methods
   */
  static debugCompareTokenizations(text: string): void {
    const unified = this.getTokenization(text);
    const oldAudioMethod = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    
    DebugLogger.log('ui', 'Tokenization Comparison', {
      text: text.slice(0, 50) + '...',
      unifiedWords: unified.wordsOnly,
      oldAudioWords: oldAudioMethod,
      wordsMatch: JSON.stringify(unified.wordsOnly) === JSON.stringify(oldAudioMethod),
      unifiedCount: unified.wordsOnly.length,
      oldCount: oldAudioMethod.length
    });
  }
}