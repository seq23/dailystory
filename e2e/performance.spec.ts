import { test, expect, chromium } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Core Web Vitals - Homepage', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect performance metrics
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
          TTFB: 0,
        };

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.LCP = entries[entries.length - 1].startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              metrics.FCP = entry.startTime;
            }
          }
        }).observe({ type: 'paint', buffered: true });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.CLS = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        // Time to First Byte
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
        }

        // Wait a bit then resolve with metrics
        setTimeout(() => resolve(metrics), 3000);
      });
    });

    // Assert performance thresholds
    expect(vitals.LCP).toBeLessThan(2500); // LCP should be under 2.5s
    expect(vitals.FCP).toBeLessThan(1800); // FCP should be under 1.8s
    expect(vitals.CLS).toBeLessThan(0.1);  // CLS should be under 0.1
    expect(vitals.TTFB).toBeLessThan(800); // TTFB should be under 800ms

    await browser.close();
  });

  test('Story Generation Performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Fill form and measure story generation time
    await page.fill('[placeholder*="name"]', 'Performance Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    
    const submitTime = Date.now();
    await page.click('button[type="submit"]');
    
    // Wait for story to appear
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    const storyLoadTime = Date.now();
    
    const totalTime = storyLoadTime - startTime;
    const generationTime = storyLoadTime - submitTime;
    
    // Story should generate within 10 seconds
    expect(generationTime).toBeLessThan(10000);
    
    // Total user flow should complete within 15 seconds
    expect(totalTime).toBeLessThan(15000);
    
    console.log(`Story generation took: ${generationTime}ms`);
    console.log(`Total user flow took: ${totalTime}ms`);
  });

  test('Memory Usage - Story Reading Session', async ({ page }) => {
    // Navigate to story
    await page.fill('[placeholder*="name"]', 'Memory Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Measure memory before interactions
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Simulate reading interactions
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    
    if (wordCount > 0) {
      // Click multiple words to test memory stability
      for (let i = 0; i < Math.min(wordCount, 10); i++) {
        await interactiveWords.nth(i).click();
        await page.waitForTimeout(100);
      }
    }
    
    // Measure memory after interactions
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory increase should be reasonable (less than 50MB)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });

  test('Network Performance', async ({ page }) => {
    const responses: any[] = [];
    
    // Track all network responses
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        timing: response.timing(),
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that all critical resources loaded successfully
    const failedRequests = responses.filter(r => r.status >= 400);
    expect(failedRequests.length).toBe(0);
    
    // Check for reasonable resource sizes
    const largeResources = responses.filter(r => 
      parseInt(r.size) > 5 * 1024 * 1024 // 5MB
    );
    
    // Should not have resources larger than 5MB
    expect(largeResources.length).toBe(0);
    
    console.log(`Total network requests: ${responses.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
  });
});