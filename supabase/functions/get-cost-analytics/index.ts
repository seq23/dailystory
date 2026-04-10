import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceKey);
    const today = new Date().toISOString().split('T')[0];

    // Today's detailed data
    const { data: todayData, error: todayErr } = await sb
      .from('cost_tracking')
      .select('cost, input_tokens, output_tokens, model_used, provider, operation_type')
      .gte('timestamp', `${today}T00:00:00Z`)
      .lt('timestamp', `${today}T23:59:59Z`);

    if (todayErr) throw new Error(`Today query failed: ${todayErr.message}`);

    // All-time aggregates via daily_usage_stats
    const { data: dailyStats } = await sb.from('daily_usage_stats').select('*');

    // Fallback count
    const { count: totalRows } = await sb
      .from('cost_tracking')
      .select('id', { count: 'exact', head: true });

    const allTimeFromDaily: Record<string, { requests: number; cost: number }> = {};
    let allTimeCost = 0, allTimeRequests = 0, allTimeInputTokens = 0, allTimeOutputTokens = 0;

    (dailyStats || []).forEach((row: any) => {
      const provider = row.provider || 'openai';
      if (!allTimeFromDaily[provider]) allTimeFromDaily[provider] = { requests: 0, cost: 0 };
      allTimeFromDaily[provider].requests += row.call_count || 0;
      allTimeFromDaily[provider].cost += Number(row.estimated_cost || 0);
      allTimeCost += Number(row.estimated_cost || 0);
      allTimeRequests += row.call_count || 0;
      allTimeInputTokens += row.total_input_tokens || 0;
      allTimeOutputTokens += row.total_output_tokens || 0;
    });

    // If daily_usage_stats is empty, paginate cost_tracking
    if (allTimeRequests === 0 && (totalRows || 0) > 0) {
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch } = await sb
          .from('cost_tracking')
          .select('cost, input_tokens, output_tokens, provider, model_used')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('timestamp', { ascending: true });

        if (!batch || batch.length === 0) break;
        batch.forEach((entry: any) => {
          const provider = entry.provider || 'unknown';
          if (!allTimeFromDaily[provider]) allTimeFromDaily[provider] = { requests: 0, cost: 0 };
          allTimeFromDaily[provider].requests++;
          allTimeFromDaily[provider].cost += Number(entry.cost || 0);
          allTimeCost += Number(entry.cost || 0);
          allTimeRequests++;
          allTimeInputTokens += entry.input_tokens || 0;
          allTimeOutputTokens += entry.output_tokens || 0;
        });
        if (batch.length < pageSize) break;
        page++;
      }
    }

    // Build today's summary
    let todayCost = 0, todayInputTokens = 0, todayOutputTokens = 0;
    const modelBreakdown: Record<string, { requests: number; cost: number }> = {};
    const providerBreakdown: Record<string, { requests: number; cost: number }> = {};

    (todayData || []).forEach((e: any) => {
      todayCost += Number(e.cost || 0);
      todayInputTokens += e.input_tokens || 0;
      todayOutputTokens += e.output_tokens || 0;
      const model = e.model_used || 'unknown';
      if (!modelBreakdown[model]) modelBreakdown[model] = { requests: 0, cost: 0 };
      modelBreakdown[model].requests++;
      modelBreakdown[model].cost += Number(e.cost || 0);
      const provider = e.provider || 'unknown';
      if (!providerBreakdown[provider]) providerBreakdown[provider] = { requests: 0, cost: 0 };
      providerBreakdown[provider].requests++;
      providerBreakdown[provider].cost += Number(e.cost || 0);
    });

    const DAILY_LIMIT = 5.0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        costSummary: {
          date: today,
          totalCost: todayCost,
          totalRequests: todayData?.length || 0,
          totalInputTokens: todayInputTokens,
          totalOutputTokens: todayOutputTokens,
          averageCostPerRequest: (todayData?.length || 0) > 0 ? todayCost / todayData!.length : 0,
          modelBreakdown,
          providerBreakdown,
          isLimitExceeded: todayCost > DAILY_LIMIT,
          dailyLimit: DAILY_LIMIT,
          remainingBudget: Math.max(0, DAILY_LIMIT - todayCost),
        },
        totalCostSummary: {
          totalCost: allTimeCost,
          totalRequests: allTimeRequests,
          totalInputTokens: allTimeInputTokens,
          totalOutputTokens: allTimeOutputTokens,
          averageCostPerRequest: allTimeRequests > 0 ? allTimeCost / allTimeRequests : 0,
          providerBreakdown: allTimeFromDaily,
          totalTokens: allTimeInputTokens + allTimeOutputTokens,
          costPerStory: allTimeRequests > 0 ? allTimeCost / Math.max(1, Math.floor(allTimeRequests * 0.8)) : 0,
        },
        timestamp: new Date().toISOString(),
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Cost analytics error:', error);
    return new Response(JSON.stringify({ success: false, error: 'An internal error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
