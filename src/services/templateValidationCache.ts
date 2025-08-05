/**
 * Template Validation Cache
 * Caches validation results to improve performance
 */

import type { DifficultyLevel } from '@/types';

interface ValidationResult {
  isValid: boolean;
  invalidWords: string[];
  error?: string;
  timestamp: number;
  difficulty: DifficultyLevel;
  templateIndex: number;
}

interface CacheEntry {
  result: ValidationResult;
  expiry: number;
}

export class TemplateValidationCache {
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_CACHE_SIZE = 500; // Prevent memory overflow

  /**
   * Generate cache key for template validation
   */
  private static getCacheKey(
    difficulty: DifficultyLevel,
    templateIndex: number,
    userName?: string
  ): string {
    return `${difficulty}:${templateIndex}:${userName || 'anonymous'}`;
  }

  /**
   * Get cached validation result
   */
  static getCachedValidation(
    difficulty: DifficultyLevel,
    templateIndex: number,
    userName?: string
  ): ValidationResult | null {
    const key = this.getCacheKey(difficulty, templateIndex, userName);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`🔄 Cache hit for template ${difficulty}:${templateIndex}`);
    return entry.result;
  }

  /**
   * Store validation result in cache
   */
  static setCachedValidation(
    difficulty: DifficultyLevel,
    templateIndex: number,
    result: Omit<ValidationResult, 'timestamp' | 'difficulty' | 'templateIndex'>,
    userName?: string
  ): void {
    // Prevent cache overflow
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.clearExpiredEntries();
      
      // If still at max size, clear oldest entries
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].expiry - b[1].expiry);
        
        // Remove oldest 25% of entries
        const toRemove = Math.floor(entries.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
          this.cache.delete(entries[i][0]);
        }
      }
    }

    const key = this.getCacheKey(difficulty, templateIndex, userName);
    const validationResult: ValidationResult = {
      ...result,
      timestamp: Date.now(),
      difficulty,
      templateIndex
    };

    this.cache.set(key, {
      result: validationResult,
      expiry: Date.now() + this.CACHE_DURATION
    });

    console.log(`💾 Cached validation for template ${difficulty}:${templateIndex}`);
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  static clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cleared entire validation cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      expiredEntries: expiredCount
    };
  }

  /**
   * Pre-warm cache for common difficulty levels
   */
  static async preWarmCache(
    difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium'],
    maxTemplatesPerLevel: number = 20
  ): Promise<void> {
    console.log(`🔥 Pre-warming validation cache for ${difficulties.length} difficulty levels...`);
    
    // This would be called during app initialization
    // The actual validation would happen when templates are first loaded
    for (const difficulty of difficulties) {
      for (let i = 0; i < Math.min(maxTemplatesPerLevel, 100); i++) {
        // Cache key exists, but validation will happen on first access
        const key = this.getCacheKey(difficulty, i);
        // Mark as pre-warmed but don't actually validate yet
      }
    }
  }
}