import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logCost } from "../_shared/costLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only service role or configured admins can trigger breach notifications
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ── Authorization: require service_role token or an admin user ──
    const token = authHeader?.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUserIds = (Deno.env.get('ADMIN_USER_IDS') || '').split(',').map(s => s.trim()).filter(Boolean);
    let authorized = false;

    if (token === serviceRoleKey) {
      authorized = true; // internal/service-role caller (e.g. pg_cron, other edge functions)
    } else {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user && adminUserIds.includes(user.id)) {
        authorized = true;
      }
    }

    if (!authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      breachDescription,
      dataTypesAffected,
      severity,
      remediationSteps,
      notifyUsers,
    } = await req.json();

    // 1. Log the breach
    const { data: breach, error: insertError } = await supabase
      .from('data_breach_log')
      .insert({
        breach_description: breachDescription,
        data_types_affected: dataTypesAffected || [],
        severity: severity || 'medium',
        remediation_steps: remediationSteps,
        status: 'detected',
        logged_by: 'system',
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to log breach: ${insertError.message}`);
    }

    // 2. Count affected users
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('account_status', 'active');

    await supabase
      .from('data_breach_log')
      .update({ users_affected_count: count || 0 })
      .eq('id', breach.id);

    // 3. If notifyUsers is true and we have Resend, send notifications
    if (notifyUsers && resendKey) {
      // Get all user emails
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('email')
        .limit(1000);

      const emails = subscribers?.map(s => s.email).filter(Boolean) || [];

      if (emails.length > 0) {
        // Send batch notification via Resend (escape admin-supplied fields)
        const safeDescription = escapeHtml(breachDescription);
        const safeDataTypes = escapeHtml((dataTypesAffected || []).join(', '));
        const safeRemediation = escapeHtml(remediationSteps || 'We are investigating and taking corrective action.');
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Time2Read Security <privacy@time2read.com>',
            to: emails.slice(0, 50), // Batch limit
            subject: 'Important Security Notice from Time2Read',
            html: `
              <h2>Security Notice</h2>
              <p>We are writing to inform you of a data security incident that may affect your Time2Read account.</p>
              <p><strong>What happened:</strong> ${safeDescription}</p>
              <p><strong>Data types potentially affected:</strong> ${safeDataTypes}</p>
              <p><strong>What we're doing:</strong> ${safeRemediation}</p>
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Change your password at <a href="https://time2read.lovable.app">time2read.lovable.app</a></li>
                <li>Review your account for any unauthorized activity</li>
                <li>Contact us at privacy@time2read.com with any concerns</li>
              </ul>
              <p>We take the security of your data seriously and apologize for any inconvenience.</p>
              <p>— The Time2Read Security Team<br/>Spry VSL LLC</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          // Fire-and-forget cost tracking
          logCost(supabase, {
            sessionId: 'notify-data-breach',
            provider: 'resend',
            operationType: 'email_send',
            modelUsed: 'resend-email',
            cost: 0.001 * Math.min(emails.length, 50),
            apiEndpoint: '/emails',
            pricingModel: 'per_email',
            quantityUsed: Math.min(emails.length, 50),
            unitCost: 0.001,
          });

          await supabase
            .from('data_breach_log')
            .update({
              users_notified_at: new Date().toISOString(),
              status: 'users_notified',
            })
            .eq('id', breach.id);
        }
      }
    }

    // 4. Log to security audit
    await supabase.rpc('log_security_event', {
      event_type: 'data_breach_logged',
      user_id_param: null,
      details: {
        breach_id: breach.id,
        severity,
        data_types: dataTypesAffected,
        users_notified: notifyUsers,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        breachId: breach.id,
        usersAffected: count,
        message: '72-hour GDPR notification window started',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Breach notification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
