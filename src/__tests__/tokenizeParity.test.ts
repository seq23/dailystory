import { describe, expect, it } from 'vitest';
import { tokenizeForHighlighting } from '@/utils/tokenize';

// Helper to manually compute words-only array the same way as UI tokens map
function manualWordsOnly(text: string): string[] {
  const tokens = text.split(/(\s+)/);
  return tokens.filter(t => !( /^\s+$/.test(t) ) && t.trim().length > 0);
}

describe('tokenizeForHighlighting', () => {
  it('preserves whitespace tokens and maps indices correctly', () => {
    const text = 'Hello, world!  This is\nnew-line.';
    const { tokens, isWhitespace, wordOnlyIndexByTokenIndex, wordsOnly } = tokenizeForHighlighting(text);

    // Tokens round-trip
    expect(tokens.join('')).toBe(text);

    // wordsOnly should match manual extraction
    expect(wordsOnly).toEqual(manualWordsOnly(text));

    // Mapping sanity: every non-whitespace token should point to a valid wordsOnly index
    tokens.forEach((tok, i) => {
      if (isWhitespace[i]) {
        expect(wordOnlyIndexByTokenIndex[i]).toBe(-1);
      } else {
        const idx = wordOnlyIndexByTokenIndex[i];
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(wordsOnly.length);
        expect(wordsOnly[idx]).toBe(tok);
      }
    });
  });

  it('handles leading/trailing/multiple spaces and punctuation', () => {
    const text = '  "A quick, brown fox" jumps.  ';
    const { wordsOnly } = tokenizeForHighlighting(text);
    expect(wordsOnly).toEqual(['"A', 'quick,', 'brown', 'fox"', 'jumps.']);
  });

  it('works with multilingual text', () => {
    const text = 'Hola, mundo!  Bonjour le monde.';
    const { wordsOnly } = tokenizeForHighlighting(text);
    expect(wordsOnly).toEqual(['Hola,', 'mundo!', 'Bonjour', 'le', 'monde.']);
  });
});
