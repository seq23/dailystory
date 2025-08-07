// Detailed Visual Quality Testing Module
export interface VisualQualityMetrics {
  textReadability: number;
  layoutConsistency: number;
  colorContrast: number;
  spacingRegularity: number;
  responsiveBreakpoints: number;
  visualHierarchy: number;
}

export interface VisualQualityTestResult {
  testName: string;
  passed: boolean;
  score: number;
  metrics: VisualQualityMetrics;
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    description: string;
    element?: string;
    suggestion: string;
  }>;
  deviceSpecificIssues: {
    mobile: string[];
    tablet: string[];
    desktop: string[];
  };
}

export class DetailedVisualQualityTester {
  static async runVisualQualityTests(): Promise<VisualQualityTestResult> {
    console.log('🎨 Running Detailed Visual Quality Tests...');
    
    const issues: VisualQualityTestResult['issues'] = [];
    const deviceSpecificIssues = {
      mobile: [] as string[],
      tablet: [] as string[],
      desktop: [] as string[]
    };

    // Test text readability
    const textReadability = this.testTextReadability(issues, deviceSpecificIssues);
    
    // Test layout consistency
    const layoutConsistency = this.testLayoutConsistency(issues, deviceSpecificIssues);
    
    // Test color contrast
    const colorContrast = this.testColorContrast(issues, deviceSpecificIssues);
    
    // Test spacing regularity
    const spacingRegularity = this.testSpacingRegularity(issues, deviceSpecificIssues);
    
    // Test responsive breakpoints
    const responsiveBreakpoints = this.testResponsiveBreakpoints(issues, deviceSpecificIssues);
    
    // Test visual hierarchy
    const visualHierarchy = this.testVisualHierarchy(issues, deviceSpecificIssues);

    const metrics: VisualQualityMetrics = {
      textReadability,
      layoutConsistency,
      colorContrast,
      spacingRegularity,
      responsiveBreakpoints,
      visualHierarchy
    };

    const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.values(metrics).length;
    const passed = overallScore >= 75 && issues.filter(i => i.severity === 'critical').length === 0;

    return {
      testName: 'Detailed Visual Quality Analysis',
      passed,
      score: overallScore,
      metrics,
      issues,
      deviceSpecificIssues
    };
  }

