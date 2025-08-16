// Real-time Prompt Monitoring Dashboard Component
// Phase 4: Monitoring and analytics for prompt optimization

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptValidationEngine, type ValidationResult, type GenerationMonitoringData } from '@/utils/promptValidationEngine';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';

interface PromptMonitoringDashboardProps {
  className?: string;
}

export const PromptMonitoringDashboard: React.FC<PromptMonitoringDashboardProps> = ({ 
  className 
}) => {
  const [dashboardData, setDashboardData] = useState<ReturnType<typeof PromptValidationEngine.getMonitoringDashboard> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const data = PromptValidationEngine.getMonitoringDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Disabled auto-refresh to prevent unwanted page refreshes
    // const interval = setInterval(refreshData, 30000);
    // return () => clearInterval(interval);
  }, []);

  if (!dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading monitoring data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { recentGenerations, statistics, trends } = dashboardData;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'ai-enhanced': return <Zap className="h-4 w-4" />;
      case 'optimized-ai': return <TrendingUp className="h-4 w-4" />;
      case 'simple-fallback': return <Shield className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Generation Monitoring</h2>
          <p className="text-muted-foreground">Real-time analytics and optimization insights</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          ) : null}
          Refresh
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.successRate * 100)}%
            </div>
            <Progress value={statistics.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Prompt Length</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.averagePromptLength)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              characters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.fallbackRate * 100)}%
            </div>
            <Progress value={statistics.fallbackRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.averageGenerationTime)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              milliseconds
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Generations</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Distribution</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Generation Attempts</CardTitle>
              <CardDescription>
                Last {recentGenerations.length} prompt generations with status and optimization details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGenerations.slice(-10).reverse().map((generation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStrategyIcon(generation.strategy)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={generation.success ? 'default' : 'destructive'}>
                            {generation.success ? 'Success' : 'Failed'}
                          </Badge>
                          <Badge variant="outline">
                            {generation.strategy}
                          </Badge>
                          {generation.fallbackUsed && (
                            <Badge variant="secondary">Fallback</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {generation.promptLength} chars • {generation.generationTime}ms
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {generation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Distribution</CardTitle>
              <CardDescription>
                How often different generation strategies are being used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.strategyDistribution).map(([strategy, count]) => {
                  const percentage = (count / statistics.totalGenerations) * 100;
                  return (
                    <div key={strategy} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStrategyIcon(strategy)}
                          <span className="capitalize">{strategy.replace('-', ' ')}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Common error types and their frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(statistics.commonErrorTypes).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(statistics.commonErrorTypes).map(([errorType, count]) => (
                    <div key={errorType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="capitalize">{errorType.replace('-', ' ')}</span>
                      </div>
                      <Badge variant="destructive">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No errors detected in recent generations. Great job!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
                <CardDescription>
                  Success rate over recent generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end space-x-1">
                  {trends.successRateTrend.map((rate, index) => (
                    <div
                      key={index}
                      className="bg-primary/20 flex-1 rounded-t"
                      style={{ height: `${rate * 100}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fallback Rate Trend</CardTitle>
                <CardDescription>
                  Fallback usage over recent generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end space-x-1">
                  {trends.fallbackRateTrend.map((rate, index) => (
                    <div
                      key={index}
                      className="bg-secondary/40 flex-1 rounded-t"
                      style={{ height: `${rate * 100}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};