// Mobile Touch Interaction Test Suite
// Comprehensive testing for touch interactions across all devices

export interface TouchTestResult {
  testName: string;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    hasTouch: boolean;
    screenSize: string;
    userAgent: string;
  };
}

export interface TouchTestSuite {
  interactiveWordTests: TouchTestResult[];
  navigationTests: TouchTestResult[];
  audioControlTests: TouchTestResult[];
  overallScore: number;
  criticalIssues: string[];
}

export class MobileInteractionTester {
  private static getDeviceInfo() {
    return {
      isMobile: window.innerWidth <= 768,
      isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    };
  }

  static async testInteractiveWords(): Promise<TouchTestResult> {
    const deviceInfo = this.getDeviceInfo();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Test touch target sizes
    const interactiveElements = document.querySelectorAll('[data-testid="interactive-word"]');
    const minTouchTarget = deviceInfo.isMobile ? 44 : 40; // iOS guidelines: 44px minimum

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Touch target too small: ${rect.width}x${rect.height}px`);
        recommendations.push('Ensure interactive words have minimum 44px touch targets');
      }
    });

    // Test touch response timing
    let touchResponseTime = 0;
    if (deviceInfo.hasTouch) {
      const testElement = interactiveElements[0] as HTMLElement;
      if (testElement) {
        const startTime = performance.now();
        testElement.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        testElement.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        touchResponseTime = performance.now() - startTime;

        if (touchResponseTime > 100) {
          issues.push(`Slow touch response: ${touchResponseTime.toFixed(2)}ms`);
          recommendations.push('Optimize touch event handlers for sub-100ms response');
        }
      }
    }

    return {
      testName: 'Interactive Words Touch Test',
      passed: issues.length === 0,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static async testNavigationControls(): Promise<TouchTestResult> {
    const deviceInfo = this.getDeviceInfo();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Test page navigation buttons
    const navButtons = document.querySelectorAll('[data-testid*="nav-"], [data-testid*="page-"]');
    const minTouchTarget = deviceInfo.isMobile ? 48 : 44;

    navButtons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Navigation button too small: ${rect.width}x${rect.height}px`);
        recommendations.push('Navigation buttons should be at least 48px on mobile');
      }

      // Check for proper spacing between buttons
      const siblingButtons = Array.from(navButtons).filter(b => b !== button);
      siblingButtons.forEach(sibling => {
        const siblingRect = sibling.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(rect.x - siblingRect.x, 2) + Math.pow(rect.y - siblingRect.y, 2)
        );
        if (distance < 8 && distance > 0) {
          issues.push('Navigation buttons too close together');
          recommendations.push('Add at least 8px spacing between touch targets');
        }
      });
    });

    return {
      testName: 'Navigation Controls Touch Test',
      passed: issues.length === 0,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static async testAudioControls(): Promise<TouchTestResult> {
    const deviceInfo = this.getDeviceInfo();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Test audio control elements
    const audioControls = document.querySelectorAll('[data-testid*="audio"], [aria-label*="audio"]');
    const minTouchTarget = 48;

    audioControls.forEach((control) => {
      const rect = control.getBoundingClientRect();
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Audio control too small: ${rect.width}x${rect.height}px`);
        recommendations.push('Audio controls should be at least 48px for easy touch access');
      }

      // Test for proper ARIA labels
      const ariaLabel = control.getAttribute('aria-label');
      if (!ariaLabel) {
        issues.push('Audio control missing accessibility label');
        recommendations.push('Add aria-label to all audio controls');
      }
    });

    return {
      testName: 'Audio Controls Touch Test',
      passed: issues.length === 0,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static async runFullTestSuite(): Promise<TouchTestSuite> {
    const [interactiveWordTest, navigationTest, audioControlTest] = await Promise.all([
      this.testInteractiveWords(),
      this.testNavigationControls(),
      this.testAudioControls()
    ]);

    const allTests = [interactiveWordTest, navigationTest, audioControlTest];
    const passedTests = allTests.filter(test => test.passed).length;
    const overallScore = (passedTests / allTests.length) * 100;

    const criticalIssues = allTests
      .flatMap(test => test.issues)
      .filter(issue => 
        issue.includes('too small') || 
        issue.includes('Slow') || 
        issue.includes('missing')
      );

    return {
      interactiveWordTests: [interactiveWordTest],
      navigationTests: [navigationTest],
      audioControlTests: [audioControlTest],
      overallScore,
      criticalIssues
    };
  }

  static async generateTestReport(): Promise<string> {
    const testSuite = await this.runFullTestSuite();
    
    let report = `# Mobile Touch Interaction Test Report\n\n`;
    report += `**Overall Score: ${testSuite.overallScore.toFixed(1)}%**\n\n`;
    
    if (testSuite.criticalIssues.length > 0) {
      report += `## Critical Issues\n`;
      testSuite.criticalIssues.forEach(issue => {
        report += `- ❌ ${issue}\n`;
      });
      report += `\n`;
    }

    const allTests = [
      ...testSuite.interactiveWordTests,
      ...testSuite.navigationTests,
      ...testSuite.audioControlTests
    ];

    allTests.forEach(test => {
      report += `## ${test.testName}\n`;
      report += `**Status:** ${test.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
      
      if (test.issues.length > 0) {
        report += `**Issues:**\n`;
        test.issues.forEach(issue => report += `- ${issue}\n`);
        report += `\n`;
      }

      if (test.recommendations.length > 0) {
        report += `**Recommendations:**\n`;
        test.recommendations.forEach(rec => report += `- ${rec}\n`);
        report += `\n`;
      }
    });

    return report;
  }
}