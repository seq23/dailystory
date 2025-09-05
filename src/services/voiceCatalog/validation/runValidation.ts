/**
 * Quick validation runner for console testing
 */

import { VoiceCatalogValidator } from './VoiceCatalogValidator';

// Run validation and log results
async function runValidation() {
  console.log('🚀 Starting voice catalog validation...\n');
  
  const result = await VoiceCatalogValidator.validateComplete();
  
  console.log('\n📋 VALIDATION RESULTS:');
  console.log('='.repeat(50));
  console.log(`Success: ${result.success}`);
  console.log(`Total Voices: ${result.totalVoices}`);
  console.log(`Level Counts:`, result.levelCounts);
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(result.success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
  
  return result;
}

// Export for use in other modules
export { runValidation };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation().catch(console.error);
}