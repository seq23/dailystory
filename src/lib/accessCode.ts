import i18n from "@/i18n/config";
import { uiText } from "@/i18n/uiText";
// Client side of access-code trials. The server (create-checkout) is the authority:
// it normalises and validates the code and sets the trial. The client only sends
// what the parent typed and shows the server's plain message when it is refused.
import { supabase } from "@/integrations/supabase/client";
import { ACCESS_CODE_MESSAGES, ACCESS_CODE_UNAVAILABLE, normalizeAccessCode } from "../../supabase/functions/_shared/accessCodeRules";
export {
  ACCESS_CODE_MESSAGES,
  INVALID_ACCESS_CODE,
  normalizeAccessCode,
} from "../../supabase/functions/_shared/accessCodeRules";

/** Shown for any payment failure we can't explain in plain words. Never an env var or stack. */
export const PAYMENT_TROUBLE =
  "Payments are having a problem right now. Your free stories still work. Please try again in a minute.";

const PLAIN_SERVER_MESSAGES = new Set<string>([
  ...Object.values(ACCESS_CODE_MESSAGES),
  "You already have an active premium subscription. No payment needed!",
]);

/** A server message a parent may see as-is, or PAYMENT_TROUBLE for anything technical. */
export function parentSafeMessage(raw: string | null | undefined): string {
  if (!raw) return PAYMENT_TROUBLE;
  return PLAIN_SERVER_MESSAGES.has(raw) ? raw : PAYMENT_TROUBLE;
}

/** Fired after Premium changes (a code redeemed), so every status hook re-reads at once. */
export const SUBSCRIPTION_CHANGED_EVENT = "subscription-changed";

/** ?code=HOMESCHOOL15 on any link pre-fills the "Have a code?" box. */
export function codeFromUrl(search: string = typeof window !== "undefined" ? window.location.search : ""): string {
  try {
    return normalizeAccessCode(new URLSearchParams(search).get("code") ?? "");
  } catch {
    return "";
  }
}

export type RedeemResult =
  | { ok: true; premiumUntil: string | null; message: string; alreadyPremium?: boolean }
  | { ok: false; message: string };

/**
 * Turn a code into Premium now (server: redeem-access-code). With no code, the
 * server uses the one saved on the account at sign-up.
 */
export async function redeemAccessCode(code?: string): Promise<RedeemResult> {
  const typed = (code ?? "").trim();
  try {
    const { data, error } = await supabase.functions.invoke("redeem-access-code", {
      body: typed ? { accessCode: typed } : {},
    });
    if (error) {
      const refusedCode = await refusalCode(error, data);
      // One box for every code: a free-access discount code (discount_codes) is not an
      // access code, so a refusal as INVALID tries the discount path before saying no.
      if (refusedCode === "INVALID_ACCESS_CODE" && typed) {
        const viaDiscount = await applyDiscountCode(typed);
        if (viaDiscount) return viaDiscount;
      }
      return { ok: false, message: (await checkoutErrorMessage(error, data)) ?? (data as { message?: string } | null)?.message ?? ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] };
    }
    const body = (data ?? {}) as { activated?: boolean; alreadyPremium?: boolean; premium_until?: string | null; message?: string };
    if (body.activated || body.alreadyPremium) {
      if (typeof window !== "undefined") window.dispatchEvent(new Event(SUBSCRIPTION_CHANGED_EVENT));
      return { ok: true, premiumUntil: body.premium_until ?? null, message: body.message ?? "Premium is on.", alreadyPremium: body.alreadyPremium };
    }
    return { ok: false, message: body.message ?? ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] };
  } catch {
    return { ok: false, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] };
  }
}

async function refusalCode(error: unknown, data: unknown): Promise<string | null> {
  const fromData = (data as { error?: string } | null)?.error;
  if (fromData) return fromData;
  const ctx = (error as { context?: { clone?: () => { json: () => Promise<unknown> } } } | null)?.context;
  try {
    const parsed = (await ctx?.clone?.().json()) as { error?: string } | undefined;
    return parsed?.error ?? null;
  } catch {
    return null;
  }
}

async function applyDiscountCode(code: string): Promise<RedeemResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke("apply-discount-code", {
      body: { discountCode: normalizeAccessCode(code) },
    });
    const body = (data ?? {}) as { activated?: boolean; end_date?: string; message?: string };
    if (error || !body.activated) return null;
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SUBSCRIPTION_CHANGED_EVENT));
    return { ok: true, premiumUntil: body.end_date ?? null, message: body.message ?? "Premium is on." };
  } catch {
    return null;
  }
}

/** Body for create-checkout: the code is sent only when the parent typed one. */
export function checkoutBody(plan: "monthly" | "annual", accessCode?: string): { plan: string; accessCode?: string } {
  const typed = (accessCode ?? "").trim();
  return typed ? { plan, accessCode: typed } : { plan };
}

/**
 * The parent-facing message from a failed create-checkout call, or null.
 * supabase.functions.invoke puts a non-2xx body on error.context (a Response).
 */
export async function checkoutErrorMessage(error: unknown, data?: unknown): Promise<string | null> {
  const body = data as { error?: string; message?: string } | null | undefined;
  if (body?.message && body?.error && /^[A-Z_]+$/.test(body.error)) return body.message;
  if (body?.error) return parentSafeMessage(body.error);
  const ctx = (error as { context?: { clone?: () => { json: () => Promise<unknown> }; json?: () => Promise<unknown> } } | null)
    ?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const parsed = (await (ctx.clone ? ctx.clone().json() : ctx.json())) as { error?: string; message?: string } | null;
      // redeem-access-code answers { error: "CODE_NAME", message: "plain words" }
      if (parsed?.message && parsed?.error && /^[A-Z_]+$/.test(parsed.error)) return parsed.message;
      if (parsed?.error) return parentSafeMessage(parsed.error);
    } catch {
      /* not JSON */
    }
  }
  return null;
}

/** Dates and labels follow the UI language; the server still owns access decisions. */
export function premiumUntilLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return uiText("Premium active until {{date}}", {
    date: date.toLocaleDateString(i18n.resolvedLanguage || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
  });
}
