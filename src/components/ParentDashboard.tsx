import { useState, useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, TrendingUp, Award, Star, Calendar, Gamepad2, Loader2 } from "lucide-react";
import type { UserInfo, ExpertGradeLevel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ParentGuardrailsService } from "@/services/parentGuardrailsService";
import { supabase } from "@/integrations/supabase/client";
import { ChildSwitcher } from "@/components/ChildSwitcher";
import { ChildManager } from "@/components/ChildManager";
import { useTranslation } from "react-i18next";
import { TagInput } from "@/components/ui/tag-input";
import EnhancedSubscriptionManager from "@/services/enhancedSubscriptionManager";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { useChildProgressData } from "@/hooks/useChildProgressData";

interface ParentDashboardProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

export const ParentDashboard = ({ userInfo, isVisible, onClose }: ParentDashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [guardrails, setGuardrails] = useState<{ lockDifficulty: boolean; minDifficulty: string; minExpertGrade: ExpertGradeLevel; allowDecreaseBelowMin: boolean }>({
    lockDifficulty: false,
    minDifficulty: 'beginner',
    minExpertGrade: '6th',
    allowDecreaseBelowMin: false,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'goals' | 'insights' | 'controls' | 'quizzes'>('controls');
  const [teacherWords, setTeacherWords] = useState<string>("");
  const [twLoading, setTwLoading] = useState<boolean>(false);
  const [twSaving, setTwSaving] = useState<boolean>(false);
  const [prefsRowId, setPrefsRowId] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [storyPrefs, setStoryPrefs] = useState<any>({});
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const { activeChild } = useChildProfiles();
  const teacherWordCount = (teacherWords || '').split(',').map((w) => w.trim()).filter(Boolean).length;

  // Goals stored locally (could be persisted to user_preferences later)
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [dailyTimeGoal, setDailyTimeGoal] = useState(20);

  // Real per-child data
  const progress = useChildProgressData(activeChild?.id ?? null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enhanced = await EnhancedSubscriptionManager.isPremiumUser().catch(() => false);
        if (mounted) setIsPremiumUser(enhanced);
      } catch {
        if (mounted) setIsPremiumUser(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const g = await ParentGuardrailsService.getGuardrails();
        setGuardrails({
          lockDifficulty: g.lockDifficulty,
          minDifficulty: g.minDifficulty,
          minExpertGrade: g.minExpertGrade,
          allowDecreaseBelowMin: !!g.allowDecreaseBelowMin,
        });
      } catch (e) {
        DebugLogger.warn('error', 'Failed to load parent guardrails', { error: e });
      }
    })();
  }, []);

  // Load premium teacher word list and active child
  useEffect(() => {
    (async () => {
      try {
        setTwLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsPremiumUser(false); return; }
        const { data, error } = await supabase
          .from('user_preferences')
          .select('id, active_child_id, story_preferences, is_premium')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) { DebugLogger.warn('error', 'User preferences fetch failed', { error }); return; }
        setPrefsRowId((data as any)?.id ?? null);
        setActiveChildId((data as any)?.active_child_id ?? null);
        setIsPremiumUser(prev => prev || !!(data as any)?.is_premium);
        const sp = ((data as any)?.story_preferences) || {};
        setStoryPrefs(sp);
        const lists = sp?.teacherWordLists || {};
        const key = ((data as any)?.active_child_id) || 'default';
        const arr: string[] = Array.isArray(lists[key]) ? lists[key] : (Array.isArray(lists['default']) ? lists['default'] : []);
        const cleaned = arr.map((w) => (typeof w === 'string' ? w.trim() : '')).filter(Boolean).slice(0, 50);
        setTeacherWords(cleaned.join(', '));
      } finally {
        setTwLoading(false);
      }
    })();
  }, []);

  // Listen for active child changes and reload list
  useEffect(() => {
    const handler = () => {
      (async () => {
        try {
          setTwLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data } = await supabase
            .from('user_preferences')
            .select('id, active_child_id, story_preferences, is_premium')
            .eq('user_id', user.id)
            .maybeSingle();
          setPrefsRowId((data as any)?.id ?? null);
          setActiveChildId((data as any)?.active_child_id ?? null);
          setIsPremiumUser(prev => prev || !!(data as any)?.is_premium);
          const sp = ((data as any)?.story_preferences) || {};
          setStoryPrefs(sp);
          const lists = sp?.teacherWordLists || {};
          const key = ((data as any)?.active_child_id) || 'default';
          const arr: string[] = Array.isArray(lists[key]) ? lists[key] : (Array.isArray(lists['default']) ? lists['default'] : []);
          const cleaned = arr.map((w) => (typeof w === 'string' ? w.trim() : '')).filter(Boolean).slice(0, 50);
          setTeacherWords(cleaned.join(', '));
        } finally {
          setTwLoading(false);
        }
      })();
    };
    window.addEventListener('active-child-changed', handler);
    return () => window.removeEventListener('active-child-changed', handler);
  }, []);

  const saveTeacherWords = async () => {
    try {
      setTwSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const key = activeChildId || 'default';
      const arr = (teacherWords || '').split(',').map((w) => w.trim()).filter(Boolean);
      const capped = arr.slice(0, 50);
      const nextPrefs = { ...storyPrefs, teacherWordLists: { ...(storyPrefs?.teacherWordLists || {}), [key]: capped } };
      if (prefsRowId) {
        await supabase.from('user_preferences').update({ story_preferences: nextPrefs }).eq('id', prefsRowId);
      } else {
        await supabase.from('user_preferences').insert({ user_id: user.id, story_preferences: nextPrefs });
      }
      setStoryPrefs(nextPrefs);
      toast({ title: 'Saved word list' });
    } catch (e) {
      toast({ title: 'Could not save word list', variant: 'destructive' });
    } finally {
      setTwSaving(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const childLabel = activeChild?.display_name || userInfo.name;
  const showingAllChildren = !activeChild;

  const LoadingOverlay = () => (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span>Loading data...</span>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8 text-muted-foreground text-sm">{message}</div>
  );

  // Weekly totals for goals
  const weeklyStoriesThisWeek = progress.storiesRead; // Approximation since we don't have weekly-only filter
  const todayMinutes = progress.weeklyMinutes[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] || 0;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{childLabel}'s Learning Dashboard</CardTitle>
          <CardDescription>
            {showingAllChildren
              ? "Showing data across all children. Select a child in Controls to filter."
              : `Showing data for ${childLabel}`}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full flex justify-end mb-4">
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="goals">Goals</SelectItem>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="controls">Controls</SelectItem>
              <SelectItem value="quizzes">Quizzes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{progress.storiesRead}</div>
                      <div className="text-sm text-muted-foreground">Stories Read</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{formatTime(progress.totalReadingTimeMinutes)}</div>
                      <div className="text-sm text-muted-foreground">Reading Time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{progress.wordsLearned}</div>
                      <div className="text-sm text-muted-foreground">Words Learned</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{progress.currentStreak}</div>
                      <div className="text-sm text-muted-foreground">Day Streak</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Comprehension (Quizzes)</span>
                          <span>{progress.averageComprehensionScore}%</span>
                        </div>
                        <Progress value={progress.averageComprehensionScore} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Game Performance</span>
                          <span>{progress.averageGameScore}%</span>
                        </div>
                        <Progress value={progress.averageGameScore} />
                      </div>
                      <div className="text-xs text-muted-foreground pt-2">
                        {progress.quizzesTaken} quizzes taken • {progress.gamesPlayed} games played • {progress.savedStories} stories saved
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {progress.storiesRead >= 1 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> First Story
                          </Badge>
                        )}
                        {progress.storiesRead >= 5 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> 5 Stories
                          </Badge>
                        )}
                        {progress.storiesRead >= 10 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> 10 Stories
                          </Badge>
                        )}
                        {progress.wordsLearned >= 10 && (
                          <Badge variant="secondary" className="mr-2">
                            <Star className="w-3 h-3 mr-1" /> Word Explorer (10+)
                          </Badge>
                        )}
                        {progress.wordsLearned >= 50 && (
                          <Badge variant="secondary" className="mr-2">
                            <Star className="w-3 h-3 mr-1" /> Vocabulary Master (50+)
                          </Badge>
                        )}
                        {progress.currentStreak >= 3 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> 3-Day Streak
                          </Badge>
                        )}
                        {progress.currentStreak >= 7 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> Week Warrior
                          </Badge>
                        )}
                        {progress.quizzesTaken >= 5 && progress.averageComprehensionScore >= 80 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> Quiz Star (80%+)
                          </Badge>
                        )}
                        {progress.storiesRead === 0 && progress.wordsLearned === 0 && (
                          <EmptyState message="No milestones yet — start reading to earn them!" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>This Week's Reading</CardTitle>
                    <CardDescription>Minutes read each day (Mon–Sun)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const maxMin = Math.max(...progress.weeklyMinutes, 1);
                        return (
                          <div key={day} className="space-y-2">
                            <div className="text-sm font-medium">{day}</div>
                            <div className="bg-muted rounded-lg p-3 h-20 flex items-end justify-center">
                              <div
                                className="bg-primary rounded w-6 transition-all"
                                style={{ height: `${(progress.weeklyMinutes[index] / maxMin) * 100}%`, minHeight: progress.weeklyMinutes[index] > 0 ? '4px' : '0' }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">{progress.weeklyMinutes[index]}m</div>
                          </div>
                        );
                      })}
                    </div>
                    {progress.weeklyMinutes.every(m => m === 0) && (
                      <EmptyState message="No reading sessions recorded this week yet." />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{progress.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Longest Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.quizzesTaken}</div>
                        <div className="text-xs text-muted-foreground">Quizzes Taken</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Games Played</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.savedStories}</div>
                        <div className="text-xs text-muted-foreground">Saved Stories</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Weekly Story Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Stories to read this week:</span>
                        <Badge variant="secondary">{weeklyGoal} stories</Badge>
                      </div>
                      <Progress value={Math.min(progress.storiesRead, weeklyGoal) / weeklyGoal * 100} />
                      <div className="text-sm text-muted-foreground">
                        {progress.storiesRead} of {weeklyGoal} completed
                        {progress.storiesRead >= weeklyGoal && " ✅ Goal reached!"}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setWeeklyGoal(Math.max(1, weeklyGoal - 1))}>-</Button>
                        <Button variant="outline" size="sm" onClick={() => setWeeklyGoal(weeklyGoal + 1)}>+</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Daily Reading Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Minutes to read daily:</span>
                        <Badge variant="secondary">{dailyTimeGoal} minutes</Badge>
                      </div>
                      <Progress value={Math.min(todayMinutes, dailyTimeGoal) / dailyTimeGoal * 100} />
                      <div className="text-sm text-muted-foreground">
                        {todayMinutes} of {dailyTimeGoal} minutes today
                        {todayMinutes >= dailyTimeGoal && " ✅ Goal reached!"}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDailyTimeGoal(Math.max(5, dailyTimeGoal - 5))}>-5m</Button>
                        <Button variant="outline" size="sm" onClick={() => setDailyTimeGoal(dailyTimeGoal + 5)}>+5m</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly breakdown with goal line */}
                <Card>
                  <CardHeader>
                    <CardTitle>This Week at a Glance</CardTitle>
                    <CardDescription>Daily reading minutes vs. your {dailyTimeGoal}-minute goal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const mins = progress.weeklyMinutes[index];
                        const metGoal = mins >= dailyTimeGoal;
                        return (
                          <div key={day} className="space-y-1">
                            <div className="text-xs font-medium">{day}</div>
                            <div className={`rounded-lg p-2 h-16 flex items-end justify-center ${metGoal ? 'bg-primary/10' : 'bg-muted'}`}>
                              <div
                                className={`rounded w-5 transition-all ${metGoal ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                style={{ height: `${Math.min((mins / Math.max(dailyTimeGoal, 1)) * 100, 100)}%`, minHeight: mins > 0 ? '4px' : '0' }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">{mins}m</div>
                            {metGoal && <div className="text-xs">✅</div>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-3 text-center">
                      {progress.weeklyMinutes.filter(m => m >= dailyTimeGoal).length} of 7 days met your daily goal this week
                    </div>
                  </CardContent>
                </Card>

                {/* Quiz & Games goals */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Quiz Mastery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Target: 70% average</span>
                        <Badge variant={progress.averageComprehensionScore >= 70 ? "default" : "secondary"}>
                          {progress.averageComprehensionScore}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(progress.averageComprehensionScore, 100)} />
                      <div className="text-sm text-muted-foreground">
                        {progress.quizzesTaken} quizzes completed
                        {progress.quizzesTaken === 0 && " — take a quiz after reading!"}
                        {progress.averageComprehensionScore >= 70 && progress.quizzesTaken > 0 && " ✅ Above target"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        Learning Games
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Target: 70% average</span>
                        <Badge variant={progress.averageGameScore >= 70 ? "default" : "secondary"}>
                          {progress.averageGameScore}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(progress.averageGameScore, 100)} />
                      <div className="text-sm text-muted-foreground">
                        {progress.gamesPlayed} games played
                        {progress.gamesPlayed === 0 && " — try a learning game!"}
                        {progress.averageGameScore >= 70 && progress.gamesPlayed > 0 && " ✅ Above target"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Streak & totals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Streak Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{progress.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Current Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Longest Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.totalReadingTimeMinutes}</div>
                        <div className="text-xs text-muted-foreground">Total Minutes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.wordsLearned}</div>
                        <div className="text-xs text-muted-foreground">Words Learned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <>
                {progress.storiesRead === 0 && progress.quizzesTaken === 0 && progress.gamesPlayed === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <EmptyState message={`No activity data for ${childLabel} yet. Start reading stories to see insights here!`} />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Quick stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.storiesRead}</div>
                        <div className="text-xs text-muted-foreground">Stories</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{formatTime(progress.totalReadingTimeMinutes)}</div>
                        <div className="text-xs text-muted-foreground">Total Time</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.wordsLearned}</div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.quizzesTaken}</div>
                        <div className="text-xs text-muted-foreground">Quizzes</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Games</div>
                      </CardContent></Card>
                    </div>

                    {/* Reading Habit */}
                    <Card>
                      <CardHeader><CardTitle>📖 Reading Habit</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {progress.currentStreak >= 7 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                            <h4 className="font-semibold text-foreground">🔥 Outstanding Streak!</h4>
                            <p className="text-muted-foreground">{childLabel} has read for {progress.currentStreak} days straight (longest ever: {progress.longestStreak}). This consistency builds strong literacy foundations.</p>
                          </div>
                        ) : progress.currentStreak >= 3 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                            <h4 className="font-semibold text-foreground">📈 Good Momentum!</h4>
                            <p className="text-muted-foreground">{childLabel} has a {progress.currentStreak}-day streak going (best: {progress.longestStreak} days). Try to beat the record!</p>
                          </div>
                        ) : progress.currentStreak > 0 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                            <h4 className="font-semibold text-foreground">🌱 Getting Started</h4>
                            <p className="text-muted-foreground">{childLabel} read {progress.currentStreak === 1 ? 'yesterday or today' : `${progress.currentStreak} days in a row`}. Encourage reading at the same time each day to build a habit.</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground/40">
                            <h4 className="font-semibold text-foreground">⏰ No Active Streak</h4>
                            <p className="text-muted-foreground">{childLabel} hasn't read recently. Even 10 minutes today can restart their streak!</p>
                          </div>
                        )}
                        {(() => {
                          const totalWeekMin = progress.weeklyMinutes.reduce((a, b) => a + b, 0);
                          const activeDays = progress.weeklyMinutes.filter(m => m > 0).length;
                          const avgPerDay = activeDays > 0 ? Math.round(totalWeekMin / activeDays) : 0;
                          return (
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-semibold text-foreground text-sm">This Week</h4>
                              <p className="text-muted-foreground text-sm mt-1">
                                {totalWeekMin} total minutes across {activeDays} active day{activeDays !== 1 ? 's' : ''}.
                                {activeDays > 0 && ` Average: ${avgPerDay} min/day.`}
                                {activeDays === 0 && ' No reading sessions recorded this week yet.'}
                              </p>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Comprehension */}
                    <Card>
                      <CardHeader><CardTitle>🧠 Comprehension Analysis</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {progress.quizzesTaken === 0 ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground text-sm">No quizzes taken yet. After reading a story, try the comprehension quiz to track understanding!</p>
                          </div>
                        ) : (
                          <>
                            <div className={`p-4 rounded-lg border-l-4 ${progress.averageComprehensionScore >= 80 ? 'bg-accent/30 border-primary' : progress.averageComprehensionScore >= 60 ? 'bg-accent/20 border-primary/60' : 'bg-muted border-muted-foreground/40'}`}>
                              <h4 className="font-semibold text-foreground">
                                Average: {progress.averageComprehensionScore}% across {progress.quizzesTaken} quiz{progress.quizzesTaken !== 1 ? 'zes' : ''}
                              </h4>
                              <p className="text-muted-foreground">
                                {progress.averageComprehensionScore >= 90
                                  ? `Exceptional! ${childLabel} consistently understands story content at a high level. Consider increasing difficulty.`
                                  : progress.averageComprehensionScore >= 80
                                  ? `Strong comprehension. The current difficulty level seems well-matched for ${childLabel}.`
                                  : progress.averageComprehensionScore >= 60
                                  ? `Developing well. ${childLabel} grasps main ideas but may miss details. Discussing stories together can help.`
                                  : `${childLabel} is building comprehension skills. Consider lowering difficulty or reading stories together.`}
                              </p>
                            </div>
                            {progress.recentQuizzes.length >= 3 && (() => {
                              const recent3 = progress.recentQuizzes.slice(0, 3);
                              const older3 = progress.recentQuizzes.slice(3, 6);
                              const recentAvg = Math.round(recent3.reduce((s, q) => s + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0) / recent3.length);
                              const olderAvg = older3.length > 0 ? Math.round(older3.reduce((s, q) => s + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0) / older3.length) : null;
                              const trend = olderAvg !== null ? recentAvg - olderAvg : null;
                              return (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-semibold text-foreground text-sm">Recent Trend</h4>
                                  <p className="text-muted-foreground text-sm mt-1">
                                    Last 3 quizzes: {recentAvg}%.
                                    {trend !== null && (
                                      trend > 5 ? ` 📈 Up ${trend} pts — great improvement!`
                                      : trend < -5 ? ` 📉 Down ${Math.abs(trend)} pts — may need easier content.`
                                      : ` ➡️ Stable compared to prior quizzes.`
                                    )}
                                  </p>
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Vocabulary & Games */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader><CardTitle>📚 Vocabulary</CardTitle></CardHeader>
                        <CardContent>
                          {progress.wordsLearned === 0 ? (
                            <p className="text-muted-foreground text-sm">No vocabulary words tracked yet. Tap highlighted words while reading to start!</p>
                          ) : (
                            <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                              <h4 className="font-semibold text-foreground">{progress.wordsLearned} Words Encountered</h4>
                              <p className="text-muted-foreground text-sm">
                                {progress.wordsLearned >= 100
                                  ? "Impressive vocabulary growth! This will help with more advanced stories."
                                  : progress.wordsLearned >= 30
                                  ? "Good progress! Each new word improves reading fluency."
                                  : "Every new word counts. Encourage tapping unfamiliar words during reading."}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>🎮 Game Performance</CardTitle></CardHeader>
                        <CardContent>
                          {progress.gamesPlayed === 0 ? (
                            <p className="text-muted-foreground text-sm">No games played yet. Learning games reinforce vocabulary and comprehension!</p>
                          ) : (
                            <div className={`p-4 rounded-lg border-l-4 ${progress.averageGameScore >= 70 ? 'bg-accent/30 border-primary' : 'bg-muted border-muted-foreground/40'}`}>
                              <h4 className="font-semibold text-foreground">{progress.averageGameScore}% avg across {progress.gamesPlayed} game{progress.gamesPlayed !== 1 ? 's' : ''}</h4>
                              <p className="text-muted-foreground text-sm">
                                {progress.averageGameScore >= 80
                                  ? "Excellent! Learning reinforcement is working well."
                                  : progress.averageGameScore >= 60
                                  ? "Solid scores. Games are helping reinforce content."
                                  : "Keep playing! Repeated practice locks in new words and concepts."}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actionable Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>💡 Recommendations</CardTitle>
                        <CardDescription>Personalized suggestions for {childLabel}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {progress.currentStreak === 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📅</span>
                              <p className="text-sm text-muted-foreground">Set a daily reading reminder. Even 10 minutes builds long-term literacy.</p>
                            </div>
                          )}
                          {progress.quizzesTaken < 3 && progress.storiesRead > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">✅</span>
                              <p className="text-sm text-muted-foreground">Try the comprehension quiz after each story — it helps with recall and understanding.</p>
                            </div>
                          )}
                          {progress.gamesPlayed === 0 && progress.storiesRead > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">🎮</span>
                              <p className="text-sm text-muted-foreground">Learning games are available after reading! They reinforce new vocabulary in a fun way.</p>
                            </div>
                          )}
                          {progress.averageComprehensionScore > 0 && progress.averageComprehensionScore < 60 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📖</span>
                              <p className="text-sm text-muted-foreground">Consider lowering reading difficulty. Building confidence at an easier level helps long-term growth.</p>
                            </div>
                          )}
                          {progress.averageComprehensionScore >= 90 && progress.quizzesTaken >= 5 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">🚀</span>
                              <p className="text-sm text-muted-foreground">{childLabel} is excelling! Consider raising the difficulty level for more challenge.</p>
                            </div>
                          )}
                          {progress.wordsLearned >= 20 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📝</span>
                              <p className="text-sm text-muted-foreground">Use the Teacher Word List (in Controls) to add specific vocabulary for stories.</p>
                            </div>
                          )}
                          {progress.storiesRead >= 5 && progress.savedStories === 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">💾</span>
                              <p className="text-sm text-muted-foreground">Save favorite stories to the library so {childLabel} can re-read them anytime!</p>
                            </div>
                          )}
                          {progress.currentStreak >= 7 && progress.averageComprehensionScore >= 70 && progress.gamesPlayed >= 3 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/20">
                              <span className="text-lg">⭐</span>
                              <p className="text-sm text-foreground font-medium">{childLabel} is doing great across the board! Keep up the excellent work.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 text-sm">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Heads up:</span> If child profiles appear missing or a newly added profile doesn't show, try refreshing the page. If this keeps happening, please{' '}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-feedback'))}
                  className="underline font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  send us feedback
                </button>{' '}
                so we can investigate.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{t('parent.children.title')}</CardTitle>
                <CardDescription>{t('parent.children.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChildSwitcher />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('parent.manager.title')}</CardTitle>
                <CardDescription>{t('parent.manager.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChildManager />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teacher Word List</CardTitle>
                <CardDescription>
                  Add vocabulary words you'd like the AI to weave into your child's stories. 
                  {activeChild ? (
                    <> This list is specific to <strong>{activeChild.display_name}</strong> — switch children above to manage a different list.</>
                  ) : (
                    <> You're editing the <strong>default list</strong>, which applies to <strong>all child profiles</strong>. To set words for a specific child, select them above first.</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isPremiumUser && (
                  <div className="text-sm text-muted-foreground">Premium feature — upgrade to enable.</div>
                )}
                <TagInput
                  value={teacherWords}
                  onChange={setTeacherWords}
                  placeholder="Add a word, then press Enter"
                  disabled={!isPremiumUser || twLoading || twSaving}
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-muted-foreground">
                    {teacherWordCount}/50 words • Changes apply after you Save.
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={!isPremiumUser || twLoading || twSaving} onClick={() => setTeacherWords('')}>
                      Clear list
                    </Button>
                    <Button onClick={saveTeacherWords} disabled={!isPremiumUser || twLoading || twSaving}>
                      {twSaving ? 'Saving...' : 'Save list'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  📝 Currently editing: <strong>{activeChild ? activeChild.display_name : 'Default (all children)'}</strong> • Up to 50 words saved, 20 used per story.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parent Controls</CardTitle>
                <CardDescription>Set reading guardrails for your child's story experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lockDifficulty" className="text-sm font-medium">Lock reading difficulty</Label>
                    <Switch id="lockDifficulty" checked={guardrails.lockDifficulty} onCheckedChange={(v) => setGuardrails({ ...guardrails, lockDifficulty: v })} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When turned on, your child cannot change the reading difficulty level themselves.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum level</Label>
                  <p className="text-xs text-muted-foreground">
                    Stories will never go below this difficulty level.
                  </p>
                  {(() => {
                    const selected = guardrails.minDifficulty === 'advanced' ? `advanced:${guardrails.minExpertGrade}` : guardrails.minDifficulty;
                    return (
                      <Select
                        value={selected}
                        onValueChange={(v) => {
                          if (v.startsWith('advanced:')) {
                            const grade = v.split(':')[1] as ExpertGradeLevel;
                            setGuardrails({ ...guardrails, minDifficulty: 'expert', minExpertGrade: grade });
                          } else {
                            setGuardrails({ ...guardrails, minDifficulty: v, minExpertGrade: '6th' });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-reader">Pre-Reader</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="developing">Developing</SelectItem>
                          <SelectItem value="independent">Independent</SelectItem>
                          <SelectItem value="advanced:6th">Advanced — 6th</SelectItem>
                          <SelectItem value="advanced:7th">Advanced — 7th</SelectItem>
                          <SelectItem value="advanced:8th">Advanced — 8th</SelectItem>
                          <SelectItem value="advanced:9th">Advanced — 9th</SelectItem>
                          <SelectItem value="advanced:10th">Advanced — 10th</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDecr" className="text-sm font-medium">Allow decreasing below minimum</Label>
                    <Switch id="allowDecr" checked={guardrails.allowDecreaseBelowMin} onCheckedChange={(v) => setGuardrails({ ...guardrails, allowDecreaseBelowMin: v })} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When on, the system may occasionally generate slightly easier content if your child is struggling.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button disabled={saving} onClick={async () => {
                    try {
                      setSaving(true);
                      const backendGuardrails = {
                        ...guardrails,
                        minDifficulty: guardrails.minDifficulty === 'expert' ? 'expert' : DifficultyLevelMapper.normalizeLevel(guardrails.minDifficulty)
                      };
                      await ParentGuardrailsService.saveGuardrails(backendGuardrails);
                      toast({ title: 'Settings saved' });
                    } catch (e) {
                      toast({ title: 'Could not save settings', variant: 'destructive' });
                    } finally {
                      setSaving(false);
                    }
                  }}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz & Game Results</CardTitle>
                  <CardDescription>
                    {activeChild ? `Results for ${activeChild.display_name}` : 'Results across all children'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {progress.recentQuizzes.length === 0 && progress.recentGames.length === 0 ? (
                    <EmptyState message="No quiz or game results yet. Complete a story quiz or play a learning game to see results here." />
                  ) : (
                    <>
                      {/* Summary cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">Quiz Average</div>
                            <div className="text-2xl font-bold">{progress.averageComprehensionScore}%</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">Quizzes Taken</div>
                            <div className="text-2xl font-bold">{progress.quizzesTaken}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">Game Average</div>
                            <div className="text-2xl font-bold">{progress.averageGameScore}%</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">Games Played</div>
                            <div className="text-2xl font-bold">{progress.gamesPlayed}</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent quizzes */}
                      {progress.recentQuizzes.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Recent Quizzes</div>
                          <div className="space-y-2">
                            {progress.recentQuizzes.slice(0, 10).map((q, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="text-sm font-medium">{q.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(q.date).toLocaleDateString()} • {q.mode}
                                  </div>
                                </div>
                                <Badge variant={q.total > 0 && (q.score / q.total) >= 0.7 ? "default" : "secondary"}>
                                  {q.score}/{q.total}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent games */}
                      {progress.recentGames.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" /> Recent Games
                          </div>
                          <div className="space-y-2">
                            {progress.recentGames.slice(0, 10).map((g, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="text-sm font-medium capitalize">{g.type}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(g.date).toLocaleDateString()}
                                  </div>
                                </div>
                                <Badge variant={g.maxScore > 0 && (g.score / g.maxScore) >= 0.7 ? "default" : "secondary"}>
                                  {g.score}/{g.maxScore}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
