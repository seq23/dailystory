/**
 * Comprehensive Level 0 Audit System
 * Performs system-wide vocabulary compliance check for Level 0 content
 */

import { Level0VocabularyAuditor } from './level0VocabularyAuditor';
import { LEVEL_0_FREE_TEMPLATES } from '@/constants/level0TemplatesFree';
import { ENHANCED_FALLBACK_TEMPLATES } from '@/constants/enhancedFallbackTemplates';

export interface SystemAuditResult {
  baseTemplates: {
    compliant: boolean;
    report: string;
  };
  fallbackTemplates: {
    compliant: boolean;
    report: string;
  };
  overallCompliant: boolean;
  summary: string;
}

export class ComprehensiveLevel0Audit {
  /**
   * Run a complete system audit for Level 0 vocabulary compliance
   */
  static async runFullAudit(userName: string = 'Sequoia'): Promise<SystemAuditResult> {
    console.log('🔍 Starting comprehensive Level 0 vocabulary audit...');

    // Audit base templates
    const baseTemplateAudit = Level0VocabularyAuditor.auditTemplates(
      LEVEL_0_FREE_TEMPLATES,
      'Level 0 Base Templates',
      userName
    );

    // Audit fallback templates (beginner level only)
    const beginnerFallbacks = ENHANCED_FALLBACK_TEMPLATES.beginner;
    const fallbackText = beginnerFallbacks.flatMap(template => [
      ...template.setup,
      ...template.development,
      ...template.climax,
      ...template.resolution,
      ...template.contextualContinuations
    ]);

    const fallbackAudit = Level0VocabularyAuditor.auditText(
      fallbackText.join(' '),
      'Beginner Fallback Templates',
      userName
    );

    // Generate reports
    const baseReport = Level0VocabularyAuditor.generateAuditReport(
      baseTemplateAudit,
      'Level 0 Base Templates Audit'
    );

    const fallbackReport = Level0VocabularyAuditor.generateAuditReport(
      fallbackAudit,
      'Level 0 Fallback Templates Audit'
    );

    const overallCompliant = baseTemplateAudit.isCompliant && fallbackAudit.isCompliant;

    const summary = this.generateSummaryReport({
      baseTemplates: baseTemplateAudit,
      fallbackTemplates: fallbackAudit,
      overallCompliant,
      userName
    });

    // Log results to console for immediate visibility
    console.log(summary);
    if (!overallCompliant) {
      console.log(baseReport);
      console.log(fallbackReport);
    }

    return {
      baseTemplates: {
        compliant: baseTemplateAudit.isCompliant,
        report: baseReport
      },
      fallbackTemplates: {
        compliant: fallbackAudit.isCompliant,
        report: fallbackReport
      },
      overallCompliant,
      summary
    };
  }

  /**
   * Generate a summary report of the audit
   */
  private static generateSummaryReport(data: {
    baseTemplates: any;
    fallbackTemplates: any;
    overallCompliant: boolean;
    userName: string;
  }): string {
    const { baseTemplates, fallbackTemplates, overallCompliant, userName } = data;

    const report = [
      '\n🎯 LEVEL 0 VOCABULARY COMPLIANCE AUDIT SUMMARY',
      '=' .repeat(60),
      `👤 Test Username: "${userName}"`,
      `📅 Audit Date: ${new Date().toISOString()}`,
      '',
      '📋 RESULTS:',
      `├─ Base Templates: ${baseTemplates.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'} (${baseTemplates.compliancePercentage}%)`,
      `├─ Fallback Templates: ${fallbackTemplates.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'} (${fallbackTemplates.compliancePercentage}%)`,
      `└─ Overall System: ${overallCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`,
      '',
    ];

    if (overallCompliant) {
      report.push('🎉 SUCCESS: All Level 0 content complies with Dolch Pre-Primer vocabulary standards!');
      report.push('✨ Your Level 0 stories will be appropriate for ages 3-5.');
    } else {
      report.push('🚨 ISSUES FOUND: Some Level 0 content contains advanced vocabulary.');
      report.push('⚠️  This may make stories too difficult for ages 3-5.');
      report.push('💡 Please review the detailed reports above for specific violations.');
    }

    report.push('');
    report.push('📚 REMINDER: Level 0 should only use these 40 Dolch Pre-Primer words:');
    report.push('a, and, away, big, blue, can, come, down, find, for, funny, go, help,');
    report.push('here, i, in, is, it, jump, little, look, make, me, my, not, one, play,');
    report.push('red, run, said, see, the, three, to, two, up, we, where, yellow, you');

    return report.join('\n');
  }

  /**
   * Test story generation for a specific level
   */
  static async testStoryGeneration(userName: string = 'Sequoia', storyCount: number = 3, testLevel: number = 0): Promise<void> {
    console.log(`\n🧪 Testing Level ${testLevel} Story Generation (${storyCount} stories):`);
    
    // Import the enhanced template manager
    const { EnhancedTemplateManager } = await import('../services/enhancedTemplateManager');
    
    // Map test level to difficulty
    const difficultyMap = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    const difficulty = difficultyMap[testLevel] as any;
    
    for (let i = 1; i <= storyCount; i++) {
      console.log(`\n--- Story ${i} for Level ${testLevel} ---`);
      
      try {
        const result = await EnhancedTemplateManager.generateEnhancedStory({
          userInfo: { 
            name: userName, 
            age: 6 + testLevel, 
            grade: `${testLevel}st` as any,
            nativeLanguage: 'en',
            learningGoal: 'improve-english-reading',
            avatar: { type: 'girl', skinTone: 'medium' },
            favoriteColor: 'blue',
            favoriteAnimal: 'cat',
            hobbies: 'reading',
            favoriteFood: 'pizza',
            specialRequest: ''
          },
          difficulty: difficulty,
          isPremium: true,
          enableExtensions: true
        });
        
        console.log(`✓ Generated ${result.pages.length} pages`);
        console.log(`✓ Vocabulary compliant: ${result.vocabularyCompliant}`);
        if (!result.vocabularyCompliant) {
          console.warn(`⚠️ Validation errors: ${result.validationErrors.join(', ')}`);
        }
        
        // Quick audit each story
        const audit = Level0VocabularyAuditor.auditStoryPages(result.pages, userName);
        if (testLevel === 0 && !audit.isCompliant) {
          console.error(`❌ Level 0 story has violations: ${audit.violations.join('; ')}`);
        }
        
      } catch (error) {
        console.error(`❌ Error generating Level ${testLevel} story ${i}:`, error);
      }
    }
    
    // Test extension templates specifically
    console.log(`\n🔧 Testing Level ${testLevel} Extension Templates:`);
    try {
      const { ExtensionTemplateValidator } = await import('../utils/extensionTemplateValidator');
      const gradeTest = ExtensionTemplateValidator.testGradeLevel(testLevel as any, userName);
      console.log(`✓ Extension template compliance: ${gradeTest.isCompliant ? 'PASS' : 'FAIL'}`);
      if (!gradeTest.isCompliant) {
        gradeTest.results.filter(r => !r.isValid).forEach(violation => {
          console.warn(`⚠️ Template violation: "${violation.template}" - Invalid: ${violation.invalidWords.join(', ')}`);
        });
      }
    } catch (error) {
      console.warn(`⚠️ Could not test extension templates:`, error);
    }
  }
}