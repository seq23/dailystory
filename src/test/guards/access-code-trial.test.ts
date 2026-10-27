// Guard: access-code trials (Oct 2026). A code such as HOMESCHOOL15 is typed in the
// one "Have a code?" box (sign-up Step 1, paywall, My Account) and redeemed by
// redeem-access-code for Premium at once, no card (access-code-grant.test.ts).
// create-checkout still validates a code it is sent against public.access_codes and
// keeps card up front and one trial per customer. No code = the regular 7-day trial.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCESS_CODE_MESSAGES,
  ACCESS_CODE_TRIAL_USED,
  DEFAULT_TRIAL_DAYS,
  INVALID_ACCESS_CODE,
  decideTrial,
  normalizeAccessCode,
  type AccessCodeRow,
} from "../../../supabase/functions/_shared/accessCodeRules";
import { checkoutBody, checkoutErrorMessage } from "@/lib/accessCode";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const MIGRATION = "supabase/migrations/20261025120000_access_codes.sql";
const HOMESCHOOL: AccessCodeRow = { id: "c1", code: "HOMESCHOOL15", trial_days: 15, label: "Homeschool via Gerranda", active: true };

describe("access code normalising", () => {
  it("ignores case and spaces", () => {
    for (const typed of ["HOMESCHOOL15", "homeschool15", "homeschool 15", "  Home School 15 ", "home\tschool\n15"]) {
      expect(normalizeAccessCode(typed), typed).toBe("HOMESCHOOL15");
    }
  });
  it("treats blank or non-text input as no code", () => {
    for (const typed of ["", "   ", undefined, null, 15, {}]) expect(normalizeAccessCode(typed)).toBe("");
  });
});

