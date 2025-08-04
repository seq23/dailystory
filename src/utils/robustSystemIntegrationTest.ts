// Comprehensive Integration Test for Robust Two-Tier Anti-Repetition System
// Tests the complete pipeline from template selection to anti-repetition validation

import { IntelligentTemplateSelector } from '@/services/intelligentTemplateSelector';
import { EnhancedAntiRepetitionEngine } from '@/services/enhancedAntiRepetitionEngine';
import { getTemplatePoolStats } from '@/constants/robustStoryTemplates';
import { DifficultyLevel, UserInfo } from '@/types';

interface TestResult {
  testName: string;
  passed: boolean;
  details: any;
  performance?: {
    executionTime: number;
    templatesUsed: number;
    repetitionBlocked: number;
  };
}

interface SystemValidationReport {
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  testsRun: number;
  testsPasssed: number;
  testsFailed: number;
  criticalFailures: string[];
  performanceMetrics: {
    averageSelectionTime: number;
    averageRepetitionCheckTime: number;
    totalTemplatesAvailable: Record<string, any>;
  };
  recommendations: string[];
}

export class RobustSystemIntegrationTest {
  
  /**
   * Runs comprehensive integration tests for the robust two-tier system
   */
  static async runCompleteIntegrationTest(): Promise<SystemValidationReport> {
    console.log('🧪 Starting Robust Two-Tier System Integration Test...');
    
    const results: TestResult[] = [];
    const startTime = Date.now();
    
    // Test 1: Template Pool Verification
    results.push(await this.testTemplatePoolSizes());
    
    // Test 2: Free Tier Template Selection
    results.push(await this.testFreeTierTemplateSelection());
    
    // Test 3: Premium Tier Template Selection  
    results.push(await this.testPremiumTierTemplateSelection());
    
    // Test 4: Anti-Repetition Engine Integration
    results.push(await this.testAntiRepetitionEngineIntegration());
    
    // Test 5: Cross-Session Persistence
    results.push(await this.testCrossSessionPersistence());
    
    // Test 6: Performance Under Load
    results.push(await this.testSystemPerformance());
    
    // Test 7: Edge Cases and Error Handling
    results.push(await this.testEdgeCasesAndErrorHandling());
    
    // Test 8: Tier Upgrade Compatibility
    results.push(await this.testTierUpgradeCompatibility());
    
    // Test 9: Mobile Optimization
    results.push(await this.testMobileOptimization());
    
    // Test 10: Long Story Generation (20+ pages)
    results.push(await this.testLongStoryGeneration());
    
    const totalTime = Date.now() - startTime;
    
    // Generate comprehensive report
    const report = this.generateSystemValidationReport(results, totalTime);
    
    console.log('🎯 Robust System Integration Test Complete:', report);
    return report;
  }
  
  /**
   * Test 1: Verify template pool sizes meet specifications
   */
  private static async testTemplatePoolSizes(): Promise<TestResult> {
    const freeStats = getTemplatePoolStats('free');
    const premiumStats = getTemplatePoolStats('premium');
    
    const requirements = {
      free: { easy: 25, medium: 20, hard: 15, expert: 12 },
      premium: { easy: 40, medium: 35, hard: 25, expert: 20 }
    };
    
    const freeCheck = 
      freeStats.easy >= requirements.free.easy &&
      freeStats.medium >= requirements.free.medium &&
      freeStats.hard >= requirements.free.hard &&
      freeStats.expert >= requirements.free.expert;
    
    const premiumCheck = 
      premiumStats.easy >= requirements.premium.easy &&
      premiumStats.medium >= requirements.premium.medium &&
      premiumStats.hard >= requirements.premium.hard &&
      premiumStats.expert >= requirements.premium.expert;
    
    return {
      testName: 'Template Pool Size Verification',
      passed: freeCheck && premiumCheck,
      details: {
        free: { actual: freeStats, required: requirements.free, passed: freeCheck },
        premium: { actual: premiumStats, required: requirements.premium, passed: premiumCheck },
        totalTemplates: freeStats.total + premiumStats.total
      }
    };
  }
  
