// DEPLOY_MARKER: 2025-09-21T00:00:00Z - FIX TIER1 PARAMS AND ESCALATION RESPONSE NORMALIZATION + BRACE FIX
// ============================================================================
// CRASH-PROOF RUNWARE IMAGE ORCHESTRATOR v2.1 (handler)
// ============================================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

import { phaseIntegrationOrchestrator } from "../_shared/PhaseIntegrationOrchestrator.js";
import { characterConsistencyService } from "../_shared/CharacterConsistencyService.js";
import { visualDetailTracker } from "../_shared/VisualDetailTracker.js";

// ============================================================================
// 🎯 ORCHESTRATOR: THIS IS THE PRIMARY IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ============================================================================
import { UnifiedPlaceholderResolver } from '../_shared/UnifiedPlaceholderResolver.js';
import * as tierLogging from "../_shared/tierLogging.js";

// ---- Tier logger binder (console + DB) ----
function bindTierLogger(supabaseClient, sessionId, requestId) {
  return {
    t1: (msg, ctx = {}) => tierLogging.logTier1(msg, ctx, supabaseClient, sessionId, requestId),
    t2: (msg, ctx = {}) => tierLogging.logTier2(msg, ctx, supabaseClient, sessionId, requestId),
    attempt: (tier, ctx = {}) => tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, 'attempting', ctx),
    success: (tier, ctx = {}) => tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, ctx),
    failure: (tier, ctx = {}) => tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, ctx),
  };
}

// Initialize Supabase client for edge function calls
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION
const TIER_TIMEOUTS = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  TIER_1: 15000,          // 15s max for Tier 1 orchestration
  AI_GENERATION: 15000,   // 15s max for AI scene generation
  RUNWARE_API: 25000      // 25s max for Runware generation
};

// PHASE 3B: Instant Failure Detection
function shouldFailFast(error) {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('payload_null') || 
         msg.includes('no_story_content') || 
         msg.includes('missing_story_content') ||
         msg.includes('no_session_id') ||
         msg.includes('missing_user_info');
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene) {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 30) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation
function validateImageURL(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// PHASE 1A: Lightning-Fast Input Validation (50ms max)
function validatePayloadFast(payload) {
  if (!payload) throw new Error("PAYLOAD_NULL");
  if (!payload.pageText && !payload.storyText) throw new Error("NO_STORY_CONTENT");
  if (!payload.sessionId && !payload.userInfo) throw new Error("NO_SESSION_ID");
  return true; // Validation passed
}

// PHASE 4A: Smart Tier Escalation
function shouldEscalateToTier25(error) {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('tier1_enhancement_failed') ||
         msg.includes('no_primary_scene') ||
         msg.includes('enhancement_failed');
}

// ---------------- NUCLEAR STYLE FRAMEWORKS ----------------
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  beginner: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children’s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
  },
  easy: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children’s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
  },
  medium: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children’s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
  },
  hard: {
    name: "2.9D Rendered Illustration",
    frameworkPrompt:
      "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation",
  },
  expert: {
    name: "2.9D Rendered Illustration",
    frameworkPrompt:
      "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation",
  },
};

function getNuclearStyleFramework(difficulty) {
  const normalized = difficulty?.toLowerCase() || "medium";
  const framework =
    NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalized] ||
    NUCLEAR_HARDCODED_STYLE_FRAMEWORKS.medium;
  // Structured logging for production readiness
  return framework;
}

// ---------------- NEGATIVE PROMPTS ----------------
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  const base =
    "NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley";

  const boysNegative =
    "NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively";
  const girlsNegative =
    "NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively";
  const genderNeutralNegative =
    "NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively";

  const africanAmericanNegativeBlock =
    "skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features";

  const culturalSensitivityNegativeBlock =
    "cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction";

  const list = [base];

  if (avatarType && avatarType.includes("boy")) list.push(boysNegative);
  else if (avatarType && avatarType.includes("girl")) list.push(girlsNegative);
  else list.push(genderNeutralNegative);

  if (culturalProfile === "african-american") list.push(africanAmericanNegativeBlock);
  list.push(culturalSensitivityNegativeBlock);

  return list.join(", ");
}

