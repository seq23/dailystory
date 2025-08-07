#!/usr/bin/env node

/**
 * Test Scripts Setup Helper
 * Since package.json is read-only, this script provides test execution capabilities
 */

import { execSync } from 'child_process';

const testScripts = {
  'test:unit': 'npx vitest run src/test/unit',
  'test:integration': 'npx vitest run src/test/integration', 
  'test:performance': 'npx vitest run src/test/performance',
  'test:e2e': 'npx playwright test',
  'test:e2e:ui': 'npx playwright test --ui',
  'test:visual': 'npx playwright test e2e/visual-regression.spec.ts',
  'test:mobile': 'npx playwright test e2e/mobile-specific.spec.ts',
  'test:accessibility': 'npx playwright test e2e/accessibility.spec.ts',
  'test:security': 'npx playwright test e2e/security.spec.ts',
  'test:load': 'npx playwright test e2e/load-testing.spec.ts',
  'test:watch': 'npx vitest',
  'test:coverage': 'npx vitest run --coverage',
  'test:all': 'node validate-test-infrastructure.js',
  'install:browsers': 'npx playwright install'
};

// Show available test commands
console.log('🧪 Available Test Commands:');
console.log('=' .repeat(50));

for (const [script, command] of Object.entries(testScripts)) {
  console.log(`📋 ${script}:`);
  console.log(`   ${command}\n`);
}

console.log('🚀 Quick Start:');
console.log('   node setup-test-scripts.js run test:all    # Run all tests');
console.log('   node setup-test-scripts.js run test:unit   # Run unit tests');
console.log('   node setup-test-scripts.js run test:e2e    # Run E2E tests');

// Handle script execution
const args = process.argv.slice(2);
if (args[0] === 'run' && args[1]) {
  const scriptName = args[1];
  const command = testScripts[scriptName];
  
  if (command) {
    console.log(`\n🔄 Executing: ${scriptName}`);
    console.log(`Command: ${command}\n`);
    
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`\n✅ ${scriptName} completed successfully!`);
    } catch (error) {
      console.log(`\n❌ ${scriptName} failed!`);
      process.exit(1);
    }
  } else {
    console.log(`\n❌ Unknown script: ${scriptName}`);
    console.log('Available scripts:', Object.keys(testScripts).join(', '));
    process.exit(1);
  }
}