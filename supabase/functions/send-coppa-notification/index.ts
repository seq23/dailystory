import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface COPPANotificationRequest {
  parentEmail: string;
  childName: string;
  violations: string[];
  detectedContent: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      parentEmail, 
      childName, 
      violations, 
      detectedContent, 
      timestamp 
    }: COPPANotificationRequest = await req.json();

    console.log("Sending COPPA notification to:", parentEmail);

    const emailResponse = await resend.emails.send({
      from: "DailyStory Safety <safety@time-2-read.com>",
      to: [parentEmail],
      subject: `🛡️ Privacy Alert: Content Review Needed for ${childName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #d97706; margin: 0; display: flex; align-items: center;">
              🛡️ Privacy Alert - Action Required
            </h1>
          </div>

          <p>Dear Parent/Guardian,</p>

          <p>We've detected content in your child's story creation that may contain personal information. As part of our commitment to protecting children's privacy under COPPA guidelines, we're alerting you to review this content.</p>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
            <h3 style="margin-top: 0; color: #92400e;">Content Detected:</h3>
            <p style="margin-bottom: 0; font-family: monospace; background: #fff; padding: 10px; border-radius: 4px;">${detectedContent}</p>
          </div>

          <h3 style="color: #1f2937;">Specific Privacy Concerns:</h3>
          <ul style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            ${violations.map(violation => `<li style="margin: 5px 0;">${violation}</li>`).join('')}
          </ul>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0277bd;">What We Recommend:</h3>
            <ul style="margin-bottom: 0;">
              <li>Review the content with your child</li>
              <li>Help them create stories without personal details</li>
              <li>Use made-up names, places, and information instead</li>
              <li>Encourage creative storytelling that doesn't include real personal information</li>
            </ul>
          </div>

          <p>This alert was generated on: <strong>${new Date(timestamp).toLocaleString()}</strong></p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              This is an automated safety notification from DailyStory. We're committed to protecting your child's privacy and complying with COPPA regulations. 
              <a href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa" style="color: #2563eb;">Learn more about COPPA</a>
            </p>
          </div>

          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The DailyStory Safety Team</strong>
          </p>
        </div>
      `,
    });

    console.log("COPPA notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id || 'unknown'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-coppa-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);