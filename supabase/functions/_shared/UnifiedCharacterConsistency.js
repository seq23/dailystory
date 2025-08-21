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
    const culturalProfile = avatarIdentity?.culturalProfile || this.determineCulturalProfile(userInfo);
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
   * Determine cultural profile from user info
   */
  determineCulturalProfile(userInfo) {
    if (!userInfo.avatar) return 'multicultural';
    
    const { nativeLanguage, avatar } = userInfo;
    const skinTone = avatar.skinTone || 'medium';
    
    if (nativeLanguage === 'en') {
      if (skinTone === 'dark') return 'african-american';
      if (skinTone === 'light' || skinTone === 'pale') return 'european-american';
      return 'multicultural-american';
    }
    
    if (nativeLanguage === 'es') {
      if (skinTone === 'dark') return 'afro-hispanic';
      if (skinTone === 'olive' || skinTone === 'medium') return 'hispanic-latino';
      return 'hispanic-multicultural';
    }
    
    if (nativeLanguage === 'fr') return skinTone === 'dark' ? 'african-french' : 'french-multicultural';
    if (nativeLanguage === 'zh') return 'chinese-asian';
    if (nativeLanguage === 'hi') return 'indian-south-asian';
    if (nativeLanguage === 'ar') return 'middle-eastern';
    
    return 'global-multicultural';
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
   * Universal hair mapping
   */
  getUniversalHairMapping(avatar) {
    const universalHairMap = {
      'pale': 'red',
      'light': 'blonde', 
      'medium': 'brown',
      'olive': 'black',
      'dark': 'natural textured hair'
    };
    
    return universalHairMap[avatar?.skinTone] || 'brown';
  }

  /**
   * Generate cultural elements
   */
  generateCulturalElements(culturalProfile, userInfo) {
    const culturalStyleMap = {
      'african-american': {
        clothing: ['modern streetwear', 'casual contemporary', 'athletic wear', 'school uniform'],
        accessories: ['backpack', 'sneakers', 'baseball cap', 'colorful headband'],
        markers: ['natural hairstyle', 'urban setting elements', 'diverse community']
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
    
    const profile = culturalStyleMap[culturalProfile] || culturalStyleMap['multicultural'];
    const random = this.createSeededRandom(this.generateStableSeed(userInfo.name || '', culturalProfile));
    
    return {
      clothing: profile.clothing[Math.floor(random() * profile.clothing.length)],
      accessories: profile.accessories.slice(0, 2 + Math.floor(random() * 2)),
      culturalMarkers: profile.markers
    };
  }

  /**
   * Build contextual character description
   */
  buildContextualCharacterDescription(seedData, storyContext) {
    const { characterName, physicalTraits, contextualAppearance } = seedData;
    
    const parts = [
      `${characterName}`,
      `${physicalTraits.height} child with ${physicalTraits.skinTone} skin`,
      `${physicalTraits.hairColor} hair and ${physicalTraits.eyeColor} eyes`,
      `${physicalTraits.build} build`,
      `wearing ${contextualAppearance.currentClothing}`,
    ];
    
    return parts.join(', ');
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