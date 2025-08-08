import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Zap, BookOpen, Target, Award, Heart, Sparkles } from 'lucide-react';
import type { UserInfo } from '@/types';

interface RewardSystemProps {
  userInfo: UserInfo;
  wordsRead: number;
  pagesRead: number;
  timeSpent: number; // in seconds
  onRewardEarned?: (reward: Achievement) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  type: 'reading' | 'time' | 'vocabulary' | 'streak';
}

export const ReadingRewardsSystem = ({ 
  userInfo, 
  wordsRead, 
  pagesRead, 
  timeSpent,
  onRewardEarned 
}: RewardSystemProps) => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(1);
  const prevUnlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first_story',
        title: t('rewards.achievements.firstStory.title', 'Story Explorer'),
        description: t('rewards.achievements.firstStory.desc', 'Complete your first story'),
        icon: <BookOpen className="w-4 h-4" />,
        progress: Math.min(pagesRead, 1),
        maxProgress: 1,
        unlocked: pagesRead >= 1,
        type: 'reading'
      },
      {
        id: 'word_master_50',
        title: t('rewards.achievements.wordMaster50.title', 'Word Explorer'),
        description: t('rewards.achievements.wordMaster50.desc', 'Read 50 words'),
        icon: <Target className="w-4 h-4" />,
        progress: Math.min(wordsRead, 50),
        maxProgress: 50,
        unlocked: wordsRead >= 50,
        type: 'vocabulary'
      },
      {
        id: 'word_master_200',
        title: t('rewards.achievements.wordMaster200.title', 'Word Champion'),
        description: t('rewards.achievements.wordMaster200.desc', 'Read 200 words'),
        icon: <Star className="w-4 h-4" />,
        progress: Math.min(wordsRead, 200),
        maxProgress: 200,
        unlocked: wordsRead >= 200,
        type: 'vocabulary'
      },
      {
        id: 'time_reader_5min',
        title: t('rewards.achievements.timeReader5.title', 'Reading Sprinter'),
        description: t('rewards.achievements.timeReader5.desc', 'Read for 5 minutes'),
        icon: <Zap className="w-4 h-4" />,
        progress: Math.min(timeSpent / 60, 5),
        maxProgress: 5,
        unlocked: timeSpent >= 300,
        type: 'time'
      },
      {
        id: 'page_turner',
        title: t('rewards.achievements.pageTurner.title', 'Page Turner'),
        description: t('rewards.achievements.pageTurner.desc', 'Read 10 pages'),
        icon: <Trophy className="w-4 h-4" />,
        progress: Math.min(pagesRead, 10),
        maxProgress: 10,
        unlocked: pagesRead >= 10,
        type: 'reading'
      },
      {
        id: 'dedicated_reader',
        title: t('rewards.achievements.dedicatedReader.title', 'Dedicated Reader'),
        description: t('rewards.achievements.dedicatedReader.desc', 'Read for 15 minutes'),
        icon: <Heart className="w-4 h-4" />,
        progress: Math.min(timeSpent / 60, 15),
        maxProgress: 15,
        unlocked: timeSpent >= 900,
        type: 'time'
      }
    ];

    setAchievements(baseAchievements);

    // Calculate total points
    const points = baseAchievements.reduce((total, achievement) => {
      return total + (achievement.unlocked ? achievement.maxProgress * 10 : 0);
    }, 0);
    setTotalPoints(points);

    // Check for newly unlocked achievements (no toasts)
    const prev = prevUnlockedRef.current;
    const currentUnlocked = new Set(baseAchievements.filter(a => a.unlocked).map(a => a.id));
    const newlyUnlocked = Array.from(currentUnlocked).filter(id => !prev.has(id));

    newlyUnlocked.forEach(id => {
      const achievement = baseAchievements.find(a => a.id === id);
      if (achievement) {
        onRewardEarned?.(achievement);
      }
    });

    // Update ref
    prevUnlockedRef.current = currentUnlocked;

  }, [wordsRead, pagesRead, timeSpent, t, onRewardEarned]);

  const getRewardLevel = () => {
    if (totalPoints >= 1000) return { level: 'Master Reader', color: 'bg-purple-500', icon: <Award className="w-4 h-4" /> };
    if (totalPoints >= 500) return { level: 'Advanced Reader', color: 'bg-blue-500', icon: <Trophy className="w-4 h-4" /> };
    if (totalPoints >= 200) return { level: 'Good Reader', color: 'bg-green-500', icon: <Star className="w-4 h-4" /> };
    return { level: 'Beginning Reader', color: 'bg-orange-500', icon: <BookOpen className="w-4 h-4" /> };
  };

  const rewardLevel = getRewardLevel();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Reader Level & Points */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`p-2 rounded-full ${rewardLevel.color} text-white`}>
                {rewardLevel.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-purple-800">{rewardLevel.level}</h3>
                <p className="text-sm text-purple-600">{totalPoints} points</p>
              </div>
            </div>
            
            {/* Streak */}
            <div className="flex items-center justify-center gap-1 text-sm text-orange-600">
              <Sparkles className="w-3 h-3" />
              <span>{currentStreak} day streak!</span>
            </div>
          </div>

          {/* Current Session Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-600">{wordsRead}</div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-lg font-bold text-green-600">{pagesRead}</div>
              <div className="text-xs text-gray-600">Pages</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-lg font-bold text-purple-600">{Math.round(timeSpent / 60)}</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-semibold text-sm text-purple-800 mb-2 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Achievements
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {achievements.slice(0, 4).map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? 'bg-white border-green-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`p-1 rounded ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                      {achievement.icon}
                    </div>
                    <div className="text-xs font-medium truncate">{achievement.title}</div>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1.5 mb-1" 
                  />
                  <div className="text-xs text-gray-500">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Milestone */}
          {achievements.length > 0 && (
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-xs font-medium text-purple-700 mb-1">Next Goal:</div>
              {(() => {
                const nextAchievement = achievements.find(a => !a.unlocked);
                if (nextAchievement) {
                  const remaining = nextAchievement.maxProgress - nextAchievement.progress;
                  return (
                    <div className="text-xs text-gray-600">
                      {nextAchievement.title} - {Math.ceil(remaining)} more to go!
                    </div>
                  );
                }
                return <div className="text-xs text-green-600">All achievements unlocked! 🎉</div>;
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};