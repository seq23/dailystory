/**
 * Unified Character Consistency Service
 * Ensures character appearance consistency across all story sessions and generation attempts
 */

interface CharacterSeed {
  userId: string;
  sessionId: string;
  characterName: string;
  baseSeed: number;
  culturalProfile: string;
  physicalTraits: {
    skinTone: string;
    hairColor: string;
    eyeColor: string;
    build: string;
    height: string;
  };
  culturalElements: {
    clothing: string;
    accessories: string[];
    culturalMarkers: string[];
  };
  createdAt: number;
  lastUsed: number;
}

export class UnifiedCharacterConsistency {
  private characterSeeds = new Map<string, CharacterSeed>();
  private secondaryCharacterSeeds = new Map<string, CharacterSeed>();
  private readonly SEED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Generate or retrieve consistent character seed for user
   */
  getCharacterSeed(
    userId: string, 
    sessionId: string, 
    userInfo: any
  ): { seed: number; characterDescription: string; culturalContext: string } {
    const characterKey = `${userId}-${userInfo.name || 'default'}`;
    let seedData = this.characterSeeds.get(characterKey);

    // Create new seed if none exists or expired
    if (!seedData || this.isSeedExpired(seedData)) {
      seedData = this.createNewCharacterSeed(userId, sessionId, userInfo);
      this.characterSeeds.set(characterKey, seedData);
      console.log(`🎭 Created new character seed for ${userInfo.name}: ${seedData.baseSeed}`);
    } else {
      // Update usage tracking
      seedData.lastUsed = Date.now();
      console.log(`🎭 Using existing character seed for ${userInfo.name}: ${seedData.baseSeed}`);
    }

    // Generate session-specific variant while maintaining core consistency
    const sessionSeed = this.generateSessionVariant(seedData, sessionId);
    const characterDescription = this.buildCharacterDescription(seedData);
    const culturalContext = this.buildCulturalContext(seedData);

    return {
      seed: sessionSeed,
      characterDescription,
      culturalContext
    };
  }

  /**
   * Create new character seed with complete profile
   */
  private createNewCharacterSeed(userId: string, sessionId: string, userInfo: any): CharacterSeed {
    const baseSeed = this.generateStableSeed(userId, userInfo.name || 'child');
    
    // Determine cultural profile
    const culturalProfile = this.determineCulturalProfile(userInfo);
    
    // Generate consistent physical traits
    const physicalTraits = this.generatePhysicalTraits(userInfo, baseSeed);
    
    // Generate cultural elements
    const culturalElements = this.generateCulturalElements(culturalProfile, userInfo);

    return {
      userId,
      sessionId,
      characterName: userInfo.name || 'child',
      baseSeed,
      culturalProfile,
      physicalTraits,
      culturalElements,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }

  /**
   * Generate stable seed based on user characteristics
   */
  private generateStableSeed(userId: string, characterName: string): number {
    // Use hash of user ID + character name for consistency
    let hash = 0;
    const input = `${userId}-${characterName}`;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure positive number
    return Math.abs(hash);
  }

  /**
   * Generate session-specific variant of base seed
   */
  private generateSessionVariant(seedData: CharacterSeed, sessionId: string): number {
    // Create small variations for different scenes while maintaining character consistency
    let sessionHash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      sessionHash = ((sessionHash << 3) - sessionHash) + sessionId.charCodeAt(i);
    }
    
    // Add small variance (±100) to base seed for scene variety
    const variance = (sessionHash % 200) - 100;
    return seedData.baseSeed + variance;
  }

  /**
   * Determine cultural profile from user info
   */
  private determineCulturalProfile(userInfo: any): string {
    if (!userInfo.avatar) return 'multicultural';
    
    const { nativeLanguage, avatar } = userInfo;
    const skinTone = avatar.skinTone || 'medium';
    
    // Enhanced cultural mapping with 8+ profiles
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
    
    if (nativeLanguage === 'fr') {
      if (skinTone === 'dark') return 'african-french';
      return 'french-multicultural';
    }
    
    if (nativeLanguage === 'zh') return 'chinese-asian';
    if (nativeLanguage === 'hi') return 'indian-south-asian';
    if (nativeLanguage === 'ar') return 'middle-eastern';
    
    return 'global-multicultural';
  }

