// The Kindle book companion URL printed inside Decodable Stories Book 1 must be a real,
// prerendered route (Lovable serves dist/<path>/index.html at the path with and without the
// slash), never the NotFound fallback. The path is printed in a book, so it never moves.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { COMPANION_BOOKS, companionPath } from "@/pages/BookCompanion";
import { PLAN_PRICES, FREE_STORY_LIMIT } from "@/lib/freeStoryAllowance";

const PRINTED = ["/amazon/decodable-stories-1"];

describe("Kindle book companion pages", () => {
  it("every printed path is a companion book", () => {
    expect(COMPANION_BOOKS.map((b) => companionPath(b.slug))).toEqual(expect.arrayContaining(PRINTED));
  });
  it("the companion routes are in the app router and in the prerender list", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    const entry = readFileSync("src/prerender/entry.tsx", "utf8");
    for (const src of [app, entry]) {
      expect(src).toMatch(/COMPANION_BOOKS\.map\(\(b\) => [\s\S]{0,40}path[=:]\s*\{?`\/amazon\/\$\{b\.slug\}`/);
      expect(src).toMatch(/"\/amazon"/);
    }
  });
  it("prices on the page come from the one price source", () => {
    const page = readFileSync("src/pages/BookCompanion.tsx", "utf8");
    expect(page).not.toMatch(/\$\d/);
    expect(PLAN_PRICES.monthly.label).toBe("$12.99");
    expect(FREE_STORY_LIMIT).toBe(3);
  });
  it("the Premium button comes first and last, before the free step", () => {
    const page = readFileSync("src/pages/BookCompanion.tsx", "utf8");
    const top = page.indexOf('<PremiumCta pos="top" />'), end = page.indexOf('<PremiumCta pos="end" />');
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(page.indexOf("What is the free next step?"));
    expect(end).toBeGreaterThan(page.indexOf("Questions parents ask"));
    expect(page).toMatch(/<Link to="\/pricing">\s*<Button size="lg">Start Premium — \{PLAN_PRICES\.monthly\.label\}\/month ›<\/Button>/);
  });
});
