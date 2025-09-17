import React from 'react';
import CleanStoryDisplay from "@/components/CleanStoryDisplay";
import { useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import type { UserInfo, SessionStats } from "@/types";

interface FreeReadingSessionProps {
  userInfo: UserInfo;
  onUpgrade: () => void;
  onCreateAccount: () => void;
  onHome?: () => void;
  onNewStory?: () => void;
  onSessionEnded?: (stats: SessionStats) => void;
  isPremium?: boolean;
}

export const FreeReadingSession: React.FC<FreeReadingSessionProps> = ({
  userInfo,
  onUpgrade,
  onCreateAccount,
  onHome,
  onNewStory,
  onSessionEnded,
  isPremium = false,
}) => {
  DebugLogger.log('ui', 'FreeReadingSession: Using new CleanStoryDisplay architecture');

  // Force-enable timer for guest sessions on entry
  useEffect(() => {
    try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
    try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
  }, []);
  
  return (
    <CleanStoryDisplay
      userInfo={userInfo}
      isPremium={isPremium}
      onSessionEnded={onSessionEnded || (() => {})}
      onHome={onHome || (() => {})}
      onUpgrade={onUpgrade}
      {...(onNewStory ? { onNewStory } : {})}
    />
  );
};