import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TestAnalyticsCollector } from '@/testing/analytics/TestAnalyticsCollector';
import { ComprehensiveTestSuite } from '@/testing/ComprehensiveTestSuite';

interface TestAnalytics {
  timestamp: number;
  testRunId: string;
  environment: string;
  overallResults: {
    successRate: number;
    totalTests: number;
    duration: number;
    categories: Record<string, any>;
  };
  performance: {
    loadTesting: {
      maxConcurrentUsers: number;
      avgResponseTime: number;
      errorRate: number;
      throughput: number;
    };
    browserPerformance: {
      avgLoadTime: number;
      compatibilityScore: number;
    };
    regressions: any[];
  };
  trends: {
    predictive: {
      nextWeekSuccessRate: number;
      riskFactors: string[];
      recommendations: string[];
    };
  };
  insights: Array<{
    type: 'warning' | 'improvement' | 'regression' | 'achievement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
  }>;
}

export const TestAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<TestAnalytics[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [latestResults, setLatestResults] = useState<TestAnalytics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      const stored = localStorage.getItem('test-analytics');
      if (stored) {
        const data = JSON.parse(stored);
        setAnalytics(data);
        if (data.length > 0) {
          setLatestResults(data[data.length - 1]);
        }
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const runTestSuite = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    try {
      const testSuite = new ComprehensiveTestSuite();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => Math.min(prev + 10, 90));
      }, 2000);

      const results = await testSuite.runFullTestSuite();

      clearInterval(progressInterval);
      setTestProgress(100);
      
      // Refresh analytics data
      setTimeout(() => {
        loadAnalyticsData();
        setIsRunningTests(false);
        setTestProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Test suite failed:', error);
      setIsRunningTests(false);
      setTestProgress(0);
    }
  };

  const exportAnalytics = (format: 'json' | 'csv') => {
    const collector = new TestAnalyticsCollector();
    // Load existing data into collector
    analytics.forEach(data => {
      (collector as any).analyticsData.push(data);
    });
    
    const exported = collector.exportAnalyticsData(format);
    const blob = new Blob([exported], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-analytics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'hsl(var(--success))';
    if (rate >= 85) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'regression': return '📉';
      case 'improvement': return '📈';
      case 'achievement': return '🏆';
      default: return 'ℹ️';
    }
  };

  const filteredAnalytics = analytics.filter(data => {
    const cutoff = selectedTimeframe === 'week' ? 7 : 30;
    return Date.now() - data.timestamp < cutoff * 24 * 60 * 60 * 1000;
  });

  const successRateData = filteredAnalytics.map((data, index) => ({
    run: index + 1,
    successRate: data.overallResults.successRate,
    date: new Date(data.timestamp).toLocaleDateString()
  }));

  const categoryData = latestResults ? Object.entries(latestResults.overallResults.categories).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    successRate: ((data.passed / data.total) * 100) || 0,
    total: data.total
  })) : [];

  const performanceData = filteredAnalytics.map((data, index) => ({
    run: index + 1,
    loadTime: data.performance.browserPerformance.avgLoadTime,
    responseTime: data.performance.loadTesting.avgResponseTime,
    date: new Date(data.timestamp).toLocaleDateString()
  }));

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing insights and quality metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => exportAnalytics('json')}
            variant="outline"
            disabled={analytics.length === 0}
          >
            Export JSON
          </Button>
          <Button 
            onClick={() => exportAnalytics('csv')}
            variant="outline"
            disabled={analytics.length === 0}
          >
            Export CSV
          </Button>
          <Button 
            onClick={runTestSuite}
            disabled={isRunningTests}
            className="relative"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Test Suite'}
          </Button>
        </div>
      </div>

      {isRunningTests && (
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={testProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Running comprehensive test suite... {testProgress}%
            </p>
          </CardContent>
        </Card>
      )}

      {latestResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getSuccessRateColor(latestResults.overallResults.successRate) }}>
                {latestResults.overallResults.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {latestResults.overallResults.totalTests} total tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Test Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(latestResults.overallResults.duration / 1000)}s
              </div>
              <p className="text-xs text-muted-foreground">
                Latest run duration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestResults.performance.loadTesting.avgResponseTime}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Avg response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Browser Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestResults.performance.browserPerformance.compatibilityScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Cross-browser score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
                <CardDescription>
                  Test success rate over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="run" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                    <Line 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Success rate by test category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                    <Bar dataKey="successRate" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historical Trends</CardTitle>
                  <CardDescription>
                    Analyze patterns and predict future performance
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe('month')}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {latestResults && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <strong>Prediction:</strong> Next week's expected success rate: {' '}
                      <span className="font-semibold">
                        {latestResults.trends.predictive.nextWeekSuccessRate.toFixed(1)}%
                      </span>
                    </AlertDescription>
                  </Alert>
                  
                  {latestResults.trends.predictive.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors:</h4>
                      <div className="space-y-1">
                        {latestResults.trends.predictive.riskFactors.map((risk, index) => (
                          <Badge key={index} variant="destructive">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {latestResults.trends.predictive.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Load times and response performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="run" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loadTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Load Time (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {latestResults && latestResults.performance.regressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Regressions</CardTitle>
                <CardDescription>
                  Detected performance degradations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latestResults.performance.regressions.map((regression: any, index) => (
                    <Alert key={index}>
                      <AlertDescription>
                        <strong>{regression.metric}:</strong> {' '}
                        {regression.previousValue} → {regression.currentValue} {' '}
                        ({regression.changePercent > 0 ? '+' : ''}{regression.changePercent.toFixed(1)}%)
                        <Badge variant="destructive" className="ml-2">
                          {regression.severity}
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {latestResults && latestResults.insights.length > 0 ? (
            <div className="space-y-4">
              {latestResults.insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span>{getInsightIcon(insight.type)}</span>
                        {insight.title}
                      </CardTitle>
                      <Badge variant={getPriorityBadgeVariant(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <p className="text-sm font-medium">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No insights available. Run a test suite to generate insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {latestResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(latestResults.overallResults.categories).map(([name, data]) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-semibold" style={{ 
                          color: getSuccessRateColor((data.passed / data.total) * 100) 
                        }}>
                          {((data.passed / data.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tests:</span>
                        <span>{data.passed}/{data.total}</span>
                      </div>
                      <Progress 
                        value={(data.passed / data.total) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {analytics.length === 0 && !isRunningTests && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No analytics data available yet.
            </p>
            <Button onClick={runTestSuite}>
              Run Your First Test Suite
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};