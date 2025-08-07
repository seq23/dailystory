// Performance-Optimized Mobile Interaction Testing
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
  performance: {
    executionTime: number;
    memoryUsage: number;
    elementsScanned: number;
  };
}

export interface TouchTestSuite {
  interactiveWords: TouchTestResult;
  navigationControls: TouchTestResult;
  audioControls: TouchTestResult;
  formElements: TouchTestResult;
  overallScore: number;
  criticalIssues: string[];
  performanceMetrics: {
    totalExecutionTime: number;
    memoryFootprint: number;
    cacheHits: number;
  };
}

export class PerformanceOptimizedMobileInteractionTester {
  private static cache = new Map<string, TouchTestResult>();
  private static performanceObserver: PerformanceObserver | null = null;
  
  static async runAsyncTestSuite(): Promise<TouchTestSuite> {
    const startTime = performance.now();
    let memoryBefore = 0;
    
    // Memory measurement if available
    if ('memory' in performance) {
      memoryBefore = (performance as any).memory.usedJSHeapSize;
    }

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();

    // Run tests with idle callback scheduling
    const results = await this.scheduleTestsWithIdleCallback();
    
    const executionTime = performance.now() - startTime;
    let memoryAfter = 0;
    
    if ('memory' in performance) {
      memoryAfter = (performance as any).memory.usedJSHeapSize;
    }

    const suite: TouchTestSuite = {
      ...results,
      performanceMetrics: {
        totalExecutionTime: executionTime,
        memoryFootprint: memoryAfter - memoryBefore,
        cacheHits: this.cache.size
      }
    };

    // Clean up
    this.cleanup();
    
    // Log performance-optimized summary
    console.log(`📱 Mobile Tests: ${suite.overallScore.toFixed(1)}% (${executionTime.toFixed(2)}ms)`);
    
    return suite;
  }

  private static async scheduleTestsWithIdleCallback(): Promise<Omit<TouchTestSuite, 'performanceMetrics'>> {
    return new Promise((resolve) => {
      const tests = [
        () => this.testInteractiveWords(),
        () => this.testNavigationControls(),
        () => this.testAudioControls(),
        () => this.testFormElements()
      ];

      const results: Partial<TouchTestSuite> = {};
      let completedTests = 0;

      const runNextTest = () => {
        if (completedTests >= tests.length) {
          const allResults = results as any;
          const allIssues = [
            ...allResults.interactiveWords.issues,
            ...allResults.navigationControls.issues,
            ...allResults.audioControls.issues,
            ...allResults.formElements.issues
          ];

          const passedTests = [
            allResults.interactiveWords.passed,
            allResults.navigationControls.passed,
            allResults.audioControls.passed,
            allResults.formElements.passed
          ].filter(Boolean).length;

          resolve({
            ...allResults,
            overallScore: (passedTests / 4) * 100,
            criticalIssues: allIssues.filter(issue => 
              issue.includes('too small') || 
              issue.includes('overflows') || 
              issue.includes('lacks accessibility')
            )
          });
          return;
        }

        const testFunction = tests[completedTests];
        const testName = ['interactiveWords', 'navigationControls', 'audioControls', 'formElements'][completedTests];
        
        // Use requestIdleCallback for non-blocking execution
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            (results as any)[testName] = testFunction();
            completedTests++;
            runNextTest();
          }, { timeout: 50 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            (results as any)[testName] = testFunction();
            completedTests++;
            runNextTest();
          }, 0);
        }
      };

