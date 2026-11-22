import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Access = "checking" | "signed_out" | "refused" | "ok";

/**
 * Shows its children only to the owner's admin account. The server decides: the
 * same ADMIN_USER_IDS check that guards /admin/voices (voice-overrides-admin, a
 * read-only "list"). Signed out, a failed session read, a refused or failed check:
 * all refused, never shown.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>("checking");
  useEffect(() => {
    let live = true;
    const set = (a: Access) => { if (live) setAccess(a); };
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) return set("signed_out");
        const check = await supabase.functions.invoke("voice-overrides-admin", { body: { action: "list" } });
        set(check.error ? "refused" : "ok");
      } catch {
        set("refused");
      }
    })();
    return () => { live = false; };
  }, []);

  if (access === "ok") return <>{children}</>;
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center" data-testid="admin-only" data-access={access}>
      {access === "checking" ? (
        <p className="text-muted-foreground">Checking access…</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold mb-2">{access === "signed_out" ? "Sign in required" : "Admin access required"}</h1>
          <p className="text-muted-foreground mb-4">This page is for the Time-2-Read team only.</p>
          {access === "signed_out" && <Link className="text-primary underline" to="/auth">Sign in</Link>}
        </>
      )}
    </main>
  );
}
