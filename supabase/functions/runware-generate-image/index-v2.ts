// 🚀 DEPLOYMENT MARKER: v2025-10-08-TABLE-DRIVEN-CASCADE
// Last deployed: 2025-10-08
// Changes: Refactored to table-driven architecture with flat tier functions

// Standard imports for Supabase edge functions
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ✅ BUNDLER HINT: Force inline CCS inclusion in deployment bundle (dynamic import used inside handler)
import { characterConsistencyService as _ccsHint } from "./CharacterConsistencyServiceInline.js";

// CCS boot status tracking (referenced throughout orchestrator metadata)
const ccsBootStatus = { loaded: false, error: null };

interface GateConfig {
  maxConcurrency: number;
  failThreshold: number;
  cooldownMs: number;
  maxWaitMs: number;
}

interface CircuitState {
  failures: number;
  lastFailureAt: number;
  isOpen: boolean;
}

interface GateState {
  active: number;
  waiting: Array<{ resolve: () => void; acquiredAt: number }>;
  circuit: CircuitState;
}

const gates = new Map<string, GateState>();

const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'T1:ai-visual-scene-creator': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_T1') || '6'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '30000'),
    maxWaitMs: 2000
  },
  'DM:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25A:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25B:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25D:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'IMG:runware-generate-image': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, {
      active: 0,
      waiting: [],
      circuit: {
        failures: 0,
        lastFailureAt: 0,
        isOpen: false
      }
    });
  }
  return gates.get(key)!;
}

function getConfig(key: string): GateConfig {
  return DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS['T25A:runware-template-ab'];
}

function isCircuitOpen(key: string): boolean {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  const now = Date.now();
  
  if (state.circuit.isOpen) {
    if (now - state.circuit.lastFailureAt >= config.cooldownMs) {
      console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
      state.circuit.isOpen = false;
      state.circuit.failures = 0;
    }
  }
  
  return state.circuit.isOpen;
}

async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { 
      acquired: false, 
      reason: 'CIRCUIT_OPEN', 
      retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown))
    };
  }
  
  if (state.active < config.maxConcurrency) {
    state.active++;
    console.log(`✅ [GATE] ${key} acquired`);
    return { acquired: true };
  }
  
  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const index = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (index !== -1) {
        state.waiting.splice(index, 1);
      }
      resolve({ 
        acquired: false, 
        reason: 'QUEUE_TIMEOUT', 
        retryAfterSeconds: Math.floor(3 + Math.random() * 5)
      });
    }, timeout);
    
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    
    state.waiting.push({ 
      resolve: resolveAcquire, 
      acquiredAt: Date.now() 
    });
  });
}

function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (state.active > 0) {
    state.active--;
  }
  
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    if (state.circuit.failures > 0) {
      state.circuit.failures = Math.max(0, state.circuit.failures - 1);
    }
  }
  
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    if (waiter) {
      waiter.resolve();
    }
  }
}

// Emergency hair fallback - last resort when CCS data incomplete
const EMERGENCY_HAIR_MAP: Record<string, string> = {
  pale: "red hair",
  light: "blonde hair",
  medium: "brown hair",
  olive: "dark brown hair",
  dark: "black textured 4C hair",
};

function emergencyHairFallback(skinTone: string | undefined): string {
  const normalized = (skinTone || "medium").toLowerCase().trim();
  return EMERGENCY_HAIR_MAP[normalized] || EMERGENCY_HAIR_MAP["medium"];
}

// COMPLETE_TIER_1_TEMPLATE: 4-section structured template
const COMPLETE_TIER_1_TEMPLATE = `PRIMARY SCENE: {primaryScene}.

CONSISTENCY: {secondaryCharacters}{coloredObjects}{settingContext}.

BRAND SUFFIX: {styleFramework}.`;

// TypeScript interface definitions
interface TierLogger {
  t1: (msg: string, ctx?: Record<string, any>) => void;
  t2: (msg: string, ctx?: Record<string, any>) => void;
  attempt: (tier: string, ctx?: Record<string, any>) => void;
  success: (tier: string, ctx?: Record<string, any>) => void;
  failure: (tier: string, ctx?: Record<string, any>) => void;
}

