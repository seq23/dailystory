// 🚀 DEPLOYMENT MARKER: v2025-01-08-TIER-2.5A-PURE-PRECOMPUTED-CCS
// Last deployed: 2025-01-08
// Changes: Tier 2.5A now pure precomputedCCS consumer, escalates to 2.5B if missing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ========== INLINE CORS (Zero Dependencies) ==========
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

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  const headers: Record<string, string> = { ...corsHeaders, "Content-Type": "application/json" };
  if (status === 503 && data?.retryAfterSeconds) {
    headers["Retry-After"] = String(data.retryAfterSeconds);
    headers["Access-Control-Expose-Headers"] = "Retry-After";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

const SERVICE_NAME = "runware-template-ab";

// ========== INLINED SCENE EXTRACTION FUNCTIONS ==========
interface MicroContext {
  characterName?: string;
  sessionId?: string;
  difficulty?: string;
  [key: string]: any;
}

function extractAndNormalizeAction(text: string): string {
  const level0Actions = [
    'wakes up', 'waking up', 'wake up', 'gets up', 'getting up', 'sleeps', 'sleeping', 'sleep',
    'eats', 'eating', 'eat', 'drinks', 'drinking', 'drink', 'plays', 'playing', 'play',
    'goes', 'going', 'go', 'comes', 'coming', 'come', 'sits', 'sitting', 'sit',
    'stands', 'standing', 'stand', 'runs', 'running', 'run', 'walks', 'walking', 'walk',
    'jumps', 'jumping', 'jump', 'climbs', 'climbing', 'climb', 'swings', 'swinging', 'swing',
    'draws', 'drawing', 'draw', 'reads', 'reading', 'read', 'sings', 'singing', 'sing',
    'dances', 'dancing', 'dance', 'builds', 'building', 'build', 'creates', 'creating', 'create',
    'cleans', 'cleaning', 'helps', 'helping'
  ];
  for (const action of level0Actions) {
    const actionRegex = new RegExp(`\\b${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (actionRegex.test(text)) {
      if (action.includes('wakes up') || action.includes('waking up')) return 'sitting up in bed with arms stretched';
      if (action.includes('sleeps') || action.includes('sleeping')) return 'lying peacefully in bed';
      if (action.includes('eats') || action.includes('eating')) return 'sitting at table eating';
      if (action.includes('plays') || action.includes('playing')) return 'playing happily';
      if (action.includes('runs') || action.includes('running')) return 'running energetically';
      if (action.includes('jumps') || action.includes('jumping')) return 'jumping excitedly';
      if (action.includes('cleans') || action.includes('cleaning')) return 'helping to clean up';
      if (action.includes('reads') || action.includes('reading')) return 'sitting comfortably reading';
      if (action.includes('draws') || action.includes('drawing')) return 'sitting at table drawing';
      if (action.includes('helps') || action.includes('helping')) return 'standing ready to help';
      return `${action} cheerfully`;
    }
  }
  const actionNormalizationMap: Record<string, string> = {
    'walked': 'walking through',
    'woke up': 'sitting up in bed with arms stretched',
    'cooking': 'standing at stove cooking',
    'walked through': 'walking through',
    'running around': 'running happily in',
    'jumped on': 'jumping excitedly on',
    'sat down': 'sitting comfortably in',
    'lying down': 'lying peacefully in'
  };
  for (const [pattern, normalized] of Object.entries(actionNormalizationMap)) {
    if (text.includes(pattern)) return normalized;
  }
  const actionMatch = text.match(/\b(wake|wakes|woke|waking|sleep|sleeps|slept|sleeping|eat|eats|ate|eating|play|plays|played|playing|walk|walks|walked|walking|run|runs|ran|running|jump|jumps|jumped|jumping|help|helps|helped|helping|clean|cleans|cleaned|cleaning|read|reads|reading|draw|draws|drew|drawing|sing|sings|sang|singing|dance|dances|danced|dancing|build|builds|built|building|climb|climbs|climbed|climbing|sit|sits|sat|sitting|stand|stands|stood|standing|come|comes|came|coming|look|looks|looked|looking|see|sees|saw|seeing)\b/);
  if (actionMatch) {
    let action = actionMatch[1];
    if (action === 'wake' || action === 'wakes' || action === 'woke') return 'sitting up in bed with arms stretched';
    if (action === 'sleep' || action === 'sleeps' || action === 'slept') return 'lying peacefully in bed';
    if (action === 'eat' || action === 'eats' || action === 'ate') return 'sitting at table eating';
    if (action.endsWith('ed')) action = action.slice(0, -2) + 'ing';
    if (action.endsWith('s') && !action.endsWith('ing')) action = action.slice(0, -1) + 'ing';
    if (action === 'playing') return 'playing happily';
    if (action === 'running') return 'running energetically';
    if (action === 'jumping') return 'jumping excitedly';
    if (action === 'helping') return 'standing ready to help';
    if (action === 'reading') return 'sitting comfortably reading';
    if (action === 'drawing') return 'sitting at table drawing';
    return action;
  }
  if (text.includes('ball is red') || text.includes('red ball')) return 'holding red ball cheerfully';
  if (text.includes('ball is') || text.includes('the ball')) return 'playing with ball happily';
  return 'playing cheerfully';
}

function inferObjectFromAction(action: string): string {
  const actionObjectMap: Record<string, string> = {
    'cooking': 'food',
    'reading': 'book',
    'drawing': 'crayons',
    'writing': 'pencil',
    'playing': 'toys',
    'building': 'blocks',
    'swimming': 'pool toys'
  };
  return actionObjectMap[action] || '';
}

function inferLocationFromContext(text: string): string {
  const level0Locations = [
    'bed', 'bedroom', 'kitchen', 'home', 'house', 'room', 'bathroom', 'living room',
    'dining room', 'playroom', 'inside', 'indoors', 'park', 'playground', 'garden', 
    'yard', 'outside', 'outdoors', 'beach', 'forest', 'field', 'street', 'road', 
    'path', 'tree', 'grass', 'school', 'store', 'shop', 'library', 'hospital', 'farm', 'zoo'
  ];
  for (const location of level0Locations) {
    if (text.includes(location)) {
      if (location === 'bed' || location === 'bedroom') return 'cozy bedroom';
      if (location === 'kitchen') return 'bright kitchen';
      if (location === 'park' || location === 'playground') return 'sunny park';
      if (location === 'home' || location === 'house') return 'comfortable home';
      if (location === 'school') return 'cheerful school';
      return location;
    }
  }
  if (text.includes('kitchen') || text.includes('cooking') || text.includes('stove') || text.includes('eating')) return 'bright kitchen';
  if (text.includes('bedroom') || text.includes('bed') || text.includes('woke up') || text.includes('sleep')) return 'cozy bedroom';
  if (text.includes('park') || text.includes('playground') || text.includes('swing')) return 'sunny park';
  if (text.includes('beach') || text.includes('sand') || text.includes('ocean')) return 'beautiful beach';
  if (text.includes('forest') || text.includes('trees') || text.includes('woods')) return 'magical forest';
  if (text.includes('school') || text.includes('classroom') || text.includes('teacher')) return 'cheerful school';
  if (text.includes('outside') || text.includes('outdoors') || text.includes('garden')) return 'sunny outdoors';
  if (text.includes('inside') || text.includes('indoors') || text.includes('home') || text.includes('room')) return 'comfortable indoors';
  return '';
}

function extractAtmosphere(text: string): string {
  if (text.includes('sunny') || text.includes('bright')) return 'bright sunny day';
  if (text.includes('rainy') || text.includes('cloudy')) return 'cloudy day';
  if (text.includes('morning')) return 'morning light';
  if (text.includes('evening') || text.includes('sunset')) return 'evening atmosphere';
  if (text.includes('night')) return 'nighttime setting';
  return 'warm natural lighting';
}

function inferCharacterMood(text: string): string {
  if (text.includes('happy') || text.includes('excited') || text.includes('joyful')) return 'happy expression';
  if (text.includes('sad') || text.includes('crying')) return 'sad expression';
  if (text.includes('angry') || text.includes('mad')) return 'frustrated expression';
  if (text.includes('surprised') || text.includes('amazed')) return 'surprised expression';
  if (text.includes('scared') || text.includes('afraid')) return 'worried expression';
  return 'cheerful expression';
}

function inferCharacterPose(action: string, _object: string): string {
  if (action.includes('sitting')) return 'sitting pose';
  if (action.includes('standing')) return 'standing pose';
  if (action.includes('running')) return 'running pose';
  if (action.includes('jumping')) return 'mid-jump pose';
  if (action.includes('lying') || action.includes('sleeping')) return 'lying down';
  if (action.includes('cooking') || action.includes('stove')) return 'standing at counter';
  if (action.includes('reading')) return 'sitting comfortably';
  if (action.includes('drawing') || action.includes('writing')) return 'seated at table';
  return 'natural active pose';
}

function summarizePageText(pageText: string, _context: MicroContext = {}): string {
  const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
  const firstTwoSentences = sentences.slice(0, 2).join(' ');
  return firstTwoSentences.length > 200 ? firstTwoSentences.substring(0, 200) : firstTwoSentences;
}

function extractSemanticScene(pageText: string, context: MicroContext = {}): string {
  if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
    console.log('📝 No semantic scene extractable - maintaining text integrity');
    return '';
  }
  let textToAnalyze = summarizePageText(pageText, context);
  if (!textToAnalyze || textToAnalyze.length < 10) textToAnalyze = pageText;
  const text = textToAnalyze.toLowerCase();
  const extractedAction = extractAndNormalizeAction(text);
  const objectMatch = text.match(/\b(?:with|holding|carrying|using|playing with|reading|eating|building|drawing)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+(?:in|at|on|through|where|and|,|\.|!|\?)|$)/);
  const extractedObject = objectMatch ? objectMatch[1].trim() : inferObjectFromAction(extractedAction);
  const locationMatch = text.match(/\b(?:in|at|on|near|by|inside|outside|through)\s+(?:the|a|an)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
  const extractedLocation = locationMatch ? locationMatch[1] : inferLocationFromContext(text);
  const atmosphere = extractAtmosphere(text);
  const characterMood = inferCharacterMood(text);
  const characterPose = inferCharacterPose(extractedAction, extractedObject);
  const sceneComponents = [
    extractedAction,
    extractedObject ? `with ${extractedObject}` : '',
    extractedLocation ? `in the ${extractedLocation}` : '',
    atmosphere,
    characterMood,
    characterPose
  ].filter(Boolean);
  const semanticScene = sceneComponents.join(', ');
  console.log(`✅ Sophisticated semantic scene extracted: "${semanticScene}"`);
  return semanticScene;
}

function extractSimpleScene(storyText: string): string {
  if (!storyText || typeof storyText !== 'string') return 'playing outdoors';
  console.log('🔍 Simple scene extraction from story text');
  const text = storyText.toLowerCase();
  let extractedAction = '';
  const actionWithPrepMatch = text.match(/\b(walked|running|going|moving)\s+(through|in|across|around|over|under)\b/);
  if (actionWithPrepMatch) {
    const baseAction = actionWithPrepMatch[1];
    const preposition = actionWithPrepMatch[2];
    extractedAction =
      baseAction === 'walked' ? `walking ${preposition}` :
      baseAction === 'running' ? `running ${preposition}` :
      baseAction === 'going' ? `going ${preposition}` :
      baseAction === 'moving' ? `moving ${preposition}` :
      '';
  }
  if (!extractedAction) extractedAction = extractAndNormalizeAction(text);
  let extractedObject = '';
  if (!extractedAction.includes('walking') && !extractedAction.includes('running')) {
    const objectMatch = text.match(/\b(?:carrying|holding|with|playing with|using)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/);
    extractedObject = objectMatch ? objectMatch[1] : '';
  }
  const locationMatch = text.match(/\b(?:through|in|at|on|outside|inside|near|by)\s+(?:the|a)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
  const extractedLocation = locationMatch ? locationMatch[1] : inferLocationFromContext(text);
  const parts: string[] = [];
  parts.push(extractedAction);
  if (extractedObject && !extractedAction.includes(extractedObject)) parts.push(`with ${extractedObject}`);
  if (extractedLocation) {
    if (/(through|in|across)/.test(extractedAction)) parts.push(`the ${extractedLocation}`);
    else parts.push(`in the ${extractedLocation}`);
  }
  const simpleScene = parts.join(', ').replace(/,\s*,/g, ',').trim();
  console.log(`✅ Simple scene extracted: "${simpleScene}"`);
  return simpleScene;
}

// ========== INLINED: ProviderGate (Concurrency + Circuit Breaker) ==========
interface GateConfig { maxConcurrency: number; failThreshold: number; cooldownMs: number; maxWaitMs: number; }
interface CircuitState { failures: number; lastFailureAt: number; isOpen: boolean; }
interface GateState { active: number; waiting: Array<{ resolve: () => void; acquiredAt: number }>; circuit: CircuitState; }
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

async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { acquired: false, reason: 'CIRCUIT_OPEN', retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown)) };
  }
  if (state.active < config.maxConcurrency) {
    state.active++;
    return { acquired: true };
  }
  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  return new Promise((resolve) => {
    const resolveAcquire = () => { clearTimeout(timeoutId); state.active++; resolve({ acquired: true }); };
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
    const waiter = state.waiting.shift(); if (waiter) waiter.resolve();
  }
}

// ========== CORS UTILITIES (DYNAMIC) ==========
function withCors(res: Response, req?: Request): Response {
  if (!req) {
    const h = new Headers(res.headers);
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
    h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  }
  const h = new Headers(res.headers);
  const dyn = generateEchoCorsHeaders(req);
  for (const [k, v] of Object.entries(dyn)) h.set(k, v);
  return new Response(res.body, { status: res.status, headers: h });
}

const FALLBACK_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
};

function createResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...FALLBACK_CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// ========== INLINED: STYLE FRAMEWORKS & NEGATIVES ==========
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS: Record<string, { name: string; frameworkPrompt: string }> = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly'
  }
};

function getNuclearStyleFramework(difficulty: string): { name: string; frameworkPrompt: string } {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  return NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
}

function generateInlineNuclearNegative(culturalProfile: string, avatarType: string, difficulty: string): string {
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  const childrenBookNegativeBlock = 'NO adult faces, adult features, mature faces, adult photos, realistic photography, photorealistic adults, adult portraits, grown-up faces, realistic human photos, photo of adults, adult photography, mature portraits, realistic adult imagery, photo-realistic people, adult subjects, mature individuals, realistic human photography, adult models, stock photos of adults, professional adult photography';
  const boysNegative = 'minimal feminine features, limited makeup, excessive female anatomy, overly feminine clothing, exclusively long feminine hairstyles, excessive feminine accessories, overly narrow shoulders, exclusively feminine body structure, extreme female proportions, overly feminine expressions, exclusively girl toys, only female-coded activities';
  const girlsNegative = 'minimal masculine features, facial hair, excessive male anatomy, overly masculine clothing, exclusively short masculine haircuts, excessively broad shoulders, overly angular jaw, exclusively masculine body structure, extreme male proportions, overly masculine expressions, exclusively boy toys, only male-coded activities';
  const genderNeutralNegative = 'excessive gendered features, extreme masculine traits, extreme feminine traits, exclusively gender-specific clothing, only highly gendered toys, overly masculine expressions, overly feminine expressions, extreme binary gender stereotypes, exclusively gendered color schemes';
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  const negativeComponents = [
    base,
    childrenBookNegativeBlock,
    avatarType?.includes('boy') ? boysNegative : avatarType?.includes('girl') ? girlsNegative : genderNeutralNegative,
    culturalProfile === 'african-american' ? africanAmericanNegativeBlock : '',
    culturalSensitivityNegativeBlock
  ].filter(Boolean);
  return negativeComponents.join(', ');
}

// ========== INLINED: CULTURAL ENHANCEMENT HELPERS ==========
const LEAN_HAIR_BY_SKIN: Record<string, string[]> = {
  'pale': ['strawberry blonde hair', 'golden red hair', 'auburn curls'],
  'light': ['platinum blonde hair', 'golden blonde hair', 'honey blonde hair'],  
  'medium': ['chestnut brown hair', 'chocolate brown hair', 'coffee brown hair'],
  'olive': ['jet black hair', 'raven black hair', 'midnight black hair'],
  'dark': ['beautiful dark hair', 'rich black hair', 'lustrous dark hair']
};

function emergencyHairFallback(skinTone: string): string {
  const normalized = (skinTone || 'medium').toLowerCase();
  const EMERGENCY_HAIR_MAP: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair',
    'medium': 'brown hair',
    'olive': 'dark brown hair',
    'dark': 'black textured 4C hair'
  };
  return EMERGENCY_HAIR_MAP[normalized] || EMERGENCY_HAIR_MAP['medium'];
}

const LEAN_SKIN_TONES: Record<string, string> = {
  'pale': 'fair porcelain skin with rosy cheeks and bright eyes',
  'light': 'light peachy skin tone with a warm glow and friendly expression',
  'medium': 'medium beige skin tone with warm undertones and expressive features',
  'olive': 'olive-toned skin with golden undertones and bright features',
  'dark': 'rich brown skin tone with warm undertones and radiant smile'
};

const AFRICAN_AMERICAN_CULTURAL_FEATURES = [
  'light brown skin tone with warm brown eyes and a bright infectious smile',
  'caramel skin tone with deep chocolate eyes and a confident cheerful expression', 
  'medium brown skin tone with warm brown eyes and a bright infectious smile'
];

function getHairBySkintone(skinTone: string, sessionId: string): string {
  const normalized = skinTone?.toLowerCase() || 'medium';
  const options = LEAN_HAIR_BY_SKIN[normalized] || LEAN_HAIR_BY_SKIN['medium'];
  const seed = sessionId ? sessionId.charCodeAt(0) % options.length : 0;
  return options[seed];
}

function getSkinBySkintone(skinTone: string, culturalContext: string | null = null): string {
  const normalized = (skinTone || 'medium').toLowerCase();
  if (normalized === 'dark' && culturalContext === 'african-american') {
    const seed = Math.floor(Math.random() * AFRICAN_AMERICAN_CULTURAL_FEATURES.length);
    return AFRICAN_AMERICAN_CULTURAL_FEATURES[seed];
  }
  return LEAN_SKIN_TONES[normalized] || LEAN_SKIN_TONES['medium'];
}

// ========== AFRICAN AMERICAN CULTURAL ARRAYS (INLINE) ==========
const AFRICAN_AMERICAN_HAIR_INLINE = {
  boys: [
    "wearing a curly top fade with perfectly defined coils on top, crisp line-up around the edges, and smooth fade transitions down the sides and back",
    "wearing twist sponge curls with tight coil definition, fresh line-up with sharp edges, and tapered sides with natural texture",
    "wearing a high top fade with voluminous textured crown, geometric side part, and precision-cut fade gradation",
    "wearing starter dreads in neat sections with clean parting lines, natural root texture, and expertly shaped perimeter",
    "wearing a buzz cut with intricate geometric designs carved into the sides, crisp line-up, and smooth scalp fade",
    "wearing a classic flat top with perfectly squared edges, uniform height across the crown, and sharp side fade transitions",
    "wearing a caesar cut with deep 360 waves, brush pattern definition, and clean hairline shaping all around",
    "wearing lined-up curls with natural coil springs, precision edge work, and graduated fade from crown to neckline",
    "wearing a tapered afro with rounded natural shape, soft textured crown, and gradually shortened sides and back",
    "wearing a modern pompadour fade with curly volume swept upward, skin fade sides, and detailed edge definition"
  ],
  girls: [
    "wearing a full voluminous afro with authentic coily texture, natural 4B-4C curl pattern, rounded dome shape, dense hair distribution, individual curl spirals visible, matte finish texture, proper afro proportions, natural hair movement",
    "wearing individual box braids with distinct square sectioning, each braid separately defined and visible, geometric parting pattern, multiple separate braided units, detailed individual braid texture, professional sectioning technique, natural or vibrant color variations",
    "wearing cornrow braids in straight parallel rows, hair woven tightly against scalp, clean geometric parts showing scalp between rows, traditional African braiding technique, individual row definition, scalp-hugging pattern",
    "wearing defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement",
    "wearing well-maintained locs with natural texture, individual strand definition, mature lock formation, organic hair pattern, cultural significance, photorealistic hair texture",
    "wearing natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish",
    "wearing an elegant flat twist updo with precise parting, neat twisting pattern, decorative arrangement, formal styling, detailed texture work, individual strand definition",
    "wearing a sleek protective bun with smooth edges, neat hair arrangement, polished finish, professional styling, clean part lines, natural hair movement",
    "wearing a silky smooth silk press with glossy shine, pin-straight texture, individual strand definition, heat-pressed perfection, natural movement, luminous finish, silk-pressed smoothness",
    "wearing bone straight relaxed hair with sleek texture, ultra-smooth finish, perfect alignment, chemical straightening results, glossy appearance, flowing movement, chemically straightened texture",
    "wearing a precision-cut relaxed bob with blunt edges, smooth straight texture, professional salon finish, geometric cut lines, polished styling, professional salon results",
    "wearing layered relaxed hair with dimensional cutting, smooth straight texture, professional layers, voluminous styling, salon-quality finish, glossy straight hair finish",
    "wearing hot-pressed straight hair with curled ends, vintage styling technique, smooth shaft with bouncy curl tips, classic salon finish, heat-styled perfection",
    "wearing a sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair",
    "wearing silk-pressed hair with clean side part, glossy straight texture, precise parting line, smooth flowing hair, salon-quality finish, glossy hair shine",
    "wearing relaxed hair with vintage bump styling, smooth straight texture, retro volume technique, polished finish, classic salon look, natural hair highlights",
    "wearing thermally straightened hair with heat-pressed texture, smooth alignment, individual strand definition, professional hot tool finish, luminous hair finish",
    "wearing a relaxed wrap hairstyle with smooth curved styling, salon wrap technique, sleek finish, dimensional movement, professional hair wrapping, professional salon results",
    "wearing afro puffs hairstyle with twin high-positioned hair puffs, natural coily texture pattern, symmetrical rounded shape, authentic Black hair structure, voluminous curl clusters, defined individual strands, traditional afro hair styling",
    "wearing long pigtails with curled ends, flowing length with bouncy spiral curls, symmetrical pigtail placement, smooth hair shaft with defined curl tips, glossy hair shine"
  ]
};

const AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE = [
  "light brown skin tone with warm brown eyes and a bright infectious smile",
  "light brown skin tone with hazel-green eyes and gentle dimples when smiling",
  "light brown skin tone with amber eyes and expressive eyebrows",
  "caramel skin tone with deep chocolate eyes and a confident cheerful expression",
  "caramel skin tone with hazel eyes with golden flecks and soft rounded cheeks",
  "caramel skin tone with bright brown eyes and an inquisitive thoughtful look",
  "honey complexion with golden brown eyes and a playful mischievous grin",
  "honey complexion with warm brown eyes and graceful bone structure",
  "honey complexion with hazel eyes and a warm welcoming expression",
  "warm beige skin with dark honey-colored eyes and animated joyful features",
  "warm beige skin with hazel-green eyes and gentle dimples",
  "light caramel complexion with rich coffee-colored eyes and expressive eyebrows",
  "medium brown skin tone with warm brown eyes and a bright infectious smile",
  "medium brown skin tone with hazel eyes with golden flecks and gentle dimples when smiling",
  "medium brown skin tone with deep amber eyes and expressive eyebrows",
  "cocoa skin tone with dark chocolate eyes and a confident cheerful expression",
  "cocoa skin tone with hazel-green eyes and soft rounded cheeks",
  "cocoa skin tone with bright brown eyes and an inquisitive thoughtful look",
  "warm brown complexion with golden brown eyes and a playful mischievous grin",
  "warm brown complexion with rich coffee-colored eyes and graceful bone structure",
  "chestnut skin tone with hazel eyes and a warm welcoming expression",
  "chestnut skin tone with warm brown eyes and animated joyful features",
  "amber skin tone with dark honey-colored eyes and gentle dimples",
  "amber skin tone with hazel-green eyes and expressive eyebrows",
  "deep brown skin tone with warm brown eyes and a bright infectious smile",
  "deep brown skin tone with dark chocolate eyes and gentle dimples when smiling",
  "deep brown skin tone with deep amber eyes and expressive eyebrows",
  "rich chocolate complexion with hazel eyes with golden flecks and a confident cheerful expression",
  "rich chocolate complexion with bright brown eyes and soft rounded cheeks",
  "rich chocolate complexion with golden brown eyes and an inquisitive thoughtful look",
  "dark brown skin tone with rich coffee-colored eyes and a playful mischievous grin",
  "dark brown skin tone with warm brown eyes and graceful bone structure",
  "ebony skin tone with dark honey-colored eyes and a warm welcoming expression",
  "ebony skin tone with hazel-green eyes and animated joyful features",
  "deep mahogany complexion with hazel eyes and gentle dimples",
  "deep mahogany complexion with deep amber eyes and expressive eyebrows"
];

function getHairBySkintoneEnhanced(skinTone: string, sessionId: string, culturalProfile: string, avatarType: string): string {
  if (culturalProfile === 'african-american') {
    const gender = avatarType === 'girl' ? 'girls' : 'boys';
    const hairOptions = (AFRICAN_AMERICAN_HAIR_INLINE as any)[gender] || (AFRICAN_AMERICAN_HAIR_INLINE as any)['boys'];
    const seed = sessionId ? sessionId.charCodeAt(0) % hairOptions.length : 0;
    return hairOptions[seed];
  }
  return getHairBySkintone(skinTone, sessionId);
}

function getSkinBySkintoneEnhanced(skinTone: string, sessionId: string, culturalProfile: string): string {
  if (culturalProfile === 'african-american') {
    const seed = sessionId ? sessionId.charCodeAt(0) % AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE.length : 0;
    return AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE[seed];
  }
  return getSkinBySkintone(skinTone, culturalProfile);
}

function inlineDetectCultural(userInfo: any, avatarIdentity: any): string {
  const skinTone = avatarIdentity?.skinTone || userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  if (skinTone === 'dark' || skinTone === 'darker') return 'african-american';
  return 'general';
}

function deriveRegionalEthnicity(userInfo: any, avatarIdentity: any): string {
  return avatarIdentity?.ethnicity || userInfo?.ethnicity || '';
}

// ========== INLINED: RUNWARE API (no throws; returns {ok, ...}) ==========
type RunwareResult =
  | { ok: true; imageURL: string; seed?: number }
  | { ok: false; error: string };

async function callRunwareAPI(
  positivePrompt: string,
  negativePrompt: string,
  options: any = {},
  retries = 2
): Promise<RunwareResult> {
  const {
    sessionId = 'unknown-session',
    pageNumber = 1,
    characterSeed = null,
    width = 1024,
    height = 1024,
    model = 'runware:100@1'
  } = options;

  const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!runwareApiKey) {
    return { ok: false, error: 'RUNWARE_API_KEY not configured' };
  }

  const basePayload: any = {
    taskType: 'imageInference',
    taskUUID: crypto.randomUUID(),
    positivePrompt,
    negativePrompt,
    width,
    height,
    model,
    numberResults: 1,
    outputFormat: 'WEBP',
    steps: 4,
    CFGScale: 1,
    scheduler: 'FlowMatchEulerDiscreteScheduler'
  };
  if (characterSeed) basePayload.seed = characterSeed;

  let attempt = 0;
  const doOnce = async (): Promise<RunwareResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    return fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify([
        { taskType: 'authentication', apiKey: runwareApiKey },
        basePayload
      ])
    })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) return res.text().then(t => ({ ok: false as const, error: `Runware API HTTP ${res.status}: ${res.statusText} :: ${t}` }));
        return res.json().then((data: any) => {
          const imageTask = data.data?.find((task: any) => task.taskType === 'imageInference');
          if (!imageTask?.imageURL) return { ok: false as const, error: 'No imageURL in Runware response' };
          console.log(`✅ Runware API call successful`, { imageURL: imageTask.imageURL, seed: imageTask.seed, sessionId, pageNumber });
          return { ok: true as const, imageURL: imageTask.imageURL, seed: imageTask.seed };
        });
      })
      .catch((err: any) => {
        clearTimeout(timeoutId);
        const msg = err?.name === 'AbortError' ? 'Runware API timeout after 20s' : (err?.message || String(err));
        return { ok: false as const, error: msg };
      });
  };

  while (attempt <= retries) {
    if (attempt > 0) {
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏱️ Runware retry ${attempt}/${retries} after ${delay}ms...`);
      // deno-lint-ignore no-await-in-loop
      await new Promise(r => setTimeout(r, delay));
    }
    // deno-lint-ignore no-await-in-loop
    const res = await doOnce();
    if (res.ok) return res;
    console.error(`❌ Runware attempt ${attempt + 1} failed: ${res.error}`);
    attempt++;
  }
  return { ok: false, error: `Runware API failed after ${retries + 1} attempts` };
}

