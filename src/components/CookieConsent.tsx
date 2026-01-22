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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          {!showCustomize ? (
            // Main consent banner
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    We Value Your Privacy 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, provide personalized content, 
                    and analyze our traffic. You can choose to accept all cookies or customize your preferences.
                    Read our{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    for more information.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 -mt-1"
                  onClick={handleEssentialOnly}
                  aria-label="Close and use essential cookies only"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomize(true)}
                  className="order-3 sm:order-1"
                >
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEssentialOnly}
                  className="order-2"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="order-1 sm:order-3"
                >
                  Accept All
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

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleEssentialOnly}>
                  Reject All
                </Button>
                <Button size="sm" onClick={handleSaveCustom}>
                  Save Preferences
                </Button>
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
