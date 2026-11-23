// /subprocessors at phone widths, light and dark (reviewer #163, 22 Nov 2026): every tier
// question shows its answer, nothing runs off the screen, and the capture is kept for review.
import { expect, test } from '@playwright/test';

for (const width of [320, 390] as const) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`/subprocessors at ${width} px, ${colorScheme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
        ? route.continue() : route.abort());
      await page.goto('/subprocessors');
      const consent = page.getByRole('button', { name: 'Only needed', exact: true });
      if (await consent.isVisible().catch(() => false)) await consent.click();
      const questions = page.getByRole('heading', { level: 2 });
      await expect(questions).toHaveCount(4, { timeout: 20_000 });
      for (const tier of ['high', 'medium', 'low']) {
        const answer = page.getByTestId(`tier-answer-${tier}`);
        await expect(answer).toBeVisible();
        const box = await answer.boundingBox();
        expect(box!.x + box!.width, `${tier} answer fits the screen`).toBeLessThanOrEqual(width + 1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath(`subprocessors-${width}-${colorScheme}.png`), fullPage: true });
    });
  }
}
