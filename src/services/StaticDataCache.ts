// Static Data Caching Service
// Caches frequently accessed configuration data to improve performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StaticCache {
  private static instance: StaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours TTL for static data - optimization

  private constructor() {}

  static getInstance(): StaticCache {
    if (!StaticCache.instance) {
      StaticCache.instance = new StaticCache();
    }
    return StaticCache.instance;
  }

  get<T>(key: string): T | null {
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

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache size for monitoring
  size(): number {
    return this.cache.size;
  }
}

// Cached data generators
const staticCache = StaticCache.getInstance();


// Hair descriptors by skin tone (comprehensive 1:1 backend parity - 73 total variations)
export const HAIR_BY_SKIN_TONE = {
  'pale': [
    // 14 red/auburn variations (exact backend copy)
    'strawberry blonde hair', 'golden red hair', 'auburn curls', 'copper hair',
    'reddish brown hair', 'ginger hair', 'red-gold hair', 'russet hair',
    'mahogany red hair', 'burgundy hair', 'crimson hair', 'rose gold hair',
    'amber red hair', 'cinnamon red hair'
  ],
  'light': [
    // 15 blonde variations (exact backend copy)  
    'platinum blonde hair', 'golden blonde hair', 'honey blonde hair', 'ash blonde hair',
    'sandy blonde hair', 'wheat blonde hair', 'butter blonde hair', 'cream blonde hair',
    'champagne blonde hair', 'vanilla blonde hair', 'pearl blonde hair', 'silver blonde hair',
    'moonlight blonde hair', 'sunshine blonde hair', 'caramel blonde hair'
  ],
  'medium': [
    // 15 brown variations (exact backend copy)
    'chestnut brown hair', 'chocolate brown hair', 'coffee brown hair', 'walnut brown hair',
    'hazelnut brown hair', 'mahogany brown hair', 'amber brown hair', 'bronze brown hair',
    'toffee brown hair', 'mocha brown hair', 'caramel brown hair', 'russet brown hair',
    'cedar brown hair', 'oak brown hair', 'maple brown hair'
  ],
  'olive': [
    // 14 black/dark brown variations (exact backend copy)
    'jet black hair', 'raven black hair', 'midnight black hair', 'obsidian hair',
    'coal black hair', 'ebony hair', 'onyx hair', 'charcoal hair',
    'deep black hair', 'ink black hair', 'shadow black hair', 'pitch black hair',
    'dark espresso hair', 'blackest brown hair'
  ],  
  'dark': [
    // 7 generic descriptive terms (exact backend copy)
    'beautiful dark hair', 'rich black hair', 'lustrous dark hair', 'silky black hair',
    'gorgeous dark hair', 'shining black hair', 'magnificent dark hair'
  ]
};

// Cache hair color mapping rules with enhanced diversity
export const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = staticCache.get<Record<string, string[]>>(cacheKey);
  if (!mapping) {
    mapping = HAIR_BY_SKIN_TONE;
    staticCache.set(cacheKey, mapping);
  }
  
  return mapping;
};

// Cache gender/pronoun mapping rules
export const getGenderPronounMapping = () => {
  const cacheKey = 'gender_pronoun_mapping';
  
  let mapping = staticCache.get<any>(cacheKey);
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
export const processAvatarIdentityFromCache = (userInfo: any) => {
  const hairMapping = getHairColorMapping();
  const genderMapping = getGenderPronounMapping();
  
  // Hair color processing - randomly select from available options
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  const hairOptions = hairMapping[skinTone] || hairMapping['medium'];
  const hairColor = hairOptions[Math.floor(Math.random() * hairOptions.length)];
  
  // Gender/pronoun processing  
  const avatarType = userInfo?.avatarType || userInfo?.avatar?.type || 'prefer-not-to-answer';
  console.log('Processing avatar identity - avatarType:', avatarType, 'userInfo structure:', { avatarType: userInfo?.avatarType, avatarNestedType: userInfo?.avatar?.type });
  const pronoun = genderMapping.pronouns[avatarType];
  const completeGenderInfo = genderMapping.completeInfo[avatarType];
  
  return {
    hairColor,
    pronoun, 
    completeGenderInfo,
    avatarType,
    skinTone,
    userName: userInfo?.name || 'Child'
  };
};

// Cache system settings
export const getSystemSettings = () => {
  const cacheKey = 'system_settings';
  
  let settings = staticCache.get<any>(cacheKey);
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
export const getModelChainOptimized = (isExpertLevel: boolean = false) => {
  const cacheKey = `model_chain_${isExpertLevel ? 'expert' : 'regular'}`;
  
  let chain = staticCache.get<any[]>(cacheKey);
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
export const getCulturalContextArrays = () => {
  const cacheKey = 'cultural_context_arrays';
  
  let contexts = staticCache.get<any>(cacheKey);
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

export const getCulturalGuidanceString = (userInfo: any) => {
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
export const getVocabularyCache = (level: number, type: 'user' | 'system' | 'teacher' = 'system') => {
  const cacheKey = `vocab_${type}_${level}`;
  const ttlMap = { user: 60 * 60 * 1000, system: 24 * 60 * 60 * 1000, teacher: 30 * 60 * 1000 };
  
  let vocabSet = staticCache.get<string[]>(cacheKey);
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

function getVocabularyByLevel(level: number): string[] {
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
export const StaticDataCache = {
  get: <T>(key: string) => staticCache.get<T>(key),
  set: <T>(key: string, data: T) => staticCache.set(key, data),
  has: (key: string) => staticCache.has(key),
  clear: () => staticCache.clear(),
  size: () => staticCache.size()
};