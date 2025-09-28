// DEPLOY_MARKER: 2025-09-27T15:30:00Z - Fix boot crashes: lazy orchestrator loading  
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { memoizedImport } from '../_shared/resilientLoader.ts';

// Lazy-loaded orchestrator to prevent boot crashes
let phaseIntegrationOrchestrator: any = null;

// ============================================================================
// 🎯 ORCHESTRATOR: RESILIENT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ENHANCED: Complete tier cascade logic with 1→2.5A→2.5B→Direct Mode→2.5C→SVG fallback
// ============================================================================

// TypeScript type imports
import type { UserInfo, SessionId } from "../_shared/types/index.ts";

// TypeScript interface definitions
interface TierLogger {
  t1: (msg: string, ctx?: Record<string, any>) => void;
  t2: (msg: string, ctx?: Record<string, any>) => void;
  attempt: (tier: string, ctx?: Record<string, any>) => void;
  success: (tier: string, ctx?: Record<string, any>) => void;
  failure: (tier: string, ctx?: Record<string, any>) => void;
}

interface CircuitBreakerConfig {
  DIRECT_MODE: number;
  TIER_1: number;
  AI_GENERATION: number;
  RUNWARE_API: number;
}

interface ErrorContext {
  sessionId?: string;
  requestId?: string;
  details?: any;
}

interface ValidationPayload {
  pageText?: string;
  storyText?: string;
  sessionId?: string;
  userInfo?: UserInfo;
}

// ---- Async Tier logger binder with memoized dependencies ----
async function bindTierLogger(sessionId: SessionId, requestId: string, authHeader: string | null = null): Promise<TierLogger> {
  try {
    const [{ createResilientSupabaseClient }, tierLogging] = await Promise.all([
      memoizedImport("../_shared/resilientLoader.ts"),
      memoizedImport("../_shared/tierLogging.js")
    ]);
    
    const supabaseClient = await createResilientSupabaseClient();
  
    return {
      t1: (msg, ctx = {}) => tierLogging.logTier1(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
      t2: (msg, ctx = {}) => tierLogging.logTier2(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
      attempt: (tier, ctx = {}) => tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, 'attempting', { ...ctx, authHeader }),
      success: (tier, ctx = {}) => tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
      failure: (tier, ctx = {}) => tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
    };
  } catch (error) {
    console.warn(`Failed to create Supabase client: ${error}`);
    // Return console-only logger to prevent function crashes
    return {
      t1: (msg, ctx = {}) => console.log(`[T1] ${msg}`, ctx),
      t2: (msg, ctx = {}) => console.log(`[T2] ${msg}`, ctx),
      attempt: (tier, ctx = {}) => console.log(`[${tier}] Attempting`, ctx),
      success: (tier, ctx = {}) => console.log(`[${tier}] Success`, ctx),
      failure: (tier, ctx = {}) => console.log(`[${tier}] Failure`, ctx),
    };
  }
}

// Echoing CORS with Vary headers for preflight consistency
function generateEchoCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const requestHeaders = req.headers.get('Access-Control-Request-Headers');
  
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': requestHeaders || 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin, Access-Control-Request-Headers',
  };
}

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 30) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 1A: Lightning-Fast Input Validation (50ms max)
function validatePayloadFast(payload: ValidationPayload): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");
  if (!payload.pageText && !payload.storyText) throw new Error("NO_STORY_CONTENT");
  if (!payload.sessionId && !payload.userInfo) throw new Error("NO_SESSION_ID");
  return true; // Validation passed
}

