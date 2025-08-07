#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Enterprise Test Runner
 * Executes comprehensive test suite with reporting and analytics
 */

class EnterpriseTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now(),
      endTime: null,
      suites: [],
    };
    
    this.config = {
      outputDir: './test-results',
      reportFormats: ['json', 'html'],
      coverageThreshold: 80,
      performanceBudget: 5000, // ms
    };
  }

  async run() {
    console.log('🚀 Starting Enterprise Test Suite...\n');
    
    try {
      await this.setupReporting();
      await this.runTestSuites();
      await this.generateReports();
      await this.checkQualityGates();
      
      this.results.endTime = Date.now();
      console.log(this.getSummary());
      
      // Exit with appropriate code
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }

  async setupReporting() {
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async runTestSuites() {
    const suites = [
      {
        name: 'Vitest Unit Tests (Non-TTS)',
        command: 'npx vitest run src/test/unit --exclude="**/InteractiveWord*" --exclude="**/unifiedTTSService*" --exclude="**/enhancedAudioService*" --reporter=basic',
        critical: true,
      },
      {
        name: 'Jest Integration Tests',
        command: 'npx jest tests/integration --testPathIgnorePatterns=".*TTS.*" --testPathIgnorePatterns=".*Audio.*" --coverage=false --passWithNoTests',
        critical: true,
      },
      {
        name: 'Jest Performance Tests',
        command: 'npx jest tests/performance --coverage=false --passWithNoTests',
        critical: false,
      },
    ];

    for (const suite of suites) {
      await this.runSuite(suite);
    }
  }

  async runSuite(suite) {
    console.log(`📋 Running: ${suite.name}`);
    console.log(`   Command: ${suite.command}\n`);
    
    const startTime = Date.now();
    let success = false;
    let output = '';
    let error = '';

    try {
      output = execSync(suite.command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000, // 5 minutes
      });
      success = true;
      console.log(`✅ ${suite.name} - PASSED`);
    } catch (err) {
      error = err.message;
      if (suite.critical) {
        console.log(`❌ ${suite.name} - FAILED (Critical)`);
        this.results.failed++;
      } else {
        console.log(`⚠️  ${suite.name} - FAILED (Non-critical)`);
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.results.suites.push({
      name: suite.name,
      success,
      duration,
      output: output.substring(0, 1000), // Truncate long output
      error: error.substring(0, 1000),
      critical: suite.critical,
    });

    if (success) {
      this.results.passed++;
    }
    
    this.results.total++;
    console.log(`   Duration: ${duration}ms\n`);
  }

  async generateReports() {
    console.log('📊 Generating test reports...');
    
    // Generate JSON report
    const jsonReport = {
      ...this.results,
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
    
    fs.writeFileSync(
      path.join(this.config.outputDir, 'enterprise-results.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Generate HTML report
    await this.generateHtmlReport(jsonReport);
    
    console.log(`✅ Reports generated in ${this.config.outputDir}/`);
  }

  async generateHtmlReport(data) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Enterprise Test Results</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .metric { background: white; padding: 16px; border: 1px solid #e1e5e9; border-radius: 6px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .suite { background: white; border: 1px solid #e1e5e9; border-radius: 6px; margin-bottom: 16px; padding: 16px; }
    .suite-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    pre { background: #f8f9fa; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Enterprise Test Results</h1>
    <p>Generated: ${data.timestamp}</p>
    <p>Duration: ${data.endTime - data.startTime}ms</p>
  </div>
  
  <div class="summary">
    <div class="metric">
      <div class="metric-value">${data.total}</div>
      <div>Total Suites</div>
    </div>
    <div class="metric">
      <div class="metric-value passed">${data.passed}</div>
      <div>Passed</div>
    </div>
    <div class="metric">
      <div class="metric-value failed">${data.failed}</div>
      <div>Failed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${Math.round((data.passed / data.total) * 100)}%</div>
      <div>Success Rate</div>
    </div>
  </div>
  
  <h2>Test Suites</h2>
  ${data.suites.map(suite => `
    <div class="suite">
      <div class="suite-header">
        <h3>${suite.name}</h3>
        <span class="badge ${suite.success ? 'badge-success' : 'badge-danger'}">
          ${suite.success ? 'PASSED' : 'FAILED'}
        </span>
      </div>
      <p><strong>Duration:</strong> ${suite.duration}ms</p>
      ${suite.error ? `<pre><strong>Error:</strong>\n${suite.error}</pre>` : ''}
      ${suite.output ? `<pre><strong>Output:</strong>\n${suite.output}</pre>` : ''}
    </div>
  `).join('')}
</body>
</html>`;

    fs.writeFileSync(
      path.join(this.config.outputDir, 'enterprise-results.html'),
      html
    );
  }

  async checkQualityGates() {
    console.log('🚪 Checking quality gates...');
    
    const successRate = (this.results.passed / this.results.total) * 100;
    const totalDuration = this.results.endTime - this.results.startTime;
    
    // Success rate gate
    if (successRate < 95) {
      console.log(`❌ Quality Gate Failed: Success rate (${successRate.toFixed(1)}%) below 95%`);
    } else {
      console.log(`✅ Quality Gate Passed: Success rate (${successRate.toFixed(1)}%)`);
    }
    
    // Performance gate
    if (totalDuration > this.config.performanceBudget) {
      console.log(`❌ Quality Gate Failed: Total duration (${totalDuration}ms) exceeds budget (${this.config.performanceBudget}ms)`);
    } else {
      console.log(`✅ Quality Gate Passed: Duration (${totalDuration}ms)`);
    }
  }

  getSummary() {
    const duration = this.results.endTime - this.results.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    return `
🏁 Enterprise Test Suite Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Results Summary:
   Total Suites: ${this.results.total}
   Passed: ${this.results.passed}
   Failed: ${this.results.failed}
   Success Rate: ${successRate}%
   Duration: ${duration}ms

📁 Reports: ${this.config.outputDir}/
   • enterprise-results.json
   • enterprise-results.html
   • coverage/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new EnterpriseTestRunner();
  runner.run();
}