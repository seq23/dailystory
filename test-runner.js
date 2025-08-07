#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Enterprise Test Infrastructure Setup & Execution');
console.log('================================================\n');

const commands = [
  {
    name: 'Install Playwright Browsers',
    cmd: 'npx playwright install',
    description: 'Installing browser engines for E2E testing'
  },
  {
    name: 'Unit Tests',
    cmd: 'npx vitest run src/test/unit --reporter=verbose',
    description: 'Running component and service unit tests'
  },
  {
    name: 'Integration Tests', 
    cmd: 'npx vitest run src/test/integration --reporter=verbose',
    description: 'Running Supabase integration tests'
  },
  {
    name: 'Performance Tests',
    cmd: 'npx vitest run src/test/performance --reporter=verbose', 
    description: 'Running Lighthouse performance tests'
  },
  {
    name: 'E2E Story Generation Tests',
    cmd: 'npx playwright test e2e/story-generation.spec.ts',
    description: 'Testing story generation flows'
  },
  {
    name: 'Visual Regression Tests',
    cmd: 'npx playwright test e2e/visual-regression.spec.ts',
    description: 'Checking UI consistency across states'
  },
  {
    name: 'Accessibility Tests',
    cmd: 'npx playwright test e2e/accessibility.spec.ts',
    description: 'Verifying WCAG compliance and keyboard navigation'
  },
  {
    name: 'Mobile Device Tests',
    cmd: 'npx playwright test e2e/mobile-specific.spec.ts',
    description: 'Testing mobile interactions and responsiveness'
  },
  {
    name: 'Security Tests',
    cmd: 'npx playwright test e2e/security.spec.ts',
    description: 'Checking XSS, SQL injection, and CSP'
  },
  {
    name: 'Load Testing',
    cmd: 'npx playwright test e2e/load-testing.spec.ts',
    description: 'Testing concurrent users and memory usage'
  }
];

for (const command of commands) {
  console.log(`\n📋 ${command.name}`);
  console.log(`   ${command.description}`);
  console.log(`   Command: ${command.cmd}\n`);
  
  try {
    execSync(command.cmd, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`   ✅ ${command.name} completed successfully\n`);
  } catch (error) {
    console.error(`   ❌ ${command.name} failed:`, error.message);
    console.log(`   Continuing with other tests...\n`);
  }
}

console.log('\n🎉 Enterprise Test Infrastructure Setup Complete!');
console.log('\nAvailable Test Commands:');
console.log('- npx vitest run src/test/unit (Unit tests)');
console.log('- npx vitest run src/test/integration (Integration tests)');
console.log('- npx playwright test (All E2E tests)');
console.log('- npx playwright test --ui (E2E tests with UI)');
console.log('- npx vitest run --coverage (Test coverage report)');
console.log('\nFor CI/CD: npm run test:ci (when scripts are merged)');