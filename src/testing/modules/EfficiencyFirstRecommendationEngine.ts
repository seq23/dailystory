export interface EfficiencyRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'ux' | 'accessibility' | 'maintenance' | 'design';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effortToImpact: number; // 1-10 scale (1 = low effort, high impact)
  estimatedHours: number;
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex';
  quickWin: boolean;
  automatable: boolean;
  dependencies: string[];
  implementation: {
    steps: string[];
    codeExample?: string;
    alternatives: Array<{
      approach: string;
      pros: string[];
      cons: string[];
      effort: number;
    }>;
  };
  preventOverEngineering: {
    simpleApproach: string;
    avoidanceNote: string;
  };
}

export interface EfficiencyMetrics {
  totalRecommendations: number;
  quickWinCount: number;
  automatedFixCount: number;
  avgEffortToImpact: number;
  criticalIssuesCount: number;
  estimatedTotalHours: number;
}

export class EfficiencyFirstRecommendationEngine {
  private static readonly PARETO_THRESHOLD = 0.8; // 80/20 rule
  private static readonly QUICK_WIN_THRESHOLD = 6; // effort-to-impact >= 6
  private static readonly MAX_COMPLEXITY = 'moderate'; // Avoid complex solutions

  static generateEfficiencyRecommendations(
    testResults: Array<{
      category: string;
      issues: Array<{
        severity: string;
        message: string;
        suggestion: string;
        effortToImpact?: number;
        quickWin?: boolean;
      }>;
    }>
  ): EfficiencyRecommendation[] {
    const recommendations: EfficiencyRecommendation[] = [];
    
    testResults.forEach(result => {
      result.issues?.forEach((issue, index) => {
        const recommendation = this.createEfficiencyRecommendation(
          result.category,
          issue,
          `${result.category}-${index}`
        );
        recommendations.push(recommendation);
      });
    });

    // Sort by efficiency (effort-to-impact ratio, quick wins first)
    return recommendations.sort((a, b) => {
      if (a.quickWin && !b.quickWin) return -1;
      if (!a.quickWin && b.quickWin) return 1;
      return b.effortToImpact - a.effortToImpact;
    });
  }

  private static createEfficiencyRecommendation(
    category: string,
    issue: any,
    id: string
  ): EfficiencyRecommendation {
    const effortToImpact = issue.effortToImpact || this.calculateEffortToImpact(issue);
    const estimatedHours = this.estimateHours(effortToImpact, issue.severity);
    const quickWin = effortToImpact >= this.QUICK_WIN_THRESHOLD;
    const automatable = this.isAutomatable(issue);

    return {
      id,
      title: this.generateTitle(issue),
      description: issue.message,
      category: this.mapCategory(category),
      priority: this.mapPriority(issue.severity, effortToImpact),
      effortToImpact,
      estimatedHours,
      complexity: this.determineComplexity(effortToImpact),
      quickWin,
      automatable,
      dependencies: this.identifyDependencies(issue),
      implementation: this.generateImplementation(issue, effortToImpact),
      preventOverEngineering: this.generateSimplificationGuidance(issue)
    };
  }

  private static calculateEffortToImpact(issue: any): number {
    // Calculate based on severity and potential impact
    const severityMultiplier = {
      'critical': 10,
      'high': 8,
      'medium': 6,
      'low': 4
    };
    
    const baseScore = severityMultiplier[issue.severity as keyof typeof severityMultiplier] || 5;
    
    // Adjust for specific issue types
    if (issue.message.includes('accessibility')) return Math.min(baseScore + 2, 10);
    if (issue.message.includes('performance')) return Math.min(baseScore + 1, 10);
    if (issue.message.includes('security')) return 10;
    
    return baseScore;
  }

  private static estimateHours(effortToImpact: number, severity: string): number {
    const baseHours = {
      'critical': 4,
      'high': 2,
      'medium': 1,
      'low': 0.5
    };
    
    const base = baseHours[severity as keyof typeof baseHours] || 1;
    const multiplier = (11 - effortToImpact) / 10; // Lower effort-to-impact = more hours
    
    return Math.max(0.25, base * multiplier);
  }

  private static isAutomatable(issue: any): boolean {
    const automatablePatterns = [
      'color contrast',
      'missing alt',
      'unused imports',
      'console.log',
      'typescript error',
      'lint error',
      'format',
      'accessibility attribute'
    ];
    
    return automatablePatterns.some(pattern => 
      issue.message.toLowerCase().includes(pattern)
    );
  }

  private static generateImplementation(issue: any, effortToImpact: number): EfficiencyRecommendation['implementation'] {
    const isSimple = effortToImpact >= 7;
    
    return {
      steps: this.generateSteps(issue, isSimple),
      codeExample: this.generateCodeExample(issue),
      alternatives: this.generateAlternatives(issue, effortToImpact)
    };
  }

  private static generateSteps(issue: any, isSimple: boolean): string[] {
    if (isSimple) {
      return [
        'Identify the specific component/file',
        'Apply the suggested fix',
        'Test the change',
        'Verify no regressions'
      ];
    }
    
    return [
      'Analyze the root cause',
      'Plan implementation approach',
      'Create/modify necessary components',
      'Update tests',
      'Validate solution',
      'Document changes'
    ];
  }

