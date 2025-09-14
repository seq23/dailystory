/**
 * MASTER PHASE INTEGRATOR - FINAL INTEGRATION
 * Orchestrates all 8 phases into a unified, systematic story generation system
 * Single entry point for all consistency, validation, and intelligence features
 */

import { unifiedDebugValidator } from './UnifiedDebugValidator.js';
import { unifiedPlaceholderResolver } from './UnifiedPlaceholderResolver.js';
import { enhancedAnimalDetector } from './EnhancedAnimalDetector.js';
import { coloredObjectTracker } from './ColoredObjectTracker.js';
import { templateConsistencyEnforcer } from './TemplateConsistencyEnforcer.js';
import { crossPageConsistencyIntelligence } from './CrossPageConsistencyIntelligence.js';
import { intelligentCacheManager } from './IntelligentCacheManager.js';
import { visualDetailTracker } from './VisualDetailTracker.js';

export class MasterPhaseIntegrator {
  constructor() {
    this.initialized = false;
    this.integrationStats = new Map();
    this.systemHealth = 'unknown';
  }

  /**
   * MASTER INTEGRATION - Process content through all phases systematically
   */
  async processContentThroughAllPhases(content, context = {}) {
    const { sessionId, pageNumber = 1, userInfo = {}, userType = 'guest', templateId } = context;
    
    if (!content || typeof content !== 'string') {
      return { content, success: false, error: 'Invalid content provided' };
    }

    try {
      const results = {
        originalContent: content,
        processedContent: content,
        phases: {},
        systemHealth: 'unknown',
        recommendations: [],
        cacheStatus: 'unknown',
        success: true,
        processingTime: Date.now()
      };

      console.log(`🚀 [MasterPhaseIntegrator] Starting comprehensive processing for session ${sessionId}, page ${pageNumber}`);

      // PHASE 1: Critical Deployment Fixes (already implemented in service architecture)
      results.phases.phase1 = { status: 'deployed', description: 'Service interfaces fixed' };

      // PHASE 8: Unified Debug Validation (run first for system health)
      results.phases.phase8 = await this.runPhase8_UnifiedValidation(content, context);
      results.systemHealth = results.phases.phase8.overallStatus;

      // PHASE 7: Intelligent Cache Management (check session eligibility)
      results.phases.phase7 = this.runPhase7_CacheManagement(sessionId, userType, 'access');
      results.cacheStatus = results.phases.phase7.cacheStatus;
      
      // If session not eligible, return early
      if (!results.phases.phase7.success || results.phases.phase7.sessionStatus === 'session_expired_time_limit' || results.phases.phase7.sessionStatus === 'session_expired_page_limit') {
        results.success = false;
        results.error = `Session limit reached: ${results.phases.phase7.sessionStatus}`;
        return results;
      }

      // PHASE 2: Unified Placeholder Resolution
      results.phases.phase2 = this.runPhase2_PlaceholderResolution(content, context);
      if (results.phases.phase2.success) {
        results.processedContent = results.phases.phase2.resolvedText;
      }

      // PHASE 3: Enhanced Animal & Secondary Character Detection
      results.phases.phase3 = this.runPhase3_AnimalDetection(results.processedContent, context);

      // PHASE 4: Colored Object Persistence
      results.phases.phase4 = this.runPhase4_ObjectTracking(results.processedContent, context);

      // PHASE 5: Template System Consistency Enforcement
      results.phases.phase5 = await this.runPhase5_TemplateConsistency(results.processedContent, context);
      if (results.phases.phase5.success) {
        results.processedContent = results.phases.phase5.content;
      }

      // PHASE 6: Cross-Page Consistency Intelligence
      results.phases.phase6 = await this.runPhase6_ConsistencyIntelligence(results.processedContent, context);
      if (results.phases.phase6.success) {
        results.processedContent = results.phases.phase6.content;
      }

      // FINAL: Store processed data in cache
      if (results.success) {
        this.storeProcessedDataInCache(sessionId, userType, pageNumber, {
          content: results.processedContent,
          characters: results.phases.phase3.animals,
          objects: results.phases.phase4.objects,
          intelligence: results.phases.phase6.intelligence
        });
      }

      // Generate master recommendations
      results.recommendations = this.generateMasterRecommendations(results.phases);
      results.processingTime = Date.now() - results.processingTime;

      console.log(`✅ [MasterPhaseIntegrator] Completed processing in ${results.processingTime}ms, health: ${results.systemHealth}`);
      
      return results;

    } catch (error) {
      console.error('❌ [MasterPhaseIntegrator] Master integration error:', error);
      return { 
        originalContent: content,
        processedContent: content,
        success: false, 
        error: error.message,
        systemHealth: 'error',
        phases: {}
      };
    }
  }

