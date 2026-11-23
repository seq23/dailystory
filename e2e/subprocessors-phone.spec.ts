// /subprocessors at phone widths (reviewer #163, 22 Nov 2026): every tier question shows its
// answer, nothing runs off the screen, the DPA badges are the tracker's, and the capture is
// kept. The site has one light theme (no dark class is ever set), so the captures are light only.
import { expect, test } from '@playwright/test';

for (const width of [320, 390] as const) {
  test(`/subprocessors at ${width} px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
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
    // Every vendor card fits too: a clipped card passes the page scrollWidth check (22 Nov 2026 capture).
    const cards = page.locator('section[aria-labelledby^="tier-"] > .grid > *');
    await expect(cards).toHaveCount(15);
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      expect(box!.x + box!.width, `${await card.locator('h3').first().innerText()} card fits the screen`).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    // DPA status (owner, 22 Nov 2026): 6 signed, ElevenLabs and Runware in progress, from src/data/subprocessors.ts.
    await expect(page.getByText('DPA signed', { exact: true })).toHaveCount(6);
    await expect(page.getByText('DPA in progress', { exact: true })).toHaveCount(2);
    await page.screenshot({ path: testInfo.outputPath(`subprocessors-${width}.png`), fullPage: true });
  });
}

// The old address moves to the one list (coordinator, 22 Nov 2026): no second vendor page.
test('/vendors moves to /subprocessors', async ({ page }) => {
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
  await page.goto('/vendors');
  await expect(page).toHaveURL(/\/subprocessors$/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('DPA signed', { exact: true })).toHaveCount(6);
});
