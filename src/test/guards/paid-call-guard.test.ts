// Guard: a function that spends money per call answers only a real caller, and only
// so often (3 Nov 2026). An outside scan found elevenlabs-tts generating audio for a
// request with no Authorization header at all (confirmed live: HTTP 200 with audio),
// so a loop could run up the ElevenLabs bill or use up the month's characters before
// real children heard a word. Code: supabase/functions/_shared/paidCallGuard.ts.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MAX_BODY_BYTES,
  GUEST_PASS_HEADER,
  PAID_CALL_LIMITS,
  type PaidCallDeps,
  chargePaidCall,
  guardPaidCall,
  identifyPaidCaller,
  issueGuestPass,
} from "../../../supabase/functions/_shared/paidCallGuard";
import { GUEST_PAID_FUNCTIONS, withGuestPass } from "@/lib/guestPass";

const root = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const ANON = `${b64({ alg: "HS256" })}.${b64({ role: "anon", ref: "proj" })}.sig`;
const OTHER_ANON = `${b64({ alg: "HS256" })}.${b64({ role: "anon", ref: "other" })}.sig2`;
const SERVICE = "service-role-secret";
const USER_TOKEN = `${b64({ alg: "HS256" })}.${b64({ role: "authenticated", sub: "u1" })}.real`;

/** In-memory twin of public.paid_call_hit: all-or-nothing, a refused call is not counted. */
function fakeDeps(now = 1_800_000_000): PaidCallDeps & { counts: Map<string, number> } {
  const counts = new Map<string, number>();
  return {
    counts,
    anonKey: ANON,
    serviceKey: SERVICE,
    nowSeconds: () => now,
    getUserId: async (t) => (t === USER_TOKEN ? "u1" : null),
    hit: async (buckets, windows, limits) => {
      const keys = buckets.map((b, i) => `${b}@${Math.floor(now / windows[i])}`);
      const full = keys.findIndex((k, i) => (counts.get(k) ?? 0) + 1 > limits[i]);
      if (full >= 0) return buckets[full];
      keys.forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1));
      return null;
    },
  };
}

/** A paid function as the real ones are built: guard first, then the (mocked) TTS call. */
async function paidFunction(req: Request, deps: PaidCallDeps, tts: () => Promise<void>) {
  const { refusal } = await guardPaidCall(req, "elevenlabs-tts", deps);
  if (refusal) return refusal;
  await tts();
  return new Response("audio", { status: 200 });
}

const post = (headers: Record<string, string> = {}) =>
  new Request("https://x.supabase.co/functions/v1/elevenlabs-tts", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
    body: JSON.stringify({ text: "a" }),
  });

