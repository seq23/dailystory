import { uiText, useUiLanguage } from "@/i18n/uiText";
import { useScreenHistory } from "@/hooks/useScreenHistory";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { showsBack } from "@/lib/viewTrail";
import { savedReadingGrade } from '@/lib/readingGradeStore';
import { DebugLogger } from '@/services/DebugLogger';
import { MobileKeyboardHandler } from "@/components/MobileKeyboardHandler";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useCachedSubscriptionStatus } from "@/hooks/useCachedSubscriptionStatus";
import { setNarrationPremium } from "@/services/narrationRouter";
import { MultiStepUserForm } from "@/components/forms/MultiStepUserForm";
import { PremiumProfileEditor } from "@/components/PremiumProfileEditor";
import { PremiumMyStoriesView } from "@/components/PremiumMyStoriesView";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumSidebar } from "@/components/PremiumSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ParentDashboard } from "@/components/ParentDashboard";
import { PremiumStoryLibrary } from "@/components/PremiumStoryLibrary";
import CleanStoryDisplay from "@/components/CleanStoryDisplay";
import { StoryPaywall } from "@/components/StoryPaywall";
import { useFreeStoryAllowance } from "@/hooks/useFreeStoryAllowance";
import { TRIAL_DAYS } from "@/lib/freeStoryAllowance";

import { MyAccount } from "@/components/MyAccount";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { PremiumHomeTutorial } from "@/components/PremiumHomeTutorial";

import { DismissibleSystemStatus } from "@/components/DismissibleSystemStatus";
import { devToolsAllowed } from "@/lib/devTools";
import { codeFromUrl, premiumUntilLabel, redeemAccessCode } from "@/lib/accessCode";
import { toast } from "sonner";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { ChildDialog } from "@/components/children/ChildDialog";
import { FirstChildScreen } from "@/components/children/FirstChildScreen";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { DiscountActivationBanner } from "@/components/DiscountActivationBanner";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserInfo, Grade, LanguageCode, LearningGoal, SessionStats, DifficultyLevel } from "@/types";
import { isUserInfo } from "@/utils/typeGuards";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";

import { convertImagesToRecord } from "@/utils/imageUtils";

interface AuthenticatedAppProps {
  user: User;
}

type AppView = "home" | "stories" | "library" | "profile" | "parent" | "account" | "reading" | "progress" | "premium" | "email-confirmation-required";

interface UserProfile {
  id?: string;
  user_id: string;
  display_name?: string;
  date_of_birth?: string;
  grade_level?: string;
  reading_level?: string;
  difficulty_level?: string;
  native_language?: string;
  story_language_preference?: string;
  special_request?: string;
  avatar?: string | object;
  favorite_color?: string;
  favorite_animal?: string;
  favorite_food?: string;
  hobbies?: string;
  interests?: string[];
  updated_at?: string;
}

interface PremiumUserPreferences {
  user_id: string;
  display_name?: string;
  age?: number;
  grade_level?: string;
  native_language?: string;
  learning_goal?: string;
  avatar_type?: string;
  avatar_skin_tone?: string;
  is_premium?: boolean;
}

interface CurrentStory {
  id: string;
  title: string;
  pages?: any[];
  segments: any[];
  userInfo?: UserInfo;
  sessionId?: string;
  difficulty: string;
  estimatedReadingTime: number;
  wordCount: number;
  cachedImages?: Record<number, string>;
  isFromSavedStory?: boolean;
}

/**
 * Room under the last control on every page, so the round feedback button (FloatingFeedback:
 * bottom-6 + h-14 = 80px) never covers it (27 Oct 2026: it covered "Save settings" at the end
 * of Reading settings on a phone). Guard: src/test/guards/menu-back.test.ts.
 */
export const MAIN_BOTTOM_CLEARANCE = "calc(var(--cookie-banner-h, 0px) + 6rem)";

