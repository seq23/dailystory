#!/usr/bin/env node

/**
 * Verification script to check if test fixes are working
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runTests() {
  console.log('🧪 Running test verification...');
  
  try {
    // Run specific test files that were fixed
    const testCommands = [
      'npx vitest run src/test/unit/components/InteractiveWord.test.tsx --reporter=verbose',
      'npx vitest run src/test/unit/services/unifiedTTSService.test.ts --reporter=verbose'
    ];
    
    for (const command of testCommands) {
      console.log(`\n📋 Running: ${command}`);
      try {
        const { stdout, stderr } = await execAsync(command);
        console.log('✅ STDOUT:', stdout);
        if (stderr) console.log('⚠️  STDERR:', stderr);
      } catch (error: any) {
        console.log('❌ Test failed:', error.message);
        console.log('📄 Full output:', error.stdout);
      }
    }
    
    console.log('\n🎯 Test verification completed');
    
  } catch (error) {
    console.error('💥 Error running tests:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };