// Immediate execution of comprehensive tests
import { ComprehensiveTestSuite } from './testing/ComprehensiveTestSuite';
import { AutomatedFixImplementer } from './testing/AutomatedFixImplementer';

console.log('🚀 Executing Comprehensive Test Suite...');

async function runTestsNow() {
  try {
    // Step 1: Run comprehensive tests
    console.log('📊 Running full test suite...');
    const testSuite = new ComprehensiveTestSuite();
    const testResults = await testSuite.runFullTestSuite();
    
    console.log(`✅ Tests completed: ${testResults.overall.successRate}% success rate`);
    console.log(`⚠️ Issues found: ${testResults.overall.failed}`);
    
    // Step 2: Apply automated fixes
    console.log('🔧 Applying automated fixes...');
    const fixer = new AutomatedFixImplementer();
    const fixResults = await fixer.runComprehensiveTestsAndFix();
    
    console.log(`✅ Fixes applied: ${fixResults.summary.fixesApplied}`);
    console.log(`❌ Remaining issues: ${fixResults.summary.remainingIssues}`);
    
    // Log detailed results
    console.log('\n📋 Test Categories:');
    Object.entries(testResults.categories).forEach(([name, category]) => {
      const status = category.successRate >= 80 ? '✅' : '❌';
      console.log(`${status} ${name}: ${category.successRate}%`);
    });
    
    if (testResults.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      testResults.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Execute immediately
runTestsNow();