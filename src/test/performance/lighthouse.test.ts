import { describe, it, expect } from 'vitest';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

// Note: This test requires Chrome to be installed and may not work in all CI environments
describe('Lighthouse Performance Tests', () => {
  const runLighthouse = async (url: string) => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info' as const,
      output: 'json' as const,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    
    return runnerResult?.lhr;
  };

  it.skip('Homepage Core Web Vitals', async () => {
    // Skip if not in appropriate environment
    if (!process.env.LIGHTHOUSE_URL) {
      return;
    }
    
    const url = process.env.LIGHTHOUSE_URL || 'http://localhost:4173';
    const result = await runLighthouse(url);
    
    if (!result) {
      throw new Error('Lighthouse failed to run');
    }
    
    const performanceScore = result.categories.performance.score * 100;
    const accessibilityScore = result.categories.accessibility.score * 100;
    const bestPracticesScore = result.categories['best-practices'].score * 100;
    const seoScore = result.categories.seo.score * 100;
    
    console.log(`Lighthouse Scores:`);
    console.log(`- Performance: ${performanceScore}`);
    console.log(`- Accessibility: ${accessibilityScore}`);
    console.log(`- Best Practices: ${bestPracticesScore}`);
    console.log(`- SEO: ${seoScore}`);
    
    // Performance thresholds
    expect(performanceScore).toBeGreaterThanOrEqual(70);
    expect(accessibilityScore).toBeGreaterThanOrEqual(90);
    expect(bestPracticesScore).toBeGreaterThanOrEqual(80);
    expect(seoScore).toBeGreaterThanOrEqual(85);
    
    // Core Web Vitals
    const audits = result.audits;
    
    // Largest Contentful Paint
    const lcp = audits['largest-contentful-paint'];
    expect(lcp.numericValue).toBeLessThan(2500); // < 2.5s
    
    // First Input Delay (simulated)
    const fid = audits['max-potential-fid'];
    expect(fid.numericValue).toBeLessThan(100); // < 100ms
    
    // Cumulative Layout Shift
    const cls = audits['cumulative-layout-shift'];
    expect(cls.numericValue).toBeLessThan(0.1); // < 0.1
    
    // First Contentful Paint
    const fcp = audits['first-contentful-paint'];
    expect(fcp.numericValue).toBeLessThan(1800); // < 1.8s
    
    // Speed Index
    const si = audits['speed-index'];
    expect(si.numericValue).toBeLessThan(3400); // < 3.4s
  });

  it.skip('Mobile Performance', async () => {
    if (!process.env.LIGHTHOUSE_URL) {
      return;
    }
    
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info' as const,
      output: 'json' as const,
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor: 'mobile' as const,
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
      },
    };
    
    const url = process.env.LIGHTHOUSE_URL || 'http://localhost:4173';
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    
    const result = runnerResult?.lhr;
    if (!result) {
      throw new Error('Mobile Lighthouse failed to run');
    }
    
    const mobilePerformanceScore = result.categories.performance.score * 100;
    console.log(`Mobile Performance Score: ${mobilePerformanceScore}`);
    
    // Mobile performance should be reasonable
    expect(mobilePerformanceScore).toBeGreaterThanOrEqual(60);
    
    // Mobile-specific Core Web Vitals (more lenient)
    const audits = result.audits;
    
    const mobileLCP = audits['largest-contentful-paint'];
    expect(mobileLCP.numericValue).toBeLessThan(4000); // < 4s for mobile
    
    const mobileFCP = audits['first-contentful-paint'];
    expect(mobileFCP.numericValue).toBeLessThan(3000); // < 3s for mobile
  });
});