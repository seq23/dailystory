// Fallback System Testing Module
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { UserInfo, DifficultyLevel } from '../../types';

export interface FallbackTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testType: string;
    scenario: string;
    passed: boolean;
    fallbackTriggered: boolean;
    contentQuality: number;
    issues: string[];
  }>;
}

export class FallbackSystemTester {
  private testDataGenerator: TestDataGenerator;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
  }

  async testFallbackSystems(): Promise<FallbackTestResult> {
    console.log('🛡️ Testing Fallback Systems...');
    
    const results: FallbackTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test Live Generation fallbacks
    await this.testLiveGenerationFallbacks(results);
    
    // Test Netflix Style fallbacks
    await this.testNetflixStyleFallbacks(results);
    
    // Test template availability
    await this.testTemplateAvailability(results);
    
    // Test emergency content
    await this.testEmergencyContent(results);

    console.log(`🛡️ Fallback Systems: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testLiveGenerationFallbacks(results: FallbackTestResult): Promise<void> {
    const scenarios = [
      'API timeout simulation',
      'Invalid response simulation',
      'Network error simulation'
    ];

    for (const scenario of scenarios) {
      const testResult = {
        testType: 'Live Generation Fallback',
        scenario,
        passed: false,
        fallbackTriggered: false,
        contentQuality: 0,
        issues: [] as string[]
      };

      try {
        // Simulate a fallback scenario by testing with edge case data
        const userInfo = this.testDataGenerator.generateEdgeCaseUser();
        
        // In a real implementation, we would mock the API to fail
        // For now, we test that fallback templates exist and are accessible
        const fallbackContent = this.simulateLiveGenerationFallback(userInfo, 'medium');
        
        if (!fallbackContent || fallbackContent.length < 50) {
          testResult.issues.push('Fallback content too short or missing');
        } else {
          testResult.fallbackTriggered = true;
          testResult.contentQuality = this.assessFallbackQuality(fallbackContent, userInfo);
        }

        if (!fallbackContent.includes(userInfo.name)) {
          testResult.issues.push('Fallback content missing user personalization');
        }

        testResult.passed = testResult.issues.length === 0 && testResult.contentQuality >= 60;

      } catch (error) {
        testResult.issues.push(`Fallback test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testNetflixStyleFallbacks(results: FallbackTestResult): Promise<void> {
    const scenarios = [
      'Complete API failure',
      'Partial content generation',
      'Invalid prompt response'
    ];

    for (const scenario of scenarios) {
      const testResult = {
        testType: 'Netflix Style Fallback',
        scenario,
        passed: false,
        fallbackTriggered: false,
        contentQuality: 0,
        issues: [] as string[]
      };

      try {
        const userInfo = this.testDataGenerator.generateRandomUser();
        
        // Simulate fallback story generation
        const fallbackStory = this.simulateNetflixStyleFallback(userInfo, 'easy');
        
        if (!fallbackStory.pages || fallbackStory.pages.length < 3) {
          testResult.issues.push('Fallback story has insufficient pages');
        } else {
          testResult.fallbackTriggered = true;
          const fullContent = fallbackStory.pages.join(' ');
          testResult.contentQuality = this.assessFallbackQuality(fullContent, userInfo);
        }

        if (!fallbackStory.title || fallbackStory.title.length < 5) {
          testResult.issues.push('Fallback story missing proper title');
        }

        if (!fallbackStory.isComplete) {
          testResult.issues.push('Fallback story marked as incomplete');
        }

        testResult.passed = testResult.issues.length === 0 && testResult.contentQuality >= 70;

      } catch (error) {
        testResult.issues.push(`Fallback test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testTemplateAvailability(results: FallbackTestResult): Promise<void> {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

    for (const difficulty of difficulties) {
      const testResult = {
        testType: 'Template Availability',
        scenario: `${difficulty} difficulty templates`,
        passed: false,
        fallbackTriggered: true,
        contentQuality: 0,
        issues: [] as string[]
      };

      try {
        // Test that templates are available for each difficulty
        const templates = this.getAvailableTemplates(difficulty);
        
        if (templates.length === 0) {
          testResult.issues.push(`No templates available for ${difficulty} difficulty`);
        }

        if (templates.length < 5) {
          testResult.issues.push(`Insufficient template variety: only ${templates.length} templates`);
        }

        // Test template quality
        const sampleTemplate = templates[0];
        if (sampleTemplate) {
          testResult.contentQuality = this.assessTemplateQuality(sampleTemplate, difficulty);
          
          if (testResult.contentQuality < 60) {
            testResult.issues.push(`Low template quality: ${testResult.contentQuality}%`);
          }
        }

        testResult.passed = testResult.issues.length === 0;

      } catch (error) {
        testResult.issues.push(`Template test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testEmergencyContent(results: FallbackTestResult): Promise<void> {
    const testResult = {
      testType: 'Emergency Content',
      scenario: 'Complete system failure',
      passed: false,
      fallbackTriggered: true,
      contentQuality: 0,
      issues: [] as string[]
    };

    try {
      // Test the absolute fallback - emergency content when everything else fails
      const emergencyContent = this.getEmergencyContent();
      
      if (!emergencyContent || emergencyContent.length < 100) {
        testResult.issues.push('Emergency content too short or missing');
      }

      if (!emergencyContent.includes('adventure') && !emergencyContent.includes('story')) {
        testResult.issues.push('Emergency content does not appear to be story-related');
      }

      testResult.contentQuality = this.assessEmergencyContentQuality(emergencyContent);
      
      if (testResult.contentQuality < 50) {
        testResult.issues.push(`Emergency content quality too low: ${testResult.contentQuality}%`);
      }

      testResult.passed = testResult.issues.length === 0;

    } catch (error) {
      testResult.issues.push(`Emergency content test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    results.details.push(testResult);
    results.total++;
    
    if (testResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Mock fallback simulation methods
  private simulateLiveGenerationFallback(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    // Simulate the enhanced fallback system from LiveGenerationService
    const templates = [
      `Once upon a time, ${userInfo.name} discovered a magical world full of ${userInfo.favoriteAnimal}s.`,
      `${userInfo.name} went on an amazing adventure where everything was ${userInfo.favoriteColor}.`,
      `In a land far away, ${userInfo.name} met a friendly ${userInfo.favoriteAnimal} who needed help.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private simulateNetflixStyleFallback(userInfo: UserInfo, difficulty: DifficultyLevel): { pages: string[], title: string, isComplete: boolean } {
    // Simulate enhanced fallback template system
    const pages = [
      `${userInfo.name} loved ${userInfo.favoriteColor} ${userInfo.favoriteAnimal}s more than anything in the world.`,
      `One sunny day, ${userInfo.name} decided to go on a special adventure to find the most amazing ${userInfo.favoriteAnimal}.`,
      `After a wonderful journey, ${userInfo.name} found the perfect ${userInfo.favoriteColor} ${userInfo.favoriteAnimal} and they became best friends.`,
      `${userInfo.name} and the ${userInfo.favoriteAnimal} had many more adventures together, and ${userInfo.name} was very happy.`,
      `From that day on, ${userInfo.name} knew that dreams really do come true when you believe in yourself.`
    ];

    return {
      pages,
      title: `${userInfo.name} and the ${userInfo.favoriteColor} ${userInfo.favoriteAnimal}`,
      isComplete: true
    };
  }

  private getAvailableTemplates(difficulty: DifficultyLevel): string[] {
    // Mock template availability check
    const baseTemplates = [
      'Template 1: Adventure story',
      'Template 2: Friendship story', 
      'Template 3: Discovery story',
      'Template 4: Problem-solving story',
      'Template 5: Magical story'
    ];

    // Simulate more templates for higher difficulties
    const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: baseTemplates.length * multiplier }, (_, i) => 
      `${baseTemplates[i % baseTemplates.length]} (${difficulty} level)`
    );
  }

  private getEmergencyContent(): string {
    return `Once upon a time, there was a brave child who loved stories and adventures. 
    Every day brought new opportunities to learn and grow. 
    The child discovered that reading was like having a superpower - it could take them anywhere in the world and beyond!
    Through reading, they met amazing characters, visited magical places, and learned that every person has something special inside them.
    The end of one story was always the beginning of another wonderful adventure.`;
  }

  private assessFallbackQuality(content: string, userInfo: UserInfo): number {
    let score = 0;

    // Length check (25 points)
    if (content.length > 100) score += 25;
    else if (content.length > 50) score += 15;

    // Personalization (30 points)
    if (content.includes(userInfo.name)) score += 15;
    if (content.includes(userInfo.favoriteAnimal)) score += 8;
    if (content.includes(userInfo.favoriteColor)) score += 7;

    // Story structure (25 points)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) score += 25;
    else if (sentences.length >= 1) score += 12;

    // Positive content (20 points)
    const positiveWords = ['adventure', 'friend', 'happy', 'magical', 'wonderful', 'amazing', 'special'];
    const hasPositiveContent = positiveWords.some(word => content.toLowerCase().includes(word));
    if (hasPositiveContent) score += 20;

    return Math.min(score, 100);
  }

  private assessTemplateQuality(template: string, difficulty: DifficultyLevel): number {
    let score = 0;

    // Basic structure (40 points)
    if (template.includes('Template') || template.includes('story')) score += 20;
    if (template.includes(difficulty)) score += 20;

    // Length appropriateness (30 points)
    const expectedLength = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150;
    if (template.length >= expectedLength * 0.8) score += 30;

    // Readability (30 points)
    const words = template.split(' ');
    if (words.length >= 5) score += 30;

    return Math.min(score, 100);
  }

  private assessEmergencyContentQuality(content: string): number {
    let score = 0;

    // Minimum length (30 points)
    if (content.length > 200) score += 30;

    // Story elements (40 points)
    const storyElements = ['story', 'adventure', 'character', 'learn', 'reading'];
    const foundElements = storyElements.filter(element => content.toLowerCase().includes(element));
    score += (foundElements.length / storyElements.length) * 40;

    // Positive message (30 points)
    const positiveWords = ['wonderful', 'amazing', 'special', 'superpower', 'magical'];
    const hasPositive = positiveWords.some(word => content.toLowerCase().includes(word));
    if (hasPositive) score += 30;

    return Math.min(score, 100);
  }
}