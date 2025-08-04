// Manual Difficulty Test Component
// Allows real-time testing of difficulty level fixes

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from '@/constants/difficultyAppropriateTemplates';
import { validateLevel1Sentence } from '@/constants/level1Vocabulary';
import { DifficultyLevel } from '@/types';

interface TestResult {
  difficulty: DifficultyLevel;
  content: string;
  wordCount: number;
  expectedRange: { min: number; max: number };
  isValid: boolean;
  level1Valid?: boolean;
  charCount: number;
}

export const DifficultyTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDifficultyTest = async () => {
    setIsLoading(true);
    console.log('🧪 Running manual difficulty test...');
    
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    const results: TestResult[] = [];
    
    for (const difficulty of difficulties) {
      const template = getDifficultyAppropriateTemplate(difficulty);
      
      // Process template with sample data
      const content = template[0]
        .replace(/{name}/g, 'Alex')
        .replace(/{animal}/g, 'cat')
        .replace(/{color}/g, 'blue')
        .replace(/{food}/g, 'pizza')
        .replace(/{object}/g, 'treasure')
        .replace(/{setting}/g, 'forest')
        .replace(/{pronoun}/g, 'they');
      
      const wordCount = content.split(/\s+/).filter(w => w.trim()).length;
      const validation = validateDifficultyCompliance(content, difficulty);
      
      let level1Valid: boolean | undefined;
      if (difficulty === 'easy') {
        const level1Check = validateLevel1Sentence(content);
        level1Valid = level1Check.isValid;
      }
      
      results.push({
        difficulty,
        content,
        wordCount,
        expectedRange: validation.expectedRange,
        isValid: validation.isValid,
        level1Valid,
        charCount: content.length
      });
      
      console.log(`${difficulty}: ${wordCount} words - "${content}"`);
    }
    
    setTestResults(results);
    setIsLoading(false);
    
    const allValid = results.every(r => r.isValid);
    const easyLevel1Valid = results.find(r => r.difficulty === 'easy')?.level1Valid;
    
    console.log(`✅ All difficulties valid: ${allValid}`);
    console.log(`✅ Easy uses Level 1 vocabulary: ${easyLevel1Valid}`);
  };

  const getBadgeVariant = (isValid: boolean) => isValid ? 'default' : 'destructive';
  const getStatusIcon = (isValid: boolean) => isValid ? '✅' : '❌';

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Difficulty Level Test
          <Button 
            onClick={runDifficultyTest} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Testing...' : 'Run Test'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testResults.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Click "Run Test" to validate difficulty levels
          </p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result) => (
              <div key={result.difficulty} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{result.difficulty}</h3>
                    <Badge variant={getBadgeVariant(result.isValid)}>
                      {getStatusIcon(result.isValid)} Word Count
                    </Badge>
                    {result.level1Valid !== undefined && (
                      <Badge variant={getBadgeVariant(result.level1Valid)}>
                        {getStatusIcon(result.level1Valid)} Level 1 Vocab
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.wordCount} words ({result.expectedRange.min}-{result.expectedRange.max} expected)
                    • {result.charCount} chars
                  </div>
                </div>
                <p className="text-sm bg-muted p-3 rounded">
                  "{result.content}"
                </p>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Test Summary:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Easy:</strong> 3-6 words<br />
                  <span className="text-muted-foreground">Level 1 vocabulary only</span>
                </div>
                <div>
                  <strong>Medium:</strong> 6-12 words<br />
                  <span className="text-muted-foreground">Age-appropriate vocab</span>
                </div>
                <div>
                  <strong>Hard:</strong> 10-18 words<br />
                  <span className="text-muted-foreground">Complete thoughts</span>
                </div>
                <div>
                  <strong>Expert:</strong> 15-25 words<br />
                  <span className="text-muted-foreground">Complex thoughts</span>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <strong>Mobile Optimization:</strong> Easy, Medium, and Hard should not require scrolling. Expert may require minimal scrolling.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};