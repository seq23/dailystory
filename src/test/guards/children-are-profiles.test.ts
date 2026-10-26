// Guard: the grown-up owns the account; children are profiles inside it.
// Before: the parent's own name showed as the reader ("Test · Grade K", "8 years
// old"), "Default (Account Holder)" was a reader, a child added in one place did
// not show in the header (each component kept its own list, so the dashboard
// said "try refreshing the page"), and the avatar choice was a faint ring.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { effectiveActiveChild, type ChildProfile } from "@/hooks/useChildProfiles";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");
const kid = (id: string, name: string) => ({ id, display_name: name }) as ChildProfile;

describe("the reader is always a real child", () => {
  it("falls back to the first child, never to the grown-up", () => {
    const a = kid("a", "Axel");
    const m = kid("m", "Maya");
    expect(effectiveActiveChild([a, m], "m")).toBe(m);
    expect(effectiveActiveChild([a, m], null)).toBe(a);
    expect(effectiveActiveChild([a, m], "deleted")).toBe(a);
    expect(effectiveActiveChild([], null)).toBeNull();
  });
  it("one shared store, no 'Account Holder' reader, no refresh warning", () => {
    const hook = read("src/hooks/useChildProfiles.ts");
    expect(hook).toMatch(/useSyncExternalStore\(subscribe, snapshot, snapshot\)/);
    expect(hook).toMatch(/set\(\{ children: \[\.\.\.state\.children, child\], activeChildId: child\.id \}\)/); // a new child reads now
    for (const f of ["src/components/ParentDashboard.tsx", "src/components/PremiumHeader.tsx", "src/components/PremiumProfileEditor.tsx"]) {
      const src = read(f);
      expect(src, f).not.toMatch(/Account Holder|try refreshing the page/i);
    }
  });
});

describe("children are listed, added and switched in obvious places", () => {
  it("header: 'Reading as <child> ▾' lists every child, + Add a child, Grown-up settings", () => {
    const h = read("src/components/PremiumHeader.tsx");
    expect(h).toMatch(/"Reading as"/);
    expect(h).toMatch(/children\.map\(\(c\) =>/);
    expect(h).toMatch(/data-testid="header-add-child"/);
    expect(h).toMatch(/Grown-up settings/);
    expect(h).not.toMatch(/userInfo\.(name|age|grade)/); // the grown-up is never shown as the reader
  });
  it("first run asks for the first child before anything else", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toMatch(/childProfiles\.length === 0[\s\S]{0,80}<FirstChildScreen/);
    expect(read("src/components/children/FirstChildScreen.tsx")).toMatch(/Who's reading\?/);
  });
  it("every list of children ends with '+ Add another child' and marks who is reading", () => {
    const list = read("src/components/children/ChildrenList.tsx");
    expect(list).toMatch(/Add another child/);
    expect(list).toMatch(/✓ Reading now/);
    for (const f of ["src/components/MyAccount.tsx", "src/components/ParentDashboard.tsx", "src/components/PremiumProfileEditor.tsx"]) {
      expect(read(f), f).toMatch(/<ChildrenList \/>/);
    }
  });
  it("the story form says who the story is for", () => {
    const d = read("src/components/SpecialRequestDialog.tsx");
    expect(d).toMatch(/Story for:/);
    expect(d).not.toMatch(/This format helps our system|-->\s*Enter/);
  });
});

describe("every picker shows what is picked", () => {
  it("avatar picture and skin tone: ring, ✓ and the word 'Selected'", () => {
    const p = read("src/components/ui/avatar-picker.tsx");
    expect(p).toMatch(/aria-pressed=\{selected\}/);
    expect(p).toMatch(/<SelectedMark \/>/);
    expect((p.match(/Selected/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
  it("grade chips: aria-checked, ✓ and 'Selected: <grade>'", () => {
    const f = read("src/components/children/ChildForm.tsx");
    expect(f).toMatch(/aria-checked=\{selected\}/);
    expect(f).toMatch(/Selected: <strong>/);
    expect(f).toMatch(/Saving…/);
    expect(f).toMatch(/"Try again"/);
  });
});

describe("the journey runs in CI", () => {
  it("journey.yml runs the parent journey on PRs and main over the built site", () => {
    const wf = read(".github/workflows/journey.yml");
    expect(wf).toMatch(/pull_request:/);
    expect(wf).toMatch(/branches: \[ main \]/);
    expect(wf).toMatch(/npx playwright test e2e\/parent-journey\.spec\.ts/);
    expect(read("e2e/parent-journey.spec.ts")).toMatch(/never sees developer widgets/);
  });
});
