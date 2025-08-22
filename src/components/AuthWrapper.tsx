import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedApp } from "@/components/AuthenticatedApp";
import { GuestExperience } from "@/components/GuestExperience";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import SubscriptionManager from "@/services/subscriptionManager";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useLocation } from "react-router-dom";

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
        console.log('📍 AuthWrapper: Clearing orphaned story URL parameters');
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
      // Defer async work to avoid deadlocks
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      } else {
        setIsPremium(null);
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
      const premium = await SubscriptionManager.isPremiumUser();
      setIsPremium(premium);
    } catch (e) {
      setIsPremium(false);
    }
  };

  const checkAndActivateDiscountCode = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Check if user has pending discount code
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('discount_code_pending, discount_activated')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (subscriber?.discount_code_pending && !subscriber.discount_activated) {
        console.log('Found pending discount code, activating...');
        
        const { data, error } = await supabase.functions.invoke('apply-discount-code');
        
        if (!error && data?.activated) {
          console.log('Discount code activated:', data.message);
          // Show success toast
          setTimeout(() => {
            (window as any).__showDiscountActivationToast?.(data.message);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error checking discount code:', error);
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

  // Logged in and premium
  return <AuthenticatedApp user={user} />;
};