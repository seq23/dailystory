import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, BookOpen, Clock, TrendingUp, Target, BookText, Crown, Sparkles, Star, Volume2, FileText, Lightbulb, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UserInfo } from "@/types";
import { ComprehensionQuiz } from "@/components/ComprehensionQuiz";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { MiniGames } from "@/components/MiniGames";
import { VoiceQuiz } from "@/components/VoiceQuiz";
import { Badge } from "@/components/ui/badge";
import { StorySessionCache } from "@/services/storySessionCache";
import { useGameContext } from "@/components/GameContextProvider";
import { DebugLogger } from "@/services/DebugLogger";

interface ReadingStats {
  wordsRead: number;
  timeSpent: number;
  pagesRead: number;
  totalPages: number;
  accuracy: number;
  currentDifficulty: string;
}

interface SessionEndedProps {
  onHome?: () => void;
  onNewStory?: () => void;
  sessionStats?: ReadingStats;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const SessionEnded = ({ onHome, onNewStory, isPremium = false, onUpgrade }: SessionEndedProps) => {
  const { t, i18n } = useTranslation();
const location = useLocation();
  const navigate = useNavigate();

  // Clear any remaining caches and URL params on component mount as fallback
  React.useEffect(() => {
    const clearRemainingCaches = async () => {
      try {
        const { SessionCacheManager } = await import('@/services/SessionCacheManager');
        const urlParams = new URLSearchParams(location.search);
        const statsParam = urlParams.get('stats');
        let avatarInfo = null;
        
        if (statsParam) {
          try {
            const parsedStats = JSON.parse(decodeURIComponent(statsParam));
            avatarInfo = parsedStats.avatar;
          } catch {}
        }
        
        SessionCacheManager.clearAllSessionCaches({
          userId: userIsPremium ? 'authenticated' : 'guest',
          avatarType: avatarInfo?.type,
          skinTone: avatarInfo?.skinTone,
          reason: 'session-end'
        });
      } catch (error) {
        console.warn('Fallback cache clearing failed:', error);
      }
    };

    // Clear story session URL parameters from browser history
    const clearUrlHistory = () => {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.has('session') || urlParams.has('page') || urlParams.has('total') || urlParams.has('title')) {
        DebugLogger.log('ui', 'SessionEnded: Clearing story URL parameters from history');
        window.history.replaceState(null, '', '/');
      }
    };
    
    clearRemainingCaches();
    clearUrlHistory();
  }, [location.search]);

  // Ensure language is properly loaded from localStorage on component mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language && savedLanguage !== 'en-US') {
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

  // Harden premium detection with global flag from AuthWrapper
  try {
    const globalPremium = (window as any).__IS_PREMIUM === true;
    if (globalPremium) userIsPremium = true;
  } catch {}

  // Post-session activity data (with fallbacks)
  let userInfoFromState = (location.state?.userInfo as UserInfo | undefined);
  let storyText = (location.state?.storyText as string | undefined);
  
  // Fallback: sessionStorage persisted at session end
  try {
    if (!userInfoFromState) {
      const ui = sessionStorage.getItem('last_user_info');
      if (ui) userInfoFromState = JSON.parse(ui) as UserInfo;
    }
  } catch (e) {
    console.warn('Failed to parse last_user_info', e);
  }
  try {
    if (!storyText) {
      const st = sessionStorage.getItem('last_story_text');
      if (st) storyText = st;
    }
  } catch {}

  // Fallback: cached story pages (best-effort)
  try {
    if (!storyText) {
      const cacheId = userIsPremium ? (localStorage.getItem('user_display_name') || 'premium') : 'guest';
      const cached = StorySessionCache.getCachedStorySession(cacheId);
      if (cached?.pages?.length) {
        storyText = cached.pages.join(' ');
      }
    }
  } catch {}

  const [quizVisible, setQuizVisible] = React.useState(false);
  const [voiceQuizVisible, setVoiceQuizVisible] = React.useState(false);
  const [vocabVisible, setVocabVisible] = React.useState(false);
  const [gamesVisible, setGamesVisible] = React.useState(false);

  // Check if we should start voice quiz immediately
  React.useEffect(() => {
    if (sessionStats?.startVoiceQuiz && userIsPremium) {
      setVoiceQuizVisible(true);
    }
  }, [sessionStats, userIsPremium]);
  const canLaunchActivities = Boolean(userIsPremium && userInfoFromState && storyText);
  const isQuizAllowed = Boolean(userIsPremium && sessionStats && sessionStats.currentDifficulty !== 'beginner');
  
