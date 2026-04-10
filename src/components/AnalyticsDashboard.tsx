// Analytics Dashboard — Cost Tracking and Usage Monitoring
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductionAnalytics } from '@/hooks/useProductionAnalytics';
import { AlertTriangle, DollarSign, TrendingUp, RefreshCw, Mail, Calendar, BookOpen, Mic, Calculator } from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScenarioSimulator } from '@/components/ScenarioSimulator';

export const AnalyticsDashboard: React.FC = () => {
  const { dashboard, refreshDashboard, getDailyCostSummary } = useProductionAnalytics();

  const [costSummary, setCostSummary] = useState<any>(null);
  const [totalCostSummary, setTotalCostSummary] = useState<any>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(true);
  const [isSendingReport, setIsSendingReport] = useState(false);

  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    setIsLoadingCost(true);
    // Clear stale state so the UI never shows old data after refresh
    setCostSummary(null);
    setTotalCostSummary(null);
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
    await Promise.all([refreshDashboard(), loadCostData()]);
  };

  const handleSendReport = async (emailOnly = true) => {
    setIsSendingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-report', {
        body: { sendEmail: emailOnly },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(emailOnly ? '📧 Cost report emailed!' : '📊 Report generated');
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

  const todayOps = costSummary?.operationBreakdown || {};
  const allTimeOps = totalCostSummary?.operationBreakdown || {};

  // Compute real cost-per-unit for the simulator
  // Post-optimization defaults (Apr 10 2026): Flash v2.5 + persistent cache
  // Old defaults were: story=0.0012, image=0.0013, audio=0.0042 (Turbo, no cache)
  const costPerUnit = {
    story: totalCostSummary?.totalStories > 0
      ? (totalCostSummary.providerBreakdown?.openai?.cost || 0) / Math.max(totalCostSummary.totalStories, 1)
      : 0.0012,   // GPT-4o-mini ~$0.0012/page
    image: (allTimeOps.image_generation || 0) > 0
      ? (totalCostSummary.providerBreakdown?.runware?.cost || 0) / (allTimeOps.image_generation || 1)
      : 0.0013,   // Runware ~$0.0013/image
    audio: (allTimeOps.audio_generation || 0) > 0
      ? (totalCostSummary.providerBreakdown?.elevenlabs?.cost || 0) / (allTimeOps.audio_generation || 1)
      : 0.0018,   // Flash v2.5 ~$0.0018/request (was $0.0042 Turbo pre-Apr 10)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real cost data from your Supabase cost_tracking table</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => handleSendReport(true)} variant="default" size="sm" disabled={isSendingReport} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {isSendingReport ? 'Sending...' : 'Email Report'}
          </Button>
          <Button onClick={() => handleSendReport(false)} variant="ghost" size="sm" disabled={isSendingReport} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-1.5">
            <Calculator className="h-4 w-4" />
            Simulator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* ═══════════════════ MONTHLY BUDGET ═══════════════════ */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monthly Budget
              </CardTitle>
              <CardDescription>
                Alert threshold: ${monthBudget}/month. Calculated from cost_tracking rows this calendar month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-3">
                <div className="text-4xl font-bold text-primary">${monthCost.toFixed(2)}</div>
                <div className="text-muted-foreground text-sm mb-1">of ${monthBudget.toFixed(0)} budget</div>
              </div>
              <Progress value={Math.min(monthPercentage, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {monthPercentage >= 90 ? (
                  <span className="flex items-center text-destructive font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    ⚠️ Approaching ${monthBudget} monthly budget!
                  </span>
                ) : (
                  `$${(monthBudget - monthCost).toFixed(2)} remaining (${(100 - monthPercentage).toFixed(1)}%)`
                )}
              </p>
            </CardContent>
          </Card>

          {/* ═══════════════════ ALL-TIME COSTS ═══════════════════ */}
          {totalCostSummary && (
            <Card>
              <CardHeader>
                <CardTitle>All-Time Costs</CardTitle>
                <CardDescription>Cumulative totals since project launch — every row in cost_tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  ${totalCostSummary.totalCost.toFixed(4)}
                </div>

                {/* Provider breakdown */}
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">${totalCostSummary.providerBreakdown?.openai?.cost?.toFixed(4) || '0.0000'}</div>
                    <p className="text-xs text-muted-foreground">OpenAI ({totalCostSummary.providerBreakdown?.openai?.requests || 0} calls)</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">${totalCostSummary.providerBreakdown?.elevenlabs?.cost?.toFixed(4) || '0.0000'}</div>
                    <p className="text-xs text-muted-foreground">ElevenLabs ({totalCostSummary.providerBreakdown?.elevenlabs?.requests || 0} calls)</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">${totalCostSummary.providerBreakdown?.runware?.cost?.toFixed(4) || '0.0000'}</div>
                    <p className="text-xs text-muted-foreground">Runware ({totalCostSummary.providerBreakdown?.runware?.requests || 0} calls)</p>
                  </div>
                </div>

                {/* Operation counts */}
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">{allTimeOps.story_generation || 0}</div>
                      <p className="text-xs text-muted-foreground">Stories Generated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">{allTimeOps.image_generation || 0}</div>
                      <p className="text-xs text-muted-foreground">Images Generated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Mic className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">{allTimeOps.audio_generation || 0}</div>
                      <p className="text-xs text-muted-foreground">Audio Generated</p>
                    </div>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid gap-2 md:grid-cols-2 text-sm border-t pt-3">
                  <div className="flex justify-between">
                    <span>Total API Requests:</span>
                    <span className="font-medium">{totalCostSummary.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Cost/Request:</span>
                    <span className="font-medium">${totalCostSummary.averageCostPerRequest.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Cost/Story:</span>
                    <span className="font-medium">
                      ${(totalCostSummary.totalStories > 0 ? totalCostSummary.costPerStory : 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>All-Time Tokens:</span>
                    <span className="font-medium">{totalCostSummary.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══════════════════ TODAY ═══════════════════ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Today ({costSummary?.date || new Date().toISOString().split('T')[0]})
              </CardTitle>
              <CardDescription>All cost_tracking rows with today's date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">${costSummary?.totalCost?.toFixed(4) || '0.0000'}</div>
                  <p className="text-xs text-muted-foreground">Cost Today</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{costSummary?.totalRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">API Calls</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{costSummary?.totalInputTokens?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Input Tokens</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{costSummary?.totalOutputTokens?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Output Tokens</p>
                </div>
              </div>

              {/* Today's operation breakdown */}
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {todayOps.story_generation || 0} stories</span>
                <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {todayOps.image_generation || 0} images</span>
                <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> {todayOps.audio_generation || 0} audio</span>
              </div>

              {/* Today's model breakdown */}
              {costSummary?.modelBreakdown && Object.keys(costSummary.modelBreakdown).length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-sm font-medium">By Model:</p>
                  {Object.entries(costSummary.modelBreakdown).map(([model, data]) => {
                    const d = data as { requests: number; cost: number };
                    return (
                      <div key={model} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{model}</Badge>
                          <span className="text-muted-foreground">{d.requests} calls</span>
                        </div>
                        <span className="font-medium">${d.cost.toFixed(4)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Internal / system traffic (excluded from totals above) */}
              {(costSummary?.internalRequests > 0 || totalCostSummary?.internalRequests > 0) && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">🔧 Internal / System Traffic (excluded from totals)</p>
                  <div className="grid gap-2 md:grid-cols-2 text-xs text-muted-foreground">
                    {costSummary?.internalRequests > 0 && (
                      <div className="flex justify-between bg-muted/30 rounded p-2">
                        <span>Today internal:</span>
                        <span>{costSummary.internalRequests} calls · ${costSummary.internalCost?.toFixed(4)}</span>
                      </div>
                    )}
                    {totalCostSummary?.internalRequests > 0 && (
                      <div className="flex justify-between bg-muted/30 rounded p-2">
                        <span>All-time internal:</span>
                        <span>{totalCostSummary.internalRequests} calls · ${totalCostSummary.internalCost?.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    Includes health checks, test sessions, system probes, and validator calls.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ═══════════════════ CHANGELOG ═══════════════════ */}
          <Card className="border border-dashed border-muted-foreground/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Optimization Changelog
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p><strong>Apr 10, 2026</strong> — ElevenLabs Flash v2.5 deployed (TTS cost ↓ ~57%). Persistent audio cache enabled (repeat reads = $0). Audio validator switched to dry-run (no billable calls on page load). Internal/system traffic now excluded from dashboard totals and shown separately. Dynamic session IDs for all edge functions.</p>
              <p><strong>Pre-Apr 10</strong> — ElevenLabs Turbo v1 ($0.0042/req). No persistent cache. Audio validator made real API calls on every page load.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator">
          <ScenarioSimulator costPerUnit={costPerUnit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
