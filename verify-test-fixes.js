const { execSync } = require('child_process');

console.log('🔍 Verifying Test Fixes...\n');

try {
  console.log('Running unit tests...');
  const result = execSync('npx vitest run src/test/unit --reporter=basic --no-coverage --run', { 
    encoding: 'utf8', 
    stdio: 'inherit',
    timeout: 60000 
  });
  console.log('\n✅ Tests completed successfully!');
} catch (error) {
  console.log('\n❌ Tests still have issues. Error output above.');
  process.exit(1);
}