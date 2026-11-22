// Guard: white text never sits on a gradient that fades to a pale colour (22 Nov 2026).
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

describe("text on gradients", () => {
  const classStrings = files("src").flatMap((p) =>
    readFileSync(p, "utf8")
      .split("\n")
      .flatMap((c, i, lines) => {
        if (/\bbg-gradient-to-/.test(c) && textColour(c)) return [{ p, c, text: textColour(c)! }];
        // An inline choice (`bg-gradient-to-br ${\n a ? 'from-.. text-white' : 'from-.. text-amber-950'\n}`):
        // each branch is checked against the text colour it sets, or white when the element sets white.
        if (/\bbg-gradient-to-\w+ \$\{\s*$/.test(c)) {
          const end = lines.findIndex((l, j) => j > i && /^\s*\}/.test(l));
          const body = lines.slice(i + 1, end < 0 ? i + 1 : end);
          const around = lines.slice(Math.max(0, i - 2), (end < 0 ? i : end) + 3).join(" ");
          const fallback = /\btext-white\b/.test(around) ? WHITE : undefined;
          return body.flatMap((l) => {
            const text = textColour(l) ?? fallback;
            return text ? [{ p, c: l, text }] : [];
          });
        }
        // A gradient read from a map (`bg-gradient-to-r ${rarity.gradient} ${rarity.fg}`): every entry
        // of that key in the same file is checked, against the `fg:` text colour of its own entry when
        // the element uses it, or white when the element sets text-white.
        const keys = [...c.matchAll(/\bbg-gradient-to-\w+ \$\{\w+\.(\w+)\}/g)].map((m) => m[1]);
        if (!keys.length) return [];
        const near = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
        const usesFg = /\$\{\w+\.fg\}/.test(near);
        if (!usesFg && !/\btext-white\b/.test(near)) return [];
        return lines.flatMap((l, j) => {
          if (!keys.some((k) => new RegExp(`\\b${k}:\\s*['"\`]`).test(l))) return [];
          if (!usesFg) return [{ p, c: l, text: WHITE }];
          let start = j;
          while (start > 0 && !/\{\s*$/.test(lines[start])) start--;
          const stop = lines.findIndex((x, n) => n > j && /^\s*\}/.test(x));
          const fg = lines.slice(start, stop).find((x) => /\bfg:\s*['"`]/.test(x));
          const text = fg && textColour(fg);
          return [{ p, c: l, text: text ?? `no fg colour in the entry for ${l.trim()}` }];
        });
      }),
  );

  it("finds the gradient buttons it checks", () => {
    expect(classStrings.length).toBeGreaterThan(0);
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
