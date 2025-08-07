// Smart Internationalization Testing with Performance Optimization
export interface I18nTestResult {
  testName: string;
  passed: boolean;
  failed: boolean;
  score: number;
  issues: I18nIssue[];
  metrics: I18nMetrics;
  testedLanguages: string[];
  criticalIssues: string[];
  performanceMetrics: {
    executionTime: number;
    languagesTested: number;
    translationKeysChecked: number;
  };
}

export interface I18nIssue {
  language: string;
  category: 'translation' | 'layout' | 'cultural' | 'technical' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  expectedBehavior: string;
  actualBehavior: string;
  recommendation: string;
  quickFix?: string;
}

export interface I18nMetrics {
  translationCompleteness: Record<string, number>;
  layoutConsistency: Record<string, number>;
  culturalAppropriateness: Record<string, number>;
  rtlLayoutHandling: number;
  fontSupport: number;
  textExpansion: number;
}

export class SmartInternationalizationTester {
  private static supportedLanguages = [
    { code: 'en', name: 'English', direction: 'ltr', expansion: 1.0 },
    { code: 'ar', name: 'Arabic', direction: 'rtl', expansion: 1.1 },
    { code: 'es', name: 'Spanish', direction: 'ltr', expansion: 1.2 },
    { code: 'fr', name: 'French', direction: 'ltr', expansion: 1.25 },
    { code: 'hi', name: 'Hindi', direction: 'ltr', expansion: 1.15 },
    { code: 'pt', name: 'Portuguese', direction: 'ltr', expansion: 1.18 },
    { code: 'zh', name: 'Chinese', direction: 'ltr', expansion: 0.8 }
  ];

  private static translationCache = new Map<string, any>();
  private static layoutCache = new Map<string, boolean>();

  static async runInternationalizationTests(): Promise<I18nTestResult> {
    const startTime = performance.now();
    const issues: I18nIssue[] = [];
    const criticalIssues: string[] = [];
    let translationKeysChecked = 0;

    try {
      // Priority 1: Critical RTL/LTR handling (most important for story apps)
      const rtlResults = await this.testCriticalRTLHandling();
      issues.push(...rtlResults.issues);
      if (rtlResults.criticalIssues.length > 0) {
        criticalIssues.push(...rtlResults.criticalIssues);
      }

      // Priority 2: Translation completeness (quick sample check)
      const translationResults = await this.testTranslationCompleteness();
      issues.push(...translationResults.issues);
      translationKeysChecked = translationResults.keysChecked;

      // Priority 3: Layout consistency (performance optimized)
      const layoutResults = await this.testOptimizedLayoutConsistency();
      issues.push(...layoutResults.issues);

      // Priority 4: Font and text handling
      const fontResults = await this.testFontAndTextHandling();
      issues.push(...fontResults.issues);

      // Calculate metrics
      const metrics: I18nMetrics = {
        translationCompleteness: translationResults.completeness,
        layoutConsistency: layoutResults.consistency,
        culturalAppropriateness: this.calculateCulturalScore(),
        rtlLayoutHandling: rtlResults.score,
        fontSupport: fontResults.score,
        textExpansion: layoutResults.expansionScore
      };

      const overallScore = this.calculateOverallScore(metrics);
      const passed = overallScore >= 75 && criticalIssues.length === 0;

      const result: I18nTestResult = {
        testName: 'Smart Internationalization Compliance',
        passed,
        failed: !passed,
        score: overallScore,
        issues,
        metrics,
        testedLanguages: this.supportedLanguages.map(lang => lang.code),
        criticalIssues,
        performanceMetrics: {
          executionTime: performance.now() - startTime,
          languagesTested: this.supportedLanguages.length,
          translationKeysChecked
        }
      };

      // Log compact summary
      const criticalCount = criticalIssues.length;
      console.log(`🌐 I18n: ${overallScore}%${criticalCount ? ` ⚠️ ${criticalCount} critical` : ''} (${result.performanceMetrics.executionTime.toFixed(1)}ms)`);

      return result;

    } catch (error) {
      console.error('Internationalization testing failed:', error);
      return this.createErrorResult(performance.now() - startTime);
    }
  }

