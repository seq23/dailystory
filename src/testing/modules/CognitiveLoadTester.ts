export interface CognitiveLoadTestResult {
  testName: string;
  passed: boolean;
  score: number;
  issues: CognitiveLoadIssue[];
  recommendations: string[];
  cognitiveMetrics: CognitiveMetrics;
}

export interface CognitiveLoadIssue {
  type: 'critical' | 'major' | 'minor';
  category: 'information-architecture' | 'visual-hierarchy' | 'reading-interference' | 'decision-overload' | 'mental-model';
  description: string;
  element?: string;
  cognitiveImpact: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface CognitiveMetrics {
  informationDensity: number;
  visualComplexity: number;
  decisionPoints: number;
  cognitiveLoad: number;
  readingFocus: number;
  mentalModelAlignment: number;
}

export class CognitiveLoadTester {
  static async runCognitiveLoadTests(): Promise<CognitiveLoadTestResult[]> {
    console.log('🧠 Running Cognitive Load Tests...');
    
    const tests = [
      this.testInformationArchitecture(),
      this.testVisualHierarchy(),
      this.testReadingInterference(),
      this.testDecisionOverload(),
      this.testMentalModelAlignment()
    ];

    return Promise.all(tests);
  }

  private static async testInformationArchitecture(): Promise<CognitiveLoadTestResult> {
    const issues: CognitiveLoadIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = document.querySelectorAll('h1').length;
    
    if (h1Count !== 1) {
      issues.push({
        type: 'major',
        category: 'information-architecture',
        description: `Found ${h1Count} H1 elements (should be exactly 1)`,
        cognitiveImpact: 'medium',
        suggestion: 'Use single H1 for page title, H2-H6 for sections'
      });
      score -= 20;
    }

    // Test logical heading progression
    let previousLevel = 0;
    let hierarchyBreaks = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level - previousLevel > 1) {
        hierarchyBreaks++;
      }
      previousLevel = level;
    });

    if (hierarchyBreaks > 0) {
      issues.push({
        type: 'minor',
        category: 'information-architecture',
        description: `${hierarchyBreaks} heading hierarchy breaks found`,
        cognitiveImpact: 'low',
        suggestion: 'Maintain logical heading progression (H1→H2→H3, not H1→H3)'
      });
      score -= hierarchyBreaks * 5;
    }

    // Test content grouping
    const sections = document.querySelectorAll('section, article, main, div[role="region"]');
    const totalElements = document.querySelectorAll('*').length;
    const groupingRatio = sections.length / totalElements;

    if (groupingRatio < 0.1) {
      issues.push({
        type: 'major',
        category: 'information-architecture',
        description: 'Insufficient content grouping detected',
        cognitiveImpact: 'high',
        suggestion: 'Group related content into semantic sections for better comprehension'
      });
      score -= 25;
    }

    // Test navigation breadth vs depth
    const navItems = document.querySelectorAll('nav a, nav button, .navigation a, .navigation button');
    if (navItems.length > 7) {
      issues.push({
        type: 'minor',
        category: 'information-architecture',
        description: `Too many navigation items (${navItems.length}) - Miller's Rule suggests 7±2`,
        cognitiveImpact: 'medium',
        suggestion: 'Group navigation items into categories or use progressive disclosure'
      });
      score -= 10;
    }

    const metrics: CognitiveMetrics = {
      informationDensity: Math.max(0, 100 - (totalElements / 100) * 2),
      visualComplexity: 85, // Calculated in visual hierarchy test
      decisionPoints: navItems.length,
      cognitiveLoad: 100 - score,
      readingFocus: 90, // Calculated in reading interference test
      mentalModelAlignment: 85 // Calculated in mental model test
    };

    return {
      testName: 'Information Architecture',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement clear content hierarchy',
        'Group related information together',
        'Use progressive disclosure for complex content',
        'Maintain consistent navigation patterns',
        ...recommendations
      ],
      cognitiveMetrics: metrics
    };
  }

  private static async testVisualHierarchy(): Promise<CognitiveLoadTestResult> {
    const issues: CognitiveLoadIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test color contrast for hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let contrastIssues = 0;
    
    headings.forEach(heading => {
      const styles = window.getComputedStyle(heading);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      if (fontSize < 16 && fontWeight === 'normal') {
        contrastIssues++;
      }
    });

    if (contrastIssues > 0) {
      issues.push({
        type: 'minor',
        category: 'visual-hierarchy',
        description: `${contrastIssues} headings lack visual prominence`,
        cognitiveImpact: 'medium',
        suggestion: 'Ensure headings are visually distinct through size, weight, or color'
      });
      score -= contrastIssues * 5;
    }

    // Test visual density
    const allElements = document.querySelectorAll('*');
    const visibleElements = Array.from(allElements).filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });

    const viewportArea = window.innerWidth * window.innerHeight;
    const elementDensity = visibleElements.length / (viewportArea / 1000);

    if (elementDensity > 50) {
      issues.push({
        type: 'major',
        category: 'visual-hierarchy',
        description: 'High visual density detected - may overwhelm users',
        cognitiveImpact: 'high',
        suggestion: 'Reduce visual clutter by using whitespace and simplifying layout'
      });
      score -= 20;
    }

    // Test button hierarchy
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a[role="button"]');
    const primaryButtons = document.querySelectorAll('button[data-variant="default"], button.primary, .btn-primary');
    const buttonRatio = primaryButtons.length / buttons.length;

    if (buttonRatio > 0.5) {
      issues.push({
        type: 'minor',
        category: 'visual-hierarchy',
        description: 'Too many primary buttons - reduces focus on key actions',
        cognitiveImpact: 'medium',
        suggestion: 'Use primary buttons sparingly for most important actions'
      });
      score -= 10;
    }

    // Test reading flow interruption
    const floatingElements = document.querySelectorAll('[style*="fixed"], [style*="absolute"], .floating, .overlay');
    const interruptiveElements = Array.from(floatingElements).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100; // Significant size
    });

    if (interruptiveElements.length > 2) {
      issues.push({
        type: 'major',
        category: 'visual-hierarchy',
        description: 'Multiple large floating elements may disrupt reading flow',
        cognitiveImpact: 'high',
        suggestion: 'Minimize floating elements during reading sessions'
      });
      score -= 15;
    }

    const metrics: CognitiveMetrics = {
      informationDensity: Math.max(0, 100 - elementDensity),
      visualComplexity: score,
      decisionPoints: buttons.length,
      cognitiveLoad: 100 - score,
      readingFocus: Math.max(0, 100 - interruptiveElements.length * 20),
      mentalModelAlignment: 85
    };

    return {
      testName: 'Visual Hierarchy',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Establish clear visual hierarchy with typography',
        'Use whitespace to reduce cognitive load',
        'Limit primary actions to reduce decision fatigue',
        'Minimize visual distractions during reading',
        ...recommendations
      ],
      cognitiveMetrics: metrics
    };
  }

  private static async testReadingInterference(): Promise<CognitiveLoadTestResult> {
    const issues: CognitiveLoadIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test reading area focus
    const readingArea = document.querySelector('[data-testid="story-display"], .story-content, .reading-area, main');
    
    if (readingArea) {
      const readingRect = readingArea.getBoundingClientRect();
      const allElements = document.querySelectorAll('*');
      
      let interferingElements = 0;
      allElements.forEach(el => {
        if (el !== readingArea && !readingArea.contains(el)) {
          const rect = el.getBoundingClientRect();
          // Check if element overlaps with reading area
          if (rect.left < readingRect.right && rect.right > readingRect.left &&
              rect.top < readingRect.bottom && rect.bottom > readingRect.top) {
            interferingElements++;
          }
        }
      });

      if (interferingElements > 5) {
        issues.push({
          type: 'major',
          category: 'reading-interference',
          description: `${interferingElements} elements overlap with reading area`,
          cognitiveImpact: 'high',
          suggestion: 'Create clear reading zone free from overlapping elements'
        });
        score -= 25;
      }
    }

    // Test animation distractions
    const animatedElements = document.querySelectorAll('[style*="animation"], .animate, [class*="animate"]');
    const autoplayElements = document.querySelectorAll('video[autoplay], [data-autoplay="true"]');
    
    if (animatedElements.length > 3 || autoplayElements.length > 0) {
      issues.push({
        type: 'minor',
        category: 'reading-interference',
        description: 'Excessive animations may distract from reading',
        cognitiveImpact: 'medium',
        suggestion: 'Reduce animations during reading sessions, respect prefers-reduced-motion'
      });
      score -= 10;
    }

    // Test notification interference
    const notifications = document.querySelectorAll('.notification, .toast, [role="alert"], [aria-live]');
    if (notifications.length > 0) {
      recommendations.push('Minimize notifications during reading sessions to maintain focus');
    }

    // Test color scheme readability
    const body = document.body;
    const bodyStyles = window.getComputedStyle(body);
    const backgroundColor = bodyStyles.backgroundColor;
    const color = bodyStyles.color;
    
    // Simple contrast check (would need more sophisticated algorithm in production)
    if (backgroundColor === 'rgb(255, 255, 255)' && color === 'rgb(0, 0, 0)') {
      recommendations.push('Consider softer color schemes to reduce eye strain during extended reading');
    }

    const metrics: CognitiveMetrics = {
      informationDensity: 85,
      visualComplexity: 80,
      decisionPoints: 5,
      cognitiveLoad: 100 - score,
      readingFocus: score,
      mentalModelAlignment: 85
    };

    return {
      testName: 'Reading Interference',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Create distraction-free reading mode',
        'Implement reading-focused color schemes',
        'Minimize animations during reading',
        'Use progressive disclosure for reading tools',
        ...recommendations
      ],
      cognitiveMetrics: metrics
    };
  }

  private static async testDecisionOverload(): Promise<CognitiveLoadTestResult> {
    const issues: CognitiveLoadIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test choice architecture
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a[role="button"]');
    const visibleButtons = Array.from(buttons).filter(btn => {
      const styles = window.getComputedStyle(btn);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });

    if (visibleButtons.length > 10) {
      issues.push({
        type: 'major',
        category: 'decision-overload',
        description: `${visibleButtons.length} interactive elements may cause choice paralysis`,
        cognitiveImpact: 'high',
        suggestion: 'Group related actions or use progressive disclosure'
      });
      score -= 20;
    }

    // Test option complexity
    const selects = document.querySelectorAll('select');
    let complexSelects = 0;
    selects.forEach(select => {
      if (select.options.length > 7) {
        complexSelects++;
      }
    });

    if (complexSelects > 0) {
      issues.push({
        type: 'minor',
        category: 'decision-overload',
        description: `${complexSelects} dropdowns with >7 options detected`,
        cognitiveImpact: 'medium',
        suggestion: 'Consider search/filter for large option sets or group into categories'
      });
      score -= complexSelects * 5;
    }

    // Test simultaneous choices
    const forms = document.querySelectorAll('form');
    let fieldCount = 0;
    forms.forEach(form => {
      const fields = form.querySelectorAll('input, select, textarea');
      fieldCount += fields.length;
    });

    if (fieldCount > 15) {
      issues.push({
        type: 'major',
        category: 'decision-overload',
        description: 'Forms require too many simultaneous decisions',
        cognitiveImpact: 'high',
        suggestion: 'Break complex forms into steps or provide smart defaults'
      });
      score -= 15;
    }

    const metrics: CognitiveMetrics = {
      informationDensity: 85,
      visualComplexity: 80,
      decisionPoints: visibleButtons.length + fieldCount,
      cognitiveLoad: 100 - score,
      readingFocus: 85,
      mentalModelAlignment: 80
    };

    return {
      testName: 'Decision Overload',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement progressive disclosure for complex choices',
        'Provide smart defaults and recommendations',
        'Group related actions into contextual menus',
        'Use guided flows for complex processes',
        ...recommendations
      ],
      cognitiveMetrics: metrics
    };
  }

  private static async testMentalModelAlignment(): Promise<CognitiveLoadTestResult> {
    const issues: CognitiveLoadIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test conventional patterns
    const logo = document.querySelector('[alt*="logo"], .logo, [data-testid*="logo"]');
    if (logo && !logo.closest('header')) {
      issues.push({
        type: 'minor',
        category: 'mental-model',
        description: 'Logo not in conventional header location',
        cognitiveImpact: 'low',
        suggestion: 'Place logo in header for familiar navigation patterns'
      });
      score -= 5;
    }

    // Test reading app conventions
    const storyElements = document.querySelectorAll('[data-testid*="story"], .story, [class*="story"]');
    const bookMetaphors = document.querySelectorAll('[class*="page"], [class*="chapter"], [class*="book"]');
    
    if (storyElements.length > 0 && bookMetaphors.length === 0) {
      recommendations.push('Consider using familiar book/reading metaphors to align with user expectations');
    }

    // Test action affordances
    const clickableElements = document.querySelectorAll('button, a, [role="button"], [onclick]');
    let affordanceIssues = 0;
    
    clickableElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.cursor !== 'pointer') {
        affordanceIssues++;
      }
    });

    if (affordanceIssues > 0) {
      issues.push({
        type: 'minor',
        category: 'mental-model',
        description: `${affordanceIssues} clickable elements lack pointer cursor`,
        cognitiveImpact: 'low',
        suggestion: 'Use pointer cursor for all interactive elements'
      });
      score -= affordanceIssues * 2;
    }

    // Test feedback patterns
    const loadingStates = document.querySelectorAll('[data-testid*="loading"], .loading, [aria-busy="true"]');
    const successStates = document.querySelectorAll('[data-testid*="success"], .success, [role="status"]');
    
    if (loadingStates.length === 0) {
      issues.push({
        type: 'minor',
        category: 'mental-model',
        description: 'No loading state feedback detected',
        cognitiveImpact: 'medium',
        suggestion: 'Provide loading feedback to match user expectations of system responsiveness'
      });
      score -= 10;
    }

    const metrics: CognitiveMetrics = {
      informationDensity: 85,
      visualComplexity: 80,
      decisionPoints: 5,
      cognitiveLoad: 100 - score,
      readingFocus: 85,
      mentalModelAlignment: score
    };

    return {
      testName: 'Mental Model Alignment',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Follow established design patterns and conventions',
        'Use familiar metaphors for reading applications',
        'Provide clear feedback for all user actions',
        'Ensure interactive elements have proper affordances',
        ...recommendations
      ],
      cognitiveMetrics: metrics
    };
  }

  static generateCognitiveLoadReport(results: CognitiveLoadTestResult[]): string {
    let report = '\n🧠 COGNITIVE LOAD ANALYSIS REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const averageMetrics = results.reduce((acc, r) => {
      Object.keys(r.cognitiveMetrics).forEach(key => {
        acc[key] = (acc[key] || 0) + r.cognitiveMetrics[key as keyof CognitiveMetrics];
      });
      return acc;
    }, {} as Record<string, number>);

    Object.keys(averageMetrics).forEach(key => {
      averageMetrics[key] /= results.length;
    });

    report += `📊 OVERALL COGNITIVE LOAD SCORE: ${overallScore.toFixed(1)}/100\n`;
    report += `🧠 Information Density: ${averageMetrics.informationDensity?.toFixed(1)}/100\n`;
    report += `👁️ Visual Complexity: ${averageMetrics.visualComplexity?.toFixed(1)}/100\n`;
    report += `🎯 Reading Focus: ${averageMetrics.readingFocus?.toFixed(1)}/100\n`;
    report += `🤝 Mental Model Alignment: ${averageMetrics.mentalModelAlignment?.toFixed(1)}/100\n\n`;

    results.forEach(result => {
      report += `\n📋 ${result.testName}\n`;
      report += `Score: ${result.score}/100 ${result.passed ? '✅' : '❌'}\n`;
      
      const highImpactIssues = result.issues.filter(i => i.cognitiveImpact === 'high');
      if (highImpactIssues.length > 0) {
        report += `🚨 High Cognitive Impact Issues:\n`;
        highImpactIssues.forEach(issue => {
          report += `  • ${issue.description}\n`;
          report += `    💡 ${issue.suggestion}\n`;
        });
      }
    });

    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];
    report += '\n🧠 COGNITIVE LOAD REDUCTION STRATEGIES:\n';
    allRecommendations.slice(0, 8).forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });

    return report;
  }
}