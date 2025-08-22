import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Loader2, Volume2, VolumeX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings, Plus, RefreshCw, Clock, Wand, Sparkles, GraduationCap, Save, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { SparkleAnimation } from "@/components/SparkleAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FriendlyUpArrowIcon } from "@/components/icons/FriendlyUpArrowIcon";

// Mobile-Optimized UI Components
import { CollapsibleFloatingTimer } from "@/components/CollapsibleFloatingTimer";

import { MobileActionDock } from "@/components/MobileActionDock";

import { ResponsiveStoryHeader } from "@/components/ResponsiveStoryHeader";
import { ModernProgressTowers } from "@/components/ModernProgressTowers";
import { GameContextProvider } from "@/components/GameContextProvider";
import ReadAloudCoach from "@/components/ReadAloudCoach";

// Audio and Interactive Components
import { SynchronizedAudioControls } from "@/components/SynchronizedAudioControls";
import { PhoneticRulesEngine } from "@/services/phoneticRulesEngine";
import { SimplifiedAudioEngine } from "@/services/SimplifiedAudioEngine";

import { VocabularyCollector } from "@/components/VocabularyCollector";
import { processTextWithConsistentFlow } from "@/utils/unifiedTextProcessor";
import { hashText } from "@/utils/tokenize";
import { defaultAudioConfig } from "@/config/audioConfig";
import "@/styles/storyDisplay.css";
// import { processTextForDesktop } from "@/utils/desktopTextProcessor";
import { useWordHighlighting } from "@/hooks/useWordHighlighting";
import { VoiceCommandController } from '@/components/VoiceCommandController';
import { VoiceHoverController } from '@/components/VoiceHoverController';
import { PremiumHoverController } from '@/components/PremiumHoverController';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { useGamification } from "@/hooks/useGamification";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMobileTextConfig, getMobileStoryContainer } from "@/utils/mobileTextOptimizations";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import { cn } from "@/lib/utils";
import { useReaderLayout } from "@/hooks/useReaderLayout";
import { ImageGenerationStatusIndicator } from "@/components/ImageGenerationStatusIndicator";

import type { UserInfo, SessionStats, Story as StoryType } from "@/types";
import { NetflixStyleStoryService, type NetflixStoryResult } from "@/services/NetflixStyleStoryService";
import { LiveGenerationService, type LiveGenerationContext, type LivePageResult } from "@/services/LiveGenerationService";
import { DifficultyManager } from "@/services/difficultyManager";
import { DiagnosticTool } from "@/utils/diagnostics";

import { SimpleImageService } from "@/services/SimpleImageService";
import { ImageFallbackService } from "@/services/ImageFallbackService";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { EnhancedPostProcessor } from "@/services/EnhancedPostProcessor";
import { AudioFallbackNotification } from "@/components/AudioFallbackNotification";
import { PremiumStoryManager } from "@/services/premiumStoryManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorHandler, ErrorType } from "@/utils/errorHandling";
import { DiagnosticPanel } from "@/components/DiagnosticPanel";
import { ApiKeyDiagnostic } from "@/components/ApiKeyDiagnostic";
import { ParentGuardrailsService } from "@/services/parentGuardrailsService";
import { supabase } from "@/integrations/supabase/client";
import { SpecialRequestDialog } from "@/components/SpecialRequestDialog";
import { StorySessionCache } from "@/services/storySessionCache";
import { StoryVisualStateManager } from "@/services/storyVisualState";
import { StoryRefreshService } from "@/utils/storyRefresh";
import { guestSession } from "@/utils/guestSession";
import { APP_CONFIG } from "@/config/appConfig";
import { StoryStabilityMonitor } from "@/components/debug/StoryStabilityMonitor";

interface CleanStoryDisplayProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
  onHome: () => void;
  onUpgrade: () => void;
  onNewStory?: () => void;
  readingAsName?: string;
  currentStory?: any; // For saved stories - contains cachedImages and isFromSavedStory
}

