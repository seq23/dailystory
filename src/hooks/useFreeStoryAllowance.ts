import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FREE_STORY_LIMIT, PAYWALL_EVENT, freeStoriesUsed } from "@/lib/freeStoryAllowance";

/**
 * Free stories used by this account (server-recorded in app_metadata).
 * `exhausted` turns true when the count reaches the limit or the server
 * answers FREE_LIMIT_REACHED.
 */
export function useFreeStoryAllowance(userId: string) {
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverBlocked, setServerBlocked] = useState(false);

  const refresh = useCallback(async () => {
    try {
      // getUser() asks the auth server, so app_metadata is current (not the cached JWT).
      const { data } = await supabase.auth.getUser();
      setUsed(freeStoriesUsed(data.user));
    } catch {
      // Unknown count: the server still enforces the limit.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onLimit = () => {
      setServerBlocked(true);
      setUsed((u) => Math.max(u, FREE_STORY_LIMIT));
    };
    window.addEventListener(PAYWALL_EVENT, onLimit);
    return () => window.removeEventListener(PAYWALL_EVENT, onLimit);
  }, [userId, refresh]);

  return {
    used,
    limit: FREE_STORY_LIMIT,
    remaining: Math.max(0, FREE_STORY_LIMIT - used),
    exhausted: serverBlocked || used >= FREE_STORY_LIMIT,
    loading,
    refresh,
  };
}
