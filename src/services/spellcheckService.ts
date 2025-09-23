import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

interface SpellcheckResult {
  correctedText: string;
  hadErrors: boolean;
  confidence: number;
  success?: boolean;
}

interface CacheEntry {
  result: SpellcheckResult;
  timestamp: number;
}

class SpellcheckService {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<SpellcheckResult>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_LENGTH = 2;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_MS = 300; // Minimum time between requests

  /**
   * Check spelling for a given text with caching and rate limiting
   */
  async checkSpelling(
    text: string, 
    gradeLevel: string, 
    context: string = 'user_form_input'
  ): Promise<SpellcheckResult> {
    // Skip very short text
    if (!text || text.trim().length < this.MIN_LENGTH) {
      return {
        correctedText: text,
        hadErrors: false,
        confidence: 1.0,
        success: true
      };
    }

    const normalizedText = text.trim().toLowerCase();
    const cacheKey = `${normalizedText}:${gradeLevel}:${context}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.RATE_LIMIT_MS) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_MS));
    }

    // Create and cache the request promise
    const requestPromise = this.performSpellcheck(text, gradeLevel, context);
    this.pendingRequests.set(cacheKey, requestPromise);
    this.lastRequestTime = Date.now();

    try {
      const result = await requestPromise;
      
      // Cache successful results
      if (result.success) {
        this.cache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      DebugLogger.warn('story', 'Spellcheck failed:', error);
      return {
        correctedText: text,
        hadErrors: false,
        confidence: 0.1,
        success: false
      };
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async performSpellcheck(
    text: string, 
    gradeLevel: string, 
    context: string
  ): Promise<SpellcheckResult> {
    const { data, error } = await supabase.functions.invoke('correct-spelling', {
      body: {
        text: text.trim(),
        gradeLevel,
        context
      }
    });

    if (error) {
      throw new Error(`Spellcheck API error: ${error.message}`);
    }

    return {
      correctedText: data.correctedText || text,
      hadErrors: data.hadErrors || false,
      confidence: data.confidence || 0.5,
      success: data.success || false
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if text might need spellchecking (heuristic to avoid unnecessary calls)
   */
  shouldCheck(text: string): boolean {
    if (!text || text.trim().length < this.MIN_LENGTH) {
      return false;
    }

    // Skip common names and simple words that are likely correct
    const trimmed = text.trim();
    const commonNames = ['alex', 'sam', 'chris', 'taylor', 'jordan', 'casey'];
    const commonWords = ['cat', 'dog', 'red', 'blue', 'green', 'big', 'small'];
    
    if (commonNames.includes(trimmed.toLowerCase()) || 
        commonWords.includes(trimmed.toLowerCase())) {
      return false;
    }

    // Check if it contains obvious typos (multiple repeated characters, etc.)
    const hasRepeatedChars = /(.)\1{2,}/.test(trimmed);
    const hasNumbers = /\d/.test(trimmed);
    
    return !hasNumbers || hasRepeatedChars;
  }
}

export const spellcheckService = new SpellcheckService();