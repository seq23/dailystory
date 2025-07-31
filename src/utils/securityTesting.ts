// Security Testing and Validation Utilities

import { SecurityValidator } from './securityValidation';
import { SecurityMonitor } from './monitoring';
import { ContentSecurity } from './security';

export class SecurityTester {
  private static testResults: Array<{
    test: string;
    passed: boolean;
    details: string;
    timestamp: number;
  }> = [];

  // Run comprehensive security tests
  static async runSecurityTests(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: typeof SecurityTester.testResults;
  }> {
    console.log('🔒 Running security validation tests...');
    
    this.testResults = [];

    // Test input validation
    await this.testInputValidation();
    
    // Test content filtering
    await this.testContentFiltering();
    
    // Test rate limiting
    await this.testRateLimiting();
    
    // Test API validation
    await this.testApiValidation();
    
    // Test environment security
    await this.testEnvironmentSecurity();

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;

    console.log(`✅ Security tests completed: ${passed}/${total} passed`);
    
    SecurityMonitor.logEvent('security', 'security_test_completed', {
      passed,
      failed,
      total,
      timestamp: Date.now()
    }, failed > 0 ? 'medium' : 'low');

    return { passed, failed, total, results: this.testResults };
  }

  private static async testInputValidation() {
    const tests = [
      {
        name: 'Basic text validation',
        input: 'Hello world',
        shouldPass: true
      },
      {
        name: 'Script injection attempt',
        input: '<script>alert("xss")</script>',
        shouldPass: false
      },
      {
        name: 'SQL injection attempt', 
        input: "'; DROP TABLE users; --",
        shouldPass: false
      },
      {
        name: 'Long input test',
        input: 'a'.repeat(15000),
        shouldPass: false
      },
      {
        name: 'Normal user input',
        input: 'My name is Sarah and I like cats',
        shouldPass: true
      }
    ];

    for (const test of tests) {
      try {
        const result = SecurityValidator.validateUserInput(test.input, 'test');
        const passed = test.shouldPass ? result.valid : !result.valid;
        
        this.addTestResult(
          `Input Validation: ${test.name}`,
          passed,
          passed ? 'Test passed as expected' : `Expected ${test.shouldPass ? 'valid' : 'invalid'}, got ${result.valid ? 'valid' : 'invalid'}`
        );
      } catch (error) {
        this.addTestResult(
          `Input Validation: ${test.name}`,
          false,
          `Test threw error: ${error}`
        );
      }
    }
  }

  private static async testContentFiltering() {
    const inappropriateContent = [
      'This is inappropriate bad word',
      'Some violent content here',
      'Adult themed content'
    ];

    const appropriateContent = [
      'Once upon a time there was a happy princess',
      'The cat played with the ball',
      'They lived happily ever after'
    ];

    // Test inappropriate content detection
    for (const content of inappropriateContent) {
      try {
        const result = ContentSecurity.isContentAppropriate(content, undefined, undefined);
        this.addTestResult(
          `Content Filter: Block inappropriate - "${content.substring(0, 30)}..."`,
          !result.appropriate,
          result.appropriate ? 'Should have been blocked' : `Correctly blocked: ${result.reason}`
        );
      } catch (error) {
        this.addTestResult(
          `Content Filter: Block inappropriate`,
          false,
          `Error during filtering: ${error}`
        );
      }
    }

    // Test appropriate content passes
    for (const content of appropriateContent) {
      try {
        const result = ContentSecurity.isContentAppropriate(content, undefined, undefined);
        this.addTestResult(
          `Content Filter: Allow appropriate - "${content.substring(0, 30)}..."`,
          result.appropriate,
          result.appropriate ? 'Correctly allowed' : `Incorrectly blocked: ${result.reason}`
        );
      } catch (error) {
        this.addTestResult(
          `Content Filter: Allow appropriate`,
          false,
          `Error during filtering: ${error}`
        );
      }
    }
  }

  private static async testRateLimiting() {
    const testIdentifier = 'test_user_123';
    const action = 'test_action';

    try {
      // Test normal rate limit (should pass)
      const result1 = SecurityValidator.validateRateLimit(testIdentifier, action, 5, 1000);
      this.addTestResult(
        'Rate Limiting: Normal usage',
        result1.valid,
        result1.valid ? 'Rate limit check passed' : 'Rate limit incorrectly triggered'
      );

      // Test rate limit exceeded (should fail after multiple attempts)
      let rateLimitTriggered = false;
      for (let i = 0; i < 10; i++) {
        const result = SecurityValidator.validateRateLimit(testIdentifier, `${action}_burst`, 3, 1000);
        if (!result.valid) {
          rateLimitTriggered = true;
          break;
        }
      }

      this.addTestResult(
        'Rate Limiting: Burst protection',
        rateLimitTriggered,
        rateLimitTriggered ? 'Rate limit correctly triggered' : 'Rate limit failed to trigger'
      );

    } catch (error) {
      this.addTestResult(
        'Rate Limiting: Error handling',
        false,
        `Rate limiting test failed: ${error}`
      );
    }
  }

