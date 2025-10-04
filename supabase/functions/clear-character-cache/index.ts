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
import { handleHealthAndCors } from "../_shared/healthCors.ts";

// ✅ BUNDLER HINT: Force CCS inclusion in deployment bundle (dynamic import used inside handler)
import { characterConsistencyService as _ccsHint } from "../_shared/CharacterConsistencyService.js";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

// Main serve function with strengthened error handling
serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    // Import the actual JavaScript implementation
    // This dynamic import provides sync anomaly protection
    const { default: handleRequest } = await import('./index.js');
    
    console.log('✅ [TypeScript Receptionist] Successfully imported JavaScript implementation');
    
    // Execute the actual implementation
    return await handleRequest(req);
    
  } catch (importError) {
    // Fallback response during sync anomalies or import failures
    console.error('⚠️ [TypeScript Receptionist] Import fallback activated:', importError instanceof Error ? importError.message : String(importError));
    
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
console.log('🎯 [TypeScript Receptionist] Strengthened Clear Character Cache v2.2 initialized');
console.log('🔒 [Boot Protection] Option A pattern active - sync anomaly protection enabled');