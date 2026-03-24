import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Trash2, Eye, Ban, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CCPA = () => {
  useEffect(() => {
    const title = "California Privacy Rights (CCPA) | Spry VSL LLC";
    const desc = "Your California Consumer Privacy Act rights. Learn about your rights to know, delete, and opt-out.";
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
            Back to Home
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Examples</th>
                  <th>Collected</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Identifiers</strong></td>
                  <td>Name, email address, account name</td>
                  <td>Yes</td>
                  <td>Account creation and communication</td>
                </tr>
                <tr>
                  <td><strong>Internet Activity</strong></td>
                  <td>Reading history, interactions with content</td>
                  <td>Yes</td>
                  <td>Personalization and improvement</td>
                </tr>
                <tr>
                  <td><strong>Geolocation</strong></td>
                  <td>Approximate location (country/region)</td>
                  <td>Yes</td>
                  <td>Content localization</td>
                </tr>
                <tr>
                  <td><strong>Audio/Visual</strong></td>
                  <td>Voice recordings (if using read-aloud features)</td>
                  <td>Optional</td>
                  <td>Reading assessment features</td>
                </tr>
                <tr>
                  <td><strong>Inferences</strong></td>
                  <td>Reading preferences, skill level</td>
                  <td>Yes</td>
                  <td>Content personalization</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Do Not Sell My Personal Information</h2>
          <p>
            <strong>We do not sell your personal information.</strong> Spry VSL LLC does not sell, rent,
            or trade personal information to third parties for monetary consideration.
          </p>
          <p>
            While we do not sell personal information, we may share data with service providers who help
            us operate our services (such as cloud hosting, payment processing, and email delivery). These
            providers are contractually bound to use your information only for the purposes we specify.
          </p>

          <h2>How to Exercise Your Rights</h2>
          <p>To submit a request to exercise your California privacy rights, you may:</p>
          <ul>
            <li>
              <strong>Email us:</strong>{" "}
              <a href="mailto:privacy@time2read.com">privacy@time2read.com</a>
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

          <h2>Contact Us</h2>
          <p>
            If you have questions about this notice or your California privacy rights, please contact us:
          </p>
          <p>
            Spry VSL LLC
            <br />
            Email: <a href="mailto:privacy@time2read.com">privacy@time2read.com</a>
            <br />
            General inquiries: <a href="mailto:hello@time2read.app">hello@time2read.app</a>
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
              Terms of Service
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CCPA;
