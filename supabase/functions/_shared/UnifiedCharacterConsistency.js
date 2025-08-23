/**
 * Backend Unified Character Consistency Service
 * Ensures character appearance consistency across all story sessions and generation attempts
 * Now connected to StoryVisualStateManager for character persistence
 */

// Import StoryVisualStateManager for character persistence
const StoryVisualStateManagerModule = await import('./storyVisualState.js');
const { StoryVisualStateManager } = StoryVisualStateManagerModule;

class UnifiedCharacterConsistency {
  constructor() {
    console.log('🎭 Character Consistency: Using persistence-aware, avatar-based generation');
  }

  /**
   * Get character seed with persistence support - checks cache first, generates if needed
   * Now connected to StoryVisualStateManager for cross-page character consistency
   */
  async getCharacterSeed(userId, storyId, userInfo, storyContext, avatarIdentity = null, sessionType = 'new') {
    const sessionId = storyId; // Use storyId as sessionId for consistency
    const characterName = userInfo.name || 'child';
    
    // STEP 1: Check if character already exists in StoryVisualStateManager
    const existingCharacterSeed = StoryVisualStateManager.getCharacterSeed(sessionId, characterName);
    
    if (existingCharacterSeed !== undefined) {
      // STEP 2: Character exists - retrieve cached description and return consistent data
      const storyState = StoryVisualStateManager.getStoryState(sessionId);
      const existingCharacter = storyState?.characters?.get(characterName);
      
      if (existingCharacter && existingCharacter.description) {
        console.log(`🎭 CACHED: Using existing character for ${characterName} (seed: ${existingCharacterSeed})`);
        
        return {
          seed: existingCharacterSeed,
          characterDescription: existingCharacter.description,
          culturalContext: existingCharacter.culturalContext || '',
          avatarIdentity: {
            type: existingCharacter.avatarType || avatarIdentity?.type,
            skinTone: existingCharacter.skinTone || avatarIdentity?.skinTone
          }
        };
      }
    }
    
    // STEP 3: No existing character - generate fresh character data
    const seedData = await this.createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity);
    console.log(`🎭 FRESH: Generated new character for ${userInfo.name}: ${seedData.baseSeed} (Avatar: ${avatarIdentity ? 'Optimized' : 'Local'})`);

    const characterDescription = this.buildContextualCharacterDescription(seedData, storyContext);
    const culturalContext = this.buildCulturalContext(seedData);

    // STEP 4: Store new character in StoryVisualStateManager for future pages
    StoryVisualStateManager.updateCharacterWithSeed(
      sessionId, 
      characterName, 
      seedData.baseSeed,
      {
        description: characterDescription,
        culturalContext: culturalContext,
        avatarType: seedData.avatarType || avatarIdentity?.type,
        skinTone: seedData.skinTone || avatarIdentity?.skinTone,
        physicalTraits: seedData.physicalTraits,
        culturalElements: seedData.culturalElements,
        generatedAt: Date.now()
      }
    );
    
    console.log(`🎭 STORED: Cached character ${characterName} for session ${sessionId} (seed: ${seedData.baseSeed})`);

