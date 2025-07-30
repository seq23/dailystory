import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, BookOpen, Clock, TrendingUp, Target, BookText } from "lucide-react";
import { useLocation } from "react-router-dom";

interface ReadingStats {
  wordsRead: number;
  timeSpent: number;
  pagesRead: number;
  totalPages: number;
  accuracy: number;
  currentDifficulty: string;
}

interface SessionEndedProps {
  onHome: () => void;
  onNewStory: () => void;
  sessionStats?: ReadingStats;
}

const SessionEnded = ({ onHome, onNewStory }: SessionEndedProps) => {
  const location = useLocation();
  const sessionStats = location.state?.sessionStats;
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Pre-K - 1st Grade";
      case "medium": return "2nd - 3rd Grade";
      case "hard": return "4th - 5th Grade";
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-amber-200">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-amber-100 rounded-full p-4">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Session Completed!
            </h1>
            <p className="text-gray-600">
              Great job on completing your reading session!
            </p>
          </div>

          {/* Session Stats */}
          {sessionStats && (
            <div className="space-y-4">
              {/* Reading Progress Bar */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">
                    Reading Progress
                  </span>
                  <span className="text-sm text-purple-600">
                    {sessionStats.pagesRead} of {sessionStats.totalPages} pages
                  </span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(sessionStats.pagesRead / sessionStats.totalPages) * 100}%`,
                      minWidth: sessionStats.totalPages > 0 ? `${100 / sessionStats.totalPages}%` : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <BookText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{sessionStats.wordsRead}</div>
                  <div className="text-sm text-blue-600">Words Read</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{formatTime(sessionStats.timeSpent)}</div>
                  <div className="text-sm text-green-600">Time Spent</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">{sessionStats.accuracy}%</div>
                  <div className="text-sm text-orange-600">Accuracy</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-700">{getDifficultyLabel(sessionStats.currentDifficulty)}</div>
                  <div className="text-sm text-purple-600">Level</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onHome}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={onNewStory}
              variant="outline"
              className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-3"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start New Story
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionEnded;