import { describe, it, expect } from 'vitest';
import { isLevel2Word, validateLevel2Sentence } from '@/constants/gradeBased';

describe('Level 2 vocabulary punctuation normalization', () => {
  it('treats "don\'t" and "dont" as valid Level 2 words', () => {
    expect(isLevel2Word("don't")).toBe(true);
    expect(isLevel2Word('dont')).toBe(true);
  });

  it('validates sentences containing "don\'t" and "dont"', () => {
    const r1 = validateLevel2Sentence("don't");
    expect(r1.isValid).toBe(true);
    expect(r1.invalidWords).toEqual([]);

    const r2 = validateLevel2Sentence('dont');
    expect(r2.isValid).toBe(true);
    expect(r2.invalidWords).toEqual([]);
  });
});
