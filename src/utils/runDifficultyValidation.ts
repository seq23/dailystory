// Run the comprehensive difficulty validation test
import { DifficultyLevelValidationTest } from '@/utils/difficultyLevelValidationTest';

console.log('🧪 STARTING COMPREHENSIVE DIFFICULTY LEVEL VALIDATION...');

// Run quick validation first
DifficultyLevelValidationTest.quickValidation().then(quickResult => {
  console.log('⚡ Quick Validation Result:', quickResult);
  
  if (!quickResult.ready) {
    console.error('❌ Quick validation failed. Issues:', quickResult.issues);
    return;
  }
  
  console.log('✅ Quick validation passed! Running comprehensive test...');
  
  // Run full comprehensive validation
  DifficultyLevelValidationTest.runComprehensiveValidation().then(fullResult => {
    console.log('🎯 COMPREHENSIVE VALIDATION COMPLETE');
    console.log('📊 Overall Status:', fullResult.overallStatus);
    
    // Log results for each difficulty
    fullResult.difficultyResults.forEach(result => {
      console.log(`\n📝 ${result.difficulty.toUpperCase()} LEVEL RESULTS:`);
      console.log(`   Word Count: ${result.wordCountCompliance.averageWords} words (target: ${result.wordCountCompliance.expectedRange.min}-${result.wordCountCompliance.expectedRange.max})`);
      console.log(`   Compliance: ${result.wordCountCompliance.compliance}% pages in range`);
      console.log(`   Vocabulary: ${result.vocabularyCompliance.appropriateForLevel ? '✅ Appropriate' : '❌ Issues'}`);
      console.log(`   Variety: ${(result.contentQuality.variety * 100).toFixed(0)}% unique content`);
      console.log(`   Mobile: ${result.mobileOptimized.noScrollRequired ? '✅ No scroll' : '⚠️ May scroll'} (max: ${result.mobileOptimized.maxLineLength} chars)`);
      
      if (result.vocabularyCompliance.levelViolations.length > 0) {
        console.log(`   ❌ Vocabulary violations:`, result.vocabularyCompliance.levelViolations.slice(0, 3));
      }
    });
    
    // Log seamless switching results
    console.log(`\n🔄 SEAMLESS SWITCHING:`);
    console.log(`   Can Switch: ${fullResult.seamlessSwitching.canSwitchBetweenLevels ? '✅' : '❌'}`);
    console.log(`   Layout Consistent: ${fullResult.seamlessSwitching.layoutConsistent ? '✅' : '❌'}`);
    console.log(`   Performance Optimal: ${fullResult.seamlessSwitching.performanceOptimal ? '✅' : '❌'}`);
    
    // Log critical issues
    if (fullResult.criticalIssues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES (${fullResult.criticalIssues.length}):`);
      fullResult.criticalIssues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    // Log recommendations
    if (fullResult.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS (${fullResult.recommendations.length}):`);
      fullResult.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
    
    // Final verdict
    if (fullResult.overallStatus === 'PASS') {
      console.log('\n🎉 ALL DIFFICULTY LEVELS ARE WORKING PERFECTLY!');
      console.log('✅ Ready for production use');
    } else if (fullResult.overallStatus === 'WARNING') {
      console.log('\n⚠️ SYSTEM WORKING WITH MINOR ISSUES');
      console.log('✅ Safe for production, improvements recommended');
    } else {
      console.log('\n❌ CRITICAL ISSUES FOUND');
      console.log('⚠️ Fix required before production');
    }
    
  }).catch(error => {
    console.error('❌ Comprehensive validation failed:', error);
  });
  
}).catch(error => {
  console.error('❌ Quick validation failed:', error);
});

// Export for manual testing
(window as any).testDifficultyLevels = DifficultyLevelValidationTest;