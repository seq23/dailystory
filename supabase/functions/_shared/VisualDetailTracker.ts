/**
 * Visual Detail Tracker - Database-Persistent Implementation
 * Tracks and manages visual details for consistency across story pages
 * Now with character-specific clothing detection and database persistence
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// TypeScript interfaces for visual details
interface VisualDetails {
  appearance?: Record<string, string>;
  clothing?: Record<string, string>;
  [key: string]: Record<string, string> | undefined;
}

interface VisualDetailRecord {
  detail_type: string;
  detail_key: string;
  detail_value: string;
}

// ============= UNIFIED VOCABULARY IMPORT FOR ENHANCED OBJECT DETECTION =============
// Import comprehensive vocabulary from Tier 2.5A for consistent color/size detection
const EXPANDED_COLOR_ARRAY = [
  // Basic Colors
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'grey',
  // Vibrant Colors
  'bright red', 'bright blue', 'bright green', 'bright yellow', 'bright orange', 'bright purple', 'bright pink',
  'vibrant red', 'vibrant blue', 'vibrant green', 'electric blue', 'neon green', 'hot pink', 'lime green',
  // Pastel Colors
  'light blue', 'light pink', 'light green', 'light yellow', 'soft blue', 'soft pink', 'soft purple',
  'pastel blue', 'pastel pink', 'pastel yellow', 'pale blue', 'pale green', 'pale yellow',
  // Dark Colors
  'dark blue', 'dark green', 'dark red', 'dark purple', 'navy blue', 'forest green', 'burgundy',
  // Metallic & Special Colors
  'silver', 'gold', 'metallic blue', 'shiny red', 'sparkly pink', 'glittery purple', 'rainbow',
  // Natural Colors
  'sky blue', 'ocean blue', 'grass green', 'sunset orange', 'sunshine yellow', 'cherry red'
];

const SIZE_ADJECTIVES = [
  'big', 'small', 'tiny', 'huge', 'large', 'little', 'giant', 'enormous', 
  'mini', 'massive', 'microscopic', 'colossal', 'petite', 'immense'
];

const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
  'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
  'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves',
  'cap', 'helmet', 'vest', 'cardigan', 'blazer', 'overalls', 'romper',
  'tunic', 'polo', 'turtleneck', 'tank top', 'sandals', 'slippers',
  'belt', 'suspenders', 'bandana', 'headband', 'mittens', 'raincoat'
];

const UNIFIED_OBJECT_CATEGORIES = [
  // Food Items
  'apple', 'banana', 'sandwich', 'cookie', 'cake', 'pizza', 'ice cream', 'cupcake', 'donut', 'bread',
  // Animals & Pets
  'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'turtle', 'horse', 'cow', 'pig', 'sheep', 'chicken',
  // Vehicles & Transportation
  'car', 'truck', 'bus', 'train', 'airplane', 'helicopter', 'boat', 'ship', 'bicycle', 'scooter',
  // Toys & Games
  'ball', 'doll', 'teddy bear', 'blocks', 'puzzle', 'kite', 'toy car', 'toy train', 'frisbee', 'bubbles',
  // Tools & Instruments
  'hammer', 'paintbrush', 'scissors', 'ruler', 'magnifying glass', 'telescope', 'camera', 'phone',
  // Nature & Outdoor
  'tree', 'flower', 'leaf', 'rock', 'shell', 'stick', 'feather', 'crystal', 'butterfly', 'rainbow',
  // Sports & Recreation
  'soccer ball', 'basketball', 'football', 'baseball', 'tennis ball', 'skateboard', 'helmet', 'bicycle'
];

export class VisualDetailTracker {
  // Initialize Supabase client for database operations
  static supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  /**
   * Analyze text for visual details and store them in database for consistency
   * Enhanced with character-specific clothing detection and secondary character visual details
   */
  static async analyzeTextForDetails(sessionId: string, text: string, pageNumber: number, characterName: string | null = null) {
    console.log(`🎨 VisualDetailTracker - Analyzing text for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Enhanced patterns for character-specific clothing detection
    const characterClothingPattern = new RegExp(
      `(${characterName || '[A-Z][a-z]+'}|[A-Z][a-z]+)\\s+(has|wears?|wearing|puts?\\s+on|dresses?\\s+in)\\s+(a|an|the)?\\s*(new|old)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)?\\s*(shirt|dress|pants|hat|jacket|coat|shoes|boots|socks|gloves|scarf|belt|tie|sweater|blouse|skirt|shorts|vest|uniform)`,
      'gi'
    );
    
    // ============= NEW: SECONDARY CHARACTER VISUAL DETECTION PATTERNS =============
    // Mom/Mother visual patterns
    const momVisualPattern = /(mom|mother|mommy|mama)\\s+(has|with|wearing|wears|in)\\s+(a|an|the)?\\s*(long|short|curly|straight|blonde|brown|black|red|gray|grey)?\\s*(hair|dress|shirt|blouse|jacket|coat|apron|glasses|smile)/gi;
    const momColorPattern = /(mom|mother|mommy|mama)\\s+in\\s+(a|an|the)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)\\s*(dress|shirt|blouse|jacket|coat|apron)/gi;
    
    // Dad/Father visual patterns  
    const dadVisualPattern = /(dad|father|daddy|papa)\\s+(has|with|wearing|wears|in)\\s+(a|an|the)?\\s*(beard|mustache|glasses|hat|cap|shirt|jacket|tie|suit)/gi;
    const dadColorPattern = /(dad|father|daddy|papa)\\s+in\\s+(a|an|the)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey)\\s*(shirt|jacket|tie|suit|hat|cap)/gi;
    
    // Animal visual patterns
    const dogVisualPattern = /(dog|puppy|pup)\\s+(is|has|with)?\\s*(a|an|the)?\\s*(golden|brown|black|white|spotted|fluffy|big|small|tiny|large|retriever|labrador|beagle|collie|shepherd)/gi;
    const catVisualPattern = /(cat|kitten|kitty)\\s+(is|has|with)?\\s*(a|an|the)?\\s*(orange|black|white|gray|grey|tabby|fluffy|persian|siamese|calico|striped)/gi;
    
    // General secondary character colors
    const secondaryColorPattern = /(friend|sister|brother|grandma|grandmother|grandpa|grandfather|teacher|neighbor)\\s+(has|wearing|wears|with|in)\\s+(a|an|the)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)\\s*(hair|dress|shirt|hat|jacket|coat|glasses)/gi;
    
    // ============= ENHANCED COLOR AND SIZE PATTERNS WITH UNIFIED VOCABULARY =============
    // Use expanded color array for comprehensive color detection
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
      const clothingItem = match[7]; // clothing type
      const color = match[6] || 'unspecified'; // color if present
      const modifier = match[4] || ''; // new/old if present
      
      const clothingDescription = `${modifier} ${color} ${clothingItem}`.trim();
      
      await this.saveDetailToDatabase(
        sessionId, 
        characterInText.toLowerCase(), 
        'clothing', 
        clothingItem, 
        clothingDescription, 
        pageNumber
      );
      
      console.log(`👕 New character clothing: ${characterInText} - ${clothingDescription}`);
    }
    
    // ============= NEW: PROCESS SECONDARY CHARACTER VISUAL DETAILS =============
    // Process mom visual details
    while ((match = momVisualPattern.exec(text)) !== null) {
      const attribute = match[5]; // hair, dress, etc.
      const descriptor = match[4] || 'default'; // blonde, long, etc.
      const fullDescription = `${descriptor} ${attribute}`.trim();
      
      await this.saveDetailToDatabase(sessionId, 'mom', 'appearance', attribute, fullDescription, pageNumber);
      console.log(`👩 Mom visual detail: ${fullDescription}`);
    }
    
    // Process mom color details
    while ((match = momColorPattern.exec(text)) !== null) {
      const color = match[3];
      const item = match[4];
      const fullDescription = `${color} ${item}`;
      
      await this.saveDetailToDatabase(sessionId, 'mom', 'clothing', item, fullDescription, pageNumber);
      console.log(`👩 Mom clothing: ${fullDescription}`);
    }
    
    // Process dad visual details
    while ((match = dadVisualPattern.exec(text)) !== null) {
      const attribute = match[4]; // beard, hat, etc.
      
      await this.saveDetailToDatabase(sessionId, 'dad', 'appearance', attribute, attribute, pageNumber);
      console.log(`👨 Dad visual detail: ${attribute}`);
    }
    
    // Process dad color details  
    while ((match = dadColorPattern.exec(text)) !== null) {
      const color = match[3];
      const item = match[4];
      const fullDescription = `${color} ${item}`;
      
      await this.saveDetailToDatabase(sessionId, 'dad', 'clothing', item, fullDescription, pageNumber);
      console.log(`👨 Dad clothing: ${fullDescription}`);
    }
    
    // Process dog visual details
    while ((match = dogVisualPattern.exec(text)) !== null) {
      const descriptor = match[4]; // golden, brown, etc.
      if (descriptor) {
        await this.saveDetailToDatabase(sessionId, 'dog', 'appearance', 'breed_color', descriptor, pageNumber);
        console.log(`🐕 Dog visual detail: ${descriptor}`);
      }
    }
    
    // Process cat visual details
    while ((match = catVisualPattern.exec(text)) !== null) {
      const descriptor = match[4]; // orange, tabby, etc.
      if (descriptor) {
        await this.saveDetailToDatabase(sessionId, 'cat', 'appearance', 'breed_color', descriptor, pageNumber);
        console.log(`🐱 Cat visual detail: ${descriptor}`);
      }
    }
    
    // Process general secondary character colors
    while ((match = secondaryColorPattern.exec(text)) !== null) {
      const character = match[1].toLowerCase();
      const color = match[4];
      const item = match[5];
      const fullDescription = `${color} ${item}`;
      
      await this.saveDetailToDatabase(sessionId, character, 'appearance', item, fullDescription, pageNumber);
      console.log(`👥 Secondary character detail: ${character} - ${fullDescription}`);
    }
    
    // ============= ENHANCED OBJECT DETECTION WITH UNIFIED VOCABULARY =============
    // Process color + size + object combinations (most comprehensive)
    while ((match = colorSizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const color = match[2].toLowerCase();
      const object = match[3].toLowerCase();
      const fullDescription = `${size} ${color} ${object}`;
      
      await this.saveDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`🎯 Enhanced object detail: ${fullDescription}`);
    }
    
    // Process color + object combinations  
    while ((match = colorPattern.exec(text)) !== null) {
      const color = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const fullDescription = `${color} ${object}`;
      
      await this.saveDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`🎨 Color object detail: ${fullDescription}`);
    }
    
    // Process size + object combinations
    while ((match = sizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const fullDescription = `${size} ${object}`;
      
      await this.saveDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`📏 Size object detail: ${fullDescription}`);
    }
  }

  /**
   * Save visual detail to database
   */
  static async saveDetailToDatabase(sessionId: string, characterName: string, detailType: string, detailKey: string, detailValue: string, pageNumber: number) {
    try {
      // Check if detail already exists
      const { data: existing } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName)
        .eq('detail_type', detailType)
        .eq('detail_key', detailKey)
        .single();

      if (existing) {
        // Update existing detail
        const { error } = await this.supabase
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
        const { error } = await this.supabase
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
      console.error('Database error in saveDetailToDatabase:', error);
    }
  }

  /**
   * Get character clothing from database
   */
  static async getCharacterClothing(sessionId: string, characterName: string) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase())
        .eq('detail_type', 'clothing');

      if (error) {
        console.error('Error fetching character clothing:', error);
        return {};
      }

      const clothing: Record<string, any> = {};
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
   * Get all visual details for a character
   */
  static async getCharacterDetails(sessionId: string, characterName: string) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase());

      if (error) {
        console.error('Error fetching character details:', error);
        return {};
      }

      const details: Record<string, any> = {};
      data?.forEach(detail => {
        if (!details[detail.detail_type]) {
          details[detail.detail_type] = {};
        }
        details[detail.detail_type][detail.detail_key] = detail.detail_value;
      });

      return details;
    } catch (error) {
      console.error('Database error in getCharacterDetails:', error);
      return {};
    }
  }

  /**
   * Build clothing description for character prompt
   */
  static async buildClothingDescription(sessionId: string, characterName: string) {
    const clothing = await this.getCharacterClothing(sessionId, characterName);
    
    if (Object.keys(clothing).length === 0) {
      return null; // No specific clothing detected
    }
    
    const clothingItems = Object.values(clothing);
    return `wearing ${clothingItems.join(', ')}`;
  }

  /**
   * Get all visual details for a session as prompt addition
   */
  static async getVisualDetailsForPrompt(sessionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId);

      if (error || !data) {
        return '';
      }

      const details = data.map(detail => 
        `${detail.character_name !== 'general' ? detail.character_name + ' ' : ''}${detail.detail_value}`
      );

      return details.join(', ');
    } catch (error) {
      console.error('Database error in getVisualDetailsForPrompt:', error);
      return '';
    }
  }

  /**
   * Get secondary character visual details for enriched descriptions
   */
  static async getSecondaryCharacterVisuals(sessionId: string, characterName: string) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase());

      if (error || !data) {
        return null;
      }

      const visuals: VisualDetails = {};
      data.forEach((detail: VisualDetailRecord) => {
        if (!visuals[detail.detail_type]) {
          visuals[detail.detail_type] = {};
        }
        visuals[detail.detail_type]![detail.detail_key] = detail.detail_value;
      });

      return visuals;
    } catch (error) {
      console.error('Database error in getSecondaryCharacterVisuals:', error);
      return null;
    }
  }

  /**
   * Build enriched secondary character description with visual details
   */
  static async buildEnrichedSecondaryCharacter(sessionId: string, characterType: string, baseDescription: string) {
    const characterName = this.extractCharacterNameFromDescription(characterType);
    const visuals = await this.getSecondaryCharacterVisuals(sessionId, characterName);
    
    if (!visuals || Object.keys(visuals).length === 0) {
      // Return base description with seeded visual fallback
      return this.addFallbackVisuals(characterType, baseDescription, sessionId);
    }

    // Build enriched description with actual visual details
    let enrichedDescription = baseDescription;
    
    // Add appearance details
    if (visuals.appearance) {
      const appearanceItems = Object.values(visuals.appearance);
      enrichedDescription += ` with ${appearanceItems.join(', ')}`;
    }
    
    // Add clothing details
    if (visuals.clothing) {
      const clothingItems = Object.values(visuals.clothing);
      enrichedDescription += ` wearing ${clothingItems.join(', ')}`;
    }
    
    console.log(`🎨 Enriched secondary character: ${characterName} -> ${enrichedDescription}`);
    return enrichedDescription;
  }

  /**
   * Extract character name from description or character type
   */
  static extractCharacterNameFromDescription(characterType: string): string {
    // Simple extraction - look for common relationship patterns
    const relationshipMap = {
      'mom': 'mom',
      'mother': 'mom', 
      'dad': 'dad',
      'father': 'dad',
      'sister': 'sister',
      'brother': 'brother',
      'friend': 'friend',
      'teacher': 'teacher',
      'dog': 'dog',
      'cat': 'cat'
    };
    
    const lowerType = characterType.toLowerCase();
    for (const [key, value] of Object.entries(relationshipMap)) {
      if (lowerType.includes(key)) {
        return value;
      }
    }
    
    return 'friend'; // Default fallback
  }

  /**
   * Add fallback visuals for characters without stored visual details
   */
  static addFallbackVisuals(characterType: string, baseDescription: string, sessionId: string): string {
    // Generate deterministic fallback visuals based on session and character type
    const seed = this.generateSeed(`${sessionId}_${characterType}_fallback`);
    const seededRandom = this.createSeededRandom(seed);
    
    const fallbackVisuals: Record<string, string[]> = {
      'mom': ['with kind eyes', 'wearing a comfortable outfit', 'with a gentle smile'],
      'dad': ['with a friendly face', 'wearing casual clothes', 'with a warm expression'],
      'friend': ['with a cheerful expression', 'wearing colorful clothes', 'with bright eyes'],
      'teacher': ['wearing professional attire', 'with a patient expression', 'with encouraging smile'],
      'dog': ['with a wagging tail', 'with fluffy fur', 'with bright eyes'],
      'cat': ['with whiskers twitching', 'with soft fur', 'with curious eyes']
    };
    
    const characterName = this.extractCharacterNameFromDescription(characterType);
    const options = fallbackVisuals[characterName] || fallbackVisuals['friend'];
    const selectedVisual = options[Math.floor(seededRandom() * options.length)];
    
    const enrichedDescription = `${baseDescription} ${selectedVisual}`;
    console.log(`🎨 Added fallback visual: ${characterName} -> ${enrichedDescription}`);
    
    return enrichedDescription;
  }

  /**
   * Generate deterministic seed from string
   */
  static generateSeed(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 999999) + 1;
  }

  /**
   * Create seeded random number generator
   */
  static createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Clear visual details cache from database
   */
  static async clearVisualDetailsCache(sessionId: string | null = null) {
    try {
      let query = this.supabase.from('visual_details_cache').delete();
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        query = query.neq('session_id', ''); // Delete all if no specific session
      }

      const { error } = await query;

      if (error) {
        console.error('Error clearing visual details cache:', error);
        return { success: false, cleared: 0, message: error.message };
      }

      console.log(`🗑️ Visual details cache cleared${sessionId ? ` for session ${sessionId}` : ''}`);
      
      return {
        success: true,
        cleared: 0, // Supabase delete doesn't return count by default
        message: `Visual details cache cleared${sessionId ? ` for session ${sessionId}` : ''}`
      };
    } catch (error: unknown) {
      console.error('Database error in clearVisualDetailsCache:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, cleared: 0, message: errorMessage };
    }
  }
}