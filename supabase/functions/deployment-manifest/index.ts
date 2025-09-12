// TEMPORARY DIAGNOSTIC FUNCTION - Will be removed after translate-universal fix
// Created: 2025-01-23T03:00:00Z
console.log("[deployment-manifest] Diagnostic function loaded");

import { serve } from "https://deno.land/std@0.190.0/http/server.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[deployment-manifest] Function called for diagnostics');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Attempt to list what's available in the deployed function directory structure
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      purpose: "Diagnose translate-universal deployment packaging issue",
      checks: {
        // Check if we can access translate-universal files
        translate_universal_check: await checkFileExists('/functions/translate-universal/index.ts'),
        current_function_path: '/functions/deployment-manifest/index.ts',
        deployment_env: {
          deno_version: Deno.version.deno,
          has_openai_key: !!Deno.env.get('OPENAI_API_KEY'),
        }
      }
    };
    
    console.log('[deployment-manifest] Diagnostic info:', diagnosticInfo);
    
    return new Response(
      JSON.stringify(diagnosticInfo, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[deployment-manifest] Diagnostic error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Diagnostic failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function checkFileExists(path: string): Promise<boolean> {
  try {
    // In Deno Deploy, we can't actually check the filesystem directly
    // But we can try to import the function to see if it's available
    console.log(`[deployment-manifest] Checking availability of: ${path}`);
    return false; // Will always return false in this environment, but logs the attempt
  } catch (error) {
    console.error(`[deployment-manifest] File check error for ${path}:`, error);
    return false;
  }
}