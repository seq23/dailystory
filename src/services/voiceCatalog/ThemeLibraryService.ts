/**
 * Frontend Theme Library Service - Enhanced theme mapping with complete themes.v1.json
 * Moved from backend to frontend for direct integration with VoiceCatalogIntegration
 */

// Import theme library data
import themesData from './themes.v1.json';

export interface ThemeMetadata {
  id: string;
  tags: string[];
  suggested_levers?: {
    hooks?: string[];
    twists?: string[];
    endings?: string[];
  };
  safety?: {
    peril?: string;
    horror?: number;
  };
  notes?: string;
}

export interface ThemeLibraryData {
  schema: string;
  v: string;
  themes: ThemeMetadata[];
}

import { DebugLogger } from '../DebugLogger';

export class ThemeLibraryService {
  private static readonly THEME_LIBRARY: ThemeLibraryData = themesData;
  
  /**
   * Map theme intent to enhanced library themes (fail-soft enabled)
   */
  static mapToLibrary(themes: string[], failSoft = false): string[] {
    if (failSoft && (!themes || themes.length === 0)) {
      DebugLogger.warn('performance', 'ThemeLibrary: No themes provided, using AI generation');
      return ['AI_GENERATE_THEMES'];
    }
    
    const mappedThemes = new Set<string>();
    const availableThemeIds = new Set(this.THEME_LIBRARY.themes.map(t => t.id));
    
    for (const theme of themes) {
      const normalizedTheme = theme.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Direct match
      if (availableThemeIds.has(normalizedTheme)) {
        mappedThemes.add(normalizedTheme);
        continue;
      }
      
      // Synonym matching
      const synonymMatch = this.findSynonymMatch(normalizedTheme);
      if (synonymMatch && availableThemeIds.has(synonymMatch)) {
        mappedThemes.add(synonymMatch);
        continue;
      }
      
      // Tag matching - find themes with matching tags
      const tagMatches = this.findThemesByTag(normalizedTheme);
      for (const tagMatch of tagMatches) {
        mappedThemes.add(tagMatch);
      }
    }
    
    // If no matches found, flag for AI adaptation
    if (mappedThemes.size === 0) {
      return ['AI_ADAPT_THEMES'];
    }
    
    return Array.from(mappedThemes);
  }

  /**
   * Get synonym mappings for themes
   */
  private static findSynonymMatch(theme: string): string | null {
    const synonymMap: { [key: string]: string[] } = {
      // Core themes
      "magic": ["fantasy", "magical", "wizard", "witch", "spell"],
      "adventure": ["explore", "journey", "quest", "travel", "expedition"],
      "friendship": ["friends", "buddy", "pal", "companion", "team"],
      "animal": ["pets", "creatures", "wildlife", "zoo", "nature", "critters"],
      "mystery": ["detective", "puzzle", "clue", "solve", "investigation", "sleuth"],
      "portal_fantasy": ["magic", "portal", "door", "gateway", "teleport"],
      "dragon": ["monster", "creature", "beast", "mythical", "dinosaur", "giant_lizard"],
      "magic_school": ["wizard", "magic", "school", "learning", "academy", "wizard_school"],
      "horror_safe": ["spooky", "scary", "ghost", "halloween", "monster"],
      "coming_of_age": ["growing", "change", "identity", "self", "becoming"],
      "survival": ["wilderness", "nature", "camping", "outdoors", "forest"],
      "sports": ["game", "competition", "team", "athletic", "play"],
      "courage": ["brave", "hero", "fearless", "bold", "strength"],
      
      // Theme category mappings
      "superhero": ["hero", "heroes", "cape", "powers", "rescue", "save_the_day", "flying_hero"],
      "princess": ["royalty", "queen", "king", "castle", "crown", "throne", "palace", "noble"],
      "underwater": ["ocean", "sea", "atlantis", "mermaid", "fish", "coral", "deep_sea"],
      "space_adventure": ["space", "galaxy", "alien", "rocket", "astronaut", "planets", "stars"],
      "pirate": ["pirates", "treasure", "ship", "adventure", "captain", "sailing", "treasure_hunt"],
      
      // Additional theme mappings
      "detective": ["sleuth", "mystery", "clue", "investigation", "case", "solve"],
      "quest": ["epic", "journey", "fantasy", "adventure", "hero_journey"],
      "toy": ["toys", "playtime", "playroom", "imagination", "pretend"],
      "school": ["magic_school", "academy", "learning", "friends", "classroom"],
      "ghosts": ["friendly_ghost", "spooky_safe", "halloween", "spirit", "haunted"]
    };

    for (const [canonical, synonyms] of Object.entries(synonymMap)) {
      if (synonyms.includes(theme)) {
        return canonical;
      }
    }
    
    return null;
  }

