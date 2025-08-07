// Manual Test Runner - Executes immediately to show console results
console.log('🧪 TESTING NEW PERFORMANCE-OPTIMIZED TEST SYSTEM');
console.log('=' .repeat(70));

// Import and run the optimized tests
import('./testing/modules/PerformanceOptimizedMobileInteractionTester').then(async ({ PerformanceOptimizedMobileInteractionTester }) => {
  try {
    console.log('📱 Starting Mobile Interaction Test...');
    const mobileStart = performance.now();
    
    const mobileResult = await PerformanceOptimizedMobileInteractionTester.runAsyncTestSuite();
    const mobileTime = performance.now() - mobileStart;
    
    console.log(`📱 Mobile: ${mobileResult.overallScore.toFixed(1)}% ` +
                `(${mobileResult.criticalIssues.length} critical, ${mobileTime.toFixed(1)}ms)`);
    
    if (mobileResult.criticalIssues.length > 0) {
      console.log('   Critical Issues:', mobileResult.criticalIssues.slice(0, 2).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Mobile test failed:', error);
  }
});

import('./testing/modules/EnhancedAccessibilityTester').then(async ({ EnhancedAccessibilityTester }) => {
  try {
    console.log('♿ Starting Accessibility Test...');
    const a11yStart = performance.now();
    
    const a11yResult = await EnhancedAccessibilityTester.runAccessibilityTests('AA');
    const a11yTime = performance.now() - a11yStart;
    
    console.log(`♿ Accessibility: ${a11yResult.overallScore}% ` +
                `(${a11yResult.criticalIssues.length} critical, ${a11yTime.toFixed(1)}ms)`);
    
    if (a11yResult.criticalIssues.length > 0) {
      console.log('   Critical Issues:', a11yResult.criticalIssues.slice(0, 2).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Accessibility test failed:', error);
  }
});

import('./testing/modules/SmartInternationalizationTester').then(async ({ SmartInternationalizationTester }) => {
  try {
    console.log('🌐 Starting Internationalization Test...');
    const i18nStart = performance.now();
    
    const i18nResult = await SmartInternationalizationTester.runInternationalizationTests();
    const i18nTime = performance.now() - i18nStart;
    
    console.log(`🌐 I18n: ${i18nResult.score}% ` +
                `(${i18nResult.criticalIssues.length} critical, ${i18nTime.toFixed(1)}ms)`);
    
    if (i18nResult.criticalIssues.length > 0) {
      console.log('   Critical Issues:', i18nResult.criticalIssues.slice(0, 2).join(', '));
    }
    
  } catch (error) {
    console.error('❌ I18n test failed:', error);
  }
});

import('./testing/modules/OptimizedUserInfoFormTester').then(async ({ OptimizedUserInfoFormTester }) => {
  try {
    console.log('📝 Starting Form Test...');
    const formStart = performance.now();
    
    const formResult = await OptimizedUserInfoFormTester.runUserInfoFormTests();
    const formTime = performance.now() - formStart;
    
    console.log(`📝 Forms: ${formResult.score.toFixed(1)}% ` +
                `(A11y: ${formResult.accessibilityScore.toFixed(0)}%, Mobile: ${formResult.mobileOptimizationScore.toFixed(0)}%, ${formTime.toFixed(1)}ms)`);
    
    const criticalIssues = formResult.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log('   Critical Issues:', criticalIssues.slice(0, 2).map(i => i.description).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Form test failed:', error);
  }
});

// Performance-optimized test suite
import('./testing/modules/PerformanceOptimizedTestSuite').then(async ({ PerformanceOptimizedTestSuite }) => {
  try {
    console.log('🚀 Starting Complete Optimized Test Suite...');
    const suiteStart = performance.now();
    
    const suiteResult = await PerformanceOptimizedTestSuite.runOptimizedTestSuite({
      maxExecutionTime: 3000,
      summaryOnly: true,
      prioritizeQuickWins: true
    });
    
    const suiteTime = performance.now() - suiteStart;
    
    console.log(`🚀 Test Suite Complete: ${suiteResult.summary} (${suiteTime.toFixed(1)}ms)`);
    console.log(`⚡ Performance: ${PerformanceOptimizedTestSuite.getPerformanceInsights()}`);
    
    console.log('=' .repeat(70));
    console.log('✅ NEW PERFORMANCE-OPTIMIZED TEST SYSTEM WORKING!');
    console.log('💡 Available commands in console:');
    console.log('   - runOptimizedTests() - Full test suite');
    console.log('   - runQuickTests() - Quick parallel tests');
    console.log('   - runMobileTest() - Mobile-specific test');
    console.log('   - runAccessibilityTest() - A11y test');
    console.log('   - runI18nTest() - Internationalization test');
    console.log('   - runFormTest() - Form optimization test');
    console.log('   - clearTestCache() - Clear cache');
    console.log('   - getTestPerformance() - Performance metrics');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
});

export {}; // Make this a module