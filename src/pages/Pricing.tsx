import { useEffect } from "react";
import PricingSection from "@/components/PricingSection";

const Pricing = () => {
  useEffect(() => {
    document.title = "Pricing | Time2Read - Free, Premium, Enterprise";

    const desc = "Compare Free, Premium, and Enterprise plans for Time2Read. Upgrade for unlimited reading, live generation, analytics, and more.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/pricing');

    // Structured data (Product + Offer)
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Time2Read Premium",
      description: desc,
      offers: {
        "@type": "Offer",
        price: "9.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main>
      <PricingSection />
    </main>
  );
};

export default Pricing;
