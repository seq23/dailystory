/**
 * Enhanced Tier Failure Monitoring System
 * Provides comprehensive debug logging, circuit breaker monitoring, and quality gate analysis
 * WITHOUT ANY UI ELEMENTS - Server-side logging only
 */

/**
 * 1. ENHANCED DEBUG LOGGING FOR TIER FAILURE ANALYSIS
 */
class TierFailureLogger {
  static failurePatterns = new Map();
  static recentFailures = [];
  static maxRecentFailures = 100;
  
  static logTierFailure(tier, failureType, context = {}) {
    const timestamp = Date.now();
    const failure = {
      tier,
      failureType,
      timestamp,
      context: this.sanitizeContext(context),
      sessionId: context.sessionId || 'unknown',
      storyId: context.storyId || 'unknown'
    };
    
    // Add to recent failures (ring buffer)
    this.recentFailures.unshift(failure);
    if (this.recentFailures.length > this.maxRecentFailures) {
      this.recentFailures = this.recentFailures.slice(0, this.maxRecentFailures);
    }
    
    // Track failure patterns
    const patternKey = `${tier}_${failureType}`;
    if (!this.failurePatterns.has(patternKey)) {
      this.failurePatterns.set(patternKey, {
        count: 0,
        firstOccurrence: timestamp,
        lastOccurrence: timestamp,
        contexts: []
      });
    }
    
    const pattern = this.failurePatterns.get(patternKey);
    pattern.count++;
    pattern.lastOccurrence = timestamp;
    pattern.contexts.push(this.sanitizeContext(context));
    
    // Keep only last 10 contexts to prevent memory bloat
    if (pattern.contexts.length > 10) {
      pattern.contexts = pattern.contexts.slice(-10);
    }
    
    // Enhanced structured logging
    console.error(`🚨 TIER_FAILURE: ${tier}/${failureType}`, {
      timestamp: new Date(timestamp).toISOString(),
      tier,
      failureType,
      sessionId: failure.sessionId,
      storyId: failure.storyId,
      patternCount: pattern.count,
      context: failure.context,
      frequency: this.calculateFailureFrequency(patternKey)
    });
  }
  
  static sanitizeContext(context) {
    // Remove large data to prevent log bloat
    const sanitized = { ...context };
    if (sanitized.storyText && sanitized.storyText.length > 100) {
      sanitized.storyText = sanitized.storyText.substring(0, 100) + '...';
    }
    if (sanitized.enhancedStoryData) {
      sanitized.enhancedStoryData = '[REDACTED_FOR_LOG_SIZE]';
    }
    return sanitized;
  }
  
  static calculateFailureFrequency(patternKey) {
    const pattern = this.failurePatterns.get(patternKey);
    if (!pattern) return 0;
    
    const timeSpan = pattern.lastOccurrence - pattern.firstOccurrence;
    if (timeSpan === 0) return pattern.count;
    
    // Failures per hour
    return (pattern.count / (timeSpan / (1000 * 60 * 60))).toFixed(2);
  }
  
  static getFailureAnalysis() {
    const analysis = {
      totalPatterns: this.failurePatterns.size,
      recentFailureCount: this.recentFailures.length,
      patterns: {},
      topFailureTypes: [],
      exportTimestamp: new Date().toISOString()
    };
    
    // Convert patterns for analysis
    this.failurePatterns.forEach((data, key) => {
      analysis.patterns[key] = {
        count: data.count,
        frequency: this.calculateFailureFrequency(key),
        firstSeen: new Date(data.firstOccurrence).toISOString(),
        lastSeen: new Date(data.lastOccurrence).toISOString()
      };
    });
    
    // Find top failure types
    const sortedPatterns = Array.from(this.failurePatterns.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5);
    
    analysis.topFailureTypes = sortedPatterns.map(([key, data]) => ({
      pattern: key,
      count: data.count,
      frequency: this.calculateFailureFrequency(key)
    }));
    
    return analysis;
  }
  
