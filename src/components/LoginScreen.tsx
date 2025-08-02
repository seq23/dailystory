import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, ArrowLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserInfo } from "@/types";

interface LoginScreenProps {
  userInfo?: UserInfo | null;
  onBack?: () => void;
}

export const LoginScreen = ({ userInfo, onBack }: LoginScreenProps = {}) => {
  const { t } = useTranslation();
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    displayName: "",
    selectedPlan: "monthly" as "monthly" | "annual"
  });
  
  // Pre-fill with userInfo if available
  useEffect(() => {
    if (userInfo) {
      setSignUpData(prev => ({
        ...prev,
        displayName: userInfo.name || ""
      }));
    }
  }, [userInfo]);
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      toast.error(t("loginScreen.form.errors.fillAllFields"));
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
            selected_plan: signUpData.selectedPlan,
            // Include all the user info from free trial
            ...(userInfo && {
              grade_level: userInfo.gradeLevel || userInfo.grade,
              interests: userInfo.interests ? userInfo.interests.join(',') : userInfo.hobbies,
              reading_level: userInfo.readingLevel || userInfo.difficultyLevel,
              native_language: userInfo.nativeLanguage
            })
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("loginScreen.form.success.accountCreated"));
        // Don't redirect yet - user needs to verify email first
      }
    } catch (error) {
      toast.error(t("loginScreen.form.errors.unexpected"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error(t("loginScreen.form.errors.fillAllFields"));
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
        toast.success(t("loginScreen.form.success.signedIn"));
        // The AuthWrapper will handle redirecting to the main app
      }
    } catch (error) {
      toast.error(t("loginScreen.form.errors.unexpected"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPayment = async () => {
    if (!signUpData.email) {
      toast.error(t("loginScreen.form.errors.completeSignup"));
      return;
    }

    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error(t("loginScreen.form.errors.signInFirst"));
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
          toast.error(t("loginScreen.form.errors.paymentNotConfigured"));
        } else {
          toast.error(error.message || t("loginScreen.form.errors.paymentFailed"));
        }
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error(t("loginScreen.form.errors.paymentProcessFailed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Back button - always show one */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Back button clicked - onBack available:', !!onBack);
          try {
            if (onBack) {
              console.log('Using onBack callback');
              onBack();
            } else if (window.history.length > 1) {
              console.log('Using window.history.back()');
              window.history.back();
            } else {
              console.log('Fallback to home redirect');
              window.location.href = '/';
            }
          } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = '/';
          }
        }}
        className="absolute top-4 left-4 z-50 text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {onBack ? t("loginScreen.navigation.backToTrial") : t("loginScreen.navigation.back")}
        </Button>

      {/* Close button (X) in top-right corner */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Close button clicked - onBack available:', !!onBack);
          try {
            if (onBack) {
              console.log('Using onBack callback');
              onBack();
            } else if (window.history.length > 1) {
              console.log('Using window.history.back()');
              window.history.back();
            } else {
              console.log('Fallback to home redirect');
              window.location.href = '/';
            }
          } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = '/';
          }
        }}
        className="absolute top-4 right-4 z-50 text-white hover:bg-red-500/30 border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg p-2 shadow-lg transition-all duration-200 hover:scale-105"
      >
        <X className="w-5 h-5" />
      </Button>
      
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {userInfo ? t("loginScreen.title.upgrade") : t("loginScreen.title.join")}
          </CardTitle>
          <CardDescription className="text-lg">
            {userInfo 
              ? t("loginScreen.subtitle.upgrade")
              : t("loginScreen.subtitle.join")
            }
          </CardDescription>
          {userInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                {t("loginScreen.trialInfoSaved")}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">{t("loginScreen.tabs.createAccount")}</TabsTrigger>
              <TabsTrigger value="signin">{t("loginScreen.tabs.signIn")}</TabsTrigger>
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
                      <h3 className="font-semibold">{t("loginScreen.plans.monthly.title")}</h3>
                      {signUpData.selectedPlan === "monthly" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {t("loginScreen.plans.monthly.price")}<span className="text-sm text-gray-500">{t("loginScreen.plans.monthly.period")}</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {t("loginScreen.plans.monthly.features.unlimited")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        {t("loginScreen.plans.monthly.features.aiFeatures")}
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
                    {t("loginScreen.plans.annual.savings")}
                  </Badge>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{t("loginScreen.plans.annual.title")}</h3>
                      {signUpData.selectedPlan === "annual" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {t("loginScreen.plans.annual.price")}<span className="text-sm text-gray-500">{t("loginScreen.plans.annual.period")}</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {t("loginScreen.plans.annual.features.unlimited")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        {t("loginScreen.plans.annual.features.aiFeatures")}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t("loginScreen.form.labels.displayName")}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder={t("loginScreen.form.placeholders.displayName")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("loginScreen.form.labels.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t("loginScreen.form.placeholders.email")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("loginScreen.form.labels.password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t("loginScreen.form.placeholders.password")}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("loginScreen.form.buttons.creating") : t("loginScreen.form.buttons.createAccount")}
                </Button>
              </form>

              {/* Payment Button */}
              <div className="border-t pt-4">
                <Button 
                  onClick={handleStartPayment} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !signUpData.email}
                >
                  {loading ? t("loginScreen.form.buttons.processing") : `${t("loginScreen.form.buttons.startPayment")} - ${signUpData.selectedPlan === "monthly" ? t("loginScreen.payment.monthly") : t("loginScreen.payment.annual")}`}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t("loginScreen.payment.instruction")}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t("loginScreen.form.labels.email")}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t("loginScreen.form.placeholders.email")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t("loginScreen.form.labels.password")}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t("loginScreen.form.placeholders.password")}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("loginScreen.form.buttons.signingIn") : t("loginScreen.form.buttons.signIn")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{t("loginScreen.guarantees.moneyBack")}</p>
            <p>{t("loginScreen.guarantees.cancelAnytime")}</p>
            <p>{t("loginScreen.guarantees.securePayment")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};