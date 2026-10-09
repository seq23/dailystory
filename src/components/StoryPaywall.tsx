import { useState } from "react";
import { BookOpen, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from "@/services/DebugLogger";
import { FREE_STORY_LIMIT, HEYGETONMYLEVEL_URL, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";

type Plan = "monthly" | "annual";

/** Shown once an account has used its free stories: start the 7-day trial through Stripe checkout. */
export function StoryPaywall() {
  const [pending, setPending] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTrial = async (plan: Plan) => {
    setPending(plan);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
        headers: session.session ? { Authorization: `Bearer ${session.session.access_token}` } : undefined,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("Checkout did not return a link");
      window.location.href = data.url;
    } catch (err) {
      DebugLogger.error("auth", "Trial checkout failed", err);
      setError("We couldn't open checkout just now. Please try again in a moment.");
      setPending(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6" data-testid="story-paywall">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          You've read your {FREE_STORY_LIMIT} free stories
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Keep your 4–8-year-old reading every day with new stories made for their level.
          Try it free for {TRIAL_DAYS} days, then pick monthly or yearly. Cancel anytime before the trial ends and you won't be charged.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(["monthly", "annual"] as Plan[]).map((plan) => {
          const price = PLAN_PRICES[plan];
          return (
            <Card key={plan} className={plan === "annual" ? "border-primary/40 shadow-lg" : undefined}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-sm font-medium text-muted-foreground">
                  {plan === "monthly" ? "Monthly" : "Yearly · best value"}
                </div>
                <div className="mt-1 mb-4">
                  <span className="text-3xl font-bold">{price.label}</span>
                  <span className="text-muted-foreground">{price.period}</span>
                </div>
                <ul className="space-y-2 text-sm mb-6 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Unlimited personalised stories</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Read-aloud, phonics help and word highlighting</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Includes HeyGetOnMyLevel reading practice free</li>
                </ul>
                <Button
                  className="w-full"
                  variant={plan === "annual" ? "default" : "outline"}
                  disabled={pending !== null}
                  onClick={() => startTrial(plan)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {pending === plan ? "Opening checkout…" : `Start ${TRIAL_DAYS}-day free trial`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}

      <p className="text-xs text-muted-foreground text-center mt-6">
        Card required to start the trial. Includes{" "}
        <a href={HEYGETONMYLEVEL_URL} target="_blank" rel="noopener noreferrer" className="underline">
          HeyGetOnMyLevel
        </a>{" "}
        reading practice free. Schools and classrooms:{" "}
        <a href="mailto:hello@time-2-read.com?subject=School%20pricing" className="underline">contact us</a>.
      </p>
    </div>
  );
}

export default StoryPaywall;
