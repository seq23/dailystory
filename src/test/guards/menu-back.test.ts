// Guard: what the final live tests (27 Oct 2026, phone 390 and iPad 820) found on the menu pages.
//  - My Stories, Story Library, Progress, Grown-up settings, Reading settings, Parent dashboard
//    and Help had no "← Back"; the only way out was the menu.
//  - With many children the "Reading as" menu ran off a phone screen: "Add another child" and
//    "Grown-up settings" could not be reached.
//  - The round feedback button covered "Save settings" at the end of Reading settings.
//  - A story finished from the library went back to the library, never to its quiz.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BACKLESS_VIEWS, HOME_VIEW, popView, pushView, showsBack } from "@/lib/viewTrail";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");
const MENU_VIEWS = ["library", "progress", "account", "profile", "parent", "home", "premium"];

describe("← Back on the menu pages", () => {
  it("every menu page but My Stories shows Back (Help included); My Stories and the reading screen do not", () => {
    // "home" is the Help page (PremiumHomeTutorial); "stories" is My Stories, the home screen.
    for (const v of ["library", "progress", "account", "profile", "parent", "premium", "home"]) expect(showsBack(v)).toBe(true);
    for (const v of ["stories", "reading"]) expect(showsBack(v)).toBe(false);
    expect(BACKLESS_VIEWS).toContain(HOME_VIEW);
  });
  it("Back returns to the page before, step by step, then home", () => {
    let t: string[] = [];
    t = pushView(t, "stories", "library");
    t = pushView(t, "library", "progress");
    let r = popView(t, "progress");
    expect(r.to).toBe("library");
    r = popView(r.trail, "library");
    expect(r.to).toBe("stories");
    expect(popView(r.trail, "stories").to).toBe(HOME_VIEW);
  });
  it("Back never reopens the reading screen and never stays on the same page", () => {
    const t = pushView(pushView(pushView([], "stories", "reading"), "reading", "library"), "library", "library");
    expect(popView(t, "library").to).toBe("stories");
    expect(popView(["account", "account"], "account").to).toBe(HOME_VIEW);
  });
  it("the trail is bounded", () => {
    let t: string[] = [];
    for (let i = 0; i < 50; i++) t = pushView(t, MENU_VIEWS[i % MENU_VIEWS.length], MENU_VIEWS[(i + 1) % MENU_VIEWS.length]);
    expect(t.length).toBeLessThanOrEqual(10);
  });
  it("the app renders Back from router history on every page showsBack allows", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/\{showsBack\(currentView\) && !isEditingProfile && \(\s*<button[\s\S]{0,80}onClick=\{goBack\}[\s\S]{0,80}data-testid="view-back"/);
    expect(app).toContain('if (window.history.state?.idx > 0) navigate(-1)');
    expect(app).toContain('useScreenHistory<AppView>("app", "stories")');
    expect(app).toContain('else setCurrentView("stories")');
    expect(app).not.toContain('viewTrailRef');
    expect(app).toMatch(/<span aria-hidden>←<\/span> \{uiText\("Back"\)\}/);
  });
});

describe("the Reading as menu stays inside a phone screen", () => {
  it("scrolls within the space Radix says is available", () => {
    const h = read("src/components/PremiumHeader.tsx");
    const tag = h.slice(h.indexOf("<DropdownMenuContent"), h.indexOf(">", h.indexOf("<DropdownMenuContent")));
    expect(tag).toMatch(/max-h-\[var\(--radix-dropdown-menu-content-available-height\)\]/);
    expect(tag).toMatch(/overflow-y-auto/);
    expect(tag).toMatch(/data-testid="reader-menu"/);
  });
});

describe("the feedback button never covers the last control on a page", () => {
  it("the page keeps at least the button's 80px free at the bottom", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    const m = app.match(/export const MAIN_BOTTOM_CLEARANCE = "calc\(var\(--cookie-banner-h, 0px\) \+ (\d+(?:\.\d+)?)rem\)";/);
    expect(m).not.toBeNull();
    expect(Number(m![1]) * 16).toBeGreaterThanOrEqual(80 + 8);
    expect(app).toMatch(/<main [^>]*style=\{\{ paddingBottom: MAIN_BOTTOM_CLEARANCE \}\}>/);
    const fab = read("src/components/FloatingFeedback.tsx");
    expect(fab).toMatch(/fixed bottom-6 right-6 z-50 rounded-full w-14 h-14/);
  });
});

describe("a story finished from the library reaches its quiz", () => {
  it("the library reading screen ends like a new story: the session-ended page", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    const lib = app.slice(app.indexOf("Reading saved story"), app.indexOf("onHome={() => setCurrentView(\"stories\")}", app.indexOf("Reading saved story")));
    expect(lib).toMatch(/onSessionEnded=\{handleSessionEnded\}/);
    expect(lib).not.toMatch(/setCurrentView\("library"\)/);
  });
});
