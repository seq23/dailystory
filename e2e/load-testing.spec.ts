import { test, expect, chromium } from '@playwright/test';

test.describe('Load Testing', () => {
  test('Concurrent user story generation', async () => {
    const numUsers = 5; // Simulate 5 concurrent users
    const browsers = [];
    const pages = [];
    
    try {
      // Create multiple browser contexts
      for (let i = 0; i < numUsers; i++) {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        browsers.push(browser);
        pages.push(page);
      }
      
      // Concurrent story generation
      const promises = pages.map(async (page, index) => {
        const startTime = Date.now();
        
        await page.goto('/');
        await page.fill('[placeholder*="name"]', `Load Test User ${index + 1}`);
        await page.selectOption('select[name="age"]', '8');
        await page.selectOption('select[name="grade"]', '3rd');
        await page.click('button[type="submit"]');
        
        await expect(page.locator('.story-content')).toBeVisible({ timeout: 45000 });
        
        const endTime = Date.now();
        return {
          user: index + 1,
          duration: endTime - startTime,
          success: true,
        };
      });
      
      // Wait for all users to complete
      const results = await Promise.allSettled(promises);
      
      // Analyze results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Concurrent load test results:`);
      console.log(`- Successful: ${successful}/${numUsers}`);
      console.log(`- Failed: ${failed}/${numUsers}`);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`- User ${index + 1}: ${result.value.duration}ms`);
        } else {
          console.log(`- User ${index + 1}: FAILED - ${result.reason}`);
        }
      });
      
      // At least 80% should succeed under load
      const successRate = successful / numUsers;
      expect(successRate).toBeGreaterThanOrEqual(0.8);
      
      // Average response time should be reasonable
      const successfulResults = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value.duration);
      
      if (successfulResults.length > 0) {
        const avgDuration = successfulResults.reduce((a, b) => a + b, 0) / successfulResults.length;
        expect(avgDuration).toBeLessThan(20000); // 20 seconds average
      }
      
    } finally {
      // Clean up all browsers
      await Promise.all(browsers.map(browser => browser.close()));
    }
  });

  test('Rapid form submissions', async ({ page }) => {
    await page.goto('/');
    
    const submissions = [];
    
    // Rapid fire form submissions
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      
      // Clear and fill form
      await page.fill('[placeholder*="name"]', `Rapid Test ${i + 1}`);
      await page.selectOption('select[name="age"]', '8');
      await page.selectOption('select[name="grade"]', '3rd');
      await page.click('button[type="submit"]');
      
      try {
        await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
        const endTime = Date.now();
        
        submissions.push({
          attempt: i + 1,
          duration: endTime - startTime,
          success: true,
        });
        
        // Go back for next submission
        if (i < 2) {
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
        
      } catch (error) {
        submissions.push({
          attempt: i + 1,
          duration: -1,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Analyze rapid submission results
    const successful = submissions.filter(s => s.success).length;
    
    console.log('Rapid submission results:');
    submissions.forEach(sub => {
      if (sub.success) {
        console.log(`- Attempt ${sub.attempt}: ${sub.duration}ms`);
      } else {
        console.log(`- Attempt ${sub.attempt}: FAILED`);
      }
    });
    
    // Should handle at least 2 out of 3 rapid submissions
    expect(successful).toBeGreaterThanOrEqual(2);
  });

  test('Memory pressure under repeated interactions', async ({ page }) => {
    await page.goto('/');
    
    // Generate initial story
    await page.fill('[placeholder*="name"]', 'Memory Pressure Test');
    await page.selectOption('select[name="age"]', '9');
    await page.selectOption('select[name="grade"]', '4th');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Perform many interactions
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    
    if (wordCount > 0) {
      // Click words repeatedly
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < Math.min(wordCount, 10); i++) {
          await interactiveWords.nth(i).click();
          await page.waitForTimeout(50);
        }
      }
    }
    
    // Measure memory after interactions
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
    
    console.log(`Memory increase after pressure test: ${memoryIncreaseMB.toFixed(2)}MB`);
    
    // Memory increase should be reasonable (less than 100MB)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    
    // Test garbage collection effectiveness
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    
    const afterGCMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should decrease after GC (or at least not increase significantly)
    expect(afterGCMemory).toBeLessThanOrEqual(finalMemory * 1.1);
  });

  test('API endpoint stress testing', async ({ page }) => {
    const apiCalls = [];
    
    // Monitor all API calls
    page.on('response', response => {
      if (response.url().includes('/functions/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing(),
        });
      }
    });
    
    await page.goto('/');
    
    // Generate multiple stories in sequence
    for (let i = 0; i < 3; i++) {
      await page.fill('[placeholder*="name"]', `API Stress Test ${i + 1}`);
      await page.selectOption('select[name="age"]', '8');
      await page.selectOption('select[name="grade"]', '3rd');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
      
      if (i < 2) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Analyze API performance
    const failedCalls = apiCalls.filter(call => call.status >= 400);
    const successfulCalls = apiCalls.filter(call => call.status < 400);
    
    console.log(`API stress test results:`);
    console.log(`- Total API calls: ${apiCalls.length}`);
    console.log(`- Successful: ${successfulCalls.length}`);
    console.log(`- Failed: ${failedCalls.length}`);
    
    // Should have low failure rate
    const failureRate = failedCalls.length / apiCalls.length;
    expect(failureRate).toBeLessThan(0.1); // Less than 10% failure rate
    
    // Log any failures for debugging
    if (failedCalls.length > 0) {
      console.log('Failed API calls:');
      failedCalls.forEach(call => {
        console.log(`- ${call.url}: ${call.status}`);
      });
    }
  });

  test('Large story content handling', async ({ page }) => {
    await page.goto('/');
    
    // Request a longer story by using older age/grade
    await page.fill('[placeholder*="name"]', 'Large Content Test');
    await page.selectOption('select[name="age"]', '12');
    await page.selectOption('select[name="grade"]', '6th+');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 45000 });
    
    // Measure content size and rendering performance
    const contentMetrics = await page.evaluate(() => {
      const storyElement = document.querySelector('.story-content');
      if (!storyElement) return null;
      
      return {
        textLength: storyElement.textContent?.length || 0,
        elementCount: storyElement.querySelectorAll('*').length,
        height: storyElement.scrollHeight,
      };
    });
    
    if (contentMetrics) {
      console.log(`Large content metrics:`);
      console.log(`- Text length: ${contentMetrics.textLength} characters`);
      console.log(`- Element count: ${contentMetrics.elementCount}`);
      console.log(`- Height: ${contentMetrics.height}px`);
      
      // Should handle large content gracefully
      expect(contentMetrics.textLength).toBeGreaterThan(0);
      expect(contentMetrics.elementCount).toBeLessThan(10000); // Reasonable DOM size
    }
    
    // Test scrolling performance with large content
    const scrollStart = Date.now();
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -1000);
    const scrollEnd = Date.now();
    
    const scrollDuration = scrollEnd - scrollStart;
    expect(scrollDuration).toBeLessThan(1000); // Smooth scrolling
  });
});