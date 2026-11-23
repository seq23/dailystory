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
      const outside: string[] = [];
      await page.route('**/*', route => {
        const url = route.request().url();
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(url)) return route.continue();
        outside.push(new URL(url).host);
        return route.abort();
      });
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
      // No cell clipped: a table cell whose text is wider than the cell, or a cell or stacked row
      // reaching past the screen, fails (the 320 px /privacy table did both before 22 Nov 2026).
      const clipped = await page.evaluate((w) => [...document.querySelectorAll('td, th, [data-testid="basis-row"], [data-testid="transfer-row"]')]
        .filter((el) => { const b = el.getBoundingClientRect(); return el.scrollWidth > el.clientWidth + 1 || b.left < -1 || b.right > w + 1; })
        .map((el) => (el.textContent ?? '').trim().slice(0, 60)), width);
      expect(clipped, `${path} clipped cells at ${width} px`).toEqual([]);
      if (path === '/privacy') {
        // Each legal-basis row stacks: its category, purpose and basis all on screen.
        await expect(page.getByTestId('basis-row')).toHaveCount(7);
        await expect(page.getByTestId('basis-row').filter({ hasText: 'Voice clips' })).toContainText('Parental consent (Art. 6(1)(a), Art. 8)');
      }
      if (path === '/data-transfers') {
        // Every processor's purpose and DPA status sits on screen, not behind a sideways scroll.
        const rows = page.getByTestId('transfer-row');
        await expect(rows).toHaveCount(13);
        for (const row of await rows.all()) {
          const box = await row.boundingBox();
          expect(box!.x + box!.width, `${await row.locator('p').first().innerText()} fits ${width} px`).toBeLessThanOrEqual(width);
        }
        await expect(page.getByText(/· DPA signed$/)).toHaveCount(6);
        await expect(page.getByText(/· DPA in progress$/)).toHaveCount(3);
      }
      // The fonts are our own files now (22 Nov 2026): the faces load from this site, and the page
      // asks Google and Microsoft for nothing.
      const loaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
      });
      // Body copy is Inter and headings Fredoka (index.css); both must have loaded from our files.
      expect(loaded, `${path} paints in the self-hosted fonts`).toEqual(expect.arrayContaining(['Fredoka', 'Inter']));
      expect(outside.filter((h) => /(^|\.)(clarity\.ms|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(h)), `${path} asks no banned host`).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${path.slice(1)}-${width}.png`), fullPage: true });
    });
  }
}
