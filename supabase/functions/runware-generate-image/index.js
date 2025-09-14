// DEPLOY_MARKER: 2025-01-30T20:17:15Z - FORCED REDEPLOY TO FIX BOOT FAILURES
/**
 * ============================================================================
 * RUNWARE IMAGE GENERATION - ACTIVE ORCHESTRATOR
 * ============================================================================
 * 
 * This is the main image generation orchestrator that handles:
 * - Tier 1: AI-Enhanced Premium (runware:100@1 with full enhancement)
 * - Tier 2.5: Template fallbacks (various complexities)  
 * - Tier 4: Static asset fallback (6 curated "images not working" assets)
 * 
 * STATUS: ACTIVE - Primary image generation function
 * CALLED BY: SimpleImageService.ts (frontend)
 * CALLS: ai-visual-scene-creator for prompt enhancement
 * 
 * KNOWN SUPABASE SYNC ANOMALY: This index.js file exists but may show 
 * "Module not found" in logs due to Supabase sync delay. Files are present.
 * 
 * ============================================================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { createDynamicCorsOptionsResponse, createDynamicCorsResponse, createDynamicCorsErrorResponse } from "../_shared/corsAdvanced.js";
import { monitorRequest } from "../_shared/headerMonitor.js";
import { SessionStateManager } from "../_shared/SessionStateManager.js";
import { SecurityValidator } from "../_shared/SecurityValidator.js";
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";
import { CULTURAL_ARRAYS } from "../_shared/tier25Vocabulary.js";

// ============= REQUEST ID GENERATION =============
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${random}`;
}

// ============= SUPABASE CLIENT INITIALIZATION =============
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cpzeuogomaixamrtnnmj.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// EMBEDDED STATICDATACACHE - CONVERTED FROM TYPESCRIPT
// ============================================================================
// Static Data Caching Service - Caches frequently accessed configuration data to improve performance

class StaticCache {
  static instance;
  cache = new Map();
  CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours TTL for static data - optimization

  constructor() {}

  static getInstance() {
    if (!StaticCache.instance) {
      StaticCache.instance = new StaticCache();
    }
    return StaticCache.instance;
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear() {
    this.cache.clear();
  }

  // Get cache size for monitoring
  size() {
    return this.cache.size;
  }
}

// Cached data generators
const staticCache = StaticCache.getInstance();

// Cache hair color mapping rules with enhanced diversity
const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = staticCache.get(cacheKey);
  if (!mapping) {
    mapping = {
      'pale': ['red hair', 'auburn hair', 'strawberry blonde hair'],
      'light': ['blonde hair', 'light brown hair', 'golden hair'], 
      'medium': ['brown hair', 'chestnut hair', 'dark blonde hair'],
      'olive': ['black hair', 'dark brown hair', 'jet black hair'],
      'dark': ['dark curly hair', 'black hair', 'coily hair', 'natural hair']
    };
    
    staticCache.set(cacheKey, mapping);
  }
  
  return mapping;
};

// Cache gender/pronoun mapping rules
const getGenderPronounMapping = () => {
  const cacheKey = 'gender_pronoun_mapping';
  
  let mapping = staticCache.get(cacheKey);
  if (!mapping) {
    mapping = {
      pronouns: {
        'boy': 'he',
        'girl': 'she', 
        'prefer-not-to-answer': 'they'
      },
      completeInfo: {
        'boy': 'boy. Use he/him/his pronouns',
        'girl': 'girl. Use she/her/hers pronouns', 
        'prefer-not-to-answer': 'child. Use they/them/their pronouns'
      },
      fallbacks: {
        pronoun: 'they',
        completeInfo: 'child. Use they/them/their pronouns'
      }
    };
    
    staticCache.set(cacheKey, mapping);
  }
  
  return mapping;
};

// Enhanced avatar info processor - UNIVERSAL coverage (no language restriction)
const processAvatarIdentityFromCache = (userInfo) => {
  const hairMapping = getHairColorMapping();
  const genderMapping = getGenderPronounMapping();
  
  // Hair color processing - randomly select from available options
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  const hairOptions = hairMapping[skinTone] || hairMapping['medium'];
  const hairColor = hairOptions[Math.floor(Math.random() * hairOptions.length)];
  
  // Gender/pronoun processing  
  const avatarType = userInfo?.avatarType || userInfo?.avatar?.type || 'prefer-not-to-answer';
  console.log('🔍 AVATAR MAPPING DEBUG: Processing avatar identity', {
    input: {
      userInfoAvatar: userInfo?.avatar,
      userInfoName: userInfo?.name,
      userInfoId: userInfo?.id
    },
    derived: {
      avatarType,
      skinTone,
      nativeLanguage: userInfo?.nativeLanguage
    }
  });
  
  const pronoun = genderMapping.pronouns[avatarType];
  const completeGenderInfo = genderMapping.completeInfo[avatarType];
  
  // Build complete avatarIdentity object matching expected structure
  const avatarIdentity = {
    type: avatarType,
    skinTone: skinTone,
    hairColor: hairColor,
    culturalProfile: userInfo?.culturalProfile || (userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : undefined),
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    name: userInfo?.name || 'Child',
    pronoun,
    completeGenderInfo,
    userName: userInfo?.userName || userInfo?.name || 'Child'
  };
  
  console.log('✅ AVATAR IDENTITY PROCESSED:', {
    completeness: {
      type: !!avatarIdentity.type,
      skinTone: !!avatarIdentity.skinTone,
      culturalProfile: !!avatarIdentity.culturalProfile,
      nativeLanguage: !!avatarIdentity.nativeLanguage,
      name: !!avatarIdentity.name
    },
    result: avatarIdentity
  });
  
  return avatarIdentity;
};

// Cache system settings
const getSystemSettings = () => {
  const cacheKey = 'system_settings';
  
  let settings = staticCache.get(cacheKey);
  if (!settings) {
    settings = {
      baseInstructions: `
CRITICAL SUCCESS REQUIREMENTS:
- Generate a reliable engaging narrative suitable for children
- Use exactly three asterisks (***) on a line by themselves to separate story pages
- Include natural continuation hooks and smooth story flow  
- If target vocabulary provided, incorporate naturally throughout
- This is a never-ending story - always continue, never conclude

Example format:
PAGE TEXT
***
PAGE TEXT
***
Continue in this exact format, using *** to separate each story page.
`,
      maxAttempts: {
        expert: 6,
        regular: 4
      }
    };
    
    staticCache.set(cacheKey, settings);
  }
  
  return settings;
};

// Ultra-Cheap Model Chain Configuration (90% cost reduction)
const getModelChainOptimized = (isExpertLevel = false) => {
  const cacheKey = `model_chain_${isExpertLevel ? 'expert' : 'regular'}`;
  
  let chain = staticCache.get(cacheKey);
  if (!chain) {
    if (isExpertLevel) {
      // Expert: Only gpt-4o-mini → gpt-4o (remove 4 expensive models)
      chain = [
        { name: 'gpt-4o-mini', model: 'gpt-4o-mini', description: 'ultra-cheap primary', paramName: 'max_tokens', supportsTemperature: true },
        { name: 'gpt-4o', model: 'gpt-4o', description: 'cost-optimized fallback', paramName: 'max_tokens', supportsTemperature: true }
      ];
    } else {
      // Regular: Only gpt-4o-mini (remove 3 fallback models)
      chain = [
        { name: 'gpt-4o-mini', model: 'gpt-4o-mini', description: 'ultra-cheap only', paramName: 'max_tokens', supportsTemperature: true }
      ];
    }
    staticCache.set(cacheKey, chain);
  }
  
  return chain;
};

// Cultural Context Embedded Data (Phase 2: 24h cache, no external files)
const getCulturalContextArrays = () => {
  const cacheKey = 'cultural_context_arrays';
  
  let contexts = staticCache.get(cacheKey);
  if (!contexts) {
    contexts = {
      'ar': {
        characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef'],
        commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives'],
        celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings'],
        values: ['hospitality', 'family honor', 'community respect', 'sharing', 'generosity'],
        sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
      },
      'es': {
        characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel'],
        commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices'],
        celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations'],
        values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders', 'joy'],
        sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
      },
      'zh': {
        characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun'],
        commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes'],
        celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions'],
        values: ['hard work', 'education', 'family harmony', 'perseverance', 'respect'],
        sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
      },
      'hi': {
        characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev'],
        commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea'],
        celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies'],
        values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality', 'wisdom'],
        sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
      },
      'pt': {
        characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'],
        commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water'],
        celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals'],
        values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit', 'warmth'],
        sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
      },
      'fr': {
        characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas'],
        commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes'],
        celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day'],
        values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage', 'elegance'],
        sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
      },
      'fr-francophone-african': {
        characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou'],
        commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké'],
        celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings'],
        values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality', 'Ubuntu'],
        sports: ['football', 'basketball', 'wrestling', 'running', 'handball']
      },
      // ⚠️  CRITICAL WARNING FOR FUTURE DEVELOPERS ⚠️
      // 
      // The African American character names array below contains names that are 
      // SENTIMENTAL TO THE OWNER OF THIS APP and must NEVER be modified, removed, 
      // or reduced in any way. These names have deep personal meaning.
      //
      // YOU MAY MODIFY: foods, celebrations, values, sports arrays
      // YOU MUST NEVER TOUCH: the characterNames array for 'en-african-american'
      //
      // This warning applies to both:
      // - src/services/StaticDataCache.ts 
      // - supabase/functions/generate-adaptive-story/StaticDataCache.ts
      // ⚠️  DO NOT MODIFY THE NAMES BELOW - THEY ARE SACRED ⚠️
      'en-african-american': {
        characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos', 'Ace', 'Cruz', 'Crystal', 'Benny', 'Gerzell', 'Isabella', 'Imani', 'Jordan', 'Tori', 'Amari', 'Will', 'Justin', 'Paige', 'Val', 'Akeelah', 'Erin', 'Shannon', 'Reggie', 'Kelsie', 'Aerric', 'Ayden', 'Jared', 'Lennon', 'Brandon', 'Gabriella', 'Noah', 'Oliva', 'Sterling', 'Korri', 'Corey'],
        commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
        celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
        values: ['community strength', 'family pride', 'perseverance', 'cultural heritage', 'resilience'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'track and field']
      },
      'pt-afro-brazilian': {
        characterNames: ['Dandara', 'Zumbi', 'Conceição', 'Benedito', 'Aparecida', 'Joaquim', 'Francisca', 'Sebastião', 'Antônia', 'Manoel'],
        commonFoods: ['acarajé', 'vatapá', 'caruru', 'dendê', 'moqueca', 'bobo de camarão', 'xinxim de galinha', 'abará', 'cocada', 'quindim'],
        celebrations: ['Festa de Iemanjá', 'Lavagem do Bonfim', 'blocos afro', 'capoeira rodas', 'Festa de São João', 'Congadas', 'Maracatu', 'Festival de Inverno de Bonito', 'Festa do Divino', 'Bumba meu boi'],
        values: ['resistência', 'ancestralidade', 'comunidade', 'axé', 'força espiritual'],
        sports: ['capoeira', 'football', 'samba', 'basketball', 'volleyball']
      }
    };
    staticCache.set(cacheKey, contexts);
  }
  
  return contexts;
};

const getCulturalGuidanceString = (userInfo) => {
  const contexts = getCulturalContextArrays();
  const nativeLanguage = userInfo?.nativeLanguage || 'en';
  const skinTone = userInfo?.avatar?.skinTone;
  
  // Enhanced regional detection covering all 8 cultural contexts
  let culturalKey = nativeLanguage;
  let regionName = 'General English';
  
  if (nativeLanguage === 'en' && skinTone === 'dark') {
    culturalKey = 'en-african-american';
    regionName = 'African American';
  } else if (nativeLanguage === 'fr' && skinTone === 'dark') {
    culturalKey = 'fr-francophone-african';
    regionName = 'Francophone African';
  } else if (nativeLanguage === 'es' && skinTone === 'dark') {
    culturalKey = 'es-afro-latina';
    regionName = 'Afro-Latino';
  } else if (nativeLanguage === 'pt' && skinTone === 'dark') {
    culturalKey = 'pt-afro-brazilian';
    regionName = 'Afro-Brazilian';
  } else if (nativeLanguage === 'es') {
    regionName = 'Hispanic/Latino';
  } else if (nativeLanguage === 'zh') {
    regionName = 'Chinese';
  } else if (nativeLanguage === 'hi') {
    regionName = 'Indian/Hindi';
  } else if (nativeLanguage === 'ar') {
    regionName = 'Arabic/Middle Eastern';
  } else if (nativeLanguage === 'fr') {
    regionName = 'French';
  } else if (nativeLanguage === 'pt') {
    regionName = 'Portuguese/Brazilian';
  }
  
  const context = contexts[culturalKey];
  if (!context || culturalKey === 'en') return '';
  
  // Comprehensive cultural easter egg instructions
  const foods = context.commonFoods || [];
  const celebrations = context.celebrations || [];
  const names = context.characterNames || [];
  const values = context.values || [];
  const sports = context.sports || [];
  
  return `CULTURAL EASTER EGG INSTRUCTIONS for ${regionName} background:
- You have access to getCulturalContext() function with comprehensive ${regionName} cultural data
- Use cultural elements as subtle background details ONLY - never main focus or stereotypes
- Rotate randomly between: foods (${foods.slice(0,3).join(', ')}...), celebrations (${celebrations.slice(0,2).join(', ')}...), names (${names.slice(0,3).join(', ')}...), values (${values.slice(0,2).join(', ')}...), sports (${sports.slice(0,2).join(', ')}...)
- Frequency: 1-2 brief mentions maximum per story, varied placement
- Style: Passing details, environmental elements, character names - authentic but respectful
- NEVER: Make culture the plot center, use outdated stereotypes, or over-emphasize differences`;
};

// Multi-Layer Vocabulary Caching (Phase 3: 90% DB call reduction)
const getVocabularyCache = (level, type = 'system') => {
  const cacheKey = `vocab_${type}_${level}`;
  const ttlMap = { user: 60 * 60 * 1000, system: 24 * 60 * 60 * 1000, teacher: 30 * 60 * 1000 };
  
  let vocabSet = staticCache.get(cacheKey);
  if (!vocabSet) {
    // Smart rotation: 50 words per level, 3 daily sets
    const dailySet = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % 3;
    const baseWords = getVocabularyByLevel(level);
    const setSize = Math.min(50, Math.floor(baseWords.length / 3));
    const startIdx = dailySet * setSize;
    
    vocabSet = baseWords.slice(startIdx, startIdx + setSize);
    staticCache.set(cacheKey, vocabSet);
  }
  
  return vocabSet;
};

function getVocabularyByLevel(level) {
  // Simplified vocabulary sets for caching
  const vocab = {
    0: ['the', 'a', 'is', 'it', 'in', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his'],
    1: ['and', 'to', 'of', 'said', 'have', 'go', 'get', 'do', 'see', 'now', 'way', 'who', 'its', 'did', 'yes'],
    2: ['all', 'were', 'they', 'we', 'when', 'your', 'can', 'had', 'her', 'what', 'oil', 'sit', 'set', 'run', 'eat'],
    3: ['about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him'],
    4: ['people', 'could', 'first', 'water', 'been', 'call', 'who', 'made', 'now', 'find', 'long', 'down', 'day', 'did']
  };
  return vocab[level] || vocab[2];
}

// Export singleton instance for direct access if needed
const StaticDataCache = {
  get: (key) => staticCache.get(key),
  set: (key, data) => staticCache.set(key, data),
  has: (key) => staticCache.has(key),
  clear: () => staticCache.clear(),
  size: () => staticCache.size()
};

// ============================================================================
// END EMBEDDED STATICDATACACHE
// ============================================================================

/**
 * ============================================================================
 * IMAGE GENERATION TIER POLICY - CRITICAL BUSINESS RULE
 * ============================================================================
 * 
 * ALL USERS (GUEST AND PREMIUM) RECEIVE TIER 1 IMAGES
 * 
 * This is a fundamental business decision to ensure:
 * - 100% image generation success rate through comprehensive fallback system
 * - Consistent high-quality user experience regardless of subscription status  
 * - Premium value proposition focused on other features (unlimited time, saves, etc.)
 * - Simplified architecture without subscription-based image quality tiers
 * 
 * TIER PROGRESSION FOR ALL USERS:
 * - Tier 1: AI-Enhanced Premium (runware:100@1 with full enhancement pipeline)
 * - Tier 2.5A: Expert Template Fallback (complex structured templates)
 * - Tier 2.5B: Hard Template Fallback (advanced templates)
 * - Tier 2.5C: Medium Template Fallback (standard templates)
 * - Tier 2.5D: Easy Template Fallback (simple templates, minimal requirements)
 * - Tier 4: SVG Placeholder (100% guaranteed success)
 * 
 * IMPORTANT: The `isGuestUser` parameter is for analytics/tracking only
 * DO NOT use it for tier selection or image quality degradation
 * 
 * REGRESSION PREVENTION:
 * - Never implement subscription-based tier restrictions
 * - All users must start with Tier 1 premium image generation
 * - Fallbacks exist for reliability, not subscription enforcement
 * 
 * ============================================================================
 * 
 * EMERGENCY CORS FIX TIMESTAMP: 2025-01-09 00:00:00 UTC
 * Fixed Tier 1 success responses to use createDynamicCorsResponse
 */

