// DEPLOY_MARKER: 2025-09-26T18:00:00Z - Pure TypeScript implementation (no receptionist)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// ============================================================================
// 🎯 ORCHESTRATOR: PURE TYPESCRIPT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// Converted from receptionist pattern to pure TypeScript implementation
// ============================================================================
import * as tierLogging from "../_shared/tierLogging.js";

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

interface StyleFramework {
  name: string;
  frameworkPrompt: string;
}

interface EdgeError {
  type: string;
  message: string;
  functionName: string;
  timestamp: number;
  details?: any;
  sessionId?: string;
  category: string;
}

interface BootStatus {
  status: string;
  reason?: string;
  timestamp?: string;
  services?: Record<string, any>;
}

// ---- Tier logger binder (console + DB) ----
function bindTierLogger(supabaseClient: any, sessionId: SessionId, requestId: string, authHeader: string | null = null): TierLogger {
  return {
    t1: (msg, ctx = {}) => tierLogging.logTier1(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
    t2: (msg, ctx = {}) => tierLogging.logTier2(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
    attempt: (tier, ctx = {}) => tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, 'attempting', { ...ctx, authHeader }),
    success: (tier, ctx = {}) => tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
    failure: (tier, ctx = {}) => tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
  };
}

// Initialize Supabase client for edge function calls
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// CORS utilities  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION
const TIER_TIMEOUTS: CircuitBreakerConfig = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  TIER_1: 15000,          // 15s max for Tier 1 orchestration
  AI_GENERATION: 15000,   // 15s max for AI scene generation
  RUNWARE_API: 25000      // 25s max for Runware generation
};

// PHASE 3B: Instant Failure Detection
function shouldFailFast(error: any): boolean {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('payload_null') || 
         msg.includes('no_story_content') || 
         msg.includes('missing_story_content') ||
         msg.includes('no_session_id') ||
         msg.includes('missing_user_info');
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 30) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation
function validateImageURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// PHASE 1A: Lightning-Fast Input Validation (50ms max)
function validatePayloadFast(payload: ValidationPayload): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");
  if (!payload.pageText && !payload.storyText) throw new Error("NO_STORY_CONTENT");
  if (!payload.sessionId && !payload.userInfo) throw new Error("NO_SESSION_ID");
  return true; // Validation passed
}

// PHASE 4A: Smart Tier Escalation
function shouldEscalateToTier25(error: any): boolean {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('tier1_enhancement_failed') ||
         msg.includes('no_primary_scene') ||
         msg.includes('enhancement_failed');
}

// ---------------- NUCLEAR STYLE FRAMEWORKS ----------------
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS: Record<string, StyleFramework> = {
  beginner: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
  },
  easy: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
  },
  medium: {
    name: "Contemporary Children's Book Illustration",
    frameworkPrompt:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
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

function getNuclearStyleFramework(difficulty: string): StyleFramework {
  const normalized = difficulty?.toLowerCase() || "medium";
  const framework =
    NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalized] ||
    NUCLEAR_HARDCODED_STYLE_FRAMEWORKS.medium;
  // Structured logging for production readiness
  return framework;
}

