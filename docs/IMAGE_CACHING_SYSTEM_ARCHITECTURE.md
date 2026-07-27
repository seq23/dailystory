> **OUTDATED (superseded July 2026).** The tiered image pipeline described below no longer exists. See [IMAGE_GENERATION.md](./IMAGE_GENERATION.md) for the current system.

# Image Caching System Architecture

## 🗂️ **Complete Image Caching Overview**

<lov-mermaid>
graph TD
    A[Image Generation Request] --> B[EnhancedImageCache Check]
    B --> C{Cache Hit?}
    C -->|Yes| D[Return Cached Image]
    C -->|No| E[Generate New Image]
    
    E --> F[Store in Cache]
    F --> G[Avatar-Aware Key Generation]
    G --> H[SessionStorage with 24h Expiry]
    
    I[User Action Triggers] --> J{Action Type}
    J -->|Next Story Guest| K[clearForStoryTransition]
    J -->|Premium Session End| L[clearForPremiumFinish]
    J -->|Avatar Change| M[clearForAvatarChange]
    J -->|Magic Wand Rewrite| N[clearForPremiumRewrite]
    
    K --> O[Complete Cache Clear + Fresh 6-page Cycle]
    L --> P[Preserve Navigation + Clear Session]
    M --> Q[Clear Avatar-Specific Images]
    N --> R[Clear Story Images + Keep Character Seeds]
    
    style B fill:#e3f2fd
    style G fill:#e8f5e9
    style J fill:#fff3e0
</lov-mermaid>

## **EnhancedImageCache - Core Caching Service**

### **Cache Architecture**
```typescript
// From src/services/EnhancedImageCache.ts (enhanced version inferred from usage)
export class EnhancedImageCache {
  private static readonly STORAGE_KEY = 'enhanced-image-cache';
  private static readonly MAX_CACHE_SIZE = 100; // Total images across all sessions
  private static readonly MAX_PER_SESSION = 20; // Images per session
  private static readonly CACHE_EXPIRY_HOURS = 24;
  
  /**
   * Store image with avatar-aware key generation
   */
  static storeImage(
    sessionId: string,
    pageNumber: number,
    storyText: string,
    imageUrl: string,
    avatarConfig: AvatarConfig
  ): void {
    
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, storyText, avatarConfig);
    
    const cacheEntry: CacheEntry = {
      sessionId,
      pageNumber,
      storyText: storyText.substring(0, 200), // Truncate for storage
      imageUrl,
      avatarConfig: {
        skinTone: avatarConfig.skinTone,
        hairColor: avatarConfig.hairColor,
        hairStyle: avatarConfig.hairStyle,
        eyeColor: avatarConfig.eyeColor
      },
      cacheKey,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000),
      accessCount: 1,
      lastAccessed: Date.now()
    };
    
    this.addToCache(cacheKey, cacheEntry);
    
    console.log(`💾 [CACHE] Stored image: ${cacheKey} (Page ${pageNumber})`);
    console.log(`💾 [CACHE] Avatar context: ${avatarConfig.skinTone}-${avatarConfig.hairColor}-${avatarConfig.hairStyle}`);
  }
  
  /**
   * Retrieve image with cache hit tracking
   */
  static getImage(
    sessionId: string,
    pageNumber: number,
    storyText: string,
    avatarConfig: AvatarConfig
  ): string | null {
    
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, storyText, avatarConfig);
    const cache = this.loadCache();
    const entry = cache[cacheKey];
    
    if (!entry) {
      console.log(`💾 [CACHE] MISS: ${cacheKey}`);
      return null;
    }
    
    // Check expiry
    if (Date.now() > entry.expiresAt) {
      console.log(`💾 [CACHE] EXPIRED: ${cacheKey}`);
      delete cache[cacheKey];
      this.saveCache(cache);
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    cache[cacheKey] = entry;
    this.saveCache(cache);
    
    console.log(`💾 [CACHE] HIT: ${cacheKey} (${entry.accessCount} accesses)`);
    return entry.imageUrl;
  }
  
  /**
   * Avatar-aware cache key generation
   * Ensures avatar changes invalidate appropriate cached images
   */
  private static generateCacheKey(
    sessionId: string,
    pageNumber: number,
    storyText: string,
    avatarConfig: AvatarConfig
  ): string {
    
    // Create deterministic story hash
    const storyHash = this.hashString(storyText.substring(0, 200));
    
    // Avatar signature for cache isolation
    const avatarSignature = `${avatarConfig.skinTone}-${avatarConfig.hairColor}-${avatarConfig.hairStyle}-${avatarConfig.eyeColor}`;
    const avatarHash = this.hashString(avatarSignature);
    
    return `${sessionId}-p${pageNumber}-s${storyHash}-a${avatarHash}`;
  }
  
  /**
   * Story-specific hash for consistent cache keys
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Get all images for a specific session (for navigation)
   */
  static getImagesForSession(sessionId: string): CacheEntry[] {
    const cache = this.loadCache();
    return Object.values(cache)
      .filter(entry => entry.sessionId === sessionId)
      .sort((a, b) => a.pageNumber - b.pageNumber);
  }
  
  /**
   * Cache statistics for monitoring
   */
  static getStats(): CacheStats {
    const cache = this.loadCache();
    const entries = Object.values(cache);
    const now = Date.now();
    
    const activeEntries = entries.filter(entry => now < entry.expiresAt);
    const totalSize = JSON.stringify(cache).length;
    const hitRate = this.calculateHitRate(entries);
    
    return {
      totalImages: activeEntries.length,
      cacheSize: totalSize,
      hitRate,
      oldestEntry: Math.min(...activeEntries.map(e => e.cachedAt)),
      newestEntry: Math.max(...activeEntries.map(e => e.cachedAt)),
      averageAccessCount: activeEntries.reduce((sum, e) => sum + e.accessCount, 0) / activeEntries.length
    };
  }
}
```

