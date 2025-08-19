import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Users, Zap, AlertTriangle } from 'lucide-react';
import { useAdvancedMonitoring } from '@/hooks/useAdvancedMonitoring';
import { CulturalRepresentationMonitor } from './CulturalRepresentationMonitor';
import { SystemDocumentation } from './SystemDocumentation';

export function AdvancedMonitoringDashboard() {
  const { monitoringData, isLoading, refresh } = useAdvancedMonitoring();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Monitoring Dashboard</h2>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cultural">Cultural AI</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monitoringData?.performanceMetrics?.cache?.hitRate?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {monitoringData?.performanceMetrics?.cache?.totalCalls} total calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Characters</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monitoringData?.characterSeeds?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Character consistency seeds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cultural Balance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((monitoringData?.culturalMetrics?.culturalBalance || 0) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Diversity score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monitoringData?.activeTests?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  A/B experiments running
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Performance Monitoring</span>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Character Consistency</span>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cultural Intelligence</span>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>A/B Testing Framework</span>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cache Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hit Rate:</span>
                      <span className="ml-2 font-medium">
                        {monitoringData?.performanceMetrics?.cache?.hitRate?.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="ml-2 font-medium">
                        {monitoringData?.performanceMetrics?.cache?.totalCalls}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Generation Performance</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg Generation Time:</span>
                      <span className="ml-2 font-medium">
                        {monitoringData?.performanceMetrics?.performance?.averageGenerationTime?.toFixed(0)}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="ml-2 font-medium">
                        {((1 - (monitoringData?.performanceMetrics?.failures?.recentFailures || 0) / 100) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-4">
          <CulturalRepresentationMonitor />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringData?.activeTests?.length > 0 ? (
                  monitoringData.activeTests.map((test: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {test.variants?.length || 0} variants
                        </Badge>
                        <Badge variant="outline">
                          Target: {test.sampleSize} users
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No active A/B tests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <SystemDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}