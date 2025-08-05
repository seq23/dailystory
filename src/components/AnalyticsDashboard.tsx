// Analytics Dashboard Component - Production analytics visualization

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useProductionAnalytics } from '@/hooks/useProductionAnalytics';
import { Download, Users, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { dashboard, refreshDashboard, exportAnalytics, isTracking, getSessionSummary } = useProductionAnalytics();

  if (!dashboard.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const { usageAnalytics, templateAnalytics, systemHealth } = dashboard;
  const sessionSummary = getSessionSummary();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Production system monitoring and user engagement analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshDashboard} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Session Status */}
      {isTracking && sessionSummary && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              Active Session
            </CardTitle>
            <CardDescription>
              Session ID: {sessionSummary.sessionId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-2xl font-bold text-primary">{sessionSummary.formattedDuration}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {systemHealth.currentHealth.performanceScore.toFixed(1)}%
            </div>
            <Progress value={systemHealth.currentHealth.performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {systemHealth.currentHealth.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">Current sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {systemHealth.currentHealth.templateLoadTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Template loading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(systemHealth.currentHealth.cacheHitRate * 100).toFixed(1)}%
            </div>
            <Progress value={systemHealth.currentHealth.cacheHitRate * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {systemHealth.alerts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.alerts.map((alert: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-800 dark:text-amber-300">{alert}</span>
                </div>
              ))}
            </div>
            {systemHealth.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {systemHealth.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-amber-600 dark:text-amber-400">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
            <CardDescription>Total user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold text-foreground">{usageAnalytics.totalSessions}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <p className="text-3xl font-bold text-green-600">{usageAnalytics.activeSessions}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Session Duration</p>
              <p className="text-xl font-semibold text-foreground">
                {Math.round(usageAnalytics.averageSessionDuration / 1000 / 60)} minutes
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                <p className="text-2xl font-bold text-primary">{usageAnalytics.premiumVsFreeUsage.premium}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Free Users</p>
                <p className="text-2xl font-bold text-muted-foreground">{usageAnalytics.premiumVsFreeUsage.free}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Level Popularity</CardTitle>
            <CardDescription>Most used reading levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageAnalytics.popularGradeLevels.slice(0, 5).map((level: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {level.level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(level.count / usageAnalytics.popularGradeLevels[0].count) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{level.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>Top performing and underperforming story templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-600 mb-3">Top Performing Templates</h4>
              <div className="space-y-2">
                {templateAnalytics.topPerformingTemplates.slice(0, 5).map((template: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                    <span className="text-sm font-medium">Level {template.gradeLevel} Template</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {(template.averageCompletionRate * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {templateAnalytics.underperformingTemplates.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-3">Needs Improvement</h4>
                <div className="space-y-2">
                  {templateAnalytics.underperformingTemplates.map((template: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <span className="text-sm font-medium">Level {template.gradeLevel} Template</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        {(template.averageCompletionRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Device Usage</CardTitle>
          <CardDescription>User device preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{usageAnalytics.deviceBreakdown.mobile}</p>
              <p className="text-sm text-muted-foreground">Mobile</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{usageAnalytics.deviceBreakdown.tablet}</p>
              <p className="text-sm text-muted-foreground">Tablet</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{usageAnalytics.deviceBreakdown.desktop}</p>
              <p className="text-sm text-muted-foreground">Desktop</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};