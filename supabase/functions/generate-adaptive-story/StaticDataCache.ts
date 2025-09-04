// Static Data Caching for Edge Functions
// Mirror of frontend caching service for edge function use

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class EdgeStaticCache {
  private static instance: EdgeStaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

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
}

const cache = EdgeStaticCache.getInstance();

// Cache OpenAI model configurations
export const getModelChain = (isExpertLevel: boolean) => {
  const cacheKey = `model_chain_${isExpertLevel ? 'expert' : 'regular'}`;
  
  let chain = cache.get<any[]>(cacheKey);
  if (!chain) {
    chain = isExpertLevel ? [
      // PHASE 2: Prioritize content-focused models for story generation
      { name: 'gpt-4.1-2025-04-14', model: 'gpt-4.1-2025-04-14', description: 'content-focused primary', paramName: 'max_completion_tokens' }, 
      { name: 'gpt-4o', model: 'gpt-4o', description: 'reliable content generator', paramName: 'max_tokens', supportsTemperature: true },
      { name: 'gpt-5-mini-2025-08-07', model: 'gpt-5-mini-2025-08-07', description: 'fast content generation', paramName: 'max_completion_tokens' },
      { name: 'gpt-5-2025-08-07', model: 'gpt-5-2025-08-07', description: 'reasoning model (content risk)', paramName: 'max_completion_tokens' },
      { name: 'gpt-4o-mini', model: 'gpt-4o-mini', description: 'reliable fallback', paramName: 'max_tokens', supportsTemperature: true },
      { name: 'gpt-4.1-2025-04-14', model: 'gpt-4.1-2025-04-14', description: 'final attempt', paramName: 'max_completion_tokens' }
    ] : [
      { name: 'gpt-4o-mini', model: 'gpt-4o-mini', description: 'fast & reliable', paramName: 'max_tokens', supportsTemperature: true }, 
      { name: 'gpt-4o', model: 'gpt-4o', description: 'content fallback', paramName: 'max_tokens', supportsTemperature: true },
      { name: 'gpt-4o-mini', model: 'gpt-4o-mini', description: 'backup reliable', paramName: 'max_tokens', supportsTemperature: true },
      { name: 'gpt-4o', model: 'gpt-4o', description: 'final legacy attempt', paramName: 'max_tokens', supportsTemperature: true }
    ];
    
    cache.set(cacheKey, chain);
  }
  
  return chain;
};

// Cache hair color mapping rules with enhanced diversity
export const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = cache.get<Record<string, string[]>>(cacheKey);
  if (!mapping) {
    mapping = {
      'pale': ['red hair', 'auburn hair', 'strawberry blonde hair'],
      'light': ['blonde hair', 'light brown hair', 'golden hair'], 
      'medium': ['brown hair', 'chestnut hair', 'dark blonde hair'],
      'olive': ['black hair', 'dark brown hair', 'jet black hair'],
      'dark': ['dark curly hair', 'black hair', 'coily hair', 'natural hair']
    };
    
    cache.set(cacheKey, mapping);
  }
  
  return mapping;
};

// Cache gender/pronoun mapping rules
export const getGenderPronounMapping = () => {
  const cacheKey = 'gender_pronoun_mapping';
  
  let mapping = cache.get<any>(cacheKey);
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
    
    cache.set(cacheKey, mapping);
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
  
  let settings = cache.get<any>(cacheKey);
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
    
    cache.set(cacheKey, settings);
  }
  
  return settings;
};