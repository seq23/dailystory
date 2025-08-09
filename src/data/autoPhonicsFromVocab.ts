// Auto-generated base phonics mapping from vocabulary sets
// This creates deterministic, kid-friendly chunks using a simple heuristic

import { ENHANCED_LEVEL_0_VOCABULARY } from '@/constants/dolchPrePrimer';
import { LEVEL_1_VOCABULARY } from '@/constants/gradeBased/level1Vocabulary';
import { LEVEL_2_VOCABULARY } from '@/constants/gradeBased/level2Vocabulary';
import { LEVEL_3_VOCABULARY } from '@/constants/gradeBased/level3Vocabulary';

// Minimal deterministic splitter (subset of the main engine heuristics, no deps)
function splitWordSimple(word: string): string[] {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return [word.toLowerCase()];
  if (clean.length <= 2) return [clean];

  const vowels = 'aeiou';
  const vowelTeams = new Set(['aa','ee','ea','ei','ey','ie','oa','oo','ou','ow','oi','oy','ai','ay','au','ue']);

  const chunks: string[] = [];
  let current = '';
  let lastWasVowel = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const isVowel = vowels.includes(ch);

    if (isVowel && lastWasVowel && current.length > 0) {
      const prev = clean[i - 1] || '';
      const pair = (prev + ch);
      if (vowelTeams.has(pair)) {
        current += ch;
      } else {
        chunks.push(current);
        current = ch;
      }
    } else if (!isVowel && lastWasVowel && i < clean.length - 1) {
      const nextIsVowel = vowels.includes(clean[i + 1]);
      if (nextIsVowel && current.length > 1) {
        current += ch;
        chunks.push(current);
        current = '';
      } else {
        current += ch;
      }
    } else {
      current += ch;
    }

    lastWasVowel = isVowel;
  }

  if (current) chunks.push(current);

  // Edge tweaks
  if (clean.startsWith('wh') && chunks.length > 0) {
    chunks[0] = 'whuh';
  }

  return chunks.filter(Boolean);
}

function buildWordSet(): Set<string> {
  const s = new Set<string>();
  for (const w of ENHANCED_LEVEL_0_VOCABULARY) s.add(String(w));
  for (const w of LEVEL_1_VOCABULARY) s.add(String(w));
  for (const w of LEVEL_2_VOCABULARY) s.add(String(w));
  for (const w of LEVEL_3_VOCABULARY) s.add(String(w));
  return s;
}

const autoDict: Record<string, string[]> = {};
for (const word of buildWordSet()) {
  const key = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!key) continue;
  autoDict[key] = splitWordSimple(key);
}

export default autoDict;
