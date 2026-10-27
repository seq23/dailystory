// 26 Oct 2026: every live story fell into Backup Mode because OpenAI answered 429
// "credit_balance_exhausted" and story text had one provider. The owner's final
// order: OpenRouter :free (rotated) → Workers AI free → OpenRouter paid (prepaid
// credit only) → OpenAI → backup content. No Gemini (its API terms forbid services
// used by under-18s). A child's name never leaves on the free/third-party routes.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  chatCompletionWithFallback,
  resetProviderCircuit,
  isDeadKeyRefusal,
  assertFreeOpenRouterModel,
  OPENAI_CHAT_URL,
  OPENROUTER_CHAT_URL,
  OPENROUTER_FREE_MODELS,
  OPENROUTER_PAID_MODEL,
  CLOUDFLARE_FREE_MODEL,
  cloudflareChatUrl,
} from "../../../supabase/functions/_shared/storyTextProvider";
import { deidentify, namesFromCharacterInfo, genderOf } from "../../../supabase/functions/_shared/deidentify";
import { storyTextProblem, stripReasoning, jsonAnswerProblem } from "../../../supabase/functions/_shared/storyOutputCheck";
import { MIN_THIRD_PARTY_TOKENS } from "../../../supabase/functions/_shared/storyTextProvider";
import { parseModelJson, builtInWordEntry, freeDictionaryLookup } from "../../../supabase/functions/_shared/wordFallback";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const NO_CREDIT = JSON.stringify({ error: { type: "insufficient_quota", code: "credit_balance_exhausted", message: "You have no credits remaining." } });
const answer = (text: string) => JSON.stringify({ choices: [{ message: { content: text } }], usage: { prompt_tokens: 1, completion_tokens: 1 } });
const OK = answer("Kiki the dog looked up at the moon.");
const ALL_KEYS: Record<string, string> = { OPENROUTER_API_KEY: "or-test", CLOUDFLARE_ACCOUNT_ID: "acc", CLOUDFLARE_WORKERS_AI_TOKEN: "cf-test", OPENAI_API_KEY: "sk-test" };
const envOf = (keys: Record<string, string>) => (n: string) => keys[n];
const STORY_PROMPT = 'Create a never-ending story for Aiden, age 7. Theme: space.\nCharacter Info: {"name":"Aiden","age":7}';
const BODY = { model: "gpt-5-2025-08-07", messages: [{ role: "system", content: "You write for children." }, { role: "user", content: STORY_PROMPT }], max_completion_tokens: 800 };
const CF_URL = cloudflareChatUrl("acc");

type Call = { url: string; body: any };
function scripted(answers: (url: string, body: any, n: number) => Response) {
  const calls: Call[] = [];
  const fetchImpl = async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    calls.push({ url, body });
    return answers(url, body, calls.length);
  };
  return { calls, fetchImpl };
}

