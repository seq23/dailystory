// DEPLOY_MARKER: 2025-01-30T21:45:00Z - OPTION A RECEPTIONIST PATTERN IMPLEMENTATION
// ================================================================================
// STRENGTHENED TYPESCRIPT RECEPTIONIST - BOOT FAILURE ELIMINATION SYSTEM
// ================================================================================
//
// IMPLEMENTATION: Option A - Self-Contained TypeScript Receptionist  
// PURPOSE: Eliminate 503 boot failures through robust entry point architecture
// PATTERN: TypeScript file handles CORS + imports entire JS implementation
//
// SYNC ANOMALY PROTECTION:
// - Supabase may show "Module not found: index.js" in logs (FALSE POSITIVE)
// - Files exist and function correctly despite log warnings
// - This receptionist pattern provides fallback responses during sync delays
//
// ROLLBACK PROCEDURE:
// - If issues occur, revert to previous shim pattern
// - Restore backup files if available
// - Update DEPLOY_MARKER to force fresh deployment
//
// VERIFICATION STEPS:
// 1. Check file existence in GitHub repository
// 2. Test function execution (should work despite log errors)
// 3. Monitor analytics for boot success rate improvement
// ================================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Preload so bundler includes this file in the shipped artifact
import './index.js';

// Main serve function with strengthened error handling
serve(async (req) => {
  // Handle CORS preflight requests directly in TypeScript receptionist
  if (req.method === 'OPTIONS') {
    console.log('🔄 [TypeScript Receptionist] CORS preflight request handled');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Handle GET health check requests directly (no dynamic import needed)
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('🏥 [TypeScript Receptionist] Health check request handled');
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'runware-template-ab',
      timestamp: new Date().toISOString(),
      environment: {
        hasRunwareKey: !!Deno.env.get('RUNWARE_API_KEY'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL')
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Import the actual JavaScript implementation
    // This dynamic import provides sync anomaly protection
    const { default: handleRequest } = await import(new URL('./index.js', import.meta.url).href);
    
    console.log('✅ [TypeScript Receptionist] Successfully imported JavaScript implementation');
    
    // Execute the actual implementation
    return await handleRequest(req);
    
  } catch (importError) {
    // Fallback response during sync anomalies or import failures
    console.error('⚠️ [TypeScript Receptionist] Import fallback activated:', importError.message);
    
    // Provide graceful degradation with CORS support
    const fallbackResponse = {
      error: 'Service temporarily unavailable during deployment sync',
      code: 'IMPORT_SYNC_ANOMALY', 
      message: 'Please retry in a few moments. This is typically resolved automatically.',
      timestamp: new Date().toISOString(),
      details: 'TypeScript receptionist active - JavaScript implementation syncing'
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '30'
      }
    });
  }
});

// Boot validation logging
console.log('🎯 [TypeScript Receptionist] Strengthened Runware Template AB v2.2 initialized');
console.log('🔒 [Boot Protection] Option A pattern active - sync anomaly protection enabled');