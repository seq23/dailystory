// Guard: no one on the internet can make Time2Read send email or spend paid quota
// (23 Nov 2026, after a stranger's message arrived through an unguarded mailer).
// Every edge function that sends mail or calls a paid API checks its caller first, with the
// check that fits its real caller (supabase/functions/_shared/callerCheck.ts), and functions
// whose source was removed are removed from the project too. Addresses here are invented
// (example.test); nothing is sent.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  OPS_SECRET_HEADER,
  adminOrCronRefusal,
  cronSecretRefusal,
  escapeHtml,
  rateRefusal,
  sameSecret,
  type GetUser,
  type RateHit,
} from "../../../supabase/functions/_shared/callerCheck";
import {
  CONSENT_SENDS_PER_PROFILE_PER_DAY,
  type ChildProfileRow,
  type ConsentDeps,
  type ConsentEmail,
  consentSubject,
  handleConsentRequest,
} from "../../../supabase/functions/verify-parental-consent/handler";
import {
  MAX_BATCH as PROMPT_STUDIO_MAX_BATCH,
  type PromptStudioDeps,
  handlePromptStudio,
  runRequest,
} from "../../../supabase/functions/prompt-studio/handler";
import {
  FEEDBACK_LIMITS,
  FEEDBACK_TO,
  MAX_FEEDBACK_BODY_BYTES,
  type FeedbackDeps,
  type FeedbackEmail,
  handleFeedback,
} from "../../../supabase/functions/send-feedback-notification/handler";

const root = join(__dirname, "../../..");
const fnRoot = join(root, "supabase/functions");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const cors = { "Access-Control-Allow-Origin": "*" };
const body = async (r: Response) => JSON.parse(await r.text());

/** In-memory twin of public.paid_call_hit: all-or-nothing; a refused call is not counted. */
function memoryHit(): RateHit & { counts: Map<string, number> } {
  const counts = new Map<string, number>();
  const hit = (async (buckets: string[], _windows: number[], limits: number[]) => {
    for (let i = 0; i < buckets.length; i++) if ((counts.get(buckets[i]) ?? 0) >= limits[i]) return buckets[i];
    for (const b of buckets) counts.set(b, (counts.get(b) ?? 0) + 1);
    return null;
  }) as RateHit & { counts: Map<string, number> };
  hit.counts = counts;
  return hit;
}
const brokenHit: RateHit = async () => { throw new Error("db down"); };

const USERS: Record<string, { id: string; email: string }> = {
  "token-parent": { id: "11111111-1111-4111-8111-111111111111", email: "parent@example.test" },
  "token-other": { id: "22222222-2222-4222-8222-222222222222", email: "other@example.test" },
  "token-admin": { id: "33333333-3333-4333-8333-333333333333", email: "admin@example.test" },
};
/** auth.getUser twin: the anon key and unknown tokens are no user. */
const getUser: GetUser = async (t) => USERS[t] ?? null;
const ANON_KEY = "anon-key-is-public";

// ───────────────────────── 1. Every mailer and paid caller checks its caller ─────────────────────────

