// Central type definitions for the Time2Read application

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";
export type LanguageCode = "en" | "ar" | "es" | "zh" | "hi" | "pt" | "fr";
export type LearningGoal = "improve-english-reading" | "learn-english-language" | "both";
export type SkinTone = "pale" | "light" | "medium" | "olive" | "dark";
export type AvatarType = "boy" | "girl" | "prefer-not-to-answer";
export type Grade = "PreK" | "K" | "1st" | "2nd" | "3rd" | "4th" | "5th" | "6th+";

export interface Avatar {
  type: AvatarType;
  skinTone: SkinTone;
}

export interface UserInfo {
  name: string;
  age: number;
  grade: Grade;
  gradeLevel?: Grade; // Add this for compatibility
  nativeLanguage: LanguageCode;
  learningGoal: LearningGoal;
  avatar: Avatar;
  favoriteColor: string;
  favoriteAnimal: string;
  hobbies: string;
  favoriteFood: string;
  specialRequest: string;
  difficultyLevel?: DifficultyLevel;
  readingAbility?: DifficultyLevel;
  readingLevel?: string; // Add this for compatibility
  interests?: string[]; // Add this for compatibility
  storyLanguagePreference?: LanguageCode; // New: separate story content language from native language
}

export interface StorySegment {
  text: string;
  illustration?: string;
  audioUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  segments: StorySegment[];
  difficulty: DifficultyLevel;
  estimatedReadingTime: number;
  wordCount: number;
}

export interface SessionStats {
  wordsRead: number;
  timeSpent: number;
  pagesRead: number;
  startTime: number;
  accuracy: number;
}