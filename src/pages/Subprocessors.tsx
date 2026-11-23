import { uiText } from "@/i18n/uiText";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteFooterNav } from "@/components/SiteFooterNav";

interface Subprocessor {
  name: string;
  purpose: string;
  dataProcessed: string;
  location: string;
  dpaStatus: "signed" | "pending";
  privacyUrl: string;
  /** Where a claim on the card comes from, shown as its own link. */
  source?: { label: string; url: string };
  riskTier: "high" | "medium" | "low";
  /** What it does for us, finishing "<name> …"; the tier's answer sentence is built from these. */
  role: string;
}

/** Each tier's question; the answer under it is built from that tier's vendors (tierAnswer). */
const TIERS = [
  { tier: "high", question: "Which subprocessors store accounts, payments and email? (High risk)" },
  { tier: "medium", question: "Which subprocessors run the AI features? (Medium risk)" },
  { tier: "low", question: "Which subprocessors host and build the site? (Low risk)" },
] as const;

/** "Supabase runs …; Stripe takes …; Resend sends …." from the tier's own vendor list. */
export const tierAnswer = (vendors: Pick<Subprocessor, "name" | "role">[]) =>
  `${vendors.map((v) => `${v.name} ${v.role}`).join("; ")}.`;

const subprocessors: Subprocessor[] = [
  {
    name: "Supabase",
    role: "runs sign-in and the database (accounts, child profiles, reading data)",
    purpose: "Database, authentication, and edge functions",
    dataProcessed: "User accounts, profiles, reading data, child profiles",
    location: "United States (AWS)",
    dpaStatus: "signed",
    privacyUrl: "https://supabase.com/privacy",
    riskTier: "high",
  },
  {
    name: "Stripe",
    role: "takes payments for Premium",
    purpose: "Payment processing for premium subscriptions",
    dataProcessed: "Email, payment information, subscription status",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://stripe.com/privacy",
    riskTier: "high",
  },
  {
    name: "Resend",
    role: "sends account and receipt email",
    purpose: "Transactional email delivery",
    dataProcessed: "Email addresses, transactional email content",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    riskTier: "high",
  },
  {
    name: "OpenAI",
    role: "writes story text and turns voice clips into text",
    purpose: "Writes the story text with an AI model; speech-to-text for voice commands and read-aloud practice",
    dataProcessed: "Story prompts; short voice clips recorded only after a tap on the microphone by a signed-in account (not stored by Time-2-Read; OpenAI does not train on API data; its API data-controls page, checked 22 Nov 2026, lists speech-to-text with no abuse-monitoring retention)",
    source: { label: "OpenAI API data controls", url: "https://developers.openai.com/api/docs/guides/your-data" },
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://openai.com/policies/privacy-policy",
    riskTier: "medium",
  },
  {
    name: "Anthropic",
    role: "is the fallback story writer",
    purpose: "AI fallback story generation (Claude)",
    dataProcessed: "Story prompts only — no personal information",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://www.anthropic.com/privacy",
    riskTier: "medium",
  },
  {
    name: "ElevenLabs",
    role: "reads stories aloud",
    purpose: "Text-to-speech narration",
    dataProcessed: "Story text only — no personal information",
    location: "United States",
    dpaStatus: "signed",
    privacyUrl: "https://elevenlabs.io/privacy",
    riskTier: "medium",
  },
  {
    name: "Runware",
    role: "draws the story pictures",
    purpose: "AI image generation for story illustrations",
    dataProcessed: "Image prompts only — no personal information",
    location: "Europe / United States",
    dpaStatus: "signed",
    privacyUrl: "https://runware.ai/privacy",
    riskTier: "medium",
  },
  {
    name: "Cloudflare",
    role: "hosts and protects the site and sees visitors’ IP addresses",
    purpose: "Hosting, CDN, DDoS protection, Web Application Firewall",
    dataProcessed: "IP addresses, request metadata",
    location: "Global",
    dpaStatus: "signed",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "low",
  },
  {
    name: "GitHub",
    role: "holds the source code and runs the builds (no user data)",
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
    const title = "Subprocessors We Use to Run Time-2-Read | Spry VSL LLC";
    const desc = "The subprocessors Spry VSL LLC uses to run Time-2-Read: each company, the service it provides for us, and the kind of data it handles.";
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
          Last updated: November 22, 2026
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
        {TIERS.map(({ tier, question }) => {
          const tierProcessors = subprocessors.filter((s) => s.riskTier === tier);

          return (
            <section key={tier} className="mb-8" aria-labelledby={`tier-${tier}`}>
              <h2 id={`tier-${tier}`} className="text-lg font-semibold mb-2">{question}</h2>
              <p className="text-sm text-muted-foreground mb-4" data-testid={`tier-answer-${tier}`}>{tierAnswer(tierProcessors)}</p>
              <div className="grid gap-4">
                {tierProcessors.map((sp) => (
                  <Card key={sp.name} className="min-w-0 [overflow-wrap:anywhere]">
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
                        {sp.source && (
                          <a
                            href={sp.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm inline-block"
                          >
                            {sp.source.label} →
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}

        <article className="prose max-w-none dark:prose-invert mt-8">
          <h2>How will we tell you about changes to subprocessors?</h2>
          <p>
            We will update this page and notify affected customers before adding a new
            subprocessor. We also update it when one is removed.
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
            <Button variant="outline">{uiText("Privacy Policy")}</Button>
          </Link>
        </div>
      </section>
      <SiteFooterNav />
    </main>
  );
};

export default Subprocessors;
