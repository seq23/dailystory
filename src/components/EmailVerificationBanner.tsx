import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  user: any;
  onDismiss?: () => void;
}

export const EmailVerificationBanner = ({ user, onDismiss }: EmailVerificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user's email is verified
    if (user && !user.email_confirmed_at && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, isDismissed]);

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
            <span className="font-medium">Email verification pending:</span> Please check your inbox and click the verification link to secure your account. Your premium access is active, but some features may be limited until verified.
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