import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from '@/services/DebugLogger';
import { AuthenticatedApp } from "@/components/AuthenticatedApp";
import { GuestExperience } from "@/components/GuestExperience";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import { EnhancedSubscriptionManager } from "@/services/enhancedSubscriptionManager";
import { useLocation } from "react-router-dom";
import { ManagedTimers } from '@/utils/TimerManager';

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Expose premium status globally: ALL authenticated users are premium
  useEffect(() => {
    window.__IS_PREMIUM = !!user;
  }, [user]);

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Clear caches when auth state changes
      EnhancedSubscriptionManager.clearCache();
      
      // Clear all caches and session data when signing out
      if (!session?.user) {
        localStorage.removeItem('story-session-data');
        sessionStorage.clear();
      }
      
      // Trigger background subscription sync on sign-in (non-blocking)
      if (event === 'SIGNED_IN' && session?.user) {
        supabase.functions.invoke('sync-subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).catch(() => {
          // Silent failure - cached subscription status will be used
          DebugLogger.log('auth', 'Background subscription sync skipped (offline/unavailable)');
        });
      }
    });

    // 2) Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <AdaptiveEnhancedLoading isPremium={false} reason="auth" />;
  }

  // Logged out = Guest (free trial)
  if (!user) {
    return <GuestExperience />;
  }

  // ALL authenticated users are premium - no gating
  return <AuthenticatedApp user={user} />;
};