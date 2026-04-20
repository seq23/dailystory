// Sends a feedback notification email via Resend.
// Public function (verify_jwt = false) so guest feedback also triggers email.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFICATION_EMAIL = 'hello@time-2-read.com';
const FROM = 'Time2Read Reports <reports@resend.dev>';

interface FeedbackPayload {
  rating: number;
  category: string;
  message: string;
  page_url?: string;
  user_agent?: string;
  user_email?: string | null;
  user_id?: string | null;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as FeedbackPayload;

    // Basic validation
    if (
      typeof body.rating !== 'number' ||
      body.rating < 1 ||
      body.rating > 5 ||
      typeof body.category !== 'string' ||
      typeof body.message !== 'string' ||
      body.message.length === 0 ||
      body.message.length > 5000
    ) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stars = '⭐'.repeat(body.rating) + '☆'.repeat(5 - body.rating);
    const userLine = body.user_email
      ? `${escapeHtml(body.user_email)} (logged in)`
      : 'Anonymous guest';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
          New Time2Read Feedback
        </h2>
        <p style="font-size: 18px; margin: 16px 0;">${stars} <strong>(${body.rating}/5)</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; background: #f3f4f6;"><strong>Category</strong></td><td style="padding: 8px;">${escapeHtml(body.category)}</td></tr>
          <tr><td style="padding: 8px; background: #f3f4f6;"><strong>From</strong></td><td style="padding: 8px;">${userLine}</td></tr>
          ${body.user_id ? `<tr><td style="padding: 8px; background: #f3f4f6;"><strong>User ID</strong></td><td style="padding: 8px; font-family: monospace; font-size: 12px;">${escapeHtml(body.user_id)}</td></tr>` : ''}
          ${body.page_url ? `<tr><td style="padding: 8px; background: #f3f4f6;"><strong>Page</strong></td><td style="padding: 8px;"><a href="${escapeHtml(body.page_url)}">${escapeHtml(body.page_url)}</a></td></tr>` : ''}
        </table>
        <h3 style="color: #1f2937;">Message</h3>
        <div style="background: #f9fafb; border-left: 4px solid #6366f1; padding: 12px 16px; white-space: pre-wrap;">${escapeHtml(body.message)}</div>
        ${body.user_agent ? `<p style="color: #9ca3af; font-size: 11px; margin-top: 24px;">UA: ${escapeHtml(body.user_agent)}</p>` : ''}
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFICATION_EMAIL],
        reply_to: body.user_email || undefined,
        subject: `[Time2Read Feedback] ${body.category} — ${body.rating}/5`,
        html,
      }),
    });

    const respText = await resp.text();
    if (!resp.ok) {
      console.error('Resend error:', resp.status, respText);
      return new Response(JSON.stringify({ error: 'Email send failed', details: respText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-feedback-notification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
