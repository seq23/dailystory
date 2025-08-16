import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzeuogomaixamrtnnmj.supabase.co';

// Integration tests for live generation and coordination
test.beforeEach(async ({ page }) => {
  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    if (url.includes('/functions/v1/generate-adaptive-story')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          success: true, 
          story: 'Generated story content...',
          pages: ['New page content...']
        })
      });
    }
    if (url.includes('/functions/v1/runware-generate-image')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          success: true, 
          imageURL: 'https://example.com/test-image.jpg'
        })
      });
    }
    return route.fulfill({ status: 204, body: '' });
  });
});

test('live generation coordination flow', async ({ page }) => {
  await page.goto('/');
  
  // Mock initial story state
  await page.evaluate(() => {
    const sessionData = {
      pages: ['Initial page...'],
      currentPageIndex: 0,
      isActiveSession: true
    };
    localStorage.setItem('story-session-data', JSON.stringify(sessionData));
  });
  
  await page.reload();
  
  // Should show initial content
  await expect(page.locator('text=Initial page...')).toBeVisible();
  
  // Mock next page generation
  const nextButton = page.locator('button:has-text("Next")');
  if (await nextButton.isVisible()) {
    await nextButton.click();
    
    // Should show loading state during generation
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  }
});

test('free user 6-page limit enforcement', async ({ page }) => {
  await page.goto('/');
  
  // Mock session at page limit for free users
  await page.evaluate(() => {
    const sessionData = {
      pages: ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Page 6'],
      currentPageIndex: 5,
      isActiveSession: true
    };
    localStorage.setItem('story-session-data', JSON.stringify(sessionData));
    localStorage.setItem('user-premium-status', 'false');
  });
  
  await page.reload();
  
  // Next button should be disabled or show upgrade prompt
  const nextButton = page.locator('button:has-text("Next")');
  if (await nextButton.isVisible()) {
    await expect(nextButton).toBeDisabled();
  } else {
    // Should show upgrade prompt
    await expect(page.locator('text=Upgrade to continue')).toBeVisible();
  }
});

test('premium user has no page limits', async ({ page }) => {
  await page.goto('/');
  
  // Mock premium user with many pages
  await page.evaluate(() => {
    const sessionData = {
      pages: Array.from({length: 10}, (_, i) => `Page ${i + 1}`),
      currentPageIndex: 9,
      isActiveSession: true
    };
    localStorage.setItem('story-session-data', JSON.stringify(sessionData));
    localStorage.setItem('user-premium-status', 'true');
  });
  
  await page.reload();
  
  // Next button should remain enabled for premium users
  const nextButton = page.locator('button:has-text("Next")');
  if (await nextButton.isVisible()) {
    await expect(nextButton).not.toBeDisabled();
  }
});