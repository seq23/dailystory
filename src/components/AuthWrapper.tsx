import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedApp } from "@/components/AuthenticatedApp";
import { GuestExperience } from "@/components/GuestExperience";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import SubscriptionManager from "@/services/subscriptionManager";
import { SubscriptionGate } from "@/components/SubscriptionGate";

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [premiumSafetyTick, setPremiumSafetyTick] = useState(0);

  // Expose premium status globally for voice features and events
  useEffect(() => {
    (window as any).__IS_PREMIUM = isPremium === true;
  }, [isPremium]);

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