import { useState, useEffect } from "react";
import { MobileKeyboardHandler } from "@/components/MobileKeyboardHandler";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserInfoForm } from "@/components/UserInfoForm";
import StoryDisplay from "@/components/StoryDisplay";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, BarChart3, Settings, LogOut } from "lucide-react";
import type { UserInfo, Grade, LanguageCode, LearningGoal } from "@/types";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { SystemStatus } from "@/components/SystemStatus";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

interface AuthenticatedAppProps {
  user: User;
}

type AppView = "profile" | "story" | "progress" | "parent";

export const AuthenticatedApp = ({ user }: AuthenticatedAppProps) => {
  const [currentView, setCurrentView] = useState<AppView>("profile");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  // Initialize security monitoring
  useSecurityMonitoring();

  // Check for query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new-story') {
      // User came from session ended page wanting to start new story
      setCurrentView("profile");
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
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { user_id: user.id }
      });

      if (!error && data?.subscribed) {
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
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
          avatar: (profile as any).avatar || { type: 'boy', skinTone: 'medium' }, // Load from profile or default
          favoriteColor: (profile as any).favorite_color || '#3B82F6',
          favoriteAnimal: (profile as any).favorite_animal || 'cat',
          hobbies: (profile as any).hobbies || '',
          favoriteFood: (profile as any).favorite_food || '',
          specialRequest: (profile as any).special_request || ''
        };
        setUserInfo(userInfoData);
        setCurrentView("story");
      }
    } catch (error) {
      console.error('Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (info: UserInfo) => {
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
      setCurrentView("story");
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
              onSubmit={handleProfileUpdate}
              onBack={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileKeyboardHandler>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Time2Read</h1>
                <p className="text-sm text-gray-600">Welcome back, {userInfo.name}!</p>
              </div>
            </div>
            <MobileOptimizedButton onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </MobileOptimizedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as AppView)}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-6 mobile-safe-area">
            <TabsTrigger value="story" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="parent" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Parent</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story">
            <StoryDisplay
              userInfo={userInfo}
              onHome={() => setCurrentView("progress")}
              onNewStory={() => setCurrentView("profile")}
              onSessionEnded={(stats) => {
                // Navigate to SessionEnded page with stats
                window.location.href = `/session-ended?stats=${encodeURIComponent(JSON.stringify({...stats, isPremium}))}`
              }}
              isPremium={isPremium}
              onUpgrade={() => setCurrentView("progress")}
            />
          </TabsContent>

          <TabsContent value="progress">
            {userInfo && (
              <ProgressDashboard
                userInfo={userInfo}
                isVisible={true}
                onClose={() => {}}
                isPremium={isPremium}
              />
            )}
          </TabsContent>

          <TabsContent value="parent">
            {userInfo && (
              <ParentDashboard
                userInfo={userInfo}
                isVisible={true}
                onClose={() => {}}
              />
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
            <UserInfoForm
              onSubmit={handleProfileUpdate}
              onBack={() => setCurrentView("story")}
            />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <SecurityDashboard />
      <SystemStatus className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto z-40" />
    </div>
    </MobileKeyboardHandler>
  );
};