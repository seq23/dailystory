// Reading Level Testing Module
import { ExtensionTemplateValidator } from '../../utils/extensionTemplateValidator';
import { validateLevel0SentenceByUserType } from '../../constants/dolchPrePrimer';

export interface ReadingLevelTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    level: string;
    userType: 'free' | 'premium';
    templateCount: number;
    vocabularyCompliance: number;
    issues: string[];
  }>;
}

export class ReadingLevelTester {
  async testAllLevels(): Promise<ReadingLevelTestResult> {
    console.log('📖 Testing Reading Level System...');
    
    const results: ReadingLevelTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test Level 0 (special case with free/premium distinction)
    await this.testLevel0(results);
    
    // Test Levels 1-4 (universal access)
    for (let level = 1; level <= 4; level++) {
      await this.testLevel(level, results);
    }

    console.log(`📊 Reading Level: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testLevel0(results: ReadingLevelTestResult): Promise<void> {
    const userTypes: ('free' | 'premium')[] = ['free', 'premium'];
    
    for (const userType of userTypes) {
      const testResult = {
        level: 'Level 0',
        userType,
        templateCount: 0,
        vocabularyCompliance: 0,
        issues: [] as string[]
      };

      try {
        // Test template access
        const templates = await this.getLevel0Templates(userType);
        testResult.templateCount = templates.length;

        // Expected template counts
        const expectedCount = userType === 'free' ? 100 : 150; // 20 base × 5 pages + extensions
        if (testResult.templateCount < expectedCount * 0.9) {
          testResult.issues.push(`Template count low: ${testResult.templateCount} < ${expectedCount}`);
        }

        // Test vocabulary compliance
        let compliantSentences = 0;
        let totalSentences = 0;

        for (const template of templates.slice(0, 10)) { // Sample first 10 templates
          const sentences = this.extractSentences(template);
          for (const sentence of sentences) {
            totalSentences++;
            const validation = validateLevel0SentenceByUserType(sentence, userType);
            if (validation.isValid) {
              compliantSentences++;
            } else {
              testResult.issues.push(`Non-compliant: "${sentence}" - ${validation.invalidWords.join(', ')}`);
            }
          }
        }

        testResult.vocabularyCompliance = totalSentences > 0 
          ? Math.round((compliantSentences / totalSentences) * 100)
          : 0;

        if (testResult.vocabularyCompliance < 95) {
          testResult.issues.push(`Low vocabulary compliance: ${testResult.vocabularyCompliance}%`);
        }

      } catch (error) {
        testResult.issues.push(`Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.issues.length === 0) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testLevel(level: number, results: ReadingLevelTestResult): Promise<void> {
    const userTypes: ('free' | 'premium')[] = ['free', 'premium'];
    
    for (const userType of userTypes) {
      const testResult = {
        level: `Level ${level}`,
        userType,
        templateCount: 0,
        vocabularyCompliance: 0,
        issues: [] as string[]
      };

      try {
        // Test extension template validation
        const validation = ExtensionTemplateValidator.testGradeLevel(
          level as any, 
          'TestUser', 
          userType
        );

        testResult.templateCount = validation.templates.length;
        testResult.vocabularyCompliance = validation.isCompliant ? 100 : 0;

        // Check universal access (levels 1-4 should have same templates for free/premium)
        if (userType === 'premium') {
          const freeValidation = ExtensionTemplateValidator.testGradeLevel(
            level as any, 
            'TestUser', 
            'free'
          );
          
          if (testResult.templateCount !== freeValidation.templates.length) {
            testResult.issues.push(`Template count mismatch: free=${freeValidation.templates.length}, premium=${testResult.templateCount}`);
          }
        }

        if (!validation.isCompliant) {
          validation.results.forEach(result => {
            if (!result.isValid && result.invalidWords.length > 0) {
              testResult.issues.push(`Template ${result.templateIndex}: ${result.invalidWords.join(', ')}`);
            }
          });
        }

        // Check minimum template count
        const expectedMinCount = 25; // 5 base × 5 pages
        if (testResult.templateCount < expectedMinCount) {
          testResult.issues.push(`Insufficient templates: ${testResult.templateCount} < ${expectedMinCount}`);
        }

      } catch (error) {
        testResult.issues.push(`Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.issues.length === 0) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async getLevel0Templates(userType: 'free' | 'premium'): Promise<string[]> {
    // Mock template retrieval - in real implementation this would fetch from the template system
    const baseCount = 20;
    const extensionCount = userType === 'premium' ? 10 : 0;
    
    return Array.from({ length: (baseCount + extensionCount) * 5 }, (_, i) => 
      `Template ${Math.floor(i / 5) + 1}, Page ${(i % 5) + 1}: This is a test sentence for ${userType} users.`
    );
  }

  private extractSentences(template: string): string[] {
    // Simple sentence extraction - split by periods and clean up
    return template
      .split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.'); // Re-add periods for validation
  }
}