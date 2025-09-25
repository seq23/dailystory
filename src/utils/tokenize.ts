import { UnifiedTokenizationService } from '@/services/UnifiedTokenizationService';

export interface Tokenization {
  tokens: string[]; // includes whitespace tokens
  isWhitespace: boolean[];
  wordOnlyIndexByTokenIndex: number[]; // -1 for whitespace tokens
  wordsOnly: string[]; // non-whitespace tokens, preserves punctuation
}

// Split text preserving whitespace tokens and compute mapping to word-only indices
// Now uses UnifiedTokenizationService for consistency across audio and UI systems
export function tokenizeForHighlighting(text: string): Tokenization {
  return UnifiedTokenizationService.getTokenization(text);
}

// Lightweight string hash (non-crypto) for content identity
export function hashText(s: string): string {
  let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0, ch; i < s.length; i++) {
    ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // Combine into hex string
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
