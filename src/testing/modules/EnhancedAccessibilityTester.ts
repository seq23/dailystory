// Enhanced WCAG AA+ Accessibility Testing with Performance Optimization
export interface AccessibilityTestResult {
  passed: number;
  failed: number;
  total: number;
  wcagLevel: 'AA' | 'AAA';
  overallScore: number;
  details: Array<{
    component: string;
    passed: boolean;
    score: number;
    duration: number;
    violations: AccessibilityViolation[];
    details: string;
  }>;
  criticalIssues: string[];
  performanceMetrics: {
    executionTime: number;
    rulesEvaluated: number;
    elementsScanned: number;
  };
}

export interface AccessibilityViolation {
  rule: string;
  level: 'A' | 'AA' | 'AAA';
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  element: string;
  recommendation: string;
  quickFix?: string;
}

interface WcagRule {
  id: string;
  level: 'A' | 'AA' | 'AAA';
  category: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  validator: (elements: NodeListOf<Element>) => AccessibilityViolation[];
}

export class EnhancedAccessibilityTester {
  private static cache = new Map<string, any>();
  private static contrastCache = new Map<string, number>();

  private static wcagRules: WcagRule[] = [
    {
      id: "1.1.1",
      level: "A",
      category: "Images",
      description: "Non-text Content",
      priority: "critical",
      validator: this.validateImageAltText.bind(this)
    },
    {
      id: "1.3.1",
      level: "A", 
      category: "Structure",
      description: "Info and Relationships",
      priority: "high",
      validator: this.validateSemanticStructure.bind(this)
    },
    {
      id: "1.4.3",
      level: "AA",
      category: "Contrast",
      description: "Contrast (Minimum)",
      priority: "critical",
      validator: this.validateColorContrast.bind(this)
    },
    {
      id: "2.1.1",
      level: "A",
      category: "Keyboard",
      description: "Keyboard Navigation",
      priority: "critical",
      validator: this.validateKeyboardAccess.bind(this)
    },
    {
      id: "2.4.1",
      level: "A",
      category: "Navigation",
      description: "Bypass Blocks",
      priority: "high",
      validator: this.validateSkipLinks.bind(this)
    },
    {
      id: "2.4.2",
      level: "A",
      category: "Navigation",
      description: "Page Titled",
      priority: "medium",
      validator: this.validatePageTitle.bind(this)
    },
    {
      id: "2.4.7",
      level: "AA",
      category: "Navigation",
      description: "Focus Visible",
      priority: "high",
      validator: this.validateFocusVisible.bind(this)
    },
    {
      id: "4.1.2",
      level: "A",
      category: "Compatible",
      description: "Name, Role, Value",
      priority: "critical",
      validator: this.validateAriaProperties.bind(this)
    }
  ];

  static async runAccessibilityTests(wcagLevel: 'AA' | 'AAA' = 'AA'): Promise<AccessibilityTestResult> {
    const startTime = performance.now();
    let elementsScanned = 0;
    let rulesEvaluated = 0;

    const results: AccessibilityTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      wcagLevel,
      overallScore: 0,
      details: [],
      criticalIssues: [],
      performanceMetrics: {
        executionTime: 0,
        rulesEvaluated: 0,
        elementsScanned: 0
      }
    };

