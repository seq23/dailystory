// The long-form legal pages at phone widths (coordinator, 22 Nov 2026): their `prose` sections showed
// headings as plain body text and lists without bullets, because the typography plugin was installed
// but never registered. Each page must show a real heading (bigger and bolder than its paragraphs) or
// real bullets, nothing may run off the screen, and the capture is kept for review. The site has one
// light theme (no dark class is ever set), so the captures are light only.
import { expect, test } from '@playwright/test';

const PAGES = ['/privacy', '/terms', '/ccpa', '/accessibility', '/data-transfers'] as const;

for (const width of [320, 390] as const) {
  for (const path of PAGES) {
    test(`${path} at ${width} px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
        ? route.continue() : route.abort());
      await page.goto(path);
      const consent = page.getByRole('button', { name: 'Only needed', exact: true });
      if (await consent.isVisible().catch(() => false)) await consent.click();
      const prose = page.locator('.prose');
      await expect(prose.first()).toBeVisible({ timeout: 20_000 });
      // Blocks marked not-prose (cards, grids) keep their own styles, so only prose-styled elements count.
      const styles = await page.evaluate(() => {
        const css = (el: Element | null) => (el ? getComputedStyle(el) : null);
        const h2 = css(document.querySelector('.prose h2:not(.not-prose *)'));
        const p = css(document.querySelector('.prose p:not(.not-prose *)'));
        const ul = css(document.querySelector('.prose ul:not(.not-prose *)'));
        return {
          h2: h2 && { size: parseFloat(h2.fontSize), weight: Number(h2.fontWeight) },
          p: p && { size: parseFloat(p.fontSize) },
          ul: ul && { bullet: ul.listStyleType, pad: parseFloat(ul.paddingLeft) },
        };
      });
      expect(styles.h2 || styles.ul, `${path} has a prose heading or list to check`).toBeTruthy();
      if (styles.h2) {
        expect(styles.h2.size, `${path} heading is bigger than its text`).toBeGreaterThanOrEqual(styles.p!.size * 1.2);
        expect(styles.h2.weight, `${path} heading is bold`).toBeGreaterThanOrEqual(600);
      }
      if (styles.ul) {
        expect(styles.ul.bullet, `${path} list shows bullets`).toBe('disc');
        expect(styles.ul.pad, `${path} list is indented`).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} fits ${width} px`).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath(`${path.slice(1)}-${width}.png`), fullPage: true });
    });
  }
}