  private static async testApiValidation() {
    const testCases = [
      {
        name: 'Valid image response',
        response: {
          imageURL: 'https://im.runware.ai/image/test.jpg',
          NSFWContent: false,
          seed: 12345
        },
        shouldPass: true
      },
      {
        name: 'NSFW content flagged',
        response: {
          imageURL: 'https://im.runware.ai/image/test.jpg',
          NSFWContent: true,
          seed: 12345
        },
        shouldPass: false
      },
      {
        name: 'Non-HTTPS URL',
        response: {
          imageURL: 'http://unsafe.example.com/image.jpg',
          NSFWContent: false,
          seed: 12345
        },
        shouldPass: false
      }
    ];

    for (const test of testCases) {
      try {
        const result = SecurityValidator.validateApiResponse(test.response);
        const passed = test.shouldPass ? result.valid : !result.valid;
        
        this.addTestResult(
          `API Validation: ${test.name}`,
          passed,
          passed ? 'Test passed as expected' : `Expected ${test.shouldPass ? 'valid' : 'invalid'}, got ${result.valid ? 'valid' : 'invalid'}`
        );
      } catch (error) {
        this.addTestResult(
          `API Validation: ${test.name}`,
          false,
          `Test threw error: ${error}`
        );
      }
    }
  }

  private static async testEnvironmentSecurity() {
    try {
      const result = SecurityValidator.validateEnvironment();
      
      this.addTestResult(
        'Environment Security: HTTPS check',
        result.valid || process.env.NODE_ENV === 'development',
        result.valid ? 'Environment security passed' : `Security issues: ${result.errors.join(', ')}`
      );

      // Test crypto availability
      const hasCrypto = typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function';
      this.addTestResult(
        'Environment Security: Crypto availability',
        hasCrypto,
        hasCrypto ? 'Crypto features available' : 'Crypto features missing'
      );

      // Test security headers (client-side check)
      const hasSecurityHeaders = document.querySelector('meta[name="referrer"]') !== null;
      this.addTestResult(
        'Environment Security: Security headers',
        hasSecurityHeaders,
        hasSecurityHeaders ? 'Security headers present' : 'Security headers missing'
      );

    } catch (error) {
      this.addTestResult(
        'Environment Security: Error',
        false,
        `Environment security test failed: ${error}`
      );
    }
  }

  private static addTestResult(test: string, passed: boolean, details: string) {
    this.testResults.push({
      test,
      passed,
      details,
      timestamp: Date.now()
    });

    const emoji = passed ? '✅' : '❌';
    console.log(`${emoji} ${test}: ${details}`);
  }

  // Export test results for external analysis
  static exportTestResults() {
    return {
      exportedAt: Date.now(),
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length,
        categories: this.getTestCategories()
      }
    };
  }

  private static getTestCategories() {
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.test.split(':')[0];
      if (!categories[category]) {
        categories[category] = { total: 0, passed: 0, failed: 0 };
      }
      categories[category].total++;
      if (result.passed) {
        categories[category].passed++;
      } else {
        categories[category].failed++;
      }
    });
    return categories;
  }

  // Performance testing for security operations
  static async performanceTest() {
    console.log('🚀 Running security performance tests...');
    
    const tests = [
      {
        name: 'Input validation speed',
        operation: () => SecurityValidator.validateUserInput('test input', 'performance_test'),
        iterations: 1000
      },
      {
        name: 'Content filtering speed',
        operation: () => ContentSecurity.isContentAppropriate('This is a test story about a happy cat', undefined, undefined),
        iterations: 500
      },
      {
        name: 'Rate limit check speed',
        operation: () => SecurityValidator.validateRateLimit('perf_test', 'action', 100, 1000),
        iterations: 100
      }
    ];

    const results = [];

    for (const test of tests) {
      const start = performance.now();
      
      for (let i = 0; i < test.iterations; i++) {
        test.operation();
      }
      
      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / test.iterations;
      
      results.push({
        name: test.name,
        totalTime: Math.round(totalTime),
        avgTime: Math.round(avgTime * 100) / 100,
        iterations: test.iterations
      });

      console.log(`⚡ ${test.name}: ${Math.round(avgTime * 100) / 100}ms avg (${test.iterations} iterations)`);
    }

    SecurityMonitor.logEvent('performance', 'security_performance_test', {
      results,
      timestamp: Date.now()
    }, 'low');

    return results;
  }
}

// Utility function to run all security tests
export const runComprehensiveSecurityTest = async () => {
  const securityResults = await SecurityTester.runSecurityTests();
  const performanceResults = await SecurityTester.performanceTest();
  
  return {
    security: securityResults,
    performance: performanceResults,
    exportData: SecurityTester.exportTestResults()
  };
};

// Development helper to run tests
if (process.env.NODE_ENV === 'development') {
  (window as any).runSecurityTests = runComprehensiveSecurityTest;
  console.log('🔧 Security testing available via window.runSecurityTests()');
}