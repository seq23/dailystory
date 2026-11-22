// Guard: white text never sits on a gradient that fades to a pale colour (22 Nov 2026).
//
// The home page's main "Create Your First Story" button faded from blue through purple to
// the pale yellow accent (--accent, 70% lightness). Its white label read at about 1.5:1 on
// the yellow end. A gradient behind white text may only use stops that are dark enough
// for 4.5:1, and must not use theme tokens that flip to near-white in dark mode (--primary).
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === "test" ? [] : files(p);
    return /\.(tsx|ts)$/.test(name) ? [p] : [];
  });
}

// Relative luminance contrast of white against an hsl() colour.
function whiteContrast(h: number, s: number, l: number): number {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [f(0), f(8), f(4)].map(lin);
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

describe("white text on gradients", () => {
  const classStrings = files("src").flatMap((p) =>
    readFileSync(p, "utf8")
      .split("\n")
      .filter((c) => /\bbg-gradient-to-/.test(c) && /\btext-white\b/.test(c))
      .map((c) => ({ p, c })),
  );

  it("finds the gradient buttons it checks", () => {
    expect(classStrings.length).toBeGreaterThan(0);
  });

  it("every stop behind white text is a fixed colour at 4.5:1 or better", () => {
    const bad: string[] = [];
    for (const { p, c } of classStrings) {
      for (const stop of c.match(/\b(?:from|via|to)-\[hsl\(.*?\)\]/g) ?? []) {
        const m = stop.match(/hsl\((\d+(?:\.\d+)?)_(\d+(?:\.\d+)?)%_(\d+(?:\.\d+)?)%\)/);
        if (!m) { bad.push(`${p}: ${stop} (a theme token can change colour; use a fixed hsl)`); continue; }
        const ratio = whiteContrast(+m[1], +m[2], +m[3]);
        if (ratio < 4.5) bad.push(`${p}: ${stop} is ${ratio.toFixed(2)}:1`);
      }
    }
    expect(bad).toEqual([]);
  });
});
