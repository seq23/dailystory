import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

// A real Chromium microphone (Chrome's fake device), a phone screen, and the
// speech service mocked: the child taps the microphone, "says" a command, and the
// reader does it. Invented fixtures only; no paid inference.
test.use({
  viewport: { width: 390, height: 844 },
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`voice commands turn pages on a phone (${colorScheme})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
      ? route.continue() : route.abort());
    await page.addInitScript(() => localStorage.setItem('storyImagesEnabled', '0'));
    const user = makeUser();
    const first = 'The little fox walks to a big tree. A bird sits on a low branch. The fox sees a blue door and a small red key.';
    const second = 'The fox asks the bird for help. The bird points to the key and smiles. Together they lift the key to the blue door.';
    const state = await mockSupabase(page, { user, story: { success: true, pages: [first] }, tables: {
      child_profiles: [{ id: '22222222-2222-4222-8222-222222222222', parent_user_id: user.id, display_name: 'Pip', age: 7, grade_level: '2', avatar: { type: 'prefer-not-to-answer' } }],
      subscribers: [{ id: 'fixture-sub', user_id: user.id, email: user.email, subscribed: true, subscription_end: '2035-01-01T00:00:00Z', subscription_tier: 'monthly' }],
    } });
    await signInAs(page, user);
    await page.goto('/');
    await page.getByRole('button', { name: 'Only needed', exact: true }).click();
    await page.getByRole('button', { name: /create your first story/i }).click();
    const dialog = page.getByTestId('new-story-dialog');
    await dialog.getByRole('button', { name: /\+ space/i }).click();
    await dialog.getByTestId('write-story').click();
    const text = page.getByTestId('story-text-scroll-mobile');
    await expect(text).toContainText('The little fox', { timeout: 20_000 });

    const mic = page.getByTestId('story-voice-commands');
    await expect(mic).toBeVisible();
    const box = (await mic.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    // Nothing on the page is wider than the phone.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.screenshot({ path: testInfo.outputPath(`voice-${colorScheme}-idle.png`) });

    // "Next page" on the last written page asks for the next page, as the Next button does.
    state.voiceText = 'Next page.';
    state.story = { success: true, pages: [second] };
    await mic.click();
    await expect(mic).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: testInfo.outputPath(`voice-${colorScheme}-listening.png`) });
    await expect(text).toContainText('The fox asks the bird for help', { timeout: 20_000 });
    expect(state.calls.filter(c => c.fn === 'voice-to-text').at(-1)?.body).toMatchObject({ mode: 'command' });

    // "Go back" returns to the first page without writing anything new.
    const written = state.calls.filter(c => c.fn === 'generate-adaptive-story').length;
    state.voiceText = 'Go back';
    await mic.click();
    await expect(text).toContainText('The little fox', { timeout: 20_000 });
    expect(state.calls.filter(c => c.fn === 'generate-adaptive-story')).toHaveLength(written);

    // Anything else is not acted on, and the child is told what to say.
    state.voiceText = 'banana';
    await mic.click();
    await expect(page.getByText('I didn’t catch that')).toBeVisible({ timeout: 20_000 });
    await expect(text).toContainText('The little fox');
    await page.screenshot({ path: testInfo.outputPath(`voice-${colorScheme}-not-understood.png`) });
  });
}
