// Enhanced Analytics Dashboard with Cost Tracking and Performance Monitoring
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductionAnalytics } from '@/hooks/useProductionAnalytics';
import { AlertTriangle, DollarSign, TrendingUp, Clock, RefreshCw, Mail, Calendar, BookOpen, Image, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    dashboard, 
    refreshDashboard, 
    getDailyCostSummary,
    isTracking,
    currentSession 
  } = useProductionAnalytics();

  const [costSummary, setCostSummary] = useState<any>(null);
  const [totalCostSummary, setTotalCostSummary] = useState<any>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(true);
  const [isSendingReport, setIsSendingReport] = useState(false);

  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    setIsLoadingCost(true);
    try {
      const data = await getDailyCostSummary();
      setCostSummary(data.costSummary);
      setTotalCostSummary(data.totalCostSummary);
    } catch (error) {
      console.error('Failed to load cost data:', error);
    } finally {
      setIsLoadingCost(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refreshDashboard(),
      loadCostData()
    ]);
  };

  const handleSendReport = async (emailOnly = true) => {
    setIsSendingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-report', {
        body: { sendEmail: emailOnly },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(emailOnly ? '📧 Cost report sent to your email!' : '📊 Report generated');
      } else {
        toast.error(data?.error || 'Failed to generate report');
      }
    } catch (err: any) {
      console.error('Report error:', err);
      toast.error('Failed to send report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSendingReport(false);
    }
  };

  if (!dashboard.isLoaded || isLoadingCost) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const monthBudget = costSummary?.monthBudget || 100.0;
  const monthCost = costSummary?.monthCost || 0;
  const monthPercentage = (monthCost / monthBudget) * 100;

  // Extract operation breakdowns
  const todayOps = costSummary?.operationBreakdown || {};
  const allTimeOps = totalCostSummary?.operationBreakdown || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor costs, performance, and usage</p>
        </div>
        <div className="flex gap-2">
          {isTracking && (
            <Badge variant="default" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Live Tracking
            </Badge>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => handleSendReport(true)} 
            variant="default" 
            size="sm" 
            disabled={isSendingReport}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {isSendingReport ? 'Sending...' : 'Email Report'}
          </Button>
          <Button 
            onClick={() => handleSendReport(false)} 
            variant="ghost" 
            size="sm"
            disabled={isSendingReport}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* All-Time Project Costs */}
      {totalCostSummary && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              All-Time Project Costs
            </CardTitle>
            <CardDescription>Cumulative spending across all operations since launch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-4">
              ${totalCostSummary.totalCost.toFixed(4)}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">
                  ${totalCostSummary.providerBreakdown?.openai?.cost?.toFixed(4) || '0.0000'}
                </div>
                <p className="text-xs text-muted-foreground">OpenAI</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">
                  ${totalCostSummary.providerBreakdown?.elevenlabs?.cost?.toFixed(4) || '0.0000'}
                </div>
                <p className="text-xs text-muted-foreground">ElevenLabs</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">
                  ${totalCostSummary.providerBreakdown?.runware?.cost?.toFixed(4) || '0.0000'}
                </div>
                <p className="text-xs text-muted-foreground">Runware</p>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span>Total API Requests:</span>
                <span className="font-medium">{totalCostSummary.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Cost/Request:</span>
                <span className="font-medium">${totalCostSummary.averageCostPerRequest.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost/Story (avg):</span>
                <span className="font-medium">
                  {totalCostSummary.totalStories > 0 
                    ? `$${totalCostSummary.costPerStory.toFixed(4)}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Tokens:</span>
                <span className="font-medium">{totalCostSummary.totalTokens.toLocaleString()}</span>
              </div>
            </div>

            {/* All-time operation breakdown */}
            <div className="grid gap-3 md:grid-cols-3 mt-4">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm font-semibold">{allTimeOps.story_generation || 0}</div>
                  <p className="text-xs text-muted-foreground">Stories Generated</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Image className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm font-semibold">{allTimeOps.image_generation || 0}</div>
                  <p className="text-xs text-muted-foreground">Images Generated</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Mic className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm font-semibold">{allTimeOps.audio_generation || 0}</div>
                  <p className="text-xs text-muted-foreground">Audio Generated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Costs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costSummary?.totalCost.toFixed(4) || '0.0000'}
            </div>
            <Progress value={Math.min(costPercentage, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {costPercentage >= 90 ? (
                <span className="flex items-center text-red-500">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Approaching daily limit
                </span>
              ) : (
                `${(100 - costPercentage).toFixed(1)}% remaining of $${dailyLimit} daily limit`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {costSummary?.totalRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${costSummary?.averageCostPerRequest?.toFixed(4) || '0.0000'}/request
            </p>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>{todayOps.story_generation || 0} stories</span>
              <span>{todayOps.image_generation || 0} images</span>
              <span>{todayOps.audio_generation || 0} audio</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSession ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSession?.sessionId ? `ID: ${currentSession.sessionId.slice(-8)}` : 'No active session'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model & Token Breakdown (Today) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Model Breakdown</CardTitle>
            <CardDescription>Cost and requests by AI model for today</CardDescription>
          </CardHeader>
          <CardContent>
            {costSummary?.modelBreakdown && Object.keys(costSummary.modelBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(costSummary.modelBreakdown).map(([model, data]) => {
                  const modelData = data as { requests: number; cost: number };
                  return (
                    <div key={model} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{model}</Badge>
                        <span className="text-sm">{modelData.requests} requests</span>
                      </div>
                      <div className="text-sm font-medium">
                        ${modelData.cost.toFixed(4)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No requests today yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Token Usage</CardTitle>
            <CardDescription>Input and output tokens consumed today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Input Tokens</span>
                <span className="font-medium">
                  {costSummary?.totalInputTokens?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Output Tokens</span>
                <span className="font-medium">
                  {costSummary?.totalOutputTokens?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Total Tokens</span>
                <span className="font-bold">
                  {((costSummary?.totalInputTokens || 0) + (costSummary?.totalOutputTokens || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Cost limit status and daily budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {costSummary?.isLimitExceeded ? '❌' : '✅'}
              </div>
              <p className="text-sm text-muted-foreground">Daily Cost Limit</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${costSummary?.remainingBudget?.toFixed(2) || dailyLimit.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Remaining Budget Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${dailyLimit.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Daily Limit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
