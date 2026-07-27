import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

// Session IDs that represent internal/system/test traffic — NOT real user activity.
// These are excluded from user-facing totals and shown in a separate "internal" bucket.
// NOTE: 'elevenlabs-session' and 'runware-session' look internal but were actually
// the DEFAULT session IDs used by the legacy logger for real user TTS/image
// generation (pre-Apr 10, 2026). They are real spend and must NOT be filtered out.
const INTERNAL_SESSION_PATTERNS = [
  'elevenlabs-unknown',
  'runware-unknown',
  'cost-report',
  'traffic-alert',
  'system-',
  'test-session',
  'health-check',
];

function isInternalSession(sessionId: string | null): boolean {
  if (!sessionId) return false;
  const lower = sessionId.toLowerCase();
  return INTERNAL_SESSION_PATTERNS.some(p => lower === p || lower.startsWith(p));
}

// ── Historical pricing correction ──
// Pre-Apr 10, 2026 elevenlabs rows reflect the old Turbo v2.5 model with
// NO persistent caching. Per the Time2Read Enterprise Sales Guide v4
// (docs/sales/Time2Read_Enterprise_Sales_Guide_v4.pdf, §9 Optimization
// Changelog): pre-optimization TTS COGS was ~$2.98/student/mo vs.
// post-optimization ~$0.70–$1.10/student/mo. Midpoint ratio:
//   $2.98 / (($0.70 + $1.10)/2) = $2.98 / $0.90 ≈ 3.31×
// We apply this correction at display time only (read-only, no DB writes).
const ELEVENLABS_FLASH_CUTOVER = '2026-04-10T00:00:00Z';
const ELEVENLABS_LEGACY_CORRECTION = 2.98 / 0.90; // ≈ 3.31× (midpoint of sales guide v4 range)

