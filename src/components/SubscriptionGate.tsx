import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const SubscriptionGate = () => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: "monthly" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      console.error("Upgrade error", e);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutToGuest = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.assign("/");
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background">
      <section className="max-w-xl w-full p-8 space-y-6 rounded-lg border bg-card text-card-foreground shadow">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Premium required</h1>
          <p className="text-muted-foreground">
            Your account is signed in, but no active subscription was found. Upgrade to
            continue, or sign out to use the Guest experience.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleUpgrade} disabled={loading} size="lg">
            Upgrade now
          </Button>
          <Button variant="secondary" onClick={handleSignOutToGuest} disabled={loading} size="lg">
            Sign out and continue as Guest
          </Button>
        </div>

        <aside className="text-center text-xs text-muted-foreground">
          You can manage or cancel anytime in the Stripe customer portal after subscribing.
        </aside>
      </section>
    </main>
  );
};

export default SubscriptionGate;
