import { uiText } from "@/i18n/uiText";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { DPA_LABEL, subprocessors } from "@/data/subprocessors";

const DataTransfers = () => {
  useEffect(() => {
    document.title = "International Data Transfers | Time-2-Read";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'How Spry VSL LLC handles international data transfers for Time-2-Read under GDPR Articles 44-49, and where to send any question about them.');
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-8">
        <Link to="/privacy">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Privacy Policy
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">International Data Transfers</h1>
        </div>
        <p className="text-muted-foreground">
          How Spry VSL LLC handles cross-border data transfers under GDPR Articles 44–49.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Last updated: November 22, 2026</p>
      </header>

      <section className="container mx-auto px-4 pb-12 space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Transfer Safeguards
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-sm">
            <p>
              Spry VSL LLC operates the Time-2-Read platform. As our infrastructure providers are primarily
              based in the United States, personal data of EU/EEA users may be transferred outside the
              European Economic Area.
            </p>
            <p>We rely on the following legal mechanisms to ensure adequate protection:</p>
            <ul>
              <li><strong>Standard Contractual Clauses (SCCs)</strong> — EU-approved contractual safeguards, where a processor's agreement provides them</li>
              <li><strong>Data Processing Agreements (DPAs)</strong> — binding agreements defining data handling obligations, with the processors marked "DPA signed" below</li>
              <li><strong>Technical safeguards</strong> — encryption in transit (TLS 1.2+) and at rest for all data</li>
              <li><strong>Access controls</strong> — role-based access with row-level security on all database tables</li>
            </ul>
          </CardContent>
        </Card>

        {/* Processor Table */}
        <Card>
          <CardHeader>
            <CardTitle>Third-Party Sub-Processors</CardTitle>
          </CardHeader>
          <CardContent>
            {/* A stacked list, not a table: at phone width a four-column table hid Purpose and DPA
                off-screen behind a sideways scroll (320 px capture, 22 Nov 2026). */}
            <ul className="divide-y">
              {subprocessors.map((p) => (
                <li key={p.name} className="py-3 text-sm" data-testid="transfer-row">
                  <p className="font-medium">
                    {p.privacyUrl ? (
                      <a href={p.privacyUrl} target="_blank" rel="noopener noreferrer"
                         className="text-primary hover:underline inline-flex items-center gap-1">
                        {p.name} <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                      </a>
                    ) : p.name}
                  </p>
                  <p className="text-muted-foreground">{p.purpose}</p>
                  <p className="text-muted-foreground">
                    {p.location} · {DPA_LABEL[p.dpa]}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights Regarding Transfers</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-sm">
            <p>As a data subject, you have the right to:</p>
            <ul>
              <li>Request information about international transfers of your data</li>
              <li>Obtain a copy of the safeguards in place (SCCs/DPAs)</li>
              <li>Lodge a complaint with your local data protection authority</li>
              <li>Request restriction or deletion of your data at any time</li>
            </ul>
            <p>
              Contact our privacy team at{" "}
              <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">
                privacy@time-2-read.com
              </a>{" "}
              for any questions about international data transfers.
            </p>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/privacy" className="text-primary hover:underline">{uiText("Privacy Policy")}</Link>
          <Link to="/gdpr" className="text-primary hover:underline">GDPR Rights</Link>
          <Link to="/ccpa" className="text-primary hover:underline">CCPA Rights</Link>
          <Link to="/subprocessors" className="text-primary hover:underline">Subprocessors</Link>
        </div>
      </section>
      <SiteFooterNav />
    </main>
  );
};

export default DataTransfers;