const CleanStoryDisplay: React.FC<CleanStoryDisplayProps> = ({
  userInfo,
  isPremium,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory,
  readingAsName,
  currentStory
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isMobile, isTablet, isMobileOrTablet, hasTouchCapability } = useIsMobile();
  
  // Debug device detection
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
      console.log('📱 CleanStoryDisplay Device Detection:', {
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
        isMobile,
        isTablet,
        isMobileOrTablet,
        hasTouchCapability,
        shouldShowDock: isMobileOrTablet
      });
    }
  }, [isMobile, isTablet, isMobileOrTablet, hasTouchCapability]);
  
  const runtimeTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  const forceDesktopModal = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('desktopModal') === '1';
  const preferMobileModal = forceDesktopModal || isMobile || (isTablet && (hasTouchCapability || runtimeTouch));
  const { layout, fallbackToClassic, overrideLayout, lowEnd, reason, isDevelopment } = useReaderLayout();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Stable display buffer - only updates when story is confirmed stable
  const [stableStory, setStableStory] = useState<string[]>([]);
  
  // For free users, limit displayed pages to 6 maximum
  const displayedStory = !isPremium ? story.slice(0, 6) : story;
  const stableDisplayedStory = !isPremium ? stableStory.slice(0, 6) : stableStory;
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastImageError, setLastImageError] = useState<string | null>(null);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(navigator.onLine);

  // 🔒 EMERGENCY FIX: Enhanced Story Content Protection
  const isGeneratingRef = useRef(false);
  const storyGeneratedRef = useRef(false);
  const generationIdRef = useRef('');
  const lastUserInfoRef = useRef<string>('');
  
  // 🔒 CRITICAL: Story Content Lock State - prevents unauthorized regeneration
  const [isStoryContentLocked, setIsStoryContentLocked] = useState(false);
  const storyContentLockedRef = useRef(false);
  
  // 🔒 Enhanced generation source tracking for debugging
  const [lastGenerationTrigger, setLastGenerationTrigger] = useState<string>('');
  const [contentMutationLog, setContentMutationLog] = useState<Array<{
    timestamp: string;
    trigger: string;
    action: string;
    storyLength: number;
    isLocked: boolean;
  }>>([]);

  useEffect(() => {
    console.log('📥 CleanStoryDisplay isLoading changed:', isLoading);
  }, [isLoading]);
  
  // Mark body during reading session to control global UI (e.g., hide feedback on mobile)
  useEffect(() => {
    document.body.classList.add('reading-session');
    
    // Clear previous session achievements when starting new session
    try {
      sessionStorage.removeItem('session_achievements');
    } catch (error) {
      console.warn('Failed to clear previous session achievements:', error);
    }
    
    return () => {
      document.body.classList.remove('reading-session');
      // Cleanup generation protection refs on unmount
      isGeneratingRef.current = false;
      storyGeneratedRef.current = false;
      lastUserInfoRef.current = '';
      generationIdRef.current = '';
    };
  }, []);
  
  // SESSION PERSISTENCE & RESUME MECHANISM OR SAVED STORY LOADING
  // Automatically restores user sessions across page refreshes and browser restarts
  // Maintains story progress, timer state, and generation history for seamless experience
  // OR loads saved story content when currentStory prop is provided
  useEffect(() => {
    (async () => {
      try {
      // Check if this is a saved story being loaded
      if (currentStory?.isFromSavedStory && currentStory.segments) {
        console.log('📖 Loading saved story with cached content');
        const storyPages = currentStory.segments.map((s: any) => s.text);
        setStory(storyPages);
        setCurrentPage(0);
        setIsStoryComplete(true);
        setStoryTitle(currentStory.title || `${userInfo.name}'s Story`);
        
        // Load cached images if available
        if (currentStory.cachedImages) {
          setPageImages(currentStory.cachedImages);
        }
        
        // Mark story as generated to prevent double generation
        storyGeneratedRef.current = true;
        lastUserInfoRef.current = JSON.stringify({ name: userInfo.name, age: userInfo.age, isPremium });
        
        setIsLoading(false);
        // For saved stories, mark as stable immediately
        setIsStoryStable(true);
        return; // Exit early - don't proceed with live generation logic
      }
      
      const params = new URLSearchParams(window.location.search);
      const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
      const viaUrl = allowOverride && params.get('resume') === '1';
      const resumeEnabled = isPremium
        ? (APP_CONFIG.features.resumeOnRefresh.premium || viaUrl)
        : (APP_CONFIG.features.resumeOnRefresh.guest || viaUrl);

      // Safety: clear session via URL
      if (params.get('clearSession') === '1') {
        if (!isPremium) {
          try { guestSession.clearAll(); } catch {}
          try { StorySessionCache.clearCachedSession('guest'); } catch {}
        } else {
          let id = userInfo.name || 'premium';
          try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
          try { sessionStorage.removeItem(`premium.timer.endTs.${id}`); } catch {}
          try { sessionStorage.removeItem(`premium.timer.remaining.${id}`); } catch {}
          try { StorySessionCache.clearCachedSession(id); } catch {}
        }
        window.history.replaceState({}, '', window.location.pathname);
      }

      // If resume is disabled, proactively clear any cached session to avoid loops
      if (!resumeEnabled) {
        if (!isPremium) {
          try { guestSession.clearAll(); } catch {}
          try { StorySessionCache.clearCachedSession('guest'); } catch {}
        } else {
          let id = userInfo.name || 'premium';
          try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
          try { sessionStorage.removeItem(`premium.timer.endTs.${id}`); } catch {}
          try { sessionStorage.removeItem(`premium.timer.remaining.${id}`); } catch {}
          try { StorySessionCache.clearCachedSession(id); } catch {}
        }
      }
    } catch {}
  })();
  }, [isPremium, userInfo?.name]);

  // Monitor network status for image generation
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkAvailable(true);
      setLastImageError(null);
      console.log('🌐 Network restored - image generation available');
    };
    
    const handleOffline = () => {
      setIsNetworkAvailable(false);
      console.log('🌐 Network offline - image generation unavailable');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Premium live generation state
  const [liveContext, setLiveContext] = useState<LiveGenerationContext | null>(null);
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const [isStoryStable, setIsStoryStable] = useState(false);
  const [lastEndingPageIndex, setLastEndingPageIndex] = useState<number | null>(null);
  
  // PHASE 1: Update stable story ONLY when story is confirmed stable - prevents flickering
  useEffect(() => {
    if (isStoryStable && story.length > 0 && !stableStory.length) {
      console.log('📚 PHASE 1: Updating stable display buffer - no more flicker will occur');
      setStableStory(story);
    }
  }, [isStoryStable, story, stableStory.length]);

  // PHASE 1: Initialize stable story ONLY on first stable load - no updates after that
  useEffect(() => {
    if (story.length > 0 && stableStory.length === 0 && isStoryStable) {
      console.log('📚 PHASE 1: Initializing stable story buffer - first stable load');
      setStableStory(story);
    }
  }, [story, stableStory.length, isStoryStable]);
  
  // Image state
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [fallbackStates, setFallbackStates] = useState<Record<number, boolean>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchDone, setBatchDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  
  // Character consistency session ID
  const [characterSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2)}`);;
  
  // Story-specific identifier for cache isolation
  const [storyId, setStoryId] = useState(() => `story_${Date.now()}_${Math.random().toString(36).substring(2)}`);
  
  // Audio and Interactive Features state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showVocabularyCollector, setShowVocabularyCollector] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [wordsInteracted, setWordsInteracted] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const [pagesCompleted, setPagesCompleted] = useState<Set<number>>(new Set());
  const [audioPlayedPage, setAudioPlayedPage] = useState<number | null>(null);

// Voice integration for desktop
const { status: voiceStatus, isSpeaking, handleVoiceToggle, isConnected, isConnecting } = useVoiceIntegration();

// Memoized callbacks for ImageWithFallback to prevent infinite re-renders  
const handleImageLoadingChange = useCallback((isLoading: boolean) => {
  setImageLoadingStates(prev => ({ ...prev, [currentPage]: isLoading }));
}, [currentPage]);

const handleImageFallbackUsed = useCallback((isUsingFallback: boolean) => {
  setFallbackStates(prev => ({ ...prev, [currentPage]: isUsingFallback }));
  if (isUsingFallback) {
    console.warn('Story image failed to load, using enhanced fallback:', pageImages[currentPage]);
    fallbackToClassic('image-error');
  }
}, [currentPage, pageImages, fallbackToClassic]);

// Audio engine instance for direct control
const audioEngineRef = useRef(SimplifiedAudioEngine.getInstance());

// Audio state sync through direct callbacks (no polling)
const handleAudioStateChange = (playing: boolean) => {
  setIsAudioPlaying(playing);
};

// Global audio state event listener (Fix #1)
useEffect(() => {
  const handleGlobalAudioStateChange = (event: any) => {
    const isPlaying = event.detail?.isPlaying || false;
    setIsAudioPlaying(isPlaying);
    // Only clear loading state when audio actually starts playing
    if (isPlaying) {
      setIsAudioLoading(false);
    }
  };
  
  window.addEventListener('audio:statechange', handleGlobalAudioStateChange);
  return () => window.removeEventListener('audio:statechange', handleGlobalAudioStateChange);
}, []);

// Clear audio service state on page change (Fix #1 - CRITICAL)
useEffect(() => {
  const clearAudioOnPageChange = async () => {
    try {
      // Stop any active audio from previous pages
      audioEngineRef.current.stop();
      
      // Reset audio UI state immediately
      setIsAudioPlaying(false);
      
      console.log('🧹 Cleared audio state for page change:', currentPage + 1);
    } catch (error) {
      console.warn('Failed to clear audio state on page change:', error);
    }
  };
  
  clearAudioOnPageChange();
}, [currentPage]); // Triggers when page changes

// Debug userInfo avatar data when component mounts/updates (Fix #1 - CRITICAL)
useEffect(() => {
  console.log('🔍 [DEBUG] CleanStoryDisplay userInfo avatar check:', {
    hasUserInfo: !!userInfo,
    name: userInfo?.name,
    avatar: userInfo?.avatar,
    avatarType: userInfo?.avatar?.type,
    avatarSkinTone: userInfo?.avatar?.skinTone
  });
}, [userInfo]);

// Direct URL management for story sessions (more reliable than hook-based approach)
const navigate = useNavigate();

useEffect(() => {
  if (story.length > 0) {
    const params = new URLSearchParams();
    params.set('session', 'story');
    params.set('page', (currentPage + 1).toString());
    params.set('total', story.length.toString());
    
    if (storyTitle) {
      params.set('title', storyTitle);
    }

    const newUrl = `/?${params.toString()}`;
    navigate(newUrl, { replace: true });
  }
}, [story.length, currentPage, storyTitle, navigate]);

// Handle browser back/forward navigation
useEffect(() => {
  const handleStoryNavigation = (event: CustomEvent) => {
    const urlState = event.detail;
    if (urlState.isStorySession && urlState.page !== currentPage + 1) {
      setCurrentPage(Math.max(0, Math.min(story.length - 1, urlState.page - 1)));
    }
  };

  window.addEventListener('story:navigation:change', handleStoryNavigation as EventListener);
  return () => window.removeEventListener('story:navigation:change', handleStoryNavigation as EventListener);
}, [currentPage, story.length]);

// Voice command bridge moved below after currentStory/contentHash are defined

  // Debug source badge state
  const [storySource, setStorySource] = useState<'ai' | 'fallback' | 'unknown' | null>(null);
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // TIMER ENFORCEMENT SYSTEM
  // Free users have a 20-minute session limit (1200 seconds total)
  // Timer becomes visible in the last 60 seconds (when sessionTimer > 1140)
  // This enforces fair usage while encouraging premium upgrades
  const initialTimerSeconds = (() => { try { const v = Number(localStorage.getItem('readingTimerDefaultSeconds')); return v > 0 ? v : 20 * 60; } catch { return 20 * 60; } })();
  const [timeRemaining, setTimeRemaining] = useState(initialTimerSeconds); // default 20 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false); // Start timer only when content is ready
  const [isTimerCanceled, setIsTimerCanceled] = useState(false); // Premium: timer can be canceled
  const [userPausedTimer, setUserPausedTimer] = useState(false); // Track when user manually pauses timer
  const [isTimerVisible, setIsTimerVisible] = useState(true); // Premium: timer can be dismissed and shown again
  
  // Timer pause logic - only block forward navigation when paused for non-premium users
  const isTimerPaused = !isPremium && !isTimerRunning && !isTimerCanceled;
  const isForwardNavigationBlocked = isTimerPaused;
  
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('readingTimerEnabled') !== '0'; } catch { return true; }
  });

  // Ensure timer defaults ON at session start for premium users
  useEffect(() => {
    if (isPremium) {
      try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
      setTimerEnabled(true);
      try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
    }
  }, [isPremium]);

  // Force timer ON for guest users and correct any persisted OFF state
  useEffect(() => {
    if (!isPremium) {
      try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
      if (!timerEnabled) {
        setTimerEnabled(true);
        try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
      }
    }
  }, [isPremium, timerEnabled]);

// Guard against any attempts to disable the timer for guests
useEffect(() => {
  if (!isPremium && !timerEnabled) {
    console.warn('[Timer] Guest sessions must keep timer enabled. Re-enabling.');
    try { localStorage.setItem('readingTimerEnabled','1'); } catch {}
    setTimerEnabled(true);
    try { window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: true })); } catch {}
  }
}, [isPremium, timerEnabled]);

// Guest timer: resume or set end timestamp
useEffect(() => {
  if (isPremium) return;
  const now = Date.now();
  const endTs = guestSession.getTimerEndTs();
  if (endTs && endTs > now) {
    const remaining = Math.max(0, Math.floor((endTs - now) / 1000));
    setTimeRemaining(remaining);
  } else {
    guestSession.saveTimerEndTs(now + timeRemaining * 1000);
  }
}, []);

// Premium timer: resume or set end timestamp
useEffect(() => {
  if (!isPremium) return;
  (async () => {
    let id = userInfo.name || 'premium';
    try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
    const now = Date.now();
    let endRaw = 0;
    try { endRaw = Number(sessionStorage.getItem(`premium.timer.endTs.${id}`) || '0'); } catch {}
    if (endRaw && endRaw > now) {
      setTimeRemaining(Math.max(0, Math.floor((endRaw - now) / 1000)));
    } else if (timerEnabled) {
      try { sessionStorage.setItem(`premium.timer.endTs.${id}`, String(now + timeRemaining * 1000)); } catch {}
    }
  })();
  }, [isPremium]);

  // FIXED: Start timer immediately when story is stable (Phase 2)
  useEffect(() => {
    // Start timer immediately when story is stable and not manually paused
    if (isStoryStable && story.length > 0 && !isTimerRunning && !isTimerCanceled && !userPausedTimer && timerEnabled) {
      console.log('⏰ FIXED: Auto-starting timer at 20:00 - story is now stable');
      setIsTimerRunning(true);
    } else if (isStoryStable && story.length > 0 && userPausedTimer) {
      console.log('⏸️ Timer auto-start blocked - user has manually paused');
    }
  }, [isStoryStable, story.length, isTimerRunning, isTimerCanceled, userPausedTimer, timerEnabled]);

  useEffect(() => {
    const handler = (e: any) => {
      const enabled = !!e.detail;
      try { localStorage.setItem('readingTimerEnabled', enabled ? '1' : '0'); } catch {}
      setTimerEnabled(enabled);

      if (!enabled) {
        // Pause and persist remaining time for this session
        try { sessionStorage.setItem('readingTimerPausedSeconds', String(timeRemaining)); } catch {}
        setIsTimerRunning(false);
      } else {
        // Resume from saved time this session, else from default
        let restored = 0;
        try { restored = Number(sessionStorage.getItem('readingTimerPausedSeconds') || '0'); } catch {}
        if (restored && restored >= 5) {
          setTimeRemaining(restored);
          try { sessionStorage.removeItem('readingTimerPausedSeconds'); } catch {}
        } else {
          setTimeRemaining(initialTimerSeconds);
        }
        setIsTimerCanceled(false);
        setIsTimerRunning(true);
      }
    };
    window.addEventListener('readingTimerToggle', handler as EventListener);
    return () => window.removeEventListener('readingTimerToggle', handler as EventListener);
  }, [timeRemaining, initialTimerSeconds]);
// Magic wand state
const [isGeneratingNewStory, setIsGeneratingNewStory] = useState(false);
const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);
const [isRewriteMode, setIsRewriteMode] = useState(false);
const [isMagicWandAnimating, setIsMagicWandAnimating] = useState(false);
const [wandPulse, setWandPulse] = useState(false);
const [isGeneratingEnding, setIsGeneratingEnding] = useState(false);
const [showManualCelebration, setShowManualCelebration] = useState(false);
const [showEndStoryModal, setShowEndStoryModal] = useState(false);
const [showConfirmEndStory, setShowConfirmEndStory] = useState(false);
const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
const [showCoach, setShowCoach] = useState(false);
// Premium: edit special requests before starting a new story
const [showSpecialRequestDialog, setShowSpecialRequestDialog] = useState(false);
const [specialRequestDraft, setSpecialRequestDraft] = useState(userInfo?.specialRequest || "");
const loaderStartRef = useRef<number>(0);
const LOADER_MIN_MS = 1600;

// Expanded Finish CTA state: show expanded only on the ending page just generated
const [finishCTAExpanded, setFinishCTAExpanded] = useState(false);
const finishExpandedOnPageRef = useRef<number | null>(null);
// Collapse expanded CTA when user navigates away from the ending page
useEffect(() => {
  if (!finishCTAExpanded) return;
  if (finishExpandedOnPageRef.current != null && currentPage !== finishExpandedOnPageRef.current) {
    setFinishCTAExpanded(false);
  }
}, [currentPage, finishCTAExpanded]);

  // Debug flag to force loader overlay for quick verification
  const [forceLoaderActive, setForceLoaderActive] = useState(false);
  useEffect(() => {
    const force = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceLoader') === '1';
    if (force) {
      setForceLoaderActive(true);
      setTimeout(() => setForceLoaderActive(false), 2000);
    }
  }, []);

  // Reading Level state with animation support
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'>(userInfo.difficultyLevel || 'beginner');
  const [isChangingDifficulty, setIsChangingDifficulty] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'increase' | 'decrease' | 'badge'>();
  const [expertGradeLevel, setExpertGradeLevel] = useState<"6th" | "7th" | "8th" | "9th" | "10th">("6th");
  const difficultyLevels: ('beginner' | 'easy' | 'medium' | 'hard' | 'expert')[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  
  // Premium: parent guardrails and save highlight
  const [lockDifficulty, setLockDifficulty] = useState(false);
  const [minDifficulty, setMinDifficulty] = useState<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'>('beginner');
  const [minExpertGrade, setMinExpertGrade] = useState<"6th" | "7th" | "8th" | "9th" | "10th">("6th");
  const [allowDecreaseBelowMin, setAllowDecreaseBelowMin] = useState(false);
const [highlightSave, setHighlightSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!isPremium) return;
    (async () => {
      try {
        const guardrails = await ParentGuardrailsService.getGuardrails();
        setLockDifficulty(guardrails.lockDifficulty);
        setMinDifficulty(guardrails.minDifficulty as any);
        setMinExpertGrade(guardrails.minExpertGrade as any);
        setAllowDecreaseBelowMin(!!guardrails.allowDecreaseBelowMin);

        // Hard lock: clamp up immediately and persist if below min
        if (guardrails.lockDifficulty) {
          const currentIndex = difficultyLevels.indexOf(currentDifficulty);
          const minIndex = difficultyLevels.indexOf(guardrails.minDifficulty as any);
          if (currentIndex < minIndex) {
            const newDifficulty = guardrails.minDifficulty as any;
            setCurrentDifficulty(newDifficulty);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profiles').update({ difficulty_level: newDifficulty }).eq('user_id', user.id);
              }
            } catch (e) {
              console.warn('Failed to persist clamped difficulty', e);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load parent guardrails', e);
      }
    })();
  }, [isPremium]);

  useEffect(() => {
    if (!highlightSave) return;
    const timer = setTimeout(() => setHighlightSave(false), 8000);
    return () => clearTimeout(timer);
  }, [highlightSave]);
  const currentStoryText = stableDisplayedStory[currentPage] || "";
  const effectiveLimit = isPremium ? defaultAudioConfig.quality.maxTextLength.premium : defaultAudioConfig.quality.maxTextLength.free;
  const effectiveAudioText = (currentStoryText || "").slice(0, effectiveLimit);
  const contentHash = hashText(effectiveAudioText);

  useEffect(() => {
    try { 
      const previousHash = (window as any).__pageContentHash;
      (window as any).__pageContentHash = contentHash; 
      (window as any).__pageContentString = currentStoryText;
      (window as any).__storyTitle = storyTitle || `${userInfo?.name}'s Adventure` || 'the story';
      
      // Emit hash change event if hash actually changed
      if (previousHash !== contentHash && contentHash) {
        console.log(`🔄 Content hash changed: ${previousHash?.slice(0,10)} → ${contentHash?.slice(0,10)}`);
        window.dispatchEvent(new CustomEvent('content:hash:changed', { 
          detail: { 
            previousHash, 
            newHash: contentHash, 
            timestamp: Date.now() 
          } 
        }));
      }
      (window as any).__userName = userInfo?.name || '';
      console.log('🎤 Content variables updated for voice commands:', {
        page: currentPage,
        textLength: currentStoryText.length,
        hasHash: !!contentHash,
        storyTitle: (window as any).__storyTitle,
        userName: (window as any).__userName,
        textPreview: currentStoryText.substring(0, 100) + '...'
      });
    } catch (error) {
      console.error('🎤 Failed to set content variables:', error);
    }
  }, [contentHash, currentStoryText, currentPage]);

  // Reset free-tier audio flag when navigating to a new page or content changes
  useEffect(() => {
    setAudioPlayedPage(null);
  }, [currentPage, contentHash]);
  
  // Audio highlighting integration
  const { onWordHighlight, currentHighlightedWord, clearHighlighting } = useWordHighlighting(
    currentStoryText, 
    isAudioPlaying
  );

