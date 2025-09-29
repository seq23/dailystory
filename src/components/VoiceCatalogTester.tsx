import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Info,
  Database,
  BarChart3
} from 'lucide-react';
import { VoiceCatalogIntegration, initializeVoiceCatalog } from '@/services/voiceCatalog';
import { testVoiceCatalogSystem, quickTest, runMultipleQuickTests } from '@/services/voiceCatalog/test';
import { VoiceCatalogModal } from './VoiceCatalogModal';
import type { UserInfo } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { batchDOMReads, debounceRAF, globalDOMCache } from '@/utils/performanceOptimizations';
import { withTimeout, TIMEOUT_CONFIGS, NetworkTimeoutError } from '@/utils/networkTimeout';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

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

const gradeOptions = ['PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th+'] as const;
const skinToneOptions = ['pale', 'light', 'medium', 'olive', 'dark'] as const;
const avatarTypeOptions = ['boy', 'girl', 'prefer-not-to-answer'] as const;
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' }
] as const;
const learningGoalOptions = [
  { value: 'improve-english-reading', label: 'Improve English Reading' },
  { value: 'learn-english-language', label: 'Learn English Language' },
  { value: 'both', label: 'Both' }
] as const;
const defaultUserProfile: UserInfo = {
  name: 'Test User',
  age: 8,
  grade: '3',
  gradeLevel: '3',
  nativeLanguage: 'en',
  learningGoal: 'improve-english-reading',
  avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
  favoriteColor: 'blue',
  favoriteAnimal: 'dog',
  favoriteFood: 'pizza',
  hobbies: 'reading, playing',
  specialRequest: 'I love fun stories with adventure',
  interests: ['adventure', 'friendship'],
  difficultyLevel: 'easy'
};

const presetProfiles = [
  {
    name: 'Young Beginner',
    profile: {
      ...defaultUserProfile,
      name: 'Emma',
      age: 5,
      grade: 'PreK' as const,
      gradeLevel: 'PreK' as const,
      difficultyLevel: 'beginner',
      favoriteAnimal: 'bunny',
      hobbies: 'coloring, puzzles',
      specialRequest: 'I like stories with animals',
      interests: ['animals', 'colors']
    }
  },
  {
    name: 'Elementary Student',
    profile: {
      ...defaultUserProfile,
      name: 'Alex',
      age: 8,
      grade: '3' as const,
      gradeLevel: '3' as const,
      difficultyLevel: 'easy',
      favoriteColor: 'green',
      favoriteAnimal: 'cat',
      hobbies: 'soccer, drawing',
      specialRequest: 'I want stories about school and friends',
      interests: ['friendship', 'school', 'sports']
    }
  },
  {
    name: 'Middle School',
    profile: {
      ...defaultUserProfile,
      name: 'Jordan',
      age: 12,
      grade: '6' as const,
      gradeLevel: '6' as const,
      difficultyLevel: 'medium',
      favoriteColor: 'purple',
      favoriteAnimal: 'dragon',
      favoriteFood: 'tacos',
      hobbies: 'gaming, reading',
      specialRequest: 'I love fantasy and mystery stories',
      interests: ['fantasy', 'mystery', 'technology']
    }
  },
  {
    name: 'Advanced Reader',
    profile: {
      ...defaultUserProfile,
      name: 'Sam',
      age: 15,
      grade: '6' as const,
      gradeLevel: '6' as const,
      difficultyLevel: 'hard',
      favoriteColor: 'black',
      favoriteAnimal: 'wolf',
      favoriteFood: 'sushi',
      hobbies: 'writing, music',
      specialRequest: 'I want complex stories with deep themes',
      interests: ['science', 'philosophy', 'adventure']
    }
  },
  {
    name: 'Expert Reader',
    profile: {
      ...defaultUserProfile,
      name: 'Maya',
      age: 17,
      grade: '6' as const,
      gradeLevel: '6' as const,
      difficultyLevel: 'expert',
      favoriteColor: 'crimson',
      favoriteAnimal: 'phoenix',
      favoriteFood: 'ramen',
      hobbies: 'creative writing, philosophy',
      specialRequest: 'I enjoy sophisticated narratives with complex themes',
      interests: ['literature', 'psychology', 'world-building']
    }
  }
];

