import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  user: any;
  onDismiss?: () => void;
  accountCreatedAt?: string;
}

export const EmailVerificationBanner = ({ user, onDismiss, accountCreatedAt }: EmailVerificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [graceExpired, setGraceExpired] = useState(false);

  useEffect(() => {
    // Developer account exception
    if (user?.email === 'seq.taylor@gmail.com') {
      setIsVisible(false);
      return;
    }

    // Calculate days remaining in grace period
    if (user && !user.email_confirmed_at && accountCreatedAt) {
      const createdDate = new Date(accountCreatedAt);
      const gracePeriodEnd = new Date(createdDate.getTime() + (90 * 24 * 60 * 60 * 1000));
      const now = new Date();
      const timeRemaining = gracePeriodEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
      
      setDaysRemaining(Math.max(0, daysLeft));
      setGraceExpired(daysLeft <= 0);
      
      if (!isDismissed && (daysLeft > 0 || graceExpired)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else if (user && !user.email_confirmed_at && !isDismissed) {
      // Fallback for accounts without creation date
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, isDismissed, accountCreatedAt]);

  // Check localStorage for banner dismissal (session-based)
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`email-banner-dismissed-${user?.id}`);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [user?.id]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        toast.error(`Failed to resend verification email: ${error.message}`);
      } else {
        toast.success("Verification email sent! Check your inbox and spam folder.");
      }
    } catch (error) {
      toast.error("An error occurred while sending the email");
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Store dismissal in session storage (not persistent across browser sessions)
    sessionStorage.setItem(`email-banner-dismissed-${user?.id}`, 'true');
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Alert className="bg-amber-50 border-amber-200 mb-4 relative">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 pr-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {graceExpired ? (
              <>
                <span className="font-medium text-red-600">Email verification required:</span> Your 90-day grace period has expired. Please verify your email to continue accessing your account.
              </>
            ) : (
              <>
                <span className="font-medium">Email verification pending:</span> Please verify your email to secure your account. 
                {daysRemaining !== null && (
                  <span className="text-amber-700"> You have {daysRemaining} days remaining in your grace period.</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={isResending}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-2 py-1 h-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 mr-1" />
                  Resend
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 h-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};