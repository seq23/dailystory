// Guard: the marketing block (intro, collections, footer) renders only for a
// signed-out visitor on the plain homepage, never inside the signed-in app.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("marketing text stays out of the signed-in app", () => {
  it("Index renders the SEO block (intro, collections, footer) only when signed out", () => {
    const idx = read("src/pages/Index.tsx");
    // Signed out AND on the plain homepage: the sign-in/sign-up screen and a guest story
    // are full screens of their own, with no marketing text to scroll into.
    expect(idx).toMatch(/\{!isAuthenticated && onPlainHomepage && \(\s*<>\s*<HomeIntro \/>\s*<ReadingCollectionsLinks \/>\s*<SiteFooterNav \/>\s*<\/>\s*\)\}/);
    expect(idx).toMatch(/const onPlainHomepage = useOnPlainHomepage\(\);/);
    const gs = read("src/lib/guestScreen.ts");
    expect(gs).toMatch(/return screen === "welcome";/);
    expect(gs).toMatch(/\(\) => "welcome" as GuestScreen/); // server/prerender snapshot: the block renders
    const g = read("src/components/GuestExperience.tsx");
    expect(g).toMatch(/setGuestScreen\(currentState\);/);
    expect(g).toMatch(/useEffect\(\(\) => \(\) => setGuestScreen\("welcome"\), \[\]\);/);
    expect(idx).toMatch(/useState\(false\)/); // prerender runs signed out, so crawlers keep the block
    expect(read("src/prerender/entry.tsx")).toMatch(/HomeIntro/);
  });
});
