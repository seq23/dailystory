import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Palette, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Wrench,
  Eye,
  Smartphone
} from 'lucide-react';
import { VisualDesignTestSuite } from '@/testing/modules/VisualDesignTestSuite';
import { EfficiencyFirstRecommendationEngine } from '@/testing/modules/EfficiencyFirstRecommendationEngine';
import { AutomatedFixSystem } from '@/testing/modules/AutomatedFixSystem';
import type { TestCategoryResult } from '@/testing/ComprehensiveTestSuite';

interface EnhancedDesignDashboardProps {
  className?: string;
}

export const EnhancedDesignDashboard: React.FC<EnhancedDesignDashboardProps> = ({ 
  className = "" 
}) => {
  const [designResults, setDesignResults] = useState<TestCategoryResult | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [autoFixResults, setAutoFixResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const runEnhancedDesignTests = async () => {
    setIsRunning(true);
    try {
      // Run visual design tests
      const results = await VisualDesignTestSuite.runVisualDesignTests();
      setDesignResults(results);

      // Generate efficiency-first recommendations
      const recs = EfficiencyFirstRecommendationEngine.generateEfficiencyRecommendations([
        { category: 'design', issues: results.issues || [] }
      ]);
      setRecommendations(recs);

      // Attempt automated fixes
      const autoFixes = await AutomatedFixSystem.attemptAutoFixes(results.issues || []);
      setAutoFixResults(autoFixes);

    } catch (error) {
      console.error('Enhanced design tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runEnhancedDesignTests();
  }, []);

  const quickWins = recommendations.filter(r => r.quickWin);
  const automatedFixes = autoFixResults.filter(r => r.fixApplied);
  const pendingReview = autoFixResults.filter(r => r.requiresReview);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enhanced Design Dashboard</h2>
          <p className="text-muted-foreground">
            Automated design testing with efficiency-first recommendations
          </p>
        </div>
        <Button 
          onClick={runEnhancedDesignTests} 
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <Clock className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isRunning ? 'Testing...' : 'Run Design Tests'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Design Score</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(designResults?.score || 0)}`}>
              {designResults?.score?.toFixed(1) || '--'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {designResults?.passed || 0} of {designResults?.total || 0} tests passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {quickWins.length}
            </div>
            <p className="text-xs text-muted-foreground">
              High-impact, low-effort fixes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Fixed</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {automatedFixes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Issues automatically resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.reduce((sum, r) => sum + r.estimatedHours, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Total implementation time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="automated">Auto-Fixes</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Wins Section */}
          {quickWins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Wins - Start Here!
                </CardTitle>
                <CardDescription>
                  High-impact improvements that take minimal effort
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickWins.slice(0, 3).map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{rec.estimatedHours}h</Badge>
                        <Badge variant="outline">Impact: {rec.effortToImpact}/10</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    <div className="text-xs text-green-600 font-medium">
                      💡 {rec.preventOverEngineering.simpleApproach}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Automated Fixes Status */}
          {autoFixResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  Automated Fixes Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {automatedFixes.map((fix, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{fix.issue}</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✅ Fixed
                      </Badge>
                    </div>
                  ))}
                  {pendingReview.map((fix, index) => (
                    <div key={`pending-${index}`} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{fix.issue}</span>
                      <Badge variant="outline" className="text-orange-600">
                        ⏳ Review Required
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency-First Recommendations</CardTitle>
              <CardDescription>
                Prioritized by effort-to-impact ratio. Focus on quick wins first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(rec.priority)}
                        <h4 className="font-medium">{rec.title}</h4>
                        {rec.quickWin && (
                          <Badge className="bg-yellow-100 text-yellow-800">⚡ Quick Win</Badge>
                        )}
                        {rec.automatable && (
                          <Badge className="bg-blue-100 text-blue-800">🤖 Auto-fixable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">Impact: {rec.effortToImpact}/10</div>
                      <div className="text-sm text-muted-foreground">{rec.estimatedHours}h</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Simple Approach:</strong> {rec.preventOverEngineering.simpleApproach}
                    </div>
                    {rec.implementation.alternatives.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600">
                          View Implementation Options
                        </summary>
                        <div className="mt-2 space-y-2">
                          {rec.implementation.alternatives.map((alt: any, altIndex: number) => (
                            <div key={altIndex} className="border-l-2 border-gray-200 pl-3">
                              <div className="font-medium">{alt.approach}</div>
                              <div className="text-xs text-green-600">
                                Pros: {alt.pros.join(', ')}
                              </div>
                              <div className="text-xs text-red-600">
                                Cons: {alt.cons.join(', ')}
                              </div>
                              <div className="text-xs text-gray-600">
                                Effort: {alt.effort}/5
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Fix System</CardTitle>
              <CardDescription>
                Issues that can be automatically resolved without manual intervention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {autoFixResults.length > 0 ? (
                <div className="space-y-3">
                  {autoFixResults.map((fix, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{fix.issue}</h4>
                        <Badge 
                          variant={fix.fixApplied ? "default" : "outline"}
                          className={fix.fixApplied ? "bg-green-100 text-green-800" : "text-orange-600"}
                        >
                          {fix.fixApplied ? "✅ Applied" : "⏳ Needs Review"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{fix.impact}</p>
                      
                      {fix.beforeCode && fix.afterCode && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600">View Code Changes</summary>
                          <div className="mt-2 space-y-2">
                            <div>
                              <div className="text-xs text-red-600 font-medium">Before:</div>
                              <code className="text-xs bg-red-50 p-1 rounded">{fix.beforeCode}</code>
                            </div>
                            <div>
                              <div className="text-xs text-green-600 font-medium">After:</div>
                              <code className="text-xs bg-green-50 p-1 rounded">{fix.afterCode}</code>
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No auto-fixable issues detected. All issues require manual review.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quick Win Rate</span>
                    <span>{((quickWins.length / Math.max(recommendations.length, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(quickWins.length / Math.max(recommendations.length, 1)) * 100} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Automation Rate</span>
                    <span>{((automatedFixes.length / Math.max(autoFixResults.length, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(automatedFixes.length / Math.max(autoFixResults.length, 1)) * 100} />
                </div>

                <div className="pt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg. Effort-to-Impact:</span>
                    <span className="font-medium">
                      {(recommendations.reduce((sum, r) => sum + r.effortToImpact, 0) / Math.max(recommendations.length, 1)).toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anti-Over-Engineering Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertDescription className="text-sm">
                    💡 <strong>Remember:</strong> Start with the simplest solution that works. 
                    Complexity can be added later if needed.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 text-sm">
                  <div>🎯 <strong>Focus on the 20%</strong> of changes that give 80% of the benefit</div>
                  <div>⚡ <strong>Prioritize quick wins</strong> for immediate impact</div>
                  <div>🤖 <strong>Use automation</strong> for repetitive fixes</div>
                  <div>📏 <strong>Measure twice,</strong> code once</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};