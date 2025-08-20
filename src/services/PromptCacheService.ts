// Prompt Cache Service - Implements Phase 4: Prompt Caching & Progressive Enhancement
// Provides caching and progressive enhancement for repeated generations

export interface CachedPrompt {
  prompt: string;
  sessionId: string;
  pageNumber: number;
  userInfo: any;
  characterSeed: number;
  generationSuccess: boolean;
  createdAt: number;
  lastUsed: number;
  useCount: number;
  successRate: number;
}

export interface PromptEnhancement {
  elementType: 'character' | 'scene' | 'style' | 'quality';
  originalElement: string;
  enhancedElement: string;
  improvementScore: number; // 1-10
  successfulGenerations: number;
}

export class PromptCacheService {
  private static cache = new Map<string, CachedPrompt>();
  private static enhancements = new Map<string, PromptEnhancement>();
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MAX_CACHE_SIZE = 1000;

  /**
   * Generate cache key for prompt lookup
   */
  private static generateCacheKey(
    sessionId: string,
    pageNumber: number,
    characterSeed: number,
    textHash: string
  ): string {
    return `${sessionId}:${pageNumber}:${characterSeed}:${textHash.substring(0, 8)}`;
  }

  /**
   * Hash story text for cache key generation
   */
  private static hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Check if prompt exists in cache and return enhanced version
   */
  static getCachedPrompt(
    sessionId: string,
    pageNumber: number,
    characterSeed: number,
    storyText: string
  ): { cached: boolean; prompt?: string; enhancements?: string[] } {
    const textHash = this.hashText(storyText);
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, characterSeed, textHash);
    
    const cached = this.cache.get(cacheKey);
    
    if (!cached || this.isCacheExpired(cached)) {
      return { cached: false };
    }

    // Update usage statistics
    cached.lastUsed = Date.now();
    cached.useCount++;
    this.cache.set(cacheKey, cached);

    // Apply progressive enhancements if available
    const enhancedPrompt = this.applyProgressiveEnhancements(cached.prompt);
    const appliedEnhancements = this.getAppliedEnhancements(cached.prompt);

    console.log(`📦 Cache hit for session ${sessionId}, page ${pageNumber}`);