const MAIL = /api\.resend\.com|npm:resend|new Resend\(/;
const PAID = /api\.openai\.com|api\.runware\.ai|ai\.gateway\.lovable\.dev|openrouter\.ai|api\.elevenlabs\.io|generativelanguage\.googleapis\.com|api\.cloudflare\.com\/client\/v4\/accounts\/[^"'`]*\/ai|api\.anthropic\.com|api\.replicate\.com|api\.stability\.ai/;
/** A call to one of the recognised checks, in the function's own folder. */
const CHECK = /\b(paidCallRefusal|guardCallWithCors|guardCall|identifyCaller|cronSecretRefusal|signedInUser|adminOrCronRefusal|rateRefusal|verifyStripeEvent|handleConsentRequest|handleFeedback)\s*\(|requireAuth:\s*true/;

/** The entry file and every local file it imports, transitively (shared helpers included). */
function sourceFiles(entry: string): string[] {
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const f = stack.pop()!;
    if (seen.has(f) || !existsSync(f)) continue;
    seen.add(f);
    for (const m of readFileSync(f, "utf8").matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']|import\(\s*["'](\.{1,2}\/[^"']+)["']/g)) {
      stack.push(resolve(dirname(f), m[1] ?? m[2]));
    }
  }
  return [...seen];
}

function scanFunctions() {
  return readdirSync(fnRoot)
    .filter((d) => !d.startsWith("_") && existsSync(join(fnRoot, d, "index.ts")))
    .map((name) => {
      const files = sourceFiles(join(fnRoot, name, "index.ts"));
      const all = files.map((f) => readFileSync(f, "utf8")).join("\n");
      const own = files.filter((f) => f.startsWith(join(fnRoot, name) + "/")).map((f) => readFileSync(f, "utf8")).join("\n");
      return { name, mail: MAIL.test(all), paid: PAID.test(all), checked: CHECK.test(own) };
    });
}

describe("every function that sends mail or spends paid quota checks its caller", () => {
  const fns = scanFunctions();
  const risky = fns.filter((f) => f.mail || f.paid);

  it("finds the functions (a scan that sees nothing proves nothing)", () => {
    expect(fns.length).toBeGreaterThan(30);
    const mailers = risky.filter((f) => f.mail).map((f) => f.name);
    for (const m of ["verify-parental-consent", "send-feedback-notification", "traffic-alert", "cost-report", "lifecycle-emails", "notify-data-breach"]) {
      expect(mailers).toContain(m);
    }
    expect(risky.filter((f) => f.paid).length).toBeGreaterThan(10);
  });

  it("each one calls a recognised caller check in its own code", () => {
    expect(risky.filter((f) => !f.checked).map((f) => f.name)).toEqual([]);
  });
});

describe("retired functions leave the project, not only the repo", () => {
  const RETIRED = [
    "send-custom-auth-email", "notification-service", "send-coppa-notification", "send-parental-notification",
    "ai-visual-scene-creator", "runware-template-ab", "runware-template-cd",
  ];
  const wf = read(".github/workflows/deploy-functions.yml");
  const listed = (wf.match(/RETIRED="([^"]+)"/)?.[1] ?? "").split(/\s+/).filter(Boolean);

  it("the deploy deletes each retired function and proves it answers 404", () => {
    expect(listed.sort()).toEqual([...RETIRED].sort());
    expect(wf).toContain('supabase functions delete "$func"');
    expect(wf).toMatch(/\[ "\$code" = "404" \]/);
    expect(wf).toMatch(/retired functions still live:\$failed"; exit 1/);
  });

  it("no retired function has a folder, and nothing in the app still calls one", () => {
    for (const f of RETIRED) expect(existsSync(join(fnRoot, f)), f).toBe(false);
    const app = readdirSync(join(root, "src"), { recursive: true }) as string[];
    const callers = app
      .filter((p) => /\.(ts|tsx)$/.test(p) && !p.includes("test"))
      .filter((p) => RETIRED.some((f) => readFileSync(join(root, "src", p), "utf8").includes(`"${f}"`) || readFileSync(join(root, "src", p), "utf8").includes(`'${f}'`)));
    expect(callers).toEqual([]);
  });

  it("the post-deploy check calls each mailer as a stranger and must be refused", () => {
    expect(wf).toContain("Strangers are refused (post-deploy)");
    for (const f of ["verify-parental-consent", "traffic-alert", "cost-report", "notify-data-breach", "lifecycle-emails"]) {
      expect(wf).toMatch(new RegExp(`expect_refused ${f} `));
    }
  });
});

// ───────────────────────── 2. The shared checks ─────────────────────────

describe("sameSecret", () => {
  it("matches only the exact secret; empty never matches", () => {
    expect(sameSecret("s3cret-value", "s3cret-value")).toBe(true);
    expect(sameSecret("s3cret-valuX", "s3cret-value")).toBe(false);
    expect(sameSecret("s3cret-value-and-more", "s3cret-value")).toBe(false);
    expect(sameSecret("s3cret", "s3cret-value")).toBe(false);
    expect(sameSecret("", "")).toBe(false);
    expect(sameSecret("", "x")).toBe(false);
  });

  it("does not stop at the first different byte (constant time)", () => {
    const src = readFileSync(join(fnRoot, "_shared/callerCheck.ts"), "utf8");
    const fn = src.slice(src.indexOf("export function sameSecret"), src.indexOf("export function bearerToken"));
    const loop = fn.slice(fn.indexOf("for ("));
    expect(loop).toMatch(/diff \|=/);
    expect(loop.slice(0, loop.indexOf("return diff"))).not.toMatch(/return|break/);
    expect(fn).not.toMatch(/given\s*===\s*expected/);
    // No caller compares a secret with === anywhere in the functions.
    const offenders = scanFunctions().map((f) => f.name).filter((n) =>
      sourceFiles(join(fnRoot, n, "index.ts")).some((p) => /(token|auth)\s*[!=]==\s*service(Role)?Key|[!=]==\s*Deno\.env\.get\([^)]*(SECRET|SERVICE_ROLE)/.test(readFileSync(p, "utf8"))));
    expect(offenders).toEqual([]);
  });
});

describe("cronSecretRefusal (scheduled callers)", () => {
  const secret = { header: OPS_SECRET_HEADER, name: "OPS_CRON_SECRET", value: "real-secret" };
  const req = (h: Record<string, string> = {}) => new Request("https://x/functions/v1/traffic-alert", { method: "POST", headers: h });

  it("an unset secret refuses everyone with a NAMED STOP", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = cronSecretRefusal(req({ [OPS_SECRET_HEADER]: "" }), { ...secret, value: undefined })!;
    expect(r.status).toBe(503);
    expect((await body(r)).stop).toMatch(/^NAMED STOP OPS_CRON_SECRET/);
    expect(err.mock.calls.join(" ")).toMatch(/NAMED STOP OPS_CRON_SECRET/);
    err.mockRestore();
  });

  it("no header, a forged header or the anon key is 403; the real secret passes", () => {
    expect(cronSecretRefusal(req(), secret)!.status).toBe(403);
    expect(cronSecretRefusal(req({ [OPS_SECRET_HEADER]: "forged" }), secret)!.status).toBe(403);
    expect(cronSecretRefusal(req({ Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY }), secret)!.status).toBe(403);
    expect(cronSecretRefusal(req({ [OPS_SECRET_HEADER]: "real-secret" }), secret)).toBeNull();
  });
});

describe("adminOrCronRefusal (admin dashboard, schedule, service key)", () => {
  const cron = { header: OPS_SECRET_HEADER, name: "OPS_CRON_SECRET", value: "real-secret" };
  const opts = { adminIds: [USERS["token-admin"].id], getUser, cron, serviceKey: "service-key" };
  const req = (h: Record<string, string>) => new Request("https://x/functions/v1/cost-report", { method: "POST", headers: h });

  it("no auth and the anon key are 401; a signed-in non-admin is 403", async () => {
    expect((await adminOrCronRefusal(req({}), opts)).refused?.status).toBe(401);
    expect((await adminOrCronRefusal(req({ Authorization: `Bearer ${ANON_KEY}` }), opts)).refused?.status).toBe(401);
    expect((await adminOrCronRefusal(req({ Authorization: "Bearer token-parent" }), opts)).refused?.status).toBe(403);
  });

  it("a forged schedule header is 403 even with an admin's token beside it", async () => {
    const r = await adminOrCronRefusal(req({ [OPS_SECRET_HEADER]: "forged", Authorization: "Bearer token-admin" }), opts);
    expect(r.refused?.status).toBe(403);
  });

  it("an empty admin list admits no one", async () => {
    expect((await adminOrCronRefusal(req({ Authorization: "Bearer token-admin" }), { ...opts, adminIds: [] })).refused?.status).toBe(403);
  });

  it("auth unreachable is a refusal, never a pass", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const down: GetUser = async () => { throw new Error("auth down"); };
    expect((await adminOrCronRefusal(req({ Authorization: "Bearer token-admin" }), { ...opts, getUser: down })).refused?.status).toBe(503);
    vi.restoreAllMocks();
  });

  it("the admin, the schedule and the service key pass", async () => {
    expect(await adminOrCronRefusal(req({ Authorization: "Bearer token-admin" }), opts)).toMatchObject({ by: "admin", userId: USERS["token-admin"].id, refused: null });
    expect(await adminOrCronRefusal(req({ [OPS_SECRET_HEADER]: "real-secret" }), opts)).toMatchObject({ by: "cron", refused: null });
    expect(await adminOrCronRefusal(req({ Authorization: "Bearer service-key" }), opts)).toMatchObject({ by: "service", refused: null });
  });
});

describe("rateRefusal", () => {
  it("a counter outage is 503 (fail closed), a full window is 429 with Retry-After", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await rateRefusal(brokenHit, [{ bucket: "b", window: 60, max: 1 }], "t"))!.status).toBe(503);
    const hit = memoryHit();
    expect(await rateRefusal(hit, [{ bucket: "b", window: 600, max: 1 }], "t")).toBeNull();
    const r = (await rateRefusal(hit, [{ bucket: "b", window: 600, max: 1 }], "t"))!;
    expect(r.status).toBe(429);
    expect(r.headers.get("Retry-After")).toBe("600");
    await expect(rateRefusal(hit, [], "t")).rejects.toThrow();
    vi.restoreAllMocks();
  });
});

