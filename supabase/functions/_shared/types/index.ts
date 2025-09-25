/**
 * CANONICAL TYPE DEFINITIONS
 * Single source of truth for all Edge function types
 * Prevents type cascade errors across functions
 */

// Session identifier type
export type SessionId = string;

// User information interface - canonical version
export interface UserInfo {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'team';
  displayName?: string;
  guardianEmail?: string | null;
  readingLevel?: number;
  gradeLevel?: string;
  interests?: string[];
  nativeLanguage?: string;
}

// Character seed interface with all properties
export interface CharacterSeed {
  baseSeed: number;
  characterName: string;
  avatarType: string;
  skinTone: string;
  consistentClothingStyle: string;
  selectedCulturalHair: string | null;
  selectedCulturalFeatures: string | null;
  characterSpecificSeed: string;
  physicalTraits?: Record<string, unknown>;
}

// Avatar identity input for character creation
export interface AvatarIdentity {
  name?: string;
  type?: string;
  characterName?: string;
  avatarType?: string;
  skinTone?: string;
  consistentClothingStyle?: string;
  physicalTraits?: Record<string, unknown>;
}

// Story context type (used as string in actual calls)
export type StoryContext = string;

// Secondary character result
export interface SecondaryCharacter {
  name: string;
  type: string;
  description: string;
  seed: number;
  [key: string]: unknown;
}

// Cultural selection update params
export interface CulturalSelectionUpdate {
  sessionId: string;
  characterKey: string;
  selectedCulturalHair: string | null;
  selectedCulturalFeatures: string | null;
}