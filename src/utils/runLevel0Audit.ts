/**
 * Quick audit runner to test Level 0 vocabulary compliance
 * Run this to verify all systems are working correctly
 */

import { ComprehensiveLevel0Audit } from './comprehensiveLevel0Audit';

export async function runLevel0ComplianceCheck() {
  console.log('🚀 Starting Level 0 vocabulary compliance check...');
  
  try {
    // Run full system audit
    const auditResult = await ComprehensiveLevel0Audit.runFullAudit('Sequoia');
    
    // Test story generation for all levels
    console.log('\n🧪 Testing story generation for all levels...');
    for (let level = 0; level <= 4; level++) {
      console.log(`\n--- Testing Level ${level} ---`);
      await ComprehensiveLevel0Audit.testStoryGeneration('Sequoia', 2, level);
    }
    
    // Test premium story generation (longer stories that use extension templates)
    console.log('\n🎯 Testing premium story generation (10+ pages)...');
    await testPremiumStoryGeneration();
    
    // Final summary
    console.log('\n✅ Level 0 audit complete!');
    console.log(`Overall compliant: ${auditResult.overallCompliant ? 'YES' : 'NO'}`);
    
    return auditResult;
  } catch (error) {
    console.error('❌ Error during Level 0 audit:', error);
    throw error;
  }
}

async function testPremiumStoryGeneration() {
  const { EnhancedTemplateManager } = await import('../services/enhancedTemplateManager');
  
  // Correct difficulty mapping
  const difficultyMap = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  
  for (let level = 0; level <= 4; level++) {
    console.log(`Testing premium stories for Level ${level}...`);
    
        const result = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: { 
            name: 'Sequoia', 
            age: 6 + level, 
            grade: `${level}st` as any,
            nativeLanguage: 'en',
            learningGoal: 'improve-english-reading',
            avatar: { type: 'girl', skinTone: 'medium' },
            favoriteColor: 'blue',
            favoriteAnimal: 'cat',
            hobbies: 'reading',
            favoriteFood: 'pizza',
            specialRequest: ''
          },
          difficulty: difficultyMap[level] as any,
          isPremium: true,
          enableExtensions: true
        });
    
    console.log(`✓ Level ${level} premium story: ${result.pages.length} pages generated`);
    console.log(`  Vocabulary compliant: ${result.vocabularyCompliant}`);
    if (!result.vocabularyCompliant && result.validationErrors) {
      console.warn(`  ⚠️ Validation errors: ${result.validationErrors.join(', ')}`);
    }
  }
}

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment - you can run this manually
  (window as any).runLevel0ComplianceCheck = runLevel0ComplianceCheck;
  console.log('💡 Run runLevel0ComplianceCheck() in console to test vocabulary compliance');
}