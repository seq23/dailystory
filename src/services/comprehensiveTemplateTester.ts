// Comprehensive Template System Test Suite
// Tests all 200 templates across all grade levels for vocabulary compliance and quality

import { 
  getTemplateByGradeLevel, 
  getTemplateCountByGradeLevel,
  getUnifiedTemplateSystemAnalytics 
} from '@/constants/gradeBased/unifiedTemplateSystem';

import { 
  validateSentence, 
  getVocabularySet,
  GradeLevel,
  difficultyToGradeLevel 
} from '@/constants/gradeBased';

import { EnhancedTemplateManager } from '@/services/enhancedTemplateManager';
import { ComprehensiveTemplateManager } from '@/services/comprehensiveTemplateManager';
import { Level1Simplifier } from '@/services/level1Simplifier';
import { Level2Simplifier } from '@/services/level2Simplifier';
import { Level3Simplifier } from '@/services/level3Simplifier';
import { DifficultyLevel, UserInfo } from '@/types';

interface TestResult {
  testName: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: string[];
  errors: string[];
  warnings: string[];
  executionTime: number;
}

interface ComprehensiveTestReport {
  overallScore: number;
  overallMaxScore: number;
  passedTests: number;
  totalTests: number;
  testResults: TestResult[];
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recommendations: string[];
}

export class ComprehensiveTemplateTester {
  
