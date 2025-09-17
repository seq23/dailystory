/**
 * Visual Detail Tracker - Database-Persistent Implementation
 * Tracks and manages visual details for consistency across story pages
 * Now with character-specific clothing detection and database persistence
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EXPANDED_COLOR_ARRAY, TIER_25_UNIFIED_VOCABULARY_EXTENDED } from './tier25Vocabulary.js';

const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
  'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
  'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves',
  'cap', 'helmet', 'vest', 'cardigan', 'blazer', 'overalls', 'romper',
  'tunic', 'polo', 'turtleneck', 'tank top', 'sandals', 'slippers',
  'belt', 'suspenders', 'bandana', 'headband', 'mittens', 'raincoat'
];

export class VisualDetailTracker {
  constructor() {
    // Initialize Supabase client for database operations
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  /**
   * Analyze text for visual details and store them in database for consistency
   * Enhanced with character-specific clothing detection and secondary character visual details
   */
  async analyzeTextForDetails(sessionId, text, pageNumber, characterName = null) {
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
    const sizeWords = TIER_25_UNIFIED_VOCABULARY_EXTENDED.descriptors.size.join('|');
    const objectWords = TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.toys
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.nature)
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.household)
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.animals)
      .join('|').replace(/\s+/g, '\\s+');
    
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
  async saveDetailToDatabase(sessionId, characterName, detailType, detailKey, detailValue, pageNumber) {
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
  async getCharacterClothing(sessionId, characterName) {
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
   * Get visual history for consistency - matches frontend interface
   */
  async getVisualHistory(userId, characterName, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('character_name', characterName.toLowerCase())
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching visual history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error in getVisualHistory:', error);
      return [];
    }
  }

  /**
   * Get consistency recommendations - matches frontend interface
   */
  async getConsistencyRecommendations(userId, characterName) {
    try {
      const history = await this.getVisualHistory(userId, characterName);
      
      // Simple consistency score based on visual detail consistency
      const consistencyScore = history.length > 0 ? 1.0 : 0.5;
      
      return {
        recommendations: history.length > 0 
          ? [`Use established visual details for ${characterName}`]
          : [`No visual history found for ${characterName} - building new details`],
        consistencyScore
      };
    } catch (error) {
      console.error('Error getting consistency recommendations:', error);
      return { recommendations: [], consistencyScore: 0.5 };
    }
  }

  /**
   * Get session setting from previous pages for cross-page persistence
   */
  async getSessionSetting(sessionId) {
    try {
      const { data, error } = await this.supabase
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
   * Track visual detail - matches frontend interface
   */
  async trackVisualDetail(detail) {
    const { user_id, character_name, session_id, page_number, image_url, visual_elements } = detail;
    
    try {
      const { data, error } = await this.supabase
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

  // Legacy static methods for backward compatibility
  static async analyzeTextForDetails(sessionId, text, pageNumber, characterName = null) {
    const tracker = new VisualDetailTracker();
    return tracker.analyzeTextForDetails(sessionId, text, pageNumber, characterName);
  }

  static async getCharacterClothing(sessionId, characterName) {
    const tracker = new VisualDetailTracker();
    return tracker.getCharacterClothing(sessionId, characterName);
  }

  static async getSessionSetting(sessionId) {
    const tracker = new VisualDetailTracker();
    return tracker.getSessionSetting(sessionId);
  }

  static async buildClothingDescription(sessionId, characterName) {
    const tracker = new VisualDetailTracker();
    const clothing = await tracker.getCharacterClothing(sessionId, characterName);
    
    if (Object.keys(clothing).length === 0) {
      return null; // No specific clothing detected
    }
    
    const clothingItems = Object.values(clothing);
    return `wearing ${clothingItems.join(', ')}`;
  }

  static async getVisualDetailsForPrompt(sessionId) {
    const tracker = new VisualDetailTracker();
    try {
      const { data, error } = await tracker.supabase
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
}

// Export singleton instance for consistent access
export const visualDetailTracker = new VisualDetailTracker();