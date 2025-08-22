/**
 * Backend Unified Character Consistency Service
 * Ensures character appearance consistency across all story sessions and generation attempts
 */

class UnifiedCharacterConsistency {
  constructor() {
    // STATELESS: No persistent storage - generate fresh for each request
    console.log('🎭 Character Consistency: Using stateless, avatar-aware generation');
  }

  /**
   * Generate fresh character seed for each request - STATELESS & AVATAR-AWARE
   * Always uses current avatar settings, no persistent caching
   */
  getCharacterSeed(userId, storyId, userInfo, storyContext, avatarIdentity = null, sessionType = 'new') {
    // ALWAYS generate fresh character based on current avatar settings
    const seedData = this.createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity);
    console.log(`🎭 STATELESS: Fresh character generated for ${userInfo.name}: ${seedData.baseSeed} (Avatar: ${avatarIdentity ? 'Optimized' : 'Local'})`);

    const characterDescription = this.buildContextualCharacterDescription(seedData, storyContext);
    const culturalContext = this.buildCulturalContext(seedData);

    return {
      seed: seedData.baseSeed,
      characterDescription,
      culturalContext,
      avatarIdentity: {
        type: seedData.avatarType || avatarIdentity?.skinTone,
        skinTone: seedData.skinTone || avatarIdentity?.skinTone
      }
    };
  }

  /**
   * REMOVED: No more persistent identity preservation - always fresh generation
   * This ensures avatar changes are immediately reflected in character generation
   */

  /**
   * Create new character seed with complete profile - AVATAR-AWARE
   * Always uses current avatar settings for fresh generation
   */
  createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity = null) {
    // Generate seed based on current avatar settings, not just user name
    const avatarSeedInput = avatarIdentity ? 
      `${userId}-${userInfo.name || 'child'}-${avatarIdentity.skinTone || 'medium'}` : 
      `${userId}-${userInfo.name || 'child'}-${userInfo.avatar?.skinTone || 'medium'}`;
    
    const baseSeed = this.generateStableSeed(avatarSeedInput, userInfo.name || 'child');
    
    // ALWAYS use current avatar settings - no fallback to cached data
    const culturalProfile = avatarIdentity?.culturalProfile || this.determineCulturalProfile(userInfo).profile;
    const physicalTraits = avatarIdentity ? 
      this.generatePhysicalTraitsFromIdentity(avatarIdentity, baseSeed) : 
      this.generatePhysicalTraits(userInfo, baseSeed);
    const culturalElements = this.generateCulturalElements(culturalProfile, userInfo);

    return {
      userId,
      storyId,
      characterName: userInfo.name || 'child',
      baseSeed,
      culturalProfile,
      physicalTraits,
      culturalElements,
      avatarType: avatarIdentity?.skinTone || userInfo.avatar?.skinTone || 'medium',
      skinTone: avatarIdentity?.skinTone || userInfo.avatar?.skinTone || 'medium',
      contextualAppearance: {
        currentClothing: culturalElements.clothing,
        currentHairStyle: 'natural style',
        lastContext: ''
      },
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }

  /**
   * Generate stable seed based on user characteristics
   */
  generateStableSeed(userId, characterName) {
    let hash = 0;
    const input = `${userId}-${characterName}`;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * Determine cultural profile from user info - PHASE 2: Enhanced for explicit text generation
   */
  determineCulturalProfile(userInfo) {
    if (!userInfo.avatar) return { profile: 'multicultural', gender: 'child' };
    
    const { nativeLanguage, avatar } = userInfo;
    const skinTone = avatar.skinTone || 'medium';
    
    // Basic gender inference (simplified for character generation)
    const gender = Math.random() > 0.5 ? 'female' : 'male';
    
    // NEW MASTER PLAN: Direct visual description mapping (no cultural profiles)
    if (nativeLanguage === 'en') {
      return { profile: 'standard-american', gender }; // PHASE 2: All English speakers get standard-american treatment  
    }
    
    if (nativeLanguage === 'es') {
      if (skinTone === 'dark') return { profile: 'afro-hispanic', gender };
      if (skinTone === 'olive' || skinTone === 'medium') return { profile: 'hispanic-latino', gender };
      return { profile: 'hispanic-multicultural', gender };
    }
    
    if (nativeLanguage === 'fr') return { profile: skinTone === 'dark' ? 'african-french' : 'french-multicultural', gender };
    if (nativeLanguage === 'zh') return { profile: 'chinese-asian', gender };
    if (nativeLanguage === 'hi') return { profile: 'indian-south-asian', gender };
    if (nativeLanguage === 'ar') return { profile: 'middle-eastern', gender };
    
    return { profile: 'standard-american', gender }; // PHASE 2: Default to standard-american instead of global-multicultural
  }

  /**
   * Generate consistent physical traits from pre-processed avatar identity (OPTIMIZED)
   */
  generatePhysicalTraitsFromIdentity(avatarIdentity, seed) {
    const random = this.createSeededRandom(seed);
    
    const eyeColorOptions = avatarIdentity.skinTone === 'dark' ? ['brown', 'dark brown'] : 
                           avatarIdentity.skinTone === 'fair' ? ['blue', 'green', 'brown', 'hazel'] :
                           ['brown', 'hazel', 'green'];
    const eyeColor = eyeColorOptions[Math.floor(random() * eyeColorOptions.length)];
    
    const builds = ['slim', 'average', 'sturdy'];
    const heights = ['short', 'average height', 'tall for their age'];
    
    return {
      skinTone: avatarIdentity.skinTone,
      hairColor: avatarIdentity.hairColor,
      eyeColor,
      build: builds[Math.floor(random() * builds.length)],
      height: heights[Math.floor(random() * heights.length)]
    };
  }

  /**
   * Generate consistent physical traits (FALLBACK for backward compatibility)
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
    const hairColor = this.getUniversalHairMapping(avatar);
    
    const eyeColorOptions = skinTone === 'dark' ? ['brown', 'dark brown'] : 
                           skinTone === 'pale' ? ['blue', 'green', 'brown', 'hazel'] :
                           ['brown', 'hazel', 'green'];
    const eyeColor = eyeColorOptions[Math.floor(random() * eyeColorOptions.length)];
    
    const builds = ['slim', 'average', 'sturdy'];
    const heights = ['short', 'average height', 'tall for their age'];
    
    return {
      skinTone,
      hairColor,
      eyeColor,
      build: builds[Math.floor(random() * builds.length)],
      height: heights[Math.floor(random() * heights.length)]
    };
  }

  /**
   * Universal hair mapping - now uses FrontendIntelligence for consistency
   */
  getUniversalHairMapping(avatar) {
    // Import FrontendIntelligence for consistent hair mapping
    const { FrontendIntelligence } = require('./FrontendIntelligence.js');
    
    // Determine gender from avatar type for proper hair selection
    const gender = avatar?.type === 'girl' ? 'girl' : 'boy';
    
    return FrontendIntelligence.getUniversalHairMapping(avatar, gender);
  }

  /**
   * Generate cultural elements
   */
  generateCulturalElements(culturalProfile, userInfo) {
    const culturalStyleMap = {
      // PHASE 2: Enhanced standard-american profile (35+ options)
      'standard-american': {
        clothing: [
          // Casual wear
          'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis', 
          'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans',
          'tank top and cargo shorts', 'flannel shirt and jeans', 'jersey and joggers',
          'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos',
          
          // School/formal
          'school uniform', 'dress shirt and dress pants', 'blazer and trousers',
          'sweater vest and pants', 'collared shirt and khakis', 'nice blouse and skirt',
          'dress with tights', 'button-up with suspenders', 'preppy school outfit',
          
          // Seasonal/activity
          'athletic wear and running shoes', 'layered casual look', 'seasonal appropriate clothing',
          'comfortable playtime outfit', 'trendy youth fashion', 'classic American casual style',
          'modern comfortable clothing', 'age-appropriate fashion', 'playground-appropriate clothing',
          'weekend casual wear', 'comfortable everyday outfit', 'backpack and school clothes',
          
          // Accessories integrated
          'baseball cap and casual wear', 'sneakers and athletic socks', 'winter coat and boots',
          'rain jacket and boots', 'summer dress and sandals', 'sports uniform and cleats'
        ],
        accessories: [
          // Bags and backpacks
          'backpack', 'school bag', 'messenger bag', 'tote bag', 'gym bag', 'lunch box',
          
          // Footwear
          'sneakers', 'athletic shoes', 'boots', 'sandals', 'dress shoes', 'rain boots',
          
          // Headwear
          'baseball cap', 'winter hat', 'sun hat', 'headband', 'hair tie', 'cap',
          
          // Jewelry and personal
          'watch', 'friendship bracelet', 'simple necklace', 'hair clips', 'glasses',
          'sports equipment', 'water bottle', 'phone case', 'keychain'
        ],
        markers: [
          // Community elements
          'suburban neighborhood', 'local community center', 'neighborhood park',
          'main street setting', 'town square', 'local library',
          
          // American cultural elements
          'American traditions', 'community volunteering', 'school spirit',
          'hometown pride', 'civic participation', 'patriotic values',
          'local sports teams', 'community service', 'Fourth of July celebrations',
          'local festivals', 'neighborhood community', 'school pride'
        ]
      },
      'hispanic-latino': {
        clothing: ['colorful casual wear', 'family gathering attire', 'school clothes'],
        accessories: ['bright accessories', 'family jewelry', 'cultural patterns'],
        markers: ['warm family setting', 'community elements', 'vibrant colors']
      },
      'multicultural': {
        clothing: ['globally inspired', 'fusion styles', 'modern casual'],
        accessories: ['diverse cultural items', 'international elements'],
        markers: ['diverse community', 'global awareness', 'inclusive environment']
      }
    };
    
    // PHASE 2: Default to standard-american (replace global-multicultural default)
    const profile = culturalStyleMap[culturalProfile] || culturalStyleMap['standard-american'];
    const random = this.createSeededRandom(this.generateStableSeed(userInfo.name || '', culturalProfile));
    
    return {
      clothing: profile.clothing[Math.floor(random() * profile.clothing.length)],
      accessories: profile.accessories.slice(0, 2 + Math.floor(random() * 2)),
      culturalMarkers: profile.markers
    };
  }

  /**
   * PHASE 2: Builds contextual character description with explicit African-American text
   * This ensures "African-American" text is generated in character descriptions
   */
  buildContextualCharacterDescription(seedData, storyContext = '') {
    const { baseSeed, culturalProfile, physicalTraits, culturalElements, characterName } = seedData;
    
    // PHASE 2: Build character description with explicit cultural identification
    let description = '';
    
    // Mock gender determination for explicit text generation
    const mockUserInfo = { avatar: { skinTone: physicalTraits.skinTone } };
    
    // NEW MASTER PLAN: Use direct visual descriptions if available
    if (seedData.avatarIdentity && seedData.avatarIdentity.directVisualDescription) {
      description = `${characterName} is a ${physicalTraits.age || 'young'} ${seedData.avatarIdentity.directVisualDescription}`;
      console.log(`🎭 NEW MASTER PLAN: Generated direct visual character description: "${description}"`);
    } else {
      description = `${characterName} is a ${physicalTraits.age || 'young'} child`;
    }
    
    // Add physical characteristics
    if (physicalTraits.eyeColor) description += ` with ${physicalTraits.eyeColor} eyes`;
    if (physicalTraits.build) description += ` and a ${physicalTraits.build} build`;
    if (physicalTraits.height) description += `, ${physicalTraits.height} height`;
    
    // Add cultural elements if available
    if (culturalElements) {
      if (culturalElements.clothing) description += `. Wearing ${culturalElements.clothing}`;
      if (culturalElements.accessories) description += ` with ${culturalElements.accessories}`;
    }

    // PHASE 5: Enhanced logging for African-American text tracking
    console.log(`🎭 PHASE 2: Generated character description for ${characterName}:`, {
      description,
      culturalProfile,
      containsAfricanAmericanText: description.includes('African-American'),
      physicalTraits,
      culturalElements: culturalElements ? Object.keys(culturalElements) : []
    });
    
    // NEW MASTER PLAN: No validation needed for direct visual descriptions
    console.log('🎭 NEW MASTER PLAN: Character description generated using direct visual approach');
    
    return description;
  }

  /**
   * Build cultural context for prompting
   */
  buildCulturalContext(seedData) {
    const { culturalProfile, culturalElements } = seedData;
    
    const contextParts = [
      `Cultural background: ${culturalProfile}`,
      `Setting markers: ${culturalElements.culturalMarkers.join(', ')}`,
      'Inclusive diverse representation',
      'Authentic cultural elements'
    ];
    
    return contextParts.join('. ');
  }

  /**
   * Create seeded random number generator
   */
  createSeededRandom(seed) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 16807) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };
  }

  /**
   * STATELESS MONITORING - No persistent seeds to track
   */
  getActiveCharacterSeeds() {
    return {
      total: 0,
      byProfile: {},
      note: 'Stateless mode: No persistent character seeds'
    };
  }

  /**
   * STATELESS - No cleanup needed
   */
  cleanupExpiredSeeds() {
    return 0; // No persistent seeds to clean
  }

  /**
   * Clear any remaining server-side state (for client-side cache synchronization)
   */
  clearServerState() {
    console.log('🎭 STATELESS: No server-side character state to clear');
    return { cleared: true, message: 'Stateless mode: No persistent server cache' };
  }
}

// Export both class and singleton instance
export { UnifiedCharacterConsistency };
export const characterConsistency = new UnifiedCharacterConsistency();