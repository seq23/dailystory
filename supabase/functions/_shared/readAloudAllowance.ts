/**
 * Read-aloud practice on a free account: READ_ALOUD_FREE_SENTENCES_PER_DAY sentences a
 * day, counted HERE, on the server (supabase/functions/voice-to-text), so clearing the
 * browser or lying about Premium or the count does not reset it. Premium is never counted.
 *
 * The count is public.read_aloud_practice_hit (migration 20261122120000_read_aloud_practice.sql):
 * the account's own LOCAL day (time zone set once from the browser, changed at most every
 * READ_ALOUD_ZONE_CHANGE_DAYS days), a refused clip costs nothing, and it returns the day's
 * used and limit, which the coach shows as they are, and a refusal says which cap it hit
 * (reason "clips" or "sentences", migration 20261122180000_read_aloud_refusal_reason.sql).
 *
 * Outages (owner's reviewer, 22 Nov 2026): when the plan cannot be read the account is
 * treated as free (a paying family gets today's 5, never a 503); only a count that cannot
 * be read refuses, with "try again". Both are reported to cost_tracking, which the post-deploy
 * report turns into a named alert (scripts/tts-usage-alert.mjs).
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

/** A client that lies about its time zone gains at most one shifted day boundary per this many days. */
export const READ_ALOUD_ZONE_CHANGE_DAYS = 30;

export const READ_ALOUD_LIMIT_CODE = "READ_ALOUD_LIMIT_REACHED";
/** One sentence's READ_ALOUD_FREE_CLIPS_PER_SENTENCE clips are used today; other sentences are left. */
export const READ_ALOUD_CLIP_LIMIT_CODE = "READ_ALOUD_CLIP_LIMIT_REACHED";
export const READ_ALOUD_UNAVAILABLE_CODE = "READ_ALOUD_CHECK_UNAVAILABLE";

// The coach shows its own translated copy of these (src/i18n/locales, coach.*); these are
// the server's English, for any other caller.
export const READ_ALOUD_LIMIT_MESSAGE =
  `Today's ${READ_ALOUD_FREE_SENTENCES_PER_DAY} free practice sentences are used up. Come back tomorrow, or Premium has unlimited practice.`;
export const READ_ALOUD_CLIP_LIMIT_MESSAGE =
  "You've practised this sentence lots today! Try another one, or read it again tomorrow.";
export const READ_ALOUD_UNAVAILABLE_MESSAGE =
  "We couldn't check today's practice count. Please try again in a minute.";

/** What voice-to-text reports so a person sees it (cost_tracking operation_type). */
export type ReadAloudIncident = "read_aloud_plan_unknown" | "read_aloud_count_failed";

/** The day's count for one account, as the server holds it. */
export interface PracticeCount { used: number; limit: number }

export interface ReadAloudDeps {
  /** The caller's subscribers row (or null). Throws when it cannot be read. */
  subscriberRow(userId: string): Promise<unknown>;
  /** public.read_aloud_practice_hit. Throws when unreachable. */
  practiceHit(userId: string, sentenceKey: string, timeZone: string | null): Promise<unknown>;
  /** Fire-and-forget report of an outage (never throws). */
  report(incident: ReadAloudIncident, detail: string): void;
}

export type ReadAloudDecision =
  | { allowed: true; practice: PracticeCount | null }
  | { allowed: false; status: 429 | 503; body: { success: false; code: string; error: string; used: number | null; limit: number } };

/** Active subscription or a Premium override. Also used by freeStoryAllowance.ts. */
export function hasPaidAccess(row: any, now = new Date()): boolean {
  if (!row) return false;
  const subscribed = !!row.subscribed && (!row.subscription_end || new Date(row.subscription_end) > now);
  const override = !!row.override_premium && (!row.override_end || new Date(row.override_end) > now);
  return subscribed || override;
}

/** The practice sentence as a short stable key (FNV-1a; a row key, not a secret). */
export function sentenceKey(sentence: unknown): string {
  const text = typeof sentence === "string" ? sentence.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 600) : "";
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return text ? h.toString(36) : "";
}

/** An IANA zone name the browser sent, or null (the database checks it is a real zone). */
export function cleanTimeZone(tz: unknown): string | null {
  return typeof tz === "string" && /^[A-Za-z][A-Za-z0-9_+\-]*(\/[A-Za-z0-9_+\-]+){0,2}$/.test(tz) && tz.length <= 64 ? tz : null;
}

const refuse = (status: 429 | 503, code: string, error: string, used: number | null): ReadAloudDecision => ({
  allowed: false,
  status,
  body: { success: false, code, error, used, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY },
});

/**
 * One practice clip from a signed-in account. Premium (read from the server, never from
 * the request) goes through uncounted. Everyone else, including an account whose plan
 * cannot be read right now, is counted per local day: a new sentence takes one of the
 * day's sentences, later clips of it are capped per sentence. A clip with no sentence
 * counts as a new sentence. When the count cannot be read the clip is refused with
 * "try again", never let through uncounted.
 */
export async function checkReadAloud(userId: string, sentence: unknown, timeZone: unknown, deps: ReadAloudDeps): Promise<ReadAloudDecision> {
  let row: unknown = null;
  try {
    row = await deps.subscriberRow(userId);
  } catch (e) {
    // Plan unknown: count it as free (5 today) rather than refuse a paying family outright.
    deps.report("read_aloud_plan_unknown", (e as Error)?.message ?? String(e));
  }
  if (hasPaidAccess(row)) return { allowed: true, practice: null };

  const key = sentenceKey(sentence) || `clip-${crypto.randomUUID()}`;
  let raw: any;
  try {
    raw = await deps.practiceHit(userId, key, cleanTimeZone(timeZone));
  } catch (e) {
    deps.report("read_aloud_count_failed", (e as Error)?.message ?? String(e));
    return refuse(503, READ_ALOUD_UNAVAILABLE_CODE, READ_ALOUD_UNAVAILABLE_MESSAGE, null);
  }
  const used = Number(raw?.used);
  const limit = Number(raw?.limit);
  if (typeof raw?.allowed !== "boolean" || !Number.isFinite(used) || !Number.isFinite(limit)) {
    // An answer that is not a count is no count: unknown, so refused with "try again".
    deps.report("read_aloud_count_failed", `unreadable answer: ${JSON.stringify(raw)?.slice(0, 120)}`);
    return refuse(503, READ_ALOUD_UNAVAILABLE_CODE, READ_ALOUD_UNAVAILABLE_MESSAGE, null);
  }
  if (raw.allowed) return { allowed: true, practice: { used, limit } };
  // Each cap its own true message (reviewer, 22 Nov 2026: a child out of one sentence's
  // clips was told the day's sentences were used up). Out of clips with sentences left:
  // "try another one". Out of clips with none left: "try another one" would be false, so
  // the day's message, which is then true. A refusal with no known reason is unknown.
  if (raw.reason === "clips" && used < limit) return refuse(429, READ_ALOUD_CLIP_LIMIT_CODE, READ_ALOUD_CLIP_LIMIT_MESSAGE, used);
  if (raw.reason === "clips" || raw.reason === "sentences") return refuse(429, READ_ALOUD_LIMIT_CODE, READ_ALOUD_LIMIT_MESSAGE, used);
  deps.report("read_aloud_count_failed", `refusal with no reason: ${JSON.stringify(raw)?.slice(0, 120)}`);
  return refuse(503, READ_ALOUD_UNAVAILABLE_CODE, READ_ALOUD_UNAVAILABLE_MESSAGE, null);
}
