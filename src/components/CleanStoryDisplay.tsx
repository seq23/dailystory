import { StoryAudioControls } from "@/components/story/StoryAudioControls";
import { StoryNavigationControls } from "@/components/story/StoryNavigationControls";
import { StoryTimerIntegration } from "@/components/story/StoryTimerIntegration";
import { useStoryLogic } from "@/hooks/useStoryLogic";
import { useNavigationPersistence } from "@/hooks/useNavigationPersistence";
import { ImageDeduplicationService } from "@/services/imageDeduplicationService";
import { NetflixSessionManager } from "@/services/NetflixSessionManager";
import { ReadingStateManager } from "@/utils/ReadingStateManager";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DebugLogger } from '@/services/DebugLogger';
import { ManagedTimers } from '@/utils/TimerManager';
import { performanceManager } from '@/services/PerformanceManager';
import { globalResizeService } from '@/services/GlobalResizeService';
import { useImageManagement } from '../hooks/useImageManagement';  
import { useAudioControls } from '../hooks/useAudioControls';
import { useErrorNetworkState } from '../hooks/useErrorNetworkState';
import { useStoryMetadata } from '../hooks/useStoryMetadata';
import { useUIAnimationState } from '../hooks/useUIAnimationState';
import { useDifficultyManagement } from '../hooks/useDifficultyManagement';
/*
 * ============================================================================
 * BUSINESS MODEL DOCUMENTATION - CLEAN STORY DISPLAY
 * ============================================================================
 * 
 * CORE BUSINESS LOGIC:
 * 
 * 1. GUEST USERS (Free, Non-Paid):
 *    - 20-minute timer starts on page load (can pause/reduce/end from floating timer)
 *    - Netflix-style story generation (10+ pages generated at once by OpenAI)
 *    - BUSINESS RULE: Can only read 6 pages of each story (artificial limit)
 *    - On page 6: "Next Story" button appears (never see story endings)
 *    - Fresh image generated for every page of the 6-page story
 *    - Backward navigation shows same images (cached)
 *    - "Next Story" clears cache, starts new 6-page cycle
 *    - Session ends when timer reaches zero - all caches cleared
 * 
 * 2. PREMIUM USERS:
 *    - Same timer but can dismiss it for unlimited sessions
 *    - Live generation: 1 page at a time by OpenAI
 *    - New image for every page, backward/forward navigation preserved
 *    - "Finish Story" for AI-generated endings (user choice)
 *    - Can continue forward for Part II, III, etc.
 *    - Save story to library with all original images cached
 *    - Magic wand: Rewrite story (clears cache, regenerates images)
 *    - Session end: All caches cleared
 * 
 * 3. NEVER-ENDING STORIES:
 *    - Both user types get stories that could continue forever
 *    - AI should NEVER naturally conclude stories
 *    - Guest artificial cutoff at page 6 (business differentiation)
 *    - Premium users choose when to end
 * 
 * 4. CACHE MANAGEMENT:
 *    - Guest "Next Story": Clear cache for fresh 6-page experience
 *    - Premium rewrite: Clear cache, regenerate with new images
 *    - Session end: Always clear all caches for both user types
 * 
 * ============================================================================
 */

import { useNavigate } from "react-router-dom";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Loader2, Volume2, VolumeX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings, Plus, RefreshCw, Clock, Wand, Sparkles, GraduationCap, Save, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useDesktopCardHeight } from "@/hooks/useDesktopCardHeight";
import { useStorySourceNotifications } from "@/hooks/useStorySourceNotifications";
import { StoryStatusIndicator } from "@/components/StoryStatusIndicator";
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
import { UnifiedAudioControls as SynchronizedAudioControls } from "@/components/UnifiedAudioControls";
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { charlotteVoiceService } from "@/services/CharlotteVoiceService";
import { StoryContentLogger } from "@/utils/StoryContentLogger";

import { VocabularyCollector } from "@/components/VocabularyCollector";
import { VocabularyService, type VocabularyIntegration } from "@/services/vocabularyService";
import { processTextWithConsistentFlow } from "@/utils/unifiedTextProcessor";
import { hashText } from "@/utils/tokenize";
import { defaultAudioConfig } from "@/config/audioConfig";
import "@/styles/storyDisplay.css";
// import { processTextForDesktop } from "@/utils/desktopTextProcessor";

// Static image placeholder for when images are disabled by user
const IMAGES_DISABLED_PLACEHOLDER = '/serious-readers-corner.png';
// useWordHighlighting integrated into useAudioControls
import { VoiceCommandController } from '@/components/VoiceCommandController';
import { VoiceHoverController } from '@/components/VoiceHoverController';
import { PremiumHoverController } from '@/components/PremiumHoverController';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { useGamification } from "@/hooks/useGamification";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTouchDeviceLongPressNotification } from "@/hooks/useTouchDeviceLongPressNotification";
import { getMobileTextConfig, getMobileStoryContainer, getDifficultyBasedTextConfig, getDifficultyBasedContainer } from "@/utils/mobileTextOptimizations";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import { cn } from "@/lib/utils";
import { useReaderLayout } from "@/hooks/useReaderLayout";
import { ImageGenerationStatusIndicator } from "@/components/ImageGenerationStatusIndicator";

import type { UserInfo, SessionStats, Story as StoryType } from "@/types";
import { NetflixStyleStoryService, type NetflixStoryResult } from "@/services/NetflixStyleStoryService";
import { LiveGenerationService, type LiveGenerationContext, type LivePageResult } from "@/services/LiveGenerationService";
import { DifficultyManager } from "@/services/difficultyManager";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { DiagnosticTool } from "@/utils/diagnostics";
import { UnifiedValidator } from "@/utils/unifiedValidator";

import { SimpleImageService } from "@/services/SimpleImageService";
import { ImageFallbackService } from "@/services/ImageFallbackService";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ImageMixingLoading } from "@/components/ImageMixingLoading";
import { AudioFallbackNotification } from "@/components/AudioFallbackNotification";
import { ImageDebugPanel } from "@/components/ImageDebugPanel";
import { BackendTierChecker } from "@/components/BackendTierChecker";
import { PremiumStoryManager } from "@/services/premiumStoryManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorHandler, ErrorType } from "@/utils/errorHandling";
import { DiagnosticPanel } from "@/components/DiagnosticPanel";
import { ApiKeyDiagnostic } from "@/components/ApiKeyDiagnostic";
import { ParentGuardrailsService } from "@/services/parentGuardrailsService";
import { supabase } from "@/integrations/supabase/client";
import { SpecialRequestDialog } from "@/components/SpecialRequestDialog";
import { StorySessionCache } from "@/services/storySessionCache";
import { SessionCacheManager } from "@/services/SessionCacheManager";
import { StoryVisualStateManager } from "@/services/storyVisualState";
import { StoryRefreshService } from "@/utils/storyRefresh";
import { guestSession } from "@/utils/guestSession";
import { APP_CONFIG } from "@/config/appConfig";
import { ImageGenerationTrigger } from "@/utils/imageGenerationTrigger";
import { ExpertDifficultyManager } from "@/services/expertDifficultyManager";
import { generateSessionId, generateSessionIdWithPrefix } from '@/utils/sessionId';

import { useSessionAwareImageLoader } from "@/hooks/useSessionAwareImageLoader";
import { convertImagesToRecord } from "@/utils/imageUtils";

interface CleanStoryDisplayProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
  onHome: () => void;
  onUpgrade: () => void;
  onNewStory?: () => void;
  readingAsName?: string;
  currentStory?: any; // For saved stories - contains cachedImages and isFromSavedStory
  onPageImagesUpdate?: (images: Record<number, string>) => void; // CRITICAL: Callback to provide current images
}

