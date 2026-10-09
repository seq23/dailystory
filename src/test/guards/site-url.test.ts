// Guard: every public absolute URL uses https://time-2-read.com, never the
// *.lovable.app preview host. The sitemap and robots.txt shipped with every
// <loc> on time-2-read.lovable.app (Oct 2026), so search engines were told the
// canonical site lived on the preview host.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
import { landingPages } from "@/data/landingPages";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const LOVABLE_HOST = /https?:\/\/[a-z0-9-]+\.lovable\.app/i;

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const f = join(dir, n);
    return statSync(f).isDirectory() ? files(f, ext) : ext.test(n) ? [f] : [];
  });
}

describe("public site URL", () => {
  it("SITE_URL is the production domain", () => {
    expect(SITE_URL).toBe("https://time-2-read.com");
  });

  it("every sitemap <loc> is on SITE_URL, and every landing page is listed", () => {
    const locs = [...read("public/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(10);
    expect(locs.filter((l) => !l.startsWith(`${SITE_URL}/`))).toEqual([]);
    const missing = landingPages.map((p) => `${SITE_URL}/${p.slug}`).filter((u) => !locs.includes(u));
    expect(missing).toEqual([]);
  });

  it("robots.txt points crawlers at the production sitemap", () => {
    const sitemaps = read("public/robots.txt").split("\n").filter((l) => /^sitemap:/i.test(l));
    expect(sitemaps).toEqual([`Sitemap: ${SITE_URL}/sitemap.xml`]);
  });

  it("index.html canonical and social URLs are on SITE_URL", () => {
    const html = read("index.html");
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
    expect(html).toContain(`<meta property="og:url" content="${SITE_URL}/" />`);
  });

  it("no shipped page, public file or source file names a *.lovable.app URL", () => {
    const candidates = [
      join(ROOT, "index.html"),
      ...files(join(ROOT, "public"), /\.(xml|txt|html|json)$/),
      ...files(join(ROOT, "src"), /\.(ts|tsx)$/).filter((f) => !f.includes(`${join("src", "test")}`)),
    ];
    expect(candidates.length).toBeGreaterThan(100);
    const offenders = candidates.filter((f) => LOVABLE_HOST.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
