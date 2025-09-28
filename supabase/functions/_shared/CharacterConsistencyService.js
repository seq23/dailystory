/**
 * UNIFIED CHARACTER CONSISTENCY SERVICE - COMPLETE CONSOLIDATION
 * Combines all character generation, visual tracking, secondary detection, and persistence
 * Single source of truth for all character-related functionality
 */

import { safeErrorMessage } from './errorPatterns.ts';

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

// ============= COMPREHENSIVE RELATIONSHIP PATTERNS (consolidated from all sources) =============
const RELATIONSHIP_PATTERNS = {
  // Core Family (8 types)
  family_mother: ['mom', 'mother', 'mommy', 'mama', 'ma'],
  family_father: ['dad', 'father', 'daddy', 'papa', 'pa'],
  family_sister: ['sister', 'sis'],
  family_brother: ['brother', 'bro'],
  family_grandmother: ['grandma', 'grandmother', 'nana', 'granny'],
  family_grandfather: ['grandpa', 'grandfather', 'papa', 'gramps'],
  family_aunt: ['aunt', 'auntie'],
  family_uncle: ['uncle'],
  
  // Extended Family (7 types)
  family_cousin: ['cousin'],
  family_nephew: ['nephew'],
  family_niece: ['niece'],
  family_stepmother: ['stepmother', 'stepmom'],
  family_stepfather: ['stepfather', 'stepdad'],
  family_stepsister: ['stepsister'],
  family_stepbrother: ['stepbrother'],
  
  // Friends & Peers (6 types)
  community_friend: ['friend', 'buddy', 'pal', 'companion'],
  community_best_friend: ['best friend', 'bestie'],
  community_classmate: ['classmate'],
  community_teammate: ['teammate'],
  community_neighbor: ['neighbor', 'neighbour'],
  community_playmate: ['playmate'],
  
  // Authority Figures (8 types)
  authority_teacher: ['teacher', 'instructor', 'tutor'],
  authority_coach: ['coach', 'trainer'],
  authority_doctor: ['doctor', 'dr'],
  authority_nurse: ['nurse'],
  authority_principal: ['principal', 'headmaster'],
  authority_librarian: ['librarian'],
  authority_babysitter: ['babysitter', 'sitter'],
  authority_guide: ['guide']
};

// Common words that can be names (for disambiguation)
const COMMON_WORD_NAMES = [
  'apple', 'sage', 'river', 'hope', 'grace', 'faith', 'rose', 'lily', 
  'amber', 'crystal', 'summer', 'autumn', 'winter', 'spring', 'joy',
  'charity', 'harmony', 'melody', 'angel', 'star', 'moon', 'sun',
  'forest', 'ocean', 'sky', 'storm', 'phoenix', 'hunter', 'archer'
];

// Visual detail detection patterns
const EXPANDED_COLOR_ARRAY = [
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'grey',
  'bright red', 'bright blue', 'bright green', 'vibrant red', 'vibrant blue', 'electric blue',
  'light blue', 'light pink', 'pastel blue', 'pale blue', 'dark blue', 'navy blue',
  'silver', 'gold', 'rainbow', 'sky blue', 'ocean blue', 'grass green', 'sunset orange'
];

const SIZE_ADJECTIVES = [
  'big', 'small', 'tiny', 'huge', 'large', 'little', 'giant', 'enormous', 
  'mini', 'massive', 'microscopic', 'colossal', 'petite', 'immense'
];

const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
  'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
  'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves'
];

const UNIFIED_OBJECT_CATEGORIES = [
  'apple', 'banana', 'cookie', 'cake', 'pizza', 'ice cream',
  'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'turtle',
  'car', 'truck', 'bus', 'train', 'airplane', 'bicycle',
  'ball', 'doll', 'teddy bear', 'blocks', 'puzzle', 'kite',
  'tree', 'flower', 'leaf', 'rock', 'shell', 'butterfly'
];

