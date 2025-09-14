/**
 * INTELLIGENT CACHE MANAGEMENT - PHASE 7 FINAL
 * Advanced cache management respecting guest/premium limits and session lifecycle
 * Integrates with all previous phases for comprehensive memory management
 */

export class IntelligentCacheManager {
  constructor() {
    this.guestCache = new Map();
    this.premiumCache = new Map();
    this.sessionMetadata = new Map();
    this.cacheStats = new Map();
    
    // Cache limits based on user type
    this.limits = {
      guest: {
        maxSessions: 10,
        maxPagesPerSession: 6, // Business rule: guests see max 6 pages
        sessionDuration: 20 * 60 * 1000, // 20 minutes
        cacheRetention: 30 * 60 * 1000, // 30 minutes after session end
        maxTotalMemory: 50 * 1024 * 1024 // 50MB
      },
      premium: {
        maxSessions: 100,
        maxPagesPerSession: Infinity, // No page limit
        sessionDuration: Infinity, // No time limit (dismissible timer)
        cacheRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxTotalMemory: 500 * 1024 * 1024 // 500MB
      }
    };
  }

  /**
   * MASTER CACHE MANAGEMENT - Intelligent caching with user type awareness
   */
  manageCacheForSession(sessionId, userType = 'guest', operation = 'access', data = null) {
    try {
      const result = {
        success: true,
        action: 'none',
        cacheStatus: 'unknown',
        sessionStatus: 'active',
        recommendations: []
      };

      // 1. VALIDATE SESSION ELIGIBILITY
      const sessionEligibility = this.validateSessionEligibility(sessionId, userType);
      if (!sessionEligibility.valid) {
        result.success = false;
        result.action = 'block_session';
        result.sessionStatus = sessionEligibility.reason;
        return result;
      }

      // 2. MANAGE SESSION LIFECYCLE
      result.sessionStatus = this.manageSessionLifecycle(sessionId, userType, operation);
      
      // 3. APPLY INTELLIGENT CACHING
      const cacheAction = this.applyIntelligentCaching(sessionId, userType, operation, data);
      result.action = cacheAction.action;
      result.cacheStatus = cacheAction.status;

      // 4. ENFORCE USER TYPE LIMITS
      this.enforceUserTypeLimits(sessionId, userType);

      // 5. OPTIMIZE MEMORY USAGE
      const optimization = this.optimizeMemoryUsage(userType);
      result.recommendations = optimization.recommendations;

      // 6. UPDATE CACHE STATISTICS
      this.updateCacheStatistics(sessionId, userType, operation, result);

      console.log(`💾 [IntelligentCacheManager] Managed cache for ${userType} session ${sessionId}, action: ${result.action}`);
      
      return result;

    } catch (error) {
      console.warn('⚠️ [IntelligentCacheManager] Cache management error (non-blocking):', error.message);
      return { 
        success: false, 
        action: 'error', 
        cacheStatus: 'error', 
        sessionStatus: 'error',
        error: error.message 
      };
    }
  }

