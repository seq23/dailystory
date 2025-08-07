#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Enterprise Jest Infrastructure...\n');

// Test commands to run
const testCommands = [
  {
    name: 'Jest Installation Check',
    command: 'npx jest --version',
    description: 'Verify Jest is installed and accessible'
  },
  {
    name: 'Basic Jest Test Run', 
    command: 'npx jest tests/ --passWithNoTests',
    description: 'Run Jest on our new test directory'
  },
  {
    name: 'Jest Coverage Test',
    command: 'npx jest tests/ --coverage --passWithNoTests',
    description: 'Test coverage reporting capabilities'
  },
  {
    name: 'Component Tests',
    command: 'npx jest tests/components --passWithNoTests',
    description: 'Run component-specific tests'
  },
  {
    name: 'Service Tests',
    command: 'npx jest tests/services --passWithNoTests',
    description: 'Run service-specific tests'
  }
];

let passed = 0;
let failed = 0;

for (const test of testCommands) {
  console.log(`📋 ${test.name}`);
  console.log(`   ${test.description}`);
  console.log(`   Command: ${test.command}\n`);

  try {
    const output = execSync(test.command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000
    });
    
    console.log(`✅ ${test.name} - PASSED`);
    console.log(`   Output: ${output.split('\n')[0]}\n`);
    passed++;
    
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    console.log(`   Error: ${error.message.split('\n')[0]}\n`);
    failed++;
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🏁 Jest Infrastructure Validation Complete`);
console.log(`📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ Jest infrastructure is ready for enterprise testing!');
  console.log('\n🚀 Next steps:');
  console.log('   • Run: npx jest tests/');
  console.log('   • Run: npx jest --coverage');
  console.log('   • Run: node enterprise-test-runner.js');
} else {
  console.log('⚠️  Some issues detected. Please review the errors above.');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');