// Redeeming a free-Premium discount code (discount_codes), for activate-discount-code and
// apply-discount-code (security audit B, 27 Nov 2026). Pure: no Deno or URL imports, so the
// functions and vitest run the same code. Wiring: ./discountRedeemDeno.ts.
//
//   - The code is the one the caller typed (or, for apply-discount-code, the one saved on the
//     account). There is no default code: an empty code is a 400.
//   - Guessing is limited per account and per network before any lookup (rateRefusal, the
//     shared counter public.paid_call_hit). The counter down is a 503, never unlimited tries.
//   - The redemption itself is public.redeem_discount_code: one per account, a use taken only
//     while uses remain, and Premium written, all in one transaction (migration 20261127140000).
//   - A wrong code and a used-up code get the same answer, so a script learns nothing.
// Tests: src/test/edge/discount-and-billing.test.ts.
import { json, rateRefusal, type RateHit, type RateWindow } from "./callerCheck.ts";
import { normalizeAccessCode } from "./accessCodeRules.ts";
import { readJsonCapped } from "./paidCallGuard.ts";

const DAY = 86400;

/** Code tries a day. A parent types a code once or twice; a script guessing needs thousands. */
export const CODE_GUESS_LIMITS = {
  perAccountDay: 10,
  // A school or co-op network may hold many families redeeming the same day.
  perNetworkDay: 60,
} as const;

/**
 * The windows for one code try. networkKey is a hash of cf-connecting-ip (clientIp), which the
 * caller cannot forge, so a stranger elsewhere can never fill another family's network bucket.
 */
export function codeGuessWindows(fn: string, userId: string, networkKey: string): RateWindow[] {
  return [
    { bucket: `codeguess:user:${userId}:${fn}`, window: DAY, max: CODE_GUESS_LIMITS.perAccountDay },
    { bucket: `codeguess:net:${networkKey}:${fn}`, window: DAY, max: CODE_GUESS_LIMITS.perNetworkDay },
  ];
}

export const TOO_MANY_TRIES_MESSAGE = "Too many code tries today. Please try again tomorrow.";

/**
 * Count one code try for this account and network. null = go ahead; else the 429 (full) or
 * 503 (counter unreachable: fail closed) to return, with a plain message the app shows as is
 * (src/lib/accessCode.ts shows `message` when `error` is an ALL_CAPS code).
 */
export async function codeGuessRefusal(
  hit: RateHit,
  fn: string,
  userId: string,
  networkKey: string,
  cors: Record<string, string> = {},
): Promise<Response | null> {
  const refused = await rateRefusal(hit, codeGuessWindows(fn, userId, networkKey), fn, cors);
  if (!refused) return null;
  const headers: Record<string, string> = { ...cors };
  const retry = refused.headers.get("Retry-After");
  if (retry) headers["Retry-After"] = retry;
  return refused.status === 429
    ? json(429, { success: false, activated: false, error: "TOO_MANY_TRIES", message: TOO_MANY_TRIES_MESSAGE }, headers)
    : json(503, { success: false, activated: false, error: "ACCESS_CODE_UNAVAILABLE", message: DISCOUNT_MESSAGES.unavailable }, headers);
}

export type RedeemStatus = "granted" | "already" | "invalid" | "exhausted" | "account_mismatch";

export interface RedeemRow {
  status: RedeemStatus;
  code: string | null;
  duration_days: number | null;
  description: string | null;
  premium_until: string | null;
}

export interface DiscountRedeemDeps {
  /** The signed-in account behind the Authorization header; null = not signed in. Throws when auth is unreachable. */
  getUser(authHeader: string): Promise<{ id: string; email: string } | null>;
  hit: RateHit;
  /** sha256Short(clientIp(req)). */
  networkKey: string;
  /** The code saved on the account at sign-up (subscribers.discount_code_pending). Throws when unreadable. */
  pendingCode?(userId: string): Promise<string | null>;
  /** public.redeem_discount_code. Throws when the database cannot be reached. */
  redeem(userId: string, code: string): Promise<RedeemRow>;
}

