import { Check, CreditCard, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscriptionManager } from "@/components/SubscriptionManager";

interface MyAccountProps {
  isPremium: boolean;
  subscriptionTier?: string;
  subscriptionEnd?: string;
  devTestMode: boolean;
}

const freeFeatures: string[] = [
  "Limited customization of your story via User Info Form",
  "Free 20-minute reading sessions with Images",
  "Basic vocabulary highlights",
  "Standard audio and word tools (word-by-word highlighting, pronunciation help)",
  "End of session reporting gamification - gain points & unlock milestones within a single session analytics",
];

const premiumFeatures: string[] = [
  "Unlimited reading time",
  "Personalized live story generation",
  "Saved stories, favorites & collections",
  "Multiple child profiles",
  "Progress dashboard & detailed analytics",
  "Learning goals with weekly targets",
  "Parent dashboard insights & reports",
  "Achievements, badges & reading streaks",
  "Advanced audio narration (TTS)",
  "Word-by-word highlighting & phonics cues",
  "Vocabulary tracking & practice quizzes",
  "Priority support",
];

export function MyAccount({ isPremium, subscriptionTier, subscriptionEnd, devTestMode }: MyAccountProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary/20 rounded-full">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Account</h1>
          <p className="text-muted-foreground">Manage your subscription and account settings</p>
        </div>
      </div>

      {/* Subscription Manager */}
      <SubscriptionManager showComparison={false} />

      {/* Subscription Details */}
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-base">Subscription Details</CardTitle>
          <CardDescription>Your current plan and billing status</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <strong>Status:</strong> {isPremium ? "Active" : "Inactive"}
          </p>
          {subscriptionTier && (
            <p>
              <strong>Plan:</strong> {subscriptionTier}
            </p>
          )}
          {subscriptionEnd && (
            <p>
              <strong>Next Billing:</strong> {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          )}
          {devTestMode && (
            <p className="text-orange-600 font-medium mt-2">Developer Test Mode Active</p>
          )}
        </CardContent>
      </Card>

      {/* Free vs Premium Comparison */}
      <section aria-labelledby="comparison-heading" className="space-y-4">
        <header>
          <h2 id="comparison-heading" className="text-xl font-semibold">Free vs Premium</h2>
          <p className="text-muted-foreground">See everything included with Premium at a glance</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Free trial:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-primary/30 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle>Premium</CardTitle>
              </div>
              <CardDescription>Best for families and serious readers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default MyAccount;
