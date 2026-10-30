import { uiText, useUiLanguage } from "@/i18n/uiText";
import { useState } from "react";
import { Check, CreditCard, Crown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { DataExportButton } from "@/components/DataExportButton";
import { AccountRestriction } from "@/components/AccountRestriction";
import { ConsentWithdrawal } from "@/components/ConsentWithdrawal";
import { freeFeatures, premiumFeatures as topPremiumFeatures, additionalOfferings } from "@/constants/featureLists";
import { Badge } from "@/components/ui/badge";
import { premiumUntilLabel } from "@/lib/accessCode";
import { ChildrenList } from "@/components/children/ChildrenList";
import { FREE_STORY_LIMIT } from "@/lib/freeStoryAllowance";

interface MyAccountProps {
  isPremium: boolean;
  /** When Premium ends (code or paid period). */
  premiumUntil?: string;
  /** Free account: stories left before the paywall. */
  freeStoriesLeft?: number;
  subscriptionTier?: string;
  subscriptionEnd?: string;
  devTestMode: boolean;
  userEmail?: string;
  accountStatus?: string;
}


export function MyAccount({ isPremium, premiumUntil, freeStoriesLeft, devTestMode, userEmail, accountStatus: initialStatus }: MyAccountProps) {
  useUiLanguage();
  const [accountStatus, setAccountStatus] = useState(initialStatus || 'active');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary/20 rounded-full">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{uiText("Grown-up settings")}</h1>
            <Badge variant={isPremium ? 'premium' : 'guest'} className="text-xs">
              {isPremium ? uiText("Premium") : uiText("Free")}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {uiText("Your plan, codes and sign-in.")} {userEmail ? <>{uiText("Signed in as")} <strong>{userEmail}</strong>.</> : null}
          </p>
          <p className="text-sm mt-1" data-testid="account-plan-line">
            {isPremium
              ? (premiumUntilLabel(premiumUntil) ?? uiText("Premium is on"))
              : typeof freeStoriesLeft === "number"
                ? `Free account: ${freeStoriesLeft} of ${FREE_STORY_LIMIT} free stories left.`
                : uiText("Free account.")}
          </p>
        </div>
      </div>

      {/* Children first: who reads under this account */}
      <ChildrenList />

      {/* Plan, code and billing: the things a parent comes here for */}
      <SubscriptionManager showComparison={false} />

      <PasswordChangeForm />


      {/* Data Privacy Section */}
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">{uiText("Your Data")}</CardTitle>
          </div>
          <CardDescription>{uiText("Download or manage your personal data (GDPR/CCPA)")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <DataExportButton />
            <p className="text-xs text-muted-foreground">
              {uiText("Export all your data including profiles, reading history, saved stories, and preferences as a JSON file.")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GDPR: Right to Restrict Processing (Art. 18) */}
      <AccountRestriction accountStatus={accountStatus} onStatusChange={setAccountStatus} />

      {/* GDPR: Consent Withdrawal (Art. 7(3)) */}
      <ConsentWithdrawal />

      {/* Subscription Details */}
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-base">{uiText("Subscription Details")}</CardTitle>
          <CardDescription>{uiText("Your current plan and billing status")}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <strong>{uiText("Plan:")}</strong> {isPremium ? (premiumUntilLabel(premiumUntil) ?? uiText("Premium")) : uiText("Free")}
          </p>
          {devTestMode && (
            <p className="text-orange-600 font-medium mt-2">{uiText("Developer Test Mode Active")}</p>
          )}
        </CardContent>
      </Card>

      {/* Free vs Premium Comparison */}
      <section aria-labelledby="comparison-heading" className="space-y-4">
        <header>
          <h2 id="comparison-heading" className="text-xl font-semibold">{uiText("Free vs Premium")}</h2>
          <p className="text-muted-foreground">{uiText("See everything included with Premium at a glance")}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>{uiText("Free")}</CardTitle>
              
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                    <span>{uiText(f)}</span>
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
                <CardTitle>{uiText("Premium")}</CardTitle>
              </div>
              <CardDescription>{uiText("Best for families and serious readers")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                
                <ul className="space-y-2">
                  {topPremiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                      <span>{uiText(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">{uiText("Additional offerings")}</h4>
                <ul className="mt-2 space-y-2">
                  {additionalOfferings.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                      <span>{uiText(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Account Deletion Section */}
      <section aria-labelledby="danger-zone-heading" className="space-y-4 mt-8 pt-8 border-t border-destructive/20">
        <header>
          <h2 id="danger-zone-heading" className="text-xl font-semibold text-destructive">{uiText("Danger Zone")}</h2>
          <p className="text-muted-foreground">{uiText("Irreversible actions for your account")}</p>
        </header>
        <AccountDeletion userEmail={userEmail} />
      </section>
    </div>
  );
}

export default MyAccount;