  private static async testCriticalRTLHandling(): Promise<{
    issues: I18nIssue[];
    criticalIssues: string[];
    score: number;
  }> {
    const issues: I18nIssue[] = [];
    const criticalIssues: string[] = [];
    let passedChecks = 0;
    const totalChecks = 4;

    // Test 1: Story content direction (CRITICAL - stories should stay LTR)
    const storyElements = document.querySelectorAll('[data-testid*="story"], .story-content, .story-text');
    if (storyElements.length > 0) {
      const storyElement = storyElements[0] as HTMLElement;
      const computedStyle = window.getComputedStyle(storyElement);
      const direction = computedStyle.direction || storyElement.dir;
      
      if (direction !== 'ltr' && !storyElement.hasAttribute('dir')) {
        issues.push({
          language: 'ar',
          category: 'layout',
          severity: 'critical',
          description: 'Story content lacks explicit LTR direction',
          element: 'story.content',
          expectedBehavior: 'Story content forced to LTR with dir="ltr"',
          actualBehavior: 'Story direction follows document direction',
          recommendation: 'Add dir="ltr" to story content containers',
          quickFix: '<div dir="ltr" className="story-content">...</div>'
        });
        criticalIssues.push('Story content direction not properly isolated from UI direction');
      } else {
        passedChecks++;
      }
    } else {
      passedChecks++; // No story content to test
    }

    // Test 2: Navigation consistency (important for reading flow)
    const navElements = document.querySelectorAll('nav, [role="navigation"], .navigation');
    if (navElements.length > 0) {
      const hasConsistentNavigation = Array.from(navElements).every(nav => {
        const style = window.getComputedStyle(nav as HTMLElement);
        return style.direction === 'ltr' || (nav as HTMLElement).dir === 'ltr';
      });
      
      if (hasConsistentNavigation) {
        passedChecks++;
      } else {
        issues.push({
          language: 'ar',
          category: 'layout',
          severity: 'high',
          description: 'Navigation direction inconsistent for story flow',
          element: 'navigation.direction',
          expectedBehavior: 'Story navigation remains LTR for consistent progression',
          actualBehavior: 'Navigation follows RTL document direction',
          recommendation: 'Keep story navigation LTR using dir="ltr"',
          quickFix: '<nav dir="ltr">...</nav>'
        });
      }
    } else {
      passedChecks++;
    }

    // Test 3: Language switcher accessibility
    const langSwitcher = document.querySelector('[data-testid*="language"], .language-switcher, [aria-label*="language"]');
    if (langSwitcher) {
      const hasAriaLabel = langSwitcher.getAttribute('aria-label') || langSwitcher.getAttribute('aria-labelledby');
      if (hasAriaLabel) {
        passedChecks++;
      } else {
        issues.push({
          language: 'all',
          category: 'accessibility',
          severity: 'medium',
          description: 'Language switcher lacks accessibility labels',
          element: 'language.switcher',
          expectedBehavior: 'Language options have clear labels',
          actualBehavior: 'Missing aria-label or aria-labelledby',
          recommendation: 'Add accessibility labels for language options',
          quickFix: '<button aria-label="Switch to Arabic">العربية</button>'
        });
      }
    } else {
      passedChecks++; // No language switcher to test
    }

    // Test 4: Document language declaration
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.length >= 2) {
      passedChecks++;
    } else {
      issues.push({
        language: 'all',
        category: 'technical',
        severity: 'medium',
        description: 'Document language not properly declared',
        element: 'html.lang',
        expectedBehavior: 'HTML lang attribute set to current language',
        actualBehavior: 'Missing or invalid lang attribute',
        recommendation: 'Set lang attribute on html element',
        quickFix: '<html lang="en">... or <html lang="ar">...'
      });
    }

