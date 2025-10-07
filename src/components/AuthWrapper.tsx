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
      
      // CIRCUIT BREAKER: Trigger background subscription sync on sign-in (non-blocking, with backoff)
      if (event === 'SIGNED_IN' && session?.user) {
        // Check dev feature flag
        const syncEnabled = localStorage.getItem('billing_sync_enabled') !== 'false';
        if (!syncEnabled) {
          DebugLogger.log('auth', 'Background subscription sync disabled by dev flag');
          return;
        }
        
        // Check circuit breaker backoff
        const backoffUntil = sessionStorage.getItem('billing_sync_backoff_until');
        if (backoffUntil && Date.now() < parseInt(backoffUntil)) {
          DebugLogger.log('auth', 'Background subscription sync skipped (circuit breaker backoff)');
          return;
        }
        
        // Attempt sync with timeout and circuit breaker
        const syncPromise = supabase.functions.invoke('sync-subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('sync timeout')), 2500)
        );
        
        Promise.race([syncPromise, timeoutPromise])
          .catch(() => {
            // Track failure and implement circuit breaker
            const failureCount = parseInt(sessionStorage.getItem('billing_sync_failures') || '0') + 1;
            sessionStorage.setItem('billing_sync_failures', String(failureCount));
            
            if (failureCount >= 2) {
              // Activate circuit breaker: 15-minute backoff
              const backoffUntil = Date.now() + (15 * 60 * 1000);
              sessionStorage.setItem('billing_sync_backoff_until', String(backoffUntil));
              DebugLogger.log('auth', `Circuit breaker activated: billing sync backoff until ${new Date(backoffUntil).toISOString()}`);
            }
            
            DebugLogger.log('auth', 'Background subscription sync skipped (offline/unavailable)');
          })
          .then(() => {
            // Reset failure count on success
            sessionStorage.removeItem('billing_sync_failures');
            sessionStorage.removeItem('billing_sync_backoff_until');
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