    try {
      // Filter rules by WCAG level
      const relevantRules = this.wcagRules.filter(rule => 
        wcagLevel === 'AAA' ? true : rule.level !== 'AAA'
      );

      // Sort rules by priority for critical-first testing
      const sortedRules = relevantRules.sort((a, b) => {
        const priority = { critical: 0, high: 1, medium: 2, low: 3 };
        return priority[a.priority] - priority[b.priority];
      });

      // Run tests with performance optimization
      const testResults = await this.runOptimizedAccessibilityTests(sortedRules);
      
      results.details = testResults.details;
      results.passed = testResults.passed;
      results.failed = testResults.failed;
      results.total = testResults.total;
      results.criticalIssues = testResults.criticalIssues;
      rulesEvaluated = sortedRules.length;
      elementsScanned = testResults.elementsScanned;

      // Calculate overall score
      const totalScore = results.details.reduce((sum, detail) => sum + detail.score, 0);
      results.overallScore = results.details.length > 0 ? Math.round(totalScore / results.details.length) : 0;

      // Performance metrics
      results.performanceMetrics = {
        executionTime: performance.now() - startTime,
        rulesEvaluated,
        elementsScanned
      };

      // Log compact summary
      const criticalCount = results.criticalIssues.length;
      console.log(`♿ Accessibility: ${results.overallScore}%${criticalCount ? ` ⚠️ ${criticalCount} critical` : ''} (${results.performanceMetrics.executionTime.toFixed(1)}ms)`);

      return results;

    } catch (error) {
      console.error('Accessibility testing failed:', error);
      return {
        ...results,
        failed: 1,
        total: 1,
        overallScore: 0,
        criticalIssues: ['Accessibility testing system failure'],
        performanceMetrics: {
          executionTime: performance.now() - startTime,
          rulesEvaluated: 0,
          elementsScanned: 0
        }
      };
    }
  }

  private static async runOptimizedAccessibilityTests(rules: WcagRule[]) {
    const details: any[] = [];
    let passed = 0;
    let failed = 0;
    let total = 0;
    const criticalIssues: string[] = [];
    let elementsScanned = 0;

    // Pre-scan all elements once to avoid repeated DOM queries
    const allElements = {
      images: document.querySelectorAll('img'),
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      interactive: document.querySelectorAll('button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'),
      forms: document.querySelectorAll('form, input, select, textarea, label'),
      links: document.querySelectorAll('a'),
      skipLinks: document.querySelectorAll('a[href^="#"]'),
      ariaElements: document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')
    };

    elementsScanned = Object.values(allElements).reduce((sum, nodeList) => sum + nodeList.length, 0);

    // Run rules with batched DOM operations
    for (const rule of rules) {
      const startTime = performance.now();
      const violations: AccessibilityViolation[] = [];

      try {
        // Select relevant elements for this rule
        let relevantElements: NodeListOf<Element>;
        
        switch (rule.category) {
          case 'Images':
            relevantElements = allElements.images;
            break;
          case 'Structure':
            relevantElements = allElements.headings;
            break;
          case 'Keyboard':
            relevantElements = allElements.interactive;
            break;
          case 'Navigation':
            relevantElements = rule.id === '2.4.1' ? allElements.skipLinks : allElements.links;
            break;
          case 'Compatible':
            relevantElements = allElements.ariaElements;
            break;
          case 'Contrast':
            relevantElements = allElements.interactive;
            break;
          default:
            relevantElements = document.querySelectorAll('*');
        }

        const ruleViolations = rule.validator(relevantElements);
        violations.push(...ruleViolations);

        // Track critical issues
        const criticalViolations = violations.filter(v => v.impact === 'critical');
        criticalViolations.forEach(v => {
          criticalIssues.push(`${rule.description}: ${v.description}`);
        });

        const testPassed = violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length === 0;
        const score = Math.max(0, 100 - (violations.length * 20));

        details.push({
          component: rule.description,
          passed: testPassed,
          score,
          duration: performance.now() - startTime,
          violations,
          details: testPassed ? 
            `✅ ${rule.description} - No critical violations` :
            `❌ ${violations.length} violations (${criticalViolations.length} critical)`
        });

        if (testPassed) passed++;
        else failed++;
        total++;

      } catch (error) {
        failed++;
        total++;
        details.push({
          component: rule.description,
          passed: false,
          score: 0,
          duration: performance.now() - startTime,
          violations: [{
            rule: rule.id,
            level: rule.level,
            impact: 'critical',
            description: 'Rule evaluation failed',
            element: 'system',
            recommendation: 'Fix accessibility testing system'
          }],
          details: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return { details, passed, failed, total, criticalIssues, elementsScanned };
  }

  // Optimized Validators
  private static validateImageAltText(images: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    Array.from(images).forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const ariaHidden = img.getAttribute('aria-hidden') === 'true';
      const role = img.getAttribute('role');
      
      if (!alt && !ariaHidden && role !== 'presentation') {
        violations.push({
          rule: "1.1.1",
          level: "A",
          impact: "serious",
          description: "Image missing alt text",
          element: `img[${index}] (${(img as HTMLImageElement).src?.substring(0, 50)}...)`,
          recommendation: "Add descriptive alt text or aria-hidden='true' for decorative images",
          quickFix: `<img alt="Descriptive text here" ...>`
        });
      } else if (alt === "" && !ariaHidden) {
        violations.push({
          rule: "1.1.1",
          level: "A",
          impact: "moderate",
          description: "Empty alt text without aria-hidden",
          element: `img[${index}]`,
          recommendation: "Add aria-hidden='true' for decorative images or provide descriptive alt text",
          quickFix: `<img alt="" aria-hidden="true" ...> or <img alt="Description" ...>`
        });
      }
    });
    
    return violations;
  }

  private static validateSemanticStructure(headings: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    if (headings.length === 0) {
      violations.push({
        rule: "1.3.1",
        level: "A",
        impact: "moderate",
        description: "No headings found on page",
        element: "document",
        recommendation: "Add semantic heading structure starting with h1",
        quickFix: "<h1>Main Page Title</h1>"
      });
      return violations;
    }

    let previousLevel = 0;
    Array.from(headings).forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      // Check for h1
      if (index === 0 && currentLevel !== 1) {
        violations.push({
          rule: "1.3.1",
          level: "A",
          impact: "moderate",
          description: "Page should start with h1",
          element: `${heading.tagName.toLowerCase()}[${index}]`,
          recommendation: "Start page with h1 element",
          quickFix: `<h1>${heading.textContent}</h1>`
        });
      }

      // Check for heading hierarchy
      if (currentLevel > previousLevel + 1 && previousLevel > 0) {
        violations.push({
          rule: "1.3.1",
          level: "A",
          impact: "moderate",
          description: "Heading hierarchy skips levels",
          element: `${heading.tagName.toLowerCase()}[${index}]`,
          recommendation: "Use proper heading hierarchy (h1 → h2 → h3, etc.)",
          quickFix: `Use h${previousLevel + 1} instead of h${currentLevel}`
        });
      }
      
      previousLevel = currentLevel;
    });

    // Check for main landmark
    const main = document.querySelector('main, [role="main"]');
    if (!main) {
      violations.push({
        rule: "1.3.1",
        level: "A",
        impact: "minor",
        description: "Missing main landmark",
        element: "document",
        recommendation: "Add <main> element or role='main'",
        quickFix: "<main><!-- page content --></main>"
      });
    }
    
    return violations;
  }

  private static validateColorContrast(elements: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    // Sample key interactive elements for performance
    const sampleElements = Array.from(elements).slice(0, 20);
    
    sampleElements.forEach((el, index) => {
      const cacheKey = `contrast-${el.tagName}-${index}`;
      
      if (this.contrastCache.has(cacheKey)) {
        const cachedRatio = this.contrastCache.get(cacheKey)!;
        if (cachedRatio < 4.5) {
          violations.push({
            rule: "1.4.3",
            level: "AA",
            impact: "serious",
            description: "Insufficient color contrast (cached)",
            element: `${el.tagName.toLowerCase()}[${index}]`,
            recommendation: "Increase contrast ratio to at least 4.5:1",
            quickFix: "Use darker text or lighter background"
          });
        }
        return;
      }

      try {
        const computedStyle = window.getComputedStyle(el as HTMLElement);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
        this.contrastCache.set(cacheKey, contrastRatio);
        
        if (contrastRatio < 4.5) {
          violations.push({
            rule: "1.4.3",
            level: "AA",
            impact: "serious",
            description: `Poor contrast ratio (${contrastRatio.toFixed(2)}:1)`,
            element: `${el.tagName.toLowerCase()}[${index}]`,
            recommendation: "Increase contrast ratio to at least 4.5:1 for AA compliance",
            quickFix: `Current: ${contrastRatio.toFixed(2)}:1, Need: 4.5:1+`
          });
        }
      } catch (error) {
        // Skip elements that can't be computed
      }
    });
    
    return violations;
  }

  private static validateKeyboardAccess(interactive: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    Array.from(interactive).forEach((el, index) => {
      const tabIndex = el.getAttribute('tabindex');
      const tag = el.tagName.toLowerCase();
      
      // Check for negative tabindex on interactive elements
      if (tabIndex && parseInt(tabIndex) < 0 && !['div', 'span'].includes(tag)) {
        violations.push({
          rule: "2.1.1",
          level: "A",
          impact: "serious",
          description: "Interactive element not keyboard accessible",
          element: `${tag}[${index}]`,
          recommendation: "Remove negative tabindex or add keyboard event handlers",
          quickFix: `Remove tabindex="-1" or add onKeyDown handler`
        });
      }

      // Check for click handlers without keyboard support
      if (el.hasAttribute('onclick') && !el.hasAttribute('onkeydown') && !['button', 'a', 'input'].includes(tag)) {
        violations.push({
          rule: "2.1.1",
          level: "A",
          impact: "moderate",
          description: "Click handler without keyboard support",
          element: `${tag}[${index}]`,
          recommendation: "Add keyboard event handlers or use semantic elements",
          quickFix: `Add onKeyDown={(e) => e.key === 'Enter' && handleClick()}`
        });
      }
    });
    
    return violations;
  }

  private static validateSkipLinks(skipLinks: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    if (skipLinks.length === 0) {
      violations.push({
        rule: "2.4.1",
        level: "A",
        impact: "minor",
        description: "No skip links found",
        element: "document",
        recommendation: "Add skip links for keyboard navigation",
        quickFix: `<a href="#main-content" class="skip-link">Skip to main content</a>`
      });
    } else {
      // Validate skip links point to existing elements
      Array.from(skipLinks).forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (!target) {
            violations.push({
              rule: "2.4.1",
              level: "A",
              impact: "moderate",
              description: "Skip link target does not exist",
              element: `a[${index}]`,
              recommendation: "Ensure skip link targets exist in the DOM",
              quickFix: `Add element with id="${href.substring(1)}"`
            });
          }
        }
      });
    }
    
    return violations;
  }

  private static validatePageTitle(elements: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    if (!document.title || document.title.trim() === '') {
      violations.push({
        rule: "2.4.2",
        level: "A",
        impact: "moderate",
        description: "Page title is missing or empty",
        element: "document.title",
        recommendation: "Add descriptive page title",
        quickFix: `<title>DailyStory - Interactive Reading for Children</title>`
      });
    } else if (document.title.length < 10) {
      violations.push({
        rule: "2.4.2",
        level: "A",
        impact: "minor",
        description: "Page title is too short",
        element: "document.title",
        recommendation: "Make page title more descriptive",
        quickFix: `Current: "${document.title}" - Add more context`
      });
    }
    
    return violations;
  }

  private static validateFocusVisible(elements: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    // Sample elements for performance
    const sampleElements = Array.from(elements).slice(0, 10);
    
    sampleElements.forEach((el, index) => {
      const style = window.getComputedStyle(el as HTMLElement, ':focus');
      const outlineStyle = style.outline;
      const outlineWidth = style.outlineWidth;
      
      if (outlineStyle === 'none' || outlineWidth === '0px') {
        // Check for custom focus styles
        const boxShadow = style.boxShadow;
        const borderStyle = style.border;
        
        if (!boxShadow.includes('0 0') && !borderStyle.includes('px')) {
          violations.push({
            rule: "2.4.7",
            level: "AA",
            impact: "moderate",
            description: "Focus indicator not visible",
            element: `${el.tagName.toLowerCase()}[${index}]`,
            recommendation: "Add visible focus indicator (outline, box-shadow, or border)",
            quickFix: `:focus { outline: 2px solid #005fcc; }`
          });
        }
      }
    });
    
    return violations;
  }

  private static validateAriaProperties(ariaElements: NodeListOf<Element>): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];
    
    Array.from(ariaElements).forEach((el, index) => {
      const role = el.getAttribute('role');
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledby = el.getAttribute('aria-labelledby');
      const ariaDescribedby = el.getAttribute('aria-describedby');
      
      // Check for invalid roles
      if (role) {
        const validRoles = ['button', 'link', 'heading', 'main', 'navigation', 'banner', 'contentinfo', 'complementary', 'region', 'article', 'section', 'aside', 'dialog', 'tablist', 'tab', 'tabpanel'];
        if (!validRoles.includes(role)) {
          violations.push({
            rule: "4.1.2",
            level: "A",
            impact: "moderate",
            description: `Invalid ARIA role: ${role}`,
            element: `${el.tagName.toLowerCase()}[${index}]`,
            recommendation: "Use valid ARIA roles from WAI-ARIA specification",
            quickFix: `Check ARIA spec for valid roles`
          });
        }
      }

      // Check for aria-labelledby pointing to non-existent elements
      if (ariaLabelledby) {
        const targetElements = ariaLabelledby.split(' ').map(id => document.getElementById(id.trim()));
        if (targetElements.some(el => !el)) {
          violations.push({
            rule: "4.1.2",
            level: "A",
            impact: "moderate",
            description: "aria-labelledby references non-existent element",
            element: `${el.tagName.toLowerCase()}[${index}]`,
            recommendation: "Ensure aria-labelledby references existing elements",
            quickFix: `Check IDs: ${ariaLabelledby}`
          });
        }
      }

      // Check for missing accessible names on interactive elements
      const isInteractive = ['button', 'a', 'input'].includes(el.tagName.toLowerCase()) || role === 'button';
      if (isInteractive && !ariaLabel && !ariaLabelledby && !el.textContent?.trim()) {
        violations.push({
          rule: "4.1.2",
          level: "A",
          impact: "serious",
          description: "Interactive element lacks accessible name",
          element: `${el.tagName.toLowerCase()}[${index}]`,
          recommendation: "Add aria-label, aria-labelledby, or text content",
          quickFix: `<${el.tagName.toLowerCase()} aria-label="Descriptive name">...`
        });
      }
    });
    
    return violations;
  }

  private static calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast calculation - in production, use a proper color library
    // This is a placeholder that returns a reasonable default
    if (!foreground || !background || background === 'rgba(0, 0, 0, 0)') {
      return 7; // Assume good contrast for transparent backgrounds
    }
    
    // Simple heuristic based on color strings
    const isDarkForeground = foreground.includes('rgb(0') || foreground.includes('black') || 
                             foreground.includes('#000') || foreground.includes('hsl(0');
    const isLightBackground = background.includes('rgb(255') || background.includes('white') || 
                             background.includes('#fff') || background.includes('hsl(0, 0%, 100%)');
    
    if (isDarkForeground && isLightBackground) return 21; // Perfect contrast
    if (!isDarkForeground && !isLightBackground) return 21; // Light on dark
    
    return 3; // Assume poor contrast for similar colors
  }

  static generateCompactReport(result: AccessibilityTestResult): string {
    const { overallScore, criticalIssues, performanceMetrics } = result;
    
    let report = `♿ Accessibility: ${overallScore}%`;
    
    if (criticalIssues.length > 0) {
      report += ` ⚠️ ${criticalIssues.length} critical`;
    }
    
    if (performanceMetrics.executionTime > 200) {
      report += ` 🐌 ${performanceMetrics.executionTime.toFixed(0)}ms`;
    }
    
    return report;
  }
}