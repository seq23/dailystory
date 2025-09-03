/**
 * Session State Manager - Arc-Aware Session Tracking
 * Integrates with existing cache system and character validation
 */

/**
 * Arc-aware session state structure
 */
export class ArcSessionState {
  constructor(sessionId, userId, isNeverEnding = true, templateLevel = 'level1') {
    this.sessionId = sessionId;
    this.userId = userId;
    this.isNeverEnding = isNeverEnding;
    this.templateLevel = templateLevel;
    this.createdAt = Date.now();
    
    // Arc tracking
    this.currentArc = {
      arcNumber: 0,
      templateIndex: null,
      sceneIndex: 0,
      totalPages: 0
    };
    
    // Arc history (last 3 arcs for similarity checking)
    this.arcHistory = [];
    
    // Smart selection integration
    this.originalSpecialRequest = null;
    this.carriedIntent = null;
    
    // Ending rotation (last 3 endings to prevent repeats)
    this.endingRotation = [];
    
    // Environmental state for cycling
    this.environmentalState = {
      time: 'morning',
      weather: 'sunny',
      mood: 'energetic',
      season: 'spring'
    };
    
    // Swappable element state
    this.swappableState = {
      secondaryCharacter: null,
      setting: null,
      keyObject: null
    };
    
    // Cache integration compatibility
    this.cacheCompatibility = {
      lastCacheKey: null,
      needsCacheUpdate: false
    };
    
    // Character validation cache
    this.validationCache = {
      expectedSceneLength: null,
      arcValidationResults: new Map()
    };
  }
  
  /**
   * Update current arc information
   */
  updateCurrentArc(arcData) {
    Object.assign(this.currentArc, arcData);
    this.currentArc.lastUpdated = Date.now();
  }
  
  /**
   * Add completed arc to history
   */
  addArcToHistory(arcData) {
    // Add to front of history
    this.arcHistory.unshift({
      ...arcData,
      completedAt: Date.now()
    });
    
    // Keep only last 3 arcs
    this.arcHistory = this.arcHistory.slice(0, 3);
  }
  
  /**
   * Update environmental state for next arc
   */
  updateEnvironmentalState(changes) {
    Object.assign(this.environmentalState, changes);
  }
  
  /**
   * Update swappable element state
   */
  updateSwappableState(changes) {
    Object.assign(this.swappableState, changes);
  }
  
  /**
   * Set original special request (for first arc)
   */
  setOriginalSpecialRequest(request) {
    this.originalSpecialRequest = request;
  }
  
  /**
   * Update carried intent for arc continuity
   */
  updateCarriedIntent(intent) {
    this.carriedIntent = intent;
  }
  
  /**
   * Get current page index across all arcs
   */
  getCurrentPageIndex() {
    const completedArcs = this.arcHistory.length;
    const pagesFromCompletedArcs = completedArcs * (this.getBValue() + 1);
    return pagesFromCompletedArcs + this.currentArc.sceneIndex;
  }
  
  /**
   * Get B value for current template level
   */
  getBValue() {
    const B_VALUES = {
      level1: 5,
      level2: 8,
      level3: 10,
      level4: 12,
      grade6: 15,
      grade7: 15,
      grade8: 15,
      grade9: 15,
      grade10: 15
    };
    return B_VALUES[this.templateLevel] || 5;
  }
  
  /**
   * Check if session needs cache update
   */
  needsCacheUpdate() {
    return this.cacheCompatibility.needsCacheUpdate;
  }
  
  /**
   * Mark cache as updated
   */
  markCacheUpdated(cacheKey) {
    this.cacheCompatibility.lastCacheKey = cacheKey;
    this.cacheCompatibility.needsCacheUpdate = false;
  }
  
  /**
   * Get validation cache for current arc position
   */
  getValidationCache(pageIndex) {
    return this.validationCache.arcValidationResults.get(pageIndex);
  }
  
  /**
   * Set validation cache for current arc position
   */
  setValidationCache(pageIndex, validationResult) {
    this.validationCache.arcValidationResults.set(pageIndex, {
      ...validationResult,
      cachedAt: Date.now()
    });
    
    // Clean old cache entries (keep only last 50)
    if (this.validationCache.arcValidationResults.size > 50) {
      const entries = Array.from(this.validationCache.arcValidationResults.entries());
      const sortedEntries = entries.sort((a, b) => (b[1].cachedAt || 0) - (a[1].cachedAt || 0));
      
      this.validationCache.arcValidationResults.clear();
      sortedEntries.slice(0, 50).forEach(([key, value]) => {
        this.validationCache.arcValidationResults.set(key, value);
      });
    }
  }
  
