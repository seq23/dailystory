// 🚀 DEPLOYMENT MARKER: v2025-10-09-FLAT-TIER-PRODUCTION (ZERO-NESTING)
// Last deployed: 2025-10-08
// Changes: Flattened architecture, removed try/catch, preserved unique app functionality & imports

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CCS completely removed from Direct Mode - using inline static avatar system
const ccsBootStatus = { loaded: false, error: null as null | string };

// ========== INLINE CORS ==========
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
  if (origin) headers["Access-Control-Allow-Credentials"] = "true";
  return headers;
}

function corsResponse(data: any, req: Request, status = 200, extra: Record<string,string> = {}): Response {
  const headers: Record<string, string> = {
    ...generateEchoCorsHeaders(req),
    "Content-Type": "application/json",
    ...extra,
  };
  if (status === 503 && data?.retryAfterSeconds) {
    headers["Retry-After"] = String(data.retryAfterSeconds);
    headers["Access-Control-Expose-Headers"] = "Retry-After";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

// ========== GLOBAL SUPABASE CLIENT (lazy-initialized) ==========
let supabaseClient: any = null;

// ========== ENV VALIDATION ==========
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!SUPABASE_URL) console.error('❌ CRITICAL: SUPABASE_URL environment variable is missing');
if (!SUPABASE_SERVICE_ROLE_KEY) console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
if (!OPENAI_API_KEY) console.error('❌ CRITICAL: OPENAI_API_KEY environment variable is missing');

// ========== INLINE STATIC AVATAR DATA ==========
const INLINE_HAIR_BY_SKIN: Record<string, string[]> = {
  pale: ['strawberry blonde hair','golden red hair','auburn curls','copper hair','reddish brown hair','ginger hair','red-gold hair','russet hair','mahogany red hair','burgundy hair','crimson hair','rose gold hair','amber red hair','cinnamon red hair'],
  light: ['platinum blonde hair','golden blonde hair','honey blonde hair','ash blonde hair','sandy blonde hair','wheat blonde hair','butter blonde hair','cream blonde hair','champagne blonde hair','vanilla blonde hair','pearl blonde hair','silver blonde hair','moonlight blonde hair','sunshine blonde hair','caramel blonde hair'],
  medium: ['chestnut brown hair','chocolate brown hair','coffee brown hair','walnut brown hair','hazelnut brown hair','mahogany brown hair','amber brown hair','bronze brown hair','toffee brown hair','mocha brown hair','caramel brown hair','russet brown hair','cedar brown hair','oak brown hair','maple brown hair'],
  olive: ['jet black hair','raven black hair','midnight black hair','obsidian hair','coal black hair','ebony hair','onyx hair','charcoal hair','deep black hair','ink black hair','shadow black hair','pitch black hair','dark espresso hair','blackest brown hair'],
  dark: ['beautiful dark hair','rich black hair','lustrous dark hair','silky black hair','gorgeous dark hair','shining black hair','magnificent dark hair'],
};

const AFRICAN_AMERICAN_HAIR_INLINE = {
  boys: [
    "wearing a photorealistic curly top fade with perfectly defined coils on top, crisp line-up around the edges, and smooth fade transitions down the sides and back",
    "wearing photorealistic twist sponge curls with tight coil definition, fresh line-up with sharp edges, and tapered sides with natural texture",
    "wearing a photorealistic high top fade with voluminous textured crown, geometric side part, and precision-cut fade gradation",
    "wearing photorealistic starter dreads in neat sections with clean parting lines, natural root texture, and expertly shaped perimeter",
    "wearing a photorealistic buzz cut with intricate geometric designs carved into the sides, crisp line-up, and smooth scalp fade",
    "wearing a photorealistic classic flat top with perfectly squared edges, uniform height across the crown, and sharp side fade transitions",
    "wearing a photorealistic caesar cut with deep 360 waves, brush pattern definition, and clean hairline shaping all around",
    "wearing photorealistic lined-up curls with natural coil springs, precision edge work, and graduated fade from crown to neckline",
    "wearing a photorealistic tapered afro with rounded natural shape, soft textured crown, and gradually shortened sides and back",
    "wearing a photorealistic modern pompadour fade with curly volume swept upward, skin fade sides, and detailed edge definition"
  ],
  girls: [
    "wearing a photorealistic full voluminous afro with authentic coily texture, natural 4B-4C curl pattern, rounded dome shape, dense hair distribution, individual curl spirals visible, matte finish texture, proper afro proportions, natural hair movement",
    "wearing photorealistic individual box braids with distinct square sectioning, each braid separately defined and visible, geometric parting pattern, multiple separate braided units, detailed individual braid texture, professional sectioning technique, natural or vibrant color variations",
    "wearing photorealistic cornrow braids in straight parallel rows, hair woven tightly against scalp, clean geometric parts showing scalp between rows, traditional African braiding technique, individual row definition, scalp-hugging pattern",
    "wearing photorealistic defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement",
    "wearing photorealistic well-maintained locs with natural texture, individual strand definition, mature lock formation, organic hair pattern, cultural significance",
    "wearing photorealistic natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish",
    "wearing a photorealistic elegant flat twist updo with precise parting, neat twisting pattern, decorative arrangement, formal styling, detailed texture work, individual strand definition",
    "wearing a photorealistic sleek protective bun with smooth edges, neat hair arrangement, polished finish, professional styling, clean part lines, natural hair movement",
    "wearing a photorealistic silky smooth silk press with glossy shine, pin-straight texture, individual strand definition, heat-pressed perfection, natural movement, luminous finish, silk-pressed smoothness",
    "wearing photorealistic bone straight relaxed hair with sleek texture, ultra-smooth finish, perfect alignment, chemical straightening results, glossy appearance, flowing movement, chemically straightened texture",
    "wearing a photorealistic precision-cut relaxed bob with blunt edges, smooth straight texture, professional salon finish, geometric cut lines, polished styling, professional salon results",
    "wearing photorealistic layered relaxed hair with dimensional cutting, smooth straight texture, professional layers, voluminous styling, salon-quality finish, glossy straight hair finish",
    "wearing photorealistic hot-pressed straight hair with curled ends, vintage styling technique, smooth shaft with bouncy curl tips, classic salon finish, heat-styled perfection",
    "wearing a photorealistic sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair",
    "wearing photorealistic silk-pressed hair with clean side part, glossy straight texture, precise parting line, smooth flowing hair, salon-quality finish, glossy hair shine",
    "wearing photorealistic relaxed hair with vintage bump styling, smooth straight texture, retro volume technique, polished finish, classic salon look, natural hair highlights",
    "wearing photorealistic thermally straightened hair with heat-pressed texture, smooth alignment, individual strand definition, professional hot tool finish, luminous hair finish",
    "wearing a photorealistic relaxed wrap hairstyle with smooth curved styling, salon wrap technique, sleek finish, dimensional movement, professional hair wrapping, professional salon results",
    "wearing photorealistic afro puffs hairstyle with twin high-positioned hair puffs, natural coily texture pattern, symmetrical rounded shape, authentic Black hair structure, voluminous curl clusters, defined individual strands, traditional afro hair styling",
    "wearing photorealistic long pigtails with curled ends, flowing length with bouncy spiral curls, symmetrical pigtail placement, smooth hair shaft with defined curl tips, glossy hair shine"
  ],
  child: [
    "wearing a photorealistic natural mini afro with photorealistic soft coily texture, rounded shape, and gentle volume",
    "wearing photorealistic short twist-out curls with photorealistic bouncy texture and natural movement",
    "wearing a photorealistic tapered natural cut with photorealistic textured crown and clean edges",
    "wearing photorealistic mini puffs with photorealistic soft coily texture and playful style",
    "wearing a photorealistic short curly fade with photorealistic defined coils on top",
    "wearing photorealistic natural wash-and-go curls with photorealistic soft volume and bounce",
    "wearing photorealistic short protective braids with photorealistic neat sections",
    "wearing a photorealistic rounded afro with photorealistic soft texture and natural shape",
    "wearing photorealistic short locs with photorealistic natural texture and clean styling",
    "wearing a photorealistic textured crop with photorealistic natural curl pattern and volume",
    "wearing photorealistic soft finger coils with photorealistic natural definition",
    "wearing a photorealistic natural cut with photorealistic gentle waves and texture"
  ]
};

const AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE = [
  "authentic African American light brown skin tone with warm brown eyes and a bright infectious smile",
  "authentic African American light brown skin tone with hazel-green eyes and gentle dimples when smiling",
  "authentic African American light brown skin tone with amber eyes and expressive eyebrows",
  "authentic African American caramel skin tone with deep chocolate eyes and a confident cheerful expression",
  "authentic African American caramel skin tone with hazel eyes with golden flecks and soft rounded cheeks",
  "authentic African American caramel skin tone with bright brown eyes and an inquisitive thoughtful look",
  "authentic African American honey complexion with golden brown eyes and a playful mischievous grin",
  "authentic African American honey complexion with warm brown eyes and graceful bone structure",
  "authentic African American honey complexion with hazel eyes and a warm welcoming expression",
  "authentic African American warm beige skin with dark honey-colored eyes and animated joyful features",
  "authentic African American warm beige skin with hazel-green eyes and gentle dimples",
  "authentic African American light caramel complexion with rich coffee-colored eyes and expressive eyebrows",
  "authentic African American medium brown skin tone with warm brown eyes and a bright infectious smile",
  "authentic African American medium brown skin tone with hazel eyes with golden flecks and gentle dimples when smiling",
  "authentic African American medium brown skin tone with deep amber eyes and expressive eyebrows",
  "authentic African American cocoa skin tone with dark chocolate eyes and a confident cheerful expression",
  "authentic African American cocoa skin tone with hazel-green eyes and soft rounded cheeks",
  "authentic African American cocoa skin tone with bright brown eyes and an inquisitive thoughtful look",
  "authentic African American warm brown complexion with golden brown eyes and a playful mischievous grin",
  "authentic African American warm brown complexion with rich coffee-colored eyes and graceful bone structure",
  "authentic African American chestnut skin tone with hazel eyes and a warm welcoming expression",
  "authentic African American chestnut skin tone with warm brown eyes and animated joyful features",
  "authentic African American amber skin tone with dark honey-colored eyes and gentle dimples",
  "authentic African American amber skin tone with hazel-green eyes and expressive eyebrows",
  "authentic African American deep brown skin tone with warm brown eyes and a bright infectious smile",
  "authentic African American deep brown skin tone with dark chocolate eyes and gentle dimples when smiling",
  "authentic African American deep brown skin tone with deep amber eyes and expressive eyebrows",
  "authentic African American rich chocolate complexion with hazel eyes with golden flecks and a confident cheerful expression",
  "authentic African American rich chocolate complexion with bright brown eyes and soft rounded cheeks",
  "authentic African American rich chocolate complexion with golden brown eyes and an inquisitive thoughtful look",
  "authentic African American dark brown skin tone with rich coffee-colored eyes and a playful mischievous grin",
  "authentic African American dark brown skin tone with warm brown eyes and graceful bone structure",
  "authentic African American ebony skin tone with dark honey-colored eyes and a warm welcoming expression",
  "authentic African American ebony skin tone with hazel-green eyes and animated joyful features",
  "authentic African American deep mahogany complexion with hazel eyes and gentle dimples",
  "authentic African American deep mahogany complexion with deep amber eyes and expressive eyebrows"
];

const INLINE_SKIN_FEATURES: Record<string, string[]> = {
  pale: [
    "porcelain skin with cool undertones",
    "fair ivory complexion with pink undertones",
    "alabaster skin with neutral undertones",
    "creamy pale skin with warm undertones",
    "pearl white complexion with subtle pink flush",
    "milky white skin with cool undertones",
    "fair skin with peachy undertones",
    "pale rose-tinted complexion",
    "translucent fair skin with blue undertones",
    "cream-colored skin with golden undertones",
    "snow white complexion with neutral base",
    "fair skin with subtle yellow undertones"
  ],
  light: [
    "light peachy skin tone with warm glow",
    "soft beige complexion with pink undertones",
    "warm vanilla skin with golden undertones",
    "light cream complexion with neutral base",
    "pale golden skin with honey undertones",
    "light rose-beige skin tone",
    "champagne-colored complexion",
    "light ivory skin with warm peachy glow",
    "soft bisque skin tone with pink flush",
    "light caramel undertones with creamy base",
    "warm light tan with golden highlights",
    "light sand-colored skin with neutral undertones"
  ],
  medium: [
    "warm peachy medium skin tone",
    "golden medium complexion with honey undertones",
    "medium beige skin with warm caramel highlights",
    "soft medium tan with golden glow",
    "medium caramel skin tone with warm undertones",
    "warm medium brown with peachy undertones",
    "medium golden skin with bronze highlights",
    "caramel medium complexion with honey base",
    "medium wheat-colored skin with warm glow",
    "golden medium tan with amber undertones",
    "medium olive-beige with warm undertones",
    "warm medium skin with cinnamon undertones"
  ],
  olive: [
    "light olive complexion with green undertones",
    "warm olive skin with golden undertones",
    "medium olive with bronze highlights",
    "golden olive complexion with warm glow",
    "olive-beige skin with neutral undertones",
    "warm olive-tan with amber undertones",
    "deep olive with rich warm undertones",
    "olive-brown complexion with golden base",
    "Mediterranean olive skin with sun-kissed glow",
    "olive-caramel with warm honey undertones",
    "rich olive complexion with bronze undertones",
    "dark olive skin with deep golden highlights"
  ],
  dark: [
    "rich brown with warm undertones",
    "deep brown with dark eyes",
    "mahogany with strong features",
    "ebony with beautiful complexion",
    "dark brown with radiant glow"
  ]
};

// ========= Small utilities (no throw) =========
const seededIndex = (seed: string, len: number) =>
  (seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % (len || 1);

const parseIntSafe = (value: string | undefined, def: number) => {
  if (!value) return def;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? def : n;
};

const safeJsonParse = (text: string): Promise<any | null> =>
  new Response(text).json().then((j)=>j).catch(()=>null);

const safeImport = (path: string): Promise<any | null> =>
  import(path).then((m)=>m).catch(()=>null);

type SafeJsonResult<T=any> = { ok: boolean; status: number; headers: Headers; json?: T; text?: string; error?: string; networkError?: string; timedOut?: boolean; };
function safeFetchJson<T=any>(url: string, init: RequestInit = {}, timeoutMs = 25000, externalSignal?: AbortSignal): Promise<SafeJsonResult<T>> {
  const startTime = Date.now();
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  
  // Listen to external signal for early abort
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      clearTimeout(id);
      ctrl.abort();
    });
  }
  
  return fetch(url, { ...init, signal: ctrl.signal })
    .then(async (res) => {
      clearTimeout(id);
      logNetworkOperation(`fetch ${url.substring(0, 50)}`, startTime, res.ok);
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        return res.json()
          .then((j) => ({ ok: res.ok, status: res.status, headers: res.headers, json: j as T }))
          .catch(() => res.text().then((t) => ({ ok: res.ok, status: res.status, headers: res.headers, text: t })));
      }
      return res.text().then((t)=>({ ok: res.ok, status: res.status, headers: res.headers, text: t }));
    })
    .catch((err) => {
      clearTimeout(id);
      logNetworkOperation(`fetch ${url.substring(0, 50)}`, startTime, false, err);
      const timedOut = err?.name === "AbortError";
      return { ok: false, status: 0, headers: new Headers(), error: String(err?.message || err), networkError: timedOut ? "timeout" : "network", timedOut };
    });
}