describe("the chain: free first, paid last", () => {
  beforeEach(() => resetProviderCircuit());

  it("the order is OpenRouter :free (each model) → Workers AI → OpenRouter paid → OpenAI", async () => {
    const r = scripted(() => new Response("busy", { status: 429 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS) });
    expect(out.response.ok).toBe(false);
    expect(r.calls.map((c) => (c.url === CF_URL ? "cf" : c.url === OPENAI_CHAT_URL ? "openai" : c.body.model))).toEqual([
      ...OPENROUTER_FREE_MODELS, "cf", OPENROUTER_PAID_MODEL, "openai",
    ]);
  });

  it("the first free model that answers writes the story; nothing paid is called", async () => {
    const r = scripted((url, _b, n) => (n === 1 ? new Response("rate limited", { status: 429 }) : new Response(OK, { status: 200 })));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS) });
    expect(out.provider).toBe("openrouter-free");
    expect(r.calls.map((c) => c.body.model)).toEqual(OPENROUTER_FREE_MODELS.slice(0, 2));
    expect(r.calls.every((c) => c.url === OPENROUTER_CHAT_URL && /:free$/.test(c.body.model))).toBe(true);
  });

  it("a 200 with no text does not count", async () => {
    const r = scripted((url) => (url === OPENROUTER_CHAT_URL ? new Response(answer(""), { status: 200 }) : new Response(OK, { status: 200 })));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS) });
    expect(out.provider).toBe("cloudflare-free");
  });

  it("missing keys skip their tiers silently; OpenAI alone still works", async () => {
    const r = scripted(() => new Response(OK, { status: 200 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf({ OPENAI_API_KEY: "sk-test" }) });
    expect(out.provider).toBe("openai");
    expect(r.calls.map((c) => c.url)).toEqual([OPENAI_CHAT_URL]);
    expect(out.attempts.map((a) => a.provider)).toEqual(["openai"]);
  });

  it("paid OpenRouter asks for no data collection and stops for 10 minutes on 402 (prepaid credit gone)", async () => {
    const keys = { OPENROUTER_API_KEY: "or-test", OPENAI_API_KEY: "sk-test" };
    const r = scripted((url, body) =>
      url === OPENAI_CHAT_URL ? new Response(OK, { status: 200 })
      : body.model === OPENROUTER_PAID_MODEL ? new Response("Insufficient credits", { status: 402 })
      : new Response("busy", { status: 429 }));
    await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(keys), now: () => 1000 });
    const paid = r.calls.find((c) => c.body.model === OPENROUTER_PAID_MODEL)!;
    expect(paid.body.provider).toEqual({ data_collection: "deny" });
    const r2 = scripted((url) => (url === OPENAI_CHAT_URL ? new Response(OK, { status: 200 }) : new Response("busy", { status: 429 })));
    await chatCompletionWithFallback(BODY, { fetchImpl: r2.fetchImpl, env: envOf(keys), now: () => 2000 });
    expect(r2.calls.some((c) => c.body.model === OPENROUTER_PAID_MODEL)).toBe(false);
  });

  it("the 26 Oct refusal (429 credit_balance_exhausted) is a dead key; a plain 429 is not", () => {
    expect(isDeadKeyRefusal(429, NO_CREDIT)).toBe(true);
    expect(isDeadKeyRefusal(402, "")).toBe(true);
    expect(isDeadKeyRefusal(429, '{"error":{"type":"requests"}}')).toBe(false);
  });

  it("no Gemini and no Lovable gateway in the text chain", () => {
    const src = read("supabase/functions/_shared/storyTextProvider.ts");
    expect(src).not.toMatch(/generativelanguage\.googleapis|ai\.gateway\.lovable|"google\/gemini/);
  });
});

// The exact text a child saw as page 1 on 26 Oct 2026 (a free reasoning model's planning).
const LIVE_BAD_PAGE = "Let me analyze the requirements carefully: Continuous narrative with";
const GOOD_PAGE = "Aiden found a big green egg in the sand. It wiggled and cracked open. A tiny dinosaur blinked up at him and said, \"Rawr!\" Aiden laughed and gave it a gentle pat.";