const CleanStoryDisplay: React.FC<CleanStoryDisplayProps> = ({
  userInfo,
  isPremium,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory,
  readingAsName,
  currentStory,
  onPageImagesUpdate, // CRITICAL: Extract callback for image updates
}) => {
  // ERROR-023 FIX: Defensive userInfo validation with complete fallback
  // Create stable reference to prevent infinite re-renders
  const safeUserInfo: UserInfo = useMemo(() => userInfo || {
    name: 'Reader',
    age: 8,
    grade: 'K' as const,
    difficultyLevel: 'beginner' as const,
    expertGradeLevel: "6th" as const,
    nativeLanguage: 'en' as const,
    learningGoal: 'improve-english-reading' as const,
    avatar: { type: 'boy' as const, skinTone: 'medium' as const },
    specialRequest: '',
    // Optional fields remain undefined to maintain honesty
  }, [userInfo?.name, userInfo?.age, userInfo?.specialRequest, userInfo?.difficultyLevel, userInfo?.expertGradeLevel]);

  const { t } = useTranslation();
  const { toast } = useToast();
  const { isMobile, isTablet, isMobileOrTablet, hasTouchCapability } = useIsMobile();
  
  // Image generation toggle state - CRITICAL: Guests ALWAYS have images enabled
  const [imagesEnabled, setImagesEnabled] = useState<boolean>(() => {
    if (!isPremium) return true; // Guest users: images ALWAYS on
    try { return localStorage.getItem('storyImagesEnabled') !== '0'; } catch { return true; }
  });
  
  // Page-specific generation lock to prevent race conditions
  const [generatingPages, setGeneratingPages] = useState<Set<number>>(new Set());
  
  // Stable reference for generateImageForCurrentPage to avoid ReferenceError in event listeners
  const generateImageRef = useRef<(() => Promise<void>) | null>(null);
  
  // ANTI-FLICKER: Preload images-disabled placeholder to prevent network delay flicker
  useEffect(() => {
    const img = new Image();
    img.src = IMAGES_DISABLED_PLACEHOLDER;
  }, []);
  
  // Toast deduplication state - track if fallback toast shown for current story session
  const fallbackToastShownRef = useRef(false);
  const currentToastRef = useRef<{ id: string; dismiss: () => void } | null>(null);
  
  // Debug device detection
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') {
      DebugLogger.log('ui', 'CleanStoryDisplay Device Detection:', {
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
  
  useEffect(() => {
    DebugLogger.log('ui', 'Desktop Image Debug - Layout Changed:', {
      layout,
      lowEnd,
      reason,
      windowWidth: window.innerWidth,
      isWideScreen: window.innerWidth >= 1280,
      shouldShowImages: layout !== 'classic' || window.innerWidth >= 1280
    });
  }, [layout, lowEnd, reason]);
  
  // Story source notifications - persistent toast system
  useStorySourceNotifications();
  
  // Touch device long-press instruction notification
  const { showLongPressInstruction } = useTouchDeviceLongPressNotification();
  
  // Get Netflix session ID for consistent session tracking across services
  const getNetflixSessionId = useCallback(() => {
    try {
      return NetflixSessionManager.getOrCreateSession(safeUserInfo.name);
    } catch (error) {
      DebugLogger.warn('story', 'Failed to get Netflix session ID', error);
      return undefined;
    }
  }, [safeUserInfo.name]);

  // Initialize useStoryLogic hook for centralized state management
  const {
    state: {
      story,
      currentPage,
      storyId: hookStoryId,
      storyTitle,
      isStoryComplete,
      isStoryStable,
      liveContext,
      timeRemaining,
      isTimerRunning,
      isTimerCanceled,
      timerEnabled,
      userPausedTimer,
      hasChosenUntimed,
      isGeneratingEnding,
      isLoading,
      isLoadingNextPage,
      isGeneratingNewStory,
      isGeneratingRewrite
    },
    actions: {
      setStory,
      setCurrentPage,
      setStoryId,
      setStoryTitle,
      setIsStoryComplete,
      setIsStoryStable,
      setLiveContext,
      setTimeRemaining,
      setIsTimerRunning,
      setIsTimerCanceled,
      setTimerEnabled,
      setUserPausedTimer,
      setHasChosenUntimed,
      setIsGeneratingEnding,
      setIsLoading,
      setIsLoadingNextPage,
      setIsGeneratingNewStory,
      setIsGeneratingRewrite
    },
    handlers: {
      handleNext,
      handlePrevious,
      handleToggleTimer,
      handleReduceTime
    },
    refs: {
      sessionStartTime,
      characterSessionId
    }
  } = useStoryLogic({
    userInfo: safeUserInfo, // Use defensive userInfo
    isPremium,
    initialDifficulty: (safeUserInfo.difficultyLevel || 'beginner') as 'beginner' | 'easy' | 'medium' | 'hard' | 'expert',
    expertGradeLevel: safeUserInfo.expertGradeLevel,
    onSessionEnded,
    netflixSessionId: useMemo(() => getNetflixSessionId(), []) // Pass Netflix session ID (computed once per mount to prevent re-creation)
  });

  // Initialize consolidated hooks for state management
  const { state: imageState, actions: imageActions } = useImageManagement();
  const { vocabularyState, vocabularyActions } = useAudioControls({
    text: '',
    userInfo: safeUserInfo,
    currentPage: 0,
    isPremium
  });
  const { state: errorNetworkState, actions: errorNetworkActions } = useErrorNetworkState();
  const { state: metadataState, actions: metadataActions } = useStoryMetadata({ userInfo: safeUserInfo, isPremium });
  const { state: uiState, actions: uiActions, refs: uiRefs } = useUIAnimationState();
  const { state: difficultyState, actions: difficultyActions } = useDifficultyManagement({ userInfo: safeUserInfo });

  // Initialize navigation persistence
  const { saveNavigationState, getNavigationState, restoreScrollPosition } = useNavigationPersistence();

  // Destructure for cleaner access
  const {
    pageImages, setPageImages, pageImageMetadata, isGeneratingImage, isPreparingImage, imageLoadingStates,
    fallbackStates, isBatchGenerating, batchDone, batchTotal, imageAspectRatios, imageNaturalSizes,
    clearAllImages, clearPageImage, updateImageMetadata, setPageImageMetadata, setIsGeneratingImage,
    setIsPreparingImage, setImageLoadingStates, setFallbackStates, setIsBatchGenerating,
    setBatchDone, setBatchTotal, setImageAspectRatios, setImageNaturalSizes
  } = { ...imageState, ...imageActions };

  const {
    isAudioPlaying, setIsAudioPlaying, isAudioLoading, setIsAudioLoading,
    showVocabularyCollector, setShowVocabularyCollector, wordsInteracted, sessionWordsRead,
    pagesCompleted, audioPlayedPage, vocabularyData, setVocabularyData,
    incrementWordsInteracted, incrementSessionWordsRead, markPageCompleted,
    resetSessionCounters, clearVocabularyData, setWordsInteracted, setSessionWordsRead,
    setPagesCompleted, setAudioPlayedPage
  } = { ...vocabularyState, ...vocabularyActions };

  const { error, lastImageError, isNetworkAvailable } = errorNetworkState;
  const { setError, setLastImageError, setIsNetworkAvailable, clearErrors } = errorNetworkActions;

  const { 
    cachedUserId, originalStoryLength, lastEndingPageIndex, stableSessionId,
    storySource, specialRequestDraft
  } = metadataState;
  const {
    setCachedUserId, setOriginalStoryLength, setLastEndingPageIndex,
    setStorySource, setSpecialRequestDraft, updateCachedUserId
  } = metadataActions;

  const {
    justAdvanced, showManualCelebration, showEndStoryModal, showConfirmEndStory,
    showEndSessionConfirm, showCoach, showSpecialRequestDialog, finishCTAExpanded,
    isRewriteMode, isMagicWandAnimating, wandPulse, finishSparkle, finishPressBurst,
    finishFlashCycle, showEndingBurst, forceLoaderActive, isTimerVisible,
    highlightSave, isSaving
  } = uiState;
  const {
    setJustAdvanced, setShowManualCelebration, setShowEndStoryModal, setShowConfirmEndStory,
    setShowEndSessionConfirm, setShowCoach, setShowSpecialRequestDialog, setFinishCTAExpanded,
    setIsRewriteMode, setIsMagicWandAnimating, setWandPulse, setFinishSparkle,
    setFinishPressBurst, setFinishFlashCycle, setShowEndingBurst, setForceLoaderActive,
    setIsTimerVisible, setHighlightSave, setIsSaving
  } = uiActions;
  const { loaderStartRef, finishExpandedOnPageRef } = uiRefs;

  const {
    currentDifficulty, isChangingDifficulty, changeDirection, expertGradeLevel,
    lockDifficulty, minDifficulty, minExpertGrade, allowDecreaseBelowMin
  } = difficultyState;
  const {
    setCurrentDifficulty, setIsChangingDifficulty, setChangeDirection, setExpertGradeLevel,
    setLockDifficulty, setMinDifficulty, setMinExpertGrade, setAllowDecreaseBelowMin,
    resetDifficultyToInitial
  } = difficultyActions;

  // Additional constants and helper variables
  const initialTimerSeconds = (() => { 
    try { 
      const v = Number(localStorage.getItem('readingTimerDefaultSeconds')); 
      return v > 0 ? v : 20 * 60; 
    } catch { 
      return 20 * 60; 
    } 
  })();
  
  // Access ref values properly
  const sessionStartTimeValue = sessionStartTime.current;
  const characterSessionIdValue = characterSessionId.current;
  
  // ERROR-023 FIX: Defensive story array bounds checking
  // For free users, limit displayed pages to 6 maximum
  const safeStory = Array.isArray(story) ? story : [];
  const displayedStory = !isPremium ? safeStory.slice(0, 6) : safeStory;
  
  // Ensure currentPage is within valid bounds
  const safeCurrentPage = Math.max(0, Math.min(currentPage, displayedStory.length - 1));
  const currentPageContent = displayedStory[safeCurrentPage] || '';
  const hasValidContent = displayedStory.length > 0 && currentPageContent.trim().length > 0;


  useEffect(() => {
    DebugLogger.log('story', 'isLoading changed:', isLoading);
  }, [isLoading]);
  
  // Navigation persistence - save state on page changes
  useEffect(() => {
    if (hookStoryId && displayedStory.length > 0) {
      saveNavigationState({
        currentPage: safeCurrentPage,
        totalPages: displayedStory.length,
        storyId: hookStoryId,
        viewHistory: [safeCurrentPage]
      });
    }
  }, [safeCurrentPage, displayedStory.length, hookStoryId, saveNavigationState]);

  // Navigation persistence - restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Cache user ID for performance - update when auth state changes
  useEffect(() => {
    let mounted = true;
    const updateCachedUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted && user?.id) {
          setCachedUserId(user.id);
        }
      } catch (error) {
        DebugLogger.warn('auth', 'Failed to cache user ID', error);
      }
    };
    
    if (isPremium) {
      updateCachedUserId();
    }
    
    return () => { mounted = false; };
  }, [isPremium]);
  
  // Mark body during reading session to control global UI (e.g., hide feedback on mobile)
  useEffect(() => {
    document.body.classList.add('reading-session');
    
    // Clear previous session achievements when starting new session
    try {
      sessionStorage.removeItem('session_achievements');
    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear previous session achievements', error);
    }
    
    return () => {
      document.body.classList.remove('reading-session');
      // Reset toast flags on component unmount
      fallbackToastShownRef.current = false;
      if (currentToastRef.current) {
        currentToastRef.current.dismiss();
        currentToastRef.current = null;
      }
    };
  }, []);
  
  // ImageGenerationTrigger lifecycle management + Debug initialization
  useEffect(() => {
    ImageGenerationTrigger.startMonitoring();
    DebugLogger.log('image', 'ImageGenerationTrigger monitoring started');
    
    // EMERGENCY FIX: Initialize StoryContentLogger only when debug params are present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('storydebug') || urlParams.has('imagedebug')) {
      StoryContentLogger.init();
      DebugLogger.log('story', 'StoryContentLogger initialized with debug params');
    }
    
    return () => {
      ImageGenerationTrigger.stopMonitoring();
      StoryContentLogger.stopImagePromptMonitoring(); // Stop monitoring on unmount
      DebugLogger.log('image', 'ImageGenerationTrigger monitoring stopped, debug monitoring cleaned up');
    };
  }, []);
  
  // Pre-fetch vocabulary data on component mount for unified integration
  useEffect(() => {
    (async () => {
      try {
        DebugLogger.log('story', 'Pre-fetching vocabulary data for', safeUserInfo.name);
        const vocabData = await VocabularyService.fetchAllVocabulary(userInfo);
        setVocabularyData(vocabData);
        DebugLogger.log('story', 'Vocabulary data pre-fetched successfully:', vocabData);
      } catch (error) {
        DebugLogger.warn('story', 'Failed to pre-fetch vocabulary data:', error);
        // Set empty vocabulary data as fallback
        setVocabularyData({
          userSpecified: { formWords: [], specialRequestWords: [], teacherWords: [] },
          systemVocabulary: { level: 2, complianceTarget: 0.7 },
          metadata: { totalUserWords: 0, priorityInstructions: '', sources: [] }
        });
      }
    })();
  }, [userInfo]);
  
  // CRITICAL FIX: Listen for image toggle events - PREMIUM ONLY
  useEffect(() => {
    if (!isPremium) return; // Guest users cannot toggle images
    
    const handler = (e: any) => {
      const enabled = !!(e as CustomEvent).detail;
      setImagesEnabled(enabled);
      DebugLogger.log('ui', 'Story images toggled:', { enabled });
      
      // Re-trigger image generation for current page if toggled on and no image exists
      if (enabled && !pageImages[currentPage] && isStoryStable) {
        ManagedTimers.setTimeout(() => {
          generateImageForCurrentPage();
        }, 50, 'CleanStoryDisplay');
      }
    };
    window.addEventListener('storyImagesToggle', handler as EventListener);
    return () => window.removeEventListener('storyImagesToggle', handler as EventListener);
  }, [isPremium, currentPage, pageImages, isStoryStable]);
  
  // NETWORK RESILIENCE: Listen for offline/online events for graceful degradation
  useEffect(() => {
    const handleOffline = () => {
      DebugLogger.warn('network', 'Device went offline - pausing image generation');
    };
    
    const handleOnline = () => {
      DebugLogger.log('network', 'Device back online - resuming image generation');
      if (imagesEnabled && !pageImages[currentPage] && isStoryStable) {
        generateImageForCurrentPage();
      }
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [imagesEnabled, currentPage, pageImages, isStoryStable]);
  
  // DEFENSIVE: Force images enabled for guest users if somehow disabled
  useEffect(() => {
    if (!isPremium && !imagesEnabled) {
      DebugLogger.warn('ui', 'Guest user had images disabled - forcing back on');
      setImagesEnabled(true);
    }
  }, [isPremium, imagesEnabled]);
  
  // CRITICAL FIX: Auto-generate image when currentPage changes (for premium page-by-page)
  useEffect(() => {
    if (imagesEnabled && isStoryStable && !pageImages[currentPage] && displayedStory[safeCurrentPage]) {
      DebugLogger.log('image', '🖼️ Auto-triggering image generation for page', currentPage);
      generateImageForCurrentPage();
    }
  }, [currentPage, imagesEnabled, isStoryStable]);

  // SESSION PERSISTENCE & RESUME MECHANISM OR SAVED STORY LOADING
  // Automatically restores user sessions across page refreshes and browser restarts
  // Maintains story progress, timer state, and generation history for seamless experience
  // OR loads saved story content when currentStory prop is provided
  useEffect(() => {
    (async () => {
      try {
      // Check if this is a saved story being loaded
      if (currentStory?.isFromSavedStory && currentStory.segments) {
        DebugLogger.log('story', 'Loading saved story with cached content', {
          segmentCount: currentStory.segments.length,
          title: currentStory.title,
          userName: safeUserInfo.name
        });
        const storyPages = currentStory.segments.map((s: any) => s.text);
        StoryContentLogger.logStoryChange('saved_story_load', 'before', storyPages, { 
          source: 'saved story segments',
          segmentCount: currentStory.segments.length
        });
        setStory(storyPages);
        StoryContentLogger.logStoryChange('saved_story_load', 'after', storyPages, {
          currentPage: 0,
          isComplete: true,
          title: currentStory.title || `${safeUserInfo.name}'s Story`
        });
        setCurrentPage(0);
        setIsStoryComplete(true);
        setStoryTitle(currentStory.title || `${safeUserInfo.name}'s Story`);
        
        // Load cached images using unified conversion logic with validation
        const convertedImages = convertImagesToRecord(currentStory.cachedImages, 'Saved story');
        if (convertedImages && Object.keys(convertedImages).length > 0) {
          // Validate image URLs before setting
          const validatedImages: Record<number, string> = {};
          for (const [index, url] of Object.entries(convertedImages)) {
            try {
              if (typeof url === 'string') {
                new URL(url); // Basic URL validation
                validatedImages[parseInt(index)] = url;
              }
            } catch {
              DebugLogger.warn('image', `Invalid cached image URL for page ${index}`, url);
            }
          }
          
          if (Object.keys(validatedImages).length > 0) {
            setPageImages(validatedImages);
            onPageImagesUpdate?.(validatedImages); // CRITICAL: Notify parent of image updates
            DebugLogger.log('image', 'Saved story: Valid images loaded', validatedImages);
          }
        }
        
        setIsLoading(false);
        setIsStoryStable(true);
        
        // Show touch device instruction after saved story loads
        ManagedTimers.setTimeout(() => {
          showLongPressInstruction();
        }, 1000, 'CleanStoryDisplay');
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
          let id = safeUserInfo.name || 'premium';
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
          let id = safeUserInfo.name || 'premium';
          try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}
          try { sessionStorage.removeItem(`premium.timer.endTs.${id}`); } catch {}
          try { sessionStorage.removeItem(`premium.timer.remaining.${id}`); } catch {}
          try { StorySessionCache.clearCachedSession(id); } catch {}
        }
      }
    } catch {}
  })();
  }, [isPremium, userInfo?.name]);

  // Track reading state to pause non-essential intervals
  useEffect(() => {
    const isActivelyReading = story.length > 0 && !isLoading && !error;
    ReadingStateManager.setReadingState(isActivelyReading);
    
    return () => {
      ReadingStateManager.setReadingState(false);
    };
  }, [story.length, isLoading, error]);

  // Monitor network status for image generation
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkAvailable(true);
      setLastImageError(null);
      DebugLogger.log('network', 'Network restored - image generation available');
    };
    
    const handleOffline = () => {
      setIsNetworkAvailable(false);
      DebugLogger.log('network', 'Network offline - image generation unavailable');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Additional premium state not covered by hooks yet
  // Component continues from line 566...
  
  // Helper function to clear ending-related tracking variables
  const clearEndingTracking = useCallback(() => {
    DebugLogger.log('story', 'Clearing ending tracking variables');
    setOriginalStoryLength(null);
    setLastEndingPageIndex(null);
    // Clear global pagination variables
    delete window.__endingPageCount__;
    delete window.__firstEndingPageIndex__;
  }, []);
  
  
  // Image state - now handled by specialized hooks
  // Hooks already initialized above
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  
  // Use storyId from hook, create fallback for consistency
  const storyId = hookStoryId || generateSessionIdWithPrefix('story');
  
  // PHASE 1 FIX: Session ID now handled by useStoryMetadata hook
  
  // Store session IDs in sessionStorage for debugging
  useEffect(() => {
    try {
      sessionStorage.setItem('current_stable_session_id', stableSessionId);
      sessionStorage.setItem('current_character_session_id', characterSessionIdValue);
      DebugLogger.log('image', 'Session IDs stored for debugging:', {
        stableSessionId,
        characterSessionId: characterSessionIdValue,
        areEqual: stableSessionId === characterSessionIdValue
      });
    } catch (error) {
      DebugLogger.warn('image', 'Failed to store session IDs for debugging', error);
    }
  }, [stableSessionId, characterSessionId]);
  
  // Store current page and images for debugging
  useEffect(() => {
    try {
      sessionStorage.setItem('current_page', currentPage.toString());
      sessionStorage.setItem('current_page_images', JSON.stringify(pageImages));
    } catch (error) {
      DebugLogger.warn('image', 'Failed to store current state for debugging', error);
    }
  }, [currentPage, pageImages]);
  
  // Preload images and calculate aspect ratios for mobile/tablet dynamic sizing
  useEffect(() => {
    if (isMobileOrTablet) {
      Object.entries(pageImages).forEach(([pageKey, imageUrl]) => {
        const pageNum = parseInt(pageKey);
        
        // Skip if we already have this image's aspect ratio
        if (imageAspectRatios[pageNum]) return;
        
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          
          setImageAspectRatios(prev => ({
            ...prev,
            [pageNum]: aspectRatio
          }));
          
          setImageNaturalSizes(prev => ({
            ...prev,
            [pageNum]: { width: img.naturalWidth, height: img.naturalHeight }
          }));
          
          DebugLogger.log('image', `Calculated aspect ratio for page ${pageNum}:`, {
            aspectRatio,
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight }
          });
        };
        
        img.onerror = () => {
          DebugLogger.warn('image', `Failed to preload image for aspect ratio calculation on page ${pageNum}`);
        };
        
        img.src = imageUrl;
      });
    }
  }, [pageImages, isMobileOrTablet, imageAspectRatios]);
  
  // Audio and Interactive Features state - keeping local for component-specific audio management
  // Vocabulary pre-fetch state - component specific
  

  // Session-aware image loader for consistent session context
  const { loadImage } = useSessionAwareImageLoader({
    sessionId: stableSessionId, // CRITICAL FIX: Use same session ID as image generation
    timeout: 10000,
    isDebugMode: false
  });

  // DEBUG: Add window objects for console debugging
  useEffect(() => {
    window.currentStoryPage = currentPage;
    window.pageContent = story?.[currentPage];
    window.storyImages = pageImages;
    window.storyState = { story, currentPage, pageImages };
  }, [currentPage, story, pageImages]);

// Voice integration for desktop
const { status: voiceStatus, isSpeaking, handleVoiceToggle, isConnected, isConnecting } = useVoiceIntegration();

// Memoized callbacks for ImageWithFallback to prevent infinite re-renders  
const handleImageLoadingChange = useCallback((isLoading: boolean) => {
  setImageLoadingStates(prev => ({ ...prev, [currentPage]: isLoading }));
}, [currentPage]);

const handleImageFallbackUsed = useCallback((isUsingFallback: boolean) => {
  setFallbackStates(prev => ({ ...prev, [currentPage]: isUsingFallback }));
  if (isUsingFallback) {
    // Rate-limited console warning to prevent spam (will be suppressed by errorSuppressionManager)
    const now = Date.now();
    const lastWarning = sessionStorage.getItem('lastImageWarning');
    if (!lastWarning || (now - parseInt(lastWarning)) > 10000) { // 10 second rate limit
      DebugLogger.warn('image', 'Story image failed to load, using enhanced fallback', pageImages[currentPage]);
      sessionStorage.setItem('lastImageWarning', now.toString());
    }
    
    // Rate-limited fallback to prevent spam
    const lastFallback = sessionStorage.getItem('lastImageFallback');
    if (!lastFallback || (now - parseInt(lastFallback)) > 5000) { // 5 second rate limit
      fallbackToClassic('image-error');
      sessionStorage.setItem('lastImageFallback', now.toString());
    }
    
    // Consolidated toast logic with deduplication
    if (!fallbackToastShownRef.current) {
      // Dismiss any existing toast first
      if (currentToastRef.current) {
        currentToastRef.current.dismiss();
      }
      
      // Show new dismissible toast
      const toastResult = toast({
        variant: "destructive",
        title: "Images are down",
        description: "Try refreshing the page, or if that doesn't work, regenerate a new story.",
      });
      
      // Track the toast for potential dismissal
      currentToastRef.current = toastResult;
      fallbackToastShownRef.current = true;
      DebugLogger.log('story', 'Fallback toast shown for story session');
    }
  }
}, [currentPage, pageImages, fallbackToClassic, toast]);

// PHASE 2 FIX: Image retry handler that actually regenerates images
const handleImageRegeneration = useCallback(async () => {
  if (isGeneratingImage || !isStoryStable || !story?.length) return;
  
  const pageContent = story[currentPage] || '';
  const maxAllowedPage = isPremium ? (story.length - 1) : 5;
  
  if (currentPage > maxAllowedPage) {
    DebugLogger.log('image', `Page ${currentPage}: Beyond allowed generation limit`);
    return;
  }
  
  if (!imagesEnabled) {
    DebugLogger.log('image', `Page ${currentPage}: Images disabled - using static placeholder`);
    setPageImages(prev => ({
      ...prev,
      [currentPage]: IMAGES_DISABLED_PLACEHOLDER
    }));
    return;
  }
  
  DebugLogger.log('image', `Page ${currentPage}: Starting image regeneration...`);
  setIsGeneratingImage(true);
  setIsPreparingImage(true);
  
  try {
    const { ImageGenerationTrigger } = await import('@/utils/imageGenerationTrigger');
    await ImageGenerationTrigger.triggerAutoGeneration({
      currentPage: currentPage,
      totalPages: story.length,
      hasCurrentImage: false,
      allImages: Object.values(pageImages),
      isNetworkAvailable: navigator.onLine,
      userInfo,
      storyTitle: storyTitle || 'Adventure',
      pageText: pageContent,
      sessionId: stableSessionId,
      isGuestUser: !isPremium
    });
  } catch (error) {
    DebugLogger.warn('image', `Failed to regenerate image for page ${currentPage}`, error);
  } finally {
    setIsGeneratingImage(false);
    setIsPreparingImage(false);
  }
}, [currentPage, story, pageImages, isStoryStable, isGeneratingImage, isPremium, userInfo, storyTitle, stableSessionId]);


// Audio engine instance for direct control
const audioEngineRef = useRef(charlotteVoiceService);

// Audio state sync through direct callbacks (no polling)
const handleAudioStateChange = (playing: boolean) => {
  setIsAudioPlaying(playing);
};

// Adapter for StoryAudioControls (expects playing + loading)
const handleAudioStateChangeDual = (playing: boolean, loading: boolean) => {
  setIsAudioPlaying(playing);
  setIsAudioLoading(loading);
};

const handleAudioPlayed = (page: number) => {
  setAudioPlayedPage(page);
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
      
      DebugLogger.log('audio', 'Cleared audio state for page change:', currentPage + 1);
    } catch (error) {
      DebugLogger.warn('audio', 'Failed to clear audio state on page change', error);
    }
  };
  
  clearAudioOnPageChange();
}, [currentPage]); // Triggers when page changes

