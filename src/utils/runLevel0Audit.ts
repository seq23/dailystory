/**
 * Quick audit runner to test Level 0 vocabulary compliance
 * Run this to verify all systems are working correctly
 */

import { ComprehensiveLevel0Audit } from './comprehensiveLevel0Audit';

export async function runLevel0ComplianceCheck() {
  console.log('🚀 Starting Level 0 vocabulary compliance check...');
  
  try {
    // Run full system audit
    const auditResult = await ComprehensiveLevel0Audit.runFullAudit('Sequoia');
    
    // Test story generation
    await ComprehensiveLevel0Audit.testStoryGeneration('Sequoia', 2);
    
    // Final summary
    console.log('\n✅ Level 0 audit complete!');
    console.log(`Overall compliant: ${auditResult.overallCompliant ? 'YES' : 'NO'}`);
    
    return auditResult;
  } catch (error) {
    console.error('❌ Error during Level 0 audit:', error);
    throw error;
  }
}

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment - you can run this manually
  (window as any).runLevel0ComplianceCheck = runLevel0ComplianceCheck;
  console.log('💡 Run runLevel0ComplianceCheck() in console to test vocabulary compliance');
}