// DEPLOY_MARKER: 2025-10-03T18:50:00Z - CCS vendor fallback with explicit logging + Direct Mode timeout 20s

// Inlined orchestrator logic - no more lazy loading

// ✅ BUNDLER HINT: Force CCS inclusion in deployment bundle (dynamic import used inside handler)
import { characterConsistencyService as _ccsHint } from "../_shared/CharacterConsistencyService.js";

// ============================================================================
// 🎯 ORCHESTRATOR: RESILIENT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ENHANCED: Complete tier cascade logic: 1 → Direct Mode → 2.5A → 2.5B → 2.5C → 2.5D
// ============================================================================

// NO STATIC IMPORTS - All imports are lazy-loaded inside the handler to prevent boot failures
// Types are inferred at runtime

// CRITICAL FIX: NuclearNegativePrompts now lazy-loaded inside POST handler to prevent boot delay

// ========== INLINED: ProviderGate (Concurrency + Circuit Breaker) ==========
// Inlined to avoid bundling failures with _shared/ dynamic imports
// Feature flag: DISABLE_PROVIDER_GATE=true to skip gating

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

// ========== END INLINED: ProviderGate ==========

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

// CRITICAL: ProviderGate and IdempotencyMemory now lazy-loaded inside serve handler to prevent boot failures

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

