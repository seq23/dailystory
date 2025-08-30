import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import type { DifficultyLevel } from '@/types';

interface TestResult {
  level: string;
  mode: 'testing' | 'real-user';
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: any;
  error?: string;
  wordCounts?: number[];
  averageWords?: number;
  expectedRange?: string;
  isValid?: boolean;
}

const LEVELS_TO_TEST = [
  { value: 'beginner', label: 'Beginner', expectedWords: '6' },
  { value: 'easy', label: 'Easy', expectedWords: '24' },
  { value: 'medium', label: 'Medium', expectedWords: '45' },
  { value: 'hard', label: 'Hard', expectedWords: '80' },
  { value: 'expert', label: 'Expert', expectedWords: '100+' }
];

const MODES_TO_TEST: Array<'testing' | 'real-user'> = ['testing', 'real-user'];

export function SystematicWordCountTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<{ level: string; mode: 'testing' | 'real-user' } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { generateStory, isLoading } = useTemplateService();

  // Initialize test results
  useEffect(() => {
    const initialResults: TestResult[] = [];
    LEVELS_TO_TEST.forEach(level => {
      MODES_TO_TEST.forEach(mode => {
        initialResults.push({
          level: level.value,
          mode,
          status: 'pending',
          expectedRange: level.expectedWords
        });
      });
    });
    setTestResults(initialResults);
  }, []);

  const updateTestResult = (level: string, mode: 'testing' | 'real-user', updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.level === level && result.mode === mode 
        ? { ...result, ...updates }
        : result
    ));
  };

  const analyzeWordCounts = (pages: string[], level: string): { wordCounts: number[], averageWords: number, isValid: boolean } => {
    const wordCounts = pages.map(page => page.split(' ').length);
    const averageWords = Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length);
    
    // Upper-end target validation based on level
    const targets = {
      beginner: 6,
      easy: 24,
      medium: 45,
      hard: 80,
      expert: 100
    };
    
    const target = targets[level] || targets.easy;
    const isValid = averageWords >= target * 0.8; // Allow 20% tolerance
    
    return { wordCounts, averageWords, isValid };
  };

  const runSingleTest = async (level: string, mode: 'testing' | 'real-user') => {
    setCurrentTest({ level, mode });
    updateTestResult(level, mode, { status: 'running' });

    const testUserInfo = {
      name: 'Alex',
      age: 8,
      grade: '3rd' as const,
      nativeLanguage: 'en' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'prefer-not-to-answer' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'dragon',
      hobbies: 'playing games',
      favoriteFood: 'pizza',
      specialRequest: 'adventure with magic',
      difficultyLevel: level as DifficultyLevel,
    };

    try {
      const result = await generateStory(testUserInfo, mode);
      
      if (result.success && result.pages) {
        const analysis = analyzeWordCounts(result.pages, level);
        updateTestResult(level, mode, {
          status: 'success',
          result,
          ...analysis
        });
      } else {
        updateTestResult(level, mode, {
          status: 'failed',
          error: 'No pages generated'
        });
      }
    } catch (error) {
      updateTestResult(level, mode, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const totalTests = LEVELS_TO_TEST.length * MODES_TO_TEST.length;
    let completedTests = 0;

    for (const level of LEVELS_TO_TEST) {
      for (const mode of MODES_TO_TEST) {
        await runSingleTest(level.value, mode);
        completedTests++;
        setProgress((completedTests / totalTests) * 100);
        
        // Small delay between tests to avoid overwhelming the service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getWordCountStatus = (result: TestResult) => {
    if (!result.averageWords) return null;
    
    const targets = {
      beginner: 6,
      easy: 24, 
      medium: 45,
      hard: 80,
      expert: 100
    };
    
    const target = targets[result.level] || targets.easy;
    const isGood = result.averageWords >= target * 0.8;
    
    return (
      <Badge variant={isGood ? 'default' : 'destructive'}>
        {result.averageWords} avg words (target: {target})
      </Badge>
    );
  };

  const failedTests = testResults.filter(r => {
    if (r.status === 'failed') return true;
    if (r.averageWords && r.level) {
      const targets = { beginner: 6, easy: 24, medium: 45, hard: 80, expert: 100 };
      const target = targets[r.level] || targets.easy;
      return r.averageWords < target * 0.8;
    }
    return false;
  });
  
  const successfulTests = testResults.filter(r => {
    if (r.status !== 'success' || !r.averageWords || !r.level) return false;
    const targets = { beginner: 6, easy: 24, medium: 45, hard: 80, expert: 100 };
    const target = targets[r.level] || targets.easy;
    return r.averageWords >= target * 0.8;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Systematic Word Count Test</CardTitle>
          <CardDescription>
            Test all levels in both modes to verify upper-end word count targets (Beginner: 6, Easy: 24, Medium: 45, Hard: 80, Expert: 100+ words per page)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || isLoading}
              className="min-w-32"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            {isRunning && (
              <div className="flex-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentTest && `Testing ${currentTest.level} in ${currentTest.mode} mode...`}
                </p>
              </div>
            )}
          </div>

          {(successfulTests.length > 0 || failedTests.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{successfulTests.length}</strong> tests passed with target word counts
                </AlertDescription>
              </Alert>
              
              {failedTests.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{failedTests.length}</strong> tests failed or have short content
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Grid */}
      <div className="grid gap-4">
        {LEVELS_TO_TEST.map(level => (
          <Card key={level.value}>
            <CardHeader>
              <CardTitle className="text-lg">{level.label}</CardTitle>
              <CardDescription>Expected: {level.expectedWords} words per page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODES_TO_TEST.map(mode => {
                  const result = testResults.find(r => r.level === level.value && r.mode === mode);
                  
                  return (
                    <div key={mode} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result?.status || 'pending')}
                          <span className="font-medium capitalize">{mode} Mode</span>
                        </div>
                        {result && getWordCountStatus(result)}
                      </div>

                      {result?.status === 'success' && result.wordCounts && (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Pages: </span>
                            <span>{result.wordCounts.length}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Word counts: </span>
                            <span className="font-mono text-xs">
                              [{result.wordCounts.join(', ')}]
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Range: </span>
                            <span>
                              {Math.min(...result.wordCounts)}-{Math.max(...result.wordCounts)} words
                            </span>
                          </div>
                          
                          {result.averageWords && result.level && (() => {
                            const targets = { beginner: 6, easy: 24, medium: 45, hard: 80, expert: 100 };
                            const target = targets[result.level] || targets.easy;
                            return result.averageWords < target * 0.8 && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  Content below target! Should be ~{target} words per page, but averaging {result.averageWords} words.
                                  Target is upper-end of sentence-based range.
                                </AlertDescription>
                              </Alert>
                            );
                          })()}
                        </div>
                      )}

                      {result?.status === 'failed' && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {result.error || 'Test failed'}
                          </AlertDescription>
                        </Alert>
                      )}

                      {result?.status === 'pending' && (
                        <p className="text-xs text-muted-foreground">Waiting to run...</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}