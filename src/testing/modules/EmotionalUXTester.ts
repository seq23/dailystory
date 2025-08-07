export interface EmotionalUXTestResult {
  testName: string;
  passed: boolean;
  score: number;
  issues: EmotionalUXIssue[];
  recommendations: string[];
  emotionalMetrics: EmotionalMetrics;
}

export interface EmotionalUXIssue {
  type: 'critical' | 'major' | 'minor';
  category: 'enjoyment' | 'frustration' | 'achievement' | 'trust' | 'personalization';
  description: string;
  element?: string;
  emotionalImpact: 'positive' | 'negative' | 'neutral';
  suggestion: string;
}

export interface EmotionalMetrics {
  enjoymentFactors: number;
  frustrationPoints: number;
  achievementSatisfaction: number;
  trustIndicators: number;
  personalizationLevel: number;
  overallEmotionalScore: number;
}

export class EmotionalUXTester {
  static async runEmotionalUXTests(): Promise<EmotionalUXTestResult[]> {
    console.log('😊 Running Emotional UX Tests...');
    
    const tests = [
      this.testReadingEnjoyment(),
      this.testFrustrationPoints(),
      this.testAchievementSatisfaction(),
      this.testTrustAndSafety(),
      this.testPersonalizationImpact()
    ];

    return Promise.all(tests);
  }

