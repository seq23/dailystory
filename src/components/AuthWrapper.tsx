import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from '@/services/DebugLogger';
import { AuthenticatedApp } from "@/components/AuthenticatedApp";
import { GuestExperience } from "@/components/GuestExperience";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import { EnhancedSubscriptionManager } from "@/services/enhancedSubscriptionManager";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useLocation } from "react-router-dom";
import { activateSequoiaDiscount } from "@/utils/discountActivation";
import { ManagedTimers } from '@/utils/TimerManager';

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [premiumSafetyTick, setPremiumSafetyTick] = useState(0);
  const location = useLocation();

  // Expose premium status globally for voice features and events
  useEffect(() => {
    (window as any).__IS_PREMIUM = isPremium === true;
  }, [isPremium]);

  // Clean up orphaned story URL parameters on app initialization
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has('session') && urlParams.get('session') === 'story') {
      // Check if there's actually an active story session
      const hasActiveSession = Boolean(
        localStorage.getItem('story-session-data') || 
        sessionStorage.getItem('last_story_text')
      );
      
      if (!hasActiveSession) {
        DebugLogger.log('auth', 'Clearing orphaned story URL parameters');
        window.history.replaceState(null, '', '/');
      }
    }
  }, [location.search]);

  useEffect(() => {
    // 1) Listen for auth changes FIRST (sync-only updates inside handler)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Clear caches when auth state changes
      EnhancedSubscriptionManager.clearCache();
      
      // Defer async work to avoid deadlocks
      if (session?.user) {
        ManagedTimers.setTimeout(() => {
          checkSubscription();
        }, 0, 'AuthWrapper');
      } else {
        setIsPremium(null);
        // Clear all caches and session data when signing out
        localStorage.removeItem('story-session-data');
        sessionStorage.clear();
      }
    });

    // 2) Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSubscription = async () => {
    try {
      // Always fetch the freshest session to avoid stale state
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsPremium(false);
        return;
      }

      // Check for pending discount codes first
      await checkAndActivateDiscountCode();

      // Prefer calling the edge function to ensure Stripe truth, fallback to DB check
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data && typeof data.subscribed === "boolean") {
        setIsPremium(!!data.subscribed);
        return;
      }
    } catch (_) {
      // ignore and fallback
    }
    try {
      const premium = await EnhancedSubscriptionManager.isPremiumUser();
      setIsPremium(premium);
    } catch (e) {
      setIsPremium(false);
    }
  };

  const checkAndActivateDiscountCode = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Check if user has pending discount code OR try to activate SEQUOIA90 directly
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('discount_code_pending, discount_activated, override_premium')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // If user doesn't have discount activated, try to activate SEQUOIA90
      if (!subscriber?.discount_activated && !subscriber?.override_premium) {
        DebugLogger.log('auth', 'Attempting to activate SEQUOIA90 discount code for user');
        const result = await activateSequoiaDiscount();
        
        if (result.success && result.activated) {
          DebugLogger.log('auth', 'SEQUOIA90 discount activated:', result.message);
          // Force refresh subscription status
          await EnhancedSubscriptionManager.forceRefresh();
          return;
        }
      }

      if (subscriber?.discount_code_pending && !subscriber.discount_activated) {
        DebugLogger.log('auth', 'Found pending discount code, activating');
        
        const { data, error } = await supabase.functions.invoke('activate-discount-code');
        
        if (!error && data?.activated) {
          DebugLogger.log('auth', 'Discount code activated:', data.message);
          // Show success toast
          ManagedTimers.setTimeout(() => {
            (window as any).__showDiscountActivationToast?.(data.message);
          }, 1000, 'AuthWrapper');
        }
      }
    } catch (error) {
      DebugLogger.error('auth', 'Error checking discount code', error);
    }
  };

  if (loading) {
    return <AdaptiveEnhancedLoading isPremium={false} />;
  }

  // Logged out = Guest (free trial)
  if (!user) {
    return <GuestExperience />;
  }

  // Logged in but still checking subscription
  if (isPremium === null) {
    return <AdaptiveEnhancedLoading isPremium={false} />;
  }

  // Logged in and NOT premium -> show gate
  if (isPremium === false) {
    return <SubscriptionGate />;
  }

  // Logged in and premium (verified or unverified)
  // Allow immediate access for premium users regardless of email verification status
  return <AuthenticatedApp user={user} />;
};