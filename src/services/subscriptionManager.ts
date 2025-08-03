// Subscription Management Service
import { supabase } from '@/integrations/supabase/client';

export class SubscriptionManager {
  /**
   * Check if current user has premium subscription
   */
  static async isPremiumUser(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return false; // Not authenticated = not premium
      }

      // Check subscription status in database
      const { data: subscription, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('No subscription found, user is free tier');
        return false;
      }

      // Check if subscription is active and not expired
      const isActive = subscription.subscribed;
      const isNotExpired = !subscription.subscription_end || 
                          new Date(subscription.subscription_end) > new Date();

      return isActive && isNotExpired;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false; // Default to free tier on error
    }
  }

  /**
   * Get subscription info for current user
   */
  static async getSubscriptionInfo(): Promise<{
    isPremium: boolean;
    tier?: string;
    expiresAt?: Date;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { isPremium: false };
      }

      const { data: subscription, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { isPremium: false };
      }

      const isPremium = subscription.subscribed && 
                       (!subscription.subscription_end || 
                        new Date(subscription.subscription_end) > new Date());

      return {
        isPremium,
        tier: subscription.subscription_tier,
        expiresAt: subscription.subscription_end ? new Date(subscription.subscription_end) : undefined
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return { isPremium: false };
    }
  }
}

export default SubscriptionManager;