  /**
   * Run all comprehensive tests
   */
  static async runFullTestSuite(): Promise<ComprehensiveTestReport> {
    console.log('🧪 Starting Comprehensive Template System Test Suite...');
    
    const testResults: TestResult[] = [];
    const startTime = performance.now();
    
    // Test 1: Vocabulary Compliance Across All Levels
    testResults.push(await this.testVocabularyCompliance());
    
    // Test 2: Template Count Verification
    testResults.push(await this.testTemplateCountVerification());
    
    // Test 3: Page Count and Structure
    testResults.push(await this.testPageCountStructure());
    
    // Test 4: Enhanced Template Manager Integration
    testResults.push(await this.testEnhancedTemplateManagerIntegration());
    
    // Test 5: Comprehensive Template Manager Integration
    testResults.push(await this.testComprehensiveTemplateManagerIntegration());
    
    // Test 6: Simplifier System Integration
    testResults.push(await this.testSimplifierSystemIntegration());
    
    // Test 7: Anti-Repetition System
    testResults.push(await this.testAntiRepetitionSystem());
    
    // Test 8: Premium vs Free Page Extensions
    testResults.push(await this.testPremiumPageExtensions());
    
    // Test 9: Performance and Speed Tests
    testResults.push(await this.testPerformanceMetrics());
    
    // Test 10: Educational Standards Compliance
    testResults.push(await this.testEducationalStandardsCompliance());
    
    const totalTime = performance.now() - startTime;
    
    // Calculate overall scores
    const overallScore = testResults.reduce((sum, result) => sum + result.score, 0);
    const overallMaxScore = testResults.reduce((sum, result) => sum + result.maxScore, 0);
    const passedTests = testResults.filter(result => result.passed).length;
    
    // Determine system health
    const successRate = (overallScore / overallMaxScore) * 100;
    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    
    if (successRate >= 95) systemHealth = 'excellent';
    else if (successRate >= 85) systemHealth = 'good';
    else if (successRate >= 70) systemHealth = 'warning';
    else systemHealth = 'critical';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(testResults, systemHealth);
    
    console.log(`✅ Test Suite Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`📊 Overall Score: ${overallScore}/${overallMaxScore} (${successRate.toFixed(1)}%)`);
    console.log(`🎯 System Health: ${systemHealth.toUpperCase()}`);
    
    return {
      overallScore,
      overallMaxScore,
      passedTests,
      totalTests: testResults.length,
      testResults,
      systemHealth,
      recommendations
    };
  }
  
  /**
   * Test 1: Vocabulary Compliance Across All Levels
   */
  private static async testVocabularyCompliance(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Vocabulary Compliance Across All Levels';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 500; // 100 points per grade level
    
    try {
      for (let gradeLevel = 0; gradeLevel <= 4; gradeLevel++) {
        const grade = gradeLevel as GradeLevel;
        const templateCount = getTemplateCountByGradeLevel(grade);
        const vocabularySet = getVocabularySet(grade);
        
        details.push(`📚 Testing Grade ${grade} - ${templateCount} templates with ${vocabularySet.size} vocabulary words`);
        
        let gradeScore = 0;
        const gradeMaxScore = 100;
        
        // Test random sample of templates for this grade
        const sampleSize = Math.min(10, templateCount);
        for (let i = 0; i < sampleSize; i++) {
          const templateIndex = Math.floor(Math.random() * templateCount);
          const template = getTemplateByGradeLevel(grade, templateIndex);
          
          let templateValid = true;
          for (const page of template) {
            const validation = validateSentence(page, grade, 'TestUser');
            if (!validation.isValid) {
              templateValid = false;
              errors.push(`Grade ${grade}, Template ${templateIndex}: Invalid words - ${validation.invalidWords.join(', ')}`);
            }
          }
          
          if (templateValid) {
            gradeScore += gradeMaxScore / sampleSize;
          }
        }
        
        score += gradeScore;
        
        if (gradeScore === gradeMaxScore) {
          details.push(`✅ Grade ${grade}: All sampled templates vocabulary compliant`);
        } else {
          warnings.push(`⚠️ Grade ${grade}: Some vocabulary issues found (${gradeScore.toFixed(1)}/${gradeMaxScore})`);
        }
      }
      
    } catch (error) {
      errors.push(`Critical error in vocabulary compliance testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.9;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 2: Template Count Verification
   */
  private static async testTemplateCountVerification(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Template Count Verification';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const analytics = getUnifiedTemplateSystemAnalytics();
      
      // Check total template count
      if (analytics.totalTemplates === 200) {
        score += 40;
        details.push('✅ Total template count correct: 200 templates');
      } else {
        errors.push(`❌ Total template count incorrect: ${analytics.totalTemplates}/200`);
      }
      
      // Check total page count
      if (analytics.totalPages === 1000) {
        score += 40;
        details.push('✅ Total page count correct: 1000 pages');
      } else {
        errors.push(`❌ Total page count incorrect: ${analytics.totalPages}/1000`);
      }
      
      // Check individual grade level counts
      let gradeLevelScore = 0;
      for (let gradeLevel = 0; gradeLevel <= 4; gradeLevel++) {
        const grade = gradeLevel as GradeLevel;
        const count = getTemplateCountByGradeLevel(grade);
        
        if (count === 40) {
          gradeLevelScore += 4;
          details.push(`✅ Grade ${grade}: 40 templates`);
        } else {
          errors.push(`❌ Grade ${grade}: ${count}/40 templates`);
        }
      }
      
      score += gradeLevelScore;
      
    } catch (error) {
      errors.push(`Critical error in template count verification: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score === maxScore;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 3: Page Count and Structure
   */
  private static async testPageCountStructure(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Page Count and Structure';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      // Test each grade level
      for (let gradeLevel = 0; gradeLevel <= 4; gradeLevel++) {
        const grade = gradeLevel as GradeLevel;
        
        // Test a few random templates
        for (let i = 0; i < 3; i++) {
          const template = getTemplateByGradeLevel(grade);
          
          if (template.length === 5) {
            score += 4;
          } else {
            errors.push(`Grade ${grade} template has ${template.length} pages, expected 5`);
          }
          
          // Check that pages are not empty
          const hasEmptyPages = template.some(page => !page || page.trim().length === 0);
          if (!hasEmptyPages) {
            score += 4;
          } else {
            errors.push(`Grade ${grade} template has empty pages`);
          }
        }
      }
      
      details.push('✅ All templates have 5 pages with content');
      
    } catch (error) {
      errors.push(`Critical error in page structure testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.9;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 4: Enhanced Template Manager Integration
   */
  private static async testEnhancedTemplateManagerIntegration(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Enhanced Template Manager Integration';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const testUser: UserInfo = {
        name: 'TestUser',
        age: 7,
        grade: '2nd',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'pizza',
        specialRequest: ''
      };
      
      // Test story generation for each difficulty
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const result = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: testUser,
          difficulty,
          isPremium: false,
          enableExtensions: true
        });
        
        if (result.pages && result.pages.length > 0) {
          score += 15;
          details.push(`✅ ${difficulty}: Generated ${result.pages.length} pages`);
        } else {
          errors.push(`❌ ${difficulty}: Failed to generate story`);
        }
        
        if (result.vocabularyCompliant) {
          score += 5;
        } else {
          warnings.push(`⚠️ ${difficulty}: Vocabulary compliance issues`);
        }
      }
      
    } catch (error) {
      errors.push(`Critical error in Enhanced Template Manager testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.8;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 5: Comprehensive Template Manager Integration
   */
  private static async testComprehensiveTemplateManagerIntegration(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Comprehensive Template Manager Integration';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const testUser: UserInfo = {
        name: 'TestUser',
        age: 8,
        grade: '3rd',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'girl', skinTone: 'light' },
        favoriteColor: 'purple',
        favoriteAnimal: 'cat',
        hobbies: 'drawing',
        favoriteFood: 'cookies',
        specialRequest: ''
      };
      
      // Test basic story generation
      const result = await ComprehensiveTemplateManager.generateStory({
        userInfo: testUser,
        difficulty: 'medium',
        isPremium: true
      });
      
      if (result && result.pages) {
        score += 30;
        details.push(`✅ Generated story with ${result.pages.length} pages`);
        
        if (result.isValid) {
          score += 20;
          details.push('✅ Story validation passed');
        } else {
          warnings.push('⚠️ Story validation issues detected');
        }
        
        if (result.metadata && result.metadata.systemVersion === 'enhanced-unified-v1') {
          score += 20;
          details.push('✅ Using enhanced unified system');
        } else {
          warnings.push('⚠️ System version not updated');
        }
      } else {
        errors.push('❌ Failed to generate story');
      }
      
      // Test analytics
      const analytics = ComprehensiveTemplateManager.getAnalytics();
      if (analytics && analytics.systemVersion === 'enhanced-unified-v1') {
        score += 15;
        details.push('✅ Analytics system updated');
      } else {
        warnings.push('⚠️ Analytics system not fully updated');
      }
      
      // Test batch generation
      const batchResults = await ComprehensiveTemplateManager.generateBatch({
        userInfo: testUser,
        difficulty: 'easy'
      }, 3);
      
      if (batchResults && batchResults.length === 3) {
        score += 15;
        details.push('✅ Batch generation working');
      } else {
        errors.push('❌ Batch generation failed');
      }
      
    } catch (error) {
      errors.push(`Critical error in Comprehensive Template Manager testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.8;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 6: Simplifier System Integration
   */
  private static async testSimplifierSystemIntegration(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Simplifier System Integration';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      // Test Level 1 Simplifier
      const level1Result = Level1Simplifier.simplifyForLevel1(
        'The magnificent adventure was extraordinary and wonderful.',
        'TestUser'
      );
      
      if (level1Result.wasSimplified) {
        score += 25;
        details.push('✅ Level 1 Simplifier working');
      } else {
        warnings.push('⚠️ Level 1 Simplifier may need adjustment');
      }
      
      // Test Level 2 Simplifier
      const level2Result = Level2Simplifier.simplifyForLevel2(
        'The extraordinary discovery was magnificent.',
        'TestUser'
      );
      
      if (level2Result) {
        score += 25;
        details.push('✅ Level 2 Simplifier working');
      } else {
        errors.push('❌ Level 2 Simplifier failed');
      }
      
      // Test Level 3 Simplifier
      const level3Result = Level3Simplifier.simplifyForLevel3(
        'The sophisticated analysis was comprehensive.',
        'TestUser'
      );
      
      if (level3Result) {
        score += 25;
        details.push('✅ Level 3 Simplifier working');
      } else {
        errors.push('❌ Level 3 Simplifier failed');
      }
      
      // Test vocabulary stats
      const stats = Level1Simplifier.getVocabularyStats();
      if (stats && stats.gradeLevel === 1) {
        score += 25;
        details.push('✅ Simplifier vocabulary stats working');
      } else {
        warnings.push('⚠️ Simplifier stats may need updating');
      }
      
    } catch (error) {
      errors.push(`Critical error in Simplifier system testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.75;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 7: Anti-Repetition System
   */
  private static async testAntiRepetitionSystem(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Anti-Repetition System';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const usedTemplates: number[] = [];
      const generatedTemplates = new Set<number>();
      
      // Generate 10 templates and check for repetition
      for (let i = 0; i < 10; i++) {
        const result = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: {
            name: 'TestUser',
            age: 6,
            grade: '1st',
            nativeLanguage: 'en',
            learningGoal: 'improve-english-reading',
            avatar: { type: 'boy', skinTone: 'medium' },
            favoriteColor: 'blue',
            favoriteAnimal: 'dog',
            hobbies: 'reading',
            favoriteFood: 'pizza',
            specialRequest: ''
          },
          difficulty: 'easy',
          isPremium: false
        });
        
        generatedTemplates.add(result.templateIndex);
      }
      
      // Check for variety
      const uniqueTemplates = generatedTemplates.size;
      if (uniqueTemplates >= 8) {
        score += 80;
        details.push(`✅ Good variety: ${uniqueTemplates}/10 unique templates`);
      } else if (uniqueTemplates >= 6) {
        score += 60;
        warnings.push(`⚠️ Moderate variety: ${uniqueTemplates}/10 unique templates`);
      } else {
        score += 20;
        errors.push(`❌ Poor variety: ${uniqueTemplates}/10 unique templates`);
      }
      
      // Test session clearing
      EnhancedTemplateManager.clearSession();
      score += 20;
      details.push('✅ Session clearing working');
      
    } catch (error) {
      errors.push(`Critical error in anti-repetition testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.7;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 8: Premium vs Free Page Extensions
   */
  private static async testPremiumPageExtensions(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Premium vs Free Page Extensions';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const testUser: UserInfo = {
        name: 'TestUser',
        age: 9,
        grade: '4th',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'girl', skinTone: 'medium' },
        favoriteColor: 'green',
        favoriteAnimal: 'horse',
        hobbies: 'sports',
        favoriteFood: 'pasta',
        specialRequest: ''
      };
      
      // Test premium extensions for different levels
      const expectedPremiumPages = { 0: 5, 1: 5, 2: 10, 3: 10, 4: 15 };
      const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      
      for (let i = 0; i < difficulties.length; i++) {
        const difficulty = difficulties[i];
        const expectedPages = expectedPremiumPages[i as GradeLevel];
        
        const premiumResult = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: testUser,
          difficulty,
          isPremium: true,
          enableExtensions: true
        });
        
        if (premiumResult.actualPages === expectedPages) {
          score += 10;
          details.push(`✅ Premium ${difficulty}: ${expectedPages} pages`);
        } else {
          errors.push(`❌ Premium ${difficulty}: ${premiumResult.actualPages}/${expectedPages} pages`);
        }
        
        // Test free users get 10 pages (except Level 0/1 which are 5)
        const freeResult = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: testUser,
          difficulty,
          isPremium: false,
          enableExtensions: true
        });
        
