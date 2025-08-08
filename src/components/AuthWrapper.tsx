import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedApp } from "@/components/AuthenticatedApp";
import { GuestExperience } from "@/components/GuestExperience";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <AdaptiveEnhancedLoading isPremium={false} />;
  }

  if (!user) {
    return <GuestExperience />;
  }

  return <AuthenticatedApp user={user} />;
};