// ───────────────────────── 3. verify-parental-consent ─────────────────────────

const CHILD_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_CHILD_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const PROFILES: Record<string, ChildProfileRow> = {
  [CHILD_ID]: { id: CHILD_ID, parent_user_id: USERS["token-parent"].id, parent_email: "stored-parent@example.test", display_name: "Maya" },
  [OTHER_CHILD_ID]: { id: OTHER_CHILD_ID, parent_user_id: USERS["token-other"].id, parent_email: "other-parent@example.test", display_name: "Leo" },
};

function consentDeps(over: Partial<ConsentDeps> = {}) {
  const sent: ConsentEmail[] = [];
  const inserted: unknown[] = [];
  const deps: ConsentDeps = {
    getUser,
    hit: memoryHit(),
    loadChild: async (id) => PROFILES[id] ?? null,
    insertConsent: async (row) => { inserted.push(row); return `consent-${inserted.length}`; },
    sendEmail: async (e) => { sent.push(e); },
    audit: async () => {},
    mailConfigured: true,
    siteUrl: "https://time-2-read.com",
    clientIp: null,
    newToken: () => "tok-1",
    now: () => Date.UTC(2026, 10, 23),
    ...over,
  };
  return { deps, sent, inserted };
}
const consentReq = (auth: string | null, payload: unknown) =>
  new Request("https://x/functions/v1/verify-parental-consent", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });

