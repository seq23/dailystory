interface ImageCacheEntry {
  prompt: string;
  imageUrl: string;
  timestamp: number;
  sessionId: string;
  hash: string;
}

export class ImageDeduplicationService {
  private static cache = new Map<string, ImageCacheEntry>();
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly CACHE_DURATION = 3600000; // 1 hour
  
  static generatePromptHash(prompt: string): string {
    // Simple hash function for prompt similarity
    const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  static checkForDuplicate(prompt: string, sessionId: string): string | null {
    const hash = this.generatePromptHash(prompt);
    const cacheKey = `${sessionId}_${hash}`;
    
    const entry = this.cache.get(cacheKey);
    if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
      return entry.imageUrl;
    }
    
    return null;
  }
  
  static cacheImage(prompt: string, imageUrl: string, sessionId: string): void {
    const hash = this.generatePromptHash(prompt);
    const cacheKey = `${sessionId}_${hash}`;
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      prompt,
      imageUrl,
      timestamp: Date.now(),
      sessionId,
      hash
    });
  }
  
  static clearSessionCache(sessionId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.sessionId === sessionId) {
        this.cache.delete(key);
      }
    }
  }
  
  static clearExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}