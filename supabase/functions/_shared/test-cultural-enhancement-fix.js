// Test file to verify the cultural enhancement fix
// This validates that English + non-dark skin users get NO cultural enhancements

import { FrontendIntelligence } from './FrontendIntelligence.js';

console.log('🧪 Testing Cultural Enhancement Fix...\n');

// Test data
const testUsers = [
  {
    name: 'English + Pale User',
    userInfo: {
      nativeLanguage: 'en',
      avatarIdentity: { skinTone: 'pale', type: 'boy' }
    },
    expectedBehavior: 'NO cultural enhancements'
  },
  {
    name: 'English + Light User', 
    userInfo: {
      nativeLanguage: 'en',
      avatarIdentity: { skinTone: 'light', type: 'girl' }
    },
    expectedBehavior: 'NO cultural enhancements'
  },
  {
    name: 'English + Dark User',
    userInfo: {
      nativeLanguage: 'en', 
      avatarIdentity: { skinTone: 'dark', type: 'boy' }
    },
    expectedBehavior: 'African American enhancements only'
  },
  {
    name: 'Spanish + Any Skin User',
    userInfo: {
      nativeLanguage: 'es',
      avatarIdentity: { skinTone: 'medium', type: 'girl' }
    },
    expectedBehavior: 'Spanish cultural profile'
  }
];

const culturalProfile = {
  skinToneKeywords: ['light skin', 'medium skin', 'dark skin'],
  hairStyleKeywords: ['curly hair', 'straight hair'],
  clothingKeywords: ['casual clothes', 'traditional wear'],
  culturalElements: ['cultural symbols', 'traditional art']
};

console.log('='.repeat(60));

for (const testCase of testUsers) {
  console.log(`\n🔍 Testing: ${testCase.name}`);
  console.log(`Expected: ${testCase.expectedBehavior}`);
  
  // Test African American detection
  const isAfricanAmerican = FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(
    testCase.userInfo.avatarIdentity, 
    testCase.userInfo
  );
  
  // Test native language profile detection
  const shouldApplyNativeProfile = FrontendIntelligence.shouldApplyNativeLanguageCulturalProfile(
    testCase.userInfo
  );
  
  // Test visual prompt enhancement
  const basePrompt = 'A child reading a book';
  const enhancedPrompt = FrontendIntelligence.enhanceVisualPromptWithCulture(
    basePrompt,
    testCase.userInfo,
    culturalProfile,
    'story about reading'
  );
  
  console.log(`✅ African American: ${isAfricanAmerican}`);
  console.log(`✅ Native Profile: ${shouldApplyNativeProfile}`); 
  console.log(`✅ Enhancement Applied: ${enhancedPrompt !== basePrompt ? 'YES' : 'NO'}`);
  console.log(`📝 Result: "${enhancedPrompt}"`);
  
  // Validate expected behavior
  if (testCase.expectedBehavior === 'NO cultural enhancements') {
    const isCorrect = !isAfricanAmerican && !shouldApplyNativeProfile && enhancedPrompt === basePrompt;
    console.log(`${isCorrect ? '✅ CORRECT' : '❌ FAILED'}: No enhancements applied`);
  } else if (testCase.expectedBehavior === 'African American enhancements only') {
    const isCorrect = isAfricanAmerican && !shouldApplyNativeProfile;
    console.log(`${isCorrect ? '✅ CORRECT' : '❌ FAILED'}: African American only`);
  } else if (testCase.expectedBehavior === 'Spanish cultural profile') {
    const isCorrect = !isAfricanAmerican && shouldApplyNativeProfile;
    console.log(`${isCorrect ? '✅ CORRECT' : '❌ FAILED'}: Native language profile`);
  }
  
  console.log('-'.repeat(40));
}

console.log('\n🎯 Cultural Enhancement Fix Test Complete!');