/**
 * Theme Library Service - Enhanced theme mapping and validation
 */

export interface ThemeMetadata {
  category: string;
  ageAppropriate: number[];  // Age ranges where this theme is appropriate
  safetyLevel: 'low' | 'medium' | 'high';
  suggestedLevers?: string[];
  tags?: string[];
}

export interface ThemeLibrary {
  [themeName: string]: ThemeMetadata;
}

export class ThemeLibraryService {
  private static readonly THEME_LIBRARY: ThemeLibrary = {
    // Adventure themes
    "adventure": { category: "adventure", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["exploration", "journey"] },
    "exploration": { category: "adventure", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["discovery", "nature"] },
    "treasure_hunt": { category: "adventure", ageAppropriate: [6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["puzzle", "discovery"] },
    
    // Fantasy themes
    "magic": { category: "fantasy", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["wonder", "imagination"] },
    "fairy_tale": { category: "fantasy", ageAppropriate: [4, 5, 6, 7, 8, 9], safetyLevel: "low", tags: ["classic", "moral"] },
    "dragon": { category: "fantasy", ageAppropriate: [6, 7, 8, 9, 10, 11, 12], safetyLevel: "medium", tags: ["mythical", "brave"] },
    "magic_school": { category: "fantasy", ageAppropriate: [7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["learning", "friendship"] },
    
    // Friendship themes
    "friendship": { category: "social", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["relationships", "kindness"] },
    "teamwork": { category: "social", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["cooperation", "goals"] },
    "helping_others": { category: "social", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["kindness", "empathy"] },
    
    // Animals
    "animals": { category: "nature", ageAppropriate: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["pets", "wildlife"] },
    "ocean": { category: "nature", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["underwater", "marine"] },
    "forest": { category: "nature", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["woodland", "creatures"] },
    
    // Science themes
    "space": { category: "science", ageAppropriate: [6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["planets", "astronauts"] },
    "robots": { category: "science", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["technology", "future"] },
    "invention": { category: "science", ageAppropriate: [6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["creativity", "problem_solving"] },
    
    // Mystery themes
    "mystery": { category: "mystery", ageAppropriate: [7, 8, 9, 10, 11, 12], safetyLevel: "medium", tags: ["puzzle", "detective"] },
    "detective": { category: "mystery", ageAppropriate: [7, 8, 9, 10, 11, 12], safetyLevel: "medium", tags: ["solving", "clues"] },
    
    // Sports and activities
    "sports": { category: "activities", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["competition", "teamwork"] },
    "music": { category: "activities", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["art", "expression"] },
    "art": { category: "activities", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["creativity", "expression"] },
    
    // Values themes
    "courage": { category: "values", ageAppropriate: [5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["bravery", "overcoming"] },
    "kindness": { category: "values", ageAppropriate: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["empathy", "caring"] },
    "honesty": { category: "values", ageAppropriate: [4, 5, 6, 7, 8, 9, 10, 11, 12], safetyLevel: "low", tags: ["truth", "integrity"] }
  };

  /**
   * Map theme intent to enhanced library themes (fail-soft enabled)
   */
  static mapToLibrary(themes: string[], failSoft = false): string[] {
    if (failSoft && (!themes || themes.length === 0)) {
      console.warn('⚠️ ThemeLibrary: No themes provided, using fail-soft default');
      return ['friendship'];
    }
    const mappedThemes = new Set<string>();
    
    for (const theme of themes) {
      const normalizedTheme = theme.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Direct match
      if (this.THEME_LIBRARY[normalizedTheme]) {
        mappedThemes.add(normalizedTheme);
        continue;
      }
      
      // Synonym matching
      const synonyms = this.getThemeSynonyms(normalizedTheme);
      for (const synonym of synonyms) {
        if (this.THEME_LIBRARY[synonym]) {
          mappedThemes.add(synonym);
        }
      }
      
      // If no match found, add as fallback for AI selection
      if (mappedThemes.size === 0) {
        mappedThemes.add("adventure"); // Safe default
      }
    }
    
    return Array.from(mappedThemes);
  }

  /**
   * Get synonym mappings for themes
   */
  private static getThemeSynonyms(theme: string): string[] {
    const synonymMap: { [key: string]: string[] } = {
      "magic": ["fantasy", "magical", "wizard", "witch"],
      "adventure": ["explore", "journey", "quest", "travel"],
      "friendship": ["friends", "buddy", "pal", "companion"],
      "animals": ["pets", "creatures", "wildlife", "zoo"],
      "mystery": ["detective", "puzzle", "clue", "solve"],
      "space": ["astronaut", "planet", "rocket", "star"],
      "ocean": ["sea", "underwater", "fish", "marine"],
      "forest": ["woods", "trees", "jungle", "woodland"]
    };

    for (const [canonical, synonyms] of Object.entries(synonymMap)) {
      if (synonyms.includes(theme)) {
        return [canonical];
      }
    }
    
    return [];
  }

  /**
   * Validate theme safety for age
   */
  static validateThemeForAge(theme: string, age: number): boolean {
    const metadata = this.THEME_LIBRARY[theme];
    if (!metadata) return true; // Unknown themes are allowed
    
    return metadata.ageAppropriate.includes(age);
  }

  /**
   * Get theme metadata
   */
  static getThemeMetadata(theme: string): ThemeMetadata | null {
    return this.THEME_LIBRARY[theme] || null;
  }

  /**
   * Get all available themes by category
   */
  static getThemesByCategory(category: string): string[] {
    return Object.entries(this.THEME_LIBRARY)
      .filter(([, metadata]) => metadata.category === category)
      .map(([theme]) => theme);
  }

  /**
   * Get age-appropriate themes
   */
  static getAgeAppropriateThemes(age: number): string[] {
    return Object.entries(this.THEME_LIBRARY)
      .filter(([, metadata]) => metadata.ageAppropriate.includes(age))
      .map(([theme]) => theme);
  }

  /**
   * Filter unsafe themes for age
   */
  static filterThemesForAge(themes: string[], age: number): string[] {
    return themes.filter(theme => this.validateThemeForAge(theme, age));
  }
}