// Phase 8 (approved 26 Oct 2026, built 31 Oct 2026): a school child's text goes only to AI
// routes that neither train on nor keep it, enforced in the router before any request
// exists, failing closed to backup content. Family routing is unchanged.
// Router: supabase/functions/_shared/storyTextProvider.ts. Lane: _shared/privacyLane.ts.
// Policy and reasons: config/product_inference.json text_chain.school_lane.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  chatCompletionWithFallback,
  resetProviderCircuit,
  assertSchoolSafeRequest,
  SCHOOL_SAFE_PROVIDERS,
  OPENAI_CHAT_URL,
  OPENROUTER_CHAT_URL,
  OPENROUTER_FREE_MODELS,
  OPENROUTER_PAID_MODEL,
  cloudflareChatUrl,
} from "../../../supabase/functions/_shared/storyTextProvider";
import {
  resolvePrivacyLane,
  withPrivacyLane,
  childProfileIdOf,
} from "../../../supabase/functions/_shared/privacyLane";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const ALL_KEYS: Record<string, string> = { OPENROUTER_API_KEY: "or-test", CLOUDFLARE_ACCOUNT_ID: "acc", CLOUDFLARE_WORKERS_AI_TOKEN: "cf-test", OPENAI_API_KEY: "sk-test" };
const env = (n: string) => ALL_KEYS[n];
const CF_URL = cloudflareChatUrl("acc");
const BODY = {
  model: "gpt-5-2025-08-07",
  messages: [{ role: "system", content: "You write for children." }, { role: "user", content: 'A story for Aiden, age 7.\nCharacter Info: {"name":"Aiden","age":7}' }],
  max_completion_tokens: 800,
};
const answer = (text: string) => JSON.stringify({ choices: [{ message: { content: text } }] });

type Call = { url: string; body: any };
function recorder(reply: (url: string, body: any) => Response) {
  const calls: Call[] = [];
  return {
    calls,
    fetchImpl: async (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      calls.push({ url, body });
      return reply(url, body);
    },
  };
}
/** A route that may train on or keep a child's text. */
const isTrainingRoute = (c: Call) =>
  /:free$/.test(String(c.body.model)) ||
  (c.url === OPENROUTER_CHAT_URL && !(c.body.provider?.zdr === true && c.body.provider?.data_collection === "deny"));

describe("school lane: a school child's request never reaches a training route", () => {
  beforeEach(() => resetProviderCircuit());

  it("every provider failing: only school-safe routes were tried, then the caller's backup content", async () => {
    const r = recorder(() => new Response("busy", { status: 503 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env, lane: "school" });
    expect(out.response.ok).toBe(false); // the caller serves Backup Mode / the story-text quiz
    expect(out.lane).toBe("school");
    expect(r.calls.map((c) => c.url)).toEqual([CF_URL, OPENROUTER_CHAT_URL, OPENAI_CHAT_URL]);
    expect(r.calls.filter(isTrainingRoute)).toEqual([]);
    expect(r.calls.some((c) => OPENROUTER_FREE_MODELS.includes(c.body.model))).toBe(false);
    const paid = r.calls.find((c) => c.url === OPENROUTER_CHAT_URL)!;
    expect(paid.body.model).toBe(OPENROUTER_PAID_MODEL);
    expect(paid.body.provider).toEqual({ data_collection: "deny", zdr: true });
    // The child's name leaves on no route, OpenAI included.
    expect(r.calls.every((c) => !JSON.stringify(c.body).includes("Aiden"))).toBe(true);
    expect(out.attempts[0]).toMatchObject({ provider: "openrouter-free", status: null });
    expect(out.attempts[0].error).toMatch(/school lane/);
  });

  it("the lane set for the request reaches calls deep inside the handler, across awaits and timers", async () => {
    const r = recorder(() => new Response("busy", { status: 429 }));
    await withPrivacyLane("school", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      await Promise.resolve().then(() => chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env }));
    });
    expect(r.calls.length).toBeGreaterThan(0);
    expect(r.calls.filter(isTrainingRoute)).toEqual([]);
  });

  it("an answer from a school-safe route has the names put back", async () => {
    const r = recorder((url) => (url === OPENAI_CHAT_URL ? new Response(answer("Kiki flew to the moon."), { status: 200 }) : new Response("no", { status: 500 })));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env, lane: "school" });
    expect(out.provider).toBe("openai");
    expect((await out.response.json()).choices[0].message.content).toBe("Aiden flew to the moon.");
  });

  it("the door refuses anything that is not a school-safe request, before it exists", () => {
    expect([...SCHOOL_SAFE_PROVIDERS]).toEqual(["cloudflare-free", "openrouter-paid", "openai"]);
    expect(() => assertSchoolSafeRequest("openrouter-free", OPENROUTER_CHAT_URL, { model: OPENROUTER_FREE_MODELS[0] })).toThrow(/school lane/);
    expect(() => assertSchoolSafeRequest("openrouter-paid", OPENROUTER_CHAT_URL, { model: OPENROUTER_PAID_MODEL, provider: { data_collection: "deny" } })).toThrow(/zdr/);
    expect(() => assertSchoolSafeRequest("openrouter-paid", OPENROUTER_CHAT_URL, { model: OPENROUTER_PAID_MODEL, provider: { zdr: true } })).toThrow(/data_collection/);
    expect(() => assertSchoolSafeRequest("openrouter-paid", OPENROUTER_CHAT_URL, { model: "x/y:free", provider: { zdr: true, data_collection: "deny" } })).toThrow(/free route/);
    expect(() => assertSchoolSafeRequest("openai", "https://example.test/v1/chat/completions", { model: "gpt-4o-mini" })).toThrow(/another host/);
    expect(() => assertSchoolSafeRequest("cloudflare-free", "https://gateway.ai.cloudflare.com/v1/acc/g/workers-ai/v1/chat/completions", { model: "m" })).toThrow(/directly/);
    expect(() => assertSchoolSafeRequest("openrouter-paid", OPENROUTER_CHAT_URL, { model: OPENROUTER_PAID_MODEL, provider: { zdr: true, data_collection: "deny" } })).not.toThrow();
    expect(() => assertSchoolSafeRequest("cloudflare-free", CF_URL, { model: "m" })).not.toThrow();
  });

  it("family routing is unchanged: free models first, no zdr flag", async () => {
    const r = recorder(() => new Response("busy", { status: 429 }));
    const out = await chatCompletionWithFallback(BODY, { fetchImpl: r.fetchImpl, env });
    expect(out.lane).toBe("family");
    expect(r.calls[0].body.model).toBe(OPENROUTER_FREE_MODELS[0]);
    expect(r.calls.find((c) => c.body.model === OPENROUTER_PAID_MODEL)!.body.provider).toEqual({ data_collection: "deny" });
  });
});

