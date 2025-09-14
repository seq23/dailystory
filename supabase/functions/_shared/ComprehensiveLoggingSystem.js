// ============= COMPREHENSIVE LOGGING SYSTEM =============
// Phase 6: Detailed logging for tier routing, cultural resolution, and secondary character processing
// Provides comprehensive observability across the entire image generation pipeline

export class ComprehensiveLoggingSystem {
  constructor() {
    this.logs = new Map();
    this.logCategories = [
      'TIER_ROUTING',
      'CULTURAL_RESOLUTION', 
      'SECONDARY_CHARACTERS',
      'ERROR_RECOVERY',
      'PERFORMANCE',
      'DATA_FLOW',
      'SERVICE_HEALTH'
    ];
    this.maxLogsPerCategory = 1000;
    this.initializeLogging();
  }

  // ============= LOGGING INITIALIZATION =============

  initializeLogging() {
    // Initialize log storage for each category
    for (const category of this.logCategories) {
      this.logs.set(category, []);
    }
    
    console.log('✅ Phase 6: Comprehensive logging system initialized');
    this.logEvent('TIER_ROUTING', 'SYSTEM_INIT', 'Logging system started', {
      categories: this.logCategories.length,
      maxLogsPerCategory: this.maxLogsPerCategory
    });
  }

  // ============= TIER ROUTING LOGGING =============

  // Log tier routing decisions with detailed context
  logTierRouting(event, details = {}) {
    const tierLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      currentTier: details.currentTier || 'unknown',
      targetTier: details.targetTier || 'unknown',
      routingReason: details.routingReason || 'unknown',
      userComplexity: details.userComplexity || 'unknown',
      serviceHealth: details.serviceHealth || {},
      avatarCompleteness: details.avatarCompleteness || 'unknown',
      degradationLevel: details.degradationLevel || 'OPTIMAL',
      processingTime: details.processingTime || 0
    };

    this.addLog('TIER_ROUTING', tierLog);
    
