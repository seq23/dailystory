// Optimized User Info Form Testing with Enhanced UX Validation
export interface UserInfoFormTestResult {
  testName: string;
  passed: boolean;
  score: number;
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    description: string;
    element?: string;
    suggestion: string;
    deviceSpecific?: 'mobile' | 'tablet' | 'desktop';
    quickFix?: string;
  }>;
  recommendations: string[];
  deviceMetrics: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  performanceMetrics: {
    executionTime: number;
    elementsScanned: number;
    formsAnalyzed: number;
  };
  accessibilityScore: number;
  mobileOptimizationScore: number;
}

export class OptimizedUserInfoFormTester {
  private static cache = new Map<string, any>();

  static async runUserInfoFormTests(): Promise<UserInfoFormTestResult> {
    const startTime = performance.now();
    
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    let mobileScore = 100;
    let tabletScore = 100;
    let desktopScore = 100;
    let accessibilityScore = 100;
    let mobileOptimizationScore = 100;
    let elementsScanned = 0;
    let formsAnalyzed = 0;

    const currentWidth = window.innerWidth;
    const isMobile = currentWidth < 768;
    const isTablet = currentWidth >= 768 && currentWidth < 1024;
    const isDesktop = currentWidth >= 1024;

    try {
      // Enhanced form detection with multiple strategies
      const formResults = this.detectAndAnalyzeForms();
      formsAnalyzed = formResults.formsFound;
      elementsScanned += formResults.elementsScanned;

      if (formResults.formsFound === 0) {
        // If no forms found, return early with neutral score
        return this.createNoFormsResult(performance.now() - startTime);
      }

      // Run comprehensive form tests
      const testResults = await this.runComprehensiveFormTests(formResults.forms, isMobile, isTablet, isDesktop);
      
      issues.push(...testResults.issues);
      recommendations.push(...testResults.recommendations);
      elementsScanned += testResults.elementsScanned;
      accessibilityScore = testResults.accessibilityScore;
      mobileOptimizationScore = testResults.mobileOptimizationScore;

      // Calculate device-specific scores
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      const majorIssues = issues.filter(i => i.severity === 'major');
      const minorIssues = issues.filter(i => i.severity === 'minor');

      if (isMobile) {
        mobileScore -= (criticalIssues.length * 30) + (majorIssues.length * 15) + (minorIssues.length * 5);
      }
      if (isTablet) {
        tabletScore -= (criticalIssues.length * 25) + (majorIssues.length * 12) + (minorIssues.length * 4);
      }
      if (isDesktop) {
        desktopScore -= (criticalIssues.length * 20) + (majorIssues.length * 10) + (minorIssues.length * 3);
      }

      const overallScore = Math.max(0, (mobileScore + tabletScore + desktopScore) / 3);
      const passed = overallScore >= 70 && criticalIssues.length === 0;

      const result: UserInfoFormTestResult = {
        testName: 'Optimized User Info Form Testing',
        passed,
        score: overallScore,
        issues,
        recommendations: [
          ...recommendations,
          'Ensure form accessibility across all devices',
          'Test form with keyboard navigation',
          'Validate mobile keyboard interactions'
        ],
        deviceMetrics: {
          mobile: Math.max(0, mobileScore),
          tablet: Math.max(0, tabletScore),
          desktop: Math.max(0, desktopScore)
        },
        performanceMetrics: {
          executionTime: performance.now() - startTime,
          elementsScanned,
          formsAnalyzed
        },
        accessibilityScore: Math.max(0, accessibilityScore),
        mobileOptimizationScore: Math.max(0, mobileOptimizationScore)
      };

      // Log compact summary
      console.log(`📝 Form: ${overallScore.toFixed(1)}% (A11y: ${accessibilityScore.toFixed(0)}%, Mobile: ${mobileOptimizationScore.toFixed(0)}%) (${result.performanceMetrics.executionTime.toFixed(1)}ms)`);

      return result;

    } catch (error) {
      console.error('Form testing failed:', error);
      return this.createErrorResult(performance.now() - startTime, elementsScanned, formsAnalyzed);
    }
  }

