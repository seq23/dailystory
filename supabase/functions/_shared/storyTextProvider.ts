// Product text provider chain: story pages, word definitions, translation,
// spelling (26 Oct 2026, owner's final order).
//
// On 26 Oct 2026 every live story fell into Backup Mode because OpenAI answered
// 429 "credit_balance_exhausted" and story text had one provider. The owner then
// set the order, "I don't wanna pay anything if possible":
//   1. FREE  OpenRouter ":free" models (OPENROUTER_API_KEY), rotated on 429/5xx/
//            timeouts/empty answers; every id must end in ":free".
//   2. FREE  Cloudflare Workers AI free allocation (CLOUDFLARE_ACCOUNT_ID +
//            CLOUDFLARE_WORKERS_AI_TOKEN). Absent → skipped silently.
//   3. PAID  OpenRouter, one cheap model, spending only the account's prepaid
//            credit (no auto top-up), provider data_collection "deny". A 402 (no
//            credit) skips this tier for 10 minutes.
//   4. PAID  OpenAI (OPENAI_API_KEY), last resort.
//   then the caller's backup content (Backup Mode stories, built-in definitions).
// No Gemini anywhere: the Gemini API terms forbid services likely to be used by
// under-18s. The Lovable AI gateway (Gemini models) is therefore not in this chain.
// Every request on tiers 1–3 is de-identified first (./deidentify.ts): the child's
// name never leaves on those routes, and comes back into the text on return.
// The order, models and the per-provider terms check: config/llm_routing.json
// paid_lanes[product-inference].text_chain. Guard: src/test/guards/story-text-provider.test.ts.
import { deidentify, namesFromCharacterInfo } from "./deidentify.ts";
import { stripReasoning } from "./storyOutputCheck.ts";

export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
export const cloudflareChatUrl = (accountId: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;

/** Tier 1, in order. $0 only: every id must end in ":free" (tested once each, 26 Oct 2026). */
export const OPENROUTER_FREE_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
] as const;
/** Tier 2: Meta Llama 3.3 70B on Workers AI (free daily allocation). */
export const CLOUDFLARE_FREE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
/** Tier 3: one cheap paid model on OpenRouter, prepaid credit only. */
export const OPENROUTER_PAID_MODEL = "meta-llama/llama-3.3-70b-instruct";

/** How long a "no credit" / "bad key" refusal keeps a paid provider skipped. */
export const DEAD_KEY_SKIP_MS = 10 * 60 * 1000;
/** Kept for callers and tests that still name it. */
export const OPENAI_DEAD_KEY_SKIP_MS = DEAD_KEY_SKIP_MS;
const FREE_TIMEOUT_MS = 20_000;
/** Free and third-party models get at least this budget, so an answer is never cut off mid-sentence. */
export const MIN_THIRD_PARTY_TOKENS = 800;
/** Sent with every OpenRouter request: no thinking, and none of it in the answer (26 Oct 2026). */
export const OPENROUTER_NO_REASONING = { enabled: false, exclude: true } as const;
const PAID_TIMEOUT_MS = 30_000;
const OPENAI_TIMEOUT_MS = 50_000;

export type Provider = "openrouter-free" | "cloudflare-free" | "openrouter-paid" | "openai";

export interface ProviderAttempt {
  provider: Provider;
  model?: string;
  status: number | null;
  error?: string;
}

