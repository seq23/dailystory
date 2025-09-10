const { spawn } = require('child_process');

// Run the TypeScript to JavaScript converter
const converter = spawn('node', ['scripts/ts-to-js-converter.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

converter.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ TypeScript to JavaScript conversion completed successfully!');
  } else {
    console.error(`\n❌ Conversion failed with exit code ${code}`);
    process.exit(code);
  }
});

converter.on('error', (error) => {
  console.error('Failed to start conversion process:', error);
  process.exit(1);
});