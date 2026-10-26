// Central type definitions for the Time-2-Read application
import type { Grade as SharedGrade, ExpertGrade } from "@/lib/grades";

export type DifficultyLevel = "beginner" | "easy" | "medium" | "hard" | "expert";
export type ExpertGradeLevel = ExpertGrade; // from GRADES (src/lib/grades.ts)
export type LanguageCode = "en" | "ar" | "es" | "zh" | "hi" | "pt" | "fr" | "ur" | "fr-francophone-african" | "en-african-american";
export type LearningGoal = "improve-english-reading" | "learn-english-language" | "both";
export type SkinTone = "pale" | "light" | "medium" | "olive" | "dark";
export type AvatarType = "boy" | "girl" | "prefer-not-to-answer";
export type Grade = SharedGrade; // PreK, K, 1–10 from GRADES (src/lib/grades.ts)

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
  favoriteColor?: string;  // Optional - only if user provided
  favoriteAnimal?: string; // Optional - only if user provided  
  hobbies?: string;        // Optional - only if user provided
  favoriteFood?: string;   // Optional - only if user provided
  specialRequest: string;
  targetVocabulary?: string;
  difficultyLevel?: string; // Stores backend values after form conversion: "beginner", "easy", "medium", "hard", "expert"
  readingLevel?: string; // Add this for compatibility
  interests?: string[]; // Add this for compatibility
  
  storyLanguagePreferences?: string[]; // Add this for story preferences
  storyLanguagePreference?: LanguageCode; // New: separate story content language from native language
  expertGradeLevel?: ExpertGradeLevel; // For Level 4 adaptive progression
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
  difficulty: string; // Frontend difficulty level for UI consistency
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