// ========= Avatar + features =========
function getSessionSeededHair(skinTone: string, sessionId: string, avatarType?: string): string {
  if (skinTone === 'dark') {
    const category = avatarType === 'boy' ? 'boys' : avatarType === 'girl' ? 'girls' : 'child';
    const options = (AFRICAN_AMERICAN_HAIR_INLINE as any)[category] || AFRICAN_AMERICAN_HAIR_INLINE.child;
    return options[seededIndex(sessionId, options.length)];
  }
  const opts = INLINE_HAIR_BY_SKIN[skinTone] || INLINE_HAIR_BY_SKIN.medium;
  return opts[seededIndex(sessionId, opts.length)];
}
function getSessionSeededFeatures(skinTone: string, sessionId: string): string {
  if (skinTone === 'dark') {
    const opts = AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE;
    return opts[seededIndex(sessionId, opts.length)];
  }
  const opts = INLINE_SKIN_FEATURES[skinTone] || INLINE_SKIN_FEATURES.medium;
  return opts[seededIndex(sessionId, opts.length)];
}
function emergencyHairFallback(skinTone: string): string {
  const normalized = (skinTone || 'medium').toLowerCase();
  const MAP: Record<string,string> = { pale:'strawberry blonde hair', light:'golden blonde hair', medium:'chestnut brown hair', olive:'jet black hair', dark:'beautiful dark hair' };
  return MAP[normalized] || MAP['medium'];
}

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

