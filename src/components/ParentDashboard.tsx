import { uiGradeLabel } from "@/i18n/gradeLabel";
import { uiText, useUiLanguage } from "@/i18n/uiText";
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
import { ChildrenList } from "@/components/children/ChildrenList";
import { useTranslation } from "react-i18next";
import { TagInput } from "@/components/ui/tag-input";
import EnhancedSubscriptionManager from "@/services/enhancedSubscriptionManager";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { GRADES, gradeLabel, minimumGradeForGuardrail, guardrailForGrade, QUIZ_SKILLS, QUIZ_SKILL_LABELS } from "@/lib/grades";
import { useChildProgressData } from "@/hooks/useChildProgressData";

interface ParentDashboardProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

export const ParentDashboard = ({ userInfo, isVisible, onClose }: ParentDashboardProps) => {
  useUiLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [guardrails, setGuardrails] = useState<{ lockDifficulty: boolean; minDifficulty: string; minExpertGrade: ExpertGradeLevel; minReadingGrade?: string | null; allowDecreaseBelowMin: boolean }>({
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
          minReadingGrade: g.minReadingGrade ?? null,
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
          .select('id, active_child_id, story_preferences')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) { DebugLogger.warn('error', 'User preferences fetch failed', { error }); return; }
        setPrefsRowId((data as any)?.id ?? null);
        setActiveChildId((data as any)?.active_child_id ?? null);
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
            .select('id, active_child_id, story_preferences')
            .eq('user_id', user.id)
            .maybeSingle();
          setPrefsRowId((data as any)?.id ?? null);
          setActiveChildId((data as any)?.active_child_id ?? null);
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
      toast({ title: uiText("Saved word list") });
    } catch (e) {
      toast({ title: uiText("Could not save word list"), variant: 'destructive' });
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
      <span>{uiText("Loading data...")}</span>
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
          <CardTitle className="text-2xl">{childLabel}{uiText("'s Learning Dashboard")}</CardTitle>
          <CardDescription>
            {showingAllChildren
              ? uiText("Showing data across all children. Select a child in Controls to filter.")
              : `Showing data for ${childLabel}`}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full flex flex-wrap items-center justify-end gap-2 mb-4">
          <Label className="text-sm text-muted-foreground">{uiText("Show section (tap to choose):")}</Label>
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={uiText("Select section")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">{uiText("Overview")}</SelectItem>
              <SelectItem value="progress">{uiText("Progress")}</SelectItem>
              <SelectItem value="goals">{uiText("Goals")}</SelectItem>
              <SelectItem value="insights">{uiText("Reports")}</SelectItem>
              <SelectItem value="controls">{uiText("Controls")}</SelectItem>
              <SelectItem value="quizzes">{uiText("Quizzes")}</SelectItem>
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
                      <div className="text-sm text-muted-foreground">{uiText("Stories Read")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{formatTime(progress.totalReadingTimeMinutes)}</div>
                      <div className="text-sm text-muted-foreground">{uiText("Reading Time")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{progress.wordsLearned}</div>
                      <div className="text-sm text-muted-foreground">{uiText("Words Learned")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{progress.currentStreak}</div>
                      <div className="text-sm text-muted-foreground">{uiText("Day Streak")}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {uiText("Performance Summary")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{uiText("Comprehension (Quizzes)")}</span>
                          <span>{progress.averageComprehensionScore}%</span>
                        </div>
                        <Progress value={progress.averageComprehensionScore} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{uiText("Game Performance")}</span>
                          <span>{progress.averageGameScore}%</span>
                        </div>
                        <Progress value={progress.averageGameScore} />
                      </div>
                      <div className="text-xs text-muted-foreground pt-2">
                        {progress.quizzesTaken} {uiText("quizzes taken •")} {progress.gamesPlayed} {uiText("games played •")} {progress.savedStories} {uiText("stories saved")}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{uiText("Milestones")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {progress.storiesRead >= 1 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("First Story")}
                          </Badge>
                        )}
                        {progress.storiesRead >= 5 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("5 Stories")}
                          </Badge>
                        )}
                        {progress.storiesRead >= 10 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("10 Stories")}
                          </Badge>
                        )}
                        {progress.wordsLearned >= 10 && (
                          <Badge variant="secondary" className="mr-2">
                            <Star className="w-3 h-3 mr-1" /> {uiText("Word Explorer (10+)")}
                          </Badge>
                        )}
                        {progress.wordsLearned >= 50 && (
                          <Badge variant="secondary" className="mr-2">
                            <Star className="w-3 h-3 mr-1" /> {uiText("Vocabulary Master (50+)")}
                          </Badge>
                        )}
                        {progress.currentStreak >= 3 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("3-Day Streak")}
                          </Badge>
                        )}
                        {progress.currentStreak >= 7 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("Week Warrior")}
                          </Badge>
                        )}
                        {progress.quizzesTaken >= 5 && progress.averageComprehensionScore >= 80 && (
                          <Badge variant="secondary" className="mr-2">
                            <Award className="w-3 h-3 mr-1" /> {uiText("Quiz Star (80%+)")}
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
                    <CardTitle>{uiText("This Week's Reading")}</CardTitle>
                    <CardDescription>{uiText("Minutes read each day (Mon–Sun)")}</CardDescription>
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
                    <CardTitle>{uiText("Overall Stats")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{progress.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Longest Streak")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.quizzesTaken}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Quizzes Taken")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Games Played")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.savedStories}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Saved Stories")}</div>
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
                        {uiText("Weekly Story Goal")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{uiText("Stories to read this week:")}</span>
                        <Badge variant="secondary">{weeklyGoal} {uiText("stories")}</Badge>
                      </div>
                      <Progress value={Math.min(progress.storiesRead, weeklyGoal) / weeklyGoal * 100} />
                      <div className="text-sm text-muted-foreground">
                        {progress.storiesRead} {uiText("of")} {weeklyGoal} {uiText("completed")}
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
                        {uiText("Daily Reading Goal")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{uiText("Minutes to read daily:")}</span>
                        <Badge variant="secondary">{dailyTimeGoal} {uiText("minutes")}</Badge>
                      </div>
                      <Progress value={Math.min(todayMinutes, dailyTimeGoal) / dailyTimeGoal * 100} />
                      <div className="text-sm text-muted-foreground">
                        {todayMinutes} {uiText("of")} {dailyTimeGoal} {uiText("minutes today")}
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
                    <CardTitle>{uiText("This Week at a Glance")}</CardTitle>
                    <CardDescription>{uiText("Daily reading minutes vs. your")} {dailyTimeGoal}{uiText("-minute goal")}</CardDescription>
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
                      {progress.weeklyMinutes.filter(m => m >= dailyTimeGoal).length} {uiText("of 7 days met your daily goal this week")}
                    </div>
                  </CardContent>
                </Card>

                {/* Quiz & Games goals */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        {uiText("Quiz Mastery")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{uiText("Target: 70% average")}</span>
                        <Badge variant={progress.averageComprehensionScore >= 70 ? "default" : "secondary"}>
                          {progress.averageComprehensionScore}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(progress.averageComprehensionScore, 100)} />
                      <div className="text-sm text-muted-foreground">
                        {progress.quizzesTaken} {uiText("quizzes completed")}
                        {progress.quizzesTaken === 0 && " — take a quiz after reading!"}
                        {progress.averageComprehensionScore >= 70 && progress.quizzesTaken > 0 && " ✅ Above target"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        {uiText("Learning Games")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{uiText("Target: 70% average")}</span>
                        <Badge variant={progress.averageGameScore >= 70 ? "default" : "secondary"}>
                          {progress.averageGameScore}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(progress.averageGameScore, 100)} />
                      <div className="text-sm text-muted-foreground">
                        {progress.gamesPlayed} {uiText("games played")}
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
                      {uiText("Streak Progress")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{progress.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Current Streak")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Longest Streak")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.totalReadingTimeMinutes}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Total Minutes")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{progress.wordsLearned}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Words Learned")}</div>
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
                        <div className="text-xs text-muted-foreground">{uiText("Stories")}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{formatTime(progress.totalReadingTimeMinutes)}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Total Time")}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.wordsLearned}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Words")}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.quizzesTaken}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Quizzes")}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{progress.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">{uiText("Games")}</div>
                      </CardContent></Card>
                    </div>

                    {/* Reading Habit */}
                    <Card>
                      <CardHeader><CardTitle>{uiText("📖 Reading Habit")}</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {progress.currentStreak >= 7 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                            <h4 className="font-semibold text-foreground">{uiText("🔥 Outstanding Streak!")}</h4>
                            <p className="text-muted-foreground">{childLabel} {uiText("has read for")} {progress.currentStreak} {uiText("days straight (longest ever:")} {progress.longestStreak}{uiText("). This consistency builds strong literacy foundations.")}</p>
                          </div>
                        ) : progress.currentStreak >= 3 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                            <h4 className="font-semibold text-foreground">{uiText("📈 Good Momentum!")}</h4>
                            <p className="text-muted-foreground">{childLabel} {uiText("has a")} {progress.currentStreak}{uiText("-day streak going (best:")} {progress.longestStreak} {uiText("days). Try to beat the record!")}</p>
                          </div>
                        ) : progress.currentStreak > 0 ? (
                          <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                            <h4 className="font-semibold text-foreground">{uiText("🌱 Getting Started")}</h4>
                            <p className="text-muted-foreground">{childLabel} {uiText("read")} {progress.currentStreak === 1 ? uiText("yesterday or today") : `${progress.currentStreak} days in a row`}{uiText(". Encourage reading at the same time each day to build a habit.")}</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground/40">
                            <h4 className="font-semibold text-foreground">{uiText("⏰ No Active Streak")}</h4>
                            <p className="text-muted-foreground">{childLabel} {uiText("hasn't read recently. Even 10 minutes today can restart their streak!")}</p>
                          </div>
                        )}
                        {(() => {
                          const totalWeekMin = progress.weeklyMinutes.reduce((a, b) => a + b, 0);
                          const activeDays = progress.weeklyMinutes.filter(m => m > 0).length;
                          const avgPerDay = activeDays > 0 ? Math.round(totalWeekMin / activeDays) : 0;
                          return (
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-semibold text-foreground text-sm">{uiText("This Week")}</h4>
                              <p className="text-muted-foreground text-sm mt-1">
                                {totalWeekMin} {uiText("total minutes across")} {activeDays} {uiText("active day")}{activeDays !== 1 ? 's' : ''}.
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
                      <CardHeader><CardTitle>{uiText("🧠 Comprehension Analysis")}</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {progress.quizzesTaken === 0 ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground text-sm">{uiText("No quizzes taken yet. After reading a story, try the comprehension quiz to track understanding!")}</p>
                          </div>
                        ) : (
                          <>
                            <div className={`p-4 rounded-lg border-l-4 ${progress.averageComprehensionScore >= 80 ? 'bg-accent/30 border-primary' : progress.averageComprehensionScore >= 60 ? 'bg-accent/20 border-primary/60' : 'bg-muted border-muted-foreground/40'}`}>
                              <h4 className="font-semibold text-foreground">
                                {uiText("Average:")} {progress.averageComprehensionScore}{uiText("% across")} {progress.quizzesTaken} {uiText("quiz")}{progress.quizzesTaken !== 1 ? 'zes' : ''}
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
                            {/* Strengths by skill: each quiz answer is saved with its skill. */}
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2" data-testid="quiz-skills">
                              <h4 className="font-semibold text-foreground text-sm">{uiText("Reading skills")}</h4>
                              <p className="text-sm text-foreground">
                                {progress.skillsSummary || `Skills show here after a few more quizzes (3 answers per skill).`}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {QUIZ_SKILLS.filter((sk) => progress.skills[sk]?.total).map((sk) => {
                                  const st = progress.skills[sk]!;
                                  const pct = Math.round((st.right / st.total) * 100);
                                  return (
                                    <div key={sk} className="text-xs text-muted-foreground flex justify-between gap-2">
                                      <span>{QUIZ_SKILL_LABELS[sk]}</span>
                                      <span className="tabular-nums">{st.right}/{st.total} ({pct}%)</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {progress.recentQuizzes.length >= 3 && (() => {
                              const recent3 = progress.recentQuizzes.slice(0, 3);
                              const older3 = progress.recentQuizzes.slice(3, 6);
                              const recentAvg = Math.round(recent3.reduce((s, q) => s + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0) / recent3.length);
                              const olderAvg = older3.length > 0 ? Math.round(older3.reduce((s, q) => s + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0) / older3.length) : null;
                              const trend = olderAvg !== null ? recentAvg - olderAvg : null;
                              return (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-semibold text-foreground text-sm">{uiText("Recent Trend")}</h4>
                                  <p className="text-muted-foreground text-sm mt-1">
                                    {uiText("Last 3 quizzes:")} {recentAvg}%.
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
                        <CardHeader><CardTitle>{uiText("📚 Vocabulary")}</CardTitle></CardHeader>
                        <CardContent>
                          {progress.wordsLearned === 0 ? (
                            <p className="text-muted-foreground text-sm">{uiText("No vocabulary words tracked yet. Tap highlighted words while reading to start!")}</p>
                          ) : (
                            <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                              <h4 className="font-semibold text-foreground">{progress.wordsLearned} {uiText("Words Encountered")}</h4>
                              <p className="text-muted-foreground text-sm">
                                {progress.wordsLearned >= 100
                                  ? uiText("Impressive vocabulary growth! This will help with more advanced stories.")
                                  : progress.wordsLearned >= 30
                                  ? uiText("Good progress! Each new word improves reading fluency.")
                                  : uiText("Every new word counts. Encourage tapping unfamiliar words during reading.")}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>{uiText("🎮 Game Performance")}</CardTitle></CardHeader>
                        <CardContent>
                          {progress.gamesPlayed === 0 ? (
                            <p className="text-muted-foreground text-sm">{uiText("No games played yet. Learning games reinforce vocabulary and comprehension!")}</p>
                          ) : (
                            <div className={`p-4 rounded-lg border-l-4 ${progress.averageGameScore >= 70 ? 'bg-accent/30 border-primary' : 'bg-muted border-muted-foreground/40'}`}>
                              <h4 className="font-semibold text-foreground">{progress.averageGameScore}{uiText("% avg across")} {progress.gamesPlayed} {uiText("game")}{progress.gamesPlayed !== 1 ? 's' : ''}</h4>
                              <p className="text-muted-foreground text-sm">
                                {progress.averageGameScore >= 80
                                  ? uiText("Excellent! Learning reinforcement is working well.")
                                  : progress.averageGameScore >= 60
                                  ? uiText("Solid scores. Games are helping reinforce content.")
                                  : uiText("Keep playing! Repeated practice locks in new words and concepts.")}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actionable Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{uiText("💡 Recommendations")}</CardTitle>
                        <CardDescription>{uiText("Personalized suggestions for")} {childLabel}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {progress.currentStreak === 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📅</span>
                              <p className="text-sm text-muted-foreground">{uiText("Set a daily reading reminder. Even 10 minutes builds long-term literacy.")}</p>
                            </div>
                          )}
                          {progress.quizzesTaken < 3 && progress.storiesRead > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">✅</span>
                              <p className="text-sm text-muted-foreground">{uiText("Try the comprehension quiz after each story — it helps with recall and understanding.")}</p>
                            </div>
                          )}
                          {progress.gamesPlayed === 0 && progress.storiesRead > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">🎮</span>
                              <p className="text-sm text-muted-foreground">{uiText("Learning games are available after reading! They reinforce new vocabulary in a fun way.")}</p>
                            </div>
                          )}
                          {progress.averageComprehensionScore > 0 && progress.averageComprehensionScore < 60 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📖</span>
                              <p className="text-sm text-muted-foreground">{uiText("Consider lowering reading difficulty. Building confidence at an easier level helps long-term growth.")}</p>
                            </div>
                          )}
                          {progress.averageComprehensionScore >= 90 && progress.quizzesTaken >= 5 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">🚀</span>
                              <p className="text-sm text-muted-foreground">{childLabel} {uiText("is excelling! Consider raising the difficulty level for more challenge.")}</p>
                            </div>
                          )}
                          {progress.wordsLearned >= 20 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">📝</span>
                              <p className="text-sm text-muted-foreground">{uiText("Use the Teacher Word List (in Controls) to add specific vocabulary for stories.")}</p>
                            </div>
                          )}
                          {progress.storiesRead >= 5 && progress.savedStories === 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-lg">💾</span>
                              <p className="text-sm text-muted-foreground">{uiText("Save favorite stories to the library so")} {childLabel} {uiText("can re-read them anytime!")}</p>
                            </div>
                          )}
                          {progress.currentStreak >= 7 && progress.averageComprehensionScore >= 70 && progress.gamesPlayed >= 3 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/20">
                              <span className="text-lg">⭐</span>
                              <p className="text-sm text-foreground font-medium">{childLabel} {uiText("is doing great across the board! Keep up the excellent work.")}</p>
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
            {/* Children: one shared list (add, edit, read as) */}
            <ChildrenList />

            <Card>
              <CardHeader>
                <CardTitle>{uiText("Teacher Word List")}</CardTitle>
                <CardDescription>
                  {uiText("Add vocabulary words you'd like the AI to weave into your child's stories.")}
                  {activeChild ? (
                    <> {uiText("This list is specific to")} <strong>{activeChild.display_name}</strong> {uiText("— switch children above to manage a different list.")}</>
                  ) : (
                    <> {uiText("You're editing the")} <strong>{uiText("default list")}</strong>{uiText(", which applies to")} <strong>{uiText("all child profiles")}</strong>{uiText(". To set words for a specific child, select them above first.")}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isPremiumUser && (
                  <div className="text-sm text-muted-foreground">{uiText("Premium feature — upgrade to enable.")}</div>
                )}
                <TagInput
                  value={teacherWords}
                  onChange={setTeacherWords}
                  placeholder={uiText("Add a word, then press Enter")}
                  disabled={!isPremiumUser || twLoading || twSaving}
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-muted-foreground">
                    {teacherWordCount}{uiText("/50 words • Changes apply after you Save.")}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={!isPremiumUser || twLoading || twSaving} onClick={() => setTeacherWords('')}>
                      {uiText("Clear list")}
                    </Button>
                    <Button onClick={saveTeacherWords} disabled={!isPremiumUser || twLoading || twSaving}>
                      {twSaving ? uiText("Saving...") : uiText("Save list")}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {uiText("📝 Currently editing:")} <strong>{activeChild ? activeChild.display_name : uiText("Default (all children)")}</strong> {uiText("• Up to 50 words saved, 20 used per story.")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{uiText("Parent Controls")}</CardTitle>
                <CardDescription>{uiText("Set reading guardrails for your child's story experience")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lockDifficulty" className="text-sm font-medium">{uiText("Lock reading difficulty")}</Label>
                    <Switch id="lockDifficulty" checked={guardrails.lockDifficulty} onCheckedChange={(v) => setGuardrails({ ...guardrails, lockDifficulty: v })} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uiText("When turned on, your child cannot change the reading difficulty level themselves.")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="never-easier" className="text-sm font-medium">{uiText("Never easier than")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {uiText("Stories will never be written below this grade.")}
                  </p>
                  {(() => {
                    // Shown and saved as a grade; the older stored fields are kept in step
                    // (guardrailForGrade). Map: docs/reading-levels.md.
                    const selected = minimumGradeForGuardrail(guardrails.minDifficulty, guardrails.minExpertGrade, guardrails.minReadingGrade);
                    return (
                      <Select value={selected} onValueChange={(v) => setGuardrails({ ...guardrails, ...guardrailForGrade(v) })}>
                        <SelectTrigger id="never-easier" data-testid="never-easier-than">
                          <SelectValue placeholder={uiText("Choose a grade")} />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((g) => (
                            <SelectItem key={g} value={g}>{uiGradeLabel(g)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDecr" className="text-sm font-medium">{uiText("Allow decreasing below minimum")}</Label>
                    <Switch id="allowDecr" checked={guardrails.allowDecreaseBelowMin} onCheckedChange={(v) => setGuardrails({ ...guardrails, allowDecreaseBelowMin: v })} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uiText("When on, the system may occasionally generate slightly easier content if your child is struggling.")}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button disabled={saving} onClick={async () => {
                    try {
                      setSaving(true);
                      // Saved as the grade plus the older fields kept in step (guardrailForGrade).
                      const backendGuardrails = {
                        ...guardrails,
                        ...guardrailForGrade(minimumGradeForGuardrail(guardrails.minDifficulty, guardrails.minExpertGrade, guardrails.minReadingGrade)),
                      };
                      await ParentGuardrailsService.saveGuardrails(backendGuardrails);
                      toast({ title: uiText('Settings saved') });
                    } catch (e) {
                      toast({ title: uiText('Could not save settings'), variant: 'destructive' });
                    } finally {
                      setSaving(false);
                    }
                  }}>{uiText("Save")}</Button>
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
                  <CardTitle>{uiText("Quiz & Game Results")}</CardTitle>
                  <CardDescription>
                    {activeChild ? `Results for ${activeChild.display_name}` : uiText("Results across all children")}
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
                            <div className="text-xs text-muted-foreground">{uiText("Quiz Average")}</div>
                            <div className="text-2xl font-bold">{progress.averageComprehensionScore}%</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">{uiText("Quizzes Taken")}</div>
                            <div className="text-2xl font-bold">{progress.quizzesTaken}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">{uiText("Game Average")}</div>
                            <div className="text-2xl font-bold">{progress.averageGameScore}%</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-xs text-muted-foreground">{uiText("Games Played")}</div>
                            <div className="text-2xl font-bold">{progress.gamesPlayed}</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent quizzes */}
                      {progress.recentQuizzes.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{uiText("Recent Quizzes")}</div>
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
                            <Gamepad2 className="w-4 h-4" /> {uiText("Recent Games")}
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