// ---------------- NEGATIVE PROMPTS ----------------
function generateInlineNuclearNegative(culturalProfile: string, avatarType: string, difficulty: string): string {
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
  static errorCounts: Map<string, number> = new Map();
  static performanceMetrics: any[] = [];

  static handleError(error: any, functionName: string, context: ErrorContext = {}): Response {
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

  static categorizeError(error: any, functionName: string): string {
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

  static getEscalationTarget(category: string): string {
    const map: Record<string, string> = {
      RUNWARE_API_FAILURE: "TIER_4",
      SERVICE_DEPENDENCY_FAILURE: "TIER_2_5C",
      TEMPLATE_GENERATION: "NEXT_TIER",
      INTERNAL_ERROR: "NEXT_TIER",
    };
    return map[category] || "NEXT_TIER";
  }

  static getHttpStatusCode(errorType: string): number {
    const codes: Record<string, number> = { validation: 400, auth: 401, timeout: 408, configuration: 500 };
    return codes[errorType] || 500;
  }
}

// ---------------- BOOT GATE ----------------
class CrashProofBootSystem {
  static bootStatus: BootStatus | null = null;
  static criticalServices: Map<string, any> = new Map();
  static nonCriticalServices: Map<string, any> = new Map();

  static async validateBoot(): Promise<BootStatus> {
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
    } catch (err: any) {
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

  static getService(name: string): any {
    return this.criticalServices.get(name) || this.nonCriticalServices.get(name);
  }

  static isHealthy(): boolean {
    return this.bootStatus?.status === "healthy";
  }
}

// ---------------- LAZY SERVICE LOADER ----------------
class LazyServiceLoader {
  static services: Map<string, any> = new Map();
  static inFlight: Map<string, Promise<any>> = new Map(); // <string, Promise<any>>

  static async load(serviceName: string, importPath: string): Promise<any> {
    if (this.services.has(serviceName)) return this.services.get(serviceName);
    try {
      const module = await import(importPath);
      const service = module.default || module[serviceName] || module;
      this.services.set(serviceName, service);
      console.log(`🟢 [TIER2] Lazy loaded ${serviceName}`);
      return service;
    } catch (error: any) {
      console.log(`🔴 [TIER1] ⚠️ [LAZY] Failed to load ${serviceName}: ${error?.message || error}`);
      this.services.set(serviceName, null);
      return null;
    }
  }

  static async getPhaseIntegrationOrchestrator(): Promise<any> {
    const key = 'phaseIntegrationOrchestrator';
    if (LazyServiceLoader.services.has(key)) return LazyServiceLoader.services.get(key);
    if (LazyServiceLoader.inFlight.has(key)) return LazyServiceLoader.inFlight.get(key);

    const p = (async () => {
      try {
        const mod = await import('../_shared/PhaseIntegrationOrchestrator.js');
        const OrchestratorClass = (mod as any).PhaseIntegrationOrchestrator ?? (mod as any).default;

        if (!OrchestratorClass) {
          throw new Error('PHASE_ORCH_EXPORT_MISSING');
        }

        // Support either a static factory or a no-arg ctor
        const instance = typeof (OrchestratorClass as any).create === 'function'
          ? await (OrchestratorClass as any).create()
          : new OrchestratorClass();

        if (!instance || typeof instance.getEnhancedPrompt !== 'function') {
          throw new Error('PHASE_ORCH_METHOD_MISSING:getEnhancedPrompt');
        }

        LazyServiceLoader.services.set(key, instance);   // ✅ only cache on success
        return instance;
      } finally {
        LazyServiceLoader.inFlight.delete(key);          // ✅ singleflight cleanup
      }
    })();

    LazyServiceLoader.inFlight.set(key, p);
    return p;
  }
}

// ---------------- CORE UTILS ----------------
class CoreUtils {
  static generateRequestId(): string {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 7);
    return `${t}-${r}`;
  }

  static async withTimeout(promise: Promise<any>, timeoutMs: number, context: string = ""): Promise<any> {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${context} (${timeoutMs}ms)`)), timeoutMs)
      ),
    ]);
  }
}

// ---------------- HELPERS ----------------
function generateContextSummary(text: string): string {
  if (!text) return "Children's story scene with engaging characters.";
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length >= 2) return `${sentences[0].trim()}. ${sentences[1].trim()}.`;
  return (sentences[0]?.trim() || "Children's story scene.") + ".";
}

// Helper function to try nuclear templates (2.5C → 2.5D)
async function tryNuclearTemplates({ storyText, userInfo, sessionId, pageNumber, log }: any): Promise<any> {
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
    } catch (err: any) {
      log.failure(template.tag, { error: err?.message || err, escalation: 'next_nuclear_tier' });
    }
  }
  
  return {
    success: false,
    error: 'All nuclear template tiers failed',
    failureReason: 'all_backend_tiers_failed_trigger_tier_4'
  };
}

// ---------------- RUNWARE CORE ----------------
async function generateWithRunware(
  apiKey: string,
  prompt: string,
  sessionId: string,
  requestId: string,
  userInfo: any,
  avatarIdentity: any,
  pageNumber: number,
  enhancedStoryData: any,
  options: any = {}
): Promise<any> {
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
  } catch (e: any) {
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
                
                const { logTierAttempt } = await import("../_shared/tierLogging.js");
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
              } catch (loggingError: any) {
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
      } catch (err: any) {
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

// ============= MAIN HANDLER WITH CRASH-PROOF BOOT (GET/HEAD safe) =============
async function handleRequest(req: Request): Promise<Response> {
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
  
  // Extract Authorization header for user ID
  const authHeader = req.headers.get('Authorization');
  
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
    } catch (validationError: any) {
      if (shouldFailFast(validationError)) {
        console.warn(`❌ [${requestId}] Fast validation failed: ${validationError.message}`);
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
    const log = bindTierLogger(supabase, sessionId, requestId, authHeader);

    // Log Tier 2 orchestrator start with proper context
    log.t2(`🎯 [${requestId}] Orchestrator: POST ${req.url}`, { authHeader });

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
        if (!orchestrator || typeof orchestrator.getEnhancedPrompt !== 'function') {
          throw new Error('TIER1_ENHANCEMENT_SERVICE_UNAVAILABLE');
        }

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
        } catch (err: any) {
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
        
        if (!apiKey) {
          console.error('❌ RUNWARE_API_KEY environment variable is not set');
          log.failure('tier-1', { error: 'Missing RUNWARE_API_KEY' });
          return new Response(JSON.stringify({
            success: false,
            error: 'API key not configured',
            provider: 'error'
          }), {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
          });
        }
        
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
      } catch (tier1Error: any) {
        const msg = (tier1Error && tier1Error.message) || String(tier1Error);
        log.failure('tier-1', { error: msg, nextAction: 'TRY_DIRECT_MODE' });
        
        // Return structured failure response to let client handle Direct Mode
        return createCorsResponse({
          success: false,
          error: `Tier 1 failed: ${msg}`,
          nextAction: 'TRY_DIRECT_MODE',
          recommendedAction: 'Call ai-visual-scene-creator with directMode: true',
          tier: 'orchestrator-tier-1-failed'
        });
      }
    }
      
    // Handle Force Tier modes separately
    if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
      log.t2('Force Tier 1: Attempting true orchestrator Tier 1');
      try {
        // Primary path: Execute true Tier 1 orchestrator logic
        const orchestrator = await LazyServiceLoader.getPhaseIntegrationOrchestrator();
        if (!orchestrator || typeof orchestrator.getEnhancedPrompt !== 'function') {
          throw new Error('TIER1_ENHANCEMENT_SERVICE_UNAVAILABLE');
        }

        // First: ai-visual-scene-creator for primaryScene + schema (normal mode, not direct)
        log.t2('Calling ai-visual-scene-creator (normal mode)', { pageNumber, previousPrimaryScene });
        const sceneResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            storyText,
            userInfo: payload.userInfo,
            sessionId,
            pageNumber: pageNumber || 1,
            previousPrimaryScene,
            isDebugMode: false // Force normal mode for consistent orchestrator behavior
          }
        });
        
        if (!sceneResponse?.data || sceneResponse.error) {
          throw new Error('FORCE_TIER_1_NO_PRIMARY_SCENE');
        }

        const { primaryScene, aiSchema } = sceneResponse.data;
        const basePrompt = primaryScene + (aiSchema ? `\n\nSchema: ${JSON.stringify(aiSchema)}` : '');

        // Next: Orchestrator enhances the prompt
        log.t2('Enhancing prompt via orchestrator (force tier 1)');
        const tier1Response = await orchestrator.getEnhancedPrompt(
          payload.userInfo,
          basePrompt,
          storyText,
          sessionId
        );

        if (!tier1Response?.enhancementSuccessful || !tier1Response?.enhancedPrompt) {
          throw new Error('FORCE_TIER_1_ENHANCEMENT_FAILED');
        }

        // Generate with Runware
        log.t2('Generating image via Runware (force tier-1)');
        const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
        
        if (!apiKey) {
          console.error('❌ RUNWARE_API_KEY environment variable is not set');
          log.failure('tier-2.5', { error: 'Missing RUNWARE_API_KEY' });
          return new Response(JSON.stringify({
            success: false,
            error: 'API key not configured',
            provider: 'error'
          }), {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
          });
        }
        
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
      } catch (forceTierError: any) {
        log.failure('tier-1', { error: (forceTierError && forceTierError.message) || String(forceTierError) });
        result = { success: false, error: 'Force Tier 1 failed' };
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
  } catch (error: any) {
    const message = (error && error.message) || String(error);
    
    // Prevent 500→503 cascade for timeout errors - return 200 with controlled error payload
    if (`${message}`.includes('timeout') || `${message}`.includes('Timeout')) {
      console.warn(`⏰ [${requestId}] Upstream timeout handled gracefully: ${message}`);
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
    console.error(`❌ [${requestId}] Orchestrator error: ${message}`);
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

// ============= CORS HEADERS AND SERVE =============
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  const response = await handleRequest(req);
  
  // Add CORS headers to response
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
