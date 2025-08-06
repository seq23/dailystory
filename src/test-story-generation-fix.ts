// Story Generation System Test - Verify fixed story generation across all levels
import { SimplifiedTemplateManager } from './services/simplifiedTemplateManager';
import { SimplifiedLevel0Processor } from './services/simplifiedLevel0Processor';
import { UniversalContentManager } from './services/universalContentManager';
import { UserInfo, DifficultyLevel } from './types';

const testUser: UserInfo = {
  name: 'Sequoia',
  favoriteAnimal: 'elephant',
  favoriteColor: 'purple',
  nativeLanguage: 'en',
  storyLanguagePreference: 'en',
  age: 8,
  grade: '3rd',
  learningGoal: 'improve-english-reading',
  avatar: {
    type: 'boy',
    skinTone: 'medium'
  },
  hobbies: 'reading',
  favoriteFood: 'pizza',
  specialRequest: ''
};

async function testStoryGeneration() {
  console.log('🧪 Testing fixed story generation system...');
  
  const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  
  for (const difficulty of difficulties) {
    console.log(`\n🎯 Testing ${difficulty} level:`);
    
    try {
      if (difficulty === 'beginner') {
        // Test Level 0 with SimplifiedLevel0Processor
        const result = await SimplifiedLevel0Processor.generateStory(testUser, false);
        console.log(`✅ Level 0 (${difficulty}): Generated ${result.content.length} pages`);
        console.log(`   Sample: "${result.content[0]?.substring(0, 50)}..."`);
        
        // Test continuation
        const continuation = await SimplifiedLevel0Processor.continueStory(testUser, false, 5);
        console.log(`✅ Level 0 continuation: Generated ${continuation.content.length} pages`);
        
      } else {
        // Test Levels 1-4 with SimplifiedTemplateManager
        const result = await SimplifiedTemplateManager.generateStory({
          userInfo: testUser,
          difficulty,
          isPremium: false
        });
        console.log(`✅ ${difficulty}: Generated ${result.pages.length} pages`);
        console.log(`   Sample: "${result.pages[0]?.substring(0, 50)}..."`);
        console.log(`   Vocabulary compliant: ${result.vocabularyCompliant}`);
        
        // Test continuation
        const continuation = await SimplifiedTemplateManager.continueStory({
          userInfo: testUser,
          difficulty,
          isPremium: false,
          targetPages: 5
        });
        console.log(`✅ ${difficulty} continuation: Generated ${continuation.pages.length} pages`);
      }
      
    } catch (error) {
      console.error(`❌ ${difficulty} failed:`, error);
    }
  }
  
  // Test UniversalContentManager integration
  console.log(`\n🔗 Testing UniversalContentManager integration:`);
  
  for (const difficulty of difficulties) {
    try {
      const config = { isPremium: false, userId: testUser.name };
      const result = await UniversalContentManager.generateStory(testUser, difficulty, config);
      console.log(`✅ Universal ${difficulty}: Generated ${result.story.segments?.length || 'unknown'} segments`);
      
      // Test continuation via UniversalContentManager
      const currentStory = result.story.segments?.map(s => s.text) || [];
      const continued = await UniversalContentManager.continueExistingStory(
        currentStory, 
        testUser, 
        difficulty, 
        config
      );
      console.log(`✅ Universal ${difficulty} continuation: Total ${continued.segments?.length || 'unknown'} segments`);
      
    } catch (error) {
      console.error(`❌ Universal ${difficulty} failed:`, error);
    }
  }
  
  console.log('\n🎉 Story generation system test completed!');
}

// Export for use
export { testStoryGeneration };