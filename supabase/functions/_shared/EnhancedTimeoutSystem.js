/**
 * ENHANCED TIMEOUT & RESILIENCE SYSTEM
 * Provides AbortController integration with progressive degradation
 */

export class EnhancedTimeoutSystem {
  constructor() {
    this.activeControllers = new Map();
    this.timeoutCascade = [
      { name: 'quick', timeout: 5000, description: 'Quick response' },
      { name: 'standard', timeout: 15000, description: 'Standard processing' },
      { name: 'extended', timeout: 30000, description: 'Extended processing' },
      { name: 'maximum', timeout: 60000, description: 'Maximum allowed time' }
    ];
  }

  /**
   * Create AbortController with timeout cascade
   */
  createTimeoutController(operationId, timeoutLevel = 'standard') {
    const timeoutConfig = this.timeoutCascade.find(t => t.name === timeoutLevel) || 
                         this.timeoutCascade[1]; // Default to standard
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Operation ${operationId} timed out after ${timeoutConfig.timeout}ms`);
      controller.abort();
    }, timeoutConfig.timeout);

    // Store for cleanup
    this.activeControllers.set(operationId, {
      controller,
      timeoutId,
      config: timeoutConfig,
      startTime: Date.now()
    });

    return {
      signal: controller.signal,
      timeoutConfig,
      cleanup: () => this.cleanup(operationId)
    };
  }

  /**
   * Create cascading timeout for progressive degradation
   */
  createCascadingTimeout(operationId, onTimeout) {
    const controllers = [];
    
    this.timeoutCascade.forEach((config, index) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Cascade timeout ${config.name} reached for ${operationId}`);
        
        if (onTimeout) {
          onTimeout(config.name, index, config.timeout);
        }
        
        controller.abort();
      }, config.timeout);

      controllers.push({ controller, timeoutId, config });
    });

    this.activeControllers.set(operationId, {
      cascadeControllers: controllers,
      startTime: Date.now()
    });

    return {
      signals: controllers.map(c => c.controller.signal),
      cleanup: () => this.cleanup(operationId)
    };
  }

  /**
   * Create timeout with circuit breaker integration
   */
  createCircuitBreakerTimeout(operationId, circuitBreaker) {
    if (circuitBreaker && circuitBreaker.isOpen()) {
      console.warn(`🔌 Circuit breaker open for ${operationId} - failing fast`);
      const failedController = new AbortController();
      failedController.abort();
      return {
        signal: failedController.signal,
        timeoutConfig: { name: 'circuit_breaker', timeout: 0 },
        cleanup: () => {}
      };
    }

    return this.createTimeoutController(operationId, 'quick');
  }

  /**
   * Wrap async operation with timeout and resilience
   */
  async withTimeout(operationId, operation, options = {}) {
    const {
      timeoutLevel = 'standard',
      retries = 0,
      circuitBreaker = null,
      fallback = null
    } = options;

    let lastError = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const attemptId = `${operationId}-attempt-${attempt}`;
      const timeoutControl = this.createTimeoutController(attemptId, timeoutLevel);
      
      try {
        console.log(`🔄 Attempting ${operationId} (attempt ${attempt + 1}/${retries + 1})`);
        
        const result = await operation(timeoutControl.signal);
        timeoutControl.cleanup();
        
        // Record success in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordSuccess();
        }
        
        return result;
        
      } catch (error) {
        timeoutControl.cleanup();
        lastError = error;
        
        // Record failure in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordFailure();
        }
        
        if (error.name === 'AbortError') {
          console.warn(`⏰ ${operationId} timed out on attempt ${attempt + 1}`);
        } else {
          console.warn(`❌ ${operationId} failed on attempt ${attempt + 1}:`, error.message);
        }
        
        // Don't retry if it's the last attempt
        if (attempt === retries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed - try fallback
    if (fallback) {
      console.log(`🆘 ${operationId} failed all attempts - trying fallback`);
      try {
        return await fallback();
      } catch (fallbackError) {
        console.error(`❌ ${operationId} fallback also failed:`, fallbackError.message);
        throw fallbackError;
      }
    }
    
    throw lastError;
  }

  /**
   * Cleanup timeout controllers
   */
  cleanup(operationId) {
    const operation = this.activeControllers.get(operationId);
    if (!operation) return;

    if (operation.timeoutId) {
      clearTimeout(operation.timeoutId);
    }

    if (operation.cascadeControllers) {
      operation.cascadeControllers.forEach(({ timeoutId }) => {
        clearTimeout(timeoutId);
      });
    }

    this.activeControllers.delete(operationId);
  }

  /**
   * Cleanup all active operations
   */
  cleanupAll() {
    for (const [operationId] of this.activeControllers) {
      this.cleanup(operationId);
    }
  }

  /**
   * Get timeout performance metrics
   */
  getMetrics() {
    const activeOperations = this.activeControllers.size;
    const operations = Array.from(this.activeControllers.entries()).map(([id, op]) => ({
      id,
      duration: Date.now() - op.startTime,
      config: op.config?.name || 'cascade'
    }));

    return {
      activeOperations,
      operations,
      cascadeConfig: this.timeoutCascade
    };
  }

  /**
   * Test timeout cascade resilience
   */
  async testTimeoutCascade() {
    console.log('🧪 Testing timeout cascade system...');
    
    const testResults = [];
    
    for (const config of this.timeoutCascade) {
      const testId = `test-${config.name}`;
      const startTime = Date.now();
      
      try {
        await this.withTimeout(testId, async (signal) => {
          // Simulate operation that takes longer than timeout
          await new Promise((resolve, reject) => {
            const delay = config.timeout + 1000; // Exceed timeout
            
            const timer = setTimeout(resolve, delay);
            
            signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new Error('Aborted'));
            });
          });
        }, { timeoutLevel: config.name });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        testResults.push({
          level: config.name,
          expectedTimeout: config.timeout,
          actualDuration: duration,
          timedOut: error.name === 'AbortError' || error.message === 'Aborted',
          success: Math.abs(duration - config.timeout) < 100 // Within 100ms
        });
      }
    }
    
    console.log('🧪 Timeout cascade test results:', testResults);
    return testResults;
  }
}

// Export singleton instance
export const enhancedTimeoutSystem = new EnhancedTimeoutSystem();