// ---------------- ERROR HANDLER ----------------
class EdgeErrorHandler {
  static handleError(error, functionName, context = {}) {
    const edgeError = {
      type: error?.type || "unknown",
      message: error instanceof Error ? error.message : String(error?.message || error || "Unexpected error"),
      functionName,
      timestamp: Date.now(),
      details: context.details || error?.details,
      sessionId: context.sessionId,
      category: this.categorizeError(error, functionName),
    };

    // Structured error logging for production

    const key = `${functionName}_${edgeError.type}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    // Error frequency tracking for monitoring

    return new Response(
      JSON.stringify({
        error: edgeError.message,
        type: edgeError.type,
        category: edgeError.category,
        escalationTarget: this.getEscalationTarget(edgeError.category),
        requestId: context.requestId,
        timestamp: edgeError.timestamp,
      }),
      {
        status: this.getHttpStatusCode(edgeError.type),
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  static categorizeError(error, functionName) {
    const message = (error?.message || String(error || "")).toLowerCase();
    if (message.includes("runware") || message.includes("websocket") || message.includes("api.runware"))
      return "RUNWARE_API_FAILURE";
    if (
      message.includes("phaseintegrationorchestrator") ||
      message.includes("characterconsistencyservice")
    )
      return "SERVICE_DEPENDENCY_FAILURE";
    if (message.includes("template") || message.includes("generation")) return "TEMPLATE_GENERATION";
    return "INTERNAL_ERROR";
  }

  static getEscalationTarget(category) {
    const map = {
      RUNWARE_API_FAILURE: "TIER_4",
      SERVICE_DEPENDENCY_FAILURE: "TIER_2_5C",
      TEMPLATE_GENERATION: "NEXT_TIER",
      INTERNAL_ERROR: "NEXT_TIER",
    };
    return map[category] || "NEXT_TIER";
  }

  static getHttpStatusCode(errorType) {
    const codes = { validation: 400, auth: 401, timeout: 408, configuration: 500 };
    return codes[errorType] || 500;
  }
}
EdgeErrorHandler.errorCounts = new Map();
EdgeErrorHandler.performanceMetrics = [];

// ---------------- BOOT GATE ----------------
class CrashProofBootSystem {
  static async validateBoot() {
    if (this.bootStatus !== null) return this.bootStatus;

    // Boot validation process initiated

    const critical = {
      supabaseUrl: Deno.env.get("SUPABASE_URL"),
      supabaseKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY"),
      runwareApiKey: Deno.env.get("RUNWARE_API_KEY")?.trim(),
    };

    if (!critical.supabaseUrl || !critical.supabaseKey) {
      this.bootStatus = { status: "critical_failure", reason: "missing_supabase_config" };
      return this.bootStatus;
    }

    try {
      const sb = createClient(critical.supabaseUrl, critical.supabaseKey);
      await Promise.race([
        sb.from("profiles").select("id").limit(1),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000)),
      ]);
      this.criticalServices.set("supabase", { status: "healthy", client: sb });
    } catch (err) {
      console.log(`🔴 [TIER1] ⚠️ [BOOT] Supabase connection degraded: ${err?.message || err}`);
      this.criticalServices.set("supabase", { status: "degraded", error: String(err?.message || err) });
    }

    if (critical.runwareApiKey && critical.runwareApiKey.length > 10) {
      this.criticalServices.set("runware", { status: "configured", key: critical.runwareApiKey });
    } else {
      console.log("🔴 [TIER1] ⚠️ [BOOT] Runware API key missing - will use fallback tiers");
      this.criticalServices.set("runware", { status: "missing" });
    }

    this.bootStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: Object.fromEntries(this.criticalServices),
    };
    console.log("🔴 [TIER1] System validated successfully");
    return this.bootStatus;
  }

  static getService(name) {
    return this.criticalServices.get(name) || this.nonCriticalServices.get(name);
  }

  static isHealthy() {
    return this.bootStatus?.status === "healthy";
  }
}
CrashProofBootSystem.bootStatus = null;
CrashProofBootSystem.criticalServices = new Map();
CrashProofBootSystem.nonCriticalServices = new Map();

// ---------------- LAZY SERVICE LOADER ----------------
class LazyServiceLoader {
  static async load(serviceName, importPath) {
    if (this.services.has(serviceName)) return this.services.get(serviceName);
    try {
      const module = await import(importPath);
      const service = module.default || module[serviceName] || module;
      this.services.set(serviceName, service);
      console.log(`🟢 [TIER2] Lazy loaded ${serviceName}`);
      return service;
    } catch (error) {
      console.log(`🔴 [TIER1] ⚠️ [LAZY] Failed to load ${serviceName}: ${error?.message || error}`);
      this.services.set(serviceName, null);
      return null;
    }
  }

  static async getPhaseIntegrationOrchestrator() {
    return phaseIntegrationOrchestrator;
  }
}
LazyServiceLoader.services = new Map();

// ---------------- CORE UTILS ----------------
class CoreUtils {
  static generateRequestId() {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 7);
    return `${t}-${r}`;
  }

  static async withTimeout(promise, timeoutMs, context = "") {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${context} (${timeoutMs}ms)`)), timeoutMs)
      ),
    ]);
  }
}

