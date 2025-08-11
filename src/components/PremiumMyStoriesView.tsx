import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import CleanStoryDisplay from "@/components/CleanStoryDisplay";
import type { UserInfo, Story, SessionStats } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { voiceCommands } from "@/config/audioConfig";
import { useChildProfiles } from "@/hooks/useChildProfiles";

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
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const { activeChild } = useChildProfiles();

  // Check if user has read stories before to prevent auto-tutorial
  useEffect(() => {
    const hasReadStoriesBefore = localStorage.getItem(`user_${userInfo.name}_has_read_stories`);
    setShowTutorial(!hasReadStoriesBefore);
  }, [userInfo.name]);

  useEffect(() => {
    console.log('🧭 PremiumMyStoriesView currentView:', currentView);
  }, [currentView]);

  useEffect(() => {
    const openHelp = (_e?: Event) => {
      if (currentView !== 'library') {
        setCurrentView('library');
        setTimeout(() => setShowVoiceHelp(true), 0);
      } else {
        setShowVoiceHelp(true);
      }
    };
    window.addEventListener('voice:openHelp', openHelp as EventListener);
    return () => window.removeEventListener('voice:openHelp', openHelp as EventListener);
  }, [currentView]);

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

    const effectiveUserInfo: UserInfo = (activeChild ? {
      ...userInfo,
      name: activeChild.display_name || userInfo.name,
      grade: normalizeGrade((activeChild.grade_level as any)) || userInfo.grade,
      storyLanguagePreference: (activeChild.story_language_preference as any) || userInfo.storyLanguagePreference,
      avatar: (activeChild.avatar as any) || userInfo.avatar,
      specialRequest,
    } : { ...userInfo, specialRequest });

    const readingAsName = activeChild?.display_name && activeChild.display_name !== userInfo.name
      ? activeChild.display_name
      : undefined;

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
        
        <div className="flex items-center gap-2">
          <Button variant="link" className="text-sm" onClick={() => setShowVoiceHelp(true)}>
            Voice commands
          </Button>
          <Button 
            onClick={() => setRequestDialogOpen(true)}
            className="bg-gradient-primary hover:bg-gradient-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Story
          </Button>
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


      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Any special requests for this new story?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Optional: themes, characters, settings (e.g., space cats, time travel, treasure maps)"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setRequestDialogOpen(false);
                setCurrentStory(null);
                setCurrentView('reading');
                localStorage.setItem(`user_${userInfo.name}_has_read_stories`, 'true');
              }}
            >
              Start Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Voice Commands Help */}
      <Dialog open={showVoiceHelp} onOpenChange={setShowVoiceHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Voice Commands</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(voiceCommands).map(([category, cmds]) => (
              <div key={category}>
                <h3 className="text-sm font-medium capitalize text-muted-foreground">{category}</h3>
                <ul className="mt-2 space-y-1">
                  {Object.keys(cmds as Record<string, unknown>).map((phrase) => (
                    <li key={phrase} className="text-sm text-foreground">• {phrase.replace('*', '[word]')}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Examples: “what does [word] mean”, “how do you say [word]”, “save word [word]”
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};