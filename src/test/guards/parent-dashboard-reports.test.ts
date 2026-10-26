import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// 26 Oct 2026: the menu promised "Reports" but the dashboard had no section by that name,
// and the minimum-level picker showed blank once "Advanced" was saved ('expert' vs 'advanced').
const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("parent dashboard has the Reports it promises", () => {
  it("the section picker is labelled and offers Reports", () => {
    const d = read("src/components/ParentDashboard.tsx");
    expect(read("src/components/PremiumSidebar.tsx")).toMatch(/description: "Reports, word lists, controls"/);
    expect(d).toMatch(/<SelectItem value="insights">Reports<\/SelectItem>/);
    expect(d).toMatch(/Show section \(tap to choose\):/);
  });
  it("a saved Advanced minimum shows as selected", () => {
    const d = read("src/components/ParentDashboard.tsx");
    expect(d).toMatch(/minDifficulty: 'expert', minExpertGrade: grade/);
    expect(d).toMatch(/guardrails\.minDifficulty === 'expert' \? `advanced:/);
  });
});
