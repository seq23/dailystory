// DEPLOY_MARKER: 2025-09-15T00:12:00Z - FORCE REDEPLOY PRIORITY
// ============= TIER 2.5A-B: RUNWARE TEMPLATE AB (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

import { callRunwareAPIWithRetry } from './callRunwareAPIWithRetry.js';
import { 
  getHairBySkintone, 
  getSkinBySkintone,
  getAfricanAmericanHair, 
  getAfricanAmericanFeatures, 
  shouldApplyCulturalEnhancements,
  getCulturalBundle 
} from '../_shared/StaticDataCache.js';

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
  
  console.log(`🎨 Nuclear Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// ============= NUCLEAR INDEPENDENCE: COMPREHENSIVE NEGATIVE PROMPTS =============
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // CHILDREN'S BOOK ILLUSTRATION PROTECTION - Prevent adult photos and realistic photography
  const childrenBookNegativeBlock = 'NO adult faces, adult features, mature faces, adult photos, realistic photography, photorealistic adults, adult portraits, grown-up faces, realistic human photos, photo of adults, adult photography, mature portraits, realistic adult imagery, photo-realistic people, adult subjects, mature individuals, realistic human photography, adult models, stock photos of adults, professional adult photography';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
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

console.log(`INIT runware-template-ab boot at ${new Date().toISOString()} | std@0.168.0`);

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getPhaseOrchestrator() {
  try {
    // DNS error detection and defensive handling
    console.log('🔄 Loading PhaseIntegrationOrchestrator...');
    const { phaseIntegrationOrchestrator } = await import("../_shared/PhaseIntegrationOrchestrator.js");
    console.log('✅ PhaseIntegrationOrchestrator loaded successfully');
    return phaseIntegrationOrchestrator;
  } catch (error) {
    console.warn('⚠️ PhaseIntegrationOrchestrator lazy load failed (DNS/Sync):', error.message);
    
    // Circuit breaker: Detect repeated failures
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('dns') || errorMessage.includes('network') || errorMessage.includes('module not found')) {
      console.warn('🔄 DNS/Network error detected, using graceful degradation');
    }
    
    return null;
  }
}

// ============= FIXED REGIONAL ETHNICITY DERIVATION =============
function deriveRegionalEthnicity(userInfo, avatarIdentity) {
  // Primary: Use avatar ethnicity if available
  if (avatarIdentity?.ethnicity) {
    return avatarIdentity.ethnicity;
  }
  
  // Secondary: Derive from language and skin tone
  const nativeLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
  const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  
  // Language-based ethnicity mapping
  const languageEthnicityMap = {
    'es': 'Hispanic',
    'pt': 'Portuguese',
    'fr': 'French',
    'it': 'Italian',
    'de': 'German',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Indian',
    'ru': 'Russian'
  };
  
  // For dark skin tones, enforce ethnicity
  if (skinTone === 'dark' || skinTone === 'darker') {
    if (['en', 'fr'].includes(nativeLanguage)) {
      return 'African American';
    } else if (nativeLanguage === 'pt') {
      return 'Afro-Brazilian';
    } else if (nativeLanguage === 'es') {
      return 'Afro-Latino';
    }
  }
  
  // For light/pale/medium/olive skin with English - NO ethnicity (empty string)
  if (nativeLanguage === 'en' && ['light', 'pale', 'medium', 'olive'].includes(skinTone)) {
    return '';
  }
  
  // Use language mapping for other cases
  return languageEthnicityMap[nativeLanguage] || '';
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
    const processedResult = await orchestrator.processContentThroughAllPhases(pageText, context);
    
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
  if (typeof difficulty === 'number') return difficulty;
  const difficultyMap = {
    'beginner': 1,
    'easy': 2, 
    'medium': 3,
    'hard': 4,
    'expert': 5
  };
  return difficultyMap[difficulty?.toLowerCase()] || 2;
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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

// Inline cultural detection for proper profile resolution
function inlineDetectCultural(userInfo, avatarIdentity) {
  const culturalProfile = {
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    skinTone: userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || 'light',
    includes: function(term) {
      return this.nativeLanguage === term || this.skinTone === term;
    }
  };
  
  if (culturalProfile.nativeLanguage !== 'en' || 
      ['dark', 'medium-dark', 'brown'].includes(culturalProfile.skinTone)) {
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

// ============= ENHANCED SCENE EXTRACTION FOR TIER 2.5A =============
function extractSemanticScene(storyText) {
  if (!storyText || typeof storyText !== 'string') return 'playing happily';
  
  // Advanced scene extraction with semantic understanding
  const text = storyText.toLowerCase();
  
  const semanticPatterns = [
    { regex: /character.*?(\w+ing).*?(with|in|at)\s+([^.,!?]+)/i, transform: (m) => `${m[1]} ${m[2]} ${m[3]}` },
    { regex: /(\w+ing)\s+.*?(happily|sadly|excitedly|carefully|quietly)/i, transform: (m) => `${m[1]} ${m[2]}` },
    { regex: /character.*?(discovers|finds|sees)\s+([^.,!?]+)/i, transform: (m) => `discovering ${m[2]}` }
  ];
  
  for (const pattern of semanticPatterns) {
    const match = storyText.match(pattern.regex);
    if (match) {
      return pattern.transform(match);
    }
  }
  
  // Fallback to simple scene extraction
  return extractSimpleScene(storyText) || 'engaging in story activity';
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

  // ESCALATION LOGIC: Check for missing action
  if (!action) {
    console.log('⚠️ Missing action - escalating to next tier');
    return 'ESCALATE_MISSING_ACTION';
  }

  // Format action → progressive verb + rest
  const actionText = action ? (() => {
    const words = action.split(/\s+/);
    if (words.length === 1) {
      return toProgressive(words[0]);
    } else {
      return toProgressive(words[0]) + " " + words.slice(1).join(" ");
    }
  })().trim() : null;

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

// PHASE 4.4: ADD escalateToNextTier() ESCALATION FUNCTION  
async function escalateToNextTier(originalPayload) {
  console.log('🚨 ESCALATING: No valid scene extracted, passing to next tier (CD)');
  try {
    // Call next tier function
    const { serve } = await import("https://deno.land/std@0.168.0/http/server.ts");
    // For now, return a structured error that can be handled by the calling system
    return {
      escalated: true,
      reason: 'scene_extraction_failed',
      suggestedTier: 'runware-template-cd',
      originalPayload: originalPayload
    };
  } catch (error) {
    console.error('Escalation failed:', error);
    throw new Error('Scene extraction failed and escalation unavailable');
  }
}

// Continue with rest of existing implementation...
// ============= HELPER FUNCTIONS FOR TEMPLATE RESOLUTION =============

function deriveEthnicityFromAvatar(avatar) {
  if (!avatar) return 'diverse background';
  const type = avatar.type;
  if (type === 'person') return avatar.ethnicity || 'diverse background';
  return 'diverse background';
}

function getFacialFeatures(avatar) {
  if (!avatar) return 'friendly expression';
  return 'bright eyes and a warm smile';
}

function deriveLeftoverCulturalData(userInfo) {
  const culturalElements = [];
  if (userInfo?.nativeLanguage && userInfo.nativeLanguage !== 'en') {
    culturalElements.push('culturally diverse');
  }
  if (userInfo?.location) {
    culturalElements.push(`from ${userInfo.location}`);
  }
  return culturalElements.join(', ');
}

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle health check requests (GET/HEAD)
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createResponse({
      status: 'healthy',
      functionName: 'runware-template-ab',
      timestamp: new Date().toISOString(),
      version: '2.1'
    });
  }

  try {
    // FLEXIBLE PAYLOAD HANDLING: Handle nested {bundle: {...}, config: {...}} OR flat payloads
    const rawPayload = await req.json();
    console.log('🔍 Template AB: Request payload keys:', Object.keys(rawPayload));
    
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
    
    let enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId;
    
    if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber}
      console.log('📄 Template AB: Using pageText format');
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
    } else {
      // Legacy format: {enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId}
      console.log('📖 Template AB: Using legacy format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.avatarIdentity;
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
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
      const extractedScene = extractSemanticScene(storyText);
      
      console.log(`🔍 [DEBUG] Tier 2.5A Scene Extraction Result: "${extractedScene}"`);
      console.log(`🔍 [DEBUG] Tier 2.5A Action Validation Input: ${JSON.stringify({
        scene: extractedScene,
        hasAction: hasActionVerb(extractedScene),
        sceneType: typeof extractedScene,
        sceneLength: extractedScene?.length || 0
      })}`);
      
      // VALIDATE SCENE HAS ACTION VERB - IMMEDIATE ESCALATION IF NOT
      if (!extractedScene || !hasActionVerb(extractedScene)) {
        console.log('⚠️ Tier 2.5A: Scene missing action verb - escalating to next tier');
        const escalationResult = await escalateToNextTier(payload);
        return createResponse({
          success: false,
          escalated: true,
          reason: 'scene_extraction_failed',
          details: 'Tier 2.5A: Scene missing required action verb - escalating to next tier',
          escalationResult
        }, 200);
      }
      
      // Build template data using PREMIUM_PROMPT_TEMPLATE
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      const characterName = userInfo?.name || userInfo?.childName || 'child';
      const age = userInfo?.age || 'young child';
      const ethnicity = deriveRegionalEthnicity(userInfo, avatarIdentity);
      const hairDescription = getHair(userInfo?.avatar?.skinTone) || 'brown hair';
      const facialFeatures = getFeatures(userInfo?.avatar?.skinTone) || 'friendly expression';
      
      // Apply pageText summarization for levels 2-4
      const processedStoryText = summarizePageText(storyText, userInfo?.difficulty);
      
      // Use PREMIUM_PROMPT_TEMPLATE with proper placeholder replacement
      let finalPositivePrompt = PREMIUM_PROMPT_TEMPLATE
        .replace('{pageText}', processedStoryText)
        .replace('{character}', `A young child named ${characterName}`)
        .replace('{age}', age)
        .replace('{ethnicity}', ethnicity)
        .replace('{hair}', hairDescription)
        .replace('{features}', facialFeatures)
        .replace('{bundle.culturalEnhancements}', culturalProfile || '')
        .replace('{semantic_scene}', extractedScene)
        .replace('{secondary_characters}', '')
        .replace('{visual_consistency_elements}', '')
        .replace('{setting_context}', '')
        .replace('{cultural_context}', culturalProfile || 'multicultural setting')
        .replace('{community_context}', '')
        .replace('{frameworkPrompt}', styleFramework.frameworkPrompt || 'contemporary children\'s book illustration style')
        .replace('{cameraDirective}', 'detailed illustration');
      
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
        styleFrameworkUsed: styleFramework.name
      };
      
    } else if (selectedTemplate.name === 'Basic Template B') {
      // Tier 2.5B: Basic processing with reduced features
      console.log('🚀 Processing Tier 2.5B: Basic Template with reduced features');
      
      // Try orchestrator for basic enhancement, fallback to simple extraction
      const orchestratedData = await processWithOrchestrator(sessionId, storyText, userInfo, avatarIdentity, pageNumber);
      let extractedScene;
      let basicCharacterData = '';
      
      if (orchestratedData) {
        // Use orchestrator's basic prompt enhancement
        extractedScene = orchestratedData.basicScene || extractSimpleScene(storyText);
        if (orchestratedData.characterData?.basicAppearance) {
          basicCharacterData = orchestratedData.characterData.basicAppearance;
        }
        console.log(`🎯 TIER 2.5B Orchestrated Scene: "${extractedScene}"`);
      } else {
        // Nuclear fallback: Use simple scene extraction
        extractedScene = extractSimpleScene(storyText);
        console.log(`🎯 TIER 2.5B Nuclear Scene Extraction: "${extractedScene}"`);
      }
      
      console.log(`🔍 [DEBUG] Tier 2.5B Scene Extraction Result: "${extractedScene}"`);
      console.log(`🔍 [DEBUG] Tier 2.5B Action Validation Input: ${JSON.stringify({
        scene: extractedScene,
        hasAction: hasActionVerb(extractedScene),
        sceneType: typeof extractedScene,
        sceneLength: extractedScene?.length || 0
      })}`);
      
      // VALIDATE SCENE HAS ACTION VERB - IMMEDIATE ESCALATION IF NOT
      if (!extractedScene || !hasActionVerb(extractedScene)) {
        console.log('⚠️ Tier 2.5B: Scene missing action verb - escalating to next tier');
        const escalationResult = await escalateToNextTier(payload);
        return createResponse({
          success: false,
          escalated: true,
          reason: 'scene_extraction_failed',
          details: 'Tier 2.5B: Scene missing required action verb - escalating to next tier',
          escalationResult
        }, 200);
      }
      
      // Build template data with proper placeholders
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      const characterName = userInfo?.name || userInfo?.childName || 'child';
      const age = userInfo?.age || 'young child';
      const skinTone = userInfo?.avatar?.skinTone || 'medium';
      const hairColor = getHair(skinTone);
      const ethnicity = userInfo?.avatar?.ethnicity || deriveEthnicityFromAvatar(userInfo?.avatar) || 'diverse background';
      
      // Character description components
      const character = `A young child named ${characterName}`;
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

    // Call Runware API
    const apiResponse = await callRunwareAPIWithRetry(templateResult.positivePrompt, templateResult.negativePrompt);
    const imageURL = apiResponse.imageURL || apiResponse;

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

    return createResponse(result);
    
  } catch (error) {
    console.error('❌ [Template AB] Error:', error);
    return createErrorResponse(error);
  }
}

// Export for TypeScript receptionist
export default handleRequest;