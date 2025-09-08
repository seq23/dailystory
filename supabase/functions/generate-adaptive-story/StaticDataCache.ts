// Static Data Caching for Edge Functions
// Mirror of frontend caching service for edge function use

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class EdgeStaticCache {
  private static instance: EdgeStaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours TTL for static data - optimization TTL

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

// Ultra-Cheap Model Chain Configuration (90% cost reduction)
// NOTE: Removed duplicate getModelChain export to fix edge function boot failure
// Using getModelChainOptimized as the single source of truth (line 440)

// Cultural Context Embedded Data (Phase 2: 24h cache, no external files)
export const getCulturalContextArrays = () => {
  const cacheKey = 'cultural_context_arrays';
  
  let contexts = cache.get<any>(cacheKey);
  if (!contexts) {
    contexts = {
      'ar': {
        characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef', 'Nadia', 'Tariq'],
        commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives', 'baklava', 'tahini', 'falafel'],
        celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings', 'Ramadan iftar', 'harvest festivals', 'naming ceremonies', 'homecoming parties', 'religious holidays', 'community festivals'],
        values: ['hospitality', 'family honor', 'community respect', 'sharing with others', 'wisdom of elders', 'generosity', 'faith', 'perseverance', 'loyalty', 'tradition'],
        sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery', 'swimming', 'running', 'volleyball', 'tennis', 'basketball']
      },
      'es': {
        characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel', 'Lucia', 'Alejandro'],
        commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices', 'tamales', 'quesadillas', 'churros', 'plantains', 'mole'],
        celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations', 'Las Posadas', 'Cinco de Mayo', 'baptisms', 'Christmas traditions', 'patron saint festivals', 'wedding celebrations'],
        values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders', 'religious faith', 'hard work', 'hospitality', 'cultural pride', 'perseverance', 'solidarity'],
        sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling', 'basketball', 'tennis', 'swimming', 'wrestling', 'track and field']
      },
      'es-afro-latina': {
        characterNames: ['Esperanza', 'Joaquín', 'Marisol', 'Roberto', 'Xiomara', 'Esteban', 'Yolanda', 'Fernando', 'Soledad', 'Ramón'],
        commonFoods: ['moros y cristianos', 'tostones', 'yuca con mojo', 'ropa vieja', 'tres leches cake', 'platanos maduros', 'arroz con pollo', 'frijoles negros', 'croquetas', 'café cubano'],
        celebrations: ['carnival celebrations', 'salsa festivals', 'Día de la Raza', 'family reunions', 'quinceañeras', 'religious processions', 'música y baile', 'community block parties', 'cultural heritage festivals', 'Christmas parrandas'],
        values: ['familia es todo', 'cultural pride', 'resilience', 'community solidarity', 'celebration of heritage', 'respect for ancestors', 'musical expression', 'hospitality', 'perseverance', 'unity in diversity'],
        sports: ['baseball', 'boxing', 'basketball', 'volleyball', 'football', 'swimming', 'track and field', 'martial arts', 'tennis', 'cycling']
      },
      'zh': {
        characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun', 'Huang Jie', 'Sun Hua', 'Zhao Gang'],
        commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes', 'steamed buns', 'hot pot', 'spring rolls', 'congee'],
        celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions', 'Lantern Festival', 'Qingming Festival', 'Children\'s Day', 'National Day', 'wedding banquets', 'birthday celebrations'],
        values: ['hard work', 'education', 'family harmony', 'perseverance', 'respect for elders', 'diligence', 'patience', 'loyalty', 'modesty', 'wisdom'],
        sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics', 'basketball', 'volleyball', 'swimming', 'track and field', 'football']
      },
      'hi': {
        characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev', 'Ravi', 'Meera'],
        commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea', 'samosas', 'biryani', 'lassi'],
        celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies', 'Raksha Bandhan', 'Navratri', 'Karva Chauth', 'Eid celebrations', 'Ganesh Chaturthi'],
        values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality', 'family unity', 'seva (service)', 'dharma (duty)', 'compassion', 'tolerance', 'gratitude'],
        sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling', 'football', 'volleyball', 'table tennis', 'chess', 'carrom']
      },
      'pt': {
        characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael', 'Isabela', 'Lucas'],
        commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water', 'pão de açúcar', 'feijoada', 'brigadeiros', 'pastéis', 'tapioca'],
        celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals', 'Festa Junina', 'New Year\'s Eve', 'family gatherings', 'saints\' days', 'graduation parties', 'Christmas celebrations'],
        values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit', 'family bonds', 'optimism', 'creativity', 'hospitality', 'resilience', 'passion for life'],
        sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball', 'basketball', 'swimming', 'futsal', 'tennis', 'martial arts']
      },
      'fr': {
        characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas', 'Chloé', 'Alexandre'],
        commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes', 'wine', 'crêpes', 'coq au vin'],
        celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day', 'Christmas markets', 'wine festivals', 'music concerts', 'cultural events', 'regional fairs'],
        values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage', 'artistic expression', 'joie de vivre', 'sophistication', 'romance', 'philosophy', 'refinement'],
        sports: ['football', 'rugby', 'cycling', 'tennis', 'handball', 'skiing', 'swimming', 'basketball', 'fencing', 'sailing']
      },
      'fr-francophone-african': {
        characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou', 'Kadiatou', 'Moussa'],
        commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké', 'fufu', 'jollof rice', 'bissap'],
        celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings', 'naming ceremonies', 'mask festivals', 'drumming circles', 'storytelling nights', 'market days', 'seasonal celebrations'],
        values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality', 'Ubuntu philosophy', 'ancestral wisdom', 'collective responsibility', 'cultural preservation', 'harmony with nature', 'spiritual connection'],
        sports: ['football', 'basketball', 'wrestling', 'running', 'handball', 'volleyball', 'boxing', 'martial arts', 'track and field', 'swimming']
      },
      'en': {
        characterNames: ['Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Mason', 'Isabella', 'Jacob', 'Ava', 'William'],
        commonFoods: ['sandwiches', 'pizza', 'burgers', 'salads', 'snacks', 'milk', 'fruit', 'pasta', 'chicken', 'ice cream'],
        celebrations: ['birthdays', 'holidays', 'school events', 'sports games', 'family vacations', 'graduation ceremonies', 'Halloween', 'Thanksgiving', 'Christmas', 'summer barbecues'],
        values: ['independence', 'achievement', 'fairness', 'creativity', 'innovation', 'diversity', 'opportunity', 'freedom', 'self-expression', 'entrepreneurship'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field', 'golf', 'volleyball']
      },
      'en-african-american': {
        characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos', 'Ace', 'Cruz', 'Crystal', 'Benny', 'Gerzell', 'Isabella', 'Imani', 'Jordan', 'Tori', 'Amari', 'Will', 'Justin', 'Paige', 'Val', 'Akeelah', 'Erin', 'Shannon', 'Reggie', 'Kelsie', 'Aerric', 'Ayden', 'Jared', 'Lennon', 'Brandon', 'Gabriella', 'Noah', 'Oliva', 'Sterling', 'Korri', 'Corey'],
        commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
        celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
        values: ['community strength', 'family pride', 'perseverance', 'educational achievement', 'cultural heritage', 'resilience'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
      }
    };
    cache.set(cacheKey, contexts);
  }
  
  return contexts;
};

// Cache hair color mapping rules with enhanced diversity
export const getHairColorMapping = () => {
  const cacheKey = 'hair_color_mapping';
  
  let mapping = cache.get<Record<string, string[]>>(cacheKey);
  if (!mapping) {
    mapping = {
      'pale': [
        // Red/Auburn family only - true to pale skin
        'long red hair',
        'short red hair', 
        'red hair in pigtails',
        'red hair in ponytail',
        'shoulder-length red hair',
        'long auburn hair',
        'short auburn hair',
        'auburn hair in braids',
        'shoulder-length auburn hair',
        'long strawberry blonde hair',
        'short strawberry blonde hair',
        'strawberry blonde hair in pigtails',
        'curly red hair',
        'wavy auburn hair'
      ],
      'light': [
        // Blonde types only - true to light skin
        'long blonde hair',
        'short blonde hair',
        'blonde hair in pigtails', 
        'blonde hair in ponytail',
        'shoulder-length blonde hair',
        'long platinum blonde hair',
        'short platinum blonde hair',
        'long golden blonde hair',
        'short golden blonde hair',
        'golden blonde hair in braids',
        'long dirty blonde hair',
        'short dirty blonde hair',
        'curly blonde hair',
        'wavy blonde hair',
        'blonde hair in twin braids'
      ],
      'medium': [
        // Brown family - true to medium skin
        'long brown hair',
        'short brown hair',
        'brown hair in ponytail',
        'brown hair in pigtails',
        'shoulder-length brown hair',
        'long chestnut hair',
        'short chestnut hair',
        'chestnut hair in braids',
        'long dark brown hair',
        'short dark brown hair',
        'dark brown hair in ponytail',
        'curly brown hair',
        'wavy brown hair',
        'brown hair in bun',
        'shoulder-length chestnut hair'
      ],
      'olive': [
        // Black/very dark brown - true to olive skin
        'long black hair',
        'short black hair',
        'black hair in ponytail',
        'black hair in braids',
        'shoulder-length black hair',
        'long jet black hair',
        'short jet black hair',
        'jet black hair in bun',
        'long dark brown hair',
        'short dark brown hair',
        'dark brown hair in ponytail',
        'straight black hair',
        'wavy black hair',
        'black hair in twin braids'
      ],
      'dark': [
        // Natural textured styles - true to dark skin
        'pretty hair', 'thick hair', 'shiny hair', 'great hair', 'amazing hair', 'awesome hair', 'voluminous thick hair'
      ]
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
  
  // Filter out gendered hairstyles for gender-neutral avatars
  const avatarType = userInfo?.avatarType || userInfo?.avatar?.type || 'prefer-not-to-answer';
  const filteredHairOptions = avatarType === 'prefer-not-to-answer' 
    ? hairOptions.filter(hair => !hair.toLowerCase().includes('pigtails') && 
                                 !hair.toLowerCase().includes('ponytail') && 
                                 !hair.toLowerCase().includes('braids') && 
                                 !hair.toLowerCase().includes('bun'))
    : hairOptions;
  
  const hairColor = filteredHairOptions[Math.floor(Math.random() * filteredHairOptions.length)];
  
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

// Phase 3: Vocabulary Caching Enhancement - Backend Implementation
export const getVocabularyCache = (level: number, type: 'user' | 'system' | 'teacher' = 'system') => {
  const cacheKey = `vocab_${type}_${level}`;
  
  let vocabSet = cache.get<string[]>(cacheKey);
  if (!vocabSet) {
    // Smart rotation: 50 words per level, 3 daily sets
    const dailySet = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % 3;
    const baseWords = getVocabularyByLevel(level);
    const setSize = Math.min(50, Math.floor(baseWords.length / 3));
    const startIdx = dailySet * setSize;
    
    vocabSet = baseWords.slice(startIdx, startIdx + setSize);
    cache.set(cacheKey, vocabSet);
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

// Phase 1: User-Specific Vocabulary Caching (Backend Only) - 1 hour TTL
interface UserVocabularyCache {
  userId: string;
  childId?: string;
  teacherWords: string[];
  formWords: string[];
  specialRequestWords: string[];
  timestamp: number;
}

class UserVocabCache {
  private static instance: UserVocabCache;
  private cache = new Map<string, UserVocabularyCache>();
  private readonly USER_CACHE_TTL = 60 * 60 * 1000; // 1 hour TTL for user vocab

  private constructor() {}

  static getInstance(): UserVocabCache {
    if (!UserVocabCache.instance) {
      UserVocabCache.instance = new UserVocabCache();
    }
    return UserVocabCache.instance;
  }

  private getCacheKey(userId: string, childId?: string): string {
    return childId ? `${userId}_${childId}` : userId;
  }

  get(userId: string, childId?: string): UserVocabularyCache | null {
    const key = this.getCacheKey(userId, childId);
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.USER_CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(userId: string, childId: string | undefined, teacherWords: string[], formWords: string[], specialRequestWords: string[]): void {
    const key = this.getCacheKey(userId, childId);
    this.cache.set(key, {
      userId,
      childId,
      teacherWords,
      formWords,
      specialRequestWords,
      timestamp: Date.now()
    });
  }

  invalidate(userId: string, childId?: string): void {
    const key = this.getCacheKey(userId, childId);
    this.cache.delete(key);
  }

  getAllUserVocab(userId: string, childId?: string): string[] {
    const entry = this.get(userId, childId);
    if (!entry) return [];
    
    return [...entry.teacherWords, ...entry.formWords, ...entry.specialRequestWords];
  }
}

export const userVocabCache = UserVocabCache.getInstance();

// Enhanced User Vocabulary Cache Functions
export const getUserVocabularyCache = (userId: string, childId?: string): string[] => {
  return userVocabCache.getAllUserVocab(userId, childId);
};

export const setUserVocabularyCache = (
  userId: string, 
  childId: string | undefined, 
  teacherWords: string[], 
  formWords: string[], 
  specialRequestWords: string[]
): void => {
  userVocabCache.set(userId, childId, teacherWords, formWords, specialRequestWords);
};

export const invalidateUserVocabularyCache = (userId: string, childId?: string): void => {
  userVocabCache.invalidate(userId, childId);
};

// Phase 2: Enhanced Model Configuration Consolidation - Single Source of Truth
export const getModelChainOptimized = (isExpertLevel: boolean = false, forceRefresh: boolean = false) => {
  const cacheKey = `model_chain_optimized_${isExpertLevel ? 'expert' : 'regular'}`;
  
  if (forceRefresh) {
    cache.cache.delete(cacheKey);
  }
  
  let chain = cache.get<any[]>(cacheKey);
  if (!chain) {
    if (isExpertLevel) {
      // Expert: Balanced cost optimization - gpt-4o-mini first, gpt-4o fallback only
      chain = [
        { 
          name: 'gpt-4o-mini', 
          model: 'gpt-4o-mini', 
          description: 'primary cost-optimized model',
          paramName: 'max_tokens', 
          supportsTemperature: true,
          costMultiplier: 1.0,
          priority: 1
        },
        { 
          name: 'gpt-4o', 
          model: 'gpt-4o', 
          description: 'premium fallback for complex stories',
          paramName: 'max_tokens', 
          supportsTemperature: true,
          costMultiplier: 20.0,
          priority: 2
        }
      ];
    } else {
      // Regular: Ultra cost-optimized - only gpt-4o-mini
      chain = [
        { 
          name: 'gpt-4o-mini', 
          model: 'gpt-4o-mini', 
          description: 'ultra-cost-optimized primary model',
          paramName: 'max_tokens', 
          supportsTemperature: true,
          costMultiplier: 1.0,
          priority: 1
        }
      ];
    }
    
    cache.set(cacheKey, chain);
    console.log(`🔧 Model chain cached: ${chain.length} models for ${isExpertLevel ? 'expert' : 'regular'} level`);
  }
  
  return chain;
};

// Backward compatibility - redirect to optimized version
export { getModelChainOptimized as getModelChain };