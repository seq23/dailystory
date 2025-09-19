import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NewStoryCTA from "@/components/NewStoryCTA";
import { Badge } from "@/components/ui/badge";
import { DebugLogger } from '@/services/DebugLogger';
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Star, 
  StarOff,
  Trash2,
  Play,
  Clock,
  Filter
} from "lucide-react";
import { PremiumStoryLibrary } from "@/components/PremiumStoryLibrary";
import { supabase } from "@/integrations/supabase/client";
import { StorySessionCache } from "@/services/storySessionCache";
import CleanStoryDisplay from "@/components/CleanStoryDisplay";
import type { UserInfo, Story, SessionStats } from "@/types";
import { SpecialRequestDialog } from "@/components/SpecialRequestDialog";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { APP_CONFIG } from "@/config/appConfig";

interface PremiumMyStoriesViewProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
}

export const PremiumMyStoriesView = ({ userInfo, isPremium, onSessionEnded }: PremiumMyStoriesViewProps) => {
  const [currentView, setCurrentView] = useState<'library' | 'reading'>('library');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [specialRequest, setSpecialRequest] = useState("");
  const { activeChild } = useChildProfiles();

  // Normalize grade helper function - moved to top level
  const normalizeGrade = (g: any): any => {
    if (!g) return g;
    const map: Record<string, any> = {
      'Pre-K': 'PreK',
      'K': 'K',
      '1': '1st',
      '2': '2nd',
      '3': '3rd',
      '4': '4th',
      '5': '5th',
      '6': '6th+',
    };
    return map[String(g)] || g;
  };

  // Move useMemo hooks to top level to fix hooks ordering violation
  const effectiveUserInfo: UserInfo = useMemo(() => {
    if (currentView === 'reading') {
      return activeChild ? {
        ...userInfo,
        name: activeChild.display_name || userInfo.name,
        grade: normalizeGrade((activeChild.grade_level as any)) || userInfo.grade,
        storyLanguagePreference: userInfo.storyLanguagePreference, // Use parent's language preference
        avatar: (activeChild.avatar as any) || userInfo.avatar,
        specialRequest,
      } : { ...userInfo, specialRequest };
    }
    return userInfo;
  }, [currentView, activeChild?.display_name, activeChild?.grade_level, activeChild?.avatar, userInfo, specialRequest]);

  const readingAsName = useMemo(() => {
    if (currentView === 'reading') {
      return activeChild?.display_name && activeChild.display_name !== userInfo.name
        ? activeChild.display_name
        : undefined;
    }
    return undefined;
  }, [currentView, activeChild?.display_name, userInfo.name]);

  // Check if user has read stories before to prevent auto-tutorial
  useEffect(() => {
    const hasReadStoriesBefore = localStorage.getItem(`user_${userInfo.name}_has_read_stories`);
    setShowTutorial(!hasReadStoriesBefore);
  }, [userInfo.name]);

  useEffect(() => {
    DebugLogger.log('ui', 'PremiumMyStoriesView currentView:', currentView);
  }, [currentView]);

// Auto-resume reading if allowed and a cached premium session exists and timer not expired
useEffect(() => {
  (async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const allowOverride = APP_CONFIG.features.resumeOnRefresh.allowUrlOverride;
      const viaUrl = allowOverride && urlParams.get('resume') === '1';
      const enableResume = APP_CONFIG.features.resumeOnRefresh.premium || viaUrl;

      let id = userInfo.name || 'premium';
      try { const { data: { user } } = await supabase.auth.getUser(); if (user?.id) id = user.id; } catch {}

      // Safety: clear session via URL
      if (urlParams.get('clearSession') === '1') {
        try {
          sessionStorage.removeItem(`premium.timer.endTs.${id}`);
          sessionStorage.removeItem(`premium.timer.remaining.${id}`);
          StorySessionCache.clearCachedSession(id);
        } catch {}
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (!enableResume) return;

      const cached = StorySessionCache.getCachedStorySession(id);
      const endRaw = Number(sessionStorage.getItem(`premium.timer.endTs.${id}`) || '0');
      if (cached && cached.pages?.length && endRaw > Date.now()) {
        setCurrentView('reading');
      }
    } catch {}
  })();
}, [userInfo?.name]);


  const handleLoadStory = (story: Story) => {
    setCurrentStory(story);
    setCurrentView('reading');
    
    // Mark user as having read stories
    localStorage.setItem(`user_${userInfo.name}_has_read_stories`, 'true');
  };

  const handleStartNewStory = () => {
    setSpecialRequest("");
    setRequestDialogOpen(true);
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setCurrentStory(null);
  };

  if (currentView === 'reading') {
    return (
      <CleanStoryDisplay
        userInfo={effectiveUserInfo}
        isPremium={isPremium}
        onSessionEnded={(stats) => {
          setCurrentView('library');
          onSessionEnded(stats);
        }}
        onHome={handleBackToLibrary}
        onUpgrade={() => {}}
        onNewStory={handleStartNewStory}
        readingAsName={readingAsName}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary/20 rounded-full">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Stories</h1>
            <p className="text-muted-foreground">Your personal story collection</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 -ml-11 sm:-ml-2">
          <NewStoryCTA
            isPremium={isPremium}
            iconOnly={false}
            onNewStory={() => setRequestDialogOpen(true)}
            onUpgrade={() => {}}
            className="rounded-full pl-2 pr-3 sm:pl-3 sm:pr-4 md:px-6 hover-scale justify-start text-left shrink-0"
            size="md"
            wandPulse
            labelOverride="New Story"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stories Read</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reading Time</p>
                <p className="text-2xl font-bold">2.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Story Library */}
      <Card>
        <CardContent className="p-6">
          <PremiumStoryLibrary
            onLoadStory={handleLoadStory}
            onStartNewStory={() => setRequestDialogOpen(true)}
            currentStory={currentStory}
          />
        </CardContent>
      </Card>


      <SpecialRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        initialValue={specialRequest}
        onSubmit={(composed) => {
          setSpecialRequest(composed);
          setRequestDialogOpen(false);
          setCurrentStory(null);
          setCurrentView('reading');
          localStorage.setItem(`user_${userInfo.name}_has_read_stories`, 'true');
        }}
        isGenerating={false}
        mode="new"
      />
    </div>
  );
};