// ============= CHARACTER CONSISTENCY SERVICE - INLINE (TIER 1 ONLY) =============
// PURPOSE: Ultra-lean, zero-dependency service for Tier 1 image generation
// SCOPE: 8 required methods, in-memory only, no database operations
// SIZE: ~200 lines (vs 2487 in vendor bundle)
// ARCHITECTURE: Path 1 of 4-tier import strategy (inline → vendor → shared → CDN)

// ============= INLINE CULTURAL DATA (MINIMAL SUBSET) =============
const INLINE_HAIR_BY_SKIN_TONE = {
  pale: ['red hair', 'ginger hair', 'auburn hair', 'strawberry blonde hair'],
  light: ['blonde hair', 'golden hair', 'light brown hair', 'honey blonde hair'],
  medium: ['brown hair', 'dark blonde hair', 'chestnut hair', 'caramel brown hair'],
  olive: ['black hair', 'dark brown hair', 'jet black hair', 'espresso brown hair'],
  dark: ['thick textured 4C hair', 'natural afro', 'coily hair', 'kinky textured hair', 'tightly coiled hair']
};

const INLINE_SKIN_DESCRIPTIONS = {
  pale: 'fair skin with cool undertones',
  light: 'light skin with neutral undertones',
  medium: 'medium skin with warm undertones',
  olive: 'olive skin with golden undertones',
  dark: 'deep brown skin with warm undertones',
  brown: 'rich brown skin with melanin warmth'
};

const INLINE_CULTURAL_ENHANCEMENTS = {
  dark: {
    hairStyles: ['natural afro', 'box braids', 'cornrows', 'twists', 'locs'],
    facialFeatures: 'authentic African American features with warm undertones',
    skinDetails: 'melanin-rich skin with natural warmth and depth',
    eyeColors: ['brown', 'dark brown', 'deep brown', 'hazel']
  },
  brown: {
    hairStyles: ['natural curls', 'tight coils', 'protective styles'],
    facialFeatures: 'warm features with melanin richness',
    skinDetails: 'brown skin with natural warmth',
    eyeColors: ['brown', 'dark brown', 'hazel']
  }
};

// ============= IN-MEMORY SESSION STORAGE =============
const sessionCache = new Map(); // sessionId → { settings: Map(), objects: [], characters: [] }

// ============= UTILITY FUNCTIONS =============
function getSkinToneFromUserInfo(userInfo) {
  return userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
}

function getAvatarTypeFromUserInfo(userInfo) {
  return userInfo?.avatar?.type || userInfo?.avatarType || 'child';
}

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSessionData(sessionId) {
  if (!sessionCache.has(sessionId)) {
    sessionCache.set(sessionId, {
      settings: new Map(),
      objects: [],
      characters: []
    });
  }
  return sessionCache.get(sessionId);
}

// ============= SERVICE IMPLEMENTATION =============
class CharacterConsistencyServiceInline {
  constructor() {
    console.log('✅ CharacterConsistencyServiceInline initialized (in-memory mode, zero dependencies)');
  }

  // ============= METHOD 1: getStructuredAvatarData =============
  // Purpose: Extract and structure avatar data from userInfo
  // Returns: { skinTone, avatarType, hairColor, skinDescription, source }
  async getStructuredAvatarData(sessionId, userInfo) {
    const skinTone = getSkinToneFromUserInfo(userInfo);
    const avatarType = getAvatarTypeFromUserInfo(userInfo);
    
    // Get hair color options for this skin tone
    const hairOptions = INLINE_HAIR_BY_SKIN_TONE[skinTone] || INLINE_HAIR_BY_SKIN_TONE.medium;
    const hairColor = getRandomFromArray(hairOptions);
    
    const result = {
      skinTone,
      avatarType,
      hairColor,
      skinDescription: INLINE_SKIN_DESCRIPTIONS[skinTone] || INLINE_SKIN_DESCRIPTIONS.medium,
      source: 'inline',
      culturalData: INLINE_CULTURAL_ENHANCEMENTS[skinTone] || null
    };
    
    console.log(`✅ [INLINE] getStructuredAvatarData: skinTone=${skinTone}, avatarType=${avatarType}, hair=${hairColor}`);
    return result;
  }

  // ============= METHOD 2: getEnhancedCharacterSeed =============
  // Purpose: Generate character seed with appearance details
  // Returns: { name, type, skinTone, hair, age, description, source }
  async getEnhancedCharacterSeed(sessionId, avatarIdentity, options = {}) {
    const name = avatarIdentity?.name || options.name || 'Child';
    const type = avatarIdentity?.type || getAvatarTypeFromUserInfo(avatarIdentity) || 'child';
    const skinTone = avatarIdentity?.skinTone || getSkinToneFromUserInfo(avatarIdentity) || 'medium';
    const age = options.age || avatarIdentity?.age || 8;
    
    // Get consistent hair for this skin tone (use first option for stability)
    const hairOptions = INLINE_HAIR_BY_SKIN_TONE[skinTone] || INLINE_HAIR_BY_SKIN_TONE.medium;
    const hair = hairOptions[0];
    
    const skinDesc = INLINE_SKIN_DESCRIPTIONS[skinTone] || INLINE_SKIN_DESCRIPTIONS.medium;
    
    const result = {
      name,
      type,
      skinTone,
      hair,
      age,
      description: `A young ${type} named ${name}, age ${age}, with ${skinDesc} and ${hair}`,
      source: 'inline',
      visualTraits: {
        skinTone: skinDesc,
        hairColor: hair,
        age,
        type
      }
    };
    
    console.log(`✅ [INLINE] getEnhancedCharacterSeed: ${name}, ${skinTone}, ${hair}`);
    return result;
  }