// Voice command -> audio control bridge (now using SimplifiedAudioEngine)
useEffect(() => {
  const onPlay = () => { 
    try { 
      audioEngineRef.current.playTextWithSynchronization({
        text: currentStoryText || "",
        context: 'conversation',
        onWordHighlight
      }); 
    } catch (e) { console.warn('audio:play failed', e); } 
  };
  const onPause = () => { try { audioEngineRef.current.stop(); } catch (e) { console.warn('audio:pause failed', e); } };
  window.addEventListener('audio:play', onPlay as EventListener);
  window.addEventListener('audio:pause', onPause as EventListener);
  return () => {
    window.removeEventListener('audio:play', onPlay as EventListener);
    window.removeEventListener('audio:pause', onPause as EventListener);
  };
}, [currentStory, contentHash]);

  // Voice word help: on "What is this word?" play Hear it -> Explain it -> Syllables (Charlotte) and auto-resume narration
  useEffect(() => {
    const CHARLOTTE = 'XB0fDUnXU5powFXDhCwa';

    const playTTS = async (text: string) => {
      const audioEngine = SimplifiedAudioEngine.getInstance();
      await audioEngine.playTextWithSynchronization({ 
        text,
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
        context: 'conversation'
      });
    };

    const getDefinition = async (w: string): Promise<string> => {
      try {
        const userLang = userInfo?.nativeLanguage || 'en';
        const { data, error } = await supabase.functions.invoke('word-dictionary', {
          body: { word: w, userLevel: currentDifficulty, userLanguage: userLang }
        });
        if (!error && (data as any)?.definition) return (data as any).definition as string;
      } catch {}
      return w;
    };

    const toAudioFriendlySyllables = (original: string, sylls: string[]) => {
      const w = (original || '').toLowerCase();
      if (w.endsWith('ies') && w.length > 4) return [w.slice(0, -3) + 'y', 's'];
      if (w.endsWith('es') && w.length > 3) return [w.slice(0, -2), 'es'];
      if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return [w.slice(0, -1), 's'];
      return sylls;
    };

    const handler = async () => {
      const wasPlaying = audioEngineRef.current.isPlaying();
      try {
        // Stop any narration first
        try { audioEngineRef.current.stop(); } catch {}

        // Resolve target word: hovered -> lastSelected -> highlighted
        let target: string = (window as any).__hoveredWord || (window as any).__lastSelectedWord || '';
        if ((!target || !target.trim()) && typeof currentHighlightedWord === 'number' && currentHighlightedWord >= 0) {
          const words = wordsRef.current || [];
          target = words[currentHighlightedWord] || '';
        }
        target = (target || '').toString().replace(/[.,!?;:'"()]/g, '').trim();
        if (!target) return;

        // 1) Hear it
        await playTTS(target);
        // 2) Explain it (definition)
        const def = await getDefinition(target);
        await playTTS(def);
        // 3) Syllables (comma-separated for clean pacing)
        const raw = await PhoneticRulesEngine.getInstance().breakIntoSyllablesAsync(target);
        const adjusted = toAudioFriendlySyllables(target, raw);
        const syllText = adjusted.join(', ');
        await playTTS(syllText);
      } catch (e) {
        console.warn('voice:wordHelp sequence failed', e);
      } finally {
        // Auto-resume narration if it was playing before the help flow
        if (wasPlaying) {
          try { 
            await audioEngineRef.current.playTextWithSynchronization({
              text: currentStoryText || "",
              context: 'conversation',
              onWordHighlight
            }); 
          } catch {}
        }
      }
    };

    window.addEventListener('voice:wordHelp', handler as EventListener);
    return () => window.removeEventListener('voice:wordHelp', handler as EventListener);
  }, [userInfo?.nativeLanguage, currentDifficulty, currentHighlightedWord, currentStory]);

  // Words cache for vocabulary/voice helpers
  const wordsRef = useRef<string[]>([]);

  useEffect(() => {
    wordsRef.current = (currentStory || '').split(/\s+/).filter(Boolean);
  }, [currentStory]);

  // Gamification integration
  const {
    userStats,
    updateActivity,
    recordReadingSession,
    addVocabularyWord,
    newAchievements,
    hasNewAchievements,
    getNextAchievement,
    clearNewAchievements,
    resetStats
  } = useGamification({
    userId: userInfo.name,
    enablePersistence: isPremium, // Only persist for premium users
    onAchievementUnlocked: (achievement) => {
      console.log('🏆 Achievement unlocked:', achievement.title || achievement.id);
    }
  });

  // Initialize story based on tier - with ENHANCED generation protection
  useEffect(() => {
    const userInfoKey = JSON.stringify({ 
      name: userInfo.name, 
      age: userInfo.age, 
      isPremium, 
      readingAsName,
      isFromSavedStory: currentStory?.isFromSavedStory 
    });
    
    // 🔒 EMERGENCY FIX: Enhanced protection against unauthorized regeneration
    console.log('🔍 useEffect story generation check:', {
      userInfoKey,
      lastUserInfoKey: lastUserInfoRef.current,
      storyContentLocked: storyContentLockedRef.current,
      storyGenerated: storyGeneratedRef.current,
      hasStory: story.length > 0,
      isStoryStable,
      isGenerating: isGeneratingRef.current
    });
    
    // 🔒 CRITICAL: First check - if content is locked, NEVER regenerate
    if (storyContentLockedRef.current && story.length > 0) {
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
        console.log('🔒 EMERGENCY FIX: Story content LOCKED - blocking any regeneration attempt');
      }
      setIsLoading(false);
      setIsStoryStable(true);
      return;
    }
    
    // 🔒 CRITICAL: Second check - if same context and story exists, skip regeneration
    if (lastUserInfoRef.current === userInfoKey && storyGeneratedRef.current && story.length > 0) {
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
        console.log('🔒 EMERGENCY FIX: Skipping story regeneration - same user context and story already exists');
      }
      setIsLoading(false);
      setIsStoryStable(true);
      return;
    }
    
    // 🔒 CRITICAL: Third check - prevent multiple simultaneous generations
    if (isGeneratingRef.current) {
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
        console.log('🔒 EMERGENCY FIX: Skipping story generation - already in progress');
      }
      return;
    }

    // 🔒 Log the trigger for debugging
    console.log('🎯 Story generation triggered by useEffect change:', {
      newUserInfoKey: userInfoKey,
      lastUserInfoKey: lastUserInfoRef.current,
      storyGenerated: storyGeneratedRef.current,
      isGenerating: isGeneratingRef.current,
      hasStory: story.length > 0,
      trigger: 'useEffect-user-context-change'
    });
    
    setContentMutationLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      trigger: 'useEffect-user-context-change',
      action: 'generation-triggered',
      storyLength: story.length,
      isLocked: storyContentLockedRef.current
    }]);
    
    // Only update if this is actually a new user context
    if (lastUserInfoRef.current !== userInfoKey) {
      lastUserInfoRef.current = userInfoKey;
      initializeStory();
    }
  }, [userInfo.name, userInfo.age, isPremium, readingAsName, currentStory?.isFromSavedStory]);

  // Generate image for current page with better diagnostics - ONLY AFTER STORY IS STABLE
  useEffect(() => {
    const isDebug = new URLSearchParams(window.location.search).has('debug');
    if (isDebug) {
      console.log('🖼️ Image generation check:', {
        layout,
        storyLength: story.length,
        currentPage,
        hasCurrentImage: !!pageImages[currentPage],
        isStoryStable,
        allImages: Object.keys(pageImages)
      });
    }
    
    if (layout !== "classic" && story.length > 0 && currentPage < story.length && !pageImages[currentPage] && isStoryStable) {
      if (isDebug) {
        console.log('🖼️ Triggering image generation for page', currentPage, '- story is stable');
      }
      generateImageForCurrentPage();
    } else if (!isStoryStable && story.length > 0) {
      if (isDebug) {
        console.log('🖼️ Waiting for story to stabilize before generating images');
      }
    }
  }, [currentPage, story, pageImages, layout, isStoryStable]);

// Timer countdown effect
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isTimerRunning && timeRemaining > 0 && !isTimerCanceled) {
    interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isTimerRunning, timeRemaining, isTimerCanceled]);

// Persist timer remaining periodically for both tiers
const timeRef = useRef(timeRemaining);
useEffect(() => { timeRef.current = timeRemaining; }, [timeRemaining]);
useEffect(() => {
  const iv = setInterval(async () => {
    try {
      if (!isPremium) {
        guestSession.saveRemaining(timeRef.current);
      } else {
        let id = userInfo.name || 'premium';
        try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
        sessionStorage.setItem(`premium.timer.remaining.${id}`, String(timeRef.current));
      }
    } catch {}
  }, 5000);
  return () => clearInterval(iv);
}, [isPremium, userInfo.name]);

useEffect(() => {
  if (timeRemaining === 0) {
    (async () => {
      try {
        if (!isPremium) {
          guestSession.clearAll();
          StorySessionCache.clearCachedSession('guest');
        } else {
          let id = userInfo.name || 'premium';
          try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
          // Keep story/session cache intact so users can keep reading untimed
          sessionStorage.removeItem(`premium.timer.endTs.${id}`);
          sessionStorage.removeItem(`premium.timer.remaining.${id}`);
        }
      } catch {}
    })();
  }
}, [isPremium, timeRemaining]);

// Magic wand DRAMATIC animation effect for free users on page 6 - CONTINUOUS until clicked
useEffect(() => {
  if (!isPremium && currentPage === 5 && stableDisplayedStory.length > 5) { // Show on page 6 (index 5)
    setIsMagicWandAnimating(true);
    // NO TIMEOUT - Keep animating until user clicks!
  } else {
    setIsMagicWandAnimating(false);
  }
}, [currentPage, stableDisplayedStory.length, isPremium]);

// Subtle pulse for wand every 3 pages
useEffect(() => {
  if (currentPage > 0 && (currentPage + 1) % 3 === 0) {
    setWandPulse(true);
    const t = setTimeout(() => setWandPulse(false), 1200);
    return () => clearTimeout(t);
  }
}, [currentPage]);

// Finish button feedback: state
const [finishSparkle, setFinishSparkle] = useState(false);
const [finishPressBurst, setFinishPressBurst] = useState(false);
const [finishFlashCycle, setFinishFlashCycle] = useState(false);

