import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Database, Brain, Image, Volume2, CreditCard, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VendorInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  dataShared: string[];
  purpose: string;
  privacyUrl: string;
  dpaStatus: "compliant" | "pending" | "not-required";
}

const vendors: VendorInfo[] = [
  {
    name: "Supabase",
    description: "Database, authentication, and backend infrastructure",
    icon: <Database className="w-5 h-5" />,
    dataShared: ["Account information", "User preferences", "Reading progress", "Saved stories"],
    purpose: "Core platform functionality including user accounts, data storage, and authentication",
    privacyUrl: "https://supabase.com/privacy",
    dpaStatus: "compliant",
  },
  {
    name: "OpenAI",
    description: "AI-powered story generation",
    icon: <Brain className="w-5 h-5" />,
    dataShared: ["Child's name (first name only)", "Age/grade level", "Reading preferences", "Story prompts"],
    purpose: "Generate personalized stories based on user preferences and reading level",
    privacyUrl: "https://openai.com/policies/privacy-policy",
    dpaStatus: "compliant",
  },
  {
    name: "Runware",
    description: "AI image generation",
    icon: <Image className="w-5 h-5" />,
    dataShared: ["Story context (no personal information)", "Visual scene descriptions"],
    purpose: "Create illustrations for stories",
    privacyUrl: "https://runware.ai/privacy",
    dpaStatus: "compliant",
  },
  {
    name: "ElevenLabs",
    description: "Text-to-speech and voice synthesis",
    icon: <Volume2 className="w-5 h-5" />,
    dataShared: ["Story text content", "Voice preferences"],
    purpose: "Read stories aloud with natural-sounding voices",
    privacyUrl: "https://elevenlabs.io/privacy",
    dpaStatus: "compliant",
  },
  {
    name: "Stripe",
    description: "Payment processing",
    icon: <CreditCard className="w-5 h-5" />,
    dataShared: ["Email address", "Payment information (handled directly by Stripe)"],
    purpose: "Process subscription payments securely",
    privacyUrl: "https://stripe.com/privacy",
    dpaStatus: "compliant",
  },
  {
    name: "Resend",
    description: "Email delivery service",
    icon: <Mail className="w-5 h-5" />,
    dataShared: ["Email address", "Email content"],
    purpose: "Send account-related emails, notifications, and parental consent requests",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    dpaStatus: "compliant",
  },
  {
    name: "Cloudflare",
    description: "Hosting, CDN, and DDoS protection",
    icon: <Shield className="w-5 h-5" />,
    dataShared: ["IP address", "Browser metadata", "Request data"],
    purpose: "Website hosting, content delivery, and security protection",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    dpaStatus: "compliant",
  },
  {
    name: "GitHub",
    description: "Source code hosting and CI/CD",
    icon: <Database className="w-5 h-5" />,
    dataShared: ["Source code (no user data)"],
    purpose: "Source code management and deployment pipelines",
    privacyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    dpaStatus: "compliant",
  },
];

const Vendors = () => {
  useEffect(() => {
    const title = "Third-Party Vendors | Spry VSL LLC";
    const desc = "Information about the third-party services we use to provide Time2Read.";
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", window.location.origin + "/vendors");

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + "/vendors",
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getDpaStatusBadge = (status: VendorInfo["dpaStatus"]) => {
    switch (status) {
      case "compliant":
        return <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-200">DPA Compliant</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-200">DPA Pending</Badge>;
      case "not-required":
        return <Badge variant="outline">DPA Not Required</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Third-Party Vendors</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Transparency about the services that power Time2Read
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().getFullYear()}-01-01
        </p>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <article className="prose max-w-none dark:prose-invert mb-8">
          <p className="lead">
            Time2Read partners with trusted third-party service providers to deliver our platform.
            This page provides transparency about who these vendors are, what data they may receive,
            and how they protect your information.
          </p>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 not-prose my-6">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Our Commitment to Data Protection
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                All vendors are contractually bound to protect your data and use it only for the
                purposes we specify. We require Data Processing Agreements (DPAs) from vendors who
                process personal information.
              </p>
            </div>
          </div>
        </article>

        <div className="grid gap-6 md:grid-cols-2">
          {vendors.map((vendor) => (
            <Card key={vendor.name} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {vendor.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {vendor.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getDpaStatusBadge(vendor.dpaStatus)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Purpose</h4>
                  <p className="text-sm text-muted-foreground">{vendor.purpose}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Data Shared</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {vendor.dataShared.map((data, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                        {data}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <a
                    href={vendor.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View {vendor.name}'s Privacy Policy →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <article className="prose max-w-none dark:prose-invert mt-12">
          <h2>For Educational Institutions</h2>
          <p>
            If you are an educational institution considering Time2Read, we can provide:
          </p>
          <ul>
            <li>Copies of our Data Processing Agreements with vendors</li>
            <li>Security assessment documentation</li>
            <li>FERPA compliance information</li>
            <li>Custom data handling arrangements</li>
          </ul>
          <p>
            Please contact us at{" "}
            <a href="mailto:privacy@time-2-read.com">schools@time-2-read.com</a> for more information.
          </p>

          <h2>Questions?</h2>
          <p>
            If you have questions about our third-party vendors or how your data is handled, please
            contact us:
          </p>
          <p>
            Spry VSL LLC
            <br />
            Email: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
            <br />
            General inquiries: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
          </p>
        </article>

        <div className="mt-8 flex gap-4">
          <Link to="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
          <Link to="/terms">
            <Button variant="outline">Terms of Service</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Vendors;
