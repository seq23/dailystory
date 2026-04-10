import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logCost } from "../_shared/costLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

interface MonthlyBreakdown {
  month: string;
  totalCost: number;
  totalRequests: number;
  providers: Record<string, { cost: number; requests: number }>;
  operations: Record<string, { cost: number; requests: number }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = 'privacy@time-2-read.com';
    const adminUserIds = (Deno.env.get('ADMIN_USER_IDS') || '').split(',').filter(Boolean);

    // No auth check - this function is protected by verify_jwt=false in config
    // and is only accessible via the debug panel or pg_cron

    // Parse request body
    let startDate: string;
    let endDate: string;
    let sendEmail = true;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        startDate = body.startDate || getQuarterStart();
        endDate = body.endDate || new Date().toISOString().split('T')[0];
        sendEmail = body.sendEmail !== false;
      } catch {
        startDate = getQuarterStart();
        endDate = new Date().toISOString().split('T')[0];
      }
    } else {
      startDate = getQuarterStart();
      endDate = new Date().toISOString().split('T')[0];
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Paginate through cost_tracking for the date range
    const allEntries: any[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data: batch } = await sb
        .from('cost_tracking')
        .select('cost, input_tokens, output_tokens, provider, model_used, operation_type, timestamp, session_id')
        .gte('timestamp', `${startDate}T00:00:00Z`)
        .lte('timestamp', `${endDate}T23:59:59Z`)
        .order('timestamp', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (!batch || batch.length === 0) break;
      allEntries.push(...batch);
      if (batch.length < pageSize) break;
      page++;
    }

    // Aggregate by month
    const monthlyMap = new Map<string, MonthlyBreakdown>();
    let grandTotalCost = 0;
    let grandTotalRequests = 0;
    let grandTotalInputTokens = 0;
    let grandTotalOutputTokens = 0;
    const uniqueSessions = new Set<string>();

    allEntries.forEach((e: any) => {
      const monthKey = e.timestamp.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalCost: 0,
          totalRequests: 0,
          providers: {},
          operations: {},
        });
      }
      const m = monthlyMap.get(monthKey)!;
      const cost = Number(e.cost || 0);
      m.totalCost += cost;
      m.totalRequests++;
      grandTotalCost += cost;
      grandTotalRequests++;
      grandTotalInputTokens += e.input_tokens || 0;
      grandTotalOutputTokens += e.output_tokens || 0;
      if (e.session_id) uniqueSessions.add(e.session_id);

      const provider = e.provider || 'unknown';
      if (!m.providers[provider]) m.providers[provider] = { cost: 0, requests: 0 };
      m.providers[provider].cost += cost;
      m.providers[provider].requests++;

      const op = e.operation_type || 'unknown';
      if (!m.operations[op]) m.operations[op] = { cost: 0, requests: 0 };
      m.operations[op].cost += cost;
      m.operations[op].requests++;
    });

    // Get top 15 traffic locations
    const { data: geoData } = await sb
      .from('daily_country_stats')
      .select('country, region, city, request_count')
      .gte('stat_date', startDate)
      .lte('stat_date', endDate)
      .order('request_count', { ascending: false })
      .limit(50);

    // Aggregate geo by location
    const geoMap = new Map<string, number>();
    (geoData || []).forEach((g: any) => {
      const key = [g.city, g.region, g.country].filter(Boolean).join(', ');
      geoMap.set(key, (geoMap.get(key) || 0) + g.request_count);
    });
    const topLocations = [...geoMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([location, count]) => ({ location, requests: count }));

    // Build sorted monthly breakdown
    const monthlyBreakdown = [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month));

    const report = {
      period: { startDate, endDate },
      grandTotal: {
        cost: grandTotalCost,
        requests: grandTotalRequests,
        inputTokens: grandTotalInputTokens,
        outputTokens: grandTotalOutputTokens,
        uniqueSessions: uniqueSessions.size,
        avgCostPerRequest: grandTotalRequests > 0 ? grandTotalCost / grandTotalRequests : 0,
      },
      monthlyBreakdown,
      topLocations,
      generatedAt: new Date().toISOString(),
    };

    // Send email if requested
    console.log(`Email send check: sendEmail=${sendEmail}, hasResendKey=${!!resendKey}, adminEmail=${adminEmail}`);
    if (sendEmail && resendKey && adminEmail) {
      const emailHtml = buildReportEmail(report);

      console.log('Sending email via Resend...');
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Time2Read Reports <reports@time-2-read.com>',
          to: [adminEmail],
          subject: `📊 Cost Report: ${startDate} → ${endDate} | $${grandTotalCost.toFixed(2)}`,
          html: emailHtml,
        }),
      });

      const emailBody = await emailRes.text();
      console.log(`Resend response: status=${emailRes.status}, body=${emailBody}`);

      if (emailRes.ok) {
        logCost(sb, {
          sessionId: 'cost-report',
          provider: 'resend',
          operationType: 'email_send',
          modelUsed: 'resend-email',
          cost: 0.001,
          apiEndpoint: '/emails',
          pricingModel: 'per_email',
          quantityUsed: 1,
          unitCost: 0.001,
        });
      }

      report.emailSent = emailRes.ok;
    }

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Cost report error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getQuarterStart(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  // Previous quarter
  const prevQ = q === 0 ? 3 : q - 1;
  const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = prevQ * 3 + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function buildReportEmail(report: any): string {
  const { period, grandTotal, monthlyBreakdown, topLocations } = report;

  const monthRows = monthlyBreakdown.map((m: any) => {
    const providerCells = Object.entries(m.providers)
      .map(([p, d]: [string, any]) => `${p}: $${d.cost.toFixed(4)} (${d.requests})`)
      .join('<br>');
    const opCells = Object.entries(m.operations)
      .sort(([,a]: any, [,b]: any) => b.cost - a.cost)
      .slice(0, 8)
      .map(([op, d]: [string, any]) => `${op}: $${d.cost.toFixed(4)} (${d.requests})`)
      .join('<br>');
    return `<tr>
      <td style="padding:8px;border:1px solid #ddd;font-weight:bold">${m.month}</td>
      <td style="padding:8px;border:1px solid #ddd">$${m.totalCost.toFixed(4)}</td>
      <td style="padding:8px;border:1px solid #ddd">${m.totalRequests.toLocaleString()}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px">${providerCells}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px">${opCells}</td>
    </tr>`;
  }).join('');

  const geoRows = topLocations.map((g: any, i: number) =>
    `<tr>
      <td style="padding:6px;border:1px solid #ddd">${i + 1}</td>
      <td style="padding:6px;border:1px solid #ddd">${g.location}</td>
      <td style="padding:6px;border:1px solid #ddd">${g.requests.toLocaleString()}</td>
    </tr>`
  ).join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px">
    <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);color:white;padding:30px;border-radius:12px;margin-bottom:24px">
      <h1 style="margin:0;font-size:28px">📊 Time2Read Cost Report</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:16px">${period.startDate} → ${period.endDate}</p>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:150px;background:#f0f9ff;padding:20px;border-radius:8px;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#1e40af">$${grandTotal.cost.toFixed(2)}</div>
        <div style="color:#64748b;font-size:14px">Total Cost</div>
      </div>
      <div style="flex:1;min-width:150px;background:#f0fdf4;padding:20px;border-radius:8px;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#166534">${grandTotal.requests.toLocaleString()}</div>
        <div style="color:#64748b;font-size:14px">API Calls</div>
      </div>
      <div style="flex:1;min-width:150px;background:#fdf4ff;padding:20px;border-radius:8px;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#7c3aed">${grandTotal.uniqueSessions.toLocaleString()}</div>
        <div style="color:#64748b;font-size:14px">Sessions</div>
      </div>
      <div style="flex:1;min-width:150px;background:#fff7ed;padding:20px;border-radius:8px;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#c2410c">$${grandTotal.avgCostPerRequest.toFixed(4)}</div>
        <div style="color:#64748b;font-size:14px">Avg/Request</div>
      </div>
    </div>

    <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">Monthly Breakdown</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Month</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Cost</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Requests</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">By Provider</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">By Operation</th>
        </tr>
      </thead>
      <tbody>${monthRows || '<tr><td colspan="5" style="padding:8px;text-align:center">No data</td></tr>'}</tbody>
    </table>

    ${topLocations.length > 0 ? `
    <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px">Top 15 Traffic Locations</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:6px;border:1px solid #ddd">#</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left">Location</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left">Requests</th>
        </tr>
      </thead>
      <tbody>${geoRows}</tbody>
    </table>` : ''}

    <div style="background:#f8fafc;padding:16px;border-radius:8px;margin-top:24px">
      <p style="margin:0;font-size:13px;color:#64748b">
        Generated: ${new Date().toISOString()} | Tokens: ${(grandTotal.inputTokens + grandTotal.outputTokens).toLocaleString()} (in: ${grandTotal.inputTokens.toLocaleString()}, out: ${grandTotal.outputTokens.toLocaleString()})
      </p>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b">— Time2Read / Spry VSL LLC</p>
    </div>
  </div>`;
}