describe("who may make a paid call", () => {
  it("no Authorization header → 401, and ElevenLabs is never called", async () => {
    const tts = vi.fn(async () => {});
    const res = await paidFunction(post(), fakeDeps(), tts);
    expect(res.status).toBe(401);
    expect(tts).not.toHaveBeenCalled();
  });

  it("the public anon key alone (or any anon-role JWT) → 401", async () => {
    for (const t of [ANON, OTHER_ANON]) {
      const tts = vi.fn(async () => {});
      const res = await paidFunction(post({ Authorization: `Bearer ${t}`, apikey: ANON }), fakeDeps(), tts);
      expect(res.status).toBe(401);
      expect(tts).not.toHaveBeenCalled();
    }
  });

  it("a token Supabase auth does not recognise → 401", async () => {
    const tts = vi.fn(async () => {});
    const forged = `${b64({ alg: "HS256" })}.${b64({ role: "authenticated", sub: "u1" })}.forged`;
    expect((await paidFunction(post({ Authorization: `Bearer ${forged}` }), fakeDeps(), tts)).status).toBe(401);
    expect(tts).not.toHaveBeenCalled();
  });

  it("a signed-in user under the limit reaches TTS once and is charged to their own buckets", async () => {
    const deps = fakeDeps();
    const tts = vi.fn(async () => {});
    const res = await paidFunction(post({ Authorization: `Bearer ${USER_TOKEN}` }), deps, tts);
    expect(res.status).toBe(200);
    expect(tts).toHaveBeenCalledTimes(1);
    expect([...deps.counts.keys()].some((k) => k.startsWith("user:u1:elevenlabs-tts|600@"))).toBe(true);
    expect([...deps.counts.keys()].some((k) => k.startsWith("all:elevenlabs-tts|86400@"))).toBe(true);
  });

  it("over the per-user limit → a calm 429 with Retry-After, and TTS is not called", async () => {
    const deps = fakeDeps();
    const tts = vi.fn(async () => {});
    const max = PAID_CALL_LIMITS.user[0].max;
    for (let i = 0; i < max; i++) {
      expect((await paidFunction(post({ Authorization: `Bearer ${USER_TOKEN}` }), deps, tts)).status).toBe(200);
    }
    const res = await paidFunction(post({ Authorization: `Bearer ${USER_TOKEN}` }), deps, tts);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("600");
    expect((await res.json()).code).toBe("RATE_LIMITED");
    expect(tts).toHaveBeenCalledTimes(max);
  });

  it("the daily ceiling per function stops everyone together", async () => {
    const deps = fakeDeps();
    const key = `all:elevenlabs-tts|86400@${Math.floor(1_800_000_000 / 86400)}`;
    deps.counts.set(key, PAID_CALL_LIMITS.allPerFunction.max);
    const tts = vi.fn(async () => {});
    expect((await paidFunction(post({ Authorization: `Bearer ${USER_TOKEN}` }), deps, tts)).status).toBe(429);
    expect(tts).not.toHaveBeenCalled();
  });

  it("a guest with a valid signed pass gets through; a tampered or expired pass does not", async () => {
    const deps = fakeDeps();
    const { pass } = await issueGuestPass(SERVICE, 1_800_000_000);
    const tts = vi.fn(async () => {});
    const ok = await paidFunction(post({ Authorization: `Bearer ${ANON}`, [GUEST_PASS_HEADER]: pass }), deps, tts);
    expect(ok.status).toBe(200);
    expect([...deps.counts.keys()].some((k) => k.startsWith("guestip:"))).toBe(true);

    const tampered = pass.replace(/^v1\.(.)/, (_m, c) => `v1.${c === "A" ? "B" : "A"}`);
    expect((await paidFunction(post({ [GUEST_PASS_HEADER]: tampered }), deps, tts)).status).toBe(401);
    const later = fakeDeps(1_800_000_000 + 3 * 3600);
    expect((await paidFunction(post({ [GUEST_PASS_HEADER]: pass }), later, tts)).status).toBe(401);
    const otherKey = await issueGuestPass("some-other-secret", 1_800_000_000);
    expect((await paidFunction(post({ [GUEST_PASS_HEADER]: otherKey.pass }), deps, tts)).status).toBe(401);
    expect(tts).toHaveBeenCalledTimes(1);
  });

  it("admin-only functions refuse guests and ordinary users; the service role is never charged", async () => {
    const deps = fakeDeps();
    const { pass } = await issueGuestPass(SERVICE, 1_800_000_000);
    expect(await identifyPaidCaller(post({ [GUEST_PASS_HEADER]: pass }), deps, { adminUserIds: ["admin"] })).toHaveProperty("status", 401);
    expect(await identifyPaidCaller(post({ Authorization: `Bearer ${USER_TOKEN}` }), deps, { adminUserIds: [] })).toHaveProperty("status", 403);
    const svc = await identifyPaidCaller(post({ Authorization: `Bearer ${SERVICE}` }), deps, { adminUserIds: [] });
    expect(svc).toMatchObject({ kind: "service" });
    expect(await chargePaidCall(svc as never, "x", deps)).toBeNull();
    expect(deps.counts.size).toBe(0);
  });
});

