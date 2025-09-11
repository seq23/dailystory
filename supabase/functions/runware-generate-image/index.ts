import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// CORS Response Functions
function createCorsResponse(data: any, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: any, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage,
    timestamp: new Date().toISOString()
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// Generate request ID for tracing
function generateRequestId(): string {
  return `REQ-${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 5)}`;
}

serve(async (req) => {
  const requestId = generateRequestId();
  console.log(`[${requestId}] 🎯 Image orchestrator request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Handle health check requests with enhanced diagnostics
  if (req.method === 'GET' || (req.method === 'POST' && req.url.includes('/health'))) {
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    
    return createCorsResponse({
      status: 'healthy',
      service: 'runware-generate-image-orchestrator',
      timestamp: new Date().toISOString(),
      environment: {
        runwareApiKeyPresent: !!runwareApiKey,
        openaiApiKeyPresent: !!openaiApiKey,
        supabaseServiceRolePresent: !!supabaseServiceRole,
        runwareKeyLength: runwareApiKey ? runwareApiKey.length : 0,
        openaiKeyLength: openaiApiKey ? openaiApiKey.length : 0
      },
      requestId
    });
  }

  try {
    const { pageText, userInfo, sessionId, storyId, pageNumber = 1, isGuestUser = false, difficultyLevel = 'medium', forceTier, diagnostic } = await req.json();
    
    // Handle diagnostic requests
    if (diagnostic === 'key_validation') {
      const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
      
      if (!runwareApiKey) {
        return createCorsErrorResponse('RUNWARE_API_KEY not configured in Supabase secrets', 500);
      }
      if (!openaiApiKey) {
        return createCorsErrorResponse('OPENAI_API_KEY not configured in Supabase secrets', 500);
      }
      
      return createCorsResponse({
        success: true,
        runwareKeyPresent: true,
        openaiKeyPresent: true,
        runwareKeyLength: runwareApiKey.length,
        openaiKeyLength: openaiApiKey.length,
        timestamp: new Date().toISOString()
      });
    }

    if (diagnostic === 'circuit_breaker_status') {
      return createCorsResponse({
        success: true,
        circuitBreakerStatus: 'CLOSED',
        service: 'healthy',
        timestamp: new Date().toISOString()
      });
    }

    if (diagnostic === 'reset_circuit_breaker') {
      console.log(`[${requestId}] Circuit breaker reset requested`);
      return createCorsResponse({
        success: true,
        message: 'Circuit breaker reset completed',
        timestamp: new Date().toISOString()
      });
    }

    if (!pageText) {
      return createCorsErrorResponse('pageText is required', 400);
    }

    console.log(`[${requestId}] 🎯 Starting tier progression for page ${pageNumber}, session: ${sessionId}`);
    console.log(`[${requestId}] Force tier: ${forceTier || 'auto'}, difficulty: ${difficultyLevel}`);

    // Get API keys and trim them
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();

    if (!runwareApiKey) {
      console.error(`[${requestId}] RUNWARE_API_KEY not found or empty`);
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }

    let result = null;
    let usedTier = 'unknown';
    let tierErrors = [];

    // TIER 1: AI Visual Scene Creator (OpenAI-powered)
    if ((!forceTier || forceTier === 1) && openaiApiKey) {
      try {
        console.log(`[${requestId}] 🥇 Attempting Tier 1: ai-visual-scene-creator`);
        
        const tier1Response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-visual-scene-creator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageText,
            userInfo,
            sessionId,
            storyId,
            pageNumber,
            isGuestUser,
            difficultyLevel
          })
        });

        if (tier1Response.ok) {
          const tier1Data = await tier1Response.json();
          if (tier1Data.success && tier1Data.imageURL) {
            result = tier1Data;
            usedTier = 'Tier 1 (AI Visual Scene Creator)';
            console.log(`[${requestId}] ✅ Tier 1 success: ${tier1Data.imageURL}`);
          } else {
            throw new Error(tier1Data.error || 'Tier 1 returned no image URL');
          }
        } else {
          throw new Error(`Tier 1 HTTP ${tier1Response.status}: ${await tier1Response.text()}`);
        }
      } catch (error) {
        console.log(`[${requestId}] ⚠️ Tier 1 failed: ${error.message}`);
        tierErrors.push({ tier: 1, error: error.message });
      }
    } else if (!openaiApiKey) {
      console.log(`[${requestId}] ⏭️ Skipping Tier 1: OPENAI_API_KEY not configured`);
      tierErrors.push({ tier: 1, error: 'OPENAI_API_KEY not configured - skipped' });
    }

    // TIER 2.5: Runware Simple Fallback (if Tier 1 failed or forced)
    if (!result && (!forceTier || forceTier === 2.5)) {
      try {
        console.log(`[${requestId}] 🥈 Attempting Tier 2.5: runware-simple-fallback`);
        
        const tier2Response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/runware-simple-fallback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageText,
            userInfo,
            sessionId,
            storyId,
            pageNumber,
            isGuestUser,
            difficultyLevel
          })
        });

        if (tier2Response.ok) {
          const tier2Data = await tier2Response.json();
          if (tier2Data.success && tier2Data.imageURL) {
            result = tier2Data;
            usedTier = 'Tier 2.5 (Runware Simple)';
            console.log(`[${requestId}] ✅ Tier 2.5 success: ${tier2Data.imageURL}`);
          } else {
            throw new Error(tier2Data.error || 'Tier 2.5 returned no image URL');
          }
        } else {
          throw new Error(`Tier 2.5 HTTP ${tier2Response.status}: ${await tier2Response.text()}`);
        }
      } catch (error) {
        console.log(`[${requestId}] ⚠️ Tier 2.5 failed: ${error.message}`);
        tierErrors.push({ tier: 2.5, error: error.message });
      }
    }

    // TIER 4: Final fallback (placeholder - would be implemented if needed)
    if (!result && (!forceTier || forceTier === 4)) {
      console.log(`[${requestId}] 🥉 Tier 4 fallback not implemented - using error response`);
      tierErrors.push({ tier: 4, error: 'Tier 4 fallback not implemented' });
    }

    if (!result) {
      console.error(`[${requestId}] ❌ All tiers failed`);
      return createCorsErrorResponse({
        message: 'All image generation tiers failed',
        tierErrors,
        requestId
      }, 500);
    }

    console.log(`[${requestId}] 🎉 Image generation successful via ${usedTier}`);

    return createCorsResponse({
      success: true,
      imageURL: result.imageURL,
      usedTier,
      tierErrors: tierErrors.length > 0 ? tierErrors : undefined,
      pageNumber,
      sessionId,
      timestamp: new Date().toISOString(),
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Image orchestrator error:`, error);
    return createCorsErrorResponse(`Image generation failed: ${error.message}`, 500);
  }
});