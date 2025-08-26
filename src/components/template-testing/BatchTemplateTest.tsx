import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Download, CheckCircle, XCircle } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import type { UserInfo, DifficultyLevel } from '@/types';

interface BatchResult {
  level: string;
  success: boolean;
  error?: string;
  result?: any;
  duration: number;
}

const ALL_LEVELS: { value: string; label: string }[] = [
  { value: 'beginner', label: 'Beginner (Level 0)' },
  { value: 'easy', label: 'Easy (Level 1)' },
  { value: 'medium', label: 'Medium (Level 2)' },
  { value: 'hard', label: 'Hard (Level 3)' },
  { value: 'expert', label: 'Expert (Level 4)' },
  { value: 'grade6', label: 'Grade 6' },
  { value: 'grade7', label: 'Grade 7' },
  { value: 'grade8', label: 'Grade 8' },
  { value: 'grade9', label: 'Grade 9' },
  { value: 'grade10', label: 'Grade 10' },
];

export function BatchTemplateTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const { generateStory } = useTemplateService();

  const baseUserInfo: UserInfo = {
    name: 'TestUser',
    age: 8,
    grade: '3rd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    hobbies: 'playing games',
    favoriteFood: 'pizza',
    specialRequest: 'adventure with magic',
    difficultyLevel: 'easy', // Will be overridden
  };

  const runBatchTest = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const batchResults: BatchResult[] = [];

    for (let i = 0; i < ALL_LEVELS.length; i++) {
      const level = ALL_LEVELS[i];
      setCurrentLevel(level.label);
      setProgress((i / ALL_LEVELS.length) * 100);

      const startTime = Date.now();
      try {
        const userInfo = {
          ...baseUserInfo,
          difficultyLevel: level.value as DifficultyLevel,
        };

        const result = await generateStory(userInfo);
        const duration = Date.now() - startTime;

        batchResults.push({
          level: level.label,
          success: true,
          result,
          duration,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        batchResults.push({
          level: level.label,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        });
      }

      setResults([...batchResults]);
    }

    setProgress(100);
    setCurrentLevel('');
    setIsRunning(false);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `template-batch-test-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const avgDuration = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Batch Template Test</CardTitle>
          <CardDescription>
            Test all 9 difficulty levels simultaneously to validate the complete template system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runBatchTest} 
              disabled={isRunning}
              className="min-w-32"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Batch Test
                </>
              )}
            </Button>

            {results.length > 0 && !isRunning && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing: {currentLevel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{successCount}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{failureCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{avgDuration}ms</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="font-medium">{result.level}</div>
                      {result.error && (
                        <div className="text-sm text-destructive">{result.error}</div>
                      )}
                      {result.success && result.result && (
                        <div className="text-sm text-muted-foreground">
                          Generated {result.result.pages?.length || 0} pages
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {result.duration}ms
                    </Badge>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}