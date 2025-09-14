// ============= COMPREHENSIVE LOGGING SYSTEM - PHASE 6 IMPLEMENTATION =============
// 7-category logging system for complete observability and debugging
// Routes to DebugLogger instead of console to prevent log clogging

/**
 * Comprehensive Logging System for Image Generation Pipeline
 * Routes all logs through DebugLogger service for better organization
 * Categories: tier routing, cultural resolution, secondary characters, 
 *            error recovery, performance, data flow, service health
 */
export class ComprehensiveLoggingSystem {
  constructor() {
    this.logs = new Map();
    this.maxLogsPerCategory = 100;
    this.categories = [
      'TIER_ROUTING',
      'CULTURAL_RESOLUTION', 
      'SECONDARY_CHARACTER_PROCESSING',
      'ERROR_RECOVERY',
      'PERFORMANCE_MONITORING',
      'DATA_FLOW_VALIDATION',
      'SERVICE_HEALTH_MONITORING'
    ];
    
    this.initializeLogging();
  }

  initializeLogging() {
    // Initialize log storage for each category
    this.categories.forEach(category => {
      this.logs.set(category, []);
    });
    
    // Route to DebugLogger instead of console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('performance', '🚀 [SYSTEM] ComprehensiveLoggingSystem initialized', {
        categories: this.categories,
        maxLogsPerCategory: this.maxLogsPerCategory
      });
    }
  }

  // ============= TIER ROUTING LOGGING =============

  // Log detailed tier routing decisions
  logTierRouting(event, details = {}) {
    const message = `Tier routing event: ${event}`;
    const tierLog = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
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
    
    // Route to DebugLogger instead of console
    const emoji = this.getEventEmoji(event);
    const logMessage = `${emoji} [TIER ROUTING] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('performance', logMessage, details);
    }
  }

  // Log tier transition success/failure
  logTierTransition(fromTier, toTier, success, details = {}) {
    const message = `Tier transition: ${fromTier} → ${toTier} (${success ? 'SUCCESS' : 'FAILED'})`;
    
    // Route to DebugLogger instead of console
    const emoji = success ? '✅' : '❌';
    const logMessage = `${emoji} [TIER TRANSITION] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('performance', logMessage, details);
    }

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
    const message = `Tier degradation: ${originalTier} → ${degradedTier} (Reason: ${reason})`;
    
    // Route to DebugLogger instead of console
    const logMessage = `⬇️ [TIER DEGRADATION] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.warn('performance', logMessage, details);
    }

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
    const message = `Cultural resolution event: ${event}`;
    const culturalLog = {
      id: `cultural-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
      culturalType: details.culturalType || 'default',
      enhancementLevel: details.enhancementLevel || 'none',
      placeholders: details.placeholders || [],
      resolvedPlaceholders: details.resolvedPlaceholders || [],
      culturalTriggers: details.culturalTriggers || [],
      processingTime: details.processingTime || 0
    };

    this.addLog('CULTURAL_RESOLUTION', culturalLog);
    
    // Route to DebugLogger instead of console
    const emoji = this.getCulturalEmoji(event);
    const logMessage = `${emoji} [CULTURAL] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, details);
    }
  }

  // Log cultural trigger detection
  logCulturalTriggerDetection(triggers, userInfo, details = {}) {
    const message = `Cultural triggers detected: ${triggers.join(', ')}`;
    
    // Route to DebugLogger instead of console
    const logMessage = `🎯 [CULTURAL TRIGGERS] Cultural triggers detected: ${triggers.join(', ')}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, { triggers, userInfo, details });
    }

    this.logCulturalResolution('TRIGGER_DETECTION', {
      ...details,
      culturalTriggers: triggers,
      userLanguage: userInfo?.nativeLanguage || 'unknown',
      skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone || 'unknown'
    });
  }

  // Log cultural enhancement application
  logCulturalEnhancement(placeholderType, originalContent, enhancedContent, details = {}) {
    const message = `Enhanced ${placeholderType}: ${originalContent} → ${enhancedContent}`;
    
    // Route to DebugLogger instead of console
    const logMessage = `🌈 [CULTURAL ENHANCEMENT] Enhanced ${placeholderType}: ${originalContent} → ${enhancedContent}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, details);
    }

    this.logCulturalResolution('ENHANCEMENT_APPLIED', {
      ...details,
      placeholderType,
      originalContent,
      enhancedContent,
      enhancementType: details.enhancementType || 'cultural'
    });
  }

  // ============= SECONDARY CHARACTER PROCESSING LOGGING =============

  // Log secondary character processing activities  
  logSecondaryCharacterProcessing(event, details = {}) {
    const message = `Secondary character processing: ${event}`;
    const characterLog = {
      id: `character-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
      detectedCharacters: details.detectedCharacters || [],
      characterCount: details.characterCount || 0,
      consistencyScore: details.consistencyScore || 0,
      processingMethod: details.processingMethod || 'unknown',
      storyLength: details.storyLength || 0,
      processingTime: details.processingTime || 0
    };

    this.addLog('SECONDARY_CHARACTER_PROCESSING', characterLog);
    
    // Route to DebugLogger instead of console
    const emoji = this.getSecondaryCharacterEmoji(event);
    const logMessage = `${emoji} [SECONDARY CHAR] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, details);
    }
  }

  // Log character detection phase
  logCharacterDetection(storyText, detectedCharacters, method, details = {}) {
    const message = `Found ${detectedCharacters.length} characters using ${method}`;
    
    // Route to DebugLogger instead of console
    const logMessage = `🔍 [CHARACTER DETECTION] Found ${detectedCharacters.length} characters using ${method}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, { 
        storyText: storyText.substring(0, 100) + '...', 
        detectedCharacters, 
        method, 
        details 
      });
    }

    this.logSecondaryCharacterProcessing('CHARACTER_DETECTION', {
      ...details,
      detectedCharacters,
      characterCount: detectedCharacters.length,
      processingMethod: method,
      storyLength: storyText.length
    });
  }

  // Log character consistency processing
  logCharacterConsistency(characterName, consistencyData, success, details = {}) {
    const message = `${characterName} consistency ${success ? 'maintained' : 'issues detected'}`;
    
    // Route to DebugLogger instead of console
    const emoji = success ? '✅' : '⚠️';
    const logMessage = `${emoji} [CHARACTER CONSISTENCY] ${characterName} consistency ${success ? 'maintained' : 'issues detected'}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('story', logMessage, { characterName, consistencyData, success, details });
    }

    this.logSecondaryCharacterProcessing('CONSISTENCY_CHECK', {
      ...details,
      characterName,
      consistencyData,
      consistencyScore: success ? 1.0 : 0.5,
      processingSuccess: success
    });
  }

  // ============= ERROR RECOVERY LOGGING =============

  // Log error recovery attempts and outcomes
  logErrorRecovery(event, details = {}) {
    const message = `Error recovery event: ${event}`;
    const errorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
      errorType: details.errorType || 'unknown',
      errorMessage: details.error?.message || details.errorMessage || 'unknown',
      recoveryAttempt: details.recoveryAttempt || 1,
      recoveryMethod: details.recoveryMethod || 'unknown',
      recoverySuccess: details.recoverySuccess || false,
      fallbackTier: details.fallbackTier || null,
      processingTime: details.processingTime || 0
    };

    this.addLog('ERROR_RECOVERY', errorLog);
    
    // Route to DebugLogger instead of console
    const emoji = this.getErrorRecoveryEmoji(event);
    const logMessage = `${emoji} [ERROR RECOVERY] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      globalThis.debugLogger.log('error', logMessage, details);
    }
  }

  // ============= PERFORMANCE LOGGING =============

  // Log performance metrics and timing data
  logPerformance(event, details = {}) {
    const message = `Performance event: ${event}`;
    const performanceLog = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
      duration: details.duration || 0,
      memoryUsage: details.memoryUsage || 0,
      tier: details.tier || 'unknown',
      operationType: details.operationType || 'unknown',
      success: details.success !== false,
      errorCount: details.errorCount || 0
    };

    this.addLog('PERFORMANCE_MONITORING', performanceLog);
    
    // Route to DebugLogger instead of console
    const emoji = details.duration && details.duration > 5000 ? '🐌' : '⚡';
    const logMessage = `${emoji} [PERFORMANCE] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      if (details.duration && details.duration > 5000) {
        globalThis.debugLogger.warn('performance', `${logMessage} - SLOW OPERATION`, details);
      } else {
        globalThis.debugLogger.log('performance', logMessage, details);
      }
    }
  }

  // ============= DATA FLOW LOGGING =============

  // Log data flow validation and optimization events
  logDataFlow(event, details = {}) {
    const message = `Data flow event: ${event}`;
    const dataFlowLog = {
      id: `data-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      sessionId: details.sessionId || 'unknown',
      dataSize: details.dataSize || 0,
      compressionRatio: details.compressionRatio || 1,
      validationStatus: details.validationStatus || 'unknown',
      optimizationApplied: details.optimizationApplied || false,
      dataLoss: details.dataLoss || false,
      processingTime: details.processingTime || 0
    };

    this.addLog('DATA_FLOW_VALIDATION', dataFlowLog);
    
    // Route to DebugLogger instead of console
    const emoji = this.getDataFlowEmoji(event);
    const logMessage = `${emoji} [DATA FLOW] ${message}`;
    
    // Send to debug system only, not console
    if (typeof globalThis !== 'undefined' && globalThis.debugLogger) {
      if (details.dataLoss || details.validation === 'failed') {
        globalThis.debugLogger.warn('network', `${logMessage} - DATA INTEGRITY ISSUE`, details);
      } else {
        globalThis.debugLogger.log('network', logMessage, details);
      }
    }
  }

  // ============= SERVICE HEALTH LOGGING =============

  // Log service health monitoring events
  logServiceHealth(event, details = {}) {
    const message = `Service health event: ${event}`;
    const healthLog = {
      id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      serviceName: details.serviceName || 'unknown',
      status: details.status || 'unknown',
      responseTime: details.responseTime || 0,
      errorRate: details.errorRate || 0,
      availability: details.availability || 100,
      lastHealthCheck: details.lastHealthCheck || Date.now()
    };

    this.addLog('SERVICE_HEALTH_MONITORING', healthLog);
    
    // Route to DebugLogger instead of console  
    const emoji = this.getServiceHealthEmoji(event);
    const logMessage = `${emoji} [SERVICE HEALTH] ${message}`;
    
    // Keep critical service alerts on console
    if (details.status === 'unhealthy' || details.status === 'degraded') {
      globalThis.debugLogger.error('error', `${logMessage} - SERVICE ALERT`, details);
    } else {
      globalThis.debugLogger.log('network', logMessage, details);
    }
  }

  // ============= LOG MANAGEMENT =============

  // Add log entry to specific category
  addLog(category, logEntry) {
    if (!this.logs.has(category)) {
      this.logs.set(category, []);
    }

    const categoryLogs = this.logs.get(category);
    categoryLogs.push(logEntry);

    // Maintain max logs per category
    if (categoryLogs.length > this.maxLogsPerCategory) {
      categoryLogs.shift(); // Remove oldest log
    }
  }

  // Generic event logging method
  logEvent(category, event, message, details = {}) {
    const logEntry = {
      id: `${category.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event: event,
      message: message,
      details: details
    };

    this.addLog(category, logEntry);
  }

  // ============= LOG RETRIEVAL =============

  // Get logs by category
  getLogsByCategory(category, limit = 50) {
    const logs = this.logs.get(category) || [];
    return limit ? logs.slice(-limit) : logs;
  }

  // Get recent logs across all categories
  getRecentLogs(limit = 100) {
    const allLogs = [];
    
    for (const [category, logs] of this.logs) {
      logs.forEach(log => {
        allLogs.push({ ...log, category });
      });
    }
    
    return allLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get logging statistics
  getLoggingStats() {
    const stats = {
      totalLogs: 0,
      categoryCounts: {},
      recentActivity: {
        lastHour: 0,
        lastMinute: 0
      }
    };

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneMinuteAgo = now - (60 * 1000);

    for (const [category, logs] of this.logs) {
      stats.totalLogs += logs.length;
      stats.categoryCounts[category] = logs.length;

      logs.forEach(log => {
        if (log.timestamp > oneHourAgo) {
          stats.recentActivity.lastHour++;
        }
        if (log.timestamp > oneMinuteAgo) {
          stats.recentActivity.lastMinute++;
        }
      });
    }

    return stats;
  }

  // Search logs based on criteria
  searchLogs(criteria = {}) {
    const results = [];
    
    for (const [category, logs] of this.logs) {
      const filteredLogs = logs.filter(log => {
        if (criteria.category && category !== criteria.category) {
          return false;
        }
        
        if (criteria.event && log.event !== criteria.event) {
          return false;
        }
        
        if (criteria.timeRange) {
          const { start, end } = criteria.timeRange;
          if (log.timestamp < start || log.timestamp > end) {
            return false;
          }
        }
        
        if (criteria.text) {
          const searchText = criteria.text.toLowerCase();
          const logText = JSON.stringify(log).toLowerCase();
          if (!logText.includes(searchText)) {
            return false;
          }
        }
        
        return true;
      });
      
      filteredLogs.forEach(log => {
        results.push({ ...log, category });
      });
    }
    
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear logs
  clearLogs(category = null) {
    if (category) {
      this.logs.set(category, []);
    } else {
      this.categories.forEach(cat => {
        this.logs.set(cat, []);
      });
    }
  }

  // Export logs
  exportLogs(category = null, format = 'json') {
    const logsToExport = category 
      ? { [category]: this.logs.get(category) || [] }
      : Object.fromEntries(this.logs);

    if (format === 'csv') {
      // Convert to CSV format
      const allLogs = [];
      for (const [cat, logs] of Object.entries(logsToExport)) {
        logs.forEach(log => {
          allLogs.push({ ...log, category: cat });
        });
      }
      
      const headers = ['timestamp', 'category', 'event', 'message'];
      const csvContent = [
        headers.join(','),
        ...allLogs.map(log => [
          log.timestamp,
          log.category,
          log.event,
          `"${JSON.stringify(log).replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(logsToExport, null, 2);
  }

  // ============= EMOJI HELPERS =============

  getEventEmoji(event) {
    const emojiMap = {
      'TIER_SELECTION': '🎯',
      'TIER_EVALUATION': '🔍',
      'TIER_TRANSITION': '🔄',
      'TIER_DEGRADATION': '⬇️',
      'TIER_RECOVERY': '⬆️',
      'ROUTING_DECISION': '🚦',
      'LOAD_BALANCING': '⚖️'
    };
    return emojiMap[event] || '📊';
  }

  getCulturalEmoji(event) {
    const emojiMap = {
      'TRIGGER_DETECTION': '🎯',
      'ENHANCEMENT_APPLIED': '🌈',
      'CULTURAL_MAPPING': '🗺️',
      'AUTHENTICITY_CHECK': '✅',
      'FALLBACK_TRIGGERED': '🔄'
    };
    return emojiMap[event] || '🌍';
  }

  getSecondaryCharacterEmoji(event) {
    const emojiMap = {
      'CHARACTER_DETECTION': '🔍',
      'CONSISTENCY_CHECK': '⚖️',
      'CHARACTER_MAPPING': '🗺️',
      'RELATIONSHIP_ANALYSIS': '🔗',
      'NARRATIVE_INTEGRATION': '📚'
    };
    return emojiMap[event] || '👥';
  }

  getErrorRecoveryEmoji(event) {
    const emojiMap = {
      'ERROR_DETECTED': '🚨',
      'RECOVERY_INITIATED': '🔄',
      'FALLBACK_ACTIVATED': '🛡️',
      'RECOVERY_SUCCESS': '✅',
      'RECOVERY_FAILED': '❌',
      'CIRCUIT_BREAKER_OPEN': '⚡'
    };
    return emojiMap[event] || '🔧';
  }

  getDataFlowEmoji(event) {
    const emojiMap = {
      'DATA_VALIDATION': '✅',
      'COMPRESSION_APPLIED': '🗜️',
      'OPTIMIZATION_SUCCESSFUL': '⚡',
      'DATA_LOSS_DETECTED': '⚠️',
      'INTEGRITY_CHECK': '🔍',
      'FLOW_OPTIMIZATION': '🌊'
    };
    return emojiMap[event] || '📊';
  }

  getServiceHealthEmoji(event) {
    const emojiMap = {
      'HEALTH_CHECK': '❤️',
      'SERVICE_HEALTHY': '✅',
      'SERVICE_DEGRADED': '⚠️',
      'SERVICE_UNHEALTHY': '❌',
      'RECOVERY_INITIATED': '🔄',
      'MONITORING_ACTIVE': '👁️'
    };
    return emojiMap[event] || '🏥';
  }
}

// Export singleton instance
export const comprehensiveLoggingSystem = new ComprehensiveLoggingSystem();
