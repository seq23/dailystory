// Test Reporter Utility
import type { TestSuiteResult, TestCategoryResult, TestIssue } from '../ComprehensiveTestSuite';

export class TestReporter {
  generateComprehensiveReport(results: TestSuiteResult): string {
    const lines: string[] = [];
    
    // Header
    lines.push('🧪 COMPREHENSIVE TEST SUITE REPORT');
    lines.push('=' .repeat(50));
    lines.push('');
    
    // Executive Summary
    lines.push('📊 EXECUTIVE SUMMARY');
    lines.push('-' .repeat(20));
    lines.push(`Overall Success Rate: ${results.overall.successRate}%`);
    lines.push(`Tests Passed: ${results.overall.passed}/${results.overall.total}`);
    lines.push(`Total Duration: ${this.formatDuration(results.overall.duration)}`);
    lines.push('');
    
    // Category Breakdown
    lines.push('📋 CATEGORY BREAKDOWN');
    lines.push('-' .repeat(25));
    
    Object.values(results.categories).forEach(category => {
      const status = category.successRate >= 90 ? '✅' : 
                    category.successRate >= 70 ? '⚠️' : '❌';
      
      lines.push(`${status} ${category.name}:`);
      lines.push(`   Success Rate: ${category.successRate}% (${category.passed}/${category.total})`);
      lines.push(`   Duration: ${this.formatDuration(category.duration)}`);
      lines.push('');
    });
    
    // Detailed Results
    lines.push('🔍 DETAILED RESULTS');
    lines.push('-' .repeat(20));
    
    Object.values(results.categories).forEach(category => {
      if (category.failed > 0) {
        lines.push(`\n❌ ${category.name} Issues:`);
        // Show failed test details if available
        if (category.details && Array.isArray(category.details)) {
          category.details
            .filter((detail: any) => !detail.passed)
            .slice(0, 5) // Limit to first 5 issues
            .forEach((detail: any) => {
              lines.push(`   • ${detail.testCase || detail.testName || 'Unknown test'}: ${detail.details || detail.validationResult || 'No details'}`);
            });
          
          if (category.details.filter((detail: any) => !detail.passed).length > 5) {
            lines.push(`   ... and ${category.details.filter((detail: any) => !detail.passed).length - 5} more issues`);
          }
        }
      }
    });
    
    // Performance Insights
    lines.push('\n⚡ PERFORMANCE INSIGHTS');
    lines.push('-' .repeat(22));
    
    const performanceCategory = results.categories.performance;
    if (performanceCategory && performanceCategory.details) {
      const slowTests = performanceCategory.details
        .filter((test: any) => !test.passed && test.category !== 'memory')
        .sort((a: any, b: any) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 3);
      
      if (slowTests.length > 0) {
        lines.push('Slowest operations:');
        slowTests.forEach((test: any) => {
          lines.push(`   • ${test.testName}: ${test.duration}ms (threshold: ${test.threshold}ms)`);
        });
      } else {
        lines.push('✅ All performance tests within thresholds');
      }
    }
    
    // Security Summary
    lines.push('\n🔒 SECURITY SUMMARY');
    lines.push('-' .repeat(18));
    
    const securityCategory = results.categories.security;
    if (securityCategory.successRate >= 95) {
      lines.push('✅ Security tests passed - no critical vulnerabilities detected');
    } else if (securityCategory.successRate >= 80) {
      lines.push('⚠️ Some security concerns detected - review recommended');
    } else {
      lines.push('❌ Critical security issues detected - immediate action required');
    }
    
    // Mobile UX Summary
    lines.push('\n📱 MOBILE UX SUMMARY');
    lines.push('-' .repeat(19));
    
    const mobileCategory = results.categories.mobile;
    if (mobileCategory.successRate >= 85) {
      lines.push('✅ Mobile experience optimized');
    } else if (mobileCategory.successRate >= 70) {
      lines.push('⚠️ Some mobile usability improvements needed');
    } else {
      lines.push('❌ Significant mobile usability issues detected');
    }
    
    // Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      lines.push('\n💡 RECOMMENDATIONS');
      lines.push('-' .repeat(17));
      
      results.recommendations.forEach(recommendation => {
        lines.push(`• ${recommendation}`);
      });
    }
    
    // Priority Actions
    lines.push('\n🎯 PRIORITY ACTIONS');
    lines.push('-' .repeat(18));
    
    const priorities = this.generatePriorityActions(results);
    priorities.forEach(priority => {
      lines.push(`${priority.level} ${priority.action}`);
    });
    
    // Footer
    lines.push('\n' + '=' .repeat(50));
    lines.push(`Report generated: ${new Date().toLocaleString()}`);
    lines.push('🧪 Comprehensive Test Suite v1.0');
    
    return lines.join('\n');
  }

  generateShortReport(results: TestSuiteResult): string {
    const status = results.overall.successRate >= 85 ? '✅ PASSED' : 
                  results.overall.successRate >= 70 ? '⚠️ WARNING' : '❌ FAILED';
    
    return `${status} Test Suite: ${results.overall.successRate}% (${results.overall.passed}/${results.overall.total}) in ${this.formatDuration(results.overall.duration)}`;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private generatePriorityActions(results: TestSuiteResult): Array<{level: string; action: string}> {
    const actions: Array<{level: string; action: string}> = [];
    
    // Critical issues (below 70%)
    Object.values(results.categories).forEach(category => {
      if (category.successRate < 70) {
        actions.push({
          level: '🚨 CRITICAL:',
          action: `Fix ${category.name} issues immediately (${category.successRate}% success rate)`
        });
      }
    });
    
    // High priority issues (70-85%)
    Object.values(results.categories).forEach(category => {
      if (category.successRate >= 70 && category.successRate < 85) {
        actions.push({
          level: '⚠️ HIGH:',
          action: `Improve ${category.name} reliability (${category.successRate}% success rate)`
        });
      }
    });
    
    // Medium priority (85-95%)
    Object.values(results.categories).forEach(category => {
      if (category.successRate >= 85 && category.successRate < 95) {
        actions.push({
          level: '📋 MEDIUM:',
          action: `Optimize ${category.name} for better performance`
        });
      }
    });
    
    // If no specific issues, provide general recommendations
    if (actions.length === 0) {
      actions.push({
        level: '✅ LOW:',
        action: 'Continue monitoring and maintain current quality standards'
      });
    }
    
    return actions.slice(0, 5); // Limit to top 5 priorities
  }

  exportResultsAsJSON(results: TestSuiteResult): string {
    return JSON.stringify(results, null, 2);
  }

  exportResultsAsCSV(results: TestSuiteResult): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Category,Test Name,Passed,Duration,Details');
    
    // Data rows
    Object.values(results.categories).forEach(category => {
      if (category.details && Array.isArray(category.details)) {
        category.details.forEach((detail: any) => {
          const testName = detail.testCase || detail.testName || 'Unknown';
          const passed = detail.passed ? 'PASS' : 'FAIL';
          const duration = detail.duration || 0;
          const details = (detail.details || detail.validationResult || '').replace(/,/g, ';');
          
          lines.push(`${category.name},"${testName}",${passed},${duration},"${details}"`);
        });
      }
    });
    
    return lines.join('\n');
  }
}