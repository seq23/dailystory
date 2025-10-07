// ============================================================================
// 🚨 SHARED StaticDataCache - Available for Edge Functions
// ============================================================================
// REGRESSION PREVENTION (ERROR-058):
// This shared version exists for edge functions that need lightweight caching.
// Story generation uses the local version at:
// supabase/functions/generate-adaptive-story/StaticDataCache.ts
//
// DO NOT assume all edge functions can use dummy inline functions.
// Story generation specifically requires full StaticDataCache integration.
// ============================================================================

// Self-contained StaticDataCache for _shared modules
// This file MUST NOT import from other function folders to avoid deployment errors

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class EdgeStaticCache {
  private static instance: EdgeStaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours TTL (reduced from 24h)

  private constructor() {}

  static getInstance(): EdgeStaticCache {
    if (!EdgeStaticCache.instance) {
      EdgeStaticCache.instance = new EdgeStaticCache();
    }
    return EdgeStaticCache.instance;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  invalidateOnImportFailure(): void {
    // Clear cache when critical imports fail to force fresh data load
    console.log('🧹 Invalidating static cache due to import failures');
    this.cache.clear();
  }
}

const cache = EdgeStaticCache.getInstance();

// Cultural Context Arrays - Self-contained implementation
export const getCulturalContextArrays = () => {
  const cacheKey = 'cultural_context_arrays';
  
  let contexts = cache.get<any>(cacheKey);
  if (!contexts) {
    contexts = {
      'ar': {
        characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef', 'Nadia', 'Tariq'],
        commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives', 'baklava', 'tahini', 'falafel'],
        celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings', 'Ramadan iftar', 'harvest festivals', 'naming ceremonies', 'homecoming parties', 'religious holidays', 'community festivals'],
        values: ['hospitality', 'family honor', 'community respect', 'sharing', 'generosity'],
        sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
      },
      'es': {
        characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel', 'Lucia', 'Alejandro'],
        commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices', 'tamales', 'quesadillas', 'churros', 'plantains', 'mole'],
        celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations', 'Las Posadas', 'Cinco de Mayo', 'baptisms', 'Christmas traditions', 'patron saint festivals', 'wedding celebrations'],
        values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders', 'joy'],
        sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
      },
      'es-afro-latina': {
        characterNames: ['Esperanza', 'Joaquín', 'Marisol', 'Roberto', 'Xiomara', 'Esteban', 'Yolanda', 'Fernando', 'Soledad', 'Ramón'],
        commonFoods: ['moros y cristianos', 'tostones', 'yuca con mojo', 'ropa vieja', 'tres leches cake', 'platanos maduros', 'arroz con pollo', 'frijoles negros', 'croquetas', 'café cubano'],
        celebrations: ['carnival celebrations', 'salsa festivals', 'Día de la Raza', 'family reunions', 'quinceañeras', 'religious processions', 'música y baile', 'community block parties', 'cultural heritage festivals', 'Christmas parrandas'],
        values: ['familia', 'resistencia', 'celebración', 'comunidad', 'orgullo'],
        sports: ['football', 'baseball', 'boxing', 'salsa dancing', 'volleyball']
      },
      'zh': {
        characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun', 'Huang Jie', 'Sun Hua', 'Zhao Gang'],
        commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes', 'steamed buns', 'hot pot', 'spring rolls', 'congee'],
        celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions', 'Lantern Festival', 'Qingming Festival', 'Children\'s Day', 'National Day', 'wedding banquets', 'birthday celebrations'],
        values: ['hard work', 'education', 'family harmony', 'perseverance', 'respect'],
        sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
      },
      'hi': {
        characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev', 'Ravi', 'Meera'],
        commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea', 'samosas', 'biryani', 'lassi'],
        celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies', 'Raksha Bandhan', 'Navratri', 'Karva Chauth', 'Eid celebrations', 'Ganesh Chaturthi'],
        values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality', 'wisdom'],
        sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
      },
      'pt': {
        characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael', 'Isabela', 'Lucas'],
        commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water', 'pão de açúcar', 'feijoada', 'brigadeiros', 'pastéis', 'tapioca'],
        celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals', 'Festa Junina', 'New Year\'s Eve', 'family gatherings', 'saints\' days', 'graduation parties', 'Christmas celebrations'],
        values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit', 'warmth'],
        sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
      },
      'fr': {
        characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas', 'Chloé', 'Alexandre'],
        commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes', 'wine', 'crêpes', 'coq au vin'],
        celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day', 'Christmas markets', 'wine festivals', 'music concerts', 'cultural events', 'regional fairs'],
        values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage', 'elegance'],
        sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
      },
      'fr-francophone-african': {
        characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou', 'Kadiatou', 'Moussa'],
        commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké', 'fufu', 'jollof rice', 'bissap'],
        celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings', 'naming ceremonies', 'mask festivals', 'drumming circles', 'storytelling nights', 'market days', 'seasonal celebrations'],
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
    cache.set(cacheKey, contexts);
  }
  
  return contexts;
};

// Cultural bundle helper for consistency with frontend
export const getCulturalBundle = () => {
  return {
    culturalArrays: getCulturalContextArrays()
  };
};

// ============================================================================
// Session-Seeded Hair & Skin Mapping Functions
// ============================================================================
// 1:1 PARITY with StaticDataCache.js - DO NOT MODIFY WITHOUT SYNCING BOTH FILES

// ============= HAIR BY SKIN TONE MAPPING - 73 VARIATIONS =============
export const HAIR_BY_SKIN_TONE: Record<string, string[]> = {
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

// ============= SKIN TONE VARIATIONS =============
const PALE_SKIN_TONES = [
  'porcelain skin with cool undertones',
  'fair ivory complexion with pink undertones',
  'alabaster skin with neutral undertones',
  'creamy pale skin with warm undertones',
  'pearl white complexion with subtle pink flush',
  'milky white skin with cool undertones',
  'fair skin with peachy undertones',
  'pale rose-tinted complexion',
  'translucent fair skin with blue undertones',
  'cream-colored skin with golden undertones',
  'snow white complexion with neutral base',
  'fair skin with subtle yellow undertones'
];

const LIGHT_SKIN_TONES = [
  'light peachy skin tone with warm glow',
  'soft beige complexion with pink undertones',
  'warm vanilla skin with golden undertones',
  'light cream complexion with neutral base',
  'pale golden skin with honey undertones',
  'light rose-beige skin tone',
  'champagne-colored complexion',
  'light ivory skin with warm peachy glow',
  'soft bisque skin tone with pink flush',
  'light caramel undertones with creamy base',
  'warm light tan with golden highlights',
  'light sand-colored skin with neutral undertones'
];

const MEDIUM_SKIN_TONES = [
  'warm peachy medium skin tone',
  'golden medium complexion with honey undertones',
  'medium beige skin with warm caramel highlights',
  'soft medium tan with golden glow',
  'medium caramel skin tone with warm undertones',
  'warm medium brown with peachy undertones',
  'medium golden skin with bronze highlights',
  'caramel medium complexion with honey base',
  'medium wheat-colored skin with warm glow',
  'golden medium tan with amber undertones',
  'medium olive-beige with warm undertones',
  'warm medium skin with cinnamon undertones'
];

const OLIVE_SKIN_TONES = [
  'light olive complexion with green undertones',
  'warm olive skin with golden undertones',
  'medium olive with bronze highlights',
  'golden olive complexion with warm glow',
  'olive-beige skin with neutral undertones',
  'warm olive-tan with amber undertones',
  'deep olive with rich warm undertones',
  'olive-brown complexion with golden base',
  'Mediterranean olive skin with sun-kissed glow',
  'olive-caramel with warm honey undertones',
  'rich olive complexion with bronze undertones',
  'dark olive skin with deep golden highlights'
];

export const AFRICAN_AMERICAN_FACIAL_FEATURES = [
  // Light to Medium Tones (12 entries)
  'light brown skin tone with warm brown eyes and a bright infectious smile',
  'light brown skin tone with hazel-green eyes and gentle dimples when smiling',
  'light brown skin tone with amber eyes and expressive eyebrows',
  'caramel skin tone with deep chocolate eyes and a confident cheerful expression',
  'caramel skin tone with hazel eyes with golden flecks and soft rounded cheeks',
  'caramel skin tone with bright brown eyes and an inquisitive thoughtful look',
  'honey complexion with golden brown eyes and a playful mischievous grin',
  'honey complexion with warm brown eyes and graceful bone structure',
  'honey complexion with hazel eyes and a warm welcoming expression',
  'warm beige skin with dark honey-colored eyes and animated joyful features',
  'warm beige skin with hazel-green eyes and gentle dimples',
  'light caramel complexion with rich coffee-colored eyes and expressive eyebrows',
  
  // Medium Tones (12 entries)
  'medium brown skin tone with warm brown eyes and a bright infectious smile',
  'medium brown skin tone with hazel eyes with golden flecks and gentle dimples when smiling', 
  'medium brown skin tone with deep amber eyes and expressive eyebrows',
  'cocoa skin tone with dark chocolate eyes and a confident cheerful expression',
  'cocoa skin tone with hazel-green eyes and soft rounded cheeks',
  'cocoa skin tone with bright brown eyes and an inquisitive thoughtful look',
  'warm brown complexion with golden brown eyes and a playful mischievous grin',
  'warm brown complexion with rich coffee-colored eyes and graceful bone structure',
  'chestnut skin tone with hazel eyes and a warm welcoming expression',
  'chestnut skin tone with warm brown eyes and animated joyful features',
  'amber skin tone with dark honey-colored eyes and gentle dimples',
  'amber skin tone with hazel-green eyes and expressive eyebrows',
  
  // Medium-Dark to Dark Tones (12 entries)
  'deep brown skin tone with warm brown eyes and a bright infectious smile',
  'deep brown skin tone with dark chocolate eyes and gentle dimples when smiling',
  'deep brown skin tone with deep amber eyes and expressive eyebrows',
  'rich chocolate complexion with hazel eyes with golden flecks and a confident cheerful expression',
  'rich chocolate complexion with bright brown eyes and soft rounded cheeks',
  'rich chocolate complexion with golden brown eyes and an inquisitive thoughtful look',
  'dark brown skin tone with rich coffee-colored eyes and a playful mischievous grin',
  'dark brown skin tone with warm brown eyes and graceful bone structure',
  'ebony skin tone with dark honey-colored eyes and a warm welcoming expression',
  'ebony skin tone with hazel-green eyes and animated joyful features',
  'deep mahogany complexion with hazel eyes and gentle dimples',
  'deep mahogany complexion with deep amber eyes and expressive eyebrows'
];

// ============= HELPER FUNCTIONS =============

// Simple PRNG for deterministic selection
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 1000) / 1000;
}

