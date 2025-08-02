import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, BookOpen, Clock, TrendingUp, Target, BookText, Crown, Sparkles, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const SessionEnded = ({ onHome, onNewStory, isPremium = false, onUpgrade }: SessionEndedProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Ensure language is properly loaded from localStorage on component mount
  React.useEffect(() => {
    console.log('SessionEnded: Current language:', i18n.language);
    console.log('SessionEnded: Available languages:', Object.keys(i18n.options.resources || {}));
    
    const savedLanguage = localStorage.getItem('i18nextLng');
    console.log('SessionEnded: Saved language in localStorage:', savedLanguage);
    
    if (savedLanguage && savedLanguage !== i18n.language && savedLanguage !== 'en-US') {
      console.log('SessionEnded: Changing language to:', savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  
  // Get stats from URL parameters or location state
  let sessionStats = location.state?.sessionStats;
  let userIsPremium = isPremium;
  
  // Check for stats in URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const statsParam = urlParams.get('stats');
  if (statsParam) {
    try {
      const parsedStats = JSON.parse(decodeURIComponent(statsParam));
      sessionStats = parsedStats;
      userIsPremium = parsedStats.isPremium || false;
    } catch (error) {
      console.error('Failed to parse stats from URL:', error);
    }
  }

  // Handle navigation based on user type
  const handleHome = () => {
    window.history.pushState(null, '', '/');
    window.location.reload();
  };

  const handleNewStory = () => {
    // Both user types now go to the form/profile page via query parameter
    // This provides a consistent experience where users can review/update their info
    window.history.pushState(null, '', '/?action=new-story');
    window.location.reload();
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return t("storyDisplay.difficultyLabels.easy", "Pre-K - 1st Grade");
      case "medium": return t("storyDisplay.difficultyLabels.medium", "2nd - 3rd Grade");
      case "hard": return t("storyDisplay.difficultyLabels.hard", "4th - 5th Grade");
      case "expert": return t("storyDisplay.difficultyLabels.expert", "6th Grade+");
      default: return difficulty;
    }
  };

  const getEncouragementMessage = () => {
    if (!sessionStats) return t("storyDisplay.encouragementMessages.great", "Great job on completing your reading session!");
    
    if (sessionStats.pagesRead >= 8) {
      return t("storyDisplay.encouragementMessages.outstanding", "Outstanding reading achievement! You're becoming a reading champion!");
    } else if (sessionStats.pagesRead >= 5) {
      return t("storyDisplay.encouragementMessages.excellent", "Excellent work! You're making great progress!");
    } else if (sessionStats.pagesRead >= 3) {
      return t("storyDisplay.encouragementMessages.great", "Great start! Keep up the wonderful reading habit!");
    } else {
      return t("storyDisplay.encouragementMessages.everyPage", "Every page counts! You're on your way to becoming a great reader!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-amber-200">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon and Title */}
          <div className="flex justify-center">
            <div className="bg-amber-100 rounded-full p-4">
              <div className="relative">
                <Clock className="w-12 h-12 text-amber-600" />
                {userIsPremium && (
                  <Crown className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2" />
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {userIsPremium ? t("sessionEnded.premiumCompleted", "Premium Session Completed!") : t("sessionEnded.completed", "Reading Session Completed!")}
            </h1>
            <p className="text-gray-600">
              {getEncouragementMessage()}
            </p>
          </div>

          {/* Session Stats */}
          {sessionStats && (
            <div className="space-y-4">
              {/* Reading Progress Bar */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">
                    {t("sessionEnded.readingProgress", "Reading Progress")}
                  </span>
                  <span className="text-sm text-purple-600">
                    {sessionStats.pagesRead} {t("sessionEnded.of", "of")} {sessionStats.totalPages || sessionStats.pagesRead} {t("sessionEnded.pages", "pages")}
                  </span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: sessionStats.totalPages ? 
                        `${(sessionStats.pagesRead / sessionStats.totalPages) * 100}%` : 
                        '100%',
                      minWidth: '8%'
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <BookText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{sessionStats.wordsRead}</div>
                  <div className="text-sm text-blue-600">{t("sessionEnded.wordsRead", "Words Read")}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{formatTime(sessionStats.timeSpent)}</div>
                  <div className="text-sm text-green-600">{t("sessionEnded.timeSpent", "Time Spent")}</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">{sessionStats.accuracy}%</div>
                  <div className="text-sm text-orange-600">{t("sessionEnded.accuracy", "Accuracy")}</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-700">
                    {sessionStats.currentDifficulty ? getDifficultyLabel(sessionStats.currentDifficulty) : t("sessionEnded.readingLevel", "Reading Level")}
                  </div>
                  <div className="text-sm text-purple-600">{t("sessionEnded.level", "Level")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Suggestion for Free Users */}
          {!userIsPremium && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-700">{t("sessionEnded.unlockPremium", "Unlock Premium Benefits!")}</h3>
              </div>
              <div className="space-y-2 text-sm text-amber-600">
                 <div className="flex items-center gap-2">
                   <Star className="w-4 h-4" />
                   <span>{t("sessionEnded.premiumBenefits.unlimitedSessions", "Unlimited reading sessions")}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Sparkles className="w-4 h-4" />
                   <span>{t("sessionEnded.premiumBenefits.customDifficulty", "Custom story difficulty adjustment")}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <BookOpen className="w-4 h-4" />
                   <span>{t("sessionEnded.premiumBenefits.extendedLibrary", "Extended story library with more topics")}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" />
                   <span>{t("sessionEnded.premiumBenefits.advancedTracking", "Advanced progress tracking & analytics")}</span>
                 </div>
              </div>
              {onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3"
                  size="lg"
                >
                   <Crown className="w-5 h-5 mr-2" />
                   {t("sessionEnded.premiumBenefits.upgradeToPremium", "Upgrade to Premium")}
                </Button>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
              <Button
                onClick={handleHome}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                {t("sessionEnded.goToHome", "Go to Home")}
              </Button>
              
              <Button
                onClick={handleNewStory}
                variant="outline"
                className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-3"
                size="lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {t("sessionEnded.startNewStory", "Start New Story")}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionEnded;