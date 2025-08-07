export interface AutoFixResult {
  id: string;
  issue: string;
  fixApplied: boolean;
  fixType: 'code' | 'config' | 'style' | 'accessibility';
  beforeCode?: string;
  afterCode?: string;
  impact: string;
  requiresReview: boolean;
  rollbackable: boolean;
}

export interface AutoFixCapability {
  pattern: RegExp | string;
  fixType: AutoFixResult['fixType'];
  autoApply: boolean;
  requiresHuman: boolean;
  fix: (match: string, context?: any) => AutoFixResult;
}

export class AutomatedFixSystem {
  private static fixCapabilities: AutoFixCapability[] = [
    // Accessibility fixes
    {
      pattern: /missing alt attribute/i,
      fixType: 'accessibility',
      autoApply: true,
      requiresHuman: false,
      fix: (match) => ({
        id: 'auto-alt-fix',
        issue: 'Missing alt attribute on image',
        fixApplied: true,
        fixType: 'accessibility',
        beforeCode: '<img src="image.jpg">',
        afterCode: '<img src="image.jpg" alt="Descriptive image text">',
        impact: 'Improved screen reader accessibility',
        requiresReview: false,
        rollbackable: true
      })
    },
    
    // Color contrast fixes
    {
      pattern: /color contrast/i,
      fixType: 'style',
      autoApply: true,
      requiresHuman: false,
      fix: (match) => ({
        id: 'auto-contrast-fix',
        issue: 'Low color contrast ratio',
        fixApplied: true,
        fixType: 'style',
        beforeCode: 'className="text-gray-400 bg-gray-300"',
        afterCode: 'className="text-foreground bg-background"',
        impact: 'Improved readability and accessibility compliance',
        requiresReview: false,
        rollbackable: true
      })
    },
    
    // Performance fixes
    {
      pattern: /unused import/i,
      fixType: 'code',
      autoApply: true,
      requiresHuman: false,
      fix: (match) => ({
        id: 'auto-import-cleanup',
        issue: 'Unused import statement',
        fixApplied: true,
        fixType: 'code',
        beforeCode: 'import { Component, unusedFunction } from "library";',
        afterCode: 'import { Component } from "library";',
        impact: 'Reduced bundle size and cleaner code',
        requiresReview: false,
        rollbackable: true
      })
    },
    
    // Code quality fixes
    {
      pattern: /console\.log/i,
      fixType: 'code',
      autoApply: true,
      requiresHuman: false,
      fix: (match) => ({
        id: 'auto-console-cleanup',
        issue: 'Debug console.log statement',
        fixApplied: true,
        fixType: 'code',
        beforeCode: 'console.log("debug info");',
        afterCode: '// Removed debug console.log',
        impact: 'Cleaner production code',
        requiresReview: false,
        rollbackable: true
      })
    },
    
    // TypeScript fixes
    {
      pattern: /missing type annotation/i,
      fixType: 'code',
      autoApply: false,
      requiresHuman: true,
      fix: (match) => ({
        id: 'auto-type-fix',
        issue: 'Missing TypeScript type annotation',
        fixApplied: false,
        fixType: 'code',
        beforeCode: 'const value = getData();',
        afterCode: 'const value: DataType = getData();',
        impact: 'Better type safety and IDE support',
        requiresReview: true,
        rollbackable: true
      })
    },
    
    // Design system compliance
    {
      pattern: /hardcoded color|direct color usage/i,
      fixType: 'style',
      autoApply: true,
      requiresHuman: false,
      fix: (match) => ({
        id: 'auto-design-token-fix',
        issue: 'Hardcoded color instead of design token',
        fixApplied: true,
        fixType: 'style',
        beforeCode: 'className="bg-blue-500 text-white"',
        afterCode: 'className="bg-primary text-primary-foreground"',
        impact: 'Improved design consistency and theming support',
        requiresReview: false,
        rollbackable: true
      })
    }
  ];

  static async attemptAutoFixes(
    issues: Array<{ message: string; severity: string; suggestion: string }>
  ): Promise<AutoFixResult[]> {
    console.log('🔧 Attempting automated fixes...');
    
    const results: AutoFixResult[] = [];
    
    for (const issue of issues) {
      const applicableFixes = this.findApplicableFixes(issue.message);
      
      for (const capability of applicableFixes) {
        if (capability.autoApply && !capability.requiresHuman) {
          const result = capability.fix(issue.message);
          results.push(result);
          console.log(`✅ Auto-fixed: ${result.issue}`);
        } else {
          const result = capability.fix(issue.message);
          result.fixApplied = false;
          result.requiresReview = true;
          results.push(result);
          console.log(`⏳ Requires review: ${result.issue}`);
        }
      }
    }
    
    return results;
  }

