import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import { StoryResultDisplay } from './StoryResultDisplay';
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

    await generateStory(testUserInfo);
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

          {selectedLevel && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {allOptions.find(opt => opt.value === selectedLevel)?.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {allOptions.find(opt => opt.value === selectedLevel)?.description}
              </span>
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

      {result && <StoryResultDisplay result={result} />}
    </div>
  );
}