export interface ProviderResult {
  response: Response;
  provider: Provider;
  attempts: ProviderAttempt[];
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
type EnvLike = (name: string) => string | undefined;

const skippedUntil: Partial<Record<Provider, number>> = {};
let lastAttempts: ProviderAttempt[] = [];

/** The provider attempts of the most recent call, for failure logging. */
export function lastProviderAttempts(): ProviderAttempt[] {
  return lastAttempts.slice();
}

/** Test hook: forget the circuit state. */
export function resetProviderCircuit(): void {
  for (const k of Object.keys(skippedUntil)) delete skippedUntil[k as Provider];
  lastAttempts = [];
}

/** A refusal that will not fix itself in seconds: no credit, quota, bad or revoked key. */
export function isDeadKeyRefusal(status: number, body: string): boolean {
  if (status === 401 || status === 402 || status === 403) return true;
  return status === 429 && /insufficient_quota|credit_balance_exhausted|billing/i.test(body);
}

/** An OpenAI chat body for another OpenAI-compatible provider: its model, plain max_tokens. */
export function toCompatibleBody(apiBody: Record<string, unknown>, model: string): Record<string, unknown> {
  const { model: _model, max_completion_tokens, max_tokens, temperature: _t, ...rest } = apiBody;
  const limit = (max_completion_tokens ?? max_tokens) as number | undefined;
  return {
    ...rest,
    model,
    ...(typeof limit === "number" && Number.isFinite(limit) ? { max_tokens: limit } : {}),
  };
}

/** $0 rule, enforced in code: a non-":free" id is never sent on the free tier. */
export function assertFreeOpenRouterModel(model: string): void {
  if (!/:free$/.test(model)) throw new Error(`OpenRouter model ${model} is not a :free model; the free tier is $0 only`);
}

/** The request with every child's name replaced, and a function to put them back. */
export function maskBody(apiBody: Record<string, unknown>, extraNames: string[] = []) {
  // deno-lint-ignore no-explicit-any
  const messages = (apiBody.messages as any[]) ?? [];
  const contents = messages.map((m) => (typeof m?.content === "string" ? m.content : ""));
  // Character Info first: it carries the child's gender, which picks a placeholder with the same pronouns.
  const names = [...contents.flatMap(namesFromCharacterInfo), ...extraNames];
  const d = deidentify(contents, names);
  const masked = { ...apiBody, messages: messages.map((m, i) => (typeof m?.content === "string" ? { ...m, content: d.texts[i] } : m)) };
  return { masked, restore: d.restore, pairs: d.pairs };
}

const clip = (s: string) => (s.length > 300 ? s.slice(0, 300) + "…" : s);

/** A chat answer's text (reasoning stripped) and finish reason; "" when there is none. */
function answerOf(text: string): { content: string; finishReason: string | null } {
  try {
    const c = JSON.parse(text)?.choices?.[0];
    return { content: stripReasoning(String(c?.message?.content ?? "")), finishReason: c?.finish_reason ?? null };
  } catch {
    return { content: "", finishReason: null };
  }
}

/** The answer the caller sees: reasoning stripped, names put back, reasoning fields dropped. */
function cleaned(text: string, restore: (s: string) => string): Response {
  let body = text;
  try {
    const data = JSON.parse(text);
    for (const c of data?.choices ?? []) {
      if (c?.message) {
        if (typeof c.message.content === "string") c.message.content = restore(stripReasoning(c.message.content));
        delete c.message.reasoning;
        delete c.message.reasoning_details;
        delete c.message.reasoning_content;
      }
    }
    body = JSON.stringify(data);
  } catch { /* leave as is */ }
  return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
}

/** At least MIN_THIRD_PARTY_TOKENS, so thinking-capable models never stop mid-sentence. */
function withFloor(body: Record<string, unknown>): Record<string, unknown> {
  const n = typeof body.max_tokens === "number" ? body.max_tokens : 0;
  return { ...body, max_tokens: Math.max(n, MIN_THIRD_PARTY_TOKENS) };
}

/**
 * Send one chat-completions request down the chain. Returns the first answer with
 * real text, or the last refusal (so the caller's error handling sees a real status
 * and body, and falls back to its backup content).
 */
export async function chatCompletionWithFallback(
  apiBody: Record<string, unknown>,
  opts: {
    fetchImpl?: FetchLike;
    env?: EnvLike;
    now?: () => number;
    privateNames?: string[];
    /** Why an answer must not be used (null = use it). A rejected answer moves to the next model. See ./storyOutputCheck.ts. */
    accept?: (content: string, finishReason: string | null) => string | null;
  } = {},
): Promise<ProviderResult> {
  const fetchImpl: FetchLike = opts.fetchImpl ?? ((u, i) => fetch(u, i));
  // deno-lint-ignore no-explicit-any
  const env: EnvLike = opts.env ?? ((n) => (globalThis as any).Deno?.env.get(n));
  const now = opts.now ?? Date.now;
  const attempts: ProviderAttempt[] = [];
  let lastRefusal: Response | null = null;
  const { masked, restore } = maskBody(apiBody, opts.privateNames ?? []);
  const accept = opts.accept ?? ((c: string) => (c.trim() ? null : "empty answer"));

  const done = (provider: Provider, model: string | undefined, res: Response, text: string, unmask: boolean): ProviderResult => {
    attempts.push({ provider, model, status: res.status });
    lastAttempts = attempts;
    return { response: cleaned(text, unmask ? restore : (x) => x), provider, attempts: attempts.slice() };
  };

  const tryOnce = async (
    provider: Provider, model: string | undefined, url: string, headers: Record<string, string>, body: unknown, timeoutMs: number,
  ): Promise<{ ok: boolean; res?: Response; status: number | null; text: string }> => {
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      if (res.ok) {
        const { content, finishReason } = answerOf(text);
        const problem = accept(content, finishReason);
        if (!problem) return { ok: true, res, status: res.status, text };
        // Logged with the model, so a model that keeps failing is visible.
        console.warn("🚫 Model answer rejected", { provider, model, problem });
        attempts.push({ provider, model, status: res.status, error: clip(`rejected: ${problem}`) });
        return { ok: false, status: res.status, text };
      }
      attempts.push({ provider, model, status: res.status, error: clip(text) });
      lastRefusal = new Response(text, { status: res.status, statusText: res.statusText });
      return { ok: false, status: res.status, text };
    } catch (err) {
      attempts.push({ provider, model, status: null, error: clip(String(err)) });
      return { ok: false, status: null, text: String(err) };
    }
  };

