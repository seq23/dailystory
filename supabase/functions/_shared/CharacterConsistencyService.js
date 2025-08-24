/**
 * Character Consistency Service - Clean Architecture
 * Handles all character generation, consistency, and persistence operations
 * No globalThis dependencies, simple error handling, focused responsibility
 */

export class CharacterConsistencyService {
  constructor() {
    this.characterCache = new Map(); // sessionId -> character data
    console.log('🎭 CharacterConsistencyService initialized with clean architecture');
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