/**
 * Unified Character Descriptor System
 * Consolidates character description logic from FrontendIntelligence.js and MultiStageEnhancementPipeline.js
 * Provides enhanced cultural support for all supported languages
 */

import type { UserInfo } from "@/types";
import { CulturalAdaptationService } from "./culturalAdaptationService";

export type OutputMode = 'rich' | 'basic';

interface CulturalFeatures {
  physicalFeatures: string[];
  hairstyles: { boy: string[]; girl: string[] };
  skinTones: string[];
  culturalElements: string[];
  clothingStyles: string[];
}

export class UnifiedCharacterDescriptor {
  
  // ============= CULTURAL FEATURE MAPS =============
  
  private static readonly AFRICAN_AMERICAN_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "warm brown eyes with long lashes",
      "expressive dark eyes with natural sparkle", 
      "gentle smile with bright white teeth",
      "naturally full lips and strong facial features",
      "high cheekbones and defined jawline",
      "naturally textured eyebrows"
    ],
    hairstyles: {
      boy: [
        "short natural afro", "neat fade cut", "small twists", "protective buzz cut",
        "textured crop", "mini locs", "natural curl pattern", "clean edge-up",
        "short coils", "tapered natural cut", "twisted sponge curls", "low caesar cut"
      ],
      girl: [
        "natural afro puffs", "detailed braids", "twist-out curls", "protective cornrows",
        "goddess locs", "bantu knots", "wash-and-go curls", "elegant updo braids",
        "natural hair crown", "twisted protective style", "curly ponytail", "adorned braids with beads"
      ]
    },
    skinTones: [
      "rich cocoa brown skin", "warm caramel complexion", "deep mahogany skin tone",
      "golden bronze complexion", "rich ebony skin", "warm honey-brown skin",
      "beautiful dark chocolate complexion", "radiant amber-toned skin"
    ],
    culturalElements: [
      "wearing kente-inspired colors", "African heritage pride", "community celebration spirit",
      "natural hair beauty celebration", "cultural strength and wisdom", "ancestral connections"
    ],
    clothingStyles: [
      "vibrant African-inspired patterns", "bold colorful clothing", "cultural pride accessories",
      "traditional African colors", "ethnic pattern designs", "heritage celebration wear"
    ]
  };

  private static readonly HISPANIC_LATINO_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "warm brown eyes with golden flecks",
      "expressive dark eyes with natural warmth",
      "radiant smile with bright teeth",
      "naturally olive-toned complexion",
      "strong family resemblance features",
      "naturally arched eyebrows"
    ],
    hairstyles: {
      boy: [
        "thick wavy hair", "neat side part", "textured quiff", "natural waves",
        "classic taper", "curly top fade", "traditional cut", "layered waves"
      ],
      girl: [
        "long flowing hair", "natural curls", "braided styles", "wavy ponytail",
        "traditional braids", "cascading waves", "festive hair accessories", "colorful hair ribbons"
      ]
    },
    skinTones: [
      "warm olive skin", "golden tan complexion", "rich bronze skin tone",
      "sun-kissed brown skin", "caramel complexion", "warm medium skin"
    ],
    culturalElements: [
      "vibrant cultural celebration", "family tradition pride", "community festival spirit",
      "Latin heritage celebration", "colorful cultural expression", "festive cultural joy"
    ],
    clothingStyles: [
      "bright festive colors", "embroidered traditional patterns", "colorful woven designs",
      "celebratory clothing", "cultural festival wear", "vibrant family gathering attire"
    ]
  };

  private static readonly EAST_ASIAN_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "gentle dark eyes with natural wisdom",
      "serene expression with inner strength",
      "harmonious facial features",
      "naturally straight dark hair",
      "elegant bone structure",
      "peaceful countenance"
    ],
    hairstyles: {
      boy: [
        "neat straight hair", "classic bowl cut", "tidy side part", "natural black hair",
        "traditional short style", "clean academic cut", "straight bangs", "refined cut"
      ],
      girl: [
        "long straight hair", "traditional braids", "neat ponytail", "flowing black hair",
        "elegant hair accessories", "cultural hair ornaments", "silk hair ribbons", "traditional styling"
      ]
    },
    skinTones: [
      "porcelain complexion", "warm beige skin", "natural Asian skin tone",
      "golden undertone complexion", "smooth pale skin", "healthy natural complexion"
    ],
    culturalElements: [
      "ancient wisdom heritage", "harmony and balance", "cultural tradition respect",
      "family honor values", "scholarly achievement pride", "natural world connection"
    ],
    clothingStyles: [
      "traditional silk patterns", "elegant cultural designs", "jade green accents",
      "classic Chinese elements", "sophisticated traditional wear", "cultural celebration attire"
    ]
  };

  private static readonly SOUTH_ASIAN_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "expressive dark eyes with spiritual depth",
      "warm welcoming smile",
      "naturally rich complexion",
      "strong cultural features",
      "graceful bone structure",
      "naturally thick dark hair"
    ],
    hairstyles: {
      boy: [
        "thick dark hair", "traditional cut", "neat side part", "natural waves",
        "cultural styling", "classic Indian cut", "well-groomed hair", "traditional appearance"
      ],
      girl: [
        "long braided hair", "traditional Indian braids", "flower hair accessories",
        "elegant cultural styling", "henna-decorated hands", "festive hair ornaments",
        "flowing traditional hair", "colorful cultural accessories"
      ]
    },
    skinTones: [
      "warm brown complexion", "rich golden skin", "beautiful Indian skin tone",
      "natural bronze complexion", "radiant brown skin", "warm honey complexion"
    ],
    culturalElements: [
      "vibrant cultural celebration", "spiritual heritage pride", "family tradition honor",
      "festival celebration joy", "cultural wisdom respect", "community harmony values"
    ],
    clothingStyles: [
      "colorful traditional saris", "intricate cultural patterns", "vibrant festival colors",
      "elegant Indian designs", "ceremonial cultural wear", "traditional celebration attire"
    ]
  };

  private static readonly BRAZILIAN_PORTUGUESE_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "warm tropical complexion",
      "bright joyful smile",
      "naturally sun-kissed features",
      "vibrant energetic expression",
      "healthy outdoor complexion",
      "naturally wavy hair texture"
    ],
    hairstyles: {
      boy: [
        "beach-tousled hair", "natural waves", "casual surfer style", "sun-bleached tips",
        "tropical casual cut", "ocean-breeze styled", "natural texture", "relaxed beach hair"
      ],
      girl: [
        "flowing beach waves", "tropical flower accessories", "natural curly hair",
        "colorful hair ties", "beachy braids", "festival hair decorations", "carefree styling", "ocean-inspired looks"
      ]
    },
    skinTones: [
      "golden tropical complexion", "sun-kissed bronze skin", "warm beach tan",
      "natural golden brown", "healthy outdoor complexion", "radiant tropical skin"
    ],
    culturalElements: [
      "tropical celebration spirit", "beach culture joy", "carnival festival energy",
      "environmental harmony", "community celebration", "musical cultural heritage"
    ],
    clothingStyles: [
      "bright tropical colors", "beach-inspired casual wear", "festival celebration attire",
      "colorful summer clothing", "carnival-inspired designs", "tropical pattern clothing"
    ]
  };

  private static readonly FRENCH_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "refined European features",
      "elegant natural beauty",
      "sophisticated bone structure",
      "naturally graceful appearance",
      "classic French charm",
      "artistic expression in features"
    ],
    hairstyles: {
      boy: [
        "classic French cut", "neat European style", "sophisticated short hair",
        "refined gentleman cut", "traditional French styling", "elegant appearance", "cultured look", "classic European hair"
      ],
      girl: [
        "elegant French braids", "sophisticated ponytail", "classic European styling",
        "refined hair accessories", "French-inspired updos", "elegant hair ribbons", "cultured appearance", "chic French style"
      ]
    },
    skinTones: [
      "classic European complexion", "fair French skin tone", "natural pale complexion",
      "refined European skin", "elegant fair skin", "sophisticated complexion"
    ],
    culturalElements: [
      "artistic cultural heritage", "sophisticated elegance", "culinary tradition pride",
      "intellectual curiosity", "cultural refinement", "artistic appreciation"
    ],
    clothingStyles: [
      "elegant French fashion", "sophisticated European style", "classic French designs",
      "refined clothing choices", "cultural elegance", "artistic fashion sense"
    ]
  };

  private static readonly ARABIC_MENA_FEATURES: CulturalFeatures = {
    physicalFeatures: [
      "expressive Middle Eastern eyes",
      "naturally olive complexion",
      "strong cultural features",
      "warm welcoming smile",
      "elegant bone structure",
      "naturally thick dark hair"
    ],
    hairstyles: {
      boy: [
        "traditional Middle Eastern cut", "neat cultural styling", "classic Arabic hair",
        "well-groomed appearance", "cultural tradition style", "refined Middle Eastern look", "traditional cut", "elegant styling"
      ],
      girl: [
        "traditional braided hair", "cultural hair coverings", "elegant Middle Eastern styling",
        "beautiful cultural accessories", "traditional hair ornaments", "flowing hair styles", "respectful cultural appearance", "graceful styling"
      ]
    },
    skinTones: [
      "warm olive complexion", "natural Middle Eastern skin", "golden desert complexion",
      "beautiful MENA skin tone", "warm bronze complexion", "elegant olive skin"
    ],
    culturalElements: [
      "rich cultural heritage", "traditional values pride", "community respect",
      "family honor traditions", "cultural wisdom", "hospitality values"
    ],
    clothingStyles: [
      "traditional Middle Eastern patterns", "flowing cultural robes", "geometric design clothing",
      "respectful cultural wear", "elegant traditional dress", "colorful cultural scarves"
    ]
  };

  // ============= CULTURAL FEATURE MAPPING =============
  
  private static getCulturalFeatures(language: string): CulturalFeatures | null {
    const culturalMap: Record<string, CulturalFeatures> = {
      'es': this.HISPANIC_LATINO_FEATURES,
      'zh': this.EAST_ASIAN_FEATURES,
      'hi': this.SOUTH_ASIAN_FEATURES,
      'pt': this.BRAZILIAN_PORTUGUESE_FEATURES,
      'fr': this.FRENCH_FEATURES,
      'ar': this.ARABIC_MENA_FEATURES
    };
    
    return culturalMap[language] || null;
  }

  // ============= AGE RANGE MAPPING =============
  
  // Enhanced age mapping with categories  
  private static getAgeRange(difficulty: string): string {
    const ageMapping = {
      'K': '4-5 years old',
      '1st': '6-7 years old', 
      '2nd': '7-8 years old',
      '3rd': '8-9 years old',
      '4th': '9-10 years old',
      '5th': '10-11 years old',
      'easy': '5-7 years old',
      'medium': '7-9 years old', 
      'hard': '9-11 years old'
    };
    
    return ageMapping[difficulty] || '7-9 years old';
  }

  // Get age category for character generation
  static getAgeCategory(difficulty: string): 'child' | 'teen' | 'adult' | 'elder' {
    const categoryMapping = {
      'K': 'child',
      '1st': 'child',
      '2nd': 'child', 
      '3rd': 'child',
      '4th': 'child',
      '5th': 'child',
      'easy': 'child',
      'medium': 'child',
      'hard': 'child'
    };
    
    return categoryMapping[difficulty] || 'child';
  }

  // ============= SECONDARY CHARACTER SYSTEM INTEGRATION =============
  // Integrating AdvancedCharacterEngine functionality into UnifiedCharacterDescriptor

  private static characterRegistry: Map<string, CharacterDescriptor> = new Map();
  private static familyGroups: Map<string, FamilyGroup> = new Map();
  private static sessionCharacters: Map<string, Set<string>> = new Map(); // sessionId -> character names
  
  // Animal character registry (integrated from AnimalCharacterManager)
  private static animalRegistry: Map<string, AnimalCharacter[]> = new Map(); // sessionId -> animals

  /**
   * Generate primary character description with session consistency
   */
  static generatePrimaryCharacter(userInfo: UserInfo, difficulty: string = 'easy', sessionId?: string): CharacterDescriptor {
    if (sessionId) {
      const characterId = `${sessionId}_primary`;
      
      if (this.characterRegistry.has(characterId)) {
        const existing = this.characterRegistry.get(characterId)!;
        return existing;
      }
      
      // Create new primary character
      const primaryCharacter: CharacterDescriptor = {
        name: userInfo.name?.split(' ')[0] || 'Child',
        type: 'primary',
        relationshipToMain: 'self',
        culturalRole: 'child protagonist',
        physicalTraits: this.generateCharacterDescription(userInfo, difficulty, 'rich', true),
        clothingStyle: 'casual children\'s clothing',
        lastUsedPage: 1,
        familyGroupId: `${sessionId}_family`,
        ageCategory: this.getAgeCategory(difficulty)
      };
      
      this.characterRegistry.set(characterId, primaryCharacter);
      return primaryCharacter;
    }
    
    // Non-session version
    return {
      name: userInfo.name?.split(' ')[0] || 'Child',
      type: 'primary',
      relationshipToMain: 'self', 
      culturalRole: 'child protagonist',
      physicalTraits: this.generateCharacterDescription(userInfo, difficulty, 'rich', true),
      clothingStyle: 'casual children\'s clothing',
      lastUsedPage: 1,
      ageCategory: this.getAgeCategory(difficulty)
    };
  }

  /**
   * Generate secondary characters (family, community, animals)
   */
  static generateSecondaryCharacter(
    type: 'family' | 'community' | 'animal',
    details: SecondaryCharacterDetails,
    userInfo: UserInfo,
    sessionId?: string
  ): CharacterDescriptor | AnimalCharacter {
    if (type === 'animal') {
      return this.generateAnimalCharacter(details, sessionId || 'default');
    }
    
    const characterId = `${sessionId || 'default'}_${type}_${details.relationship || details.name}`;
    
    if (this.characterRegistry.has(characterId)) {
      const existing = this.characterRegistry.get(characterId)!;
      return existing;
    }
    
    const ageCategory = this.mapRelationshipToAge(details.relationship);
    const culturalFeatures = this.getCulturalFeatures(userInfo.nativeLanguage);
    
    const secondaryCharacter: CharacterDescriptor = {
      name: details.name || this.generateCulturalName(details.relationship, userInfo.nativeLanguage),
      type: type === 'family' ? 'family' : 'community',
      relationshipToMain: details.relationship,
      culturalRole: `supportive ${details.relationship}`,
      physicalTraits: this.generateSecondaryCharacterTraits(ageCategory, culturalFeatures, userInfo),
      clothingStyle: this.getAgeAppropriateClothing(ageCategory, culturalFeatures),
      lastUsedPage: 1,
      familyGroupId: type === 'family' ? `${sessionId}_family` : undefined,
      ageCategory
    };
    
    if (sessionId) {
      this.characterRegistry.set(characterId, secondaryCharacter);
    }
    
    return secondaryCharacter;
  }

  /**
   * Get character consistency data for session
   */
  static getCharacterConsistencyData(sessionId: string): CharacterConsistencyData {
    const sessionChars = Array.from(this.characterRegistry.entries())
      .filter(([id]) => id.startsWith(sessionId))
      .map(([_, char]) => char);
      
    const sessionAnimals = this.animalRegistry.get(sessionId) || [];
    
    return {
      characters: sessionChars,
      animals: sessionAnimals,
      sessionId,
      lastUpdated: new Date().toISOString()
    };
  }

  // ============= ANIMAL CHARACTER INTEGRATION =============
  
  /**
   * Generate animal secondary character
   */
  private static generateAnimalCharacter(details: SecondaryCharacterDetails, sessionId: string): AnimalCharacter {
    const sessionAnimals = this.getOrCreateSessionAnimals(sessionId);
    
    // Check for existing animal of same species (enforce single animal rule)
    const existingAnimal = sessionAnimals.find(a => a.species === details.species);
    
    if (existingAnimal) {
      // Update existing animal with new details
      if (details.name && !existingAnimal.name) existingAnimal.name = details.name;
      if (details.color && !existingAnimal.color) existingAnimal.color = details.color;
      if (details.personality && !existingAnimal.personality) existingAnimal.personality = details.personality;
      return existingAnimal;
    }
    
    // Create new animal
    const newAnimal: AnimalCharacter = {
      species: details.species!,
      name: details.name,
      color: details.color,
      size: details.size,
      personality: details.personality,
      seed: this.generateAnimalSeed(sessionId, details),
      firstMentionedPage: 1,
      lastMentionedPage: 1,
      mentionCount: 1,
      createdAt: Date.now()
    };
    
    sessionAnimals.push(newAnimal);
    this.animalRegistry.set(sessionId, sessionAnimals);
    
    return newAnimal;
  }

  private static getOrCreateSessionAnimals(sessionId: string): AnimalCharacter[] {
    if (!this.animalRegistry.has(sessionId)) {
      this.animalRegistry.set(sessionId, []);
    }
    return this.animalRegistry.get(sessionId)!;
  }

  private static generateAnimalSeed(sessionId: string, details: SecondaryCharacterDetails): number {
    let hash = 0;
    const input = `${sessionId}-${details.species}-${details.color || 'default'}-${details.name || 'unnamed'}`;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash);
  }

  // ============= HELPER METHODS =============

  private static mapRelationshipToAge(relationship: string): 'child' | 'teen' | 'adult' | 'elder' {
    const ageMapping: Record<string, 'child' | 'teen' | 'adult' | 'elder'> = {
      'sister': 'child',
      'brother': 'child', 
      'cousin': 'child',
      'friend': 'child',
      'classmate': 'child',
      'mother': 'adult',
      'father': 'adult',
      'aunt': 'adult',
      'uncle': 'adult',
      'teacher': 'adult',
      'neighbor': 'adult',
      'grandmother': 'elder',
      'grandfather': 'elder'
    };
    
    return ageMapping[relationship] || 'adult';
  }

  private static generateSecondaryCharacterTraits(
    ageCategory: 'child' | 'teen' | 'adult' | 'elder',
    culturalFeatures: CulturalFeatures | null,
    userInfo: UserInfo
  ): string {
    if (culturalFeatures) {
      const physicalFeature = this.selectRandom(culturalFeatures.physicalFeatures);
      const skinTone = this.selectRandom(culturalFeatures.skinTones);
      
      // Age-appropriate styling
      if (ageCategory === 'elder') {
        return `${skinTone}, ${physicalFeature}, wise appearance, gray hair`;
      } else if (ageCategory === 'adult') {
        return `${skinTone}, ${physicalFeature}, mature appearance`;
      } else {
        return `${skinTone}, ${physicalFeature}, youthful appearance`;
      }
    }
    
    return `${ageCategory} with friendly appearance`;
  }

  private static getAgeAppropriateClothing(
    ageCategory: 'child' | 'teen' | 'adult' | 'elder',
    culturalFeatures: CulturalFeatures | null
  ): string {
    if (culturalFeatures) {
      return this.selectRandom(culturalFeatures.clothingStyles);
    }
    
    const clothingMap = {
      'child': 'casual children\'s clothing',
      'teen': 'trendy youth clothing',
      'adult': 'professional adult attire',
      'elder': 'comfortable elder clothing'
    };
    
    return clothingMap[ageCategory];
  }

  private static generateCulturalName(relationship: string, language: string): string {
    const namePatterns: Record<string, Record<string, string[]>> = {
      'ar': {
        mother: ['Amina', 'Fatima', 'Aisha'],
        father: ['Ahmad', 'Omar', 'Hassan'],
        grandmother: ['Hajja Fatima', 'Sitt Amina'],
        teacher: ['Ustaz Ahmad', 'Miss Aisha']
      },
      'es': {
        mother: ['María', 'Carmen', 'Rosa'],
        father: ['José', 'Carlos', 'Miguel'],
        grandmother: ['Abuela Rosa', 'Abuelita María'],
        teacher: ['Señorita Carmen', 'Maestro José']
      },
      'zh': {
        mother: ['Li Wei', 'Wang Ming', 'Chen Mei'],
        father: ['Li Gang', 'Wang Jun', 'Chen Hao'],
        grandmother: ['Nai Nai', 'Po Po'],
        teacher: ['Teacher Wang', 'Miss Li']
      },
      'hi': {
        mother: ['Priya', 'Sunita', 'Kavya'],
        father: ['Raj', 'Amit', 'Vikram'],
        grandmother: ['Dadi', 'Nani'],
        teacher: ['Priya Madam', 'Raj Sir']
      },
      'pt': {
        mother: ['Maria', 'Ana', 'Lucia'],
        father: ['João', 'Carlos', 'Pedro'],
        grandmother: ['Vovó Maria', 'Vovó Ana'],
        teacher: ['Professora Ana', 'Professor João']
      },
      'fr': {
        mother: ['Marie', 'Sophie', 'Claire'],
        father: ['Pierre', 'Jean', 'Paul'],
        grandmother: ['Grand-mère Marie', 'Mémé Sophie'],
        teacher: ['Madame Claire', 'Monsieur Pierre']
      },
      'en': {
        mother: ['Mom', 'Mother', 'Mama'],
        father: ['Dad', 'Father', 'Papa'],
        grandmother: ['Grandma', 'Nana', 'Grammy'],
        teacher: ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis']
      }
    };
    
    const names = namePatterns[language]?.[relationship] || namePatterns['en'][relationship] || [relationship];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Clear session data 
   */
  static clearSession(sessionId: string): void {
    // Remove characters
    for (const [id] of this.characterRegistry) {
      if (id.startsWith(sessionId)) {
        this.characterRegistry.delete(id);
      }
    }
    
    // Remove family groups
    for (const [id] of this.familyGroups) {
      if (id.startsWith(sessionId)) {
        this.familyGroups.delete(id);
      }
    }
    
    // Remove session tracking
    this.sessionCharacters.delete(sessionId);
    
    // Remove animals
    this.animalRegistry.delete(sessionId);
    
    console.log(`🗑️ Cleared unified character data for session: ${sessionId}`);
  }

  // ============= GENDER DETECTION =============
  
  private static detectGender(userInfo: UserInfo): string {
    return userInfo?.avatar?.type === 'girl' ? 'girl' : 'boy';
  }

  // ============= CULTURAL DETECTION =============
  
  private static shouldApplyAfricanAmericanFeatures(userInfo: UserInfo): boolean {
    // English language + dark skin tone gets African-American features
    return userInfo?.nativeLanguage === 'en' && userInfo?.avatar?.skinTone === 'dark';
  }

  private static shouldApplyCulturalFeatures(userInfo: UserInfo): boolean {
    // Non-English languages get cultural features
    return userInfo?.nativeLanguage !== 'en';
  }

  // ============= RANDOM SELECTION HELPERS =============
  
  private static selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // ============= MAIN CHARACTER DESCRIPTION GENERATOR =============
  
  /**
   * Generate unified character description
   * @param userInfo - User information
   * @param difficulty - Difficulty level for age mapping
   * @param outputMode - 'rich' for detailed descriptions, 'basic' for simple
   * @param culturalEnhancement - Enable/disable cultural feature generation
   * @returns Character description string
   */
  static generateCharacterDescription(
    userInfo: UserInfo,
    difficulty: string = 'easy',
    outputMode: OutputMode = 'rich',
    culturalEnhancement: boolean = true
  ): string {
    const name = userInfo?.name || 'Alex';
    const gender = this.detectGender(userInfo);
    const ageRange = this.getAgeRange(difficulty);
    const skinTone = userInfo?.avatar?.skinTone || 'medium';

    // Basic mode - simple description for all users
    if (outputMode === 'basic') {
      const skinMap = {
        light: 'light skin',
        medium: 'medium skin', 
        olive: 'olive skin',
        dark: 'dark skin',
        pale: 'pale skin'
      };
      
      return `${name} (${gender}, ${ageRange}, with ${skinMap[skinTone as keyof typeof skinMap] || 'medium skin'})`;
    }

    // Rich mode - enhanced cultural descriptions
    if (!culturalEnhancement) {
      return `${name} (${gender}, ${ageRange}, with ${skinTone} skin)`;
    }

    // English + Dark Skin = African-American Features
    if (this.shouldApplyAfricanAmericanFeatures(userInfo)) {
      const features = this.AFRICAN_AMERICAN_FEATURES;
      const physicalFeature = this.selectRandom(features.physicalFeatures);
      const hairstyle = this.selectRandom(features.hairstyles[gender as keyof typeof features.hairstyles]);
      const specificSkinTone = this.selectRandom(features.skinTones);
      const culturalElement = this.selectRandom(features.culturalElements);
      
      return `${name} (African-American ${gender}, ${ageRange}, with ${specificSkinTone}, ${physicalFeature}, ${hairstyle}, ${culturalElement})`;
    }

    // English + Non-Dark Skin = Basic Description (preserve existing logic)
    if (userInfo?.nativeLanguage === 'en' && userInfo?.avatar?.skinTone !== 'dark') {
      return `${name} (${gender} with ${skinTone} skin)`;
    }

    // Non-English Languages = Enhanced Cultural Features
    if (this.shouldApplyCulturalFeatures(userInfo)) {
      const culturalFeatures = this.getCulturalFeatures(userInfo.nativeLanguage);
      
      if (culturalFeatures) {
        const physicalFeature = this.selectRandom(culturalFeatures.physicalFeatures);
        const hairstyle = this.selectRandom(culturalFeatures.hairstyles[gender as keyof typeof culturalFeatures.hairstyles]);
        const specificSkinTone = this.selectRandom(culturalFeatures.skinTones);
        const culturalElement = this.selectRandom(culturalFeatures.culturalElements);
        const clothingStyle = this.selectRandom(culturalFeatures.clothingStyles);

        // Get cultural context for region name
        const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage);
        
        return `${name} (${culturalContext.region} ${gender}, ${ageRange}, with ${specificSkinTone}, ${physicalFeature}, ${hairstyle}, ${clothingStyle}, ${culturalElement})`;
      }
    }

    // Fallback - basic description
    return `${name} (${gender}, ${ageRange}, with ${skinTone} skin)`;
  }

  // ============= LEGACY COMPATIBILITY METHODS =============
  
  /**
   * SAFE character description that NEVER fails - for reliable fallback
   */
  static getCharacterDescriptionSafe(userInfo: UserInfo, difficulty?: string): string {
    try {
      return this.generateCharacterDescription(userInfo, difficulty, 'rich', true);
    } catch (error) {
      console.warn('UnifiedCharacterDescriptor failed, using emergency fallback:', error);
      // Emergency fallback - never fails
      const avatarType = userInfo?.avatar?.type || 'child';
      const skinTone = userInfo?.avatar?.skinTone || 'medium';
      const genderTerm = this.detectGender(userInfo);
      return `friendly ${genderTerm} ${avatarType} with ${skinTone} skin, warm smile, children's book style`;
    }
  }

  /**
   * Get cultural features for language (used by AdvancedCharacterEngine)
   */
  static getCulturalFeaturesForLanguage(language: string): CulturalFeatures | null {
    return this.getCulturalFeatures(language);
  }

  /**
   * Legacy compatibility for buildAdvancedCharacterDescription (Tier 1)
   */
  static buildAdvancedCharacterDescription(
    userInfo: UserInfo,
    culturalProfile: any,
    characterSeed: any,
    difficulty: string
  ): string {
    return this.generateCharacterDescription(userInfo, difficulty, 'rich', true);
  }

  /**
   * Legacy compatibility for buildSimpleCharacterDescription (Tier 2)  
   */
  static buildSimpleCharacterDescription(
    userInfo: UserInfo,
    difficulty: string = 'easy'
  ): string {
    return this.generateCharacterDescription(userInfo, difficulty, 'basic', false);
  }
}

// ============= INTERFACE DEFINITIONS =============

export interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'teacher' | 'community';
  relationshipToMain: string;
  culturalRole: string;
  physicalTraits: string;
  clothingStyle: string;
  seed?: number;
  lastUsedPage: number;
  familyGroupId?: string;
  ageCategory: 'child' | 'teen' | 'adult' | 'elder';
}

export interface FamilyGroup {
  id: string;
  culturalBackground: string;
  sharedTraits: {
    skinTone: string;
    hairTexture: string;
    facialFeatures: string;
    culturalElements: string[];
  };
  members: CharacterDescriptor[];
}

export interface AnimalCharacter {
  species: string;
  name?: string;
  color?: string;
  size?: string;
  personality?: string;
  seed: number;
  firstMentionedPage: number;
  lastMentionedPage: number;
  mentionCount: number;
  createdAt: number;
}

export interface SecondaryCharacterDetails {
  relationship?: string; // Optional for animals
  name?: string;
  species?: string; // For animals
  color?: string; // For animals
  size?: string; // For animals
  personality?: string; // For animals
}

export interface CharacterConsistencyData {
  characters: CharacterDescriptor[];
  animals: AnimalCharacter[];
  sessionId: string;
  lastUpdated: string;
}