// Real-Time Cost Tracking Utility for OpenAI API Usage
// Implements $5 daily limit with circuit breaker protection

interface CostEntry {
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  modelUsed: string;
  sessionId: string;
}

interface DailyCostCache {
  date: string;
  totalCost: number;
  entries: CostEntry[];
  isCircuitBreakerOpen: boolean;
}

class EdgeCostTracker {
  private static instance: EdgeCostTracker;
  private cache = new Map<string, DailyCostCache>();
  private readonly DAILY_LIMIT = 5.0; // $5 daily limit
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // OpenAI GPT-4o-mini pricing (per 1K tokens)
  private readonly PRICING = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.003, output: 0.006 },
    'gpt-4': { input: 0.03, output: 0.06 }
  };

  private constructor() {}

  static getInstance(): EdgeCostTracker {
    if (!EdgeCostTracker.instance) {
      EdgeCostTracker.instance = new EdgeCostTracker();
    }
    return EdgeCostTracker.instance;
  }

  getCurrentDateKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  getDailyCostCache(): DailyCostCache {
    const dateKey = this.getCurrentDateKey();
    
    if (!this.cache.has(dateKey)) {
      this.cache.set(dateKey, {
        date: dateKey,
        totalCost: 0,
        entries: [],
        isCircuitBreakerOpen: false
      });
    }

    // Clean old cache entries (keep only today's)
    for (const [key, value] of this.cache.entries()) {
      if (key !== dateKey) {
        this.cache.delete(key);
      }
    }

    return this.cache.get(dateKey)!;
  }

  calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing = this.PRICING[model] || this.PRICING['gpt-4o-mini']; // fallback to cheapest
    
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }

  checkDailyLimit(): { canProceed: boolean; remaining: number; currentCost: number } {
    const dailyCache = this.getDailyCostCache();
    
    return {
      canProceed: !dailyCache.isCircuitBreakerOpen && dailyCache.totalCost < this.DAILY_LIMIT,
      remaining: Math.max(0, this.DAILY_LIMIT - dailyCache.totalCost),
      currentCost: dailyCache.totalCost
    };
  }

  trackCost(
    inputTokens: number, 
    outputTokens: number, 
    model: string, 
    sessionId: string
  ): { cost: number; dailyTotal: number; limitExceeded: boolean } {
    const cost = this.calculateCost(inputTokens, outputTokens, model);
    const dailyCache = this.getDailyCostCache();

    const entry: CostEntry = {
      timestamp: Date.now(),
      inputTokens,
      outputTokens,
      cost,
      modelUsed: model,
      sessionId
    };

    dailyCache.entries.push(entry);
    dailyCache.totalCost += cost;

    // Check if daily limit exceeded
    if (dailyCache.totalCost >= this.DAILY_LIMIT) {
      dailyCache.isCircuitBreakerOpen = true;
      console.warn(`🚨 DAILY COST LIMIT EXCEEDED: $${dailyCache.totalCost.toFixed(4)} >= $${this.DAILY_LIMIT}`);
    }

    console.log(`💰 Cost tracked: $${cost.toFixed(4)} (Input: ${inputTokens}, Output: ${outputTokens}, Model: ${model})`);
    console.log(`📊 Daily total: $${dailyCache.totalCost.toFixed(4)} / $${this.DAILY_LIMIT}`);

    return {
      cost,
      dailyTotal: dailyCache.totalCost,
      limitExceeded: dailyCache.isCircuitBreakerOpen
    };
  }

  getDailySummary(): {
    date: string;
    totalCost: number;
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    averageCostPerRequest: number;
    modelBreakdown: Record<string, { requests: number; cost: number }>;
    isLimitExceeded: boolean;
  } {
    const dailyCache = this.getDailyCostCache();
    const modelBreakdown: Record<string, { requests: number; cost: number }> = {};

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const entry of dailyCache.entries) {
      totalInputTokens += entry.inputTokens;
      totalOutputTokens += entry.outputTokens;

      if (!modelBreakdown[entry.modelUsed]) {
        modelBreakdown[entry.modelUsed] = { requests: 0, cost: 0 };
      }
      
      modelBreakdown[entry.modelUsed].requests++;
      modelBreakdown[entry.modelUsed].cost += entry.cost;
    }

    return {
      date: dailyCache.date,
      totalCost: dailyCache.totalCost,
      totalRequests: dailyCache.entries.length,
      totalInputTokens,
      totalOutputTokens,
      averageCostPerRequest: dailyCache.entries.length > 0 ? dailyCache.totalCost / dailyCache.entries.length : 0,
      modelBreakdown,
      isLimitExceeded: dailyCache.isCircuitBreakerOpen
    };
  }

  reset(): void {
    const dateKey = this.getCurrentDateKey();
    this.cache.set(dateKey, {
      date: dateKey,
      totalCost: 0,
      entries: [],
      isCircuitBreakerOpen: false
    });
    console.log('🔄 Daily cost tracker reset');
  }
}

// Export singleton instance and utility functions
export const costTracker = EdgeCostTracker.getInstance();

export const checkDailyLimit = () => costTracker.checkDailyLimit();
export const trackOpenAICost = (inputTokens: number, outputTokens: number, model: string, sessionId: string) => 
  costTracker.trackCost(inputTokens, outputTokens, model, sessionId);
export const getDailyCostSummary = () => costTracker.getDailySummary();
export const resetDailyCostTracker = () => costTracker.reset();
