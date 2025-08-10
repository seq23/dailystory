import { useState, useEffect, useRef } from "react";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Loader2, Volume2, VolumeX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings, Plus, RefreshCw, Clock, Wand, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { SparkleAnimation } from "@/components/SparkleAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mobile-Optimized UI Components
import { CollapsibleFloatingTimer } from "@/components/CollapsibleFloatingTimer";
import { TimerTogglePill } from "@/components/TimerTogglePill";
import { MobileActionDock } from "@/components/MobileActionDock";

import { ResponsiveStoryHeader } from "@/components/ResponsiveStoryHeader";
import { ModernProgressTowers } from "@/components/ModernProgressTowers";
import { GameContextProvider } from "@/components/GameContextProvider";

// Audio and Interactive Components
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";

import { VocabularyCollector } from "@/components/VocabularyCollector";
import { processTextWithConsistentFlow } from "@/utils/unifiedTextProcessor";
import "@/styles/storyDisplay.css";
// import { processTextForDesktop } from "@/utils/desktopTextProcessor";
import { useWordHighlighting } from "@/hooks/useWordHighlighting";
import { useGamification } from "@/hooks/useGamification";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMobileTextConfig, getMobileStoryContainer } from "@/utils/mobileTextOptimizations";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";
import { cn } from "@/lib/utils";
import { useReaderLayout } from "@/hooks/useReaderLayout";

import type { UserInfo, SessionStats, Story as StoryType } from "@/types";
import { NetflixStyleStoryService, type NetflixStoryResult } from "@/services/NetflixStyleStoryService";
import { LiveGenerationService, type LiveGenerationContext, type LivePageResult } from "@/services/LiveGenerationService";
import { DifficultyManager } from "@/services/difficultyManager";
import { DiagnosticTool } from "@/utils/diagnostics";

import { SimpleImageService } from "@/services/SimpleImageService";
import { PremiumStoryManager } from "@/services/premiumStoryManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorHandler, ErrorType } from "@/utils/errorHandling";
import { DiagnosticPanel } from "@/components/DiagnosticPanel";
import { ApiKeyDiagnostic } from "@/components/ApiKeyDiagnostic";
import { ParentGuardrailsService } from "@/services/parentGuardrailsService";
import { supabase } from "@/integrations/supabase/client";
import { SpecialRequestDialog } from "@/components/SpecialRequestDialog";

interface CleanStoryDisplayProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
  onHome: () => void;
  onUpgrade: () => void;
  onNewStory?: () => void;
}

