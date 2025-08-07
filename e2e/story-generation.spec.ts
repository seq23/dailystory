import { test, expect } from '@playwright/test';

test.describe('Story Generation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate a story for a child user', async ({ page }) => {
    // Fill out user info form
    await page.fill('[placeholder*="name"]', 'Test Child');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    
    // Submit form and wait for story generation
    await page.click('button[type="submit"]');
    
    // Wait for story to load
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Verify story content exists
    const storyContent = page.locator('.story-content');
    await expect(storyContent).toContainText(/\w+/);
    
    // Test interactive words
    const interactiveWord = page.locator('.interactive-word').first();
    if (await interactiveWord.count() > 0) {
      await interactiveWord.click();
      // Should handle word interaction
    }
  });

  test('should handle TTS audio playback', async ({ page }) => {
    // Navigate through user setup
    await page.fill('[placeholder*="name"]', 'Audio Test');
    await page.selectOption('select[name="age"]', '7');
    await page.selectOption('select[name="grade"]', '2nd');
    await page.click('button[type="submit"]');
    
    // Wait for story and look for audio controls
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test audio button if present
    const audioButton = page.locator('[data-testid*="audio"], button[aria-label*="audio"], button[aria-label*="play"]').first();
    if (await audioButton.count() > 0) {
      await audioButton.click();
      // Audio should start (we can't test actual audio, but can test UI state)
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.fill('[placeholder*="name"]', 'Mobile Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test mobile-specific interactions
    const mobileElements = page.locator('[class*="mobile"], [class*="touch"]');
    if (await mobileElements.count() > 0) {
      // Elements should be touch-friendly
      const firstElement = mobileElements.first();
      const boundingBox = await firstElement.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThan(44); // Minimum touch target
      }
    }
  });
});