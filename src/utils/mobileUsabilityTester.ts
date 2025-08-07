/**
 * Comprehensive Mobile & Tablet Usability Testing Suite
 * Tests touch targets, spacing, layout, and accessibility
 */

export interface UsabilityTestResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    screenWidth: number;
    screenHeight: number;
    touchSupport: boolean;
  };
}

export interface UsabilityTestSuite {
  touchTargets: UsabilityTestResult;
  layout: UsabilityTestResult;
  floating: UsabilityTestResult;
  accessibility: UsabilityTestResult;
  overallScore: number;
  criticalIssues: string[];
}

export class MobileUsabilityTester {
  private static MIN_TOUCH_TARGET = 44; // Apple/Google guidelines
  private static MIN_SPACING = 8; // Minimum space between touch targets
  private static SAFE_AREA_PADDING = 16;

  static getDeviceInfo() {
    return {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }

  static testTouchTargets(): UsabilityTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();
    
    // Test all interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
    );

    let smallTargets = 0;
    let overlappingTargets = 0;

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      
      // Check if element is visible
      if (rect.width === 0 || rect.height === 0 || style.display === 'none') return;

      // Test touch target size
      const minSize = Math.min(rect.width, rect.height);
      if (minSize < this.MIN_TOUCH_TARGET) {
        smallTargets++;
        issues.push(`Element #${index} has touch target of ${Math.round(minSize)}px (minimum: ${this.MIN_TOUCH_TARGET}px)`);
      }

