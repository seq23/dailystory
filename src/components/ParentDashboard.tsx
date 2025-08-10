import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
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

            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Minimum difficulty</Label>
                      <Select value={guardrails.minDifficulty} onValueChange={(v) => setGuardrails({ ...guardrails, minDifficulty: v as DifficultyLevel })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum" />
                        </SelectTrigger>
                        <SelectContent>
                          {(['beginner','easy','medium','hard','expert'] as DifficultyLevel[]).map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Minimum expert grade (expert mode)</Label>
                      <Select value={guardrails.minExpertGrade} onValueChange={(v) => setGuardrails({ ...guardrails, minExpertGrade: v as ExpertGradeLevel })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {(["6th","7th","8th","9th","10th"] as ExpertGradeLevel[]).map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};