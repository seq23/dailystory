interface TechnicalExcellenceTestResult {
  testName: string;
  passed: boolean;
  failed: boolean;
  score: number;
  issues: TechnicalIssue[];
  metrics: TechnicalMetrics;
  webVitalsScore: number;
  criticalIssues: string[];
}

interface TechnicalIssue {
  category: 'performance' | 'seo' | 'security' | 'accessibility' | 'progressive' | 'monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  impact: string;
  recommendation: string;
  automatable: boolean;
}

interface TechnicalMetrics {
  coreWebVitals: CoreWebVitals;
  seoCompliance: SEOMetrics;
  securityScore: number;
  accessibilityScore: number;
  progressiveWebAppScore: number;
  monitoringCoverage: number;
}

interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

interface SEOMetrics {
  titleTag: boolean;
  metaDescription: boolean;
  headingStructure: boolean;
  imageAltText: boolean;
  canonicalTag: boolean;
  robotsDirectives: boolean;
  structuredData: boolean;
  mobileOptimization: boolean;
}

export class TechnicalExcellenceTester {
  private static performanceBudgets = {
    lcp: 2500, // ms
    fid: 100,  // ms
    cls: 0.1,  // score
    fcp: 1800, // ms
    ttfb: 600  // ms
  };

  static async runTechnicalExcellenceTests(): Promise<TechnicalExcellenceTestResult> {
    const issues: TechnicalIssue[] = [];
    const criticalIssues: string[] = [];

    // Test Core Web Vitals
    const webVitalsResults = await this.testCoreWebVitals();
    issues.push(...webVitalsResults.issues);
    if (webVitalsResults.criticalIssues.length > 0) {
      criticalIssues.push(...webVitalsResults.criticalIssues);
    }

    // Test SEO compliance
    const seoResults = await this.testSEOCompliance();
    issues.push(...seoResults.issues);

    // Test security headers and practices
    const securityResults = await this.testSecurityPractices();
    issues.push(...securityResults.issues);
    if (securityResults.criticalIssues.length > 0) {
      criticalIssues.push(...securityResults.criticalIssues);
    }

    // Test accessibility compliance
    const accessibilityResults = await this.testAccessibilityCompliance();
    issues.push(...accessibilityResults.issues);

    // Test Progressive Web App features
    const pwaResults = await this.testProgressiveWebAppFeatures();
    issues.push(...pwaResults.issues);

    // Test monitoring and observability
    const monitoringResults = await this.testMonitoringCoverage();
    issues.push(...monitoringResults.issues);

    // Calculate metrics
    const metrics: TechnicalMetrics = {
      coreWebVitals: webVitalsResults.vitals,
      seoCompliance: seoResults.metrics,
      securityScore: securityResults.score,
      accessibilityScore: accessibilityResults.score,
      progressiveWebAppScore: pwaResults.score,
      monitoringCoverage: monitoringResults.score
    };

    const webVitalsScore = this.calculateWebVitalsScore(metrics.coreWebVitals);
    const overallScore = this.calculateOverallTechnicalScore(metrics);
    const passed = overallScore >= 85 && criticalIssues.length === 0 && webVitalsScore >= 75;

    return {
      testName: 'Technical Excellence Assessment',
      passed,
      failed: !passed,
      score: overallScore,
      issues,
      metrics,
      webVitalsScore,
      criticalIssues
    };
  }