// Dramatic burst overlay trigger when ending generation completes
const [showEndingBurst, setShowEndingBurst] = useState(false);
const prevIsGeneratingEndingRef = useRef(isGeneratingEnding);
useEffect(() => {
  if (prevIsGeneratingEndingRef.current && !isGeneratingEnding && isPremium) {
    setShowEndingBurst(true);
    const t = setTimeout(() => setShowEndingBurst(false), 1400);
    return () => clearTimeout(t);
  }
  prevIsGeneratingEndingRef.current = isGeneratingEnding;
}, [isGeneratingEnding, isPremium]);
// Trigger finish story flash + sparkle every 5 completed pages
useEffect(() => {
  const completed = pagesCompleted.size;
  if (completed > 0 && completed % 5 === 0) {
    setFinishSparkle(true);
    setFinishFlashCycle(true);
    const t1 = setTimeout(() => setFinishSparkle(false), 2000);
    const t2 = setTimeout(() => setFinishFlashCycle(false), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }
  return;
}, [pagesCompleted]);

// Ensure timer UI becomes visible when time ends for premium (to show celebration + choice)
useEffect(() => {
  if (isPremium && timeRemaining === 0 && !isTimerVisible) {
    setIsTimerVisible(true);
  }
}, [isPremium, timeRemaining, isTimerVisible]);


const initializeStory = async () => {
  // 🔒 EMERGENCY FIX: Enhanced Story Content Protection
  console.log('🚀 initializeStory called', {
    trigger: 'direct-call',
    timestamp: new Date().toISOString(),
    storyContentLocked: storyContentLockedRef.current,
    storyGenerated: storyGeneratedRef.current,
    hasExistingStory: story.length > 0,
    isGenerating: isGeneratingRef.current
  });
  
  // 🔒 CRITICAL: Check if story content is locked against regeneration
  if (storyContentLockedRef.current && story.length > 0) {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
      console.log('🔒 EMERGENCY FIX: Story content is LOCKED - rejecting regeneration attempt');
    }
    setLastGenerationTrigger('blocked-content-locked');
    setContentMutationLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      trigger: 'blocked-content-locked',
      action: 'regeneration-blocked',
      storyLength: story.length,
      isLocked: true
    }]);
    setIsLoading(false);
    return;
  }
  
  // 🔒 Enhanced generation protection - prevent double execution
  if (isGeneratingRef.current) {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
      console.log('🔒 initializeStory blocked - already generating');
    }
    setLastGenerationTrigger('blocked-already-generating');
    return;
  }
  
  // 🔒 CRITICAL: Check for existing stable story content before proceeding
  if (storyGeneratedRef.current && story.length > 0 && isStoryStable) {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
      console.log('🔒 EMERGENCY FIX: Stable story already exists - blocking regeneration');
    }
    setLastGenerationTrigger('blocked-stable-story-exists');
    setContentMutationLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      trigger: 'blocked-stable-story-exists',
      action: 'regeneration-blocked',
      storyLength: story.length,
      isLocked: storyContentLockedRef.current
    }]);
    setIsLoading(false);
    return;
  }
  
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  generationIdRef.current = generationId;
  isGeneratingRef.current = true;
  setLastGenerationTrigger(`new-generation-${generationId}`);
  
  console.log('🚀 initializeStory start', { 
    isPremium, 
    userName: userInfo?.name, 
    generationId,
    storyAlreadyGenerated: storyGeneratedRef.current 
  });
  
  setIsLoading(true);
  loaderStartRef.current = Date.now();
  setError(null);
  
  // Run diagnostics for free users to identify API issues
  if (!isPremium) {
    await DiagnosticTool.runFullDiagnostic();
  }
  
  try {
    const effectiveUser = {
      ...userInfo,
      difficultyLevel: currentDifficulty,
      readingAbility: currentDifficulty,
      expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
    } as UserInfo;
    if (isPremium) {
      // Premium: restore from cache if available (guarded by feature flag)
      try {
        const params = new URLSearchParams(window.location.search);
        const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
        const viaUrl = allowOverride && params.get('resume') === '1';
        const resumeEnabled = APP_CONFIG.features.resumeOnRefresh.premium || viaUrl;

        let cacheId = userInfo.name || 'premium';
        try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) cacheId = user.id; } catch {}

        if (resumeEnabled) {
          const cached = StorySessionCache.getCachedStorySession(cacheId);
          if (cached && cached.pages?.length) {
            console.log('♻️ Restoring premium story from cache');
            setStory(cached.pages);
            setCurrentPage(Math.min(cached.currentPage || 0, Math.max(0, cached.pages.length - 1)));
            setIsStoryComplete(!!cached.isComplete);
            setStoryTitle(`${userInfo.name}'s Live Adventure`);
            const ctx: LiveGenerationContext = {
              userInfo: effectiveUser,
              difficulty: currentDifficulty,
              expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
              storyContext: [...cached.pages],
              currentPage: cached.currentPage || 0,
              totalExpectedPages: Math.max(cached.pages.length + 1, 6),
              characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
              openEnded: true,
            };
            setLiveContext(ctx);
            const srcPremium = (window as any).__LAST_STORY_SOURCE__ || 'cached';
            setStorySource(srcPremium);
            setIsStoryStable(true); // Mark cached story as stable
            return; // Early return
          }
        } else {
          // Proactively clear any cached session to avoid loops
          try { sessionStorage.removeItem(`premium.timer.endTs.${cacheId}`); } catch {}
          try { sessionStorage.removeItem(`premium.timer.remaining.${cacheId}`); } catch {}
          try { StorySessionCache.clearCachedSession(cacheId); } catch {}
        }
      } catch (e) { console.warn('Failed to restore premium cached session', e); }

      // Premium: Live generation - start with first page
      console.log('🎯 Premium user: Starting live generation');
      const result = await LiveGenerationService.generateFirstPage(effectiveUser);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setStory([result.content]);
      setLiveContext(result.nextContext || null);
      // Sync UI with adaptive expert grade if returned
      if (result.nextContext?.expertGradeLevel) {
        setExpertGradeLevel(result.nextContext.expertGradeLevel);
      }
      setIsStoryComplete(result.isComplete);
      setStoryTitle(`${userInfo.name}'s Live Adventure`);
      const srcPremium = (window as any).__LAST_STORY_SOURCE__ || 'unknown';
      console.log('🧭 UI SOURCE', { source: srcPremium, tier: 'premium' });
      setStorySource(srcPremium);
      
      // Persist premium story start
      try {
        let cacheId = userInfo.name || 'premium';
        try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) cacheId = user.id; } catch {}
        StorySessionCache.cacheStorySession(
          cacheId,
          currentDifficulty as any,
          [result.content],
          [{ prompt: '' }],
          0,
          { isPremium: true, sessionStartTime }
        );
      } catch (e) { console.warn('Story cache failed (premium start)', e); }
      
    } else {
      // Free: try to restore from cache first (guarded by feature flag)
      try {
        const params = new URLSearchParams(window.location.search);
        const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
        const viaUrl = allowOverride && params.get('resume') === '1';
        const resumeEnabled = APP_CONFIG.features.resumeOnRefresh.guest || viaUrl;

        if (resumeEnabled) {
          const avatarType = userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
          const cached = StorySessionCache.getCachedStorySession('guest', avatarType);
          if (cached && cached.pages?.length) {
            console.log(`♻️ Restoring guest story from cache (avatar: ${avatarType}) - CONTENT LOCKED AFTER RESTORE`);
            setStory(cached.pages);
            setCurrentPage(Math.min(cached.currentPage || 0, Math.max(0, cached.pages.length - 1)));
            setStoryTitle(`${userInfo.name}'s Adventure`);
            setIsStoryComplete(true);
            setStorySource('unknown');
            
            // 🔒 EMERGENCY FIX: Lock content immediately after cache restore
            storyGeneratedRef.current = true;
            setIsStoryContentLocked(true);
            storyContentLockedRef.current = true;
            setContentMutationLog(prev => [...prev, {
              timestamp: new Date().toISOString(),
              trigger: 'cache-restore-guest',
              action: 'content-locked-after-restore',
              storyLength: cached.pages?.length || 0,
              isLocked: true
            }]);
            
            setIsStoryStable(true); // Mark cached story as stable
            return; // Early return - NO FALLBACK TO REGENERATION
          }
        } else {
          // Proactively clear any cached guest session to avoid loops
          try { StorySessionCache.clearCachedSession('guest'); } catch {}
          try { guestSession.clearAll(); } catch {}
        }
      } catch (e) { console.warn('Failed to restore cached guest session', e); }

      // Free: Netflix-style - generate complete story upfront
      console.log('🎬 Free user: Generating complete story', { isPremium, userInfo });
      console.log('🔍 DIAGNOSTIC: CleanStoryDisplay calling NetflixStyleStoryService', {
        userName: userInfo.name,
        difficulty: userInfo.difficultyLevel,
        timestamp: new Date().toISOString()
      });
      
      // ✅ CRITICAL FIX: Debug userInfo gender before story generation
      console.log('🚨 [GENDER DEBUG] UserInfo being passed to story generation:', {
        name: effectiveUser.name,
        avatarType: effectiveUser.avatar?.type,
        avatarSkinTone: effectiveUser.avatar?.skinTone,
        fullAvatar: effectiveUser.avatar,
        effectiveUserFull: effectiveUser
      });
      
      // ⚠️ VALIDATION: Ensure avatar type is set correctly
      if (!effectiveUser.avatar?.type) {
        console.error('🚨 [CRITICAL] Avatar type is missing! This will cause pronoun issues.');
        toast({
          title: "Character Error",
          description: "Avatar information is missing. Please refresh and select your character again.",
          variant: "destructive"
        });
        return;
      }
      
      const result = await NetflixStyleStoryService.generateCompleteStory(effectiveUser);
      
      console.log('🔍 DIAGNOSTIC: NetflixStyleStoryService result received', {
        hasError: !!result.error,
        pagesCount: result.pages?.length,
        title: result.title,
        sampleContent: result.pages?.[0]?.substring(0, 50)
      });

      if (result.error) {
        console.error('🔍 DIAGNOSTIC: Story generation returned error', result.error);
        setError(result.error);
        return;
      }
      
      console.log('🔍 DIAGNOSTIC: Pre-processing story for placeholders BEFORE setStory', {
        pagesCount: result.pages.length,
        firstPage: result.pages[0]?.substring(0, 100),
        hasPlaceholders: result.pages.some(page => page.includes('{'))
      });

      // PHASE 1: STORY STABILIZATION LOADING STATE - Process in background, show loading until complete
      console.log('📝 PHASE 1: Processing story content in background - users will see loading state until complete...');
      
      let processedPages = result.pages;
      try {
        const { EnhancedPostProcessor } = await import('@/services/EnhancedPostProcessor');
        processedPages = await EnhancedPostProcessor.processStoryContent(
          result.pages,
          userInfo,
          characterSessionId
        );
        console.log('✅ PHASE 1: Story fully processed in background - ready for stable display', {
          processedFirstPage: processedPages[0]?.substring(0, 100),
          stillHasPlaceholders: processedPages.some(page => page.includes('{'))
        });
      } catch (error) {
        console.warn('Failed to post-process story pages:', error);
        processedPages = result.pages;
      }

      // PHASE 6: ATOMIC STORY STATE UPDATE - Set final processed story only once
      setStory(processedPages);
      setStoryTitle(result.title);
      setIsStoryComplete(true);
      const srcFree = (window as any).__LAST_STORY_SOURCE__ || 'unknown';
      console.log('🧭 UI SOURCE', { source: srcFree, tier: 'free' });
      setStorySource(srcFree as any);

      // Persist guest story for refresh-resume with avatar-aware cache key
      // 🔧 FIX: Cache the PROCESSED pages (not original) to maintain consistency on refresh
      try {
        const avatarType = userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
        StorySessionCache.cacheStorySession(
          'guest',
          currentDifficulty as any,
          processedPages, // Use processed pages for consistency
          processedPages.map(() => ({ prompt: '' })),
          0,
          { isPremium: false, sessionStartTime },
          undefined,
          undefined,
          avatarType
        );
        console.log(`📚 Guest story cached with processed pages and avatar type: ${avatarType}`);
      } catch (e) { console.warn('Story cache failed', e); }

      // 🔧 FIX: Dispatch stability event with PROCESSED content for image generation
      // This ensures images are generated from the same content users see
      setTimeout(() => {
        const stableEvent = new CustomEvent('story-stable', {
          detail: {
            storyPages: processedPages, // Pass processed content to image generation
            currentPage: 0,
            totalPages: processedPages.length,
            isStoryComplete: true,
            userInfo,
            sessionId: characterSessionId
          }
        });
        window.dispatchEvent(stableEvent);
        console.log('📸 Story stability event dispatched with processed content for image generation');
      }, 500);
    }
    
  } catch (error) {
    console.error('Story initialization failed:', error);
    setError('Failed to create your story. Please try again.');
  } finally {
    const elapsed = Date.now() - loaderStartRef.current;
    const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
    console.log('✅ initializeStory finished', { 
      elapsed, 
      remaining, 
      LOADER_MIN_MS, 
      generationId: generationIdRef.current,
      storyPagesGenerated: story.length 
    });
    
    // Mark story as successfully generated and LOCK content
    storyGeneratedRef.current = true;
    isGeneratingRef.current = false;
    
    // 🔒 EMERGENCY FIX: Lock story content after successful generation
    setIsStoryContentLocked(true);
    storyContentLockedRef.current = true;
    setContentMutationLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      trigger: 'story-generation-completed',
      action: 'content-locked',
      storyLength: story.length,
      isLocked: true
    }]);
    console.log('🔒 Story content is now LOCKED against unauthorized regeneration');
    
    if (remaining > 0) {
      setTimeout(() => {
        setIsLoading(false);
        // PHASE 6: Mark story as stable immediately - no more content changes
        setIsStoryStable(true);
        console.log('📚 PHASE 6: Story is now stable and locked - timer can start, images can generate');
      }, remaining);
    } else {
      setIsLoading(false);
      // PHASE 6: Mark story as stable immediately - no more content changes
      setIsStoryStable(true);
      console.log('📚 PHASE 6: Story is now stable and locked - timer can start, images can generate');
    }
  }
};

  const generateNextPage = async (): Promise<LivePageResult | undefined> => {
    if (!isPremium || !liveContext || isLoadingNextPage) return;
    setIsLoadingNextPage(true);
    try {
      const result = await LiveGenerationService.generateNextPage(liveContext);
      if (result.error) {
        setError(result.error);
        return;
      }
      return result;
    } catch (error) {
      console.error('Failed to generate next page:', error);
      setError('Failed to continue the story. Please try again.');
      return;
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  const generateImageForCurrentPage = async () => {
    if (isGeneratingImage || pageImages[currentPage]) return;
    
    // CRITICAL: Only generate images AFTER story is stable
    if (!isStoryStable) {
      console.log('🖼️ Cannot generate image - story not yet stable');
      return;
    }
    
    // Enhanced cache validation with story continuity markers
    const storyText = stableDisplayedStory[currentPage];
    const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
    
    // Validate userInfo structure before extracting markers
    if (!userInfo || !userInfo.avatar) {
      console.warn('⚠️ Missing userInfo or avatar data for story markers');
    }
    
    const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
    const cachedImageUrl = EnhancedImageCache.getCachedImage(
      storyText.slice(0, 120), 
      characterSessionId, 
      currentPage,
      storyId,
      storyMarkers
    );
    
    if (cachedImageUrl) {
      console.log('📸 Using cached image for page', currentPage);
      setPageImages(prev => ({ ...prev, [currentPage]: cachedImageUrl }));
      return;
    }
    
    setIsGeneratingImage(true);
    
    try {
      const result = await SimpleImageService.generateStoryImage(
        storyText, 
        userInfo, 
        currentDifficulty,
        storyId,
        currentPage + 1,
        characterSessionId,
        isPremium
      );
      
      if (result.success && result.url) {
        setPageImages(prev => ({
          ...prev,
          [currentPage]: result.url
        }));
        
        // Cache with story continuity markers to prevent re-generation
        const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
        
        // Validate userInfo before extracting markers
        if (!userInfo || !userInfo.avatar) {
          console.warn('⚠️ Missing userInfo or avatar data for caching story markers');
        }
        
        const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
        EnhancedImageCache.cacheImage(
          storyText.slice(0, 120),
          result.url,
          characterSessionId,
          currentPage,
          undefined,
          storyId,
          storyMarkers
        );
        
        try {
          const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || userInfo.name || 'premium') : 'guest';
          const images = story.map((s, idx) => ({ url: idx === currentPage ? result.url : pageImages[idx], prompt: (s || '').slice(0, 120) }));
          StorySessionCache.updatePages(cacheId, story, currentPage, images as any);
        } catch {}
      }
      
    } catch (error) {
      console.log('Image generation failed, continuing without image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate illustration for any page index (batch-safe, no UI spinner)
  const generateImageForIndex = async (index: number) => {
    if (pageImages[index]) return;
    
    // Enhanced cache validation - check EnhancedImageCache first
    const storyText = story[index];
    try {
      const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
      
      // Validate userInfo structure
      if (!userInfo || !userInfo.avatar) {
        console.warn('⚠️ Missing userInfo or avatar data for index cache lookup');
      }
      
      const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
      const cachedImageUrl = EnhancedImageCache.getCachedImage(
        storyText.slice(0, 120), 
        characterSessionId, 
        index,
        storyId,
        storyMarkers
      );
      
      if (cachedImageUrl) {
        console.log('📸 Using cached image for page', index);
        setPageImages(prev => ({ ...prev, [index]: cachedImageUrl }));
        return;
      }
    } catch (cacheError) {
      console.warn('Failed to check image cache for index:', cacheError);
    }
    
    try {
      const sessionId = `session_${Date.now()}`;
      const result = await SimpleImageService.generateStoryImage(
        storyText,
        userInfo,
        currentDifficulty,
        storyId,
        index + 1,
        sessionId,
        isPremium
      );
      if (result.success && result.url) {
        const nextMap = { ...pageImages, [index]: result.url } as Record<number, string>;
        setPageImages(nextMap);
        
        // Cache in both systems to prevent re-generation
        try {
          const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
          
          // Validate userInfo before caching
          if (!userInfo || !userInfo.avatar) {
            console.warn('⚠️ Missing userInfo or avatar data for index caching');
          }
          
          const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
          EnhancedImageCache.cacheImage(
            storyText.slice(0, 120),
            result.url,
            characterSessionId,
            index,
            undefined,
            storyId,
            storyMarkers
          );
        } catch (cacheError) {
          console.warn('Failed to cache image for index:', cacheError);
        }
        
        try {
          const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || userInfo.name || 'premium') : 'guest';
          const images = story.map((s, idx) => ({ url: nextMap[idx], prompt: (s || '').slice(0, 120) }));
          StorySessionCache.updatePages(cacheId, story, currentPage, images as any);
        } catch {}
      }
    } catch (e) {
      console.warn('Batch image generation failed for page', index, e);
    }
  };

  const handleBatchGenerateImages = async () => {
    if (!isPremium || isBatchGenerating || !story.length) return;
    const missing = story.map((_, i) => i).filter(i => !pageImages[i]);
    if (!missing.length) return;
    setIsBatchGenerating(true);
    setBatchDone(0);
    setBatchTotal(missing.length);
    
    // Phase 1: Parallel processing with concurrency limit
    const concurrencyLimit = 4;
    const batches: number[][] = [];
    for (let i = 0; i < missing.length; i += concurrencyLimit) {
      batches.push(missing.slice(i, i + concurrencyLimit));
    }
    
    for (const batch of batches) {
      const promises = batch.map(idx => generateImageForIndex(idx));
      await Promise.allSettled(promises);
      setBatchDone(prev => prev + batch.length);
    }
    
    setIsBatchGenerating(false);
    try { toast({ title: 'Illustrations ready', duration: 3000 }); } catch {}
  };

  const countWords = (text: string) => {
    const matches = text?.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  };

  // LIVE GENERATION COORDINATION
  // This function manages real-time story generation, image creation, and state synchronization
  // It coordinates between NetflixStyleStoryService and BatchImageService for seamless UX
  const handleNext = async () => {
    // Stop audio when navigating (ensure audio halts)
    try { audioEngineRef.current.stop(); } catch {}
    setIsAudioPlaying(false);
    clearHighlighting();

    // Count words for the page we're leaving (once per page)
    if (stableDisplayedStory[currentPage] && !pagesCompleted.has(currentPage)) {
      const pageWordCount = countWords(stableDisplayedStory[currentPage]);
      setSessionWordsRead(prev => prev + pageWordCount);
      setPagesCompleted(prev => {
        const next = new Set(prev);
        next.add(currentPage);
        return next;
      });
      updateActivity({ wordsRead: pageWordCount, sessionPagesRead: 1 });
    }
    
    if (isPremium && !isStoryComplete && currentPage === story.length - 1) {
      // Premium: generate next page, append, then advance
      setJustAdvanced(true);
      const result = await generateNextPage();
      if (result && !result.error) {
        setStory(prev => [...prev, result.content]);
        setLiveContext(result.nextContext || null);
        setIsStoryComplete(result.isComplete);
        setCurrentPage(prev => prev + 1);
      }
      setTimeout(() => setJustAdvanced(false), 600);
    } else if (currentPage < stableDisplayedStory.length - 1) {
      // Navigate to next existing page
      setCurrentPage(currentPage + 1);
    } else {
      // Last page reached
      if (isPremium) {
        if (isStoryComplete) {
          // Start a sequel and continue reading
          setIsLoadingNextPage(true);
          try {
            const newContext: LiveGenerationContext = {
              userInfo,
              difficulty: currentDifficulty,
              expertGradeLevel: currentDifficulty === 'expert' ? (liveContext?.expertGradeLevel || expertGradeLevel) : undefined,
              storyContext: [...story],
              currentPage: story.length,
              totalExpectedPages: Math.max(story.length + 1, 6),
              characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
              openEnded: true,
            };
            const result = await LiveGenerationService.generateNextPage(newContext);
            if (result && !result.error) {
              setStory(prev => [...prev, result.content]);
              setLiveContext(result.nextContext || newContext);
              setIsStoryComplete(result.isComplete);
              setCurrentPage(prev => prev + 1);
              setJustAdvanced(true);
              setTimeout(() => setJustAdvanced(false), 600);
            }
          } catch (e) {
            console.error('Failed to continue sequel', e);
            toast({ title: t('errors.continueFailed','Could not continue'), description: t('errors.tryAgain','Please try again.'), variant: 'destructive' });
          } finally {
            setIsLoadingNextPage(false);
          }
          return;
        }
        // Fallback: continue generation if story not marked complete
        const result = await generateNextPage();
        if (result && !result.error) {
          setStory(prev => [...prev, result.content]);
          setLiveContext(result.nextContext || null);
          setIsStoryComplete(result.isComplete);
          setCurrentPage(prev => prev + 1);
          setJustAdvanced(true);
          setTimeout(() => setJustAdvanced(false), 600);
        }
        return;
      }
      const timeSpent = Date.now() - sessionStartTime;
      const totalWordsRead = sessionWordsRead;
      const sessionStats: SessionStats = {
        timeSpent,
        wordsRead: totalWordsRead,
        pagesRead: pagesCompleted.size,
        startTime: sessionStartTime,
        accuracy: 100
      };
      recordReadingSession({
        timeSpent,
        wordsRead: totalWordsRead,
        pagesRead: pagesCompleted.size,
        storyCompleted: true,
        readingSpeed: Math.round((totalWordsRead / timeSpent) * 60000)
      });
      // Persist essentials for SessionEnded fallback across reloads
      try { sessionStorage.setItem('last_user_info', JSON.stringify(userInfo)); } catch {}
      try { sessionStorage.setItem('last_story_text', story.join(' ')); } catch {} // Keep full story for upgrades
      onSessionEnded(sessionStats);
    }
  };

  const handlePrevious = () => {
    // Stop audio when navigating (ensure audio service halts)
    try { audioEngineRef.current.stop(); } catch {}
    setIsAudioPlaying(false);
    clearHighlighting();
    setCurrentPage(Math.max(0, currentPage - 1));
  };

useEffect(() => {
  // Persist current page for both tiers
  if (story.length > 0) {
    (async () => {
      try {
        const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || userInfo.name || 'premium') : 'guest';
        const avatarType = !isPremium && userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
        StorySessionCache.updateCurrentPage(cacheId, currentPage, avatarType);
      } catch {}
    })();
  }
}, [currentPage, isPremium, story.length, userInfo.name]);

useEffect(() => {
  const onNavigate = (e: Event) => {
    try {
      const detail = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail;
      console.log('📖 CleanStoryDisplay received navigation event:', detail);
      
      if (detail?.direction === 'next') {
        console.log('📖 Executing handleNext() - going to next page');
        handleNext();
      } else if (detail?.direction === 'prev') {
        console.log('📖 Executing handlePrevious() - going to previous page');
        handlePrevious();
      }
    } catch (error) {
      console.error('📖 Navigation event error:', error);
    }
  };
  window.addEventListener('reader:navigate', onNavigate as EventListener);
  return () => window.removeEventListener('reader:navigate', onNavigate as EventListener);
}, [handleNext, handlePrevious]);

useEffect(() => {
  // Persist full pages array for resume
  if (story.length > 0) {
    (async () => {
      try {
        const id = isPremium ? ((await supabase.auth.getUser()).data.user?.id || userInfo.name || 'premium') : 'guest';
        StorySessionCache.updatePages(id, story, currentPage);
      } catch {}
    })();
  }
}, [story, currentPage, isPremium, userInfo.name]);
  
  const handleWordInteraction = () => {
    setWordsInteracted(prev => prev + 1);
    updateActivity({ wordsRead: 1 });
  };

  // Timer controls with user pause tracking
  const handleToggleTimer = () => {
    console.log('🎯 Timer toggle clicked:', { isTimerRunning, userPausedTimer, isTimerCanceled });
    const newRunningState = !isTimerRunning;
    setIsTimerRunning(newRunningState);
    setUserPausedTimer(!newRunningState); // Track when user manually pauses
    console.log('🎯 Timer state after toggle:', { newRunningState, userPausedTimer: !newRunningState });
  };

  const handleReduceTime = () => {
    setTimeRemaining(prev => Math.max(5 * 60, prev - 5 * 60)); // Reduce by 5 minutes, minimum 5 minutes
  };

  // Bottom dock actions - enhanced with immediate state updates
  const handleDockPlayAudio = async () => {
    if (!isPremium && audioPlayedPage === currentPage && !isAudioPlaying) {
      toast({ title: t('audioReading.audioUsed','Audio used'), description: t('audioReading.audioUsedTooltip','Audio used (1x per page for free users)'), duration: 2000 });
      return;
    }
    
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      setIsAudioLoading(false);
      try { 
        audioEngineRef.current.stop(); 
      } catch (error) {
        console.warn('Dock stop failed:', error);
      }
    } else {
      try {
        setIsAudioLoading(true);
        await audioEngineRef.current.playTextWithSynchronization({
          text: currentStoryText || "",
          context: 'conversation',
          onWordHighlight
        });
        // State will be updated via callback, but ensure it's set for immediate feedback
        setIsAudioPlaying(true);
        setIsAudioLoading(false);
        if (!isPremium) setAudioPlayedPage(currentPage);
      } catch (error) {
        console.warn('Dock play failed:', error);
        setIsAudioPlaying(false); // Reset on error
        setIsAudioLoading(false);
      }
    }
  };

const handleDockVoiceCommand = () => {
  // Voice functionality is now handled directly in MobileActionDock
  console.log('🎤 Voice command handled by MobileActionDock integration');
};

// Voice command handler for headless controller
const handleVoiceCommand = (command: string) => {
  console.log('🎙️ Voice command received:', command);
  
  const cmd = command.toLowerCase().trim();
  
  if (cmd.includes('start reading') || cmd.includes('read') || cmd.includes('play')) {
    handleDockPlayAudio();
  } else if (cmd.includes('pause') || cmd.includes('stop')) {
    try { audioEngineRef.current.stop(); } catch (e) { console.warn('Voice pause failed', e); }
  } else if (cmd.includes('next page') || cmd.includes('next')) {
    handleNext();
  } else if (cmd.includes('previous page') || cmd.includes('previous') || cmd.includes('back')) {
    handlePrevious();
  } else if (cmd.includes('increase font') || cmd.includes('bigger text')) {
    // Font size adjustment logic would go here
    console.log('Font size increase requested');
  } else if (cmd.includes('decrease font') || cmd.includes('smaller text')) {
    // Font size adjustment logic would go here
    console.log('Font size decrease requested');
  } else if (cmd.includes('open settings') || cmd.includes('settings')) {
    // Settings logic would go here
    console.log('Settings requested');
  }
};

const handleDockCoach = () => {
  setShowCoach(true);
};

  // Manual end session logic exists below
  const handleEndSession = async () => {
    const timeSpent = (20 * 60 - timeRemaining) * 1000; // Convert to milliseconds
    const totalWordsRead = sessionWordsRead;
    
    // Clear character state when session ends for both free and premium users
    try {
      StoryVisualStateManager.clearBasedOnContext(characterSessionId, isPremium, 'end-session');
      console.log('🏁 Cleared character state on session end');
    } catch (error) {
      console.warn('Failed to clear character state on session end:', error);
    }
    
    const sessionStats = {
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: pagesCompleted.size,
      startTime: sessionStartTime,
      accuracy: 100
    };
    
    recordReadingSession({
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: pagesCompleted.size,
      storyCompleted: currentPage === stableDisplayedStory.length - 1,
      readingSpeed: Math.round((totalWordsRead / timeSpent) * 60000)
    });
    
    try { sessionStorage.removeItem('readingTimerPausedSeconds'); } catch {}
    // Persist essentials for SessionEnded fallback across reloads
    try { sessionStorage.setItem('last_user_info', JSON.stringify(userInfo)); } catch {}
    try { sessionStorage.setItem('last_story_text', story.join(' ')); } catch {} // Keep full story for upgrades
    onSessionEnded(sessionStats);
  };

  // Premium timer controls
  const handleCancelTimer = () => {
    setIsTimerCanceled(true);
    setIsTimerRunning(false);
    setUserPausedTimer(false); // Reset user pause state when canceled
  };

  const handleKeepReadingUntimed = () => {
    if (!isPremium) return;
    setIsTimerCanceled(true);
    setIsTimerRunning(false);
  };

const handleSaveStoryNow = async () => {
    if (!isPremium || story.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      // Import StoryCacheIntegration service
      const { StoryCacheIntegration } = await import('@/services/StoryCacheIntegration');
      
      // Generate story hash for consistent image caching
      const storyHash = StoryCacheIntegration.generateStoryHash(story);
      
      // Cache all session images with story hash
      const imageMetadata = await StoryCacheIntegration.cacheStoryImages(
        storyHash, 
        pageImages, 
        'story-save-session'
      );
      
      // Build Story object with image cache metadata
      const segments = story.map((text, idx) => ({ text, illustration: pageImages[idx] }));
      const wordCount = story.reduce((sum, s) => sum + countWords(s), 0);
      const estimatedReadingTime = Math.max(1, Math.round(wordCount / 150));
      const storyObj: StoryType = {
        id: `story-${Date.now()}`,
        title: storyTitle || `${userInfo.name}'s Adventure`,
        segments,
        difficulty: currentDifficulty,
        estimatedReadingTime,
        wordCount,
      };
      
      await PremiumStoryManager.saveStory(
        storyObj as any, 
        userInfo, 
        isStoryComplete ? ['ended'] : ['in-progress'], 
        false,
        imageMetadata
      );
      setHighlightSave(false);
      toast({ title: t('save.toastSaved', 'Saved to your Story Library'), duration: 3000 });
    } catch (e) {
      console.error('Save story failed', e);
      toast({ title: t('save.toastError', "We couldn’t save your story. Please try again."), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

const handleExtendTime = () => {
  const extension = 15 * 60; // 15 minutes
  const maxTime = 60 * 60; // 60 minutes max
  if (timeRemaining >= maxTime) {
    return;
  }
  const newValue = Math.min(maxTime, timeRemaining + extension);
  setTimeRemaining(newValue);
};

const handleRestartTimer = () => {
  setIsTimerCanceled(false);
  setIsTimerVisible(true);
  setTimeRemaining(20 * 60);
  setIsTimerRunning(true);
  setUserPausedTimer(false); // Reset user pause state when restarted
};

  // Fetch persistent teacher words (per active child) for the current user
  const fetchTeacherWordsCsv = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_preferences')
        .select('story_preferences, active_child_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.warn('Failed to load teacher words', error);
        return null;
      }
      const storyPrefs = (data as any)?.story_preferences || {};
      const activeChildId = (data as any)?.active_child_id || 'default';
      const lists = storyPrefs?.teacherWordLists || {};
      let arr: any = lists?.[activeChildId];
      if (!Array.isArray(arr) || arr.length === 0) arr = lists?.['default'];
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const cleaned = (arr as any[])
        .map((w) => typeof w === 'string' ? w.trim() : '')
        .filter(Boolean)
        .slice(0, 20);
      return cleaned.length ? cleaned.join(', ') : null;
    } catch (e) {
      console.warn('Teacher words fetch error', e);
      return null;
    }
  };

  // Magic wand functionality - Generate new story
  const handleGenerateNewStory = async (specialRequestOverride?: string, isRewrite: boolean = false) => {
    if (isGeneratingNewStory || isGeneratingRewrite) return;
    
    console.log('🔄 User explicitly requested new story - unlocking content', {
      isRewrite,
      specialRequest: !!specialRequestOverride,
      storyContentLocked: storyContentLockedRef.current
    });
    
    // 🔒 EMERGENCY FIX: Unlock content for explicit new story generation
    setIsStoryContentLocked(false);
    storyContentLockedRef.current = false;
    storyGeneratedRef.current = false;
    setIsStoryStable(false);
    setContentMutationLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      trigger: isRewrite ? 'user-rewrite-request' : 'user-new-story-request',
      action: 'content-unlocked-for-regeneration',
      storyLength: story.length,
      isLocked: false
    }]);
    
    if (isRewrite) {
      setIsGeneratingRewrite(true);
    } else {
      setIsGeneratingNewStory(true);
    }
    
    // Reset generation protection flags for new story
    lastUserInfoRef.current = '';
    storyGeneratedRef.current = false;
    isGeneratingRef.current = false;
    lastUserInfoRef.current = '';
    
    try {
      console.log('🪄 Generating new story...');
      
      // Generate new story ID for cache isolation
      const newStoryId = `story_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setStoryId(newStoryId);
      
      // Generate new character session ID for new characters
      const newCharacterSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Context-aware character state clearing based on user type and action
      if (isRewrite) {
        if (isPremium) {
          // Premium rewrite: Clear story content but preserve avatar identity
          console.log('🎭 Premium rewrite: Preserving avatar type + skin tone');
          
          // Use comprehensive cache manager for premium rewrite
          const { SessionCacheManager } = await import('@/services/SessionCacheManager');
          const userId = (await supabase.auth.getUser()).data.user?.id || userInfo.name || 'premium';
          
          SessionCacheManager.clearAllSessionCaches({
            userId,
            sessionId: characterSessionId,
            avatarType: userInfo.avatar?.type,
            skinTone: userInfo.avatar?.skinTone,
            reason: 'premium-rewrite',
            preserveAvatarIdentity: true,
            clearVisualState: false // Keep avatar-related visual state
          });

          // Clear only story images, preserve character consistency seeds
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearStoryImagesKeepCharacterSeeds(
            characterSessionId, 
            userInfo.avatar?.type
          );
          setPageImages({});

        } else {
          // Free rewrite: Clear everything for fresh characters
          console.log('🎭 Free rewrite: Clearing all character state');
          StoryVisualStateManager.clearBasedOnContext(characterSessionId, isPremium, 'rewrite');
          
          // Clear all images for free users
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearSession(characterSessionId);
          setPageImages({});
        }
      } else {
        // New story (not rewrite): Clear character state appropriately
        console.log('🎭 New story: Clearing character state for fresh generation');
        StoryVisualStateManager.clearBasedOnContext(characterSessionId, isPremium, 'next-story');
      }
      
      // Clear previous story cache for free users to prevent cache growth
      if (!isPremium) {
        try {
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearSession(characterSessionId);
          setPageImages({});
          console.log('📸 Cleared previous story cache for free user');
        } catch (error) {
          console.warn('Failed to clear previous story cache:', error);
        }
      }
      if (isPremium) {
        // Merge per-story request with persistent teacher word list (premium only)
        let combinedSpecial = (specialRequestOverride ?? userInfo.specialRequest ?? '') as string;
        const teacherCsv = await fetchTeacherWordsCsv();
        if (teacherCsv) {
          combinedSpecial = `${combinedSpecial ? combinedSpecial + '\n' : ''}Teacher words: ${teacherCsv}`;
        }
        const effectiveUser = {
          ...userInfo,
          specialRequest: combinedSpecial,
          difficultyLevel: currentDifficulty,
          readingAbility: currentDifficulty,
          expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
        } as UserInfo;
        const sessionTypeParam = isRewrite ? 'rewrite' : 'new';
        console.log(`🔄 Premium rewrite: Passing sessionType '${sessionTypeParam}' to LiveGenerationService`);
        const first = await LiveGenerationService.generateFirstPage(effectiveUser, sessionTypeParam);
        if ((first as any).error) {
          throw new Error((first as any).error);
        }
        setStory([first.content]);
        setCurrentPage(0);
        setLiveContext(first.nextContext || null);
        if (first.nextContext?.expertGradeLevel) {
          setExpertGradeLevel(first.nextContext.expertGradeLevel);
        }
        setIsStoryComplete(first.isComplete);
        setStoryTitle(`${userInfo.name}'s Live Adventure`);
      } else {
        const originalPageCount = story.length;
        // ✅ CRITICAL FIX: Debug userInfo for story refresh
        const refreshUserInfo = {
          ...userInfo,
          specialRequest: specialRequestOverride ?? userInfo.specialRequest,
          difficultyLevel: currentDifficulty,
          readingAbility: currentDifficulty,
          expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
        } as UserInfo;
        
        console.log('🚨 [GENDER DEBUG] Story refresh userInfo:', {
          name: refreshUserInfo.name,
          avatarType: refreshUserInfo.avatar?.type,
          avatarSkinTone: refreshUserInfo.avatar?.skinTone,
          fullAvatar: refreshUserInfo.avatar
        });
        
        const result = await NetflixStyleStoryService.generateCompleteStory(refreshUserInfo);
        const newStory = result.pages.slice(0, originalPageCount || result.pages.length);
        setStory(newStory);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Failed to generate new story:', error);
      toast({ title: 'Magic Failed', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setIsGeneratingNewStory(false);
      setIsGeneratingRewrite(false);
    }
  };
  // Open special request dialog for premium users, or generate immediately for free
  const handleNewStoryClick = () => {
    if (isPremium) {
      setSpecialRequestDraft(userInfo?.specialRequest || "");
      setShowSpecialRequestDialog(true);
    } else {
      handleGenerateNewStory();
    }
  };

  // Handle rewrite story with dialog for premium users (correct context isolation)
  const handleRewriteWithDialog = () => {
    if (isPremium) {
      setSpecialRequestDraft(userInfo?.specialRequest || "");
      setShowSpecialRequestDialog(true);
      setIsRewriteMode(true); // Mark as rewrite mode
    } else {
      handleGenerateNewStory(undefined, true);
    }
  };

  // Handle rewrite story (clear all caches for fresh start)
  const handleRewriteStory = () => {
    handleGenerateNewStory(undefined, true);
  };

  // Submit special request and start generation
  const handleSpecialRequestSubmit = (value: string) => {
    setSpecialRequestDraft(value);
    setShowSpecialRequestDialog(false);
    if (isRewriteMode) {
      setIsRewriteMode(false); // Reset rewrite mode
      handleGenerateNewStory(value, true); // Call with isRewrite = true
    } else {
      handleGenerateNewStory(value);
    }
  };

  // End Story follow-up actions (Premium)

  const handleStartSequel = () => {
    // Premium users continuing to "Part II" - preserve character state
    console.log('🔗 Premium user starting sequel - preserving character state');
    
    // Create new session ID for the sequel but keep character consistency
    const newCharacterSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Create continuation session to preserve character appearances
    const success = StoryVisualStateManager.createContinuationSession(
      characterSessionId, 
      newCharacterSessionId
    );
    
    if (success) {
      console.log('✅ Character state preserved for sequel continuation');
    } else {
      console.warn('⚠️ Failed to preserve character state for sequel');
    }
    
    const newContext: LiveGenerationContext = {
      userInfo,
      difficulty: currentDifficulty,
      expertGradeLevel: currentDifficulty === 'expert' ? (liveContext?.expertGradeLevel || expertGradeLevel) : undefined,
      storyContext: [...story],
      currentPage: story.length,
      totalExpectedPages: Math.max(story.length + 1, 6),
      characters: [userInfo.name, userInfo.favoriteAnimal || 'friend'],
      openEnded: true,
    };
    setLiveContext(newContext);
    setIsStoryComplete(false);
    setShowEndStoryModal(false);
  };

  // Generate a concluding page (Premium) without ending the session
  const handleGenerateEndingPage = async () => {
    if (!isPremium || !liveContext || isGeneratingEnding) return;
    setIsGeneratingEnding(true);
    try {
      const result = await LiveGenerationService.generateEndingPage(liveContext);
      if (result && !result.error) {
        setStory(prev => [...prev, result.content]);
        setIsStoryComplete(true);
        setLiveContext(null);

        // Determine the index of the newly added ending page
        const endingPageIndex = story.length; // new last index after append
        setLastEndingPageIndex(endingPageIndex);

        // Auto-advance to the newly generated concluding page
        setCurrentPage(prev => prev + 1);
        setJustAdvanced(true);
        setTimeout(() => setJustAdvanced(false), 600);

        // Show expanded "Finish Story" CTA on the ending page only
        finishExpandedOnPageRef.current = endingPageIndex;
        setFinishCTAExpanded(true);

        setHighlightSave(true);
      }
    } catch (e) {
      console.error('Failed to generate ending page', e);
      toast({ title: "Ending failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingEnding(false);
    }
  };
  // Manual End Session (Premium): 5s celebration with music then stats
  const handleManualEndSession = async () => {
    setShowManualCelebration(true);
    try {
      const audio = new Audio('/audio/celebration.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
    setTimeout(async () => {
      setShowManualCelebration(false);
      await handleEndSession();
    }, 5000);
  };
  const handleDifficultyChange = async (direction: 'up' | 'down') => {
    // Respect parent guardrails for premium users
    if (isPremium) {
      if (lockDifficulty) {
        toast({ title: t('reader.toasts.difficultyLocked'), duration: 3000 });
        return;
      }
      const currentIndex = difficultyLevels.indexOf(currentDifficulty);
      const minIndex = difficultyLevels.indexOf(minDifficulty);
      if (direction === 'down' && currentIndex <= minIndex) {
        if (allowDecreaseBelowMin) {
          // Allow decrease with an explanatory toast
          toast({ title: t('reader.toasts.minBelowAllowed', 'Going below the set minimum for this session'), duration: 3000 });
        } else {
          toast({ title: t('reader.toasts.minLevelReached', { minDifficulty }), duration: 3000 });
          return;
        }
      }
      // Expert internal grade guardrail only applies when minimum is set to Expert
      if (currentDifficulty === 'expert' && direction === 'down' && minDifficulty === 'expert') {
        const gradeOrder: ("6th" | "7th" | "8th" | "9th" | "10th")[] = ["6th", "7th", "8th", "9th", "10th"];
        const currentGradeIndex = gradeOrder.indexOf(expertGradeLevel);
        const minGradeIndex = gradeOrder.indexOf(minExpertGrade);
        if (currentGradeIndex <= minGradeIndex) {
          toast({ title: t('reader.toasts.minExpertGradeReached', { minExpertGrade }), duration: 3000 });
          return;
        }
      }
    }
    setIsChangingDifficulty(true);
    setChangeDirection(direction === 'up' ? 'increase' : 'decrease');
    
    const currentIndex = difficultyLevels.indexOf(currentDifficulty);
    let newIndex = currentIndex;
    let newGradeLevel = expertGradeLevel;
    
    // Handle expert mode internal grade cycling
    if (currentDifficulty === 'expert') {
      const gradeOrder: ("6th" | "7th" | "8th" | "9th" | "10th")[] = ["6th", "7th", "8th", "9th", "10th"];
      const currentGradeIndex = gradeOrder.indexOf(expertGradeLevel);
      
      if (direction === 'up' && currentGradeIndex < gradeOrder.length - 1) {
        newGradeLevel = gradeOrder[currentGradeIndex + 1];
        setExpertGradeLevel(newGradeLevel);
      } else if (direction === 'down' && currentGradeIndex > 0) {
        newGradeLevel = gradeOrder[currentGradeIndex - 1];
        setExpertGradeLevel(newGradeLevel);
      } else if (direction === 'down' && currentGradeIndex === 0) {
        // Transition from expert to hard
        newIndex = currentIndex - 1;
      }
    } else {
      // Normal difficulty progression
      if (direction === 'up' && currentIndex < difficultyLevels.length - 1) {
        newIndex = currentIndex + 1;
        if (difficultyLevels[newIndex] === 'expert') {
          setExpertGradeLevel("6th"); // Start expert at grade 6th
        }
      } else if (direction === 'down' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }
    }
    
      if (newIndex !== currentIndex) {
        const newDifficulty = difficultyLevels[newIndex];
        setCurrentDifficulty(newDifficulty);
        
        // Store the difficulty choice locally
        DifficultyManager.storeDifficulty(userInfo.name || 'guest', newDifficulty, userInfo);
        
        // Persist to Supabase profile and preferences when authenticated
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ difficulty_level: newDifficulty }).eq('user_id', user.id);
            if (newDifficulty === 'expert') {
              // Save last expert grade for restoration
              const { data: existing } = await supabase
                .from('user_preferences')
                .select('id, reading_preferences')
                .eq('user_id', user.id)
                .maybeSingle();
              const basePrefs = (existing && typeof existing.reading_preferences === 'object') ? (existing.reading_preferences as Record<string, any>) : {};
              const reading_preferences = { ...basePrefs, lastExpertGrade: newGradeLevel };
              if (existing?.id) {
                await supabase.from('user_preferences').update({ reading_preferences }).eq('id', existing.id);
              } else {
                await supabase.from('user_preferences').insert([{ user_id: user.id, reading_preferences }]);
              }
            }
          }
        } catch (e) {
          console.warn('Could not persist difficulty preference', e);
        }
        
        // Update live context for premium users
        if (isPremium && liveContext) {
          setLiveContext(prev => prev ? {
            ...prev, 
            difficulty: newDifficulty,
            expertGradeLevel: newDifficulty === 'expert' ? newGradeLevel : undefined
          } : null);
        }
        
        // Animate badge change
        setTimeout(() => setChangeDirection('badge'), 200);
      } else if (currentDifficulty === 'expert') {
        // Update live context for expert grade level changes
        if (isPremium && liveContext) {
          setLiveContext(prev => prev ? {...prev, expertGradeLevel: newGradeLevel} : null);
        }
        // Persist last expert grade
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: existing } = await supabase
              .from('user_preferences')
              .select('id, reading_preferences')
              .eq('user_id', user.id)
              .maybeSingle();
            const basePrefs = (existing && typeof existing.reading_preferences === 'object') ? (existing.reading_preferences as Record<string, any>) : {};
            const reading_preferences = { ...basePrefs, lastExpertGrade: newGradeLevel };
            if (existing?.id) {
              await supabase.from('user_preferences').update({ reading_preferences }).eq('id', existing.id);
            } else {
              await supabase.from('user_preferences').insert([{ user_id: user.id, reading_preferences }]);
            }
          }
        } catch (e) {
          console.warn('Could not persist expert grade preference', e);
        }
        
        // Animate badge change for expert level progression
        setTimeout(() => setChangeDirection('badge'), 200);
      }
    
    // Complete animation
    setTimeout(() => {
      setIsChangingDifficulty(false);
      setChangeDirection(undefined);
    }, 800);
  };


  // Get mobile-optimized text configuration
  const mobileTextConfig = getMobileTextConfig(currentDifficulty);
  const mobileContainerConfig = getMobileStoryContainer(currentDifficulty);

  const progress = stableDisplayedStory.length > 0 ? ((currentPage + 1) / stableDisplayedStory.length) * 100 : 0;
  const currentImage = pageImages[currentPage];
  const isShortPage = countWords(currentStoryText || "") <= 8;
  const controlsBlocked = (!isPremium && timeRemaining <= 0) || (isPremium && timerEnabled && !isTimerCanceled && timeRemaining <= 0);

  // Aggressive prefetch: progressively preload many upcoming images without blocking UI
  useEffect(() => {
    const urls: string[] = [];
    // Prefer forward direction, then backward few pages
    for (let i = currentPage + 1; i < story.length; i++) {
      const url = pageImages[i];
      if (url && !preloadedUrlsRef.current.has(url)) urls.push(url);
    }
    for (let i = Math.max(0, currentPage - 2); i < currentPage; i++) {
      const url = pageImages[i];
      if (url && !preloadedUrlsRef.current.has(url)) urls.push(url);
    }

    if (!urls.length) return;

    let cancelled = false;
    let idx = 0;

    const pump = () => {
      if (cancelled) return;
      const batch = urls.slice(idx, idx + 4); // small batches
      batch.forEach((u) => {
        try {
          const img = new Image();
          (img as any).decoding = 'async';
          (img as any).loading = 'eager';
          img.src = u;
          preloadedUrlsRef.current.add(u);
        } catch {}
      });
      idx += 4;
      if (idx < urls.length) setTimeout(pump, 60); // gentle pacing
    };

    const schedule = (cb: () => void) => {
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === 'function') ric(() => cb());
      else setTimeout(cb, 0);
    };

    schedule(pump);
    return () => { cancelled = true; };
  }, [currentPage, pageImages, story.length]);

  // PHASE 1: Show proper loading state with phase messages
  if (isLoading || forceLoaderActive) {
    const loadingMessage = isStoryStable 
      ? "Preparing your story..." 
      : "Creating your magical story...";
    
    return (
      <AdaptiveEnhancedLoading 
        isPremium={isPremium} 
        userName={userInfo.name} 
        message={loadingMessage}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          
          {/* Diagnostic Panel for troubleshooting */}
          <div className="mb-6">
            <DiagnosticPanel userInfo={userInfo} />
            <ApiKeyDiagnostic />
          </div>
          
          <MobileOptimizedButton onClick={() => (onNewStory ? onNewStory() : window.location.reload())} className="bg-white text-primary">
            Try Again
          </MobileOptimizedButton>
        </div>
      </div>
    );
  }

  return (
    <GameContextProvider 
      userId={userInfo.name} 
      userType={isPremium ? 'premium' : 'free'}
      userInfo={userInfo}
    >
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-primary mobile-optimized flex flex-col">
        {/* Responsive Header */}
        <ResponsiveStoryHeader
          storyTitle={storyTitle}
          currentDifficulty={currentDifficulty}
          userInfo={userInfo}
          onHome={onHome}
          onNewStory={isPremium && stableDisplayedStory.length > 0 ? handleRewriteWithDialog : handleNewStoryClick}
          onIncreaseDifficulty={() => handleDifficultyChange('up')}
          onDecreaseDifficulty={() => handleDifficultyChange('down')}
          showLevelControls={true}
          isChangingDifficulty={isChangingDifficulty}
          changeDirection={changeDirection}
          canIncrease={!lockDifficulty && (currentDifficulty !== 'expert' || expertGradeLevel !== "10th")}
          canDecrease={!lockDifficulty && (allowDecreaseBelowMin || (difficultyLevels.indexOf(currentDifficulty) > difficultyLevels.indexOf(minDifficulty)))}
          onEndSession={() => setShowEndSessionConfirm(true)}
          onSaveStory={isPremium ? handleSaveStoryNow : undefined}
          isSaving={isSaving}
          highlightSave={highlightSave}
          isPremium={isPremium}
          wandPulse={wandPulse}
          isGeneratingRewrite={isGeneratingRewrite}
        />


        {/* Main Content - Full Width Layout */}
        <main className="w-full px-2 md:px-4 lg:px-6 xl:px-8 flex-1 min-h-0 pb-[calc(env(safe-area-inset-bottom)+88px)] md:pb-8">
        <div className="w-full max-w-[98vw] mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-white/70 mobile-text-fixed flex flex-col h-full min-h-0 overflow-hidden">
            <CardContent className="p-2 lg:p-8 h-full flex flex-col min-h-0">
              {/* Progress Bar + Centered Navigation */}
              <div className="mb-4 md:mb-6">
                <Progress value={progress} className="h-2" />
                <div className="mt-2 flex items-center justify-center gap-3">
                  <Button
                    id="reader-prev"
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 0 || controlsBlocked}
                    aria-label={t('nav.prev','Back')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground text-center min-w-[96px]">
                    Page {currentPage + 1}
                  </p>
                  <Button
                    id="reader-next"
                    variant="default"
                    size="sm"
                    onClick={handleNext}
                    disabled={isLoadingNextPage || controlsBlocked || (!isPremium && currentPage >= 5) || isForwardNavigationBlocked}
                    aria-label={t('nav.next','Next')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div
                id="audio-controls"
                className={isMobileOrTablet ? "sr-only" : "mt-2 md:mt-4 flex justify-center gap-4"}
                aria-hidden={isMobileOrTablet}
              >
                <div className="flex items-center gap-4">
                    <SynchronizedAudioControls
                      text={currentStoryText || ""}
                      contentHash={contentHash}
                      onWordHighlight={onWordHighlight}
                      onPlayingChange={handleAudioStateChange}
                    />
                  {isPremium && (
                    <Button 
                      variant={isConnected ? "default" : "outline"} 
                      size="lg" 
                      onClick={handleVoiceToggle}
                      disabled={isConnecting}
                      className={cn(
                        "transition-all",
                        isConnected && "ring-2 ring-primary/40",
                        isSpeaking && "bg-warning text-warning-foreground"
                      )}
                      aria-label={isConnected ? "Stop talking to Buddy" : "Talk to Buddy"}
                    >
                      <Mic className={cn("w-4 h-4 mr-2", isSpeaking && "animate-pulse")} />
                      {isConnecting ? "Connecting..." : isConnected ? "Buddy Listening" : "Talk to Buddy"}
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="lg" aria-label="Open Help Me Read">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Help Me Read
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[min(96vw,720px)] max-h-[85vh] overflow-y-auto p-0">
                      <DialogHeader>
                        <DialogTitle>Help Me Read</DialogTitle>
                      </DialogHeader>
                      {/* @ts-ignore */}
                      <ReadAloudCoach targetText={currentStoryText || ""} isPremium={isPremium} language={userInfo?.nativeLanguage || 'en'} onUpgrade={onUpgrade} />
                    </DialogContent>
                  </Dialog>
                  {isPremium && (
                    <Button onClick={handleSaveStoryNow} size="lg" variant={highlightSave ? "secondary" : "outline"} disabled={isSaving} aria-label={t('nav.save','Save')} className={cn(highlightSave ? 'ring-2 ring-primary/40' : '')}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('nav.save','Save')}
                    </Button>
                  )}

                </div>
                {!isMobileOrTablet && isAudioPlaying && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Playing Audio
                  </div>
                )}
              </div>

              {/* Story Content - Enhanced Layout for Desktop Split-Screen */}
              <div className="bg-gradient-card rounded-2xl p-2 md:p-4 lg:p-6 mb-6 flex-1 min-h-0 flex flex-col shadow-xl" 
                   dir="ltr" lang="en" role="main" aria-label="Story content">
                {/* Mobile/Tablet: Top-half image, bottom-half text (full-bleed, no gray) */}
                <div className="xl:hidden flex-1 min-h-0 flex flex-col gap-3">
                  {/* Top Half: Image */}
                  <div className="relative flex-[0.62] min-h-0 w-full rounded-2xl overflow-hidden shadow-2xl">
                    {isPremium && (Object.keys(pageImages).length < story.length) && !isBatchGenerating && (
                      <div className="absolute top-3 right-3 z-20">
                          <Button size="sm" variant="secondary" onClick={handleBatchGenerateImages} disabled={false} aria-label="Fix missing illustrations">
                          <Sparkles className="w-4 h-4 mr-1" />
                          Fix Images
                        </Button>
                      </div>
                    )}
                    {isBatchGenerating && (
                      <div className="absolute top-3 right-3 z-20 rounded-md bg-card/90 border px-2 py-1 text-xs">
                        {batchDone}/{batchTotal}
                      </div>
                    )}
                    {currentImage ? (
                      <>
                        {/* Background fill to avoid cropping/margins */}
                        <img
                          src={currentImage}
          alt={`Story illustration for page ${currentPage + 1}: ${stableDisplayedStory[currentPage]?.substring(0, 100)}...`}
                          className="absolute inset-0 h-full w-full object-cover blur-md scale-110 brightness-[1.05]"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            console.warn('Story image failed to load, switching to classic fallback:', currentImage);
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            fallbackToClassic('image-error');
                          }}
                        />
                        {/* Foreground clean image, never cropped - Enhanced with fallback handling */}
                        <ImageWithFallback
                          src={currentImage}
          alt={`Story illustration for page ${currentPage + 1}: ${stableDisplayedStory[currentPage]?.substring(0, 100)}...`}
          className="relative z-10 h-full w-full object-contain"
          fallbackText={`📖 Page ${currentPage + 1}`}
          onLoadingChange={handleImageLoadingChange}
          onFallbackUsed={handleImageFallbackUsed}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={generateImageForCurrentPage}
                           disabled={isGeneratingImage}
                          size="lg"
                          aria-label="Generate illustration"
                        >
                          {isGeneratingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Wand className="w-4 h-4 mr-2" />
                          )}
                          Generate illustration
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Image Status moved to main content area */}

                  {/* Bottom Half: Text (scrollable) + audio controls */}
                  <div className="flex-[0.42] min-h-0 w-full rounded-2xl shadow-2xl bg-card overflow-hidden flex flex-col relative">
                    {isPremium && isLoadingNextPage && currentPage === stableDisplayedStory.length - 1 && !isStoryComplete && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
                        <div className="rounded-xl px-4 py-3 bg-card/90 shadow-lg border border-primary/20 animate-enter">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Generating next page...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={cn("flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-4")}>
                      <div 
                        className={cn("story-content storybook-frame w-full", justAdvanced && "animate-enter")}
                        data-difficulty={currentDifficulty}
                      >
                        {stableDisplayedStory.length > 0 && currentStoryText && currentStoryText.trim().length > 0 ? (
                          processTextWithConsistentFlow({
                            text: currentStoryText,
                            className: "interactive-word",
                            difficulty: currentDifficulty,
                            userInfo,
                            isPremium,
                            userId: userInfo.name,
                            highlightedWordIndex: currentHighlightedWord,
                            isMobile: preferMobileModal
                          })
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Loading story content...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Perfectly mirrored split columns */}
                <div className="hidden xl:grid grid-cols-2 gap-0 flex-1 min-h-0">
                  {/* Image Section - LEFT SIDE - Equal size on desktop */}
                  {layout !== 'classic' && (
                    <div className="xl:order-1 h-full min-h-0">
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                        {isPremium && (Object.keys(pageImages).length < story.length) && !isBatchGenerating && (
                          <div className="absolute top-3 right-3 z-20">
                            <Button size="sm" variant="secondary" onClick={handleBatchGenerateImages} disabled={false} aria-label="Fix missing illustrations">
                              <Sparkles className="w-4 h-4 mr-1" />
                              Fix Images
                            </Button>
                          </div>
                        )}
                        {isBatchGenerating && (
                          <div className="absolute top-3 right-3 z-20 rounded-md bg-card/90 border px-2 py-1 text-xs">
                            {batchDone}/{batchTotal}
                          </div>
                        )}
                        {currentImage ? (
                          <ImageWithFallback
                            src={currentImage} 
                            alt={`Story illustration for page ${currentPage + 1}: ${stableDisplayedStory[currentPage]?.substring(0, 100)}...`}
                            className="w-full h-full object-cover"
                            fallbackText={`📖 Page ${currentPage + 1}`}
                            onLoadingChange={handleImageLoadingChange}
                            onFallbackUsed={handleImageFallbackUsed}
                          />
                        ) : isGeneratingImage ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Creating illustration...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Button
                              onClick={generateImageForCurrentPage}
                              disabled={isGeneratingImage}
                              size="lg"
                              aria-label="Generate illustration"
                            >
                              {isGeneratingImage ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Wand className="w-4 h-4 mr-2" />
                              )}
                              Generate illustration
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Text Content - RIGHT SIDE - Equal size on desktop */}
                  <div className="xl:order-2 flex flex-col h-full min-h-0">
                    <div className="w-full h-full min-h-0 rounded-2xl overflow-hidden shadow-2xl bg-card relative">
                      {isPremium && isLoadingNextPage && currentPage === stableDisplayedStory.length - 1 && !isStoryComplete && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
                          <div className="rounded-xl px-4 py-3 bg-card/90 shadow-lg border border-primary/20 animate-enter">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">Generating next page...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={cn("h-full overflow-y-auto overflow-x-hidden p-3 md:p-4", isShortPage && "flex items-center justify-center")}> 
                        <div 
                          className={cn("story-content story-content--compact w-full", isPremium && isShortPage && "text-center", justAdvanced && "animate-enter")}
                          data-difficulty={currentDifficulty}
                        >
                          {stableDisplayedStory.length > 0 && currentStoryText && currentStoryText.trim().length > 0 ? (
                            processTextWithConsistentFlow({
                              text: currentStoryText,
                              className: "interactive-word",
                              difficulty: currentDifficulty,
                              userInfo,
                              isPremium,
                              userId: userInfo.name,
                              highlightedWordIndex: currentHighlightedWord,
                              isMobile: preferMobileModal
                            })
                           ) : (
                             <div className="flex items-center justify-center h-32">
                               <div className="text-center">
                                 <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                                 <p className="text-sm text-muted-foreground">Loading story content...</p>
                               </div>
                             </div>
                            )}
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Ending burst/glow overlay after final page generation */}
              {showEndingBurst && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                  <div className="absolute inset-0 bg-background/40 animate-fade-out" />
                  <SparkleAnimation isActive intensity="high" className="absolute inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-600/40 to-blue-600/40 blur-3xl glow-purple animate-enter" />
                  </div>
                </div>
              )}

               {/* Magic Wand Buttons Section */}
              <div className="mb-6 flex flex-col items-center gap-4">
                {/* Premium Magic Wand - Below page count */}
                {isPremium && finishCTAExpanded && (
                  <div className="text-center relative">
                    <p className="text-lg font-bold mb-4 px-4 py-2 rounded-full animate-pulse leading-tight" aria-live="polite">
                      <span className="inline-flex items-center gap-2">
                        <FriendlyUpArrowIcon size={22} className="text-destructive shrink-0 align-middle -translate-y-[1px]" />
                        {"Here's how this one ends! Don't forget to save 😊"}
                      </span>
                    </p>

                    <div className="relative">
                      <SparkleAnimation 
                        isActive={true} 
                        intensity="high" 
                        className="absolute inset-0 pointer-events-none z-10" 
                      />

                       <Button
                         data-id="finish-story-hero-premium"
                         onClick={() => {
                           setFinishPressBurst(true);
                           setFinishSparkle(true);
                           setTimeout(() => setFinishPressBurst(false), 600);
                           setTimeout(() => setFinishSparkle(false), 1200);
                           setShowConfirmEndStory(true);
                         }}
                         disabled={!liveContext || isGeneratingEnding || isStoryComplete || controlsBlocked}
                         variant="hero"
                         size="xl"
                         aria-busy={isGeneratingEnding}
                         className={cn(
                          "relative z-20 transform transition-all duration-500",
                          finishPressBurst && "animate-scale-in",
                          [
                            "animate-bounce",
                            "animate-pulse",
                            "scale-125",
                            "shadow-2xl",
                            "shadow-purple-500/50",
                            "border-4",
                            "border-purple-400/60",
                            "bg-gradient-to-r",
                            "from-purple-600/90",
                            "to-blue-600/90",
                            "hover:from-purple-700",
                            "hover:to-blue-700",
                            "glow-purple"
                          ].join(" ")
                        )}
                      >
                        {isGeneratingEnding ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            <Sparkles className="w-5 h-5 absolute top-2 right-2 animate-pulse" />
                            {t('common.creatingMagic', 'Creating magic...')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            {"Finish Story!"}
                            <Sparkles className="w-5 h-5 absolute top-2 right-2 animate-pulse" />
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-sm mt-3 opacity-80">
                      {"Want more? Go to the next page to add new parts to this story!"}
                    </p>
                  </div>
                )}

                {/* Free User Magic Wand - visible only for free users on page 6 with time left */}
                {!isPremium && currentPage === 5 && stableDisplayedStory.length > 5 && timeRemaining > 0 && (
                  <div className="text-center relative">
                    <div className="relative">
                      <SparkleAnimation 
                        isActive={isMagicWandAnimating} 
                        intensity="high" 
                        className="absolute inset-0 pointer-events-none z-10" 
                      />
                      
                      <Button
                        data-id="magic-wand-free"
                        onClick={() => {
                          setIsMagicWandAnimating(false); // Stop animation when clicked
                          handleGenerateNewStory();
                        }}
                        disabled={isGeneratingNewStory}
                        variant="hero"
                        size="xl"
                        className={cn(
                          "relative z-20 transform transition-all duration-500",
                          // DRAMATIC multi-layered animation effects
                          isMagicWandAnimating && [
                            "animate-bounce", 
                            "animate-pulse", 
                            "scale-125", 
                            "shadow-2xl",
                            "shadow-purple-500/50",
                            "border-4",
                            "border-purple-400/60",
                            "bg-gradient-to-r",
                            "from-purple-600/90",
                            "to-blue-600/90",
                            "hover:from-purple-700",
                            "hover:to-blue-700",
                            "glow-purple" // Custom glow effect
                          ].join(" "),
                          isGeneratingNewStory && "animate-spin border-purple-400/50 shadow-lg shadow-purple-500/20"
                        )}
                      >
                        {isGeneratingNewStory ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            <Sparkles className="w-5 h-5 absolute top-2 right-2 text-purple-200 animate-pulse" />
                            Creating Magic...
                          </>
                        ) : (
                          <>
                            <Wand className={cn(
                              "w-6 h-6 mr-3", 
                              isMagicWandAnimating && "animate-bounce text-yellow-300"
                            )} />
                            <Sparkles className={cn(
                              "w-5 h-5 absolute top-2 right-2", 
                              isMagicWandAnimating && "animate-ping text-yellow-300"
                            )} />
                            {isMagicWandAnimating && (
                              <>
                                {/* Additional sparkle effects */}
                                <Sparkles className="w-3 h-3 absolute top-1 left-1 text-pink-300 animate-pulse" />
                                <Sparkles className="w-4 h-4 absolute bottom-1 left-2 text-cyan-300 animate-bounce" />
                                <Sparkles className="w-3 h-3 absolute bottom-1 right-1 text-green-300 animate-ping" />
                              </>
                            )}
                            Get the next story!
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Upgrade prompt under button */}
                    <p className="text-sm text-muted-foreground mt-3">
                      <button type="button" onClick={onUpgrade} className="story-link">Upgrade</button> to premium for unlimited stories and to craft your perfect ending.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation - Responsive Layout */}
              <div id="story-navigation" className="story-navigation">
                {/* Mobile/Tablet: Slightly more compact layout - moved under progress bar (hidden here) */}
                {!isPremium && (
                  <div className="hidden">
                    {/* moved */}
                  </div>
                )}

                {/* Premium controls */}
                {isPremium && !finishCTAExpanded && (
                  <div className="mt-3 flex justify-center gap-3 xl:hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`relative inline-block ${finishPressBurst ? 'animate-scale-in' : ''}`}>
                            <MobileOptimizedButton
                               onClick={() => {
                                 setFinishPressBurst(true);
                                 setFinishSparkle(true);
                                 setTimeout(() => setFinishPressBurst(false), 600);
                                 setTimeout(() => setFinishSparkle(false), 1200);
                                 setShowConfirmEndStory(true);
                               }}
                               disabled={isGeneratingEnding || controlsBlocked || (lastEndingPageIndex !== null ? currentPage <= lastEndingPageIndex : !liveContext)}
                              variant="hero"
                              aria-busy={isGeneratingEnding}
                              className={cn(finishFlashCycle && !isGeneratingEnding && "ring-2 ring-primary/60 animate-pulse")}
                            >
                              {isGeneratingEnding ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('common.creatingMagic', 'Creating magic...')}
                                </>
                              ) : (
                                t('nav.endStory', 'Finish Story')
                              )}
                            </MobileOptimizedButton>
                            <SparkleAnimation isActive={finishSparkle} intensity="medium" isPremium={false} className="pointer-events-none absolute -inset-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.finishStory', 'Ready to end this story? Click to see how it ends!')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Mobile/Tablet: compact arrow navigation (moved under progress bar) */}
                <div className="hidden">
                  {/* moved */}
                </div>

                {/* Desktop: Centered compact layout (moved under progress bar) */}
                <div className="hidden" />

                {/* Premium controls desktop */}
                {isPremium && !finishCTAExpanded && (
                  <div className="hidden xl:flex justify-center gap-3 mt-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`relative inline-block ${finishPressBurst ? 'animate-scale-in' : ''}`}>
                            <MobileOptimizedButton
                               onClick={() => {
                                 setFinishPressBurst(true);
                                 setFinishSparkle(true);
                                 setTimeout(() => setFinishPressBurst(false), 600);
                                 setTimeout(() => setFinishSparkle(false), 1200);
                                 setShowConfirmEndStory(true);
                               }}
                               disabled={isGeneratingEnding || controlsBlocked || (lastEndingPageIndex !== null ? currentPage <= lastEndingPageIndex : !liveContext)}
                              variant="hero"
                              size="sm"
                              aria-busy={isGeneratingEnding}
                              className={cn(finishFlashCycle && !isGeneratingEnding && "ring-2 ring-primary/60 animate-pulse")}
                            >
                              {isGeneratingEnding ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('common.creatingMagic', 'Creating magic...')}
                                </>
                              ) : (
                                t('nav.endStory', 'Finish Story')
                              )}
                            </MobileOptimizedButton>
                            <SparkleAnimation isActive={finishSparkle} intensity="medium" isPremium={false} className="pointer-events-none absolute -inset-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.finishStory', 'Ready to end this story? Click to see how it ends!')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      

      {/* Manual End Session Celebration Overlay (Premium) */}
      {isPremium && showManualCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="relative z-[101] bg-background border border-border rounded-2xl shadow-2xl p-6 text-center animate-scale-in">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-primary">Great job!</h3>
            <p className="text-sm text-muted-foreground">You can save your story or just view your stats next.</p>
          </div>
        </div>
      )}

      {/* Timer shows yellow pulse when paused - no overlay needed since controls remain active */}

      {/* Unified Timer for All Users (guest always on) */}
      {(!isPremium || timerEnabled) && (
        <CollapsibleFloatingTimer
          timeRemaining={timeRemaining}
          isReading={isTimerRunning}
          onToggleReading={handleToggleTimer}
          onReduceTime={handleReduceTime}
          onEndSession={handleEndSession}
          onSessionEnded={handleEndSession}
          isPremium={isPremium}
          onIncreaseTime={isPremium ? handleExtendTime : undefined}
          onDismiss={() => { try { localStorage.setItem('readingTimerEnabled','0'); } catch {} setTimerEnabled(false); setIsTimerRunning(false); setIsTimerCanceled(true); setIsTimerVisible(false); window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: false })); }}
          onRestartTimer={isPremium ? handleRestartTimer : undefined}
          onKeepReadingUntimed={isPremium ? handleKeepReadingUntimed : undefined}
          onSaveStoryNow={isPremium ? handleSaveStoryNow : undefined}
        />
      )}



      {/* Debug Display - Shows device detection (remove once confirmed working) */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1' && (
        <div className="fixed top-2 right-2 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
          W:{typeof window !== 'undefined' ? window.innerWidth : '?'}px | 
          M:{isMobile ? 'Y' : 'N'} | 
          T:{isTablet ? 'Y' : 'N'} | 
          MT:{isMobileOrTablet ? 'Y' : 'N'} |
          Dock:{isMobileOrTablet ? 'SHOW' : 'HIDE'}
        </div>
      )}

      {/* Mobile Action Dock - Mobile and Tablet devices */}
      {isMobileOrTablet && (
        <>
          <MobileActionDock
            isPremium={isPremium}
            onPlayAudio={handleDockPlayAudio}
            onVoiceCommand={isPremium ? handleDockVoiceCommand : undefined}
            onCoach={handleDockCoach}
            onSave={isPremium ? handleSaveStoryNow : undefined}
            onEnd={isPremium ? () => setShowEndSessionConfirm(true) : undefined}
            isSaving={isSaving}
            isAudioPlaying={isAudioPlaying}
            isAudioLoading={isAudioLoading}
            audioDisabled={!isPremium && audioPlayedPage === currentPage && !isAudioPlaying}
          />
        </>
      )}

      <Dialog open={showCoach} onOpenChange={setShowCoach}>
        <DialogContent className="w-[min(96vw,720px)] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader>
            <DialogTitle>Help Me Read</DialogTitle>
          </DialogHeader>
          {/* @ts-ignore */}
          <ReadAloudCoach targetText={currentStoryText || ""} isPremium={isPremium} language={userInfo?.nativeLanguage || 'en'} onUpgrade={onUpgrade} />
        </DialogContent>
      </Dialog>

      {isPremium && showConfirmEndStory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="relative z-[111] bg-background border border-border rounded-2xl shadow-2xl w-[92vw] max-w-xl p-6 animate-scale-in" role="dialog" aria-labelledby="endstory-confirm-title" aria-describedby="endstory-confirm-desc">
            <h3 id="endstory-confirm-title" className="text-xl font-bold mb-2">{t('endStory.confirm.title', 'Create an ending page?')}</h3>
            <p id="endstory-confirm-desc" className="text-sm text-muted-foreground mb-5">{t('endStory.confirm.desc', "We’ll add a last page to wrap up this story. You can save it, or press Next to start a sequel. Your session will not end.")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button onClick={() => { setShowConfirmEndStory(false); handleGenerateEndingPage(); }}>{t('endStory.confirm.continue', 'Create my ending')}</Button>
              <Button variant="ghost" onClick={() => setShowConfirmEndStory(false)}>{t('endStory.confirm.cancel', 'Keep reading')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Confirmation */}
      {showEndSessionConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="relative z-[111] bg-background border border-border rounded-2xl shadow-2xl w-[92vw] max-w-xl p-6 animate-scale-in" role="dialog" aria-labelledby="endsession-title" aria-describedby="endsession-desc">
            <h3 id="endsession-title" className="text-xl font-bold mb-2">{t('nav.endSessionConfirm.title', 'End session?')}</h3>
            <p id="endsession-desc" className="text-sm text-muted-foreground mb-5">{t('nav.endSessionConfirm.desc', 'This will end this session. You will have the option to save this story as is.')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button onClick={async () => { await handleSaveStoryNow(); setShowEndSessionConfirm(false); handleEndSession(); }}>{t('nav.endSessionConfirm.saveAndEnd', 'Save story and end')}</Button>
              <Button variant="destructive" onClick={() => { setShowEndSessionConfirm(false); handleEndSession(); }}>{t('nav.endSessionConfirm.endWithoutSaving', 'End without saving')}</Button>
              <Button variant="ghost" onClick={() => setShowEndSessionConfirm(false)}>{t('common.cancel', 'Cancel')}</Button>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Modern Progress Towers - Rebuilt with better design */}
      {/* Special Request Dialog */}
      <SpecialRequestDialog
        open={showSpecialRequestDialog}
        onOpenChange={setShowSpecialRequestDialog}
        initialValue={specialRequestDraft}
        onSubmit={handleSpecialRequestSubmit}
        isGenerating={isGeneratingNewStory}
      />
      <ModernProgressTowers
        userId={userInfo?.name}
        userType={isPremium ? 'premium' : 'free'}
        currentWordsRead={sessionWordsRead}
        currentPagesRead={pagesCompleted.size}
        vocabularyLearned={userStats.vocabularyWordsLearned || 0}
        timeSpent={Date.now() - sessionStartTime}
        onProgressUpdate={(type, value) => {
          console.log('Progress updated:', type, value);
        }}
        className="fixed"
      />
      
      {/* Audio Fallback Notification */}
      <AudioFallbackNotification />
      
      {/* Voice Command System */}
      <VoiceCommandController headless={true} onCommand={handleVoiceCommand} />
      <VoiceHoverController isPremium={isPremium} />
      <PremiumHoverController isPremium={isPremium} />
      
      {/* Story Stability Monitor (Debug Only - ?debug=1) */}
      {new URLSearchParams(window.location.search).get('debug') === '1' && (
        <StoryStabilityMonitor
          isStoryContentLocked={isStoryContentLocked}
          isStoryStable={isStoryStable}
          storyLength={story.length}
          lastGenerationTrigger={lastGenerationTrigger}
          contentMutationLog={contentMutationLog}
          onUnlockContent={() => {
            console.log('🔓 DEBUG: Manual content unlock triggered');
            setIsStoryContentLocked(false);
            storyContentLockedRef.current = false;
          setContentMutationLog(prev => [...prev, {
            timestamp: new Date().toISOString(),
            trigger: 'debug-manual-unlock',
            action: 'Content unlocked via debug monitor',
            storyLength: story.length,
            isLocked: false
          }]);
        }}
        onClearLog={() => {
          console.log('🗑️ DEBUG: Clearing mutation log');
          setContentMutationLog([]);
        }}
      />
      )}
      </div>
    </ErrorBoundary>
    </GameContextProvider>
  );
};

export default CleanStoryDisplay;