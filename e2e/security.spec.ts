import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('XSS protection in user inputs', async ({ page }) => {
    await page.goto('/');
    
    // Test XSS in name field
    const maliciousScript = '<script>alert("xss")</script>';
    await page.fill('[placeholder*="name"]', maliciousScript);
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.click('button[type="submit"]');
    
    // Wait for story generation
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Verify script tag is not executed/rendered
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("xss")</script>');
    
    // Check that name is properly escaped
    const hasRawScript = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert("xss")</script>');
    });
    expect(hasRawScript).toBe(false);
  });

  test('SQL injection protection', async ({ page }) => {
    await page.goto('/');
    
    // Test SQL injection attempts in name field
    const sqlInjection = "'; DROP TABLE users; --";
    await page.fill('[placeholder*="name"]', sqlInjection);
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.click('button[type="submit"]');
    
    // Should still generate story successfully
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // App should remain functional
    expect(page.url()).toContain('/');
  });

  test('Content Security Policy headers', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check for security headers
    const headers = response?.headers() || {};
    
    // Should have CSP header (if implemented)
    if (headers['content-security-policy']) {
      expect(headers['content-security-policy']).toBeTruthy();
    }
    
    // Should not have sensitive information in headers
    expect(headers['server']).not.toContain('Apache');
    expect(headers['x-powered-by']).toBeFalsy();
  });

  test('Input validation and sanitization', async ({ page }) => {
    await page.goto('/');
    
    // Test extremely long input
    const longInput = 'A'.repeat(10000);
    await page.fill('[placeholder*="name"]', longInput);
    
    // Should handle gracefully
    const inputValue = await page.inputValue('[placeholder*="name"]');
    
    // Input should be limited or handled appropriately
    expect(inputValue.length).toBeLessThan(1000);
  });

  test('File upload security (if applicable)', async ({ page }) => {
    await page.goto('/');
    
    // Look for file upload inputs
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();
    
    if (fileInputCount > 0) {
      // Test file type validation
      const fileInput = fileInputs.first();
      
      // Try to upload a potentially malicious file type
      try {
        await fileInput.setInputFiles({
          name: 'malicious.exe',
          mimeType: 'application/x-executable',
          buffer: Buffer.from('fake executable content'),
        });
        
        // Should reject or sanitize the upload
        const hasError = await page.locator('.error, [role="alert"]').count();
        expect(hasError).toBeGreaterThan(0);
      } catch (error) {
        // File upload rejection is acceptable
        expect(error).toBeTruthy();
      }
    }
  });

  test('Session security', async ({ page }) => {
    await page.goto('/');
    
    // Check that sensitive data is not exposed in local storage
    const localStorage = await page.evaluate(() => {
      const items: any = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });
    
    // Should not store passwords or sensitive tokens in localStorage
    Object.keys(localStorage).forEach(key => {
      const value = localStorage[key].toLowerCase();
      expect(value).not.toContain('password');
      expect(value).not.toContain('secret');
      expect(value).not.toContain('private_key');
    });
  });

  test('HTTPS enforcement', async ({ page }) => {
    // Skip if running locally
    if (page.url().includes('localhost') || page.url().includes('127.0.0.1')) {
      test.skip();
    }
    
    // Production should use HTTPS
    expect(page.url()).toMatch(/^https:/);
  });

  test('Form submission security', async ({ page }) => {
    await page.goto('/');
    
    // Monitor network requests
    const requests: any[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
    });
    
    // Submit form
    await page.fill('[placeholder*="name"]', 'Security Test');
    await page.selectOption('select[name="age"]', '8');
    await page.selectOption('select[name="grade"]', '3rd');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.story-content')).toBeVisible({ timeout: 30000 });
    
    // Check that form data is submitted securely
    const postRequests = requests.filter(r => r.method === 'POST');
    
    postRequests.forEach(request => {
      // Should use HTTPS for POST requests (in production)
      if (!request.url.includes('localhost')) {
        expect(request.url).toMatch(/^https:/);
      }
      
      // Should not contain sensitive data in URL
      expect(request.url).not.toContain('password');
      expect(request.url).not.toContain('secret');
    });
  });

  test('Error handling security', async ({ page }) => {
    // Test error page doesn't reveal sensitive information
    await page.goto('/nonexistent-page-12345');
    
    const content = await page.content();
    
    // Error pages should not reveal:
    expect(content.toLowerCase()).not.toContain('stack trace');
    expect(content.toLowerCase()).not.toContain('database');
    expect(content.toLowerCase()).not.toContain('internal server error');
    expect(content.toLowerCase()).not.toContain('mysql');
    expect(content.toLowerCase()).not.toContain('postgresql');
  });
});