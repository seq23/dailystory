// Execute comprehensive system validation
import { validateAllRefactoring } from '@/utils/comprehensiveSystemValidator';

console.log('🔍 TRIPLE-CHECKING ALL REFACTORING WORK...');
console.log('==========================================');

validateAllRefactoring().then(() => {
  console.log('\n🏁 TRIPLE-CHECK VALIDATION COMPLETE');
}).catch(error => {
  console.error('❌ Validation execution failed:', error);
});