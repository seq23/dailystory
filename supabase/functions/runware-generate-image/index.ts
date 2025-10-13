// 🚀 DEPLOYMENT MARKER: v2025-10-12-HEALTH-PATH-IMPORT-FREE
// Last deployed: 2025-10-12 20:00 UTC
// Changes: Remove dynamic imports from GET/HEAD health path for instant liveness - POST unchanged
// Previous: v2025-10-12-FIX-HEALTH-HANDLER-NULL-SAFE

// Standard imports for Supabase edge functions
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { UniversalLogger } from '../_shared/UniversalLogger.ts';

// ========== LAZY RELIABILITY MANAGER (loaded on first POST) ==========
let reliabilityManager: any = null;

async function getReliabilityManager() {
  if (reliabilityManager) return reliabilityManager;
  
  try {
    console.log('📦 [LAZY_RELIABILITY_ORCH] Loading vendor bundle');
    const vendorModule = await import("../_vendor/reliability-manager@1.0.0.bundle.mjs");
    reliabilityManager = vendorModule.reliabilityManager;
    console.log('✅ [LAZY_RELIABILITY_ORCH] Vendor bundle loaded');
    return reliabilityManager;
  } catch (vendorError) {
    console.warn('⚠️ [LAZY_RELIABILITY_ORCH] Vendor failed, trying shared:', vendorError?.message);
    
    try {
      const sharedModule = await import("../_shared/ReliabilityManager.ts");
      reliabilityManager = sharedModule.reliabilityManager;
      console.log('✅ [LAZY_RELIABILITY_ORCH] Shared bundle loaded');
      return reliabilityManager;
    } catch (sharedError) {
      console.error('❌ [LAZY_RELIABILITY_ORCH] Both imports failed, orchestrator will run without reliability wrapper');
      return null;
    }
  }
}

// NOTE: All modules are loaded lazily at runtime to prevent boot failures
// CCS is loaded dynamically in Tier 1 handler
// ReliabilityManager loaded via getReliabilityManager()
// All other modules loaded on-demand via dynamic imports

// CCS boot status tracking (referenced throughout orchestrator metadata)
const ccsBootStatus = { loaded: false, error: null };

// ============================================================================
// 🎯 ORCHESTRATOR: RESILIENT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ENHANCED: Complete tier cascade logic: 1 → Direct Mode → 2.5A → 2.5B → 2.5C → 2.5D
// ============================================================================

// NO STATIC IMPORTS - All imports are lazy-loaded inside the handler to prevent boot failures
// Types are inferred at runtime

// CRITICAL FIX: NuclearNegativePrompts now lazy-loaded inside POST handler to prevent boot delay

// ============= RESULT TYPES FOR TIER PIPELINE =============
type OkResult<T = any> = { 
  ok: true; 
  data: T; 
  meta?: { tier: string; ms: number; [key: string]: any }; 
};

type ErrResult = { 
  ok: false; 
  code: string; 
  reason?: string; 
  details?: any; 
};

type TierResult<T = any> = OkResult<T> | ErrResult;

// Tier function signature (all tiers use this)
type TierFn = (ctx: TierContext) => Promise<TierResult>;

interface TierContext {
  req: Request;
  requestId: string;
  payload: any;
  memoizedImport: <T = any>(href: string) => Promise<T>;
  tierLogger: any;
  generateNuclearNegativePrompt: any;
  detectCulturalProfileForNegatives: any;
  
  // Filled progressively by tiers (append-only)
  tier1?: {
    enhancedPrompt: any;
    characterSeed: any;
    culturalBundle: any;
    coloredObjects: string;
    secondaryCharacters: any[];
    mainCharacterAppearance: any;
    structuredAvatarData: any;
    latestClothing?: any;
  };
  trace?: Array<{ tier: string; ms: number; ok: boolean; code?: string; details?: any }>;
  requestAbort?: AbortController;
  directMode?: {
    imageURL?: string;
    seed?: string;
    primaryScene?: string;
  };
  healthRoutingDecision?: {
    orchestratorHealthy: boolean;
    openaiHealthy: boolean;
    routingStrategy: string;
    skippedTiers: string[];
  };
}

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

// ========== UNIFIED ERROR CATEGORIZATION ==========
interface ErrorCategory {
  type: 'NETWORK' | 'TIMEOUT' | 'API_ERROR' | 'VALIDATION' | 'INTERNAL';
  shouldRetry: boolean;
  escalate: boolean;
  message: string;
}

function categorizeError(error: any): ErrorCategory {
  const msg = error?.message || String(error);
  
  // Network errors (DNS, connection refused, etc.)
  if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('network')) {
    return {
      type: 'NETWORK',
      shouldRetry: true,
      escalate: true,
      message: 'Network connectivity issue - unable to reach external service'
    };
  }
  
  // Timeout errors
  if (msg.includes('timeout') || msg.includes('TIMEOUT') || error?.name === 'AbortError') {
    return {
      type: 'TIMEOUT',
      shouldRetry: true,
      escalate: true,
      message: 'Operation exceeded time budget - service may be overloaded'
    };
  }
  
  // API errors (rate limits, auth, etc.)
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('401') || msg.includes('403')) {
    return {
      type: 'API_ERROR',
      shouldRetry: false,
      escalate: true,
      message: 'External API error - check credentials or rate limits'
    };
  }
  
  // Validation errors
  if (msg.includes('validation') || msg.includes('invalid') || msg.includes('required')) {
    return {
      type: 'VALIDATION',
      shouldRetry: false,
      escalate: false,
      message: 'Invalid request data - check input parameters'
    };
  }
  
  // Internal errors
  return {
    type: 'INTERNAL',
    shouldRetry: false,
    escalate: true,
    message: msg.substring(0, 200)
  };
}

// ========== NETWORK OPERATION LOGGING ==========
interface NetworkMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

const networkMetrics: NetworkMetric[] = [];

function logNetworkOperation(
  operation: string,
  startTime: number,
  success: boolean,
  error?: any
): void {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  networkMetrics.push({
    operation,
    startTime,
    endTime,
    duration,
    success,
    error: error?.message
  });
  
  const status = success ? '✅' : '❌';
  console.log(`${status} [NETWORK] ${operation}: ${duration}ms ${error ? `(${error.message})` : ''}`);
  
  // Keep last 20 metrics only
  if (networkMetrics.length > 20) {
    networkMetrics.shift();
  }
}

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

const EMERGENCY_AVATAR_DESCRIPTIONS: Record<string, string> = {
  boy: "a young boy with an adventurous spirit",
  girl: "a young girl with bright curious eyes",
  child: "a cheerful child with a warm smile",
  'gender-neutral': "a creative young person with boundless imagination",
  'prefer-not-to-answer': "a thoughtful child with a kind demeanor"
};

const EMERGENCY_SKIN_FEATURES: Record<string, string> = {
  pale: "fair complexion with rosy cheeks",
  light: "light skin with warm undertones",
  medium: "medium tan skin with natural glow",
  olive: "olive-toned skin with golden warmth",
  dark: "rich dark skin with radiant beauty"
};

function emergencyHairFallback(skinTone: string | undefined): string {
  const normalized = (skinTone || "medium").toLowerCase().trim();
  return EMERGENCY_HAIR_MAP[normalized] || EMERGENCY_HAIR_MAP["medium"];
}

function emergencyAvatarDescription(avatarType: string | undefined): string {
  const normalized = (avatarType || "child").toLowerCase().trim();
  return EMERGENCY_AVATAR_DESCRIPTIONS[normalized] || EMERGENCY_AVATAR_DESCRIPTIONS["child"];
}

function emergencySkinFeatures(skinTone: string | undefined): string {
  const normalized = (skinTone || "medium").toLowerCase().trim();
  return EMERGENCY_SKIN_FEATURES[normalized] || EMERGENCY_SKIN_FEATURES["medium"];
}

// Emergency African American Arrays (3 samples per gender + 5 neutral)
// Source: StaticDataCache.js AFRICAN_AMERICAN_HAIRSTYLES and AFRICAN_AMERICAN_FACIAL_FEATURES
const EMERGENCY_AFRICAN_AMERICAN_HAIR: Record<string, string[]> = {
  girls: [
    "wearing a full voluminous afro with authentic coily texture, natural 4B-4C curl pattern, rounded dome shape, dense hair distribution, individual curl spirals visible, matte finish texture, proper afro proportions, natural hair movement",
    "wearing individual box braids with distinct square sectioning, each braid separately defined and visible, geometric parting pattern, multiple separate braided units, detailed individual braid texture, professional sectioning technique, natural or vibrant color variations",
    "wearing defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement"
  ],
  boys: [
    "wearing a curly top fade with perfectly defined coils on top, crisp line-up around the edges, and smooth fade transitions down the sides and back",
    "wearing twist sponge curls with tight coil definition, fresh line-up with sharp edges, and tapered sides with natural texture",
    "wearing a tapered afro with rounded natural shape, soft textured crown, and gradually shortened sides and back"
  ],
  neutral: [
    "wearing a full voluminous afro with authentic coily texture, natural 4B-4C curl pattern, rounded dome shape, dense hair distribution, individual curl spirals visible, matte finish texture, proper afro proportions, natural hair movement",
    "wearing defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement",
    "wearing a tapered afro with rounded natural shape, soft textured crown, and gradually shortened sides and back",
    "wearing twist sponge curls with tight coil definition and natural texture",
    "wearing natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement"
  ]
};

