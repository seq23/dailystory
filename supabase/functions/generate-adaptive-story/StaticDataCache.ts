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

// ============================================================================
// PHASE 8: UNIFIED AVATAR IDENTITY PROCESSOR - SINGLE SOURCE OF TRUTH
// ============================================================================
// This function creates complete avatar identity bundles with binary validation
// Replaces all distributed avatar mapping logic across the system

// Enhanced skin tone variation arrays for cultural accuracy
const CULTURAL_SKIN_TONE_VARIATIONS = {
  pale: [
    'very fair skin with warm undertones',
    'porcelain skin with neutral undertones', 
    'fair skin with cool undertones',
    'light peachy skin',
    'alabaster skin with golden hints'
  ],
  light: [
    'light skin with warm golden undertones',
    'fair skin with peachy undertones',
    'ivory skin with neutral tones',
    'light beige skin',
    'cream-colored skin with subtle warmth'
  ],
  medium: [
    'warm medium brown skin',
    'olive-toned medium skin',
    'golden medium skin',
    'honey-colored skin',
    'medium tan skin with warm undertones'
  ],
  olive: [
    'rich olive skin with golden undertones',
    'Mediterranean olive skin',
    'warm olive-toned skin',
    'golden olive complexion',
    'deep olive skin with bronze hints'
  ],
  dark: [
    'beautiful rich dark skin',
    'deep ebony skin with natural glow',
    'warm dark brown skin',
    'rich mahogany skin tone',
    'gorgeous dark complexion with golden undertones'
  ]
};

// Cultural profile detection for enhanced representation
export const detectCulturalProfile = (userInfo: any): string => {
  const nativeLanguage = userInfo?.nativeLanguage || 'en';
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  
  // Enhanced cultural profile mapping
  const culturalProfiles = {
    'ar': 'middle-eastern',
    'es': skinTone === 'dark' ? 'afro-latina' : 'latina',
    'zh': 'east-asian',
    'hi': 'south-asian',
    'pt': skinTone === 'dark' ? 'afro-brazilian' : 'brazilian',
    'fr': skinTone === 'dark' ? 'francophone-african' : 'european',
    'en': skinTone === 'dark' ? 'african-american' : 'general'
  };
  
  return culturalProfiles[nativeLanguage] || 'general';
};

// Binary avatar identity validation - ALL OR NONE principle
export const validateAvatarIdentityCompleteness = (userInfo: any): { isComplete: boolean; missing: string[] } => {
  const required = ['type', 'skinTone', 'name'];
  const missing: string[] = [];
  
  if (!userInfo?.avatar?.type && !userInfo?.avatarType) missing.push('type');
  if (!userInfo?.avatar?.skinTone) missing.push('skinTone');
  if (!userInfo?.name) missing.push('name');
  
  return {
    isComplete: missing.length === 0,
    missing
  };
};

// Enhanced avatar identity processor with binary validation
export const processAvatarIdentityFromCache = (userInfo: any) => {
  console.log('🔍 PHASE 8: Processing avatar identity with binary validation');
  
  // Step 1: Binary completeness validation
  const validation = validateAvatarIdentityCompleteness(userInfo);
  if (!validation.isComplete) {
    console.warn('❌ BINARY VALIDATION FAILED: Missing required fields:', validation.missing);
    return null; // Binary failure - return null for incomplete identity
  }
  
  // Step 2: Extract and process avatar data
  const hairMapping = getHairColorMapping();
  const genderMapping = getGenderPronounMapping();
  
  // Core avatar properties with fallbacks
  const avatarType = userInfo?.avatarType || userInfo?.avatar?.type || 'child';
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  const userName = userInfo?.name || 'Child';
  const nativeLanguage = userInfo?.nativeLanguage || 'en';
  
  // Step 3: Cultural profile detection
  const culturalProfile = detectCulturalProfile(userInfo);
  
  // Step 4: Enhanced skin tone variation selection
  const skinToneVariations = CULTURAL_SKIN_TONE_VARIATIONS[skinTone] || CULTURAL_SKIN_TONE_VARIATIONS['medium'];
  const skinToneVariation = skinToneVariations[Math.floor(Math.random() * skinToneVariations.length)];
  
  // Step 5: Hair color processing with cultural awareness
  const hairOptions = hairMapping[skinTone] || hairMapping['medium'];
  const filteredHairOptions = avatarType === 'prefer-not-to-answer' 
    ? hairOptions.filter(hair => !hair.toLowerCase().includes('pigtails') && 
                                 !hair.toLowerCase().includes('ponytail') && 
                                 !hair.toLowerCase().includes('braids') && 
                                 !hair.toLowerCase().includes('bun'))
    : hairOptions;
  
  const hairColor = filteredHairOptions[Math.floor(Math.random() * filteredHairOptions.length)];
  
  // Step 6: Gender/pronoun processing
  const pronoun = genderMapping.pronouns[avatarType] || 'they';
  const completeGenderInfo = genderMapping.completeInfo[avatarType] || genderMapping.fallbacks.completeInfo;
  
  // Step 7: Create complete avatar identity bundle
  const avatarIdentity = {
    // Core identity fields (required for enhanced processing)
    type: avatarType,
    skinTone: skinTone,
    skinToneVariation: skinToneVariation,
    hairColor: hairColor,
    culturalProfile: culturalProfile,
    nativeLanguage: nativeLanguage,
    name: userName,
    
    // Processed fields for image generation
    pronoun: pronoun,
    completeGenderInfo: completeGenderInfo,
    
    // Enhanced visual description for consistency
    visualDescription: `${userName} is a ${avatarType} with ${skinToneVariation} and ${hairColor}`,
    
    // Metadata for tier routing
    completenessValidation: validation,
    processingTimestamp: Date.now()
  };
  
  console.log('✅ PHASE 8: Complete avatar identity processed:', {
    type: avatarIdentity.type,
    skinTone: avatarIdentity.skinTone,
    culturalProfile: avatarIdentity.culturalProfile,
    visualDescriptionLength: avatarIdentity.visualDescription.length
  });
  
  return avatarIdentity;
};

// Service health validation for consistency services
export const validateConsistencyServices = (): { available: boolean; missing: string[] } => {
  // This would check if character consistency and visual tracking services are operational
  // For now, return true as services are embedded in the same function
  return {
    available: true,
    missing: []
  };
};

// Binary tier routing based on avatar identity and service availability
export const determineImageGenerationTier = (userInfo: any): { tier: string; reason: string; avatarIdentity: any } => {
  // Step 1: Validate avatar identity completeness
  const avatarIdentity = processAvatarIdentityFromCache(userInfo);
  
  if (!avatarIdentity) {
    return {
      tier: '2.5C',
      reason: 'Incomplete avatar identity - missing required fields',
      avatarIdentity: null
    };
  }
  
  // Step 2: Validate consistency services availability
  const serviceValidation = validateConsistencyServices();
  
  if (!serviceValidation.available) {
    return {
      tier: '2.5B',
      reason: 'Complete avatar identity but consistency services unavailable',
      avatarIdentity: avatarIdentity
    };
  }
  
  // Step 3: Enhanced processing available
  return {
    tier: '1',
    reason: 'Complete avatar identity and all services available',
    avatarIdentity: avatarIdentity
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

export const getCulturalGuidanceString = (userInfo: any) => {
  const contexts = getCulturalContextArrays();
  const nativeLanguage = userInfo?.nativeLanguage || 'en';
  const skinTone = userInfo?.avatar?.skinTone;
  
  // Enhanced regional detection covering all 11 cultural contexts
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