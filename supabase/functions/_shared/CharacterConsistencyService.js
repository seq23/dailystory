/**
 * Character Consistency Service - Enhanced with Cultural Intelligence
 * Handles all character generation, consistency, cultural enhancements, and persistence
 * Includes all cultural arrays and detection logic from FrontendIntelligence
 */

export class CharacterConsistencyService {
  constructor() {
    console.log('🎭 CharacterConsistencyService initialized with database-backed consistency');
  }

  /**
   * Save character data to database
   */
  async saveCharacterToDatabase(sessionId, characterKey, characterData) {
    console.log(`💾 Attempting to save character ${characterKey} to database for session ${sessionId}...`);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { error } = await supabase
      .from('character_consistency_cache')
      .upsert({
        session_id: sessionId,
        character_key: characterKey,
        character_data: characterData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Database save error:', error);
      throw new Error(`CharacterConsistencyService.saveCharacterToDatabase failed: ${error.message}`);
    }
    
    console.log(`💾 Saved character ${characterKey} to database for session ${sessionId}`);
    return true;
  }

  /**
   * Get character data from database
   */
  async getCharacterFromDatabase(sessionId, characterKey) {
    console.log(`📖 Attempting to retrieve character ${characterKey} from database for session ${sessionId}...`);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data, error } = await supabase
      .from('character_consistency_cache')
      .select('character_data')
      .eq('session_id', sessionId)
      .eq('character_key', characterKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is expected sometimes
      console.error('❌ Database fetch error:', error);
      throw new Error(`CharacterConsistencyService.getCharacterFromDatabase failed: ${error.message}`);
    }
    
    if (data?.character_data) {
      console.log(`📖 Retrieved character ${characterKey} from database for session ${sessionId}`);
      return data.character_data;
    }
    
    return null;
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
  
  static EXPANDED_AFRICAN_AMERICAN_SKIN_TONES = [
    'light brown complexion',
    'medium brown skin',
    'rich brown complexion',
    'deep brown skin',
    'warm caramel complexion',
    'golden brown skin',
    'mahogany complexion',
    'dark chocolate skin',
    'ebony complexion',
    'honey-toned skin',
    'bronze complexion',
    'chestnut brown skin',
    'amber-toned complexion',
    'cocoa brown skin',
    'espresso complexion',
    'mocha-colored skin',
    'sienna brown complexion',
    'russet brown skin',
    'copper-toned complexion',
    'warm brown skin with golden undertones'
  ];

  static EXPANDED_AFRICAN_AMERICAN_EYE_COLORS = [
    'dark brown eyes',
    'deep chocolate brown eyes',
    'warm brown eyes',
    'amber brown eyes',
    'rich mahogany eyes',
    'hazel brown eyes',
    'golden brown eyes',
    'coffee brown eyes',
    'chestnut brown eyes',
    'honey brown eyes',
    'dark amber eyes',
    'bronze brown eyes',
    'caramel brown eyes',
    'espresso brown eyes',
    'warm hazel eyes',
    'warm hazel-green eyes'
  ];

  static EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
    // Eyes
    'expressive almond-shaped eyes',
    'bright wide-set eyes',
    'sparkling round eyes',
    'gentle oval-shaped eyes',
    'striking large eyes',
    'warm smiling eyes',
    'intelligent alert eyes',
    'kind gentle eyes',
    'curious bright eyes',
    'confident strong eyes',
    
    // Lips
    'full natural lips',
    'warm smiling lips',
    'gentle curved lips',
    'expressive full lips',
    'kind smiling mouth',
    'naturally full lips',
    'soft rounded lips',
    'bright cheerful smile',
    'warm genuine smile',
    'friendly welcoming smile',
    
    // Nose
    'strong defined nose',
    'graceful nose shape',
    'noble nose profile',
    'distinctive nose',
    'well-proportioned nose',
    'beautiful nose shape',
    'elegant nose line',
    'natural nose contour',
    'refined nose features',
    'classic nose profile',
    
    // Combined facial harmony
    'harmonious facial features, authentic African American features, soft golden hour lighting',
    'beautiful natural features, authentic African American features, soft golden hour lighting',
    'expressive facial structure, authentic African American features, soft golden hour lighting',
    'warm facial expression, authentic African American features, soft golden hour lighting',
    'confident facial features, authentic African American features, soft golden hour lighting',
    'gentle facial characteristics, authentic African American features, soft golden hour lighting',
    'striking natural beauty, authentic African American features, soft golden hour lighting',
    'dignified facial features, authentic African American features, soft golden hour lighting',
    'radiant facial expression, authentic African American features, soft golden hour lighting'
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
   * Deterministic African American cultural variations (English + dark skin)
   */
  shouldApplyAfricanAmericanCulturalVariations(avatarIdentity, userInfo) {
    if (!userInfo) return false;
    
    // Check for English language + dark skin combination
    const isEnglish = userInfo.nativeLanguage === 'en' || !userInfo.nativeLanguage;
    const hasDarkSkin = (avatarIdentity?.skinTone === 'dark') || (userInfo?.avatar?.skinTone === 'dark');
    
    return isEnglish && hasDarkSkin;
  }

  /**
   * Deterministic African cultural variations (non-English + dark skin)
   */
  shouldApplyAfricanCulturalVariations(avatarIdentity, userInfo) {
    if (!userInfo) return false;
    
    // Check for non-English language + dark skin combination
    const isNonEnglish = userInfo.nativeLanguage && userInfo.nativeLanguage !== 'en';
    const hasDarkSkin = (avatarIdentity?.skinTone === 'dark') || (userInfo?.avatar?.skinTone === 'dark');
    
    return isNonEnglish && hasDarkSkin;
  }

  /**
   * Get or create character seed with full consistency support (DATABASE-BACKED)
   */
  async getCharacterSeed(sessionId, userId, userInfo, storyContext, avatarIdentity = null, sessionType = 'new', pageTextClothing = null) {
    const characterName = userInfo.name || 'child';
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Check database first
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      console.log(`🎭 DATABASE CACHED: Using existing character for ${characterName} (seed: ${cached.seed})`);
      
      // If page text clothing is provided, update the description
      if (pageTextClothing) {
        cached.characterDescription = this.buildCharacterDescription(
          { ...cached, culturalElements: cached.culturalElements }, 
          storyContext, 
          pageTextClothing
        );
      }
      
      return cached;
    }
    
    // Generate new character
    const seedData = await this.createNewCharacterSeed(userId, userInfo, avatarIdentity);
    
    // FIXED: Include age and ageCategory from avatarIdentity in seedData for buildCharacterDescription
    const enhancedSeedData = {
      ...seedData,
      age: avatarIdentity?.age,
      ageCategory: avatarIdentity?.ageCategory
    };
    
    const characterDescription = this.buildCharacterDescription(enhancedSeedData, storyContext, pageTextClothing);
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
    
    // Save to database for consistency across edge function instances
    await this.saveCharacterToDatabase(sessionId, cacheKey, characterData);
    
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
    
    // Determine cultural profile - use avatarIdentity cultural profile if available (set by mapAvatarIdentity)
    const culturalProfile = avatarIdentity?.culturalProfile || this.determineCulturalProfile(userInfo);
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
   * Generate physical traits from avatar identity - ONLY for African Americans, others get minimal traits
   */
  generatePhysicalTraitsFromIdentity(avatarIdentity, seed) {
    const skinTone = avatarIdentity.skinTone || 'medium';
    const culturalProfile = avatarIdentity?.culturalProfile;
    
    // Only generate detailed physical traits for African American characters
    if (culturalProfile === 'african-american') {
      const hairColor = this.getHairColorFromAvatar(avatarIdentity);
      
      return {
        skinTone,
        hairColor,
        isAfricanAmerican: true
      };
    }
    
    // Minimal traits for non-African American characters - let Runware decide the rest
    return {
      skinTone,
      avatarType: avatarIdentity?.type || 'child',
      isAfricanAmerican: false
    };
  }

  /**
   * Fallback physical traits generation - ONLY for African Americans, others get minimal traits
   */
  generatePhysicalTraits(userInfo, seed) {
    const avatar = userInfo.avatar || {};
    const skinToneMap = {
      'pale': 'fair',
      'light': 'light', 
      'medium': 'medium',
      'olive': 'olive',
      'dark': 'dark'
    };
    
    const skinTone = skinToneMap[avatar.skinTone] || 'medium';
    const isAfricanAmerican = this.shouldApplyAfricanAmericanCulturalVariations(null, { nativeLanguage: userInfo.nativeLanguage || 'en', avatar: { skinTone: avatar.skinTone } });
    
    // Only generate detailed physical traits for African American characters
    if (isAfricanAmerican) {
      const hairColor = this.getHairColorFromAvatar(avatar);
      
      return {
        skinTone,
        hairColor,
        isAfricanAmerican: true
      };
    }
    
    // Minimal traits for non-African American characters - let Runware decide the rest
    return {
      skinTone,
      avatarType: avatar?.type || 'child',
      isAfricanAmerican: false
    };
  }

  /**
   * Simple hair color mapping - FIXED to use avatarIdentity.inferredHairColor
   */
  getHairColorFromAvatar(avatarIdentity) {
    // Use inferredHairColor from mapAvatarIdentity() if available
    if (avatarIdentity?.inferredHairColor) {
      return avatarIdentity.inferredHairColor;
    }
    
    // Legacy fallback for direct hairColor field
    const hairColorMap = {
      'blonde': 'blonde',
      'brown': 'brown',
      'black': 'black', 
      'red': 'red',
      'gray': 'gray'
    };
    return hairColorMap[avatarIdentity?.hairColor] || 'brown';
  }

  /**
   * Determine cultural profile with priority order: African -> African American -> Language-based
   */
  determineCulturalProfile(userInfo) {
    const nativeLanguage = userInfo.nativeLanguage || 'en';
    
    // Priority 1: African cultural variations (non-English + dark skin)
    if (this.shouldApplyAfricanCulturalVariations(null, userInfo)) {
      return 'african';
    }
    
    // Priority 2: African American cultural variations (English + dark skin)
    if (this.shouldApplyAfricanAmericanCulturalVariations(null, userInfo)) {
      return 'african-american';
    }
    
    // Priority 3: Language-based cultural variations (all skin tones for non-English)
    if (nativeLanguage === 'es') return 'hispanic-american';
    if (nativeLanguage === 'fr') return 'french-american';
    if (nativeLanguage === 'de') return 'german-american';
    if (nativeLanguage === 'it') return 'italian-american';
    if (nativeLanguage === 'pt') return 'portuguese-american';
    if (nativeLanguage === 'ar') return 'arabic-american';
    if (nativeLanguage === 'zh') return 'chinese-american';
    if (nativeLanguage === 'hi') return 'indian-american';
    
    // Priority 4: Standard American (English + non-dark skin)
    return 'standard-american';
  }

  /**
   * Generate cultural elements with full African American support - CONSISTENT SEEDING
   */
  generateCulturalElements(culturalProfile, userInfo) {
    // Use consistent seeding based on user info instead of Date.now()
    const seedInput = `${userInfo.name || 'child'}-${userInfo.avatar?.skinTone || 'medium'}-${culturalProfile}`;
    const seed = this.generateStableSeed(seedInput, culturalProfile);
    const random = this.createSeededRandom(seed);
    const culturalStyleMap = {
      'african': {
        clothing: [
          'traditional African-inspired shirt', 'colorful dashiki-style top', 'African print casual wear',
          'kente pattern accessories', 'modern African fashion', 'traditional woven clothing',
          'bright colorful attire', 'African-inspired school uniform', 'cultural celebration outfit'
        ],
        accessories: [
          'traditional African jewelry', 'cultural beads', 'traditional headwrap', 'African-inspired backpack',
          'cultural artifacts', 'traditional patterns', 'ethnic accessories', 'cultural symbols'
        ],
        markers: [
          'African traditions', 'ancestral heritage', 'traditional community', 'cultural ceremonies',
          'tribal customs', 'African diaspora', 'traditional crafts', 'cultural preservation',
          'community elders', 'traditional music and dance'
        ],
        hairstyles: {
          boys: [
            'traditional African cut', 'ethnic buzz cut', 'cultural fade', 'tribal-inspired style',
            'African natural hair', 'traditional braided style', 'ethnic hair patterns'
          ],
          girls: [
            'traditional African braids', 'ethnic hair wrapping', 'cultural cornrows', 'tribal hairstyles',
            'African natural curls', 'traditional headwrap style', 'ethnic protective styles'
          ]
        }
      },
      'african-american': {
        clothing: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_CLOTHING,
        skinTones: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_SKIN_TONES,
        eyeColors: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_EYE_COLORS,
        facialFeatures: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES,
        accessories: [
          'backpack with cultural pins', 'stylish sneakers', 'baseball cap', 'smartwatch', 
          'friendship bracelet', 'sports equipment', 'water bottle', 'glasses', 
          'headphones', 'school supplies', 'athletic socks', 'trendy accessories'
        ],
        markers: [
          'urban community', 'cultural celebration', 'local community center', 'neighborhood park',
          'African American traditions', 'family heritage', 'community pride', 'modern American identity',
          'multicultural environment', 'diverse neighborhood'
        ],
        hairstyles: {
          boys: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_HAIRSTYLES.boys,
          girls: CharacterConsistencyService.EXPANDED_AFRICAN_AMERICAN_HAIRSTYLES.girls
        }
      },
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
      },
      'french-american': {
        clothing: [
          'stylish casual wear', 'chic everyday outfit', 'elegant simple clothing',
          'fashionable school attire', 'sophisticated casual style'
        ],
        accessories: [
          'stylish accessories', 'elegant bag', 'fashionable items',
          'cultural books', 'artistic supplies'
        ],
        markers: [
          'French cultural heritage', 'bilingual household', 'artistic appreciation',
          'cultural sophistication', 'European traditions'
        ]
      },
      'arabic-american': {
        clothing: [
          'modest cultural wear', 'traditional-inspired outfit', 'modern modest clothing',
          'cultural celebration attire', 'family gathering outfit'
        ],
        accessories: [
          'cultural jewelry', 'traditional patterns', 'family heirlooms',
          'cultural symbols', 'religious items'
        ],
        markers: [
          'Middle Eastern heritage', 'cultural traditions', 'family values',
          'community gatherings', 'religious observance'
        ]
      },
      'chinese-american': {
        clothing: [
          'modern casual wear', 'traditional-inspired outfit', 'festive celebration clothing',
          'cultural ceremony attire', 'family gathering style'
        ],
        accessories: [
          'cultural symbols', 'traditional jewelry', 'family artifacts',
          'educational items', 'cultural decorations'
        ],
        markers: [
          'Chinese heritage', 'family traditions', 'cultural festivals',
          'educational excellence', 'community respect'
        ]
      },
      'indian-american': {
        clothing: [
          'colorful traditional wear', 'modern fusion style', 'cultural celebration outfit',
          'festive attire', 'family gathering clothing'
        ],
        accessories: [
          'traditional jewelry', 'cultural artifacts', 'family heirlooms',
          'cultural symbols', 'festive decorations'
        ],
        markers: [
          'Indian heritage', 'cultural diversity', 'family traditions',
          'spiritual values', 'community celebrations'
        ]
      }
    };
    
    const selectedProfile = culturalStyleMap[culturalProfile] || culturalStyleMap['standard-american'];
    
    // For profiles with hairstyles, add gender-appropriate selection
    if (selectedProfile.hairstyles) {
      const gender = userInfo?.avatar?.gender || userInfo?.avatar?.type || (Math.random() < 0.5 ? 'boy' : 'girl');
      const genderKey = gender === 'girl' ? 'girls' : 'boys';
      const hairstyles = selectedProfile.hairstyles[genderKey];
      
      if (hairstyles && hairstyles.length > 0) {
        selectedProfile.selectedHairstyle = hairstyles[Math.floor(random() * hairstyles.length)];
        console.log(`🎭 CULTURAL: Selected ${gender} hairstyle for ${culturalProfile}: ${selectedProfile.selectedHairstyle}`);
      }
    }
    
    return selectedProfile;
  }