  private static detectAndAnalyzeForms() {
    const formSelectors = [
      'form',
      '[data-testid*="form"]',
      '[data-testid*="user"]',
      '.user-form',
      '.user-info',
      '[class*="user-info"]',
      '[role="form"]',
      'div:has(input)',
      'div:has(select)',
      'div:has(textarea)'
    ];

    const forms: HTMLElement[] = [];
    let elementsScanned = 0;

    formSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elementsScanned += elements.length;
        
        Array.from(elements).forEach(element => {
          const htmlElement = element as HTMLElement;
          
          // Check if element contains form inputs
          const hasInputs = htmlElement.querySelectorAll('input, select, textarea, button').length > 0;
          
          if (hasInputs && !forms.some(f => f.contains(htmlElement) || htmlElement.contains(f))) {
            forms.push(htmlElement);
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });

    return {
      forms,
      formsFound: forms.length,
      elementsScanned
    };
  }

  private static async runComprehensiveFormTests(
    forms: HTMLElement[],
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean
  ) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    let elementsScanned = 0;
    let accessibilityScore = 100;
    let mobileOptimizationScore = 100;

    for (const [formIndex, form] of forms.entries()) {
      // Test 1: Form Structure and Layout
      const structureResults = this.testFormStructure(form, formIndex, isMobile, isTablet, isDesktop);
      issues.push(...structureResults.issues);
      recommendations.push(...structureResults.recommendations);
      elementsScanned += structureResults.elementsScanned;

      // Test 2: Touch Interaction Optimization
      const touchResults = this.testTouchInteraction(form, formIndex, isMobile, isTablet, isDesktop);
      issues.push(...touchResults.issues);
      elementsScanned += touchResults.elementsScanned;
      mobileOptimizationScore -= touchResults.penaltyPoints;

      // Test 3: Accessibility Compliance
      const a11yResults = this.testFormAccessibility(form, formIndex);
      issues.push(...a11yResults.issues);
      recommendations.push(...a11yResults.recommendations);
      elementsScanned += a11yResults.elementsScanned;
      accessibilityScore -= a11yResults.penaltyPoints;

      // Test 4: Mobile Keyboard Optimization
      if (isMobile) {
        const keyboardResults = this.testMobileKeyboardHandling(form, formIndex);
        issues.push(...keyboardResults.issues);
        recommendations.push(...keyboardResults.recommendations);
        mobileOptimizationScore -= keyboardResults.penaltyPoints;
      }

      // Test 5: Form Validation and Error Handling
      const validationResults = this.testFormValidation(form, formIndex);
      issues.push(...validationResults.issues);
      recommendations.push(...validationResults.recommendations);
      elementsScanned += validationResults.elementsScanned;

      // Test 6: Responsive Design
      const responsiveResults = this.testResponsiveDesign(form, formIndex, isMobile, isTablet, isDesktop);
      issues.push(...responsiveResults.issues);
      elementsScanned += responsiveResults.elementsScanned;
    }

    return {
      issues,
      recommendations,
      elementsScanned,
      accessibilityScore: Math.max(0, accessibilityScore),
      mobileOptimizationScore: Math.max(0, mobileOptimizationScore)
    };
  }

  private static testFormStructure(form: HTMLElement, formIndex: number, isMobile: boolean, isTablet: boolean, isDesktop: boolean) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    
    const inputs = form.querySelectorAll('input, select, textarea, button');
    const labels = form.querySelectorAll('label');
    let elementsScanned = inputs.length + labels.length;

    // Test input-label association
    const orphanedInputs = Array.from(inputs).filter(input => {
      const id = input.id;
      const associatedLabel = id ? form.querySelector(`label[for="${id}"]`) : null;
      const parentLabel = input.closest('label');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      return !associatedLabel && !parentLabel && !ariaLabel && !ariaLabelledby;
    });

