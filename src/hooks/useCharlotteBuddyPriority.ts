/**
 * Charlotte Buddy Priority Hook
 * Ensures Charlotte gets absolute priority when the "Buddy" button is pressed
 * Manages audio handoff between story reading and voice conversation
 */
import { useEffect, useRef } from 'react';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { DebugLogger } from '@/services/DebugLogger';

interface BuddyPriorityState {
  isActive: boolean;
  previousAudioSystem: string | null;
  buddySessionId: string | null;
}

export const useCharlotteBuddyPriority = () => {
  const buddyStateRef = useRef<BuddyPriorityState>({
    isActive: false,
    previousAudioSystem: null,
    buddySessionId: null
  });

  useEffect(() => {
    // Listen for buddy activation events
    const handleBuddyActivation = (event: CustomEvent) => {
      const { isActive, sessionId } = event.detail || {};
      
      if (isActive && !buddyStateRef.current.isActive) {
        activateCharlotteBuddy(sessionId);
      } else if (!isActive && buddyStateRef.current.isActive) {
        deactivateCharlotteBuddy();
      }
    };

    // Listen for voice session state changes
    const handleVoiceSessionChange = (event: CustomEvent) => {
      const { status, sessionId } = event.detail || {};
      
      if (status === 'connected' && buddyStateRef.current.buddySessionId === sessionId) {
        DebugLogger.log('audio', 'Charlotte Buddy: Voice session connected', { sessionId });
        // Charlotte buddy is now active and has voice control
      } else if (status === 'disconnected' && buddyStateRef.current.buddySessionId === sessionId) {
        DebugLogger.log('audio', 'Charlotte Buddy: Voice session disconnected', { sessionId });
        deactivateCharlotteBuddy();
      }
    };

    // Setup event listeners
    window.addEventListener('charlotte:buddy:toggle', handleBuddyActivation as EventListener);
    window.addEventListener('voice:session:change', handleVoiceSessionChange as EventListener);

    return () => {
      // Cleanup: Ensure Charlotte buddy is properly deactivated
      if (buddyStateRef.current.isActive) {
        deactivateCharlotteBuddy();
      }
      
      window.removeEventListener('charlotte:buddy:toggle', handleBuddyActivation as EventListener);
      window.removeEventListener('voice:session:change', handleVoiceSessionChange as EventListener);
    };
  }, []);

  const activateCharlotteBuddy = (sessionId?: string) => {
    DebugLogger.log('audio', 'Charlotte Buddy Priority: Activating', { sessionId });
    
    // Store current audio system state
    const coordinator = (window as any).__SimpleAudioCoordinator;
    const currentSystem = coordinator?.getActiveSystem();
    
    if (currentSystem && currentSystem !== 'charlotte-buddy') {
      buddyStateRef.current.previousAudioSystem = currentSystem;
      
      // Stop current audio gracefully
      DebugLogger.log('audio', `Charlotte Buddy: Stopping ${currentSystem} to take priority`);
      window.dispatchEvent(new CustomEvent('audio:stop', { 
        detail: { system: currentSystem, reason: 'charlotte-buddy-priority' } 
      }));
    }

    // Activate Charlotte buddy with highest priority
    const buddyServices = charlotteVoiceService.charlotteVoiceBuddy();
    buddyServices.requestCharlotteSpeech();
    
    // Update state
    buddyStateRef.current = {
      isActive: true,
      previousAudioSystem: buddyStateRef.current.previousAudioSystem,
      buddySessionId: sessionId || `buddy-${Date.now()}`
    };

    // Notify system that Charlotte buddy is active
    window.dispatchEvent(new CustomEvent('audio:priority:changed', { 
      detail: { 
        system: 'charlotte-buddy', 
        priority: 6, 
        sessionId: buddyStateRef.current.buddySessionId 
      } 
    }));

    DebugLogger.log('audio', 'Charlotte Buddy Priority: Activated successfully', {
      buddySessionId: buddyStateRef.current.buddySessionId,
      previousSystem: buddyStateRef.current.previousAudioSystem
    });
  };

  const deactivateCharlotteBuddy = () => {
    if (!buddyStateRef.current.isActive) return;

    DebugLogger.log('audio', 'Charlotte Buddy Priority: Deactivating', {
      buddySessionId: buddyStateRef.current.buddySessionId,
      previousSystem: buddyStateRef.current.previousAudioSystem
    });

    // Release Charlotte's audio lock
    const buddyServices = charlotteVoiceService.charlotteVoiceBuddy();
    buddyServices.releaseCharlotteSpeech();

    // Restore previous audio system if it was interrupted
    if (buddyStateRef.current.previousAudioSystem) {
      DebugLogger.log('audio', `Charlotte Buddy: Restoring ${buddyStateRef.current.previousAudioSystem}`);
      
      // Give a brief moment before restoring to avoid conflicts
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('audio:restore', { 
          detail: { 
            system: buddyStateRef.current.previousAudioSystem,
            reason: 'charlotte-buddy-deactivated'
          } 
        }));
      }, 100);
    }

    // Clear state
    buddyStateRef.current = {
      isActive: false,
      previousAudioSystem: null,
      buddySessionId: null
    };

    // Notify system that Charlotte buddy priority is released
    window.dispatchEvent(new CustomEvent('audio:priority:released', { 
      detail: { system: 'charlotte-buddy' } 
    }));

    DebugLogger.log('audio', 'Charlotte Buddy Priority: Deactivated successfully');
  };

  // Manual activation/deactivation functions
  const activateBuddy = () => {
    window.dispatchEvent(new CustomEvent('charlotte:buddy:toggle', { 
      detail: { isActive: true, sessionId: `manual-${Date.now()}` } 
    }));
  };

  const deactivateBuddy = () => {
    window.dispatchEvent(new CustomEvent('charlotte:buddy:toggle', { 
      detail: { isActive: false } 
    }));
  };

  // Check if Charlotte buddy is currently active
  const isBuddyActive = () => buddyStateRef.current.isActive;

  // Get current buddy session information
  const getBuddySession = () => ({
    isActive: buddyStateRef.current.isActive,
    sessionId: buddyStateRef.current.buddySessionId,
    previousSystem: buddyStateRef.current.previousAudioSystem
  });

  return {
    activateBuddy,
    deactivateBuddy,
    isBuddyActive,
    getBuddySession
  };
};