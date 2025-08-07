/**
 * Enhanced formatting tester that catches CSS conflicts and layout issues
 */

interface FormattingTestResult {
  name: string;
  passed: boolean;
  score: number;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    element?: string;
    fix?: string;
  }>;
  metrics: {
    cssConflicts: number;
    textFlowConsistency: number;
    responsiveBreakpoints: number;
    fontScaling: number;
    containerSizing: number;
  };
}

export class EnhancedFormattingTester {
  static async runFormattingTests(): Promise<FormattingTestResult> {
    const issues: FormattingTestResult['issues'] = [];
    let score = 100;

    // Test 1: CSS Conflict Detection
    const cssConflicts = this.detectCSSConflicts();
    issues.push(...cssConflicts);

    // Test 2: Text Flow Consistency
    const textFlowIssues = this.testTextFlowConsistency();
    issues.push(...textFlowIssues);

    // Test 3: Responsive Container Sizing
    const containerIssues = this.testContainerSizing();
    issues.push(...containerIssues);

    // Test 4: Font Scaling Validation
    const fontIssues = this.testFontScaling();
    issues.push(...fontIssues);

    // Test 5: Interactive Word Flow
    const wordFlowIssues = this.testInteractiveWordFlow();
    issues.push(...wordFlowIssues);

    // Calculate score based on issues
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    score -= (criticalIssues * 30) + (highIssues * 15) + (mediumIssues * 5);
    score = Math.max(0, score);

    return {
      name: 'Enhanced Formatting Test',
      passed: score >= 80,
      score,
      issues,
      metrics: {
        cssConflicts: cssConflicts.length,
        textFlowConsistency: textFlowIssues.length,
        responsiveBreakpoints: containerIssues.length,
        fontScaling: fontIssues.length,
        containerSizing: this.getContainerSizingScore()
      }
    };
  }