    if (orphanedInputs.length > 0) {
      issues.push({
        severity: 'major',
        description: `Form ${formIndex + 1}: ${orphanedInputs.length} inputs lack proper labels`,
        element: `form[${formIndex}]`,
        suggestion: 'Associate all inputs with labels using for/id or aria-label',
        quickFix: '<label for="input-id">Label Text</label><input id="input-id">'
      });
    }

    // Test form spacing
    if (inputs.length > 1) {
      const inputRects = Array.from(inputs).map(input => input.getBoundingClientRect());
      let insufficientSpacing = 0;
      
      for (let i = 0; i < inputRects.length - 1; i++) {
        const spacing = inputRects[i + 1].top - inputRects[i].bottom;
        const minSpacing = isMobile ? 16 : isTablet ? 12 : 8;
        
        if (spacing < minSpacing && spacing > 0) {
          insufficientSpacing++;
        }
      }

      if (insufficientSpacing > 0) {
        issues.push({
          severity: 'minor',
          description: `Form ${formIndex + 1}: ${insufficientSpacing} spacing issues between inputs`,
          element: `form[${formIndex}]`,
          suggestion: `Increase spacing to minimum ${isMobile ? 16 : isTablet ? 12 : 8}px`,
          deviceSpecific: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
          quickFix: 'margin-bottom: 1rem; /* or use gap in flexbox */'
        });
      }
    }

    // Test form heading
    const heading = form.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
    if (!heading) {
      recommendations.push(`Form ${formIndex + 1}: Consider adding a clear heading to explain form purpose`);
    }

