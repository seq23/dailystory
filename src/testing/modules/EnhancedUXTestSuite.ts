import { UserJourneyTester, type UserJourneyTestResult } from './UserJourneyTester';
import { CognitiveLoadTester, type CognitiveLoadTestResult } from './CognitiveLoadTester';
import { EmotionalUXTester, type EmotionalUXTestResult } from './EmotionalUXTester';
import { UXRecommendationEngine, type UXAnalysisReport } from './UXRecommendationEngine';

export interface EnhancedUXTestSuiteResult {
  userJourney: {
    results: UserJourneyTestResult[];
    overallScore: number;
    report: string;
  };
  cognitiveLoad: {
    results: CognitiveLoadTestResult[];
    overallScore: number;
    report: string;
  };
  emotionalUX: {
    results: EmotionalUXTestResult[];
    overallScore: number;
    report: string;
  };
  comprehensiveAnalysis: UXAnalysisReport;
  executionSummary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallUXScore: number;
    criticalIssuesCount: number;
    recommendationsCount: number;
    executionTime: number;
  };
}

export class EnhancedUXTestSuite {
  static async runComprehensiveUXTests(): Promise<EnhancedUXTestSuiteResult> {
    console.log('🎨 Starting Comprehensive UX Test Suite...');
    const startTime = Date.now();

    try {
      // Run all UX test categories in parallel for efficiency
      console.log('🚀 Running UX tests in parallel...');
      const [journeyResults, cognitiveResults, emotionalResults] = await Promise.all([
        UserJourneyTester.runUserJourneyTests(),
        CognitiveLoadTester.runCognitiveLoadTests(),
        EmotionalUXTester.runEmotionalUXTests()
      ]);

      // Generate individual reports
      const journeyReport = UserJourneyTester.generateJourneyReport(journeyResults);
      const cognitiveReport = CognitiveLoadTester.generateCognitiveLoadReport(cognitiveResults);
      const emotionalReport = EmotionalUXTester.generateEmotionalUXReport(emotionalResults);

      // Calculate scores
      const journeyScore = this.calculateCategoryScore(journeyResults);
      const cognitiveScore = this.calculateCategoryScore(cognitiveResults);
      const emotionalScore = this.calculateCategoryScore(emotionalResults);

      // Generate comprehensive analysis and recommendations
      const comprehensiveAnalysis = UXRecommendationEngine.generateComprehensiveUXReport(
        journeyResults,
        cognitiveResults,
        emotionalResults
      );

      // Calculate execution summary
      const allResults = [...journeyResults, ...cognitiveResults, ...emotionalResults];
      const executionTime = Date.now() - startTime;
      const totalTests = allResults.length;
      const passedTests = allResults.filter(r => r.passed).length;
      const failedTests = totalTests - passedTests;
      const overallUXScore = (journeyScore + cognitiveScore + emotionalScore) / 3;

      const result: EnhancedUXTestSuiteResult = {
        userJourney: {
          results: journeyResults,
          overallScore: journeyScore,
          report: journeyReport
        },
        cognitiveLoad: {
          results: cognitiveResults,
          overallScore: cognitiveScore,
          report: cognitiveReport
        },
        emotionalUX: {
          results: emotionalResults,
          overallScore: emotionalScore,
          report: emotionalReport
        },
        comprehensiveAnalysis,
        executionSummary: {
          totalTests,
          passedTests,
          failedTests,
          overallUXScore,
          criticalIssuesCount: comprehensiveAnalysis.criticalIssues.length,
          recommendationsCount: comprehensiveAnalysis.recommendations.length,
          executionTime
        }
      };

      console.log('✅ UX Test Suite completed successfully');
      return result;

    } catch (error) {
      console.error('❌ UX Test Suite failed:', error);
      throw error;
    }
  }