describe("verify-parental-consent", () => {
  it("no auth and the anon key are 401 and send nothing", async () => {
    for (const auth of [null, ANON_KEY]) {
      const { deps, sent, inserted } = consentDeps();
      const r = await handleConsentRequest(consentReq(auth, { child_profile_id: CHILD_ID, parent_email: "victim@example.test" }), deps, cors);
      expect(r.status).toBe(401);
      expect(sent).toEqual([]);
      expect(inserted).toEqual([]);
    }
  });

  it("another parent's child, or a profile that does not exist, is 403 and sends nothing", async () => {
    for (const id of [OTHER_CHILD_ID, "cccccccc-cccc-4ccc-8ccc-cccccccccccc"]) {
      const { deps, sent } = consentDeps();
      const r = await handleConsentRequest(consentReq("token-parent", { child_profile_id: id }), deps, cors);
      expect(r.status).toBe(403);
      expect(sent).toEqual([]);
    }
  });

  it("the recipient and the child's name come from the database; the body's are ignored", async () => {
    const { deps, sent, inserted } = consentDeps();
    const r = await handleConsentRequest(consentReq("token-parent", {
      child_profile_id: CHILD_ID, parent_email: "victim@example.test", child_name: "<a href=x>Click</a>", to: "victim@example.test",
    }), deps, cors);
    expect(r.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("stored-parent@example.test");
    expect(sent[0].subject).toContain("Maya");
    expect(sent[0].html).toContain("Maya");
    expect(JSON.stringify(sent)).not.toMatch(/victim|Click/);
    expect(inserted[0]).toMatchObject({ child_profile_id: CHILD_ID, parent_email: "stored-parent@example.test" });
    expect(sent[0].html).toContain("https://time-2-read.com/verify-consent?token=tok-1");
  });

  it(`at most ${CONSENT_SENDS_PER_PROFILE_PER_DAY} sends per profile per day, then 429`, async () => {
    const { deps, sent } = consentDeps();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const codes: number[] = [];
    for (let i = 0; i < CONSENT_SENDS_PER_PROFILE_PER_DAY + 2; i++) {
      codes.push((await handleConsentRequest(consentReq("token-parent", { child_profile_id: CHILD_ID }), deps, cors)).status);
    }
    expect(codes).toEqual([...Array(CONSENT_SENDS_PER_PROFILE_PER_DAY).fill(200), 429, 429]);
    expect(sent).toHaveLength(CONSENT_SENDS_PER_PROFILE_PER_DAY);
    vi.restoreAllMocks();
  });

  it("outages end refused, never sent: rate counter, profile read, auth, mail key", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = { child_profile_id: CHILD_ID };
    let t = consentDeps({ hit: brokenHit });
    expect((await handleConsentRequest(consentReq("token-parent", ok), t.deps, cors)).status).toBe(503);
    expect(t.sent).toEqual([]);
    t = consentDeps({ loadChild: async () => { throw new Error("db"); } });
    expect((await handleConsentRequest(consentReq("token-parent", ok), t.deps, cors)).status).toBe(503);
    t = consentDeps({ getUser: async () => { throw new Error("auth"); } });
    expect((await handleConsentRequest(consentReq("token-parent", ok), t.deps, cors)).status).toBe(503);
    t = consentDeps({ mailConfigured: false });
    const r = await handleConsentRequest(consentReq("token-parent", ok), t.deps, cors);
    expect(r.status).toBe(503);
    expect((await body(r)).stop).toMatch(/^NAMED STOP RESEND_API_KEY/);
    expect(t.sent).toEqual([]);
    vi.restoreAllMocks();
  });

  it("a malformed or oversized body is refused before any lookup", async () => {
    const { deps, sent } = consentDeps();
    expect((await handleConsentRequest(consentReq("token-parent", { child_profile_id: "1 or 1=1" }), deps, cors)).status).toBe(400);
    expect((await handleConsentRequest(consentReq("token-parent", JSON.stringify({ child_profile_id: CHILD_ID, pad: "x".repeat(5000) })), deps, cors)).status).toBe(413);
    expect(sent).toEqual([]);
  });

  it("a stored name cannot add a mail header or HTML", () => {
    expect(consentSubject("Maya\r\nBcc: x@example.test")).not.toMatch(/[\r\n]/);
    expect(escapeHtml(`<img src=x onerror="a">`)).toBe("&lt;img src=x onerror=&quot;a&quot;&gt;");
  });
});

