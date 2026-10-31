// Guard: crawlers see structured data and the IndexNow/Search Console files without
// running JS. time-2-read builds pages in the browser, so the JSON-LD must sit in the
// static index.html shell (16 Oct 2026 audit: homepage had 0 JSON-LD types, no
// IndexNow key, no Search Console property).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ORGANIZATION, OG_IMAGE_URL, SOFTWARE_APPLICATION, pageGraph } from "@/seo/schema";
import ENTITY from "@/seo/entity.json";
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
    expect(byType("Organization")).toMatchObject({ name: "Time-2-Read", url: "https://time-2-read.com/" });
    expect(byType("WebSite")).toMatchObject({ name: "Time-2-Read", url: "https://time-2-read.com/" });
  });

  // 26 Oct 2026: a child landed on a different "Time2Read" site. The name carries its
  // dashes, the other spellings point here, and the maker and country are stated.
  it("names the brand Time-2-Read, joins the other spellings, and says Spry Labs, US", () => {
    for (const t of ["Organization", "WebSite"]) {
      expect(byType(t).alternateName, t).toEqual(["Time 2 Read", "time-2-read.com"]);
    }
    const org = byType("Organization");
    expect(org.brand).toEqual({ "@type": "Brand", name: "Spry Labs" });
    expect(org.address).toEqual({ "@type": "PostalAddress", addressCountry: "US" });
    expect(org.alternateName).toEqual([...ORGANIZATION.alternateName]);
    expect(org.brand).toEqual(ORGANIZATION.brand);
    expect(org.address).toEqual(ORGANIZATION.address);
    // no sameAs we have not verified: only live, own URLs
    for (const u of org.sameAs) expect(u).toMatch(/^https:\/\/(github\.com\/seq23\/|time-2-read\.com)/);
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

  // Search Readiness k1 (31 Oct 2026): the identity lived in two hand-kept copies
  // (this shell and src/seo/schema.ts) and no entity.json, so nothing could reconcile
  // the brand. src/seo/entity.json is now the ONE definition and both repeat it.
  it("repeats src/seo/entity.json field for field — the one definition (k1)", () => {
    const org = byType("Organization");
    for (const field of ["@id", "name", "alternateName", "legalName", "url", "logo", "sameAs", "parentOrganization"]) {
      expect(org[field], field).toEqual(ENTITY[field]);
    }
    // and the module every rendered page builds from reads the same file
    expect(ORGANIZATION["@id"]).toBe(ENTITY["@id"]);
    expect(ORGANIZATION.name).toBe(ENTITY.name);
    expect(ORGANIZATION.logo).toBe(ENTITY.logo);
    expect([...ORGANIZATION.sameAs]).toEqual(ENTITY.sameAs);
    expect(ENTITY.profiles_pending, "unclaimed profiles park in profiles_pending, never in sameAs").toBeInstanceOf(Array);
  });

  // Search Readiness k4 (31 Oct 2026): a side business names Spry Labs as its parent, so
  // the grid reconciles as one graph. It must be on EVERY page, which means the shell.
  it("names Spry Labs as the parent organization, in the shell and in schema.ts (k4)", () => {
    const parent = { "@id": "https://billionairehighperformancecoach.com/spry-labs#organization", name: "Spry Labs", url: "https://billionairehighperformancecoach.com/spry-labs" };
    expect(byType("Organization").parentOrganization).toEqual(parent);
    expect(ORGANIZATION.parentOrganization).toEqual(parent);
    expect(ENTITY.parentOrganization).toEqual(parent);
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
    const inner = pageGraph("/ferpa", "FERPA | Time-2-Read", "d")["@graph"].map((n: any) => n["@type"]);
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
