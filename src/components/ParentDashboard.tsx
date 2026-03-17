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
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDailyTimeGoal(Math.max(5, dailyTimeGoal - 5))}>-5m</Button>
                      <Button variant="outline" size="sm" onClick={() => setDailyTimeGoal(dailyTimeGoal + 5)}>+5m</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {progress.loading ? <LoadingOverlay /> : (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>Based on {childLabel}'s actual activity data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progress.storiesRead === 0 && progress.quizzesTaken === 0 ? (
                    <EmptyState message={`No activity data for ${childLabel} yet. Start reading stories to see insights here!`} />
                  ) : (
                    <div className="space-y-3">
                      {/* Streak insight */}
                      {progress.currentStreak >= 3 ? (
                        <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                          <h4 className="font-semibold text-foreground">Great Consistency!</h4>
                          <p className="text-muted-foreground">{childLabel} has a {progress.currentStreak}-day reading streak (longest: {progress.longestStreak} days). Keep it going!</p>
                        </div>
                      ) : progress.currentStreak > 0 ? (
                        <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                          <h4 className="font-semibold text-foreground">Building a Habit</h4>
                          <p className="text-muted-foreground">{childLabel} has read {progress.currentStreak} day{progress.currentStreak > 1 ? 's' : ''} in a row. Encourage daily reading to build a strong streak!</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground/40">
                          <h4 className="font-semibold text-foreground">Time to Read!</h4>
                          <p className="text-muted-foreground">{childLabel} hasn't read today. A short reading session can help build consistency.</p>
                        </div>
                      )}

                      {/* Comprehension insight */}
                      {progress.quizzesTaken > 0 && (
                        <div className={`p-4 rounded-lg border-l-4 ${progress.averageComprehensionScore >= 70 ? 'bg-accent/30 border-primary' : 'bg-muted border-muted-foreground/40'}`}>
                          <h4 className="font-semibold text-foreground">
                            Comprehension: {progress.averageComprehensionScore}%
                          </h4>
                          <p className="text-muted-foreground">
                            {progress.averageComprehensionScore >= 80
                              ? `${childLabel} is demonstrating strong comprehension across ${progress.quizzesTaken} quizzes. Consider increasing the reading difficulty.`
                              : progress.averageComprehensionScore >= 60
                              ? `${childLabel} is doing well on comprehension. More practice with quizzes will help build confidence.`
                              : `${childLabel} may benefit from slightly easier stories to build comprehension skills before moving up in difficulty.`}
                          </p>
                        </div>
                      )}

                      {/* Vocabulary insight */}
                      {progress.wordsLearned > 0 && (
                        <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary/60">
                          <h4 className="font-semibold text-foreground">Vocabulary Growth</h4>
                          <p className="text-muted-foreground">
                            {progress.wordsLearned} words encountered so far.
                            {progress.wordsLearned >= 50
                              ? " Excellent vocabulary building!"
                              : " Keep reading to discover more new words."}
                          </p>
                        </div>
                      )}

                      {/* Reading volume insight */}
                      {progress.totalReadingTimeMinutes > 0 && (
                        <div className="p-4 bg-secondary/30 rounded-lg border-l-4 border-secondary">
                          <h4 className="font-semibold text-foreground">Reading Volume</h4>
                          <p className="text-muted-foreground">
                            {childLabel} has read for {formatTime(progress.totalReadingTimeMinutes)} across {progress.storiesRead} completed {progress.storiesRead === 1 ? 'story' : 'stories'}.
                            {progress.gamesPlayed > 0 ? ` They've also played ${progress.gamesPlayed} learning games.` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
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
