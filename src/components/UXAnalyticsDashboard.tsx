import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Heart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  Lightbulb,
  Zap
} from 'lucide-react';
import { EnhancedUXTestSuite, type EnhancedUXTestSuiteResult } from '@/testing/modules/EnhancedUXTestSuite';
import { UXRecommendationEngine, type UXRecommendation } from '@/testing/modules/UXRecommendationEngine';

export const UXAnalyticsDashboard = () => {
  const [testResults, setTestResults] = useState<EnhancedUXTestSuiteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<UXRecommendation | null>(null);

  const runUXTests = async () => {
    setLoading(true);
    try {
      const results = await EnhancedUXTestSuite.runComprehensiveUXTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run UX tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">UX Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive user experience analysis and recommendations
            </p>
          </div>
          <Button 
            onClick={runUXTests} 
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            {loading ? 'Running Tests...' : 'Run UX Analysis'}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">Running comprehensive UX analysis...</p>
              <p className="text-muted-foreground">Testing user journey, cognitive load, and emotional UX</p>
            </CardContent>
          </Card>
        )}

        {/* Results Dashboard */}
        {testResults && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Overall Score */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overall UX Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(testResults.executionSummary.overallUXScore)}`}>
                        {testResults.executionSummary.overallUXScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${getScoreBackground(testResults.executionSummary.overallUXScore)}`}>
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tests Passed</p>
                      <p className="text-3xl font-bold text-foreground">
                        {testResults.executionSummary.passedTests}/{testResults.executionSummary.totalTests}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Issues */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                      <p className="text-3xl font-bold text-red-600">
                        {testResults.executionSummary.criticalIssuesCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                      <p className="text-3xl font-bold text-foreground">
                        {testResults.executionSummary.recommendationsCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100">
                      <Lightbulb className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Scores */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>UX Category Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of user experience across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User Journey */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">User Journey</span>
                    </div>
                    <Progress value={testResults.userJourney.overallScore} className="h-2" />
                    <p className={`text-sm font-medium ${getScoreColor(testResults.userJourney.overallScore)}`}>
                      {testResults.userJourney.overallScore.toFixed(1)}% - Navigation and flow analysis
                    </p>
                  </div>

                  {/* Cognitive Load */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Cognitive Load</span>
                    </div>
                    <Progress value={testResults.cognitiveLoad.overallScore} className="h-2" />
                    <p className={`text-sm font-medium ${getScoreColor(testResults.cognitiveLoad.overallScore)}`}>
                      {testResults.cognitiveLoad.overallScore.toFixed(1)}% - Mental effort and complexity
                    </p>
                  </div>

                  {/* Emotional UX */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Emotional UX</span>
                    </div>
                    <Progress value={testResults.emotionalUX.overallScore} className="h-2" />
                    <p className={`text-sm font-medium ${getScoreColor(testResults.emotionalUX.overallScore)}`}>
                      {testResults.emotionalUX.overallScore.toFixed(1)}% - Engagement and satisfaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for detailed analysis */}
            <Tabs defaultValue="recommendations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
                <TabsTrigger value="critical-issues">Critical Issues</TabsTrigger>
                <TabsTrigger value="detailed-results">Detailed Results</TabsTrigger>
              </TabsList>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Prioritized Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-generated recommendations to improve user experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.comprehensiveAnalysis.recommendations.map((rec, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground">{rec.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline">
                                {rec.timeframe}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          <p className="text-sm font-medium text-foreground">
                            💎 Impact: {rec.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quick Wins Tab */}
              <TabsContent value="quick-wins" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Wins
                    </CardTitle>
                    <CardDescription>
                      Immediate to short-term improvements with high impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.comprehensiveAnalysis.quickWins.map((win, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground">{win.title}</h4>
                            <Badge variant="secondary">
                              {win.implementation.estimatedEffort} effort
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{win.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{win.timeframe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Critical Issues Tab */}
              <TabsContent value="critical-issues" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Critical Issues
                    </CardTitle>
                    <CardDescription>
                      Issues requiring immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testResults.comprehensiveAnalysis.criticalIssues.length > 0 ? (
                      <div className="space-y-4">
                        {testResults.comprehensiveAnalysis.criticalIssues.map((issue, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{issue}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No Critical Issues Found!
                        </h3>
                        <p className="text-muted-foreground">
                          Your UX is in good shape. Focus on the recommendations for further improvements.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Detailed Results Tab */}
              <TabsContent value="detailed-results" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Journey Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {testResults.userJourney.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm font-medium">{result.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${getScoreColor(result.score)}`}>
                                {result.score.toFixed(0)}%
                              </span>
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cognitive Load Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Cognitive Load
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {testResults.cognitiveLoad.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm font-medium">{result.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${getScoreColor(result.score)}`}>
                                {result.score.toFixed(0)}%
                              </span>
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emotional UX Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Emotional UX
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {testResults.emotionalUX.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm font-medium">{result.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${getScoreColor(result.score)}`}>
                                {result.score.toFixed(0)}%
                              </span>
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Implementation Details Modal/Card */}
            {selectedRecommendation && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Implementation Details: {selectedRecommendation.title}</CardTitle>
                  <CardDescription>
                    Detailed implementation guide for this recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Implementation Steps */}
                    <div>
                      <h4 className="font-medium mb-3">Implementation Steps:</h4>
                      <ol className="space-y-2">
                        {selectedRecommendation.implementation.steps.map((step, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Technical Requirements */}
                    <div>
                      <h4 className="font-medium mb-3">Technical Requirements:</h4>
                      <ul className="space-y-1">
                        {selectedRecommendation.implementation.technicalRequirements.map((req, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Success Metrics */}
                    <div>
                      <h4 className="font-medium mb-3">Success Metrics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.metrics.map((metric, index) => (
                          <Badge key={index} variant="outline">{metric}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedRecommendation(null)}
                    >
                      Close Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Instructions when no results */}
        {!testResults && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Ready to Analyze Your UX?
              </h3>
              <p className="text-muted-foreground mb-6">
                Run comprehensive UX tests to get detailed insights and recommendations for improving user experience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 border rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">User Journey Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Tests navigation patterns, reading flow, error recovery, and task completion.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium mb-1">Cognitive Load Testing</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyzes information architecture, visual complexity, and mental model alignment.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Heart className="h-6 w-6 text-red-600 mb-2" />
                  <h4 className="font-medium mb-1">Emotional UX Evaluation</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures reading enjoyment, frustration points, achievement satisfaction, and trust.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};