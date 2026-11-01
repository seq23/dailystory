// Links in the trial-ending email (supabase/functions/_shared/lifecycleEmail/templates.ts):
//   /?billing=keep    open My Account (Premium simply continues)
//   /?billing=yearly  open My Account and offer the switch to yearly ($99)
//   /?billing=cancel  open My Account and offer Stripe's cancel page
// The intent is kept in sessionStorage so it survives signing in first.
export type BillingIntent = "keep" | "yearly" | "cancel";
const KEY = "t2r.billingIntent";
const VALID: readonly BillingIntent[] = ["keep", "yearly", "cancel"];

export function captureBillingIntent(search: string = typeof window !== "undefined" ? window.location.search : ""): BillingIntent | null {
  const v = new URLSearchParams(search).get("billing");
  if (!v || !(VALID as readonly string[]).includes(v)) return null;
  try { sessionStorage.setItem(KEY, v); } catch { /* private mode: the URL still carries it */ }
  return v as BillingIntent;
}

export function peekBillingIntent(): BillingIntent | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v && (VALID as readonly string[]).includes(v) ? (v as BillingIntent) : null;
  } catch { return null; }
}

export function clearBillingIntent(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

if (typeof window !== "undefined") captureBillingIntent();
