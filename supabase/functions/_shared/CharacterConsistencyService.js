// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
/**
 * Character Consistency Service - Enhanced with Cultural Intelligence
 * Handles all character generation, consistency, cultural enhancements, and persistence
 * Includes all cultural arrays and detection logic from FrontendIntelligence
 */

import { safeErrorMessage } from './errorPatterns.js';
import { PLACEHOLDER_POOLS } from './tier25Vocabulary.js';
import { getAfricanAmericanHair, getAfricanAmericanFeatures } from './StaticDataCache.js';
import { UnifiedCharacterDescriptor } from './UnifiedCharacterDescriptor.js';

export class CharacterConsistencyService {
  constructor() {
    // Structured initialization logging via unified-debug-service
    this.visualDetailCache = new Map();
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
   * Save character data to database
   */
  async saveCharacterToDatabase(sessionId, characterKey, characterData) {
    // Database operation - success/error logged via error handling
    
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
        selected_cultural_hair: characterData.selectedCulturalHair || null,
        selected_cultural_features: characterData.selectedCulturalFeatures || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Database save error:', error);
      throw new Error(`CharacterConsistencyService.saveCharacterToDatabase failed: ${safeErrorMessage(error)}`);
    }
    
    // Success - character saved to database
    return true;
  }

  /**
   * Get character data from database
   */
  async getCharacterFromDatabase(sessionId, characterKey) {
    // Database fetch operation
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data, error } = await supabase
      .from('character_consistency_cache')
      .select('character_data, selected_cultural_hair, selected_cultural_features')
      .eq('session_id', sessionId)
      .eq('character_key', characterKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is expected sometimes
      console.error('❌ Database fetch error:', error);
      throw new Error(`CharacterConsistencyService.getCharacterFromDatabase failed: ${safeErrorMessage(error)}`);
    }
    
    if (data?.character_data) {
      // Character cached in database - return with cultural selections merged
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
  }