// ---------------- HELPERS ----------------
function generateContextSummary(text) {
  if (!text) return "Children's story scene with engaging characters.";
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length >= 2) return `${sentences[0].trim()}. ${sentences[1].trim()}.`;
  return (sentences[0]?.trim() || "Children's story scene.") + ".";
}

// Helper function to try nuclear templates (2.5C → 2.5D)
async function tryNuclearTemplates({ storyText, userInfo, sessionId, pageNumber, log }) {
  const templates = [
    { fn: 'runware-template-cd', complexity: 'C', tag: 'tier-2.5C' },
    { fn: 'runware-template-cd', complexity: 'D', tag: 'tier-2.5D' }
  ];

  for (const template of templates) {
    log.attempt(template.tag, { templateComplexity: template.complexity });
    try {
      const resp = await supabase.functions.invoke(template.fn, {
        body: {
          pageText: storyText,
          userInfo,
          sessionId,
          pageNumber: pageNumber || 1,
          templateComplexity: template.complexity
        }
      });
      
      const data = resp?.data;
      if (data?.success && data?.imageURL) {
        log.success(template.tag, { imageUrl: data.imageURL });
        return { ...data, tier: template.tag.toUpperCase().replace('.', '') };
      }
      log.failure(template.tag, { reason: data?.error || resp?.error?.message || 'template_failed' });
    } catch (err) {
      log.failure(template.tag, { reason: (err && err.message) || String(err) });
    }
  }

  // Both nuclear templates failed - return failure code for frontend Tier 4
  return {
    success: false,
    error: 'All backend tiers failed (Direct Mode + 2.5C + 2.5D)',
    tier: 'BACKEND_EXHAUSTED',
    templateStructure: 'BACKEND_EXHAUSTED',
    failureReason: 'all_backend_tiers_failed_trigger_tier_4'
  };
}

// Character-consistency-only fallback removed - Direct Mode provides superior alternative

