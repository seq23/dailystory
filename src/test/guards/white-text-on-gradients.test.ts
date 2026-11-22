// Guard: text never sits on a gradient that fades to a pale colour (22 Nov 2026).
//
// The home page's main "Create Your First Story" button faded from blue through purple to
// the pale yellow accent (--accent, 70% lightness). Its white label read at about 1.5:1 on
// the yellow end. A gradient behind white text may only use stops that are dark enough
// for 4.5:1, and must not use theme tokens that flip to near-white in dark mode (--primary).
// Named Tailwind stops count too (22 Nov 2026 re-check): the Premium badge and "See plans"
// button ran white text over from-yellow-400 to-orange-500, about 1.5:1, and twelve other
// buttons used 500-shade stops under 4.5:1. A named stop is read from Tailwind's own palette
// (tailwindcss/colors); a name it does not know fails, so a custom colour cannot slip past.
// A gradient that keeps its light gold and uses dark text (text-amber-950) is checked against
// that text colour instead of white.
import colors from "tailwindcss/colors";
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { towerMarker } from "@/components/ModernProgressTowers";
import { rarityConfig } from "@/components/ui/achievement-popup";
import { colorThemes } from "@/components/ui/progress-tower";

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

const PALETTE = colors as unknown as Record<string, Record<string, string> | string>;
const named = (family: string, shade: string): string | undefined => {
  const f = PALETTE[family];
  return typeof f === "object" ? f[shade] : undefined;
};

// Contrast between two #rrggbb colours.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const WHITE = "#ffffff";
// The text colour a class string sets: white, or a named Tailwind colour (text-amber-950).
function textColour(c: string): string | undefined {
  if (/\btext-white\b/.test(c)) return WHITE;
  for (const [, family, shade] of c.matchAll(/(?<![\w:-])text-([a-z]+)-(\d{2,3})\b/g)) {
    const hex = named(family, shade);
    if (hex) return hex;
  }
  return undefined;
}

// Gradients whose colour and text colour come from a map: the maps are imported, so each
// gradient is checked against its own entry's text colour, with no source parsing.
const MAP_FILES = [
  "src/components/ModernProgressTowers.tsx",
  "src/components/ui/achievement-popup.tsx",
  "src/components/ui/progress-tower.tsx",
];
const mapped = [
  ...Object.entries(rarityConfig).map(([k, e]) => ({ p: `rarityConfig.${k}`, c: e.gradient, fg: e.fg })),
  ...Object.entries(colorThemes).flatMap(([k, e]) => [
    { p: `colorThemes.${k}.gradient`, c: e.gradient, fg: e.fg },
    { p: `colorThemes.${k}.premium`, c: e.premium, fg: e.fg },
  ]),
  ...Object.entries(towerMarker).map(([k, e]) => ({ p: `towerMarker.${k}`, c: e.gradient, fg: e.fg })),
].map(({ p, c, fg }) => ({ p, c, text: textColour(fg) ?? `fg "${fg}" is not a text colour` }));

describe("text on gradients", () => {
  // A class string on one line that sets both a gradient and a text colour.
  const literal = files("src").flatMap((p) =>
    readFileSync(p, "utf8")
      .split("\n")
      .filter((c) => /\bbg-gradient-to-/.test(c) && textColour(c))
      .map((c) => ({ p, c, text: textColour(c)! })),
  );
  const classStrings = [...literal, ...mapped];

  it("finds the gradient buttons it checks", () => {
    expect(literal.length).toBeGreaterThan(0);
    expect(mapped.length).toBeGreaterThanOrEqual(16);
  });

  it("every gradient that takes its text colour from a map uses a map this test imports", () => {
    const unchecked = files("src").flatMap((p) =>
      readFileSync(p, "utf8")
        .split("\n")
        .filter((l) => /\bbg-gradient-to-\w+ \$\{/.test(l) && /\.fg\}/.test(l))
        .filter(() => !MAP_FILES.includes(p))
        .map((l) => `${p}: ${l.trim()}`),
    );
    expect(unchecked).toEqual([]);
  });

  it("knows white on yellow-400 is unreadable, white on purple-700 and amber-950 on yellow-300 are fine", () => {
    expect(contrast(WHITE, named("yellow", "400")!)).toBeLessThan(2);
    expect(contrast(WHITE, named("purple", "700")!)).toBeGreaterThan(4.5);
    expect(contrast(named("amber", "950")!, named("yellow", "300")!)).toBeGreaterThan(4.5);
  });

  it("every stop behind the text is a fixed colour at 4.5:1 or better against it", () => {
    const bad: string[] = [];
    for (const { p, c, text } of classStrings) {
      if (!/^#[0-9a-f]{6}$/i.test(text)) { bad.push(`${p}: ${text}`); continue; }
      for (const stop of c.match(/\b(?:from|via|to)-\[hsl\(.*?\)\]/g) ?? []) {
        const m = stop.match(/hsl\((\d+(?:\.\d+)?)_(\d+(?:\.\d+)?)%_(\d+(?:\.\d+)?)%\)/);
        if (!m) { bad.push(`${p}: ${stop} (a theme token can change colour; use a fixed hsl)`); continue; }
        if (text !== WHITE) { bad.push(`${p}: ${stop} under coloured text; use a named stop so it can be checked`); continue; }
        const ratio = whiteContrast(+m[1], +m[2], +m[3]);
        if (ratio < 4.5) bad.push(`${p}: ${stop} is ${ratio.toFixed(2)}:1`);
      }
      for (const [stop, family, shade] of c.matchAll(/\b(?:from|via|to)-([a-z]+)-(\d{2,3})\b/g)) {
        const hex = named(family, shade);
        if (!hex) { bad.push(`${p}: ${stop} is not a Tailwind colour, so its contrast cannot be checked`); continue; }
        const ratio = contrast(text, hex);
        if (ratio < 4.5) bad.push(`${p}: ${stop} is ${ratio.toFixed(2)}:1`);
      }
    }
    expect(bad).toEqual([]);
  });
});