function correctedCost(entry: { cost: number; provider?: string | null; model_used?: string | null; timestamp?: string | null }): number {
  const base = Number(entry.cost || 0);
  if (entry.provider !== 'elevenlabs') return base;
  if (!entry.timestamp || entry.timestamp >= ELEVENLABS_FLASH_CUTOVER) return base;
  // Pre-cutover elevenlabs row → apply correction
  return base * ELEVENLABS_LEGACY_CORRECTION;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceKey);

    // ── Authorization: any signed-in user (or service_role). Admin allow-list removed. ──
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let authorized = token === serviceKey;
    if (!authorized) {
      const { data: { user } } = await sb.auth.getUser(token);
      authorized = !!user;
    }
    if (!authorized) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // ── Today's detailed data ──
    const { data: todayData, error: todayErr } = await sb
      .from('cost_tracking')
      .select('cost, input_tokens, output_tokens, model_used, provider, operation_type, session_id, timestamp')
      .gte('timestamp', `${today}T00:00:00Z`)
      .lt('timestamp', `${today}T23:59:59Z`);

    if (todayErr) throw new Error(`Today query failed: ${todayErr.message}`);

    // ── All-time: paginate cost_tracking for accurate totals ──
    const { count: totalRows } = await sb
      .from('cost_tracking')
      .select('id', { count: 'exact', head: true });

    // Accumulators — user-facing
    const providerTotals: Record<string, { requests: number; cost: number }> = {};
    const operationTotals: Record<string, number> = {};
    let allTimeCost = 0, allTimeRequests = 0, allTimeInputTokens = 0, allTimeOutputTokens = 0;

    // Accumulators — internal/system
    let internalCost = 0, internalRequests = 0;

    if ((totalRows || 0) > 0) {
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch } = await sb
          .from('cost_tracking')
          .select('cost, input_tokens, output_tokens, provider, operation_type, session_id, timestamp')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('timestamp', { ascending: true });

        if (!batch || batch.length === 0) break;
        batch.forEach((entry: any) => {
          const cost = correctedCost(entry);

          if (isInternalSession(entry.session_id)) {
            internalCost += cost;
            internalRequests++;
            return; // skip from user-facing totals
          }

          const provider = entry.provider || 'unknown';
          if (!providerTotals[provider]) providerTotals[provider] = { requests: 0, cost: 0 };
          providerTotals[provider].requests++;
          providerTotals[provider].cost += cost;
          allTimeCost += cost;
          allTimeRequests++;
          allTimeInputTokens += entry.input_tokens || 0;
          allTimeOutputTokens += entry.output_tokens || 0;

          const opType = entry.operation_type || 'unknown';
          operationTotals[opType] = (operationTotals[opType] || 0) + 1;
        });
        if (batch.length < pageSize) break;
        page++;
      }
    }

    // ── Build today's summary (also split internal) ──
    let todayCost = 0, todayInputTokens = 0, todayOutputTokens = 0;
    let todayInternalCost = 0, todayInternalRequests = 0;
    let todayUserRequests = 0;
    const modelBreakdown: Record<string, { requests: number; cost: number }> = {};
    const todayProviderBreakdown: Record<string, { requests: number; cost: number }> = {};
    const todayOperationTotals: Record<string, number> = {};

    (todayData || []).forEach((e: any) => {
      const cost = correctedCost(e);

      if (isInternalSession(e.session_id)) {
        todayInternalCost += cost;
        todayInternalRequests++;
        return;
      }

      todayCost += cost;
      todayUserRequests++;
      todayInputTokens += e.input_tokens || 0;
      todayOutputTokens += e.output_tokens || 0;
      const model = e.model_used || 'unknown';
      if (!modelBreakdown[model]) modelBreakdown[model] = { requests: 0, cost: 0 };
      modelBreakdown[model].requests++;
      modelBreakdown[model].cost += cost;
      const provider = e.provider || 'unknown';
      if (!todayProviderBreakdown[provider]) todayProviderBreakdown[provider] = { requests: 0, cost: 0 };
      todayProviderBreakdown[provider].requests++;
      todayProviderBreakdown[provider].cost += cost;

      const opType = e.operation_type || 'unknown';
      todayOperationTotals[opType] = (todayOperationTotals[opType] || 0) + 1;
    });

    // ── Monthly budget ──
    const MONTHLY_BUDGET = 100.0;
    let monthCost = 0;
    {
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch } = await sb
          .from('cost_tracking')
          .select('cost, session_id, provider, timestamp')
          .gte('timestamp', `${monthStart}T00:00:00Z`)
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (!batch || batch.length === 0) break;
        batch.forEach((e: any) => {
          if (!isInternalSession(e.session_id)) {
            monthCost += correctedCost(e);
          }
        });
        if (batch.length < pageSize) break;
        page++;
      }
    }

    const totalStories = operationTotals['story_generation'] || 0;
    const todayStories = todayOperationTotals['story_generation'] || 0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        costSummary: {
          date: today,
          totalCost: todayCost,
          totalRequests: todayUserRequests,
          totalInputTokens: todayInputTokens,
          totalOutputTokens: todayOutputTokens,
          averageCostPerRequest: todayUserRequests > 0 ? todayCost / todayUserRequests : 0,
          modelBreakdown,
          providerBreakdown: todayProviderBreakdown,
          operationBreakdown: todayOperationTotals,
          storiesGenerated: todayStories,
          monthCost,
          monthBudget: MONTHLY_BUDGET,
          monthRemaining: Math.max(0, MONTHLY_BUDGET - monthCost),
          isMonthlyBudgetExceeded: monthCost > MONTHLY_BUDGET,
          // Internal/system traffic separated out
          internalCost: todayInternalCost,
          internalRequests: todayInternalRequests,
        },
        totalCostSummary: {
          totalCost: allTimeCost,
          totalRequests: allTimeRequests,
          totalInputTokens: allTimeInputTokens,
          totalOutputTokens: allTimeOutputTokens,
          averageCostPerRequest: allTimeRequests > 0 ? allTimeCost / allTimeRequests : 0,
          providerBreakdown: providerTotals,
          operationBreakdown: operationTotals,
          totalStories,
          totalTokens: allTimeInputTokens + allTimeOutputTokens,
          costPerStory: totalStories > 0 ? allTimeCost / totalStories : 0,
          // Internal/system traffic separated out
          internalCost,
          internalRequests,
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