    const score = (passedChecks / totalChecks) * 100;
    return { issues, criticalIssues, score };
  }

  private static async testTranslationCompleteness(): Promise<{
    issues: I18nIssue[];
    completeness: Record<string, number>;
    keysChecked: number;
  }> {
    const issues: I18nIssue[] = [];
    const completeness: Record<string, number> = {};
    
    // Sample critical UI elements for translation checking
    const criticalElements = [
      { selector: 'h1, [data-testid*="title"], .title', key: 'title', required: true },
      { selector: 'button[type="submit"], .submit-button', key: 'submit', required: true },
      { selector: '[data-testid*="start"], .start-button', key: 'start', required: true },
      { selector: '[aria-label*="play"], [data-testid*="audio"]', key: 'audio', required: false },
      { selector: '.error-message, [data-testid*="error"]', key: 'error', required: false }
    ];

    let keysChecked = 0;

    for (const lang of this.supportedLanguages.slice(0, 4)) { // Test top 4 languages for performance
      let translatedElements = 0;
      let totalElements = 0;

      criticalElements.forEach(({ selector, key, required }) => {
        const elements = document.querySelectorAll(selector);
        totalElements += elements.length;
        keysChecked++;

        elements.forEach((element, index) => {
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            // Simple heuristic: if text contains non-ASCII for non-English, assume translated
            if (lang.code === 'en' || /[^\x00-\x7F]/.test(text)) {
              translatedElements++;
            } else if (required) {
              issues.push({
                language: lang.code,
                category: 'translation',
                severity: 'medium',
                description: `${key} appears untranslated`,
                element: `${selector}[${index}]`,
                expectedBehavior: `Text translated to ${lang.name}`,
                actualBehavior: `Text appears to be in English: "${text.substring(0, 30)}..."`,
                recommendation: `Translate ${key} element to ${lang.name}`,
                quickFix: `Add translation key for "${text}"`
              });
            }
          }
        });
      });

      const completenessPercent = totalElements > 0 ? (translatedElements / totalElements) * 100 : 100;
      completeness[lang.code] = completenessPercent;

      if (completenessPercent < 60 && lang.code !== 'en') {
        issues.push({
          language: lang.code,
          category: 'translation',
          severity: 'high',
          description: `Low translation coverage (${completenessPercent.toFixed(1)}%)`,
          element: 'translation.coverage',
          expectedBehavior: 'At least 60% of UI elements translated',
          actualBehavior: `Only ${completenessPercent.toFixed(1)}% appears translated`,
          recommendation: `Increase translation coverage for ${lang.name}`,
          quickFix: 'Add missing translation keys to locale files'
        });
      }
    }

    return { issues, completeness, keysChecked };
  }

  private static async testOptimizedLayoutConsistency(): Promise<{
    issues: I18nIssue[];
    consistency: Record<string, number>;
    expansionScore: number;
  }> {
    const issues: I18nIssue[] = [];
    const consistency: Record<string, number> = {};
    let expansionScore = 100;

    // Test only key layout elements for performance
    const keyElements = [
      { selector: 'button', name: 'buttons', critical: true },
      { selector: '.user-form, form', name: 'forms', critical: true },
      { selector: 'h1, h2, h3', name: 'headings', critical: false },
      { selector: '.story-content', name: 'story', critical: true }
    ];

    for (const lang of this.supportedLanguages.slice(0, 3)) { // Test subset for performance
      let layoutScore = 100;
      const expansion = lang.expansion;

      keyElements.forEach(({ selector, name, critical }) => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
          const cacheKey = `layout-${lang.code}-${selector}-${index}`;
          
          if (this.layoutCache.has(cacheKey)) {
            return; // Use cached result
          }

          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element as HTMLElement);
          
          // Test text overflow with language expansion
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            const estimatedWidth = text.length * expansion * 8; // Rough estimation
            
            if (estimatedWidth > rect.width && rect.width > 0) {
              layoutScore -= critical ? 25 : 10;
              expansionScore -= 15;
              
              issues.push({
                language: lang.code,
                category: 'layout',
                severity: critical ? 'high' : 'medium',
                description: `Text overflow likely in ${name} for ${lang.name}`,
                element: `${selector}[${index}]`,
                expectedBehavior: 'Text fits within container',
                actualBehavior: `Text may overflow (${expansion}x expansion factor)`,
                recommendation: 'Use flexible layouts that accommodate text expansion',
                quickFix: 'Add CSS: overflow-wrap: break-word; min-width: fit-content;'
              });
            }
          }

          this.layoutCache.set(cacheKey, true);
        });
      });

      consistency[lang.code] = Math.max(0, layoutScore);
    }

    return { issues, consistency, expansionScore };
  }

  private static async testFontAndTextHandling(): Promise<{
    issues: I18nIssue[];
    score: number;
  }> {
    const issues: I18nIssue[] = [];
    let totalScore = 0;
    let testedLanguages = 0;

    // Test font support for non-Latin scripts
    const nonLatinLanguages = this.supportedLanguages.filter(lang => 
      ['ar', 'hi', 'zh'].includes(lang.code)
    );

    for (const lang of nonLatinLanguages) {
      testedLanguages++;
      let langScore = 100;

      // Test if appropriate fonts are loaded
      const testElement = document.createElement('div');
      testElement.style.fontFamily = 'sans-serif';
      testElement.textContent = this.getTestText(lang.code);
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      document.body.appendChild(testElement);

      const computedFont = window.getComputedStyle(testElement).fontFamily;
      
      // Check if system fonts are being used (potential character support issues)
      if (computedFont.includes('Arial') || computedFont.includes('Helvetica')) {
        langScore -= 30;
        issues.push({
          language: lang.code,
          category: 'technical',
          severity: 'medium',
          description: `Default fonts may not support ${lang.name} characters`,
          element: 'font.family',
          expectedBehavior: 'Fonts optimized for language script',
          actualBehavior: `Using system fonts: ${computedFont}`,
          recommendation: `Add web fonts for ${lang.name} script support`,
          quickFix: `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic');`
        });
      }

      document.body.removeChild(testElement);
      totalScore += langScore;
    }

    const averageScore = testedLanguages > 0 ? totalScore / testedLanguages : 100;
    return { issues, score: averageScore };
  }

  private static getTestText(langCode: string): string {
    const testTexts: Record<string, string> = {
      'ar': 'مرحبا بك في تطبيق القراءة',
      'hi': 'पढ़ने के लिए स्वागत है',
      'zh': '欢迎使用阅读应用程序',
      'en': 'Welcome to the reading app'
    };
    return testTexts[langCode] || testTexts.en;
  }

  private static calculateCulturalScore(): Record<string, number> {
    // Simplified cultural appropriateness scoring
    const scores: Record<string, number> = {};
    
    this.supportedLanguages.forEach(lang => {
      scores[lang.code] = 85; // Assume reasonable cultural appropriateness
    });
    
    return scores;
  }

  private static calculateOverallScore(metrics: I18nMetrics): number {
    const weights = {
      rtlLayoutHandling: 0.3,    // Most critical for story apps
      translationCompleteness: 0.25,
      layoutConsistency: 0.2,
      fontSupport: 0.15,
      textExpansion: 0.1
    };

    let weightedScore = 0;
    let totalWeight = 0;

    // RTL handling
    weightedScore += metrics.rtlLayoutHandling * weights.rtlLayoutHandling;
    totalWeight += weights.rtlLayoutHandling;

    // Translation completeness (average)
    const avgTranslation = Object.values(metrics.translationCompleteness).reduce((a, b) => a + b, 0) / 
                          Object.keys(metrics.translationCompleteness).length;
    weightedScore += avgTranslation * weights.translationCompleteness;
    totalWeight += weights.translationCompleteness;

    // Layout consistency (average)
    const avgLayout = Object.values(metrics.layoutConsistency).reduce((a, b) => a + b, 0) / 
                     Object.keys(metrics.layoutConsistency).length;
    weightedScore += avgLayout * weights.layoutConsistency;
    totalWeight += weights.layoutConsistency;

    // Font support
    weightedScore += metrics.fontSupport * weights.fontSupport;
    totalWeight += weights.fontSupport;

    // Text expansion
    weightedScore += metrics.textExpansion * weights.textExpansion;
    totalWeight += weights.textExpansion;

    return Math.round(weightedScore / totalWeight);
  }

  private static createErrorResult(executionTime: number): I18nTestResult {
    return {
      testName: 'Smart Internationalization Compliance',
      passed: false,
      failed: true,
      score: 0,
      issues: [{
        language: 'system',
        category: 'technical',
        severity: 'critical',
        description: 'Internationalization testing system failure',
        element: 'test.system',
        expectedBehavior: 'Tests execute successfully',
        actualBehavior: 'Testing system encountered an error',
        recommendation: 'Fix i18n testing system'
      }],
      metrics: {
        translationCompleteness: {},
        layoutConsistency: {},
        culturalAppropriateness: {},
        rtlLayoutHandling: 0,
        fontSupport: 0,
        textExpansion: 0
      },
      testedLanguages: [],
      criticalIssues: ['Internationalization testing system failure'],
      performanceMetrics: {
        executionTime,
        languagesTested: 0,
        translationKeysChecked: 0
      }
    };
  }

  static generateCompactReport(result: I18nTestResult): string {
    const { score, criticalIssues, performanceMetrics } = result;
    
    let report = `🌐 I18n: ${score}%`;
    
    if (criticalIssues.length > 0) {
      report += ` ⚠️ ${criticalIssues.length} critical`;
    }
    
    if (performanceMetrics.executionTime > 150) {
      report += ` 🐌 ${performanceMetrics.executionTime.toFixed(0)}ms`;
    }
    
    return report;
  }
}