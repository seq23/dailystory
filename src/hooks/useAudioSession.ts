import { useState, useEffect, useRef } from 'react';
import type { UserInfo } from '@/types';

interface AudioSessionOptions {
  userInfo: UserInfo;
  isPremium: boolean;
  currentPage: number;
  contentHash?: string;
}

/**
 * Hook for managing audio session state and premium/free user limits
 * Handles per-session page tracking for free users
 */
export const useAudioSession = ({
  userInfo,
  isPremium,
  currentPage,
  contentHash
}: AudioSessionOptions) => {
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  const sessionKeyRef = useRef<string>('');

  // Generate unique session key
  useEffect(() => {
    const sessionId = sessionStorage.getItem('t2r_session_id') || Date.now().toString();
    if (!sessionStorage.getItem('t2r_session_id')) {
      sessionStorage.setItem('t2r_session_id', sessionId);
    }
    sessionKeyRef.current = `t2r_audio_session_${sessionId}`;
  }, []);

  // Load session data for current page
  useEffect(() => {
    if (isPremium) {
      setHasPlayedThisPage(false);
      return;
    }

    try {
      const sessionData = JSON.parse(sessionStorage.getItem(sessionKeyRef.current) || '{}');
      const pageKey = `page_${currentPage}_${contentHash?.slice(0, 8) || 'unknown'}`;
      setHasPlayedThisPage(Boolean(sessionData[pageKey]));
    } catch {
      setHasPlayedThisPage(false);
    }
  }, [currentPage, contentHash, isPremium]);

  // Mark page as played
  const markPageAsPlayed = () => {
    if (isPremium) return;

    try {
      const sessionData = JSON.parse(sessionStorage.getItem(sessionKeyRef.current) || '{}');
      const pageKey = `page_${currentPage}_${contentHash?.slice(0, 8) || 'unknown'}`;
      sessionData[pageKey] = true;
      sessionStorage.setItem(sessionKeyRef.current, JSON.stringify(sessionData));
      setHasPlayedThisPage(true);
    } catch (error) {
      console.warn('Failed to save audio session data:', error);
    }
  };

  // Reset page state on page/content change
  useEffect(() => {
    setHasPlayedThisPage(false);
  }, [currentPage, contentHash]);

  // Expose user name for vocabulary service
  useEffect(() => {
    (window as any).__currentUserName = userInfo?.name || 'guest';
  }, [userInfo?.name]);

  const canUseAudio = isPremium || !hasPlayedThisPage;
  const shouldShowCrown = !isPremium && hasPlayedThisPage;

  return {
    canUseAudio,
    shouldShowCrown,
    hasPlayedThisPage,
    markPageAsPlayed
  };
};