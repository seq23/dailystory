// Test the new performance-optimized test suite system
import { PerformanceOptimizedTestSuite } from './testing/modules/PerformanceOptimizedTestSuite';

// Expose functions to global window for console testing
declare global {
  interface Window {
    runOptimizedTests: () => Promise<any>;
    runQuickTests: () => Promise<any>;
    runMobileTest: () => Promise<any>;
    runAccessibilityTest: () => Promise<any>;
    runI18nTest: () => Promise<any>;
    runFormTest: () => Promise<any>;
    clearTestCache: () => void;
    getTestPerformance: () => string;
  }
}

// Quick test function for immediate console results
window.runOptimizedTests = async () => {
  console.log('🚀 Starting Performance-Optimized Test Suite...');
  console.log('=' .repeat(60));
  
  try {
    const result = await PerformanceOptimizedTestSuite.runOptimizedTestSuite({
      maxExecutionTime: 3000,
      summaryOnly: true,
      prioritizeQuickWins: true
    });
    
    console.log('✅ Test Suite Complete!');
    console.log('📊 Summary:', result.summary);
    console.log('⚡ Performance:', PerformanceOptimizedTestSuite.getPerformanceInsights());
    console.log('=' .repeat(60));
    
    return result;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

// Individual test functions for specific testing
window.runMobileTest = async () => {
  console.log('📱 Running Mobile Interaction Test...');
  
  try {
    const { PerformanceOptimizedMobileInteractionTester } = await import('./testing/modules/PerformanceOptimizedMobileInteractionTester');
    const result = await PerformanceOptimizedMobileInteractionTester.runAsyncTestSuite();
    
    console.log(PerformanceOptimizedMobileInteractionTester.generateCompactReport(result));
    return result;
  } catch (error) {
    console.error('❌ Mobile test failed:', error);
  }
};

window.runAccessibilityTest = async () => {
  console.log('♿ Running Accessibility Test...');
  
  try {
    const { EnhancedAccessibilityTester } = await import('./testing/modules/EnhancedAccessibilityTester');
    const result = await EnhancedAccessibilityTester.runAccessibilityTests('AA');
    
    console.log(EnhancedAccessibilityTester.generateCompactReport(result));
    return result;
  } catch (error) {
    console.error('❌ Accessibility test failed:', error);
  }
};

window.runI18nTest = async () => {
  console.log('🌐 Running Internationalization Test...');
  
  try {
    const { SmartInternationalizationTester } = await import('./testing/modules/SmartInternationalizationTester');
    const result = await SmartInternationalizationTester.runInternationalizationTests();
    
    console.log(SmartInternationalizationTester.generateCompactReport(result));
    return result;
  } catch (error) {
    console.error('❌ I18n test failed:', error);
  }
};

window.runFormTest = async () => {
  console.log('📝 Running Form Test...');
  
  try {
    const { OptimizedUserInfoFormTester } = await import('./testing/modules/OptimizedUserInfoFormTester');
    const result = await OptimizedUserInfoFormTester.runUserInfoFormTests();
    
    console.log(OptimizedUserInfoFormTester.generateCompactReport(result));
    return result;
  } catch (error) {
    console.error('❌ Form test failed:', error);
  }
};

// Quick test with immediate results
window.runQuickTests = async () => {
  console.log('⚡ Running Quick Test Suite...');
  console.time('QuickTests');
  
  const startTime = performance.now();
  
  // Run tests in parallel for maximum speed
  const [mobileResult, a11yResult, i18nResult, formResult] = await Promise.allSettled([
    window.runMobileTest(),
    window.runAccessibilityTest(), 
    window.runI18nTest(),
    window.runFormTest()
  ]);
  
  const executionTime = performance.now() - startTime;
  console.timeEnd('QuickTests');
  
  // Summary
  const results = [mobileResult, a11yResult, i18nResult, formResult];
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`🎯 Quick Tests Complete: ${successful}✅ ${failed}❌ (${executionTime.toFixed(1)}ms)`);
  
  return {
    successful,
    failed,
    executionTime,
    results
  };
};

// Utility functions
window.clearTestCache = () => {
  PerformanceOptimizedTestSuite.clearCache();
};

window.getTestPerformance = () => {
  return PerformanceOptimizedTestSuite.getPerformanceInsights();
};

// Auto-run a quick test when the module loads (but only once)
let hasRunInitialTest = false;

const runInitialTest = async () => {
  if (hasRunInitialTest) return;
  hasRunInitialTest = true;
  
  console.log('🧪 Testing New Performance-Optimized Test System...');
  
  // Small delay to ensure DOM is ready
  setTimeout(async () => {
    try {
      await window.runOptimizedTests();
      
      console.log('');
      console.log('🎮 Available Test Commands:');
      console.log('- runOptimizedTests() - Full optimized test suite');
      console.log('- runQuickTests() - Parallel quick tests');
      console.log('- runMobileTest() - Mobile interaction test');
      console.log('- runAccessibilityTest() - WCAG AA compliance test');
      console.log('- runI18nTest() - Internationalization test');
      console.log('- runFormTest() - Form optimization test');
      console.log('- clearTestCache() - Clear test cache');
      console.log('- getTestPerformance() - Get performance metrics');
      console.log('');
    } catch (error) {
      console.error('Initial test failed:', error);
    }
  }, 1000);
};

// Run the initial test
runInitialTest();

export { }; // Make this a module