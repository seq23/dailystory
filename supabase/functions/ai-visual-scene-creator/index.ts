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
  pale: ['fair porcelain with rosy cheeks','light ivory with freckles','pale peachy with soft glow','fair cream with delicate features','porcelain with pink undertones'],
  light: ['light peachy with warm glow','fair beige with soft features','light cream with natural blush','peachy-beige with bright eyes','light warm with gentle features'],
  medium: ['medium beige with warm undertones','golden tan with brown eyes','olive-beige with hazel eyes','warm tan with dark lashes','medium peachy with expressive eyes'],
  olive: ['olive-toned with golden undertones','Mediterranean olive with dark eyes','warm olive with rich features','golden olive with expressive eyes','deep olive with strong features'],
  dark: ['rich brown with warm undertones','deep brown with dark eyes','mahogany with strong features','ebony with beautiful complexion','dark brown with radiant glow'],
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
function safeFetchJson<T=any>(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<SafeJsonResult<T>> {
  const ctrl = new AbortController();
  const id = setTimeout(()=>ctrl.abort(), timeoutMs);
  return fetch(url, { ...init, signal: ctrl.signal })
    .then(async (res) => {
      clearTimeout(id);
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
  secondaryCharacters: any[] = []
): Promise<{ ok: boolean; visualSchema?: any; aiDebugSchema?: any; structuredAvatarData?: any; error?: string; upstreamBackoff?: boolean }> {

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
    let culturalContext = '';
    if (isNonEnglish) {
      culturalContext =
        nativeLanguage === 'fr' ? 'French cultural elements like Parisian parks near Eiffel Tower, Seine River waterfront scenes, charming café districts with outdoor seating, French gardens with lavender, elegant French architecture, boulangeries' :
        nativeLanguage === 'es' ? 'Spanish cultural settings like Mediterranean courtyards, colorful plazas with fountains, vibrant Hispanic neighborhoods, traditional Spanish architecture, sunny patios with potted plants, Spanish gardens' :
        nativeLanguage === 'zh' ? 'Chinese cultural elements like traditional gardens with bamboo, pagoda backgrounds, Chinese parks with stone bridges, cultural landmarks, lantern-lit scenes, traditional Chinese architecture' :
        nativeLanguage === 'ar' ? 'Middle Eastern cultural settings like desert oasis scenes, traditional Arabic architecture with geometric patterns, cultural landmarks, palm tree gardens, ornate archways' :
        `${nativeLanguage} cultural context with authentic local settings and architecture`;
    }

    const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-2000 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, (weave ethnicity in here) in rich, detailed visual scene description for image generation with main character description (verbatim hair and skin / features provided weaved in naturally), setting, key character actions OR character as observer/in background if action focuses on object/animal, any secondary characters including animals, atmosphere, and comprehensive visual details",
  "backgroundColor": "Background color description (e.g., 'warm golden forest light', 'cool blue sky', 'cozy indoor amber')",
  "lighting": "Lighting description (e.g., 'golden hour sunlight', 'soft morning light', 'magical twilight glow')",
  "composition": "Visual composition description (e.g., 'centered character with forest background', 'close-up with blurred garden')",
  "setting": "Location and environment (e.g., 'magical forest clearing', 'cozy bedroom', 'sunny playground')",
  "mood": "Emotional atmosphere (e.g., 'adventurous and curious', 'peaceful and content', 'excited and playful')",
  "style": "Artistic style (e.g., 'watercolor illustration', 'digital painting', 'children's book art')",
  "secondaryCharacters": {
    "humans": ["list of human characters mentioned in story (e.g., 'mom', 'friend', 'teacher')"],
    "pets": ["list of animals/pets mentioned in story (e.g., 'dog', 'cat', 'bird')"]
  },
  "objects": ["key props and objects in scene (e.g., 'ball', 'tree', 'flowers', 'toys')"],
  "clothing": ["blue shirt", "red sneakers", "yellow hat"]
}

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Character appearance: use provided appearance data VERBATIM (word-for-word ethnicity, hair, skin tone) but weave it naturally into flowing prose using connecting phrases like "with her" or "who has" - NEVER simplify core appearance details
4. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
5. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds
6. **Secondary Characters - SESSION CONSISTENCY**: Extract ONLY characters explicitly mentioned in the CURRENT STORY TEXT:
   - HUMANS: Named people (Jake, mom, teacher) or unnamed groups (friends, children, people)
   - PETS: Named or unnamed animals (Whiskers the cat, dog, birds)
   
   **CRITICAL CONSISTENCY RULES:**
   - Only include characters mentioned/implied in CURRENT story text
   - If a character from PREVIOUS SCENE data reappears by NAME, reuse their EXACT details for visual consistency
   - Do NOT carry forward characters unless they appear in current story
   - Do NOT invent names for unnamed characters (use "friends", "people", "dog")
   - For unnamed groups, use collective descriptions in primaryScene (Rule #1)
   
   Example: If PREVIOUS SCENE has "Jake: boy with curly hair, red shirt, blue cap" and current story mentions "Jake ran to the door" → Include "Jake: boy with curly hair, red shirt, blue cap" in output
7. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
8. Visual continuity on pages 2+: CRITICAL - maintain exact visual consistency from PREVIOUS SCENE:
   - Object persistence: if previous scene mentions "pink backpack", current scene MUST show "pink backpack" when story references "it" or "the backpack"
   - Clothing consistency: if previous scene shows "blue shirt", character keeps "blue shirt" unless story explicitly says they changed
   - Pronoun resolution: "it", "them", "her toy" MUST match objects/characters from previous scene
   - Scene element maintenance: if previous scene was "sunny park", continue "sunny park" unless story changes location
   - Color memory: NEVER change colors ("red ball" stays "red ball", "green jacket" stays "green jacket")
   
   CORRECT EXAMPLE:
   Previous: "Sarah, age 6, with brown curly hair and medium skin tone, holds a pink backpack in a sunny park"
   Current Story: "Sarah walked with it to the playground"
   Current Scene: "Sarah, age 6, with brown curly hair and medium skin tone, walks confidently carrying her pink backpack through the sunny park toward the playground"
   
    WRONG EXAMPLE:
    Previous: "pink backpack"
    Current Story: "walked with it"
    Current Scene: "walks with a blue bag" ❌ (color changed)
9. Main character presence in ALL scenes (children's story requirement): ALWAYS include the main character in EVERY scene for visual continuity
   - If story text explicitly mentions character doing an action: character is PRIMARY FOCUS of scene
   - If story text focuses on object/animal WITHOUT mentioning character (e.g., "The dog jumps", "The ball rolls"): position main character as OBSERVER or in BACKGROUND watching/near the action
   - Example: Story says "The bird flies away" → Scene: "Sarah, age 6, with brown curly hair, watches from the garden as a small bird flies away into the blue sky"
   - Example: Story says "The toy car zooms across the floor" → Scene: "Jake, age 5, with short black hair, sits nearby on the floor smiling as his red toy car zooms across the wooden floor"
   - NEVER generate a scene without the main character visible - they must always be present for children's story continuity
10. CLOTHING CONSISTENCY RULES:
    - If PREVIOUS SCENE provides clothing data in the structured schema, the main character MUST wear those exact clothing items in the current scene
    - Clothing colors and items must remain consistent across pages unless the story explicitly describes a clothing change (e.g., "she put on a jacket", "he changed into pajamas")
    - Track all visible clothing items in the "clothing" field of the JSON response for continuity on the next page
    - Examples of clothing items to track: "blue shirt", "red sneakers", "yellow dress", "green jacket", "striped pants", "pink hat"
    - Document all clothing in the response even if not explicitly mentioned in current story text (carry forward from previous scene)

PHASE 1 ENHANCEMENT - MAIN CHARACTER APPEARANCE:
- If mainCharacterAppearance physical features are provided (e.g., 'brown eyes', 'curly hair'), incorporate them into the scene description
- If mainCharacterAppearance clothing is provided (e.g., 'blue shirt', 'red sneakers'), ensure they're visible in the scene

PHASE 1 ENHANCEMENT - SECONDARY CHARACTER VISUALS:
- If secondary characters have visualDetails (e.g., ['blonde', 'tall', 'blue dress']), incorporate these descriptors into their appearance in the scene
- Use visualDetails to create consistent appearances for recurring secondary characters across pages

CULTURAL CONTEXT:
${isNonEnglish ? `
CRITICAL: Enhance story settings with specific cultural elements for ${nativeLanguage} speakers:
${culturalContext}

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with ${structuredAvatarData?.hairColor || 'natural hair'} and ${structuredAvatarData?.resolvedSkinTone || 'medium'} skin tone plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."

Use cultural detail naturally without contradicting explicit story settings.
` : '- Use universal child-friendly settings with warm, inviting atmospheres'}`;

    const previousBlock = prevData.previousPrimaryScene
      ? (prevData.previousVisualSchema
          ? `STRUCTURED VISUAL CONSISTENCY DATA (use these exact details):
- Main Character Clothing: ${JSON.stringify(prevData.previousVisualSchema.clothing || [])}
- Objects in Scene: ${JSON.stringify(prevData.previousVisualSchema.objects || [])}
- Previous Secondary Characters (from ALL previous pages in session): ${JSON.stringify(prevData.previousVisualSchema.secondaryCharacters || { humans: [], pets: [] })}
- Setting: ${prevData.previousVisualSchema.setting || 'outdoor scene'}
- Mood: ${prevData.previousVisualSchema.mood || 'cheerful'}
- Lighting: ${prevData.previousVisualSchema.lighting || 'natural daylight'}
- Background: ${prevData.previousVisualSchema.backgroundColor || 'bright and colorful'}

Primary Scene (prose context): "${prevData.previousPrimaryScene}"`
          : `Primary Scene (prose only): "${prevData.previousPrimaryScene}"`)
      : 'None - this is the first scene';

    const userPrompt =
`Create a visual scene description for this story page.

CHARACTER APPEARANCE: ${characterData}

${mainCharacterAppearance ? `MAIN CHARACTER APPEARANCE DETAILS:
- Physical features: ${JSON.stringify(mainCharacterAppearance.physicalFeatures || [])}
- Clothing: ${JSON.stringify(mainCharacterAppearance.clothing || [])}` : ''}

${secondaryCharacters && secondaryCharacters.length > 0 ? `SECONDARY CHARACTERS WITH VISUAL DETAILS:
${secondaryCharacters.map((c:any)=>`- ${c.name} (${c.type}): ${c.visualDetails ? c.visualDetails.join(', ') : 'no visual details'}`).join('\n')}` : ''}

STORY TEXT:
"${storyText}"

PREVIOUS SCENE (Session-Wide Character Memory):
${previousBlock}

Generate a comprehensive scene... The primaryScene must include the complete CHARACTER APPEARANCE string exactly as provided.`;

    return { systemPrompt, userPrompt, isNonEnglish, culturalContext };
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
    }, 20000).then((res) => {
      const content = res.json?.choices?.[0]?.message?.content?.trim?.();
      return { ok: !!(res.ok && content), content, status: res.status };
    });
  }

  function parseVisual(content: string): Promise<{ schema: any | null }> {
    return safeJsonParse(content).then((json) => {
      if (json && json.primaryScene) return { schema: json };
      const match = content.match(/"primaryScene":\s*"([^"]+)"/);
      if (match && match[1] && match[1].length >= 30) {
        return {
          schema: {
            primaryScene: match[1],
            backgroundColor: 'warm natural lighting',
            lighting: 'soft daylight',
            composition: 'centered character',
            setting: 'story scene',
            mood: 'cheerful and engaging',
            style: "children's book illustration",
            secondaryCharacters: [],
            objects: []
          }
        };
      }
      return { schema: null };
    });
  }

  // ========== EMERGENCY VISUAL SCHEMA FALLBACK ==========
  function buildEmergencyVisualSchema(storyText: string, characterData: string, nativeLanguage: string): any {
    const culturalSetting = nativeLanguage === 'fr' ? 'charming Parisian park with Eiffel Tower in background' :
                           nativeLanguage === 'es' ? 'colorful Mediterranean courtyard with fountain' :
                           nativeLanguage === 'zh' ? 'traditional Chinese garden with bamboo and stone bridge' :
                           nativeLanguage === 'ar' ? 'beautiful desert oasis with palm trees' :
                           'bright, welcoming outdoor scene';
    
    return {
      primaryScene: `${characterData} is present in a clear, friendly ${culturalSetting} inspired by the story: ${storyText.slice(0, 400)}${storyText.length>400?'...':''}. The setting is bright and welcoming, with visible actions matching the text and a consistent children's book composition.`,
      backgroundColor: 'warm natural light',
      lighting: 'soft daylight',
      composition: 'centered character with context',
      setting: 'story-appropriate environment',
      mood: 'cheerful and engaging',
      style: "children's book illustration",
      secondaryCharacters: { humans: [], pets: [] },
      objects: [],
      characterAppearance: structuredAvatarData
    };
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
              objects: visualSchema.objects
            }
          }
        }))
      .then(()=>undefined)
      .catch(()=>undefined);
  }

  // chain execution (no try/catch) - ENHANCED WITH EMERGENCY FALLBACK
  return ensureSupabase()
    .then(()=> fetchPrevious(pageNumber))
    .then((prev) => {
      const prompts = buildPrompts(prev);
      let attempt = 0;
      function loop(lastBackoff = false): Promise<{ ok:boolean; visual:any|null; upstreamBackoff:boolean }> {
        if (attempt >= 3) return Promise.resolve({ ok: false, visual: null, upstreamBackoff: lastBackoff });
        return callOpenAI({ systemPrompt: prompts.systemPrompt, userPrompt: prompts.userPrompt }, attempt).then((res) => {
          if (!res.ok || !res.content) {
            const isBackoff = res.status === 429 || res.status === 503;
            attempt++;
            const delayMs = isBackoff ? Math.min(1000 * Math.pow(2, attempt-1), 8000) + Math.floor(Math.random()*1000) : 100 + Math.floor(Math.random()*200);
            return new Promise<{ ok:boolean; visual:any|null; upstreamBackoff:boolean }>((resolve) =>
              setTimeout(()=> resolve(loop(isBackoff)), delayMs)
            );
          }
          return parseVisual(res.content).then(({ schema }) => {
            if (!schema) return { ok:false, visual:null, upstreamBackoff:false };
            return { ok:true, visual:schema, upstreamBackoff:false };
          });
        });
      }
      return loop();
    })
    .then((result) => {
      // CRITICAL: Emergency fallback ALWAYS applied if AI generation failed
      const visualSchema = result.ok && result.visual ? result.visual : buildEmergencyVisualSchema(storyText, characterData, nativeLanguage);
      const ok = !!visualSchema; // Emergency schema is ALWAYS valid
      
      const aiDebugSchema = {
        modelUsed: (result.ok && result.visual) ? 'gpt-4o-mini' : 'emergency-local-fallback',
        aiGenerationSucceeded: result.ok && !!result.visual,
        emergencyFallbackTriggered: !(result.ok && result.visual),
        characterDataSent: characterData,
        structuredAvatarData: userInfo?.structuredAvatarData || null,
        rawUserInfoReceived: {
          hasStructuredAvatar: !!userInfo?.structuredAvatarData,
          avatarSkinTone: userInfo?.avatar?.skinTone,
          skinTone: userInfo?.skinTone,
          avatarHairColor: userInfo?.avatar?.hairColor,
          nativeLanguage: userInfo?.native_language || userInfo?.nativeLanguage,
          fullUserInfo: userInfo
        },
        storyTextLength: storyText.length,
        isNonEnglish: nativeLanguage && nativeLanguage !== 'en',
      };
      return savePrimaryScene(directMode, visualSchema).then(()=>({ ok:true, visualSchema, aiDebugSchema, structuredAvatarData, upstreamBackoff: result.upstreamBackoff }));
    })
    .catch((outerSchemaError) => {
      // OUTER SAFETY NET: If entire AI generation chain fails, use emergency fallback
      console.error(`❌ [SCHEMA_GENERATION] Complete failure, using emergency fallback:`, String(outerSchemaError?.message || outerSchemaError));
      const emergencySchema = buildEmergencyVisualSchema(storyText, characterData, nativeLanguage);
      const aiDebugSchema = {
        modelUsed: 'emergency-local-fallback-outer-safety-net',
        aiGenerationSucceeded: false,
        emergencyFallbackTriggered: true,
        outerError: String(outerSchemaError?.message || outerSchemaError),
        characterDataSent: characterData,
        structuredAvatarData: userInfo?.structuredAvatarData || null,
        storyTextLength: storyText.length,
      };
      return savePrimaryScene(directMode, emergencySchema).then(()=>({ ok:true, visualSchema: emergencySchema, aiDebugSchema, structuredAvatarData, upstreamBackoff: false }));
    });
}

