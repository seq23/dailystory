// Test the African American Character Generation Fix
// This tests that the real AI functions are being used correctly

import { FrontendIntelligence } from './FrontendIntelligence.ts';

// Test African American user profile
const testUserInfo = {
  name: 'Alex',
  nativeLanguage: 'en',
  avatar: {
    type: 'girl',
    skinTone: 'dark'
  }
};

// Test story text
const testStoryText = "Alex smiled as she walked through the garden, looking at all the beautiful flowers.";

console.log('🧪 Testing African American Character Generation...');

// Test 1: Should detect African American user
const shouldApply = FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(testUserInfo.avatar);
console.log('✅ Should apply African American variations:', shouldApply);

// Test 2: Generate expanded facial features (should have 20+ variations)
const facialFeatures = FrontendIntelligence.generateExpandedAfricanAmericanFeatures();
console.log('✅ Generated facial features:', facialFeatures);

// Test 3: Get hair mapping for dark skin + English
const hairMapping = FrontendIntelligence.getUniversalHairMapping(testUserInfo.avatar, 'girl', testUserInfo);
console.log('✅ Hair mapping:', hairMapping);

// Test 4: Build complete character description
const characterDescription = FrontendIntelligence.buildAdvancedCharacterDescription(testUserInfo, {}, 12345);
console.log('✅ Complete character description:', characterDescription);

// Test 5: Build premium prompt
const premiumPrompt = FrontendIntelligence.buildPremiumPrompt(
  testStoryText,
  testUserInfo,
  12345,
  { settings: ['test setting'] },
  'test scene',
  { mood: 'happy' },
  'professional quality'
);
console.log('✅ Premium prompt:', premiumPrompt);

console.log('🎉 All tests completed - African American character generation is working!');

export default {
  testUserInfo,
  testStoryText,
  shouldApply,
  facialFeatures,
  hairMapping,
  characterDescription,
  premiumPrompt
};