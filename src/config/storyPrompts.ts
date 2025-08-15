// Configuration-driven story prompts with no hardcoding
// Easy to update and modify without code changes

import type { DifficultyLevel, ExpertGradeLevel, UserInfo } from '@/types';
import { resolveAllPlaceholders } from '@/utils/placeholderResolver';
import { extractThemeIntent } from '@/utils/themeIntent';

import { getTokenLimitForDifficulty } from '@/utils/tokenLimitValidator';
import { APP_CONFIG } from '@/config/appConfig';

export interface StoryPromptConfig {
  difficulty: DifficultyLevel;
  systemPrompt: string;
  userPromptTemplate: string;
  maxLength?: number; // Optional for unlimited stories
  expectedPages?: number; // Optional for unlimited stories
}

export interface ExpertStoryPromptConfig {
  gradeLevel: ExpertGradeLevel;
  systemPrompt: string;
  userPromptTemplate: string;
  maxLength: number;
  expectedPages: number;
  wordCount: string;
}

export const STORY_PROMPTS: Record<DifficultyLevel, StoryPromptConfig> = {
  beginner: {
    difficulty: 'beginner',
    systemPrompt: `You are generating ONE PAGE of a never-ending picture book story for pre-readers aged 3-5.

CRITICAL RULES:
- Generate ONLY one sentence per page (the current page content)
- Use "Page X:" markers to separate each page of content
- Use subject-verb OR subject-verb-object as sentence structure
- Use a mix of 2-, 3-, and 4- letter words
- Use a mix of 2-, 3-, and 4- word sentences (max 6 words)
- Use Simple present tense
- Always allow {userName}, user inputs
- Story continues infinitely unless user requests ending
- Try to incorporate a narrative with a natural hook for continuation

Enhanced Level 0 vocabulary (ENHANCED_LEVEL_0_VOCABULARY) STRONGLY PREFERRED, but be flexible for flow. Pronouns and the word "I" can be used. 

Maximum 200 tokens total. One sentence per page for Level 0.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform any potentially concerning themes into their gentle equivalents naturally.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending children\'s story for {userName}, age 3-5. The story continues forever unless the user requests an ending. Use {specialRequest} as creative inspiration, or if none determined, create your own engaging themes. Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story in a direct way, mixing with your own creative elements. USE ONLY 1 sentence per page with simple subject-verb or subject-verb-object structure. Use MOSTLY sight words and 2-4 letter words. Use MOSTLY 2-4 word sentences (max 6).',
  },

  easy: {
    difficulty: 'easy',
    systemPrompt: `Generate ONE PAGE of a picture book story for early readers aged 5-7.

RULES:
- 1-2 sentences per page, Use "Page X:" markers to separate each page of content
- 3-6 letter words, 4-8 word sentences (max 12 words)
- Simple present/past tense, subject-verb-object structure
- Story continues infinitely unless user requests ending
- Include narrative hooks for continuation

VOCABULARY: Use ENHANCED_LEVEL_1_VOCABULARY preferentially, allow flexibility for flow.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform concerning themes to gentle equivalents.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 5-7. The story continues forever with natural pauses and continuation hooks unless the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story in a direct way, mixing with your own creative elements. Use simple vocabulary with 2-3 sentences per page for developing readers. Let the story flow organically with natural progression.',
  },

  medium: {
    difficulty: 'medium',
    systemPrompt: `Generate ONE PAGE of a chapter book story for readers aged 7-9.

RULES:
- 2-3 sentences per page, Use "Page X:" markers to separate each page of content
- 3-7 letter words, 5-12 word sentences (max 15 words)
- Past/present tense, varied sentence structures
- Story continues infinitely unless user requests ending
- Include narrative hooks and mild tension

VOCABULARY: Use ENHANCED_LEVEL_2_VOCABULARY with flexibility.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Transform concerning themes.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 7-9. The story continues forever with natural pauses and continuation hooks unless the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story, mixing with your own creative elements. Let the story flow organically with natural progression.',
  },

  hard: {
    difficulty: 'hard',
    systemPrompt: `Generate ONE PAGE of an intermediate story for readers aged 9-11.

RULES:
- 3-4 sentences per page, Use "Page X:" markers to separate each page of content
- 4-9 letter words, varied sentence lengths (max 20 words)
- Multiple tenses, complex sentence structures
- Story continues infinitely unless user requests ending
- Include character development

VOCABULARY: Use ENHANCED_LEVEL_3_VOCABULARY with flexibility.

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Avoid intense themes.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 9-12. The story continues forever with natural pauses and continuation hooks until the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally incorporate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} when they enhance the narrative, mixing with your own creative elements. Let the story flow organically with sophisticated storytelling techniques.',
  },

  expert: {
    difficulty: 'expert',
    systemPrompt: `Generate ONE PAGE of an advanced story for readers aged 11-13.

RULES:
- 4-5 sentences per page, Use "Page X:" markers to separate each page of content
- Advanced vocabulary, sophisticated structures
- Multiple tenses, complex sentence structures
- Story continues infinitely unless user requests ending

VOCABULARY: Use ENHANCED_LEVEL_4_VOCABULARY with flexibility.

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Avoid inappropriate material.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 11-15 with sophisticated literary techniques, compelling hooks and pauses that draw readers deeper into the story until the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as symbolic elements when they enhance the narrative. The story should address mature themes like personal philosophy, social justice, future aspirations, or meaningful life choices while maintaining appropriate boundaries. Focus on characters who face significant life decisions, navigate complex moral landscapes, and experience transformative growth.',
  }
};

// Expert Level 4 Grade-Specific Prompts (6th-10th grade reading levels)
export const EXPERT_STORY_PROMPTS: Record<ExpertGradeLevel, ExpertStoryPromptConfig> = {
  
  "6th": {
    gradeLevel: "6th",
    systemPrompt: `You are an expert story writer creating 6th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 6th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Page 1: [5-6 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 6th grade vocabulary, complex sentence structures, and sophisticated literary devices. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. The narrative should challenge readers intellectually and emotionally while promoting critical thinking, empathy, and character development appropriate for 6th-grade maturity and academic levels. Use a random internal seed (1-10,000) for unique details.',
    maxLength: 900,
    expectedPages: 12,
    wordCount: "800-900 words"
  },

  "7th": {
    gradeLevel: "7th",
    systemPrompt: `You are an expert story writer creating 7th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 7th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Page 1: [6-7 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 7th grade vocabulary, complex sentence structures, and sophisticated literary devices. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. The narrative should challenge readers intellectually and emotionally while promoting critical thinking, empathy, and character development appropriate for 7th-grade maturity and academic levels. Use a random internal seed (1-10,000) for unique details.',
    maxLength: 1100,
    expectedPages: 13,
    wordCount: "900-1100 words"
  },

  "8th": {
    gradeLevel: "8th",
    systemPrompt: `You are an expert story writer creating 8th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 8th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Page 1: [6-8 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 8th grade vocabulary, complex sentence structures, and sophisticated literary devices. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. The narrative should challenge readers intellectually and emotionally while promoting critical thinking, empathy, and character development appropriate for 8th-grade maturity and academic levels. Use a random internal seed (1-10,000) for unique details.',
    maxLength: 1200,
    expectedPages: 14,
    wordCount: "1000-1200 words"
  },

  "9th": {
    gradeLevel: "9th",
    systemPrompt: `You are an expert story writer creating 9th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 9th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Page 1: [7-8 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 9th grade vocabulary, complex sentence structures, and sophisticated literary devices. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. The narrative should challenge readers intellectually and emotionally while promoting critical thinking, empathy, and character development appropriate for 9th-grade maturity and academic levels. Use a random internal seed (1-10,000) for unique details.',
    maxLength: 1300,
    expectedPages: 15,
    wordCount: "1100-1300 words"
  },

  "10th": {
    gradeLevel: "10th",
    systemPrompt: `You are an expert story writer creating 10th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 10th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Page 1: [7-9 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using advanced vocabulary, complex sentence structures, and sophisticated literary devices. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. The narrative should challenge readers intellectually and emotionally while promoting critical thinking, empathy, and character development appropriate for 10th-grade maturity and academic levels. Use a random internal seed (1-10,000) for unique details.',
    maxLength: 1400,
    expectedPages: 16,
    wordCount: "1200-1400 words"
  }
};

// Utility functions for prompt management
export function getStoryPrompt(difficulty: DifficultyLevel): StoryPromptConfig {
  return STORY_PROMPTS[difficulty];
}

export function getExpertStoryPrompt(gradeLevel: ExpertGradeLevel): ExpertStoryPromptConfig {
  return EXPERT_STORY_PROMPTS[gradeLevel];
}

export function formatUserPrompt(template: string, userInfo: Partial<UserInfo>): string {
  // Start with basic placeholder resolution
  let prompt = resolveAllPlaceholders(template, { userInfo: userInfo as UserInfo });
  
  // Extract theme intent for hybrid approach
  if (userInfo as UserInfo) {
    const themeIntent = extractThemeIntent(userInfo as UserInfo);
    const difficultyLevel = userInfo.difficultyLevel || userInfo.readingAbility;
    
    // For beginner/easy levels: use interests if no explicit themes
    const isBeginnerOrEasy = difficultyLevel === 'beginner' || difficultyLevel === 'easy';
    
    if (themeIntent.themes.length > 0 || themeIntent.tone.length > 0) {
      const themeGuidance = [];
      if (themeIntent.themes.length > 0) {
        themeGuidance.push(`Focus on themes: ${themeIntent.themes.join(', ')}`);
      }
      if (themeIntent.tone.length > 0) {
        themeGuidance.push(`Use tone: ${themeIntent.tone.join(', ')}`);
      }
      prompt += ` ${themeGuidance.join('. ')}.`;
    } else if (isBeginnerOrEasy) {
      // Only for beginner/easy: append interests note when no explicit themes
      const interests = [];
      if (userInfo.hobbies) interests.push(userInfo.hobbies);
      if (userInfo.favoriteAnimal) interests.push(userInfo.favoriteAnimal);
      if (userInfo.favoriteColor) interests.push(userInfo.favoriteColor);
      if (userInfo.favoriteFood) interests.push(userInfo.favoriteFood);
      
      if (interests.length > 0) {
        prompt += ` Focus the story around the child's interests: ${interests.join(', ')}.`;
      }
    }
  }
  
  return prompt;
}
