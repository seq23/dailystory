// Age-Appropriate Theme Validation Utility
// Ensures themes are suitable for user's age group

import type { UserInfo } from '@/types';

export interface ThemeValidationResult {
  isValid: boolean;
  filteredThemes: string[];
  rejectedThemes: string[];
  warnings: string[];
}

// Age-appropriate theme matrix
const AGE_THEME_MATRIX = {
  '3-5': {
    allowed: [
      'friendship', 'kindness', 'family', 'nature', 'discovery', 
      'creativity', 'learning', 'curiosity', 'adventure', 'animals',
      'colors', 'food', 'play', 'sharing', 'helping'
    ],
    restricted: [
      'romance', 'conflict', 'competition', 'mystery', 'suspense',
      'independence', 'responsibility', 'justice', 'loyalty'
    ],
    forbidden: [
      'death', 'violence', 'fear', 'danger', 'loss', 'betrayal',
      'politics', 'war', 'crime', 'mature-themes'
    ]
  },
  '5-7': {
    allowed: [
      'friendship', 'kindness', 'family', 'nature', 'discovery',
      'creativity', 'learning', 'curiosity', 'adventure', 'animals',
      'teamwork', 'sharing', 'helping', 'responsibility', 'courage',
      'persistence', 'problem-solving'
    ],
    restricted: [
      'romance', 'conflict', 'competition', 'mystery', 'suspense',
      'independence', 'justice', 'loyalty', 'growing-up'
    ],
    forbidden: [
      'death', 'violence', 'fear', 'danger', 'loss', 'betrayal',
      'politics', 'war', 'crime', 'mature-themes'
    ]
  },
  '7-9': {
    allowed: [
      'friendship', 'kindness', 'family', 'nature', 'discovery',
      'creativity', 'learning', 'curiosity', 'adventure', 'animals',
      'teamwork', 'responsibility', 'courage', 'persistence',
      'problem-solving', 'independence', 'justice', 'loyalty',
      'competition', 'mystery', 'growing-up'
    ],
    restricted: [
      'romance', 'conflict', 'suspense', 'fear', 'loss'
    ],
    forbidden: [
      'death', 'violence', 'danger', 'betrayal', 'politics',
      'war', 'crime', 'mature-themes'
    ]
  },
  '9-12': {
    allowed: [
      'friendship', 'kindness', 'family', 'nature', 'discovery',
      'creativity', 'learning', 'curiosity', 'adventure', 'animals',
      'teamwork', 'responsibility', 'courage', 'persistence',
      'problem-solving', 'independence', 'justice', 'loyalty',
      'competition', 'mystery', 'growing-up', 'identity',
      'belonging', 'conflict', 'suspense', 'romance'
    ],
    restricted: [
      'fear', 'loss', 'betrayal', 'moral-complexity'
    ],
    forbidden: [
      'death', 'violence', 'danger', 'politics', 'war',
      'crime', 'mature-themes'
    ]
  },
  '12-15': {
    allowed: [
      'friendship', 'kindness', 'family', 'nature', 'discovery',
      'creativity', 'learning', 'curiosity', 'adventure', 'animals',
      'teamwork', 'responsibility', 'courage', 'persistence',
      'problem-solving', 'independence', 'justice', 'loyalty',
      'competition', 'mystery', 'growing-up', 'identity',
      'belonging', 'conflict', 'suspense', 'romance',
      'moral-complexity', 'social-awareness', 'self-discovery'
    ],
    restricted: [
      'fear', 'loss', 'betrayal', 'mature-themes'
    ],
    forbidden: [
      'death', 'violence', 'danger', 'politics', 'war', 'crime'
    ]
  }
};

function getAgeGroup(age: number): keyof typeof AGE_THEME_MATRIX {
  if (age <= 5) return '3-5';
  if (age <= 7) return '5-7';
  if (age <= 9) return '7-9';
  if (age <= 12) return '9-12';
  return '12-15';
}

export function validateThemeForAge(theme: string, userInfo: UserInfo): ThemeValidationResult {
  const themes = [theme.toLowerCase().trim()];
  return validateThemesForAge(themes, userInfo);
}

export function validateThemesForAge(themes: string[], userInfo: UserInfo): ThemeValidationResult {
  const age = userInfo.age || 8; // Default to 8 if age not specified
  const ageGroup = getAgeGroup(age);
  const ageRules = AGE_THEME_MATRIX[ageGroup];
  
  const filteredThemes: string[] = [];
  const rejectedThemes: string[] = [];
  const warnings: string[] = [];
  
  for (const theme of themes) {
    const normalizedTheme = theme.toLowerCase().trim();
    
    if (ageRules.forbidden.includes(normalizedTheme)) {
      rejectedThemes.push(theme);
      warnings.push(`Theme "${theme}" is not appropriate for age ${age}`);
    } else if (ageRules.restricted.includes(normalizedTheme)) {
      // Allow restricted themes but with a warning
      filteredThemes.push(theme);
      warnings.push(`Theme "${theme}" should be handled carefully for age ${age}`);
    } else if (ageRules.allowed.includes(normalizedTheme)) {
      filteredThemes.push(theme);
    } else {
      // Unknown theme - allow but warn
      filteredThemes.push(theme);
      warnings.push(`Unknown theme "${theme}" - please verify age appropriateness for age ${age}`);
    }
  }
  
  return {
    isValid: rejectedThemes.length === 0,
    filteredThemes,
    rejectedThemes,
    warnings
  };
}

export function sanitizeThemesForAge(themes: string[], userInfo: UserInfo): string[] {
  const validation = validateThemesForAge(themes, userInfo);
  return validation.filteredThemes;
}

export function getAgeAppropriateAlternatives(rejectedThemes: string[], userInfo: UserInfo): string[] {
  const age = userInfo.age || 8;
  const ageGroup = getAgeGroup(age);
  const ageRules = AGE_THEME_MATRIX[ageGroup];
  
  // Map rejected themes to appropriate alternatives
  const alternatives: Record<string, string[]> = {
    'violence': ['adventure', 'courage'],
    'death': ['change', 'growing-up'],
    'fear': ['courage', 'discovery'],
    'danger': ['adventure', 'problem-solving'],
    'conflict': ['teamwork', 'friendship'],
    'romance': ['friendship', 'kindness'],
    'politics': ['justice', 'fairness'],
    'war': ['peace', 'cooperation'],
    'crime': ['justice', 'helping'],
    'mature-themes': ['growing-up', 'learning']
  };
  
  const suggested: string[] = [];
  for (const theme of rejectedThemes) {
    const alts = alternatives[theme.toLowerCase()];
    if (alts) {
      suggested.push(...alts.filter(alt => ageRules.allowed.includes(alt)));
    }
  }
  
  // Remove duplicates and limit to 3 suggestions
  return Array.from(new Set(suggested)).slice(0, 3);
}