  private static detectCSSConflicts(): FormattingTestResult['issues'] {
    const issues: FormattingTestResult['issues'] = [];
    
    // Check for !important conflicts in story content
    const storyElements = document.querySelectorAll('.story-content');
    storyElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      
      // Check for conflicting line-height declarations
      if (element.getAttribute('style')?.includes('lineHeight')) {
        issues.push({
          severity: 'high',
          message: 'Inline line-height style conflicts with CSS',
          element: `.story-content:nth-child(${index + 1})`,
          fix: 'Use CSS custom properties instead of inline styles'
        });
      }

      // Check for font-size conflicts
      if (element.getAttribute('style')?.includes('fontSize')) {
        issues.push({
          severity: 'high',
          message: 'Inline font-size style conflicts with responsive CSS',
          element: `.story-content:nth-child(${index + 1})`,
          fix: 'Use data-difficulty attributes with CSS clamp() functions'
        });
      }
    });

    return issues;
  }

  private static testTextFlowConsistency(): FormattingTestResult['issues'] {
    const issues: FormattingTestResult['issues'] = [];
    
    const interactiveWords = document.querySelectorAll('.story-content span, .story-content .interactive-word');
    interactiveWords.forEach((word, index) => {
      const computedStyle = window.getComputedStyle(word);
      
      if (computedStyle.display !== 'inline') {
        issues.push({
          severity: 'critical',
          message: 'Interactive word breaks text flow',
          element: `Interactive word ${index + 1}`,
          fix: 'Ensure display: inline for all interactive words'
        });
      }

      if (computedStyle.whiteSpace !== 'normal') {
        issues.push({
          severity: 'medium',
          message: 'White space handling may break word flow',
          element: `Interactive word ${index + 1}`,
          fix: 'Set white-space: normal for natural text flow'
        });
      }
    });

    return issues;
  }

  private static testContainerSizing(): FormattingTestResult['issues'] {
    const issues: FormattingTestResult['issues'] = [];
    
    const containers = document.querySelectorAll('.story-container, .story-content');
    containers.forEach((container, index) => {
      const computedStyle = window.getComputedStyle(container);
      const rect = container.getBoundingClientRect();
      
      // Check for horizontal overflow
      if (rect.width > window.innerWidth) {
        issues.push({
          severity: 'critical',
          message: 'Container exceeds viewport width',
          element: container.className,
          fix: 'Use clamp() or max-width with viewport units'
        });
      }

      // Check for conflicting max-width rules
      if (computedStyle.maxWidth && computedStyle.width) {
        const maxWidth = parseFloat(computedStyle.maxWidth);
        const width = parseFloat(computedStyle.width);
        if (width > maxWidth) {
          issues.push({
            severity: 'high',
            message: 'Width exceeds max-width constraint',
            element: container.className,
            fix: 'Review CSS specificity and conflicting rules'
          });
        }
      }
    });

    return issues;
  }

  private static testFontScaling(): FormattingTestResult['issues'] {
    const issues: FormattingTestResult['issues'] = [];
    
    const storyContent = document.querySelectorAll('.story-content');
    storyContent.forEach((content, index) => {
      const computedStyle = window.getComputedStyle(content);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Check minimum font size for readability
      if (fontSize < 14) {
        issues.push({
          severity: 'high',
          message: 'Font size too small for mobile readability',
          element: `.story-content:nth-child(${index + 1})`,
          fix: 'Use clamp() with minimum 14px font size'
        });
      }

      // Check maximum font size for screen constraints
      if (fontSize > 48) {
        issues.push({
          severity: 'medium',
          message: 'Font size may be too large for some screens',
          element: `.story-content:nth-child(${index + 1})`,
          fix: 'Use clamp() with maximum constraint'
        });
      }
    });

    return issues;
  }

  private static testInteractiveWordFlow(): FormattingTestResult['issues'] {
    const issues: FormattingTestResult['issues'] = [];
    
    // Test that highlighted words don't break text flow
    const highlightedWords = document.querySelectorAll('.bg-yellow-200\\/80, .dark\\:bg-yellow-800\\/60');
    highlightedWords.forEach((word, index) => {
      const computedStyle = window.getComputedStyle(word);
      
      if (computedStyle.position === 'absolute' || computedStyle.position === 'fixed') {
        issues.push({
          severity: 'critical',
          message: 'Highlighted word is positioned outside text flow',
          element: `Highlighted word ${index + 1}`,
          fix: 'Use relative positioning or inline highlighting'
        });
      }
    });

    return issues;
  }

  private static getContainerSizingScore(): number {
    const containers = document.querySelectorAll('.story-container');
    let score = 100;
    
    containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      if (rect.width > window.innerWidth) score -= 20;
      if (rect.height < 100) score -= 10;
    });
    
    return Math.max(0, score);
  }

  static generateFormattingReport(result: FormattingTestResult): string {
    let report = `\n📋 Enhanced Formatting Test Results\n`;
    report += `Score: ${result.score}/100 ${result.passed ? '✅' : '❌'}\n\n`;

    if (result.issues.length > 0) {
      report += `🔍 Issues Found:\n`;
      result.issues.forEach((issue, index) => {
        const emoji = {
          critical: '🚨',
          high: '⚠️',
          medium: '💡',
          low: 'ℹ️'
        }[issue.severity];
        
        report += `${emoji} ${issue.severity.toUpperCase()}: ${issue.message}\n`;
        if (issue.element) report += `   Element: ${issue.element}\n`;
        if (issue.fix) report += `   Fix: ${issue.fix}\n`;
        report += '\n';
      });
    }

    report += `📊 Metrics:\n`;
    report += `- CSS Conflicts: ${result.metrics.cssConflicts}\n`;
    report += `- Text Flow Issues: ${result.metrics.textFlowConsistency}\n`;
    report += `- Responsive Issues: ${result.metrics.responsiveBreakpoints}\n`;
    report += `- Font Scaling Issues: ${result.metrics.fontScaling}\n`;
    report += `- Container Sizing Score: ${result.metrics.containerSizing}/100\n`;

    return report;
  }
}