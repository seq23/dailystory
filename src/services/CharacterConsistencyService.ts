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
   * Extract visual details from page text
   */
  private extractVisualDetails(pageText: string): any {
    if (!pageText) return { coloredObjects: [], atmosphericWords: [] };

    const text = pageText.toLowerCase();
    const coloredObjects: string[] = [];
    const atmosphericWords: string[] = [];

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
      atmosphericWords: [...new Set(atmosphericWords)].slice(0, 3)
    };
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
   * Get session statistics for monitoring
   */
  getSessionStats(sessionId: string): any {
    const sessionKeys = Array.from(this.visualDetailCache.keys()).filter(key => 
      key.startsWith(sessionId)
    );

    return {
      totalPages: sessionKeys.length,
      lastActivity: sessionKeys.length > 0 ? Math.max(
        ...sessionKeys.map(key => this.visualDetailCache.get(key)?.timestamp || 0)
      ) : 0
    };
  }
}

// Export singleton instance
export const characterConsistencyService = CharacterConsistencyService.getInstance();