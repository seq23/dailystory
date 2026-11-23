import { uiText } from "@/i18n/uiText";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { DPA_LABEL, subprocessors } from "@/data/subprocessors";

// GDPR Art. 13(1)(c): each kind of data, why we hold it and the legal basis.
const LEGAL_BASIS = [
  { category: "Account info (email, password)", purpose: "Authentication & account management", basis: "Contract performance (Art. 6(1)(b))" },
  { category: "Child profile (display name, age, grade)", purpose: "Personalized reading experience", basis: "Parental consent (Art. 6(1)(a), Art. 8)" },
  { category: "Reading progress & quiz scores", purpose: "Learning analytics & progress tracking", basis: "Legitimate interest (Art. 6(1)(f))" },
  { category: "Payment data (via Stripe)", purpose: "Subscription billing", basis: "Contract performance (Art. 6(1)(b))" },
  { category: "Usage data (pages viewed, features used)", purpose: "Service improvement", basis: "Consent (Art. 6(1)(a)) via cookie banner" },
  { category: "Voice clips (signed-in accounts only, after a tap on the microphone)", purpose: "Speech-to-text for story voice commands and read-aloud practice", basis: "Parental consent (Art. 6(1)(a), Art. 8)" },
  { category: "Device/browser info", purpose: "Security & fraud prevention", basis: "Legitimate interest (Art. 6(1)(f))" },
];

