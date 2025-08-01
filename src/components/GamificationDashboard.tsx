import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  BookOpen, 
  Award,
  TrendingUp,
  Calendar,
  Zap,
  Crown
} from "lucide-react";
import { GamificationService, type UserStats, type Achievement } from "@/services/gamificationService";
import { AchievementNotification } from "@/components/AchievementNotification";

interface GamificationDashboardProps {
  userStats: UserStats;
  onStatsUpdate?: (stats: UserStats) => void;
  compact?: boolean;
}

export const GamificationDashboard = ({ 
  userStats, 
  onStatsUpdate,
  compact = false 
}: GamificationDashboardProps) => {
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const levelProgress = GamificationService.getProgressToNextLevel(
    userStats.totalPoints, 
    userStats.currentLevel
  );

  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const inProgressAchievements = userStats.achievements.filter(a => !a.unlocked);

  const filteredAchievements = selectedCategory === "all" 
    ? unlockedAchievements 
    : unlockedAchievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-green-100 text-green-800 border-green-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Level Progress Bar */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Level {userStats.currentLevel}</span>
              </div>
              <span className="text-sm text-blue-700">{userStats.totalPoints} points</span>
            </div>
            <Progress 
              value={levelProgress.progressPercentage} 
              className="h-3 bg-blue-100"
            />
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>{levelProgress.currentLevelPoints}</span>
              <span>{levelProgress.nextLevelPoints}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-3 text-center">
              <Flame className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-900">{userStats.streak.currentStreak}</div>
              <div className="text-xs text-orange-700">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 text-center">
              <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-900">{unlockedAchievements.length}</div>
              <div className="text-xs text-green-700">Achievements</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      {showAchievement && (
        <AchievementNotification
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
          isVisible={!!showAchievement}
        />
      )}

      {/* Level and Progress */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <Crown className="w-6 h-6 text-blue-600" />
            Reading Level {userStats.currentLevel}
            <Badge className="bg-blue-100 text-blue-800 ml-auto">
              {userStats.totalPoints} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress 
              value={levelProgress.progressPercentage} 
              className="h-4 bg-blue-100"
            />
            <div className="flex justify-between text-sm text-blue-700">
              <span>{levelProgress.currentLevelPoints} points</span>
              <span>Level {userStats.currentLevel + 1}: {levelProgress.nextLevelPoints} points</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-900">
                {GamificationService.getMotivationalMessage(userStats)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{userStats.streak.currentStreak}</div>
            <div className="text-sm text-orange-700">Day Streak</div>
            <div className="text-xs text-orange-600 mt-1">
              Best: {userStats.streak.longestStreak} days
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{userStats.totalStoriesCompleted}</div>
            <div className="text-sm text-green-700">Stories Read</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{userStats.totalWordsRead.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Words Read</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">{unlockedAchievements.length}</div>
            <div className="text-sm text-yellow-700">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="streak">Streaks</TabsTrigger>
              <TabsTrigger value="vocabulary">Words</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedCategory} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAchievements.map((achievement) => (
                  <Card key={achievement.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 font-medium">
                              +{achievement.points} points
                            </span>
                            {achievement.unlockedAt && (
                              <span className="text-gray-500">
                                {achievement.unlockedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* In Progress Achievements */}
              {selectedCategory === "all" && inProgressAchievements.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-900 mt-6 mb-3">In Progress</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inProgressAchievements.slice(0, 4).map((achievement) => (
                      <Card key={achievement.id} className="border border-gray-200 opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl opacity-50">{achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-700">{achievement.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                              <div className="space-y-2">
                                <Progress 
                                  value={(achievement.currentProgress / achievement.requirement) * 100} 
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{achievement.currentProgress} / {achievement.requirement}</span>
                                  <span>+{achievement.points} points</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};