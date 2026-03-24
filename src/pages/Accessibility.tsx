import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Accessibility as AccessibilityIcon, Eye, Keyboard, Volume2, Monitor, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Accessibility = () => {
  useEffect(() => {
    const title = "Accessibility Statement | Spry VSL LLC";
    const desc = "Our commitment to digital accessibility. Learn about the accessibility features of Time2Read.";
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
    link.setAttribute("href", window.location.origin + "/accessibility");

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.origin + "/accessibility",
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
          <AccessibilityIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Accessibility Statement</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Our commitment to making reading accessible for everyone
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().getFullYear()}-01-01
        </p>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <article className="prose max-w-none dark:prose-invert">
          <p className="lead">
            Spry VSL LLC is committed to ensuring digital accessibility for people with disabilities.
            We are continually improving the user experience for everyone and applying the relevant
            accessibility standards.
          </p>

          <h2>Our Commitment</h2>
          <p>
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level.
            These guidelines explain how to make web content more accessible for people with disabilities
            and more user-friendly for everyone.
          </p>

          <div className="grid gap-6 md:grid-cols-2 my-8 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Visual Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>High color contrast ratios</li>
                  <li>Resizable text without loss of content</li>
                  <li>Alternative text for images</li>
                  <li>Dark mode support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-green-500" />
                  Keyboard Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>All interactive elements are keyboard accessible</li>
                  <li>Visible focus indicators</li>
                  <li>Logical tab order</li>
                  <li>Skip navigation links</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  Audio Features
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Text-to-speech read-aloud functionality</li>
                  <li>Adjustable playback speed</li>
                  <li>Volume controls</li>
                  <li>Pause, resume, and stop controls</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-orange-500" />
                  Screen Reader Support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Semantic HTML structure</li>
                  <li>ARIA labels where appropriate</li>
                  <li>Meaningful link text</li>
                  <li>Form field labels</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2>Accessibility Features</h2>
          <p>Time2Read includes the following accessibility features:</p>
          <ul>
            <li>
              <strong>Responsive Design:</strong> Our platform works on devices of all sizes, from mobile
              phones to desktop computers.
            </li>
            <li>
              <strong>Consistent Navigation:</strong> Navigation is consistent throughout the application
              to help users predict where to find content.
            </li>
            <li>
              <strong>Clear Language:</strong> We use clear, simple language appropriate for our young
              readers while maintaining accessibility for users with cognitive disabilities.
            </li>
            <li>
              <strong>Error Identification:</strong> Form errors are clearly identified and described
              to help users correct mistakes.
            </li>
            <li>
              <strong>Touch Targets:</strong> Interactive elements have adequate size for touch input.
            </li>
          </ul>

          <h2>Known Limitations</h2>
          <p>
            While we strive for full accessibility, some content may have limitations:
          </p>
          <ul>
            <li>
              <strong>AI-Generated Images:</strong> Images generated by AI may not always have detailed
              alternative text. We are working to improve this.
            </li>
            <li>
              <strong>Third-Party Content:</strong> Some third-party integrations may not meet all
              accessibility standards.
            </li>
            <li>
              <strong>PDF Downloads:</strong> Downloadable PDFs may have limited accessibility features.
            </li>
          </ul>

          <h2>Compatibility</h2>
          <p>Time2Read is designed to be compatible with:</p>
          <ul>
            <li>Major web browsers (Chrome, Firefox, Safari, Edge)</li>
            <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
            <li>Screen magnification software</li>
            <li>Speech recognition software</li>
          </ul>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of Time2Read. Please let us know if you
            encounter accessibility barriers:
          </p>

          <Card className="my-6 not-prose">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Report an Accessibility Issue</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Email us at{" "}
                    <a
                      href="mailto:accessibility@time2read.app"
                      className="text-primary hover:underline"
                    >
                      accessibility@time2read.app
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please include:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Description of the issue</li>
                    <li>Page or feature where it occurred</li>
                    <li>Device and browser you're using</li>
                    <li>Assistive technology (if applicable)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <p>
            We try to respond to accessibility feedback within 5 business days and to resolve issues
            within 30 days.
          </p>

          <h2>Assessment and Remediation</h2>
          <p>
            Time2Read assesses accessibility through a combination of automated testing tools and
            manual testing. We are committed to ongoing improvement and regularly review and update
            our accessibility practices.
          </p>

          <h2>Contact Us</h2>
          <p>
            For general inquiries or if you need assistance accessing any content on our platform:
          </p>
          <p>
            Spry VSL LLC
            <br />
            Email: <a href="mailto:hello@time2read.app">hello@time2read.app</a>
            <br />
            Accessibility: <a href="mailto:accessibility@time2read.app">accessibility@time2read.app</a>
          </p>
        </article>
      </section>
    </main>
  );
};

export default Accessibility;
