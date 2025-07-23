import { useState } from "react";
import { WelcomeHero } from "@/components/WelcomeHero";
import { UserInfoForm, type UserInfo } from "@/components/UserInfoForm";
import { StoryDisplay } from "@/components/StoryDisplay";

type AppState = "welcome" | "form" | "story";

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleGetStarted = () => {
    setCurrentState("form");
  };

  const handleFormSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentState("story");
  };

  const handleBackToWelcome = () => {
    setCurrentState("welcome");
    setUserInfo(null);
  };

  const handleBackToForm = () => {
    setCurrentState("form");
  };

  const handleNewStory = () => {
    setCurrentState("form");
  };

  switch (currentState) {
    case "welcome":
      return <WelcomeHero onGetStarted={handleGetStarted} />;
    
    case "form":
      return (
        <UserInfoForm 
          onSubmit={handleFormSubmit} 
          onBack={handleBackToWelcome}
        />
      );
    
    case "story":
      return userInfo ? (
        <StoryDisplay 
          userInfo={userInfo}
          onHome={handleBackToWelcome}
          onNewStory={handleNewStory}
        />
      ) : null;
    
    default:
      return <WelcomeHero onGetStarted={handleGetStarted} />;
  }
};

export default Index;
