/**
 * SpendSummary — real money spent, straight from `cost_tracking` via the
 * admin-gated `get-cost-analytics` edge function. No estimates here: every
 * number on this card is a sum of logged rows.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { CostAnalyticsState } from '@/hooks/useCostAnalytics';

const money = (n: number | undefined, dp = 4) => `$${Number(n || 0).toFixed(dp)}`;

const PROVIDERS: Array<{ key: string; label: string }> = [
  { key: 'openai', label: 'OpenAI (story text)' },
  { key: 'runware', label: 'Runware (images)' },
  { key: 'elevenlabs', label: 'ElevenLabs (narration)' },
  { key: 'resend', label: 'Resend (email)' },
];

export const SpendSummary: React.FC<{ analytics: CostAnalyticsState }> = ({ analytics }) => {
  const { costSummary, totalCostSummary, isLoading, forbidden, error, refresh, lastUpdated } = analytics;

  if (forbidden) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Admin access required</AlertTitle>
        <AlertDescription>
          Spend data is restricted to accounts listed in the <code>ADMIN_USER_IDS</code> secret.
          Sign in with an admin account to see cost figures.
        </AlertDescription>
      </Alert>
    );
  }

  const monthCost = costSummary?.monthCost ?? 0;
  const monthBudget = costSummary?.monthBudget ?? 100;
  const monthPct = monthBudget > 0 ? (monthCost / monthBudget) * 100 : 0;
  const allTime = totalCostSummary;
  const ops = allTime?.operationBreakdown || {};

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Money spent so far
            </CardTitle>
            <CardDescription>
              Summed from the <code>cost_tracking</code> table. Internal/system traffic is
              excluded from these totals and shown separately below.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && !forbidden && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{money(costSummary?.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Today ({costSummary?.date || '—'}) · {costSummary?.totalRequests ?? 0} calls
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{money(monthCost, 2)}</div>
            <p className="text-xs text-muted-foreground">This month of {money(monthBudget, 0)} budget</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{money(allTime?.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              All time · {(allTime?.totalRequests ?? 0).toLocaleString()} calls
            </p>
          </div>
        </div>

        <div>
          <Progress value={Math.min(monthPct, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {monthPct >= 90
              ? `⚠️ ${monthPct.toFixed(1)}% of the monthly budget used`
              : `${money(monthBudget - monthCost, 2)} remaining (${(100 - monthPct).toFixed(1)}%)`}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">All-time spend by provider</p>
          <div className="grid gap-2 md:grid-cols-4">
            {PROVIDERS.map(({ key, label }) => {
              const bucket = allTime?.providerBreakdown?.[key];
              return (
                <div key={key} className="p-3 rounded-lg bg-muted/30 text-center">
                  <div className="font-semibold">{money(bucket?.cost)}</div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{bucket?.requests ?? 0} calls</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">All-time units generated</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ops.story_generation ?? 0} story pages</Badge>
            <Badge variant="secondary">{ops.image_generation ?? 0} images</Badge>
            <Badge variant="secondary">{ops.audio_generation ?? 0} narrations</Badge>
            <Badge variant="outline">
              avg {money(allTime?.averageCostPerRequest, 6)} / API call
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
          <div>
            Internal / system traffic (self-tests, monitors) excluded above:{' '}
            <span className="font-medium">{money(allTime?.internalCost)}</span> across{' '}
            {allTime?.internalRequests ?? 0} calls.
          </div>
          {lastUpdated && <div>Last refreshed {new Date(lastUpdated).toLocaleString()}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendSummary;