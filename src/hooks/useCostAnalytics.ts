/**
 * useCostAnalytics — single shared reader for the `get-cost-analytics` edge
 * function (admin-gated; it reads the `cost_tracking` table with the service
 * role). Every money surface on /prompt-testing uses this one hook so the page
 * makes exactly one request instead of several competing ones.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderBucket {
  requests: number;
  cost: number;
}

export interface CostSummary {
  date: string;
  totalCost: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerRequest: number;
  modelBreakdown: Record<string, ProviderBucket>;
  providerBreakdown: Record<string, ProviderBucket>;
  operationBreakdown: Record<string, number>;
  storiesGenerated: number;
  monthCost: number;
  monthBudget: number;
  monthRemaining: number;
  isMonthlyBudgetExceeded: boolean;
  internalCost: number;
  internalRequests: number;
}

export interface TotalCostSummary {
  totalCost: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerRequest: number;
  providerBreakdown: Record<string, ProviderBucket>;
  operationBreakdown: Record<string, number>;
  totalStories: number;
  totalTokens: number;
  costPerStory: number;
  internalCost: number;
  internalRequests: number;
}

export interface UnitCost {
  value: number;
  /** true when derived from real cost_tracking rows, false when a documented default */
  measured: boolean;
  samples: number;
}

export interface CostPerUnit {
  story: UnitCost;
  image: UnitCost;
  audio: UnitCost;
}

/** Documented defaults used only when there is no measured data yet. */
const DEFAULT_UNIT_COSTS = {
  story: 0.0012, // GPT-4o-mini, ~1 page
  image: 0.0013, // Runware runware:100@1, 1024x1024
  audio: 0.0018, // ElevenLabs Flash v2.5, 1 request
};

function derive(
  cost: number | undefined,
  units: number | undefined,
  fallback: number,
): UnitCost {
  const c = Number(cost || 0);
  const n = Number(units || 0);
  if (n > 0 && c > 0) return { value: c / n, measured: true, samples: n };
  return { value: fallback, measured: false, samples: n };
}

export interface CostAnalyticsState {
  costSummary: CostSummary | null;
  totalCostSummary: TotalCostSummary | null;
  costPerUnit: CostPerUnit;
  isLoading: boolean;
  /** true when the signed-in user is not an admin (edge function returned 403) */
  forbidden: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export function useCostAnalytics(autoLoad = true): CostAnalyticsState {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [totalCostSummary, setTotalCostSummary] = useState<TotalCostSummary | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-cost-analytics');

      if (fnError) {
        // supabase-js surfaces non-2xx as FunctionsHttpError with a generic
        // message ("non-2xx status code"), so read the real status off context.
        const status = (fnError as any)?.context?.status as number | undefined;
        const message = fnError.message || 'Request failed';
        const isAuth =
          status === 401 || status === 403 || /401|403|forbidden|unauthor/i.test(message);
        setForbidden(isAuth);
        setError(
          isAuth
            ? 'Sign-in required — sign in to see cost data.'
            : `${message}${status ? ` (HTTP ${status})` : ''}`
        );
        setCostSummary(null);
        setTotalCostSummary(null);
        return;
      }

      if (!data?.success) {
        setError(data?.error || 'Cost analytics unavailable');
        return;
      }

      setCostSummary(data.data.costSummary ?? null);
      setTotalCostSummary(data.data.totalCostSummary ?? null);
      setLastUpdated(data.data.timestamp ?? new Date().toISOString());
    } catch (err: any) {
      setError(err?.message || 'Cost analytics request failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) void refresh();
  }, [autoLoad, refresh]);

  const ops = totalCostSummary?.operationBreakdown || {};
  const providers = totalCostSummary?.providerBreakdown || {};

  const costPerUnit: CostPerUnit = {
    story: derive(providers.openai?.cost, ops.story_generation, DEFAULT_UNIT_COSTS.story),
    image: derive(providers.runware?.cost, ops.image_generation, DEFAULT_UNIT_COSTS.image),
    audio: derive(providers.elevenlabs?.cost, ops.audio_generation, DEFAULT_UNIT_COSTS.audio),
  };

  return {
    costSummary,
    totalCostSummary,
    costPerUnit,
    isLoading,
    forbidden,
    error,
    refresh,
    lastUpdated,
  };
}