  /**
   * Clear session state (for rewrites/new stories)
   */
  clearForNewStory() {
    // Reset arc state but preserve avatar identity
    this.arcHistory = [];
    this.currentArc = {
      arcNumber: 0,
      templateIndex: null,
      sceneIndex: 0,
      totalPages: 0
    };
    this.endingRotation = [];
    this.carriedIntent = null;
    
    // Reset environmental and swappable state
    this.environmentalState = {
      time: 'morning',
      weather: 'sunny', 
      mood: 'energetic',
      season: 'spring'
    };
    this.swappableState = {
      secondaryCharacter: null,
      setting: null,
      keyObject: null
    };
    
    // Clear validation cache
    this.validationCache.arcValidationResults.clear();
    
    // Mark for cache update
    this.cacheCompatibility.needsCacheUpdate = true;
  }
  
  /**
   * Clear session state completely (for session end)
   */
  clearCompletely() {
    this.clearForNewStory();
    this.originalSpecialRequest = null;
    this.cacheCompatibility.lastCacheKey = null;
  }
  
  /**
   * Export state for storage/caching
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isNeverEnding: this.isNeverEnding,
      templateLevel: this.templateLevel,
      createdAt: this.createdAt,
      currentArc: this.currentArc,
      arcHistory: this.arcHistory,
      originalSpecialRequest: this.originalSpecialRequest,
      carriedIntent: this.carriedIntent,
      endingRotation: this.endingRotation,
      environmentalState: this.environmentalState,
      swappableState: this.swappableState,
      cacheCompatibility: this.cacheCompatibility
      // Note: validationCache is transient and not serialized
    };
  }
  
  /**
   * Import state from storage/caching
   */
  static fromJSON(data) {
    const state = new ArcSessionState(
      data.sessionId,
      data.userId,
      data.isNeverEnding,
      data.templateLevel
    );
    
    Object.assign(state, data);
    
    // Reconstruct validation cache as Map
    state.validationCache = {
      expectedSceneLength: null,
      arcValidationResults: new Map()
    };
    
    return state;
  }
}

/**
 * Global session state manager for arc-aware sessions
 */
export class ArcSessionManager {
  constructor() {
    this.sessions = new Map();
  }
  
  /**
   * Get or create arc-aware session state
   * EXCLUDES Level 0 - uses legacy session management
   */
  getOrCreateSession(sessionId, userId, templateLevel = 'level1', userInfo = {}) {
    // Level 0 exclusion - not arc-based
    if (templateLevel === 'level0') {
      throw new Error('Level 0 uses legacy session management, not arc-aware sessions');
    }
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }
    
    const session = new ArcSessionState(sessionId, userId, true, templateLevel);
    
    // Set original special request if provided
    if (userInfo.specialRequest) {
      session.setOriginalSpecialRequest(userInfo.specialRequest);
    }
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  /**
   * Update session state
   */
  updateSession(sessionId, updateData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    if (updateData.currentArc) {
      session.updateCurrentArc(updateData.currentArc);
    }
    
    if (updateData.environmentalChanges) {
      session.updateEnvironmentalState(updateData.environmentalChanges);
    }
    
    if (updateData.swappableChanges) {
      session.updateSwappableState(updateData.swappableChanges);
    }
    
    if (updateData.carriedIntent) {
      session.updateCarriedIntent(updateData.carriedIntent);
    }
    
    return session;
  }
  
  /**
   * Complete current arc and start new one
   */
  completeArc(sessionId, arcTransitionData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Move current arc to history
    session.addArcToHistory({
      ...session.currentArc,
      templateIndex: session.currentArc.templateIndex,
      theme: arcTransitionData.carriedIntent,
      ...session.swappableState
    });
    
    // Start new arc
    session.updateCurrentArc({
      arcNumber: session.currentArc.arcNumber + 1,
      templateIndex: arcTransitionData.nextTemplateIndex,
      sceneIndex: 0,
      totalPages: 0
    });
    
    // Apply arc transition changes
    if (arcTransitionData.environmentalChanges) {
      session.updateEnvironmentalState(arcTransitionData.environmentalChanges);
    }
    
    if (arcTransitionData.swappableChanges) {
      session.updateSwappableState(arcTransitionData.swappableChanges);
    }
    
    if (arcTransitionData.carriedIntent) {
      session.updateCarriedIntent(arcTransitionData.carriedIntent);
    }
    
    return session;
  }
  
  /**
   * Clear session for new story (rewrite)
   */
  clearSessionForNewStory(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clearForNewStory();
    }
  }
  
  /**
   * Clear session completely (session end)
   */
  clearSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clearCompletely();
    }
    this.sessions.delete(sessionId);
  }
  
  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      sessionId: session.sessionId,
      userId: session.userId,
      templateLevel: session.templateLevel,
      currentArc: session.currentArc.arcNumber,
      totalPages: session.getCurrentPageIndex(),
      createdAt: session.createdAt
    }));
  }
  
  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Global instance for use across the application
export const globalArcSessionManager = new ArcSessionManager();

// Cleanup old sessions every hour
setInterval(() => {
  globalArcSessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);