  private static generateCodeExample(issue: any): string | undefined {
    if (issue.message.includes('color contrast')) {
      return `// ❌ Avoid hardcoded colors
<button className="bg-gray-300 text-gray-400">

// ✅ Use semantic tokens
<button className="bg-muted text-muted-foreground">`;
    }
    
    if (issue.message.includes('accessibility')) {
      return `// ❌ Missing accessibility
<button onClick={handleClick}>

// ✅ Proper accessibility
<button 
  onClick={handleClick}
  aria-label="Close dialog"
  tabIndex={0}
>`;
    }
    
    return undefined;
  }

  private static generateAlternatives(
    issue: any, 
    effortToImpact: number
  ): EfficiencyRecommendation['implementation']['alternatives'] {
    const alternatives = [];
    
    // Always provide a simple option
    alternatives.push({
      approach: 'Quick Fix',
      pros: ['Fast to implement', 'Low risk', 'Immediate benefit'],
      cons: ['May not address root cause', 'Might need revisiting'],
      effort: 1
    });
    
    // Add comprehensive option only for high-impact issues
    if (effortToImpact >= 8) {
      alternatives.push({
        approach: 'Comprehensive Solution',
        pros: ['Addresses root cause', 'Long-term solution', 'Prevents similar issues'],
        cons: ['More time-consuming', 'Higher complexity'],
        effort: effortToImpact >= 9 ? 5 : 3
      });
    }
    
    return alternatives;
  }

  private static generateSimplificationGuidance(issue: any): EfficiencyRecommendation['preventOverEngineering'] {
    return {
      simpleApproach: this.getSimpleApproach(issue),
      avoidanceNote: 'Resist the urge to build a complex framework. Start with the simplest solution that works.'
    };
  }

  private static getSimpleApproach(issue: any): string {
    if (issue.message.includes('component reuse')) {
      return 'Extract common patterns into simple utility functions before creating complex component hierarchies.';
    }
    
    if (issue.message.includes('state management')) {
      return 'Use local component state first. Only add global state management when you have a clear need.';
    }
    
    if (issue.message.includes('performance')) {
      return 'Profile first, optimize second. Measure the actual performance impact before adding complexity.';
    }
    
    return 'Start with the most straightforward implementation. Complexity can be added later if needed.';
  }

  private static mapCategory(category: string): EfficiencyRecommendation['category'] {
    const mapping: Record<string, EfficiencyRecommendation['category']> = {
      'performance': 'performance',
      'accessibility': 'accessibility',
      'ux': 'ux',
      'design': 'design',
      'visual': 'design'
    };
    
    return mapping[category.toLowerCase()] || 'maintenance';
  }

  private static mapPriority(severity: string, effortToImpact: number): EfficiencyRecommendation['priority'] {
    if (severity === 'critical') return 'critical';
    if (effortToImpact >= 9) return 'high';
    if (effortToImpact >= 7) return 'medium';
    return 'low';
  }

  private static determineComplexity(effortToImpact: number): EfficiencyRecommendation['complexity'] {
    if (effortToImpact >= 8) return 'simple';
    if (effortToImpact >= 6) return 'moderate';
    if (effortToImpact >= 4) return 'moderate';
    return 'complex';
  }

  private static generateTitle(issue: any): string {
    return issue.suggestion || issue.message.substring(0, 50) + '...';
  }

  private static identifyDependencies(issue: any): string[] {
    // Identify potential dependencies based on issue type
    if (issue.message.includes('component')) return ['Design System'];
    if (issue.message.includes('accessibility')) return ['Testing Suite'];
    if (issue.message.includes('performance')) return ['Bundle Analysis'];
    return [];
  }

  static calculateEfficiencyMetrics(recommendations: EfficiencyRecommendation[]): EfficiencyMetrics {
    return {
      totalRecommendations: recommendations.length,
      quickWinCount: recommendations.filter(r => r.quickWin).length,
      automatedFixCount: recommendations.filter(r => r.automatable).length,
      avgEffortToImpact: recommendations.reduce((sum, r) => sum + r.effortToImpact, 0) / recommendations.length,
      criticalIssuesCount: recommendations.filter(r => r.priority === 'critical').length,
      estimatedTotalHours: recommendations.reduce((sum, r) => sum + r.estimatedHours, 0)
    };
  }

  static generateEfficiencyReport(recommendations: EfficiencyRecommendation[]): string {
    const metrics = this.calculateEfficiencyMetrics(recommendations);
    const quickWins = recommendations.filter(r => r.quickWin).slice(0, 5);
    const automated = recommendations.filter(r => r.automatable).slice(0, 3);
    
    return `
⚡ Efficiency-First Recommendations Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Overview:
• Total Recommendations: ${metrics.totalRecommendations}
• Quick Wins Available: ${metrics.quickWinCount}
• Auto-fixable Issues: ${metrics.automatedFixCount}
• Critical Issues: ${metrics.criticalIssuesCount}
• Estimated Total Hours: ${metrics.estimatedTotalHours.toFixed(1)}h
• Avg Effort-to-Impact: ${metrics.avgEffortToImpact.toFixed(1)}/10

🎯 Top Quick Wins (Start Here):
${quickWins.map(r => `• ${r.title} (${r.estimatedHours}h, Impact: ${r.effortToImpact}/10)`).join('\n')}

🤖 Auto-fixable Issues:
${automated.map(r => `• ${r.title}`).join('\n')}

💡 Anti-Over-Engineering Reminder:
Start with the simplest solution that works. Complexity can be added later if needed.
Focus on the 20% of changes that will give you 80% of the benefit.
    `.trim();
  }
}