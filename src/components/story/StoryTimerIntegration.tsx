import React from 'react';
import { CollapsibleFloatingTimer } from "@/components/CollapsibleFloatingTimer";
import { DebugLogger } from '@/services/DebugLogger';

interface StoryTimerIntegrationProps {
  isPremium: boolean;
  timerEnabled: boolean;
  timeRemaining: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onReduceTime: () => void;
  onEndSession: () => void;
  onExtendTime?: () => void;
  onRestartTimer?: () => void;
  onKeepReadingUntimed?: () => void;
  onSaveStoryNow?: () => void;
  onDismiss: () => void;
}

export const StoryTimerIntegration: React.FC<StoryTimerIntegrationProps> = ({
  isPremium,
  timerEnabled,
  timeRemaining,
  isTimerRunning,
  onToggleTimer,
  onReduceTime,
  onEndSession,
  onExtendTime,
  onRestartTimer,
  onKeepReadingUntimed,
  onSaveStoryNow,
  onDismiss
}) => {
  const handleDismiss = () => {
    DebugLogger.log('ui', 'Timer dismissed by user');
    try {
      localStorage.setItem('readingTimerEnabled', '0');
    } catch (error) {
      DebugLogger.warn('ui', 'Failed to save timer preference', error);
    }
    
    onDismiss();
    window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: false }));
  };

  // Only show timer for guests (always) or premium users (when enabled)
  if (isPremium && !timerEnabled) {
    return null;
  }

  return (
    <CollapsibleFloatingTimer
      timeRemaining={timeRemaining}
      isReading={isTimerRunning}
      onToggleReading={onToggleTimer}
      onReduceTime={onReduceTime}
      onEndSession={onEndSession}
      onSessionEnded={onEndSession}
      isPremium={isPremium}
      onIncreaseTime={isPremium ? onExtendTime : undefined}
      onDismiss={handleDismiss}
      onRestartTimer={isPremium ? onRestartTimer : undefined}
      onKeepReadingUntimed={isPremium ? onKeepReadingUntimed : undefined}
      onSaveStoryNow={isPremium ? onSaveStoryNow : undefined}
    />
  );
};