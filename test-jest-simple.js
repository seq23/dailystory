const { execSync } = require('child_process');

console.log('🧪 Testing Enterprise Jest Infrastructure...\n');

// Simple validation first
const testCommands = [
  'npx jest --version',
  'npx jest tests/ --passWithNoTests --silent',
];

let passed = 0;
let failed = 0;

testCommands.forEach((command, index) => {
  const testName = index === 0 ? 'Jest Installation' : 'Basic Jest Run';
  console.log(`📋 ${testName}: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
    
    console.log(`✅ ${testName} - PASSED`);
    if (output.trim()) {
      console.log(`   Output: ${output.trim().split('\n')[0]}`);
    }
    passed++;
    
  } catch (error) {
    console.log(`❌ ${testName} - FAILED`);
    console.log(`   Error: ${error.message.split('\n')[0]}`);
    failed++;
  }
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🏁 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ Jest infrastructure is working!');
  console.log('\n🚀 Try these commands:');
  console.log('   • npx jest tests/');
  console.log('   • npx jest tests/ --coverage');
} else {
  console.log('⚠️  Issues detected. Jest may not be properly configured.');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');