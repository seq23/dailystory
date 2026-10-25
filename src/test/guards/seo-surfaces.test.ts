// Guard: crawlers see structured data and the IndexNow/Search Console files without
// running JS. time-2-read builds pages in the browser, so the JSON-LD must sit in the
// static index.html shell (16 Oct 2026 audit: homepage had 0 JSON-LD types, no
// IndexNow key, no Search Console property).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ORGANIZATION, OG_IMAGE_URL, SOFTWARE_APPLICATION, pageGraph } from "@/seo/schema";
import { PLAN_PRICES } from "@/lib/freeStoryAllowance";

const ROOT = join(__dirname, "../../..");
const SHELL = readFileSync(join(ROOT, "index.html"), "utf8");
const PUBLIC = join(ROOT, "public");

describe("static shell structured data", () => {
  const blocks = [...SHELL.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const nodes = blocks.flatMap((b) => b["@graph"] ?? [b]);
  const byType = (t: string) => nodes.find((n) => n["@type"] === t);

  it("has parseable JSON-LD in the shell", () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("declares the Organization and the WebSite for time-2-read.com", () => {
    expect(byType("Organization")).toMatchObject({ name: "Time2Read", url: "https://time-2-read.com/" });
    expect(byType("WebSite")).toMatchObject({ name: "Time2Read", url: "https://time-2-read.com/" });
    expect(byType("WebSite").publisher["@id"]).toBe(byType("Organization")["@id"]);
  });

  // 25 Oct 2026 search-readiness audit: Organization lacked sameAs and its logo and the
  // og:image sat on a third-party bucket. The shell and src/seo/schema.ts must agree.
  it("Organization carries sameAs and an own-host logo, identical to src/seo/schema.ts", () => {
    const org = byType("Organization");
    expect(org.sameAs.length).toBeGreaterThan(0);
    expect(org.sameAs).toEqual([...ORGANIZATION.sameAs]);
    expect(org.logo).toBe(ORGANIZATION.logo);
    expect(org["@id"]).toBe(ORGANIZATION["@id"]);
    expect(org.logo.startsWith("https://time-2-read.com/")).toBe(true);
  });

  it("og:image and twitter:image are on the site's own host and ship in public/", () => {
    const og = SHELL.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const tw = SHELL.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
    expect(og).toBe(OG_IMAGE_URL);
    expect(tw).toBe(OG_IMAGE_URL);
    expect(SHELL).not.toMatch(/storage\.googleapis\.com/);
    for (const f of ["og-image.png", "logo-512.png", "apple-touch-icon.png", "site.webmanifest", "favicon.ico"]) {
      expect(readdirSync(PUBLIC), f).toContain(f);
    }
    expect(SHELL).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    expect(SHELL).toContain('<link rel="manifest" href="/site.webmanifest">');
  });
});

describe("per-page structured data (src/seo/schema.ts)", () => {
  it("every page gets a WebPage; inner pages also get a BreadcrumbList", () => {
    const home = pageGraph("/", "Home title", "d")["@graph"].map((n: any) => n["@type"]);
    const inner = pageGraph("/ferpa", "FERPA | Time2Read", "d")["@graph"].map((n: any) => n["@type"]);
    expect(home).toContain("WebPage");
    expect(home).not.toContain("BreadcrumbList");
    expect(inner).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList"]));
  });

  it("the homepage sells the product at the prices in docs/PRICING.md", () => {
    const home = pageGraph("/", "t", "d")["@graph"];
    expect(home).toContainEqual(SOFTWARE_APPLICATION);
    const prices = SOFTWARE_APPLICATION.offers.map((o) => o.price);
    expect(prices).toEqual(["0.00", (PLAN_PRICES.monthly.amountCents / 100).toFixed(2), (PLAN_PRICES.annual.amountCents / 100).toFixed(2)]);
    expect(prices).toEqual(["0.00", "12.99", "99.00"]);
  });
});

describe("root verification files", () => {
  it("serves exactly one IndexNow key file whose body is its own key", () => {
    const keys = readdirSync(PUBLIC).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
    expect(keys).toHaveLength(1);
    expect(readFileSync(join(PUBLIC, keys[0]), "utf8").trim()).toBe(keys[0].slice(0, -4));
  });

  it("serves the Search Console file token", () => {
    const f = "google706548b58060eed8.html";
    expect(readFileSync(join(PUBLIC, f), "utf8").trim()).toBe(`google-site-verification: ${f}`);
  });
});
