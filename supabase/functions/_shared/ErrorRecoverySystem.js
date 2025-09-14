// ============= ERROR RECOVERY SYSTEM =============
// Phase 6: Comprehensive error handling with progressive degradation
// Ensures system never completely fails through intelligent fallback mechanisms

export class ErrorRecoverySystem {
  constructor() {
    this.errorHistory = new Map();
    this.recoveryStrategies = new Map();
    this.circuitBreakers = new Map();
    this.degradationLevels = ['OPTIMAL', 'DEGRADED', 'MINIMAL', 'EMERGENCY'];
    this.currentDegradationLevel = 'OPTIMAL';
    this.initializeRecoveryStrategies();
  }

  // ============= ERROR RECOVERY STRATEGIES =============

  // Initialize recovery strategies for different error types
  initializeRecoveryStrategies() {
    this.recoveryStrategies.set('NETWORK_ERROR', {
      strategy: 'RETRY_WITH_BACKOFF',
      maxRetries: 3,
      backoffMs: 1000,
      fallback: 'USE_CACHED_DATA'
    });

    this.recoveryStrategies.set('SERVICE_UNAVAILABLE', {
      strategy: 'CIRCUIT_BREAKER',
      threshold: 5,
      timeoutMs: 30000,
      fallback: 'DEGRADE_TO_LOWER_TIER'
    });

    this.recoveryStrategies.set('VALIDATION_ERROR', {
      strategy: 'DATA_NORMALIZATION',
      fallback: 'USE_DEFAULT_VALUES'
    });

    this.recoveryStrategies.set('AI_SERVICE_ERROR', {
      strategy: 'PROGRESSIVE_TIER_DEGRADATION',
      fallback: 'NUCLEAR_TEMPLATE'
    });

    this.recoveryStrategies.set('TIMEOUT_ERROR', {
      strategy: 'IMMEDIATE_FALLBACK',
      fallback: 'CACHED_OR_EMERGENCY'
    });

    console.log('✅ Phase 6: Error recovery strategies initialized');
  }

  // ============= PROGRESSIVE DEGRADATION SYSTEM =============

  // Handle error with progressive degradation
  async handleError(error, context = {}) {
    console.log(`🚨 Phase 6: Handling error - ${error.message}`);
    
    const errorType = this.classifyError(error);
    const errorKey = `${context.service || 'unknown'}-${errorType}`;
    
    // Update error history
    this.updateErrorHistory(errorKey, error, context);
    
    // Check if circuit breaker should be activated
    const circuitBreakerStatus = this.checkCircuitBreaker(errorKey);
    if (circuitBreakerStatus.open) {
      console.log(`🔌 Phase 6: Circuit breaker OPEN for ${errorKey}`);
      return this.executeEmergencyFallback(context);
    }

    // Get recovery strategy
    const strategy = this.recoveryStrategies.get(errorType) || this.getDefaultStrategy();
    
    console.log(`🔧 Phase 6: Applying recovery strategy: ${strategy.strategy}`);
    
    try {
      switch (strategy.strategy) {
        case 'RETRY_WITH_BACKOFF':
          return await this.retryWithBackoff(error, context, strategy);
        
        case 'CIRCUIT_BREAKER':
          return await this.handleCircuitBreakerStrategy(error, context, strategy, errorKey);
        
        case 'DATA_NORMALIZATION':
          return await this.handleDataNormalization(error, context, strategy);
        
        case 'PROGRESSIVE_TIER_DEGRADATION':
          return await this.handleProgressiveDegradation(error, context);
        
        case 'IMMEDIATE_FALLBACK':
          return await this.handleImmediateFallback(error, context, strategy);
        
        default:
          return await this.handleDefaultRecovery(error, context);
      }
    } catch (recoveryError) {
      console.error(`❌ Phase 6: Recovery strategy failed:`, recoveryError);
      return this.executeEmergencyFallback(context);
    }
  }