## **SessionCacheManager - Unified Cache Clearing**

### **Business Logic Cache Management**
```typescript
// From src/services/SessionCacheManager.ts
export class SessionCacheManager {
  
  /**
   * Guest user "Next Story" flow - Complete cache clear
   * Ensures fresh 6-page story generation cycle
   */
  static clearForStoryTransition(userId: string): void {
    console.log(`🎬 [SESSION-CACHE] Guest "Next Story" - clearing all caches for ${userId}`);
    
    // Clear all cached images for guest session
    const guestSessionPattern = `netflix-${userId}`;
    this.clearSessionPattern(guestSessionPattern);
    
    // Clear story cache to ensure fresh generation
    this.clearStoryCacheForUser(userId);
    
    // Reset Netflix session manager
    NetflixSessionManager.clearSession(userId);
    
    // Clear enhanced image cache
    EnhancedImageCache.clearUserSessions(userId);
    
    console.log(`🎬 [SESSION-CACHE] Guest cache cleared - ready for fresh story cycle`);
  }
  
  /**
   * Premium session end - Preserve navigation until complete session end
   */
  static clearForPremiumFinish(userId: string): void {
    console.log(`👑 [SESSION-CACHE] Premium session end - clearing caches for ${userId}`);
    
    // Clear current premium session
    const premiumSessionPattern = `premium-${userId}`;
    this.clearSessionPattern(premiumSessionPattern);
    
    // Clear story cache but preserve navigation cache briefly
    setTimeout(() => {
      this.clearStoryCacheForUser(userId);
    }, 5000); // 5-second grace period for navigation
    
    // Clear enhanced image cache
    EnhancedImageCache.clearUserSessions(userId);
    
    console.log(`👑 [SESSION-CACHE] Premium cache cleared - navigation preserved briefly`);
  }
  
  /**
   * Avatar change - Clear only avatar-dependent images
   */
  static clearForAvatarChange(
    userId: string, 
    oldAvatarConfig: AvatarConfig, 
    newAvatarConfig: AvatarConfig
  ): void {
    console.log(`🎭 [SESSION-CACHE] Avatar change - selective cache clear for ${userId}`);
    
    // Determine which aspects changed
    const skinChanged = oldAvatarConfig.skinTone !== newAvatarConfig.skinTone;
    const hairChanged = oldAvatarConfig.hairColor !== newAvatarConfig.hairColor || 
                       oldAvatarConfig.hairStyle !== newAvatarConfig.hairStyle;
    const eyeChanged = oldAvatarConfig.eyeColor !== newAvatarConfig.eyeColor;
    
    console.log(`🎭 [SESSION-CACHE] Changes - Skin: ${skinChanged}, Hair: ${hairChanged}, Eyes: ${eyeChanged}`);
    
    if (skinChanged || hairChanged || eyeChanged) {
      // Clear avatar-specific cached images
      EnhancedImageCache.clearAvatarSpecific(userId, oldAvatarConfig);
      
      // Clear character consistency seeds that are now invalid
      this.clearCharacterSeeds(userId);
      
      console.log(`🎭 [SESSION-CACHE] Avatar-specific cache cleared`);
    } else {
      console.log(`🎭 [SESSION-CACHE] No significant avatar changes - cache preserved`);
    }
  }
  
  /**
   * Premium rewrite (magic wand) - Clear story but keep character seeds
   */
  static clearForPremiumRewrite(userId: string, sessionId: string): void {
    console.log(`✨ [SESSION-CACHE] Magic wand rewrite - selective clear for ${userId}`);
    
    // Clear story-specific images but preserve character consistency
    EnhancedImageCache.clearStoryImagesKeepCharacterSeeds(sessionId);
    
    // Clear story cache
    this.clearStoryCacheForSession(sessionId);
    
    // Preserve character seeds for consistency across rewrite
    console.log(`✨ [SESSION-CACHE] Story images cleared - character seeds preserved`);
  }
  
  /**
   * Complete session end - Clear everything
   */
  static clearForSessionEnd(userId: string): void {
    console.log(`🛑 [SESSION-CACHE] Complete session end for ${userId}`);
    
    // Clear all cache types
    this.clearForStoryTransition(userId); // Reuse guest clearing logic
    
    // Additional cleanup for premium features
    this.clearCharacterSeeds(userId);
    this.clearNavigationHistory(userId);
    
    console.log(`🛑 [SESSION-CACHE] Complete session cleared`);
  }
  
  /**
   * Context-aware cache clearing
   */
  static clearByContext(
    context: 'next-story' | 'session-end' | 'avatar-change' | 'magic-wand' | 'complete-clear',
    userId: string,
    additionalData?: any
  ): void {
    
    console.log(`🎯 [SESSION-CACHE] Context-aware clear: ${context} for ${userId}`);
    
    switch (context) {
      case 'next-story':
        this.clearForStoryTransition(userId);
        break;
        
      case 'session-end':
        this.clearForPremiumFinish(userId);
        break;
        
      case 'avatar-change':
        if (additionalData?.oldAvatar && additionalData?.newAvatar) {
          this.clearForAvatarChange(userId, additionalData.oldAvatar, additionalData.newAvatar);
        }
        break;
        
      case 'magic-wand':
        if (additionalData?.sessionId) {
          this.clearForPremiumRewrite(userId, additionalData.sessionId);
        }
        break;
        
      case 'complete-clear':
        this.clearForSessionEnd(userId);
        break;
        
      default:
        console.warn(`🚨 [SESSION-CACHE] Unknown context: ${context}`);
    }
  }
  
  /**
   * Helper methods for specific cache operations
   */
  private static clearSessionPattern(pattern: string): void {
    const cache = EnhancedImageCache.loadCache();
    const keysToDelete = Object.keys(cache).filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => delete cache[key]);
    EnhancedImageCache.saveCache(cache);
    
    console.log(`🧹 [SESSION-CACHE] Cleared ${keysToDelete.length} entries matching pattern: ${pattern}`);
  }
  
  private static clearStoryCacheForUser(userId: string): void {
    // Clear story-specific cache entries
    const storyKeys = [
      `story-${userId}`,
      `pages-${userId}`,
      `netflix-story-${userId}`
    ];
    
    storyKeys.forEach(key => sessionStorage.removeItem(key));
    console.log(`🧹 [SESSION-CACHE] Cleared story cache for user: ${userId}`);
  }
  
  private static clearCharacterSeeds(userId: string): void {
    // Clear character consistency seeds
    const seedKeys = [
      `character-seeds-${userId}`,
      `consistency-seeds-${userId}`
    ];
    
    seedKeys.forEach(key => sessionStorage.removeItem(key));
    console.log(`🧹 [SESSION-CACHE] Cleared character seeds for user: ${userId}`);
  }
}
```

