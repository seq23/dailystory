import { ComprehensiveQualityTester } from "./comprehensiveQualityTest";

/**
 * Executes comprehensive quality verification and logs results
 */
export async function runComprehensiveQualityVerification(): Promise<void> {
  console.log("🚀 STARTING COMPREHENSIVE QUALITY VERIFICATION");
  console.log("=" .repeat(60));
  
  try {
    const report = await ComprehensiveQualityTester.runComprehensiveTest();
    
    console.log("📊 COMPREHENSIVE QUALITY TEST RESULTS");
    console.log("=" .repeat(60));
    console.log(`Overall Status: ${report.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests}`);
    console.log(`Failed: ${report.failedTests}`);
    console.log("");
    
    // Log individual test results
    report.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${result.testName}`);
      console.log(`   Details: ${result.details}`);
      if (result.actualValue !== undefined) {
        console.log(`   Actual: ${JSON.stringify(result.actualValue)}`);
      }
      if (result.expectedValue !== undefined) {
        console.log(`   Expected: ${JSON.stringify(result.expectedValue)}`);
      }
      console.log("");
    });
    
    // Log summary
    console.log("📋 SUMMARY");
    console.log("-" .repeat(30));
    report.summary.forEach(line => console.log(line));
    
    if (!report.overallPassed) {
      console.log("");
      console.log("🚨 CRITICAL ISSUES DETECTED:");
      report.results.filter(r => !r.passed).forEach(result => {
        console.log(`   ❌ ${result.testName}: ${result.details}`);
      });
    }
    
    console.log("");
    console.log("=" .repeat(60));
    console.log("COMPREHENSIVE QUALITY VERIFICATION COMPLETE");
    
  } catch (error) {
    console.error("❌ Failed to run comprehensive quality verification:", error);
    throw error;
  }
}

// Auto-run verification if this file is executed directly
if (typeof window !== 'undefined' && (window as any).runQualityVerification) {
  runComprehensiveQualityVerification().catch(console.error);
}