import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import i18n, { applyDocumentLanguage } from '@/i18n/config';

const root = join(__dirname, '../../i18n/locales');
const flatten = (value: object, prefix = ''): Record<string, string> => Object.fromEntries(
  Object.entries(value).flatMap(([key, entry]) => typeof entry === 'object' && entry !== null
    ? Object.entries(flatten(entry, `${prefix}${key}.`)) : [[prefix + key, entry]]),
);
const read = (lng: string) => flatten(JSON.parse(readFileSync(join(root, `${lng}.json`), 'utf8')));
const english = read('en');
// Product names, legal acronyms, unchanged price amounts, and a numeric page counter.
const identicalAllowed = new Set([
  'welcomeHero.footer.companyName', 'ui.heygetonmylevel', 'welcomeHero.footer.ccpa', 'welcomeHero.footer.gdpr', 'welcomeHero.footer.ferpa',
  'loginScreen.plans.monthly.price', 'loginScreen.plans.annual.price', 'freeReadingSession.navigation.pageInfo',
]);
const slots = (value: string) => [...value.matchAll(/\{\{\s*([^{}]+)\s*\}\}|(?<!\{)\{([^{}]+)\}(?!\})/g)]
  .map(m => `${m[1] ? 'double:' : 'single:'}${(m[1] || m[2]).trim()}`).sort();
afterEach(async () => { await i18n.changeLanguage('en'); });
describe('every UI language is complete', () => {
  it.each(['es', 'fr', 'ar', 'hi', 'pt', 'ur', 'zh'])('%s has every English key, translated nonempty text and all placeholders', (language) => {
    const locale = read(language);
    const problems: string[] = [];
    for (const [key, source] of Object.entries(english)) {
      const value = locale[key];
      if (typeof value !== 'string' || !value.trim()) problems.push(`${key}: missing or empty`);
      else {
        if (value.trim().normalize('NFKC').toLowerCase() === source.trim().normalize('NFKC').toLowerCase() && !identicalAllowed.has(key)) problems.push(`${key}: unchanged English`);
        if (JSON.stringify(slots(value)) !== JSON.stringify(slots(source))) problems.push(`${key}: changed placeholders`);
      }
    }
    expect(problems).toEqual([]);
  });
  it.each(['ar', 'ur', 'ar-SA', 'ur-PK'])('sets RTL at startup and for regional tag %s', (language) => {
    applyDocumentLanguage(language);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe(language.split('-')[0]);
    expect(document.body).toHaveClass(`lang-${language.split('-')[0]}`);
  });
  it('changes RTL to LTR without removing unrelated body classes', () => {
    document.body.classList.add('app-ready');
    applyDocumentLanguage('ur');
    applyDocumentLanguage('fr-FR');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.body).toHaveClass('app-ready', 'lang-fr');
    expect(document.body).not.toHaveClass('lang-ur');
  });
});

// Catalog parity alone cannot catch a screen still calling a missing key or falling back to English.
import ts from 'typescript';
import { globSync } from 'glob';
import { uiText } from '@/i18n/uiText';
import { uiGradeLabel } from '@/i18n/gradeLabel';
import { premiumUntilLabel } from '@/lib/accessCode';
import { childSummary } from '@/components/children/childInfo';
import { freeFeatures, premiumFeatures, additionalOfferings, enterpriseFeatures } from '@/constants/featureLists';

describe('translated copy is connected to the screens', () => {
  it('public route controls use the catalog instead of raw known English UI copy', () => {
    const values = new Set(Object.values(english));
    const untranslated: string[] = [];
    for (const file of globSync('src/pages/*.tsx', { ignore: ['src/pages/StylePreview.tsx', 'src/pages/TemplateTestingPage.tsx', 'src/pages/PromptTesting.tsx'] })) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (node: ts.Node) => {
        // Bold vendor/legal prose can contain product names that are also English verbs.
        if (ts.isJsxText(node) && ts.isJsxElement(node.parent) && node.parent.openingElement.tagName.getText(source) === 'strong') return;
        if (ts.isJsxText(node) && /[a-zA-Z]/.test(node.text) && values.has(node.text.trim())) {
          untranslated.push(`${file}: ${node.text.trim()}`);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(untranslated).toEqual([]);
  });
  it('every literal t() key and uiText() phrase in app code exists in English', () => {
    const values = new Set(Object.values(english));
    const missing: string[] = [];
    for (const file of globSync('src/**/*.{ts,tsx}', { ignore: ['src/test/**', 'src/**/__tests__/**', 'src/i18n/uiText.ts'] })) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
          const name = node.expression.getText(source);
          const value = node.arguments[0].text;
          if (['t', 'i18n.t'].includes(name) && !(value in english)) missing.push(`${file}: ${value}`);
          if (name === 'uiText' && !values.has(value)) missing.push(`${file}: ${value}`);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(missing).toEqual([]);
  });
  it('every feature displayed by the plan cards has a translated catalog entry', () => {
    const values = new Set(Object.values(english));
    expect([...freeFeatures, ...premiumFeatures, ...additionalOfferings, ...enterpriseFeatures].filter(f => !values.has(f))).toEqual([]);
  });
  it.each(['es', 'fr', 'ar', 'hi', 'pt', 'ur', 'zh'])('%s translates dates, grade labels and October child summaries without changing their values', async (language) => {
    await i18n.changeLanguage(language);
    expect(uiText('Your grown-up account')).not.toBe('Your grown-up account');
    const question = uiText('Question {{current}} of {{total}}', { current: 2, total: 4 });
    expect(question).not.toBe('Question 2 of 4');
    expect(question).not.toContain('{{');
    expect(premiumUntilLabel('2030-02-01T00:00:00Z')).not.toMatch(/Premium active until|February/);
    expect(uiGradeLabel('10')).not.toMatch(/10th|Grade|formStep/);
    expect(childSummary({ grade_level: '5', reading_grade: '10', birth_year: null } as never)).not.toMatch(/School:|Reads at|grade|Grade/);
  });
  it('keeps English story content LTR while Arabic and Urdu UI use RTL', () => {
    const reader = readFileSync(join(__dirname, '../../components/CleanStoryDisplay.tsx'), 'utf8');
    expect(reader.match(/dir="ltr" lang="en"\s+className=\{cn\("story-content/g)).toHaveLength(2);
    expect(reader).not.toContain('dir="ltr" lang="en" role="main"');
    const sidebar = readFileSync(join(__dirname, '../../components/PremiumSidebar.tsx'), 'utf8');
    expect(sidebar).toContain('document.documentElement.dir === "rtl" ? "right" : "left"');
    const css = readFileSync(join(__dirname, '../../index.css'), 'utf8');
    expect(css).toContain('[dir="rtl"] .text-left { text-align: start; }');
    expect(css).not.toContain('[dir="rtl"] .homepage header,');
  });
});