export const AuthenticatedApp = ({ user }: AuthenticatedAppProps) => {
  useUiLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useScreenHistory<AppView>("app", "stories");
  const goBack = () => {
    setIsEditingProfile(false);
    if (window.history.state?.idx > 0) navigate(-1);
    else setCurrentView("stories");
  };
  const [userProfile, setUserProfile] = useState<UserProfile | PremiumUserPreferences | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true); // All authenticated users are premium
  
  // Authoritative billing status from database for gating premium features
  const { isPremium: isSubscriptionActive, loading: subLoading, premiumUntil, error: subError } = useCachedSubscriptionStatus(user.id);
  const showDevTools = devToolsAllowed(user);
  // "Create Your First Story" on the Story Library page goes to My Stories with the
  // new-story form already open (before, it only switched pages and looked dead).
  const [openNewStoryOnArrival, setOpenNewStoryOnArrival] = useState(false);
  useEffect(() => { if (currentView !== "stories") setOpenNewStoryOnArrival(false); }, [currentView]);
  // The grown-up owns the account; children are the readers.
  const { children: childProfiles, loading: childrenLoading, error: childrenError } = useChildProfiles();
  const parentName = (user.user_metadata?.display_name as string | undefined) ?? null;
  // While subscription status is loading, assume active to prevent a flash of the paywall
  const hasPaidAccess = subLoading ? true : isSubscriptionActive;
  // Narration voice follows the PAID status only: free accounts get the browser voice,
  // paying (or overridden) accounts get Charlotte. Unknown while loading = browser.
  useEffect(() => {
    setNarrationPremium(!subLoading && !!isSubscriptionActive);
    return () => setNarrationPremium(false);
  }, [subLoading, isSubscriptionActive]);
  // PAYWALL: unpaid accounts get FREE_STORY_LIMIT stories, then the 7-day-trial checkout.
  // The server enforces the same limit (generate-adaptive-story answers 402).
  const freeStories = useFreeStoryAllowance(user.id);
  const effectiveSubscriptionActive = hasPaidAccess || freeStories.loading || !freeStories.exhausted;
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [devTestMode, setDevTestMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentStory, setCurrentStory] = useState<CurrentStory | null>(null);
  const [currentPageImages, setCurrentPageImages] = useState<Record<number, string>>({});
  
  useEffect(() => {
    DebugLogger.log('auth', 'AuthenticatedApp loading state:', loading);
  }, [loading]);
  
  // Initialize security monitoring
  useSecurityMonitoring();

  // A code saved at sign-up (user_metadata.access_code) or arriving on a ?code= link
  // is redeemed on the server once, so Premium is on before the parent goes looking.
  useEffect(() => {
    if (subLoading || isSubscriptionActive) return;
    const fromLink = codeFromUrl();
    const saved = typeof user.user_metadata?.access_code === "string" ? user.user_metadata.access_code : "";
    const code = fromLink || saved;
    if (!code) return;
    const onceKey = `t2r-code-tried:${user.id}:${code}`;
    try {
      if (sessionStorage.getItem(onceKey)) return;
      sessionStorage.setItem(onceKey, "1");
    } catch { /* storage blocked: may retry next load, which is harmless (idempotent) */ }
    redeemAccessCode(fromLink || undefined).then((r) => {
      if (r.ok) toast.success(premiumUntilLabel(r.premiumUntil) ?? uiText("Premium is on"));
      else if (fromLink) toast.error(`That code didn't go through: ${r.message}`);
    });
  }, [subLoading, isSubscriptionActive, user.id, user.user_metadata?.access_code]);

  // The reader stays mounted across routes, so handle action links on every arrival.
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    if (location.pathname !== '/' || !['new-story', 'library'].includes(action ?? '')) return;
    setOpenNewStoryOnArrival(action === 'new-story');
    navigate('/', { replace: true, state: {
      ...location.state,
      screens: { ...location.state?.screens, app: action === 'library' ? 'library' : 'stories', stories: 'library' },
    } });
  }, [location.pathname, location.search, navigate]);

  // Listen for global navigation to Parent Controls (from Profile editor etc.)
  useEffect(() => {
    const handler = () => {
      setIsEditingProfile(false);
      setCurrentView("parent");
      // Hint Parent Dashboard to open controls via hash
      try { window.location.hash = 'parent-controls'; } catch {}
    };
    window.addEventListener('open-parent-controls', handler as EventListener);
    return () => window.removeEventListener('open-parent-controls', handler as EventListener);
  }, []);

  useEffect(() => {
    // Load profile immediately (non-blocking)
    // Check subscription in background (failures won't block UI)
    const initializeUser = async () => {
      await loadUserProfile();
      // Fire-and-forget subscription check
      checkSubscription().catch(err => {
        DebugLogger.log('auth', 'Subscription check failed (non-blocking)', err);
      });
    };
    initializeUser();
  }, [user.id]);

  const checkSubscription = async () => {
    try {
      // Check for dev test mode — only available in development builds
      if (import.meta.env.DEV) {
        const devOverride = localStorage.getItem('dev_premium_override');
        if (devOverride === 'true') {
          setDevTestMode(true);
          setIsPremium(true);
          setSubscriptionTier('Development');
          setSubscriptionEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
          return;
        }
      }

      // LOCAL-FIRST: Check database directly with timeout (no network dependency)
      const dbCheckPromise = supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, override_premium, override_end, discount_code_pending, discount_activated')
        .eq('user_id', user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DB check timeout')), 3000)
      );

      const { data: dbData, error: dbError } = await Promise.race([
        dbCheckPromise,
        timeoutPromise
      ]) as any;

      // AUTO-APPLY PENDING DISCOUNT CODE
      if (!dbError && dbData && dbData.discount_code_pending && !dbData.discount_activated) {
        DebugLogger.log('auth', 'Auto-applying pending discount code:', dbData.discount_code_pending);
        try {
          const session = await supabase.auth.getSession();
          const { data: activationResult, error: activationError } = await supabase.functions.invoke('apply-discount-code', {
            headers: {
              Authorization: `Bearer ${session.data.session?.access_token}`,
            },
          });

          if (!activationError && activationResult?.activated) {
            DebugLogger.log('auth', 'Discount auto-applied successfully:', activationResult);
            
            // Dispatch custom event for banner display
            window.dispatchEvent(new CustomEvent('discount-activated', { 
              detail: {
                code: activationResult.code,
                description: activationResult.description,
                endDate: activationResult.end_date,
                durationDays: activationResult.duration_days
              }
            }));

            // Update local state immediately
            setIsPremium(true);
            setSubscriptionTier('Premium');
            setSubscriptionEnd(activationResult.end_date);
            
            // Re-check subscription to get fresh data
            const { data: refreshedData } = await supabase
              .from('subscribers')
              .select('subscribed, subscription_tier, subscription_end, override_premium, override_end')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (refreshedData) {
              const isSubscribed = refreshedData.subscribed;
              const isNotExpired = !refreshedData.subscription_end || new Date(refreshedData.subscription_end) > new Date();
              const hasOverride = refreshedData.override_premium;
              const overrideNotExpired = !refreshedData.override_end || new Date(refreshedData.override_end) > new Date();
              
              const isPremiumActive = (isSubscribed && isNotExpired) || (hasOverride && overrideNotExpired);
              
              if (isPremiumActive) {
                setIsPremium(true);
                setSubscriptionTier(refreshedData.subscription_tier || 'Premium');
                setSubscriptionEnd(refreshedData.subscription_end);
              }
            }
            return;
          } else {
            DebugLogger.warn('auth', 'Discount auto-apply failed:', activationError);
          }
        } catch (autoApplyError) {
          DebugLogger.error('auth', 'Error auto-applying discount:', autoApplyError);
        }
      }

      // Check if subscription is active (normal or override)
      if (!dbError && dbData) {
        const isSubscribed = dbData.subscribed;
        const isNotExpired = !dbData.subscription_end || new Date(dbData.subscription_end) > new Date();
        const hasOverride = dbData.override_premium;
        const overrideNotExpired = !dbData.override_end || new Date(dbData.override_end) > new Date();
        
        const isPremiumActive = (isSubscribed && isNotExpired) || (hasOverride && overrideNotExpired);
        
        if (isPremiumActive) {
          setIsPremium(true);
          setSubscriptionTier(dbData.subscription_tier || 'Premium');
          setSubscriptionEnd(dbData.subscription_end);
        }
      }

      // ANALYTICS ONLY: Fire-and-forget check-subscription (never gates UX)
      supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      }).catch(() => {
        // Silent - analytics only
      });

      // Note: We never downgrade authenticated users from premium status
    } catch (error) {
      // All errors are non-blocking; authenticated users remain premium
      DebugLogger.log('auth', 'Subscription check error (non-blocking)', error);
    }
  };

  const toggleDevTestMode = () => {
    if (!import.meta.env.DEV) return; // No-op in production
    const newMode = !devTestMode;
    if (newMode) {
      localStorage.setItem('dev_premium_override', 'true');
      setDevTestMode(true);
      setIsPremium(true);
      setSubscriptionTier('Development');
      setSubscriptionEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    } else {
      localStorage.removeItem('dev_premium_override');
      setDevTestMode(false);
      checkSubscription(); // Re-check actual subscription
    }
  };

  const loadUserProfile = async () => {
    try {
      // Handle post-90-day email confirmation blocking
      if (!user.email_confirmed_at) {
        const accountCreatedAt = user.created_at;
        if (accountCreatedAt) {
          const createdDate = new Date(accountCreatedAt);
          const gracePeriodEnd = new Date(createdDate.getTime() + (90 * 24 * 60 * 60 * 1000));
          const now = new Date();
          
          // Block access if grace period expired and not developer
          if (now > gracePeriodEnd && user.email !== 'seq.taylor@gmail.com') {
            setLoading(false);
            setCurrentView("email-confirmation-required");
            return;
          }
        }
      }

      // For premium users, load from user_preferences first
      if (isPremium) {
        const { data: preferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!prefError && preferences && isUserInfo(preferences)) {
          setUserProfile(preferences);
          
          // CRITICAL: Load difficultyLevel from reading_preferences JSONB
          const readingPrefs = (preferences.reading_preferences as any) || {};
          const savedDifficulty = readingPrefs.difficultyLevel || 'beginner';
          // The exact Reads-at grade is kept on profiles (src/lib/readingGradeStore.ts).
          const { data: gradeRow } = await supabase.from('profiles').select('reading_grade' as any).eq('user_id', user.id).maybeSingle();
          const savedGrade = savedReadingGrade(gradeRow);
          
          // Convert preferences to UserInfo format with proper defaults
          const userInfoData: UserInfo = {
            name: preferences.display_name || 'Reader',
            age: preferences.age || 7,
            grade: (preferences.grade_level as Grade) || 'K',
            gradeLevel: (preferences.grade_level as Grade) || 'K',
          nativeLanguage: (preferences.native_language as LanguageCode) || 'en',
          readingLevel: 'beginner',
          difficultyLevel: savedDifficulty as DifficultyLevel, // Load from reading_preferences
          ...(savedGrade ? { readingGrade: savedGrade } : {}),
          interests: [],
          learningGoal: (preferences.learning_goal as LearningGoal) || 'improve-english-reading',
          avatar: { 
            type: (preferences.avatar_type as any) || 'prefer-not-to-answer', 
            skinTone: (preferences.avatar_skin_tone as any) || 'medium' 
          },
          favoriteColor: 'blue', // Default neutral values
            favoriteAnimal: '',
            hobbies: '',
            favoriteFood: '',
            specialRequest: ''
          };
          setUserInfo(userInfoData);
          setCurrentView("stories");
          return;
        }
        
        // If no preferences, create default for premium user
        DebugLogger.log('auth', 'Premium user with no preferences - creating default');
        await createDefaultPremiumProfile();
        return;
      }

      // For non-premium users, still use profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        DebugLogger.error('auth', 'Error loading profile', error);
        return;
      }

      if (profile) {
        setUserProfile(profile);
        // Convert profile to UserInfo format
        const userInfoData: UserInfo = {
          name: profile.display_name || 'Reader',
          age: profile.date_of_birth ? 
            new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 7,
          grade: (profile.grade_level as Grade) || 'K',
          gradeLevel: (profile.grade_level as Grade) || 'K',
          nativeLanguage: (profile.native_language as LanguageCode) || 'en',
          readingLevel: profile.reading_level || 'beginner',
          difficultyLevel: profile.difficulty_level || profile.reading_level || 'beginner',
          // The exact Reads-at grade a grown-up with no child profile chose (src/lib/readingGradeStore.ts).
          ...(savedReadingGrade(profile) ? { readingGrade: savedReadingGrade(profile)! } : {}),
          interests: profile.interests || [],
          learningGoal: 'improve-english-reading' as LearningGoal,
          avatar: typeof profile.avatar === 'string' ? JSON.parse(profile.avatar) : (profile.avatar || { type: 'prefer-not-to-answer', skinTone: 'medium' }),
          favoriteColor: profile.favorite_color || 'blue',
          favoriteAnimal: profile.favorite_animal || 'cat',
          hobbies: profile.hobbies || '',
          favoriteFood: profile.favorite_food || '',
          specialRequest: profile.special_request || ''
        };
        setUserInfo(userInfoData);
        setCurrentView("stories");
      }
    } catch (error) {
      DebugLogger.error('auth', 'Profile loading error', error);
    } finally {
      setLoading(false);
    }
  };

  // Create default preferences for premium users to bypass profile setup
  const createDefaultPremiumProfile = async () => {
    try {
      const defaultUserInfo: UserInfo = {
        // Prefer the display name captured at signup (stored in auth user metadata)
        // so the protagonist isn't named after the email local-part. Use the first
        // word so a full display name like "E2E Premium Tester" becomes "E2E".
        name:
          (user.user_metadata?.display_name as string | undefined)?.trim().split(/\s+/)[0] ||
          user.email?.split('@')[0] ||
          'Reader',
        age: 8,
        grade: 'K',
        gradeLevel: 'K',
        nativeLanguage: 'en',
        readingLevel: 'beginner',
        difficultyLevel: 'beginner',
        interests: [],
        learningGoal: 'improve-english-reading' as LearningGoal,
        avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
        favoriteColor: 'blue',
        favoriteAnimal: '',
        hobbies: '',
        favoriteFood: '',
        specialRequest: ''
      };

      const payload = {
        user_id: user.id,
        display_name: defaultUserInfo.name,
        age: defaultUserInfo.age,
        grade_level: defaultUserInfo.gradeLevel,
        native_language: defaultUserInfo.nativeLanguage,
        learning_goal: defaultUserInfo.learningGoal,
        avatar_type: defaultUserInfo.avatar.type,
        avatar_skin_tone: defaultUserInfo.avatar.skinTone,
        is_premium: true,
        reading_preferences: { difficultyLevel: 'beginner' } // Include default difficulty
      };

      // Upsert, never a bare insert: the profile load can run twice at sign-in, and the
      // child switcher may already have written this row (active_child_id). A second
      // insert hit user_preferences_user_id_key (23505) and logged "Error creating
      // default premium preferences". ignoreDuplicates keeps an existing row untouched.
      const { error } = await supabase
        .from('user_preferences')
        .upsert([payload], { onConflict: 'user_id', ignoreDuplicates: true });

      if (error) {
        DebugLogger.error('auth', 'Error creating default premium preferences', error);
        return;
      }

      DebugLogger.log('auth', 'Default premium preferences created successfully');
      setUserInfo(defaultUserInfo);
      setCurrentView("stories");
    } catch (error) {
      DebugLogger.error('auth', 'Error in createDefaultPremiumProfile', error);
    }
  };

  const handleInitialProfileSetup = async (info: UserInfo) => {
    try {
      const birthYear = new Date().getFullYear() - info.age;
      const dateOfBirth = `${birthYear}-01-01`;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: info.name,
          date_of_birth: dateOfBirth,
          grade_level: info.gradeLevel || info.grade,
          reading_level: info.readingLevel,
          native_language: info.nativeLanguage,
          interests: info.interests || []
        });

      if (error) {
        DebugLogger.error('auth', 'Error updating profile', error);
        return;
      }

      setUserInfo(info);
      setCurrentView("stories");
    } catch (error) {
      DebugLogger.error('auth', 'Profile update error', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all local state first
      setUserInfo(null);
      setUserProfile(null);
      setCurrentStory(null);
      setCurrentView("stories");
      
      // Clear caches
      localStorage.removeItem('story-session-data');
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        DebugLogger.error('auth', 'Sign out error', error);
        // Force reload as fallback
        window.location.href = '/';
      }
    } catch (e) {
      DebugLogger.error('auth', 'Sign out exception', e);
      // Force reload as last resort
      window.location.href = '/';
    }
  };

  const handleSessionEnded = async (stats: SessionStats) => {
    // Client navigation keeps the reading tree mounted for native Back and Forward.
    navigate(`/session-ended?stats=${encodeURIComponent(JSON.stringify({...stats, isPremium}))}`);
  };

  const handleProfileUpdate = async (updatedUserInfo: UserInfo) => {
    try {
      DebugLogger.log('auth', 'Account holder update started for user:', user.id);
      DebugLogger.log('auth', 'Updated account holder info:', {
        name: updatedUserInfo.name,
        age: updatedUserInfo.age,
        grade: updatedUserInfo.grade,
        nativeLanguage: updatedUserInfo.nativeLanguage,
        difficultyLevel: updatedUserInfo.difficultyLevel
      });

      // Use grade value directly - no normalization needed
      const gradeValue = updatedUserInfo.grade;

      if (isPremium) {
        // Premium users save to user_preferences table
        
        // First, fetch existing reading_preferences to preserve guardrails
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('reading_preferences')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentReadingPrefs = (existingPrefs?.reading_preferences && typeof existingPrefs.reading_preferences === 'object') 
          ? existingPrefs.reading_preferences as Record<string, any>
          : {};

        const payload = {
          display_name: updatedUserInfo.name,
          age: updatedUserInfo.age,
          grade_level: gradeValue,
          native_language: updatedUserInfo.nativeLanguage,
          learning_goal: updatedUserInfo.learningGoal,
          avatar_type: updatedUserInfo.avatar?.type || 'prefer-not-to-answer',
          avatar_skin_tone: updatedUserInfo.avatar?.skinTone || 'medium',
          is_premium: true,
          reading_preferences: {
            ...currentReadingPrefs,
            difficultyLevel: updatedUserInfo.difficultyLevel
          }
        };

        DebugLogger.log('auth', 'Payload to save to user_preferences:', JSON.stringify(payload, null, 2));

        const { error } = await supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, ...payload }, { onConflict: 'user_id' });

        if (error) {
          DebugLogger.error('auth', 'Database operation error', error);
          throw error;
        }

        DebugLogger.log('auth', 'Account holder preferences updated successfully');
      } else {
        // Non-premium users still use profiles table
        const birthYear = new Date().getFullYear() - updatedUserInfo.age;
        const dateOfBirth = `${birthYear}-01-01`;

        const payload = {
          display_name: updatedUserInfo.name,
          date_of_birth: dateOfBirth,
          grade_level: updatedUserInfo.gradeLevel || updatedUserInfo.grade,
          reading_level: updatedUserInfo.readingLevel,
          difficulty_level: updatedUserInfo.difficultyLevel,
          native_language: updatedUserInfo.nativeLanguage,
          story_language_preference: updatedUserInfo.storyLanguagePreference,
          special_request: updatedUserInfo.specialRequest,
          avatar: JSON.stringify(updatedUserInfo.avatar),
          favorite_color: updatedUserInfo.favoriteColor,
          favorite_animal: updatedUserInfo.favoriteAnimal,
          favorite_food: updatedUserInfo.favoriteFood,
          hobbies: updatedUserInfo.hobbies,
          interests: updatedUserInfo.interests || []
        };

        const { data: existing, error: fetchErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (fetchErr) {
          DebugLogger.error('auth', 'Error checking existing profile', fetchErr);
          throw fetchErr;
        }

        let error;
        if (existing?.id) {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update(payload)
            .eq('user_id', user.id);
          error = updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('profiles')
            .insert([{ user_id: user.id, ...payload }]);
          error = insertErr;
        }

        if (error) {
          DebugLogger.error('auth', 'Database operation error', error);
          throw error;
        }
      }

      // Update local state  
      const updatedUserInfoWithGrade = {
        ...updatedUserInfo,
        grade: gradeValue,
        gradeLevel: gradeValue
      };
      
      setUserInfo(updatedUserInfoWithGrade);
      setIsEditingProfile(false);
      
      DebugLogger.log('auth', 'Account holder update completed successfully');
    } catch (error) {
      DebugLogger.error('auth', 'Account holder update error', error);
      throw error;
    }
  };

  if (loading) {
    return <AdaptiveEnhancedLoading isPremium={isPremium} />;
  }

  // First run: add the first child before anything else (then New Story).
  if (!childrenLoading && !childrenError && childProfiles.length === 0 && currentView !== "account") {
    return (
      <>
        <FirstChildScreen parentName={parentName} hasPremium={!subLoading && !!isSubscriptionActive} premiumUntil={premiumUntil} />
        <ChildDialog />
      </>
    );
  }

  // Handle post-90-day email confirmation requirement
  if (currentView === "email-confirmation-required") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">{uiText("Email Verification Required")}</h2>
            <p className="text-gray-600 mt-2">
              {uiText("Your 90-day grace period has expired. Please verify your email address to continue using your account.")}
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={async () => {
                await supabase.auth.resend({ type: 'signup', email: user.email });
                // Note: Would need toast here, but keeping minimal for now
              }}
              className="w-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {uiText("Resend Verification Email")}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full"
            >
              {uiText("Sign Out")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PREMIUM USERS: Should never see this form - they get auto-profile creation
  if (!userInfo) {
    // If premium user still has no profile after auto-creation attempt, show loading
    if (isPremium) {
      return <AdaptiveEnhancedLoading isPremium={isPremium} />;
    }

    // NON-PREMIUM USERS: Show profile setup form
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{uiText("Welcome to Time-2-Read!")}</h1>
              <p className="text-gray-600">{uiText("Let's set up your reading profile")}</p>
            </div>
            <MultiStepUserForm
              onSubmit={async (info) => {
                await handleInitialProfileSetup(info);
              }}
              onBack={handleSignOut} // FIX: Back button now signs out user
              isPremium={isPremium}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileKeyboardHandler>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-purple-50">
          <PremiumSidebar
            currentView={currentView}
            onViewChange={(view: string) => {
              // Block navigation to premium views if subscription is inactive
              const premiumViews = ["stories", 'library', 'reading', 'premium', 'progress', 'parent', 'profile'];
              if (!effectiveSubscriptionActive && premiumViews.includes(view)) {
                // Stay on current view (stories), don't navigate
                setCurrentView("stories");
                return;
              }
              setCurrentView(view as AppView);
            }}
            userInfo={userInfo}
            isPremium={effectiveSubscriptionActive}
            hasPremium={!subLoading && !!isSubscriptionActive}
            premiumUntil={premiumUntil}
            planKnown={!subLoading && !subError}
          />
          
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <PremiumHeader
              userInfo={userInfo}
              isPremium={isPremium}
              devTestMode={devTestMode}
              showDevTools={showDevTools}
              hasPremium={!subLoading && !!isSubscriptionActive}
              subscriptionTier={subscriptionTier || undefined}
              onSignOut={handleSignOut}
              onToggleDevMode={toggleDevTestMode}
              onProfileClick={() => setCurrentView("account")}
              onGrownUpSettings={() => { setIsEditingProfile(false); setCurrentView("account"); }}
            />

            <main className="flex-1 min-h-0 overflow-y-auto overscroll-auto mobile-scroll h-[calc(100dvh-var(--app-header-height))] p-2 sm:p-4 md:p-6" style={{ paddingBottom: MAIN_BOTTOM_CLEARANCE }}>
              {/* Developer widget: dev builds and admins only, never families */}
              {showDevTools && <DismissibleSystemStatus />}

              {/* Premium badge: what the parent has, and until when */}
              {!subLoading && isSubscriptionActive && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm font-medium text-green-900" data-testid="premium-badge">
                  <span aria-hidden>✓</span> {premiumUntilLabel(premiumUntil) ?? uiText("Premium is on")}
                </div>
              )}
              
              {/* Discount activation success banner */}
              <DiscountActivationBanner />
              
              {/* Subscription status banner - non-blocking */}
              {!hasPaidAccess && !freeStories.loading && !freeStories.exhausted && (
                <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm flex flex-wrap items-center justify-between gap-2" data-testid="free-stories-banner">
                  <span>
                    {uiText("{{remaining}} of {{limit}} free stories left. Then try Premium free for {{days}} days.", { remaining: freeStories.remaining, limit: freeStories.limit, days: TRIAL_DAYS })}
                  </span>
                  <span className="flex items-center gap-4">
                    <button type="button" className="font-medium text-primary underline" onClick={() => setCurrentView("account")}>{uiText("Have a code?")}</button>
                    <Link to="/pricing" className="font-medium text-primary underline">{uiText("See plans")}</Link>
                  </span>
                </div>
              )}
              
              {/* Email verification banner for unverified premium users */}
              {!user.email_confirmed_at && (
                <EmailVerificationBanner 
                  user={user} 
                  accountCreatedAt={user.created_at}
                />
              )}
              
              {showsBack(currentView) && !isEditingProfile && (
                <button
                  type="button"
                  onClick={goBack}
                  data-testid="view-back"
                  className="mb-3 inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-background px-4 text-base font-medium text-foreground shadow-sm hover:bg-muted"
                >
                  <span aria-hidden>←</span> {uiText("Back")}
                </button>
              )}

              {isEditingProfile ? (
                <PremiumProfileEditor
                  userInfo={userInfo}
                  onSave={async (updatedUserInfo) => {
                    await handleProfileUpdate(updatedUserInfo);
                  }}
                  onCancel={() => setIsEditingProfile(false)}
                  onManageChildren={() => { setIsEditingProfile(false); setCurrentView("account"); }}
                />
              ) : (
                <>
                  {currentView === "home" && userInfo && (
                    <PremiumHomeTutorial
                      userName={userInfo.name}
                      onNavigate={(view) => setCurrentView(view as AppView)}
                    />
                  )}

                  {(
          <div hidden={currentView !== "stories"}>
          <PremiumMyStoriesView
            userInfo={userInfo}
            isPremium={isPremium}
            isSubscriptionActive={effectiveSubscriptionActive}
            onSessionEnded={handleSessionEnded}
            openNewStoryOnArrival={openNewStoryOnArrival}
            isActive={currentView === "stories"}
          />
          </div>
                  )}

                  {currentView === "library" && (
                    effectiveSubscriptionActive ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary/20 rounded-full">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{uiText("Story Library")}</h1>
                          <p className="text-muted-foreground">{uiText("Manage your saved stories and collections")}</p>
                        </div>
                      </div>
                       <PremiumStoryLibrary
                         onLoadStory={async (story) => {
                           try {
                             // CRITICAL FIX: Load images from saved story metadata instead of hash-based lookup
                             let cachedImages = null;
                             
                                // Priority 1: Load from story's imageCacheMetadata (newly saved stories)
                                if ('imageCacheMetadata' in story && story.imageCacheMetadata) {
                                  DebugLogger.log('image', 'Loading images from story imageCacheMetadata');
                                  cachedImages = convertImagesToRecord(story.imageCacheMetadata, 'Story metadata');
                                }
                                // Priority 2: Load from legacy image_cache_metadata field
                                else if ('image_cache_metadata' in story && story.image_cache_metadata) {
                                  DebugLogger.log('image', 'Loading images from legacy image_cache_metadata');
                                 cachedImages = convertImagesToRecord(story.image_cache_metadata, 'Legacy metadata');
                               }
                              
                              // Validate loaded images
                              if (cachedImages) {
                                const validatedImages: Record<number, string> = {};
                                for (const [index, url] of Object.entries(cachedImages)) {
                                  try {
                                    if (typeof url === 'string') {
                                      new URL(url); // Basic URL validation
                                      validatedImages[parseInt(index)] = url;
                                    }
                                  } catch {
                                    DebugLogger.warn('image', `Invalid image URL for page ${index}`, { url });
                                  }
                                }
                                cachedImages = Object.keys(validatedImages).length > 0 ? validatedImages : null;
                              }
                             // Fallback: Attempt hash-based lookup (for backward compatibility)
                             else {
                               DebugLogger.log('image', 'Attempting hash-based image lookup as fallback');
                               const { StoryCacheIntegration } = await import('@/services/StoryCacheIntegration');
                               const storyPages = story.segments?.map(s => s.text) || [];
                               if (storyPages.length > 0) {
                                 const storyHash = StoryCacheIntegration.generateStoryHash(storyPages);
                                 const hashImages = await StoryCacheIntegration.loadStoryImages(storyHash, storyPages.length);
                                 cachedImages = Object.keys(hashImages).length > 0 ? hashImages : null;
                               }
                             }
                             
                             // Set current story with loaded images
                             setCurrentStory({
                               ...story,
                               cachedImages: cachedImages || {},
                               isFromSavedStory: true // Flag to prevent regeneration
                             });
                             setCurrentView("reading");
                           } catch (error) {
                             DebugLogger.error('story', 'Failed to load story', error);
                             setCurrentStory(story);
                             setCurrentView("reading");
                           }
                         }}
                         onStartNewStory={() => { setOpenNewStoryOnArrival(true); setCurrentView("stories"); }}
                         currentStory={currentStory}
                         pageImages={currentPageImages}
                       />
                    </div>
                    ) : (
                      <StoryPaywall />
                    )
                  )}



                  {currentView === "profile" && (
                    <PremiumProfileEditor
                      userInfo={userInfo}
                      onSave={async (updatedUserInfo) => {
                        await handleProfileUpdate(updatedUserInfo);
                      }}
                      onCancel={() => setCurrentView("stories")}
                      onManageChildren={() => setCurrentView("account")}
                    />
                  )}

                  {currentView === "parent" && userInfo && (
                    <ParentDashboard
                      userInfo={userInfo}
                      isVisible={true}
                      onClose={() => {}}
                    />
                  )}

                  {currentView === "account" && (
                    <MyAccount
                      isPremium={!subLoading && !!isSubscriptionActive}
                      premiumUntil={premiumUntil ?? undefined}
                      freeStoriesLeft={hasPaidAccess ? undefined : freeStories.remaining}
                      userEmail={user.email}
                      devTestMode={devTestMode}
                    />
                  )}

                  {currentStory && (
                    effectiveSubscriptionActive && currentStory ? (
                    <div hidden={currentView !== "reading"} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary/20 rounded-full">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{currentStory.title}</h1>
                          <p className="text-muted-foreground">{uiText("Reading saved story")}</p>
                        </div>
                      </div>
                       <CleanStoryDisplay
                         userInfo={userInfo}
                         isPremium={isPremium}
                         currentStory={currentStory}
                         isActive={currentView === "reading"}
                         // A story finished from the library ends like a new one: the
                         // session-ended page with its quiz (27 Oct 2026, final live tests:
                         // ending a saved story went back to the library, so a story resumed
                         // from Save never got its end-of-story quiz).
                         // Guard: src/test/guards/menu-back.test.ts.
                         onSessionEnded={handleSessionEnded}
                         onHome={() => setCurrentView("stories")}
                         onUpgrade={() => setCurrentView("account")}
                         onNewStory={() => setCurrentView("stories")}
                         onPageImagesUpdate={(images) => setCurrentPageImages(images)}
                       />
                    </div>
                    ) : (
                      <StoryPaywall />
                    )
                  )}

                  {currentView === "progress" && (
                    <ProgressDashboard
                      userInfo={userInfo}
                      userId={user.id}
                      isVisible={true}
                      onClose={() => setCurrentView("stories")}
                      isPremium={isPremium}
                    />
                  )}

                </>
              )}
            </main>
          </div>
        </div>
        
        <ChildDialog />
        {/* System health badge removed for cleaner interface */}
        {/* <DismissibleSystemStatus className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto z-40" /> */}
      </SidebarProvider>
    </MobileKeyboardHandler>
  );
};
