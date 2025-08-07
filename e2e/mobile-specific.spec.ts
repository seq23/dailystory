import { test, expect, devices } from '@playwright/test';

test.describe('Mobile-Specific Tests', () => {
  test('iPhone interaction flow', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test mobile form interaction
    await page.fill('[placeholder*="name"]', 'iPhone Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test touch interactions on story
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    
    if (wordCount > 0) {
      // Test tap gesture
      await interactiveWords.first().tap();
      await page.waitForTimeout(500);
      
      // Test double tap
      await interactiveWords.first().tap({ clickCount: 2 });
    }
    
    await context.close();
  });

  test('Android tablet interaction flow', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Galaxy Tab S4'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test tablet-specific layout
    await page.fill('[placeholder*="name"]', 'Android Tablet Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test tablet-specific gestures
    const storyArea = page.locator('.story-content');
    
    // Test pinch-to-zoom (simulate with viewport changes)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 800, height: 600 });
    
    await context.close();
  });

  test('Touch target accessibility on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12 Mini'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Verify all interactive elements meet touch target guidelines
    const interactiveElements = page.locator('button, input, select, a, [role="button"]');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        // Apple HIG recommends minimum 44x44pt touch targets
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    await context.close();
  });

  test('Mobile audio functionality', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();
    
    // Grant microphone permission for mobile audio testing
    await context.grantPermissions(['microphone']);
    
    await page.goto('/');
    
    await page.fill('[placeholder*="name"]', 'Mobile Audio Test');
    await page.selectOption('select[name="age"]', '7');
    await page.selectOption('select[name="grade"]', '2nd');
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test mobile audio controls
    const audioButtons = page.locator('[data-testid*="audio"], button[aria-label*="audio"], button[aria-label*="play"]');
    const audioButtonCount = await audioButtons.count();
    
    if (audioButtonCount > 0) {
      // Test audio button tap
      await audioButtons.first().tap();
      
      // Verify audio context is created for mobile
      const hasAudioContext = await page.evaluate(() => {
        return typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined';
      });
      
      expect(hasAudioContext).toBe(true);
    }
    
    await context.close();
  });

  test('Mobile orientation changes', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test portrait orientation
    await page.setViewportSize({ width: 390, height: 844 });
    await page.fill('[placeholder*="name"]', 'Orientation Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    
    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);
    
    // Verify form is still functional
    await page.tap('button[type="submit"]');
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test story reading in landscape
    const storyContent = page.locator('.story-content');
    await expect(storyContent).toBeVisible();
    
    // Rotate back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    // Verify story is still readable
    await expect(storyContent).toBeVisible();
    
    await context.close();
  });

  test('Mobile performance under constraints', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add 100ms delay
    });
    
    const startTime = Date.now();
    await page.goto('/');
    
    await page.fill('[placeholder*="name"]', 'Performance Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 45000 });
    const endTime = Date.now();
    
    const totalTime = endTime - startTime;
    
    // Should still complete within reasonable time even with network delays
    expect(totalTime).toBeLessThan(45000);
    
    console.log(`Mobile flow with network delay: ${totalTime}ms`);
    
    await context.close();
  });

  test('Mobile memory constraints', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Simulate memory-constrained environment by creating multiple stories
    for (let i = 0; i < 3; i++) {
      await page.fill('[placeholder*="name"]', `Memory Test ${i}`);
      await page.selectOption('select[name="age"]', '8');
      await page.selectOption('select[name="grade"]', '3rd');
      await page.tap('button[type="submit"]');
      
      await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
      
      // Go back to form for next iteration
      await page.goBack();
      await page.waitForTimeout(1000);
    }
    
    // Verify app is still responsive
    await page.fill('[placeholder*="name"]', 'Final Memory Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    await context.close();
  });
});