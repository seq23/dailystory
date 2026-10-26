// Guard (26 Oct 2026): "Break into Syllables" returned most words whole and only spoke them, and
// Explain's meaning showed in a toast hidden behind the word panel. The panel now shows the split,
// the meaning and "Saved" on screen, and unknown words are split by rule instead of left whole.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { splitSyllables } from "@/lib/syllables";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("splitSyllables", () => {
  it.each([
    ["confident", "con fi dent"],
    ["rabbit", "rab bit"],
    ["table", "ta ble"],
    ["astronaut", "as tro naut"],
    ["happy", "hap py"],
    ["dinosaur", "di no saur"],
    ["cake", "cake"],
    ["dog", "dog"],
  ])("%s → %s", (w, want) => {
    expect(splitSyllables(w).join(" ")).toBe(want);
  });
});

describe("word panel shows what it says", () => {
  it("the panel renders the meaning, syllables and saved state as text", () => {
    const modal = read("src/components/MobileTTSModal.tsx");
    expect(modal).toMatch(/info\?: \{ kind: "meaning" \| "syllables"; text: string \} \| null/);
    expect(modal).toMatch(/\{info && \(/);
    expect(modal).toMatch(/✓ Saved to word list/);
    const word = read("src/components/UnifiedInteractiveWord.tsx");
    expect(word).toMatch(/setPanelInfo\(\{ kind: "meaning"/);
    expect(word).toMatch(/setPanelInfo\(\{ kind: "syllables", text: splitSyllables\(cleanWord\)/);
    expect(word).toMatch(/isSaved=\{wordAlreadySaved \|\| justSaved\}/);
  });
  it("read-aloud syllables fall back to the rule-based split, never the whole word", () => {
    expect(read("src/services/CharlotteVoiceService.ts")).toMatch(/phonicsMiniDict\[cleanWordForSyllables\] \|\| splitSyllables\(cleanWord\)/);
  });
});
