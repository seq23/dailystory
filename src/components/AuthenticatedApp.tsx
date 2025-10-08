import { useState, useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import { MobileKeyboardHandler } from "@/components/MobileKeyboardHandler";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useCachedSubscriptionStatus } from "@/hooks/useCachedSubscriptionStatus";
import { MultiStepUserForm } from "@/components/forms/MultiStepUserForm";
import { PremiumProfileEditor } from "@/components/PremiumProfileEditor";
import { PremiumMyStoriesView } from "@/components/PremiumMyStoriesView";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumSidebar } from "@/components/PremiumSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ParentDashboard } from "@/components/ParentDashboard";
import { PremiumStoryLibrary } from "@/components/PremiumStoryLibrary";
import CleanStoryDisplay from "@/components/CleanStoryDisplay";

import { MyAccount } from "@/components/MyAccount";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { VocabularyDashboard } from "@/components/VocabularyDashboard";
import { DismissibleSystemStatus } from "@/components/DismissibleSystemStatus";
import { NonBlockingSubscriptionBanner } from "@/components/NonBlockingSubscriptionBanner";
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

type AppView = "stories" | "library" | "profile" | "parent" | "account" | "reading" | "progress" | "premium" | "email-confirmation-required";

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

export const AuthenticatedApp = ({ user }: AuthenticatedAppProps) => {
  const [currentView, setCurrentView] = useState<AppView>("stories");
  const [userProfile, setUserProfile] = useState<UserProfile | PremiumUserPreferences | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true); // All authenticated users are premium
  
  // Authoritative billing status from database for gating premium features
  const { isPremium: isSubscriptionActive, loading: subLoading } = useCachedSubscriptionStatus(user.id);
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

  // Check for query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new-story') {
      // User came from session ended page wanting to start new story
      setCurrentView("stories");
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    } else if (action === 'library') {
      // Navigate directly to the Story Library after save
      setCurrentView("library");
      window.history.replaceState({}, '', '/');
    }
  }, []);

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
      // Check for dev test mode in localStorage
      const devOverride = localStorage.getItem('dev_premium_override');
      if (devOverride === 'true') {
        setDevTestMode(true);
        setIsPremium(true);
        setSubscriptionTier('Development');
        setSubscriptionEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        return;
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
          
          // Convert preferences to UserInfo format with proper defaults
          const userInfoData: UserInfo = {
            name: preferences.display_name || 'Reader',
            age: preferences.age || 7,
            grade: (preferences.grade_level as Grade) || 'K',
            gradeLevel: (preferences.grade_level as Grade) || 'K',
          nativeLanguage: (preferences.native_language as LanguageCode) || 'en',
          readingLevel: 'beginner',
          difficultyLevel: savedDifficulty as DifficultyLevel, // Load from reading_preferences
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
        name: user.email?.split('@')[0] || 'Reader',
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

      const { error } = await supabase
        .from('user_preferences')
        .insert([payload]);

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
    await supabase.auth.signOut();
  };

  const handleSessionEnded = async (stats: SessionStats) => {
    // Clear ALL session caches comprehensively before navigation
    try {
      const { SessionCacheManager } = await import('@/services/SessionCacheManager');
      SessionCacheManager.clearOnSessionEnd(user.id, userInfo?.avatar?.type);
    } catch (error) {
      DebugLogger.warn('performance', 'Failed to clear session caches', error);
    }
    
    // Navigate to SessionEnded page with stats
    window.location.href = `/session-ended?stats=${encodeURIComponent(JSON.stringify({...stats, isPremium}))}`;
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

  // Handle post-90-day email confirmation requirement
  if (currentView === "email-confirmation-required") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Email Verification Required</h2>
            <p className="text-gray-600 mt-2">
              Your 90-day grace period has expired. Please verify your email address to continue using your account.
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
              Resend Verification Email
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Time2Read!</h1>
              <p className="text-gray-600">Let's set up your reading profile</p>
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
              const premiumViews = ['stories', 'library', 'reading', 'premium', 'progress', 'parent', 'profile'];
              if (!isSubscriptionActive && premiumViews.includes(view)) {
                // Stay on current view (stories), don't navigate
                setCurrentView('stories');
                return;
              }
              setCurrentView(view as AppView);
            }}
            userInfo={userInfo}
            isPremium={isPremium}
          />
          
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <PremiumHeader
              userInfo={userInfo}
              isPremium={isPremium}
              devTestMode={devTestMode}
              subscriptionTier={subscriptionTier || undefined}
              onSignOut={handleSignOut}
              onToggleDevMode={toggleDevTestMode}
              onProfileClick={() => setIsEditingProfile(true)}
            />

            <main className="flex-1 min-h-0 overflow-y-auto overscroll-auto mobile-scroll h-[calc(100dvh-var(--app-header-height))] p-2 sm:p-4 md:p-6">
              {/* System status banner */}
              <DismissibleSystemStatus />
              
              {/* Discount activation success banner */}
              <DiscountActivationBanner />
              
              {/* Subscription status banner - non-blocking */}
              <NonBlockingSubscriptionBanner userId={user.id} />
              
              {/* Email verification banner for unverified premium users */}
              {!user.email_confirmed_at && (
                <EmailVerificationBanner 
                  user={user} 
                  accountCreatedAt={user.created_at}
                />
              )}
              
              {isEditingProfile ? (
                <PremiumProfileEditor
                  userInfo={userInfo}
                  onSave={async (updatedUserInfo) => {
                    await handleProfileUpdate(updatedUserInfo);
                  }}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <>
                  {currentView === "stories" && (
          <PremiumMyStoriesView
            userInfo={userInfo}
            isPremium={isPremium}
            isSubscriptionActive={isSubscriptionActive}
            onSessionEnded={handleSessionEnded}
          />
                  )}

                  {currentView === "library" && (
                    isSubscriptionActive ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary/20 rounded-full">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">Story Library</h1>
                          <p className="text-muted-foreground">Manage your saved stories and collections</p>
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
                         onStartNewStory={() => setCurrentView("stories")}
                         currentStory={currentStory}
                         pageImages={currentPageImages}
                       />
                    </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="border-red-200 bg-red-50 rounded-lg p-8 text-center">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Required</h2>
                          <p className="text-gray-600 mb-6">
                            Your subscription is inactive. Please update your billing to continue.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button onClick={() => setCurrentView('account')}>Manage Billing</Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}



                  {currentView === "profile" && (
                    <PremiumProfileEditor
                      userInfo={userInfo}
                      onSave={async (updatedUserInfo) => {
                        await handleProfileUpdate(updatedUserInfo);
                      }}
                      onCancel={() => setCurrentView("stories")}
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
                      isPremium={isPremium}
                      subscriptionTier={subscriptionTier || undefined}
                      subscriptionEnd={subscriptionEnd || undefined}
                      devTestMode={devTestMode}
                    />
                  )}

                  {currentView === "reading" && (
                    isSubscriptionActive && currentStory ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary/20 rounded-full">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{currentStory.title}</h1>
                          <p className="text-muted-foreground">Reading saved story</p>
                        </div>
                      </div>
                       <CleanStoryDisplay
                         userInfo={userInfo}
                         isPremium={isPremium}
                         currentStory={currentStory}
                         onSessionEnded={(stats) => {
                           DebugLogger.log('story', 'Story session ended:', stats);
                           setCurrentView("library");
                         }}
                         onHome={() => setCurrentView("stories")}
                         onUpgrade={() => setCurrentView("account")}
                         onNewStory={() => setCurrentView("stories")}
                         onPageImagesUpdate={(images) => setCurrentPageImages(images)}
                       />
                    </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="border-red-200 bg-red-50 rounded-lg p-8 text-center">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Required</h2>
                          <p className="text-gray-600 mb-6">
                            Your subscription is inactive. Please update your billing to continue.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button onClick={() => setCurrentView('account')}>Manage Billing</Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {currentView === "progress" && (
                    <ProgressDashboard
                      userInfo={userInfo}
                      isVisible={true}
                      onClose={() => setCurrentView("stories")}
                      isPremium={isPremium}
                    />
                  )}

                  {currentView === "premium" && (
                    <VocabularyDashboard
                      userInfo={userInfo}
                      isPremium={isPremium}
                      onStartThemedSession={(theme) => {
                        DebugLogger.log('story', 'Starting themed session:', theme);
                        setCurrentView("stories");
                      }}
                      onStartProgressiveSession={() => {
                        DebugLogger.log('story', 'Starting progressive session');
                        setCurrentView("stories");
                      }}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
        
        {/* System health badge removed for cleaner interface */}
        {/* <DismissibleSystemStatus className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto z-40" /> */}
      </SidebarProvider>
    </MobileKeyboardHandler>
  );
};
