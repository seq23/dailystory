import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';

// Deterministic pipeline: overrides -> heuristic only

describe('PhoneticRulesEngine golden cases (deterministic)', () => {
  beforeEach(() => {
    // Ensure no network usage
    (global as any).fetch = vi.fn().mockRejectedValue(new Error('network disabled'));
  });

  const cases: Array<[string, string[]]> = [
    ['what', ['whuh','ut']],
    ['green', ['gr','ee','n']],
    ['chase', ['chay','s']],
    ['smiles', ['smiles']],
    ['good', ['good']],
    ['illuminate', ['ill','loo','muh','nate']],
    ['illumination', ['ill','loo','muh','nay','shun']],
    ['illuminating', ['ill','loo','muh','nay','ting']],
  ];

  it('returns expected kid-friendly chunks for golden cases', async () => {
    for (const [word, expected] of cases) {
      const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync(word);
      expect(chunks).toEqual(expected);
    }
  });
});
