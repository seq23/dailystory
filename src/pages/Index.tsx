import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WelcomeHero } from "@/components/WelcomeHero";
import { UserInfoForm, type UserInfo } from "@/components/UserInfoForm";
import StoryDisplay from "@/components/StoryDisplay";

type AppState = "welcome" | "form" | "story";

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const navigate = useNavigate();

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
    setSessionStats(null);
  };

  const handleBackToForm = () => {
    setCurrentState("form");
    setSessionStats(null);
  };

  const handleNewStory = () => {
    setCurrentState("form");
    setSessionStats(null);
  };

  const handleSessionEnded = (stats?: any) => {
    setSessionStats(stats);
    navigate("/session-ended", { state: { sessionStats: stats } });
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
          onSessionEnded={handleSessionEnded}
        />
      ) : null;
    
    default:
      return <WelcomeHero onGetStarted={handleGetStarted} />;
  }
};

export default Index;
