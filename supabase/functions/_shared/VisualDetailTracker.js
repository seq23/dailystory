/**
 * Visual Detail Tracker - Database-Persistent Implementation
 * Tracks and manages visual details for consistency across story pages
 * Now with character-specific clothing detection and database persistence
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export class VisualDetailTracker {
  // Initialize Supabase client for database operations
  static supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  /**
   * Analyze text for visual details and store them in database for consistency
   * Enhanced with character-specific clothing detection
   */
  static async analyzeTextForDetails(sessionId, text, pageNumber, characterName = null) {
    console.log(`🎨 VisualDetailTracker - Analyzing text for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Enhanced patterns for character-specific clothing detection
    const characterClothingPattern = new RegExp(
      `(${characterName || '[A-Z][a-z]+'}|[A-Z][a-z]+)\\s+(has|wears?|wearing|puts?\\s+on|dresses?\\s+in)\\s+(a|an|the)?\\s*(new|old)?\\s*(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|colorful)?\\s*(shirt|dress|pants|hat|jacket|coat|shoes|boots|socks|gloves|scarf|belt|tie|sweater|blouse|skirt|shorts|vest|uniform)`,
      'gi'
    );
    
    // General color and size patterns (existing)
    const colorPattern = /(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey)\s+(car|house|dress|shirt|hat|ball|toy|flower)/gi;
    const sizePattern = /(big|small|large|tiny|huge|little)\s+(car|house|tree|dog|cat|ball|toy)/gi;
    
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
    
    // Process general color details
    while ((match = colorPattern.exec(text)) !== null) {
      const color = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      
      await this.saveDetailToDatabase(
        sessionId, 
        'general', 
        'color', 
        object, 
        color, 
        pageNumber
      );
      
      console.log(`🎨 New color detail: ${object} is ${color}`);
    }
    
    // Process size details
    while ((match = sizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      
      await this.saveDetailToDatabase(
        sessionId, 
        'general', 
        'size', 
        object, 
        size, 
        pageNumber
      );
      
      console.log(`📏 New size detail: ${object} is ${size}`);
    }
  }

  /**
   * Save visual detail to database
   */
  static async saveDetailToDatabase(sessionId, characterName, detailType, detailKey, detailValue, pageNumber) {
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
  static async getCharacterClothing(sessionId, characterName) {
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
   * Get all visual details for a character
   */
  static async getCharacterDetails(sessionId, characterName) {
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

      const details = {};
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
  static async buildClothingDescription(sessionId, characterName) {
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
  static async getVisualDetailsForPrompt(sessionId) {
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
   * Clear all details for a session from database
   */
  static async clearSessionDetails(sessionId) {
    try {
      const { error } = await this.supabase
        .from('visual_details_cache')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error clearing session details:', error);
      } else {
        console.log(`🧹 Cleared visual details for session ${sessionId}`);
      }
    } catch (error) {
      console.error('Database error in clearSessionDetails:', error);
    }
  }
}