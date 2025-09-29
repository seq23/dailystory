/**
 * ========================================
 * CHARACTER CONSISTENCY SERVICE - IMAGE GENERATION VERSION (PRODUCTION)
 * ========================================
 * 
 * PURPOSE: This is the PRODUCTION version used exclusively by IMAGE GENERATION systems
 * USAGE: Edge functions for image orchestration (runware-generate-image, templates, etc.)
 * ARCHITECTURE: Self-contained with inlined dependencies for edge function optimization
 * 
 * =================== CRITICAL DISTINCTIONS ===================
 * 
 * 🔥 IMAGE GENERATION SYSTEM (THIS FILE):
 * - Used by: runware-generate-image, template-ab, template-cd edge functions
 * - Dependencies: INLINED safeErrorMessage function (no external imports)
 * - Export: characterConsistencyService (singleton instance)
 * - Purpose: Character consistency for AI-generated images
 * - Environment: Edge functions (Deno runtime)
 * 
 * 📖 STORY GENERATION SYSTEM (CharacterConsistencyService.ts):
 * - Used by: story generation functions, smartTemplateSelector.ts, streamlined-handler.ts
 * - Dependencies: IMPORTS safeErrorMessage from errorPatterns.ts
 * - Export: CharacterService (class constructor)
 * - Purpose: Character consistency for story narrative generation
 * - Environment: TypeScript development environment
 * 
 * =================== SYNCHRONIZATION WARNING ===================
 * 
 * ⚠️  BOTH VERSIONS MUST MAINTAIN IDENTICAL CORE FUNCTIONALITY
 * ⚠️  Changes to character logic MUST be applied to BOTH files
 * ⚠️  Database methods MUST remain synchronized between versions
 * ⚠️  DO NOT remove errorPatterns.ts - story generation depends on it
 * 
 * =================== FUNCTION CATEGORIES ===================
 * 
 * 🖼️  IMAGE GENERATION FUNCTIONS:
 * - getCharacterSeed() - Main character consistency for images
 * - getCulturalEnhancements() - Avatar appearance consistency
 * - buildCharacterDescription() - Image prompt building
 * - detectColoredObjectsAndClothing() - Visual element consistency
 * 
 * 📊 DATABASE OPERATIONS (SHARED):
 * - saveCharacterToDatabase() - Persistence layer
 * - getCharacterFromDatabase() - Data retrieval
 * - saveVisualDetailToDatabase() - Visual details cache
 * 
 * 🎭 CHARACTER GENERATION (SHARED):
 * - generateStableSeed() - Deterministic seed generation
 * - createSeededRandom() - Consistent randomization
 * - detectSecondaryCharacters() - Relationship detection
 * 
 * =================== EDGE FUNCTION OPTIMIZATION ===================
 * 
 * This version is optimized for edge function performance:
 * - Inlined safeErrorMessage to avoid import dependency issues
 * - Memoized imports with fallback handling
 * - Single instance export for memory efficiency
 * - Minimal external dependencies
 */

// Inline safe error handling to avoid TypeScript import issues in edge functions
function safeErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

// Inline fallback memoizer for shared dependencies
const serviceImportCache = new Map();
async function memoizedServiceImport(path) {
  if (serviceImportCache.has(path)) {
    return serviceImportCache.get(path);
  }
  
  try {
    const module = await import(path);
    serviceImportCache.set(path, module);
    return module;
  } catch (error) {
    console.warn(`Failed to import ${path}:`, error);
    return {
      VOCABULARY: {
        objectCategories: {
          animals: ['dog', 'cat', 'rabbit', 'hamster', 'bird'],
          colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink']
        }
      }
    };
  }
}


export class CharacterConsistencyService {
  constructor() {
    this.visualDetailCache = new Map();
    this.supabase = null;
  }

  /**
   * Extract relationships from tier25 vocabulary structure
   */
  extractRelationshipsFromTier25(vocab) {
    return [
      // Family relationships
      'mom', 'mother', 'mommy', 'mama', 'ma', 'dad', 'father', 'daddy', 'papa', 'pa',
      'sister', 'sis', 'brother', 'bro', 'grandma', 'grandmother', 'nana', 'granny',
      'grandpa', 'grandfather', 'gramps', 'aunt', 'auntie', 'uncle', 'cousin',
      // Community relationships  
      'friend', 'buddy', 'pal', 'companion', 'best friend', 'bestie', 'classmate',
      'teammate', 'neighbor', 'neighbour', 'playmate',
      // Authority figures
      'teacher', 'instructor', 'tutor', 'coach', 'trainer', 'doctor', 'dr',
      'nurse', 'principal', 'headmaster', 'librarian', 'babysitter', 'sitter', 'guide'
    ];
  }

  /**
   * Enhanced vocabulary fetcher with comprehensive coverage and error handling
   */
  async getVocabulary() {
    try {
      const { TIER_25_UNIFIED_VOCABULARY_EXTENDED, EXPANDED_COLOR_ARRAY, CLOTHING_DETECTION_KEYWORDS } = await import('./tier25Vocabulary.js');
      return {
        settings: [...TIER_25_UNIFIED_VOCABULARY_EXTENDED.contextDetection.indoor, ...TIER_25_UNIFIED_VOCABULARY_EXTENDED.contextDetection.outdoor],
        animals: TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.animals,
        relationships: this.extractRelationshipsFromTier25(TIER_25_UNIFIED_VOCABULARY_EXTENDED),
        colors: EXPANDED_COLOR_ARRAY,
        objects: Object.values(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories).flat(),
        clothing: CLOTHING_DETECTION_KEYWORDS || ['shirt', 'dress', 'pants', 'shoes', 'hat', 'jacket', 'sweater', 'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers', 'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves']
      };
    } catch (error) {
      console.warn('Fallback to minimal vocabulary:', error);
      return { 
        settings: ['room', 'outside'], 
        animals: ['cat', 'dog'], 
        relationships: ['friend'], 
        colors: ['red', 'blue'], 
        objects: ['toy', 'ball'], 
        clothing: ['shirt', 'dress'] 
      };
    }
  }

  /**
   * Singleton pattern - return the shared instance
   */
  static getInstance() {
    if (!CharacterConsistencyService.instance) {
      CharacterConsistencyService.instance = new CharacterConsistencyService();
    }
    return CharacterConsistencyService.instance;
  }

  /**
   * Get or create Supabase client using resilient loader
   */
  async getSupabaseClient() {
    if (!this.supabase) {
      try {
        const { createResilientSupabaseClient } = await import('./resilientLoader.ts');
        this.supabase = await createResilientSupabaseClient();
      } catch (error) {
        console.warn('Failed to create Supabase client:', error);
        this.supabase = null;
      }
    }
    return this.supabase;
  }

  // ============= DATABASE OPERATIONS =============
  
  /**
   * Save character data to database (character_consistency_cache only)
   */
  async saveCharacterToDatabase(sessionId, characterKey, characterData) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return null;

