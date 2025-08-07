#!/usr/bin/env node

// Run the enterprise test suite to establish baseline
import { execSync } from 'child_process';

try {
  console.log('🚀 Starting Enterprise Test Suite - Baseline Run...\n');
  
  const result = execSync('node enterprise-test-runner.js', {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('\n✅ Enterprise test suite completed successfully!');
  console.log('📊 Check test-results/ directory for detailed reports.');
  
} catch (error) {
  console.error('\n❌ Enterprise test suite failed:', error.message);
  console.log('📋 Error details saved for analysis.');
  process.exit(1);
}