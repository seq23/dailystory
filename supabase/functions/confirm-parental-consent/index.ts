import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        generateHtmlResponse("error", "Missing verification token"),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the consent record
    const { data: consentRecord, error: findError } = await supabase
      .from("parental_consents")
      .select("*")
      .eq("consent_token", token)
      .single();

    if (findError || !consentRecord) {
      console.error("[confirm-parental-consent] Token not found:", findError);
      return new Response(
        generateHtmlResponse("error", "Invalid or expired verification link"),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Check if already verified
    if (consentRecord.consent_status === "verified") {
      return new Response(
        generateHtmlResponse("already_verified", "Consent was already verified"),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Check if expired
    if (new Date(consentRecord.token_expires_at) < new Date()) {
      return new Response(
        generateHtmlResponse("expired", "This verification link has expired"),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Update consent status
    const { error: updateError } = await supabase
      .from("parental_consents")
      .update({
        consent_status: "verified",
        verified_at: new Date().toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
      })
      .eq("id", consentRecord.id);

    if (updateError) {
      console.error("[confirm-parental-consent] Update error:", updateError);
      throw new Error("Failed to confirm consent");
    }

    // Log the verification
    await supabase.from("security_audit_log").insert({
      event_type: "parental_consent_verified",
      details: {
        consent_record_id: consentRecord.id,
        child_profile_id: consentRecord.child_profile_id,
        verified_at: new Date().toISOString(),
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    console.log("[confirm-parental-consent] Consent verified:", consentRecord.id);

    return new Response(
      generateHtmlResponse("success", "Parental consent verified successfully"),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );

  } catch (error: any) {
    console.error("[confirm-parental-consent] Error:", error);
    return new Response(
      generateHtmlResponse("error", error.message || "Verification failed"),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }
});

function generateHtmlResponse(status: string, message: string): string {
  const isSuccess = status === "success" || status === "already_verified";
  const icon = isSuccess ? "✅" : status === "expired" ? "⏰" : "❌";
  const title = isSuccess ? "Consent Verified" : status === "expired" ? "Link Expired" : "Verification Failed";
  const bgColor = isSuccess ? "#10b981" : status === "expired" ? "#f59e0b" : "#ef4444";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Time2Read</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }
        .message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .status-badge {
          display: inline-block;
          background: ${bgColor};
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 24px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">📚 Time2Read</div>
        <div class="icon">${icon}</div>
        <h1 class="title">${title}</h1>
        <div class="status-badge">${status.replace('_', ' ').toUpperCase()}</div>
        <p class="message">${message}</p>
        ${isSuccess ? `
          <p class="message">Your child can now use Time2Read with full features. Thank you for your consent!</p>
        ` : status === "expired" ? `
          <p class="message">Please contact the account holder to request a new verification email.</p>
        ` : ''}
        <a href="https://time2read.app" class="btn">Go to Time2Read</a>
      </div>
    </body>
    </html>
  `;
}
