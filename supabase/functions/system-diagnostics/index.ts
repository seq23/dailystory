import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { handleHealthAndCors } from "../_shared/healthCors.ts";

// Queue test verification - 2025-01-30

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

interface DiagnosticTest {
  name: string;
  status: string;
  details: any;
}

const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle health check and CORS preflight
  const healthCorsResponse = handleHealthAndCors(req);
  if (healthCorsResponse) return healthCorsResponse;

  // Auth check: require valid JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const { createClient } = await memoizedImport('@supabase/supabase-js');
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
            openai_api_key: !!openaiApiKey,
            supabase_url: !!supabaseUrl,
            supabase_service_key: !!supabaseServiceKey
          },
          tests: [] as DiagnosticTest[]
        };

        // Test 1: Environment Variables
        diagnosticResults.tests.push({
          name: 'Environment Variables',
          status: runwareApiKey && supabaseUrl && supabaseServiceKey ? 'PASS' : 'FAIL',
          details: {
            runware_key_present: !!runwareApiKey,
            openai_key_present: !!openaiApiKey,
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
                error: error instanceof Error ? error.message : String(error)
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
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }

        return new Response(
          JSON.stringify(diagnosticResults),
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
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});