export const DISCOUNT_MESSAGES = {
  noCode: "Type your code first.",
  invalid: "Invalid discount code",
  already: "Discount code already activated",
  unavailable: "We couldn't check that code just now. Please try again in a few minutes.",
  mismatch: "We couldn't add the code to this account. Please contact support.",
} as const;

export async function handleDiscountRedeem(
  req: Request,
  deps: DiscountRedeemDeps,
  opts: { fn: string; usePendingCode: boolean },
  cors: Record<string, string> = {},
): Promise<Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { success: false, activated: false, message: "Authorization required" }, cors);

  let user: { id: string; email: string } | null;
  try {
    user = await deps.getUser(authHeader);
  } catch (e) {
    console.error(`[${opts.fn}] AUTH_UNAVAILABLE: ${e instanceof Error ? e.message : e}`);
    return json(503, { success: false, activated: false, message: DISCOUNT_MESSAGES.unavailable }, cors);
  }
  if (!user) return json(401, { success: false, activated: false, message: "Invalid authentication" }, cors);

  const read = await readJsonCapped(req, 4096);
  if (read instanceof Response) return withCors(read, cors);
  const body = read.body as { discountCode?: unknown } | null;
  let code = normalizeAccessCode(body?.discountCode);

  if (!code && opts.usePendingCode && deps.pendingCode) {
    try {
      code = normalizeAccessCode(await deps.pendingCode(user.id));
    } catch (e) {
      console.error(`[${opts.fn}] PENDING_CODE_UNREADABLE: ${e instanceof Error ? e.message : e}`);
      return json(503, { success: false, activated: false, message: DISCOUNT_MESSAGES.unavailable }, cors);
    }
  }
  if (!code) return json(400, { success: false, activated: false, error: "NO_CODE", message: DISCOUNT_MESSAGES.noCode }, cors);

  const limited = await codeGuessRefusal(deps.hit, opts.fn, user.id, deps.networkKey, cors);
  if (limited) return limited;

  let row: RedeemRow;
  try {
    row = await deps.redeem(user.id, code);
  } catch (e) {
    console.error(`[${opts.fn}] REDEEM_UNAVAILABLE: ${e instanceof Error ? e.message : e}`);
    return json(503, { success: false, activated: false, message: DISCOUNT_MESSAGES.unavailable }, cors);
  }

  switch (row?.status) {
    case "granted": {
      const end = row.premium_until ?? "";
      console.log(`[${opts.fn}] ${row.code} granted to ${user.id} until ${end}`);
      return json(200, {
        success: true,
        activated: true,
        code: row.code,
        description: row.description,
        duration_days: row.duration_days,
        activation_date: new Date().toISOString(),
        end_date: end,
        expiresAt: end,
        tier: "Premium",
        message: `Welcome! Your ${row.duration_days} days of free premium starts now!`,
      }, cors);
    }
    case "already":
      return json(200, { success: false, activated: false, alreadyActivated: true, message: DISCOUNT_MESSAGES.already }, cors);
    case "invalid":
    case "exhausted":
      return json(400, { success: false, activated: false, error: "INVALID_DISCOUNT_CODE", message: DISCOUNT_MESSAGES.invalid }, cors);
    case "account_mismatch":
      console.error(`[${opts.fn}] ACCOUNT_MISMATCH: the subscriber row for this email is another account's (user ${user.id})`);
      return json(409, { success: false, activated: false, error: "ACCOUNT_MISMATCH", message: DISCOUNT_MESSAGES.mismatch }, cors);
    default:
      // An answer we do not recognise is never a grant.
      console.error(`[${opts.fn}] REDEEM_UNKNOWN_STATUS: ${JSON.stringify(row)}`);
      return json(503, { success: false, activated: false, message: DISCOUNT_MESSAGES.unavailable }, cors);
  }
}

function withCors(res: Response, cors: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) if (!headers.has(k)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}