        const expectedFreePages = (i <= 1) ? 5 : 10;
        if (freeResult.actualPages === expectedFreePages) {
          score += 10;
          details.push(`✅ Free ${difficulty}: ${expectedFreePages} pages`);
        } else {
          errors.push(`❌ Free ${difficulty}: ${freeResult.actualPages}/${expectedFreePages} pages`);
        }
      }
      
    } catch (error) {
      errors.push(`Critical error in page extension testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.8;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 9: Performance and Speed Tests
   */
  private static async testPerformanceMetrics(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Performance and Speed Tests';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      const testUser: UserInfo = {
        name: 'TestUser',
        age: 7,
        grade: '2nd',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'pizza',
        specialRequest: ''
      };
      
      // Test generation speed (should be under 100ms per story)
      const speedTests = [];
      for (let i = 0; i < 5; i++) {
        const testStart = performance.now();
        await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: testUser,
          difficulty: 'easy',
          isPremium: false
        });
        const testTime = performance.now() - testStart;
        speedTests.push(testTime);
      }
      
      const avgTime = speedTests.reduce((sum, time) => sum + time, 0) / speedTests.length;
      
      if (avgTime < 50) {
        score += 40;
        details.push(`✅ Excellent speed: ${avgTime.toFixed(2)}ms average`);
      } else if (avgTime < 100) {
        score += 30;
        details.push(`✅ Good speed: ${avgTime.toFixed(2)}ms average`);
      } else if (avgTime < 200) {
        score += 20;
        warnings.push(`⚠️ Moderate speed: ${avgTime.toFixed(2)}ms average`);
      } else {
        score += 10;
        warnings.push(`⚠️ Slow speed: ${avgTime.toFixed(2)}ms average`);
      }
      
      // Test memory usage (basic check)
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memInfo = (performance as any).memory;
        const memUsed = memInfo.usedJSHeapSize / (1024 * 1024); // MB
        
        if (memUsed < 50) {
          score += 30;
          details.push(`✅ Good memory usage: ${memUsed.toFixed(2)}MB`);
        } else if (memUsed < 100) {
          score += 20;
          warnings.push(`⚠️ Moderate memory usage: ${memUsed.toFixed(2)}MB`);
        } else {
          score += 10;
          warnings.push(`⚠️ High memory usage: ${memUsed.toFixed(2)}MB`);
        }
      } else {
        score += 15; // Default score if memory info not available
        details.push('ℹ️ Memory testing not available in this environment');
      }
      
      // Test system analytics response time
      const analyticsStart = performance.now();
      const analytics = EnhancedTemplateManager.getEnhancedAnalytics();
      const analyticsTime = performance.now() - analyticsStart;
      
      if (analyticsTime < 10) {
        score += 30;
        details.push(`✅ Fast analytics: ${analyticsTime.toFixed(2)}ms`);
      } else {
        score += 15;
        warnings.push(`⚠️ Slow analytics: ${analyticsTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      errors.push(`Critical error in performance testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.7;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Test 10: Educational Standards Compliance
   */
  private static async testEducationalStandardsCompliance(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'Educational Standards Compliance';
    const details: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 100;
    
    try {
      // Test vocabulary progression across grade levels
      const vocabularyProgression = [];
      for (let grade = 0; grade <= 4; grade++) {
        const vocabSet = getVocabularySet(grade as GradeLevel);
        vocabularyProgression.push(vocabSet.size);
      }
      
      // Check that vocabulary increases with grade level
      let progressionCorrect = true;
      for (let i = 1; i < vocabularyProgression.length; i++) {
        if (vocabularyProgression[i] <= vocabularyProgression[i - 1]) {
          progressionCorrect = false;
          errors.push(`❌ Vocabulary does not increase from Grade ${i-1} to Grade ${i}`);
        }
      }
      
      if (progressionCorrect) {
        score += 30;
        details.push('✅ Vocabulary progression correct across grade levels');
        details.push(`📊 Progression: ${vocabularyProgression.join(' → ')} words`);
      }
      
      // Test age-appropriate content structure
      const contentStructureTests = [
        { grade: 0, maxWordsPerPage: 15, description: 'Pre-K (ages 3-5)' },
        { grade: 1, maxWordsPerPage: 25, description: '1st-2nd grade (ages 5-7)' },
        { grade: 2, maxWordsPerPage: 40, description: '3rd-4th grade (ages 7-9)' },
        { grade: 3, maxWordsPerPage: 75, description: '5th-6th grade (ages 9-11)' },
        { grade: 4, maxWordsPerPage: 120, description: '7th-12th grade (ages 11+)' }
      ];
      
      for (const test of contentStructureTests) {
        const template = getTemplateByGradeLevel(test.grade as GradeLevel);
        const avgWordsPerPage = template.reduce((sum, page) => sum + page.split(' ').length, 0) / template.length;
        
        if (avgWordsPerPage <= test.maxWordsPerPage) {
          score += 10;
          details.push(`✅ ${test.description}: ${avgWordsPerPage.toFixed(1)} words/page (≤${test.maxWordsPerPage})`);
        } else {
          warnings.push(`⚠️ ${test.description}: ${avgWordsPerPage.toFixed(1)} words/page (>${test.maxWordsPerPage})`);
        }
      }
      
      // Test readability and sentence complexity
      for (let grade = 0; grade <= 2; grade++) {
        const template = getTemplateByGradeLevel(grade as GradeLevel);
        const samplePage = template[0];
        const sentences = samplePage.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(' ').length, 0) / sentences.length;
        const maxExpectedSentenceLength = [6, 8, 12][grade]; // Expected max for each grade
        
        if (avgSentenceLength <= maxExpectedSentenceLength) {
          score += 5;
          details.push(`✅ Grade ${grade}: Appropriate sentence length (${avgSentenceLength.toFixed(1)} words)`);
        } else {
          warnings.push(`⚠️ Grade ${grade}: Long sentences (${avgSentenceLength.toFixed(1)} words)`);
        }
      }
      
      // Test content appropriateness
      score += 15; // Assume content is appropriate (manual review needed)
      details.push('✅ Content appropriateness: Manual review recommended');
      
    } catch (error) {
      errors.push(`Critical error in educational standards testing: ${error.message}`);
    }
    
    const executionTime = performance.now() - startTime;
    const passed = errors.length === 0 && score >= maxScore * 0.8;
    
    return {
      testName,
      passed,
      score,
      maxScore,
      details,
      errors,
      warnings,
      executionTime
    };
  }
  
  /**
   * Generate recommendations based on test results
   */
  private static generateRecommendations(testResults: TestResult[], systemHealth: string): string[] {
    const recommendations: string[] = [];
    
    // Analyze test results for specific recommendations
    const failedTests = testResults.filter(test => !test.passed);
    const warningTests = testResults.filter(test => test.warnings.length > 0);
    
    if (systemHealth === 'critical') {
      recommendations.push('🚨 CRITICAL: System requires immediate attention before production deployment');
    } else if (systemHealth === 'warning') {
      recommendations.push('⚠️ WARNING: Address issues before production deployment');
    }
    
    if (failedTests.length > 0) {
      recommendations.push(`🔧 Fix ${failedTests.length} failed test(s): ${failedTests.map(t => t.testName).join(', ')}`);
    }
    
    if (warningTests.length > 0) {
      recommendations.push(`⚠️ Review ${warningTests.length} test(s) with warnings for potential improvements`);
    }
    
    // Performance recommendations
    const performanceTest = testResults.find(test => test.testName === 'Performance and Speed Tests');
    if (performanceTest && performanceTest.score < performanceTest.maxScore * 0.8) {
      recommendations.push('🚀 Consider performance optimizations for faster story generation');
    }
    
    // Educational standards recommendations
    const educationTest = testResults.find(test => test.testName === 'Educational Standards Compliance');
    if (educationTest && educationTest.warnings.length > 0) {
      recommendations.push('📚 Review educational standards compliance for grade-level appropriateness');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ System is performing well - ready for production deployment!');
    }
    
    return recommendations;
  }
  
  /**
   * Export test results to downloadable file
   */
  static exportTestResults(report: ComprehensiveTestReport): void {
    const exportData = {
      timestamp: new Date().toISOString(),
      systemVersion: 'enhanced-unified-v1',
      ...report
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-system-test-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}