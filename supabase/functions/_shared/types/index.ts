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

// Avatar details interface for SessionStateManager
export interface AvatarDetails {
  avatar?: {
    type?: string;
    skinTone?: string;
  };
}

// Type guard for safe avatar access
export function hasAvatar(userInfo: UserInfo): userInfo is UserInfo & { avatar: AvatarDetails['avatar'] } {
  const info = userInfo as UserInfo & { avatar?: AvatarDetails['avatar'] };
  return !!(info.avatar && typeof info.avatar.type === 'string' && typeof info.avatar.skinTone === 'string');
}

// Safe avatar accessor helper to avoid "used before guard" pattern
export function getAvatar(x: unknown): AvatarDetails['avatar'] | undefined {
  return x && typeof x === 'object' && typeof (x as any).avatar === 'object'
    ? (x as any).avatar
    : undefined;
}

// TemplateLevel union type for arc processing
export type TemplateLevel = 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'grade6' | 'grade7' | 'grade8' | 'grade9' | 'grade10';

// Template level normalizer
export function toTemplateLevel(input: string): TemplateLevel {
  const s = (input || '').trim().toLowerCase();
  switch (s) {
    case 'level0': case 'beginner': return 'level0';
    case 'level1': case 'easy': return 'level1';
    case 'level2': case 'medium': return 'level2';
    case 'level3': case 'hard': return 'level3';
    case 'level4': case 'expert': return 'level4';
    case 'grade6': return 'grade6';
    case 'grade7': return 'grade7';
    case 'grade8': return 'grade8';
    case 'grade9': return 'grade9';
    case 'grade10': return 'grade10';
    default: return 'level1'; // sane default
  }
}

// Session state interface with proper property names
export interface SessionState {
  environmentState?: string;
  environmentalState?: string; // legacy alias
  originalSpecialRequest?: string;
  arcHistory?: Array<{
    theme?: string;
    keyObject?: string;
    setting?: string;
    templateIndex?: number;
  }>;
  swappableState?: {
    secondaryCharacter?: string;
    setting?: string;
    keyObject?: string;
  };
  endingRotation?: string[];
}

// Cultural selection update params
export interface CulturalSelectionUpdate {
  sessionId: string;
  characterKey: string;
  selectedCulturalHair: string | null;
  selectedCulturalFeatures: string | null;
}