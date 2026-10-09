// Client mirror of supabase/functions/_shared/freeStoryAllowance.ts.
// The server is the authority (it records each story in app_metadata and
// answers 402 FREE_LIMIT_REACHED); the client reads the same count to show the
// paywall before a story starts.
import type { User } from "@supabase/supabase-js";

export const FREE_STORY_LIMIT = 3;
export const FREE_LIMIT_CODE = "FREE_LIMIT_REACHED";
export const PAYWALL_EVENT = "t2r:free-limit-reached";
export const TRIAL_DAYS = 7;

export const PLAN_PRICES = {
  monthly: { label: "$9.99", period: "/month", amountCents: 999 },
  annual: { label: "$79", period: "/year", amountCents: 7900 },
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