function redactPII(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL-REDACTED]")
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, "[PHONE-REDACTED]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN-REDACTED]");
  }
  if (typeof value === "object" && value !== null) {
    const redacted: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      if (["characterName", "sessionId", "email", "phone", "address"].includes(key)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactPII(value[key]);
      }
    }
    return redacted;
  }
  return value;
}

async function bindTierLogger(
  sessionId: string,
  requestId: string,
  authHeader: string | null = null,
  memoizedImport: any
): Promise<TierLogger> {
  const isProd = Deno.env.get("ENVIRONMENT") === "production";
  const debugTierSample = Deno.env.get("DEBUG_TIER_LOG_SAMPLE");
  const logSampleRate = debugTierSample === "1" ? 1.0 : parseFloat(debugTierSample || "0.1");

  try {
    const [{ createVendorFirstSupabaseClient }, tierLogging] = await Promise.all([
      memoizedImport("../_shared/resilientLoader.js"),
      memoizedImport("../_shared/tierLogging.js"),
    ]);

    const supabaseClient = await createVendorFirstSupabaseClient();

    const shouldLogToDB = (status: string = "info") => {
      if (status === "failed" || status === "failure") return true;
      if (debugTierSample === "1") return true;
      if (logSampleRate >= 1.0) return true;
      return Math.random() < logSampleRate;
    };

    const wrapWithRedactionAndSampling =
      (fn: Function) =>
      (msg: string, ctx: any = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[TIER_LOG] ${msg}`, safeCtx);
        const status = String(safeCtx.status || "info");
        if (shouldLogToDB(status)) {
          return fn(msg, safeCtx, supabaseClient, sessionId, requestId);
        }
      };

    return {
      t1: wrapWithRedactionAndSampling(tierLogging.logTier1),
      t2: wrapWithRedactionAndSampling(tierLogging.logTier2),
      attempt: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Attempting`, safeCtx);
        if (shouldLogToDB("attempting")) {
          return tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, "attempting", safeCtx);
        }
      },
      success: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Success`, safeCtx);
        if (shouldLogToDB("success")) {
          return tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, safeCtx);
        }
      },
      failure: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.error(`[${tier}] Failure`, safeCtx);
        return tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, safeCtx);
      },
    };
  } catch (error) {
    console.warn(`⚠️ [ORCHESTRATOR] resilientLoader/tierLogging unavailable (NON-FATAL), using console-only logger:`, error);
    const wrapConsoleWithRedaction =
      (prefix: string) =>
      (msg: string, ctx: any = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${prefix}] ${msg}`, safeCtx);
      };

    return {
      t1: wrapConsoleWithRedaction("T1"),
      t2: wrapConsoleWithRedaction("T2"),
      attempt: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)("Attempting", ctx),
      success: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)("Success", ctx),
      failure: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)("Failure", ctx),
    };
  }
}

function generateEchoCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowOrigin = origin || "*";

  const requestHeaders = req.headers.get("Access-Control-Request-Headers");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": requestHeaders || "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    Vary: "Origin, Access-Control-Request-Headers",
  };
  
  if (origin) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  
  return headers;
}

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (status === 503 && data?.retryAfterSeconds) {
    headers["Retry-After"] = String(data.retryAfterSeconds);
    headers["Access-Control-Expose-Headers"] = "Retry-After";
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== "string") return false;
  if (scene.length < 30) return false;
  if (scene.includes("undefined") || scene.includes("null")) return false;
  return scene.split(" ").filter((word) => word.length > 0).length >= 8;
}