// ───────────────────────── 4. send-feedback-notification (public form) ─────────────────────────

function feedbackDeps(over: Partial<FeedbackDeps> = {}) {
  const sent: FeedbackEmail[] = [];
  const deps: FeedbackDeps = {
    getUser,
    hit: memoryHit(),
    networkKey: "net-a",
    sendEmail: async (e) => { sent.push(e); },
    mailConfigured: true,
    ...over,
  };
  return { deps, sent };
}
const fbReq = (payload: unknown, auth?: string) =>
  new Request("https://x/functions/v1/send-feedback-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
const FB = { rating: 4, category: "bug", message: "The read-aloud stopped", page_url: "https://time-2-read.com/story" };

describe("send-feedback-notification", () => {
  it("always goes to the one fixed inbox; a body recipient or identity is ignored", async () => {
    const { deps, sent } = feedbackDeps();
    const r = await handleFeedback(fbReq({ ...FB, to: "victim@example.test", user_email: "victim@example.test", user_id: "forged" }, ANON_KEY), deps, cors);
    expect(r.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(FEEDBACK_TO);
    expect(sent[0].replyTo).toBeUndefined();
    expect(JSON.stringify(sent)).not.toMatch(/victim|forged/);
  });

  it("the sender's address comes only from a verified session", async () => {
    const { deps, sent } = feedbackDeps();
    await handleFeedback(fbReq(FB, "token-parent"), deps, cors);
    expect(sent[0].replyTo).toBe("parent@example.test");
  });

  it("a burst from one network is 429 after the 10-minute cap", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { deps, sent } = feedbackDeps();
    const cap = FEEDBACK_LIMITS.perNetwork[0].max;
    const codes: number[] = [];
    for (let i = 0; i < cap + 2; i++) codes.push((await handleFeedback(fbReq(FB), deps, cors)).status);
    expect(codes).toEqual([...Array(cap).fill(200), 429, 429]);
    expect(sent).toHaveLength(cap);
    vi.restoreAllMocks();
  });

  it("forged networks still hit the daily cap for everyone", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const hit = memoryHit();
    let sentCount = 0;
    let last = 0;
    for (let i = 0; i < FEEDBACK_LIMITS.allPerDay + 3; i++) {
      const { deps } = feedbackDeps({ hit, networkKey: `net-${i}`, sendEmail: async () => { sentCount++; } });
      last = (await handleFeedback(fbReq(FB), deps, cors)).status;
    }
    expect(sentCount).toBe(FEEDBACK_LIMITS.allPerDay);
    expect(last).toBe(429);
    vi.restoreAllMocks();
  });

  it("outages end refused: rate counter 503, missing mail key 503 NAMED STOP", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let t = feedbackDeps({ hit: brokenHit });
    expect((await handleFeedback(fbReq(FB), t.deps, cors)).status).toBe(503);
    expect(t.sent).toEqual([]);
    t = feedbackDeps({ mailConfigured: false });
    const r = await handleFeedback(fbReq(FB), t.deps, cors);
    expect(r.status).toBe(503);
    expect((await body(r)).stop).toMatch(/^NAMED STOP RESEND_API_KEY/);
    expect(t.sent).toEqual([]);
    vi.restoreAllMocks();
  });

  it("every field is escaped, a stranger's link is shown as text, and size is capped", async () => {
    const { deps, sent } = feedbackDeps();
    await handleFeedback(fbReq({ ...FB, message: "<script>x</script>", page_url: "https://evil.example.test/phish" }), deps, cors);
    expect(sent[0].html).not.toContain("<script>");
    expect(sent[0].html).toContain("&lt;script&gt;");
    expect(sent[0].html).not.toMatch(/href="https:\/\/evil/);
    expect((await handleFeedback(fbReq({ ...FB, message: "x".repeat(17000) }), deps, cors)).status).toBe(413);
    expect((await handleFeedback(fbReq({ ...FB, rating: 9 }), deps, cors)).status).toBe(400);
    expect(sent).toHaveLength(1);
  });

  it("edges: a body of exactly the byte cap is read, one byte more is 413; ratings 1 and 5 pass, 0, 6 and 2.5 are 400", async () => {
    const { deps, sent } = feedbackDeps();
    // Pad with a multi-byte character so the cap is measured in bytes, not characters.
    const sized = (bytes: number) => {
      const base = JSON.stringify({ ...FB, pad: "" });
      const room = bytes - new TextEncoder().encode(base).byteLength;
      const pad = "é".repeat(Math.floor(room / 2)) + "x".repeat(room % 2);
      const raw = JSON.stringify({ ...FB, pad });
      expect(new TextEncoder().encode(raw).byteLength).toBe(bytes);
      return raw;
    };
    expect((await handleFeedback(fbReq(sized(MAX_FEEDBACK_BODY_BYTES)), deps, cors)).status).toBe(200);
    expect((await handleFeedback(fbReq(sized(MAX_FEEDBACK_BODY_BYTES + 1)), deps, cors)).status).toBe(413);
    for (const rating of [1, 5]) expect((await handleFeedback(fbReq({ ...FB, rating }), deps, cors)).status).toBe(200);
    for (const rating of [0, 6, 2.5, "4"]) expect((await handleFeedback(fbReq({ ...FB, rating }), deps, cors)).status).toBe(400);
    expect(sent).toHaveLength(3);
  });

  it("the form sends no identity in the body", () => {
    const form = read("src/components/FeedbackForm.tsx");
    const invoke = form.slice(form.indexOf("send-feedback-notification"));
    expect(invoke.slice(0, 600)).not.toMatch(/user_email|user_id/);
  });
});

