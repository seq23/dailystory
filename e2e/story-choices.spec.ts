import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

test.use({ viewport: { width: 390, height: 844 } });

test('Premium choices fit a phone, drive the next page, and disappear after Finish Story', async ({ page }, testInfo) => {
  // Invented fixtures only. No paid inference, images, email or database requests.
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem('storyImagesEnabled', '0'));
  const user = makeUser();
  const first = 'The little fox walks to a big tree. A bird sits on a low branch. The fox sees a blue door and a small red key. The bird waves a wing and sings a song.';
  const next = 'The fox asks the bird for help. The bird points to the key and smiles. Together they lift the key to the blue door. A soft light shines from the lock. Something inside begins to sing.';
  const ending = 'The fox opens the door and finds a warm room full of books. The bird reads a story with the fox. They walk home under the bright stars, happy to have made a new friend. The end.';
  const options = ['Open the door', 'Ask the bird for help', 'Look at the key'];
  const state = await mockSupabase(page, { user, story: { success: true, pages: [first], choices: options }, tables: {
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
  const choices = page.getByRole('region', { name: 'Pick what happens next' });
  await expect(choices).toBeVisible({ timeout: 20_000 });
  const buttons = choices.getByRole('button');
  await expect(buttons).toHaveCount(3);
  for (const button of await buttons.all()) {
    await button.scrollIntoViewIfNeeded();
    const rect = await button.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.height).toBeGreaterThanOrEqual(48);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(390);
  }
  await choices.screenshot({ path: testInfo.outputPath('choices-phone.png') });
  const generated = () => state.calls.filter(c => c.fn === 'generate-adaptive-story');
  const before = generated().length;
  state.story = { success: true, pages: [next], choices: ['Turn the key', 'Listen to the song', 'Look for a window'] };
  await choices.getByRole('button', { name: options[1], exact: true }).click();
  await expect(page.getByTestId('story-text-scroll-mobile')).toContainText('The fox asks the bird for help');
  expect(generated()).toHaveLength(before + 1);
  expect(generated()[before].body.config).toMatchObject({ selectedChoice: options[1], sessionType: 'premium', pageNumber: 2 });

  // Going back is reading, not a new branch or another generation call.
  await page.getByRole('button', { name: /^back$/i }).first().click();
  await expect(choices).toHaveCount(0);
  await page.getByRole('button', { name: /^next$/i }).first().click();
  await expect(choices).toBeVisible();
  expect(generated()).toHaveLength(before + 1);

  state.story = { success: true, pages: [ending] };
  await page.getByRole('button', { name: /^finish story!?$/i }).first().click();
  await page.getByRole('button', { name: 'Yes, I’m ready for the last page!', exact: true }).click();
  await expect(page.getByTestId('story-text-scroll-mobile')).toContainText('The end.');
  expect(generated()[generated().length - 1].body.config.isEndingPage).toBe(true);
  await expect(choices).toHaveCount(0);
});
