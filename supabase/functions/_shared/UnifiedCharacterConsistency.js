/**
 * Backend Unified Character Consistency Service
 * Ensures character appearance consistency across all story sessions and generation attempts
 */

class UnifiedCharacterConsistency {
  constructor() {
    this.characterSeeds = new Map();
    this.secondaryCharacterSeeds = new Map();
    this.SEED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Generate or retrieve consistent character seed for user with context awareness
   * Now accepts pre-processed avatarIdentity from orchestrator for optimization
   */
  getCharacterSeed(userId, storyId, userInfo, storyContext, avatarIdentity = null, sessionType = 'new') {
    const characterKey = `${userId}-${storyId}-${userInfo.name || 'default'}`;
    let seedData = this.characterSeeds.get(characterKey);

    // Handle different session types for character consistency
    if (sessionType === 'rewrite' && seedData) {
      // For premium rewrites: preserve avatar identity but allow fresh character appearance
      if (userInfo.isPremium) {
        seedData = this.preserveAvatarIdentityForRewrite(seedData, userInfo, avatarIdentity);
        console.log(`🎭 Premium rewrite: Preserved avatar identity for ${userInfo.name} (Avatar Identity: ${avatarIdentity ? 'Optimized' : 'Local'})`);
      } else {
        // For free rewrites: generate completely new character
        seedData = this.createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity);
        console.log(`🎭 Free rewrite: Created fresh character for ${userInfo.name} (Avatar Identity: ${avatarIdentity ? 'Optimized' : 'Local'})`);
      }
    } else if (!seedData || this.isSeedExpired(seedData)) {
      seedData = this.createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity);
      console.log(`🎭 Backend: Created new character seed for ${userInfo.name}: ${seedData.baseSeed} (Avatar Identity: ${avatarIdentity ? 'Optimized' : 'Local'})`);
    } else {
      seedData.lastUsed = Date.now();
      console.log(`🎭 Backend: Using existing character seed for ${userInfo.name}: ${seedData.baseSeed}`);
    }

    this.characterSeeds.set(characterKey, seedData);

    const characterDescription = this.buildContextualCharacterDescription(seedData, storyContext);
    const culturalContext = this.buildCulturalContext(seedData);

    return {
      seed: seedData.baseSeed,
      characterDescription,
      culturalContext,
      avatarIdentity: {
        type: seedData.avatarType,
        skinTone: seedData.skinTone
      }
    };
  }

  /**
   * Preserve avatar identity for premium rewrites while allowing fresh character details
   */
  preserveAvatarIdentityForRewrite(existingSeed, userInfo, avatarIdentity = null) {
    // Keep core avatar identity but generate fresh contextual appearance
    const newSeed = this.createNewCharacterSeed(existingSeed.userId, existingSeed.storyId, userInfo, avatarIdentity);
    
    // Preserve avatar type and skin tone from existing seed
    newSeed.avatarType = existingSeed.avatarType;
    newSeed.skinTone = existingSeed.skinTone;
    newSeed.physicalTraits.skinTone = existingSeed.physicalTraits.skinTone;
    
    // Keep cultural profile consistent with avatar
    newSeed.culturalProfile = existingSeed.culturalProfile;
    
    // Update timestamp and usage
    newSeed.createdAt = Date.now();
    newSeed.lastUsed = Date.now();
    newSeed.rewriteCount = (existingSeed.rewriteCount || 0) + 1;
    
    console.log(`🎭 Preserved avatar identity: ${newSeed.avatarType}/${newSeed.skinTone} for rewrite #${newSeed.rewriteCount}`);
    
    return newSeed;
  }

  /**
   * Create new character seed with complete profile
   * Now accepts pre-processed avatarIdentity for optimization
   */
  createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity = null) {
    const baseSeed = this.generateStableSeed(userId, userInfo.name || 'child');
    
    // Use pre-processed avatar identity if provided, otherwise fallback to local processing
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
   * Check if character seed has expired
   */
  isSeedExpired(seedData) {
    return Date.now() - seedData.createdAt > this.SEED_EXPIRY;
  }

  /**
   * Get active character seeds for monitoring
   */
  getActiveCharacterSeeds() {
    const active = Array.from(this.characterSeeds.values())
      .filter(seed => !this.isSeedExpired(seed));
    
    const byProfile = {};
    active.forEach(seed => {
      byProfile[seed.culturalProfile] = (byProfile[seed.culturalProfile] || 0) + 1;
    });
    
    return {
      total: active.length,
      byProfile
    };
  }

  /**
   * Cleanup expired seeds
   */
  cleanupExpiredSeeds() {
    let cleaned = 0;
    for (const [key, seed] of this.characterSeeds.entries()) {
      if (this.isSeedExpired(seed)) {
        this.characterSeeds.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
}

// Export singleton instance
export const characterConsistency = new UnifiedCharacterConsistency();