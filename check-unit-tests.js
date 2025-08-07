#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('🧪 Checking Unit Test Status...\n');

try {
  // Run just the two specific test files we fixed
  console.log('📝 Running InteractiveWord component tests...');
  const interactiveWordResult = execSync(
    'npx vitest run src/test/unit/components/InteractiveWord.test.tsx --reporter=verbose --no-coverage', 
    { encoding: 'utf8', stdio: 'pipe' }
  );
  console.log('✅ InteractiveWord tests:', interactiveWordResult.includes('PASS') ? 'PASSED' : 'Status unclear');
  
  console.log('\n📝 Running UnifiedTTSService tests...');
  const ttsResult = execSync(
    'npx vitest run src/test/unit/services/unifiedTTSService.test.ts --reporter=verbose --no-coverage', 
    { encoding: 'utf8', stdio: 'pipe' }
  );
  console.log('✅ UnifiedTTSService tests:', ttsResult.includes('PASS') ? 'PASSED' : 'Status unclear');
  
  console.log('\n🎯 Running all unit tests for final verification...');
  const allUnitResult = execSync(
    'npx vitest run src/test/unit --reporter=basic --no-coverage', 
    { encoding: 'utf8', stdio: 'pipe' }
  );
  
  console.log('\n📊 Final Results:');
  console.log(allUnitResult);
  
} catch (error) {
  console.log('❌ Test execution had issues:');
  console.log(error.stdout || error.message);
  console.log('\n🔍 Error details:');
  console.log(error.stderr || 'No stderr');
}