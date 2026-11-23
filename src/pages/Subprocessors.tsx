import { uiText } from "@/i18n/uiText";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { DPA_LABEL, subprocessors, type Subprocessor } from "@/data/subprocessors";


/** Each tier's question; the answer under it is built from that tier's vendors (tierAnswer). */
const TIERS = [
  { tier: "high", question: "Which subprocessors handle accounts, payments, email and school rosters? (High risk)" },
  { tier: "medium", question: "Which subprocessors run the reading and AI features? (Medium risk)" },
  { tier: "low", question: "Which subprocessors host, build and measure the site? (Low risk)" },
] as const;

/** "Supabase runs …; Stripe takes …; Resend sends …." from the tier's own vendor list. */
export const tierAnswer = (vendors: Pick<Subprocessor, "name" | "role">[]) =>
  `${vendors.map((v) => `${v.name} ${v.role}`).join("; ")}.`;


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
        <Link to="/privacy">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Privacy Policy
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
                          <Badge variant="outline" className="text-xs" data-testid={`dpa-${sp.dpa}`}>{DPA_LABEL[sp.dpa]}</Badge>
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

        {/* Styled like the tier sections above, not as prose. */}
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