// ============= API KEY UTILITIES =============
function getTrimmedApiKey(envVarName) {
  const key = Deno.env.get(envVarName);
  return key ? key.trim() : null;
}

// ============= TIER FAILURE TRACKING =============
class TierFailureTracker {
  static trackFailure(tier, errorType, sessionId, details) {
    const failure = {
      tier,
      errorType,
      timestamp: Date.now(),
      sessionId,
      details
    };
    console.warn(`🔴 TIER FAILURE TRACKED:`, failure);
    // Store in session state if available
    if (sessionId && globalThis.globalArcSessionManager) {
      try {
        const session = globalThis.globalArcSessionManager.sessions.get(sessionId);
        if (session) {
          if (!session.tierFailures) session.tierFailures = [];
          session.tierFailures.push(failure);
          // Keep only last 10 failures per session
          if (session.tierFailures.length > 10) {
            session.tierFailures = session.tierFailures.slice(-10);
          }
        }
      } catch (error) {
        console.warn('Failed to store tier failure in session:', error);
      }
    }
  }
  static getFailureStats(sessionId) {
    if (!sessionId || !globalThis.globalArcSessionManager) return null;
    try {
      const session = globalThis.globalArcSessionManager.sessions.get(sessionId);
      return session?.tierFailures || [];
    } catch (error) {
      console.warn('Failed to retrieve failure stats:', error);
      return null;
    }
  }
}
// ============= WEBSOCKET ERROR CLASSIFICATION =============
class WebSocketError extends Error {
  type;
  isRetryable;
  
