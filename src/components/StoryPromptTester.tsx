import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { LiveGenerationService } from '@/services/LiveGenerationService';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel, Grade, LanguageCode, LearningGoal } from '@/types';
import { validateTokenLimit } from '@/utils/tokenLimitValidator';

interface TestResult {
  level: string;
  success: boolean;
  pages: number;
  wordCount: number;
  hasPageConcatenation: boolean;
  content: string;
  error?: string;
  tokenValidation: any;
}

const testUserProfiles: Record<string, UserInfo> = {
  beginner: {
    name: "Emma",
    age: 4,
    grade: "PreK" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "light" },
    favoriteColor: "pink",
    favoriteAnimal: "puppy",
    hobbies: "playing with toys",
    favoriteFood: "cookies",
    specialRequest: "stories about rainbows",
    difficultyLevel: "beginner" as DifficultyLevel
  },
  easy: {
    name: "Alex",
    age: 6,
    grade: "K" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "medium" },
    favoriteColor: "blue",
    favoriteAnimal: "dog",
    hobbies: "soccer",
    favoriteFood: "ice cream",
    specialRequest: "sports adventures",
    difficultyLevel: "easy" as DifficultyLevel
  },
  medium: {
    name: "Jordan",
    age: 8,
    grade: "2nd" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "dark" },
    favoriteColor: "green",
    favoriteAnimal: "dinosaur",
    hobbies: "reading about space",
    favoriteFood: "pizza",
    specialRequest: "dinosaur adventures",
    difficultyLevel: "medium" as DifficultyLevel
  },
  hard: {
    name: "Casey",
    age: 10,
    grade: "4th" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "pale" },
    favoriteColor: "purple",
    favoriteAnimal: "robot",
    hobbies: "science experiments",
    favoriteFood: "sushi",
    specialRequest: "science fiction",
    difficultyLevel: "hard" as DifficultyLevel
  },
  expert: {
    name: "Riley",
    age: 12,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "olive" },
    favoriteColor: "red",
    favoriteAnimal: "wolf",
    hobbies: "mystery novels",
    favoriteFood: "pasta",
    specialRequest: "adventure mysteries",
    difficultyLevel: "expert" as DifficultyLevel
  },
  "6th": {
    name: "Taylor",
    age: 11,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "light" },
    favoriteColor: "gold",
    favoriteAnimal: "eagle",
    hobbies: "mythology",
    favoriteFood: "burgers",
    specialRequest: "mythological adventures",
    difficultyLevel: "expert" as DifficultyLevel,
    expertGradeLevel: "6th" as ExpertGradeLevel
  },
  "7th": {
    name: "Morgan",
    age: 12,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "medium" },
    favoriteColor: "silver",
    favoriteAnimal: "dolphin",
    hobbies: "technology",
    favoriteFood: "tacos",
    specialRequest: "futuristic stories",
    difficultyLevel: "expert" as DifficultyLevel,
    expertGradeLevel: "7th" as ExpertGradeLevel
  },
  "8th": {
    name: "Avery",
    age: 13,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "dark" },
    favoriteColor: "black",
    favoriteAnimal: "raven",
    hobbies: "psychology",
    favoriteFood: "steak",
    specialRequest: "psychological mysteries",
    difficultyLevel: "expert" as DifficultyLevel,
    expertGradeLevel: "8th" as ExpertGradeLevel
  },
  "9th": {
    name: "Quinn",
    age: 14,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "pale" },
    favoriteColor: "white",
    favoriteAnimal: "owl",
    hobbies: "philosophy",
    favoriteFood: "salmon",
    specialRequest: "philosophical tales",
    difficultyLevel: "expert" as DifficultyLevel,
    expertGradeLevel: "9th" as ExpertGradeLevel
  },
  "10th": {
    name: "Sage",
    age: 15,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "olive" },
    favoriteColor: "navy",
    favoriteAnimal: "phoenix",
    hobbies: "literature",
    favoriteFood: "lobster",
    specialRequest: "complex narratives",
    difficultyLevel: "expert" as DifficultyLevel,
    expertGradeLevel: "10th" as ExpertGradeLevel
  }
};

