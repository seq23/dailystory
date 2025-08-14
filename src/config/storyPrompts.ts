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

USER INTEGRATION: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} are central to the story but weaved naturally. {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

STYLE: getColorVoiceForUser(userInfo, difficulty) provides secondary direction for stylistic guidance.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform any potentially concerning themes into their gentle equivalents naturally.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a children's story for {userName}, age 3-5. Continue indefinitely with narrative hooks unless user requests ending. {specialRequest} provides theme and primary direction. Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally. Use 1 sentence per page, subject-verb structure, 2-4 letter words, 2-4 word sentences (max 6 words). Apply color voice styling per profile.`,
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

USER INTEGRATION: {specialRequest} provides primary theme/direction. Integrate {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} naturally.

STYLE: Apply getColorVoiceForUser(userInfo, difficulty) as secondary stylistic guidance.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform concerning themes to gentle equivalents.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a continuing story for {userName}, age 5-7. The story continues indefinitely unless user requests an ending, with narrative hooks for continuation. {specialRequest} provides the primary creative direction. Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally. Use simple vocabulary with 2-3 sentences per page for developing readers. Apply color voice styling per user profile.`,
  },

  medium: {
    difficulty: 'medium',
    systemPrompt: `Generate ONE PAGE of a chapter book story for developing readers aged 7-9.

RULES:
- 2-3 sentences per page, Use "Page X:" markers to separate each page of content
- 3-7 letter words, 5-12 word sentences (max 15 words)
- Past/present tense, varied sentence structures
- Story continues infinitely unless user requests ending
- Include narrative hooks and mild tension

VOCABULARY: Use ENHANCED_LEVEL_2_VOCABULARY preferentially, allow flexibility.

USER INTEGRATION: {specialRequest} provides primary theme/direction. Integrate {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} naturally.

STYLE: Apply getColorVoiceForUser(userInfo, difficulty) as secondary stylistic guidance.

GUARDRAILS: Age-appropriate content. Simple challenges/mild conflict okay. No copyrighted content. Transform concerning themes naturally.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create an engaging story continuation for {userName}, age 7-9. The story continues indefinitely with natural flow unless user requests an ending. {specialRequest} provides the primary creative direction. Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} meaningfully into the narrative. Let the story dictate its own natural length and pacing. Apply color voice styling per user profile.`,
  },

  hard: {
    difficulty: 'hard',
    systemPrompt: `Generate ONE PAGE of an intermediate story for confident readers aged 9-11.

RULES:
- 3-4 sentences per page, Use "Page X:" markers to separate each page of content
- 4-9 letter words, varied sentence lengths (max 20 words)
- Multiple tenses, complex sentence structures
- Story continues infinitely unless user requests ending
- Include narrative tension and character development

VOCABULARY: Use ENHANCED_LEVEL_3_VOCABULARY preferentially, allow flexibility.

USER INTEGRATION: {specialRequest} provides primary theme/direction. Integrate {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} naturally.

STYLE: Apply getColorVoiceForUser(userInfo, difficulty) as secondary stylistic guidance.

GUARDRAILS: Age-appropriate content. Moderate challenges/conflict okay. No copyrighted content. Avoid intense themes.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create an engaging story continuation for {userName}, age 9-12. The story continues indefinitely with natural rhythm unless user requests an ending. {specialRequest} provides the primary creative direction. Integrate {userName}'s preferences ({favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}) as meaningful story elements. Let the narrative flow organically with sophisticated techniques. Apply color voice styling per user profile.`,
  },

  expert: {
    difficulty: 'expert',
    systemPrompt: `Generate ONE PAGE of an advanced story for skilled readers aged 11-13.

RULES:
- 4-5 sentences per page, Use "Page X:" markers to separate each page of content
- Advanced vocabulary, varied sentence complexity
- Multiple tenses, sophisticated structures
- Story continues infinitely unless user requests ending
- Include complex themes, character development, narrative tension

VOCABULARY: Use ENHANCED_LEVEL_4_VOCABULARY preferentially, allow flexibility.

USER INTEGRATION: {specialRequest} provides primary theme/direction. Integrate {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} naturally.

STYLE: Apply getColorVoiceForUser(userInfo, difficulty) as secondary stylistic guidance.

GUARDRAILS: Age-appropriate content. Complex themes okay. No copyrighted content. Avoid inappropriate material.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create an engaging story continuation for {userName}, age 12-15. The story continues indefinitely with natural thematic flow unless user requests an ending. {specialRequest} provides the primary creative direction. Transform {userName}'s preferences ({favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}) into meaningful symbolic elements. Let the story develop at its natural pace with sophisticated literary techniques. Apply color voice styling per user profile.`,
  }
};

