// ============= CHARACTER CONSISTENCY SERVICE =============
// See: docs/IMAGE_GENERATION_SYSTEM_OVERVIEW.md

export class CharacterConsistencyService {
  private static instance: CharacterConsistencyService;
  private visualDetailCache = new Map<string, any>();

  private constructor() {}

  public static getInstance(): CharacterConsistencyService {
    if (!CharacterConsistencyService.instance) {
      CharacterConsistencyService.instance = new CharacterConsistencyService();
    }
    return CharacterConsistencyService.instance;
  }

  /**
   * Analyze visual details from page text and cache them for consistency
   */
  async analyzeVisualDetails(sessionId: string, pageText: string, pageNumber: number, characterName?: string): Promise<void> {
    try {
      const cacheKey = `${sessionId}_${pageNumber}`;
      
      // Extract visual details from text
      const details = this.extractVisualDetails(pageText);
      
      // Store in cache for consistency across pages
      this.visualDetailCache.set(cacheKey, {
        ...details,
        characterName,
        pageNumber,
        timestamp: Date.now()
      });

      console.log(`Visual details analyzed for page ${pageNumber}:`, details);
    } catch (error) {
      console.warn('Visual detail analysis failed:', error);
    }
  }

  /**
   * Get colored objects description for consistent object representation
   */
  async getColoredObjects(sessionId: string): Promise<string> {
    try {
      // Combine all cached visual details for this session
      const sessionObjects: string[] = [];
      
      this.visualDetailCache.forEach((details, key) => {
        if (key.startsWith(sessionId)) {
          if (details.coloredObjects?.length) {
            sessionObjects.push(...details.coloredObjects);
          }
        }
      });

      // Remove duplicates and return as comma-separated string
      const uniqueObjects = [...new Set(sessionObjects)];
      return uniqueObjects.slice(0, 3).join(', '); // Limit to 3 objects
    } catch (error) {
      console.warn('Colored objects retrieval failed:', error);
      return '';
    }
  }

