// Guest pass for the signed-out sample story (3 Nov 2026).
// The paid functions (reading voice, speech-to-text, translation, spelling, quiz) no
// longer answer the public anon key alone: supabase/functions/_shared/paidCallGuard.ts.
// A signed-in child's calls carry the session token as before. A signed-out guest's
// calls get a short-lived signed pass from the guest-pass function, added here as the
// x-t2r-guest header by the Supabase client's fetch (src/integrations/supabase/client.ts).
// Guard: src/test/guards/paid-call-guard.test.ts.

export const GUEST_PASS_HEADER = "x-t2r-guest";

/** Functions a guest may call with a pass. Mirrors identifyPaidCaller's allowGuests callers. */
export const GUEST_PAID_FUNCTIONS = [
  "elevenlabs-tts",
  "elevenlabs-tts-smart",
  "openai-tts",
  "voice-to-text",
  "elevenlabs-agent-signed-url",
  "translate-universal",
  "correct-spelling",
  "generate-quiz",
] as const;

const STORAGE_KEY = "t2r_guest_pass";
const REFRESH_MARGIN_S = 120;

type Pass = { pass: string; exp: number };
let cached: Pass | null = null;
let inflight: Promise<Pass | null> | null = null;

function nowS() {
  return Math.floor(Date.now() / 1000);
}

function readStored(): Pass | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const p = raw ? (JSON.parse(raw) as Pass) : null;
    return p && typeof p.pass === "string" && typeof p.exp === "number" ? p : null;
  } catch {
    return null;
  }
}

export function clearGuestPass() {
  cached = null;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
}

/** The function name when the URL is a paid function a guest may call, else null. */
export function guestPaidFunction(url: string): string | null {
  const m = /\/functions\/v1\/([a-z0-9-]+)/.exec(url);
  return m && (GUEST_PAID_FUNCTIONS as readonly string[]).includes(m[1]) ? m[1] : null;
}

async function getGuestPass(baseFetch: typeof fetch, supabaseUrl: string, anonKey: string): Promise<string | null> {
  const fresh = (p: Pass | null) => !!p && p.exp - REFRESH_MARGIN_S > nowS();
  if (!fresh(cached)) cached = readStored();
  if (fresh(cached)) return cached!.pass;
  inflight ??= (async () => {
    try {
      const r = await baseFetch(`${supabaseUrl}/functions/v1/guest-pass`, {
        method: "POST",
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok) return null;
      const j = await r.json();
      if (typeof j?.pass !== "string" || typeof j?.expires_at !== "number") return null;
      const p = { pass: j.pass, exp: j.expires_at };
      cached = p;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* private mode */ }
      return p;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return (await inflight)?.pass ?? null;
}

/**
 * Wraps fetch: a call to a guest-callable paid function made without a signed-in
 * session (Authorization is the anon key, or missing) gets the guest pass header.
 * A 401 drops the cached pass so the next call takes a new one.
 */
export function withGuestPass(baseFetch: typeof fetch, supabaseUrl: string, anonKey: string): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    if (!guestPaidFunction(url)) return baseFetch(input, init);
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const token = (headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (token && token !== anonKey) return baseFetch(input, init);
    const pass = await getGuestPass(baseFetch, supabaseUrl, anonKey);
    if (pass) headers.set(GUEST_PASS_HEADER, pass);
    if (!headers.has("apikey")) headers.set("apikey", anonKey);
    if (!token) headers.set("Authorization", `Bearer ${anonKey}`);
    const res = await baseFetch(input, { ...init, headers });
    if (res.status === 401) clearGuestPass();
    return res;
  };
}
