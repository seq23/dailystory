// R-KID-01 on the real path (22 Nov 2026): each AI function, run as deployed
// (supabase/functions/<fn>/index.ts through ./harness.ts).
//  - A call that may carry a child's name (spelling, translation, definitions) reaches only
//    routes that neither train on nor keep text: Workers AI called directly, OpenRouter paid
//    with no collection and zero retention, or the OpenAI API. Never an OpenRouter :free
//    model, never an unknown host. Fixed by routing, not by masking (her ruling, 22 Nov 2026).
//  - Only the story chain opts in to the free tier, with the reader's name masked as before.
//  - No function writes a child's name to its logs.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { edgeState } from "./state";
import { ENV, isAiUrl, runFunction, tokenFor, type AiMode, type Outbound, type Run } from "./harness";
import { issueGuestPass } from "../../../supabase/functions/_shared/paidCallGuard";

const CHILD = "Zephyrine";
const SIBLING = "Quillon";
const NAMES = [CHILD, SIBLING];
const USER_TOKEN = tokenFor("authenticated", "user-1");

beforeEach(() => {
  const s = edgeState();
  s.env = { ...ENV };
  s.userIdFor = (t) => (t === USER_TOKEN ? "user-1" : null);
  s.rpc = { paid_call_hit: null, institution_ai_lane: "family" };
  s.tables = { subscribers: [{ subscribed: true, subscription_end: "2999-01-01T00:00:00Z" }] };
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const post = (fn: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://project.supabase.test/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${USER_TOKEN}`, ...headers },
    body: JSON.stringify(body),
  });

const CF_DIRECT = /^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/[^/]+\/ai\/v1\/chat\/completions$/;
/** Why this model call is not a safe route for a child's name (null = safe). */
function unsafeRoute(o: Outbound): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = {};
  try { body = JSON.parse(o.body); } catch { return `unreadable body to ${o.url}`; }
  if (/:free$/.test(String(body.model ?? ""))) return `free model ${body.model}`;
  if (CF_DIRECT.test(o.url)) return null;
  if (o.url === "https://api.openai.com/v1/chat/completions") return null;
  if (o.url === "https://openrouter.ai/api/v1/chat/completions") {
    return body.provider?.zdr === true && body.provider?.data_collection === "deny" ? null : "OpenRouter without zdr and data_collection deny";
  }
  return `unknown route ${o.url}`;
}
const modelCalls = (run: Run) => run.outbound.filter((o) => o.body.includes('"messages"') || isAiUrl(o.url));
const nameLogs = (run: Run) => run.logs.filter((l) => NAMES.some((n) => new RegExp(n, "i").test(l)));

const NAME_CALLS: Array<{ label: string; fn: string; body: Record<string, unknown> }> = [
  { label: "spelling (the name field)", fn: "correct-spelling", body: { text: CHILD, gradeLevel: "2", context: "user_form_input" } },
  { label: "spelling (a story idea)", fn: "correct-spelling", body: { text: `${CHILD} and her brothr ${SIBLING} went to the park`, gradeLevel: "2" } },
  { label: "translate to English", fn: "translate-universal", body: { text: `${CHILD} quiere un cuento sobre ${SIBLING} y un dragón`, targetLanguage: "en", mode: "to-english" } },
  { label: "translate a word with its sentence", fn: "translate-universal", body: { text: "dragon", targetLanguage: "es", mode: "from-english", context: `${CHILD} and ${SIBLING} saw a dragon` } },
  { label: "define a tapped name", fn: "word-dictionary", body: { word: SIBLING, userLevel: "easy", userLanguage: "en" } },
];

