/**
 * VENDOR BUNDLE: Consolidated ReliabilityManager Stack v1.0.0
 * Created: 2025-10-12
 * 
 * This is a self-contained vendor bundle containing all 5 modules:
 * - ReliabilityManager (orchestration layer)
 * - UniversalLKGCache (Last Known Good cache)
 * - RequestDeduplicator (duplicate request prevention)
 * - EnhancedCircuitBreaker (circuit breaker pattern)
 * - MonitoringService (metrics & alerts)
 * 
 * WHY THIS EXISTS:
 * - Deno Deploy's bundler fails to recursively bundle TypeScript import chains
 * - ReliabilityManager.ts → 4 dependency .ts files = bundling failure
 * - This consolidated bundle bypasses the issue with zero external dependencies
 * - Provides 0ms import time (local vendor bundle)
 * 
 * USAGE: Import via wrapper reliability-manager@1.0.0.mjs
 */

// ============================================================================
// MODULE 1: MonitoringService
// ============================================================================
class MonitoringService {
  static instance = null;
  
  constructor() {
    this.metrics = {
      successCount: 0,
      errorCount: 0,
      responseTimes: [],
      apiCosts: { runware: 0, openai: 0 },
      lastCleanup: Date.now()
    };
    this.METRICS_WINDOW_MS = 3600000; // 1 hour
    this.CLEANUP_INTERVAL_MS = 300000; // 5 minutes
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new MonitoringService();
    }
    return this.instance;
  }

  recordSuccess(responseTimeMs) {
    this.metrics.successCount++;
    this.metrics.responseTimes.push({ time: responseTimeMs, timestamp: Date.now() });
    this.cleanup();
  }

  recordError(responseTimeMs) {
    this.metrics.errorCount++;
    if (responseTimeMs !== undefined) {
      this.metrics.responseTimes.push({ time: responseTimeMs, timestamp: Date.now() });
    }
    this.cleanup();
  }

  recordApiCost(provider, estimatedCost) {
    if (this.metrics.apiCosts[provider] !== undefined) {
      this.metrics.apiCosts[provider] += estimatedCost;
    }
  }

  getMetrics() {
    this.cleanup();
    const totalCalls = this.metrics.successCount + this.metrics.errorCount;
    const errorRate = totalCalls > 0 ? (this.metrics.errorCount / totalCalls) * 100 : 0;
    const avgResponseTime = this.calculateAverageResponseTime();
    const alerts = this.generateAlerts(errorRate, avgResponseTime);

    return {
      errorRate: parseFloat(errorRate.toFixed(2)),
      totalApiCalls: totalCalls,
      averageResponseTimeMs: avgResponseTime,
      estimatedCost: this.metrics.apiCosts.runware + this.metrics.apiCosts.openai,
      alerts
    };
  }

  getDetailedStats() {
    this.cleanup();
    return {
      successCount: this.metrics.successCount,
      errorCount: this.metrics.errorCount,
      totalCalls: this.metrics.successCount + this.metrics.errorCount,
      responseTimes: this.metrics.responseTimes.length,
      apiCosts: { ...this.metrics.apiCosts },
      windowMs: this.METRICS_WINDOW_MS
    };
  }

  reset() {
    this.metrics = {
      successCount: 0,
      errorCount: 0,
      responseTimes: [],
      apiCosts: { runware: 0, openai: 0 },
      lastCleanup: Date.now()
    };
  }

  cleanup() {
    const now = Date.now();
    if (now - this.metrics.lastCleanup < this.CLEANUP_INTERVAL_MS) return;

    const cutoff = now - this.METRICS_WINDOW_MS;
    this.metrics.responseTimes = this.metrics.responseTimes.filter(rt => rt.timestamp > cutoff);
    this.metrics.lastCleanup = now;
  }

  calculateAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sum = this.metrics.responseTimes.reduce((acc, rt) => acc + rt.time, 0);
    return Math.round(sum / this.metrics.responseTimes.length);
  }

  generateAlerts(errorRate, avgResponseTime) {
    const alerts = [];
    
    if (errorRate > 50) {
      alerts.push({
        level: 'critical',
        type: 'high_error_rate',
        message: `Error rate is critically high: ${errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    } else if (errorRate > 25) {
      alerts.push({
        level: 'warning',
        type: 'elevated_error_rate',
        message: `Error rate is elevated: ${errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    if (avgResponseTime > 5000) {
      alerts.push({
        level: 'warning',
        type: 'slow_response',
        message: `Average response time is slow: ${avgResponseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }
}

const monitoringService = MonitoringService.getInstance();

// ============================================================================
// MODULE 2: EnhancedCircuitBreaker
// ============================================================================
class EnhancedCircuitBreaker {
  static circuits = new Map();
  static defaultConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    networkCooldownMs: 30000,
    apiCooldownMs: 60000,
    halfOpenMaxAttempts: 3
  };

  static configure(key, config) {
    const existing = this.circuits.get(key);
    if (existing) {
      Object.assign(existing.config, config);
    } else {
      this.circuits.set(key, {
        state: { 
          isOpen: false, 
          isHalfOpen: false,
          failures: 0, 
          networkFailures: 0,
          apiFailures: 0,
          successes: 0, 
          lastFailure: null,
          lastSuccess: null,
          openedAt: null,
          halfOpenAttempts: 0
        },
        config: { ...this.defaultConfig, ...config }
      });
    }
  }

  static isOpen(key) {
    const circuit = this.circuits.get(key);
    if (!circuit) {
      this.configure(key, {});
      return false;
    }

    const { state, config } = circuit;
    
    if (!state.isOpen) return false;

    const now = Date.now();
    const cooldown = state.networkFailures > state.apiFailures 
      ? config.networkCooldownMs 
      : config.apiCooldownMs;

    if (now - state.openedAt >= cooldown) {
      console.log(`🔄 [CIRCUIT] ${key}: Transitioning to half-open after ${cooldown}ms cooldown`);
      state.isOpen = false;
      state.isHalfOpen = true;
      state.halfOpenAttempts = 0;
      return false;
    }

    return true;
  }

  static recordFailure(key, error) {
    const circuit = this.circuits.get(key);
    if (!circuit) {
      this.configure(key, {});
      return this.recordFailure(key, error);
    }

    const { state, config } = circuit;
    const errorMsg = error?.message?.toLowerCase() || '';
    const isNetworkError = errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('fetch');

    state.failures++;
    if (isNetworkError) state.networkFailures++;
    else state.apiFailures++;
    state.lastFailure = Date.now();
    state.successes = 0;

    if (state.isHalfOpen) {
      console.warn(`⚠️ [CIRCUIT] ${key}: Half-open attempt failed, reopening circuit`);
      state.isOpen = true;
      state.isHalfOpen = false;
      state.openedAt = Date.now();
      return;
    }

    if (state.failures >= config.failureThreshold) {
      console.warn(`🔴 [CIRCUIT] ${key}: OPENED after ${state.failures} failures (network: ${state.networkFailures}, API: ${state.apiFailures})`);
      state.isOpen = true;
      state.openedAt = Date.now();
    }
  }

  static recordSuccess(key) {
    const circuit = this.circuits.get(key);
    if (!circuit) return;

    const { state, config } = circuit;
    state.successes++;
    state.lastSuccess = Date.now();

    if (state.isHalfOpen) {
      state.halfOpenAttempts++;
      if (state.successes >= config.successThreshold) {
        console.log(`✅ [CIRCUIT] ${key}: CLOSED after ${state.successes} successful half-open attempts`);
        this.reset(key);
      }
    } else if (state.isOpen && state.successes >= config.successThreshold) {
      console.log(`✅ [CIRCUIT] ${key}: Progressive recovery - ${state.successes} successes`);
      state.failures = Math.max(0, state.failures - 1);
      if (state.failures === 0) {
        this.reset(key);
      }
    }
  }

  static reset(key) {
    const circuit = this.circuits.get(key);
    if (circuit) {
      circuit.state = {
        isOpen: false,
        isHalfOpen: false,
        failures: 0,
        networkFailures: 0,
        apiFailures: 0,
        successes: 0,
        lastFailure: null,
        lastSuccess: null,
        openedAt: null,
        halfOpenAttempts: 0
      };
    }
  }

  static getStats(key) {
    const circuit = this.circuits.get(key);
    if (!circuit) return null;

    return {
      key,
      isOpen: circuit.state.isOpen,
      isHalfOpen: circuit.state.isHalfOpen,
      failures: circuit.state.failures,
      networkFailures: circuit.state.networkFailures,
      apiFailures: circuit.state.apiFailures,
      successes: circuit.state.successes,
      lastFailure: circuit.state.lastFailure,
      lastSuccess: circuit.state.lastSuccess,
      config: circuit.config
    };
  }

  static getAllStats() {
    const stats = {};
    for (const [key, circuit] of this.circuits.entries()) {
      stats[key] = {
        isOpen: circuit.state.isOpen,
        isHalfOpen: circuit.state.isHalfOpen,
        failures: circuit.state.failures,
        networkFailures: circuit.state.networkFailures,
        apiFailures: circuit.state.apiFailures,
        successes: circuit.state.successes
      };
    }
    return stats;
  }

  static async execute(key, operation, options = {}) {
    if (this.isOpen(key)) {
      console.warn(`🔴 [CIRCUIT] ${key}: Circuit is OPEN`);
      if (options.onCircuitOpen) {
        return await options.onCircuitOpen();
      }
      throw new Error(`Circuit breaker open for ${key}`);
    }

    if (options.beforeAttempt) {
      options.beforeAttempt();
    }

    try {
      const result = await operation();
      this.recordSuccess(key);
      return result;
    } catch (error) {
      this.recordFailure(key, error);
      throw error;
    }
  }
}

// ============================================================================
// MODULE 3: RequestDeduplicator
// ============================================================================
class RequestDeduplicator {
  static inFlight = new Map();
  static stats = {
    totalRequests: 0,
    duplicatesAvoided: 0,
    activeRequests: 0
  };

  static async deduplicate(key, operation, timeoutMs = 30000) {
    this.stats.totalRequests++;

    if (this.inFlight.has(key)) {
      this.stats.duplicatesAvoided++;
      const existing = this.inFlight.get(key);
      existing.joinCount++;
      console.log(`♻️ [DEDUPE] Joining existing request: ${key} (${existing.joinCount} joiners)`);
      return await existing.promise;
    }

    console.log(`🆕 [DEDUPE] Starting new request: ${key}`);
    this.stats.activeRequests++;

    const promise = this.executeWithTimeout(operation, timeoutMs);
    const requestHash = this.generateHash(key);

    this.inFlight.set(key, {
      promise,
      startTime: Date.now(),
      joinCount: 0,
      requestHash
    });

    try {
      const result = await promise;
      return result;
    } finally {
      this.inFlight.delete(key);
      this.stats.activeRequests--;
      console.log(`✅ [DEDUPE] Completed request: ${key}`);
    }
  }

  static async executeWithTimeout(operation, timeoutMs) {
    return Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  }

  static generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  static createKey(params) {
    const parts = [
      params.functionName,
      params.sessionId || 'no-session',
      params.pageNumber?.toString() || '',
      params.content?.substring(0, 50) || '',
      params.prompt?.substring(0, 50) || ''
    ];
    return parts.filter(Boolean).join(':');
  }

  static getStats() {
    return {
      totalRequests: this.stats.totalRequests,
      duplicatesAvoided: this.stats.duplicatesAvoided,
      activeRequests: this.stats.activeRequests,
      deduplicationRate: this.stats.totalRequests > 0 
        ? ((this.stats.duplicatesAvoided / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  static cancelAll() {
    this.inFlight.clear();
    this.stats.activeRequests = 0;
  }

  static resetStats() {
    this.stats = {
      totalRequests: 0,
      duplicatesAvoided: 0,
      activeRequests: 0
    };
  }

  static isInFlight(key) {
    return this.inFlight.has(key);
  }

  static getRequestInfo(key) {
    const req = this.inFlight.get(key);
    if (!req) return null;
    return {
      key,
      startTime: req.startTime,
      joinCount: req.joinCount,
      requestHash: req.requestHash,
      elapsedMs: Date.now() - req.startTime
    };
  }
}

// ============================================================================
// MODULE 4: UniversalLKGCache
// ============================================================================
class UniversalLKGCache {
  static cache = new Map();
  static MAX_ENTRIES = 500;
  static VALIDITY_WINDOW_MS = 900000; // 15 minutes

  static createRequestHash(payload) {
    const str = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  static evict() {
    if (this.cache.size < this.MAX_ENTRIES) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      if (a[1].quality !== b[1].quality) {
        const qualityOrder = { low: 0, medium: 1, high: 2 };
        return qualityOrder[a[1].quality] - qualityOrder[b[1].quality];
      }
      return a[1].successCount - b[1].successCount;
    });

    const toRemove = Math.floor(this.MAX_ENTRIES * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`🗑️ [LKG] Evicted ${toRemove} entries (quality-based)`);
  }

  static getLKG(requestHash, functionName) {
    const entry = this.cache.get(requestHash);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.VALIDITY_WINDOW_MS) {
      this.cache.delete(requestHash);
      return null;
    }

    entry.successCount++;
    console.log(`✅ [LKG] Cache hit: ${functionName} (quality: ${entry.quality}, age: ${Math.round(age/1000)}s, uses: ${entry.successCount})`);

    return {
      ...entry.data,
      _lkgMeta: {
        cached: true,
        tier: entry.tier,
        age: Math.round(age / 1000),
        quality: entry.quality,
        functionName: entry.functionName
      }
    };
  }

  static setLKG(requestHash, data, tier, quality, functionName) {
    this.evict();

    const existing = this.cache.get(requestHash);
    if (existing) {
      existing.data = data;
      existing.timestamp = Date.now();
      existing.tier = tier;
      existing.quality = quality;
      existing.successCount++;
      console.log(`🔄 [LKG] Updated cache: ${functionName} (quality: ${quality})`);
    } else {
      this.cache.set(requestHash, {
        data,
        timestamp: Date.now(),
        requestHash,
        tier,
        quality,
        successCount: 1,
        functionName
      });
      console.log(`💾 [LKG] New cache entry: ${functionName} (quality: ${quality})`);
    }
  }

  static warmFromSuccess(requestHash, data, tier, functionName) {
    const existing = this.cache.get(requestHash);
    let quality = 'medium';

    if (existing) {
      if (existing.successCount >= 5) quality = 'high';
      else if (existing.successCount >= 2) quality = 'medium';
    }

    this.setLKG(requestHash, data, tier, quality, functionName);
  }

  static getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    const byQuality = { high: 0, medium: 0, low: 0 };
    const byFunction = {};
    let totalAge = 0;
    let totalUseCount = 0;

    entries.forEach(entry => {
      byQuality[entry.quality]++;
      byFunction[entry.functionName] = (byFunction[entry.functionName] || 0) + 1;
      totalAge += now - entry.timestamp;
      totalUseCount += entry.successCount;
    });

    return {
      totalEntries: this.cache.size,
      byQuality,
      byFunction,
      averageAge: entries.length > 0 ? Math.round(totalAge / entries.length / 1000) : 0,
      averageUseCount: entries.length > 0 ? Math.round(totalUseCount / entries.length) : 0
    };
  }

  static clear() {
    this.cache.clear();
    console.log('🗑️ [LKG] Cache cleared');
  }
}

// ============================================================================
// MODULE 5: ReliabilityManager (Orchestration Layer)
// ============================================================================
class ReliabilityManager {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ReliabilityManager();
    }
    return this.instance;
  }

  async executeResilient(operationKey, operation, options) {
    const startTime = Date.now();
    
    try {
      const circuitKey = `${options.functionName}:${options.tier || 'default'}`;
      
      const dedupKey = RequestDeduplicator.createKey({
        functionName: options.functionName,
        sessionId: options.sessionId,
        content: operationKey
      });

      const requestHash = UniversalLKGCache.createRequestHash({ operationKey });
      const cachedResult = UniversalLKGCache.getLKG(requestHash, options.functionName);
      
      if (cachedResult) {
        console.log(`♻️ [RELIABILITY] LKG cache hit for ${options.functionName}`);
        monitoringService.recordSuccess(Date.now() - startTime);
        return cachedResult;
      }

      const result = await EnhancedCircuitBreaker.execute(
        circuitKey,
        async () => {
          return await RequestDeduplicator.deduplicate(
            dedupKey,
            operation,
            options.timeout
          );
        },
        {
          onCircuitOpen: async () => {
            const lkg = UniversalLKGCache.getLKG(requestHash, options.functionName);
            if (lkg) {
              console.log(`🔄 [RELIABILITY] Circuit open, using LKG for ${options.functionName}`);
              return lkg;
            }
            throw new Error('Circuit open and no LKG available');
          }
        }
      );

      UniversalLKGCache.warmFromSuccess(
        requestHash,
        result,
        options.tier || 'unknown',
        options.functionName
      );

      monitoringService.recordSuccess(Date.now() - startTime);
      return result;

    } catch (error) {
      monitoringService.recordError(Date.now() - startTime);
      throw error;
    }
  }

  getHealthDashboard() {
    return {
      timestamp: new Date().toISOString(),
      lkgCache: UniversalLKGCache.getStats(),
      deduplication: RequestDeduplicator.getStats(),
      circuitBreakers: EnhancedCircuitBreaker.getAllStats(),
      monitoring: monitoringService.getMetrics()
    };
  }

  emergencyReset(reason) {
    console.log(`🚨 [RELIABILITY] Emergency reset triggered: ${reason}`);
    UniversalLKGCache.clear();
    RequestDeduplicator.cancelAll();
    RequestDeduplicator.resetStats();
    monitoringService.reset();
  }
}

const reliabilityManager = ReliabilityManager.getInstance();

// ============================================================================
// EXPORTS
// ============================================================================
export { 
  reliabilityManager,
  ReliabilityManager,
  UniversalLKGCache,
  RequestDeduplicator,
  EnhancedCircuitBreaker,
  MonitoringService,
  monitoringService
};
