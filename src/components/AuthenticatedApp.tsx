import { useState, useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import { MobileKeyboardHandler } from "@/components/MobileKeyboardHandler";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserInfoForm } from "@/components/UserInfoForm";
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
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserInfo, Grade, LanguageCode, LearningGoal, SessionStats } from "@/types";
import { AdaptiveEnhancedLoading } from "@/components/AdaptiveEnhancedLoading";

import { convertImagesToRecord } from "@/utils/imageUtils";

interface AuthenticatedAppProps {
  user: User;
}

type AppView = "stories" | "library" | "profile" | "parent" | "account" | "reading" | "progress" | "premium";

export const AuthenticatedApp = ({ user }: AuthenticatedAppProps) => {
  const [currentView, setCurrentView] = useState<AppView>("stories");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [devTestMode, setDevTestMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentStory, setCurrentStory] = useState<any>(null);
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
    loadUserProfile();
    checkSubscription();
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

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!error && data?.subscribed) {
        setIsPremium(true);
        setSubscriptionTier(data.subscription_tier || 'Premium');
        setSubscriptionEnd(data.subscription_end);
      } else {
        setIsPremium(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      DebugLogger.error('auth', 'Failed to check subscription', error);
      // Fallback to check database directly
      try {
        const { data, error: dbError } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier, subscription_end')
          .eq('user_id', user.id)
          .single();

        if (!dbError && data?.subscribed) {
          setIsPremium(true);
          setSubscriptionTier(data.subscription_tier || 'Premium');
          setSubscriptionEnd(data.subscription_end);
        }
      } catch (dbError) {
        DebugLogger.error('auth', 'Failed to check subscription from database', dbError);
      }
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
          difficultyLevel: (profile as any).difficulty_level || profile.reading_level || 'beginner',
          interests: profile.interests || [],
          learningGoal: 'improve-english-reading' as LearningGoal,
          avatar: typeof (profile as any).avatar === 'string' ? JSON.parse((profile as any).avatar) : ((profile as any).avatar || { type: 'prefer-not-to-answer', skinTone: 'medium' }),
          favoriteColor: (profile as any).favorite_color || 'blue',
          favoriteAnimal: (profile as any).favorite_animal || 'cat',
          hobbies: (profile as any).hobbies || '',
          favoriteFood: (profile as any).favorite_food || '',
          specialRequest: (profile as any).special_request || ''
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
      DebugLogger.log('auth', 'Profile update started for user:', user.id);
      DebugLogger.log('auth', 'Updated user info:', JSON.stringify(updatedUserInfo, null, 2));
      
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

      DebugLogger.log('auth', 'Payload to save:', JSON.stringify(payload, null, 2));

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

      DebugLogger.log('auth', 'Existing profile check:', existing ? 'Found existing profile' : 'No existing profile');

      let error;
      if (existing?.id) {
        DebugLogger.log('auth', 'Updating existing profile...');
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', user.id);
        error = updateErr;
        
        if (!updateErr) {
          DebugLogger.log('auth', 'Profile updated successfully');
        }
      } else {
        DebugLogger.log('auth', 'Creating new profile...');
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert([{ user_id: user.id, ...payload }]);
        error = insertErr;
        
        if (!insertErr) {
          DebugLogger.log('auth', 'Profile created successfully');
        }
      }

      if (error) {
        DebugLogger.error('auth', 'Database operation error', error);
        throw error;
      }

      // Verify the update was successful
      DebugLogger.log('auth', 'Verifying profile update...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('display_name, updated_at')
        .eq('user_id', user.id)
        .single();

      if (verifyError) {
        DebugLogger.error('auth', 'Error verifying update', verifyError);
      } else {
        DebugLogger.log('auth', 'Verification successful', {
          saved_name: verifyData.display_name,
          expected_name: updatedUserInfo.name,
          updated_at: verifyData.updated_at
        });
      }

      setUserInfo(updatedUserInfo);
      setIsEditingProfile(false);
      
      DebugLogger.log('auth', 'Profile update completed successfully');
    } catch (error) {
      DebugLogger.error('auth', 'Profile update error', error);
      throw error;
    }
  };

  if (loading) {
    return <AdaptiveEnhancedLoading isPremium={isPremium} />;
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Time2Read!</h1>
              <p className="text-gray-600">Let's set up your reading profile</p>
            </div>
            <UserInfoForm
              onSubmit={async (info) => {
                await handleInitialProfileSetup(info);
              }}
              onBack={() => {}}
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
            onViewChange={(view: string) => setCurrentView(view as AppView)}
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

            <main className="flex-1 min-h-0 overflow-auto md:overflow-hidden overscroll-contain p-2 sm:p-4 md:p-6">
              {/* Email verification banner for unverified premium users */}
              <EmailVerificationBanner user={user} />
              
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
                      onSessionEnded={handleSessionEnded}
                    />
                  )}

                  {currentView === "library" && (
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
                               if ((story as any).imageCacheMetadata) {
                                 DebugLogger.log('image', 'Loading images from story imageCacheMetadata');
                                 cachedImages = convertImagesToRecord((story as any).imageCacheMetadata, 'Story metadata');
                               }
                               // Priority 2: Load from legacy image_cache_metadata field
                               else if ((story as any).image_cache_metadata) {
                                 DebugLogger.log('image', 'Loading images from legacy image_cache_metadata');
                                cachedImages = convertImagesToRecord((story as any).image_cache_metadata, 'Legacy metadata');
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
                                    console.warn(`🖼️ Invalid image URL for page ${index}:`, url);
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
                             console.error('Failed to load story:', error);
                             setCurrentStory(story);
                             setCurrentView("reading");
                           }
                         }}
                         onStartNewStory={() => setCurrentView("stories")}
                         currentStory={currentStory}
                         pageImages={currentPageImages}
                       />
                    </div>
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

                  {currentView === "reading" && currentStory && (
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
