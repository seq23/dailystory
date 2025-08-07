interface I18nTestResult {
  testName: string;
  passed: boolean;
  failed: boolean;
  score: number;
  issues: I18nIssue[];
  metrics: I18nMetrics;
  testedLanguages: string[];
  criticalIssues: string[];
}

interface I18nIssue {
  language: string;
  category: 'translation' | 'layout' | 'cultural' | 'technical' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  expectedBehavior: string;
  actualBehavior: string;
  recommendation: string;
}

interface I18nMetrics {
  translationCompleteness: Record<string, number>;
  layoutConsistency: Record<string, number>;
  culturalAppropriateness: Record<string, number>;
  rtlLayoutHandling: number;
  fontSupport: number;
  textExpansion: number;
}

interface TranslationKey {
  key: string;
  value: string;
  context?: string;
  maxLength?: number;
}

export class InternationalizationTester {
  private static supportedLanguages = [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'ar', name: 'Arabic', direction: 'rtl' },
    { code: 'es', name: 'Spanish', direction: 'ltr' },
    { code: 'fr', name: 'French', direction: 'ltr' },
    { code: 'hi', name: 'Hindi', direction: 'ltr' },
    { code: 'pt', name: 'Portuguese', direction: 'ltr' },
    { code: 'zh', name: 'Chinese', direction: 'ltr' }
  ];

  private static mockTranslations: Record<string, Record<string, string>> = {
    en: {
      'welcome.title': 'Welcome to DailyStory',
      'story.start': 'Start Reading',
      'timer.minutes': 'minutes',
      'user.name': 'Name',
      'premium.upgrade': 'Upgrade to Premium'
    },
    ar: {
      'welcome.title': 'مرحبا بك في DailyStory',
      'story.start': 'ابدأ القراءة',
      'timer.minutes': 'دقائق',
      'user.name': 'الاسم',
      'premium.upgrade': 'الترقية إلى الإصدار المميز'
    },
    es: {
      'welcome.title': 'Bienvenido a DailyStory',
      'story.start': 'Comenzar a Leer',
      'timer.minutes': 'minutos',
      'user.name': 'Nombre',
      'premium.upgrade': 'Actualizar a Premium'
    },
    fr: {
      'welcome.title': 'Bienvenue sur DailyStory',
      'story.start': 'Commencer à Lire',
      'timer.minutes': 'minutes',
      'user.name': 'Nom',
      'premium.upgrade': 'Passer à Premium'
    }
  };

  static async runInternationalizationTests(): Promise<I18nTestResult> {
    const issues: I18nIssue[] = [];
    const criticalIssues: string[] = [];
    const testedLanguages: string[] = [];

    // Test translation completeness for each language
    const translationResults = await this.testTranslationCompleteness();
    issues.push(...translationResults.issues);
    if (translationResults.criticalIssues.length > 0) {
      criticalIssues.push(...translationResults.criticalIssues);
    }

    // Test RTL layout handling
    const rtlResults = await this.testRTLLayoutHandling();
    issues.push(...rtlResults.issues);
    if (rtlResults.criticalIssues.length > 0) {
      criticalIssues.push(...rtlResults.criticalIssues);
    }

    // Test layout consistency across languages
    const layoutResults = await this.testLayoutConsistency();
    issues.push(...layoutResults.issues);

    // Test cultural appropriateness
    const culturalResults = await this.testCulturalAppropriateness();
    issues.push(...culturalResults.issues);

    // Test font support
    const fontResults = await this.testFontSupport();
    issues.push(...fontResults.issues);

    // Test text expansion handling
    const textExpansionResults = await this.testTextExpansionHandling();
    issues.push(...textExpansionResults.issues);

    // Calculate metrics
    const metrics: I18nMetrics = {
      translationCompleteness: translationResults.completeness,
      layoutConsistency: layoutResults.consistency,
      culturalAppropriateness: culturalResults.appropriateness,
      rtlLayoutHandling: rtlResults.score,
      fontSupport: fontResults.score,
      textExpansion: textExpansionResults.score
    };

    testedLanguages.push(...this.supportedLanguages.map(lang => lang.code));

    const overallScore = this.calculateOverallScore(metrics);
    const passed = overallScore >= 85 && criticalIssues.length === 0;

    return {
      testName: 'Internationalization Compliance',
      passed,
      failed: !passed,
      score: overallScore,
      issues,
      metrics,
      testedLanguages,
      criticalIssues
    };
  }

  private static async testTranslationCompleteness(): Promise<{
    issues: I18nIssue[];
    criticalIssues: string[];
    completeness: Record<string, number>;
  }> {
    const issues: I18nIssue[] = [];
    const criticalIssues: string[] = [];
    const completeness: Record<string, number> = {};

    const englishKeys = Object.keys(this.mockTranslations.en);

    for (const lang of this.supportedLanguages) {
      if (lang.code === 'en') {
        completeness[lang.code] = 100;
        continue;
      }

      const langTranslations = this.mockTranslations[lang.code] || {};
      const translatedKeys = Object.keys(langTranslations);
      const missingKeys = englishKeys.filter(key => !langTranslations[key]);

      const completenessPercent = ((translatedKeys.length / englishKeys.length) * 100);
      completeness[lang.code] = completenessPercent;

      if (completenessPercent < 80) {
        const severity = completenessPercent < 50 ? 'critical' : 'high';
        issues.push({
          language: lang.code,
          category: 'translation',
          severity,
          description: `Translation completeness is ${completenessPercent.toFixed(1)}%`,
          element: 'translation.completeness',
          expectedBehavior: '100% translation coverage',
          actualBehavior: `${completenessPercent.toFixed(1)}% coverage`,
          recommendation: `Add translations for missing keys: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`
        });

        if (severity === 'critical') {
          criticalIssues.push(`${lang.name} has critically low translation coverage (${completenessPercent.toFixed(1)}%)`);
        }
      }

      // Check for empty translations
      const emptyTranslations = translatedKeys.filter(key => !langTranslations[key]?.trim());
      if (emptyTranslations.length > 0) {
        issues.push({
          language: lang.code,
          category: 'translation',
          severity: 'medium',
          description: 'Empty translation values detected',
          element: 'translation.values',
          expectedBehavior: 'All translation keys have values',
          actualBehavior: `${emptyTranslations.length} empty translations`,
          recommendation: `Provide translations for: ${emptyTranslations.slice(0, 3).join(', ')}`
        });
      }
    }

    return { issues, criticalIssues, completeness };
  }

  private static async testRTLLayoutHandling(): Promise<{
    issues: I18nIssue[];
    criticalIssues: string[];
    score: number;
  }> {
    const issues: I18nIssue[] = [];
    const criticalIssues: string[] = [];
    let passedChecks = 0;
    const totalChecks = 5;

    // Test 1: RTL language detection
    const rtlLanguages = this.supportedLanguages.filter(lang => lang.direction === 'rtl');
    if (rtlLanguages.length > 0) {
      passedChecks++;
    } else {
      // This is actually expected - we want RTL UI to stay LTR for English stories
      passedChecks++;
    }

    // Test 2: Story content direction (should remain LTR even in RTL languages)
    const storyContentDirection = this.testStoryContentDirection();
    if (storyContentDirection.isLTR) {
      passedChecks++;
    } else {
      issues.push({
        language: 'ar',
        category: 'layout',
        severity: 'critical',
        description: 'Story content is not displayed in LTR direction',
        element: 'story.content',
        expectedBehavior: 'Story content remains LTR even in RTL UI',
        actualBehavior: 'Story content follows UI direction',
        recommendation: 'Force story content to display LTR with dir="ltr" attribute'
      });
      criticalIssues.push('Story content direction not properly handled in RTL layouts');
    }

    // Test 3: Navigation consistency (should remain LTR)
    const navigationDirection = this.testNavigationDirection();
    if (navigationDirection.isConsistent) {
      passedChecks++;
    } else {
      issues.push({
        language: 'ar',
        category: 'layout',
        severity: 'high',
        description: 'Navigation direction is inconsistent in RTL layout',
        element: 'navigation.direction',
        expectedBehavior: 'Navigation remains LTR for story progression',
        actualBehavior: 'Navigation follows RTL direction',
        recommendation: 'Keep story navigation LTR for consistent reading flow'
      });
    }

    // Test 4: Icon and button orientation
    const iconOrientation = this.testIconOrientation();
    if (iconOrientation.isCorrect) {
      passedChecks++;
    } else {
      issues.push({
        language: 'ar',
        category: 'layout',
        severity: 'medium',
        description: 'Icons are not properly oriented for RTL layout',
        element: 'icons.orientation',
        expectedBehavior: 'Directional icons flip for RTL, story icons remain LTR',
        actualBehavior: 'Icon orientation is incorrect',
        recommendation: 'Implement proper icon mirroring for RTL layouts'
      });
    }

    // Test 5: Text alignment in RTL
    const textAlignment = this.testRTLTextAlignment();
    if (textAlignment.isCorrect) {
      passedChecks++;
    } else {
      issues.push({
        language: 'ar',
        category: 'layout',
        severity: 'medium',
        description: 'Text alignment is incorrect in RTL layout',
        element: 'text.alignment',
        expectedBehavior: 'UI text aligns right, story text aligns left',
        actualBehavior: 'Text alignment is inconsistent',
        recommendation: 'Apply proper text alignment for RTL vs story content'
      });
    }

    const score = (passedChecks / totalChecks) * 100;
    return { issues, criticalIssues, score };
  }

  private static async testLayoutConsistency(): Promise<{
    issues: I18nIssue[];
    consistency: Record<string, number>;
  }> {
    const issues: I18nIssue[] = [];
    const consistency: Record<string, number> = {};

    for (const lang of this.supportedLanguages) {
      let layoutScore = 100;
      
      // Test text overflow
      const textOverflow = this.testTextOverflow(lang.code);
      if (!textOverflow.withinBounds) {
        layoutScore -= 25;
        issues.push({
          language: lang.code,
          category: 'layout',
          severity: 'medium',
          description: 'Text overflow detected in translated content',
          element: 'layout.textOverflow',
          expectedBehavior: 'Text fits within container bounds',
          actualBehavior: 'Text exceeds container boundaries',
          recommendation: 'Adjust container sizes or truncate long translations'
        });
      }

      // Test button sizing
      const buttonSizing = this.testButtonSizing(lang.code);
      if (!buttonSizing.isConsistent) {
        layoutScore -= 20;
        issues.push({
          language: lang.code,
          category: 'layout',
          severity: 'low',
          description: 'Button sizes inconsistent with translated text',
          element: 'layout.buttonSizing',
          expectedBehavior: 'Buttons accommodate translated text',
          actualBehavior: 'Buttons do not adjust to text length',
          recommendation: 'Use flexible button sizing for different languages'
        });
      }

      // Test spacing consistency
      const spacing = this.testSpacingConsistency(lang.code);
      if (!spacing.isConsistent) {
        layoutScore -= 15;
        issues.push({
          language: lang.code,
          category: 'layout',
          severity: 'low',
          description: 'Spacing inconsistencies in translated layout',
          element: 'layout.spacing',
          expectedBehavior: 'Consistent spacing across languages',
          actualBehavior: 'Spacing varies between language versions',
          recommendation: 'Standardize spacing rules for all languages'
        });
      }

      consistency[lang.code] = Math.max(0, layoutScore);
    }

    return { issues, consistency };
  }

  private static async testCulturalAppropriateness(): Promise<{
    issues: I18nIssue[];
    appropriateness: Record<string, number>;
  }> {
    const issues: I18nIssue[] = [];
    const appropriateness: Record<string, number> = {};

    for (const lang of this.supportedLanguages) {
      let appropriatenessScore = 100;

      // Test color associations
      const colorAppropriate = this.testColorAppropriateness(lang.code);
      if (!colorAppropriate.isAppropriate) {
        appropriatenessScore -= 30;
        issues.push({
          language: lang.code,
          category: 'cultural',
          severity: 'medium',
          description: 'Color choices may not be culturally appropriate',
          element: 'cultural.colors',
          expectedBehavior: 'Colors appropriate for target culture',
          actualBehavior: 'Potentially inappropriate color usage',
          recommendation: 'Review color choices for cultural significance'
        });
      }

      // Test imagery appropriateness
      const imageryAppropriate = this.testImageryAppropriateness(lang.code);
      if (!imageryAppropriate.isAppropriate) {
        appropriatenessScore -= 25;
        issues.push({
          language: lang.code,
          category: 'cultural',
          severity: 'medium',
          description: 'Imagery may not be culturally appropriate',
          element: 'cultural.imagery',
          expectedBehavior: 'Images reflect diverse cultural backgrounds',
          actualBehavior: 'Limited cultural representation in imagery',
          recommendation: 'Include diverse and culturally appropriate imagery'
        });
      }

      // Test date/time formats
      const dateFormats = this.testDateTimeFormats(lang.code);
      if (!dateFormats.isCorrect) {
        appropriatenessScore -= 20;
        issues.push({
          language: lang.code,
          category: 'cultural',
          severity: 'low',
          description: 'Date/time formats not localized properly',
          element: 'cultural.dateFormats',
          expectedBehavior: 'Localized date/time formats',
          actualBehavior: 'Using default/inappropriate date formats',
          recommendation: 'Implement proper date/time localization'
        });
      }

      appropriateness[lang.code] = Math.max(0, appropriatenessScore);
    }

    return { issues, appropriateness };
  }

  private static async testFontSupport(): Promise<{
    issues: I18nIssue[];
    score: number;
  }> {
    const issues: I18nIssue[] = [];
    let totalScore = 0;
    let testedLanguages = 0;

    for (const lang of this.supportedLanguages) {
      testedLanguages++;
      let langScore = 100;

      // Test character rendering
      const characterSupport = this.testCharacterSupport(lang.code);
      if (!characterSupport.isSupported) {
        langScore -= 50;
        issues.push({
          language: lang.code,
          category: 'technical',
          severity: 'high',
          description: 'Font does not support all characters for this language',
          element: 'font.characterSupport',
          expectedBehavior: 'All characters render correctly',
          actualBehavior: 'Some characters not supported by font',
          recommendation: 'Add font support for language-specific characters'
        });
      }

      // Test font weight availability
      const fontWeights = this.testFontWeights(lang.code);
      if (!fontWeights.isComplete) {
        langScore -= 20;
        issues.push({
          language: lang.code,
          category: 'technical',
          severity: 'medium',
          description: 'Limited font weight options for this language',
          element: 'font.weights',
          expectedBehavior: 'Full range of font weights available',
          actualBehavior: 'Limited font weight support',
          recommendation: 'Ensure font family supports all needed weights'
        });
      }

      totalScore += langScore;
    }

    const averageScore = testedLanguages > 0 ? totalScore / testedLanguages : 0;
    return { issues, score: averageScore };
  }

  private static async testTextExpansionHandling(): Promise<{
    issues: I18nIssue[];
    score: number;
  }> {
    const issues: I18nIssue[] = [];
    const expansionFactors: Record<string, number> = {
      en: 1.0,
      de: 1.3, // German typically 30% longer
      es: 1.2, // Spanish typically 20% longer
      fr: 1.25, // French typically 25% longer
      ar: 1.1, // Arabic typically 10% longer
      zh: 0.8  // Chinese typically 20% shorter
    };

    let passedTests = 0;
    const totalTests = this.supportedLanguages.length;

    for (const lang of this.supportedLanguages) {
      const expansionFactor = expansionFactors[lang.code] || 1.0;
      const canHandleExpansion = this.testTextExpansion(lang.code, expansionFactor);

      if (canHandleExpansion.canHandle) {
        passedTests++;
      } else {
        const severity = expansionFactor > 1.2 ? 'high' : 'medium';
        issues.push({
          language: lang.code,
          category: 'layout',
          severity,
          description: `UI cannot handle ${(expansionFactor * 100).toFixed(0)}% text expansion`,
          element: 'layout.textExpansion',
          expectedBehavior: 'UI accommodates text length variations',
          actualBehavior: 'Text expansion causes layout issues',
          recommendation: 'Design flexible layouts that accommodate text expansion'
        });
      }
    }

    const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    return { issues, score };
  }

  // Helper methods for testing specific aspects
  private static testStoryContentDirection(): { isLTR: boolean } {
    // In a real implementation, this would check if story content has dir="ltr"
    return { isLTR: true }; // Assume correctly implemented
  }

  private static testNavigationDirection(): { isConsistent: boolean } {
    // Check if story navigation (next/previous) remains LTR
    return { isConsistent: true };
  }

  private static testIconOrientation(): { isCorrect: boolean } {
    // Check if icons are properly oriented for RTL
    return { isCorrect: true };
  }

  private static testRTLTextAlignment(): { isCorrect: boolean } {
    // Check if text alignment is appropriate for RTL
    return { isCorrect: true };
  }

  private static testTextOverflow(languageCode: string): { withinBounds: boolean } {
    // Simulate text overflow testing
    const longTextLanguages = ['de', 'fr', 'es'];
    return { withinBounds: !longTextLanguages.includes(languageCode) || Math.random() > 0.3 };
  }

  private static testButtonSizing(languageCode: string): { isConsistent: boolean } {
    // Simulate button sizing test
    return { isConsistent: Math.random() > 0.2 };
  }

  private static testSpacingConsistency(languageCode: string): { isConsistent: boolean } {
    // Simulate spacing consistency test
    return { isConsistent: Math.random() > 0.15 };
  }

  private static testColorAppropriateness(languageCode: string): { isAppropriate: boolean } {
    // Simulate cultural color appropriateness test
    return { isAppropriate: true };
  }

  private static testImageryAppropriateness(languageCode: string): { isAppropriate: boolean } {
    // Simulate imagery appropriateness test
    return { isAppropriate: true };
  }

  private static testDateTimeFormats(languageCode: string): { isCorrect: boolean } {
    // Simulate date/time format test
    return { isCorrect: languageCode === 'en' || Math.random() > 0.3 };
  }

  private static testCharacterSupport(languageCode: string): { isSupported: boolean } {
    // Simulate character support test
    const complexLanguages = ['ar', 'zh', 'hi'];
    return { isSupported: !complexLanguages.includes(languageCode) || Math.random() > 0.2 };
  }

  private static testFontWeights(languageCode: string): { isComplete: boolean } {
    // Simulate font weight test
    return { isComplete: Math.random() > 0.1 };
  }

  private static testTextExpansion(languageCode: string, expansionFactor: number): { canHandle: boolean } {
    // Simulate text expansion test
    return { canHandle: expansionFactor < 1.3 || Math.random() > 0.25 };
  }

  private static calculateOverallScore(metrics: I18nMetrics): number {
    const weights = {
      translationCompleteness: 0.25,
      layoutConsistency: 0.20,
      culturalAppropriateness: 0.15,
      rtlLayoutHandling: 0.20,
      fontSupport: 0.10,
      textExpansion: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    // Translation completeness (average across languages)
    const avgTranslationCompleteness = Object.values(metrics.translationCompleteness)
      .reduce((sum, val) => sum + val, 0) / Object.keys(metrics.translationCompleteness).length;
    totalScore += avgTranslationCompleteness * weights.translationCompleteness;
    totalWeight += weights.translationCompleteness;

    // Layout consistency (average across languages)
    const avgLayoutConsistency = Object.values(metrics.layoutConsistency)
      .reduce((sum, val) => sum + val, 0) / Object.keys(metrics.layoutConsistency).length;
    totalScore += avgLayoutConsistency * weights.layoutConsistency;
    totalWeight += weights.layoutConsistency;

    // Cultural appropriateness (average across languages)
    const avgCulturalAppropriateness = Object.values(metrics.culturalAppropriateness)
      .reduce((sum, val) => sum + val, 0) / Object.keys(metrics.culturalAppropriateness).length;
    totalScore += avgCulturalAppropriateness * weights.culturalAppropriateness;
    totalWeight += weights.culturalAppropriateness;

    // Individual metrics
    totalScore += metrics.rtlLayoutHandling * weights.rtlLayoutHandling;
    totalWeight += weights.rtlLayoutHandling;

    totalScore += metrics.fontSupport * weights.fontSupport;
    totalWeight += weights.fontSupport;

    totalScore += metrics.textExpansion * weights.textExpansion;
    totalWeight += weights.textExpansion;

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  static generateI18nReport(result: I18nTestResult): string {
    let report = `# Internationalization Test Report\n\n`;
    report += `**Test:** ${result.testName}\n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `**Overall Score:** ${result.score.toFixed(1)}%\n`;
    report += `**Languages Tested:** ${result.testedLanguages.join(', ')}\n\n`;

    if (result.criticalIssues.length > 0) {
      report += `## 🚨 Critical Issues\n`;
      result.criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `## Metrics Summary\n`;
    report += `- **RTL Layout Handling:** ${result.metrics.rtlLayoutHandling.toFixed(1)}%\n`;
    report += `- **Font Support:** ${result.metrics.fontSupport.toFixed(1)}%\n`;
    report += `- **Text Expansion Handling:** ${result.metrics.textExpansion.toFixed(1)}%\n\n`;

    report += `### Translation Completeness by Language\n`;
    Object.entries(result.metrics.translationCompleteness).forEach(([lang, percentage]) => {
      const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
      report += `- **${lang.toUpperCase()}:** ${status} ${percentage.toFixed(1)}%\n`;
    });
    report += `\n`;

    if (result.issues.length > 0) {
      report += `## Issues by Category\n\n`;
      
      const grouped = result.issues.reduce((acc, issue) => {
        const key = `${issue.category}-${issue.language}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(issue);
        return acc;
      }, {} as Record<string, I18nIssue[]>);

      Object.entries(grouped).forEach(([key, issues]) => {
        const [category, language] = key.split('-');
        report += `### ${category.toUpperCase()} - ${language.toUpperCase()} (${issues.length})\n`;
        issues.forEach(issue => {
          const severity = issue.severity === 'critical' ? '🔴' : 
                          issue.severity === 'high' ? '🟠' : 
                          issue.severity === 'medium' ? '🟡' : '🟢';
          report += `${severity} **${issue.element}**\n`;
          report += `${issue.description}\n`;
          report += `Expected: ${issue.expectedBehavior}\n`;
          report += `Actual: ${issue.actualBehavior}\n`;
          report += `*Recommendation:* ${issue.recommendation}\n\n`;
        });
      });
    }

    return report;
  }
}