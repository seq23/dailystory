// Mobile Interaction Testing Module
export interface TouchTestResult {
  testName: string;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    touchSupport: boolean;
    screenSize: string;
    userAgent: string;
  };
}

export interface TouchTestSuite {
  interactiveWords: TouchTestResult;
  navigationControls: TouchTestResult;
  audioControls: TouchTestResult;
  overallScore: number;
  criticalIssues: string[];
}

export class MobileInteractionTester {
  static getDeviceInfo() {
    return {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isTablet: /iPad|Android.*Tablet/i.test(navigator.userAgent),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    };
  }

  static testInteractiveWords(): TouchTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test touch target sizes for interactive words
    const interactiveWords = document.querySelectorAll('[data-testid*="interactive-word"], .interactive-word, [class*="interactive"]');
    
    interactiveWords.forEach((word, index) => {
      const rect = word.getBoundingClientRect();
      const minTouchTarget = deviceInfo.isMobile ? 44 : 32; // iOS/Android guidelines
      
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Interactive word ${index + 1} too small for touch (${rect.width}x${rect.height}px)`);
      }
    });

    // Test touch response timing
    if (deviceInfo.touchSupport) {
      const touchElements = document.querySelectorAll('[data-testid*="touch"], .touchable, button, [role="button"]');
      if (touchElements.length === 0) {
        issues.push('No touch-optimized elements detected');
      }
    }

    // Test mobile view quality (Issue #7)
    if (deviceInfo.isMobile && window.innerWidth < 768) {
      const storyDisplay = document.querySelector('[data-testid="story-display"], .story-content');
      if (storyDisplay) {
        const style = window.getComputedStyle(storyDisplay);
        
        // Check if text is too small
        const fontSize = parseInt(style.fontSize);
        if (fontSize < 16) {
          issues.push('Text too small for mobile reading (should be at least 16px)');
        }
        
        // Check margins and padding
        const padding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
        if (padding < 32) {
          issues.push('Insufficient padding for mobile reading experience');
        }
        
        // Check if content overflows
        if (storyDisplay.scrollWidth > storyDisplay.clientWidth) {
          issues.push('Content overflows on mobile viewport');
        }
      }
    }

    return {
      testName: 'Interactive Words Touch Testing',
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? [
        'Increase touch target sizes to minimum 44px',
        'Add touch feedback animations',
        'Optimize mobile text size and spacing',
        'Test on actual mobile devices'
      ] : recommendations,
      deviceInfo
    };
  }

  static testNavigationControls(): TouchTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test navigation button sizes and spacing
    const navButtons = document.querySelectorAll('nav button, [role="navigation"] button, .navigation button');
    
    navButtons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const minSize = deviceInfo.isMobile ? 44 : 32;
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push(`Navigation button ${index + 1} too small for touch`);
      }
    });

    // Test spacing between interactive elements
    if (navButtons.length > 1) {
      for (let i = 0; i < navButtons.length - 1; i++) {
        const rect1 = navButtons[i].getBoundingClientRect();
        const rect2 = navButtons[i + 1].getBoundingClientRect();
        
        const spacing = Math.min(
          Math.abs(rect2.left - rect1.right),
          Math.abs(rect2.top - rect1.bottom)
        );
        
        if (spacing < 8 && deviceInfo.isMobile) {
          issues.push(`Insufficient spacing between navigation elements (${spacing}px)`);
        }
      }
    }

    // Test page navigation
    const pageControls = document.querySelectorAll('[data-testid*="page"], .page-nav, [aria-label*="page"]');
    if (pageControls.length === 0 && deviceInfo.isMobile) {
      recommendations.push('Consider adding swipe gestures for page navigation');
    }

    return {
      testName: 'Navigation Controls Touch Testing',
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? [
        'Increase button sizes for better touch targets',
        'Add adequate spacing between interactive elements',
        'Implement touch-friendly navigation patterns'
      ] : recommendations,
      deviceInfo
    };
  }

  static testAudioControls(): TouchTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test audio control sizes
    const audioButtons = document.querySelectorAll('[data-testid*="audio"], .audio-control, button[aria-label*="play"], button[aria-label*="pause"]');
    
    audioButtons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const minSize = deviceInfo.isMobile ? 48 : 36; // Audio controls should be slightly larger
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push(`Audio control ${index + 1} too small for reliable touch interaction`);
      }

      // Check for proper ARIA labels
      const ariaLabel = button.getAttribute('aria-label');
      const hasText = button.textContent?.trim();
      
      if (!ariaLabel && !hasText) {
        issues.push(`Audio control ${index + 1} lacks accessibility labels`);
      }
    });

    // Test audio feedback
    if (deviceInfo.touchSupport && audioButtons.length > 0) {
      recommendations.push('Ensure audio controls provide haptic feedback on touch devices');
    }

    return {
      testName: 'Audio Controls Touch Testing',
      passed: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? [
        'Increase audio control sizes for better touch interaction',
        'Add proper accessibility labels to all controls',
        'Implement haptic feedback for touch devices'
      ] : recommendations,
      deviceInfo
    };
  }

  static runFullTestSuite(): TouchTestSuite {
    console.log('📱 Running Mobile Interaction Test Suite...');
    
    const interactiveWords = this.testInteractiveWords();
    const navigationControls = this.testNavigationControls();
    const audioControls = this.testAudioControls();

    const allIssues = [
      ...interactiveWords.issues,
      ...navigationControls.issues,
      ...audioControls.issues
    ];

    const totalTests = 3;
    const passedTests = [interactiveWords, navigationControls, audioControls].filter(test => test.passed).length;
    const overallScore = (passedTests / totalTests) * 100;

    const criticalIssues = allIssues.filter(issue => 
      issue.includes('too small') || 
      issue.includes('overflows') || 
      issue.includes('lacks accessibility')
    );

    return {
      interactiveWords,
      navigationControls,
      audioControls,
      overallScore,
      criticalIssues
    };
  }

  static generateTestReport(testSuite: TouchTestSuite): string {
    let report = '\n📱 MOBILE INTERACTION TEST REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    report += `📊 Overall Score: ${testSuite.overallScore.toFixed(1)}%\n`;
    report += `🚨 Critical Issues: ${testSuite.criticalIssues.length}\n\n`;

    const tests = [
      { name: 'Interactive Words', result: testSuite.interactiveWords },
      { name: 'Navigation Controls', result: testSuite.navigationControls },
      { name: 'Audio Controls', result: testSuite.audioControls }
    ];

    tests.forEach(test => {
      report += `\n📋 ${test.name}\n`;
      report += `Status: ${test.result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
      
      if (test.result.issues.length > 0) {
        report += `Issues:\n`;
        test.result.issues.forEach(issue => {
          report += `  🚨 ${issue}\n`;
        });
      }
      
      if (test.result.recommendations.length > 0) {
        report += `Recommendations:\n`;
        test.result.recommendations.forEach(rec => {
          report += `  💡 ${rec}\n`;
        });
      }
    });

    if (testSuite.criticalIssues.length > 0) {
      report += '\n🎯 CRITICAL ISSUES TO FIX:\n';
      testSuite.criticalIssues.forEach((issue, i) => {
        report += `${i + 1}. ${issue}\n`;
      });
    }

    return report;
  }
}