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
    
    // Get real cost data from database instead of memory
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's cost data
    const today = new Date().toISOString().split('T')[0];
    const { data: costData, error: costError } = await supabaseClient
      .from('cost_tracking')
      .select('*')
      .gte('timestamp', `${today}T00:00:00Z`)
      .lt('timestamp', `${today}T23:59:59Z`);

    if (costError) {
      throw new Error(`Failed to fetch cost data: ${costError.message}`);
    }

    // Calculate summary from database data
    const totalCost = costData?.reduce((sum, entry) => sum + Number(entry.cost), 0) || 0;
    const totalRequests = costData?.length || 0;
    const totalInputTokens = costData?.reduce((sum, entry) => sum + (entry.input_tokens || 0), 0) || 0;
    const totalOutputTokens = costData?.reduce((sum, entry) => sum + (entry.output_tokens || 0), 0) || 0;

    // Provider and model breakdown
    const providerBreakdown: Record<string, { requests: number; cost: number }> = {};
    const modelBreakdown: Record<string, { requests: number; cost: number }> = {};

    costData?.forEach(entry => {
      // Provider breakdown
      const provider = entry.provider || 'unknown';
      if (!providerBreakdown[provider]) {
        providerBreakdown[provider] = { requests: 0, cost: 0 };
      }
      providerBreakdown[provider].requests++;
      providerBreakdown[provider].cost += Number(entry.cost);

      // Model breakdown
      const model = entry.model_used || 'unknown';
      if (!modelBreakdown[model]) {
        modelBreakdown[model] = { requests: 0, cost: 0 };
      }
      modelBreakdown[model].requests++;
      modelBreakdown[model].cost += Number(entry.cost);
    });

    const DAILY_LIMIT = 5.0; // $5 daily limit
    const summary = {
      date: today,
      totalCost,
      totalRequests,
      totalInputTokens,
      totalOutputTokens,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      modelBreakdown,
      providerBreakdown,
      isLimitExceeded: totalCost > DAILY_LIMIT,
      dailyLimit: DAILY_LIMIT,
      remainingBudget: Math.max(0, DAILY_LIMIT - totalCost)
    };
    
    // Add additional analytics data with real database data
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
        storiesGenerated: Math.floor(summary.totalRequests * 0.6), // Estimate based on operation types
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