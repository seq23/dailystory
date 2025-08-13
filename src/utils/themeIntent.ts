// Theme Intent Extraction Utility
// Derives thematic intent from user info and special requests

import type { UserInfo } from '@/types';

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
    // Parse lines like: theme: courage and kindness; themes: friendship, discovery; tone: playful, gentle
    const themeMatch = sr.match(/themes?\s*:\s*([^\n;]+)/);
    if (themeMatch) {
      const parts = themeMatch[1].split(/[,/]|and|&/).map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        const n = normalizeTheme(p) || p;
        if (!themes.includes(n)) themes.push(n);
      }
    }
    const toneMatch = sr.match(/tone\s*:\s*([^\n;]+)/);
    if (toneMatch) {
      const parts = toneMatch[1].split(/[,/]|and|&/).map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        if (!tone.includes(p)) tone.push(p);
      }
    }
    // Collect remaining keywords
    keywords.push(...sr.split(/[^a-z]+/).filter(Boolean));
  }

  // Add from hobbies/animal/color/food as soft signals
  const hobby = (userInfo.hobbies || '').toLowerCase();
  if (hobby.includes('art') || hobby.includes('draw')) themes.push('creativity');
  if (hobby.includes('sport') || hobby.includes('team')) themes.push('teamwork');
  if (hobby.includes('science')) themes.push('discovery');
  if (hobby.includes('read')) themes.push('learning');

  if (userInfo.favoriteAnimal) themes.push('nature');
  if (userInfo.favoriteColor) themes.push('identity');
  if (userInfo.favoriteFood) themes.push('family');

  const dedupedThemes = Array.from(new Set(themes)).slice(0, 5);

  return {
    themes: dedupedThemes,
    symbols: Array.from(new Set(symbols)).slice(0, 5),
    tone: Array.from(new Set(tone)).slice(0, 5),
    keywords: Array.from(new Set(keywords)).slice(0, 20)
  };
}
