import { describe, it, expect } from 'vitest';
import i18n from '@/i18n/config';

describe('i18n config', () => {
  it('updates document direction, lang, and body class on language change', async () => {
    await i18n.changeLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.body.className).toContain('lang-ar');

    await i18n.changeLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.body.className).toContain('lang-en');
  });
});
