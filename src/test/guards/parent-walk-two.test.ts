// Guard: what the second parent walk (26 Oct 2026) found, pinned at the source.
//  - "Error creating default premium preferences" (23505 on user_preferences_user_id_key):
//    two writers raced a select-then-insert on the one-row-per-parent table.
//  - The Premium upsell card showed to a Premium parent whenever the plan was still
//    loading or could not be read.
//  - The chosen skin tone lost its name ("Medium" became "Selected").
//  - My Stories had two headings (My Stories + Your Story Library).
import { startingReadingGrade, withReadingGrade } from "@/lib/readingLadder";
const activeGradeSample = "2nd";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("user_preferences is written atomically (one row per parent)", () => {
  it("default premium preferences upsert and leave an existing row alone", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/\.from\('user_preferences'\)\s*\.upsert\(\[payload\], \{ onConflict: 'user_id', ignoreDuplicates: true \}\)/);
    expect(app).not.toMatch(/\.from\('user_preferences'\)\s*\.insert\(/);
  });
  it("the active child is saved with one upsert on user_id, never select-then-insert", () => {
    const hook = read("src/hooks/useChildProfiles.ts");
    const fn = hook.slice(hook.indexOf("async function persistActive"), hook.indexOf("async function load("));
    expect(fn).toMatch(/\.upsert\(\{ user_id: userId, active_child_id: childId \}[^)]*\{ onConflict: "user_id" \}\)/);
    expect(fn).not.toMatch(/\.insert\(|maybeSingle/);
  });
});

describe("the sidebar tells a Premium parent what they have", () => {
  it("quiet 'Premium active until' for Premium; the upsell only when the plan is known to be free", () => {
    const sb = read("src/components/PremiumSidebar.tsx");
    expect(sb).toMatch(/hasPremium && \(\s*<p[^>]*data-testid="sidebar-premium-until"[^>]*>\s*\{premiumUntilLabel\(premiumUntil\) \?\? "Premium is on"\}/);
    expect(sb).toMatch(/!effectiveCollapsed && planKnown && !hasPremium && \(\s*<div[^>]*data-testid="sidebar-premium-upsell"/);
    expect(sb).toMatch(/planKnown = false/); // unknown plan → no upsell
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/planKnown=\{!subLoading && !subError\}/);
    expect(app).toMatch(/premiumUntil=\{premiumUntil\}\s*planKnown=/);
  });
});

describe("pickers keep their names", () => {
  it("the chosen skin tone shows its name AND a tick, never just 'Selected'", () => {
    const p = read("src/components/ui/avatar-picker.tsx");
    expect(p).not.toMatch(/selected \? "Selected" :/);
    expect(p).toMatch(/data-testid=\{`avatar-tone-name-\$\{tone\}`\}>\s*\{t\(`userInfoForm\.fields\.skinTone\.options\.\$\{tone\}`, tone\)\}/);
    expect(p).toMatch(/✓ Selected/);
  });
});

describe("one heading per page", () => {
  it("the story library has no heading of its own (My Stories / Story Library supply it)", () => {
    const lib = read("src/components/PremiumStoryLibrary.tsx");
    expect(lib).not.toMatch(/<h1|Your Story Library|Manage and read your saved stories/);
    const view = read("src/components/PremiumMyStoriesView.tsx");
    expect((view.match(/<h1/g) ?? []).length).toBe(1);
    expect(view).not.toMatch(/Your personal story collection/);
  });
});

describe("nothing sits on top of the last button", () => {
  it("the cookie banner reserves its own height while it is up", () => {
    const c = read("src/components/CookieConsent.tsx");
    expect(c).toMatch(/root\.style\.setProperty\("--cookie-banner-h"/);
    expect(c).toMatch(/root\.style\.removeProperty\("--cookie-banner-h"\)/);
    expect(c).toMatch(/<div ref=\{bannerRef\} className="fixed bottom-0/);
    expect(read("src/index.css")).toMatch(/body \{[^}]*padding-bottom: var\(--cookie-banner-h, 0px\);/);
    // The page's bottom room is one constant now (27 Oct 2026: it also clears the feedback
    // button, src/test/guards/menu-back.test.ts); it still starts from the banner's height.
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/<main [^>]*style=\{\{ paddingBottom: MAIN_BOTTOM_CLEARANCE \}\}>/);
    const room = app.match(/export const MAIN_BOTTOM_CLEARANCE = "calc\(var\(--cookie-banner-h, 0px\) \+ (\d+(?:\.\d+)?)rem\)";/);
    expect(room).not.toBeNull();
    expect(Number(room![1])).toBeGreaterThanOrEqual(1);
  });
  it("'Create Your First Story' on the Story Library page opens the form, not just another page", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/onStartNewStory=\{\(\) => \{ setOpenNewStoryOnArrival\(true\); setCurrentView\("stories"\); \}\}/);
    expect(app).toMatch(/openNewStoryOnArrival=\{openNewStoryOnArrival\}/);
    expect(read("src/components/PremiumMyStoriesView.tsx")).toMatch(/useState\(openNewStoryOnArrival\)/);
  });
});

describe("a Premium parent is never told to upgrade", () => {
  it("a second premium check shares the first; a failed read is never cached as free", () => {
    const m = read("src/services/enhancedSubscriptionManager.ts");
    expect(m).not.toMatch(/isChecking/);
    expect(m).toMatch(/if \(this\.inflight\) return this\.inflight;/);
    expect(m).toMatch(/if \(error\) \{[\s\S]{0,160}return this\.cache\?\.isPremium \?\? false;/);
    expect(m).toMatch(/addEventListener\('subscription-changed', \(\) => EnhancedSubscriptionManager\.clearCache\(\)\)/);
  });
});

describe("children can be edited and removed", () => {
  it("the edit dialog removes a child after a second tap, never the last one", () => {
    const d = read("src/components/children/ChildDialog.tsx");
    expect(d).toMatch(/\{child && children\.length > 1 && \(/);
    expect(d).toMatch(/data-testid="child-remove"/);
    expect(d).toMatch(/await deleteChild\(child\.id\);/);
    expect(d).toMatch(/data-testid="child-remove-confirm"/);
  });
  it("the story follows the reading child's grade in both grade fields", () => {
    // 26 Oct 2026: the child's reading level (reading_grade, set on the story page),
    // else their school grade, sets BOTH grade fields via withReadingGrade.
    const v = read("src/components/PremiumMyStoriesView.tsx");
    expect(v).toMatch(/readingGrade: \(activeChild as \{ reading_grade\?: string \| null \}\)\.reading_grade,\s*\n\s*grade: activeChild\.grade_level,/);
    expect(v).toMatch(/return withReadingGrade\(\{[\s\S]*?\}, readingGrade\);/);
    const fromGrade = withReadingGrade({ name: "Aiden" }, startingReadingGrade({ grade: activeGradeSample }));
    expect(fromGrade.grade).toBe("2");
    expect(fromGrade.gradeLevel).toBe("2");
    const fromReading = withReadingGrade({ name: "Aiden" }, startingReadingGrade({ readingGrade: "4", grade: activeGradeSample }));
    expect([fromReading.grade, fromReading.gradeLevel]).toEqual(["4", "4"]);
  });
});
