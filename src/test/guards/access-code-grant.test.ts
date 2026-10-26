// Guard: a code typed at sign-up gives Premium AT ONCE (Oct 2026). Before this, an
// account made with HOMESCHOOL15 stayed on "3 of 3 free stories" because the code was
// only honoured inside a Stripe checkout the parent never finished
// (LoginScreen: isFreeDiscount excluded kind "trial"; the code went only to create-checkout).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCESS_CODE_ALREADY_REDEEMED,
  INVALID_ACCESS_CODE,
  decideGrant,
  premiumUntilLabel,
  type AccessCodeRow,
} from "../../../supabase/functions/_shared/accessCodeRules";
import { PAYMENT_TROUBLE, checkoutErrorMessage, codeFromUrl, parentSafeMessage } from "@/lib/accessCode";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const HOMESCHOOL: AccessCodeRow = { id: "c1", code: "HOMESCHOOL15", trial_days: 15, label: "x", active: true };
const NOW = new Date("2026-10-26T12:00:00Z");

describe("decideGrant", () => {
  it("a good code gives Premium from now for its days, however it is typed", () => {
    for (const typed of ["HOMESCHOOL15", "homeschool 15"]) {
      expect(decideGrant({ rawCode: typed, row: HOMESCHOOL, existing: null, now: NOW })).toEqual({
        ok: true,
        alreadyActive: false,
        trialDays: 15,
        premiumUntil: "2026-11-10T12:00:00.000Z",
        code: "HOMESCHOOL15",
      });
    }
  });
  it("refuses a bad, blank or inactive code with the plain message", () => {
    for (const row of [null, { ...HOMESCHOOL, active: false }, { ...HOMESCHOOL, trial_days: 0 }]) {
      expect(decideGrant({ rawCode: "HOMESCHOOL15", row, existing: null, now: NOW })).toMatchObject({ ok: false, error: INVALID_ACCESS_CODE });
    }
    expect(decideGrant({ rawCode: "  ", row: HOMESCHOOL, existing: null, now: NOW })).toMatchObject({ ok: false });
  });
  it("is one grant per account: the same code again keeps its end date, another code is refused", () => {
    const existing = { code: "HOMESCHOOL15", expires_at: "2026-11-01T00:00:00.000Z" };
    expect(decideGrant({ rawCode: "homeschool15", row: HOMESCHOOL, existing, now: NOW })).toMatchObject({
      ok: true,
      alreadyActive: true,
      premiumUntil: "2026-11-01T00:00:00.000Z",
    });
    const other = { ...HOMESCHOOL, code: "OTHER30", trial_days: 30 };
    expect(decideGrant({ rawCode: "OTHER30", row: other, existing, now: NOW })).toMatchObject({ ok: false, error: ACCESS_CODE_ALREADY_REDEEMED });
  });
  it("says the end date in one wording", () => {
    expect(premiumUntilLabel("2026-11-10T12:00:00.000Z")).toMatch(/^Premium active until November 10, 2026$/);
    expect(premiumUntilLabel(null)).toBeNull();
  });
});

describe("redeem-access-code (server)", () => {
  const fn = read("supabase/functions/redeem-access-code/index.ts");
  it("verifies the user and takes the code from the body or the one saved at sign-up", () => {
    expect(fn).toMatch(/verifyUser\(/);
    expect(fn).toMatch(/user\.user_metadata\?\.access_code/);
    expect(fn).toMatch(/decideGrant\(\{ rawCode: code, row, existing, now \}\)/);
  });
  it("records the grant and turns Premium on in subscribers until the code's end", () => {
    expect(fn).toMatch(/status: "granted"/);
    expect(fn).toMatch(/expires_at: decision\.premiumUntil/);
    expect(fn).toMatch(/override_premium: true/);
    expect(fn).toMatch(/override_end: decision\.premiumUntil/);
    expect(fn).toMatch(/subscribers\?on_conflict=email/);
    expect(read("supabase/config.toml")).toMatch(/\[functions\.redeem-access-code\]\nverify_jwt = true/);
  });
  it("is backed by an idempotent migration allowing grants without a Stripe session", () => {
    const sql = read("supabase/migrations/20261026180000_access_code_grants.sql");
    expect(sql).toMatch(/alter column stripe_session_id drop not null/);
    expect(sql).toMatch(/check \(status in \('checkout_started', 'completed', 'granted'\)\)/);
    expect(sql).toMatch(/create unique index if not exists access_code_redemptions_one_grant_per_user[\s\S]*where status = 'granted'/);
    expect(sql).toMatch(/drop constraint if exists/);
    expect(sql).not.toMatch(/create table (?!if not exists)/i);
  });
  it("after a code's free days, checkout bills from day one (one free period per account)", () => {
    const co = read("supabase/functions/create-checkout/index.ts");
    expect(co).toMatch(/\.from\("access_code_redemptions"\)[\s\S]{0,120}\.eq\("status", "granted"\)[\s\S]{0,60}hadSubscription = \(grants\?\.length \?\? 0\) > 0/);
  });
});

describe("Premium shows at once, everywhere, from one status", () => {
  it("the status hook re-reads on a redeem and reports the end date", () => {
    const hook = read("src/hooks/useCachedSubscriptionStatus.ts");
    expect(hook).toMatch(/addEventListener\(SUBSCRIPTION_CHANGED_EVENT/);
    expect(hook).toMatch(/premiumUntil: overrideActive \?/);
    expect(hook).toMatch(/new Date\(data\.subscription_end\) > now/); // an ended period is not Premium
  });
  it("the app redeems a saved or linked code, shows the badge, and hides the free-stories banner for Premium", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/user\.user_metadata\?\.access_code/);
    expect(app).toMatch(/codeFromUrl\(\)/);
    expect(app).toMatch(/data-testid="premium-badge"/);
    expect(app).toMatch(/\{!hasPaidAccess && !freeStories\.loading && !freeStories\.exhausted && \(/);
  });
  it("check-subscription reports a code's end date and that it came from a code", () => {
    const cs = read("supabase/functions/check-subscription/index.ts");
    expect(cs).toMatch(/via_code: hasValidOverride/);
    expect(cs).toMatch(/premium_until: hasValidOverride \? \(subscriber\?\.override_end/);
  });
  it("?code= on a link is read and normalised", () => {
    expect(codeFromUrl("?code=homeschool%2015")).toBe("HOMESCHOOL15");
    expect(codeFromUrl("?x=1")).toBe("");
  });
});

describe("a parent never sees a server's raw error", () => {
  it("setting names and stack text become one plain sentence", async () => {
    expect(parentSafeMessage("STRIPE_SECRET_KEY is not configured yet. Please add your Stripe secret key to proceed with payments.")).toBe(PAYMENT_TROUBLE);
    expect(PAYMENT_TROUBLE).not.toMatch(/[A-Z]{3,}_[A-Z]/);
    const res = new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured yet." }), { status: 500 });
    expect(await checkoutErrorMessage({ context: res })).toBe(PAYMENT_TROUBLE);
    const coded = new Response(JSON.stringify({ error: "INVALID_ACCESS_CODE", message: "That code didn't work." }), { status: 400 });
    expect(await checkoutErrorMessage({ context: coded })).toBe("That code didn't work.");
  });
  it("no sign-up or plan screen prints a server message as-is", () => {
    for (const f of ["src/components/LoginScreen.tsx", "src/components/SubscriptionManager.tsx"]) {
      expect(read(f), f).not.toMatch(/toast\.error\(error\.message/);
    }
  });
});
