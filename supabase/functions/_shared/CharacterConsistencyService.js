/**
 * Character Consistency Service - Enhanced with Cultural Intelligence
 * Handles all character generation, consistency, cultural enhancements, and persistence
 * Includes all cultural arrays and detection logic from FrontendIntelligence
 */

export class CharacterConsistencyService {
  constructor() {
    this.characterCache = new Map(); // sessionId -> character data
    console.log('🎭 CharacterConsistencyService initialized with enhanced cultural intelligence');
  }

  // ============= CULTURAL ARRAYS (Moved from FrontendIntelligence) =============
  
  static EXPANDED_AFRICAN_AMERICAN_HAIRSTYLES = {
    boys: [
      'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
      'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
      'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
      'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
      'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
      'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design', 
      'textured hair tattoo', 'detailed geometric patterns', 'textured mini afro', 
      'detailed medium afro', 'textured tapered afro', 'detailed wash and go', 
      'textured finger coils', 'detailed two strand twists', 'textured flat twists', 
      'detailed mini twists', 'textured locs', 'detailed starter locs', 'textured freeform locs', 
      'detailed twisted locs', 'textured side part locs', 'detailed middle part locs', 
      'textured ponytail with locs', 'detailed nape area tapered'
    ],
    girls: [
      'textured medium natural hair', 'textured long natural hair', 'textured shoulder-length hair', 
      'textured chin-length hair', 'detailed twist out', 'detailed bantu knots', 'detailed rod set', 
      'detailed braid out', 'textured high puff', 'textured low puff', 'textured side puff', 
      'textured double puff', 'detailed space buns', 'detailed top knot bun', 'detailed low bun', 
      'detailed messy bun', 'detailed sleek bun', 'detailed cornrows', 'detailed box braids', 
      'detailed micro braids', 'detailed jumbo braids', 'detailed goddess braids', 
      'detailed dutch braids', 'detailed french braids', 'detailed fishtail braids', 
      'detailed halo braid', 'detailed crown braid', 'detailed side braids', 
      'detailed three strand twists', 'detailed senegalese twists', 'detailed marley twists', 
      'detailed havana twists', 'detailed passion twists', 'detailed spring twists', 
      'detailed kinky twists', 'detailed chunky twists', 'detailed protective twists', 
      'textured sisterlocs', 'textured microlocs', 'textured traditional locs', 
      'textured interlocked locs', 'detailed braided locs', 'detailed loc updo', 
      'textured half up half down locs', 'textured afro puffs', 'textured large afro', 
      'textured picked out afro', 'textured shaped afro', 'textured curly afro', 
      'textured coily afro', 'textured kinky afro', 'textured side swept bangs', 
      'textured face framing layers', 'textured layered cut', 'detailed blunt cut', 
      'detailed asymmetrical cut'
    ]
  };
  
