// Guard: docs/PRICING.md is the price (Oct 2026: $12.99/month, $99/year).
// The doc carries a ```pricing block; every place that charges or shows the price
// must agree with it, so the doc and the code cannot drift apart.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as accessRules from "../../../supabase/functions/_shared/accessCodeRules";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { TTS_CONFIG, getTTSProvider } from "@/config/ttsConfig";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

export function parsePricingBlock(md: string): Record<string, string> {
  const block = md.match(/```pricing\n([\s\S]*?)\n```/);
  if (!block) throw new Error("docs/PRICING.md has no ```pricing block");
  const out: Record<string, string> = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const doc = parsePricingBlock(read("docs/PRICING.md"));
const cents = (k: string) => {
  const n = Number(doc[k]);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`PRICING.md ${k} is not a whole number of cents`);
  return n;
};
const monthly = cents("monthly_cents");
const annual = cents("annual_cents");
const label = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);
const savedDollars = Math.round((monthly * 12 - annual) / 100);
const savedPct = Math.floor(((monthly * 12 - annual) / (monthly * 12)) * 100);

describe("docs/PRICING.md is internally consistent", () => {
  it("has every key, and the labels and savings follow from the cents", () => {
    for (const k of ["monthly_cents", "annual_cents", "monthly_label", "annual_label", "annual_savings", "free_stories", "trial_days", "code_HOMESCHOOL15_days", "free_voice", "premium_voice", "premium_fallback"]) {
      expect(doc[k], k).toBeTruthy();
    }
    expect(doc.monthly_label).toBe(label(monthly));
    expect(doc.annual_label).toBe(label(annual));
    expect(doc.annual_savings).toBe(`$${savedDollars} (${savedPct}%)`);
    expect(annual).toBeLessThan(monthly * 12);
  });
});