  /**
   * Generate consistent physical traits
   */
  private generatePhysicalTraits(userInfo: any, seed: number): CharacterSeed['physicalTraits'] {
    const avatar = userInfo.avatar || {};
    const random = this.createSeededRandom(seed);
    
    // Map avatar skin tone to detailed description
    const skinToneMap = {
      'pale': 'fair',
      'light': 'light',
      'medium': 'medium',
      'olive': 'olive',
      'dark': 'dark'
    };
    
    // FIXED: Use universal hair mapping from SimpleImageService
    const skinTone = skinToneMap[avatar.skinTone] || 'medium';
    
    // Import SimpleImageService for universal hair mapping
    const { SimpleImageService } = require('./SimpleImageService');
    const hairColor = SimpleImageService.getHairColorFromAvatar(avatar);
    
    // Eye color options based on realism
    const eyeColorOptions = skinTone === 'dark' ? ['brown', 'dark brown'] : 
                           skinTone === 'pale' ? ['blue', 'green', 'brown', 'hazel'] :
                           ['brown', 'hazel', 'green'];
    const eyeColor = eyeColorOptions[Math.floor(random() * eyeColorOptions.length)];
    
    // Build and height for children
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
   * Generate cultural elements
   */
  private generateCulturalElements(culturalProfile: string, userInfo: any): CharacterSeed['culturalElements'] {
    // Expanded cultural clothing and accessories by profile
    const culturalStyleMap: Record<string, any> = {
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
      'african-french': {
        clothing: ['European casual style', 'African-inspired patterns', 'modern fusion'],
        accessories: ['cultural textiles', 'modern accessories', 'stylish items'],
        markers: ['multicultural environment', 'French aesthetic', 'cultural fusion']
      },
      'chinese-asian': {
        clothing: ['modern casual', 'traditional elements', 'school attire'],
        accessories: ['educational items', 'cultural symbols', 'modern tech'],
        markers: ['academic setting', 'cultural pride', 'family values']
      },
      'european-american': {
        clothing: ['classic casual', 'all-American style', 'seasonal appropriate'],
        accessories: ['sports equipment', 'books', 'outdoor gear'],
        markers: ['suburban setting', 'outdoor activities', 'traditional values']
      },
      'multicultural': {
        clothing: ['globally inspired', 'fusion styles', 'modern casual'],
        accessories: ['diverse cultural items', 'international elements'],
        markers: ['diverse community', 'global awareness', 'inclusive environment']
      }
    };
    
    const profile = culturalStyleMap[culturalProfile] || culturalStyleMap['multicultural'];
    const random = this.createSeededRandom(this.generateStableSeed(userInfo.userId || '', culturalProfile));
    
    return {
      clothing: profile.clothing[Math.floor(random() * profile.clothing.length)],
      accessories: profile.accessories.slice(0, 2 + Math.floor(random() * 2)), // 2-3 accessories
      culturalMarkers: profile.markers
    };
  }

  /**
   * Build complete character description
   */
  private buildCharacterDescription(seedData: CharacterSeed): string {
    const { characterName, physicalTraits, culturalElements } = seedData;
    
    const parts = [
      `${characterName}`,
      `${physicalTraits.height} child with ${physicalTraits.skinTone} skin`,
      `${physicalTraits.hairColor} hair and ${physicalTraits.eyeColor} eyes`,
      `${physicalTraits.build} build`,
      `wearing ${culturalElements.clothing}`,
    ];
    
    if (culturalElements.accessories.length > 0) {
      parts.push(`with ${culturalElements.accessories.slice(0, 2).join(' and ')}`);
    }
    
    return parts.join(', ');
  }

  /**
   * Build cultural context for prompting
   */
  private buildCulturalContext(seedData: CharacterSeed): string {
    const { culturalProfile, culturalElements } = seedData;
    
    const contextParts = [
      `Cultural background: ${culturalProfile}`,
      `Setting markers: ${culturalElements.culturalMarkers.join(', ')}`,
      'Inclusive diverse representation',
      'Authentic cultural elements',
      'Positive role modeling'
    ];
    
    return contextParts.join('. ');
  }

  /**
   * Create seeded random number generator for consistency
   */
  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 16807) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };
  }

  /**
   * Check if character seed has expired
   */
  private isSeedExpired(seedData: CharacterSeed): boolean {
    return Date.now() - seedData.createdAt > this.SEED_EXPIRY;
  }

  /**
   * Get all active character seeds for monitoring
   */
  getActiveCharacterSeeds(): { total: number; byProfile: Record<string, number> } {
    const active = Array.from(this.characterSeeds.values())
      .filter(seed => !this.isSeedExpired(seed));
    
    const byProfile: Record<string, number> = {};
    active.forEach(seed => {
      byProfile[seed.culturalProfile] = (byProfile[seed.culturalProfile] || 0) + 1;
    });
    
    return {
      total: active.length,
      byProfile
    };
  }

  /**
   * Generate or retrieve consistent secondary character seed
   */
  getSecondaryCharacterSeed(
    userId: string,
    sessionId: string,
    characterName: string,
    characterType: 'friend' | 'sibling' | 'pet' | 'classmate' | 'companion',
    userInfo: any
  ): { seed: number; characterDescription: string; culturalContext: string } {
    const secondaryKey = `${userId}-${sessionId}-${characterName}-${characterType}`;
    let seedData = this.secondaryCharacterSeeds.get(secondaryKey);

    if (!seedData || this.isSeedExpired(seedData)) {
      seedData = this.createSecondaryCharacterSeed(userId, sessionId, characterName, characterType, userInfo);
      this.secondaryCharacterSeeds.set(secondaryKey, seedData);
      console.log(`👥 Created secondary character seed for ${characterName} (${characterType}): ${seedData.baseSeed}`);
    } else {
      seedData.lastUsed = Date.now();
      console.log(`👥 Using existing secondary character seed for ${characterName}: ${seedData.baseSeed}`);
    }

    const sessionSeed = this.generateSessionVariant(seedData, sessionId);
    const characterDescription = this.buildSecondaryCharacterDescription(seedData, characterType);
    const culturalContext = this.buildCulturalContext(seedData);

    return {
      seed: sessionSeed,
      characterDescription,
      culturalContext
    };
  }

  /**
   * Create secondary character seed with profile
   */
  private createSecondaryCharacterSeed(
    userId: string,
    sessionId: string,
    characterName: string,
    characterType: string,
    userInfo: any
  ): CharacterSeed {
    const baseSeed = this.generateStableSeed(`${userId}-secondary`, characterName);
    const culturalProfile = this.determineCulturalProfile(userInfo);
    
    // Generate varied physical traits for secondary characters
    const physicalTraits = this.generateSecondaryPhysicalTraits(userInfo, baseSeed, characterType);
    const culturalElements = this.generateCulturalElements(culturalProfile, userInfo);

    return {
      userId,
      sessionId,
      characterName,
      baseSeed,
      culturalProfile,
      physicalTraits,
      culturalElements,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }

  /**
   * Generate varied physical traits for secondary characters
   */
  private generateSecondaryPhysicalTraits(userInfo: any, seed: number, characterType: string): CharacterSeed['physicalTraits'] {
    const avatar = userInfo.avatar || {};
    const random = this.createSeededRandom(seed);
    
    // Vary skin tones for diversity (but keep realistic)
    const skinToneOptions = ['fair', 'light', 'medium', 'olive', 'dark'];
    const skinTone = skinToneOptions[Math.floor(random() * skinToneOptions.length)];
    
    // Varied hair colors for secondary characters
    const hairColorOptions = ['brown', 'black', 'blonde', 'auburn', 'dark brown', 'light brown'];
    const hairColor = hairColorOptions[Math.floor(random() * hairColorOptions.length)];
    
    // Eye color variety
    const eyeColorOptions = ['brown', 'blue', 'green', 'hazel', 'dark brown'];
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
   * Build secondary character description
   */
  private buildSecondaryCharacterDescription(seedData: CharacterSeed, characterType: string): string {
    const { characterName, physicalTraits, culturalElements } = seedData;
    
    const typeDescriptor = characterType === 'friend' ? 'friend' : 
                          characterType === 'sibling' ? 'sibling' : 
                          characterType === 'classmate' ? 'classmate' : 'companion';
    
    const parts = [
      `${characterName} (${typeDescriptor})`,
      `${physicalTraits.height} child with ${physicalTraits.skinTone} skin`,
      `${physicalTraits.hairColor} hair and ${physicalTraits.eyeColor} eyes`,
      `${physicalTraits.build} build`,
      `wearing ${culturalElements.clothing}`,
    ];
    
    if (culturalElements.accessories.length > 0) {
      parts.push(`with ${culturalElements.accessories.slice(0, 2).join(' and ')}`);
    }
    
    return parts.join(', ');
  }

  /**
   * Clean up expired character seeds
   */
  cleanupExpiredSeeds(): number {
    let cleaned = 0;
    
    // Clean main character seeds
    for (const [key, seed] of this.characterSeeds.entries()) {
      if (this.isSeedExpired(seed)) {
        this.characterSeeds.delete(key);
        cleaned++;
      }
    }
    
    // Clean secondary character seeds
    for (const [key, seed] of this.secondaryCharacterSeeds.entries()) {
      if (this.isSeedExpired(seed)) {
        this.secondaryCharacterSeeds.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired character seeds`);
    }
    
    return cleaned;
  }
}

// Global instance for consistency across all services
export const characterConsistency = new UnifiedCharacterConsistency();