// Debug userInfo avatar data when component mounts/updates (Fix #1 - CRITICAL)
useEffect(() => {
  DebugLogger.log('story', 'userInfo avatar check:', {
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

// Image generation event listener - triggers when story becomes stable
useEffect(() => {
  const handleStoryStabilized = (event: CustomEvent) => {
    // Use component's local story state instead of event.detail.pages
    if (!story || !Array.isArray(story) || story.length === 0) {
      DebugLogger.warn('image', 'Story stabilized event received but no valid story state');
      return;
    }
    
    const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
    
    DebugLogger.log('image', 'Story stabilized - checking for image generation opportunities', {
      pageCount: story.length,
      currentPage: currentPage,
        sessionId: characterSessionIdValue,
      contentHash: event.detail?.contentHash,
      layout: layout,
      isStoryStable: isStoryStable,
      hasCurrentImage: !!pageImages[currentPage],
      isPremium: isPremium,
      debugMode: isDebug
    });
    
    if (isDebug) {
      DebugLogger.log('image', 'Image Generation Status:', {
        'Current Layout': layout,
        'Story Stable': isStoryStable,
        'Current Page': currentPage,
        'Total Pages': story.length,
        'Has Image for Current Page': !!pageImages[currentPage],
        'All Page Images': Object.keys(pageImages).map(k => `Page ${k}: ${!!pageImages[k]}`),
        'Is Premium': isPremium,
        'Network Available': isNetworkAvailable,
        'Auto Generation Enabled': layout !== "classic"
      });
    }
    
    // 🔧 FIX: Generate image for current page with simple bounds check
    const pageToGenerate = safeCurrentPage;
    const pageText = displayedStory[pageToGenerate];
    
    // Simple bounds check to prevent undefined access
    if (!pageText || pageToGenerate >= displayedStory.length) {
      DebugLogger.warn('image', 'Page index out of bounds for image generation', { 
        pageToGenerate, 
        storyLength: story.length 
      });
      return;
    }
    
    // Respect global image toggle - use static placeholder if disabled
    if (!imagesEnabled) {
      DebugLogger.log('image', '🚫 Images disabled - using static placeholder for story stabilization');
      setPageImages(prev => ({
        ...prev,
        [pageToGenerate]: IMAGES_DISABLED_PLACEHOLDER
      }));
      return;
    }
    
    ImageGenerationTrigger.triggerAutoGeneration({
      currentPage: pageToGenerate,
      totalPages: story.length,
      hasCurrentImage: !!pageImages[pageToGenerate],
      allImages: Object.values(pageImages),
      isNetworkAvailable: navigator.onLine,
      userInfo: userInfo,
      storyTitle: storyTitle || `${safeUserInfo.name}'s Adventure`,
      pageText: pageText,
            sessionId: stableSessionId,
            isGuestUser: !isPremium
    });
  };
  
  window.addEventListener('story:stabilized', handleStoryStabilized as EventListener);
  return () => window.removeEventListener('story:stabilized', handleStoryStabilized as EventListener);
}, [story, currentPage, pageImages, isNetworkAvailable, userInfo, storyTitle, characterSessionIdValue, isPremium]);

// Voice command bridge moved below after currentStory/contentHash are defined

  // Debug source badge state - now handled by useStoryMetadata hook
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // TIMER ENFORCEMENT SYSTEM - Using hook state
  // Timer pause logic - only block forward navigation when paused for non-premium users
  const isTimerPaused = !isPremium && !isTimerRunning && !isTimerCanceled;
  const isForwardNavigationBlocked = isTimerPaused;
  // Timer visibility - now handled by useUIAnimationState hook

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
    DebugLogger.warn('performance', 'Guest sessions must keep timer enabled. Re-enabling.');
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
    let id = safeUserInfo.name || 'premium';
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
    if (isStoryStable && story.length > 0 && !isTimerRunning && !isTimerCanceled && !userPausedTimer && !hasChosenUntimed && timerEnabled) {
      DebugLogger.log('performance', 'FIXED: Auto-starting timer at 20:00 - story is now stable');
      setIsTimerRunning(true);
    } else if (isStoryStable && story.length > 0 && userPausedTimer) {
      DebugLogger.log('performance', 'Timer auto-start blocked - user has manually paused');
    }
  }, [isStoryStable, story.length, isTimerRunning, isTimerCanceled, userPausedTimer, timerEnabled]);

  // CRITICAL: Show long-press instruction immediately when story is stable on mobile/tablet
  useEffect(() => {
    if (isStoryStable && story.length > 0 && (isMobileOrTablet || hasTouchCapability)) {
      DebugLogger.log('ui', 'Story stable - showing long-press instruction for mobile/tablet users');
      // Immediate notification trigger for all mobile/tablet users
      showLongPressInstruction();
    }
  }, [isStoryStable, story.length, isMobileOrTablet, hasTouchCapability, showLongPressInstruction]);

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
// Magic wand and modal state - now handled by useUIAnimationState hook
const LOADER_MIN_MS = 1600;

// Expanded Finish CTA state - now handled by useUIAnimationState hook
// Collapse expanded CTA when user navigates away from the ending page
useEffect(() => {
  if (!finishCTAExpanded) return;
      if (finishExpandedOnPageRef.current != null && currentPage !== finishExpandedOnPageRef.current) {
    setFinishCTAExpanded(false);
  }
}, [currentPage, finishCTAExpanded]);

  // Debug loader override for testing - now handled by useUIAnimationState hook
  useEffect(() => {
    const force = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceLoader') === '1';
    if (force) {
      setForceLoaderActive(true);
      ManagedTimers.setTimeout(() => setForceLoaderActive(false), 2000, 'CleanStoryDisplay');
    }
  }, []);

  // Safety timeout: Auto-clear loader if stuck for >25s
  useEffect(() => {
    if (!isLoading) return;
    
    const SAFETY_TIMEOUT_MS = 60000; // 60 seconds for better reliability
    const safetyTimer = ManagedTimers.setTimeout(() => {
      DebugLogger.warn('story', 'Story loader safety timeout triggered after 25s');
      setIsLoading(false);
      setError('Story setup is taking longer than usual. Please try again or check your connection.');
    }, SAFETY_TIMEOUT_MS, 'CleanStoryDisplay');
    
    return () => {
      ManagedTimers.clearTimer(safetyTimer);
    };
  }, [isLoading]);

  // Difficulty management now handled by useDifficultyManagement hook
  const difficultyLevels: string[] = ['pre-reader', 'beginner', 'developing', 'independent', 'advanced'];
  
  useEffect(() => {
    if (!isPremium) return;
    (async () => {
      try {
        const guardrails = await ParentGuardrailsService.getGuardrails();
        setLockDifficulty(guardrails.lockDifficulty);
        setMinDifficulty(guardrails.minDifficulty);
        setMinExpertGrade(guardrails.minExpertGrade);
        setAllowDecreaseBelowMin(!!guardrails.allowDecreaseBelowMin);

        // Hard lock: clamp up immediately and persist if below min
        if (guardrails.lockDifficulty) {
          const currentIndex = difficultyLevels.indexOf(currentDifficulty);
          const minIndex = difficultyLevels.indexOf(guardrails.minDifficulty);
          if (currentIndex < minIndex) {
            const newDifficulty = guardrails.minDifficulty;
            setCurrentDifficulty(newDifficulty);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profiles').update({ difficulty_level: newDifficulty }).eq('user_id', user.id);
              }
            } catch (e) {
              DebugLogger.warn('auth', 'Failed to persist clamped difficulty', e);
            }
          }
        }
      } catch (e) {
        DebugLogger.error('auth', 'Failed to load parent guardrails', e);
      }
    })();
  }, [isPremium]);

  useEffect(() => {
    if (!highlightSave) return undefined;
    const timer = ManagedTimers.setTimeout(() => setHighlightSave(false), 8000, 'CleanStoryDisplay');
    return () => {
      ManagedTimers.clearTimer(timer);
    };
  }, [highlightSave]);
  useEffect(() => {
    return () => {
      ManagedTimers.clearComponentTimers('CleanStoryDisplay');
    };
  }, []);
  
  const currentStoryText = displayedStory[Math.min(currentPage, displayedStory.length - 1)] || "";
  const effectiveAudioText = currentStoryText; // Use full text for audio - no truncation
  const contentHash = hashText(effectiveAudioText);

  // Hash generation debug (suppressed for clean console)

  // Event-based story stability - listen for actual completion
  useEffect(() => {
    const handleStoryComplete = () => {
      DebugLogger.log('story', 'Story generation completed - setting stability immediately');
      setIsStoryStable(true);
      // NOTE: Removed immediate story:stabilized dispatch to fix race condition
      // story:stabilized will be dispatched by the story-state-aware useEffect below
    };

    window.addEventListener('story:generation:complete', handleStoryComplete);
    return () => window.removeEventListener('story:generation:complete', handleStoryComplete);
  }, []);

  // ✅ BULLETPROOF: Story-state-aware useEffect with debounce
  // Only dispatch story:stabilized when BOTH conditions are met:
  // 1. isStoryStable === true (preserves flicker prevention)
  // 2. story.length > 0 (proves setStory() has completed and updated React state)
  useEffect(() => {
    if (!isStoryStable || story.length === 0) {
      return () => {}; // No-op cleanup for consistency
    }

    DebugLogger.log('story', 'BULLETPROOF: Both conditions met - isStoryStable=true AND story.length=' + story.length);
    
    // Debounce for rapid updates (100ms)
    const timeoutId = ManagedTimers.setTimeout(() => {
      // Guard against duplicate dispatch
      const lastDispatch = (window as any).__lastStoryStabilizedDispatch || 0;
      const now = Date.now();
      if (now - lastDispatch < 500) {
        DebugLogger.log('story', 'Skipping duplicate story:stabilized dispatch (too soon)', { timeSince: now - lastDispatch });
        return;
      }
      
      (window as any).__lastStoryStabilizedDispatch = now;
      DebugLogger.log('story', 'BULLETPROOF: Dispatching story:stabilized with fresh story data');
      window.dispatchEvent(new CustomEvent('story:stabilized'));
    }, 100, 'CleanStoryDisplay');

    return () => ManagedTimers.clearTimer(timeoutId);
  }, [isStoryStable, story.length]); // Watch both state variables

  useEffect(() => {
    try { 
      const previousHash = window.__pageContentHash;
      const previousText = window.__pageContentString;
      
      // 🔍 PHASE 1 & 2: Debug hash setting and comparison
      DebugLogger.log('story', 'Hash Setting Debug:', {
        previousHash: previousHash?.slice(0, 12),
        newHash: contentHash?.slice(0, 12),
        hashChanged: previousHash !== contentHash,
        previousTextLength: previousText?.length || 0,
        newTextLength: currentStoryText.length,
        textChanged: previousText !== currentStoryText,
        effectiveAudioTextLength: effectiveAudioText.length,
        currentPage,
        timestamp: Date.now(),
        timingSince: previousHash ? 'N/A' : 'Initial'
      });
      
      window.__pageContentHash = contentHash; 
      window.__pageContentString = currentStoryText;
      window.__storyTitle = storyTitle || `${userInfo?.name}'s Adventure` || 'the story';
      
      // Emit hash change event if hash actually changed
      if (previousHash !== contentHash && contentHash) {
        DebugLogger.log('story', `Content hash changed: ${previousHash?.slice(0,10)} → ${contentHash?.slice(0,10)}`);
        DebugLogger.log('story', 'Hash Change Analysis:', {
          hashLengthChange: (contentHash?.length || 0) - (previousHash?.length || 0),
          textSource: 'effectiveAudioText',
          isTextConsistent: effectiveAudioText.length > 0,
          potentialCause: currentStoryText.length !== effectiveAudioText.length ? 'text_truncation' : 'content_change'
        });
        
        window.dispatchEvent(new CustomEvent('content:hash:changed', { 
          detail: { 
            previousHash, 
            newHash: contentHash, 
            timestamp: Date.now(),
            textLengthChange: currentStoryText.length - (previousText?.length || 0),
            effectiveTextLength: effectiveAudioText.length
          } 
        }));
      }
      window.__userName = userInfo?.name || '';
      DebugLogger.log('ui', 'Content variables updated for voice commands', {
        page: currentPage,
        textLength: currentStoryText.length,
        hasHash: !!contentHash,
        storyTitle: window.__storyTitle,
        userName: window.__userName,
        textPreview: currentStoryText.substring(0, 100) + '...'
      });
    } catch (error) {
      DebugLogger.error('ui', 'Failed to set content variables', error);
    }
  }, [contentHash, currentStoryText, currentPage]);

  // Reset free-tier audio flag when navigating to a new page or content changes
  useEffect(() => {
    setAudioPlayedPage(null);
  }, [currentPage, contentHash]);
  
  // Audio highlighting integration (with difficulty-based highlighting control)
  const backendDifficulty = DifficultyLevelMapper.toBackend(currentDifficulty);
  const { highlightWord, clearHighlighting, currentHighlightedWord } = useAudioControls({
    text: currentStoryText,
    userInfo: safeUserInfo,
    currentPage,
    contentHash,
    difficulty: backendDifficulty as "beginner" | "easy" | "medium" | "hard" | "expert",
    isPremium
  });

  // Word highlighting callback for audio playback
  const onWordHighlight = highlightWord;

