// Paid-call guard (3 Nov 2026): who may make a function spend money, and how often.
//
// An outside scan found elevenlabs-tts answering anyone, with no login and no limit:
// a loop with the public anon key could run up the ElevenLabs bill or use up the
// month's characters before real children heard a word. Every function that pays
// per call (narration, speech-to-text, translation, spelling, quiz) now:
//
//   1. identifyPaidCaller: a signed-in user (JWT checked with auth.getUser), a guest
//      holding a short-lived signed guest pass (issued by the guest-pass function to
//      the signed-out sample story), or the service role. The anon key alone is not a
//      caller: 401.
//   2. chargePaidCall, only when it is about to call the paid API (a cache hit is
//      never charged): per user, per guest pass and per guest IP, and a daily ceiling
//      per function across everyone. Over any of them: a calm 429.
//
// Pure (no imports), so vitest loads it. Deno wiring: paidCallGuardDeno.ts.
// Counts: public.paid_call_hit (supabase/migrations/20261103120000_paid_call_rate.sql).
// Guard: src/test/guards/paid-call-guard.test.ts.

export const GUEST_PASS_HEADER = "x-t2r-guest";
export const GUEST_PASS_TTL_SECONDS = 2 * 60 * 60; // the guest sample is a 20-minute session

const TEN_MIN = 600;
const DAY = 86400;

// Usage on 3 Nov 2026 (cost_tracking, 60 days): at most 4 paid narration calls per
// session in any 10 minutes and under 200 paid calls a day in total. A child tapping
// every word of a page makes about 20-40 uncached calls; these limits leave room for
// that and stop a loop within minutes.
export const PAID_CALL_LIMITS = {
  user: [
    { window: TEN_MIN, max: 60 },
    { window: DAY, max: 600 },
  ],
  guest: [
    { window: TEN_MIN, max: 40 },
    { window: DAY, max: 200 },
  ],
  // Several guests behind one school or home network share an IP.
  guestIp: [
    { window: TEN_MIN, max: 150 },
    { window: DAY, max: 1000 },
  ],
  // Across every caller, per function, per day.
  allPerFunction: { window: DAY, max: 5000 },
  // Guest passes handed out per IP per hour (guest-pass function).
  guestPassPerIpHour: 30,
} as const;

type Window = { window: number; max: number };
export type FunctionLimits = { user: readonly Window[]; guest: readonly Window[]; guestIp: readonly Window[]; allPerFunction: Window };

// Functions whose calls cost more, or come in a different rhythm, than a word tap.
// Usage (cost_tracking, 60 days to 3 Nov 2026): at most 142 story calls and 109
// images in a day across everyone, and at most 33 images for one session in a day.
// A story is one call (repairs and hints call it again); an image is one per page.
// The guest sample is one 6-page story with pictures.
export const FUNCTION_LIMITS: Record<string, FunctionLimits> = {
  "generate-adaptive-story": {
    user: [{ window: TEN_MIN, max: 30 }, { window: DAY, max: 150 }],
    guest: [{ window: TEN_MIN, max: 6 }, { window: DAY, max: 12 }],
    guestIp: [{ window: TEN_MIN, max: 30 }, { window: DAY, max: 120 }],
    allPerFunction: { window: DAY, max: 2000 },
  },
  "runware-generate-image": {
    user: [{ window: TEN_MIN, max: 60 }, { window: DAY, max: 400 }],
    guest: [{ window: TEN_MIN, max: 20 }, { window: DAY, max: 40 }],
    guestIp: [{ window: TEN_MIN, max: 80 }, { window: DAY, max: 300 }],
    allPerFunction: { window: DAY, max: 3000 },
  },
  // One live voice conversation per call; signed-in only.
  "openai-realtime": {
    user: [{ window: TEN_MIN, max: 10 }, { window: DAY, max: 40 }],
    guest: [],
    guestIp: [],
    allPerFunction: { window: DAY, max: 500 },
  },
};

export function limitsFor(fn: string): FunctionLimits {
  return FUNCTION_LIMITS[fn] ?? PAID_CALL_LIMITS;
}