// OPTIMIZED SERVE HANDLER WITH COMPLETE TIER CASCADE
serve(async (req: Request): Promise<Response> => {
  // PHASE 1: OPTIONS fast path (immediate return)
  if (req.method === 'OPTIONS') {
    const corsHeaders = generateEchoCorsHeaders(req);
    return new Response(null, { headers: corsHeaders });
  }

  // PHASE 2: GET/HEAD health checks with environment info
  if (req.method === 'GET' || req.method === 'HEAD') {
    const runwareKey = Deno.env.get('RUNWARE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    return corsResponse({ 
      status: 'healthy',
      service: 'runware-generate-image',
      tier: 'Main Orchestrator',
      deployment_version: '2025-09-27T18:40:00Z',
      timestamp: new Date().toISOString(),
      environment: {
        runwareApiKeyPresent: !!runwareKey,
        runwareApiKeyLength: runwareKey ? runwareKey.length : 0,
        openaiApiKeyPresent: !!openaiKey,
        openaiApiKeyLength: openaiKey ? openaiKey.length : 0,
        supabaseServiceRoleKeyPresent: !!supabaseKey,
        supabaseServiceRoleKeyLength: supabaseKey ? supabaseKey.length : 0
      },
      capabilities: ["tier_orchestration", "image_generation", "complete_cascade_1_2.5A_2.5B_DirectMode_2.5C_2.5D_SVG"]
    }, req);
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, req, 405);
  }

  let payload: any;
  const requestId = `mg1${Math.random().toString(36).substring(2)}`;

  try {
    // PHASE 3: JSON parsing only after method validation
    payload = await req.json();
    console.log(`🚀 [${requestId}] runware-generate-image ready`);

    // PHASE 4: Fast validation
    validatePayloadFast(payload);
    console.log(`✅ [${requestId}] Fast validation passed`);

  } catch (error: unknown) {
    console.log(`❌ [${requestId}] Fast validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return corsResponse({ 
      error: error instanceof Error ? error.message : String(error),
      escalationTarget: "TIER_4" 
    }, req, 400);
  }

  // Main processing logic
  try {
    // PHASE 5: Load tier logger and lazy-load orchestrator
    const tierLogger = await bindTierLogger(payload.sessionId || 'unknown', requestId, req.headers.get('authorization'));


    // PHASE 6: Process request with lazy-loaded services
    tierLogger.attempt('TIER_1', { storyLength: payload.pageText?.length || payload.storyText?.length });

    // Attempt real Tier 1 processing with actual orchestrator
    console.log(`[TIER_1] Attempting orchestrator enhancement`);
    
    try {
      // Ensure orchestrator is available (lazy-load here so failures fall into Tier 1 catch)
      if (!phaseIntegrationOrchestrator) {
        try {
          const orchestratorModule = await memoizedImport("../_shared/PhaseIntegrationOrchestrator.js");
          phaseIntegrationOrchestrator = orchestratorModule.phaseIntegrationOrchestrator;
        } catch (error) {
          console.warn(`[TIER_1] Orchestrator load failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      const orchestrator = phaseIntegrationOrchestrator;
      
      // Real Tier 1 processing through orchestrator
      const enhancedPrompt = await orchestrator.getEnhancedPrompt(payload);
      
      if (!enhancedPrompt || !validatePrimarySceneQuality(enhancedPrompt.primaryScene || enhancedPrompt.enhancedPrompt || '')) {
        throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
      }

      // Real Runware image generation using WebSocket service
      const { RunwareWebSocketService } = await import('../_shared/RunwareWebSocketService.js');
      const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
      
      if (!runwareApiKey) {
        throw new Error('TIER_1_PROCESSING_FAILED: Runware API key not configured');
      }

      const imageResult = await RunwareWebSocketService.generateImage({
        apiKey: runwareApiKey,
        positivePrompt: enhancedPrompt.enhancedPrompt,
        negativePrompt: enhancedPrompt.negativePrompt || '',
        parameters: {
          width: 1024,
          height: 1024,
          model: 'runware:100@1',
          numberResults: 1,
          outputFormat: 'WEBP'
        }
      });

      if (!imageResult.success || !imageResult.imageURL) {
        throw new Error('TIER_1_PROCESSING_FAILED: Image generation failed');
      }

      // Return successful COMPLETE_TIER_1 response
      tierLogger.success('TIER_1', {
        templateStructure: 'COMPLETE_TIER_1',
        imageURL: imageResult.imageURL,
        enhancedPrompt: enhancedPrompt.enhancedPrompt,
        negativePrompt: enhancedPrompt.negativePrompt
      });

      return new Response(JSON.stringify({
        success: true,
        imageURL: imageResult.imageURL,
        provider: 'runware-websocket',
        tier: 'TIER_1',
        templateStructure: 'COMPLETE_TIER_1',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        metadata: {
          enhancedPrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt,
          primaryScene: enhancedPrompt.primaryScene,
          templateStructure: 'COMPLETE_TIER_1'
        }
      }), {
        headers: generateEchoCorsHeaders(req),
        status: 200
      });

    } catch (tier1Error: unknown) {
      const errorMessage = tier1Error instanceof Error ? tier1Error.message : String(tier1Error);
      console.log(`[TIER_1] Failed: ${errorMessage}`);
      tierLogger.failure('TIER_1', { error: errorMessage });
      
      // Create Supabase client once for all fallback attempts
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
      const internalSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      let directErrorMessage = 'Direct Mode not attempted';
      
      // CORRECTED CASCADE: Try Direct Mode first (if we have valid primaryScene)
      if (!errorMessage.includes('NO_PRIMARY_SCENE')) {
        console.log(`[DIRECT_MODE] Attempting Direct Mode fallback after Tier 1 failure`);
        
        try {
          const directModeResponse = await internalSupabase.functions.invoke('ai-visual-scene-creator', {
            body: {
              ...payload,
              directMode: true,
              tier1FailureReason: errorMessage
            }
          });
          
          if (directModeResponse.data?.success && directModeResponse.data?.imageURL) {
            const result = {
              success: true,
              imageURL: directModeResponse.data.imageURL,
              provider: 'direct-mode-fallback',
              tier: 'DIRECT_MODE',
              requestId: requestId,
              timestamp: new Date().toISOString(),
              tier1FailureReason: errorMessage,
              cascadeHistory: [
                `❌ Tier 1 Failed: ${errorMessage}`,
                '✅ Direct Mode Success'
              ]
            };
            
            tierLogger.success('DIRECT_MODE', { result });
            console.log(`SUCCESS [${requestId}] Direct Mode fallback completed`);
            
            return corsResponse({
              ...result
            }, req);
          } else {
            throw new Error('DIRECT_MODE_FAILED: ' + (directModeResponse.error?.message || 'Direct mode processing failed'));
          }
          
        } catch (directModeError: unknown) {
          directErrorMessage = directModeError instanceof Error ? directModeError.message : String(directModeError);
          console.log(`[DIRECT_MODE] Failed: ${directErrorMessage}`);
          tierLogger.failure('DIRECT_MODE', { error: directErrorMessage });
          // Continue to 2.5A cascade below
        }
      }
      
      // Try Tier 2.5A 
      console.log(`[TIER_2.5A] Attempting fallback after Direct Mode or if no primaryScene`);
      
      try {
        const tier25aResponse = await internalSupabase.functions.invoke('runware-template-ab', {
          body: {
            ...payload,
            templateComplexity: 'A',
            tier1FailureReason: errorMessage
          }
        });
        
        if (tier25aResponse.data?.success && tier25aResponse.data?.imageURL) {
          const result = {
            success: true,
            imageURL: tier25aResponse.data.imageURL,
            provider: 'tier-2.5a-fallback',
            tier: 'TIER_2.5A',
            requestId: requestId,
            timestamp: new Date().toISOString(),
            tier1FailureReason: errorMessage,
            cascadeHistory: [
              `❌ Tier 1 Failed: ${errorMessage.includes('NO_PRIMARY_SCENE') ? 'NO_PRIMARY_SCENE (missing service key)' : errorMessage}`,
              `❌ Direct Mode Failed: ${directErrorMessage}`,
              '✅ Tier 2.5A Success'
            ]
          };
          
          tierLogger.success('TIER_2.5A', { result });
          console.log(`SUCCESS [${requestId}] Tier 2.5A fallback completed`);
          
          return corsResponse({
            ...result
          }, req);
        } else {
          throw new Error('TIER_2.5A_FAILED: Template A processing failed');
        }
        
      } catch (tier25aError: unknown) {
        const tier25aErrorMessage = tier25aError instanceof Error ? tier25aError.message : String(tier25aError);
        console.log(`[TIER_2.5A] Failed: ${tier25aErrorMessage}`);
        tierLogger.failure('TIER_2.5A', { error: tier25aErrorMessage });
        
        // Try Tier 2.5B
        console.log(`[TIER_2.5B] Attempting fallback after 2.5A failure`);
        
        try {
          const tier25bResponse = await internalSupabase.functions.invoke('runware-template-ab', {
            body: {
              ...payload,
              templateComplexity: 'B',
              tier1FailureReason: errorMessage,
              tier25aFailureReason: tier25aErrorMessage
            }
          });
          
          if (tier25bResponse.data?.success && tier25bResponse.data?.imageURL) {
            const result = {
              imageURL: tier25bResponse.data.imageURL,
              provider: 'tier-2.5b-fallback',
              tier: 'TIER_2.5B',
              requestId: requestId,
              timestamp: new Date().toISOString(),
              cascadeFailures: [errorMessage, tier25aErrorMessage]
            };
            
            tierLogger.success('TIER_2.5B', { result });
            console.log(`SUCCESS [${requestId}] Tier 2.5B fallback completed`);
            
            return corsResponse({
              success: true,
              ...result
            }, req);
          } else {
            throw new Error('TIER_2.5B_FAILED: Template B processing failed');
          }
          
        } catch (tier25bError: unknown) {
          const tier25bErrorMessage = tier25bError instanceof Error ? tier25bError.message : String(tier25bError);
          console.log(`[TIER_2.5B] Failed: ${tier25bErrorMessage}`);
          tierLogger.failure('TIER_2.5B', { error: tier25bErrorMessage });
          
          // Try Tier 2.5C
          console.log(`[TIER_2.5C] Attempting fallback after Tier 2.5B failure`);
          
          try {
            const tier25cResponse = await internalSupabase.functions.invoke('runware-template-cd', {
              body: {
                ...payload,
                templateComplexity: 'C',
                tier1FailureReason: errorMessage,
                tier25aFailureReason: tier25aErrorMessage,
                tier25bFailureReason: tier25bErrorMessage
              }
            });
              
            if (tier25cResponse.data?.success && tier25cResponse.data?.imageURL) {
              const result = {
                imageURL: tier25cResponse.data.imageURL,
                provider: 'tier-2.5c-fallback',
                tier: 'TIER_2.5C',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage]
              };
              
              tierLogger.success('TIER_2.5C', { result });
              console.log(`SUCCESS [${requestId}] Tier 2.5C fallback completed`);
              
              return corsResponse({
                success: true,
                imageURL: tier25cResponse.data.imageURL,
                provider: 'tier-2.5c-fallback',
                tier: 'TIER_2.5C',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage]
              }, req);
            } else {
              const tier25cErrorMessage = tier25cResponse.data?.error || 'Unknown Tier 2.5C error'; 
              console.log(`[TIER_2.5C] Failed: ${tier25cErrorMessage}`);
              tierLogger.failure('TIER_2.5C', { error: tier25cErrorMessage });
              
              // Try Tier 2.5D before final SVG fallback
              console.log(`[TIER_2.5D] Attempting Tier 2.5D...`);
              tierLogger.attempt('TIER_2.5D');
              
              try {
                const tier25dResponse = await internalSupabase.functions.invoke('runware-template-cd', {
                  body: {
                    ...payload,
                    templateComplexity: 'D',
                    tier1FailureReason: errorMessage,
                    tier25aFailureReason: tier25aErrorMessage,
                    tier25bFailureReason: tier25bErrorMessage,
                    tier25cFailureReason: tier25cErrorMessage
                  }
                });
                
                if (tier25dResponse.data?.success) {
                  console.log(`[TIER_2.5D] Success`);
                  tierLogger.success('TIER_2.5D', { 
                    imageURL: tier25dResponse.data.imageURL?.substring(0, 50) + '...' 
                  });
                  
                  return corsResponse({
                    success: true,
                    imageURL: tier25dResponse.data.imageURL,
                    tier: 'TIER_2.5D',
                    requestId: requestId,
                    timestamp: new Date().toISOString(),
                    cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage, tier25cErrorMessage]
                  }, req);
                } else {
                  const tier25dErrorMessage = tier25dResponse.data?.error || 'Unknown Tier 2.5D error';
                  console.log(`[TIER_2.5D] Failed: ${tier25dErrorMessage}`);
                  tierLogger.failure('TIER_2.5D', { error: tier25dErrorMessage });
                  throw new Error('TIER_2.5D_FAILED: All tiers exhausted');
                }
              } catch (finalError: unknown) {
                const finalErrorMessage = finalError instanceof Error ? finalError.message : String(finalError);
                console.log(`[TIER_2.5D/SVG] Failed: ${finalErrorMessage}`);
                tierLogger.failure('TIER_2.5D', { error: finalErrorMessage });
                
                // Return SVG Tier 4 fallback as final resort
                const svgResult = {
                  imageURL: 'data:image/svg+xml;base64,' + btoa(`
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                      <rect width="512" height="512" fill="#E0F2FE"/>
                      <circle cx="256" cy="350" r="40" fill="#3B82F6" stroke="#374151" stroke-width="3"/>
                      <text x="256" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="#374151">Complete Cascade Fallback</text>
                    </svg>
                  `),
                  provider: 'svg-tier-4-fallback',
                  tier: 'SVG_TIER_4',
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                  allFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage, tier25cErrorMessage, finalErrorMessage]
                };
                
                console.log(`FALLBACK [${requestId}] SVG Tier 4 generated as final fallback`);
                
                return corsResponse({
                  success: true,
                  imageURL: svgResult.imageURL,
                  provider: svgResult.provider,
                  tier: svgResult.tier,
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                  allFailures: svgResult.allFailures
                }, req);
              }
            }
          } catch (tier25cError: unknown) {
            const tier25cErrorMessage = tier25cError instanceof Error ? tier25cError.message : String(tier25cError);
            console.log(`[TIER_2.5C] Failed: ${tier25cErrorMessage}`);
            tierLogger.failure('TIER_2.5C', { error: tier25cErrorMessage });
            
            // Final SVG fallback
            const svgResult = {
              imageURL: 'data:image/svg+xml;base64,' + btoa(`
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <rect width="512" height="512" fill="#E0F2FE"/>
                  <circle cx="256" cy="350" r="40" fill="#3B82F6" stroke="#374151" stroke-width="3"/>
                  <text x="256" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="#374151">All Tiers Failed</text>
                </svg>
              `),
              provider: 'svg-final-fallback',
              tier: 'SVG_TIER_4',
              requestId: requestId,
              timestamp: new Date().toISOString(),
              allFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage, tier25cErrorMessage]
            };
            
            console.log(`FALLBACK [${requestId}] Final SVG fallback generated`);
            
            return corsResponse({
              success: true,
              imageURL: svgResult.imageURL,
              provider: svgResult.provider,
              tier: svgResult.tier,
              requestId: requestId,
              timestamp: new Date().toISOString(),
              allFailures: svgResult.allFailures
            }, req);
          }
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Edge function error: ${errorMessage}`, error);
    return corsResponse({ 
      error: errorMessage,
      escalationTarget: "TIER_4" 
    }, req, 500);
  }
});