export class CharacterConsistencyService {
  constructor() {
    this.visualDetailCache = new Map();
    this.supabase = null;
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
   * Build character description from seed data
   */
  async buildCharacterDescription(seedData, storyContext, pageTextClothing = null, sessionId = null) {
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
   * Enhanced analyze visual details with story template patterns (PHASE 4 ENHANCEMENT)
   */
  async analyzeVisualDetails(sessionId, text, pageNumber, characterName = null) {
    console.log(`🎨 Analyzing visual details for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Enhanced patterns for story template extraction
    const detectionResults = {
      clothing: [],
      coloredObjects: [],
      settings: [],
      familyMembers: [],
      communityMembers: [],
      animals: [],
      toys: []
    };
    
    // PHASE 4: Template-driven extraction patterns
    
    // Family character detection (enhanced from templates)
    const familyPatterns = {
      'mom|mother|mommy|mama': 'family_mother',
      'dad|daddy|father|papa': 'family_father', 
      'sister|sis': 'family_sister',
      'brother|bro': 'family_brother',
      'grandma|grandmother|nana': 'family_grandmother',
      'grandpa|grandfather|gramps': 'family_grandfather',
      'aunt|auntie': 'family_aunt',
      'uncle': 'family_uncle'
    };
    
    for (const [pattern, relationship] of Object.entries(familyPatterns)) {
      const matches = text.match(new RegExp(`\\b(${pattern})\\b`, 'gi'));
      if (matches) {
        for (const match of matches) {
          const familyMember = {
            name: match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
            relationship,
            type: 'family_member',
            confidence: 0.9
          };
          detectionResults.familyMembers.push(familyMember);
          
          // Generate family character for consistency
          await this.generateFamilyCharacter(relationship, familyMember.name, text, sessionId);
        }
      }
    }
    
    // Community character detection (from template analysis)
    const communityPatterns = {
      'teacher|instructor': 'authority_teacher',
      'coach|trainer': 'authority_coach', 
      'doctor': 'authority_doctor',
      'nurse': 'authority_nurse',
      'friend|buddy|pal': 'community_friend',
      'classmate': 'community_classmate',
      'neighbor': 'community_neighbor'
    };
    
    for (const [pattern, role] of Object.entries(communityPatterns)) {
      const matches = text.match(new RegExp(`\\b(${pattern})\\b`, 'gi'));
      if (matches) {
        for (const match of matches) {
          const communityMember = {
            name: match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
            role,
            type: 'community_member', 
            confidence: 0.8
          };
          detectionResults.communityMembers.push(communityMember);
          
          // Generate community character for consistency
          await this.generateCommunityCharacter(role, communityMember.name, text, sessionId);
        }
      }
    }
    
    // Enhanced colored object detection (from level0 templates)
    const templateColoredObjects = [
      'bed', 'shirt', 'dress', 'shoes', 'book', 'car', 'ball', 'toy', 'cup', 'chair',
      'table', 'house', 'door', 'window', 'bike', 'hat', 'bag', 'phone', 'computer'
    ];
    
    for (const color of EXPANDED_COLOR_ARRAY) {
      for (const object of templateColoredObjects) {
        const pattern = new RegExp(`\\b${color}\\s+${object}\\b`, 'gi');
        const matches = text.match(pattern);
        if (matches) {
          detectionResults.coloredObjects.push(...matches.map(m => ({
            description: m,
            color,
            object,
            confidence: 0.8
          })));
        }
      }
    }
    
    // Animals and pets (from template patterns)
    const animalPatterns = [
      'dog', 'puppy', 'cat', 'kitten', 'rabbit', 'bunny', 'hamster', 'bird',
      'fish', 'turtle', 'horse', 'cow', 'pig', 'chicken', 'duck', 'butterfly'
    ];
    
    for (const animal of animalPatterns) {
      const pattern = new RegExp(`\\b${animal}\\b`, 'gi');
      const matches = text.match(pattern);
      if (matches) {
        detectionResults.animals.push(...matches.map(m => ({
          type: animal,
          species: animal,
          category: this.categorizeAnimal(animal),
          confidence: 0.9
        })));
      }
    }
    
    // Settings detection (from level0 templates) 
    const settingPatterns = [
      'home', 'house', 'room', 'kitchen', 'bedroom', 'bathroom', 'school', 'classroom',
      'playground', 'park', 'store', 'library', 'doctor', 'hospital', 'car', 'bus'
    ];
    
    for (const setting of settingPatterns) {
      const pattern = new RegExp(`\\b${setting}\\b`, 'gi');
      const matches = text.match(pattern);
      if (matches) {
        detectionResults.settings.push(...matches.map(m => ({
          location: setting,
          type: 'setting',
          confidence: 0.7
        })));
      }
    }
    
    // Store all detected elements
    await this.storeTemplateDetections(sessionId, pageNumber, detectionResults, characterName);
    
    console.log(`🎨 Enhanced template-driven analysis complete:`, {
      clothing: detectionResults.clothing.length,
      coloredObjects: detectionResults.coloredObjects.length, 
      settings: detectionResults.settings.length,
      familyMembers: detectionResults.familyMembers.length,
      communityMembers: detectionResults.communityMembers.length,
      animals: detectionResults.animals.length
    });
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
    
    // Enhanced color and size patterns
    const expandedColorWords = EXPANDED_COLOR_ARRAY.join('|').replace(/\s+/g, '\\s+');
    const sizeWords = SIZE_ADJECTIVES.join('|');
    const objectWords = UNIFIED_OBJECT_CATEGORIES.join('|').replace(/\s+/g, '\\s+');
    
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
      const results = {
        animals: this.detectAnimals(text, context),
        secondaryCharacters: this.detectSecondaryCharacters(text, context),
        relationships: this.detectRelationships(text, context),
        success: true
      };

      // Store detections for consistency
      if (sessionId) {
        this.storeDetections(sessionId, pageNumber, results);
      }

      console.log(`🔍 Detected ${results.animals.length} animals, ${results.secondaryCharacters.length} secondary characters`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ Detection error (non-blocking):', error.message);
      return { animals: [], secondaryCharacters: [], relationships: [], success: false, error: error.message };
    }
  }

  /**
   * Enhanced detection of secondary characters with disambiguation
   */
  detectSecondaryCharacters(originalText, context) {
    const secondaryCharacters = [];
    
    // Generate all pattern combinations for comprehensive relationship detection
    const allPatterns = [];
    
    Object.entries(RELATIONSHIP_PATTERNS).forEach(([relationshipType, relationshipWords]) => {
      relationshipWords.forEach(relationship => {
        // Direct Relationship + Name (e.g., "friend Apple", "teacher Ms. Johnson")
        allPatterns.push({
          pattern: new RegExp(`\\b(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
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
   * Generate family character with genetic similarity (MISSING FUNCTION - PHASE 1 RECOVERY)
   */
  async generateFamilyCharacter(relationship, characterName, context, sessionId, userInfo = null) {
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
   * Generate community character with role-appropriate appearance (MISSING FUNCTION - PHASE 1 RECOVERY)
   */
  async generateCommunityCharacter(role, characterName, context, sessionId, userInfo = null) {
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