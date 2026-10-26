// 26 Oct 2026: every live story fell into Backup Mode because OpenAI answered
// 429 "credit_balance_exhausted" and story text had no second provider. This guard
// pins the second provider (the Lovable AI gateway), the dead-key circuit, the
// server-side failure log, and that Backup Mode itself is unchanged.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  chatCompletionWithFallback,
  resetProviderCircuit,
  isDeadKeyRefusal,
  GATEWAY_CHAT_URL,
  GATEWAY_STORY_MODEL,
  OPENAI_CHAT_URL,
  OPENROUTER_CHAT_URL,
  OPENROUTER_FREE_MODELS,
  assertFreeOpenRouterModel,
} from "../../../supabase/functions/_shared/storyTextProvider";
import { parseModelJson, builtInWordEntry, freeDictionaryLookup } from "../../../supabase/functions/_shared/wordFallback";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const NO_CREDIT = JSON.stringify({ error: { type: "insufficient_quota", code: "credit_balance_exhausted", message: "You have no credits remaining." } });
const OK = JSON.stringify({ choices: [{ message: { content: "Max the dog looked up at the moon." } }], usage: { prompt_tokens: 1, completion_tokens: 1 } });
const env = (n: string) => ({ OPENAI_API_KEY: "sk-test", LOVABLE_API_KEY: "lov-test" } as Record<string, string>)[n];
const BODY = { model: "gpt-5-2025-08-07", messages: [{ role: "user", content: "story" }], max_completion_tokens: 800 };

function recorder(answers: Record<string, () => Response>) {
  const calls: { url: string; body: any }[] = [];
  const fetchImpl = async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return answers[url]();
  };
  return { calls, fetchImpl };
}

describe("story text provider", () => {
  beforeEach(() => resetProviderCircuit());

  it("the exact 26 Oct refusal (429 credit_balance_exhausted) is a dead key, a plain 429 is not", () => {
    expect(isDeadKeyRefusal(429, NO_CREDIT)).toBe(true);
    expect(isDeadKeyRefusal(401, "")).toBe(true);
    expect(isDeadKeyRefusal(429, '{"error":{"type":"requests"}}')).toBe(false);
  });

  it("OpenAI out of credit: the same request goes to the gateway and the story comes back", async () => {
    const r = recorder({
      [OPENAI_CHAT_URL]: () => new Response(NO_CREDIT, { status: 429 }),
      [GATEWAY_CHAT_URL]: () => new Response(OK, { status: 200 }),
    });
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env, now: () => 1000 });
    expect(out.response.ok).toBe(true);
    expect(out.provider).toBe("lovable-gateway");
    expect(r.calls.map((c) => c.url)).toEqual([OPENAI_CHAT_URL, GATEWAY_CHAT_URL]);
    expect(r.calls[1].body.model).toBe(GATEWAY_STORY_MODEL);
    expect(r.calls[1].body.max_tokens).toBe(800);
    expect(r.calls[1].body.max_completion_tokens).toBeUndefined();
    expect(r.calls[1].body.messages).toEqual(BODY.messages);
    const data = await out.response.json();
    expect(data.choices[0].message.content).toContain("moon");

    // Next reader within 10 minutes skips the dead provider entirely.
    const r2 = recorder({ [GATEWAY_CHAT_URL]: () => new Response(OK, { status: 200 }) });
    const out2 = await chatCompletionWithFallback(BODY, { fetchImpl: r2.fetchImpl, env, now: () => 2000 });
    expect(out2.response.ok).toBe(true);
    expect(r2.calls.map((c) => c.url)).toEqual([GATEWAY_CHAT_URL]);
  });

  it("OpenAI healthy: the gateway is never called", async () => {
    const r = recorder({ [OPENAI_CHAT_URL]: () => new Response(OK, { status: 200 }), [GATEWAY_CHAT_URL]: () => { throw new Error("must not be called"); } });
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env });
    expect(out.provider).toBe("openai");
    expect(r.calls).toHaveLength(1);
  });

  it("both refuse: a real non-OK response and both attempts recorded for the failure log", async () => {
    const r = recorder({
      [OPENAI_CHAT_URL]: () => new Response(NO_CREDIT, { status: 429 }),
      [GATEWAY_CHAT_URL]: () => new Response("payment required", { status: 402 }),
    });
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env });
    expect(out.response.ok).toBe(false);
    expect(out.attempts.map((a) => [a.provider, a.status])).toEqual([["openai", 429], ["lovable-gateway", 402]]);
  });
});