## **Cache Flow Diagrams**

### **Guest User Caching Flow**
<lov-mermaid>
sequenceDiagram
    participant User
    participant Frontend
    participant EnhancedCache
    participant NetflixManager
    participant SessionManager
    
    Note over User: Guest user reads story
    User->>Frontend: Start reading (Page 1-6)
    Frontend->>EnhancedCache: Store page images
    EnhancedCache-->>Frontend: Images cached
    
    Note over User: User navigates backward
    User->>Frontend: Go to previous page
    Frontend->>EnhancedCache: Get cached image
    EnhancedCache-->>Frontend: Return cached image
    
    Note over User: User clicks "Next Story"
    User->>Frontend: Next Story button
    Frontend->>SessionManager: clearForStoryTransition()
    SessionManager->>EnhancedCache: Clear all images
    SessionManager->>NetflixManager: Clear session
    SessionManager-->>Frontend: Cache cleared
    
    Note over Frontend: Fresh 6-page cycle begins
    Frontend->>EnhancedCache: Store new page images
</lov-mermaid>

### **Premium User Caching Flow**
<lov-mermaid>
sequenceDiagram
    participant User
    participant Frontend
    participant EnhancedCache
    participant SessionManager
    
    Note over User: Premium user live generation
    User->>Frontend: Navigate pages freely
    Frontend->>EnhancedCache: Store/retrieve images
    
    Note over User: User continues story (Part II, III)
    User->>Frontend: Continue story
    Frontend->>EnhancedCache: Maintain image cache
    
    Note over User: User uses magic wand
    User->>Frontend: Magic wand rewrite
    Frontend->>SessionManager: clearForPremiumRewrite()
    SessionManager->>EnhancedCache: Clear story images only
    Note over SessionManager: Character seeds preserved
    
    Note over User: User ends session
    User->>Frontend: End session
    Frontend->>SessionManager: clearForPremiumFinish()
    SessionManager->>EnhancedCache: Clear all images