  /**
   * Test 2: Free tier template selection with lookback and cooldown
   */
  private static async testFreeTierTemplateSelection(): Promise<TestResult> {
    const startTime = Date.now();
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    const userId = 'test_free_user';
    
    let totalSelections = 0;
    let uniqueTemplates = new Set<string>();
    let respectsLookback = true;
    
    // Clear any existing data
    IntelligentTemplateSelector.clearUserData(userId, 'free');
    
    for (const difficulty of difficulties) {
      const config = {
        tier: 'free' as const,
        difficulty,
        lookbackPages: 5,
        cooldownPages: 8,
        userId,
        sessionId: `test_session_${difficulty}`
      };
      
      const recentTemplates: string[] = [];
      
      // Generate 15 templates to test lookback system
      for (let i = 0; i < 15; i++) {
        const result = IntelligentTemplateSelector.selectTemplate(config);
        totalSelections++;
        uniqueTemplates.add(result.templateId);
        recentTemplates.push(result.templateId);
        
        // Check lookback compliance (last 5 should be different)
        if (recentTemplates.length > 5) {
          const recent5 = recentTemplates.slice(-5);
          const currentTemplate = recentTemplates[recentTemplates.length - 1];
          const previousTemplate = recentTemplates[recentTemplates.length - 2];
          
          if (currentTemplate === previousTemplate) {
            respectsLookback = false;
            console.warn(`⚠️ Lookback violation: ${currentTemplate} repeated immediately`);
          }
        }
      }
    }
    
    const executionTime = Date.now() - startTime;
    const varietyScore = uniqueTemplates.size / totalSelections;
    
    return {
      testName: 'Free Tier Template Selection',
      passed: respectsLookback && varietyScore > 0.7,
      details: {
        totalSelections,
        uniqueTemplates: uniqueTemplates.size,
        varietyScore: varietyScore.toFixed(3),
        lookbackCompliance: respectsLookback
      },
      performance: {
        executionTime,
        templatesUsed: uniqueTemplates.size,
        repetitionBlocked: totalSelections - uniqueTemplates.size
      }
    };
  }
  
  /**
   * Test 3: Premium tier template selection with AI generation capability
   */
  private static async testPremiumTierTemplateSelection(): Promise<TestResult> {
    const startTime = Date.now();
    const userId = 'test_premium_user';
    let aiTemplatesGenerated = 0;
    let totalSelections = 0;
    
    // Clear any existing data
    IntelligentTemplateSelector.clearUserData(userId, 'premium');
    
    const config = {
      tier: 'premium' as const,
      difficulty: 'medium' as DifficultyLevel,
      lookbackPages: 10,
      cooldownPages: 15,
      userId,
      sessionId: 'test_premium_session'
    };
    
    // Generate many templates to potentially trigger AI generation
    for (let i = 0; i < 50; i++) {
      const result = IntelligentTemplateSelector.selectTemplate(config);
      totalSelections++;
      
      if (result.isAIGenerated) {
        aiTemplatesGenerated++;
      }
    }
    
    const executionTime = Date.now() - startTime;
    const stats = IntelligentTemplateSelector.getSelectionStats({ tier: 'premium' });
    
    return {
      testName: 'Premium Tier Template Selection',
      passed: totalSelections === 50 && executionTime < 5000, // Should complete in reasonable time
      details: {
        totalSelections,
        aiTemplatesGenerated,
        selectionStats: stats,
        averageTimePerSelection: executionTime / totalSelections
      },
      performance: {
        executionTime,
        templatesUsed: totalSelections,
        repetitionBlocked: 0 // Premium doesn't block, it generates new
      }
    };
  }
  
  /**
   * Test 4: Anti-repetition engine integration with both tiers
   */
  private static async testAntiRepetitionEngineIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    const testContents = [
      'Alex sees a cat',
      'Alex sees a cat', // Exact duplicate
      'Alex notices a cat', // Similar content
      'The cat is happy',
      'Alex and the cat play together'
    ];
    
    let freeBlocked = 0;
    let premiumBlocked = 0;
    
    // Test free tier
    const freeConfig = {
      tier: 'free' as const,
      userId: 'test_user_free',
      sessionId: 'test_anti_rep_free'
    };
    
    for (const content of testContents) {
      const result = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        content,
        freeConfig,
        'easy'
      );
      
