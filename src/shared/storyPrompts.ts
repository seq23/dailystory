// Frontend copy of story prompts - synchronized with backend
// Single source of truth moved to frontend for better bundling

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

Maximum 48 tokens total. Max 6 words per page.

USER INPUT INTEGRATION: Mix {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} with AI content throughout story.

{specialRequest} is default theme (if valid theme detected), else AI creates themes. Mix/vary themes for long sessions.

GUARDRAILS: G-rated content only. No external personal data. No copyrighted content. Transform any potentially concerning themes into their gentle equivalents naturally.`,
    userPromptTemplate: `The main character is {userName} - always use the correct pronouns. Create a never-ending story for {userName}, age 3-5 until the user says "The End". Focus on {specialRequest} themes when possible, incorporating {userName}'s favorite {favoriteColor} {favoriteAnimal} and their love of {favoriteFood}. Make it about {hobbies} adventures. Keep vocabulary extremely simple and use mostly words {userName} might already know.`,
    expectedPages: 9999, // Unlimited
    maxLength: 48
  },
  easy: {
    difficulty: 'easy',
    systemPrompt: `Generate ONE PAGE of an engaging story for emerging readers aged 5-7.

RULES:
- Use simple sentences (3-8 words each)
- Mix Level 1 vocabulary with some Level 2 words
- Use present and simple past tense primarily
- Generate 2-4 sentences per page
- Use "Page X:" markers to clearly separate each page
- Story continues infinitely unless user requests ending
- Ensure natural narrative flow with gentle cliffhangers

Maximum 80 tokens per page. 2-4 sentences per page.

USER INPUT INTEGRATION: Naturally weave {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies} throughout.

{specialRequest} provides thematic direction when appropriate.

GUARDRAILS: G-rated, educational, promotes positive values.`,
    userPromptTemplate: `The main character is {userName} - use appropriate pronouns consistently. Create a continuing story for {userName}, age 5-7 until the user says "The End". Include {userName}'s {favoriteColor} {favoriteAnimal} companion and adventures involving {favoriteFood} and {hobbies}. Focus on {specialRequest} when possible.`,
    expectedPages: 9999, // Unlimited  
    maxLength: 80
  },
  medium: {
    difficulty: 'medium',
    systemPrompt: `Generate ONE PAGE of an adventure story for developing readers aged 7-9.

RULES:
- Use varied sentence structures (5-12 words)
- Mix Level 2 and Level 3 vocabulary
- Include descriptive language and emotions
- Generate 3-5 sentences per page
- Use "Page X:" markers to separate content
- Story continues infinitely unless user requests ending
- Create meaningful character development

Maximum 120 tokens per page. 3-5 sentences per page.

USER INPUT INTEGRATION: Blend user preferences naturally into plot and character development.

GUARDRAILS: Age-appropriate content, educational themes, positive problem-solving.`,
    userPromptTemplate: `The main character is {userName} - maintain consistent pronoun usage. Create an ongoing adventure for {userName}, age 7-9. Feature a {favoriteColor} {favoriteAnimal} as an important character. Include {favoriteFood} and {hobbies} meaningfully. Build on {specialRequest} themes when suitable.`,
    expectedPages: 9999, // Unlimited
    maxLength: 120
  },
  hard: {
    difficulty: 'hard', 
    systemPrompt: `Generate ONE PAGE of a sophisticated story for confident readers aged 9-11.

RULES:
- Use complex sentence structures and varied vocabulary
- Include Level 3 and Level 4 vocabulary appropriately
- Develop plot, character, and setting with depth
- Generate 4-6 sentences per page
- Use "Page X:" markers to separate content  
- Story continues infinitely unless user requests ending
- Include emotional complexity and meaningful themes

Maximum 160 tokens per page. 4-6 sentences per page.

USER INPUT INTEGRATION: Incorporate user elements as integral story components.

GUARDRAILS: Age-appropriate, promotes critical thinking and empathy.`,
    userPromptTemplate: `The main character is {userName} - use consistent pronouns throughout. Create a continuing story for {userName}, age 9-11. Integrate a {favoriteColor} {favoriteAnimal} as a meaningful character. Include {favoriteFood} and {hobbies} as important elements. Build on {specialRequest} themes when appropriate.`,
    expectedPages: 9999, // Unlimited
    maxLength: 160
  },
  expert: {
    difficulty: 'expert',
    systemPrompt: `Generate ONE PAGE of an advanced story for readers aged 11-13.

RULES:
- Suggest 4-5 sentences per page. Use sophisticated sentence structures with multiple clauses
- Include advanced vocabulary and literary devices
- Develop complex themes and character relationships
- Generate 4-6 sentences per page
- Use "Page X:" markers to separate content
- Story continues infinitely unless user requests ending
- Include nuanced emotional and social themes

Maximum 240 tokens per page. 4-6 sentences per page.

USER INPUT INTEGRATION: Weave user preferences into sophisticated narrative elements.

GUARDRAILS: Age-appropriate, promotes advanced literacy and critical thinking.`,
    userPromptTemplate: `The main character is {userName} - maintain consistent pronoun usage. Create an ongoing story for {userName}, age 11-13. Feature a {favoriteColor} {favoriteAnimal} as a significant character. Meaningfully incorporate {favoriteFood} and {hobbies}. Develop {specialRequest} themes when appropriate.`,
    expectedPages: 9999, // Unlimited
    maxLength: 240
  }
};

