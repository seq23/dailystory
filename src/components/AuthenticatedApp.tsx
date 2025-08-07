import { useState, useEffect } from "react";
import { MobileKeyboardHandler } from "@/components/MobileKeyboardHandler";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserInfoForm } from "@/components/UserInfoForm";
import { PremiumProfileEditor } from "@/components/PremiumProfileEditor";
import { PremiumMyStoriesView } from "@/components/PremiumMyStoriesView";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumSidebar } from "@/components/PremiumSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { VocabularyDashboard } from "@/components/VocabularyDashboard";
import { PremiumStoryLibrary } from "@/components/PremiumStoryLibrary";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { DismissibleSystemStatus } from "@/components/DismissibleSystemStatus";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { BookOpen, CreditCard } from "lucide-react";
import type { UserInfo, Grade, LanguageCode, LearningGoal, SessionStats } from "@/types";

interface AuthenticatedAppProps {
  user: User;
}

type AppView = "stories" | "library" | "progress" | "goals" | "profile" | "parent" | "subscription";

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
    }
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
      console.error('Failed to check subscription:', error);
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
        console.error('Failed to check subscription from database:', dbError);
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
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
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
          interests: profile.interests || [],
          learningGoal: 'improve-english-reading' as LearningGoal,
          avatar: typeof (profile as any).avatar === 'string' ? JSON.parse((profile as any).avatar) : ((profile as any).avatar || { type: 'boy', skinTone: 'medium' }),
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
      console.error('Profile loading error:', error);
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
        console.error('Error updating profile:', error);
        return;
      }

      setUserInfo(info);
      setCurrentView("stories");
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSessionEnded = (stats: SessionStats) => {
    // Navigate to SessionEnded page with stats
    window.location.href = `/session-ended?stats=${encodeURIComponent(JSON.stringify({...stats, isPremium}))}`;
  };

  const handleProfileUpdate = async (updatedUserInfo: UserInfo) => {
    try {
      const birthYear = new Date().getFullYear() - updatedUserInfo.age;
      const dateOfBirth = `${birthYear}-01-01`;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
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
        });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setUserInfo(updatedUserInfo);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your reading profile...</p>
        </div>
      </div>
    );
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
          
          <div className="flex-1 flex flex-col min-w-0">
            <PremiumHeader
              userInfo={userInfo}
              isPremium={isPremium}
              devTestMode={devTestMode}
              subscriptionTier={subscriptionTier || undefined}
              onSignOut={handleSignOut}
              onToggleDevMode={toggleDevTestMode}
              onProfileClick={() => setIsEditingProfile(true)}
            />

            <main className="flex-1 p-6 overflow-auto">
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
                        onLoadStory={(story) => {
                          // Handle story loading
                          console.log("Loading story:", story);
                        }}
                        onStartNewStory={() => setCurrentView("stories")}
                      />
                    </div>
                  )}

                  {currentView === "progress" && userInfo && (
                    <ProgressDashboard
                      userInfo={userInfo}
                      isVisible={true}
                      onClose={() => {}}
                      isPremium={isPremium}
                    />
                  )}

                  {currentView === "goals" && userInfo && (
                    <VocabularyDashboard
                      userInfo={userInfo}
                      isPremium={isPremium}
                      onStartThemedSession={() => setCurrentView("stories")}
                      onStartProgressiveSession={() => setCurrentView("stories")}
                    />
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

                  {currentView === "subscription" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary/20 rounded-full">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">Premium Features</h1>
                          <p className="text-muted-foreground">Manage your subscription and features</p>
                        </div>
                      </div>
                      <SubscriptionManager />
                      {subscriptionEnd && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-2">Subscription Details</h3>
                          <div className="text-sm text-blue-700">
                            <p><strong>Status:</strong> {isPremium ? 'Active' : 'Inactive'}</p>
                            {subscriptionTier && <p><strong>Plan:</strong> {subscriptionTier}</p>}
                            {subscriptionEnd && (
                              <p><strong>Next Billing:</strong> {new Date(subscriptionEnd).toLocaleDateString()}</p>
                            )}
                            {devTestMode && (
                              <p className="text-orange-600 font-medium">⚠️ Developer Test Mode Active</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
        <SecurityDashboard />
        <DismissibleSystemStatus className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto z-40" />
      </SidebarProvider>
    </MobileKeyboardHandler>
  );
};