import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, PlayCircle, CheckCircle2, XCircle, GraduationCap } from 'lucide-react';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { estimateTokenCount } from '@/utils/tokenLimitValidator';
import { countCharacters, analyzeCharacters, type CharacterAnalysis } from '@/utils/characterCount';
import { showTestToast, clearAllTestingToasts, showTestSummaryToast } from '@/utils/testingToasts';
import type { UserInfo, DifficultyLevel } from '@/types';

// Robust word counting function
const countWords = (content: string | string[]): number => {
  if (!content) return 0;
  
  // Handle array of pages
  if (Array.isArray(content)) {
    return content.reduce((total, page) => total + countWords(page), 0);
  }
  
  // Handle single string
  if (typeof content === 'string') {
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
  
  return 0;
};

interface BasicTestResult {
  level: DifficultyLevel;
  success: boolean;
  pageCount: number;
  tokenCount?: number;
  wordCount: number;
  characterCount?: number;
  characterAnalysis?: CharacterAnalysis;
  source: 'ai' | 'fallback' | 'emergency' | 'unknown';
  error?: string;
  pagesInRange: boolean;
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

  const getExpectedPageRange = (level: DifficultyLevel): { min: number; max: number } => {
    // All basic levels expect ~12 pages (allowing 1-page tolerance)
    return { min: 11, max: 13 };
  };

  const runBasicLevelTest = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    // Clear previous toasts
    clearAllTestingToasts();
    
    const startTime = Date.now();
    const testResults: BasicTestResult[] = [];

    for (let i = 0; i < difficultyLevels.length; i++) {
      const level = difficultyLevels[i];
      const testUser = createTestUser(level);
      const expectedRange = getExpectedPageRange(level);
      
      // Show starting toast with level identification
      showTestToast({
        level,
        step: 'starting',
        message: 'Starting basic level test'
      });

      try {
        console.log(`🧪 Testing ${level} level story generation...`);
        
        const response = await NetflixStyleStoryService.generateStory(testUser);
        
        const pageCount = response.content?.length || 0;
        const fullText = response.content?.join(' ') || '';
        const tokenCount = estimateTokenCount(fullText);
        const wordCount = countWords(response.content || []);
        const characterCount = countCharacters(response.content || []);
        const characterAnalysis = analyzeCharacters(
          response.content || [], 
          wordCount, 
          pageCount
        );
        const pagesInRange = pageCount >= expectedRange.min && pageCount <= expectedRange.max;
        
        const result: BasicTestResult = {
          level,
          success: !!response.content && pageCount > 0,
          pageCount,
          tokenCount,
          wordCount,
          characterCount,
          characterAnalysis,
          source: response.source || 'unknown',
          pagesInRange,
          error: response.content ? undefined : 'No content generated'
        };

        // Show appropriate result toast
        if (result.success) {
          showTestToast({
            level,
            step: 'final_result',
            source: result.source as any,
            message: `${pageCount} pages, ${wordCount} words`
          });
        } else {
          showTestToast({
            level,
            step: 'error',
            message: result.error || 'Generation failed'
          });
        }

        testResults.push(result);
        console.log(`✅ ${level} level: ${pageCount} pages (${pagesInRange ? 'PASS' : 'FAIL'})`);
        
      } catch (error) {
        console.error(`❌ Error testing ${level}:`, error);
        
        showTestToast({
          level,
          step: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        
        testResults.push({
          level,
          success: false,
          pageCount: 0,
          tokenCount: 0,
          wordCount: 0,
          characterCount: 0,
          source: 'unknown',
          pagesInRange: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setResults([...testResults]);
      setProgress(((i + 1) / difficultyLevels.length) * 100);
    }

    const totalTime = Date.now() - startTime;
    const successfulTests = testResults.filter(r => r.success).length;
    
    // Show summary toast
    showTestSummaryToast(successfulTests, difficultyLevels.length, totalTime);
    
    setIsRunning(false);
    console.log('🎯 Basic level test complete!');
  };

  const overallSuccess = results.length > 0 && results.every(r => r.success && r.pagesInRange);
  const averagePages = results.length > 0 ? results.reduce((sum, r) => sum + r.pageCount, 0) / results.length : 0;
  const successfulTests = results.filter(r => r.success).length;
  const totalPages = results.reduce((sum, r) => sum + r.pageCount, 0);
  const totalWords = results.reduce((sum, r) => sum + r.wordCount, 0);
  const totalCharacters = results.reduce((sum, r) => sum + (r.characterCount || 0), 0);

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
            
            {/* Enhanced metrics display */}
            {results.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Detailed Metrics:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Words</div>
                    <div className="font-medium">{totalWords}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Characters</div>
                    <div className="font-medium">{totalCharacters}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Words/Page</div>
                    <div className="font-medium">
                      {totalPages > 0 ? Math.round(totalWords / totalPages) : 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Chars/Word</div>
                    <div className="font-medium">
                      {totalWords > 0 ? Math.round((totalCharacters / totalWords) * 10) / 10 : 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <div className="text-sm text-muted-foreground">
              Success Rate: {Math.round((successfulTests / results.length) * 100)}% • 
              Avg Words: {Math.round(totalWords / results.length)} • 
              Avg Characters: {Math.round(totalCharacters / results.length)} •
              Avg Pages: {Math.round(totalPages / results.length)}
            </div>
            <ul className="text-sm space-y-1 mt-2">
              <li>Total Tests: {results.length}/5</li>
              <li>Success Rate: {successfulTests}/{results.length}</li>
              <li>Page Range Success: {results.filter(r => r.pagesInRange).length}/{results.length}</li>
              <li>Average Pages: {averagePages.toFixed(1)} (Target: 11-13)</li>
              <li>AI Generation: {results.filter(r => r.source === 'ai').length}/{results.length}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}