// DEPLOY_MARKER: 2025-10-02T21:00:00Z - Boot hardening: removed ethnicity auto-inference, fixed receptionist fallbacks, proper HTTP status codes
import { RunwareErrorHandler } from "../_shared/runwareErrorHandler.ts";
import * as ProviderGate from "../_shared/ProviderGate.ts";
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

// Supabase client created dynamically via resilient loader
import { tier25vocabulary } from '../_shared/tier25Vocabulary.js';

// Inline cultural enhancement functions (no external dependencies)
const LEAN_HAIR_BY_SKIN = {
  'pale': ['strawberry blonde hair', 'golden red hair', 'auburn curls'],
  'light': ['platinum blonde hair', 'golden blonde hair', 'honey blonde hair'],  
  'medium': ['chestnut brown hair', 'chocolate brown hair', 'coffee brown hair'],
  'olive': ['jet black hair', 'raven black hair', 'midnight black hair'],
  'dark': ['beautiful dark hair', 'rich black hair', 'lustrous dark hair']
};

// Emergency hair fallback - skin-tone-specific defaults (NO "lighter"/"darker" - only pale/light/medium/olive/dark)
function emergencyHairFallback(skinTone) {
  const normalized = (skinTone || 'medium').toLowerCase();
  const EMERGENCY_HAIR_MAP = {
    'pale': 'red hair',
    'light': 'blonde hair',
    'medium': 'brown hair',
    'olive': 'dark brown hair',
    'dark': 'black textured 4C hair'
  };
  return EMERGENCY_HAIR_MAP[normalized] || EMERGENCY_HAIR_MAP['medium'];
}

const LEAN_AFRICAN_AMERICAN_HAIR = {
  girls: [
    'wearing natural hair in a cute protective style with colorful hair accessories',
    'wearing beautiful braids with neat parting and decorative beads', 
    'wearing a stylish twist-out with defined curl pattern'
  ],
  boys: [
    'wearing a curly top fade with perfectly defined coils on top',
    'wearing twist sponge curls with tight coil definition', 
    'wearing a high top fade with voluminous textured crown'
  ]
};

const LEAN_AFRICAN_AMERICAN_FEATURES = [
  'light brown skin tone with warm brown eyes and a bright infectious smile',
  'caramel skin tone with deep chocolate eyes and a confident cheerful expression', 
  'medium brown skin tone with warm brown eyes and a bright infectious smile'
];

function getHairBySkintone(skinTone, sessionId) {
  const normalized = skinTone?.toLowerCase() || 'medium';
  const options = LEAN_HAIR_BY_SKIN[normalized] || LEAN_HAIR_BY_SKIN['medium'];
  const seed = sessionId ? sessionId.charCodeAt(0) % options.length : 0;
  return options[seed];
}

function getSkinBySkintone(skinTone) {
  const normalized = (skinTone || 'medium').toLowerCase();
  const mapping = {
    'pale': LEAN_AFRICAN_AMERICAN_FEATURES[0],
    'light': LEAN_AFRICAN_AMERICAN_FEATURES[1],
    'medium': LEAN_AFRICAN_AMERICAN_FEATURES[2],
    'dark': LEAN_AFRICAN_AMERICAN_FEATURES[2]
  };
  return mapping[normalized] || LEAN_AFRICAN_AMERICAN_FEATURES[0];
}

function getAfricanAmericanHair(gender, sessionId) {
  const genderKey = gender?.includes('girl') ? 'girls' : 'boys';
  const options = LEAN_AFRICAN_AMERICAN_HAIR[genderKey];
  const seed = sessionId ? sessionId.charCodeAt(0) % options.length : 0;
  return options[seed];
}

function getAfricanAmericanFeatures(sessionId) {
  const seed = sessionId ? sessionId.charCodeAt(0) % LEAN_AFRICAN_AMERICAN_FEATURES.length : 0;
  return LEAN_AFRICAN_AMERICAN_FEATURES[seed];
}

function shouldApplyCulturalEnhancements(userInfo) {
  const skinTone = userInfo?.avatar?.skinTone || 'light';
  const language = userInfo?.nativeLanguage || 'en';
  return ['dark', 'medium-dark', 'brown'].includes(skinTone) || language !== 'en';
}

// Supabase client will be created dynamically when needed via resilient loader

// ============= NUCLEAR INDEPENDENCE: COMPLETE STYLE FRAMEWORKS =============
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
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

function getNuclearStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  
// Use structured logging instead of console.log
// console.log replaced with structured logging for production readiness
  return framework;
}

// ============= NUCLEAR INDEPENDENCE: COMPREHENSIVE NEGATIVE PROMPTS =============
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // CHILDREN'S BOOK ILLUSTRATION PROTECTION - Prevent adult photos and realistic photography
  const childrenBookNegativeBlock = 'NO adult faces, adult features, mature faces, adult photos, realistic photography, photorealistic adults, adult portraits, grown-up faces, realistic human photos, photo of adults, adult photography, mature portraits, realistic adult imagery, photo-realistic people, adult subjects, mature individuals, realistic human photography, adult models, stock photos of adults, professional adult photography';
  
  // GENDER-SPECIFIC NEGATIVES - Softened for better output quality
  const boysNegative = 'minimal feminine features, limited makeup, excessive female anatomy, overly feminine clothing, exclusively long feminine hairstyles, excessive feminine accessories, overly narrow shoulders, exclusively feminine body structure, extreme female proportions, overly feminine expressions, exclusively girl toys, only female-coded activities';
  const girlsNegative = 'minimal masculine features, facial hair, excessive male anatomy, overly masculine clothing, exclusively short masculine haircuts, excessively broad shoulders, overly angular jaw, exclusively masculine body structure, extreme male proportions, overly masculine expressions, exclusively boy toys, only male-coded activities';
  const genderNeutralNegative = 'excessive gendered features, extreme masculine traits, extreme feminine traits, exclusively gender-specific clothing, only highly gendered toys, overly masculine expressions, overly feminine expressions, extreme binary gender stereotypes, exclusively gendered color schemes';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base, childrenBookNegativeBlock];
  
  // Apply gender-specific negatives
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  // Apply African American protection
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  // Always apply cultural sensitivity
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}

// Template AB service initialization

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

// PhaseIntegrationOrchestrator functionality has been consolidated into CharacterConsistencyService
// This function now returns null to trigger fallback processing
async function getPhaseOrchestrator() {
  console.log('🔄 PhaseIntegrationOrchestrator consolidated - using character consistency service instead');
  return null;
}

// ============= ETHNICITY DERIVATION - REQUIRES EXPLICIT USER INPUT =============
function deriveRegionalEthnicity(userInfo, avatarIdentity) {
  // ONLY use explicit ethnicity - NO AUTO-INFERENCE from language or skin tone
  return avatarIdentity?.ethnicity || userInfo?.ethnicity || '';
}

// ============= MISSING HELPER FUNCTIONS =============
// These map to existing StaticDataCache functions
function getHair(skinTone) {
  const sessionId = 'default-session';
  return getHairBySkintone(skinTone, sessionId);
}

function getFeatures(skinTone) {
  const sessionId = 'default-session';
  return getSkinBySkintone(skinTone, sessionId);
}

// PHASE 4: Session management removed - orchestrator handles all session state
// Session data flows via function parameters only

// Function mappings for 2.5B compatibility - map to existing StaticDataCache functions
function deriveEthnicityFromAvatar(avatar) {
  return deriveRegionalEthnicity({ avatar, ethnicity: avatar?.ethnicity }, avatar);
}

function getFacialFeatures(avatar) {
  const skinTone = avatar?.skinTone || 'medium';
  return getSkinBySkintone(skinTone);
}

// Add this function before deriveLeftoverCulturalData
function getCulturalContext(language) {
  const contextMap = {
    'en': 'diverse community setting',
    'es': 'Hispanic community elements',
    'fr': 'French cultural background',
    'pt': 'Portuguese cultural elements',
    'ar': 'Arabic cultural setting',
    'zh': 'Chinese cultural elements'
  };
  return contextMap[language] || 'multicultural setting';
}

function deriveLeftoverCulturalData(userInfo) {
  return getCulturalContext(userInfo?.nativeLanguage || 'en');
}

