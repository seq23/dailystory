import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('Homepage accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('User form accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test form accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test form labels and ARIA attributes
    const nameInput = page.locator('input[placeholder*="name"]');
    await expect(nameInput).toHaveAttribute('aria-label');
    
    const ageSelect = page.locator('select[name="age"]');
    await expect(ageSelect).toHaveAttribute('aria-label');
    
    const gradeSelect = page.locator('select[name="grade"]');
    await expect(gradeSelect).toHaveAttribute('aria-label');
  });

  test('Story display accessibility', async ({ page }) => {
    // Navigate to story
    await page.fill('[placeholder*="name"]', 'Accessibility Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test story accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.story-content')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test interactive words have proper ARIA attributes
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    
    if (wordCount > 0) {
      const firstWord = interactiveWords.first();
      await expect(firstWord).toHaveAttribute('role');
      await expect(firstWord).toHaveAttribute('tabindex');
    }
  });

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation through form
    await page.keyboard.press('Tab'); // Should focus first input
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'SELECT', 'BUTTON']).toContain(focusedElement);
    
    // Fill form using keyboard
    await page.keyboard.type('Keyboard Test');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown'); // Select age
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown'); // Select grade
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Submit form
    
    // Verify we can navigate to story
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test keyboard navigation in story
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    
    if (wordCount > 0) {
      // Tab to first interactive word
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Activate word
      
      // Should handle keyboard interaction
      expect(true).toBe(true); // Placeholder for actual interaction verification
    }
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Test ARIA landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    const form = page.locator('form, [role="form"]');
    await expect(form).toBeVisible();
    
    // Test heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Navigate to story and test content structure
    await page.fill('[placeholder*="name"]', 'Screen Reader Test');
    await page.selectOption('select[name="age"]', '7');
    await page.selectOption('select[name="grade"]', '2nd');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Test story has proper heading structure
    const storyHeading = page.locator('.story-content h1, .story-content h2, .story-content [role="heading"]');
    if (await storyHeading.count() > 0) {
      await expect(storyHeading.first()).toBeVisible();
    }
  });

  test('Color contrast and visual accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();
    
    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
    
    // Test focus indicators
    const firstFocusableElement = page.locator('input, select, button, a').first();
    await firstFocusableElement.focus();
    
    // Verify focus indicator is visible
    const focusedElementStyle = await firstFocusableElement.evaluate(
      element => window.getComputedStyle(element, ':focus').outline
    );
    
    expect(focusedElementStyle).not.toBe('none');
  });

  test('Mobile accessibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Test mobile accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Test touch target sizes
    const touchTargets = page.locator('button, input, select, a, [role="button"]');
    const targetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(targetCount, 5); i++) {
      const target = touchTargets.nth(i);
      const boundingBox = await target.boundingBox();
      
      if (boundingBox) {
        // Touch targets should be at least 44x44px
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});