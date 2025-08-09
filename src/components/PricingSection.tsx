import { Check, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PricingSectionProps {
  compact?: boolean; // compact version for homepage
}

const features = {
  free: [
    "Netflix-style complete stories",
    "20-minute reading sessions",
    "Single profile (no save)",
    "Basic vocabulary highlights",
  ],
  premium: [
    "Unlimited reading time",
    "Live story generation",
    "Multiple child profiles + save progress",
    "Advanced audio + word tools",
    "Detailed analytics & achievements",
    "Custom story prompts",
  ],
  enterprise: [
    "Admin & educator dashboards",
    "Classroom & multi-seat licensing",
    "Curriculum alignment tools",
    "Assessment & reporting",
    "Bulk user management",
    "Priority support & SLAs",
  ],
};

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
                {features.free.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-primary/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle>Premium</CardTitle>
              </div>
              <CardDescription>Best for families</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">$9.99</div>
                <div className="text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-2 mb-6">
                {features.premium.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upgrade">
                <Button className="w-full">
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <CardTitle>Enterprise</CardTitle>
              </div>
              <CardDescription>Schools & organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">Contact Us</div>
                <div className="text-muted-foreground">Custom pricing</div>
              </div>
              <ul className="space-y-2 mb-6">
                {features.enterprise.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@time2read.app">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {!compact && (
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
        )}
      </div>
    </section>
  );
}

export default PricingSection;
