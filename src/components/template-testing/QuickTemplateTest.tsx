import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import { useTemplateCounts } from '@/hooks/useTemplateCounts';
import { StoryResultDisplay } from './StoryResultDisplay';
import { UnifiedValidator } from '@/utils/unifiedValidator';
import type { DifficultyLevel } from '@/types';

export function QuickTemplateTest() {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [testingMode, setTestingMode] = useState<'testing' | 'real-user'>('testing');
  const { generateStory, isLoading, result, error, retryCount, isMaxRetriesReached, resetRetryState } = useTemplateService();
  const { counts, loading: countsLoading } = useTemplateCounts();

  // Generate dynamic options based on template counts
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: `Level 0 - ${counts.beginner || 100} templates (600 pages total, 6 pages per template)` },
    { value: 'easy', label: 'Easy', description: `Level 1 - ${counts.easy || 5} templates` },
    { value: 'medium', label: 'Medium', description: `Level 2 - ${counts.medium || 5} templates` },
    { value: 'hard', label: 'Hard', description: `Level 3 - ${counts.hard || 5} templates` },
    { value: 'expert', label: 'Expert', description: `Level 4 - ${counts.expert || 5} templates` },
  ];

  const gradeOptions = [
    { value: 'grade6', label: 'Grade 6', description: `Grade 6 - ${counts.grade6 || 3} templates` },
    { value: 'grade7', label: 'Grade 7', description: `Grade 7 - ${counts.grade7 || 3} templates` },
    { value: 'grade8', label: 'Grade 8', description: `Grade 8 - ${counts.grade8 || 3} templates` },
    { value: 'grade9', label: 'Grade 9', description: `Grade 9 - ${counts.grade9 || 3} templates` },
    { value: 'grade10', label: 'Grade 10', description: `Grade 10 - ${counts.grade10 || 3} templates` },
  ];

  const allOptions = [...difficultyOptions, ...gradeOptions];

  const handleTest = async () => {
    if (!selectedLevel) return;

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
      difficultyLevel: selectedLevel as DifficultyLevel,
    };

    try {
      await generateStory(testUserInfo, testingMode);
    } catch (err) {
      // Error handling is now managed by the hook
    }
  };

  const handleRetry = () => {
    resetRetryState();
    handleTest();
  };

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
                    {difficultyOptions.map((option) => (
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
                    {gradeOptions.map((option) => (
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
                  ? 'Shows complete template content (main text + alternatives + endings) with organized console output for validation' 
                  : 'Shows exactly what users see - uses main scene text with proper token limits and page flow'}
              </p>
            </div>
            <Badge variant={testingMode === 'testing' ? 'default' : 'secondary'}>
              {testingMode === 'testing' ? 'Full Validation' : 'User Experience'}
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
                     Target: {UnifiedValidator.getTokenLimits(UnifiedValidator.mapDifficultyToLevel(selectedLevel as DifficultyLevel)).guestStory} tokens
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
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                {isMaxRetriesReached ? 'Maximum Attempts Reached' : 'Template Generation Failed'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{error}</p>
            
            {!isMaxRetriesReached && retryCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Retry Attempt {retryCount}/3</p>
                  <p className="text-xs text-muted-foreground">
                    Templates can occasionally fail. Let's try again.
                  </p>
                </div>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {isMaxRetriesReached && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🎭</div>
                  <p className="text-sm font-medium">Story Magic Taking a Break</p>
                </div>
                
                {result && result.pages && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">Here's a special rhyming message while we fix things:</p>
                    <div className="bg-white/50 p-3 rounded-md space-y-1">
                      {result.pages.map((line, index) => (
                        <p key={index} className="text-sm italic text-muted-foreground leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Our story elves are fixing the magic! Try again in a few minutes for fresh stories.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again Later
                  </Button>
                  <Button 
                    onClick={() => window.open('mailto:support@example.com?subject=Template Service Issue', '_blank')} 
                    variant="secondary" 
                    size="sm"
                  >
                    Report Issue
                  </Button>
                </div>
              </div>
            )}
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
                   // Use UnifiedValidator for validation
                   const validationLevel = UnifiedValidator.mapDifficultyToLevel(selectedLevel as DifficultyLevel);
                   const validationResult = UnifiedValidator.validateContent(result.pages, {
                     mode: 'guest',
                     level: validationLevel
                   });

                   const hasUnresolvedPlaceholders = result.pages.some(page => page.includes('{') && page.includes('}'));
                   const placeholderValidation = { isValid: !hasUnresolvedPlaceholders };
                   const placeholderIssues = hasUnresolvedPlaceholders ? ['Unresolved placeholders found'] : [];
                  
                  return (
                    <div className="space-y-4">
                      {/* Token Validation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                            {validationResult.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                           <span className="text-sm">
                             {validationResult.metrics.tokenCount} / {UnifiedValidator.getTokenLimits(validationLevel).guestStory} tokens
                             {result.metadata?.targetWordDensity === 'Template-optimized' && ' (Template mode)'}
                           </span>
                        </div>
                        
                         {validationResult.reasons.length > 0 && (
                           <div className="space-y-1">
                             <p className="text-sm font-medium">Validation Reasons:</p>
                             {validationResult.reasons.map((reason, index) => (
                               <p key={index} className="text-sm text-muted-foreground">• {reason}</p>
                             ))}
                           </div>
                         )}
                      </div>

                      {/* Placeholder Validation */}
                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Placeholder Resolution</p>
                         <p className="text-sm text-muted-foreground">
                           {placeholderValidation.isValid ? '✅ Placeholders resolved' : '❌ Unresolved placeholders found'}
                         </p>
                        {placeholderIssues.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-destructive">Content Issues:</p>
                            {placeholderIssues.map((issue, index) => (
                              <p key={index} className="text-xs text-muted-foreground">• {issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      
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