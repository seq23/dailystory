// Configuration-driven story prompts with no hardcoding
// Moved from frontend to edge functions for single source of truth
// Easy to update and modify without code changes

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type ExpertGradeLevel = '6th' | '7th' | '8th' | '9th' | '10th';

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
  wordCount: string;
  expectedPages?: number; // Add expectedPages for business logic
}

export const STORY_PROMPTS: Record<DifficultyLevel, StoryPromptConfig> = {
  beginner: {
    difficulty: 'beginner',
    expectedPages: 10,
    systemPrompt: `You are generating a never-ending picture book story for pre-readers aged 3-5.

CRITICAL RULES:
- ONE SENTENCE PER PAGE. 
- Generate a continuous narrative that naturally breaks 
- Do NOT include page numbers, page markers, or page headers in your content
- No plurals: Explicitly instruct to use only singular nouns
- Limit pronouns: Use only "I/you/ me / we / they/it" + simple verbs
- No possessive constructions: Avoid "his/her" + article combinations
- Ultra-simple structure: Only "Name + verb" or "Name + verb + noun"
- Word vocabulary: Enhanced Level 0 + user inputs + 1-4 letter filler words
- Sentence structure: 2-4 words per sentence, maximum 6 words
- Use Simple present tense
- Always allow {userName}, user inputs
- Story continues infinitely unless user requests ending
- Try to incorporate a narrative with a natural hook for continuation

Maximum 8 tokens per page. Max 6 words per page.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform any potentially concerning themes into their gentle equivalents naturally.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending children\'s story for {userName}, age 3-5. The story continues forever unless the user requests an ending. Use {specialRequest} as creative inspiration, or if none determined, create your own engaging themes. Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story in a direct way, mixing with your own creative elements. USE ONLY 1 sentence per page with simple subject-verb or subject-verb-object structure. Use MOSTLY sight words and 2-4 letter words. Use MOSTLY 2-4 word sentences (max 6).',
  },

  easy: {
    difficulty: 'easy',
    expectedPages: 10,
    systemPrompt: `Generate a picture book story for early readers aged 5-7.

RULES:
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content
- 3-6 letter words, 4-8 word sentences (max 12 words)
- 15-24 words per page
- Simple present/past tense, subject-verb-object structure
- Story continues infinitely unless user requests ending
- Include narrative hooks for continuation

Maximum 32 tokens per page. Target 15-24 words per page.

VOCABULARY: Prioritize Level 0 + Dolch 1st Grade words (133 total). 70% compliance expected.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform concerning themes to gentle equivalents.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 5-7. The story continues forever with natural pauses and continuation hooks unless the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Integrate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story in a direct way, mixing with your own creative elements. Use simple vocabulary with 2-3 sentences per page for developing readers. Let the story flow organically with natural progression.',
  },

  medium: {
    difficulty: 'medium',
    expectedPages: 10,
    systemPrompt: `Generate a chapter book story for readers aged 7-9.

RULES:
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments  
- Do NOT include page numbers, page markers, or page headers in your content
- Suggest 2-3 sentences per page. Use compound sentences with coordinating conjunctions (and, but, so). Mix simple and compound sentence structures for natural narrative flow
- 3-7 letter words, 5-12 word sentences (max 15 words)
- 50-70 words per page
- Past/present tense, varied sentence structures
- Story continues infinitely unless user requests ending
- Include narrative hooks and mild tension

Maximum 93 tokens per page. Target 50-70 words per page.

VOCABULARY: Use Level 1 + Dolch 2nd Grade words (179 total). 60% compliance expected.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Transform concerning themes.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 7-9. The story continues forever with natural pauses and continuation hooks unless the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} throughout the story, mixing with your own creative elements. Let the story flow organically with natural progression.',
  },

  hard: {
    difficulty: 'hard',
    expectedPages: 10,
    systemPrompt: `Generate an intermediate story for readers aged 9-11.

RULES:
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content
- Suggest 3-4 sentences per page. Use complex sentences with dependent clauses. Vary sentence beginnings and lengths. Include descriptive language and sophisticated vocabulary for engaging storytelling
- 4-9 letter words, varied sentence lengths (max 20 words)
- 80-120 words per page
- Multiple tenses, complex sentence structures
- Story continues infinitely unless user requests ending
- Include character development

Maximum 160 tokens per page. Target 80-120 words per page.

VOCABULARY: Use sophisticated 4th grade vocabulary with academic terms. 50% compliance expected.

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Avoid intense themes.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 9-12. The story continues forever with natural pauses and continuation hooks until the user requests an ending. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally incorporate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} when they enhance the narrative, mixing with your own creative elements. Let the story flow organically with sophisticated storytelling techniques.',
  },

  expert: {
    difficulty: 'expert',
    expectedPages: 10,
    systemPrompt: `Generate an advanced story for readers aged 11-13.

RULES:
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content
- Suggest 4-5 sentences per page. Use sophisticated sentence structures with multiple clauses. Employ literary devices and advanced vocabulary. Focus on nuanced character development and thematic depth
- Advanced vocabulary, sophisticated structures
- 120-200 words per page
- Multiple tenses, complex sentence structures
- Story continues infinitely unless user requests ending

Maximum 267 tokens per page. Target 120-200 words per page.

VOCABULARY: Use advanced vocabulary with literary terms. 50% compliance expected.

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Draw inspiration from getColorVoiceForUser(userInfo, difficulty) for stylistic direction - use as creative inspiration, not constraints.

GUARDRAILS: Age-appropriate content. No copyrighted content. Avoid inappropriate material.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName}, age 11-15 until the user requests an ending. Challenge readers intellectually with mature themes and transformative character growth. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally incorporate {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} when they enhance the narrative.',
  }
};

// Expert Level 4 Grade-Specific Prompts (6th-10th grade reading levels)
export const EXPERT_STORY_PROMPTS: Record<ExpertGradeLevel, ExpertStoryPromptConfig> = {
  
  "6th": {
    gradeLevel: "6th",
    expectedPages: 12,
    systemPrompt: `You are an expert story writer creating 6th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 6th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Suggest 5-6 sentences per page with foundational complex sentence structures and literary vocabulary. Focus on character development and thematic exploration appropriate for 6th grade readers. Target 200-400 words per page.

Maximum 400 tokens per page. Target 200-400 words per page.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 6th grade vocabulary that challenges readers intellectually and emotionally. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. Use a random internal seed (1-10,000) for unique details.',
    wordCount: "200-400 words per page"
  },

  "7th": {
    gradeLevel: "7th",
    expectedPages: 12,
    systemPrompt: `You are an expert story writer creating 7th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 7th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Suggest 6-7 sentences per page with increasingly sophisticated sentence structures and varied literary techniques. Develop complex themes and character relationships appropriate for 7th grade readers. Target 200-400 words per page.

Maximum 427 tokens per page. Target 200-400 words per page.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 7th grade vocabulary that challenges readers intellectually and emotionally. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. Use a random internal seed (1-10,000) for unique details.',
    wordCount: "200-400 words per page"
  },

  "8th": {
    gradeLevel: "8th",
    expectedPages: 12,
    systemPrompt: `You are an expert story writer creating 8th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 8th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Suggest 6-8 sentences per page with advanced grammatical structures, literary devices, and nuanced vocabulary. Explore mature themes with intellectual depth appropriate for 8th grade readers. Target 200-400 words per page.

Maximum 453 tokens per page. Target 200-400 words per page.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 8th grade vocabulary that challenges readers intellectually and emotionally. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. Use a random internal seed (1-10,000) for unique details.',
    wordCount: "200-400 words per page"
  },

  "9th": {
    gradeLevel: "9th",
    expectedPages: 12,
    systemPrompt: `You are an expert story writer creating 9th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 9th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Suggest 7-8 sentences per page with sophisticated prose, complex syntactic structures, and rich literary language. Develop intricate thematic content and psychological depth appropriate for 9th grade readers. Target 200-400 words per page.

Maximum 480 tokens per page. Target 200-400 words per page.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 9th grade vocabulary that challenges readers intellectually and emotionally. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. Use a random internal seed (1-10,000) for unique details.',
    wordCount: "200-400 words per page"
  },

  "10th": {
    gradeLevel: "10th",
    expectedPages: 12,
    systemPrompt: `You are an expert story writer creating 10th grade level content for advanced 11+ year old readers.

CRITICAL RULES:
- Story continues indefinitely unless user explicitly requests an ending
- Each continuation should have compelling hooks with thematic depth
- Follow story's natural rhythm and pacing requirements
- Generate content as continuous narrative that naturally breaks into distinct scenes/segments
- Do NOT include page numbers, page markers, or page headers in your content

USER INPUT INTEGRATION: Optional enhancement only - {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} available if story calls for them.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

AUTHOR'S STYLE: Apply styling from getColorVoiceForUser(userInfo, difficulty) for literary sophistication, thematic depth, and advanced narrative techniques. Author voice is secondary to {specialRequest} when themes conflict.

GUARDRAILS: Age-appropriate content for 10th grade level with mature themes handled sensitively. No external personal data. No copyrighted content.

FORMAT: Suggest 8-9 sentences per page with masterful prose, intricate sentence construction, and elevated literary language. Develop complex philosophical themes and profound character depth appropriate for 10th grade readers. Target 200-400 words per page.

Maximum 533 tokens per page. Target 200-400 words per page.

CRITICAL: Remove ALL markdown formatting including **bold**, *italic*, and any asterisks from your output.

Use seed={seed} to vary story elements: settings (home/park/forest/city), activities (exploring/helping/playing), moods (cheerful/curious/adventurous), and time periods (morning/afternoon/evening). Higher seeds favor active/adventurous themes, lower seeds favor calm/reflective themes.`,
    userPromptTemplate: 'Create a never-ending story for {userName} (age {age}) using 10th grade vocabulary that challenges readers intellectually and emotionally. Use {specialRequest} as the main theme and creative direction, or improvise (author\'s style is a reference). Naturally weave {favoriteColor}, {favoriteAnimal}, {favoriteFood}, and {hobbies} as subtle elements. Use a random internal seed (1-10,000) for unique details.',
    wordCount: "200-400 words per page"
  }
};

/**
 * Get token limit for difficulty level - HARDCODED for bulletproof reliability
 */
// Helper functions for accessing prompts
export function getStoryPrompt(difficulty: DifficultyLevel) {
  return STORY_PROMPTS[difficulty];
}

export function getExpertStoryPrompt(gradeLevel: ExpertGradeLevel) {
  return EXPERT_STORY_PROMPTS[gradeLevel];
}

export function formatUserPrompt(template: string, userInfo: any): string {
  return template
    .replace(/\{userName\}/g, userInfo.name || 'Reader')
    .replace(/\{favoriteColor\}/g, userInfo.favoriteColor || 'blue')
    .replace(/\{favoriteAnimal\}/g, userInfo.favoriteAnimal || 'cat')
    .replace(/\{favoriteFood\}/g, userInfo.favoriteFood || 'cookies')
    .replace(/\{hobbies\}/g, userInfo.hobbies || 'playing outside')
    .replace(/\{age\}/g, userInfo.age?.toString() || '8');
}

/**
 * Extract token limit directly from system prompt - SINGLE SOURCE OF TRUTH
 */
export function extractTokenLimitFromPrompt(systemPrompt: string): number {
  const match = systemPrompt.match(/Maximum (\d+) tokens per page/);
  return match ? parseInt(match[1]) : 8; // Safe fallback
}

/**
 * Get per-page token limit from system prompts (for live generation)
 */
export function getPerPageTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  if (Object.keys(STORY_PROMPTS).includes(difficulty as DifficultyLevel)) {
    return extractTokenLimitFromPrompt(STORY_PROMPTS[difficulty as DifficultyLevel].systemPrompt);
  }
  if (Object.keys(EXPERT_STORY_PROMPTS).includes(difficulty as ExpertGradeLevel)) {
    return extractTokenLimitFromPrompt(EXPERT_STORY_PROMPTS[difficulty as ExpertGradeLevel].systemPrompt);
  }
  return 8; // Safe fallback
}

/**
 * Get total story tokens for guests (6 pages of consistent difficulty)
 */
export function getTotalStoryTokensForGuests(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getPerPageTokenLimit(difficulty) * 6; // 6 pages for guests
}

/**
 * Get total Netflix generation tokens (10-12 pages depending on difficulty)
 */
export function getTotalNetflixTokens(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const perPageTokens = getPerPageTokenLimit(difficulty);
  const pages = getExpectedPages(difficulty);
  return perPageTokens * pages;
}

/**
 * Get expected pages for difficulty level
 */
function getExpectedPages(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  if (Object.keys(STORY_PROMPTS).includes(difficulty as DifficultyLevel)) {
    return STORY_PROMPTS[difficulty as DifficultyLevel].expectedPages || 10;
  }
  if (Object.keys(EXPERT_STORY_PROMPTS).includes(difficulty as ExpertGradeLevel)) {
    return EXPERT_STORY_PROMPTS[difficulty as ExpertGradeLevel].expectedPages || 12;
  }
  return 10;
}

/**
 * Get token limit for difficulty level - NOW USES SYSTEM PROMPTS AS SOURCE OF TRUTH
 */
export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  return getTotalNetflixTokens(difficulty); // For Netflix generation (total story)
}

/**
 * Apply placeholder resolution to prompts
 * Simple resolution without dependencies on frontend utilities
 */
export function resolvePromptPlaceholders(
  text: string, 
  userInfo: any = {}, 
  seed?: string | number
): string {
  const placeholders = {
    userName: userInfo.name || 'Child',
    favoriteColor: userInfo.favoriteColor || 'blue',
    favoriteAnimal: userInfo.favoriteAnimal || 'cat',
    favoriteFood: userInfo.favoriteFood || 'pizza',
    hobbies: userInfo.hobbies || 'playing',
    specialRequest: userInfo.specialRequest || 'adventure',
    age: userInfo.age || '8',
    seed: seed || Math.floor(Math.random() * 10000)
  };
  
  let resolved = text;
  for (const [key, value] of Object.entries(placeholders)) {
    resolved = resolved.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  
  return resolved;
}