  private static async testReadingEnjoyment(): Promise<EmotionalUXTestResult> {
    const issues: EmotionalUXIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test visual appeal
    const colorfulElements = document.querySelectorAll('[style*="gradient"], [class*="gradient"], [class*="color"]');
    const animations = document.querySelectorAll('[style*="animation"], [class*="animate"], [class*="transition"]');
    
    if (colorfulElements.length === 0 && animations.length === 0) {
      issues.push({
        type: 'minor',
        category: 'enjoyment',
        description: 'Interface lacks visual appeal and playfulness',
        emotionalImpact: 'negative',
        suggestion: 'Add subtle animations and engaging visual elements for children'
      });
      score -= 15;
    }

    // Test reading atmosphere
    const atmosphericElements = document.querySelectorAll('[class*="shadow"], [class*="glow"], [style*="box-shadow"]');
    if (atmosphericElements.length === 0) {
      recommendations.push('Consider adding atmospheric visual effects to enhance reading immersion');
    }

    // Test interactive elements for engagement
    const interactiveWords = document.querySelectorAll('[data-testid*="interactive"], .interactive-word, [class*="highlight"]');
    if (interactiveWords.length === 0) {
      issues.push({
        type: 'major',
        category: 'enjoyment',
        description: 'No interactive reading elements detected',
        emotionalImpact: 'negative',
        suggestion: 'Add word interactions, hover effects, or click-to-learn features'
      });
      score -= 20;
    }

    // Test audio integration
    const audioElements = document.querySelectorAll('audio, [data-testid*="audio"], [class*="audio"], [aria-label*="audio"]');
    if (audioElements.length > 0) {
      recommendations.push('Audio detected - ensure high-quality narration enhances emotional connection');
    } else {
      issues.push({
        type: 'minor',
        category: 'enjoyment',
        description: 'No audio elements found for enhanced engagement',
        emotionalImpact: 'neutral',
        suggestion: 'Consider adding audio narration or sound effects for immersion'
      });
      score -= 10;
    }

    // Test story presentation
    const storyImages = document.querySelectorAll('img[alt*="story"], img[data-testid*="story"], .story-image');
    if (storyImages.length === 0) {
      issues.push({
        type: 'minor',
        category: 'enjoyment',
        description: 'No visual storytelling elements detected',
        emotionalImpact: 'negative',
        suggestion: 'Add illustrations or visual elements to enhance story engagement'
      });
      score -= 10;
    }

    // Test celebration elements
    const celebrationElements = document.querySelectorAll('[data-testid*="celebration"], [class*="confetti"], [class*="sparkle"], .achievement');
    if (celebrationElements.length === 0) {
      recommendations.push('Add celebration animations for completed stories or achievements');
    }

    const metrics: EmotionalMetrics = {
      enjoymentFactors: score,
      frustrationPoints: 0,
      achievementSatisfaction: 85,
      trustIndicators: 90,
      personalizationLevel: 75,
      overallEmotionalScore: score
    };

    return {
      testName: 'Reading Enjoyment',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Create immersive reading atmosphere with visual effects',
        'Add interactive elements to maintain engagement',
        'Implement celebration feedback for achievements',
        'Use high-quality visual storytelling',
        ...recommendations
      ],
      emotionalMetrics: metrics
    };
  }

  private static async testFrustrationPoints(): Promise<EmotionalUXTestResult> {
    const issues: EmotionalUXIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test loading experiences
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, [class*="loading"]');
    const loadingMessages = Array.from(loadingElements).filter(el => el.textContent?.trim());
    
    if (loadingElements.length > 0 && loadingMessages.length === 0) {
      issues.push({
        type: 'minor',
        category: 'frustration',
        description: 'Loading states lack engaging messages',
        emotionalImpact: 'negative',
        suggestion: 'Add friendly loading messages like "Preparing your story..." to reduce frustration'
      });
      score -= 10;
    }

    // Test error handling
    const errorElements = document.querySelectorAll('[data-testid*="error"], .error, [role="alert"]');
    let unfriendlyErrors = 0;
    
    errorElements.forEach(error => {
      const text = error.textContent?.toLowerCase() || '';
      if (text.includes('error') || text.includes('failed') || text.includes('404')) {
        unfriendlyErrors++;
      }
    });

    if (unfriendlyErrors > 0) {
      issues.push({
        type: 'major',
        category: 'frustration',
        description: `${unfriendlyErrors} technical error messages detected`,
        emotionalImpact: 'negative',
        suggestion: 'Replace technical errors with child-friendly messages and helpful next steps'
      });
      score -= unfriendlyErrors * 15;
    }

    // Test navigation confusion
    const backButtons = document.querySelectorAll('[data-testid*="back"], [aria-label*="back"], button[onclick*="back"]');
    const breadcrumbs = document.querySelectorAll('.breadcrumb, [aria-label*="breadcrumb"]');
    
    if (backButtons.length === 0 && breadcrumbs.length === 0) {
      issues.push({
        type: 'major',
        category: 'frustration',
        description: 'No clear way to go back or understand current location',
        emotionalImpact: 'negative',
        suggestion: 'Add clear navigation aids to prevent users feeling lost'
      });
      score -= 20;
    }

    // Test overwhelming interfaces
    const buttonCount = document.querySelectorAll('button, a[role="button"]').length;
    const inputCount = document.querySelectorAll('input, select, textarea').length;
    
    if (buttonCount + inputCount > 20) {
      issues.push({
        type: 'minor',
        category: 'frustration',
        description: 'Interface may be overwhelming with too many interactive elements',
        emotionalImpact: 'negative',
        suggestion: 'Simplify interface by grouping actions or using progressive disclosure'
      });
      score -= 10;
    }

    // Test accessibility barriers
    const unlabledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]), select:not([aria-label]):not([aria-labelledby])');
    if (unlabledInputs.length > 0) {
      issues.push({
        type: 'major',
        category: 'frustration',
        description: `${unlabledInputs.length} form inputs lack proper labels`,
        emotionalImpact: 'negative',
        suggestion: 'Add clear labels to all form inputs for better accessibility and reduced confusion'
      });
      score -= unlabledInputs.length * 10;
    }

    const metrics: EmotionalMetrics = {
      enjoymentFactors: 85,
      frustrationPoints: 100 - score,
      achievementSatisfaction: 85,
      trustIndicators: 90,
      personalizationLevel: 75,
      overallEmotionalScore: score
    };

    return {
      testName: 'Frustration Point Detection',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Replace technical messages with user-friendly language',
        'Provide clear navigation and orientation cues',
        'Simplify complex interfaces for young users',
        'Ensure all interactive elements are clearly labeled',
        ...recommendations
      ],
      emotionalMetrics: metrics
    };
  }

  private static async testAchievementSatisfaction(): Promise<EmotionalUXTestResult> {
    const issues: EmotionalUXIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test progress indicators
    const progressElements = document.querySelectorAll('[data-testid*="progress"], .progress, [role="progressbar"]');
    if (progressElements.length === 0) {
      issues.push({
        type: 'major',
        category: 'achievement',
        description: 'No progress indicators found',
        emotionalImpact: 'negative',
        suggestion: 'Add visual progress indicators to show reading advancement and create sense of achievement'
      });
      score -= 25;
    }

    // Test achievement systems
    const achievementElements = document.querySelectorAll('[data-testid*="achievement"], .achievement, [class*="badge"], .reward');
    if (achievementElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'achievement',
        description: 'No achievement or reward system detected',
        emotionalImpact: 'neutral',
        suggestion: 'Implement badges, stars, or achievement system to motivate continued reading'
      });
      score -= 15;
    }

    // Test completion feedback
    const completionElements = document.querySelectorAll('[data-testid*="complete"], [data-testid*="success"], .complete, .success');
    if (completionElements.length === 0) {
      issues.push({
        type: 'major',
        category: 'achievement',
        description: 'No completion celebration detected',
        emotionalImpact: 'negative',
        suggestion: 'Add celebration animations or messages when users complete stories'
      });
      score -= 20;
    }

    // Test streak/consistency tracking
    const streakElements = document.querySelectorAll('[data-testid*="streak"], [class*="streak"], [class*="daily"]');
    if (streakElements.length === 0) {
      recommendations.push('Consider adding reading streak tracking to encourage daily engagement');
    }

    // Test personalized feedback
    const feedbackElements = document.querySelectorAll('[data-testid*="feedback"], .feedback, [class*="personalized"]');
    if (feedbackElements.length === 0) {
      recommendations.push('Add personalized feedback based on reading performance and preferences');
    }

    // Test social sharing
    const shareElements = document.querySelectorAll('[data-testid*="share"], button[aria-label*="share"], .share');
    if (shareElements.length === 0) {
      recommendations.push('Enable sharing achievements to increase sense of accomplishment');
    }

    const metrics: EmotionalMetrics = {
      enjoymentFactors: 85,
      frustrationPoints: 15,
      achievementSatisfaction: score,
      trustIndicators: 90,
      personalizationLevel: 75,
      overallEmotionalScore: score
    };

    return {
      testName: 'Achievement Satisfaction',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement comprehensive progress tracking',
        'Add achievement badges and rewards system',
        'Create celebration moments for completed stories',
        'Track and display reading streaks',
        ...recommendations
      ],
      emotionalMetrics: metrics
    };
  }

  private static async testTrustAndSafety(): Promise<EmotionalUXTestResult> {
    const issues: EmotionalUXIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test security indicators
    const httpsUsed = window.location.protocol === 'https:';
    if (!httpsUsed) {
      issues.push({
        type: 'critical',
        category: 'trust',
        description: 'Not using HTTPS - security concern for children\'s app',
        emotionalImpact: 'negative',
        suggestion: 'Implement HTTPS for all communications to ensure child safety'
      });
      score -= 30;
    }

    // Test parental controls
    const parentalElements = document.querySelectorAll('[data-testid*="parent"], [class*="parent"], [aria-label*="parent"]');
    if (parentalElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'trust',
        description: 'No visible parental control features',
        emotionalImpact: 'neutral',
        suggestion: 'Add clear parental oversight features to build family trust'
      });
      score -= 10;
    }

    // Test privacy indicators
    const privacyElements = document.querySelectorAll('[data-testid*="privacy"], a[href*="privacy"], .privacy');
    if (privacyElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'trust',
        description: 'No privacy policy links or indicators found',
        emotionalImpact: 'negative',
        suggestion: 'Add clear privacy policy access for parental confidence'
      });
      score -= 10;
    }

    // Test age-appropriate content indicators
    const ageElements = document.querySelectorAll('[data-testid*="age"], [class*="age"], [aria-label*="age"]');
    if (ageElements.length === 0) {
      recommendations.push('Add age-appropriateness indicators to build parental trust');
    }

    // Test data collection transparency
    const dataElements = document.querySelectorAll('[data-testid*="data"], [aria-label*="data"], [class*="tracking"]');
    const cookieElements = document.querySelectorAll('[data-testid*="cookie"], .cookie, [aria-label*="cookie"]');
    
    if (dataElements.length === 0 && cookieElements.length === 0) {
      recommendations.push('Consider adding transparent data usage information for parents');
    }

    // Test professional appearance
    const logoElements = document.querySelectorAll('[alt*="logo"], .logo, [data-testid*="logo"]');
    const footerElements = document.querySelectorAll('footer, [role="contentinfo"]');
    
    if (logoElements.length === 0 || footerElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'trust',
        description: 'Missing professional branding elements',
        emotionalImpact: 'negative',
        suggestion: 'Add clear branding and company information to build credibility'
      });
      score -= 5;
    }

    const metrics: EmotionalMetrics = {
      enjoymentFactors: 85,
      frustrationPoints: 15,
      achievementSatisfaction: 90,
      trustIndicators: score,
      personalizationLevel: 75,
      overallEmotionalScore: score
    };

    return {
      testName: 'Trust and Safety',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement robust security measures (HTTPS, safe data handling)',
        'Add transparent parental control features',
        'Display clear privacy and safety information',
        'Show age-appropriateness indicators',
        ...recommendations
      ],
      emotionalMetrics: metrics
    };
  }

  private static async testPersonalizationImpact(): Promise<EmotionalUXTestResult> {
    const issues: EmotionalUXIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test profile/avatar elements
    const avatarElements = document.querySelectorAll('[data-testid*="avatar"], .avatar, [class*="profile"], img[alt*="avatar"]');
    if (avatarElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'personalization',
        description: 'No avatar or profile personalization detected',
        emotionalImpact: 'neutral',
        suggestion: 'Add avatar selection to create personal connection with the app'
      });
      score -= 15;
    }

    // Test name personalization
    const nameElements = document.querySelectorAll('[data-testid*="name"], .user-name, [class*="greeting"]');
    if (nameElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'personalization',
        description: 'No name personalization in interface',
        emotionalImpact: 'neutral',
        suggestion: 'Use child\'s name in greetings and achievements for emotional connection'
      });
      score -= 10;
    }

    // Test reading level adaptation
    const levelElements = document.querySelectorAll('[data-testid*="level"], [class*="level"], [aria-label*="level"]');
    if (levelElements.length === 0) {
      issues.push({
        type: 'major',
        category: 'personalization',
        description: 'No reading level personalization visible',
        emotionalImpact: 'negative',
        suggestion: 'Implement adaptive reading levels based on child\'s ability'
      });
      score -= 20;
    }

    // Test interest-based content
    const categoryElements = document.querySelectorAll('[data-testid*="category"], .category, [class*="genre"], [class*="topic"]');
    if (categoryElements.length === 0) {
      recommendations.push('Add story categories or topics based on child interests');
    }

    // Test progress personalization
    const personalProgressElements = document.querySelectorAll('[data-testid*="my"], [class*="personal"], .dashboard');
    if (personalProgressElements.length === 0) {
      issues.push({
        type: 'minor',
        category: 'personalization',
        description: 'No personalized progress tracking visible',
        emotionalImpact: 'neutral',
        suggestion: 'Create "My Progress" section showing personal reading journey'
      });
      score -= 10;
    }

    // Test customization options
    const customizationElements = document.querySelectorAll('[data-testid*="settings"], [data-testid*="customize"], .settings, .preferences');
    if (customizationElements.length === 0) {
      recommendations.push('Add customization options for reading preferences (font size, colors, etc.)');
    }

    // Test story recommendations
    const recommendationElements = document.querySelectorAll('[data-testid*="recommend"], [class*="suggest"], .recommendations');
    if (recommendationElements.length === 0) {
      recommendations.push('Implement personalized story recommendations based on reading history');
    }

    const metrics: EmotionalMetrics = {
      enjoymentFactors: 85,
      frustrationPoints: 15,
      achievementSatisfaction: 90,
      trustIndicators: 95,
      personalizationLevel: score,
      overallEmotionalScore: score
    };

    return {
      testName: 'Personalization Impact',
      passed: score >= 70,
      score,
      issues,
      recommendations: [
        'Implement comprehensive user profiles with avatars',
        'Use child\'s name throughout the experience',
        'Adapt content to individual reading levels',
        'Create personalized dashboards and progress tracking',
        ...recommendations
      ],
      emotionalMetrics: metrics
    };
  }

  static generateEmotionalUXReport(results: EmotionalUXTestResult[]): string {
    let report = '\n😊 EMOTIONAL UX ANALYSIS REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const averageMetrics = results.reduce((acc, r) => {
      Object.keys(r.emotionalMetrics).forEach(key => {
        acc[key] = (acc[key] || 0) + r.emotionalMetrics[key as keyof EmotionalMetrics];
      });
      return acc;
    }, {} as Record<string, number>);

    Object.keys(averageMetrics).forEach(key => {
      averageMetrics[key] /= results.length;
    });

    report += `📊 OVERALL EMOTIONAL SCORE: ${overallScore.toFixed(1)}/100\n`;
    report += `😊 Enjoyment Factors: ${averageMetrics.enjoymentFactors?.toFixed(1)}/100\n`;
    report += `😤 Frustration Points: ${averageMetrics.frustrationPoints?.toFixed(1)}/100\n`;
    report += `🏆 Achievement Satisfaction: ${averageMetrics.achievementSatisfaction?.toFixed(1)}/100\n`;
    report += `🛡️ Trust Indicators: ${averageMetrics.trustIndicators?.toFixed(1)}/100\n`;
    report += `🎨 Personalization Level: ${averageMetrics.personalizationLevel?.toFixed(1)}/100\n\n`;

    results.forEach(result => {
      report += `\n📋 ${result.testName}\n`;
      report += `Score: ${result.score}/100 ${result.passed ? '✅' : '❌'}\n`;
      
      const negativeIssues = result.issues.filter(i => i.emotionalImpact === 'negative');
      if (negativeIssues.length > 0) {
        report += `😞 Negative Emotional Impact Issues:\n`;
        negativeIssues.forEach(issue => {
          report += `  • ${issue.description}\n`;
          report += `    💡 ${issue.suggestion}\n`;
        });
      }
    });

    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];
    report += '\n😊 EMOTIONAL ENHANCEMENT STRATEGIES:\n';
    allRecommendations.slice(0, 10).forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });

    return report;
  }
}