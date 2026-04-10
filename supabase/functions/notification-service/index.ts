import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { logCost } from "../_shared/costLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Health endpoint
  if (req.method === 'HEAD' && new URL(req.url).pathname === '/health') {
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
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const { createClient } = await memoizedImport('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const { operation, email, parentEmail, childName, parentName, incidentDetails, coppaDetails } = await req.json();
    
    // Support both email formats for backward compatibility
    const targetEmail = email || parentEmail;

    console.log(`Notification Service - Operation: ${operation}`);

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (operation) {
      case 'parental-notification': {
        if (!targetEmail || !childName) {
          return new Response(
            JSON.stringify({ error: 'Email (or parentEmail) and childName are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const emailContent = {
          from: 'StoryForge <notifications@storyforge.app>',
          to: targetEmail,
          subject: `Important: Activity Alert for ${childName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">StoryForge Parental Notification</h2>
              <p>Dear ${parentName || 'Parent/Guardian'},</p>
              <p>We're writing to inform you about activity related to your child's account:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Child: ${childName}</h3>
                ${incidentDetails ? `<p><strong>Details:</strong> ${incidentDetails}</p>` : ''}
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Best regards,<br>The StoryForge Team</p>
            </div>
          `
        };

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailContent)
        });

        const result = await response.json();

        // Fire-and-forget cost tracking
        logCost(supabase, {
          sessionId: 'notification-service',
          provider: 'resend',
          operationType: 'email_send',
          modelUsed: 'resend-email',
          cost: 0.001,
          apiEndpoint: '/emails',
          pricingModel: 'per_email',
          quantityUsed: 1,
          unitCost: 0.001,
        });

        // Log the notification
        await supabase
          .from('security_audit_log')
          .insert({
            event_type: 'parental_notification_sent',
            details: {
              email: targetEmail,
              childName,
              notificationId: result.id,
              incidentDetails
            }
          });

        return new Response(
          JSON.stringify({ 
            sent: true, 
            notificationId: result.id,
            messageId: result.id // Backward compatibility
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'coppa-notification': {
        if (!targetEmail) {
          return new Response(
            JSON.stringify({ error: 'Email (or parentEmail) is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const emailContent = {
          from: 'StoryForge Privacy <privacy@storyforge.app>',
          to: targetEmail,
          subject: 'COPPA Compliance Notification - Child Privacy Protection',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">COPPA Compliance Notification</h2>
              <p>Dear Parent/Guardian,</p>
              <p>This is an important notification regarding your child's privacy and data protection under the Children's Online Privacy Protection Act (COPPA).</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #dc2626;">Privacy Alert</h3>
                ${coppaDetails ? `<p>${coppaDetails}</p>` : ''}
                <p><strong>Date/Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <h3>What This Means:</h3>
              <ul>
                <li>We take child privacy very seriously</li>
                <li>We comply with all COPPA requirements</li>
                <li>Your child's data is protected according to federal guidelines</li>
              </ul>

              <h3>Next Steps:</h3>
              <p>Please review your child's account settings and contact us if you have any concerns about data collection or privacy.</p>

              <p>For questions about COPPA compliance or data privacy, contact: <a href="mailto:privacy@storyforge.app">privacy@storyforge.app</a></p>
              
              <p>Sincerely,<br>StoryForge Privacy Team</p>
            </div>
          `
        };

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailContent)
        });

        const result = await response.json();

        // Fire-and-forget cost tracking
        logCost(supabase, {
          sessionId: 'notification-service',
          provider: 'resend',
          operationType: 'email_send',
          modelUsed: 'resend-email',
          cost: 0.001,
          apiEndpoint: '/emails',
          pricingModel: 'per_email',
          quantityUsed: 1,
          unitCost: 0.001,
        });

        // Log the COPPA notification
        await supabase
          .from('security_audit_log')
          .insert({
            event_type: 'coppa_notification_sent',
            details: {
              email: targetEmail,
              notificationId: result.id,
              coppaDetails,
              compliance: 'COPPA'
            }
          });

        return new Response(
          JSON.stringify({ 
            sent: true, 
            notificationId: result.id,
            messageId: result.id // Backward compatibility
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Notification Service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});