  // Debug data availability for quiz
  React.useEffect(() => {
    DebugLogger.log('ui', 'Quiz data debug', {
      userIsPremium,
      hasUserInfo: !!userInfoFromState,
      hasStoryText: !!storyText,
      storyTextLength: storyText?.length || 0,
      canLaunchActivities,
      isQuizAllowed,
      sessionStats: sessionStats ? 'present' : 'missing'
    });
  }, [userIsPremium, userInfoFromState, storyText, canLaunchActivities, isQuizAllowed, sessionStats]);
  
  // Get achievements and progress data from this session
  let sessionAchievements: any[] = [];
  let gameContext: any = null;
  let sessionStartStats: any = null;
  
  try {
    gameContext = useGameContext();
    const sessionAchievementsStr = sessionStorage.getItem('session_achievements');
    if (sessionAchievementsStr) {
      sessionAchievements = JSON.parse(sessionAchievementsStr);
      sessionStorage.removeItem('session_achievements'); // Clear after reading
    }
    
    // Get session start stats for before/after comparison
    const sessionStartStatsStr = sessionStorage.getItem('session_start_stats');
    if (sessionStartStatsStr) {
      sessionStartStats = JSON.parse(sessionStartStatsStr);
      sessionStorage.removeItem('session_start_stats'); // Clear after reading
    }
  } catch {
    // Graceful fallback if no game context
  }


  // Handle navigation based on user type with additional cache clearing
const handleHome = async () => {
    // Ensure caches are fully cleared before going home
    try {
      const { SessionCacheManager } = await import('@/services/SessionCacheManager');
      SessionCacheManager.clearAllSessionCaches({
        userId: userIsPremium ? 'authenticated' : 'guest',
        reason: 'navigation-home'
      });
    } catch {}
    // Clear URL history and navigate to clean home
    window.history.replaceState(null, '', '/');
    navigate('/');
  };

  const handleNewStory = async () => {
    // Clear caches before starting new story session
    try {
      const { SessionCacheManager } = await import('@/services/SessionCacheManager');
      SessionCacheManager.clearAllSessionCaches({
        userId: userIsPremium ? 'authenticated' : 'guest', 
        reason: 'new-session'
      });
    } catch {}
    // Clear URL history and navigate to new story
    window.history.replaceState(null, '', '/');
    navigate('/?action=new-story');
  };

