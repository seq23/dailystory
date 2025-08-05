// Test script to verify extension system implementation
import { ExtensionTemplateValidator } from './extensionTemplateValidator';

export function testExtensionSystem() {
  console.log('🧪 Testing Universal Extension System for Levels 1-4');
  console.log('=' .repeat(60));
  
  // Test free trial user
  console.log('\n📋 Testing FREE TRIAL user access:');
  const freeReport = ExtensionTemplateValidator.generateValidationReport('TestUser', 'free');
  console.log(freeReport);
  
  // Test premium user
  console.log('\n📋 Testing PREMIUM user access:');
  const premiumReport = ExtensionTemplateValidator.generateValidationReport('TestUser', 'premium');
  console.log(premiumReport);
  
  // Test individual grade levels
  console.log('\n🎯 Individual Grade Level Tests:');
  for (let grade = 1; grade <= 4; grade++) {
    const gradeTest = ExtensionTemplateValidator.testGradeLevel(grade as any, 'TestUser', 'free');
    console.log(`Level ${grade}: ${gradeTest.isCompliant ? '✅ PASS' : '❌ FAIL'} (${gradeTest.templates.length} templates)`);
    
    if (!gradeTest.isCompliant) {
      gradeTest.results.forEach(result => {
        if (!result.isValid) {
          console.log(`  ❌ Template ${result.templateIndex}: ${result.invalidWords.join(', ')}`);
        }
      });
    }
  }
  
  // Test Level 0 maintains free/premium distinction
  console.log('\n🔒 Level 0 Free vs Premium distinction:');
  const level0Free = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'free');
  const level0Premium = ExtensionTemplateValidator.testGradeLevel(0, 'TestUser', 'premium');
  
  console.log(`Level 0 Free: ${level0Free.templates.length} templates, ${level0Free.isCompliant ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Level 0 Premium: ${level0Premium.templates.length} templates, ${level0Premium.isCompliant ? '✅ PASS' : '❌ FAIL'}`);
  
  return {
    level0FreePremiumDistinct: level0Free.templates.length !== level0Premium.templates.length,
    allLevelsCompliant: [1,2,3,4].every(grade => 
      ExtensionTemplateValidator.testGradeLevel(grade as any, 'TestUser', 'free').isCompliant
    )
  };
}

// Auto-run test
if (typeof window !== 'undefined') {
  (window as any).testExtensionSystem = testExtensionSystem;
  console.log('💡 Use testExtensionSystem() to verify the extension system');
}