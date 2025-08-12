import { useState, useEffect } from "react";
import { WelcomeHero } from "@/components/WelcomeHero";
import { UserInfoForm } from "@/components/UserInfoForm";
import { FreeReadingSession } from "@/components/FreeReadingSession";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";

import { LoginScreen } from "@/components/LoginScreen";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import type { UserInfo } from "@/types";
import { guestSession } from "@/utils/guestSession";
import { StorySessionCache } from "@/services/storySessionCache";
import { APP_CONFIG } from "@/config/appConfig";

type GuestState = "welcome" | "form" | "reading" | "upgrade" | "login";

export const GuestExperience = () => {
  const [currentState, setCurrentState] = useState<GuestState>("welcome");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Initialize security monitoring for guests
  useSecurityMonitoring();

// Check for query parameters on component mount and attempt auto-resume
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  // Safety: allow clearing any cached sessions via URL
  if (urlParams.get('clearSession') === '1') {
    try { guestSession.clearAll(); } catch {}
    try { StorySessionCache.clearCachedSession('guest'); } catch {}
    // Clean URL
    window.history.replaceState({}, '', '/');
  }
  
  if (action === 'new-story') {
    // User came from session ended page wanting to start new story
    setCurrentState("form");
    // Clean up the URL
    window.history.replaceState({}, '', '/');
    // Clear any previous guest session
    try { guestSession.clearAll(); } catch {}
    try { StorySessionCache.clearCachedSession('guest'); } catch {}
    return;
  }

  // Auto-resume guest session if enabled in config
  const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
  const viaUrl = allowOverride && urlParams.get('resume') === '1';
  const enableResume = APP_CONFIG.features.resumeOnRefresh.guest || viaUrl;

  if (!enableResume) return;

  // Auto-resume guest session if active and timer not expired
  try {
    if (guestSession.isActive()) {
      const endTs = guestSession.getTimerEndTs();
      const now = Date.now();
      if (endTs && endTs > now) {
        const info = guestSession.getUserInfo();
        if (info) {
          setUserInfo(info);
          setCurrentState("reading");
          try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
          try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
          return;
        }
      }
      // Expired or invalid -> clear
      guestSession.clearAll();
      StorySessionCache.clearCachedSession('guest');
    }
  } catch {}
}, []);

  // Ensure reading timer is always enabled for guest sessions
  useEffect(() => {
    if (currentState === "reading") {
      try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
      try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
    }
  }, [currentState]);

  const handleGetStarted = () => {
    setCurrentState("form");
  };

const handleFormSubmit = (info: UserInfo) => {
  setUserInfo(info);
  try { guestSession.setActive(true); guestSession.saveUserInfo(info); } catch {}
  try { StorySessionCache.clearCachedSession('guest'); } catch {}
  setCurrentState("reading");
};

const handleBackToWelcome = () => {
  setCurrentState("welcome");
  setUserInfo(null);
  try { guestSession.clearAll(); } catch {}
  try { StorySessionCache.clearCachedSession('guest'); } catch {}
};

  const handleUpgrade = () => {
    setCurrentState("login");
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
            isPremium={false}
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
            isPremium={false}
onSessionEnded={(stats) => {
  // Clear guest session and navigate to SessionEnded page with stats
  try { guestSession.clearAll(); } catch {}
  try { StorySessionCache.clearCachedSession('guest'); } catch {}
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