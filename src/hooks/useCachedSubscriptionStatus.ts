/**
 * CACHED SUBSCRIPTION STATUS HOOK
 * 5-minute cache prevents repeated DB hits
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeanCache } from '@/utils/LeanCache';
import { LeanErrorService } from '@/utils/LeanErrorService';
import { SUBSCRIPTION_CHANGED_EVENT } from '@/lib/accessCode';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isPremium: boolean;
  subscriptionEnd?: string;
  /** When Premium ends: the code/override end date, else the paid period end. */
  premiumUntil?: string | null;
  loading: boolean;
  error?: string;
}

export function useCachedSubscriptionStatus(userId?: string) {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isPremium: false,
    loading: true
  });
  // A redeemed code or a finished checkout fires SUBSCRIPTION_CHANGED_EVENT: re-read at once.
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const onChange = () => {
      LeanCache.clear();
      setReloadKey((k) => k + 1);
    };
    window.addEventListener(SUBSCRIPTION_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(SUBSCRIPTION_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!userId) {
      setStatus({ isSubscribed: false, isPremium: false, loading: false });
      return;
    }

    let retryTimeouts: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;
    const RETRY_DELAYS = [3000, 7000, 12000, 20000, 30000]; // 3s, 7s, 12s, 20s, 30s - covers very slow connections

    const fetchStatus = async (attempt = 0) => {
      if (cancelled) return;
      
      try {
        const cacheKey = `subscription_${userId}`;
        
        // On retries, clear stale cache first
        if (attempt > 0) {
          LeanCache.clear();
        }
        
        // Use deduplicated cache to prevent multiple simultaneous requests
        const result = await LeanCache.dedupe(cacheKey, async () => {
          const now = new Date();
          const { data, error } = await supabase
            .from('subscribers')
            .select('subscribed, subscription_end, override_premium, override_end, subscription_tier')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          // A paid period that has ended is not Premium (an expired code mirrored by
          // sync-subscription-status left subscribed=true with a past end date).
          const isSubscribed = !!data?.subscribed &&
            (!data?.subscription_end || new Date(data.subscription_end) > now);
          const overrideActive = !!data?.override_premium &&
            (!data?.override_end || new Date(data.override_end) > now);
          const isPremium = isSubscribed || overrideActive;

          return {
            isSubscribed,
            isPremium,
            subscriptionEnd: data?.subscription_end,
            premiumUntil: overrideActive ? (data?.override_end ?? null) : (isSubscribed ? data?.subscription_end ?? null : null),
            subscriptionTier: data?.subscription_tier
          };
        });

        if (cancelled) return;

        setStatus({
          ...result,
          loading: false
        });

        // If not premium and we have retries left, schedule next retry
        if (!result.isPremium && attempt < RETRY_DELAYS.length) {
          const timeout = setTimeout(() => {
            fetchStatus(attempt + 1);
          }, RETRY_DELAYS[attempt]);
          retryTimeouts.push(timeout);
        }
      } catch (error: any) {
        if (cancelled) return;
        LeanErrorService.logError(error, 'useCachedSubscriptionStatus');
        setStatus({
          isSubscribed: false,
          isPremium: false,
          loading: false,
          error: 'Failed to load subscription status'
        });
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
      retryTimeouts.forEach(clearTimeout);
    };
  }, [userId, reloadKey]);

  return status;
}