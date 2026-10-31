import { uiText, useUiLanguage } from "@/i18n/uiText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Star, Award, TrendingUp, Target, Brain, Gamepad2, Library } from "lucide-react";
import { useRealProgressData } from "@/hooks/useRealProgressData";
import type { UserInfo } from "@/types";

interface ProgressDashboardProps {
  userInfo: UserInfo;
  userId?: string;
  isVisible: boolean;
  onClose: () => void;
  isPremium?: boolean;
}

export const ProgressDashboard = ({ userInfo, userId, isVisible, onClose, isPremium = false }: ProgressDashboardProps) => {
  useUiLanguage();
  const progress = useRealProgressData(userId);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Determine reading level based on activity
  const getReadingLevel = () => {
    if (progress.storiesRead >= 50) return { label: uiText("Master Reader"), level: 5 };
    if (progress.storiesRead >= 25) return { label: uiText("Advanced Reader"), level: 4 };
    if (progress.storiesRead >= 10) return { label: uiText("Growing Reader"), level: 3 };
    if (progress.storiesRead >= 3) return { label: uiText("Eager Reader"), level: 2 };
    if (progress.storiesRead >= 1) return { label: uiText("Beginner Reader"), level: 1 };
    return { label: uiText("New Explorer"), level: 0 };
  };

  const readingLevel = getReadingLevel();

  if (progress.loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAnyActivity = progress.storiesRead > 0 || progress.wordsLearned > 0 || 
                          progress.quizzesTaken > 0 || progress.gamesPlayed > 0;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">{uiText("Your Reading Journey")}</CardTitle>
            <CardDescription className="text-lg">
              {hasAnyActivity 
                ? `${readingLevel.label} · Level ${readingLevel.level}`
                : uiText("Start reading to track your progress!")}
            </CardDescription>
          </div>
          {progress.currentStreak > 0 && (
            <Badge className="text-lg px-4 py-2 bg-orange-100 text-orange-700 border-orange-300">
              🔥 {progress.currentStreak} {uiText("Day Streak")}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{uiText("Overview")}</TabsTrigger>
            <TabsTrigger value="details">{uiText("Details")}</TabsTrigger>
            <TabsTrigger value="activity">{uiText("Recent Activity")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{progress.storiesRead}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">{uiText("Stories Read")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">{formatTime(progress.totalReadingTimeMinutes)}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">{uiText("Reading Time")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{progress.wordsLearned}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">{uiText("Words Learned")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardContent className="p-6 text-center">
                  <Library className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{progress.savedStories}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">{uiText("Saved Stories")}</div>
                </CardContent>
              </Card>
            </div>

            {/* No Activity State */}
            {!hasAnyActivity && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-xl font-semibold mb-2">{uiText("No activity yet")}</h3>
                  <p className="text-muted-foreground">
                    {uiText("Start reading stories to see your progress here! Your reading sessions, quizzes, vocabulary, and games will all be tracked.")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Streak & Level Progress */}
            {hasAnyActivity && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      {uiText("Reading Level")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{readingLevel.label}</span>
                        <span className="font-semibold">{uiText("Level")} {readingLevel.level}</span>
                      </div>
                      <Progress 
                        value={readingLevel.level > 0 ? Math.min((readingLevel.level / 5) * 100, 100) : 0} 
                        className="h-3" 
                      />
                      <p className="text-xs text-muted-foreground">
                        {readingLevel.level < 5 
                          ? `Read more stories to reach the next level!`
                          : `You've reached the highest level! 🎉`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      {uiText("Streaks")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{uiText("Current Streak")}</span>
                        <span className="font-semibold">{progress.currentStreak} {uiText("days")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{uiText("Longest Streak")}</span>
                        <span className="font-semibold">{progress.longestStreak} {uiText("days")}</span>
                      </div>
                      {progress.currentStreak === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {uiText("Read a story today to start a streak!")}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Comprehension */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    {uiText("Comprehension")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.quizzesTaken > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{uiText("Average Score")}</span>
                        <span className="font-semibold">{progress.averageComprehensionScore}%</span>
                      </div>
                      <Progress value={progress.averageComprehensionScore} className="h-3" />
                      <p className="text-sm text-muted-foreground">{progress.quizzesTaken} {uiText("quizzes completed")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{uiText("Complete a quiz after reading to track comprehension!")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Games */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-green-500" />
                    {uiText("Games")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.gamesPlayed > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{uiText("Average Score")}</span>
                        <span className="font-semibold">{progress.averageGameScore}%</span>
                      </div>
                      <Progress value={progress.averageGameScore} className="h-3" />
                      <p className="text-sm text-muted-foreground">{progress.gamesPlayed} {uiText("games played")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{uiText("Play reading games to see your scores here!")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Vocabulary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    {uiText("Vocabulary")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.wordsLearned > 0 ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold">{progress.wordsLearned}</div>
                      <p className="text-sm text-muted-foreground">{uiText("words encountered and tracked")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{uiText("Words you encounter in stories will be tracked here!")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Saved Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-orange-500" />
                    {uiText("Story Library")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.savedStories > 0 ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold">{progress.savedStories}</div>
                      <p className="text-sm text-muted-foreground">{uiText("stories saved to your library")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{uiText("Save stories to build your personal library!")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {progress.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {progress.recentActivity.map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {activity.type === 'story' && <BookOpen className="w-6 h-6 text-blue-500" />}
                          {activity.type === "quiz" && <Brain className="w-6 h-6 text-purple-500" />}
                          {activity.type === 'vocabulary' && <Star className="w-6 h-6 text-yellow-500" />}
                          {activity.type === "game" && <Gamepad2 className="w-6 h-6 text-green-500" />}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(activity.date)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-semibold mb-2">{uiText("No activity yet")}</h3>
                  <p className="text-muted-foreground">
                    {uiText("Your reading sessions, quizzes, and games will appear here.")}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