export const EXPERT_STORY_PROMPTS: Record<ExpertGradeLevel, ExpertStoryPromptConfig> = {
  '6th': {
    gradeLevel: '6th',
    systemPrompt: `Generate ONE PAGE of an advanced story for 6th grade readers (ages 11-12).

RULES:
- Use sophisticated sentence structures with multiple clauses
- Include vocabulary appropriate for 6th grade level
- Develop complex themes and character relationships  
- Generate 4-5 sentences per page
- Use "Page X:" markers to separate content
- Focus on character development and plot progression
- Include descriptive language and literary techniques

Target: 180-220 words per page. 4-5 sentences per page.

USER INPUT INTEGRATION: Integrate user preferences as core story elements.

GUARDRAILS: Age-appropriate, educational, promotes advanced reading skills.`,
    userPromptTemplate: `The main character is {userName} - use consistent pronouns. Create a story for {userName}, grade 6. Feature a {favoriteColor} {favoriteAnimal} companion. Include {favoriteFood} and {hobbies} meaningfully. Focus on {specialRequest} themes.`,
    expectedPages: 12,
    maxLength: 220,
    wordCount: '180-220'
  },
  '7th': {
    gradeLevel: '7th', 
    systemPrompt: `Generate ONE PAGE of an advanced story for 7th grade readers (ages 12-13).

RULES:
- Use complex sentence structures with varied syntax
- Include challenging vocabulary and literary devices
- Develop sophisticated themes and character psychology
- Generate 4-5 sentences per page
- Use "Page X:" markers to separate content
- Focus on emotional depth and social themes
- Include metaphorical and symbolic elements

Target: 200-240 words per page. 4-5 sentences per page.

USER INPUT INTEGRATION: Weave user elements into complex narrative structures.

GUARDRAILS: Age-appropriate, promotes critical thinking and analysis.`,
    userPromptTemplate: `The main character is {userName} - maintain pronoun consistency. Create a story for {userName}, grade 7. Include a {favoriteColor} {favoriteAnimal} as an important character. Incorporate {favoriteFood} and {hobbies} meaningfully. Develop {specialRequest} themes.`,
    expectedPages: 13,
    maxLength: 240,
    wordCount: '200-240'
  },
  '8th': {
    gradeLevel: '8th',
    systemPrompt: `Generate ONE PAGE of an advanced story for 8th grade readers (ages 13-14).

RULES:
- Use sophisticated language and complex sentence structures
- Include advanced vocabulary and literary techniques
- Develop mature themes and character development
- Generate 4-6 sentences per page
- Use "Page X:" markers to separate content
- Focus on psychological depth and social issues
- Include advanced literary devices and symbolism

Target: 220-260 words per page. 4-6 sentences per page.

USER INPUT INTEGRATION: Integrate user preferences into sophisticated storytelling.

GUARDRAILS: Age-appropriate, promotes advanced literacy and analysis.`,
    userPromptTemplate: `The main character is {userName} - use appropriate pronouns consistently. Create a story for {userName}, grade 8. Feature a {favoriteColor} {favoriteAnimal} as a significant character. Include {favoriteFood} and {hobbies} as important elements. Build on {specialRequest} themes.`,
    expectedPages: 14,
    maxLength: 260,
    wordCount: '220-260'
  },
  '9th': {
    gradeLevel: '9th',
    systemPrompt: `Generate ONE PAGE of an advanced story for 9th grade readers (ages 14-15).

RULES:
- Use complex language with varied sentence structures
- Include challenging vocabulary and advanced literary devices
- Develop sophisticated themes and character psychology
- Generate 5-6 sentences per page
- Use "Page X:" markers to separate content
- Focus on complex social and emotional themes
- Include nuanced character development and conflict

Target: 240-280 words per page. 5-6 sentences per page.

USER INPUT INTEGRATION: Incorporate user elements into complex narrative frameworks.

GUARDRAILS: Age-appropriate, promotes critical analysis and interpretation.`,
    userPromptTemplate: `The main character is {userName} - maintain consistent pronouns. Create a story for {userName}, grade 9. Include a {favoriteColor} {favoriteAnimal} as a meaningful character. Incorporate {favoriteFood} and {hobbies} thoughtfully. Develop {specialRequest} themes with depth.`,
    expectedPages: 15,
    maxLength: 280,
    wordCount: '240-280'
  },
  '10th': {
    gradeLevel: '10th',
    systemPrompt: `Generate ONE PAGE of an advanced story for 10th grade readers (ages 15-16).

RULES:
- Use sophisticated language with complex syntax
- Include advanced vocabulary and mature literary techniques
- Develop complex themes and psychological depth
- Generate 5-6 sentences per page  
- Use "Page X:" markers to separate content
- Focus on mature themes and character complexity
- Include advanced literary analysis opportunities

Target: 260-300 words per page. 5-6 sentences per page.

USER INPUT INTEGRATION: Weave user preferences into sophisticated literary structures.

GUARDRAILS: Age-appropriate, promotes advanced literary analysis and critical thinking.`,
    userPromptTemplate: `The main character is {userName} - use consistent pronouns throughout. Create a story for {userName}, grade 10. Feature a {favoriteColor} {favoriteAnimal} as an important character. Include {favoriteFood} and {hobbies} meaningfully. Build sophisticated {specialRequest} themes.`,
    expectedPages: 16,
    maxLength: 300,
    wordCount: '260-300'
  }
};

