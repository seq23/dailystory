import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

// These browser checks use invented fixtures and block every external service.
test.use({ viewport: { width: 390, height: 844 } });
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
});

test('native Back restores the library, reader page and summary from the quiz', async ({ page }) => {
  const user = makeUser();
  const childId = '22222222-2222-4222-8222-222222222222';
  const first = 'The little comet followed a bright path through the quiet sky. It found a small silver bell near a blue star. The comet wondered who had left it there and decided to look for its owner.';
  const second = 'A friendly moon waved from behind a cloud. The comet showed the silver bell to the moon. Together they rang it softly and heard a tiny spaceship answer from far away. They smiled and set off to help.';
  const story = { id: 'fixture-comet', title: 'The Comet Bell', segments: [{ text: first }, { text: second }], difficulty: 'beginner', readingGrade: '2', wordCount: 78, estimatedReadingTime: 2 };
  const state = await mockSupabase(page, { user, tables: {
    child_profiles: [{ id: childId, parent_user_id: user.id, display_name: 'Comet Reader', grade_level: '2', avatar: { type: 'boy', skinTone: 'medium' } }],
    subscribers: [{ id: 'fixture-sub', user_id: user.id, email: user.email, subscribed: true, subscription_end: '2035-01-01T00:00:00Z', subscription_tier: 'monthly' }],
    saved_stories: [{ id: 'fixture-saved', user_id: user.id, title: story.title, content: story, difficulty: story.difficulty, reading_grade: '2', word_count: 78, estimated_reading_time: 2, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' }],
  } });
  await signInAs(page, user);
  await page.goto('/');
  await page.getByRole('button', { name: 'Only needed', exact: true }).click();
  await page.getByRole('button', { name: 'Read Story', exact: true }).first().click();
  const text = page.getByTestId('story-text-scroll-mobile');
  await expect(text).toContainText('The little comet followed', { timeout: 20_000 });
  await page.getByRole('button', { name: /^next$/i }).first().click();
  await expect(text).toContainText('A friendly moon waved');
  expect(state.calls.filter(c => c.fn === 'generate-adaptive-story')).toHaveLength(0);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'My Stories', exact: true })).toBeVisible();
  await expect(text).toBeHidden();
  await page.goForward();
  await expect(text).toBeVisible();
  await expect(text).toContainText('A friendly moon waved');
  await page.getByRole('button', { name: 'End Session', exact: true }).first().click();
  await page.getByRole('button', { name: 'End without saving', exact: true }).click();
  await expect(page).toHaveURL(/session-ended/);
  await page.getByRole('button', { name: 'Start Quiz', exact: true }).click();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
  const quizzes = state.calls.filter(c => c.fn === 'generate-quiz').length;
  await page.goBack();
  await expect(page.getByText(/Question 1 of/)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Start Quiz', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
  expect(state.calls.filter(c => c.fn === 'generate-quiz')).toHaveLength(quizzes);
  await page.goBack();
  await page.goBack();
  await expect(text).toBeVisible();
  await expect(text).toContainText('A friendly moon waved');
});

test('Urdu and Arabic mirror the welcome UI, then French restores LTR', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/');
  for (const [name, language, direction] of [['اردو', 'ur', 'rtl'], ['العربية', 'ar', 'rtl'], ['FR', 'fr', 'ltr']]) {
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('html')).toHaveAttribute('dir', direction);
    await expect(page.getByRole('button', { name: /Sign in/i })).toHaveCount(0);
    await expect(page.locator('header').first()).toHaveCSS('direction', direction);
  }
});
