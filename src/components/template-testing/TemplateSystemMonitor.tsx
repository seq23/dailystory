/**
 * Template System Monitor - Real-time monitoring dashboard
 * Displays system health, template performance, and placeholder resolution status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplateMonitoringService } from '@/services/TemplateMonitoringService';
import { TemplateValidationService } from '@/services/TemplateValidationService';
import { PlaceholderValidationService } from '@/services/PlaceholderValidationService';
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { DebugLogger } from '@/services/DebugLogger';

interface MonitoringData {
  systemHealth: any;
  templateRankings: any[];
  problematicTemplates: any[];
  placeholderIssues: any[];
  alerts: any[];
  validationMetrics: any;
}

export function TemplateSystemMonitor() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate real monitoring data collection
      const report = TemplateMonitoringService.generateMonitoringReport();
      const alerts = TemplateMonitoringService.checkForCriticalIssues();
      const validationMetrics = TemplateValidationService.getValidationMetrics();

      setMonitoringData({
        systemHealth: report.summary || { recommendations: [] },
        templateRankings: report.topPerformingTemplates || [],
        problematicTemplates: report.problematicTemplates || [],
        placeholderIssues: report.placeholderIssues || [],
        alerts: alerts || [],
        validationMetrics: validationMetrics || { commonErrors: [] }
      });
    } catch (error) {
      ProductionLogging.error('TEMPLATE', 'Error refreshing monitoring data', 'TemplateSystemMonitor', { error });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-600';
    if (rate >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!monitoringData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Loading monitoring data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Template System Monitor</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Stop Auto Refresh' : 'Start Auto Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Activity className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {monitoringData.alerts && monitoringData.alerts.length > 0 && (
        <div className="space-y-2">
          {monitoringData.alerts.map((alert, index) => (
            <Alert key={index} className="border-l-4 border-l-red-500">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{alert.issue}</span>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.recommendation}
                </p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-bold ${getSuccessRateColor(monitoringData.systemHealth.overallSuccessRate)}`}>
                {(monitoringData.systemHealth.overallSuccessRate * 100).toFixed(1)}%
              </div>
              <Progress 
                value={monitoringData.systemHealth.overallSuccessRate * 100} 
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {monitoringData.systemHealth.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">
                Processing time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Active Templates</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {monitoringData.systemHealth.activeTemplateCount}
              </div>
              <div className="text-sm text-muted-foreground">
                In system
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Critical Errors</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-red-600">
                {monitoringData.systemHealth.criticalErrors}
              </div>
              <div className="text-sm text-muted-foreground">
                Last 24h
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
          <TabsTrigger value="placeholders">Placeholder Analysis</TabsTrigger>
          <TabsTrigger value="validation">Validation Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Templates</CardTitle>
              </CardHeader>
              <CardContent>
                {monitoringData.templateRankings && monitoringData.templateRankings.length > 0 ? (
                  <div className="space-y-2">
                    {monitoringData.templateRankings.slice(0, 5).map((template, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{template.templateId}</div>
                          <div className="text-sm text-muted-foreground">
                            Used {template.usageCount} times
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getSuccessRateColor(template.successRate)}`}>
                            {(template.successRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {template.averageProcessingTime.toFixed(0)}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No template data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problematic Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Templates Needing Attention</CardTitle>
              </CardHeader>
              <CardContent>
                {monitoringData.problematicTemplates && monitoringData.problematicTemplates.length > 0 ? (
                  <div className="space-y-2">
                    {monitoringData.problematicTemplates.slice(0, 5).map((template, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded border-red-200">
                        <div>
                          <div className="font-medium">{template.templateId}</div>
                          <div className="text-sm text-muted-foreground">
                            Issues detected
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">
                            {(template.successRate * 100).toFixed(1)}%
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            Needs Review
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-green-600 py-4">
                    ✅ All templates performing well!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="placeholders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Placeholder Resolution Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {monitoringData.placeholderIssues && monitoringData.placeholderIssues.length > 0 ? (
                <div className="space-y-3">
                  {monitoringData.placeholderIssues.map((placeholder, index) => (
                    <div key={index} className="p-3 border rounded border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{placeholder.placeholder}</div>
                        <Badge variant="outline">
                          {(placeholder.resolutionRate * 100).toFixed(1)}% success
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {placeholder.failureCount} failures recorded
                      </div>
                      {placeholder.commonFailureReasons && placeholder.commonFailureReasons.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Common issues: {placeholder.commonFailureReasons.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-green-600 py-4">
                  ✅ All placeholders resolving successfully!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Total Validations</div>
                  <div className="text-2xl font-bold">
                    {monitoringData.validationMetrics.totalValidations}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Success Rate</div>
                  <div className={`text-2xl font-bold ${getSuccessRateColor(monitoringData.validationMetrics.successRate)}`}>
                    {(monitoringData.validationMetrics.successRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {monitoringData.validationMetrics.commonErrors && monitoringData.validationMetrics.commonErrors.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Common Validation Errors</div>
                  <div className="space-y-1">
                    {monitoringData.validationMetrics.commonErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span className="truncate">{error.error}</span>
                        <Badge variant="outline">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {monitoringData.systemHealth.recommendations && monitoringData.systemHealth.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {monitoringData.systemHealth.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}