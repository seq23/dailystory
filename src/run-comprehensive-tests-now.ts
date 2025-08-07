// Execute comprehensive tests immediately and show results
(async () => {
  console.log('🚀 RUNNING COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(60));
  
  const allResults = {
    mobile: null,
    accessibility: null,
    i18n: null,
    forms: null,
    performance: {
      totalTime: 0,
      testsRun: 0,
      memoryUsed: 0
    }
  };
  
  const startTime = performance.now();
  let memoryBefore = 0;
  
  if ('memory' in performance) {
    memoryBefore = (performance as any).memory.usedJSHeapSize;
  }
  
  try {
    // Run all tests in parallel for speed
    console.log('📱 Starting Mobile Interaction Test...');
    const mobilePromise = import('./testing/modules/PerformanceOptimizedMobileInteractionTester')
      .then(({ PerformanceOptimizedMobileInteractionTester }) => 
        PerformanceOptimizedMobileInteractionTester.runAsyncTestSuite()
      );
    
    console.log('♿ Starting Accessibility Test...');
    const a11yPromise = import('./testing/modules/EnhancedAccessibilityTester')
      .then(({ EnhancedAccessibilityTester }) => 
        EnhancedAccessibilityTester.runAccessibilityTests('AA')
      );
    
    console.log('🌐 Starting Internationalization Test...');
    const i18nPromise = import('./testing/modules/SmartInternationalizationTester')
      .then(({ SmartInternationalizationTester }) => 
        SmartInternationalizationTester.runInternationalizationTests()
      );
    
    console.log('📝 Starting Form Test...');
    const formPromise = import('./testing/modules/OptimizedUserInfoFormTester')
      .then(({ OptimizedUserInfoFormTester }) => 
        OptimizedUserInfoFormTester.runUserInfoFormTests()
      );
    
    // Wait for all tests to complete
    const [mobileResult, a11yResult, i18nResult, formResult] = await Promise.all([
      mobilePromise,
      a11yPromise,
      i18nPromise,
      formPromise
    ]);
    
    allResults.mobile = mobileResult;
    allResults.accessibility = a11yResult;
    allResults.i18n = i18nResult;
    allResults.forms = formResult;
    
    const totalTime = performance.now() - startTime;
    let memoryAfter = 0;
    
    if ('memory' in performance) {
      memoryAfter = (performance as any).memory.usedJSHeapSize;
    }
    
    allResults.performance = {
      totalTime,
      testsRun: 4,
      memoryUsed: memoryAfter - memoryBefore
    };
    
    // Generate comprehensive results
    console.log('');
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('=' .repeat(60));
    
    // Mobile Results
    console.log(`📱 MOBILE INTERACTION: ${mobileResult.overallScore.toFixed(1)}%`);
    console.log(`   Execution Time: ${mobileResult.performanceMetrics?.totalExecutionTime?.toFixed(1) || 'N/A'}ms`);
    console.log(`   Critical Issues: ${mobileResult.criticalIssues.length}`);
    if (mobileResult.criticalIssues.length > 0) {
      mobileResult.criticalIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`     ${i + 1}. ${issue}`);
      });
    }
    console.log('');
    
    // Accessibility Results
    console.log(`♿ ACCESSIBILITY (WCAG AA): ${a11yResult.overallScore}%`);
    console.log(`   Execution Time: ${a11yResult.performanceMetrics?.executionTime?.toFixed(1) || 'N/A'}ms`);
    console.log(`   Tests: ${a11yResult.passed} passed, ${a11yResult.failed} failed`);
    console.log(`   Critical Issues: ${a11yResult.criticalIssues.length}`);
    if (a11yResult.criticalIssues.length > 0) {
      a11yResult.criticalIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`     ${i + 1}. ${issue}`);
      });
    }
    console.log('');
    
    // Internationalization Results
    console.log(`🌐 INTERNATIONALIZATION: ${i18nResult.score}%`);
    console.log(`   Execution Time: ${i18nResult.performanceMetrics?.executionTime?.toFixed(1) || 'N/A'}ms`);
    console.log(`   Languages Tested: ${i18nResult.testedLanguages.length}`);
    console.log(`   Critical Issues: ${i18nResult.criticalIssues.length}`);
    if (i18nResult.criticalIssues.length > 0) {
      i18nResult.criticalIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`     ${i + 1}. ${issue}`);
      });
    }
    console.log('');
    
    // Form Results
    console.log(`📝 FORM OPTIMIZATION: ${formResult.score.toFixed(1)}%`);
    console.log(`   Execution Time: ${formResult.performanceMetrics?.executionTime?.toFixed(1) || 'N/A'}ms`);
    console.log(`   Accessibility Score: ${formResult.accessibilityScore.toFixed(0)}%`);
    console.log(`   Mobile Optimization: ${formResult.mobileOptimizationScore.toFixed(0)}%`);
    console.log(`   Forms Analyzed: ${formResult.performanceMetrics?.formsAnalyzed || 0}`);
    const criticalFormIssues = formResult.issues.filter(i => i.severity === 'critical');
    console.log(`   Critical Issues: ${criticalFormIssues.length}`);
    if (criticalFormIssues.length > 0) {
      criticalFormIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`     ${i + 1}. ${issue.description}`);
      });
    }
    console.log('');
    
    // Overall Performance
    console.log('⚡ PERFORMANCE METRICS');
    console.log(`   Total Execution Time: ${totalTime.toFixed(1)}ms`);
    console.log(`   Tests Run: ${allResults.performance.testsRun}`);
    console.log(`   Memory Usage: ${(allResults.performance.memoryUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Average per Test: ${(totalTime / allResults.performance.testsRun).toFixed(1)}ms`);
    console.log('');
    
    // Top Recommendations
    console.log('🎯 TOP RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    const recommendations = [];
    
    if (mobileResult.overallScore < 85) {
      recommendations.push('🔧 MOBILE: Fix touch target sizes (minimum 44px for mobile devices)');
      if (mobileResult.criticalIssues.some(issue => issue.includes('too small'))) {
        recommendations.push('📱 PRIORITY: Increase button and interactive element sizes');
      }
    }
    
    if (a11yResult.overallScore < 90) {
      recommendations.push('♿ ACCESSIBILITY: Add missing alt text and ARIA labels');
      if (a11yResult.criticalIssues.some(issue => issue.includes('contrast'))) {
        recommendations.push('🎨 PRIORITY: Improve color contrast ratios (minimum 4.5:1)');
      }
    }
    
    if (i18nResult.score < 80) {
      recommendations.push('🌐 I18N: Ensure story content remains LTR in RTL languages');
      if (i18nResult.criticalIssues.some(issue => issue.includes('direction'))) {
        recommendations.push('📖 PRIORITY: Add dir="ltr" to story content containers');
      }
    }
    
    if (formResult.score < 80) {
      recommendations.push('📝 FORMS: Improve form accessibility and mobile optimization');
      if (criticalFormIssues.length > 0) {
        recommendations.push('🔍 PRIORITY: Fix form labeling and validation feedback');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✨ EXCELLENT: All tests passed with good scores!');
      recommendations.push('🚀 OPTIMIZATION: Consider running performance tests for further improvements');
    }
    
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log('');
    console.log('✅ COMPREHENSIVE TEST SUITE COMPLETED');
    console.log('=' .repeat(60));
    
    // Store results globally for access
    (window as any).testResults = allResults;
    console.log('💾 Results stored in window.testResults for detailed analysis');
    
  } catch (error) {
    console.error('❌ Comprehensive test suite failed:', error);
  }
})();

export {};