// Helper functions
export function getStoryPrompt(difficulty: DifficultyLevel): StoryPromptConfig {
  return STORY_PROMPTS[difficulty] || STORY_PROMPTS.beginner;
}

export function getExpertStoryPrompt(gradeLevel: ExpertGradeLevel): ExpertStoryPromptConfig {
  return EXPERT_STORY_PROMPTS[gradeLevel] || EXPERT_STORY_PROMPTS['6th'];
}

export function formatUserPrompt(template: string, userInfo: any): string {
  let formatted = template;
  
  // Replace basic user info placeholders
  formatted = formatted.replace(/{userName}/g, userInfo?.name || 'Alex');
  formatted = formatted.replace(/{favoriteColor}/g, userInfo?.favoriteColor || 'blue');
  formatted = formatted.replace(/{favoriteAnimal}/g, userInfo?.favoriteAnimal || 'cat');
  formatted = formatted.replace(/{favoriteFood}/g, userInfo?.favoriteFood || 'cookies');
  formatted = formatted.replace(/{hobbies}/g, userInfo?.hobbies || 'playing outside');
  formatted = formatted.replace(/{specialRequest}/g, userInfo?.specialRequest || 'adventure');
  
  return formatted;
}

export function getTokenLimitForDifficulty(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  // Token limits for story generation
  const limits: Record<string, number> = {
    beginner: 48,
    easy: 80,
    medium: 120, 
    hard: 160,
    expert: 240,
    '6th': 220,
    '7th': 240,
    '8th': 260,
    '9th': 280,
    '10th': 300
  };
  
  return limits[difficulty] || 120;
}

export function resolvePromptPlaceholders(text: string, userInfo?: any, seed?: string | number): string {
  if (!userInfo) return text;
  
  return formatUserPrompt(text, userInfo);
}