export function StoryPromptTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);

  const checkPageConcatenation = (pages: string[], level: string): boolean => {
    // Level 0 (beginner) should have exactly 1 sentence per page, max 8 words
    if (level === 'beginner') {
      for (const page of pages) {
        const sentences = page.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const wordCount = page.split(/\s+/).filter(w => w.trim()).length;
        
        // Level 0 concatenation: more than 1 sentence OR more than 8 words
        if (sentences.length > 1 || wordCount > 8) {
          console.log(`🔍 Level 0 concatenation detected:`, { 
            page: page.substring(0, 50), 
            sentences: sentences.length, 
            words: wordCount 
          });
          return true;
        }
      }
      return false;
    }
    
    // Other levels: check if any page contains multiple sentences that should be separate pages
    for (const page of pages) {
      const sentences = page.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 2) { // Allow for one main sentence plus short continuation
        return true;
      }
    }
    return false;
  };

  const analyzeStoryContent = (content: string, level: string): { 
    pages: number; 
    wordCount: number; 
    hasPageConcatenation: boolean; 
  } => {
    // Handle both array of pages and string content
    let pages: string[] = [];
    if (Array.isArray(content)) {
      pages = content.filter(p => p && p.trim());
    } else if (typeof content === 'string') {
      // Try to split by Page markers first, then by paragraphs
      pages = content.split(/(?:^|\n)(?:Page \d+:?\s*)/i).filter(p => p.trim());
      if (pages.length <= 1) {
        pages = content.split(/\n\n+/).filter(p => p.trim());
      }
    }
    
    const wordCount = pages.join(' ').split(/\s+/).filter(word => word.trim().length > 0).length;
    const hasPageConcatenation = checkPageConcatenation(pages, level);

    console.log(`🔍 Story analysis for ${level}:`, { 
      pagesCount: pages.length, 
      wordCount, 
      hasPageConcatenation,
      firstPage: pages[0]?.substring(0, 50) 
    });

    return { pages: pages.length, wordCount, hasPageConcatenation };
  };

  const testStoryGeneration = async (level: string, userInfo: UserInfo): Promise<TestResult> => {
    try {
      console.log(`Testing ${level} level story generation...`);
      
      // Test Netflix-style (free) generation
      const result = await NetflixStyleStoryService.generateCompleteStory(userInfo);
      
      if (!result.content || result.content.length === 0) {
        throw new Error('Story generation failed or returned empty content');
      }

      const fullContent = result.content.join('\n\n');
      const analysis = analyzeStoryContent(fullContent, level);
      const tokenValidation = validateTokenLimit(fullContent, userInfo.difficultyLevel || 'beginner');

      return {
        level,
        success: true,
        pages: analysis.pages,
        wordCount: analysis.wordCount,
        hasPageConcatenation: analysis.hasPageConcatenation,
        content: fullContent.substring(0, 500) + '...', // Truncate for display
        tokenValidation
      };
    } catch (error) {
      console.error(`Error testing ${level}:`, error);
      return {
        level,
        success: false,
        pages: 0,
        wordCount: 0,
        hasPageConcatenation: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenValidation: null
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    const testLevels = Object.keys(testUserProfiles);
    const results: TestResult[] = [];

    for (let i = 0; i < testLevels.length; i++) {
      const level = testLevels[i];
      setCurrentTest(level);
      
      const userInfo = testUserProfiles[level];
      const result = await testStoryGeneration(level, userInfo);
      results.push(result);
      
      setProgress(((i + 1) / testLevels.length) * 100);
      setTestResults([...results]);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setCurrentTest('');
  };

  const getStatusColor = (result: TestResult) => {
    if (!result.success) return 'destructive';
    if (result.level === 'beginner' && result.hasPageConcatenation) return 'destructive';
    if (result.tokenValidation && !result.tokenValidation.isValid) return 'secondary';
    return 'default';
  };

  const getStatusText = (result: TestResult) => {
    if (!result.success) return 'FAILED';
    if (result.level === 'beginner' && result.hasPageConcatenation) return 'CONCATENATION DETECTED';
    if (result.tokenValidation && !result.tokenValidation.isValid) return 'TOKEN LIMIT EXCEEDED';
    return 'PASSED';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Story Prompt Testing Dashboard</h2>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="min-w-32"
        >
          {isRunning ? 'Testing...' : 'Run All Tests'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testResults.map((result) => (
          <Card key={result.level}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{result.level} Level</CardTitle>
                <Badge variant={getStatusColor(result)}>
                  {getStatusText(result)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pages</label>
                  <p className="text-lg font-semibold">{result.pages}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Word Count</label>
                  <p className="text-lg font-semibold">{result.wordCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Concatenation</label>
                  <p className="text-lg font-semibold">
                    {result.hasPageConcatenation ? '❌ Yes' : '✅ No'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Token Valid</label>
                  <p className="text-lg font-semibold">
                    {result.tokenValidation?.isValid ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              {result.error && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-destructive">Error</label>
                  <p className="text-sm text-destructive">{result.error}</p>
                </div>
              )}

              {result.content && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Content Preview</label>
                  <Textarea 
                    value={result.content} 
                    readOnly 
                    className="mt-1 min-h-24"
                  />
                </div>
              )}

              {result.tokenValidation && !result.tokenValidation.isValid && (
                <div className="mt-2 text-sm text-secondary-foreground">
                  Token limit: {result.tokenValidation.actualTokens}/{result.tokenValidation.maxTokens}
                  {result.tokenValidation.warning && (
                    <span className="text-secondary"> - {result.tokenValidation.warning}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}