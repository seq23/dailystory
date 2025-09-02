import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, PlayCircle, CheckCircle2, XCircle, GraduationCap } from 'lucide-react';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { estimateTokenCount } from '@/utils/tokenLimitValidator';
import type { UserInfo, DifficultyLevel } from '@/types';

interface BasicTestResult {
  level: DifficultyLevel;
  success: boolean;
  pageCount: number;
  tokenCount: number;
  source: string;
  error?: string;
  pagesInRange: boolean;
  wordCount: number;
}

export function BasicLevelTestRunner() {
  const [results, setResults] = useState<BasicTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const difficultyLevels: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

  const createTestUser = (level: DifficultyLevel): UserInfo => {
    const configs = {
      beginner: { name: 'Emma', age: 4, grade: 'PreK' as const },
      easy: { name: 'Alex', age: 6, grade: 'K' as const },
      medium: { name: 'Maya', age: 8, grade: '2nd' as const },
      hard: { name: 'Jordan', age: 10, grade: '4th' as const },
      expert: { name: 'Taylor', age: 12, grade: '6th+' as const }
    };

    const config = configs[level];
    return {
      name: config.name,
      age: config.age,
      grade: config.grade,
      nativeLanguage: "en",
      learningGoal: "improve-english-reading",
      avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
      difficultyLevel: level,
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: 'adventure stories'
    };
  };

  const getExpectedPageRange = (level: DifficultyLevel): [number, number] => {
    // All basic levels expect ~10 pages (allowing 1-page tolerance)
    return [9, 11];
  };

  const runBasicLevelTest = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const testResults: BasicTestResult[] = [];

    for (let i = 0; i < difficultyLevels.length; i++) {
      const level = difficultyLevels[i];
      const testUser = createTestUser(level);
      const [minPages, maxPages] = getExpectedPageRange(level);
      
      try {
        console.log(`🧪 Testing ${level} level story generation...`);
        
        const response = await NetflixStyleStoryService.generateStory(testUser);
        
        const pageCount = response.content?.length || 0;
        const fullText = response.content?.join(' ') || '';
        const tokenCount = estimateTokenCount(fullText);
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
        const pagesInRange = pageCount >= minPages && pageCount <= maxPages;
        
        const result: BasicTestResult = {
          level,
          success: !!response.content && pageCount > 0,
          pageCount,
          tokenCount,
          wordCount,
          source: response.source || 'unknown',
          pagesInRange,
          error: response.content ? undefined : 'No content generated'
        };

        testResults.push(result);
        console.log(`✅ ${level} level: ${pageCount} pages (${pagesInRange ? 'PASS' : 'FAIL'})`);
        
      } catch (error) {
        console.error(`❌ Error testing ${level}:`, error);
        testResults.push({
          level,
          success: false,
          pageCount: 0,
          tokenCount: 0,
          wordCount: 0,
          source: 'error',
          pagesInRange: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setProgress(((i + 1) / difficultyLevels.length) * 100);
      setResults([...testResults]);
    }

    setIsRunning(false);
    console.log('🎯 Basic level test complete!');
  };

  const overallSuccess = results.length > 0 && results.every(r => r.success && r.pagesInRange);
  const averagePages = results.length > 0 ? results.reduce((sum, r) => sum + r.pageCount, 0) / results.length : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Basic Level Test (8 Pages)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests basic difficulty levels (Beginner → Expert) to verify 8-page generation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runBasicLevelTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {isRunning ? 'Testing...' : 'Run Basic Level Test'}
          </Button>
          
          {results.length > 0 && (
            <Badge variant={overallSuccess ? "default" : "destructive"} className="text-sm">
              {overallSuccess ? `✅ All Pass (Avg: ${averagePages.toFixed(1)} pages)` : '❌ Some Failed'}
            </Badge>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">Testing basic levels...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Results:</h3>
            {results.map((result) => (
              <div key={result.level} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.success && result.pagesInRange ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium capitalize">{result.level}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.error || `${result.pageCount} pages • ${result.wordCount} words • ${result.source}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.pagesInRange ? "default" : "secondary"}>
                    {result.pageCount} pages
                  </Badge>
                  <Badge variant={result.pagesInRange ? "default" : "destructive"}>
                    {result.pagesInRange ? 'IN RANGE' : 'OUT OF RANGE'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <ul className="text-sm space-y-1">
              <li>Total Tests: {results.length}/5</li>
              <li>Success Rate: {results.filter(r => r.success).length}/{results.length}</li>
              <li>Page Range Success: {results.filter(r => r.pagesInRange).length}/{results.length}</li>
              <li>Average Pages: {averagePages.toFixed(1)} (Target: 9-11)</li>
              <li>AI Generation: {results.filter(r => r.source === 'ai').length}/{results.length}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}