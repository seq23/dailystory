import { useState, useEffect } from "react";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UserInfo, SessionStats } from "@/types";

interface StoryDisplayProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
  onHome: () => void;
  onUpgrade: () => void;
  onNewStory: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  userInfo,
  isPremium,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory
}) => {
  const { t } = useTranslation();
  const [story] = useState<string[]>([
    `Hello ${userInfo.name}! Welcome to your reading adventure.`,
    `Today you will discover amazing stories just for you.`,
    `Each page brings new words and exciting adventures.`,
    `Thank you for reading with us today!`
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((currentPage + 1) / story.length) * 100;
  const currentStory = story[currentPage] || "Loading...";

  const handleNewStory = () => {
    onNewStory();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Story...</h2>
          <p className="text-gray-600">Personalizing content for {userInfo.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                {userInfo.name}'s Reading Adventure
              </h1>
            </div>
            <div className="flex gap-2">
              <MobileOptimizedButton onClick={handleNewStory} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Story
              </MobileOptimizedButton>
              <MobileOptimizedButton onClick={onHome} variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </MobileOptimizedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Page {currentPage + 1} of {story.length}
                </p>
              </div>

              {/* Story Content */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                    {currentStory}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <MobileOptimizedButton
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Previous
                </MobileOptimizedButton>

                <span className="text-sm font-medium text-gray-600">
                  {currentPage + 1} / {story.length}
                </span>

                <MobileOptimizedButton
                  onClick={() => {
                    if (currentPage < story.length - 1) {
                      setCurrentPage(currentPage + 1);
                    } else {
                      // Story completed
                      const sessionStats: SessionStats = {
                        timeSpent: 300, // 5 minutes
                        wordsRead: story.join(' ').split(' ').length,
                        pagesRead: story.length,
                        startTime: Date.now() - 300000, // 5 minutes ago
                        accuracy: 100 // 100% accuracy
                      };
                      onSessionEnded(sessionStats);
                    }
                  }}
                  disabled={false}
                >
                  {currentPage === story.length - 1 ? 'Complete' : 'Next'}
                </MobileOptimizedButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StoryDisplay;