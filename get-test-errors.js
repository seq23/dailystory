const { execSync } = require('child_process');

console.log('🔍 Running tests with detailed error output...\n');

try {
  const result = execSync('npx vitest run src/test/unit --reporter=verbose --no-coverage --run', { 
    encoding: 'utf8', 
    stdio: 'pipe',
    timeout: 60000 
  });
  console.log(result);
} catch (error) {
  console.log('❌ Tests failed. Full error output:');
  console.log(error.stdout || 'No stdout');
  console.log('\n🔍 Error details:');
  console.log(error.stderr || 'No stderr');
}