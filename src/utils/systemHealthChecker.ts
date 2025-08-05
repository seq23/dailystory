// System Health Checker - Comprehensive verification
// Tests the Enhanced Unified Template System for critical issues

import { 
  getTemplateByGradeLevel, 
  getTemplateCountByGradeLevel,
  getUnifiedTemplateSystemAnalytics,
  getSystemStatus
} from '@/constants/gradeBased/unifiedTemplateSystem';

import { 
  validateSentence, 
  getVocabularySet,
  GradeLevel
} from '@/constants/gradeBased';

import { EnhancedTemplateManager } from '@/services/enhancedTemplateManager';
// Removed: ComprehensiveTemplateManager was deleted as part of cleanup


interface HealthCheckResult {
  isHealthy: boolean;
  criticalIssues: string[];
  warnings: string[];
  systemInfo: any;
  timestamp: string;
}

export class SystemHealthChecker {
  static async runQuickHealthCheck(): Promise<HealthCheckResult> {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    
    console.log('🔍 Running System Health Check...');
    
    try {
      // 1. Check template counts
      const analytics = getUnifiedTemplateSystemAnalytics();
      if (analytics.totalTemplates !== 200) {
        criticalIssues.push(`❌ Template count mismatch: ${analytics.totalTemplates}/200`);
      }
      
      if (analytics.totalPages !== 1000) {
        criticalIssues.push(`❌ Page count mismatch: ${analytics.totalPages}/1000`);
      }
      
      // 2. Check each grade level
      for (let grade = 0; grade <= 4; grade++) {
        const gradeLevel = grade as GradeLevel;
        const count = getTemplateCountByGradeLevel(gradeLevel);
        
        if (count !== 40) {
          criticalIssues.push(`❌ Grade ${grade}: ${count}/40 templates`);
        }
        
        // Test template retrieval
        try {
          const template = getTemplateByGradeLevel(gradeLevel, 0);
          if (!template || template.length !== 5) {
            criticalIssues.push(`❌ Grade ${grade}: Template structure invalid`);
          }
          
          // Test vocabulary compliance
          const vocabulary = getVocabularySet(gradeLevel);
          if (vocabulary.size === 0) {
            criticalIssues.push(`❌ Grade ${grade}: Empty vocabulary set`);
          }
          
        } catch (error) {
          criticalIssues.push(`❌ Grade ${grade}: Template retrieval failed - ${error.message}`);
        }
      }
      
      // 3. Test EnhancedTemplateManager
      try {
        const testResult = await EnhancedTemplateManager.generateEnhancedStory({
          difficulty: 'beginner',
          isPremium: false,
          enableExtensions: false
        });
        
        if (!testResult.pages || testResult.pages.length === 0) {
          criticalIssues.push('❌ EnhancedTemplateManager: Story generation failed');
        }
      } catch (error) {
        criticalIssues.push(`❌ EnhancedTemplateManager: ${error.message}`);
      }
      
      // 4. Comprehensive template system was removed during cleanup
      warnings.push('⚠️ ComprehensiveTemplateManager: System removed during cleanup');
      
      // 5. System architecture is now simplified to EnhancedTemplateManager only
      warnings.push('✅ Architecture: Simplified to EnhancedTemplateManager core engine');
      
      // 6. Check system status
      const systemStatus = getSystemStatus();
      if (!systemStatus.isHealthy) {
        criticalIssues.push('❌ System status check failed');
      }
      
      const isHealthy = criticalIssues.length === 0;
      
      console.log(`✅ Health Check Complete: ${isHealthy ? 'HEALTHY' : 'ISSUES FOUND'}`);
      console.log(`📊 Issues: ${criticalIssues.length} critical, ${warnings.length} warnings`);
      
      return {
        isHealthy,
        criticalIssues,
        warnings,
        systemInfo: {
          analytics,
          systemStatus,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      criticalIssues.push(`❌ Health check failed: ${error.message}`);
      
      return {
        isHealthy: false,
        criticalIssues,
        warnings,
        systemInfo: { error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  static async runVocabularyComplianceCheck(): Promise<{ 
    passed: boolean; 
    issues: string[];
    testedTemplates: number;
  }> {
    const issues: string[] = [];
    let testedTemplates = 0;
    
    console.log('📚 Running Vocabulary Compliance Check...');
    
    for (let grade = 0; grade <= 4; grade++) {
      const gradeLevel = grade as GradeLevel;
      
      // Test 5 random templates per grade
      for (let i = 0; i < 5; i++) {
        try {
          const template = getTemplateByGradeLevel(gradeLevel);
          testedTemplates++;
          
          for (const page of template) {
            const validation = validateSentence(page, gradeLevel, 'TestUser');
            if (!validation.isValid) {
              issues.push(`Grade ${grade}: "${page.substring(0, 50)}..." - Invalid words: ${validation.invalidWords.join(', ')}`);
            }
          }
        } catch (error) {
          issues.push(`Grade ${grade}: Template test failed - ${error.message}`);
        }
      }
    }
    
    const passed = issues.length === 0;
    console.log(`📝 Vocabulary Check: ${passed ? 'PASSED' : 'FAILED'} (${testedTemplates} templates tested)`);
    
    return {
      passed,
      issues,
      testedTemplates
    };
  }
}