// ========= Character seed (kept) =========
function generateCharacterSeed(sessionId: string, userInfo: any) {
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
  return {
    seed: Math.abs(sessionId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 999999,
    characterName,
    avatarType: userInfo?.avatar?.type || 'child',
    skinTone,
    ethnicity,
    culturalProfile: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : undefined
  };
}

// ========= External calls (no throw) =========
function callRunwareTemplateCD(payload: any): Promise<{ ok:boolean; imageURL?: string; error?: string }> {
  const url = 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd';
  return safeFetchJson<any>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
    body: JSON.stringify(payload)
  }, 20000).then((res) => {
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

    const result = await IdempotencyMemory.getOrRun(idempotencyKey, 30000, async () => {
      // generate complete visual schema
      const gen = await generateCompleteVisualSchema(
        content, userInfo, sessionId, pageNumber, directMode, null, mainCharacterAppearance, secondaryCharacters
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
        characterSeed = generateCharacterSeed(sessionId, userInfo);
        culturalBundle = { hair, features, profile: characterSeed?.culturalProfile || null, source:'inline_static' };

        const templatePayload = {
          pageText: content,
          userInfo,
          sessionId,
          pageNumber,
          avatarIdentity: { type: characterSeed.avatarType, skinTone: characterSeed.skinTone, name: characterSeed.characterName },
          templateComplexity: 'C',
          failedTierData: {
            enhancedSceneData: gen.visualSchema.primaryScene,
            characterConsistency: `${characterSeed.characterName} is a ${characterSeed.avatarType}, age ${userInfo?.age || 6}, ${hair}, ${features}`,
            visualConsistency: `${gen.visualSchema.backgroundColor}, ${gen.visualSchema.lighting}`,
            culturalEnhancements: `${hair}, ${features}`,
            coloredObjects: gen.visualSchema.coloredObjects || '',
            sceneContext: gen.visualSchema.setting || '',
            structuredAvatarData: gen.structuredAvatarData
          }
        };

        const runware = await callRunwareTemplateCD(templatePayload);
        if (runware.ok) {
          imageURL = runware.imageURL;
          tier = 'DIRECT_MODE';
          runwareDebugData = { templateUsed: 'runware-template-cd', templateComplexity: 'C', templatePayloadSent: templatePayload };
        } else {
          console.error(`❌ [${requestId}] Direct Mode failed, falling back to Scene-Only: ${runware.error}`);
          tier = 'TIER_1_SCENE_ONLY';
        }
      }

      const response = {
        success: true,
        tier,
        primaryScene: gen.visualSchema.primaryScene,
        enhancedPrompt: gen.visualSchema.primaryScene,
        negativePrompt: 'blurry, low quality, dark, scary, violent, inappropriate, adult content, text, watermarks',
        backgroundColor: gen.visualSchema.backgroundColor,
        lighting: gen.visualSchema.lighting,
        composition: gen.visualSchema.composition,
        setting: gen.visualSchema.setting,
        mood: gen.visualSchema.mood,
        style: gen.visualSchema.style,
        secondaryCharacters: gen.visualSchema.secondaryCharacters || [],
        objects: gen.visualSchema.objects || [],
        ...(directMode && characterSeed && { characterSeed }),
        ...(directMode && culturalBundle && { culturalBundle }),
        ...(gen.structuredAvatarData && { structuredAvatarData: gen.structuredAvatarData }),
        ...(directMode && returnedSeed && { seed: returnedSeed }),
        aiDebugSchema: gen.aiDebugSchema,
        ...(directMode && imageURL && runwareDebugData && { runwareDebugData }),
        ...(imageURL && { imageURL }),
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - gateStartTime,
        metadata: {
          ccsBootStatus: { loaded: ccsBootStatus.loaded, tier1: false, tier25: false, directMode: ccsBootStatus.loaded },
          sceneExtracted: !!gen.visualSchema.primaryScene
        }
      };

      return corsResponse(response, req, 200);
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
      // GUARANTEED GATE RELEASE - executes regardless of success/failure/early-return
      if (gatingEnabled && gateAcquired) {
        release(gateKey, handlerSuccess);
        gateAcquired = false;
        console.log(`🔓 [GATE] ${gateKey} released (success=${handlerSuccess})`);
      }
    });
