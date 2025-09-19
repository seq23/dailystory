/**
 * Cultural Representation Monitoring Dashboard
 * Real-time monitoring of cultural diversity and bias detection in image generation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingUp, Users, RefreshCw } from "lucide-react";
import { DebugLogger } from "@/services/DebugLogger";

export interface CulturalMetrics {
  totalGenerations: number;
  culturalDistribution: Record<string, number>;
  averageBiasScore: number;
  alertCount: number;
  topIssues: string[];
  trendData: Array<{ date: string; score: number; culture: string }>;
}

export const CulturalRepresentationMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<CulturalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Get monitoring data from backend
      const { data } = await supabase.functions.invoke('get-monitoring-data');
      
      if (data?.success) {
        setMetrics(data.data.culturalMetrics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      DebugLogger.error('network', 'Failed to load cultural metrics', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock trend data for demonstration
  const generateMockTrendData = () => {
    const cultures = ['african-american', 'hispanic-latino', 'asian', 'european-american'];
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      cultures.forEach(culture => {
        data.push({
          date: date.toISOString().split('T')[0],
          score: 75 + Math.random() * 20, // Score between 75-95
          culture
        });
      });
    }
    
    return data;
  };

  useEffect(() => {
    // Check if debug monitoring is enabled via URL params
    const urlParams = new URLSearchParams(window.location.search);
    const monitoringEnabled = urlParams.has('monitoring') || urlParams.has('debug');
    
    if (monitoringEnabled) {
      loadMetrics();
      
      // EMERGENCY FIX: Only auto-refresh if explicitly enabled via URL params
      // Disabled by default to prevent resource exhaustion
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadMetrics();
        }
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const getBiasScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBiasScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cultural Representation Monitor</CardTitle>
          <CardDescription>Loading cultural diversity metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cultural Representation Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of cultural diversity and bias detection
          </p>
        </div>
        <Button 
          onClick={loadMetrics} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Section */}
      {metrics.alertCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.alertCount} cultural bias issue(s) detected in recent generations. 
            Review the issues tab for details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Cultural Distribution</TabsTrigger>
          <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalGenerations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bias Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBiasScoreColor(metrics.averageBiasScore)}`}>
                  {metrics.averageBiasScore.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getBiasScoreLabel(metrics.averageBiasScore)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cultural Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(metrics.culturalDistribution).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active cultures represented
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.alertCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Representation Distribution</CardTitle>
              <CardDescription>
                Percentage breakdown of cultural representations in generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(metrics.culturalDistribution).map(([culture, percentage]) => (
                <div key={culture} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium">
                      {culture.replace('-', ' ')}
                    </span>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Cultural Bias Issues</CardTitle>
              <CardDescription>
                Most frequently detected issues and recommended improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.topIssues.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topIssues.map((issue, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No significant bias issues detected</p>
                  <p className="text-sm">Cultural representation is well balanced</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Representation Trends</CardTitle>
              <CardDescription>
                Bias scores and representation trends over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Trend visualization would appear here</p>
                  <p className="text-sm">Chart showing bias scores over time by cultural group</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}
    </div>
  );
};