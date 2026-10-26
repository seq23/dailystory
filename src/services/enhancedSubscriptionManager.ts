// Enhanced Subscription Manager with caching and reliability improvements
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

interface SubscriptionCache {
  isPremium: boolean;
  tier?: string;
  expiresAt?: Date;
  timestamp: number;
}

export class EnhancedSubscriptionManager {
  private static cache: SubscriptionCache | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly CACHE_JITTER = 0.1; // ±10% jitter to prevent cache stampede
  private static inflight: Promise<boolean> | null = null;

  /**
   * Check if current user has premium subscription with caching
   */
  static async isPremiumUser(): Promise<boolean> {
    // Return cached result if still valid (with jittered expiry)
    if (this.cache) {
      const jitter = this.CACHE_DURATION * this.CACHE_JITTER * (Math.random() - 0.5);
      const effectiveDuration = this.CACHE_DURATION + jitter;
      if (Date.now() - this.cache.timestamp < effectiveDuration) {
        return this.cache.isPremium;
      }
    }

    // A second caller while a check is running shares that check. Before, it waited
    // 100 ms and got `false`, so a Premium parent's dashboard said "Premium feature —
    // upgrade to enable" and locked the word list.
    if (this.inflight) return this.inflight;
    this.inflight = this.check().finally(() => { this.inflight = null; });
    return this.inflight;
  }

  private static async check(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        this.updateCache(false);
        return false;
      }

      // Check subscription status with strict timeout (local-first, no external network deps)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Subscription check timeout')), 4000)
      );

      const subscriptionPromise = supabase
        .from('subscribers')
        .select('subscribed, subscription_end, subscription_tier, override_premium, override_end')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: subscription, error } = await Promise.race([
        subscriptionPromise,
        timeoutPromise
      ]) as any;

      // A failed read is not an answer: never cache it as "free".
      if (error) {
        DebugLogger.warn('auth', 'Subscription read failed; not caching', { error });
        return this.cache?.isPremium ?? false;
      }
      if (!subscription) {
        this.updateCache(false);
        return false;
      }

      // Check if subscription is active and not expired OR if override premium is active
      const isSubscribed = subscription.subscribed;
      const isNotExpired = !subscription.subscription_end ||
                           new Date(subscription.subscription_end) > new Date();

      const hasOverridePremium = subscription.override_premium;
      const overrideNotExpired = !subscription.override_end ||
                                new Date(subscription.override_end) > new Date();

      const isPremium = !!((isSubscribed && isNotExpired) || (hasOverridePremium && overrideNotExpired));

      this.updateCache(
        isPremium,
        subscription.subscription_tier,
        subscription.subscription_end ? new Date(subscription.subscription_end) : undefined
      );

      return isPremium;
    } catch (error) {
      DebugLogger.error('auth', 'Error checking premium status', { error });
      // Return cached result on error if available; a timeout is not cached as "free".
      return this.cache?.isPremium ?? false;
    }
  }

  /**
   * Get subscription info for current user with caching
   */
  static async getSubscriptionInfo(): Promise<{
    isPremium: boolean;
    tier?: string;
    expiresAt?: Date;
  }> {
    const isPremium = await this.isPremiumUser();
    
    return {
      isPremium,
      tier: this.cache?.tier,
      expiresAt: this.cache?.expiresAt
    };
  }

  /**
   * Force refresh subscription status
   */
  static async forceRefresh(): Promise<boolean> {
    this.cache = null;
    return await this.isPremiumUser();
  }

  /**
   * Clear subscription cache
   */
  static clearCache(): void {
    this.cache = null;
  }

  private static updateCache(
    isPremium: boolean, 
    tier?: string, 
    expiresAt?: Date
  ): void {
    this.cache = {
      isPremium,
      tier,
      expiresAt,
      timestamp: Date.now()
    };
  }
}

// Export as default and named for compatibility
export default EnhancedSubscriptionManager;
export { EnhancedSubscriptionManager as SubscriptionManager };

// A redeemed code or a finished checkout changes the plan at once: drop the cached answer.
if (typeof window !== 'undefined') {
  window.addEventListener('subscription-changed', () => EnhancedSubscriptionManager.clearCache());
}
