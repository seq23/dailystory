import { Check, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { freeFeatures, premiumFeatures, additionalOfferings, enterpriseFeatures } from "@/constants/featureLists";
import heroImage from "@/assets/hero-image.jpg";
import vocabImg from "@/assets/story-illustration-12.jpg";
import ReadAloudCoach from "@/components/ReadAloudCoach";
import VoiceCommandController from "@/components/VoiceCommandController";

interface PricingSectionProps {
  compact?: boolean; // compact version for homepage
}

const phase2 = [
  {
    title: "Learning Management System (LMS)",
    items: [
      "Parent learning goals & overrides",
      "Teacher dashboard & classroom management",
      "Curriculum alignment tools",
      "Assessment & reporting",
      "Bulk user management",
      "Learning outcomes tracking",
    ],
  },
  {
    title: "Social Features & Sharing",
    items: [
      "Story sharing with family/friends",
      "Reading achievements sharing",
      "Collaborative reading sessions",
      "Community challenges",
      "Peer reading groups",
    ],
  },
  {
    title: "Enhanced Multilingual Support",
    items: [
      "Full story translation",
      "Native language audio",
      "Cultural story adaptations",
      "Cross-language vocabulary",
      "Language-specific phonetics",
    ],
  },
];

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

        <div className="grid gap-6 md:grid-cols-2">
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
                    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
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
                      <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
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
              </div>
              <Link to="/auth">
                <Button className="w-full">Upgrade to Premium</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">A closer look at Premium</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Live story generation</CardTitle>
                    <CardDescription>Stories evolve as you read—no limits.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={heroImage}
                      alt="Live story generation in Time2Read premium"
                      loading="lazy"
                      className="rounded-md w-full h-32 object-cover"
                    />
                    <p className="text-sm text-muted-foreground mt-3">
                      Create, extend, and personalize stories on the fly. Keep the adventure going for as long as you like.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Read‑aloud coach (Premium)</CardTitle>
                    <CardDescription>Speech‑to‑text feedback preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReadAloudCoach />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Voice commands (Premium)</CardTitle>
                    <CardDescription>Try a command like “Next page”</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VoiceCommandController />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vocabulary & quizzes</CardTitle>
                    <CardDescription>Build knowledge with practice activities.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={vocabImg}
                      alt="Vocabulary and comprehension activities preview"
                      loading="lazy"
                      className="rounded-md w-full h-32 object-cover"
                    />
                    <p className="text-sm text-muted-foreground mt-3">
                      Track tricky words, review them later, and test understanding with quick comprehension checks.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enterprise (Coming Soon) */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>Enterprise (Coming Soon)</span>
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="grid gap-2 md:grid-cols-2">
                    {enterpriseFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button variant="outline" disabled className="cursor-not-allowed opacity-70">
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phase 2 Roadmap */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Phase 2 Premium Feature Roadmap</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {phase2.map((section) => (
                  <Card key={section.title}>
                    <CardHeader>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items.map((i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-primary mt-1" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
      </div>
    </section>
  );
}

export default PricingSection;
