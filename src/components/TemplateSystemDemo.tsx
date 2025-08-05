import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComprehensiveTemplateManager } from '@/services/comprehensiveTemplateManager';
import { getTemplateStats } from '@/constants/comprehensiveTemplates';
import type { DifficultyLevel, UserInfo } from '@/types';

/**
 * Demo component showing the new 100-template system integration
 * This demonstrates how all existing systems work with the new templates
 */
export const TemplateSystemDemo: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [templateResult, setTemplateResult] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const demoUserInfo: UserInfo = {
    name: 'Alex',
    age: 6,
    favoriteAnimal: 'cat',
    favoriteColor: 'blue',
    favoriteFood: 'pizza',
    readingLevel: 'beginner',
    nativeLanguage: 'en',
    storyLanguagePreference: 'en',
    grade: '1st',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'light' },
    hobbies: 'reading and games',
    specialRequest: ''
  };

  useEffect(() => {
    // Load analytics on component mount
    const stats = ComprehensiveTemplateManager.getAnalytics();
    setAnalytics(stats);
  }, []);

  const generateTemplate = async (isPremium: boolean = false) => {
    setIsGenerating(true);
    try {
      const result = await ComprehensiveTemplateManager.generateStory({
        userInfo: demoUserInfo,
        difficulty: selectedDifficulty,
        useCharacterPool: true,
        enhanceWithAI: isPremium,
        isPremium
      });
      setTemplateResult(result);
      
      // Update analytics
      const newAnalytics = ComprehensiveTemplateManager.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (error) {
      console.error('Template generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewTemplate = (templateIndex: number) => {
    const template = ComprehensiveTemplateManager.previewTemplate(selectedDifficulty, templateIndex);
    setTemplateResult({
      pages: template,
      templateIndex,
      difficulty: selectedDifficulty,
      isValid: true,
      metadata: {
        source: 'preview',
        processingTime: 0,
        systemsUsed: ['Preview']
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Comprehensive Template System Demo
            <Badge variant="secondary">500 Templates</Badge>
          </CardTitle>
          <CardDescription>
            Demonstration of the new 100-template system integrated with all existing systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as DifficultyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Level 0) - Ages 3-5</SelectItem>
                  <SelectItem value="easy">Easy (Level 1) - Ages 5-6</SelectItem>
                  <SelectItem value="medium">Medium (Level 2) - Ages 6-8</SelectItem>
                  <SelectItem value="hard">Hard (Level 3) - Ages 8-10</SelectItem>
                  <SelectItem value="expert">Expert (Level 4) - Ages 10+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => generateTemplate(false)} 
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? 'Generating...' : 'Generate Free Template'}
            </Button>
            <Button 
              onClick={() => generateTemplate(true)} 
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Premium Template'}
            </Button>
            <Button 
              onClick={() => previewTemplate(0)} 
              variant="secondary"
            >
              Preview Template #1
            </Button>
            <Button 
              onClick={() => previewTemplate(Math.floor(Math.random() * 100))} 
              variant="secondary"
            >
              Random Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>📊 System Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {analytics.templateStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Templates</div>
              </div>
              <div className="text-center p-4 bg-green-500/5 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.availability.uniqueSessionsPerLevel}
                </div>
                <div className="text-sm text-muted-foreground">Per Level</div>
              </div>
              <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.sessionStats?.templatesUsed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Used in Session</div>
              </div>
              <div className="text-center p-4 bg-purple-500/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.availability.antiRepetitionActive ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">Anti-Repetition</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">System Integration Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(analytics.systemIntegration).map(([system, active]) => (
                  <div key={system} className="flex items-center gap-2">
                    <span className={active ? 'text-green-600' : 'text-red-600'}>
                      {active ? '✓' : '✗'}
                    </span>
                    <span className="capitalize">{system.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {templateResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📖 Generated Story
              <Badge variant={templateResult.isValid ? 'default' : 'destructive'}>
                {templateResult.isValid ? 'Valid' : 'Invalid'}
              </Badge>
              <Badge variant="outline">
                Template #{templateResult.templateIndex}
              </Badge>
            </CardTitle>
            <CardDescription>
              {templateResult.pages.length} pages • {templateResult.difficulty} level
              {templateResult.metadata.processingTime && 
                ` • Generated in ${templateResult.metadata.processingTime.toFixed(2)}ms`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templateResult.pages.map((page: string, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <div className="text-xs text-muted-foreground mb-2">Page {index + 1}</div>
                <div className="text-foreground">{page}</div>
              </div>
            ))}
            
            {templateResult.metadata && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Generation Metadata</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Source:</strong> {templateResult.metadata.source}</div>
                  <div><strong>Systems Used:</strong> {templateResult.metadata.systemsUsed.join(', ')}</div>
                  {templateResult.validationDetails && (
                    <div><strong>Validation:</strong> {JSON.stringify(templateResult.validationDetails, null, 2)}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🔧 System Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={() => ComprehensiveTemplateManager.clearSession()}
            variant="outline"
            size="sm"
          >
            Clear Session (Reset Anti-Repetition)
          </Button>
          <p className="text-sm text-muted-foreground">
            This demo shows how the new 100-template system integrates seamlessly with all 33 existing systems while providing guaranteed quality and anti-repetition.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};