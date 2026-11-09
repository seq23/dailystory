// The automatic step-up (Premium, Reads at 6th-10th) must survive the next session.
// Before 8 Nov 2026 it lived only in memory and in browser storage under the child's name,
// so the next session started again at the child's saved Reads at. See src/lib/premiumStepUp.ts.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applyPremiumStepUp } from "@/lib/premiumStepUp";
import { startingReadingGrade } from "@/lib/readingLadder";
import type { Grade } from "@/lib/grades";

describe("automatic step-up", () => {
  it("steps up, and the next session (any device) starts at the new level; the parent lock stops it", async () => {
    // The child's saved profile row: what every new session and device reads.
    const profile: { grade: Grade; reading_grade: Grade } = { grade: "7", reading_grade: "7" };
    const save = async (g: Grade) => { profile.reading_grade = g; };
    const strong = { pagesCompleted: 10, readingSpeed: 90 };

    const stepped = await applyPremiumStepUp({ grade: startingReadingGrade({ readingGrade: profile.reading_grade, grade: profile.grade }), isPremium: true, lockDifficulty: false, session: strong, save });
    expect(stepped?.grade).toBe("8");
    // New session: built only from the saved profile, as on a fresh device.
    expect(startingReadingGrade({ readingGrade: profile.reading_grade, grade: profile.grade })).toBe("8");

    // Parent lock, Free plan, below 6th, a weak session and 10th never move it.
    const before = profile.reading_grade;
    expect(await applyPremiumStepUp({ grade: "8", isPremium: true, lockDifficulty: true, session: strong, save })).toBeNull();
    expect(await applyPremiumStepUp({ grade: "8", isPremium: false, lockDifficulty: false, session: strong, save })).toBeNull();
    expect(await applyPremiumStepUp({ grade: "8", isPremium: true, lockDifficulty: false, session: { pagesCompleted: 5, readingSpeed: 200 }, save })).toBeNull();
    expect(await applyPremiumStepUp({ grade: "5", isPremium: true, lockDifficulty: false, session: strong, save })).toBeNull();
    expect(await applyPremiumStepUp({ grade: "10", isPremium: true, lockDifficulty: false, session: strong, save })).toBeNull();
    expect(profile.reading_grade).toBe(before);

    // The story page saves the step-up through the same path as Make harder (the child's profile).
    const page = readFileSync(resolve(__dirname, "../../components/CleanStoryDisplay.tsx"), "utf8");
    expect(page).toMatch(/applyPremiumStepUp\(\{[\s\S]{0,300}save: persistReadingGrade/);
    expect(page).toMatch(/const persistReadingGrade = async[\s\S]{0,400}onReadingGradeChange\(step\.grade\)/);
    expect(page).not.toMatch(/ExpertDifficultyManager\.updateProgress/);
  });
});
