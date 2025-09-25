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

// SecondaryCharacter interface with type guard for safe casting
export interface SecondaryCharacter {
  name: string;
  type: string;
  description: string;
  seed: number;
  [k: string]: unknown; // allow extras without losing type-safety
}

export function isSecondaryCharacter(x: unknown): x is SecondaryCharacter {
  const y = x as Record<string, unknown> | null;
  return !!y
    && typeof y.name === 'string'
    && typeof y.type === 'string'
    && typeof y.description === 'string'
    && typeof y.seed === 'number';
}

// Cultural selection update params
export interface CulturalSelectionUpdate {
  sessionId: string;
  characterKey: string;
  selectedCulturalHair: string | null;
  selectedCulturalFeatures: string | null;
}