describe("only real story text reaches a page", () => {
  beforeEach(() => resetProviderCircuit());

  it("the live 26 Oct planning text is rejected; a real page passes", () => {
    expect(storyTextProblem(LIVE_BAD_PAGE, "stop")).toMatch(/planning text/);
    expect(storyTextProblem(GOOD_PAGE, "stop")).toBeNull();
  });

  it("rejects truncation, too-short text, markdown, JSON, and meta talk anywhere", () => {
    expect(storyTextProblem(GOOD_PAGE, "length")).toMatch(/truncated/);
    expect(storyTextProblem("Aiden found a big green egg in the sand and it", "stop")).toMatch(/cut off/);
    expect(storyTextProblem("Aiden ran.", "stop")).toMatch(/too short/);
    expect(storyTextProblem("# Page 1\n" + GOOD_PAGE, "stop")).toMatch(/markdown/);
    expect(storyTextProblem('{"page":"' + GOOD_PAGE + '"}', "stop")).toMatch(/JSON/);
    expect(storyTextProblem("Here is the story: " + GOOD_PAGE, "stop")).toMatch(/planning/);
    expect(storyTextProblem(GOOD_PAGE + " As an AI, I hope you liked it.", "stop")).toMatch(/planning/);
  });

  it("strips <think> blocks, closed or not", () => {
    expect(stripReasoning("<think>plan the plot</think>" + GOOD_PAGE)).toBe(GOOD_PAGE);
    expect(stripReasoning(GOOD_PAGE + "<think>more planning")).toBe(GOOD_PAGE);
    expect(storyTextProblem("<think>Let me analyze</think>" + GOOD_PAGE, "stop")).toBeNull();
  });

  it("a rejected answer moves the chain to the next model, and the page gets the real story", async () => {
    const r = scripted((_u, _b, n) => new Response(answer(n === 1 ? LIVE_BAD_PAGE : GOOD_PAGE.replace(/Aiden/g, "Kiki")), { status: 200 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS), accept: (t, f) => storyTextProblem(t, f) });
    expect(r.calls.map((c) => c.body.model)).toEqual(OPENROUTER_FREE_MODELS.slice(0, 2));
    expect(out.attempts[0].error).toMatch(/rejected: planning text/);
    expect((await out.response.json()).choices[0].message.content).toBe(GOOD_PAGE);
  });

  it("when every model writes planning text, nothing is served (the caller falls back to Backup Mode)", async () => {
    const r = scripted(() => new Response(answer(LIVE_BAD_PAGE), { status: 200 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS), accept: (t, f) => storyTextProblem(t, f) });
    expect(out.response.ok).toBe(false);
    expect(out.attempts.every((a) => /rejected/.test(a.error ?? ""))).toBe(true);
  });

  it("OpenRouter is asked for no reasoning and a budget that cannot cut a page off; reasoning fields never reach the caller", async () => {
    const withReasoning = JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: GOOD_PAGE, reasoning: "Let me analyze" } }] });
    const r = scripted(() => new Response(withReasoning, { status: 200 }));
    const out = await chatCompletionWithFallback({ ...BODY, max_completion_tokens: 150 }, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS) });
    expect(r.calls[0].body.reasoning).toEqual({ enabled: false, exclude: true });
    expect(r.calls[0].body.max_tokens).toBeGreaterThanOrEqual(MIN_THIRD_PARTY_TOKENS);
    expect((await out.response.json()).choices[0].message.reasoning).toBeUndefined();
  });

  it("every caller checks its answers", () => {
    const handler = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    // The story call (whole story: a budget cut keeps its complete pages, guest-story-path.test.ts)
    // and the re-injection call both check every answer.
    expect(handler).toMatch(/accept: \(text, finishReason\) => isWholeStory \? wholeStoryTextProblem\(text, finishReason\) : storyTextProblem\(text, finishReason\),/);
    expect((handler.match(/accept: \(text, finishReason\) => storyTextProblem\(text, finishReason\)/g) || []).length).toBe(1);
    expect(handler).toMatch(/errorType: 'output_rejected'/);
    // Every successful story says which tier and model wrote it.
    expect((handler.match(/servedBy: servedBy\(\),/g) || []).length).toBe(3);
    expect(read("supabase/functions/word-dictionary/index.ts")).toMatch(/accept: jsonAnswerProblem\('definition'\)/);
    for (const fn of ["translate-universal", "correct-spelling"]) expect(read(`supabase/functions/${fn}/index.ts`), fn).toMatch(/accept: plainAnswerProblem/);
    expect(jsonAnswerProblem("definition")('{"definition":"Sure of yourself."}', "stop")).toBeNull();
    expect(jsonAnswerProblem("definition")(LIVE_BAD_PAGE, "stop")).toBe("not JSON");
  });
});

