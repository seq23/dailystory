import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pause, Play, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface AccountRestrictionProps {
  accountStatus: string;
  onStatusChange: (status: string) => void;
}

export function AccountRestriction({ accountStatus, onStatusChange }: AccountRestrictionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isRestricted = accountStatus === 'restricted';

  const handleToggleRestriction = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newStatus = isRestricted ? 'active' : 'restricted';

      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: newStatus,
          account_restricted_at: isRestricted ? null : new Date().toISOString(),
          account_restriction_reason: isRestricted ? null : 'User requested processing restriction (GDPR Art. 18)',
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Log consent change
      await supabase.from('consent_records').insert({
        user_id: user.id,
        consent_type: isRestricted ? 'processing_unrestricted' : 'processing_restricted',
        consent_given: !isRestricted,
        consent_text: isRestricted
          ? 'User lifted processing restriction'
          : 'User requested restriction of processing under GDPR Article 18',
      });

      onStatusChange(newStatus);
      toast.success(isRestricted
        ? "Account reactivated — all features are available again."
        : "Account restricted — data processing has been paused."
      );
    } catch (err: any) {
      toast.error("Failed to update account status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={isRestricted ? "border-amber-500/50 bg-amber-500/5" : "border-muted/40"}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${isRestricted ? 'text-amber-500' : 'text-muted-foreground'}`} />
          <CardTitle className="text-base">Right to Restrict Processing</CardTitle>
        </div>
        <CardDescription>
          {isRestricted
            ? "Your account is currently frozen. Your data is preserved but not actively processed."
            : "Under GDPR Article 18, you can temporarily freeze your account without deleting it."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRestricted && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm text-amber-700 dark:text-amber-300">
            <strong>Account Restricted:</strong> Story generation, quizzes, and analytics are paused.
            Your data is safely preserved and can be reactivated anytime.
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={isRestricted ? "default" : "outline"}
              disabled={isProcessing}
            >
              {isRestricted ? (
                <><Play className="w-4 h-4 mr-2" /> Unfreeze Account</>
              ) : (
                <><Pause className="w-4 h-4 mr-2" /> Freeze My Account</>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isRestricted ? "Reactivate Your Account?" : "Freeze Your Account?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRestricted
                  ? "This will reactivate all features including story generation, quizzes, and analytics tracking."
                  : "This will pause all data processing. You won't be able to generate stories, take quizzes, or use analytics. Your data will be safely preserved and you can unfreeze anytime."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleRestriction} disabled={isProcessing}>
                {isProcessing ? "Processing..." : isRestricted ? "Reactivate" : "Freeze Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