const Privacy = () => {
  useEffect(() => {
    const title = "Privacy Policy | Time-2-Read by Spry VSL LLC";
    const desc = "Privacy Policy for Time-2-Read by Spry VSL LLC. Learn how we collect, use, and protect your data under GDPR, CCPA, and COPPA.";
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', window.location.origin + '/privacy');

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, description: desc, url: window.location.origin + '/privacy' });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> {uiText("Back to Home")}
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{uiText("Privacy Policy")}</h1>
        <p className="text-muted-foreground mt-2">Effective date: November 22, 2026</p>
        <p className="text-xs text-muted-foreground">Last updated: November 22, 2026</p>
      </header>

      <section className="container mx-auto px-4 pb-12 space-y-6">
        <article className="prose max-w-none text-foreground/90">

          {/* GDPR Art. 13(1)(a) — Identity of controller */}
          <h2>1. Data Controller</h2>
          <p>
            <strong>Spry VSL LLC</strong> ("we", "us", "our") operates the Time-2-Read platform.<br />
            Privacy Contact: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
          </p>

          {/* GDPR Art. 13(1)(c) — Purpose and legal basis */}
          <h2>2. Information We Collect &amp; Legal Basis</h2>
          {/* A stacked list, not a table: at 320 px the three-column table clipped its cells
              (review of #182, 22 Nov 2026), the same fix as /data-transfers. */}
          <ul className="not-prose divide-y border-y my-4 text-sm">
            {LEGAL_BASIS.map((row) => (
              <li key={row.category} className="py-3" data-testid="basis-row">
                <p className="font-medium">{row.category}</p>
                <p className="text-muted-foreground"><span className="sr-only">Purpose: </span>{row.purpose}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Legal basis (GDPR Art. 6):</span> {row.basis}</p>
              </li>
            ))}
          </ul>

          {/* GDPR Art. 13(1)(e) — Recipients */}
          <h2>3. Data Sharing &amp; Third-Party Processors</h2>
          <p>We do <strong>not sell</strong> personal information. Data is shared only with processors who act on our behalf:</p>
          <ul>
            {subprocessors.map((sp) => (
              <li key={sp.name}>
                <strong>{sp.name}</strong> — {sp.purpose} ({sp.location}; {DPA_LABEL[sp.dpa]})
              </li>
            ))}
          </ul>
          <p>What each one receives is listed on our <Link to="/subprocessors" className="text-primary hover:underline">Subprocessors</Link> page.</p>
          <p>See our <Link to="/data-transfers" className="text-primary hover:underline">International Data Transfers</Link> page for full details and safeguards.</p>

          {/* GDPR Art. 13(2)(a) — Retention */}
          <h2>4. Data Retention</h2>
          <ul>
            <li><strong>Account data:</strong> Until account deletion</li>
            <li><strong>Reading progress:</strong> Until account deletion</li>
            <li><strong>Usage analytics:</strong> 90 days (anonymized after)</li>
            <li><strong>Security/audit logs:</strong> 90 days</li>
            <li><strong>Debug logs:</strong> 30 days</li>
            <li><strong>Voice clips:</strong> Not kept by us. The recording and the words heard are used once to act on the command or score the practice, then dropped. OpenAI does not train on API data, and its API data-controls page (<a className="underline" href="https://developers.openai.com/api/docs/guides/your-data">developers.openai.com/api/docs/guides/your-data</a>, checked 22 Nov 2026) lists speech-to-text (<code>/v1/audio/transcriptions</code>) with no abuse-monitoring retention</li>
            <li><strong>COPPA incident records:</strong> 2 years</li>
            <li><strong>Inactive accounts:</strong> Anonymized after 3 years of inactivity</li>
          </ul>

          {/* COPPA */}
          <h2>5. Children's Privacy (COPPA &amp; GDPR Art. 8)</h2>
          <p>Time-2-Read is designed for families and educational use. We comply with:</p>
          <ul>
            <li><strong>COPPA (US):</strong> Parental consent required for users under 13</li>
            <li><strong>GDPR Art. 8 (EU):</strong> Parental consent required for users under 16</li>
            <li>We collect only the minimum information necessary</li>
            <li>
              <strong>Voice:</strong> the microphone is shown only to signed-in accounts, and opens only when a child
              or adult taps it; signed-out guests get no microphone, and our speech-to-text service refuses them. A
              story voice command clip (up to 7 seconds) or a read-aloud practice clip is sent to OpenAI to turn
              speech into text. When the browser can measure the sound level (current Chrome, Safari, Edge and
              Firefox can), a clip with no speech in it is not sent. We do not store the recording or the
              transcript.
            </li>
            <li>Parents can review, delete, or refuse further collection of their child's data</li>
            <li>Personal information incidents are logged and parents are notified</li>
          </ul>
          <p>
            If you believe we have collected data from a child without proper consent, contact us immediately at{" "}
            <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>.
          </p>

          {/* GDPR Art. 13(2)(b) — Your Rights */}
          <h2>6. Your Rights</h2>
          <p>Under GDPR, CCPA, and applicable law, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> (Art. 15) — Download all your data via the "Download My Data" button in account settings</li>
            <li><strong>Rectification</strong> (Art. 16) — Edit your profile information at any time</li>
            <li><strong>Erasure</strong> (Art. 17) — Delete your account and all associated data</li>
            <li><strong>Restrict Processing</strong> (Art. 18) — Freeze your account without deleting it</li>
            <li><strong>Data Portability</strong> (Art. 20) — Export your data in JSON format</li>
            <li><strong>Object</strong> (Art. 21) — Opt out of analytics/marketing via cookie preferences</li>
            <li><strong>{uiText("Withdraw Consent")}</strong> (Art. 7(3)) — Withdraw non-essential processing consent in account settings</li>
          </ul>
          <p>
            <strong>California Residents:</strong> See our <Link to="/ccpa" className="text-primary hover:underline">CCPA Notice</Link> for additional rights.
          </p>

          {/* GDPR Art. 13(1)(f) — International Transfers */}
          <h2>7. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in the United States. Where a processor has signed or
            accepted a data processing agreement with us, that agreement covers the transfer, including Standard
            Contractual Clauses (SCCs) where it provides them; for some processors the agreement is still in
            progress. Our Subprocessors page shows each processor's status.
            See our <Link to="/data-transfers" className="text-primary hover:underline">Data Transfers</Link> page for details.
          </p>

          {/* Cookies */}
          <h2>8. Cookies &amp; Tracking</h2>
          <p>
            We use essential cookies for core functionality. With your consent, we may use analytics cookies
            to understand usage patterns. You can manage preferences through our cookie consent banner or
            withdraw consent in account settings.
          </p>

          {/* Security */}
          <h2>9. Data Security</h2>
          <p>
            We employ administrative, technical, and physical safeguards including:
          </p>
          <ul>
            <li>Encryption in transit (TLS 1.2+) and at rest</li>
            <li>Row-level security on all database tables</li>
            <li>JWT-authenticated API endpoints</li>
            <li>Rate limiting and input validation</li>
            <li>Automated security monitoring and anomaly detection</li>
            <li>Regular data cleanup and minimization</li>
          </ul>

          {/* Breach Notification */}
          <h2>10. Data Breach Notification</h2>
          <p>
            In the event of a personal data breach, we will notify the relevant supervisory authority within
            72 hours as required by GDPR Article 33. If the breach poses a high risk to your rights and freedoms,
            we will notify affected users directly via email (GDPR Article 34).
          </p>

          {/* GDPR Art. 13(2)(d) — Complaints */}
          <h2>11. Complaints</h2>
          <p>
            You have the right to lodge a complaint with your local data protection authority.
            We encourage you to contact us first at{" "}
            <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">privacy@time-2-read.com</a>{" "}
            so we can address your concerns directly.
          </p>

          {/* Contact */}
          <h2>12. Contact Us</h2>
          <div className="not-prose bg-muted/50 p-4 rounded-lg">
            <p className="font-semibold">Spry VSL LLC</p>
            <p className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" />
              <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">
                privacy@time-2-read.com
              </a>
              <span className="text-muted-foreground">(Privacy &amp; DPO inquiries)</span>
            </p>
          </div>

          {/* Changes */}
          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated via
            email or prominent notice on our Services. The updated version will be posted on this page with
            a revised effective date.
          </p>
        </article>

        {/* Related Links */}
        <div className="flex flex-wrap gap-4 text-sm pt-4 border-t">
          <Link to="/gdpr" className="text-primary hover:underline">GDPR Rights</Link>
          <Link to="/ccpa" className="text-primary hover:underline">CCPA Rights</Link>
          <Link to="/ferpa" className="text-primary hover:underline">FERPA Compliance</Link>
          <Link to="/data-transfers" className="text-primary hover:underline">Data Transfers</Link>
          <Link to="/subprocessors" className="text-primary hover:underline">Subprocessors</Link>
          <Link to="/terms" className="text-primary hover:underline">{uiText("Terms of Service")}</Link>
        </div>
      </section>
      <SiteFooterNav />
    </main>
  );
};

export default Privacy;