describe("OpenRouter tier: $0 only", () => {
  beforeEach(() => resetProviderCircuit());
  const envWithOpenRouter = (n: string) => ({ OPENAI_API_KEY: "sk-test", OPENROUTER_API_KEY: "or-test", LOVABLE_API_KEY: "lov-test" } as Record<string, string>)[n];

  it("every model id is :free and equals config/llm_routing.json openrouter_free_tier", () => {
    const cfg = JSON.parse(read("config/llm_routing.json"));
    const lane = cfg.paid_lanes.find((l: { id: string }) => l.id === "product-inference");
    expect(lane.openrouter_free_tier.max_cost_usd).toBe(0);
    expect([...OPENROUTER_FREE_MODELS]).toEqual(lane.openrouter_free_tier.models_in_order);
    expect(OPENROUTER_FREE_MODELS.length).toBeGreaterThanOrEqual(2);
    for (const m of OPENROUTER_FREE_MODELS) expect(m).toMatch(/:free$/);
    expect(() => assertFreeOpenRouterModel("openai/gpt-4o-mini")).toThrow(/not a :free model/);
  });

  it("OpenAI out of credit, first free model rate-limited: the next free model writes it; the gateway is not needed", async () => {
    let orCalls = 0;
    const calls: { url: string; body: any }[] = [];
    const fetchImpl = async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      if (url === OPENAI_CHAT_URL) return new Response(NO_CREDIT, { status: 429 });
      if (url === OPENROUTER_CHAT_URL) return ++orCalls === 1 ? new Response("rate limited", { status: 429 }) : new Response(OK, { status: 200 });
      throw new Error("gateway must not be called");
    };
    const out = await chatCompletionWithFallback(BODY, { fetchImpl, env: envWithOpenRouter });
    expect(out.provider).toBe("openrouter-free");
    expect((await out.response.json()).choices[0].message.content).toContain("moon");
    expect(calls.filter((c) => c.url === OPENROUTER_CHAT_URL).map((c) => c.body.model)).toEqual(OPENROUTER_FREE_MODELS.slice(0, 2));
    for (const c of calls.filter((c) => c.url === OPENROUTER_CHAT_URL)) expect(c.body.model).toMatch(/:free$/);
  });

  it("a 200 with no text from a free model does not count as a story", async () => {
    const fetchImpl = async (url: string) => {
      if (url === OPENAI_CHAT_URL) return new Response(NO_CREDIT, { status: 429 });
      if (url === OPENROUTER_CHAT_URL) return new Response(JSON.stringify({ choices: [{ message: { content: "" } }] }), { status: 200 });
      return new Response(OK, { status: 200 });
    };
    const out = await chatCompletionWithFallback(BODY, { fetchImpl, env: envWithOpenRouter });
    expect(out.provider).toBe("lovable-gateway");
  });

  it("no OPENROUTER_API_KEY: the tier is skipped silently (no call, no error attempt)", async () => {
    const r = recorder({
      [OPENAI_CHAT_URL]: () => new Response(NO_CREDIT, { status: 429 }),
      [GATEWAY_CHAT_URL]: () => new Response(OK, { status: 200 }),
    });
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env });
    expect(r.calls.some((c) => c.url === OPENROUTER_CHAT_URL)).toBe(false);
    expect(out.attempts.some((a) => a.provider === "openrouter-free")).toBe(false);
  });
});

