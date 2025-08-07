/**
 * Mobile Text Optimization Utilities
 * Provides reading-level appropriate text sizing and spacing for mobile devices
 */

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface MobileTextConfig {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  paragraphSpacing: string;
  maxWordsPerLine: number;
}

/**
 * Get mobile-optimized text configuration for each reading level
 * Text size decreases as reading ability increases (age-appropriate)
 */
export const getMobileTextConfig = (difficulty: DifficultyLevel): MobileTextConfig => {
  switch (difficulty) {
    case 'beginner': // Level 0 - Ages 3-5, early readers
      return {
        fontSize: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
        lineHeight: 'leading-relaxed',
        letterSpacing: 'tracking-wide',
        paragraphSpacing: 'mb-6',
        maxWordsPerLine: 4
      };
      
    case 'easy': // Level 1 - Ages 5-6, developing readers
      return {
        fontSize: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
        lineHeight: 'leading-relaxed',
        letterSpacing: 'tracking-normal',
        paragraphSpacing: 'mb-5',
        maxWordsPerLine: 6
      };
      
    case 'medium': // Level 2 - Ages 6-7, intermediate readers
      return {
        fontSize: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
        lineHeight: 'leading-normal',
        letterSpacing: 'tracking-normal',
        paragraphSpacing: 'mb-4',
        maxWordsPerLine: 8
      };
      
    case 'hard': // Level 3 - Ages 8-9, advanced readers
      return {
        fontSize: 'text-base sm:text-lg md:text-xl lg:text-2xl',
        lineHeight: 'leading-normal',
        letterSpacing: 'tracking-normal',
        paragraphSpacing: 'mb-3',
        maxWordsPerLine: 12
      };
      
    case 'expert': // Level 4 - Ages 9+, fluent readers
      return {
        fontSize: 'text-sm sm:text-base md:text-lg lg:text-xl',
        lineHeight: 'leading-snug',
        letterSpacing: 'tracking-normal',
        paragraphSpacing: 'mb-3',
        maxWordsPerLine: 15
      };
      
    default:
      return getMobileTextConfig('medium');
  }
};

/**
 * Get mobile-specific container classes for story content
 */
export const getMobileStoryContainer = (difficulty: DifficultyLevel): string => {
  const baseClasses = 'max-w-full mx-auto px-4';
  
  switch (difficulty) {
    case 'beginner':
    case 'easy':
      return `${baseClasses} max-w-lg`;
    case 'medium':
      return `${baseClasses} max-w-xl`;
    case 'hard':
    case 'expert':
      return `${baseClasses} max-w-2xl`;
    default:
      return `${baseClasses} max-w-xl`;
  }
};

/**
 * Calculate optimal page breaks for mobile based on screen size and reading level
 */
export const getOptimalPageLength = (difficulty: DifficultyLevel, isMobile: boolean): number => {
  const baseLengths = {
    beginner: 50,
    easy: 80,
    medium: 120,
    hard: 180,
    expert: 220
  };
  
  const mobileMultiplier = isMobile ? 0.7 : 1;
  return Math.floor(baseLengths[difficulty] * mobileMultiplier);
};

/**
 * Mobile reading preferences for user customization
 */
export interface MobileReadingPreferences {
  fontSize: 'compact' | 'normal' | 'large';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
  nightMode: boolean;
}

/**
 * Apply user preferences to text configuration
 */
export const applyUserPreferences = (
  baseConfig: MobileTextConfig, 
  preferences: MobileReadingPreferences
): MobileTextConfig => {
  let config = { ...baseConfig };
  
  // Adjust font size based on preference
  if (preferences.fontSize === 'compact') {
    config.fontSize = config.fontSize.replace(/text-(\w+)/g, (match, size) => {
      const sizeMap: Record<string, string> = {
        'sm': 'text-xs',
        'base': 'text-sm',
        'lg': 'text-base',
        'xl': 'text-lg',
        '2xl': 'text-xl',
        '3xl': 'text-2xl',
        '4xl': 'text-3xl',
        '5xl': 'text-4xl'
      };
      return sizeMap[size] || match;
    });
  } else if (preferences.fontSize === 'large') {
    config.fontSize = config.fontSize.replace(/text-(\w+)/g, (match, size) => {
      const sizeMap: Record<string, string> = {
        'xs': 'text-sm',
        'sm': 'text-base',
        'base': 'text-lg',
        'lg': 'text-xl',
        'xl': 'text-2xl',
        '2xl': 'text-3xl',
        '3xl': 'text-4xl',
        '4xl': 'text-5xl'
      };
      return sizeMap[size] || match;
    });
  }
  
  // Adjust line spacing
  if (preferences.lineSpacing === 'tight') {
    config.lineHeight = 'leading-tight';
  } else if (preferences.lineSpacing === 'relaxed') {
    config.lineHeight = 'leading-loose';
  }
  
  return config;
};