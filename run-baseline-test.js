const { execSync } = require('child_process');

try {
  console.log('🚀 Starting Enterprise Test Suite - Baseline Run...\n');
  
  execSync('node enterprise-test-runner.js', {
    stdio: 'inherit'
  });
  
  console.log('\n✅ Enterprise test suite completed successfully!');
  console.log('📊 Check test-results/ directory for detailed reports.');
  
} catch (error) {
  console.error('\n❌ Enterprise test suite failed:', error.message);
  console.log('📋 Error details saved for analysis.');
  process.exit(1);
}