// Test Runner for Development Environment
import { ComprehensiveTestSuite } from './ComprehensiveTestSuite';
import { AutomatedFixImplementer } from './AutomatedFixImplementer';

export class TestRunner {
  static async runQuickDiagnostic(): Promise<void> {
    console.log('🔍 Running Quick Diagnostic Tests...\n');

    try {
      // Run basic tests to identify critical issues
      const testSuite = new ComprehensiveTestSuite();
      const results = await testSuite.runFullTestSuite();

      console.log('\n📊 Quick Diagnostic Results:');
      console.log(`Overall Success Rate: ${results.overall.successRate}%`);
      console.log(`Total Issues Found: ${results.overall.failed}`);
      
      // Display category results
      console.log('\n📋 Category Breakdown:');
      Object.values(results.categories).forEach(category => {
        const status = category.successRate >= 80 ? '✅' : '❌';
        console.log(`${status} ${category.name}: ${category.successRate}%`);
      });

      // Show critical issues
      if (results.issues.length > 0) {
        console.log('\n⚠️ Critical Issues Found:');
        results.issues
          .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
          .slice(0, 5)
          .forEach(issue => {
            console.log(`🔥 ${issue.title}: ${issue.description}`);
          });
      }

      // Show recommendations
      if (results.recommendations.length > 0) {
        console.log('\n💡 Top Recommendations:');
        results.recommendations.slice(0, 3).forEach(rec => {
          console.log(`📌 ${rec}`);
        });
      }

    } catch (error) {
      console.error('❌ Diagnostic test failed:', error);
    }
  }

  static async runTestsAndApplyFixes(): Promise<void> {
    console.log('🚀 Running Comprehensive Tests and Applying Automated Fixes...\n');

    try {
      const fixer = new AutomatedFixImplementer();
      const results = await fixer.runComprehensiveTestsAndFix();

      console.log('\n🎯 Comprehensive Fix Results:');
      console.log(`✅ Tests Run: ${results.summary.testsRun}`);
      console.log(`⚠️ Issues Found: ${results.summary.issuesFound}`);
      console.log(`🔧 Fixes Applied: ${results.summary.fixesApplied}`);
      console.log(`❌ Remaining Issues: ${results.summary.remainingIssues}`);

      // Show successful fixes
      const successfulFixes = results.fixResults.filter(f => f.success);
      if (successfulFixes.length > 0) {
        console.log('\n✅ Successfully Applied Fixes:');
        successfulFixes.forEach(fix => {
          console.log(`  ✓ ${fix.fix}`);
        });
      }

      // Show failed fixes
      const failedFixes = results.fixResults.filter(f => !f.success);
      if (failedFixes.length > 0) {
        console.log('\n❌ Failed Fixes (Require Manual Intervention):');
        failedFixes.forEach(fix => {
          console.log(`  ✗ ${fix.fix}: ${fix.error}`);
        });
      }

    } catch (error) {
      console.error('❌ Comprehensive test and fix failed:', error);
    }
  }

  static async runSpecificCategoryTest(category: string): Promise<void> {
    console.log(`🔍 Running ${category} Tests...\n`);

    try {
      const testSuite = new ComprehensiveTestSuite();
      const results = await testSuite.runFullTestSuite();
      
      const categoryResult = results.categories[category as keyof typeof results.categories];
      if (categoryResult) {
        console.log(`📊 ${category} Test Results:`);
        console.log(`Success Rate: ${categoryResult.successRate}%`);
        console.log(`Passed: ${categoryResult.passed}, Failed: ${categoryResult.failed}`);
        console.log(`Duration: ${categoryResult.duration}ms`);
        
        if (categoryResult.details && categoryResult.details.length > 0) {
          console.log('\n📋 Detailed Results:');
          categoryResult.details.forEach((detail, index) => {
            console.log(`${index + 1}. ${JSON.stringify(detail, null, 2)}`);
          });
        }
      } else {
        console.log(`❌ Category '${category}' not found`);
      }

    } catch (error) {
      console.error(`❌ ${category} test failed:`, error);
    }
  }
}

// Export functions for global access
if (typeof window !== 'undefined') {
  (window as any).runQuickDiagnostic = TestRunner.runQuickDiagnostic;
  (window as any).runTestsAndApplyFixes = TestRunner.runTestsAndApplyFixes;
  (window as any).runCategoryTest = TestRunner.runSpecificCategoryTest;
  
  console.log('🧪 Test Runner Functions Available:');
  console.log('  runQuickDiagnostic() - Quick health check');
  console.log('  runTestsAndApplyFixes() - Full test suite with automated fixes');
  console.log('  runCategoryTest(category) - Test specific category');
}