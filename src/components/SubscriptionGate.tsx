import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EnhancedSubscriptionManager } from "@/services/enhancedSubscriptionManager";
import { useToast } from "@/hooks/use-toast";
import { DiscountDebugPanel } from "@/components/DiscountDebugPanel";

export const SubscriptionGate = () => {
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();

  // Show debug panel in development or if URL contains debug=true
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = import.meta.env.DEV;
    const hasDebugParam = urlParams.get('debug') === 'true';
    setShowDebug(isDev || hasDebugParam);
  }, []);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      // Try to activate discount code first (in case user has SEQUOIA90)
      try {
        const { data: discountData } = await supabase.functions.invoke("activate-discount-code", {
          body: { discountCode: "SEQUOIA90" },
        });
        
        if (discountData?.success && discountData?.activated) {
          toast({
            title: "Discount Code Activated!",
            description: discountData.message,
            duration: 5000,
          });
          
          // Refresh the page after a short delay to let the user see the success message
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }
      } catch (discountError) {
        console.log("No discount code to activate, proceeding with regular checkout");
      }

      // If no discount code, proceed with regular checkout
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: "monthly" },
      });
      
      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e) {
      console.error("Upgrade error", e);
      const errorMessage = e instanceof Error ? e.message : "Unable to start checkout. Please try again.";
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutToGuest = async () => {
    try {
      setLoading(true);
      
      // Clear all caches and session data to prevent persistent errors
      EnhancedSubscriptionManager.clearCache();
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any existing toasts or error states (if available)
      if ((window as any).__clearAllToasts) {
        (window as any).__clearAllToasts();
      }
      
      await supabase.auth.signOut();
      window.location.assign("/");
    } catch (e) {
      console.error("Sign out error", e);
      toast({
        title: "Sign Out Error", 
        description: "Failed to sign out. Please try refreshing the page.",
        variant: "destructive"
      });
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

        {showDebug && (
          <div className="mt-6">
            <DiscountDebugPanel />
          </div>
        )}
      </section>
    </main>
  );
};

export default SubscriptionGate;
