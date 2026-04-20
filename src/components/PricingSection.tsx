import { Check, Crown, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
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
  return (
    <section className={compact ? "py-10" : "py-16"}>
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground mt-3">
            Choose the plan that fits your family or organization. Upgrade anytime.
          </p>
        </header>

        {/* ── 3-column pricing grid ── */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Great to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">$0</div>
                <div className="text-muted-foreground">Forever</div>
              </div>
              <ul className="space-y-2 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/?action=new-story">
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card id="premium-features" className="border-primary/30 shadow-lg scroll-mt-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle>Premium</CardTitle>
              </div>
              <CardDescription>Best for families</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">$10</div>
                <div className="text-muted-foreground">per month</div>
              </div>
              <div className="space-y-4 mb-6">
                <ul className="space-y-2">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Additional offerings</h4>
                  <ul className="mt-2 space-y-2">
                    {additionalOfferings.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link to="/auth">
                <Button className="w-full">Upgrade to Premium</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>Enterprise</CardTitle>
              </div>
              <CardDescription>For schools &amp; organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">Custom</div>
                <div className="text-muted-foreground">Tailored to your needs</div>
              </div>
              <ul className="space-y-2 mb-6">
                {enterpriseFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@time-2-read.com?subject=Enterprise%20Inquiry">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* ── A look inside the app ── */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">A look inside Time2Read</h2>
          <p className="text-muted-foreground mb-6">
            See what the reading experience looks like for free and premium users.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Reading experience – all users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interactive reading sessions</CardTitle>
                <CardDescription>Available to all users</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={readingScreenshot}
                  alt="A reading session in Time2Read with illustrated story, interactive word highlighting, and floating timer"
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  Every session features AI-generated illustrations, interactive word highlighting, text-to-speech, and a floating reading timer.
                </p>
              </CardContent>
            </Card>

            {/* Story library – premium */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <CardTitle className="text-base">Story library &amp; profiles</CardTitle>
                </div>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={libraryScreenshot}
                  alt="Premium story library showing saved stories, reading stats, and child profile"
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  Save unlimited stories, track reading streaks, manage multiple child profiles, and pick up right where you left off.
                </p>
              </CardContent>
            </Card>

            {/* Vocab & quizzes – premium */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <CardTitle className="text-base">Vocabulary &amp; quizzes</CardTitle>
                </div>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={vocabScreenshot}
                  alt="Vocabulary word bank, comprehension quiz, achievement badges, and parent insights dashboard"
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="rounded-md w-full h-44 object-cover"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  Build a personal word bank, test comprehension with quizzes, earn achievement badges, and view parent insights.
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
                  <CardTitle className="text-base">Read‑aloud coach</CardTitle>
                </div>
                <CardDescription>Speech‑to‑text feedback — Premium</CardDescription>
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
