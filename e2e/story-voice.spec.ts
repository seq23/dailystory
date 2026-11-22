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
    // One quiet listening sign: a red dot on the microphone itself, inside its own
    // button, so it covers neither the header nor the story text; no banner or toast.
    const dot = page.getByTestId('story-voice-listening');
    await expect(dot).toHaveCount(1);
    const dotBox = (await dot.boundingBox())!;
    const micBox = (await mic.boundingBox())!;
    expect(dotBox.x).toBeGreaterThanOrEqual(micBox.x - 1);
    expect(dotBox.x + dotBox.width).toBeLessThanOrEqual(micBox.x + micBox.width + 1);
    expect(dotBox.y).toBeGreaterThanOrEqual(micBox.y - 1);
    await expect(mic.locator('.lucide-mic-off')).toHaveCount(0);
    await expect(page.getByText(/Listening/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`voice-${colorScheme}-listening.png`) });
    await expect(text).toContainText('The fox asks the bird for help', { timeout: 20_000 });
    const sent = state.calls.filter(c => c.fn === 'voice-to-text').at(-1)?.body as { mode?: string; language?: string };
    expect(sent).toMatchObject({ mode: 'command' });
    expect(sent.language).toMatch(/^en/);

    // "Go back" returns to the first page without writing anything new.
    const written = state.calls.filter(c => c.fn === 'generate-adaptive-story').length;
    state.voiceText = 'Go back';
    await mic.click();
    await expect(text).toContainText('The little fox', { timeout: 20_000 });
    expect(state.calls.filter(c => c.fn === 'generate-adaptive-story')).toHaveLength(written);

    // Anything else is not acted on, and the child is told what to say.
    state.voiceText = 'banana';
    await mic.click();
    await expect(page.getByText('I didn’t catch that').first()).toBeVisible({ timeout: 20_000 });
    await expect(text).toContainText('The little fox');
    await page.screenshot({ path: testInfo.outputPath(`voice-${colorScheme}-not-understood.png`) });
  });
}

// At the smallest phones the microphone sits between the page count and Next, never on top of
// either button (the 320 px capture of 22 Nov 2026 showed only "xt" of Next).
for (const width of [320, 360] as const) {
  test(`the microphone never covers Back or Next at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
      ? route.continue() : route.abort());
    await page.addInitScript(() => localStorage.setItem('storyImagesEnabled', '0'));
    const user = makeUser();
    await mockSupabase(page, { user, story: { success: true, pages: ['The little fox walks to a big tree. A bird sits on a low branch.'] }, tables: {
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
    await expect(page.getByTestId('story-text-scroll-mobile')).toContainText('The little fox', { timeout: 20_000 });
    const mic = page.getByTestId('story-voice-commands');
    await expect(mic).toBeVisible();
    const nav = page.locator('.story-navigation-controls:visible').first();
    const m = (await mic.boundingBox())!;
    for (const name of [/next/i, /back/i]) {
      const b = (await nav.getByRole('button', { name }).boundingBox())!;
      const overlap = Math.min(m.x + m.width, b.x + b.width) - Math.max(m.x, b.x);
      expect(overlap, `the microphone overlaps ${name} by ${overlap}px at ${width}px`).toBeLessThanOrEqual(0);
      expect(b.x + b.width, `${name} runs off the screen`).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