  /**
   * Find themes by matching tags
   */
  private static findThemesByTag(searchTerm: string): string[] {
    const matches: string[] = [];
    
    for (const theme of this.THEME_LIBRARY.themes) {
      // Check if search term matches any tag
      const hasMatchingTag = theme.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm) || 
        searchTerm.includes(tag.toLowerCase())
      );
      
      if (hasMatchingTag) {
        matches.push(theme.id);
      }
    }
    
    return matches;
  }

  /**
   * Validate theme safety for age
   */
  static validateThemeForAge(theme: string, age: number): boolean {
    const metadata = this.getThemeMetadata(theme);
    if (!metadata || !metadata.safety) return true;
    
    // Age-based safety rules
    if (age < 5 && metadata.safety.horror && metadata.safety.horror > 0) {
      return false; // No horror elements for very young children
    }
    
    if (age < 8 && metadata.safety.peril === "natural_only") {
      return false; // No survival themes for young children
    }
    
    if (age < 10 && metadata.safety.horror && metadata.safety.horror > 1) {
      return false; // Limited horror for elementary age
    }
    
    return true;
  }

  /**
   * Get theme metadata
   */
  static getThemeMetadata(theme: string): ThemeMetadata | null {
    return this.THEME_LIBRARY.themes.find(t => t.id === theme) || null;
  }

  /**
   * Get all available themes by category (using tags)
   */
  static getThemesByTag(tag: string): string[] {
    return this.THEME_LIBRARY.themes
      .filter(theme => theme.tags.includes(tag))
      .map(theme => theme.id);
  }

  /**
   * Get age-appropriate themes
   */
  static getAgeAppropriateThemes(age: number): string[] {
    return this.THEME_LIBRARY.themes
      .filter(theme => this.validateThemeForAge(theme.id, age))
      .map(theme => theme.id);
  }

  /**
   * Filter unsafe themes for age - AI adaptation instead of removal
   */
  static filterThemesForAge(themes: string[], age: number): string[] {
    const hasUnsafeThemes = themes.some(theme => !this.validateThemeForAge(theme, age));
    if (hasUnsafeThemes) {
      return ['AI_ADAPT_FOR_AGE'];
    }
    return themes;
  }

  /**
   * Get suggested story elements for theme
   */
  static getSuggestedLevers(theme: string): ThemeMetadata['suggested_levers'] | null {
    const metadata = this.getThemeMetadata(theme);
    return metadata?.suggested_levers || null;
  }

  /**
   * Get safety constraints for theme
   */
  static getSafetyConstraints(theme: string): ThemeMetadata['safety'] | null {
    const metadata = this.getThemeMetadata(theme);
    return metadata?.safety || null;
  }

  /**
   * Get all available themes
   */
  static getAllThemes(): ThemeMetadata[] {
    return this.THEME_LIBRARY.themes;
  }

  /**
   * Get library version info
   */
  static getLibraryInfo() {
    return {
      schema: this.THEME_LIBRARY.schema,
      version: this.THEME_LIBRARY.v,
      themeCount: this.THEME_LIBRARY.themes.length,
      availableThemes: this.THEME_LIBRARY.themes.map(t => t.id)
    };
  }
}