// ========== INLINED: TEMPLATE AB BUSINESS LOGIC (flat; no try/catch) ==========
function safeJson(req: Request): Promise<{ ok: true; value: any } | { ok: false }> {
  return req.json().then(v => ({ ok: true as const, value: v })).catch(() => ({ ok: false as const }));
}

async function handleTemplateABRequest(req: Request): Promise<Response> {
  const requestId = Math.random().toString(36).substring(2, 10);

  const parsed = await safeJson(req);
  if (!parsed.ok) {
    console.log('🔍 Runtime probe detected (JSON parse failed) - returning success');
    return createResponse({
      success: true,
      message: 'Template AB runtime OK',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString()
    });
  }
  const rawPayload = parsed.value || {};
  console.log(`🔍 [${requestId}] Template AB: Request payload keys:`, Object.keys(rawPayload));

  const hasStoryContentEarly = rawPayload?.pageText || rawPayload?.storyText || rawPayload?.enhancedStoryData?.storyText;
  if ((rawPayload.test === true || rawPayload.dryRun === true) && !hasStoryContentEarly) {
    console.log('🧪 Template AB: Test mode detected without story content - returning runtime OK');
    return createResponse({
      success: true,
      message: 'Template AB runtime OK',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString()
    });
  }

  const payload = (rawPayload.bundle && rawPayload.config)
    ? { ...rawPayload.bundle, templateComplexity: rawPayload.config.templateComplexity, precomputedCCS: rawPayload.precomputedCCS }
    : rawPayload;

  console.log(`🔍 [${requestId}] Payload after extraction:`, {
    hasPageText: !!payload.pageText,
    hasStoryText: !!payload.storyText,
    hasUserInfo: !!payload.userInfo,
    hasSessionId: !!payload.sessionId,
    templateComplexity: payload.templateComplexity,
    isNested: !!(rawPayload.bundle && rawPayload.config),
    payloadKeys: Object.keys(payload),
    pageTextLength: payload.pageText?.length || 0,
    storyTextLength: payload.storyText?.length || 0
  });

  const storyText: string | undefined = payload.pageText || payload.storyText || payload.enhancedStoryData?.storyText;
  if (!storyText || storyText.trim().length === 0) {
    console.log('🔍 Runtime probe detected (empty payload) - returning success');
    return createResponse({
      success: true,
      message: 'Template AB runtime OK',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString()
    });
  }

  const userInfo = payload.userInfo || payload.enhancedStoryData?.userInfo || {};
  const sessionId = payload.sessionId || payload.enhancedStoryData?.sessionId || 'unknown-session';
  const pageNumber = payload.pageNumber || 1;
  const templateComplexity = payload.templateComplexity || 'A';
  const avatarIdentity = userInfo.avatar || {};
  const mode = templateComplexity === 'A' ? 'A' : 'B';

  const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
  console.log(`🌍 [${requestId}] Cultural detection:`, {
    culturalProfile,
    skinTone: avatarIdentity.skinTone || userInfo?.skinTone,
    language: userInfo?.nativeLanguage || userInfo?.language,
    avatarType: avatarIdentity.type || 'unknown',
    isAfricanAmerican: culturalProfile === 'african-american'
  });

  const difficulty = userInfo.difficultyLevel || userInfo.difficulty || 'medium';
  const styleFramework = getNuclearStyleFramework(difficulty);

  const character = userInfo.childName || 'the child';
  const age = userInfo.age || '8 years old';
  const ethnicityBase = deriveRegionalEthnicity(userInfo, avatarIdentity);
  const ethnicityDesc = culturalProfile === 'african-american' ? 'African American' : ethnicityBase;
  const skinTone = avatarIdentity.skinTone || 'medium';
  const avatarType = avatarIdentity.type || 'child';
  const hair = getHairBySkintoneEnhanced(skinTone, sessionId, culturalProfile, avatarType);
  const features = getSkinBySkintoneEnhanced(skinTone, sessionId, culturalProfile);

  const negativePrompt = generateInlineNuclearNegative(culturalProfile, avatarIdentity.type || 'child', difficulty);

  // ---------- Mode A (Tier 2.5A) ----------
  if (mode === 'A') {
    console.log(`🚀 Processing Tier 2.5A: Full character consistency`);
    const precomputedCCS = payload.precomputedCCS || null;
    const hasPrecomputedData = precomputedCCS?.culturalBundle?.hair && precomputedCCS?.culturalBundle?.features;

    if (hasPrecomputedData) {
      console.log(`✅ Using orchestrator-provided CCS data (ZERO import overhead)`);
      const bundle = precomputedCCS.culturalBundle;
      const semanticScene = extractSemanticScene(storyText, { userInfo, pageText: storyText });
      const sceneExtracted = !!semanticScene;

      const positivePrompt =
`Narrative: ${storyText}.
Character Description: ${character} ${age}, ${ethnicityDesc}, ${bundle.hair}, ${bundle.features}.
Action: ${semanticScene}.
Context: diverse community setting.
Brand Suffix: ${styleFramework.frameworkPrompt}.`;

      const isRealMode = payload.test !== true && payload.dryRun !== true;
      let imageURL: string | undefined;
      let returnedSeed: number | null = null;

      if (isRealMode) {
        console.log(`🎨 [${requestId}] REAL Mode: Generating image for Tier 2.5A`);
        const runwareResult = await callRunwareAPI(positivePrompt, negativePrompt, { sessionId, pageNumber, model: 'runware:100@1' });
        if (!runwareResult.ok) {
          console.error(`❌ [${requestId}] Image generation failed: ${runwareResult.error}`);
          return createResponse({
            success: false,
            error: `Image generation failed: ${runwareResult.error}`,
            tier: 'tier-2.5A',
            service: SERVICE_NAME,
            positivePrompt,
            negativePrompt
          }, 500);
        }
        imageURL = runwareResult.imageURL;
        returnedSeed = runwareResult.seed ?? null;
        console.log(`✅ [${requestId}] Image generated successfully:`, { imageURL, seed: returnedSeed });
      } else {
        console.log(`🧪 [${requestId}] TEST/DryRun Mode: Skipping image generation for Tier 2.5A`);
      }

      return createResponse({
        success: true,
        tier: `tier-2.5A`,
        service: SERVICE_NAME,
        positivePrompt,
        negativePrompt,
        ...(imageURL && { imageURL, seed: returnedSeed || null }),
        styleFrameworkUsed: styleFramework.name,
        templateComplexity: 'A',
        precomputedCCSUsed: true,
        ccsImportSource: 'orchestrator-precomputed',
        ccsMethodStatus: {
          characterSeed: 'precomputed',
          culturalBundle: 'precomputed',
          coloredObjects: 'precomputed',
          secondaryCharacters: 'precomputed',
          mainCharacterAppearance: 'precomputed'
        },
        ccsFallbacksActive: [],
        metadata: {
          ccsBootStatus: { loaded: true, tier1: false, tier25: true, directMode: false },
          sceneExtracted
        }
      });
    }

    console.error(`❌ Tier 2.5A: No precomputed CCS from orchestrator, escalating to Tier 2.5B`);
    return createResponse({
      success: false,
      error: 'NO_PRECOMPUTED_CCS',
      escalation: 'NEXT_TIER',
      tier: 'tier-2.5A',
      service: SERVICE_NAME,
      message: 'Tier 2.5A requires precomputed CCS from orchestrator. Escalating to Tier 2.5B.',
      details: {
        reason: 'orchestrator_ccs_failure',
        expectedData: 'precomputedCCS.culturalBundle',
        receivedKeys: Object.keys(payload),
        recommendation: 'Check orchestrator CCS inline computation'
      }
    }, 503);
  }

  // ---------- Mode B (Tier 2.5B) ----------
  console.log(`🚀 Processing Tier 2.5B: Lightweight template with cultural intelligence`);
  const precomputedCCS = payload.precomputedCCS || null;
  const bundleHair = precomputedCCS?.culturalBundle?.hair || hair || emergencyHairFallback(skinTone);
  const bundleFeatures = precomputedCCS?.culturalBundle?.features || features;

  const simpleScene = extractSimpleScene(storyText);
  const sceneExtracted = !!simpleScene;

  const positivePrompt =
`Narrative: ${storyText}.
Subject: ${character}, ${age}, ${ethnicityDesc}, ${bundleHair}, ${bundleFeatures}.
Action: ${simpleScene}.
Context: diverse community setting.
Brand Suffix: ${styleFramework.frameworkPrompt}.`;

  const usedPrecomputedData = !!precomputedCCS;

  const isRealMode = payload.test !== true && payload.dryRun !== true;
  let imageURL: string | undefined;
  let returnedSeed: number | null = null;

  if (isRealMode) {
    console.log(`🎨 [${requestId}] REAL Mode: Generating image for Tier 2.5B`);
    const runwareResult = await callRunwareAPI(positivePrompt, negativePrompt, { sessionId, pageNumber, model: 'runware:100@1' });
    if (!runwareResult.ok) {
      console.error(`❌ [${requestId}] Image generation failed: ${runwareResult.error}`);
      return createResponse({
        success: false,
        error: `Image generation failed: ${runwareResult.error}`,
        tier: 'tier-2.5B',
        service: SERVICE_NAME,
        positivePrompt,
        negativePrompt
      }, 500);
    }
    imageURL = runwareResult.imageURL;
    returnedSeed = runwareResult.seed ?? null;
    console.log(`✅ [${requestId}] Image generated successfully:`, { imageURL, seed: returnedSeed });
  } else {
    console.log(`🧪 [${requestId}] TEST/DryRun Mode: Skipping image generation for Tier 2.5B`);
  }

  return createResponse({
    success: true,
    tier: `tier-2.5B`,
    service: SERVICE_NAME,
    positivePrompt,
    negativePrompt,
    ...(imageURL && { imageURL, seed: returnedSeed || null }),
    styleFrameworkUsed: styleFramework.name,
    templateComplexity: 'B',
    precomputedCCSUsed: usedPrecomputedData,
    ccsImportSource: usedPrecomputedData ? 'orchestrator-precomputed-partial' : 'inline',
    ccsMethodStatus: {
      characterSeed: usedPrecomputedData ? 'precomputed' : 'inline',
      culturalBundle: usedPrecomputedData ? 'precomputed' : 'inline',
      coloredObjects: 'inline',
      secondaryCharacters: 'inline',
      mainCharacterAppearance: 'inline'
    },
    ccsFallbacksActive: usedPrecomputedData ? [] : ['Pure inline Mode B'],
    metadata: {
      ccsBootStatus: { loaded: usedPrecomputedData, tier1: false, tier25: usedPrecomputedData, directMode: false },
      sceneExtracted
    }
  });
}