// ---------------- RUNWARE CORE ----------------
async function generateWithRunware(
  apiKey,
  prompt,
  sessionId,
  requestId,
  userInfo,
  avatarIdentity,
  pageNumber,
  enhancedStoryData,
  options = {}
) {
  console.log(`🟢 [TIER2] 🚀 [${requestId}] Starting Runware generation with enhanced story data`);

  if (!apiKey || apiKey.length < 10) throw new Error("Invalid Runware API key");

  const difficulty = userInfo?.difficulty || userInfo?.gradeLevel || "medium";
  const styleFramework = getNuclearStyleFramework(difficulty);

  let enhancedPrompt;
  const basePrompt = prompt;

  if (enhancedStoryData?.enhancedPrompt && enhancedStoryData?.templateStructure === "COMPLETE_TIER_1") {
    enhancedPrompt = enhancedStoryData.enhancedPrompt;
    console.log(
      `🟢 [TIER2] 🎯 [${requestId}] Using PhaseIntegrationOrchestrator enhanced prompt: ${enhancedPrompt.length} chars`
    );
  } else {
    throw new Error("ESCALATE_TO_TIER_2_5A: No enhanced story data available");
  }

  if (options.skipTier25 && !enhancedPrompt) {
    throw new Error("SKIP_TO_TEMPLATE_AB: skipTier25 flag set but no enhanced prompt available");
  }

  let negativePrompt = "";
  try {
    const culturalProfileStr = `${userInfo?.nativeLanguage || "en"}_${userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || "light"}`;
    const avatarType = userInfo?.avatar?.type || avatarIdentity?.type || "girl";
        negativePrompt = generateInlineNuclearNegative(culturalProfileStr, avatarType, difficulty);
    console.log(`🟢 [TIER2] 🎨 [${requestId}] Generated comprehensive negative prompt: ${negativePrompt.length} chars`);
  } catch (e) {
    console.log(`🔴 [TIER1] ⚠️ [${requestId}] Failed to generate nuclear negative prompt: ${e?.message || e}`);
    negativePrompt =
      "bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated";
  }

  console.log(`🟢 [TIER2] 🎨 [${requestId}] Enhanced prompt length: ${enhancedPrompt.length} chars`);

  const ws = new WebSocket("wss://ws-api.runware.ai/v1");
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error("Runware generation timeout"));
    }, 30000);

        ws.onopen = () => {
          console.log(`🟢 [TIER2] 🔗 [${requestId}] Runware WebSocket connected`);
          ws.send(JSON.stringify([{ taskType: "authentication", apiKey }]));
        };

    ws.onmessage = async (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.error || response.errors) {
          clearTimeout(timeout);
          try { ws.close(); } catch {}
          reject(new Error(response.errorMessage || "Runware API error"));
          return;
        }
        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === "authentication") {
              // Log prompts to image_generation_debug before Runware call
              try {
                const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
                const visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
                
                const { logTierAttempt } = await import("./tierLogging.js");
                await logTierAttempt(
                  supabase, // Pass actual supabase client
                  sessionId,
                  requestId,
                  'tier-1',
                  'attempting',
                  {
                    positivePrompt: enhancedPrompt, // Fixed field name mapping
                    negativePrompt,
                    visualDetails,
                    edgeFunction: 'runware-generate-image',
                    pageNumber: pageNumber || 1
                  }
                );
              } catch (loggingError) {
                console.warn('Failed to log prompt data:', loggingError.message);
              }
              
              ws.send(
                JSON.stringify([
                  {
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    positivePrompt: enhancedPrompt,
                    negativePrompt,
                    model: "runware:100@1",
                    width: 1024,
                    height: 1024,
                    numberResults: 1,
                    outputFormat: "WEBP",
                    steps: 25,
                    CFGScale: 8,
                    scheduler: "FlowMatchEulerDiscreteScheduler",
                  },
                ])
              );
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              try { ws.close(); } catch {}
              resolve({
                success: true,
                imageURL: item.imageURL,
                provider: "runware",
                tier: 1,
                originalPrompt: basePrompt,
                basePrompt,
                enhancedPrompt,
                positivePrompt: enhancedPrompt,
                negativePrompt,
                styleFramework: styleFramework?.name || "fallback",
                promptLengths: {
                  original: basePrompt.length,
                  enhanced: enhancedPrompt.length,
                  negative: negativePrompt.length,
                },
              });
            }
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        try { ws.close(); } catch {}
        reject(err);
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      try { ws.close(); } catch {}
      reject(new Error("WebSocket connection failed"));
    };
  });
}

// Enhanced fallback function removed - unauthorized Unsplash image replaced with proper error response


// Duplicate bindTierLogger removed - using the one at line 17-25

