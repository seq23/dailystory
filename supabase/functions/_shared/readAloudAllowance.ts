/**
 * Read-aloud practice on a free account: READ_ALOUD_FREE_SENTENCES_PER_DAY sentences a
 * day, counted HERE, on the server (supabase/functions/voice-to-text), so clearing the
 * browser or lying about Premium or the count does not reset it. Premium is never counted.
 *
 * The count uses the paid-call counter (public.paid_call_hit, migration
 * 20261103120000_paid_call_rate.sql): fixed UTC-day windows, all-or-nothing, a refused
 * call costs nothing. No new table.
 *
 * Plain TypeScript with no imports, so the edge function and vitest share it.
 * Guard: src/test/guards/read-aloud-server-limit.test.ts.
 */

/** The one number: /pricing, docs/PRICING.md and the coach read it from here. */
export const READ_ALOUD_FREE_SENTENCES_PER_DAY = 5;

/**
 * Clips one practice sentence may use in a day on a free account: the coach allows 3
 * tries of the sentence plus 2 "say it with me" tries for each missed word. A client
 * that labels every clip with the same sentence gets this many, not unlimited.
 */
export const READ_ALOUD_FREE_CLIPS_PER_SENTENCE = 30;

export const READ_ALOUD_LIMIT_CODE = "READ_ALOUD_LIMIT_REACHED";
export const READ_ALOUD_UNAVAILABLE_CODE = "READ_ALOUD_CHECK_UNAVAILABLE";

export const READ_ALOUD_LIMIT_MESSAGE =
  `Today's ${READ_ALOUD_FREE_SENTENCES_PER_DAY} free practice sentences are used up. Come back tomorrow, or Premium has unlimited practice.`;
export const READ_ALOUD_UNAVAILABLE_MESSAGE =
  "We couldn't check today's practice count. Please try again in a minute.";

const DAY = 86_400;

export interface ReadAloudDeps {
  /** The caller's subscribers row (or null). Throws when it cannot be read. */
  subscriberRow(userId: string): Promise<unknown>;
  /** public.paid_call_hit: null = allowed and counted, else the full bucket. Throws when unreachable. */
  hit(buckets: string[], windows: number[], limits: number[]): Promise<string | null>;
}

export type ReadAloudDecision =
  | { allowed: true; reason: "premium" | "new-sentence" | "same-sentence" }
  | { allowed: false; status: 429 | 503; body: { success: false; code: string; error: string; limit: number } };

/** Active subscription or a Premium override. Also used by freeStoryAllowance.ts. */
export function hasPaidAccess(row: any, now = new Date()): boolean {
  if (!row) return false;
  const subscribed = !!row.subscribed && (!row.subscription_end || new Date(row.subscription_end) > now);
  const override = !!row.override_premium && (!row.override_end || new Date(row.override_end) > now);
  return subscribed || override;
}

/** The practice sentence as a short stable key (FNV-1a; a bucket name, not a secret). */
export function sentenceKey(sentence: unknown): string {
  const text = typeof sentence === "string" ? sentence.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 600) : "";
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return text ? h.toString(36) : "";
}

const refuse = (status: 429 | 503, code: string, error: string): ReadAloudDecision => ({
  allowed: false,
  status,
  body: { success: false, code, error, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY },
});

/**
 * One practice clip from a signed-in account. Premium (read from the server, never from
 * the request) goes through uncounted. A free account's first clip of a sentence today
 * uses one of the day's sentences; later clips of it are capped per sentence. A clip
 * with no sentence counts as a new sentence. When the count cannot be read the free
 * account is refused with "try again", never let through uncounted.
 */
export async function checkReadAloud(userId: string, sentence: unknown, deps: ReadAloudDeps): Promise<ReadAloudDecision> {
  let row: unknown;
  try {
    row = await deps.subscriberRow(userId);
  } catch {
    // Premium or not is unknown: refuse with "try again" rather than give unlimited use.
    return refuse(503, READ_ALOUD_UNAVAILABLE_CODE, READ_ALOUD_UNAVAILABLE_MESSAGE);
  }
  if (hasPaidAccess(row)) return { allowed: true, reason: "premium" };

  const key = sentenceKey(sentence) || `clip-${Math.random().toString(36).slice(2)}`;
  const day = `readaloud:user:${userId}:sentences|${DAY}`;
  const seen = `readaloud:user:${userId}:seen:${key}|${DAY}`;
  const clips = `readaloud:user:${userId}:clips:${key}|${DAY}`;
  try {
    // A new sentence marks itself seen and takes one of the day's sentences, both or neither.
    const over = await deps.hit([seen, day], [DAY, DAY], [1, READ_ALOUD_FREE_SENTENCES_PER_DAY]);
    if (over === null) return { allowed: true, reason: "new-sentence" };
    if (over === day) return refuse(429, READ_ALOUD_LIMIT_CODE, READ_ALOUD_LIMIT_MESSAGE);
    // Already counted today: another try of the same sentence, within its clip cap.
    const clipOver = await deps.hit([clips], [DAY], [READ_ALOUD_FREE_CLIPS_PER_SENTENCE]);
    return clipOver === null ? { allowed: true, reason: "same-sentence" } : refuse(429, READ_ALOUD_LIMIT_CODE, READ_ALOUD_LIMIT_MESSAGE);
  } catch {
    return refuse(503, READ_ALOUD_UNAVAILABLE_CODE, READ_ALOUD_UNAVAILABLE_MESSAGE);
  }
}