    return { issues, recommendations, elementsScanned };
  }

  private static testTouchInteraction(form: HTMLElement, formIndex: number, isMobile: boolean, isTablet: boolean, isDesktop: boolean) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const interactiveElements = form.querySelectorAll('input, select, textarea, button, [role="button"]');
    let penaltyPoints = 0;

    const minSize = isMobile ? 44 : isTablet ? 40 : 36;
    let smallElements = 0;

    Array.from(interactiveElements).forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.height < minSize) {
        smallElements++;
        penaltyPoints += isMobile ? 15 : isTablet ? 10 : 5;
      }

      // Check for touch-friendly styling
      const style = window.getComputedStyle(element as HTMLElement);
      if (style.touchAction === 'auto' && (isMobile || isTablet)) {
        penaltyPoints += 2;
      }
    });

    if (smallElements > 0) {
      issues.push({
        severity: isMobile ? 'major' : 'minor',
        description: `Form ${formIndex + 1}: ${smallElements} elements below minimum touch target`,
        element: `form[${formIndex}]`,
        suggestion: `Increase element height to minimum ${minSize}px`,
        deviceSpecific: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        quickFix: `min-height: ${minSize}px; padding: 8px 12px;`
      });
    }

    return { issues, penaltyPoints, elementsScanned: interactiveElements.length };
  }

  private static testFormAccessibility(form: HTMLElement, formIndex: number) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    let penaltyPoints = 0;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    const buttons = form.querySelectorAll('button, [role="button"]');
    let elementsScanned = inputs.length + buttons.length;

    // Test required field indicators
    const requiredInputs = Array.from(inputs).filter(input => 
      input.hasAttribute('required') || input.getAttribute('aria-required') === 'true'
    );

    requiredInputs.forEach((input, index) => {
      const hasVisualIndicator = input.parentElement?.textContent?.includes('*') ||
                                input.getAttribute('aria-label')?.includes('required') ||
                                input.parentElement?.querySelector('[aria-label*="required"]');
      
      if (!hasVisualIndicator) {
        issues.push({
          severity: 'minor',
          description: `Form ${formIndex + 1}: Required field ${index + 1} lacks visual indicator`,
          element: `input[${index}]`,
          suggestion: 'Add visual indicator (* or "required") for required fields',
          quickFix: '<label>Name * <input required></label>'
        });
        penaltyPoints += 5;
      }
    });

    // Test button accessibility
    Array.from(buttons).forEach((button, index) => {
      const hasAccessibleName = button.getAttribute('aria-label') ||
                               button.getAttribute('aria-labelledby') ||
                               button.textContent?.trim();
      
      if (!hasAccessibleName) {
        issues.push({
          severity: 'major',
          description: `Form ${formIndex + 1}: Button ${index + 1} lacks accessible name`,
          element: `button[${index}]`,
          suggestion: 'Add aria-label or text content to button',
          quickFix: '<button aria-label="Submit form">Submit</button>'
        });
        penaltyPoints += 15;
      }
    });

    // Test fieldset usage for grouped inputs
    const radioGroups = form.querySelectorAll('input[type="radio"]');
    if (radioGroups.length > 1) {
      const fieldsets = form.querySelectorAll('fieldset');
      if (fieldsets.length === 0) {
        recommendations.push(`Form ${formIndex + 1}: Consider using fieldset for grouped radio buttons`);
        penaltyPoints += 5;
      }
    }

    return { issues, recommendations, elementsScanned, penaltyPoints };
  }

  private static testMobileKeyboardHandling(form: HTMLElement, formIndex: number) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    let penaltyPoints = 0;

    const inputs = form.querySelectorAll('input');
    
    Array.from(inputs).forEach((input, index) => {
      const type = input.getAttribute('type') || 'text';
      const inputMode = input.getAttribute('inputmode');
      const autoComplete = input.getAttribute('autocomplete');

      // Check for optimized input types
      if (type === 'text' && !inputMode) {
        const name = input.getAttribute('name')?.toLowerCase() || '';
        const id = input.id?.toLowerCase() || '';
        const label = form.querySelector(`label[for="${input.id}"]`)?.textContent?.toLowerCase() || '';
        
        if (name.includes('email') || id.includes('email') || label.includes('email')) {
          issues.push({
            severity: 'minor',
            description: `Form ${formIndex + 1}: Email input lacks inputmode="email"`,
            element: `input[${index}]`,
            suggestion: 'Add inputmode="email" for better mobile keyboard',
            deviceSpecific: 'mobile',
            quickFix: '<input type="email" inputmode="email">'
          });
          penaltyPoints += 3;
        }

        if (name.includes('phone') || name.includes('tel') || id.includes('phone') || label.includes('phone')) {
          issues.push({
            severity: 'minor',
            description: `Form ${formIndex + 1}: Phone input lacks inputmode="tel"`,
            element: `input[${index}]`,
            suggestion: 'Add inputmode="tel" for numeric keyboard',
            deviceSpecific: 'mobile',
            quickFix: '<input type="tel" inputmode="tel">'
          });
          penaltyPoints += 3;
        }
      }

      // Check for autocomplete optimization
      if (!autoComplete && (type === 'email' || type === 'tel' || type === 'text')) {
        recommendations.push(`Form ${formIndex + 1}: Consider adding autocomplete for input ${index + 1}`);
        penaltyPoints += 2;
      }
    });

    // Check for viewport handling
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta?.getAttribute('content')?.includes('viewport-fit=cover')) {
      recommendations.push(`Form ${formIndex + 1}: Consider viewport-fit=cover for full-screen mobile support`);
    }

    return { issues, recommendations, penaltyPoints };
  }

  private static testFormValidation(form: HTMLElement, formIndex: number) {
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    
    const errorElements = form.querySelectorAll('[class*="error"], [data-testid*="error"], [role="alert"]');
    const validationElements = form.querySelectorAll('[class*="validation"], [aria-invalid]');
    let elementsScanned = errorElements.length + validationElements.length;

    if (errorElements.length === 0 && validationElements.length === 0) {
      recommendations.push(`Form ${formIndex + 1}: Consider adding error handling and validation feedback`);
    }

    // Check for aria-describedby on inputs with validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    elementsScanned += inputs.length;

    Array.from(inputs).forEach((input, index) => {
      const describedBy = input.getAttribute('aria-describedby');
      if (!describedBy) {
        recommendations.push(`Form ${formIndex + 1}: Required input ${index + 1} could benefit from aria-describedby for error messages`);
      }
    });

    return { issues, recommendations, elementsScanned };
  }

  private static testResponsiveDesign(form: HTMLElement, formIndex: number, isMobile: boolean, isTablet: boolean, isDesktop: boolean) {
    const issues: UserInfoFormTestResult['issues'] = [];
    let elementsScanned = 1;

    const formRect = form.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // Test form width on different devices
    if (isMobile && formRect.width > screenWidth * 0.95) {
      issues.push({
        severity: 'major',
        description: `Form ${formIndex + 1}: Too wide for mobile viewport (${formRect.width.toFixed(0)}px)`,
        element: `form[${formIndex}]`,
        suggestion: 'Constrain form width to 95% of viewport on mobile',
        deviceSpecific: 'mobile',
        quickFix: 'max-width: 95vw; box-sizing: border-box;'
      });
    }

    if (isDesktop && formRect.width > screenWidth * 0.6) {
      issues.push({
        severity: 'minor',
        description: `Form ${formIndex + 1}: Very wide on desktop, consider constraining`,
        element: `form[${formIndex}]`,
        suggestion: 'Consider max-width for better desktop UX',
        deviceSpecific: 'desktop',
        quickFix: 'max-width: 600px; margin: 0 auto;'
      });
    }

    // Test horizontal scrolling
    if (form.scrollWidth > form.clientWidth) {
      issues.push({
        severity: 'major',
        description: `Form ${formIndex + 1}: Requires horizontal scrolling`,
        element: `form[${formIndex}]`,
        suggestion: 'Fix layout to prevent horizontal scrolling',
        quickFix: 'overflow-x: hidden; box-sizing: border-box;'
      });
    }

    return { issues, elementsScanned };
  }

  private static createNoFormsResult(executionTime: number): UserInfoFormTestResult {
    return {
      testName: 'Optimized User Info Form Testing',
      passed: true,
      score: 100,
      issues: [],
      recommendations: ['No forms detected - this is expected if no user info forms are currently visible'],
      deviceMetrics: {
        mobile: 100,
        tablet: 100,
        desktop: 100
      },
      performanceMetrics: {
        executionTime,
        elementsScanned: 0,
        formsAnalyzed: 0
      },
      accessibilityScore: 100,
      mobileOptimizationScore: 100
    };
  }

  private static createErrorResult(executionTime: number, elementsScanned: number, formsAnalyzed: number): UserInfoFormTestResult {
    return {
      testName: 'Optimized User Info Form Testing',
      passed: false,
      score: 0,
      issues: [{
        severity: 'critical',
        description: 'Form testing system encountered an error',
        suggestion: 'Fix form testing system'
      }],
      recommendations: ['Debug form testing system'],
      deviceMetrics: {
        mobile: 0,
        tablet: 0,
        desktop: 0
      },
      performanceMetrics: {
        executionTime,
        elementsScanned,
        formsAnalyzed
      },
      accessibilityScore: 0,
      mobileOptimizationScore: 0
    };
  }

  static generateCompactReport(result: UserInfoFormTestResult): string {
    const { score, accessibilityScore, mobileOptimizationScore, performanceMetrics } = result;
    
    let report = `📝 Form: ${score.toFixed(1)}%`;
    
    if (accessibilityScore < 90) {
      report += ` (A11y: ${accessibilityScore.toFixed(0)}%)`;
    }
    
    if (mobileOptimizationScore < 90) {
      report += ` (Mobile: ${mobileOptimizationScore.toFixed(0)}%)`;
    }
    
    if (performanceMetrics.executionTime > 100) {
      report += ` 🐌 ${performanceMetrics.executionTime.toFixed(0)}ms`;
    }
    
    return report;
  }
}