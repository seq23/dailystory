// Story text provider with a second provider behind the first (26 Oct 2026).
//
// On 26 Oct 2026 every live story fell into Backup Mode because OpenAI answered
// every call with 429 "credit_balance_exhausted": story text had ONE provider, so
// one empty billing account stopped every new story. Pictures kept working because
// they already went through the Lovable AI gateway.
//
// Now, in order (each tier only when the one before refused or failed):
//   1. OpenAI (OPENAI_API_KEY), the request as the caller wrote it.
//   2. OpenRouter, $0 ONLY (OPENROUTER_API_KEY, a free account's key): the
//      OPENROUTER_FREE_MODELS below, each a ":free" id, tried in turn because free
//      models rate-limit. No key → this tier is skipped silently. The owner's rule
//      (26 Oct 2026, "we can do $0 only") is recorded in config/llm_routing.json
//      paid_lanes[product-inference].openrouter_free_tier, which a guard keeps equal
//      to this list.
//   3. The Lovable AI gateway (LOVABLE_API_KEY), already used by generate-quiz and
//      the image prompts.
// A "no credit" / "bad key" refusal from OpenAI opens a short circuit so the next
// readers skip the dead provider instead of waiting on it. When every tier fails
// the caller falls back to its backup content (Backup Mode, built-in definitions).
//
// Pure apart from the injected fetch/env, so vitest can load it:
// src/test/guards/story-text-provider.test.ts.

export const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
export const GATEWAY_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const GATEWAY_STORY_MODEL = "google/gemini-3-flash-preview";
export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
/** $0 only. Every id must end in ":free"; the call refuses any other. */
export const OPENROUTER_FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
] as const;
/** How long a "no credit" / "bad key" refusal keeps OpenAI skipped. */
export const OPENAI_DEAD_KEY_SKIP_MS = 10 * 60 * 1000;

export interface ProviderAttempt {
  provider: Provider;
  model?: string;
  status: number | null;
  error?: string;
}

export type Provider = "openai" | "openrouter-free" | "lovable-gateway";

export interface ProviderResult {
  response: Response;
  provider: Provider;
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

/** Translate an OpenAI chat body for another OpenAI-compatible provider: its model, plain max_tokens. */
export function toCompatibleBody(apiBody: Record<string, unknown>, model: string): Record<string, unknown> {
  const { model: _model, max_completion_tokens, max_tokens, temperature: _t, ...rest } = apiBody;
  const limit = (max_completion_tokens ?? max_tokens) as number | undefined;
  return {
    ...rest,
    model,
    ...(typeof limit === "number" && Number.isFinite(limit) ? { max_tokens: limit } : {}),
  };
}

/** Translate an OpenAI chat body into the gateway's. */
export function toGatewayBody(apiBody: Record<string, unknown>): Record<string, unknown> {
  return toCompatibleBody(apiBody, GATEWAY_STORY_MODEL);
}

/** $0 rule, enforced in code: a non-":free" OpenRouter id is never sent. */
export function assertFreeOpenRouterModel(model: string): void {
  if (!/:free$/.test(model)) throw new Error(`OpenRouter model ${model} is not a :free model; the product lane is $0 only there`);
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

  // Tier 2: OpenRouter, $0 only. No key = skipped silently.
  const openrouterKey = env("OPENROUTER_API_KEY");
  if (openrouterKey) {
    for (const model of OPENROUTER_FREE_MODELS) {
      assertFreeOpenRouterModel(model);
      try {
        const res = await fetchImpl(OPENROUTER_CHAT_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://time-2-read.com",
            "X-Title": "Time-2-Read",
          },
          body: JSON.stringify(toCompatibleBody(apiBody, model)),
        });
        if (res.ok) {
          // A free model can answer 200 with an error object or no text; only real text counts.
          const text = await res.text();
          let content = "";
          try { content = JSON.parse(text)?.choices?.[0]?.message?.content ?? ""; } catch { /* not JSON */ }
          if (content.trim()) {
            attempts.push({ provider: "openrouter-free", model, status: res.status });
            lastAttempts = attempts;
            return {
              response: new Response(text, { status: 200, headers: { "Content-Type": "application/json" } }),
              provider: "openrouter-free",
              attempts: attempts.slice(),
            };
          }
          attempts.push({ provider: "openrouter-free", model, status: res.status, error: clip("empty answer: " + text) });
          continue;
        }
        const body = await res.text();
        attempts.push({ provider: "openrouter-free", model, status: res.status, error: clip(body) });
        if (res.status === 401 || res.status === 403) break; // bad key: no other free model will help
      } catch (err) {
        attempts.push({ provider: "openrouter-free", model, status: null, error: clip(String(err)) });
      }
    }
  }

  // Tier 3: the Lovable AI gateway.
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
  const summary = attempts.map((a) => `${a.provider}${a.model ? " " + a.model : ""} ${a.status ?? "-"}: ${a.error ?? "ok"}`).join(" | ");
  return {
    response: lastRefusal ?? new Response(summary, { status: 503, statusText: "No story text provider answered" }),
    provider: attempts[attempts.length - 1].provider,
    attempts,
  };
}