  private static calculateCategoryScore(results: Array<{ score: number }>): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.score, 0) / results.length;
  }

  static generateExecutiveSummary(results: EnhancedUXTestSuiteResult): string {
    let summary = '\n🎨 UX TEST SUITE EXECUTIVE SUMMARY\n';
    summary += '=' .repeat(50) + '\n\n';

    // Key metrics
    summary += `📊 OVERALL UX SCORE: ${results.executionSummary.overallUXScore.toFixed(1)}/100\n`;
    summary += `⏱️ Test Execution Time: ${(results.executionSummary.executionTime / 1000).toFixed(1)}s\n`;
    summary += `🧪 Total Tests: ${results.executionSummary.totalTests}\n`;
    summary += `✅ Passed: ${results.executionSummary.passedTests}\n`;
    summary += `❌ Failed: ${results.executionSummary.failedTests}\n`;
    summary += `🚨 Critical Issues: ${results.executionSummary.criticalIssuesCount}\n`;
    summary += `💡 Recommendations: ${results.executionSummary.recommendationsCount}\n\n`;

    // Category breakdown
    summary += '📋 CATEGORY BREAKDOWN:\n';
    summary += `🎯 User Journey: ${results.userJourney.overallScore.toFixed(1)}/100\n`;
    summary += `🧠 Cognitive Load: ${results.cognitiveLoad.overallScore.toFixed(1)}/100\n`;
    summary += `😊 Emotional UX: ${results.emotionalUX.overallScore.toFixed(1)}/100\n\n`;

    // Top recommendations
    const topRecommendations = results.comprehensiveAnalysis.recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .slice(0, 5);

    if (topRecommendations.length > 0) {
      summary += '🔥 TOP PRIORITY RECOMMENDATIONS:\n';
      topRecommendations.forEach((rec, i) => {
        summary += `${i + 1}. ${rec.title} (${rec.priority} priority)\n`;
        summary += `   💬 ${rec.description}\n\n`;
      });
    }

    // Quick wins
    if (results.comprehensiveAnalysis.quickWins.length > 0) {
      summary += '⚡ QUICK WINS:\n';
      results.comprehensiveAnalysis.quickWins.slice(0, 3).forEach((win, i) => {
        summary += `${i + 1}. ${win.title}\n`;
      });
      summary += '\n';
    }

    return summary;
  }

  static generateFullReport(results: EnhancedUXTestSuiteResult): string {
    let report = this.generateExecutiveSummary(results);
    
    report += '\n' + results.userJourney.report;
    report += '\n' + results.cognitiveLoad.report;
    report += '\n' + results.emotionalUX.report;
    report += '\n' + UXRecommendationEngine.generateDetailedUXReport(results.comprehensiveAnalysis);

    return report;
  }

  // Utility method to run tests and log results to console
  static async runAndLogUXTests(): Promise<EnhancedUXTestSuiteResult> {
    const results = await this.runComprehensiveUXTests();
    
    console.log(this.generateExecutiveSummary(results));
    console.log('\n📝 For detailed reports, check individual category results');
    console.log('\n🎯 To see implementation details for a recommendation, use:');
    console.log('UXRecommendationEngine.getImplementationDetails(recommendation)');

    return results;
  }

  // Method to get specific test results for dashboard display
  static getTestResultsForDashboard(results: EnhancedUXTestSuiteResult) {
    return {
      overallScore: results.executionSummary.overallUXScore,
      categoryScores: {
        userJourney: results.userJourney.overallScore,
        cognitiveLoad: results.cognitiveLoad.overallScore,
        emotionalUX: results.emotionalUX.overallScore
      },
      testCounts: {
        total: results.executionSummary.totalTests,
        passed: results.executionSummary.passedTests,
        failed: results.executionSummary.failedTests
      },
      issues: {
        critical: results.comprehensiveAnalysis.criticalIssues.length,
        total: results.comprehensiveAnalysis.recommendations.length
      },
      quickWins: results.comprehensiveAnalysis.quickWins.length,
      executionTime: results.executionSummary.executionTime
    };
  }
}

// Make it available globally for console testing
declare global {
  interface Window {
    runUXTests: () => Promise<EnhancedUXTestSuiteResult>;
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.runUXTests = EnhancedUXTestSuite.runAndLogUXTests;
}