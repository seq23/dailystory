import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Book, Layers, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TemplateInfo {
  level: string;
  templateCount: number;
  templates: Array<{
    title: string;
    theme: string;
    scenes: number;
    endings: number;
  }>;
}

const LEVEL_MAPPINGS = [
  { value: 'beginner', label: 'Beginner', systemLevel: 'Level0' },
  { value: 'easy', label: 'Easy', systemLevel: 'Level1' },
  { value: 'medium', label: 'Medium', systemLevel: 'Level2' },
  { value: 'hard', label: 'Hard', systemLevel: 'Level3' },
  { value: 'expert', label: 'Expert', systemLevel: 'Level4' },
  { value: 'grade6', label: 'Grade 6', systemLevel: 'Grade6' },
  { value: 'grade7', label: 'Grade 7', systemLevel: 'Grade7' },
  { value: 'grade8', label: 'Grade 8', systemLevel: 'Grade8' },
  { value: 'grade9', label: 'Grade 9', systemLevel: 'Grade9' },
  { value: 'grade10', label: 'Grade 10', systemLevel: 'Grade10' },
];

export function TemplateExplorer() {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [templateInfo, setTemplateInfo] = useState<TemplateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const exploreTemplates = async (level: string) => {
    if (!level) return;

    setIsLoading(true);
    setError('');
    setTemplateInfo(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: level, // Send difficulty as top-level parameter
          userInfo: {
            name: 'Explorer',
            age: 8,
            grade: '3rd',
            nativeLanguage: 'en',
            learningGoal: 'improve-english-reading',
            avatar: { type: 'boy', skinTone: 'medium' },
            favoriteColor: 'blue',
            favoriteAnimal: 'dragon',
            hobbies: 'exploration',
            favoriteFood: 'pizza',
            specialRequest: 'exploration mode',
            difficultyLevel: level, // Keep as backup
          },
          explore: true, // Special flag for exploration mode
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to explore templates');
      }

      setTemplateInfo(data);
    } catch (err) {
      console.error('Template exploration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to explore templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLevel) {
      exploreTemplates(selectedLevel);
    }
  }, [selectedLevel]);

  const selectedMapping = LEVEL_MAPPINGS.find(m => m.value === selectedLevel);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Template Explorer</CardTitle>
          <CardDescription>
            Browse and explore available templates by difficulty level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level to explore" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Standard Levels</div>
                    {LEVEL_MAPPINGS.slice(0, 5).map((mapping) => (
                      <SelectItem key={mapping.value} value={mapping.value}>
                        <div className="flex flex-col">
                          <span>{mapping.label}</span>
                          <span className="text-xs text-muted-foreground">{mapping.systemLevel}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Grade Levels</div>
                    {LEVEL_MAPPINGS.slice(5).map((mapping) => (
                      <SelectItem key={mapping.value} value={mapping.value}>
                        <div className="flex flex-col">
                          <span>{mapping.label}</span>
                          <span className="text-xs text-muted-foreground">{mapping.systemLevel}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {selectedLevel && (
              <Button onClick={() => exploreTemplates(selectedLevel)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exploring...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            )}
          </div>

          {selectedMapping && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedMapping.label}</Badge>
              <Badge variant="secondary">{selectedMapping.systemLevel}</Badge>
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

      {templateInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Template Library Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{templateInfo.templateCount}</div>
                <div className="text-sm text-muted-foreground">Available Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{templateInfo.level}</div>
                <div className="text-sm text-muted-foreground">System Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {templateInfo.templates?.reduce((sum, t) => sum + t.scenes, 0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {templateInfo.level === 'level0' ? 'Total Pages (6 per template)' : 'Total Scenes'}
                </div>
              </div>
            </div>

            {templateInfo.templates && templateInfo.templates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Template Details
                </h4>
                {templateInfo.templates.map((template, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium">{template.title}</h5>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Palette className="h-3 w-3" />
                          {template.theme}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {template.scenes} {templateInfo.level === 'level0' ? 'pages' : 'scenes'}
                        </Badge>
                        <Badge variant="outline">{template.endings} endings</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}