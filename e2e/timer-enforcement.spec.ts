import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzeuogomaixamrtnnmj.supabase.co';

// Integration tests for timer enforcement system
test.beforeEach(async ({ page }) => {
  // Stub Supabase calls to keep tests deterministic
  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status: 204, body: '' });
  });
});

test('free user timer enforcement - 20 minute limit', async ({ page }) => {
  await page.goto('/');
  
  // Timer should not be visible initially for free users
  await expect(page.locator('[data-testid="session-timer"]')).not.toBeVisible();
  
  // Timer should become visible when approaching limit (mocked)
  await page.evaluate(() => {
    // Mock timer state to show timer in last 60 seconds
    localStorage.setItem('story-session-timer', '1150');
  });
  
  await page.reload();
  await expect(page.locator('[data-testid="session-timer"]')).toBeVisible();
});

test('premium user has no timer restrictions', async ({ page }) => {
  // Mock premium user state
  await page.evaluate(() => {
    localStorage.setItem('user-premium-status', 'true');
  });
  
  await page.goto('/');
  
  // Timer should never be visible for premium users
  await expect(page.locator('[data-testid="session-timer"]')).not.toBeVisible();
});

test('session ends when timer reaches zero', async ({ page }) => {
  await page.goto('/');
  
  // Mock expired timer
  await page.evaluate(() => {
    localStorage.setItem('story-session-timer', '1200');
  });
  
  await page.reload();
  
  // Should show session ended state
  await expect(page.locator('text=Session ended')).toBeVisible();
});