  /**
   * PHASE EXECUTION METHODS
   */
  async runPhase8_UnifiedValidation(content, context) {
    try {
      const validationContext = {
        ...context,
        pageText: content,
        operation: 'master_integration'
      };

      const validation = await unifiedDebugValidator.validateSystem(validationContext);
      
      return {
        success: true,
        overallStatus: validation.overallStatus,
        checks: validation.checks,
        recommendations: validation.recommendations,
        timestamp: validation.timestamp
      };
    } catch (error) {
      return { success: false, error: error.message, overallStatus: 'error' };
    }
  }

  runPhase7_CacheManagement(sessionId, userType, operation, data = null) {
    try {
      const cacheResult = intelligentCacheManager.manageCacheForSession(sessionId, userType, operation, data);
      
      return {
        success: cacheResult.success,
        action: cacheResult.action,
        cacheStatus: cacheResult.cacheStatus,
        sessionStatus: cacheResult.sessionStatus,
        recommendations: cacheResult.recommendations
      };
    } catch (error) {
      return { success: false, error: error.message, cacheStatus: 'error' };
    }
  }

  runPhase2_PlaceholderResolution(content, context) {
    try {
      const resolution = unifiedPlaceholderResolver.resolveAllPlaceholders(content, context);
      
      return {
        success: resolution.success,
        resolvedText: resolution.resolvedText,
        resolutions: resolution.resolutions,
        error: resolution.error
      };
    } catch (error) {
      return { success: false, error: error.message, resolvedText: content };
    }
  }

  runPhase3_AnimalDetection(content, context) {
    try {
      const detection = enhancedAnimalDetector.detectAllCharacters(content, context);
      
      return {
        success: detection.success,
        animals: detection.animals,
        secondaryCharacters: detection.secondaryCharacters,
        relationships: detection.relationships,
        error: detection.error
      };
    } catch (error) {
      return { success: false, error: error.message, animals: [], secondaryCharacters: [] };
    }
  }

  runPhase4_ObjectTracking(content, context) {
    try {
      const tracking = coloredObjectTracker.trackColoredObjects(content, context);
      
      return {
        success: tracking.success,
        objects: tracking.objects,
        consistency: tracking.consistency,
        recommendations: tracking.recommendations,
        error: tracking.error
      };
    } catch (error) {
      return { success: false, error: error.message, objects: [], consistency: [] };
    }
  }

  async runPhase5_TemplateConsistency(content, context) {
    try {
      const consistency = templateConsistencyEnforcer.enforceTemplateConsistency(content, context);
      
      return {
        success: consistency.success,
        content: consistency.content,
        consistency: consistency.consistency,
        issues: consistency.issues,
        resolutions: consistency.resolutions,
        error: consistency.error
      };
    } catch (error) {
      return { success: false, error: error.message, content, consistency: 'error' };
    }
  }

  async runPhase6_ConsistencyIntelligence(content, context) {
    try {
      const intelligence = crossPageConsistencyIntelligence.analyzeAndEnforceConsistency(content, context);
      
      return {
        success: intelligence.success,
        content: intelligence.content,
        consistency: intelligence.consistency,
        intelligence: intelligence.intelligence,
        recommendations: intelligence.recommendations,
        modifications: intelligence.modifications,
        error: intelligence.error
      };
    } catch (error) {
      return { success: false, error: error.message, content, consistency: 'error' };
    }
  }

