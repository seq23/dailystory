import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Copy, 
  Users, 
  Settings, 
  Zap,
  RotateCcw,
  Info
} from 'lucide-react';
import { VoiceCatalogIntegration, initializeVoiceCatalog } from '@/services/voiceCatalog';
import { testVoiceCatalogSystem, quickTest } from '@/services/voiceCatalog/test';
import type { UserInfo } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  status: 'idle' | 'running' | 'success' | 'error';
  data?: any;
  error?: string;
  timing?: number;
}

interface DifficultyTestResult extends TestResult {
  difficulty?: string;
  voiceName?: string;
  score?: number;
}

const difficultyLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;

const sampleUsers: UserInfo[] = [
  {
    name: 'Emma',
    age: 8,
    grade: '3rd',
    gradeLevel: '3rd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'girl', skinTone: 'light' },
    favoriteColor: 'purple',
    favoriteAnimal: 'cat',
    favoriteFood: 'pizza',
    hobbies: 'painting, reading',
    specialRequest: 'I love adventures with magic',
    interests: ['magic', 'art', 'friendship'],
    readingLevel: 'medium',
    difficultyLevel: 'medium'
  },
  {
    name: 'Alex',
    age: 12,
    grade: '6th+',
    gradeLevel: '6th+',
    nativeLanguage: 'en',
    learningGoal: 'learn-english-language',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    favoriteFood: 'tacos',
    hobbies: 'gaming, sports',
    specialRequest: 'I want stories with technology and adventure',
    interests: ['technology', 'adventure', 'mystery'],
    readingLevel: 'hard',
    difficultyLevel: 'hard'
  }
];

