// Guard: white text never sits on a gradient that fades to a pale colour (22 Nov 2026).
//
// The home page's main "Create Your First Story" button faded from blue through purple to
// the pale yellow accent (--accent, 70% lightness). Its white label read at about 1.5:1 on
// the yellow end. A gradient behind white text may only use stops that are dark enough
// for 4.5:1, and must not use theme tokens that flip to near-white in dark mode (--primary).
// Named Tailwind stops count too (22 Nov 2026 re-check): the Premium badge and "See plans"
// button ran white text over from-yellow-400 to-orange-500, about 1.5:1, and twelve other
// buttons used 500-shade stops under 4.5:1. A named stop is read from the palette below; a
// family not in it fails until it is added, so a new colour cannot slip past unchecked.
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

// Tailwind v3 default palette (shades 400-900) for the families used behind white text.
const PALETTE: Record<string, Record<string, string>> = {
  blue: { 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" },
  purple: { 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87" },
  pink: { 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843" },
  orange: { 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12" },
  amber: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" },
  yellow: { 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12" },
  green: { 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d" },
  gray: { 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827" },
  emerald: { 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" },
  violet: { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" },
  cyan: { 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63" },
};

// Contrast of white against a #rrggbb colour.
function whiteOnHex(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

describe("white text on gradients", () => {
  const classStrings = files("src").flatMap((p) =>
    readFileSync(p, "utf8")
      .split("\n")
      .flatMap((c, i, lines) => {
        if (/\bbg-gradient-to-/.test(c) && /\btext-white\b/.test(c)) return [{ p, c }];
        // A gradient read from a map (`bg-gradient-to-r ${rarity.gradient}`) with white text on a
        // neighbouring line of the same cn(): the map's entries for that key (`gradient: '...'`)
        // in the same file are checked too.
        // An inline choice (`bg-gradient-to-br ${\n a ? 'from-..' : 'from-..'\n}`): its branches are checked.
        if (/\bbg-gradient-to-\w+ \$\{\s*$/.test(c)) {
          const end = lines.findIndex((l, j) => j > i && /^\s*\}/.test(l));
          const body = lines.slice(i + 1, end < 0 ? i + 1 : end);
          const around = lines.slice(Math.max(0, i - 2), (end < 0 ? i : end) + 3).join(" ");
          return /\btext-white\b/.test(around) ? body.map((l) => ({ p, c: l })) : [];
        }
        const near = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
        if (!/\btext-white\b/.test(near)) return [];
        const keys = [...c.matchAll(/\bbg-gradient-to-\w+ \$\{\w+\.(\w+)\}/g)].map((m) => m[1]);
        return lines
          .filter((l) => keys.some((k) => new RegExp(`\\b${k}:\\s*['"\`]`).test(l)))
          .map((l) => ({ p, c: l }));
      }),
  );

  it("finds the gradient buttons it checks", () => {
    expect(classStrings.length).toBeGreaterThan(0);
  });

  it("knows white on yellow-400 is unreadable and white on purple-700 is fine", () => {
    expect(whiteOnHex(PALETTE.yellow[400])).toBeLessThan(2);
    expect(whiteOnHex(PALETTE.purple[700])).toBeGreaterThan(4.5);
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
      for (const [stop, family, shade] of c.matchAll(/\b(?:from|via|to)-([a-z]+)-(\d{2,3})\b/g)) {
        const hex = PALETTE[family]?.[shade];
        if (!hex) { bad.push(`${p}: ${stop} is not in the palette table here; add it so its contrast is checked`); continue; }
        const ratio = whiteOnHex(hex);
        if (ratio < 4.5) bad.push(`${p}: ${stop} is ${ratio.toFixed(2)}:1`);
      }
    }
    expect(bad).toEqual([]);
  });
});
