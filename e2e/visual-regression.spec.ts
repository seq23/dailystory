import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage visual regression', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2, // Allow 20% difference for dynamic content
    });
  });

  test('user info form visual regression', async ({ page }) => {
    // Wait for form to be visible
    await expect(page.locator('form')).toBeVisible();
    
    // Screenshot of the form area
    await expect(page.locator('form')).toHaveScreenshot('user-info-form.png');
  });

  test('story display visual regression', async ({ page }) => {
    // Fill out form to get to story
    await page.fill('[placeholder*="name"]', 'Visual Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.click('button[type="submit"]');
    
    // Wait for story to load
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Screenshot of story display
    await expect(page.locator('.story-content')).toHaveScreenshot('story-display.png');
  });

  test('mobile responsive visual regression', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForLoadState('networkidle');
    
    // Mobile homepage screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
    });
    
    // Fill form on mobile
    await page.fill('[placeholder*="name"]', 'Mobile Test');
    await page.selectOption('select[name="age"]', '7');
    await page.selectOption('select[name="grade"]', '2nd');
    
    // Mobile form screenshot
    await expect(page.locator('form')).toHaveScreenshot('form-mobile.png');
  });

  test('dark mode visual regression', async ({ page }) => {
    // Enable dark mode if available
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], button[aria-label*="dark"], button[aria-label*="theme"]');
    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
    }
    
    await page.waitForLoadState('networkidle');
    
    // Dark mode screenshot
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    });
  });

  test('interactive elements visual states', async ({ page }) => {
    // Fill form to get interactive story
    await page.fill('[placeholder*="name"]', 'Interactive Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test hover states on interactive words
    const interactiveWord = page.locator('.interactive-word').first();
    if (await interactiveWord.count() > 0) {
      // Hover state
      await interactiveWord.hover();
      await expect(interactiveWord).toHaveScreenshot('interactive-word-hover.png');
      
      // Click state  
      await interactiveWord.click();
      await page.waitForTimeout(300); // Wait for any animations
      await expect(interactiveWord).toHaveScreenshot('interactive-word-clicked.png');
    }
  });
});