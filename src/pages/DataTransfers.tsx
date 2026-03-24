import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataTransfers = () => {
  useEffect(() => {
    document.title = "International Data Transfers | Time2Read";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'How Spry VSL LLC handles international data transfers for Time2Read under GDPR Articles 44-49.');
  }, []);

  const processors = [
    {
      name: "Supabase (Database & Auth)",
      location: "United States",
      purpose: "User authentication, data storage, edge functions",
      safeguards: "Standard Contractual Clauses (SCCs), SOC 2 Type II certified",
      website: "https://supabase.com/privacy",
    },
    {
      name: "OpenAI (AI Story Generation)",
      location: "United States",
      purpose: "AI-powered story text generation",
      safeguards: "Data Processing Agreement, no training on user data via API",
      website: "https://openai.com/policies/privacy-policy",
    },
    {
      name: "Stripe (Payments)",
      location: "United States",
      purpose: "Payment processing for premium subscriptions",
      safeguards: "PCI DSS Level 1, SCCs, Privacy Shield successor",
      website: "https://stripe.com/privacy",
    },
    {
      name: "ElevenLabs (Text-to-Speech)",
      location: "United States",
      purpose: "Voice narration for stories",
      safeguards: "Data Processing Agreement, audio not stored after generation",
      website: "https://elevenlabs.io/privacy",
    },
    {
      name: "Runware (Image Generation)",
      location: "Europe / United States",
      purpose: "AI illustration generation for story pages",
      safeguards: "Data Processing Agreement, images generated on-demand",
      website: "https://runware.ai",
    },
    {
      name: "Resend (Email)",
      location: "United States",
      purpose: "Transactional emails (consent verification, notifications)",
      safeguards: "Data Processing Agreement, SOC 2 Type II",
      website: "https://resend.com/legal/privacy-policy",
    },
  ];

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
        <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
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
              Spry VSL LLC operates the Time2Read platform. As our infrastructure providers are primarily
              based in the United States, personal data of EU/EEA users may be transferred outside the
              European Economic Area.
            </p>
            <p>We rely on the following legal mechanisms to ensure adequate protection:</p>
            <ul>
              <li><strong>Standard Contractual Clauses (SCCs)</strong> — EU-approved contractual safeguards with each processor</li>
              <li><strong>Data Processing Agreements (DPAs)</strong> — binding agreements defining data handling obligations</li>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Processor</th>
                    <th className="text-left py-3 px-2 font-semibold">Location</th>
                    <th className="text-left py-3 px-2 font-semibold">Purpose</th>
                    <th className="text-left py-3 px-2 font-semibold">Safeguards</th>
                  </tr>
                </thead>
                <tbody>
                  {processors.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">
                        <a href={p.website} target="_blank" rel="noopener noreferrer"
                           className="text-primary hover:underline inline-flex items-center gap-1">
                          {p.name} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{p.location}</td>
                      <td className="py-3 px-2 text-muted-foreground">{p.purpose}</td>
                      <td className="py-3 px-2 text-muted-foreground">{p.safeguards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <a href="mailto:privacy@time2read.com" className="text-primary hover:underline">
                privacy@time2read.com
              </a>{" "}
              for any questions about international data transfers.
            </p>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <Link to="/gdpr" className="text-primary hover:underline">GDPR Rights</Link>
          <Link to="/ccpa" className="text-primary hover:underline">CCPA Rights</Link>
          <Link to="/vendors" className="text-primary hover:underline">Vendor List</Link>
        </div>
      </section>
    </main>
  );
};

export default DataTransfers;
