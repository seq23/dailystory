import { uiText, useUiLanguage } from "@/i18n/uiText";
import { Check, Crown, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startTrialCheckout, type TrialPlan } from "@/lib/trialCheckout";
import { RedeemCodeCard } from "@/components/RedeemCodeCard";
import { FREE_STORY_LIMIT, HEYGETONMYLEVEL_URL, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { freeFeatures, premiumFeatures, additionalOfferings, enterpriseFeatures } from "@/constants/featureLists";
import readingScreenshot from "@/assets/pricing-screenshot-reading.jpg";
import libraryScreenshot from "@/assets/pricing-screenshot-library.jpg";
import vocabScreenshot from "@/assets/pricing-screenshot-vocab.jpg";
import ReadAloudCoach from "@/components/ReadAloudCoach";
import { VoiceCommandsHelp } from "@/components/VoiceCommandsHelp";

interface PricingSectionProps {
  compact?: boolean;
}

export function PricingSection({ compact }: PricingSectionProps) {
  useUiLanguage();
  // A signed-in parent starts the trial here (Stripe checkout); everyone else signs up first.
  // Guard: src/test/guards/pricing-trial.test.ts.
  const [signedIn, setSignedIn] = useState(false);
  const [pending, setPending] = useState<TrialPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    supabase.auth.getSession().then(({ data }) => { if (live) setSignedIn(!!data.session); }).catch(() => {});
    return () => { live = false; };
  }, []);
  const startTrial = async (plan: TrialPlan) => {
    setPending(plan);
    setError(null);
    const problem = await startTrialCheckout(plan);
    if (problem) {
      setError(problem);
      setPending(null);
    }
  };

  return (
    <section className={compact ? "py-10" : "py-16"}>
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {uiText("Simple, transparent pricing")}
          </h1>
          <p className="text-muted-foreground mt-3">
            {uiText("Built for families with children ages 3 to 15, Pre-K to 10th grade. Try")} {FREE_STORY_LIMIT} {uiText("stories free, then")} {TRIAL_DAYS} {uiText("days of Premium free.")}
          </p>
        </header>

        {/* ── 3-column pricing grid ── */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>{uiText("Free")}</CardTitle>
              <CardDescription>{uiText("Try it out")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">$0</div>
                <div className="text-muted-foreground">{FREE_STORY_LIMIT} {uiText("free stories")}</div>
              </div>
              <ul className="space-y-2 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                    <span>{uiText(f)}</span>
                  </li>
                ))}
              </ul>
              <Link to="/?action=new-story">
                <Button variant="outline" className="w-full">
                  {uiText("Start Free")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card id="premium-features" className="border-primary/30 shadow-lg scroll-mt-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle>{uiText("Premium")}</CardTitle>
              </div>
              <CardDescription>{uiText("For families with readers ages 3 to 15")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">{PLAN_PRICES.monthly.label}</div>
                <div className="text-muted-foreground">{uiText("per month, or")} {PLAN_PRICES.annual.label} {uiText("per year")}</div>
                <div className="text-sm font-medium text-primary mt-1">{TRIAL_DAYS}{uiText("-day free trial")}</div>
                <div className="text-xs text-muted-foreground mt-1" data-testid="secure-checkout">{uiText("🔒 Secure checkout in US dollars, by Stripe. Have a code? Use it when you sign up.")}</div>
              </div>
              <p className="mb-4 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm" data-testid="heygetonmylevel-bonus">
                {uiText("Includes")}{" "}
                <a href={HEYGETONMYLEVEL_URL} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                  {uiText("HeyGetOnMyLevel")}
                </a>{" "}
                {uiText("reading practice free")}
              </p>
              <div className="space-y-4 mb-6">
                <ul className="space-y-2">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                      <span>{uiText(f)}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">{uiText("Additional offerings")}</h4>
                  <ul className="mt-2 space-y-2">
                    {additionalOfferings.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                        <span>{uiText(f)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {signedIn ? (
                <div className="space-y-2" data-testid="pricing-trial-signed-in">
                  <RedeemCodeCard className="mb-2" />
                  {(["monthly", "annual"] as TrialPlan[]).map((plan) => (
                    <Button
                      key={plan}
                      className="w-full"
                      variant={plan === "annual" ? "default" : "outline"}
                      disabled={pending !== null}
                      onClick={() => startTrial(plan)}
                      data-testid={`pricing-trial-${plan}`}
                    >
                      {pending === plan
                        ? uiText("Opening checkout…")
                        : `Start ${TRIAL_DAYS}-day free trial · ${PLAN_PRICES[plan].label}${PLAN_PRICES[plan].period}`}
                    </Button>
                  ))}
                  {error && <p role="alert" className="text-sm text-destructive">{error} {uiText("Tap a plan to try again.")}</p>}
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="w-full">{uiText("Start")} {TRIAL_DAYS}{uiText("-day free trial")}</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>{uiText("Schools")}</CardTitle>
              </div>
              <CardDescription>{uiText("For schools, classrooms & organizations")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">{uiText("Contact us")}</div>
                <div className="text-muted-foreground">{uiText("Classroom and district pricing")}</div>
              </div>
              <ul className="space-y-2 mb-6">
                {enterpriseFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                    <span>{uiText(f)}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@time-2-read.com?subject=School%20pricing">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  {uiText("Contact Us")}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* ── A look inside the app ── */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">{uiText("A look inside Time-2-Read")}</h2>
          <p className="text-muted-foreground mb-6">
            {uiText("See what the reading experience looks like for free and premium users.")}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Reading experience – all users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{uiText("Interactive reading sessions")}</CardTitle>
                <CardDescription>{uiText("Available to all users")}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={readingScreenshot}
                  alt={uiText("A reading session in Time-2-Read with illustrated story, interactive word highlighting, and floating timer")}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  {uiText("Every session features AI-generated illustrations, interactive word highlighting, text-to-speech, and a floating reading timer.")}
                </p>
              </CardContent>
            </Card>

            {/* Story library – premium */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <CardTitle className="text-base">{uiText("Story library & profiles")}</CardTitle>
                </div>
                <CardDescription>{uiText("Premium feature")}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={libraryScreenshot}
                  alt={uiText("Premium story library showing saved stories, reading stats, and child profile")}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  {uiText("Save unlimited stories, track reading streaks, manage multiple child profiles, and pick up right where you left off.")}
                </p>
              </CardContent>
            </Card>

            {/* Vocab & quizzes – premium */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <CardTitle className="text-base">{uiText("Vocabulary & quizzes")}</CardTitle>
                </div>
                <CardDescription>{uiText("Premium feature")}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={vocabScreenshot}
                  alt={uiText("Vocabulary word bank, comprehension quiz, achievement badges, and parent insights dashboard")}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  {uiText("Build a personal word bank, test comprehension with quizzes, earn achievement badges, and view parent insights.")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Read-aloud coach ── */}
        <div className="mt-10">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <CardTitle className="text-base">{uiText("Read‑aloud coach")}</CardTitle>
                </div>
                <CardDescription>{uiText("Speech‑to‑text feedback — Premium")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReadAloudCoach autoIntroduce={false} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Voice commands ── */}
        <div className="mt-10">
          <VoiceCommandsHelp />
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
