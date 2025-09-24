import { describe, it, expect } from 'vitest';
import phonicsMiniDict from '@/data/phonicsMiniDict';

describe('PhonicsMinDict', () => {
  it('provides correct syllable breakdowns for key words', () => {
    expect(phonicsMiniDict['illuminating']).toEqual(['ill', 'loo', 'muh', 'nay', 'ting']);
    expect(phonicsMiniDict['what']).toEqual(['whuh','ut']);
    expect(phonicsMiniDict['green']).toEqual(['gr','ee','n']);
    expect(phonicsMiniDict['chase']).toEqual(['chay','s']);
    expect(phonicsMiniDict['found']).toEqual(['found']); // Single syllable - NOT "find past"
  });

  it('handles known tricky words correctly', () => {
    expect(phonicsMiniDict['illuminate']).toEqual(['ill','loo','muh','nate']);
    expect(phonicsMiniDict['hello']).toEqual(['heh', 'loh']);
    expect(phonicsMiniDict['happy']).toEqual(['hap', 'ee']);
  });
});