  /**
   * 1. VALIDATE SESSION ELIGIBILITY
   */
  validateSessionEligibility(sessionId, userType) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);
    const now = Date.now();

    // Check session limits
    if (userType === 'guest') {
      // Guest-specific validations
      if (sessionData) {
        const sessionAge = now - sessionData.startTime;
        const pageCount = sessionData.pages ? sessionData.pages.length : 0;

        // 20-minute time limit for guests
        if (sessionAge > this.limits.guest.sessionDuration) {
          return { valid: false, reason: 'session_expired_time_limit' };
        }

        // 6-page limit for guests (business rule)
        if (pageCount >= this.limits.guest.maxPagesPerSession) {
          return { valid: false, reason: 'session_expired_page_limit' };
        }
      }

      // Check total guest sessions
      if (cache.size >= this.limits.guest.maxSessions && !sessionData) {
        return { valid: false, reason: 'max_guest_sessions_reached' };
      }
    }

    return { valid: true };
  }

  /**
   * 2. MANAGE SESSION LIFECYCLE
   */
  manageSessionLifecycle(sessionId, userType, operation) {
    const cache = this.getCacheForUserType(userType);
    const now = Date.now();

    // Initialize session if not exists
    if (!cache.has(sessionId)) {
      cache.set(sessionId, {
        sessionId,
        userType,
        startTime: now,
        lastActivity: now,
        pages: [],
        characters: new Map(),
        objects: new Map(),
        visualDetails: new Map(),
        templates: new Map(),
        isActive: true,
        metadata: {
          totalAccesses: 0,
          memoryUsage: 0,
          lastOptimization: now
        }
      });
      
      this.sessionMetadata.set(sessionId, {
        userType,
        createdAt: now,
        status: 'active'
      });

      return 'initialized';
    }

    // Update session activity
    const sessionData = cache.get(sessionId);
    sessionData.lastActivity = now;
    sessionData.metadata.totalAccesses++;

    // Check if session should be ended
    if (this.shouldEndSession(sessionId, userType, sessionData)) {
      return this.endSession(sessionId, userType);
    }

    return 'active';
  }

  /**
   * 3. APPLY INTELLIGENT CACHING
   */
  applyIntelligentCaching(sessionId, userType, operation, data) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) {
      return { action: 'no_session', status: 'error' };
    }

    switch (operation) {
      case 'store_page':
        return this.storePageData(sessionId, userType, data);
      
      case 'store_character':
        return this.storeCharacterData(sessionId, userType, data);
      
      case 'store_object':
        return this.storeObjectData(sessionId, userType, data);
      
      case 'store_visual':
        return this.storeVisualData(sessionId, userType, data);
      
      case 'store_template':
        return this.storeTemplateData(sessionId, userType, data);
      
      case 'clear_cache':
        return this.clearSessionCache(sessionId, userType);
      
      case 'access':
      default:
        return { action: 'accessed', status: 'active' };
    }
  }

  /**
   * 4. ENFORCE USER TYPE LIMITS
   */
  enforceUserTypeLimits(sessionId, userType) {
    const limits = this.limits[userType];
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData || !limits) return;

    // Enforce page limits
    if (sessionData.pages.length > limits.maxPagesPerSession) {
      // For guests, cap at 6 pages
      if (userType === 'guest') {
        sessionData.pages = sessionData.pages.slice(0, limits.maxPagesPerSession);
      }
    }

    // Enforce memory limits
    const estimatedMemory = this.estimateSessionMemoryUsage(sessionData);
    sessionData.metadata.memoryUsage = estimatedMemory;

    if (estimatedMemory > limits.maxTotalMemory / cache.size) {
      this.optimizeSessionMemory(sessionId, userType);
    }
  }

  /**
   * 5. OPTIMIZE MEMORY USAGE
   */
  optimizeMemoryUsage(userType) {
    const cache = this.getCacheForUserType(userType);
    const recommendations = [];
    const now = Date.now();

    // Clean expired sessions
    const expiredSessions = [];
    for (const [sessionId, sessionData] of cache.entries()) {
      const sessionAge = now - sessionData.lastActivity;
      const retentionLimit = this.limits[userType].cacheRetention;
      
      if (sessionAge > retentionLimit || !sessionData.isActive) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.clearSessionCache(sessionId, userType);
      recommendations.push(`Cleared expired session ${sessionId}`);
    });

    // Optimize memory for large sessions
    for (const [sessionId, sessionData] of cache.entries()) {
      if (sessionData.metadata.memoryUsage > this.limits[userType].maxTotalMemory * 0.1) {
        this.optimizeSessionMemory(sessionId, userType);
        recommendations.push(`Optimized memory for session ${sessionId}`);
      }
    }

    return { recommendations };
  }

  /**
   * DATA STORAGE METHODS
   */
  storePageData(sessionId, userType, pageData) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return { action: 'error', status: 'no_session' };

    // Check page limits
    if (userType === 'guest' && sessionData.pages.length >= this.limits.guest.maxPagesPerSession) {
      return { action: 'blocked', status: 'page_limit_reached' };
    }

    sessionData.pages.push({
      ...pageData,
      pageNumber: sessionData.pages.length + 1,
      timestamp: Date.now()
    });

    return { action: 'stored', status: 'success' };
  }

  storeCharacterData(sessionId, userType, characterData) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return { action: 'error', status: 'no_session' };

    sessionData.characters.set(characterData.name || characterData.id, {
      ...characterData,
      timestamp: Date.now()
    });

    return { action: 'stored', status: 'success' };
  }

  storeObjectData(sessionId, userType, objectData) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return { action: 'error', status: 'no_session' };

    const objectKey = `${objectData.color || 'default'}_${objectData.object || objectData.name}`;
    sessionData.objects.set(objectKey, {
      ...objectData,
      timestamp: Date.now()
    });

    return { action: 'stored', status: 'success' };
  }

  storeVisualData(sessionId, userType, visualData) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return { action: 'error', status: 'no_session' };

    sessionData.visualDetails.set(visualData.id || Date.now(), {
      ...visualData,
      timestamp: Date.now()
    });

    return { action: 'stored', status: 'success' };
  }

  storeTemplateData(sessionId, userType, templateData) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return { action: 'error', status: 'no_session' };

    sessionData.templates.set(templateData.templateId || Date.now(), {
      ...templateData,
      timestamp: Date.now()
    });

    return { action: 'stored', status: 'success' };
  }

  /**
   * SESSION MANAGEMENT
   */
  shouldEndSession(sessionId, userType, sessionData) {
    const now = Date.now();
    
    if (userType === 'guest') {
      // End guest sessions after 20 minutes or 6 pages
      const sessionAge = now - sessionData.startTime;
      const pageCount = sessionData.pages.length;
      
      return sessionAge > this.limits.guest.sessionDuration || 
             pageCount >= this.limits.guest.maxPagesPerSession;
    }
    
    // Premium users can continue indefinitely unless manually ended
    return false;
  }

  endSession(sessionId, userType) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (sessionData) {
      sessionData.isActive = false;
      sessionData.endTime = Date.now();
    }

    // For guests, clear cache immediately after session ends
    if (userType === 'guest') {
      setTimeout(() => {
        this.clearSessionCache(sessionId, userType);
      }, 5000); // 5 second delay to allow final operations
    }

    return 'ended';
  }

  clearSessionCache(sessionId, userType) {
    const cache = this.getCacheForUserType(userType);
    
    if (cache.has(sessionId)) {
      cache.delete(sessionId);
      this.sessionMetadata.delete(sessionId);
      
      console.log(`🧹 [IntelligentCacheManager] Cleared cache for ${userType} session ${sessionId}`);
      return { action: 'cleared', status: 'success' };
    }
    
    return { action: 'not_found', status: 'warning' };
  }

  /**
   * MEMORY OPTIMIZATION
   */
  optimizeSessionMemory(sessionId, userType) {
    const cache = this.getCacheForUserType(userType);
    const sessionData = cache.get(sessionId);

    if (!sessionData) return;

    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    // Remove old visual details
    for (const [key, visual] of sessionData.visualDetails.entries()) {
      if (now - visual.timestamp > maxAge) {
        sessionData.visualDetails.delete(key);
      }
    }

    // Remove old template data
    for (const [key, template] of sessionData.templates.entries()) {
      if (now - template.timestamp > maxAge) {
        sessionData.templates.delete(key);
      }
    }

    // Keep only most recent page data for guests
    if (userType === 'guest' && sessionData.pages.length > 3) {
      sessionData.pages = sessionData.pages.slice(-3); // Keep last 3 pages
    }

    sessionData.metadata.lastOptimization = now;
  }

  estimateSessionMemoryUsage(sessionData) {
    try {
      const dataString = JSON.stringify({
        pages: sessionData.pages,
        characters: Array.from(sessionData.characters.values()),
        objects: Array.from(sessionData.objects.values()),
        visualDetails: Array.from(sessionData.visualDetails.values()),
        templates: Array.from(sessionData.templates.values())
      });
      
      return dataString.length * 2; // Rough estimate: 2 bytes per character
    } catch (error) {
      return 1024; // Default estimate if JSON.stringify fails
    }
  }

  /**
   * UTILITY FUNCTIONS
   */
  getCacheForUserType(userType) {
    return userType === 'premium' ? this.premiumCache : this.guestCache;
  }

  updateCacheStatistics(sessionId, userType, operation, result) {
    const statsKey = `${userType}_${operation}`;
    
    if (!this.cacheStats.has(statsKey)) {
      this.cacheStats.set(statsKey, {
        totalOperations: 0,
        successfulOperations: 0,
        lastOperation: null
      });
    }

    const stats = this.cacheStats.get(statsKey);
    stats.totalOperations++;
    if (result.success) stats.successfulOperations++;
    stats.lastOperation = Date.now();
  }

  /**
   * PUBLIC API METHODS
   */
  getSessionData(sessionId, userType) {
    const cache = this.getCacheForUserType(userType);
    return cache.get(sessionId);
  }

  getSessionStatus(sessionId, userType) {
    const sessionData = this.getSessionData(sessionId, userType);
    
    if (!sessionData) return 'not_found';
    if (!sessionData.isActive) return 'ended';
    
    if (userType === 'guest') {
      const now = Date.now();
      const sessionAge = now - sessionData.startTime;
      const pageCount = sessionData.pages.length;
      
      if (sessionAge > this.limits.guest.sessionDuration) return 'expired_time';
      if (pageCount >= this.limits.guest.maxPagesPerSession) return 'expired_pages';
    }
    
    return 'active';
  }

  getCacheStatistics(userType = null) {
    if (userType) {
      const cache = this.getCacheForUserType(userType);
      return {
        activeSessions: cache.size,
        memoryUsage: this.estimateTotalMemoryUsage(userType),
        limits: this.limits[userType]
      };
    }

    return {
      guest: this.getCacheStatistics('guest'),
      premium: this.getCacheStatistics('premium'),
      operations: Object.fromEntries(this.cacheStats.entries())
    };
  }

  estimateTotalMemoryUsage(userType) {
    const cache = this.getCacheForUserType(userType);
    let totalMemory = 0;
    
    for (const sessionData of cache.values()) {
      totalMemory += sessionData.metadata.memoryUsage || 0;
    }
    
    return totalMemory;
  }

  /**
   * ADMIN/DEBUG METHODS
   */
  forceEndSession(sessionId, userType) {
    const result = this.endSession(sessionId, userType);
    this.clearSessionCache(sessionId, userType);
    return result;
  }

  clearAllSessions(userType = null) {
    if (userType) {
      const cache = this.getCacheForUserType(userType);
      const sessionIds = Array.from(cache.keys());
      cache.clear();
      
      sessionIds.forEach(sessionId => {
        this.sessionMetadata.delete(sessionId);
      });
      
      return { cleared: sessionIds.length, userType };
    }

    // Clear all
    const guestCount = this.guestCache.size;
    const premiumCount = this.premiumCache.size;
    
    this.guestCache.clear();
    this.premiumCache.clear();
    this.sessionMetadata.clear();
    
    return { cleared: guestCount + premiumCount, guest: guestCount, premium: premiumCount };
  }

  getMemoryReport() {
    return {
      guest: {
        sessions: this.guestCache.size,
        memoryUsage: this.estimateTotalMemoryUsage('guest'),
        limit: this.limits.guest.maxTotalMemory
      },
      premium: {
        sessions: this.premiumCache.size,
        memoryUsage: this.estimateTotalMemoryUsage('premium'),
        limit: this.limits.premium.maxTotalMemory
      },
      total: {
        sessions: this.guestCache.size + this.premiumCache.size,
        memoryUsage: this.estimateTotalMemoryUsage('guest') + this.estimateTotalMemoryUsage('premium')
      }
    };
  }
}

// Export singleton instance
export const intelligentCacheManager = new IntelligentCacheManager();
