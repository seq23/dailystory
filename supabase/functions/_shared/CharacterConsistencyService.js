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
      .select('character_data')
      .eq('session_id', sessionId)
      .eq('character_key', characterKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is expected sometimes
      console.error('❌ Database fetch error:', error);
      throw new Error(`CharacterConsistencyService.getCharacterFromDatabase failed: ${safeErrorMessage(error)}`);
    }
    
    if (data?.character_data) {
      console.log(`📖 Retrieved character ${characterKey} from database for session ${sessionId}`);
      return data.character_data;
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
    
    const characterDescription = this.buildCharacterDescription(seedData, storyContext, pageTextClothing);
    
    const characterData = {
      seed: seedData.baseSeed,
      characterDescription,
      avatarIdentity: {
        type: seedData.avatarType || avatarIdentity?.type,
        skinTone: seedData.skinTone || avatarIdentity?.skinTone
      },
      physicalTraits: seedData.physicalTraits,
      consistentEyeColor: seedData.consistentEyeColor,
      consistentClothingStyle: seedData.consistentClothingStyle,
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
    
    // Generate consistent eye color for this character
    const eyeColors = ['brown eyes', 'dark brown eyes', 'hazel eyes', 'amber eyes', 'green eyes', 'blue eyes', 'gray eyes'];
    const consistentEyeColor = eyeColors[Math.floor(seededRandom() * eyeColors.length)];
    
    // Generate consistent clothing style for this character
    const clothingStyles = ['casual', 'colorful', 'comfortable', 'neat', 'playful'];
    const consistentClothingStyle = clothingStyles[Math.floor(seededRandom() * clothingStyles.length)];

    return {
      baseSeed,
      characterName,
      avatarType: avatarIdentity.type || 'child',
      skinTone: avatarIdentity.skinTone || 'medium',
      consistentEyeColor,
      consistentClothingStyle,
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
   * Build character description from seed data
   */
  buildCharacterDescription(seedData, storyContext, pageTextClothing = null) {
    const characterName = seedData.characterName || 'child';
    const age = seedData.age || '6-8';
    const eyeColor = seedData.consistentEyeColor || 'brown eyes';
    const clothingStyle = pageTextClothing || `${seedData.consistentClothingStyle} clothing`;
    
    return `${characterName} is a child age ${age} with ${eyeColor} wearing ${clothingStyle}`;
  }

  /**
   * Generate secondary character for relationship consistency
   */
  async generateSecondaryCharacter(type, details, userInfo, sessionId) {
    const secondaryName = details.name || `${type}_character`;
    const cacheKey = `${sessionId}_secondary_${secondaryName}`;
    
    // Check database first
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (cached) {
      return cached;
    }
    
    // Generate new secondary character
    const characterDescription = `${secondaryName} with ${type} relationship features`;
    
    const secondaryData = {
      characterDescription,
      relationshipType: type,
      name: secondaryName,
      generatedAt: Date.now()
    };
    
    // Save to database
    await this.saveCharacterToDatabase(sessionId, cacheKey, secondaryData);
    
    return secondaryData;
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