  // Log specific tier failure types
  static logTier1OpenAIFailure(error, context) {
    let failureType = 'OPENAI_UNKNOWN_ERROR';
    
    if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
      failureType = 'OPENAI_503_SERVICE_UNAVAILABLE';
    } else if (error.message?.includes('timeout') || error.name === 'AbortError') {
      failureType = 'OPENAI_TIMEOUT';
    } else if (error.message?.includes('Circuit breaker open')) {
      failureType = 'OPENAI_CIRCUIT_BREAKER_OPEN';
    } else if (error.message?.includes('429')) {
      failureType = 'OPENAI_RATE_LIMIT';
    } else if (error.message?.includes('Invalid parameter')) {
      failureType = 'OPENAI_INVALID_PARAMETER';
    }
    
    this.logTierFailure('TIER_1', failureType, {
      ...context,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 200)
    });
  }
  
  static logTier1ValidationFailure(validationResult, context) {
    const failureType = validationResult.useTier2 ? 
      'VALIDATION_QUALITY_TOO_LOW' : 'VALIDATION_REQUIRES_REANALYSIS';
    
    this.logTierFailure('TIER_1', failureType, {
      ...context,
      qualityScore: validationResult.qualityScore,
      mismatches: validationResult.mismatches,
      mismatchCount: validationResult.mismatches?.length || 0
    });
  }
  
  static logTier2ImportFailure(moduleName, error, context) {
    this.logTierFailure('TIER_2', 'MODULE_IMPORT_FAILURE', {
      ...context,
      moduleName,
      errorMessage: error.message
    });
  }
  
  static logTier2EnhancementFailure(error, context) {
    this.logTierFailure('TIER_2', 'AI_ENHANCEMENT_FAILURE', {
      ...context,
      errorMessage: error.message
    });
  }
  
  static logRunwareFailure(error, context) {
    let failureType = 'RUNWARE_UNKNOWN_ERROR';
    
    if (error.message?.includes('503')) {
      failureType = 'RUNWARE_503_SERVICE_UNAVAILABLE';
    } else if (error.message?.includes('timeout')) {
      failureType = 'RUNWARE_TIMEOUT';
    } else if (error.message?.includes('Circuit breaker')) {
      failureType = 'RUNWARE_CIRCUIT_BREAKER_OPEN';
    }
    
    this.logTierFailure('IMAGE_GENERATION', failureType, {
      ...context,
      errorMessage: error.message
    });
  }
}

/**
 * 2. CIRCUIT BREAKER MONITORING & STATE TRACKING
 */
class CircuitBreakerMonitor {
  static serviceStates = new Map();
  static stateHistory = [];
  static maxHistoryEntries = 50;
  
  static trackCircuitBreakerState(serviceName, state, context = {}) {
    const timestamp = Date.now();
    const stateEntry = {
      serviceName,
      state, // 'CLOSED', 'OPEN', 'HALF_OPEN'
      timestamp,
      context: TierFailureLogger.sanitizeContext(context)
    };
    
    // Update current state
    this.serviceStates.set(serviceName, {
      currentState: state,
      lastStateChange: timestamp,
      stateChangeCount: (this.serviceStates.get(serviceName)?.stateChangeCount || 0) + 1,
      context
    });
    
    // Add to history
    this.stateHistory.unshift(stateEntry);
    if (this.stateHistory.length > this.maxHistoryEntries) {
      this.stateHistory = this.stateHistory.slice(0, this.maxHistoryEntries);
    }
    
    // Log state change
    console.log(`🔧 CIRCUIT_BREAKER_STATE: ${serviceName}`, {
      timestamp: new Date(timestamp).toISOString(),
      serviceName,
      newState: state,
      stateChangeCount: this.serviceStates.get(serviceName).stateChangeCount,
      context
    });
    
    // Log critical state changes
    if (state === 'OPEN') {
      console.error(`💥 CRITICAL: Circuit breaker OPENED for ${serviceName}`, {
        timestamp: new Date(timestamp).toISOString(),
        serviceName,
        context
      });
    } else if (state === 'CLOSED') {
      console.log(`✅ RECOVERY: Circuit breaker CLOSED for ${serviceName}`, {
        timestamp: new Date(timestamp).toISOString(),
        serviceName,
        context
      });
    }
  }
  
