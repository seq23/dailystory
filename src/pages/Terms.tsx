import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    const title = "Terms of Service | Spry VSL LLC";
    const desc = "Terms of Service for Spry VSL LLC. Understand the rules for using our Services.";
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/terms');

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + '/terms'
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main>
      <header className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Effective date: {new Date().getFullYear()}-01-01</p>
      </header>
      <section className="container mx-auto px-4 pb-12 space-y-6">
        <article className="prose max-w-none">
          <p>
            These Terms of Service ("Terms") govern your access to and use of the Services provided by Spry VSL LLC dba Spry Labs ("we",
            "us", or "our"). By using our Services, you agree to these Terms.
          </p>

          <h2>Permitted Use</h2>
          <p>
            The Services are provided free of charge for <strong>individual, personal, and educational use</strong>. You may use the platform
            for your own learning, teaching, or non-commercial purposes without a license agreement.
          </p>

          <h2>Commercial Use Requires a License</h2>
          <p>
            <strong>Commercial use, institutional deployment, and integration into third-party platforms or products is strictly prohibited
            without a prior written license agreement from Spry Labs (Spry VSL LLC).</strong>
          </p>
          <p>This includes, but is not limited to:</p>
          <ul>
            <li>Deploying the platform or its content within correctional, institutional, or enterprise environments</li>
            <li>Integrating the Services into third-party applications, kiosks, tablets, or managed devices</li>
            <li>Reselling, sublicensing, white-labeling, or repackaging the Services or any portion thereof</li>
            <li>Using the Services as part of a paid product or service offering</li>
            <li>Bulk or programmatic access to the Services for commercial data collection or analysis</li>
          </ul>
          <p>
            To obtain a commercial license, contact us at{" "}
            <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">privacy@time-2-read.com</a>.
          </p>

          <h2>Unauthorized Commercial Deployment</h2>
          <p>
            <strong>Unauthorized commercial deployment of the Services constitutes a violation of these Terms of Service and
            applicable copyright law.</strong> Spry VSL LLC reserves all rights to pursue legal remedies, including but not limited
            to injunctive relief, damages, and recovery of legal fees, against any party that deploys the Services commercially
            without a valid written license agreement.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content, software, algorithms, designs, trademarks, and other intellectual property associated with the Services
            are the exclusive property of Spry VSL LLC. Nothing in these Terms grants any right, title, or interest in our
            intellectual property except the limited personal use license described above.
          </p>

          <h2>Age Verification</h2>
          <ul>
            <li>You must be at least 13 years old to create an account, or have verifiable parental consent.</li>
            <li>If you are creating an account for a child under 13, you represent that you are the parent or legal guardian.</li>
            <li>By creating an account, you confirm that the age information provided is accurate.</li>
          </ul>

          <h2>Use of Services</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to use the Services only for lawful purposes and in accordance with these Terms.</li>
            <li>You will not attempt to bypass any security measures or access controls.</li>
          </ul>

          <h2>Subscriptions and Payments</h2>
          <ul>
            <li>Premium features require a paid subscription. Prices and features are subject to change with notice.</li>
            <li>All payments are processed by Stripe. Additional terms may apply.</li>
            <li>Cancel your subscription at any time via your account settings.</li>
          </ul>

          <h2>Refund Policy</h2>
          <ul>
            <li>Monthly subscriptions: Refunds may be requested within 7 days of initial purchase.</li>
            <li>Annual subscriptions: Refunds may be requested within 14 days of initial purchase.</li>
            <li>Prorated refunds are not available for partial subscription periods.</li>
            <li>Refund requests can be submitted to <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>.</li>
          </ul>

          <h2>User Content</h2>
          <p>
            You retain ownership of the content you create or upload. By using our Services, you grant us a limited license to
            use your content solely to operate and improve the Services.
          </p>

          <h2>Prohibited Activities</h2>
          <ul>
            <li>Reverse engineering, scraping, or attempting to bypass access controls</li>
            <li>Uploading harmful, illegal, or infringing content</li>
            <li>Interfering with the security or integrity of the Services</li>
            <li>Using the Services to harm or exploit minors</li>
            <li>Sharing account credentials or subscription access</li>
            <li>Any commercial use without a valid written license agreement</li>
          </ul>

          <h2>Disclaimer and Limitation of Liability</h2>
          <p>
            The Services are provided "as is" without warranties of any kind. To the maximum extent permitted by law, Spry VSL
            LLC is not liable for indirect, incidental, or consequential damages.
          </p>

          <h2>Privacy</h2>
          <p>
            Your use of our Services is also governed by our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which describes how we collect, use,
            and protect your personal information. By using our Services, you agree to our Privacy Policy.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate your access to the Services at any time for violations of these Terms or for security
            reasons. You may delete your account at any time through your account settings.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, United States, without regard to its
            conflict of law provisions. Any disputes shall be resolved in the courts of Delaware.
          </p>

          <h2>Contact</h2>
          <p>
            Spry VSL LLC<br />
            Email: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will post the updated version on this page and update the effective
            date above. Material changes will be communicated via email or prominent notice on our Services.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Terms;
