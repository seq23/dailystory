/**
 * SystemHealthPanel — pings each live service using its ACTUAL contract.
 *
 * Rules for anything added here:
 *  - call the same endpoint + payload production calls,
 *  - judge pass/fail from the real response shape,
 *  - state plainly whether the check costs money.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { Cable, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type Status = 'pass' | 'fail' | 'warn';

interface Check {
  name: string;
  contract: string;
  billable: boolean;
  status: Status;
  message: string;
  ms: number;
  details?: unknown;
}

const icon = (s: Status) =>
  s === 'pass' ? <CheckCircle2 className="h-4 w-4 text-green-600" />
  : s === 'warn' ? <AlertCircle className="h-4 w-4 text-yellow-600" />
  : <XCircle className="h-4 w-4 text-destructive" />;

export const SystemHealthPanel: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);
  const [includeBillable, setIncludeBillable] = useState(false);

  const push = (c: Check) => setChecks((prev) => [...prev, c]);

  const timed = async <T,>(fn: () => Promise<T>): Promise<[T | null, number, string | null]> => {
    const t0 = Date.now();
    try {
      const value = await fn();
      return [value, Date.now() - t0, null];
    } catch (err: any) {
      return [null, Date.now() - t0, err?.message || 'request failed'];
    }
  };

  const runAll = async () => {
    setRunning(true);
    setChecks([]);

    // 1. Image service health (GET branch — no generation, no cost)
    {
      const [data, ms, err] = await timed(async () => {
        const res = await supabase.functions.invoke('runware-generate-image', { method: 'GET' });
        if (res.error) throw res.error;
        return res.data;
      });
      const keysOk = !!data?.hasRunwareApiKey;
      push({
        name: 'Image service (runware-generate-image)',
        contract: 'GET → { status, model, hasRunwareApiKey, hasLovableApiKey, hasServiceRoleKey }',
        billable: false,
        status: err ? 'fail' : keysOk ? 'pass' : 'warn',
        message: err
          ? err
          : `${data?.status} · model ${data?.model} · Runware key ${data?.hasRunwareApiKey ? '✓' : '✗'} · Lovable AI key ${data?.hasLovableApiKey ? '✓' : '✗'} · service role ${data?.hasServiceRoleKey ? '✓' : '✗'}`,
        ms,
        details: data,
      });
    }

    // 2. Template service (Tier 2 story fallback) — free, no external API
    {
      const [data, ms, err] = await timed(async () => {
        const res = await supabase.functions.invoke('template-service', {
          body: {
            difficulty: 'beginner',
            userInfo: { name: 'HealthCheck', age: 6, nativeLanguage: 'en', avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' } },
            pageCount: 6,
            templateIndex: 0,
          },
        });
        if (res.error) throw res.error;
        return res.data;
      });
      const pages = Array.isArray(data?.pages) ? data.pages.length : 0;
      push({
        name: 'Template service (story fallback tier)',
        contract: 'POST { difficulty, userInfo, pageCount, templateIndex } → { pages[] }',
        billable: false,
        status: err ? 'fail' : pages >= 6 ? 'pass' : 'warn',
        message: err ? err : `${pages} pages returned`,
        ms,
      });
    }

    // 3. Cost analytics (admin-gated)
    {
      const [data, ms, err] = await timed(async () => {
        const res = await supabase.functions.invoke('get-cost-analytics');
        if (res.error) throw res.error;
        return res.data;
      });
      push({
        name: 'Cost analytics (get-cost-analytics)',
        contract: 'POST (admin only) → { costSummary, totalCostSummary }',
        billable: false,
        status: err ? 'fail' : data?.success ? 'pass' : 'warn',
        message: err
          ? `${err} — this endpoint requires an admin account (ADMIN_USER_IDS)`
          : `all-time $${Number(data?.data?.totalCostSummary?.totalCost || 0).toFixed(4)} across ${data?.data?.totalCostSummary?.totalRequests || 0} calls`,
        ms,
      });
    }

    if (includeBillable) {
      // 4. Narration — real ElevenLabs call, costs money
      {
        const [data, ms, err] = await timed(async () => {
          const res = await supabase.functions.invoke('elevenlabs-tts', {
            body: { text: 'Health check.', language: 'en' },
          });
          if (res.error) throw res.error;
          return res.data;
        });
        const hasAudio = !!(data?.audioContent || data?.audio || data?.audioUrl);
        push({
          name: 'Narration (elevenlabs-tts)',
          contract: 'POST { text, language } → audio payload with language-resolved voice',
          billable: true,
          status: err ? 'fail' : hasAudio ? 'pass' : 'warn',
          message: err ? err : hasAudio ? `audio returned (voice ${data?.voiceId || data?.voice || 'default'})` : 'no audio field in response',
          ms,
        });
      }

      // 5. Image generation — real Runware call, costs ~$0.0013
      {
        const sessionId = generateSessionIdWithPrefix('health-check');
        const [data, ms, err] = await timed(async () => {
          const res = await supabase.functions.invoke('runware-generate-image', {
            body: {
              pageText: 'A small child waves from a sunny garden path.',
              sessionId,
              pageNumber: 1,
              userInfo: { name: 'HealthCheck', age: 6, nativeLanguage: 'en', avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' } },
            },
          });
          if (res.error) throw res.error;
          return res.data;
        });
        push({
          name: 'Image generation (live Runware call)',
          contract: 'POST { pageText, sessionId, pageNumber, userInfo } → { imageURL, scene, seed }',
          billable: true,
          status: err ? 'fail' : data?.success ? 'pass' : 'fail',
          message: err ? err : data?.success ? `image returned (${data.sceneSource} scene, seed ${data.seed})` : data?.error || 'no image',
          ms,
        });
      }
    }

    setRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cable className="h-5 w-5 text-primary" />
          System health
        </CardTitle>
        <CardDescription>
          Every check below calls a live service with the same contract production uses. Free checks
          run by default; billable checks (real Runware image + real ElevenLabs narration) are opt-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={runAll} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Cable className="h-4 w-4 mr-2" />}
            Run health checks
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeBillable}
              onChange={(e) => setIncludeBillable(e.target.checked)}
            />
            Include billable checks (~$0.003 per run)
          </label>
        </div>

        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {icon(c.status)}
                <span className="font-medium text-sm">{c.name}</span>
                <Badge variant="outline">{c.ms} ms</Badge>
                {c.billable && <Badge variant="secondary">billable</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{c.message}</p>
              <p className="text-xs text-muted-foreground font-mono">{c.contract}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthPanel;