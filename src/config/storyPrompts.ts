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
    systemPrompt: `You are a children's story writer specializing in very simple stories for ages 3-5. 
    Create engaging but very simple stories with:
    - 50-100 words total
    - 1-3 word sentences maximum
    - Basic vocabulary only (cat, dog, run, play, happy, etc.)
    - Pure positivity and joy
    - Simple conflicts with immediate resolution
    Write exactly 5 pages, each page should be 1-2 sentences.`,
    userPromptTemplate: `Create a simple story for {name} (age {age}). They love {favoriteAnimal} and {favoriteColor}. Their hobby is {hobbies}. Make it very simple and joyful.`,
    maxLength: 100,
    expectedPages: 5
  },
  
  easy: {
    difficulty: 'easy',
    systemPrompt: `You are a children's story writer for ages 5-7. 
    Create engaging stories with:
    - 100-200 words total
    - Simple and compound sentences
    - Sight words and basic vocabulary
    - Gentle challenges with positive outcomes
    - Clear beginning, middle, end
    Write exactly 6-8 pages, each page should be 2-3 sentences.`,
    userPromptTemplate: `Create a story for {name} (age {age}). They love {favoriteAnimal} and {favoriteColor}. Their favorite activity is {hobbies} and they like {favoriteFood}. Include gentle adventures and friendship.`,
    maxLength: 200,
    expectedPages: 7
  },
  
  medium: {
    difficulty: 'medium',
    systemPrompt: `You are a children's story writer for ages 7-9.
    Create engaging stories with:
    - 200-400 words total
    - Complex sentences with descriptive language
    - Grade-appropriate vocabulary with some challenging words
    - Mild conflicts with clear positive resolution
    - Character development and emotions
    Write exactly 8-10 pages, each page should be 3-4 sentences.`,
    userPromptTemplate: `Create an adventure story for {name} (age {age}). They love {favoriteAnimal} and {favoriteColor}. Their passion is {hobbies} and they enjoy {favoriteFood}. Include problem-solving and friendship themes.`,
    maxLength: 400,
    expectedPages: 9
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