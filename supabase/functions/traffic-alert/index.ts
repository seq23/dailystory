import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALERT_EMAIL = 'privacy@time2read.com';
const COST_ALERT_THRESHOLD = 100;
const SPIKE_MULTIPLIER = 1.5;
const DROP_MULTIPLIER = 0.5;
const DAILY_AVG_THRESHOLD = 50;
const PERIOD_DAYS = 30;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    // ── 1. SESSION COMPARISON: current 30 days vs prior 30 days ──
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - PERIOD_DAYS);

    const baselineStart = new Date(currentStart);
    baselineStart.setDate(baselineStart.getDate() - PERIOD_DAYS);

    const [currentRes, baselineRes] = await Promise.all([
      supabase.from('analytics_sessions').select('*', { count: 'exact', head: true })
        .gte('created_at', currentStart.toISOString()),
      supabase.from('analytics_sessions').select('*', { count: 'exact', head: true })
        .gte('created_at', baselineStart.toISOString())
        .lt('created_at', currentStart.toISOString()),
    ]);

    const currentSessions = currentRes.count ?? 0;
    const baselineSessions = baselineRes.count ?? 0;
    const avgBaseline = baselineSessions > 0 ? baselineSessions : 1;
    const dailyAvg = currentSessions / PERIOD_DAYS;

    const sessionRatio = currentSessions / avgBaseline;
    const isTrafficSpike = sessionRatio >= (SPIKE_MULTIPLIER * 2) || dailyAvg >= DAILY_AVG_THRESHOLD;
    const isTrafficDrop = sessionRatio <= (1 - 0.8) && baselineSessions > 10;

    // ── 2. COST DATA: from daily_usage_stats (aggregated) + cost_tracking (detail) ──
    const [{ data: dailyUsage }, { data: allCostData }] = await Promise.all([
      supabase.from('daily_usage_stats')
        .select('*')
        .gte('stat_date', currentStart.toISOString().split('T')[0])
        .order('stat_date', { ascending: false }),
      supabase.from('cost_tracking')
        .select('provider, operation_type, cost, input_tokens, output_tokens'),
    ]);

    let totalCumulativeCost = 0;
    const costByOperation: Record<string, { count: number; cost: number; inputTokens: number; outputTokens: number }> = {};
    const costByProvider: Record<string, { count: number; cost: number }> = {};

    // Merge daily_usage_stats into summary
    (dailyUsage || []).forEach((row: any) => {
      const op = row.operation_type || 'unknown';
      const prov = row.provider || 'openai';
      const cost = Number(row.estimated_cost) || 0;
      totalCumulativeCost += cost;
      if (!costByOperation[op]) costByOperation[op] = { count: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
      costByOperation[op].count += row.call_count || 0;
      costByOperation[op].cost += cost;
      costByOperation[op].inputTokens += row.total_input_tokens || 0;
      costByOperation[op].outputTokens += row.total_output_tokens || 0;
      if (!costByProvider[prov]) costByProvider[prov] = { count: 0, cost: 0 };
      costByProvider[prov].count += row.call_count || 0;
      costByProvider[prov].cost += cost;
    });

    // Also fold in cost_tracking for completeness
    (allCostData || []).forEach((e: any) => {
      const cost = Number(e.cost) || 0;
      totalCumulativeCost += cost;
      const op = e.operation_type || 'unknown';
      if (!costByOperation[op]) costByOperation[op] = { count: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
      costByOperation[op].count++;
      costByOperation[op].cost += cost;
      costByOperation[op].inputTokens += e.input_tokens || 0;
      costByOperation[op].outputTokens += e.output_tokens || 0;
      const prov = e.provider || 'unknown';
      if (!costByProvider[prov]) costByProvider[prov] = { count: 0, cost: 0 };
      costByProvider[prov].count++;
      costByProvider[prov].cost += cost;
    });

    const isCostSpike = totalCumulativeCost >= COST_ALERT_THRESHOLD;

    // ── 3. DECIDE: should we send an alert? ──
    const shouldAlert = isTrafficSpike || isTrafficDrop || isCostSpike;

    if (!shouldAlert) {
      console.log(`[traffic-alert] No alert needed. Sessions: ${currentSessions} (daily avg: ${dailyAvg.toFixed(1)}) vs baseline ${baselineSessions} (ratio: ${sessionRatio.toFixed(2)}). Cost: $${totalCumulativeCost.toFixed(2)}`);
      return new Response(JSON.stringify({
        success: true,
        alert_sent: false,
        current_sessions: currentSessions,
        baseline_sessions: baselineSessions,
        daily_avg: dailyAvg,
        session_ratio: sessionRatio,
        cumulative_cost: totalCumulativeCost,
        message: 'Everything normal — no alert sent',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── 4. LOCATION DATA: from daily_country_stats (anonymous, zero-PII) ──
    const { data: geoData } = await supabase
      .from('daily_country_stats')
      .select('country, region, city, request_count, stat_date')
      .gte('stat_date', currentStart.toISOString().split('T')[0])
      .order('request_count', { ascending: false })
      .limit(100);

    // Aggregate across days into top 15 locations
    interface LocationInfo {
      country: string;
      region: string;
      city: string;
      count: number;
    }

    const locationMap = new Map<string, LocationInfo>();
    (geoData || []).forEach((row: any) => {
      const key = `${row.country}|${row.region || ''}|${row.city || ''}`;
      const existing = locationMap.get(key);
      if (existing) {
        existing.count += row.request_count || 1;
      } else {
        locationMap.set(key, {
          country: row.country || 'Unknown',
          region: row.region || '—',
          city: row.city || '—',
          count: row.request_count || 1,
        });
      }
    });

    const locations = [...locationMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // ── 5. DETERMINE ALERT TYPE ──
    const alertReasons: string[] = [];
    if (isTrafficSpike) alertReasons.push('Traffic Spike');
    if (isTrafficDrop) alertReasons.push('Traffic Drop');
    if (isCostSpike) alertReasons.push('Cost Threshold Exceeded');
    const alertType = alertReasons.join(' + ');

    const sessionChangePercent = baselineSessions > 0
      ? ((currentSessions / baselineSessions - 1) * 100).toFixed(0)
      : 'N/A';

    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // ── 6. BUILD EMAIL ──
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <h1 style="color: #dc2626; margin-bottom: 4px;">🚨 ${alertType} — Time2Read</h1>
        <p style="color: #6b7280; margin-top: 0;">Monthly check · ${now.toISOString().split('T')[0]}</p>

        <!-- ALERT SUMMARY -->
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #991b1b; font-size: 16px;">📋 Alert Summary</h2>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            ${isTrafficSpike ? `<li>🔺 <strong>Traffic spike:</strong> ${dailyAvg.toFixed(1)} daily avg (threshold: ${DAILY_AVG_THRESHOLD}), ${sessionChangePercent}% above baseline</li>` : ''}
            ${isTrafficDrop ? `<li>🔻 <strong>Traffic drop:</strong> ${sessionChangePercent}% below baseline (>80% drop)</li>` : ''}
            ${isCostSpike ? `<li>💸 <strong>Estimated costs exceeded $${COST_ALERT_THRESHOLD}:</strong> $${totalCumulativeCost.toFixed(2)} total</li>` : ''}
          </ul>
        </div>

        <!-- SESSION COMPARISON -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #1e40af; font-size: 16px;">📊 Session Comparison (30-day periods)</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #dbeafe;">
              <th style="padding: 8px; text-align: left;">Period</th>
              <th style="padding: 8px; text-align: right;">Sessions</th>
              <th style="padding: 8px; text-align: right;">Daily Avg</th>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px;">Current (${currentStart.toISOString().split('T')[0]} → today)</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${currentSessions}</td>
              <td style="padding: 8px; text-align: right;">${dailyAvg.toFixed(1)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px;">Baseline (${baselineStart.toISOString().split('T')[0]} → ${currentStart.toISOString().split('T')[0]})</td>
              <td style="padding: 8px; text-align: right;">${baselineSessions}</td>
              <td style="padding: 8px; text-align: right;">${(baselineSessions / PERIOD_DAYS).toFixed(1)}</td>
            </tr>
            <tr>
              <td style="padding: 8px;">Change</td>
              <td style="padding: 8px; text-align: right; color: ${isTrafficSpike ? '#dc2626' : isTrafficDrop ? '#ea580c' : '#16a34a'}; font-weight: bold;" colspan="2">
                ${sessionChangePercent}%
              </td>
            </tr>
          </table>
        </div>

        <!-- COST BREAKDOWN -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #166534; font-size: 16px;">💰 AI Cost Breakdown (Estimated)</h2>
          
          <h3 style="margin: 12px 0 4px; font-size: 13px; color: #374151;">By Provider</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #dcfce7;">
              <th style="padding: 6px; text-align: left;">Provider</th>
              <th style="padding: 6px; text-align: right;">Calls</th>
              <th style="padding: 6px; text-align: right;">Est. Cost</th>
            </tr>
            ${Object.entries(costByProvider).sort((a, b) => b[1].cost - a[1].cost).map(([prov, d]) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px; text-transform: capitalize;">${prov}</td>
                <td style="padding: 6px; text-align: right;">${d.count.toLocaleString()}</td>
                <td style="padding: 6px; text-align: right;">$${d.cost.toFixed(4)}</td>
              </tr>
            `).join('')}
          </table>

          <h3 style="margin: 16px 0 4px; font-size: 13px; color: #374151;">By Call Type</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #dcfce7;">
              <th style="padding: 6px; text-align: left;">Type</th>
              <th style="padding: 6px; text-align: right;">Calls</th>
              <th style="padding: 6px; text-align: right;">Tokens (in/out)</th>
              <th style="padding: 6px; text-align: right;">Est. Cost</th>
            </tr>
            ${Object.entries(costByOperation).sort((a, b) => b[1].cost - a[1].cost).map(([op, d]) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px;">${op}</td>
                <td style="padding: 6px; text-align: right;">${d.count.toLocaleString()}</td>
                <td style="padding: 6px; text-align: right;">${d.inputTokens.toLocaleString()} / ${d.outputTokens.toLocaleString()}</td>
                <td style="padding: 6px; text-align: right;">$${d.cost.toFixed(4)}</td>
              </tr>
            `).join('')}
            <tr style="background: #dcfce7; font-weight: bold;">
              <td style="padding: 6px;" colspan="3">TOTAL ESTIMATED</td>
              <td style="padding: 6px; text-align: right;">$${totalCumulativeCost.toFixed(2)}</td>
            </tr>
          </table>
          <p style="font-size: 11px; color: #6b7280; margin: 8px 0 0;">
            Auto-tracked from edge functions. Supabase, hosting &amp; GitHub Actions billed separately.
          </p>
        </div>

        <!-- TOP 15 LOCATIONS (Anonymous — Zero PII) -->
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #7e22ce; font-size: 16px;">🌍 Top 15 Locations (Anonymous — Zero PII)</h2>
          <p style="font-size: 11px; color: #6b7280; margin: 0 0 8px;">From Cloudflare CDN headers. No IPs stored.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #f3e8ff;">
              <th style="padding: 6px; text-align: left;">#</th>
              <th style="padding: 6px; text-align: left;">City</th>
              <th style="padding: 6px; text-align: left;">State/Region</th>
              <th style="padding: 6px; text-align: left;">Country</th>
              <th style="padding: 6px; text-align: right;">Requests</th>
            </tr>
            ${locations.map((loc, i) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px;">${i + 1}</td>
                <td style="padding: 6px;">${loc.city}</td>
                <td style="padding: 6px;">${loc.region}</td>
                <td style="padding: 6px;">${loc.country}</td>
                <td style="padding: 6px; text-align: right;">${loc.count}</td>
              </tr>
            `).join('')}
          </table>
          ${locations.length === 0 ? '<p style="color: #6b7280; font-size: 13px;">No geo data available yet. Data populates as users access the app.</p>' : ''}
        </div>

        <p style="font-size: 11px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
          Automated monthly alert · Time2Read · Runs 1st of each month at 9 AM UTC<br>
          Triggers: 50+ daily avg, 3x spike, 80%+ drop, or $${COST_ALERT_THRESHOLD}+ estimated AI costs<br>
          ${now.toISOString()}
        </p>
      </div>
    `;

    // ── 7. SEND EMAIL ──
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Time2Read Alerts <onboarding@resend.dev>',
        to: [ALERT_EMAIL],
        subject: `🚨 ${alertType} | Sessions: ${currentSessions} (${sessionChangePercent}% vs baseline) | Total Cost: $${totalCumulativeCost.toFixed(2)}`,
        html: emailHtml,
      }),
    });

    const resendResult = await resendResponse.json();
    if (!resendResponse.ok) throw new Error(`Resend error: ${JSON.stringify(resendResult)}`);

    console.log(`[traffic-alert] Alert sent: ${alertType}`, resendResult.id);

    // Track Resend email cost
    await supabase.from('cost_tracking').insert({
      session_id: 'traffic-alert',
      user_id: null,
      input_tokens: 0,
      output_tokens: 0,
      cost: 0.001,
      model_used: 'resend-email',
      operation_type: 'email_send',
      provider: 'resend',
      api_endpoint: '/emails',
      pricing_model: 'per_email',
      quantity_used: 1,
      unit_cost: 0.001,
    });

    // Log alert
    await supabase.from('security_monitoring').insert({
      event_type: 'monthly_alert_sent',
      operation: alertType,
      risk_level: isTrafficSpike && isCostSpike ? 'CRITICAL' : isTrafficSpike ? 'HIGH' : 'MEDIUM',
      details: {
        alert_reasons: alertReasons,
        current_sessions: currentSessions,
        baseline_sessions: baselineSessions,
        session_ratio: sessionRatio,
        cumulative_cost: totalCumulativeCost,
        top_locations: locations.slice(0, 5).map(l => `${l.city}, ${l.region}, ${l.country}`),
        email_sent_to: ALERT_EMAIL,
        resend_id: resendResult.id,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      alert_sent: true,
      alert_type: alertType,
      current_sessions: currentSessions,
      baseline_sessions: baselineSessions,
      cumulative_cost: totalCumulativeCost,
      locations_tracked: locations.length,
      resend_id: resendResult.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[traffic-alert] Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
