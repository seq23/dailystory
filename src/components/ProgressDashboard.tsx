import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Star,
  Flame,
  Globe,
  Volume2
} from "lucide-react";
import { ReadingProgress, Achievement, WeeklyGoal } from "@/services/progressTrackingService";
import type { UserInfo } from "@/types";

interface ProgressDashboardProps {
  progress: ReadingProgress;
  userInfo: UserInfo;
  onClose: () => void;
}

const ProgressDashboard = ({ progress, userInfo, onClose }: ProgressDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'goals'>('overview');
  
  const isNativeEnglish = userInfo.nativeLanguage === 'en';
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const getStreakIcon = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '📚';
  };
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{progress.storiesCompleted}</div>
            <div className="text-sm text-gray-600">Stories Read</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{formatTime(progress.totalReadingTime)}</div>
            <div className="text-sm text-gray-600">Time Reading</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{progress.currentStreak} {getStreakIcon(progress.currentStreak)}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{progress.readingSpeed}</div>
            <div className="text-sm text-gray-600">Words/Min</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Learning Progress */}
      {isNativeEnglish ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Reading Development
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reading Level</span>
                <span className="text-sm text-gray-600">{progress.nativeProgress?.readingLevel}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Advanced Words Learned</span>
                <span className="text-sm text-gray-600">{progress.nativeProgress?.vocabularyGrowth || 0}</span>
              </div>
              <Progress value={Math.min((progress.nativeProgress?.vocabularyGrowth || 0) * 4, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reading Comprehension</span>
                <span className="text-sm text-gray-600">{progress.comprehensionScore}%</span>
              </div>
              <Progress value={progress.comprehensionScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              English Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">English Vocabulary</span>
                <span className="text-sm text-gray-600">{progress.eslProgress?.englishVocabularySize || 0} words</span>
              </div>
              <Progress value={Math.min((progress.eslProgress?.englishVocabularySize || 0) * 2, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm text-gray-600">{progress.eslProgress?.confidenceLevel || 5}/10</span>
              </div>
              <Progress value={(progress.eslProgress?.confidenceLevel || 5) * 10} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reading Comprehension</span>
                <span className="text-sm text-gray-600">{progress.comprehensionScore}%</span>
              </div>
              <Progress value={progress.comprehensionScore} className="h-2" />
            </div>
            
            {progress.eslProgress?.wordsNeedingPractice && progress.eslProgress.wordsNeedingPractice.length > 0 && (
              <div>
                <span className="text-sm font-medium">Words to Practice</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {progress.eslProgress.wordsNeedingPractice.slice(0, 8).map((word, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                  {progress.eslProgress.wordsNeedingPractice.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{progress.eslProgress.wordsNeedingPractice.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Personalized Recommendations */}
      {progress.personalizedRecommendations && progress.personalizedRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommendations for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progress.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderAchievements = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
        <h3 className="text-lg font-semibold">Your Achievements</h3>
        <p className="text-sm text-gray-600">You've earned {progress.achievements.length} achievement{progress.achievements.length !== 1 ? 's' : ''}!</p>
      </div>
      
      {progress.achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-gray-600">Keep reading to earn your first achievement!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {progress.achievements.map((achievement) => (
            <Card key={achievement.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {achievement.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderGoals = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto mb-2 text-blue-500" />
        <h3 className="text-lg font-semibold">Weekly Goals</h3>
        <p className="text-sm text-gray-600">Track your weekly reading progress</p>
      </div>
      
      <div className="space-y-4">
        {progress.weeklyGoals.map((goal, index) => (
          <Card key={index} className={`${goal.completed ? 'border-green-500 bg-green-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">
                  {goal.type === 'stories_completed' && 'Stories This Week'}
                  {goal.type === 'reading_time' && 'Reading Time This Week'}
                  {goal.type === 'vocabulary_learned' && 'New Words This Week'}
                </h4>
                {goal.completed && <Badge className="bg-green-600">Completed! ✓</Badge>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {goal.type === 'reading_time' ? formatTime(goal.current) : goal.current} / {goal.type === 'reading_time' ? formatTime(goal.target) : goal.target}
                  </span>
                </div>
                <Progress 
                  value={Math.min((goal.current / goal.target) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Reading Progress</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={selectedTab === 'achievements' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('achievements')}
            >
              Achievements ({progress.achievements.length})
            </Button>
            <Button
              variant={selectedTab === 'goals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('goals')}
            >
              Goals
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'achievements' && renderAchievements()}
          {selectedTab === 'goals' && renderGoals()}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;