// Difficulty Level Mapping Service
// Handles frontend ↔ backend difficulty level translation

export class DifficultyLevelMapper {
  static DIFFICULTY_MAPPINGS = [
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
  static toFrontend(backendLevel) {
    const mapping = this.DIFFICULTY_MAPPINGS.find(m => m.backend === backendLevel);
    return mapping?.frontend || backendLevel;
  }

  /**
   * Convert frontend difficulty to backend representation
   */
  static toBackend(frontendLevel) {
    const mapping = this.DIFFICULTY_MAPPINGS.find(m => m.frontend === frontendLevel.toLowerCase());
    return mapping?.backend || frontendLevel;
  }

  /**
   * Get display name for any difficulty level
   */
  static getDisplayName(level) {
    const mapping = this.DIFFICULTY_MAPPINGS.find(
      m => m.backend === level || m.frontend === level.toLowerCase()
    );
    return mapping?.displayName || level;
  }

  /**
   * Validate if a difficulty level is supported
   */
  static isValidBackendLevel(level) {
    return this.DIFFICULTY_MAPPINGS.some(m => m.backend === level);
  }

  /**
   * Validate if a frontend level is supported
   */
  static isValidFrontendLevel(level) {
    return this.DIFFICULTY_MAPPINGS.some(m => m.frontend === level.toLowerCase());
  }

  /**
   * Get all available mappings
   */
  static getAllMappings() {
    return [...this.DIFFICULTY_MAPPINGS];
  }

  /**
   * Smart level detection - handles both frontend and backend formats
   */
  static normalizeLevel(level) {
    if (this.isValidBackendLevel(level)) {
      return level;
    }
    
    return this.toBackend(level);
  }

  /**
   * Get appropriate style framework key with fallback
   */
  static getStyleFrameworkKey(level) {
    const normalized = this.normalizeLevel(level);
    return this.isValidBackendLevel(normalized) ? normalized : 'easy';
  }

  /**
   * Map to image generation difficulty with centralized logging
   */
  static mapToImageDifficulty(userInfo) {
    const rawLevel = userInfo?.difficultyLevel || 'easy';
    const normalizedLevel = this.normalizeLevel(rawLevel);
    
    console.log(`🔄 Difficulty mapping: ${rawLevel} → ${normalizedLevel}`, {
      userDifficultyLevel: userInfo?.difficultyLevel,
      finalLevel: normalizedLevel
    });
    
    return normalizedLevel;
  }
}