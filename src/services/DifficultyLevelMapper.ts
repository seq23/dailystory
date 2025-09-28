// Difficulty Level Mapping Service
// Handles frontend ↔ backend difficulty level translation

import { DifficultyLevel } from "@/types";

export interface DifficultyMapping {
  backend: DifficultyLevel;
  frontend: string;
  displayName: string;
  description: string;
}

export class DifficultyLevelMapper {
  private static readonly DIFFICULTY_MAPPINGS: DifficultyMapping[] = [
    {
      backend: "beginner",
      frontend: "pre-reader",
      displayName: "Pre-Reader",
      description: "Picture-focused with minimal text"
    },
    {
      backend: "easy",
      frontend: "beginner",
      displayName: "Beginner",
      description: "Simple sentences and basic vocabulary"
    },
    {
      backend: "medium",
      frontend: "developing",
      displayName: "Developing",
      description: "Longer sentences with varied vocabulary"
    },
    {
      backend: "hard",
      frontend: "independent",
      displayName: "Independent",
      description: "Complex sentences and rich vocabulary"
    },
    {
      backend: "expert",
      frontend: "advanced",
      displayName: "Advanced",
      description: "Sophisticated language and concepts"
    }
  ];

  /**
   * Convert backend difficulty to frontend representation
   */
  static toFrontend(backendLevel: DifficultyLevel): string {
    const mapping = this.DIFFICULTY_MAPPINGS.find(m => m.backend === backendLevel);
    return mapping?.frontend || backendLevel;
  }

  /**
   * Convert frontend difficulty to backend representation
   */
  static toBackend(frontendLevel: string): DifficultyLevel {
    const mapping = this.DIFFICULTY_MAPPINGS.find(m => m.frontend === frontendLevel.toLowerCase());
    return mapping?.backend || (frontendLevel as DifficultyLevel);
  }

  /**
   * Get display name for any difficulty level
   */
  static getDisplayName(level: string): string {
    // Priority 1: Try frontend matching first
    let mapping = this.DIFFICULTY_MAPPINGS.find(m => m.frontend === level.toLowerCase());
    
    // Priority 2: Fall back to backend matching
    if (!mapping) {
      mapping = this.DIFFICULTY_MAPPINGS.find(m => m.backend === level);
    }
    
    return mapping?.displayName || level;
  }

  /**
   * Validate if a difficulty level is supported
   */
  static isValidBackendLevel(level: string): level is DifficultyLevel {
    return this.DIFFICULTY_MAPPINGS.some(m => m.backend === level);
  }

  /**
   * Validate if a frontend level is supported
   */
  static isValidFrontendLevel(level: string): boolean {
    return this.DIFFICULTY_MAPPINGS.some(m => m.frontend === level.toLowerCase());
  }

  /**
   * Get all available mappings
   */
  static getAllMappings(): DifficultyMapping[] {
    return [...this.DIFFICULTY_MAPPINGS];
  }

  /**
   * Smart level detection - handles both frontend and backend formats
   */
  static normalizeLevel(level: string | DifficultyLevel): DifficultyLevel {
    if (this.isValidBackendLevel(level)) {
      return level;
    }
    
    const backendLevel = this.toBackend(level);
    // If toBackend couldn't find a mapping and returned the original value,
    // and it's still not a valid backend level, fallback to 'easy'
    if (!this.isValidBackendLevel(backendLevel)) {
      return 'easy';
    }
    
    return backendLevel;
  }

  /**
   * Get appropriate style framework key with fallback
   */
  static getStyleFrameworkKey(level: string | DifficultyLevel): DifficultyLevel {
    const normalized = this.normalizeLevel(level);
    return this.isValidBackendLevel(normalized) ? normalized : 'easy';
  }
}