</lov-mermaid>

## **Debug Tools Integration**

### **Browser Console Debug Commands**
```typescript
// From src/utils/imageDebugConsole.ts integration
class ImageDebugConsoleClass {
  
  /**
   * Inspect cache contents with detailed breakdown
   */
  static inspectCache(sessionId?: string): void {
    const targetSession = sessionId || sessionStorage.getItem('stableSessionId');
    
    if (!targetSession) {
      console.warn('No session ID provided and no stable session found');
      return;
    }
    
    console.group(`🗂️ Cache Inspection: ${targetSession}`);
    
    // Get cached images for this session
    const cachedImages = EnhancedImageCache.getImagesForSession(targetSession);
    
    if (cachedImages.length === 0) {
      console.log('No cached images found for this session');
    } else {
      console.log(`Found ${cachedImages.length} cached images:`);
      
      cachedImages.forEach((image, index) => {
        console.log(`${index + 1}. Page ${image.pageNumber}:`);
        console.log(`   URL: ${image.imageUrl.substring(0, 50)}...`);
        console.log(`   Avatar: ${image.avatarConfig.skinTone}-${image.avatarConfig.hairColor}-${image.avatarConfig.hairStyle}`);
        console.log(`   Cached: ${new Date(image.cachedAt).toLocaleString()}`);
        console.log(`   Expires: ${new Date(image.expiresAt).toLocaleString()}`);
        console.log(`   Accesses: ${image.accessCount}`);
        console.log(`   Cache Key: ${image.cacheKey}`);
        console.log('---');
      });
      
      // Show cache statistics
      const stats = EnhancedImageCache.getStats();
      console.log('📊 Cache Statistics:');
      console.log(`   Total Images: ${stats.totalImages}`);
      console.log(`   Cache Size: ${(stats.cacheSize / 1024).toFixed(2)} KB`);
      console.log(`   Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    }
    
    console.groupEnd();
  }
  
  /**
   * Clear current session cache with confirmation
   */
  static clearCurrentCache(): void {
    const sessionId = sessionStorage.getItem('stableSessionId');
    if (!sessionId) {
      console.warn('No active session to clear');
      return;
    }
    
    console.group('🧹 Cache Clearing');
    console.log(`Clearing cache for session: ${sessionId}`);
    
    const beforeCount = EnhancedImageCache.getImagesForSession(sessionId).length;
    EnhancedImageCache.clearSession(sessionId);
    const afterCount = EnhancedImageCache.getImagesForSession(sessionId).length;
    
    console.log(`Cleared ${beforeCount - afterCount} cached images`);
    console.groupEnd();
  }
  
  /**
   * Test cache key generation consistency
   */
  static testCacheKeyGeneration(storyText: string, avatarConfig: any): void {
    const sessionId = 'test-session';
    const pageNumber = 1;
    
    console.group('🔑 Cache Key Testing');
    
    // Generate multiple keys with same inputs
    const keys = [];
    for (let i = 0; i < 5; i++) {
      const key = EnhancedImageCache.generateCacheKey(sessionId, pageNumber, storyText, avatarConfig);
      keys.push(key);
    }
    
    // Check consistency
    const allSame = keys.every(key => key === keys[0]);
    console.log(`Key consistency: ${allSame ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Generated key: ${keys[0]}`);
    
    // Test avatar variations
    const variations = [
      { ...avatarConfig, skinTone: 'light' },
      { ...avatarConfig, hairColor: 'blonde' },
      { ...avatarConfig, hairStyle: 'pigtails' }
    ];
    
    variations.forEach((variation, index) => {
      const varKey = EnhancedImageCache.generateCacheKey(sessionId, pageNumber, storyText, variation);
      const different = varKey !== keys[0];
      console.log(`Variation ${index + 1}: ${different ? '✅ DIFFERENT' : '❌ SAME'} - ${varKey}`);
    });
    
    console.groupEnd();
  }
}