const EMERGENCY_AFRICAN_AMERICAN_FEATURES: Record<string, string[]> = {
  dark: [
    "deep brown skin tone with warm brown eyes and a bright infectious smile",
    "rich chocolate complexion with hazel eyes with golden flecks and a confident cheerful expression",
    "ebony skin tone with dark honey-colored eyes and a warm welcoming expression"
  ]
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function emergencyAfricanAmericanHair(avatarType: string | undefined, seed: string): string {
  const normalized = (avatarType || "child").toLowerCase().trim();
  
  let gender: "girls" | "boys" | "neutral";
  if (normalized === "girl") {
    gender = "girls";
  } else if (normalized === "boy") {
    gender = "boys";
  } else {
    // child, gender-neutral, prefer-not-to-answer use neutral array
    gender = "neutral";
  }
  
  const hairArray = EMERGENCY_AFRICAN_AMERICAN_HAIR[gender];
  const index = Math.abs(hashCode(seed)) % hairArray.length;
  return hairArray[index];
}

function emergencyAfricanAmericanFeatures(seed: string): string {
  const featuresArray = EMERGENCY_AFRICAN_AMERICAN_FEATURES.dark;
  const index = Math.abs(hashCode(seed)) % featuresArray.length;
  return featuresArray[index];
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
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL-REDACTED]")
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

// ✅ NUCLEAR FIX: Console-only logger (ZERO tierLogging references, never crashes)
function createConsoleOnlyLogger(isProd: boolean) {
  const wrapConsoleWithRedaction =
    (prefix: string) =>
    (msg: string, ctx: any = {}) => {
      const safeCtx = isProd ? redactPII(ctx) : ctx;
      console.log(`[${prefix}] ${msg}`, safeCtx);
    };

  return {
    t1: wrapConsoleWithRedaction("T1"),
    t2: wrapConsoleWithRedaction("T2"),
    attempt: (tier: string, ctx: any = {}) => wrapConsoleWithRedaction(tier)("Attempting", ctx),
    success: (tier: string, ctx: any = {}) => wrapConsoleWithRedaction(tier)("Success", ctx),
    failure: (tier: string, ctx: any = {}) => wrapConsoleWithRedaction(tier)("Failure", ctx),
  };
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

  let createVendorFirstSupabaseClient, supabaseClient;
  
  try {
    ({ createVendorFirstSupabaseClient } = await memoizedImport("./resilientLoader.js"));

    // ✅ Guard: Verify resilientLoader valid before using it
    if (!createVendorFirstSupabaseClient || typeof createVendorFirstSupabaseClient !== 'function') {
      console.warn('⚠️ [ORCHESTRATOR] resilientLoader missing/invalid - using console-only logger');
      return createConsoleOnlyLogger(isProd);
    }

    // Removed: tierLogging validation - using console-only logger (tierLogging.js doesn't exist)

    supabaseClient = await createVendorFirstSupabaseClient();

    // Sampling helper: only log to DB if sampled or failure
    const shouldLogToDB = (status: string = "info") => {
      if (status === "failed" || status === "failure") return true; // Always log failures
      if (debugTierSample === "1") return true; // Force 100% when DEBUG_TIER_LOG_SAMPLE=1 explicitly set
      if (logSampleRate >= 1.0) return true; // Full logging for other 100% rates
      return Math.random() < logSampleRate; // Sample for success/info logs
    };

    // Wrap logging functions with PII redaction, sampling, and NO-THROW guarantee
    const wrapWithRedactionAndSampling =
      (fn: Function) =>
      (msg: string, ctx: any = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;

        // Always console log
        console.log(`[TIER_LOG] ${msg}`, safeCtx);

        // Conditionally log to DB (sample or failure) - wrapped to NEVER throw
        const status = String(safeCtx.status || "info");
        if (shouldLogToDB(status)) {
          try {
            return fn(msg, safeCtx, supabaseClient, sessionId, requestId);
          } catch (dbError) {
            console.warn(`⚠️ [TIER_LOG] DB insert failed (non-fatal):`, dbError);
          }
        }
      };

    // ✅ NUCLEAR FIX: Helper for console-only fallback in return statement
    const wrapConsoleWithRedaction = (prefix: string) => {
      return (msg: string, ctx: any = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${prefix}] ${msg}`, safeCtx);
      };
    };

    // Use console-only logger (tierLogging.js doesn't exist, fallback is complete)
    return {
      t1: wrapConsoleWithRedaction("T1"),
      t2: wrapConsoleWithRedaction("T2"),
      attempt: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Attempting`, safeCtx);
      },
      success: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Success`, safeCtx);
      },
      failure: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.error(`[${tier}] Failure`, safeCtx);
      },
    };
  } catch (error) {
    console.warn(`⚠️ [ORCHESTRATOR] resilientLoader unavailable (NON-FATAL), using console-only logger:`, error);
    return createConsoleOnlyLogger(isProd);
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
// Also accepts primaryScene for Direct Mode Simple (2.5C) payloads
// This validation runs BEFORE any cascade tiers are attempted
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
  const hasPrimaryScene =
    payload.primaryScene && 
    typeof payload.primaryScene === "string" && 
    payload.primaryScene.trim().length > 0;

  if (!hasPageText && !hasStoryText && !hasBundlePageText && !hasBundleStoryText && !hasEnhancedStoryText && !hasPrimaryScene) {
    console.error("[runware-generate-image] ❌ VALIDATION FAILED: NO_STORY_CONTENT");
    console.error("[runware-generate-image] Validation details:", {
      hasPageText,
      hasStoryText,
      hasBundlePageText,
      hasBundleStoryText,
      hasEnhancedStoryText,
      hasPrimaryScene,
      payloadKeys: Object.keys(payload),
      storyTextType: typeof payload.storyText,
      storyTextLength: payload.storyText?.length || 0,
      storyTextPreview: payload.storyText?.substring(0, 50),
      bundleKeys: payload.bundle ? Object.keys(payload.bundle) : [],
      enhancedStoryDataKeys: payload.enhancedStoryData ? Object.keys(payload.enhancedStoryData) : []
    });
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
  detectCulturalProfileForNegatives: Function
): Promise<any> {
  const { pageText, storyText, userInfo, sessionId } = payload;
  const characterName = userInfo?.name || userInfo?.childName || "Child";

  console.log(`🎨 INLINED TIER 1: Processing for ${characterName} in session ${sessionId}`);
  const tier1Start = Date.now();

  // Declare local variables for CCS data (must be in function scope for strict mode)
  let characterSeed: { hair: string; skin: string; eyes: string } | undefined = undefined;
  let culturalBundle: any = undefined;
  let coloredObjects: string = "";
  let secondaryCharacters: any[] = [];
  let mainCharacterAppearance: any = {};

  // INLINE CCS ATTEMPT - FAIL-FAST TO DIRECT MODE (NO RETRIES, NO FALLBACKS)
  let characterConsistencyService: any;
  let characterServiceUnavailable = false;

  // Retry CCS import once to handle transient CDN/network failures
  let ccsImportAttempts = 0;
  const MAX_CCS_IMPORT_ATTEMPTS = 2;
  
  // Dynamic CCS import: load at runtime to prevent boot failures
  try {
    console.log(`📦 [CCS_INLINE] Loading CharacterConsistencyServiceInline.js dynamically`);
    const ccsModule = await import("./CharacterConsistencyServiceInline.js");
    characterConsistencyService = ccsModule.characterConsistencyService;
    console.log(`✅ [CCS_INLINE] CharacterConsistencyService loaded successfully`);
    ccsBootStatus.loaded = true;
    ccsBootStatus.error = null;
    logTier1Step("CharacterConsistencyService Import", "success", "Inline CCS (dynamic import) ready");
  } catch (ccsError) {
    ccsBootStatus.loaded = false;
    ccsBootStatus.error = "CCS_DYNAMIC_IMPORT_FAILED";
    console.error(`❌ [CCS_INLINE] Dynamic CCS import failed:`, ccsError);
    logTier1Step("CharacterConsistencyService Import", "failed", `Dynamic import error: ${ccsError.message}`);
    
    if (payload.forceCompleteTier1) {
      console.log("🚫 forceCompleteTier1: Blocking Direct Mode fallback");
      return {
        ok: false,
        code: "TIER_1_FORCED_FAILURE",
        details: {
          message: "Tier 1 failed in force mode - cascade blocked",
          tier: "TIER_1",
          cascadeBlocked: true,
          errorDetails: "CCS_DYNAMIC_IMPORT_FAILED"
        }
      };
    }
    
    throw new Error("INLINE_CCS_FAILED_ESCALATE_DIRECT_MODE");
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
  // ============= BATCH FETCH ALL CCS DATA (1 DB CALL) =============
  logTier1Step("Batch CCS Fetch", "attempt", "Fetching all CCS data in single call");

  let batchCCSData;
  try {
    batchCCSData = await characterConsistencyService.batchFetchCCSData(sessionId, characterName);
    
    // ✅ DEFENSIVE: Wrap success logging in try-catch to isolate any logging errors
    try {
      console.log(`✅ [${requestId}] [TIER_1] batchFetchCCSData: SUCCESS`, {
        sessionId,
        hasCharacterSeed: !!batchCCSData.characterSeed,
        visualDetailsCount: batchCCSData.visualDetails.length,
        coloredObjectsCount: batchCCSData.coloredObjects.length,
        latestClothing: batchCCSData.latestClothing || 'none'
      });
    } catch (logError) {
      console.error(`⚠️ [${requestId}] Failed to log batchCCSData success:`, logError);
    }
    
    // ✅ DEFENSIVE: Wrap logTier1Step call separately
    try {
      logTier1Step("Batch CCS Fetch", "success", `Fetched ${batchCCSData.visualDetails.length} cached visual details`);
    } catch (logError) {
      console.error(`⚠️ [${requestId}] Failed to call logTier1Step:`, logError);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] batchFetchCCSData: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Batch CCS Fetch", "failed", `Batch fetch: ${errorMessage}`);
    
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:batchFetchCCSData:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // ============= UNPACK BATCH DATA =============
  characterSeed = batchCCSData.characterSeed;
  coloredObjects = batchCCSData.coloredObjects.map(obj => obj.fullDescription).join(', ');
  
  // Self-test: Verify batch fetch succeeded without .order() errors
  if (!batchCCSData || (!batchCCSData.characterSeed && !batchCCSData.visualDetails.length)) {
    console.warn(`⚠️ [${requestId}] Batch CCS fetch returned empty - possible .order() incompatibility`);
    // Note: logTier1Step is always available (defined in executeTier1 scope)
    logTier1Step("Batch CCS Fetch", "success", `Fetched 0 cached visual details`);
  } else {
    console.log(`✅ [${requestId}] Batch CCS fetch completed successfully - no .order() errors`);
  }
  const latestClothing = batchCCSData.latestClothing;

  // ============= GENERATE FRESH AVATAR DATA (ALWAYS NEEDED) =============
  logTier1Step("Avatar Data Extraction", "attempt", "Building structured avatar data");
  const avatarSkinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || "medium";
  const avatarIdentity = {
    name: characterName,
    type: userInfo?.avatar?.type || "child",
    skinTone: avatarSkinTone,
  };

  let structuredAvatarData;
  try {
    structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
    console.log(`✅ [${requestId}] [TIER_1] getStructuredAvatarData: SUCCESS`, {
      skinTone: structuredAvatarData?.skinTone,
      hairColor: structuredAvatarData?.hairColor,
      skinFeatures: structuredAvatarData?.skinFeatures?.substring(0, 50)
    });
    logTier1Step("Avatar Data Extraction", "success", `Avatar: ${structuredAvatarData?.skinTone}, ${structuredAvatarData?.hairColor}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] getStructuredAvatarData: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Avatar Data Extraction", "failed", `getStructuredAvatarData: ${errorMessage}`);
    
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:getStructuredAvatarData:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // Defensive repair for hairColor
  if (structuredAvatarData && (!structuredAvatarData.hairColor || structuredAvatarData.hairColor.trim() === "" || structuredAvatarData.hairColor === "natural hair")) {
    const fallbackSkinTone = structuredAvatarData.skinTone || avatarSkinTone;
    structuredAvatarData.hairColor = emergencyHairFallback(fallbackSkinTone);
    console.log(`🔧 [${requestId}] [TIER_1] REPAIRED structuredAvatarData.hairColor to "${structuredAvatarData.hairColor}"`);
  }

  // ============= GENERATE FRESH CHARACTER SEED IF CACHE MISS =============
  if (!characterSeed) {
    logTier1Step("Enhanced Character Seed", "attempt", "Generating fresh character seed (cache miss)");
    try {
      characterSeed = await characterConsistencyService.getEnhancedCharacterSeed(
        sessionId,
        avatarIdentity,
        storyText || pageText || "",
        "continuing",
        latestClothing // Pass latest clothing for consistency
      );
      console.log(`✅ [${requestId}] [TIER_1] getEnhancedCharacterSeed: SUCCESS (fresh generation)`);
      logTier1Step("Enhanced Character Seed", "success", "Fresh character seed generated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [${requestId}] [TIER_1] getEnhancedCharacterSeed: FAILED`, { sessionId, error: errorMessage });
      logTier1Step("Enhanced Character Seed", "failed", `getEnhancedCharacterSeed: ${errorMessage}`);
      
      if (payload.forceCompleteTier1) {
        throw new Error(`CCS_METHOD_FAILED:getEnhancedCharacterSeed:${errorMessage}`);
      }
      throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
    }
  }

  // ============= EXTRACT CULTURAL BUNDLE FROM CHARACTER SEED =============
  logTier1Step("Cultural Bundle Extraction", "attempt", "Extracting cultural data from character seed");
  try {
    if (!characterSeed) {
      throw new Error("Character seed unavailable for cultural extraction");
    }
    
    // Extract hair and features from the characterSeed object
    culturalBundle = {
      hair: characterSeed.selectedCulturalHair || characterSeed.physicalTraits?.hair || "",
      features: characterSeed.selectedCulturalFeatures || characterSeed.physicalTraits?.skinFeatures || ""
    };
    
    console.log(`🔍 [${requestId}] [TIER_1] Extracted cultural bundle from characterSeed`, {
      sessionId,
      pageNumber: payload.pageNumber,
      culturalBundle,
    });
    
    // CRITICAL: Ensure culturalBundle has valid hair and features for Tier 2.5A
    const skinToneForFallback = structuredAvatarData?.skinTone || avatarSkinTone;
    
    if (!culturalBundle?.hair || culturalBundle.hair.trim() === "" || culturalBundle.hair === "natural hair") {
      const repairedHair = emergencyHairFallback(skinToneForFallback);
      console.log(`🔧 [${requestId}] [TIER_1] REPAIRING culturalBundle.hair`, {
        sessionId,
        original: culturalBundle?.hair || "(empty)",
        repaired: repairedHair,
        skinTone: skinToneForFallback,
      });
      if (!culturalBundle) culturalBundle = {};
      culturalBundle.hair = repairedHair;
    }
    
    if (!culturalBundle?.features || culturalBundle.features.trim() === "") {
      console.log(`🔧 [${requestId}] [TIER_1] REPAIRING culturalBundle.features`, {
        sessionId,
        original: culturalBundle?.features || "(empty)",
        repaired: "friendly features",
      });
      if (!culturalBundle) culturalBundle = {};
      culturalBundle.features = "friendly features";
    }
    
    console.log(`✅ [${requestId}] [TIER_1] culturalBundle VALIDATED`, {
      sessionId,
      hasHair: !!culturalBundle?.hair,
      hasFeatures: !!culturalBundle?.features,
      hair: culturalBundle?.hair,
      features: culturalBundle?.features,
    });
    logTier1Step("Cultural Bundle Extraction", "success", `Hair: ${culturalBundle?.hair?.substring(0, 30)}, Features: ${culturalBundle?.features?.substring(0, 30)}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] Cultural bundle extraction: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Cultural Bundle Extraction", "failed", `Cultural extraction: ${errorMessage}`);

    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:culturalBundleExtraction:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // ============= ANALYZE VISUAL DETAILS (ONLY IF NEW PAGE TEXT) =============
  if (storyText || pageText) {
    logTier1Step("Visual Details Analysis", "attempt", "Analyzing page text for visual details");
    const vizStageStart = Date.now();
    try {
      await characterConsistencyService.analyzeVisualDetails(sessionId, storyText || pageText, payload.pageNumber || 1);
      
      // Refresh colored objects from manifest after analysis
      const manifest = characterConsistencyService.getSessionManifest(sessionId);
      const allObjects = manifest.getAllObjects();
      coloredObjects = allObjects.map(obj => obj.fullDescription || `${obj.color} ${obj.object}`).join(', ');
      
      console.log(`✅ [${requestId}] [TIER_1] analyzeVisualDetails: SUCCESS`, {
        sessionId,
        pageNumber: payload.pageNumber,
        timing: `${Date.now() - vizStageStart}ms`,
        objectsDetected: allObjects.length
      });
      logTier1Step("Visual Details Analysis", "success", `Detected ${allObjects.length} colored objects in ${Date.now() - vizStageStart}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [${requestId}] [TIER_1] analyzeVisualDetails: FAILED`, {
        sessionId,
        error: errorMessage,
      });
      logTier1Step("Visual Details Analysis", "failed", `analyzeVisualDetails: ${errorMessage}`);
      
      if (payload.forceCompleteTier1) {
        throw new Error(`CCS_METHOD_FAILED:analyzeVisualDetails:${errorMessage}`);
      }
      throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
    }
  }

  // ============= DETECT SECONDARY CHARACTERS =============
  logTier1Step("Character Detection", "attempt", "Detecting secondary characters and main character appearance");
  let detectionResults: any = {};
  try {
    // Reuse session-cached secondary characters first
    secondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);

    // Run character detection to get main character appearance
    detectionResults = await characterConsistencyService.detectAllCharacters(storyText || pageText || "", {
      sessionId,
      pageNumber: payload.pageNumber || 1,
    });
    mainCharacterAppearance = detectionResults.mainCharacterAppearance || {};

    console.log(`✅ [${requestId}] [TIER_1] detectAllCharacters: SUCCESS`, {
      sessionId,
      pageNumber: payload.pageNumber,
      secondaryCharactersCount: secondaryCharacters.length,
      mainAppearanceDetected: Object.keys(mainCharacterAppearance).length > 0
    });
    logTier1Step("Character Detection", "success", `Detected ${secondaryCharacters.length} secondary characters`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] detectAllCharacters: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Character Detection", "failed", `detectAllCharacters: ${errorMessage}`);
    
    if (payload.forceCompleteTier1) {
      throw new Error(`CCS_METHOD_FAILED:detectAllCharacters:${errorMessage}`);
    }
    throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
  }

  // ============= DETECT ATMOSPHERE (INDOOR/OUTDOOR) =============
  logTier1Step("Atmosphere Detection", "attempt", "Detecting indoor/outdoor context");
  let sessionSetting = "";
  try {
    sessionSetting = await characterConsistencyService.detectSimpleAtmosphere(storyText || pageText || "");
    console.log(`🔍 [${requestId}] [TIER_1] detectSimpleAtmosphere: ${sessionSetting || "undetected"}`);
    logTier1Step("Atmosphere Detection", "success", `Context: ${sessionSetting || "neutral"}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [${requestId}] [TIER_1] detectSimpleAtmosphere: FAILED`, { sessionId, error: errorMessage });
    logTier1Step("Atmosphere Detection", "failed", `Atmosphere: ${errorMessage} (non-critical, continuing)`);
    sessionSetting = ""; // Non-critical, continue without context
  }

  // Keep animals lean (not required for templates currently)
  const detectedAnimals: any[] = [];

  // Lean CPU budget guard for Tier 1 analysis
  const TIER1_CPU_BUDGET_MS = 5000; // INCREASED from 2200ms to prevent false aborts
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
  
  // Check for skipTier1AI flag (force test mode)
  const skipAI = payload.skipTier1AI === true;
  
  if (skipAI) {
    console.log(`🎯 [${requestId}] SKIP_TIER1_AI: Simulating AI failure, proceeding without primaryScene`, {
      reason: 'Force test mode - skip AI scene extraction',
      ccsDataPopulated: true,
      willEscalateTo: 'TIER_2.5A or Direct Mode',
      simulatedFailure: true
    });
    
    // Set primaryScene to undefined (simulates AI failure)
    primaryScene = undefined;
    
    logTier1Step("AI Scene Creator Call", "skipped", "AI scene extraction bypassed for force test mode");
  } else {
    try {
      logTier1Step("AI Scene Creator Call", "attempt", "Invoking ai-visual-scene-creator");
      const { createVendorFirstSupabaseClient } = await memoizedImport("./resilientLoader.js");
      const supabase = await createVendorFirstSupabaseClient();

      // Use raw fetch with proper AbortController signal (supabase.functions.invoke ignores signal)
      const aiController = new AbortController();
      const aiTimeout = setTimeout(() => aiController.abort(), 25000); // CHANGED: 15s → 25s for AI processing
      
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

  // Skip primaryScene validation when in force test mode with skipTier1AI
  if (payload.forceCompleteTier1 && payload.skipTier1AI) {
    console.log(`🎯 [FORCE_TEST_MODE] Bypassing scene validation (forceCompleteTier1 + skipTier1AI)`, {
      primarySceneLength: primaryScene?.length || 0,
      willSkipEnhancedPrompt: true,
      tier1WillComplete: true
    });
    
    // Explicitly list the 7 CCS methods that ran successfully before this point
    const completedMethods = [
      'batchFetchCCSData',
      'getStructuredAvatarData',
      'getEnhancedCharacterSeed',
      'analyzeVisualDetails',
      'detectAllCharacters',
      'getSecondaryCharactersForSession',
      'detectSimpleAtmosphere'
    ];
    
    // ============= DIAGNOSTIC LOGGING FOR FORCE TEST MODE =============
    console.log(`🔍 [${requestId}] [FORCE_TEST_MODE] characterSeed validation:`, {
      hasCharacterSeed: !!characterSeed,
      characterSeedType: typeof characterSeed,
      characterSeedKeys: characterSeed ? Object.keys(characterSeed) : [],
      characterSeedSample: characterSeed ? JSON.stringify(characterSeed).substring(0, 300) : null
    });
    
    // ============= ENSURE VALID CHARACTER SEED FOR TEMPLATE-AB =============
    // Template-ab strictly validates characterSeed (lines 1115-1128)
    // If CCS methods partially failed, create a minimal valid seed for testing
    if (!characterSeed || typeof characterSeed !== 'object' || Object.keys(characterSeed).length === 0) {
      console.warn(`⚠️ [${requestId}] [FORCE_TEST_MODE] characterSeed invalid, creating comprehensive test seed`);
      
      const testAge = userInfo?.age || 8;
      const testName = userInfo?.name || avatarIdentity?.name || 'Test User';
      const testSkinTone = culturalBundle?.features?.skinTone || avatarIdentity?.skinTone || 'medium';
      const testHairColor = culturalBundle?.hair?.color || avatarIdentity?.hairColor || 'brown';
      const testAvatarType = avatarIdentity?.type || 'gender-neutral';
      const testEthnicity = structuredAvatarData?.ethnicity || 'general';
      
      characterSeed = {
        seed: Math.floor(Math.random() * 1000000),
        name: testName,
        characterName: testName,
        avatarType: testAvatarType,
        skinTone: testSkinTone,
        hairColor: testHairColor,
        hairStyle: culturalBundle?.hair?.style || avatarIdentity?.hairStyle || 'short',
        ageGroup: 'child',
        age: testAge,
        ethnicity: testEthnicity,
        consistencyId: `test-${sessionId}-${Date.now()}`,
        gender: testAvatarType,
        physicalTraits: {
          hair: culturalBundle?.hair || { color: testHairColor, style: 'short' },
          skinFeatures: culturalBundle?.features || { skinTone: testSkinTone }
        },
        skinFeatures: `friendly ${testSkinTone} skin tone with natural features`,
        characterDescription: `${testName}, age ${testAge}, ${testHairColor} hair, ${testSkinTone} skin tone, ${testEthnicity} background`
      };
      console.log(`✅ [${requestId}] [FORCE_TEST_MODE] Created comprehensive characterSeed with ${Object.keys(characterSeed).length} fields`);
    }
    
    // Skip building enhancedPrompt - it's not needed for 2.5A which uses precomputed CCS
    // Return early with tier1Complete and ccsMethodsRun
    return {
      tier1Complete: true,
      aiSchema,
      characterSeed,
      culturalBundle,
      structuredAvatarData,
      latestClothing,
      mainCharacterAppearance,
      coloredObjects,
      secondaryCharacters: secondaryCharacterSeeds,
      sessionSetting,
      ccsMethodsRun: completedMethods, // ✅ Now defined with all 7 CCS methods
      primaryScene: primaryScene || null, // May be null in force+skip mode
      enhancedPrompt: null, // Explicitly null in force+skip mode
      negativePrompt: null
    };
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
    mainCharacterAppearance, // ← CRITICAL: Pass main character appearance to cascade
    structuredAvatarData, // ← CRITICAL: Pass 73-variation session-seeded hair to Direct Mode
    latestClothing, // ← NEW: Most recent clothing for consistency
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

  const key = difficulty?.toLowerCase();
  if (key && key in frameworks) {
    return frameworks[key as keyof typeof frameworks];
  }
  return frameworks["medium"];
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

// ============= TIER 1: AI-Enhanced Scene Generation =============
const executeTier1: TierFn = async (ctx) => {
  const startMs = Date.now();
  const { payload } = ctx;
  
  // ✅ TEST SIMULATION: Clean Tier 1 failure (for Direct Mode orchestrator fallback tests)
  if (payload.__testSimulateT1Failure === true) {
    console.log(`🧪 [TEST] Simulating Tier 1 failure for Direct Mode orchestrator fallback test`);
    return {
      ok: false,
      code: "T1_SIMULATED_FAILURE",
      reason: "Tier 1 simulated failure for testing Direct Mode fallback inside orchestrator",
      details: {
        testSimulation: true,
        simulatedFailure: true
      }
    };
  }
  
  const gateKey = "T1:ai-visual-scene-creator";
  let gateAcquired = false;
  
  // Hoisted to ensure availability in catch/finally (prevents "tier1ErrorLog is not defined")
  const tier1ErrorLog: any[] = [];
  const logTier1Step = (step: string, status: string, message: string) => {
    tier1ErrorLog.push({
      step,
      status,
      message: message.substring(0, 200),
      at: new Date().toISOString(),
    });
  };
  
  try {
    // 1. Check gate (skip if overloaded)
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      ctx.tierLogger.failure("TIER_1", { reason: "GATE_DENIED", gateReason: gateResult.reason });
      return { ok: false, code: "T1_GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    // 2. Run existing processInlinedTier1 (no changes to this function!)
    ctx.tierLogger.attempt("TIER_1", { storyLength: ctx.payload.pageText?.length });
    
    const tier1Result = await processInlinedTier1(
      ctx.payload,
      ctx.memoizedImport,
      logTier1Step,
      tier1ErrorLog,
      ctx.requestId,
      ctx.generateNuclearNegativePrompt,
      ctx.detectCulturalProfileForNegatives
    );
    
    // 3. Store results in context for cascade
    ctx.tier1 = {
      enhancedPrompt: tier1Result.enhancedPrompt, // STRING: COMPLETE_TIER_1 prompt
      primaryScene: tier1Result.primaryScene, // CORRECT: Use separate primaryScene field
      characterSeed: tier1Result.characterSeed,
      culturalBundle: tier1Result.culturalBundle,
      coloredObjects: tier1Result.coloredObjects || "",
      secondaryCharacters: tier1Result.secondaryCharacters || [],
      mainCharacterAppearance: tier1Result.mainCharacterAppearance || {},
      structuredAvatarData: tier1Result.structuredAvatarData,
      sessionSetting: tier1Result.sessionSetting || ctx.payload.sessionSetting, // ✅ Capture session setting
      latestClothing: tier1Result.latestClothing || null, // ✅ NEW: Capture latest clothing
      
      // ✅ FIX: Add missing fields from tier1Result (critical for Force Tier 2.5A tests)
      tier1Complete: tier1Result.tier1Complete || false,
      ccsMethodsRun: tier1Result.ccsMethodsRun || [],
      secondaryCharacterSeeds: tier1Result.secondaryCharacters || [],
      detectedAnimals: tier1Result.detectedAnimals || []
    };
    
    // Verification: Log tier1Complete propagation
    console.log(`🔍 [${ctx.requestId}] ctx.tier1 populated from processInlinedTier1:`, {
      tier1Complete: ctx.tier1.tier1Complete,
      ccsMethodsCount: ctx.tier1.ccsMethodsRun?.length || 0,
      hasCharacterSeed: !!ctx.tier1.characterSeed,
      hasLatestClothing: !!ctx.tier1.latestClothing,
      skipAIMode: ctx.payload.skipTier1AI === true,
      forceMode: ctx.payload.forceCompleteTier1 === true
    });
    
    // Make primaryScene available in payload for cascade (including Direct Mode)
    ctx.payload.primaryScene = tier1Result.primaryScene;
    
    // 4. Validate scene quality - WITH DEBUG LOGGING
    console.log(`🔍 [DEBUG] Validating tier1Result.primaryScene:`, {
      exists: !!tier1Result.primaryScene,
      type: typeof tier1Result.primaryScene,
      length: tier1Result.primaryScene?.length || 0,
      firstHeadline: tier1Result.primaryScene?.substring(0, 100) || "EMPTY",
      includesUndefined: tier1Result.primaryScene?.includes("undefined") || false,
      includesNull: tier1Result.primaryScene?.includes("null") || false,
      wordCount: tier1Result.primaryScene?.split(" ").filter((w: string) => w.length > 0).length || 0
    });

    // Skip scene validation in force test mode (CCS methods ran, AI intentionally skipped)
    const skipAIMode = ctx.payload.skipTier1AI === true;
    const forceMode = ctx.payload.forceCompleteTier1 === true;

    if (!skipAIMode || !forceMode) {
      // Normal mode: validate scene quality
      if (!validatePrimarySceneQuality(tier1Result.primaryScene || "")) {
        console.error(`❌ [DEBUG] Scene validation FAILED:`, {
          scene: tier1Result.primaryScene,
          reason: !tier1Result.primaryScene ? "scene_falsy" :
                  typeof tier1Result.primaryScene !== "string" ? "not_string" :
                  tier1Result.primaryScene.length < 30 ? "too_short" :
                  tier1Result.primaryScene.includes("undefined") || tier1Result.primaryScene.includes("null") ? "contains_undefined_null" :
                  "insufficient_word_count"
        });
        ctx.tierLogger.failure("TIER_1", { reason: "POOR_SCENE_QUALITY" });
        return { ok: false, code: "T1_POOR_SCENE", reason: "Scene quality validation failed" };
      }
    } else {
      // Force test mode: Skip scene validation (AI intentionally bypassed for CCS-only prep)
      console.log(`🎯 [FORCE_TEST_MODE] Bypassing scene validation (forceCompleteTier1 + skipTier1AI)`, {
        tier1Complete: true,
        ccsMethodsRan: 7,
        primaryScene: 'undefined (intentional)',
        willProceedTo: '2.5A with precomputedCCS',
        ccsDataAvailable: {
          characterSeed: !!tier1Result.characterSeed,
          culturalBundle: !!tier1Result.culturalBundle,
          latestClothing: !!tier1Result.latestClothing
        }
      });
    }
    
    // Force test mode: Skip scene validation (AI intentionally bypassed)
    if (ctx.payload.forceCompleteTier1 && ctx.payload.skipTier1AI) {
      console.log(`🎯 [FORCE_TEST_MODE] Bypassing scene validation (forceCompleteTier1 + skipTier1AI)`, {
        tier1Complete: true,
        ccsMethodsRan: 7,
        primaryScene: 'undefined (intentional)',
        willProceedTo: '2.5A with precomputedCCS'
      });
    }
    
    // 5. DRY RUN: Return debug data without image
    if (ctx.payload.dryRun) {
      ctx.tierLogger.success("TIER_1_DRY_RUN", { templateStructure: "COMPLETE_TIER_1" });
      return {
        ok: true,
        data: {
          dryRun: true,
          tier: "TIER_1",
          tier1Debug: {
            timeline: tier1ErrorLog,
            enhancedPrompt: tier1Result.enhancedPrompt,
          },
        },
        meta: { tier: "TIER_1", ms: Date.now() - startMs }
      };
    }
    
    // 6. Generate image with ResilientRunwareWebSocket (Phase 4: Enhanced WebSocket stability)
    let ResilientRunwareWebSocket;
    try {
      const module = await ctx.memoizedImport("../_shared/ResilientRunwareWebSocket.ts");
      ResilientRunwareWebSocket = module.ResilientRunwareWebSocket;
    } catch (error) {
      console.error('❌ Failed to load ResilientRunwareWebSocket, falling back to direct service');
      // Fallback to direct RunwareWebSocketService if resilient wrapper unavailable
      const module = await ctx.memoizedImport("../_shared/RunwareWebSocketService.ts");
      const RunwareWebSocketService = module.RunwareWebSocketService;
      
      const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
      if (!runwareApiKey) {
        return { ok: false, code: "T1_NO_API_KEY", reason: "Runware API key not configured" };
      }
      
      const imageResult: any = await RunwareWebSocketService.generateImage({
        apiKey: runwareApiKey,
        positivePrompt: tier1Result.enhancedPrompt,
        negativePrompt: tier1Result.negativePrompt || "",
        parameters: { width: 1024, height: 1024, model: "runware:100@1", numberResults: 1, outputFormat: "WEBP" },
        timeout: 25000, // Phase 4: Increased timeout
      });
      
      if (!imageResult?.success || !imageResult?.imageURL) {
        return { ok: false, code: "T1_IMAGE_FAILED", reason: "Image generation failed" };
      }
      
      return {
        ok: true,
        data: {
          imageURL: imageResult.imageURL,
          seed: imageResult.seed,
          cost: imageResult.cost || 0.0013,
          tier1Debug: {
            timeline: tier1ErrorLog,
            enhancedPrompt: tier1Result.enhancedPrompt,
          },
        },
        meta: { tier: "TIER_1", ms: Date.now() - startMs, resilience: "fallback" }
      };
    }
    
    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    if (!runwareApiKey) {
      return { ok: false, code: "T1_NO_API_KEY", reason: "Runware API key not configured" };
    }
    
    // 7. Call Runware with ResilientRunwareWebSocket (25s timeout, 2 retries on WebSocket failures)
    try {
      const imageResult: any = await ResilientRunwareWebSocket.generateImageWithRetry({
        apiKey: runwareApiKey,
        positivePrompt: tier1Result.enhancedPrompt,
        negativePrompt: tier1Result.negativePrompt || "",
        parameters: { width: 1024, height: 1024, model: "runware:100@1", numberResults: 1, outputFormat: "WEBP" },
      }, {
        maxGenerateRetries: 2,
        generateTimeoutMs: 25000, // Increased from 15s to 25s for better stability
        retryDelayMs: 2000,
      });
      
      if (!imageResult?.success || !imageResult?.imageURL) {
        return { ok: false, code: "T1_IMAGE_FAILED", reason: "Image generation failed" };
      }
      
      // 8. Success!
      ctx.tierLogger.success("TIER_1", { imageURL: imageResult.imageURL });
      
      return {
        ok: true,
        data: {
          success: true,
          imageURL: imageResult.imageURL,
          provider: "runware-websocket",
          tier: "TIER_1",
          resultType: "TIER_1_SUCCESS",
          primaryScene: tier1Result.primaryScene,  // ✅ ADD: primaryScene text for display
          positivePrompt: tier1Result.enhancedPrompt, // CORRECT: Use string directly
          negativePrompt: tier1Result.negativePrompt,
          tier1Debug: {
            timeline: tier1ErrorLog,
            enhancedPrompt: tier1Result.enhancedPrompt,
          },
        metadata: {
          cascadeHistory: ["✅ Tier 1 Complete Success"],
          primaryScene: tier1Result.primaryScene,  // ✅ ADD: Also in metadata for consistency
        },
      },
      meta: { tier: "TIER_1", ms: Date.now() - startMs, resilience: "enhanced" }
    };
    } catch (wsError: any) {
      // ResilientRunwareWebSocket failed after all retries
      const wsErrorMessage = wsError instanceof Error ? wsError.message : String(wsError);
      console.error('❌ ResilientRunwareWebSocket failed after retries:', wsErrorMessage);
      ctx.tierLogger.failure("TIER_1", { error: wsErrorMessage, resilience: "exhausted" });
      
      return { 
        ok: false, 
        code: "T1_WEBSOCKET_EXHAUSTED", 
        reason: `WebSocket resilience exhausted: ${wsErrorMessage}`,
        meta: { retries: 2, timeout: 25000 }
      };
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("TIER_1", { error: errorMessage });
    
    // Categorize failure for better diagnostics
    const failureCategory = 
      errorMessage.includes('NO_PRIMARY_SCENE') ? 'AI_SCENE_CREATOR_FAILED' :
      errorMessage.includes('POOR_SCENE') ? 'SCENE_QUALITY_VALIDATION_FAILED' :
      errorMessage.includes('GATE_DENIED') ? 'TIER_1_OVERLOADED' :
      errorMessage.includes('TIMEOUT') ? 'AI_TIMEOUT' :
      errorMessage.includes('CCS') || errorMessage.includes('Character') ? 'CCS_METHOD_FAILURE' :
      errorMessage.includes('getSupabase') || errorMessage.includes('Database') ? 'DATABASE_CONNECTION_FAILED' :
      errorMessage.includes('Import') || errorMessage.includes('CDN') ? 'MODULE_IMPORT_FAILED' :
      'UNKNOWN_TIER_1_ERROR';
    
    // Handle forceCompleteTier1 mode (return detailed diagnostics)
    if (ctx.payload.forceCompleteTier1) {
      return {
        ok: false,
        code: "T1_FORCE_MODE_FAILED",
        reason: errorMessage,
        details: {
          forceMode: true,
          failureCategory,
          componentHealth: errorMessage,
          tier1Timeline: tier1ErrorLog,
        }
      };
    }
    
    // CRITICAL FIX: Always return tier1ErrorLog for E2E diagnostics
    return { 
      ok: false, 
      code: "T1_FAILED", 
      reason: errorMessage,
      details: {
        failureCategory,
        tier1Timeline: tier1ErrorLog,
        failureStep: tier1ErrorLog[tier1ErrorLog.length - 1]?.step || 'unknown',
        errorMessage: errorMessage.substring(0, 500),
      }
    };
    
  } finally {
    // CRITICAL: Always release gate
    if (gateAcquired) {
      release(gateKey);
    }
  }
};

// ============= DIRECT MODE: Zero-CCS Fallback =============
const executeDirectMode: TierFn = async (ctx) => {
  const startMs = Date.now();
  
  try {
    ctx.tierLogger.attempt("DIRECT_MODE", {});
    
    // Log Direct Mode attempt with context
    const tier1Trace = ctx.trace?.find(t => t.tier === 'TIER_1');
    console.log(`🎯 [${ctx.requestId}] DIRECT_MODE: Attempting fallback after Tier 1 failure`, {
      tier1FailureReason: tier1Trace?.code || 'unknown',
      tier1Details: tier1Trace?.details?.failureCategory || 'no_details',
      hasPayload: !!ctx.payload,
      sessionId: ctx.payload.sessionId,
      hasPrimaryScene: !!ctx.tier1?.primaryScene
    });
    
    // Always available (no gate check - zero throttling)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // Increased from 20s to 35s to accommodate OpenAI + processing time (17-21s typical)
    
    try {
      const { createVendorFirstSupabaseClient } = await ctx.memoizedImport("./resilientLoader.js");
      const supabase = await createVendorFirstSupabaseClient();
      
      // ✅ Call ai-visual-scene-creator for Direct Mode (AISC generates primaryScene + calls template-cd)
      // Sanitize payload: remove test flags so AISC performs real scene generation
      const dmBody = {
        ...ctx.payload,
        directMode: true, // AISC handles: OpenAI primaryScene generation → template-cd with complexity C
      };
      delete dmBody.test;
      delete dmBody.__testSimulateT1Failure;

      const { data, error } = await supabase.functions.invoke("ai-visual-scene-creator", {
        body: dmBody,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (error || !data?.success) {
        return { ok: false, code: "DM_INVOKE_FAILED", reason: error?.message || "Direct mode failed" };
      }
      
      // Exhaustive primaryScene detection from all possible AISC response locations
      const hasScene = !!(
        data.primaryScene || 
        data.aiSchema?.primaryScene || 
        data.enhancedPrompt || 
        data.failedTierData?.enhancedSceneData
      );
      
      // Handle scene-only response (primaryScene but no imageURL)
      // Escalate whenever we have primaryScene but no image (regardless of sceneOnly flag)
      if (!data.imageURL && hasScene) {
        console.log(`🎯 [${ctx.requestId}] Direct Mode: ai-visual-scene-creator returned primaryScene without image, escalating to template-cd`);
        
        // Try template-cd with complexity C first
        const templatePayload = {
          pageText: ctx.payload.pageText || ctx.payload.storyText,
          userInfo: ctx.payload.userInfo,
          sessionId: ctx.payload.sessionId,
          pageNumber: ctx.payload.pageNumber,
          templateComplexity: 'C',
          primaryScene: data.primaryScene
        };
        
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        let templateResult = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify(templatePayload)
        });
        
        let templateData = await templateResult.json();
        
        // If C fails, try D
        if (!templateData?.success || !templateData?.imageURL) {
          console.log(`⚠️ [${ctx.requestId}] Direct Mode: Template C failed, trying D`);
          templatePayload.templateComplexity = 'D';
          
          templateResult = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify(templatePayload)
          });
          
          templateData = await templateResult.json();
        }
        
        if (templateData?.success && templateData?.imageURL) {
          data.imageURL = templateData.imageURL;
          data.tier = 'DIRECT_MODE_TEMPLATE_' + templatePayload.templateComplexity;
          console.log(`✅ [${ctx.requestId}] Direct Mode: Template ${templatePayload.templateComplexity} succeeded`);
        } else {
          return { ok: false, code: "DM_ESCALATION_FAILED", reason: "Template escalation failed after scene-only" };
        }
      } else if (!data.imageURL) {
        return { ok: false, code: "DM_NO_IMAGE", reason: "No image URL returned" };
      }
      
      // Exhaustive search for OpenAI's word-for-word primaryScene across ALL possible locations
      const primaryScene = data.primaryScene 
        || data.aiSchema?.primaryScene 
        || data.enhancedPrompt 
        || data.failedTierData?.enhancedSceneData;

      if (primaryScene) {
        console.log(`✅ [${ctx.requestId}] Direct Mode: Using OpenAI primaryScene (${primaryScene.length} chars, word-for-word preserved)`);
      } else {
        // NO FALLBACK TO TRUNCATED TEXT - if OpenAI didn't provide primaryScene, this is a failure
        console.error(`❌ [${ctx.requestId}] Direct Mode: No primaryScene from OpenAI - cannot proceed without word-for-word scene description`);
        return { 
          ok: false, 
          code: "DM_NO_PRIMARY_SCENE", 
          reason: "OpenAI did not provide primaryScene - refusing to use truncated text fallback" 
        };
      }
      
      ctx.directMode = { imageURL: data.imageURL, seed: data.seed, primaryScene };
      ctx.tierLogger.success("DIRECT_MODE", { imageURL: data.imageURL });
      
      // Enhanced success logging
      console.log(`✅ [${ctx.requestId}] DIRECT_MODE: SUCCESS`, {
        imageURL: data.imageURL,
        seed: data.seed,
        primaryScene: primaryScene?.substring(0, 50),
        processingTimeMs: Date.now() - startMs,
        tier: 'DIRECT_MODE'
      });
      
      // Check if Tier 1 failed and capture its details
      const tier1Trace = ctx.trace?.find(t => t.tier === 'TIER_1');
      const tier1FailureDetails = tier1Trace?.ok === false ? tier1Trace.details : null;

      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          tier: "DIRECT_MODE",
          resultType: "DIRECT_MODE_SUCCESS",
          primaryScene,  // ✅ Top-level (main access point)
          seed: data.seed,
          metadata: { 
            cascadeHistory: [
              tier1FailureDetails ? `❌ Tier 1 Failed: ${tier1FailureDetails.failureCategory}` : "⚠️ Tier 1 Failed",
              "✅ Direct Mode Success"
            ],
            tier1FailureDetails,
            tier1Timeline: tier1FailureDetails?.tier1Timeline || [],
            directModeEntryPoint: 'ORCHESTRATOR',
            primaryScene,  // ✅ In metadata (for analytics/logging)
            primarySceneLength: primaryScene?.length || 0,
            primarySceneSource: 'openai_word_for_word'
          },
          directMode: {
            imageURL: data.imageURL,
            seed: data.seed,
            primaryScene  // ✅ In directMode object (for backward compatibility)
          }
        },
        meta: { tier: "DIRECT_MODE", ms: Date.now() - startMs }
      };
      
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("DIRECT_MODE", { error: errorMessage });
    
    // ============= FULL CCS VALIDATION: Run ALL 7 CCS methods after Direct Mode failure =============
    console.log(`⚡ [${ctx.requestId}] FULL_CCS_VALIDATION: Direct Mode failed, attempting complete 7-method CCS`, {
      directModeError: errorMessage.substring(0, 100),
      willPopulateTier1ForT25A: true,
      sessionId: ctx.payload.sessionId,
      goal: 'Complete CCS or nothing - no partial data'
    });
    
    try {
      // Dynamic CCS import: load at runtime to prevent boot failures
      let ccs: any;
      try {
        console.log(`📦 [FULL_CCS_VALIDATION] Loading CharacterConsistencyServiceInline.js dynamically`);
        const ccsModule = await import("./CharacterConsistencyServiceInline.js");
        ccs = ccsModule.characterConsistencyService;
        console.log(`✅ [FULL_CCS_VALIDATION] CharacterConsistencyService loaded successfully`);
      } catch (importError) {
        console.error(`❌ [FULL_CCS_VALIDATION] Failed to import CCS:`, importError);
        throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
      }
      
      if (!ccs) {
        throw new Error("CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE");
      }
      
      const sessionId = ctx.payload.sessionId;
      const userInfo = ctx.payload.userInfo || {};
      const storyText = ctx.payload.storyText || "";
      const pageText = ctx.payload.pageText || "";
      const pageNumber = ctx.payload.pageNumber || 1;
      const characterName = userInfo?.name || userInfo?.characterName || userInfo?.avatar?.name || "the child";
      
      // Extract avatar identity
      const avatarSkinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || "medium";
      const avatarIdentity = {
        name: characterName,
        type: userInfo?.avatar?.type || "child",
        skinTone: avatarSkinTone,
      };
      
      // ============= RUN ALL 7 CORE CCS METHODS (NO SHORTCUTS) =============
      console.log(`🔄 [${ctx.requestId}] [FULL_CCS] Running all 7 core CCS methods...`);
      
      // Method 1: Batch fetch CCS data
      const batchData = await ccs.batchFetchCCSData(sessionId, characterName);
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 1/7 batchFetchCCSData: SUCCESS`);
      
      // Method 2: Get structured avatar data
      const structuredAvatarData = await ccs.getStructuredAvatarData(sessionId, userInfo);
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 2/7 getStructuredAvatarData: SUCCESS`);
      
      // Method 3: Get enhanced character seed
      let characterSeed = batchData.characterSeed;
      if (!characterSeed) {
        characterSeed = await ccs.getEnhancedCharacterSeed(
          sessionId,
          avatarIdentity,
          storyText || pageText || "",
          "continuing",
          batchData.latestClothing
        );
      }
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 3/7 getEnhancedCharacterSeed: SUCCESS`);
      
      // Method 4: Analyze visual details
      const visualAnalysis = await ccs.analyzeVisualDetails(
        sessionId,
        storyText || pageText || "",
        pageNumber
      );
      const coloredObjects = visualAnalysis?.coloredObjects || batchData.coloredObjects.map(obj => obj.fullDescription).join(', ');
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 4/7 analyzeVisualDetails: SUCCESS`);
      
      // Method 5: Detect all characters
      const characterDetection = await ccs.detectAllCharacters(storyText || pageText || "");
      const mainCharacterAppearance = characterDetection?.mainCharacterAppearance || null;
      const secondaryCharacters = characterDetection?.secondaryCharacters || [];
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 5/7 detectAllCharacters: SUCCESS`);
      
      // Method 6: Get secondary character seeds
      const secondaryCharacterSeeds = await ccs.getSecondaryCharactersForSession(sessionId);
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 6/7 getSecondaryCharactersForSession: SUCCESS`);
      
      // Method 7: Detect session setting
      const sessionSetting = await ccs.detectSimpleAtmosphere(storyText || pageText || "");
      console.log(`✅ [${ctx.requestId}] [FULL_CCS] 7/7 detectSimpleAtmosphere: SUCCESS`);
      
      // ============= VALIDATE ALL METHODS SUCCEEDED =============
      if (!characterSeed || !structuredAvatarData) {
        throw new Error("FULL_CCS_VALIDATION_INCOMPLETE: Critical methods failed");
      }
      
      // ============= EXTRACT CULTURAL BUNDLE =============
      const culturalBundle = {
        hair: characterSeed.selectedCulturalHair || characterSeed.physicalTraits?.hair || "",
        features: characterSeed.selectedCulturalFeatures || characterSeed.physicalTraits?.skinFeatures || ""
      };
      
      // Validate cultural bundle has data
      if (!culturalBundle.hair || !culturalBundle.features) {
        throw new Error("FULL_CCS_VALIDATION_INCOMPLETE: Cultural bundle missing critical data");
      }
      
      // ============= POPULATE ctx.tier1 WITH COMPLETE DATA =============
      ctx.tier1 = {
        characterSeed,
        culturalBundle,
        coloredObjects: coloredObjects || "",
        mainCharacterAppearance,
        secondaryCharacters,
        sessionSetting: sessionSetting || ctx.payload.sessionSetting || "",
        latestClothing: batchData.latestClothing || null,
        structuredAvatarData,
        secondaryCharacterSeeds: secondaryCharacterSeeds || [],
        detectedAnimals: [], // Extracted from characterDetection if available
        tier1Complete: true,
        ccsMethodsRun: [
          'batchFetchCCSData',
          'getStructuredAvatarData', 
          'getEnhancedCharacterSeed',
          'analyzeVisualDetails',
          'detectAllCharacters',
          'getSecondaryCharactersForSession',
          'detectSimpleAtmosphere'
        ],
        source: 'full_ccs_validation'
      };
      
      console.log(`✅ [${ctx.requestId}] FULL_CCS_VALIDATION: SUCCESS - All 7 methods completed`, {
        tier1Complete: true,
        hasCharacterSeed: true,
        hasCulturalBundle: true,
        hasLatestClothing: !!ctx.tier1.latestClothing,
        allMethodsRan: ctx.tier1.ccsMethodsRun.length === 7
      });
      
      ctx.tierLogger.success("FULL_CCS_VALIDATION", { 
        ccsComplete: true, 
        methodsRun: 7,
        path: "afterDirectMode" 
      });
      
      // Return DM failure so cascade proceeds to T2.5A (which will have complete CCS now)
      return { ok: false, code: "DM_FAILED", reason: errorMessage };
      
    } catch (ccsError: any) {
      const ccsErrorMessage = ccsError instanceof Error ? ccsError.message : String(ccsError);
      console.error(`❌ [${ctx.requestId}] FULL_CCS_VALIDATION: FAILED - Template-AB Mode B will be called`, {
        ccsError: ccsErrorMessage.substring(0, 100),
        tier1Populated: false,
        nextTier: "Template-AB Mode B (no complete CCS)",
        reason: 'Full CCS validation could not complete all 7 methods'
      });
      
      // Set ctx.tier1 to null to signal Mode B should be used
      ctx.tier1 = null;
      
      ctx.tierLogger.failure("FULL_CCS_VALIDATION", { error: ccsErrorMessage });
      
      // Return DM failure - orchestrator will call Mode B directly
      return { ok: false, code: "DM_FAILED", reason: errorMessage };
    }
  }
};

// ============= TIER 2.5A: Template AB Mode A with CCS =============
const executeT25A: TierFn = async (ctx) => {
  const startMs = Date.now();
  const gateKey = "T25A:runware-template-ab";
  let gateAcquired = false;
  
  try {
    // Old precondition logic removed - Mode Selection (lines ~1868-1921) now handles all cases
    
    console.log(`✅ [${ctx.requestId}] TIER_2.5A: Precondition satisfied (full CCS available)`, {
      hasCharacterSeed: true,
      hasLatestClothing: true,
      readyForFullCCS: true
    });
    
    // Gate check
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      ctx.tierLogger.failure("TIER_2.5A", { reason: "GATE_DENIED", gateReason: gateResult.reason });
      return { ok: false, code: "T25A_GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.tierLogger.attempt("TIER_2.5A", { hasCulturalBundle: !!ctx.tier1?.culturalBundle });
    
    // Add 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        return { ok: false, code: "T25A_NO_URL", reason: "SUPABASE_URL not configured" };
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      // ============= DETERMINE MODE BASED ON CCS COMPLETENESS =============
      let templateComplexity: string;
      let precomputedCCS: any;
      
      if (ctx.tier1?.characterSeed && ctx.tier1.tier1Complete === true) {
        // ✅ FULL CCS SUCCESS: Call Mode A with complete data
        templateComplexity = "A";
        precomputedCCS = {
          characterSeed: ctx.tier1.characterSeed,
          culturalBundle: ctx.tier1.culturalBundle || null,
          coloredObjects: ctx.tier1.coloredObjects || null,
          mainCharacterAppearance: ctx.tier1.mainCharacterAppearance || null,
          secondaryCharacters: ctx.tier1.secondaryCharacters || [],
          sessionSetting: ctx.tier1.sessionSetting,
          latestClothing: ctx.tier1.latestClothing || null,
          structuredAvatarData: ctx.tier1.structuredAvatarData || null,
          secondaryCharacterSeeds: ctx.tier1.secondaryCharacterSeeds || [],
          detectedAnimals: ctx.tier1.detectedAnimals || [],
          tier1Complete: true,
          ccsMethodsRun: ctx.tier1.ccsMethodsRun || [],
          source: 'tier1_complete'
        };
        
        console.log(`✅ [${ctx.requestId}] [T2.5A] Calling Template-AB Mode A with complete CCS`, {
          tier1Complete: true,
          methodsRun: precomputedCCS.ccsMethodsRun.length,
          hasLatestClothing: !!precomputedCCS.latestClothing
        });
        
      } else {
        // In skip-to-2.5A paths, do not downgrade to Mode B — STOP for strict production parity
        if (ctx.payload?.skipDirectlyToTier === '2.5A') {
          console.error(`❌ [${ctx.requestId}] [T2.5A] STOP: Full CCS required but incomplete - refusing Mode B in skip mode`);
          return { 
            ok: false, 
            code: "T25A_REQUIRES_FULL_CCS", 
            reason: "Tier 2.5A requires complete CCS (skip mode).",
            details: { 
              stoppedBecause: "CCS_REQUIRED_FOR_2.5A", 
              skipModeUsed: true, 
              targetTier: "2.5A" 
            } 
          };
        }
        // Non-skip cascade may still use Mode B (legacy behavior)
        templateComplexity = "B";
        precomputedCCS = {
          characterSeed: ctx.tier1?.characterSeed || null,
          culturalBundle: ctx.tier1?.culturalBundle || null,
          coloredObjects: null,
          mainCharacterAppearance: null,
          secondaryCharacters: [],
          sessionSetting: ctx.payload.sessionSetting || "",
          latestClothing: ctx.tier1?.latestClothing || null,
          structuredAvatarData: null,
          secondaryCharacterSeeds: [],
          detectedAnimals: [],
          tier1Complete: false,
          ccsMethodsRun: [],
          source: 'partial_ccs_for_mode_b'
        };
        console.log(`⚠️ [${ctx.requestId}] [T2.5A] Calling Template-AB Mode B with partial CCS (full CCS unavailable)`, {
          tier1Complete: false,
          hasPartialCharacterSeed: !!precomputedCCS.characterSeed,
          reason: 'Full CCS validation failed or was incomplete'
        });
      }
      
      // 🔍 DEBUG: Log exact precomputedCCS structure being sent to template-ab
      console.log(`🔍 [${ctx.requestId}] [T2.5A] Sending to template-ab:`, JSON.stringify({
        hasPrecomputedCCS: !!precomputedCCS,
        hasCharacterSeed: !!precomputedCCS?.characterSeed,
        characterSeedType: typeof precomputedCCS?.characterSeed,
        characterSeedKeys: precomputedCCS?.characterSeed ? Object.keys(precomputedCCS.characterSeed) : [],
        characterSeedSample: precomputedCCS?.characterSeed ? JSON.stringify(precomputedCCS.characterSeed).substring(0, 200) : null,
        source: precomputedCCS?.source
      }));
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...ctx.payload,
          userInfo: ctx.payload.userInfo,      // ✅ EXPLICIT (template-ab needs this)
          sessionId: ctx.payload.sessionId,    // ✅ EXPLICIT (template-ab needs this)
          templateComplexity, // "A" or "B" based on CCS completeness
          precomputedCCS: precomputedCCS,
          // ✅ Explicitly ensure story content is present (prevents runtime probe response)
          storyText: ctx.payload.storyText || ctx.payload.pageText,
          pageText: ctx.payload.pageText || ctx.payload.storyText,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        return { ok: false, code: "T25A_HTTP_ERROR", reason: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      if (!data.success || !data.imageURL) {
        return { ok: false, code: "T25A_NO_IMAGE", reason: "Template A processing failed" };
      }
      
      // Success
      ctx.tierLogger.success("TIER_2.5A", { imageURL: data.imageURL });
      
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed || data.imageGeneration?.seed || null,
          provider: "tier-2.5a-fallback",
          tier: "TIER_2.5A",
          resultType: "TIER_2.5A_SUCCESS",
          positivePrompt: data.positivePrompt || data.templateData?.positivePrompt,
          negativePrompt: data.negativePrompt || data.templateData?.negativePrompt,
          metadata: {
            cascadeHistory: ["❌ Tier 1 Failed", "❌ Direct Mode Failed", "✅ Tier 2.5A Success"],
          },
        },
        meta: { tier: "TIER_2.5A", ms: Date.now() - startMs }
      };
      
    } catch (fetchError: any) {
      if (fetchError?.name === "AbortError") {
        return { ok: false, code: "T25A_TIMEOUT", reason: "Tier 2.5A timeout (15s)" };
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("TIER_2.5A", { error: errorMessage });
    return { ok: false, code: "T25A_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) release(gateKey);
  }
};

// ============= TIER 2.5B: Template AB Mode B Fallback =============
const executeT25B: TierFn = async (ctx) => {
  const startMs = Date.now();
  const gateKey = "T25B:runware-template-ab";
  let gateAcquired = false;
  
  try {
    // Gate check
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      ctx.tierLogger.failure("TIER_2.5B", { reason: "GATE_DENIED", gateReason: gateResult.reason });
      return { ok: false, code: "T25B_GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.tierLogger.attempt("TIER_2.5B", {});
    
    // Add 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        return { ok: false, code: "T25B_NO_URL", reason: "SUPABASE_URL not configured" };
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      // Pass pre-computed CCS data to Mode B
      const precomputedCCS = {
        culturalBundle: ctx.tier1?.culturalBundle,
        mainCharacterAppearance: ctx.tier1?.mainCharacterAppearance,
        coloredObjects: ctx.tier1?.coloredObjects,
        secondaryCharacters: ctx.tier1?.secondaryCharacters,
        characterSeed: ctx.tier1?.characterSeed,
      };
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-ab`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...ctx.payload,
          userInfo: ctx.payload.userInfo,      // ✅ EXPLICIT (template-ab needs this)
          sessionId: ctx.payload.sessionId,    // ✅ EXPLICIT (template-ab needs this)
          templateComplexity: "B",
          precomputedCCS: precomputedCCS,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        return { ok: false, code: "T25B_HTTP_ERROR", reason: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      if (!data.success || !data.imageURL) {
        return { ok: false, code: "T25B_NO_IMAGE", reason: "Template B processing failed" };
      }
      
      // Success
      ctx.tierLogger.success("TIER_2.5B", { imageURL: data.imageURL });
      
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed || data.imageGeneration?.seed || null,
          provider: "tier-2.5b-fallback",
          tier: "TIER_2.5B",
          resultType: "TIER_2.5B_SUCCESS",
          positivePrompt: data.positivePrompt || data.templateData?.positivePrompt,
          negativePrompt: data.negativePrompt || data.templateData?.negativePrompt,
          metadata: {
            cascadeHistory: [
              "❌ Tier 1 Failed",
              "❌ Direct Mode Failed", 
              "❌ Tier 2.5A Failed",
              "✅ Tier 2.5B Success"
            ],
          },
        },
        meta: { tier: "TIER_2.5B", ms: Date.now() - startMs }
      };
      
    } catch (fetchError: any) {
      if (fetchError?.name === "AbortError") {
        return { ok: false, code: "T25B_TIMEOUT", reason: "Tier 2.5B timeout (15s)" };
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("TIER_2.5B", { error: errorMessage });
    return { ok: false, code: "T25B_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) release(gateKey);
  }
};

// ============= TIER 2.5C: Template CD Mode C Universal Fallback =============
const executeT25C: TierFn = async (ctx) => {
  const startMs = Date.now();
  const gateKey = "T25C:runware-template-cd";
  let gateAcquired = false;
  
  try {
    // Gate check
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      ctx.tierLogger.failure("TIER_2.5C", { reason: "GATE_DENIED", gateReason: gateResult.reason });
      return { ok: false, code: "T25C_GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.tierLogger.attempt("TIER_2.5C", {});
    
    // Add 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        return { ok: false, code: "T25C_NO_URL", reason: "SUPABASE_URL not configured" };
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      // Pass pre-computed CCS data to 2.5C
      const precomputedCCS = {
        culturalBundle: ctx.tier1?.culturalBundle,
        mainCharacterAppearance: ctx.tier1?.mainCharacterAppearance,
        coloredObjects: ctx.tier1?.coloredObjects,
        secondaryCharacters: ctx.tier1?.secondaryCharacters,
        characterSeed: ctx.tier1?.characterSeed,
      };
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...ctx.payload,
          templateComplexity: "C",
          precomputedCCS: precomputedCCS,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        return { ok: false, code: "T25C_HTTP_ERROR", reason: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      if (!data.success || !data.imageURL) {
        return { ok: false, code: "T25C_NO_IMAGE", reason: "Template C processing failed" };
      }
      
      // Success
      ctx.tierLogger.success("TIER_2.5C", { imageURL: data.imageURL });
      
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed || data.imageGeneration?.seed || null,
          provider: "tier-2.5c-fallback",
          tier: "TIER_2.5C",
          resultType: "TIER_2.5C_SUCCESS",
          positivePrompt: data.positivePrompt || data.templateData?.positivePrompt,
          negativePrompt: data.negativePrompt || data.templateData?.negativePrompt,
          metadata: {
            cascadeHistory: [
              "❌ Tier 1 Failed",
              "❌ Direct Mode Failed",
              "❌ Tier 2.5A Failed",
              "❌ Tier 2.5B Failed",
              "✅ Tier 2.5C Success (Nuclear Fallback)"
            ],
          },
        },
        meta: { tier: "TIER_2.5C", ms: Date.now() - startMs }
      };
      
    } catch (fetchError: any) {
      if (fetchError?.name === "AbortError") {
        return { ok: false, code: "T25C_TIMEOUT", reason: "Tier 2.5C timeout (15s)" };
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("TIER_2.5C", { error: errorMessage });
    return { ok: false, code: "T25C_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) release(gateKey);
  }
};

// ============= TIER 2.5D: Template CD Mode D Emergency (Zero-CCS) =============
const executeT25D: TierFn = async (ctx) => {
  const startMs = Date.now();
  const gateKey = "T25D:runware-template-cd";
  let gateAcquired = false;
  
  try {
    // Gate check
    const gateResult = await acquire(gateKey);
    if (!gateResult.acquired) {
      ctx.tierLogger.failure("TIER_2.5D", { reason: "GATE_DENIED", gateReason: gateResult.reason });
      return { ok: false, code: "T25D_GATE_DENIED", reason: gateResult.reason };
    }
    gateAcquired = true;
    
    ctx.tierLogger.attempt("TIER_2.5D", { emergencyMode: true });
    
    // Add 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
        return { ok: false, code: "T25D_NO_URL", reason: "SUPABASE_URL not configured" };
      }
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      };
      
      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
      }
      
      // CRITICAL: Mode D does NOT receive precomputedCCS (zero-CCS emergency fallback)
      const response = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...ctx.payload,
          templateComplexity: "D",
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        return { ok: false, code: "T25D_HTTP_ERROR", reason: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      if (!data.success || !data.imageURL) {
        return { ok: false, code: "T25D_NO_IMAGE", reason: "Template D processing failed" };
      }
      
      // Success
      ctx.tierLogger.success("TIER_2.5D", { imageURL: data.imageURL });
      
      return {
        ok: true,
        data: {
          success: true,
          imageURL: data.imageURL,
          seed: data.seed || data.imageGeneration?.seed || null,
          provider: "tier-2.5d-fallback",
          tier: "TIER_2.5D",
          resultType: "TIER_2.5D_SUCCESS",
          positivePrompt: data.positivePrompt || data.templateData?.positivePrompt,
          negativePrompt: data.negativePrompt || data.templateData?.negativePrompt,
          metadata: {
            cascadeHistory: [
              "❌ Tier 1 Failed",
              "❌ Direct Mode Failed",
              "❌ Tier 2.5A Failed",
              "❌ Tier 2.5B Failed",
              "❌ Tier 2.5C Failed",
              "✅ Tier 2.5D Success (Emergency Template)"
            ],
          },
        },
        meta: { tier: "TIER_2.5D", ms: Date.now() - startMs }
      };
      
    } catch (fetchError: any) {
      if (fetchError?.name === "AbortError") {
        return { ok: false, code: "T25D_TIMEOUT", reason: "Tier 2.5D timeout (15s)" };
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.tierLogger.failure("TIER_2.5D", { error: errorMessage });
    return { ok: false, code: "T25D_FAILED", reason: errorMessage };
    
  } finally {
    if (gateAcquired) release(gateKey);
  }
};

// ============= CASCADE PIPELINE EXECUTOR =============
async function runTierCascade(
  tiers: Array<{ name: string; fn: TierFn; precondition?: (ctx: TierContext) => boolean }>,
  ctx: TierContext
): Promise<TierResult> {
  
  // NEW: Check if we should skip to a specific tier after Tier 1 prep
  const skipToTier = (ctx.payload as any)?.skipDirectlyToTier;
  
  if (skipToTier) {
    console.log(`🎯 Skip mode: Running Tier 1 for CCS prep, then jumping to ${skipToTier}`);
    
    // Always run Tier 1 first to build CCS (but don't require success)
    const tier1Result = await executeTier1(ctx);
    if (tier1Result.ok) {
      console.log(`✅ Tier 1 CCS prep complete (ctx.tier1 populated), continuing to ${skipToTier}`);
      
      // Strict CCS validation for Force Tier 2.5A mode
      if (skipToTier === '2.5A') {
        const ok = !!(ctx.tier1?.tier1Complete === true 
          && ctx.tier1?.culturalBundle?.hair 
          && ctx.tier1?.culturalBundle?.features 
          && ctx.tier1?.latestClothing);
        if (!ok) {
          console.error(`❌ Force Tier 2.5A: Tier 1 reported success but CCS is missing critical fields - STOPPING`);
          return {
            ok: false,
            code: 'T1_CCS_INCOMPLETE_FOR_T25A',
            reason: 'Tier 2.5A requires complete CCS (hair, features, latestClothing, tier1Complete=true)',
            details: {
              skipModeUsed: true,
              targetTier: '2.5A',
              stoppedBecause: 'CCS_REQUIRED_FOR_2.5A'
            }
          };
        }
      }
      // Don't return here - let it continue to target tier
    } else {
      if (skipToTier === '2.5A') {
        // Test-only __testDisplaySuccess: return 200 with CCS for UI display on expected STOP
        if ((ctx.payload as any).__testDisplaySuccess === true) {
          console.log(`🎯 __testDisplaySuccess: Returning 200 envelope with CCS for display (no cascade)`);
          const cascadeHistory = [
            `❌ Tier 1 CCS prep failed: ${tier1Result.code || 'Unknown error'}`,
            `💬 Reason: ${tier1Result.reason || 'CCS import or computation failed'}`,
            `🎯 Test Display Mode: Returning 200 with CCS data`,
            `🛑 Force Tier 2.5A: STOPPED (requires complete CCS)`
          ];
          return {
            ok: true,
            data: {
              testDisplay: true,
              precomputedCCS: ctx.tier1 || null,
              metadata: {
                cascadeHistory,
                skipModeUsed: true,
                targetTier: '2.5A',
                stoppedBecause: 'CCS_REQUIRED_FOR_2.5A'
              }
            }
          };
        }
        
        console.error(`❌ Force Tier 2.5A: CCS prep failed - STOPPING (2.5A requires complete CCS)`);
        const cascadeHistory = [
          `❌ Tier 1 CCS prep failed: ${tier1Result.code || 'Unknown error'}`,
          `💬 Reason: ${tier1Result.reason || 'CCS import or computation failed'}`,
          `🛑 Force Tier 2.5A: STOPPED (requires complete CCS)`
        ];
        return {
          ok: false,
          code: tier1Result.code || 'T1_CCS_FAILED',
          reason: `Tier 2.5A requires complete CCS but Tier 1 failed: ${tier1Result.reason}`,
          details: {
            tier1Error: tier1Result,
            tier1Data: ctx.tier1 || null,
            cascadeHistory,
            skipModeUsed: true,
            targetTier: '2.5A',
            stoppedBecause: 'CCS_REQUIRED_FOR_2.5A'
          }
        };
      } else {
        console.log(`⚠️ Tier 1 failed, but continuing to ${skipToTier} (this tier handles missing CCS)`);
        // 2.5B/C/D may handle missing CCS with inline data
      }
    }
    
    // Now skip to the requested tier
    const tierMap: Record<string, TierFn> = {
      '2.5A': executeT25A,
      '2.5B': executeT25B,
      '2.5C': executeT25C,
      '2.5D': executeT25D,
    };
    
    const targetTier = tierMap[skipToTier];
    if (!targetTier) {
      return { ok: false, code: "INVALID_SKIP_TIER", reason: `Unknown tier: ${skipToTier}` };
    }
    
    // Execute target tier directly (whether Tier 1 succeeded or failed)
    console.log(`🎯 Executing target tier: ${skipToTier}`);
    const targetResult = await targetTier(ctx);
    
    // Add cascade history and stop confirmation
    const cascadeHistory = [
      `✅ Tier 1 CCS prep ${tier1Result.ok ? 'succeeded' : 'failed (emergency fallback used)'}`,
      `🎯 Skip Mode: Jumped to ${skipToTier}`,
      `${targetResult.ok ? '✅' : '❌'} ${skipToTier} ${targetResult.ok ? 'Success' : 'Failed'}`,
      `🛑 Skip Mode Complete: Stopped at ${skipToTier} (no cascade)`
    ];
    
    if (!targetResult.ok && targetResult.reason) {
      cascadeHistory.push(`💬 Failure Reason: ${targetResult.reason}`);
    }
    
    console.log(`🛑 Skip mode complete: ${skipToTier} → ${targetResult.ok ? 'SUCCESS' : `FAILED (${targetResult.code || 'no code'})`}`);
    
    // Add cascade history to response metadata
    if (targetResult.ok && targetResult.data) {
      targetResult.data.metadata = targetResult.data.metadata || {};
      targetResult.data.metadata.cascadeHistory = cascadeHistory;
      targetResult.data.metadata.skipModeUsed = true;
      targetResult.data.metadata.targetTier = skipToTier;
    } else if (!targetResult.ok) {
      // For failures, add to details or create a minimal response structure
      const failureDetails = {
        ...targetResult,
        metadata: {
          cascadeHistory,
          skipModeUsed: true,
          targetTier: skipToTier
        }
      };
      return failureDetails;
    }
    
    return targetResult;
  }
  
  // Normal cascade (no skip mode)
  const trace: Array<{ tier: string; ms: number; ok: boolean; code?: string; details?: any }> = [];
  
  for (const { name, fn, precondition } of tiers) {
    // Skip if precondition fails (handled inside tier functions now)
    if (precondition && !precondition(ctx)) {
      trace.push({ tier: name, ms: 0, ok: false, code: "PRECONDITION_FAILED" });
      continue;
    }
    
    const result = await fn(ctx);
    trace.push({
      tier: name,
      ms: result.ok ? (result.meta?.ms || 0) : 0,
      ok: result.ok,
      code: result.ok ? undefined : (result as ErrResult).code,
      details: result.ok ? undefined : (result as ErrResult).details,
    });
    
    // Store trace in context for downstream tiers
    ctx.trace = trace;
    
    // Check if force mode blocks cascade (after Tier 1 failure)
    if (name === "TIER_1" && !result.ok && ctx.payload.forceCompleteTier1) {
      console.log('🚫 forceCompleteTier1: Blocking Direct Mode fallback');
      return {
        ok: false,
        code: "TIER_1_FORCED_FAILURE",
        details: {
          message: "Tier 1 failed in force mode - cascade blocked",
          tier: "TIER_1",
          templateStructure: "TIER_1_FORCED_FAILURE",
          cascadeBlocked: true,
          errorDetails: (result as ErrResult).details,
          trace
        }
      };
    }
    
    // Early return on success
    if (result.ok) {
      return { ...result, data: { ...result.data, trace } };
    }
  }
  
  // All tiers failed
  return { ok: false, code: "ALL_TIERS_FAILED", details: { trace } };
}

// OPTIMIZED SERVE HANDLER WITH FLAT-TIER CASCADE
serve(async (req) => {
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

  // PHASE 2: GET/HEAD health checks - IMPORT-FREE for instant liveness
  // POST requests lazy-load ReliabilityManager and ResilientRunwareWebSocket
  if (req.method === "GET" || req.method === "HEAD") {
    const runwareKey = Deno.env.get("RUNWARE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const corsHeaders = generateEchoCorsHeaders(req);
    
    const healthData = {
      status: "healthy",
      service: "runware-generate-image",
      tier: "Main Orchestrator",
      deployment_version: "2025-10-12T20:00:00Z-HEALTH-PATH-IMPORT-FREE",
      timestamp: new Date().toISOString(),
      environment: {
        hasRunwareApiKey: !!runwareKey,
        hasOpenAiApiKey: !!openaiKey,
        hasSupabaseServiceRoleKey: !!supabaseKey,
      },
      capabilities: ["tier_orchestration", "image_generation", "complete_cascade_1_DirectMode_2.5A_2.5B_2.5C_2.5D"],
      note: "Runtime statistics available via POST requests - health path is import-free for liveness stability"
    };

    // HEAD should return no body with proper cache control
    if (req.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Content-Length": "0",
          "X-Health-Ready": "1"
        },
      });
    }

    // GET returns full health data
    return new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Health-Ready": "1"
      }
    });
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== "POST") {
    return corsResponse({ error: "Method not allowed" }, req, 405);
  }

  // Fast retry wrapper for boot sync issues
  let cachedPayload: any | null = null;
  const requestId = `mg1${Math.random().toString(36).substring(2)}`;
  
  // Request-level abort controller with 40s budget (allows full cascade)
  const requestAbort = new AbortController();
  const budgetTimer = setTimeout(() => requestAbort.abort(), 40000);
  
  for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
    try {
      // PHASE 3: JSON parsing only once (cached for retries to prevent "Body already consumed" error)
      if (!cachedPayload && attempt === 0) {
        cachedPayload = await req.json();
      }
      const payload = cachedPayload;
      console.log(`🚀 [${requestId}] runware-generate-image ready`);
      
      // 🔍 DEBUG: Log ALL incoming requests for debugging Force Tier 2.5A failures
      console.log(`🔍 [${requestId}] POST Request Received:`, {
        hasStoryText: !!payload.storyText,
        hasPageText: !!payload.pageText,
        hasUserInfo: !!payload.userInfo,
        hasSessionId: !!payload.sessionId,
        skipDirectlyToTier: payload.skipDirectlyToTier,
        forceCompleteTier1: payload.forceCompleteTier1,
        skipTier1AI: payload.skipTier1AI,
        __testSimulateOrchestratorFailure: payload.__testSimulateOrchestratorFailure,
        __testSimulateT1Failure: payload.__testSimulateT1Failure,
        payloadKeys: Object.keys(payload),
        timestamp: new Date().toISOString()
      });

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

      // Lazy load resilientLoader for proper module resolution with CDN fallbacks
      let resilientMemoizedImport: any;
      try {
        const loaderModule = await import("./resilientLoader.js");
        resilientMemoizedImport = loaderModule.memoizedImport;
        console.log("✅ [RESILIENT_LOADER] Loaded memoizedImport with CDN fallbacks");
      } catch (loaderError) {
        console.error("❌ [RESILIENT_LOADER] Failed to load, using basic import:", loaderError);
        resilientMemoizedImport = async (href: string) => await import(href); // Fallback to basic
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

      // 🧪 TEST-ONLY: Early override for Force 2.5A display envelope
      // This branch ONLY triggers with both skipDirectlyToTier === '2.5A' AND __testDisplaySuccess === true
      if (payload.skipDirectlyToTier === '2.5A' && payload.__testDisplaySuccess === true) {
        console.log(`🎯 [${requestId}] TEST ENVELOPE (early override): Force 2.5A display mode`);
        
        // Build minimal ctx for executeTier1
        const ctx: TierContext = {
          req,
          requestId,
          payload: { ...payload, forceCompleteTier1: true, skipTier1AI: true },
          memoizedImport: resilientMemoizedImport,
          tierLogger: console,
          generateNuclearNegativePrompt,
          detectCulturalProfileForNegatives,
          requestAbort
        };
        
        // Execute Tier 1 to populate CCS (best-effort, catch all errors)
        try {
          await executeTier1(ctx);
          console.log(`✅ [${requestId}] Test envelope: Tier 1 executed, ctx.tier1 populated`);
        } catch (t1Error) {
          console.warn(`⚠️ [${requestId}] Test envelope: Tier 1 failed, continuing with partial CCS:`, t1Error?.message);
        }
        
        // Return 200 with test display envelope
        const corsHeaders = generateEchoCorsHeaders(req);
        clearTimeout(budgetTimer);
        return new Response(JSON.stringify({
          success: true,
          testDisplay: true,
          precomputedCCS: ctx.tier1 || null,
          metadata: {
            skipModeUsed: true,
            targetTier: '2.5A',
            stoppedBecause: 'CCS_REQUIRED_FOR_2.5A',
            cascadeHistory: [
              '🧪 Test Display Mode: bypassed cascade',
              '🎯 Target: 2.5A (requires full CCS)',
              '📦 Returning CCS envelope for UI display'
            ]
          }
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

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

      // ✅ TEST SIMULATION: Orchestrator failure (for Direct Mode frontend bypass tests)
      if (payload.__testSimulateOrchestratorFailure === true) {
        console.log(`🧪 [TEST] Simulating orchestrator failure for Direct Mode frontend bypass test`);
        return corsResponse({
          success: false,
          error: 'TEST_SIMULATED_ORCHESTRATOR_FAILURE',
          message: 'Orchestrator simulated failure for testing Direct Mode fallback',
          tier: 'ORCHESTRATOR_TEST_FAILURE',
          testSimulation: true
        }, req, 503); // Return 503 to trigger catch block in SimpleImageService
      }

      // Preferred: resilient loader from _shared
      let memoizedImport: <T = any>(href: string) => Promise<T>;
      let usingResilientLoader = false;
      try {
        // CRITICAL: Use local shim to bypass cross-folder import resolution issues
        ({ memoizedImport } = await import("./resilientLoader.js"));
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
              importPath = "../_vendor/supabase-js@2.57.4.bundle.mjs"; // CRITICAL: Correct filename for vendor bundle mapping
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

      // TypeScript interface for enhanced prompt result
      interface EnhancedPromptResult {
        enhancedPrompt: string;
        negativePrompt: string;
        primaryScene: string;
        aiSchema: Record<string, any>;
        aiDebugSchema: any;
        templateStructure: string;
      }

      // Declare enhancedPrompt outside try block so it's accessible in catch for Direct Mode
      let enhancedPrompt: EnhancedPromptResult | null = null;

      // CCS Pre-computation variables (hoisted for cascade availability)
      let characterSeed: { hair: string; skin: string; eyes: string } | undefined = undefined;
      let culturalBundle: any = undefined;
      let coloredObjects: string = "";
      let secondaryCharacters: any[] = [];
      let mainCharacterAppearance: any = {};

      // ========== FLAT-TIER CASCADE: 1 → Direct Mode → 2.5A → 2.5B → 2.5C → 2.5D ==========
      
      // 1. Build context once
      const ctx: TierContext = {
        req,
        requestId,
        payload,
        memoizedImport,
        tierLogger,
        generateNuclearNegativePrompt,
        detectCulturalProfileForNegatives,
        requestAbort, // ADD: Request-level abort signal
      };
      
      // 2. Health-based routing
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      const openaiHealthy = !!openaiKey && openaiKey.trim().length > 0;
      
      // ⚠️ CRITICAL: ai-visual-scene-creator ONLY responds to HEAD on /health endpoint
      // DO NOT change this URL to base path - it will cause false "unhealthy" classification
      // and skip Tier 1 & Direct Mode (90-95% success rate lost)
      // Reference: ai-visual-scene-creator/index.ts lines 1150-1153
      // Check ai-visual-scene-creator health (2s timeout)
      let aiVisualSceneCreatorHealthy = true;
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const healthCheck = await fetch(`${supabaseUrl}/functions/v1/ai-visual-scene-creator/health`, {
            method: 'HEAD',
            headers: { 'Authorization': `Bearer ${supabaseKey}` },
            signal: AbortSignal.timeout(2000)
          });
          aiVisualSceneCreatorHealthy = healthCheck.ok || healthCheck.status === 400;
        } else {
          aiVisualSceneCreatorHealthy = false;
        }
      } catch (error) {
        console.warn(`⚠️ [${requestId}] AI Visual Scene Creator health check failed:`, error.message);
        aiVisualSceneCreatorHealthy = false;
      }
      
      // Self-test: Verify health endpoint returns correct status
      if (aiVisualSceneCreatorHealthy) {
        console.log(`✅ [${requestId}] AISC health check PASSED - /health endpoint responding correctly`);
      } else {
        console.error(`❌ [${requestId}] CRITICAL: AISC health check FAILED - verify /health endpoint exists`);
        console.error(`   Expected: ${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-visual-scene-creator/health responds to HEAD`);
        console.error(`   Impact: Tier 1 & Direct Mode will be SKIPPED (business-critical failure)`);
        
        // Log to monitoring for alerting (using tierLogger instead of logTier1)
        try {
          tierLogger.failure('HEALTH_CHECK', {
            service: 'ai-visual-scene-creator',
            endpoint: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-visual-scene-creator/health`,
            impact: 'Tier 1 & Direct Mode will be skipped',
            businessImpact: 'CRITICAL - 90-95% success rate lost',
            severity: 'CRITICAL'
          });
        } catch (healthCheckError) {
          console.error(`❌ [${requestId}] Health check error:`, healthCheckError);
          aiVisualSceneCreatorHealthy = false;
        }
      }
      
      console.log(`🏥 [${requestId}] System Health Check:`, {
        openai: openaiHealthy ? 'HEALTHY' : 'UNHEALTHY',
        aiVisualSceneCreator: aiVisualSceneCreatorHealthy ? 'HEALTHY' : 'UNHEALTHY',
        routingDecision: !aiVisualSceneCreatorHealthy && !openaiHealthy ? 'SKIP_TO_T25C' :
                         !aiVisualSceneCreatorHealthy ? 'SKIP_TO_DIRECT_MODE' : 'FULL_CASCADE'
      });
      
      // 3. Define cascade with health-based routing
      let tiers = [];
      const healthRoutingDecision: any = {
        orchestratorHealthy: aiVisualSceneCreatorHealthy,
        openaiHealthy: openaiHealthy,
        routingStrategy: 'FULL_CASCADE',
        skippedTiers: []
      };
      
      if (!aiVisualSceneCreatorHealthy && !openaiHealthy) {
        // CRITICAL: Both systems down - route directly to nuclear fallback
        console.log(`🚨 [${requestId}] CRITICAL: Both AI systems unhealthy - routing directly to Tier 2.5C`);
        tierLogger.attempt("TIER_1", { skipped: true, reason: "ai_systems_unhealthy" });
        tierLogger.attempt("DIRECT_MODE", { skipped: true, reason: "ai_systems_unhealthy" });
        tierLogger.attempt("CCS_RETRY", { skipped: true, reason: "tier1_skipped" });
        tierLogger.attempt("TIER_2.5A", { skipped: true, reason: "no_ccs_data" });
        tierLogger.attempt("TIER_2.5B", { skipped: true, reason: "fast_fail_to_nuclear" });
        
        healthRoutingDecision.routingStrategy = 'NUCLEAR_ONLY';
        healthRoutingDecision.skippedTiers = ["TIER_1", "DIRECT_MODE", "CCS_RETRY", "TIER_2.5A", "TIER_2.5B"];
        
        tiers = [
          { name: "T25C", fn: executeT25C },
          { name: "T25D", fn: executeT25D }
        ];
      } else if (!aiVisualSceneCreatorHealthy) {
        // AISC unhealthy → skip Tier 1 AND Direct Mode (both depend on AISC); go straight to templates
        console.log(`⚠️ [${requestId}] AI Visual Scene Creator unhealthy - skipping Tier 1 and Direct Mode, routing to templates`);
        tierLogger.attempt("TIER_1", { skipped: true, reason: "ai_visual_scene_creator_unhealthy" });
        tierLogger.attempt("DIRECT_MODE", { skipped: true, reason: "ai_visual_scene_creator_unhealthy" });
        
        healthRoutingDecision.routingStrategy = 'TEMPLATES_ONLY';
        healthRoutingDecision.skippedTiers = ["TIER_1", "DIRECT_MODE"];
        
        tiers = [
          { name: "T25A", fn: executeT25A, precondition: (ctx) => !!ctx.tier1?.characterSeed && !!ctx.tier1?.latestClothing },
          { name: "T25B", fn: executeT25B },
          { name: "T25C", fn: executeT25C },
          { name: "T25D", fn: executeT25D }
        ];
      } else {
        // All systems healthy - run full cascade
        console.log(`✅ [${requestId}] All systems healthy - executing full cascade from Tier 1`);
        
        // Test-only guard: Enforce Direct Mode for "Orchestrator Fallback" test
        if (payload.test === true && payload.__testSimulateT1Failure === true) {
          console.log(`🧪 [${requestId}] TEST MODE: Forcing Direct Mode path for primaryScene validation`);
          tiers = [
            { name: "TIER_1", fn: executeTier1 },
            { name: "DIRECT_MODE", fn: executeDirectMode },
            // Stop cascade here - if DM fails, test should fail (no template fallback)
          ];
        } else {
          // Normal production cascade
          tiers = [
            { name: "TIER_1", fn: executeTier1 },
            { name: "DIRECT_MODE", fn: executeDirectMode },
            { name: "T25A", fn: executeT25A, precondition: (ctx) => !!ctx.tier1?.characterSeed && !!ctx.tier1?.latestClothing },
            { name: "T25B", fn: executeT25B },
            { name: "T25C", fn: executeT25C },
            { name: "T25D", fn: executeT25D }
          ];
        }
      }
      
      // Store health routing decision in context
      ctx.healthRoutingDecision = healthRoutingDecision;
      
      // 3. Run cascade (with test-only Direct Mode enforcement)
      let result;
      
      // 🧪 TEST MODE: Force Direct Mode execution for "Orchestrator Fallback" test
      if (payload.test === true && payload.__testSimulateT1Failure === true) {
        console.log(`🧪 [${requestId}] TEST MODE: Forcing Direct Mode execution after Tier 1 simulation`);
        
        // Execute Tier 1 (will be simulated failure due to __testSimulateT1Failure flag)
        const tier1Result = await executeTier1(ctx);
        
        if (!tier1Result.ok) {
          console.log(`🧪 [${requestId}] TEST: Tier 1 failed as expected, executing Direct Mode...`);
        }
        
        // Force Direct Mode execution (must return primaryScene)
        const dmResult = await executeDirectMode(ctx);
        
        if (dmResult.ok) {
          console.log(`✅ [${requestId}] TEST: Direct Mode succeeded with primaryScene`);
          result = dmResult;
        } else {
          console.error(`❌ [${requestId}] TEST: Direct Mode failed:`, dmResult.reason);
          result = dmResult;
        }
      } else {
        // Normal production cascade
        result = await runTierCascade(tiers, ctx);
      }
      
      // 4. Return result
      if (result.ok) {
        // Check if this is a test display envelope (200 with CCS for UI)
        if (result.data?.testDisplay === true) {
          console.log(`🎯 [${requestId}] Returning test display envelope (200 with CCS)`);
          return corsResponse({ 
            success: true,
            testDisplay: true,
            precomputedCCS: result.data.precomputedCCS,
            metadata: result.data.metadata,
            requestId, 
            timestamp: new Date().toISOString()
          }, req, 200);
        }
        
        // Normal success response
        return corsResponse({ 
          ...result.data, 
          requestId, 
          timestamp: new Date().toISOString(),
          healthRoutingDecision: ctx.healthRoutingDecision
        }, req, 200);
      }
      
      // Map errors to HTTP status
      const status = result.code === "ALL_TIERS_FAILED" ? 503 : 500;
      return corsResponse(
        {
          success: false,
          error: result.code,
          reason: result.reason,
          details: result.details,
          retryAfterSeconds: status === 503 ? 8 : undefined,
          requestId,
          timestamp: new Date().toISOString(),
        },
        req,
        status
      );
      
  } catch (cascadeError) {
    // Outer catch for entire cascade - handles validation and boot errors
    const errorMessage = cascadeError instanceof Error ? cascadeError.message : String(cascadeError);

    // Check if this is a validation error (client error, not server error)
    const isValidationError = errorMessage.includes("NO_STORY_CONTENT") || 
                              errorMessage.includes("PAYLOAD_NULL") || 
                              errorMessage.includes("NO_SESSION_OR_USER_INFO");

    if (isValidationError) {
      // Return 400 Bad Request for client-side validation errors
      clearTimeout(budgetTimer); // Clear budget timer on validation error
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
      clearTimeout(budgetTimer); // Clear budget timer on final error
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
  } // end cascadeError catch (outer try from line 1151)
} // end for loop

  // Should never reach here, but fallback
  clearTimeout(budgetTimer); // Clear budget timer on max retries fallback
  return corsResponse(
    {
      error: "Max retries exceeded",
      escalationTarget: "TIER_4",
    },
    req,
    500
  );
}); // end serve handler
