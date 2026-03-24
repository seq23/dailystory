import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Subprocessor {
  name: string;
  purpose: string;
  dataProcessed: string;
  location: string;
  dpaStatus: "signed" | "pending";
  privacyUrl: string;
  riskTier: "high" | "medium" | "low";
}

const subprocessors: Subprocessor[] = [
  {
    name: "Supabase",
    purpose: "Database, authentication, and edge functions",
    dataProcessed: "User accounts, profiles, reading data, child profiles",
    location: "United States (AWS)",
    dpaStatus: "signed",
    privacyUrl: "https://supabase.com/privacy",
    riskTier: "high",
  },
  {
    name: "Stripe",
    purpose: "Payment processing for premium subscriptions",
    dataProcessed: "Email, payment information, subscription status",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://stripe.com/privacy",
    riskTier: "high",
  },
  {
    name: "Resend",
    purpose: "Transactional email delivery",
    dataProcessed: "Email addresses, transactional email content",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    riskTier: "high",
  },
  {
    name: "OpenAI",
    purpose: "AI-powered story text generation",
    dataProcessed: "Story prompts only — no personal information",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://openai.com/policies/privacy-policy",
    riskTier: "medium",
  },
  {
    name: "Anthropic",
    purpose: "AI fallback story generation (Claude)",
    dataProcessed: "Story prompts only — no personal information",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://www.anthropic.com/privacy",
    riskTier: "medium",
  },
  {
    name: "ElevenLabs",
    purpose: "Text-to-speech narration",
    dataProcessed: "Story text only — no personal information",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://elevenlabs.io/privacy",
    riskTier: "medium",
  },
  {
    name: "Runware",
    purpose: "AI image generation for story illustrations",
    dataProcessed: "Image prompts only — no personal information",
    location: "Europe / United States",
    dpaStatus: "signed",
    privacyUrl: "https://runware.ai",
    riskTier: "medium",
  },
  {
    name: "Cloudflare",
    purpose: "Hosting, CDN, DDoS protection, Web Application Firewall",
    dataProcessed: "IP addresses, request metadata",
    location: "Global",
    dpaStatus: "signed",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "low",
  },
  {
    name: "GitHub",
    purpose: "Source code hosting and CI/CD pipelines",
    dataProcessed: "Source code only — no user data",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    riskTier: "low",
  },
];

const Subprocessors = () => {
  useEffect(() => {
    const title = "Subprocessors | Spry VSL LLC";
    const desc = "List of subprocessors used by Time-2-Read to provide its services.";
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + "/subprocessors",
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getRiskBadge = (tier: Subprocessor["riskTier"]) => {
    switch (tier) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-xs">Medium Risk</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Low Risk</Badge>;
    }
  };

  const getDpaBadge = (status: Subprocessor["dpaStatus"]) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">DPA Signed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 text-xs">DPA Pending</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-10">
        <Link to="/vendors">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Subprocessors</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Third-party services that process data on behalf of Time-2-Read
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: March 24, 2026
        </p>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-8">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Enterprise Transparency
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              This page lists all subprocessors used by Time-2-Read. We maintain Data Processing
              Agreements (DPAs) with vendors who process personal data. We will update this page
              and notify affected customers before adding new subprocessors.
            </p>
          </div>
        </div>

        {/* Risk tier sections */}
        {(["high", "medium", "low"] as const).map((tier) => {
          const tierProcessors = subprocessors.filter((s) => s.riskTier === tier);
          const tierLabel = tier === "high" ? "High Risk — Processes Personal Data" : tier === "medium" ? "Medium Risk — Transient Data Processing" : "Low Risk — Infrastructure Only";

          return (
            <div key={tier} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">{tierLabel}</h2>
              <div className="grid gap-4">
                {tierProcessors.map((sp) => (
                  <Card key={sp.name}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-base">{sp.name}</CardTitle>
                        <div className="flex gap-2">
                          {getRiskBadge(sp.riskTier)}
                          {getDpaBadge(sp.dpaStatus)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <span className="font-medium">Purpose:</span>{" "}
                          <span className="text-muted-foreground">{sp.purpose}</span>
                        </div>
                        <div>
                          <span className="font-medium">Data Processed:</span>{" "}
                          <span className="text-muted-foreground">{sp.dataProcessed}</span>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          <span className="text-muted-foreground">{sp.location}</span>
                        </div>
                        <a
                          href={sp.privacyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm mt-1 inline-block"
                        >
                          Privacy Policy →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        <article className="prose max-w-none dark:prose-invert mt-8">
          <h2>Changes to Subprocessors</h2>
          <p>
            We will update this page when subprocessors are added or removed. Enterprise customers
            with DPAs will be notified of material changes in advance.
          </p>
          <p>
            For questions about our subprocessors, contact{" "}
            <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>.
          </p>
        </article>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link to="/vendors">
            <Button variant="outline">Vendor Details</Button>
          </Link>
          <Link to="/data-transfers">
            <Button variant="outline">Data Transfers</Button>
          </Link>
          <Link to="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Subprocessors;
