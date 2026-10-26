// Central type definitions for the Time-2-Read application
import type { Grade as SharedGrade, ExpertGrade } from "@/lib/grades";
import { type BackendDifficulty } from "@/lib/grades";

export type DifficultyLevel = BackendDifficulty;
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
  /** "Reads at": the grade the words are written at (child_profiles.reading_grade). */
  readingGrade?: Grade;
  /** The child's school grade (child_profiles.grade_level): sets topics and themes, never the word difficulty. */
  schoolGrade?: Grade;
  nativeLanguage: LanguageCode;
  learningGoal: LearningGoal;
  avatar: Avatar;
  favoriteColor?: string;  // Optional - only if user provided
  favoriteAnimal?: string; // Optional - only if user provided  
  hobbies?: string;        // Optional - only if user provided
  favoriteFood?: string;   // Optional - only if user provided
  specialRequest: string;
  targetVocabulary?: string;
  difficultyLevel?: string; // A FRONTEND reading level ("pre-reader" … "advanced"), derived from Reads at; see docs/reading-levels.md
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
  difficulty: string; // Frontend difficulty level (internal; screens show readingGrade)
  /** The Reads-at grade the story was written at. */
  readingGrade?: string;
  estimatedReadingTime: number;
  wordCount: number;
}

export interface SessionStats {
  wordsRead: number;
  timeSpent: number;
  pagesRead: number;
  startTime: number;
  accuracy: number;
  /** Frontend reading level at the end of the session. */
  currentDifficulty?: string;
  /** Reading grade at the end of the session ("PreK" … "10"). */
  readingGrade?: string;
  storyTitle?: string;
}