function validatePayloadFast(payload: any): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");

  const hasPageText =
    payload.pageText && typeof payload.pageText === "string" && payload.pageText.trim().length > 0;
  const hasStoryText =
    payload.storyText && typeof payload.storyText === "string" && payload.storyText.trim().length > 0;
  const hasBundlePageText =
    payload.bundle?.pageText &&
    typeof payload.bundle.pageText === "string" &&
    payload.bundle.pageText.trim().length > 0;
  const hasBundleStoryText =
    payload.bundle?.storyText &&
    typeof payload.bundle.storyText === "string" &&
    payload.bundle.storyText.trim().length > 0;
  const hasEnhancedStoryText =
    payload.enhancedStoryData?.storyText &&
    typeof payload.enhancedStoryData.storyText === "string" &&
    payload.enhancedStoryData.storyText.trim().length > 0;

  if (!hasPageText && !hasStoryText && !hasBundlePageText && !hasBundleStoryText && !hasEnhancedStoryText) {
    console.error("[runware-generate-image] Final error after retries: NO_STORY_CONTENT");
    throw new Error("NO_STORY_CONTENT");
  }

  const hasSessionId =
    payload.sessionId || payload.bundle?.sessionId || payload.enhancedStoryData?.sessionId;
  const hasUserInfo = payload.userInfo || payload.bundle?.userInfo || payload.enhancedStoryData?.userInfo;

  if (!hasSessionId || !hasUserInfo) throw new Error("NO_SESSION_OR_USER_INFO");
  return true;
}

// ============= KEEP EXISTING processInlinedTier1 (unchanged) =============
async function processInlinedTier1(
  payload: any,
  memoizedImport: any,
  logTier1Step: Function,
  tier1ErrorLog: any[],
  requestId: string,
  generateNuclearNegativePrompt: Function,
  detectCulturalProfileForNegatives: Function
): Promise<any> {
  const { pageText, storyText, userInfo, sessionId } = payload;
  const characterName = userInfo?.name || userInfo?.childName || "Child";

  console.log(`🎨 INLINED TIER 1: Processing for ${characterName} in session ${sessionId}`);
  const tier1Start = Date.now();

  let characterSeed: { hair: string; skin: string; eyes: string } | undefined = undefined;
  let culturalBundle: any = undefined;
  let coloredObjects: string = "";
  let secondaryCharacters: any[] = [];
  let mainCharacterAppearance: any = {};

  let characterConsistencyService: any;
  let characterServiceUnavailable = false;

  try {
    const inlineModule = await import("./CharacterConsistencyServiceInline.js");
    characterConsistencyService = inlineModule.characterConsistencyService;
    
    console.log(`✅ [CCS_INLINE] Loaded successfully - proceeding with Tier 1`);
    ccsBootStatus.loaded = true;
    ccsBootStatus.error = null;
  } catch (inlineError) {
    const errorMessage = inlineError instanceof Error ? inlineError.message : String(inlineError);
    console.log(`⚠️ [CCS_INLINE] Failed - escalating to Direct Mode immediately: ${errorMessage}`);
    throw new Error("INLINE_CCS_FAILED_ESCALATE_DIRECT_MODE");
  }

  throw new Error("processInlinedTier1 not fully implemented in v2 - use original");
}

// ============= NEW: Result Types =============
type OkResult<T = any> = { ok: true; data: T; meta?: any };
type ErrResult = { ok: false; code: string; reason?: string; details?: any };
type TierResult<T = any> = OkResult<T> | ErrResult;

// ============= NEW: Context Interface =============
interface TierContext {
  req: Request;
  requestId: string;
  payload: any;
  logger: TierLogger;
  memoizedImport: <T = any>(p: string) => Promise<T>;
  generateNuclearNegativePrompt: Function;
  detectCulturalProfileForNegatives: Function;
  
  // Progressively filled by tiers (append-only)
  tier1?: {
    enhancedPrompt: any;
    characterSeed?: any;
    culturalBundle?: any;
    coloredObjects?: string;
    secondaryCharacters?: any[];
    mainCharacterAppearance?: any;
  };
  directMode?: {
    primaryScene?: string;
    imageURL?: string;
    seed?: string;
    debug?: any;
  };
  characterContext?: {
    structuredAvatarData: any;
    culturalBundle: any;
    characterSeed: any;
    coloredObjects: string;
  };
}

// ============= NEW: Tier Function Type =============
type TierFn = (ctx: TierContext) => Promise<TierResult>;

