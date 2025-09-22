import { DebugLogger } from '@/services/DebugLogger';
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X } from "lucide-react";

export const PasswordResetConfirm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Handle the password reset flow
    const handleAuthStateChange = (event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        toast.success("Please enter your new password");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Za-z]/.test(pwd)) return "Password must contain at least one letter";
    if (!/\d/.test(pwd)) return "Password must contain at least one number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully! You can now sign in.");
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
      DebugLogger.error('auth', 'Password update error', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordError = password ? validatePassword(password) : null;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  className={passwordError && password ? "border-red-300" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordError && password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
              {!passwordError && password && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Password meets requirements
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className={confirmPassword && !passwordsMatch ? "border-red-300" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordError !== null || !passwordsMatch}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};