/**
 * RUNTIME VALIDATION SCHEMAS
 * Zod schemas for boundary validation to prevent shape mismatches
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// User info validation schema
export const UserInfoDto = z.object({
  id: z.string(),
  email: z.string().email(),
  plan: z.enum(['free', 'premium', 'team']),
  displayName: z.string().optional(),
  guardianEmail: z.string().email().nullable().optional(),
  readingLevel: z.number().optional(),
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()).optional(),
  nativeLanguage: z.string().optional(),
});

// Character seed validation schema
export const CharacterSeedDto = z.object({
  baseSeed: z.number(),
  characterName: z.string(),
  avatarType: z.string(),
  skinTone: z.string(),
  consistentClothingStyle: z.string(),
  selectedCulturalHair: z.string().nullable(),
  selectedCulturalFeatures: z.string().nullable(),
  characterSpecificSeed: z.string(),
  physicalTraits: z.record(z.unknown()).optional(),
});

// Avatar identity validation schema
export const AvatarIdentityDto = z.object({
  characterName: z.string().optional(),
  avatarType: z.string().optional(),
  skinTone: z.string().optional(),
  consistentClothingStyle: z.string().optional(),
  physicalTraits: z.record(z.unknown()).optional(),
});

// Type inference from schemas
export type UserInfo = z.infer<typeof UserInfoDto>;
export type CharacterSeed = z.infer<typeof CharacterSeedDto>;
export type AvatarIdentity = z.infer<typeof AvatarIdentityDto>;

// Validation helper functions
export function validateUserInfo(data: unknown): UserInfo {
  return UserInfoDto.parse(data);
}

export function validateCharacterSeed(data: unknown): CharacterSeed {
  return CharacterSeedDto.parse(data);
}

export function validateAvatarIdentity(data: unknown): AvatarIdentity {
  return AvatarIdentityDto.parse(data);
}