// ───────────────────────── 5. The scheduled reports ─────────────────────────

describe("traffic-alert and cost-report answer only the schedule (or an admin)", () => {
  it("traffic-alert checks the schedule secret before it reads or sends anything", () => {
    const src = read("supabase/functions/traffic-alert/index.ts");
    // The call AND its early return, as one statement pair: a call whose answer is thrown away checks nothing.
    const gate = /\n\s*const (\w+) = cronSecretRefusal\(req, \{ header: OPS_SECRET_HEADER, name: 'OPS_CRON_SECRET', value: Deno\.env\.get\('OPS_CRON_SECRET'\) \}, corsHeaders\);\s*if \(\1\) return \1;/.exec(src);
    expect(gate, "traffic-alert must return cronSecretRefusal's answer").not.toBeNull();
    const check = gate!.index;
    const entry = src.indexOf("serve(");
    expect(entry).toBeGreaterThan(0);
    expect(check).toBeGreaterThan(entry);
    for (const later of ["createClient(", ".from(", "api.resend.com"]) expect(src.indexOf(later, entry)).toBeGreaterThan(check);
  });

  it("cost-report: admin or schedule, recipient from a secret, no address in the repo", () => {
    const src = read("supabase/functions/cost-report/index.ts");
    const check = src.indexOf("adminOrCronRefusal(req, {");
    expect(check).toBeGreaterThan(0);
    expect(src.indexOf("api.resend.com")).toBeGreaterThan(check);
    expect(src).toContain("Deno.env.get('COST_REPORT_EMAIL')");
    expect(src).toMatch(/NAMED STOP \$\{!resendKey \? 'RESEND_API_KEY' : 'COST_REPORT_EMAIL'\}/);
    expect(src.replace(/reports@resend\.dev/g, "")).not.toMatch(/[\w.+-]+@[a-z][\w-]*\.[a-z]{2,}/i);
    expect(src).not.toMatch(/token\s*===\s*serviceKey/);
  });

  it("the workflow sends the secret on both schedules and fails on a NAMED STOP or a non-200", () => {
    const wf = read(".github/workflows/ops-reports.yml");
    expect(wf).toContain('cron: "0 4 1 * *"');
    expect(wf).toContain('cron: "20 4 1 1,4,7,10 *"');
    expect(wf).toContain('"0 4 1 * *") REPORT=traffic-alert');
    expect(wf).toContain('"20 4 1 1,4,7,10 *") REPORT=cost-report');
    expect(wf).toContain(`-H "${OPS_SECRET_HEADER}: $OPS_CRON_SECRET"`);
    expect(wf).toMatch(/NAMED STOP: repo secret OPS_CRON_SECRET is not set"; exit 1/);
    expect(wf).toMatch(/\[ "\$code" = "200" \] \|\| \{[^}]*exit 1; \}/);
  });

  it("the pg_cron jobs that used the anon key are unscheduled, and the secrets reach the project", () => {
    const mig = readdirSync(join(root, "supabase/migrations")).find((f) => f.endsWith("_ops_reports_off_pg_cron.sql"));
    expect(mig).toBeTruthy();
    const sql = read(`supabase/migrations/${mig}`);
    expect(sql).toContain("jobname in ('monthly-traffic-alert', 'quarterly-cost-report')");
    expect(sql).toContain("cron.unschedule(j.jobid)");
    expect(sql).toMatch(/to_regclass\('cron\.job'\) is null/);
    const sync = read(".github/workflows/sync-edge-secrets.yml");
    for (const n of ["OPS_CRON_SECRET", "COST_REPORT_EMAIL"]) {
      expect(sync).toContain(`${n}: \${{ secrets.${n} }}`);
      expect(sync.match(/for n in ([^;]+);/)?.[1].split(/\s+/)).toContain(n);
    }
  });
});

