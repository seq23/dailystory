import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, ArrowLeft, X, Volume2, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserInfo } from "@/types";
import { DebugLogger } from "@/services/DebugLogger";
import { PasswordReset } from "@/components/PasswordReset";
import { parentAuthMessage } from "@/lib/authMessages";
import { PAYMENT_TROUBLE, checkoutBody, checkoutErrorMessage, codeFromUrl, normalizeAccessCode, premiumUntilLabel, redeemAccessCode } from "@/lib/accessCode";

interface LoginScreenProps {
  userInfo?: UserInfo | null;
  onBack?: () => void;
}

/** On /auth nothing else swaps the screen after sign-in, so go to the app ("/"). */
function goToAppIfOnAuthPage(keepCode = false) {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/") {
    const code = keepCode ? codeFromUrl() : "";
    window.location.href = code ? `/?code=${encodeURIComponent(code)}` : "/";
  }
}

export const LoginScreen = ({ userInfo, onBack }: LoginScreenProps = {}) => {
  const { t } = useTranslation();
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    displayName: "",
    selectedPlan: "monthly" as "monthly" | "annual",
    // ?code=HOMESCHOOL15 on the link pre-fills the "Have a code?" box
    discountCode: codeFromUrl()
  });
  
  // COPPA: the account belongs to a grown-up; children are profiles inside it.
  // (isUnder13/parentEmail stay false/empty: a child never makes the account.)
  const [isUnder13] = useState(false);
  const [parentEmail] = useState("");
  const [isGuardian, setIsGuardian] = useState(false);
  
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
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  // Two-step signup wizard: 1 = your details, 2 = choose how to start
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [discountValidation, setDiscountValidation] = useState<{
    isValid: boolean;
    message: string;
    isValidating: boolean;
    kind?: "discount" | "trial";
    trialDays?: number;
  }>({
    isValid: false,
    message: "",
    isValidating: false
  });
  // A valid discount code means a free account. A valid access code (kind "trial",
  // e.g. HOMESCHOOL15) gives Premium at once with no card: it is saved on the account
  // at sign-up and redeemed by the server straight after (redeem-access-code).
  const isFreeDiscount = discountValidation.isValid && discountValidation.kind !== "trial";
  const isAccessCode = discountValidation.isValid && discountValidation.kind === "trial";

  // A code that arrived on the link is checked straight away, so Step 2 already shows it.
  useEffect(() => {
    if (signUpData.discountCode) validateDiscountCode(signUpData.discountCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validate Step 1 (details) before advancing to Step 2
  const validateStep1 = (): boolean => {
    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      toast.error(t("loginScreen.form.errors.fillAllFields"));
      return false;
    }
    if (!isGuardian) {
      toast.error("Please tick the box to confirm you're the parent or guardian.");
      return false;
    }
    if (isUnder13 && (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))) {
      toast.error("Please provide a valid parent/guardian email address for accounts under 13.");
      return false;
    }
    return true;
  };

  // Validate discount code
  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountValidation(prev => ({ 
        ...prev, 
        isValid: false, 
        message: "", 
        isValidating: false, kind: undefined 
      }));
      return;
    }

    setDiscountValidation(prev => ({ ...prev, isValidating: true, message: "" }));
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: code.trim() }
      });

      if (error) {
        const refused = await checkoutErrorMessage(error, data);
        if (refused) {
          setDiscountValidation(prev => ({ ...prev, isValid: false, message: refused, isValidating: false, kind: undefined }));
          return;
        }
        throw error;
      }

      setDiscountValidation(prev => ({
        ...prev,
        isValid: data.valid,
        message: data.message,
        isValidating: false,
        kind: data.kind === "trial" ? "trial" : "discount",
        trialDays: typeof data.trialDays === "number" ? data.trialDays : undefined
      }));
    } catch (error: any) {
      setDiscountValidation(prev => ({
        ...prev,
        isValid: false,
        message: "Error validating code",
        isValidating: false,
        kind: undefined
      }));
    }
  };

  const handleSignUp = async (e?: React.FormEvent): Promise<boolean> => {
    e?.preventDefault();
    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      toast.error(t("loginScreen.form.errors.fillAllFields"));
      return false;
    }

    // COPPA validation: require parent email if under 13
    if (isUnder13 && (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))) {
      toast.error("Please provide a valid parent/guardian email address for accounts under 13.");
      return false;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.displayName,
            selected_plan: signUpData.selectedPlan,
            is_under_13: isUnder13,
            parent_email: isUnder13 ? parentEmail : null,
            // Saved on the account so the server can still redeem it on first sign-in
            // when the session is not ready yet (e.g. email confirmation first).
            ...(isAccessCode && { access_code: normalizeAccessCode(signUpData.discountCode) }),
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
        toast.error(parentAuthMessage(error.message));
        return false;
      }

      // If a valid discount code was entered, activate it immediately on the
      // freshly authenticated session. The client cannot persist the pending
      // code (RLS blocks it), so the edge function activates it via service role.
      let discountActivated = false;
      if (isFreeDiscount && signUpData.discountCode.trim() && authData.user) {
        const code = signUpData.discountCode.trim().toUpperCase();
        try {
          const { data: session } = await supabase.auth.getSession();
          const accessToken = session.session?.access_token;
          if (accessToken) {
            const { data: result, error: applyError } = await supabase.functions.invoke('apply-discount-code', {
              headers: { Authorization: `Bearer ${accessToken}` },
              body: { discountCode: code },
            });
            if (!applyError && result?.activated) {
              discountActivated = true;
            } else {
              DebugLogger.warn('auth', 'Discount activation at signup did not succeed', applyError || result);
            }
          } else {
            DebugLogger.warn('auth', 'No session after signup; discount will activate on first login');
          }
        } catch (applyErr) {
          DebugLogger.warn('auth', 'Error activating discount at signup', applyErr);
        }
      }

      // Access code: Premium on now, on the server, before the parent sees the app.
      if (isAccessCode && authData.session) {
        const redeemed = await redeemAccessCode(signUpData.discountCode);
        if (redeemed.ok) {
          toast.success(`Account made. ${premiumUntilLabel(redeemed.premiumUntil) ?? "Premium is on"}.`);
        } else {
          toast.error(`Account made, but the code didn't go through: ${redeemed.message} You can try it again in My Account.`);
        }
        goToAppIfOnAuthPage();
        return true;
      }
      if (isAccessCode) {
        toast.success("Account made. Your code turns Premium on the first time you sign in.");
        return true;
      }

      toast.success(discountActivated
        ? "Your free premium access is now active. Enjoy!"
        : isFreeDiscount 
          ? "Account created! Your discount code will be activated when you first log in."
          : t("loginScreen.form.success.accountCreated"));
      if (isFreeDiscount) goToAppIfOnAuthPage();
      return true;
    } catch (error) {
      toast.error(t("loginScreen.form.errors.unexpected"));
      DebugLogger.error('auth', 'Signup error', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Paid path: create the account, then open Stripe checkout in one click
  const handleCreateAndPay = async () => {
    const created = await handleSignUp();
    if (created) {
      await handleStartPayment();
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
        toast.error(parentAuthMessage(error.message));
      } else {
        toast.success(t("loginScreen.form.success.signedIn"));
        // On "/" the AuthWrapper swaps to the app; on /auth we go there (a ?code= link keeps its code).
        goToAppIfOnAuthPage(true);
      }
    } catch (error) {
      toast.error(t("loginScreen.form.errors.unexpected"));
      DebugLogger.error('auth', 'Signin error', error);
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

      // Codes never go to checkout from here: an access code is redeemed at sign-up.
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: checkoutBody(signUpData.selectedPlan),
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        const refused = await checkoutErrorMessage(error, data);
        // Plain words only: never a server's raw text or a setting name.
        toast.error(refused ?? PAYMENT_TROUBLE);
        return;
      }

      if (data?.url) {
        // Same tab: a tab opened after an await is blocked on iPhone and iPad,
        // which left the parent on a free account with nothing on screen.
        window.location.href = data.url;
      } else {
        toast.error("Checkout didn't open. Please try again.");
      }
    } catch (error) {
      toast.error(PAYMENT_TROUBLE);
      DebugLogger.error('auth', 'Payment process failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
  }

  return (
    // Scrolls as one page (no inner trap): the form starts at the top on short screens,
    // so "Continue" is always reachable by scrolling, on a phone or a laptop.
    <div className="min-h-[100dvh] bg-gradient-hero flex items-start md:items-center justify-center px-4 pt-16 pb-10">
      {/* Back button - always show one */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          DebugLogger.log('ui', 'Back button clicked', { onBackAvailable: !!onBack });
          try {
            if (onBack) {
              DebugLogger.log('ui', 'Using onBack callback');
              onBack();
            } else if (window.history.length > 1) {
              DebugLogger.log('ui', 'Using window.history.back()');
              window.history.back();
            } else {
              DebugLogger.log('ui', 'Fallback to home redirect');
              window.location.href = '/';
            }
          } catch (error) {
            DebugLogger.error('ui', 'Navigation error', error);
            window.location.href = '/';
          }
        }}
        className="absolute top-4 left-4 z-50 text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

      {/* Close button (X) in top-right corner */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          DebugLogger.log('ui', 'Close button clicked', { onBackAvailable: !!onBack });
          try {
            if (onBack) {
              DebugLogger.log('ui', 'Using onBack callback');
              onBack();
            } else if (window.history.length > 1) {
              DebugLogger.log('ui', 'Using window.history.back()');
              window.history.back();
            } else {
              DebugLogger.log('ui', 'Fallback to home redirect');
              window.location.href = '/';
            }
          } catch (error) {
            DebugLogger.error('ui', 'Navigation error', error);
            window.location.href = '/';
          }
        }}
        className="absolute top-4 right-4 z-50 text-white hover:bg-red-500/30 border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg p-2 shadow-lg transition-all duration-200 hover:scale-105"
        aria-label={t("loginScreen.close", "Close")}
      >
        <X className="w-5 h-5" />
      </Button>
      
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <h1 className="sr-only">Sign in or sign up for Time-2-Read</h1>
        <CardHeader className="text-center">
          <img src="/icon-192.png" alt="Time-2-Read logo" className="mx-auto h-14 w-14" />
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
            {userInfo ? "Keep reading with Time-2-Read" : "Join Time-2-Read"}
          </CardTitle>
          <CardDescription className="text-lg">
            {userInfo 
              ? t("loginScreen.subtitle.upgrade")
              : t("loginScreen.subtitle.join")
            }
          </CardDescription>
          <div className="mt-2">
            <a
              href="/pricing#premium-features"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline hover:opacity-90"
            >
              {t("loginScreen.links.seeFullFeatures", "See full Premium feature list")}
            </a>
          </div>
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
              {/* Step progress indicator */}
              <div className="flex items-center justify-center gap-3 text-sm font-medium">
                <span className={signupStep === 1 ? "text-primary" : "text-muted-foreground"}>
                  {t("loginScreen.steps.step1", "Step 1 of 2")}
                </span>
                <span className="text-muted-foreground">›</span>
                <span className={signupStep === 2 ? "text-primary" : "text-muted-foreground"}>
                  {t("loginScreen.steps.step2", "Step 2 of 2")}
                </span>
              </div>

              {/* STEP 1 — Your details */}
              {signupStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">
                    {t("loginScreen.steps.detailsTitle", "Create your account")}
                  </h2>
                  <p className="text-sm text-muted-foreground text-center">
                    {t("loginScreen.steps.detailsSubtitle", "Enter your details to get started.")}
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Your name (parent or guardian)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpData.displayName}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="For example, Sam"
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

                  {/* "Have a code?" — always visible on Step 1, pre-filled from ?code= */}
                  <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Label htmlFor="discount-code" className="font-medium">
                      Have a code? <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="discount-code"
                        data-testid="signup-code-input"
                        type="text"
                        autoCapitalize="characters"
                        autoComplete="off"
                        placeholder="For example, from a school or group"
                        value={signUpData.discountCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setSignUpData(prev => ({ ...prev, discountCode: code }));
                          clearTimeout((window as any).discountTimeout);
                          (window as any).discountTimeout = setTimeout(() => {
                            validateDiscountCode(code);
                          }, 500);
                        }}
                        className={`pr-8 ${
                          discountValidation.isValid
                            ? 'border-green-500 focus:border-green-500'
                            : discountValidation.message && !discountValidation.isValidating
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                      />
                      {discountValidation.isValidating && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Checking code">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      )}
                      {discountValidation.isValid && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600" aria-hidden>
                          ✓
                        </div>
                      )}
                    </div>
                    {discountValidation.isValidating && (
                      <p className="text-xs text-muted-foreground">Checking your code…</p>
                    )}
                    {discountValidation.message && !discountValidation.isValidating && (
                      <p role={discountValidation.isValid ? "status" : "alert"} className={`text-sm ${discountValidation.isValid ? 'text-green-700' : 'text-red-600'}`} data-testid="signup-code-message">
                        {isAccessCode
                          ? `✓ Code accepted: ${discountValidation.trialDays ? `${discountValidation.trialDays} days of Premium` : "Premium"}, free. No card needed.`
                          : discountValidation.message}
                      </p>
                    )}
                  </div>

                  {/* The grown-up owns the account; children are profiles inside it (COPPA). */}
                  <label className="flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer" data-testid="signup-guardian-consent">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-primary"
                      checked={isGuardian}
                      onChange={(e) => setIsGuardian(e.target.checked)}
                    />
                    <span>
                      I'm the parent or guardian (18 or older). My children read under this account, and I agree to the{" "}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">privacy policy</a>.
                      We never ask children for an email address.
                    </span>
                  </label>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => { if (validateStep1()) setSignupStep(2); }}
                  >
                    {t("loginScreen.steps.continue", "Continue")}
                  </Button>
                </div>
              )}

              {/* STEP 2 — Choose how to start */}
              {signupStep === 2 && (
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("loginScreen.steps.back", "Back")}
                  </button>

                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      {t("loginScreen.steps.chooseTitle", "Choose how to start")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isAccessCode || isFreeDiscount
                        ? "Your code is ready. Create your account to start."
                        : "Pick a plan. Have a code? Go back one step and type it in."}
                    </p>
                  </div>

                  {/* The code typed in Step 1, in plain words */}
                  {isAccessCode && (
                    <div className="p-4 bg-green-50 border border-green-300 rounded-lg" data-testid="signup-code-accepted">
                      <h3 className="font-semibold text-green-900 mb-1">
                        ✓ Code {normalizeAccessCode(signUpData.discountCode)} accepted
                      </h3>
                      <p className="text-sm text-green-900">
                        {discountValidation.trialDays ? `${discountValidation.trialDays} days` : "Your free days"} of Premium start as soon as you create your account. No card needed.
                      </p>
                    </div>
                  )}

                  {/* Discount Success Message */}
                  {isFreeDiscount && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-1">🎉 No Payment Required!</h3>
                      <p className="text-sm text-green-700">
                        Your discount code will give you 90 days of free premium access starting when you first log in.
                      </p>
                    </div>
                  )}

                  {/* Pricing Plans — hidden when a code covers it */}
                  {!isFreeDiscount && !isAccessCode && (
                    <div className="grid md:grid-cols-2 gap-4">
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
                            <li className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-purple-500" />
                              Voice personalization & commands
                            </li>
                            <li className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-green-500" />
                              Reading assessment & feedback
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
                            <li className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-purple-500" />
                              Voice personalization & commands
                            </li>
                            <li className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-green-500" />
                              Reading assessment & feedback
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Single context-aware primary CTA */}
                  {isFreeDiscount || isAccessCode ? (
                    <Button
                      type="button"
                      className="w-full min-h-11"
                      disabled={loading}
                      onClick={() => handleSignUp()}
                      data-testid="signup-create-with-code"
                    >
                      {loading ? (
                        <><span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />Creating your account…</>
                      ) : isAccessCode ? "Create my account and start Premium" : t("loginScreen.steps.createFree", "Create Free Account")}
                    </Button>
                  ) : (
                    <div>
                      <Button
                        type="button"
                        onClick={handleCreateAndPay}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={loading || !signUpData.email}
                      >
                        {loading ? t("loginScreen.form.buttons.processing") : `${t("loginScreen.steps.createAndPay", "Create Account & Pay")} - ${signUpData.selectedPlan === "monthly" ? t("loginScreen.payment.monthly") : t("loginScreen.payment.annual")}`}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {t("loginScreen.payment.instruction")}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-2" data-testid="secure-checkout">🔒 Secure checkout in US dollars, by Stripe.</p>
                    </div>
                  )}
                </div>
              )}
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
                
                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          
          {/* Back to Home Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="text-sm text-muted-foreground underline cursor-pointer hover:text-foreground"
            >
              {t("loginScreen.closeButton", "Back to Home")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};