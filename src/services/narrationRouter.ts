/**
 * NARRATION ROUTER — the one place that decides which voice reads to the child.
 *
 * - Free and guest readers get the browser voice (speechSynthesis, $0).
 *   The tier is the PAID status (subscribed, or an active override), set by
 *   AuthenticatedApp from useCachedSubscriptionStatus. Signed-in free accounts
 *   are NOT premium here, even though the UI treats every signed-in user as premium.
 * - Premium readers get Charlotte (ElevenLabs). When ElevenLabs refuses for any
 *   reason (out of credits or quota, 401/402/429, timeout, no audio), the premium
 *   audio is stopped and the same text is read ONCE in the browser voice.
 *   Never silence, never two voices at once (docs/AUDIO_SYSTEM_ARCHITECTURE.md).
 * - Every fallback is counted: `getNarrationFallbackCount()`, the
 *   `audio:fallback` window event, and localStorage `t2r_narration_fallbacks`.
 *   The server side logs each refusal as cost_tracking operation_type 'tts_refused'.
 */
import { getTTSProvider, type TTSProvider } from '@/config/ttsConfig';
import { DebugLogger } from '@/services/DebugLogger';

let narrationPremium = false;

export function setNarrationPremium(isPremium: boolean): void {
  narrationPremium = !!isPremium;
}

export function isNarrationPremium(): boolean {
  return narrationPremium;
}

export function currentNarrationProvider(): TTSProvider {
  return getTTSProvider(narrationPremium);
}

const FALLBACK_KEY = 't2r_narration_fallbacks';
let fallbackCount = 0;

export function getNarrationFallbackCount(): number {
  return fallbackCount;
}

export function resetNarrationFallbackCount(): void {
  fallbackCount = 0;
}

function recordFallback(label: string, reason: string): void {
  fallbackCount++;
  DebugLogger.warn('audio', `🔁 Narration fallback to browser voice (${label}): ${reason} [count ${fallbackCount}]`);
  try {
    const prev = Number(localStorage.getItem(FALLBACK_KEY) || '0') || 0;
    localStorage.setItem(FALLBACK_KEY, String(prev + 1));
  } catch { /* storage blocked: the in-memory counter and the event still count it */ }
  try {
    window.dispatchEvent(new CustomEvent('audio:fallback', { detail: { label, reason, count: fallbackCount } }));
  } catch { /* no window (tests without DOM) */ }
}

/** A stop or page change the reader caused: not a refusal, so no fallback. */
export function isUserAbort(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name || '';
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return name === 'AbortError' || /\b(aborted|interrupted|canceled|cancelled)\b/i.test(msg);
}

export class NarrationFailedError extends Error {
  readonly fallbackAttempted = true;
  constructor(readonly premiumError: unknown, readonly browserError: unknown) {
    super(`Narration failed: ElevenLabs refused and the browser voice failed too (${
      browserError instanceof Error ? browserError.message : String(browserError)
    })`);
    this.name = 'NarrationFailedError';
  }
}

export interface NarrateOptions {
  label: string;
  provider: TTSProvider;
  /** Charlotte via ElevenLabs: resolves when playback ends, rejects on refusal. */
  premium: () => Promise<void>;
  /** The free browser voice reading the same text. */
  browser: () => Promise<void>;
  /** Silences the premium audio before the browser voice starts. */
  stopPremium: () => void;
  /** True when the reader has moved on (stop, new page): no fallback then. */
  isCancelled?: () => boolean;
}

export type NarrationOutcome = 'elevenlabs' | 'browser' | 'browser-fallback' | 'cancelled';

export async function narrate(o: NarrateOptions): Promise<NarrationOutcome> {
  if (o.provider === 'browser') {
    await o.browser();
    return 'browser';
  }
  try {
    await o.premium();
    return 'elevenlabs';
  } catch (premiumError) {
    if (isUserAbort(premiumError) || o.isCancelled?.()) {
      return 'cancelled';
    }
    // One voice at a time: silence Charlotte first, then exactly one browser attempt.
    try { o.stopPremium(); } catch { /* already silent */ }
    recordFallback(o.label, premiumError instanceof Error ? premiumError.message : String(premiumError));
    try {
      await o.browser();
      return 'browser-fallback';
    } catch (browserError) {
      throw new NarrationFailedError(premiumError, browserError);
    }
  }
}
