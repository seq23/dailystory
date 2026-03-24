import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Download, Trash2, Edit, Eye, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function GDPR() {
  useEffect(() => {
    document.title = "GDPR Rights - Time2Read";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Your GDPR rights as a Time2Read user. Learn about data access, portability, erasure, and how we protect your privacy under EU data protection law.');
    }
  }, []);

  const rights = [
    {
      icon: Eye,
      title: "Right of Access (Article 15)",
      description: "You have the right to obtain confirmation whether we process your personal data and access to that data.",
      action: "Request a copy of your data via your account settings or by contacting us."
    },
    {
      icon: Edit,
      title: "Right to Rectification (Article 16)",
      description: "You have the right to correct inaccurate personal data and complete incomplete data.",
      action: "Edit your profile directly in the app or contact us for assistance."
    },
    {
      icon: Trash2,
      title: "Right to Erasure (Article 17)",
      description: "You have the right to request deletion of your personal data ('right to be forgotten').",
      action: "Use the 'Delete Account' feature in your account settings."
    },
    {
      icon: Shield,
      title: "Right to Restriction (Article 18)",
      description: "You have the right to restrict processing of your personal data in certain circumstances.",
      action: "Use the 'Freeze My Account' feature in your account settings to restrict processing."
    },
    {
      icon: Download,
      title: "Right to Data Portability (Article 20)",
      description: "You have the right to receive your data in a structured, machine-readable format.",
      action: "Use the 'Download My Data' feature in your account settings."
    },
    {
      icon: FileText,
      title: "Right to Object (Article 21)",
      description: "You have the right to object to processing based on legitimate interests or direct marketing.",
      action: "Use the cookie preferences or 'Withdraw Consent' button in your account settings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">GDPR Rights</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Data Protection Rights</h2>
          <p className="text-muted-foreground mb-4">
            If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, 
            you have certain rights under the General Data Protection Regulation (GDPR) regarding your personal data.
          </p>
          <p className="text-muted-foreground">
            Time2Read is committed to respecting your privacy and providing transparency about how we 
            collect, use, and protect your information.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Rights Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Rights Under GDPR</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rights.map((right, index) => (
              <Card key={index} className="border-muted/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <right.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{right.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-2">{right.description}</CardDescription>
                  <p className="text-sm text-foreground/80">
                    <strong>How to exercise:</strong> {right.action}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Data Controller Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Data Controller</h2>
          <Card className="border-muted/40">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p><strong>Organization:</strong> Spry VSL LLC</p>
                <p><strong>DPO/Privacy Contact:</strong> <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">privacy@time-2-read.com</a></p>
                <p><strong>Website:</strong> <a href="https://time2read.lovable.app" className="text-primary hover:underline">time2read.lovable.app</a></p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Legal Basis */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Legal Basis for Processing</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>We process your personal data under the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contract (Article 6(1)(b)):</strong> Processing necessary to provide our service, 
                including account management, story generation, and reading progress tracking.
              </li>
              <li>
                <strong>Consent (Article 6(1)(a)):</strong> For optional features like marketing emails 
                and analytics cookies. You can withdraw consent at any time.
              </li>
              <li>
                <strong>Legal Obligation (Article 6(1)(c)):</strong> For compliance with COPPA 
                (Children's Online Privacy Protection Act) and financial record-keeping.
              </li>
              <li>
                <strong>Legitimate Interest (Article 6(1)(f)):</strong> For security monitoring, 
                fraud prevention, and service improvement.
              </li>
            </ul>
          </div>
        </section>

        {/* International Transfers */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">International Data Transfers</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your data may be transferred to and processed in the United States. We ensure appropriate 
            safeguards are in place through:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Standard Contractual Clauses (SCCs) with our processors</li>
            <li>Data Processing Agreements with all vendors</li>
            <li>Technical security measures including encryption</li>
          </ul>
        </section>

        {/* Response Times */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Response Timeframes</h2>
          <p className="text-sm text-muted-foreground">
            We will respond to your data rights requests within <strong>30 days</strong> of receipt. 
            If we need more time due to the complexity of your request, we will notify you within 
            the first 30 days and explain the reason for the extension.
          </p>
        </section>

        {/* Supervisory Authority */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Right to Complain</h2>
          <p className="text-sm text-muted-foreground mb-4">
            If you believe we have not handled your data appropriately, you have the right to lodge 
            a complaint with your local data protection supervisory authority.
          </p>
          <p className="text-sm text-muted-foreground">
            We encourage you to contact us first at{" "}
             <a href="mailto:privacy@time-2-read.com" className="text-primary hover:underline">
              privacy@time-2-read.com
            </a>{" "}
            so we can address your concerns directly.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Contact Us About Your Rights</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    To exercise any of your GDPR rights or ask questions about our data practices, 
                    please contact our privacy team.
                  </p>
                  <a 
                    href="mailto:privacy@time2read.com" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    privacy@time2read.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Related Links */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Related Policies</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link to="/ccpa" className="text-primary hover:underline">CCPA Rights</Link>
            <Link to="/vendors" className="text-primary hover:underline">Our Vendors</Link>
          </div>
        </section>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground mt-8 text-center">
          Last updated: January 22, 2026
        </p>
      </main>
    </div>
  );
}
