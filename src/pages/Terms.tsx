import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    const title = "Terms of Service | Time2Read LLC";
    const desc = "Terms of Service for Time2Read LLC. Understand the rules for using our Services.";
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
            These Terms of Service ("Terms") govern your access to and use of the Services provided by Time2Read LLC ("we",
            "us", or "our"). By using our Services, you agree to these Terms.
          </p>

          <h2>Use of Services</h2>
          <ul>
            <li>You must be at least 13 years old to create an account, or have parental consent.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to use the Services only for lawful purposes and in accordance with these Terms.</li>
          </ul>

          <h2>Subscriptions and Payments</h2>
          <ul>
            <li>Premium features may require a paid subscription. Prices and features are subject to change.</li>
            <li>All payments are processed by third-party providers (e.g., Stripe). Additional terms may apply.</li>
            <li>Cancel your subscription at any time via your account settings or by contacting support.</li>
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
          </ul>

          <h2>Disclaimer and Limitation of Liability</h2>
          <p>
            The Services are provided "as is" without warranties of any kind. To the maximum extent permitted by law, Time2Read
            LLC is not liable for indirect, incidental, or consequential damages.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate your access to the Services at any time for violations of these Terms or for security
            reasons.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction where Time2Read LLC is established, without regard to its
            conflict of law provisions.
          </p>

          <h2>Contact</h2>
          <p>
            Time2Read LLC<br />
            Email: <a href="mailto:hello@time2read.app">hello@time2read.app</a>
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will post the updated version on this page and update the effective
            date above.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Terms;