describe.each(["echo", "fail"] as AiMode[])("a call that may carry a child's name takes only safe routes (models %s)", (mode) => {
  it.each(NAME_CALLS.map((c) => [c.label, c] as const))("%s, signed in", async (_l, c) => {
    const run = await runFunction(c.fn, post(c.fn, c.body), mode);
    const calls = modelCalls(run);
    expect(calls.length, `${c.fn} reached no model: ${run.text.slice(0, 200)}`).toBeGreaterThan(0);
    expect(calls.map(unsafeRoute).filter(Boolean)).toEqual([]);
    expect(nameLogs(run)).toEqual([]);
    // Models answering: a real answer. Models down: each function's own refusal or fallback.
    if (mode === "echo") expect(run.response.status).toBe(200);
  }, 30000);

  it.each(NAME_CALLS.map((c) => [c.label, c] as const))("%s, as a guest", async (_l, c) => {
    const { pass } = await issueGuestPass(ENV.SUPABASE_SERVICE_ROLE_KEY);
    const run = await runFunction(c.fn, post(c.fn, c.body, { Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`, "x-t2r-guest": pass }), mode);
    const calls = modelCalls(run);
    expect(calls.length, `${c.fn} reached no model: ${run.text.slice(0, 200)}`).toBeGreaterThan(0);
    expect(calls.map(unsafeRoute).filter(Boolean)).toEqual([]);
  }, 30000);
});

describe("the name is the child's own, and an outage ends unsure", () => {
  it("spelling keeps the real name (no stand-in), and with every model down returns the text unchanged at low confidence", async () => {
    const ok = await runFunction("correct-spelling", post("correct-spelling", NAME_CALLS[1].body), "echo");
    expect(JSON.parse(ok.text).correctedText).toContain(CHILD);
    const down = await runFunction("correct-spelling", post("correct-spelling", NAME_CALLS[1].body), "fail");
    expect(JSON.parse(down.text)).toMatchObject({ correctedText: NAME_CALLS[1].body.text, hadErrors: false, confidence: 0.1 });
  });

  it("with only the OpenRouter key set, no free model is tried: the paid no-retention route or nothing", async () => {
    edgeState().env = { ...ENV, CLOUDFLARE_WORKERS_AI_TOKEN: "", CLOUDFLARE_ACCOUNT_ID: "", OPENAI_API_KEY: "" };
    const run = await runFunction("correct-spelling", post("correct-spelling", NAME_CALLS[1].body), "fail");
    const calls = modelCalls(run);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.map(unsafeRoute).filter(Boolean)).toEqual([]);
    expect(JSON.parse(run.text).confidence).toBe(0.1);
  });
});

describe("only the story chain may use the free tier", () => {
  it("freeTier: true appears only where the reader's name is masked first", () => {
    const root = join(__dirname, "../../../supabase/functions");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|mjs|js)$/.test(f)) files.push(p);
      }
    };
    walk(root);
    const optIns = files.flatMap((p) => (readFileSync(p, "utf8").split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n").match(/freeTier:\s*true/g) ?? []).map(() => relative(root, p)));
    expect(optIns.sort()).toEqual([
      "generate-adaptive-story/streamlined-handler.ts",
      "generate-adaptive-story/streamlined-handler.ts",
      "generate-adaptive-story/streamlined-handler.ts",
      "generate-quiz/index.ts",
    ]);
  });
});

const LOG_CASES: Array<{ fn: string; body: unknown }> = [
  { fn: "generate-quiz", body: { storyText: `${CHILD} and her brother ${SIBLING} found a shiny dragon egg under the old oak tree and carried it home.`, grade: 1, childName: CHILD } },
  { fn: "runware-generate-image", body: { pageText: `${CHILD} hugged ${SIBLING} beside the glowing dragon egg.`, pageNumber: 1, sessionId: "s1", userInfo: { name: CHILD, age: 7 } } },
  {
    fn: "generate-adaptive-story",
    body: {
      bundle: {
        sessionId: "s1",
        storyContent: `Write page 1. Character Info: ${JSON.stringify({ name: CHILD, age: 7, gender: "girl" })}\nSpecial request: a story where ${CHILD} and her brother ${SIBLING} find a dragon egg.`,
        avatarData: {},
        systemSettings: { gradeLevel: 1, complianceTarget: 90 },
      },
      config: { sessionType: "premium", pageNumber: 1, sessionId: "s1" },
    },
  },
];

describe.each(["echo", "fail"] as AiMode[])("no child's name in the function logs (models %s)", (mode) => {
  it.each(LOG_CASES.map((c) => [c.fn, c] as const))("%s", async (_l, c) => {
    const run = await runFunction(c.fn, post(c.fn, c.body), mode);
    expect(modelCalls(run).length, `${c.fn} reached no model: ${run.text.slice(0, 200)}`).toBeGreaterThan(0);
    expect(nameLogs(run)).toEqual([]);
  }, 30000);
});
