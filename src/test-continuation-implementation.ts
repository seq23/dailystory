// Test script to verify the continuation implementation
import { quickTest, runContinuationTests } from '@/utils/storyTemplateContinuationTester';

console.log('🧪 Testing Level 0 continuation and template exhaustion implementation...');

// Run quick verification test first
quickTest().then((result) => {
  console.log(`Quick test result: ${result ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (result) {
    console.log('✅ Implementation appears to be working correctly!');
  } else {
    console.log('❌ Issues detected in implementation');
  }
}).catch((error) => {
  console.error('Test execution failed:', error);
});

// Also run comprehensive tests
runContinuationTests().then((results) => {
  console.log('📊 Comprehensive test results:', results);
}).catch((error) => {
  console.error('Comprehensive tests failed:', error);
});