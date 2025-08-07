interface CITestConfig {
  environment: string;
  browser: string;
  parallelWorkers: number;
  timeoutMs: number;
  retryCount: number;
  enableAnalytics: boolean;
  wcagLevel: 'AA' | 'AAA';
  includeLoadTesting: boolean;
  qualityGateThreshold: number;
}

interface CITestResult {
  success: boolean;
  successRate: number;
  totalTests: number;
  duration: number;
  qualityGatePassed: boolean;
  reportPath: string;
  artifacts: string[];
  summary: string;
}

export class CIIntegrationHelper {
  private static readonly DEFAULT_CONFIG: CITestConfig = {
    environment: 'ci',
    browser: 'chrome',
    parallelWorkers: 4,
    timeoutMs: 300000, // 5 minutes
    retryCount: 2,
    enableAnalytics: true,
    wcagLevel: 'AA',
    includeLoadTesting: false, // Disabled by default in CI
    qualityGateThreshold: 85
  };

  static parseEnvironmentConfig(): CITestConfig {
    const config = { ...this.DEFAULT_CONFIG };

    // Parse environment variables
    if (process.env.CI_ENVIRONMENT) {
      config.environment = process.env.CI_ENVIRONMENT;
    }

    if (process.env.BROWSER) {
      config.browser = process.env.BROWSER;
    }

    if (process.env.PARALLEL_WORKERS) {
      config.parallelWorkers = parseInt(process.env.PARALLEL_WORKERS, 10);
    }

    if (process.env.TEST_TIMEOUT) {
      config.timeoutMs = parseInt(process.env.TEST_TIMEOUT, 10);
    }

    if (process.env.RETRY_COUNT) {
      config.retryCount = parseInt(process.env.RETRY_COUNT, 10);
    }

    if (process.env.WCAG_LEVEL) {
      config.wcagLevel = process.env.WCAG_LEVEL as 'AA' | 'AAA';
    }

    if (process.env.INCLUDE_LOAD_TESTING === 'true') {
      config.includeLoadTesting = true;
    }

    if (process.env.QUALITY_GATE_THRESHOLD) {
      config.qualityGateThreshold = parseFloat(process.env.QUALITY_GATE_THRESHOLD);
    }

    if (process.env.DISABLE_ANALYTICS === 'true') {
      config.enableAnalytics = false;
    }

    return config;
  }