    return {
      cached: true,
      prompt: enhancedPrompt,
      enhancements: appliedEnhancements
    };
  }

  /**
   * Store prompt in cache with generation metadata
   */
  static cachePrompt(
    sessionId: string,
    pageNumber: number,
    characterSeed: number,
    storyText: string,
    prompt: string,
    userInfo: any,
    generationSuccess: boolean = true
  ): void {
    const textHash = this.hashText(storyText);
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, characterSeed, textHash);
    
    const existingCache = this.cache.get(cacheKey);
    const now = Date.now();

    const cachedPrompt: CachedPrompt = {
      prompt,
      sessionId,
      pageNumber,
      userInfo,
      characterSeed,
      generationSuccess,
      createdAt: existingCache?.createdAt || now,
      lastUsed: now,
      useCount: (existingCache?.useCount || 0) + 1,
      successRate: this.calculateSuccessRate(existingCache, generationSuccess)
    };

    this.cache.set(cacheKey, cachedPrompt);

    // Learn from successful generations
    if (generationSuccess) {
      this.learnFromSuccessfulGeneration(prompt, userInfo);
    }

    // Cleanup if cache is too large
    this.cleanupCache();

    console.log(`💾 Cached prompt for session ${sessionId}, page ${pageNumber}, success: ${generationSuccess}`);
  }

  /**
   * Apply progressive enhancements based on learned patterns
   */
  private static applyProgressiveEnhancements(prompt: string): string {
    let enhancedPrompt = prompt;
    
    for (const [key, enhancement] of this.enhancements) {
      if (enhancement.successfulGenerations >= 3 && enhancement.improvementScore >= 7) {
        enhancedPrompt = enhancedPrompt.replace(
          enhancement.originalElement,
          enhancement.enhancedElement
        );
      }
    }

    return enhancedPrompt;
  }

  /**
   * Learn patterns from successful generations
   */
  private static learnFromSuccessfulGeneration(prompt: string, userInfo: any): void {
    const elements = prompt.split(',').map(e => e.trim());
    
    for (const element of elements) {
      const enhancementKey = this.generateEnhancementKey(element, userInfo);
      const existing = this.enhancements.get(enhancementKey);
      
      if (existing) {
        existing.successfulGenerations++;
        existing.improvementScore = Math.min(10, existing.improvementScore + 0.1);
      } else {
        // Create new enhancement pattern
        const enhancement: PromptEnhancement = {
          elementType: this.classifyElementType(element),
          originalElement: element,
          enhancedElement: this.enhanceElement(element),
          improvementScore: 5, // Start neutral
          successfulGenerations: 1
        };
        
        this.enhancements.set(enhancementKey, enhancement);
      }
    }

    console.log(`🧠 Learned from successful generation, total patterns: ${this.enhancements.size}`);
  }

  /**
   * Classify element type for enhancement
   */
  private static classifyElementType(element: string): 'character' | 'scene' | 'style' | 'quality' {
    const lowerElement = element.toLowerCase();
    
    if (lowerElement.includes('child') || lowerElement.includes('hair') || lowerElement.includes('skin')) {
      return 'character';
    }
    if (lowerElement.includes('standing') || lowerElement.includes('playing') || lowerElement.includes('smiling')) {
      return 'scene';
    }
    if (lowerElement.includes('illustration') || lowerElement.includes('artwork') || lowerElement.includes('style')) {
      return 'style';
    }
    
    return 'quality';
  }

  /**
   * Enhance element based on successful patterns
   */
  private static enhanceElement(element: string): string {
    // Simple enhancement rules - can be expanded
    const enhancements: Record<string, string> = {
      'high quality': 'ultra high quality, professional grade',
      'detailed': 'intricately detailed, finely crafted',
      'illustration': 'masterful children\'s book illustration',
      'vibrant': 'brilliantly vibrant, eye-catching'
    };

    for (const [original, enhanced] of Object.entries(enhancements)) {
      if (element.toLowerCase().includes(original)) {
        return element.replace(new RegExp(original, 'i'), enhanced);
      }
    }

    return element;
  }

  /**
   * Generate enhancement key for learning
   */
  private static generateEnhancementKey(element: string, userInfo: any): string {
    const language = userInfo.nativeLanguage || 'en';
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    return `${language}:${skinTone}:${element.substring(0, 20)}`;
  }

  /**
   * Get list of enhancements applied to prompt
   */
  private static getAppliedEnhancements(prompt: string): string[] {
    const applied: string[] = [];
    
    for (const [key, enhancement] of this.enhancements) {
      if (prompt.includes(enhancement.enhancedElement)) {
        applied.push(`${enhancement.elementType}: ${enhancement.originalElement} → ${enhancement.enhancedElement}`);
      }
    }

    return applied;
  }

  /**
   * Calculate success rate for cached prompts
   */
  private static calculateSuccessRate(existing: CachedPrompt | undefined, newSuccess: boolean): number {
    if (!existing) {
      return newSuccess ? 1.0 : 0.0;
    }

    const totalAttempts = existing.useCount;
    const successfulAttempts = existing.successRate * (totalAttempts - 1) + (newSuccess ? 1 : 0);
    
    return successfulAttempts / totalAttempts;
  }

  /**
   * Check if cache entry is expired
   */
  private static isCacheExpired(cached: CachedPrompt): boolean {
    return Date.now() - cached.createdAt > this.CACHE_EXPIRY;
  }

  /**
   * Clean up expired and low-performing cache entries
   */
  private static cleanupCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) {
      return;
    }

    const entries = Array.from(this.cache.entries());
    
    // Sort by success rate and last used time (lower priority = removed first)
    entries.sort(([, a], [, b]) => {
      const aPriority = a.successRate * 100 + (Date.now() - a.lastUsed) / 1000;
      const bPriority = b.successRate * 100 + (Date.now() - b.lastUsed) / 1000;
      return aPriority - bPriority;
    });

    // Remove lowest priority entries
    const toRemove = Math.floor(this.cache.size * 0.2); // Remove 20%
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`🧹 Cleaned up cache, removed ${toRemove} entries, size: ${this.cache.size}`);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRate: number;
    enhancementPatterns: number;
    averageSuccessRate: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.useCount, 0);
    const totalEntries = entries.length;
    const averageSuccessRate = entries.reduce((sum, entry) => sum + entry.successRate, 0) / totalEntries;

    return {
      size: this.cache.size,
      hitRate: totalEntries > 0 ? totalHits / totalEntries : 0,
      enhancementPatterns: this.enhancements.size,
      averageSuccessRate: averageSuccessRate || 0
    };
  }

  /**
   * Clear cache for specific session
   */
  static clearSessionCache(sessionId: string): number {
    let cleared = 0;
    
    for (const [key, cached] of this.cache) {
      if (cached.sessionId === sessionId) {
        this.cache.delete(key);
        cleared++;
      }
    }

    console.log(`🗑️ Cleared ${cleared} cache entries for session ${sessionId}`);
    return cleared;
  }

  /**
   * Export cache data for analysis
   */
  static exportCacheData(): {
    prompts: CachedPrompt[];
    enhancements: PromptEnhancement[];
  } {
    return {
      prompts: Array.from(this.cache.values()),
      enhancements: Array.from(this.enhancements.values())
    };
  }
}