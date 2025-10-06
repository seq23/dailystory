import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin, Access-Control-Request-Headers",
};

interface ParentalNotificationRequest {
  parentEmail: string;
  childName: string;
  incidentCount: number;
  recentViolations: Array<{
    timestamp: string;
    violationType: string;
    content: string;
  }>;
  reportType: 'daily' | 'weekly' | 'monthly';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Ultra-fast health endpoint - compliance critical
  if (req.method === "HEAD" && new URL(req.url).pathname === "/health") {
    return new Response(null, { 
      status: 200, 
      headers: { 
        ...corsHeaders,
        'x-health': 'true', 
        'Cache-Control': 'no-store' 
      }
    });
  }

  try {
    const { 
      parentEmail, 
      childName, 
      incidentCount,
      recentViolations,
      reportType
    }: ParentalNotificationRequest = await req.json();

    console.log(`Sending ${reportType} parental notification to:`, parentEmail);

    const violationsList = recentViolations.map(violation => 
      `<li style="margin: 8px 0;">
        <strong>${violation.violationType}</strong> on ${new Date(violation.timestamp).toLocaleDateString()}<br>
        <span style="font-family: monospace; background: #f5f5f5; padding: 4px; border-radius: 3px;">${violation.content}</span>
      </li>`
    ).join('');

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Time2Read Safety <safety@time-2-read.com>",
        to: [parentEmail],
        subject: `📋 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Privacy Report for ${childName}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; display: flex; align-items: center;">
              📋 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Privacy Report
            </h1>
          </div>

          <p>Dear Parent/Guardian,</p>

          <p>This is your ${reportType} summary of privacy-related activity for <strong>${childName}</strong>'s Time2Read account.</p>

          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Summary</h3>
            <p style="margin-bottom: 0; font-size: 18px;">
              <strong>${incidentCount}</strong> privacy incidents detected this ${reportType.replace('ly', '')}
            </p>
          </div>

          ${incidentCount > 0 ? `
            <h3 style="color: #1f2937;">Recent Privacy Incidents:</h3>
            <ul style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
              ${violationsList}
            </ul>
          ` : `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46;">✅ Great news! No privacy incidents were detected during this period.</p>
            </div>
          `}

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0277bd;">Parental Guidance Tips:</h3>
            <ul style="margin-bottom: 0;">
              <li>Review story content regularly with your child</li>
              <li>Remind them to use fictional names and places in stories</li>
              <li>Encourage creative storytelling without personal details</li>
              <li>Praise them when they create imaginative, privacy-safe content</li>
            </ul>
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              This ${reportType} report was generated automatically by Time2Read's privacy protection system. 
              We're committed to keeping your child safe online and complying with COPPA regulations.
              <a href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa" style="color: #2563eb;">Learn more about COPPA</a>
            </p>
          </div>

          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The Time2Read Safety Team</strong>
          </p>
        </div>
        `,
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${emailResponse.status} ${emailResponse.statusText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Parental notification sent successfully:", emailResult);

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResult.id || 'unknown',
      reportType,
      incidentCount
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-parental-notification function:", error);
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