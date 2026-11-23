// The site's stylesheet, compiled the way the build compiles it (Tailwind, then esbuild's minifier),
// has no rule the browser would drop. 22 Nov 2026: `.touch-feedback` had lost its selector and used
// rgba(var(--primary)) on an HSL variable, so the tap feedback never showed; the build only warned.
// esbuild cannot run inside jsdom, so the compile runs in its own node process.
// 22 Nov 2026: the site has one light theme, so the compiled stylesheet carries no dark rule.
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = join(__dirname, "../../..");
const compile = `
import { readFileSync } from "node:fs";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { transform } from "esbuild";
const from = "src/index.css";
const { css } = await postcss([tailwindcss("tailwind.config.ts")]).process(readFileSync(from, "utf8"), { from });
const { warnings } = await transform(css, { loader: "css", minify: true });
process.stdout.write(JSON.stringify({ size: css.length, rgbaOnHsl: css.match(/rgba?\\(var\\(--(?!tw-)[a-z-]+\\)[^)]*\\)/g) ?? [], touch: /\\.touch-feedback\\s*\\{[^}]*tap-highlight-color/.test(css),
  dark: css.match(/\\.dark\\b[^{,]*/g) ?? [],
  warnings: warnings.map((w) => w.text + ": " + (w.location?.lineText ?? "").trim()) }));`;

describe("src/index.css", () => {
  it("compiles with no CSS the minifier calls invalid", () => {
    const out = JSON.parse(execFileSync("node", ["--input-type=module", "-e", compile], { cwd: root, encoding: "utf8" }));
    expect(out.size).toBeGreaterThan(50_000);
    expect(out.warnings).toEqual([]);
    // The site's color variables hold HSL parts ("200 90% 35%"), so rgb()/rgba() around one is dropped
    // by the browser. Tailwind's own --tw-* variables hold RGB parts and are left alone.
    expect(out.rgbaOnHsl).toEqual([]);
    expect(out.touch).toBe(true);
    // The site has one light theme: nothing ever sets the dark class, so every dark rule was dead
    // weight, and a dark: class added later would do nothing (review of #182, 22 Nov 2026).
    expect(out.dark).toEqual([]);
  }, 60_000);
});