describe("word definitions never say 'Unable to get definition'", () => {
  it("parses fenced JSON from a model", () => {
    expect(parseModelJson<{ word: string }>('```json\n{"word":"moon"}\n```').word).toBe("moon");
  });

  it("the free dictionary answers when every model refuses", async () => {
    const body = [{ word: "confident", phonetic: "/ˈkɒn.fɪ.dənt/", meanings: [{ partOfSpeech: "adjective", definitions: [{ definition: "Sure of yourself." }] }] }];
    const e = await freeDictionaryLookup("confident", async () => new Response(JSON.stringify(body), { status: 200 }));
    expect(e?.definition).toBe("Sure of yourself.");
    expect(await freeDictionaryLookup("zzzz", async () => new Response("{}", { status: 404 }))).toBeNull();
  });

  it("the built-in entry is kind in every language", () => {
    for (const lang of ["en", "es", "fr", "pt", "zh", "hi", "ar", "xx"]) {
      const e = builtInWordEntry("rocket", lang);
      expect(e.definition).toContain("rocket");
      expect(e.definition).not.toMatch(/unable|impossible|no se puede|无法/i);
    }
  });

  it("word-dictionary, translate-universal and correct-spelling go through the provider chain", () => {
    for (const fn of ["word-dictionary", "translate-universal", "correct-spelling"]) {
      const src = read(`supabase/functions/${fn}/index.ts`);
      expect(src, fn).not.toMatch(/api\.openai\.com\/v1\/chat/);
      expect(src, fn).toMatch(/chatCompletionWithFallback\(/);
    }
    const dict = read("supabase/functions/word-dictionary/index.ts");
    expect(dict).not.toMatch(/'Unable to get definition'/);
    expect(dict).toMatch(/freeDictionaryLookup\(/);
    expect(dict).toMatch(/builtInWordEntry\(/);
    expect(read("src/services/CharlotteVoiceService.ts")).not.toMatch(/couldn't find the definition/i);
  });
});

describe("generate-adaptive-story wiring", () => {
  const handler = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");

  it("never calls OpenAI directly: every chat request goes through chatCompletionWithFallback", () => {
    expect(handler).not.toMatch(/api\.openai\.com/);
    expect((handler.match(/chatCompletionWithFallback\(/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it("does not refuse to start when only the gateway key is set", () => {
    expect(handler).toMatch(/if \(!apiKey && !gatewayKey\)/);
  });

  it("writes every failed story to story_generation_failures", () => {
    expect(handler).toMatch(/await logStoryFailure\(\{\s*\n?\s*stage: 'edge'/);
    expect(read("supabase/functions/_shared/storyFailureLog.ts")).toMatch(/rest\/v1\/story_generation_failures/);
    const mig = readdirSync(join(ROOT, "supabase/migrations")).find((f) => f.endsWith("_story_generation_failures.sql"));
    expect(mig).toBeTruthy();
    expect(read(`supabase/migrations/${mig}`)).toMatch(/stage in \('edge', 'client_backup'\)/);
  });
});

describe("Backup Mode stays as designed, and is reported", () => {
  const live = read("src/services/LiveGenerationService.ts");
  const netflix = read("src/services/NetflixStyleStoryService.ts");

  it("still shows pre-written stories with the same notice", () => {
    expect(live).toContain('title: "⚠️ Using Pre-Written Content"');
    expect(live).toMatch(/return this\.generateFallbackFirstPage\(userInfo, difficulty, 'unified_system_error'\)/);
  });

  it("every Backup Mode entry point reports itself", () => {
    expect(live).toMatch(/Using fallback first page[^\n]*\n\s*reportBackupModeUsed\(reason, 1\)/);
    expect(live).toMatch(/Using fallback page \$\{pageNumber\}[^\n]*\n\s*reportBackupModeUsed\(reason, pageNumber\)/);
    expect(netflix).toMatch(/Using fallback story generation[^\n]*\n\s*reportBackupModeUsed\(reason, null\)/);
    expect(read("src/lib/reportStoryFailure.ts")).toMatch(/from\('story_generation_failures'\)/);
  });
});
