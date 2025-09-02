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
      { model: 'gpt-5-2025-08-07', description: 'flagship expert quality', paramName: 'max_completion_tokens' },
      { model: 'gpt-4.1-2025-04-14', description: 'intelligent fallback', paramName: 'max_completion_tokens' }, 
      { model: 'gpt-5-mini-2025-08-07', description: 'fast & reliable', paramName: 'max_completion_tokens' },
      { model: 'gpt-4.1-2025-04-14', description: 'retry intelligent', paramName: 'max_completion_tokens' },
      { model: 'gpt-4o', description: 'legacy fallback', paramName: 'max_tokens', supportsTemperature: true },
      { model: 'gpt-4o-mini', description: 'final legacy attempt', paramName: 'max_tokens', supportsTemperature: true }
    ] : [
      { model: 'gpt-4o-mini', description: 'fast & reliable', paramName: 'max_tokens', supportsTemperature: true }, 
      { model: 'gpt-4o-mini', description: 'fast & reliable', paramName: 'max_tokens', supportsTemperature: true },
      { model: 'gpt-4o', description: 'legacy fallback', paramName: 'max_tokens', supportsTemperature: true },
      { model: 'gpt-4o-mini', description: 'final legacy attempt', paramName: 'max_tokens', supportsTemperature: true }
    ];
    
    cache.set(cacheKey, chain);
  }
  
  return chain;
};

// Cache hair color mapping rules
export const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = cache.get<Record<string, string>>(cacheKey);
  if (!mapping) {
    mapping = {
      'pale': 'red hair',
      'light': 'blonde hair', 
      'medium': 'brown hair',
      'olive': 'black hair',
      'dark': 'dark curly hair'
    };
    
    cache.set(cacheKey, mapping);
  }
  
  return mapping;
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