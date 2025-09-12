// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[system-diagnostics] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Force deployment sync - 2025-01-30

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation') || 'health-check';

    console.log(`System Diagnostics - Operation: ${operation}`);

    switch (operation) {
      case 'runware-diagnostic': {
        const diagnosticResults = {
          timestamp: new Date().toISOString(),
          environment: {
            runware_api_key: !!runwareApiKey,
            supabase_url: !!supabaseUrl,
            supabase_service_key: !!supabaseServiceKey
          },
          tests: []
        };

        // Test 1: Environment Variables
        diagnosticResults.tests.push({
          name: 'Environment Variables',
          status: runwareApiKey && supabaseUrl && supabaseServiceKey ? 'PASS' : 'FAIL',
          details: {
            runware_key_present: !!runwareApiKey,
            supabase_url_present: !!supabaseUrl,
            service_key_present: !!supabaseServiceKey
          }
        });

        // Test 2: Runware API Connection
        if (runwareApiKey) {
          try {
            const testPayload = {
              taskType: "imageInference",
              taskUUID: crypto.randomUUID(),
              outputType: "URL",
              outputFormat: "JPEG",
              positivePrompt: "test diagnostic image",
              model: "runware:100@1",
              numberResults: 1,
              imageInitialization: false
            };

            const response = await fetch('https://api.runware.ai/v1', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${runwareApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([testPayload])
            });

            const result = await response.json();
            
            diagnosticResults.tests.push({
              name: 'Runware API Connection',
              status: response.ok ? 'PASS' : 'FAIL',
              details: {
                response_status: response.status,
                response_ok: response.ok,
                api_response: result
              }
            });
          } catch (error) {
            diagnosticResults.tests.push({
              name: 'Runware API Connection',
              status: 'FAIL',
              details: {
                error: error.message
              }
            });
          }
        }

        // Test 3: Database Connection
        try {
          const { data, error } = await supabase
            .from('ai_prompt_debug_log')
            .select('count')
            .limit(1);

          diagnosticResults.tests.push({
            name: 'Database Connection',
            status: !error ? 'PASS' : 'FAIL',
            details: {
              connection_successful: !error,
              error: error?.message
            }
          });
        } catch (error) {
          diagnosticResults.tests.push({
            name: 'Database Connection',
            status: 'FAIL',
            details: {
              error: error.message
            }
          });
        }

        return new Response(
          JSON.stringify(diagnosticResults),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test-runware-api': {
        if (!runwareApiKey) {
          return new Response(
            JSON.stringify({ error: 'Runware API key not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const testPayload = {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          outputType: "URL",
          outputFormat: "JPEG",
          positivePrompt: "a simple test image, digital art",
          model: "runware:100@1",
          numberResults: 1,
          imageInitialization: false,
          width: 512,
          height: 512
        };

        const response = await fetch('https://api.runware.ai/v1', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${runwareApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([testPayload])
        });

        const result = await response.json();

        return new Response(
          JSON.stringify({
            test_successful: response.ok,
            status_code: response.status,
            api_response: result,
            test_payload: testPayload,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cors-testing': {
        // Simple CORS test
        return new Response(
          JSON.stringify({
            cors_test: 'successful',
            headers_present: true,
            timestamp: new Date().toISOString(),
            request_method: req.method,
            request_headers: Object.fromEntries(req.headers.entries())
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'health-check':
      default: {
        // Overall system health check
        const healthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'unknown',
            runware_api: runwareApiKey ? 'configured' : 'not_configured',
            environment: 'loaded'
          }
        };

        // Quick database check
        try {
          await supabase.from('profiles').select('count').limit(1);
          healthStatus.services.database = 'healthy';
        } catch (error) {
          healthStatus.services.database = 'error';
          healthStatus.status = 'degraded';
        }

        return new Response(
          JSON.stringify(healthStatus),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('System Diagnostics error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});