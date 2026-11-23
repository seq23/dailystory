// /vendors moved to /subprocessors (coordinator, 22 Nov 2026: one list, no second page). The host
// cannot send a 301, so the old address ships a page that moves the visitor on and names the new
// address as canonical. check-prerender.mjs runs movedPageProblems over dist on every build.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MOVED, SITE, movedPage, movedPageProblems } from "../../../scripts/moved-pages.mjs";

const root = join(__dirname, "../../..");
const sitemap = [...readFileSync(join(root, "public/sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "") || "/");

describe("moved pages", () => {
  it("/vendors moves to /subprocessors, and the shipped page passes the check", () => {
    expect(MOVED).toEqual({ "/vendors": "/subprocessors" });
    expect(sitemap.length).toBeGreaterThan(10);
    for (const [from, to] of Object.entries(MOVED)) expect(movedPageProblems(from, to, movedPage(to), sitemap)).toEqual([]);
    expect(movedPage("/subprocessors")).toContain(`<link rel="canonical" href="${SITE}/subprocessors"`);
  });

  it("the check catches each way a move breaks", () => {
    const good = movedPage("/subprocessors");
    const check = (html: string, paths = sitemap) => movedPageProblems("/vendors", "/subprocessors", html, paths);
    expect(check("")).toHaveLength(1);
    expect(check(good.replace('content="0; url=/subprocessors"', 'content="5; url=/subprocessors"'))).toEqual(["/vendors: does not refresh to /subprocessors at once"]);
    expect(check(good.replace(`${SITE}/subprocessors"`, `${SITE}/vendors"`))).toEqual([`/vendors: canonical is not ${SITE}/subprocessors`]);
    expect(check(good, [...sitemap, "/vendors"])).toEqual(["/vendors: a moved address is still in the sitemap"]);
    expect(check(good, sitemap.filter((p) => p !== "/subprocessors"))).toEqual(["/vendors: moves to /subprocessors, which is not in the sitemap"]);
  });

  it("no page, link or route still points at the old address", () => {
    const app = readFileSync(join(root, "src/App.tsx"), "utf8");
    expect(app).not.toMatch(/["']\/vendors["']/);
    expect(readFileSync(join(root, "src/components/SiteFooterNav.tsx"), "utf8")).not.toContain("/vendors");
    expect(readFileSync(join(root, "public/llms.txt"), "utf8")).not.toContain("/vendors");
  });
});
