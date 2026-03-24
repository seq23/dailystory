import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function ConsentWithdrawal() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  const handleWithdrawConsent = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Record consent withdrawal
      await supabase.from('consent_records').insert({
        user_id: user.id,
        consent_type: 'data_processing_consent',
        consent_given: false,
        consent_text: 'User withdrew consent for non-essential data processing under GDPR Article 7(3)',
        withdrawn_at: new Date().toISOString(),
      });

      // Clear analytics/marketing cookies
      localStorage.removeItem('cookie-consent-status');
      localStorage.setItem('cookie-preferences', JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
      }));

      setWithdrawn(true);
      toast.success("Consent withdrawn. Non-essential data processing has been stopped.");
    } catch (err: any) {
      toast.error("Failed to withdraw consent. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-muted/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          {withdrawn ? (
            <ShieldOff className="w-5 h-5 text-amber-500" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          )}
          <CardTitle className="text-base">Consent Management</CardTitle>
        </div>
        <CardDescription>
          Under GDPR Article 7(3), you can withdraw consent for non-essential data processing at any time.
          This stops analytics and marketing data collection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {withdrawn && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm text-amber-700 dark:text-amber-300">
            Consent has been withdrawn. Only essential processing (authentication, core features) continues.
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isProcessing || withdrawn}>
              <ShieldOff className="w-4 h-4 mr-2" />
              {withdrawn ? "Consent Already Withdrawn" : "Withdraw Non-Essential Consent"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Withdraw Consent?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop all non-essential data processing including analytics and marketing cookies.
                Essential processing (login, core reading features) will continue.
                You can re-grant consent anytime via the cookie settings banner.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdrawConsent} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Withdraw Consent"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground">
          To update cookie preferences, use the cookie settings in the banner at the bottom of the page.
        </p>
      </CardContent>
    </Card>
  );
}
