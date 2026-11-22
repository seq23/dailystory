// Client mirror of supabase/functions/_shared/freeStoryAllowance.ts.
// The server is the authority (it records each story in app_metadata and
// answers 402 FREE_LIMIT_REACHED); the client reads the same count to show the
// paywall before a story starts.
import type { User } from "@supabase/supabase-js";

export const FREE_STORY_LIMIT = 3;
export const FREE_LIMIT_CODE = "FREE_LIMIT_REACHED";
export const PAYWALL_EVENT = "t2r:free-limit-reached";
export const TRIAL_DAYS = 7;
/**
 * Read-aloud practice (ReadAloudCoach) on a free account: sentences a day. Premium has
 * no daily limit; a signed-out guest gets none (nor voice commands). The /pricing copy
 * and docs/PRICING.md (free_read_aloud_sentences_per_day) say the same number:
 * src/test/guards/pricing-voice-truth.test.tsx and pricing-doc.test.ts.
 */
export const READ_ALOUD_FREE_SENTENCES_PER_DAY = 5;

export const PLAN_PRICES = {
  monthly: { label: "$12.99", period: "/month", amountCents: 1299 },
  annual: { label: "$99", period: "/year", amountCents: 9900 },
} as const;

export const HEYGETONMYLEVEL_URL = "https://heygetonmylevel.com";

export function freeStoriesUsed(user: Pick<User, "app_metadata"> | null | undefined): number {
  const keys = (user?.app_metadata as Record<string, unknown> | undefined)?.free_story_keys;
  return Array.isArray(keys) ? keys.length : 0;
}

/** True when an edge-function error (or its body) is the free-story limit. */
export function isFreeLimitError(error: unknown, data?: unknown): boolean {
  const body = data as { code?: string } | null | undefined;
  if (body?.code === FREE_LIMIT_CODE) return true;
  const err = error as { context?: { status?: number }; message?: string } | null | undefined;
  if (err?.context?.status === 402) return true;
  return typeof err?.message === "string" && err.message.includes(FREE_LIMIT_CODE);
}

export function announceFreeLimitReached(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PAYWALL_EVENT));
}
