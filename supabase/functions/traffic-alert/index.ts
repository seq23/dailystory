import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const THRESHOLD = 500;
const ALERT_EMAIL = 'privacy@time2read.com';
const PERIOD_DAYS = 15; // bi-monthly = every ~15 days

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

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - PERIOD_DAYS);

    // Count sessions in the period
    const { count: sessionCount, error: countError } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString());

    if (countError) {
      throw new Error(`Failed to count sessions: ${countError.message}`);
    }

    const totalSessions = sessionCount ?? 0;
    console.log(`[traffic-alert] Sessions in last ${PERIOD_DAYS} days: ${totalSessions}, threshold: ${THRESHOLD}`);

    if (totalSessions < THRESHOLD) {
      return new Response(JSON.stringify({
        success: true,
        alert_sent: false,
        session_count: totalSessions,
        threshold: THRESHOLD,
        message: 'Traffic within normal range'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Gather IP/location data from security_monitoring for the period
    const { data: ipData, error: ipError } = await supabase
      .from('security_monitoring')
      .select('ip_address, user_agent, risk_level, event_type, created_at')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Also check user_sessions for IP data
    const { data: sessionIpData } = await supabase
      .from('user_sessions')
      .select('ip_address, user_agent, created_at, user_id')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Build IP summary
    const ipCounts = new Map<string, number>();
    const suspiciousIps: string[] = [];

    if (ipData) {
      for (const row of ipData) {
        const ip = String(row.ip_address || 'unknown');
        ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
        if (row.risk_level === 'CRITICAL' || row.risk_level === 'HIGH') {
          if (!suspiciousIps.includes(ip)) suspiciousIps.push(ip);
        }
      }
    }

    if (sessionIpData) {
      for (const row of sessionIpData) {
        const ip = String(row.ip_address || 'unknown');
        ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
      }
    }

    // Top IPs by frequency
    const topIps = [...ipCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([ip, count]) => `${ip} (${count} events)`);

    // Build email HTML
    const now = new Date().toISOString();
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">🚨 Traffic Alert — Time2Read</h1>
        <p style="font-size: 16px;">Session count has exceeded the threshold of <strong>${THRESHOLD}</strong> in the last ${PERIOD_DAYS} days.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #991b1b;">📊 Summary</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Total Sessions:</strong> ${totalSessions}</li>
            <li><strong>Period:</strong> ${periodStart.toISOString().split('T')[0]} → ${now.split('T')[0]}</li>
            <li><strong>Threshold:</strong> ${THRESHOLD}</li>
            <li><strong>Unique IPs Tracked:</strong> ${ipCounts.size}</li>
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
          <h2 style="margin: 0 0 8px; color: #075985;">🌐 Top IP Addresses by Activity</h2>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px;">
            ${topIps.map(ip => `<li>${ip}</li>`).join('')}
          </ol>
          ${ipCounts.size === 0 ? '<p style="color: #6b7280;">No IP data available for this period.</p>' : ''}
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px; color: #374151;">🔍 Recent Session IPs</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #e5e7eb;">
              <th style="padding: 6px; text-align: left;">IP Address</th>
              <th style="padding: 6px; text-align: left;">User Agent</th>
              <th style="padding: 6px; text-align: left;">Date</th>
            </tr>
            ${(sessionIpData || []).slice(0, 10).map(s => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px;">${s.ip_address || 'N/A'}</td>
                <td style="padding: 6px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(s.user_agent || 'N/A').substring(0, 60)}</td>
                <td style="padding: 6px;">${new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
          Automated alert from Time2Read Traffic Monitor · ${now}
        </p>
      </div>
    `;

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Time2Read Alerts <onboarding@resend.dev>',
        to: [ALERT_EMAIL],
        subject: `🚨 Traffic Alert: ${totalSessions} sessions in ${PERIOD_DAYS} days (threshold: ${THRESHOLD})`,
        html: emailHtml,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[traffic-alert] Resend error:', resendResult);
      throw new Error(`Resend API error: ${JSON.stringify(resendResult)}`);
    }

    console.log('[traffic-alert] Alert email sent successfully:', resendResult.id);

    // Log the alert in security_monitoring
    await supabase.from('security_monitoring').insert({
      event_type: 'traffic_alert_sent',
      operation: 'TRAFFIC_THRESHOLD_EXCEEDED',
      risk_level: totalSessions > THRESHOLD * 3 ? 'CRITICAL' : totalSessions > THRESHOLD * 2 ? 'HIGH' : 'MEDIUM',
      details: {
        session_count: totalSessions,
        threshold: THRESHOLD,
        period_days: PERIOD_DAYS,
        unique_ips: ipCounts.size,
        suspicious_ips: suspiciousIps,
        top_ips: topIps.slice(0, 5),
        email_sent_to: ALERT_EMAIL,
        resend_id: resendResult.id,
        timestamp: now,
      }
    });

    return new Response(JSON.stringify({
      success: true,
      alert_sent: true,
      session_count: totalSessions,
      threshold: THRESHOLD,
      unique_ips: ipCounts.size,
      suspicious_ips: suspiciousIps.length,
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
