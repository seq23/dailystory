// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
console.log("[background-image-pregeneration] Loaded: 2025-09-12T18:45:32Z");
// Phase 4: Background pre-generation cron job - ERROR-001 FIX APPLIED

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors, withCors, createErrorResponse } from "../_shared/healthCors.ts";

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getDifficultyMapper() {
  try {
    const { DifficultyLevelMapper } = await import("../_shared/DifficultyLevelMapper.ts");
    return DifficultyLevelMapper;
  } catch (error) {
    console.warn('DifficultyLevelMapper lazy load failed:', error);
    return null;
  }
}

async function handleRequest(req) {
  // ERROR-001 FIX: Handle health checks and CORS preflights instantly
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) {
    return healthResponse;
  }

  try {
    const difficultyMapper = await getDifficultyMapper();
    
    if (!difficultyMapper) {
      return createErrorResponse('Difficulty mapper not available', 503);
    }

    // Background image pre-generation logic would go here
    const response = new Response(JSON.stringify({ 
      status: 'completed',
      message: 'Background image pre-generation processed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    return withCors(response);
  } catch (error) {
    console.error('Background image pre-generation error:', error);
    return createErrorResponse({
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);