  const handleStartTimed = () => {
    navigate('/?action=new-story');
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return t("readingPreferences.form.labels.options.beginner", "Beginner");
      case "easy": return t("readingPreferences.form.labels.options.preReader", "Pre‑Reader");
      case "medium": return t("readingPreferences.form.labels.options.developing", "Developing");
      case "hard": return t("readingPreferences.form.labels.options.independent", "Independent");
      case "expert": return t("readingPreferences.form.labels.options.advanced", "Advanced");
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {userIsPremium ? t("sessionEnded.premiumCompleted", "Premium Session Completed!") : t("sessionEnded.completed", "Reading Session Completed!")}
              <Badge variant={userIsPremium ? 'premium' : 'guest'} className="text-xs">
                {userIsPremium ? t('badges.premium', 'Premium') : t('badges.guest', 'Guest')}
              </Badge>
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
                  <div className="text-2xl font-bold text-green-700">{formatTime(Math.round((sessionStats.timeSpent > 1000 ? sessionStats.timeSpent/1000 : sessionStats.timeSpent)))}</div>
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
                    <span>{t("sessionEnded.premiumBenefits.unlimitedTime", "Unlimited reading time")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.personalizedDifficulty", "Personalized difficulty adjustments as your child improves")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.curatedLibrary", "Curated story library and recommendations")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.parentDashboard", "Parent dashboard with insights and analytics")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.liveStoryGeneration", "Personalized live story generation (Your story doesn't end until you decide!)")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.multipleProfiles", "Multiple child profiles")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.vocabularyTracking", "Vocabulary tracking and practice quizzes")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>{t("sessionEnded.premiumBenefits.readAloudFeedback", "Read-aloud feedback (speech-to-text coaching)")}</span>
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
          
          {/* Post-Session Activities */}
          <div className="space-y-3">
            {userIsPremium ? (
              <div className="grid md:grid-cols-3 gap-3">
                <Card className="p-4 text-left">
                  <div className="font-semibold mb-1">{t('postSession.quizTitle', 'Comprehension Quiz')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.quizDesc', 'Quick 3–5 questions based on your story.')}</p>
                  <Button 
                    disabled={!canLaunchActivities || !isQuizAllowed} 
                    onClick={() => {
                      DebugLogger.log('ui', 'Quiz button clicked', { canLaunchActivities, isQuizAllowed, userInfoFromState, storyText });
                      if (canLaunchActivities && isQuizAllowed) {
                        setQuizVisible(true);
                      } else {
                        DebugLogger.warn('ui', 'Quiz launch blocked - missing data', { 
                          hasUserInfo: !!userInfoFromState, 
                          hasStoryText: !!storyText,
                          canLaunch: canLaunchActivities,
                          quizAllowed: isQuizAllowed
                        });
                      }
                    }} 
                    className="w-full"
                  >
                    {t('postSession.startQuiz', 'Start Quiz')}
                  </Button>
                  {!canLaunchActivities && (
                    <div className="text-xs text-orange-600 mt-2">
                      {!userInfoFromState && !storyText ? 'Missing user info and story data' : 
                       !userInfoFromState ? 'Missing user info' :
                       !storyText ? 'Missing story data' : 
                       t('postSession.unavailable', 'Unavailable: missing story data')}
                    </div>
                  )}
                  {!isQuizAllowed && canLaunchActivities && (
                    <div className="text-xs text-orange-600 mt-2">Quiz not available for beginner level</div>
                  )}
                </Card>
                <Card className="p-4 text-left">
                  <div className="font-semibold mb-1">{t('postSession.vocabTitle', 'Review Vocabulary')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.vocabDesc', 'See words you encountered and practice.')}</p>
                  <Button disabled={!userInfoFromState} onClick={() => setVocabVisible(true)} className="w-full">
                    {t('postSession.reviewVocab', 'Review Vocabulary')}
                  </Button>
                </Card>
                <Card className="p-4 text-left">
                  <div className="font-semibold mb-1">{t('postSession.gamesTitle', 'Play Reading Games')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.gamesDesc', 'Fun mini‑games from your story')}</p>
                  <Button disabled={!canLaunchActivities} onClick={() => setGamesVisible(true)} className="w-full">
                    {t('postSession.playGames', 'Play Games')}
                  </Button>
                  {!canLaunchActivities && (
                    <div className="text-xs text-orange-600 mt-2">{t('postSession.unavailable', 'Unavailable: missing story data')}</div>
                  )}
                </Card>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                <Card className="p-4 text-left opacity-80">
                  <div className="font-semibold mb-1">{t('postSession.quizTitle', 'Comprehension Quiz')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.premiumOnly', 'Premium feature')}</p>
                  {onUpgrade && (
                    <Button onClick={onUpgrade} className="w-full">{t('sessionEnded.premiumBenefits.upgradeToPremium', 'Upgrade to Premium')}</Button>
                  )}
                </Card>
                <Card className="p-4 text-left opacity-80">
                  <div className="font-semibold mb-1">{t('postSession.vocabTitle', 'Review Vocabulary')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.premiumOnly', 'Premium feature')}</p>
                  {onUpgrade && (
                    <Button onClick={onUpgrade} className="w-full">{t('sessionEnded.premiumBenefits.upgradeToPremium', 'Upgrade to Premium')}</Button>
                  )}
                </Card>
                <Card className="p-4 text-left opacity-80">
                  <div className="font-semibold mb-1">{t('postSession.gamesTitle', 'Play Reading Games')}</div>
                  <p className="text-sm text-gray-600 mb-2">{t('postSession.premiumOnly', 'Premium feature')}</p>
                  {onUpgrade && (
                    <Button onClick={onUpgrade} className="w-full">{t('sessionEnded.premiumBenefits.upgradeToPremium', 'Upgrade to Premium')}</Button>
                  )}
                </Card>
              </div>
            )}
          </div>

          {/* Progress Made This Session */}
          {gameContext && sessionStartStats && sessionStats && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  {t("sessionEnded.progressMilestones", "Progress Made This Session")}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {/* Words Progress */}
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <BookText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-blue-600 mb-1">{t("progress.words", "Words Read")}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-500">
                    <span>{sessionStartStats.totalWordsRead || 0}</span>
                    <span>→</span>
                    <span className="font-bold">{(sessionStartStats.totalWordsRead || 0) + sessionStats.wordsRead}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-700">+{sessionStats.wordsRead}</div>
                </div>
                
                {/* Pages Progress */}
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-green-600 mb-1">{t("progress.pages", "Pages Read")}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-green-500">
                    <span>{Math.floor((sessionStartStats.totalWordsRead || 0) / 200)}</span>
                    <span>→</span>
                    <span className="font-bold">{Math.floor(((sessionStartStats.totalWordsRead || 0) + sessionStats.wordsRead) / 200)}</span>
                  </div>
                  <div className="text-lg font-bold text-green-700">+{sessionStats.pagesRead}</div>
                </div>
                
                {/* Vocabulary Progress */}
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <Lightbulb className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-sm text-amber-600 mb-1">{t("progress.vocabulary", "Vocabulary")}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-500">
                    <span>{sessionStartStats.vocabularyWordsLearned || 0}</span>
                    <span>→</span>
                    <span className="font-bold">{(sessionStartStats.vocabularyWordsLearned || 0) + (gameContext.userStats.vocabularyWordsLearned - (sessionStartStats.vocabularyWordsLearned || 0))}</span>
                  </div>
                  <div className="text-lg font-bold text-amber-700">+{Math.max(0, gameContext.userStats.vocabularyWordsLearned - (sessionStartStats.vocabularyWordsLearned || 0))}</div>
                </div>
                
                {/* Time Progress */}
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-purple-600 mb-1">{t("progress.time", "Minutes")}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-purple-500">
                    <span>{Math.floor((sessionStartStats.totalTimeReading || 0) / 60)}</span>
                    <span>→</span>
                    <span className="font-bold">{Math.floor((sessionStartStats.totalTimeReading || 0) / 60) + Math.floor(sessionStats.timeSpent / 60)}</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">+{Math.floor(sessionStats.timeSpent / 60)}</div>
                </div>
              </div>
              
              {/* Level Progress */}
              {gameContext.userStats.currentLevel > (sessionStartStats.currentLevel || 1) && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                    <h4 className="text-lg font-bold text-yellow-700">
                      {t("sessionEnded.levelUp", "Level Up!")}
                    </h4>
                  </div>
                  <p className="text-sm text-yellow-600">
                    {t("sessionEnded.levelProgress", "You advanced from level {{from}} to level {{to}}!", {
                      from: sessionStartStats.currentLevel || 1,
                      to: gameContext.userStats.currentLevel
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Badge Collection Display */}
          {gameContext && gameContext.userStats.badges && gameContext.userStats.badges.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  {t("sessionEnded.badgeCollection", "Badge Collection")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("sessionEnded.badgesEarned", "{{count}} badges earned", { count: gameContext.userStats.badges.length })}
                </p>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {gameContext.userStats.badges.slice(-16).map((badge: any, index: number) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="text-xl sm:text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-medium text-gray-700 truncate" title={badge.name}>
                      {badge.name.split(' ')[0]}
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full mx-auto mt-1" 
                      style={{ backgroundColor: badge.color }}
                    />
                  </div>
                ))}
              </div>
              
              {gameContext.userStats.badges.length > 16 && (
                <div className="text-center text-sm text-gray-500">
                  {t("sessionEnded.moreRankBadges", "...and {{count}} more badges!", { 
                    count: gameContext.userStats.badges.length - 16 
                  })}
                </div>
              )}
            </div>
          )}

          {/* Achievements Earned This Session */}
          {sessionAchievements.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-bold text-yellow-700">
                  {t("sessionEnded.achievementsEarned", "Achievements Earned This Session!")}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sessionAchievements.slice(0, 4).map((achievement, index) => (
                  <div 
                    key={`${achievement.id}-${index}`}
                    className="bg-white/80 rounded-lg p-3 border border-yellow-200/50 flex items-center gap-3"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-yellow-800 text-sm truncate">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-yellow-600 truncate">
                        {achievement.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-700">+{achievement.points}</div>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-yellow-300 text-yellow-700"
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {sessionAchievements.length > 4 && (
                <div className="text-center text-sm text-yellow-600">
                  + {sessionAchievements.length - 4} more achievements unlocked!
                </div>
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
          </div>
        {/* Modals */}
        {quizVisible && userInfoFromState && storyText && (
          <ComprehensionQuiz
            userInfo={userInfoFromState}
            storyText={storyText}
            isVisible={quizVisible}
            onComplete={() => setQuizVisible(false)}
            onClose={() => setQuizVisible(false)}
          />
        )}
        {gamesVisible && userInfoFromState && storyText && (
          <MiniGames
            userInfo={userInfoFromState}
            storyText={storyText}
            isVisible={gamesVisible}
            onComplete={() => setGamesVisible(false)}
            onClose={() => setGamesVisible(false)}
          />
        )}
        {vocabVisible && userInfoFromState && (
          <VocabularyCollector
            userInfo={userInfoFromState}
            isVisible={vocabVisible}
            onClose={() => setVocabVisible(false)}
            enablePersistence={userIsPremium}
          />
        )}
        {voiceQuizVisible && userInfoFromState && storyText && (
          <VoiceQuiz
            userInfo={userInfoFromState}
            storyText={storyText}
            isVisible={voiceQuizVisible}
            storyTitle={(window as any).__storyTitle || ''}
            onComplete={() => setVoiceQuizVisible(false)}
            onClose={() => setVoiceQuizVisible(false)}
          />
        )}

        </CardContent>
      </Card>
    </div>
  );
};

export default SessionEnded;