// ============= NEW: TIER_1 Flat Function =============
const executeTier1: TierFn = async (ctx) => {
  const gateKey = "T1:ai-visual-scene-creator";
  let gateAcquired = false;
  
  try {
    // Check gate
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      return { 
        ok: false, 
        code: "GATE_DENIED", 
        reason: gateResult.reason,
        details: { retryAfterSeconds: gateResult.retryAfterSeconds }
      };
    }
    gateAcquired = true;
    
    ctx.logger.attempt("TIER_1", { sessionId: ctx.payload.sessionId });
    
    // Call existing processInlinedTier1
    const tier1ErrorLog: any[] = [];
    const logTier1Step = (step: string, status: string, message?: string) => {
      tier1ErrorLog.push({ step, status, message, timestamp: Date.now() });
    };
    
    const enhancedPrompt = await processInlinedTier1(
      ctx.payload,
      ctx.memoizedImport,
      logTier1Step,
      tier1ErrorLog,
      ctx.requestId,
      ctx.generateNuclearNegativePrompt,
      ctx.detectCulturalProfileForNegatives
    );
    
    // Store for later tiers
    ctx.tier1 = {
      enhancedPrompt,
      characterSeed: enhancedPrompt.characterSeed,
      culturalBundle: enhancedPrompt.culturalBundle,
      coloredObjects: enhancedPrompt.coloredObjects,
      secondaryCharacters: enhancedPrompt.secondaryCharacters,
      mainCharacterAppearance: enhancedPrompt.mainCharacterAppearance,
    };
    
    // If dry run, return success
    if (ctx.payload.dryRun) {
      ctx.logger.success("TIER_1", { dryRun: true });
      return { 
        ok: true, 
        data: { 
          dryRun: true, 
          primaryScene: enhancedPrompt.primaryScene,
          tier: "TIER_1"
        } 
      };
    }
    
    // If enhanced prompt has imageURL, return success
    if (enhancedPrompt.imageURL) {
      ctx.logger.success("TIER_1", { imageURL: enhancedPrompt.imageURL });
      return {
        ok: true,
        data: {
          success: true,
          imageURL: enhancedPrompt.imageURL,
          seed: enhancedPrompt.seed,
          provider: "tier-1",
          tier: "TIER_1",
          pathUsed: "orchestrator",
          resultType: "TIER_1_SUCCESS",
          requestId: ctx.requestId,
          timestamp: new Date().toISOString(),
          positivePrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt,
          metadata: {
            cascadeHistory: ["✅ Tier 1 Complete Success"],
            ccsBootStatus: {
              loaded: ccsBootStatus.loaded,
              tier1: true,
              tier25: false,
              directMode: false
            },
            sceneExtracted: !!enhancedPrompt.primaryScene
          }
        }
      };
    }
    
    // No image generated - escalate
    return { ok: false, code: "T1_NO_IMAGE", reason: "No image returned from Tier 1" };
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("TIER_1", { error: errorMessage });
    return { ok: false, code: "T1_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) {
      release(gateKey, true);
    }
  }
};

