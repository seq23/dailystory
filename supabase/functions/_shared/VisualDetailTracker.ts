/**
 * Visual Detail Tracker - Database-Persistent Implementation (TypeScript)
 * Tracks and manages visual details for consistency across story pages
 * Now with character-specific clothing detection and database persistence
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// TypeScript interfaces
interface VisualDetail {
  sessionId: string;
  characterName: string;
  detailType: string;
  detailKey: string;
  detailValue: string;
  pageNumber: number;
}

interface CharacterClothing {
  [key: string]: string;
}

interface CharacterDetails {
  [detailType: string]: {
    [detailKey: string]: string;
  };
}

// ============= UNIFIED VOCABULARY FOR ENHANCED OBJECT DETECTION =============
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
  private static supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  /**
   * Analyze text for visual details and store them in database for consistency
   * Enhanced with character-specific clothing detection and secondary character visual details
   */
  static async analyzeTextForDetails(sessionId: string, text: string, pageNumber: number, characterName: string | null = null): Promise<void> {
    console.log(`🎨 VisualDetailTracker - Analyzing text for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Enhanced patterns for character-specific clothing detection
    const characterClothingPattern = new RegExp(
      `(${characterName || '[A-Z][a-z]+'}|[A-Z][a-z]+)\\s+(has|wears?|wearing|puts?\\s+on|dresses?\\s+in)\\s+(a|an|the)?\\s*(new|old)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)?\\s*(shirt|dress|pants|hat|jacket|coat|shoes|boots|socks|gloves|scarf|belt|tie|sweater|blouse|skirt|shorts|vest|uniform)`,
      'gi'
    );
    
    // ============= SECONDARY CHARACTER VISUAL DETECTION PATTERNS =============
    const momVisualPattern = /(mom|mother|mommy|mama)\s+(has|with|wearing|wears|in)\s+(a|an|the)?\s*(long|short|curly|straight|blonde|brown|black|red|gray|grey)?\s*(hair|dress|shirt|blouse|jacket|coat|apron|glasses|smile)/gi;
    const momColorPattern = /(mom|mother|mommy|mama)\s+in\s+(a|an|the)?\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)\s*(dress|shirt|blouse|jacket|coat|apron)/gi;
    
    const dadVisualPattern = /(dad|father|daddy|papa)\s+(has|with|wearing|wears|in)\s+(a|an|the)?\s*(beard|mustache|glasses|hat|cap|shirt|jacket|tie|suit)/gi;
    const dadColorPattern = /(dad|father|daddy|papa)\s+in\s+(a|an|the)?\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey)\s*(shirt|jacket|tie|suit|hat|cap)/gi;
    
    const dogVisualPattern = /(dog|puppy|pup)\s+(is|has|with)?\s*(a|an|the)?\s*(golden|brown|black|white|spotted|fluffy|big|small|tiny|large|retriever|labrador|beagle|collie|shepherd)/gi;
    const catVisualPattern = /(cat|kitten|kitty)\s+(is|has|with)?\s*(a|an|the)?\s*(orange|black|white|gray|grey|tabby|fluffy|persian|siamese|calico|striped)/gi;
    
    const secondaryColorPattern = /(friend|sister|brother|grandma|grandmother|grandpa|grandfather|teacher|neighbor)\s+(has|wearing|wears|with|in)\s+(a|an|the)?\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)\s*(hair|dress|shirt|hat|jacket|coat|glasses)/gi;
    
    // ============= ENHANCED COLOR AND SIZE PATTERNS WITH UNIFIED VOCABULARY =============
    const expandedColorWords = EXPANDED_COLOR_ARRAY.join('|').replace(/\s+/g, '\\s+');
    const sizeWords = SIZE_ADJECTIVES.join('|');
    const objectWords = UNIFIED_OBJECT_CATEGORIES.join('|').replace(/\s+/g, '\\s+');
    
    const colorPattern = new RegExp(`(${expandedColorWords})\\s+(${objectWords})`, 'gi');
    const sizePattern = new RegExp(`(${sizeWords})\\s+(${objectWords})`, 'gi');
    const colorSizePattern = new RegExp(`(${sizeWords})\\s+(${expandedColorWords})\\s+(${objectWords})`, 'gi');
    
    // Process character-specific clothing
    let match: RegExpExecArray | null;
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
    
    // Process secondary character visual details
    while ((match = momVisualPattern.exec(text)) !== null) {
      const attribute = match[5]; // hair, dress, etc.
      const descriptor = match[4] || 'default'; // blonde, long, etc.
      const fullDescription = `${descriptor} ${attribute}`.trim();
      
      await this.saveDetailToDatabase(sessionId, 'mom', 'appearance', attribute, fullDescription, pageNumber);
      console.log(`👩 Mom visual detail: ${fullDescription}`);
    }
    
    // Continue processing other patterns...
    while ((match = colorSizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const color = match[2].toLowerCase();
      const object = match[3].toLowerCase();
      const fullDescription = `${size} ${color} ${object}`;
      
      await this.saveDetailToDatabase(sessionId, 'general', 'colored_object', object, fullDescription, pageNumber);
      console.log(`🎯 Enhanced object detail: ${fullDescription}`);
    }
  }

  /**
   * Save visual detail to database
   */
  static async saveDetailToDatabase(sessionId: string, characterName: string, detailType: string, detailKey: string, detailValue: string, pageNumber: number): Promise<void> {
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
  static async getCharacterClothing(sessionId: string, characterName: string): Promise<CharacterClothing> {
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

      const clothing: CharacterClothing = {};
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
  static async getCharacterDetails(sessionId: string, characterName: string): Promise<CharacterDetails> {
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

      const details: CharacterDetails = {};
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
  static async buildClothingDescription(sessionId: string, characterName: string): Promise<string | null> {
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
  static async getVisualDetailsForPrompt(sessionId: string): Promise<string> {
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
  static async getSecondaryCharacterVisuals(sessionId: string, characterName: string): Promise<CharacterDetails | null> {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase());

      if (error || !data) {
        return null;
      }

      const visuals: CharacterDetails = {};
      data.forEach(detail => {
        if (!visuals[detail.detail_type]) {
          visuals[detail.detail_type] = {};
        }
        visuals[detail.detail_type][detail.detail_key] = detail.detail_value;
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
  static async buildEnrichedSecondaryCharacter(sessionId: string, characterType: string, baseDescription: string): Promise<string> {
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
      Object.values(visuals.appearance).forEach(detail => {
        enrichedDescription += ` with ${detail}`;
      });
    }

    // Add clothing details
    if (visuals.clothing) {
      const clothingItems = Object.values(visuals.clothing);
      enrichedDescription += ` wearing ${clothingItems.join(', ')}`;
    }

    return enrichedDescription;
  }

  // Helper methods
  private static extractCharacterNameFromDescription(description: string): string {
    const words = description.toLowerCase().split(' ');
    const commonTypes = ['mom', 'mother', 'dad', 'father', 'friend', 'teacher', 'dog', 'cat'];
    return commonTypes.find(type => words.includes(type)) || 'character';
  }

  private static addFallbackVisuals(characterType: string, baseDescription: string, sessionId: string): string {
    // Simple fallback for now - could be enhanced with seeded random visuals
    return baseDescription;
  }
}