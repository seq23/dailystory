import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALERT_EMAIL = 'privacy@time2read.com';
const PERIOD_DAYS = 15;
const SPIKE_MULTIPLIER = 1.5; // Alert when current period is 1.5x the historical average

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    // --- 1. Count sessions in the CURRENT 15-day period ---
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - PERIOD_DAYS);

    const { count: currentCount, error: currentError } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentPeriodStart.toISOString());

    if (currentError) throw new Error(`Failed to count current sessions: ${currentError.message}`);
    const currentSessions = currentCount ?? 0;

    // --- 2. Calculate historical bi-monthly average (last 6 periods = ~90 days) ---
    const historicalStart = new Date(now);
    historicalStart.setDate(historicalStart.getDate() - (PERIOD_DAYS * 6));

    const { count: historicalCount, error: histError } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', historicalStart.toISOString())
      .lt('created_at', currentPeriodStart.toISOString());

    if (histError) throw new Error(`Failed to count historical sessions: ${histError.message}`);
    const historicalSessions = historicalCount ?? 0;

    // Average per 15-day period (we looked at 5 prior periods)
    const priorPeriods = 5;
    const avgPerPeriod = priorPeriods > 0 ? historicalSessions / priorPeriods : 0;
    const spikeThreshold = Math.max(avgPerPeriod * SPIKE_MULTIPLIER, 10); // Minimum 10 to avoid noise on empty data

    console.log(`[traffic-alert] Current: ${currentSessions}, Historical avg/period: ${avgPerPeriod.toFixed(1)}, Spike threshold: ${spikeThreshold.toFixed(1)}`);

    const isSpike = currentSessions > spikeThreshold;

    if (!isSpike) {
      return new Response(JSON.stringify({
        success: true,
        alert_sent: false,
        current_sessions: currentSessions,
        historical_avg: avgPerPeriod,
        spike_threshold: spikeThreshold,
        message: 'No spike detected — traffic is within normal range'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- 3. Gather automated cost data from cost_tracking ---
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: costData } = await supabase
      .from('cost_tracking')
      .select('provider, operation_type, cost')
      .gte('created_at', monthStart.toISOString());

    // Provider totals
    const providerTotals: Record<string, number> = {};
    let totalMonthlyCost = 0;
    (costData || []).forEach((entry: any) => {
      const provider = entry.provider || 'unknown';
      const cost = Number(entry.cost) || 0;
      providerTotals[provider] = (providerTotals[provider] || 0) + cost;
      totalMonthlyCost += cost;
    });

    // Operation type totals
    const opTotals: Record<string, number> = {};
    (costData || []).forEach((entry: any) => {
      const op = entry.operation_type || 'unknown';
      opTotals[op] = (opTotals[op] || 0) + (Number(entry.cost) || 0);
    });

    // --- 4. Gather IP data for spike context ---
    const { data: ipData } = await supabase
      .from('security_monitoring')
      .select('ip_address, risk_level')
      .gte('created_at', currentPeriodStart.toISOString())
      .limit(100);

    const { data: sessionIpData } = await supabase
      .from('user_sessions')
      .select('ip_address, user_agent, created_at')
      .gte('created_at', currentPeriodStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(30);

    const ipCounts = new Map<string, number>();
    const suspiciousIps: string[] = [];

    (ipData || []).forEach((row: any) => {
      const ip = String(row.ip_address || 'unknown');
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
      if ((row.risk_level === 'CRITICAL' || row.risk_level === 'HIGH') && !suspiciousIps.includes(ip)) {
        suspiciousIps.push(ip);
      }
    });

    (sessionIpData || []).forEach((row: any) => {
      const ip = String(row.ip_address || 'unknown');
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    });

    const topIps = [...ipCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => `${ip} (${count} events)`);

    const spikePercent = avgPerPeriod > 0 ? ((currentSessions / avgPerPeriod - 1) * 100).toFixed(0) : 'N/A';
    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // --- 5. Build email ---
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">🚨 Traffic Spike Detected — Time2Read</h1>
        <p>Current 15-day session count is <strong>${spikePercent}% above</strong> the bi-monthly average.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #991b1b;">📊 Spike Summary</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Current Period Sessions:</strong> ${currentSessions}</li>
            <li><strong>Historical Avg (per 15 days):</strong> ${avgPerPeriod.toFixed(1)}</li>
            <li><strong>Spike Threshold (${SPIKE_MULTIPLIER}x avg):</strong> ${spikeThreshold.toFixed(0)}</li>
            <li><strong>Period:</strong> ${currentPeriodStart.toISOString().split('T')[0]} → ${now.toISOString().split('T')[0]}</li>
            <li><strong>Unique IPs:</strong> ${ipCounts.size}</li>
          </ul>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #166534;">💰 ${monthName} — Automated Cost Tracking</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #dcfce7;">
              <th style="padding: 8px; text-align: left;">Service</th>
              <th style="padding: 8px; text-align: right;">Cost</th>
            </tr>
            ${Object.entries(providerTotals).sort((a, b) => b[1] - a[1]).map(([provider, cost]) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; text-transform: capitalize;">${provider}</td>
                <td style="padding: 8px; text-align: right;">$${cost.toFixed(4)}</td>
              </tr>
            `).join('')}
            <tr style="background: #dcfce7; font-weight: bold;">
              <td style="padding: 8px;">TOTAL (API costs)</td>
              <td style="padding: 8px; text-align: right;">$${totalMonthlyCost.toFixed(4)}</td>
            </tr>
          </table>
          <p style="font-size: 11px; color: #6b7280; margin: 8px 0 0;">Auto-tracked from edge functions. Supabase/hosting/GitHub Actions billed separately by those providers.</p>
        </div>

        <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #854d0e;">📋 Cost by Operation</h2>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            ${Object.entries(opTotals).sort((a, b) => b[1] - a[1]).map(([op, cost]) => `
              <li><strong>${op}:</strong> $${cost.toFixed(4)}</li>
            `).join('')}
          </ul>
        </div>

        ${suspiciousIps.length > 0 ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #9a3412;">⚠️ Suspicious IPs (High/Critical Risk)</h2>
          <ul style="margin: 0; padding-left: 20px;">
            ${suspiciousIps.map(ip => `<li>${ip}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #075985;">🌐 Top IPs by Activity</h2>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px;">
            ${topIps.map(ip => `<li>${ip}</li>`).join('')}
          </ol>
          ${ipCounts.size === 0 ? '<p style="color: #6b7280;">No IP data available.</p>' : ''}
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
          Automated spike alert · Time2Read Traffic Monitor · ${now.toISOString()}
        </p>
      </div>
    `;

    // --- 6. Send email ---
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Time2Read Alerts <onboarding@resend.dev>',
        to: [ALERT_EMAIL],
        subject: `🚨 Traffic Spike: ${currentSessions} sessions (+${spikePercent}% above avg) | MTD costs: $${totalMonthlyCost.toFixed(2)}`,
        html: emailHtml,
      }),
    });

    const resendResult = await resendResponse.json();
    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendResult)}`);
    }

    console.log('[traffic-alert] Spike alert sent:', resendResult.id);

    // --- 7. Track Resend email cost (~$0.001/email) ---
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

    // --- 8. Log alert in security_monitoring ---
    await supabase.from('security_monitoring').insert({
      event_type: 'traffic_spike_alert_sent',
      operation: 'SPIKE_DETECTED',
      risk_level: currentSessions > spikeThreshold * 3 ? 'CRITICAL' : currentSessions > spikeThreshold * 2 ? 'HIGH' : 'MEDIUM',
      details: {
        current_sessions: currentSessions,
        historical_avg: avgPerPeriod,
        spike_threshold: spikeThreshold,
        spike_percent: spikePercent,
        unique_ips: ipCounts.size,
        suspicious_ips: suspiciousIps,
        monthly_api_cost: totalMonthlyCost,
        provider_breakdown: providerTotals,
        email_sent_to: ALERT_EMAIL,
        resend_id: resendResult.id,
        timestamp: now.toISOString(),
      }
    });

    return new Response(JSON.stringify({
      success: true,
      alert_sent: true,
      current_sessions: currentSessions,
      historical_avg: avgPerPeriod,
      spike_percent: spikePercent,
      monthly_api_cost: totalMonthlyCost,
      resend_id: resendResult.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[traffic-alert] Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