      const { error } = await supabase
        .from('character_consistency_cache')
        .upsert({
          session_id: sessionId,
          character_key: characterKey,
          character_data: characterData,
          selected_cultural_hair: characterData.selectedCulturalHair || null,
          selected_cultural_features: characterData.selectedCulturalFeatures || null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Database save error:', error);
        throw new Error(`CharacterConsistencyService.saveCharacterToDatabase failed: ${safeErrorMessage(error)}`);
      }
      
      return true;
    } catch (importError) {
      console.warn('Failed to save character to database:', importError);
      return null;
    }
  }

  /**
   * Get character data from database (character_consistency_cache only)
   */
  async getCharacterFromDatabase(sessionId, characterKey) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('character_consistency_cache')
        .select('character_data, selected_cultural_hair, selected_cultural_features')
        .eq('session_id', sessionId)
        .eq('character_key', characterKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Database fetch error:', error);
        throw new Error(`CharacterConsistencyService.getCharacterFromDatabase failed: ${safeErrorMessage(error)}`);
      }
      
      if (data?.character_data) {
        const characterData = data.character_data;
        if (data.selected_cultural_hair) {
          characterData.selectedCulturalHair = data.selected_cultural_hair;
        }
        if (data.selected_cultural_features) {
          characterData.selectedCulturalFeatures = data.selected_cultural_features;
        }
        return characterData;
      }
      
      return null;
    } catch (importError) {
      console.warn('Failed to get character from database:', importError);
      return null;
    }
  }

  /**
   * Save visual detail to database (visual_details_cache only)
   */
  async saveVisualDetailToDatabase(sessionId, characterName, detailType, detailKey, detailValue, pageNumber) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return;

      // Check if detail already exists
      const { data: existing } = await supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName)
        .eq('detail_type', detailType)
        .eq('detail_key', detailKey)
        .single();

      if (existing) {
        // Update existing detail
        const { error } = await supabase
          .from('visual_details_cache')
          .update({
            detail_value: detailValue,
            page_last_seen: pageNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating visual detail:', error);
        } else {
          console.log(`✅ Updated visual detail: ${characterName} ${detailType} ${detailKey} = ${detailValue}`);
        }
      } else {
        // Insert new detail
        const { error } = await supabase
          .from('visual_details_cache')
          .insert({
            session_id: sessionId,
            character_name: characterName,
            detail_type: detailType,
            detail_key: detailKey,
            detail_value: detailValue,
            page_first_seen: pageNumber,
            page_last_seen: pageNumber
          });

        if (error) {
          console.error('Error inserting visual detail:', error);
        } else {
          console.log(`✅ Stored new visual detail: ${characterName} ${detailType} ${detailKey} = ${detailValue}`);
        }
      }
    } catch (error) {
      console.error('Database error in saveVisualDetailToDatabase:', error);
    }
  }

  // ============= CHARACTER GENERATION & CONSISTENCY =============
  
  /**
   * Get or create character seed with full consistency support
   */
  async getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType = 'new', pageTextClothing = null) {
    if (!avatarIdentity) {
      console.warn('⚠️ CharacterConsistencyService: avatarIdentity is undefined, using fallback');
      avatarIdentity = { name: 'child' };
    }
    
    const characterName = avatarIdentity.name || 'child';
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Check database for existing character
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      return cached;
    }
    
    // Generate new character
    const seedData = await this.createNewCharacterSeed(avatarIdentity);
    const characterDescription = await this.buildCharacterDescription(seedData, storyContext, pageTextClothing, sessionId);
    
    const characterData = {
      seed: seedData.baseSeed,
      characterDescription,
      avatarIdentity: {
        type: seedData.avatarType || avatarIdentity?.type,
        skinTone: seedData.skinTone || avatarIdentity?.skinTone
      },
      physicalTraits: seedData.physicalTraits,
      consistentClothingStyle: seedData.consistentClothingStyle,
      selectedCulturalHair: seedData.selectedCulturalHair,
      selectedCulturalFeatures: seedData.selectedCulturalFeatures,
      characterName: seedData.characterName,
      generatedAt: Date.now()
    };
    
    // Save to database for consistency across edge function instances
    await this.saveCharacterToDatabase(sessionId, cacheKey, characterData);
    
    return characterData;
  }

  /**
   * Create new character seed with avatar awareness
   */
  async createNewCharacterSeed(avatarIdentity) {
    const characterName = avatarIdentity.name || 'child';
    const userId = `avatar-${avatarIdentity.type}-${avatarIdentity.skinTone}`;
    const characterSpecificSeed = `${characterName}-${userId}-${avatarIdentity.skinTone}`;
    
    const baseSeed = this.generateStableSeed(characterSpecificSeed, characterName);
    const seededRandom = this.createSeededRandom(baseSeed);
    
    const clothingStyles = ['casual', 'colorful', 'comfortable', 'neat', 'playful', 'stylish', 'fun', 'vibrant'];
    const consistentClothingStyle = clothingStyles[Math.floor(seededRandom() * clothingStyles.length)];

    return {
      baseSeed,
      characterName,
      avatarType: avatarIdentity.type || 'child',
      skinTone: avatarIdentity.skinTone || 'medium',
      consistentClothingStyle,
      selectedCulturalHair: null,
      selectedCulturalFeatures: null,
      characterSpecificSeed
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
   * Create seeded random function
   */
  createSeededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  }

  /**
   * Get cultural enhancements with character consistency seeding
   */
  async getCulturalEnhancements(userInfo, sessionId, characterName = 'child') {
    const cacheKey = `${sessionId}_${characterName}`;
    
    let characterData = await this.getCharacterFromDatabase(sessionId, cacheKey);
    
    if (!characterData) {
      const avatarIdentity = userInfo?.avatarIdentity || userInfo?.avatar || { name: characterName };
      characterData = await this.getCharacterSeed(sessionId, avatarIdentity, null, 'new', null);
    }
    
    if (characterData.selectedCulturalHair && characterData.selectedCulturalFeatures) {
      return {
        hair: characterData.selectedCulturalHair,
        features: characterData.selectedCulturalFeatures
      };
    }
    
    // Import getCulturalBundle from StaticDataCache
    const { getCulturalBundle } = await import('./StaticDataCache.js');
    
    const characterSeed = characterData.seed || this.generateStableSeed(`${sessionId}_${characterName}`, characterName);
    const culturalBundle = getCulturalBundle(userInfo, characterSeed, userInfo?.skinTone);
    
    await this.updateCulturalSelections(sessionId, cacheKey, culturalBundle.hair, culturalBundle.features);
    
    characterData.selectedCulturalHair = culturalBundle.hair;
    characterData.selectedCulturalFeatures = culturalBundle.features;
    
    console.log(`🎨 Generated cultural enhancements for ${characterName} (seed: ${characterSeed}):`, culturalBundle);
    
    return culturalBundle;
  }

  /**
   * Update character data with cultural selections
   */
  async updateCulturalSelections(sessionId, characterKey, selectedCulturalHair, selectedCulturalFeatures) {
    console.log(`🎨 Updating cultural selections for character ${characterKey} in session ${sessionId}`);
    
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return false;

      const { error } = await supabase
        .from('character_consistency_cache')
        .update({
          selected_cultural_hair: selectedCulturalHair,
          selected_cultural_features: selectedCulturalFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('character_key', characterKey);

      if (error) {
        console.error('❌ Cultural selections update error:', error);
        throw new Error(`CharacterConsistencyService.updateCulturalSelections failed: ${safeErrorMessage(error)}`);
      }
      
      console.log(`🎨 Updated cultural selections for character ${characterKey}`);
      return true;
    } catch (importError) {
      console.warn('Failed to update cultural selections:', importError);
      return false;
    }
  }

  /**
   * Get structured avatar data for OpenAI integration (single source of truth)
   * Centralizes StaticDataCache usage within CharacterConsistencyService
   */
  async getStructuredAvatarData(sessionId, userInfo) {
    try {
      // Import StaticDataCache internally
      const staticDataCache = await import('./StaticDataCache.js');
      
      const characterName = userInfo?.name || userInfo?.childName || userInfo?.userName || 'child';
      const avatarSkinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
      
      const structuredAvatarData = {
        characterName,
        avatarType: userInfo?.avatar?.type || 'child',
        hairColor: staticDataCache.getHairBySkintone(avatarSkinTone, sessionId),
        skinTone: staticDataCache.getSkinBySkintone(avatarSkinTone, sessionId),
        culturalContext: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : 'universal'
      };
      
      console.log(`🎯 Generated structured avatar data for ${characterName}:`, structuredAvatarData);
      return structuredAvatarData;
    } catch (error) {
      console.warn('Failed to generate structured avatar data, using fallback:', error);
      
      // Fallback without StaticDataCache
      return {
        characterName: userInfo?.name || userInfo?.childName || 'child',
        avatarType: userInfo?.avatar?.type || 'child',
        hairColor: 'brown hair',
        skinTone: 'medium skin tone',
        culturalContext: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : 'universal'
      };
    }
  }

  /**
   * Smart colored object and clothing detection with character binding
   */
  async detectColoredObjectsAndClothing(text, sessionId, pageNumber) {
    const vocab = await this.getVocabulary();
    
    const detections = {
      coloredObjects: [],     // "red ball" → {object: 'ball', color: 'red', consistencyKey: 'ball'}
      characterClothing: [],  // "Sally's blue dress" → {character: 'sally', item: 'dress', color: 'blue'}
      generalClothing: []     // "wearing a green shirt" → {item: 'shirt', color: 'green'}
    };
    
    // Enhanced color-object binding patterns
    for (const color of vocab.colors) {
      for (const object of vocab.objects) {
        const pattern = new RegExp(`\\b${color}\\s+${object}\\b`, 'gi');
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            detections.coloredObjects.push({
              description: match,
              color: color,
              object: object,
              consistencyKey: object, // Key for cross-page consistency checking
              pageFirst: pageNumber,
              pageLast: pageNumber
            });
          }
        }
      }
    }
    
    // Character-specific clothing detection: "Sally's blue dress"
    for (const color of vocab.colors) {
      for (const clothing of vocab.clothing) {
        const pattern = new RegExp(`\\b([A-Z][a-z]+)'?s\\s+${color}\\s+${clothing}\\b`, 'gi');
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          detections.characterClothing.push({
            character: match[1].toLowerCase(),
            item: clothing,
            color: color,
            description: `${match[1]}'s ${color} ${clothing}`,
            consistencyKey: `${match[1].toLowerCase()}_${clothing}`,
            pageFirst: pageNumber,
            pageLast: pageNumber
          });
        }
      }
    }
    
    // General clothing detection: "wearing a green shirt"
    for (const color of vocab.colors) {
      for (const clothing of vocab.clothing) {
        const pattern = new RegExp(`\\b(?:wearing|has on|dressed in)\\s+(?:a|an|the)?\\s*${color}\\s+${clothing}\\b`, 'gi');
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          detections.generalClothing.push({
            item: clothing,
            color: color,
            description: `${color} ${clothing}`,
            consistencyKey: `general_${clothing}`,
            pageFirst: pageNumber,
            pageLast: pageNumber
          });
        }
      }
    }
    
    return detections;
  }

  /**
   * Cross-page consistency validation for colored objects and clothing
   */
  async validateColorConsistency(sessionId, newDetections) {
    const consistencyIssues = [];
    
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return [];

      // Check for color conflicts in objects
      for (const detection of newDetections.coloredObjects) {
        const { data: existing } = await supabase
          .from('visual_details_cache')
          .select('*')
          .eq('session_id', sessionId)
          .eq('detail_type', 'colored_object')
          .eq('detail_key', detection.consistencyKey)
          .single();

        if (existing && existing.visual_elements?.color !== detection.color) {
          consistencyIssues.push({
            type: 'color_conflict',
            message: `${detection.object} was ${existing.visual_elements.color} on page ${existing.page_last_seen}, now ${detection.color}`,
            suggestion: `Keep ${detection.object} as ${existing.visual_elements.color} for consistency`,
            severity: 'medium'
          });
        }
      }
      
      // Check for clothing conflicts
      for (const detection of newDetections.characterClothing) {
        const { data: existing } = await supabase
          .from('visual_details_cache')
          .select('*')
          .eq('session_id', sessionId)
          .eq('detail_type', 'character_clothing')
          .eq('detail_key', detection.consistencyKey)
          .single();

        if (existing && existing.visual_elements?.color !== detection.color) {
          consistencyIssues.push({
            type: 'clothing_conflict', 
            message: `${detection.character}'s ${detection.item} was ${existing.visual_elements.color}, now ${detection.color}`,
            suggestion: `Keep ${detection.character}'s ${detection.item} as ${existing.visual_elements.color}`,
            severity: 'high'
          });
        }
      }
    } catch (error) {
      console.warn('Consistency validation failed:', error);
    }
    
    return consistencyIssues;
  }

  /**
   * Store all detections to database with enhanced schema
   */
  async storeAllDetections(sessionId, pageNumber, allDetections) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return;

      const insertions = [];

      // Store colored objects
      for (const obj of allDetections.coloredObjects || []) {
        insertions.push({
          session_id: sessionId,
          character_name: 'objects',
          detail_type: 'colored_object',
          detail_key: obj.consistencyKey,
          detail_value: obj.description,
          page_first_seen: pageNumber,
          page_last_seen: pageNumber,
          visual_elements: {
            color: obj.color,
            object: obj.object,
            description: obj.description
          }
        });
      }

      // Store character clothing
      for (const clothing of allDetections.characterClothing || []) {
        insertions.push({
          session_id: sessionId,
          character_name: clothing.character,
          detail_type: 'character_clothing',
          detail_key: clothing.consistencyKey,
          detail_value: clothing.description,
          page_first_seen: pageNumber,
          page_last_seen: pageNumber,
          visual_elements: {
            color: clothing.color,
            item: clothing.item,
            character: clothing.character
          }
        });
      }

      // Store humans (family and community)
      const allHumans = [...(allDetections.humans?.family || []), ...(allDetections.humans?.community || []), ...(allDetections.humans?.authority || [])];
      for (const human of allHumans) {
        insertions.push({
          session_id: sessionId,
          character_name: human.name || human.character,
          detail_type: 'secondary_character',
          detail_key: `${human.name}_${human.relationship || human.role}`,
          detail_value: `${human.name} - ${human.relationship || human.role}`,
          page_first_seen: pageNumber,
          page_last_seen: pageNumber,
          visual_elements: {
            name: human.name,
            relationship: human.relationship || human.role,
            type: human.type
          }
        });
      }

      // Store animals with classification
      for (const animal of allDetections.animals || []) {
        const animalType = Object.keys(animal)[0]; // silent_pets, speaking_animals, etc.
        const animalData = animal[animalType];
        
        insertions.push({
          session_id: sessionId,
          character_name: 'animals',
          detail_type: 'animal',
          detail_key: `${animalData.name}_${animalType}`,
          detail_value: `${animalData.name} (${animalType})`,
          page_first_seen: pageNumber,
          page_last_seen: pageNumber,
          visual_elements: {
            name: animalData.name,
            species: animalData.species,
            classification: animalType
          }
        });
      }

      // Batch insert all detections
      if (insertions.length > 0) {
        const { error } = await supabase
          .from('visual_details_cache')
          .upsert(insertions, {
            onConflict: 'session_id,character_name,detail_type,detail_key',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error storing detections:', error);
        } else {
          console.log(`✅ Stored ${insertions.length} detection results for session ${sessionId}, page ${pageNumber}`);
        }
      }
    } catch (error) {
      console.error('Database error in storeAllDetections:', error);
    }
  }
    const characterName = seedData.characterName || 'child';
    const age = seedData.age || '6-8';
    
    // Check for detected clothing from visual details
    let clothingStyle = '';
    if (sessionId) {
      try {
        const detectedClothing = await this.buildClothingDescription(sessionId, characterName);
        if (detectedClothing) {
          clothingStyle = detectedClothing;
          console.log(`👕 Using detected clothing for ${characterName}: ${detectedClothing}`);
        }
      } catch (error) {
        console.log(`⚠️ Clothing detection failed:`, error.message);
      }
    }
    
    // Use random clothing if no specific clothing detected
    if (!clothingStyle) {
      const hasStoryClothing = pageTextClothing && (
        pageTextClothing.includes('wearing') || 
        pageTextClothing.includes('dressed') || 
        pageTextClothing.includes('shirt') ||
        pageTextClothing.includes('pants') ||
        pageTextClothing.includes('dress')
      );
      
      if (!hasStoryClothing) {
        clothingStyle = `wearing ${seedData.consistentClothingStyle} clothing`;
      }
    }
    
    const avatarType = seedData.avatarType || seedData.type || 'child';
    
    return `${characterName} is a ${avatarType} age ${age}${clothingStyle ? ' ' + clothingStyle : ''}`;
  }

  // ============= VISUAL DETAIL TRACKING (consolidated from VisualDetailTracker) =============
  
  /**
   * Enhanced analyze visual details - UPDATED to use consolidated detection
   */
  async analyzeVisualDetails(sessionId, text, pageNumber, characterName = null) {
    console.log(`🎨 Analyzing visual details for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Use consolidated detection approach
    const detectionResults = await this.detectAndGenerateAllCharacters(text, {
      sessionId,
      pageNumber,
      characterName
    });
    
    console.log(`🎨 Consolidated visual analysis complete:`, {
      family: detectionResults.humans?.family?.length || 0,
      community: detectionResults.humans?.community?.length || 0,
      authority: detectionResults.humans?.authority?.length || 0,
      coloredObjects: detectionResults.coloredObjects?.length || 0,
      characterClothing: detectionResults.characterClothing?.length || 0,
      animals: Object.values(detectionResults.animals || {}).flat().length,
      settings: Object.values(detectionResults.settings || {}).flat().length,
      consistencyIssues: detectionResults.consistencyIssues?.length || 0
    });
    
    return detectionResults;
  }

  /**
   * Store template-driven detection results
   */
  async storeTemplateDetections(sessionId, pageNumber, results, characterName = 'main_character') {
    for (const [type, items] of Object.entries(results)) {
      if (items.length > 0) {
        for (const item of items) {
          const detailKey = item.name || item.description || item.type || item.location || 'detected';
          const detailValue = typeof item === 'string' ? item : JSON.stringify(item);
          
          await this.saveVisualDetailToDatabase(
            sessionId,
            characterName,
            type,
            detailKey,
            detailValue,
            pageNumber
          );
        }
      }
    }
  }
    const characterClothingPattern = new RegExp(
      `(${characterName || '[A-Z][a-z]+'}|[A-Z][a-z]+)\\s+(has|wears?|wearing|puts?\\s+on|dresses?\\s+in)\\s+(a|an|the)?\\s*(new|old)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)?\\s*(shirt|dress|pants|hat|jacket|coat|shoes|boots|socks|gloves|scarf|belt|tie|sweater|blouse|skirt|shorts|vest|uniform)`,
      'gi'
    );
    
    // Secondary character visual patterns
    const momVisualPattern = /(mom|mother|mommy|mama)\\s+(has|with|wearing|wears|in)\\s+(a|an|the)?\\s*(long|short|curly|straight|blonde|brown|black|red|gray|grey)?\\s*(hair|dress|shirt|blouse|jacket|coat|apron|glasses|smile)/gi;
    const dadVisualPattern = /(dad|father|daddy|papa)\\s+(has|with|wearing|wears|in)\\s+(a|an|the)?\\s*(beard|mustache|glasses|hat|cap|shirt|jacket|tie|suit)/gi;
    
    // Enhanced color and size patterns using dynamic vocabulary
    const vocab = await this.getVocabulary();
    const expandedColorWords = vocab.colors.join('|').replace(/\s+/g, '\\s+');
    const sizeWords = ['big', 'small', 'large', 'tiny', 'huge', 'little', 'giant', 'mini'].join('|');
    const objectWords = vocab.objects.join('|').replace(/\s+/g, '\\s+');
    
    const colorPattern = new RegExp(`(${expandedColorWords})\\s+(${objectWords})`, 'gi');
    const sizePattern = new RegExp(`(${sizeWords})\\s+(${objectWords})`, 'gi');
    const colorSizePattern = new RegExp(`(${sizeWords})\\s+(${expandedColorWords})\\s+(${objectWords})`, 'gi');
    
    // Process character-specific clothing
    let match;
    while ((match = characterClothingPattern.exec(text)) !== null) {
      const characterInText = match[1];
      const clothingItem = match[7];
      const color = match[6] || 'unspecified';
      const modifier = match[4] || '';
      
      const clothingDescription = `${modifier} ${color} ${clothingItem}`.trim();
      
      await this.saveVisualDetailToDatabase(
        sessionId, 
        characterInText.toLowerCase(), 
        'clothing', 
        clothingItem, 
        clothingDescription, 
        pageNumber
      );
      
      console.log(`👕 New character clothing: ${characterInText} - ${clothingDescription}`);
    }
    
    // Process secondary character visual details
    while ((match = momVisualPattern.exec(text)) !== null) {
      const attribute = match[5];
      const descriptor = match[4] || 'default';
      const fullDescription = `${descriptor} ${attribute}`.trim();
      
      await this.saveVisualDetailToDatabase(sessionId, 'mom', 'appearance', attribute, fullDescription, pageNumber);
      console.log(`👩 Mom visual detail: ${fullDescription}`);
    }
    
    while ((match = dadVisualPattern.exec(text)) !== null) {
      const attribute = match[4];
      await this.saveVisualDetailToDatabase(sessionId, 'dad', 'appearance', attribute, attribute, pageNumber);
      console.log(`👨 Dad visual detail: ${attribute}`);
    }
    
    // Process enhanced object detection
    while ((match = colorSizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const color = match[2].toLowerCase();
      const object = match[3].toLowerCase();
      const fullDescription = `${size} ${color} ${object}`;
      
      await this.saveVisualDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`🎯 Enhanced object detail: ${fullDescription}`);
    }
    
    while ((match = colorPattern.exec(text)) !== null) {
      const color = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const fullDescription = `${color} ${object}`;
      
      await this.saveVisualDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`🎨 Color object detail: ${fullDescription}`);
    }
    
    while ((match = sizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const fullDescription = `${size} ${object}`;
      
      await this.saveVisualDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`📏 Size object detail: ${fullDescription}`);
    }
  }

  /**
   * Get colored objects for consistency
   */
  async getColoredObjects(sessionId) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return '';

      const { data, error } = await supabase
        .from('visual_details_cache')
        .select('detail_value')
        .eq('session_id', sessionId)
        .eq('detail_type', 'colored_object');

      if (error || !data) {
        return '';
      }

      const uniqueObjects = [...new Set(data.map(item => item.detail_value))];
      return uniqueObjects.join(', ');
    } catch (error) {
      console.error('Database error in getColoredObjects:', error);
      return '';
    }
  }

  /**
   * Get character clothing from database
   */
  async getCharacterClothing(sessionId, characterName) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return {};

      const { data, error } = await supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase())
        .eq('detail_type', 'clothing');

      if (error) {
        console.error('Error fetching character clothing:', error);
        return {};
      }

      const clothing = {};
      data?.forEach(detail => {
        clothing[detail.detail_key] = detail.detail_value;
      });

      console.log(`👕 Retrieved clothing for ${characterName}:`, clothing);
      return clothing;
    } catch (error) {
      console.error('Database error in getCharacterClothing:', error);
      return {};
    }
  }

  /**
   * Build clothing description for character prompt
   */
  async buildClothingDescription(sessionId, characterName) {
    const clothing = await this.getCharacterClothing(sessionId, characterName);
    
    if (Object.keys(clothing).length === 0) {
      return null;
    }
    
    const clothingItems = Object.values(clothing);
    return `wearing ${clothingItems.join(', ')}`;
  }

  /**
   * Get character appearance from story
   */
  async getCharacterAppearanceFromStory(sessionId, characterName = null) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return null;

      const query = supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId);

      if (characterName) {
        query.eq('character_name', characterName.toLowerCase());
      }

      const { data, error } = await query;

      if (error || !data) {
        return null;
      }

      const details = data.map(detail => 
        `${detail.character_name !== 'general' ? detail.character_name + ' ' : ''}${detail.detail_value}`
      );

      return details.join(', ');
    } catch (error) {
      console.error('Database error in getCharacterAppearanceFromStory:', error);
      return null;
    }
  }

  /**
   * Get session setting from previous pages
   */
  async getSessionSetting(sessionId) {
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('detail_type', 'setting')
        .eq('detail_key', 'location')
        .order('page_last_seen', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No previous setting found:', error.message);
        return null;
      }

      console.log(`🏠 Retrieved session setting: ${data.detail_value} from page ${data.page_last_seen}`);
      return data.detail_value;
    } catch (error) {
      console.error('Database error in getSessionSetting:', error);
      return null;
    }
  }

  /**
   * Enhanced get visual history with advanced filtering (PHASE 2 ENHANCEMENT)
   */
  async getVisualHistory(sessionId, characterName = null, filterOptions = {}) {
    console.log(`🎨 Getting visual history for session ${sessionId}${characterName ? ` (character: ${characterName})` : ''}`);
    
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return [];

      let query = supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false });

      // Enhanced filtering options
      if (characterName) {
        query = query.eq('character_name', characterName.toLowerCase());
      }
      
      if (filterOptions.detailType) {
        query = query.eq('detail_type', filterOptions.detailType);
      }
      
      if (filterOptions.pageRange) {
        const [startPage, endPage] = filterOptions.pageRange;
        query = query.gte('page_first_seen', startPage).lte('page_last_seen', endPage);
      }

      const { data, error } = await query.limit(filterOptions.limit || 50);
      
      if (error) {
        console.error('❌ Visual history fetch error:', error);
        return [];
      }
      
      console.log(`🎨 Retrieved ${data?.length || 0} visual history records`);
      return data || [];
      
    } catch (error) {
      console.error('Database error in getVisualHistory:', error);
      return [];
    }
  }

  /**
   * Enhanced get consistency recommendations with template intelligence (PHASE 2 ENHANCEMENT)  
   */
  async getConsistencyRecommendations(sessionId, characterName = null, context = {}) {
    console.log(`🔍 Generating consistency recommendations for session ${sessionId}`);
    
    try {
      // Get visual history
      const visualHistory = await this.getVisualHistory(sessionId, characterName);
      
      // Get stored detections
      const detections = await this.getStoredDetections(sessionId);
      
      // Analyze consistency patterns
      const recommendations = [];
      
      // Character appearance consistency
      if (characterName) {
        const characterHistory = visualHistory.filter(v => 
          v.character_name === characterName.toLowerCase()
        );
        const clothingChanges = characterHistory.filter(v => v.detail_type === 'clothing');
        
        if (clothingChanges.length > 1) {
          const uniqueOutfits = [...new Set(clothingChanges.map(c => c.detail_value))];
          if (uniqueOutfits.length > 2) {
            recommendations.push({
              type: 'consistency_warning',
              severity: 'medium',
              message: `${characterName} has worn ${uniqueOutfits.length} different outfits. Consider maintaining outfit consistency.`,
              suggestion: `Use "${uniqueOutfits[0]}" as the consistent outfit choice.`,
              consistencyScore: 0.6
            });
          }
        }
      }
      
      // Secondary character recommendations
      if (detections.secondaryCharacters?.length > 0) {
        const familyCharacters = detections.secondaryCharacters.filter(sc => 
          sc.relationship?.startsWith('family_')
        );
        
        if (familyCharacters.length > 0) {
          recommendations.push({
            type: 'family_consistency',
            severity: 'high',
            message: `Story includes family members: ${familyCharacters.map(fc => fc.name).join(', ')}`,
            suggestion: 'Ensure family resemblance is maintained across appearances.',
            consistencyScore: 0.9
          });
        }
      }
      
      // Cross-reference validation
      const crossRefIssues = this.validateCrossReferences(detections);
      recommendations.push(...crossRefIssues);
      
      const consistencyScore = recommendations.length === 0 ? 1.0 : 
        recommendations.reduce((sum, r) => sum + (r.consistencyScore || 0.5), 0) / recommendations.length;
      
      console.log(`🔍 Generated ${recommendations.length} consistency recommendations`);
      
      return {
        recommendations: recommendations.length > 0 
          ? recommendations.map(r => r.message || r.suggestion)
          : visualHistory.length > 0 
            ? [`Use established visual details for ${characterName || 'characters'}`]
            : [`No visual history found - building new details`],
        consistencyScore
      };
      
    } catch (error) {
      console.error('Error getting consistency recommendations:', error);
      return { recommendations: [], consistencyScore: 0.5 };
    }
  }

  /**
   * Validate cross-references between different detection types
   */
  validateCrossReferences(detections) {
    const issues = [];
    
    // Check for conflicting character relationships
    if (detections.relationships && detections.secondaryCharacters) {
      const relationshipNames = detections.relationships.map(r => r.target?.toLowerCase());
      const characterNames = detections.secondaryCharacters.map(sc => sc.name?.toLowerCase());
      
      const conflicts = relationshipNames.filter(rn => 
        rn && !characterNames.includes(rn) && !['you', 'we', 'they'].includes(rn)
      );
      
      if (conflicts.length > 0) {
        issues.push({
          type: 'cross_reference_conflict',
          severity: 'medium',
          message: `Relationship mentions "${conflicts.join(', ')}" but character(s) not detected.`,
          suggestion: 'Verify character detection or relationship parsing accuracy.',
          consistencyScore: 0.6
        });
      }
    }
    
    return issues;
  }

  /**
   * Track visual detail
   */
  async trackVisualDetail(detail) {
    const { user_id, character_name, session_id, page_number, image_url, visual_elements } = detail;
    
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('visual_details_cache')
        .insert({
          session_id,
          character_name: character_name.toLowerCase(),
          detail_type: 'tracked_visual',
          detail_key: 'image_url',
          detail_value: image_url,
          page_first_seen: page_number,
          page_last_seen: page_number,
          visual_elements: visual_elements
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking visual detail:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Database error in trackVisualDetail:', error);
      return null;
    }
  }

  // ============= SECONDARY CHARACTER DETECTION (consolidated from SecondaryElementDetector + UnifiedCharacterDescriptor) =============
  
  /**
   * Detect all secondary characters using comprehensive patterns
   */
  async detectAllCharacters(text, context = {}) {
    const { sessionId, pageNumber = 1, userInfo = {} } = context;
    
    if (!text || typeof text !== 'string') {
      return { animals: [], secondaryCharacters: [], relationships: [] };
    }

    try {
      // Use consolidated detection approach
      const results = await this.detectAndGenerateAllCharacters(text, { 
        sessionId, 
        pageNumber, 
        userInfo: context 
      });

      // Transform results to maintain backward compatibility
      const transformedResults = {
        animals: Object.values(results.animals || {}).flat(),
        secondaryCharacters: [...(results.humans?.family || []), ...(results.humans?.community || []), ...(results.humans?.authority || [])],
        relationships: results.humans ? Object.keys(results.humans).filter(key => results.humans[key].length > 0) : [],
        coloredObjects: results.coloredObjects || [],
        characterClothing: results.characterClothing || [],
        settings: Object.values(results.settings || {}).flat(),
        consistencyIssues: results.consistencyIssues || [],
        success: true
      };

      // Store detections for consistency
      if (sessionId) {
        await this.storeAllDetections(sessionId, pageNumber, results);
      }

      console.log(`🔍 CONSOLIDATED: Detected ${transformedResults.animals.length} animals, ${transformedResults.secondaryCharacters.length} secondary characters, ${transformedResults.coloredObjects.length} colored objects, ${transformedResults.characterClothing.length} character clothing items`);
      
      return transformedResults;

    } catch (error) {
      console.warn('⚠️ Detection error (non-blocking):', error.message);
      return { animals: [], secondaryCharacters: [], relationships: [], success: false, error: error.message };
    }
  }

  /**
   * CONSOLIDATED: Detect and generate all characters, objects, and settings in one pass
   * Replaces: detectSecondaryCharacters(), generateFamilyCharacter(), generateCommunityCharacter()  
   */
  async detectAndGenerateAllCharacters(storyText, context = {}) {
    const vocab = await this.getVocabulary();
    const { sessionId, pageNumber = 1 } = context;
    
    console.log(`🎯 CONSOLIDATED: Detecting all characters, objects, and settings for session ${sessionId}, page ${pageNumber}`);
    
    // Single pass detection with intelligent classification
    const allDetections = {
      humans: { 
        family: [],      // using vocab.relationships family patterns
        community: [],   // using vocab.relationships community patterns  
        authority: []    // teachers, doctors, etc.
      },
      animals: { 
        silent_pets: [],      // "Fluffy purred" (no dialogue)
        speaking_animals: [], // "Buddy said 'hello'" (has dialogue)
        narrative_animals: [], // "the wise owl watched" (story element)
        background_animals: [] // "birds chirping" (atmosphere)
      },
      coloredObjects: [],     // "red ball", "blue car" with consistency keys
      characterClothing: [],  // "Sally's blue dress", "Tom's green shirt"  
      settings: { 
        indoor: [],   // using vocab.settings indoor
        outdoor: [],  // using vocab.settings outdoor
        fantasy: []   // magical/imaginary settings
      }
    };
    
    // Enhanced colored object and clothing detection
    const colorClothingDetections = await this.detectColoredObjectsAndClothing(storyText, sessionId, pageNumber);
    allDetections.coloredObjects = colorClothingDetections.coloredObjects;
    allDetections.characterClothing = colorClothingDetections.characterClothing;
    
    // Human character detection with intelligent classification
    const humanPatterns = {
      // Family relationships
      family: ['mom', 'mother', 'mommy', 'mama', 'ma', 'dad', 'daddy', 'father', 'papa', 'pa', 'sister', 'sis', 'brother', 'bro', 'grandma', 'grandmother', 'nana', 'granny', 'grandpa', 'grandfather', 'gramps', 'aunt', 'auntie', 'uncle', 'cousin'],
      // Community relationships
      community: ['friend', 'buddy', 'pal', 'companion', 'best friend', 'bestie', 'classmate', 'teammate', 'neighbor', 'neighbour', 'playmate'],
      // Authority figures
      authority: ['teacher', 'instructor', 'tutor', 'coach', 'trainer', 'doctor', 'dr', 'nurse', 'principal', 'headmaster', 'librarian', 'babysitter', 'sitter', 'guide']
    };
    
    for (const [category, relationships] of Object.entries(humanPatterns)) {
      for (const relationship of relationships) {
        // Pattern: relationship + name (e.g., "friend Sarah", "teacher Ms. Johnson")
        const pattern = new RegExp(`\\b${relationship}\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)`, 'gi');
        const matches = [...storyText.matchAll(pattern)];
        
        for (const match of matches) {
          const characterName = match[1];
          const humanCharacter = {
            name: characterName,
            relationship: relationship,
            type: category,
            confidence: 0.9,
            pageFirst: pageNumber,
            pageLast: pageNumber
          };
          
          allDetections.humans[category].push(humanCharacter);
          
          // Generate character for consistency (consolidated approach)
          await this.generateCharacterForConsistency(category, relationship, characterName, storyText, sessionId, context.userInfo);
        }
      }
    }
    
    // Animal detection with enhanced classification  
    const animalClassificationPatterns = {
      silent_pets: [
        // Patterns for pets that don't speak
        /\b(\w+)\s+(?:purred|barked|meowed|chirped|squeaked|hopped|wagged|ran|sat|lay|slept|ate|played)\b/gi,
        /\bthe\s+(\w+)\s+(?:was|were)\s+(?:sleeping|eating|playing|sitting|lying)\b/gi
      ],
      speaking_animals: [
        // Patterns for animals that talk
        /\b(\w+)\s+(?:said|asked|replied|answered|called|shouted|whispered|exclaimed)\b/gi,
        /["']([^"']*?)["']\s+(?:said|asked)\s+(\w+)/gi
      ],
      narrative_animals: [
        // Animals as story elements
        /\bthe\s+(?:wise|old|ancient|magical|mysterious)\s+(\w+)/gi,
        /\ba\s+(?:talking|friendly|helpful|kind)\s+(\w+)/gi
      ],
      background_animals: [
        // Atmospheric animals
        /\b(\w+s?)\s+(?:chirping|singing|buzzing|flying|swimming)\s+(?:in|near|around)/gi,
        /\bsounds?\s+of\s+(\w+)/gi
      ]
    };
    
    for (const [classification, patterns] of Object.entries(animalClassificationPatterns)) {
      for (const pattern of patterns) {
        const matches = [...storyText.matchAll(pattern)];
        for (const match of matches) {
          const animalName = match[1];
          // Check if it's actually an animal from our vocabulary
          if (vocab.animals.some(animal => animalName.toLowerCase().includes(animal) || animal.includes(animalName.toLowerCase()))) {
            const animalData = {
              name: animalName,
              species: vocab.animals.find(animal => animalName.toLowerCase().includes(animal) || animal.includes(animalName.toLowerCase())),
              classification: classification,
              confidence: 0.8,
              pageFirst: pageNumber,
              pageLast: pageNumber
            };
            
            allDetections.animals[classification].push(animalData);
          }
        }
      }
    }
    
    // Settings detection using comprehensive vocabulary
    const settingPatterns = {
      indoor: vocab.settings.filter(s => ['room', 'kitchen', 'bedroom', 'bathroom', 'school', 'classroom', 'house', 'home', 'building', 'store', 'library', 'hospital'].some(indoor => s.includes(indoor))),
      outdoor: vocab.settings.filter(s => ['park', 'playground', 'garden', 'beach', 'forest', 'field', 'street', 'outside'].some(outdoor => s.includes(outdoor))),
      fantasy: ['castle', 'palace', 'tower', 'dungeon', 'magical', 'enchanted', 'fairy', 'dragon', 'wizard', 'witch']
    };
    
    for (const [category, settings] of Object.entries(settingPatterns)) {
      for (const setting of settings) {
        const pattern = new RegExp(`\\b${setting}\\b`, 'gi');
        const matches = storyText.match(pattern);
        if (matches) {
          allDetections.settings[category].push(...matches.map(match => ({
            location: match,
            category: category,
            confidence: 0.7,
            pageFirst: pageNumber,
            pageLast: pageNumber
          })));
        }
      }
    }
    
    // Consistency validation
    const consistencyIssues = await this.validateColorConsistency(sessionId, colorClothingDetections);
    
    // Single database write for all results
    await this.storeAllDetections(sessionId, pageNumber, allDetections);
    
    console.log(`🎯 CONSOLIDATED: Detection complete`, {
      family: allDetections.humans.family.length,
      community: allDetections.humans.community.length, 
      authority: allDetections.humans.authority.length,
      coloredObjects: allDetections.coloredObjects.length,
      characterClothing: allDetections.characterClothing.length,
      animals: Object.values(allDetections.animals).flat().length,
      settings: Object.values(allDetections.settings).flat().length,
      consistencyIssues: consistencyIssues.length
    });
    
    return { ...allDetections, consistencyIssues };
  }

  /**
   * Generate character for consistency (consolidates family and community generation)
   */
  async generateCharacterForConsistency(category, relationship, characterName, context, sessionId, userInfo = null) {
    const cacheKey = `${category}_${characterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Check for existing character
    const existing = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (existing) {
      console.log(`🎭 Using cached ${category} character: ${characterName}`);
      return existing;
    }
    
    // Generate new character based on category
    let characterData;
    
    if (category === 'family') {
      // Family characters get genetic similarity to main character
      characterData = await this.generateFamilyCharacterData(relationship, characterName, context, sessionId, userInfo);
    } else {
      // Community/authority characters get role-appropriate appearance
      characterData = await this.generateCommunityCharacterData(relationship, characterName, context, sessionId, userInfo);
    }
    
    // Save for consistency
    await this.saveCharacterToDatabase(sessionId, cacheKey, characterData);
    
    return characterData;
  }
    const secondaryCharacters = [];
    
    // Generate all pattern combinations for comprehensive relationship detection
    const allPatterns = [];
    
    const vocab = await this.getVocabulary();
    vocab.relationships.forEach(relationship => {
        // Direct Relationship + Name (e.g., "friend Apple", "teacher Ms. Johnson")
        allPatterns.push({
          pattern: new RegExp(`\\b(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: 'secondary',
          patternType: 'direct',
          relationship: relationship
        });
        
        // Possessive Pronouns + Relationship + Name (e.g., "my friend Apple")
        allPatterns.push({
          pattern: new RegExp(`\\b(?:my|your|his|her|their|our)\\s+(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_pronoun',
          relationship: relationship
        });
        
        // Possessive Forms (e.g., "Apple's mom")
        allPatterns.push({
          pattern: new RegExp(`\\b([A-Z][a-z]{1,14})'?s\\s+(${relationship})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_form',
          relationship: relationship
        });
      });
    });
    
    // Dialogue Attribution (e.g., '"Hello," said Apple')
    allPatterns.push({
      pattern: /["']([^"']+)["'][,.]?\s+(?:said|asked|called|whispered|shouted|replied|answered)\s+([A-Z][a-z]{1,14})/gi,
      type: 'dialogue_attribution',
      patternType: 'dialogue',
      relationship: 'speaker'
    });
    
    // Coordinated Names (e.g., "Apple and Sequoia")
    allPatterns.push({
      pattern: /\b([A-Z][a-z]{1,14})\s+and\s+([A-Z][a-z]{1,14})/gi,
      type: 'coordinated_names',
      patternType: 'coordination',
      relationship: 'companion'
    });
    
    // Process all patterns
    allPatterns.forEach(({ pattern, type, patternType, relationship }) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        let names = [];
        let fullContext = '';
        
        // Extract names based on pattern type
        if (patternType === 'direct' || patternType === 'possessive_pronoun') {
          names = [match[2]];
          fullContext = `${relationship} ${match[2]}`;
        } else if (patternType === 'possessive_form') {
          names = [match[1]];
          fullContext = `${match[1]}'s ${relationship}`;
        } else if (patternType === 'dialogue') {
          names = [match[2]];
          fullContext = `speaker ${match[2]}`;
        } else if (patternType === 'coordination') {
          names = [match[1], match[2]];
          fullContext = `${match[1]} and ${match[2]}`;
        }
        
        // Process each detected name
        names.forEach(name => {
          const nameLower = name.toLowerCase();
          
          // Skip if already detected
          if (secondaryCharacters.find(c => c.name === nameLower)) return;
          
          // Apply smart name validation
          if (!this.isValidName(name, fullContext)) return;
          
          // Create character entry with disambiguation
          const character = {
            name: nameLower,
            displayName: name,
            type: type,
            category: 'secondary_character',
            needsConsistency: true,
            relationshipType: this.getRelationshipCategory(type),
            fullContext: fullContext,
            patternType: patternType,
            relationship: relationship,
            disambiguation: this.generateDisambiguation(name, relationship, type)
          };
          
          secondaryCharacters.push(character);
        });
      });
    });
    
    return secondaryCharacters;
  }

  /**
   * Enhanced animal detection with species disambiguation
   */
  detectAnimals(text, context) {
    const detectedAnimals = [];
    const { userInfo = {} } = context;

    // Get all animal categories
    const allAnimals = [
      'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'turtle', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'duck',
      'bear', 'lion', 'tiger', 'elephant', 'monkey'
    ];

    // Enhanced animal detection patterns
    const animalPatterns = [
      new RegExp(`\\b(${allAnimals.join('|')})s?\\b`, 'gi'),
      /\b(my|his|her|their)\s+(pet|dog|cat|rabbit|hamster|bird|fish)\b/gi,
      new RegExp(`\\b(big|small|little|tiny|fluffy|friendly|cute)\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      new RegExp(`\\b(red|blue|green|yellow|purple|pink|orange|black|white|brown|gray|grey|gold|silver)\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      new RegExp(`\\b(${allAnimals.join('|')})s?\\s+(runs?|jumps?|plays?|sleeps?|eats?|walks?)\\b`, 'gi')
    ];

    // Process each pattern
    animalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const animalMention = this.normalizeAnimalMention(match[0]);
        const animalType = this.identifyAnimalType(animalMention, allAnimals);
        
        if (animalType && !detectedAnimals.find(a => a.name === animalType)) {
          detectedAnimals.push({
            name: animalType,
            mention: animalMention,
            category: this.categorizeAnimal(animalType),
            attributes: this.extractAnimalAttributes(match[0]),
            position: match.index,
            confidence: this.calculateConfidence(match[0], text)
          });
        }
      }
    });

    // Add user's favorite animal if not detected
    if (userInfo.favoriteAnimal && !detectedAnimals.find(a => a.name === userInfo.favoriteAnimal)) {
      detectedAnimals.push({
        name: userInfo.favoriteAnimal,
        mention: userInfo.favoriteAnimal,
        category: this.categorizeAnimal(userInfo.favoriteAnimal),
        attributes: { favorite: true },
        position: -1,
        confidence: 0.9
      });
    }

    return detectedAnimals.slice(0, 10);
  }

  /**
   * Detect character animals with species disambiguation
   */
  detectCharacterAnimals(originalText, lowercaseText) {
    const characterAnimals = [];
    
    // Define comprehensive animal patterns with species recognition
    const animalPatterns = [
      { pattern: /\b([A-Z][a-z]{1,14})\s+(?:the\s+)?(\w+)/gi, nameFirst: true },
      { pattern: /\b(?:my|your|his|her|their|our)\s+(\w+)\s+([A-Z][a-z]{1,14})/gi, nameFirst: false },
      { pattern: /\b(\w+)\s+([A-Z][a-z]{1,14})'?s/gi, nameFirst: false },
      { pattern: /["']([^"']+)["'][,.]?\s+(?:barked|meowed|chirped|squeaked|roared|growled|purred|neighed)\s+([A-Z][a-z]{1,14})/gi, nameFirst: false, isDialogue: true }
    ];
    
    // Process animal patterns
    animalPatterns.forEach(({ pattern, nameFirst, isDialogue }) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        let animalName, potentialSpecies;
        
        if (nameFirst) {
          animalName = match[1];
          potentialSpecies = match[2];
        } else {
          potentialSpecies = match[1];
          animalName = match[2];
        }
        
        // Validate if the potential species is actually an animal
        const animalSpecies = this.validateAnimalSpecies(potentialSpecies.toLowerCase());
        if (!animalSpecies) return;
        
        // Apply name validation
        if (!this.isValidName(animalName, `pet ${animalSpecies}`)) return;
        
        const key = `${animalName.toLowerCase()}_${animalSpecies}`;
        
        // Skip if already detected
        if (characterAnimals.find(a => a.key === key)) return;
        
        const animal = {
          name: animalName.toLowerCase(),
          displayName: animalName,
          species: animalSpecies,
          key: key,
          type: 'character_animal',
          category: 'character_animal',
          needsConsistency: true,
          hasDialogue: isDialogue || false,
          fullContext: `pet ${animalSpecies} ${animalName}`,
          disambiguation: `${animalName} (a pet ${animalSpecies}, not an object named ${animalName.toLowerCase()})`
        };
        
        characterAnimals.push(animal);
      });
    });
    
    return characterAnimals;
  }

  /**
   * Detect relationship patterns
   */
  detectRelationships(text, context) {
    const relationships = [];

    const relationshipPatterns = [
      /\b(my|his|her|their)\s+(pet|dog|cat|rabbit|hamster|bird|fish)\b/gi,
      /\b(my|his|her)\s+(mom|dad|sister|brother|family)\b/gi,
      /\b(my|his|her)\s+(friend|buddy|pal)\b/gi,
      /\bwith\s+(my|his|her|their)\s+(mom|dad|friend|pet|dog|cat)\b/gi
    ];

    relationshipPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const possessive = match[1];
        const target = match[2];
        
        relationships.push({
          type: this.classifyRelationship(target),
          possessive,
          target,
          mention: match[0],
          position: match.index,
          confidence: 0.8
        });
      }
    });

    return relationships.slice(0, 10);
  }

  // ============= SECONDARY CHARACTER GENERATION =============
  
  /**
   * Generate secondary character for relationship consistency
   */
  async generateSecondaryCharacter(type, details, userInfo, sessionId) {
    const secondaryName = details.name || `${type}_character`;
    const cacheKey = `${sessionId}_secondary_${secondaryName}`;
    
    // Check database first
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      console.log(`🎭 CACHED: Using existing secondary character ${secondaryName} (seed: ${cached.seed})`);
      return cached;
    }
    
    // Generate new secondary character with seed consistency
    const characterSpecificSeed = `secondary_${secondaryName}_${sessionId}`;
    const seed = this.generateStableSeed(characterSpecificSeed, secondaryName);
    
    // Generate basic description for secondary character
    const characterDescription = this.generateSecondaryCharacterDescription(secondaryName, type, seed);
    
    const secondaryData = {
      seed,
      characterDescription,
      relationshipType: type,
      name: secondaryName,
      characterType: 'secondary',
      generatedAt: Date.now()
    };
    
    // Save to database
    await this.saveCharacterToDatabase(sessionId, cacheKey, secondaryData);
    
    console.log(`🎭 FRESH: Generated new secondary character ${secondaryName} (seed: ${seed})`);
    return secondaryData;
  }

  /**
   * Get or create secondary character seed for consistency
   */
  async getSecondaryCharacterSeed(sessionId, characterName, characterType = 'secondary_character', userInfo = null) {
    const characterKey = `secondary_${characterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    try {
      // Check database first
      const existingSeed = await this.getCharacterFromDatabase(sessionId, characterKey);
      if (existingSeed && existingSeed.seed) {
        console.log(`🔄 Secondary character seed retrieved from database: ${characterName} (${existingSeed.seed})`);
        return existingSeed;
      }
      
      // Generate new seed if not found
      const characterSpecificSeed = `secondary_${characterName}_${sessionId}_${characterType}`;
      const newSeed = this.generateStableSeed(characterSpecificSeed, characterName);
      
      // Generate enhanced description
      const characterDescription = this.generateSecondaryCharacterDescription(characterName, characterType, newSeed, userInfo, sessionId);
      
      // Store in database for consistency
      const secondaryData = {
        seed: newSeed,
        characterDescription,
        name: characterName,
        characterType: 'secondary',
        relationshipType: characterType,
        created_at: new Date().toISOString(),
        enhanced: true
      };
      
      await this.saveCharacterToDatabase(sessionId, characterKey, secondaryData);
      
      console.log(`✨ Enhanced secondary character seed generated and stored: ${characterName} (${newSeed}) with type: ${characterType}`);
      return secondaryData;
      
    } catch (error) {
      console.error(`❌ Secondary character seed error for ${characterName}:`, error);
      // Fallback: generate deterministic seed without database
      const fallbackSeed = this.generateStableSeed(sessionId + characterName + characterType, characterName);
      return {
        seed: fallbackSeed,
        characterDescription: this.generateSecondaryCharacterDescription(characterName, characterType, fallbackSeed, userInfo, sessionId),
        name: characterName,
        characterType: 'secondary'
      };
    }
  }

  /**
   * Generate description for secondary character
   */
  generateSecondaryCharacterDescription(characterName, characterType, seed, userInfo = null, sessionId = null) {
    const seededRandom = this.createSeededRandom(seed);
    
    // Basic character traits based on relationship type
    let baseDescription = '';
    
    if (characterType.includes('family')) {
      baseDescription = `${characterName} is a loving family member`;
    } else if (characterType.includes('community')) {
      baseDescription = `${characterName} is a friendly community member`;
    } else if (characterType.includes('authority')) {
      baseDescription = `${characterName} is a helpful authority figure`;
    } else {
      baseDescription = `${characterName} is a nice person`;
    }
    
    // Add some randomized traits for consistency
    const traits = ['kind', 'helpful', 'friendly', 'caring', 'patient', 'gentle'];
    const selectedTrait = traits[Math.floor(seededRandom() * traits.length)];
    
    return `${baseDescription}, ${selectedTrait} and reliable`;
  }

  // ============= UTILITY METHODS =============
  
  /**
   * Validate if a potential species matches common animals
   */
  validateAnimalSpecies(species) {
    const commonAnimals = [
      'dog', 'cat', 'puppy', 'kitten', 'rabbit', 'bunny', 'hamster', 'guinea pig',
      'bird', 'parrot', 'canary', 'fish', 'goldfish', 'turtle', 'lizard', 'snake',
      'horse', 'pony', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose',
      'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'rabbit',
      'squirrel', 'mouse', 'rat', 'frog', 'butterfly', 'bee', 'spider'
    ];
    
    return commonAnimals.includes(species) ? species : null;
  }

  /**
   * Smart name validation with context awareness
   */
  isValidName(name, context) {
    // Basic validation
    if (!name || name.length < 2 || name.length > 15) return false;
    if (!/^[A-Z][a-z]+$/.test(name)) return false;
    
    // Filter out obvious non-names
    const nonNames = ['The', 'And', 'But', 'For', 'With', 'Very', 'So', 'Then', 'Now', 'Here', 'There'];
    if (nonNames.includes(name)) return false;
    
    // Filter out days and months
    const timeWords = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'];
    if (timeWords.includes(name)) return false;
    
    return true;
  }

  /**
   * Generate disambiguation context for names that could be objects
   */
  generateDisambiguation(name, relationship, type) {
    const nameLower = name.toLowerCase();
    
    // Check if this name could be confused with a common object
    if (COMMON_WORD_NAMES.includes(nameLower)) {
      const relationshipCategory = this.getRelationshipCategory(type);
      return `${name} (a ${relationshipCategory} named ${name}, not the ${nameLower})`;
    }
    
    return null;
  }

  /**
   * Get relationship category for disambiguation
   */
  getRelationshipCategory(type) {
    if (type.startsWith('family_')) return 'family member';
    if (type.startsWith('community_')) return 'friend';
    if (type.startsWith('authority_')) return 'authority figure';
    return 'person';
  }

  /**
   * Helper methods for animal detection
   */
  normalizeAnimalMention(mention) {
    return mention.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  identifyAnimalType(mention, allAnimals) {
    for (const animal of allAnimals) {
      if (mention.includes(animal)) {
        return animal;
      }
    }
    return null;
  }

  categorizeAnimal(animalType) {
    const farmAnimals = ['cow', 'pig', 'sheep', 'chicken', 'duck', 'horse'];
    const pets = ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish'];
    const wildAnimals = ['bear', 'lion', 'tiger', 'elephant', 'monkey'];
    
    if (pets.includes(animalType)) return 'pet';
    if (farmAnimals.includes(animalType)) return 'farm';
    if (wildAnimals.includes(animalType)) return 'wild';
    return 'unknown';
  }

  extractAnimalAttributes(match) {
    const attributes = {};
    
    if (match.includes('big') || match.includes('large')) attributes.size = 'big';
    if (match.includes('small') || match.includes('little') || match.includes('tiny')) attributes.size = 'small';
    if (match.includes('fluffy')) attributes.texture = 'fluffy';
    if (match.includes('friendly')) attributes.personality = 'friendly';
    if (match.includes('cute')) attributes.appearance = 'cute';
    
    return attributes;
  }

  calculateConfidence(match, fullText) {
    // Simple confidence calculation based on context
    let confidence = 0.5;
    
    if (match.includes('my') || match.includes('pet')) confidence += 0.3;
    if (fullText.split(match)[1]?.substring(0, 50).includes('played') || 
        fullText.split(match)[1]?.substring(0, 50).includes('ran')) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  classifyRelationship(target) {
    if (['pet', 'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish'].includes(target)) return 'pet';
    if (['mom', 'dad', 'sister', 'brother', 'family'].includes(target)) return 'family';
    if (['friend', 'buddy', 'pal'].includes(target)) return 'social';
    return 'unknown';
  }

  /**
   * Enhanced store detections with database persistence (PHASE 1 RECOVERY)
   */
  async storeDetections(sessionId, pageNumber, results) {
    const cacheKey = `${sessionId}_${pageNumber}`;
    
    // Store in memory cache
    this.visualDetailCache.set(cacheKey, {
      animals: results.animals || [],
      secondaryCharacters: results.secondaryCharacters || [],
      relationships: results.relationships || [],
      coloredObjects: results.coloredObjects || [],
      clothing: results.clothing || [],
      settings: results.settings || [],
      timestamp: Date.now()
    });
    
    // NEW: Database persistence for cross-session consistency
    try {
      await this.saveDetectionResultsToDatabase(sessionId, pageNumber, results);
    } catch (error) {
      console.warn('Failed to persist detection results to database:', error);
    }
    
    // Limit cache size to prevent memory bloat
    if (this.visualDetailCache.size > 100) {
      const firstKey = this.visualDetailCache.keys().next().value;
      this.visualDetailCache.delete(firstKey);
    }
  }

  /**
   * Save detection results to database (NEW FUNCTION)
   */
  async saveDetectionResultsToDatabase(sessionId, pageNumber, results) {
    const supabase = await this.getSupabaseClient();
    if (!supabase) return;

    const detectionTypes = ['animals', 'secondaryCharacters', 'relationships', 'coloredObjects', 'clothing', 'settings'];
    
    for (const type of detectionTypes) {
      const items = results[type] || [];
      for (const item of items) {
        const detailKey = typeof item === 'string' ? item : (item.name || item.type || 'unknown');
        const detailValue = typeof item === 'string' ? item : JSON.stringify(item);
        
        await this.saveVisualDetailToDatabase(
          sessionId,
          'main_character', // Default character
          type,
          detailKey,
          detailValue,
          pageNumber
        );
      }
    }
  }

  /**
   * Get stored detections (MISSING FUNCTION - PHASE 1 RECOVERY)
   */
  async getStoredDetections(sessionId, pageNumber = null) {
    // Check memory cache first
    if (pageNumber) {
      const cacheKey = `${sessionId}_${pageNumber}`;
      const cached = this.visualDetailCache.get(cacheKey);
      if (cached) {
        console.log(`📋 Retrieved cached detections for page ${pageNumber}`);
        return cached;
      }
    }

    // Retrieve from database
    try {
      const supabase = await this.getSupabaseClient();
      if (!supabase) return this.getEmptyDetectionResults();

      let query = supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId);

      if (pageNumber) {
        query = query.or(`page_first_seen.eq.${pageNumber},page_last_seen.eq.${pageNumber}`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error retrieving stored detections:', error);
        return this.getEmptyDetectionResults();
      }

      // Aggregate results by detection type
      const results = this.getEmptyDetectionResults();
      
      data?.forEach(record => {
        const type = record.detail_type;
        if (results[type]) {
          try {
            const value = record.detail_value.startsWith('{') || record.detail_value.startsWith('[')
              ? JSON.parse(record.detail_value)
              : record.detail_value;
            results[type].push(value);
          } catch (e) {
            results[type].push(record.detail_value);
          }
        }
      });

      console.log(`📋 Retrieved ${data?.length || 0} stored detections from database`);
      return results;
      
    } catch (error) {
      console.error('Failed to get stored detections:', error);
      return this.getEmptyDetectionResults();
    }
  }

  /**
   * Get empty detection results structure
   */
  getEmptyDetectionResults() {
    return {
      animals: [],
      secondaryCharacters: [],  
      relationships: [],
      coloredObjects: [],
      clothing: [],
      settings: [],
      timestamp: Date.now()
    };
  }

  /**
   * Clear detections with granular control (MISSING FUNCTION - PHASE 1 RECOVERY)
   */
  async clearDetections(sessionId, detectionType = null) {
    console.log(`🧹 Clearing detections for session ${sessionId}${detectionType ? ` (type: ${detectionType})` : ''}`);
    
    try {
      const supabase = await this.getSupabaseClient();
      if (supabase) {
        let query = supabase
          .from('visual_details_cache')
          .delete()
          .eq('session_id', sessionId);
          
        if (detectionType) {
          query = query.eq('detail_type', detectionType);
        }
        
        await query;
      }
      
      // Clear memory cache
      if (detectionType) {
        // Clear specific type from memory cache
        for (const [key, value] of this.visualDetailCache) {
          if (key.startsWith(sessionId)) {
            if (value[detectionType]) {
              value[detectionType] = [];
              this.visualDetailCache.set(key, value);
            }
          }
        }
      } else {
        // Clear all for session
        for (const [key] of this.visualDetailCache) {
          if (key.startsWith(sessionId)) {
            this.visualDetailCache.delete(key);
          }
        }
      }
      
      console.log(`✅ Cleared detections successfully`);
    } catch (error) {
      console.error(`❌ Failed to clear detections:`, error);
    }
  }

  // ============= MISSING CRITICAL FUNCTIONS - PHASE 1 RECOVERY =============

  /**
   * Generate family character data with genetic similarity
   */
  async generateFamilyCharacterData(relationship, characterName, context, sessionId, userInfo = null) {
    console.log(`👨‍👩‍👧‍👦 Generating family character: ${characterName} (${relationship})`);
    
    const cacheKey = `family_${characterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Check for existing family character
    const existing = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (existing) {
      console.log(`👨‍👩‍👧‍👦 Using cached family character: ${characterName}`);
      return existing;
    }
    
    // Get main character data for family resemblance
    const mainCharacterKey = `${sessionId}_${userInfo?.avatarIdentity?.name || 'child'}`;
    const mainCharacter = await this.getCharacterFromDatabase(sessionId, mainCharacterKey);
    
    // Generate family-specific seed
    const familySpecificSeed = `family_${relationship}_${characterName}_${sessionId}`;
    const seed = this.generateStableSeed(familySpecificSeed, characterName);
    const seededRandom = this.createSeededRandom(seed);
    
    // Family resemblance logic - share some traits with main character
    const baseTraits = mainCharacter ? {
      skinTone: mainCharacter.avatarIdentity?.skinTone || 'medium',
      selectedCulturalFeatures: mainCharacter.selectedCulturalFeatures,
      selectedCulturalHair: this.generateFamilyHairVariation(mainCharacter.selectedCulturalHair, relationship, seededRandom)
    } : {
      skinTone: 'medium',
      selectedCulturalFeatures: null,
      selectedCulturalHair: null
    };
    
    // Role-specific appearance generation
    const familyDescription = this.generateFamilyDescription(relationship, characterName, seed, baseTraits);
    
    const familyData = {
      seed,
      characterDescription: familyDescription,
      name: characterName,
      characterType: 'family',
      relationshipType: relationship,
      familyResemblance: {
        sharedSkinTone: baseTraits.skinTone,
        sharedCulturalFeatures: baseTraits.selectedCulturalFeatures,
        hairVariation: baseTraits.selectedCulturalHair
      },
      generatedAt: Date.now(),
      enhanced: true
    };
    
    // Save for consistency
    await this.saveCharacterToDatabase(sessionId, cacheKey, familyData);
    
    console.log(`👨‍👩‍👧‍👦 Generated family character: ${characterName} with resemblance to main character`);
    return familyData;
  }

  /**
   * Generate community character data with role-appropriate appearance  
   */
  async generateCommunityCharacterData(role, characterName, context, sessionId, userInfo = null) {
    console.log(`👥 Generating community character: ${characterName} (${role})`);
    
    const cacheKey = `community_${characterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Check for existing community character
    const existing = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (existing) {
      console.log(`👥 Using cached community character: ${characterName}`);
      return existing;
    }
    
    // Generate role-specific seed
    const communitySpecificSeed = `community_${role}_${characterName}_${sessionId}`;
    const seed = this.generateStableSeed(communitySpecificSeed, characterName);
    
    // Role-based appearance generation
    const communityDescription = this.generateCommunityDescription(role, characterName, seed, context);
    
    const communityData = {
      seed,
      characterDescription: communityDescription,
      name: characterName,
      characterType: 'community',
      relationshipType: role,
      roleBasedTraits: this.getRoleBasedTraits(role),
      generatedAt: Date.now(),
      enhanced: true
    };
    
    // Save for consistency
    await this.saveCharacterToDatabase(sessionId, cacheKey, communityData);
    
    console.log(`👥 Generated community character: ${characterName} with role-appropriate traits`);
    return communityData;
  }

  /**
   * Generate family hair variation (maintains resemblance but age-appropriate)
   */
  generateFamilyHairVariation(mainCharacterHair, relationship, seededRandom) {
    if (!mainCharacterHair) return null;
    
    const parentRelationships = ['family_mother', 'family_father', 'family_grandmother', 'family_grandfather'];
    const siblingRelationships = ['family_sister', 'family_brother'];
    
    if (parentRelationships.includes(relationship)) {
      // Parents: similar base but more mature styling
      const matureVariations = {
        'curly brown hair': 'elegant curly brown hair',
        'straight black hair': 'professional straight black hair',
        'wavy blonde hair': 'styled wavy blonde hair'
      };
      return matureVariations[mainCharacterHair] || mainCharacterHair;
    } else if (siblingRelationships.includes(relationship)) {
      // Siblings: very similar with minor variations
      const siblingVariations = {
        'curly brown hair': 'slightly curly brown hair',
        'straight black hair': 'smooth straight black hair',
        'wavy blonde hair': 'gently wavy blonde hair'
      };
      return siblingVariations[mainCharacterHair] || mainCharacterHair;
    }
    
    return mainCharacterHair; // Default: same hair
  }

  /**
   * Generate family-specific description
   */
  generateFamilyDescription(relationship, characterName, seed, baseTraits) {
    const seededRandom = this.createSeededRandom(seed);
    
    const familyRoleDescriptions = {
      family_mother: `${characterName} is a loving mother with gentle eyes and a warm smile`,
      family_father: `${characterName} is a caring father with strong, kind features`,
      family_sister: `${characterName} is a playful sister with bright, curious eyes`,
      family_brother: `${characterName} is an energetic brother with a mischievous grin`,
      family_grandmother: `${characterName} is a wise grandmother with soft, caring features`,
      family_grandfather: `${characterName} is a gentle grandfather with kind, twinkling eyes`,
      family_aunt: `${characterName} is a fun-loving aunt with an animated expression`,
      family_uncle: `${characterName} is a friendly uncle with a hearty laugh`
    };
    
    const baseDescription = familyRoleDescriptions[relationship] || `${characterName} is a loving family member`;
    
    // Add family resemblance note
    const resemblanceNote = baseTraits.skinTone !== 'medium' 
      ? `, sharing the family's ${baseTraits.skinTone} skin tone`
      : '';
    
    return baseDescription + resemblanceNote;
  }

  /**
   * Generate community-specific description  
   */
  generateCommunityDescription(role, characterName, seed, context) {
    const seededRandom = this.createSeededRandom(seed);
    
    const communityRoleDescriptions = {
      authority_teacher: `${characterName} is a dedicated teacher with professional attire and encouraging smile`,
      authority_coach: `${characterName} is an enthusiastic coach with athletic wear and motivating presence`,
      authority_doctor: `${characterName} is a caring doctor with medical attire and reassuring demeanor`,
      authority_nurse: `${characterName} is a compassionate nurse with scrubs and gentle manner`,
      authority_librarian: `${characterName} is a knowledgeable librarian with neat appearance and helpful attitude`,
      community_friend: `${characterName} is a cheerful friend with casual clothes and bright smile`,
      community_classmate: `${characterName} is a friendly classmate with school appropriate attire`,
      community_neighbor: `${characterName} is a kind neighbor with welcoming appearance`,
      community_teammate: `${characterName} is a supportive teammate with team colors and encouraging spirit`
    };
    
    return communityRoleDescriptions[role] || `${characterName} is a helpful community member`;
  }

  /**
   * Get role-based traits for community characters
   */
  getRoleBasedTraits(role) {
    const roleTraits = {
      authority_teacher: { formality: 'professional', trustworthiness: 'high', approachability: 'medium' },
      authority_coach: { formality: 'casual', energy: 'high', supportiveness: 'high' },
      authority_doctor: { formality: 'professional', trustworthiness: 'high', calmness: 'high' },
      community_friend: { formality: 'casual', friendliness: 'high', similarity: 'peer' },
      community_classmate: { formality: 'casual', age: 'peer', relatability: 'high' },
      community_neighbor: { formality: 'casual', familiarity: 'medium', helpfulness: 'high' }
    };
    
    return roleTraits[role] || { formality: 'casual', friendliness: 'medium' };
  }
  
  /**
   * Clear session data
   */
  async clearSession(sessionId) {
    console.log(`🧹 Clearing session data for ${sessionId}`);
    
    try {
      const supabase = await this.getSupabaseClient();
      if (supabase) {
        // Clear from character_consistency_cache
        await supabase
          .from('character_consistency_cache')
          .delete()
          .eq('session_id', sessionId);
        
        // Clear from visual_details_cache
        await supabase
          .from('visual_details_cache')
          .delete()
          .eq('session_id', sessionId);
      }
      
      // Clear memory cache
      for (const [key] of this.visualDetailCache) {
        if (key.startsWith(sessionId)) {
          this.visualDetailCache.delete(key);
        }
      }
      
      console.log(`✅ Session ${sessionId} cleared successfully`);
    } catch (error) {
      console.error(`❌ Failed to clear session ${sessionId}:`, error);
    }
  }

  /**
   * Clear server state (legacy compatibility)
   */
  clearServerState() {
    this.visualDetailCache.clear();
    console.log('🧹 Server state cleared');
  }
}

// Export singleton instance
export const characterConsistencyService = CharacterConsistencyService.getInstance();
export { CharacterConsistencyService };