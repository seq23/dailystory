import { Check, CreditCard, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { freeFeatures, premiumFeatures as topPremiumFeatures, additionalOfferings } from "@/constants/featureLists";
import { Badge } from "@/components/ui/badge";
interface MyAccountProps {
  isPremium: boolean;
  subscriptionTier?: string;
  subscriptionEnd?: string;
  devTestMode: boolean;
}


export function MyAccount({ isPremium, subscriptionTier, subscriptionEnd, devTestMode }: MyAccountProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary/20 rounded-full">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
            <Badge variant={isPremium ? 'premium' : 'guest'} className="text-xs">
              {isPremium ? 'Premium' : 'Guest'}
            </Badge>
          </div>
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
              
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
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
            <CardContent className="space-y-4">
              <div>
                
                <ul className="space-y-2">
                  {topPremiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Additional offerings</h4>
                <ul className="mt-2 space-y-2">
                  {additionalOfferings.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default MyAccount;
