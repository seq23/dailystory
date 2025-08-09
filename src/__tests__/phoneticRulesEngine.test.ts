import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';

describe('PhoneticRulesEngine', () => {
  beforeEach(() => {
    // By default make fetch reject so we use fallback/known syllables
    (global as any).fetch = vi.fn().mockRejectedValue(new Error('network off'));
  });

  it('does not break "illuminating" incorrectly and returns expected chunks', async () => {
    const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync('ILLUMINATING');
    expect(chunks).toEqual(['ih', 'loo', 'muh', 'nay', 'ting']);
  });

  it('handles known tricky words', async () => {
    expect(await phoneticRulesEngine.breakIntoSyllablesAsync('what')).toEqual(['whuh','ut']);
    expect(await phoneticRulesEngine.breakIntoSyllablesAsync('green')).toEqual(['gr','ee','n']);
    expect(await phoneticRulesEngine.breakIntoSyllablesAsync('chase')).toEqual(['ch','ay','s']);
  });

  it('groups phones into proper syllables via ARPABET when available', async () => {
    // Mock datamuse ARPABET response for "illuminate" -> IH L UW M AH N EY T
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ tags: ['pron:IH L UW M AH N EY T'] }])
    });
    const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync('illuminate');
    // Expect syllables roughly: ih | loo | muh | nate
    expect(chunks).toEqual(['ih','loo','muh','nate']);
  });
});