    console.log(`🎯 Phase 6 Tier Routing: ${event}`, {
      tier: `${tierLog.currentTier} → ${tierLog.targetTier}`,
      reason: tierLog.routingReason,
      session: tierLog.sessionId
    });
  }

  // Log tier transition success/failure
  logTierTransition(fromTier, toTier, success, details = {}) {
    this.logTierRouting('TIER_TRANSITION', {
      ...details,
      currentTier: fromTier,
      targetTier: toTier,
      routingReason: success ? 'successful_transition' : 'failed_transition',
      errorMessage: details.error?.message || null,
      processingTime: details.processingTime || 0
    });
  }

  // Log tier degradation events
  logTierDegradation(originalTier, degradedTier, reason, details = {}) {
    this.logTierRouting('TIER_DEGRADATION', {
      ...details,
      currentTier: originalTier,
      targetTier: degradedTier,
      routingReason: `degradation_${reason}`,
      degradationTrigger: reason,
      serviceFailures: details.serviceFailures || []
    });
  }

  // ============= CULTURAL RESOLUTION LOGGING =============

  // Log cultural placeholder resolution activities
  logCulturalResolution(event, details = {}) {
    const culturalLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      placeholderType: details.placeholderType || 'unknown',
      culturalTriggers: details.culturalTriggers || [],
      enhancementLevel: details.enhancementLevel || 'none',
      nativeLanguage: details.nativeLanguage || 'en',
      culturalBackground: details.culturalBackground || 'general',
      resolvedContent: details.resolvedContent?.substring(0, 100) + '...' || 'empty',
      processingTime: details.processingTime || 0,
      cacheHit: details.cacheHit || false,
      fallbackUsed: details.fallbackUsed || false
    };

    this.addLog('CULTURAL_RESOLUTION', culturalLog);
    
    console.log(`🌍 Phase 6 Cultural Resolution: ${event}`, {
      type: culturalLog.placeholderType,
      triggers: culturalLog.culturalTriggers.length,
      enhancement: culturalLog.enhancementLevel,
      language: culturalLog.nativeLanguage
    });
  }

  // Log cultural trigger detection
  logCulturalTriggerDetection(triggers, userInfo, details = {}) {
    this.logCulturalResolution('TRIGGER_DETECTION', {
      ...details,
      placeholderType: 'trigger_analysis',
      culturalTriggers: triggers,
      nativeLanguage: userInfo?.nativeLanguage,
      culturalBackground: userInfo?.culturalBackground,
      triggerCount: triggers.length,
      detectionAlgorithm: details.algorithm || 'default'
    });
  }

  // Log cultural enhancement application
  logCulturalEnhancement(placeholderType, originalContent, enhancedContent, details = {}) {
    this.logCulturalResolution('ENHANCEMENT_APPLIED', {
      ...details,
      placeholderType,
      originalLength: originalContent?.length || 0,
      enhancedLength: enhancedContent?.length || 0,
      enhancementRatio: enhancedContent?.length / (originalContent?.length || 1),
      resolvedContent: enhancedContent,
      enhancementFeatures: details.features || []
    });
  }

  // ============= SECONDARY CHARACTER LOGGING =============

  // Log secondary character processing activities
  logSecondaryCharacterProcessing(event, details = {}) {
    const characterLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      tier: details.tier || 'unknown',
      charactersDetected: details.charactersDetected || [],
      charactersProcessed: details.charactersProcessed || [],
      processingMethod: details.processingMethod || 'unknown',
      serviceAvailability: details.serviceAvailability || {},
      processingTime: details.processingTime || 0,
      cacheHits: details.cacheHits || 0,
      generatedDescriptions: details.generatedDescriptions || 0,
      fallbacksUsed: details.fallbacksUsed || 0
    };

    this.addLog('SECONDARY_CHARACTERS', characterLog);
    
    console.log(`🎭 Phase 6 Secondary Characters: ${event}`, {
      tier: characterLog.tier,
      detected: characterLog.charactersDetected.length,
      processed: characterLog.charactersProcessed.length,
      method: characterLog.processingMethod
    });
  }

  // Log character detection phase
  logCharacterDetection(storyText, detectedCharacters, method, details = {}) {
    this.logSecondaryCharacterProcessing('CHARACTER_DETECTION', {
      ...details,
      charactersDetected: detectedCharacters,
      processingMethod: method,
      storyTextLength: storyText?.length || 0,
      detectionAlgorithm: details.algorithm || 'regex',
      confidenceScores: details.confidenceScores || []
    });
  }

  // Log character consistency processing
  logCharacterConsistency(characterName, consistencyData, success, details = {}) {
    this.logSecondaryCharacterProcessing('CONSISTENCY_PROCESSING', {
      ...details,
      charactersProcessed: [characterName],
      processingMethod: 'character_consistency_service',
      consistencyData: {
        hasVisualDescription: !!consistencyData?.visualDescription,
        hasPersonalityTraits: !!consistencyData?.personalityTraits,
        cacheHit: consistencyData?.fromCache || false
      },
      processingSuccess: success,
      errorMessage: details.error?.message || null
    });
  }

  // ============= ERROR RECOVERY LOGGING =============

  // Log error recovery attempts and outcomes
  logErrorRecovery(event, details = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      errorType: details.errorType || 'unknown',
      errorMessage: details.errorMessage?.substring(0, 200) || 'no-message',
      service: details.service || 'unknown',
      recoveryStrategy: details.recoveryStrategy || 'unknown',
      recoverySuccess: details.recoverySuccess || false,
      fallbackUsed: details.fallbackUsed || false,
      processingTime: details.processingTime || 0,
      retryAttempts: details.retryAttempts || 0,
      circuitBreakerState: details.circuitBreakerState || 'unknown'
    };

    this.addLog('ERROR_RECOVERY', errorLog);
    
    console.log(`🚨 Phase 6 Error Recovery: ${event}`, {
      error: errorLog.errorType,
      service: errorLog.service,
      strategy: errorLog.recoveryStrategy,
      success: errorLog.recoverySuccess
    });
  }

  // ============= PERFORMANCE LOGGING =============

  // Log performance metrics and timing data
  logPerformance(event, details = {}) {
    const performanceLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      service: details.service || 'unknown',
      operation: details.operation || 'unknown',
      duration: details.duration || 0,
      memoryUsage: details.memoryUsage || 0,
      cacheHitRate: details.cacheHitRate || 0,
      dataSize: details.dataSize || 0,
      optimizationRatio: details.optimizationRatio || 1,
      throughput: details.throughput || 0
    };

    this.addLog('PERFORMANCE', performanceLog);
    
    if (performanceLog.duration > 5000) { // Log slow operations
      console.warn(`⏱️ Phase 6 Performance Warning: ${event}`, {
        service: performanceLog.service,
        duration: performanceLog.duration + 'ms',
        operation: performanceLog.operation
      });
    }
  }

  // ============= DATA FLOW LOGGING =============

  // Log data flow validation and optimization events
  logDataFlow(event, details = {}) {
    const dataFlowLog = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: details.sessionId?.substring(0, 15) + '...' || 'unknown',
      requestId: details.requestId || 'unknown',
      sourceService: details.sourceService || 'unknown',
      targetService: details.targetService || 'unknown',
      validationPassed: details.validationPassed || false,
      dataPreserved: details.dataPreserved || false,
      optimizationApplied: details.optimizationApplied || false,
      compressionRatio: details.compressionRatio || 1,
      processingTime: details.processingTime || 0,
      errors: details.errors || [],
      warnings: details.warnings || []
    };

    this.addLog('DATA_FLOW', dataFlowLog);
    
    if (!dataFlowLog.dataPreserved) {
      console.warn(`📊 Phase 6 Data Flow Warning: ${event}`, {
        source: dataFlowLog.sourceService,
        target: dataFlowLog.targetService,
        preserved: dataFlowLog.dataPreserved
      });
    }
  }

  // ============= SERVICE HEALTH LOGGING =============

  // Log service health monitoring events
  logServiceHealth(event, details = {}) {
    const healthLog = {
      timestamp: new Date().toISOString(),
      event,
      service: details.service || 'unknown',
      healthStatus: details.healthStatus || 'unknown',
      responseTime: details.responseTime || 0,
      availability: details.availability || 0,
      errorRate: details.errorRate || 0,
      capabilities: details.capabilities || [],
      lastHealthCheck: details.lastHealthCheck || null,
      degradationLevel: details.degradationLevel || 'OPTIMAL'
    };

    this.addLog('SERVICE_HEALTH', healthLog);
    
    if (healthLog.healthStatus !== 'HEALTHY') {
      console.warn(`🏥 Phase 6 Service Health Alert: ${event}`, {
        service: healthLog.service,
        status: healthLog.healthStatus,
        responseTime: healthLog.responseTime + 'ms'
      });
    }
  }

  // ============= LOG MANAGEMENT =============

  // Add log entry to specific category
  addLog(category, logEntry) {
    if (!this.logs.has(category)) {
      console.warn(`⚠️ Phase 6: Unknown log category: ${category}`);
      return;
    }

    const categoryLogs = this.logs.get(category);
    categoryLogs.push(logEntry);

    // Maintain max log limit per category
    if (categoryLogs.length > this.maxLogsPerCategory) {
      categoryLogs.shift(); // Remove oldest log
    }

    this.logs.set(category, categoryLogs);
  }

  // Generic log event method
  logEvent(category, event, message, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      message,
      details
    };

    this.addLog(category, logEntry);
    console.log(`📝 Phase 6 ${category}: ${event} - ${message}`);
  }

  // ============= LOG RETRIEVAL AND ANALYSIS =============

  // Get logs by category
  getLogsByCategory(category, limit = 50) {
    const categoryLogs = this.logs.get(category) || [];
    return categoryLogs.slice(-limit);
  }

  // Get recent logs across all categories
  getRecentLogs(limit = 100) {
    const allLogs = [];
    
    for (const [category, logs] of this.logs.entries()) {
      allLogs.push(...logs.map(log => ({ category, ...log })));
    }
    
    return allLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get logging statistics
  getLoggingStats() {
    const stats = {
      totalLogs: 0,
      logsByCategory: {},
      recentActivity: {},
      systemHealth: 'HEALTHY'
    };

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [category, logs] of this.logs.entries()) {
      stats.totalLogs += logs.length;
      stats.logsByCategory[category] = logs.length;
      
      // Count recent activity
      const recentLogs = logs.filter(log => 
        new Date(log.timestamp).getTime() > oneHourAgo
      );
      stats.recentActivity[category] = recentLogs.length;
    }

    // Determine system health based on error logs
    const errorLogs = this.logs.get('ERROR_RECOVERY') || [];
    const recentErrors = errorLogs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    );
    
    if (recentErrors.length > 10) {
      stats.systemHealth = 'DEGRADED';
    } else if (recentErrors.length > 20) {
      stats.systemHealth = 'CRITICAL';
    }

    return stats;
  }

  // Search logs by criteria
  searchLogs(criteria = {}) {
    const results = [];
    
    for (const [category, logs] of this.logs.entries()) {
      const filteredLogs = logs.filter(log => {
        // Filter by category
        if (criteria.category && category !== criteria.category) {
          return false;
        }
        
        // Filter by event
        if (criteria.event && log.event !== criteria.event) {
          return false;
        }
        
        // Filter by session ID
        if (criteria.sessionId && !log.sessionId?.includes(criteria.sessionId)) {
          return false;
        }
        
        // Filter by service
        if (criteria.service && log.service !== criteria.service) {
          return false;
        }
        
        // Filter by time range
        if (criteria.startTime || criteria.endTime) {
          const logTime = new Date(log.timestamp).getTime();
          if (criteria.startTime && logTime < criteria.startTime) {
            return false;
          }
          if (criteria.endTime && logTime > criteria.endTime) {
            return false;
          }
        }
        
        return true;
      });
      
      results.push(...filteredLogs.map(log => ({ category, ...log })));
    }
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Clear logs for memory management
  clearLogs(category = null) {
    if (category) {
      this.logs.set(category, []);
      console.log(`🧹 Phase 6: Cleared logs for category ${category}`);
    } else {
      for (const cat of this.logCategories) {
        this.logs.set(cat, []);
      }
      console.log('🧹 Phase 6: All logs cleared');
    }
  }

  // Export logs for analysis
  exportLogs(category = null, format = 'json') {
    const logsToExport = category ? 
      { [category]: this.logs.get(category) } : 
      Object.fromEntries(this.logs.entries());
    
    if (format === 'json') {
      return JSON.stringify(logsToExport, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export for analysis
      const allLogs = [];
      for (const [cat, logs] of Object.entries(logsToExport)) {
        allLogs.push(...logs.map(log => ({ category: cat, ...log })));
      }
      
      const headers = ['category', 'timestamp', 'event', 'service', 'message'];
      const csvLines = [headers.join(',')];
      
      allLogs.forEach(log => {
        const row = headers.map(header => 
          JSON.stringify(log[header] || '')
        );
        csvLines.push(row.join(','));
      });
      
      return csvLines.join('\n');
    }
    
    return logsToExport;
  }
}

// Create singleton instance
export const comprehensiveLoggingSystem = new ComprehensiveLoggingSystem();