describe("which requests are school requests (decided by the database, failing closed)", () => {
  const anonJwt = `x.${btoa(JSON.stringify({ role: "anon" }))}.y`;
  const userJwt = `x.${btoa(JSON.stringify({ role: "authenticated", sub: "u" }))}.y`;
  const deps = (lane: string | Error, verify: string | Error = "u") => ({
    verifyUser: async () => { if (verify instanceof Error) throw verify; return verify; },
    laneOf: async () => { if (lane instanceof Error) throw lane; return lane; },
  });

  it("guests are family; a named child profile without a verifiable account is school", async () => {
    expect(await resolvePrivacyLane(null, null, deps("school"))).toBe("family");
    expect(await resolvePrivacyLane(`Bearer ${anonJwt}`, null, deps("school"))).toBe("family");
    expect(await resolvePrivacyLane(`Bearer ${anonJwt}`, "00000000-0000-4000-8000-000000000001", deps("family"))).toBe("school");
  });
  it("a signed-in account follows the database, and any failure is school", async () => {
    expect(await resolvePrivacyLane(`Bearer ${userJwt}`, null, deps("family"))).toBe("family");
    expect(await resolvePrivacyLane(`Bearer ${userJwt}`, null, deps("school"))).toBe("school");
    expect(await resolvePrivacyLane(`Bearer ${userJwt}`, null, deps("something else"))).toBe("school");
    expect(await resolvePrivacyLane(`Bearer ${userJwt}`, null, deps(new Error("rpc down")))).toBe("school");
    expect(await resolvePrivacyLane(`Bearer ${userJwt}`, null, deps("family", new Error("bad token")))).toBe("school");
  });
  it("only a real UUID is taken from a request body as a child profile id", () => {
    expect(childProfileIdOf({ userInfo: { childId: "00000000-0000-4000-8000-000000000001" } })).toBe("00000000-0000-4000-8000-000000000001");
    expect(childProfileIdOf({ config: { userInfo: { childProfileId: "00000000-0000-4000-8000-000000000002" } } })).toBe("00000000-0000-4000-8000-000000000002");
    expect(childProfileIdOf({ childId: "not-a-uuid" })).toBeNull();
  });
});

describe("wiring: every child-text function resolves the lane, images are off for schools", () => {
  it.each([
    "supabase/functions/generate-adaptive-story/index.ts",
    "supabase/functions/generate-quiz/index.ts",
    "supabase/functions/word-dictionary/index.ts",
    "supabase/functions/translate-universal/index.ts",
    "supabase/functions/correct-spelling/index.ts",
  ])("%s decides the lane from the request and routes on it", (file) => {
    const src = read(file);
    expect(src).toMatch(/privacyLaneForRequest\(req, /);
    expect(src).toMatch(/withPrivacyLane\(lane, |\blane\b[,}]|lane: await privacyLaneForRequest/);
  });
  it("the story handler runs inside the lane", () => {
    expect(read("supabase/functions/generate-adaptive-story/index.ts")).toContain("withPrivacyLane(lane, () => handleStreamlinedGeneration(requestBody))");
  });
  it("runware-generate-image refuses school requests before any prompt is built or sent", () => {
    const src = read("supabase/functions/runware-generate-image/index.ts");
    const gate = src.indexOf("=== 'school'");
    expect(gate).toBeGreaterThan(0);
    expect(gate).toBeLessThan(src.indexOf("await buildImagePrompt("));
    expect(gate).toBeLessThan(src.indexOf("await callRunware("));
  });
  it("the recorded policy names the same routes, the exclusions and the image decision", () => {
    const cfg = JSON.parse(read("config/product_inference.json"));
    const school = cfg.paid_lanes[0].text_chain.school_lane;
    expect(school.allowed.map((a: any) => a.tier)).toEqual([...SCHOOL_SAFE_PROVIDERS]);
    expect(school.excluded.map((e: any) => e.tier)).toContain("openrouter-free");
    expect(school.images.decision).toMatch(/off/i);
    expect(school.fail_closed).toMatch(/backup/i);
  });
  it("the lane RPC is callable by the service role only", () => {
    const sql = read("supabase/migrations/20261031210000_institution_app_reading.sql");
    expect(sql).toContain("revoke all on function public.institution_ai_lane(uuid, uuid) from public, anon, authenticated;");
    expect(sql).toContain("grant execute on function public.institution_ai_lane(uuid, uuid) to service_role;");
  });
});
