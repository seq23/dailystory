#!/usr/bin/env node

/**
 * Comprehensive Test Infrastructure Validation Script
 * Validates all test components and executes the full test suite
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

console.log('🚀 Starting Comprehensive Test Infrastructure Validation...\n');

// Test Infrastructure Components to Validate
const testComponents = {
  'Unit Tests': 'src/test/unit',
  'Integration Tests': 'src/test/integration', 
  'Performance Tests': 'src/test/performance',
  'E2E Tests': 'e2e',
  'Test Configuration': 'playwright.config.ts',
  'Vitest Config': 'vitest.config.ts',
  'Test Runner': 'test-runner.js',
  'Run Tests Script': 'run-tests.sh'
};

// Validate Test Infrastructure
console.log('📋 Validating Test Infrastructure Components...');
let infrastructureValid = true;

for (const [name, path] of Object.entries(testComponents)) {
  if (existsSync(path)) {
    console.log(`✅ ${name}: ${path}`);
  } else {
    console.log(`❌ ${name}: ${path} - MISSING`);
    infrastructureValid = false;
  }
}

if (!infrastructureValid) {
  console.log('\n🔥 CRITICAL: Test infrastructure is incomplete!');
  process.exit(1);
}

console.log('\n✅ Test Infrastructure Validation: PASSED\n');

// Validate Dependencies
console.log('📦 Validating Test Dependencies...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const testDependencies = [
    'vitest',
    '@playwright/test',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@axe-core/playwright',
    'lighthouse'
  ];

  let dependenciesValid = true;
  for (const dep of testDependencies) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}: installed`);
    } else {
      console.log(`❌ ${dep}: MISSING`);
      dependenciesValid = false;
    }
  }

  if (!dependenciesValid) {
    console.log('\n🔥 CRITICAL: Missing test dependencies!');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error validating dependencies:', error.message);
  process.exit(1);
}

console.log('\n✅ Dependencies Validation: PASSED\n');

// Execute Test Suite
console.log('🧪 Executing Comprehensive Test Suite...\n');

const testCommands = [
  { name: 'Install Playwright Browsers', cmd: 'npx playwright install' },
  { name: 'Unit Tests', cmd: 'npx vitest run src/test/unit' },
  { name: 'Integration Tests', cmd: 'npx vitest run src/test/integration' },
  { name: 'Performance Tests', cmd: 'npx vitest run src/test/performance' },
  { name: 'E2E Tests', cmd: 'npx playwright test' },
  { name: 'Visual Regression', cmd: 'npx playwright test e2e/visual-regression.spec.ts' },
  { name: 'Mobile Tests', cmd: 'npx playwright test e2e/mobile-specific.spec.ts' },
  { name: 'Accessibility Tests', cmd: 'npx playwright test e2e/accessibility.spec.ts' },
  { name: 'Security Tests', cmd: 'npx playwright test e2e/security.spec.ts' },
  { name: 'Load Tests', cmd: 'npx playwright test e2e/load-testing.spec.ts' }
];

const results = [];
let totalPassed = 0;
let totalFailed = 0;

for (const { name, cmd } of testCommands) {
  console.log(`\n🔄 Running ${name}...`);
  try {
    const startTime = Date.now();
    execSync(cmd, { stdio: 'inherit', timeout: 300000 }); // 5 minute timeout
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${name}: PASSED (${duration}ms)`);
    results.push({ name, status: 'PASSED', duration });
    totalPassed++;
  } catch (error) {
    console.log(`❌ ${name}: FAILED`);
    results.push({ name, status: 'FAILED', error: error.message });
    totalFailed++;
  }
}

// Generate Final Report
console.log('\n' + '='.repeat(60));
console.log('📊 COMPREHENSIVE TEST VALIDATION REPORT');
console.log('='.repeat(60));

console.log(`\n📈 Overall Results:`);
console.log(`   ✅ Passed: ${totalPassed}`);
console.log(`   ❌ Failed: ${totalFailed}`);
console.log(`   📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

console.log(`\n📋 Detailed Results:`);
results.forEach(result => {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  console.log(`   ${icon} ${result.name}: ${result.status}${duration}`);
});

if (totalFailed > 0) {
  console.log(`\n🔥 ATTENTION: ${totalFailed} test suite(s) failed!`);
  console.log('Review the output above for specific error details.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL TESTS PASSED! Enterprise Test Suite is fully functional.');
}

console.log('\n' + '='.repeat(60));