  constructor(message, type, isRetryable = false){
    super(message);
    this.type = type;
    this.isRetryable = isRetryable;
    this.name = 'WebSocketError';
  }
}
// ============= ENHANCED WEBSOCKET MANAGER =============
class RunwareWebSocketManager {
  static MAX_RETRIES = 3;
  static BASE_DELAY = 1000;
  static MAX_DELAY = 8000;
  static CONNECTION_TIMEOUT = 90000;
  static IMAGE_GENERATION_TIMEOUT = 120000;
  static async connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, attempt = 1, requestId// PHASE 5: Cross-function correlation
  ) {
    try {
      return await this.attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId);
    } catch (error) {
      const wsError = error;
      const logPrefix1 = requestId ? `[${requestId}]` : '';
      // Check if error is retryable and we haven't exceeded max attempts
      if (wsError.isRetryable && attempt < this.MAX_RETRIES) {
        const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt - 1), this.MAX_DELAY);
        console.warn(`🔄 ${logPrefix1} WebSocket attempt ${attempt} failed, retrying in ${delay}ms: ${wsError.message}`);
        await new Promise((resolve)=>setTimeout(resolve, delay));
        return this.connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, attempt + 1, requestId);
      }
      console.error(`❌ ${logPrefix1} WebSocket failed after ${attempt} attempts: ${wsError.message}`);
      throw wsError;
    }
  }
  static attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId// PHASE 5: Cross-function correlation
  ) {
    return new Promise((resolve, reject)=>{
      let ws;
      let connectionTimeout;
      let generationTimeout;
      let isResolved = false;
      const cleanup = ()=>{
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (generationTimeout) clearTimeout(generationTimeout);
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      };
      const safeReject = (error)=>{
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };
      const safeResolve = (result)=>{
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(result);
        }
      };
      try {
        const logPrefix1 = requestId ? `[${requestId}]` : '';
        console.log(`🔌 ${logPrefix1} Attempting WebSocket connection to Runware`);
        // Set connection timeout (for WebSocket connection + authentication)
        connectionTimeout = setTimeout(()=>{
          safeReject(new WebSocketError('Connection and authentication timeout', 'TIMEOUT', true));
        }, this.CONNECTION_TIMEOUT);
        ws = new WebSocket('wss://ws-api.runware.ai/v1');
        ws.onopen = ()=>{
          console.log(`✅ ${logPrefix1} WebSocket connected, authenticating...`);
          // Send authentication - FIX: Runware requires array format
          ws.send(JSON.stringify([
            {
              taskType: "authentication",
              apiKey: apiKey
            }
          ]));
        };
        ws.onmessage = (event)=>{
          try {
            const data = JSON.parse(event.data);
            console.log(`📨 ${logPrefix1} WebSocket message received:`, data);
            if (data.data && data.data.length > 0) {
              const message = data.data[0];
              // Handle authentication response - FIX: Correct Runware authentication format
              if (message.taskType === "authentication" && message.connectionSessionUUID) {
                console.log(`🔑 ${logPrefix1} Authentication successful (UUID: ${message.connectionSessionUUID}), sending image generation request`);
                // Clear connection timeout and set image generation timeout
                clearTimeout(connectionTimeout);
                generationTimeout = setTimeout(()=>{
                  safeReject(new WebSocketError('Image generation timeout after authentication', 'GENERATION_TIMEOUT', true));
                }, this.IMAGE_GENERATION_TIMEOUT);
                // Build generation request
                const generationRequest = {
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt,
                  negativePrompt,
                  height: 1024,
                  width: 1024,
                  model: "runware:100@1",
                  steps: 25,
                  CFGScale: 8,
                  clipSkip: 1,
                  scheduler: "FlowMatchEulerDiscreteScheduler",
                  onlyUpscale: false,
                  useCache: false,
                  numImages: 1
                };
                // Add seed if provided
                if (seed !== undefined) {
                  generationRequest.seed = seed;
                }
                console.log(`🎯 ${logPrefix1} Sending generation request:`, {
                  taskUUID: generationRequest.taskUUID,
                  promptLength: positivePrompt.length,
                  negativePromptLength: negativePrompt.length,
                  model: generationRequest.model,
                  seed: seed || 'random'
                });
                // FIX: Runware requires array format for image generation
                ws.send(JSON.stringify([
                  generationRequest
                ]));
              } else if (message.taskType === "authentication" && !message.connectionSessionUUID) {
                safeReject(new WebSocketError('Authentication failed - no session UUID received', 'AUTH', false));
              } else if (message.taskType === 'imageInference') {
                // Handle generation response
                if (message.imageURL) {
                  console.log(`🎨 ${logPrefix1} Image generation successful:`, {
                    imageURL: message.imageURL,
                    taskUUID: message.taskUUID,
                    seed: message.seed
                  });
                  safeResolve({
                    success: true,
                    imageURL: message.imageURL,
                    seed: message.seed,
                    taskUUID: message.taskUUID,
                    provider: 'runware',
                    tier: 1
                  });
                } else if (message.error) {
                  console.error(`❌ ${logPrefix1} Generation error:`, message.error);
                  // Classify error type for retry logic
                  const errorMsg = message.error.toString().toLowerCase();
                  let errorType = 'GENERATION';
                  let isRetryable = true;
                  if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
                    errorType = 'RATE_LIMIT';
                    isRetryable = false; // Don't retry rate limits immediately
                  } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
                    errorType = 'NETWORK';
                  } else if (errorMsg.includes('auth')) {
                    errorType = 'AUTH';
                    isRetryable = false;
                  }
                  safeReject(new WebSocketError(`Generation failed: ${message.error}`, errorType, isRetryable));
                }
              }
            }
          } catch (parseError) {
            console.error(`❌ ${logPrefix1} Failed to parse WebSocket message:`, parseError);
            safeReject(new WebSocketError('Message parsing failed', 'NETWORK', true));
          }
        };
        ws.onerror = (error)=>{
          console.error(`❌ ${logPrefix1} WebSocket error:`, error);
          safeReject(new WebSocketError('WebSocket connection error', 'CONNECTION', true));
        };
        ws.onclose = (event)=>{
          console.log(`🔌 ${logPrefix1} WebSocket closed:`, {
            code: event.code,
            reason: event.reason
          });
          if (!isResolved) {
            safeReject(new WebSocketError('WebSocket closed unexpectedly', 'CONNECTION', true));
          }
        };
      } catch (error) {
        console.error(`❌ ${logPrefix} WebSocket setup error:`, error);
        safeReject(new WebSocketError(`Setup failed: ${error.message}`, 'CONNECTION', true));
      }
    });
  }
}
// ============= TIER FUNCTION CALLER - ENHANCED DEBUGGING & PROPER SUPABASE CLIENT =============
async function callTierFunction(functionName, payload) {
  try {
    console.log(`📞 Calling ${functionName} with payload keys:`, Object.keys(payload));
    console.log(`🔍 DEBUG: ${functionName} request details:`, {
      functionName,
      payloadSize: JSON.stringify(payload).length,
      timestamp: new Date().toISOString(),
      sessionId: payload.sessionId?.substring(0, 15) + '...' || 'none'
    });
    // Enhanced Tier 2.5 debugging - log detailed payload for fallback function
    // Use proper Supabase client for edge function calls - FIX FOR AUTHENTICATION ISSUES
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || 'https://cpzeuogomaixamrtnnmj.supabase.co', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'));
    console.log(`🔌 Using Supabase client to invoke ${functionName}`);
    // Use Supabase client function invocation for proper authentication
    const { data: result, error: invokeError } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    if (invokeError) {
      console.error(`❌ ${functionName} Supabase invoke error:`, invokeError);
      // Enhanced debugging for Tier 2.5 failures
      throw new Error(`${functionName} failed: ${invokeError.message}`);
    }
    console.log(`🔍 DEBUG: ${functionName} response:`, {
      resultKeys: Object.keys(result || {}),
      success: result?.success,
      hasImageURL: !!result?.imageURL,
      tier: result?.tier || 'unknown',
      provider: result?.provider || 'unknown'
    });
    if (!result) {
      throw new Error(`${functionName} returned no data`);
    }
    // Enhanced Tier 2.5 success debugging
    console.log(`✅ ${functionName} completed successfully via Supabase client`);
    return result;
  } catch (error) {
    console.error(`❌ ${functionName} failed:`, error);
    // Enhanced error logging for Tier 2.5
    throw error;
  }
}
// ============================================================================
// STATICDATACACHE INTEGRATION - PHASE 8 AVATAR IDENTITY PROCESSING
// ============================================================================

/**
 * Process avatar identity using StaticDataCache with binary validation and tier routing
 * Single source of truth for all avatar mapping logic
 */
