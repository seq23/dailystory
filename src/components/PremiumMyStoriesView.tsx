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

interface PremiumMyStoriesViewProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
}

export const PremiumMyStoriesView = ({ userInfo, isPremium, onSessionEnded }: PremiumMyStoriesViewProps) => {
  const [currentView, setCurrentView] = useState<'library' | 'reading'>('library');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has read stories before to prevent auto-tutorial
  useEffect(() => {
    const hasReadStoriesBefore = localStorage.getItem(`user_${userInfo.name}_has_read_stories`);
    setShowTutorial(!hasReadStoriesBefore);
  }, [userInfo.name]);

  const handleLoadStory = (story: Story) => {
    setCurrentStory(story);
    setCurrentView('reading');
    
    // Mark user as having read stories
    localStorage.setItem(`user_${userInfo.name}_has_read_stories`, 'true');
  };

  const handleStartNewStory = () => {
    setCurrentStory(null);
    setCurrentView('reading');
    
    // Mark user as having read stories
    localStorage.setItem(`user_${userInfo.name}_has_read_stories`, 'true');
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setCurrentStory(null);
  };

  if (currentView === 'reading') {
    return (
      <CleanStoryDisplay
        userInfo={userInfo}
        isPremium={isPremium}
        onSessionEnded={(stats) => {
          setCurrentView('library');
          onSessionEnded(stats);
        }}
        onHome={handleBackToLibrary}
        onUpgrade={() => {}}
        onNewStory={handleStartNewStory}
        // Additional props can be added here when CleanStoryDisplay supports them
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
        
        <Button 
          onClick={handleStartNewStory}
          className="bg-gradient-primary hover:bg-gradient-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Button>
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
            onStartNewStory={handleStartNewStory}
            currentStory={currentStory}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleStartNewStory}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Create New Story</h3>
            <p className="text-sm text-muted-foreground">
              Start a fresh adventure with personalized storytelling
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Favorite Stories</h3>
            <p className="text-sm text-muted-foreground">
              Quick access to your most loved stories
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};