// ========== LKG CACHE (5-minute validity) ==========
interface CacheEntry {
  data: any;
  timestamp: number;
  requestHash: string;
}

const lkgCache = new Map<string, CacheEntry>();
const LKG_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

function createRequestHash(body: any): string {
  const storySnippet = body.storyText?.substring(0, 50) || body.pageText?.substring(0, 50) || '';
  return `${storySnippet}_${body.pageNumber || 1}_${body.userInfo?.name || 'user'}`;
}

function getLKG(requestHash: string): any | null {
  const cached = lkgCache.get(requestHash);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > LKG_VALIDITY_MS) {
    lkgCache.delete(requestHash);
    return null;
  }
  
  console.log(`✅ [LKG] Serving cached result (age: ${Math.round(age / 1000)}s)`);
  return cached.data;
}

function setLKG(requestHash: string, data: any): void {
  lkgCache.set(requestHash, {
    data,
    timestamp: Date.now(),
    requestHash
  });
  
  // Keep cache size reasonable (last 100 entries)
  if (lkgCache.size > 100) {
    const oldestKey = Array.from(lkgCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    lkgCache.delete(oldestKey);
  }
}

// Execute with LKG fallback
async function executeWithLKG<T>(
  requestHash: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    const result = await operation();
    setLKG(requestHash, result); // Cache successful result
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Operation failed, checking LKG cache:', errorMessage);
    
    const lkg = getLKG(requestHash);
    if (lkg) {
      console.log('✅ [LKG] Serving stale result due to error');
      return lkg;
    }
    
    throw error; // No LKG available
  }
}

// ========= Provider Gate (unchanged structure) =========
interface GateConfig { maxConcurrency: number; failThreshold: number; cooldownMs: number; maxWaitMs: number; }
interface CircuitState { failures: number; lastFailureAt: number; isOpen: boolean; }
interface GateState { active: number; waiting: Array<{ resolve: () => void; acquiredAt: number }>; circuit: CircuitState; }

const gates = new Map<string, GateState>();

const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'T1:ai-visual-scene-creator': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_T1'), 6),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 30000),
    maxWaitMs: 2000
  },
  'DM:runware-template-cd': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE'), 4),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 45000),
    maxWaitMs: 2000
  },
  'T25A:runware-template-ab': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE'), 4),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 45000),
    maxWaitMs: 2000
  },
  'T25B:runware-template-ab': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE'), 4),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 45000),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE'), 4),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 45000),
    maxWaitMs: 2000
  },
  'IMG:runware-generate-image': {
    maxConcurrency: parseIntSafe(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE'), 4),
    failThreshold: parseIntSafe(Deno.env.get('CIRCUIT_FAIL_THRESHOLD'), 5),
    cooldownMs: parseIntSafe(Deno.env.get('CIRCUIT_COOLDOWN_MS'), 45000),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, { active: 0, waiting: [], circuit: { failures: 0, lastFailureAt: 0, isOpen: false } });
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
  if (state.circuit.isOpen && (now - state.circuit.lastFailureAt >= config.cooldownMs)) {
    console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
    state.circuit.isOpen = false;
    state.circuit.failures = 0;
  }
  return state.circuit.isOpen;
}
function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);

  if (isCircuitOpen(key)) {
    const secs = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return Promise.resolve({ acquired: false, reason: 'CIRCUIT_OPEN', retryAfterSeconds: Math.max(3, Math.min(8, secs)) });
  }
  if (state.active < config.maxConcurrency) {
    state.active++;
    return Promise.resolve({ acquired: true });
  }

  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  return new Promise((resolve) => {
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    const timeoutId = setTimeout(() => {
      const idx = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (idx !== -1) state.waiting.splice(idx, 1);
      resolve({ acquired: false, reason: 'QUEUE_TIMEOUT', retryAfterSeconds: Math.floor(3 + Math.random() * 5) });
    }, timeout);
    state.waiting.push({ resolve: resolveAcquire, acquiredAt: Date.now() });
  });
}
function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);

  if (state.active > 0) state.active--;
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    if (state.circuit.failures > 0) state.circuit.failures = Math.max(0, state.circuit.failures - 1);
  }
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    waiter?.resolve();
  }
}

// ========= Types =========
interface UserInfoLocal {
  name?: string;
  userName?: string;
  skinTone?: string;
  avatar?: { skinTone?: string; type?: string; hairColor?: string };
  structuredAvatarData?: any;
  native_language?: string;
  nativeLanguage?: string;
  age?: number;
}

