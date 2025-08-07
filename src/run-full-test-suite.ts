// Execute FULL comprehensive test suite including all UI/UX tests
console.log('🚀 EXECUTING FULL COMPREHENSIVE TEST SUITE');
console.log('=' .repeat(70));

// Execute the comprehensive test file which now includes all tests
import('./execute-comprehensive-tests').then(() => {
  console.log('✅ Full test suite execution completed');
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});

export {};