  /**
   * DATA STORAGE AND RETRIEVAL
   */
  storeProcessedDataInCache(sessionId, userType, pageNumber, data) {
    try {
      // Store page data
      intelligentCacheManager.manageCacheForSession(sessionId, userType, 'store_page', {
        pageNumber,
        content: data.content,
        timestamp: Date.now()
      });

      // Store character data
      if (data.characters && data.characters.length > 0) {
        data.characters.forEach(character => {
          intelligentCacheManager.manageCacheForSession(sessionId, userType, 'store_character', character);
        });
      }

      // Store object data
      if (data.objects && data.objects.length > 0) {
        data.objects.forEach(object => {
          intelligentCacheManager.manageCacheForSession(sessionId, userType, 'store_object', object);
        });
      }

      // Store intelligence data
      if (data.intelligence) {
        intelligentCacheManager.manageCacheForSession(sessionId, userType, 'store_visual', {
          intelligence: data.intelligence,
          pageNumber,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn('⚠️ [MasterPhaseIntegrator] Cache storage error (non-blocking):', error.message);
    }
  }

  /**
   * RECOMMENDATION GENERATION
   */
  generateMasterRecommendations(phases) {
    const recommendations = [];

    // Collect recommendations from all phases
    Object.entries(phases).forEach(([phaseName, phaseResult]) => {
      if (phaseResult.recommendations && Array.isArray(phaseResult.recommendations)) {
        phaseResult.recommendations.forEach(rec => {
          recommendations.push({
            phase: phaseName,
            recommendation: rec,
            priority: this.assessRecommendationPriority(rec, phaseName)
          });
        });
      }
    });

    // System-wide recommendations based on phase results
    if (phases.phase8?.overallStatus === 'error') {
      recommendations.push({
        phase: 'system',
        recommendation: 'System validation failed - check service health',
        priority: 'critical'
      });
    }

    if (phases.phase7?.sessionStatus?.includes('expired')) {
      recommendations.push({
        phase: 'system',
        recommendation: 'Session limit reached - consider upgrading to premium',
        priority: 'high'
      });
    }

    // Sort by priority and return top recommendations
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 10); // Top 10 recommendations
  }

  assessRecommendationPriority(recommendation, phaseName) {
    const text = typeof recommendation === 'string' ? recommendation : recommendation.toString();
    
    if (text.includes('critical') || text.includes('error') || text.includes('failed')) return 'critical';
    if (text.includes('consistency') || text.includes('conflict') || phaseName === 'phase6') return 'high';
    if (text.includes('optimization') || text.includes('memory') || phaseName === 'phase7') return 'medium';
    return 'low';
  }

  /**
   * SYSTEM HEALTH AND MONITORING
   */
  getSystemHealth() {
    try {
      const health = {
        overall: 'unknown',
        phases: {},
        cache: {},
        recommendations: [],
        timestamp: new Date().toISOString()
      };

      // Get cache statistics
      health.cache = intelligentCacheManager.getCacheStatistics();
      
      // Get validation summary
      health.validation = unifiedDebugValidator.getHealthSummary();
      
      // Determine overall health
      if (health.validation.status === 'error') {
        health.overall = 'critical';
      } else if (health.cache.guest.activeSessions > 8 || health.cache.premium.activeSessions > 80) {
        health.overall = 'degraded';
      } else {
        health.overall = 'healthy';
      }

      return health;
    } catch (error) {
      return { overall: 'error', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * SESSION MANAGEMENT HELPERS
   */
  endUserSession(sessionId, userType) {
    try {
      // Clear session from cache manager
      const cacheResult = intelligentCacheManager.forceEndSession(sessionId, userType);
      
      // Clear from other services
      enhancedAnimalDetector.clearDetections(sessionId);
      coloredObjectTracker.clearSessionObjects(sessionId);
      templateConsistencyEnforcer.clearSessionHistory(sessionId);
      crossPageConsistencyIntelligence.clearConsistencyProfile(sessionId);
      
      console.log(`🏁 [MasterPhaseIntegrator] Ended session ${sessionId} for ${userType} user`);
      
      return { success: true, action: 'session_ended', cacheCleared: cacheResult };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getUserSessionStatus(sessionId, userType) {
    try {
      const status = intelligentCacheManager.getSessionStatus(sessionId, userType);
      const sessionData = intelligentCacheManager.getSessionData(sessionId, userType);
      
      return {
        status,
        sessionData: sessionData ? {
          startTime: sessionData.startTime,
          lastActivity: sessionData.lastActivity,
          pageCount: sessionData.pages.length,
          isActive: sessionData.isActive,
          memoryUsage: sessionData.metadata.memoryUsage
        } : null
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * INITIALIZATION AND CLEANUP
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      console.log('🚀 [MasterPhaseIntegrator] Initializing all phases...');
      
      // Initialize all phase components
      // (Most are already initialized as singletons)
      
      this.initialized = true;
      this.systemHealth = 'healthy';
      
      console.log('✅ [MasterPhaseIntegrator] All phases initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ [MasterPhaseIntegrator] Initialization failed:', error);
      this.systemHealth = 'critical';
      return false;
    }
  }

  async cleanup() {
    try {
      // Clean up all services
      intelligentCacheManager.clearAllSessions();
      
      this.initialized = false;
      this.systemHealth = 'unknown';
      
      console.log('🧹 [MasterPhaseIntegrator] Cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ [MasterPhaseIntegrator] Cleanup failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const masterPhaseIntegrator = new MasterPhaseIntegrator();