export const RATE_LIMITED_MESSAGE = "Reading voice is taking a short rest. Please try again in a few minutes.";
/** The 401 text. Each call site says what the child was trying to do (IdentifyOptions.signInFor). */
export const signInMessage = (signInFor = "to keep going") => `Please sign in ${signInFor}.`;

export type PaidCaller =
  | { kind: "user"; id: string; ip: string }
  | { kind: "guest"; id: string; ip: string }
  | { kind: "service"; ip: string };

export interface PaidCallDeps {
  anonKey: string;
  serviceKey: string;
  /** Validates a user JWT with Supabase auth; null when it is not a real signed-in user. */
  getUserId(token: string): Promise<string | null>;
  /** public.paid_call_hit: null = allowed and counted; else the full bucket. Throws when unreachable. */
  hit(buckets: string[], windows: number[], limits: number[]): Promise<string | null>;
  nowSeconds?(): number;
}

function json(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return (fwd.split(",")[0] ?? "").trim() || "unknown";
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

function bearer(req: Request): string {
  return (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64url(new Uint8Array(sig));
}

/** The signing key for guest passes, derived from the service-role key (never sent anywhere). */
async function guestPassSecret(serviceKey: string): Promise<string> {
  if (!serviceKey) throw new Error("guest pass secret unavailable: SUPABASE_SERVICE_ROLE_KEY missing");
  return hmac(serviceKey, "t2r-guest-pass-v1");
}

export async function sha256Short(text: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return b64url(new Uint8Array(d)).slice(0, 22);
}

export async function issueGuestPass(serviceKey: string, nowSeconds = Math.floor(Date.now() / 1000)): Promise<{ pass: string; expiresAt: number }> {
  const id = b64url(crypto.getRandomValues(new Uint8Array(12)));
  const exp = nowSeconds + GUEST_PASS_TTL_SECONDS;
  const body = `v1.${id}.${exp}`;
  return { pass: `${body}.${await hmac(await guestPassSecret(serviceKey), body)}`, expiresAt: exp };
}

/** The guest id inside a valid, unexpired pass; null otherwise. */
export async function verifyGuestPass(pass: string, serviceKey: string, nowSeconds = Math.floor(Date.now() / 1000)): Promise<string | null> {
  const parts = (pass || "").split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  const [v = "", id = "", expRaw = "", sig = ""] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < nowSeconds || exp > nowSeconds + GUEST_PASS_TTL_SECONDS + 60) return null;
  const want = await hmac(await guestPassSecret(serviceKey), `${v}.${id}.${expRaw}`);
  if (want.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? id : null;
}

/** True when the JWT payload says role "anon" (the public key, or any copy of it). */
function isAnonRoleJwt(token: string): boolean {
  const p = token.split(".")[1];
  if (!p) return false;
  try {
    const payload = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.role === "anon";
  } catch {
    return false;
  }
}

export interface IdentifyOptions {
  /** Signed-out guests with a guest pass may call (the guest sample story). Default true. */
  allowGuests?: boolean;
  /** Only the service role or a user in ADMIN_USER_IDS. */
  adminUserIds?: string[];
  /** Largest request body accepted (Content-Length). Default DEFAULT_MAX_BODY_BYTES. */
  maxBodyBytes?: number;
  /** What the sign-in is for, finishing "Please sign in …", e.g. "to make a new story". */
  signInFor?: string;
  /** When the counter cannot be reached: refuse (503) instead of letting the call through. */
  failClosed?: boolean;
}

/** A page of text is a few KB; 64 KiB leaves room and stops a pasted book. */
export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

/** Who is calling, or the 401/403 Response to return. */
export async function identifyPaidCaller(
  req: Request,
  deps: PaidCallDeps,
  opts: IdentifyOptions = {},
): Promise<PaidCaller | Response> {
  const allowGuests = opts.allowGuests !== false && !opts.adminUserIds;
  const ip = clientIp(req);
  const token = bearer(req);
  const refuse = () => json(401, { success: false, error: signInMessage(opts.signInFor), code: "SIGN_IN_REQUIRED" });

  const maxBody = opts.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const length = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(length) && length > maxBody) {
    return json(413, { success: false, error: "That request is too large.", code: "BODY_TOO_LARGE" });
  }

  if (deps.serviceKey && token === deps.serviceKey) return { kind: "service", ip };

  if (!token || token === deps.anonKey || isAnonRoleJwt(token)) {
    if (!allowGuests) return refuse();
    const id = await verifyGuestPass(req.headers.get(GUEST_PASS_HEADER) || "", deps.serviceKey, deps.nowSeconds?.());
    return id ? { kind: "guest", id, ip } : refuse();
  }

  let userId: string | null = null;
  try {
    userId = await deps.getUserId(token);
  } catch {
    userId = null;
  }
  if (!userId) return refuse();
  if (opts.adminUserIds && !opts.adminUserIds.includes(userId)) {
    return json(403, { success: false, error: "Admin access required", code: "ADMIN_REQUIRED" });
  }
  return { kind: "user", id: userId, ip };
}

/** Charge one paid call. null = go ahead; a Response = return it (429). */
export async function chargePaidCall(
  caller: PaidCaller,
  fn: string,
  deps: PaidCallDeps,
  extra: Record<string, unknown> = {},
  failClosed = false,
): Promise<Response | null> {
  if (caller.kind === "service") return null;
  const L = limitsFor(fn);
  const buckets: string[] = [];
  const windows: number[] = [];
  const limits: number[] = [];
  const add = (b: string, w: number, m: number) => { buckets.push(`${b}|${w}`); windows.push(w); limits.push(m); };

  if (caller.kind === "guest" && L.guest.length === 0) {
    return json(401, { success: false, error: signInMessage(), code: "SIGN_IN_REQUIRED" });
  }
  if (caller.kind === "user") {
    for (const l of L.user) add(`user:${caller.id}:${fn}`, l.window, l.max);
  } else {
    for (const l of L.guest) add(`guest:${caller.id}:${fn}`, l.window, l.max);
    const ipHash = await sha256Short(caller.ip);
    for (const l of L.guestIp) add(`guestip:${ipHash}:${fn}`, l.window, l.max);
  }
  add(`all:${fn}`, L.allPerFunction.window, L.allPerFunction.max);

  let over: string | null;
  try {
    over = await deps.hit(buckets, windows, limits);
  } catch (e) {
    // The caller is already a real user or guest; a counter outage must not silence
    // a child's reading voice. Named in the logs so it is seen.
    console.error(`[paid-call-guard] RATE_CHECK_UNAVAILABLE ${fn}: ${e instanceof Error ? e.message : e}`);
    if (failClosed) {
      return json(503, { success: false, error: RATE_LIMITED_MESSAGE, code: "RATE_CHECK_UNAVAILABLE", retry_after: 60, ...extra }, { "Retry-After": "60" });
    }
    return null;
  }
  if (!over) return null;
  const windowSec = Number(over.split("|").pop()) || TEN_MIN;
  const retryAfter = windowSec >= DAY ? 3600 : windowSec;
  console.warn(`[paid-call-guard] RATE_LIMITED ${fn} bucket=${over.split(":")[0]} window=${windowSec}s`);
  return json(
    429,
    { success: false, error: RATE_LIMITED_MESSAGE, code: "RATE_LIMITED", retry_after: retryAfter, ...extra },
    { "Retry-After": String(retryAfter) },
  );
}

/** Both steps at once, for functions with no free cache path. */
export async function guardPaidCall(
  req: Request,
  fn: string,
  deps: PaidCallDeps,
  opts: IdentifyOptions = {},
): Promise<{ caller: PaidCaller; refusal: null } | { caller: null; refusal: Response }> {
  const caller = await identifyPaidCaller(req, deps, opts);
  if (caller instanceof Response) return { caller: null, refusal: caller };
  const refusal = await chargePaidCall(caller, fn, deps, {}, opts.failClosed === true);
  return refusal ? { caller: null, refusal } : { caller, refusal: null };
}
