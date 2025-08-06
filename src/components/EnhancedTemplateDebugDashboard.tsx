// Enhanced Template Debug Dashboard with Author Voice Status
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateDebugger } from '@/services/templateDebugger';
import { DifficultyManager } from '@/services/difficultyManager';
import { AuthorVoiceIndicator } from '@/components/AuthorVoiceIndicator';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export const EnhancedTemplateDebugDashboard: React.FC = () => {
  const [stats, setStats] = useState(TemplateDebugger.getUsageStats());
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    setStats(TemplateDebugger.getUsageStats());
  };

  const clearAndRefresh = () => {
    TemplateDebugger.clearLog();
    refreshStats();
  };

  const printToConsole = () => {
    TemplateDebugger.printDebugStats();
  };

  const runAuthorVoiceTest = () => {
    console.log('🎭 Running Author Voice Test...');
    
    const testUsers = [
      { name: 'Child4', age: 4, gradeLevel: 'Pre-K' },
      { name: 'Student7', age: 7, gradeLevel: '2nd' },
      { name: 'Reader9', age: 9, gradeLevel: '4th' }
    ];
    
    testUsers.forEach(user => {
      const result = DifficultyManager.getFinalDifficulty(user);
      console.log(`👤 ${user.name} (age ${user.age}):`, {
        difficulty: result.difficulty,
        authorVoice: DifficultyManager.hasAuthorVoice(result.difficulty),
        reasoning: result.profile.reasoning[0]
      });
    });
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate author voice statistics
  const authorVoiceStats = React.useMemo(() => {
    let withAuthorVoice = 0;
    let withoutAuthorVoice = 0;
    
    stats.recentTemplates.forEach(entry => {
      if (DifficultyManager.hasAuthorVoice(entry.difficulty)) {
        withAuthorVoice++;
      } else {
        withoutAuthorVoice++;
      }
    });
    
    return { withAuthorVoice, withoutAuthorVoice };
  }, [stats]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
      >
        🔍 Enhanced Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Enhanced Template Debug</CardTitle>
            <div className="flex gap-1">
              <Button onClick={runAuthorVoiceTest} variant="outline" size="sm">
                🎭 Test
              </Button>
              <Button onClick={printToConsole} variant="outline" size="sm">
                📋 Console
              </Button>
              <Button onClick={clearAndRefresh} variant="outline" size="sm">
                🧹 Clear
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-3">
          {/* Author Voice Status */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded border border-purple-200">
            <div className="font-medium text-purple-800 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Author Voice Status
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>With Voice:</span>
                <Badge variant={authorVoiceStats.withAuthorVoice > 0 ? "default" : "outline"}>
                  {authorVoiceStats.withAuthorVoice}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>No Voice:</span>
                <Badge variant={authorVoiceStats.withoutAuthorVoice > 0 ? "destructive" : "outline"}>
                  {authorVoiceStats.withoutAuthorVoice}
                </Badge>
              </div>
            </div>
          </div>

          {/* Template Repetition Alert */}
          {stats.repetitionDetected && (
            <div className="bg-destructive/10 p-2 rounded text-destructive font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Template repetition detected!
            </div>
          )}

          {/* Overall Health */}
          <div className="flex justify-between items-center">
            <span>System Health:</span>
            <div className="flex items-center gap-1">
              {stats.repetitionDetected ? (
                <AlertTriangle className="w-3 h-3 text-destructive" />
              ) : (
                <CheckCircle className="w-3 h-3 text-green-600" />
              )}
              <Badge variant={stats.repetitionDetected ? "destructive" : "default"}>
                {stats.repetitionDetected ? "Issues" : "Healthy"}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between">
            <span>Total Templates Used:</span>
            <Badge variant={stats.totalUsages > 15 ? "destructive" : "secondary"}>
              {stats.totalUsages}
            </Badge>
          </div>

          {/* Manager Usage */}
          <div>
            <div className="font-medium mb-1">Manager Usage:</div>
            {Object.entries(stats.managerBreakdown).map(([manager, count]) => (
              <div key={manager} className="flex justify-between text-xs">
                <span className="truncate">{manager.replace('TemplateManager', '').replace('StoryProcessor', '')}</span>
                <Badge variant="outline" className="ml-1">{count}</Badge>
              </div>
            ))}
          </div>

          {/* Difficulty Breakdown */}
          <div>
            <div className="font-medium mb-1">Difficulty Usage:</div>
            {Object.entries(stats.difficultyBreakdown).map(([difficulty, count]) => (
              count > 0 && (
                <div key={difficulty} className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <span>{difficulty}</span>
                    <AuthorVoiceIndicator 
                      difficulty={difficulty as any} 
                      className="text-xs px-1 py-0" 
                    />
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              )
            ))}
          </div>

          {/* Recent Templates with Author Voice Info */}
          <div>
            <div className="font-medium mb-1">Recent Templates:</div>
            <div className="space-y-1 max-h-40 overflow-auto">
              {stats.recentTemplates.slice(0, 6).map((entry, index) => (
                <div key={entry.timestamp} className="text-xs p-2 bg-muted rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono">{index + 1}.</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.difficulty}
                      </Badge>
                      {DifficultyManager.hasAuthorVoice(entry.difficulty) ? (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <Sparkles className="w-2 h-2 mr-1" />
                          Voice
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Simple
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="truncate text-muted-foreground">
                    {entry.templatePreview}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {entry.manager.replace('TemplateManager', '').replace('StoryProcessor', '')} | {entry.phase}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};