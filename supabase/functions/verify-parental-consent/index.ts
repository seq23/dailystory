import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyConsentRequest {
  child_profile_id: string;
  parent_email: string;
  child_name: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { child_profile_id, parent_email, child_name }: VerifyConsentRequest = await req.json();

    if (!child_profile_id || !parent_email || !child_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate consent token
    const consentToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Insert consent record
    const { data: consentRecord, error: insertError } = await supabase
      .from("parental_consents")
      .insert({
        child_profile_id,
        parent_email,
        consent_token: consentToken,
        consent_status: "pending",
        token_expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[verify-parental-consent] Insert error:", insertError);
      throw new Error("Failed to create consent record");
    }

    // Build verification URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://time2read.app";
    const verificationUrl = `${baseUrl}/verify-consent?token=${consentToken}`;

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "Time2Read <noreply@time2read.app>",
      to: [parent_email],
      subject: `Parental Consent Required for ${child_name}'s Time2Read Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 Time2Read</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Parental Consent Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello Parent/Guardian,</h2>
            
            <p>A Time2Read account has been created for <strong>${child_name}</strong>.</p>
            
            <p>Under the Children's Online Privacy Protection Act (COPPA), we need your consent before 
            we can collect and use your child's information to provide our reading service.</p>
            
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">What information we collect:</h3>
              <ul style="margin-bottom: 0;">
                <li>Display name (nickname only)</li>
                <li>Reading preferences and grade level</li>
                <li>Reading progress and quiz scores</li>
                <li>Avatar selection (not photos)</li>
              </ul>
            </div>
            
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">How we use this information:</h3>
              <ul style="margin-bottom: 0;">
                <li>Personalize stories for your child's interests</li>
                <li>Track reading progress and vocabulary</li>
                <li>Provide age-appropriate content</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>⏰ This link expires in 48 hours.</strong><br>
                If you did not create this account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                ✓ I Consent to This Account
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              You can revoke consent and request deletion of your child's data at any time by 
              visiting your account settings or contacting us at 
              <a href="mailto:privacy@time2read.app">privacy@time2read.app</a>.
            </p>
            
            <p style="font-size: 12px; color: #666;">
              Time2Read LLC | <a href="https://time2read.app/privacy">Privacy Policy</a> | 
              <a href="https://time2read.app/terms">Terms of Service</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("[verify-parental-consent] Email sent:", emailResponse);

    // Log the consent request
    await supabase.from("security_audit_log").insert({
      event_type: "parental_consent_verification_sent",
      details: {
        child_profile_id,
        consent_record_id: consentRecord.id,
        email_sent_to: parent_email,
        expires_at: expiresAt.toISOString(),
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent",
        consent_id: consentRecord.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[verify-parental-consent] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send verification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