// ───────────────────────── Admin-only paid and cost tools (coordinator's call, 23 Nov 2026) ─────────────────────────

describe("prompt-studio: only an admin reaches a socket or a paid call", () => {
  const ADMIN = USERS["token-admin"].id;
  function studio(over: Partial<PromptStudioDeps> = {}) {
    const upgrade = vi.fn(() => new Response(null, { status: 200 }));
    const generate = vi.fn(async () => ({ success: true as const, imageURL: "https://img.example.test/1.webp", cost: 0.002 }));
    const deps: PromptStudioDeps = { adminIds: [ADMIN], getUser, upgrade, generate, paidConfigured: true, ...over };
    return { deps, upgrade, generate };
  }
  const ws = (query = "", headers: Record<string, string> = {}) =>
    new Request(`https://x/functions/v1/prompt-studio${query}`, { headers: { upgrade: "websocket", ...headers } });
  const post = (payload: unknown, headers: Record<string, string> = {}) =>
    new Request("https://x/functions/v1/prompt-studio", { method: "POST", headers, body: JSON.stringify(payload) });

  it("no token, the anon key or a forged token is 401; a signed-in parent is 403; nothing opens or spends", async () => {
    const { deps, upgrade, generate } = studio();
    expect((await handlePromptStudio(ws(), deps, cors)).status).toBe(401);
    expect((await handlePromptStudio(ws(`?jwt=${ANON_KEY}`), deps, cors)).status).toBe(401);
    expect((await handlePromptStudio(ws("?jwt=forged.jwt.value"), deps, cors)).status).toBe(401);
    expect((await handlePromptStudio(ws("?jwt=token-parent"), deps, cors)).status).toBe(403);
    expect((await handlePromptStudio(post({ positivePrompt: "a fox" }, { Authorization: "Bearer token-parent" }), deps, cors)).status).toBe(403);
    expect(upgrade).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it("an admin's token in ?jwt= opens the socket; in the header the POST path generates once", async () => {
    const { deps, upgrade, generate } = studio();
    expect((await handlePromptStudio(ws("?jwt=token-admin"), deps, cors)).status).toBe(200);
    expect(upgrade).toHaveBeenCalledTimes(1);
    const r = await handlePromptStudio(post({ type: "generate", positivePrompt: "a fox" }, { Authorization: "Bearer token-admin" }), deps, cors);
    expect(r.status).toBe(200);
    expect((await body(r)).imageURL).toBe("https://img.example.test/1.webp");
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("an empty admin list or auth unreachable admits no one", async () => {
    const none = studio({ adminIds: [] });
    expect((await handlePromptStudio(ws("?jwt=token-admin"), none.deps, cors)).status).toBe(403);
    const down = studio({ getUser: async () => { throw new Error("auth down"); } });
    expect((await handlePromptStudio(ws("?jwt=token-admin"), down.deps, cors)).status).not.toBe(200);
    expect(none.upgrade).not.toHaveBeenCalled();
    expect(down.upgrade).not.toHaveBeenCalled();
  });

  it("a missing RUNWARE_API_KEY is a NAMED STOP, after the gate (a stranger learns nothing)", async () => {
    const { deps, upgrade } = studio({ paidConfigured: false });
    const r = await handlePromptStudio(ws("?jwt=token-admin"), deps, cors);
    expect(r.status).toBe(503);
    expect((await body(r)).stop).toMatch(/^NAMED STOP RUNWARE_API_KEY/);
    expect((await handlePromptStudio(ws(), deps, cors)).status).toBe(401);
    expect(upgrade).not.toHaveBeenCalled();
  });

  it("a batch is capped, an empty prompt spends nothing", async () => {
    const { deps, generate } = studio();
    const sent: unknown[] = [];
    await runRequest({ type: "batch", positivePrompt: "a fox", batchCount: 500 }, deps, (m) => sent.push(m));
    expect(generate).toHaveBeenCalledTimes(PROMPT_STUDIO_MAX_BATCH);
    generate.mockClear();
    await runRequest({ type: "generate", positivePrompt: "   " }, deps, (m) => sent.push(m));
    expect(generate).not.toHaveBeenCalled();
  });

  it("the real entry upgrades only through the gated handler; the page sends its token and sits behind AdminOnly", () => {
    const src = read("supabase/functions/prompt-studio/index.ts");
    expect(src).toMatch(/Deno\.serve\(\(req\) =>\s*handlePromptStudio\(req, \{/);
    expect(src.match(/Deno\.upgradeWebSocket\(/g)).toHaveLength(1);
    expect(src.indexOf("Deno.upgradeWebSocket(")).toBeGreaterThan(src.indexOf("upgrade(r) {"));
    expect(src).toContain('adminIds: adminIdsFrom(Deno.env.get("ADMIN_USER_IDS"))');
    expect(read("src/App.tsx")).toContain('<Route path="/prompt-studio" element={<AdminOnly><PromptStudio /></AdminOnly>} />');
    expect(read("src/components/PromptStudio.tsx")).toMatch(/functions\/v1\/prompt-studio\?jwt=\$\{encodeURIComponent\(jwt\)\}/);
    expect(read("supabase/config.toml")).toMatch(/\[functions\.prompt-studio\]\nverify_jwt = false/);
  });
});

describe("get-cost-analytics: admin or service key only", () => {
  it("checks ADMIN_USER_IDS with the shared admin check before any read; no any-signed-in-user path", () => {
    const src = read("supabase/functions/get-cost-analytics/index.ts");
    const gate = /const (\w+) = await adminOrCronRefusal\(req, \{\s*adminIds: adminIdsFrom\(Deno\.env\.get\('ADMIN_USER_IDS'\)\),[\s\S]*?\}\);\s*if \(\1\.refused\) return \1\.refused;/.exec(src);
    expect(gate, "get-cost-analytics must return adminOrCronRefusal's refusal").not.toBeNull();
    for (const later of [".from(", ".rpc("]) {
      const at = src.indexOf(later);
      if (at >= 0) expect(at).toBeGreaterThan(gate!.index);
    }
    expect(src.indexOf(".from(")).toBeGreaterThan(0);
    expect(src).not.toMatch(/authorized = !!user/);
  });

  it("the page tells a signed-in non-admin it needs admin access, not to sign in", () => {
    const hook = read("src/hooks/useCostAnalytics.ts");
    expect(hook).toMatch(/status === 403[^?]*\?\s*'Admin access required to see cost data\.'/);
  });

  it("the deploy probe proves strangers are refused by both on the live project", () => {
    const wf = read(".github/workflows/deploy-functions.yml");
    expect(wf).toMatch(/expect_refused prompt-studio 401/);
    expect(wf).toMatch(/expect_refused get-cost-analytics 401/);
  });
});