  static trackServiceHealth(serviceName, healthMetrics) {
    const timestamp = Date.now();
    
    console.log(`📊 SERVICE_HEALTH: ${serviceName}`, {
      timestamp: new Date(timestamp).toISOString(),
      serviceName,
      ...healthMetrics
    });
  }
  
  static getCircuitBreakerAnalysis() {
    const analysis = {
      currentStates: {},
      stateHistory: this.stateHistory.slice(0, 10), // Last 10 state changes
      serviceHealth: {},
      exportTimestamp: new Date().toISOString()
    };
    
    // Current states
    this.serviceStates.forEach((data, serviceName) => {
      analysis.currentStates[serviceName] = {
        state: data.currentState,
        lastChange: new Date(data.lastStateChange).toISOString(),
        changeCount: data.stateChangeCount
      };
    });
    
    return analysis;
  }
}

/**
 * 3. QUALITY GATE ANALYSIS & VALIDATION FAILURE MONITORING
 */
class QualityGateMonitor {
  static qualityMetrics = [];
  static validationFailures = new Map();
  static maxMetricsHistory = 100;
  
  static trackQualityScore(score, context = {}) {
    const timestamp = Date.now();
    const metric = {
      score,
      timestamp,
      sessionId: context.sessionId || 'unknown',
      storyId: context.storyId || 'unknown',
      tier: context.tier || 'unknown',
      context: TierFailureLogger.sanitizeContext(context)
    };
    
    // Add to metrics history
    this.qualityMetrics.unshift(metric);
    if (this.qualityMetrics.length > this.maxMetricsHistory) {
      this.qualityMetrics = this.qualityMetrics.slice(0, this.maxMetricsHistory);
    }
    
    // Log quality score
    const severity = score <= 40 ? 'ERROR' : score <= 70 ? 'WARN' : 'INFO';
    console[severity.toLowerCase()](`📊 QUALITY_SCORE: ${score}/100 (${context.tier || 'unknown'})`, {
      timestamp: new Date(timestamp).toISOString(),
      score,
      severity,
      sessionId: metric.sessionId,
      storyId: metric.storyId,
      tier: metric.tier,
      context: metric.context
    });
  }
  
  static trackValidationFailure(failureType, details, context = {}) {
    const timestamp = Date.now();
    
    if (!this.validationFailures.has(failureType)) {
      this.validationFailures.set(failureType, {
        count: 0,
        firstOccurrence: timestamp,
        lastOccurrence: timestamp,
        examples: []
      });
    }
    
    const failure = this.validationFailures.get(failureType);
    failure.count++;
    failure.lastOccurrence = timestamp;
    failure.examples.push({
      timestamp,
      details,
      context: TierFailureLogger.sanitizeContext(context)
    });
    
    // Keep only last 5 examples
    if (failure.examples.length > 5) {
      failure.examples = failure.examples.slice(-5);
    }
    
    // Log validation failure
    console.warn(`⚠️ VALIDATION_FAILURE: ${failureType}`, {
      timestamp: new Date(timestamp).toISOString(),
      failureType,
      count: failure.count,
      details,
      context
    });
  }
  
  static getQualityAnalysis() {
    const analysis = {
      recentMetrics: this.qualityMetrics.slice(0, 20),
      averageScore: this.calculateAverageScore(),
      scoreDistribution: this.calculateScoreDistribution(),
      validationFailures: {},
      trendAnalysis: this.calculateTrend(),
      exportTimestamp: new Date().toISOString()
    };
    
    // Validation failure analysis
    this.validationFailures.forEach((data, failureType) => {
      analysis.validationFailures[failureType] = {
        count: data.count,
        frequency: this.calculateValidationFailureFrequency(failureType),
        firstSeen: new Date(data.firstOccurrence).toISOString(),
        lastSeen: new Date(data.lastOccurrence).toISOString()
      };
    });
    
    return analysis;
  }
  
  static calculateAverageScore() {
    if (this.qualityMetrics.length === 0) return 0;
    const sum = this.qualityMetrics.reduce((acc, metric) => acc + metric.score, 0);
    return (sum / this.qualityMetrics.length).toFixed(2);
  }
  