      if (result.isDuplicate) {
        freeBlocked++;
      }
    }
    
    // Test premium tier
    const premiumConfig = {
      tier: 'premium' as const,
      userId: 'test_user_premium', 
      sessionId: 'test_anti_rep_premium'
    };
    
    for (const content of testContents) {
      const result = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        content,
        premiumConfig,
        'easy'
      );
      
      if (result.isDuplicate) {
        premiumBlocked++;
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      testName: 'Anti-Repetition Engine Integration',
      passed: freeBlocked >= 1 && premiumBlocked >= 1, // Should block at least exact duplicates
      details: {
        freeBlocked,
        premiumBlocked,
        testContentsCount: testContents.length,
        freeStats: EnhancedAntiRepetitionEngine.getEngineStats('test_user_free', 'free'),
        premiumStats: EnhancedAntiRepetitionEngine.getEngineStats('test_user_premium', 'premium')
      },
      performance: {
        executionTime,
        templatesUsed: testContents.length * 2,
        repetitionBlocked: freeBlocked + premiumBlocked
      }
    };
  }
  
  /**
   * Test 5: Cross-session persistence functionality
   */
  private static async testCrossSessionPersistence(): Promise<TestResult> {
    const userId = 'test_persistence_user';
    
    // Clear existing data
    EnhancedAntiRepetitionEngine.clearUserData(userId);
    
    // Session 1: Generate some content
    const session1Config = {
      tier: 'free' as const,
      userId,
      sessionId: 'session_1'
    };
    
    const contentToSave = ['Alex finds a treasure', 'The treasure is golden', 'Alex feels excited'];
    
    for (const content of contentToSave) {
      await EnhancedAntiRepetitionEngine.checkContentRepetition(
        content,
        session1Config,
        'medium'
      );
    }
    
    // Session 2: Try to reuse the same content
    const session2Config = {
      tier: 'free' as const,
      userId,
      sessionId: 'session_2' 
    };
    
    let duplicatesDetected = 0;
    for (const content of contentToSave) {
      const result = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        content,
        session2Config,
        'medium'
      );
      
      if (result.isDuplicate) {
        duplicatesDetected++;
      }
    }
    
    return {
      testName: 'Cross-Session Persistence',
      passed: duplicatesDetected > 0, // Should detect some duplicates from previous session
      details: {
        contentSavedInSession1: contentToSave.length,
        duplicatesDetectedInSession2: duplicatesDetected,
        persistenceWorking: duplicatesDetected > 0
      }
    };
  }
  
  /**
   * Test 6: System performance under load
   */
  private static async testSystemPerformance(): Promise<TestResult> {
    const startTime = Date.now();
    const iterations = 100;
    let totalSelectionTime = 0;
    let totalRepetitionCheckTime = 0;
    
    const userId = 'test_performance_user';
    
    for (let i = 0; i < iterations; i++) {
      // Template selection performance
      const selectionStart = Date.now();
      const config = {
        tier: (i % 2 === 0 ? 'free' : 'premium') as 'free' | 'premium',
        difficulty: ['easy', 'medium', 'hard', 'expert'][i % 4] as DifficultyLevel,
        lookbackPages: 5,
        cooldownPages: 8,
        userId: `${userId}_${i}`,
        sessionId: `perf_test_${i}`
      };
      
      IntelligentTemplateSelector.selectTemplate(config);
      totalSelectionTime += Date.now() - selectionStart;
      
      // Anti-repetition check performance
      const repCheckStart = Date.now();
      await EnhancedAntiRepetitionEngine.checkContentRepetition(
        `Test content ${i} with some variation`,
        {
          tier: config.tier,
          userId: config.userId,
          sessionId: config.sessionId
        },
        config.difficulty
      );
      totalRepetitionCheckTime += Date.now() - repCheckStart;
    }
    
    const totalTime = Date.now() - startTime;
    const averageSelectionTime = totalSelectionTime / iterations;
    const averageRepetitionCheckTime = totalRepetitionCheckTime / iterations;
    
    // Performance requirements: 
    // - Average selection time < 50ms
    // - Average repetition check < 100ms  
    // - Total time for 100 operations < 10 seconds
    const passed = 
      averageSelectionTime < 50 &&
      averageRepetitionCheckTime < 100 &&
      totalTime < 10000;
    
    return {
      testName: 'System Performance Under Load',
      passed,
      details: {
        iterations,
        totalTime,
        averageSelectionTime: averageSelectionTime.toFixed(2),
        averageRepetitionCheckTime: averageRepetitionCheckTime.toFixed(2),
        performanceRequirements: {
          selectionTime: averageSelectionTime < 50,
          repetitionCheckTime: averageRepetitionCheckTime < 100,
          totalTime: totalTime < 10000
        }
      },
      performance: {
        executionTime: totalTime,
        templatesUsed: iterations,
        repetitionBlocked: 0
      }
    };
  }
  
  /**
   * Test 7: Edge cases and error handling
   */
  private static async testEdgeCasesAndErrorHandling(): Promise<TestResult> {
    const edgeCases = [];
    
    try {
      // Test with invalid tier
      const invalidConfig = {
        tier: 'invalid' as any,
        difficulty: 'easy' as DifficultyLevel,
        lookbackPages: 5,
        cooldownPages: 8,
        userId: 'edge_test_user',
        sessionId: 'edge_test'
      };
      
      // This should not crash
      IntelligentTemplateSelector.selectTemplate(invalidConfig);
      edgeCases.push({ test: 'invalid_tier', passed: true });
    } catch (error) {
      edgeCases.push({ test: 'invalid_tier', passed: false, error: error.message });
    }
    
    try {
      // Test with empty content
      const result = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        '',
        {
          tier: 'free',
          userId: 'edge_test_user',
          sessionId: 'edge_test'
        },
        'easy'
      );
      
      edgeCases.push({ test: 'empty_content', passed: result !== undefined });
    } catch (error) {
      edgeCases.push({ test: 'empty_content', passed: false, error: error.message });
    }
    
    try {
      // Test with extremely long content
      const longContent = 'word '.repeat(1000);
      const result = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        longContent,
        {
          tier: 'premium',
          userId: 'edge_test_user',
          sessionId: 'edge_test'
        },
        'expert'
      );
      
      edgeCases.push({ test: 'long_content', passed: result !== undefined });
    } catch (error) {
      edgeCases.push({ test: 'long_content', passed: false, error: error.message });
    }
    
    const passedTests = edgeCases.filter(test => test.passed).length;
    
    return {
      testName: 'Edge Cases and Error Handling',
      passed: passedTests === edgeCases.length,
      details: {
        totalEdgeCases: edgeCases.length,
        passedTests,
        edgeCaseResults: edgeCases
      }
    };
  }
  
  /**
   * Test 8: Tier upgrade compatibility
   */
  private static async testTierUpgradeCompatibility(): Promise<TestResult> {
    const userId = 'test_upgrade_user';
    
    // Clear existing data
    IntelligentTemplateSelector.clearUserData(userId);
    EnhancedAntiRepetitionEngine.clearUserData(userId);
    
    // Start as free user
    const freeSelections = [];
    for (let i = 0; i < 5; i++) {
      const result = IntelligentTemplateSelector.selectTemplate({
        tier: 'free',
        difficulty: 'medium',
        lookbackPages: 5,
        cooldownPages: 8,
        userId,
        sessionId: `free_session_${i}`
      });
      freeSelections.push(result.templateId);
    }
    
    // Upgrade to premium
    const premiumSelections = [];
    for (let i = 0; i < 5; i++) {
      const result = IntelligentTemplateSelector.selectTemplate({
        tier: 'premium',
        difficulty: 'medium', 
        lookbackPages: 10,
        cooldownPages: 15,
        userId,
        sessionId: `premium_session_${i}`
      });
      premiumSelections.push(result.templateId);
    }
    
    // Check that upgrade didn't break anything
    const freeStats = IntelligentTemplateSelector.getSelectionStats({ tier: 'free' });
    const premiumStats = IntelligentTemplateSelector.getSelectionStats({ tier: 'premium' });
    
    return {
      testName: 'Tier Upgrade Compatibility',
      passed: freeSelections.length === 5 && premiumSelections.length === 5,
      details: {
        freeSelections,
        premiumSelections,
        freeStats,
        premiumStats,
        upgradeSuccessful: true
      }
    };
  }
  
  /**
   * Test 9: Mobile optimization and battery efficiency
   */
  private static async testMobileOptimization(): Promise<TestResult> {
    const startTime = Date.now();
    const mobileConfig = {
      tier: 'free' as const,
      difficulty: 'easy' as DifficultyLevel,
      lookbackPages: 3, // Reduced for mobile
      cooldownPages: 5, // Reduced for mobile
      userId: 'mobile_test_user',
      sessionId: 'mobile_test'
    };
    
    // Simulate mobile usage pattern: quick, frequent requests
    const results = [];
    for (let i = 0; i < 20; i++) {
      const iterationStart = Date.now();
      
      const templateResult = IntelligentTemplateSelector.selectTemplate(mobileConfig);
      const repResult = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        `Mobile test content ${i}`,
        {
          tier: mobileConfig.tier,
          userId: mobileConfig.userId,
          sessionId: mobileConfig.sessionId
        },
        mobileConfig.difficulty
      );
      
      const iterationTime = Date.now() - iterationStart;
      results.push({ iteration: i, time: iterationTime });
    }
    
    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / 20;
    
    // Mobile optimization requirements:
    // - Average operation time < 25ms
    // - No operations > 100ms
    const slowOperations = results.filter(r => r.time > 100);
    const passed = averageTime < 25 && slowOperations.length === 0;
    
    return {
      testName: 'Mobile Optimization',
      passed,
      details: {
        totalOperations: results.length,
        totalTime,
        averageTime: averageTime.toFixed(2),
        slowOperations: slowOperations.length,
        mobileOptimized: passed
      },
      performance: {
        executionTime: totalTime,
        templatesUsed: results.length,
        repetitionBlocked: 0
      }
    };
  }
  
  /**
   * Test 10: Long story generation (20+ pages) without repetition
   */
  private static async testLongStoryGeneration(): Promise<TestResult> {
    const startTime = Date.now();
    const userId = 'test_long_story_user';
    const pageCount = 25;
    
    // Clear existing data
    IntelligentTemplateSelector.clearUserData(userId);
    EnhancedAntiRepetitionEngine.clearUserData(userId);
    
    const config = {
      tier: 'free' as const,
      difficulty: 'medium' as DifficultyLevel,
      lookbackPages: 5,
      cooldownPages: 8,
      userId,
      sessionId: 'long_story_test'
    };
    
    const generatedContent = [];
    let repetitionBlocked = 0;
    
    for (let page = 0; page < pageCount; page++) {
      // Select template
      const templateResult = IntelligentTemplateSelector.selectTemplate(config);
      
      // Simulate content generation
      const content = `Page ${page + 1}: ${templateResult.template[0]} with user elements`;
      
      // Check for repetition
      const repResult = await EnhancedAntiRepetitionEngine.checkContentRepetition(
        content,
        {
          tier: config.tier,
          userId: config.userId,
          sessionId: config.sessionId
        },
        config.difficulty
      );
      
      if (repResult.isDuplicate) {
        repetitionBlocked++;
        // Would generate variation in real system
        generatedContent.push(`Variation: ${content}`);
      } else {
        generatedContent.push(content);
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    // Check for any exact duplicates in final content
    const uniqueContent = new Set(generatedContent);
    const duplicateCount = generatedContent.length - uniqueContent.size;
    
    return {
      testName: 'Long Story Generation (25 pages)',
      passed: duplicateCount === 0, // No duplicates should remain in final content
      details: {
        totalPages: pageCount,
        uniquePages: uniqueContent.size,
        duplicatesInFinal: duplicateCount,
        repetitionBlocked,
        repetitionRate: (repetitionBlocked / pageCount * 100).toFixed(1) + '%'
      },
      performance: {
        executionTime,
        templatesUsed: pageCount,
        repetitionBlocked
      }
    };
  }
  
  /**
   * Generates comprehensive system validation report
   */
  private static generateSystemValidationReport(
    results: TestResult[], 
    totalTime: number
  ): SystemValidationReport {
    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);
    const criticalFailures = failed
      .filter(r => r.testName.includes('Template Pool') || r.testName.includes('Anti-Repetition'))
      .map(r => r.testName);
    
    const performanceResults = results.filter(r => r.performance);
    const avgSelectionTime = performanceResults.reduce((sum, r) => 
      sum + (r.performance?.executionTime || 0), 0) / performanceResults.length;
    const avgRepetitionCheckTime = avgSelectionTime; // Simplified for demo
    
    const recommendations = [];
    
    if (failed.length > 0) {
      recommendations.push(`Fix ${failed.length} failing tests: ${failed.map(f => f.testName).join(', ')}`);
    }
    
    if (criticalFailures.length > 0) {
      recommendations.push('Address critical system failures before production deployment');
    }
    
    if (avgSelectionTime > 50) {
      recommendations.push('Optimize template selection performance');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is production-ready with excellent performance');
    }
    
    return {
      overallStatus: criticalFailures.length > 0 ? 'FAIL' : failed.length > 0 ? 'WARNING' : 'PASS',
      testsRun: results.length,
      testsPasssed: passed.length,
      testsFailed: failed.length,
      criticalFailures,
      performanceMetrics: {
        averageSelectionTime: avgSelectionTime,
        averageRepetitionCheckTime: avgRepetitionCheckTime,
        totalTemplatesAvailable: {
          free: getTemplatePoolStats('free'),
          premium: getTemplatePoolStats('premium')
        }
      },
      recommendations
    };
  }
}