  /**
   * Get or create character seed with full consistency support (DATABASE-BACKED)
   */
  async getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType = 'new', pageTextClothing = null) {
    // Add null check to prevent crashes when avatarIdentity is undefined
    if (!avatarIdentity) {
      console.warn('⚠️ CharacterConsistencyService: avatarIdentity is undefined, using fallback');
      avatarIdentity = { name: 'child' };
    }
    
    const characterName = avatarIdentity.name || 'child';
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Check database for existing character
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      // Using cached character from database
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
    
    // Fresh character generated and saved
    return characterData;
  }

  /**
   * Create new character seed with avatar awareness
   */
  async createNewCharacterSeed(avatarIdentity) {
    const characterName = avatarIdentity.name || 'child';
    const userId = `avatar-${avatarIdentity.type}-${avatarIdentity.skinTone}`; // Generate consistent ID from avatar
    const characterSpecificSeed = `${characterName}-${userId}-${avatarIdentity.skinTone}`;
    
    const baseSeed = this.generateStableSeed(characterSpecificSeed, characterName);
    
    // Generate consistent physical features using character-specific seed
    const seededRandom = this.createSeededRandom(baseSeed);
    
    // Eye color handling removed - let avatar descriptions handle naturally
    
    // Generate consistent clothing style for this character using tier25Vocabulary
    const clothingStyles = PLACEHOLDER_POOLS.clothingStyles || ['casual', 'colorful', 'comfortable', 'neat', 'playful'];
    const consistentClothingStyle = clothingStyles[Math.floor(seededRandom() * clothingStyles.length)];

    return {
      baseSeed,
      characterName,
      avatarType: avatarIdentity.type || 'child',
      skinTone: avatarIdentity.skinTone || 'medium',
      consistentClothingStyle,
      selectedCulturalHair: null, // Will be populated when cultural context is generated
      selectedCulturalFeatures: null, // Will be populated when cultural context is generated
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
   * Get cultural enhancements with character consistency seeding
   * Integrates with StaticDataCache using character-specific seeds
   */
  async getCulturalEnhancements(userInfo, sessionId, characterName = 'child') {
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Get or create character data
    let characterData = await this.getCharacterFromDatabase(sessionId, cacheKey);
    
    if (!characterData) {
      // Create character if it doesn't exist
      const avatarIdentity = userInfo?.avatarIdentity || userInfo?.avatar || { name: characterName };
      characterData = await this.getCharacterSeed(sessionId, avatarIdentity, null, 'new', null);
    }
    
    // Check if cultural selections are already cached
    if (characterData.selectedCulturalHair && characterData.selectedCulturalFeatures) {
      return {
        hair: characterData.selectedCulturalHair,
        features: characterData.selectedCulturalFeatures
      };
    }
    
    // Import getCulturalBundle from StaticDataCache
    const { getCulturalBundle } = await import('./StaticDataCache.js');
    
    // Use character seed for consistent cultural selections
    const characterSeed = characterData.seed || this.generateStableSeed(`${sessionId}_${characterName}`, characterName);
    const culturalBundle = getCulturalBundle(userInfo, characterSeed, userInfo?.skinTone);
    
    // Cache the cultural selections
    await this.updateCulturalSelections(sessionId, cacheKey, culturalBundle.hair, culturalBundle.features);
    
    // Update in-memory character data
    characterData.selectedCulturalHair = culturalBundle.hair;
    characterData.selectedCulturalFeatures = culturalBundle.features;
    
    console.log(`🎨 Generated cultural enhancements for ${characterName} (seed: ${characterSeed}):`, culturalBundle);
    
    return culturalBundle;
  }

  /**
   * Update character data with cultural selections for persistence
   */
  async updateCulturalSelections(sessionId, characterKey, selectedCulturalHair, selectedCulturalFeatures) {
    console.log(`🎨 Updating cultural selections for character ${characterKey} in session ${sessionId}`);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

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
  }

  /**
   * Build character description from seed data
   * Now integrated with VisualDetailTracker for persistent clothing
   * CRITICAL FIX: Respect StaticDataCache hair mappings for light skin tones
   */
  async buildCharacterDescription(seedData, storyContext, pageTextClothing = null, sessionId = null) {
    const characterName = seedData.characterName || 'child';
    const age = seedData.age || '6-8';
    
    // PRIORITY 1: Check VisualDetailTracker for detected clothing
    let clothingStyle = '';
    if (sessionId) {
      try {
        const { VisualDetailTracker } = await import('./VisualDetailTracker.js');
        const detectedClothing = await VisualDetailTracker.buildClothingDescription(sessionId, characterName);
        if (detectedClothing) {
          clothingStyle = detectedClothing;
          console.log(`👕 Using VisualDetailTracker clothing for ${characterName}: ${detectedClothing}`);
        }
      } catch (error) {
        console.log(`⚠️ VisualDetailTracker clothing query failed:`, error.message);
      }
    }
    
    // PRIORITY 2: Check if story text has clothing descriptions (legacy check)
    if (!clothingStyle) {
      const hasStoryClothing = pageTextClothing && (
        pageTextClothing.includes('wearing') || 
        pageTextClothing.includes('dressed') || 
        pageTextClothing.includes('shirt') ||
        pageTextClothing.includes('pants') ||
        pageTextClothing.includes('dress') ||
        pageTextClothing.includes('hat') ||
        pageTextClothing.includes('jacket') ||
        pageTextClothing.includes('coat')
      );
      
      // PRIORITY 3: Use random clothing if no specific clothing detected
      if (!hasStoryClothing) {
        clothingStyle = `wearing ${seedData.consistentClothingStyle} clothing`;
      }
    }
    
    // Use actual avatar type from seedData instead of hardcoded "child"
    const avatarType = seedData.avatarType || seedData.type || 'child';
    
    // CRITICAL FIX: Don't override hair color - let StaticDataCache handle hair mapping
    // Remove any hair color descriptions from this service to prevent override
    return `${characterName} is a ${avatarType} age ${age}${clothingStyle ? ' ' + clothingStyle : ''}`;
  }

  /**
   * Generate secondary character for relationship consistency with seed-based consistency
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
   * Get or create secondary character seed for consistency across pages
   * Enhanced with UnifiedCharacterDescriptor detection capabilities
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
      
      // Generate enhanced description using UnifiedCharacterDescriptor
      const characterDescription = this.generateSecondaryCharacterDescription(characterName, characterType, newSeed, userInfo, sessionId);
      
      // Store in database for consistency
      const secondaryData = {
        seed: newSeed,
        characterDescription,
        name: characterName,
        characterType: 'secondary',
        relationshipType: characterType,
        created_at: new Date().toISOString(),
        enhanced: true // Flag for enhanced generation
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
   * Generate description for secondary character using UnifiedCharacterDescriptor
   * Enhanced with sophisticated detection and cultural consistency
   */
  generateSecondaryCharacterDescription(characterName, type, seed, userInfo = null, sessionId = null) {
    try {
      // Use UnifiedCharacterDescriptor for enhanced secondary character generation
      // Already imported at top of file
      
      // Create mock detection element for UnifiedCharacterDescriptor
      const detectedElement = {
        name: characterName,
        displayName: characterName,
        type: type,
        category: 'secondary_character',
        needsConsistency: true
      };
      
      // Use UnifiedCharacterDescriptor's sophisticated generation if userInfo available
      if (userInfo && sessionId) {
        const enhancedDescription = UnifiedCharacterDescriptor.generateSecondaryCharacterFromDetection(
          detectedElement, 
          userInfo, 
          sessionId
        );
        
        return enhancedDescription.description || `${characterName}, friendly person`;
      }
      
      // Fallback to enhanced template system with seeded randomization
      const seededRandom = this.createSeededRandom(seed);
      
      // Enhanced character templates with cultural awareness
      const characterTemplates = {
        // Family relationships
        family_mother: ['loving mother', 'caring mom', 'supportive mother', 'gentle mama'],
        family_father: ['caring father', 'supportive dad', 'protective father', 'kind papa'],
        family_sister: ['cheerful sister', 'playful sis', 'friendly sister', 'energetic sister'],
        family_brother: ['fun brother', 'supportive bro', 'playful brother', 'helpful brother'],
        family_grandmother: ['wise grandmother', 'loving grandma', 'gentle nana', 'caring grandmother'],
        family_grandfather: ['kind grandfather', 'wise grandpa', 'gentle grandfather', 'caring gramps'],
        family_aunt: ['friendly aunt', 'caring auntie', 'supportive aunt', 'fun aunt'],
        family_uncle: ['helpful uncle', 'fun uncle', 'supportive uncle', 'caring uncle'],
        
        // Community relationships  
        community_friend: ['cheerful friend', 'loyal buddy', 'fun pal', 'supportive companion'],
        community_teacher: ['helpful teacher', 'kind instructor', 'supportive tutor', 'caring teacher'],
        community_neighbor: ['friendly neighbor', 'kind neighbour', 'helpful neighbor', 'caring neighbor'],
        community_classmate: ['friendly classmate', 'supportive peer', 'fun classmate', 'helpful friend'],
        
        // Authority figures
        authority_doctor: ['caring doctor', 'gentle doctor', 'helpful doctor', 'kind physician'],
        authority_nurse: ['gentle nurse', 'caring nurse', 'helpful nurse', 'supportive nurse'],
        authority_coach: ['encouraging coach', 'supportive trainer', 'motivating coach', 'helpful coach'],
        
        // Generic types
        person: ['friendly person', 'kind individual', 'helpful neighbor', 'cheerful friend'],
        adult: ['caring adult', 'gentle grown-up', 'wise elder', 'supportive figure'],
        child: ['playful child', 'curious kid', 'friendly peer', 'energetic youth'],
        elderly: ['wise grandparent', 'kind elder', 'experienced senior', 'gentle elder'],
        parent: ['loving parent', 'caring guardian', 'supportive parent', 'protective caregiver'],
        animal: ['friendly animal', 'curious creature', 'loyal companion', 'playful pet']
      };
      
      const templates = characterTemplates[type] || characterTemplates.person;
      const selectedTemplate = templates[Math.floor(seededRandom() * templates.length)];
      
      return `${characterName}, ${selectedTemplate}`;
      
    } catch (error) {
      console.warn('⚠️ Enhanced character description failed, using fallback:', error.message);
      // Ultimate fallback
      return `${characterName}, friendly person`;
    }
  }

  /**
   * Detect secondary characters from story text
   */
  detectSecondaryCharacters(pageText) {
    if (!pageText) return [];
    
    const detectedCharacters = [];
    const text = pageText.toLowerCase();
    
    // Common secondary character patterns - fixed syntax error (removed await import)
    const characterPatterns = [
      // Family relationships
      /\b(mom|mother|dad|father|brother|sister|grandma|grandmother|grandpa|grandfather|aunt|uncle|cousin)\b/gi,
      // Friends and companions
      /\b(friend|buddy|pal|companion|classmate|teammate|neighbor)\b/gi,
      // Titles and roles
      /\b(teacher|doctor|nurse|police|firefighter|mailman|baker|farmer)\b/gi,
      // Community roles
      /\b(teacher|doctor|nurse|mailman|neighbor|friend|classmate)\b/g,
      // Animals
      /\b(dog|cat|bird|rabbit|horse|cow|pig|chicken|fish)\b/g
    ];
    
    for (const pattern of characterPatterns) {
      const matches = pageText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.trim();
          if (cleanMatch.length > 1 && !detectedCharacters.includes(cleanMatch)) {
            detectedCharacters.push(cleanMatch);
          }
        });
      }
    }
    
    console.log(`🔍 Detected secondary characters in story text: ${detectedCharacters.join(', ')}`);
    return detectedCharacters;
  }

  /**
   * Clear all character consistency cache from database
   */
  async clearServerState() {
    console.log('🗑️ Clearing all character consistency cache from database...');
    
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL'), 
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      );

      const { data, error } = await supabase
        .from('character_consistency_cache')
        .delete()
        .neq('session_id', ''); // Delete all records

      if (error) {
        console.error('❌ Database clear error:', error);
        throw new Error(`CharacterConsistencyService.clearServerState failed: ${safeErrorMessage(error)}`);
      }
      
      const deletedCount = data?.length || 0;
      console.log(`🗑️ Successfully cleared ${deletedCount} character consistency cache entries`);
      
      return {
        cleared: deletedCount,
        message: `Cleared ${deletedCount} character cache entries from database`,
        success: true
      };
    } catch (error) {
      console.error('❌ Error clearing character cache:', error);
      return {
        cleared: 0,
        message: `Failed to clear character cache: ${safeErrorMessage(error)}`,
        success: false
      };
    }
  }

  /**
   * Create seeded random number generator for consistency
   */
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Get African American hairstyles from StaticDataCache
   */
  getAfricanAmericanHairStyles(gender = 'boy') {
    return getAfricanAmericanHair(gender, 'consistency-check');
  }

  /**
   * Get African American facial features from StaticDataCache
   */
  getAfricanAmericanFacialFeatures() {
    return getAfricanAmericanFeatures('consistency-check');
  }

  /**
   * Get regional authenticity strings (fallback implementation)
   */
  getRegionalAuthenticity() {
    return {
      'en': 'with authentic African American cultural elements',
      'fr': 'avec des éléments culturels afro-américains authentiques',
      'es': 'con elementos culturales afroamericanos auténticos',
      'pt': 'com elementos culturais afro-americanos autênticos'
    };
  }

  /**
   * Analyze visual details from page text and cache them using session and page number
   */
  async analyzeVisualDetails(sessionId, pageText, pageNumber, characterName) {
    console.log(`👁️ Analyzing visual details for session ${sessionId}, page ${pageNumber}`);
    
    try {
      const visualDetails = this.extractVisualDetails(pageText, characterName);
      const cacheKey = `${sessionId}-page-${pageNumber}`;
      this.visualDetailCache.set(cacheKey, visualDetails);
      
      console.log(`👁️ Cached visual details for ${cacheKey}:`, visualDetails);
      return visualDetails;
    } catch (error) {
      console.error('❌ Visual detail analysis failed:', error);
      return null;
    }
  }

  /**
   * Get colored objects across all cached pages for a session (limit to first 3)
   */
  async getColoredObjects(sessionId) {
    console.log(`🎨 Getting colored objects for session ${sessionId}`);
    
    const coloredObjectsSet = new Set();
    
    // Iterate through all cached pages for this session
    for (const [key, details] of this.visualDetailCache.entries()) {
      if (key.startsWith(sessionId)) {
        if (details.coloredObjects && Array.isArray(details.coloredObjects)) {
          details.coloredObjects.forEach(obj => coloredObjectsSet.add(obj));
        }
      }
    }
    
    const uniqueObjects = Array.from(coloredObjectsSet).slice(0, 3);
    console.log(`🎨 Found ${uniqueObjects.length} unique colored objects:`, uniqueObjects);
    
    return uniqueObjects.join(', ');
  }

  /**
   * Extract visual details from text using regex patterns
   */
  extractVisualDetails(pageText, characterName) {
    if (!pageText) {
      return { coloredObjects: [], atmosphericWords: [], characterAppearance: [] };
    }

    const coloredObjects = [];
    const atmosphericWords = [];
    const characterAppearance = [];

    // Extract colored objects (color + noun combinations) using tier25Vocabulary patterns
    const coloredObjectPatterns = PLACEHOLDER_POOLS.coloredObjectPatterns || [
      /\b(red|blue|green|yellow|purple|pink|orange|black|white|brown|gray|grey|gold|silver)\s+(\w+)\b/gi,
      /\b(\w+)\s+(red|blue|green|yellow|purple|pink|orange|black|white|brown|gray|grey|gold|silver)\b/gi
    ];

    coloredObjectPatterns.forEach(pattern => {
      const matches = pageText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().toLowerCase();
          if (!coloredObjects.includes(cleaned)) {
            coloredObjects.push(cleaned);
          }
        });
      }
    });

    // Extract atmospheric/mood words using tier25Vocabulary patterns
    const atmosphericPatterns = PLACEHOLDER_POOLS.atmosphericPatterns || [
      /\b(bright|dark|sunny|cloudy|rainy|stormy|peaceful|calm|exciting|scary|magical|mysterious|cheerful|gloomy)\b/gi,
      /\b(sparkling|glowing|shimmering|twinkling|rustling|whispers|echoing|silence)\b/gi
    ];

    atmosphericPatterns.forEach(pattern => {
      const matches = pageText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().toLowerCase();
          if (!atmosphericWords.includes(cleaned)) {
            atmosphericWords.push(cleaned);
          }
        });
      }
    });

    // Extract character appearance if characterName is provided
    if (characterName) {
      const characterPatterns = [
        new RegExp(`${characterName}.*?(wearing|dressed|has|with).*?(\\.|\n|$)`, 'gi'),
        new RegExp(`(wearing|dressed|has|with).*?${characterName}.*?(\\.|\n|$)`, 'gi'),
        /\b(hair|eyes|wearing|dressed|shirt|pants|dress|jacket|coat|hat|shoes)\s+[^.]*?\b/gi
      ];

      characterPatterns.forEach(pattern => {
        const matches = pageText.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.trim();
            if (cleaned.length > 3 && !characterAppearance.includes(cleaned)) {
              characterAppearance.push(cleaned);
            }
          });
        }
      });
    }

    return {
      coloredObjects,
      atmosphericWords,
      characterAppearance
    };
  }

  /**
   * Get character appearance description from all cached pages for a session
   */
  async getCharacterAppearanceFromStory(sessionId, characterName) {
    console.log(`👤 Getting character appearance for ${characterName} in session ${sessionId}`);
    
    const appearanceDetails = [];
    
    // Collect character appearance from all cached pages
    for (const [key, details] of this.visualDetailCache.entries()) {
      if (key.startsWith(sessionId)) {
        if (details.characterAppearance && Array.isArray(details.characterAppearance)) {
          appearanceDetails.push(...details.characterAppearance);
        }
      }
    }
    
    // Remove duplicates and join
    const uniqueAppearance = [...new Set(appearanceDetails)];
    const combinedAppearance = uniqueAppearance.join(' ');
    
    console.log(`👤 Character appearance for ${characterName}:`, combinedAppearance);
    return combinedAppearance || null;
  }

  /**
   * Clear visual detail cache for a session
   */
  clearSession(sessionId) {
    console.log(`🧹 Clearing visual detail cache for session ${sessionId}`);
    
    const keysToDelete = [];
    for (const key of this.visualDetailCache.keys()) {
      if (key.startsWith(sessionId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.visualDetailCache.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} cache entries for session ${sessionId}`);
  }

  // Note: African American skin tones have been consolidated into facial features array as of 2025-09-12
}

// Export singleton instance for consistent state management
export const CharacterService = new CharacterConsistencyService();

// Export both the class and singleton instance for different import patterns
export const characterConsistencyService = CharacterConsistencyService.getInstance();