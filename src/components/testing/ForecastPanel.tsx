/**
 * ForecastPanel — future spend, driven by MEASURED per-unit costs.
 *
 * Unit costs come from `cost_tracking` (all-time provider cost ÷ all-time units
 * for that operation). When an operation has no logged rows yet, a documented
 * default is used and labelled "assumed" so nobody mistakes it for real data.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ScenarioSimulator } from '@/components/ScenarioSimulator';
import type { CostAnalyticsState, UnitCost } from '@/hooks/useCostAnalytics';

const UNIT_ROWS: Array<{ key: 'story' | 'image' | 'audio'; label: string; note: string }> = [
  { key: 'story', label: 'Story page (OpenAI)', note: 'one generated page of text' },
  { key: 'image', label: 'Illustration (Runware)', note: 'one 1024×1024 page image' },
  { key: 'audio', label: 'Narration (ElevenLabs)', note: 'one uncached TTS request' },
];

const unitBadge = (u: UnitCost) =>
  u.measured ? (
    <Badge variant="default">measured · {u.samples.toLocaleString()} rows</Badge>
  ) : (
    <Badge variant="secondary">assumed default</Badge>
  );

export const ForecastPanel: React.FC<{ analytics: CostAnalyticsState }> = ({ analytics }) => {
  const { costPerUnit } = analytics;

  // Product shapes: guest = 6-page capped story; premium = open-ended session.
  const guestStory = 6 * (costPerUnit.story.value + costPerUnit.image.value + costPerUnit.audio.value);
  const premiumPage = costPerUnit.story.value + costPerUnit.image.value + costPerUnit.audio.value;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost per unit</CardTitle>
          <CardDescription>
            These are the numbers every projection below is built from.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {UNIT_ROWS.map(({ key, label, note }) => {
            const u = costPerUnit[key];
            return (
              <div key={key} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{note}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">${u.value.toFixed(6)}</span>
                  {unitBadge(u)}
                </div>
              </div>
            );
          })}

          <div className="grid gap-3 md:grid-cols-2 pt-2">
            <div className="p-3 rounded-lg bg-muted/40">
              <div className="text-xl font-bold">${guestStory.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                One full guest story (6 pages, image + narration per page, no cache)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <div className="text-xl font-bold">${premiumPage.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                One premium page (live generation — premium stories are open-ended, so cost scales
                with pages read)
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Narration cost is per uncached request. The persistent audio cache means repeat reads
              of the same page cost $0 in API fees — the simulator below applies a scale-dependent
              cache hit rate.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <ScenarioSimulator
        costPerUnit={{
          story: costPerUnit.story.value,
          image: costPerUnit.image.value,
          audio: costPerUnit.audio.value,
        }}
      />
    </div>
  );
};

export default ForecastPanel;