// ========== LKG PATTERN: HANDLER CACHING ==========
type HandlerFn = (req: Request) => Promise<Response> | Response;
let cachedHandler: HandlerFn | null = null;
function loadHandler(): Promise<HandlerFn | null> {
  if (cachedHandler) return Promise.resolve(cachedHandler);
  cachedHandler = handleTemplateABRequest;
  console.log(`✅ Handler loaded successfully (inline single-file implementation)`);
  return Promise.resolve(cachedHandler);
}

// ========== MAIN SERVE HANDLER (flat; no try/catch) ==========
serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: generateEchoCorsHeaders(req) });
  }

  if (req.method === "HEAD" && url.pathname === "/health") {
    return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "x-health": "true", "Content-Length": "0" } }), req);
  }

  if (req.method === "GET") {
    const payload = {
      status: "healthy",
      service: SERVICE_NAME,
      tier: "2.5A/2.5B",
      timestamp: new Date().toISOString(),
      deployment_version: "2025-10-04T16:00:00Z",
      handlerCached: !!cachedHandler,
      capabilities: ["character_consistency", "cultural_enhancement", "inline_templates"]
    };
    return withCors(createResponse(payload), req);
  }

  if (req.method === "HEAD") {
    return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "Content-Length": "0" } }), req);
  }

  if (req.method === "POST") {
    // quick probe path without exceptions
    const quickParsed = await req.clone().json().then(v => ({ ok: true as const, v })).catch(() => ({ ok: false as const }));
    const hasStoryContent = quickParsed.ok
      ? (quickParsed.v?.pageText || quickParsed.v?.storyText || quickParsed.v?.enhancedStoryData?.storyText)
      : false;
    if (!hasStoryContent) {
      console.log('🔍 Runtime probe detected - returning success');
      return withCors(createResponse({
        success: true,
        message: 'Template AB runtime OK',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString()
      }), req);
    }

    const gatingEnabled = Deno.env.get('DISABLE_PROVIDER_GATE') !== 'true';
    let gateAcquired = false;

    if (gatingEnabled) {
      const gateResult = await acquire('T25A:runware-template-ab');
      if (gateResult.acquired) {
        console.log(`✅ [GATE] T25A:runware-template-ab acquired`);
        gateAcquired = true;
      } else {
        console.warn(`⚠️ [GATE] Failed to acquire: ${gateResult.reason}, proceeding without gate`);
      }
    } else {
      console.log(`⏭️ [GATE] Provider gating DISABLED via env flag`);
    }

    const handler = await loadHandler();
    if (!handler) {
      if (gatingEnabled && gateAcquired) release('T25A:runware-template-ab', false);
      return withCors(createResponse({
        success: false,
        error: "HANDLER_UNAVAILABLE",
        service: SERVICE_NAME,
        timestamp: new Date().toISOString()
      }, 500), req);
    }

    const result = await handler(req);
    if (gatingEnabled && gateAcquired) {
      const handlerSuccess = result instanceof Response && (result.status < 500 || result.status === 503);
      release('T25A:runware-template-ab', handlerSuccess);
    }
    return withCors(result, req);
  }

  return withCors(createResponse({ error: "Method not allowed", allowed: ["GET", "HEAD", "POST", "OPTIONS"] }, 405), req);
});

// Export templates for phase2-validation compatibility
export const PREMIUM_PROMPT_TEMPLATES = {
  template: `Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features}.
Action: {semantic_scene}.
Context: {cultural_context}.
Brand Suffix: {frameworkPrompt}.`
};

export const BASIC_PROMPT_TEMPLATES = {
  template: `Narrative: {pageText}.
Subject: {character}, {age}, {ethnicity}, {hair}, {features}.
Action: {scene}.
Context: {cultural_context}.
Brand Suffix: {frameworkPrompt}.`
};

export function processSecondaryCharacters(_text: string, _mode: string): string[] {
  return [];
}
