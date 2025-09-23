// DEPLOY_MARKER: 2025-09-21T00:00:00Z - FIX TIER1 PARAMS AND ESCALATION RESPONSE NORMALIZATION + BRACE FIX
// ============================================================================
// CRASH-PROOF RUNWARE IMAGE ORCHESTRATOR v2.1 (handler)
// ============================================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

import { phaseIntegrationOrchestrator } from "../_shared/PhaseIntegrationOrchestrator.js";
import { characterConsistencyService } from "../_shared/CharacterConsistencyService.js";
import { visualDetailTracker } from "../_shared/VisualDetailTracker.js";
import { CULTURAL_ARRAYS, createSeededRandom } from "../_shared/tier25Vocabulary.js";
import { getCulturalBundle } from "../_shared/StaticDataCache.js";
import * as tierLogging from "./tierLogging.js";

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

async function extractCharacterConsistencyOnly(pageText, sessionId, pageNumber, userInfo) {
  console.log("🟢 [TIER2] 🎭 [CHARACTER FALLBACK] Attempting character consistency extraction only");
  try {
    const details = await characterConsistencyService.analyzeVisualDetails(sessionId, pageText, pageNumber);
    if (details && details.mainCharacter) {
      console.log("🟢 [TIER2] ✅ [CHARACTER FALLBACK] Character details extracted successfully");
      const characterDescription = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId);
      const contextSummary = generateContextSummary(pageText);
      const minimalPrompt = `${contextSummary} Character details: ${characterDescription}`;
      return {
        success: true,
        enhancedPrompt: minimalPrompt,
        tier: "CHARACTER_CONSISTENCY_ONLY",
        metadata: { characterDetails: details, fallbackMode: true, enhancementType: "character_only" },
      };
    }
    console.log("🔴 [TIER1] ⚠️ [CHARACTER FALLBACK] No character details found");
    return null;
  } catch (err) {
    console.log(`🔴 [TIER1] ❌ [CHARACTER FALLBACK] Character consistency extraction failed: ${err}`);
    return null;
  }
}

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

    ws.onmessage = (event) => {
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

// ---------------- ENHANCED FALLBACK ----------------
async function generateEnhancedFallback(storyText, pageNumber, provider) {
  return {
    success: true,
    imageURL: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1024&h=1024&fit=crop&q=80",
    source: 'enhanced_static_fallback',
    tier: 'ENHANCED_STATIC_FALLBACK',
    provider,
    pageNumber
  };
}


// Duplicate bindTierLogger removed - using the one at line 17-25

// ============= MAIN HANDLER WITH CRASH-PROOF BOOT (GET/HEAD safe) =============
async function handleRequest(req) {
  const requestId = CoreUtils.generateRequestId();
  tierLogging.logTier2(`🎯 [${requestId}] Orchestrator: ${req.method} ${req.url}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Max-Age': '600'
      }
    });
  }

  // Belt & suspenders: any GET/HEAD still returns 200 here
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'x-health': 'true' }
      });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'runware-generate-image',
      timestamp: new Date().toISOString(),
      version: 'v2.1',
      bootStatus: CrashProofBootSystem.isHealthy() ? 'healthy' : 'degraded'
    }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }

  // Only POST beyond this point
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST', 'OPTIONS']
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

    // ===== Tier 1 forced path =====
    if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
      log.attempt('tier-1', { note: 'PhaseIntegrationOrchestrator path' });

      try {
        const orchestrator = await LazyServiceLoader.getPhaseIntegrationOrchestrator();

        // First: ai-visual-scene-creator for primaryScene + schema
        log.t2('Calling ai-visual-scene-creator', { pageNumber, previousPrimaryScene });
        const sceneResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            storyText,
            userInfo: payload.userInfo,
            sessionId,
            pageNumber,
            previousPrimaryScene
          }
        });
        if (!sceneResponse?.data || sceneResponse.error) {
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }

        const { primaryScene, aiSchema } = sceneResponse.data;
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
        log.success('tier-1', { imageUrl: result.imageURL });
      } catch (err) {
        const msg = (err && err.message) || String(err);

        if (msg.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
          log.failure('tier-1', { error: msg, escalation: 'tier-2.5A' });
          const resp = await supabase.functions.invoke('runware-template-ab', {
            body: {
              storyText,
              pageText: storyText,
              userInfo: payload.userInfo,
              sessionId,
              pageNumber: pageNumber || 1,
              templateComplexity: 'A'
            }
          });
          result = resp.data || { success: false, error: resp.error?.message || 'Tier 2.5A escalation failed' };
        } else {
          // Try character-consistency-only fallback
          log.t2('Trying character consistency fallback');
          const characterFallback = await extractCharacterConsistencyOnly(
            storyText, sessionId, pageNumber || 1, payload.userInfo
          );

          if (characterFallback && characterFallback.success) {
            try {
              const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
              const imageResult = await generateWithRunware(
                apiKey,
                characterFallback.enhancedPrompt,
                sessionId,
                requestId,
                payload.userInfo,
                payload.userInfo?.avatar,
                pageNumber || 1,
                characterFallback.metadata
              );
              result = {
                ...imageResult,
                tier: 'CHARACTER_CONSISTENCY_FALLBACK',
                usedTier: 'CHARACTER_CONSISTENCY_FALLBACK',
                fallbackReason: 'orchestrator_enhancement_failed',
                templateStructure: characterFallback.tier
              };
              log.success('tier-1', { mode: 'character_fallback', imageUrl: result.imageURL });
            } catch (charErr) {
              log.failure('tier-1', { error: (charErr && charErr.message) || String(charErr), escalation: 'tier-2.5A' });
              const resp = await supabase.functions.invoke('runware-template-ab', {
                body: {
                  storyText,
                  pageText: storyText,
                  userInfo: payload.userInfo,
                  sessionId,
                  pageNumber: pageNumber || 1,
                  templateComplexity: 'A'
                }
              });
              result = resp.data || { success: false, error: resp.error?.message || 'All fallbacks failed' };
            }
          } else {
            log.failure('tier-1', { error: msg, escalation: 'tier-2.5A' });
            const resp = await supabase.functions.invoke('runware-template-ab', {
              body: {
                storyText,
                pageText: storyText,
                userInfo: payload.userInfo,
                sessionId,
                pageNumber: pageNumber || 1,
                templateComplexity: 'A'
              }
            });
            result = resp.data || { success: false, error: resp.error?.message || 'Tier 2.5A escalation failed' };
          }
        }
      }
    }

    // Fallback if nothing succeeded
    if (!result || !result.success) {
      log.t2('Using enhanced static fallback (2.5)');
      result = await generateEnhancedFallback(storyText, pageNumber || 1, 'runware');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const message = (error && error.message) || String(error);
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