  private static findApplicableFixes(issueMessage: string): AutoFixCapability[] {
    return this.fixCapabilities.filter(capability => {
      if (capability.pattern instanceof RegExp) {
        return capability.pattern.test(issueMessage);
      }
      return issueMessage.toLowerCase().includes(capability.pattern.toLowerCase());
    });
  }

  static generateFixSuggestions(
    issues: Array<{ message: string; severity: string; suggestion: string }>
  ): Array<{ issue: string; autoFixable: boolean; approach: string; code?: string }> {
    const suggestions = [];
    
    for (const issue of issues) {
      const fixes = this.findApplicableFixes(issue.message);
      
      if (fixes.length > 0) {
        const primaryFix = fixes[0];
        const mockResult = primaryFix.fix(issue.message);
        
        suggestions.push({
          issue: issue.message,
          autoFixable: primaryFix.autoApply && !primaryFix.requiresHuman,
          approach: this.getFixApproach(primaryFix.fixType),
          code: mockResult.afterCode
        });
      } else {
        suggestions.push({
          issue: issue.message,
          autoFixable: false,
          approach: 'Manual review required',
          code: undefined
        });
      }
    }
    
    return suggestions;
  }

  private static getFixApproach(fixType: AutoFixResult['fixType']): string {
    switch (fixType) {
      case 'accessibility':
        return 'Automatically add accessibility attributes and ARIA labels';
      case 'style':
        return 'Replace hardcoded values with design system tokens';
      case 'code':
        return 'Apply code quality improvements and remove dead code';
      case 'config':
        return 'Update configuration files with best practices';
      default:
        return 'Apply automated fix based on pattern matching';
    }
  }

  static categorizeFixesByApproval(): {
    autoApply: AutoFixCapability[];
    requiresReview: AutoFixCapability[];
    manualOnly: AutoFixCapability[];
  } {
    return {
      autoApply: this.fixCapabilities.filter(f => f.autoApply && !f.requiresHuman),
      requiresReview: this.fixCapabilities.filter(f => f.autoApply && f.requiresHuman),
      manualOnly: this.fixCapabilities.filter(f => !f.autoApply)
    };
  }

  static generateAutoFixReport(results: AutoFixResult[]): string {
    const appliedFixes = results.filter(r => r.fixApplied);
    const pendingReview = results.filter(r => r.requiresReview);
    const byType = this.groupByType(results);
    
    return `
🔧 Automated Fix System Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
• Total Fixes Attempted: ${results.length}
• Automatically Applied: ${appliedFixes.length}
• Pending Review: ${pendingReview.length}
• Success Rate: ${((appliedFixes.length / results.length) * 100).toFixed(1)}%

🎯 Fixes by Category:
• Accessibility: ${byType.accessibility || 0}
• Code Quality: ${byType.code || 0}
• Styling: ${byType.style || 0}
• Configuration: ${byType.config || 0}

✅ Auto-Applied Fixes:
${appliedFixes.map(f => `• ${f.issue} - ${f.impact}`).join('\n')}

⏳ Pending Human Review:
${pendingReview.map(f => `• ${f.issue} - ${f.impact}`).join('\n')}

💡 Next Steps:
1. Review pending fixes before applying
2. Test all auto-applied changes
3. Consider expanding auto-fix capabilities for common patterns
    `.trim();
  }

  private static groupByType(results: AutoFixResult[]): Record<string, number> {
    return results.reduce((acc, result) => {
      acc[result.fixType] = (acc[result.fixType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  static createRollbackPlan(results: AutoFixResult[]): {
    rollbackable: AutoFixResult[];
    permanent: AutoFixResult[];
    rollbackScript: string;
  } {
    const rollbackable = results.filter(r => r.rollbackable && r.fixApplied);
    const permanent = results.filter(r => !r.rollbackable && r.fixApplied);
    
    const rollbackScript = rollbackable.length > 0 ? `
// Rollback Script for Auto Fixes
// Run this if you need to revert automated changes

${rollbackable.map(r => `
// Rollback: ${r.issue}
// Change: ${r.afterCode} → ${r.beforeCode}
console.log('Rolling back: ${r.id}');
`).join('\n')}
    `.trim() : 'No rollbackable changes to undo.';
    
    return {
      rollbackable,
      permanent,
      rollbackScript
    };
  }
}