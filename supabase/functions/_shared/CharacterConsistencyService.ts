/**
 * ========================================
 * CHARACTER CONSISTENCY SERVICE - STORY GENERATION VERSION (DEVELOPMENT)
 * ========================================
 * 
 * PURPOSE: This is the DEVELOPMENT version used exclusively by STORY GENERATION systems
 * USAGE: Story generation functions, narrative processing, template selection
 * ARCHITECTURE: Imports dependencies from errorPatterns.ts for story generation integration
 * 
 * =================== CRITICAL DISTINCTIONS ===================
 * 
 * 📖 STORY GENERATION SYSTEM (THIS FILE):
 * - Used by: story generation functions, smartTemplateSelector.ts, streamlined-handler.ts
 * - Dependencies: IMPORTS safeErrorMessage from errorPatterns.ts (REQUIRED FOR STORY SYSTEM)
 * - Export: CharacterService (class constructor)
 * - Purpose: Character consistency for story narrative generation
 * - Environment: TypeScript development environment
 * 
 * 🖼️  IMAGE GENERATION SYSTEM (CharacterConsistencyService.js):
 * - Used by: runware-generate-image, template-ab, template-cd edge functions
 * - Dependencies: INLINED safeErrorMessage function (no external imports)
 * - Export: characterConsistencyService (singleton instance)
 * - Purpose: Character consistency for AI-generated images
 * - Environment: Edge functions (Deno runtime)
 * 
 * =================== DEPENDENCY CHAIN CRITICAL WARNING ===================
 * 
 * 🚨 NEVER REMOVE: import { safeErrorMessage } from './errorPatterns.ts'
 * 
 * This import is ESSENTIAL for the story generation system:
 * - smartTemplateSelector.ts depends on errorPatterns.ts
 * - streamlined-handler.ts depends on errorPatterns.ts
 * - Multiple story functions use safeErrorMessage pattern
 * - Removing this import WILL BREAK story generation system
 * 
 * =================== SYNCHRONIZATION REQUIREMENTS ===================
 * 
 * ⚠️  BOTH VERSIONS MUST MAINTAIN IDENTICAL CORE FUNCTIONALITY
 * - Database methods MUST remain synchronized
 * - Character generation logic MUST be identical
 * - Seed generation MUST produce same results
 * - Visual detection MUST work consistently
 * 
 * =================== FUNCTION CATEGORIES ===================
 * 
 * 📖 STORY GENERATION FUNCTIONS:
 * - analyzeVisualDetails() - Extract story elements for consistency
 * - detectSecondaryCharacters() - Find characters in narrative
 * - getCharacterAppearanceFromStory() - Extract appearance from text
 * - clearSession() - Clean up story session data
 * 
 * 📊 DATABASE OPERATIONS (SHARED):
 * - saveCharacterToDatabase() - Persistence layer
 * - getCharacterFromDatabase() - Data retrieval
 * - updateCulturalSelections() - Cultural trait persistence
 * 
 * 🎭 CHARACTER GENERATION (SHARED):
 * - getCharacterSeed() - Main character consistency
 * - generateStableSeed() - Deterministic seed generation
 * - getSecondaryCharacterSeed() - Secondary character consistency
 * 
 * =================== TYPE SAFETY INTEGRATION ===================
 * 
 * This version provides TypeScript integration:
 * - Full type definitions for all methods
 * - Integration with shared type system (#types/)
 * - IDE support for development
 * - Compile-time error checking
 */

import type { 
  SessionId, 
  UserInfo, 
  CharacterSeed, 
  AvatarIdentity, 
  StoryContext,
  SecondaryCharacter,
  CulturalSelectionUpdate 
} from "./types/index.ts";
import { isSecondaryCharacter } from './types/index.ts';

import { safeErrorMessage } from './errorPatterns.ts';
import { getCulturalContextArrays } from './StaticDataCache.ts';

export class CharacterConsistencyService {
  private visualDetailCache = new Map<string, any>();

  constructor() {
    console.log('🎭 CharacterConsistencyService initialized with database-backed consistency');
  }

