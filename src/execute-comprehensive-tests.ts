// Direct test execution to capture results for display
console.log('🚀 EXECUTING COMPREHENSIVE TESTS FOR USER DISPLAY');
console.log('=' .repeat(70));

// Store results for later display
const testResults: any = {};

// Execute tests and capture results
(async () => {
  try {
    // 1. Mobile Test
    console.log('📱 Running Mobile Interaction Test...');
    const { PerformanceOptimizedMobileInteractionTester } = await import('./testing/modules/PerformanceOptimizedMobileInteractionTester');
    testResults.mobile = await PerformanceOptimizedMobileInteractionTester.runAsyncTestSuite();
    
    // 2. Accessibility Test  
    console.log('♿ Running Accessibility Test...');
    const { EnhancedAccessibilityTester } = await import('./testing/modules/EnhancedAccessibilityTester');
    testResults.accessibility = await EnhancedAccessibilityTester.runAccessibilityTests('AA');
    
    // 3. Internationalization Test
    console.log('🌐 Running Internationalization Test...');
    const { SmartInternationalizationTester } = await import('./testing/modules/SmartInternationalizationTester');
    testResults.i18n = await SmartInternationalizationTester.runInternationalizationTests();
    
    // 4. Form Test
    console.log('📝 Running Form Test...');
    const { OptimizedUserInfoFormTester } = await import('./testing/modules/OptimizedUserInfoFormTester');
    testResults.forms = await OptimizedUserInfoFormTester.runUserInfoFormTests();
    
    // 5. Enhanced Formatting Test
    console.log('🎨 Running Enhanced Formatting Test...');
    const { EnhancedFormattingTester } = await import('./testing/modules/EnhancedFormattingTester');
    testResults.formatting = await EnhancedFormattingTester.runFormattingTests();
    
    // Display comprehensive results
    console.log('\n📊 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('=' .repeat(70));
    
    // Format results for display
    const results = {
      mobile: {
        score: testResults.mobile?.overallScore || 0,
        criticalIssues: testResults.mobile?.criticalIssues?.length || 0,
        issues: testResults.mobile?.criticalIssues || [],
        executionTime: testResults.mobile?.performanceMetrics?.totalExecutionTime || 0
      },
      accessibility: {
        score: testResults.accessibility?.overallScore || 0,
        criticalIssues: testResults.accessibility?.criticalIssues?.length || 0,
        issues: testResults.accessibility?.criticalIssues || [],
        executionTime: testResults.accessibility?.performanceMetrics?.executionTime || 0
      },
      i18n: {
        score: testResults.i18n?.score || 0,
        criticalIssues: testResults.i18n?.criticalIssues?.length || 0,
        issues: testResults.i18n?.criticalIssues || [],
        executionTime: testResults.i18n?.performanceMetrics?.executionTime || 0
      },
      forms: {
        score: testResults.forms?.score || 0,
        criticalIssues: testResults.forms?.issues?.filter((i: any) => i.severity === 'critical')?.length || 0,
        issues: testResults.forms?.issues?.filter((i: any) => i.severity === 'critical')?.map((i: any) => i.description) || [],
        accessibilityScore: testResults.forms?.accessibilityScore || 0,
        mobileScore: testResults.forms?.mobileOptimizationScore || 0,
        executionTime: testResults.forms?.performanceMetrics?.executionTime || 0
      },
      formatting: {
        score: testResults.formatting?.score || 0,
        criticalIssues: testResults.formatting?.issues?.filter((i: any) => i.severity === 'critical')?.length || 0,
        issues: testResults.formatting?.issues?.filter((i: any) => i.severity === 'critical') || [],
        cssConflicts: testResults.formatting?.metrics?.cssConflicts || 0,
        textFlowIssues: testResults.formatting?.metrics?.textFlowConsistency || 0
      }
    };
    
    // Log formatted results
    console.log(`📱 MOBILE INTERACTION: ${results.mobile.score.toFixed(1)}%`);
    console.log(`   Critical Issues: ${results.mobile.criticalIssues}`);
    console.log(`   Execution Time: ${results.mobile.executionTime.toFixed(1)}ms`);
    
    console.log(`♿ ACCESSIBILITY: ${results.accessibility.score}%`);
    console.log(`   Critical Issues: ${results.accessibility.criticalIssues}`);
    console.log(`   Execution Time: ${results.accessibility.executionTime.toFixed(1)}ms`);
    
    console.log(`🌐 INTERNATIONALIZATION: ${results.i18n.score}%`);
    console.log(`   Critical Issues: ${results.i18n.criticalIssues}`);
    console.log(`   Execution Time: ${results.i18n.executionTime.toFixed(1)}ms`);
    
    console.log(`📝 FORMS: ${results.forms.score.toFixed(1)}%`);
    console.log(`   A11y Score: ${results.forms.accessibilityScore.toFixed(0)}%`);
    console.log(`   Mobile Score: ${results.forms.mobileScore.toFixed(0)}%`);
    console.log(`   Critical Issues: ${results.forms.criticalIssues}`);
    console.log(`   Execution Time: ${results.forms.executionTime.toFixed(1)}ms`);
    
    console.log(`🎨 FORMATTING: ${results.formatting.score}%`);
    console.log(`   CSS Conflicts: ${results.formatting.cssConflicts}`);
    console.log(`   Text Flow Issues: ${results.formatting.textFlowIssues}`);
    console.log(`   Critical Issues: ${results.formatting.criticalIssues}`);
    
    // Store globally for retrieval
    (window as any).comprehensiveTestResults = results;
    
    console.log('\n✅ COMPREHENSIVE TESTS COMPLETED');
    console.log('📋 Results stored in window.comprehensiveTestResults');
    console.log('=' .repeat(70));
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
})();

export {};