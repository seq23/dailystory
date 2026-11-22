import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * True only while a parent or child account is signed in. Starts false and stays
 * false when the session cannot be read, so anything gated on it (the microphone:
 * a child's voice needs a consenting account, risk rule R-KID-02) is hidden for
 * signed-out guests and during an auth outage. The server checks again:
 * voice-to-text refuses guests (supabase/functions/voice-to-text/index.ts).
 */
export function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let live = true;
    const set = (v: boolean) => { if (live) setSignedIn(v); };
    let unsubscribe: (() => void) | undefined;
    try {
      Promise.resolve(supabase.auth.getSession())
        .then(({ data, error }) => set(!error && !!data?.session?.user))
        .catch(() => set(false));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => set(!!session?.user));
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      set(false);
    }
    return () => { live = false; unsubscribe?.(); };
  }, []);
  return signedIn;
}
