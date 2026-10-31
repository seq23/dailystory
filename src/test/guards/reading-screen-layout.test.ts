// Guard: the reading screen at upper grades (27 Oct 2026, live, premium, Reads at 10th,
// a 285-word page, 1400x779):
//  1. the story text scrolled inside a ~330px inner box beside the picture;
//  2. the floating "Reading Time" timer sat ON the story picture, its controls across
//     the picture's bottom edge;
//  3. choosing a child in "Reading as" took seconds with no sign of work, and the New
//     story dialog's "Story for:" reverted to the previous child meanwhile.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

// A controllable Supabase: getSession and the two reads can be held open.
const ctl = vi.hoisted(() => ({
  session: Promise.resolve({ data: { session: { user: { id: "u1" } } } }) as Promise<unknown>,
  prefs: Promise.resolve({ data: { active_child_id: "11111111-1111-4111-8111-111111111111" } }) as Promise<unknown>,
  upsert: vi.fn(() => Promise.resolve({ error: null })),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: () => ctl.session, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    from: (table: string) => {
      if (table === "user_preferences") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => ctl.prefs }) }),
          upsert: ctl.upsert,
        };
      }
      return {
        select: () => ({
          eq: () => ({ order: () => Promise.resolve({ data: [{ id: A, display_name: "Ada" }, { id: B, display_name: "Ben" }], error: null }) }),
        }),
      };
    },
  },
}));

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
import { __resetChildProfilesStore, useChildProfiles, type ChildProfile } from "@/hooks/useChildProfiles";

const kids = [{ id: A, display_name: "Ada" }, { id: B, display_name: "Ben" }] as ChildProfile[];
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("switching readers is instant and never reverts", () => {
  beforeEach(() => {
    __resetChildProfilesStore({ children: kids, activeChildId: A, loading: false, userId: "u1" });
    ctl.session = Promise.resolve({ data: { session: { user: { id: "u1" } } } });
    ctl.prefs = Promise.resolve({ data: { active_child_id: A } });
    ctl.upsert.mockClear();
  });

  it("the new reader shows at once and 'switching' is true until the save is done", async () => {
    const slowSession = deferred<unknown>();
    ctl.session = slowSession.promise; // the session check took seconds live
    const { result } = renderHook(() => useChildProfiles());
    let done!: Promise<void>;
    act(() => { done = result.current.setActiveChild(B); });
    expect(result.current.activeChild?.display_name).toBe("Ben");
    expect(result.current.switching).toBe(true);
    expect(result.current.switchingToId).toBe(B);
    await act(async () => { slowSession.resolve({ data: { session: { user: { id: "u1" } } } }); await done; });
    expect(result.current.switching).toBe(false);
    expect(result.current.activeChildId).toBe(B);
    expect(ctl.upsert).toHaveBeenCalledTimes(1);
  });

  it("a load that started before the switch does not put the old child back", async () => {
    const oldPrefs = deferred<unknown>();
    ctl.prefs = oldPrefs.promise; // the database still says Ada
    const { result } = renderHook(() => useChildProfiles());
    let loading!: Promise<void>;
    act(() => { loading = result.current.refresh(); });
    await act(async () => { await result.current.setActiveChild(B); });
    await act(async () => { oldPrefs.resolve({ data: { active_child_id: A } }); await loading; });
    expect(result.current.activeChildId).toBe(B);
    expect(ctl.upsert).toHaveBeenCalledTimes(1); // the load did not save Ada back either
  });

  it("the header and the New story dialog say 'Switching…' and follow the current reader", () => {
    const h = read("src/components/PremiumHeader.tsx");
    expect(h).toMatch(/switchingToId \? uiText\("Switching…"\) : activeChild \? uiText\("Reading as"\)/);
    expect(h).not.toMatch(/e\.preventDefault\(\);\s*setSwitchingTo/);
    const d = read("src/components/SpecialRequestDialog.tsx");
    expect(d).toMatch(/\{switching && <span[^>]*data-testid="story-for-switching">\{uiText\("Switching…"\)\}<\/span>\}/);
    expect(d).toMatch(/value=\{activeChild\?\.id \?\? ""\}/);
  });
});

describe("long pages read in the page's own scroll; the timer covers nothing", () => {
  const c = read("src/components/CleanStoryDisplay.tsx");

  it("past 150 words the text column has no fixed height and no inner scroll box", () => {
    expect(c).toMatch(/export const LONG_PAGE_WORDS = 150;/);
    expect(c).toMatch(/const isLongPage = countWords\(currentStoryText \|\| ""\) > LONG_PAGE_WORDS;/);
    expect(c).toMatch(/const heightStyle = isLongPage \? undefined : fittedHeightStyle;/);
    expect(c).toMatch(/cn\(isLongPage \? "overflow-x-hidden p-3 md:p-6" : "h-full overflow-y-auto[^"]*"/);
    expect(c).toMatch(/cn\(isLongPage \? "px-4 md:px-6 pb-4" : "flex-1 min-h-0 overflow-y-auto[^"]*"\)\} data-testid="story-text-scroll-mobile"/);
    expect(c).toMatch(/isLongPage \? "flex-none" : imagesEnabled \? "flex-\[0\.4\]"/);
  });

  it("the reading timer is docked in the page flow, not floating over the story", () => {
    expect(c).toMatch(/data-testid="reading-timer-slot">\s*<StoryTimerIntegration\s+docked\b/);
    expect(c.match(/<StoryTimerIntegration\b/g)).toHaveLength(1);
    const t = read("src/components/CollapsibleFloatingTimer.tsx");
    expect(t).toMatch(/if \(docked\) return "relative z-\[1\] mx-auto";/);
    expect(read("src/components/story/StoryTimerIntegration.tsx")).toMatch(/docked=\{docked\}/);
  });
});