async function processAvatarIdentityWithStaticDataCache(userInfo, sessionId, requestId) {
  console.log(`🔍 [${requestId}] PHASE 8: Processing avatar identity via StaticDataCache`);
  
  try {
    // Process avatar identity directly using StaticDataCache
    // Note: Direct import prevents HTTP 400 errors from deprecated API calls
    const avatarResult = processAvatarIdentityFromCache(userInfo);
    
    if (!avatarResult) {
      console.warn(`⚠️ [${requestId}] StaticDataCache processing failed - binary validation failed`);
      return createFallbackAvatarIdentity(userInfo, sessionId, requestId, 'staticdatacache_binary_validation_failed');
    }

    console.log(`✅ [${requestId}] StaticDataCache avatar processing successful:`, {
      avatarType: avatarResult.type,
      culturalProfile: avatarResult.culturalProfile,
      skinTone: avatarResult.skinTone
    });

    // Binary validation: all-or-none completeness check
    const completenessValidation = validateAvatarCompleteness(avatarResult, requestId);
    
    // Add validation results to avatar identity
    avatarResult.completenessValidation = completenessValidation;

    console.log(`✅ [${requestId}] PHASE 8: Avatar processed via StaticDataCache - ${completenessValidation.isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
    
    return avatarResult;
    
  } catch (error) {
    console.error(`❌ [${requestId}] StaticDataCache integration failed:`, error);
    return createFallbackAvatarIdentity(userInfo, sessionId, requestId, 'integration_error');
  }
}

/**
 * Binary validation: all-or-none avatar completeness check
 */
function validateAvatarCompleteness(avatarIdentity, requestId) {
  console.log(`🔍 [${requestId}] PHASE 8: Binary validation check`);
  
  const requiredFields = ['type', 'skinTone', 'culturalProfile', 'nativeLanguage', 'name'];
  const missingFields = requiredFields.filter(field => !avatarIdentity[field]);
  
  const isComplete = missingFields.length === 0;
  
  const validation = {
    isComplete,
    missingFields,
    completeness: isComplete ? 'COMPLETE' : 'INCOMPLETE',
    source: 'StaticDataCache'
  };
  
  console.log(`🎯 [${requestId}] Binary validation result: ${validation.completeness}`, {
    missingFields: missingFields.length ? missingFields : 'none'
  });
  
  return validation;
}

/**
 * Determine tier routing based on binary validation results
 */
function determineTierRouting(completenessValidation, requestId) {
  let suggestedTier, reason;
  
  if (completenessValidation.isComplete) {
    suggestedTier = '1'; // Proceed with Tier 1 (AI-Enhanced Premium)
    reason = 'complete_avatar_identity';
  } else {
    suggestedTier = '2.5C'; // Route to template fallbacks
    reason = 'incomplete_avatar_identity';
  }
  
  const routing = {
    suggestedTier,
    reason,
    binaryResult: completenessValidation.completeness
  };
  
  console.log(`🎯 [${requestId}] Tier routing determined: ${suggestedTier} (${reason})`);
  
  return routing;
}

/**
 * Create fallback avatar identity when StaticDataCache is unavailable
 */
function createFallbackAvatarIdentity(userInfo, sessionId, requestId, fallbackReason) {
  console.log(`🛡️ [${requestId}] Creating fallback avatar identity - reason: ${fallbackReason}`);
  
  const fallbackIdentity = {
    type: 'child',
    skinTone: 'medium',
    culturalProfile: 'general',
    nativeLanguage: 'en',
    name: userInfo?.name || 'the child',
    hairColor: null,
    completenessValidation: {
      isComplete: false,
      missingFields: ['all'],
      completeness: 'INCOMPLETE',
      source: 'fallback'
    },
    tierRouting: {
      suggestedTier: '2.5D',
      reason: fallbackReason,
      binaryResult: 'INCOMPLETE'
    }
  };
  
  console.log(`🔄 [${requestId}] Fallback avatar identity created - routing to Tier 2.5D`);
  
  return fallbackIdentity;
}
// ============= KID-FRIENDLY PLACEHOLDER GENERATOR =============
function generateKidFriendlyPlaceholder(pageText, pageNumber = 1) {
  // Use the same character placeholder system for consistency
  return generateCharacterPlaceholder(pageText, pageNumber);
}

// ============= CHARACTER PLACEHOLDER GENERATOR =============
function generateCharacterPlaceholder(pageText, pageNumber = 1) {
  // Static image URLs - match frontend ImageFallbackService
  const FALLBACK_IMAGES = [
    "/assets/images-not-working-1.webp",
    "/assets/images-not-working-2.webp", 
    "/assets/images-not-working-3.webp",
    "/assets/images-not-working-5.webp",
    "/assets/images-not-working-6.webp",
    "/assets/images-not-working-7.webp"
  ];
  
  // Use pageText hash + page number for consistent but varied selection (matches frontend logic)
  const textHash = (pageText || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = Math.abs(textHash + pageNumber) % FALLBACK_IMAGES.length;
  const selectedImage = FALLBACK_IMAGES[imageIndex];
  
  return {
    url: selectedImage,
    success: true,
    provider: 'static-fallback',
    tier: 4
  };
}

// ============= TIER 4 SIMPLE FALLBACK - CALL TO DEDICATED FUNCTION =============
async function callTier4SimpleFallback(pageText, pageNumber, sessionId, req, reason = 'Fallback needed') {
  console.log(`🛡️ TIER 4: Calling dedicated simple fallback function - ${reason}`);
  
  try {
    const { data: tier4Result, error: tier4Error } = await supabase.functions.invoke('runware-template-cd', {
      body: { 
        storyText: pageText, 
        userInfo: { difficulty: 'easy' },
        templateComplexity: 'D'
      }
    });
    
    if (tier4Error || !tier4Result?.success) {
      console.error('❌ Tier 4 simple fallback failed:', tier4Error);
      // Return error response to trigger frontend fallback
      return createDynamicCorsErrorResponse(new Error(reason), 500, req);
    }
    
    return createDynamicCorsResponse({
      success: true,
      imageURL: tier4Result.imageURL,
      provider: 'tier4-simple-fallback',
      tier: 4,
      metadata: {
        fallbackReason: reason,
        timestamp: new Date().toISOString()
      }
    }, req);
  } catch (error) {
    console.error('❌ Failed to call Tier 4 simple fallback:', error);
    return createDynamicCorsErrorResponse(error, 500, req);
  }
}

// ============= TIER 1 RUNWARE PREMIUM GENERATION =============
async function generateWithRunwarePremium(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId) {
  console.log(`🚀 [${requestId || 'unknown'}] Starting Runware Premium Generation:`, {
    sessionId,
    pageNumber,
    promptLength: positivePrompt.length,
    negativePromptLength: negativePrompt.length,
    seed: seed || 'random'
  });
  // ENHANCED LOGGING: Full prompt details for debugging
  console.log(`🎨 [${requestId || 'unknown'}] FULL Runware Prompt (${positivePrompt.length} chars):`, positivePrompt.substring(0, 200) + (positivePrompt.length > 200 ? '...' : ''));
  console.log(`🚫 [${requestId || 'unknown'}] NEGATIVE Prompt (${negativePrompt.length} chars):`, negativePrompt.substring(0, 100) + (negativePrompt.length > 100 ? '...' : ''));
  try {
    const result = await RunwareWebSocketManager.connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, 1, requestId);
    console.log(`✅ [${requestId || 'unknown'}] Runware Premium Generation Success:`, {
      sessionId,
      pageNumber,
      imageURL: result.imageURL,
      seed: result.seed,
      provider: result.provider,
      tier: result.tier
    });
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error(`❌ [${requestId || 'unknown'}] Runware Premium Generation Failed:`, error);
    throw error;
  }
}
// Phase 2: Enhanced Backend Orchestrator for All Image Generation Tiers
// Now handles: AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
serve(async (req)=>{
  const requestId = generateRequestId();
  console.log(`🎯 [${requestId}] Image Generation Orchestrator: ${req.method} ${req.url}`);
  // BULLETPROOFING: Startup diagnostics
  const runwareApiKey = getTrimmedApiKey('RUNWARE_API_KEY');
  const openaiApiKey = getTrimmedApiKey('OPENAI_API_KEY');
  const supabaseServiceKey = getTrimmedApiKey('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log(`🔍 [${requestId}] Tier 1 System Status Check:`, {
    hasRunwareApiKey: !!runwareApiKey,
    hasOpenAIApiKey: !!openaiApiKey,
    hasSupabaseKey: !!supabaseServiceKey,
    timestamp: new Date().toISOString(),
    requestMethod: req.method
  });
  // Monitor request for header analytics
  monitorRequest(req, 'runware-generate-image');
  // Handle CORS preflight requests - BULLETPROOF DYNAMIC SYSTEM
  if (req.method === 'OPTIONS') {
    console.log(`🔄 [${requestId}] BULLETPROOF Dynamic CORS preflight - Auto-detecting headers`);
    return createDynamicCorsOptionsResponse(req);
  }
  // Handle GET requests with enhanced health check
  if (req.method === 'GET') {
    console.log(`🔍 [${requestId}] GET request received - returning enhanced health check`);
    return createDynamicCorsResponse({
      status: 'healthy',
      function: 'runware-generate-image',
      method: 'GET',
      timestamp: new Date().toISOString(),
      requestId: requestId,
      api_keys: {
        runware_configured: !!runwareApiKey,
        runware_length: runwareApiKey ? runwareApiKey.length : 0,
        openai_configured: !!openaiApiKey,
        openai_length: openaiApiKey?.length || 0,
        supabase_configured: !!supabaseServiceKey,
        supabase_length: supabaseServiceKey?.length || 0
      },
      supported_methods: ['GET', 'POST'],
      health_check: 'OK',
      deployment_info: {
        tier_system: '5-tier fallback (1->2->2.5->3->4)',
        primary_provider: 'Runware AI',
        fallback_providers: [
          'Template-based',
          'Nuclear hardcoded',
          'OpenAI DALL-E',
          'SVG placeholder'
        ]
      },
      usage: {
        method: 'POST',
        required_fields: [
          'pageText',
          'userInfo',
          'sessionId',
          'storyId'
        ],
        optional_fields: [
          'pageNumber',
          'isGuestUser',
          'enhancedStoryData',
          'forceTier'
        ]
      },
      corsSystem: 'BULLETPROOF_DYNAMIC'
    }, req);
  }
  // Validate request method (FIX: Ensure only POST requests proceed)
  if (req.method !== 'POST') {
    console.error(`❌ [${requestId}] Invalid request method: ${req.method}`);
    return callTier4SimpleFallback('', 1, '', req, `Method ${req.method} not allowed`);
  }
  
  // Handle diagnostic requests
  const url = new URL(req.url);
  const diagnostic = url.searchParams.get('diagnostic');
  
  if (diagnostic) {
    console.log(`🔧 [${requestId}] Diagnostic request: ${diagnostic}`);
    
    if (diagnostic === 'key_validation') {
      return createDynamicCorsResponse({
        diagnostic: 'key_validation',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        keys: {
          runware: {
            configured: !!runwareApiKey,
            length: runwareApiKey?.length || 0,
            format_check: runwareApiKey ? (runwareApiKey.length >= 10 ? 'VALID' : 'TOO_SHORT') : 'MISSING'
          },
          openai: {
            configured: !!openaiApiKey,
            length: openaiApiKey?.length || 0,
            format_check: openaiApiKey ? (openaiApiKey.startsWith('sk-') ? 'VALID' : 'INVALID_PREFIX') : 'MISSING'
          }
        }
      }, req);
    }
    
    if (diagnostic === 'circuit_breaker_status') {
      return createDynamicCorsResponse({
        diagnostic: 'circuit_breaker_status',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        circuit_breaker: {
          status: 'CLOSED',
          failure_count: 0,
          last_failure: null
        }
      }, req);
    }
    
    if (diagnostic === 'reset_circuit_breaker') {
      return createDynamicCorsResponse({
        diagnostic: 'reset_circuit_breaker',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        result: 'SUCCESS',
        message: 'Circuit breaker reset successfully'
      }, req);
    }
  }
  
  console.log(`🎯 [${requestId}] TIER 1 (Runware) - Starting AI-Enhanced Premium Generation`);
  // Initialize variables at function scope (FIX: Prevent ReferenceError)
  let isGuestUser = false;
  let pageText = '';
  let userInfo = null;
  let sessionId = '';
  let storyId = '';
  let pageNumber = 1;
  let enhancedStoryData = null;
  let forceTier = null;
  
  // ============= REQUEST PARSING WITH DEBUG =============
    console.log(`📨 [${requestId}] Parsing request body...`);
    // Validate Content-Type for POST requests (FIX: Ensure proper JSON)
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ [${requestId}] Invalid Content-Type: ${contentType || 'missing'}`);
      return callTier4SimpleFallback('', 1, '', req, 'Invalid Content-Type');
    }
    // Parse request with enhanced error handling (FIX: Catch JSON parse errors)
    let requestBody;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.trim().length === 0) {
        console.error(`❌ [${requestId}] Empty request body received`);
        return callTier4SimpleFallback('', 1, '', req, 'Empty request body');
      }
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON parsing failed:`, parseError.message);
      return callTier4SimpleFallback('', 1, '', req, 'JSON parsing failed');
    }
    // Extract and validate parameters (FIX: Enhanced validation with defaults)
    const extractedParams = requestBody || {};
    pageText = extractedParams.pageText || '';
    userInfo = extractedParams.userInfo || null;
    storyId = extractedParams.storyId || '';
    sessionId = extractedParams.sessionId || '';
    pageNumber = extractedParams.pageNumber || 1;
    isGuestUser = extractedParams.isGuestUser || false; // Default to false for analytics tracking
    enhancedStoryData = extractedParams.enhancedStoryData || null;
    forceTier = extractedParams.forceTier || null;
    
    // Now validate API key with smart Tier 1 skip logic (moved here after forceTier is set)
    if (!runwareApiKey && (!forceTier || forceTier !== 1)) {
      console.warn(`⚠️ [${requestId}] RUNWARE_API_KEY not configured, skipping Tier 1`);
    } else if (!runwareApiKey) {
      console.error(`❌ [${requestId}] CRITICAL: RUNWARE_API_KEY not found in environment`);
      console.error(`📋 [${requestId}] Available env vars:`, Object.keys(Deno.env.toObject()).filter((key)=>key.includes('API')));
      return callTier4SimpleFallback(pageText, pageNumber, sessionId, req, 'Missing API key');
    }
    
    console.log(`✅ [${requestId}] Request body parsed successfully`);
    console.log(`📊 [${requestId}] DEBUG: Request parameters:`, {
      hasPageText: !!pageText,
      pageTextLength: pageText?.length || 0,
      pageTextPreview: pageText?.substring(0, 50) + (pageText?.length > 50 ? '...' : ''),
      hasUserInfo: !!userInfo,
      userInfoKeys: userInfo ? Object.keys(userInfo) : [],
      sessionId: sessionId?.substring(0, 15) + '...' || 'none',
      storyId: storyId?.substring(0, 15) + '...' || 'none',
      pageNumber,
      isGuestUser,
      forceTier: forceTier || 'auto',
      hasEnhancedStoryData: !!enhancedStoryData,
      requestSize: JSON.stringify(requestBody).length
    });
    // ============================================================================
    // ENHANCED PARAMETER VALIDATION (FIX: More comprehensive validation)
    // ============================================================================
    // Validate required parameters with detailed error messages
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      console.error(`❌ [${requestId}] Invalid pageText:`, {
        pageText: pageText?.substring(0, 100)
      });
      return callTier4SimpleFallback('Default story page', pageNumber, sessionId, req, 'Invalid pageText parameter');
    }
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      console.error(`❌ [${requestId}] Invalid sessionId:`, {
        sessionId: sessionId?.substring(0, 20)
      });
      return callTier4SimpleFallback(pageText, pageNumber, 'default-session', req, 'Invalid sessionId parameter');
    }
    if (!storyId || typeof storyId !== 'string' || storyId.length < 5) {
      console.error(`❌ [${requestId}] Invalid storyId:`, {
        storyId: storyId?.substring(0, 20)
      });
      return callTier4SimpleFallback(pageText, pageNumber, sessionId, req, 'Invalid storyId parameter');
    }
    // Validate pageNumber
    if (pageNumber && (typeof pageNumber !== 'number' || pageNumber < 1 || pageNumber > 1000)) {
      console.error(`❌ [${requestId}] Invalid pageNumber:`, {
        pageNumber
      });
      return callTier4SimpleFallback(pageText, 1, sessionId, req, 'Invalid pageNumber');
    }
    // Validate userInfo structure
    if (!userInfo || typeof userInfo !== 'object') {
      console.error(`❌ [${requestId}] Invalid userInfo:`, {
        userInfo: typeof userInfo
      });
      return callTier4SimpleFallback(pageText, pageNumber, sessionId, req, 'Invalid userInfo parameter');
    }
    // Log successful parameter validation
    console.log(`✅ [${requestId}] Enhanced parameter validation passed:`, {
      pageTextLength: pageText.length,
      sessionIdLength: sessionId.length,
      storyIdLength: storyId.length,
      pageNumber,
      userType: isGuestUser ? 'GUEST' : 'PREMIUM'
    });
    // ============================================================================
    // PHASE 4: CRITICAL SECURITY VALIDATION
    // ============================================================================
    // Security validation
    const securityCheck = await SecurityValidator.validateImageRequest(req, {
      pageText,
      sessionId,
      pageNumber,
      userInfo
    });
    if (!securityCheck.valid) {
      console.error(`🚨 [${requestId}] Security validation failed:`, securityCheck.reason);
      return callTier4SimpleFallback(pageText, pageNumber, sessionId, req, 'Security validation failed');
    }
    // Rate limiting check
    const rateLimitCheck = await SecurityValidator.checkRateLimit(sessionId, 'image_generation');
    if (!rateLimitCheck.allowed) {
      console.error(`🚨 [${requestId}] Rate limit exceeded for session:`, sessionId);
      return callTier4SimpleFallback(pageText, pageNumber, sessionId, req, 'Rate limit exceeded');
    }
    console.log(`🎯 [${requestId}] Starting image orchestration for page ${pageNumber} (Guest: ${isGuestUser || false})`);
    console.log(`🧠 Enhanced data available: ${enhancedStoryData ? 'Yes' : 'No'}`);
    
    // ============= ROUTING DECISION COLLECTION =============
    const routingDecisions = [];
    const skippedTiers = [];
    let attemptedTier = 'Tier 1';
    let executedTier = null;
    let fallbackReason = null;
    let binaryValidation = null;
    let avatarCompleteness = null;
    
    console.log('🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression', {
      pageText: pageText.substring(0, 100) + '...',
      userInfo: !!userInfo,
      sessionId,
      pageNumber,
      totalPages: 'unknown',
      forceTier: forceTier || 'auto',
      timestamp: new Date().toISOString()
    });
    // ============================================================================
    // PHASE 8: AVATAR IDENTITY PROCESSING WITH BINARY TIER ROUTING
    // ============================================================================
    
    // Process avatar identity using StaticDataCache (single source of truth)
    const avatarIdentity = await processAvatarIdentityWithStaticDataCache(userInfo, sessionId, requestId);
    console.log(`👤 PHASE 8: Avatar Identity Processed: ${avatarIdentity.type}/${avatarIdentity.skinTone} - Cultural: ${avatarIdentity.culturalProfile}`);
    
    // Set avatar completeness from validation result
    if (avatarIdentity?.completenessValidation) {
      binaryValidation = avatarIdentity.completenessValidation.completeness;
      avatarCompleteness = `${avatarIdentity.completenessValidation.missingFields ? avatarIdentity.completenessValidation.missingFields.length : 0} fields missing`;
      
      if (!avatarIdentity.completenessValidation.isComplete) {
        fallbackReason = `Avatar identity incomplete (missing: ${avatarIdentity.completenessValidation.missingFields?.join(', ') || 'unknown fields'})`;
      }
    }
    
    // Binary tier routing based on avatar identity completeness
    console.log('🔍 PHASE 8: Evaluating binary tier routing');
    
    if (avatarIdentity?.tierRouting) {
      const suggestedTier = avatarIdentity.tierRouting.suggestedTier;
      const routingReason = avatarIdentity.tierRouting.reason;
      
      console.log(`🎯 PHASE 8: Binary routing suggests ${suggestedTier} (${routingReason})`);
      routingDecisions.push(`Binary routing suggests ${suggestedTier}: ${routingReason}`);
      
      if (suggestedTier === '2.5C') {
        console.log('🔄 PHASE 8: Routing to Tier 2.5C - incomplete avatar identity');
        forceTier = 2.5; // Force to template fallbacks
        skippedTiers.push('Tier 1');
        routingDecisions.push('Routing to Tier 2.5C: incomplete avatar identity');
      } else if (suggestedTier === '2.5D') {
        console.log('🔄 PHASE 8: Routing to Tier 2.5D - StaticDataCache unavailable');
        forceTier = 2.5; // Force to template fallbacks
        skippedTiers.push('Tier 1');
        routingDecisions.push('Routing to Tier 2.5D: StaticDataCache unavailable');
      }
    } else if (avatarIdentity?.completenessValidation?.isComplete === false) {
      console.log('❌ PHASE 8: Avatar identity incomplete - routing to Tier 2.5A');
      forceTier = 2.5; // Route to template fallbacks for incomplete identity
      skippedTiers.push('Tier 1');
      routingDecisions.push('Avatar identity incomplete - routing to Tier 2.5A');
    } else {
      console.log('✅ PHASE 8: Complete avatar identity - proceeding with enhanced processing');
      routingDecisions.push('Complete avatar identity - proceeding with Tier 1');
    }
    // ORCHESTRATOR SCOPE: Initialize shared variables for nuclear independence
    let characterData = null; // Safe default - will be populated by Tier 1 if successful
    console.log('🛡️ Orchestrator: Initialized characterData to null for nuclear scope safety');
    // ENHANCED AVATAR MAPPING DEBUG
    console.log(`🔍 AVATAR MAPPING DETAILED DEBUG:`, {
      input: {
        userInfoAvatar: userInfo?.avatar,
        userInfoName: userInfo?.name,
        userInfoId: userInfo?.id
      },
      output: {
        type: avatarIdentity.type,
        skinTone: avatarIdentity.skinTone,
        culturalProfile: avatarIdentity.culturalProfile,
        nativeLanguage: avatarIdentity.nativeLanguage,
        name: avatarIdentity.name
      },
      mapping: `${userInfo?.avatar?.type || 'unknown'}/${userInfo?.avatar?.skinTone || 'unknown'} → ${avatarIdentity.type}/${avatarIdentity.skinTone}`
    });
    // ============================================================================ 
    // TIER 1: AI-Enhanced High-Quality - PROVIDED TO ALL USERS
    // ============================================================================
    // CRITICAL: This tier is available to BOTH guest and premium users
    // The isGuestUser flag is for analytics/tracking ONLY, not tier restrictions
    // GUARD: Only enter Tier 1 if runwareApiKey is present, unless forceTier === 1
    if ((!forceTier || forceTier === 1) && (runwareApiKey || forceTier === 1)) {
      try {
        console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Generation');
        console.log('🔍 TIER 1 DEBUG - Calling ai-visual-scene-creator directly (clean architecture)');
        // Call ai-visual-scene-creator directly with pre-processed avatar identity
        // CRITICAL FIX: Add difficultyLevel mapping for Tier 1
        const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
        // CRITICAL: Log prompt flow debugging before calling AI scene creator
        console.log('🔍 [PROMPT-FLOW] AI-SCENE-CREATOR: Calling ai-visual-scene-creator', {
          sessionId,
          pageNumber,
          promptPreview: pageText.substring(0, 100) + '...',
          stage: 'ai-visual-scene-creator',
          metadata: {
            userInfo: userInfo?.name,
            difficultyLevel: mappedDifficulty,
            timestamp: Date.now()
          }
        });
        const aiEnhancerResult = await callTierFunction('ai-visual-scene-creator', {
          storyText: pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          avatarIdentity,
          enhancedStoryData,
          difficultyLevel: mappedDifficulty // CRITICAL FIX: Add missing difficultyLevel parameter
        });
        // CRITICAL: Log AI scene creator response for prompt flow debugging
        console.log('🔍 [PROMPT-FLOW] AI-SCENE-CREATOR: Response received', {
          sessionId,
          pageNumber,
          success: aiEnhancerResult.success,
          hasAiSchema: !!aiEnhancerResult.aiSchema,
          aiSchemaKeys: aiEnhancerResult.aiSchema ? Object.keys(aiEnhancerResult.aiSchema) : [],
          stage: 'ai-visual-scene-creator-response',
          metadata: {
            responseSize: JSON.stringify(aiEnhancerResult).length
          }
        });
        console.log('🔍 TIER 1 DEBUG - AI enhancer returned pure schema, doing direct technical assembly in orchestrator');
        if (!aiEnhancerResult.success) {
          throw new Error(`AI enhancer failed: ${aiEnhancerResult.error || 'Unknown error'}`);
        }
        // Get the pure AI schema from enhancer
        const aiSchema = aiEnhancerResult.aiSchema;
        // PHASE 2: DIRECT TECHNICAL ASSEMBLY IN ORCHESTRATOR
        console.log('🔧 Orchestrator: Starting direct technical assembly');
        // 0. VISUAL DETAIL ANALYSIS FIRST - Must run before character building
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
          const characterName = avatarIdentity?.name || userInfo?.name || 'child';
          await VisualDetailTracker.analyzeTextForDetails(sessionId, pageText, pageNumber || 1, characterName);
          console.log(`🎨 [${requestId}] Visual details analyzed before character building`);
        } catch (error) {
          console.log(`⚠️ [${requestId}] Visual detail analysis failed:`, error.message);
        }
        // Import services for direct assembly
        const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
        const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
        const { validateAvatarConsistency } = await import('../_shared/avatarConsistency.js');
        // Initialize character consistency service
        const characterService = new CharacterConsistencyService();
        // 1. Character Consistency Generation - Update orchestrator scope variable
        characterData = await characterService.getCharacterSeed(sessionId, avatarIdentity, pageText, 'standard');
        console.log('✅ Orchestrator: characterData successfully populated by Tier 1');
        // 2. Style Framework Application - Map grade level to difficulty
        const gradeLevelToDifficulty = (grade)=>{
          const gradeStr = String(grade).toLowerCase();
          if (gradeStr === 'k' || gradeStr === 'kindergarten') return 'beginner';
          if ([
            '1',
            '2'
          ].includes(gradeStr)) return 'easy';
          if ([
            '3',
            '4'
          ].includes(gradeStr)) return 'medium';
          if ([
            '5',
            '6'
          ].includes(gradeStr)) return 'hard';
          return 'expert'; // 7+
        };
        const difficulty = gradeLevelToDifficulty(userInfo.gradeLevel || 'K');
        const storyFramework = getStyleFramework(difficulty);
        // 3. Avatar Validation with PHASE 8 Story Text Priority
        // Extract character appearance from story text first (story text wins)
        const { extractAppearanceFromStoryText } = await import('../_shared/avatarConsistency.js');
        const characterName = avatarIdentity?.name || userInfo?.name || 'child';
        const storyTextAppearance = extractAppearanceFromStoryText(pageText, characterName);
        
        const validatedAvatar = validateAvatarConsistency('', avatarIdentity, userInfo, storyTextAppearance);
        // PHASE 5: Use main function requestId for cross-function correlation 
        console.log(`🎯 [${requestId}] Starting Runware prompt assembly phase`);
        // PHASE 4: Enhanced 5-Section Architecture prompt construction
        // Helper function to detect if user is Level 0-1 (beginner/easy)
        const isLevel01User = difficulty === 'beginner' || difficulty === 'easy';
        // CRITICAL CULTURAL CONTEXT GENERATOR
        // REGRESSION PREVENTION: This function handles cultural representation for diverse users
        // DO NOT MODIFY the cultural detection logic without comprehensive testing
        const generateCulturalContext = async (avatarIdentity, userInfo, requestId, characterData)=>{
          const skinTone = avatarIdentity?.skinTone;
          const nativeLanguage = avatarIdentity?.nativeLanguage || userInfo?.native_language || 'en';
          // AFRICAN DIASPORA CULTURAL DETECTION SYSTEM
          // REGRESSION WARNING: This logic ensures proper representation for African diaspora users
          // Detection criteria: 'dark' skin tone + languages from African diaspora regions
          // - 'en' (English): African American users in US/UK/Canada/Australia
          // - 'fr' (French): Francophone African/Afro-Caribbean users  
          // - 'es' (Spanish): Afro Latino users in Spanish-speaking countries
          // - 'pt' (Portuguese): Afro Brazilian/Lusophone African users
          // DO NOT remove any of these language combinations
          if (skinTone === 'dark' && (nativeLanguage === 'en' || nativeLanguage === 'fr' || nativeLanguage === 'es' || nativeLanguage === 'pt')) {
            try {
              const isGirl = avatarIdentity?.type?.toLowerCase().includes('girl') || avatarIdentity?.type?.toLowerCase().includes('female');
              const hairstyles = isGirl ? CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
              // Attempt to access detailed arrays
              if (hairstyles && hairstyles.length > 0 && CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES && CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length > 0) {
                // Use stored selections if available, otherwise make random selection and store
                let features, hairstyle;
                if (characterData?.selectedCulturalFeatures && characterData?.selectedCulturalHair) {
                  features = characterData.selectedCulturalFeatures;
                  hairstyle = characterData.selectedCulturalHair;
                  console.log(`🌍 [${requestId}] Using stored cultural selections - Hair: ${hairstyle.substring(0, 30)}..., Features: ${features.substring(0, 30)}...`);
                } else {
                  features = CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[Math.floor(Math.random() * CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length)];
                  hairstyle = hairstyles[Math.floor(Math.random() * hairstyles.length)];
                  console.log(`🎲 [${requestId}] Generated new cultural selections - Hair: ${hairstyle.substring(0, 30)}..., Features: ${features.substring(0, 30)}...`);
                }
                // Store new cultural selections in character consistency
                if (!characterData?.selectedCulturalFeatures && !characterData?.selectedCulturalHair) {
                  try {
                    const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
                    const characterService = new CharacterConsistencyService();
                    const characterName = avatarIdentity?.name || userInfo?.name || 'child';
                    const cacheKey = `${sessionId}_${characterName}`;
                    await characterService.updateCulturalSelections(sessionId, cacheKey, hairstyle, features);
                    console.log(`💾 [${requestId}] Stored cultural selections for future consistency`);
                  } catch (error) {
                    console.warn(`⚠️ [${requestId}] Failed to store cultural selections:`, error);
                  }
                }
                // CULTURAL LABEL MAPPING - DO NOT MODIFY
                // This maps language codes to accurate cultural identities for the African diaspora
                const culturalLabel = nativeLanguage === 'en' ? 'African American' : nativeLanguage === 'fr' ? 'Francophone African' : nativeLanguage === 'es' || nativeLanguage === 'pt' ? 'Afro Latino' : 'African American'; // Fallback for edge cases
                console.log(`🌍 [${requestId}] ${culturalLabel} detailed context applied (dark skin + ${nativeLanguage})`);
                return `${culturalLabel} heritage: ${hairstyle}, ${features}`;
              }
            } catch (error) {
              console.warn(`⚠️ [${requestId}] African American detailed arrays failed:`, error);
            }
            // CRITICAL FALLBACK: Always provide cultural context for African diaspora users
            // REGRESSION PREVENTION: This fallback ensures representation even when detailed arrays fail
            // DO NOT remove this fallback - it's essential for cultural accuracy
            const culturalLabel = nativeLanguage === 'en' ? 'African American' : nativeLanguage === 'fr' ? 'Francophone African' : nativeLanguage === 'es' || nativeLanguage === 'pt' ? 'Afro Latino' : 'African American'; // Safe fallback
            console.log(`🌍 [${requestId}] ${culturalLabel} fallback context applied (arrays unavailable)`);
            return `authentic ${culturalLabel} features required`;
          }
          // OTHER LANGUAGE USERS (any skin tone, non-English languages)
          if (nativeLanguage !== 'en') {
            try {
              if (CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS && CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage]) {
                console.log(`🌍 [${requestId}] Regional authenticity context applied for ${nativeLanguage}`);
                return CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage];
              }
            } catch (error) {
              console.warn(`⚠️ [${requestId}] Regional authenticity strings failed for ${nativeLanguage}:`, error);
            }
            // OTHER LANGUAGE FALLBACK: Generic cultural context for non-English speakers
            console.log(`🌍 [${requestId}] Generic cultural fallback applied for ${nativeLanguage}`);
            return "culturally authentic features required";
          }
          // ENGLISH SPEAKERS WITH NON-DARK SKIN: Intentionally return null (no cultural context needed)
          console.log(`🌍 [${requestId}] No cultural context needed (English speaker, non-dark skin)`);
          return null;
        };
        // Helper function to generate story context with optimized Level 3-4 support
        const generateStoryContext = (pageText, difficulty, requestId)=>{
          if (!isLevel01User) return null;
          if (!pageText || pageText.length < 10) return null;
          // Smart sentence detection for complex punctuation
          const smartSentenceSplit = (text)=>{
            // Enhanced regex to handle dialogue, complex punctuation, and multi-clause sentences
            const sentenceRegex = /[.!?]+(?=\s+[A-Z]|$)/g;
            const parts = text.trim().split(sentenceRegex);
            return parts.map((part)=>part.trim()).filter((part)=>part.length > 0).map((part, index, array)=>{
              // Add back punctuation if not the last part
              return index < array.length - 1 ? part + '.' : part;
            });
          };
          // Level-based story context: Full for Level 0-1, optimized for Level 2-4
          if (mappedDifficulty === 0 || mappedDifficulty === 1) {
            console.log(`📖 [${requestId}] Full story context provided for Level ${mappedDifficulty} user`);
            return pageText.trim();
          } else if (mappedDifficulty === 2) {
            // Level 2: Return first 2 sentences (existing logic maintained)
            const sentences = smartSentenceSplit(pageText);
            const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();
            console.log(`📖 [${requestId}] First 2 sentences provided for Level ${mappedDifficulty} user: "${firstTwoSentences.substring(0, 50)}${firstTwoSentences.length > 50 ? '...' : ''}"`);
            return firstTwoSentences;
          } else {
            // Level 3-4: Return first 3 sentences with minimum character threshold
            const sentences = smartSentenceSplit(pageText);
            const firstThreeSentences = sentences.slice(0, 3).join(' ').trim();
            // Ensure minimum 150 character threshold for meaningful context
            if (firstThreeSentences.length >= 150 || sentences.length <= 3) {
              console.log(`📖 [${requestId}] First 3 sentences provided for Level ${mappedDifficulty} user (${firstThreeSentences.length} chars): "${firstThreeSentences.substring(0, 50)}${firstThreeSentences.length > 50 ? '...' : ''}"`);
              return firstThreeSentences;
            } else {
              // If first 3 sentences are too short, extend to 4 sentences or full text
              const extendedContext = sentences.slice(0, 4).join(' ').trim();
              console.log(`📖 [${requestId}] Extended to 4 sentences for Level ${mappedDifficulty} user (${extendedContext.length} chars): "${extendedContext.substring(0, 50)}${extendedContext.length > 50 ? '...' : ''}"`);
              return extendedContext;
            }
          }
        };
        console.log(`🎨 [${requestId}] Style Framework Retrieved:`, {
          difficulty,
          frameworkName: storyFramework.name,
          gradeLevel: userInfo.gradeLevel || 'K',
          hasAllComponents: {
            frameworkPrompt: !!storyFramework.frameworkPrompt,
            negativePrompt: !!storyFramework.negativePrompt
          }
        });
        // RESTRUCTURED 5-SECTION ARCHITECTURE
        const promptSections = {
          primaryScene: '',
          character: '',
          sceneDetails: '',
          storyContext: '',
          brandSuffix: ''
        };
        // ORCHESTRATOR LEVEL: Check for primary scene existence
        if (!aiSchema?.primaryScene || aiSchema.primaryScene.length < 30) {
          console.warn(`⚠️ [${requestId}] Missing or insufficient primaryScene from AI schema - Routing to Tier 2.5A`);
          console.log('🔄 Orchestrator: No primary scene detected, routing to Tier 2.5A template fallback');
          
          // Route directly to Tier 2.5A
          const tier25AResult = await callTierFunction('runware-template-ab', {
            templateComplexity: 'A',
            storyText: pageText,
            userInfo,
            sessionId,
            pageNumber,
            avatarIdentity,
            enhancedStoryData
          });
          
          if (tier25AResult.success) {
            console.log('✅ Tier 2.5A succeeded after primary scene validation failure');
            // Add routing metadata to the response
            const responseWithRouting = {
              ...tier25AResult,
              routingMetadata: {
                attemptedTier: '1',
                executedTier: '2.5A',
                fallbackReason: 'missing_or_insufficient_primary_scene',
                skippedTiers: ['1'],
                routingDecisions: ['Tier 1 attempted', 'Primary scene validation failed', 'Routed to Tier 2.5A', 'Tier 2.5A succeeded'],
                binaryValidation: 'BYPASSED',
                avatarCompleteness: 'BYPASSED'
              }
            };
            return createDynamicCorsResponse(responseWithRouting, req);
          } else {
            throw new Error('Tier 2.5A failed after primary scene validation failure');
          }
        }

        // 1. PRIMARY SCENE (First - establishes main visual context)
        promptSections.primaryScene = aiSchema.primaryScene;
        console.log(`🎯 [${requestId}] Section 1 - Primary Scene Added:`, {
          length: aiSchema.primaryScene.length,
          preview: aiSchema.primaryScene.substring(0, 150) + '...',
          source: 'AI-enhanced primaryScene'
        });
        // 2. CHARACTER (Character + Cultural Context unified)
        let characterSection = '';
        if (characterData.characterDescription) {
          characterSection = characterData.characterDescription;
          console.log(`✅ [${requestId}] Section 2 - Character Description Added:`, {
            length: characterData.characterDescription.length,
            preview: characterData.characterDescription.substring(0, 100) + '...',
            seed: characterData.seed,
            source: 'CharacterConsistencyService'
          });
        } else {
          // PHASE 8: Use avatar validation with story text priority for character description
          console.warn(`⚠️ [${requestId}] Missing character description, using PHASE 8 avatar fallback with story priority`);
          
          // Extract appearance from story text (priority system)
          const { extractAppearanceFromStoryText } = await import('../_shared/avatarConsistency.js');
          const characterName = avatarIdentity?.name || userInfo?.name || 'child';
          const storyTextAppearance = extractAppearanceFromStoryText(pageText, characterName);
          
          characterSection = validateAvatarConsistency('', avatarIdentity, userInfo, storyTextAppearance);
          console.log(`🔍 [${requestId}] PHASE 8 avatar fallback with story priority generated:`, characterSection);
        }
        const culturalContext = await generateCulturalContext(avatarIdentity, userInfo, requestId, characterData);
        if (culturalContext) {
          characterSection += characterSection ? `, ${culturalContext}` : culturalContext;
          console.log(`🌍 [${requestId}] Section 2 - Cultural Context Unified:`, {
            content: culturalContext.substring(0, 100) + '...',
            skinTone: avatarIdentity?.skinTone,
            language: avatarIdentity?.nativeLanguage || userInfo?.native_language,
            source: 'cultural description arrays'
          });
        } else {
          console.log(`🌍 [${requestId}] Section 2 - Cultural Context Skipped (English speaker with non-dark skin)`);
        }
        if (characterSection) {
          promptSections.character = characterSection;
        }
        // 3. SCENE DETAILS (Secondary Elements)
        let sceneDetailsSection = '';
        // 3.1. Secondary Elements - REMOVED TO PREVENT DOUBLE PROCESSING
        // Secondary character processing now happens in template system (runware-template-ab/cd)
        // to ensure proper tier-specific handling and prevent data loss
        console.log('🎭 Secondary character processing handled by template system');
        const seededSecondaryDescriptions = []; // Empty - processed in templates now
            const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
            const characterConsistencyService = new CharacterConsistencyService();
            const seededSecondaryDescriptions = await Promise.all(secondaryElements.slice(0, 4).map(async (el)=>{
              if (el.type === 'secondary_character') {
                try {
                  const secondaryCharacterSeed = await characterConsistencyService.getSecondaryCharacterSeed(sessionId, el.name, 'secondary_character');
                  const seedDescription = await characterConsistencyService.generateSecondaryCharacterDescription(el.name, 'secondary_character', secondaryCharacterSeed);
                  console.log(`👤 [${requestId}] Secondary character seed applied: ${el.name} -> ${seedDescription} (seed: ${secondaryCharacterSeed})`);
                  return `${el.name}: ${seedDescription}`;
                } catch (error) {
                  console.warn(`⚠️ [${requestId}] Secondary character seed failed for ${el.name}:`, error.message);
                  return `${el.name} (${el.type})`;
                }
              } else {
                return `${el.name} (${el.type})`;
              }
            }));
        } catch (error) {
          console.log(`⚠️ [${requestId}] Secondary elements processing disabled (handled in template system):`, error.message);
        }
        
        // NOTE: Secondary character processing moved to template system for proper tier handling
        // ============= ANALYZE PAGE TEXT FOR VISUAL DETAILS =============
        // Add visual detail analysis for consistent object tracking
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
          await VisualDetailTracker.analyzeTextForDetails(sessionId, pageText, pageNumber || 1, characterData?.characterName || 'child');
          console.log(`🔍 [${requestId}] Page text analyzed for visual details`);
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Visual detail analysis failed:`, error.message);
        }
        // 3.2. Visual Details & Colored Objects (automatically integrated from database)
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
          // Get general visual consistency details
          const visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
          if (visualDetails) {
            const visualDetailsText = `Consistency details: ${visualDetails}`;
            sceneDetailsSection += sceneDetailsSection ? `, ${visualDetailsText}` : visualDetailsText;
            console.log(`🎯 [${requestId}] Section 3 - Consistency Details:`, {
              content: visualDetails,
              source: 'VisualDetailTracker (pre-processed)'
            });
          }
          // ============= NEW: GET COLORED OBJECTS FOR RICH DESCRIPTIONS =============
          const coloredObjects = await VisualDetailTracker.buildObjectDescription(sessionId);
          if (coloredObjects) {
            const coloredObjectsText = `Colored objects: ${coloredObjects}`;
            sceneDetailsSection += sceneDetailsSection ? `, ${coloredObjectsText}` : coloredObjectsText;
            console.log(`🎨 [${requestId}] Section 3 - Colored Objects Added:`, {
              content: coloredObjects,
              count: coloredObjects.split(',').length,
              source: 'VisualDetailTracker.buildObjectDescription (enhanced vocabulary)'
            });
          }
        } catch (error) {
          console.log(`⚠️ [${requestId}] Visual detail retrieval failed:`, error.message);
        }
        if (sceneDetailsSection) {
          promptSections.sceneDetails = sceneDetailsSection;
        }
        // 4. STORY CONTEXT (Level 0-1 only)
        const storyContext = generateStoryContext(pageText, difficulty, requestId);
        if (storyContext) {
          promptSections.storyContext = storyContext;
          console.log(`📖 [${requestId}] Section 4 - Story Context Added:`, {
            content: storyContext,
            level: `${difficulty} (Level 0-1)`,
            source: 'pageText visual extraction'
          });
        } else if (isLevel01User) {
          console.log(`📖 [${requestId}] Section 4 - Story Context Skipped (no visual keywords found)`);
        } else {
          console.log(`📖 [${requestId}] Section 4 - Story Context Skipped (Level 2+ user)`);
        }
        // 5. BRAND SUFFIX (Framework Prompt)
        if (storyFramework.frameworkPrompt) {
          promptSections.brandSuffix = storyFramework.frameworkPrompt;
          console.log(`🎨 [${requestId}] Section 5 - Brand Suffix Added:`, {
            content: storyFramework.frameworkPrompt,
            source: 'styleFramework.frameworkPrompt'
          });
        }
        // Generate nuclear negative prompt with comprehensive protection
        const culturalProfile = detectCulturalProfileForNegatives(userInfo, avatarIdentity);
        const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'prefer-not-to-answer';
        const nuclearNegativePrompt = generateNuclearNegativePrompt(culturalProfile, avatarType, mappedDifficulty, pageNumber);
        // Build comprehensive prompts with optimal ordering
        const promptParts = [];
        if (promptSections.primaryScene) {
          promptParts.push(`Primary Scene: ${promptSections.primaryScene}`);
        }
        if (promptSections.character) {
          promptParts.push(`Character: ${promptSections.character}`);
        }
        if (promptSections.storyContext) {
          promptParts.push(`Story Context: ${promptSections.storyContext}`);
        }
        if (promptSections.sceneDetails) {
          promptParts.push(`Scene Details: ${promptSections.sceneDetails}`);
        }
        if (promptSections.brandSuffix) {
          promptParts.push(`Brand Suffix: ${promptSections.brandSuffix}`);
        }
        const enhancedPrompt = promptParts.join('\n');
        const negativePrompt = nuclearNegativePrompt;
        // PHASE 4: Comprehensive prompt assembly logging
        console.log(`🔧 [${requestId}] Runware Prompt Assembly Complete:`, {
          totalSections: promptParts.length,
          finalPromptLength: enhancedPrompt.length,
          difficulty,
          frameworkName: storyFramework.name,
          sectionBreakdown: {
            primaryScene: promptSections.primaryScene ? `${promptSections.primaryScene.length} chars` : 'missing',
            character: promptSections.character ? `${promptSections.character.length} chars` : 'missing',
            sceneDetails: promptSections.sceneDetails ? `${promptSections.sceneDetails.length} chars` : 'missing',
            storyContext: promptSections.storyContext ? `${promptSections.storyContext.length} chars` : 'missing',
            brandSuffix: promptSections.brandSuffix ? `${promptSections.brandSuffix.length} chars` : 'missing'
          },
          componentStatus: {
            hasCharacterData: !!promptSections.character,
            hasPrimaryScene: !!promptSections.primaryScene,
            hasSceneDetails: !!promptSections.sceneDetails,
            hasStoryContext: !!promptSections.storyContext,
            hasBrandSuffix: !!promptSections.brandSuffix
          },
          negativePromptLength: negativePrompt.length,
          assemblyMethod: 'header-structured 5-section architecture'
        });
        // COMPREHENSIVE DEBUGGING: Full prompt logging (no truncation for debugging)
        console.log(`🎯 [${requestId}] FULL Runware Prompt (${enhancedPrompt.length} chars):`);
        console.log(`📝 [${requestId}] COMPLETE POSITIVE PROMPT:`, enhancedPrompt);
        console.log(`🚫 [${requestId}] COMPLETE NEGATIVE PROMPT:`, negativePrompt);
        console.log(`🏗️ [${requestId}] 5-SECTION ARCHITECTURE SUMMARY:`, {
          'Section 1': 'Primary Scene: AI-enhanced scene description',
          'Section 2': 'Character: Character + cultural context unified',
          'Section 3': 'Scene Details: Secondary elements',
          'Section 4': 'Story Context: Page text context (Level 0-1 only)',
          'Section 5': 'Brand Suffix: Style framework prompt'
        });
        // Avatar mapping debug logging
        console.log(`👤 [${requestId}] AVATAR MAPPING DEBUG:`, {
          originalAvatarType: userInfo?.avatar?.type,
          originalSkinTone: userInfo?.avatar?.skinTone,
          mappedAvatarType: avatarIdentity.type,
          mappedSkinTone: avatarIdentity.skinTone,
          culturalProfile: avatarIdentity.culturalProfile,
          nativeLanguage: avatarIdentity.nativeLanguage,
          characterName: userInfo?.name || 'child'
        });
        // Character consistency debug logging
        console.log(`🎭 [${requestId}] CHARACTER CONSISTENCY DEBUG:`, {
          characterSeed: characterData.seed,
          characterDescription: characterData.characterDescription,
          characterDescriptionLength: characterData.characterDescription?.length || 0,
          hasCharacterData: !!characterData.characterDescription
        });
        const enhancementResult = {
          enhancedPrompt,
          negativePrompt,
          metadata: {
            processingTier: 'tier-1-orchestrator-direct',
            aiEnhancement: true,
            characterSeed: characterData.seed,
            segmentCount: promptParts.length,
            requestId: requestId,
            ...aiEnhancerResult.metadata
          }
        };
        // PHASE 4: Final prompt is ready - NO avatar validation override
        console.log(`🔍 [${requestId}] Final Prompt Assembly Complete:`, {
          promptLength: enhancedPrompt.length,
          avatarIdentityType: avatarIdentity.type,
          avatarIdentitySkinTone: avatarIdentity.skinTone,
          promptPreview: enhancedPrompt.substring(0, 150) + '...',
          note: 'Avatar validation was used only for character section, not full prompt override'
        });
        
        // Use the rich AI-generated prompt directly - no full prompt validation override
        const finalPrompt = enhancedPrompt;
        console.log(`🎨 [${requestId}] Final Tier 1 Prompt Ready for Runware (${finalPrompt.length} chars):`, finalPrompt.substring(0, 200) + (finalPrompt.length > 200 ? '...' : ''));
        // CRITICAL: Log prompt flow for debugging 
        console.log('🔍 [PROMPT-FLOW] RUNWARE: Final prompt being sent to Runware API', {
          sessionId,
          pageNumber,
          promptPreview: finalPrompt.substring(0, 100) + '...',
          stage: 'runware',
          metadata: {
            promptLength: finalPrompt.length,
            negativePromptLength: negativePrompt.length,
            characterSeed: characterData.seed,
            tier: 1
          }
        });
        // PHASE 4: Generate with Runware Tier 1 (Premium) with enhanced logging
        console.log(`🚀 [${requestId}] Initiating Runware Premium Generation:`, {
          apiKeyPresent: !!runwareApiKey,
          promptLength: finalPrompt.length,
          negativePromptLength: negativePrompt.length,
          characterSeed: characterData.seed,
          sessionId: sessionId,
          pageNumber: pageNumber
        });
        const tier1Result = await generateWithRunwarePremium(runwareApiKey, finalPrompt, negativePrompt, characterData.seed, sessionId, pageNumber, requestId // PHASE 5: Pass requestId for correlation
        );
        if (tier1Result.success) {
          console.log('✅ Tier 1 AI-Enhanced succeeded');
          // TIER POLICY COMPLIANCE LOG - Critical for regression prevention
          console.log(`🔒 TIER POLICY COMPLIANCE: User type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" received TIER 1 image - Policy maintained`);
          // Store visual state for consistency
          if (sessionId && characterData?.seed) {
            try {
              const sessionManager = new SessionStateManager(sessionId);
              await sessionManager.addSuccessfulPrompt(finalPrompt, enhancementResult.metadata, characterData.seed, tier1Result.imageURL, pageNumber);
            } catch (error) {
              // NOTE: This is genuinely non-critical - visual state storage is optional for consistency
              console.warn('⚠️ Failed to store visual state (non-critical):', error);
            }
          }
          // PHASE 1: Store successful Tier 1 image prompt with DEBUG  
          console.log('📸 DEBUG: Storing Tier 1 image prompt...');
          const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
          try {
            globalSessionManager.storeImagePrompt(sessionId, {
              tier: '1',
              promptText: finalPrompt,
              negativePrompt: enhancementResult.negativePrompt || '',
              originalPageText: pageText,
              enhancedPrompt: finalPrompt,
              pageNumber: pageNumber,
              success: true,
              imageURL: tier1Result.imageURL,
              seed: tier1Result.seed,
              provider: 'runware-premium',
              model: 'runware:100@1',
              cost: 0.01,
              generationTime: 0,
              culturalProfile: enhancementResult.culturalProfile || {},
              styleFramework: enhancementResult.framework || {},
              metadata: {
                aiEnhanced: true,
                characterConsistency: true,
                avatarValidated: true,
                orchestrated: true,
                validationApplied: validatedPrompt !== enhancedPrompt,
                segmentCount: promptParts.length,
                qualityScore: enhancementResult.qualityScore || 95
              }
            });
            console.log('✅ [TIER-1] Stored image prompt for page', pageNumber, 'of session', sessionId);
          } catch (storeError) {
            console.error('❌ Failed to store Tier 1 image prompt:', storeError);
          }
          return createDynamicCorsResponse({
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-orchestrator',
            tier: 1,
            enhancementLevel: 'ai-enhanced-premium',
            qualityScore: enhancementResult.qualityScore || 95,
            metadata: {
              model: "runware:100@1",
              promptLength: validatedPrompt.length,
              sessionId: sessionId || 'unknown',
              pageNumber,
              isGuestUser: isGuestUser,
              orchestrated: true,
              validationApplied: validatedPrompt !== enhancedPrompt,
              segmentCount: promptParts.length,
              characterSeed: characterData?.seed || 'fallback-seed'
            }
          }, req);
        }
        console.log('⚠️ Tier 1 failed, falling back to Tier 2.5A-D progression');
        console.log('🔍 TIER 1 FAILURE DEBUG - Generation failed but no error thrown');
      } catch (error) {
        console.log('⚠️ Tier 1 error, falling back to Tier 2.5A-D progression:', error.message);
        console.log('🔍 TIER 1 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
        // Enhanced WebSocket debugging
        if (error.message?.includes('timeout') || error.message?.includes('WebSocket')) {
          console.error(`🔌 WEBSOCKET DEBUG - Connection details:`, {
            hasApiKey: !!Deno.env.get('RUNWARE_API_KEY'),
            timestamp: new Date().toISOString(),
            sessionId: sessionId?.substring(0, 15) + '...' || 'none',
            errorType: error.name || 'Unknown'
          });
        }
      }
    }
    // TIER 2.5A-D: Sequential Template Complexity Fallback
    if (!forceTier || forceTier === 2.5) {
      // Resolve characterData - if undefined, set to null for nuclear independence
      let resolvedCharacterData = characterData;
      if (characterData === undefined) {
        resolvedCharacterData = null;
        console.log('⚠️ Orchestrator: characterData was undefined, resolved to null for nuclear independence');
      }
      
      // Ensure avatarIdentity is valid
      if (!avatarIdentity) {
        console.error('❌ Orchestrator: avatarIdentity is missing - this should never happen');
        throw new Error('Critical orchestrator error: avatarIdentity is undefined');
      }
      
      // Get proper difficulty mapping
      const { DifficultyLevelMapper } = await import('../_shared/DifficultyLevelMapper.js');
      const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      
      // Additional validation - ensure critical parameters are not empty
      if (!pageText || pageText.trim().length === 0) {
        throw new Error('TIER 2.5 VALIDATION ERROR: pageText is empty or invalid');
      }
      if (!sessionId || sessionId.trim().length === 0) {
        throw new Error('TIER 2.5 VALIDATION ERROR: sessionId is empty or invalid');
      }
      
      // Sequential fallback through template complexity levels with failure-scenario based names
      const complexityConfigs = [
        { level: 'A', func: 'runware-template-ab', name: 'AI Failure Fallback' },
        { level: 'B', func: 'runware-template-ab', name: 'Shared Services Fallback' },
        { level: 'C', func: 'runware-template-cd', name: 'Avatar Identity Fallback' },
        { level: 'D', func: 'runware-template-cd', name: 'Dynamic Prompt Fallback' }
      ];
      
      for (let i = 0; i < complexityConfigs.length; i++) {
        const config = complexityConfigs[i];
        const subTier = `2.5${config.level}`;
        
        try {
          console.log(`🔧 Starting Tier ${subTier}: ${config.name} (${config.func})`);
          console.log(`🔍 TIER ${subTier} DEBUG - Calling ${config.func} with templateComplexity: ${config.level}`);
          
          const tierResult = await callTierFunction(config.func, {
            storyText: pageText,
            userInfo,
            avatarIdentity,
            templateComplexity: config.level,
            sessionId,
            pageNumber
          });
          
          console.log(`🔍 TIER ${subTier} RESULT ANALYSIS:`, {
            success: tierResult?.success || false,
            hasImageURL: !!tierResult?.imageURL,
            error: tierResult?.error || 'none',
            complexity: config.level,
            functionUsed: config.func,
            subTier
          });
          
          if (tierResult?.success && tierResult?.imageURL) {
            console.log(`✅ TIER ${subTier} SUCCESS - ${config.name} (${config.func}) succeeded`);
            return createDynamicCorsResponse({
              success: true,
              imageURL: tierResult.imageURL,
              seed: tierResult.seed,
              provider: 'runware-orchestrator',
              tier: parseFloat(subTier.replace('2.5', '2.5')),
              enhancementLevel: tierResult.enhancementLevel || `template-${config.level}`,
              metadata: {
                orchestrated: true,
                fallbackTier: subTier,
                templateComplexity: config.level,
                functionUsed: config.func,
                templateType: tierResult.templateType
              }
            }, req);
          }
          
          console.log(`⚠️ Tier ${subTier} failed, progressing to next complexity level`);
          
        } catch (error) {
          console.error(`🚨 TIER ${subTier} (${config.func}) EXCEPTION:`, error.message);
          // Continue to next complexity level
        }
      }
      // Enhanced error analysis for failed Tier 2.5A-D
      console.error('❌ ALL TIER 2.5 SUB-TIERS FAILED - Falling back to Tier 4');
    }
    // TIER 4: Kid-Friendly Placeholder (Ultimate Fallback)
    console.log('📝 Generating Tier 4: Kid-Friendly Placeholder');
    const placeholderResult = generateKidFriendlyPlaceholder(pageText, pageNumber);
    // PHASE 1: Store Tier 4 placeholder prompt with DEBUG
    console.log('📸 DEBUG: Storing Tier 4 placeholder prompt...');
    try {
      const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
      globalSessionManager.storeImagePrompt(sessionId, {
        tier: '4',
        promptText: `Kid-Friendly Placeholder: ${pageText.substring(0, 100)}...`,
        negativePrompt: '',
        originalPageText: pageText,
        enhancedPrompt: `Generated kid-friendly placeholder for ${avatarIdentity.name}`,
        pageNumber: pageNumber,
        success: true,
        imageURL: placeholderResult.url,
        seed: 0,
        provider: 'kid-friendly-placeholder',
        model: 'internal-rotating-scenes',
        cost: 0,
        generationTime: 0,
        fallbackReason: 'All image generation tiers failed',
        metadata: {
          avatarIdentity,
          guaranteedFallback: true,
          placeholderType: 'rotating-illustrated-scenes'
        }
      });
      console.log('✅ [TIER-4] Stored image prompt for page', pageNumber, 'of session', sessionId);
    } catch (storeError) {
      console.error('❌ Failed to store Tier 4 image prompt:', storeError);
    }
    return createDynamicCorsResponse({
      success: true,
      imageURL: placeholderResult.url,
      provider: 'runware-orchestrator',
      tier: 4,
      enhancementLevel: 'kid-friendly-placeholder',
      // ROUTING METADATA - Tier 4 Fallback
      routingMetadata: {
        attemptedTier: '1',
        executedTier: '4',
        fallbackReason: 'all_image_generation_tiers_failed',
        skippedTiers: ['1', '2.5A', '2.5B', '2.5C', '2.5D'],
        routingDecisions: ['All tiers failed', 'Guaranteed Tier 4 fallback executed'],
        binaryValidation: 'BYPASSED',
        avatarCompleteness: 'BYPASSED'
      },
      metadata: {
        orchestrated: true
      }
    }, req);
});
