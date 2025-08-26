// Universal Template System - Main Exports
export * from './universalTemplateValidator';
export * from './vocabCoverage';
export * from './grammarValidator';
export * from './sentenceValidator';
export * from './implementationReport';

// Run verification on startup
import { runImplementationVerification } from './implementationReport';

console.log('🚀 Universal Template System Loading...');
const verified = runImplementationVerification();
console.log(`✅ System Verification: ${verified ? 'PASSED' : 'FAILED'}`);