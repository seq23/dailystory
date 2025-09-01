// Frontend wrapper for story prompt utilities
// Re-exports functions from supabase functions for use in frontend services

import type { UserInfo, DifficultyLevel } from "@/types";

// Type definitions that match the edge function types
export type ExpertGradeLevel = '6th' | '7th' | '8th' | '9th' | '10th';

export interface StoryPromptConfig {
  difficulty: DifficultyLevel;
  systemPrompt: string;
  userPromptTemplate: string;
  maxLength?: number;
  expectedPages?: number;
}

export interface ExpertStoryPromptConfig {
  gradeLevel: ExpertGradeLevel;
  systemPrompt: string;
  userPromptTemplate: string;
  wordCount: string;
  expectedPages?: number;
}

// Mock functions that replicate edge function behavior for frontend use
export function getStoryPrompt(difficulty: DifficultyLevel): StoryPromptConfig {
  // Basic templates for frontend - edge function has the real ones
  const basicTemplates = {
    beginner: {
      difficulty: 'beginner' as const,
      systemPrompt: 'Level 0 pre-reader story engine',
      userPromptTemplate: 'Create a never-ending pre-reader story for {userName} (age 3-5). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}',
      expectedPages: 10
    },
    easy: {
      difficulty: 'easy' as const,
      systemPrompt: 'Beginner story engine',
      userPromptTemplate: 'Create a never-ending story for {userName} (age 5-7). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}',
      expectedPages: 10
    },
    medium: {
      difficulty: 'medium' as const,
      systemPrompt: 'Developing story engine',
      userPromptTemplate: 'Create a never-ending story for {userName} (age 7-9). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}',
      expectedPages: 10
    },
    hard: {
      difficulty: 'hard' as const,
      systemPrompt: 'Independent story engine',
      userPromptTemplate: 'Create a never-ending story for {userName} (age 9-11). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}',
      expectedPages: 10
    },
    expert: {
      difficulty: 'expert' as const,
      systemPrompt: 'Advanced story engine',
      userPromptTemplate: 'Create a never-ending story for {userName} (age 11-13). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}',
      expectedPages: 10
    }
  };
  
  return basicTemplates[difficulty];
}

export function getExpertStoryPrompt(gradeLevel: ExpertGradeLevel): ExpertStoryPromptConfig {
  // Basic templates for frontend - edge function has the real ones
  return {
    gradeLevel,
    systemPrompt: `Expert story writer for ${gradeLevel} grade`,
    userPromptTemplate: `Create a never-ending story for {userName} (age {age}). Theme: {specialRequest}. Vocabulary: {vocabularyInstructions}. Seed: {seed}`,
    wordCount: "200-400 words per page",
    expectedPages: 8
  };
}

export function formatUserPrompt(template: string, userInfo: Record<string, any>): string {
  return template
    .replace(/\{userName\}/g, userInfo.name || userInfo.userName || 'Reader')
    .replace(/\{favoriteColor\}/g, userInfo.favoriteColor || 'blue')
    .replace(/\{favoriteAnimal\}/g, userInfo.favoriteAnimal || 'cat')
    .replace(/\{favoriteFood\}/g, userInfo.favoriteFood || 'cookies')
    .replace(/\{hobbies\}/g, userInfo.hobbies || 'playing outside')
    .replace(/\{age\}/g, userInfo.age?.toString() || '8')
    .replace(/\{specialRequest\}/g, userInfo.specialRequest || 'create an engaging adventure')
    .replace(/\{vocabularyInstructions\}/g, userInfo.vocabularyInstructions || 'Use age-appropriate vocabulary')
    .replace(/\{seed\}/g, userInfo.seed?.toString() || Math.floor(Math.random() * 1000).toString());
}

export const mapGradeToExpertLevel = (gradeLevel: number): ExpertGradeLevel | null => {
  if (gradeLevel >= 6 && gradeLevel <= 10) {
    return `${gradeLevel}th` as ExpertGradeLevel;
  }
  return null;
};