  /**
   * Detect physical features from page text
   */
  detectPageTextPhysicalFeatures(storyContext) {
    if (!storyContext) return {};
    
    const text = storyContext.toLowerCase();
    const features = {};
    
    // Height detection
    if (text.includes('tall')) features.height = 'tall for their age';
    else if (text.includes('short')) features.height = 'short';
    else if (text.includes('average height')) features.height = 'average height';
    
    // Eye color detection
    if (text.includes('blue eyes')) features.eyeColor = 'blue eyes';
    else if (text.includes('brown eyes')) features.eyeColor = 'brown eyes';
    else if (text.includes('green eyes')) features.eyeColor = 'green eyes';
    else if (text.includes('hazel eyes')) features.eyeColor = 'hazel eyes';
    else if (text.includes('dark eyes')) features.eyeColor = 'dark brown eyes';
    
    // Build detection
    if (text.includes('slim') || text.includes('thin')) features.build = 'slim';
    else if (text.includes('sturdy') || text.includes('stocky')) features.build = 'sturdy';
    else if (text.includes('average build')) features.build = 'average';
    
    return features;
  }

  /**
   * Build character description with page text overrides - ENHANCED with age context
   */
  buildCharacterDescription(seedData, storyContext, pageTextClothing = null) {
    const traits = seedData.physicalTraits;
    const cultural = seedData.culturalElements;
    
    // Detect physical features from page text
    const pageTextFeatures = this.detectPageTextPhysicalFeatures(storyContext);
    
    // Use page text clothing if provided, otherwise use cultural clothing
    const clothing = pageTextClothing || 
      cultural.clothing[Math.floor(Math.random() * cultural.clothing.length)];
    const accessories = cultural.accessories.slice(0, 2).join(' and ');
    
    // FIXED: Extract age context from seedData (comes from avatarIdentity)
    const ageContext = seedData.age ? `${seedData.age}-year-old ` : (seedData.ageCategory || '');
    const agePrefix = ageContext && !ageContext.includes('-year-old') ? `${ageContext} ` : ageContext;
    
    // Enhanced description for African American characters with comprehensive arrays
    if (seedData.culturalProfile === 'african-american' && traits.isAfricanAmerican) {
      const random = this.createSeededRandom(seedData.baseSeed);
      
      // Select comprehensive physical features, use page text overrides when available
      const skinTone = cultural.skinTones[Math.floor(random() * cultural.skinTones.length)];
      const eyeColor = pageTextFeatures.eyeColor || cultural.eyeColors[Math.floor(random() * cultural.eyeColors.length)];
      const facialFeatures = cultural.facialFeatures[Math.floor(random() * cultural.facialFeatures.length)];
      
      // Only include height/build if detected from page text
      const heightDescription = pageTextFeatures.height ? `${pageTextFeatures.height} ` : '';
      const buildDescription = pageTextFeatures.build ? ` ${pageTextFeatures.build} build.` : '.';
      
      return `A ${heightDescription}${agePrefix}${seedData.avatarType} with ${skinTone}, ${traits.hairColor} hair, and ${eyeColor}. ${facialFeatures}${buildDescription} Wearing ${clothing}${accessories ? ` with ${accessories}` : ''}.`;
    }
    
    // Minimal description for other cultural profiles - let Runware decide most features
    const eyeColor = pageTextFeatures.eyeColor || '';
    const eyeDescription = eyeColor ? ` with ${eyeColor}` : '';
    
    // Only include height/build if detected from page text
    const heightDescription = pageTextFeatures.height ? `${pageTextFeatures.height} ` : '';
    const buildDescription = pageTextFeatures.build ? ` ${pageTextFeatures.build} build.` : '.';
    
    return `A ${heightDescription}${agePrefix}${seedData.avatarType}${eyeDescription}${buildDescription} Wearing ${clothing}${accessories ? ` with ${accessories}` : ''}.`;
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
   * Clear character data for session (DATABASE-BACKED)
   */
  async clearCharacterData(sessionId) {
    console.log(`🎭 Attempting to clear character data for session: ${sessionId}...`);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { error } = await supabase
      .from('character_consistency_cache')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Database clear error:', error);
      throw new Error(`CharacterConsistencyService.clearCharacterData failed: ${error.message}`);
    }
    
    console.log(`🎭 Cleared character data for session: ${sessionId}`);
    return true;
  }

  /**
   * Get monitoring data (DATABASE-BACKED)
   */
  async getActiveCharacterSeeds() {
    console.log('📊 Attempting to get active character monitoring data...');
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data, error } = await supabase
      .from('character_consistency_cache')
      .select('session_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database monitoring error:', error);
      throw new Error(`CharacterConsistencyService.getActiveCharacterSeeds failed: ${error.message}`);
    }

    const uniqueSessions = [...new Set(data?.map(row => row.session_id) || [])];
    
    return {
      total: data?.length || 0,
      sessions: uniqueSessions,
      note: 'Database-backed character consistency service'
    };
  }

  /**
   * Clear all state (DATABASE-BACKED)
   */
  async clearServerState() {
    console.log('🎭 Attempting to clear all character consistency data from database...');
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { error } = await supabase
      .from('character_consistency_cache')
      .delete()
      .neq('session_id', ''); // Delete all records

    if (error) {
      console.error('❌ Database clear all error:', error);
      throw new Error(`CharacterConsistencyService.clearServerState failed: ${error.message}`);
    }
    
    console.log('🎭 Character consistency service cleared from database');
    return { cleared: true, message: 'Database-backed character consistency cleared' };
  }
}