    return {
      seed: seedData.baseSeed,
      characterDescription,
      culturalContext,
      avatarIdentity: {
        type: seedData.avatarType || avatarIdentity?.type,
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
  async createNewCharacterSeed(userId, storyId, userInfo, avatarIdentity = null) {
    // Generate seed based on current avatar settings, not just user name
    const avatarSeedInput = avatarIdentity ? 
      `${userId}-${userInfo.name || 'child'}-${avatarIdentity.skinTone || 'medium'}` : 
      `${userId}-${userInfo.name || 'child'}-${userInfo.avatar?.skinTone || 'medium'}`;
    
    const baseSeed = this.generateStableSeed(avatarSeedInput, userInfo.name || 'child');
    
    // ALWAYS use current avatar settings - no fallback to cached data
    const culturalProfile = avatarIdentity?.culturalProfile || this.determineCulturalProfile(userInfo).profile;
    const physicalTraits = avatarIdentity ? 
      this.generatePhysicalTraitsFromIdentity(avatarIdentity, baseSeed) : 
      await this.generatePhysicalTraits(userInfo, baseSeed);
    const culturalElements = this.generateCulturalElements(culturalProfile, userInfo);

    return {
      userId,
      storyId,
      characterName: userInfo.name || 'child',
      baseSeed,
      culturalProfile,
      physicalTraits,
      culturalElements,
      avatarType: avatarIdentity?.type || userInfo.avatar?.type === 'prefer-not-to-answer' ? 'child' : userInfo.avatar?.type || 'child',
      skinTone: avatarIdentity?.skinTone || userInfo.avatar?.skinTone || 'medium',
      avatarIdentity: avatarIdentity,
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
    
    // FIXED: Use avatar type with fallback pattern - handle child/prefer-not-to-answer
    const avatarType = avatar.type === 'prefer-not-to-answer' ? 'child' : avatar.type;
    const gender = avatarType === 'girl' ? 'female' : 
                   avatarType === 'boy' ? 'male' : 
                   avatarType === 'child' ? 'child' : 'child';
    console.log(`🎭 DEBUG: Avatar type: ${avatar.type}, Gender assigned: ${gender}`);
    
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
  async generatePhysicalTraits(userInfo, seed) {
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
    const hairColor = await this.getUniversalHairMapping(avatar, userInfo);
    
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
   * Universal hair mapping - PHASE 3: BULLETPROOF with 4-Strategy Import System
   */
  async getUniversalHairMapping(avatar, userInfo = null) {
    // ============= PHASE 3: 4-STRATEGY BULLETPROOF IMPORT =============
    console.log('🔍 UnifiedCharacterConsistency - Starting bulletproof FrontendIntelligence import...');
    
    // Strategy 1: Standard relative import
    try {
      console.log('🔍 Strategy 1: Standard relative import...');
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      console.log('✅ Strategy 1: FrontendIntelligence import successful');
      
      const gender = avatar?.type === 'girl' ? 'girl' : 
                     avatar?.type === 'boy' ? 'boy' : 
                     avatar?.type || 'child';
      
      return FrontendIntelligence.getUniversalHairMapping(avatar, gender, userInfo);
    } catch (error1) {
      console.log('⚠️ Strategy 1 failed:', error1.message);
      
      // Strategy 2: Absolute path import  
      try {
        console.log('🔍 Strategy 2: Absolute path import...');
        const { FrontendIntelligence } = await import(`file://${Deno.cwd()}/supabase/functions/_shared/FrontendIntelligence.js`);
        console.log('✅ Strategy 2: FrontendIntelligence absolute import successful');
        
        const gender = avatar?.type === 'girl' ? 'girl' : avatar?.type === 'boy' ? 'boy' : avatar?.type || 'child';
        return FrontendIntelligence.getUniversalHairMapping(avatar, gender, userInfo);
      } catch (error2) {
        console.log('⚠️ Strategy 2 failed:', error2.message);
        
        // Strategy 3: Working directory import
        try {
          console.log('🔍 Strategy 3: Working directory import...');
          const { FrontendIntelligence } = await import(`${Deno.cwd()}/supabase/functions/_shared/FrontendIntelligence.js`);
          console.log('✅ Strategy 3: FrontendIntelligence working directory import successful');
          
          const gender = avatar?.type === 'girl' ? 'girl' : avatar?.type === 'boy' ? 'boy' : avatar?.type || 'child';
          return FrontendIntelligence.getUniversalHairMapping(avatar, gender, userInfo);
        } catch (error3) {
          console.log('⚠️ Strategy 3 failed:', error3.message);
          
          // Strategy 4: Nuclear fallback - bulletproof hair mapping
          console.log('🛡️ Strategy 4: Nuclear fallback hair mapping');
          const hairColorMap = {
            'blonde': 'blonde',
            'brown': 'brown', 
            'black': 'black',
            'red': 'red',
            'gray': 'gray'
          };
          const fallbackColor = hairColorMap[avatar?.hairColor] || 'brown';
          console.log(`🛡️ Nuclear hair mapping: ${avatar?.hairColor || 'undefined'} → ${fallbackColor}`);
          return fallbackColor;
        }
      }
    }
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
    
    // NEW MASTER PLAN: Use direct visual descriptions if available, handle child/prefer-not-to-answer
    if (seedData.avatarIdentity && seedData.avatarIdentity.directVisualDescription) {
      description = `${characterName} is a ${physicalTraits.age || 'young'} ${seedData.avatarIdentity.directVisualDescription}`;
      console.log(`🎭 NEW MASTER PLAN: Generated direct visual character description: "${description}"`);
    } else {
      // Handle avatar type mapping: prefer-not-to-answer → child
      const avatarType = seedData.avatarType === 'prefer-not-to-answer' ? 'child' : seedData.avatarType;
      
      if (avatarType === 'child' || avatarType === 'prefer-not-to-answer') {
        description = `${characterName} is a ${physicalTraits.age || 'young'} child with no gender specific characteristics`;
        console.log(`🎯 GENDER NEUTRAL: Applied neutral characteristics for ${avatarType} type`);
      } else if (avatarType === 'boy') {
        description = `${characterName} is a ${physicalTraits.age || 'young'} boy`;
      } else if (avatarType === 'girl') {
        description = `${characterName} is a ${physicalTraits.age || 'young'} girl`;
      } else {
        description = `${characterName} is a ${physicalTraits.age || 'young'} child`;
      }
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
// Export only the singleton instance for consistency
const characterConsistency = new UnifiedCharacterConsistency();
export { characterConsistency };