  static calculateScoreDistribution() {
    const distribution = { high: 0, medium: 0, low: 0, critical: 0 };
    
    this.qualityMetrics.forEach(metric => {
      if (metric.score >= 80) distribution.high++;
      else if (metric.score >= 60) distribution.medium++;
      else if (metric.score >= 40) distribution.low++;
      else distribution.critical++;
    });
    
    return distribution;
  }
  
  static calculateTrend() {
    if (this.qualityMetrics.length < 10) return 'insufficient_data';
    
    const recent = this.qualityMetrics.slice(0, 10);
    const older = this.qualityMetrics.slice(10, 20);
    
    const recentAvg = recent.reduce((acc, m) => acc + m.score, 0) / recent.length;
    const olderAvg = older.reduce((acc, m) => acc + m.score, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'degrading';
    return 'stable';
  }
  
  static calculateValidationFailureFrequency(failureType) {
    const failure = this.validationFailures.get(failureType);
    if (!failure) return 0;
    
    const timeSpan = failure.lastOccurrence - failure.firstOccurrence;
    if (timeSpan === 0) return failure.count;
    
    // Failures per hour
    return (failure.count / (timeSpan / (1000 * 60 * 60))).toFixed(2);
  }
}

/**
 * UNIFIED MONITORING DASHBOARD DATA EXPORT
 */
class MonitoringDashboard {
  static exportMonitoringData() {
    const data = {
      timestamp: new Date().toISOString(),
      tierFailures: TierFailureLogger.getFailureAnalysis(),
      circuitBreakers: CircuitBreakerMonitor.getCircuitBreakerAnalysis(),
      qualityGates: QualityGateMonitor.getQualityAnalysis(),
      systemHealth: this.getSystemHealthSummary()
    };
    
    console.log('📊 MONITORING_DASHBOARD_EXPORT:', JSON.stringify(data, null, 2));
    return data;
  }
  
  static getSystemHealthSummary() {
    const recentFailures = TierFailureLogger.recentFailures.slice(0, 10);
    const recentQualityScores = QualityGateMonitor.qualityMetrics.slice(0, 10);
    
    return {
      recentFailureCount: recentFailures.length,
      averageRecentQualityScore: recentQualityScores.length > 0 ? 
        (recentQualityScores.reduce((acc, m) => acc + m.score, 0) / recentQualityScores.length).toFixed(2) : 0,
      activeCircuitBreakers: Array.from(CircuitBreakerMonitor.serviceStates.entries())
        .filter(([, state]) => state.currentState === 'OPEN')
        .map(([name]) => name),
      systemStatus: this.calculateOverallSystemStatus()
    };
  }
  
  static calculateOverallSystemStatus() {
    const openCircuitBreakers = Array.from(CircuitBreakerMonitor.serviceStates.values())
      .filter(state => state.currentState === 'OPEN').length;
    
    const recentFailures = TierFailureLogger.recentFailures
      .filter(f => Date.now() - f.timestamp < 5 * 60 * 1000); // Last 5 minutes
    
    const recentQualityScores = QualityGateMonitor.qualityMetrics
      .slice(0, 5)
      .map(m => m.score);
    
    const avgRecentQuality = recentQualityScores.length > 0 ? 
      recentQualityScores.reduce((acc, s) => acc + s, 0) / recentQualityScores.length : 100;
    
    if (openCircuitBreakers > 0 || recentFailures.length > 5 || avgRecentQuality < 50) {
      return 'DEGRADED';
    } else if (recentFailures.length > 2 || avgRecentQuality < 70) {
      return 'WARNING';
    }
    
    return 'HEALTHY';
  }
}

// Export all monitoring classes
export {
  TierFailureLogger,
  CircuitBreakerMonitor,
  QualityGateMonitor,
  MonitoringDashboard
};

// Make available globally for edge functions
if (typeof globalThis !== 'undefined') {
  globalThis.TierFailureLogger = TierFailureLogger;
  globalThis.CircuitBreakerMonitor = CircuitBreakerMonitor;
  globalThis.QualityGateMonitor = QualityGateMonitor;
  globalThis.MonitoringDashboard = MonitoringDashboard;
}
