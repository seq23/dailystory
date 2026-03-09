/**
 * Shared input validation schemas for edge functions.
 * Uses Zod for runtime validation at API boundaries.
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── generate-adaptive-story request schema ──
export const StoryRequestSchema = z.object({
  userInfo: z.object({
    name: z.string().max(100).optional(),
    difficultyLevel: z.string().max(30).optional(),
    gradeLevel: z.string().max(20).optional(),
    interests: z.array(z.string().max(50)).max(20).optional(),
    nativeLanguage: z.string().max(10).optional(),
    specialRequest: z.string().max(500).optional(),
    favoriteAnimal: z.string().max(50).optional(),
    favoriteColor: z.string().max(30).optional(),
    favoriteFood: z.string().max(50).optional(),
    hobbies: z.string().max(300).optional(),
  }).passthrough().optional(),
  config: z.object({
    userInfo: z.any().optional(),
    pageNumber: z.number().int().min(1).max(100).optional(),
    existingStory: z.string().max(50000).optional(),
    previousPages: z.array(z.string().max(5000)).max(100).optional(),
    isLiveGeneration: z.boolean().optional(),
    sessionId: z.string().max(100).optional(),
    totalPages: z.number().int().min(1).max(100).optional(),
  }).passthrough().optional(),
  difficulty: z.string().max(30).optional(),
  pageCount: z.number().int().min(1).max(100).optional(),
  mode: z.string().max(30).optional(),
  storyLanguage: z.string().max(10).optional(),
  targetLanguage: z.string().max(10).optional(),
}).passthrough();

// ── template-service request schema ──
export const TemplateRequestSchema = z.object({
  difficulty: z.string().max(30).optional(),
  userInfo: z.object({
    name: z.string().max(100).optional(),
    difficultyLevel: z.string().max(30).optional(),
    gradeLevel: z.string().max(20).optional(),
    interests: z.array(z.string().max(50)).max(20).optional(),
    nativeLanguage: z.string().max(10).optional(),
  }).passthrough().optional(),
  pageCount: z.number().int().min(1).max(100).optional(),
  templateIndex: z.number().int().min(0).max(1000).optional(),
  explore: z.boolean().optional(),
  mode: z.string().max(30).optional(),
  pageIndex: z.number().int().min(0).max(100).optional(),
  sessionId: z.string().max(100).optional(),
  isNeverEnding: z.boolean().optional(),
}).passthrough();

// ── TTS request schema ──
export const TTSRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  voice: z.string().max(50).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
  model_id: z.string().max(100).optional(),
  voice_id: z.string().max(100).optional(),
  language_code: z.string().max(10).optional(),
});

// ── Image generation request schema ──
export const ImageRequestSchema = z.object({
  positivePrompt: z.string().max(2000).optional(),
  prompt: z.string().max(2000).optional(),
  negativePrompt: z.string().max(1000).optional(),
  width: z.number().int().min(256).max(2048).optional(),
  height: z.number().int().min(256).max(2048).optional(),
  sessionId: z.string().max(100).optional(),
  pageNumber: z.number().int().min(1).max(100).optional(),
  userId: z.string().max(100).optional(),
  characterName: z.string().max(100).optional(),
}).passthrough();

/**
 * Validate request body with a schema. Returns parsed data or throws.
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object instead of throwing.
 */
export function safeValidateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
  return { success: false, error: `Validation failed: ${issues}` };
}