// Voice command -> audio control bridge (now using SimplifiedAudioEngine)
useEffect(() => {
  const onPlay = () => { 
      try { 
        audioEngineRef.current.charlotteReadStory(currentStoryText || "", onWordHighlight); 
      } catch (e) { DebugLogger.warn('audio', 'audio:play failed', e); }
  };
  const onPause = () => { try { audioEngineRef.current.stop(); } catch (e) { DebugLogger.warn('audio', 'audio:pause failed', e); } };
  window.addEventListener('audio:play', onPlay as EventListener);
  window.addEventListener('audio:pause', onPause as EventListener);
  return () => {
    window.removeEventListener('audio:play', onPlay as EventListener);
    window.removeEventListener('audio:pause', onPause as EventListener);
  };
}, [currentStory, contentHash]);

  // Listen for auto-generated images - FIXED ASYNC RACE CONDITION
  useEffect(() => {
    const handleImageGenerated = async (event: CustomEvent) => {
      const { pageIndex, imageUrl } = event.detail;
      DebugLogger.log('image', 'Auto-generated image received:', { pageIndex, imageUrl });
      
      setPageImages(prev => {
        const updated = { ...prev, [pageIndex]: imageUrl };
        
        // CRITICAL FIX: Notify parent about image updates for premium saving
        onPageImagesUpdate?.(updated);
        
        // CRITICAL FIX: Perform async operations BEFORE returning from setPageImages
        (async () => {
          try {
            if (isPremium) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user?.id && story) {
                const avatarType = userInfo?.avatar?.type;
                const imageArray = Object.entries(updated).map(([index, url]) => ({
                  url,
                  prompt: `Page ${parseInt(index) + 1} illustration`
                }));
                
                StorySessionCache.updatePages(
                  user.id,
                  story,
                  currentPage,
                  imageArray,
                  avatarType
                );
                DebugLogger.log('image', 'Premium image cached:', { pageIndex, userId: user.id });
              }
            } else if (story && userInfo) {
              const avatarType = safeUserInfo.avatar?.type;
              const imageArray = Object.entries(updated).map(([index, url]) => ({
                url,
                prompt: `Page ${parseInt(index) + 1} illustration`
              }));
              
              StorySessionCache.updatePages('guest', story, currentPage, imageArray, avatarType);
              DebugLogger.log('image', 'Guest image cached:', { pageIndex, avatarType });
            }
          } catch (error) {
            DebugLogger.error('image', 'Cache persistence failed', error);
          }
        })();
        
        return updated;
      });
    };
    
    window.addEventListener('image:generated', handleImageGenerated as EventListener);
    return () => window.removeEventListener('image:generated', handleImageGenerated as EventListener);
  }, [isPremium, userInfo, story, currentPage, supabase]); // CRITICAL: Add all dependencies including supabase

  // Voice word help: on "What is this word?" play Hear it -> Explain it -> Syllables (Charlotte) and auto-resume narration
  useEffect(() => {
    const CHARLOTTE = 'XB0fDUnXU5powFXDhCwa';

    const playTTS = async (text: string) => {
      await charlotteVoiceService.charlotteInteractiveAudio({ text, context: 'conversation' });
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
        let target: string = window.__hoveredWord || window.__lastSelectedWord || '';
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
        const cleanWord = target.toLowerCase().replace(/[^a-z]/g, '');
        const raw = phonicsMiniDict[cleanWord] || [target];
        const adjusted = toAudioFriendlySyllables(target, raw);
        const syllText = (adjusted || []).join(', ');
        await playTTS(syllText);
      } catch (e) {
        DebugLogger.warn('audio', 'voice:wordHelp sequence failed', e);
      } finally {
        // Auto-resume narration if it was playing before the help flow
        if (wasPlaying) {
          try { 
            await audioEngineRef.current.charlotteReadStory(currentStoryText || "", onWordHighlight); 
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
    userId: safeUserInfo.name,
    enablePersistence: isPremium, // Only persist for premium users
    onAchievementUnlocked: (achievement) => {
      DebugLogger.log('story', 'Achievement unlocked:', achievement.title || achievement.id);
    }
  });

  // Memoize story initialization key to prevent spurious re-initializations
  const storyInitKey = useMemo(() => 
    JSON.stringify({ 
      name: safeUserInfo.name, 
      age: safeUserInfo.age,
      specialRequest: safeUserInfo.specialRequest,
      isPremium, 
      readingAsName,
      isFromSavedStory: currentStory?.isFromSavedStory 
    }), 
    [safeUserInfo.name, safeUserInfo.age, safeUserInfo.specialRequest, isPremium, readingAsName, currentStory?.isFromSavedStory]
  );

  // Initialize story based on tier - with ENHANCED generation protection
  useEffect(() => {
    // Simple check to prevent double generation for same user context
    if (isStoryStable && story.length > 0) {
      setIsLoading(false);
      return;
    }
    
    initializeStory();
  }, [storyInitKey]);

  // Generate image for current page with better diagnostics - ONLY AFTER STORY IS STABLE
  useEffect(() => {
    const isDebug = new URLSearchParams(window.location.search).has('debug');
    if (isDebug) {
      DebugLogger.log('image', 'Image generation check', {
        layout,
        storyLength: story.length,
        currentPage,
        hasCurrentImage: !!pageImages[currentPage],
        isStoryStable,
        allImages: Object.keys(pageImages)
      });
    }
    
    // ✅ BULLETPROOF: Removed duplicate image generation system
    // ImageGenerationTrigger now handles ALL layouts via story:stabilized events
  }, [currentPage, story, pageImages, layout, isStoryStable]);

// Timer countdown effect
useEffect(() => {
  let intervalId: string;
  if (isTimerRunning && timeRemaining > 0 && !isTimerCanceled) {
    intervalId = ManagedTimers.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000, 'CleanStoryDisplay');
  }
  return () => {
    if (intervalId) ManagedTimers.clearTimer(intervalId);
  };
}, [isTimerRunning, timeRemaining, isTimerCanceled]);

// Persist timer remaining periodically for both tiers
const timeRef = useRef(timeRemaining);
useEffect(() => { timeRef.current = timeRemaining; }, [timeRemaining]);
useEffect(() => {
  const iv = ManagedTimers.setInterval(() => {
    // Performance optimization: Use cached user ID to avoid async calls in timer
    const startTime = performance.now();
    
    try {
      if (!isPremium) {
        guestSession.saveRemaining(timeRef.current);
      } else {
        // Use cached user ID instead of expensive auth call
        sessionStorage.setItem(`premium.timer.remaining.${cachedUserId}`, String(timeRef.current));
      }
    } catch (error) {
      DebugLogger.warn('performance', 'Timer persistence failed', error);
    }
    
    // Performance monitoring: Log if timer handler took too long
    const duration = performance.now() - startTime;
    if (duration > 16) {
      DebugLogger.warn('performance', `Slow timer persistence: ${duration.toFixed(2)}ms`);
    }
  }, 2000, 'CleanStoryDisplay');
  return () => {
    if (iv) ManagedTimers.clearTimer(iv);
  };
}, [isPremium, cachedUserId]);

useEffect(() => {
  if (timeRemaining === 0) {
    (async () => {
      try {
        if (!isPremium) {
          guestSession.clearAll();
          StorySessionCache.clearCachedSession('guest');
        } else {
          let id = safeUserInfo.name || 'premium';
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
  if (!isPremium && currentPage === 5 && displayedStory.length > 5) { // Show on page 6 (index 5)
    setIsMagicWandAnimating(true);
    // NO TIMEOUT - Keep animating until user clicks!
  } else {
    setIsMagicWandAnimating(false);
  }
}, [currentPage, displayedStory.length, isPremium]);

// Subtle pulse for wand every 3 pages
useEffect(() => {
  if (currentPage > 0 && (currentPage + 1) % 3 === 0) {
    setWandPulse(true);
    const t = ManagedTimers.setTimeout(() => setWandPulse(false), 1200, 'CleanStoryDisplay');
    return () => ManagedTimers.clearTimer(t);
  }
  return () => {}; // No-op cleanup for consistency
}, [currentPage]);

// Finish button feedback: state - now handled by useUIAnimationState hook
const prevIsGeneratingEndingRef = useRef(isGeneratingEnding);
useEffect(() => {
  if (prevIsGeneratingEndingRef.current && !isGeneratingEnding && isPremium) {
    setShowEndingBurst(true);
    const t = ManagedTimers.setTimeout(() => setShowEndingBurst(false), 1400, 'CleanStoryDisplay');
    prevIsGeneratingEndingRef.current = isGeneratingEnding;
    return () => ManagedTimers.clearTimer(t);
  }
  prevIsGeneratingEndingRef.current = isGeneratingEnding;
  return () => {}; // No-op cleanup for consistency
}, [isGeneratingEnding, isPremium]);

// CRITICAL FIX: Page navigation image generation - check cache first, generate if missing
useEffect(() => {
  if (!isStoryStable || !story?.length || currentPage === null || isGeneratingImage) return;
  
  // Check if current page needs an image
  const hasCurrentPageImage = pageImages[currentPage];
  if (hasCurrentPageImage) {
    DebugLogger.log('image', `Page ${currentPage}: Image already exists, skipping generation`);
    return;
  }
  
  DebugLogger.log('image', `Page ${currentPage}: No image found, checking cache then generating...`);
  
  // Check cache first - import dynamically to avoid module issues
  const checkCacheAndGenerate = async () => {
    try {
      const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
      // PHASE 1 FIX: Use stable session ID for consistent caching
      const sessionId = stableSessionId;
      const storyHash = (safeStory || []).join('|').substring(0, 50);
      const pageContent = displayedStory[safeCurrentPage] || '';
      
      // Extract avatar info for cache validation
      const avatarType = safeUserInfo?.avatar?.type || 'child';
      const skinTone = safeUserInfo?.avatar?.skinTone;
      
      // Try to get cached image
      const cachedImageUrl = EnhancedImageCache.getCachedImage(
        pageContent,
        sessionId,
        currentPage,
        storyHash,
        undefined, // contextualMarkers
        avatarType,
        skinTone
      );
      
    // Enhanced image loading for current page with session awareness
    if (cachedImageUrl) {
      DebugLogger.log('image', `Page ${currentPage}: Found cached image, preloading with session context`);
      
      // Preload with session context before updating state
      const imageLoaded = await loadImage(cachedImageUrl, (stage) => {
        DebugLogger.log('image', `Cached image loading: ${stage}`, { currentPage, cachedImageUrl });
      });
      
      if (imageLoaded) {
        setPageImages(prev => ({ ...prev, [currentPage]: cachedImageUrl }));
        onPageImagesUpdate?.({ ...pageImages, [currentPage]: cachedImageUrl });
      } else {
        DebugLogger.warn('image', 'Cached image failed to load, will regenerate', { currentPage, cachedImageUrl });
      }
      return;
    }
      
      // No cached image, trigger generation if page is within allowed range
      const maxAllowedPage = isPremium ? (story.length - 1) : 5; // Premium: all pages, Guest: pages 0-5
      if (currentPage <= maxAllowedPage) {
        if (!imagesEnabled) {
          DebugLogger.log('image', `Page ${currentPage}: Images disabled - using static placeholder`);
          setPageImages(prev => ({
            ...prev,
            [currentPage]: IMAGES_DISABLED_PLACEHOLDER
          }));
          return;
        }
        
        DebugLogger.log('image', `Page ${currentPage}: No cached image, triggering generation`);
        try {
          const { ImageGenerationTrigger } = await import('@/utils/imageGenerationTrigger');
          ImageGenerationTrigger.triggerAutoGeneration({
            currentPage: currentPage,
            totalPages: story.length,
            hasCurrentImage: false,
            allImages: Object.values(pageImages),
            isNetworkAvailable: navigator.onLine,
            userInfo,
            storyTitle: storyTitle || 'Adventure',
            pageText: pageContent,
            sessionId: stableSessionId,
            isGuestUser: !isPremium
          });
        } catch (error) {
          DebugLogger.warn('image', `Failed to generate image for page ${currentPage}`, error);
        }
      }
    } catch (error) {
      DebugLogger.warn('image', `Failed to check cache/generate for page ${currentPage}`, error);
    }
  };
  
  checkCacheAndGenerate();
}, [currentPage, story, pageImages, isStoryStable, isGeneratingImage, isPremium, userInfo, storyTitle]);

// Trigger finish story flash + sparkle every 5 completed pages
useEffect(() => {
  const completed = pagesCompleted.size;
  if (completed > 0 && completed % 5 === 0) {
    setFinishSparkle(true);
    setFinishFlashCycle(true);
    const t1 = ManagedTimers.setTimeout(() => setFinishSparkle(false), 2000, 'CleanStoryDisplay');
    const t2 = ManagedTimers.setTimeout(() => setFinishFlashCycle(false), 2000, 'CleanStoryDisplay');
    return () => { 
      ManagedTimers.clearTimer(t1); 
      ManagedTimers.clearTimer(t2); 
    };
  }
  return;
}, [pagesCompleted]);

// Ensure timer UI becomes visible when time ends for premium (to show celebration + choice)
useEffect(() => {
  if (isPremium && timeRemaining === 0 && !isTimerVisible) {
    setIsTimerVisible(true);
  }
}, [isPremium, timeRemaining, isTimerVisible]);


// Add initialization guard
const isInitializingRef = useRef(false);

const initializeStory = async () => {
  // Prevent multiple simultaneous initializations
  if (isInitializingRef.current) {
    DebugLogger.log('story', 'initializeStory: Already initializing, skipping');
    return;
  }
  
  // Simple check to prevent double generation
  if (isStoryStable && story.length > 0) {
    setIsLoading(false);
    return;
  }
  
  isInitializingRef.current = true;
  
  DebugLogger.log('story', 'initializeStory start', { 
    isPremium, 
    userName: userInfo?.name
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
      expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
    } as UserInfo;
    if (isPremium) {
      // Premium: restore from cache if available (guarded by feature flag)
      try {
        const params = new URLSearchParams(window.location.search);
        const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
        const viaUrl = allowOverride && params.get('resume') === '1';
        const resumeEnabled = APP_CONFIG.features.resumeOnRefresh.premium || viaUrl;

        let cacheId = safeUserInfo.name || 'premium';
        try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) cacheId = user.id; } catch {}

        if (resumeEnabled) {
          const cached = StorySessionCache.getCachedStorySession(cacheId);
          if (cached && cached.pages?.length) {
            DebugLogger.log('story', 'Restoring premium story from cache');
            
            // Robust page restoration logic - preserve progress, don't reset to 0
            const cachedPage = cached.currentPage || 0;
            const maxValidPage = Math.max(0, cached.pages.length - 1);
            const restoredPage = Math.min(cachedPage, maxValidPage);
            
            DebugLogger.log('story', 'Page restoration details', {
              cachedCurrentPage: cachedPage,
              pagesLength: cached.pages.length,
              maxValidPage,
              restoredPage,
              userType: 'premium'
            });
            
            StoryContentLogger.logStoryChange('premium_cache_restore', 'before', cached.pages, {
              cacheId,
              cachedPageCount: cached.pages.length,
              currentPage: cachedPage,
              isComplete: !!cached.isComplete
            });
            setStory(cached.pages);
            StoryContentLogger.logStoryChange('premium_cache_restore', 'after', cached.pages, {
              restoredCurrentPage: restoredPage
            });
            setCurrentPage(restoredPage);
            setIsStoryComplete(!!cached.isComplete);
            setStoryTitle(`${safeUserInfo.name}'s Live Adventure`);
            const ctx: LiveGenerationContext = {
              userInfo: { ...effectiveUser, difficultyLevel: currentDifficulty },
              difficulty: currentDifficulty,
              expertGradeLevel: currentDifficulty === 'advanced' ? expertGradeLevel : undefined,
              storyContext: [...cached.pages],
              currentPage: cached.currentPage || 0,
              totalExpectedPages: Math.max(cached.pages.length + 1, 6),
              characters: [safeUserInfo.name, safeUserInfo.favoriteAnimal || 'friend']
            };
        setLiveContext(ctx);
        DebugLogger.log('story', '💾 Premium Live Generation: Context restored from cache', {
          contextPage: ctx.currentPage,
          storyContextLength: ctx.storyContext?.length,
          difficulty: ctx.difficulty,
          sessionId: stableSessionId
        });
            const srcPremium = window.__LAST_STORY_SOURCE__ || 'unknown';
            setStorySource(srcPremium);
            
            // CRITICAL FIX: Add missing image restoration for premium users
            const convertedImages = convertImagesToRecord(cached.images, 'Premium cache restoration');
            if (convertedImages && Object.keys(convertedImages).length > 0) {
              setPageImages(convertedImages);
              onPageImagesUpdate?.(convertedImages);
              DebugLogger.log('image', 'Premium cache restoration: Images loaded from session cache', convertedImages);
            } else {
              DebugLogger.log('image', 'Premium cache restoration: No cached images found, will generate new ones');
            }
            
            setIsStoryStable(true);
            return; // Early return
          }
        } else {
          // Proactively clear any cached session to avoid loops
          try { sessionStorage.removeItem(`premium.timer.endTs.${cacheId}`); } catch {}
          try { sessionStorage.removeItem(`premium.timer.remaining.${cacheId}`); } catch {}
          try { StorySessionCache.clearCachedSession(cacheId); } catch {}
        }
      } catch (e) { DebugLogger.warn('auth', 'Failed to restore premium cached session', e); }

      // Premium: Live generation - start with first page
      DebugLogger.log('story', 'Premium user: Starting live generation');
      const result = await LiveGenerationService.generateFirstPage(effectiveUser, undefined, vocabularyData);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      StoryContentLogger.logStoryChange('premium_first_page', 'before', [Array.isArray(result.content) ? result.content[0] : result.content], {
        userInfo: effectiveUser.name,
        difficulty: currentDifficulty,
        hasNextContext: !!result.nextContext,
        isComplete: result.isComplete
      });
      const firstPageContent = Array.isArray(result.content) ? result.content[0] : result.content;
      setStory([firstPageContent]);
      StoryContentLogger.logStoryChange('premium_first_page', 'after', [firstPageContent], {
        expertGradeLevel: result.nextContext?.expertGradeLevel,
        title: `${safeUserInfo.name}'s Live Adventure`
      });
      setLiveContext(result.nextContext || null);
      DebugLogger.log('story', '🚀 Premium Live Generation: Initial context set', {
        hasNextContext: !!result.nextContext,
        contextPage: result.nextContext?.currentPage,
        storyContextLength: result.nextContext?.storyContext?.length,
        sessionId: stableSessionId
      });
      // Sync UI with adaptive expert grade if returned
      if (result.nextContext?.expertGradeLevel) {
        setExpertGradeLevel(result.nextContext.expertGradeLevel);
      }
      setIsStoryComplete(result.isComplete);
      setStoryTitle(`${safeUserInfo.name}'s Live Adventure`);
      
      // Show current grade level toast for premium users
      if (currentDifficulty === 'expert' || currentDifficulty === 'advanced') {
        const gradeToShow = ExpertDifficultyManager.getCurrentGradeLevel(userInfo);
        toast({
          title: "Reading Level",
          description: `Reading at ${gradeToShow} Grade Level`,
          duration: 3000,
        });
      }
      const srcPremium = window.__LAST_STORY_SOURCE__ || 'unknown';
      DebugLogger.log('ui', 'UI SOURCE', { source: srcPremium, tier: 'premium' });
      setStorySource(srcPremium);
      
      // Persist premium story start
      try {
        let cacheId = safeUserInfo.name || 'premium';
        try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) cacheId = user.id; } catch {}
        StorySessionCache.cacheStorySession(
          cacheId,
          currentDifficulty as any,
          [Array.isArray(result.content) ? result.content[0] : result.content],
          [{ prompt: '' }],
          0,
          { isPremium: true, sessionStartTime: sessionStartTimeValue }
        );
      } catch (e) { DebugLogger.warn('story', 'Story cache failed (premium start)', e); }
      
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
            DebugLogger.log('story', `Restoring guest story from cache (avatar: ${avatarType}) - CONTENT LOCKED AFTER RESTORE`);
            
            // Robust page restoration logic for free users - handle page 6 scenario specifically
            const cachedPage = cached.currentPage || 0;
            const maxValidPage = Math.max(0, cached.pages.length - 1);
            let restoredPage = Math.min(cachedPage, maxValidPage);
            
            // Special handling for free users on page 6 (last page)
            if (cachedPage === 5 && cached.pages.length >= 6) {
              restoredPage = 5; // Preserve page 6 progress for free users
              DebugLogger.log('story', 'Free user page 6 preserved:', { cachedPage, pagesLength: cached.pages.length });
            }
            
            DebugLogger.log('story', 'Free user page restoration details', {
              cachedCurrentPage: cachedPage,
              pagesLength: cached.pages.length,
              maxValidPage,
              restoredPage,
              userType: 'free',
              isPage6Scenario: cachedPage === 5
            });
            
            StoryContentLogger.logStoryChange('guest_cache_restore', 'before', cached.pages, {
              avatarType,
              cachedPageCount: cached.pages.length,
              currentPage: cachedPage,
              isContentLocked: true
            });
          setStory(cached.pages);
          StoryContentLogger.logStoryChange('guest_cache_restore', 'after', cached.pages, {
            restoredCurrentPage: restoredPage,
            title: `${safeUserInfo.name}'s Adventure`,
            storySource: 'unknown'
          });
          setCurrentPage(restoredPage);
          setStoryTitle(`${safeUserInfo.name}'s Adventure`);
          setIsStoryComplete(true);
          setStorySource('unknown');
          
          // Show random grade level toast for free users (from cache restore)
          if (currentDifficulty === 'expert' || currentDifficulty === 'advanced') {
            const randomGrade = ExpertDifficultyManager.getRandomGradeLevel();
            toast({
              title: "Reading Level",
              description: `You're reading a ${randomGrade} Grade story today!`,
              duration: 4000,
            });
          }
            
            // Load cached images using unified conversion logic
            const convertedImages = convertImagesToRecord(cached.images, 'Cache restoration');
            if (convertedImages && Object.keys(convertedImages).length > 0) {
              setPageImages(convertedImages);
              onPageImagesUpdate?.(convertedImages); // CRITICAL: Notify parent of cache restoration
              DebugLogger.log('image', 'Premium cache restoration: Images loaded from session cache', convertedImages);
            } else {
              DebugLogger.log('image', 'Premium cache restoration: No cached images found, will generate new ones');
            }
            
            setIsStoryStable(true);
            return; // Early return - NO FALLBACK TO REGENERATION
          }
        } else {
          // Proactively clear any cached guest session to avoid loops
          try { StorySessionCache.clearCachedSession('guest'); } catch {}
          try { guestSession.clearAll(); } catch {}
        }
      } catch (e) { DebugLogger.warn('story', 'Failed to restore cached guest session', e); }

      // Free: Netflix-style - generate complete story upfront
      DebugLogger.log('story', 'Free user: Generating complete story', { isPremium, userInfo: userInfo?.name });
      DebugLogger.log('story', 'DIAGNOSTIC: CleanStoryDisplay calling NetflixStyleStoryService', {
        userName: safeUserInfo.name,
        difficulty: safeUserInfo.difficultyLevel,
        timestamp: new Date().toISOString()
      });
      
      // ✅ CRITICAL FIX: Debug userInfo gender before story generation
      DebugLogger.log('story', '[GENDER DEBUG] UserInfo being passed to story generation', {
        name: effectiveUser.name,
        avatarType: effectiveUser.avatar?.type,
        avatarSkinTone: effectiveUser.avatar?.skinTone,
        fullAvatar: effectiveUser.avatar,
        effectiveUserFull: effectiveUser
      });
      
      // ⚠️ VALIDATION: Ensure avatar type is set correctly
      if (!effectiveUser.avatar?.type) {
        DebugLogger.error('story', '[CRITICAL] Avatar type is missing! This will cause pronoun issues.');
        toast({
          title: "Character Error",
          description: "Avatar information is missing. Please refresh and select your character again.",
          variant: "destructive"
        });
        return;
      }
      
      const result = await NetflixStyleStoryService.generateCompleteStory(effectiveUser);
      
      DebugLogger.log('story', 'DIAGNOSTIC: NetflixStyleStoryService result received', {
        hasError: !!result.error,
        pagesCount: result.content?.length,
        pageCount: result.pageCount,
        sampleContent: result.content?.[0]?.substring(0, 50)
      });

      if (result.error) {
        DebugLogger.error('story', 'DIAGNOSTIC: Story generation returned error', result.error);
        setError(result.error);
        return;
      }
      
      DebugLogger.log('story', 'DIAGNOSTIC: Pre-processing story for placeholders BEFORE setStory', {
        pagesCount: result.content.length,
        firstPage: result.content[0]?.substring(0, 100),
        hasPlaceholders: result.content.some(page => page.includes('{'))
      });

      // PHASE 1: STORY STABILIZATION LOADING STATE - Process in background, show loading until complete
      DebugLogger.log('story', 'PHASE 1: Processing story content in background - users will see loading state until complete...');
      
      // Basic content cleanup (full processing now handled by unified edge function)
      const processedPages = result.content.map((page: string) => {
        return page
          .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
          .replace(/\s+([,.!?:;])/g, '$1') // Remove space before punctuation
          .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Ensure space after sentence endings
          .trim();
      });
      
      // Initialize character context directly
      try {
        const storyState = StoryVisualStateManager.getOrCreateStoryState(
          characterSessionIdValue,
          processedPages.length,
          'new',
          false,
          false
        );
        DebugLogger.log('story', `Initialized character context for ${safeUserInfo.name} directly via StoryVisualStateManager`);
      } catch (error) {
        DebugLogger.warn('story', 'Failed to initialize character context', error);
      }
      
      DebugLogger.log('story', 'PHASE 1: Story fully processed in background - ready for stable display', {
        processedFirstPage: processedPages[0]?.substring(0, 100),
        stillHasPlaceholders: processedPages.some((page: string) => page.includes('{'))
      });

      StoryContentLogger.logStoryChange('free_complete_story', 'before', processedPages, {
        originalPageCount: result.content.length,
        processedPageCount: processedPages.length,
        storyTitle: `Story for ${effectiveUser.name}`,
        storySource: window.__LAST_STORY_SOURCE__ || 'unknown'
      });
      
      // BUFFERED UPDATE: Prevent flickering by updating in single batch
      DebugLogger.log('story', 'Setting story content via buffer to prevent flickering...');
      
      // Token validation for guest users (6-page story limit)
      // Backend now handles all validation - remove frontend re-validation
      if (!isPremium) {
        // Keep story length logging for analytics but trust backend validation
        const fullStoryText = (processedPages || []).join(' ');
        DebugLogger.log('story', 'Guest story processed', {
          totalLength: fullStoryText.length,
          pageCount: processedPages?.length || 0,
          difficulty: currentDifficulty
        });
      }
      
      setStory(processedPages);
      setStoryTitle(`Story for ${effectiveUser.name}`);
      setIsStoryComplete(true);
      const srcFree = window.__LAST_STORY_SOURCE__ || 'unknown';
      
      // Show random grade level toast for free users (new story)
      if (currentDifficulty === 'expert' || currentDifficulty === 'advanced') {
        const randomGrade = ExpertDifficultyManager.getRandomGradeLevel();
        toast({
          title: "Reading Level",
          description: `You're reading a ${randomGrade} Grade story today!`,
          duration: 4000,
        });
      }
      
      StoryContentLogger.logStoryChange('free_complete_story', 'after', processedPages, {
        isComplete: true,
        finalSource: srcFree,
        storyTitle: `Story for ${effectiveUser.name}`
      });
      DebugLogger.log('ui', 'UI SOURCE', { source: srcFree, tier: 'free' });
      setStorySource(srcFree);

      // Persist guest story for refresh-resume with avatar-aware cache key
      try {
        const avatarType = userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
        StorySessionCache.cacheStorySession(
          'guest',
          currentDifficulty as any,
          processedPages, // Use processed pages for consistency
          processedPages.map(() => ({ prompt: '' })),
          0,
          { isPremium: false, sessionStartTime: sessionStartTimeValue },
          undefined,
          undefined,
          avatarType
        );
        DebugLogger.log('story', `Guest story cached with processed pages and avatar type: ${avatarType}`);
      } catch (e) { DebugLogger.warn('story', 'Story cache failed', e); }

      // 🔧 FIX: Dispatch stability event with PROCESSED content for image generation
      // This ensures images are generated from the same content users see
      ManagedTimers.setTimeout(() => {
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
        DebugLogger.log('story', 'Story stability event dispatched with processed content for image generation');
      }, 500);
    }
    
  } catch (error) {
    DebugLogger.error('story', 'Story initialization failed', error);
    setError('Failed to create your story. Please try again.');
  } finally {
    // Always clear initialization guard
    isInitializingRef.current = false;
    
    const elapsed = Date.now() - loaderStartRef.current;
    const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
    DebugLogger.log('story', 'initializeStory finished', { 
      elapsed, 
      remaining, 
      LOADER_MIN_MS, 
      
      storyPagesGenerated: story.length 
    });
    
    DebugLogger.log('story', 'Story generation completed successfully');
    
    // DEBOUNCED STABILITY: Prevent rapid toggling that causes flickering
    const storyElapsed = Date.now() - loaderStartRef.current;
    const storyRemaining = Math.max(0, LOADER_MIN_MS - storyElapsed);
    DebugLogger.log('story', 'initializeStory finished', { 
      elapsed: storyElapsed, 
      remaining: storyRemaining, 
      LOADER_MIN_MS, 
      storyPagesGenerated: story.length 
    });
    
    if (storyRemaining > 0) {
      ManagedTimers.setTimeout(() => {
        setIsLoading(false);
        // Debounced stability to prevent flickering
      setIsStoryStable(true);
      DebugLogger.log('story', 'PHASE 6: Story is now stable and locked - timer can start, images can generate');
        
        // Show touch device instruction after story loads
        ManagedTimers.setTimeout(() => {
          showLongPressInstruction();
        }, 1000, 'CleanStoryDisplay');
      }, storyRemaining);
    } else {
      setIsLoading(false);
      // Debounced stability to prevent flickering
        setIsStoryStable(true);
        DebugLogger.log('story', 'PHASE 6: Story is now stable and locked - timer can start, images can generate');
        
        // Show touch device instruction after story loads
        ManagedTimers.setTimeout(() => {
          showLongPressInstruction();
        }, 1000, 'CleanStoryDisplay');
    }
  }
};

  const generateNextPage = async (): Promise<LivePageResult | undefined> => {
    if (!isPremium || isLoadingNextPage) return;
    
    // FIXED: Proper context validation with detailed logging
    if (!liveContext) {
      DebugLogger.error('story', '❌ CRITICAL: generateNextPage called without liveContext', {
        currentStoryLength: story.length,
        currentPage: currentPage,
        isStoryComplete: isStoryComplete,
        storyTitle: storyTitle
      });
      return;
    }
    
    DebugLogger.log('story', '🔄 Premium Live Generation: generateNextPage called', {
      hasLiveContext: !!liveContext,
      currentContextPage: liveContext?.currentPage,
      storyContextLength: liveContext?.storyContext?.length,
      sessionId: stableSessionId
    });
    
    setIsLoadingNextPage(true);
    try {
      // Ensure session ID consistency for continuation
      const sessionId = stableSessionId || generateSessionIdWithPrefix(`live-${safeUserInfo.name}`);
      const result = await LiveGenerationService.generateNextPage(liveContext, vocabularyData, false, sessionId);
      
      DebugLogger.log('story', '✅ Premium Live Generation: generateNextPage result', {
        hasResult: !!result,
        hasError: !!result?.error,
        hasNextContext: !!result?.nextContext,
        nextContextPage: result?.nextContext?.currentPage,
        nextContextStoryLength: result?.nextContext?.storyContext?.length,
        isComplete: result?.isComplete
      });
      
      if (result?.error) {
        DebugLogger.error('story', '❌ Premium Live Generation: Error in generateNextPage', result.error);
        setError(result.error);
        return;
      }
      return result;
    } catch (error) {
      DebugLogger.error('story', '💥 Premium Live Generation: Exception in generateNextPage', error);
      setError('Failed to continue the story. Please try again.');
      return;
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  // CRITICAL FIX (Oct 6, 2025): Premium live generation wrapper
  // This function calls generateNextPage() and properly advances the story state
  // Restores "never-ending" premium story experience
  const handleGenerateNextPageAndAdvance = useCallback(async () => {
    DebugLogger.log('story', '🚀 Premium: handleGenerateNextPageAndAdvance invoked', {
      currentPage,
      storyLength: story.length,
      hasLiveContext: !!liveContext,
      isLoadingNextPage
    });

    if (!isPremium) {
      DebugLogger.warn('story', '⚠️ handleGenerateNextPageAndAdvance called for non-premium user');
      return;
    }

    if (isLoadingNextPage) {
      DebugLogger.log('story', '⏳ Already loading next page, skipping duplicate call');
      return;
    }

    try {
      // Call the existing generateNextPage function
      const result = await generateNextPage();
      
      if (!result) {
        DebugLogger.warn('story', '⚠️ generateNextPage returned undefined result');
        return;
      }

      if (result.error) {
        DebugLogger.error('story', '❌ generateNextPage returned error', result.error);
        return;
      }

      // Extract page text from result
      const pageText = Array.isArray(result.content) ? result.content[0] : result.content;
      
      if (!pageText) {
        DebugLogger.error('story', '❌ No page text in result', result);
        return;
      }

      DebugLogger.log('story', '✅ Premium: Appending new page to story', {
        newPageLength: pageText.length,
        previousStoryLength: story.length,
        newStoryLength: story.length + 1
      });

      // Append new page to story array
      setStory(prev => [...prev, pageText]);

      // Update live context for next generation
      if (result.nextContext) {
        setLiveContext(result.nextContext);
        DebugLogger.log('story', '✅ Premium: Updated liveContext', {
          nextContextPage: result.nextContext.currentPage,
          nextContextStoryLength: result.nextContext.storyContext?.length
        });
      }

      // Advance to the new page
      setCurrentPage(prev => prev + 1);
      
      DebugLogger.log('story', '✅ Premium: Advanced to new page', {
        newCurrentPage: currentPage + 1
      });

      // Mark story complete if indicated
      if (result.isComplete) {
        setIsStoryComplete(true);
        DebugLogger.log('story', '🎉 Premium: Story marked complete');
      }

      // Generate image for the new page if images are enabled
      try {
        const imagesEnabledCheck = localStorage.getItem('storyImagesEnabled') !== '0';
        if (imagesEnabledCheck) {
          DebugLogger.log('image', '📸 Premium: Triggering image generation for new page');
          ManagedTimers.setTimeout(() => {
            generateImageForCurrentPage();
          }, 100, 'CleanStoryDisplay');
        } else {
          DebugLogger.log('image', '⏭️ Premium: Images disabled, skipping generation');
        }
      } catch (imgError) {
        DebugLogger.warn('image', 'Failed to trigger image generation', imgError);
      }

    } catch (error) {
      DebugLogger.error('story', '💥 Premium: Exception in handleGenerateNextPageAndAdvance', error);
      setError('Failed to generate next page. Please try again.');
    }
  }, [isPremium, isLoadingNextPage, currentPage, story.length, liveContext, generateNextPage, setStory, setLiveContext, setCurrentPage, setIsStoryComplete, setError]);

  const generateImageForCurrentPage = async () => {
    // CRITICAL: Page-specific lock to prevent race conditions
    if (generatingPages.has(currentPage)) {
      DebugLogger.log('image', '🔒 BLOCKED: Page already generating', { currentPage });
      return;
    }
    
    setGeneratingPages(prev => {
      const next = new Set(prev);
      next.add(currentPage);
      return next;
    });
    DebugLogger.log('image', '🔓 LOCK ACQUIRED', { currentPage });
    
    // 🔍 COMPREHENSIVE DEBUG: Track function entry
    DebugLogger.log('image', 'generateImageForCurrentPage() called', {
      currentPage,
      isGeneratingImage,
      hasExistingImage: !!pageImages[currentPage],
      isStoryStable,
      storyLength: story.length,
      timestamp: new Date().toISOString()
    });

    if (isGeneratingImage || pageImages[currentPage]) {
      DebugLogger.log('image', 'Early return - already generating or image exists', {
        isGeneratingImage,
        hasExistingImage: !!pageImages[currentPage]
      });
      setGeneratingPages(prev => {
        const next = new Set(prev);
        next.delete(currentPage);
        return next;
      });
      return;
    }
    
    // CRITICAL: Only generate images AFTER story is stable
    if (!isStoryStable) {
      DebugLogger.log('image', 'Early return - story not yet stable', {
        isStoryStable,
        storyLength: story.length,
        currentPage
      });
      return;
    }
    
    const pageText = displayedStory[safeCurrentPage];
    if (!pageText) {
      DebugLogger.log('image', 'Early return - no page text available', {
        currentPage,
        pageText,
        storyLength: story.length,
        story: story.slice(0, 3) // Show first 3 pages for debugging
      });
      return;
    }
    
    DebugLogger.log('image', 'Passed all early return checks, proceeding with image generation', {
      currentPage,
      pageTextLength: pageText.length,
      pageTextPreview: pageText.substring(0, 100) + '...'
    });
    
    // 🔍 ENHANCED DEBUGGING: Track image generation parameters
    DebugLogger.log('image', 'Starting generation via generateImageForCurrentPage', {
      currentPage,
      pageText: pageText.substring(0, 100) + '...',
      fullPageText: pageText,
      userInfo: {
        name: safeUserInfo.name,
        avatar: safeUserInfo.avatar,
        difficultyLevel: safeUserInfo.difficultyLevel
      },
      sessionId: characterSessionIdValue,
      timestamp: new Date().toISOString()
    });
    
    DebugLogger.log('image', 'About to import EnhancedImageCache and check cache');
    
    const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
    
    DebugLogger.log('image', 'EnhancedImageCache imported successfully');
    
    // Validate userInfo structure before extracting markers
    if (!safeUserInfo || !safeUserInfo.avatar) {
      DebugLogger.warn('image', 'Missing userInfo or avatar data for story markers', {
        hasUserInfo: !!userInfo,
        hasAvatar: !!userInfo?.avatar,
        userInfo: userInfo
      });
    }
    
    let storyMarkers, cachedImageUrl;
    try {
      DebugLogger.log('image', 'About to extract story markers and check cache');
      
      storyMarkers = EnhancedImageCache.extractStoryMarkers(pageText, userInfo);
      DebugLogger.log('image', 'Story markers extracted', storyMarkers);
      
      cachedImageUrl = EnhancedImageCache.getCachedImage(
        pageText.slice(0, 120),
        stableSessionId, // ✅ CRITICAL FIX: Use stableSessionId for current page cache consistency
        currentPage,
        storyId,
        storyMarkers
      );
      DebugLogger.log('image', 'Cache lookup result', { cachedImageUrl });
      
    } catch (error) {
      DebugLogger.error('image', 'Image cache lookup failed with detailed error', {
        error: error.message,
        stack: error.stack,
        pageText: pageText.substring(0, 100),
        userInfo,
        characterSessionIdValue,
        currentPage,
        storyId
      });
      return;
    }
    
    if (cachedImageUrl) {
      DebugLogger.log('image', 'Using cached image for page', { currentPage, cachedImageUrl });
      setPageImages(prev => ({ ...prev, [currentPage]: cachedImageUrl }));
      return;
    }
    
    DebugLogger.log('image', 'No cached image found, proceeding with generation');
    DebugLogger.log('image', 'Setting generation states and calling SimpleImageService');
    
    setIsGeneratingImage(true);
    setIsPreparingImage(true);
    
    try {
      // CRITICAL: Use stableSessionId for both generation AND loading to ensure cache consistency
      DebugLogger.log('image', 'Netflix image generation breadcrumb', {
        sessionIdUsed: stableSessionId,
        page: currentPage + 1,
        pageTextPreview: pageText.substring(0, 120),
        isPremium,
        currentDifficulty
      });
      
      if (!imagesEnabled) {
        DebugLogger.log('image', `Page ${currentPage}: Images disabled - using static placeholder`);
        setPageImages(prev => ({
          ...prev,
          [currentPage]: IMAGES_DISABLED_PLACEHOLDER
        }));
        setIsGeneratingImage(false);
        return;
      }
      
      DebugLogger.log('image', 'Calling backend orchestrator for image generation', {
        pageText: pageText.substring(0, 100),
        userInfo: { ...userInfo, difficultyLevel: currentDifficulty },
        currentDifficulty,
        storyId,
        pageNumber: currentPage + 1,
        sessionId: stableSessionId, // Fixed: Use stableSessionId (was characterSessionIdValue)
        isPremium
      });
      
      const result = await SimpleImageService.generateStoryImage(
        pageText, // Use pageText instead of storyText for consistency 
        { ...userInfo, difficultyLevel: currentDifficulty, userTier: isPremium ? 'premium' : 'guest' }, 
        stableSessionId, // CRITICAL FIX: Use stableSessionId (was characterSessionIdValue) to match useSessionAwareImageLoader
        currentPage + 1,
        isPremium
      );
      
      // 🔍 ENHANCED RESULT TRACKING: Log which method succeeded
      DebugLogger.log('image', 'SimpleImageService result received', {
        currentPage,
        pageText: pageText.substring(0, 50) + '...',
        result: {
          success: result.success,
          url: result.url,
          error: result.error
        },
        timestamp: new Date().toISOString()
      });
      
      // Analyze content match
      if (result.success && result.url) {
        DebugLogger.log('image', 'Content Analysis', {
          pageContent: pageText,
          imageUrl: result.url,
          contentMatches: {
            hasMultipleCharacters: pageText.toLowerCase().includes('friends') || pageText.toLowerCase().includes('together'),
            mentionsPark: pageText.toLowerCase().includes('park') || pageText.toLowerCase().includes('playground'),
            isPlayingScene: pageText.toLowerCase().includes('play') || pageText.toLowerCase().includes('playing'),
            expectedScene: 'Multiple children playing in park',
            actualImage: result.url.includes('anime') ? 'Anime portrait' : 'Unknown style'
          }
        });
      }
      
      if (result.success && result.url) {
        // Ensure story is stable before updating images
        if (!isStoryStable) {
          DebugLogger.warn('image', 'Story not stable yet, delaying image update');
          ManagedTimers.setTimeout(() => generateImageForCurrentPage(), 1000, 'CleanStoryDisplay');
          return;
        }
        
        // Preload image with session context before updating state
        const imageLoaded = await loadImage(result.url, (stage) => {
          DebugLogger.log('image', `Generated image loading: ${stage}`, { currentPage, url: result.url });
        });
        
        if (!imageLoaded) {
          DebugLogger.warn('image', 'Generated image failed to load', { currentPage, url: result.url });
          return;
        }
        
        setPageImages(prev => {
          const updatedImages = {
            ...prev,
            [currentPage]: result.url
          };
          onPageImagesUpdate?.(updatedImages); // CRITICAL: Notify parent of new image
          return updatedImages;
        });
        
        // Store image metadata for debug panel
        if (result.metadata) {
          setPageImageMetadata(prev => ({
            ...prev,
            [currentPage]: result.metadata
          }));
        }
        
        // Cache with story continuity markers to prevent re-generation
        try {
          const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
          
          // Validate userInfo before extracting markers
          if (!safeUserInfo || !safeUserInfo.avatar) {
            DebugLogger.warn('image', 'Missing userInfo or avatar data for caching story markers');
          }
          
          const storyMarkers = EnhancedImageCache.extractStoryMarkers(pageText, userInfo);
          EnhancedImageCache.cacheImage(
            pageText.slice(0, 120),
            result.url,
            characterSessionIdValue,
            currentPage,
            undefined,
            storyId,
            storyMarkers
          );
          
          try {
            const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium') : 'guest';
            const images = story.map((s, idx) => ({ url: idx === currentPage ? result.url : pageImages[idx], prompt: (s || '').slice(0, 120) }));
            StorySessionCache.updatePages(cacheId, story, currentPage, images as any);
          } catch {}
        } catch (cacheError) {
          DebugLogger.warn('image', 'Failed to cache generated image', cacheError);
        }
      }
      
    } catch (error) {
      DebugLogger.log('image', 'Image generation failed, continuing without image', error);
    } finally {
      // CRITICAL: Always release lock even on error
      setGeneratingPages(prev => {
        const next = new Set(prev);
        next.delete(currentPage);
        return next;
      });
      DebugLogger.log('image', '🔓 LOCK RELEASED', { currentPage });
      
      setIsGeneratingImage(false);
      setIsPreparingImage(false);
    }
  };

  // Update ref for story:stabilized listener to avoid ReferenceError
  // Update ref for story:stabilized listener to avoid ReferenceError
  useEffect(() => {
    generateImageRef.current = generateImageForCurrentPage;
  }, [generateImageForCurrentPage]);

  // FLICKER FIX: Trigger image generation ONLY after React has completed story state update
  useEffect(() => {
    const handleStoryStabilized = () => {
      if (imagesEnabled && !pageImages[currentPage] && displayedStory[safeCurrentPage]) {
        DebugLogger.log('image', '🖼️ story:stabilized triggered - generating image with FINAL story');
        generateImageRef.current?.();
      }
    };

    window.addEventListener('story:stabilized', handleStoryStabilized);
    return () => window.removeEventListener('story:stabilized', handleStoryStabilized);
  }, [currentPage, imagesEnabled, pageImages, displayedStory, safeCurrentPage]);

  // Generate illustration for any page index (batch-safe, no UI spinner)
  const generateImageForIndex = async (index: number) => {
    if (pageImages[index]) return;
    
    // If images disabled, use static placeholder for all batch pages
    if (!imagesEnabled) {
      DebugLogger.log('image', `Batch generation: Images disabled - using static placeholders`);
      const placeholders: Record<number, string> = {};
      for (let i = 0; i < displayedStory.length; i++) {
        if (!pageImages[i]) {
          placeholders[i] = IMAGES_DISABLED_PLACEHOLDER;
        }
      }
      setPageImages(prev => ({ ...prev, ...placeholders }));
      return;
    }
    
    const storyText = displayedStory[index];
    if (!storyText) {
      DebugLogger.log('image', 'Skipping image generation for index - no story text for page', index);
      return;
    }
    
    try {
      const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
      
      // Validate userInfo structure
      if (!safeUserInfo || !safeUserInfo.avatar) {
        DebugLogger.warn('image', 'Missing userInfo or avatar data for index cache lookup');
      }
      
      const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
      const cachedImageUrl = EnhancedImageCache.getCachedImage(
        storyText.slice(0, 120),
        stableSessionId, // ✅ CRITICAL FIX: Use stableSessionId for cache consistency
        index,
        storyId,
        storyMarkers
      );
      
      if (cachedImageUrl) {
        DebugLogger.log('image', 'Using cached image for page', index);
        setPageImages(prev => ({ ...prev, [index]: cachedImageUrl }));
        return;
      }
    } catch (cacheError) {
      DebugLogger.warn('image', 'Failed to check image cache for index', cacheError);
    }
    
    try {
      const sessionId = stableSessionId; // ✅ CRITICAL FIX: Use stableSessionId for batch generation
      const result = await SimpleImageService.generateStoryImage(
        storyText,
        { ...userInfo, difficultyLevel: currentDifficulty, userTier: isPremium ? 'premium' : 'guest' },
        sessionId,
        index + 1,
        isPremium
      );
      if (result.success && result.url) {
        const nextMap = { ...pageImages, [index]: result.url } as Record<number, string>;
        setPageImages(nextMap);
        
        // Cache in both systems to prevent re-generation
        try {
          const { EnhancedImageCache } = await import('@/services/enhancedImageCache');
          
          // Validate userInfo before caching
          if (!safeUserInfo || !safeUserInfo.avatar) {
            DebugLogger.warn('image', 'Missing userInfo or avatar data for index caching');
          }
          
          const storyMarkers = EnhancedImageCache.extractStoryMarkers(storyText, userInfo);
          EnhancedImageCache.cacheImage(
            storyText.slice(0, 120),
            result.url,
            characterSessionIdValue,
            index,
            undefined,
            storyId,
            storyMarkers
          );
        } catch (cacheError) {
          DebugLogger.warn('image', 'Failed to cache image for index', cacheError);
        }
        
        try {
          const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium') : 'guest';
          const images = story.map((s, idx) => ({ url: nextMap[idx], prompt: (s || '').slice(0, 120) }));
          StorySessionCache.updatePages(cacheId, story, currentPage, images as any);
        } catch {}
      }
    } catch (e) {
      DebugLogger.warn('image', `Batch image generation failed for page ${index}`, e);
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

  // LIVE GENERATION COORDINATION - Use hook handlers instead of local ones
  // Remove duplicate handler definitions since they're provided by useStoryLogic hook

useEffect(() => {
  // Persist current page for both tiers
  if (story.length > 0) {
    (async () => {
      try {
        const cacheId = isPremium ? ((await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium') : 'guest';
        const avatarType = !isPremium && userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
        StorySessionCache.updateCurrentPage(cacheId, currentPage, avatarType);
      } catch {}
    })();
  }
}, [currentPage, isPremium, displayedStory.length, safeUserInfo.name]);

useEffect(() => {
  const onNavigate = (e: Event) => {
    try {
      const detail = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail;
      DebugLogger.log('ui', 'CleanStoryDisplay received navigation event', detail);
      
      if (detail?.direction === 'next') {
        DebugLogger.log('ui', 'Executing handleNext() - going to next page');
        handleNext();
      } else if (detail?.direction === 'prev') {
        DebugLogger.log('ui', 'Executing handlePrevious() - going to previous page');
        handlePrevious();
      }
    } catch (error) {
      DebugLogger.error('ui', 'Navigation event error', error);
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
        const id = isPremium ? ((await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium') : 'guest';
        StorySessionCache.updatePages(id, story, currentPage);
      } catch {}
    })();
  }
}, [displayedStory, currentPage, isPremium, safeUserInfo.name]);
  
  const handleWordInteraction = () => {
    setWordsInteracted(prev => prev + 1);
    updateActivity({ wordsRead: 1 });
  };

  // Remove duplicate timer handlers since they're provided by useStoryLogic hook
  // const handleToggleTimer and handleReduceTime are available from the hook

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
        DebugLogger.warn('audio', 'Dock stop failed', error);
      }
    } else {
      try {
        // Set playing state BEFORE starting audio for immediate Stop button visibility
        setIsAudioLoading(false);
        setIsAudioPlaying(true);
        
        await audioEngineRef.current.charlotteReadStory(currentStoryText || "", onWordHighlight);
        
        if (!isPremium) setAudioPlayedPage(currentPage);
      } catch (error) {
        DebugLogger.warn('audio', 'Dock play failed', error);
        // Revert state on error
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
      }
    }
  };

const handleDockVoiceCommand = () => {
  // Voice functionality is now handled directly in MobileActionDock
  DebugLogger.log('ui', 'Voice command handled by MobileActionDock integration');
};

// Voice command handler for headless controller
const handleVoiceCommand = (command: string) => {
  DebugLogger.log('audio', 'Voice command received', command);
  
  const cmd = command.toLowerCase().trim();
  
  if (cmd.includes('start reading') || cmd.includes('read') || cmd.includes('play')) {
    handleDockPlayAudio();
  } else if (cmd.includes('pause') || cmd.includes('stop')) {
    try { audioEngineRef.current.stop(); } catch (e) { DebugLogger.warn('audio', 'Voice pause failed', e); }
  } else if (cmd.includes('next page') || cmd.includes('next')) {
    handleNext();
  } else if (cmd.includes('previous page') || cmd.includes('previous') || cmd.includes('back')) {
    handlePrevious();
  } else if (cmd.includes('increase font') || cmd.includes('bigger text')) {
    // Font size adjustment logic would go here
    DebugLogger.log('ui', 'Font size increase requested');
  } else if (cmd.includes('decrease font') || cmd.includes('smaller text')) {
    // Font size adjustment logic would go here
    DebugLogger.log('ui', 'Font size decrease requested');
  } else if (cmd.includes('open settings') || cmd.includes('settings')) {
    // Settings logic would go here
    DebugLogger.log('ui', 'Settings requested');
  }
};

const handleDockCoach = () => {
  setShowCoach(true);
};

  // Manual end session logic exists below
  const handleEndSession = async () => {
    const timeSpent = (20 * 60 - timeRemaining) * 1000; // Convert to milliseconds
    const totalWordsRead = sessionWordsRead;
    const wpm = Math.round((totalWordsRead / timeSpent) * 60000);
    const pagesRead = pagesCompleted.size;
    
    // Clear character state when session ends for both free and premium users
    try {
      StoryVisualStateManager.clearBasedOnContext(characterSessionIdValue, isPremium, 'end-session');
      DebugLogger.log('performance', 'Cleared character state on session end');
    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear character state on session end', error);
    }
    
    const sessionStats = {
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: pagesRead,
      startTime: sessionStartTimeValue,
      accuracy: 100
    };
    
    recordReadingSession({
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: pagesRead,
      // ROLLBACK FIX: For premium, use story.length to avoid artificial limitations  
      storyCompleted: isPremium ? (currentPage === story.length - 1) : (currentPage === displayedStory.length - 1),
      readingSpeed: wpm
    });
    
    // Handle expert grade progression for premium users
    if (isPremium && (currentDifficulty === 'expert' || currentDifficulty === 'advanced')) {
      try {
        const progressionResult = ExpertDifficultyManager.updateProgress(
          userInfo,
          expertGradeLevel,
          {
            readingSpeed: wpm,
            pagesCompleted: pagesRead,
            completed: true
          }
        );
        
        if (progressionResult?.progressed) {
          // Show advancement celebration toast
          toast({
            title: "🎉 Congratulations!",
            description: `Advanced to ${progressionResult.newLevel} Grade Level!`,
            variant: "default",
            duration: 5000,
          });
          
          // Update the UI state to reflect progression
          setExpertGradeLevel(progressionResult.newLevel);
        } else if (wpm < 80) {
          // Optional feedback for users who didn't advance
          toast({
            title: "Keep Practicing",
            description: `Continue reading at ${expertGradeLevel} Grade Level`,
            duration: 3000,
          });
        }
      } catch (error) {
        DebugLogger.warn('performance', 'Failed to update expert progression', error);
      }
    }
    
    try { sessionStorage.removeItem('readingTimerPausedSeconds'); } catch {}
    // Persist essentials for SessionEnded fallback across reloads
    try { sessionStorage.setItem('last_user_info', JSON.stringify(userInfo)); } catch {}
    try { sessionStorage.setItem('last_story_text', (story || []).join(' ')); } catch {} // Keep full story for upgrades
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
    setHasChosenUntimed(true); // Permanently disable timer for this session
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
        id: generateSessionIdWithPrefix('story'),
        title: storyTitle || `${safeUserInfo.name}'s Adventure`,
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
      DebugLogger.error('story', 'Save story failed', e);
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
        DebugLogger.warn('story', 'Failed to load teacher words', error);
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
      return cleaned.length ? (cleaned || []).join(', ') : null;
    } catch (e) {
      DebugLogger.warn('story', 'Teacher words fetch error', e);
      return null;
    }
  };

  // Magic wand functionality - Generate new story
  const handleGenerateNewStory = async (specialRequestOverride?: string, isRewrite: boolean = false) => {
    const callId = Math.random().toString(36).substr(2, 9);
    DebugLogger.log('story', `[STORY DEBUG ${callId}] handleGenerateNewStory ENTRY`, { 
      specialRequestOverride, 
      isRewrite, 
      isGeneratingNewStory, 
      isGeneratingRewrite,
      timestamp: new Date().toISOString()
    });
    
    // Reset toast flags for new story generation
    fallbackToastShownRef.current = false;
    if (currentToastRef.current) {
      currentToastRef.current.dismiss();
      currentToastRef.current = null;
    }
    DebugLogger.log('ui', 'Toast flags reset for story generation');
    
    // Reset untimed reading flag for new story session
    setHasChosenUntimed(false);
    
    if (isGeneratingNewStory || isGeneratingRewrite) {
      DebugLogger.log('story', `[STORY DEBUG ${callId}] BLOCKED - Already generating`, { isGeneratingNewStory, isGeneratingRewrite });
      return;
    }
    
    DebugLogger.log('story', 'User explicitly requested new story - unlocking content', {
      isRewrite,
      specialRequest: !!specialRequestOverride,
    });

    // Clear ending tracking for new stories and rewrites
    clearEndingTracking();

    // Get userId for cache clearing
    const currentUserId = isPremium ? 
      ((await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium') : 
      'guest';

    // Clear caches based on context
    const avatarType = userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'neutral' : userInfo?.avatar?.type;
    DebugLogger.log('story', `[STORY DEBUG ${callId}] handleGenerateNewStory cache clearing`, { 
      isRewrite, 
      currentUserId, 
      avatarType,
      userInfoAvatar: userInfo?.avatar 
    });
    
    if (isRewrite) {
      DebugLogger.log('story', `[STORY DEBUG ${callId}] Calling SessionCacheManager.clearOnRewrite`);
      SessionCacheManager.clearOnRewrite(currentUserId, avatarType);
    } else {
      DebugLogger.log('story', `[STORY DEBUG ${callId}] Calling SessionCacheManager.clearOnNextStorySync (synchronous)`);
      // ERROR-017 FIX: Use synchronous cache clearing to prevent race conditions
      SessionCacheManager.clearOnNextStorySync(currentUserId, avatarType);
    }
    
    if (isRewrite) {
      // Rewriting current story - preserve character continuity
      SessionCacheManager.clearOnRewrite(currentUserId, avatarType);
    } else {
      // ERROR-017 FIX: Getting next story - use synchronous complete fresh start
      SessionCacheManager.clearOnNextStorySync(currentUserId, avatarType);
    }
    
    // FIXED: Keep story stable to allow continuous auto-image generation
    // Removed setTimeout that was blocking image generation on pages 2+
    
    if (isRewrite) {
      setIsGeneratingRewrite(true);
    } else {
      setIsGeneratingNewStory(true);
    }
    
    try {
      DebugLogger.log('story', 'Generating new story...');
      
      // Generate new story ID for cache isolation
      const newStoryId = generateSessionIdWithPrefix('story');
      setStoryId(newStoryId);
      
      // Generate new character session ID for new characters
      const newCharacterSessionId = generateSessionId();
      
      // Context-aware character state clearing based on user type and action
      if (isRewrite) {
        if (isPremium) {
          // Premium rewrite: Clear story content but preserve avatar identity
          DebugLogger.log('story', 'Premium rewrite: Preserving avatar type + skin tone');
          
          // Use comprehensive cache manager for premium rewrite
          const { SessionCacheManager } = await import('@/services/SessionCacheManager');
          const userId = (await supabase.auth.getUser()).data.user?.id || safeUserInfo.name || 'premium';
          
          SessionCacheManager.clearAllSessionCaches({
            userId,
            sessionId: characterSessionIdValue || generateSessionId(),
            avatarType: safeUserInfo.avatar?.type,
            skinTone: safeUserInfo.avatar?.skinTone,
            reason: 'premium-rewrite',
            preserveAvatarIdentity: true,
            clearVisualState: false // Keep avatar-related visual state
          });

          // Clear only story images, preserve character consistency seeds
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearStoryImagesKeepCharacterSeeds(
            characterSessionIdValue, 
            safeUserInfo.avatar?.type
          );
          setPageImages({});

        } else {
          // Free rewrite: Clear everything for fresh characters
          DebugLogger.log('story', 'Free rewrite: Clearing all character state');
          StoryVisualStateManager.clearBasedOnContext(characterSessionIdValue, isPremium, 'rewrite');
          
          // Clear all images for free users
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearSession(characterSessionIdValue);
          setPageImages({});
        }
      } else {
        // New story (not rewrite): Clear character state appropriately
        DebugLogger.log('story', 'New story: Clearing character state for fresh generation');
        StoryVisualStateManager.clearBasedOnContext(characterSessionIdValue, isPremium, 'next-story');
      }
      
      // Clear previous story cache for free users to prevent cache growth
      if (!isPremium) {
        try {
          (await import('@/services/enhancedImageCache')).EnhancedImageCache.clearSession(characterSessionIdValue);
          setPageImages({});
          DebugLogger.log('image', 'Cleared previous story cache for free user');
        } catch (error) {
          DebugLogger.warn('image', 'Failed to clear previous story cache', error);
        }
      }
      if (isPremium) {
        // Merge per-story request with persistent teacher word list (premium only)
        let combinedSpecial = (specialRequestOverride ?? safeUserInfo.specialRequest ?? '') as string;
        const teacherCsv = await fetchTeacherWordsCsv();
        if (teacherCsv) {
          combinedSpecial = `${combinedSpecial ? combinedSpecial + '\n' : ''}Teacher words: ${teacherCsv}`;
        }
        const effectiveUser = {
          ...userInfo,
          specialRequest: combinedSpecial,
          difficultyLevel: currentDifficulty,
          expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
        } as UserInfo;
        const sessionTypeParam = isRewrite ? 'rewrite' : 'new';
        DebugLogger.log('story', `Premium rewrite: Passing sessionType '${sessionTypeParam}' to LiveGenerationService`);
        const first = await LiveGenerationService.generateFirstPage(effectiveUser, sessionTypeParam, vocabularyData);
        if ((first as any).error) {
          throw new Error((first as any).error);
        }
        StoryContentLogger.logStoryChange('premium_rewrite_first', 'before', [first.content], {
          isRewrite: isRewrite,
          sessionType: sessionTypeParam,
          userInfo: effectiveUser.name,
          hasNextContext: !!first.nextContext
        });
        const firstPageContent = Array.isArray(first.content) ? first.content[0] : first.content;
        setStory([firstPageContent]);
        StoryContentLogger.logStoryChange('premium_rewrite_first', 'after', [firstPageContent], {
          expertGradeLevel: first.nextContext?.expertGradeLevel,
          isComplete: first.isComplete,
          title: `${safeUserInfo.name}'s Live Adventure`
        });
        setCurrentPage(0);
        setLiveContext(first.nextContext || null);
        if (first.nextContext?.expertGradeLevel) {
          setExpertGradeLevel(first.nextContext.expertGradeLevel);
        }
        setIsStoryComplete(first.isComplete);
        setStoryTitle(`${safeUserInfo.name}'s Live Adventure`);
      } else {
        const originalPageCount = story.length;
        // ✅ CRITICAL FIX: Debug userInfo for story refresh
        const refreshUserInfo = {
          ...userInfo,
          specialRequest: specialRequestOverride ?? safeUserInfo.specialRequest,
          difficultyLevel: currentDifficulty,
          expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined,
        } as UserInfo;
        
        DebugLogger.log('story', '[GENDER DEBUG] Story refresh userInfo', {
          name: refreshUserInfo.name,
          avatarType: refreshUserInfo.avatar?.type,
          avatarSkinTone: refreshUserInfo.avatar?.skinTone,
          fullAvatar: refreshUserInfo.avatar
        });
        
        const result = await NetflixStyleStoryService.generateCompleteStory(refreshUserInfo);
        const newStory = result.content;
        setStory(newStory);
        setCurrentPage(0);
      }
    } catch (error) {
      DebugLogger.error('story', 'Failed to generate new story', error);
      toast({ title: 'Magic Failed', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setIsGeneratingNewStory(false);
      setIsGeneratingRewrite(false);
      // DEBOUNCED: Restore story stability after generation
        setIsStoryStable(true);
        DebugLogger.log('story', `[STORY DEBUG ${callId}] Story stability restored after generation`);
    }
  };
  // Open special request dialog for premium users, or generate immediately for free
  const handleNewStoryClick = () => {
    DebugLogger.log('story', '[STORY DEBUG] handleNewStoryClick called', { isPremium });
    
    // Reset toast flags for new story session
    fallbackToastShownRef.current = false;
    if (currentToastRef.current) {
      currentToastRef.current.dismiss();
      currentToastRef.current = null;
    }
    DebugLogger.log('ui', 'Toast flags reset for new story session');
    
    if (isPremium) {
      setSpecialRequestDraft(userInfo?.specialRequest || "");
      setShowSpecialRequestDialog(true);
    } else {
      DebugLogger.log('story', '[STORY DEBUG] Free user - calling handleGenerateNewStory directly');
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
    DebugLogger.log('story', 'Premium user starting sequel - preserving character state');
    
    // Clear ending tracking to reset pagination UI
    clearEndingTracking();
    
    // Create new session ID for the sequel but keep character consistency
    const newCharacterSessionId = generateSessionId();
    
    // Create continuation session to preserve character appearances
    const success = StoryVisualStateManager.createContinuationSession(
      characterSessionIdValue, 
      newCharacterSessionId
    );
    
    if (success) {
      DebugLogger.log('story', 'Character state preserved for sequel continuation');
    } else {
      DebugLogger.warn('story', 'Failed to preserve character state for sequel');
    }
    
    // ROLLBACK FIX: Use full story for sequel context unless ending pages are explicitly present
    // This restores yesterday's behavior where the sequel just worked
    const sequelContextPages = originalStoryLength !== null && originalStoryLength < story.length 
      ? story.slice(0, originalStoryLength)  // Only if we explicitly have ending pages to exclude
      : story;  // Otherwise use full story (yesterday's working behavior)
      
    DebugLogger.log('story', 'Using sequel context for continuation', {
      totalStoryPages: story.length,
      originalStoryLength,
      contextPages: sequelContextPages.length,
      hasExplicitEnding: originalStoryLength !== null
    });
    
    const newContext: LiveGenerationContext = {
      userInfo: { ...userInfo, difficultyLevel: currentDifficulty },
      difficulty: currentDifficulty,
      expertGradeLevel: currentDifficulty === 'advanced' ? (liveContext?.expertGradeLevel || expertGradeLevel) : undefined,
      storyContext: sequelContextPages,  // Use the sequel context we calculated
      currentPage: sequelContextPages.length,
      totalExpectedPages: Math.max(sequelContextPages.length + 1, 6),
      characters: [safeUserInfo.name, safeUserInfo.favoriteAnimal || 'friend']
    };
    setLiveContext(newContext);
    setIsStoryComplete(false);
    setShowEndStoryModal(false);
  };

  // Generate a concluding page (Premium) without ending the session
  const handleGenerateEndingPage = async () => {
    if (!isPremium || !liveContext || isGeneratingEnding) return;
    setIsGeneratingEnding(true);
    
    // Add 40s watchdog for ending generation
    const watchdogTimeout = ManagedTimers.setTimeout(() => {
      DebugLogger.warn('performance', 'Ending generation watchdog triggered (40s)');
      setIsGeneratingEnding(false);
      toast({
        title: "Continuing with story progression",
        description: "Story ending may appear shortly...",
        variant: "default",
        duration: 5000
      });
    }, 40000);
    
    try {
      // Wrap with 35s Promise.race timeout for robust timeout handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        ManagedTimers.setTimeout(() => reject(new Error('Ending generation timeout (35s)')), 35000, 'CleanStoryDisplay');
      });
      
      const generationPromise = LiveGenerationService.generateEndingPage(liveContext);
      const result = await Promise.race([generationPromise, timeoutPromise]);
      
      clearTimeout(watchdogTimeout);
      
      if (result && !result.error) {
        StoryContentLogger.logStoryChange('premium_ending_page', 'before', [...story], {
          contentPreview: Array.isArray(result.content) ? result.content[0]?.substring(0, 100) : result.content?.substring(0, 100),
          currentStoryLength: story.length,
          hasLiveContext: !!liveContext
        });
        
        // Token validation for premium ending page
        const validationLevel = UnifiedValidator.mapDifficultyToLevel(currentDifficulty);
        // Backend now handles all validation - trust the response
        // Keep analytics logging but remove frontend re-validation
        DebugLogger.log('story', 'Premium ending generated', {
          contentLength: result.content?.length || 0,
          difficulty: currentDifficulty
        });
        
        // Handle multiple ending pages
        const endingPages = Array.isArray(result.content) ? result.content : [result.content];
        const endingPageCount = result.endingPageCount || endingPages.length;
        
        // Store original story length BEFORE adding ending pages
        setOriginalStoryLength(story.length);
        
        setStory(prev => [...prev, ...endingPages]);
        StoryContentLogger.logStoryChange('premium_ending_page', 'after', [...story, ...endingPages], {
          endingPageIndex: story.length,
          endingPageCount,
          isComplete: true,
          liveContextCleared: true,
          originalStoryLength: story.length
        });
        setIsStoryComplete(true);
        setLiveContext(null);

        // Track the range of ending pages
        const firstEndingPageIndex = story.length;
        const lastEndingPageIndex = story.length + endingPages.length - 1;
        setLastEndingPageIndex(lastEndingPageIndex);
        
        // Store ending page count for pagination display
        window.__endingPageCount__ = endingPageCount;
        window.__firstEndingPageIndex__ = firstEndingPageIndex;

        // Auto-advance to the newly generated concluding page
        setCurrentPage(prev => prev + 1);
        setJustAdvanced(true);
        performanceManager.setTimeout(() => setJustAdvanced(false), 600, 'ending page advanced cleanup');

        // Show expanded "Finish Story" CTA on the ending page only
        finishExpandedOnPageRef.current = lastEndingPageIndex;
        setFinishCTAExpanded(true);
        setHighlightSave(true);
      }
    } catch (e) {
      clearTimeout(watchdogTimeout);
      DebugLogger.error('story', 'Failed to generate ending page', e);
      
      // Fall back to template service on timeout or error
      try {
        const { data, error } = await supabase.functions.invoke('template-service', {
          body: {
            difficulty: DifficultyLevelMapper.toBackend(currentDifficulty),
            userInfo: { ...userInfo, difficultyLevel: currentDifficulty },
            pageCount: 1,
            templateIndex: 0,
            isEnding: true
          }
        });

        if (!error && data?.pages?.length) {
          const endingContent = data.pages[0];
          setOriginalStoryLength(story.length);
          setStory(prev => [...prev, endingContent]);
          setIsStoryComplete(true);
          setLiveContext(null);
          setCurrentPage(prev => prev + 1);
          setJustAdvanced(true);
          performanceManager.setTimeout(() => setJustAdvanced(false), 600, 'backup ending advanced cleanup');
          
          toast({
            title: "Story concluded",
            description: "Using backup ending due to service timeout",
            variant: "default",
            duration: 5000
          });
        } else {
          throw new Error('Template fallback failed');
        }
      } catch (fallbackError) {
        toast({ title: "Ending failed", description: "Please try again.", variant: "destructive" });
      }
    } finally {
      setIsGeneratingEnding(false);
    }
  };

  // Manual End Session (Premium): 5s celebration with music then stats
  const handleManualEndSession = async () => {
    setShowManualCelebration(true);
    // Use direct audio creation to avoid preload warnings
    try {
      const audio = new Audio('/audio/celebration.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {
      // Silently handle audio failures
    }
    
    // Performance optimization: Move heavy logic out of setTimeout
    ManagedTimers.setTimeout(() => {
      const startTime = performance.now();
      setShowManualCelebration(false);
      
      // Trigger end session asynchronously to avoid blocking timeout
      Promise.resolve().then(() => handleEndSession());
      
      const duration = performance.now() - startTime;
      if (duration > 16) {
        DebugLogger.warn('performance', `Slow celebration timeout: ${duration.toFixed(2)}ms`);
      }
    }, 5000);
  };
  const handleDifficultyChange = async (direction: 'up' | 'down') => {
    // Block difficulty changes on template content (AI service unavailable)
    if (storySource === 'fallback') {
      toast({ 
        title: "Sorry, difficulty adjustments aren't available right now", 
        description: "Our AI story service is temporarily unavailable. Please start a new story to access different difficulty template content.",
        duration: 5000 
      });
      return;
    }

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
        DifficultyManager.storeDifficulty(safeUserInfo.name || 'guest', newDifficulty, safeUserInfo);
        
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
          DebugLogger.warn('auth', 'Could not persist difficulty preference', e);
        }
        
        // Update live context for all users (universal live difficulty updates)
        if (liveContext) {
          setLiveContext(prev => prev ? {
            ...prev, 
            difficulty: newDifficulty,
            expertGradeLevel: newDifficulty === 'advanced' ? newGradeLevel : undefined
          } : null);
        }
        
        // Animate badge change
        ManagedTimers.setTimeout(() => setChangeDirection('badge'), 200, 'CleanStoryDisplay');
      } else if (currentDifficulty === 'expert') {
        // Update live context for expert grade level changes (universal updates)
        if (liveContext) {
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
          DebugLogger.warn('auth', 'Could not persist expert grade preference', e);
        }
        
        // Animate badge change for expert level progression
        ManagedTimers.setTimeout(() => setChangeDirection('badge'), 200, 'CleanStoryDisplay');
      }
    
    // Complete animation
    ManagedTimers.setTimeout(() => {
      setIsChangingDifficulty(false);
      setChangeDirection(undefined);
    }, 800, 'CleanStoryDisplay');
  };


  // Get difficulty-based text configuration optimized for each reading level
  // ANTI-FLICKER FIX: Respect imagesEnabled state to prevent flash during toggle/navigation
  const currentImage = imagesEnabled ? pageImages[currentPage] : IMAGES_DISABLED_PLACEHOLDER;
  const hasCurrentImage = !!currentImage;
  
  // 🔍 ENHANCED IMAGE DEBUGGING: Track what image is actually being displayed
  useEffect(() => {
    const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
    if (isDebug) {
      DebugLogger.log('image', 'Image display debug', {
        currentPage,
        currentStoryText: (currentStoryText || '').substring(0, 100) + '...',
        currentImage,
        hasCurrentImage,
        allPageImages: pageImages,
        imageSource: currentImage ? 'Found in pageImages' : 'No image available',
        storyStable: isStoryStable,
        timestamp: new Date().toISOString()
      });

      if (currentImage && currentStoryText) {
        const storyWords = currentStoryText.toLowerCase().split(' ');
        const hasMultipleCharacters = storyWords.some(word => 
          ['friends', 'together', 'plays with', 'group', 'everyone'].includes(word)
        );
        const mentionsPark = storyWords.some(word => 
          ['park', 'playground', 'outside', 'playing'].includes(word)
        );
        
        DebugLogger.log('image', 'Content match analysis', {
          storyText: currentStoryText,
          hasMultipleCharacters,
          mentionsPark,
          imageUrl: currentImage,
          possibleMismatch: (hasMultipleCharacters || mentionsPark) && currentImage.includes('anime') || currentImage.includes('portrait')
        });
      }
    }
  }, [currentPage, currentImage, currentStoryText, pageImages, isStoryStable]);
  
  const difficultyBasedTextConfig = getDifficultyBasedTextConfig(currentDifficulty, isMobile);
  const wordCount = (currentStoryText || "").trim().split(/\s+/).filter(word => word.length > 0).length;
  const difficultyBasedContainerConfig = getDifficultyBasedContainer(currentDifficulty);

  const progress = displayedStory.length > 0 ? ((currentPage + 1) / displayedStory.length) * 100 : 0;
  const isShortPage = countWords(currentStoryText || "") <= 8;
  const controlsBlocked = !isPremium && timeRemaining <= 0;

  // Desktop card height calculation for perfect mirroring
  const { heightStyle, containerClassName, dynamicHeight } = useDesktopCardHeight({
    textContent: currentStoryText,
    fontSize: difficultyBasedTextConfig.fontSize,
    lineHeight: difficultyBasedTextConfig.lineHeight,
    isDesktop: !isMobile && typeof window !== 'undefined' && window.innerWidth >= 1280 // xl breakpoint
  });

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
      if (idx < urls.length) ManagedTimers.setTimeout(pump, 60, 'CleanStoryDisplay'); // gentle pacing
    };

    const schedule = (cb: () => void) => {
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === 'function') ric(() => cb());
      else ManagedTimers.setTimeout(cb, 0, 'CleanStoryDisplay');
    };

    schedule(pump);
    return () => { cancelled = true; };
  }, [currentPage, pageImages, story.length]);

  // PHASE 1: Show proper loading state with progressive time-based messages
  if (isLoading || forceLoaderActive) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-white mb-6 mx-auto" />
          <p className="text-white text-xl font-medium mb-2">
            {(() => {
              const elapsed = Date.now() - loaderStartRef.current;
              if (elapsed < 10000) return "Creating your magical story...";
              if (elapsed < 20000) return "Our story wizards are working hard...";
              if (elapsed < 40000) return "Almost there! Perfecting every detail...";
              return "Putting the final touches...";
            })()}
          </p>
          <p className="text-white/70 text-sm">
            This may take a moment for the best experience
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-white mb-4">Story Magic Taking a Break</h2>
          
          {/* Show rhyming emergency content if available */}
          <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              Don't worry, {safeUserInfo.name}! Our story elves are working hard to fix things.
            </p>
            <p className="text-white/70 text-sm mb-4">
              Try clicking "Try Again" or come back in a few minutes for fresh stories!
            </p>
            <div className="text-xs text-white/60 mb-4">
              Error details: {error}
            </div>
          </div>
          
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
      userId={safeUserInfo.name} 
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
          onNewStory={isPremium && displayedStory.length > 0 ? handleRewriteWithDialog : handleNewStoryClick}
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
        <main className="w-full px-2 md:px-4 lg:px-6 xl:px-8 flex-1 min-h-0 pt-2 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+88px)] md:pb-8">
        <div className="w-full mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-white/70 mobile-text-fixed flex flex-col h-full min-h-0 overflow-hidden">
            <CardContent className="p-2 lg:p-8 h-full flex flex-col min-h-0">
              {/* Progress Bar + Centered Navigation */}
              <div className="mb-4 md:mb-6">
                <Progress value={progress} className="h-2" />
                <div className="mt-2">
                  <StoryNavigationControls
                    currentPage={currentPage}
                    totalPages={displayedStory.length}
                    isPremium={isPremium}
                    isLoadingNextPage={isLoadingNextPage}
                    isGeneratingNewStory={isGeneratingNewStory}
                    canGoNext={!controlsBlocked && (isPremium ? true : currentPage < 5) && !isForwardNavigationBlocked}
                    canGoPrevious={currentPage > 0 && !controlsBlocked}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onGenerateNext={handleGenerateNextPageAndAdvance}
                    onGenerateNewStory={() => handleGenerateNewStory()}
                    audioEngineRef={audioEngineRef}
                    isAudioPlaying={isAudioPlaying}
                    isAudioLoading={isAudioLoading}
                    audioDisabled={!isPremium && audioPlayedPage === currentPage && !isAudioPlaying}
                    currentStoryText={currentStoryText || ""}
                    userInfo={userInfo}
                    audioPlayedPage={audioPlayedPage ?? -1}
                    onAudioStateChange={handleAudioStateChangeDual}
                    onAudioPlayed={handleAudioPlayed}
                    onUpgrade={onUpgrade}
                  />
                </div>
              </div>

              {/* Premium Only Desktop Controls */}
              {isPremium && (
                <div
                  id="premium-audio-controls"
                  className={isMobileOrTablet ? "sr-only" : "mt-2 md:mt-4 flex justify-center gap-4"}
                  aria-hidden={isMobileOrTablet}
                >
                  <div className="flex items-center gap-4">
                    <StoryAudioControls
                      audioEngineRef={audioEngineRef}
                      isAudioPlaying={isAudioPlaying}
                      isAudioLoading={isAudioLoading}
                      audioDisabled={false}
                      currentStoryText={currentStoryText || ""}
                      userInfo={userInfo}
                      isPremium={isPremium}
                      currentPage={currentPage}
                      audioPlayedPage={audioPlayedPage ?? -1}
                      onAudioStateChange={handleAudioStateChangeDual}
                      onAudioPlayed={handleAudioPlayed}
                    />
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
                    <Button onClick={handleSaveStoryNow} size="lg" variant={highlightSave ? "secondary" : "outline"} disabled={isSaving} aria-label={t('nav.save','Save')} className={cn(highlightSave ? 'ring-2 ring-primary/40' : '')}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('nav.save','Save')}
                    </Button>
                  </div>
                  {!isMobileOrTablet && isAudioPlaying && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Playing Audio
                    </div>
                  )}
                </div>
              )}

              {/* Story Content - Enhanced Layout for Desktop Split-Screen */}
              <div className="bg-gradient-card rounded-2xl p-2 md:p-4 lg:p-6 mb-6 flex-1 min-h-0 flex flex-col shadow-xl mt-2" 
                   dir="ltr" lang="en" role="main" aria-label="Story content">
                {/* Mobile/Tablet: Top-half image, bottom-half text (full-bleed, no gray) */}
                <div className="xl:hidden flex-1 min-h-0 flex flex-col gap-3">
                  {/* Top Half: Image - Dynamic aspect ratio to prevent whitespace */}
                  {currentImage ? (
                    imagesEnabled ? (
                      <AspectRatio 
                        ratio={imageAspectRatios[currentPage] || 4/3} 
                        className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-muted/30"
                      >
                        {isPremium && (Object.keys(pageImages).length < story.length) && !isBatchGenerating && !isGeneratingImage && !isPreparingImage && !imageLoadingStates[currentPage] && (
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
                        <ImageWithFallback
                          src={currentImage}
          alt={`Story illustration for page ${currentPage + 1}: ${displayedStory[safeCurrentPage]?.substring(0, 100)}...`}
                          className="w-full h-full object-cover rounded-lg"
                          fallbackText={`📖 Page ${currentPage + 1}`}
                          onLoadingChange={handleImageLoadingChange}
                          onFallbackUsed={handleImageFallbackUsed}
                        />
                      </AspectRatio>
                    ) : (
                      <div className="relative w-full h-[120px] rounded-2xl overflow-hidden shadow-md bg-muted/20">
                        <img 
                          src={IMAGES_DISABLED_PLACEHOLDER} 
                          alt="Reading corner for serious readers"
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      </div>
                    )
                  ) : (
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-muted/30 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                      <ImageMixingLoading />
                    </div>
                  )}
                  {/* Image Status moved to main content area */}

                  {/* Bottom Half: Text - Fixed size to prevent layout shifts */}
                  <div className={cn(
                    "w-full rounded-2xl shadow-2xl bg-card overflow-hidden flex flex-col relative transition-all duration-300",
                    imagesEnabled ? "flex-[0.4]" : "flex-1 min-h-[400px]"
                  )}>
                     {isPremium && isLoadingNextPage && currentPage === story.length - 1 && !isStoryComplete && (
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
                        className={cn("story-content storybook-frame story-content--difficulty-aware w-full", justAdvanced && "animate-enter", difficultyBasedContainerConfig)}
                        data-difficulty={currentDifficulty}
                        style={{
                          fontSize: difficultyBasedTextConfig.fontSize,
                          lineHeight: difficultyBasedTextConfig.lineHeight,
                          letterSpacing: difficultyBasedTextConfig.letterSpacing
                        }}
                      >
                        {displayedStory.length > 0 && currentStoryText && currentStoryText.trim().length > 0 ? (
                          processTextWithConsistentFlow({
                            text: currentStoryText,
                            className: "interactive-word",
                            difficulty: currentDifficulty,
                            userInfo,
                            isPremium,
                             userId: safeUserInfo.name,
                            highlightedWordIndex: currentHighlightedWord,
                            isMobile: preferMobileModal
                          })
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Weaving more story magic...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Desktop: Perfectly mirrored split columns */}
                <div className={cn(
                  "hidden xl:flex flex-1 min-h-0 transition-all duration-300",
                  imagesEnabled ? "xl:grid xl:grid-cols-2 gap-0" : "flex-col gap-4 relative"
                )}>
                  {/* Image Section - LEFT SIDE - Equal size on desktop */}
                  {/* DESKTOP IMAGE FIX: Always show images on desktop (xl breakpoint already filters) */}
                  {(
                    <div className={cn(
                      "transition-all duration-300",
                      imagesEnabled ? "xl:order-1 h-full min-h-0" : "xl:order-2 w-full"
                    )}>
                      <div className={cn(
                        "rounded-2xl overflow-hidden bg-muted/30 transition-all duration-300",
                        imagesEnabled 
                          ? `${containerClassName} w-full shadow-2xl` 
                          : "w-[220px] h-[220px] shadow-md opacity-60 absolute top-4 right-4 z-10"
                      )} style={imagesEnabled ? heightStyle : undefined}>
                        {isPremium && (Object.keys(pageImages).length < story.length) && !isBatchGenerating && !isGeneratingImage && !isPreparingImage && !imageLoadingStates[currentPage] && (
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
            alt={`Story illustration for page ${currentPage + 1}: ${displayedStory[safeCurrentPage]?.substring(0, 100)}...`}
            fallbackText={`📖 Page ${currentPage + 1}`}
            onLoadingChange={handleImageLoadingChange}
            onFallbackUsed={handleImageFallbackUsed}
            smartObjectFit={true}
            containerHeight={dynamicHeight}
          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageMixingLoading />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Text Content - RIGHT SIDE - Equal size on desktop */}
                  <div className={cn(
                    "flex flex-col transition-all duration-300",
                    imagesEnabled ? "xl:order-2" : "xl:order-1 w-full max-w-5xl mx-auto"
                  )} style={imagesEnabled ? heightStyle : { minHeight: '500px' }}>
                    <div className={`${containerClassName} w-full min-h-0 rounded-2xl overflow-hidden shadow-2xl bg-card relative`}>
                      {isPremium && isLoadingNextPage && currentPage === story.length - 1 && !isStoryComplete && (
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
                          className={cn("story-content story-content--compact story-content--difficulty-aware w-full", (isPremium && isShortPage || currentDifficulty === 'easy') && "text-center", justAdvanced && "animate-enter", difficultyBasedContainerConfig)}
                          data-difficulty={currentDifficulty}
                          style={{
                            fontSize: difficultyBasedTextConfig.fontSize,
                            lineHeight: difficultyBasedTextConfig.lineHeight,
                            letterSpacing: difficultyBasedTextConfig.letterSpacing
                          }}
                        >
                          {displayedStory.length > 0 && currentStoryText && currentStoryText.trim().length > 0 ? (
                            processTextWithConsistentFlow({
                              text: currentStoryText,
                              className: "interactive-word",
                              difficulty: currentDifficulty,
                              userInfo,
                              isPremium,
                              userId: safeUserInfo.name,
                              highlightedWordIndex: currentHighlightedWord,
                              isMobile: preferMobileModal
                            })
                           ) : (
                             <div className="flex items-center justify-center h-32">
                               <div className="text-center">
                                 <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">Weaving more story magic...</p>
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
                            ManagedTimers.setTimeout(() => setFinishPressBurst(false), 600, 'CleanStoryDisplay');
                            ManagedTimers.setTimeout(() => setFinishSparkle(false), 1200, 'CleanStoryDisplay');
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

                {/* 
                  ✨ SINGLE SOURCE OF TRUTH: "Next Story" Button ✨
                  
                  This Magic Wand button is the ONLY place where "Next Story" 
                  functionality should be triggered for guest users.
                  
                  DO NOT add duplicate "Next Story" buttons to:
                  - StoryNavigationControls.tsx
                  - Any navigation bar components
                  - Any header/footer components
                  
                  See: docs/NEXT_STORY_BUTTON_REGRESSION_FIX.md
                  See: docs/UI_COMPONENT_RESPONSIBILITIES.md
                */}
                {/* Free User Magic Wand - visible only for free users on page 6 with time left */}
                {!isPremium && currentPage === 5 && story.length >= 6 && timeRemaining > 0 && (
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
                          DebugLogger.log('story', 'Magic wand clicked - button press');
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
                                  ManagedTimers.setTimeout(() => setFinishPressBurst(false), 600, 'CleanStoryDisplay');
                                  ManagedTimers.setTimeout(() => setFinishSparkle(false), 1200, 'CleanStoryDisplay');
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
                                  ManagedTimers.setTimeout(() => setFinishPressBurst(false), 600, 'CleanStoryDisplay');
                                  ManagedTimers.setTimeout(() => setFinishSparkle(false), 1200, 'CleanStoryDisplay');
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

      {/* Backend Tier Checker - Only in debug mode to prevent resource exhaustion */}
      {(() => {
        const isDebug = typeof window !== 'undefined' && 
          new URLSearchParams(window.location.search).get('debug') === '1';
        
        if (!isDebug) return null;
        
        return (
          <BackendTierChecker
            onTierFound={(tier, details) => {
              DebugLogger.log('network', 'Tier success detected', {
                tier,
                details,
                currentPage,
                currentStoryText: (currentStoryText || '').substring(0, 100)
              });
            }}
          />
        );
      })()}

      {/* Enhanced Image Debug Panel for debug mode */}
      <ImageDebugPanel
        currentPage={currentPage}
        currentStoryText={currentStoryText || ''}
        currentImage={currentImage}
        pageImages={pageImages}
        isGeneratingImage={isGeneratingImage}
        imageMetadata={pageImageMetadata[currentPage]}
        onRegenerateImage={() => {
          // Clear current image and regenerate
          setPageImages(prev => {
            const updated = { ...prev };
            delete updated[currentPage];
            return updated;
          });
          setPageImageMetadata(prev => {
            const updated = { ...prev };
            delete updated[currentPage];
            return updated;
          });
          generateImageForCurrentPage();
        }}
      />

      {/* Unified Timer Integration - All Users */}
      <StoryTimerIntegration
        isPremium={isPremium}
        timerEnabled={timerEnabled}
        timeRemaining={timeRemaining}
        isTimerRunning={isTimerRunning}
        onToggleTimer={handleToggleTimer}
        onReduceTime={handleReduceTime}
        onEndSession={handleEndSession}
        onExtendTime={isPremium ? handleExtendTime : undefined}
        onRestartTimer={isPremium ? handleRestartTimer : undefined}
        onKeepReadingUntimed={isPremium ? handleKeepReadingUntimed : undefined}
        onSaveStoryNow={isPremium ? handleSaveStoryNow : undefined}
        onDismiss={() => { try { localStorage.setItem('readingTimerEnabled','0'); } catch {} setTimerEnabled(false); setIsTimerRunning(false); setIsTimerCanceled(true); setIsTimerVisible(false); window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: false })); }}
      />



      {/* Debug Display - Shows device detection and AI outputs */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1' && (
        <div className="fixed top-2 right-2 z-50 bg-black/80 text-white text-xs p-3 rounded font-mono max-w-sm">
          <div className="border-b border-gray-600 pb-2 mb-2">
            <div className="text-yellow-400 font-bold">🔧 DEBUG INFO</div>
          </div>
          
          <div className="space-y-1 mb-3">
            <div>W:{typeof window !== 'undefined' ? window.innerWidth : '?'}px | 
            M:{isMobile ? 'Y' : 'N'} | 
            T:{isTablet ? 'Y' : 'N'} | 
            MT:{isMobileOrTablet ? 'Y' : 'N'} |
            Dock:{isMobileOrTablet ? 'SHOW' : 'HIDE'}</div>
          </div>
          
          {/* AI Outputs Section */}
          <div className="border-t border-gray-600 pt-2">
            <div className="text-blue-400 font-bold mb-1">🎨 AI OUTPUTS</div>
            <div className="text-xs space-y-1">
              <div>Scene: {(window as any).__lastAiScene || 'Not available'}</div>
              <div>Setting: {(window as any).__lastAiSetting || 'Not available'}</div>
              <div>Action: {(window as any).__lastAiAction || 'Not available'}</div>
              <div>Mood: {(window as any).__lastAiMood || 'Not available'}</div>
              <div>Pose: {(window as any).__lastAiPose || 'Not available'}</div>
            </div>
            
            <div className="mt-2 text-green-400">
              <div>Tier 2.5 Test: {(window as any).__tier25Success || 'Not tested'}</div>
            </div>
          </div>
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

      <Dialog open={showCoach} onOpenChange={(open) => {
        setShowCoach(open);
        // Stop Charlotte's voice when dialog closes
        if (!open) {
          charlotteVoiceService.stop();
        }
      }}>
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
        mode="refresh"
      />
      <ModernProgressTowers
        userId={userInfo?.name}
        userType={isPremium ? 'premium' : 'free'}
        currentWordsRead={sessionWordsRead}
        currentPagesRead={pagesCompleted.size}
        vocabularyLearned={userStats.vocabularyWordsLearned || 0}
        timeSpent={Date.now() - sessionStartTimeValue}
        onProgressUpdate={(type, value) => {
          DebugLogger.log('ui', 'Progress updated', { type, value });
        }}
        className="fixed"
      />
      
      {/* Audio Fallback Notification */}
      <AudioFallbackNotification />
      
      {/* Voice Command System */}
      <VoiceCommandController headless={true} onCommand={handleVoiceCommand} />
      <VoiceHoverController isPremium={isPremium} />
      <PremiumHoverController isPremium={isPremium} />
      
      {/* Story Status Indicator - persistent backup/emergency mode indicator */}
      <StoryStatusIndicator />
    </div>
    </ErrorBoundary>
    </GameContextProvider>
  );
};

export default CleanStoryDisplay;