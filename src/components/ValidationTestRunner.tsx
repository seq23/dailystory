import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { UnifiedValidator } from '@/utils/unifiedValidator';
import { estimateTokenCount } from '../../supabase/functions/_shared/validation-utils';
import { countCharacters, analyzeCharacters, type CharacterAnalysis } from '@/utils/characterCount';
import { showTestToast, clearAllTestingToasts, showTestSummaryToast } from '@/utils/testingToasts';
import type { UserInfo, ExpertGradeLevel } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';

interface ValidationTestResult {
  gradeLevel: ExpertGradeLevel;
  success: boolean;
  pageCount: number;
  tokenCount: number;
  wordCount: number;
  characterCount: number;
  characterAnalysis?: CharacterAnalysis;
  source: string;
  error?: string;
  pagesInRange: boolean;
}

export function ValidationTestRunner() {
  const [results, setResults] = useState<ValidationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const expertGrades: ExpertGradeLevel[] = ['6th', '7th', '8th', '9th', '10th'];

  const createTestUser = (gradeLevel: ExpertGradeLevel): UserInfo => ({
    name: 'Test User',
    age: parseInt(gradeLevel.replace('th', '')) + 5,
    grade: "6",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'expert',
    expertGradeLevel: gradeLevel,
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: 'fantasy adventure'
  });

  const runValidationTest = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    // Clear previous toasts
    clearAllTestingToasts();
    
    const startTime = Date.now();
    const testResults: ValidationTestResult[] = [];

    for (let i = 0; i < expertGrades.length; i++) {
      const gradeLevel = expertGrades[i];
      const testUser = createTestUser(gradeLevel);
      
      // Show starting toast
      showTestToast({
        level: `Grade ${gradeLevel}`,
        step: 'starting',
        message: 'Starting expert level test'
      });
      
      try {
        DebugLogger.log('story', `Testing ${gradeLevel} grade story generation...`);
        
        const response = await NetflixStyleStoryService.generateStory(testUser);
        
        const pageCount = response.content?.length || 0;
        const fullText = response.content?.join(' ') || '';
        const tokenCount = response.content ? estimateTokenCount(fullText) : 0;
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
        const characterCount = countCharacters(response.content || []);
        const characterAnalysis = analyzeCharacters(
          response.content || [], 
          wordCount, 
          pageCount
        );
        const pagesInRange = pageCount >= 8 && pageCount <= 12;
        
        const result: ValidationTestResult = {
          gradeLevel,
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

        // Show result toast
        if (result.success) {
          showTestToast({
            level: `Grade ${gradeLevel}`,
            step: 'final_result',
            source: result.source as any,
            message: `${pageCount} pages, ${wordCount} words`
          });
        } else {
          showTestToast({
            level: `Grade ${gradeLevel}`,
            step: 'error',
            message: result.error || 'Generation failed'
          });
        }

        testResults.push(result);
        DebugLogger.log('story', `${gradeLevel} grade: ${pageCount} pages (${pagesInRange ? 'PASS' : 'FAIL'})`);
        
      } catch (error) {
        ProductionLogging.error('VALIDATION', `Error testing ${gradeLevel}`, 'ValidationTestRunner', { gradeLevel, error });
        
        showTestToast({
          level: `Grade ${gradeLevel}`,
          step: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        
        testResults.push({
          gradeLevel,
          success: false,
          pageCount: 0,
          tokenCount: 0,
          wordCount: 0,
          characterCount: 0,
          source: 'error',
          pagesInRange: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setProgress(((i + 1) / expertGrades.length) * 100);
      setResults([...testResults]);
    }

    const totalTime = Date.now() - startTime;
    const successfulTests = testResults.filter(r => r.success).length;
    
    // Show summary toast
    showTestSummaryToast(successfulTests, expertGrades.length, totalTime);
    
    setIsRunning(false);
    DebugLogger.log('story', 'Validation test complete!');
  };

  const overallSuccess = results.length > 0 && results.every(r => r.success && r.pagesInRange);
  const averagePages = results.length > 0 ? results.reduce((sum, r) => sum + r.pageCount, 0) / results.length : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Expert Level Validation Test (8-12 Pages)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests expert levels (Grade 6-10) to verify 8-12 page generation with shared validation architecture
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runValidationTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {isRunning ? 'Testing...' : 'Run Expert Level Test'}
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
            <p className="text-sm text-muted-foreground">Testing expert levels...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Results:</h3>
            {results.map((result) => (
              <div key={result.gradeLevel} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.success && result.pagesInRange ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Grade {result.gradeLevel}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.error || `${result.pageCount} pages • ${result.wordCount} words • ${result.characterCount} chars • ${result.source}`}
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
              <li>Average Pages: {averagePages.toFixed(1)} (Target: 8-12)</li>
              <li>Average Words: {Math.round(results.reduce((sum, r) => sum + (r.wordCount || 0), 0) / results.length)}</li>
              <li>Average Characters: {Math.round(results.reduce((sum, r) => sum + (r.characterCount || 0), 0) / results.length)}</li>
              <li>AI Generation: {results.filter(r => r.source === 'ai').length}/{results.length}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}