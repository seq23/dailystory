import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateDebugger } from '@/services/templateDebugger';

export const TemplateDebugDashboard: React.FC = () => {
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

  useEffect(() => {
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
      >
        🔍 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Template Debug</CardTitle>
            <div className="flex gap-1">
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
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between">
            <span>Total Usages:</span>
            <Badge variant={stats.totalUsages > 10 ? "destructive" : "secondary"}>
              {stats.totalUsages}
            </Badge>
          </div>
          
          {stats.repetitionDetected && (
            <div className="bg-destructive/10 p-2 rounded text-destructive font-medium">
              ⚠️ Template repetition detected in recent usage!
            </div>
          )}

          <div>
            <div className="font-medium mb-1">Manager Usage:</div>
            {Object.entries(stats.managerBreakdown).map(([manager, count]) => (
              <div key={manager} className="flex justify-between text-xs">
                <span className="truncate">{manager.replace('TemplateManager', '')}</span>
                <Badge variant="outline" className="ml-1">{count}</Badge>
              </div>
            ))}
          </div>

          <div>
            <div className="font-medium mb-1">Difficulty Usage:</div>
            {Object.entries(stats.difficultyBreakdown).map(([difficulty, count]) => (
              count > 0 && (
                <div key={difficulty} className="flex justify-between text-xs">
                  <span>{difficulty}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              )
            ))}
          </div>

          <div>
            <div className="font-medium mb-1">Recent Templates:</div>
            <div className="space-y-1 max-h-32 overflow-auto">
              {stats.recentTemplates.slice(0, 5).map((entry, index) => (
                <div key={entry.timestamp} className="text-xs p-1 bg-muted rounded">
                  <div className="flex justify-between">
                    <span className="font-mono">{index + 1}.</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.difficulty}
                    </Badge>
                  </div>
                  <div className="truncate text-muted-foreground">
                    {entry.templatePreview}
                  </div>
                  <div className="text-muted-foreground">
                    {entry.manager.replace('TemplateManager', '')} | {entry.phase}
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