  // Classify error type for appropriate strategy selection
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout') || message.includes('deadline')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('unavailable') || message.includes('503') || message.includes('502')) {
      return 'SERVICE_UNAVAILABLE';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('ai') || message.includes('openai') || message.includes('enhancement')) {
      return 'AI_SERVICE_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  // ============= RECOVERY STRATEGY IMPLEMENTATIONS =============

  // Retry with exponential backoff
  async retryWithBackoff(error, context, strategy) {
    const { maxRetries = 3, backoffMs = 1000 } = strategy;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Phase 6: Retry attempt ${attempt}/${maxRetries}`);
      
      try {
        if (context.retryFunction) {
          const result = await context.retryFunction();
          console.log(`✅ Phase 6: Retry successful on attempt ${attempt}`);
          return { success: true, result, recoveryMethod: 'retry_with_backoff' };
        }
      } catch (retryError) {
        if (attempt === maxRetries) {
          console.log(`❌ Phase 6: All retry attempts failed, executing fallback`);
          return this.executeFallback(strategy.fallback, context, error);
        }
        
        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await this.delay(delay);
      }
    }
  }

  // Handle circuit breaker strategy
  async handleCircuitBreakerStrategy(error, context, strategy, errorKey) {
    const circuitBreaker = this.circuitBreakers.get(errorKey) || {
      failures: 0,
      lastFailure: null,
      state: 'CLOSED'
    };

    circuitBreaker.failures += 1;
    circuitBreaker.lastFailure = Date.now();

    if (circuitBreaker.failures >= strategy.threshold) {
      circuitBreaker.state = 'OPEN';
      console.log(`🔌 Phase 6: Circuit breaker OPENED for ${errorKey}`);
      
      // Set timeout for circuit breaker reset
      setTimeout(() => {
        circuitBreaker.state = 'HALF_OPEN';
        console.log(`🔌 Phase 6: Circuit breaker HALF-OPEN for ${errorKey}`);
      }, strategy.timeoutMs);
    }

    this.circuitBreakers.set(errorKey, circuitBreaker);
    
    return this.executeFallback(strategy.fallback, context, error);
  }

  // Handle data normalization recovery
  async handleDataNormalization(error, context, strategy) {
    console.log(`🔧 Phase 6: Attempting data normalization recovery`);
    
    try {
      if (context.normalizeFunction) {
        const normalizedData = await context.normalizeFunction(context.data);
        console.log(`✅ Phase 6: Data normalization successful`);
        return { 
          success: true, 
          result: normalizedData, 
          recoveryMethod: 'data_normalization' 
        };
      }
    } catch (normalizationError) {
      console.log(`❌ Phase 6: Data normalization failed`);
    }
    
    return this.executeFallback(strategy.fallback, context, error);
  }

  // Handle progressive tier degradation
  async handleProgressiveDegradation(error, context) {
    console.log(`🔧 Phase 6: Implementing progressive tier degradation`);
    
    const currentTier = context.currentTier || '1';
    const nextTier = this.getNextDegradationTier(currentTier);
    
    if (!nextTier) {
      console.log(`❌ Phase 6: No further degradation possible from tier ${currentTier}`);
      return this.executeEmergencyFallback(context);
    }

    console.log(`🔻 Phase 6: Degrading from tier ${currentTier} to ${nextTier}`);
    
    try {
      if (context.degradationFunction) {
        const result = await context.degradationFunction(nextTier);
        console.log(`✅ Phase 6: Tier degradation successful to ${nextTier}`);
        return { 
          success: true, 
          result, 
          recoveryMethod: 'tier_degradation',
          newTier: nextTier 
        };
      }
    } catch (degradationError) {
      console.log(`❌ Phase 6: Tier degradation failed`);
    }

    return this.executeEmergencyFallback(context);
  }

  // Handle immediate fallback
  async handleImmediateFallback(error, context, strategy) {
    console.log(`🔧 Phase 6: Executing immediate fallback`);
    return this.executeFallback(strategy.fallback, context, error);
  }

  // Handle default recovery
  async handleDefaultRecovery(error, context) {
    console.log(`🔧 Phase 6: Executing default recovery`);
    return this.executeEmergencyFallback(context);
  }

  // ============= FALLBACK EXECUTION =============

  // Execute specific fallback strategy
  async executeFallback(fallbackType, context, error) {
    console.log(`🛡️ Phase 6: Executing fallback: ${fallbackType}`);
    
    switch (fallbackType) {
      case 'USE_CACHED_DATA':
        return await this.useCachedData(context);
      
      case 'DEGRADE_TO_LOWER_TIER':
        return await this.degradeToLowerTier(context);
      
      case 'USE_DEFAULT_VALUES':
        return await this.useDefaultValues(context);
      
      case 'NUCLEAR_TEMPLATE':
        return await this.useNuclearTemplate(context);
      
      case 'CACHED_OR_EMERGENCY':
        return await this.useCachedOrEmergency(context);
      
      default:
        return this.executeEmergencyFallback(context);
    }
  }

  // Use cached data fallback
  async useCachedData(context) {
    if (context.cache && context.cacheKey) {
      const cachedData = context.cache.get(context.cacheKey);
      if (cachedData) {
        console.log(`✅ Phase 6: Using cached data fallback`);
        return { 
          success: true, 
          result: cachedData, 
          recoveryMethod: 'cached_data' 
        };
      }
    }
    
    return this.executeEmergencyFallback(context);
  }

  // Degrade to lower tier fallback
  async degradeToLowerTier(context) {
    const currentTier = context.currentTier || '1';
    const nextTier = this.getNextDegradationTier(currentTier);
    
    if (nextTier && context.degradationFunction) {
      try {
        const result = await context.degradationFunction(nextTier);
        console.log(`✅ Phase 6: Successfully degraded to tier ${nextTier}`);
        return { 
          success: true, 
          result, 
          recoveryMethod: 'tier_degradation',
          newTier: nextTier 
        };
      } catch (error) {
        console.log(`❌ Phase 6: Tier degradation failed`);
      }
    }
    
    return this.executeEmergencyFallback(context);
  }

  // Use default values fallback
  async useDefaultValues(context) {
    if (context.defaultValues) {
      console.log(`✅ Phase 6: Using default values fallback`);
      return { 
        success: true, 
        result: context.defaultValues, 
        recoveryMethod: 'default_values' 
      };
    }
    
    return this.executeEmergencyFallback(context);
  }

  // Use nuclear template fallback
  async useNuclearTemplate(context) {
    const nuclearResult = {
      imageURL: '/placeholder-image.svg',
      success: true,
      tier: 'NUCLEAR',
      templateType: 'emergency-nuclear',
      message: 'Emergency fallback activated'
    };
    
    console.log(`☢️ Phase 6: Nuclear template fallback activated`);
    return { 
      success: true, 
      result: nuclearResult, 
      recoveryMethod: 'nuclear_template' 
    };
  }

  // Use cached or emergency fallback
  async useCachedOrEmergency(context) {
    // Try cached data first
    const cachedResult = await this.useCachedData(context);
    if (cachedResult.success) {
      return cachedResult;
    }
    
    // Fall back to emergency
    return this.executeEmergencyFallback(context);
  }

  // ============= EMERGENCY FALLBACK =============

  // Execute emergency fallback (guaranteed to never fail)
  executeEmergencyFallback(context) {
    console.log(`🚨 Phase 6: EMERGENCY FALLBACK ACTIVATED`);
    
    const emergencyResult = {
      success: true,
      imageURL: '/emergency-placeholder.svg',
      tier: 'EMERGENCY',
      message: 'System in emergency mode - basic functionality maintained',
      timestamp: new Date().toISOString(),
      context: context.service || 'unknown'
    };

    return {
      success: true,
      result: emergencyResult,
      recoveryMethod: 'emergency_fallback'
    };
  }

  // ============= UTILITY FUNCTIONS =============

  // Get next degradation tier
  getNextDegradationTier(currentTier) {
    const tierMap = {
      '1': '2.5A',
      '2.5A': '2.5B',
      '2.5B': '2.5C', 
      '2.5C': '2.5D',
      '2.5D': null // No further degradation
    };
    
    return tierMap[currentTier] || null;
  }

  // Check circuit breaker status
  checkCircuitBreaker(errorKey) {
    const circuitBreaker = this.circuitBreakers.get(errorKey);
    
    if (!circuitBreaker) {
      return { open: false, state: 'CLOSED' };
    }
    
    // Auto-reset circuit breaker if in HALF_OPEN state and enough time passed
    if (circuitBreaker.state === 'HALF_OPEN') {
      circuitBreaker.failures = 0;
      circuitBreaker.state = 'CLOSED';
      this.circuitBreakers.set(errorKey, circuitBreaker);
      console.log(`🔌 Phase 6: Circuit breaker RESET for ${errorKey}`);
    }
    
    return { 
      open: circuitBreaker.state === 'OPEN',
      state: circuitBreaker.state 
    };
  }

  // Update error history
  updateErrorHistory(errorKey, error, context) {
    const history = this.errorHistory.get(errorKey) || [];
    
    history.push({
      timestamp: Date.now(),
      error: error.message,
      context: context.service || 'unknown',
      stack: error.stack?.split('\n')[0] || 'no-stack'
    });
    
    // Keep only last 10 errors per key
    if (history.length > 10) {
      history.shift();
    }
    
    this.errorHistory.set(errorKey, history);
  }

  // Get default recovery strategy
  getDefaultStrategy() {
    return {
      strategy: 'IMMEDIATE_FALLBACK',
      fallback: 'CACHED_OR_EMERGENCY'
    };
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============= SYSTEM HEALTH MONITORING =============

  // Get error recovery statistics
  getRecoveryStats() {
    const stats = {
      totalErrors: 0,
      errorsByType: {},
      circuitBreakerStatus: {},
      recentErrors: []
    };

    // Process error history
    for (const [key, history] of this.errorHistory.entries()) {
      stats.totalErrors += history.length;
      stats.errorsByType[key] = history.length;
      stats.recentErrors.push(...history.slice(-3).map(h => ({ key, ...h })));
    }

    // Process circuit breakers
    for (const [key, breaker] of this.circuitBreakers.entries()) {
      stats.circuitBreakerStatus[key] = breaker.state;
    }

    return stats;
  }

  // Clear error history (for memory management)
  clearErrorHistory() {
    this.errorHistory.clear();
    this.circuitBreakers.clear();
    console.log('🧹 Phase 6: Error recovery history cleared');
  }

  // Get current system degradation level
  getCurrentDegradationLevel() {
    return this.currentDegradationLevel;
  }

  // Set system degradation level
  setDegradationLevel(level) {
    if (this.degradationLevels.includes(level)) {
      this.currentDegradationLevel = level;
      console.log(`📊 Phase 6: System degradation level set to ${level}`);
    }
  }
}

// Create singleton instance
export const errorRecoverySystem = new ErrorRecoverySystem();
