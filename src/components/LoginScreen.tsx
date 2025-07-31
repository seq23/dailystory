import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

export const LoginScreen = () => {
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    displayName: "",
    selectedPlan: "monthly" as "monthly" | "annual"
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.displayName,
            selected_plan: signUpData.selectedPlan
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify your account, then proceed with payment.");
        // Don't redirect yet - user needs to verify email first
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
        // The AuthWrapper will handle redirecting to the main app
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPayment = async () => {
    if (!signUpData.email) {
      toast.error("Please complete sign up first");
      return;
    }

    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in first to proceed with payment");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: signUpData.selectedPlan },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        if (error.message?.includes("STRIPE_SECRET_KEY")) {
          toast.error("Payment system not configured yet. Please contact support.");
        } else {
          toast.error(error.message || "Failed to create payment session");
        }
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error("Failed to start payment process");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Join Time2Read Premium
          </CardTitle>
          <CardDescription className="text-lg">
            Unlock unlimited personalized stories and advanced features
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Create Account</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-6">
              {/* Pricing Plans */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card 
                  className={`cursor-pointer transition-all ${
                    signUpData.selectedPlan === "monthly" 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSignUpData(prev => ({ ...prev, selectedPlan: "monthly" }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Monthly Plan</h3>
                      {signUpData.selectedPlan === "monthly" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      $10<span className="text-sm text-gray-500">/month</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Unlimited stories
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Advanced AI features
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all relative ${
                    signUpData.selectedPlan === "annual" 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSignUpData(prev => ({ ...prev, selectedPlan: "annual" }))}
                >
                  <Badge className="absolute -top-2 -right-2 bg-green-500">
                    Save $20
                  </Badge>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Annual Plan</h3>
                      {signUpData.selectedPlan === "annual" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      $100<span className="text-sm text-gray-500">/year</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Unlimited stories
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Advanced AI features
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your display name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Payment Button */}
              <div className="border-t pt-4">
                <Button 
                  onClick={handleStartPayment} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !signUpData.email}
                >
                  {loading ? "Processing..." : `Start Payment - ${signUpData.selectedPlan === "monthly" ? "$10/month" : "$100/year"}`}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Complete account creation first, then proceed with secure payment
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>✓ 30-day money-back guarantee</p>
            <p>✓ Cancel anytime</p>
            <p>✓ Secure payment processing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};