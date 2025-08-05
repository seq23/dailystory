// Template Performance Cache - Phase 4 Implementation
// High-performance caching for template operations

import { DifficultyLevel } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  expiredEntries: number;
  memoryUsage: number;
}

export class TemplatePerformanceCache {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly MAX_SIZE = 500;
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
  private static readonly MOBILE_TTL = 10 * 60 * 1000; // 10 minutes for mobile
  private static hits = 0;
  private static misses = 0;

  /**
   * Get cached data with performance tracking
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;
    
    return entry.data as T;
  }

  /**
   * Set cached data with automatic eviction
   */
  static set<T>(key: string, data: T, ttl?: number): void {
    const isMobile = this.detectMobileDevice();
    const actualTtl = ttl ?? (isMobile ? this.MOBILE_TTL : this.DEFAULT_TTL);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + actualTtl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Evict if necessary
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(key, entry);
  }

  /**
   * Intelligent cache eviction based on usage patterns
   */
  private static evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score based on access count and recency (lower is worse)
      const recencyScore = Date.now() - entry.lastAccessed;
      const accessScore = 1 / (entry.accessCount + 1);
      const totalScore = recencyScore * accessScore;

      if (totalScore < leastUsedScore) {
        leastUsedScore = totalScore;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Pre-warm cache with frequently used templates
   */
  static async preWarmTemplates(difficulty: DifficultyLevel = 'beginner'): Promise<void> {
    // Pre-load the first 20 most commonly used templates
    const commonTemplateIndexes = Array.from({ length: 20 }, (_, i) => i);
    
    for (const index of commonTemplateIndexes) {
      const key = `template_${difficulty}_${index}`;
      
      // Only pre-warm if not already cached
      if (!this.cache.has(key)) {
        // Simulate template loading (in real implementation, this would fetch the actual template)
        const mockTemplate = this.generateMockTemplate(difficulty, index);
        this.set(key, mockTemplate);
      }
    }
  }

  /**
   * Generate mock template for pre-warming (placeholder)
   */
  private static generateMockTemplate(difficulty: DifficultyLevel, index: number): string[] {
    // This is a placeholder - in real implementation, this would fetch actual templates
    return [`Template ${difficulty} ${index} page 1`, `Template ${difficulty} ${index} page 2`];
  }

  /**
   * Mobile device detection for optimized caching
   */
  private static detectMobileDevice(): boolean {
    // Simple mobile detection
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  }

  /**
   * Clean expired entries manually
   */
  static cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get comprehensive cache statistics
   */
  static getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const expiredEntries = this.countExpiredEntries();
    
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
      totalHits: this.hits,
      totalMisses: this.misses,
      expiredEntries,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Count expired entries without removing them
   */
  private static countExpiredEntries(): number {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      }
    }

    return expired;
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private static estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key size + data size + metadata
      totalSize += key.length * 2; // Chars to bytes (rough)
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 64; // Metadata overhead estimate
    }

    return totalSize;
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache keys for debugging
   */
  static getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Force evict specific key
   */
  static evict(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists in cache
   */
  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}