import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type VerificationStatus = "loading" | "success" | "already_verified" | "expired" | "error";

export default function VerifyConsent() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    verifyConsent(token);
  }, [searchParams]);

  const verifyConsent = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("confirm-parental-consent", {
        body: {},
        headers: {},
      });

      // The edge function returns HTML, but we'll handle the redirect on client side
      // For now, redirect to the edge function directly
      window.location.href = `https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/confirm-parental-consent?token=${token}`;
      
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Verification failed");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
      case "success":
      case "already_verified":
        return <CheckCircle className="w-16 h-16 text-[hsl(var(--green))]" />;
      case "expired":
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-destructive" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "loading":
        return "Verifying Consent...";
      case "success":
        return "Consent Verified!";
      case "already_verified":
        return "Already Verified";
      case "expired":
        return "Link Expired";
      case "error":
        return "Verification Failed";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
          <CardDescription>{message || "Processing your verification..."}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <p className="text-muted-foreground">
              Please wait while we verify your parental consent...
            </p>
          )}
          
          {(status === "success" || status === "already_verified") && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you! Your child can now use Time2Read with full features.
              </p>
              <Link to="/">
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go to Time2Read
                </Button>
              </Link>
            </div>
          )}
          
          {status === "expired" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This verification link has expired. Please contact the account holder to request a new verification email.
              </p>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We couldn't verify your consent. The link may be invalid or there was a technical issue.
              </p>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
