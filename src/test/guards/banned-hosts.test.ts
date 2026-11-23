// Microsoft Clarity removed and the fonts self-hosted (coordinator, 22 Nov 2026, after the #182
// review): a child's reading screen must not hand the child's IP address to Microsoft or Google.
// The build gate (scripts/check-prerender.mjs) fails on any file in dist that names a banned host,
// and the live check (scripts/check-live-readiness.mjs) on any live page or asset that does.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { BANNED_HOSTS, bannedHostsIn, bannedRuleBroken } from "../../../scripts/banned-hosts.mjs";

const root = join(__dirname, "../../..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    if (/^(node_modules|dist|\.git)$/.test(n)) return [];
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

describe("banned hosts", () => {
  it("the matcher catches each banned host and its subdomains, and nothing that only looks alike", () => {
    expect(bannedRuleBroken()).toBe(false);
    expect(BANNED_HOSTS).toEqual(["clarity.ms", "fonts.googleapis.com", "fonts.gstatic.com"]);
    expect(bannedHostsIn('<link href="https://fonts.googleapis.com/css2?family=Inter"><script src="https://www.clarity.ms/tag/x">')).toEqual(["fonts.googleapis.com", "clarity.ms"]);
    expect(bannedHostsIn("oauth2.googleapis.com www.gstatic.com clarity.msn.com")).toEqual([]);
  });

  it("no Clarity tag and no Google Fonts URL anywhere in what we build from", () => {
    const scanned = ["index.html", "src", "public", "supabase/functions"].flatMap((p) => {
      const full = join(root, p);
      return statSync(full).isDirectory() ? files(full) : [full];
    }).filter((f) => !/\.test\.tsx?$/.test(f));
    expect(scanned.length).toBeGreaterThan(500);
    const hits = scanned.flatMap((f) => bannedHostsIn(readFileSync(f, "latin1")).map((h: string) => `${relative(root, f)}: ${h}`));
    expect(hits).toEqual([]);
    expect(readFileSync(join(root, "src/main.tsx"), "utf8")).not.toMatch(/clarity/i);
  });

  it("the build gate fails a dist with a Google Fonts URL in a stylesheet", () => {
    const dist = mkdtempSync(join(tmpdir(), "t2r-dist-"));
    try {
      mkdirSync(join(dist, "assets"));
      writeFileSync(join(dist, "assets", "index-abc.css"), "@import url(https://fonts.googleapis.com/css2?family=Inter);");
      writeFileSync(join(dist, "assets", "index-abc.js"), "console.log(1)");
      let out = "";
      try {
        execFileSync("node", ["scripts/check-prerender.mjs", dist], { cwd: root, encoding: "utf8", stdio: "pipe" });
      } catch (e) {
        out = String((e as { stderr?: string }).stderr ?? "");
      }
      expect(out).toContain("assets/index-abc.css: names fonts.googleapis.com");
      expect(out).not.toContain("index-abc.js: names");
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });
});

describe("self-hosted fonts", () => {
  it("every font family a style names is bundled from @fontsource, in the weights Google served", () => {
    const fonts = readFileSync(join(root, "src/fonts.ts"), "utf8");
    const bundled = new Set([...fonts.matchAll(/^import "@fontsource\/([a-z-]+)\/(\d+)\.css";$/gm)].map((m) => `${m[1]} ${m[2]}`));
    const slug = (family: string) => family.toLowerCase().replace(/\s+/g, "-");
    const tailwind = readFileSync(join(root, "tailwind.config.ts"), "utf8").split("fontFamily: {")[1].split("}")[0];
    const named = new Set([...tailwind.matchAll(/'([A-Z][A-Za-z ]+)'/g)].map((m) => m[1]));
    expect([...named].sort()).toEqual(["Amiri", "Comic Neue", "Fredoka", "Inter", "Kalam", "Ma Shan Zheng", "Noto Sans Devanagari", "Noto Sans SC", "Tajawal"]);
    for (const family of named) expect([...bundled].some((b) => b.startsWith(`${slug(family)} `)), family).toBe(true);
    // The weights index.html asked Google for before 22 Nov 2026, so nothing renders thinner or bolder.
    const WAS = { fredoka: [300, 400, 500, 600, 700], "comic-neue": [300, 400, 700], inter: [400, 500, 600], amiri: [400, 700], tajawal: [300, 400, 500, 700], "noto-sans-sc": [300, 400, 500, 700], "ma-shan-zheng": [400], "noto-sans-devanagari": [300, 400, 500, 700], kalam: [300, 400, 700] };
    expect([...bundled].sort()).toEqual(Object.entries(WAS).flatMap(([f, ws]) => ws.map((w) => `${f} ${w}`)).sort());
    expect(readFileSync(join(root, "src/main.tsx"), "utf8")).toMatch(/^import '\.\/fonts'$/m);
  });

  it("the build preloads the body face, and fails when that file is not in the bundle", async () => {
    const { fontPreloadPlugin } = await import("../../../vite-plugins/fontPreloadPlugin");
    const hook = fontPreloadPlugin().transformIndexHtml as { handler: (html: string, ctx: { bundle?: Record<string, unknown> }) => unknown };
    expect(hook.handler("", { bundle: { "assets/inter-latin-400-normal-C38fXH4l.woff2": {}, "assets/inter-latin-500-normal-x.woff2": {} } })).toEqual([
      { tag: "link", attrs: { rel: "preload", href: "/assets/inter-latin-400-normal-C38fXH4l.woff2", as: "font", type: "font/woff2", crossorigin: "" }, injectTo: "head-prepend" },
    ]);
    expect(() => hook.handler("", { bundle: { "assets/inter-latin-500-normal-x.woff2": {} } })).toThrow(/inter-latin-400-normal\.woff2 is not in the bundle/);
    expect(() => hook.handler("", {})).toThrow(/not in the bundle/);
  });
});
