// R-KID-01 on the real path (22 Nov 2026 review of #182): each AI function, run as deployed
// (supabase/functions/<fn>/index.ts through ./harness.ts), never sends the reader's name, a
// sibling's name or the account holder's name to any model or other outside service, and
// never writes one to its logs. The sibling is another child profile on the account, typed
// into the request; the account's names come from the database, not from the request.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { edgeState } from "./state";
import { ENV, isAiUrl, leaks, runFunction, tokenFor, type AiMode } from "./harness";
import { issueGuestPass } from "../../../supabase/functions/_shared/paidCallGuard";

const CHILD = "Zephyrine";
const SIBLING = "Quillon";
const PARENT = "Marisol Okonkwo";
const NAMES = [CHILD, SIBLING, "Marisol", "Okonkwo"];

const USER_TOKEN = tokenFor("authenticated", "user-1");

beforeEach(() => {
  const s = edgeState();
  s.env = { ...ENV };
  s.userIdFor = (t) => (t === USER_TOKEN ? "user-1" : null);
  s.rpc = { paid_call_hit: null, institution_ai_lane: "family" };
  s.tables = {
    profiles: [{ display_name: PARENT, user_id: "user-1" }],
    child_profiles: [{ display_name: CHILD }, { display_name: SIBLING }],
    subscribers: [{ subscribed: true, subscription_end: "2999-01-01T00:00:00Z" }],
  };
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

const CASES: Array<{ fn: string; body: () => unknown; expectAi: boolean }> = [
  {
    fn: "correct-spelling",
    body: () => ({ text: `${CHILD} and her brothr ${SIBLING} went to the park`, gradeLevel: "2", context: "user_form_input" }),
    expectAi: true,
  },
  {
    fn: "translate-universal",
    body: () => ({ text: `${CHILD} quiere un cuento sobre ${SIBLING} y un dragón`, targetLanguage: "en", mode: "to-english" }),
    expectAi: true,
  },
  {
    fn: "translate-universal",
    body: () => ({ text: "dragon", targetLanguage: "es", mode: "from-english", context: `${CHILD} and ${SIBLING} saw a dragon` }),
    expectAi: true,
  },
  {
    fn: "generate-quiz",
    body: () => ({ storyText: `${CHILD} and her brother ${SIBLING} found a shiny dragon egg under the old oak tree and carried it home.`, grade: 1 }),
    expectAi: true,
  },
  {
    fn: "word-dictionary",
    body: () => ({ word: "lantern", userLevel: "easy", userLanguage: "en", context: `${CHILD} held the lantern for ${SIBLING}` }),
    expectAi: true,
  },
  {
    fn: "runware-generate-image",
    body: () => ({ pageText: `${CHILD} hugged ${SIBLING} beside the glowing dragon egg.`, pageNumber: 1, sessionId: "s1", userInfo: { name: CHILD, age: 7 } }),
    expectAi: true,
  },
  {
    fn: "generate-adaptive-story",
    body: () => ({
      bundle: {
        sessionId: "s1",
        storyContent: `Write page 1. Character Info: ${JSON.stringify({ name: CHILD, age: 7, gender: "girl" })}\nSpecial request: a story where ${CHILD} and her brother ${SIBLING} find a dragon egg.`,
        avatarData: {},
        systemSettings: { gradeLevel: 1, complianceTarget: 90 },
      },
      config: { sessionType: "premium", pageNumber: 1, sessionId: "s1" },
    }),
    expectAi: true,
  },
];

describe.each(["fail", "echo"] as AiMode[])("a signed-in account's names never leave (models %s)", (mode) => {
  it.each(CASES.map((c, i) => [`${c.fn} #${i}`, c] as const))("%s", async (_label, c) => {
    const run = await runFunction(c.fn, post(c.fn, c.body()), mode);
    if (c.expectAi) expect(run.outbound.filter((o) => isAiUrl(o.url)).length, `${c.fn} reached no model: ${run.text.slice(0, 200)}`).toBeGreaterThan(0);
    expect(leaks(run, NAMES)).toEqual([]);
  }, 30000);
});

describe("names come back to the reader", () => {
  it("correct-spelling returns the child's name, though the model only saw a stand-in", async () => {
    const run = await runFunction("correct-spelling", post("correct-spelling", CASES[0].body()), "echo");
    expect(leaks(run, NAMES)).toEqual([]);
    expect(JSON.parse(run.text).correctedText).toContain(CHILD);
    expect(JSON.parse(run.text).correctedText).toContain(SIBLING);
  });
});

describe("a tapped name is not a dictionary word", () => {
  it("word-dictionary answers a reader's name itself: no model, no dictionary, no log", async () => {
    const run = await runFunction("word-dictionary", post("word-dictionary", { word: SIBLING, userLevel: "easy", userLanguage: "en" }), "echo");
    expect(run.response.status).toBe(200);
    expect(JSON.parse(run.text).source).toBe("name");
    expect(run.outbound.map((o) => o.url)).toEqual([]);
    expect(run.logs.filter((l) => new RegExp(SIBLING, "i").test(l))).toEqual([]);
  });
});

describe("a guest's typed name (readerNames from the browser) never leaves", () => {
  for (const fn of ["correct-spelling", "translate-universal"] as const) {
    it(fn, async () => {
      const { pass } = await issueGuestPass(ENV.SUPABASE_SERVICE_ROLE_KEY);
      const body = fn === "correct-spelling"
        ? { text: `${CHILD} likes dragns`, gradeLevel: "1", readerNames: [CHILD] }
        : { text: `${CHILD} quiere un dragón`, targetLanguage: "en", mode: "to-english", readerNames: [CHILD] };
      const run = await runFunction(fn, post(fn, body, { Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`, "x-t2r-guest": pass }), "echo");
      expect(run.outbound.filter((o) => isAiUrl(o.url)).length, run.text.slice(0, 200)).toBeGreaterThan(0);
      expect(leaks(run, [CHILD])).toEqual([]);
    });
  }
});

describe("the account's names fail closed", () => {
  it("when the database cannot answer, the lane is school and the body's names are still masked", async () => {
    edgeState().tables = {};
    edgeState().rpc = { paid_call_hit: null, institution_ai_lane: "family" };
    const s = edgeState();
    s.userIdFor = () => { throw new Error("auth down"); };
    const run = await runFunction("correct-spelling", post("correct-spelling", { text: `${CHILD} likes dragns`, gradeLevel: "1", readerNames: [CHILD] }), "echo");
    // No free route on the school lane, and no name on any route.
    expect(run.outbound.some((o) => /openrouter\.ai.*|":free"/.test(o.url + o.body) && /:free/.test(o.body))).toBe(false);
    expect(leaks(run, [CHILD])).toEqual([]);
  });
});
