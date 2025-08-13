import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzeuogomaixamrtnnmj.supabase.co';

// Minimal network stubs to keep tests deterministic/offline
test.beforeEach(async ({ page }) => {
  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status: 204, body: '' });
  });
});

test('home loads without crashing', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('pricing page renders with heading', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByRole('heading', { name: /simple, transparent pricing/i })).toBeVisible();
});

test('terms page renders', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
});

test('privacy page renders', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
});

test('unknown route shows 404 page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByText('Oops! Page not found')).toBeVisible();
});
