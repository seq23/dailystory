import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, X } from "lucide-react";
import { Link } from "react-router-dom";

type ConsentStatus = "pending" | "accepted" | "essential" | "customized";

interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = "cookie-consent-status";
const PREFERENCES_KEY = "cookie-preferences";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = localStorage.getItem(CONSENT_KEY);
    if (!consentStatus) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (status: ConsentStatus, prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    
    // Dispatch custom event for any analytics that might be listening
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { 
      detail: { status, preferences: prefs } 
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveConsent("accepted", allAccepted);
  };

  const handleEssentialOnly = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    saveConsent("essential", essentialOnly);
  };

  const handleSaveCustom = () => {
    saveConsent("customized", preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-2 sm:p-4 animate-in slide-in-from-bottom duration-300" data-testid="cookie-banner">
      <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className={showCustomize ? "p-4 sm:p-6" : "p-3 sm:p-4"}>
          {!showCustomize ? (
            // A thin bar: one line and two choices, so it never covers the form underneath.
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-sm text-foreground flex-1">
                <Cookie className="inline w-4 h-4 mr-1 text-primary align-[-2px]" aria-hidden />
                We use cookies to run the site and, if you allow, to see what helps.{" "}
                <Link to="/privacy" className="text-primary underline">Privacy</Link>
              </p>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setShowCustomize(true)} className="min-h-10">
                  Choices
                </Button>
                <Button size="sm" variant="outline" onClick={handleEssentialOnly} className="min-h-10">
                  Only needed
                </Button>
                <Button size="sm" onClick={handleAcceptAll} className="min-h-10">
                  OK, allow all
                </Button>
              </div>
            </div>
          ) : (
            // Customize preferences view
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Cookie Preferences</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomize(false)}
                >
                  ← Back
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">Essential Cookies</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">Analytics Cookies</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">Marketing Cookies</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to deliver personalized advertisements.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-between items-center">
                <a href="/privacy" className="text-xs text-muted-foreground hover:underline">
                  Privacy Policy · DPO: privacy@time-2-read.com
                </a>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEssentialOnly}>
                    Reject All
                  </Button>
                  <Button size="sm" onClick={handleSaveCustom}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Utility function to check cookie consent status
export const getCookieConsent = (): {
  status: ConsentStatus | null;
  preferences: CookiePreferences;
} => {
  const status = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
  const prefsString = localStorage.getItem(PREFERENCES_KEY);
  const preferences: CookiePreferences = prefsString
    ? JSON.parse(prefsString)
    : { essential: true, analytics: false, marketing: false };

  return { status, preferences };
};

// Utility function to check if analytics are allowed
export const isAnalyticsAllowed = (): boolean => {
  const { preferences } = getCookieConsent();
  return preferences.analytics;
};
