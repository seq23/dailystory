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
   * Enhanced with character-specific clothing detection and secondary character visual details
   */
  static async analyzeTextForDetails(sessionId, text, pageNumber, characterName = null) {
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
   * Get secondary character visual details for enriched descriptions
   */
  static async getSecondaryCharacterVisuals(sessionId, characterName) {
    try {
      const { data, error } = await this.supabase
        .from('visual_details_cache')
        .select('*')
        .eq('session_id', sessionId)
        .eq('character_name', characterName.toLowerCase());

      if (error || !data) {
        return null;
      }

      const visuals = {};
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
  static async buildEnrichedSecondaryCharacter(sessionId, characterType, baseDescription) {
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
      const appearanceDetails = Object.values(visuals.appearance).join(', ');
      enrichedDescription = `${baseDescription} with ${appearanceDetails}`;
    }
    
    // Add clothing details
    if (visuals.clothing) {
      const clothingDetails = Object.values(visuals.clothing).join(', ');
      enrichedDescription = `${enrichedDescription} wearing ${clothingDetails}`;
    }

    console.log(`✨ Enriched secondary character: ${characterType} → ${enrichedDescription}`);
    return enrichedDescription;
  }

  /**
   * Extract character name from character type (e.g., "caring mother" → "mom")
   */
  static extractCharacterNameFromDescription(characterType) {
    const lowerType = characterType.toLowerCase();
    if (lowerType.includes('mother') || lowerType.includes('mom')) return 'mom';
    if (lowerType.includes('father') || lowerType.includes('dad')) return 'dad';
    if (lowerType.includes('dog') || lowerType.includes('puppy')) return 'dog';
    if (lowerType.includes('cat') || lowerType.includes('kitten')) return 'cat';
    if (lowerType.includes('friend')) return 'friend';
    if (lowerType.includes('sister')) return 'sister';
    if (lowerType.includes('brother')) return 'brother';
    if (lowerType.includes('grandmother') || lowerType.includes('grandma')) return 'grandma';
    if (lowerType.includes('grandfather') || lowerType.includes('grandpa')) return 'grandpa';
    if (lowerType.includes('teacher')) return 'teacher';
    return characterType.split(' ').pop(); // Last word as fallback
  }

  /**
   * Add consistent fallback visuals using seeded randomization
   * Simplified to use single, emotionally-contextual descriptors (50-60% token reduction)
   */
  static addFallbackVisuals(characterType, baseDescription, sessionId) {
    const characterName = this.extractCharacterNameFromDescription(characterType);
    const seed = `${sessionId}_${characterName}`;
    
    // Define single, emotionally-contextual descriptors for token efficiency
    const fallbackVisuals = {
      mom: [
        'with warm smile',
        'with caring expression',
        'with gentle eyes',
        'with kind face'
      ],
      dad: [
        'with friendly smile',
        'with warm demeanor',
        'with gentle manner',
        'with caring look'
      ],
      dog: [
        'golden retriever',
        'friendly labrador',
        'playful companion',
        'loyal pet'
      ],
      cat: [
        'curious tabby',
        'sleepy feline',
        'gentle companion',
        'playful kitten'
      ],
      friend: [
        'with bright smile',
        'with cheerful expression',
        'with friendly manner',
        'with kind demeanor'
      ],
      grandma: [
        'with gentle smile',
        'with wise eyes',
        'with warm expression',
        'with loving look'
      ],
      grandpa: [
        'with kind smile',
        'with twinkling eyes',
        'with warm demeanor',
        'with gentle manner'
      ]
    };

    const options = fallbackVisuals[characterName] || ['with cheerful expression'];
    const selectedVisual = this.getSeededRandomItem(options, seed);
    
    console.log(`🎨 Added simplified fallback visual for ${characterType}: ${selectedVisual}`);
    return `${baseDescription} ${selectedVisual}`;
  }

  /**
   * Seeded random selection for consistent results
   */
  static getSeededRandomItem(array, seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % array.length;
    return array[index];
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