  static EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
    'authentic african american features'
  ];
  
  static EXPANDED_AFRICAN_AMERICAN_CLOTHING = [
    'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis', 
    'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans', 
    'tank top and cargo shorts', 'flannel shirt and jeans', 'jersey and joggers', 
    'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos', 
    'baseball cap and casual wear', 'sneakers and athletic socks', 'backpack and school clothes', 
    'comfortable everyday outfit', 'playground-appropriate clothing', 'weekend casual wear', 
    'school uniform alternatives', 'athletic wear and running shoes', 'layered casual look', 
    'seasonal appropriate clothing', 'comfortable playtime outfit', 'trendy youth fashion', 
    'classic American casual style', 'modern comfortable clothing', 'age-appropriate fashion'
  ];

  static CULTURAL_VISUAL_PROFILES = {
    en: {
      skinTones: ['light', 'medium', 'olive', 'tan', 'brown', 'dark'],
      hairStyles: ['straight', 'wavy', 'curly', 'coiled'],
      clothingStyles: ['casual', 'formal', 'athletic', 'trendy'],
      settingKeywords: ['urban environment', 'rural landscape', 'historical site', 'modern city'],
      culturalElements: ['cultural symbols', 'traditional art', 'local festivals', 'ethnic patterns']
    },
    es: {
      skinTones: ['tono claro', 'tono medio', 'tono oliva', 'tono bronceado', 'tono moreno', 'tono oscuro'],
      hairStyles: ['cabello liso', 'cabello ondulado', 'cabello rizado', 'cabello ensortijado'],
      clothingStyles: ['ropa casual', 'ropa formal', 'ropa deportiva', 'ropa moderna'],
      settingKeywords: ['ambiente urbano', 'paisaje rural', 'sitio histórico', 'ciudad moderna'],
      culturalElements: ['símbolos culturales', 'arte tradicional', 'festivales locales', 'patrones étnicos']
    }
  };

  /**
   * Enhanced cultural detection (moved from FrontendIntelligence)
   */
  shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo) {
    if (!avatarIdentity && !userInfo) return false;
    
    // Check avatar identity
    if (avatarIdentity?.type === 'african_american' || 
        avatarIdentity?.skinTone === 'african_american' ||
        avatarIdentity?.ethnicity === 'african_american') {
      return true;
    }
    
    // Check user language preference (English users more likely for AA variations)
    if (userInfo?.nativeLanguage === 'en' || !userInfo?.nativeLanguage) {
      return Math.random() < 0.3; // 30% chance for English users
    }
    
    return false;
  }

  /**
   * Get or create character seed with full consistency support
   */
  async getCharacterSeed(sessionId, userId, userInfo, storyContext, avatarIdentity = null, sessionType = 'new') {
    const characterName = userInfo.name || 'child';
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Check cache first
    if (this.characterCache.has(cacheKey)) {
      const cached = this.characterCache.get(cacheKey);
      console.log(`🎭 CACHED: Using existing character for ${characterName} (seed: ${cached.seed})`);
      return cached;
    }
    
    // Generate new character
    const seedData = await this.createNewCharacterSeed(userId, userInfo, avatarIdentity);
    const characterDescription = this.buildCharacterDescription(seedData, storyContext);
    const culturalContext = this.buildCulturalContext(seedData);
    
    const characterData = {
      seed: seedData.baseSeed,
      characterDescription,
      culturalContext,
      avatarIdentity: {
        type: seedData.avatarType || avatarIdentity?.type,
        skinTone: seedData.skinTone || avatarIdentity?.skinTone
      },
      physicalTraits: seedData.physicalTraits,
      culturalElements: seedData.culturalElements,
      generatedAt: Date.now()
    };
    
    // Cache for consistency
    this.characterCache.set(cacheKey, characterData);
    
    console.log(`🎭 FRESH: Generated new character for ${characterName} (seed: ${seedData.baseSeed})`);
    return characterData;
  }

  /**
   * Create new character seed with avatar awareness
   */
  async createNewCharacterSeed(userId, userInfo, avatarIdentity = null) {
    const avatarSeedInput = avatarIdentity ? 
      `${userId}-${userInfo.name || 'child'}-${avatarIdentity.skinTone || 'medium'}` : 
      `${userId}-${userInfo.name || 'child'}-${userInfo.avatar?.skinTone || 'medium'}`;
    
    const baseSeed = this.generateStableSeed(avatarSeedInput, userInfo.name || 'child');
    
    // Generate physical traits
    const physicalTraits = avatarIdentity ? 
      this.generatePhysicalTraitsFromIdentity(avatarIdentity, baseSeed) :
      this.generatePhysicalTraits(userInfo, baseSeed);
    
    // Determine cultural profile
    const culturalProfile = this.determineCulturalProfile(userInfo);
    const culturalElements = this.generateCulturalElements(culturalProfile, userInfo);
    
    return {
      baseSeed,
      avatarType: avatarIdentity?.type || userInfo.avatar?.type || 'child',
      skinTone: avatarIdentity?.skinTone || userInfo.avatar?.skinTone || 'medium',
      physicalTraits,
      culturalElements,
      culturalProfile
    };
  }

  /**
   * Generate stable seed from user data
   */
  generateStableSeed(seedInput, characterName) {
    let hash = 0;
    const combined = `${seedInput}-${characterName}`;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash % 999999) + 1;
  }

  /**
   * Generate physical traits from avatar identity
   */
  generatePhysicalTraitsFromIdentity(avatarIdentity, seed) {
    const random = this.createSeededRandom(seed);
    
    const hairColor = this.getHairColorFromAvatar(avatarIdentity);
    const skinTone = avatarIdentity.skinTone || 'medium';
    
    const eyeColorOptions = skinTone === 'dark' ? ['brown', 'dark brown'] : 
                           skinTone === 'pale' ? ['blue', 'green', 'brown', 'hazel'] :
                           ['brown', 'hazel', 'green'];
    
    const builds = ['slim', 'average', 'sturdy'];
    const heights = ['short', 'average height', 'tall for their age'];
    
    return {
      skinTone,
      hairColor,
      eyeColor: eyeColorOptions[Math.floor(random() * eyeColorOptions.length)],
      build: builds[Math.floor(random() * builds.length)],
      height: heights[Math.floor(random() * heights.length)]
    };
  }

  /**
   * Fallback physical traits generation
   */
  generatePhysicalTraits(userInfo, seed) {
    const avatar = userInfo.avatar || {};
    const random = this.createSeededRandom(seed);
    
    const skinToneMap = {
      'pale': 'fair',
      'light': 'light', 
      'medium': 'medium',
      'olive': 'olive',
      'dark': 'dark'
    };
    
    const skinTone = skinToneMap[avatar.skinTone] || 'medium';
    const hairColor = this.getHairColorFromAvatar(avatar);
    
    const eyeColorOptions = skinTone === 'dark' ? ['brown', 'dark brown'] : 
                           skinTone === 'pale' ? ['blue', 'green', 'brown', 'hazel'] :
                           ['brown', 'hazel', 'green'];
    
    const builds = ['slim', 'average', 'sturdy'];
    const heights = ['short', 'average height', 'tall for their age'];
    
    return {
      skinTone,
      hairColor,
      eyeColor: eyeColorOptions[Math.floor(random() * eyeColorOptions.length)],
      build: builds[Math.floor(random() * builds.length)],
      height: heights[Math.floor(random() * heights.length)]
    };
  }

  /**
   * Simple hair color mapping
   */
  getHairColorFromAvatar(avatar) {
    const hairColorMap = {
      'blonde': 'blonde',
      'brown': 'brown',
      'black': 'black', 
      'red': 'red',
      'gray': 'gray'
    };
    return hairColorMap[avatar?.hairColor] || 'brown';
  }

  /**
   * Determine cultural profile
   */
  determineCulturalProfile(userInfo) {
    const nativeLanguage = userInfo.nativeLanguage || 'en';
    
    if (nativeLanguage === 'es') return 'hispanic-american';
    if (nativeLanguage === 'fr') return 'french-american';
    if (nativeLanguage === 'de') return 'german-american';
    if (nativeLanguage === 'it') return 'italian-american';
    if (nativeLanguage === 'pt') return 'portuguese-american';
    
    return 'standard-american';
  }

  /**
   * Generate cultural elements
   */
  generateCulturalElements(culturalProfile, userInfo) {
    const culturalStyleMap = {
      'standard-american': {
        clothing: [
          'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis',
          'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans',
          'school uniform', 'dress shirt and dress pants', 'athletic wear and running shoes'
        ],
        accessories: [
          'backpack', 'sneakers', 'baseball cap', 'watch', 'friendship bracelet',
          'sports equipment', 'water bottle', 'glasses'
        ],
        markers: [
          'suburban neighborhood', 'local community center', 'neighborhood park',
          'American traditions', 'school spirit', 'hometown pride'
        ]
      },
      'hispanic-american': {
        clothing: [
          'colorful casual wear', 'traditional family gathering outfit', 'modern American style',
          'festive celebration clothing', 'comfortable family-oriented attire'
        ],
        accessories: [
          'family jewelry', 'cultural celebration items', 'traditional accessories',
          'modern American accessories', 'community event items'
        ],
        markers: [
          'familia traditions', 'bilingual household', 'cultural celebrations',
          'community festivals', 'heritage pride', 'multicultural identity'
        ]
      }
    };
    
    return culturalStyleMap[culturalProfile] || culturalStyleMap['standard-american'];
  }

  /**
   * Build character description
   */
  buildCharacterDescription(seedData, storyContext) {
    const traits = seedData.physicalTraits;
    const cultural = seedData.culturalElements;
    
    const clothing = cultural.clothing[Math.floor(Math.random() * cultural.clothing.length)];
    const accessories = cultural.accessories.slice(0, 2).join(' and ');
    
    return `A ${traits.height} ${seedData.avatarType} with ${traits.skinTone} skin, ${traits.hairColor} hair, and ${traits.eyeColor} eyes. ${traits.build} build. Wearing ${clothing}${accessories ? ` with ${accessories}` : ''}.`;
  }

  /**
   * Build cultural context
   */
  buildCulturalContext(seedData) {
    const markers = seedData.culturalElements.markers.slice(0, 2);
    return markers.join(', ');
  }

  /**
   * Create seeded random generator
   */
  createSeededRandom(seed) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 16807) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };
  }

  /**
   * Clear character data for session
   */
  clearCharacterData(sessionId) {
    const keysToDelete = [];
    for (const key of this.characterCache.keys()) {
      if (key.startsWith(`${sessionId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.characterCache.delete(key));
    console.log(`🎭 Cleared character data for session: ${sessionId}`);
  }

  /**
   * Get monitoring data
   */
  getActiveCharacterSeeds() {
    return {
      total: this.characterCache.size,
      sessions: Array.from(this.characterCache.keys()).map(key => key.split('_')[0]),
      note: 'Clean architecture with session-based caching'
    };
  }

  /**
   * Clear all state
   */
  clearServerState() {
    this.characterCache.clear();
    console.log('🎭 Character consistency service cleared');
    return { cleared: true, message: 'Clean architecture state cleared' };
  }
}