const CleanStoryDisplay: React.FC<CleanStoryDisplayProps> = ({
  userInfo,
  isPremium,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isMobile, isTablet, isMobileOrTablet, hasTouchCapability } = useIsMobile();
  const runtimeTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  const forceDesktopModal = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('desktopModal') === '1';
  const preferMobileModal = forceDesktopModal || isMobile || (isTablet && (hasTouchCapability || runtimeTouch));
  const { layout, fallbackToClassic } = useReaderLayout();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📥 CleanStoryDisplay isLoading changed:', isLoading);
  }, [isLoading]);
  
  // Mark body during reading session to control global UI (e.g., hide feedback on mobile)
  useEffect(() => {
    document.body.classList.add('reading-session');
    return () => {
      document.body.classList.remove('reading-session');
    };
  }, []);
  
  // Premium live generation state
  const [liveContext, setLiveContext] = useState<LiveGenerationContext | null>(null);
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  
  // Image state
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Audio and Interactive Features state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVocabularyCollector, setShowVocabularyCollector] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [wordsInteracted, setWordsInteracted] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const [pagesCompleted, setPagesCompleted] = useState<Set<number>>(new Set());
  const [audioPlayedPage, setAudioPlayedPage] = useState<number | null>(null);
  const elevenAudioRef = useRef<any>(null);

  // Keep local audio state in sync with ElevenLabsAudio
  useEffect(() => {
    const interval = setInterval(() => {
      const playing = !!elevenAudioRef.current?.isPlaying;
      setIsAudioPlaying(prev => (prev !== playing ? playing : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Debug source badge state
  const [storySource, setStorySource] = useState<'ai' | 'fallback' | 'unknown' | null>(null);
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // Timer state
  const initialTimerSeconds = (() => { try { const v = Number(localStorage.getItem('readingTimerDefaultSeconds')); return v > 0 ? v : 20 * 60; } catch { return 20 * 60; } })();
  const [timeRemaining, setTimeRemaining] = useState(initialTimerSeconds); // default 20 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true); // Start timer immediately
  const [isTimerCanceled, setIsTimerCanceled] = useState(false); // Premium: timer can be canceled
  const [isTimerVisible, setIsTimerVisible] = useState(true); // Premium: timer can be dismissed and shown again
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('readingTimerEnabled') !== '0'; } catch { return true; }
  });
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
const [isMagicWandAnimating, setIsMagicWandAnimating] = useState(false);
const [wandPulse, setWandPulse] = useState(false);
const [isGeneratingEnding, setIsGeneratingEnding] = useState(false);
const [showManualCelebration, setShowManualCelebration] = useState(false);
const [showEndStoryModal, setShowEndStoryModal] = useState(false);
const [showConfirmEndStory, setShowConfirmEndStory] = useState(false);
const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
// Premium: edit special requests before starting a new story
const [showSpecialRequestDialog, setShowSpecialRequestDialog] = useState(false);
const [specialRequestDraft, setSpecialRequestDraft] = useState(userInfo?.specialRequest || "");
const loaderStartRef = useRef<number>(0);
const LOADER_MIN_MS = 1600;

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
  const currentStory = story[currentPage] || "";
  
  // Audio highlighting integration
  const { onWordHighlight, currentHighlightedWord, clearHighlighting } = useWordHighlighting(
    currentStory, 
    isAudioPlaying
  );
  
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

  // Initialize story based on tier
  useEffect(() => {
    initializeStory();
  }, [userInfo, isPremium]);

  // Generate image for current page (skip on classic fallback)
  useEffect(() => {
    if (layout !== "classic" && story.length > 0 && currentPage < story.length && !pageImages[currentPage]) {
      generateImageForCurrentPage();
    }
  }, [currentPage, story, pageImages, layout]);

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

// Magic wand DRAMATIC animation effect for free users on last page - CONTINUOUS until clicked
useEffect(() => {
  if (!isPremium && currentPage === story.length - 1 && story.length > 0) {
    setIsMagicWandAnimating(true);
    // NO TIMEOUT - Keep animating until user clicks!
  } else {
    setIsMagicWandAnimating(false);
  }
}, [currentPage, story.length, isPremium]);

// Subtle pulse for wand every 3 pages
useEffect(() => {
  if (currentPage > 0 && (currentPage + 1) % 3 === 0) {
    setWandPulse(true);
    const t = setTimeout(() => setWandPulse(false), 1200);
    return () => clearTimeout(t);
  }
}, [currentPage]);

// Periodic sparkle for Finish Story button (all users)
const [finishSparkle, setFinishSparkle] = useState(false);
const [finishPressBurst, setFinishPressBurst] = useState(false);
useEffect(() => {
  const interval = setInterval(() => {
    setFinishSparkle(true);
    setTimeout(() => setFinishSparkle(false), 2500);
  }, 10 * 60 * 1000);
  return () => clearInterval(interval);
}, []);

// Trigger finish story animation after 10 pages read
useEffect(() => {
  if (currentPage + 1 === 10) {
    setFinishSparkle(true);
    const t1 = setTimeout(() => setFinishSparkle(false), 2000);
    return () => clearTimeout(t1);
  }
}, [currentPage]);

// Ensure timer UI becomes visible when time ends for premium (to show celebration + choice)
useEffect(() => {
  if (isPremium && timeRemaining === 0 && !isTimerVisible) {
    setIsTimerVisible(true);
  }
}, [isPremium, timeRemaining, isTimerVisible]);


  const initializeStory = async () => {
    console.log('🚀 initializeStory start', { isPremium, userName: userInfo?.name });
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
        
      } else {
        // Free: Netflix-style - generate complete story upfront
        console.log('🎬 Free user: Generating complete story', { isPremium, userInfo });
        console.log('🔍 DIAGNOSTIC: CleanStoryDisplay calling NetflixStyleStoryService', {
          userName: userInfo.name,
          difficulty: userInfo.difficultyLevel,
          timestamp: new Date().toISOString()
        });
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
        
        console.log('🔍 DIAGNOSTIC: Setting story in CleanStoryDisplay', {
          pagesCount: result.pages.length,
          firstPage: result.pages[0]?.substring(0, 100)
        });
        setStory(result.pages);
        setStoryTitle(result.title);
        setIsStoryComplete(true);
        const srcFree = (window as any).__LAST_STORY_SOURCE__ || 'unknown';
        console.log('🧭 UI SOURCE', { source: srcFree, tier: 'free' });
        setStorySource(srcFree as any);
      }
      
    } catch (error) {
      console.error('Story initialization failed:', error);
      setError('Failed to create your story. Please try again.');
    } finally {
      const elapsed = Date.now() - loaderStartRef.current;
      const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
      console.log('✅ initializeStory finished', { elapsed, remaining, LOADER_MIN_MS });
      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
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
    
    setIsGeneratingImage(true);
    
    try {
      const storyText = story[currentPage];
      const result = await SimpleImageService.generateStoryImage(
        storyText, 
        userInfo, 
        currentPage + 1,
        story.length
      );
      
      if (result.success && result.url) {
        setPageImages(prev => ({
          ...prev,
          [currentPage]: result.url
        }));
      }
      
    } catch (error) {
      console.log('Image generation failed, continuing without image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const countWords = (text: string) => {
    const matches = text?.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  };

  const handleNext = async () => {
    // Stop audio when navigating
    setIsAudioPlaying(false);
    clearHighlighting();

    // Count words for the page we're leaving (once per page)
    if (story[currentPage] && !pagesCompleted.has(currentPage)) {
      const pageWordCount = countWords(story[currentPage]);
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
    } else if (currentPage < story.length - 1) {
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
      onSessionEnded(sessionStats);
    }
  };
  
  const handlePrevious = () => {
    // Stop audio when navigating
    setIsAudioPlaying(false);
    clearHighlighting();
    setCurrentPage(Math.max(0, currentPage - 1));
  };
  
  useEffect(() => {
    const onNavigate = (e: Event) => {
      try {
        const detail = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail;
        if (detail?.direction === 'next') {
          handleNext();
        } else if (detail?.direction === 'prev') {
          handlePrevious();
        }
      } catch {}
    };
    window.addEventListener('reader:navigate', onNavigate as EventListener);
    return () => window.removeEventListener('reader:navigate', onNavigate as EventListener);
  }, [handleNext, handlePrevious]);
  
  const handleWordInteraction = () => {
    setWordsInteracted(prev => prev + 1);
    updateActivity({ wordsRead: 1 });
  };

  // Timer controls
  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReduceTime = () => {
    setTimeRemaining(prev => Math.max(5 * 60, prev - 5 * 60)); // Reduce by 5 minutes, minimum 5 minutes
  };
  const handleToggleTimerEnabled = () => {
    const next = !timerEnabled;
    window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: next }));
  };

  // Bottom dock actions
  const handleDockPlayAudio = () => {
    if (!isPremium && audioPlayedPage === currentPage && !isAudioPlaying) {
      toast({ title: t('audioReading.audioUsed', 'Audio used'), description: t('audioReading.audioUsedTooltip', 'Audio used (1x per page for free users)'), duration: 2000 });
      return;
    }
    if (elevenAudioRef.current) {
      const playing = !!elevenAudioRef.current.isPlaying;
      if (playing) {
        elevenAudioRef.current.stop?.();
        setIsAudioPlaying(false);
      } else {
        elevenAudioRef.current.play?.();
        setIsAudioPlaying(true);
        if (!isPremium) setAudioPlayedPage(currentPage);
      }
      return;
    }
    const btn = document.getElementById('elevenlabs-play-toggle') as HTMLButtonElement | null;
    btn?.click();
  };

  const handleDockVoiceCommand = () => {
    if (elevenAudioRef.current?.toggleVoiceCommands) {
      elevenAudioRef.current.toggleVoiceCommands();
      return;
    }
    const btn = document.getElementById('elevenlabs-voice-toggle') as HTMLButtonElement | null;
    if (btn) {
      btn.click();
      return;
    }
    const el = document.getElementById('audio-controls');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Manual end session logic exists below
  const handleEndSession = () => {
    const timeSpent = (20 * 60 - timeRemaining) * 1000; // Convert to milliseconds
    const totalWordsRead = sessionWordsRead;
    
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
      storyCompleted: currentPage === story.length - 1,
      readingSpeed: Math.round((totalWordsRead / timeSpent) * 60000)
    });
    
    try { sessionStorage.removeItem('readingTimerPausedSeconds'); } catch {}
    onSessionEnded(sessionStats);
  };

  // Premium timer controls
  const handleCancelTimer = () => {
    setIsTimerCanceled(true);
    setIsTimerRunning(false);
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
      // Build Story object
      const segments = story.map((text) => ({ text }));
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
      await PremiumStoryManager.saveStory(storyObj as any, userInfo, isStoryComplete ? ['ended'] : ['in-progress'], false);
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
};

  // Magic wand functionality - Generate new story
  const handleGenerateNewStory = async (specialRequestOverride?: string) => {
    if (isGeneratingNewStory) return;
    
    setIsGeneratingNewStory(true);
    
    try {
      console.log('🪄 Generating new story...');
      
      if (isPremium) {
        const effectiveUser = { ...userInfo, specialRequest: specialRequestOverride ?? userInfo.specialRequest, difficultyLevel: currentDifficulty, readingAbility: currentDifficulty, expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined } as UserInfo;
        const first = await LiveGenerationService.generateFirstPage(effectiveUser);
        if ((first as any).error) {
          throw new Error((first as any).error);
        }
        setStory([first.content]);
        setCurrentPage(0); // Reset to first page
        setLiveContext(first.nextContext || null);
        if (first.nextContext?.expertGradeLevel) {
          setExpertGradeLevel(first.nextContext.expertGradeLevel);
        }
        setIsStoryComplete(first.isComplete);
        setStoryTitle(`${userInfo.name}'s Live Adventure`);
      } else {
        const originalPageCount = story.length;
        const result = await NetflixStyleStoryService.generateCompleteStory({ ...userInfo, specialRequest: specialRequestOverride ?? userInfo.specialRequest, difficultyLevel: currentDifficulty, readingAbility: currentDifficulty, expertGradeLevel: currentDifficulty === 'expert' ? expertGradeLevel : undefined } as UserInfo);
        
        // For free users, maintain original page count
        const newStory = result.pages.slice(0, originalPageCount || result.pages.length);
        
        setStory(newStory);
        setCurrentPage(0); // Reset to first page
      }
      
      // Toast notifications removed for smoother experience
      
    } catch (error) {
      console.error('Failed to generate new story:', error);
      toast({
        title: "Magic Failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNewStory(false);
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

  // Submit special request and start generation
  const handleSpecialRequestSubmit = (value: string) => {
    setShowSpecialRequestDialog(false);
    handleGenerateNewStory(value);
  };

  // End Story follow-up actions (Premium)

  const handleStartSequel = () => {
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
        // Auto-advance to the newly generated concluding page
        setCurrentPage(prev => prev + 1);
        setJustAdvanced(true);
        setTimeout(() => setJustAdvanced(false), 600);
        setHighlightSave(true);
        toast({
          title: t('endStory.completed', 'Ending created'),
          description: t('endStory.completedDesc', 'Remember to save — tap Save in the header to keep this ending. You can also keep reading to start a sequel.'),
          duration: 3000,
        });
      }
    } catch (e) {
      console.error('Failed to generate ending page', e);
      toast({ title: "Ending failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingEnding(false);
    }
  };
  // Manual End Session (Premium): 5s celebration with music then stats
  const handleManualEndSession = () => {
    setShowManualCelebration(true);
    try {
      const audio = new Audio('/audio/celebration.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
    setTimeout(() => {
      setShowManualCelebration(false);
      handleEndSession();
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
      // Expert internal grade guardrail
      if (currentDifficulty === 'expert' && direction === 'down') {
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

  const progress = story.length > 0 ? ((currentPage + 1) / story.length) * 100 : 0;
  const currentImage = pageImages[currentPage];
  const isShortPage = countWords(currentStory) <= 8;

  if (isLoading || forceLoaderActive) {
    return (
      <AdaptiveEnhancedLoading isPremium={isPremium} userName={userInfo.name} />
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
          onNewStory={handleNewStoryClick}
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
                    disabled={currentPage === 0 || timeRemaining <= 0}
                    aria-label={t('nav.prev','Back')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground text-center min-w-[96px]">
                    Page {currentPage + 1} / {Math.max(story.length, 1)}
                  </p>
                  <Button
                    id="reader-next"
                    variant="default"
                    size="sm"
                    onClick={handleNext}
                    disabled={isLoadingNextPage || timeRemaining <= 0 || (!isPremium && currentPage === story.length - 1)}
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
                <ElevenLabsAudio
                  ref={elevenAudioRef}
                  text={currentStory}
                  userInfo={userInfo}
                  isPremium={isPremium}
                  onUpgrade={onUpgrade}
                  onWordHighlight={onWordHighlight}
                  difficulty={currentDifficulty}
                  currentPage={currentPage}
                  totalPages={story.length}
                />
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
                    {currentImage ? (
                      <>
                        {/* Background fill to avoid cropping/margins */}
                        <img
                          src={currentImage}
                          alt={`Story illustration for page ${currentPage + 1}: ${story[currentPage]?.substring(0, 100)}...`}
                          className="absolute inset-0 h-full w-full object-cover blur-md scale-110 brightness-[1.05]"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            console.warn('Story image failed to load, switching to classic fallback:', currentImage);
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            fallbackToClassic('image-error');
                          }}
                        />
                        {/* Foreground clean image, never cropped */}
                        <img
                          src={currentImage}
                          alt={`Story illustration for page ${currentPage + 1}: ${story[currentPage]?.substring(0, 100)}...`}
                          className="relative z-10 h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            console.warn('Story image failed to load, switching to classic fallback:', currentImage);
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            fallbackToClassic('image-error');
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {/* Bottom Half: Text (scrollable) + audio controls */}
                  <div className="flex-[0.42] min-h-0 w-full rounded-2xl shadow-2xl bg-card overflow-hidden flex flex-col relative">
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
                        className={cn("story-content storybook-frame w-full", justAdvanced && "animate-enter")}
                        data-difficulty={currentDifficulty}
                      >
                        {processTextWithConsistentFlow({
                          text: currentStory,
                          className: "interactive-word",
                          difficulty: currentDifficulty,
                          userInfo,
                          isPremium,
                          userId: userInfo.name,
                          highlightedWordIndex: currentHighlightedWord,
                            isMobile: preferMobileModal
                        })}
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
                        {currentImage ? (
                          <img 
                            src={currentImage} 
                            alt={`Story illustration for page ${currentPage + 1}: ${story[currentPage]?.substring(0, 100)}...`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              console.warn('Story image failed to load, switching to classic fallback:', currentImage);
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              fallbackToClassic('image-error');
                            }}
                          />
                        ) : isGeneratingImage ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Creating illustration...</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Text Content - RIGHT SIDE - Equal size on desktop */}
                  <div className="xl:order-2 flex flex-col h-full min-h-0">
                    <div className="w-full h-full min-h-0 rounded-2xl overflow-hidden shadow-2xl bg-card relative">
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
                          className={cn("story-content story-content--compact w-full", isPremium && isShortPage && "text-center", justAdvanced && "animate-enter")}
                          data-difficulty={currentDifficulty}
                        >
                          {processTextWithConsistentFlow({
                            text: currentStory,
                            className: "interactive-word",
                            difficulty: currentDifficulty,
                            userInfo,
                            isPremium,
                            userId: userInfo.name,
                            highlightedWordIndex: currentHighlightedWord,
                            isMobile: preferMobileModal
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Magic Wand Buttons Section */}
              <div className="mb-6 flex flex-col items-center gap-4">
                {/* Premium Magic Wand - Below page count */}

                {/* Free User Magic Wand - DRAMATICALLY ENHANCED for MAXIMUM visibility */}
                {!isPremium && currentPage === story.length - 1 && timeRemaining > 0 && (
                  <div className="text-center relative">
                    {/* Urgent messaging with flashing colors */}
                    <p className={cn(
                      "text-lg font-bold mb-4 px-4 py-2 rounded-full",
                      isMagicWandAnimating && "animate-pulse text-gradient-primary bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                    )}>
                      🌟 Generate New Story Now! 🌟
                    </p>
                    
                    {/* Sparkle animation container */}
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
                            ✨ Generate Fresh Story! ✨
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Additional attention-grabbing text */}
                    {isMagicWandAnimating && (
                      <p className="text-sm text-purple-600 mt-3 animate-pulse font-semibold">
                        🎯 Click the magic wand for unlimited new adventures! 🎯
                      </p>
                    )}
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
                {isPremium && (
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
                              disabled={!liveContext || isGeneratingEnding || isStoryComplete || timeRemaining <= 0}
                              variant="secondary"
                            >
                              {isGeneratingEnding ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('common.processing', 'Processing...')}
                                </>
                              ) : (
                                t('nav.endStory', 'Finish Story')
                              )}
                            </MobileOptimizedButton>
                            <SparkleAnimation isActive={finishSparkle} intensity="medium" isPremium={false} className="pointer-events-none absolute -inset-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.finishStory', 'Finish the story with a proper ending')}</TooltipContent>
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
                {isPremium && (
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
                              disabled={!liveContext || isGeneratingEnding || isStoryComplete || timeRemaining <= 0}
                              variant="secondary"
                              size="sm"
                            >
                              {isGeneratingEnding ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('common.processing', 'Processing...')}
                                </>
                              ) : (
                                t('nav.endStory', 'Finish Story')
                              )}
                            </MobileOptimizedButton>
                            <SparkleAnimation isActive={finishSparkle} intensity="medium" isPremium={false} className="pointer-events-none absolute -inset-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.finishStory', 'Finish the story with a proper ending')}</TooltipContent>
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

      {/* Unified Timer for All Users (respects persistent toggle) */}
      {timerEnabled && (
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

      {/* Always-visible timer toggle pill */}
      <TimerTogglePill
        enabled={timerEnabled}
        timeRemaining={timeRemaining}
        onToggle={handleToggleTimerEnabled}
      />

      {/* Mobile Action Dock - Mobile/Tablet */}
      {isMobileOrTablet && (
        <MobileActionDock
          isPremium={isPremium}
          onPlayAudio={handleDockPlayAudio}
          onVoiceCommand={isPremium ? handleDockVoiceCommand : undefined}
          onSave={isPremium ? handleSaveStoryNow : undefined}
          onEnd={isPremium ? () => setShowEndSessionConfirm(true) : undefined}
          isSaving={isSaving}
          isAudioPlaying={isAudioPlaying}
          audioDisabled={!isPremium && audioPlayedPage === currentPage && !isAudioPlaying}
        />
      )}

      {/* End Story Confirmation (Premium) */}
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
      </div>
    </ErrorBoundary>
    </GameContextProvider>
  );
};

export default CleanStoryDisplay;