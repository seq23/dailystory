// Phase 4 Validation System Test
// Quick verification that all components are working correctly

import { PromptValidationEngine } from '@/utils/promptValidationEngine';
import type { UserInfo, DifficultyLevel } from '@/types';

// Test function to verify the validation system works
export const testValidationSystem = () => {
  console.log('🧪 Testing Phase 4 Validation System...');
  
  // Mock user info for testing
  const mockUserInfo: UserInfo = {
    name: 'Alex',
    age: 7,
    grade: '2nd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'cat',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: ''
  };
  
  // Test 1: Short prompt (should pass)
  const shortPrompt = "A simple children's book illustration showing Alex playing with a cat";
  const shortResult = PromptValidationEngine.validatePromptBeforeGeneration(
    shortPrompt,
    mockUserInfo,
    'beginner'
  );
  
  console.log('✅ Short prompt test:', {
    isValid: shortResult.isValid,
    severity: shortResult.severity,
    length: shortResult.estimatedLength,
    issues: shortResult.issues.length
  });
  
  // Test 2: Long prompt (should trigger optimization suggestions)
  const longPrompt = "A highly detailed, ultra-realistic, award-winning masterpiece children's book illustration with sophisticated artistic techniques, complex composition, intricate details, museum-quality rendering, vibrant colors, perfect lighting, professional artwork composition, high-quality detailed artwork, child-appropriate content, consistent character design, inclusive and diverse representation, completely text-free, sophisticated visual storytelling mastery, beautiful vibrant colors, exceptional artistic craftsmanship, professional illustration excellence showing Alex the young boy with medium skin tone playing happily with a friendly orange tabby cat in a bright, colorful playground setting with swings, slides, trees, flowers, blue sky, white clouds, warm sunlight, joyful atmosphere, safe wholesome content for young children, educational value, engaging storytelling, perfect for early readers, contemporary children's book art style, diverse representation, soft rounded features, warm and inviting atmosphere, gentle expressions and body language, learning-focused, minimal distractions".repeat(5);
  
  const longResult = PromptValidationEngine.validatePromptBeforeGeneration(
    longPrompt,
    mockUserInfo,
    'expert'
  );
  
  console.log('⚠️ Long prompt test:', {
    isValid: longResult.isValid,
    severity: longResult.severity,
    length: longResult.estimatedLength,
    issues: longResult.issues.length,
    fallbackSuggested: longResult.fallbackSuggested
  });
  
  // Test 3: Monitoring dashboard
  const dashboardData = PromptValidationEngine.getMonitoringDashboard();
  console.log('📊 Monitoring dashboard test:', {
    totalGenerations: dashboardData.statistics.totalGenerations,
    hasRecentData: dashboardData.recentGenerations.length > 0,
    hasStatistics: Object.keys(dashboardData.statistics).length > 0
  });
  
  console.log('✅ Phase 4 Validation System test complete!');
  
  return {
    shortPrompt: shortResult,
    longPrompt: longResult,
    dashboard: dashboardData
  };
};

// Export for use in development/testing
if (typeof window !== 'undefined') {
  (window as any).testValidationSystem = testValidationSystem;
  console.log('🧪 Validation system test available as window.testValidationSystem()');
}