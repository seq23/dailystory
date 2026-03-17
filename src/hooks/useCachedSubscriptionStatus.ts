/**
 * CACHED SUBSCRIPTION STATUS HOOK
 * 5-minute cache prevents repeated DB hits
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeanCache } from '@/utils/LeanCache';
import { LeanErrorService } from '@/utils/LeanErrorService';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isPremium: boolean;
  subscriptionEnd?: string;
  loading: boolean;
  error?: string;
}

export function useCachedSubscriptionStatus(userId?: string) {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isPremium: false,
    loading: true
  });

  useEffect(() => {
    if (!userId) {
      setStatus({ isSubscribed: false, isPremium: false, loading: false });
      return;
    }

    let retryTimeouts: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;
    const RETRY_DELAYS = [3000, 6000, 10000]; // 3s, 6s, 10s - covers slow connections

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
          const { data, error } = await supabase
            .from('subscribers')
            .select('subscribed, subscription_end, override_premium, override_end, subscription_tier')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          const now = new Date();
          const isSubscribed = data?.subscribed || false;
          const isPremium = isSubscribed || 
            (data?.override_premium && 
             (!data?.override_end || new Date(data.override_end) > now));

          return {
            isSubscribed,
            isPremium,
            subscriptionEnd: data?.subscription_end,
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
  }, [userId]);

  return status;
}