// Story text provider with a second provider behind the first (26 Oct 2026).
//
// On 26 Oct 2026 every live story fell into Backup Mode because OpenAI answered
// every call with 429 "credit_balance_exhausted": story text had ONE provider, so
// one empty billing account stopped every new story. Pictures kept working because
// they already went through the Lovable AI gateway.
//
// Now: OpenAI is tried first; if it refuses (no credit, bad key, rate limit, outage
// or a network error) the same chat request goes to the Lovable AI gateway
// (OpenAI-compatible, LOVABLE_API_KEY, already used by generate-quiz and the image
// prompts). A "no credit" / "bad key" refusal opens a short circuit so the next
// readers skip the dead provider instead of waiting on it.
//
// Pure apart from the injected fetch/env, so vitest can load it:
// src/test/guards/story-text-provider.test.ts.

export const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
export const GATEWAY_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const GATEWAY_STORY_MODEL = "google/gemini-3-flash-preview";
/** How long a "no credit" / "bad key" refusal keeps OpenAI skipped. */
export const OPENAI_DEAD_KEY_SKIP_MS = 10 * 60 * 1000;

export interface ProviderAttempt {
  provider: "openai" | "lovable-gateway";
  status: number | null;
  error?: string;
}

export interface ProviderResult {
  response: Response;
  provider: "openai" | "lovable-gateway";
  attempts: ProviderAttempt[];
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
type EnvLike = (name: string) => string | undefined;

let openaiSkippedUntil = 0;
let lastAttempts: ProviderAttempt[] = [];

/** The provider attempts of the most recent call, for failure logging. */
export function lastProviderAttempts(): ProviderAttempt[] {
  return lastAttempts.slice();
}

/** Test hook: forget the circuit state. */
export function resetProviderCircuit(): void {
  openaiSkippedUntil = 0;
  lastAttempts = [];
}

/** A refusal that will not fix itself in seconds: no credit, quota, bad or revoked key. */
export function isDeadKeyRefusal(status: number, body: string): boolean {
  if (status === 401 || status === 402 || status === 403) return true;
  return status === 429 && /insufficient_quota|credit_balance_exhausted|billing/i.test(body);
}

/** Translate an OpenAI chat body into the gateway's: its model, plain max_tokens. */
export function toGatewayBody(apiBody: Record<string, unknown>): Record<string, unknown> {
  const { model: _model, max_completion_tokens, max_tokens, temperature: _t, ...rest } = apiBody;
  const limit = (max_completion_tokens ?? max_tokens) as number | undefined;
  return {
    ...rest,
    model: GATEWAY_STORY_MODEL,
    ...(typeof limit === "number" && Number.isFinite(limit) ? { max_tokens: limit } : {}),
  };
}

const clip = (s: string) => (s.length > 300 ? s.slice(0, 300) + "…" : s);

/**
 * Send one chat-completions request: OpenAI first, then the Lovable gateway.
 * Returns the first OK response, or the last refusal (so the caller's existing
 * error handling sees a real status and body).
 */
export async function chatCompletionWithFallback(
  apiBody: Record<string, unknown>,
  opts: { fetchImpl?: FetchLike; env?: EnvLike; now?: () => number } = {},
): Promise<ProviderResult> {
  const fetchImpl: FetchLike = opts.fetchImpl ?? ((u, i) => fetch(u, i));
  // deno-lint-ignore no-explicit-any
  const env: EnvLike = opts.env ?? ((n) => (globalThis as any).Deno?.env.get(n));
  const now = opts.now ?? Date.now;
  const attempts: ProviderAttempt[] = [];
  let lastRefusal: Response | null = null;

  const openaiKey = env("OPENAI_API_KEY");
  if (openaiKey && now() >= openaiSkippedUntil) {
    try {
      const res = await fetchImpl(OPENAI_CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });
      if (res.ok) {
        lastAttempts = [{ provider: "openai", status: res.status }];
        return { response: res, provider: "openai", attempts: lastAttempts.slice() };
      }
      const body = await res.text();
      attempts.push({ provider: "openai", status: res.status, error: clip(body) });
      if (isDeadKeyRefusal(res.status, body)) openaiSkippedUntil = now() + OPENAI_DEAD_KEY_SKIP_MS;
      lastRefusal = new Response(body, { status: res.status, statusText: res.statusText });
    } catch (err) {
      attempts.push({ provider: "openai", status: null, error: clip(String(err)) });
    }
  } else {
    attempts.push({
      provider: "openai",
      status: null,
      error: openaiKey ? "skipped: refused with no credit or a bad key in the last 10 minutes" : "OPENAI_API_KEY not set",
    });
  }

  const gatewayKey = env("LOVABLE_API_KEY");
  if (gatewayKey) {
    try {
      const res = await fetchImpl(GATEWAY_CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${gatewayKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(toGatewayBody(apiBody)),
      });
      if (res.ok) {
        attempts.push({ provider: "lovable-gateway", status: res.status });
        lastAttempts = attempts;
        return { response: res, provider: "lovable-gateway", attempts: attempts.slice() };
      }
      const body = await res.text();
      attempts.push({ provider: "lovable-gateway", status: res.status, error: clip(body) });
      lastRefusal = new Response(body, { status: res.status, statusText: res.statusText });
    } catch (err) {
      attempts.push({ provider: "lovable-gateway", status: null, error: clip(String(err)) });
    }
  } else {
    attempts.push({ provider: "lovable-gateway", status: null, error: "LOVABLE_API_KEY not set" });
  }

  lastAttempts = attempts;
  const summary = attempts.map((a) => `${a.provider} ${a.status ?? "-"}: ${a.error ?? "ok"}`).join(" | ");
  return {
    response: lastRefusal ?? new Response(summary, { status: 503, statusText: "No story text provider answered" }),
    provider: attempts[attempts.length - 1].provider,
    attempts,
  };
}