describe("story generation and the expensive functions", () => {
  const user = () => post({ Authorization: `Bearer ${USER_TOKEN}` });
  const downDeps = () => ({ ...fakeDeps(), hit: async () => { throw new Error("db down"); } });

  it("story generation fails closed when the counter is unreachable (503); narration stays open", async () => {
    const story = await guardPaidCall(user(), "generate-adaptive-story", downDeps(), { failClosed: true });
    expect(story.refusal?.status).toBe(503);
    const tts = await guardPaidCall(user(), "elevenlabs-tts", downDeps());
    expect(tts.refusal).toBeNull();
    expect(read("supabase/functions/generate-adaptive-story/index.ts")).toMatch(/paidCallRefusal\(req, 'generate-adaptive-story', corsHeaders, \{ failClosed: true \}\)/);
    expect(read("supabase/functions/generate-adaptive-story/index.ts")).not.toMatch(/checkRateLimit/);
  });

  it("a guest gets the sample story but is stopped after its story allowance; no-login is 401", async () => {
    const deps = fakeDeps();
    const { pass } = await issueGuestPass(SERVICE, 1_800_000_000);
    const guest = () => post({ Authorization: `Bearer ${ANON}`, [GUEST_PASS_HEADER]: pass });
    const max = PAID_CALL_LIMITS.guest[0].max;
    const storyMax = (await import("../../../supabase/functions/_shared/paidCallGuard")).FUNCTION_LIMITS["generate-adaptive-story"].guest[0].max;
    expect(storyMax).toBeLessThan(max);
    for (let i = 0; i < storyMax; i++) expect((await guardPaidCall(guest(), "generate-adaptive-story", deps)).refusal).toBeNull();
    expect((await guardPaidCall(guest(), "generate-adaptive-story", deps)).refusal?.status).toBe(429);
    // Its own bucket: the story allowance does not use up the reading voice.
    expect((await guardPaidCall(guest(), "elevenlabs-tts", deps)).refusal).toBeNull();
    expect((await guardPaidCall(post(), "runware-generate-image", deps)).refusal?.status).toBe(401);
  });

  it("a guest pass does not open the signed-in-only live voice", async () => {
    const { pass } = await issueGuestPass(SERVICE, 1_800_000_000);
    const r = await guardPaidCall(post({ [GUEST_PASS_HEADER]: pass }), "openai-realtime", fakeDeps());
    expect(r.refusal?.status).toBe(401);
  });
});

describe("request size", () => {
  it("a body over the cap is refused before any auth or paid work (413); voice-to-text allows recordings", async () => {
    const tts = vi.fn(async () => {});
    const big = post({ Authorization: `Bearer ${USER_TOKEN}`, "content-length": String(DEFAULT_MAX_BODY_BYTES + 1) });
    expect((await paidFunction(big, fakeDeps(), tts)).status).toBe(413);
    expect(tts).not.toHaveBeenCalled();
    expect(read("supabase/functions/voice-to-text/index.ts")).toMatch(/maxBodyBytes:\s*8 \* 1024 \* 1024/);
    expect(read("supabase/functions/elevenlabs-tts-smart/index.ts")).toMatch(/String\(rawText\)\.slice\(0, TTS_MAX_CHARACTERS\)/);
  });
});