// ========= Generate visual schema (no throw) =========
function generateCompleteVisualSchema(
  storyText: string,
  userInfo: UserInfoLocal,
  sessionId: string,
  pageNumber: number = 1,
  directMode: boolean = false,
  inputStructuredAvatarData: any = null,
  mainCharacterAppearance: any = null,
  secondaryCharacters: any[] = [],
  capturePrompts: boolean = false // NEW: Flag to capture prompts for test mode
): Promise<{ ok: boolean; visualSchema?: any; aiDebugSchema?: any; structuredAvatarData?: any; error?: string; upstreamBackoff?: boolean; capturedPrompts?: { systemPrompt: string; userPrompt: string } }> {

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || "";
  const characterName = userInfo?.name || userInfo?.userName || 'child';

  const fallbackSkinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const ethnicityMap: Record<string, string> = { pale: 'Euro-American', light: 'Euro-American', medium: 'Mediterranean', olive: 'Middle Eastern', dark: 'African' };
  const derivedEthnicity = ethnicityMap[(fallbackSkinTone || 'medium').toLowerCase()] || 'Euro-American';

  const hair = getSessionSeededHair(fallbackSkinTone, sessionId, userInfo?.avatar?.type);
  const skinFeatures = getSessionSeededFeatures(fallbackSkinTone, sessionId);

  const structuredAvatarData = inputStructuredAvatarData || userInfo?.structuredAvatarData || {
    resolvedSkinTone: fallbackSkinTone,
    hairColor: hair,
    skinFeatures,
    ethnicity: derivedEthnicity,
    source: inputStructuredAvatarData ? 'input' : (userInfo?.structuredAvatarData ? 'userInfo' : 'inline_static')
  };

  const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
  const characterData = `${characterName}, age ${userInfo?.age || structuredAvatarData?.age || 6}, ${structuredAvatarData.hairColor || emergencyHairFallback(structuredAvatarData.resolvedSkinTone || 'medium')}, ${structuredAvatarData.skinFeatures || 'medium skin tone'}, ${structuredAvatarData.ethnicity || 'Euro-American'} ethnicity`;

  // Optional: previous scene fetch via Supabase if client available
  function ensureSupabase(): Promise<any | null> {
    if (supabaseClient) return Promise.resolve(supabaseClient);
    return safeImport('../_shared/resilientLoader.js')
      .then((mod) => mod?.createVendorFirstSupabaseClient ? mod.createVendorFirstSupabaseClient() : null)
      .then((cli) => {
        supabaseClient = cli || null;
        console.log(cli ? '✅ [SUPABASE] Vendor-first client initialized successfully' : '⚠️ [SUPABASE] Client init skipped/unavailable');
        return supabaseClient;
      });
  }

  function fetchPrevious(page: number): Promise<{ previousPrimaryScene: string | null; previousVisualSchema: any | null }> {
    if (page <= 1) return Promise.resolve({ previousPrimaryScene: null, previousVisualSchema: null });
    if (!supabaseClient) return Promise.resolve({ previousPrimaryScene: null, previousVisualSchema: null });
    return supabaseClient.from('visual_details_cache')
      .select('detail_value, visual_elements')
      .eq('session_id', sessionId)
      .eq('detail_type', 'primary_scene')
      .eq('page_first_seen', page - 1)
      .maybeSingle()
      .then((res: any) => {
        const prev = res?.data;
        const previousPrimaryScene = prev?.detail_value || null;
        const previousVisualSchema = prev?.visual_elements?.fullSchema || null;
        return { previousPrimaryScene, previousVisualSchema };
      })
      .catch(() => ({ previousPrimaryScene: null, previousVisualSchema: null }));
  }

  function buildPrompts(prevData: { previousPrimaryScene: string | null; previousVisualSchema: any | null }) {
    const isNonEnglish = nativeLanguage && nativeLanguage !== 'en';

    const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-2000 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, (weave ethnicity in here) in rich, detailed visual scene description for image generation with main character description (verbatim hair and skin / features provided weaved in naturally), setting, key character actions OR character as observer/in background if action focuses on object/animal, any secondary characters including animals, atmosphere, and comprehensive visual details",
  "backgroundColor": "e.g., 'warm golden', 'cool blue', 'cozy amber'",
  "lighting": "e.g., 'golden hour', 'soft morning', 'twilight glow'",
  "composition": "e.g., 'centered character', 'close-up with background'",
  "setting": "e.g., 'forest clearing', 'bedroom', 'playground'",
  "mood": "e.g., 'adventurous', 'peaceful', 'playful'",
  "secondaryCharacters": {"humans": ["e.g., 'mom', 'friend'"], "pets": ["e.g., 'dog', 'cat'"]},
  "objects": ["e.g., 'ball', 'tree', 'flowers'"],
  "clothing": ["e.g., 'blue shirt', 'red sneakers']
}

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Core Identity (HIGHEST PRIORITY - mainCharacterAppearance): use provided appearance data VERBATIM (word-for-word ethnicity, hair, skin tone) but weave it naturally into flowing prose using connecting phrases like "with her" or "who has" - NEVER simplify core appearance details. This data comes from the user profile.
4. Main character presence in ALL scenes (children's story requirement): ALWAYS include the main character in EVERY scene for visual continuity
   - If story text explicitly mentions character doing an action: character is PRIMARY FOCUS of scene
   - If story text focuses on object/animal WITHOUT mentioning character (e.g., "The dog jumps", "The ball rolls"): position main character as OBSERVER or in BACKGROUND watching/near the action
   - Example: Story says "The bird flies away" → Scene: "Sarah, age 6, with brown curly hair, watches from the garden as a small bird flies away into the blue sky"
   - Example: Story says "The toy car zooms across the floor" → Scene: "Jake, age 5, with short black hair, sits nearby on the floor smiling as his red toy car zooms across the wooden floor"
   - NEVER generate a scene without the main character visible - they must always be present for children's story continuity
5. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
6. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds
7. **Secondary Characters - SESSION CONSISTENCY**: Extract ONLY characters explicitly mentioned in the CURRENT STORY TEXT:
   - HUMANS: Named people (Jake, mom, teacher) or unnamed groups (friends, children, people)
   - PETS: Named or unnamed animals (Whiskers the cat, dog, birds)
   
   **CRITICAL CONSISTENCY RULES:**
   - Only include characters mentioned/implied in CURRENT story text
   - If a character from PREVIOUS SCENE data reappears by NAME, reuse their EXACT details for visual consistency
   - Do NOT carry forward characters unless they appear in current story
   - Do NOT invent names for unnamed characters (use "friends", "people", "dog")
   - For unnamed groups, use collective descriptions in primaryScene (Rule #1)
   
   Example: If PREVIOUS SCENE has "Jake: boy with curly hair, red shirt, blue cap" and current story mentions "Jake ran to the door" → Include "Jake: boy with curly hair, red shirt, blue cap" in output
8. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
9. Visual continuity on pages 2+: CRITICAL - maintain exact visual consistency from PREVIOUS SCENE:
   - **CLOTHING TRACKING (HIGHEST PRIORITY)**: Extract and track clothing items mentioned in story text
     * Add clothing to the clothing array for session-wide consistency
     * If story explicitly mentions clothing change, update the array with new items
     * Examples: 'blue t-shirt', 'red sneakers', 'yellow raincoat', 'purple backpack'
     * If previous scene shows "blue shirt", character keeps "blue shirt" unless story says they changed
   - Object persistence: if previous scene mentions "pink backpack", current scene MUST show "pink backpack" when story references "it" or "the backpack"
   - **Pronoun Resolution (CRITICAL)**: "it", "them", "her toy" MUST match objects/characters from previous scene
     * If story says "picked it up" and previous scene had "red ball", current scene must show "red ball"
     * If story says "they arrived" and previous scene had "mom and dad", current scene must show "mom and dad"
     * NEVER introduce new interpretations of pronouns - always reference PREVIOUS SCENE data
   - Scene element maintenance: if previous scene was "sunny park", continue "sunny park" unless story changes location
   - Color memory: NEVER change colors ("red ball" stays "red ball", "green jacket" stays "green jacket")
   
   Example: Prev="pink backpack", Current="walked with it" → Keep "pink backpack" (not "blue bag")
   Example: Prev clothing=["blue t-shirt", "red sneakers"], Story="Emma walked to school" → Keep "blue t-shirt" and "red sneakers" visible

10. Main character appearance details (from story): If mainCharacterAppearance provides physical features (eyes, hair texture) or clothing items extracted from the story, incorporate them naturally into the scene description. This is SEPARATE from Rule #3 (which uses user profile data).
11. Secondary character visual consistency: If secondary characters have visualDetails arrays, use these exact descriptors for consistent appearances across pages

CULTURAL CONTEXT:
${(() => {
  const ethnicity = structuredAvatarData?.ethnicity || 'Euro-American';
  const lang = nativeLanguage || 'en';
  
  if (ethnicity !== 'Euro-American' || lang !== 'en') {
    return `Incorporate authentic cultural elements based on ${ethnicity} ethnicity and ${lang}-speaking region. Example: Light-skinned French speaker (Euro-French) → Eiffel Tower, Parisian cafes, cobblestone streets. Dark-skinned French speaker (Francophone African) → vibrant markets in Dakar or Paris suburbs, colorful textiles, tropical trees.`;
  }
  return 'Use universal child-friendly settings with warm, inviting atmospheres';
})()}`;

    const previousBlock = prevData.previousVisualSchema
      ? `STRUCTURED VISUAL CONSISTENCY DATA (use these exact details):
- Main Character Clothing: ${JSON.stringify(prevData.previousVisualSchema.clothing || [])}
- Objects in Scene: ${JSON.stringify(prevData.previousVisualSchema.objects || [])}
- Previous Secondary Characters: ${JSON.stringify(prevData.previousVisualSchema.secondaryCharacters || { humans: [], pets: [] })}
- Setting: ${prevData.previousVisualSchema.setting || 'outdoor scene'}
- Composition: ${prevData.previousVisualSchema.composition || 'centered'}`
      : 'None - this is the first scene';

    const userPrompt = `Your PRIMARY JOB: Generate a detailed "primaryScene" visual description (200-2000 chars) for AI image generation. This primaryScene field drives the entire image, so pack it with rich visual details: main character (with exact identity strings woven naturally), setting, action, secondary characters, objects, atmosphere, and mood. Then complete the JSON with supporting fields.

═══════════════════════════════════════════════════════════════
📖 STORY TEXT (Rule #1 - PRIMARY DRIVER)
═══════════════════════════════════════════════════════════════
"${storyText}"

↑ Extract visual details ONLY from this story text. This is the absolute driver.

═══════════════════════════════════════════════════════════════
👤 MAIN CHARACTER CORE IDENTITY (Rule #3 - HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════
SOURCE: User profile (system-provided)

${characterData}

↑ Weave these exact strings verbatim into your primaryScene with natural flow:
Example: "Emma, age 8, caramel blonde hair, soft bisque skin tone with pink flush, Euro-American ethnicity"
→ "Emma is a beautiful 8-year-old girl of Euro-American ethnicity with flowing caramel blonde hair and a soft bisque skin tone with pink flush"

${mainCharacterAppearance ? `───────────────────────────────────────────────────────────────
👗 STORY-EXTRACTED APPEARANCE DETAILS (Rule #10)
───────────────────────────────────────────────────────────────
SOURCE: Extracted from story text above
Physical features mentioned: ${JSON.stringify(mainCharacterAppearance.physicalFeatures || [])}
Clothing items mentioned: ${JSON.stringify(mainCharacterAppearance.clothing || [])}

↑ Incorporate these naturally if they complement the core identity above.
` : ''}

${secondaryCharacters && secondaryCharacters.length > 0 ? `═══════════════════════════════════════════════════════════════
👥 SECONDARY CHARACTERS (Rule #7 & #11 - Session Consistency)
═══════════════════════════════════════════════════════════════
SOURCE: Session memory (consistent across all pages)

${secondaryCharacters.map((c:any)=>{
  const details = Array.isArray(c.visualDetails) 
    ? c.visualDetails.join(', ')
    : typeof c.visualDetails === 'string'
    ? c.visualDetails
    : 'no visual details';
  return `• ${c.name} (${c.type}): ${details}`;
}).join('\n')}

↑ Use these EXACT visual descriptors if these characters appear in the story.
` : ''}

${prevData.previousVisualSchema ? `═══════════════════════════════════════════════════════════════
🔗 PREVIOUS SCENE VISUAL MEMORY (Rule #9 - CRITICAL CONTINUITY)
═══════════════════════════════════════════════════════════════
SOURCE: Previous page's visual schema (NOT prose description)

🎽 CLOTHING (Rule #9.1 - HIGHEST PRIORITY):
${JSON.stringify(prevData.previousVisualSchema.clothing || [])}
⚠️ Character MUST wear these exact items UNLESS story explicitly states clothing change.

📦 OBJECTS IN SCENE:
${JSON.stringify(prevData.previousVisualSchema.objects || [])}
⚠️ PRONOUN RESOLUTION (Rule #9.2): If story uses "it", "them", "that" → MUST reference these objects.

👥 SECONDARY CHARACTERS PRESENT:
${JSON.stringify(prevData.previousVisualSchema.secondaryCharacters || { humans: [], pets: [] })}
⚠️ If story mentions "they arrived" or "mom and dad" → MUST match these characters.

🏞️ SETTING: ${prevData.previousVisualSchema.setting || 'outdoor scene'}
📐 COMPOSITION: ${prevData.previousVisualSchema.composition || 'centered'}

↑ Maintain exact visual consistency with these details UNLESS story text contradicts them.
` : `═══════════════════════════════════════════════════════════════
🆕 FIRST SCENE - No Previous Visual Data
═══════════════════════════════════════════════════════════════
This is page 1. Establish initial visual baseline from story text.
`}

═══════════════════════════════════════════════════════════════
✅ OUTPUT FORMAT REQUIREMENT
═══════════════════════════════════════════════════════════════
Return ONLY valid JSON matching the schema in system prompt.
- NO markdown code blocks
- NO explanatory text
- NO comments
- ONLY raw JSON object

PRIMARY OUTPUT FOCUS: Your "primaryScene" field is the most critical output - make it detailed, visual, and image-generation-ready (200-2000 characters).`;

    return { systemPrompt, userPrompt, isNonEnglish };
  }

  function callOpenAI(prompts: {systemPrompt:string; userPrompt:string}, attempt: number): Promise<{ ok:boolean; content?: string; status?: number }> {
    if (!openaiApiKey) return Promise.resolve({ ok: false, status: 0 });
    return safeFetchJson<any>('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompts.systemPrompt }, { role: 'user', content: prompts.userPrompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    }, 25000).then((res) => {
      const content = res.json?.choices?.[0]?.message?.content?.trim?.();
      return { ok: !!(res.ok && content), content, status: res.status };
    });
  }

  function parseVisual(content: string): Promise<{ 
    schema: any | null; 
    parseMethod: 'json' | 'regex' | 'prose' | 'none';
    extractedPrimaryScene?: string;
    jsonParseError?: string;
  }> {
    console.log(`🔍 [PARSE_DEBUG] OpenAI response preview (first 180 chars): "${content.substring(0, 180)}..."`);
    
    return safeJsonParse(content).then((json) => {
      if (json && json.primaryScene) {
        const len = json.primaryScene.length;
        if (len < 200) {
          console.warn(`⚠️ [SCHEMA_WARNING] primaryScene length (${len} chars) is below recommended 200 characters. Using anyway.`);
        }
        return { schema: json, parseMethod: 'json' as const };
      }
      
      // JSON parsing failed - try regex extraction
      const match = content.match(/"primaryScene":\s*"([^"]+)"/);
      if (match && match[1]) {
        const len = match[1].length;
        if (len < 200) {
          console.warn(`⚠️ [SCHEMA_WARNING] Extracted primaryScene length (${len} chars) is below recommended 200 characters. Using anyway.`);
        }
        // Return regex-extracted primaryScene but NO SYNTHETIC SCHEMA
        return {
          schema: null,
          parseMethod: 'regex' as const,
          extractedPrimaryScene: match[1],
          jsonParseError: 'JSON parsing failed but primaryScene extracted via regex'
        };
      }
      
      // ✅ NEW: If OpenAI returned prose without JSON structure, use entire response as primaryScene
      const trimmedContent = content.trim();
      if (trimmedContent.length > 50) {
        console.log(`🔧 [PROSE_FALLBACK] Using entire OpenAI response as primaryScene (${trimmedContent.length} chars)`);
        if (trimmedContent.length < 200) {
          console.warn(`⚠️ [PROSE_WARNING] primaryScene length (${trimmedContent.length} chars) is below recommended 200 characters. Using anyway.`);
        }
        return {
          schema: null,
          parseMethod: 'prose' as const,
          extractedPrimaryScene: trimmedContent,
          jsonParseError: 'No JSON structure, using full prose as primaryScene'
        };
      }
      
      console.error(`❌ [PARSE_REJECTION] OpenAI content too short or empty`, {
        contentLength: content.length,
        contentPreview: content.substring(0, 100)
      });
      return { 
        schema: null, 
        parseMethod: 'none' as const,
        jsonParseError: `Content too short (${content.length} chars) or empty - no primaryScene extracted`
      };
    }).catch((err) => {
      return {
        schema: null,
        parseMethod: 'none' as const,
        jsonParseError: String(err?.message || err).substring(0, 120)
      };
    });
  }


  function savePrimaryScene(directMode: boolean, visualSchema: any): Promise<void> {
    if (!directMode) return Promise.resolve();
    if (!supabaseClient) return Promise.resolve();

    const characterName = userInfo?.name || userInfo?.userName || 'Child';
    const page = pageNumber;

    // Delete window older than page-1
    return supabaseClient.from('visual_details_cache')
      .delete()
      .eq('session_id', sessionId)
      .eq('detail_type', 'primary_scene')
      .lt('page_first_seen', page - 1)
      .then(()=> supabaseClient.from('visual_details_cache')
        .insert({
          session_id: sessionId,
          character_name: characterName,
          detail_type: 'primary_scene',
          detail_key: `page_${page}`,
          detail_value: visualSchema.primaryScene,
          page_first_seen: page,
          page_last_seen: page,
          visual_elements: {
            storyText: storyText.substring(0,200),
            pageNumber: page,
            timestamp: new Date().toISOString(),
            fullSchema: {
              backgroundColor: visualSchema.backgroundColor,
              lighting: visualSchema.lighting,
              composition: visualSchema.composition,
              setting: visualSchema.setting,
              mood: visualSchema.mood,
              style: visualSchema.style,
              secondaryCharacters: visualSchema.secondaryCharacters,
              objects: visualSchema.objects,
              clothing: visualSchema.clothing || []
            }
          }
        }))
      .then(()=>undefined)
      .catch(()=>undefined);
  }

  // Hoist variables to outer scope for debug access in all paths
  let prompts: { systemPrompt: string; userPrompt: string; culturalContext?: string; isNonEnglish?: boolean } | null = null;
  let lastOpenAIResponse: { status?: number; content?: string; ok: boolean } | null = null;
  let attemptsUsed = 0;
  let encounteredBackoff = false;

  // chain execution (no try/catch) - ENHANCED WITH EMERGENCY FALLBACK
  return ensureSupabase()
    .then(()=> fetchPrevious(pageNumber))
    .then((prev) => {
      prompts = buildPrompts(prev);
      let attempt = 0;
      function loop(lastBackoff = false): Promise<{ ok:boolean; visual:any|null; parseMethod?:string; extractedPrimaryScene?:string; jsonParseError?:string; upstreamBackoff:boolean }> {
        if (attempt >= 3) { // Increased from 2 to 3 attempts for better resilience against transient OpenAI failures
          attemptsUsed = 3;
          return Promise.resolve({ ok: false, visual: null, upstreamBackoff: lastBackoff });
        }
        return callOpenAI({ systemPrompt: prompts!.systemPrompt, userPrompt: prompts!.userPrompt }, attempt).then((res) => {
          lastOpenAIResponse = res;
          attemptsUsed = attempt + 1;
          if (!res.ok || !res.content) {
            const isBackoff = res.status === 429 || res.status === 503;
            if (isBackoff) encounteredBackoff = true;
            attempt++;
            const delayMs = isBackoff ? Math.min(1000 * Math.pow(2, attempt-1), 10000) + Math.floor(Math.random()*1000) : 100 + Math.floor(Math.random()*200); // Increased max backoff from 8s to 10s
            return new Promise<{ ok:boolean; visual:any|null; parseMethod?:string; extractedPrimaryScene?:string; jsonParseError?:string; upstreamBackoff:boolean }>((resolve) =>
              setTimeout(()=> resolve(loop(isBackoff)), delayMs)
            );
          }
          return parseVisual(res.content).then((result) => {
            if (!result.schema && !result.extractedPrimaryScene) {
              return { ok:false, visual:null, parseMethod: result.parseMethod, jsonParseError: result.jsonParseError, upstreamBackoff:false };
            }
            // If we have a schema (JSON), use it
            if (result.schema) {
              return { ok:true, visual:result.schema, parseMethod: result.parseMethod, upstreamBackoff:false };
            }
            // If only regex extraction, return primaryScene only (no schema)
            return { 
              ok: true, 
              visual: { primaryScene: result.extractedPrimaryScene }, 
              parseMethod: result.parseMethod,
              jsonParseError: result.jsonParseError,
              upstreamBackoff: false 
            };
          });
        });
      }
      return loop();
    })
    .then((result) => {
      // No primaryScene? Return ok: false immediately
      if (!result.ok || !result.visual || !result.visual.primaryScene) {
        console.error('❌ AI failed to generate primaryScene');
        const aiDebugSchema = {
          modelUsed: 'gpt-4o-mini',
          aiGenerationSucceeded: false,
          failureReason: !result.ok ? 'ai_request_failed' : 'no_primary_scene_in_response',
          attemptsUsed,
          encounteredBackoff,
          characterDataSent: characterData,
          structuredAvatarData: userInfo?.structuredAvatarData || null,
          storyTextLength: storyText.length,
          systemPrompt: prompts?.systemPrompt || null,
          userPrompt: prompts?.userPrompt || null,
          culturalContext: prompts?.culturalContext || null,
          httpStatus: lastOpenAIResponse?.status || 0,
          rawResponse: lastOpenAIResponse?.content?.substring(0, 500) || null,
          parseMethod: result.parseMethod || 'none',
          parseError: !result.visual ? 'no_content_or_unparseable' : 'primaryScene_field_missing',
          parseErrorDetails: result.jsonParseError || null
        };
        return { ok: false, visualSchema: null, aiDebugSchema, structuredAvatarData, upstreamBackoff: result.upstreamBackoff, ...(capturePrompts && prompts && { capturedPrompts: { systemPrompt: prompts.systemPrompt, userPrompt: prompts.userPrompt } }) };
      }
      
      // Got primaryScene - check if we have full schema or regex-only
      const hasFullSchema = result.parseMethod === 'json';
      const parseMethod = result.parseMethod || 'json';
      
      const aiDebugSchema = {
        modelUsed: 'gpt-4o-mini',
        aiGenerationSucceeded: true,
        primarySceneLength: result.visual.primaryScene.length,
        characterDataSent: characterData,
        structuredAvatarData: userInfo?.structuredAvatarData || null,
        storyTextLength: storyText.length,
        isNonEnglish: nativeLanguage && nativeLanguage !== 'en',
        systemPrompt: prompts?.systemPrompt || null,
        userPrompt: prompts?.userPrompt || null,
        culturalContext: prompts?.culturalContext || null,
        httpStatus: lastOpenAIResponse?.status || 200,
        parseMethod,
        attemptsUsed,
        encounteredBackoff,
        ...((parseMethod === 'regex' || parseMethod === 'prose') && {
          rawResponse: lastOpenAIResponse?.content?.substring(0, 500) || null,
          parseError: parseMethod === 'prose' ? 'prose_without_json_structure' : 'schema_not_valid_json',
          parseErrorDetails: result.jsonParseError || null
        })
      };
      
      return savePrimaryScene(directMode, result.visual).then(() => ({ 
        ok: hasFullSchema, // Only true success if we got valid JSON schema
        visualSchema: result.visual, 
        aiDebugSchema, 
        structuredAvatarData, 
        upstreamBackoff: result.upstreamBackoff,
        ...(capturePrompts && prompts && {
          capturedPrompts: {
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt
          }
        })
      }));
    })
    .catch((outerSchemaError) => {
      // Catastrophic failure (unhandled exception) - fail fast
      console.error('❌ Catastrophic schema generation failure:', String(outerSchemaError?.message || outerSchemaError));
      const aiDebugSchema = {
        modelUsed: 'gpt-4o-mini',
        aiGenerationSucceeded: false,
        catastrophicError: true,
        outerError: String(outerSchemaError?.message || outerSchemaError),
        characterDataSent: characterData,
        structuredAvatarData: userInfo?.structuredAvatarData || null,
        storyTextLength: storyText.length,
        systemPrompt: prompts?.systemPrompt || null,
        userPrompt: prompts?.userPrompt || null,
        culturalContext: prompts?.culturalContext || null,
        httpStatus: lastOpenAIResponse?.status || 0,
        rawResponse: lastOpenAIResponse?.content?.substring(0, 500) || null,
        parseMethod: 'none',
        parseError: 'catastrophic_exception',
        attemptsUsed,
        encounteredBackoff
      };
      return { ok: false, visualSchema: null, aiDebugSchema, structuredAvatarData, upstreamBackoff: false, ...(capturePrompts && prompts && { capturedPrompts: { systemPrompt: prompts.systemPrompt, userPrompt: prompts.userPrompt } }) };
    });
}

// ========= Character seed (kept) =========
function generateCharacterSeed(sessionId: string, userInfo: any, hair: string, features: string) {
  const characterName = userInfo?.name || userInfo?.userName || 'child';
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  const language = userInfo?.language || userInfo?.nativeLanguage || 'en';
  let ethnicity = 'Euro-American';
  if (['hi', 'hi-IN'].includes(language)) ethnicity = 'Indian';
  else if (['zh', 'zh-CN'].includes(language)) ethnicity = 'Chinese';
  else if (['ar', 'ar-SA'].includes(language)) ethnicity = 'MENA region';
  else if (skinTone.toLowerCase() === 'dark') {
    if (['en', 'en-US'].includes(language)) ethnicity = 'African American';
    else if (language === 'es') ethnicity = 'Afro-Latino';
    else if (language === 'fr') ethnicity = 'Francophone African';
    else if (language === 'pt') ethnicity = 'Afro-Brazilian';
  } else {
    if (language === 'fr') ethnicity = 'French';
    else if (language === 'es') ethnicity = 'Spanish / Latino';
    else if (language === 'pt') ethnicity = 'Portuguese';
  }
  const age = userInfo?.age || 6;
  const characterDescription = `${characterName}, age ${age}, ${hair}, ${features}, ${ethnicity} ethnicity`;
  
  return {
    seed: Math.abs(sessionId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 999999,
    characterName,
    avatarType: userInfo?.avatar?.type || 'child',
    skinTone,
    hairColor: hair,
    skinFeatures: features,
    ethnicity,
    culturalProfile: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : undefined,
    characterDescription,
    age
  };
}

// ========= External calls (no throw) =========
function callRunwareTemplateCD(payload: any, requestAbort?: AbortController): Promise<{ ok:boolean; imageURL?: string; error?: string }> {
  const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd';
  return safeFetchJson<any>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
    body: JSON.stringify(payload)
  }, 15000, requestAbort?.signal).then((res) => {
    const ok = !!(res.ok && res.json?.success && res.json?.imageURL);
    return ok ? { ok: true, imageURL: res.json.imageURL } : { ok: false, error: `runware-template-cd failed (${res.status})` };
  });
}

function httpFallbackCall(endpoint: string, payload: any): Promise<{ ok:boolean; json?: any; error?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || "";
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
  if (!supabaseUrl || !serviceRoleKey) return Promise.resolve({ ok:false, error:'Missing Supabase configuration for HTTP fallback' });
  return safeFetchJson<any>(`${supabaseUrl}/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
    body: JSON.stringify(payload)
  }, 20000).then((res) => res.ok && res.json ? { ok:true, json: res.json } : { ok:false, error:`HTTP fallback failed (${res.status})` });
}

// ========= Server (flattened) =========
serve((req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: generateEchoCorsHeaders(req) });

  console.log("✅ ai-visual-scene-creator: Successfully booted and reachable");

  // Health
  if (req.method === 'HEAD' && req.url.includes('/health')) return corsResponse(null, req, 200);
  if (req.method === 'GET') return corsResponse({ status:'healthy', service:'ai-visual-scene-creator', timestamp: new Date().toISOString() }, req, 200);
  if (req.method !== 'POST') return corsResponse({ success:false, error:'Method not allowed' }, req, 405);

  const gatingEnabled = Deno.env.get('DISABLE_PROVIDER_GATE') !== 'true';
  const gateKey = 'T1:ai-visual-scene-creator';

  // Parse JSON non-throwing
  return req.json().catch(()=>null).then(async (payload) => {
    const requestId = `${Math.random().toString(36).substring(2)}`;
    const gateStartTime = Date.now();
    let gateAcquired = false;
    let handlerSuccess = false;
    
    // Request-level abort controller with 30s budget
    const requestAbort = new AbortController();
    const budgetTimer = setTimeout(() => requestAbort.abort(), 30000);

    try {

    // GATE acquire (non-blocking degradation)
    if (gatingEnabled) {
      const gateResult = await acquire(gateKey);
      if (!gateResult.acquired) {
        console.warn(`⚠️ [GATE] ${gateKey} denied: ${gateResult.reason} - proceeding degraded`);
      } else {
        gateAcquired = true;
        console.log(`✅ [GATE] ${gateKey} acquired`);
      }
    }

    // Guard clauses
    if (!payload || typeof payload !== 'object') {
      return corsResponse({ success:false, error:'Invalid JSON payload' }, req, 400);
    }

    if (payload?.diagnostic === true || payload?.diagnostic === 'health_check' || payload?.test === true) {
      return corsResponse({ success:true, service:'ai-visual-scene-creator', message:'Runtime OK', timestamp:new Date().toISOString() }, req, 200);
    }

    const content: string = payload.pageText || payload.storyText || payload.content || '';
    if (!content.trim()) {
      return corsResponse({ success:false, error:'MISSING_STORY_CONTENT', tier:'VALIDATION_FAILED' }, req, 400);
    }

    const userInfo: UserInfoLocal = payload.userInfo || {};
    const sessionId: string = payload.sessionId || `session-${requestId}`;
    const pageNumber: number = payload.pageNumber || 1;
    const directMode: boolean = payload.directMode === true;
    const testMode: boolean = payload.testMode === true; // NEW: Test mode for debugging prompts
    const mainCharacterAppearance = payload.mainCharacterAppearance || null;
    const secondaryCharacters = payload.secondaryCharacters || [];

    // CCS standardization marker (kept log semantics)
    console.warn(`⚠️ [TIER_2] CCS service removed - using inline fallback`);

    // Idempotency
    let IdempotencyMemory: any = await safeImport("../_shared/IdempotencyMemory.js");
    if (!IdempotencyMemory) {
      console.warn(`⚠️ [${requestId}] IdempotencyMemory unavailable, proceeding without deduplication`);
      IdempotencyMemory = {
        generateKey: (parts: any) => JSON.stringify(parts),
        getOrRun: (key: string, ttlMs: number, fn: () => Promise<any>) => fn()
      };
    } else {
      console.log(`✅ [${requestId}] IdempotencyMemory loaded`);
    }

    const idempotencyKey = IdempotencyMemory.generateKey({
      sessionId,
      pageNumber: pageNumber || 1,
      operationName: 'ai-visual-scene',
      promptSignature: content ? content.substring(0, 100) : ''
    });
    
    const requestHash = createRequestHash({ storyText: content, pageNumber, userInfo });

    return await IdempotencyMemory.getOrRun(idempotencyKey, 30000, async () => {
      return await executeWithLKG(requestHash, async () => {
        // generate complete visual schema
        const gen = await generateCompleteVisualSchema(
          content, userInfo, sessionId, pageNumber, directMode, null, mainCharacterAppearance, secondaryCharacters, testMode // NEW: Pass testMode for prompt capture
        );

      if (!gen.ok || !gen.visualSchema) {
        const status = gen.upstreamBackoff ? 503 : 500;
        return corsResponse({
          success:false,
          error: gen.error || 'Visual schema generation failed',
          tier:'SCHEMA_GENERATION_FAILED',
          retryAfterSeconds: gen.upstreamBackoff ? 5 : undefined
        }, req, status);
      }

      // Direct Mode: build character/cultural bundle and attempt image
      let characterSeed: any = null;
      let culturalBundle: any = null;
      let imageURL: string | undefined;
      let returnedSeed: number | null = null;
      let runwareDebugData: any = {};
      let tier = 'TIER_1_SCENE_ONLY';

      const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
      const hair = getSessionSeededHair(skinTone, sessionId, userInfo?.avatar?.type);
      const features = getSessionSeededFeatures(skinTone, sessionId);

      if (directMode) {
        characterSeed = generateCharacterSeed(sessionId, userInfo, hair, features);
        culturalBundle = { hair, features, profile: characterSeed?.culturalProfile || null, source:'inline_static' };

        const templatePayload = {
          pageText: content,
          userInfo,
          sessionId,
          pageNumber,
          avatarIdentity: { type: characterSeed.avatarType, skinTone: characterSeed.skinTone, name: characterSeed.characterName },
          templateComplexity: 'C',
          directMode: true, // ✅ Enable Direct Mode for frontend path
          primaryScene: gen.visualSchema.primaryScene, // ✅ Top-level primaryScene for simple Direct Mode
          failedTierData: {
            enhancedSceneData: gen.visualSchema.primaryScene,
            characterConsistency: `${characterSeed.characterName} is a ${characterSeed.avatarType}, age ${userInfo?.age || 6}, ${hair}, ${features}`,
            culturalEnhancements: `${hair}, ${features}`,
            coloredObjects: gen.visualSchema.coloredObjects || '',
            sceneContext: gen.visualSchema.setting || '',
            structuredAvatarData: gen.structuredAvatarData
          }
        };

        // Skip image generation in test mode
        if (!testMode) {
          const runware = await callRunwareTemplateCD(templatePayload, requestAbort);
          if (runware.ok) {
            imageURL = runware.imageURL;
            tier = 'DIRECT_MODE';
            runwareDebugData = { templateUsed: 'runware-template-cd', templateComplexity: 'C', templatePayloadSent: templatePayload };
          } else {
            console.error(`❌ [${requestId}] Direct Mode failed, falling back to Scene-Only: ${runware.error}`);
            tier = 'TIER_1_SCENE_ONLY';
          }
        } else {
          console.log(`🧪 [TEST_MODE] Skipping image generation, returning prompts only`);
          tier = 'TEST_MODE_SCENE_ONLY';
        }
      }

      const response = {
        success: true,
        tier,
        primaryScene: gen.visualSchema.primaryScene,
        enhancedPrompt: gen.visualSchema.primaryScene,
        negativePrompt: 'blurry, low quality, dark, scary, violent, inappropriate, adult content, text, watermarks',
        ...(gen.aiDebugSchema?.parseMethod === 'json' && {
          backgroundColor: gen.visualSchema.backgroundColor,
          lighting: gen.visualSchema.lighting,
          composition: gen.visualSchema.composition,
          setting: gen.visualSchema.setting,
          mood: gen.visualSchema.mood,
          style: gen.visualSchema.style,
          secondaryCharacters: gen.visualSchema.secondaryCharacters || [],
          objects: gen.visualSchema.objects || [],
          aiSchema: gen.visualSchema
        }),
        ...(directMode && characterSeed && { characterSeed }),
        ...(directMode && culturalBundle && { culturalBundle }),
        ...(gen.structuredAvatarData && { structuredAvatarData: gen.structuredAvatarData }),
        ...(directMode && returnedSeed && { seed: returnedSeed }),
        aiDebugSchema: gen.aiDebugSchema,
        ...(directMode && imageURL && runwareDebugData && { runwareDebugData }),
        ...(imageURL && { imageURL }),
        // NEW: Include prompts in test mode for debugging
        ...(testMode && gen.capturedPrompts && {
          systemPrompt: gen.capturedPrompts.systemPrompt,
          userPrompt: gen.capturedPrompts.userPrompt
        }),
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - gateStartTime,
        metadata: {
          ccsBootStatus: { loaded: ccsBootStatus.loaded, tier1: false, tier25: false, directMode: ccsBootStatus.loaded },
          sceneExtracted: !!gen.visualSchema.primaryScene
        }
      };

      return corsResponse(response, req, 200);
      }); // Close executeWithLKG
    }).then((result) => {
      // Result handling within the promise chain
      if (result instanceof Response) {
        handlerSuccess = result.status < 500 || result.status === 503;
        return result;
      }
      handlerSuccess = true;
      return corsResponse(result, req, 200);
    }).catch((outerErr) => {
      console.error('❌ [OUTER_ERROR] ai-visual-scene-creator top-level error:', String(outerErr?.message || outerErr));
      return corsResponse({ success:false, error:String(outerErr?.message || outerErr), tier:'ERROR' }, req, 500);
    }).finally(() => {
      // Clear budget timer
      clearTimeout(budgetTimer);
      
      // GUARANTEED GATE RELEASE - executes regardless of success/failure/early-return
      if (gatingEnabled && gateAcquired) {
        release(gateKey, handlerSuccess);
        gateAcquired = false;
        console.log(`🔓 [GATE] ${gateKey} released (success=${handlerSuccess})`);
      }
    });
    
    } catch (tryBlockError) {
      // Handle errors from try block (validation, parsing, etc.)
      clearTimeout(budgetTimer);
      if (gatingEnabled && gateAcquired) {
        release(gateKey, false);
        gateAcquired = false;
      }
      console.error('❌ [TRY_BLOCK_ERROR] ai-visual-scene-creator error:', String(tryBlockError?.message || tryBlockError));
      return corsResponse({ success: false, error: String(tryBlockError?.message || tryBlockError), tier: 'TRY_BLOCK_ERROR' }, req, 500);
    }
  }); // Close .then(async (payload) => { from line 964
}); // Close serve((req) => { from line 949
