export interface UserJourneyTestResult {
  testName: string;
  passed: boolean;
  score: number;
  issues: UserJourneyIssue[];
  recommendations: string[];
  metrics: JourneyMetrics;
}

export interface UserJourneyIssue {
  type: 'critical' | 'major' | 'minor';
  category: 'navigation' | 'flow' | 'error-recovery' | 'onboarding' | 'completion';
  description: string;
  element?: string;
  impact: string;
  suggestion: string;
}

export interface JourneyMetrics {
  navigationClarity: number;
  flowEfficiency: number;
  errorRecovery: number;
  onboardingSuccess: number;
  taskCompletion: number;
  averageTime: number;
  dropOffPoints: string[];
}

export class UserJourneyTester {
  static async runUserJourneyTests(): Promise<UserJourneyTestResult[]> {
    console.log('🎯 Running User Journey Tests...');
    
    const tests = [
      this.testReadingFlow(),
      this.testNavigationPatterns(),
      this.testErrorRecovery(),
      this.testOnboardingExperience(),
      this.testTaskCompletion(),
      this.testStoryContentValidation() // Issue #2
    ];

    return Promise.all(tests);
  }

  private static async testReadingFlow(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test story selection flow
    const storyCards = document.querySelectorAll('[data-testid*="story"], .story-card, [class*="story"]');
    if (storyCards.length === 0) {
      issues.push({
        type: 'critical',
        category: 'flow',
        description: 'No story selection elements found',
        impact: 'Users cannot start reading journey',
        suggestion: 'Add clear story selection interface with preview capabilities'
      });
      score -= 30;
    }

    // Test reading interface
    const readingInterface = document.querySelector('[data-testid="story-display"], .story-content, [class*="reading"]');
    if (!readingInterface) {
      issues.push({
        type: 'major',
        category: 'flow',
        description: 'Reading interface not clearly identified',
        impact: 'Unclear reading experience boundaries',
        suggestion: 'Create distinct reading mode with clear content boundaries'
      });
      score -= 20;
    }

    // Test progress indicators
    const progressElements = document.querySelectorAll('[data-testid*="progress"], .progress, [class*="progress"]');
    if (progressElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'flow',
        description: 'No reading progress indicators found',
        impact: 'Users lack sense of progress and achievement',
        suggestion: 'Add visual progress indicators showing reading advancement'
      });
      score -= 10;
    }

    // Test reading controls
    const controls = document.querySelectorAll('button[data-testid*="audio"], button[class*="audio"], .audio-controls button');
    if (controls.length > 0) {
      recommendations.push('Audio controls detected - ensure they enhance rather than distract from reading flow');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: Math.max(0, 100 - issues.filter(i => i.category === 'navigation').length * 15),
      flowEfficiency: score,
      errorRecovery: 85, // Simulated
      onboardingSuccess: 90, // Simulated
      taskCompletion: Math.max(0, 100 - issues.filter(i => i.category === 'completion').length * 20),
      averageTime: 180, // Simulated seconds
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Reading Flow Analysis',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement clear story-to-reading transition',
        'Add reading progress visualization',
        'Ensure seamless audio-text synchronization',
        ...recommendations
      ],
      metrics
    };
  }

  private static async testNavigationPatterns(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test main navigation
    const mainNav = document.querySelector('nav, [role="navigation"], .navigation, header nav');
    if (!mainNav) {
      issues.push({
        type: 'major',
        category: 'navigation',
        description: 'No main navigation structure found',
        impact: 'Users cannot easily navigate between sections',
        suggestion: 'Implement clear main navigation with consistent placement'
      });
      score -= 25;
    }

    // Test breadcrumbs or back navigation
    const backElements = document.querySelectorAll('button[aria-label*="back"], button[data-testid*="back"], .breadcrumb');
    if (backElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'navigation',
        description: 'No clear back navigation pattern',
        impact: 'Users may feel trapped in deep navigation',
        suggestion: 'Add consistent back navigation throughout the app'
      });
      score -= 10;
    }

    // Test mobile navigation
    const mobileElements = document.querySelectorAll('[data-testid*="mobile"], .mobile-nav, button[aria-label*="menu"]');
    if (mobileElements.length > 0) {
      recommendations.push('Mobile navigation detected - ensure it follows thumb-friendly design patterns');
    }

    // Test search functionality
    const searchElements = document.querySelectorAll('input[type="search"], [data-testid*="search"], .search');
    if (searchElements.length > 0) {
      recommendations.push('Search functionality detected - implement predictive search and filters');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: score,
      flowEfficiency: 85, // Simulated
      errorRecovery: 80, // Simulated
      onboardingSuccess: 85, // Simulated
      taskCompletion: 90, // Simulated
      averageTime: 45, // Simulated seconds
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Navigation Patterns',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement consistent navigation hierarchy',
        'Add clear visual navigation states',
        'Ensure mobile-first navigation design',
        ...recommendations
      ],
      metrics
    };
  }

  private static async testErrorRecovery(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test error boundaries
    const errorElements = document.querySelectorAll('[data-testid*="error"], .error, [class*="error"]');
    if (errorElements.length === 0) {
      issues.push({
        type: 'major',
        category: 'error-recovery',
        description: 'No error handling UI detected',
        impact: 'Users left without guidance when errors occur',
        suggestion: 'Implement user-friendly error messages with recovery actions'
      });
      score -= 20;
    }

    // Test loading states
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, [class*="loading"], [class*="skeleton"]');
    if (loadingElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'error-recovery',
        description: 'No loading state indicators found',
        impact: 'Users uncertain about system status during waits',
        suggestion: 'Add loading indicators for all async operations'
      });
      score -= 10;
    }

    // Test retry mechanisms
    const retryElements = document.querySelectorAll('button[data-testid*="retry"], button[aria-label*="retry"], button[class*="retry"]');
    if (retryElements.length === 0) {
      recommendations.push('Consider adding retry buttons for failed operations');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: 90, // Simulated
      flowEfficiency: 85, // Simulated
      errorRecovery: score,
      onboardingSuccess: 80, // Simulated
      taskCompletion: 85, // Simulated
      averageTime: 30, // Simulated seconds
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Error Recovery',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement graceful error boundaries',
        'Add contextual help for error resolution',
        'Provide clear recovery paths for all errors',
        ...recommendations
      ],
      metrics
    };
  }

  private static async testOnboardingExperience(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test welcome/intro elements
    const welcomeElements = document.querySelectorAll('[data-testid*="welcome"], .welcome, [class*="hero"], .onboarding');
    if (welcomeElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'onboarding',
        description: 'No clear welcome or onboarding interface',
        impact: 'New users lack guidance and orientation',
        suggestion: 'Create engaging onboarding flow explaining key features'
      });
      score -= 15;
    }

    // Test user setup flow
    const setupElements = document.querySelectorAll('form[data-testid*="setup"], .user-form, [class*="profile"]');
    if (setupElements.length > 0) {
      recommendations.push('User setup detected - ensure minimal friction with optional advanced settings');
    }

    // Test feature introduction
    const tooltipElements = document.querySelectorAll('[data-testid*="tooltip"], .tooltip, [aria-describedby]');
    if (tooltipElements.length === 0) {
      recommendations.push('Consider adding contextual tooltips for feature discovery');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: 85, // Simulated
      flowEfficiency: 90, // Simulated
      errorRecovery: 85, // Simulated
      onboardingSuccess: score,
      taskCompletion: 90, // Simulated
      averageTime: 120, // Simulated seconds
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Onboarding Experience',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Create progressive disclosure for features',
        'Implement contextual onboarding hints',
        'Add achievement system for first-time completion',
        ...recommendations
      ],
      metrics
    };
  }

  private static async testTaskCompletion(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test call-to-action buttons
    const ctaElements = document.querySelectorAll('button[data-testid*="start"], button[class*="primary"], .cta-button');
    if (ctaElements.length === 0) {
      issues.push({
        type: 'major',
        category: 'completion',
        description: 'No clear call-to-action buttons found',
        impact: 'Users uncertain about primary actions',
        suggestion: 'Add prominent, clearly labeled action buttons'
      });
      score -= 25;
    }

    // Test completion feedback
    const feedbackElements = document.querySelectorAll('[data-testid*="success"], .success, [class*="complete"], .achievement');
    if (feedbackElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'completion',
        description: 'No completion feedback mechanisms found',
        impact: 'Users lack sense of accomplishment',
        suggestion: 'Add celebration and feedback for completed tasks'
      });
      score -= 10;
    }

    // Test next steps guidance
    const nextStepElements = document.querySelectorAll('[data-testid*="next"], .next-steps, [class*="continue"]');
    if (nextStepElements.length === 0) {
      recommendations.push('Consider adding "what\'s next" guidance after task completion');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: 90, // Simulated
      flowEfficiency: 85, // Simulated
      errorRecovery: 85, // Simulated
      onboardingSuccess: 90, // Simulated
      taskCompletion: score,
      averageTime: 90, // Simulated seconds
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Task Completion',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement clear task completion flows',
        'Add progress celebration and achievements',
        'Provide clear next action guidance',
        ...recommendations
      ],
      metrics
    };
  }

  static generateJourneyReport(results: UserJourneyTestResult[]): string {
    let report = '\n🎯 USER JOURNEY ANALYSIS REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const criticalIssues = results.flatMap(r => r.issues.filter(i => i.type === 'critical'));
    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];

    report += `📊 OVERALL JOURNEY SCORE: ${overallScore.toFixed(1)}/100\n`;
    report += `🚨 Critical Issues: ${criticalIssues.length}\n`;
    report += `📈 Total Recommendations: ${allRecommendations.length}\n\n`;

    results.forEach(result => {
      report += `\n📋 ${result.testName}\n`;
      report += `Score: ${result.score}/100 ${result.passed ? '✅' : '❌'}\n`;
      
      if (result.issues.length > 0) {
        report += `Issues:\n`;
        result.issues.forEach(issue => {
          const icon = issue.type === 'critical' ? '🚨' : issue.type === 'major' ? '⚠️' : 'ℹ️';
          report += `  ${icon} ${issue.description}\n`;
          report += `     💡 ${issue.suggestion}\n`;
        });
      }
    });

    report += '\n🎯 TOP RECOMMENDATIONS:\n';
    allRecommendations.slice(0, 10).forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });

    return report;
  }

  private static async testStoryContentValidation(): Promise<UserJourneyTestResult> {
    const issues: UserJourneyIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test for unprocessed template variables (Issue #2: {user name})
    const storyContent = document.querySelector('[data-testid="story-content"], .story-display, [class*="story-content"]');
    if (storyContent) {
      const content = storyContent.textContent || storyContent.innerHTML;
      
      // Check for unprocessed template variables
      const templateVariables = content.match(/\{[^}]+\}/g);
      if (templateVariables && templateVariables.length > 0) {
        issues.push({
          type: 'critical',
          category: 'flow',
          description: `Unprocessed template variables found: ${templateVariables.join(', ')}`,
          impact: 'Story personalization is broken, showing raw template variables',
          suggestion: 'Ensure all template variables are properly processed before story display'
        });
        score -= 40;
      }

      // Check for placeholder text
      const placeholders = ['[USER_NAME]', '[PLACEHOLDER]', 'PLACEHOLDER', '{name}', '{user_name}'];
      const hasPlaceholders = placeholders.some(placeholder => 
        content.toLowerCase().includes(placeholder.toLowerCase())
      );
      
      if (hasPlaceholders) {
        issues.push({
          type: 'major',
          category: 'flow',
          description: 'Placeholder text detected in story content',
          impact: 'Users see unfinished or broken story content',
          suggestion: 'Replace all placeholders with actual user data or default values'
        });
        score -= 25;
      }
    }

    // Test story content completeness
    const storyPages = document.querySelectorAll('[data-testid*="page"], .story-page, [class*="page"]');
    if (storyPages.length === 0) {
      recommendations.push('Consider adding page structure for better story navigation');
    }

    const metrics: JourneyMetrics = {
      navigationClarity: 85,
      flowEfficiency: score,
      errorRecovery: 90,
      onboardingSuccess: 85,
      taskCompletion: 90,
      averageTime: 60,
      dropOffPoints: issues.filter(i => i.type === 'critical').map(i => i.description)
    };

    return {
      testName: 'Story Content Validation',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement template variable validation before story display',
        'Add fallback values for missing user data',
        'Test story generation with various user profiles',
        ...recommendations
      ],
      metrics
    };
  }
}