// Static Data Caching Service
// Caches frequently accessed configuration data to improve performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StaticCache {
  private static instance: StaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for static data

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
  const avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
  const pronoun = genderMapping.pronouns[avatarType] || genderMapping.fallbacks.pronoun;
  const completeGenderInfo = genderMapping.completeInfo[avatarType] || genderMapping.fallbacks.completeInfo;
  
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

// Export singleton instance for direct access if needed
export const StaticDataCache = {
  get: <T>(key: string) => staticCache.get<T>(key),
  set: <T>(key: string, data: T) => staticCache.set(key, data),
  has: (key: string) => staticCache.has(key),
  clear: () => staticCache.clear(),
  size: () => staticCache.size()
};