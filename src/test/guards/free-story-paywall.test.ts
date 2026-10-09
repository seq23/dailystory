// Guard: the paywall in front of the stories (Oct 2026).
// Free accounts get 3 stories in total, then a 7-day free trial (card up front)
// at $9.99/month or $79/year. The server enforces the limit; the UI mirrors it.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as rules from "../../../supabase/functions/_shared/freeStoryRules";
import {
  FREE_LIMIT_CODE,
  FREE_STORY_LIMIT,
  PLAN_PRICES,
  TRIAL_DAYS,
  freeStoriesUsed,
  isFreeLimitError,
} from "@/lib/freeStoryAllowance";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("free-story limit", () => {
  it("is 3 stories, identical on server and client", () => {
    expect(rules.FREE_STORY_LIMIT).toBe(3);
    expect(FREE_STORY_LIMIT).toBe(rules.FREE_STORY_LIMIT);
    expect(FREE_LIMIT_CODE).toBe(rules.FREE_LIMIT_CODE);
  });

  it("counts only the first page of a new story", () => {
    expect(rules.isNewStoryRequest({ config: { sessionType: "premium", pageNumber: 1 } })).toBe(true);
    expect(rules.isNewStoryRequest({ config: { sessionType: "free" } })).toBe(true);
    expect(rules.isNewStoryRequest({ config: { pageNumber: 2 } })).toBe(false);
    expect(rules.isNewStoryRequest({ config: { pageNumber: 1, existingStory: "Once upon" } })).toBe(false);
    for (const t of ["repair", "live", "netflix", "rewrite"]) {
      expect(rules.isNewStoryRequest({ config: { sessionType: t, pageNumber: 1 } })).toBe(false);
    }
  });

  it("reads the server-recorded count and recognises the server's refusal", () => {
    expect(freeStoriesUsed({ app_metadata: { free_story_keys: ["a", "b"] } } as never)).toBe(2);
    expect(freeStoriesUsed({ app_metadata: {} } as never)).toBe(0);
    expect(freeStoriesUsed(null)).toBe(0);
    expect(isFreeLimitError({ context: { status: 402 } })).toBe(true);
    expect(isFreeLimitError(null, { code: FREE_LIMIT_CODE })).toBe(true);
    expect(isFreeLimitError({ context: { status: 500 } }, { error: "boom" })).toBe(false);
  });

  it("generate-adaptive-story checks the allowance before generating", () => {
    const src = read("supabase/functions/generate-adaptive-story/index.ts");
    const check = src.indexOf("await checkFreeStoryAllowance(req, requestBody)");
    const generate = src.indexOf("return await handleStreamlinedGeneration(requestBody)");
    expect(check).toBeGreaterThan(0);
    expect(generate).toBeGreaterThan(check);
    expect(src).toMatch(/if \(!allowance\.allowed\)[\s\S]{0,200}return freeLimitResponse\(/);
  });

  it("the allowance is stored where only the service role can write it", () => {
    const src = read("supabase/functions/_shared/freeStoryAllowance.ts");
    expect(src).toMatch(/auth\.admin\.updateUserById\(/);
    expect(src).toMatch(/app_metadata:\s*\{\s*\.\.\.meta,\s*free_story_keys/);
    expect(src).toMatch(/status:\s*402/);
  });

  it("the client sends the story's sessionId and never serves templates for a refused story", () => {
    expect(read("src/services/storyGenerationService.ts")).toMatch(/sessionId: config\.sessionId/);
    expect(read("src/services/storyGenerationService.ts")).toMatch(/isFreeLimitError\(error, data\)/);
    expect(read("src/services/LiveGenerationService.ts")).toMatch(/result\.error === FREE_LIMIT_CODE/);
  });

  it("the app shows the paywall, not the old dead-end 'Subscription Required' block", () => {
    for (const f of ["src/components/AuthenticatedApp.tsx", "src/components/PremiumMyStoriesView.tsx"]) {
      const src = read(f);
      expect(src).toMatch(/<StoryPaywall \/>/);
      expect(src).not.toMatch(/Subscription Required/);
    }
  });
});

describe("checkout: 7-day trial at $9.99 / $79", () => {
  const src = read("supabase/functions/create-checkout/index.ts");

  it("prices are 999 and 7900 cents, never the old $10 / $100", () => {
    expect(src).toMatch(/plan === "monthly" \? 999 : 7900/);
    expect(src).not.toMatch(/unit_amount:\s*1000\b/);
    expect(src).not.toMatch(/unit_amount:\s*10000\b/);
    expect(PLAN_PRICES.monthly.amountCents).toBe(999);
    expect(PLAN_PRICES.annual.amountCents).toBe(7900);
  });

  it("is a Stripe subscription trial of 7 days with the card taken up front", () => {
    expect(src).toMatch(/const TRIAL_DAYS = 7;/);
    expect(TRIAL_DAYS).toBe(7);
    expect(src).toMatch(/subscription_data:\s*\{[\s\S]*trial_period_days: TRIAL_DAYS/);
    expect(src).toMatch(/payment_method_collection: "always"/);
  });

  it("no UI copy still shows the old prices", () => {
    const dir = join(ROOT, "src/i18n/locales");
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
      const txt = readFileSync(join(dir, f), "utf8");
      expect(txt, f).not.toMatch(/"\$10"|"\$100"|\$10\/|\$100\/|"10\$|"100\$/);
    }
    for (const f of ["src/components/PricingSection.tsx", "src/components/SubscriptionManager.tsx", "src/components/PremiumUpgrade.tsx"]) {
      expect(read(f), f).not.toMatch(/>\$10<|\$100<|\$79\.99/);
    }
  });
});

describe("marketing copy", () => {
  it("footer pitches the paid plan to parents and sends schools to contact us", () => {
    const src = read("src/components/WelcomeHero.tsx");
    expect(src).not.toMatch(/Free for personal/);
    expect(src).toMatch(/4–8-year-olds/);
    expect(src).toMatch(/Schools: <a href="mailto:hello@time-2-read\.com[^"]*"[^>]*>contact us<\/a>/);
  });

  it("pricing page includes the HeyGetOnMyLevel bonus", () => {
    const src = read("src/components/PricingSection.tsx");
    expect(src).toMatch(/HEYGETONMYLEVEL_URL/);
    expect(src).toMatch(/reading practice free/);
    expect(read("src/lib/freeStoryAllowance.ts")).toMatch(/"https:\/\/heygetonmylevel\.com"/);
  });
});
