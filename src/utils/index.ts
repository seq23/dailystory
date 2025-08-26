// Universal Template System - Main Exports
export * from './universalTemplateValidator';
export * from './vocabCoverage';
export * from './grammarValidator';
export * from './sentenceValidator';
export * from './implementationReport';

// Run verification on startup
import { runFinalVerification } from './finalVerification';

console.log('🚀 Universal Template System Loading...');
const verified = runFinalVerification();
console.log(`✅ System Verification: ${verified.overallSuccess ? 'COMPLETE' : 'IN PROGRESS'}`);