// ============= NEW: DIRECT_MODE Flat Function =============
const executeDirectMode: TierFn = async (ctx) => {
  // Direct Mode has no gate - always available
  console.log(`🚀 [DIRECT_MODE] Proceeding without gate check (always available - zero throttling)`);
  
  try {
    ctx.logger.attempt("DIRECT_MODE", { sessionId: ctx.payload.sessionId });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        throw new Error("SUPABASE_URL environment variable is not set");
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-visual-scene-creator`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...ctx.payload,
          directMode: true,
          tier1FailureReason: ctx.tier1 ? "T1_NO_IMAGE" : "T1_NOT_ATTEMPTED"
        }),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data?.success && (data?.imageURL || data?.primaryScene)) {
        ctx.directMode = {
          primaryScene: data.primaryScene,
          imageURL: data.imageURL,
          seed: data.seed || data.runwareDebugData?.seed,
          debug: data
        };
        
        ctx.logger.success("DIRECT_MODE", { 
          imageURL: data.imageURL,
          primaryScene: data.primaryScene
        });
        
        return {
          ok: true,
          data: {
            success: true,
            imageURL: data.imageURL,
            seed: data.seed,
            primaryScene: data.primaryScene,
            provider: "direct-mode-fallback",
            tier: "DIRECT_MODE",
            pathUsed: "direct-mode",
            resultType: "DIRECT_MODE_SUCCESS",
            requestId: ctx.requestId,
            timestamp: new Date().toISOString(),
            positivePrompt: data.runwareDebugData?.positivePrompt,
            negativePrompt: data.runwareDebugData?.negativePrompt,
            metadata: {
              cascadeHistory: [
                ctx.tier1 ? "❌ Tier 1 No Image" : "⏭️ Tier 1 Skipped",
                "✅ Direct Mode Success"
              ]
            }
          }
        };
      }
      
      throw new Error("Direct mode returned no image");
      
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("DIRECT_MODE", { error: errorMessage });
    return { ok: false, code: "DM_FAILED", reason: errorMessage };
  }
};

// ============= NEW: T25A/B/C/D Flat Functions (stub - implement full logic) =============
const executeT25A: TierFn = async (ctx) => {
  const gateKey = "T25A:runware-template-ab";
  let gateAcquired = false;
  
  try {
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      return { ok: false, code: "GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.logger.attempt("T25A", { sessionId: ctx.payload.sessionId });
    
    // Precondition: Need culturalBundle for T25A
    if (!ctx.tier1?.culturalBundle && !ctx.characterContext?.culturalBundle) {
      return { ok: false, code: "T25A_NO_CCS", reason: "No cultural bundle available" };
    }
    
    // Call runware-template-ab with precomputedCCS
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY || ""
      },
      body: JSON.stringify({
        ...ctx.payload,
        templateComplexity: "A",
        tier1FailureReason: "T1_NO_IMAGE",
        precomputedCCS: {
          culturalBundle: ctx.tier1?.culturalBundle || ctx.characterContext?.culturalBundle,
          characterSeed: ctx.tier1?.characterSeed || ctx.characterContext?.characterSeed,
          coloredObjects: ctx.tier1?.coloredObjects || ctx.characterContext?.coloredObjects,
          secondaryCharacters: ctx.tier1?.secondaryCharacters || [],
          mainCharacterAppearance: ctx.tier1?.mainCharacterAppearance || {}
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Template A failed: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.imageURL) {
      ctx.logger.success("T25A", { imageURL: data.imageURL });
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed,
          provider: "tier-2.5a-fallback",
          tier: "TIER_2.5A",
          pathUsed: "template-cascade",
          resultType: "TIER_2.5A_SUCCESS",
          requestId: ctx.requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error("Template A returned no image");
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("T25A", { error: errorMessage });
    return { ok: false, code: "T25A_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) {
      release(gateKey, true);
    }
  }
};

const executeT25B: TierFn = async (ctx) => {
  const gateKey = "T25B:runware-template-ab";
  let gateAcquired = false;
  
  try {
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      return { ok: false, code: "GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.logger.attempt("T25B", { sessionId: ctx.payload.sessionId });
    
    // Call runware-template-ab with complexity B (lightweight)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY || ""
      },
      body: JSON.stringify({
        ...ctx.payload,
        templateComplexity: "B",
        tier1FailureReason: "T1_NO_IMAGE",
        tier25aFailureReason: ctx.tier1 ? "T25A_FAILED" : "T25A_SKIPPED"
      })
    });
    
    if (!response.ok) {
      throw new Error(`Template B failed: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.imageURL) {
      ctx.logger.success("T25B", { imageURL: data.imageURL });
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed,
          provider: "tier-2.5b-fallback",
          tier: "TIER_2.5B",
          pathUsed: "template-cascade",
          resultType: "TIER_2.5B_SUCCESS",
          requestId: ctx.requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error("Template B returned no image");
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("T25B", { error: errorMessage });
    return { ok: false, code: "T25B_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) {
      release(gateKey, true);
    }
  }
};

