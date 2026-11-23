import { uiText } from "@/i18n/uiText";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Trash2, Eye, Ban, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooterNav } from "@/components/SiteFooterNav";

// Categories of personal information collected in the past 12 months (Cal. Civ. Code 1798.110).
const CATEGORIES = [
  { category: "Identifiers", examples: "Name, email address, account name", purpose: "Account creation and communication" },
  { category: "Internet Activity", examples: "Reading history, interactions with content", purpose: "Personalization and improvement" },
  { category: "Inferences", examples: "Reading preferences, skill level", purpose: "Content personalization" },
];

const CCPA = () => {
  useEffect(() => {
    const title = "California Privacy Rights (CCPA) | Time-2-Read by Spry VSL LLC";
    const desc = "Your California Consumer Privacy Act rights with Time-2-Read: the right to know, the right to delete and the right to opt out, and how to ask us.";
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
    link.setAttribute("href", window.location.origin + "/ccpa");

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + "/ccpa",
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {uiText("Back to Home")}
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">California Privacy Rights</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Your rights under the California Consumer Privacy Act (CCPA)
        </p>
        <p className="text-sm text-muted-foreground">
          Effective date: {new Date().getFullYear()}-01-01
        </p>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <article className="prose max-w-none dark:prose-invert">
          <p className="lead">
            If you are a California resident, you have specific rights regarding your personal information
            under the California Consumer Privacy Act (CCPA). This page explains those rights and how to
            exercise them.
          </p>

          <div className="grid gap-6 md:grid-cols-2 my-8 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Right to Know
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You have the right to request that we disclose what personal information we collect,
                use, disclose, and sell about you.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Right to Delete
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You have the right to request deletion of your personal information that we have
                collected from you.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-teal-500" />
                  Right to Correct
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You have the right to request that we correct inaccurate personal information
                we maintain about you.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-orange-500" />
                  Right to Opt-Out
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You have the right to opt-out of the sale of your personal information. Note: We do
                not sell personal information.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Right to Non-Discrimination
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                We will not discriminate against you for exercising any of your CCPA rights.
              </CardContent>
            </Card>
          </div>

          <h2>Categories of Personal Information We Collect</h2>
          <p>In the past 12 months, we have collected the following categories of personal information:</p>

          {/* One stacked row per category, not a four-column table: at 320 px the table's cells ran
              off the screen (#182, 22 Nov 2026), as /privacy's did. */}
          <ul className="not-prose divide-y border-y my-4 text-sm">
            {CATEGORIES.map((row) => (
              <li key={row.category} className="py-3" data-testid="category-row">
                <p className="font-medium">{row.category} <span className="font-normal text-muted-foreground">· Collected: Yes</span></p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Examples:</span> {row.examples}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Purpose:</span> {row.purpose}</p>
              </li>
            ))}
          </ul>

          <h2>Do Not Sell My Personal Information</h2>
          <p>
            <strong>We do not sell your personal information.</strong> Spry VSL LLC does not sell, rent,
            or trade personal information to third parties for monetary consideration.
          </p>
          <p>
            While we do not sell personal information, we may share data with service providers who help
            us operate our services (such as cloud hosting, payment processing, email delivery and the AI
            features). Most have signed or accepted a data processing agreement that limits them to the
            purposes we specify; for a few it is still in progress. Each provider and its status is on
            our <Link to="/subprocessors">Subprocessors page</Link>.
          </p>

          <h2>How to Exercise Your Rights</h2>
          <p>To submit a request to exercise your California privacy rights, you may:</p>
          <ul>
            <li>
              <strong>Email us:</strong>{" "}
               <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
            </li>
            <li>
              <strong>Use your account settings:</strong> Log in and navigate to "My Account" to delete
              your account directly
            </li>
            <li>
              <strong>Mail us:</strong> Spry VSL LLC, Privacy Request, [Address]
            </li>
          </ul>

          <p>
            We will verify your identity before processing your request. You may designate an authorized
            agent to make a request on your behalf by providing written authorization.
          </p>

          <h2>Response Timing</h2>
          <p>
            We will respond to verifiable consumer requests within 45 days. If we require more time
            (up to 90 days total), we will inform you of the reason and extension period in writing.
          </p>

          <h2>Children Under 16</h2>
          <p>
            We do not knowingly sell the personal information of consumers under 16 years of age. Our
            service is designed with children's privacy in mind, and we comply with COPPA (Children's
            Online Privacy Protection Act) requirements.
          </p>

          <h2>{uiText("Contact Us")}</h2>
          <p>
            If you have questions about this notice or your California privacy rights, please contact us:
          </p>
          <p>
            Spry VSL LLC
            <br />
            Email: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
             <br />
             General inquiries: <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>
          </p>

          <h2>Changes to This Notice</h2>
          <p>
            We may update this CCPA notice from time to time. We will post the updated version on this
            page and update the effective date.
          </p>
        </article>

        <div className="mt-8 flex gap-4">
          <Link to="/privacy">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Full Privacy Policy
            </Button>
          </Link>
          <Link to="/terms">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              {uiText("Terms of Service")}
            </Button>
          </Link>
        </div>
      </section>
      <SiteFooterNav />
    </main>
  );
};

export default CCPA;