export function VoiceCatalogTester() {
  const { toast } = useToast();
  const performanceMonitor = usePerformanceMonitor();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [systemStatus, setSystemStatus] = useState<TestResult>({ status: 'idle' });
  const [quickTestResult, setQuickTestResult] = useState<TestResult>({ status: 'idle' });
  const [difficultyTests, setDifficultyTests] = useState<Record<string, DifficultyTestResult>>({});
  const [userTests, setUserTests] = useState<TestResult>({ status: 'idle' });
  const [alternativesTest, setAlternativesTest] = useState<TestResult>({ status: 'idle' });
  const [fullSystemTest, setFullSystemTest] = useState<TestResult>({ status: 'idle' });
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [multipleQuickTests, setMultipleQuickTests] = useState<TestResult>({ status: 'idle' });
  
  const [selectedUser, setSelectedUser] = useState<UserInfo>(defaultUserProfile);
  const [customUser, setCustomUser] = useState<UserInfo>(defaultUserProfile);
  const [alternativesCount, setAlternativesCount] = useState(3);
  const [interestsInput, setInterestsInput] = useState<string>('adventure, friendship');

  // Performance monitoring setup
  useEffect(() => {
    const cleanup = performanceMonitor.detectForcedReflows();
    return cleanup;
  }, [performanceMonitor]);

  const runSystemInit = useCallback(async () => {
    const measureInit = performanceMonitor.measureInteraction('system-init');
    setSystemStatus({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const stats = await withTimeout(
        () => initializeVoiceCatalog(),
        TIMEOUT_CONFIGS.API_CALL
      );
      const timing = performance.now() - startTime;
      setSystemStatus({ status: 'success', data: stats, timing });
      toast({ title: 'Success', description: 'Voice catalog system initialized successfully' });
    } catch (error) {
      const timing = performance.now() - startTime;
      const errorMessage = error instanceof NetworkTimeoutError 
        ? `Initialization timed out (${error.timeout}ms)` 
        : error instanceof Error ? error.message : 'Unknown error';
      setSystemStatus({ 
        status: 'error', 
        error: errorMessage,
        timing 
      });
      toast({ title: 'Error', description: 'Failed to initialize voice catalog system', variant: 'destructive' });
    } finally {
      measureInit();
    }
  }, [toast, performanceMonitor]);

  const runQuickTest = useCallback(async () => {
    const measureTest = performanceMonitor.measureInteraction('quick-test');
    setQuickTestResult({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const result = await withTimeout(
        () => quickTest(),
        TIMEOUT_CONFIGS.API_CALL
      );
      const timing = performance.now() - startTime;
      setQuickTestResult({ status: 'success', data: result, timing });
      toast({ 
        title: 'Success', 
        description: `Quick test: ${result.selectedVoice.pn} (${result.testScenario?.description || 'Variety test'})` 
      });
    } catch (error) {
      const timing = performance.now() - startTime;
      const errorMessage = error instanceof NetworkTimeoutError 
        ? `Quick test timed out (${error.timeout}ms)` 
        : error instanceof Error ? error.message : 'Unknown error';
      setQuickTestResult({ 
        status: 'error', 
        error: errorMessage,
        timing 
      });
      toast({ title: 'Error', description: 'Quick test failed', variant: 'destructive' });
    } finally {
      measureTest();
    }
  }, [toast, performanceMonitor]);

  const runMultipleQuickTestsCallback = useCallback(async () => {
    const measureTest = performanceMonitor.measureInteraction('multiple-quick-tests');
    setMultipleQuickTests({ status: 'running' });
    const startTime = performance.now();
    
    try {
      const results = await withTimeout(
        () => runMultipleQuickTests(3),
        { ...TIMEOUT_CONFIGS.API_CALL, timeout: TIMEOUT_CONFIGS.API_CALL.timeout * 3 }
      );
      const timing = performance.now() - startTime;
      setMultipleQuickTests({ status: 'success', data: results, timing });
      toast({ 
        title: 'Success', 
        description: `Completed 3 variety tests showing different voices` 
      });
    } catch (error) {
      const timing = performance.now() - startTime;
      const errorMessage = error instanceof NetworkTimeoutError 
        ? `Multiple tests timed out (${error.timeout}ms)` 
        : error instanceof Error ? error.message : 'Unknown error';
      setMultipleQuickTests({ 
        status: 'error', 
        error: errorMessage,
        timing 
      });
      toast({ title: 'Error', description: 'Multiple quick tests failed', variant: 'destructive' });
    } finally {
      measureTest();
    }
  }, [toast, performanceMonitor]);

  const runDifficultyTest = useCallback(async (difficulty: string) => {
    const measureTest = performanceMonitor.measureInteraction(`difficulty-test-${difficulty}`);
    setDifficultyTests(prev => ({ 
      ...prev, 
      [difficulty]: { status: 'running', difficulty } 
    }));
    const startTime = performance.now();
    
    try {
      const result = await withTimeout(
        () => VoiceCatalogIntegration.testVoiceSelection(difficulty as any),
        TIMEOUT_CONFIGS.API_CALL
      );
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
      const errorMessage = error instanceof NetworkTimeoutError 
        ? `Test timed out for ${difficulty} (${error.timeout}ms)` 
        : error instanceof Error ? error.message : 'Unknown error';
      setDifficultyTests(prev => ({
        ...prev,
        [difficulty]: {
          status: 'error',
          difficulty,
          error: errorMessage,
          timing
        }
      }));
    } finally {
      measureTest();
    }
  }, [performanceMonitor]);

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
    <>
      <div ref={containerRef} className="space-y-6">
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
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Total Voices:</span>
                        <span className="font-medium">{systemStatus.data.totalVoices || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Levels:</span>
                        <span className="font-medium">{systemStatus.data.totalLevels || 5}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Themes:</span>
                        <span className="font-medium">{systemStatus.data.totalThemes || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-600">Ready</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCatalogModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Browse All Voices
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(systemStatus.data, null, 2))}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Raw Data
                      </Button>
                    </div>
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
                  <div className="space-y-3">
                    {quickTestResult.data.testScenario && (
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <strong>Test Scenario:</strong> {quickTestResult.data.testScenario.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-sm">
                        {quickTestResult.data.selectedVoice.pn}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Score: {quickTestResult.data.compatibilityScore?.toFixed(2) || 'N/A'}
                      </Badge>
                    </div>
                    
                    {/* Voice Characteristics */}
                    {quickTestResult.data.selectedVoice && (
                      <div className="p-3 bg-muted/50 rounded-md space-y-2">
                        <div className="text-sm font-medium">Voice Characteristics:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {quickTestResult.data.selectedVoice.tones && (
                            <div>
                              <span className="font-medium">Tones:</span> {quickTestResult.data.selectedVoice.tones.join(', ')}
                            </div>
                          )}
                          {quickTestResult.data.selectedVoice.warmth !== undefined && (
                            <div>
                              <span className="font-medium">Warmth:</span> {quickTestResult.data.selectedVoice.warmth}/5
                            </div>
                          )}
                          {quickTestResult.data.selectedVoice.humor !== undefined && (
                            <div>
                              <span className="font-medium">Humor:</span> {quickTestResult.data.selectedVoice.humor}/5
                            </div>
                          )}
                          {quickTestResult.data.selectedVoice.themes && (
                            <div className="col-span-2">
                              <span className="font-medium">Themes:</span> {quickTestResult.data.selectedVoice.themes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Selection Reasoning */}
                    {quickTestResult.data.selectionReasoning && (
                      <div className="p-3 bg-primary/5 rounded-md">
                        <div className="text-sm font-medium mb-1">Selection Reasoning:</div>
                        <div className="text-xs text-muted-foreground">
                          {quickTestResult.data.selectionReasoning}
                        </div>
                      </div>
                    )}
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
                          <div className="space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              {result.voiceName}
                            </Badge>
                            {result.score && (
                              <div className="text-xs text-muted-foreground">
                                Score: {result.score.toFixed(2)}
                              </div>
                            )}
                            
                            {/* Voice Details */}
                            {result.data?.selectedVoice && (
                              <div className="space-y-1">
                                {result.data.selectedVoice.tones && (
                                  <div className="text-xs">
                                    <span className="font-medium">Tones:</span> {result.data.selectedVoice.tones.slice(0, 2).join(', ')}
                                  </div>
                                )}
                                {result.data.selectedVoice.warmth !== undefined && (
                                  <div className="text-xs">
                                    <span className="font-medium">Warmth:</span> {result.data.selectedVoice.warmth}/5
                                  </div>
                                )}
                                {result.data.selectedVoice.themes && result.data.selectedVoice.themes.length > 0 && (
                                  <div className="text-xs">
                                    <span className="font-medium">Themes:</span> {result.data.selectedVoice.themes.slice(0, 3).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Selection Reasoning Summary */}
                            {result.data?.selectionReasoning && (
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded text-ellipsis">
                                {result.data.selectionReasoning.substring(0, 100)}...
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
          {/* Preset Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Profiles</CardTitle>
              <CardDescription>
                Test with pre-configured user profiles representing different age groups and reading levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetProfiles.map((preset, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{preset.profile.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {preset.profile.age}, {preset.profile.grade} grade, {preset.profile.difficultyLevel}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomUser(preset.profile)}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => runUserTest(preset.profile)}
                            disabled={userTests.status === 'running'}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>Interests: {preset.profile.interests?.join(', ')}</div>
                        <div>Request: {preset.profile.specialRequest}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom User Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Custom User Profile Builder</CardTitle>
              <CardDescription>
                Create and test custom user profiles with specific preferences and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={customUser.name}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min="3"
                          max="18"
                          value={customUser.age}
                          onChange={(e) => setCustomUser(prev => ({ ...prev, age: parseInt(e.target.value) || 5 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Select value={customUser.grade} onValueChange={(value) => setCustomUser(prev => ({ ...prev, grade: value as any, gradeLevel: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map((grade) => (
                              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Reading Level</Label>
                      <Select value={customUser.difficultyLevel} onValueChange={(value) => setCustomUser(prev => ({ ...prev, difficultyLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((diff) => (
                            <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Avatar & Language */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Avatar & Language</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="avatarType">Avatar Type</Label>
                      <Select value={customUser.avatar?.type} onValueChange={(value) => setCustomUser(prev => ({ ...prev, avatar: { ...prev.avatar, type: value as any, skinTone: prev.avatar?.skinTone || 'medium' } }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {avatarTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="skinTone">Skin Tone</Label>
                      <Select value={customUser.avatar?.skinTone} onValueChange={(value) => setCustomUser(prev => ({ ...prev, avatar: { ...prev.avatar, skinTone: value as any, type: prev.avatar?.type || 'prefer-not-to-answer' } }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skinToneOptions.map((tone) => (
                            <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nativeLanguage">Native Language</Label>
                      <Select value={customUser.nativeLanguage} onValueChange={(value) => setCustomUser(prev => ({ ...prev, nativeLanguage: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="learningGoal">Learning Goal</Label>
                      <Select value={customUser.learningGoal} onValueChange={(value) => setCustomUser(prev => ({ ...prev, learningGoal: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {learningGoalOptions.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Preferences</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="favoriteColor">Favorite Color</Label>
                      <Input
                        id="favoriteColor"
                        value={customUser.favoriteColor}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, favoriteColor: e.target.value }))}
                        placeholder="e.g. blue, purple"
                      />
                    </div>
                    <div>
                      <Label htmlFor="favoriteAnimal">Favorite Animal</Label>
                      <Input
                        id="favoriteAnimal"
                        value={customUser.favoriteAnimal}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, favoriteAnimal: e.target.value }))}
                        placeholder="e.g. cat, dragon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="favoriteFood">Favorite Food</Label>
                      <Input
                        id="favoriteFood"
                        value={customUser.favoriteFood}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, favoriteFood: e.target.value }))}
                        placeholder="e.g. pizza, tacos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hobbies">Hobbies</Label>
                      <Input
                        id="hobbies"
                        value={customUser.hobbies}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, hobbies: e.target.value }))}
                        placeholder="e.g. reading, gaming"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Story Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input
                      id="interests"
                      value={interestsInput}
                      onChange={(e) => {
                        setInterestsInput(e.target.value);
                        setCustomUser(prev => ({ 
                          ...prev, 
                          interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        }));
                      }}
                      placeholder="e.g. adventure, magic, friendship"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRequest">Special Request</Label>
                    <Textarea
                      id="specialRequest"
                      value={customUser.specialRequest}
                      onChange={(e) => setCustomUser(prev => ({ ...prev, specialRequest: e.target.value }))}
                      placeholder="Describe what kind of stories they love"
                      className="h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Test Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button 
                  onClick={() => runUserTest(customUser)}
                  disabled={userTests.status === 'running'}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Test Custom Profile
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCustomUser(defaultUserProfile);
                    setInterestsInput('adventure, friendship');
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedUser(customUser)}
                >
                  Use for Alternatives Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {userTests.status !== 'idle' && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Latest Test Result</h4>
                  {renderTestStatus(userTests)}
                </div>
                
                {userTests.data && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Voice Selection Summary */}
                      <div className="p-3 bg-muted/50 rounded-md space-y-2">
                        <div className="text-sm font-medium">Selected Voice</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {userTests.data.result.selectedVoice.pn}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {userTests.data.result.compatibilityScore.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Voice Characteristics */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {userTests.data.result.selectedVoice.warmth !== undefined && (
                            <div>
                              <span className="font-medium">Warmth:</span> {userTests.data.result.selectedVoice.warmth}/5
                            </div>
                          )}
                          {userTests.data.result.selectedVoice.humor !== undefined && (
                            <div>
                              <span className="font-medium">Humor:</span> {userTests.data.result.selectedVoice.humor}/5
                            </div>
                          )}
                          {userTests.data.result.selectedVoice.tones && (
                            <div className="col-span-2">
                              <span className="font-medium">Tones:</span> {userTests.data.result.selectedVoice.tones.join(', ')}
                            </div>
                          )}
                          {userTests.data.result.selectedVoice.themes && (
                            <div className="col-span-2">
                              <span className="font-medium">Themes:</span> {userTests.data.result.selectedVoice.themes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* User Profile Summary */}
                      <div className="p-3 bg-primary/5 rounded-md space-y-2">
                        <div className="text-sm font-medium">User Profile</div>
                        <div className="text-xs space-y-1">
                          <div><span className="font-medium">Name:</span> {userTests.data.user.name}</div>
                          <div><span className="font-medium">Age:</span> {userTests.data.user.age} ({userTests.data.user.grade} grade)</div>
                          <div><span className="font-medium">Level:</span> {userTests.data.user.difficultyLevel}</div>
                          <div><span className="font-medium">Interests:</span> {userTests.data.user.interests?.join(', ') || 'None'}</div>
                          <div><span className="font-medium">Language:</span> {userTests.data.user.nativeLanguage}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Reasoning */}
                    <div className="p-3 bg-accent/10 rounded-md">
                      <div className="text-sm font-medium mb-2">Selection Reasoning:</div>
                      <div className="text-sm text-muted-foreground">
                        {userTests.data.result.selectionReasoning}
                      </div>
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
                    const preset = presetProfiles.find(p => p.profile.name === name);
                    if (preset) setSelectedUser(preset.profile);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetProfiles.map((preset) => (
                        <SelectItem key={preset.profile.name} value={preset.profile.name}>
                          {preset.profile.name} (Age {preset.profile.age})
                        </SelectItem>
                      ))}
                      <SelectItem value={customUser.name}>
                        {customUser.name} (Custom - Age {customUser.age})
                      </SelectItem>
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
                <div className="space-y-4">
                  <h4 className="font-medium">Voice Alternatives Comparison ({alternativesTest.data.length})</h4>
                  
                  {/* Comparison Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 gap-2 p-3 bg-muted/50 text-sm font-medium">
                      <div>Voice Name</div>
                      <div>Score</div>
                      <div>Warmth</div>
                      <div>Humor</div>
                      <div>Tones</div>
                      <div>Themes</div>
                      <div>Reasoning</div>
                    </div>
                    {alternativesTest.data.map((alternative: any, index: number) => (
                      <div key={index} className="grid grid-cols-7 gap-2 p-3 border-t text-xs">
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {alternative.selectedVoice.pn}
                          </Badge>
                        </div>
                        <div className="font-medium">
                          {alternative.compatibilityScore.toFixed(2)}
                        </div>
                        <div>
                          {alternative.selectedVoice.warmth !== undefined ? `${alternative.selectedVoice.warmth}/5` : 'N/A'}
                        </div>
                        <div>
                          {alternative.selectedVoice.humor !== undefined ? `${alternative.selectedVoice.humor}/5` : 'N/A'}
                        </div>
                        <div>
                          {alternative.selectedVoice.tones ? alternative.selectedVoice.tones.slice(0, 2).join(', ') : 'N/A'}
                        </div>
                        <div>
                          {alternative.selectedVoice.themes ? alternative.selectedVoice.themes.slice(0, 2).join(', ') : 'N/A'}
                        </div>
                        <div className="text-muted-foreground">
                          {alternative.selectionReasoning ? alternative.selectionReasoning.substring(0, 80) + '...' : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Voice Diversity Analysis */}
                  <div className="p-3 bg-primary/5 rounded-md">
                    <div className="text-sm font-medium mb-2">Diversity Analysis:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Unique Voices:</span> {new Set(alternativesTest.data.map((a: any) => a.selectedVoice.pn)).size}
                      </div>
                      <div>
                        <span className="font-medium">Avg Score:</span> {(alternativesTest.data.reduce((sum: number, a: any) => sum + a.compatibilityScore, 0) / alternativesTest.data.length).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Score Range:</span> {Math.min(...alternativesTest.data.map((a: any) => a.compatibilityScore)).toFixed(2)} - {Math.max(...alternativesTest.data.map((a: any) => a.compatibilityScore)).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Theme Coverage:</span> {new Set(alternativesTest.data.flatMap((a: any) => a.selectedVoice.themes || [])).size} themes
                      </div>
                    </div>
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
                <h4 className="font-medium">Performance & Health Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">System Init</div>
                    <div className="font-mono">
                      {systemStatus.timing ? `${systemStatus.timing.toFixed(0)}ms` : '-'}
                    </div>
                    <div className={`text-xs ${systemStatus.status === 'success' ? 'text-green-600' : systemStatus.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {systemStatus.status === 'success' ? '✓ Healthy' : systemStatus.status === 'error' ? '✗ Failed' : 'Not tested'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Quick Test</div>
                    <div className="font-mono">
                      {quickTestResult.timing ? `${quickTestResult.timing.toFixed(0)}ms` : '-'}
                    </div>
                    <div className={`text-xs ${quickTestResult.status === 'success' ? 'text-green-600' : quickTestResult.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {quickTestResult.status === 'success' ? '✓ Passed' : quickTestResult.status === 'error' ? '✗ Failed' : 'Not tested'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">User Test</div>
                    <div className="font-mono">
                      {userTests.timing ? `${userTests.timing.toFixed(0)}ms` : '-'}
                    </div>
                    <div className={`text-xs ${userTests.status === 'success' ? 'text-green-600' : userTests.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {userTests.status === 'success' ? '✓ Passed' : userTests.status === 'error' ? '✗ Failed' : 'Not tested'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Alternatives</div>
                    <div className="font-mono">
                      {alternativesTest.timing ? `${alternativesTest.timing.toFixed(0)}ms` : '-'}
                    </div>
                    <div className={`text-xs ${alternativesTest.status === 'success' ? 'text-green-600' : alternativesTest.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {alternativesTest.status === 'success' ? '✓ Passed' : alternativesTest.status === 'error' ? '✗ Failed' : 'Not tested'}
                    </div>
                  </div>
                </div>
                
                {/* Difficulty Level Coverage */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Difficulty Level Testing Status</div>
                  <div className="grid grid-cols-5 gap-2">
                    {difficultyLevels.map((level) => {
                      const result = difficultyTests[level];
                      return (
                        <div key={level} className="p-2 bg-muted/30 rounded text-center">
                          <div className="text-xs font-medium capitalize">{level}</div>
                          <div className={`text-xs mt-1 ${result?.status === 'success' ? 'text-green-600' : result?.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {result?.status === 'success' ? '✓' : result?.status === 'error' ? '✗' : '-'}
                          </div>
                          {result?.timing && (
                            <div className="text-xs text-muted-foreground">{result.timing.toFixed(0)}ms</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* System Health Indicators */}
                {(systemStatus.data || quickTestResult.data || Object.keys(difficultyTests).length > 0) && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-md">
                    <div className="text-sm font-medium mb-2">System Health Indicators</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {systemStatus.data && (
                        <div>
                          <span className="font-medium">Catalog Status:</span> {Object.keys(systemStatus.data).length > 0 ? '✓ Loaded' : '⚠ Limited'}
                        </div>
                      )}
                      {quickTestResult.data && (
                        <div>
                          <span className="font-medium">Voice Selection:</span> {quickTestResult.data.selectedVoice ? '✓ Working' : '✗ Failed'}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Difficulty Coverage:</span> {Object.keys(difficultyTests).filter(k => difficultyTests[k].status === 'success').length}/{difficultyLevels.length} levels
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
      
      <VoiceCatalogModal 
        open={catalogModalOpen} 
        onOpenChange={setCatalogModalOpen} 
      />
    </>
  );
}