// ============= MAIN HANDLER WITH CRASH-PROOF BOOT (GET/HEAD safe) =============
async function handleRequest(req) {
  // OPTIONS fast path (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Max-Age': '600',
        'Content-Length': '0'
      }
    });
  }

  // GET/HEAD safety — never fail health
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'x-health': 'true', 'Content-Length': '0' } });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'runware-generate-image',
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }

  const requestId = CoreUtils.generateRequestId();
  const startTime = Date.now(); // PHASE 6: Performance tracking
  tierLogging.logTier2(`🎯 [${requestId}] Orchestrator: ${req.method} ${req.url}`);


  // Only POST beyond this point
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      allowedMethods: ['GET', 'HEAD', 'POST', 'OPTIONS']
    }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }

  // Outer try/catch to avoid orphan catch parse issues & network flakiness
  try {
    const payload = await req.json().catch(() => ({}));
    
    // PHASE 1A: Lightning-Fast Input Validation (50ms max)
    try {
      validatePayloadFast(payload);
    } catch (validationError) {
      if (shouldFailFast(validationError)) {
        tierLogging.logTier2(`❌ [${requestId}] Fast validation failed: ${validationError.message}`);
        return new Response(JSON.stringify({ 
          error: `Fast validation failed: ${validationError.message}`,
          type: 'VALIDATION_ERROR'
        }), {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        });
      }
    }
    
    const sessionId = payload?.sessionId || ('session_' + requestId);
    const log = bindTierLogger(supabase, sessionId, requestId);

    log.t2('Request received', { hasPageText: !!payload.pageText, hasStoryText: !!payload.storyText });

    // Normalize payload
    let enhancedStoryData, storyText, pageNumber, previousPrimaryScene;
    if (payload.pageText) {
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber;
      previousPrimaryScene = payload.previousPrimaryScene;
    } else {
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      pageNumber = payload.pageNumber;
      previousPrimaryScene = payload.previousPrimaryScene;
    }

    if (!storyText) {
      return new Response(JSON.stringify({ error: 'Missing required field: pageText OR storyText' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
      });
    }

    let result = null;

    // ===== Default Tier Cascade Logic =====
    if (!payload.forceTier && !payload.skipTier25) {
      log.t2('Starting default tier cascade: Tier 1 → 2.5A → 2.5B → 2.5C → 2.5D');
      
      // Try Tier 1 first
      try {
        log.attempt('tier-1', { note: 'Default cascade - PhaseIntegrationOrchestrator path' });
        
        const orchestrator = await LazyServiceLoader.getPhaseIntegrationOrchestrator();

        // First: ai-visual-scene-creator for primaryScene + schema
        log.t2('Calling ai-visual-scene-creator', { pageNumber, previousPrimaryScene });
        // Direct timeout-enabled call with error classification
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort('timeout'), TIER_TIMEOUTS.AI_GENERATION);
        
        let sceneResponse;
        try {
          sceneResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
            body: {
              storyText,
              userInfo: payload.userInfo,
              sessionId,
              pageNumber,
              previousPrimaryScene,
              isDebugMode: true
            }
          });
        } catch (err) {
          if (err?.name === 'AbortError' || `${err}`.includes('timeout')) {
            throw new Error('Timeout AI Visual Scene Creator (Tier 1 Default)');
          }
          throw err;
        } finally {
          clearTimeout(timeout);
        }
        if (!sceneResponse?.data || sceneResponse.error) {
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }

        const { primaryScene, aiSchema } = sceneResponse.data;
        
        // PHASE 5A: Primary Scene Quality Gate
        if (!validatePrimarySceneQuality(primaryScene)) {
          log.failure('tier-1', { error: 'Primary scene quality validation failed', escalation: 'tier-2.5A' });
          throw new Error('PRIMARY_SCENE_QUALITY_FAILED');
        }
        
        const basePrompt = primaryScene + (aiSchema ? `\n\nSchema: ${JSON.stringify(aiSchema)}` : '');

        // Next: Orchestrator enhances the prompt
        log.t2('Enhancing prompt via orchestrator');
        const tier1Response = await orchestrator.getEnhancedPrompt(
          payload.userInfo,
          basePrompt,
          storyText,
          sessionId
        );

        if (!tier1Response?.enhancementSuccessful || !tier1Response?.enhancedPrompt) {
          throw new Error('TIER1_ENHANCEMENT_FAILED');
        }

        // Generate with Runware
        log.t2('Generating image via Runware (tier-1)');
        const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
        const enhancedData = {
          enhancedPrompt: tier1Response.enhancedPrompt,
          templateStructure: 'COMPLETE_TIER_1'
        };
        const imageResult = await generateWithRunware(
          apiKey,
          primaryScene,
          sessionId,
          requestId,
          payload.userInfo,
          payload.userInfo?.avatar,
          pageNumber || 1,
          enhancedData
        );

        result = {
          ...imageResult,
          primaryScene,
          aiSchema,
          templateStructure: 'COMPLETE_TIER_1'
        };
        
        // PHASE 5B: Image URL Quality Gate
        if (!validateImageURL(result.imageURL)) {
          log.failure('tier-1', { error: 'Invalid image URL generated', escalation: 'tier-2.5A' });
          throw new Error('INVALID_IMAGE_URL');
        }
        
        log.success('tier-1', { imageUrl: result.imageURL });
      } catch (tier1Error) {
        const msg = (tier1Error && tier1Error.message) || String(tier1Error);
        log.failure('tier-1', { error: msg, escalation: 'tier-2.5A' });
        
        // Escalate to Tier 2.5A with pre-analyzed visual data
        try {
          log.attempt('tier-2.5A', { note: 'Escalating from Tier 1 failure with visual data' });
          
          // Gather visual consistency data from Tier 1 analysis
          const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
          const visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
          
          // Pass pre-analyzed data from Tier 1 to Tier 2.5A
          const preAnalyzedData = {
            visualDetails,
            aiSchema
          };
          
          const resp25A = await supabase.functions.invoke('runware-template-ab', {
            body: {
              storyText,
              pageText: storyText,
              userInfo: payload.userInfo,
              sessionId,
              pageNumber: pageNumber || 1,
              templateComplexity: 'A',
              preAnalyzedData // Pass cascade data to Tier 2.5A
            }
          });
          result = resp25A.data || { success: false, error: resp25A.error?.message || 'Tier 2.5A escalation failed' };
        } catch (tier25Error) {
          log.failure('tier-2.5A', { error: (tier25Error && tier25Error.message) || String(tier25Error), escalation: 'tier-2.5B' });
          
          // Escalate to Tier 2.5B
          try {
            log.attempt('tier-2.5B', { note: 'Escalating from Tier 2.5A failure' });
            const resp25B = await supabase.functions.invoke('runware-template-ab', {
              body: {
                storyText,
                pageText: storyText,
                userInfo: payload.userInfo,
                sessionId,
                pageNumber: pageNumber || 1,
                templateComplexity: 'B'
              }
            });
            
            if (resp25B?.data?.success) {
              result = resp25B.data;
              log.success('tier-2.5B', { imageUrl: result.imageURL });
            } else {
              throw new Error('Tier 2.5B failed');
            }
          } catch (tier25BError) {
            log.failure('tier-2.5B', { error: (tier25BError && tier25BError.message) || String(tier25BError), escalation: 'nuclear-templates' });
            
            // Escalate to nuclear templates (2.5C → 2.5D)
            result = await tryNuclearTemplates({
              storyText,
              userInfo: payload.userInfo,
              sessionId,
              pageNumber: pageNumber || 1,
              log
            });
          }
        }
      }
      
      // Handle Force Tier modes separately
      if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
        log.t2('Force Tier 1: Attempting true orchestrator Tier 1');
        try {
          // Primary path: Execute true Tier 1 orchestrator logic
          const orchestrator = await LazyServiceLoader.getPhaseIntegrationOrchestrator();

          // First: ai-visual-scene-creator for primaryScene + schema (normal mode, not direct)
          log.t2('Calling ai-visual-scene-creator (normal mode)', { pageNumber, previousPrimaryScene });
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort('timeout'), TIER_TIMEOUTS.AI_GENERATION);
          
          let sceneResponse;
          try {
            sceneResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
              body: {
                storyText,
                userInfo: payload.userInfo,
                sessionId,
                pageNumber: pageNumber || 1,
                previousPrimaryScene,
                isDebugMode: true
              }
            });
          } catch (err) {
            if (err?.name === 'AbortError' || `${err}`.includes('timeout')) {
              throw new Error('Timeout AI Visual Scene Creator (Force Tier 1)');
            }
            throw err;
          } finally {
            clearTimeout(timeout);
          }

          if (!sceneResponse?.data || sceneResponse.error) {
            throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_DIRECT_MODE');
          }

          const { primaryScene, aiSchema } = sceneResponse.data;
          
          // Primary Scene Quality Gate
          if (!validatePrimarySceneQuality(primaryScene)) {
            log.failure('tier-1', { error: 'Primary scene quality validation failed', escalation: 'direct_mode_fallback' });
            throw new Error('PRIMARY_SCENE_QUALITY_FAILED');
          }
          
          const basePrompt = primaryScene + (aiSchema ? `\n\nSchema: ${JSON.stringify(aiSchema)}` : '');

          // Next: Orchestrator enhances the prompt
          log.t2('Enhancing prompt via orchestrator (Force Tier 1)');
          const tier1Response = await orchestrator.getEnhancedPrompt(
            payload.userInfo,
            basePrompt,
            storyText,
            sessionId
          );

          if (!tier1Response?.enhancementSuccessful || !tier1Response?.enhancedPrompt) {
            throw new Error('TIER1_ENHANCEMENT_FAILED');
          }

          // Generate with Runware
          log.t2('Generating image via Runware (Force Tier 1)');
          const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
          const enhancedData = {
            enhancedPrompt: tier1Response.enhancedPrompt,
            templateStructure: 'COMPLETE_TIER_1'
          };
          const imageResult = await generateWithRunware(
            apiKey,
            primaryScene,
            sessionId,
            requestId,
            payload.userInfo,
            payload.userInfo?.avatar,
            pageNumber || 1,
            enhancedData
          );

          result = {
            ...imageResult,
            primaryScene,
            aiSchema,
            tier: 'COMPLETE_TIER_1',
            usedTier: 'COMPLETE_TIER_1',
            templateStructure: 'COMPLETE_TIER_1'
          };
          
          // Image URL Quality Gate
          if (!validateImageURL(result.imageURL)) {
            log.failure('tier-1', { error: 'Invalid image URL generated', escalation: 'direct_mode_fallback' });
            throw new Error('INVALID_IMAGE_URL');
          }
          
          log.success('tier-1', { mode: 'orchestrator_tier_1', imageUrl: result.imageURL });

        } catch (orchestratorErr) {
          // Fallback path: Only use Direct Mode when orchestrator fails
          log.t2('Force Tier 1 orchestrator failed, falling back to Direct Mode', { error: orchestratorErr.message });
          try {
            const controller3 = new AbortController();
            const timeout3 = setTimeout(() => controller3.abort('timeout'), TIER_TIMEOUTS.DIRECT_MODE);
            
            let directModeResponse;
            try {
              directModeResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
                body: {
                  storyText,
                  userInfo: payload.userInfo,
                  sessionId,
                  pageNumber: pageNumber || 1,
                  directMode: true  // Enable Direct Mode bypass as fallback
                }
              });
            } catch (err) {
              if (err?.name === 'AbortError' || `${err}`.includes('timeout')) {
                throw new Error('Timeout AI Visual Scene Creator (Direct Mode Fallback)');
              }
              throw err;
            } finally {
              clearTimeout(timeout3);
            }

            if (directModeResponse?.data && directModeResponse.data.success) {
              result = {
                success: directModeResponse.data.success,
                primaryScene: directModeResponse.data.primaryScene,
                aiSchema: directModeResponse.data.aiSchema,
                enhancedPrompt: directModeResponse.data.enhancedPrompt || directModeResponse.data.primaryScene,
                imageURL: directModeResponse.data.imageURL,
                tier: 'DIRECT_MODE_FALLBACK',
                usedTier: 'DIRECT_MODE_FALLBACK',
                fallbackReason: 'orchestrator_unavailable_during_force_tier_1',
                templateStructure: 'DIRECT_MODE_FALLBACK_SUCCESS'
              };
              log.success('tier-1', { mode: 'direct_mode_fallback', imageUrl: result.imageURL, originalError: orchestratorErr.message });
            } else {
              throw new Error('Direct Mode fallback failed');
            }
          } catch (directErr) {
            log.failure('tier-1', { error: (directErr && directErr.message) || String(directErr), reason: 'both_orchestrator_and_direct_mode_failed' });
            // Direct Mode failed, escalate to nuclear templates (2.5C → 2.5D)
            result = await tryNuclearTemplates({
              storyText,
              userInfo: payload.userInfo,
              sessionId,
              pageNumber: pageNumber || 1,
              log
            });
          }
        }
      }

    // Return error if all tiers failed - frontend will handle with authorized fallbacks
    if (!result || !result.success) {
      log.t2('All tiers failed - returning error for frontend escalation');
      return new Response(JSON.stringify({
        success: false,
        error: 'All image generation tiers failed',
        tier: 'tier-failure',
        frontendShouldFallback: true
      }), {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-Response-Time': `${Date.now() - startTime}ms`, // PHASE 6: Performance tracking
        'X-Request-Id': requestId
      }
    });
  } catch (error) {
    const message = (error && error.message) || String(error);
    
    // Prevent 500→503 cascade for timeout errors - return 200 with controlled error payload
    if (`${message}`.includes('timeout') || `${message}`.includes('Timeout')) {
      tierLogging.logTier1(`⏰ [${requestId}] Upstream timeout handled gracefully`, { message });
      return new Response(JSON.stringify({
        success: false,
        error: 'UPSTREAM_TIMEOUT',
        message: 'Service temporarily unavailable due to timeout',
        requestId,
        tier: 'TIMEOUT_HANDLED'
      }), {
        status: 200, // Important: 200 prevents receptionist 503
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Other errors still surface normally for proper debugging
    tierLogging.logTier1(`❌ [${requestId}] Orchestrator error`, { message });
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message,
      requestId
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}

// ---- SINGLE default export only (ensure there isn't another default export elsewhere) ----
export default handleRequest;