export function VoiceCatalogTester() {
  const { toast } = useToast();
  const [systemStatus, setSystemStatus] = useState<TestResult>({ status: 'idle' });
  const [quickTestResult, setQuickTestResult] = useState<TestResult>({ status: 'idle' });
  const [difficultyTests, setDifficultyTests] = useState<Record<string, DifficultyTestResult>>({});
  const [userTests, setUserTests] = useState<TestResult>({ status: 'idle' });
  const [alternativesTest, setAlternativesTest] = useState<TestResult>({ status: 'idle' });
  const [fullSystemTest, setFullSystemTest] = useState<TestResult>({ status: 'idle' });
  
  const [selectedUser, setSelectedUser] = useState<UserInfo>(sampleUsers[0]);
  const [customUser, setCustomUser] = useState<Partial<UserInfo>>({});
  const [alternativesCount, setAlternativesCount] = useState(3);

  const runSystemInit = useCallback(async () => {
    setSystemStatus({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const stats = await initializeVoiceCatalog();
      const timing = performance.now() - startTime;
      setSystemStatus({ status: 'success', data: stats, timing });
      toast({ title: 'Success', description: 'Voice catalog system initialized successfully' });
    } catch (error) {
      const timing = performance.now() - startTime;
      setSystemStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timing 
      });
      toast({ title: 'Error', description: 'Failed to initialize voice catalog system', variant: 'destructive' });
    }
  }, [toast]);

  const runQuickTest = useCallback(async () => {
    setQuickTestResult({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const result = await quickTest();
      const timing = performance.now() - startTime;
      setQuickTestResult({ status: 'success', data: result, timing });
      toast({ title: 'Success', description: `Quick test passed: ${result.selectedVoice.pn}` });
    } catch (error) {
      const timing = performance.now() - startTime;
      setQuickTestResult({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timing 
      });
      toast({ title: 'Error', description: 'Quick test failed', variant: 'destructive' });
    }
  }, [toast]);

  const runDifficultyTest = useCallback(async (difficulty: string) => {
    setDifficultyTests(prev => ({ 
      ...prev, 
      [difficulty]: { status: 'running', difficulty } 
    }));
    const startTime = performance.now();
    
    try {
      const result = await VoiceCatalogIntegration.testVoiceSelection(difficulty as any);
      const timing = performance.now() - startTime;
      setDifficultyTests(prev => ({
        ...prev,
        [difficulty]: {
          status: 'success',
          difficulty,
          data: result,
          voiceName: result.selectedVoice.pn,
          score: result.compatibilityScore,
          timing
        }
      }));
    } catch (error) {
      const timing = performance.now() - startTime;
      setDifficultyTests(prev => ({
        ...prev,
        [difficulty]: {
          status: 'error',
          difficulty,
          error: error instanceof Error ? error.message : 'Unknown error',
          timing
        }
      }));
    }
  }, []);

  const runAllDifficultyTests = useCallback(async () => {
    for (const difficulty of difficultyLevels) {
      await runDifficultyTest(difficulty);
    }
  }, [runDifficultyTest]);

  const runUserTest = useCallback(async (user: UserInfo) => {
    setUserTests({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const result = await VoiceCatalogIntegration.selectAndPrepareVoice(
        user,
        user.difficultyLevel as any,
        { themes: user.interests, warmthPreference: 0.9 }
      );
      const timing = performance.now() - startTime;
      setUserTests({ status: 'success', data: { user, result }, timing });
      toast({ 
        title: 'Success', 
        description: `Voice selected for ${user.name}: ${result.selectedVoice.pn}` 
      });
    } catch (error) {
      const timing = performance.now() - startTime;
      setUserTests({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timing 
      });
      toast({ title: 'Error', description: `Failed to select voice for ${user.name}`, variant: 'destructive' });
    }
  }, [toast]);

  const runAlternativesTest = useCallback(async () => {
    setAlternativesTest({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const alternatives = await VoiceCatalogIntegration.getVoiceAlternatives(
        selectedUser, 
        selectedUser.difficultyLevel as any, 
        alternativesCount
      );
      const timing = performance.now() - startTime;
      setAlternativesTest({ status: 'success', data: alternatives, timing });
      toast({ 
        title: 'Success', 
        description: `Found ${alternatives.length} voice alternatives` 
      });
    } catch (error) {
      const timing = performance.now() - startTime;
      setAlternativesTest({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timing 
      });
      toast({ title: 'Error', description: 'Failed to get voice alternatives', variant: 'destructive' });
    }
  }, [selectedUser, alternativesCount, toast]);

  const runFullSystemTest = useCallback(async () => {
    setFullSystemTest({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const result = await testVoiceCatalogSystem();
      const timing = performance.now() - startTime;
      setFullSystemTest({ status: 'success', data: result, timing });
      toast({ title: 'Success', description: 'Full system test completed successfully' });
    } catch (error) {
      const timing = performance.now() - startTime;
      setFullSystemTest({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timing 
      });
      toast({ title: 'Error', description: 'Full system test failed', variant: 'destructive' });
    }
  }, [toast]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Content copied to clipboard' });
  }, [toast]);

  const renderTestStatus = (result: TestResult, showTiming = true) => {
    const getStatusIcon = () => {
      switch (result.status) {
        case 'running':
          return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
        case 'success':
          return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'error':
          return <XCircle className="w-4 h-4 text-red-500" />;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm text-muted-foreground">
          {result.status === 'running' && 'Running...'}
          {result.status === 'success' && 'Success'}
          {result.status === 'error' && 'Failed'}
          {result.status === 'idle' && 'Ready'}
        </span>
        {showTiming && result.timing && (
          <Badge variant="outline" className="text-xs">
            {result.timing.toFixed(0)}ms
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Initialization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  System Initialization
                </CardTitle>
                <CardDescription>
                  Initialize the voice catalog system and view statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={runSystemInit}
                    disabled={systemStatus.status === 'running'}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Initialize System
                  </Button>
                  {renderTestStatus(systemStatus)}
                </div>
                {systemStatus.data && (
                  <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                    <div><strong>Catalog Stats:</strong></div>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(systemStatus.data, null, 2)}
                    </pre>
                  </div>
                )}
                {systemStatus.error && (
                  <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                    {systemStatus.error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Test
                </CardTitle>
                <CardDescription>
                  Run a quick voice selection test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={runQuickTest}
                    disabled={quickTestResult.status === 'running'}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Quick Test
                  </Button>
                  {renderTestStatus(quickTestResult)}
                </div>
                {quickTestResult.data && (
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      {quickTestResult.data.selectedVoice.pn}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Score: {quickTestResult.data.compatibilityScore?.toFixed(2)}
                    </div>
                  </div>
                )}
                {quickTestResult.error && (
                  <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                    {quickTestResult.error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full System Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Full System Test
              </CardTitle>
              <CardDescription>
                Run comprehensive system test across all components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Button 
                  onClick={runFullSystemTest}
                  disabled={fullSystemTest.status === 'running'}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Brain className="w-4 h-4" />
                  Run Full Test Suite
                </Button>
                {renderTestStatus(fullSystemTest)}
              </div>
              {fullSystemTest.data && (
                <div className="text-sm p-3 bg-green-50 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-500 inline mr-2" />
                  All system tests completed successfully!
                </div>
              )}
              {fullSystemTest.error && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                  {fullSystemTest.error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Difficulty Testing Tab */}
        <TabsContent value="difficulty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Level Testing</CardTitle>
              <CardDescription>
                Test voice selection across all difficulty levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={runAllDifficultyTests}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Test All Levels
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {difficultyLevels.map((difficulty) => {
                  const result = difficultyTests[difficulty] || { status: 'idle' };
                  return (
                    <Card key={difficulty} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{difficulty}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runDifficultyTest(difficulty)}
                            disabled={result.status === 'running'}
                          >
                            Test
                          </Button>
                        </div>
                        
                        {renderTestStatus(result)}
                        
                        {result.voiceName && (
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.voiceName}
                            </Badge>
                            {result.score && (
                              <div className="text-xs text-muted-foreground">
                                Score: {result.score.toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {result.error && (
                          <div className="text-xs text-red-600">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Testing Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Scenario Testing</CardTitle>
              <CardDescription>
                Test voice selection with different user profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleUsers.map((user, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {user.age}, {user.grade} grade, {user.difficultyLevel}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => runUserTest(user)}
                          disabled={userTests.status === 'running'}
                        >
                          Test
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>Interests: {user.interests?.join(', ')}</div>
                        <div>Request: {user.specialRequest}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {userTests.status !== 'idle' && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Latest Test Result</h4>
                      {renderTestStatus(userTests)}
                    </div>
                    
                    {userTests.data && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {userTests.data.result.selectedVoice.pn}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {userTests.data.result.compatibilityScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <strong>Reasoning:</strong> {userTests.data.result.selectionReasoning}
                        </div>
                        {userTests.data.result.controlLine && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">Control Line:</Label>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(userTests.data.result.controlLine)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <ScrollArea className="h-20 w-full">
                              <pre className="text-xs p-2 bg-muted rounded-md whitespace-pre-wrap">
                                {userTests.data.result.controlLine}
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {userTests.error && (
                      <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                        {userTests.error}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alternatives Tab */}
        <TabsContent value="alternatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Alternatives Testing</CardTitle>
              <CardDescription>
                Test multiple voice options for comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label>User Profile</Label>
                  <Select value={selectedUser.name} onValueChange={(name) => {
                    const user = sampleUsers.find(u => u.name === name);
                    if (user) setSelectedUser(user);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleUsers.map((user) => (
                        <SelectItem key={user.name} value={user.name}>
                          {user.name} (Age {user.age})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Number of Alternatives</Label>
                  <Select value={alternativesCount.toString()} onValueChange={(value) => setAlternativesCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} alternatives
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={runAlternativesTest}
                  disabled={alternativesTest.status === 'running'}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Get Alternatives
                </Button>
              </div>

              <div className="flex items-center justify-between">
                {renderTestStatus(alternativesTest)}
              </div>

              {alternativesTest.data && (
                <div className="space-y-3">
                  <h4 className="font-medium">Voice Options ({alternativesTest.data.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alternativesTest.data.map((alternative: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              {alternative.selectedVoice.pn}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {alternative.compatibilityScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alternative.selectionReasoning}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {alternativesTest.error && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">
                  {alternativesTest.error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Testing & Diagnostics</CardTitle>
              <CardDescription>
                Advanced features and system diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={async () => {
                    try {
                      const info = await VoiceCatalogIntegration.getCatalogInfo();
                      toast({ 
                        title: 'Catalog Info', 
                        description: `Integration: ${info.integrationVersion}, Voices: ${info.totalVoices}` 
                      });
                    } catch (error) {
                      toast({ 
                        title: 'Error', 
                        description: 'Failed to get catalog info', 
                        variant: 'destructive' 
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Get Catalog Info
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    // Reset all test states
                    setSystemStatus({ status: 'idle' });
                    setQuickTestResult({ status: 'idle' });
                    setDifficultyTests({});
                    setUserTests({ status: 'idle' });
                    setAlternativesTest({ status: 'idle' });
                    setFullSystemTest({ status: 'idle' });
                    toast({ title: 'Reset', description: 'All test results cleared' });
                  }}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All Tests
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Performance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">System Init</div>
                    <div className="font-mono">
                      {systemStatus.timing ? `${systemStatus.timing.toFixed(0)}ms` : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Quick Test</div>
                    <div className="font-mono">
                      {quickTestResult.timing ? `${quickTestResult.timing.toFixed(0)}ms` : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">User Test</div>
                    <div className="font-mono">
                      {userTests.timing ? `${userTests.timing.toFixed(0)}ms` : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Alternatives</div>
                    <div className="font-mono">
                      {alternativesTest.timing ? `${alternativesTest.timing.toFixed(0)}ms` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}