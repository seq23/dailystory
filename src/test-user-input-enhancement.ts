// Test User Input Enhancement System Integration
import { EnhancedInputProcessor } from './services/enhancedInputProcessor';
import { ContextualCharacterEnhancer } from './services/contextualCharacterEnhancer';
import type { UserInfo } from './types';

export async function testUserInputEnhancement() {
  console.log('🧪 Testing User Input Enhancement System...');
  
  // Test user data
  const testUser: UserInfo = {
    name: 'Luna',
    age: 8,
    grade: '2nd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'girl', skinTone: 'medium' },
    favoriteColor: 'purple',
    favoriteAnimal: 'butterfly',
    hobbies: 'painting and dancing',
    favoriteFood: 'pizza',
    specialRequest: 'I want stories about science and friendship'
  };

  try {
    // Test 1: Enhanced Input Processing
    console.log('🔍 Testing Enhanced Input Processing...');
    const processedInputs = await EnhancedInputProcessor.processUserInputsAdvanced(testUser, 'easy');
    console.log('✅ Enhanced inputs processed:', {
      characterTraits: processedInputs.characterTraits.slice(0, 3),
      storyElements: processedInputs.storyElements.slice(0, 3),
      culturalConnections: processedInputs.culturalConnections.slice(0, 2)
    });

    // Test 2: Contextual Character Enhancement
    console.log('🎭 Testing Contextual Character Enhancement...');
    const testTemplate = "Today Luna goes to the science lab to work on her project.";
    const enhancementContext = {
      currentPage: 1,
      totalPages: 5,
      gradeLevel: 2,
      templateTheme: 'science',
      storyProgression: 'opening' as const
    };
    
    const enhancedTemplate = ContextualCharacterEnhancer.enhanceTemplateWithContext(
      testTemplate,
      testUser,
      'easy',
      enhancementContext
    );
    
    console.log('✅ Template enhanced:', {
      original: testTemplate,
      enhanced: enhancedTemplate
    });

    // Test 3: System Analytics
    console.log('📊 Testing System Analytics...');
    const analytics = EnhancedInputProcessor.getProcessingAnalytics();
    console.log('✅ Processing analytics:', analytics);

    console.log('🎉 User Input Enhancement System: ALL TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run test in development
if (typeof window !== 'undefined') {
  (window as any).testUserInputEnhancement = testUserInputEnhancement;
  console.log('🔧 Test function available: testUserInputEnhancement()');
}