describe("a child's name never leaves on the free or third-party routes", () => {
  beforeEach(() => resetProviderCircuit());

  it("the outgoing body to every non-OpenAI tier contains no real name; the returned text has it back", async () => {
    const r = scripted((url) => (url === OPENAI_CHAT_URL ? new Response(OK, { status: 200 }) : new Response("busy", { status: 429 })));
    await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS), privateNames: ["Aiden"] });
    const thirdParty = r.calls.filter((c) => c.url !== OPENAI_CHAT_URL);
    expect(thirdParty.length).toBe(OPENROUTER_FREE_MODELS.length + 2);
    for (const c of thirdParty) {
      expect(JSON.stringify(c.body)).not.toMatch(/aiden/i);
      expect(JSON.stringify(c.body)).toContain("Kiki");
    }
    resetProviderCircuit();
    const r2 = scripted(() => new Response(answer("Kiki and Kiki's dog flew to the moon."), { status: 200 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r2.fetchImpl, env: envOf(ALL_KEYS) });
    expect(JSON.stringify(r2.calls[0].body)).not.toMatch(/aiden/i); // name found in Character Info without being passed
    expect((await out.response.json()).choices[0].message.content).toBe("Aiden and Aiden's dog flew to the moon.");
  });

  it("a placeholder already in the text is not reused, and multi-word names are hidden whole and in part", () => {
    const d = deidentify(["Kiki met Mary Jane. Mary waved.", 'Character Info: {"name":"Mary Jane"}'], ["Mary Jane"]);
    expect(d.texts.join(" ")).not.toMatch(/Mary|Jane/);
    expect(d.texts[0]).toMatch(/^Kiki met Momo\. Momo waved\.$/);
    expect(d.restore("Momo smiled.")).toBe("Mary Jane smiled.");
  });

  it("the placeholder keeps the child's pronouns (live 26 Oct: 'Kiki' made Aiden 'she')", () => {
    const boy = deidentify(['Story for Aiden.\nCharacter Info: {"name":"Aiden","avatarType":"boy"}'], namesFromCharacterInfo('Character Info: {"name":"Aiden","avatarType":"boy"}'));
    expect(boy.pairs).toEqual([["Milo", "Aiden"]]);
    const girl = deidentify(["Story for Zara."], [{ name: "Zara", gender: "girl" }]);
    expect(girl.pairs[0][0]).toBe("Lulu");
    const unknown = deidentify(["Story for Sam."], ["Sam"]);
    expect(unknown.pairs[0][0]).toBe("Kiki");
    expect(genderOf("prefer-not-to-answer")).toBe("neutral");
  });

  it("a boy's Character Info sends a boy's placeholder on the free route", async () => {
    resetProviderCircuit();
    const boyBody = { ...BODY, messages: [{ role: "user", content: 'Story for Aiden.\nCharacter Info: {"name":"Aiden","avatarType":"boy"}' }] };
    const r = scripted(() => new Response(answer("Milo saw his dog. He smiled."), { status: 200 }));
    const out = await chatCompletionWithFallback(boyBody, { fetchImpl: r.fetchImpl, env: envOf(ALL_KEYS), privateNames: ["Aiden"] });
    expect(JSON.stringify(r.calls[0].body)).toContain("Milo");
    expect(JSON.stringify(r.calls[0].body)).not.toMatch(/aiden|kiki/i);
    expect((await out.response.json()).choices[0].message.content).toBe("Aiden saw his dog. He smiled.");
  });

  it("word parts are not touched: 'Max' is hidden, 'maximum' is not", () => {
    const d = deidentify(["Max saw the maximum number."], ["Max"]);
    expect(d.texts[0]).toBe("Kiki saw the maximum number.");
  });
});

describe("free models: $0 only, recorded in config", () => {
  it("every free id is :free, equals config/llm_routing.json, and the chain is recorded with a terms check per provider", () => {
    const cfg = JSON.parse(read("config/llm_routing.json"));
    const lane = cfg.paid_lanes.find((l: { id: string }) => l.id === "product-inference");
    const chain = lane.text_chain;
    expect(chain.order.map((t: { tier: string }) => t.tier)).toEqual(["openrouter-free", "cloudflare-free", "openrouter-paid", "openai", "backup-content"]);
    expect(chain.order[0].models).toEqual([...OPENROUTER_FREE_MODELS]);
    expect(chain.order[0].max_cost_usd).toBe(0);
    expect(chain.order[1].models).toEqual([CLOUDFLARE_FREE_MODEL]);
    expect(chain.order[2].models).toEqual([OPENROUTER_PAID_MODEL]);
    for (const t of chain.order.slice(0, 4)) expect(String(t.terms_check ?? "").length, t.tier).toBeGreaterThan(60);
    expect(chain.excluded.map((e: { provider: string }) => e.provider)).toEqual(expect.arrayContaining(["Google Gemini API", "Lovable AI gateway"]));
    for (const m of OPENROUTER_FREE_MODELS) expect(m).toMatch(/:free$/);
    expect(() => assertFreeOpenRouterModel("openai/gpt-4o-mini")).toThrow(/not a :free model/);
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

  it("starts when any one provider of the chain has a key, and passes the child's name for masking", () => {
    expect(handler).toMatch(/\['OPENROUTER_API_KEY', 'CLOUDFLARE_WORKERS_AI_TOKEN', 'OPENAI_API_KEY'\]\.some/);
    expect(handler).toMatch(/chatCompletionWithFallback\(apiBody, \{\s*privateNames: \[userInfo\?\.name/);
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