describe("trial decision", () => {
  it("a valid code gives its 15 days, however it is typed", () => {
    for (const typed of ["HOMESCHOOL15", "homeschool 15", " HomeSchool15 "]) {
      const d = decideTrial({ rawCode: typed, row: HOMESCHOOL, hadSubscription: false });
      expect(d, typed).toEqual({ ok: true, trialDays: 15, code: HOMESCHOOL });
    }
  });
  it("no code gives the regular 7 days", () => {
    expect(DEFAULT_TRIAL_DAYS).toBe(7);
    expect(decideTrial({ rawCode: "", row: null, hadSubscription: false })).toEqual({ ok: true, trialDays: 7, code: null });
    expect(decideTrial({ rawCode: undefined, row: null, hadSubscription: false })).toMatchObject({ ok: true, trialDays: 7 });
  });
  it("a bad code is refused with a plain message, never silently given 7 days", () => {
    const bad = [
      { rawCode: "HOMESCHOOL16", row: null },
      { rawCode: "HOMESCHOOL15", row: { ...HOMESCHOOL, active: false } },
      { rawCode: "HOMESCHOOL15", row: { ...HOMESCHOOL, code: "OTHER" } },
      { rawCode: "HOMESCHOOL15", row: { ...HOMESCHOOL, trial_days: 0 } },
      { rawCode: "HOMESCHOOL15", row: { ...HOMESCHOOL, trial_days: 1000 } },
    ];
    for (const b of bad) {
      const d = decideTrial({ ...b, hadSubscription: false });
      expect(d, JSON.stringify(b)).toEqual({ ok: false, error: INVALID_ACCESS_CODE, message: ACCESS_CODE_MESSAGES[INVALID_ACCESS_CODE] });
    }
    expect(ACCESS_CODE_MESSAGES[INVALID_ACCESS_CODE]).toMatch(/didn't work/);
  });
  it("keeps one trial per customer: no code pays from day one, a code is refused", () => {
    expect(decideTrial({ rawCode: "", row: null, hadSubscription: true })).toEqual({ ok: true, trialDays: 0, code: null });
    expect(decideTrial({ rawCode: "homeschool 15", row: HOMESCHOOL, hadSubscription: true })).toMatchObject({
      ok: false,
      error: ACCESS_CODE_TRIAL_USED,
    });
  });
});

describe("create-checkout validates the code on the server", () => {
  const src = read("supabase/functions/create-checkout/index.ts");
  it("reads the code from the body and looks up the normalised code among active rows", () => {
    expect(src).toMatch(/const \{ plan, accessCode \} = await req\.json\(\)/);
    expect(src).toMatch(/const normalizedCode = normalizeAccessCode\(accessCode\)/);
    expect(src).toMatch(/\.from\("access_codes"\)[\s\S]{0,120}\.eq\("code", normalizedCode\)\s*\.eq\("active", true\)/);
  });
  it("decides the trial after the one-trial check, and refuses with 400 before any session is made", () => {
    const had = src.indexOf("hadSubscription = previous.data.length > 0");
    const decide = src.indexOf("decideTrial({ rawCode: accessCode, row: codeRow, hadSubscription })");
    const refuse = src.indexOf("return codeRefusal(trial.error, trial.message, 400)");
    const session = src.indexOf("stripe.checkout.sessions.create(");
    expect(had).toBeGreaterThan(0);
    expect(decide).toBeGreaterThan(had);
    expect(refuse).toBeGreaterThan(decide);
    expect(session).toBeGreaterThan(refuse);
  });
  it("keeps the card up front and puts the code on the session and subscription", () => {
    expect(src).toMatch(/payment_method_collection: "always"/);
    expect(src).toMatch(/trial_period_days: trial\.trialDays/);
    expect(src).toMatch(/access_code: trial\.code\.code/);
    expect(src).toMatch(/subscription_data:[\s\S]{0,200}metadata: sessionMetadata/);
  });
  it("records each code use, and the webhook marks it a completed signup", () => {
    expect(src).toMatch(/\.from\("access_code_redemptions"\)\.insert\(\{[\s\S]{0,200}stripe_session_id: session\.id/);
    const hook = read("supabase/functions/stripe-webhook/index.ts");
    expect(hook).toMatch(/session\.metadata\?\.access_code/);
    expect(hook).toMatch(/\.from\("access_code_redemptions"\)[\s\S]{0,200}status: "completed"[\s\S]{0,300}\.eq\("stripe_session_id", session\.id\)/);
  });
});

describe("access_codes table", () => {
  const sql = read(MIGRATION);
  it("has code, trial_days, label, active, created_at and seeds HOMESCHOOL15 at 15 days", () => {
    expect(sql).toMatch(/create table if not exists public\.access_codes/);
    for (const col of ["code text not null unique", "trial_days integer not null", "label text", "active boolean not null default true", "created_at timestamptz not null default now()"]) {
      expect(sql).toContain(col);
    }
    expect(sql).toMatch(/values \('HOMESCHOOL15', 15, 'Homeschool via Gerranda'\)\s*on conflict \(code\) do nothing/);
  });
  it("stores codes normalised, so a lookup of the normalised input always matches", () => {
    expect(sql).toMatch(/check \(code <> '' and code = upper\(regexp_replace\(code, '\\s', '', 'g'\)\)\)/);
  });
  it("is readable by the service role only, and counts signups per code", () => {
    for (const t of ["access_codes", "access_code_redemptions"]) {
      expect(sql).toContain(`alter table public.${t} enable row level security;`);
      expect(sql).toContain(`revoke all on public.${t} from anon, authenticated;`);
    }
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).toMatch(/create or replace view public\.access_code_signups with \(security_invoker = true\)/);
    expect(sql).toMatch(/revoke all on public\.access_code_signups from anon, authenticated/);
  });
  it("is applied by a workflow, idempotently", () => {
    const wf = read(".github/workflows/apply-migrations.yml");
    expect(wf).toMatch(/api\.supabase\.com\/v1\/projects\/\$SUPABASE_PROJECT_ID\/database\/query/);
    expect(wf).toMatch(/--diff-filter=A/);
    expect(sql).not.toMatch(/create table (?!if not exists)/i);
  });
});

describe("the parent can enter a code wherever Premium is offered", () => {
  it("every paywall surface shows the one \"Have a code?\" box, and checkout never carries a code", () => {
    for (const f of ["src/components/PremiumUpgrade.tsx", "src/components/SubscriptionManager.tsx", "src/lib/trialCheckout.ts"]) {
      const src = read(f);
      expect(src, f).toMatch(/body: checkoutBody\([^,)]+\)/); // plan only: a code is redeemed, never sent to Stripe
      expect(src, f).toMatch(/checkoutErrorMessage\(/);
      expect(src, f).not.toMatch(/AccessCodeField|apply-discount-code/); // one code box, one path
    }
    // The paywall and the signed-in Pricing card start checkout through src/lib/trialCheckout.ts
    // (27 Oct 2026) and show the same code box.
    for (const f of ["src/components/PremiumUpgrade.tsx", "src/components/StoryPaywall.tsx", "src/components/SubscriptionManager.tsx", "src/components/PricingSection.tsx"]) {
      const src = read(f);
      expect(src, f).toMatch(/<RedeemCodeCard\b/);
      expect(src, f).not.toMatch(/AccessCodeField|apply-discount-code/);
    }
    for (const f of ["src/components/StoryPaywall.tsx", "src/components/PricingSection.tsx"]) {
      expect(read(f), f).toMatch(/await startTrialCheckout\(plan\)/);
    }
    const card = read("src/components/RedeemCodeCard.tsx");
    expect(card).toMatch(/Have a code\?/);
    expect(card).toMatch(/redeemAccessCode\(code\)/);
    expect(card).toMatch(/Try again/);
    expect(read("src/lib/accessCode.ts")).toMatch(/functions\.invoke\("redeem-access-code"/);
  });
  it("sign-up shows the code on Step 1, saves it on the account and redeems it at once", () => {
    const login = read("src/components/LoginScreen.tsx");
    expect(login).toMatch(/discountCode: codeFromUrl\(\)/); // ?code= pre-fills
    const step1 = login.slice(login.indexOf("{/* STEP 1"), login.indexOf("{/* STEP 2"));
    expect(step1).toMatch(/id="discount-code"/);
    expect(step1).toMatch(/Have a code\?/);
    expect(login).toMatch(/access_code: normalizeAccessCode\(signUpData\.discountCode\)/);
    expect(login).toMatch(/if \(isAccessCode && authData\.session\) \{\s*const redeemed = await redeemAccessCode\(signUpData\.discountCode\)/);
    expect(login).toMatch(/body: checkoutBody\(signUpData\.selectedPlan\)/);
    expect(login).toMatch(/!isFreeDiscount && !isAccessCode/); // no plans or pay button under a code
    expect(login).not.toMatch(/window\.open\(data\.url/); // a tab opened after await is blocked on iPad
    expect(read("supabase/functions/validate-discount-code/index.ts")).toMatch(/kind: 'trial'/);
  });
  it("sends a code only when one was typed", () => {
    expect(checkoutBody("monthly", "")).toEqual({ plan: "monthly" });
    expect(checkoutBody("annual", "   ")).toEqual({ plan: "annual" });
    expect(checkoutBody("monthly")).toEqual({ plan: "monthly" });
    expect(checkoutBody("monthly", " homeschool 15 ")).toEqual({ plan: "monthly", accessCode: "homeschool 15" });
  });
  it("shows the server's plain message for a refused code", async () => {
    const msg = ACCESS_CODE_MESSAGES[INVALID_ACCESS_CODE];
    const res = new Response(JSON.stringify({ error: msg, code: INVALID_ACCESS_CODE }), { status: 400 });
    expect(await checkoutErrorMessage({ context: res })).toBe(msg);
    expect(await checkoutErrorMessage(null, { error: msg })).toBe(msg);
    expect(await checkoutErrorMessage({ context: new Response("oops", { status: 500 }) })).toBeNull();
    expect(await checkoutErrorMessage(null, { url: "https://checkout" })).toBeNull();
  });
});
