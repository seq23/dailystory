import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Real-Time Cost Tracking Utility - Same implementation as backend
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

  // OpenAI pricing (per 1K tokens)
  private readonly PRICING = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.003, output: 0.006 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-5-mini-2025-08-07': { input: 0.0003, output: 0.0012 },
    'gpt-5-2025-08-07': { input: 0.006, output: 0.012 }
  };

  private constructor() {}

  static getInstance(): EdgeCostTracker {
    if (!EdgeCostTracker.instance) {
      EdgeCostTracker.instance = new EdgeCostTracker();
    }
    return EdgeCostTracker.instance;
  }

  getCurrentDateKey(): string {
    return new Date().toISOString().split('T')[0];
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

    return this.cache.get(dateKey)!;
  }

  getDailySummary() {
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
      isLimitExceeded: dailyCache.isCircuitBreakerOpen,
      dailyLimit: this.DAILY_LIMIT,
      remainingBudget: Math.max(0, this.DAILY_LIMIT - dailyCache.totalCost)
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💰 Cost Analytics Request');
    
    const costTracker = EdgeCostTracker.getInstance();
    const summary = costTracker.getDailySummary();
    
    // Add additional analytics data
    const analyticsData = {
      costSummary: summary,
      systemStatus: {
        uptime: "99.9%", // Placeholder
        averageResponseTime: "250ms", // Placeholder  
        errorRate: "0.1%", // Placeholder
        userRating: 4.8 // Placeholder
      },
      usageMetrics: {
        totalUsers: summary.totalRequests, // Using requests as proxy
        storiesGenerated: Math.floor(summary.totalRequests * 0.8), // Estimate
        averageSessionTime: "5m 30s" // Placeholder
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      data: analyticsData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Cost analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});