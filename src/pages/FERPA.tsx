import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Shield, Lock, Trash2, Users, FileText, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function FERPA() {
  useEffect(() => {
    document.title = "FERPA Compliance - Time2Read";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Time2Read FERPA compliance information for schools and educational institutions. Learn how we protect student data and education records.');
    }
  }, []);

  const commitments = [
    {
      icon: Lock,
      title: "Data Minimization",
      description: "We collect only the minimum data necessary to provide our educational reading service. No sensitive personal information beyond what's needed for personalization."
    },
    {
      icon: Shield,
      title: "No Third-Party Marketing",
      description: "We never use student data for advertising or marketing purposes. Student information is never sold or shared for commercial gain."
    },
    {
      icon: Users,
      title: "School Administrator Control",
      description: "Schools maintain control over student accounts and data. Administrators can request data exports or deletion at any time."
    },
    {
      icon: Trash2,
      title: "Data Deletion",
      description: "Upon request or at the end of the school relationship, all student data is permanently deleted within 30 days."
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
              <GraduationCap className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">FERPA Compliance</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-foreground">Student Data Protection</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              FERPA Aware
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">
            Time2Read is committed to protecting student privacy and complying with the Family Educational 
            Rights and Privacy Act (FERPA). This page outlines our practices for schools and educational 
            institutions using our platform.
          </p>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-800">
                <strong>For Schools:</strong> If you're considering Time2Read for your classroom or institution, 
                we're happy to discuss our data practices, sign data protection agreements, and work with your 
                IT and legal teams to ensure compliance with your requirements.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* What is FERPA */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">What is FERPA?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The Family Educational Rights and Privacy Act (FERPA) is a federal law that protects the 
            privacy of student education records. It applies to all schools that receive funding from 
            the U.S. Department of Education.
          </p>
          <p className="text-sm text-muted-foreground">
            Under FERPA, schools must:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground mt-2">
            <li>Obtain consent before disclosing student education records</li>
            <li>Provide parents and eligible students access to education records</li>
            <li>Allow correction of inaccurate or misleading information</li>
            <li>Ensure third-party vendors protect student data appropriately</li>
          </ul>
        </section>

        <Separator className="my-8" />

        {/* Our Commitments */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Our Commitments to Schools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {commitments.map((item, index) => (
              <Card key={index} className="border-muted/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Data We Collect */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Student Data We Collect</h2>
          <p className="text-sm text-muted-foreground mb-4">
            When used in educational settings, Time2Read collects only the following:
          </p>
          
          <div className="space-y-4">
            <Card className="border-muted/40">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Required Data
                </h3>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>Display name (can be nickname or pseudonym)</li>
                  <li>Grade level (for reading level calibration)</li>
                  <li>Reading preferences (interests, favorite topics)</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-muted/40">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Learning Data (Generated Through Use)
                </h3>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>Reading session duration and progress</li>
                  <li>Comprehension quiz scores</li>
                  <li>Vocabulary words encountered</li>
                  <li>Stories read and saved</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-red-50 bg-red-50/50">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 text-red-800">Data We Do NOT Collect</h3>
                <ul className="list-disc pl-6 text-sm text-red-700 space-y-1">
                  <li>Social Security numbers</li>
                  <li>Home addresses</li>
                  <li>Phone numbers</li>
                  <li>Biometric data</li>
                  <li>Location data</li>
                  <li>Photos of students (avatars are selected, not uploaded)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* School Administrator Rights */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">School Administrator Rights</h2>
          <p className="text-sm text-muted-foreground mb-4">
            School administrators acting on behalf of their institution have the following rights:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Data Access</p>
                <p className="text-xs text-muted-foreground">Request and receive copies of all student data associated with your school</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Data Correction</p>
                <p className="text-xs text-muted-foreground">Request corrections to inaccurate student information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Data Deletion</p>
                <p className="text-xs text-muted-foreground">Request complete deletion of all student data for your institution</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Usage Reports</p>
                <p className="text-xs text-muted-foreground">Receive aggregate reports on student reading progress and engagement</p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Data Protection Agreement */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Data Protection Agreements</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We offer customized Data Protection Agreements (DPAs) for schools and districts that include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>FERPA compliance commitments</li>
            <li>Data security requirements and certifications</li>
            <li>Breach notification procedures</li>
            <li>Data retention and deletion schedules</li>
            <li>Subprocessor disclosures</li>
            <li>Indemnification clauses</li>
          </ul>
        </section>

        {/* Annual Notification */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Annual Notification</h2>
          <p className="text-sm text-muted-foreground">
            Schools using Time2Read should include information about our service in their annual 
            FERPA notification to parents. We can provide template language for this notification 
            upon request.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">School Partnership Inquiries</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For schools and districts interested in using Time2Read, or to request a Data 
                    Protection Agreement, please contact our education team.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="mailto:schools@time2read.app" 
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      schools@time2read.app
                    </a>
                    <a 
                      href="mailto:privacy@time2read.com" 
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      privacy@time2read.com (Privacy inquiries)
                    </a>
                  </div>
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
            <Link to="/gdpr" className="text-primary hover:underline">GDPR Rights</Link>
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
