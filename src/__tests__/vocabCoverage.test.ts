import { describe, it, expect } from 'vitest';
import { computeCoverage } from '@/utils/vocabCoverage';
import { validateLevel2Sentence } from '@/constants/gradeBased';

describe('computeCoverage', () => {
  it('normalizes punctuation and matches Level 2 contractions', () => {
    const sentence1 = "don't";
    const sentence2 = 'dont';
    const c1 = computeCoverage(sentence1, 2, { userName: 'Sam' });
    const c2 = computeCoverage(sentence2, 2, { userName: 'Sam' });
    expect(c1.coverage).toBe(1);
    expect(c2.coverage).toBe(1);

    const v1 = validateLevel2Sentence(sentence1);
    const v2 = validateLevel2Sentence(sentence2);
    expect(v1.isValid).toBe(true);
    expect(v2.isValid).toBe(true);
  });

  it('does not penalize the user name', () => {
    const c = computeCoverage('Sequoia loves pizza', 1, { userName: 'Sequoia' });
    expect(c.coverage).toBeGreaterThan(0);
  });
});
