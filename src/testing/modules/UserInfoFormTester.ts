// User Info Form Testing Module
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
  }>;
  recommendations: string[];
  deviceMetrics: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export class UserInfoFormTester {
  static async runUserInfoFormTests(): Promise<UserInfoFormTestResult> {
    console.log('📝 Running User Info Form Tests...');
    
    const issues: UserInfoFormTestResult['issues'] = [];
    const recommendations: string[] = [];
    let mobileScore = 100;
    let tabletScore = 100;
    let desktopScore = 100;

    const currentWidth = window.innerWidth;
    const isMobile = currentWidth < 768;
    const isTablet = currentWidth >= 768 && currentWidth < 1024;
    const isDesktop = currentWidth >= 1024;

    // Test form formatting and layout
    this.testFormFormatting(issues, recommendations, isMobile, isTablet, isDesktop);
    
    // Test clickability on different devices
    this.testFormClickability(issues, recommendations, isMobile, isTablet, isDesktop);
    
    // Test overall design optimization
    this.testDesignOptimization(issues, recommendations, isMobile, isTablet, isDesktop);

    // Calculate device-specific scores
    if (isMobile) {
      mobileScore -= issues.filter(i => !i.deviceSpecific || i.deviceSpecific === 'mobile').length * 10;
    }
    if (isTablet) {
      tabletScore -= issues.filter(i => !i.deviceSpecific || i.deviceSpecific === 'tablet').length * 10;
    }
    if (isDesktop) {
      desktopScore -= issues.filter(i => !i.deviceSpecific || i.deviceSpecific === 'desktop').length * 10;
    }

    const overallScore = (mobileScore + tabletScore + desktopScore) / 3;
    const passed = overallScore >= 70 && issues.filter(i => i.severity === 'critical').length === 0;

    return {
      testName: 'User Info Form Comprehensive Testing',
      passed,
      score: overallScore,
      issues,
      recommendations: [
        'Optimize form layout for all device sizes',
        'Ensure proper touch target sizes',
        'Implement responsive form design',
        'Add proper validation feedback',
        ...recommendations
      ],
      deviceMetrics: {
        mobile: Math.max(0, mobileScore),
        tablet: Math.max(0, tabletScore),
        desktop: Math.max(0, desktopScore)
      }
    };
  }

  private static testFormFormatting(
    issues: UserInfoFormTestResult['issues'],
    recommendations: string[],
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean
  ): void {
    const userInfoForm = document.querySelector('form[data-testid*="user"], .user-form, [class*="user-info"]');
    
    if (!userInfoForm) {
      issues.push({
        severity: 'major',
        description: 'User info form not found',
        suggestion: 'Ensure user info form is properly structured and identifiable'
      });
      return;
    }

    // Test form layout and spacing
    const formFields = userInfoForm.querySelectorAll('input, select, textarea, .form-field, [class*="field"]');
    
    if (formFields.length === 0) {
      issues.push({
        severity: 'critical',
        description: 'No form fields detected in user info form',
        suggestion: 'Add proper form fields for user information collection'
      });
      return;
    }

    // Test field spacing
    if (formFields.length > 1) {
      for (let i = 0; i < formFields.length - 1; i++) {
        const rect1 = formFields[i].getBoundingClientRect();
        const rect2 = formFields[i + 1].getBoundingClientRect();
        const spacing = rect2.top - rect1.bottom;
        
        const minSpacing = isMobile ? 16 : isTablet ? 12 : 8;
        
        if (spacing < minSpacing) {
          issues.push({
            severity: 'minor',
            description: `Insufficient spacing between form fields (${spacing}px)`,
            suggestion: `Increase spacing to at least ${minSpacing}px for better visual separation`,
            deviceSpecific: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
          });
        }
      }
    }

    // Test form width and centering
    const formRect = userInfoForm.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    
    if (isMobile && formRect.width > screenWidth * 0.95) {
      issues.push({
        severity: 'major',
        description: 'Form too wide for mobile viewport',
        suggestion: 'Adjust form width to fit mobile screens with proper margins',
        deviceSpecific: 'mobile'
      });
    }

    if (isDesktop && formRect.width > screenWidth * 0.8) {
      issues.push({
        severity: 'minor',
        description: 'Form might be too wide on desktop',
        suggestion: 'Consider constraining form width on larger screens for better UX',
        deviceSpecific: 'desktop'
      });
    }

    // Test label positioning and clarity
    const labels = userInfoForm.querySelectorAll('label');
    const inputs = userInfoForm.querySelectorAll('input, select, textarea');
    
    if (labels.length < inputs.length) {
      issues.push({
        severity: 'major',
        description: 'Some form inputs lack proper labels',
        suggestion: 'Ensure all form inputs have associated labels for accessibility'
      });
    }
  }

  private static testFormClickability(
    issues: UserInfoFormTestResult['issues'],
    recommendations: string[],
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean
  ): void {
    const userInfoForm = document.querySelector('form[data-testid*="user"], .user-form, [class*="user-info"]');
    
    if (!userInfoForm) return;

    // Test input touch targets
    const interactiveElements = userInfoForm.querySelectorAll('input, select, textarea, button, [role="button"]');
    
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = isMobile ? 44 : isTablet ? 36 : 32;
      
      if (rect.height < minSize) {
        issues.push({
          severity: isMobile ? 'major' : 'minor',
          description: `Form element ${index + 1} too small for reliable interaction (${rect.height}px height)`,
          element: element.tagName.toLowerCase(),
          suggestion: `Increase height to at least ${minSize}px for better touch interaction`,
          deviceSpecific: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
        });
      }

      // Test element accessibility
      const isDisabled = element.hasAttribute('disabled');
      const style = window.getComputedStyle(element);
      const isHidden = style.display === 'none' || style.visibility === 'hidden';
      
      if (!isDisabled && !isHidden) {
        const isClickable = style.pointerEvents !== 'none';
        if (!isClickable) {
          issues.push({
            severity: 'major',
            description: `Form element ${index + 1} appears non-interactive`,
            element: element.tagName.toLowerCase(),
            suggestion: 'Ensure form elements are properly styled for interaction'
          });
        }
      }
    });

    // Test submit button placement and accessibility
    const submitButtons = userInfoForm.querySelectorAll('button[type="submit"], .submit-button, [data-testid*="submit"]');
    
    if (submitButtons.length === 0) {
      issues.push({
        severity: 'critical',
        description: 'No submit button found in user info form',
        suggestion: 'Add a clear submit button for form completion'
      });
    } else {
      submitButtons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const minSize = isMobile ? 48 : isTablet ? 40 : 36;
        
        if (rect.width < minSize || rect.height < minSize) {
          issues.push({
            severity: 'major',
            description: `Submit button ${index + 1} too small for reliable interaction`,
            suggestion: `Increase button size to at least ${minSize}x${minSize}px`,
            deviceSpecific: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
          });
        }

        // Check button positioning (especially for mobile keyboard)
        if (isMobile && rect.bottom > window.innerHeight - 150) {
          issues.push({
            severity: 'minor',
            description: 'Submit button may be obscured by mobile keyboard',
            suggestion: 'Ensure submit button remains accessible when keyboard is shown',
            deviceSpecific: 'mobile'
          });
        }
      });
    }
  }

  private static testDesignOptimization(
    issues: UserInfoFormTestResult['issues'],
    recommendations: string[],
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean
  ): void {
    const userInfoForm = document.querySelector('form[data-testid*="user"], .user-form, [class*="user-info"]');
    
    if (!userInfoForm) return;

    // Test visual hierarchy
    const headings = userInfoForm.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push({
        severity: 'minor',
        description: 'No heading found in user info form',
        suggestion: 'Add a clear heading to explain the form purpose'
      });
    }

    // Test error handling design
    const errorElements = userInfoForm.querySelectorAll('[class*="error"], [data-testid*="error"], .invalid');
    const validationMessages = userInfoForm.querySelectorAll('[class*="validation"], [role="alert"]');
    
    if (errorElements.length === 0 && validationMessages.length === 0) {
      recommendations.push('Consider adding visible error handling and validation feedback');
    }

    // Test progress indication
    const progressElements = userInfoForm.querySelectorAll('[class*="progress"], [data-testid*="progress"], .step-indicator');
    if (progressElements.length === 0) {
      recommendations.push('Consider adding progress indication for multi-step forms');
    }

    // Test form styling consistency
    const inputs = userInfoForm.querySelectorAll('input, select, textarea');
    const styles = Array.from(inputs).map(input => {
      const style = window.getComputedStyle(input);
      return {
        borderWidth: style.borderWidth,
        borderRadius: style.borderRadius,
        padding: style.padding,
        fontSize: style.fontSize
      };
    });

    const uniqueBorderWidths = [...new Set(styles.map(s => s.borderWidth))];
    const uniqueBorderRadius = [...new Set(styles.map(s => s.borderRadius))];
    
    if (uniqueBorderWidths.length > 2) {
      issues.push({
        severity: 'minor',
        description: 'Inconsistent border styling across form inputs',
        suggestion: 'Use consistent border styles for all form elements'
      });
    }

    if (uniqueBorderRadius.length > 2) {
      issues.push({
        severity: 'minor',
        description: 'Inconsistent border radius across form inputs',
        suggestion: 'Use consistent border radius for visual consistency'
      });
    }

    // Test form accessibility
    const formTitle = userInfoForm.querySelector('[role="heading"], h1, h2, h3');
    if (!formTitle) {
      issues.push({
        severity: 'minor',
        description: 'Form lacks clear title or heading',
        suggestion: 'Add descriptive heading to explain form purpose'
      });
    }

    // Test responsive behavior
    if (isMobile) {
      const horizontalScroll = userInfoForm.scrollWidth > userInfoForm.clientWidth;
      if (horizontalScroll) {
        issues.push({
          severity: 'major',
          description: 'Form requires horizontal scrolling on mobile',
          suggestion: 'Adjust form layout to fit mobile viewport',
          deviceSpecific: 'mobile'
        });
      }
    }
  }

  static generateFormTestReport(result: UserInfoFormTestResult): string {
    let report = '\n📝 USER INFO FORM TEST REPORT\n';
    report += '=' .repeat(60) + '\n\n';

    report += `📊 Overall Score: ${result.score.toFixed(1)}%\n`;
    report += `Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    // Device-specific scores
    report += '📱 DEVICE SCORES:\n';
    report += `Mobile: ${result.deviceMetrics.mobile.toFixed(1)}%\n`;
    report += `Tablet: ${result.deviceMetrics.tablet.toFixed(1)}%\n`;
    report += `Desktop: ${result.deviceMetrics.desktop.toFixed(1)}%\n\n`;

    // Issues by severity
    ['critical', 'major', 'minor'].forEach(severity => {
      const severityIssues = result.issues.filter(issue => issue.severity === severity);
      if (severityIssues.length > 0) {
        report += `\n${severity.toUpperCase()} ISSUES (${severityIssues.length}):\n`;
        severityIssues.forEach(issue => {
          report += `  • ${issue.description}`;
          if (issue.deviceSpecific) {
            report += ` [${issue.deviceSpecific}]`;
          }
          report += `\n    💡 ${issue.suggestion}\n`;
        });
      }
    });

    // Recommendations
    if (result.recommendations.length > 0) {
      report += '\n🎯 RECOMMENDATIONS:\n';
      result.recommendations.forEach((rec, i) => {
        report += `${i + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}