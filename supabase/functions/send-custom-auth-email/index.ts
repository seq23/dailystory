import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
};

interface AuthEmailRequest {
  email: string;
  token_hash: string;
  token: string;
  email_action_type: string;
  redirect_to?: string;
  site_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      token_hash, 
      token, 
      email_action_type, 
      redirect_to, 
      site_url 
    }: AuthEmailRequest = await req.json();

    console.log("Sending custom auth email:", { email, email_action_type });

    // Determine the actual redirect URL (prefer production domain over preview)
    let actualRedirectUrl = redirect_to || site_url;
    if (actualRedirectUrl.includes('preview--')) {
      // Replace preview URL with production domain
      actualRedirectUrl = actualRedirectUrl.replace(/https:\/\/preview--[^.]+\.lovable\.app/, 'https://time-2-read.com');
    }

    // Construct verification URL
    const verificationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(actualRedirectUrl)}`;

    // Create email content based on action type
    let subject: string;
    let htmlContent: string;

    if (email_action_type === 'signup') {
      subject = "Welcome to Time-2-Read! Please verify your email";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Time-2-Read</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0;">Time-2-Read</h1>
              <p style="color: #666; margin: 8px 0 0;">Personalized Reading Adventures</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">Welcome to Time-2-Read! 🎉</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px;">
                Thank you for creating your account! You're just one click away from accessing your personalized reading adventures.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" 
                   style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                  Verify Your Email Address
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
              <h3 style="color: #065f46; margin: 0 0 12px; font-size: 16px;">✨ Your premium access is already active!</h3>
              <p style="color: #047857; margin: 0; font-size: 14px;">
                You can start enjoying Time-2-Read immediately. Email verification helps secure your account and unlocks additional features.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; color: #64748b; font-size: 12px; text-align: center;">
              <p style="margin: 0 0 8px;">
                This verification link will expire in 24 hours for security.
              </p>
              <p style="margin: 0;">
                If you didn't create an account with Time-2-Read, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 Time-2-Read. All rights reserved.<br>
                <a href="https://time-2-read.com" style="color: #2563eb; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </body>
        </html>
      `;
    } else {
      subject = "Time-2-Read Email Verification";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Time-2-Read</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0;">Time-2-Read</h1>
              <p style="color: #666; margin: 8px 0 0;">Personalized Reading Adventures</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">Verify Your Email</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px;">
                Please click the button below to verify your email address.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" 
                   style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 Time-2-Read. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Time-2-Read <noreply@time2read.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Custom auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-custom-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);