import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { DebugLogger } from '@/services/DebugLogger';
import type { UserInfo } from '@/types';

export interface StoryMetadataState {
  cachedUserId: string;
  originalStoryLength: number | null;
  lastEndingPageIndex: number | null;
  stableSessionId: string;
  storySource: 'ai' | 'fallback' | 'emergency' | 'unknown' | null;
  specialRequestDraft: string;
}

export interface StoryMetadataActions {
  setCachedUserId: React.Dispatch<React.SetStateAction<string>>;
  setOriginalStoryLength: React.Dispatch<React.SetStateAction<number | null>>;
  setLastEndingPageIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setStorySource: React.Dispatch<React.SetStateAction<'ai' | 'fallback' | 'emergency' | 'unknown' | null>>;
  setSpecialRequestDraft: React.Dispatch<React.SetStateAction<string>>;
  updateCachedUserId: () => Promise<void>;
}

interface UseStoryMetadataProps {
  userInfo: UserInfo;
  isPremium: boolean;
}

export const useStoryMetadata = ({ userInfo, isPremium }: UseStoryMetadataProps) => {
  const [cachedUserId, setCachedUserId] = useState<string>(userInfo.name || 'premium');
  const [originalStoryLength, setOriginalStoryLength] = useState<number | null>(null);
  const [lastEndingPageIndex, setLastEndingPageIndex] = useState<number | null>(null);
  const [storySource, setStorySource] = useState<'ai' | 'fallback' | 'emergency' | 'unknown' | null>(null);
  const [specialRequestDraft, setSpecialRequestDraft] = useState(userInfo?.specialRequest || "");
  
  // Stable session ID for consistent image caching across the entire story session
  const [stableSessionId] = useState(() => generateSessionIdWithPrefix(isPremium ? 'premium' : 'guest'));

  // Cache user ID for performance - update when auth state changes
  const updateCachedUserId = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCachedUserId(user.id);
      }
    } catch (error) {
      DebugLogger.warn('auth', 'Failed to cache user ID', error);
    }
  }, []);

  useEffect(() => {
    if (isPremium) {
      updateCachedUserId();
    }
  }, [isPremium, updateCachedUserId]);

  const state: StoryMetadataState = {
    cachedUserId,
    originalStoryLength,
    lastEndingPageIndex,
    stableSessionId,
    storySource,
    specialRequestDraft,
  };

  const actions: StoryMetadataActions = {
    setCachedUserId,
    setOriginalStoryLength,
    setLastEndingPageIndex,
    setStorySource,
    setSpecialRequestDraft,
    updateCachedUserId,
  };

  return { state, actions };
};