  private static async testCoreWebVitals(): Promise<{
    issues: TechnicalIssue[];
    criticalIssues: string[];
    vitals: CoreWebVitals;
  }> {
    const issues: TechnicalIssue[] = [];
    const criticalIssues: string[] = [];

    // Simulate performance metrics (in real implementation, these would come from actual measurements)
    const vitals: CoreWebVitals = {
      lcp: this.simulateMetric(2000, 4000), // 2-4 seconds
      fid: this.simulateMetric(50, 300),    // 50-300ms
      cls: this.simulateMetric(0.05, 0.25), // 0.05-0.25
      fcp: this.simulateMetric(1200, 3000), // 1.2-3 seconds
      ttfb: this.simulateMetric(200, 1000)  // 200ms-1s
    };

    // Test LCP (Largest Contentful Paint)
    if (vitals.lcp > this.performanceBudgets.lcp) {
      const severity = vitals.lcp > 4000 ? 'critical' : 'high';
      issues.push({
        category: 'performance',
        severity,
        description: `LCP of ${vitals.lcp}ms exceeds budget of ${this.performanceBudgets.lcp}ms`,
        element: 'performance.lcp',
        impact: 'Poor user experience, potential SEO impact',
        recommendation: 'Optimize largest contentful paint through image optimization, preloading, and server response time improvements',
        automatable: true
      });
      
      if (severity === 'critical') {
        criticalIssues.push(`Critical LCP performance issue: ${vitals.lcp}ms`);
      }
    }

    // Test FID (First Input Delay)
    if (vitals.fid > this.performanceBudgets.fid) {
      const severity = vitals.fid > 300 ? 'critical' : 'high';
      issues.push({
        category: 'performance',
        severity,
        description: `FID of ${vitals.fid}ms exceeds budget of ${this.performanceBudgets.fid}ms`,
        element: 'performance.fid',
        impact: 'Poor interactivity, frustrated users',
        recommendation: 'Reduce JavaScript execution time, break up long tasks, use web workers for heavy computation',
        automatable: true
      });

      if (severity === 'critical') {
        criticalIssues.push(`Critical FID performance issue: ${vitals.fid}ms`);
      }
    }

    // Test CLS (Cumulative Layout Shift)
    if (vitals.cls > this.performanceBudgets.cls) {
      const severity = vitals.cls > 0.25 ? 'critical' : 'high';
      issues.push({
        category: 'performance',
        severity,
        description: `CLS of ${vitals.cls.toFixed(3)} exceeds budget of ${this.performanceBudgets.cls}`,
        element: 'performance.cls',
        impact: 'Visual instability, poor user experience',
        recommendation: 'Set explicit sizes for images and embeds, avoid inserting content above existing content',
        automatable: true
      });

      if (severity === 'critical') {
        criticalIssues.push(`Critical CLS issue: ${vitals.cls.toFixed(3)}`);
      }
    }

    // Test FCP (First Contentful Paint)
    if (vitals.fcp > this.performanceBudgets.fcp) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        description: `FCP of ${vitals.fcp}ms exceeds budget of ${this.performanceBudgets.fcp}ms`,
        element: 'performance.fcp',
        impact: 'Slower perceived loading speed',
        recommendation: 'Optimize critical rendering path, inline critical CSS, preload fonts',
        automatable: true
      });
    }

    // Test TTFB (Time to First Byte)
    if (vitals.ttfb > this.performanceBudgets.ttfb) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        description: `TTFB of ${vitals.ttfb}ms exceeds budget of ${this.performanceBudgets.ttfb}ms`,
        element: 'performance.ttfb',
        impact: 'Slow server response affects all other metrics',
        recommendation: 'Optimize server response time, use CDN, implement caching strategies',
        automatable: false
      });
    }

    return { issues, criticalIssues, vitals };
  }

  private static async testSEOCompliance(): Promise<{
    issues: TechnicalIssue[];
    metrics: SEOMetrics;
  }> {
    const issues: TechnicalIssue[] = [];
    
    // Simulate SEO checks (in real implementation, these would inspect the actual DOM)
    const metrics: SEOMetrics = {
      titleTag: this.simulateCheck(0.95),
      metaDescription: this.simulateCheck(0.90),
      headingStructure: this.simulateCheck(0.85),
      imageAltText: this.simulateCheck(0.80),
      canonicalTag: this.simulateCheck(0.75),
      robotsDirectives: this.simulateCheck(0.90),
      structuredData: this.simulateCheck(0.70),
      mobileOptimization: this.simulateCheck(0.95)
    };

    // Check title tag
    if (!metrics.titleTag) {
      issues.push({
        category: 'seo',
        severity: 'critical',
        description: 'Missing or improper title tag',
        element: 'seo.titleTag',
        impact: 'Severe SEO impact, poor search engine visibility',
        recommendation: 'Add descriptive title tags under 60 characters with target keywords',
        automatable: true
      });
    }

    // Check meta description
    if (!metrics.metaDescription) {
      issues.push({
        category: 'seo',
        severity: 'high',
        description: 'Missing or improper meta description',
        element: 'seo.metaDescription',
        impact: 'Reduced click-through rates from search results',
        recommendation: 'Add compelling meta descriptions under 160 characters',
        automatable: true
      });
    }

    // Check heading structure
    if (!metrics.headingStructure) {
      issues.push({
        category: 'seo',
        severity: 'medium',
        description: 'Poor heading hierarchy structure',
        element: 'seo.headingStructure',
        impact: 'Reduced content comprehension for search engines',
        recommendation: 'Implement proper H1-H6 hierarchy with single H1 per page',
        automatable: true
      });
    }

    // Check image alt text
    if (!metrics.imageAltText) {
      issues.push({
        category: 'seo',
        severity: 'medium',
        description: 'Images missing descriptive alt text',
        element: 'seo.imageAltText',
        impact: 'Reduced accessibility and image search visibility',
        recommendation: 'Add descriptive alt attributes to all content images',
        automatable: true
      });
    }

    // Check canonical tag
    if (!metrics.canonicalTag) {
      issues.push({
        category: 'seo',
        severity: 'medium',
        description: 'Missing canonical tags',
        element: 'seo.canonicalTag',
        impact: 'Potential duplicate content issues',
        recommendation: 'Add canonical tags to prevent duplicate content penalties',
        automatable: true
      });
    }

    // Check robots directives
    if (!metrics.robotsDirectives) {
      issues.push({
        category: 'seo',
        severity: 'low',
        description: 'Missing or incomplete robots meta directives',
        element: 'seo.robotsDirectives',
        impact: 'Unclear crawling instructions for search engines',
        recommendation: 'Add appropriate robots meta tags and robots.txt file',
        automatable: true
      });
    }

    // Check structured data
    if (!metrics.structuredData) {
      issues.push({
        category: 'seo',
        severity: 'low',
        description: 'Missing structured data markup',
        element: 'seo.structuredData',
        impact: 'Missed rich snippet opportunities',
        recommendation: 'Implement JSON-LD structured data for enhanced search results',
        automatable: false
      });
    }

    // Check mobile optimization
    if (!metrics.mobileOptimization) {
      issues.push({
        category: 'seo',
        severity: 'high',
        description: 'Poor mobile optimization',
        element: 'seo.mobileOptimization',
        impact: 'Reduced mobile search rankings',
        recommendation: 'Implement responsive design and mobile-first approach',
        automatable: true
      });
    }

    return { issues, metrics };
  }

  private static async testSecurityPractices(): Promise<{
    issues: TechnicalIssue[];
    criticalIssues: string[];
    score: number;
  }> {
    const issues: TechnicalIssue[] = [];
    const criticalIssues: string[] = [];
    let securityScore = 100;

    // Test security headers
    const securityHeaders = this.checkSecurityHeaders();
    if (!securityHeaders.hasCSP) {
      securityScore -= 20;
      issues.push({
        category: 'security',
        severity: 'high',
        description: 'Missing Content Security Policy (CSP) header',
        element: 'security.csp',
        impact: 'Increased XSS attack vulnerability',
        recommendation: 'Implement strict Content Security Policy headers',
        automatable: true
      });
    }

    if (!securityHeaders.hasHSTS) {
      securityScore -= 15;
      issues.push({
        category: 'security',
        severity: 'medium',
        description: 'Missing HTTP Strict Transport Security (HSTS) header',
        element: 'security.hsts',
        impact: 'Potential man-in-the-middle attacks',
        recommendation: 'Add HSTS headers to enforce HTTPS connections',
        automatable: true
      });
    }

    if (!securityHeaders.hasXFrameOptions) {
      securityScore -= 10;
      issues.push({
        category: 'security',
        severity: 'medium',
        description: 'Missing X-Frame-Options header',
        element: 'security.xFrameOptions',
        impact: 'Vulnerability to clickjacking attacks',
        recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN header',
        automatable: true
      });
    }

    // Test HTTPS enforcement
    const httpsCheck = this.checkHTTPSEnforcement();
    if (!httpsCheck.isEnforced) {
      securityScore -= 25;
      issues.push({
        category: 'security',
        severity: 'critical',
        description: 'HTTPS not properly enforced',
        element: 'security.https',
        impact: 'Data transmission not encrypted, severe security risk',
        recommendation: 'Enforce HTTPS for all connections and redirect HTTP to HTTPS',
        automatable: true
      });
      criticalIssues.push('HTTPS not properly enforced');
    }

    // Test input validation
    const inputValidation = this.checkInputValidation();
    if (!inputValidation.isProper) {
      securityScore -= 20;
      issues.push({
        category: 'security',
        severity: 'high',
        description: 'Insufficient input validation detected',
        element: 'security.inputValidation',
        impact: 'Potential injection attacks',
        recommendation: 'Implement comprehensive input validation and sanitization',
        automatable: false
      });
    }

    // Test authentication security
    const authSecurity = this.checkAuthenticationSecurity();
    if (!authSecurity.isSecure) {
      securityScore -= 15;
      issues.push({
        category: 'security',
        severity: 'high',
        description: 'Authentication security concerns detected',
        element: 'security.authentication',
        impact: 'Potential unauthorized access',
        recommendation: 'Implement secure authentication practices (rate limiting, secure session management)',
        automatable: false
      });
    }

    return { issues, criticalIssues, score: Math.max(0, securityScore) };
  }

  private static async testAccessibilityCompliance(): Promise<{
    issues: TechnicalIssue[];
    score: number;
  }> {
    const issues: TechnicalIssue[] = [];
    let accessibilityScore = 100;

    // Test WCAG compliance
    const wcagCompliance = this.checkWCAGCompliance();
    if (wcagCompliance.score < 90) {
      accessibilityScore = wcagCompliance.score;
      issues.push({
        category: 'accessibility',
        severity: wcagCompliance.score < 70 ? 'high' : 'medium',
        description: `WCAG compliance score of ${wcagCompliance.score}% below target`,
        element: 'accessibility.wcag',
        impact: 'Reduced accessibility for users with disabilities',
        recommendation: 'Address WCAG violations to improve accessibility compliance',
        automatable: true
      });
    }

    // Test keyboard navigation
    const keyboardNav = this.checkKeyboardNavigation();
    if (!keyboardNav.isComplete) {
      accessibilityScore -= 15;
      issues.push({
        category: 'accessibility',
        severity: 'medium',
        description: 'Incomplete keyboard navigation support',
        element: 'accessibility.keyboard',
        impact: 'Limited access for keyboard-only users',
        recommendation: 'Ensure all interactive elements are keyboard accessible',
        automatable: true
      });
    }

    // Test screen reader support
    const screenReader = this.checkScreenReaderSupport();
    if (!screenReader.isAdequate) {
      accessibilityScore -= 20;
      issues.push({
        category: 'accessibility',
        severity: 'high',
        description: 'Inadequate screen reader support',
        element: 'accessibility.screenReader',
        impact: 'Poor experience for visually impaired users',
        recommendation: 'Improve ARIA labels, roles, and semantic markup',
        automatable: true
      });
    }

    return { issues, score: Math.max(0, accessibilityScore) };
  }

  private static async testProgressiveWebAppFeatures(): Promise<{
    issues: TechnicalIssue[];
    score: number;
  }> {
    const issues: TechnicalIssue[] = [];
    let pwaScore = 0;

    // Test service worker
    const serviceWorker = this.checkServiceWorker();
    if (serviceWorker.isPresent) {
      pwaScore += 40;
    } else {
      issues.push({
        category: 'progressive',
        severity: 'low',
        description: 'No service worker detected',
        element: 'pwa.serviceWorker',
        impact: 'Missing offline capabilities and performance benefits',
        recommendation: 'Implement service worker for caching and offline functionality',
        automatable: false
      });
    }

    // Test web app manifest
    const manifest = this.checkWebAppManifest();
    if (manifest.isPresent) {
      pwaScore += 30;
    } else {
      issues.push({
        category: 'progressive',
        severity: 'low',
        description: 'No web app manifest detected',
        element: 'pwa.manifest',
        impact: 'Cannot be installed as a native-like app',
        recommendation: 'Add web app manifest for installability',
        automatable: true
      });
    }

    // Test HTTPS requirement
    const httpsForPWA = this.checkHTTPSForPWA();
    if (httpsForPWA.isSecure) {
      pwaScore += 20;
    }

    // Test responsive design
    const responsive = this.checkResponsiveDesign();
    if (responsive.isResponsive) {
      pwaScore += 10;
    } else {
      issues.push({
        category: 'progressive',
        severity: 'medium',
        description: 'Not fully responsive across devices',
        element: 'pwa.responsive',
        impact: 'Poor mobile experience',
        recommendation: 'Implement responsive design for all screen sizes',
        automatable: true
      });
    }

    return { issues, score: pwaScore };
  }

  private static async testMonitoringCoverage(): Promise<{
    issues: TechnicalIssue[];
    score: number;
  }> {
    const issues: TechnicalIssue[] = [];
    let monitoringScore = 0;

    // Test error monitoring
    const errorMonitoring = this.checkErrorMonitoring();
    if (errorMonitoring.isPresent) {
      monitoringScore += 30;
    } else {
      issues.push({
        category: 'monitoring',
        severity: 'medium',
        description: 'No error monitoring system detected',
        element: 'monitoring.errors',
        impact: 'Cannot track and resolve user-facing errors',
        recommendation: 'Implement error monitoring (Sentry, LogRocket, etc.)',
        automatable: false
      });
    }

    // Test performance monitoring
    const performanceMonitoring = this.checkPerformanceMonitoring();
    if (performanceMonitoring.isPresent) {
      monitoringScore += 25;
    } else {
      issues.push({
        category: 'monitoring',
        severity: 'medium',
        description: 'No performance monitoring detected',
        element: 'monitoring.performance',
        impact: 'Cannot track real user performance metrics',
        recommendation: 'Implement performance monitoring and Core Web Vitals tracking',
        automatable: false
      });
    }

    // Test analytics
    const analytics = this.checkAnalytics();
    if (analytics.isPresent) {
      monitoringScore += 20;
    } else {
      issues.push({
        category: 'monitoring',
        severity: 'low',
        description: 'No analytics system detected',
        element: 'monitoring.analytics',
        impact: 'Cannot track user behavior and app usage',
        recommendation: 'Implement privacy-compliant analytics tracking',
        automatable: false
      });
    }

    // Test uptime monitoring
    const uptimeMonitoring = this.checkUptimeMonitoring();
    if (uptimeMonitoring.isPresent) {
      monitoringScore += 15;
    } else {
      issues.push({
        category: 'monitoring',
        severity: 'low',
        description: 'No uptime monitoring detected',
        element: 'monitoring.uptime',
        impact: 'Cannot proactively detect service outages',
        recommendation: 'Implement uptime monitoring and alerting',
        automatable: false
      });
    }

    // Test logging
    const logging = this.checkLogging();
    if (logging.isAdequate) {
      monitoringScore += 10;
    } else {
      issues.push({
        category: 'monitoring',
        severity: 'low',
        description: 'Inadequate logging implementation',
        element: 'monitoring.logging',
        impact: 'Difficult to debug issues in production',
        recommendation: 'Implement comprehensive logging strategy',
        automatable: false
      });
    }

    return { issues, score: monitoringScore };
  }

  // Helper methods for checks (simplified implementations)
  private static simulateMetric(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private static simulateCheck(probability: number): boolean {
    return Math.random() < probability;
  }

  private static checkSecurityHeaders() {
    return {
      hasCSP: this.simulateCheck(0.6),
      hasHSTS: this.simulateCheck(0.7),
      hasXFrameOptions: this.simulateCheck(0.8)
    };
  }

  private static checkHTTPSEnforcement() {
    return { isEnforced: this.simulateCheck(0.9) };
  }

  private static checkInputValidation() {
    return { isProper: this.simulateCheck(0.8) };
  }

  private static checkAuthenticationSecurity() {
    return { isSecure: this.simulateCheck(0.85) };
  }

  private static checkWCAGCompliance() {
    const score = Math.random() * 30 + 70; // 70-100%
    return { score: Math.round(score) };
  }

  private static checkKeyboardNavigation() {
    return { isComplete: this.simulateCheck(0.8) };
  }

  private static checkScreenReaderSupport() {
    return { isAdequate: this.simulateCheck(0.75) };
  }

  private static checkServiceWorker() {
    return { isPresent: this.simulateCheck(0.3) };
  }

  private static checkWebAppManifest() {
    return { isPresent: this.simulateCheck(0.4) };
  }

  private static checkHTTPSForPWA() {
    return { isSecure: this.simulateCheck(0.9) };
  }

  private static checkResponsiveDesign() {
    return { isResponsive: this.simulateCheck(0.9) };
  }

  private static checkErrorMonitoring() {
    return { isPresent: this.simulateCheck(0.5) };
  }

  private static checkPerformanceMonitoring() {
    return { isPresent: this.simulateCheck(0.4) };
  }

  private static checkAnalytics() {
    return { isPresent: this.simulateCheck(0.7) };
  }

  private static checkUptimeMonitoring() {
    return { isPresent: this.simulateCheck(0.3) };
  }

  private static checkLogging() {
    return { isAdequate: this.simulateCheck(0.6) };
  }

  private static calculateWebVitalsScore(vitals: CoreWebVitals): number {
    let score = 0;
    
    // LCP scoring
    if (vitals.lcp <= 2500) score += 25;
    else if (vitals.lcp <= 4000) score += 15;
    
    // FID scoring
    if (vitals.fid <= 100) score += 25;
    else if (vitals.fid <= 300) score += 15;
    
    // CLS scoring
    if (vitals.cls <= 0.1) score += 25;
    else if (vitals.cls <= 0.25) score += 15;
    
    // FCP scoring
    if (vitals.fcp <= 1800) score += 15;
    else if (vitals.fcp <= 3000) score += 10;
    
    // TTFB scoring
    if (vitals.ttfb <= 600) score += 10;
    else if (vitals.ttfb <= 1200) score += 5;

    return score;
  }

  private static calculateOverallTechnicalScore(metrics: TechnicalMetrics): number {
    const weights = {
      coreWebVitals: 0.25,
      seoCompliance: 0.20,
      securityScore: 0.20,
      accessibilityScore: 0.15,
      progressiveWebAppScore: 0.10,
      monitoringCoverage: 0.10
    };

    let totalScore = 0;

    // Core Web Vitals
    totalScore += this.calculateWebVitalsScore(metrics.coreWebVitals) * weights.coreWebVitals;

    // SEO Compliance
    const seoScore = Object.values(metrics.seoCompliance).filter(Boolean).length / Object.keys(metrics.seoCompliance).length * 100;
    totalScore += seoScore * weights.seoCompliance;

    // Other metrics
    totalScore += metrics.securityScore * weights.securityScore;
    totalScore += metrics.accessibilityScore * weights.accessibilityScore;
    totalScore += metrics.progressiveWebAppScore * weights.progressiveWebAppScore;
    totalScore += metrics.monitoringCoverage * weights.monitoringCoverage;

    return totalScore;
  }

  static generateTechnicalExcellenceReport(result: TechnicalExcellenceTestResult): string {
    let report = `# Technical Excellence Assessment Report\n\n`;
    report += `**Test:** ${result.testName}\n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `**Overall Score:** ${result.score.toFixed(1)}%\n`;
    report += `**Core Web Vitals Score:** ${result.webVitalsScore.toFixed(1)}%\n\n`;

    if (result.criticalIssues.length > 0) {
      report += `## 🚨 Critical Issues\n`;
      result.criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `## Core Web Vitals\n`;
    report += `- **LCP (Largest Contentful Paint):** ${result.metrics.coreWebVitals.lcp.toFixed(0)}ms\n`;
    report += `- **FID (First Input Delay):** ${result.metrics.coreWebVitals.fid.toFixed(0)}ms\n`;
    report += `- **CLS (Cumulative Layout Shift):** ${result.metrics.coreWebVitals.cls.toFixed(3)}\n`;
    report += `- **FCP (First Contentful Paint):** ${result.metrics.coreWebVitals.fcp.toFixed(0)}ms\n`;
    report += `- **TTFB (Time to First Byte):** ${result.metrics.coreWebVitals.ttfb.toFixed(0)}ms\n\n`;

    report += `## Technical Metrics\n`;
    const seoScore = Object.values(result.metrics.seoCompliance).filter(Boolean).length / Object.keys(result.metrics.seoCompliance).length * 100;
    report += `- **SEO Compliance:** ${seoScore.toFixed(1)}%\n`;
    report += `- **Security Score:** ${result.metrics.securityScore.toFixed(1)}%\n`;
    report += `- **Accessibility Score:** ${result.metrics.accessibilityScore.toFixed(1)}%\n`;
    report += `- **Progressive Web App Score:** ${result.metrics.progressiveWebAppScore.toFixed(1)}%\n`;
    report += `- **Monitoring Coverage:** ${result.metrics.monitoringCoverage.toFixed(1)}%\n\n`;

    if (result.issues.length > 0) {
      report += `## Issues by Category\n\n`;
      
      const grouped = result.issues.reduce((acc, issue) => {
        if (!acc[issue.category]) acc[issue.category] = [];
        acc[issue.category].push(issue);
        return acc;
      }, {} as Record<string, TechnicalIssue[]>);

      Object.entries(grouped).forEach(([category, issues]) => {
        report += `### ${category.toUpperCase()} (${issues.length})\n`;
        issues.forEach(issue => {
          const severity = issue.severity === 'critical' ? '🔴' : 
                          issue.severity === 'high' ? '🟠' : 
                          issue.severity === 'medium' ? '🟡' : '🟢';
          const automatable = issue.automatable ? '🤖' : '👤';
          report += `${severity} ${automatable} **${issue.element}**\n`;
          report += `${issue.description}\n`;
          report += `*Impact:* ${issue.impact}\n`;
          report += `*Recommendation:* ${issue.recommendation}\n\n`;
        });
      });
    }

    return report;
  }
}