// Global debug commands
window.imageDebug = ImageDebugConsoleClass;
```

### **Available Console Commands**
```javascript
// Available in browser console when debug=1
window.imageDebug.getFullReport();           // Complete system overview
window.imageDebug.inspectCache();            // View cached images
window.imageDebug.inspectCache('specific-session-id'); // View specific session
window.imageDebug.clearCurrentCache();       // Clear current session cache
window.imageDebug.checkSessionMismatch();    // Diagnose session issues
window.imageDebug.testCacheKeyGeneration(storyText, avatarConfig); // Test key consistency
```

## **Storage Management & Limits**

### **Storage Policies**
```typescript
// Cache size and expiry management
export interface CacheManagementPolicy {
  maxTotalImages: 100;        // Total images across all sessions
  maxPerSession: 20;          // Images per individual session
  expiryHours: 24;           // 24-hour automatic expiry
  cleanupThreshold: 90;      // Trigger cleanup at 90% capacity
  compressionLevel: 'medium'; // Balance size vs quality
}

// Automatic cleanup implementation
class CacheCleanupManager {
  
  static performCleanup(): void {
    console.log('🧹 [CLEANUP] Starting cache maintenance');
    
    const cache = EnhancedImageCache.loadCache();
    const entries = Object.values(cache);
    const now = Date.now();
    
    // Remove expired entries
    const expiredKeys = Object.keys(cache).filter(key => 
      now > cache[key].expiresAt
    );
    
    expiredKeys.forEach(key => delete cache[key]);
    
    console.log(`🧹 [CLEANUP] Removed ${expiredKeys.length} expired entries`);
    
    // Enforce size limits
    const remainingEntries = Object.values(cache);
    
    if (remainingEntries.length > CacheManagementPolicy.maxTotalImages) {
      // Sort by last accessed (LRU eviction)
      const sortedEntries = remainingEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      const toRemove = sortedEntries.slice(0, remainingEntries.length - CacheManagementPolicy.maxTotalImages);
      
      toRemove.forEach(entry => delete cache[entry.cacheKey]);
      
      console.log(`🧹 [CLEANUP] Removed ${toRemove.length} LRU entries`);
    }
    
    EnhancedImageCache.saveCache(cache);
    console.log('🧹 [CLEANUP] Cache maintenance complete');
  }
  
  // Automatic cleanup every 30 minutes
  static scheduleCleanup(): void {
    setInterval(() => {
      this.performCleanup();
    }, 30 * 60 * 1000);
  }
}

// Initialize cleanup scheduling
CacheCleanupManager.scheduleCleanup();
```

---
*Last Updated: September 21, 2025*  
*Cache System Status: All components operational with 7 distinct clearing contexts*
