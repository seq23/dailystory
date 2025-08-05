// Quick System Check Runner
// Use this to immediately test the system

import { SystemHealthChecker } from './systemHealthChecker';

export async function runCompleteSystemCheck() {
  console.log('🚀 Starting Complete System Check...');
  
  // Run basic health check
  const healthResult = await SystemHealthChecker.runQuickHealthCheck();
  
  // Run vocabulary compliance check
  const vocabResult = await SystemHealthChecker.runVocabularyComplianceCheck();
  
  console.log('\n=== SYSTEM CHECK RESULTS ===');
  console.log(`🏥 Health Status: ${healthResult.isHealthy ? '✅ HEALTHY' : '❌ ISSUES FOUND'}`);
  console.log(`📚 Vocabulary: ${vocabResult.passed ? '✅ COMPLIANT' : '❌ ISSUES FOUND'}`);
  
  if (healthResult.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    healthResult.criticalIssues.forEach(issue => console.log(issue));
  }
  
  if (healthResult.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    healthResult.warnings.forEach(warning => console.log(warning));
  }
  
  if (vocabResult.issues.length > 0) {
    console.log('\n📚 VOCABULARY ISSUES:');
    vocabResult.issues.slice(0, 10).forEach(issue => console.log(issue));
    if (vocabResult.issues.length > 10) {
      console.log(`... and ${vocabResult.issues.length - 10} more issues`);
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`- Templates: ${healthResult.systemInfo.analytics?.totalTemplates || 'Unknown'}/200`);
  console.log(`- Pages: ${healthResult.systemInfo.analytics?.totalPages || 'Unknown'}/1000`);
  console.log(`- Tested Templates: ${vocabResult.testedTemplates}`);
  console.log(`- System Status: ${healthResult.isHealthy && vocabResult.passed ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION'}`);
  
  return {
    isSystemReady: healthResult.isHealthy && vocabResult.passed,
    healthResult,
    vocabResult
  };
}

// Auto-run check (will show in console)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runCompleteSystemCheck().catch(console.error);
  }, 1000);
}