/**
 * Hierarchical Template System Validator
 * Comprehensive validation and testing for the template system
 */

import { HierarchicalSessionTemplateManager } from '@/services/hierarchicalSessionTemplateManager';
import { Level0StoryProcessor } from '@/services/level0StoryProcessor';
import { EnhancedSubscriptionManager } from '@/services/enhancedSubscriptionManager';
import { getTemplateCountByGradeLevel } from '@/constants/gradeBased/unifiedTemplateSystem';
import { difficultyToGradeLevel } from '@/constants/gradeBased/index';
import { getLevel0ExtensionCount } from '@/constants/gradeBased/level0ExtensionTemplates';
import { DifficultyLevel, UserInfo } from '@/types';

interface SystemValidationResult {
  isValid: boolean;
  templateCounts: Record<string, number>;
  extensionCounts: Record<string, number>;
  systemHealth: {
    subscriptionManager: boolean;
    sessionStorage: boolean;
    templateAccess: boolean;
  };
  templateProgression: {
    difficulty: DifficultyLevel;
    baseTemplatesUsed: number;
    extensionTemplatesUsed: number;
    phaseTransitions: string[];
  }[];
  errors: string[];
}

export class HierarchicalSystemValidator {
  
  /**
   * Run comprehensive system validation
   */
  static async validateCompleteSystem(): Promise<SystemValidationResult> {
    const result: SystemValidationResult = {
      isValid: true,
      templateCounts: {},
      extensionCounts: {},
      systemHealth: {
        subscriptionManager: false,
        sessionStorage: false,
        templateAccess: false
      },
      templateProgression: [],
      errors: []
    };

    console.log('🔍 HierarchicalSystemValidator: Starting comprehensive validation...');

    try {
      // 1. Validate template counts
      await this.validateTemplateCounts(result);
      
      // 2. Test system health
      await this.validateSystemHealth(result);
      
      // 3. Test template progression for all difficulties
      await this.validateTemplateProgression(result);
      
      // 4. Test Level 0 specific routing
      await this.validateLevel0Processing(result);

      console.log('✅ HierarchicalSystemValidator: Validation complete');
      result.isValid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate all template counts match expected values
   */
  private static async validateTemplateCounts(result: SystemValidationResult): Promise<void> {
    console.log('📊 Validating template counts...');
    
    const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    for (const difficulty of difficulties) {
      try {
        const gradeLevel = difficultyToGradeLevel(difficulty);
        
        // Check base template counts
        const freeCount = getTemplateCountByGradeLevel(gradeLevel, false);
        const premiumCount = getTemplateCountByGradeLevel(gradeLevel, true);
        
        result.templateCounts[`${difficulty}_free`] = freeCount;
        result.templateCounts[`${difficulty}_premium`] = premiumCount;
        
        // Check extension template counts for Level 0
        if (difficulty === 'beginner') {
          const freeExtensions = getLevel0ExtensionCount(false);
          const premiumExtensions = getLevel0ExtensionCount(true);
          
          result.extensionCounts[`${difficulty}_free`] = freeExtensions;
          result.extensionCounts[`${difficulty}_premium`] = premiumExtensions;
          
          // Validate expected counts
          if (freeCount !== 40) {
            result.errors.push(`Level 0 free templates: expected 40, got ${freeCount}`);
          }
          if (premiumCount !== 40) {
            result.errors.push(`Level 0 premium templates: expected 40, got ${premiumCount}`);
          }
          if (freeExtensions !== 5) {
            result.errors.push(`Level 0 free extensions: expected 5, got ${freeExtensions}`);
          }
          if (premiumExtensions !== 5) {
            result.errors.push(`Level 0 premium extensions: expected 5, got ${premiumExtensions}`);
          }
        } else {
          // Other levels should have 40 base templates each
          if (freeCount !== 40) {
            result.errors.push(`${difficulty} templates: expected 40, got ${freeCount}`);
          }
        }
        
      } catch (error) {
        result.errors.push(`Template count validation failed for ${difficulty}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Validate system health components
   */
  private static async validateSystemHealth(result: SystemValidationResult): Promise<void> {
    console.log('🏥 Validating system health...');
    
    try {
      // Test subscription manager
      const isPremium = await EnhancedSubscriptionManager.isPremiumUser();
      result.systemHealth.subscriptionManager = typeof isPremium === 'boolean';
      
      // Test session storage
      try {
        const testKey = 'hierarchical_test_' + Date.now();
        sessionStorage.setItem(testKey, 'test');
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        result.systemHealth.sessionStorage = retrieved === 'test';
      } catch {
        result.systemHealth.sessionStorage = false;
      }
      
      // Test template access
      const testTemplate = HierarchicalSessionTemplateManager.getNextTemplate('beginner', false);
      result.systemHealth.templateAccess = !!(testTemplate && testTemplate.template && testTemplate.template.length > 0);
      
    } catch (error) {
      result.errors.push(`System health validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate template progression through all phases
   */
  private static async validateTemplateProgression(result: SystemValidationResult): Promise<void> {
    console.log('🔄 Validating template progression...');
    
    const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    for (const difficulty of difficulties) {
      try {
        // Clear session to start fresh
        HierarchicalSessionTemplateManager.clearSession();
        
        const progression = {
          difficulty,
          baseTemplatesUsed: 0,
          extensionTemplatesUsed: 0,
          phaseTransitions: [] as string[]
        };
        
        // Test progression through multiple template selections
        for (let i = 0; i < 50; i++) { // Test beyond expected template counts
          const selection = HierarchicalSessionTemplateManager.getNextTemplate(difficulty, false);
          
          if (selection.phase === 'base') {
            progression.baseTemplatesUsed++;
          } else if (selection.phase === 'extension') {
            progression.extensionTemplatesUsed++;
          }
          
          // Track phase transitions
          if (i > 0) {
            const prevSelection = result.templateProgression[result.templateProgression.length - 1];
            if (prevSelection && selection.phase !== prevSelection.phaseTransitions[prevSelection.phaseTransitions.length - 1]) {
              progression.phaseTransitions.push(`${i}: ${selection.phase}`);
            }
          } else {
            progression.phaseTransitions.push(`0: ${selection.phase}`);
          }
        }
        
        result.templateProgression.push(progression);
        
        // Clear session after testing
        HierarchicalSessionTemplateManager.clearSession();
        
      } catch (error) {
        result.errors.push(`Template progression validation failed for ${difficulty}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Validate Level 0 specific processing
   */
  private static async validateLevel0Processing(result: SystemValidationResult): Promise<void> {
    console.log('🎯 Validating Level 0 specific processing...');
    
    try {
      const testUserInfo: UserInfo = {
        name: 'TestUser',
        age: 5,
        grade: 'PreK',
        gradeLevel: 'PreK',
        nativeLanguage: 'en',
        learningGoal: 'improve-english-reading',
        avatar: { type: 'boy', skinTone: 'medium' },
        readingAbility: 'beginner',
        hobbies: 'reading',
        favoriteAnimal: 'cat',
        favoriteColor: 'blue',
        favoriteFood: 'pizza',
        specialRequest: 'adventure',
        storyLanguagePreference: 'en'
      };

      // Test Level 0 story generation
      const level0Result = await Level0StoryProcessor.generateStory(testUserInfo);
      
      if (!level0Result.isValid) {
        result.errors.push(`Level 0 story generation failed: ${level0Result.validationErrors.join(', ')}`);
      }
      
      if (level0Result.content.length === 0) {
        result.errors.push('Level 0 story generation returned empty content');
      }
      
      // Test Level 0 template stats
      const stats = await Level0StoryProcessor.getTemplateStats();
      if (stats.totalTemplates === 0) {
        result.errors.push('Level 0 template stats show no templates available');
      }
      
    } catch (error) {
      result.errors.push(`Level 0 processing validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate validation report
   */
  static generateValidationReport(result: SystemValidationResult): string {
    const report = `
🔍 HIERARCHICAL TEMPLATE SYSTEM VALIDATION REPORT
===============================================

Overall Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}
Errors Found: ${result.errors.length}

📊 TEMPLATE COUNTS:
${Object.entries(result.templateCounts).map(([key, count]) => `  ${key}: ${count}`).join('\n')}

🔧 EXTENSION COUNTS:
${Object.entries(result.extensionCounts).map(([key, count]) => `  ${key}: ${count}`).join('\n')}

🏥 SYSTEM HEALTH:
  Subscription Manager: ${result.systemHealth.subscriptionManager ? '✅' : '❌'}
  Session Storage: ${result.systemHealth.sessionStorage ? '✅' : '❌'}  
  Template Access: ${result.systemHealth.templateAccess ? '✅' : '❌'}

🔄 TEMPLATE PROGRESSION:
${result.templateProgression.map(p => 
  `  ${p.difficulty}: Base=${p.baseTemplatesUsed}, Ext=${p.extensionTemplatesUsed}, Transitions=${p.phaseTransitions.length}`
).join('\n')}

${result.errors.length > 0 ? `
❌ ERRORS:
${result.errors.map(error => `  • ${error}`).join('\n')}
` : '✅ NO ERRORS FOUND'}

Report generated: ${new Date().toISOString()}
`;

    return report;
  }
}
