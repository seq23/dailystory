// Guard: crawlers see structured data and the IndexNow/Search Console files without
// running JS. time-2-read builds pages in the browser, so the JSON-LD must sit in the
// static index.html shell (16 Oct 2026 audit: homepage had 0 JSON-LD types, no
// IndexNow key, no Search Console property).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
