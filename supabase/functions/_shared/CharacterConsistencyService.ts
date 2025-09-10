/**
 * Character Consistency Service - Enhanced with Cultural Intelligence
 * Handles all character generation, consistency, cultural enhancements, and persistence
 * Includes all cultural arrays and detection logic from FrontendIntelligence
 */

import { safeErrorMessage } from './errorPatterns.ts';

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
        selected_cultural_hair: characterData.selectedCulturalHair || null,
        selected_cultural_features: characterData.selectedCulturalFeatures || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Database save error:', error);
      throw new Error(`CharacterConsistencyService.saveCharacterToDatabase failed: ${safeErrorMessage(error)}`);
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
      .select('character_data, selected_cultural_hair, selected_cultural_features')
      .eq('session_id', sessionId)
      .eq('character_key', characterKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is expected sometimes
      console.error('❌ Database fetch error:', error);
      throw new Error(`CharacterConsistencyService.getCharacterFromDatabase failed: ${safeErrorMessage(error)}`);
    }
    
    if (data?.character_data) {
      console.log(`📖 Retrieved character ${characterKey} from database for session ${sessionId}`);
      // Merge cultural selections back into character data
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
    const characterName = avatarIdentity.name || 'child';
    const cacheKey = `${sessionId}_${characterName}`;
    
    // Check database first
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      console.log(`🎭 DATABASE CACHED: Using existing character for ${characterName} (seed: ${cached.seed})`);
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
    
    console.log(`🎭 FRESH: Generated new character for ${characterName} (seed: ${seedData.baseSeed})`);
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
    
    // Generate consistent clothing style for this character
    const clothingStyles = ['casual', 'colorful', 'comfortable', 'neat', 'playful'];
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
   */
  async buildCharacterDescription(seedData, storyContext, pageTextClothing = null, sessionId = null) {
    const characterName = seedData.characterName || 'child';
    const age = seedData.age || '6-8';
    
    // PRIORITY 1: Check VisualDetailTracker for detected clothing
    let clothingStyle = '';
    if (sessionId) {
      try {
        const { VisualDetailTracker } = await import('./VisualDetailTracker.ts');
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
    
    return `${characterName} is a child age ${age}${clothingStyle ? ' ' + clothingStyle : ''}`;
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
   */
  async getSecondaryCharacterSeed(sessionId, characterName, characterType = 'secondary_character') {
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
      
      // Generate description for consistency
      const characterDescription = this.generateSecondaryCharacterDescription(characterName, characterType, newSeed);
      
      // Store in database for consistency
      const secondaryData = {
        seed: newSeed,
        characterDescription,
        name: characterName,
        characterType: 'secondary',
        relationshipType: characterType,
        created_at: new Date().toISOString()
      };
      
      await this.saveCharacterToDatabase(sessionId, characterKey, secondaryData);
      
      console.log(`✨ New secondary character seed generated and stored: ${characterName} (${newSeed})`);
      return secondaryData;
      
    } catch (error) {
      console.error(`❌ Secondary character seed error for ${characterName}:`, error);
      // Fallback: generate deterministic seed without database
      const fallbackSeed = this.generateStableSeed(sessionId + characterName + characterType, characterName);
      return {
        seed: fallbackSeed,
        characterDescription: this.generateSecondaryCharacterDescription(characterName, characterType, fallbackSeed),
        name: characterName,
        characterType: 'secondary'
      };
    }
  }

  /**
   * Generate description for secondary character using seeded randomization
   */
  generateSecondaryCharacterDescription(characterName, type, seed) {
    const seededRandom = this.createSeededRandom(seed);
    
    // Define basic character templates with minimal descriptions to let Runware decide appearance
    const characterTemplates = {
      person: ['friendly person', 'kind individual', 'helpful neighbor', 'cheerful friend'],
      adult: ['caring adult', 'gentle grown-up', 'wise elder', 'supportive figure'],
      child: ['playful child', 'curious kid', 'friendly peer', 'energetic youth'],
      elderly: ['wise grandparent', 'kind elder', 'experienced senior', 'gentle grandmother'],
      parent: ['loving parent', 'caring mother', 'supportive father', 'protective guardian'],
      animal: ['friendly animal', 'curious creature', 'loyal companion', 'playful pet']
    };
    
    const templates = characterTemplates[type] || characterTemplates.person;
    const selectedTemplate = templates[Math.floor(seededRandom() * templates.length)];
    
    return `${characterName}, ${selectedTemplate}`;
  }

  /**
   * Detect secondary characters from story text
   */
  detectSecondaryCharacters(pageText) {
    if (!pageText) return [];
    
    const detectedCharacters = [];
    const text = pageText.toLowerCase();
    
    // Common secondary character patterns
    const characterPatterns = [
      // Named characters (proper nouns)
      /\b([A-Z][a-z]+)\b/g,
      // Family relationships
      /\b(mom|mother|dad|father|grandma|grandpa|sister|brother|uncle|aunt)\b/g,
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
}