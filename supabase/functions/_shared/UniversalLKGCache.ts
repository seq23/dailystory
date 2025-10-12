/**
 * UNIVERSAL LKG CACHE - Phase 1: Bulletproof 99.9% Reliability Foundation
 * 
 * Extends Last Known Good (LKG) caching to ALL image generation edge functions
 * with enhanced capacity, intelligent eviction, and quality tracking.
 * 
 * Key Features:
 * - 15-minute validity window (3x previous 5-minute window)
 * - 500-entry capacity (5x previous 100-entry limit)
 * - Quality-based eviction (keeps high-quality, frequently-used entries)
 * - Proactive cache warming from successful generations
 * - Cross-function compatibility
 */

interface UniversalLKGEntry {
  data: any;
  timestamp: number;
  requestHash: string;
  tier: string;
  quality: 'high' | 'medium' | 'low';
  successCount: number;
  functionName: string; // Track which function created this entry
}

export class UniversalLKGCache {
  private static cache = new Map<string, UniversalLKGEntry>();
  private static readonly VALIDITY_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ENTRIES = 500;
  
  /**
   * Create a stable hash from request parameters
   */
  static createRequestHash(payload: any): string {
    const {
      pageText,
      storyText,
      userInfo,
      sessionId,
      pageNumber,
      templateComplexity,
      primaryScene
    } = payload;
    
    // Create stable hash from content (ignore timestamps, request IDs, etc.)
    const hashBase = JSON.stringify({
      pageText: pageText?.substring(0, 200) || '',
      storyText: storyText?.substring(0, 200) || '',
      userName: userInfo?.name || '',
      userAge: userInfo?.age || 0,
      pageNumber: pageNumber || 1,
      template: templateComplexity || '',
      scene: primaryScene?.substring(0, 100) || ''
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashBase.length; i++) {
      const char = hashBase.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `lkg_${Math.abs(hash).toString(36)}`;
  }
  
  /**
   * Intelligent eviction: Keep highest-quality, most-used entries
   */
  static evict(): void {
    if (this.cache.size <= this.MAX_ENTRIES) return;
    
    console.log(`🧹 [UNIVERSAL_LKG] Cache full (${this.cache.size} entries), starting eviction`);
    
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // Sort by: quality desc, successCount desc, timestamp asc
        const qualityScore = { high: 3, medium: 2, low: 1 };
        const aScore = qualityScore[a[1].quality] * 100 + a[1].successCount;
        const bScore = qualityScore[b[1].quality] * 100 + b[1].successCount;
        
        // Higher score = better quality, keep it
        if (bScore !== aScore) return bScore - aScore;
        
        // Same score, evict older entries first
        return a[1].timestamp - b[1].timestamp;
      });
    
    // Remove bottom 20% (100 entries)
    const toRemove = Math.floor(entries.length * 0.2);
    const removed = entries.slice(-toRemove);
    
    removed.forEach(([key, entry]) => {
      console.log(`🗑️ [UNIVERSAL_LKG] Evicting: ${key} (quality: ${entry.quality}, uses: ${entry.successCount}, age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
      this.cache.delete(key);
    });
    
    console.log(`✅ [UNIVERSAL_LKG] Eviction complete: ${this.cache.size} entries remaining`);
  }
  
  /**
   * Retrieve LKG entry if valid
   */
  static getLKG(requestHash: string, functionName: string): any | null {
    const cached = this.cache.get(requestHash);
    if (!cached) {
      return null;
    }
    
    const age = Date.now() - cached.timestamp;
    
    // Check validity window
    if (age > this.VALIDITY_MS) {
      console.log(`⏰ [UNIVERSAL_LKG] Cache expired for ${requestHash} (age: ${Math.round(age/1000)}s > ${Math.round(this.VALIDITY_MS/1000)}s)`);
      this.cache.delete(requestHash);
      return null;
    }
    
    // Track usage
    cached.successCount++;
    
    console.log(`✅ [UNIVERSAL_LKG] Cache HIT for ${functionName}: ${requestHash}`);
    console.log(`   └─ Age: ${Math.round(age/1000)}s, Tier: ${cached.tier}, Quality: ${cached.quality}, Uses: ${cached.successCount}`);
    
    return {
      ...cached.data,
      fromLKG: true,
      lkgAge: age,
      lkgQuality: cached.quality,
      lkgUseCount: cached.successCount
    };
  }
  
  /**
   * Store LKG entry with quality rating
   */
  static setLKG(
    requestHash: string,
    data: any,
    tier: string,
    quality: 'high' | 'medium' | 'low',
    functionName: string
  ): void {
    // Don't cache error responses
    if (data?.error || data?.success === false) {
      console.log(`⚠️ [UNIVERSAL_LKG] Skipping cache for error response: ${requestHash}`);
      return;
    }
    
    this.cache.set(requestHash, {
      data,
      timestamp: Date.now(),
      requestHash,
      tier,
      quality,
      successCount: 1,
      functionName
    });
    
    console.log(`💾 [UNIVERSAL_LKG] Cached for ${functionName}: ${requestHash} (tier: ${tier}, quality: ${quality})`);
    
    // Trigger eviction if needed
    this.evict();
  }
  
  /**
   * Proactive cache warming from successful requests
   * Upgrades quality rating based on repeated successes
   */
  static warmFromSuccess(
    requestHash: string,
    data: any,
    tier: string,
    functionName: string
  ): void {
    const existing = this.cache.get(requestHash);
    
    if (existing) {
      // Upgrade quality if same content succeeds multiple times
      const newQuality: 'high' | 'medium' | 'low' = 
        existing.successCount >= 5 ? 'high' : 
        existing.successCount >= 2 ? 'medium' : 'low';
      
      console.log(`🔥 [UNIVERSAL_LKG] Warming cache (quality upgrade: ${existing.quality} → ${newQuality}): ${requestHash}`);
      
      this.setLKG(requestHash, data, tier, newQuality, functionName);
    } else {
      // First success, store with medium quality
      this.setLKG(requestHash, data, tier, 'medium', functionName);
    }
  }
  
  /**
   * Get cache statistics (for monitoring)
   */
  static getStats(): {
    totalEntries: number;
    byQuality: { high: number; medium: number; low: number };
    byFunction: Record<string, number>;
    averageAge: number;
    averageUseCount: number;
  } {
    const entries = Array.from(this.cache.values());
    
    const stats = {
      totalEntries: entries.length,
      byQuality: {
        high: entries.filter(e => e.quality === 'high').length,
        medium: entries.filter(e => e.quality === 'medium').length,
        low: entries.filter(e => e.quality === 'low').length
      },
      byFunction: {} as Record<string, number>,
      averageAge: 0,
      averageUseCount: 0
    };
    
    // Calculate by-function distribution
    entries.forEach(entry => {
      stats.byFunction[entry.functionName] = (stats.byFunction[entry.functionName] || 0) + 1;
    });
    
    // Calculate averages
    if (entries.length > 0) {
      const now = Date.now();
      stats.averageAge = Math.round(
        entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length / 1000
      );
      stats.averageUseCount = Math.round(
        entries.reduce((sum, e) => sum + e.successCount, 0) / entries.length * 10
      ) / 10;
    }
    
    return stats;
  }
  
  /**
   * Clear all cache entries (for testing/debugging)
   */
  static clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🧹 [UNIVERSAL_LKG] Cleared ${count} cache entries`);
  }
}
