// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
/**
 * Character Consistency Service - Enhanced with Cultural Intelligence
 * Handles all character generation, consistency, cultural enhancements, and persistence
 * Includes all cultural arrays and detection logic from FrontendIntelligence
 */

import { safeErrorMessage } from './errorPatterns.js';
import { CULTURAL_ARRAYS } from './tier25Vocabulary.js';

export class CharacterConsistencyService {
  private visualDetailCache = new Map<string, any>();

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
   * ENHANCED: Get or create secondary character seeds with detection and consistency
   * Now includes detection from pageText and returns array of character objects with seeds
   */
  async getSecondaryCharacterSeed(sessionId, pageText, pageNumber, primaryScene = '') {
    console.log(`🎭 Enhanced getSecondaryCharacterSeed: Detecting and seeding for session ${sessionId}, page ${pageNumber}`);
    
    if (!pageText) {
      console.log('⚠️ No pageText provided, returning empty array');
      return [];
    }
    
    try {
      // Step 1: Detect secondary characters using enhanced patterns
      const originalText = `${primaryScene || ''} ${pageText}`;
      const combinedText = originalText.toLowerCase();
      
      const detectedCharacters = CharacterConsistencyService.detectSecondaryCharacters(originalText, combinedText);
      console.log(`🔍 Detected ${detectedCharacters.length} secondary characters:`, 
        detectedCharacters.map(c => `${c.displayName} (${c.type})`));
      
      if (detectedCharacters.length === 0) {
        return [];
      }
      
      // Step 2: Generate seeds for each detected character
      const seededCharacters = [];
      
      for (const character of detectedCharacters) {
        const characterKey = `secondary_${character.name.replace(/[^a-z0-9]/g, '_')}`;
        
        try {
          // Check database first
          let existingSeed = await this.getCharacterFromDatabase(sessionId, characterKey);
          
          if (existingSeed && existingSeed.seed) {
            console.log(`🔄 Existing seed retrieved: ${character.displayName} (${existingSeed.seed})`);
            seededCharacters.push({
              ...character,
              seed: existingSeed.seed,
              characterDescription: existingSeed.characterDescription || character.displayName,
              isExisting: true
            });
          } else {
            // Generate new seed
            const characterSpecificSeed = `secondary_${character.name}_${sessionId}_${character.type}`;
            const newSeed = this.generateStableSeed(characterSpecificSeed, character.name);
            
            // Generate description for consistency  
            const characterDescription = this.generateSecondaryCharacterDescription(
              character.displayName, 
              character.relationshipType, 
              newSeed
            );
            
            // Store in database for consistency
            const secondaryData = {
              seed: newSeed,
              characterDescription,
              name: character.displayName,
              characterType: 'secondary',
              relationshipType: character.type,
              disambiguation: character.disambiguation,
              created_at: new Date().toISOString()
            };
            
            await this.saveCharacterToDatabase(sessionId, characterKey, secondaryData);
            
            console.log(`✨ New seed generated: ${character.displayName} (${newSeed})`);
            seededCharacters.push({
              ...character,
              seed: newSeed,
              characterDescription,
              isExisting: false
            });
          }
        } catch (individualError) {
          console.error(`❌ Error processing ${character.displayName}:`, individualError);
          // Fallback: generate deterministic seed without database
          const fallbackSeed = this.generateStableSeed(sessionId + character.name + character.type, character.name);
          seededCharacters.push({
            ...character,
            seed: fallbackSeed,
            characterDescription: this.generateSecondaryCharacterDescription(character.displayName, character.relationshipType, fallbackSeed),
            isExisting: false,
            isFallback: true
          });
        }
      }
      
      console.log(`🎭 Completed seeding for ${seededCharacters.length} secondary characters`);
      return seededCharacters;
      
    } catch (error) {
      console.error(`❌ Enhanced getSecondaryCharacterSeed error:`, error);
      return [];
    }
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

  // Comprehensive relationship types (25+ categories) - moved from SecondaryElementDetector
  static RELATIONSHIP_PATTERNS = {
    // Core Family (8 types)
    family_mother: ['mom', 'mother', 'mommy', 'mama', 'ma'],
    family_father: ['dad', 'father', 'daddy', 'papa', 'pa'],
    family_sister: ['sister', 'sis'],
    family_brother: ['brother', 'bro'],
    family_grandmother: ['grandma', 'grandmother', 'nana', 'granny'],
    family_grandfather: ['grandpa', 'grandfather', 'papa', 'gramps'],
    family_aunt: ['aunt', 'auntie'],
    family_uncle: ['uncle'],
    
    // Extended Family (6 types)
    family_cousin: ['cousin'],
    family_nephew: ['nephew'],
    family_niece: ['niece'],
    family_stepmother: ['stepmother', 'stepmom'],
    family_stepfather: ['stepfather', 'stepdad'],
    family_stepsister: ['stepsister'],
    family_stepbrother: ['stepbrother'],
    
    // Friends & Peers (8 types)
    community_friend: ['friend', 'buddy', 'pal', 'companion'],
    community_best_friend: ['best friend', 'bestie'],
    community_classmate: ['classmate'],
    community_teammate: ['teammate'],
    community_neighbor: ['neighbor', 'neighbour'],
    community_playmate: ['playmate'],
    
    // Authority Figures (10 types)
    authority_teacher: ['teacher', 'instructor', 'tutor'],
    authority_coach: ['coach', 'trainer'],
    authority_doctor: ['doctor', 'dr'],
    authority_nurse: ['nurse'],
    authority_principal: ['principal', 'headmaster'],
    authority_librarian: ['librarian'],
    authority_babysitter: ['babysitter', 'sitter'],
    authority_guide: ['guide']
  };

  // Common words that can be names (for disambiguation) - moved from SecondaryElementDetector
  static COMMON_WORD_NAMES = [
    'apple', 'sage', 'river', 'hope', 'grace', 'faith', 'rose', 'lily', 
    'amber', 'crystal', 'summer', 'autumn', 'winter', 'spring', 'joy',
    'charity', 'harmony', 'melody', 'angel', 'star', 'moon', 'sun',
    'forest', 'ocean', 'sky', 'storm', 'phoenix', 'hunter', 'archer'
  ];

  /**
   * Enhanced detection of secondary characters with 5 pattern types and disambiguation
   * Moved from SecondaryElementDetector for consolidation
   */
  static detectSecondaryCharacters(originalText, lowercaseText) {
    const secondaryCharacters = [];
    
    // Generate all pattern combinations for comprehensive relationship detection
    const allPatterns = [];
    
    Object.entries(this.RELATIONSHIP_PATTERNS).forEach(([relationshipType, relationshipWords]) => {
      relationshipWords.forEach(relationship => {
        // Pattern 1: Direct Relationship + Name (e.g., "friend Apple", "teacher Ms. Johnson")
        allPatterns.push({
          pattern: new RegExp(`\\b(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
          patternType: 'direct',
          relationship: relationship
        });
        
        // Pattern 2: Possessive Pronouns + Relationship + Name (e.g., "my friend Apple", "her cat Whiskers")
        allPatterns.push({
          pattern: new RegExp(`\\b(?:my|your|his|her|their|our)\\s+(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_pronoun',
          relationship: relationship
        });
        
        // Pattern 3: Possessive Forms (e.g., "Apple's mom", "Sequoia's sister")
        allPatterns.push({
          pattern: new RegExp(`\\b([A-Z][a-z]{1,14})'?s\\s+(${relationship})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_form',
          relationship: relationship
        });
      });
    });
    
    // Pattern 4: Dialogue Attribution (e.g., '"Hello," said Apple', '"Come here," called teacher')
    allPatterns.push({
      pattern: /["']([^"']+)["'][,.]?\s+(?:said|asked|called|whispered|shouted|replied|answered)\s+([A-Z][a-z]{1,14})/gi,
      type: 'dialogue_attribution',
      patternType: 'dialogue',
      relationship: 'speaker'
    });
    
    // Pattern 5: Coordinated Names (e.g., "Apple and Sequoia", "Mom and Dad")
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
            displayName: name, // Preserve original capitalization
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
   * Smart name validation with context awareness
   * Moved from SecondaryElementDetector for consolidation
   */
  static isValidName(name, context) {
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
   * Moved from SecondaryElementDetector for consolidation
   */
  static generateDisambiguation(name, relationship, type) {
    const nameLower = name.toLowerCase();
    
    // Check if this name could be confused with a common object
    if (this.COMMON_WORD_NAMES.includes(nameLower)) {
      const relationshipCategory = this.getRelationshipCategory(type);
      return `${name} (a ${relationshipCategory} named ${name}, not the ${nameLower})`;
    }
    
    return null;
  }

  /**
   * Get relationship category for disambiguation  
   * Moved from SecondaryElementDetector for consolidation
   */
  static getRelationshipCategory(type) {
    if (type.startsWith('family_')) return 'family member';
    if (type.startsWith('community_')) return 'friend';
    if (type.startsWith('authority_')) return 'authority figure';
    return 'person';
  }
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

  /**
   * Get African American hairstyles from consolidated cultural arrays
   */
  getAfricanAmericanHairStyles() {
    return CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES;
  }

  /**
   * Get African American facial features from consolidated cultural arrays
   */
  getAfricanAmericanFacialFeatures() {
    return CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES;
  }

  /**
   * Get regional authenticity strings from consolidated cultural arrays
   */
  getRegionalAuthenticity(): string[] {
    return CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS;
  }

  /**
   * Analyze visual details from page text and cache them using session and page number
   */
  async analyzeVisualDetails(sessionId: string, pageText: string, pageNumber: number, characterName?: string): Promise<any> {
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
  async getColoredObjects(sessionId: string): Promise<string> {
    console.log(`🎨 Getting colored objects for session ${sessionId}`);
    
    const coloredObjectsSet = new Set<string>();
    
    // Iterate through all cached pages for this session
    for (const [key, details] of this.visualDetailCache.entries()) {
      if (key.startsWith(sessionId)) {
        if (details.coloredObjects && Array.isArray(details.coloredObjects)) {
          details.coloredObjects.forEach((obj: string) => coloredObjectsSet.add(obj));
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
  extractVisualDetails(pageText: string, characterName?: string): {
    coloredObjects: string[];
    atmosphericWords: string[];
    characterAppearance: string[];
  } {
    if (!pageText) {
      return { coloredObjects: [], atmosphericWords: [], characterAppearance: [] };
    }

    const coloredObjects: string[] = [];
    const atmosphericWords: string[] = [];
    const characterAppearance: string[] = [];

    // Extract colored objects (color + noun combinations)
    const coloredObjectPatterns = [
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

    // Extract atmospheric/mood words
    const atmosphericPatterns = [
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
  async getCharacterAppearanceFromStory(sessionId: string, characterName?: string): Promise<string | null> {
    console.log(`👤 Getting character appearance for ${characterName} in session ${sessionId}`);
    
    const appearanceDetails: string[] = [];
    
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
  clearSession(sessionId: string): void {
    console.log(`🧹 Clearing visual detail cache for session ${sessionId}`);
    
    const keysToDelete: string[] = [];
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