      runNextTest();
    });
  }

  private static initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 16) { // 60fps threshold
            console.warn(`⚠️ Slow operation detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        });
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // Silently handle browsers that don't support all entry types
      }
    }
  }

  static getDeviceInfo() {
    const cacheKey = 'deviceInfo';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.deviceInfo;
    }

    return {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isTablet: /iPad|Android.*Tablet/i.test(navigator.userAgent),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    };
  }

  static testInteractiveWords(): TouchTestResult {
    const startTime = performance.now();
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    // Performance-optimized element selection
    const interactiveWords = document.querySelectorAll('[data-testid*="interactive-word"], .interactive-word, [class*="interactive"]');
    let elementsScanned = interactiveWords.length;

    if (interactiveWords.length === 0) {
      // Quick exit if no elements found
      return this.createTestResult('Interactive Words Touch Testing', true, [], [], deviceInfo, performance.now() - startTime, 0);
    }

    // Batch DOM reads to avoid layout thrashing
    const rects = Array.from(interactiveWords).map(word => ({
      element: word,
      rect: word.getBoundingClientRect()
    }));

    const minTouchTarget = deviceInfo.isMobile ? 44 : deviceInfo.isTablet ? 40 : 32;

    rects.forEach(({ element, rect }, index) => {
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        issues.push(`Interactive word ${index + 1} too small (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`);
      }

      // Check spacing between adjacent elements
      if (index < rects.length - 1) {
        const nextRect = rects[index + 1].rect;
        const spacing = Math.abs(nextRect.left - rect.right);
        if (spacing < 8 && deviceInfo.isMobile) {
          issues.push(`Insufficient spacing between interactive elements (${spacing.toFixed(0)}px)`);
        }
      }
    });

    // Enhanced mobile-specific checks
    if (deviceInfo.isMobile) {
      // Check for text size
      const storyDisplay = document.querySelector('[data-testid="story-display"], .story-content');
      if (storyDisplay) {
        const style = window.getComputedStyle(storyDisplay);
        const fontSize = parseInt(style.fontSize);
        
        if (fontSize < 16) {
          issues.push('Text too small for mobile reading (minimum 16px required)');
          recommendations.push('Increase base font size to 16px for better mobile readability');
        }

        // Check for horizontal overflow
        if (storyDisplay.scrollWidth > storyDisplay.clientWidth) {
          issues.push('Content overflows horizontally on mobile');
          recommendations.push('Implement responsive text wrapping and container sizing');
        }
      }

      // Check for keyboard obstruction
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const rect = input.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 200) {
          issues.push(`Input field ${index + 1} may be obscured by mobile keyboard`);
          recommendations.push('Implement viewport adjustment for keyboard display');
        }
      });
    }

    if (issues.length === 0) {
      recommendations.push('Interactive elements meet mobile accessibility standards');
    } else {
      recommendations.push('Optimize touch targets to minimum 44px for mobile devices');
      recommendations.push('Implement haptic feedback for better touch interaction');
    }

    return this.createTestResult(
      'Interactive Words Touch Testing',
      issues.length === 0,
      issues,
      recommendations,
      deviceInfo,
      performance.now() - startTime,
      elementsScanned
    );
  }

  static testNavigationControls(): TouchTestResult {
    const startTime = performance.now();
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    const navElements = document.querySelectorAll('nav button, [role="navigation"] button, .navigation button, [data-testid*="nav"]');
    let elementsScanned = navElements.length;

    if (navElements.length === 0) {
      issues.push('No navigation controls detected');
      recommendations.push('Add accessible navigation controls with proper ARIA labels');
      return this.createTestResult('Navigation Controls', false, issues, recommendations, deviceInfo, performance.now() - startTime, 0);
    }

    const minSize = deviceInfo.isMobile ? 44 : deviceInfo.isTablet ? 40 : 36;

    // Batch process navigation elements
    Array.from(navElements).forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push(`Navigation control ${index + 1} below minimum touch target (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`);
      }

      // Check for ARIA labels
      const hasLabel = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent?.trim();
      if (!hasLabel) {
        issues.push(`Navigation control ${index + 1} lacks accessibility label`);
      }

      // Check if element is actually interactive
      const style = window.getComputedStyle(element);
      if (style.pointerEvents === 'none') {
        issues.push(`Navigation control ${index + 1} appears non-interactive`);
      }
    });

    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) {
      issues.push('No keyboard-accessible navigation detected');
      recommendations.push('Ensure all navigation elements are keyboard accessible');
    }

    // Mobile-specific navigation checks
    if (deviceInfo.isMobile) {
      // Check for swipe gesture support
      const storyContainer = document.querySelector('[data-testid*="story"], .story-container');
      if (storyContainer && !storyContainer.getAttribute('data-swipe-enabled')) {
        recommendations.push('Consider adding swipe gesture support for story navigation');
      }

      // Check for safe area compliance
      const header = document.querySelector('header, [role="banner"]');
      if (header) {
        const style = window.getComputedStyle(header);
        if (!style.paddingTop.includes('env(safe-area-inset-top)') && !style.paddingTop.includes('constant(safe-area-inset-top)')) {
          issues.push('Header may not handle device safe areas (notch/status bar)');
          recommendations.push('Implement safe area insets for modern mobile devices');
        }
      }
    }

    return this.createTestResult(
      'Navigation Controls',
      issues.length === 0,
      issues,
      recommendations,
      deviceInfo,
      performance.now() - startTime,
      elementsScanned
    );
  }

  static testAudioControls(): TouchTestResult {
    const startTime = performance.now();
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    const audioControls = document.querySelectorAll('[data-testid*="audio"], .audio-control, button[aria-label*="play"], button[aria-label*="pause"], [role="button"][aria-label*="audio"]');
    let elementsScanned = audioControls.length;

    if (audioControls.length === 0) {
      // This might be expected if no audio features are active
      return this.createTestResult('Audio Controls', true, [], ['Audio controls will be tested when audio features are active'], deviceInfo, performance.now() - startTime, 0);
    }

    const minSize = deviceInfo.isMobile ? 48 : deviceInfo.isTablet ? 44 : 40; // Audio controls need larger targets

    Array.from(audioControls).forEach((control, index) => {
      const rect = control.getBoundingClientRect();
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push(`Audio control ${index + 1} too small for reliable interaction (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`);
      }

      // Check for accessibility labels
      const ariaLabel = control.getAttribute('aria-label');
      const title = control.getAttribute('title');
      const textContent = control.textContent?.trim();
      
      if (!ariaLabel && !title && !textContent) {
        issues.push(`Audio control ${index + 1} lacks accessibility description`);
      }

      // Check for visual feedback states
      const hasActiveState = control.getAttribute('aria-pressed') !== null || 
                           control.classList.contains('active') || 
                           control.classList.contains('playing');
      
      if (!hasActiveState) {
        recommendations.push(`Audio control ${index + 1} should indicate its current state`);
      }
    });

    // Check for audio loading states
    const loadingIndicators = document.querySelectorAll('[data-testid*="audio-loading"], .audio-loading, [aria-label*="loading"]');
    if (audioControls.length > 0 && loadingIndicators.length === 0) {
      recommendations.push('Consider adding loading indicators for audio operations');
    }

    // Mobile-specific audio checks
    if (deviceInfo.isMobile) {
      recommendations.push('Ensure audio controls work with mobile autoplay restrictions');
      recommendations.push('Test audio controls with mobile assistive technologies');
    }

    return this.createTestResult(
      'Audio Controls',
      issues.length === 0,
      issues,
      recommendations,
      deviceInfo,
      performance.now() - startTime,
      elementsScanned
    );
  }

  static testFormElements(): TouchTestResult {
    const startTime = performance.now();
    const issues: string[] = [];
    const recommendations: string[] = [];
    const deviceInfo = this.getDeviceInfo();

    const forms = document.querySelectorAll('form, [data-testid*="form"], .user-form');
    let elementsScanned = 0;

    if (forms.length === 0) {
      return this.createTestResult('Form Elements', true, [], ['Form elements will be tested when forms are present'], deviceInfo, performance.now() - startTime, 0);
    }

    forms.forEach((form, formIndex) => {
      const inputs = form.querySelectorAll('input, select, textarea, button');
      elementsScanned += inputs.length;

      const minInputHeight = deviceInfo.isMobile ? 44 : deviceInfo.isTablet ? 40 : 36;
      const minButtonSize = deviceInfo.isMobile ? 48 : deviceInfo.isTablet ? 44 : 40;

      inputs.forEach((input, inputIndex) => {
        const rect = input.getBoundingClientRect();
        const isButton = input.tagName.toLowerCase() === 'button' || input.getAttribute('type') === 'submit';
        const minSize = isButton ? minButtonSize : minInputHeight;

        if (rect.height < minSize) {
          issues.push(`Form ${formIndex + 1} input ${inputIndex + 1} too small (${rect.height.toFixed(0)}px height)`);
        }

        // Check for proper labeling
        const id = input.getAttribute('id');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        const placeholder = input.getAttribute('placeholder');

        if (!label && !ariaLabel && !placeholder) {
          issues.push(`Form ${formIndex + 1} input ${inputIndex + 1} lacks proper labeling`);
        }

        // Check for mobile keyboard optimization
        if (deviceInfo.isMobile && input.tagName.toLowerCase() === 'input') {
          const inputType = input.getAttribute('type') || 'text';
          const inputMode = input.getAttribute('inputmode');
          
          if (inputType === 'email' && !inputMode) {
            recommendations.push(`Consider adding inputmode="email" for better mobile keyboard`);
          }
          if (inputType === 'tel' && !inputMode) {
            recommendations.push(`Consider adding inputmode="tel" for numeric keyboard`);
          }
        }
      });

      // Check form spacing
      if (inputs.length > 1) {
        const inputRects = Array.from(inputs).map(input => input.getBoundingClientRect());
        for (let i = 0; i < inputRects.length - 1; i++) {
          const spacing = inputRects[i + 1].top - inputRects[i].bottom;
          const minSpacing = deviceInfo.isMobile ? 16 : 12;
          
          if (spacing < minSpacing && spacing > 0) {
            issues.push(`Form ${formIndex + 1} has insufficient spacing between inputs (${spacing.toFixed(0)}px)`);
          }
        }
      }

      // Check for mobile viewport handling
      if (deviceInfo.isMobile) {
        const formRect = form.getBoundingClientRect();
        if (formRect.width > window.innerWidth - 32) {
          issues.push(`Form ${formIndex + 1} too wide for mobile viewport`);
        }

        // Check for keyboard avoidance
        const lastInput = inputs[inputs.length - 1];
        if (lastInput && lastInput.getBoundingClientRect().bottom > window.innerHeight - 200) {
          issues.push(`Form ${formIndex + 1} bottom elements may be obscured by keyboard`);
          recommendations.push('Implement keyboard avoidance for better mobile UX');
        }
      }
    });

    return this.createTestResult(
      'Form Elements',
      issues.length === 0,
      issues,
      recommendations,
      deviceInfo,
      performance.now() - startTime,
      elementsScanned
    );
  }

  private static createTestResult(
    testName: string,
    passed: boolean,
    issues: string[],
    recommendations: string[],
    deviceInfo: ReturnType<typeof PerformanceOptimizedMobileInteractionTester.getDeviceInfo>,
    executionTime: number,
    elementsScanned: number
  ): TouchTestResult {
    return {
      testName,
      passed,
      issues,
      recommendations,
      deviceInfo,
      performance: {
        executionTime,
        memoryUsage: 0, // Will be calculated in the suite
        elementsScanned
      }
    };
  }

  private static cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    // Clear cache if it gets too large
    if (this.cache.size > 50) {
      this.cache.clear();
    }
  }

  static generateCompactReport(testSuite: TouchTestSuite): string {
    const { overallScore, criticalIssues, performanceMetrics } = testSuite;
    
    let report = `📱 Mobile: ${overallScore.toFixed(1)}%`;
    
    if (criticalIssues.length > 0) {
      report += ` ⚠️ ${criticalIssues.length} critical`;
    }
    
    if (performanceMetrics.totalExecutionTime > 100) {
      report += ` 🐌 ${performanceMetrics.totalExecutionTime.toFixed(0)}ms`;
    }
    
    return report;
  }
}