// ---- Async Tier logger binder with memoized dependencies ----
// Phase 6: PII Protection - redact sensitive data in production
function redactPII(value: any): any {
  if (typeof value === "string") {
    // Mask potential emails, phone numbers, addresses
    return value
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL-REDACTED]")
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, "[PHONE-REDACTED]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN-REDACTED]");
  }
  if (typeof value === "object" && value !== null) {
    const redacted: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      // Redact known sensitive fields
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
  memoizedImport: any,
): Promise<TierLogger> {
  const isProd = Deno.env.get("ENVIRONMENT") === "production";
  const debugTierSample = Deno.env.get("DEBUG_TIER_LOG_SAMPLE");
  // Force 100% logging when DEBUG_TIER_LOG_SAMPLE=1, otherwise default 10% sampling
  const logSampleRate = debugTierSample === "1" ? 1.0 : parseFloat(debugTierSample || "0.1");

  try {
    const [{ createVendorFirstSupabaseClient }, tierLogging] = await Promise.all([
      memoizedImport("../_shared/resilientLoader.js"),
      memoizedImport("../_shared/tierLogging.js"),
    ]);

    const supabaseClient = await createVendorFirstSupabaseClient();

    // Sampling helper: only log to DB if sampled or failure
    const shouldLogToDB = (status: string = "info") => {
      if (status === "failed" || status === "failure") return true; // Always log failures
      if (debugTierSample === "1") return true; // Force 100% when DEBUG_TIER_LOG_SAMPLE=1 explicitly set
      if (logSampleRate >= 1.0) return true; // Full logging for other 100% rates
      return Math.random() < logSampleRate; // Sample for success/info logs
    };

    // Wrap logging functions with PII redaction and sampling
    const wrapWithRedactionAndSampling =
      (fn: Function) =>
      (msg: string, ctx: any = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;

        // Always console log
        console.log(`[TIER_LOG] ${msg}`, safeCtx);

        // Conditionally log to DB (sample or failure)
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
        // Always log failures to DB
        return tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, safeCtx);
      },
    };
  } catch (error) {
    console.warn(`Failed to create Supabase client: ${error}`);
    // Return console-only logger to prevent function crashes
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

// Echoing CORS with Vary headers for preflight consistency
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
  
  // Only set credentials header when Origin is present (browsers expect absent or "true", not "false")
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

  // Add Retry-After header for 503 responses and expose it via CORS
  if (status === 503 && data?.retryAfterSeconds) {
    headers["Retry-After"] = String(data.retryAfterSeconds);
    headers["Access-Control-Expose-Headers"] = "Retry-After";
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== "string") return false;
  if (scene.length < 30) return false;
  if (scene.includes("undefined") || scene.includes("null")) return false;
  return scene.split(" ").filter((word) => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 1A: Lightning-Fast Input Validation (50ms max)
// Accepts pageText OR storyText from root, bundle, or enhancedStoryData
function validatePayloadFast(payload: any): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");

  // Check for story content at multiple locations
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

  // Check for session/user info at multiple locations - BOTH required
  const hasSessionId =
    payload.sessionId || payload.bundle?.sessionId || payload.enhancedStoryData?.sessionId;
  const hasUserInfo = payload.userInfo || payload.bundle?.userInfo || payload.enhancedStoryData?.userInfo;

  if (!hasSessionId || !hasUserInfo) throw new Error("NO_SESSION_OR_USER_INFO");
  return true; // Validation passed
}

// ============= INLINED TIER 1 PROCESSING (from PhaseIntegrationOrchestrator) =============
async function processInlinedTier1(
  payload: any,
  memoizedImport: any,
  logTier1Step: Function,
  tier1ErrorLog: any[],
  requestId: string,
  generateNuclearNegativePrompt: Function,
  detectCulturalProfileForNegatives: Function,
): Promise<any> {
  const { pageText, storyText, userInfo, sessionId } = payload;
  const characterName = userInfo?.name || userInfo?.childName || "Child";

  console.log(`🎨 INLINED TIER 1: Processing for ${characterName} in session ${sessionId}`);
  const tier1Start = Date.now();

  // Import CharacterConsistencyService with resilient multi-path fallback (ERROR-046 fix)
  let characterConsistencyService: any;
  let characterServiceUnavailable = false;

  try {
    logTier1Step("CharacterConsistencyService Import", "attempt", "Loading CharacterConsistencyService");
    console.log(`[TIER_1] Attempting CharacterConsistencyService import with inline-first pattern`);

    // INLINE-FIRST: Try local inline bundle FIRST (always bundled, 100% reliable)
    let service;
    try {
      const inlineModule = await import("./CharacterConsistencyServiceVendor.js");
      service = inlineModule.characterConsistencyService;
      console.log(`✅ [CCS_IMPORT] inline vendor loaded successfully (0ms network delay)`);
    } catch (inlineError) {
      // Fallback 1: Try _shared (external bundle)
      console.warn(`⚠️ [CCS_IMPORT] inline import failed, trying _shared:`, inlineError);
      try {
        const sharedModule = await import("../_shared/CharacterConsistencyService.js");
        service = sharedModule.characterConsistencyService;
        console.log(`✅ [CCS_IMPORT] _shared loaded successfully (fallback)`);
      } catch (sharedError) {
        // Fallback 2: Try _vendor (last resort)
        console.warn(`⚠️ [CCS_IMPORT] _shared import failed, trying _vendor:`, sharedError);
        try {
          const vendorModule = await import("../_vendor/CharacterConsistencyService.mjs");
          service = vendorModule.characterConsistencyService;
          console.log(`✅ [CCS_IMPORT] _vendor loaded successfully (fallback)`);
        } catch (vendorError) {
          console.error(`❌ [CCS_IMPORT] all import paths failed`, { inlineError, sharedError, vendorError });
          throw new Error(`CCS_IMPORT_FAILURE: all paths failed`);
        }
      }
    }
    
    characterConsistencyService = service;

    // Validate service instance has ALL required methods
    const requiredMethods = [
      "getStructuredAvatarData",
      "getEnhancedCharacterSeed",
      "getCulturalEnhancements",
      "analyzeVisualDetails",
      "getColoredObjects",
      "detectAllCharacters",
      "getSessionSetting",
      "getSecondaryCharactersForSession",
    ];

    const missingMethods = requiredMethods.filter(
      (method) => typeof characterConsistencyService?.[method] !== "function",
    );

    // Enhanced logging: Log typeof for each required method for debugging
    console.log(`🔍 [${requestId}] [TIER_1] CCS Method Availability Check:`, {
      sessionId,
      methods: requiredMethods.reduce((acc, method) => {
        acc[method] = typeof characterConsistencyService?.[method];
        return acc;
      }, {} as Record<string, string>),
      missingMethods,
    });

    if (missingMethods.length > 0) {
      throw new Error(`CharacterConsistencyService missing required methods: ${missingMethods.join(", ")}`);
    }

    logTier1Step("CharacterConsistencyService Import", "success", "Service loaded successfully");
    console.log(`🔍 [${requestId}] [TIER_1] CCS Import: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      availableMethods: requiredMethods,
      timing: `${Date.now() - tier1Start}ms`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTier1Step("CharacterConsistencyService Import", "failed", errorMessage);
    console.warn(`[TIER_1] ⚠️ CharacterConsistencyService unavailable:`, errorMessage);
    console.log(`[TIER_1] Will escalate to Direct Mode (CCS is copilot there, not required)`);
    // Set flag but don't throw - let escalation logic handle it gracefully
    characterServiceUnavailable = true;
  }

  // If service is unavailable, escalate to Direct Mode (CCS is copilot, not required)
  if (characterServiceUnavailable) {
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Check for force flag (now passed from handler scope)
  const forceCompleteTier1 = payload.forceCompleteTier1 === true;
  if (forceCompleteTier1) {
    console.log(
      `🎯 FORCE TIER 1 MODE: Bypassing health checks, proceeding directly to Enhanced Character-First Flow`,
    );
    console.log(`📋 Force mode payload validation:`, {
      hasStoryText: !!payload.storyText,
      hasPageText: !!payload.pageText,
      hasCharacterName: !!payload.characterName,
      hasUserInfo: !!payload.userInfo,
    });
  }

  // Generate structured avatar data using centralized method (single source of truth)
  logTier1Step("Avatar Data Extraction", "attempt", "Building structured avatar data");
  const avatarSkinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || "medium";
  const avatarIdentity = {
    name: characterName,
    type: userInfo?.avatar?.type || "child",
    skinTone: avatarSkinTone,
  };

  // Runtime guard for getStructuredAvatarData method (ERROR-055 fix)
  let structuredAvatarData: any;
  try {
    if (typeof characterConsistencyService?.getStructuredAvatarData === "function") {
      structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
    } else {
      console.warn(`⚠️ getStructuredAvatarData not available, escalating to Tier 2.5B`);
      throw new Error("GETSTRUCTUREDAVATARDATA_UNAVAILABLE_ESCALATE_TO_25B");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getStructuredAvatarData: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Avatar Data Extraction", "failed", `getStructuredAvatarData: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getStructuredAvatarData:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // DEFENSIVE DATA REPAIR: Ensure structuredAvatarData has valid hairColor
  if (structuredAvatarData) {
    const hasValidHair =
      structuredAvatarData.hairColor &&
      structuredAvatarData.hairColor.trim() !== "" &&
      structuredAvatarData.hairColor !== "natural hair";

    if (!hasValidHair) {
      const fallbackSkinTone =
        structuredAvatarData.skinTone || userInfo?.avatar?.skinTone || userInfo?.skinTone || "medium";

      const repairedHairColor = emergencyHairFallback(fallbackSkinTone);

      console.log(`🔧 [${requestId}] [TIER_1] REPAIRING structuredAvatarData: hairColor missing or invalid`, {
        sessionId,
        pageNumber: payload.pageNumber,
        original: {
          hairColor: structuredAvatarData.hairColor || "(empty)",
          skinTone: structuredAvatarData.skinTone,
        },
        repaired: {
          hairColor: repairedHairColor,
          skinTone: fallbackSkinTone,
        },
        repairSource: "emergencyHairFallback",
      });

      structuredAvatarData.hairColor = repairedHairColor;
    }
  }

  console.log(`🔍 [${requestId}] [TIER_1] getStructuredAvatarData: SUCCESS`, {
    sessionId,
    pageNumber: payload.pageNumber,
    skinTone: structuredAvatarData?.skinTone,
    hairColor: structuredAvatarData?.hairColor,
    result: structuredAvatarData,
    wasRepaired: !!(
      structuredAvatarData &&
      (!structuredAvatarData.hairColor || structuredAvatarData.hairColor === "natural hair")
    ),
  });
  logTier1Step(
    "Avatar Data Extraction",
    "success",
    `Avatar data: ${structuredAvatarData?.skinTone}, ${structuredAvatarData?.hairColor}`,
  );

  // Get enhanced character consistency data (CRITICAL - will throw on failure to trigger tier escalation)
  let characterSeed: any;
  try {
    characterSeed = await characterConsistencyService.getEnhancedCharacterSeed(
      sessionId,
      avatarIdentity,
      storyText || pageText || "",
      "continuing",
    );
    console.log(`🔍 [${requestId}] [TIER_1] getEnhancedCharacterSeed: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      inputs: { avatarIdentity, textLength: (storyText || pageText || "").length },
      outputs: characterSeed,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getEnhancedCharacterSeed: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Enhanced Character Seed", "failed", `getEnhancedCharacterSeed: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getEnhancedCharacterSeed:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Get cumulative character appearance from story (CCS CORE METHOD)
  let characterAppearance = "";
  try {
    characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, characterName) || "";
    console.log(`🔍 [${requestId}] [TIER_1] getCharacterAppearanceFromStory: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      result: characterAppearance.substring(0, 100),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getCharacterAppearanceFromStory: FAILED`, { sessionId, error: errorMessage });
    // Graceful fallback - empty string
  }

  // Get never-ending story setting (CCS CORE METHOD)
  let neverEndingSetting = "";
  try {
    neverEndingSetting = await characterConsistencyService.getSessionSetting(sessionId, "never_ending_story") || "";
    console.log(`🔍 [${requestId}] [TIER_1] getSessionSetting: SUCCESS`, {
      sessionId,
      neverEndingSetting,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getSessionSetting: FAILED`, { sessionId, error: errorMessage });
    // Graceful fallback - empty string
  }

  // Get cultural enhancements using the service
  let culturalBundle: any;
  try {
    culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
    console.log(`🔍 [${requestId}] [TIER_1] getCulturalEnhancements: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone,
      result: culturalBundle,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getCulturalEnhancements: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Cultural Enhancements", "failed", `getCulturalEnhancements: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getCulturalEnhancements:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Analyze visual details from story text
  const vizStageStart = Date.now();
  let coloredObjects = "";
  try {
    await characterConsistencyService.analyzeVisualDetails(sessionId, storyText || pageText, payload.pageNumber || 1);
    coloredObjects = await characterConsistencyService.getColoredObjects(sessionId);
    console.log(`🔍 [${requestId}] [TIER_1] analyzeVisualDetails: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      timing: `${Date.now() - vizStageStart}ms`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] analyzeVisualDetails/getColoredObjects: FAILED`, {
      sessionId,
      error: errorMessage,
    });
    logTier1Step("Visual Details Analysis", "failed", `analyzeVisualDetails: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:analyzeVisualDetails:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Reuse session-cached secondary characters to avoid duplicate heavy detection
  let secondaryCharacters: any[] = [];
  let detectionResults: any = {};
  let mainCharacterAppearance: any = {};
  try {
    secondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);

    // PHASE 1: Get main character appearance data
    detectionResults = await characterConsistencyService.detectAllCharacters(storyText || pageText, {
      sessionId,
      pageNumber: payload.pageNumber || 1,
    });
    mainCharacterAppearance = detectionResults.mainCharacterAppearance || {};

    console.log(`🔍 [${requestId}] [TIER_1] detectAllCharacters: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      resultCount: (detectionResults.secondaryCharacters || []).length,
      timing: `${Date.now() - vizStageStart}ms`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] detectAllCharacters: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Character Detection", "failed", `detectAllCharacters: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:detectAllCharacters:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Keep animals lean to avoid extra passes; not required for templates currently
  const detectedAnimals: any[] = [];

  // Get session setting (indoor/outdoor context) - CCS should auto-detect, no hardcoded fallback
  let sessionSetting = "";
  try {
    sessionSetting = await characterConsistencyService.getSessionSetting(sessionId, "context", "");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getSessionSetting: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Session Setting", "failed", `getSessionSetting: ${errorMessage}`);

    // For forced Tier 1, return specific method failure (no cascade)
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getSessionSetting:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Lean CPU budget guard for Tier 1 analysis
  const TIER1_CPU_BUDGET_MS = 2200;
  const elapsedTier1 = Date.now() - tier1Start;
  if (elapsedTier1 > TIER1_CPU_BUDGET_MS) {
    console.warn(
      `[TIER_1] CPU budget exceeded (${elapsedTier1}ms > ${TIER1_CPU_BUDGET_MS}ms). Escalating to Direct Mode early.`,
    );
    throw new Error("CHARACTERSERVICE_BUDGET_EXCEEDED_TRY_DIRECT_MODE");
  }

  console.log(`✅ CHARACTER FOUNDATION: Established complete character consistency data`, {
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    coloredObjectsCount: coloredObjects?.split(",").length || 0,
    secondaryCharactersCount: secondaryCharacters.length,
    detectedAnimalsCount: detectedAnimals.length,
    sessionSetting,
  });

  // Get AI-generated primary scene and complete schema
  let primaryScene: string | undefined;
  let aiSchema: Record<string, any> = {};
  let aiDebugSchema: any = null;
  try {
    logTier1Step("AI Scene Creator Call", "attempt", "Invoking ai-visual-scene-creator");
    const { createVendorFirstSupabaseClient } = await memoizedImport("../_shared/resilientLoader.js");
    const supabase = await createVendorFirstSupabaseClient();

    // Use raw fetch with proper AbortController signal (supabase.functions.invoke ignores signal)
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 15000);
    
    let aiResult: any, aiError: any;
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      // Validate SUPABASE_URL
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        throw new Error("SUPABASE_URL environment variable is not set");
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      // Only add apikey header if key exists
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-visual-scene-creator`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          pageText: storyText || pageText,
          userInfo: {
            ...userInfo,
            age: userInfo?.age || structuredAvatarData?.age || 6,
            structuredAvatarData,
          },
        sessionId,
        pageNumber: payload.pageNumber || 1,
        avatarIdentity,
        // Pass COMPLETE character consistency context to AI
        characterSeed,
        culturalBundle,
        coloredObjects,
        secondaryCharacters, // Now includes visualDetails from Phase 1
        mainCharacterAppearance, // PHASE 1: Pass main character appearance
        detectedAnimals,
        sessionSetting,
        requestId: `tier1-${sessionId}`,
        source: "inlined_orchestrator",
        directMode: false, // Scene-Only mode - AI uses character context to inform scene
        }),
        signal: aiController.signal,
      });
      
      if (!response.ok) {
        aiError = { message: `HTTP ${response.status}: ${response.statusText}` };
        aiResult = null;
      } else {
        aiResult = await response.json();
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        aiError = { message: "AI scene creator timeout (15s)" };
        aiResult = null;
      } else {
        throw e;
      }
    } finally {
      clearTimeout(aiTimeout);
    }

    console.log(`✅ AI SCENE GENERATION: Called with complete character context`, {
      hasCharacterSeed: !!characterSeed,
      hasCulturalBundle: !!culturalBundle,
      hasColoredObjects: !!coloredObjects,
      secondaryCharactersCount: secondaryCharacters?.length || 0,
      hasDetectedAnimals: detectedAnimals.length > 0,
      hasSessionSetting: !!sessionSetting,
    });

    if (aiError || !aiResult?.primaryScene) {
      logTier1Step("AI Scene Creator Call", "failed", `AI error: ${aiError?.message || "No primary scene"}`);
      throw new Error("NO_PRIMARY_SCENE_ESCALATE_TO_25A");
    }

    primaryScene = aiResult.primaryScene;
    aiDebugSchema = aiResult.aiDebugSchema || null;
    logTier1Step(
      "AI Scene Creator Call",
      "success",
      `Primary scene generated: ${primaryScene?.substring(0, 50)}...`,
    );

    // Collect complete AI schema for debugging (only primaryScene used in template)
    aiSchema = {
      backgroundColor: aiResult?.backgroundColor || "",
      lighting: aiResult?.lighting || "",
      composition: aiResult?.composition || "",
      mood: aiResult?.mood || "",
      visualElements: aiResult?.visualElements || "",
      sceneSettings: aiResult?.sceneSettings || "",
      atmosphericDetails: aiResult?.atmosphericDetails || "",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTier1Step("AI Scene Creator Call", "failed", errorMessage);
    console.warn("AI scene creator failed:", error);
    throw new Error("NO_PRIMARY_SCENE_ESCALATE_TO_25A");
  }

  // ============================================================================
  // PHASE 3: POST-AI CONSISTENCY VALIDATION
  // ============================================================================

  logTier1Step("Scene Validation", "attempt", "Validating primary scene quality");
  console.log(`🔍 CONSISTENCY VALIDATION: Checking AI scene against character data`);

  // Validate primary scene quality
  if (!validatePrimarySceneQuality(primaryScene!)) {
    logTier1Step("Scene Validation", "failed", "Primary scene quality check failed");
    console.warn(`⚠️ CONSISTENCY WARNING: Primary scene quality validation failed`);
  } else {
    logTier1Step("Scene Validation", "success", "Primary scene validated");
  }

  // Log consistency check for debugging
  const consistencyCheck = {
    primarySceneLength: primaryScene?.length || 0,
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    hasColoredObjects: !!coloredObjects,
    secondaryCharactersMatched: secondaryCharacters?.length || 0,
    animalsDetected: detectedAnimals.length,
    sessionSetting,
    aiSchemaComplete: Object.values(aiSchema).filter(Boolean).length,
  };

  console.log(`✅ CONSISTENCY VALIDATION: Complete`, consistencyCheck);

  // Generate secondary character seeds for template building
  let secondaryCharacterSeeds: any[] = [];
  try {
    const allSecondaryChars = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);
    secondaryCharacterSeeds = allSecondaryChars || [];
    console.log(`✅ Retrieved ${secondaryCharacterSeeds.length} secondary characters for session`);
  } catch (error) {
    console.warn(`Failed to get secondary characters for session:`, error);
  }

  // Build enhanced prompt
  const characterReference = avatarIdentity.type === "prefer-not-to-answer" ? "gender neutral child" : avatarIdentity.type;

  // Get style framework with safe type coercion
  const difficulty = String(userInfo?.difficulty || userInfo?.gradeLevel || "medium").toLowerCase();
  const styleFramework = getInlinedStyleFramework(difficulty);

  // ============================================================================
  // PHASE 4: TEMPLATE BUILDING WITH FULL CONTEXT
  // ============================================================================

  logTier1Step("Template Building", "attempt", "Constructing COMPLETE_TIER_1 template");

  // CRITICAL: Validate required data before template building
  if (!characterSeed || !characterSeed.characterDescription) {
    const error = "characterSeed missing or incomplete";
    logTier1Step("Template Building", "failed", error);
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getEnhancedCharacterSeed:${error}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  if (!culturalBundle || (!culturalBundle.hair && !culturalBundle.features)) {
    const error = "culturalBundle missing or incomplete";
    logTier1Step("Template Building", "failed", error);
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getCulturalEnhancements:${error}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  if (!primaryScene || primaryScene.length < 30) {
    const error = `primaryScene invalid (length: ${primaryScene?.length || 0})`;
    logTier1Step("Template Building", "failed", error);
    throw new Error("AI_SCHEMA_INCOMPLETE");
  }

  // Build COMPLETE_TIER_1 template with deduplication logic
  const secondaryCharsText =
    secondaryCharacterSeeds.length > 0
      ? `With ${secondaryCharacterSeeds.map((s) => s.visualDescription || s.name).join(", ")}`
      : "";
  const animalsText =
    detectedAnimals?.length > 0 ? `Including ${detectedAnimals.map((a) => a.name || a.type).join(", ")}` : "";
  const coloredObjectsText = coloredObjects ? `Featuring ${coloredObjects}` : "";
  // Phase 2: Remove sessionSetting duplication - it's already in aiSchema.sceneSettings
  const consistencyElements = [secondaryCharsText, animalsText].filter(Boolean).join(", ");

  const enhancedPrompt = COMPLETE_TIER_1_TEMPLATE
    .replace("{primaryScene}", primaryScene)
    .replace("{secondaryCharacters}", consistencyElements ? `${consistencyElements}. ` : "")
    .replace("{coloredObjects}", coloredObjectsText ? `${coloredObjectsText}. ` : "")
    .replace("{settingContext}", aiSchema?.sceneSettings ? `In ${aiSchema.sceneSettings}. ` : "")
    .replace("{styleFramework}", styleFramework);

  logTier1Step("Template Building", "success", `Template built, length: ${enhancedPrompt.length}`);

  console.log(`✅ TEMPLATE BUILDING: Enhanced prompt with full context`, {
    primarySceneLength: primaryScene?.length || 0,
    mainCharacterLength: characterSeed?.characterDescription?.length || 0,
    consistencyElementsLength: consistencyElements?.length || 0,
    totalPromptLength: enhancedPrompt?.length || 0,
  });

  // Generate nuclear negative prompt with cultural and gender awareness
  const culturalProfile = detectCulturalProfileForNegatives(
    userInfo?.nativeLanguage || userInfo?.language,
    structuredAvatarData?.skinTone,
  );
  const avatarType =
    userInfo?.avatarType || (userInfo?.gender === "girl" ? "girl" : userInfo?.gender === "boy" ? "boy" : "child");

  const negativePrompt = generateNuclearNegativePrompt(
    culturalProfile,
    avatarType,
    userInfo?.difficulty || "medium",
    payload.pageNumber || 1,
    secondaryCharacters,
  );

  console.log(`✅ NUCLEAR NEGATIVE: Generated with profile=${culturalProfile}, type=${avatarType}`);

  console.log(`✅ INLINED TIER 1: Generated enhanced prompt for ${characterName}`);

  return {
    enhancedPrompt, // ← Structured COMPLETE_TIER_1 template
    negativePrompt,
    primaryScene, // ← Used in template
    aiSchema: {
      // ← Complete schema for debugging
      backgroundColor: aiSchema?.backgroundColor || "",
      lighting: aiSchema?.lighting || "",
      composition: aiSchema?.composition || "",
      mood: aiSchema?.mood || "",
      visualElements: aiSchema?.visualElements || "",
      sceneSettings: aiSchema?.sceneSettings || "",
      atmosphericDetails: aiSchema?.atmosphericDetails || "",
    },
    aiDebugSchema, // ← NEW: Full OpenAI debug data from ai-visual-scene-creator
    characterSeed,
    culturalBundle,
    coloredObjects,
    secondaryCharacterSeeds,
    secondaryCharacters, // ← NEW: All detected secondary characters
    detectedAnimals, // ← NEW: All detected animals
    sessionSetting, // ← NEW: Indoor/outdoor context
    structuredAvatarData, // ← CRITICAL: Pass 73-variation session-seeded hair to Direct Mode
    templateStructure: "COMPLETE_TIER_1",
  };
}

// Inlined style framework (from PhaseIntegrationOrchestrator)
function getInlinedStyleFramework(difficulty: string): string {
  const frameworks = {
    beginner:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
    easy:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
    medium:
      "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting",
    hard:
      "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation",
    expert:
      "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation",
  };

  // @ts-ignore
  return frameworks[difficulty?.toLowerCase()] || frameworks["medium"];
}

// Fast Boot Sync Recovery Configuration
const FAST_BOOT_SYNC = {
  maxRetries: 3,
  delays: [500, 2000, 3500], // Total: 6 seconds max
  bootErrors: [
    "Module not found",
    "BOOT_OR_IMPORT_FAILURE",
    "failed to determine entrypoint",
    "Cannot read properties of null",
  ],
  maxTotalTime: 6000,
};

// OPTIMIZED SERVE HANDLER WITH FAST BOOT SYNC RECOVERY AND COMPLETE TIER CASCADE
Deno.serve(async (req) => {
  // PHASE 1: OPTIONS fast path (immediate return) - MUST return 200
  if (req.method === "OPTIONS") {
    const corsHeaders = generateEchoCorsHeaders(req);
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
      },
    });
  }

  // PHASE 2: GET/HEAD health checks with environment info
  if (req.method === "GET" || req.method === "HEAD") {
    const runwareKey = Deno.env.get("RUNWARE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const corsHeaders = generateEchoCorsHeaders(req);
    const healthData = {
      status: "healthy",
      service: "runware-generate-image",
      tier: "Main Orchestrator",
      deployment_version: "2025-10-03T00:30:00Z",
      timestamp: new Date().toISOString(),
      environment: {
        hasRunwareApiKey: !!runwareKey,
        hasOpenAiApiKey: !!openaiKey,
        hasSupabaseServiceRoleKey: !!supabaseKey,
      },
      capabilities: ["tier_orchestration", "image_generation", "complete_cascade_1_DirectMode_2.5A_2.5B_2.5C_2.5D"],
    };

    // HEAD should return no body
    if (req.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // GET returns full health data
    return corsResponse(healthData, req);
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== "POST") {
    return corsResponse({ error: "Method not allowed" }, req, 405);
  }

  // Fast retry wrapper for boot sync issues
  let cachedPayload: any | null = null;
  const requestId = `mg1${Math.random().toString(36).substring(2)}`;
  
  for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
    try {
      // PHASE 3: JSON parsing only once (cached for retries to prevent "Body already consumed" error)
      if (!cachedPayload && attempt === 0) {
        cachedPayload = await req.json();
      }
      const payload = cachedPayload;
      console.log(`🚀 [${requestId}] runware-generate-image ready`);

      // PHASE 4: Fast validation
      validatePayloadFast(payload);
      console.log(`✅ [${requestId}] Fast validation passed`);

      // CRITICAL: Lazy load IdempotencyMemory with fallback to prevent boot failures
      let IdempotencyMemory: any = null;
      try {
        IdempotencyMemory = await import("../_shared/IdempotencyMemory.js");
        console.log("✅ IdempotencyMemory loaded");
      } catch (error) {
        console.warn("⚠️ IdempotencyMemory unavailable, proceeding without deduplication:", error);
        IdempotencyMemory = {
          getOrRun: async (_key: string, _ttl: number, fn: () => Promise<any>) => {
            console.log(`⏭️ [IDEMPOTENCY] Bypassed (fallback mode)`);
            return await fn();
          }
        };
      }

      // Lazy load NuclearNegativePrompts to prevent boot delay
      let generateNuclearNegativePrompt: any;
      let detectCulturalProfileForNegatives: any;
      try {
        const nuclearModule = await import("../_shared/NuclearNegativePrompts.js");
        generateNuclearNegativePrompt = nuclearModule.generateNuclearNegativePrompt;
        detectCulturalProfileForNegatives = nuclearModule.detectCulturalProfileForNegatives;
        console.log("✅ NuclearNegativePrompts module loaded successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn("⚠️ NuclearNegativePrompts unavailable, using hardcoded base fallback:", errorMessage);
        const BASE_NEGATIVE_FALLBACK =
          "NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley";
        // Signatures accept any params but ignore them; safe at runtime
        generateNuclearNegativePrompt = () => BASE_NEGATIVE_FALLBACK;
        detectCulturalProfileForNegatives = () => ({});
      }

      // PHASE 4.1: DRY RUN MODE DETECTION
      const isDryRun = payload.dryRun === true;
      if (isDryRun) {
        console.log(`🧪 [${requestId}] DRY RUN MODE: Debug-only request detected`);
      }

      // PHASE 4.5: PAYLOAD NORMALIZATION - Unify pageText/storyText and nested structures
      // Extract story text from all possible locations
      const storyTextValue =
        payload.pageText || payload.storyText || payload.bundle?.storyText || payload.enhancedStoryData?.storyText;

      // Extract userInfo from all possible locations
      const userInfoValue = payload.userInfo || payload.bundle?.userInfo || payload.enhancedStoryData?.userInfo;

      // Extract sessionId from all possible locations
      const sessionIdValue = payload.sessionId || payload.bundle?.sessionId || payload.enhancedStoryData?.sessionId;

      // Extract pageNumber from all possible locations
      const pageNumberValue =
        payload.pageNumber || payload.bundle?.pageNumber || payload.enhancedStoryData?.pageNumber || 1;

      // Normalize payload: ensure both pageText and storyText are set at root level
      payload.pageText = storyTextValue;
      payload.storyText = storyTextValue;
      payload.userInfo = userInfoValue;
      payload.sessionId = sessionIdValue;
      payload.pageNumber = pageNumberValue;

      // Preserve nested structures for backward compatibility
      if (!payload.enhancedStoryData && userInfoValue) {
        payload.enhancedStoryData = { userInfo: userInfoValue, storyText: storyTextValue };
      }
      if (!payload.bundle && userInfoValue) {
        payload.bundle = {
          userInfo: userInfoValue,
          storyText: storyTextValue,
          sessionId: sessionIdValue,
          pageNumber: pageNumberValue,
        };
      }

      console.log(
        `✅ [${requestId}] Payload normalized: pageText=${!!payload.pageText}, storyText=${!!payload.storyText}, userInfo=${!!payload.userInfo}, sessionId=${!!payload.sessionId}`,
      );

      // Extract force flag at handler scope so it's accessible in catch blocks
      const forceCompleteTier1 = payload.forceCompleteTier1 === true;

      // Initialize Tier 1 Timeline tracking at handler scope
      const tier1ErrorLog: Array<{
        step: string;
        status: "attempt" | "success" | "failed" | "skipped";
        message: string;
        at: string;
      }> = [];
      const logTier1Step = (
        step: string,
        status: "attempt" | "success" | "failed" | "skipped",
        message: string,
      ) => {
        tier1ErrorLog.push({ step, status, message: message.substring(0, 200), at: new Date().toISOString() });
        // Keep only last 20 entries (sliding window)
        if (tier1ErrorLog.length > 20) {
          tier1ErrorLog.splice(0, tier1ErrorLog.length - 20);
        }
      };

      // Preferred: resilient loader from _shared
      let memoizedImport: <T = any>(href: string) => Promise<T>;
      let usingResilientLoader = false;
      try {
        // CRITICAL: Use direct relative import for local files (ERROR-048 prevention)
        // Never use new URL(..., import.meta.url) for local TypeScript files in Deno edge functions
        ({ memoizedImport } = await import("../_shared/resilientLoader.js"));
        usingResilientLoader = true;
        console.log(`✅ [CDN_HEALTH] Using resilient loader with multi-CDN fallback support`);
      } catch (loaderError) {
        console.warn(
          `⚠️ [CDN_HEALTH] Resilient loader unavailable, using local fallback:`,
          loaderError instanceof Error ? loaderError.message : String(loaderError),
        );
        // Fallback: vendor-aware local memoizer to stay up during cold boot anomalies
        const cache = new Map<string, Promise<any>>();
        memoizedImport = <T = any>(href: string) => {
          if (!cache.has(href)) {
            console.log(`📦 [CDN_HEALTH] Local memoizer importing: ${href}`);
            // Try vendor path first for known packages
            let importPath = href;
            if (href.includes("@supabase/supabase-js")) {
              importPath = "../_vendor/supabase-js@2.57.4.mjs";
            } else if (href.includes("openai")) {
              importPath = "../_vendor/openai@4.28.0.mjs";
            }
            cache.set(href, import(importPath).catch(() => import(href)));
          }
          return cache.get(href)! as Promise<T>;
        };
      }

      // PHASE 5: Load tier logger and lazy-load orchestrator
      const tierLogger = await bindTierLogger(payload.sessionId || "unknown", requestId, req.headers.get("authorization"), memoizedImport);

      // PHASE 6: Process request with lazy-loaded services
      tierLogger.attempt("TIER_1", { storyLength: payload.pageText?.length || payload.storyText?.length });

      // Check if Tier 1 gate is available BEFORE attempting Tier 1
      const tier1GateResult = await acquire("T1:ai-visual-scene-creator");
      if (!tier1GateResult.acquired) {
        console.log(`⚠️ [TIER_1] Gate denied: ${tier1GateResult.reason}`);
        console.log(`⚡ [TIER_1] Skipping directly to Direct Mode (no throttling)`);
        
        // Skip Tier 1 entirely and go straight to Direct Mode
        payload.skipTier1DueToOverload = true;
      }

      // Attempt real Tier 1 processing with actual orchestrator
      console.log(`[TIER_1] Attempting orchestrator enhancement`);

      // Declare enhancedPrompt outside try block so it's accessible in catch for Direct Mode
      let enhancedPrompt: any = null;

      try {
        // Skip Tier 1 if gate was denied (overload detected)
        if (payload.skipTier1DueToOverload) {
          throw new Error("TIER_1_OVERLOAD_SKIP_TO_DIRECT_MODE");
        }
        // INLINED TIER 1 PROCESSING - Direct orchestration without PhaseIntegrationOrchestrator
        console.log(
          `🎨 INLINED TIER 1: Processing for ${payload.userInfo?.name || "Child"} in session ${payload.sessionId}`,
        );
        enhancedPrompt = await processInlinedTier1(
          payload,
          memoizedImport,
          logTier1Step,
          tier1ErrorLog,
          requestId,
          generateNuclearNegativePrompt,
          detectCulturalProfileForNegatives,
        );

        if (
          !enhancedPrompt ||
          !validatePrimarySceneQuality(enhancedPrompt.primaryScene || enhancedPrompt.enhancedPrompt || "")
        ) {
          throw new Error("NO_PRIMARY_SCENE_ESCALATE_TO_25A");
        }

        // DRY RUN MODE: Return debug data without generating image
        if (isDryRun) {
          console.log(`🧪 [${requestId}] DRY RUN: Returning Tier 1 debug data without image generation`);

          tierLogger.success("TIER_1_DRY_RUN", {
            templateStructure: "COMPLETE_TIER_1",
            dryRun: true,
          });

          return corsResponse(
            {
              success: true,
              dryRun: true,
              tier: "TIER_1",
              pathUsed: "orchestrator",
              resultType: "TIER_1_DRY_RUN",
              templateStructure: "COMPLETE_TIER_1",
              requestId: requestId,
              timestamp: new Date().toISOString(),

              // Enhanced Debug Data
              tier1Debug: {
                timeline: tier1ErrorLog,
                enhancedPrompt: enhancedPrompt.enhancedPrompt,
                negativePrompt: enhancedPrompt.negativePrompt,
                primaryScene: enhancedPrompt.primaryScene,
                templateStructure: enhancedPrompt.templateStructure,
              },

              // CCS Debug Data
              ccsDebug: {
                characterSeed: enhancedPrompt.characterSeed,
                culturalBundle: enhancedPrompt.culturalBundle,
                coloredObjects: enhancedPrompt.coloredObjects,
                secondaryCharacterSeeds: enhancedPrompt.secondaryCharacterSeeds,
                secondaryCharacters: enhancedPrompt.secondaryCharacters,
                detectedAnimals: enhancedPrompt.detectedAnimals,
                sessionSetting: enhancedPrompt.sessionSetting,
                structuredAvatarData: enhancedPrompt.structuredAvatarData,
                aiSchema: enhancedPrompt.aiSchema,
                aiDebugSchema: enhancedPrompt.aiDebugSchema,
                tier1Steps: tier1ErrorLog.length,
                cascadeHistory: ["✅ Tier 1 Dry Run Complete (No Image Generation)"],
              },
            },
            req,
            200
          );
        }

        // Real Runware image generation using WebSocket service with inline-first fallback
        let RunwareWebSocketService;
        try {
          // INLINE-FIRST: Try local _vendor bundle FIRST (always bundled, 100% reliable)
          const vendorModule = await import("../_vendor/RunwareWebSocketService.js");
          RunwareWebSocketService = vendorModule.RunwareWebSocketService;
          console.log("✅ Loaded RunwareWebSocketService from _vendor (inline-first, 0ms network delay)");
        } catch (vendorError) {
          console.warn("⚠️ _vendor/RunwareWebSocketService.js failed, trying _shared:", vendorError);
          try {
            // Fallback to _shared bundle
            const module = await memoizedImport("../_shared/RunwareWebSocketService.js");
            RunwareWebSocketService = module.RunwareWebSocketService;
            console.log("✅ Loaded RunwareWebSocketService from _shared (fallback)");
          } catch (sharedError) {
            console.error("❌ Both _vendor and _shared RunwareWebSocketService failed");
            throw new Error("TIER_1_PROCESSING_FAILED: RunwareWebSocketService unavailable - both _vendor and _shared imports failed");
          }
        }

        // Validate service is functional
        if (!RunwareWebSocketService || typeof RunwareWebSocketService.generateImage !== "function") {
          throw new Error("TIER_1_PROCESSING_FAILED: RunwareWebSocketService not functional - missing generateImage method");
        }

        const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");

        if (!runwareApiKey) {
          throw new Error("TIER_1_PROCESSING_FAILED: Runware API key not configured");
        }

        logTier1Step("Image Generation", "attempt", "Calling RunwareWebSocketService.generateImage");

        // Add 20-second timeout for Runware WebSocket call (aligned with frontend expectations)
        const runwareController = new AbortController();
        const runwareTimeout = setTimeout(() => runwareController.abort(), 20000);

        let imageResult: any;
        try {
          imageResult = await RunwareWebSocketService.generateImage({
            apiKey: runwareApiKey,
            positivePrompt: enhancedPrompt.enhancedPrompt,
            negativePrompt: enhancedPrompt.negativePrompt || "",
            parameters: {
              width: 1024,
              height: 1024,
              model: "runware:100@1",
              numberResults: 1,
              outputFormat: "WEBP",
            },
            signal: runwareController.signal,
          });
        } catch (e: any) {
          // Handle timeout/abort as 504 instead of generic network error
          if (e?.name === "AbortError") {
            logTier1Step("Image Generation", "failed", "Runware timeout (20s)");
            return corsResponse(
              {
                success: false,
                error: "Image generation timeout",
                tier: "TIER_1",
                retryAfterSeconds: 6,
                requestId: requestId,
              },
              req,
              504
            );
          }
          throw e;
        } finally {
          clearTimeout(runwareTimeout);
        }

        if (!imageResult?.success || !imageResult?.imageURL) {
          logTier1Step("Image Generation", "failed", "RunwareWebSocketService image generation failed");
          throw new Error("TIER_1_PROCESSING_FAILED: Image generation failed");
        }

        logTier1Step(
          "Image Generation",
          "success",
          `Image generated successfully: ${String(imageResult.imageURL).substring(0, 50)}...`,
        );

        // Return successful COMPLETE_TIER_1 response
        tierLogger.success("TIER_1", {
          templateStructure: "COMPLETE_TIER_1",
          imageURL: imageResult.imageURL,
          enhancedPrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt,
        });

        return corsResponse(
          {
            success: true,
            imageURL: imageResult.imageURL,
            provider: "runware-websocket",
            tier: "TIER_1",
            pathUsed: "orchestrator",
            resultType: "TIER_1_SUCCESS",
            templateStructure: "COMPLETE_TIER_1",
            requestId: requestId,
            timestamp: new Date().toISOString(),
            positivePrompt: enhancedPrompt.enhancedPrompt,
            negativePrompt: enhancedPrompt.negativePrompt,

            // Enhanced Debug Data for E2E Simulation
            tier1Debug: {
              timeline: tier1ErrorLog,
              enhancedPrompt: enhancedPrompt.enhancedPrompt,
              negativePrompt: enhancedPrompt.negativePrompt,
              primaryScene: enhancedPrompt.primaryScene,
              templateStructure: enhancedPrompt.templateStructure,
            },

            orchestratorDebugData: {
              aiDebugSchema: enhancedPrompt.aiDebugSchema,
              primaryScene: enhancedPrompt.primaryScene,
              aiSchema: enhancedPrompt.aiSchema,
            },
            metadata: {
              enhancedPrompt: enhancedPrompt.enhancedPrompt,
              negativePrompt: enhancedPrompt.negativePrompt,
              primaryScene: enhancedPrompt.primaryScene,
              templateStructure: "COMPLETE_TIER_1",
              cascadeHistory: ["✅ Tier 1 Complete Success"],
            },
          },
          req,
          200
        );
        
        // Release Tier 1 gate on success
        if (!payload.skipTier1DueToOverload && tier1GateResult.acquired) {
          release("T1:ai-visual-scene-creator");
        }
        
        return; // Early return on success
      } catch (tier1Error) {
        // Release Tier 1 gate on failure
        if (!payload.skipTier1DueToOverload && tier1GateResult.acquired) {
          release("T1:ai-visual-scene-creator");
        }
        const errorMessage = tier1Error instanceof Error ? tier1Error.message : String(tier1Error);
        const errorStack = tier1Error instanceof Error ? tier1Error.stack : undefined;
        console.log(`[TIER_1] Failed: ${errorMessage}`);
        console.log(`[TIER_1] Error stack:`, errorStack);
        tierLogger.failure("TIER_1", { error: errorMessage });

        const normalizedTier1Reason = (errorMessage && errorMessage.includes("mainCharacterDetails")) ? "character description missing" : errorMessage;

        // FORCE MODE: If forceCompleteTier1 is true, return failure immediately without cascading
        if (forceCompleteTier1) {
          console.log(`[TIER_1_FORCE_MODE] forceCompleteTier1=true - returning failure immediately, NO CASCADE`);

          // Detect component-specific failures
          const isCharacterServiceFailure =
            errorMessage.includes("CharacterConsistencyService") ||
            errorMessage.includes("CHARACTERSERVICE_UNAVAILABLE") ||
            errorMessage.includes("Module not found") ||
            errorMessage.includes("GETSTRUCTUREDAVATARDATA");
          const isAISceneCreatorFailure =
            errorMessage.includes("ai-visual-scene-creator") ||
            errorMessage.includes("MISSING_STORY_CONTENT") ||
            errorMessage.includes("NO_PRIMARY_SCENE") ||
            errorMessage.includes("primaryScene");
          const isOrchestratorFailure =
            errorMessage.includes("PhaseIntegrationOrchestrator") ||
            errorMessage.includes("import") ||
            errorMessage.includes("IMPORT_SYNC_ANOMALY");
          const isRunwareFailure =
            errorMessage.includes("RunwareWebSocketService") ||
            errorMessage.includes("RUNWARE_API_KEY") ||
            errorMessage.includes("Image generation failed");

          // Component Health Status
          const componentHealth = {
            characterConsistencyService: !isCharacterServiceFailure,
            aiSceneCreator: !isAISceneCreatorFailure,
            orchestrator: !isOrchestratorFailure,
            runwareService: !isRunwareFailure,
          };

          // Determine failure category
          let failureCategory = "UNKNOWN_FAILURE";
          let failureDetails = errorMessage;

          if (isCharacterServiceFailure) {
            failureCategory = "CHARACTER_SERVICE_FAILURE";
            failureDetails =
              "CharacterConsistencyService unavailable or malfunctioning. Required methods may be missing.";
          } else if (isAISceneCreatorFailure) {
            failureCategory = "AI_SCENE_CREATOR_FAILURE";
            failureDetails = "ai-visual-scene-creator failed to generate primary scene. May be missing story content or API keys.";
          } else if (isOrchestratorFailure) {
            failureCategory = "ORCHESTRATOR_FAILURE";
            failureDetails = "Orchestrator failed to load or process. Import sync anomaly detected.";
          } else if (isRunwareFailure) {
            failureCategory = "RUNWARE_SERVICE_FAILURE";
            failureDetails = "Runware image generation service failed. Check API key and service availability.";
          }

          console.log(`[TIER_1_FORCE_MODE] Failure Category: ${failureCategory}`);
          console.log(`[TIER_1_FORCE_MODE] Component Health:`, componentHealth);
          console.log(`[TIER_1_FORCE_MODE] Tier 1 Timeline Steps:`, tier1ErrorLog.length);

          return corsResponse(
            {
              success: false,
              error: failureDetails,
              errorMessage: errorMessage,
              tier: "TIER_1_FORCE_MODE",
              pathUsed: "orchestrator",
              resultType: "TIER_1_FORCE_MODE_FAILURE",
              failureCategory: failureCategory,
              templateStructure: "TIER_1_FORCED_FAILURE",
              forceMode: true,
              cascadePrevented: true,
              cascadeBlocked: true,
              requestId: requestId,
              timestamp: new Date().toISOString(),

              // Enhanced Component Diagnostics
              componentHealth: componentHealth,
              componentFailures: {
                characterConsistencyService: isCharacterServiceFailure,
                aiSceneCreator: isAISceneCreatorFailure,
                orchestrator: isOrchestratorFailure,
                runwareService: isRunwareFailure,
              },

              // Tier 1 Timeline for Debugging
              tier1Debug: {
                timeline: tier1ErrorLog,
                lastStep: tier1ErrorLog[tier1ErrorLog.length - 1] || "Unknown",
                context: {
                  note:
                    "Tier 1 escalated to Direct Mode - AI scene insufficient, system operating normally",
                  partialData: payload
                    ? {
                        storyText: (payload.storyText || "").substring(0, 100) + "...",
                        hasUserInfo: !!payload.userInfo,
                        sessionId: payload.sessionId,
                      }
                    : null,
                },
              },

              metadata: {
                errorMessage,
                errorStack:
                  typeof errorStack === "string"
                    ? errorStack.substring(0, 500)
                    : String(errorStack || "No stack trace available").substring(0, 500),
                forceCompleteTier1: true,
                failureCategory: failureCategory,
                cascadeHistory: [
                  `❌ Tier 1 Force Mode Failed: ${failureCategory}`,
                  `📋 ${failureDetails}`,
                  "⛔ Cascade Blocked: forceCompleteTier1=true",
                ],
              },
            },
            req,
            200
          );
        }

        // Detect if CharacterConsistencyService is unavailable
        const isCharacterServiceUnavailable =
          errorMessage.includes("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE") ||
          errorMessage.includes("CharacterConsistencyService") ||
          errorMessage.includes("Module not found") ||
          errorMessage.includes("_shared");

        if (isCharacterServiceUnavailable) {
          console.log(
            `[CASCADE] CharacterConsistencyService unavailable - will attempt Direct Mode (CCS is copilot there)`,
          );
        }

        // Create Supabase client once for all fallback attempts
        const { createVendorFirstSupabaseClient } = await memoizedImport("../_shared/resilientLoader.js");
        const internalSupabase = await createVendorFirstSupabaseClient();

        // Hoist response variables to outer scope for proper access across try/catch blocks
        let directModeResponse: any = null;
        let tier25aResponse: any = null;
        let tier25bResponse: any = null;
        let tier25cResponse: any = null;
        let tier25dResponse: any = null;

        let directErrorMessage = "Direct Mode not attempted";

        // CORRECTED CASCADE: Always try Direct Mode after Tier 1 failure (Direct Mode works without Tier 1 scene)
        const skipReason = payload.skipTier1DueToOverload 
          ? "Tier 1 overload detected" 
          : "Tier 1 failure";
        console.log(`[DIRECT_MODE] Attempting Direct Mode fallback (${skipReason})`);
        console.log(`🚀 [DIRECT_MODE] Proceeding without gate check (always available - zero throttling)`);

        try {

          try {
            // Add 20-second timeout for Direct Mode call (temporarily increased for verification)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);

            try {
              const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
              const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
              
              // Validate SUPABASE_URL
              if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                throw new Error("SUPABASE_URL environment variable is not set");
              }
              
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              };
              
              // Only add apikey header if key exists
              if (SUPABASE_ANON_KEY) {
                headers["apikey"] = SUPABASE_ANON_KEY;
              }
              
              const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-visual-scene-creator`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  ...payload,
                  // Pass structuredAvatarData from orchestrator if Tier 1 partially succeeded
                  userInfo: {
                    ...payload.userInfo,
                    structuredAvatarData:
                      enhancedPrompt?.structuredAvatarData || payload.userInfo?.structuredAvatarData,
                  },
                  directMode: true,
                  tier1FailureReason: normalizedTier1Reason,
                }),
                signal: controller.signal,
              });
              
              if (!response.ok) {
                directModeResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
              } else {
                const data = await response.json();
                directModeResponse = { data };
              }
            } catch (e: any) {
              if (e?.name === "AbortError") {
                directModeResponse = { error: { message: "Direct Mode timeout (20s)" } };
              } else {
                throw e;
              }
            } finally {
              clearTimeout(timeout);
            }

            // Direct Mode returns primaryScene (text), not imageURL.
            if (
              directModeResponse?.data?.success &&
              (directModeResponse.data?.imageURL || directModeResponse.data?.primaryScene)
            ) {
              const result = {
                success: true,
                imageURL: directModeResponse.data.imageURL,
                primaryScene: directModeResponse.data.primaryScene, // Include primaryScene for downstream processing
                provider: "direct-mode-fallback",
                tier: "DIRECT_MODE",
                pathUsed: "direct-mode",
                resultType: "DIRECT_MODE_SUCCESS",
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: normalizedTier1Reason,
                // Expose prompts at top level for easy frontend access
                positivePrompt: directModeResponse.data?.runwareDebugData?.positivePrompt,
                negativePrompt: directModeResponse.data?.runwareDebugData?.negativePrompt,
                metadata: {
                  cascadeHistory: [`❌ Tier 1 Failed: ${errorMessage}`, "✅ Direct Mode Success"],
                },
                // NEW: Direct Mode debug data from ai-visual-scene-creator
                directModeDebugData: {
                  aiDebugSchema: directModeResponse.data?.aiDebugSchema,
                  runwareDebugData: directModeResponse.data?.runwareDebugData,
                  primaryScene: directModeResponse.data?.primaryScene,
                },
              };

              tierLogger.success("DIRECT_MODE", { 
                result,
                positivePrompt: directModeResponse.data?.runwareDebugData?.positivePrompt || directModeResponse.data?.positivePrompt,
                negativePrompt: directModeResponse.data?.runwareDebugData?.negativePrompt || directModeResponse.data?.negativePrompt,
                imageUrl: directModeResponse.data.imageURL,
                edgeFunction: 'runware-template-cd',
                pageNumber: pageNumberValue
              });
              console.log(`SUCCESS [${requestId}] Direct Mode fallback completed`);

              return corsResponse(
                {
                  ...result,
                },
                req
              );
            } else {
              throw new Error("DIRECT_MODE_FAILED: " + (directModeResponse?.error?.message || "Direct mode processing failed"));
            }
          } finally {
            // Direct Mode has no gate - nothing to release
          }
        } catch (directModeError) {
          directErrorMessage =
            directModeError instanceof Error ? directModeError.message : String(directModeError);
          console.log(`[DIRECT_MODE] Failed: ${directErrorMessage}`);
          tierLogger.failure("DIRECT_MODE", { error: directErrorMessage });
          // Continue to 2.5A cascade below
        }

        // Track error messages from all tier attempts for universal 2.5C fallback
        let tier25aErrorMessage = "";
        let tier25bErrorMessage = "";

        // CRITICAL FIX: Skip 2.5A if CharacterConsistencyService is unavailable
        if (isCharacterServiceUnavailable) {
          console.log(
            `[CASCADE] Skipping 2.5A - CharacterConsistencyService unavailable, routing directly to 2.5B`,
          );
          tier25aErrorMessage = "SKIPPED: CharacterConsistencyService unavailable";

          // Try Tier 2.5B directly
          console.log(`[TIER_2.5B] Attempting fallback (2.5A skipped due to missing service)`);

          try {
            // Add 15-second timeout for Tier 2.5B call
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            try {
              const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
              const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
              
              // Validate SUPABASE_URL
              if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                throw new Error("SUPABASE_URL environment variable is not set");
              }
              
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              };
              
              // Only add apikey header if key exists
              if (SUPABASE_ANON_KEY) {
                headers["apikey"] = SUPABASE_ANON_KEY;
              }
              
              const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  ...payload,
                  templateComplexity: "B",
                  tier1FailureReason: normalizedTier1Reason,
                  tier25aFailureReason: tier25aErrorMessage,
                }),
                signal: controller.signal,
              });
              
              if (!response.ok) {
                tier25bResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
              } else {
                const data = await response.json();
                tier25bResponse = { data };
              }
            } catch (e: any) {
              if (e?.name === "AbortError") {
                tier25bResponse = { error: { message: "Tier 2.5B timeout (15s)" } };
              } else {
                throw e;
              }
              } finally {
                clearTimeout(timeout);
              }

              if (tier25bResponse?.data?.success && tier25bResponse.data?.imageURL) {
              const result = {
                success: true,
                imageURL: tier25bResponse.data.imageURL,
                provider: "tier-2.5b-fallback",
                tier: "TIER_2.5B",
                pathUsed: "template-cascade",
                resultType: "TIER_2.5B_SUCCESS",
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: normalizedTier1Reason,
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: CharacterConsistencyService unavailable`,
                    `❌ Direct Mode Failed: ${directErrorMessage}`,
                    `⏭️ Tier 2.5A Skipped: CharacterConsistencyService unavailable`,
                    "✅ Tier 2.5B Success (Nuclear Independence)",
                  ],
                },
              };

              tierLogger.success("TIER_2.5B", { 
                result,
                positivePrompt: tier25bResponse.data.positivePrompt || tier25bResponse.data.templateData?.positivePrompt,
                negativePrompt: tier25bResponse.data.negativePrompt || tier25bResponse.data.templateData?.negativePrompt,
                imageUrl: tier25bResponse.data.imageURL,
                edgeFunction: 'runware-template-ab',
                pageNumber: pageNumberValue
              });
              console.log(`SUCCESS [${requestId}] Tier 2.5B fallback completed (2.5A skipped)`);

              return corsResponse(
                {
                  ...result,
                },
                req
              );
            } else {
              throw new Error("TIER_2.5B_FAILED: Template B processing failed");
            }
          } catch (tier25bError) {
            tier25bErrorMessage = tier25bError instanceof Error ? tier25bError.message : String(tier25bError);
            console.log(`[TIER_2.5B] Failed: ${tier25bErrorMessage}`);
            tierLogger.failure("TIER_2.5B", { error: tier25bErrorMessage });
            // Error stored - will attempt 2.5C in universal fallback block below
          }
        }

        // Try Tier 2.5A (only if CharacterConsistencyService is available)
        if (!isCharacterServiceUnavailable) {
          console.log(`[TIER_2.5A] Attempting fallback after Direct Mode or if no primaryScene`);

          try {
            // Gate check for Tier 2.5A
            const t25aGateResult = await acquire("T25A:runware-template-ab");
            if (!t25aGateResult.acquired) {
              console.warn(`⚠️ [GATE] Tier 2.5A denied: ${t25aGateResult.reason}`);
              tier25aErrorMessage = `GATE_DENIED: ${t25aGateResult.reason}`;
              throw new Error(tier25aErrorMessage);
            }

            try {
              // Add 15-second timeout for Tier 2.5A call
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);

              try {
                const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
                const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
                
                // Validate SUPABASE_URL
                if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                  throw new Error("SUPABASE_URL environment variable is not set");
                }
                
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                };
                
                // Only add apikey header if key exists
                if (SUPABASE_ANON_KEY) {
                  headers["apikey"] = SUPABASE_ANON_KEY;
                }
                
                const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    ...payload,
                    templateComplexity: "A",
                     tier1FailureReason: normalizedTier1Reason,
                  }),
                  signal: controller.signal,
                });
                
                if (!response.ok) {
                  tier25aResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
                } else {
                  const data = await response.json();
                  tier25aResponse = { data };
                }
              } catch (e: any) {
                if (e?.name === "AbortError") {
                  tier25aResponse = { error: { message: "Tier 2.5A timeout (15s)" } };
                } else {
                  throw e;
                }
              } finally {
                clearTimeout(timeout);
              }

              if (tier25aResponse?.data?.success && tier25aResponse.data?.imageURL) {
                const result = {
                  success: true,
                  imageURL: tier25aResponse.data.imageURL,
                  provider: "tier-2.5a-fallback",
                  tier: "TIER_2.5A",
                  pathUsed: "template-cascade",
                  resultType: "TIER_2.5A_SUCCESS",
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                   tier1FailureReason: normalizedTier1Reason,
                  metadata: {
                    cascadeHistory: [
                      `❌ Tier 1 Failed: ${
                        errorMessage.includes("NO_PRIMARY_SCENE") ? "NO_PRIMARY_SCENE (missing service key)" : errorMessage
                      }`,
                      `❌ Direct Mode Failed: ${directErrorMessage}`,
                      "✅ Tier 2.5A Success",
                    ],
                  },
                };

                tierLogger.success("TIER_2.5A", { 
                  result,
                  positivePrompt: tier25aResponse.data.positivePrompt || tier25aResponse.data.templateData?.positivePrompt,
                  negativePrompt: tier25aResponse.data.negativePrompt || tier25aResponse.data.templateData?.negativePrompt,
                  imageUrl: tier25aResponse.data.imageURL,
                  edgeFunction: 'runware-template-ab',
                  pageNumber: pageNumberValue
                });
                console.log(`SUCCESS [${requestId}] Tier 2.5A fallback completed`);

                return corsResponse(
                  {
                    ...result,
                  },
                  req
                );
              } else {
                throw new Error("TIER_2.5A_FAILED: Template A processing failed");
              }
            } finally {
              // Ensure gate is released
              release("T25A:runware-template-ab");
            }
          } catch (tier25aError) {
            tier25aErrorMessage = tier25aError instanceof Error ? tier25aError.message : String(tier25aError);
            console.log(`[TIER_2.5A] Failed: ${tier25aErrorMessage}`);
            tierLogger.failure("TIER_2.5A", { error: tier25aErrorMessage });

            // Try Tier 2.5B
            console.log(`[TIER_2.5B] Attempting fallback after 2.5A failure`);

            try {
              // Add 15-second timeout for Tier 2.5B call
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);

              try {
                const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
                const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
                
                // Validate SUPABASE_URL
                if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                  throw new Error("SUPABASE_URL environment variable is not set");
                }
                
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                };
                
                // Only add apikey header if key exists
                if (SUPABASE_ANON_KEY) {
                  headers["apikey"] = SUPABASE_ANON_KEY;
                }
                
                const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    ...payload,
                    templateComplexity: "B",
                     tier1FailureReason: normalizedTier1Reason,
                    tier25aFailureReason: tier25aErrorMessage,
                  }),
                  signal: controller.signal,
                });
                
                if (!response.ok) {
                  tier25bResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
                } else {
                  const data = await response.json();
                  tier25bResponse = { data };
                }
              } catch (e: any) {
                if (e?.name === "AbortError") {
                  tier25bResponse = { error: { message: "Tier 2.5B timeout (15s)" } };
                } else {
                  throw e;
                }
              } finally {
                clearTimeout(timeout);
              }

              if (tier25bResponse?.data?.success && tier25bResponse.data?.imageURL) {
                const result = {
                  success: true,
                  imageURL: tier25bResponse.data.imageURL,
                  provider: "tier-2.5b-fallback",
                  tier: "TIER_2.5B",
                  pathUsed: "template-cascade",
                  resultType: "TIER_2.5B_SUCCESS",
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                  cascadeFailures: [errorMessage, tier25aErrorMessage],
                  metadata: {
                    cascadeHistory: [
                      `❌ Tier 1 Failed: ${errorMessage}`,
                      `❌ Direct Mode Failed: ${directErrorMessage}`,
                      `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                      "✅ Tier 2.5B Success",
                    ],
                  },
                };

                tierLogger.success("TIER_2.5B", { 
                  result,
                  positivePrompt: tier25bResponse.data.positivePrompt || tier25bResponse.data.templateData?.positivePrompt,
                  negativePrompt: tier25bResponse.data.negativePrompt || tier25bResponse.data.templateData?.negativePrompt,
                  imageUrl: tier25bResponse.data.imageURL,
                  edgeFunction: 'runware-template-ab',
                  pageNumber: pageNumberValue
                });
                console.log(`SUCCESS [${requestId}] Tier 2.5B fallback completed`);

                return corsResponse(
                  {
                    success: true,
                    ...result,
                  },
                  req
                );
              } else {
                throw new Error("TIER_2.5B_FAILED: Template B processing failed");
              }
            } catch (tier25bError) {
              tier25bErrorMessage = tier25bError instanceof Error ? tier25bError.message : String(tier25bError);
              console.log(`[TIER_2.5B] Failed: ${tier25bErrorMessage}`);
              tierLogger.failure("TIER_2.5B", { error: tier25bErrorMessage });
              // Error stored - will attempt 2.5C in universal fallback block below
            }
          }
        } // Close if (!isCharacterServiceUnavailable)

        // UNIVERSAL 2.5C FALLBACK: Attempt 2.5C if ANY 2.5B failed (from either path)
        if (tier25bErrorMessage) {
          console.log(
            `[TIER_2.5C] Attempting universal fallback after 2.5B failure (from ${
              isCharacterServiceUnavailable ? "direct 2.5B" : "2.5A→2.5B"
            } path)`,
          );

          let tier25cErrorMessage: string | undefined;
          try {
            // Gate check for Tier 2.5C
            const t25cGateResult = await acquire("T25C:runware-template-cd");
            if (!t25cGateResult.acquired) {
              console.warn(`⚠️ [GATE] Tier 2.5C denied: ${t25cGateResult.reason}`);
              tier25cErrorMessage = `GATE_DENIED: ${t25cGateResult.reason}`;
              tierLogger.failure("TIER_2.5C", { error: tier25cErrorMessage });
              throw new Error(tier25cErrorMessage);
            }

            try {
              // Add 15-second timeout for Tier 2.5C call
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);

              try {
                const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
                const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
                
                // Validate SUPABASE_URL
                if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                  throw new Error("SUPABASE_URL environment variable is not set");
                }
                
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                };
                
                // Only add apikey header if key exists
                if (SUPABASE_ANON_KEY) {
                  headers["apikey"] = SUPABASE_ANON_KEY;
                }
                
                const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    ...payload,
                    templateComplexity: "C",
                     tier1FailureReason: normalizedTier1Reason,
                    tier25aFailureReason: tier25aErrorMessage,
                    tier25bFailureReason: tier25bErrorMessage,
                  }),
                  signal: controller.signal,
                });
                
                if (!response.ok) {
                  tier25cResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
                } else {
                  const data = await response.json();
                  tier25cResponse = { data };
                }
              } catch (e: any) {
                if (e?.name === "AbortError") {
                  tier25cResponse = { error: { message: "Tier 2.5C timeout (15s)" } };
                } else {
                  throw e;
                }
              } finally {
                clearTimeout(timeout);
              }

              if (tier25cResponse?.data?.success && tier25cResponse.data?.imageURL) {
                const result = {
                  success: true,
                  imageURL: tier25cResponse.data.imageURL,
                  provider: "tier-2.5c-fallback",
                  tier: "TIER_2.5C",
                  pathUsed: "template-cascade",
                  resultType: "TIER_2.5C_SUCCESS",
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                  cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage],
                  metadata: {
                    cascadeHistory: [
                      `❌ Tier 1 Failed: ${errorMessage}`,
                      `❌ Direct Mode Failed: ${directErrorMessage}`,
                      `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                      `❌ Tier 2.5B Failed: ${tier25bErrorMessage}`,
                      "✅ Tier 2.5C Success (Nuclear Fallback)",
                    ],
                  },
                };

                tierLogger.success("TIER_2.5C", { 
                  result,
                  positivePrompt: tier25cResponse.data.positivePrompt || tier25cResponse.data.templateData?.positivePrompt,
                  negativePrompt: tier25cResponse.data.negativePrompt || tier25cResponse.data.templateData?.negativePrompt,
                  imageUrl: tier25cResponse.data.imageURL,
                  edgeFunction: 'runware-template-cd',
                  pageNumber: pageNumberValue
                });
                console.log(`SUCCESS [${requestId}] Tier 2.5C universal fallback completed`);

                return corsResponse(
                  {
                    success: true,
                    ...result,
                  },
                  req
                );
              } else {
                throw new Error("TIER_2.5C_FAILED: Template C processing failed");
              }
            } finally {
              // Ensure gate is released
              release("T25C:runware-template-cd");
            }
          } catch (tier25cError) {
            tier25cErrorMessage = tier25cError instanceof Error ? tier25cError.message : String(tier25cError);
            console.log(`[TIER_2.5C] Failed: ${tier25cErrorMessage}`);
            tierLogger.failure("TIER_2.5C", { error: tier25cErrorMessage });

            // Try Tier 2.5D before escalating to TIER_4
            console.log(`[TIER_2.5D] Attempting emergency fallback after 2.5C failure`);

            let tier25dErrorMessage: string | undefined;
            try {
              // Gate check for Tier 2.5D
              const t25dGateResult = await acquire("T25D:runware-template-cd");
              if (!t25dGateResult.acquired) {
                console.warn(`⚠️ [GATE] Tier 2.5D denied: ${t25dGateResult.reason}`);
                tier25dErrorMessage = `GATE_DENIED: ${t25dGateResult.reason}`;
                tierLogger.failure("TIER_2.5D", { error: tier25dErrorMessage });
                throw new Error(tier25dErrorMessage);
              }

              try {
                // Add 15-second timeout for Tier 2.5D call
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);

                try {
                  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
                  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
                  
                  // Validate SUPABASE_URL
                  if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
                    throw new Error("SUPABASE_URL environment variable is not set");
                  }
                  
                  const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                  };
                  
                  // Only add apikey header if key exists
                  if (SUPABASE_ANON_KEY) {
                    headers["apikey"] = SUPABASE_ANON_KEY;
                  }
                  
                  const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                      ...payload,
                      templateComplexity: "D",
                      tier1FailureReason: normalizedTier1Reason,
                      tier25aFailureReason: tier25aErrorMessage,
                      tier25bFailureReason: tier25bErrorMessage,
                      tier25cFailureReason: tier25cErrorMessage,
                    }),
                    signal: controller.signal,
                  });
                  
                  if (!response.ok) {
                    tier25dResponse = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
                  } else {
                    const data = await response.json();
                    tier25dResponse = { data };
                  }
                } catch (e: any) {
                  if (e?.name === "AbortError") {
                    tier25dResponse = { error: { message: "Tier 2.5D timeout (15s)" } };
                  } else {
                    throw e;
                  }
                } finally {
                  clearTimeout(timeout);
                }

                if (tier25dResponse?.data?.success && tier25dResponse.data?.imageURL) {
                  const result = {
                    success: true,
                    imageURL: tier25dResponse.data.imageURL,
                    provider: "tier-2.5d-fallback",
                    tier: "TIER_2.5D",
                    pathUsed: "template-cascade",
                    resultType: "TIER_2.5D_SUCCESS",
                    requestId: requestId,
                    timestamp: new Date().toISOString(),
                    cascadeFailures: [
                      errorMessage,
                      tier25aErrorMessage,
                      tier25bErrorMessage,
                      tier25cErrorMessage,
                      directErrorMessage,
                    ],
                    metadata: {
                      cascadeHistory: [
                        `❌ Tier 1 Failed: ${errorMessage}`,
                        `❌ Direct Mode Failed: ${directErrorMessage}`,
                        `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                        `❌ Tier 2.5B Failed: ${tier25bErrorMessage}`,
                        `❌ Tier 2.5C Failed: ${tier25cErrorMessage}`,
                        "✅ Tier 2.5D Success (Emergency Template)",
                      ],
                    },
                  };

                  tierLogger.success("TIER_2.5D", { 
                    result,
                    positivePrompt: tier25dResponse.data.positivePrompt || tier25dResponse.data.templateData?.positivePrompt,
                    negativePrompt: tier25dResponse.data.negativePrompt || tier25dResponse.data.templateData?.negativePrompt,
                    imageUrl: tier25dResponse.data.imageURL,
                    edgeFunction: 'runware-template-cd',
                    pageNumber: pageNumberValue
                  });
                  console.log(`SUCCESS [${requestId}] Tier 2.5D emergency fallback completed`);

                  return corsResponse(
                    {
                      success: true,
                      ...result,
                    },
                    req
                  );
                } else {
                  throw new Error("TIER_2.5D_FAILED: Template D processing failed");
                }
              } finally {
                // Ensure gate is released
                release("T25D:runware-template-cd");
              }
            } catch (tier25dError) {
              tier25dErrorMessage = tier25dError instanceof Error ? tier25dError.message : String(tier25dError);
              console.log(`[TIER_2.5D] Failed: ${tier25dErrorMessage}`);
              tierLogger.failure("TIER_2.5D", { error: tier25dErrorMessage });

              // All tiers exhausted - final error - return 503 to signal client backoff
              const finalError = `All tiers exhausted. Final errors: Tier1: ${errorMessage}, 2.5A: ${tier25aErrorMessage}, 2.5B: ${tier25bErrorMessage}, 2.5C: ${tier25cErrorMessage}, 2.5D: ${tier25dErrorMessage}`;
              tierLogger.failure("ALL_TIERS", { finalError });
              console.error(`❌ [${requestId}] All tiers failed`);

              return corsResponse(
                {
                  success: false,
                  error: finalError,
                  escalationTarget: "TIER_4",
                  message: "All image generation tiers failed. Please try again.",
                  retryAfterSeconds: 8,
                },
                req,
                503
              );
            }
          }
        }
      } // Close if (!isCharacterServiceUnavailable)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if this is a validation error (client error, not server error)
      const isValidationError = errorMessage.includes("NO_STORY_CONTENT") || 
                                errorMessage.includes("PAYLOAD_NULL") || 
                                errorMessage.includes("NO_SESSION_OR_USER_INFO");

      if (isValidationError) {
        // Return 400 Bad Request for client-side validation errors
        console.error(`[runware-generate-image] Validation error: ${errorMessage}`);
        return corsResponse(
          {
            success: false,
            error: errorMessage,
            message: errorMessage === "NO_STORY_CONTENT" 
              ? "Missing required story content. Please provide pageText or storyText in the request body."
              : errorMessage === "NO_SESSION_OR_USER_INFO"
              ? "Missing required session or user information."
              : "Invalid request payload",
            hint: "Check your request body structure and ensure all required fields are present",
            requiredFields: {
              storyContent: "pageText OR storyText",
              sessionId: "string",
              userInfo: "object"
            }
          },
          req,
          400
        );
      }

      // Check if this is a boot sync error that should be retried
      const isSyncFailure = FAST_BOOT_SYNC.bootErrors.some((msg) => errorMessage.includes(msg));

      if (!isSyncFailure || attempt === FAST_BOOT_SYNC.maxRetries) {
        // Final failure or non-sync error
        console.error(`[runware-generate-image] Final error after retries: ${errorMessage}`);
        return corsResponse(
          {
            error: errorMessage,
            escalationTarget: "TIER_4",
          },
          req,
          500
        );
      }

      const delay = FAST_BOOT_SYNC.delays[attempt];
      console.warn(
        `🔄 [RUNWARE_GEN] Fast boot retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but fallback
  return corsResponse(
    {
      error: "Max retries exceeded",
      escalationTarget: "TIER_4",
    },
    req,
    500
  );
});