  private static testTextReadability(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;
    const currentWidth = window.innerWidth;

    // Test font sizes across devices
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    
    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const fontSize = parseInt(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight) / fontSize;

      // Mobile-specific checks
      if (currentWidth < 768) {
        if (fontSize < 16) {
          issues.push({
            severity: 'major',
            description: `Text element ${index + 1} too small for mobile (${fontSize}px)`,
            element: element.tagName.toLowerCase(),
            suggestion: 'Increase font size to at least 16px for mobile readability'
          });
          deviceIssues.mobile.push(`Small text: ${fontSize}px`);
          score -= 5;
        }
      }

      // Line height checks
      if (lineHeight < 1.2) {
        issues.push({
          severity: 'minor',
          description: `Poor line height ratio: ${lineHeight.toFixed(2)}`,
          element: element.tagName.toLowerCase(),
          suggestion: 'Use line height of at least 1.4 for better readability'
        });
        score -= 2;
      }
    });

    // Test story content specifically
    const storyContent = document.querySelector('[data-testid="story-content"], .story-display, [class*="story"]');
    if (storyContent) {
      const style = window.getComputedStyle(storyContent);
      const textAlign = style.textAlign;
      
      if (textAlign === 'justify' && currentWidth < 768) {
        issues.push({
          severity: 'minor',
          description: 'Justified text on mobile can be hard to read',
          element: 'story-content',
          suggestion: 'Use left-aligned text on mobile devices'
        });
        deviceIssues.mobile.push('Justified text on small screen');
        score -= 3;
      }
    }

    return Math.max(0, score);
  }

  private static testLayoutConsistency(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;
    const currentWidth = window.innerWidth;

    // Test container widths across different content types
    const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], .story-display, [data-testid*="story"]');
    const widths = Array.from(containers).map(container => {
      const rect = container.getBoundingClientRect();
      return rect.width;
    });

    const uniqueWidths = [...new Set(widths)];
    if (uniqueWidths.length > 3) {
      issues.push({
        severity: 'major',
        description: `Too many different container widths: ${uniqueWidths.length}`,
        suggestion: 'Standardize container widths for visual consistency'
      });
      score -= 20;
    }

    // Test difficulty-level consistency (Issue #3)
    const difficultyContainers = document.querySelectorAll('[data-difficulty], [class*="difficulty"]');
    if (difficultyContainers.length > 1) {
      const difficultyWidths = Array.from(difficultyContainers).map(container => {
        const rect = container.getBoundingClientRect();
        return { 
          width: rect.width, 
          difficulty: container.getAttribute('data-difficulty') || container.className 
        };
      });

      // Group by difficulty type
      const beginnerLevels = difficultyWidths.filter(d => 
        d.difficulty.includes('beginner') || d.difficulty.includes('easy') || d.difficulty.includes('medium')
      );
      const expertLevels = difficultyWidths.filter(d => 
        d.difficulty.includes('hard') || d.difficulty.includes('expert')
      );

      if (beginnerLevels.length > 0 && expertLevels.length > 0) {
        const beginnerWidth = beginnerLevels[0]?.width;
        const expertWidth = expertLevels[0]?.width;
        
        if (Math.abs(beginnerWidth - expertWidth) > 50) {
          issues.push({
            severity: 'major',
            description: 'Inconsistent story display width between difficulty levels',
            suggestion: 'Use same container width for all difficulty levels'
          });
          
          if (currentWidth > 768) {
            deviceIssues.desktop.push('Inconsistent difficulty level layouts');
          }
          score -= 25;
        }
      }
    }

    return Math.max(0, score);
  }

  private static testColorContrast(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;

    // Test text color contrast
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button');
    
    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (would need more sophisticated implementation for real testing)
      if (color === backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
        issues.push({
          severity: 'critical',
          description: `Element ${index + 1} has same text and background color`,
          element: element.tagName.toLowerCase(),
          suggestion: 'Ensure sufficient color contrast for text readability'
        });
        score -= 15;
      }

      // Check for white text on white background or black on black
      if ((color.includes('255, 255, 255') && backgroundColor.includes('255, 255, 255')) ||
          (color.includes('0, 0, 0') && backgroundColor.includes('0, 0, 0'))) {
        issues.push({
          severity: 'critical',
          description: `Poor color contrast detected in element ${index + 1}`,
          element: element.tagName.toLowerCase(),
          suggestion: 'Use contrasting colors for text and background'
        });
        score -= 20;
      }
    });

    return Math.max(0, score);
  }

  private static testSpacingRegularity(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;
    const currentWidth = window.innerWidth;

    // Test margin and padding consistency
    const elements = document.querySelectorAll('div, section, article, p, h1, h2, h3');
    const margins: number[] = [];
    const paddings: number[] = [];

    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const marginTop = parseInt(style.marginTop) || 0;
      const paddingTop = parseInt(style.paddingTop) || 0;
      
      if (marginTop > 0) margins.push(marginTop);
      if (paddingTop > 0) paddings.push(paddingTop);
    });

    // Check for too many different spacing values
    const uniqueMargins = [...new Set(margins)];
    const uniquePaddings = [...new Set(paddings)];

    if (uniqueMargins.length > 8) {
      issues.push({
        severity: 'minor',
        description: `Too many different margin values: ${uniqueMargins.length}`,
        suggestion: 'Use a consistent spacing scale (8px, 16px, 24px, 32px, etc.)'
      });
      score -= 10;
    }

    if (uniquePaddings.length > 8) {
      issues.push({
        severity: 'minor',
        description: `Too many different padding values: ${uniquePaddings.length}`,
        suggestion: 'Use a consistent spacing scale for padding'
      });
      score -= 10;
    }

    // Mobile-specific spacing checks
    if (currentWidth < 768) {
      const smallSpacing = margins.filter(m => m < 8).length + paddings.filter(p => p < 8).length;
      if (smallSpacing > margins.length * 0.3) {
        issues.push({
          severity: 'minor',
          description: 'Too many small spacing values on mobile',
          suggestion: 'Use larger spacing values on mobile for better touch interaction'
        });
        deviceIssues.mobile.push('Insufficient spacing for touch');
        score -= 5;
      }
    }

    return Math.max(0, score);
  }

  private static testResponsiveBreakpoints(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;
    const currentWidth = window.innerWidth;

    // Test for responsive classes
    const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
    
    if (responsiveElements.length === 0) {
      issues.push({
        severity: 'major',
        description: 'No responsive design classes detected',
        suggestion: 'Implement responsive design with proper breakpoints'
      });
      score -= 30;
    }

    // Test breakpoint appropriateness
    if (currentWidth < 640) { // Mobile
      const hiddenElements = document.querySelectorAll('.hidden.sm\\:block, .sm\\:hidden');
      hiddenElements.forEach(element => {
        const style = window.getComputedStyle(element);
        if (style.display === 'none') {
          // This is expected behavior
        }
      });
    }

    // Test horizontal scrolling (bad on mobile)
    if (currentWidth < 768) {
      const body = document.body;
      if (body.scrollWidth > body.clientWidth) {
        issues.push({
          severity: 'major',
          description: 'Horizontal scrolling detected on mobile viewport',
          suggestion: 'Ensure content fits within viewport width'
        });
        deviceIssues.mobile.push('Horizontal scrolling required');
        score -= 25;
      }
    }

    return Math.max(0, score);
  }

  private static testVisualHierarchy(issues: VisualQualityTestResult['issues'], deviceIssues: VisualQualityTestResult['deviceSpecificIssues']): number {
    let score = 100;

    // Test heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.slice(1)));
    
    // Check for missing h1
    if (!headingLevels.includes(1)) {
      issues.push({
        severity: 'major',
        description: 'No H1 heading found on page',
        suggestion: 'Add a main H1 heading for better document structure'
      });
      score -= 20;
    }

    // Check for multiple h1s
    const h1Count = headingLevels.filter(level => level === 1).length;
    if (h1Count > 1) {
      issues.push({
        severity: 'minor',
        description: `Multiple H1 headings found: ${h1Count}`,
        suggestion: 'Use only one H1 per page for better SEO and accessibility'
      });
      score -= 5;
    }

    // Test font size hierarchy
    const headingElements = Array.from(headings);
    for (let i = 0; i < headingElements.length - 1; i++) {
      const currentHeading = headingElements[i];
      const nextHeading = headingElements[i + 1];
      
      const currentSize = parseInt(window.getComputedStyle(currentHeading).fontSize);
      const nextSize = parseInt(window.getComputedStyle(nextHeading).fontSize);
      const currentLevel = parseInt(currentHeading.tagName.slice(1));
      const nextLevel = parseInt(nextHeading.tagName.slice(1));
      
      if (currentLevel < nextLevel && currentSize <= nextSize) {
        issues.push({
          severity: 'minor',
          description: `Font size hierarchy issue: ${currentHeading.tagName} (${currentSize}px) should be larger than ${nextHeading.tagName} (${nextSize}px)`,
          suggestion: 'Ensure higher-level headings have larger font sizes'
        });
        score -= 3;
      }
    }

    return Math.max(0, score);
  }

  static generateDetailedReport(result: VisualQualityTestResult): string {
    let report = '\n🎨 DETAILED VISUAL QUALITY REPORT\n';
    report += '=' .repeat(60) + '\n\n';

    report += `📊 Overall Score: ${result.score.toFixed(1)}%\n`;
    report += `Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    // Metrics breakdown
    report += '📈 QUALITY METRICS:\n';
    Object.entries(result.metrics).forEach(([metric, score]) => {
      const emoji = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      report += `${emoji} ${metric.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${score.toFixed(1)}%\n`;
    });

    // Device-specific issues
    report += '\n📱 DEVICE-SPECIFIC ISSUES:\n';
    Object.entries(result.deviceSpecificIssues).forEach(([device, issues]) => {
      if (issues.length > 0) {
        report += `\n${device.toUpperCase()}:\n`;
        issues.forEach(issue => report += `  • ${issue}\n`);
      }
    });

    // All issues by severity
    report += '\n🚨 ISSUES BY SEVERITY:\n';
    ['critical', 'major', 'minor'].forEach(severity => {
      const severeIssues = result.issues.filter(issue => issue.severity === severity);
      if (severeIssues.length > 0) {
        report += `\n${severity.toUpperCase()} (${severeIssues.length}):\n`;
        severeIssues.forEach(issue => {
          report += `  • ${issue.description}\n`;
          report += `    💡 ${issue.suggestion}\n`;
        });
      }
    });

    return report;
  }
}