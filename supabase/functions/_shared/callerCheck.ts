// Who may make an edge function send email (23 Nov 2026). Pure: no Deno or network
// imports, so the same code runs in the functions and in vitest.
//
// Every function that sends mail or spends paid quota checks its caller first, with the
// check that fits its real caller (supabase/functions/README section "Caller checks",
// guard: src/test/guards/caller-check.test.ts):
//   - a scheduled job (GitHub Actions)  -> cronSecretRefusal: a project secret in a header
//   - a signed-in parent                -> signedInUser (Supabase auth.getUser), then ownership
//   - an admin (or the service key)      -> adminOrCronRefusal (ADMIN_USER_IDS)
//   - a public form                     -> rateRefusal (server-side counters) and a fixed recipient
// verify_jwt in config.toml is not a check: the anon key is public.

/** public.paid_call_hit: null = allowed and counted; else the first full bucket. Throws when unreachable. */
export type RateHit = (buckets: string[], windows: number[], limits: number[]) => Promise<string | null>;

/** Supabase auth.getUser(token): the user, or null for no user (anon key, expired, revoked). */
/** A signed-in account. emailConfirmed: the account's email was proven (auth email_confirmed_at). */
export type CallerUser = { id: string; email: string | null; emailConfirmed?: boolean };
export type GetUser = (token: string) => Promise<CallerUser | null>;

/** Header the scheduled ops reports (traffic-alert, cost-report) send OPS_CRON_SECRET in. */
export const OPS_SECRET_HEADER = "x-ops-secret";

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

/** Compare two secrets in time that does not depend on where they differ. Empty never matches. */
export function sameSecret(given: string, expected: string): boolean {
  if (!given || !expected) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  const n = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < n; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export function bearerToken(req: Request): string {
  return (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

export interface CronSecret {
  /** Request header the scheduled caller sends, e.g. x-ops-secret. */
  header: string;
  /** Name of the project secret, for the NAMED STOP. */
  name: string;
  /** Its value (Deno.env.get(name)); empty or undefined when it is not set. */
  value: string | undefined;
}

/**
 * A scheduled caller's secret. null = go ahead. A missing project secret refuses every
 * call (503, NAMED STOP in the logs): an unset secret never means "open".
 */
export function cronSecretRefusal(req: Request, secret: CronSecret, cors: Record<string, string> = {}): Response | null {
  if (!secret.value) {
    const stop = `NAMED STOP ${secret.name}: the secret is not set on the project; nothing runs.`;
    console.error(`[caller-check] ${stop}`);
    return json(503, { error: "not configured", stop }, cors);
  }
  if (!sameSecret(req.headers.get(secret.header) ?? "", secret.value)) return json(403, { error: "forbidden" }, cors);
  return null;
}

/** The signed-in user behind the request, or the 401 to return. The anon key is not a user. */
export async function signedInUser(
  req: Request,
  getUser: GetUser,
  cors: Record<string, string> = {},
): Promise<CallerUser | Response> {
  const token = bearerToken(req);
  if (!token) return json(401, { error: "Please sign in.", code: "sign_in_required" }, cors);
  let user: CallerUser | null = null;
  try {
    user = await getUser(token);
  } catch (e) {
    // Auth unreachable: unknown is a refusal, never a pass.
    console.error(`[caller-check] AUTH_UNAVAILABLE: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "Sign-in check is unavailable. Please try again shortly." }, cors);
  }
  return user ? user : json(401, { error: "Please sign in.", code: "sign_in_required" }, cors);
}

/**
 * An admin (ADMIN_USER_IDS) or, when given, the scheduled caller's secret or the project's
 * service key as the bearer (both compared in constant time). null = go ahead.
 * An empty ADMIN_USER_IDS admits no one.
 */
export async function adminOrCronRefusal(
  req: Request,
  opts: { adminIds: string[]; getUser: GetUser; cron?: CronSecret; serviceKey?: string; cors?: Record<string, string> },
): Promise<{ by: "admin" | "cron" | "service"; userId: string | null; refused: null } | { by: null; userId: null; refused: Response }> {
  const cors = opts.cors ?? {};
  if (opts.cron && req.headers.has(opts.cron.header)) {
    const refused = cronSecretRefusal(req, opts.cron, cors);
    return refused ? { by: null, userId: null, refused } : { by: "cron", userId: null, refused: null };
  }
  if (opts.serviceKey && sameSecret(bearerToken(req), opts.serviceKey)) return { by: "service", userId: null, refused: null };
  const user = await signedInUser(req, opts.getUser, cors);
  if (user instanceof Response) return { by: null, userId: null, refused: user };
  if (!opts.adminIds.includes(user.id)) {
    return { by: null, userId: null, refused: json(403, { error: "Admin access required", code: "admin_required" }, cors) };
  }
  return { by: "admin", userId: user.id, refused: null };
}

export interface RateWindow {
  bucket: string;
  window: number;
  max: number;
}

/**
 * Count one call in every window, all or nothing (public.paid_call_hit). null = go ahead;
 * 429 when a window is full; 503 when the counter cannot be reached (fail closed: an
 * outage never means unlimited mail).
 */
export async function rateRefusal(
  hit: RateHit,
  windows: RateWindow[],
  what: string,
  cors: Record<string, string> = {},
): Promise<Response | null> {
  if (windows.length === 0) throw new Error("rateRefusal: no windows");
  let over: string | null;
  try {
    over = await hit(
      windows.map((w) => `${w.bucket}|${w.window}`),
      windows.map((w) => w.window),
      windows.map((w) => w.max),
    );
  } catch (e) {
    console.error(`[caller-check] RATE_CHECK_UNAVAILABLE ${what}: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "Please try again in a few minutes.", code: "RATE_CHECK_UNAVAILABLE" }, { ...cors, "Retry-After": "60" });
  }
  if (!over) return null;
  const windowSec = Number(over.split("|").pop()) || 600;
  const retry = String(Math.min(windowSec, 3600));
  console.warn(`[caller-check] RATE_LIMITED ${what} bucket=${over.split(":")[0]} window=${windowSec}s`);
  return json(429, { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" }, { ...cors, "Retry-After": retry });
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function adminIdsFrom(env: string | undefined): string[] {
  return (env || "").split(",").map((s) => s.trim()).filter(Boolean);
}
