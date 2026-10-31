import { describe, it, expect } from "vitest";
import { readingLevelForDifficulty, minimumGradeForGuardrail, guardrailForGrade } from "@/lib/grades";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// 26 Oct 2026: the menu promised "Reports" but the dashboard had no section by that name,
// and the minimum-level picker showed blank once "Advanced" was saved ('expert' vs 'advanced').
const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("parent dashboard has the Reports it promises", () => {
  it("the section picker is labelled and offers Reports", () => {
    const d = read("src/components/ParentDashboard.tsx");
    expect(read("src/components/PremiumSidebar.tsx")).toMatch(/description: uiText\("Reports, word lists, controls"\)/);
    expect(d).toMatch(/<SelectItem value="insights">\{uiText\("Reports"\)\}<\/SelectItem>/);
    expect(d).toMatch(/Show section \(tap to choose\):/);
  });
  it("a saved Advanced minimum shows as selected (as its grade)", () => {
    const d = read("src/components/ParentDashboard.tsx");
    // "Never easier than: ___ grade": the picker shows the stored minimum as a grade.
    expect(d).toMatch(/const selected = minimumGradeForGuardrail\(guardrails\.minDifficulty, guardrails\.minExpertGrade, guardrails\.minReadingGrade\);/);
    expect(d).toMatch(/onValueChange=\{\(v\) => setGuardrails\(\{ \.\.\.guardrails, \.\.\.guardrailForGrade\(v\) \}\)\}/);
    // an older saved "Advanced — 8th" (expert + 8th) shows as 8th grade, and saving 8th keeps those fields
    expect(minimumGradeForGuardrail("expert", "8th")).toBe("8");
    expect(guardrailForGrade("8")).toEqual({ minReadingGrade: "8", minDifficulty: "expert", minExpertGrade: "8th" });
    expect(readingLevelForDifficulty("expert")).toBe("advanced");
  });

});
