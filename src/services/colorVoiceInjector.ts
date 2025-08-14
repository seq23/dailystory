/**
 * Color Voice Injection System for Runtime System Prompt Enhancement
 * Provides soft style guidance without overfitting
 */

import { COLOR_VOICES, type ColorVoice } from "@/constants/authorVoicePatterns";
import type { DifficultyLevel, UserInfo } from "@/types";

export interface StyleInjectionResult {
  styleGuidance: string;
  sampleMicroLines: string[];
  themePreferences: string[];
  voiceCharacteristics: string[];
}

/**
 * Get color voice for user based on age and difficulty
 */
export function getColorVoiceForUser(userInfo: UserInfo, difficulty: DifficultyLevel): ColorVoice {
  const colorKey = getColorKeyForDifficulty(difficulty);
  return COLOR_VOICES[colorKey] || COLOR_VOICES.red;
}

/**
 * Map difficulty levels to color keys
 */
function getColorKeyForDifficulty(difficulty: DifficultyLevel): string {
  const difficultyColorMap: Record<DifficultyLevel, string> = {
    'beginner': 'red',
    'easy': 'yellow', 
    'medium': 'green',
    'hard': 'purple',
    'expert': 'orange'
  };
  
  return difficultyColorMap[difficulty] || 'red';
}

/**
 * Inject selected color style into system prompt at runtime
 * Provides soft guidance without overfitting
 */
export function injectColorStyleIntoPrompt(
  basePrompt: string,
  userInfo: UserInfo,
  difficulty: DifficultyLevel
): string {
  const voice = getColorVoiceForUser(userInfo, difficulty);
  const injection = buildStyleInjection(voice);
  
  // Find the best insertion point in the system prompt
  const insertionPoint = findStyleInsertionPoint(basePrompt);
  
  return insertPromptSection(basePrompt, injection.styleGuidance, insertionPoint);
}

/**
 * Build style injection content with rotating samples
 */
function buildStyleInjection(voice: ColorVoice): StyleInjectionResult {
  // Select 3 random sample micro-lines to avoid overfitting
  const selectedSamples = selectRandomSamples(voice.sampleMicroLines, 3);
  
  const styleGuidance = `
VOICE STYLE GUIDANCE (${voice.name}):
- Style: ${voice.styleSummary}
- Age Range: ${voice.ageRange}
- Key Characteristics: ${voice.characteristics.join(', ')}
- Preferred Themes: ${voice.preferredThemes?.join(', ') || 'general'}

SAMPLE MICRO-LINES (for inspiration, not copying):
${selectedSamples.map(line => `• ${line}`).join('\n')}

Apply this voice naturally throughout the story. Focus on the spirit and rhythm rather than exact phrases.
`;

  return {
    styleGuidance,
    sampleMicroLines: selectedSamples,
    themePreferences: voice.preferredThemes || [],
    voiceCharacteristics: voice.characteristics
  };
}

/**
 * Select random samples from array without repetition
 */
function selectRandomSamples<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Find the best insertion point in system prompt for style guidance
 */
function findStyleInsertionPoint(prompt: string): number {
  // Look for common insertion patterns
  const patterns = [
    'STORY GENERATION:',
    'WRITING STYLE:',
    'CONTENT GUIDELINES:',
    'STORY STRUCTURE:',
    'NARRATIVE STYLE:'
  ];
  
  for (const pattern of patterns) {
    const index = prompt.indexOf(pattern);
    if (index !== -1) {
      return index;
    }
  }
  
  // Default to inserting after the first paragraph
  const firstNewline = prompt.indexOf('\n\n');
  return firstNewline !== -1 ? firstNewline + 2 : prompt.length;
}

/**
 * Insert style guidance into prompt at specified position
 */
function insertPromptSection(prompt: string, injection: string, position: number): string {
  const before = prompt.slice(0, position);
  const after = prompt.slice(position);
  
  return `${before}\n${injection}\n${after}`;
}

/**
 * Get style summary for a difficulty level (backward compatibility)
 */
export function getStyleSummaryForDifficulty(difficulty: DifficultyLevel): string {
  const colorKey = getColorKeyForDifficulty(difficulty);
  const voice = COLOR_VOICES[colorKey];
  return voice?.styleSummary || "General storytelling style";
}

/**
 * Get rotating sample micro-lines for a difficulty level
 */
export function getRotatingSampleLines(difficulty: DifficultyLevel, count: number = 3): string[] {
  const colorKey = getColorKeyForDifficulty(difficulty);
  const voice = COLOR_VOICES[colorKey];
  
  if (!voice?.sampleMicroLines) {
    return [];
  }
  
  return selectRandomSamples(voice.sampleMicroLines, count);
}