  /**
   * PHASE 8: Extract visual details including character appearance from page text
   */
  private extractVisualDetails(pageText: string, characterName?: string): any {
    if (!pageText) return { 
      coloredObjects: [], 
      atmosphericWords: [], 
      characterAppearance: null 
    };

    const text = pageText.toLowerCase();
    const coloredObjects: string[] = [];
    const atmosphericWords: string[] = [];
    let characterAppearance: string | null = null;

    // PHASE 8: Character appearance extraction (story text priority)
    if (characterName) {
      const nameLower = characterName.toLowerCase();
      
      // Appearance patterns for character descriptions
      const appearancePatterns = [
        // Hair descriptions
        new RegExp(`${nameLower}.*?(with|has|sports?|shows?)\\s+([^.!?]*hair[^.!?]*?)(?=[.!?]|$)`, 'i'),
        // Skin/complexion descriptions
        new RegExp(`${nameLower}.*?(with|has)\\s+([^.!?]*skin[^.!?]*?)(?=[.!?]|$)`, 'i'),
        // Eye descriptions  
        new RegExp(`${nameLower}.*?(with|has)\\s+([^.!?]*eyes?[^.!?]*?)(?=[.!?]|$)`, 'i'),
        // Clothing descriptions
        new RegExp(`${nameLower}.*?(wearing|dressed in|in)\\s+([^.!?]+?)(?=[.!?]|$)`, 'i'),
        // General appearance
        new RegExp(`${nameLower}.*?(looks?|appears?|seems?)\\s+([^.!?]+?)(?=[.!?]|$)`, 'i')
      ];
      
      const appearances: string[] = [];
      
      for (const pattern of appearancePatterns) {
        const match = pageText.match(pattern);
        if (match && match[2]) {
          const description = match[2].trim();
          if (description.length > 3 && description.length < 100) {
            appearances.push(description);
          }
        }
      }
      
      if (appearances.length > 0) {
        characterAppearance = appearances.join(', ').replace(/[.!?]+$/, '');
        console.log('✅ CHARACTER APPEARANCE EXTRACTED:', characterAppearance);
      }
    }

    // Color patterns with objects
    const colorObjectPatterns = [
      /\b(red|blue|green|yellow|purple|pink|orange|white|black|golden|silver)\s+(\w+)/g,
      /\b(\w+)\s+(red|blue|green|yellow|purple|pink|orange|white|black|golden|silver)/g
    ];

    colorObjectPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const coloredObject = match[0];
        if (coloredObject.length > 3) { // Filter out short matches
          coloredObjects.push(coloredObject);
        }
      }
    });

    // Atmospheric descriptive words
    const atmosphericPatterns = [
      /\b(sunny|bright|dark|misty|foggy|stormy|peaceful|magical|mysterious|cozy|warm|cold|cheerful|gloomy)\b/g
    ];

    atmosphericPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        atmosphericWords.push(match[0]);
      }
    });

    return {
      coloredObjects: [...new Set(coloredObjects)].slice(0, 3),
      atmosphericWords: [...new Set(atmosphericWords)].slice(0, 3),
      characterAppearance: characterAppearance
    };
  }

  /**
   * PHASE 8: Get character appearance from story text with caching
   */
  async getCharacterAppearanceFromStory(sessionId: string, characterName?: string): Promise<string | null> {
    try {
      let combinedAppearance: string | null = null;
      const appearances: string[] = [];
      
      // Collect appearance details from all cached pages
      this.visualDetailCache.forEach((details, key) => {
        if (key.startsWith(sessionId) && details.characterAppearance) {
          appearances.push(details.characterAppearance);
        }
      });
      
      if (appearances.length > 0) {
        // Combine and deduplicate appearance details
        const uniqueAppearances = [...new Set(appearances)];
        combinedAppearance = uniqueAppearances.join(', ');
        console.log('✅ STORY APPEARANCE RETRIEVED:', combinedAppearance);
      }
      
      return combinedAppearance;
    } catch (error) {
      console.warn('Character appearance extraction failed:', error);
      return null;
    }
  }

  /**
   * Clear all cached data for a session
   */
  clearSession(sessionId: string): void {
    const keysToDelete: string[] = [];
    
    this.visualDetailCache.forEach((_, key) => {
      if (key.startsWith(sessionId)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.visualDetailCache.delete(key));
    console.log(`Cleared visual details for session: ${sessionId}`);
  }

  /**
   * PHASE 1: Extract traits from story text analysis
   */
  extractTraitsFromStory(storyText: string, characterName?: string): any {
    if (!storyText) return {
      hairColor: 'brown',
      hairStyle: 'curly',
      skinTone: 'medium', 
      facialFeatures: ['friendly eyes'],
      clothingStyle: 'casual',
      accessories: []
    };

    // Basic trait extraction patterns
    const text = storyText.toLowerCase();
    const traits = {
      hairColor: 'brown',
      hairStyle: 'curly',
      skinTone: 'medium',
      facialFeatures: ['friendly eyes'],
      clothingStyle: 'casual', 
      accessories: []
    };

    // Hair color extraction
    if (text.includes('blonde') || text.includes('golden hair')) traits.hairColor = 'blonde';
    if (text.includes('red hair') || text.includes('ginger')) traits.hairColor = 'red';
    if (text.includes('black hair') || text.includes('dark hair')) traits.hairColor = 'black';

    // Clothing style extraction  
    if (text.includes('dress') || text.includes('formal')) traits.clothingStyle = 'formal';
    if (text.includes('sports') || text.includes('athletic')) traits.clothingStyle = 'athletic';

    return traits;
  }

  /**
   * PHASE 1: Generate visual description from traits
   */
  generateVisualDescription(traits: any, characterName?: string): string {
    if (!traits) return '';
    
    const parts = [];
    if (traits.hairColor && traits.hairStyle) {
      parts.push(`${traits.hairColor} ${traits.hairStyle} hair`);
    }
    if (traits.skinTone) {
      parts.push(`${traits.skinTone} skin tone`);
    }
    if (traits.clothingStyle) {
      parts.push(`${traits.clothingStyle} clothing`);
    }
    
    return parts.join(', ');
  }
}

// Export singleton instance
export const characterConsistencyService = CharacterConsistencyService.getInstance();