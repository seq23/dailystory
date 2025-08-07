// AI Generation System Testing Module
import { DifficultyLevel, UserInfo } from '../../types';
import { LiveGenerationService } from '../../services/LiveGenerationService';
import { NetflixStyleStoryService } from '../../services/NetflixStyleStoryService';
import { TestDataGenerator } from '../utils/TestDataGenerator';

export interface AIGenerationTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testType: string;
    userType: 'free' | 'premium';
    difficulty: DifficultyLevel;
    passed: boolean;
    duration: number;
    contentQuality: number;
    issues: string[];
  }>;
}

export class AIGenerationTester {
  private testDataGenerator: TestDataGenerator;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
  }

  async testAIGenerationSystem(): Promise<AIGenerationTestResult> {
    console.log('🤖 Testing AI Generation System...');
    
    const results: AIGenerationTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test Live Generation Service (Premium)
    await this.testLiveGeneration(results);
    
    // Test Netflix Style Service (Free)
    await this.testNetflixStyleGeneration(results);
    
    // Test Content Quality
    await this.testContentQuality(results);

    console.log(`🤖 AI Generation: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testLiveGeneration(results: AIGenerationTestResult): Promise<void> {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const testResult = {
        testType: 'Live Generation',
        userType: 'premium' as const,
        difficulty,
        passed: false,
        duration: 0,
        contentQuality: 0,
        issues: [] as string[]
      };

      const startTime = Date.now();
      
      try {
        const userInfo = this.testDataGenerator.generateRandomUser();
        userInfo.difficultyLevel = difficulty;

        // Test first page generation
        const firstPage = await LiveGenerationService.generateFirstPage(userInfo);
        
        if (!firstPage.content || firstPage.content.trim().length < 50) {
          testResult.issues.push('First page content too short or missing');
        }

        if (!firstPage.content.includes(userInfo.name)) {
          testResult.issues.push('User name not included in story');
        }

        // Test next page generation if first page succeeded
        if (firstPage.isComplete === false && firstPage.nextContext) {
          const nextPage = await LiveGenerationService.generateNextPage(firstPage.nextContext);
          
          if (!nextPage.content || nextPage.content.trim().length < 30) {
            testResult.issues.push('Next page content too short or missing');
          }
        }

        testResult.contentQuality = this.assessContentQuality(firstPage.content);
        testResult.passed = testResult.issues.length === 0 && testResult.contentQuality >= 70;

      } catch (error) {
        testResult.issues.push(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      testResult.duration = Date.now() - startTime;
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testNetflixStyleGeneration(results: AIGenerationTestResult): Promise<void> {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const testResult = {
        testType: 'Netflix Style Generation',
        userType: 'free' as const,
        difficulty,
        passed: false,
        duration: 0,
        contentQuality: 0,
        issues: [] as string[]
      };

      const startTime = Date.now();
      
      try {
        const userInfo = this.testDataGenerator.generateRandomUser();
        userInfo.difficultyLevel = difficulty;

        const story = await NetflixStyleStoryService.generateCompleteStory(userInfo);
        
        if (!story.pages || story.pages.length < 3) {
          testResult.issues.push('Story has insufficient pages');
        }

        if (!story.title || story.title.trim().length < 5) {
          testResult.issues.push('Story title missing or too short');
        }

        // Check if user preferences are included
        const fullStory = story.pages.join(' ');
        if (!fullStory.includes(userInfo.name)) {
          testResult.issues.push('User name not included in story');
        }

        if (story.error) {
          testResult.issues.push(`Story generation error: ${story.error}`);
        }

        testResult.contentQuality = this.assessContentQuality(fullStory);
        testResult.passed = testResult.issues.length === 0 && testResult.contentQuality >= 70 && story.isComplete;

      } catch (error) {
        testResult.issues.push(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      testResult.duration = Date.now() - startTime;
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testContentQuality(results: AIGenerationTestResult): Promise<void> {
    const testResult = {
      testType: 'Content Quality Assessment',
      userType: 'premium' as const,
      difficulty: 'medium' as DifficultyLevel,
      passed: false,
      duration: 0,
      contentQuality: 0,
      issues: [] as string[]
    };

    const startTime = Date.now();
    
    try {
      const userInfo = this.testDataGenerator.generateRandomUser();
      const story = await NetflixStyleStoryService.generateCompleteStory(userInfo);
      
      const qualityChecks = [
        { 
          name: 'Age-appropriate content',
          check: () => this.isAgeAppropriate(story.pages.join(' ')),
          weight: 30
        },
        { 
          name: 'Coherent narrative',
          check: () => this.hasCoherentNarrative(story.pages),
          weight: 25
        },
        { 
          name: 'Appropriate length',
          check: () => this.hasAppropriateLength(story.pages, story.difficulty),
          weight: 20
        },
        { 
          name: 'User personalization',
          check: () => this.includesUserPreferences(story.pages.join(' '), userInfo),
          weight: 25
        }
      ];

      let totalScore = 0;
      for (const qualityCheck of qualityChecks) {
        const passed = qualityCheck.check();
        if (passed) {
          totalScore += qualityCheck.weight;
        } else {
          testResult.issues.push(`Failed: ${qualityCheck.name}`);
        }
      }

      testResult.contentQuality = totalScore;
      testResult.passed = totalScore >= 75;

    } catch (error) {
      testResult.issues.push(`Quality assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    testResult.duration = Date.now() - startTime;
    results.details.push(testResult);
    results.total++;
    
    if (testResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  private assessContentQuality(content: string): number {
    let score = 0;

    // Length check (30 points)
    if (content.length > 100) score += 30;
    else if (content.length > 50) score += 15;

    // Sentence structure (25 points)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) score += 25;
    else if (sentences.length >= 1) score += 12;

    // Word variety (25 points)
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const varietyRatio = uniqueWords.size / words.length;
    if (varietyRatio > 0.6) score += 25;
    else if (varietyRatio > 0.4) score += 15;

    // Positive content (20 points)
    const positiveWords = ['happy', 'fun', 'adventure', 'friend', 'love', 'joy', 'wonderful', 'amazing'];
    const hasPositiveContent = positiveWords.some(word => content.toLowerCase().includes(word));
    if (hasPositiveContent) score += 20;

    return Math.min(score, 100);
  }

  private isAgeAppropriate(content: string): boolean {
    const inappropriateWords = ['violence', 'death', 'scary', 'afraid', 'danger', 'hurt'];
    return !inappropriateWords.some(word => content.toLowerCase().includes(word));
  }

  private hasCoherentNarrative(pages: string[]): boolean {
    if (pages.length < 2) return false;
    
    // Basic coherence check - each page should be reasonably long
    return pages.every(page => page.trim().length > 20);
  }

  private hasAppropriateLength(pages: string[], difficulty: DifficultyLevel): boolean {
    const totalLength = pages.join(' ').length;
    
    switch (difficulty) {
      case 'easy':
        return totalLength >= 200 && totalLength <= 800;
      case 'medium':
        return totalLength >= 400 && totalLength <= 1200;
      case 'hard':
        return totalLength >= 600 && totalLength <= 1600;
      default:
        return totalLength >= 200;
    }
  }

  private includesUserPreferences(content: string, userInfo: UserInfo): boolean {
    const lowerContent = content.toLowerCase();
    return lowerContent.includes(userInfo.name.toLowerCase());
  }
}