  // ============= METHOD 3: getCulturalEnhancements =============
  // Purpose: Return cultural data bundle for dark-skinned characters
  // Returns: { hairStyles, facialFeatures, skinDetails, eyeColors, source }
  async getCulturalEnhancements(userInfo, sessionId, characterName) {
    const skinTone = getSkinToneFromUserInfo(userInfo);
    const enhancements = INLINE_CULTURAL_ENHANCEMENTS[skinTone];
    
    if (enhancements) {
      console.log(`✅ [INLINE] getCulturalEnhancements: ${skinTone} → cultural data applied`);
      return {
        ...enhancements,
        source: 'inline',
        appliedFor: skinTone
      };
    }
    
    console.log(`✅ [INLINE] getCulturalEnhancements: ${skinTone} → no cultural enhancements needed`);
    return {
      hairStyles: [],
      facialFeatures: '',
      skinDetails: '',
      eyeColors: [],
      source: 'inline',
      appliedFor: skinTone
    };
  }

  // ============= METHOD 4: analyzeVisualDetails =============
  // Purpose: Visual detail tracking (NO-OP in inline - no storage needed for Tier 1)
  // Returns: true (success indicator)
  async analyzeVisualDetails(sessionId, text, pageNumber, options = {}) {
    console.log(`✅ [INLINE] analyzeVisualDetails: NO-OP (storage not needed for Tier 1)`);
    return true;
  }

  // ============= METHOD 5: getColoredObjects =============
  // Purpose: Get colored objects from session (NO-OP - returns empty string)
  // Returns: '' (empty string)
  async getColoredObjects(sessionId) {
    const session = getSessionData(sessionId);
    const objects = session.objects.join(', ');
    console.log(`✅ [INLINE] getColoredObjects: ${objects || '(empty)'}`);
    return objects;
  }

  // ============= METHOD 6: detectAllCharacters =============
  // Purpose: Detect characters in story text (MINIMAL - returns empty structure)
  // Returns: { mainCharacterAppearance, allCharacters, secondaryCharacters }
  async detectAllCharacters(text, options = {}) {
    console.log(`✅ [INLINE] detectAllCharacters: returning minimal structure (no parsing in Tier 1)`);
    return {
      mainCharacterAppearance: {},
      allCharacters: [],
      secondaryCharacters: [],
      source: 'inline'
    };
  }

  // ============= METHOD 7: getSessionSetting =============
  // Purpose: Get session setting from in-memory cache
  // Returns: setting value or defaultValue
  async getSessionSetting(sessionId, key, defaultValue = '') {
    const session = getSessionData(sessionId);
    const value = session.settings.get(key) || defaultValue;
    console.log(`✅ [INLINE] getSessionSetting: ${key} = ${value || '(default)'}`);
    return value;
  }

  // ============= METHOD 8: getSecondaryCharactersForSession =============
  // Purpose: Get secondary characters for session (returns empty array in Tier 1)
  // Returns: [] (empty array)
  async getSecondaryCharactersForSession(sessionId) {
    const session = getSessionData(sessionId);
    console.log(`✅ [INLINE] getSecondaryCharactersForSession: ${session.characters.length} characters`);
    return session.characters;
  }

  // ============= HELPER METHOD: getCharacterAppearanceFromStory =============
  // Purpose: Extract character appearance from story text (called in index.ts line 657)
  // Returns: '' (empty string - no parsing in inline version)
  async getCharacterAppearanceFromStory(sessionId, characterName) {
    console.log(`✅ [INLINE] getCharacterAppearanceFromStory: NO-OP (no text parsing in Tier 1)`);
    return '';
  }

  // ============= UTILITY: Clear session data =============
  // Purpose: Clear session cache (useful for testing)
  async clearSession(sessionId) {
    if (sessionCache.has(sessionId)) {
      sessionCache.delete(sessionId);
      console.log(`✅ [INLINE] clearSession: ${sessionId} cleared`);
    }
  }

  // ============= UTILITY: Clear all server state =============
  // Purpose: Clear all cached data
  async clearServerState() {
    const count = sessionCache.size;
    sessionCache.clear();
    console.log(`✅ [INLINE] clearServerState: ${count} sessions cleared`);
  }
}

// ============= EXPORT SINGLETON INSTANCE =============
export const characterConsistencyService = new CharacterConsistencyServiceInline();

// ============= MODULE METADATA =============
console.log('📦 [MODULE] CharacterConsistencyServiceInline.js loaded (Tier 1, in-memory, 0 dependencies)');
