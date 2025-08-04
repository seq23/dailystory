import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Target, TrendingUp, BookOpen, Globe, Star } from 'lucide-react';
import { PremiumVocabularyService } from '../services/premiumVocabularyService';
import { ThemedSessionManager } from '../services/themedSessionManager';
import type { UserInfo, DifficultyLevel } from '../types';

interface VocabularyDashboardProps {
  userInfo: UserInfo;
  isPremium?: boolean;
  onStartThemedSession?: (theme: string) => void;
  onStartProgressiveSession?: () => void;
}

export const VocabularyDashboard: React.FC<VocabularyDashboardProps> = ({
  userInfo,
  isPremium = false,
  onStartThemedSession,
  onStartProgressiveSession
}) => {
  const [vocabularyStats, setVocabularyStats] = useState<any>(null);
  const [sessionProgress, setSessionProgress] = useState<any>(null);
  const [premiumAnalytics, setPremiumAnalytics] = useState<any>(null);
  const [progressReport, setProgressReport] = useState<any>(null);

  useEffect(() => {
    const userId = `${userInfo.name}-${userInfo.age}-${userInfo.nativeLanguage}`.toLowerCase();
    
    // Initialize systems
    PremiumVocabularyService.initializeUserState(userId);
    
    // Load vocabulary statistics
    const stats = PremiumVocabularyService.getVocabularyStats(userId);
    setVocabularyStats(stats);

    // Load session progress
    const sessionInfo = ThemedSessionManager.getSessionProgress(userInfo);
    setSessionProgress(sessionInfo);

    // Load premium features if available
    if (isPremium) {
      const features = PremiumVocabularyService.initializePremiumUser(userInfo);
      const analytics = PremiumVocabularyService.generatePersonalizedVocabularyPath(userInfo);
      const report = PremiumVocabularyService.generateVocabularyProgressReport(userInfo);
      
      setPremiumAnalytics(analytics);
      setProgressReport(report);
    }
  }, [userInfo, isPremium]);

  const getNextThemedSession = () => {
    const difficulty = userInfo.difficultyLevel || 'easy';
    
    if (difficulty === 'easy' || difficulty === 'medium') {
      const themedSession = ThemedSessionManager.generateThemedSession(userInfo, difficulty);
      return themedSession;
    }
    
    return null;
  };

  const renderLevel1Progress = () => {
    if (!vocabularyStats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {vocabularyStats.level1Progress.map((category: any) => (
          <Card key={category.category} className="p-4">
            <div className="text-sm font-medium capitalize mb-2">
              {category.category.replace('_', ' ')}
            </div>
            <Progress value={(category.used / category.total) * 100} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {category.used}/{category.total} words
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderLevel2Progress = () => {
    if (!vocabularyStats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {vocabularyStats.level2Progress.map((category: any) => (
          <Card key={category.category} className="p-4">
            <div className="text-sm font-medium capitalize mb-2">
              {category.category.replace('_', ' ')}
            </div>
            <Progress value={(category.used / category.total) * 100} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {category.used}/{category.total} words
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderThemedSessionOptions = () => {
    const difficulty = userInfo.difficultyLevel || 'easy';
    
    if (difficulty === 'hard' || difficulty === 'expert') {
      return (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Progressive Learning</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Your {difficulty} level uses progressive revelation to gradually unveil story elements.
          </p>
          <Button onClick={onStartProgressiveSession} className="w-full">
            Start Progressive Session
          </Button>
        </Card>
      );
    }

    const nextSession = getNextThemedSession();
    
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Next Themed Session</h3>
        </div>
        {nextSession && (
          <>
            <div className="mb-4">
              <h4 className="font-medium text-primary">{nextSession.theme}</h4>
              <p className="text-sm text-muted-foreground">
                Focus: {nextSession.category.replace('_', ' ')}
              </p>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Target Vocabulary ({nextSession.targetVocabulary.length} words):</div>
              <div className="flex flex-wrap gap-1">
                {nextSession.targetVocabulary.slice(0, 8).map((word: string) => (
                  <Badge key={word} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
                {nextSession.targetVocabulary.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{nextSession.targetVocabulary.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Session Goals:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {nextSession.sessionGoals.map((goal: string, index: number) => (
                  <li key={index}>• {goal}</li>
                ))}
              </ul>
            </div>
            <Button 
              onClick={() => onStartThemedSession?.(nextSession.theme)} 
              className="w-full"
            >
              Start {nextSession.theme} Session
            </Button>
          </>
        )}
      </Card>
    );
  };

  const renderPremiumAnalytics = () => {
    if (!isPremium || !premiumAnalytics || !progressReport) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Vocabulary Features</h3>
            <p className="text-muted-foreground mb-4">
              Unlock personalized vocabulary tracking, advanced phonetics, and cultural adaptations.
            </p>
            <Button variant="outline">Upgrade to Premium</Button>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Personalized Learning Path */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Personalized Learning Path</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Next Words</h4>
              <div className="space-y-1">
                {premiumAnalytics.nextWords.map((word: string) => (
                  <Badge key={word} variant="default" className="mr-1 mb-1">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Challenging Words</h4>
              <div className="space-y-1">
                {premiumAnalytics.challengingWords.map((word: string) => (
                  <Badge key={word} variant="destructive" className="mr-1 mb-1">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Reinforcement</h4>
              <div className="space-y-1">
                {premiumAnalytics.reinforcementWords.map((word: string) => (
                  <Badge key={word} variant="secondary" className="mr-1 mb-1">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Cultural Adaptations */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Cultural Learning Adaptations</h3>
          </div>
          
          <div className="space-y-2">
            {premiumAnalytics.culturalAdaptations.map((adaptation: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{adaptation}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress Report */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Progress Report</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Strong Areas</h4>
              <ul className="space-y-1">
                {progressReport.strongAreas.map((area: string, index: number) => (
                  <li key={index} className="text-sm text-green-600">✓ {area}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Improvement Areas</h4>
              <ul className="space-y-1">
                {progressReport.improvementAreas.map((area: string, index: number) => (
                  <li key={index} className="text-sm text-orange-600">→ {area}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Next Week Goals</h4>
            <ul className="space-y-1">
              {progressReport.nextWeekGoals.map((goal: string, index: number) => (
                <li key={index} className="text-sm">• {goal}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {vocabularyStats?.totalWordsEncountered || 0}
              </div>
              <div className="text-xs text-muted-foreground">Words Encountered</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {sessionProgress?.currentSession || 0}
              </div>
              <div className="text-xs text-muted-foreground">Sessions Completed</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {sessionProgress?.completedThemes.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Themes Mastered</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {userInfo.difficultyLevel?.toUpperCase() || 'EASY'}
              </div>
              <div className="text-xs text-muted-foreground">Current Level</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {renderThemedSessionOptions()}
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Most Practiced Words</h3>
              <div className="space-y-2">
                {vocabularyStats?.mostPracticedWords.map((item: any, index: number) => (
                  <div key={item.word} className="flex justify-between items-center">
                    <span className="text-sm">{item.word}</span>
                    <Badge variant="outline">{item.count}x</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Level 1 Vocabulary Progress</h3>
            {renderLevel1Progress()}
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Level 2 Vocabulary Progress</h3>
            {renderLevel2Progress()}
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Completed Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sessionProgress?.completedThemes.map((theme: string) => (
                <Badge key={theme} variant="secondary" className="justify-center p-2">
                  {theme.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          {renderPremiumAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  );
};