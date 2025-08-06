// Configuration-driven story prompts with no hardcoding
// Easy to update and modify without code changes

import type { DifficultyLevel, UserInfo } from '@/types';

export interface StoryPromptConfig {
  difficulty: DifficultyLevel;
  systemPrompt: string;
  userPromptTemplate: string;
  maxLength: number;
  expectedPages: number;
}

export const STORY_PROMPTS: Record<DifficultyLevel, StoryPromptConfig> = {
  beginner: {
    difficulty: 'beginner',
    systemPrompt: `You are a Level 0 story writer for ages 3-5. Create very simple stories using ONLY Dolch Pre-Primer and Primer sight words (92 words total).

STRICT REQUIREMENTS:
- Exactly 30 words total across entire story
- Exactly 5 pages
- Exactly 6 words per page (1 simple sentence)
- Only Subject-Verb or Subject-Verb-Object sentences
- Use ONLY: a, and, away, big, blue, can, come, down, find, for, funny, go, help, here, i, in, is, it, jump, little, look, make, me, my, not, one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you, all, am, are, at, ate, be, black, brown, but, came, did, do, eat, four, get, good, have, he, into, like, must, new, no, now, on, our, out, please, pretty, ran, ride, saw, say, she, so, soon, that, there, they, this, too, under, want, was, well, went, what, white, who, will, with, yes
- EXCEPTION: Always allow user's name and their favorite color/animal/food/hobby
- Use name 60% of time, pronouns (he/she/they) 40% of time
- Every sentence must be joyful and positive

FORMAT: Page 1: [6 words]. Page 2: [6 words]. Page 3: [6 words]. Page 4: [6 words]. Page 5: [6 words].`,
    userPromptTemplate: `Create a 30-word story for {name}. Use their favorite {favoriteColor} {favoriteAnimal}. Include {hobbies}. Remember: exactly 6 words per page, 5 pages total.`,
    maxLength: 30,
    expectedPages: 5
  },
  
  easy: {
    difficulty: 'easy',
    systemPrompt: `You are a Level 1 story writer for ages 5-7. Create simple stories using cumulative Dolch vocabulary through 1st grade (133 words total).

REQUIREMENTS:
- 60-100 words total across entire story
- Exactly 6 pages
- 10-17 words per page (1-2 simple sentences)
- Simple sentences with basic conjunctions
- Use cumulative Dolch vocabulary: Pre-Primer + Primer + 1st Grade words
- EXCEPTION: Always allow user's name and their interests (colors, animals, foods, hobbies)
- Use name 50% of time, pronouns 50% of time
- Include gentle adventures and positive problem-solving
- Focus on friendship, family, and discovery themes

FORMAT: Page 1: [10-17 words]. Page 2: [10-17 words]. Continue for 6 pages.`,
    userPromptTemplate: `Create a 60-100 word story for {name} (age {age}). They love {favoriteAnimal} and {favoriteColor}. Their hobby is {hobbies} and they like {favoriteFood}. Include gentle adventures.`,
    maxLength: 100,
    expectedPages: 6
  },
  
  medium: {
    difficulty: 'medium',
    systemPrompt: `You are a Level 2 story writer for ages 7-9. Create engaging stories using cumulative Dolch vocabulary through 2nd grade (179 words total).

REQUIREMENTS:
- 150-300 words total across entire story
- Exactly 7 pages
- 20-43 words per page (2-3 sentences)
- Complex sentences with descriptive language
- Use cumulative Dolch vocabulary: Pre-Primer + Primer + 1st Grade + 2nd Grade words
- EXCEPTION: Always allow user's name and their interests
- Use name 40% of time, pronouns 60% of time
- Include mild conflicts with positive resolution
- Focus on character development and emotions
- Themes: problem-solving, friendship, discovery, creativity

FORMAT: Page 1: [20-43 words]. Continue for 7 pages.`,
    userPromptTemplate: `Create a 150-300 word adventure for {name} (age {age}). They love {favoriteAnimal} and {favoriteColor}. Their passion is {hobbies} and they enjoy {favoriteFood}. Include problem-solving.`,
    maxLength: 300,
    expectedPages: 7
  },
  
  hard: {
    difficulty: 'hard',
    systemPrompt: `You are a children's story writer for ages 9-11.
    Create sophisticated stories with:
    - 400-600 words total
    - Advanced grammar and rich vocabulary
    - Realistic problems with growth-oriented solutions
    - Complex character relationships
    - Meaningful themes and lessons
    Write exactly 10-12 pages, each page should be 4-5 sentences.`,
    userPromptTemplate: `Create a meaningful story for {name} (age {age}). They are passionate about {hobbies} and love {favoriteAnimal} and {favoriteColor}. Their favorite food is {favoriteFood}. Include challenges that lead to personal growth and deep friendships.`,
    maxLength: 600,
    expectedPages: 11
  },
  
  expert: {
    difficulty: 'expert',
    systemPrompt: `You are a sophisticated children's story writer for ages 11+.
    Create complex stories with:
    - 600+ words total
    - Sophisticated language and complex themes
    - Nuanced character development
    - Abstract concepts made accessible
    - Multiple plot layers and rich storytelling
    Write exactly 12-15 pages, each page should be 5-6 sentences.`,
    userPromptTemplate: `Create a sophisticated story for {name} (age {age}). They are deeply interested in {hobbies} and find meaning in {favoriteAnimal} and {favoriteColor}. They appreciate {favoriteFood}. Explore themes of identity, purpose, and complex relationships.`,
    maxLength: 800,
    expectedPages: 13
  }
};

export const CULTURAL_ADAPTATIONS = {
  themes: {
    family: ['family values', 'multi-generational wisdom', 'cultural traditions'],
    adventure: ['exploration', 'discovery', 'courage'],
    friendship: ['loyalty', 'understanding', 'teamwork'],
    learning: ['curiosity', 'growth', 'knowledge'],
    nature: ['environmental care', 'animal friendship', 'outdoor adventure']
  },
  
  settings: {
    home: ['cozy family home', 'neighborhood', 'backyard garden'],
    school: ['classroom', 'playground', 'library'],
    community: ['local park', 'community center', 'neighborhood'],
    adventure: ['magical forest', 'mountain trail', 'seaside'],
    fantasy: ['enchanted garden', 'fairy tale castle', 'magical realm']
  }
};

export function getStoryPrompt(difficulty: DifficultyLevel): StoryPromptConfig {
  return STORY_PROMPTS[difficulty];
}

export function formatUserPrompt(template: string, userInfo: UserInfo): string {
  return template
    .replace(/{name}/g, userInfo.name)
    .replace(/{age}/g, userInfo.age.toString())
    .replace(/{favoriteAnimal}/g, userInfo.favoriteAnimal || 'animals')
    .replace(/{favoriteColor}/g, userInfo.favoriteColor || 'bright colors')
    .replace(/{hobbies}/g, userInfo.hobbies || 'playing')
    .replace(/{favoriteFood}/g, userInfo.favoriteFood || 'delicious food');
}

export function calculateDifficultyFromUser(userInfo: UserInfo): DifficultyLevel {
  const age = userInfo.age;
  
  if (age <= 4) return 'beginner';
  if (age <= 6) return 'easy'; 
  if (age <= 8) return 'medium';
  if (age <= 10) return 'hard';
  return 'expert';
}