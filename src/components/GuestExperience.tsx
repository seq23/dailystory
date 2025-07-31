import { useState } from "react";
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
      return <WelcomeHero onGetStarted={handleGetStarted} onSignIn={handleCreateAccount} />;
    
    case "form":
      return (
        <UserInfoForm 
          onSubmit={handleFormSubmit} 
          onBack={handleBackToWelcome}
        />
      );
    
    case "reading":
      return userInfo ? (
        <FreeReadingSession 
          userInfo={userInfo}
          onUpgrade={handleUpgrade}
          onCreateAccount={handleCreateAccount}
        />
      ) : null;
    
    case "upgrade":
      return (
        <PremiumUpgrade
          onBack={handleBackToReading}
          onSubscribe={handleSubscribe}
        />
      );
    
    case "login":
      // If user has no userInfo, they came from welcome screen, so go back to welcome
      // If user has userInfo, they came from reading session, so go back to reading
      return <LoginScreen userInfo={userInfo} onBack={userInfo ? handleBackToReading : handleBackToWelcome} />;
    
    default:
      return <WelcomeHero onGetStarted={handleGetStarted} />;
  }
};