// Theme Intent Extraction Utility
// Derives thematic intent from user info and special requests

import type { UserInfo } from '@/types';
import { InputSanitizer } from './inputSanitizer';
import { validateTheme } from './themeValidation';

export interface ThemeIntent {
  themes: string[];
  symbols: string[];
  tone: string[];
  keywords: string[];
}

const THEME_SYNONYMS: Record<string, string> = {
  brave: 'courage',
  bravery: 'courage',
  kind: 'kindness',
  caring: 'kindness',
  help: 'friendship',
  helper: 'friendship',
  team: 'teamwork',
  teamwork: 'teamwork',
  explore: 'adventure',
  exploration: 'adventure',
  discover: 'discovery',
  discovery: 'discovery',
  learn: 'learning',
  learning: 'learning',
  curious: 'curiosity',
  curiosity: 'curiosity',
  family: 'family',
  nature: 'nature',
  friendship: 'friendship',
  creativity: 'creativity',
  persistence: 'persistence'
};

function normalizeTheme(word: string): string | undefined {
  const w = word.toLowerCase().trim();
  return THEME_SYNONYMS[w] || (Object.values(THEME_SYNONYMS).includes(w) ? w : undefined);
}

export function extractThemeIntent(userInfo: UserInfo): ThemeIntent {
  const themes: string[] = [];
  const symbols: string[] = [];
  const tone: string[] = [];
  const keywords: string[] = [];

  const sr = (userInfo.specialRequest || '').toLowerCase();
  if (sr) {
    // Parse structured format: themes: courage and kindness; tone: playful, gentle
    const themeMatch = sr.match(/themes?\s*:\s*([^\n;]+)/);
    if (themeMatch) {
      // Handle both "AND" and comma separation within structured themes
      const rawThemes = themeMatch[1]
        .split(/\s+and\s+|[,/]|&/)
        .map(s => s.trim())
        .filter(Boolean);
      
      // Sanitize and validate each theme individually
      for (const rawTheme of rawThemes) {
        const sanitized = InputSanitizer.sanitizeThemeInput(rawTheme);
        if (sanitized) {
          const validation = validateTheme(sanitized);
          if (validation.valid) {
            const normalized = normalizeTheme(validation.sanitized) || validation.sanitized;
            if (!themes.includes(normalized)) themes.push(normalized);
          }
        }
      }
    }
    
    const toneMatch = sr.match(/tone\s*:\s*([^\n;]+)/);
    if (toneMatch) {
      const rawTones = toneMatch[1]
        .split(/\s+and\s+|[,/]|&/)
        .map(s => s.trim())
        .filter(Boolean);
      for (const rawTone of rawTones) {
        const sanitized = InputSanitizer.sanitizeThemeInput(rawTone);
        if (sanitized && !tone.includes(sanitized)) tone.push(sanitized);
      }
    }
    
    // If no structured themes found, try keyword detection
    if (themes.length === 0) {
      const potentialKeywords = sr.split(/[^a-z]+/).filter(word => 
        word.length > 2 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
      );
      
      for (const keyword of potentialKeywords) {
        const sanitized = InputSanitizer.sanitizeThemeInput(keyword);
        if (sanitized) {
          const validation = validateTheme(sanitized);
          if (validation.valid) {
            // Map single keywords to fuller themes
            let themeKeyword = sanitized;
            if (sanitized === 'space') themeKeyword = 'space exploration';
            if (sanitized === 'ocean' || sanitized === 'underwater') themeKeyword = 'underwater adventure';
            if (sanitized === 'dragons') themeKeyword = 'dragons and magic';
            if (sanitized === 'princess') themeKeyword = 'brave princess';
            if (sanitized === 'winter') themeKeyword = 'winter adventure';
            if (sanitized === 'forest') themeKeyword = 'forest adventure';
            
            const normalized = normalizeTheme(themeKeyword) || themeKeyword;
            if (!themes.includes(normalized)) themes.push(normalized);
          }
        }
      }
    }
    
    // Collect remaining keywords (sanitized)
    const rawKeywords = sr.split(/[^a-z]+/).filter(Boolean);
    for (const keyword of rawKeywords) {
      const sanitized = InputSanitizer.sanitizeThemeInput(keyword);
      if (sanitized) keywords.push(sanitized);
    }
  }

  // If still no themes, check inputEnhancementEngine as fallback
  if (themes.length === 0) {
    try {
      // Import and use inputEnhancementEngine
      const { InputEnhancementEngine } = require('@/services/inputEnhancementEngine');
      const enhanced = InputEnhancementEngine.enhanceUserInputs(userInfo);
      if (enhanced.storyElements?.length > 0) {
        // Extract theme-like elements from story elements
        const storyThemes = enhanced.storyElements
          .filter(el => el.category === 'theme' || el.category === 'setting')
          .map(el => el.value)
          .slice(0, 3);
        themes.push(...storyThemes);
      }
    } catch (error) {
      // Fallback gracefully if inputEnhancementEngine is not available
      console.warn('InputEnhancementEngine not available for theme fallback');
    }
  }

  return {
    themes: Array.from(new Set(themes)).slice(0, 5),
    symbols: Array.from(new Set(symbols)).slice(0, 5),
    tone: Array.from(new Set(tone)).slice(0, 5),
    keywords: Array.from(new Set(keywords)).slice(0, 20)
  };
}

export function extractThemeIntentWithValidation(userInfo: UserInfo): ThemeIntent & { validation: any } {
  const intent = extractThemeIntent(userInfo);
  
  // Real validation using Zod schema
  const allThemes = [...intent.themes, ...intent.tone, ...intent.keywords];
  const validationResults = allThemes.map(theme => ({
    theme,
    result: validateTheme(theme)
  }));
  
  const rejectedThemes = validationResults
    .filter(v => !v.result.valid)
    .map(v => ({
      theme: v.theme,
      reason: v.result.errors.join(', '),
      coppaViolation: v.result.coppaViolation
    }));
  
  const warnings = validationResults
    .flatMap(v => v.result.warnings)
    .filter(Boolean);
  
  return {
    ...intent,
    validation: { 
      themes: intent.themes, 
      rejectedThemes, 
      warnings,
      coppaCompliant: !rejectedThemes.some(r => r.coppaViolation)
    }
  };
}