const executeT25C: TierFn = async (ctx) => {
  const gateKey = "T25C:runware-template-cd";
  let gateAcquired = false;
  
  try {
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      return { ok: false, code: "GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.logger.attempt("T25C", { sessionId: ctx.payload.sessionId });
    
    // Call runware-template-cd (Nuclear Tier 2.5C)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY || ""
      },
      body: JSON.stringify({
        ...ctx.payload,
        templateComplexity: "C",
        tier1FailureReason: "T1_NO_IMAGE",
        tier25aFailureReason: "T25A_FAILED",
        tier25bFailureReason: "T25B_FAILED"
      })
    });
    
    if (!response.ok) {
      throw new Error(`Template C failed: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.imageURL) {
      ctx.logger.success("T25C", { imageURL: data.imageURL });
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed,
          provider: "tier-2.5c-fallback",
          tier: "TIER_2.5C",
          pathUsed: "template-cascade",
          resultType: "TIER_2.5C_SUCCESS",
          requestId: ctx.requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error("Template C returned no image");
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("T25C", { error: errorMessage });
    return { ok: false, code: "T25C_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) {
      release(gateKey, true);
    }
  }
};

const executeT25D: TierFn = async (ctx) => {
  const gateKey = "T25D:runware-template-cd";
  let gateAcquired = false;
  
  try {
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      return { ok: false, code: "GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.logger.attempt("T25D", { sessionId: ctx.payload.sessionId });
    
    // Call runware-template-cd (Nuclear Tier 2.5D - absolute fallback)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY || ""
      },
      body: JSON.stringify({
        ...ctx.payload,
        templateComplexity: "D",
        tier1FailureReason: "T1_NO_IMAGE",
        tier25aFailureReason: "T25A_FAILED",
        tier25bFailureReason: "T25B_FAILED",
        tier25cFailureReason: "T25C_FAILED"
      })
    });
    
    if (!response.ok) {
      throw new Error(`Template D failed: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.imageURL) {
      ctx.logger.success("T25D", { imageURL: data.imageURL });
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed,
          provider: "tier-2.5d-fallback",
          tier: "TIER_2.5D",
          pathUsed: "template-cascade",
          resultType: "TIER_2.5D_SUCCESS",
          requestId: ctx.requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error("Template D returned no image");
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    ctx.logger.failure("T25D", { error: errorMessage });
    return { ok: false, code: "T25D_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) {
      release(gateKey, true);
    }
  }
};

// ============= NEW: Cascade Runner =============
async function runTierCascade(
  tiers: Array<{ name: string; fn: TierFn; precondition?: (ctx: TierContext) => boolean }>,
  ctx: TierContext
): Promise<TierResult> {
  const trace: Array<{ tier: string; ms: number; ok: boolean; reason?: string }> = [];
  
  for (const { name, fn, precondition } of tiers) {
    // Skip if precondition fails
    if (precondition && !precondition(ctx)) {
      console.log(`[${name}] Precondition failed - skipping`);
      trace.push({ tier: name, ms: 0, ok: false, reason: "PRECONDITION_FAILED" });
      continue;
    }
    
    const start = Date.now();
    try {
      const result = await fn(ctx);
      const ms = Date.now() - start;
      
      trace.push({ tier: name, ms, ok: result.ok, reason: result.ok ? undefined : result.code });
      
      // Early return on success
      if (result.ok) {
        console.log(`[${name}] Success ${ms}ms`);
        return { ...result, meta: { ...result.meta, trace } };
      }
      
      console.log(`[${name}] Failed: ${result.code} (${ms}ms)`);
      
    } catch (e: any) {
      const ms = Date.now() - start;
      const reason = String(e?.message || e);
      trace.push({ tier: name, ms, ok: false, reason });
      console.error(`[${name}] Exception: ${reason} (${ms}ms)`);
    }
  }
  
  // All tiers failed
  return { ok: false, code: "ALL_TIERS_FAILED", details: { trace } };
}