export function getHairBySkintone(skinTone: string, sessionId: string): string {
  const normalizedSkinTone = (skinTone || 'medium').toLowerCase();
  
  // Map skin tone variations to our 5 categories
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
  
  const hairOptions = HAIR_BY_SKIN_TONE[mappedTone] || HAIR_BY_SKIN_TONE['medium'];
  const index = Math.floor(seededRandom(sessionId) * hairOptions.length);
  return hairOptions[index];
}

export function getSkinBySkintone(skinTone: string, sessionId: string): string {
  const normalizedSkinTone = (skinTone || 'medium').toLowerCase();
  
  // Use African American features for dark skin tones
  if (normalizedSkinTone === 'dark' || normalizedSkinTone === 'darker') {
    const index = Math.floor(seededRandom(sessionId) * AFRICAN_AMERICAN_FACIAL_FEATURES.length);
    return AFRICAN_AMERICAN_FACIAL_FEATURES[index];
  }
  
  // Use specific skin tone descriptions for other tones
  let skinOptions = MEDIUM_SKIN_TONES;
  if (normalizedSkinTone === 'pale') {
    skinOptions = PALE_SKIN_TONES;
  } else if (['light', 'lighter', 'fair'].includes(normalizedSkinTone)) {
    skinOptions = LIGHT_SKIN_TONES;
  } else if (normalizedSkinTone === 'olive') {
    skinOptions = OLIVE_SKIN_TONES;
  }
  
  const index = Math.floor(seededRandom(sessionId + '_skin') * skinOptions.length);
  return skinOptions[index];
}