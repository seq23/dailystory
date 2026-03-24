import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  useEffect(() => {
    const title = "Privacy Policy | Time2Read by Spry VSL LLC";
    const desc = "Privacy Policy for Time2Read by Spry VSL LLC. Learn how we collect, use, and protect your data under GDPR, CCPA, and COPPA.";
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Effective date: January 1, {new Date().getFullYear()}</p>
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <section className="container mx-auto px-4 pb-12 space-y-6">
        <article className="prose max-w-none text-foreground/90">

          {/* GDPR Art. 13(1)(a) — Identity of controller */}
          <h2>1. Data Controller</h2>
          <p>
            <strong>Spry VSL LLC</strong> ("we", "us", "our") operates the Time2Read platform.<br />
            Privacy Contact: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
          </p>

          {/* GDPR Art. 13(1)(c) — Purpose and legal basis */}
          <h2>2. Information We Collect &amp; Legal Basis</h2>
          <table className="text-sm w-full">
            <thead>
              <tr><th className="text-left p-2">Data Category</th><th className="text-left p-2">Purpose</th><th className="text-left p-2">Legal Basis (GDPR Art. 6)</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2">Account info (email, password)</td><td className="p-2">Authentication &amp; account management</td><td className="p-2">Contract performance (Art. 6(1)(b))</td></tr>
              <tr><td className="p-2">Child profile (display name, age, grade)</td><td className="p-2">Personalized reading experience</td><td className="p-2">Parental consent (Art. 6(1)(a), Art. 8)</td></tr>
              <tr><td className="p-2">Reading progress &amp; quiz scores</td><td className="p-2">Learning analytics &amp; progress tracking</td><td className="p-2">Legitimate interest (Art. 6(1)(f))</td></tr>
              <tr><td className="p-2">Payment data (via Stripe)</td><td className="p-2">Subscription billing</td><td className="p-2">Contract performance (Art. 6(1)(b))</td></tr>
              <tr><td className="p-2">Usage data (pages viewed, features used)</td><td className="p-2">Service improvement</td><td className="p-2">Consent (Art. 6(1)(a)) via cookie banner</td></tr>
              <tr><td className="p-2">Device/browser info</td><td className="p-2">Security &amp; fraud prevention</td><td className="p-2">Legitimate interest (Art. 6(1)(f))</td></tr>
            </tbody>
          </table>

          {/* GDPR Art. 13(1)(e) — Recipients */}
          <h2>3. Data Sharing &amp; Third-Party Processors</h2>
          <p>We do <strong>not sell</strong> personal information. Data is shared only with processors who act on our behalf:</p>
          <ul>
            <li><strong>Supabase</strong> — Database, authentication (US, SCCs in place)</li>
            <li><strong>OpenAI</strong> — AI story generation (US, DPA, no training on API data)</li>
            <li><strong>Stripe</strong> — Payment processing (US, PCI DSS Level 1)</li>
            <li><strong>ElevenLabs</strong> — Text-to-speech narration (US, DPA)</li>
            <li><strong>Runware</strong> — AI image generation (EU/US, DPA)</li>
            <li><strong>Resend</strong> — Transactional email (US, SOC 2)</li>
            <li><strong>Cloudflare</strong> — Hosting, CDN, and DDoS protection (Global, DPA)</li>
            <li><strong>GitHub</strong> — Source code hosting and CI/CD (US, DPA, SOC 2)</li>
          </ul>
          <p>See our <Link to="/data-transfers" className="text-primary hover:underline">International Data Transfers</Link> page for full details and safeguards.</p>

          {/* GDPR Art. 13(2)(a) — Retention */}
          <h2>4. Data Retention</h2>
          <ul>
            <li><strong>Account data:</strong> Until account deletion</li>
            <li><strong>Reading progress:</strong> Until account deletion</li>
            <li><strong>Usage analytics:</strong> 90 days (anonymized after)</li>
            <li><strong>Security/audit logs:</strong> 90 days</li>
            <li><strong>Debug logs:</strong> 30 days</li>
            <li><strong>COPPA incident records:</strong> 2 years</li>
            <li><strong>Inactive accounts:</strong> Anonymized after 3 years of inactivity</li>
          </ul>

          {/* COPPA */}
          <h2>5. Children's Privacy (COPPA &amp; GDPR Art. 8)</h2>
          <p>Time2Read is designed for families and educational use. We comply with:</p>
          <ul>
            <li><strong>COPPA (US):</strong> Parental consent required for users under 13</li>
            <li><strong>GDPR Art. 8 (EU):</strong> Parental consent required for users under 16</li>
            <li>We collect only the minimum information necessary</li>
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
            <li><strong>Withdraw Consent</strong> (Art. 7(3)) — Withdraw non-essential processing consent in account settings</li>
          </ul>
          <p>
            <strong>California Residents:</strong> See our <Link to="/ccpa" className="text-primary hover:underline">CCPA Notice</Link> for additional rights.
          </p>

          {/* GDPR Art. 13(1)(f) — International Transfers */}
          <h2>7. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in the United States. We protect these transfers using
            Standard Contractual Clauses (SCCs) and Data Processing Agreements with all processors.
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
          <Link to="/vendors" className="text-primary hover:underline">Vendor List</Link>
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
