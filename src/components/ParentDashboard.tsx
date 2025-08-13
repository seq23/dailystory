import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, TrendingUp, Award, Star, Settings, Calendar } from "lucide-react";
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from "@/types";
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
interface ParentDashboardProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

interface ReadingStats {
  totalReadingTime: number;
  storiesCompleted: number;
  vocabularyWords: number;
  currentStreak: number;
  averageSpeed: number;
  comprehensionScore: number;
  weeklyProgress: number[];
  achievements: string[];
  improvementAreas: string[];
}

export const ParentDashboard = ({ userInfo, isVisible, onClose }: ParentDashboardProps) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReadingStats>({
    totalReadingTime: 240, // minutes
    storiesCompleted: 12,
    vocabularyWords: 45,
    currentStreak: 7,
    averageSpeed: 85, // WPM
    comprehensionScore: 78,
    weeklyProgress: [20, 35, 25, 40, 30, 45, 50],
    achievements: ["First Story", "Word Explorer", "Week Warrior"],
    improvementAreas: ["Reading Speed", "Complex Vocabulary"]
  });

  const [weeklyGoal, setWeeklyGoal] = useState(5); // stories per week
  const [dailyTimeGoal, setDailyTimeGoal] = useState(20); // minutes per day
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [guardrails, setGuardrails] = useState<{ lockDifficulty: boolean; minDifficulty: DifficultyLevel; minExpertGrade: ExpertGradeLevel; allowDecreaseBelowMin: boolean }>({
    lockDifficulty: false,
    minDifficulty: 'beginner',
    minExpertGrade: '6th',
    allowDecreaseBelowMin: false,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'goals' | 'insights' | 'controls' | 'quizzes'>('controls');
  const [quizScores, setQuizScores] = useState<number[]>([]);
  // Premium: Teacher word list (per child)
  const [teacherWords, setTeacherWords] = useState<string>("");
  const [twLoading, setTwLoading] = useState<boolean>(false);
  const [twSaving, setTwSaving] = useState<boolean>(false);
  const [prefsRowId, setPrefsRowId] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [storyPrefs, setStoryPrefs] = useState<any>({});
const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
const { activeChild } = useChildProfiles();
const teacherWordCount = (teacherWords || '').split(',').map((w) => w.trim()).filter(Boolean).length;
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const winPremium = (window as any)?.__IS_PREMIUM;
      const enhanced = await EnhancedSubscriptionManager.isPremiumUser().catch(() => false);
      const val = Boolean(typeof winPremium !== 'undefined' ? winPremium : enhanced);
      if (mounted) setIsPremiumUser(val);
    } catch {
      if (mounted) setIsPremiumUser(Boolean((window as any)?.__IS_PREMIUM) || false);
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
        console.warn('Failed to load guardrails', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('reading_sessions')
          .select('comprehension_score')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(20);
        if (error) {
          console.warn('Failed to load quiz results', error);
          return;
        }
        const scores = (data || [])
          .map((r: any) => r.comprehension_score)
          .filter((n: any) => typeof n === 'number' && n >= 0 && n <= 100);
        setQuizScores(scores);
      } catch (e) {
        console.warn('Quiz fetch error', e);
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
        if (error) { console.warn('Prefs fetch failed', error); return; }
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
      // Re-run loader
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
      const arr = (teacherWords || '')
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
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

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{userInfo.name}'s Learning Dashboard</CardTitle>
          <CardDescription>Track reading progress and set learning goals</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Section selector - dropdown across devices */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.storiesCompleted}</div>
                  <div className="text-sm text-muted-foreground">Stories Read</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{formatTime(stats.totalReadingTime)}</div>
                  <div className="text-sm text-muted-foreground">Reading Time</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.vocabularyWords}</div>
                  <div className="text-sm text-muted-foreground">Words Learned</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Reading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reading Speed</span>
                      <span>{stats.averageSpeed} WPM</span>
                    </div>
                    <Progress value={Math.min(stats.averageSpeed, 120) / 120 * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Comprehension</span>
                      <span>{stats.comprehensionScore}%</span>
                    </div>
                    <Progress value={stats.comprehensionScore} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        <Award className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Reading Progress</CardTitle>
                <CardDescription>Minutes read each day this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="space-y-2">
                      <div className="text-sm font-medium">{day}</div>
                      <div className="bg-blue-100 rounded-lg p-3 h-20 flex items-end justify-center">
                        <div 
                          className="bg-blue-500 rounded w-6"
                          style={{ height: `${(stats.weeklyProgress[index] / 60) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{stats.weeklyProgress[index]}m</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>Personalized recommendations based on reading patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">{area}</span>
                      <Badge variant="outline">Focus Area</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
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
                  <Progress value={(stats.storiesCompleted % 7) / weeklyGoal * 100} />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setWeeklyGoal(Math.max(1, weeklyGoal - 1))}
                    >
                      -
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setWeeklyGoal(weeklyGoal + 1)}
                    >
                      +
                    </Button>
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
                  <Progress value={Math.min(stats.weeklyProgress[6], dailyTimeGoal) / dailyTimeGoal * 100} />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDailyTimeGoal(Math.max(5, dailyTimeGoal - 5))}
                    >
                      -5m
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDailyTimeGoal(dailyTimeGoal + 5)}
                    >
                      +5m
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
                <CardDescription>AI-powered analysis of reading patterns and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800">Excellent Progress!</h4>
                    <p className="text-green-700">{userInfo.name} has maintained a {stats.currentStreak}-day reading streak. This consistency is building strong reading habits.</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800">Vocabulary Growth</h4>
                    <p className="text-blue-700">With {stats.vocabularyWords} new words learned, {userInfo.name} is expanding their vocabulary at an excellent pace.</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-800">Reading Speed</h4>
                    <p className="text-yellow-700">Consider encouraging {userInfo.name} to focus on reading speed. Current pace is good, but there's room for improvement.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            {/* Active Child Selector */}
            <Card>
              <CardHeader>
                <CardTitle>{t('parent.children.title')}</CardTitle>
                <CardDescription>{t('parent.children.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChildSwitcher />
              </CardContent>
            </Card>

            {/* Child Profiles Manager */}
            <Card>
              <CardHeader>
                <CardTitle>{t('parent.manager.title')}</CardTitle>
                <CardDescription>{t('parent.manager.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChildManager />
              </CardContent>
            </Card>

            {/* Teacher word list (per child) - Premium */}
            <Card>
              <CardHeader>
                <CardTitle>Teacher word list (per child)</CardTitle>
                <CardDescription>Words here guide the AI to include them in premium live stories.</CardDescription>
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
                <div className="text-xs text-muted-foreground">Applies to: {activeChild ? activeChild.display_name : 'Default'} • Max 50 stored; up to 20 used per story.</div>
              </CardContent>
            </Card>

            {/* Existing Guardrails Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Parent Controls</CardTitle>
                <CardDescription>Set reading guardrails that the reader will follow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lockDifficulty" className="text-sm font-medium">Lock reading difficulty</Label>
                  <Switch id="lockDifficulty" checked={guardrails.lockDifficulty} onCheckedChange={(v) => setGuardrails({ ...guardrails, lockDifficulty: v })} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum level</Label>
                  {(() => {
                    const selected = guardrails.minDifficulty === 'expert' ? `expert:${guardrails.minExpertGrade}` : guardrails.minDifficulty;
                    return (
                      <Select
                        value={selected}
                        onValueChange={(v) => {
                          if (v.startsWith('expert:')) {
                            const grade = v.split(':')[1] as ExpertGradeLevel;
                            setGuardrails({ ...guardrails, minDifficulty: 'expert', minExpertGrade: grade });
                          } else {
                            setGuardrails({ ...guardrails, minDifficulty: v as DifficultyLevel, minExpertGrade: '6th' });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Pre-Reader</SelectItem>
                          <SelectItem value="easy">Beginner</SelectItem>
                          <SelectItem value="medium">Developing</SelectItem>
                          <SelectItem value="hard">Independent</SelectItem>
                          <SelectItem value="expert:6th">Advanced — 6th</SelectItem>
                          <SelectItem value="expert:7th">Advanced — 7th</SelectItem>
                          <SelectItem value="expert:8th">Advanced — 8th</SelectItem>
                          <SelectItem value="expert:9th">Advanced — 9th</SelectItem>
                          <SelectItem value="expert:10th">Advanced — 10th</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allowDecr" className="text-sm font-medium">Allow decreasing below minimum (soft)</Label>
                  <Switch id="allowDecr" checked={guardrails.allowDecreaseBelowMin} onCheckedChange={(v) => setGuardrails({ ...guardrails, allowDecreaseBelowMin: v })} />
                </div>

                <div className="flex justify-end">
                  <Button disabled={saving} onClick={async () => {
                    try {
                      setSaving(true);
                      await ParentGuardrailsService.saveGuardrails(guardrails);
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
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
                <CardDescription>Comprehension scores from recent reading sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizScores.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No quiz results yet.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xs text-muted-foreground">Average Score</div>
                          <div className="text-2xl font-bold">{Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)}%</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xs text-muted-foreground">Best Score</div>
                          <div className="text-2xl font-bold">{Math.max(...quizScores)}%</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xs text-muted-foreground">Attempts</div>
                          <div className="text-2xl font-bold">{quizScores.length}</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recent scores</div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {quizScores.slice(0, 10).map((s, idx) => (
                          <div key={idx} className="p-2 rounded border flex items-center justify-between">
                            <span className="text-xs">#{idx + 1}</span>
                            <span className="font-medium">{s}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};