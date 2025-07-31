import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, BookOpen, Clock, Target, Star, Users, Settings } from 'lucide-react';
import type { UserInfo } from '@/types';

interface ParentDashboardProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

interface ReadingStats {
  totalTimeSpent: number;
  totalWordsRead: number;
  totalPagesRead: number;
  storiesCompleted: number;
  vocabularyWordsLearned: number;
  averageAccuracy: number;
  streakDays: number;
  lastSessionDate: Date;
  weeklyProgress: number[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export const ParentDashboard = ({ userInfo, isVisible, onClose }: ParentDashboardProps) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReadingStats>({
    totalTimeSpent: 0,
    totalWordsRead: 0,
    totalPagesRead: 0,
    storiesCompleted: 0,
    vocabularyWordsLearned: 0,
    averageAccuracy: 0,
    streakDays: 0,
    lastSessionDate: new Date(),
    weeklyProgress: [20, 35, 45, 30, 60, 40, 55],
    strengthAreas: ['Word Recognition', 'Reading Fluency'],
    improvementAreas: ['Comprehension', 'Vocabulary']
  });

  useEffect(() => {
    if (isVisible) {
      loadReadingStats();
    }
  }, [isVisible, userInfo]);

  const loadReadingStats = () => {
    // Load stats from localStorage or API
    const savedStats = localStorage.getItem(`reading_stats_${userInfo.name}`);
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats({
          ...parsed,
          lastSessionDate: new Date(parsed.lastSessionDate)
        });
      } catch (error) {
        console.error('Error loading reading stats:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getReadingLevel = () => {
    if (stats.totalWordsRead >= 1000) return { level: 'Advanced', color: 'text-purple-600' };
    if (stats.totalWordsRead >= 500) return { level: 'Intermediate', color: 'text-blue-600' };
    if (stats.totalWordsRead >= 100) return { level: 'Beginner+', color: 'text-green-600' };
    return { level: 'Beginner', color: 'text-orange-600' };
  };

  const readingLevel = getReadingLevel();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              {userInfo.name}'s Reading Progress
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
          <div className="text-sm opacity-90">
            Parent & Teacher Dashboard
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Key Stats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Reading Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats.totalTimeSpent)}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Words Read</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalWordsRead.toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Stories Completed</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.storiesCompleted}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Reading Streak</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.streakDays} days
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reading Level & Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Reading Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${readingLevel.color} mb-2`}>
                    {readingLevel.level}
                  </div>
                  <p className="text-gray-600">
                    Reading at {userInfo.grade} grade level
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reading Accuracy</span>
                      <span>{stats.averageAccuracy}%</span>
                    </div>
                    <Progress value={stats.averageAccuracy} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vocabulary Growth</span>
                      <span>{stats.vocabularyWordsLearned} words learned</span>
                    </div>
                    <Progress value={(stats.vocabularyWordsLearned / 100) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  Learning Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Strengths
                    </h4>
                    <div className="space-y-1">
                      {stats.strengthAreas.map((area, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 mr-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Focus Areas
                    </h4>
                    <div className="space-y-1">
                      {stats.improvementAreas.map((area, index) => (
                        <Badge key={index} className="bg-orange-100 text-orange-800 mr-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                Weekly Reading Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {stats.weeklyProgress.map((minutes, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t w-full"
                      style={{ height: `${(minutes / 60) * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {minutes}m
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-1">Reading Schedule</h5>
                  <p className="text-sm text-blue-700">
                    {userInfo.name} is doing great! Try to maintain 15-20 minutes of daily reading for optimal progress.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-1">Vocabulary Building</h5>
                  <p className="text-sm text-green-700">
                    Encourage {userInfo.name} to use the vocabulary collection feature more often to build word knowledge.
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h5 className="font-medium text-purple-800 mb-1">Comprehension Skills</h5>
                  <p className="text-sm text-purple-700">
                    The reading quizzes are helping improve comprehension. Continue using them after each story.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};