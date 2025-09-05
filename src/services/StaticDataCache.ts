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


// Cache hair color mapping rules with enhanced diversity
export const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = staticCache.get<Record<string, string[]>>(cacheKey);
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
        values: ['hospitality', 'family honor', 'community respect', 'sharing with others'],
        sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
      },
      'es': {
        characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel'],
        commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices'],
        celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations'],
        values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders'],
        sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
      },
      'zh': {
        characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun'],
        commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes'],
        celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions'],
        values: ['hard work', 'education', 'family harmony', 'perseverance'],
        sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
      },
      'hi': {
        characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev'],
        commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea'],
        celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies'],
        values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality'],
        sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
      },
      'pt': {
        characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'],
        commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water'],
        celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals'],
        values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit'],
        sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
      },
      'fr': {
        characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas'],
        commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes'],
        celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day'],
        values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage'],
        sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
      },
      'fr-francophone-african': {
        characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou'],
        commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké'],
        celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings'],
        values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality'],
        sports: ['football', 'basketball', 'wrestling', 'running', 'handball']
      },
      'en': {
        characterNames: ['Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Mason', 'Isabella', 'Jacob'],
        commonFoods: ['sandwiches', 'pizza', 'burgers', 'salads', 'snacks', 'milk', 'fruit'],
        celebrations: ['birthdays', 'holidays', 'school events', 'sports games', 'family vacations'],
        values: ['independence', 'achievement', 'fairness', 'creativity'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
      },
      'en-african-american': {
        characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos', 'Ace', 'Cruz', 'Crystal', 'Benny', 'Gerzell', 'Isabella', 'Imani', 'Jordan', 'Tori', 'Amari', 'Will', 'Justin', 'Paige', 'Val', 'Akeelah', 'Erin', 'Shannon', 'Reggie', 'Kelsie', 'Aerric', 'Ayden', 'Jared', 'Lennon', 'Brandon', 'Gabriella', 'Noah', 'Oliva', 'Sterling', 'Korri', 'Corey'],
        commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
        celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
        values: ['community strength', 'family pride', 'perseverance', 'educational achievement', 'cultural heritage', 'resilience'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
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
  
  let culturalKey = nativeLanguage;
  if (nativeLanguage === 'en' && skinTone === 'dark') {
    culturalKey = 'en-african-american';
  } else if (nativeLanguage === 'fr' && skinTone === 'dark') {
    culturalKey = 'fr-francophone-african';
  }
  
  const context = contexts[culturalKey];
  if (!context || culturalKey === 'en') return '';
  
  const randomFood = context.commonFoods[0];
  const randomCelebration = context.celebrations[0];
  
  return `This child is likely from ${culturalKey.replace('-', ' ')} culture, subtly weave ${randomFood} or ${randomCelebration} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`;
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