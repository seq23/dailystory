import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import { StoryResultDisplay } from './StoryResultDisplay';
import { validatePageTokenDistribution, getTokenLimitForDifficulty } from '@/utils/tokenLimitValidator';
import type { DifficultyLevel } from '@/types';

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Level 0 - 199+ templates' },
  { value: 'easy', label: 'Easy', description: 'Level 1 - 5+ templates' },
  { value: 'medium', label: 'Medium', description: 'Level 2 - 5+ templates' },
  { value: 'hard', label: 'Hard', description: 'Level 3 - 5+ templates' },
  { value: 'expert', label: 'Expert', description: 'Level 4 - 5+ templates' },
];

const GRADE_OPTIONS = [
  { value: 'grade6', label: 'Grade 6', description: 'Grade 6 - 3+ templates' },
  { value: 'grade7', label: 'Grade 7', description: 'Grade 7 - 3+ templates' },
  { value: 'grade8', label: 'Grade 8', description: 'Grade 8 - 3+ templates' },
  { value: 'grade9', label: 'Grade 9', description: 'Grade 9 - 3+ templates' },
  { value: 'grade10', label: 'Grade 10', description: 'Grade 10 - 3+ templates' },
];

export function QuickTemplateTest() {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [testingMode, setTestingMode] = useState<'testing' | 'real-user'>('testing');
  const { generateStory, isLoading, result, error } = useTemplateService();

  const handleTest = async () => {
    if (!selectedLevel) return;

    const testUserInfo = {
      name: 'Alex',
      age: 8,
      grade: '3rd' as const,
      nativeLanguage: 'en' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'boy' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'dragon',
      hobbies: 'playing games',
      favoriteFood: 'pizza',
      specialRequest: 'adventure with magic',
      difficultyLevel: selectedLevel as DifficultyLevel,
    };

    await generateStory(testUserInfo, testingMode);
  };

  const allOptions = [...DIFFICULTY_OPTIONS, ...GRADE_OPTIONS];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Quick Template Test</CardTitle>
          <CardDescription>
            Select a difficulty level and instantly test template generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Standard Levels</div>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Grade Levels</div>
                    {GRADE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleTest} 
              disabled={!selectedLevel || isLoading}
              className="min-w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Template'
              )}
            </Button>
          </div>

          {/* Phase 7: Mode Selection */}
          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
            <Switch
              id="testing-mode"
              checked={testingMode === 'real-user'}
              onCheckedChange={(checked) => setTestingMode(checked ? 'real-user' : 'testing')}
            />
            <div className="flex-1">
              <Label htmlFor="testing-mode" className="text-sm font-medium">
                {testingMode === 'testing' ? 'Testing Mode' : 'Real User Mode'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {testingMode === 'testing' 
                  ? 'Generate complete stories with dynamic page counts for validation' 
                  : 'Generate single pages for never-ending story simulation'}
              </p>
            </div>
            <Badge variant={testingMode === 'testing' ? 'default' : 'secondary'}>
              {testingMode === 'testing' ? 'Complete Story' : 'Single Page'}
            </Badge>
          </div>

          {selectedLevel && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {allOptions.find(opt => opt.value === selectedLevel)?.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {allOptions.find(opt => opt.value === selectedLevel)?.description}
              </span>
              {testingMode === 'testing' && selectedLevel && (
                <>
                  <Badge variant="secondary">
                    Target: {getTokenLimitForDifficulty(selectedLevel as DifficultyLevel)} tokens
                  </Badge>
                  <Badge variant="outline">
                    {selectedLevel !== 'beginner' ? 'Template density' : 'AI-matched density'}
                  </Badge>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <StoryResultDisplay result={result} />
          
          {/* Phase 7: Enhanced Validation Results */}
          {result.pages && selectedLevel && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const validationResult = validatePageTokenDistribution(
                    result.pages, 
                    selectedLevel as DifficultyLevel, 
                    result.metadata?.targetWordDensity === 'Template-optimized' ? 'template' : 'ai'
                  );
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                          {validationResult.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                        <span className="text-sm">
                          {validationResult.actualTokens} / {validationResult.maxAllowed} tokens
                          {validationResult.templateMode && ' (Template mode)'}
                        </span>
                      </div>
                      
                      {validationResult.warnings.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Warnings:</p>
                          {validationResult.warnings.map((warning, index) => (
                            <p key={index} className="text-sm text-muted-foreground">• {warning}</p>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Mode:</span>
                          <span className="ml-2 font-medium">{testingMode}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scene cycling:</span>
                          <span className="ml-2 font-medium">
                            {result.pages.length > 5 ? 'Active' : 'Not needed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}