describe("every paid function is wired to the guard", () => {
  const guestFns = [...GUEST_PAID_FUNCTIONS];
  const adminFns = ["elevenlabs-dictionary-manager", "generate-fallback-images", "unified-debug-service", "system-diagnostics"];
  const signedInFns = ["openai-realtime"];

  it("guards before the paid API, and lets the guest pass header through CORS", () => {
    expect(guestFns.length).toBeGreaterThan(0);
    for (const fn of [...guestFns, ...adminFns, ...signedInFns]) {
      const src = read(`supabase/functions/${fn}/index.ts`);
      expect(src, fn).toMatch(/from ["']\.\.\/_shared\/paidCallGuardDeno\.ts["']/);
      const gate = Math.max(src.indexOf("identifyCaller(req"), src.indexOf("paidCallRefusal(req"));
      expect(gate, `${fn} calls the guard`).toBeGreaterThan(0);
      // The read-only credit check (/v1/user/subscription, service role only) is free.
      // Request entry: the handler (helpers above it are only reached through it).
      const entry = src.search(/const handleRequest = async|^(?:Deno\.)?serve\(/m);
      expect(entry, `${fn} has a request handler`).toBeGreaterThan(0);
      expect(gate, `${fn} guards inside its handler`).toBeGreaterThan(entry);
      const after = src.slice(entry);
      const paidRel = after.search(/fetch\(\s*[`'"]https:\/\/api\.(?!elevenlabs\.io\/v1\/user\/)|chatCompletionWithFallback\(|translateSingleText\(|detectIfEnglish\(/);
      if (paidRel > 0) expect(gate, `${fn} guards before its paid call`).toBeLessThan(entry + paidRel);
      if (guestFns.includes(fn as never) && /Access-Control-Allow-Headers['"]?\s*:/.test(src)) {
        expect(src, `${fn} CORS allows ${GUEST_PASS_HEADER}`).toMatch(/Access-Control-Allow-Headers['"]?\s*:\s*['"][^'"]*x-t2r-guest/);
      }
    }
    for (const fn of adminFns) expect(read(`supabase/functions/${fn}/index.ts`)).toMatch(/adminUserIds:\s*adminUserIds\(\)/);
  });

  it("the TTS functions charge only on a cache miss, never on cached audio", () => {
    for (const fn of ["elevenlabs-tts", "elevenlabs-tts-smart"]) {
      const src = read(`supabase/functions/${fn}/index.ts`);
      const identify = src.indexOf("identifyCaller(req)");
      const cache = src.indexOf("await getCachedAudio(");
      const charge = src.indexOf("chargeCall(caller");
      const paid = src.search(/fetch\(\s*(apiUrl|`https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech)/);
      expect(identify).toBeGreaterThan(0);
      expect(identify).toBeLessThan(cache);
      expect(cache).toBeLessThan(charge);
      expect(charge).toBeLessThan(paid);
    }
  });

  it("the counter is an additive migration callable only by the service role; guest-pass is deployed open", () => {
    const sql = read("supabase/migrations/20261103120000_paid_call_rate.sql");
    expect(sql).toMatch(/create table if not exists public\.paid_call_rate/);
    expect(sql).toMatch(/revoke all on function public\.paid_call_hit\(text\[\], integer\[\], integer\[\]\) from public, anon, authenticated/);
    expect(sql).not.toMatch(/\bdrop\s+table\b|\bdelete\s+from\s+public\.(?!paid_call_rate)/i);
    expect(read("supabase/config.toml")).toMatch(/\[functions\.guest-pass\]\s*\nverify_jwt = false/);
  });

  it("no app code calls a paid function with a raw fetch that skips the session", () => {
    const src = read("src/components/InteractiveWord.tsx");
    expect(src).not.toMatch(/fetch\(\s*['"`]https:\/\/[^'"`]+\/functions\/v1\/elevenlabs-tts/);
  });
});

describe("the app sends a guest pass only when signed out", () => {
  const URL_TTS = "https://p.supabase.co/functions/v1/elevenlabs-tts";
  function harness() {
    const calls: { url: string; headers: Headers }[] = [];
    const base = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, headers: new Headers(init?.headers) });
      if (url.endsWith("/guest-pass")) return new Response(JSON.stringify({ pass: "v1.g.9999999999.s", expires_at: 9999999999 }), { status: 200 });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    return { calls, f: withGuestPass(base, "https://p.supabase.co", ANON) };
  }

  it("signed out: the paid call carries the pass", async () => {
    const { calls, f } = harness();
    await f(URL_TTS, { method: "POST", headers: { Authorization: `Bearer ${ANON}` } });
    const tts = calls.find((c) => c.url === URL_TTS)!;
    expect(tts.headers.get(GUEST_PASS_HEADER)).toBe("v1.g.9999999999.s");
  });

  it("signed in: the session token goes as is, with no pass and no guest-pass fetch", async () => {
    const { calls, f } = harness();
    await f(URL_TTS, { method: "POST", headers: { Authorization: `Bearer ${USER_TOKEN}` } });
    expect(calls.map((c) => c.url)).toEqual([URL_TTS]);
    expect(calls[0].headers.get("Authorization")).toBe(`Bearer ${USER_TOKEN}`);
    expect(calls[0].headers.get(GUEST_PASS_HEADER)).toBeNull();
  });
});
