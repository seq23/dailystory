import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Star, Award, TrendingUp, Target, Zap, Brain } from "lucide-react";
import { ReadingRewardsSystem } from "@/components/ReadingRewardsSystem";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import type { UserInfo } from "@/types";

interface ProgressDashboardProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

interface UserProgress {
  storiesRead: number;
  totalReadingTime: number; // in minutes
  wordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  monthlyGoal: number;
  readingSpeed: number; // WPM
  comprehensionScore: number;
  achievements: Achievement[];
  recentActivity: ActivityItem[];
  skillProgress: SkillArea[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ActivityItem {
  date: Date;
  type: 'story' | 'vocabulary' | 'achievement' | 'streak';
  title: string;
  description: string;
}

interface SkillArea {
  name: string;
  level: number;
  progress: number;
  description: string;
}

export const ProgressDashboard = ({ userInfo, isVisible, onClose }: ProgressDashboardProps) => {
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({
    storiesRead: 12,
    totalReadingTime: 240,
    wordsLearned: 85,
    currentStreak: 7,
    weeklyGoal: 5,
    monthlyGoal: 20,
    readingSpeed: 95,
    comprehensionScore: 82,
    achievements: [
      {
        id: 'first-story',
        title: 'Story Explorer',
        description: 'Read your first story',
        icon: '📚',
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rarity: 'common'
      },
      {
        id: 'word-master',
        title: 'Word Champion',
        description: 'Learned 50 new words',
        icon: '📝',
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rarity: 'rare'
      },
      {
        id: 'streak-warrior',
        title: 'Week Warrior',
        description: '7-day reading streak',
        icon: '🔥',
        unlockedAt: new Date(),
        rarity: 'epic'
      }
    ],
    recentActivity: [
      {
        date: new Date(),
        type: 'achievement',
        title: 'Week Warrior',
        description: 'Completed 7-day reading streak!'
      },
      {
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'story',
        title: 'The Magic Garden',
        description: 'Completed story in 12 minutes'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'vocabulary',
        title: 'New Words',
        description: 'Learned 5 new words: adventure, mysterious, enchanted, discover, courage'
      }
    ],
    skillProgress: [
      { name: 'Reading Speed', level: 3, progress: 65, description: 'How fast you read' },
      { name: 'Comprehension', level: 4, progress: 82, description: 'Understanding what you read' },
      { name: 'Vocabulary', level: 2, progress: 45, description: 'New words you know' },
      { name: 'Fluency', level: 3, progress: 70, description: 'How smoothly you read' }
    ]
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Your Reading Journey</CardTitle>
        <CardDescription className="text-lg">Track your progress and celebrate achievements!</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-700">{progress.storiesRead}</div>
                  <div className="text-sm text-blue-600">Stories Read</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-700">{formatTime(progress.totalReadingTime)}</div>
                  <div className="text-sm text-green-600">Reading Time</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-700">{progress.wordsLearned}</div>
                  <div className="text-sm text-purple-600">Words Learned</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6 text-center">
                  <Award className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-700">{progress.currentStreak}</div>
                  <div className="text-sm text-orange-600">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Progress */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Weekly Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Stories this week</span>
                      <span className="font-semibold">{Math.min(progress.storiesRead, progress.weeklyGoal)} / {progress.weeklyGoal}</span>
                    </div>
                    <Progress value={(Math.min(progress.storiesRead, progress.weeklyGoal) / progress.weeklyGoal) * 100} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Reading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Speed: {progress.readingSpeed} WPM</span>
                      <span>Comprehension: {progress.comprehensionScore}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={Math.min(progress.readingSpeed / 120 * 100, 100)} className="h-2" />
                      <Progress value={progress.comprehensionScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Component */}
            <ReadingRewardsSystem
              userInfo={userInfo}
              wordsRead={450}
              pagesRead={24}
              timeSpent={240}
              onRewardEarned={(reward) => {
                console.log('New reward earned:', reward);
              }}
            />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progress.achievements.map((achievement) => (
                <Card key={achievement.id} className={`${getRarityColor(achievement.rarity)} p-1`}>
                  <div className="bg-white rounded-lg p-4 h-full">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Unlocked {formatRelativeTime(achievement.unlockedAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {progress.skillProgress.map((skill) => (
                <Card key={skill.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        {skill.name}
                      </span>
                      <Badge variant="outline">Level {skill.level}</Badge>
                    </CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to Level {skill.level + 1}</span>
                        <span>{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              {progress.recentActivity.map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {activity.type === 'story' && <BookOpen className="w-6 h-6 text-blue-500" />}
                        {activity.type === 'vocabulary' && <Star className="w-6 h-6 text-purple-500" />}
                        {activity.type === 'achievement' && <Award className="w-6 h-6 text-yellow-500" />}
                        {activity.type === 'streak' && <Zap className="w-6 h-6 text-orange-500" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(activity.date)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <VocabularyCollector
        userInfo={userInfo}
        isVisible={showVocabulary}
        onClose={() => setShowVocabulary(false)}
      />
    </Card>
  );
};