// ============= DEFENSIVE ORCHESTRATOR PROCESSING =============
async function processWithOrchestrator(sessionId, pageText, userInfo, avatarIdentity, pageNumber) {
  const orchestrator = await getPhaseOrchestrator();
  if (!orchestrator) {
    console.warn('🔄 Orchestrator unavailable, using nuclear fallback');
    return null;
  }

  try {
    console.log('🎯 Processing content through PhaseIntegrationOrchestrator');
    
    // Create context for orchestrator processing
    const context = {
      sessionId,
      userInfo,
      avatarIdentity,
      pageNumber: pageNumber || 1,
      isGuestUser: false // Default to premium processing
    };

    // Process through all phases for enhanced data
    const processedResult = await orchestrator.executeCompleteWorkflow(userInfo, pageText, sessionId, 'template-ab');
    
    if (processedResult && processedResult.success) {
      console.log('✅ Orchestrator processing successful');
      return processedResult;
    } else {
      console.warn('⚠️ Orchestrator processing failed, using fallback');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Orchestrator processing error:', error.message);
    return null;
  }
}

// ============= PAGE TEXT SUMMARIZATION FOR LEVELS 2-4 =============
function mapDifficultyToLevel(difficulty) {
  // Sanitize input: ensure difficulty is valid
  if (typeof difficulty === 'number' && difficulty >= 1 && difficulty <= 5) return difficulty;
  const difficultyMap = {
    'beginner': 1,
    'easy': 2, 
    'medium': 3,
    'hard': 4,
    'expert': 5
  };
  const normalized = String(difficulty || 'medium').toLowerCase();
  return difficultyMap[normalized] || 3; // Default to level 3
}

function summarizePageText(text, difficulty) {
  if (!text || typeof text !== 'string') return text;
  
  // Only summarize for levels 2-4
  const numDifficulty = mapDifficultyToLevel(difficulty);
  if (numDifficulty < 2 || numDifficulty > 4) return text;
  
  // Split by sentence endings (., !, ?)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Take up to 2 sentences max
  let summarized = sentences.slice(0, 2).join('. ').trim();
  if (summarized && !summarized.match(/[.!?]$/)) {
    summarized += '.';
  }
  
  // Truncate to 250 characters if needed
  if (summarized.length > 250) {
    summarized = summarized.substring(0, 247) + '...';
  }
  
  console.log(`📝 Summarized pageText (Level ${numDifficulty}): "${summarized}"`);
  return summarized;
}

// ============= CORS HEADERS =============
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(error, status = 500) {
  console.error('Template AB Error:', error);
  return createResponse({ 
    success: false, 
    error: error instanceof Error ? error.message : error 
  }, status);
}

// Cultural profile detection - NO AUTO-INFERENCE, uses explicit attributes only
function inlineDetectCultural(userInfo, avatarIdentity) {
  // Only use explicit ethnicity - removed auto-inference from language/skin tone
  const explicitEthnicity = avatarIdentity?.ethnicity || userInfo?.ethnicity;
  if (explicitEthnicity === 'African American' || explicitEthnicity === 'african-american') {
    return 'african-american';
  }
  return 'general';
}

// ============= TEMPLATE SELECTION LOGIC =============
function selectTemplate(templateComplexity) {
  if (templateComplexity === 'A') {
    // Premium Template: Full avatar consistency + enhanced features
    return {
      name: 'Premium Template A',
      enhancedFeatures: true,
      avatarConsistency: true,
      culturalEnhancements: true,
      visualTracking: true
    };
  } else if (templateComplexity === 'B') {
    // Basic Template: Reduced features, faster processing
    return {
      name: 'Basic Template B', 
      enhancedFeatures: false,
      avatarConsistency: true,
      culturalEnhancements: false,
      visualTracking: false
    };
  } else {
    // Default to A if not specified
    return selectTemplate('A');
  }
}

// PHASE 6.0: Vocabulary-Driven, Single-Pass Semantic Extractor (Deterministic, AI-like)
// Scans the entire pageText; chooses the most representative action; aggregates objects(+colors), settings,
// 3+ secondaries; infers optional signals (timeOfDay, mood, pose, lighting, atmosphere) only if present.
// Validates with hasActionVerb(); fallback ONLY to extractSimpleScene(); returns empty if both fail.

function extractSemanticScene(storyText) {
  if (!storyText || typeof storyText !== "string") {
    return { scene: "", secondary: [], actions: [], objects: [], settings: [], signals: {} };
  }

  // ---------- Hardcoded language scaffolding (stable, not domain content) ----------
  const PREP_SETTINGS = ["through","into","in","inside","across","on","at","under","near","by","along","around","over","between","behind","beside","beyond"];
  const DETERMINERS   = ["a","an","the","my","his","her","their","our","its","your"];
  const BE_SET        = new Set(["am","is","are","was","were","be","been","being"]);
  const PARTICLES     = new Set(["up","down","out","in","on","off","over","through","around","into","across","away","back"]);
  const STOP_PUNCT    = new Set([",",".",";","!","?"]);
  // tiny ignore list to avoid obvious non-action -ing nouns; keep minimal to stay permissive
  const IGNORE_ING    = new Set(["during","morning","evening","nothing","something","anything","everything","ceiling","building","buildings","thing","wing","spring"]);

// Add this constant after line 347 (after IGNORE_ING definition)
const ACTION_CONTEXT_MAPPING = {
  'waking': 'bedroom',
  'wake': 'bedroom', 
  'waking up': 'bedroom',
  'wake up': 'bedroom',
  'sleeping': 'bedroom',
  'sleep': 'bedroom',
  'eating': 'kitchen',
  'cooking': 'kitchen',
  'bathing': 'bathroom',
  'showering': 'bathroom',
  'playing outside': 'garden',
  'gardening': 'garden',
  'reading': 'library'
};

  // ---------- Pull domain vocabulary from tier25vocabulary ----------
  const safeArr = (x) => Array.isArray(x) ? x : [];
  const COLORS           = safeArr(tier25vocabulary?.getColors?.());
  const OBJECTS          = safeArr(tier25vocabulary?.getObjects?.());
  const SETTINGS_VOCAB   = safeArr(tier25vocabulary?.getSettings?.() || tier25vocabulary?.getLocations?.());
  const SECONDARY_ROLES  = safeArr(tier25vocabulary?.getSecondaryRoles?.() || tier25vocabulary?.getRelationships?.())
                            .concat(safeArr(tier25vocabulary?.getAnimals?.()));
  const VERB_ROOTS       = safeArr(tier25vocabulary?.getActionVerbs?.());
  const IRREG_PROGRESSIVE= tier25vocabulary?.getIrregularProgressiveMap?.() || null;
  // Optional: synonyms maps (color/objects/settings/roles) if your vocab provides them
  const SYNONYMS = tier25vocabulary?.getSynonyms?.() || {}; // { rucksack: 'backpack', crimson: 'red', ... }

  // Fast exit if essential vocab missing → we'll still try simple fallback later.
  const vocabOk = VERB_ROOTS.length > 0;
  
  console.log(`🔍 [DEBUG] Vocabulary loading:`, {
    colorsCount: COLORS.length,
    objectsCount: OBJECTS.length,
    verbRootsCount: VERB_ROOTS.length,
    vocabOk
  });

  // ---------- Normalization ----------
  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const normalize = (t) => String(t ?? "")
    .replace(/[""]/g, '"')
    .replace(/[']/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const splitSentences = (t) => (t.match(/[^.!?]+[.!?]?/g) || [t]).map(s => s.trim()).filter(Boolean);
  const tokenize = (str) => (str.match(/[A-Za-z'-]+|[.,;!?]/g) || []);

  // ---------- Build sets/regex from vocabulary ----------
  const COLORS_SET    = new Set(COLORS.map(x => x.toLowerCase()));
  const OBJECTS_SET   = new Set(OBJECTS.map(x => x.toLowerCase()));
  const SETTINGS_SET  = new Set(SETTINGS_VOCAB.map(x => x.toLowerCase()));
  const SECONDARY_SET = new Set(SECONDARY_ROLES.map(x => x.toLowerCase()));
  const PREP_SET      = new Set(PREP_SETTINGS.map(x => x.toLowerCase()));
  const DET_SET       = new Set(DETERMINERS.map(x => x.toLowerCase()));

  const ROOT_ALT        = VERB_ROOTS.map(esc).join("|");
  const ROOT_TOKEN_RE   = ROOT_ALT ? new RegExp(`^(?:${ROOT_ALT})(?:s|ed|ing)?$`, "i") : /$^/;
  const ROOT_TEXT_RE    = ROOT_ALT ? new RegExp(`\\b(?:${ROOT_ALT})(?:s|ed|ing)?\\b`, "i") : /$^/;

  // Lowercase synonym map
  const SYN = Object.fromEntries(Object.entries(SYNONYMS).map(([k,v]) => [k.toLowerCase(), String(v).toLowerCase()]));

  // ---------- Morphology ----------
  function toProgressive(token) {
    if (!token) return token;
    const lower = token.toLowerCase();
    if (IRREG_PROGRESSIVE && IRREG_PROGRESSIVE[lower]) return IRREG_PROGRESSIVE[lower];
    const irregular = {
      run:"running", ran:"running", swim:"swimming", sit:"sitting", get:"getting",
      put:"putting", hug:"hugging", stop:"stopping", lie:"lying", see:"seeing", saw:"seeing",
      eat:"eating", ate:"eating", take:"taking", make:"making", write:"writing", drive:"driving",
      give:"giving", have:"having", use:"using", wear:"wearing", hold:"holding", carry:"carrying",
      walk:"walking", look:"looking", play:"playing", laugh:"laughing", giggle:"giggling", chuckle:"chuckling"
    };
    if (irregular[lower]) return irregular[lower];
    if (/\bing\b$/i.test(lower)) return token;
    let base = lower.replace(/(ed|es|s)$/i, "");
    if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxz]$/i.test(base)) return base + base.slice(-1) + "ing";
    if (base.endsWith("e")) base = base.slice(0, -1);
    return base + "ing";
  }

  // ---------- Tiny helpers ----------
  const last = (arr) => arr[arr.length - 1];
  const isWord = (t) => /^[A-Za-z'-]+$/.test(t);

  function normalizeToken(tok) {
    const original = tok;
    const t = tok.toLowerCase();
    
    // CRITICAL: Use Tier 2.5 vocabulary validation before synonym mapping
    const isValidVerb = VERB_ROOTS.some(root => {
      const rootLower = root.toLowerCase();
      return t === rootLower || t === rootLower + 's' || t === rootLower + 'ed' || t === rootLower + 'ing';
    });
    
    // If it's a valid verb in our vocabulary, preserve it exactly
    if (isValidVerb) {
      return t;
    }
    
    // Otherwise apply synonym mapping
    const normalized = SYN[t] || t;
    
    // Debug corrupted tokens
    if (original !== normalized && (original.includes('wak') || original.includes('wok'))) {
      console.log(`🔍 [DEBUG] normalizeToken corruption: "${original}" → "${normalized}" | isValidVerb: ${isValidVerb}`);
    }
    
    return normalized;
  }

  // Capture NP starting at index (skip determiners), stop at STOP/verb/punct
  function captureNP(tokens, start, max=8) {
    const out = [];
    let i = start;
    while (i < tokens.length && DET_SET.has(tokens[i]?.toLowerCase())) i++;
    for (; i < tokens.length && out.length < max; i++) {
      const raw = tokens[i];
      const t = normalizeToken(raw);
      if (STOP_PUNCT.has(t) || PREP_SET.has(t) || ROOT_TOKEN_RE.test(t)) break;
      out.push(t);
      if (STOP_PUNCT.has(t)) break;
    }
    while (out.length && STOP_PUNCT.has(last(out))) out.pop();
    if (!out.length) return null;

    // head = final word
    const head = last(out);
    const colors = out.filter(x => COLORS_SET.has(x));
    return { phrase: out.join(" "), head, colors: Array.from(new Set(colors)) };
  }

  function captureSetting(tokens, prepIdx, max=8) {
    let i = prepIdx + 1;
    if (i < tokens.length && DET_SET.has(tokens[i]?.toLowerCase())) i++;
    const out = [];
    for (; i < tokens.length && out.length < max; i++) {
      const t = normalizeToken(tokens[i]);
      if (STOP_PUNCT.has(t) || PREP_SET.has(t)) break;
      out.push(t);
    }
    while (out.length && STOP_PUNCT.has(last(out))) out.pop();
    if (!out.length) return null;
    return { phrase: out.join(" "), head: last(out) };
  }

  function captureSecondary(tokens, conjIdx, max=7) {
    let i = conjIdx + 1;
    if (i < tokens.length && DET_SET.has(tokens[i]?.toLowerCase())) i++;
    const out = [];
    for (; i < tokens.length && out.length < max; i++) {
      const t = normalizeToken(tokens[i]);
      if (STOP_PUNCT.has(t) || PREP_SET.has(t)) break;
      out.push(t);
    }
    while (out.length && STOP_PUNCT.has(last(out))) out.pop();
    if (!out.length) return null;
    const phrase = out.join(" ");
    const head = last(out);
    return (SECONDARY_SET.has(head) || SECONDARY_SET.has(phrase)) ? { phrase, head } : null;
  }

  // Optional whole-text signals (only emit if cues found)
  function inferTimeOfDay(textLower) {
    if (/\b(night|nighttime|midnight|moon|moonlight|stars|starlit|twilight|dusk)\b/i.test(textLower)) return "night";
    if (/\b(morning|sunrise|dawn)\b/i.test(textLower)) return "morning";
    if (/\b(afternoon|noon|midday)\b/i.test(textLower)) return "afternoon";
    if (/\b(evening|sunset|dusk)\b/i.test(textLower)) return "evening";
    if (/\b(bedtime|asleep|pajamas|fireflies)\b/i.test(textLower)) return "night";
    if (/\b(wake|breakfast|school bus)\b/i.test(textLower)) return "morning";
    return "";
  }
  function inferMood(textLower) {
    // ADVERB patterns (existing)
    if (/\b(happily|cheerfully|joyfully|excitedly|playfully)\b/i.test(textLower)) return "happy";
    if (/\b(quietly|calmly|softly|gently|peacefully)\b/i.test(textLower)) return "calm";
    if (/\b(sadly|tearfully)\b/i.test(textLower)) return "sad";
    if (/\b(angrily|madly|grumpily|frustrated|furious)\b/i.test(textLower)) return "angry";
    if (/\b(nervously|shyly|timidly|anxiously)\b/i.test(textLower)) return "nervous";
    
    // ADJECTIVE patterns (NEW - to catch "excited", "happy", etc.)
    if (/\b(excited|happy|cheerful|joyful|playful|thrilled|delighted)\b/i.test(textLower)) return "happy";
    if (/\b(calm|peaceful|quiet|gentle|serene|relaxed)\b/i.test(textLower)) return "calm";
    if (/\b(sad|tearful|unhappy|melancholy|downcast)\b/i.test(textLower)) return "sad";
    if (/\b(angry|mad|grumpy|frustrated|furious|upset)\b/i.test(textLower)) return "angry";
    if (/\b(nervous|shy|timid|anxious|worried|scared)\b/i.test(textLower)) return "nervous";
    
    // ACTION-based mood inference (existing)
    if (/\b(laugh|giggle|smile|play|sing|dance)\w*\b/i.test(textLower)) return "happy";
    if (/\b(whisper|tiptoe|hide)\w*\b/i.test(textLower)) return "calm";
    return "";
  }
  function inferLighting(textLower) {
    if (/\b(sunlight|sunny|bright|glowing|moonlight|starlit|candlelight|lamplight)\b/i.test(textLower)) return (/\bmoon|starlit|night\b/i.test(textLower) ? "dim/moonlit" : "bright/sunlit");
    if (/\b(shadowy|dark|dim|gloomy)\b/i.test(textLower)) return "dim";
    return "";
  }
  function inferAtmosphere(textLower) {
    if (/\b(fog|foggy|mist|misty|haze|hazy)\b/i.test(textLower)) return "misty";
    if (/\b(rain|rainy|drizzle|drizzling|storm|stormy|thunder|lightning|windy|breezy)\b/i.test(textLower)) return "weathered";
    if (/\b(magical|enchanted|sparkling|glittering)\b/i.test(textLower)) return "magical";
    return "";
  }
  function suggestPoseFromAction(actionLead) {
    if (!actionLead) return "";
    const a = actionLead.toLowerCase();
    if (/\b(run|running)\b/.test(a)) return "mid-stride, arms pumping";
    if (/\b(walk|walking|stroll|strolling|wander|wandering)\b/.test(a)) return "standing, gentle step forward";
    if (/\b(jump|jumping)\b/.test(a)) return "knees bent, airborne";
    if (/\b(climb|climbing)\b/.test(a)) return "one foot up, hands reaching";
    if (/\b(sit|sitting|read|reading|draw|drawing)\b/.test(a)) return "seated, torso slightly forward";
    if (/\b(hold|holding|carry|carrying)\b/.test(a)) return "standing, object cradled in arm";
    // ENHANCED: Better "wake" action poses with excitement
    if (/\b(wake|waking|woke)\b/.test(a)) {
      return "sitting up in bed, stretching arms upward, bright expression";
    }
    if (/\b(look|looking|see|seeing|watch|watching)\b/.test(a)) return "standing, head turned toward object";
    if (/\b(laugh|laughing|giggle|giggling)\b/.test(a)) return "standing, relaxed shoulders, open smile";
    return "";
  }

  // ---------- Action detectors (single-pass friendly) ----------
  function detectAction(tokens) {
    // 1) direct root
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (ROOT_TOKEN_RE.test(t)) {
        const span=[t];
        for (let j=i+1;j<tokens.length && span.length<6;j++){
          const k = normalizeToken(tokens[j]);
          if (STOP_PUNCT.has(k) || PREP_SET.has(k)) break;
          span.push(k);
        }
        return span.join(" ");
      }
    }
    // 2) BE + -ing
    for (let i=0;i<tokens.length-1;i++){
      const t = normalizeToken(tokens[i]), n = normalizeToken(tokens[i+1]);
      if (BE_SET.has(t) && /^[a-z]+ing$/.test(n) && !IGNORE_ING.has(n)) {
        const span=[n];
        for (let j=i+2;j<tokens.length && span.length<6;j++){
          const k = normalizeToken(tokens[j]);
          if (STOP_PUNCT.has(k) || PREP_SET.has(k)) break;
          span.push(k);
        }
        return span.join(" ");
      }
    }
    // 3) bare -ing
    for (let i=0;i<tokens.length;i++){
      const tok = normalizeToken(tokens[i]);
      if (/^[a-z]+ing$/.test(tok) && !IGNORE_ING.has(tok)) {
        const span=[tok];
        for (let j=i+1;j<tokens.length && span.length<6;j++){
          const k = normalizeToken(tokens[j]);
          if (STOP_PUNCT.has(k) || PREP_SET.has(k)) break;
          span.push(k);
        }
        return span.join(" ");
      }
    }
    // 4) phrasal: <root> … <particle>
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (ROOT_TOKEN_RE.test(t)) {
        const n1 = normalizeToken(tokens[i+1] || ""), n2 = normalizeToken(tokens[i+2] || "");
        if ((n1 && PARTICLES.has(n1)) || (n2 && PARTICLES.has(n2))) {
          return [t, PARTICLES.has(n1) ? n1 : (PARTICLES.has(n2) ? n2 : "")].filter(Boolean).join(" ");
        }
      }
    }
    return null;
  }

  // ---------- Aggregate across sentences (single pass per sentence) ----------
  const text = normalize(storyText);
  const sentences = splitSentences(text);

  const actions = [];
  const actionStats = new Map(); // {action -> {score, firstIdx}}
  const objects = [];
  const settings = [];
  const secondaries = [];

  function bumpActionScore(actionRaw, tokens, sentenceIdx) {
    if (!actionRaw) return;
    const pretty = (toProgressive(actionRaw.split(/\s+/)[0]) + " " + actionRaw.split(/\s+/).slice(1).join(" ")).trim();

    const cur = actionStats.get(pretty) || { score: 0, firstIdx: sentenceIdx };
    cur.score += 1; // frequency
    if (sentenceIdx === 0) cur.score += 2; // early placement bonus

    // object tie
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (ROOT_TOKEN_RE.test(t)) {
        const np = captureNP(tokens, i+1, 6);
        if (np && (!OBJECTS_SET.size || OBJECTS_SET.has(np.head))) { cur.score += 1; break; }
      }
    }
    // setting tie
    if (tokens.some(tok => PREP_SET.has(normalizeToken(tok)))) cur.score += 0.5;

    // phrasal tie
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (ROOT_TOKEN_RE.test(t)) {
        const n1 = normalizeToken(tokens[i+1] || ""), n2 = normalizeToken(tokens[i+2] || "");
        if ((n1 && PARTICLES.has(n1)) || (n2 && PARTICLES.has(n2))) { cur.score += 0.5; break; }
      }
    }

    actionStats.set(pretty, cur);
    if (!actions.includes(pretty)) actions.push(pretty);
  }

  sentences.forEach((s, sIdx) => {
    const tokens = tokenize(s);

    // ACTION
    const actionRaw = detectAction(tokens);
    bumpActionScore(actionRaw, tokens, sIdx);

    // OBJECTS after verbs
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (ROOT_TOKEN_RE.test(t)) {
        const np = captureNP(tokens, i+1, 8);
        if (np && (!OBJECTS_SET.size || OBJECTS_SET.has(np.head))) {
          const key = np.head + "|" + (np.colors||[]).join(",");
          if (!objects.some(o => (o.head + "|" + (o.colors||[]).join(",")) === key)) objects.push(np);
        }
      }
    }

    // SETTINGS via prepositions
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (PREP_SET.has(t)) {
        const sp = captureSetting(tokens, i, 8);
        if (sp) {
          const phr = (sp.phrase || sp.head).toLowerCase();
          if (!settings.includes(phr)) settings.push(phr);
        }
      }
    }

    // SECONDARIES after "and"/"with"
    for (let i=0;i<tokens.length;i++){
      const t = normalizeToken(tokens[i]);
      if (t === "and" || t === "with") {
        const sec = captureSecondary(tokens, i, 7);
        if (sec) {
          const phr = sec.phrase.toLowerCase();
          if (!secondaries.includes(phr)) secondaries.push(phr);
        }
      }
    }

    // ALSO: color-object anywhere in sentence (cheap inline pass)
    for (let i=0;i<tokens.length-1;i++){
      const c = normalizeToken(tokens[i]), n = normalizeToken(tokens[i+1]);
      if (COLORS_SET.has(c) && OBJECTS_SET.has(n)) {
        const key = n + "|" + c;
        if (!objects.some(o => (o.head + "|" + (o.colors||[]).join(",")) === key)) {
          objects.push({ phrase: `${c} ${n}`, head: n, colors: [c] });
        }
      }
    }
  });

  // ---------- Choose the most representative action ----------
  let actionLead = "";
  if (actions.length) {
    const ranked = actions.slice().sort((a,b) => {
      const A = actionStats.get(a) || { score: 0, firstIdx: 999 };
      const B = actionStats.get(b) || { score: 0, firstIdx: 999 };
      if (B.score !== A.score) return B.score - A.score;
      if (A.firstIdx !== B.firstIdx) return A.firstIdx - B.firstIdx;
      return a.length - b.length; // shorter wins ties
    });
    actionLead = ranked[0];
  }

  // Allow one extra short action if nearly tied
  let extraAction = "";
  if (actions.length > 1) {
    const ranked = actions.slice().sort((a,b) => {
      const A = actionStats.get(a) || { score: 0, firstIdx: 999 };
      const B = actionStats.get(b) || { score: 0, firstIdx: 999 };
      if (B.score !== A.score) return B.score - A.score;
      if (A.firstIdx !== B.firstIdx) return A.firstIdx - B.firstIdx;
      return a.length - b.length;
    });
    const topScore = actionStats.get(ranked[0])?.score ?? 0;
    const cand     = ranked[1];
    const candScore= actionStats.get(cand)?.score ?? -Infinity;
    if (cand && candScore >= topScore - 0.5 && cand.split(/\s+/).length <= 3) extraAction = cand;
  }

  // ---------- Compose the scene line (context-only; no hallucinations) ----------
  const SECONDARY_IN_SCENE_MAX = 4;

  const actionText = [actionLead, extraAction].filter(Boolean).join(" and ");

  // Objects: prefer colored; up to 3 inline (full list still returned)
  const colored = objects.filter(o => (o.colors||[]).length);
  const plain   = objects.filter(o => !(o.colors||[]).length);
  const chosenObjs = colored.concat(plain).slice(0,3);
  const objectText = chosenObjs.length
    ? chosenObjs.map(o => (o.colors && o.colors.length ? `${o.colors[0]} ${o.head}` : o.phrase)).join(" and ")
    : "";

  // CRITICAL: Action-Context Priority Logic
  let settingText = '';
  if (actionText) {
    // Check if action implies specific context
    const actionLower = actionText.toLowerCase();
    const impliedContext = Object.keys(ACTION_CONTEXT_MAPPING).find(action => 
      actionLower.includes(action.toLowerCase())
    );
    
    if (impliedContext) {
      const forcedContext = ACTION_CONTEXT_MAPPING[impliedContext];
      settingText = `the ${forcedContext}`;
      console.log(`🎯 [DEBUG] Action-Context Mapping: "${actionText}" → "${forcedContext}" (overriding: ${settings.join(', ')})`);
    } else {
      // Use detected settings if no action-context mapping
      settingText = settings.slice(0,2).join(" and ");
    }
  } else {
    // No action, use detected settings
    settingText = settings.slice(0,2).join(" and ");
  }

  // Secondaries: show up to 4 inline; return all
  const secondaryTextForScene = secondaries.slice(0, SECONDARY_IN_SCENE_MAX).join(" and ");

  const parts = [];
  if (actionText) parts.push(actionText);
  if (objectText) parts.push(`with ${objectText}`);
  if (secondaryTextForScene && actionText) parts.push(`with ${secondaryTextForScene}`);
  if (settingText) parts.push(`in ${settingText}`);
  const scene = parts.join(" ").trim();

  // ---------- Optional signals (only if text supports them) ----------
  const lowerPage = storyText.toLowerCase();
  const timeOfDay  = inferTimeOfDay(lowerPage) || "";
  const mood       = inferMood(lowerPage)      || "";
  const lighting   = inferLighting(lowerPage)  || "";
  const atmosphere = inferAtmosphere(lowerPage)|| "";
  const pose       = suggestPoseFromAction(actionLead || actions[0] || "") || "";

  const signals = {};
  if (timeOfDay)  signals.timeOfDay = timeOfDay;
  if (mood)       signals.mood = mood;
  if (lighting)   signals.lighting = lighting;
  if (atmosphere) signals.atmosphere = atmosphere;
  if (pose)       signals.pose = pose;

  // ---------- DEBUG LOGGING FOR SCENE ASSEMBLY ----------
  console.log(`🔍 [DEBUG] Scene Assembly Details:`, {
    originalText: storyText.substring(0, 100) + '...',
    detectedActions: actions,
    chosenAction: actionLead,
    detectedObjects: objects.map(o => o.phrase),
    detectedSettings: settings,
    forcedContext: settingText,
    mood: mood,
    finalScene: scene
  });

  // ---------- DEBUG LOGGING FOR MOOD DETECTION ----------
  if (mood) {
    console.log(`🎭 [DEBUG] Mood Detection Success: "${mood}" from text: "${lowerPage.substring(0, 100)}..."`);
  } else {
    console.log(`🎭 [DEBUG] Mood Detection Failed - no patterns matched in: "${lowerPage.substring(0, 100)}..."`);
  }

  // ---------- Validation & fallback ----------
  const validator = (typeof hasActionVerb === "function")
    ? hasActionVerb
    : (s) => {
        const txt = typeof s === "string" ? s : (s && s.scene) || "";
        if (!txt) return false;
        if (ROOT_TEXT_RE.test(txt)) return true;
        const tks = (txt.match(/[A-Za-z'-]+|[.,;!?]/g) || []).map(t => t.toLowerCase());
        for (let i=0;i<tks.length-1;i++){
          if (BE_SET.has(tks[i]) && /^[a-z]+ing$/.test(tks[i+1]) && !IGNORE_ING.has(tks[i+1])) return true;
        }
        if (tks.some(t => /^[a-z]+ing$/.test(t) && !IGNORE_ING.has(t))) return true;
        for (let i=0;i<tks.length;i++){
          const tok = tks[i];
          if (ROOT_TOKEN_RE.test(tok)) {
            const n1=tks[i+1]?.toLowerCase(), n2=tks[i+2]?.toLowerCase();
            if ((n1 && PARTICLES.has(n1)) || (n2 && PARTICLES.has(n2))) return true;
          }
        }
        return false;
      };

  const result = {
    scene,
    secondary: secondaries.slice(),   // supports 3+
    actions: actions.slice(),
    objects: objects.slice(),
    settings: settings.slice(),
    signals
  };

  if (vocabOk && scene && validator(result)) {
    console.log(`🤖 Semantic scene (vocab-driven): "${scene}"`, signals);
    return result;
  }

  // Fallback ONLY to extractSimpleScene; if that fails validation, return empty.
  if (typeof extractSimpleScene === "function") {
    const fallback = extractSimpleScene(storyText);
    const fb = (typeof fallback === "string")
      ? { scene: fallback, secondary: [], actions: [], objects: [], settings: [], signals: {} }
      : (fallback && typeof fallback === "object")
        ? { scene: String(fallback.scene || ""), secondary: Array.isArray(fallback.secondary) ? fallback.secondary : [], actions: [], objects: [], settings: [], signals: {} }
        : { scene: "", secondary: [], actions: [], objects: [], settings: [], signals: {} };

    if (fb.scene && validator(fb)) {
      console.log(`↩️  Using simple fallback: "${fb.scene}"`);
      return fb;
    }
  }

  console.warn("⚠️ Semantic extraction failed validation and simple fallback did not pass; returning empty.");
  return { scene: "", secondary: [], actions: [], objects: [], settings: [], signals: {} };
}

// ============= CULTURAL CONTEXT DERIVATION =============
function deriveNonEnglishCulturalContext(userInfo) {
  const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
  
  // Only return cultural context for non-English languages
  if (language === 'en') return '';
  
  const culturalContextMap = {
    'es': 'Hispanic cultural setting',
    'pt': 'Portuguese cultural environment',
    'fr': 'French cultural atmosphere',
    'zh': 'Chinese cultural background',
    'ja': 'Japanese cultural setting',
    'ar': 'Arabic cultural environment'
  };
  
  return culturalContextMap[language] || '';
}

// ============= SCENE/SETTING EXTRACTION FUNCTIONS =============

// TIER 2.5B: SIMPLIFIED SCENE EXTRACTION (Enhanced for Level 0)
// Extracts: Action + Object + Location with comprehensive Level 0 coverage
function extractSimpleScene(storyText) {
  if (!storyText || typeof storyText !== 'string') return '';
  
  // Convert storyText for processing
  const text = storyText.toLowerCase();

  // ==========  
  // Local config + tiny backups (scoped; no globals) - PHASE 1: EXPANDED VOCABULARY ARRAYS
  // ==========
  const VERB_ROOTS = ["see","hold","carry","wear","grab","pick","lift","bring","take","hug","pull","push","walk","stroll","run","wander","tiptoe","explore","look","play","read","draw","build","climb","swing","slide","help","clean","make","watch","eat","sing","dance","wake","drink","create","build","hear","feel","smell","taste","touch","get","put","give","come","go","find","study","cook","sleep","sit","stand","laugh"];
  const PREP_SETTINGS = ["through","into","in","inside","across","on","at","under","near","by","along"];
  const DETERMINERS = ["a","an","the","my","his","her","their","our"];
  const STOP_TOKENS = [",",".",";","!","?","and","but","or","while","as","because","so","then","when","before","after", ...PREP_SETTINGS];
  
  // Enhanced action detection helpers
  const BE_RE = /\b(?:am|is|are|was|were|be|been|being)\b/i;
  const NON_ACTION_ING = new Set(["during","something","anything","nothing","everything","morning","evening"]);

  // Expanded color coverage (includes turquoise, lavender, burgundy, etc.)
  const COLORS = [
    // Core
    "red","blue","green","yellow","purple","pink","orange",
    "brown","black","white","gray","grey","gold","silver",
    // Extended
    "turquoise","lavender","burgundy","teal","beige","maroon",
    "navy","violet","indigo","cream","ivory","peach",
    "magenta","cyan","olive","tan","aqua","turqoise" /* common misspell */
  ];

  const KNOWN_OBJECTS = ["ball","backpack","bag","book","lantern","hat","basket","flower","map","rope","cloak","compass","bottle","flashlight","lunchbox","scarf","toy","toys","cookie","apple","food","dress","shirt","pants","clothes","shoes","jacket","coat","sweater","skirt","blouse","uniform","outfit","crown","necklace","glasses","watch","belt","gloves","socks","boots","sandals","doll","teddy bear","blocks","puzzle","crayons","markers","bicycle","bike","swing","slide","sandbox","bucket","shovel","dog","puppy","cat","kitten","bird","fish","rabbit","bunny","horse","cow","pig","sheep","chicken","duck","frog","butterfly","bee","ladybug","turtle","bear","elephant","lion","monkey","cake","banana","milk","juice","water","bread","sandwich","snack","treats","chair","table","cup","plate","bowl","spoon","fork","towel","blanket","tree","grass","sun","moon","star","cloud","rock","leaf","crayon","marker","paper","pencil","eraser"];
  const KNOWN_SETTINGS = ["forest","woods","kitchen","bedroom","playground","park","beach","school","garden","mountain","castle","city","village","river","lake","cave","desert","space","meadow","library","trail","path","home","house"];
  
  // PHASE 1.3: NEW CLOTHING DETECTION KEYWORDS ARRAY
  const CLOTHING_DETECTION_KEYWORDS = ["dress","shirt","pants","shoes","hat","coat","jacket","sweater","skirt","blouse","uniform","outfit","socks","boots","sandals","gloves","scarf","belt","shorts","pajamas","swimsuit"];
  
  // PHASE 2: SECONDARY CHARACTER KEYWORDS (Family & Friends from Level 0/1 Templates)
  const SECONDARY_CHARACTER_KEYWORDS = [
    // Core Family
    'mom', 'mother', 'mommy', 'mama', 'ma',
    'dad', 'father', 'daddy', 'papa', 'pa',
    'sister', 'sis', 'brother', 'bro',
    'grandma', 'grandmother', 'nana', 'granny',
    'grandpa', 'grandfather', 'gramps',
    'aunt', 'auntie', 'uncle',
    
    // Friends & Peers  
    'friend', 'buddy', 'pal', 'companion',
    'best friend', 'bestie', 'classmate', 'teammate',
    'neighbor', 'neighbour', 'playmate',
    
    // Authority Figures
    'teacher', 'coach', 'doctor', 'nurse', 'babysitter'
  ];
  
  // PHASE 2.1: VERB_OBJECT_CONTEXT MAPPING FOR MULTI-SENTENCE ASSEMBLY
  const VERB_OBJECT_CONTEXT = {
    // Clothing objects → "wearing" verb
    'dress': 'wearing', 'shirt': 'wearing', 'pants': 'wearing', 'shoes': 'wearing', 
    'hat': 'wearing', 'coat': 'wearing', 'jacket': 'wearing', 'sweater': 'wearing',
    'skirt': 'wearing', 'outfit': 'wearing', 'clothes': 'wearing',
    // Carrying objects → "carrying" verb
    'backpack': 'carrying', 'bag': 'carrying', 'basket': 'carrying', 'lunchbox': 'carrying',
    'purse': 'carrying', 'bucket': 'carrying',
    // Playing objects → "playing with" verb  
    'ball': 'playing with', 'toy': 'playing with', 'toys': 'playing with', 'doll': 'playing with',
    'blocks': 'playing with', 'puzzle': 'playing with',
    // Holding objects → "holding" verb
    'book': 'holding', 'lantern': 'holding', 'flashlight': 'holding', 'map': 'holding',
    'rope': 'holding', 'bottle': 'holding',
    // Eating objects → "eating" verb
    'cookie': 'eating', 'apple': 'eating', 'food': 'eating', 'cake': 'eating',
    'sandwich': 'eating', 'snack': 'eating',
    // Secondary characters → "with" verb
    'mom': 'with', 'mother': 'with', 'dad': 'with', 'father': 'with',
    'friend': 'with', 'sister': 'with', 'brother': 'with'
  };

  const ALIASES = [
    ["emama","emma"],
    ["backback","backpack"], ["backpak","backpack"],
    ["forrest","forest"], ["magickal","magical"],
    ["walked thru","walked through"]
  ];

  // ==========
  // Helpers
  // ==========
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mkRe = (alts, flags="i") => new RegExp(`\\b(?:${alts.map(esc).join("|")})\\b`, flags);

  const VERB_RE = mkRe(VERB_ROOTS.map(v => `${v}(?:s|ed|ing)?`), "i");
  const PREP_RE = mkRe(PREP_SETTINGS, "i");
  const DET_RE  = mkRe(DETERMINERS, "i");
  const STOP_RE = mkRe(STOP_TOKENS, "i");
  const COLOR_SET = new Set(COLORS);

  function normalize(t) {
    let out = String(t ?? "").replace(/[""]/g, '"').replace(/[']/g, "'").replace(/[ \t]+/g, " ").trim();
    for (const [bad, good] of ALIASES) {
      out = out.replace(new RegExp(`\\b${esc(bad)}\\b`, "gi"), (m) => {
        if (m.toUpperCase() === m) return good.toUpperCase();
        if (m[0] === m[0].toUpperCase()) return good[0].toUpperCase() + good.slice(1);
        return good;
      });
    }
    return out;
  }

  function splitSentences(t) {
    const chunks = t.match(/[^.!?]+[.!?]?/g) || [t];
    return chunks.map(s => s.trim()).filter(Boolean);
  }

  function tokenize(str) {
    return str
      .replace(/[""]/g, '"').replace(/[']/g, "'")
      .replace(/\s+/g, " ").trim()
      .match(/[A-Za-z'-]+|[.,;!?]/g) || [];
  }

  function captureNounPhrase(tokens, startIndex, maxTokens = 8) {
    const out = [];
    for (let i = startIndex; i < tokens.length && out.length < maxTokens; i++) {
      const t = tokens[i];
      if (STOP_RE.test(t) || VERB_RE.test(t)) break;
      out.push(t);
      if (/^[.,;!?]$/.test(t)) break;
    }
    while (out.length && DET_RE.test(out[0])) out.shift();
    while (out.length && /^[.,;!?]$/.test(out[out.length - 1])) out.pop();
    if (!out.length) return null;

    const head = out[out.length - 1].toLowerCase();
    const colors = out.filter(t => COLOR_SET.has(t.toLowerCase())).map(t => t.toLowerCase());
    return { phrase: out.join(" "), head, colors: Array.from(new Set(colors)) };
  }

  function captureSetting(tokens, prepIndex, maxTokens = 8) {
    let i = prepIndex + 1;
    if (i < tokens.length && DET_RE.test(tokens[i])) i++;
    const out = [];
    for (; i < tokens.length && out.length < maxTokens; i++) {
      const t = tokens[i];
      if (STOP_RE.test(t) || /^[.,;!?]$/.test(t)) break;
      out.push(t);
    }
    while (out.length && /^[.,;!?]$/.test(out[out.length - 1])) out.pop();
    if (!out.length) return null;
    return { phrase: out.join(" "), head: out[out.length - 1].toLowerCase() };
  }

  function backupColorObjectPairs(lower) {
    const colorAlt = COLORS.map(esc).join("|");
    const objAlt   = KNOWN_OBJECTS.map(esc).join("|");
    const re = new RegExp(`\\b(?:a|an|the|her|his|their|my)?\\s*((?:light|dark)\\s+)?(${colorAlt})\\s+(${objAlt})\\b`, "gi");
    const hits = [];
    let m;
    while ((m = re.exec(lower))) {
      const shade = (m[1] || "").trim();
      hits.push({
        phrase: `${shade ? shade + " " : ""}${m[2]} ${m[3]}`,
        head: m[3].toLowerCase(),
        colors: [ (shade ? shade + " " : "") + m[2] ].map(s => s.trim().toLowerCase())
      });
    }
    return hits;
  }

  function backupKnownSetting(lower) {
    for (const s of KNOWN_SETTINGS) {
      if (new RegExp(`\\b${esc(s)}\\b`, "i").test(lower)) return { phrase: s, head: s.toLowerCase() };
    }
    return null;
  }

  // Mini lemmatizer: irregulars → progressive (-ing)
  function toProgressive(token) {
    if (!token) return token;
    const lower = token.toLowerCase();
    const irregular = {
      run: "running", ran: "running",
      swim: "swimming", sit: "sitting", get: "getting",
      put: "putting", hug: "hugging", stop: "stopping",
      lie: "lying", see: "seeing", saw: "seeing",
      eat: "eating", ate: "eating", take: "taking",
      make: "making", write: "writing", drive: "driving",
      give: "giving", have: "having", use: "using",
      wear: "wearing", hold: "holding", carry: "carrying",
      walk: "walking", look: "looking", play: "playing"
    };
    if (irregular[lower]) return irregular[lower];
    if (/\bing\b$/i.test(lower)) return token;
    let base = lower.replace(/(ed|es|s)$/i, "");
    if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxz]$/i.test(base)) {
      return base + base.slice(-1) + "ing";
    }
    if (base.endsWith("e")) base = base.slice(0, -1);
    return base + "ing";
  }

  // Sentence extraction (hybrid)
  function extractSentenceHybrid(sentenceRaw) {
    const sentence = normalize(sentenceRaw);
    const tokens = tokenize(sentence);
    const lowerStr = sentence.toLowerCase();

    // ACTION - Three-tier detection system
    let action = null;

    // 1) Primary: root-verb + short tail (unchanged)
    for (let i = 0; i < tokens.length; i++) {
      if (VERB_RE.test(tokens[i])) {
        const span = [tokens[i]];
        for (let j = i + 1; j < tokens.length && span.length < 6; j++) {
          const t = tokens[j];
          if (/^[.,;!?]$/.test(t) || STOP_RE.test(t)) break;
          span.push(t);
        }
        action = span.join(" ").replace(/\s+([.,;!?])/g, "$1");
        break;
      }
    }

    // 2) Fallback: BE + -ing (e.g., "is laughing", "was running")
    if (!action) {
      for (let i = 0; i < tokens.length - 1; i++) {
        if (BE_RE.test(tokens[i]) && /^[A-Za-z]+ing$/i.test(tokens[i + 1]) && !NON_ACTION_ING.has(tokens[i + 1].toLowerCase())) {
          const span = [tokens[i + 1]];
          for (let j = i + 2; j < tokens.length && span.length < 6; j++) {
            const t = tokens[j];
            if (/^[.,;!?]$/.test(t) || STOP_RE.test(t)) break;
            span.push(t);
          }
          action = span.join(" ").replace(/\s+([.,;!?])/g, "$1");
          break;
        }
      }
    }

    // 3) Fallback: bare -ing action head (sentence gerund; e.g., "laughing with friends")
    if (!action) {
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (/^[A-Za-z]+ing$/i.test(tok) && !NON_ACTION_ING.has(tok.toLowerCase())) {
          const span = [tok];
          for (let j = i + 1; j < tokens.length && span.length < 6; j++) {
            const t = tokens[j];
            if (/^[.,;!?]$/.test(t) || STOP_RE.test(t)) break;
            span.push(t);
          }
          action = span.join(" ").replace(/\s+([.,;!?])/g, "$1");
          break;
        }
      }
    }

    // OBJECTS (including secondary characters)
    const objects = [];
    for (let i = 0; i < tokens.length; i++) {
      if (VERB_RE.test(tokens[i])) {
        const np = captureNounPhrase(tokens, i + 1, 8);
        if (np && np.head) {
          const key = np.head + "|" + (np.colors || []).join(",");
          if (!objects.some(o => o._k === key)) objects.push({ ...np, _k: key });
        }
      }
    }
    for (const p of backupColorObjectPairs(lowerStr)) {
      const key = p.head + "|" + (p.colors || []).join(",");
      if (!objects.some(o => o._k === key)) objects.push({ ...p, _k: key });
    }
    objects.forEach(o => delete o._k);

    // SETTING
    let setting = null;
    for (let i = 0; i < tokens.length; i++) {
      if (PREP_RE.test(tokens[i])) {
        const sp = captureSetting(tokens, i, 8);
        if (sp) { setting = sp; break; }
      }
    }
    if (!setting) setting = backupKnownSetting(lowerStr);

    return { action, objects, setting };
  }

  // Multi-sentence merge
  function extractHybrid(text) {
    const sentences = splitSentences(text);
    const merged = { action: null, setting: null, objects: [] };
    for (const s of sentences) {
      const part = extractSentenceHybrid(s);
      if (!merged.action && part.action) merged.action = part.action;
      if (!merged.setting && part.setting) merged.setting = part.setting;
      for (const o of part.objects) {
        const key = o.head + "|" + (o.colors || []).join(",");
        if (!merged.objects.some(x => (x.head + "|" + (x.colors || []).join(",")) === key)) {
          merged.objects.push(o);
        }
      }
    }
    return merged;
  }

  // ==========
  // Run hybrid
  // ==========
  const normalized = normalize(storyText);
  const lower = normalized.toLowerCase();
  const { action, objects, setting } = extractHybrid(normalized);

  // SYNTHESIZE ACTION: Generate contextual action if no action detected
  let actionText;
  if (!action) {
    console.log('⚠️ Missing action - synthesizing from context');
    
    // Priority 1: If setting exists → use "walking"  
    if (setting) {
      actionText = 'walking';
    }
    // Priority 2: If objects exist that map in VERB_OBJECT_CONTEXT → use mapped verb
    else if (objects.length > 0) {
      const firstObj = objects[0];
      const contextVerb = VERB_OBJECT_CONTEXT[firstObj.head.toLowerCase()];
      if (contextVerb) {
        actionText = contextVerb.split(' ')[0]; // e.g., "wearing", "carrying", "playing"
      } else {
        actionText = 'standing';
      }
    }
    // Priority 3: Default fallback
    else {
      actionText = 'standing';
    }
    console.log(`🔧 Synthesized action: "${actionText}"`);
  } else {
    // Format existing action → progressive verb + rest
    const words = action.split(/\s+/);
    if (words.length === 1) {
      actionText = toProgressive(words[0]);
    } else {
      actionText = toProgressive(words[0]) + " " + words.slice(1).join(" ");
    }
    actionText = actionText.trim();
  }

  // PHASE 2: MULTI-OBJECT PROCESSING - Process ALL objects, not just objects[0]
  const regularObjects = objects.filter(obj => 
    !SECONDARY_CHARACTER_KEYWORDS.includes(obj.head.toLowerCase())
  );
  
  const secondaryCharacters = objects.filter(obj => 
    SECONDARY_CHARACTER_KEYWORDS.includes(obj.head.toLowerCase())
  );

  // Build object text from ALL regular objects
  const objectText = regularObjects.map(obj => {
    const text = obj.colors && obj.colors.length ? `${obj.colors[0]} ${obj.head}` : obj.phrase;
    const contextVerb = VERB_OBJECT_CONTEXT[obj.head.toLowerCase()];
    return contextVerb ? `${contextVerb} ${text}` : text;
  }).join('. ');

  // Build secondary character text
  const secondaryText = secondaryCharacters.map(char => char.phrase || char.head).join(' and ');

  const settingText = setting
    ? (setting.phrase || setting.head)
    : (typeof extractLocationFromText === 'function' ? extractLocationFromText(lower) : null);

  // PHASE 3: SIMPLIFIED SCENE ASSEMBLY - Clean array-based approach
  const parts = [];
  if (actionText) parts.push(actionText);
  if (objectText) parts.push(objectText);
  if (secondaryText && actionText) parts.push(`with ${secondaryText}`);
  if (settingText) parts.push(`in the ${settingText}`);
  
  const scene = parts.join(' ').trim();

  if (scene) {
    console.log(`✅ Simple scene extracted: "${scene}"`);
    return scene;
  }

  return '';
}

// Helper function for location extraction
function extractLocationFromText(text) {
  const locationPattern = /\b(?:in|at|on|near)\s+(?:the\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/;
  const match = text.match(locationPattern);
  return match ? match[1] : null;
}

// PHASE 4.3: Permissive action validator (fails open)
function hasActionVerb(sceneOrResult) {
  // Accept either a scene string, or an object like { scene, secondary }
  const scene =
    typeof sceneOrResult === "string"
      ? sceneOrResult
      : (sceneOrResult && typeof sceneOrResult.scene === "string"
          ? sceneOrResult.scene
          : "");

  if (!scene) {
    console.log(`🔍 [DEBUG] hasActionVerb: Empty scene provided`);
    return false;
  }

  console.log(`🔍 [DEBUG] hasActionVerb: Validating scene: "${scene}"`);

  // Reject escalation strings immediately
  if (scene.startsWith("ESCALATE_")) {
    console.log(`🔍 [DEBUG] hasActionVerb: Rejecting escalation string: "${scene}"`);
    return false;
  }

  // --- Normalize & tokenize ---
  const text = scene.replace(/[""]/g, '"').replace(/[']/g, "'").trim();
  const tokens = (text.match(/[A-Za-z'-]+|[.,;!?]/g) || []).map(t => t.toLowerCase());

  if (tokens.length === 0) return false;

  // --- Verb roots (expand anytime; regex handles s|ed|ing)
  const VERB_ROOTS = [
    "see","hold","carry","wear","grab","pick","lift","bring","take","hug","pull","push",
    "walk","stroll","run","wander","tiptoe","explore","look","play","read","draw","build",
    "climb","swing","slide","help","clean","make","watch","eat","sing","dance",
    "wake","drink","create","hear","feel","smell","taste","touch","get","put","give",
    "come","go","find","study","cook","sleep","sit","stand","laugh","giggle","chuckle",
    // add as needed; validator stays permissive
  ];
  const ROOT_ALT = VERB_ROOTS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const ROOT_WORD_RE = new RegExp(`^(?:${ROOT_ALT})(?:s|ed|ing)?$`, "i"); // token-level
  const ROOT_TEXT_RE = new RegExp(`\\b(?:${ROOT_ALT})(?:s|ed|ing)?\\b`, "i"); // text-level

  // --- BE + -ing and -ing fallback (lenient) ---
  const BE_SET = new Set(["am","is","are","was","were","be","been","being"]);

  // tiny ignore list to avoid obvious non-actions; keep small to stay permissive
  const IGNORE_ING = new Set([
    "during","morning","evening","nothing","something","anything","everything",
    "ceiling","building","buildings","thing","wing","spring" // keep minimal
  ]);

  // --- Particles for phrasal verbs (wake up, pick up, put on, etc.)
  const PARTICLES = new Set(["up","down","out","in","on","off","over","through","around","into","across","away","back"]);

  // 0) Quick text-level root match (fast path)
  if (ROOT_TEXT_RE.test(text)) {
    console.log(`🔍 [DEBUG] hasActionVerb: SUCCESS - Text-level root match found in: "${scene}"`);
    return true;
  }

  // 1) Token-level root match (covers weird punctuation splits)
  for (const tok of tokens) {
    if (ROOT_WORD_RE.test(tok)) {
      console.log(`🔍 [DEBUG] hasActionVerb: SUCCESS - Token-level root match "${tok}" found in: "${scene}"`);
      return true;
    }
  }

  // 2) BE + -ing (is/are/was/were + gerund) — permissive
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i], n1 = tokens[i + 1];
    if (BE_SET.has(t) && /^[a-z]+ing$/.test(n1) && !IGNORE_ING.has(n1)) {
      console.log(`🔍 [DEBUG] hasActionVerb: SUCCESS - BE + -ing pattern "${t} ${n1}" found in: "${scene}"`);
      return true;
    }
  }

  // 3) Bare -ing fallback (lenient): any -ing token not in ignore list counts
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (/^[a-z]+ing$/.test(tok) && !IGNORE_ING.has(tok)) {
      console.log(`🔍 [DEBUG] hasActionVerb: SUCCESS - Bare -ing "${tok}" found in: "${scene}"`);
      return true;
    }
  }

  // 4) Phrasal verbs: <root>(s|ed|ing)? … <particle> within 2 tokens (allows pronoun/object)
  for (let i = 0; i < tokens.length; i++) {
    if (ROOT_WORD_RE.test(tokens[i])) {
      const n1 = tokens[i + 1], n2 = tokens[i + 2];
      if ((n1 && PARTICLES.has(n1)) || (n2 && PARTICLES.has(n2))) {
        console.log(`🔍 [DEBUG] hasActionVerb: SUCCESS - Phrasal verb pattern found in: "${scene}"`);
        return true;
      }
    }
  }

  // If we get here, we didn't see credible action hints
  console.log(`🔍 [DEBUG] hasActionVerb: No action detected in: "${scene}"`);
  console.log(`🔍 [DEBUG] hasActionVerb: Tokens analyzed: ${JSON.stringify(tokens)}`);
  return false;
}

// PHASE 4.4: ESCALATION REMOVED - ORCHESTRATOR HANDLES TIER TRANSITIONS

// Continue with rest of existing implementation...
// ============= HELPER FUNCTIONS FOR TEMPLATE RESOLUTION =============
// Using StaticDataCache functions to avoid duplicates

// ============= TIER 2.5A/B TEMPLATES - CATEGORY-BASED WITH LINE BREAKS =============
const TIER_25A_TEMPLATE = `Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Action: {semantic_scene}.
Secondary elements: {secondary_characters}.
Consistency: {visual_consistency_elements} {setting_context}.
Context: {cultural_context}, {community_context}.
Brand Suffix: {frameworkPrompt}, {cameraDirective}.`;

// PHASE 5: FIXED TIER_25B_TEMPLATE FORMATTING - Added missing period and proper line breaks
const TIER_25B_TEMPLATE = `Narrative: {pageText}.
Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}.
Action: {scene}.
Context: {cultural_context} {leftover_data}.
Brand Suffix: {fullFrameworkPrompt}.`;

// ============= EXPORT TEMPLATES FOR VALIDATION =============
export { TIER_25A_TEMPLATE, TIER_25B_TEMPLATE };

// ============= TEMPLATE NAME ALIASES FOR COMPATIBILITY =============
export const PREMIUM_PROMPT_TEMPLATE = TIER_25A_TEMPLATE;
export const BASIC_PROMPT_TEMPLATE = TIER_25B_TEMPLATE;

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
      service: 'runware-template-ab',
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }

  try {
    // Generate requestId for this function call
    const requestId = Math.random().toString(36).substring(2, 10);
    
    // FLEXIBLE PAYLOAD HANDLING: Handle nested {bundle: {...}, config: {...}} OR flat payloads
    const rawPayload = await req.json();
    console.log(`🔍 [${requestId}] Template AB: Request payload keys:`, Object.keys(rawPayload));
    // Log sanitized payload structure (mask PII)
    const sanitizedPayload = {
      ...rawPayload,
      userInfo: rawPayload.userInfo ? { 
        name: '[MASKED]', 
        childName: '[MASKED]',
        ...Object.fromEntries(Object.keys(rawPayload.userInfo).filter(k => !['name', 'childName', 'email'].includes(k)).map(k => [k, rawPayload.userInfo[k]]))
      } : undefined
    };
    console.log(`🔍 [${requestId}] Template AB: Payload structure (PII masked):`, JSON.stringify(sanitizedPayload, null, 2));
    
    // Detect nested payload structure from ImageTierTester
    let payload;
    if (rawPayload.bundle && rawPayload.config) {
      console.log('📦 Template AB: Detected nested payload structure');
      payload = {
        ...rawPayload.bundle,
        templateComplexity: rawPayload.config.templateComplexity
      };
    } else {
      console.log('📄 Template AB: Using flat payload structure');
      payload = rawPayload;
    }
    
    // Handle test mode - return success for test payloads
    if (payload.test === true) {
      console.log('🧪 Template AB: Test mode detected - returning success response');
      return createResponse({
        success: true,
        message: 'Template AB test successful',
        service: 'runware-template-ab',
        capabilities: {
          templateComplexity: ['A', 'B'],
          imageGeneration: true,
          characterConsistency: true,
          culturalEnhancements: true,
          semanticSceneExtraction: true
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Helper function to get visual consistency elements using CharacterConsistencyService
    async function getVisualConsistencyElements(sessionId, extractedScene, fallbackColoredObjects, preAnalyzedData) {
      // First priority: Use preAnalyzedData from cascade
      if (preAnalyzedData?.visualDetails) {
        console.log(`✅ [TIER2.5A] Using cascade preAnalyzedData: ${preAnalyzedData.visualDetails.substring(0, 100)}`);
        return preAnalyzedData.visualDetails;
      }
      
      // Second priority: Use consolidated CharacterConsistencyService
      try {
        const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
        const coloredObjects = await characterConsistencyService.getColoredObjects(sessionId);
        if (coloredObjects) {
          console.log(`✅ [TIER2.5A] Using CharacterConsistencyService colored objects: ${coloredObjects.substring(0, 100)}`);
          return coloredObjects;
        }
      } catch (error) {
        console.warn('CharacterConsistencyService failed, using fallback:', error.message);
      }
      
      // Fallback to existing logic
      return fallbackColoredObjects || 
        (extractedScene?.objects?.length ? extractedScene.objects.map(o => o.phrase).join(', ') : '');
    }
    
    let enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId, preAnalyzedData;
    
    if (payload.bundle && payload.config) {
      // Bundle format: {bundle: {pageText, userInfo, sessionId, pageNumber}, config: {templateComplexity}}
      console.log('📦 Template AB: Detected nested payload structure');
      const bundle = payload.bundle;
      const config = payload.config;
      // ENHANCED: Support multiple text field names with cascading fallbacks
      storyText = bundle.pageText || bundle.storyText || payload.pageText || payload.storyText;
      enhancedStoryData = { userInfo: bundle.userInfo || payload.userInfo };
      pageNumber = bundle.pageNumber || payload.pageNumber || 1;
      avatarIdentity = bundle.userInfo?.avatar || payload.userInfo?.avatar;
      templateComplexity = config.templateComplexity || payload.templateComplexity || 'A';
      sessionId = bundle.sessionId || payload.sessionId;
      preAnalyzedData = bundle.preAnalyzedData || payload.preAnalyzedData; // Extract cascade data
    } else if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber}
      console.log('📄 Template AB: Using pageText format');
      storyText = payload.pageText || payload.storyText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity || 'A';
      sessionId = payload.sessionId;
      preAnalyzedData = payload.preAnalyzedData; // Extract cascade data
    } else if (payload.storyText) {
      // storyText format: {storyText, userInfo, sessionId, pageNumber}
      console.log('📝 Template AB: Using storyText format');
      storyText = payload.storyText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
      preAnalyzedData = payload.preAnalyzedData; // Extract cascade data
    } else if (payload.enhancedStoryData?.storyText) {
      // Nested enhancedStoryData format
      console.log('📦 Template AB: Using nested enhancedStoryData.storyText format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.enhancedStoryData.storyText;
      pageNumber = payload.pageNumber || payload.enhancedStoryData.pageNumber;
      avatarIdentity = payload.enhancedStoryData.userInfo?.avatar || payload.avatarIdentity || {};
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId || payload.enhancedStoryData.sessionId;
      preAnalyzedData = payload.preAnalyzedData; // Extract cascade data
    } else {
      // Legacy format: {enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId}
      console.log('📖 Template AB: Using legacy format');
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      storyText = payload.storyText;
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.avatarIdentity || {};
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
      preAnalyzedData = payload.preAnalyzedData; // Extract cascade data
    }
    
    // PHASE 4.1: ENHANCED VALIDATION - Check for pageText/storyText and validate content
    if (!storyText || storyText.trim().length === 0) {
      return createErrorResponse(new Error('Missing required field: pageText OR storyText'));
    }

    console.log(`🎯 Template AB processing complexity: ${templateComplexity || 'A'}`);

    // Extract user info from enhancedStoryData
    const userInfo = enhancedStoryData.userInfo || {};
    
    // Select template based on complexity (A or B)
    const selectedTemplate = selectTemplate(templateComplexity || 'A');
    console.log(`✅ Selected template: ${selectedTemplate.name}`);

    let templateResult;
    
    if (selectedTemplate.name === 'Premium Template A') {
      // Tier 2.5A: Premium processing with action verb validation
      console.log('🚀 Processing Tier 2.5A: Premium Template with full features');
      
      // Use semantic scene extraction for Tier A
      let extractedScene = extractSemanticScene(storyText);
      
      console.log(`🔍 [DEBUG] Tier 2.5A Scene Extraction Result: "${typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene}"`);
      console.log(`🔍 [DEBUG] Tier 2.5A Action Validation Input: ${JSON.stringify({
        scene: typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene,
        hasAction: hasActionVerb(extractedScene),
        sceneType: typeof extractedScene,
        sceneLength: (typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene)?.length || 0
      })}`);
      
      // VALIDATE SCENE HAS ACTION VERB - IMMEDIATE ESCALATION IF NOT
      if (!extractedScene || !hasActionVerb(extractedScene)) {
        console.log('⚠️ Tier 2.5A: Scene missing action verb - falling through to Tier 2.5B');
        // Escalation logic is handled inline in catch block below
      }
      
      // Build template data using PREMIUM_PROMPT_TEMPLATE
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      const characterName = userInfo?.name || userInfo?.childName || 'child';
      const age = userInfo?.age || 'young child';
      const ethnicity = deriveRegionalEthnicity(userInfo, avatarIdentity);
      const skinTone = userInfo?.avatar?.skinTone || 'medium';
      // Get cultural bundle with character consistency
      let culturalBundle;
      try {
        const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
        culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
      } catch (error) {
        console.error('❌ Failed to get cultural bundle with consistency:', error);
        // Use emergency fallback
        culturalBundle = { hair: 'natural hair', features: 'diverse features' };
      }
      const hairDescription = culturalBundle?.hair || getHair(skinTone) || 'brown hair';
      const facialFeatures = culturalBundle?.features || getSkinBySkintone(skinTone, sessionId) || 'friendly expression';
      
      // Complete Character Consistency Service integration for Tier 2.5A
      let characterAppearance = '';
      let characterSeed = null;
      let detectedSecondaryCharacters = [];
      let secondaryDescriptions = [];
      let coloredObjects = '';
      const tier25aStart = Date.now();
      
      try {
        const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
        
        console.log(`🔍 [${requestId}] [TIER_2.5A] CCS Import: SUCCESS`, {
          sessionId,
          pageNumber,
          availableMethods: Object.keys(characterConsistencyService).filter(k => typeof characterConsistencyService[k] === 'function')
        });
        
        if (sessionId) {
          try {
            // Main character analysis
            await characterConsistencyService.analyzeVisualDetails(sessionId, storyText, pageNumber || 1, characterName);
            characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, characterName) || '';
            
            console.log(`🔍 [${requestId}] [TIER_2.5A] analyzeVisualDetails: SUCCESS`, {
              sessionId,
              pageNumber,
              timing: `${Date.now() - tier25aStart}ms`
            });
            
            // Get enhanced character seed with proper avatarIdentity (reuse outer scope)
            const avatarDataForSeed = {
              name: characterName,
              type: userInfo?.avatar?.type || 'child',
              skinTone: userInfo?.avatar?.skinTone || 'medium'
            };
            
            // Try enhanced seed first, fallback to basic on failure
            try {
              characterSeed = await characterConsistencyService.getEnhancedCharacterSeed(
                sessionId,
                avatarDataForSeed,
                storyText || '',
                'continuing'
              );
              
              console.log(`🔍 [${requestId}] [TIER_2.5A] getEnhancedCharacterSeed: SUCCESS`, {
                sessionId,
                pageNumber,
                inputs: { avatarIdentity: avatarDataForSeed, textLength: (storyText || '').length },
                outputs: characterSeed
              });
            } catch (enhancedError) {
              console.warn(`⚠️ Enhanced character seed failed, using basic seed fallback:`, enhancedError.message);
              characterSeed = await characterConsistencyService.getBasicCharacterSeed(avatarDataForSeed, sessionId);
            }
            
            // Secondary character detection using consolidated API
            const pageTextForAnalysis = storyText || extractedScene?.scene || extractedScene || '';
            const detections = await characterConsistencyService.detectAllCharacters(pageTextForAnalysis, {
              sessionId,
              pageNumber: pageNumber || 1,
              userInfo
            });
            detectedSecondaryCharacters = detections?.secondaryCharacters || [];
            
            console.log(`🔍 [${requestId}] [TIER_2.5A] detectAllCharacters: SUCCESS`, {
              sessionId,
              pageNumber,
              resultCount: detectedSecondaryCharacters.length,
              timing: `${Date.now() - tier25aStart}ms`
            });
            
            // PHASE 3: Build secondary character descriptions with FULL visual details
            const safeSecondaryCharacters = (detectedSecondaryCharacters || []).filter(character => character && character.name);
            for (const character of safeSecondaryCharacters) {
              try {
                // Runtime guard for generateCharacterForConsistency (ERROR-055 fix)
                let fullCharacterData;
                if (typeof characterConsistencyService?.generateCharacterForConsistency === 'function') {
                  console.log(`🔍 [${requestId}] [TIER_2.5A] CCS Method Availability: generateCharacterForConsistency=${typeof characterConsistencyService?.generateCharacterForConsistency}`);
                  fullCharacterData = await characterConsistencyService.generateCharacterForConsistency(
                    character.name,
                    character.type || 'secondary_character',
                    {
                      sessionId,
                      userInfo,
                      storyContext: storyText || '',
                      relationship: character.relationship
                    }
                  );
                } else {
                  console.warn(`⚠️ generateCharacterForConsistency not available for ${character.name}, using basic description`);
                  fullCharacterData = { 
                    characterName: character.name,
                    characterDescription: character.description || `${character.name} is a character`
                  };
                }
                
                // Use the DETAILED characterDescription instead of basic description
                const visualDescription = fullCharacterData?.characterDescription || 
                                          character.description || 
                                          `${character.name} is a character`;
                
                secondaryDescriptions.push(`${character.name}: ${visualDescription}`);
                console.log(`✅ Generated detailed visual description for ${character.name}`);
              } catch (charError) {
                console.warn(`⚠️ Failed to generate visual description for ${character.name}, using fallback`, charError);
                secondaryDescriptions.push(`${character.name}: ${character.description || 'character'} (${character.type || 'character'})`);
              }
            }
            
            // Get environmental consistency
            coloredObjects = await characterConsistencyService.getColoredObjects(sessionId) || '';
            
            // CPU budget guard for Tier 2.5A
            const TIER25A_CPU_BUDGET_MS = 1500;
            const elapsed25A = Date.now() - tier25aStart;
            if (elapsed25A > TIER25A_CPU_BUDGET_MS) {
              console.warn(`⚠️ [${requestId}] Tier 2.5A CPU budget exceeded (${elapsed25A}ms > ${TIER25A_CPU_BUDGET_MS}ms) — escalating to Tier 2.5B`);
              // Escalation to 2.5B is handled in the catch block below
              throw new Error('TIER_25A_CPU_BUDGET_EXCEEDED');
            }
          } catch (characterError) {
            console.error(`🚨 [${requestId}] Tier 2.5A: CharacterConsistencyService FAILED - Escalating to Tier 2.5B`, characterError.message);
            console.log(`⚡ [${requestId}] Tier 2.5A→2.5B Escalation Reason: Character consistency unavailable`);
            
            // ESCALATE TO TIER 2.5B: Switch complexity from 'A' to 'B' and re-process
            const escalatedPayload = {
              ...payload,
              templateComplexity: 'B'
            };
            
            console.log(`🔄 [${requestId}] Re-processing with Tier 2.5B (nuclear independent)...`);
            
            // Re-select template with complexity 'B'
            const escalatedTemplate = selectTemplate('B');
            console.log(`✅ [${requestId}] Escalated to: ${escalatedTemplate.name}`);
            
            // Jump to Tier 2.5B processing (skip to line 1783 logic)
            const extractedScene = extractSimpleScene(storyText);
            console.log(`🎯 [${requestId}] Tier 2.5B Escalation Scene: "${extractedScene}"`);
            
            const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
            const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
            const characterName = userInfo?.name || userInfo?.childName || 'child';
            const age = userInfo?.age || 'young child';
            const ethnicity = deriveRegionalEthnicity(userInfo, avatarIdentity);
            const skinTone = userInfo?.avatar?.skinTone || 'medium';
            const hairDescription = getHairBySkintone(skinTone) || 'brown hair';
            const facialFeatures = getSkinBySkintone(skinTone, sessionId) || 'friendly expression';
            const cultural_context = getCulturalContext(userInfo?.preferredLanguage || 'en');
            
            const leftoverDataTier2B = [
              preAnalyzedData?.timeOfDay,
              preAnalyzedData?.mood,
              preAnalyzedData?.lighting,
              preAnalyzedData?.atmosphere
            ].filter(Boolean).join(', ');
            
            const fullFrameworkPrompt = `${styleFramework.frameworkPrompt}, medium shot, child-safe, age-appropriate`;
            
            const tier2BPrompt = TIER_25B_TEMPLATE
              .replace('{pageText}', storyText)
              .replace('{character}', characterName)
              .replace('{age}', age)
              .replace('{ethnicity}', ethnicity)
              .replace('{hairDescription}', hairDescription)
              .replace('{facialFeatures}', facialFeatures)
              .replace('{scene}', extractedScene || storyText)
              .replace('{cultural_context}', cultural_context)
              .replace('{leftover_data}', leftoverDataTier2B)
              .replace('{fullFrameworkPrompt}', fullFrameworkPrompt)
              .replace(/\{[^}]+\}/g, '')
              .replace(/[ \t]+/g, ' ')
              .replace(/\s*\.\s*\./g, '.')
              .trim();
            
            templateResult = {
              positivePrompt: tier2BPrompt,
              negativePrompt: generateInlineNuclearNegative(culturalProfile, userInfo?.avatar?.type, userInfo?.difficulty) || 'blurry, low quality',
              templateType: 'Basic Template B - Escalated from 2.5A',
              tier: '2.5B',
              styleFrameworkUsed: styleFramework.name,
              escalated: true,
              escalationReason: 'character_consistency_failure'
            };
            
            console.log(`✅ [${requestId}] Tier 2.5A→2.5B Escalation Complete`);
            
            // Skip remaining Tier 2.5A logic and jump to Runware API call
            // Return early to avoid continuing with Tier 2.5A processing
            console.log('🌐 Calling Runware API with escalated Tier 2.5B template...');
            const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
            if (!runwareApiKey) {
              throw new Error('RUNWARE_API_KEY not configured');
            }
            
            const runwarePayload = {
              positivePrompt: templateResult.positivePrompt,
              negativePrompt: templateResult.negativePrompt,
              width: 1024,
              height: 1024,
              numberResults: 1,
              outputFormat: "WEBP",
              model: "runware:100@1",
              steps: 4,
              CFGScale: 1,
              scheduler: "FlowMatchEulerDiscreteScheduler"
            };
            
            if (templateResult.characterSeed) {
              runwarePayload.seed = templateResult.characterSeed;
            }
            
            const imageResult = await callRunwareWithRetry(runwarePayload, runwareApiKey);
            
            return createResponse({
              success: true,
              imageURL: imageResult.imageURL,
              template: templateResult,
              escalated: true,
              escalationReason: 'character_consistency_failure',
              tier: '2.5B'
            }, 200);
          }
        }
        
        console.log(`✅ [${requestId}] Tier 2.5A: Complete character consistency applied:`, {
          characterAppearance: !!characterAppearance,
          secondaryCharacters: detectedSecondaryCharacters.length,
          coloredObjects: !!coloredObjects
        });
      } catch (characterError) {
        // ESCALATE TO TIER 2.5B on ANY CharacterConsistencyService failure (import or method)
        console.error(`🚨 [${requestId}] Tier 2.5A: CharacterConsistencyService FAILED (outer catch) - Escalating to Tier 2.5B`, characterError.message);
        
        return createResponse({
          success: false,
          escalateToTier: '2.5B',
          reason: 'character_consistency_service_failure',
          sessionId: sessionId,
          complexity: 'B',
          errorDetails: characterError.message
        }, 200);
      }
      
      // Debug logging to verify extractSemanticScene data structure and character consistency
      console.log(`🔍 [DEBUG] Tier 2.5A extractSemanticScene result structure:`, {
        scene: extractedScene?.scene,
        secondary: extractedScene?.secondary,
        objects: extractedScene?.objects,  
        settings: extractedScene?.settings,
        type: typeof extractedScene,
        hasCharacterAppearance: !!characterAppearance,
        hasCharacterSeed: !!characterSeed,
        detectedSecondaryCharacters: detectedSecondaryCharacters.length,
        hasColoredObjects: !!coloredObjects
      });
      
      // Apply pageText summarization for levels 2-4
      const processedStoryText = summarizePageText(storyText, userInfo?.difficulty);
      
      // Use PREMIUM_PROMPT_TEMPLATE with proper placeholder replacement including character consistency
      const avatarType = userInfo?.avatar?.type || 'child';
      let finalPositivePrompt = PREMIUM_PROMPT_TEMPLATE
        .replace('{pageText}', processedStoryText)
        .replace('{character}', `A ${avatarType} named ${characterName}`)
        .replace('{age}', age)
        .replace('{ethnicity}', ethnicity)
        .replace('{hair}', characterAppearance.includes('hair') ? 
          characterAppearance.split(/hair|features/)[0].trim() || hairDescription : hairDescription)
        .replace('{features}', characterAppearance.includes('features') ? 
          characterAppearance.split('features')[1]?.split('.')[0]?.trim() || facialFeatures : facialFeatures)
        .replace('{bundle.culturalEnhancements}', culturalProfile || '')
        .replace('{semantic_scene}', extractedScene?.scene || extractedScene)
        .replace('{secondary_characters}', secondaryDescriptions.length ? secondaryDescriptions.join(', ') : 
          (extractedScene?.secondary?.length ? extractedScene.secondary.join(', ') : ''))
        .replace('{visual_consistency_elements}', await getVisualConsistencyElements(sessionId, extractedScene, coloredObjects, preAnalyzedData))
        .replace('{setting_context}', extractedScene?.settings?.length ? extractedScene.settings.join(', ') : '')
        .replace('{cultural_context}', culturalProfile || 'multicultural setting')
        .replace('{community_context}', '')
        .replace('{frameworkPrompt}', styleFramework.frameworkPrompt || 'contemporary children\'s book illustration style')
        .replace('{cameraDirective}', 'detailed illustration');
      
      // Add final debug logging for Tier 2.5A with character consistency data
      console.log(`🎯 [DEBUG] Tier 2.5A Final Prompt Data:`, {
        characterAppearance: characterAppearance.substring(0, 100),
        secondaryCharacters: secondaryDescriptions,
        visualElements: coloredObjects ? [coloredObjects] : (extractedScene?.objects?.map(o => o.phrase) || []),
        settingContext: extractedScene?.settings,
        hasCharacterSeed: !!characterSeed,
        promptLength: finalPositivePrompt.length
      });
      
      // Clean up any remaining placeholders
      finalPositivePrompt = finalPositivePrompt
        .replace(/\{[^}]+\}/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*\.\s*\./g, '.')
        .trim();
    
      templateResult = {
        positivePrompt: finalPositivePrompt,
        negativePrompt: generateInlineNuclearNegative(culturalProfile, userInfo?.avatar?.type, userInfo?.difficulty) || 'blurry, low quality',
        templateType: 'Premium Template A - Full Features',
        tier: '2.5A',
        styleFrameworkUsed: styleFramework.name,
        characterSeed: characterSeed
      };
      
    } else if (selectedTemplate.name === 'Basic Template B') {
      // Tier 2.5B: Basic processing with reduced features
      console.log('🚀 Processing Tier 2.5B: Basic Template with reduced features');
      
      // Tier 2.5B: Direct scene processing (called by orchestrator, not calling orchestrator)
      console.log(`🎯 [${requestId}] Tier 2.5B: Processing scene directly`);
      const extractedScene = extractSimpleScene(storyText);
      console.log(`🎯 TIER 2.5B Direct Scene Extraction: "${extractedScene}"`);
      console.log(`🔍 [DEBUG] Tier 2.5B Direct Scene - Action spans captured for: "${storyText.substring(0, 100)}..."`);
      
      // Basic character data for Tier 2.5B (no orchestrator dependency)
      let basicCharacterData = '';
      
      console.log(`🔍 [DEBUG] Tier 2.5B Scene Extraction Result: "${typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene}"`);
      console.log(`🔍 [DEBUG] Tier 2.5B Action Validation Input: ${JSON.stringify({
        scene: typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene,
        hasAction: hasActionVerb(extractedScene),
        sceneType: typeof extractedScene,
        sceneLength: (typeof extractedScene === 'object' && extractedScene?.scene ? extractedScene.scene : extractedScene)?.length || 0
      })}`);
      
      // Tier 2.5B: Basic validation only (orchestrator handles failures)
      console.log(`🎯 [${requestId}] Tier 2.5B: Basic processing - no escalation`);
      if (!extractedScene) {
        console.warn(`⚠️ [${requestId}] Tier 2.5B: Scene extraction failed, using fallback`);
        extractedScene = "child in a story scene";
      }
      
      // Build template data with proper placeholders
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      const characterName = userInfo?.name || userInfo?.childName || 'child';
      const age = userInfo?.age || 'young child';
      const skinTone = (userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium').toLowerCase();
      const language = userInfo?.nativeLanguage || 'en';
      
      // Get cultural bundle with character consistency
      let culturalBundle;
      try {
        const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
        culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
        console.log(`🔍 [TIER_2.5B] CCS cultural bundle loaded: hair=${culturalBundle?.hair}, features=${culturalBundle?.features}`);
      } catch (error) {
        console.error('❌ Failed to get cultural bundle with consistency:', error);
        // Skin-tone-aware emergency fallback (NO "diverse" for light skin)
        culturalBundle = { 
          hair: emergencyHairFallback(skinTone),
          features: getSkinBySkintone(skinTone)
        };
        console.log(`🔍 [TIER_2.5B] Emergency fallback applied: skinTone=${skinTone}, hair=${culturalBundle.hair}`);
      }
      const hairColor = culturalBundle?.hair || getHairBySkintone(skinTone, sessionId) || emergencyHairFallback(skinTone);
      
      // Ethnicity: Only african-american for dark skin + supported language, else Euro-American
      const ethnicity = (skinTone === 'dark' && ['en', 'es'].includes(language))
        ? 'african-american'
        : 'Euro-American';
      
      console.log(`🔍 [TIER_2.5B] Cultural assignment: skinTone=${skinTone}, hair=${hairColor}, ethnicity=${ethnicity}`);
      
      // Character description components - Use avatar type instead of generic "young child"
      const avatarTypeForB = userInfo?.avatar?.type || 'child';
      const character = `A ${avatarTypeForB} named ${characterName}`;
      const hairDescription = `${hairColor}`;
      const facialFeatures = getFacialFeatures(userInfo?.avatar) || 'friendly expression';
      const culturalContext = culturalProfile || 'multicultural setting';
      const leftoverData = deriveLeftoverCulturalData(userInfo) || '';
      const fullFrameworkPrompt = styleFramework.frameworkPrompt || 'contemporary children\'s book illustration style';
      
      // PHASE 4.1 & 4.2: REMOVE ALL FALLBACKS - Apply TIER_25B_TEMPLATE with NO fallbacks
      console.log('📋 Using official BASIC_PROMPT_TEMPLATE for Tier 2.5B');
      
      // Apply pageText summarization for levels 2-4
      const processedStoryText = summarizePageText(storyText, userInfo?.difficulty);
      
      let finalPositivePrompt = BASIC_PROMPT_TEMPLATE
        .replace('{pageText}', processedStoryText)  // REMOVED: || 'A child goes on an adventure' fallback
        .replace('{character}', character)
        .replace('{age}', age)
        .replace('{ethnicity}', ethnicity)
        .replace('{hairDescription}', hairDescription)
        .replace('{facialFeatures}', facialFeatures)
        .replace('{scene}', extractedScene)  // REMOVED: || 'playing outdoors' fallback
        .replace('{cultural_context}', culturalContext)
        .replace('{leftover_data}', leftoverData)
        .replace('{fullFrameworkPrompt}', fullFrameworkPrompt);

      console.log(`✅ BASIC_PROMPT_TEMPLATE Applied: "${finalPositivePrompt.substring(0, 100)}..."`);
      
      // Clean up any remaining placeholders or double spaces - PRESERVE LINE BREAKS
      finalPositivePrompt = finalPositivePrompt
        .replace(/[ \t]+/g, ' ')  // Only remove spaces and tabs, preserve newlines
        .replace(/\s*\.\s*\./g, '.')
        .trim();
      
      templateResult = {
        positivePrompt: finalPositivePrompt,
        negativePrompt: generateInlineNuclearNegative(culturalProfile, userInfo?.avatar?.type, userInfo?.difficulty) || 'blurry, low quality',
        templateType: 'Basic Template B - Reduced Features',
        tier: '2.5B',
        styleFrameworkUsed: styleFramework.name
      };
    }

    // Call Runware API with retry logic
    console.log('🌐 Calling Runware API with retry logic...');
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      throw new Error('RUNWARE_API_KEY not configured');
    }

    // ProviderGate: Check circuit and acquire slot before Runware call
    const gateKey = templateComplexity === 'A' ? 'T25A:runware-template-ab' : 'T25B:runware-template-ab';
    const gateResult = await ProviderGate.acquire(gateKey);
    
    if (!gateResult.acquired) {
      console.warn(`⚠️ [GATE] ${gateKey} unavailable: ${gateResult.reason}`);
      return new Response(JSON.stringify({
        success: false,
        error: gateResult.reason === 'CIRCUIT_OPEN' 
          ? 'Image generation service temporarily unavailable - circuit breaker active'
          : 'Image generation service at capacity - please retry',
        retryAfterSeconds: gateResult.retryAfterSeconds || 8,
        errorType: 'service_unavailable'
      }), {
        status: 503,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(gateResult.retryAfterSeconds || 8)
        }
      });
    }

    const MAX_RETRIES = 3;
    let imageURL = null;
    let lastError = null;
    let gateReleased = false;

    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏱️ Retry attempt ${attempt}/${MAX_RETRIES} after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch('https://api.runware.ai/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              taskType: 'authentication',
              apiKey: runwareApiKey,
            },
            {
              taskType: 'imageInference',
              taskUUID: crypto.randomUUID(),
              positivePrompt: templateResult.positivePrompt,
              negativePrompt: templateResult.negativePrompt,
              width: 1024,
              height: 1024,
              model: 'runware:100@1',
              numberResults: 1,
              outputFormat: 'WEBP',
              steps: 4,
              CFGScale: 1,
              scheduler: 'FlowMatchEulerDiscreteScheduler',
            },
          ]),
        });

        if (!response.ok) {
          throw new Error(`Runware API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const imageTask = data.data?.find(task => task.taskType === 'imageInference');
        
        if (!imageTask || !imageTask.imageURL) {
          throw new Error('No image URL in API response');
        }

        imageURL = imageTask.imageURL;
        
        // CRITICAL: Verify image URL is accessible before returning
        try {
          const headResponse = await fetch(imageURL, { method: 'HEAD' });
          if (!headResponse.ok) {
            throw new Error(`Image URL verification failed: ${headResponse.status}`);
          }
          console.log(`✅ Image URL verified accessible: ${imageURL}`);
        } catch (verifyError) {
          console.error(`❌ Image URL verification failed:`, verifyError);
          throw new Error(`Generated image URL not accessible: ${verifyError.message}`);
        }
        
        console.log(`✅ Runware API call successful on attempt ${attempt + 1}`);
        
        // Track Runware cost for analytics with 2-tier CDN fallback
        try {
          const cost = 0.0013;
          let supabaseClient = null;
          
    // Use vendor-first client for instant availability (no 28s CDN cascade)
    try {
      console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient for cost tracking');
      const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
      supabaseClient = await createVendorFirstSupabaseClient();
      console.log('✅ [VENDOR_FIRST] Supabase client initialized successfully (0ms network delay)');
    } catch (vendorError) {
      console.error('❌ [VENDOR_FIRST] Failed to create Supabase client:', vendorError);
      supabaseClient = null;
    }

          if (supabaseClient) {
            await supabaseClient.from('cost_tracking').insert({
              session_id: sessionId || 'template-ab-session',
            user_id: null,
            input_tokens: 0,
            output_tokens: 0,
            cost: cost,
            model_used: 'runware:100@1',
            operation_type: 'image_generation',
            provider: 'runware',
            api_endpoint: 'v1/imageInference',
            pricing_model: 'images',
              quantity_used: 1,
              unit_cost: cost
            });
            console.log('💰 Runware cost tracked: $' + cost.toFixed(4) + ' for image generation');
          } else {
            console.warn('💰 Cost tracking skipped: Supabase client unavailable');
          }
        } catch (costTrackingError) {
          console.warn('Failed to track Runware cost:', costTrackingError.message);
        }

        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.error(`❌ Runware API call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error.message);
        
        if (attempt === MAX_RETRIES) {
          throw new Error(`Runware API failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
        }
      }
      }
      
      // Release gate on success
      ProviderGate.release(gateKey, true);
      gateReleased = true;
      
    } catch (runwareError) {
      // Release gate on failure
      if (!gateReleased) {
        ProviderGate.release(gateKey, false);
        gateReleased = true;
      }
      throw runwareError;
    }

    const result = {
      success: true,
      imageURL,
      templateData: templateResult,
      complexity: templateComplexity || 'A',
      sessionArchitecture: 'parameter-based',
      processedAt: new Date().toISOString(),
      positivePrompt: templateResult.positivePrompt,
      negativePrompt: templateResult.negativePrompt
    };

    // Log successful template generation with resilient Supabase client
    try {
      let supabaseClient = null;
      
      // Use vendor-first client for instant availability (no 28s CDN cascade)
      try {
        console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient for logging');
        const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
        supabaseClient = await createVendorFirstSupabaseClient();
        console.log('✅ [VENDOR_FIRST] Supabase client initialized successfully for logging');
      } catch (vendorError) {
        console.error('❌ [VENDOR_FIRST] Failed to create Supabase client:', vendorError);
        supabaseClient = null;
      }
      
      const { logTierAttempt } = await import("../_shared/tierLogging.js");
      await logTierAttempt(
        supabaseClient,
        sessionId,
        'template-ab-req',
        templateResult.tier || 'template-ab',
        'success',
        {
          positive_prompt: templateResult.positivePrompt,
          negative_prompt: templateResult.negativePrompt,
          visual_details: preAnalyzedData?.visualDetails,
          edgeFunction: 'runware-template-ab',
          pageNumber: pageNumber || 1,
          imageUrl: imageURL
        }
      );
    } catch (loggingError) {
      console.warn('Failed to log template AB success:', loggingError.message);
    }

    return createResponse(result);
    
  } catch (error) {
    const runwareError = RunwareErrorHandler.categorizeRunwareError(error);
    console.error('❌ [Template AB] Error:', runwareError);
    
    // Return appropriate HTTP status based on error type
    const httpStatus = runwareError.type === 'quota_exceeded' ? 429 : 
                       runwareError.type === 'validation_failure' ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      success: false,
      error: runwareError.message,
      errorType: runwareError.type,
      escalation: runwareError.escalation,
      retry: runwareError.retry,
      code: runwareError.code
    }), {
      status: httpStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Export for TypeScript receptionist
export default handleRequest;