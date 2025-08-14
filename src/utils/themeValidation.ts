import { z } from 'zod';
import { InputSanitizer } from './inputSanitizer';

// COPPA-compliant blacklists for children's content
const BLACKLISTED_THEMES = [
  // Violence/adult content
  'violence', 'violent', 'fight', 'fighting', 'war', 'weapon', 'gun', 'sword', 'blood', 'death', 'kill', 'murder',
  'scary', 'horror', 'terror', 'nightmare', 'demon', 'devil', 'ghost', 'zombie', 'vampire', 'monsters', 'monster',
  
  // Adult themes
  'romance', 'dating', 'kiss', 'kissing', 'love', 'boyfriend', 'girlfriend', 'wedding', 'marriage',
  'alcohol', 'beer', 'wine', 'drink', 'drunk', 'smoking', 'drugs', 'gambling',
  
  // Inappropriate content
  'naked', 'nude', 'sex', 'sexual', 'inappropriate', 'adult', 'mature',
  
  // Dangerous activities
  'danger', 'dangerous', 'risky', 'unsafe', 'poison', 'toxic', 'fire', 'explosion'
];

const PERSONAL_INFO_PATTERNS = [
  // Common names (sample - could be expanded)
  /\b(mom|dad|mother|father|mommy|daddy|mama|papa)\b/i,
  /\b(brother|sister|sibling|bro|sis)\b/i,
  /\b(grandma|grandpa|grandmother|grandfather|nana|papa)\b/i,
  
  // Address patterns
  /\b\d+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i,
  /\b(apt|apartment|unit)\s*\d+/i,
  
  // Phone patterns
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/,
  
  // Email patterns
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  
  // School info
  /\b(school|classroom|teacher|principal)\s+\w+/i
];

// Zod schema for theme validation - validates strings directly
export const ThemeSchema = z.string()
  .min(1, "Theme cannot be empty")
  .max(50, "Theme too long (max 50 characters)")
  .refine((val) => {
    return !BLACKLISTED_THEMES.some(blocked => 
      val.toLowerCase().includes(blocked.toLowerCase())
    );
  }, "Theme contains inappropriate content for children")
  .refine((val) => {
    return !PERSONAL_INFO_PATTERNS.some(pattern => pattern.test(val));
  }, "Theme contains personal information (COPPA violation)");

// Batch validation schema
export const ThemeBatchSchema = z.object({
  themes: z.array(ThemeSchema).max(10, "Too many themes (max 10)")
});

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  errors: string[];
  warnings: string[];
  coppaViolation: boolean;
}

export interface BatchValidationResult {
  validThemes: string[];
  rejectedThemes: Array<{ theme: string; reason: string; coppaViolation: boolean }>;
  warnings: string[];
  totalProcessed: number;
}

/**
 * Validate a single theme with sanitization and COPPA compliance
 */
export function validateTheme(theme: string): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    sanitized: '',
    errors: [],
    warnings: [],
    coppaViolation: false
  };

  try {
    // First sanitize the input once
    const sanitized = InputSanitizer.sanitizeThemeInput(theme);
    result.sanitized = sanitized;

    // Then validate with Zod (no additional sanitization in schema)
    const validation = ThemeSchema.safeParse(sanitized);
    
    if (validation.success) {
      result.valid = true;
    } else {
      result.errors = validation.error.issues.map(err => err.message);
      
      // Check for COPPA violations specifically
      result.coppaViolation = validation.error.issues.some(err => 
        err.message.includes('personal information') || 
        err.message.includes('COPPA')
      );
    }
  } catch (error) {
    result.errors.push('Validation failed due to unexpected error');
  }

  return result;
}

/**
 * Validate multiple themes in batch
 */
export function validateThemeBatch(themes: string[]): BatchValidationResult {
  const result: BatchValidationResult = {
    validThemes: [],
    rejectedThemes: [],
    warnings: [],
    totalProcessed: themes.length
  };

  if (themes.length > 10) {
    result.warnings.push('Too many themes provided, processing first 10 only');
    themes = themes.slice(0, 10);
  }

  for (const theme of themes) {
    const validation = validateTheme(theme);
    
    if (validation.valid) {
      result.validThemes.push(validation.sanitized);
    } else {
      result.rejectedThemes.push({
        theme,
        reason: validation.errors.join(', '),
        coppaViolation: validation.coppaViolation
      });
    }
    
    result.warnings.push(...validation.warnings);
  }

  return result;
}

/**
 * Generate user-friendly feedback for rejected themes
 */
export function generateFeedbackMessage(result: BatchValidationResult): string {
  if (result.validThemes.length === result.totalProcessed) {
    return `Great! All ${result.validThemes.length} themes are appropriate for children.`;
  }

  const messages: string[] = [];
  
  if (result.validThemes.length > 0) {
    messages.push(`${result.validThemes.length} themes accepted.`);
  }

  if (result.rejectedThemes.length > 0) {
    const coppaViolations = result.rejectedThemes.filter(r => r.coppaViolation);
    const inappropriateContent = result.rejectedThemes.filter(r => !r.coppaViolation);

    if (coppaViolations.length > 0) {
      messages.push(`${coppaViolations.length} themes removed for privacy protection.`);
    }

    if (inappropriateContent.length > 0) {
      messages.push(`${inappropriateContent.length} themes removed for age-appropriateness.`);
    }

    messages.push('Try themes like: adventure, friendship, animals, magic, or nature!');
  }

  return messages.join(' ');
}

/**
 * Age-appropriate theme suggestions
 */
export function getSuggestedThemes(age: number): string[] {
  if (age <= 5) {
    return ['animals', 'family', 'friendship', 'colors', 'shapes', 'numbers'];
  } else if (age <= 8) {
    return ['adventure', 'friendship', 'animals', 'magic', 'nature', 'discovery'];
  } else if (age <= 12) {
    return ['adventure', 'mystery', 'friendship', 'courage', 'teamwork', 'creativity', 'science'];
  } else {
    return ['adventure', 'mystery', 'friendship', 'courage', 'teamwork', 'creativity', 'science', 'discovery'];
  }
}