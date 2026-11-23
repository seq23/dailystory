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
  /** Omitted only when the vendor publishes no privacy policy; the card then says so. */
  privacyUrl?: string;
  /** Where a claim on the card comes from, shown as its own link. */
  source?: { label: string; url: string };
  riskTier: "high" | "medium" | "low";
  /** What it does for us, finishing "<name> …"; the tier's answer sentence is built from these. */
  role: string;
  /** Hosts (or "esm.sh/<sdk>") our code calls or loads for this vendor; the page guard fails on a host in code that no card claims. */
  hosts: string[];
}

/** Each tier's question; the answer under it is built from that tier's vendors (tierAnswer). */
const TIERS = [
  { tier: "high", question: "Which subprocessors handle accounts, payments, email and school rosters? (High risk)" },
  { tier: "medium", question: "Which subprocessors run the reading and AI features? (Medium risk)" },
  { tier: "low", question: "Which subprocessors host, build and measure the site? (Low risk)" },
] as const;

/** "Supabase runs …; Stripe takes …; Resend sends …." from the tier's own vendor list. */
export const tierAnswer = (vendors: Pick<Subprocessor, "name" | "role">[]) =>
  `${vendors.map((v) => `${v.name} ${v.role}`).join("; ")}.`;

export const subprocessors: Subprocessor[] = [
  {
    name: "Supabase",
    role: "runs sign-in and the database (accounts, child profiles, reading data)",
    purpose: "Database, authentication, and edge functions",
    dataProcessed: "User accounts, profiles, reading data, child profiles",
    location: "United States (AWS)",
    privacyUrl: "https://supabase.com/privacy",
    riskTier: "high",
    hosts: ["supabase.co"],
  },
  {
    name: "Stripe",
    role: "takes payments for Premium",
    purpose: "Payment processing for premium subscriptions",
    dataProcessed: "Email, payment information, subscription status",
    location: "United States",
    privacyUrl: "https://stripe.com/privacy",
    riskTier: "high",
    hosts: ["stripe.com", "esm.sh/stripe"],
  },
  {
    name: "Resend",
    role: "sends account and receipt email",
    purpose: "Transactional email delivery",
    dataProcessed: "Email addresses, transactional email content",
    location: "United States",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    riskTier: "high",
    hosts: ["resend.com"],
  },
  {
    name: "ClassLink",
    role: "sends a school’s class rosters when a district connects it",
    purpose: "School roster import (OneRoster)",
    dataProcessed: "Student names and roster ids for the classes a school connects; we keep the first name and last initial",
    location: "United States",
    privacyUrl: "https://www.classlink.com/company/privacy",
    riskTier: "high",
    hosts: ["classlink.com"],
  },
  {
    name: "OpenRouter",
    role: "writes story text, quizzes and word help first",
    purpose: "AI text models (free models first, then one paid model)",
    dataProcessed: "Story prompts and text a reader asks about, with every child’s and family member’s name replaced by a stand-in before it leaves. Free models may log or train on prompts; the paid model is set to no data collection and zero retention",
    location: "United States",
    privacyUrl: "https://openrouter.ai/privacy",
    riskTier: "medium",
    hosts: ["openrouter.ai"],
  },
  {
    name: "Cloudflare Workers AI",
    role: "writes story text when OpenRouter’s free models don’t answer",
    purpose: "AI text model (Meta Llama) run by Cloudflare",
    dataProcessed: "Story prompts and text a reader asks about, with every child’s and family member’s name replaced by a stand-in before it leaves",
    location: "Global (Cloudflare network)",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "medium",
    hosts: ["api.cloudflare.com"],
  },
  {
    name: "OpenAI",
    role: "writes story text when the other text models fail and turns voice clips into text",
    purpose: "Last-resort story text model; speech-to-text for voice commands and read-aloud practice",
    dataProcessed: "Story prompts as written, including the child’s first name; short voice clips recorded only after a tap on the microphone by a signed-in account (not stored by Time-2-Read; OpenAI does not train on API data; its API data-controls page, checked 22 Nov 2026, lists speech-to-text with no abuse-monitoring retention)",
    source: { label: "OpenAI API data controls", url: "https://developers.openai.com/api/docs/guides/your-data" },
    location: "United States",
    privacyUrl: "https://openai.com/policies/privacy-policy",
    riskTier: "medium",
    hosts: ["openai.com"],
  },
  {
    name: "Lovable AI Gateway (Google Gemini)",
    role: "writes the one-line scene for each story picture",
    purpose: "AI model that turns a story page into a picture description",
    dataProcessed: "The story page’s text, with the child’s name replaced by a stand-in before it leaves",
    location: "Sweden (Lovable) and Google’s servers",
    privacyUrl: "https://lovable.dev/privacy",
    riskTier: "medium",
    hosts: ["ai.gateway.lovable.dev"],
  },
  {
    name: "ElevenLabs",
    role: "reads stories aloud and runs the talking voice helper",
    purpose: "Text-to-speech narration and voice conversation",
    dataProcessed: "Story text, which includes the child’s first name when the story uses it; words and explanations a reader taps to hear; in voice mode, what the reader says to the voice helper",
    location: "United States",
    privacyUrl: "https://elevenlabs.io/privacy",
    riskTier: "medium",
    hosts: ["elevenlabs.io"],
  },
  {
    name: "Runware",
    role: "draws the story pictures",
    purpose: "AI image generation for story illustrations",
    dataProcessed: "The picture scene, plus the reader’s avatar look, age and favorite color; never a name",
    location: "Europe / United States",
    privacyUrl: "https://runware.ai/privacy",
    riskTier: "medium",
    hosts: ["runware.ai"],
  },
  {
    name: "Free Dictionary API",
    role: "looks up a word when our own dictionary has no entry",
    purpose: "Word definitions",
    dataProcessed: "One word at a time, sent from our server with no account details",
    location: "Not published",
    riskTier: "medium",
    hosts: ["dictionaryapi.dev"],
  },
  {
    name: "Cloudflare",
    role: "hosts and protects the site and sees visitors’ IP addresses",
    purpose: "Hosting, CDN, DDoS protection, Web Application Firewall",
    dataProcessed: "IP addresses, request metadata",
    location: "Global",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "low",
    hosts: [],
  },
  {
    name: "Google Fonts",
    role: "serves the site’s fonts and sees visitors’ IP addresses",
    purpose: "Web fonts",
    dataProcessed: "IP addresses and browser details of every visitor",
    location: "Global",
    privacyUrl: "https://developers.google.com/fonts/faq/privacy",
    riskTier: "low",
    hosts: ["fonts.googleapis.com", "fonts.gstatic.com"],
  },
  {
    name: "Microsoft Clarity",
    role: "records how signed-out parents use the sign-in form",
    purpose: "Usage analytics on the parent sign-in and sign-up form only",
    dataProcessed: "Clicks, scrolls and page details on that form, and the visitor’s IP address; never loaded for a signed-in account or on children’s screens",
    location: "United States",
    privacyUrl: "https://www.microsoft.com/privacy/privacystatement",
    riskTier: "low",
    hosts: ["clarity.ms"],
  },
  {
    name: "GitHub",
    role: "holds the source code and runs the builds (no user data)",
    purpose: "Source code hosting and CI/CD pipelines",
    dataProcessed: "Source code only — no user data",
    location: "United States",
    privacyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    riskTier: "low",
    hosts: [],
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
              This page lists every company Time-2-Read sends data to, and what each one receives.
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
                  <Card key={sp.name} className="min-w-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-base">{sp.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 whitespace-nowrap">
                          {getRiskBadge(sp.riskTier)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="[overflow-wrap:anywhere]">
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
                        {sp.privacyUrl ? (
                          <a
                            href={sp.privacyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm mt-1 inline-block"
                          >
                            Privacy Policy →
                          </a>
                        ) : (
                          <p className="text-muted-foreground text-sm mt-1">Publishes no privacy policy</p>
                        )}
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

        {/* The typography plugin is not installed, so this is styled like the tier sections above. */}
        <article className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">How will we tell you about changes to subprocessors?</h2>
          <p className="text-muted-foreground">
            We update this list before a new subprocessor starts processing customer data.
            Schools and districts can ask us to email them when it changes.
          </p>
          <p className="text-muted-foreground">
            For questions about our subprocessors, contact{" "}
            <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">privacy@time-2-read.com</a>.
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
