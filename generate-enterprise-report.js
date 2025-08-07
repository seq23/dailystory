#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Enterprise Test Report Generator
 * Aggregates all test results into comprehensive reports
 */

class EnterpriseReportGenerator {
  constructor() {
    this.outputDir = './test-results';
    this.reportData = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: process.env.CI || false,
        branch: process.env.GITHUB_REF_NAME || 'unknown',
      },
      testSuites: [],
      metrics: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        coverage: {},
        performance: {},
      },
      qualityGates: {
        passed: true,
        reasons: [],
      },
    };
  }

  async generate() {
    console.log('🏢 Generating Enterprise Test Report...\n');
    
    try {
      await this.ensureOutputDirectory();
      await this.collectTestResults();
      await this.calculateMetrics();
      await this.evaluateQualityGates();
      await this.generateReports();
      
      console.log('✅ Enterprise report generated successfully!');
      console.log(`📊 Reports available in: ${this.outputDir}/`);
      
    } catch (error) {
      console.error('❌ Failed to generate enterprise report:', error.message);
      process.exit(1);
    }
  }

  async ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async collectTestResults() {
    console.log('📊 Collecting test results...');
    
    // Collect Vitest results
    await this.collectVitestResults();
    
    // Collect Playwright results
    await this.collectPlaywrightResults();
    
    // Collect coverage data
    await this.collectCoverageData();
    
    // Collect performance metrics
    await this.collectPerformanceMetrics();
  }

  async collectVitestResults() {
    try {
      // Check if Vitest results exist
      const vitestPaths = [
        './coverage/coverage-summary.json',
        './test-results/vitest-results.json'
      ];
      
      for (const vitestPath of vitestPaths) {
        if (fs.existsSync(vitestPath)) {
          const data = JSON.parse(fs.readFileSync(vitestPath, 'utf8'));
          this.reportData.testSuites.push({
            name: 'Vitest Unit Tests',
            type: 'unit',
            status: 'completed',
            results: data,
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not collect Vitest results:', error.message);
    }
  }

  async collectPlaywrightResults() {
    try {
      const playwrightPath = './playwright-report/results.json';
      if (fs.existsSync(playwrightPath)) {
        const data = JSON.parse(fs.readFileSync(playwrightPath, 'utf8'));
        this.reportData.testSuites.push({
          name: 'Playwright E2E Tests',
          type: 'e2e',
          status: 'completed',
          results: data,
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not collect Playwright results:', error.message);
    }
  }

  async collectCoverageData() {
    try {
      const coveragePath = './coverage/coverage-summary.json';
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        this.reportData.metrics.coverage = coverage.total || {};
      }
    } catch (error) {
      console.warn('⚠️ Could not collect coverage data:', error.message);
    }
  }

  async collectPerformanceMetrics() {
    try {
      // Simulate performance metrics collection
      this.reportData.metrics.performance = {
        bundleSize: await this.getBundleSize(),
        buildTime: await this.getBuildTime(),
        testExecutionTime: await this.getTestExecutionTime(),
      };
    } catch (error) {
      console.warn('⚠️ Could not collect performance metrics:', error.message);
    }
  }

  async getBundleSize() {
    try {
      const distPath = './dist';
      if (fs.existsSync(distPath)) {
        const stats = fs.statSync(distPath);
        return { size: stats.size, unit: 'bytes' };
      }
    } catch (error) {
      return { size: 0, unit: 'bytes' };
    }
  }

  async getBuildTime() {
    // This would be collected from actual build logs
    return { duration: 30000, unit: 'ms' };
  }

  async getTestExecutionTime() {
    // This would be collected from test execution logs
    return { duration: 45000, unit: 'ms' };
  }

  async calculateMetrics() {
    console.log('🧮 Calculating metrics...');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    
    for (const suite of this.reportData.testSuites) {
      // Parse test results from each suite
      // This would depend on the actual format of results
      totalTests += suite.results?.total || 0;
      passedTests += suite.results?.passed || 0;
      failedTests += suite.results?.failed || 0;
      skippedTests += suite.results?.skipped || 0;
    }
    
    this.reportData.metrics.totalTests = totalTests;
    this.reportData.metrics.passedTests = passedTests;
    this.reportData.metrics.failedTests = failedTests;
    this.reportData.metrics.skippedTests = skippedTests;
  }

  async evaluateQualityGates() {
    console.log('🚪 Evaluating quality gates...');
    
    const { metrics } = this.reportData;
    const gates = this.reportData.qualityGates;
    
    // Coverage gate (80% threshold)
    const coverageThreshold = 80;
    const coveragePercent = metrics.coverage.lines?.pct || 0;
    if (coveragePercent < coverageThreshold) {
      gates.passed = false;
      gates.reasons.push(`Coverage (${coveragePercent}%) below threshold (${coverageThreshold}%)`);
    }
    
    // Test success rate gate (95% threshold)
    const successRate = metrics.totalTests > 0 
      ? (metrics.passedTests / metrics.totalTests) * 100 
      : 0;
    if (successRate < 95) {
      gates.passed = false;
      gates.reasons.push(`Test success rate (${successRate.toFixed(1)}%) below 95%`);
    }
    
    // Performance gate
    const buildTimeThreshold = 60000; // 1 minute
    if (metrics.performance.buildTime?.duration > buildTimeThreshold) {
      gates.passed = false;
      gates.reasons.push(`Build time exceeds threshold`);
    }
  }

  async generateReports() {
    console.log('📋 Generating reports...');
    
    // Generate JSON report
    fs.writeFileSync(
      path.join(this.outputDir, 'enterprise-report.json'),
      JSON.stringify(this.reportData, null, 2)
    );
    
    // Generate HTML dashboard
    await this.generateHtmlDashboard();
    
    // Generate summary for CI
    await this.generateCISummary();
    
    // Generate quality gate report
    await this.generateQualityGateReport();
  }

  async generateHtmlDashboard() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            border-top: 4px solid #667eea;
        }
        .metric-value { 
            font-size: 2.5em; 
            font-weight: bold; 
            margin-bottom: 10px;
        }
        .metric-label { 
            color: #666; 
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .quality-gate { 
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .quality-gate.passed { border-left: 6px solid #10b981; }
        .quality-gate.failed { border-left: 6px solid #ef4444; }
        .chart-container { 
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .test-suites { 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .suite-header { 
            background: #f8fafc;
            padding: 15px 25px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
        }
        .suite-item { 
            padding: 20px 25px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .badge { 
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.success { background: #dcfce7; color: #16a34a; }
        .badge.error { background: #fef2f2; color: #dc2626; }
        .badge.warning { background: #fef3c7; color: #d97706; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Enterprise Test Dashboard</h1>
            <p>Generated: ${this.reportData.timestamp}</p>
            <p>Environment: ${this.reportData.environment.platform} | Node ${this.reportData.environment.node}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value success">${this.reportData.metrics.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value success">${this.reportData.metrics.passedTests}</div>
                <div class="metric-label">Passed Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${this.reportData.metrics.failedTests > 0 ? 'error' : 'success'}">${this.reportData.metrics.failedTests}</div>
                <div class="metric-label">Failed Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round((this.reportData.metrics.coverage.lines?.pct || 0))}%</div>
                <div class="metric-label">Code Coverage</div>
            </div>
        </div>

        <div class="quality-gate ${this.reportData.qualityGates.passed ? 'passed' : 'failed'}">
            <h2>🚪 Quality Gate: ${this.reportData.qualityGates.passed ? '✅ PASSED' : '❌ FAILED'}</h2>
            ${this.reportData.qualityGates.reasons.length > 0 ? 
                '<ul>' + this.reportData.qualityGates.reasons.map(reason => `<li>${reason}</li>`).join('') + '</ul>' 
                : '<p>All quality criteria met!</p>'
            }
        </div>

        <div class="chart-container">
            <h2>📊 Test Results Overview</h2>
            <canvas id="testChart" width="400" height="200"></canvas>
        </div>

        <div class="test-suites">
            <div class="suite-header">Test Suites</div>
            ${this.reportData.testSuites.map(suite => `
                <div class="suite-item">
                    <div>
                        <strong>${suite.name}</strong>
                        <div style="color: #666; font-size: 0.9em;">${suite.type} tests</div>
                    </div>
                    <span class="badge ${suite.status === 'completed' ? 'success' : 'warning'}">${suite.status}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        const ctx = document.getElementById('testChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [${this.reportData.metrics.passedTests}, ${this.reportData.metrics.failedTests}, ${this.reportData.metrics.skippedTests}],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(this.outputDir, 'enterprise-dashboard.html'),
      html
    );
  }

  async generateCISummary() {
    const summary = {
      status: this.reportData.qualityGates.passed ? 'passed' : 'failed',
      totalTests: this.reportData.metrics.totalTests,
      passedTests: this.reportData.metrics.passedTests,
      failedTests: this.reportData.metrics.failedTests,
      coverage: Math.round(this.reportData.metrics.coverage.lines?.pct || 0),
      timestamp: this.reportData.timestamp,
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'ci-summary.json'),
      JSON.stringify(summary, null, 2)
    );
  }

  async generateQualityGateReport() {
    const report = `
# Quality Gate Report

**Status:** ${this.reportData.qualityGates.passed ? '✅ PASSED' : '❌ FAILED'}

## Metrics
- **Total Tests:** ${this.reportData.metrics.totalTests}
- **Success Rate:** ${this.reportData.metrics.totalTests > 0 ? ((this.reportData.metrics.passedTests / this.reportData.metrics.totalTests) * 100).toFixed(1) : 0}%
- **Coverage:** ${Math.round(this.reportData.metrics.coverage.lines?.pct || 0)}%

## Issues
${this.reportData.qualityGates.reasons.length > 0 
  ? this.reportData.qualityGates.reasons.map(reason => `- ${reason}`).join('\n')
  : 'No issues detected!'
}

---
Generated: ${this.reportData.timestamp}
`;

    fs.writeFileSync(
      path.join(this.outputDir, 'quality-gate-report.md'),
      report
    );
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new EnterpriseReportGenerator();
  generator.generate();
}

export default EnterpriseReportGenerator;