import { useState, useEffect } from "react";
import { WelcomeHero } from "@/components/WelcomeHero";
import { UserInfoForm } from "@/components/UserInfoForm";
import { FreeReadingSession } from "@/components/FreeReadingSession";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";
import { LoginScreen } from "@/components/LoginScreen";
import type { UserInfo } from "@/types";

type GuestState = "welcome" | "form" | "reading" | "upgrade" | "login";

export const GuestExperience = () => {
  const [currentState, setCurrentState] = useState<GuestState>("welcome");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Check for query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new-story') {
      // User came from session ended page wanting to start new story
      setCurrentState("form");
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentState("form");
  };

  const handleFormSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentState("reading");
  };

  const handleBackToWelcome = () => {
    setCurrentState("welcome");
    setUserInfo(null);
  };

  const handleUpgrade = () => {
    setCurrentState("upgrade");
  };

  const handleCreateAccount = () => {
    setCurrentState("login");
  };

  const handleSubscribe = (planId: string) => {
    // TODO: Implement Stripe payment integration
    console.log("Subscribe to plan:", planId);
  };

  const handleBackToReading = () => {
    setCurrentState("reading");
  };

  switch (currentState) {
    case "welcome":
      return (
        <div className="animate-fade-in">
          <WelcomeHero onGetStarted={handleGetStarted} onSignIn={handleCreateAccount} />
        </div>
      );
    
    case "form":
      return (
        <div className="animate-fade-in">
          <UserInfoForm 
            onSubmit={handleFormSubmit} 
            onBack={handleBackToWelcome}
          />
        </div>
      );
    
    case "reading":
      return userInfo ? (
        <div className="animate-fade-in">
          <FreeReadingSession 
            userInfo={userInfo}
            onUpgrade={handleUpgrade}
            onCreateAccount={handleCreateAccount}
            onHome={() => setCurrentState("welcome")}
            onNewStory={() => setCurrentState("form")}
            onSessionEnded={(stats) => {
              // Navigate to SessionEnded page with stats
              window.location.href = `/session-ended?stats=${encodeURIComponent(JSON.stringify({...stats, isPremium: false}))}`
            }}
          />
        </div>
      ) : null;
    
    case "upgrade":
      return (
        <div className="animate-fade-in">
          <PremiumUpgrade
            onBack={handleBackToReading}
            onSubscribe={handleSubscribe}
          />
        </div>
      );
    
    case "login":
      return (
        <div className="animate-fade-in">
          <LoginScreen 
            userInfo={userInfo} 
            onBack={userInfo ? handleBackToReading : handleBackToWelcome} 
          />
        </div>
      );
    
    default:
      return (
        <div className="animate-fade-in">
          <WelcomeHero onGetStarted={handleGetStarted} />
        </div>
      );
  }
};