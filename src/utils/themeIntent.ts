// Theme Intent Extraction Utility
// Derives thematic intent from user info and special requests

import type { UserInfo } from '@/types';
import { InputSanitizer } from './inputSanitizer';
import { validateTheme } from './themeValidation';

export interface ThemeIntent {
  theme: string[];        // Structured themes
  setting: string[];      // Structured settings  
  characters: string[];   // Structured characters
  keywords: string[];     // Unclear words for AI interpretation
  rawInput: string;       // Original specialRequest
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
  const theme: string[] = [];
  const setting: string[] = [];
  const characters: string[] = [];
  const keywords: string[] = [];
  const rawInput = userInfo.specialRequest || '';

  const sr = rawInput.toLowerCase();
  if (sr) {
    // Parse structured format: "themes: courage AND friendship; characters: brave princess; setting: magical forest"
    
    // Extract themes
    const themeMatch = sr.match(/themes?\s*:\s*([^\n;]+)/);
    if (themeMatch) {
      const rawThemes = themeMatch[1]
        .split(/\s+and\s+|[,/]|&/)
        .map(s => s.trim())
        .filter(Boolean);
      
      for (const rawTheme of rawThemes) {
        const sanitized = InputSanitizer.sanitizeThemeInput(rawTheme);
        if (sanitized) {
          const validation = validateTheme(sanitized);
          if (validation.valid) {
            const normalized = normalizeTheme(validation.sanitized) || validation.sanitized;
            if (!theme.includes(normalized)) theme.push(normalized);
          }
        }
      }
    }
    
    // Extract characters
    const characterMatch = sr.match(/characters?\s*:\s*([^\n;]+)/);
    if (characterMatch) {
      const rawCharacters = characterMatch[1]
        .split(/\s+and\s+|[,/]|&/)
        .map(s => s.trim())
        .filter(Boolean);
      
      for (const rawChar of rawCharacters) {
        const sanitized = InputSanitizer.sanitizeThemeInput(rawChar);
        if (sanitized && !characters.includes(sanitized)) {
          characters.push(sanitized);
        }
      }
    }
    
    // Extract settings
    const settingMatch = sr.match(/settings?\s*:\s*([^\n;]+)/);
    if (settingMatch) {
      const rawSettings = settingMatch[1]
        .split(/\s+and\s+|[,/]|&/)
        .map(s => s.trim())
        .filter(Boolean);
      
      for (const rawSetting of rawSettings) {
        const sanitized = InputSanitizer.sanitizeThemeInput(rawSetting);
        if (sanitized && !setting.includes(sanitized)) {
          setting.push(sanitized);
        }
      }
    }
    
    // Put ALL unstructured words into keywords
    const structuredWords = [...theme, ...characters, ...setting];
    const allWords = sr.split(/[^a-z]+/).filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use', 'theme', 'themes', 'character', 'characters', 'setting', 'settings'].includes(word)
    );
    
    for (const word of allWords) {
      if (!structuredWords.some(structured => structured.includes(word))) {
        const sanitized = InputSanitizer.sanitizeThemeInput(word);
        if (sanitized && !keywords.includes(sanitized)) {
          keywords.push(sanitized);
        }
      }
    }
  }

  return {
    theme: Array.from(new Set(theme)).slice(0, 5),
    setting: Array.from(new Set(setting)).slice(0, 5),
    characters: Array.from(new Set(characters)).slice(0, 5),
    keywords: Array.from(new Set(keywords)).slice(0, 20),
    rawInput
  };
}

export function extractThemeIntentWithValidation(userInfo: UserInfo): ThemeIntent & { validation: any } {
  const intent = extractThemeIntent(userInfo);
  
  // Real validation using Zod schema
  const allThemes = [...intent.theme, ...intent.characters, ...intent.setting, ...intent.keywords];
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
      themes: intent.theme, 
      rejectedThemes, 
      warnings,
      coppaCompliant: !rejectedThemes.some(r => r.coppaViolation)
    }
  };
}
