import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';

// Plural-aware syllable breakdown tests for kid-friendly chunks

describe('Plural-aware syllable breakdowns', () => {
  beforeEach(() => {
    (global as any).fetch = vi.fn().mockRejectedValue(new Error('network disabled'));
  });

  const cases: Array<[string, string[]]> = [
    ['cats', ['cat', 's']],
    ['dogs', ['dog', 's']],
    ['boxes', ['box', 'es']],
    ['buses', ['bus', 'es']],
    ['beaches', ['beach', 'es']],
    ['puppies', ['pup', 'py', 's']],
    ['heroes', ['he', 'ro', 'es']],
  ];

  it('handles common plural patterns reliably for learners', async () => {
    for (const [word, expected] of cases) {
      const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync(word);
      expect(chunks).toEqual(expected);
    }
  });
});
