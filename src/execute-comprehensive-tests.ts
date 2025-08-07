// Direct test execution to capture results for display
console.log('🚀 EXECUTING COMPREHENSIVE TESTS FOR USER DISPLAY');
console.log('=' .repeat(70));

// Store results for later display
const testResults: any = {};

// Execute ALL tests including UI/UX
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
    
    // 5. Enhanced Formatting Test with CSS-Component Integration Check
    console.log('🎨 Running Enhanced Formatting Test...');
    const { EnhancedFormattingTester } = await import('./testing/modules/EnhancedFormattingTester');
    testResults.formatting = await EnhancedFormattingTester.runFormattingTests();
    
    // Additional validation for story display CSS integration
    console.log('🔍 Validating story display CSS integration...');
    const storyElements = document.querySelectorAll('.story-content[data-difficulty]');
    if (storyElements.length > 0) {
      storyElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontSize = computedStyle.fontSize;
        console.log(`📏 Story element font-size: ${fontSize} for difficulty: ${element.getAttribute('data-difficulty')}`);
      });
    } else {
      console.log('⚠️ No story content elements found - may indicate CSS selector issues');
    }
    
    // 6. Visual Design Test Suite
    console.log('🎨 Running Visual Design Test...');
    const { VisualDesignTestSuite } = await import('./testing/modules/VisualDesignTestSuite');
    testResults.visualDesign = await VisualDesignTestSuite.runVisualDesignTests();
    
    // 7. Enhanced UX Test Suite  
    console.log('😊 Running Enhanced UX Test Suite...');
    const { EnhancedUXTestSuite } = await import('./testing/modules/EnhancedUXTestSuite');
    testResults.ux = await EnhancedUXTestSuite.runComprehensiveUXTests();
    
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
      },
      visualDesign: {
        score: testResults.visualDesign?.score || 0,
        criticalIssues: testResults.visualDesign?.issues?.filter((i: any) => i.severity === 'critical')?.length || 0,
        quickWins: testResults.visualDesign?.issues?.filter((i: any) => i.quickWin)?.length || 0,
        designSystemCompliance: testResults.visualDesign?.details?.find((d: any) => d.testName === 'Design System Compliance')?.score || 0
      },
      ux: {
        overallScore: testResults.ux?.executionSummary?.overallUXScore || 0,
        userJourneyScore: testResults.ux?.userJourney?.overallScore || 0,
        cognitiveLoadScore: testResults.ux?.cognitiveLoad?.overallScore || 0,
        emotionalUXScore: testResults.ux?.emotionalUX?.overallScore || 0,
        criticalIssues: testResults.ux?.executionSummary?.criticalIssuesCount || 0,
        quickWins: testResults.ux?.comprehensiveAnalysis?.quickWins?.length || 0
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
    
    console.log(`🎨 VISUAL DESIGN: ${results.visualDesign.score.toFixed(1)}%`);
    console.log(`   Design System: ${results.visualDesign.designSystemCompliance.toFixed(1)}%`);
    console.log(`   Quick Wins: ${results.visualDesign.quickWins}`);
    console.log(`   Critical Issues: ${results.visualDesign.criticalIssues}`);
    
    console.log(`😊 UX OVERALL: ${results.ux.overallScore.toFixed(1)}%`);
    console.log(`   User Journey: ${results.ux.userJourneyScore.toFixed(1)}%`);
    console.log(`   Cognitive Load: ${results.ux.cognitiveLoadScore.toFixed(1)}%`);
    console.log(`   Emotional UX: ${results.ux.emotionalUXScore.toFixed(1)}%`);
    console.log(`   Critical Issues: ${results.ux.criticalIssues}`);
    console.log(`   Quick Wins: ${results.ux.quickWins}`);
    
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