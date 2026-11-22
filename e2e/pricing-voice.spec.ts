import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';
import { READ_ALOUD_FREE_SENTENCES_PER_DAY } from '../src/lib/freeStoryAllowance';
import { STORY_VOICE_COMMANDS } from '../src/lib/voice/storyVoiceCommands';

// /pricing tells the truth about voice and read-aloud (her ruling 22 Nov 2026):
// guests get neither; a free account gets voice commands and
// READ_ALOUD_FREE_SENTENCES_PER_DAY practice sentences a day; Premium is unlimited.
// Captured at 390 and 820 px, light and dark, guest and signed in, for review.
for (const width of [390, 820] as const) {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const who of ['guest', 'signed-in'] as const) {
      test(`/pricing voice and read-aloud at ${width} px, ${colorScheme}, ${who}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
          ? route.continue() : route.abort());
        const user = makeUser();
        const state = await mockSupabase(page, { user, tables: {} });
        if (who === 'signed-in') await signInAs(page, user);
        await page.goto('/pricing');
        const consent = page.getByRole('button', { name: 'Only needed', exact: true });
        if (await consent.isVisible().catch(() => false)) await consent.click();

        const free = page.getByText(`Read-aloud practice, ${READ_ALOUD_FREE_SENTENCES_PER_DAY} sentences a day (free account)`, { exact: true });
        await expect(free).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText('Unlimited read-aloud practice', { exact: true })).toBeVisible();
        await expect(page.getByTestId('coach-plans')).toContainText(`Free account: ${READ_ALOUD_FREE_SENTENCES_PER_DAY} sentences a day`);
        await expect(page.getByTestId('voice-plans')).toContainText('sign in');
        const commands = page.getByTestId('voice-command-list').getByRole('listitem');
        await expect(commands).toHaveCount(STORY_VOICE_COMMANDS.length);
        // No line still sells voice or coaching as Premium-only.
        await expect(page.getByText(/Speech.to.text feedback — Premium/)).toHaveCount(0);

        if (who === 'guest') {
          await expect(page.getByTestId('coach-sign-in')).toBeVisible();
          await expect(page.getByRole('button', { name: /Start Reading/ })).toHaveCount(0);
        } else {
          await expect(page.getByRole('button', { name: /Start Reading/ })).toBeVisible();
          await expect(page.getByTestId('coach-sign-in')).toHaveCount(0);
        }
        expect(state.calls.filter(c => c.fn === 'voice-to-text')).toHaveLength(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

        await page.getByTestId('coach-plans').scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath(`pricing-voice-${width}-${colorScheme}-${who}.png`), fullPage: true });
      });
    }
  }
}

// /prompt-testing is for the owner's admin account: a logged-out visit is refused.
test('/prompt-testing refuses a logged-out visit at 390 px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
  const state = await mockSupabase(page, { tables: {} });
  await page.goto('/prompt-testing');
  const gate = page.getByTestId('admin-only');
  await expect(gate).toHaveAttribute('data-access', 'signed_out', { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Sign in required' })).toBeVisible();
  await expect(page.getByText(/Testing Console/)).toHaveCount(0);
  expect(state.calls.filter(c => c.fn === 'voice-overrides-admin')).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath('prompt-testing-logged-out-390.png') });
});
