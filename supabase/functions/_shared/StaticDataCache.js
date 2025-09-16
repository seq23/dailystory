/**
 * STATIC DATA CACHE - Backend Implementation
 * Centralized source of truth for hair mappings and cultural arrays
 * 1:1 parity with frontend src/services/StaticDataCache.ts
 */

// Local helper functions to avoid circular imports
function pick(arr, seed) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  
  if (seed !== undefined) {
    // Use seeded random for consistency
    const seededRandom = createSeededRandom(seed);
    return arr[Math.floor(seededRandom() * arr.length)];
  }
  
  // Fallback to Math.random for backward compatibility
  return arr[Math.floor(Math.random() * arr.length)];
}

function createSeededRandom(seed) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

// ============= HAIR BY SKIN TONE MAPPING - 73 VARIATIONS =============
// Complete hair color mapping system for all skin tones - 1:1 parity with frontend
export const HAIR_BY_SKIN_TONE = {
  'pale': [
    'strawberry blonde hair', 'golden red hair', 'auburn curls', 'copper hair',
    'reddish brown hair', 'ginger hair', 'red-gold hair', 'russet hair',
    'mahogany red hair', 'burgundy hair', 'crimson hair', 'rose gold hair',
    'amber red hair', 'cinnamon red hair'
  ],
  'light': [
    'platinum blonde hair', 'golden blonde hair', 'honey blonde hair', 'ash blonde hair',
    'sandy blonde hair', 'wheat blonde hair', 'butter blonde hair', 'cream blonde hair',
    'champagne blonde hair', 'vanilla blonde hair', 'pearl blonde hair', 'silver blonde hair',
    'moonlight blonde hair', 'sunshine blonde hair', 'caramel blonde hair'
  ],
  'medium': [
    'chestnut brown hair', 'chocolate brown hair', 'coffee brown hair', 'walnut brown hair',
    'hazelnut brown hair', 'mahogany brown hair', 'amber brown hair', 'bronze brown hair',
    'toffee brown hair', 'mocha brown hair', 'caramel brown hair', 'russet brown hair',
    'cedar brown hair', 'oak brown hair', 'maple brown hair'
  ],
  'olive': [
    'jet black hair', 'raven black hair', 'midnight black hair', 'obsidian hair',
    'coal black hair', 'ebony hair', 'onyx hair', 'charcoal hair',
    'deep black hair', 'ink black hair', 'shadow black hair', 'pitch black hair',
    'dark espresso hair', 'blackest brown hair'
  ],
  'dark': [
    'beautiful dark hair', 'rich black hair', 'lustrous dark hair', 'silky black hair',
    'gorgeous dark hair', 'shining black hair', 'magnificent dark hair'
  ]
};

// ============= AFRICAN AMERICAN CULTURAL ARRAYS =============
// MOVED FROM tier25Vocabulary.js - DO NOT MODIFY THESE ARRAYS
// Reference: docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md

export const AFRICAN_AMERICAN_HAIRSTYLES = {
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

// ============= SKIN TONE VARIATIONS =============

const PALE_SKIN_TONES = [
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
];

const LIGHT_SKIN_TONES = [
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
];

const MEDIUM_SKIN_TONES = [
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
];

const OLIVE_SKIN_TONES = [
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
];

export const AFRICAN_AMERICAN_FACIAL_FEATURES = [
  // Light to Medium Tones (12 entries)
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
  
  // Medium Tones (12 entries)
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
  
  // Medium-Dark to Dark Tones (12 entries)
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

// ============= HELPER FUNCTIONS =============

/**
 * Get seeded hair color based on skin tone
 */
export function getHairBySkintone(skinTone, sessionId) {
  const normalizedSkinTone = skinTone?.toLowerCase() || 'medium';
  
  // Map skin tone variations to our 5 categories - now handles all skin tones
  let mappedTone = 'medium';
  if (['pale'].includes(normalizedSkinTone)) {
    mappedTone = 'pale';
  } else if (['light', 'lighter', 'fair'].includes(normalizedSkinTone)) {
    mappedTone = 'light';
  } else if (['olive'].includes(normalizedSkinTone)) {
    mappedTone = 'olive';
  } else if (['dark', 'darker', 'deep', 'rich'].includes(normalizedSkinTone)) {
    mappedTone = 'dark';
  }
  
  const hairOptions = HAIR_BY_SKIN_TONE[mappedTone];
  return pick(hairOptions, sessionId);
}

/**
 * Get seeded skin tone description based on skin tone
 */
export function getSkinBySkintone(skinTone, sessionId) {
  const normalizedSkinTone = skinTone?.toLowerCase() || 'medium';
  
  // Use African American features for dark skin tones
  if (normalizedSkinTone === 'dark' || normalizedSkinTone === 'darker') {
    return pick(AFRICAN_AMERICAN_FACIAL_FEATURES, sessionId);
  }
  
  // Use specific skin tone descriptions for other tones
  if (normalizedSkinTone === 'pale') {
    return pick(PALE_SKIN_TONES, sessionId);
  } else if (['light', 'lighter', 'fair'].includes(normalizedSkinTone)) {
    return pick(LIGHT_SKIN_TONES, sessionId);
  } else if (normalizedSkinTone === 'olive') {
    return pick(OLIVE_SKIN_TONES, sessionId);
  } else {
    // Default to medium for any unmapped tones
    return pick(MEDIUM_SKIN_TONES, sessionId);
  }
}

/**
 * Get African American hairstyle (seeded)
 */
export function getAfricanAmericanHair(gender, sessionId) {
  const genderKey = gender === 'girl' ? 'girls' : 'boys';
  const hairstyles = AFRICAN_AMERICAN_HAIRSTYLES[genderKey];
  return pick(hairstyles, sessionId);
}

/**
 * Get African American facial features (seeded)
 */
export function getAfricanAmericanFeatures(sessionId) {
  return pick(AFRICAN_AMERICAN_FACIAL_FEATURES, sessionId);
}

/**
 * Check if user qualifies for cultural enhancements
 */
export function shouldApplyCulturalEnhancements(userInfo) {
  const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
  
  // Dark skin + supported languages (en/fr/es/pt) get cultural enhancements
  if ((skinTone === 'dark' || skinTone === 'darker') && 
      ['en', 'fr', 'es', 'pt'].includes(language.toLowerCase())) {
    return true;
  }
  
  return false;
}

/**
 * Get cultural bundle for seeded selection
 */
export function getCulturalBundle(userInfo, sessionId) {
  if (!shouldApplyCulturalEnhancements(userInfo)) {
    return {
      hair: getHairBySkintone(userInfo?.skinTone || 'medium', sessionId),
      features: getSkinBySkintone(userInfo?.skinTone || 'medium', sessionId)
    };
  }
  
  const gender = userInfo?.avatar?.type || 'boy';
  return {
    hair: getAfricanAmericanHair(gender, sessionId),
    features: getAfricanAmericanFeatures(sessionId + 1)
  };
}