  /**
   * Save character data to database
   */
  async saveCharacterToDatabase(sessionId: string, characterKey: string, characterData: Record<string, any>): Promise<boolean> {
    console.log(`💾 Attempting to save character ${characterKey} to database for session ${sessionId}...`);
    
    const { createClient } = await import('../resilientLoader.ts').then(m => m.memoizedImport('@supabase/supabase-js'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
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
  async getCharacterFromDatabase(sessionId: string, characterKey: string): Promise<Record<string, any> | null> {
    console.log(`📖 Attempting to retrieve character ${characterKey} from database for session ${sessionId}...`);
    
    const { createClient } = await import('../resilientLoader.ts').then(m => m.memoizedImport('@supabase/supabase-js'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
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
  async getCharacterSeed(sessionId: SessionId, avatarIdentity: AvatarIdentity, storyContext: StoryContext, sessionType: string = 'new', pageTextClothing: string | null = null): Promise<Record<string, any>> {
    const characterName = avatarIdentity.name || avatarIdentity.characterName || 'child';
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
        type: seedData.avatarType || avatarIdentity?.avatarType || avatarIdentity?.type,
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
  async createNewCharacterSeed(avatarIdentity: AvatarIdentity): Promise<CharacterSeed> {
    const characterName = avatarIdentity.name || avatarIdentity.characterName || 'child';
    const userId = `avatar-${avatarIdentity.type || avatarIdentity.avatarType || 'child'}-${avatarIdentity.skinTone || 'medium'}`; // Generate consistent ID from avatar
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
      avatarType: avatarIdentity.avatarType || avatarIdentity.type || 'child',
      skinTone: avatarIdentity.skinTone || 'medium',
      consistentClothingStyle,
      selectedCulturalHair: null, // Will be populated when cultural context is generated
      selectedCulturalFeatures: null, // Will be populated when cultural context is generated
      characterSpecificSeed,
      physicalTraits: avatarIdentity.physicalTraits
    };
  }

  /**
   * Generate stable seed from user data
   */
  generateStableSeed(seedInput: string | number, characterName: string): number {
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
  async updateCulturalSelections(sessionId: SessionId, characterKey: string, selectedCulturalHair: string | null, selectedCulturalFeatures: string | null): Promise<boolean> {
    console.log(`🎨 Updating cultural selections for character ${characterKey} in session ${sessionId}`);
    
    const { createClient } = await import('../resilientLoader.ts').then(m => m.memoizedImport('@supabase/supabase-js'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
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
   * Get visual detail from cache or database for consistency
   */
  async getVisualDetailFromCache(sessionId: SessionId, characterName: string, detailType: string): Promise<string | null> {
    const cacheKey = `${sessionId}_${characterName}_${detailType}`;
    
    // Check in-memory cache first
    if (this.visualDetailCache.has(cacheKey)) {
      return this.visualDetailCache.get(cacheKey);
    }
    
    // Check database
    try {
      const { createClient } = await import('../resilientLoader.ts').then(m => m.memoizedImport('@supabase/supabase-js'));
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') as string,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
      );
      
      const { data, error } = await supabase
        .from('visual_details_cache')
        .select('detail_value')
        .eq('session_id', sessionId)
        .eq('character_name', characterName)
        .eq('detail_type', detailType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Visual detail cache query error:', error);
        return null;
      }
      
      const value = data?.detail_value || null;
      if (value) {
        // Cache in memory for future requests
        this.visualDetailCache.set(cacheKey, value);
      }
      
      return value;
    } catch (error) {
      console.error('❌ Visual detail cache error:', error);
      return null;
    }
  }

  /**
   * Build character description from seed data
   * Now integrated with visual details cache for persistent clothing
   */
  async buildCharacterDescription(seedData: Partial<CharacterSeed>, storyContext: StoryContext, pageTextClothing: string | null = null, sessionId: SessionId | null = null): Promise<string> {
    const characterName = seedData.characterName || 'child';
    const age = '6-8'; // Fixed age since age is not part of CharacterSeed
    
    // PRIORITY 1: Check visual details cache for detected clothing
    let clothingStyle = '';
    if (sessionId) {
      try {
        const existingClothing = await this.getVisualDetailFromCache(sessionId, characterName, 'clothing');
        if (existingClothing) {
          clothingStyle = existingClothing;
          console.log(`👕 Using cached clothing for ${characterName}: ${existingClothing}`);
        }
      } catch (error) {
        console.log(`⚠️ Visual details cache query failed:`, (error as Error).message || 'Unknown error');
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
  async generateSecondaryCharacter(type: string, details: { name?: string }, userInfo: UserInfo, sessionId: SessionId): Promise<SecondaryCharacter> {
    const secondaryName = details.name || `${type}_character`;
    const cacheKey = `${sessionId}_secondary_${secondaryName}`;
    
    // Check database first
    const cached = await this.getCharacterFromDatabase(sessionId, cacheKey);
    if (isSecondaryCharacter(cached)) {
      console.log(`🎭 CACHED: Using existing secondary character ${secondaryName} (seed: ${cached.seed})`);
      return cached;
    }
    
    // Generate new secondary character with seed consistency
    const characterSpecificSeed = `secondary_${secondaryName}_${sessionId}`;
    const seed = this.generateStableSeed(characterSpecificSeed, secondaryName);
    
    // Generate basic description for secondary character
    const characterDescription = this.generateSecondaryCharacterDescription(secondaryName, type, seed);
    
    const secondaryData: SecondaryCharacter = {
      seed,
      name: secondaryName,
      type: type,
      description: characterDescription,
      relationshipType: type,
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
  async getSecondaryCharacterSeed(sessionId: SessionId, characterName: string, characterType: string = 'secondary_character'): Promise<Record<string, unknown>> {
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
  generateSecondaryCharacterDescription(characterName: string, type: string, seed: number): string {
    const seededRandom = this.createSeededRandom(seed);
    
    // Define basic character templates with minimal descriptions to let Runware decide appearance
    const characterTemplates: Record<string, string[]> = {
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
  detectSecondaryCharacters(pageText: string): string[] {
    if (!pageText) return [];
    
    const detectedCharacters: string[] = [];
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
   * Create seeded random number generator for consistency
   */
  createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Get African American hairstyles from consolidated cultural arrays
   */
  getAfricanAmericanHairStyles(): string[] {
    const contexts = getCulturalContextArrays();
    const africanAmericanContext = contexts['en-african-american'];
    return africanAmericanContext ? [
      ...(africanAmericanContext.characterNames || []),
      ...(africanAmericanContext.commonFoods || [])
    ] : [];
  }

  /**
   * Get African American facial features from consolidated cultural arrays
   */
  getAfricanAmericanFacialFeatures(): string[] {
    const contexts = getCulturalContextArrays();
    const africanAmericanContext = contexts['en-african-american'];
    return africanAmericanContext?.values || [];
  }

  private warnedRegional = false;
  /**
   * Get regional authenticity strings from consolidated cultural arrays
   */
  getRegionalAuthenticity(): string[] {
    if (!this.warnedRegional) {
      console.warn('[CharacterConsistency] REGIONAL_AUTHENTICITY_STRINGS not wired; returning [].');
      this.warnedRegional = true;
    }
    return [];
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