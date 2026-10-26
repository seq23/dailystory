// Guard: the brand is "Time-2-Read", with dashes, everywhere a person reads it (a
// child landed on a different "Time2Read" site). The clock-in-book logo is on the
// app header, login, checkout screens and footer; the maker line is on the homepage
// and footer; every checkout screen says it is in US dollars.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const MADE_BY = "Time-2-Read is made by Spry Labs in the USA.";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    if (statSync(full).isDirectory()) return n === "test" || n === "__tests__" ? [] : files(full);
    return /\.(tsx?|json|html|txt|webmanifest)$/.test(n) ? [full] : [];
  });
}

describe("the name is Time-2-Read", () => {
  it("no displayed 'Time2Read' or 'Time 2 Read' anywhere people read", () => {
    const scanned = [...files(join(ROOT, "src")), join(ROOT, "index.html"), ...files(join(ROOT, "public"))];
    expect(scanned.length).toBeGreaterThan(100);
    const offenders = scanned.flatMap((f) => {
      const text = readFileSync(f, "utf8");
      return /Time2Read|Time 2 Read(?!")/.test(text.replace(/"Time 2 Read", "time-2-read\.com"/g, "")) ? [relative(ROOT, f)] : [];
    });
    expect(offenders).toEqual([]);
  });
  it("titles, meta and the app header say Time-2-Read", () => {
    const shell = read("index.html");
    expect(shell).toMatch(/<title>Time-2-Read /);
    expect(shell).toMatch(/og:site_name" content="Time-2-Read"/);
    expect(read("public/site.webmanifest")).toMatch(/"name": "Time-2-Read"/);
    expect(read("src/components/PremiumHeader.tsx")).toMatch(/>Time-2-Read<\/span>/);
  });
});

describe("logo, maker line and US dollars", () => {
  it("the clock-in-book logo is on the app header, first-child screen, login, checkout screens and footer", () => {
    for (const f of [
      "src/components/PremiumHeader.tsx",
      "src/components/children/FirstChildScreen.tsx",
      "src/components/LoginScreen.tsx",
      "src/components/StoryPaywall.tsx",
      "src/components/SiteFooterNav.tsx",
      "src/components/PremiumSidebar.tsx",
    ]) {
      expect(read(f), f).toMatch(/src="\/icon-192\.png"/);
    }
  });
  it("homepage and footers carry the maker line", () => {
    expect(read("src/seo/schema.ts")).toContain(`MADE_BY_LINE = "${MADE_BY}"`);
    for (const f of ["src/components/HomeIntro.tsx", "src/components/SiteFooterNav.tsx", "src/components/WelcomeHero.tsx"]) {
      expect(read(f), f).toMatch(/\{MADE_BY_LINE\}/);
    }
  });
  it("every checkout screen says 'Secure checkout in US dollars'", () => {
    for (const f of [
      "src/components/LoginScreen.tsx",
      "src/components/StoryPaywall.tsx",
      "src/components/PremiumUpgrade.tsx",
      "src/components/SubscriptionManager.tsx",
      "src/components/PricingSection.tsx",
    ]) {
      expect(read(f), f).toMatch(/Secure checkout in US dollars/);
    }
  });
});

describe("marketing text stays out of the signed-in app", () => {
  it("Index renders the SEO block (intro, collections, footer) only when signed out", () => {
    const idx = read("src/pages/Index.tsx");
    expect(idx).toMatch(/\{!isAuthenticated && \(\s*<>\s*<HomeIntro \/>\s*<ReadingCollectionsLinks \/>\s*<SiteFooterNav \/>\s*<\/>\s*\)\}/);
    expect(idx).toMatch(/useState\(false\)/); // prerender runs signed out, so crawlers keep the block
    expect(read("src/components/HomeIntro.tsx")).toMatch(/Guides for parents and teachers/);
    expect(read("src/prerender/entry.tsx")).toMatch(/HomeIntro/);
  });
  it("each signed-out screen fills the viewport, so the block never peeks under the sign-in card", () => {
    const g = read("src/components/GuestExperience.tsx");
    expect(g).not.toMatch(/<div className="animate-fade-in">/);
    expect((g.match(/animate-fade-in min-h-\[100dvh\]/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