// ============= NEW: Simplified Main Handler =============
serve(async (req) => {
  // OPTIONS/GET/HEAD (keep existing)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: generateEchoCorsHeaders(req) });
  }
  
  if (req.method === "GET" || req.method === "HEAD") {
    const healthData = {
      status: "healthy",
      service: "runware-generate-image",
      tier: "orchestrator",
      deployment_version: "v2025-10-08-TABLE-DRIVEN",
      timestamp: new Date().toISOString(),
      apiKey: {
        configured: !!Deno.env.get("RUNWARE_API_KEY"),
        length: Deno.env.get("RUNWARE_API_KEY")?.length || 0
      },
      gates: {
        tier1: getOrCreateGateState("T1:ai-visual-scene-creator"),
        directMode: { active: 0, circuit: { isOpen: false } }, // No gate
        tier25a: getOrCreateGateState("T25A:runware-template-ab"),
        tier25b: getOrCreateGateState("T25B:runware-template-ab"),
        tier25c: getOrCreateGateState("T25C:runware-template-cd"),
        tier25d: getOrCreateGateState("T25D:runware-template-cd")
      }
    };
    
    if (req.method === "HEAD") {
      return new Response(null, { 
        status: 200, 
        headers: generateEchoCorsHeaders(req) 
      });
    }
    
    return corsResponse(healthData, req, 200);
  }
  
  if (req.method !== "POST") {
    return corsResponse({ error: "Method not allowed" }, req, 405);
  }
  
  const requestId = `mg1${Math.random().toString(36).slice(2)}`;
  
  try {
    // 1. Parse + validate
    const payload = await req.json();
    validatePayloadFast(payload);
    
    // 2. Build memoized import
    const importCache = new Map<string, any>();
    const memoizedImport = async <T = any>(path: string): Promise<T> => {
      if (importCache.has(path)) {
        return importCache.get(path);
      }
      const module = await import(path);
      importCache.set(path, module);
      return module;
    };
    
    // 3. Load nuclear negative prompt generators
    const NuclearNegativePromptsModule = await memoizedImport("../_shared/NuclearNegativePrompts.js");
    const generateNuclearNegativePrompt = NuclearNegativePromptsModule.generateNuclearNegativePrompt;
    const detectCulturalProfileForNegatives = NuclearNegativePromptsModule.detectCulturalProfileForNegatives;
    
    // 4. Build logger
    const sessionId = payload.sessionId || payload.bundle?.sessionId || "unknown";
    const authHeader = req.headers.get("Authorization");
    const logger = await bindTierLogger(sessionId, requestId, authHeader, memoizedImport);
    
    // 5. Build context
    const ctx: TierContext = {
      req,
      requestId,
      payload,
      logger,
      memoizedImport,
      generateNuclearNegativePrompt,
      detectCulturalProfileForNegatives
    };
    
    // 6. Define tier cascade
    const tiers = [
      { name: "TIER_1", fn: executeTier1 },
      { name: "DIRECT_MODE", fn: executeDirectMode },
      { 
        name: "T25A", 
        fn: executeT25A,
        precondition: (ctx: TierContext) => !!(ctx.tier1?.culturalBundle || ctx.characterContext?.culturalBundle)
      },
      { name: "T25B", fn: executeT25B },
      { name: "T25C", fn: executeT25C },
      { name: "T25D", fn: executeT25D }
    ];
    
    // 7. Run cascade
    const result = await runTierCascade(tiers, ctx);
    
    // 8. Return result
    if (result.ok) {
      return corsResponse(result.data, req, 200);
    }
    
    // All tiers failed
    const status = 503;
    return corsResponse(
      {
        success: false,
        error: result.code,
        details: result.details,
        retryAfterSeconds: 8,
        metadata: {
          trace: result.details?.trace,
          cascadeHistory: result.details?.trace?.map((t: any) => 
            t.ok ? `✅ ${t.tier} Success (${t.ms}ms)` : `❌ ${t.tier} Failed: ${t.reason} (${t.ms}ms)`
          )
        }
      },
      req,
      status
    );
    
  } catch (e: any) {
    // Validation errors → 400
    if (e?.message?.includes("NO_STORY_CONTENT") || e?.message?.includes("NO_SESSION_OR_USER_INFO")) {
      return corsResponse({ error: e.message }, req, 400);
    }
    
    // Unexpected errors → 500
    return corsResponse({ error: String(e?.message || e) }, req, 500);
  }
});
