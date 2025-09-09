import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzeuogomaixamrtnnmj.supabase.co';

// Integration tests for session persistence and resume functionality
test.beforeEach(async ({ page }) => {
  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status: 204, body: '' });
  });
});

test('session persists across page refreshes', async ({ page }) => {
  await page.goto('/');
  
  // Mock active session data (now uses sessionStorage for images)
  await page.evaluate(() => {
    const sessionData = {
      pages: ['Once upon a time...', 'The adventure begins...'],
      currentPageIndex: 1,
      sessionTimer: 300,
      isActiveSession: true
    };
    // Story data still in localStorage
    localStorage.setItem('story-session-data', JSON.stringify(sessionData));
    
    // Image cache now in sessionStorage 
    const imageCache = {
      'test-key-session-1': {
        url: 'https://example.com/test-image.jpg',
        timestamp: Date.now(),
        sessionId: 'test-session-1',
        pageNumber: 1
      }
    };
    sessionStorage.setItem('session_image_cache', JSON.stringify(imageCache));
  });
  
  await page.reload();
  
  // Should resume from saved state
  await expect(page.locator('text=The adventure begins...')).toBeVisible();
});

test('session data persists story progress', async ({ page }) => {
  await page.goto('/');
  
  // Mock multi-page session
  await page.evaluate(() => {
    const sessionData = {
      pages: ['Page 1', 'Page 2', 'Page 3'],
      currentPageIndex: 2,
      isActiveSession: true
    };
    localStorage.setItem('story-session-data', JSON.stringify(sessionData));
  });
  
  await page.reload();
  
  // Should be on the correct page
  await expect(page.locator('text=Page 3')).toBeVisible();
});

test('corrupted session data handled gracefully', async ({ page }) => {
  await page.goto('/');
  
  // Mock corrupted session data (both localStorage and sessionStorage)
  await page.evaluate(() => {
    // Corrupted story data
    localStorage.setItem('story-session-data', 'invalid-json');
    // Corrupted image cache  
    sessionStorage.setItem('session_image_cache', 'invalid-json');
  });
  
  await page.reload();
  
  // Should handle gracefully and start fresh
  await expect(page.locator('body')).toBeVisible();
});