// Expert Level 4 Grade-Specific Prompts (6th-10th grade reading levels)
export const EXPERT_STORY_PROMPTS: Record<ExpertGradeLevel, ExpertStoryPromptConfig> = {
  
  "6th": {
    gradeLevel: "6th",
    systemPrompt: `You are an expert story writer creating 6th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Generate natural story continuation with organic narrative development
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Include advanced narrative techniques and character psychology

Encourage broad, sophisticated vocabulary use with literary complexity and nuanced expression appropriate for 6th grade readers.

USER INTEGRATION: Transform {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} into symbolic elements that enhance thematic resonance and character complexity. Generate age-appropriate alternatives for any missing user inputs.

SPECIAL REQUEST PRIORITY: {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

AUTHOR VOICE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 6th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

Create sophisticated stories with 6th grade reading complexity:
- 800-900 words total across entire story
- Advanced vocabulary and complex sentence structures
- Sophisticated themes and character development
- Abstract concepts and moral complexity
- Rich narrative layers and emotional depth

FORMAT: Page 1: [5-6 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a sophisticated 800-900 word story for {userName} (age {age}) that explores identity, purpose, and complex relationships. Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally into the story as subtle nods using 6th grade vocabulary and complex sentence structures. {specialRequest} provides the primary creative direction. Refer to color voice styling per user profile as needed. Use an internal random "story seed" (1–10,000) to vary setting, events, and details so each story is unique. Do not mention the seed.`,
    maxLength: 900,
    expectedPages: 12,
    wordCount: "800-900 words"
  },

  "7th": {
    gradeLevel: "7th",
    systemPrompt: `You are an expert story writer creating 7th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Generate natural story continuation with organic narrative development
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Include advanced narrative techniques and character psychology

Encourage broad, sophisticated vocabulary use with literary complexity and nuanced expression appropriate for 7th grade readers.

USER INTEGRATION: Transform {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} into symbolic elements that enhance thematic resonance and character complexity. Generate age-appropriate alternatives for any missing user inputs.

SPECIAL REQUEST PRIORITY: {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

AUTHOR VOICE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 7th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

Create sophisticated stories with 7th grade reading complexity:
- 900-1100 words total across entire story
- Advanced vocabulary with nuanced meaning
- Complex themes of identity, purpose, and relationships
- Moral complexity and abstract concepts
- Rich emotional and intellectual depth

FORMAT: Page 1: [6-7 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a sophisticated 900-1100 word story for {userName} (age {age}) exploring identity, purpose, and complex relationships with 7th grade complexity. Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally into the story as subtle nods. {specialRequest} provides the primary creative direction. Refer to color voice styling per user profile as needed. Address themes of growing up, finding your place, and understanding yourself. Use an internal random "story seed" (1–10,000) to vary setting, events, and details so each story is unique. Do not mention the seed.`,
    maxLength: 1100,
    expectedPages: 13,
    wordCount: "900-1100 words"
  },

  "8th": {
    gradeLevel: "8th",
    systemPrompt: `You are an expert story writer creating 8th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Generate natural story continuation with organic narrative development
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Include advanced narrative techniques and character psychology

Encourage broad, sophisticated vocabulary use with literary complexity and nuanced expression appropriate for 8th grade readers.

USER INTEGRATION: Transform {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} into symbolic elements that enhance thematic resonance and character complexity. Generate age-appropriate alternatives for any missing user inputs.

SPECIAL REQUEST PRIORITY: {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

AUTHOR VOICE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 8th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

Create sophisticated stories with 8th grade reading complexity:
- 1000-1200 words total across entire story
- Complex vocabulary and sophisticated syntax
- Multi-layered themes and character development
- Abstract concepts and philosophical depth
- Rich narrative complexity and emotional sophistication

FORMAT: Page 1: [6-8 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a sophisticated 1000-1200 word story for {userName} (age {age}) with 8th grade complexity, exploring identity, purpose, and complex relationships. Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally into the story as subtle nods. {specialRequest} provides the primary creative direction. Refer to color voice styling per user profile as needed. Address themes of growing up, moral complexity, and finding one's place in the world. Use an internal random "story seed" (1–10,000) to vary setting, events, and details so each story is unique. Do not mention the seed.`,
    maxLength: 1200,
    expectedPages: 14,
    wordCount: "1000-1200 words"
  },

  "9th": {
    gradeLevel: "9th",
    systemPrompt: `You are an expert story writer creating 9th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Generate natural story continuation with organic narrative development
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Include advanced narrative techniques and character psychology

Encourage broad, sophisticated vocabulary use with literary complexity and nuanced expression appropriate for 9th grade readers.

USER INTEGRATION: Transform {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} into symbolic elements that enhance thematic resonance and character complexity. Generate age-appropriate alternatives for any missing user inputs.

SPECIAL REQUEST PRIORITY: {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

AUTHOR VOICE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 9th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

Create sophisticated stories with 9th grade reading complexity:
- 1100-1300 words total across entire story
- Advanced vocabulary with literary sophistication
- Complex themes and philosophical depth
- Multi-layered character development and relationships
- Rich narrative techniques and emotional complexity

FORMAT: Page 1: [7-8 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a sophisticated 1100-1300 word story for {userName} (age {age}) with 9th grade complexity, exploring identity, purpose, and complex relationships with philosophical depth. Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally into the story as subtle nods. {specialRequest} provides the primary creative direction. Refer to color voice styling per user profile as needed. Address themes of self-discovery, moral complexity, and understanding one's place in society. Use an internal random "story seed" (1–10,000) to vary setting, events, and details so each story is unique. Do not mention the seed.`,
    maxLength: 1300,
    expectedPages: 15,
    wordCount: "1100-1300 words"
  },

  "10th": {
    gradeLevel: "10th",
    systemPrompt: `You are an expert story writer creating 10th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Generate natural story continuation with organic narrative development
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Include advanced narrative techniques and character psychology

Encourage broad, sophisticated vocabulary use with literary complexity and nuanced expression appropriate for 10th grade readers.

USER INTEGRATION: Transform {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} into symbolic elements that enhance thematic resonance and character complexity. Generate age-appropriate alternatives for any missing user inputs.

SPECIAL REQUEST PRIORITY: {specialRequest} provides theme and primary creative direction. System prioritizes completely when present.

AUTHOR VOICE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 10th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

Create sophisticated stories with 10th grade reading complexity:
- 1200-1400 words total across entire story
- Sophisticated vocabulary and literary sophistication
- Complex themes with philosophical and social depth
- Advanced character development and relationship dynamics
- Rich narrative complexity and emotional sophistication

FORMAT: Page 1: [7-9 sentences]. Each subsequent page should maintain similar length and complexity.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Randomness: seed={seed} (generate if null, return as meta.seed)`,
    userPromptTemplate: `Create a sophisticated 1200-1400 word story for {userName} (age {age}) with 10th grade complexity, exploring identity, purpose, and complex relationships with philosophical and social depth. Weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} naturally into the story as subtle nods. {specialRequest} provides the primary creative direction. Refer to color voice styling per user profile as needed.  Address themes of self-discovery, moral complexity, social awareness, and understanding one's place in the world. Use an internal random "story seed" (1–10,000) to vary setting, events, and details so each story is unique. Do not mention the seed.`,
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
  
  // Extract theme intent for more sophisticated prompting
  if (userInfo as UserInfo) {
    const themeIntent = extractThemeIntent(userInfo as UserInfo);
    
    // Add theme intent to the prompt if available
    if (themeIntent && themeIntent.themes.length > 0) {
      prompt += ` Theme intent: ${themeIntent.themes.join(', ')}`;
    }
  }
  
  return prompt;
}