  // ── Tier 1: OpenRouter :free, rotated. Names masked.
  const openrouterKey = env("OPENROUTER_API_KEY");
  if (openrouterKey) {
    const orHeaders = { Authorization: `Bearer ${openrouterKey}`, "HTTP-Referer": "https://time-2-read.com", "X-Title": "Time-2-Read" };
    for (const model of OPENROUTER_FREE_MODELS) {
      assertFreeOpenRouterModel(model);
      const r = await tryOnce("openrouter-free", model, OPENROUTER_CHAT_URL, orHeaders, { ...withFloor(toCompatibleBody(masked, model)), reasoning: OPENROUTER_NO_REASONING }, FREE_TIMEOUT_MS);
      if (r.ok && r.res) return done("openrouter-free", model, r.res, r.text, true);
      if (!r.ok && r.status === 401) break; // bad key: no other model will help
    }
  }

  // ── Tier 2: Cloudflare Workers AI free allocation. Names masked.
  const cfAccount = env("CLOUDFLARE_ACCOUNT_ID");
  const cfToken = env("CLOUDFLARE_WORKERS_AI_TOKEN");
  if (cfAccount && cfToken) {
    const r = await tryOnce("cloudflare-free", CLOUDFLARE_FREE_MODEL, cloudflareChatUrl(cfAccount), { Authorization: `Bearer ${cfToken}` }, withFloor(toCompatibleBody(masked, CLOUDFLARE_FREE_MODEL)), FREE_TIMEOUT_MS);
    if (r.ok && r.res) return done("cloudflare-free", CLOUDFLARE_FREE_MODEL, r.res, r.text, true);
  }

  // ── Tier 3: OpenRouter paid, prepaid credit only, no training. Names masked.
  if (openrouterKey && now() >= (skippedUntil["openrouter-paid"] ?? 0)) {
    const body = { ...withFloor(toCompatibleBody(masked, OPENROUTER_PAID_MODEL)), reasoning: OPENROUTER_NO_REASONING, provider: { data_collection: "deny" } };
    const r = await tryOnce("openrouter-paid", OPENROUTER_PAID_MODEL, OPENROUTER_CHAT_URL, { Authorization: `Bearer ${openrouterKey}`, "HTTP-Referer": "https://time-2-read.com", "X-Title": "Time-2-Read" }, body, PAID_TIMEOUT_MS);
    if (r.ok && r.res) return done("openrouter-paid", OPENROUTER_PAID_MODEL, r.res, r.text, true);
    if (!r.ok && r.status !== null && isDeadKeyRefusal(r.status, r.text)) skippedUntil["openrouter-paid"] = now() + DEAD_KEY_SKIP_MS;
  }

  // ── Tier 4: OpenAI, last resort (paid). The request as the caller wrote it.
  const openaiKey = env("OPENAI_API_KEY");
  if (openaiKey && now() >= (skippedUntil.openai ?? 0)) {
    const r = await tryOnce("openai", String(apiBody.model ?? ""), OPENAI_CHAT_URL, { Authorization: `Bearer ${openaiKey}` }, apiBody, OPENAI_TIMEOUT_MS);
    if (r.ok && r.res) return done("openai", String(apiBody.model ?? ""), r.res, r.text, false);
    if (!r.ok && r.status !== null && isDeadKeyRefusal(r.status, r.text)) skippedUntil.openai = now() + DEAD_KEY_SKIP_MS;
  } else if (openaiKey) {
    attempts.push({ provider: "openai", status: null, error: "skipped: refused with no credit or a bad key in the last 10 minutes" });
  }

  lastAttempts = attempts;
  const summary = attempts.map((a) => `${a.provider}${a.model ? " " + a.model : ""} ${a.status ?? "-"}: ${a.error ?? "ok"}`).join(" | ");
  return {
    response: lastRefusal ?? new Response(summary || "No text provider is configured", { status: 503, statusText: "No text provider answered" }),
    provider: attempts[attempts.length - 1]?.provider ?? "openai",
    attempts,
  };
}
