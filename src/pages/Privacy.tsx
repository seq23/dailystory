import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    const title = "Privacy Policy | Time2Read LLC";
    const desc = "Privacy Policy for Time2Read LLC. Learn how we collect, use, and protect your data.";
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
    link.setAttribute('href', window.location.origin + '/privacy');

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + '/privacy'
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main>
      <header className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Effective date: {new Date().getFullYear()}-01-01</p>
      </header>
      <section className="container mx-auto px-4 pb-12 space-y-6">
        <article className="prose max-w-none">
          <p>
            This Privacy Policy describes how Time2Read LLC ("we", "us", or "our") collects, uses, and protects your
            personal information when you use our website, applications, and services (collectively, the "Services").
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Account information (name, email address, password)</li>
            <li>Child profile information (display name, age/grade level)</li>
            <li>Usage information (reading progress, preferences, interactions)</li>
            <li>Technical data (device type, browser, approximate location)</li>
          </ul>

          <h2>How We Use Information</h2>
          <ul>
            <li>To provide and personalize reading experiences</li>
            <li>To improve our Services and develop new features</li>
            <li>To communicate with you about updates and support</li>
            <li>To ensure safety, security, and compliance</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell personal information. We may share data with service providers (e.g., hosting, analytics, payments)
            who process it on our behalf under strict confidentiality and security obligations. For a complete list of our
            third-party vendors, please visit our <a href="/vendors">Vendors page</a>.
          </p>

          <h2>Children's Privacy (COPPA Compliance)</h2>
          <p>
            Our Services are designed for families and educational use. We are committed to complying with the Children's
            Online Privacy Protection Act (COPPA). We implement the following safeguards to protect children's data:
          </p>
          <ul>
            <li>We collect only the minimum information necessary to provide our Services</li>
            <li>We do not condition a child's participation on providing more information than reasonably necessary</li>
            <li>Parents/guardians can review, delete, or refuse further collection of their child's information</li>
            <li>We use secure data handling practices appropriate for children's information</li>
          </ul>
          <p>
            If you believe we have collected personal information from a child under 13 without proper consent,
            please contact us immediately at <a href="mailto:privacy@time2read.app">privacy@time2read.app</a>.
          </p>

          <h2>Data Security and Retention</h2>
          <p>
            We use administrative, technical, and physical safeguards to protect information, including encryption
            in transit and at rest. We retain data only as long as necessary to provide the Services and comply with
            legal obligations. Typical retention periods are:
          </p>
          <ul>
            <li>Account data: Until account deletion</li>
            <li>Reading progress: Until account deletion</li>
            <li>Usage analytics: 90 days (anonymized after)</li>
            <li>Security logs: 1 year</li>
          </ul>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your data.
            To exercise these rights, contact us at <a href="mailto:privacy@time2read.app">privacy@time2read.app</a>.
          </p>
          <p>
            <strong>California Residents:</strong> Please see our <a href="/ccpa">CCPA Notice</a> for additional rights
            under the California Consumer Privacy Act.
          </p>

          <h2>International Transfers</h2>
          <p>
            Your information may be transferred and processed outside your country. We take appropriate measures to protect your
            data in accordance with applicable laws, including using service providers with appropriate data protection agreements.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            We use essential cookies to provide our Services. With your consent, we may also use analytics cookies
            to understand how our Services are used. You can manage your cookie preferences through our cookie consent banner.
          </p>

          <h2>Contact Us</h2>
          <p>
            Time2Read LLC<br />
            Email: <a href="mailto:hello@time2read.app">hello@time2read.app</a><br />
            Privacy inquiries: <a href="mailto:privacy@time2read.app">privacy@time2read.app</a>
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version on this page and update the
            effective date above. Material changes will be communicated via email or prominent notice on our Services.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Privacy;