describe("the code charges and shows what PRICING.md says", () => {
  it("create-checkout sends exactly the doc's cents inline", () => {
    const src = read("supabase/functions/create-checkout/index.ts");
    expect(src).toMatch(new RegExp(`unit_amount: plan === "monthly" \\? ${monthly} : ${annual},`));
    expect(src).toContain(`// Pricing: ${doc.monthly_label}/month or ${doc.annual_label}/year`);
  });

  it("legacy create-premium-subscription uses the same cents", () => {
    const src = read("supabase/functions/create-premium-subscription/index.ts");
    expect(src).toContain(`amount: ${monthly},`);
    expect(src).toContain(`amount: ${annual},`);
  });

  it("PLAN_PRICES (PricingSection, StoryPaywall) match", () => {
    expect(PLAN_PRICES.monthly.amountCents).toBe(monthly);
    expect(PLAN_PRICES.annual.amountCents).toBe(annual);
    expect(PLAN_PRICES.monthly.label).toBe(doc.monthly_label);
    expect(PLAN_PRICES.annual.label).toBe(doc.annual_label);
    for (const f of ["src/components/PricingSection.tsx", "src/components/StoryPaywall.tsx"]) {
      expect(read(f), f).toMatch(/PLAN_PRICES/);
    }
  });

  it("PremiumUpgrade and SubscriptionManager show the doc's prices and savings", () => {
    const up = read("src/components/PremiumUpgrade.tsx");
    expect(up).toContain(`price: '${doc.monthly_label}'`);
    expect(up).toContain(`price: '${doc.annual_label}'`);
    expect(up).toContain(`savings: 'Save ${doc.annual_savings}'`);
    const mgr = read("src/components/SubscriptionManager.tsx");
    expect(mgr).toContain(`${doc.monthly_label}<span`);
    expect(mgr).toContain(`${doc.annual_label}<span`);
    expect(mgr).toContain(`uiText("Save ${doc.annual_savings}")`);
  });

  it("every locale's plan prices and savings carry the doc's numbers", () => {
    const dir = join(ROOT, "src/i18n/locales");
    const files = readdirSync(dir).filter((n) => n.endsWith(".json"));
    let checked = 0;
    const m = (monthly / 100).toFixed(2);
    const mNum = new RegExp(`${m.replace(".", "[.,]")}`);
    const aNum = new RegExp(`\\b${annual / 100}\\b`);
    for (const f of files) {
      const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
      const plans = j?.pricing?.plans ?? findKey(j, "plans");
      if (!plans?.monthly?.price) continue;
      checked++;
      expect(plans.monthly.price, f).toMatch(mNum);
      expect(plans.annual.price, f).toMatch(aNum);
      expect(plans.annual.savings, f).toMatch(new RegExp(`\\b${savedDollars}\\b`));
      expect(plans.annual.savings, f).toMatch(new RegExp(`${savedPct} ?%`));
    }
    expect(checked).toBeGreaterThanOrEqual(8); // en es fr pt ar hi ur zh: zero locales checked is a failure
  });

  it("the /pricing structured data derives its offers from PLAN_PRICES, not a typed price", () => {
    const src = read("src/pages/Pricing.tsx");
    expect(src).toMatch(/price: \(PLAN_PRICES\[plan\]\.amountCents \/ 100\)\.toFixed\(2\)/);
    expect(src).not.toMatch(/price: "\d/);
  });

  it("the deploy reports leftover Stripe price-id secrets by name, never by value", () => {
    const wf = read(".github/workflows/deploy-functions.yml");
    expect(wf).toMatch(/Stripe price-id secrets report \(names only\)/);
    expect(wf).toMatch(/jq -r '\.\[\]\?\.name \/\/ empty'/);
    expect(wf).not.toMatch(/\.value/);
  });

  it("public/llms.txt quotes the doc's prices", () => {
    const txt = read("public/llms.txt");
    expect(txt).toContain(`${doc.monthly_label}/month or ${doc.annual_label}/year`);
  });

  it("free stories, trial length and HOMESCHOOL15 match", () => {
    expect(FREE_STORY_LIMIT).toBe(Number(doc.free_stories));
    expect(TRIAL_DAYS).toBe(Number(doc.trial_days));
    expect(accessRules.DEFAULT_TRIAL_DAYS).toBe(Number(doc.trial_days));
    expect(read("supabase/migrations/20261025120000_access_codes.sql")).toMatch(
      new RegExp(`'HOMESCHOOL15', ${Number(doc.code_HOMESCHOOL15_days)},`),
    );
  });

  it("no tracked source still carries the previous price", () => {
    const old = [cents("previous_monthly_cents"), cents("previous_annual_cents")];
    const oldLabels = [label(old[0]), label(old[1])];
    const files = [
      "supabase/functions/create-checkout/index.ts",
      "supabase/functions/create-premium-subscription/index.ts",
      "src/lib/freeStoryAllowance.ts",
      "src/components/PremiumUpgrade.tsx",
      "src/components/SubscriptionManager.tsx",
      "src/components/PricingSection.tsx",
      "src/components/StoryPaywall.tsx",
      "public/llms.txt",
    ];
    for (const f of files) {
      const src = read(f);
      for (const c of old) expect(src, `${f} has ${c}`).not.toMatch(new RegExp(`\\b${c}\\b`));
      for (const l of oldLabels) expect(src, `${f} has ${l}`).not.toMatch(new RegExp(`\\${l}(?![0-9.])`));
    }
  });
});

describe("the narration voices are the ones PRICING.md states", () => {
  const md = read("docs/PRICING.md");

  it("free and guest readers get the voice the doc names, and the doc says browser ($0)", () => {
    expect(doc.free_voice).toBe("browser");
    // Fails if GUEST_TTS_PROVIDER is ever set back to 'elevenlabs' while the doc says browser.
    expect(TTS_CONFIG.GUEST_TTS_PROVIDER).toBe(doc.free_voice);
    expect(getTTSProvider(false)).toBe(doc.free_voice);
    expect(md).toContain("**Free and guest readers hear the browser voice**");
    expect(md).toContain("**$0**");
  });

  it("premium gets ElevenLabs, with the browser voice as the one fallback", () => {
    expect(TTS_CONFIG.PREMIUM_TTS_PROVIDER).toBe(doc.premium_voice);
    expect(getTTSProvider(true)).toBe(doc.premium_voice);
    expect(doc.premium_fallback).toBe("browser");
    const router = read("src/services/narrationRouter.ts");
    expect(router).toMatch(/await o\.browser\(\);\s*return 'browser-fallback';/);
    expect(md).toContain("**Premium narration is capped by her ElevenLabs credit balance.**");
    expect(md).toContain("**The real narration cost is the ElevenLabs credits she buys, not a per-story list price.**");
  });

  it("the old per-story list-price estimate is gone", () => {
    expect(md).not.toMatch(/\$0\.46 a story/);
    expect(md).not.toMatch(/\$168 a year/);
  });
});

function findKey(obj: unknown, key: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  if (key in o && (o[key] as any)?.monthly) return o[key];
  for (const v of Object.values(o)) {
    const r = findKey(v, key);
    if (r) return r;
  }
  return undefined;
}