      // Test spacing between elements
      interactiveElements.forEach((otherElement, otherIndex) => {
        if (index >= otherIndex) return;
        
        const otherRect = otherElement.getBoundingClientRect();
        if (otherRect.width === 0 || otherRect.height === 0) return;

        const distance = this.calculateDistance(rect, otherRect);
        if (distance < this.MIN_SPACING && distance > 0) {
          overlappingTargets++;
          issues.push(`Elements #${index} and #${otherIndex} are too close (${Math.round(distance)}px apart)`);
        }
      });
    });

    if (smallTargets > 0) {
      recommendations.push(`Increase size of ${smallTargets} touch targets to minimum ${this.MIN_TOUCH_TARGET}px`);
    }
    if (overlappingTargets > 0) {
      recommendations.push(`Add spacing between ${overlappingTargets} overlapping interactive elements`);
    }

    const score = Math.max(0, 100 - (smallTargets * 10) - (overlappingTargets * 5));
    
    return {
      passed: score >= 80,
      score,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static testLayout(): UsabilityTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test safe area implementation
    const body = document.body;
    const html = document.documentElement;
    
    // Check for safe area CSS variables
    const hasSafeAreaTop = getComputedStyle(html).getPropertyValue('--safe-area-inset-top');
    const hasSafeAreaBottom = getComputedStyle(html).getPropertyValue('--safe-area-inset-bottom');
    
    if (!hasSafeAreaTop || !hasSafeAreaBottom) {
      issues.push('Safe area insets not properly implemented');
      recommendations.push('Add CSS safe area inset variables for proper mobile device support');
    }

    // Test header layout
    const header = document.querySelector('header, .header, [role="banner"]');
    if (header) {
      const headerRect = header.getBoundingClientRect();
      const headerHeight = headerRect.height;
      
      if (deviceInfo.isMobile && headerHeight > 80) {
        issues.push(`Header height (${Math.round(headerHeight)}px) too large for mobile`);
        recommendations.push('Reduce header height on mobile devices');
      }

      // Check for header text overflow
      const headerText = header.querySelectorAll('h1, h2, h3, .title');
      headerText.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        if (rect.width > deviceInfo.screenWidth - 32) {
          issues.push(`Header text element #${index} extends beyond screen bounds`);
          recommendations.push('Implement text truncation or responsive text sizing');
        }
      });
    }

    // Test for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      issues.push('Page has horizontal overflow causing horizontal scrolling');
      recommendations.push('Fix horizontal overflow to prevent horizontal scrolling');
    }

    const score = Math.max(0, 100 - (issues.length * 15));
    
    return {
      passed: score >= 70,
      score,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static testFloatingElements(): UsabilityTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test floating timer
    const floatingTimer = document.querySelector('#floating-timer, .floating-timer');
    if (floatingTimer) {
      const rect = floatingTimer.getBoundingClientRect();
      const style = getComputedStyle(floatingTimer);
      
      // Check if it's properly positioned
      if (style.position !== 'fixed') {
        issues.push('Floating timer is not properly positioned as fixed');
      }

      // Check if it obscures content on mobile
      if (deviceInfo.isMobile) {
        const contentElements = document.querySelectorAll('main, .story-content, .content');
        contentElements.forEach((element, index) => {
          const contentRect = element.getBoundingClientRect();
          if (this.elementsOverlap(rect, contentRect)) {
            issues.push(`Floating timer overlaps with content element #${index}`);
            recommendations.push('Make floating timer collapsible on mobile');
          }
        });
      }
    }

    // Test tutorial overlay
    const tutorialOverlay = document.querySelector('.tutorial-overlay, [role="dialog"]');
    if (tutorialOverlay) {
      const rect = tutorialOverlay.getBoundingClientRect();
      
      // Check if tutorial covers interactive elements
      const interactiveElements = document.querySelectorAll('button, [role="button"]');
      let coveredElements = 0;
      
      interactiveElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        if (this.elementsOverlap(rect, elementRect)) {
          coveredElements++;
        }
      });

      if (coveredElements > 1) {
        issues.push(`Tutorial overlay covers ${coveredElements} interactive elements`);
        recommendations.push('Improve tutorial positioning to avoid covering target elements');
      }
    }

    // Test audio controls positioning
    const audioControls = document.querySelector('.audio-controls, [data-testid="audio-controls"]');
    if (audioControls && deviceInfo.isMobile) {
      const rect = audioControls.getBoundingClientRect();
      
      // Check if audio controls are too close to screen edges
      if (rect.right > deviceInfo.screenWidth - this.SAFE_AREA_PADDING) {
        issues.push('Audio controls extend too close to screen edge');
        recommendations.push('Add proper padding for mobile safe areas');
      }
    }

    const score = Math.max(0, 100 - (issues.length * 20));
    
    return {
      passed: score >= 75,
      score,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static testAccessibility(): UsabilityTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Test ARIA labels
    const interactiveElements = document.querySelectorAll('button, [role="button"]');
    let missingLabels = 0;

    interactiveElements.forEach((element, index) => {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      element.textContent?.trim();
      
      if (!hasLabel) {
        missingLabels++;
        issues.push(`Interactive element #${index} missing accessible label`);
      }
    });

    if (missingLabels > 0) {
      recommendations.push(`Add ARIA labels to ${missingLabels} interactive elements`);
    }

    // Test focus indicators
    const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a');
    let poorFocusIndicators = 0;

    focusableElements.forEach((element) => {
      const style = getComputedStyle(element);
      const outlineWidth = style.outlineWidth;
      
      if (outlineWidth === '0px' || outlineWidth === 'none') {
        poorFocusIndicators++;
      }
    });

    if (poorFocusIndicators > 0) {
      issues.push(`${poorFocusIndicators} elements have poor focus indicators`);
      recommendations.push('Enhance focus indicators for better keyboard navigation');
    }

    const score = Math.max(0, 100 - (missingLabels * 8) - (poorFocusIndicators * 5));
    
    return {
      passed: score >= 85,
      score,
      issues,
      recommendations,
      deviceInfo
    };
  }

  static runFullTestSuite(): UsabilityTestSuite {
    const touchTargets = this.testTouchTargets();
    const layout = this.testLayout();
    const floating = this.testFloatingElements();
    const accessibility = this.testAccessibility();

    const overallScore = Math.round(
      (touchTargets.score * 0.3 + layout.score * 0.25 + floating.score * 0.25 + accessibility.score * 0.2)
    );

    // Identify critical issues
    const criticalIssues: string[] = [];
    
    if (touchTargets.score < 60) criticalIssues.push('Multiple touch targets below minimum size');
    if (layout.score < 50) criticalIssues.push('Severe layout issues affecting usability');
    if (floating.score < 60) criticalIssues.push('Floating elements obscuring important content');
    if (accessibility.score < 70) criticalIssues.push('Accessibility barriers for users with disabilities');

    return {
      touchTargets,
      layout,
      floating,
      accessibility,
      overallScore,
      criticalIssues
    };
  }

  static generateReport(testSuite: UsabilityTestSuite): string {
    const { deviceInfo } = testSuite.touchTargets;
    
    return `
# Mobile Usability Test Report

## Device Information
- **Device Type**: ${deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
- **Screen Size**: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}
- **Touch Support**: ${deviceInfo.touchSupport ? 'Yes' : 'No'}

## Overall Score: ${testSuite.overallScore}/100

### Touch Targets: ${testSuite.touchTargets.score}/100 ${testSuite.touchTargets.passed ? '✅' : '❌'}
${testSuite.touchTargets.issues.map(issue => `- ❌ ${issue}`).join('\n')}
${testSuite.touchTargets.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

### Layout: ${testSuite.layout.score}/100 ${testSuite.layout.passed ? '✅' : '❌'}
${testSuite.layout.issues.map(issue => `- ❌ ${issue}`).join('\n')}
${testSuite.layout.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

### Floating Elements: ${testSuite.floating.score}/100 ${testSuite.floating.passed ? '✅' : '❌'}
${testSuite.floating.issues.map(issue => `- ❌ ${issue}`).join('\n')}
${testSuite.floating.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

### Accessibility: ${testSuite.accessibility.score}/100 ${testSuite.accessibility.passed ? '✅' : '❌'}
${testSuite.accessibility.issues.map(issue => `- ❌ ${issue}`).join('\n')}
${testSuite.accessibility.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

## Critical Issues
${testSuite.criticalIssues.length === 0 ? '✅ No critical issues found!' : testSuite.criticalIssues.map(issue => `- 🚨 ${issue}`).join('\n')}

Generated: ${new Date().toISOString()}
    `.trim();
  }

  private static calculateDistance(rect1: DOMRect, rect2: DOMRect): number {
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  private static elementsOverlap(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }
}