  static async runTestsForCI(): Promise<CITestResult> {
    const config = this.parseEnvironmentConfig();
    const startTime = Date.now();

    console.log('🚀 Starting CI Test Execution');
    console.log('Configuration:', JSON.stringify(config, null, 2));

    try {
      // Dynamic import to avoid issues in environments where the testing modules aren't available
      const { ComprehensiveTestSuite } = await import('../ComprehensiveTestSuite');
      
      const testSuite = new ComprehensiveTestSuite();
      
      // Configure test timeouts
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Test execution timed out after ${config.timeoutMs}ms`));
        }, config.timeoutMs);
      });

      const testPromise = testSuite.runFullTestSuite();

      const results = await Promise.race([testPromise, timeoutPromise]);
      
      const duration = Date.now() - startTime;
      const successRate = ((results as any).passed / (results as any).total) * 100;
      const qualityGatePassed = successRate >= config.qualityGateThreshold;

      // Generate CI-specific reports
      const reportPath = await this.generateCIReport(results, config);
      const artifacts = await this.collectArtifacts(results);

      const summary = this.generateSummary(results, qualityGatePassed, duration);

      console.log('📊 CI Test Execution Summary:');
      console.log(summary);

      if (!qualityGatePassed) {
        console.error(`❌ Quality gate failed: ${successRate.toFixed(1)}% < ${config.qualityGateThreshold}%`);
      }

      return {
        success: qualityGatePassed,
        successRate,
        totalTests: results.total,
        duration,
        qualityGatePassed,
        reportPath,
        artifacts,
        summary
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ CI Test Execution Failed:', errorMessage);

      return {
        success: false,
        successRate: 0,
        totalTests: 0,
        duration,
        qualityGatePassed: false,
        reportPath: '',
        artifacts: [],
        summary: `Test execution failed: ${errorMessage}`
      };
    }
  }

  private static async generateCIReport(results: any, config: CITestConfig): Promise<string> {
    const reportDir = 'test-results';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `${reportDir}/ci-report-${timestamp}.json`;

    // Ensure directory exists
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const report = {
        timestamp: new Date().toISOString(),
        environment: config.environment,
        browser: config.browser,
        wcagLevel: config.wcagLevel,
        qualityGateThreshold: config.qualityGateThreshold,
        results: {
          successRate: (results.passed / results.total) * 100,
          totalTests: results.total,
          passed: results.passed,
          failed: results.failed,
          duration: results.duration,
          categories: results.categories
        },
        qualityGate: {
          passed: (results.passed / results.total) * 100 >= config.qualityGateThreshold,
          threshold: config.qualityGateThreshold,
          actualSuccessRate: (results.passed / results.total) * 100
        },
        recommendations: results.recommendations
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Also generate a summary for CI systems
      const summaryPath = `${reportDir}/summary.json`;
      const summary = {
        success: report.qualityGate.passed,
        successRate: report.results.successRate,
        totalTests: report.results.totalTests,
        duration: report.results.duration,
        timestamp: report.timestamp
      };

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    }

    return reportPath;
  }

  private static async collectArtifacts(results: any): Promise<string[]> {
    const artifacts: string[] = [];

    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');

        // Create artifacts directory
        const artifactsDir = 'test-results/artifacts';
        if (!fs.existsSync(artifactsDir)) {
          fs.mkdirSync(artifactsDir, { recursive: true });
        }

        // Save detailed test results
        const detailedResultsPath = path.join(artifactsDir, 'detailed-results.json');
        fs.writeFileSync(detailedResultsPath, JSON.stringify(results, null, 2));
        artifacts.push(detailedResultsPath);

        // Generate category breakdown
        const categoryBreakdownPath = path.join(artifactsDir, 'category-breakdown.json');
        const categoryBreakdown = Object.entries(results.categories).map(([name, data]) => ({
          category: name,
          passed: (data as any).passed,
          failed: (data as any).failed,
          total: (data as any).total,
          successRate: ((data as any).passed / (data as any).total) * 100
        }));
        fs.writeFileSync(categoryBreakdownPath, JSON.stringify(categoryBreakdown, null, 2));
        artifacts.push(categoryBreakdownPath);

        // Save failure details
        const failures = this.extractFailures(results);
        if (failures.length > 0) {
          const failuresPath = path.join(artifactsDir, 'failures.json');
          fs.writeFileSync(failuresPath, JSON.stringify(failures, null, 2));
          artifacts.push(failuresPath);
        }
      }
    } catch (error) {
      console.warn('Failed to collect artifacts:', error);
    }

    return artifacts;
  }

  private static extractFailures(results: any): any[] {
    const failures: any[] = [];

    for (const [categoryName, categoryData] of Object.entries(results.categories)) {
      const category = categoryData as any;
      if (category.details) {
        for (const detail of category.details) {
          if (!detail.passed) {
            failures.push({
              category: categoryName,
              testName: detail.testName,
              duration: detail.duration,
              details: detail.details,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }

    return failures;
  }

  private static generateSummary(results: any, qualityGatePassed: boolean, duration: number): string {
    const successRate = (results.passed / results.total) * 100;
    
    let summary = `Test Execution Summary:\n`;
    summary += `- Success Rate: ${successRate.toFixed(1)}%\n`;
    summary += `- Total Tests: ${results.total}\n`;
    summary += `- Passed: ${results.passed}\n`;
    summary += `- Failed: ${results.failed}\n`;
    summary += `- Duration: ${Math.round(duration / 1000)}s\n`;
    summary += `- Quality Gate: ${qualityGatePassed ? 'PASSED' : 'FAILED'}\n`;

    if (results.categories) {
      summary += `\nCategory Breakdown:\n`;
      for (const [name, data] of Object.entries(results.categories)) {
        const category = data as any;
        const categorySuccessRate = (category.passed / category.total) * 100;
        summary += `- ${name}: ${categorySuccessRate.toFixed(1)}% (${category.passed}/${category.total})\n`;
      }
    }

    return summary;
  }

  static generateGitHubActionsOutput(result: CITestResult): void {
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=success::${result.success}`);
      console.log(`::set-output name=success-rate::${result.successRate}`);
      console.log(`::set-output name=total-tests::${result.totalTests}`);
      console.log(`::set-output name=duration::${result.duration}`);
      console.log(`::set-output name=quality-gate-passed::${result.qualityGatePassed}`);
      console.log(`::set-output name=report-path::${result.reportPath}`);

      if (!result.qualityGatePassed) {
        console.log(`::error title=Quality Gate Failed::Success rate ${result.successRate.toFixed(1)}% is below threshold`);
      }
    }
  }

  static generateJUnitXML(results: any): string {
    const timestamp = new Date().toISOString();
    const totalDuration = results.duration / 1000; // Convert to seconds

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testsuites name="Comprehensive Test Suite" tests="${results.total}" failures="${results.failed}" time="${totalDuration}" timestamp="${timestamp}">\n`;

    for (const [categoryName, categoryData] of Object.entries(results.categories)) {
      const category = categoryData as any;
      const categoryDuration = (category.details?.reduce((sum: number, detail: any) => sum + detail.duration, 0) || 0) / 1000;

      xml += `  <testsuite name="${categoryName}" tests="${category.total}" failures="${category.failed}" time="${categoryDuration}">\n`;

      if (category.details) {
        for (const detail of category.details) {
          const testDuration = detail.duration / 1000;
          xml += `    <testcase name="${detail.testName}" time="${testDuration}"`;
          
          if (detail.passed) {
            xml += ` />\n`;
          } else {
            xml += `>\n`;
            xml += `      <failure message="Test failed">${this.escapeXML(detail.details)}</failure>\n`;
            xml += `    </testcase>\n`;
          }
        }
      }

      xml += `  </testsuite>\n`;
    }

    xml += `</testsuites>\n`;
    return xml;
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Export function for CLI usage
export const runCITests = async (): Promise<void> => {
  const result = await CIIntegrationHelper.runTestsForCI();
  
  // Generate GitHub Actions outputs
  CIIntegrationHelper.generateGitHubActionsOutput(result);
  
  // Exit with appropriate code
  process.exit(result.qualityGatePassed ? 0 : 1);
};

// Make available globally for CI scripts
if (typeof global !== 'undefined') {
  (global as any).runCITests = runCITests;
}