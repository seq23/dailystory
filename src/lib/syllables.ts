/**
 * Splits an English word into written syllables for the word panel ("con · fi · dent").
 *
 * The phonics dictionary (src/data/phonicsMiniDict.ts) holds sounds for a few hundred words and
 * is what Read-aloud uses; every other word used to come back whole, so "Break into Syllables"
 * showed and said nothing useful (26 Oct 2026). This is the fallback: vowel groups, with the
 * consonants between them split the way school phonics teaches (VC/CV, V/CV), digraphs and
 * blends kept together, a silent final e and a final consonant + "le" handled.
 */
const VOWELS = "aeiouy";
const KEEP_TOGETHER = new Set([
  "ch", "sh", "th", "ph", "wh", "ck", "ng", "qu",
  "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sk", "sl", "sm",
  "sn", "sp", "st", "sw", "tr", "tw", "wr", "kn",
]);

const isVowel = (w: string, i: number) => {
  const c = w[i];
  if (c === "y") return i > 0 && !VOWELS.includes(w[i - 1]);
  return VOWELS.includes(c);
};

export function splitSyllables(word: string): string[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w ? [w] : [];

  // Vowel groups: [start, end) of each run of vowels. A silent final "e" is not its own group.
  const groups: Array<[number, number]> = [];
  for (let i = 0; i < w.length; ) {
    if (isVowel(w, i)) {
      let j = i + 1;
      while (j < w.length && isVowel(w, j)) j++;
      groups.push([i, j]);
      i = j;
    } else i++;
  }
  const last = groups[groups.length - 1];
  const finalLe = /[^aeiouy]le$/.test(w);
  if (groups.length > 1 && last && last[0] === w.length - 1 && w.endsWith("e") && !finalLe) groups.pop();
  if (groups.length <= 1) return [w];

  const cuts: number[] = [];
  for (let g = 0; g < groups.length - 1; g++) {
    const from = groups[g][1];
    const to = groups[g + 1][0];
    const between = w.slice(from, to);
    if (finalLe && g === groups.length - 2) { cuts.push(w.length - 3); continue; } // ta · ble
    if (between.length === 0) cuts.push(from);
    else if (between.length === 1) cuts.push(from); // V/CV: fi · dent
    else if (between.length === 2) cuts.push(KEEP_TOGETHER.has(between) ? from : from + 1); // VC/CV: con · fi
    else cuts.push(KEEP_TOGETHER.has(between.slice(-2)) ? to - 2 : from + 1);
  }
  const parts: string[] = [];
  let start = 0;
  for (const c of cuts) {
    if (c > start && c < w.length) { parts.push(w.slice(start, c)); start = c; }
  }
  parts.push(w.slice(start));
  return parts.filter(Boolean);
}
