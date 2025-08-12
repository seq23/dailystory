import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';

// Kid-friendly syllable breakdowns for tricky words

describe('Kid-friendly syllable breakdowns (curated + heuristics)', () => {
  beforeEach(() => {
    (global as any).fetch = vi.fn().mockRejectedValue(new Error('network disabled'));
  });

  const cases: Array<[string, string[]]> = [
    ['soccer', ['soc', 'cer']],
    ['trees', ['tr', 'ee', 's']],
    ['apple', ['ap', 'ple']],
    ['better', ['bet', 'ter']],
  ];

  it('produces expected splits for common learner words', async () => {
    for (const [word, expected] of cases) {
      const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync(word);
      expect(chunks).toEqual(expected);
    }
  });
});
