import { DebugLogger } from '@/services/DebugLogger';
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

interface PasswordResetProps {
  onBack: () => void;
}

export const PasswordReset = ({ onBack }: PasswordResetProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
      DebugLogger.error('auth', 'Password reset error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="absolute top-4 left-4 z-50 text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2 shadow-lg transition-all duration-200 hover:scale-105"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sign In
      </Button>

      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription>
            {sent 
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see the email? Check your spam folder or try again in a few minutes.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSent(false)}
                className="w-full"
              >
                Send to Different Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};